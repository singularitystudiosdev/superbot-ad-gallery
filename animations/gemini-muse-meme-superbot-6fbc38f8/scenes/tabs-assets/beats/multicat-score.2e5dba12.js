// The multicat variant's soundtrack (beats/multicat-sound.2e5dba12.js plays it): a music bed in the song's own style and
// key, and a sound effect on every beat of the chat, all timed off the beat's own clock (multicat.516afb1a.js plan, the
// engine's typing and chips in chat.9b47fc30.js), rendered offline into one buffer that starts at the spot's t = 0.
//   The bed: "Tiny Chaos" (media/multicat.516afb1a/tiny-chaos.mp3) is upbeat indie pop at 120 bpm in B major (measured:
//   its low band peaks every 0.5 s from 0.0625 s; its chroma fits B major at 0.92), so the bed is the same band in the
//   same key on the same grid: kick, handclaps, shaker, bouncy bass and strummed guitar, a music-box intro, a glockenspiel
//   hook while the 3D cat walks. Its bars are laid back from the song's first kick, so the last one stops a beat and a
//   half early and the song's own downbeat lands where the next would.
//   The effects: key clicks under the typing, a bubble on each send, a blip as each routing chip lands and a ding as it
//   resolves, a rising fast-forward under each x50 wait, a sparkle and a cat on each landing, kibble and a ding for the
//   order, the play press, and a sting with a purr-trill for the end card's mascot. The music ducks under the louder
//   ones and dulls under the fast-forward waits.
import * as V from './multicat-synth.2e5dba12.js';

export const SR = 44100;
export const BEAT = 0.5, BAR = 4 * BEAT, EIGHTH = BEAT / 2;
export const SONG_ONE = 0.0625; // the song's first kick, into the track
const TAIL = 3;                 // seconds rendered past the end card's mascot pop: the sting's ring
const TARGET_RMS = 0.1;         // the bed at -20 dBFS RMS, a few dB under the song so the track lands as a lift
const PEAK = 0.95;

// B major voicings (MIDI): guitar strings low to high, and the bass root
const CHORDS = {
  B: { gtr: [47, 54, 59, 63, 66], root: 47 },
  Fs: { gtr: [49, 54, 58, 61, 66], root: 42 },
  Gsm: { gtr: [51, 56, 59, 63, 68], root: 44 },
  E: { gtr: [47, 52, 56, 59, 64], root: 40 },
  Csm: { gtr: [49, 56, 61, 64, 68], root: 37 },
};
const LOOP = ['B', 'Fs', 'Gsm', 'E']; // I-V-vi-IV
// the bar's chord: the intro on I, the loop, then ii-V into the song's own I
const chordAt = (m, bars) => CHORDS[m === 0 ? 'B' : m === bars - 1 ? 'Fs' : m === bars - 2 ? 'Csm' : LOOP[(m - 1) % 4]];

// [eighth, up, velocity] strums and [eighth, interval, length] bass notes, per bar
const STRUMS = [[0, false, 1], [2, false, 0.8], [3, true, 0.55], [5, true, 0.55], [6, false, 0.8], [7, true, 0.5]];
const BASS = [[0, 0, 0.22], [2, 0, 0.2], [3, 12, 0.2], [5, 0, 0.2], [6, 7, 0.2], [7, 12, 0.2]];
// the intro's music box over B, and the walk's hook over F#
const INTRO = [75, 78, 83, 78, 75, 78, 83, 87];
const HOOK = [85, 82, 78, 82, 85, 0, 87, 85];

// the bars: laid back from the song's first kick in whole bars, so bar `bars` would be the song's own first
export function grid(ends) {
  const one = ends.play + SONG_ONE, bars = Math.floor(one / BAR);
  return { one, bars, b0: one - bars * BAR, stop: one - bars * BAR + (bars - 1) * BAR + 2 * BEAT };
}

// when each character of an ask appears (chat.9b47fc30.js renderComposer rounds len * progress)
const keystrokes = (text, s, typeEnd) => [...text].map((ch, i) => [s + ((i + 0.5) / text.length) * (typeEnd - s), ch === ' ']);

// every effect on the spot's clock: { t, name, beat, dur, duck (how far the music dips), hold (how long it stays down) }
export function cuesOf(k, T, ends, g) {
  const list = [];
  const add = (t, name, beat, duck = 0, hold = 0.12, dur = 0) => list.push({ t, name, beat, duck, hold, dur });
  const [M, O, S] = T.steps;
  add(0.18, 'chime', 'the greeting fades in');
  const asks = [{ text: ends.ask0, s: k.s, typeEnd: k.typeEnd, send: k.send, chips: k.chips }, ...T.steps.map((st) => ({ text: st.ask, s: st.s, typeEnd: st.typeEnd, send: st.send, chips: st.chips }))];
  asks.forEach((a, i) => {
    keystrokes(a.text, a.s, a.typeEnd).forEach(([t, space]) => add(t, space ? 'space' : 'key', `ask ${i + 1} types`));
    if (i === 0) add(a.send - 0.08, 'drop', 'the composer drops and the camera eases out', 0.2, 0.3);
    add(a.send, 'send', `ask ${i + 1} is sent`, 0.15);
    a.chips.forEach((ch, j) => {
      add(ch.sw, 'chip', `ask ${i + 1} routing chip ${j + 1} lands`, 0.1);
      add(ch.done, 'check', `ask ${i + 1} routing chip ${j + 1} resolves`, 0.12);
    });
  });
  // the photo, the model and the song generate fast-forwarded, then land
  for (const [x, label] of [[T, 'the photo'], [M, 'the 3D model'], [S, 'the song']]) {
    add(x.r, 'reply', `${label}: reply streams in`, 0.1);
    add(x.card, 'card', `${label}: card rises`, 0.1);
    add(x.gen0, 'ff', `${label}: x50 generation`, 0.3, x.done - x.gen0, x.done - x.gen0);
  }
  add(T.done, 'sparkle', 'the photo lands', 0.3, 0.3);
  add(T.done + 0.12, 'mew', 'cat 1 (the photo) enters', 0.5, 0.4);
  add(M.done, 'materialize', 'the 3D model lands', 0.35, 0.3);
  add(M.done + 0.25, 'mrrow', 'cat 2 (the 3D model) enters', 0.5, 0.55);
  // the 3D cat walks the turntable on the eighth-note grid until the next ask starts to type
  for (let n = Math.ceil((M.w1 - g.b0) / EIGHTH); g.b0 + n * EIGHTH < O.s; n++) add(g.b0 + n * EIGHTH, 'paw', 'the 3D cat walks');
  // the order generates nothing: its card loads, then confirms
  add(O.r, 'reply', 'the order: reply streams in', 0.1);
  add(O.card, 'card', 'the order: card rises', 0.1);
  add(O.card + 0.1, 'kibble', 'the cat food order loads', 0.25, O.done - O.card - 0.15, O.done - O.card - 0.15);
  add(O.done, 'confirm', 'the order confirms', 0.3, 0.3);
  add(O.done + 0.18, 'meep', 'cat 3 (fed) answers', 0.45, 0.25);
  add(S.done, 'sparkle', 'the song lands', 0);
  add(S.done, 'swell', 'the breath before the song', 0, 0, g.one - S.done);
  add(S.play - 0.03, 'press', 'the play button presses');
  add(ends.pop, 'sting', 'the end card: mascot pops in');
  add(ends.pop + 0.08, 'mrrp', 'cat 4 (the mascot) trills');
  add(ends.pop + 0.3, 'shimmer', 'superbot.gg fades up');
  return list.sort((a, b) => a.t - b.t);
}

// the effects, by cue name: (ctx, out, cue, verb)
const FX = {
  chime: (c, o, q, v) => { V.glock(c, o, q.t, 83, 0.2, v); V.glock(c, o, q.t + 0.09, 90, 0.16, v); },
  key: (c, o, q) => V.tick(c, o, q.t, 0.09, false, (q.t * 7.31) % 1),
  space: (c, o, q) => V.tick(c, o, q.t, 0.11, true, 0.5),
  drop: (c, o, q) => V.whoosh(c, o, q.t, 0.5, 300, 1600, 0.8, -0.2, 0.2),
  send: (c, o, q) => { V.pop(c, o, q.t, 520, 0.28, 1.9); V.whoosh(c, o, q.t, 0.2, 900, 3500, 0.08, 0, 0.5); },
  chip: (c, o, q) => V.blip(c, o, q.t, 78, 0.18),
  check: (c, o, q, v) => { V.glock(c, o, q.t, 87, 0.13, v); V.glock(c, o, q.t + 0.07, 90, 0.13, v); },
  reply: (c, o, q) => V.pop(c, o, q.t, 700, 0.1, 1.4),
  card: (c, o, q) => V.whoosh(c, o, q.t, 0.3, 600, 2500, 0.2, -0.3, 0.3),
  ff: (c, o, q) => V.riser(c, o, q.t, q.dur, 0.3),
  sparkle: (c, o, q, v) => V.sparkle(c, o, q.t, 83, 0.15, v),
  mew: (c, o, q, v) => V.meow(c, o, q.t, 'mew', 0.5, -0.15, v),
  materialize: (c, o, q, v) => { V.boom(c, o, q.t, 0.35); V.sparkle(c, o, q.t, 78, 0.13, v); },
  mrrow: (c, o, q, v) => V.meow(c, o, q.t, 'mrrow', 0.5, 0.15, v),
  paw: (c, o, q) => V.paw(c, o, q.t, 0.07, Math.round(q.t / EIGHTH) % 2 ? 0.3 : -0.3), // left, right, left
  kibble: (c, o, q) => V.kibble(c, o, q.t, q.dur, 0.4),
  confirm: (c, o, q, v) => { V.glock(c, o, q.t, 90, 0.2, v); V.glock(c, o, q.t + 0.08, 95, 0.2, v); },
  meep: (c, o, q, v) => V.meow(c, o, q.t, 'meep', 0.45, 0, v),
  swell: (c, o, q) => V.swell(c, o, q.t, q.dur, 0.06),
  press: (c, o, q) => V.click(c, o, q.t, 0.22),
  sting: (c, o, q, v) => {
    V.pop(c, o, q.t, 300, 0.35, 2.2);
    V.boom(c, o, q.t, 0.4);
    V.strum(c, o, q.t + 0.02, [47, 54, 61, 63, 66, 71], false, 0.26, 1.8);
    V.sparkle(c, o, q.t + 0.05, 83, 0.17, v);
  },
  mrrp: (c, o, q, v) => V.meow(c, o, q.t, 'mrrp', 0.5, 0.1, v),
  shimmer: (c, o, q) => V.whoosh(c, o, q.t, 0.9, 2000, 9000, 0.05, -0.2, 0.2),
};

// one bar of the bed at `at`
function playBar(ctx, bus, m, at, g, walkBar) {
  const { out, gtr, verb } = bus, ch = chordAt(m, g.bars), last = m === g.bars - 1, e8 = (n) => at + n * EIGHTH;
  if (m === 0) {
    V.pad(ctx, out, at, BAR - 0.1, [59, 63, 66], 0.03);
    INTRO.forEach((n, i) => V.glock(ctx, out, e8(i), n, 0.05 + i * 0.006, verb));
    return;
  }
  const upTo = last ? 4 : 8; // the last bar stops on its third beat
  STRUMS.filter(([n]) => n < upTo).forEach(([n, up, v], i, all) => V.strum(ctx, gtr, e8(n), ch.gtr, up, v * 0.2, ((all[i + 1] ? all[i + 1][0] : upTo) - n) * EIGHTH + 0.02));
  BASS.filter(([n]) => n < upTo).forEach(([n, iv, len]) => V.bass(ctx, out, e8(n), ch.root + iv, len, 0.3));
  for (let b = 0; b < upTo / 2; b++) V.kick(ctx, out, at + b * BEAT, 0.55);
  for (const b of [1, 3]) if (b * 2 < upTo) V.clap(ctx, out, at + b * BEAT, 0.22, verb);
  if (m !== walkBar) for (let s = 0; s < upTo * 2; s++) V.shaker(ctx, out, at + s * (EIGHTH / 2), [0.05, 0.025, 0.07, 0.025][s % 4], s % 2 ? 0.3 : 0.15);
  if (m === walkBar) HOOK.forEach((n, i) => { if (n) V.glock(ctx, out, e8(i), n, 0.07, verb); });
  if (last) {
    // the stop: a pickup clap, then one F# hit that dies away before the song's own downbeat takes the next bar (an F#
    // still ringing would rub against the song's B)
    V.clap(ctx, out, e8(3), 0.18, verb);
    V.kick(ctx, out, e8(4), 0.7);
    V.clap(ctx, out, e8(4), 0.26, verb);
    V.strum(ctx, gtr, e8(4), ch.gtr, false, 0.24, 0.7);
    V.bass(ctx, out, e8(4), ch.root, 0.45, 0.32);
    V.glock(ctx, out, e8(4), 90, 0.08, verb);
  }
}

// the music's dip under each effect: every cue's dip multiplied together, sampled at 200 Hz for one value curve
function duckCurve(list, dur) {
  const rate = 200, n = Math.ceil(dur * rate), v = new Float32Array(n).fill(1);
  for (const q of list) {
    if (!q.duck) continue;
    const i0 = Math.max(0, Math.floor((q.t - 0.02) * rate)), i1 = Math.min(n, Math.ceil((q.t + q.hold + 0.3) * rate));
    for (let i = i0; i < i1; i++) {
      const t = i / rate - q.t;
      const shape = t < 0 ? 1 + t / 0.02 : t < q.hold ? 1 : 1 - (t - q.hold) / 0.3;
      v[i] *= 1 - q.duck * Math.max(0, Math.min(1, shape));
    }
  }
  for (let i = 0; i < n; i++) v[i] = Math.max(0.35, v[i]);
  return v;
}

// the bed dulls under each x50 wait it plays through and opens as the answer lands
function dullUnder(param, list, stop) {
  param.setValueAtTime(18000, 0);
  for (const q of list.filter((x) => x.name === 'ff' && x.t < stop)) {
    param.setValueAtTime(18000, q.t - 0.2);
    param.exponentialRampToValueAtTime(700, q.t + 0.05);
    param.setValueAtTime(700, q.t + q.dur - 0.02);
    param.exponentialRampToValueAtTime(18000, q.t + q.dur + 0.15);
  }
}

// scale the mix so the bed sits at TARGET_RMS, never past PEAK; returns what it measured
function normalize(buffer, g) {
  const chs = [0, 1].map((c) => buffer.getChannelData(c)), i0 = Math.floor((g.b0 + BAR) * SR), i1 = Math.floor((g.stop - 0.1) * SR);
  let sum = 0, peak = 0;
  for (const d of chs) {
    for (let i = i0; i < i1; i++) sum += d[i] * d[i];
    for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
  }
  const rms = Math.sqrt(sum / (2 * (i1 - i0))), k = Math.min(TARGET_RMS / rms, PEAK / peak);
  for (const d of chs) for (let i = 0; i < d.length; i++) d[i] *= k;
  const db = (x) => +(20 * Math.log10(x)).toFixed(1);
  return { bedRmsDb: db(rms * k), peakDb: db(peak * k), gain: +k.toFixed(3) };
}

// render the whole soundtrack; `only` ('music' | 'sfx') renders one stem, unnormalized, for QA
export async function renderScore({ k, T, ends, only = null }) {
  const g = grid(ends), list = cuesOf(k, T, ends, g), dur = ends.pop + TAIL;
  const ctx = new OfflineAudioContext(2, Math.ceil(dur * SR), SR);
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -10; comp.knee.value = 6; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.15;
  comp.connect(ctx.destination);
  // music: instruments and their room, then the fast-forward dulling, then the ducking
  const musicIn = ctx.createGain(), lp = ctx.createBiquadFilter(), duck = ctx.createGain(), music = ctx.createGain();
  lp.type = 'lowpass';
  music.gain.value = only === 'sfx' ? 0 : 0.8;
  musicIn.connect(lp).connect(duck).connect(music).connect(comp);
  const level = (v) => { const n = ctx.createGain(); n.gain.value = v; return n; };
  const mverb = V.makeVerb(ctx), gtr = ctx.createBiquadFilter(), presence = ctx.createBiquadFilter();
  mverb.connect(level(0.5)).connect(musicIn);
  gtr.type = 'highpass'; gtr.frequency.value = 90;
  presence.type = 'peaking'; presence.frequency.value = 2500; presence.gain.value = 3;
  gtr.connect(presence).connect(musicIn);
  presence.connect(level(0.2)).connect(mverb);
  // effects and their own room
  const sfx = ctx.createGain(), sverb = V.makeVerb(ctx, 1.2);
  sfx.gain.value = only === 'music' ? 0 : 1;
  sfx.connect(comp);
  sverb.connect(level(0.5)).connect(sfx);
  const walkBar = Math.floor((T.steps[0].w1 - g.b0) / BAR) + 1;
  for (let m = 0; m < g.bars; m++) playBar(ctx, { out: musicIn, gtr, verb: mverb }, m, g.b0 + m * BAR, g, walkBar);
  for (const q of list) FX[q.name](ctx, sfx, q, sverb);
  dullUnder(lp.frequency, list, g.stop);
  duck.gain.setValueCurveAtTime(duckCurve(list, dur), 0, dur);
  const buffer = await ctx.startRendering();
  const levels = only ? null : normalize(buffer, g);
  return { buffer, cues: list, grid: g, levels };
}
