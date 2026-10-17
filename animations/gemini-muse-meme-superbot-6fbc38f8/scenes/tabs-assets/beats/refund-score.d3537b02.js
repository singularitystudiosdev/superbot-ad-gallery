// The refund variant's music and sound effects: the multicat cut's 16 · Punchy premium groove (its instruments,
// multicat-voices.96834de7.js, and its mastering, multicat-finish.96834de7.js) re-cued to this chain. beats/refund.d3537b02.js
// hands it the cue sheet; refund-player.d3537b02.js keeps the render on the spot's clock. One pass renders it all offline:
//   - the bed: 120 BPM in B major, the house voicings, in two sections. The first runs from the first send to the moment
//     the agent picks up, its bars counted back from that moment so its last bar ends on it (I vi IV V, the groove
//     dropping on the send's downbeat, then a muffled hold-music texture once the call holds): the music stops dead and
//     the call plays alone. The second comes back under the approved refund and runs into the end card, its bars counted
//     back from the card's cover (the groove, the posting, a build), so its V resolves into the card's Bmaj9.
//   - the effects, on the frames they belong to: key ticks while asks type, a knock on every send, air as each card rises,
//     the US ringback (440 + 480 Hz) while the line rings, the real DTMF pair for each menu key, a stopwatch tick under
//     the x50 hold and the x50 posting, a press and a sent swish on the email, the line's click as the agent picks up and
//     the open line's hiss under the call, a bell on the approved refund, a glassy tick per platform posted, and on the end card a swell, the pop, the bloom and
//     a bell on the wordmark.
// Mastered here too: the bed is brought to TARGET loudness and limited under CEIL.
import * as Voices from './multicat-voices.96834de7.js';
import { loudness, gain, limit, peak } from './multicat-finish.96834de7.js';

const SR = 48000, BEAT = 0.5, BAR = 4 * BEAT, STEP = BEAT / 4;
export const TARGET = -15; // LUFS of the bed, the multicat score's, so the two cuts sit level
const CEIL = 10 ** (-1.2 / 20);
const TAIL = 3.4; // render past the end card's last frame, so the bloom and the plate ring out whole

const PITCH = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const hz = (name) => {
  const [, l, s, o] = /^([A-G])(#?)(\d)$/.exec(name);
  return 440 * 2 ** ((PITCH[l] + (s ? 1 : 0) + (+o + 1) * 12 - 69) / 12);
};
const notes = (s) => s.split(' ').map(hz);
// the multicat score's voicings (multicat-score.96834de7.js CHORDS)
const CHORDS = {
  I: { bass: hz('B1'), keys: notes('D#4 F#4 A#4 C#5') },
  vi: { bass: hz('G#1'), keys: notes('D#4 F#4 A#4 B4') },
  IV: { bass: hz('E2'), keys: notes('D#4 F#4 G#4 B4') },
  ii: { bass: hz('C#2'), keys: notes('E4 G#4 B4 D#5') },
  V: { bass: hz('F#1'), keys: notes('C#4 E4 F#4 B4'), then: notes('C#4 E4 F#4 A#4') },
};
const PHRASE = ['I', 'vi', 'IV', 'ii', 'V'];
const down = (fs) => fs.map((f) => f / 2);
const STABS = { A: [0, 3, 6, 10, 12], B: [0, 3, 6, 8, 11, 13], hold: [0, 6, 10], build: [] };

// ---------- the phone's own sounds, on the mix's effects bus ----------
const DTMF = { 1: [697, 1209], 2: [697, 1336], 3: [697, 1477], 4: [770, 1209], 5: [770, 1336], 6: [770, 1477], 7: [852, 1209], 8: [852, 1336], 9: [852, 1477], 0: [941, 1336] };
// the telephone band every phone sound goes through: 300 Hz to 3.4 kHz
function line(m, t, dur, level) {
  const c = m.ctx, g = c.createGain(), hp = c.createBiquadFilter(), lp = c.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 300;
  lp.type = 'lowpass'; lp.frequency.value = 3400;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(level, t + 0.012);
  g.gain.setValueAtTime(level, t + dur - 0.02);
  g.gain.linearRampToValueAtTime(0, t + dur);
  hp.connect(lp).connect(g).connect(m.sfx);
  return hp;
}
function tones(m, t, dur, freqs, level) {
  const into = line(m, t, dur, level);
  for (const f of freqs) { const o = m.ctx.createOscillator(); o.frequency.value = f; o.connect(into); o.start(t); o.stop(t + dur + 0.02); }
}
// the US ringback: 440 + 480 Hz, `dur` seconds on
export function ringback(m, t, dur, level = 0.035) { tones(m, t, dur, [440, 480], level); }
// a menu key: its row and column pair for 110 ms
export function dtmf(m, t, digit, level = 0.032) { tones(m, t, 0.11, DTMF[digit], level); }
// the open line under the call: band-limited noise, so the pick-up never drops to digital silence
export function hiss(m, t0, t1, level = 0.006) {
  const c = m.ctx, s = c.createBufferSource(), into = line(m, t0, t1 - t0, level);
  s.buffer = m.noise;
  s.loop = true;
  s.connect(into);
  s.start(t0, m.rnd() * (m.noise.duration - 0.5));
  s.stop(t1 + 0.02);
}
const V = { ...Voices, ringback, dtmf, hiss };
const TWO_TIMES_OWN = ['hiss'];

// one section of bars counted back from `to` (its last bar ends on it), from the first downbeat at or after `from`
function section(v, m, from, to, kind) {
  const nb = Math.floor((to - from) / BAR + 1e-6);
  const barAt = (b) => to - (nb - b + 1) * BAR; // b = 1..nb
  const last = to - STEP; // the 16th before `to` stays silent
  for (let b = 1; b <= nb; b++) {
    const t0 = barAt(b), name = PHRASE[(((b - (nb - 4)) % 5) + 5) % 5], ch = CHORDS[name];
    const sec = kind(b, nb, t0);
    const keysAt = (s) => (ch.then && s >= 8 ? ch.then : ch.keys);
    const padLevel = { A: 0.028, B: 0.038, hold: 0.05, build: 0.045 }[sec], cut = sec === 'hold' ? 1100 : sec === 'build' ? 2200 : 1500;
    if (ch.then) {
      v.pad(m, t0, t0 + BAR / 2, down(ch.keys), padLevel, cut, 0.05, 0.1);
      v.pad(m, t0 + BAR / 2, Math.min(t0 + BAR, last), down(ch.then), padLevel, cut, 0.05, 0.1);
    } else v.pad(m, t0, Math.min(t0 + BAR, last), down(ch.keys), padLevel, cut, 0.05, 0.1);
    for (let s = 0; s < 16; s++) {
      const t = t0 + s * STEP, p = s / 15;
      if (t >= last) break;
      const onBeat = s % 4 === 0, offBeat = s % 4 === 2;
      // drums: the hold keeps only soft offbeat hats, like music down a phone line
      if (sec === 'hold') { if (offBeat) v.hat(m, t, 0.45); }
      else {
        if (onBeat) v.kick(m, t, 1);
        if ((s === 4 || s === 12) && (sec === 'B' || (sec === 'A' && b > 1))) v.clap(m, t, 1);
        if (sec === 'build') v.hat(m, t, 0.25 + 0.6 * p);
        else {
          if (offBeat) v.hat(m, t, 1);
          else if (s % 2 && sec === 'B') v.hat(m, t, 0.4);
          if (sec === 'B' && s === 14) v.hat(m, t, 0.55, true);
        }
      }
      // bass: offbeats pumping against the kick; held soft roots under the hold
      if (sec === 'hold') { if (s === 0 || s === 8) v.bass(m, t, BAR / 2 - 0.12, ch.bass, 0.3); }
      else if (offBeat) v.bass(m, t, 0.17, ch.bass, 1);
      else if (sec === 'B' && s === 15) v.bass(m, t, 0.08, ch.bass * 2, 0.5);
      // plucks: syncopated stabs, muffled under the hold, a 16th pulse opening through the build
      if (sec === 'build') v.pluck(m, t, keysAt(s), 0.45 + 0.55 * p, 0.16, 900 + 3100 * p);
      else if (STABS[sec].includes(s)) {
        v.pluck(m, t, keysAt(s), sec === 'hold' ? 0.75 : 1, sec === 'hold' ? 0.4 : 0.28, sec === 'hold' ? 1300 : 3400);
        if (sec === 'B') v.pluck(m, t, keysAt(s).map((f) => f * 2), 0.28, 0.18, 3000);
      }
    }
  }
  if (nb && kind(nb, nb, barAt(nb)) === 'build') v.riser(m, barAt(nb), last + 0.06, 0.09, 350, 8000);
  return { bars: nb, grid: nb ? barAt(1) : to };
}

function bed(m, c, v) {
  // under the empty state: the home chord, airy and closed
  const s1 = Math.floor((c.pick - c.camera) / BAR + 1e-6), g1 = c.pick - s1 * BAR;
  v.pad(m, 0.1, g1, down(CHORDS.I.keys), 0.07, 1500, 1.6, 0.1);
  const a = section(v, m, g1, c.pick, (b, nb, t0) => (t0 >= c.hold[0] - BEAT ? 'hold' : b === 1 ? 'A' : 'B'));
  // back under the approved refund: a pad swelling and air rising into the groove's first downbeat
  const s2 = Math.floor((c.cover - c.result) / BAR + 1e-6), g2 = c.cover - s2 * BAR;
  v.pad(m, c.result, g2, down(CHORDS.I.keys), 0.075, 1700, 0.3, 0.1);
  v.riser(m, Math.max(c.result + 0.2, g2 - 1.0), g2 - 0.02, 0.05, 400, 5000);
  const b = section(v, m, g2, c.cover, (bi, nb) => (bi === nb ? 'build' : bi === 1 ? 'A' : 'B'));
  return { first: a, second: b };
}

function effects(m, c, v) {
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
  for (const t of c.sends) v.tock(m, t, 0.09);
  v.whoosh(m, c.camera - 0.1, 0.8, 0.05, 350, 1800);
  for (const t of c.cards) v.whoosh(m, t, 0.45, 0.022, 900, 3200);
  // the call: two rings, then the menu's keys
  v.ringback(m, c.ring[0], Math.min(0.42, (c.ring[1] - c.ring[0]) / 2 - 0.05));
  v.ringback(m, c.ring[0] + (c.ring[1] - c.ring[0]) / 2, Math.min(0.42, (c.ring[1] - c.ring[0]) / 2 - 0.05));
  for (const [t, d] of c.keys) v.dtmf(m, t, d);
  // the x50 windows: a stopwatch tick on the 32nd-note grid, rising
  for (const [a, z] of [c.hold, c.postWin]) {
    for (let t = Math.ceil(a / (STEP / 2)) * (STEP / 2); t < z - 0.03; t += STEP / 2) {
      const p = (t - a) / (z - a);
      v.tick(m, t, { freq: 5200, level: 0.008 + 0.012 * p, q: 3, len: 0.004, at: Math.round(t / (STEP / 2)) % 2 ? 0.3 : -0.3 });
    }
  }
  // the email: a soft shimmer as it writes, the press, then it flies
  v.whoosh(m, c.draft[0], c.draft[1] - c.draft[0] + 0.2, 0.012, 2500, 7000);
  v.tock(m, c.press, 0.07);
  v.whoosh(m, c.sent, 0.5, 0.03, 1200, 6000);
  v.done(m, c.sent + 0.05, 0.03);
  // the agent picks up: the line's click, a little weight under it, and the open line under the whole call
  v.tick(m, c.pick, { freq: 1800, level: 0.06, q: 1.2, len: 0.02, body: 140 });
  v.impact(m, c.pick + 0.01, 0.22, 0.6);
  v.hiss(m, c.pick + 0.01, c.voice[1] + 0.12);
  v.bell(m, c.result, notes('B5 F#6'), 0.045);
  // each platform posts: a glassy tick
  for (const t of c.posts) v.done(m, t, 0.045);
  v.impact(m, c.posts[c.posts.length - 1] + 0.02, 0.3, 0.8);
  // the end card
  v.riser(m, c.cover, c.pop, 0.035, 1500, 7000);
  v.impact(m, c.pop, 0.48, 1.5);
  v.bloom(m, c.pop, notes('B2 F#3 A#3 C#4 D#4 F#4'), 0.05);
  v.whoosh(m, c.word - 0.05, 1.0, 0.018, 2500, 9000);
  v.bell(m, c.word + 0.12, notes('F#5 B5'), 0.035, 0.09);
}

// The render (multicat-score.96834de7.js's method): the arrangement records each voice call ([t, name, args]), then the
// spot renders as three pieces in parallel, each OfflineAudioContext on its own thread: the first section, cut a hair
// after the pick-up with its reverbs closed on it; the call and the second section; the end card. Each piece builds its
// voices a SEG-second slice ahead of the render (suspend, build, resume), and pumps under every duck in its span.
const SEG = 0.5, PAD = 3.2;
const TWO_TIMES = new Set(['pad', 'riser', ...TWO_TIMES_OWN]);
const CUT_FADE = 0.04; // the first piece fades over its last 40 ms, so the stop at the pick-up never clicks
function recorder(calls) {
  return new Proxy({}, { get: (_, name) => (m, t, ...args) => { calls.push([t, name, args]); } });
}

async function renderPiece(calls, ducks, from, to, closeAt) {
  const ctx = new OfflineAudioContext({ numberOfChannels: 2, length: Math.max(1, Math.round((to - from) * SR)), sampleRate: SR });
  const m = Voices.makeMix(ctx, 0xd353);
  Voices.applyDucks(m, ducks.filter(([t]) => t >= from - 0.5 && t < to), from);
  if (closeAt > from && closeAt < to) {
    for (const [back, level] of m.returns) { back.gain.setValueAtTime(level, closeAt - 0.08 - from); back.gain.linearRampToValueAtTime(0, closeAt - from); }
  }
  let next = 0;
  const build = (until) => {
    for (; next < calls.length && calls[next][0] - from < until; next++) {
      const [t, name, args] = calls[next];
      V[name](m, t - from, ...(TWO_TIMES.has(name) ? [args[0] - from, ...args.slice(1)] : args));
    }
  };
  build(SEG);
  for (let at = SEG; at < to - from - 0.05; at += SEG) {
    const until = at + SEG;
    ctx.suspend(at).then(() => { build(until); return ctx.resume(); }).catch((e) => console.error(new Error(`refund score: the slice at ${(from + at).toFixed(2)} s failed`, { cause: e })));
  }
  return { from, buffer: await ctx.startRendering() };
}

// render the cue sheet into a mastered stereo buffer: { buffer, stats }
export async function renderScore(c) {
  const t0 = performance.now();
  const length = Math.ceil((c.end + TAIL) * SR), len = length / SR;
  const plan = { rnd: Voices.seeded(0xd353) }, calls = [];
  const grid = bed(plan, c, recorder(calls));
  effects(plan, c, recorder(calls));
  calls.sort((a, b) => a[0] - b[0]);
  const ducks = calls.filter(([, name]) => Voices.DUCKS[name]).map(([t, name, args]) => [t, ...Voices.DUCKS[name](...args)]);
  // the pick-up's click and weight open the second piece, so the first can stop with its bed
  const pieces = [[0, c.pick - 1e-3, c.pick + 0.05, c.pick], [c.pick - 1e-3, c.cover, Math.min(len, c.cover + PAD), 0], [c.cover, len, len, 0]];
  const rendered = await Promise.all(pieces.map(([from, to, stop, closeAt]) => renderPiece(calls.filter(([t]) => t >= from && t < to), ducks, from, stop, closeAt)));
  for (let ch = 0; ch < 2; ch++) {
    const d = rendered[0].buffer.getChannelData(ch), n = Math.round(CUT_FADE * SR);
    for (let i = 0; i < n; i++) d[d.length - n + i] *= 1 - (i + 1) / n;
  }
  const buffer = new AudioBuffer({ numberOfChannels: 2, length, sampleRate: SR });
  for (const { from, buffer: part } of rendered) {
    const at = Math.round(from * SR);
    for (let ch = 0; ch < 2; ch++) {
      const dst = buffer.getChannelData(ch), src = part.getChannelData(ch), n = Math.min(src.length, length - at);
      for (let i = 0; i < n; i++) dst[at + i] += src[i];
    }
  }
  const raw = loudness(buffer, 0, c.pick);
  gain(buffer, 10 ** ((TARGET - raw) / 20));
  const reduction = limit(buffer, CEIL);
  return { buffer, stats: { first: grid.first, second: grid.second, renderMs: Math.round(performance.now() - t0), rawLufs: +raw.toFixed(2), lufs: +loudness(buffer, 0, c.pick).toFixed(2), limiterDb: +reduction.toFixed(2), peakDb: +(20 * Math.log10(peak(buffer))).toFixed(2), seconds: buffer.duration } };
}
