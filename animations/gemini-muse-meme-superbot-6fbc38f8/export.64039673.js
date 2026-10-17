// Export (the variant-select family): a pill on the right, under the Music pick, that saves the multicat-credits spot as
// a video file. The spot is a pure function of t (timeline.9b47fc30.js), so the export does not screen-record: it walks
// the clock a whole frame at a time and paints each frame itself, then encodes the lot. Every frame is therefore exact,
// at any speed, with nothing that the viewer's own frame timer can drop.
//
// How one frame is painted. #stage is live DOM plus one WebGL canvas (cat3d.516afb1a.js), and neither can be photographed
// in one call: the stage is not a canvas, and an SVG <foreignObject> will not load an <img> (Chromium does not let the
// HTML inside it fetch subresources) nor paint an <image> nested in it. So a frame is composited from two layers:
//   1. DOM: #stage cloned, its bitmaps removed but their boxes kept as holes, wrapped in the document's own stylesheet
//      inside <svg><foreignObject>, that SVG written as a data: URL and drawn to a canvas. The data: URL has no base URL,
//      so every relative url() in the stylesheet is absolutised first or it would 404. An empty SVG that fails to parse
//      reports it on <img>.onerror; a rejected frame is counted and reported, never silently black.
//   2. BITMAPS: each removed <img> fetched to a data: URL, each live <canvas> read back with toDataURL (the 3D viewer
//      keeps its drawing buffer for exactly this), each drawn into its own hole at the rect it had, clipped to its
//      border-radius and scaled by its opacity. This is the reason the bitmaps are lifted out of the DOM layer at all.
//
// Encoding. Each frame goes to a WebCodecs VideoEncoder carrying the timestamp it is owed (i / fps), and the chunks are
// muxed to MP4 by vendor/mp4-muxer.mjs. The timestamp is the whole design: an encoder writes the time it is given, so the
// file is exactly the spot's length no matter how long the painting took, at a true 30fps, and 28s of spot renders in
// well under real time. A MediaRecorder would be simpler but unusable here: it stamps every frame by arrival, which
// would both tie the export to wall clock and leave the webm without a duration in its header.
//
// Only offered on the multicat-credits cut (multicat.516afb1a.js BARE_ID) at 9:16 (AR.key), where it was asked for;
// window.__EXPORT.render() drives the same render from a headless check or the console.
import { variant } from './variant.9e82faf1.js?v=3';

const BARE_ID = 'multicat-credits';
const AR_KEY = '9x16';
const FPS = 30;
// H.264 High 4.0: the encoder profile every desktop and mobile browser decodes, and the one an editor or an ad platform
// will take without a transcode. VP9 in a MediaRecorder webm would be smaller to write but has no duration in its header,
// which makes the file unimportable in most editors; an MP4 muxed here carries its real length and frame rate.
const AVC = 'avc1.640028';
const BITRATE = 10_000_000;
const MUXER = new URL('./vendor/mp4-muxer.mjs', import.meta.url).href;
let muxerModule = null;
const loadMuxer = () => (muxerModule ||= import(MUXER));

// Nothing here may break the spot: a stylesheet, a bitmap or a frame that will not come back is reported and its area is
// left black (and counted in `missing`), never thrown into the render loop.
const log = (msg, e) => console.error(new Error(`export: ${msg}`, e ? { cause: e } : undefined));

// ---------------------------------------------------------------------------------------------------------------
// one frame -> one canvas
// ---------------------------------------------------------------------------------------------------------------

// every cssRules entry of every same-origin stylesheet, as text, with each url() turned absolute: the SVG is drawn from
// a data: URL, which has no base of its own, so a relative font, image or filter reference would resolve against nothing.
let cssText = null;
function stylesheetText() {
  if (cssText !== null) return cssText;
  const base = document.baseURI;
  const abs = (u) => { try { return new URL(u, base).href; } catch { return u; } };
  let css = '';
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch (e) { log(`stylesheet not readable, skipped: ${sheet.href}`, e); continue; }
    for (const rule of rules) css += rule.cssText + '\n';
  }
  // cached: the sheets are fixed by the time the pill can be clicked, and flattening ~250 of them once per frame (847
  // frames in a run) dominated the render. A stylesheet that arrives after the first frame would be missed; the spot's own
  // sheets are all in before the pill becomes visible, which is the gate the click waits behind.
  cssText = css.replace(/url\((?!\s*["']?\s*data:)["']?([^"')]+)["']?\)/g, (m, u) => `url("${abs(u)}")`);
  return cssText;
}

// a bitmap in the clone, lifted out so the DOM layer keeps its box but not its pixels. The geometry comes from the LIVE
// node: the clone is detached, so its own rects are all zero. Only the clone's element is dropped, which is what stops
// the foreignObject trying (and failing) to fetch an <img>.
//
// `shown` is a whole-chain test, not the node's own style: every variant's beat is mounted at once, so the frame also
// holds the other cuts' nodes, sized but clipped out by an ancestor or parked at 0x0. A node only counts when it and every
// ancestor up to #stage are visible and it has real area, which is what the browser would actually paint.
function liftBitmap(cloneNode, liveNode, origin) {
  const r = liveNode.getBoundingClientRect();
  const cs = getComputedStyle(liveNode);
  cloneNode.remove();
  return {
    src: liveNode.tagName === 'IMG' ? (liveNode.currentSrc || liveNode.src) : null,
    canvas: liveNode.tagName === 'CANVAS' ? liveNode : null,
    // stage-local, not viewport: the clone is drawn at 0,0 unscaled, so a viewport rect would paint every bitmap off by
    // the stage's centring offset and its fit scale (the spot is fit with a translate/scale, timeline.9b47fc30.js fit())
    w: r.width / origin.k, h: r.height / origin.k,
    x: (r.left - origin.x) / origin.k, y: (r.top - origin.y) / origin.k,
    radius: parseFloat(cs.borderTopLeftRadius) || 0,
    opacity: parseFloat(cs.opacity),
    onScreen: painted(liveNode),
  };
}

// whether the browser would paint this node at all: every ancestor visible, and real area inside the stage box
function painted(node) {
  for (let n = node; n && n.id !== 'stage'; n = n.parentElement) {
    const its = getComputedStyle(n);
    if (its.display === 'none' || its.visibility === 'hidden' || parseFloat(its.opacity) === 0) return false;
  }
  const r = node.getBoundingClientRect();
  return r.width >= 1 && r.height >= 1;
}

// the clone's <img>s inside the foreignObject never load, so the pixels are painted by the caller from `holes`
async function frameCanvas(t, W, H) {
  const stage = document.getElementById('stage');
  const ad = window.__AD;
  if (!ad) return { canvas: null, holes: [], missing: 0 };
  ad.seek(t);

  const clone = stage.cloneNode(true);
  // #stage's own style is kept as it is: fit() puts the centring translate(-50%,-50%) and the window fit scale there,
  // and the children are laid out against it. The transform is cancelled on a wrapper instead, so the clone inside it
  // renders exactly as the live stage does, at 0,0 unscaled.
  const sr = stage.getBoundingClientRect();
  const k = sr.width ? sr.width / W : 1;
  const origin = { x: sr.left, y: sr.top, k };
  const holder = document.createElement('div');
  holder.setAttribute('style', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;overflow:hidden;`
    + `transform:scale(${1 / k});transform-origin:0 0;`);
  clone.setAttribute('style', `position:absolute;left:${(W / 2).toFixed(2)}px;top:${(H / 2).toFixed(2)}px;`
    + `width:${W}px;height:${H}px;transform:translate(-50%,-50%) scale(${k});`);
  holder.appendChild(clone);
  // the clone carries no live nodes: pair each cloned bitmap with the live one by document order
  const liveImgs = [...stage.querySelectorAll('img, canvas')];
  const cloneNodes = [...clone.querySelectorAll('img, canvas')];
  const holes = [];
  cloneNodes.forEach((n, i) => holes.push(liftBitmap(n, liveImgs[i], origin)));
  // a bitmap the frame does not show (another variant's copy, still in the tree) must not be painted over this one
  const shown = holes.filter((h) => h.onScreen);

  const div = document.createElement('div');
  div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  const style = document.createElement('style');
  style.textContent = stylesheetText();
  div.appendChild(style);
  div.appendChild(holder);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', String(W)); svg.setAttribute('height', String(H));
  const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  fo.setAttribute('width', String(W)); fo.setAttribute('height', String(H));
  fo.appendChild(div); svg.appendChild(fo);

  const xml = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  const ok = await new Promise((res) => { img.onload = () => res(true); img.onerror = () => res(false); img.src = svgUrl; });

  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const g = out.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (ok) g.drawImage(img, 0, 0, W, H);

  // the bitmap layer, back into its holes
  let missing = ok ? 0 : 1;
  for (const h of shown) {
    g.save();
    if (h.radius) { g.beginPath(); g.roundRect(h.x, h.y, h.w, h.h, h.radius); g.clip(); }
    if (h.opacity < 1) g.globalAlpha = h.opacity;
    if (h.canvas) {
      try { g.drawImage(h.canvas, h.x, h.y, h.w, h.h); }
      catch (e) { log('a canvas could not be read back', e); missing++; }
    } else if (h.src) {
      const bit = await loadBitmap(h.src);
      if (bit) g.drawImage(bit, 0, 0, bit.naturalWidth, bit.naturalHeight, h.x, h.y, h.w, h.h);
      else missing++;
    }
    g.restore();
  }
  return { canvas: out, holes, missing };
}

const bitCache = new Map();
function loadBitmap(src) {
  if (bitCache.has(src)) return bitCache.get(src);
  const p = fetch(src)
    .then((r) => { if (!r.ok) throw new Error(`${r.status} ${src}`); return r.blob(); })
    .then((b) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(b); }))
    .then((d) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error(`decode failed: ${src}`)); im.src = d; }))
    .catch((e) => { log(`bitmap not loaded: ${src}`, e); return null; });
  bitCache.set(src, p);
  return p;
}

// ---------------------------------------------------------------------------------------------------------------
// the run: pace the frames, encode them, hand back a blob
// ---------------------------------------------------------------------------------------------------------------
let running = false;
// the last finished run, so a headless check can pull the file back instead of only trusting the button
let lastRun = null;

async function render({ fps = FPS, onProgress } = {}) {
  const ad = window.__AD;
  if (!ad) throw new Error('export: the spot has no clock yet (window.__AD)');
  if (typeof VideoEncoder !== 'function') throw new Error('export: this browser has no WebCodecs VideoEncoder');
  const W = window.AR.w, H = window.AR.h;
  const total = Math.max(1, Math.round(ad.CYCLE * fps));
  const { Muxer, ArrayBufferTarget } = await loadMuxer();
  const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: 'avc', width: W, height: H }, fastStart: 'in-memory' });
  const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => log('the encoder failed', e) });
  const cfg = { codec: AVC, width: W, height: H, bitrate: BITRATE, framerate: fps };
  const sup = await VideoEncoder.isConfigSupported(cfg);
  if (!sup.supported) throw new Error(`export: this browser will not encode ${AVC} at ${W}x${H}`);
  enc.configure(cfg);

  let missing = 0;
  try {
    for (let i = 0; i < total; i++) {
      const { canvas, missing: m } = await frameCanvas((i + 0.5) / fps, W, H);
      missing += m;
      if (canvas) {
        // the timestamp is the whole point: an encoder writes the time it is GIVEN, so the file is exactly the spot's
        // length however long the painting took. A MediaRecorder would stamp each frame by its arrival instead, tying the
        // export to wall clock and leaving a webm header with no duration, which is why it is not used here.
        const frame = new VideoFrame(canvas, { timestamp: Math.round((i / fps) * 1e6), duration: Math.round(1e6 / fps) });
        // a keyframe every 2s: seekable in an editor or a player without paying for all-intra
        enc.encode(frame, { keyFrame: i % (fps * 2) === 0 });
        frame.close();
      }
      if (onProgress && i % fps === 0) onProgress(i / total);
      // one frame at a time, but never all at once: the encoder's queue is bounded, and waiting here is what keeps a
      // 28s run from holding every frame in memory at once
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
  const result = { blob, mime: 'video/mp4', codec: AVC, fps, frames: total, missing, seconds: total / fps };
  lastRun = result;
  return result;
}

// ---------------------------------------------------------------------------------------------------------------
// the pill
// ---------------------------------------------------------------------------------------------------------------
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function mountExport() {
  const bar = document.createElement('div');
  bar.className = 'export-pill';
  bar.innerHTML = '<button type="button" class="export-btn"><span class="export-lab">Export</span></button>';
  document.body.appendChild(bar);
  const btn = bar.querySelector('button');
  const lab = bar.querySelector('.export-lab');

  const offered = () => variant() === BARE_ID && window.AR && window.AR.key === AR_KEY;
  function sync() { bar.hidden = !offered(); }
  addEventListener('variantchange', sync);
  addEventListener('archange', sync);
  sync();

  btn.addEventListener('click', async () => {
    if (running) return;
    running = true;
    btn.disabled = true;
    const was = lab.textContent;
    lab.textContent = 'Rendering…';
    try {
      const { blob, fps, frames, missing, seconds, mime } = await render({
        onProgress: (p) => { lab.textContent = `${Math.round(p * 100)}%`; },
      });
      const name = `gemini-muse-meme-multicat-credits-9x16-${fps}fps.mp4`;
      download(blob, name);
      lab.textContent = 'Saved';
      console.info(`export: ${frames} frames, ${seconds.toFixed(1)}s, ${(blob.size / 1e6).toFixed(1)} MB, ${mime}, ${missing} frame(s) without their bitmap`);
      setTimeout(() => { lab.textContent = was; }, 2500);
    } catch (e) {
      lab.textContent = 'Export failed';
      log('the render failed', e);
      console.error(e);
      setTimeout(() => { lab.textContent = was; }, 3000);
    } finally {
      running = false;
      btn.disabled = false;
    }
  });
  return bar;
}

window.__EXPORT = {
  render,
  mountExport,
  get offered() { return variant() === BARE_ID && window.AR && window.AR.key === AR_KEY; },
  frameCanvas,
  download,
  // the last finished run, so a check can pull the file back for inspection
  get last() { return lastRun; },
};

function toBase64(blob) {
  return blob.arrayBuffer().then((buf) => {
    let s = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode(...bytes.subarray(i, i + 32768));
    return btoa(s);
  });
}

// a check reads the finished file back through here; the button never calls it
window.__EXPORT.base64 = (blob) => toBase64(blob || (lastRun && lastRun.blob));

mountExport();
