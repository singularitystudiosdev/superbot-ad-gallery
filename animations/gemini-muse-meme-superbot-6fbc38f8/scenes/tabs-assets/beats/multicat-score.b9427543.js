// The multicat variant's score (multicat.516afb1a.js plays it through multicat-sound.b9427543.js): sound design on every
// UI event and a music bed under them, rendered offline into one stereo buffer laid on the spot's clock (t = 0 is the
// buffer's first sample). Every time comes from the beat's own plan, so the cues move if the beat's timing does.
//   The bed: B major at 120 bpm, the key and tempo of the ElevenLabs song the spot ends on (tiny-chaos.mp3: B major,
//   kick every 0.501 s from 0.040 s, measured). Its bar grid is anchored on the song's first beat and runs back from
//   there, so its last bar is the V chord (F#) and the song's tonic answers it. IV-I-vi-V, a pluck motif, a soft
//   four-on-the-floor; it clears out for the song and returns only as the end card's chord.
//   The SFX: key ticks, send, routing chip in and resolved, the fast-forward riser under each x50 generation, a reveal
//   as each answer lands, the order's confirm, the play press, and the end card's hit. Every pitched cue takes its notes
//   from the chord under it.
import { makeKit, mtof } from './multicat-synth.b9427543.js';

export const BPM = 120;
const BEAT = 60 / BPM, BAR = 4 * BEAT, SIX = BEAT / 4;
export const SONG_BEAT1 = 0.04; // the song's first kick, from the top of tiny-chaos.mp3
const RATE = 48000, SEED = 0x6d756c74;

// linear peak levels before the master chain; the bed's sum rides `bed`. Balanced by measurement (bed and SFX stems
// against the song): the bed sits about 7 LU under the song, every SFX clears the bed at its moment
const MIX = {
  bed: 0.48, kick: 0.17, hat: 0.2, ohat: 0.09, shaker: 0.06, clap: 0.09, pad: 0.035, bass: 0.038, pluck: 0.085,
  key: 0.12, send: 0.075, chip: 0.06, chime: 0.09, riser: 0.09, tick: 0.045, thump: 0.22, glassHit: 0.06, click: 0.14,
  end: 0.32, air: 0.016, whoosh: 0.07,
};
const VOICES = ['noiseHit', 'swell', 'tone', 'glass', 'thump', 'kick', 'clap', 'hat', 'shaker', 'pad', 'bass'];
const AHEAD = 0.5; // voices are built this far ahead of the render head, a window at a time

// MIDI voicings: `pad` the held chord, `tones` the chord tones the plucks and chimes pick from, `res` V's resolution
const CHORDS = {
  I: { root: 35, pad: [54, 59, 61, 63, 66], tones: [71, 73, 75, 78] },
  IV: { root: 40, pad: [52, 56, 59, 63, 66], tones: [68, 71, 75, 78] },
  vi: { root: 44, pad: [56, 59, 63, 66, 70], tones: [68, 71, 75, 80] },
  V: { root: 42, pad: [54, 59, 61, 64], res: [54, 58, 61, 64], tones: [66, 70, 73, 78] },
};
// the progression read back from the song's downbeat: the last bar is V, the one before it IV, then V vi I IV repeating
const BACK = ['V', 'IV', 'V', 'vi', 'I', 'IV'];
const backAt = (i) => (i < 2 ? BACK[i] : BACK[2 + ((i - 2) % 4)]);

// every cue time, from the beat's plan T (multicat.516afb1a.js) and the first ask the engine types (chat.9b47fc30.js)
export function cueSheet({ first, T, endDelay, endLen }) {
  const S = T.steps.find((st) => st.kind === 'song'), O = T.steps.find((st) => st.kind === 'order');
  const asks = [first, ...T.steps.map((st) => ({ text: st.ask, s: st.s, typeEnd: st.typeEnd, send: st.send }))];
  const A = S.play + SONG_BEAT1;
  // the groove starts on the first bar line no earlier than just before the first send (the composer's drop)
  const bars = Math.floor((A - (first.send - 0.25)) / BAR);
  const pop = S.cut + endDelay;
  return {
    asks,
    chips: [...first.chips, ...T.steps.flatMap((st) => st.chips)],
    gens: [{ kind: 'image', g0: T.gen0, done: T.done }, ...T.steps.filter((st) => st.gen).map((st) => ({ kind: st.kind, g0: st.gen0, done: st.done }))],
    order: { card: O.card, done: O.done },
    play: S.play, cut: S.cut, pop, word: pop + 0.3, end: pop + endLen + 0.8,
    grid: { A, bars, start: A - bars * BAR },
  };
}

// the chord under t: the groove's bars, I before them (the intro) and after the handoff (the song's key, the end card)
function chordAt(c, t) {
  const { A, start, bars } = c.grid;
  if (t < start || t >= A) return CHORDS.I;
  return CHORDS[backAt(bars - 1 - Math.floor((t - start) / BAR))];
}

// ---------- the bed ----------
const MOTIF = [[0, 0, 1], [3, 2, 0.7], [6, 1, 0.8], [8, 3, 0.9], [11, 2, 0.7], [14, 1, 0.75]]; // [16th, tone, gain]
const BASSLINE = [[0, 0.62], [0.75, 0.22], [1, 0.62], [1.75, 0.2]]; // [seconds into the bar, length]

function bedBar(kit, c, j, t0, name) {
  const ch = CHORDS[name], last = j === c.grid.bars - 1, B = kit.B, end = c.grid.A - 0.14;
  const drums = (b) => !(last && b >= 2);
  // pad: V holds its sus4 for two beats, then resolves
  if (ch.res) {
    kit.pad(t0, { notes: ch.pad, len: 2 * BEAT, gain: MIX.pad, c0: 1400, c1: 2600, a: 0.05, rel: 0.08 });
    kit.pad(t0 + 2 * BEAT, { notes: ch.res, len: 2 * BEAT, gain: MIX.pad, c0: 2600, c1: 3200, a: 0.03, rel: 0.25, cut: last ? end : 0 });
  } else kit.pad(t0, { notes: ch.pad, len: BAR, gain: MIX.pad, c0: 1200, c1: 3200, a: 0.06, rel: 0.25 });
  BASSLINE.forEach(([at, len]) => { if (!last || at < 1.5) kit.bass(t0 + at, { m: ch.root, len, gain: MIX.bass }); });
  for (let b = 0; b < 4; b++) {
    const tb = t0 + b * BEAT;
    if (!drums(b)) continue;
    kit.kick(tb, MIX.kick);
    kit.hat(tb + BEAT / 2, MIX.hat * (b % 2 ? 1 : 0.8));
    if (b === 3 && j % 2) kit.hat(tb + BEAT / 2, MIX.ohat, 0.11, -0.1);
    if (j >= 2 && b % 2) kit.clap(tb, MIX.clap, 0.04);
    if (j >= 2) for (let s = 0; s < 4; s++) if (s !== 2) kit.shaker(tb + s * SIX, MIX.shaker * (s % 2 ? 1 : 0.55));
  }
  // the pluck motif, with an octave sparkle once the model has landed (the back half)
  MOTIF.forEach(([s, i, g]) => {
    if (last && s >= 8) return;
    kit.glass(t0 + s * SIX, { m: ch.tones[i], gain: MIX.pluck * g, d: 0.32, ratio: 2, index: 1.6, bloom: 0.09, out: B.duck, pan: (i - 1.5) * 0.18, rvb: 0.12, dly: 0.28 });
    if (j >= 4 && (s === 0 || s === 8)) kit.glass(t0 + s * SIX + SIX / 2, { m: ch.tones[3] + 12, gain: MIX.pluck * 0.45, d: 0.4, ratio: 3, index: 0.7, out: B.duck, pan: 0.3, rvb: 0.25, dly: 0.35 });
  });
}

function bed(kit, c) {
  const { start, bars, A } = c.grid, B = kit.B;
  // intro: the I chord swells in with the scene, the motif dark and quiet under the first ask
  kit.pad(0.2, { notes: CHORDS.I.pad, len: start - 0.2, gain: MIX.pad * 1.1, c0: 600, c1: 2400, a: 1.2, rel: 0.3 });
  kit.bass(start - BAR, { m: CHORDS.I.root, len: BAR, gain: MIX.bass * 0.35 });
  MOTIF.forEach(([s, i, g]) => kit.glass(start - BAR + s * SIX, { m: CHORDS.I.tones[i], gain: MIX.pluck * g * 0.8, d: 0.3, ratio: 2, index: 0.5, bloom: 0.06, out: B.duck, pan: (i - 1.5) * 0.18, rvb: 0.15, dly: 0.3 }));
  for (let j = 0; j < bars; j++) bedBar(kit, c, j, start + j * BAR, backAt(bars - 1 - j));
  // the handoff: the bed's reverb and delay returns close with it, so no tail sits under the song
  [B.bedVerb.ret.gain, B.delayRet.gain].forEach((p) => { p.setValueAtTime(1, A - 0.2); p.linearRampToValueAtTime(0, A - 0.06); });
}

// the kick sidechain on pad and bass, and the SFX sidechain on the whole bed, as gain curves at 200 Hz
function sidechains(kit, c, dur, ducks) {
  const n = Math.ceil(dur * 200), pump = new Float32Array(n), duck = new Float32Array(n);
  const kicks = [];
  for (let j = 0; j < c.grid.bars; j++) for (let b = 0; b < 4; b++) if (!(j === c.grid.bars - 1 && b >= 2)) kicks.push(c.grid.start + j * BAR + b * BEAT);
  let k = 0, g = 1;
  for (let i = 0; i < n; i++) {
    const t = i / 200;
    while (k + 1 < kicks.length && kicks[k + 1] <= t) k++;
    const dt = kicks.length && t >= kicks[k] ? t - kicks[k] : 1e9;
    pump[i] = 1 - 0.45 * Math.exp(-dt / 0.085);
    // the deepest duck active at t, then a fast attack and a slow release toward it
    let target = 1;
    for (const d of ducks) if (t >= d.t - 0.015 && t <= d.t + d.hold) target = Math.min(target, d.depth);
    g += (target - g) * (target < g ? 0.55 : 0.022);
    duck[i] = g;
  }
  // points exactly 5 ms apart
  kit.B.pump.gain.setValueCurveAtTime(pump, 0, (n - 1) / 200);
  kit.B.duck.gain.setValueCurveAtTime(duck, 0, (n - 1) / 200);
}

// ---------- the SFX ----------
function typing(kit, a) {
  const { rnd, B } = kit, n = a.text.length, span = a.typeEnd - a.s;
  let next = -1;
  for (let i = 1; i <= n; i++) {
    // char i shows when round(n * progress) reaches it (chat.9b47fc30.js renderComposer); its key lands just before
    const t = a.s + ((i - 0.5) / n) * span - 0.004;
    if (t < next) continue;
    next = t + 0.042 + rnd() * 0.035;
    const space = a.text[i - 1] === ' ', v = 0.7 + rnd() * 0.3;
    kit.noiseHit(t, { type: 'bandpass', f: space ? 2000 : 3000 + rnd() * 1600, q: 2, a: 0.0005, d: 0.011 + rnd() * 0.006, gain: MIX.key * v, pan: (rnd() - 0.5) * 0.3, out: B.sfx });
    kit.tone(t, { f: space ? 170 : 225 + rnd() * 45, d: 0.018, gain: MIX.key * 0.55 * v, out: B.sfx });
  }
}

function send(kit, t, first) {
  const out = kit.B.sfx;
  // the press (the button's dip peaks just after `send`), then the bubble lifting into the thread
  kit.noiseHit(t - 0.02, { type: 'highpass', f: 2500, d: 0.005, gain: MIX.send * 1.3, out });
  kit.tone(t - 0.02, { f: mtof(90), d: 0.08, gain: MIX.send * 0.7, out, rvb: 0.15 });
  kit.swell(t - 0.02, t + 0.15, { f0: 900, f1: 4200, q: 1.4, gain: MIX.send * 0.8, rel: 0.18, pan0: -0.15, pan1: 0.2, out, rvb: 0.2 });
  // the first send also drops the composer and eases the camera out
  if (first) kit.swell(t - 0.1, t + 0.16, { type: 'lowpass', f0: 3200, f1: 600, q: 0.7, gain: MIX.send * 1.2, rel: 0.45, out, rvb: 0.25 });
}

function chip(kit, c, ch) {
  const out = kit.B.sfx, at = ch.sw + 0.05, tones = chordAt(c, ch.done).tones;
  // the chip's tile pops in, then its check resolves with two chord tones
  kit.tone(at, { f: 2350, f1: 1750, glide: 0.03, d: 0.045, gain: MIX.chip, out, pan: -0.1 });
  kit.noiseHit(at, { type: 'highpass', f: 5000, d: 0.004, gain: MIX.chip * 0.6, out });
  kit.glass(ch.done, { m: tones[1] + 12, gain: MIX.chime, d: 0.45, ratio: 3, index: 0.8, bloom: 0.08, out, rvb: 0.25, pan: 0.1 });
  kit.glass(ch.done + 0.055, { m: tones[3] + 12, gain: MIX.chime * 0.85, d: 0.55, ratio: 3, index: 0.8, bloom: 0.08, out, rvb: 0.3, pan: -0.1 });
}

function generate(kit, g) {
  const out = kit.B.sfx, t0 = g.g0 - 0.2, t1 = g.done - 0.012, len = t1 - t0;
  // the x50 badge's fast-forward: a rising band of air and the timer's ticks accelerating, both cut just before the reveal
  kit.swell(t0, t1, { f0: 600, f1: 6500, q: 2.2, gain: MIX.riser, rel: 0.01, pan0: -0.25, pan1: 0.25, out, rvb: 0.12 });
  for (let t = t0 + 0.05; t < t1 - 0.02;) {
    const p = (t - t0) / len;
    kit.noiseHit(t, { type: 'bandpass', f: 4200 + 2000 * p, q: 3, a: 0.0005, d: 0.006, gain: MIX.tick * (0.6 + 0.4 * p), out, pan: (p - 0.5) * 0.4 });
    t += 1 / (14 + 18 * p);
  }
}

function reveal(kit, c, t, kind) {
  const out = kit.B.sfx, big = kind === 'model', k = big ? 1.2 : kind === 'song' ? 0.55 : 1, tones = chordAt(c, t).tones;
  kit.thump(t, { gain: MIX.thump * k, d: big ? 0.45 : 0.32 });
  kit.noiseHit(t, { type: 'highpass', f: 4500, a: 0.0008, d: 0.03, gain: 0.08 * k, out, rvb: 0.2 });
  tones.slice(1).forEach((m, i) => kit.glass(t + i * 0.012, { m: m + 12, gain: MIX.glassHit * k, d: big ? 1.4 : 1.0, ratio: 3, index: 0.9, bloom: 0.1, out, rvb: 0.4, pan: (i - 1) * 0.25 }));
  kit.noiseHit(t + 0.01, { type: 'highpass', f: 9000, a: 0.01, d: 0.35, gain: 0.018 * k, out, rvb: 0.3 });
  if (big) kit.pad(t, { notes: chordAt(c, t).pad, len: 0.45, gain: 0.018, c0: 2200, c1: 900, a: 0.005, rel: 0.6, out, rvb: 0.4, verbIn: kit.B.sfxVerb.in });
}

function order(kit, c, o) {
  const out = kit.B.sfx, tones = chordAt(c, o.done).tones;
  kit.swell(o.card - 0.05, o.card + 0.12, { f0: 1200, f1: 3500, q: 1, gain: MIX.whoosh, rel: 0.2, out, rvb: 0.15 });
  kit.thump(o.done, { f0: 120, f1: 60, gain: MIX.thump * 0.5, d: 0.2 });
  kit.noiseHit(o.done, { type: 'highpass', f: 5000, d: 0.02, gain: 0.05, out });
  kit.glass(o.done, { m: tones[2] + 12, gain: MIX.chime * 1.1, d: 0.5, ratio: 3, index: 0.8, out, rvb: 0.3, pan: -0.12 });
  kit.glass(o.done + 0.085, { m: tones[3] + 12, gain: MIX.chime * 1.1, d: 0.9, ratio: 3, index: 0.8, out, rvb: 0.35, pan: 0.12 });
}

function playPress(kit, t) {
  const out = kit.B.sfx;
  kit.noiseHit(t - 0.09, { type: 'bandpass', f: 2600, q: 1.2, d: 0.006, gain: MIX.click, out });
  kit.tone(t - 0.09, { f: 820, d: 0.02, gain: MIX.click * 0.5, out });
  kit.noiseHit(t + 0.005, { type: 'bandpass', f: 4200, q: 1.2, d: 0.004, gain: MIX.click * 0.65, out });
}

function endCard(kit, e) {
  const B = kit.B, out = B.sfx;
  // the chat fades to black: a band of air pulling down into the mascot's pop
  kit.swell(e.cut, e.pop - 0.01, { f0: 5200, f1: 900, q: 0.9, gain: 0.05, rel: 0.02, out, rvb: 0.3 });
  kit.thump(e.pop, { f0: 95, f1: 41, gain: MIX.end, d: 0.7 });
  kit.noiseHit(e.pop, { type: 'highpass', f: 3800, d: 0.04, gain: 0.07, out, rvb: 0.4 });
  [83, 87, 90, 85].forEach((m, i) => kit.glass(e.pop + i * 0.016, { m, gain: 0.04, d: 2.2, ratio: 3, index: 0.8, bloom: 0.2, out, rvb: 0.5, pan: [-0.3, 0.1, 0.3, -0.1][i] }));
  // the closing chord: B add9 under the lockup, gone before the clock's last frame
  kit.pad(e.pop, { notes: [47, 54, 59, 61, 63, 66], len: e.end - e.pop - 1.3, gain: 0.016, c0: 2600, c1: 900, a: 0.015, rel: 1.0, out, rvb: 0.4, verbIn: B.sfxVerb.in });
  kit.bass(e.pop, { m: CHORDS.I.root, len: 1.4, gain: MIX.bass * 0.8 });
  // the wordmark's blur-in
  kit.swell(e.word, e.word + 0.45, { type: 'highpass', f0: 6000, f1: 9000, q: 0.5, gain: MIX.air, rel: 0.9, out, rvb: 0.3 });
}

// render the score: resolves to { buffer, peak } with the buffer starting at the spot's t = 0. `stem` ('bed' or 'sfx')
// renders that half alone, for QA. Two renders can differ in the first milliseconds of a pluck built mid-render (Chrome
// applies a graph change made during a suspend a render quantum early or late): one render is one consistent score, but
// never splice two together
export async function renderScore(c, stem = '') {
  const dur = c.end + 0.2;
  const ac = new OfflineAudioContext({ numberOfChannels: 2, length: Math.ceil(dur * RATE), sampleRate: RATE });
  const real = makeKit(ac, SEED);
  real.B.bedOut.gain.value = stem === 'sfx' ? 0 : MIX.bed;
  if (stem === 'bed') { real.B.sfx.gain.value = 0; real.B.sfxVerb.ret.gain.value = 0; }
  // the score is written against a kit that only queues each voice; the queue is built a window ahead of the render
  // head (OfflineAudioContext.suspend), so the graph holds the next second's nodes, not the whole spot's thousands
  const queue = [], kit = { ...real };
  VOICES.forEach((name) => { kit[name] = (t, ...args) => queue.push([t, () => real[name](t, ...args)]); });
  bed(kit, c);
  c.asks.forEach((a) => typing(kit, a));
  c.asks.forEach((a, i) => send(kit, a.send, i === 0));
  c.chips.forEach((ch) => chip(kit, c, ch));
  c.gens.forEach((g) => { generate(kit, g); reveal(kit, c, g.done, g.kind); });
  order(kit, c, c.order);
  playPress(kit, c.play);
  endCard(kit, c);
  queue.sort((x, y) => x[0] - y[0]);
  let next = 0;
  const build = (until) => { while (next < queue.length && queue[next][0] < until) queue[next++][1](); };
  build(2 * AHEAD);
  for (let s = AHEAD; s < dur - AHEAD; s += AHEAD) {
    ac.suspend(s).then(() => { build(s + 2 * AHEAD); return ac.resume(); })
      .catch((e) => { console.error(new Error(`multicat score: building voices at ${s}s failed`, { cause: e })); throw e; });
  }
  const ducks = [
    ...c.asks.map((a) => ({ t: a.s, hold: a.typeEnd - a.s, depth: 0.8 })),
    ...c.asks.map((a) => ({ t: a.send - 0.02, hold: 0.2, depth: 0.75 })),
    ...c.chips.map((ch) => ({ t: ch.done, hold: 0.25, depth: 0.72 })),
    ...c.gens.flatMap((g) => [{ t: g.g0 - 0.2, hold: g.done - g.g0 + 0.2, depth: 0.82 }, { t: g.done, hold: 0.3, depth: 0.5 }]),
    { t: c.order.done, hold: 0.3, depth: 0.6 },
  ];
  sidechains(kit, c, dur, ducks);
  const buffer = await ac.startRendering();
  let peak = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) { const d = buffer.getChannelData(ch); for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > peak) peak = v; } }
  return { buffer, peak };
}
