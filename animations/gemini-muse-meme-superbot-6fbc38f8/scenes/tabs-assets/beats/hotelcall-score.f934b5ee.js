// The hotelcall variant's sound (beats/hotelcall.f934b5ee.js hands it the cue sheet). One offline pass renders the whole
// spot into a buffer, which the player keeps on the spot's clock as the multicat score's player does
// (multicat-player.96834de7.js), through the sound gate's AudioContext and its mute (sound.96834de7.js):
//   - the bed, in the multicat score's palette (multicat-voices.96834de7.js), B major: the home chord, airy, under the empty
//     state and the ask, then a short lift on V from the send into the dial, its 16ths locked to the dial so the last one
//     falls a 16th before the first ring, the pad fading under it; the call plays alone, as the multicat song does; from
//     the hang-up the home chord comes back, quiet, and carries the reservation card into the end card.
//   - the effects: key ticks while the ask types, a knock on the send, air as the composer drops and as each card rises,
//     a glassy tick on the "Done." line, a soft bell as the new dates land, and on the end card the swell, the pop, a
//     Bmaj9 bloom and a bell on the wordmark.
//   - the call itself (media/hotelcall.f934b5ee/call.mp3), decoded and laid in from the dial at its own -16 LUFS.
// The bed is brought to TARGET, under the call, and the sum limited under CEIL (multicat-finish.96834de7.js).
import * as Voices from './multicat-voices.96834de7.js';
import { loudness, gain, limit, peak } from './multicat-finish.96834de7.js';
import { sound } from '../../../sound.96834de7.js?v=2';

const SR = 48000, STEP = 0.5 / 4; // the multicat bed's 120 BPM, in 16ths
const TARGET = -18.5; // LUFS of the bed over the ask, 2.5 dB under the call's -16
const CEIL = 10 ** (-1.2 / 20);
const TAIL = 2.2; // past the end card's last frame, so the bell rings out
const DRIFT = 0.06;
const SEG = 0.5; // voices are built a slice ahead of the render (multicat-score.96834de7.js renderPiece)

const PITCH = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const hz = (name) => {
  const [, l, s, o] = /^([A-G])(#?)(\d)$/.exec(name);
  return 440 * 2 ** ((PITCH[l] + (s ? 1 : 0) + (+o + 1) * 12 - 69) / 12);
};
const notes = (s) => s.split(' ').map(hz);
const down = (fs) => fs.map((f) => f / 2);
// the multicat score's I and V voicings (V opening sus4, resolving to its third)
const I = notes('D#4 F#4 A#4 C#5'), V = notes('C#4 E4 F#4 B4'), V3 = notes('C#4 E4 F#4 A#4');

function arrange(v, m, c) {
  const last = c.dial - STEP;
  v.pad(m, 0.1, c.send + 0.3, down(I), 0.07, 1500, 1.6, 0.4);
  v.pad(m, c.send, c.dial - 0.05, down(V), 0.04, 1800, 0.2, 0.35);
  for (let n = Math.ceil((c.send - c.dial) / STEP); n <= -1; n++) {
    const t = c.dial + n * STEP, p = Math.max(0, (t - c.send) / (last - c.send));
    v.pluck(m, t, p > 0.5 ? V3 : V, 0.35 + 0.5 * p, 0.14, 900 + 2600 * p);
  }
  v.riser(m, c.send, last + 0.04, 0.06, 350, 6500);
  // after the call: the home chord again, quiet, from just past the hang-up into the end card's swell
  v.pad(m, c.hang + 0.15, c.cover + 0.3, down(I), 0.045, 1400, 0.9, 0.5);

  // typing: a tick every other character, the space bar lower and duller (multicat-score.96834de7.js effects)
  const r = m.rnd;
  for (const { text, s, end } of c.typing) {
    for (let i = 1; i <= text.length; i++) {
      const space = text[i - 1] === ' ';
      if (!space && i % 2 === 0) continue;
      const t = s + ((i - 0.5) / text.length) * (end - s) + (r() - 0.5) * 0.008;
      v.tick(m, t, space
        ? { freq: 1900, level: 0.03, q: 1.6, len: 0.012, body: 120, at: (r() - 0.5) * 0.2 }
        : { freq: 2600 + r() * 1200, level: 0.022 + r() * 0.012, q: 2.2, len: 0.009, body: 150 + r() * 40, at: (r() - 0.5) * 0.2 });
    }
  }
  v.tock(m, c.send, 0.09);
  v.whoosh(m, c.send - 0.1, 0.8, 0.05, 350, 1800); // the send drops the composer and pulls the camera out
  for (const t of c.cards) v.whoosh(m, t, 0.45, 0.022, 900, 3200);
  v.done(m, c.done, 0.03);
  v.bell(m, c.swap, notes('B5 F#6'), 0.045);
  // the end card, about 3 dB under the multicat sting: here it comes out of a quiet pad, not the song
  v.riser(m, c.cover, c.pop, 0.026, 1500, 7000);
  v.impact(m, c.pop, 0.32, 1.3);
  v.bloom(m, c.pop, notes('B2 F#3 A#3 C#4 D#4 F#4'), 0.036);
  v.whoosh(m, c.word - 0.05, 1.0, 0.014, 2500, 9000);
  v.bell(m, c.word + 0.12, notes('F#5 B5'), 0.028, 0.09);
}

const recorder = (calls) => new Proxy({}, { get: (_, name) => (m, t, ...args) => { calls.push([t, name, args]); } });

// the cue sheet and the call's URL into a limited stereo buffer: { buffer, stats }
async function render(c, callUrl) {
  const t0 = performance.now();
  const callBytes = fetch(callUrl).then((res) => {
    if (!res.ok) throw new Error(`hotelcall: the call track answered ${res.status}: ${callUrl}`);
    return res.arrayBuffer();
  });
  const length = Math.ceil((c.end + TAIL) * SR);
  const calls = [];
  arrange(recorder(calls), { rnd: Voices.seeded(0xf934) }, c);
  calls.sort((a, b) => a[0] - b[0]);
  const ctx = new OfflineAudioContext({ numberOfChannels: 2, length, sampleRate: SR });
  const m = Voices.makeMix(ctx, 0xf934);
  Voices.applyDucks(m, calls.filter(([, name]) => Voices.DUCKS[name]).map(([t, name, args]) => [t, ...Voices.DUCKS[name](...args)]));
  // the reverbs close over the first ring (the line brings its own room; the lift's tail rings into it) and open again
  // as the call hangs up
  for (const [back, level] of m.returns) {
    back.gain.setValueAtTime(level, c.dial);
    back.gain.linearRampToValueAtTime(0, c.dial + 0.6);
    back.gain.setValueAtTime(0, c.hang);
    back.gain.linearRampToValueAtTime(level, c.hang + 0.3);
  }
  let next = 0;
  const build = (until) => {
    for (; next < calls.length && calls[next][0] < until; next++) {
      const [t, name, args] = calls[next];
      Voices[name](m, t, ...args);
    }
  };
  build(SEG);
  for (let at = SEG; at < length / SR - 0.05; at += SEG) {
    const until = at + SEG;
    ctx.suspend(at).then(() => { build(until); return ctx.resume(); }).catch((e) => console.error(new Error(`hotelcall score: the slice at ${at.toFixed(2)} s failed`, { cause: e })));
  }
  const buffer = await ctx.startRendering();
  const raw = loudness(buffer, 0, c.dial);
  gain(buffer, 10 ** ((TARGET - raw) / 20));
  const call = await new OfflineAudioContext({ numberOfChannels: 1, length: 1, sampleRate: SR }).decodeAudioData(await callBytes);
  const at = Math.round(c.dial * SR), src = call.getChannelData(0), n = Math.min(src.length, length - at);
  for (let ch = 0; ch < 2; ch++) {
    const dst = buffer.getChannelData(ch);
    for (let i = 0; i < n; i++) dst[at + i] += src[i];
  }
  const reduction = limit(buffer, CEIL);
  return { buffer, stats: { renderMs: Math.round(performance.now() - t0), bedLufs: +loudness(buffer, 0, c.dial).toFixed(2), callLufs: +loudness(buffer, c.dial, c.dial + call.duration).toFixed(2), limiterDb: +reduction.toFixed(2), peakDb: +(20 * Math.log10(peak(buffer))).toFixed(2), seconds: buffer.duration } };
}

// the player: renders on the variant's first frame (no gesture needed), then each frame checks the buffer is where the
// clock says. Running (window.__AD.playing) it plays from the clock's t at the clock's speed, starting over (a 10 ms fade)
// when it drifts 60 ms, the speed changes or the clock seeks; paused, stepped or frozen it stops; once the run has ended
// it lets the tail ring. Nothing plays until the sound gate has an AudioContext running
export function makeSound(cues, callUrl) {
  let job = null, buffer = null, failed = false, src = null, fade = null, startedAt = 0, from = 0, rate = 1;

  function prepare() {
    if (job) return;
    job = render(cues, callUrl).then((r) => {
      buffer = r.buffer;
      window.__HC_SOUND = { ...r.stats, cues, buffer }; // QA: the render's loudness and limiter, its cues and audio
    }).catch((e) => { failed = true; console.error(new Error('hotelcall: the call and its score failed to render', { cause: e })); });
  }

  function stop() {
    if (!src) return;
    const now = sound.ctx.currentTime;
    fade.gain.setTargetAtTime(0, now, 0.003);
    src.stop(now + 0.03);
    src = fade = null;
  }

  function start(at, r) {
    const ctx = sound.ctx, now = ctx.currentTime;
    src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = r;
    fade = ctx.createGain();
    fade.gain.setValueAtTime(0, now);
    fade.gain.linearRampToValueAtTime(1, now + 0.01);
    src.connect(fade).connect(sound.out);
    src.start(now, at);
    startedAt = now; from = at; rate = r;
  }

  return {
    stop,
    // the rendered soundtrack for the Export button (export.34c23b1d.js, rendering through export.64039673.js): renders it now if it has not yet
    audio() {
      prepare();
      return job.then(() => { if (!buffer) throw new Error('hotelcall: the soundtrack did not render'); return buffer; });
    },
    ready: () => !!buffer || failed,
    sounding: () => !!src && !!sound.ctx && sound.ctx.state === 'running' && !sound.muted,
    sync(t) {
      prepare();
      const ad = window.__AD, ctx = sound.ctx;
      if (!buffer || !ctx || ctx.state !== 'running' || document.body.classList.contains('freeze')) { if (src && ctx) stop(); return; }
      if (!ad || !ad.playing) {
        if (!(ad && t >= ad.CYCLE - 1e-3)) stop();
        return;
      }
      const r = ad.speed || 1;
      const want = t + ((ctx.outputLatency || 0) + (ctx.baseLatency || 0)) * r;
      if (want >= buffer.duration) { stop(); return; }
      const at = src ? from + (ctx.currentTime - startedAt) * rate : -1;
      if (!src || r !== rate || Math.abs(at - want) > DRIFT) { stop(); start(want, r); }
    },
  };
}
