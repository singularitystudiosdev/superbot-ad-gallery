// An in-browser renderer: the variant on screen, at the ratio on screen, rendered in the page as an MP4. The page does not
// load it: the Export button (export.34c23b1d.js, the last control in the speed pill) only ever downloads the offline
// renders in assets/video/. Import it from the console or a headless check (it sets window.__EXPORT) to render a variant
// that has no offline render yet. Each ratio comes out at its platform size (OUT: 16:9 1920x1080, 9:16 1080x1920, 4:5 1080x1350, 1:1
// 1080x1080, 4:3 1440x1080), the stage drawn as vectors at that scale. The spot is a pure function of t
// (timeline.9b47fc30.js), so the export does not screen-record: it walks the clock a whole frame at a time and paints each
// frame itself, then encodes the lot. Every frame is therefore exact, at any speed, with nothing that the viewer's own
// frame timer can drop.
//
// How one frame is painted. #stage is live DOM plus bitmaps (<img>, the WebGL <canvas>es, CSS backgrounds and masks drawn
// from files, the odd <video>), and it is not a canvas, so it cannot be photographed in one call. Instead #stage is cloned
// into an SVG <foreignObject>, styled by the document's own stylesheets, written as a data: URL and drawn to a canvas. An
// SVG drawn as an image may fetch nothing, so everything the clone would fetch rides along inside it as a data: URL:
//   - each painted <img>, CSS background and CSS mask drawn from a file, its file read once and cached;
//   - each painted <canvas> and <video>, swapped for an <img> of its pixels now (the 3D viewer keeps its drawing buffer for
//     exactly this);
//   - each SVG data: URL used as a CSS mask, rasterized to a PNG first: the copy does not apply an SVG mask image.
// Because the bitmaps stay in the clone, they keep their stacking, their ancestors' clipping and their transforms: the end
// card covers the chat, the feed's clip trims a rising card, a settling image scales. The stylesheets go in as their authored
// text (fetched, @imports inlined), not as rule.cssText: Chromium re-serializes a font shorthand that uses var() beside
// another font longhand as a run of empty longhands, which the copy then drops to the default serif and the layout shifts.
// The clone has no <html>, so selectors rooted at html (the Ratio select's html[data-ar] rules) are rewritten to :root and
// <html>'s attributes are copied onto the SVG's root, where :root lands.
//
// Encoding. Each frame goes to a WebCodecs VideoEncoder carrying the timestamp it is owed (i / fps), and the chunks are
// muxed to MP4 by vendor/mp4-muxer.mjs. The timestamp is the whole design: an encoder writes the time it is given, so the
// file is exactly the spot's length no matter how long the painting took, at a true 30fps, and a spot renders in well
// under its own running time. A MediaRecorder would be simpler but unusable here: it stamps every frame by arrival, which
// would both tie the export to wall clock and leave the webm without a duration in its header. The file is silent: each
// variant's sound is its own engine (scores, songs, calls), none of it rendered here.
//
// Every variant at every ratio, wherever the browser has WebCodecs; window.__EXPORT.render() drives the same render from a
// headless check or the console.
import { variant } from './variant.9e82faf1.js?v=3';

const FPS = 30;
// H.264 High 4.0: the encoder profile every desktop and mobile browser decodes, and the one an editor or an ad platform
// will take without a transcode; 4.0 carries 1920x1080 at 30fps. VP9 in a MediaRecorder webm would be smaller to write but
// has no duration in its header, which makes the file unimportable in most editors; an MP4 muxed here carries its real
// length and frame rate.
const AVC = 'avc1.640028';
const BITRATE = 10_000_000;
const MUXER = new URL('./vendor/mp4-muxer.mjs', import.meta.url).href;
let muxerModule = null;
const loadMuxer = () => (muxerModule ||= import(MUXER));

// Nothing here may break the spot: a stylesheet, a bitmap or a frame that will not come back is reported and its area is
// left empty (and counted in `missing`), never thrown into the render loop.
const log = (msg, e) => console.error(new Error(`export: ${msg}`, e ? { cause: e } : undefined));

// ---------------------------------------------------------------------------------------------------------------
// the stylesheet the clone carries
// ---------------------------------------------------------------------------------------------------------------

const PAGE = () => location.href.split('#')[0];
// every url() turned absolute against the sheet it came from (the data: URL the clone is drawn from has no base of its own)
const absolute = (text, base) => text.replace(/url\((?!\s*["']?\s*data:)\s*["']?([^"')]+)["']?\s*\)/g, (m, u) => {
  try { return `url("${new URL(u, base).href}")`; } catch { return m; }
});
const fetchText = (href) => fetch(href).then((r) => { if (!r.ok) throw new Error(`${r.status} ${href}`); return r.text(); });

// a sheet's authored text with its @imports inlined in place (each under its own media query, if it has one)
async function expand(text, base) {
  const re = /@import\s+(?:url\()?\s*["']?([^"')\s]+)["']?\s*\)?\s*([^;]*);/g;
  const out = [];
  let last = 0, m;
  while ((m = re.exec(text))) {
    out.push(text.slice(last, m.index));
    const href = new URL(m[1], base).href;
    let inner = '';
    try { inner = await expand(await fetchText(href), href); } catch (e) { log(`an @import was not read, skipped: ${href}`, e); }
    out.push(m[2].trim() ? `@media ${m[2].trim()} {\n${inner}\n}` : inner);
    last = re.lastIndex;
  }
  out.push(text.slice(last));
  return absolute(out.join(''), base);
}

// every stylesheet of the document, in order, as authored. Read once per run: the spot's sheets are all in by the time the
// pill can be clicked (every beat loads its own when the chat mounts), and flattening them once per frame dominated a run
async function stylesheetText() {
  const parts = [];
  for (const sheet of document.styleSheets) {
    if (sheet.disabled) continue;
    const media = sheet.media && sheet.media.mediaText && sheet.media.mediaText !== 'all' ? sheet.media.mediaText : '';
    let text = '';
    try {
      text = sheet.href ? await expand(await fetchText(sheet.href), sheet.href) : await expand(sheet.ownerNode.textContent, document.baseURI);
    } catch (e) { log(`stylesheet not read, skipped: ${sheet.href || 'inline <style>'}`, e); continue; }
    parts.push(media ? `@media ${media} {\n${text}\n}` : text);
  }
  // html-rooted selectors land on the SVG's root instead (it carries <html>'s attributes); ".html" in a URL is left alone
  return parts.join('\n').replace(/(^|[\s,{}>+~(])html(?=[\s[.:#{,>+~)])/g, '$1:root');
}

// ---------------------------------------------------------------------------------------------------------------
// the bitmaps the clone carries
// ---------------------------------------------------------------------------------------------------------------

// a file as a data: URL, read once per address; null when it will not come back
const dataCache = new Map();
function dataUrl(src) {
  if (!dataCache.has(src)) {
    dataCache.set(src, fetch(src)
      .then((r) => { if (!r.ok) throw new Error(`${r.status} ${src}`); return r.blob(); })
      .then((b) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(b); }))
      .catch((e) => { log(`bitmap not loaded: ${src}`, e); return null; }));
  }
  return dataCache.get(src);
}

// an SVG data: URL as a PNG data: URL, drawn at 4x the box it masks (cached per URL and size)
const pngCache = new Map();
function svgToPng(src, w, h) {
  const key = `${src}|${Math.round(w)}x${Math.round(h)}`;
  if (!pngCache.has(key)) {
    pngCache.set(key, new Promise((res) => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.ceil(w * 4)); c.height = Math.max(1, Math.ceil(h * 4));
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        res(c.toDataURL('image/png'));
      };
      im.onerror = () => { log('an SVG mask did not rasterize'); res(src); };
      im.src = src;
    }));
  }
  return pngCache.get(key);
}

// the file URLs in a computed background or mask: never a data: URL, never a reference into this document (an SVG
// mask="url(#id)" computes to this page's own address plus the fragment, and fetching that would paint the page's HTML)
const files = (val) => [...(val || '').matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]).filter((u) => {
  if (u.startsWith('data:')) return false;
  try { const r = new URL(u, location.href); return !(r.hash && r.href.split('#')[0] === PAGE()); } catch { return false; }
});
const svgData = (val) => [...(val || '').matchAll(/url\("(data:image\/svg\+xml[^"]+)"\)/g)].map((m) => m[1]);
const IMAGE_PROPS = ['backgroundImage', 'maskImage', 'webkitMaskImage'];

// whether the browser would paint this node at all: every ancestor visible, and real area. Every variant's beat is mounted
// at once, so the stage also holds the other cuts' nodes, sized but hidden by an ancestor; only what shows is inlined
function painted(node) {
  for (let n = node; n && n.id !== 'stage'; n = n.parentElement) {
    const its = getComputedStyle(n);
    if (its.display === 'none' || its.visibility === 'hidden' || parseFloat(its.opacity) === 0) return false;
  }
  const r = node.getBoundingClientRect();
  return r.width >= 1 && r.height >= 1;
}

// a live <canvas> or <video> as an <img> of its pixels now, keeping the element's attributes and its laid-out size
function pixelsAsImg(live, k) {
  const r = live.getBoundingClientRect();
  const im = document.createElement('img');
  for (const a of live.attributes) if (a.name !== 'width' && a.name !== 'height' && a.name !== 'src') im.setAttribute(a.name, a.value);
  im.style.width = `${r.width / k}px`; im.style.height = `${r.height / k}px`;
  let c = live;
  if (live.tagName === 'VIDEO') {
    c = document.createElement('canvas');
    c.width = live.videoWidth || 1; c.height = live.videoHeight || 1;
    c.getContext('2d').drawImage(live, 0, 0, c.width, c.height);
  }
  im.setAttribute('src', c.toDataURL('image/png'));
  return im;
}

// a video the frame just seeked is decoded before its pixels are read (at most 1s)
const settled = (v) => (!v.seeking ? Promise.resolve() : new Promise((res) => {
  const done = () => { v.removeEventListener('seeked', done); res(); };
  v.addEventListener('seeked', done);
  setTimeout(done, 1000);
}));

// ---------------------------------------------------------------------------------------------------------------
// one frame -> one canvas
// ---------------------------------------------------------------------------------------------------------------

// a run's fixed parts: the stylesheet text and the nodes whose computed background or mask is drawn from a URL (the stage's
// tree is built once, at mount, so the list holds for the whole run)
async function prepare() {
  const stage = document.getElementById('stage');
  const css = await stylesheetText();
  const urlNodes = [...stage.querySelectorAll('*')].filter((n) => {
    if (n.tagName === 'IMG' || n.tagName === 'CANVAS' || n.tagName === 'VIDEO') return false;
    const cs = getComputedStyle(n);
    return IMAGE_PROPS.some((p) => files(cs[p]).length || (p !== 'backgroundImage' && svgData(cs[p]).length));
  });
  return { css, urlNodes };
}

// the frame at t, its W x H stage drawn onto an OW x OH canvas (the vectors are drawn at that scale, not stretched after)
async function frameCanvas(t, W, H, run, OW = W, OH = H) {
  const stage = document.getElementById('stage');
  const ad = window.__AD;
  if (!ad) return { canvas: null, missing: 0 };
  run ||= await prepare();
  ad.seek(t);
  await Promise.all([...stage.querySelectorAll('video')].map(settled));

  // k: the window fit scale fit() gives #stage, which every rect read off the live page carries
  const sr = stage.getBoundingClientRect();
  const k = sr.width ? sr.width / W : 1;
  const clone = stage.cloneNode(true);
  // the clone carries no live state: pair each cloned node with the live one by document order
  const live = [...stage.querySelectorAll('*')], copy = [...clone.querySelectorAll('*')];
  const at = new Map(live.map((n, i) => [n, i]));
  let missing = 0;
  for (const n of [...stage.querySelectorAll('img, canvas, video, image')]) {
    const c = copy[at.get(n)];
    const on = painted(n);
    if (n.tagName === 'IMG') {
      c.removeAttribute('srcset');
      const src = on && (n.currentSrc || n.src);
      const d = src && await dataUrl(src);
      if (d) c.setAttribute('src', d); else { c.removeAttribute('src'); if (src) missing++; }
    } else if (n.tagName === 'image') {
      const href = n.href && n.href.baseVal;
      const d = on && href && (href.startsWith('data:') ? href : await dataUrl(new URL(href, document.baseURI).href));
      if (d) c.setAttribute('href', d); else { c.removeAttribute('href'); if (on && href) missing++; }
      c.removeAttribute('xlink:href');
    } else if (on) {
      try { c.replaceWith(pixelsAsImg(n, k)); } catch (e) { log(`a ${n.tagName.toLowerCase()} could not be read back`, e); c.remove(); missing++; }
    } else c.remove();
  }
  for (const n of run.urlNodes) {
    const c = copy[at.get(n)];
    const on = painted(n);
    const cs = getComputedStyle(n);
    for (const p of IMAGE_PROPS) {
      const val = cs[p], us = files(val), svgs = p === 'backgroundImage' ? [] : svgData(val);
      if (!us.length && !svgs.length) continue;
      let out = val;
      for (const u of us) {
        const d = on ? await dataUrl(u) : null;
        if (on && !d) missing++;
        out = out.split(u).join(d || '');
      }
      if (on) { const b = n.getBoundingClientRect(); for (const u of svgs) out = out.split(u).join(await svgToPng(u, b.width / k, b.height / k)); }
      c.style[p] = out;
    }
  }

  // the clone is laid out in stage px already (fit() scales #stage as a whole, never its children), so it is drawn at 0,0
  // with its fit transform dropped: a translate and a fit scale cancelled by an outer 1/k only cancel at k = 1, and in any
  // other window shifted the whole frame by (1/k - 1) W/2
  const holder = document.createElement('div');
  holder.setAttribute('style', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;overflow:hidden;`);
  clone.setAttribute('style', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform:none;`);
  holder.appendChild(clone);
  const div = document.createElement('div');
  div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  const style = document.createElement('style');
  style.textContent = run.css;
  div.append(style, holder);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', String(OW)); svg.setAttribute('height', String(OH));
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('preserveAspectRatio', 'none');
  for (const a of document.documentElement.attributes) if (a.name !== 'xmlns' && a.name !== 'style') svg.setAttribute(a.name, a.value);
  const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  fo.setAttribute('width', String(W)); fo.setAttribute('height', String(H));
  fo.appendChild(div); svg.appendChild(fo);

  const img = new Image();
  const ok = await new Promise((res) => {
    img.onload = () => res(true);
    img.onerror = () => res(false);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
  });
  const out = document.createElement('canvas');
  out.width = OW; out.height = OH;
  const g = out.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, OW, OH);
  if (ok) g.drawImage(img, 0, 0, OW, OH);
  else { log(`frame ${t.toFixed(3)}s did not paint`); missing++; }
  return { canvas: out, missing };
}

// ---------------------------------------------------------------------------------------------------------------
// the run: pace the frames, encode them, hand back a blob
// ---------------------------------------------------------------------------------------------------------------
// each ratio's platform size; a ratio not listed is scaled so its short side is 1080 (even sides, as H.264 needs). 9:16's
// 1080 wide is 608 stage px drawn at 1.776, so its height is held at 1920 (a 0.1% stretch no one can see)
const OUT = { '16x9': [1920, 1080], '9x16': [1080, 1920], '4x5': [1080, 1350], '1x1': [1080, 1080], '4x3': [1440, 1080] };
const even = (n) => Math.max(2, Math.round(n / 2) * 2);
export function outSize(key = window.AR.key, W = window.AR.w, H = window.AR.h) {
  if (OUT[key]) return OUT[key];
  const s = Math.max(1, 1080 / Math.min(W, H));
  return [even(W * s), even(H * s)];
}

let running = false;
export const busy = () => running;
// the last finished run, so a headless check can pull the file back instead of only trusting the button
let lastRun = null;

async function renderNow({ fps = FPS, onProgress } = {}) {
  const ad = window.__AD;
  if (!ad) throw new Error('export: the spot has no clock yet (window.__AD)');
  if (typeof VideoEncoder !== 'function') throw new Error('export: this browser has no WebCodecs VideoEncoder');
  // what is being exported is fixed at the start: a variant or ratio picked mid-run stops it rather than mixing two
  const W = window.AR.w, H = window.AR.h, ar = window.AR.key, v = variant();
  const [OW, OH] = outSize(ar, W, H);
  const changed = () => variant() !== v || window.AR.key !== ar;
  const total = Math.max(1, Math.round(ad.CYCLE * fps));
  const { Muxer, ArrayBufferTarget } = await loadMuxer();
  const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: 'avc', width: OW, height: OH }, fastStart: 'in-memory' });
  const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => log('the encoder failed', e) });
  const cfg = { codec: AVC, width: OW, height: OH, bitrate: BITRATE, framerate: fps };
  const sup = await VideoEncoder.isConfigSupported(cfg);
  if (!sup.supported) throw new Error(`export: this browser will not encode ${AVC} at ${OW}x${OH}`);
  enc.configure(cfg);

  let missing = 0;
  try {
    const run = await prepare();
    for (let i = 0; i < total; i++) {
      if (changed()) throw new Error('export: the variant or ratio changed mid-run, so the render stopped');
      const { canvas, missing: m } = await frameCanvas((i + 0.5) / fps, W, H, run, OW, OH);
      missing += m;
      if (canvas) {
        // the timestamp is the whole point: an encoder writes the time it is GIVEN, so the file is exactly the spot's
        // length however long the painting took
        const frame = new VideoFrame(canvas, { timestamp: Math.round((i / fps) * 1e6), duration: Math.round(1e6 / fps) });
        // a keyframe every 2s: seekable in an editor or a player without paying for all-intra
        enc.encode(frame, { keyFrame: i % (fps * 2) === 0 });
        frame.close();
      }
      if (onProgress && i % fps === 0) onProgress(i / total);
      // one frame at a time, but never all at once: the encoder's queue is bounded, and waiting here is what keeps a run
      // from holding every frame in memory at once
      if (enc.encodeQueueSize > 8) await new Promise((r) => setTimeout(r, 0));
    }
    await enc.flush();
  } finally {
    try { enc.close(); } catch (e) { log('the encoder was already closed', e); }
    // the spot is left exactly where it started, whatever happened mid-run
    ad.seek(0);
  }
  muxer.finalize();
  const blob = new Blob([muxer.target.buffer], { type: 'video/mp4' });
  const result = { blob, mime: 'video/mp4', codec: AVC, fps, frames: total, missing, seconds: total / fps, width: OW, height: OH, ar, variant: v };
  lastRun = result;
  return result;
}
// one render at a time, from the first await on: a second press while one runs is refused
export async function render(opts) {
  if (running) throw new Error('export: a render is already running');
  running = true;
  try { return await renderNow(opts); } finally { running = false; }
}

// ---------------------------------------------------------------------------------------------------------------
// handing the file over
// ---------------------------------------------------------------------------------------------------------------
export function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// the file's name: the spot, the variant and the ratio it was cut at
export const fileName = ({ variant: v, ar, fps }) => `gemini-muse-meme-${v}-${ar}-${fps}fps.mp4`;
export const canRender = () => typeof VideoEncoder === 'function' && !!window.AR;

function toBase64(blob) {
  return blob.arrayBuffer().then((buf) => {
    let s = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode(...bytes.subarray(i, i + 32768));
    return btoa(s);
  });
}

window.__EXPORT = {
  render,
  frameCanvas,
  outSize,
  download,
  fileName,
  get offered() { return canRender(); },
  // the last finished run, so a check can pull the file back for inspection
  get last() { return lastRun; },
  // a check reads the finished file back through here; the button never calls it
  base64: (blob) => toBase64(blob || (lastRun && lastRun.blob)),
};
