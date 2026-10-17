// The export's sound (export.64039673.js renders the pictures frame by frame; this gives the file its soundtrack). The
// pictures can be painted at any t, but the sound has to play to be heard: the scores, songs and calls follow the RUNNING
// clock. So before the frames, the spot plays once at 1x from the top and everything it plays is taken down
// (audio-tap.64039673.js, a classic script in <head>, knows where it all comes out):
//   - every node connected to an AudioContext's speakers (the v16 scores through the sound gate, sound.96834de7.js, and
//     any soundtrack with a context of its own) is recorded inside that same context, on its own frame counter, against
//     its own currentTime at the clock's zero, then resampled to 48 kHz. A score plays its output latency AHEAD of the
//     clock so what is heard lands on its frame (multicat-player.96834de7.js); the recorder is before the speakers, so each
//     context's take is placed that latency later;
//   - the media elements (the songs, the calls) are not recorded live: an element starts a tenth of a second after it is
//     told to play, so live it trails the picture. Each frame logs where each one is, how loud and whether it plays, and
//     afterwards its file is decoded and laid in where the beat asked for it, at the volume it set frame by frame.
// The pass plays at 1x with the Sound pill's mute lifted, and stops (the export with it) if the clock is paused, sped up,
// or the variant or ratio changes under it. A pass that plays nothing gives no track: that variant's file stays silent.
// Then AAC (else Opus) through WebCodecs, the encoder's priming lead-in measured and trimmed (primingOf).
// Measured by cross-correlating exports against their own sources (export QA, 2026-10-17): the multicat-credits score 0.0 ms
// off its frames and its song 10.6 ms (a third of a frame); the refund call 5 ms, the same two runs apart.
import { music } from './music.47e5d94a.js?v=2';
import { sound } from './sound.96834de7.js?v=2';

export const SR = 48000;
const BITRATE = 192_000;
const log = (msg, e) => console.error(new Error(`export sound: ${msg}`, e ? { cause: e } : undefined));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const REC_WORKLET = `registerProcessor('export-rec', class extends AudioWorkletProcessor {
  constructor() { super(); this.on = true; this.n = 0; this.at = 0; this.l = new Float32Array(8192); this.r = new Float32Array(8192);
    this.port.onmessage = (e) => { if (e.data === 'stop') { this.flush(); this.on = false; } }; }
  flush() { if (this.n) this.port.postMessage({ at: this.at, l: this.l.slice(0, this.n), r: this.r.slice(0, this.n) }); this.n = 0; }
  process(inputs) {
    const ch = inputs[0];
    if (!this.n) this.at = currentFrame;
    for (let i = 0; i < 128; i++) { this.l[this.n + i] = ch && ch[0] ? ch[0][i] : 0; this.r[this.n + i] = ch && ch[0] ? (ch[1] || ch[0])[i] : 0; }
    this.n += 128;
    if (this.n >= 8192) this.flush();
    return this.on;
  }
});`;

const decodeCache = new Map();
function decodeFile(src) {
  if (!decodeCache.has(src)) {
    decodeCache.set(src, fetch(src)
      .then((r) => { if (!r.ok) throw new Error(`${r.status} ${src}`); return r.arrayBuffer(); })
      .then((ab) => new OfflineAudioContext(2, 1, SR).decodeAudioData(ab))
      .catch((e) => { log(`a sound file did not decode, the file goes without it: ${src}`, e); return null; }));
  }
  return decodeCache.get(src);
}

// one element's log, [t, position, volume, playing, src] a frame, laid into the track
async function layMedia(entries, L, R) {
  const n = L.length, FRAME = 1 / 60;
  let seg = null;
  const segs = [];
  for (const [t, cur, vol, playing, src] of entries) {
    if (!playing || !src) { seg = null; continue; }
    // a run carries on while it advances with the clock; a jump (the beat re-seeking it) or a new file starts another
    const carries = seg && seg.src === src && Math.abs(cur - (seg.c0 + (t - seg.t0))) < 0.25;
    if (!carries) segs.push((seg = { t0: t, c0: cur, src, pts: [] }));
    seg.pts.push([t, vol]);
  }
  for (const s of segs) {
    const buf = await decodeFile(s.src);
    if (!buf) continue;
    const chs = [buf.getChannelData(0), buf.getChannelData(buf.numberOfChannels > 1 ? 1 : 0)];
    const end = s.pts[s.pts.length - 1][0] + FRAME;
    const j0 = Math.max(0, Math.round(s.t0 * SR)), j1 = Math.min(n, Math.round(end * SR));
    let k = 0;
    for (let j = j0; j < j1; j++) {
      const t = j / SR;
      while (k + 1 < s.pts.length && s.pts[k + 1][0] <= t) k++;
      const [ta, va] = s.pts[k], nx = s.pts[k + 1];
      const vol = nx ? va + (nx[1] - va) * Math.min(1, (t - ta) / Math.max(1e-6, nx[0] - ta)) : va;
      if (!vol) continue;
      const p = Math.round((s.c0 + (t - s.t0)) * SR);
      if (p < 0 || p >= chs[0].length) continue;
      L[j] += chs[0][p] * vol;
      R[j] += chs[1][p] * vol;
    }
  }
}

// the spot played once from the top, recorded: { L, R, peak, latencyMs, elements } or null when it played nothing.
// `changed()` says the variant or ratio moved under the run; onProgress(p) counts the pass 0..1.
// Each context is recorded INSIDE itself (an AudioWorklet fed by every node that reaches its speakers), on its own frame
// counter: a MediaStream bridge into one recording context was tried and its delay wandered run to run (0 then 54 ms against
// the same score), while a context's own frames against its own currentTime at the clock's zero are exact.
export async function recordSound({ seconds, changed = () => false, onProgress } = {}) {
  const ad = window.__AD, tap = window.__TAP;
  if (!tap) { log('audio-tap.64039673.js is not loaded, so the file has no sound'); return null; }
  if (typeof AudioWorkletNode !== 'function') { log('this browser has no AudioWorklet, so the file has no sound'); return null; }
  const was = { speed: ad.speed, muted: sound.muted, gain: sound.out ? sound.out.gain.value : null };
  ad.setSpeed(1);
  sound.muted = false;
  if (sound.out) sound.out.gain.value = 1;
  // a soundtrack's start gate (the multicat mix's) opens on the press that started this export
  const gate = document.querySelector('.mix-gate:not([hidden]) .mix-gate-btn');
  if (gate) gate.click();

  const workletUrl = URL.createObjectURL(new Blob([REC_WORKLET], { type: 'text/javascript' }));
  const recs = new Map(); // context -> its recorder
  const logs = new Map(); // media element -> its frames
  let off = () => {}, started = false;
  // a context's recorder: its frames, where the clock's zero falls on them, and the latency its scores play ahead by
  const recorderFor = (ctx) => {
    let r = recs.get(ctx);
    if (r) return r;
    r = { ctx, chunks: [], pending: [], node: null, silent: null, zero: null, lat: 0 };
    recs.set(ctx, r);
    r.ready = ctx.audioWorklet.addModule(workletUrl).then(() => {
      const node = new AudioWorkletNode(ctx, 'export-rec', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2], channelCount: 2, channelCountMode: 'explicit' });
      const silent = ctx.createGain();
      silent.gain.value = 0;
      node.__exportTap = silent.__exportTap = true; // ours: never tapped back into ourselves
      node.port.onmessage = (e) => r.chunks.push(e.data);
      node.connect(silent).connect(ctx.destination); // a recorder only runs while something pulls it
      r.node = node; r.silent = silent;
      for (const n of r.pending.splice(0)) n.connect(node);
      // a context that turns up mid-run: its zero from the clock as it is now
      if (started && r.zero === null) r.zero = ctx.currentTime - ad.now;
    }).catch((e) => log('a context could not be recorded, the file goes without it', e));
    return r;
  };
  const tapNode = (n) => {
    if (n.__exportTap || n.context.state === 'closed') return;
    const r = recorderFor(n.context);
    if (r.node) n.connect(r.node); else r.pending.push(n);
  };
  try {
    for (const nodes of tap.outs.values()) for (const n of [...nodes]) tapNode(n);
    off = tap.on((kind, x) => { if (kind === 'node') tapNode(x); });
    await Promise.all([...recs.values()].map((r) => r.ready));

    // from the top, once the soundtrack in use reports it has rendered (variant-select.9e82faf1.js waits the same way)
    ad.seek(0);
    const pick = window.__PICKS && window.__PICKS[music()];
    for (let waited = 0; pick && !pick.ready() && waited < 6000; waited += 50) await sleep(50);
    await sleep(500);
    for (const r of recs.values()) if (r.ctx.state === 'suspended') await r.ctx.resume().catch(() => {});
    ad.play(0);
    for (const r of recs.values()) r.zero = r.ctx.currentTime;
    started = true;
    // the clock (60 fps quantised) holds its last whole frame at the end, short of CYCLE (multicat-credits: 28.2167 against
    // 28.2227, which read as a pause), and the frame count can round a hair past CYCLE: the run is done within a frame of it
    const until = Math.min(seconds, ad.CYCLE) - 1 / 30;
    await new Promise((res, rej) => {
      const tick = () => {
        if (changed()) return rej(new Error('export: the variant or ratio changed while the sound was recording, so the export stopped'));
        if (!ad.playing && ad.now < until) return rej(new Error('export: the spot was paused while the sound was recording, so the export stopped'));
        if (ad.speed !== 1) return rej(new Error('export: the speed changed while the sound was recording, so the export stopped'));
        const now = ad.now;
        for (const el of tap.media) {
          if (!logs.has(el)) logs.set(el, []);
          logs.get(el).push([now, el.currentTime, el.muted ? 0 : el.volume, !el.paused && !el.ended, el.currentSrc]);
        }
        if (onProgress) onProgress(Math.min(1, now / seconds));
        if (now >= until) return res();
        requestAnimationFrame(tick);
      };
      tick();
    });
    await sleep(300); // the last quanta through the recorders
    for (const r of recs.values()) if (r.node) r.node.port.postMessage('stop');
    await sleep(150);

    // each context's frames onto the clock: output sample j (clock j / SR) is the context's frame at zero - latency + j / SR
    // (its scores play that far ahead so what is HEARD lands on the frame), resampled to SR
    const n = Math.round(seconds * SR);
    const L = new Float32Array(n), R = new Float32Array(n);
    for (const r of recs.values()) {
      if (!r.chunks.length || r.zero === null) continue;
      // the latency as the scores read it once sound is running (it is near zero until the output starts, 2026-10-17: 5 ms
      // read at the recorder's start against 29 ms in play, a 24 ms early cut)
      r.lat = (r.ctx.outputLatency || 0) + (r.ctx.baseLatency || 0);
      const sr = r.ctx.sampleRate;
      const f0 = Math.min(...r.chunks.map((c) => c.at)), f1 = Math.max(...r.chunks.map((c) => c.at + c.l.length));
      const cl = new Float32Array(f1 - f0), cr = new Float32Array(f1 - f0);
      for (const c of r.chunks) { cl.set(c.l, c.at - f0); cr.set(c.r, c.at - f0); }
      const base = (r.zero - r.lat) * sr - f0;
      for (let j = 0; j < n; j++) {
        const x = base + (j / SR) * sr, i = Math.floor(x), f = x - i;
        if (i < 0 || i + 1 >= cl.length) continue;
        L[j] += cl[i] + (cl[i + 1] - cl[i]) * f;
        R[j] += cr[i] + (cr[i + 1] - cr[i]) * f;
      }
    }
    for (const entries of logs.values()) await layMedia(entries, L, R);
    let peak = 0;
    for (let j = 0; j < n; j++) peak = Math.max(peak, Math.abs(L[j]), Math.abs(R[j]));
    // a sum that would clip (a song over an already mastered score) is brought under full scale, never clipped
    if (peak > 0.98) { const g = 0.98 / peak; for (let j = 0; j < n; j++) { L[j] *= g; R[j] *= g; } peak = 0.98; }
    // a 20 ms fade at the cut, so the file never ends on a click
    for (let i = 0, m = Math.min(n, SR * 0.02); i < m; i++) { const f = i / m; L[n - 1 - i] *= f; R[n - 1 - i] *= f; }
    const latencyMs = [...recs.values()].map((r) => +(r.lat * 1000).toFixed(1));
    return peak > 1e-4 ? { L, R, peak, latencyMs, elements: logs.size } : null;
  } finally {
    off();
    for (const r of recs.values()) {
      if (!r.node) continue;
      for (const nd of tap.outs.get(r.ctx) || []) { if (!nd.__exportTap) { try { nd.disconnect(r.node); } catch { /* already gone */ } } }
      try { r.silent.disconnect(); r.node.disconnect(); } catch { /* already gone */ }
    }
    URL.revokeObjectURL(workletUrl);
    ad.seek(0); // stopped at the top: the frames are painted next, and a seek holds the clock
    ad.setSpeed(was.speed);
    sound.muted = was.muted;
    if (sound.out && was.gain !== null) sound.out.gain.value = was.gain;
  }
}

// the codec this browser will encode the track with: AAC, else Opus, else none
export async function soundCodec() {
  if (typeof AudioEncoder !== 'function') return null;
  for (const codec of ['mp4a.40.2', 'opus']) {
    if ((await AudioEncoder.isConfigSupported({ codec, sampleRate: SR, numberOfChannels: 2, bitrate: BITRATE })).supported) return codec;
  }
  return null;
}
// the muxer's name for it (vendor/mp4-muxer.mjs)
export const muxerCodec = (codec) => (codec === 'opus' ? 'opus' : 'aac');

function feed(enc, L, R) {
  const STEP = 1024;
  for (let i = 0; i < L.length; i += STEP) {
    const m = Math.min(STEP, L.length - i), data = new Float32Array(m * 2);
    data.set(L.subarray(i, i + m), 0);
    data.set(R.subarray(i, i + m), m);
    const ad = new AudioData({ format: 'f32-planar', sampleRate: SR, numberOfFrames: m, numberOfChannels: 2, timestamp: Math.round((i / SR) * 1e6), data });
    enc.encode(ad);
    ad.close();
  }
}

// An AAC encoder opens its output with priming samples (2112 from the macOS encoder Chrome uses: 44 ms at 48 kHz). An MP4
// hides them with an edit list, which vendor/mp4-muxer.mjs does not write, so every player would hear the soundtrack that
// much late. The lead-in differs by platform encoder, so it is measured: a click at a known sample, encoded and decoded
// back. Opus carries its pre-skip in the file and needs none.
async function primingOf(codec) {
  if (codec !== 'mp4a.40.2' || typeof AudioDecoder !== 'function') return 0;
  const AT = 9600, n = SR / 2, L = new Float32Array(n), R = new Float32Array(n);
  L[AT] = R[AT] = 0.9;
  const chunks = [];
  let config = null;
  const enc = new AudioEncoder({ output: (c, meta) => { chunks.push(c); if (meta && meta.decoderConfig) config = meta.decoderConfig; }, error: (e) => log('the priming probe would not encode', e) });
  enc.configure({ codec, sampleRate: SR, numberOfChannels: 2, bitrate: BITRATE });
  feed(enc, L, R);
  await enc.flush();
  enc.close();
  if (!config || !chunks.length) return 0;
  const out = [];
  const dec = new AudioDecoder({ output: (a) => { const d = new Float32Array(a.numberOfFrames); a.copyTo(d, { planeIndex: 0, format: 'f32-planar' }); out.push(d); a.close(); }, error: (e) => log('the priming probe would not decode', e) });
  dec.configure(config);
  for (const c of chunks) dec.decode(c);
  await dec.flush();
  dec.close();
  let i = 0, at = -1, best = 0;
  for (const d of out) for (let k = 0; k < d.length; k++, i++) if (Math.abs(d[k]) > best) { best = Math.abs(d[k]); at = i; }
  const lead = at - AT;
  return lead > 0 && lead < SR / 4 ? lead : 0;
}

// the recorded track into the muxer; returns the priming trimmed, in samples
export async function encodeSound(muxer, codec, { L, R }) {
  const lead = await primingOf(codec);
  const enc = new AudioEncoder({ output: (chunk, meta) => muxer.addAudioChunk(chunk, meta), error: (e) => log('the audio encoder failed', e) });
  enc.configure({ codec, sampleRate: SR, numberOfChannels: 2, bitrate: BITRATE });
  // fed `lead` samples in, with that much silence after, so what a player hears lines up from the first frame and runs the
  // whole length
  const n = L.length, L2 = new Float32Array(n), R2 = new Float32Array(n);
  L2.set(L.subarray(lead)); R2.set(R.subarray(lead));
  feed(enc, L2, R2);
  await enc.flush();
  enc.close();
  return lead;
}
