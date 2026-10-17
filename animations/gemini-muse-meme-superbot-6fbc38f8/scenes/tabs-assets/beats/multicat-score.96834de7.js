// The multicat variant's music and sound effects (beats/multicat.516afb1a.js hands it the cue sheet; the player,
// multicat-player.96834de7.js, keeps the result on the spot's clock). One pass renders the whole spot offline:
//   - the bed: 120 BPM in B major, the shipped song's own tempo and key (media/multicat.516afb1a/tiny-chaos.mp3 measures
//     119.5 BPM by autocorrelation with its beats on 0, 0.5, 1 s, and its mids carry D# and G#, never D), its bar grid
//     phase-locked to the song's play press, so its last bar's V chord resolves into the song's own downbeat. Bars run
//     two five-bar phrases, I vi IV ii V twice, from the first send to the song: an airy pad under the empty state, the
//     groove dropping on the first send's downbeat (the send's knock is its pickup), a fuller section once the 3D model
//     lands, a breakdown under the last ask, a build into the song, then nothing: the song plays alone.
//   - the effects, on the exact frames they belong to: soft key ticks while asks type, a knock on every send, a glassy
//     tick as each routing chip resolves, a pass of air as each answer card rises, a stopwatch tick under each x50
//     generation, a sub impact as the photo and the model land (the drums clear around each), a soft bell on the order's
//     confirmation, and on the end card a swell into the mascot's pop, a sub, a Bmaj9 bloom and one bell on the wordmark.
// Mastered here too: the bed is brought to TARGET loudness and limited under CEIL (multicat-finish.96834de7.js).
import * as Voices from './multicat-voices.96834de7.js';
import { loudness, gain, limit, peak } from './multicat-finish.96834de7.js';

const SR = 48000, BEAT = 0.5, BAR = 4 * BEAT, STEP = BEAT / 4;
export const TARGET = -15; // LUFS of the bed, the song's own -14.1 LUFS less 0.9 dB (SONG_LEVEL in multicat.516afb1a.js)
const CEIL = 10 ** (-1.2 / 20); // the sample-peak ceiling, -1.2 dBFS
const TAIL = 2.2; // render past the end card's last frame, so the sting's tail rings out

const PITCH = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const hz = (name) => {
  const [, l, s, o] = /^([A-G])(#?)(\d)$/.exec(name);
  return 440 * 2 ** ((PITCH[l] + (s ? 1 : 0) + (+o + 1) * 12 - 69) / 12);
};
const notes = (s) => s.split(' ').map(hz);
// the voicings: plucks around 300-600 Hz on common tones, pads an octave under, the bass a sub; V opens sus4 and
// resolves to its third (A#) on beat 3
const CHORDS = {
  I: { bass: hz('B1'), keys: notes('D#4 F#4 A#4 C#5') },
  vi: { bass: hz('G#1'), keys: notes('D#4 F#4 A#4 B4') },
  IV: { bass: hz('E2'), keys: notes('D#4 F#4 G#4 B4') },
  ii: { bass: hz('C#2'), keys: notes('E4 G#4 B4 D#5') },
  V: { bass: hz('F#1'), keys: notes('C#4 E4 F#4 B4'), then: notes('C#4 E4 F#4 A#4') },
};
// a chain whose song sits in another key moves the whole bed there: c.transpose semitones (the dog's Tails Up measures
// C major, one up), every chord and every note the effects ring
const keyOf = (c) => 2 ** ((c.transpose || 0) / 12);
const shift = (fs, k) => fs.map((f) => f * k);
const chordsIn = (k) => Object.fromEntries(Object.entries(CHORDS).map(([n, ch]) => [n, { bass: ch.bass * k, keys: shift(ch.keys, k), ...(ch.then ? { then: shift(ch.then, k) } : {}) }]));
const PHRASE = ['I', 'vi', 'IV', 'ii', 'V'];
const down = (fs) => fs.map((f) => f / 2);
// 16th steps of a bar: the pluck stabs, section by section
const STABS = { A: [0, 3, 6, 10, 12], B: [0, 3, 6, 8, 11, 13], break: [0, 6, 8, 14] };

function bed(m, c, v) {
  const G = c.play;
  const nb = Math.floor((G - c.camera) / BAR); // whole bars between the first send and the song
  const barAt = (b) => G - (nb - b + 1) * BAR; // bar b's downbeat, b = 1..nb; bar nb + 1 is the song's first
  let drop = 1;
  while (drop < nb && barAt(drop) < c.model) drop++;
  // the clears: the drums step aside for the photo's impact, everything for the model's, until the next downbeat
  const clears = [[c.image - 0.12, c.image + 0.25, false], [c.model - 0.27, barAt(drop) - 0.01, true]];
  const clear = (t, music) => clears.some(([a, z, all]) => t >= a && t < z && (all || !music));
  const genAt = (t) => c.gens.some(([a, z]) => t >= a && t < z);
  const last = G - STEP; // the 16th before the song stays silent
  const chords = chordsIn(keyOf(c));

  // under the empty state: the home chord, airy and closed, swelling with the greeting
  v.pad(m, 0.1, barAt(1), down(chords.I.keys), 0.07, 1500, 1.6, 0.1);

  for (let b = 1; b <= nb; b++) {
    const t0 = barAt(b), name = PHRASE[(((b - (nb - 4)) % 5) + 5) % 5], ch = chords[name];
    const sec = b < drop ? 'A' : b < nb - 1 ? 'B' : b === nb - 1 ? 'break' : 'build';
    const keysAt = (s) => (ch.then && s >= 8 ? ch.then : ch.keys);
    // the pad, split at the half bar when the chord resolves
    const padLevel = { A: 0.028, B: 0.038, break: 0.06, build: 0.045 }[sec], cut = sec === 'build' ? 2200 : sec === 'break' ? 1800 : 1500;
    if (ch.then) {
      v.pad(m, t0, t0 + BAR / 2, down(ch.keys), padLevel, cut, 0.05, 0.1);
      v.pad(m, t0 + BAR / 2, Math.min(t0 + BAR, last), down(ch.then), padLevel, cut, 0.05, 0.1);
    } else v.pad(m, t0, t0 + BAR, down(ch.keys), padLevel, cut, 0.05, 0.1);

    for (let s = 0; s < 16; s++) {
      const t = t0 + s * STEP, p = s / 15;
      if (t >= last) break;
      const onBeat = s % 4 === 0, offBeat = s % 4 === 2;
      // drums
      if (!clear(t, false)) {
        if (sec === 'break' ? s === 0 || s === 8 : onBeat) v.kick(m, t, sec === 'break' ? 0.8 : 1);
        if ((s === 4 || s === 12) && ((sec === 'A' && b > 1) || sec === 'B')) v.clap(m, t, 1);
        if (sec === 'build') v.hat(m, t, 0.25 + 0.6 * p);
        else if (sec !== 'break') {
          if (offBeat) v.hat(m, t, 1);
          else if (s % 2 && (sec === 'B' || genAt(t))) v.hat(m, t, 0.4);
          if (sec === 'B' && s === 14) v.hat(m, t, 0.55, true);
        }
      }
      if (clear(t, true)) continue;
      // bass: the offbeats, pumping against the kick; two soft held roots through the breakdown, so it breathes
      if (sec === 'break') { if (s === 0 || s === 8) v.bass(m, t, BAR / 2 - 0.12, ch.bass, 0.3); }
      else if (offBeat) v.bass(m, t, 0.17, ch.bass, 1);
      else if (sec === 'B' && s === 15) v.bass(m, t, 0.08, ch.bass * 2, 0.5);
      // plucks: syncopated stabs, a 16th pulse that opens through the build
      if (sec === 'build') v.pluck(m, t, keysAt(s), 0.45 + 0.55 * p, 0.16, 900 + 3100 * p);
      else if (STABS[sec].includes(s)) {
        v.pluck(m, t, keysAt(s), sec === 'break' ? 0.7 : 1, sec === 'break' ? 0.45 : 0.28, sec === 'break' ? 1800 : 3400);
        if (sec === 'B') v.pluck(m, t, keysAt(s).map((f) => f * 2), 0.28, 0.18, 3000);
      }
    }
  }
  // the build into the song: air rising over the last bar, cut clean on the silent 16th
  v.riser(m, barAt(nb), last + 0.06, 0.09, 350, 8000);
  return { bars: nb, drop, grid: barAt(1), splits: [barAt(Math.round(nb / 3) + 1), barAt(Math.round((2 * nb) / 3) + 1)] };
}

function effects(m, c, v) {
  const r = m.rnd, k = keyOf(c);
  // typing: a tick every other character (every one a blur at 55 a second), the space bar lower and duller
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
  for (const t of c.sends) v.tock(m, t, 0.09);
  // the first send drops the composer and pulls the camera out
  v.whoosh(m, c.camera - 0.1, 0.8, 0.05, 350, 1800);
  for (const t of c.resolved) v.done(m, t, 0.03);
  for (const t of c.cards) v.whoosh(m, t, 0.45, 0.022, 900, 3200);
  // the x50 generations: a stopwatch tick on the 32nd-note grid, rising, and air rising to the landing
  for (const [a, z] of c.gens) {
    const n0 = Math.ceil((a - c.play) / (STEP / 2));
    for (let n = n0; c.play + n * (STEP / 2) < z - 0.03; n++) {
      const t = c.play + n * (STEP / 2), p = (t - a) / (z - a);
      v.tick(m, t, { freq: 5200, level: 0.008 + 0.014 * p, q: 3, len: 0.004, at: n % 2 ? 0.3 : -0.3 });
    }
    if (z - a > 0.5) v.riser(m, a - 0.05, z, z - a > 1.5 ? 0.07 : 0.05, 450, z - a > 1.5 ? 6500 : 5000);
  }
  v.impact(m, c.image, 0.38, 0.85);
  v.impact(m, c.model, 0.52, 1.15);
  v.bell(m, c.order, shift(notes('B5 F#6'), k), 0.045);
  // the song's play press, a hair before its first note
  v.tock(m, c.play - 0.03, 0.05);
  // the end card: air swelling as the chat fades to black, then the pop and the wordmark
  v.riser(m, c.cover, c.pop, 0.035, 1500, 7000);
  v.impact(m, c.pop, 0.48, 1.5);
  v.bloom(m, c.pop, shift(notes('B2 F#3 A#3 C#4 D#4 F#4'), k), 0.05);
  v.whoosh(m, c.word - 0.05, 1.0, 0.018, 2500, 9000);
  v.bell(m, c.word + 0.12, shift(notes('F#5 B5'), k), 0.035, 0.09);
}

// The render, fast enough for a page's first seconds. The arrangement only records each voice call ([t, name, args]),
// then the spot renders as four pieces in parallel (each OfflineAudioContext has its own render thread): three of the
// bed, split on bar lines, and the end card; the 5.6 s the song plays alone is never rendered. Each piece builds its
// voices a SEG-second slice ahead of the render (suspend, build, resume): a graph holding every node from frame 0 is
// pulled whole every render quantum, 4x slower than real time. Every piece pumps under every duck (DUCKS) in its span,
// and a bed piece closes its reverbs as the song starts (the song brings its own). The pieces sum into one buffer.
const SEG = 0.5, PAD = 3.2; // a bed piece renders PAD seconds past its last voice's start, for tails
const TWO_TIMES = new Set(['pad', 'riser']); // voices whose next argument is a time too
function recorder(calls) {
  return new Proxy({}, { get: (_, name) => (m, t, ...args) => { calls.push([t, name, args]); } });
}

async function renderPiece(calls, ducks, from, to, closeAt) {
  const ctx = new OfflineAudioContext({ numberOfChannels: 2, length: Math.max(1, Math.round((to - from) * SR)), sampleRate: SR });
  const m = Voices.makeMix(ctx, 0x9683);
  Voices.applyDucks(m, ducks.filter(([t]) => t >= from - 0.5 && t < to), from);
  if (closeAt > from && closeAt < to) {
    for (const [back, level] of m.returns) { back.gain.setValueAtTime(level, closeAt - 0.08 - from); back.gain.linearRampToValueAtTime(0, closeAt - from); }
  }
  let next = 0;
  const build = (until) => {
    for (; next < calls.length && calls[next][0] - from < until; next++) {
      const [t, name, args] = calls[next];
      Voices[name](m, t - from, ...(TWO_TIMES.has(name) ? [args[0] - from, ...args.slice(1)] : args));
    }
  };
  build(SEG);
  for (let at = SEG; at < to - from - 0.05; at += SEG) {
    const until = at + SEG;
    ctx.suspend(at).then(() => { build(until); return ctx.resume(); }).catch((e) => console.error(new Error(`multicat score: the slice at ${(from + at).toFixed(2)} s failed`, { cause: e })));
  }
  return { from, buffer: await ctx.startRendering() };
}

// render the cue sheet into a mastered stereo buffer: { buffer, stats }
export async function renderScore(c) {
  const t0 = performance.now();
  const length = Math.ceil((c.end + TAIL) * SR), len = length / SR;
  const plan = { rnd: Voices.seeded(0x9683) }, calls = [];
  const grid = bed(plan, c, recorder(calls));
  effects(plan, c, recorder(calls));
  calls.sort((a, b) => a[0] - b[0]);
  const ducks = calls.filter(([, name]) => Voices.DUCKS[name]).map(([t, name, args]) => [t, ...Voices.DUCKS[name](...args)]);
  // the pieces: [from, to) of voice starts, rendered from `from` to `to` plus its tail
  const ends = [0, ...grid.splits, c.play, Math.min(...calls.map(([t]) => t).filter((t) => t >= c.play)), len];
  const pieces = [[ends[0], ends[1]], [ends[1], ends[2]], [ends[2], ends[3]], [ends[4], ends[5]]];
  const rendered = await Promise.all(pieces.map(([from, to], i) => {
    const own = calls.filter(([t]) => t >= from && t < to);
    // the song's piece stops with the bed, a hair after the song starts; the end card's runs to the end
    const stop = i === 2 ? c.play + 0.05 : i === 3 ? len : Math.min(len, to + PAD);
    return renderPiece(own, ducks, from, stop, c.play);
  }));
  const buffer = new AudioBuffer({ numberOfChannels: 2, length, sampleRate: SR });
  for (const { from, buffer: part } of rendered) {
    const at = Math.round(from * SR);
    for (let ch = 0; ch < 2; ch++) {
      const dst = buffer.getChannelData(ch), src = part.getChannelData(ch), n = Math.min(src.length, length - at);
      for (let i = 0; i < n; i++) dst[at + i] += src[i];
    }
  }
  const raw = loudness(buffer, 0, c.play);
  gain(buffer, 10 ** ((TARGET - raw) / 20));
  const reduction = limit(buffer, CEIL);
  return { buffer, stats: { ...grid, pieces: pieces.length, renderMs: Math.round(performance.now() - t0), rawLufs: +raw.toFixed(2), lufs: +loudness(buffer, 0, c.play).toFixed(2), limiterDb: +reduction.toFixed(2), peakDb: +(20 * Math.log10(peak(buffer))).toFixed(2), seconds: buffer.duration } };
}
