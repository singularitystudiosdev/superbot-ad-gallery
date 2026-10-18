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
//   - each painted <canvas> and <video>, its pixels now (the 3D viewer keeps its drawing buffer for exactly this), painted
//     as the background of the element's own copy (a canvas) or of a <div> standing in with its computed style (a video,
//     which paints an opaque box over its background in an SVG image), never as an <img>, which the rules written for the
//     element would no longer place;
//   - each web font's file (@font-face), so text keeps its face.
// SVG data: URLs (the superbot mark's mask) are already data and render as they do live. Because the bitmaps stay in the
// clone, they keep their stacking, their ancestors' clipping and their transforms: the end card covers the chat, the feed's
// clip trims a rising card, a settling image scales. The stylesheets go in as their authored text (fetched, @imports
// inlined, url()s made absolute by a scanner that leaves data: URLs whole), not as rule.cssText: Chromium re-serializes a
// font shorthand that uses var() beside another font longhand as a run of empty longhands, which the copy then drops to
// the default serif and the layout shifts.
// The clone has no <html>, so selectors rooted at html (the Ratio select's html[data-ar] rules) are rewritten to :root and
// <html>'s attributes are copied onto the SVG's root, where :root lands.
//
// Encoding. Each frame goes to a WebCodecs VideoEncoder carrying the timestamp it is owed (i / fps), and the chunks are
// muxed to MP4 by vendor/mp4-muxer.mjs. The timestamp is the whole design: an encoder writes the time it is given, so the
// file is exactly the spot's length no matter how long the painting took, at a true 30fps, and a spot renders in well
// under its own running time. A MediaRecorder would be simpler but unusable here: it stamps every frame by arrival, which
// would both tie the export to wall clock and leave the webm without a duration in its header.
//
// Sound. A variant whose whole soundtrack renders as one buffer registers it in window.__EXPORT_AUDIO[variant], a function
// resolving to that AudioBuffer (the hotel call: its call and score, beats/hotelcall.f934b5ee.js), and it goes in as an AAC
// track (Opus where the browser has no AAC encoder), cut to the video's length with a short fade. Every other variant's
// sound is its own engine (scores, songs), none of it rendered here, and its file is silent.
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
// every url() turned absolute against the sheet it came from (the data: URL the clone is drawn from has no base of its own).
// Each url() is taken whole, quoted or bare, so a url() inside a data: URL is never read as one of its own: the Superbot
// mark's mask (chat.css --sb-cat) is an SVG data: URL whose own mask="url(%23m)" was rewritten to a page address, which
// left the mark a blob in every exported frame. A data: URL and a #fragment (an SVG paint server in the page, hub.css
// stroke: url(#beam-fade)) stay as they are.
const absolute = (text, base) => text.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"'\s]*))\s*\)/g, (m, q2, q1, bare) => {
  const u = q2 ?? q1 ?? bare ?? '';
  if (!u || u.startsWith('data:') || u.startsWith('#')) return m;
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
  let css = parts.join('\n').replace(/(^|[\s,{}>+~(])html(?=[\s[.:#{,>+~)])/g, '$1:root');
  // each web font's file inlined: an SVG drawn as an image loads none, so its text would fall back to another face (the
  // study guide cut's Google Sans Flex, studyguide.40e96f96.css, is one)
  for (const face of new Set(css.match(/@font-face\s*\{[^}]*\}/g) || [])) {
    let inlined = face;
    for (const u of new Set([...face.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]).filter((u) => !u.startsWith('data:')))) {
      const data = await dataUrl(u);
      if (data) inlined = inlined.split(`url("${u}")`).join(`url("${data}")`);
    }
    css = css.split(face).join(inlined);
  }
  return css;
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

// the file URLs in a computed background or mask: never a data: URL, never a reference into this document (an SVG
// mask="url(#id)" computes to this page's own address plus the fragment, and fetching that would paint the page's HTML)
const files = (val) => [...(val || '').matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]).filter((u) => {
  if (u.startsWith('data:')) return false;
  try { const r = new URL(u, location.href); return !(r.hash && r.href.split('#')[0] === PAGE()); } catch { return false; }
});
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

// a live <canvas> or <video>'s pixels now, painted into the clone as the browser paints them live. The copy is never
// swapped for an <img>: the rules written for the element (the 3D viewer's `.qc-3d canvas`, positioned absolute over its
// frame) would stop matching it, and the picture would fall out of its box. A canvas copy stays a <canvas>, blank in the
// SVG, with its pixels as its background at its object-fit; a video paints an opaque box over its own background in an
// SVG image, so it is stood in for by a <div> carrying the live element's whole computed style and its frame as background
function paintPixels(copy, live) {
  let src = live;
  if (live.tagName === 'VIDEO') {
    src = document.createElement('canvas');
    src.width = live.videoWidth || 1; src.height = live.videoHeight || 1;
    src.getContext('2d').drawImage(live, 0, 0, src.width, src.height);
  }
  const cs = getComputedStyle(live);
  const fit = cs.objectFit === 'cover' || cs.objectFit === 'contain' ? cs.objectFit : '100% 100%';
  const bg = `url("${src.toDataURL('image/png')}") center / ${fit} no-repeat`;
  if (live.tagName === 'CANVAS') { copy.style.setProperty('background', bg); return; }
  const d = document.createElement('div');
  d.className = copy.className;
  for (const prop of cs) d.style.setProperty(prop, cs.getPropertyValue(prop));
  if (cs.display === 'inline') d.style.setProperty('display', 'inline-block');
  d.style.setProperty('background', bg);
  copy.replaceWith(d);
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
    return IMAGE_PROPS.some((p) => files(cs[p]).length);
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
      try { paintPixels(c, n); } catch (e) { log(`a ${n.tagName.toLowerCase()} could not be read back`, e); c.remove(); missing++; }
    } else c.remove();
  }
  for (const n of run.urlNodes) {
    const c = copy[at.get(n)];
    const on = painted(n);
    const cs = getComputedStyle(n);
    for (const p of IMAGE_PROPS) {
      // (an SVG data: mask is left to the browser: with the stylesheet's url()s intact it renders in the SVG image as it does
      // live, internal <mask>s and all, which a PNG of it did not)
      const val = cs[p], us = files(val);
      if (!us.length) continue;
      let out = val;
      for (const u of us) {
        const d = on ? await dataUrl(u) : null;
        if (on && !d) missing++;
        out = out.split(u).join(d || '');
      }
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
  // of <html>'s inline style only its custom properties come along (assets/ar.js --ar-w and its kin, which the ratio rules
  // size the frame by): without them every var(--ar-w, 1920px) drew at its 16:9 fallback in a 9:16, 4:5 or 1:1 render
  const root = document.documentElement.style;
  const vars = [...root].filter((p) => p.startsWith('--')).map((p) => `${p}:${root.getPropertyValue(p)}`).join(';');
  if (vars) svg.setAttribute('style', vars);
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

// the soundtrack in the file: its rate, its fade into the last frame, and the codec tried first
const AUDIO_RATE = 48000, AUDIO_FADE = 0.3, AAC = 'mp4a.40.2', AUDIO_BITRATE = 192_000;

// the variant's registered soundtrack (window.__EXPORT_AUDIO), and the codec this browser will encode it in; null: silent
async function soundtrack(v) {
  const get = window.__EXPORT_AUDIO && window.__EXPORT_AUDIO[v];
  if (!get) return null;
  if (typeof AudioEncoder !== 'function') { log('this browser has no WebCodecs AudioEncoder: the file is silent'); return null; }
  const buffer = await get();
  if (buffer.sampleRate !== AUDIO_RATE) throw new Error(`export: the soundtrack is ${buffer.sampleRate} Hz, the encoder is set for ${AUDIO_RATE}`);
  for (const [codec, muxed] of [[AAC, 'aac'], ['opus', 'opus']]) {
    const cfg = { codec, sampleRate: AUDIO_RATE, numberOfChannels: 2, bitrate: AUDIO_BITRATE };
    if ((await AudioEncoder.isConfigSupported(cfg)).supported) return { buffer, cfg, muxed };
  }
  log('this browser encodes neither AAC nor Opus: the file is silent');
  return null;
}

// the soundtrack into the muxer, cut at `seconds` with a fade into the last frame; mono is doubled to stereo
async function encodeSound(muxer, { buffer, cfg }, seconds) {
  const enc = new AudioEncoder({ output: (chunk, meta) => muxer.addAudioChunk(chunk, meta), error: (e) => log('the audio encoder failed', e) });
  enc.configure(cfg);
  const n = Math.min(buffer.length, Math.round(seconds * AUDIO_RATE)), fade = Math.round(AUDIO_FADE * AUDIO_RATE), BLOCK = 4096;
  const chans = [buffer.getChannelData(0), buffer.getChannelData(Math.min(1, buffer.numberOfChannels - 1))];
  try {
    for (let i = 0; i < n; i += BLOCK) {
      const m = Math.min(BLOCK, n - i), data = new Float32Array(m * 2);
      for (let c = 0; c < 2; c++) {
        data.set(chans[c].subarray(i, i + m), c * m);
        for (let j = 0; j < m; j++) { const left = n - (i + j); if (left < fade) data[c * m + j] *= left / fade; }
      }
      enc.encode(new AudioData({ format: 'f32-planar', sampleRate: AUDIO_RATE, numberOfFrames: m, numberOfChannels: 2, timestamp: Math.round((i / AUDIO_RATE) * 1e6), data }));
      if (enc.encodeQueueSize > 16) await new Promise((r) => setTimeout(r, 0));
    }
    await enc.flush();
  } finally {
    try { enc.close(); } catch (e) { log('the audio encoder was already closed', e); }
  }
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
  const sound = await soundtrack(v);
  const { Muxer, ArrayBufferTarget } = await loadMuxer();
  const muxer = new Muxer({
    target: new ArrayBufferTarget(), video: { codec: 'avc', width: OW, height: OH },
    ...(sound ? { audio: { codec: sound.muxed, numberOfChannels: 2, sampleRate: AUDIO_RATE } } : {}), fastStart: 'in-memory',
  });
  const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => log('the encoder failed', e) });
  const cfg = { codec: AVC, width: OW, height: OH, bitrate: BITRATE, framerate: fps };
  const sup = await VideoEncoder.isConfigSupported(cfg);
  if (!sup.supported) throw new Error(`export: this browser will not encode ${AVC} at ${OW}x${OH}`);
  enc.configure(cfg);

  let missing = 0;
  try {
    const run = await prepare();
    if (sound) await encodeSound(muxer, sound, total / fps);
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
  const result = { blob, mime: 'video/mp4', codec: AVC, audio: sound ? sound.cfg.codec : null, fps, frames: total, missing, seconds: total / fps, width: OW, height: OH, ar, variant: v };
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
