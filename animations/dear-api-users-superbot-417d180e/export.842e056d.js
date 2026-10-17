// Export: the pill in the controls row saves the spot as 60 fps MP4s with its sound, one ratio or all five in a zip. The
// spot is a pure function of t (render(t) in index.html, on a 60 fps quantised clock), so nothing is screen-recorded: each
// frame is seeked, painted and handed to the encoder with the timestamp it is owed (i / 60), as the muse meme spot's
// export.64039673.js does. Every file is frame-exact and exactly 13 s however long the painting takes.
//
// A frame: #stage cloned at the seeked t and drawn to a canvas through <svg><foreignObject> with the page's own <style>
// text. The spot is all DOM and inline SVG (no <img>, no <canvas>), so that one layer is the whole frame. The clone sits in
// a stand-in <html data-ar> so the html[data-ar=...] rules match as they do live (an SVG image's root is its <svg>). The
// raw <style> text is used, not cssRules: CSSOM drops a var() shorthand once a later longhand overrides part of it, and
// .line .g (background: var(--storm-x) then background-clip: text) would come back with no gradient and invisible words.
//
// Encoding: WebCodecs H.264 at High 4.2 (1080p at 60 fps is past level 4.0's macroblock rate), the soundtrack decoded from
// assets/dear-api-users.c060dffc.m4a and re-encoded to AAC once for every file, vendor/mp4-muxer.mjs writing the MP4 on a
// 60 fps timescale. All ratios is one stored zip, so the browser raises one download rather than five.
// window.__EXPORT drives the same render from a headless check or the console.

const FPS = 60;
// each ratio at the ad platforms' size, 1080 on the short side; the stage is 1080 high, so 4:5 and 9:16 draw it larger
const SIZES = { '16x9': [1920, 1080], '4x3': [1440, 1080], '1x1': [1080, 1080], '4x5': [1080, 1350], '9x16': [1080, 1920] };
const ORDER = ['16x9', '4x3', '1x1', '4x5', '9x16'];
const label = (key) => key.replace('x', ':');
const fileName = (key) => `dear-api-users-${key}-${SIZES[key][0]}x${SIZES[key][1]}-${FPS}fps.mp4`;
const ZIP_NAME = `dear-api-users-all-ratios-${FPS}fps.zip`;

// High 4.2 first (1920x1080 at 60 fps is 489,600 macroblocks a second; 4.0 stops at 245,760), then Main, a higher level
// and Baseline for an encoder that will not take it
const AVC = ['avc1.64002a', 'avc1.4d002a', 'avc1.640033', 'avc1.42002a'];
// ~0.07 bits a pixel a frame: 8.7 Mbps at 1080p60, which keeps the blurred word entrances clean on flat black
const BITS_PER_PIXEL = 0.07;
const AUDIO = [{ codec: 'mp4a.40.2', mux: 'aac' }, { codec: 'opus', mux: 'opus' }];
const SR = 48000, CH = 2, AUDIO_BITRATE = 192_000;
const DEPTH = 4; // frames decoding at once while the next ones are seeked and serialised

const SOUND = new URL('./assets/dear-api-users.c060dffc.m4a', import.meta.url).href;
const MUXER = new URL('./vendor/mp4-muxer.mjs', import.meta.url).href;
let muxerModule = null;
const loadMuxer = () => (muxerModule ||= import(MUXER));

const XHTML = 'http://www.w3.org/1999/xhtml', SVGNS = 'http://www.w3.org/2000/svg';
class Cancelled extends Error { constructor() { super('export: cancelled'); } }

// ---------------------------------------------------------------------------------------------------------------
// one frame -> one SVG data: URL
// ---------------------------------------------------------------------------------------------------------------

// :root's tokens are copied onto the stand-in <html> too, in case a renderer stops custom properties at the
// foreignObject boundary
let css = null;
const styleText = () => (css ??= [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n')
  .replace(/:root\s*\{/g, ':root, html {'));

function frameUrl(key, OW, OH) {
  const stage = document.getElementById('stage');
  const W = window.AR.w, H = window.AR.h;
  const clone = stage.cloneNode(true);
  // the live stage carries fit()'s centring translate and window scale; the clone is drawn at 0,0, scaled to the output
  clone.setAttribute('style', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;`
    + `transform:scale(${OH / H});transform-origin:0 0;`);
  const html = document.createElement('html');
  html.setAttribute('xmlns', XHTML);
  html.setAttribute('data-ar', key);
  html.setAttribute('style', `width:${OW}px;height:${OH}px;`);
  const style = document.createElement('style');
  style.textContent = styleText();
  const body = document.createElement('body');
  body.setAttribute('style', `position:relative;width:${OW}px;height:${OH}px;`);
  body.appendChild(clone);
  html.append(style, body);

  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('xmlns', SVGNS);
  svg.setAttribute('width', String(OW)); svg.setAttribute('height', String(OH));
  const fo = document.createElementNS(SVGNS, 'foreignObject');
  fo.setAttribute('width', String(OW)); fo.setAttribute('height', String(OH));
  fo.appendChild(html); svg.appendChild(fo);
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
}

function decode(url) {
  const img = new Image();
  img.src = url;
  return img.decode().then(() => img, (e) => { throw new Error('a frame would not render (its SVG did not decode)', { cause: e }); });
}

// ---------------------------------------------------------------------------------------------------------------
// sound: decoded and encoded once, the same chunks muxed into every file
// ---------------------------------------------------------------------------------------------------------------
let soundOnce = null;

async function encodeSound() {
  if (typeof AudioEncoder !== 'function') return null;
  let pick = null;
  for (const a of AUDIO) {
    const cfg = { codec: a.codec, sampleRate: SR, numberOfChannels: CH, bitrate: AUDIO_BITRATE };
    try { if ((await AudioEncoder.isConfigSupported(cfg)).supported) { pick = { mux: a.mux, cfg }; break; } }
    catch (e) { console.warn(`export: ${a.codec} audio not probed`, e); }
  }
  if (!pick) return null;
  const res = await fetch(SOUND);
  if (!res.ok) throw new Error(`the soundtrack did not load (HTTP ${res.status})`);
  // an OfflineAudioContext decodes at its own rate, so the m4a comes back at 48 kHz whatever the device runs at
  const buf = await new OfflineAudioContext(CH, 1, SR).decodeAudioData(await res.arrayBuffer());
  const channel = (c) => buf.getChannelData(Math.min(c, buf.numberOfChannels - 1));
  const cycle = window.__AD.CYCLE * 1e6;
  const n = Math.round(window.__AD.CYCLE * SR);
  // An AAC encoder (Chrome's AudioToolbox one among them) writes ~2112 priming samples ahead of the signal, and the muxer
  // writes no edit list to skip them, so the sound would land 44 ms late. The delay is measured rather than assumed (it
  // is the encoder's): the first half second is decoded back and lined up against the source, then the source is
  // encoded again that many samples in, so sample k of the soundtrack plays at sample k of the file. What that drops is
  // the m4a's first 44 ms, a -37 dBFS lead-in to the tile pop.
  let chunks = await encodePcm(pick.cfg, channel, 0, n);
  const delay = await encoderDelay(chunks, channel(0));
  if (delay) chunks = await encodePcm(pick.cfg, channel, delay, n);
  // nothing past the spot's end: the encoder's flush pads out a last frame
  chunks = chunks.filter(({ chunk }) => chunk.timestamp < cycle);
  return { mux: pick.mux, codec: pick.cfg.codec, delay, chunks };
}

// samples [from, from + n) of the track through one encoder; past the track's end it is silence
async function encodePcm(cfg, channel, from, n) {
  const chunks = [];
  let failure = null;
  const enc = new AudioEncoder({ output: (chunk, meta) => chunks.push({ chunk, meta }), error: (e) => { failure = e; } });
  enc.configure(cfg);
  const STEP = 4800;
  for (let off = 0; off < n; off += STEP) {
    const len = Math.min(STEP, n - off);
    const data = new Float32Array(len * CH);
    for (let c = 0; c < CH; c++) data.set(channel(c).subarray(from + off, from + off + len), c * len);
    const frame = new AudioData({ format: 'f32-planar', sampleRate: SR, numberOfFrames: len, numberOfChannels: CH,
      timestamp: Math.round((off * 1e6) / SR), data });
    enc.encode(frame);
    frame.close();
  }
  await enc.flush();
  enc.close();
  if (failure) throw failure;
  return chunks;
}

// how many samples late the encoded sound starts: its first chunks decoded and cross-correlated with the source's
// first half second, over lags up to 4096 (an AAC encoder's delay is 1024 to 2112)
async function encoderDelay(chunks, ref) {
  const config = chunks[0] && chunks[0].meta && chunks[0].meta.decoderConfig;
  if (typeof AudioDecoder !== 'function' || !config) return 0;
  const parts = [];
  let failure = null;
  const dec = new AudioDecoder({
    output: (d) => { const a = new Float32Array(d.numberOfFrames); d.copyTo(a, { planeIndex: 0, format: 'f32-planar' }); parts.push(a); d.close(); },
    error: (e) => { failure = e; },
  });
  dec.configure(config);
  for (const { chunk } of chunks.slice(0, 40)) dec.decode(chunk);
  await dec.flush();
  dec.close();
  if (failure) throw failure;
  const out = new Float32Array(parts.reduce((s, p) => s + p.length, 0));
  parts.reduce((at, p) => (out.set(p, at), at + p.length), 0);
  const N = SR / 2, MAX = 4096;
  if (out.length < N + MAX) return 0;
  let best = 0, bestC = -Infinity;
  for (let lag = 0; lag <= MAX; lag++) {
    let c = 0;
    for (let k = 0; k < N; k++) c += ref[k] * out[lag + k];
    if (c > bestC) { bestC = c; best = lag; }
  }
  return best;
}

// ---------------------------------------------------------------------------------------------------------------
// one ratio -> one MP4
// ---------------------------------------------------------------------------------------------------------------
async function videoConfig(W, H) {
  for (const codec of AVC) {
    const cfg = { codec, width: W, height: H, framerate: FPS, bitrate: Math.round(W * H * FPS * BITS_PER_PIXEL),
      bitrateMode: 'variable', avc: { format: 'avc' } };
    try { if ((await VideoEncoder.isConfigSupported(cfg)).supported) return cfg; }
    catch (e) { console.warn(`export: ${codec} not probed`, e); }
  }
  throw new Error(`this browser has no H.264 encoder for ${W}x${H} at ${FPS} fps; try Chrome or Edge`);
}

// the encoder's queue is bounded here so a run never holds hundreds of frames; the timeout covers a browser without the
// dequeue event
const dequeued = (enc) => new Promise((r) => {
  const t = setTimeout(r, 50);
  enc.addEventListener('dequeue', () => { clearTimeout(t); r(); }, { once: true });
});

async function renderRatio(key, { audio, signal, onProgress } = {}) {
  const ad = window.__AD;
  const [OW, OH] = SIZES[key];
  window.setAR(key); // archange: fit() reframes the live stage, so the clone below is laid out at this ratio
  const { Muxer, ArrayBufferTarget } = await loadMuxer();
  const cfg = await videoConfig(OW, OH);
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset',
    video: { codec: 'avc', width: OW, height: OH, frameRate: FPS },
    ...(audio ? { audio: { codec: audio.mux, sampleRate: SR, numberOfChannels: CH } } : {}),
  });
  let failure = null;
  const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { failure = e; } });
  enc.configure(cfg);
  const canvas = document.createElement('canvas');
  canvas.width = OW; canvas.height = OH;
  const g = canvas.getContext('2d', { alpha: false });
  const total = Math.round(ad.CYCLE * FPS);

  const emit = async ({ i, img }) => {
    const im = await img;
    g.fillStyle = '#000';
    g.fillRect(0, 0, OW, OH);
    g.drawImage(im, 0, 0, OW, OH);
    let frame;
    try { frame = new VideoFrame(canvas, { timestamp: Math.round((i * 1e6) / FPS), duration: Math.round(1e6 / FPS) }); }
    catch (e) { throw new Error('this browser will not read the painted frame back; export in Chrome or Edge', { cause: e }); }
    // a keyframe every 2 s: seekable in an editor without paying for all-intra
    enc.encode(frame, { keyFrame: i % (FPS * 2) === 0 });
    frame.close();
    if (failure) throw failure;
    while (enc.encodeQueueSize > 4) await dequeued(enc);
    if (onProgress) onProgress((i + 1) / total);
  };

  const queue = [];
  try {
    for (let i = 0; i < total; i++) {
      if (signal && signal.cancelled) throw new Cancelled();
      // the page's clock is quantised to 1/60 s, so frame i is exactly the page's own frame i
      ad.seek(i / FPS);
      const img = decode(frameUrl(key, OW, OH));
      img.catch(() => {}); // observed by emit(); a run abandoned mid-queue must not leave unhandled rejections
      queue.push({ i, img });
      if (queue.length >= DEPTH) await emit(queue.shift());
    }
    while (queue.length) await emit(queue.shift());
    await enc.flush();
    if (failure) throw failure;
  } finally {
    if (enc.state !== 'closed') enc.close();
  }
  if (audio) for (const { chunk, meta } of audio.chunks) muxer.addAudioChunk(chunk, meta);
  muxer.finalize();
  return { name: fileName(key), key, width: OW, height: OH, codec: cfg.codec, frames: total, bytes: new Uint8Array(muxer.target.buffer) };
}

// ---------------------------------------------------------------------------------------------------------------
// a run: the ratios asked for, then the stage put back exactly as it was
// ---------------------------------------------------------------------------------------------------------------
let current = null; // the running export's signal
let lastRun = null;
const urlRatio = () => (new URLSearchParams(location.search).get('ar') || '').replace(':', 'x').replace('-', 'x');

async function run(keys = ORDER, { onStatus } = {}) {
  if (current) throw new Error('an export is already running');
  const ad = window.__AD;
  if (!ad) throw new Error('the spot has no clock yet');
  if (typeof VideoEncoder !== 'function') throw new Error('this browser has no WebCodecs encoder; try Chrome or Edge');
  const was = { t: ad.now, playing: ad.playing };
  const signal = (current = { cancelled: false });
  const started = performance.now();
  const files = [];
  let audio = null;
  try {
    if (document.fonts) await document.fonts.ready;
    if (onStatus) onStatus({ phase: 'sound' });
    audio = await (soundOnce ||= encodeSound().catch((e) => { soundOnce = null; throw e; }));
    for (const [n, key] of keys.entries()) {
      files.push(await renderRatio(key, {
        audio, signal,
        onProgress: (p) => onStatus && onStatus({ phase: 'video', key, n, of: keys.length, p, all: (n + p) / keys.length }),
      }));
    }
  } finally {
    current = null;
    window.setAR(urlRatio()); // back to ?ar=, or the window's nearest ratio
    if (was.playing) ad.play(was.t); else ad.seek(was.t);
  }
  lastRun = { files, sound: audio ? audio.codec : null, soundDelay: audio ? audio.delay : null, seconds: (performance.now() - started) / 1000 };
  return lastRun;
}

// ---------------------------------------------------------------------------------------------------------------
// a stored zip: the MP4s are already compressed, so no deflate, just the headers and a CRC-32 per file
// ---------------------------------------------------------------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(files) {
  const d = new Date();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const enc = new TextEncoder();
  const parts = [], central = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name), crc = crc32(f.bytes), size = f.bytes.length;
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(6, 0x0800, true); // UTF-8 names
    local.setUint16(8, 0, true); local.setUint16(10, time, true); local.setUint16(12, date, true);
    local.setUint32(14, crc, true); local.setUint32(18, size, true); local.setUint32(22, size, true);
    local.setUint16(26, name.length, true); local.setUint16(28, 0, true);
    parts.push(local, name, f.bytes);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true);
    cen.setUint16(10, 0, true); cen.setUint16(12, time, true); cen.setUint16(14, date, true); cen.setUint32(16, crc, true);
    cen.setUint32(20, size, true); cen.setUint32(24, size, true); cen.setUint16(28, name.length, true);
    cen.setUint32(42, offset, true);
    central.push(cen, name);
    offset += 30 + name.length + size;
  }
  const cenSize = central.reduce((s, p) => s + p.byteLength, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cenSize, true); end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, end], { type: 'application/zip' });
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// ---------------------------------------------------------------------------------------------------------------
// the pill and its menu
// ---------------------------------------------------------------------------------------------------------------
// Safari taints a canvas once an SVG foreignObject is drawn on it, and a tainted canvas cannot become a VideoFrame: one
// 2x2 frame drawn up front tells, so a browser where the export can only fail never shows the pill
async function canReadBack() {
  const svg = `<svg xmlns="${SVGNS}" width="2" height="2"><foreignObject width="2" height="2">`
    + `<div xmlns="${XHTML}" style="width:2px;height:2px;background:#fff"></div></foreignObject></svg>`;
  try {
    const img = await decode('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    const c = document.createElement('canvas');
    c.width = c.height = 2;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    g.getImageData(0, 0, 1, 1);
    return true;
  } catch (e) {
    console.info('export: this browser will not read back a painted SVG frame, so the export pill stays hidden', e);
    return false;
  }
}

async function mount() {
  const box = document.querySelector('.export');
  // no WebCodecs (an older browser) or no read-back (Safari), no pill: the gallery's download links still serve the
  // 30 fps renders
  if (!box || typeof VideoEncoder !== 'function' || typeof VideoFrame !== 'function' || !(await canReadBack())) return;
  const btn = box.querySelector('.export-btn'), cancel = box.querySelector('.export-cancel'), menu = box.querySelector('.export-menu');
  const items = [...menu.querySelectorAll('[role="menuitem"]')];
  box.hidden = false;
  let resetTimer = 0;

  const setLabel = (text, p) => {
    btn.textContent = text;
    if (p === undefined) btn.style.removeProperty('--p'); else btn.style.setProperty('--p', `${(p * 100).toFixed(1)}%`);
  };
  const openMenu = () => { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); items[0].focus(); };
  const closeMenu = (refocus) => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (refocus) btn.focus(); };

  btn.addEventListener('click', () => { if (current) return; if (menu.hidden) openMenu(); else closeMenu(false); });
  cancel.addEventListener('click', () => { if (current) { current.cancelled = true; setLabel('cancelling'); } });
  addEventListener('pointerdown', (e) => { if (!menu.hidden && !box.contains(e.target)) closeMenu(false); });

  // the page's keys (space, arrows, R, M) would move the clock or the sound: inside the control they stay here
  box.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Escape') { if (current) cancel.click(); else if (!menu.hidden) closeMenu(true); return; }
    if (menu.hidden) return;
    const i = items.indexOf(document.activeElement);
    const go = (j) => { e.preventDefault(); items[(j + items.length) % items.length].focus(); };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(items.length - 1);
    else if (e.key === 'Tab') closeMenu(false);
  });

  // while it renders, nothing else may start the clock or the sound under it: keys (Escape cancels), clicks on the stage,
  // and the gallery's unmute message are held back
  addEventListener('keydown', (e) => {
    if (!current || box.contains(e.target)) return;
    e.stopImmediatePropagation();
    if (e.key === 'Escape') cancel.click();
  }, true);
  addEventListener('pointerdown', (e) => { if (current && !e.target.closest('.ctrls')) e.stopImmediatePropagation(); }, true);
  addEventListener('message', (e) => { if (current && e.data && e.data.type === 'unmute') e.stopImmediatePropagation(); }, true);

  for (const item of items) {
    item.addEventListener('click', async () => {
      const keys = item.dataset.ar === 'all' ? ORDER : [item.dataset.ar];
      closeMenu(false);
      clearTimeout(resetTimer);
      document.body.classList.add('exporting');
      cancel.hidden = false;
      btn.setAttribute('aria-busy', 'true');
      setLabel('preparing', 0);
      btn.focus();
      let done = 'export';
      try {
        const out = await run(keys, {
          onStatus: (s) => {
            if (s.phase !== 'video' || (current && current.cancelled)) return;
            const pct = `${Math.floor(s.p * 100)}%`;
            setLabel(s.of > 1 ? `${s.n + 1}/${s.of} ${label(s.key)} ${pct}` : `${label(s.key)} ${pct}`, s.all);
          },
        });
        if (out.files.length > 1) { setLabel('zipping', 1); download(zip(out.files), ZIP_NAME); }
        else download(new Blob([out.files[0].bytes], { type: 'video/mp4' }), out.files[0].name);
        done = out.sound ? 'saved' : 'saved, no sound (this browser has no audio encoder)';
        console.info(`export: ${out.files.map((f) => `${f.name} ${(f.bytes.length / 1e6).toFixed(1)} MB`).join(', ')}; `
          + `${out.sound || 'no'} audio; ${out.seconds.toFixed(1)} s`);
      } catch (e) {
        if (e instanceof Cancelled) done = 'cancelled';
        else { done = `export failed: ${e.message}`; console.error(new Error('export: the render failed', { cause: e })); }
      } finally {
        document.body.classList.remove('exporting');
        cancel.hidden = true;
        btn.removeAttribute('aria-busy');
        setLabel(done);
        resetTimer = setTimeout(() => setLabel('export'), done.startsWith('export failed') ? 6000 : 2500);
      }
    });
  }
}

function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(s);
}

window.__EXPORT = {
  FPS, SIZES, ORDER,
  run, renderRatio, frameUrl, zip, download,
  cancel() { if (current) current.cancelled = true; },
  get running() { return !!current; },
  // the last finished run, so a check can pull the files back for inspection; the pill never calls these
  get last() { return lastRun; },
  base64: (bytes) => toBase64(bytes),
  zipBase64: async (files) => toBase64(new Uint8Array(await zip(files || lastRun.files).arrayBuffer())),
};

mount().catch((e) => console.error(new Error('export: the pill did not mount', { cause: e })));
