// The multicat spot's sound engine, part 3: the score, written against the spot's own cue times (cueSheet, from the
// beat's plan in multicat.516afb1a.js), so every sound sits on the frame it belongs to. An original bed in B major at
// about 120 BPM, the key and tempo of the ElevenLabs song the spot plays (media/multicat.516afb1a/tiny-chaos.mp3,
// measured: B major, 118-123 BPM), so the bed hands straight into it; the tempo bends under 2% between the picture's
// landings so that each one is a downbeat. On top: keystrokes, send swishes, chip ticks and confirms, a fast-forward
// riser under every generation, a weighted hit on every landing, the play press, and a sonic-logo sting on the end card
// (the hook's three notes, D#5 F#5 B5). The song itself plays alone: the bed stops a beat before it. Pure: no DOM, no
// Web Audio, so the worker, a page or node renders the same samples.
import { SR, db, len, rng, Bus, reverb, compress, limit, loudness, truePeak } from './multicat-dsp.26a3dff0.js';
import * as V from './multicat-voices.26a3dff0.js';

// the master: the web level (-16 LUFS integrated, true peak under -1 dBTP); multicat-sound.26a3dff0.js trims the
// whole thing for the TV deliverable
export const TARGET = { lufs: -16, tp: -1.5 };

// every cue the score needs, as plain numbers: k is the engine's first ask (its typing, send and routing chip), T the
// beat's plan (its three asks, their chips, cards, generations and landings), end the end card's constants
export function cueSheet(k, T, { cps, endDelay, tail = 0.7 }) {
  const [M, O, S] = T.steps;
  const pop = S.cut + endDelay;
  return {
    cps,
    asks: [{ s: k.s, end: k.typeEnd }, ...T.steps.map((st) => ({ s: st.s, end: st.typeEnd }))],
    sends: [k.send, ...T.steps.map((st) => st.send)],
    chips: [...k.chips, ...T.steps.flatMap((st) => st.chips)].map(({ sw, swap, done, tool }) => ({ sw, swap, done, tool: !!tool })),
    cards: [T.card, M.card, O.card, S.card],
    gens: [[T.gen0, T.done], [M.gen0, M.done], [S.gen0, S.done]],
    image: T.done, model: M.done, order: O.done, song: S.done, play: S.play,
    cover: S.cut, pop, word: pop + 0.3, end: T.end, length: T.end + tail,
  };
}

// ---------- the grid ----------

const EIGHTH = 0.25; // 120 BPM

// every bar's time and length, laid between the picture's anchors (the first send, the four landings, the play press).
// Each span takes the whole number of eighths nearest 120 BPM, so its tempo bends a little and each anchor is exactly
// a downbeat. Bars run 4/4 from an anchor, the remainder a short bar before the next one; the first span's remainder
// comes first instead, the pickup the first send pushes in on, and the intro's bars count back from it.
function grid(c) {
  const A = [c.sends[0], c.image, c.model, c.order, c.song, c.play], names = ['A', 'B', 'C', 'D', 'E'];
  const spans = A.slice(1).map((b, i) => { const n = Math.max(1, Math.round((b - A[i]) / EIGHTH)); return { name: names[i], t0: A[i], n, step: (b - A[i]) / n }; });
  const bars = [];
  const bar = (span, t0, step, n) => bars.push({ span, t0, step, n, t1: t0 + step * n, e: (k) => t0 + step * k });
  const a = spans[0], pick = a.n % 8, down = a.t0 + pick * a.step, intro = [];
  for (let t = down - 8 * a.step; t + 8 * a.step > 0; t -= 8 * a.step) intro.unshift(t);
  intro.forEach((t) => bar('intro', t, a.step, 8));
  for (let e = pick; e < a.n; e += 8) bar('A', a.t0 + e * a.step, a.step, Math.min(8, a.n - e));
  for (const sp of spans.slice(1)) for (let e = 0; e < sp.n; e += 8) bar(sp.name, sp.t0 + e * sp.step, sp.step, Math.min(8, sp.n - e));
  for (const b of bars) { const same = bars.filter((x) => x.span === b.span); b.k = same.indexOf(b); b.m = same.length; }
  return bars;
}

// ---------- harmony and levels ----------

// voicings as MIDI notes: the bass root, the pluck's four notes (the bass carries the root, so the plucks float above
// it), the pad's spread
const CHORDS = {
  B: { bass: 35, pluck: [63, 66, 70, 73], pad: [54, 59, 63, 70] },
  E: { bass: 40, pluck: [64, 68, 71, 75], pad: [52, 59, 64, 68] },
  Eadd9: { bass: 40, pluck: [64, 66, 68, 71], pad: [59, 64, 66, 71] },
  Gm: { bass: 32, pluck: [63, 66, 68, 71], pad: [56, 59, 63, 66] },
  Fsus: { bass: 30, pluck: [61, 66, 71, 73], pad: [54, 59, 61, 66] },
  F: { bass: 30, pluck: [61, 66, 70, 73], pad: [54, 58, 61, 66] },
};
// IV in, a deceptive V-vi before the photo resolves home to I; I IV vi V around the model; the order lands on vi; the
// song lands on a V stab, which the song's own I answers
const PROG = { intro: ['Eadd9'], A: ['Gm'], B: ['B', 'E', 'Gm', 'Fsus'], C: ['B', 'E', 'Fsus'], D: ['Gm', 'E', 'Fsus'], E: ['F'] };
const HOOK = [75, 78, 83]; // D#5 F#5 B5: the hook after the model lands, and the end card's sonic logo
const chordOf = (b) => CHORDS[PROG[b.span][Math.min(b.k, PROG[b.span].length - 1)]];

// peak levels in dBFS before the master sets the loudness: the bed under the picture, the effects on it
const LV = {
  kick: -9, clap: -9, hat: -16, ohat: -21, shaker: -24, air: -22, swell: -15, bass: -12, pluck: -8, pad: -18, hook: -16,
  impact: -7, key: -31, tick: -31, swap: -35, tink: -28, swish: -23, whoosh: -24, card: -31, riser: -12, chime: -19, press: -21,
  logo: -16, logoPad: -21, sub: -15, shimmer: -27, intro: -12, glint: -22,
};
const vel = (v) => 20 * Math.log10(v);

// ---------- the mixer ----------

function mixer(n) {
  const mx = { drums: new Bus(n), tonal: new Bus(n), fx: new Bus(n), send: new Bus(n), kicks: [] };
  // a voice onto a bus at t, at a level in dB, panned (mono voices), with some of it sent to the room
  mx.put = (bus, v, t, lv, { pan = 0, wet = 0 } = {}) => {
    const g = db(lv);
    if (v.l) { bus.addSt(v.l, v.r, t, g); if (wet) mx.send.addSt(v.l, v.r, t, g * wet); }
    else { bus.add(v, t, g, pan); if (wet) mx.send.add(v, t, g * wet, pan); }
  };
  return mx;
}

// the tonal bus's low-pass: closed in the intro and opening toward the first send; wide open through the bed; closing
// under the model's generation and opening again through the build into its landing
function tonalCut(c, bars) {
  const OPEN = 18000, send = c.sends[0], g0 = c.gens[1][0], land = c.model;
  const build = bars.find((b) => b.span === 'B' && b.k === b.m - 1).t0;
  const exp = (a, b, p) => a * Math.pow(b / a, Math.min(1, Math.max(0, p)));
  return (t) => {
    if (t < send - 0.04) return exp(1500, 4000, Math.pow(t / (send - 0.04), 1.5));
    if (t < send + 0.02) return exp(4000, OPEN, (t - send + 0.04) / 0.06);
    if (t >= g0 && t < build) return exp(OPEN, 1600, Math.pow((t - g0) / (build - g0), 0.6));
    if (t >= build && t < land - 0.012) return exp(1600, 7000, Math.pow((t - build) / (land - 0.012 - build), 1.5));
    if (t >= land - 0.012 && t < land) return exp(7000, OPEN, (t - land + 0.012) / 0.012);
    return OPEN;
  };
}

// the tonal bus ducks under every kick and breathes back (the pump that glues the bass and chords to the beat)
function pumpCurve(kicks, n, depth = 0.42, rec = 0.085) {
  const g = new Float32Array(n).fill(1);
  for (const t of kicks) {
    const a = Math.round((t - 0.004) * SR), k = Math.round(t * SR);
    for (let i = Math.max(0, a); i < Math.min(n, k + Math.round(0.5 * SR)); i++) {
      const v = i < k ? 1 - depth * (i - a) / (k - a) : 1 - depth * Math.exp(-(i - k) / (rec * SR));
      if (v < g[i]) g[i] = v;
    }
  }
  return g;
}

// ---------- the bed ----------

function music(mx, bars, c) {
  const { put, drums, tonal } = mx;
  const K = V.kick(), CL = [1, 2, 3, 4].map((s) => V.clap(100 + s)), HT = [1, 2, 3, 4, 5, 6].map((s) => V.hat(200 + s));
  const OH = V.hat(250, 0.11), SH = [1, 2, 3, 4].map((s) => V.shaker(260 + s));
  let ci = 0, hi = 0, si = 0;
  const kick = (t, v = 1) => { put(drums, K, t, LV.kick + vel(v)); mx.kicks.push(t); };
  const clap = (t, v = 1) => put(drums, CL[ci++ % 4], t, LV.clap + vel(v), { wet: 0.22 });
  const hat = (t, v = 1) => put(drums, HT[hi++ % 6], t, LV.hat + vel(v), { pan: hi % 2 ? 0.2 : -0.12 });
  const shake = (t, v = 1) => put(drums, SH[si++ % 4], t, LV.shaker + vel(v), { pan: -0.3 });
  const air = (t, dec, lv = LV.air) => put(drums, V.air(270 + Math.round(t * 10), dec), t, lv, { wet: 0.1 });
  const swell = (to, dur, lv = LV.swell) => put(drums, V.swell(280 + Math.round(to * 10), dur), to - dur, lv);
  const bassRun = (b, ch, from, to) => { for (let e = from; e < to; e++) put(tonal, V.bass(ch.bass, b.step * 0.82), b.e(e), LV.bass + (e % 2 ? 0 : -1.5)); };
  const plucks = (b, ch, at, dur = 1.4, lv = 0) => at.forEach((e) => put(tonal, V.pluck(ch.pluck, b.step * dur), b.e(e), LV.pluck + lv, { wet: 0.18 }));
  const padBar = (b, ch, opts, lv = 0) => { const t0 = Math.max(0, b.t0); put(tonal, V.pad(ch.pad, b.t1 - t0, opts), t0, LV.pad + lv, { wet: 0.1 }); };
  const groove = (b, from = 0, to = b.n) => {
    for (let e = from; e < to; e++) {
      if (e % 2 === 0) kick(b.e(e)); else hat(b.e(e), e === 7 ? 0.9 : 0.75);
      if (e === 2 || e === 6) clap(b.e(e));
      shake(b.e(e), 0.8); shake(b.e(e + 0.5), 0.55);
    }
  };
  const roll = (b, from, to, v0, v1) => { const n = (to - from) * 2; for (let j = 0; j < n; j++) clap(b.e(from + j / 2), v0 + (v1 - v0) * (j / Math.max(1, n - 1))); };

  for (const b of bars) {
    const ch = chordOf(b), short = b.n < 8, hook = (b.span === 'C' || b.span === 'D') && !short;
    if (b.span === 'intro') {
      // the pad blooms in with the greeting under one soft bell; the last intro bar adds the filtered plucks, then the
      // push on the first send: a kick and an air hit on the off-beat, a clap on four and a sixteenth fill into the groove
      padBar(b, ch, b.k === 0 ? { att: 0.7, rel: 0.3 } : { att: 0.05, rel: 0.3 }, LV.intro - LV.pad - (b.k === 0 ? 1.5 : 0));
      if (b.k === 0) { put(tonal, V.bell(71, 0.9), 0.2, LV.glint, { wet: 0.45 }); put(drums, V.shimmer(630, 0.7, 0.8), 0.1, LV.shimmer - 2); }
      if (b.k !== b.m - 1) continue;
      const push = Math.round((c.sends[0] - b.t0) / b.step);
      plucks(b, ch, [0, 3, 6], 1.4, 2);
      for (const e of [1, 3]) hat(b.e(e), 0.45);
      plucks(b, CHORDS.Fsus, [push], 1.5);
      kick(b.e(push)); air(b.e(push), 0.5, LV.air - 3);
      clap(b.e(6), 0.85); roll(b, 6.5, 8, 0.4, 0.75);
      continue;
    }
    if (b.span === 'E') {
      // the stab as the song card lands, choked so the bar's second beat is silence before the play press
      kick(b.e(0)); clap(b.e(0), 0.9); air(b.e(0), 0.16, LV.air + 1);
      put(tonal, V.pluck(ch.pluck, b.step * 1.1, { dec: 0.12 }), b.e(0), LV.pluck + 2, { wet: 0.12 });
      put(tonal, V.pad(ch.pad, b.step * 1.0, { att: 0.004, rel: 0.12 }), b.e(0), LV.pad + 2);
      put(tonal, V.bass(ch.bass, b.step * 1.2), b.e(0), LV.bass);
      continue;
    }
    padBar(b, ch, { att: 0.04, rel: 0.25 });
    if (b.k === 0 && b.span !== 'A') air(b.t0, b.span === 'C' ? 1.2 : 0.8, b.span === 'C' ? LV.air + 2 : LV.air);
    if (b.span === 'A') {
      // the light groove under the photo's generation: no claps, the kick drops for the last beat under the swell
      for (const e of [0, 2, 4]) kick(b.e(e));
      for (const e of [1, 3, 5]) hat(b.e(e), 0.7);
      bassRun(b, ch, 0, 6); plucks(b, ch, [0, 3]);
      swell(c.image, b.t1 - b.e(5.5));
    } else if (short) {
      // the build bar before a landing: a clap roll and a swell that land on its downbeat
      if (b.n >= 6) { groove(b, 0, 4); bassRun(b, ch, 0, 4); plucks(b, ch, [0, 3]); roll(b, 4, b.n, 0.45, 0.85); }
      else {
        // the bar before the model: kicks on the beats under a sixteenth clap roll, the hats still on the off-beats
        if (b.n > 2) {
          for (let e = 0; e < b.n; e += 2) kick(b.e(e), 0.8);
          for (let e = 1; e < b.n; e += 2) hat(b.e(e), 0.8);
          plucks(b, ch, [0, 1, 2, 3], 1, 1);
          put(tonal, V.pad(ch.pad, b.t1 - b.t0, { att: 0.02, rel: 0.02 }), b.t0, LV.pad + 8);
        }
        roll(b, 0, b.n, b.n > 2 ? 0.45 : 0.55, 1);
      }
      swell(b.t1, Math.min(0.9, b.t1 - b.t0 + 0.2));
    } else if (b.span === 'B' && b.k === b.m - 2) {
      // the model starts generating: the kick, claps and bass fall away halfway through the bar, the hats and shaker
      // keep time and the chords close down under the riser
      groove(b, 0, 4); bassRun(b, ch, 0, 4); plucks(b, ch, [0, 3, 4, 5, 6, 7], 1, 1);
      for (let e = 4; e < 8; e++) { if (e % 2) hat(b.e(e), 0.8); shake(b.e(e), 0.9); shake(b.e(e + 0.5), 0.6); }
      put(tonal, V.pad(ch.pad, b.t1 - b.e(4), { att: 0.3, rel: 0.1 }), b.e(4), LV.pad + 8);
    } else {
      groove(b); bassRun(b, ch, 0, b.n); plucks(b, ch, [0, 3, 6]);
      if (b.k === 1) put(drums, OH, b.e(7), LV.ohat);
    }
    if (hook) HOOK.forEach((m, i) => put(tonal, V.bell(m, i === 2 ? 0.5 : 0.28), b.e(1 + i), LV.hook - (i === 2 ? 0 : 1.5), { wet: 0.3, pan: (i - 1) * 0.25 }));
  }
}

// ---------- the effects ----------

function effects(mx, c) {
  const { put, fx } = mx, r = rng(77);
  const KEYS = Array.from({ length: 12 }, (_, i) => V.key(300 + i));
  // keystrokes under each ask's typing: most characters, a few skipped, so it reads as quick typing and not a buzz
  c.asks.forEach((a, ai) => {
    const n = Math.max(1, Math.round((a.end - a.s) * c.cps));
    for (let i = 0; i < n; i++) {
      if (i % 2 && r() > 0.3) continue;
      put(fx, KEYS[(i * 7 + ai) % 12], a.s + i / c.cps + (r() - 0.5) * 0.004, LV.key - 4 * r(), { pan: (r() - 0.5) * 0.3 });
    }
  });
  // the send: a swish that peaks on the press; the first one also carries the camera's pull-out
  c.sends.forEach((t, i) => put(fx, V.swish(400 + i), t - 0.14, LV.swish));
  put(fx, V.whoosh(450, 0.9), c.sends[0] - 0.1, LV.whoosh);
  // routing chips: a tick as the tile pops in, a softer one as the composer's chip swaps, a tuned confirm on the check
  const TICK = V.tick(1750), SWAP = V.tick(1150), TINK = V.tink(90), TOOL = V.tink(87);
  c.chips.forEach((ch) => {
    put(fx, TICK, ch.sw + 0.03, LV.tick, { pan: -0.15 });
    if (!ch.tool) put(fx, SWAP, ch.swap, LV.swap, { pan: 0.2 });
    put(fx, ch.tool ? TOOL : TINK, ch.done, LV.tink, { wet: 0.25, pan: 0.1 });
  });
  // each answer's card rises in on a soft air pass
  c.cards.forEach((t, i) => put(fx, V.whoosh(460 + i, 0.4, 1500), t - 0.05, LV.card));
  // the generations, fast-forwarded: a riser from the x50 badge's fade-in, cut dead on the landing
  c.gens.forEach(([g0, g1], i) => { const s = g0 - 0.15; put(fx, V.riser(500 + i, g1 - s, [83, 90]), s, LV.riser - (i === 1 ? 2 : 0)); });
  // the landings: weight in proportion to the reveal; the order also gets its confirm (F#5 up to B5)
  put(fx, V.impact(0.45), c.image, LV.impact - 2);
  put(fx, V.impact(0.85), c.model, LV.impact);
  put(fx, V.impact(0.2), c.order, LV.impact - 6);
  put(fx, V.bell(78, 0.22), c.order, LV.chime, { wet: 0.3, pan: -0.1 });
  put(fx, V.bell(83, 0.4), c.order + 0.1, LV.chime + 1, { wet: 0.3, pan: 0.1 });
  put(fx, V.impact(0.5), c.song, LV.impact - 2);
  put(fx, V.press(), c.play - 0.035, LV.press);
}

// ---------- the end card ----------

// the chat covers to black on a swell; the mascot pops on a hit and the logo's three notes; the wordmark sharpens in on a
// shimmer; the chord rings out and is gone well before the last frame
function ending(mx, c) {
  const { put, fx } = mx, lead = c.pop - c.cover + 0.05;
  put(fx, V.swell(600, lead, 900, 12000), c.pop - lead, LV.swell + 2);
  put(fx, V.impact(0.65), c.pop, LV.impact - 3);
  put(fx, V.air(610, 1.3), c.pop, LV.air + 1, { wet: 0.15 });
  put(fx, V.sub(35, 0.45), c.pop, LV.sub);
  HOOK.forEach((m, i) => put(fx, V.bell(m, i === 2 ? 1.0 : 0.42), c.pop + i * 0.25, LV.logo - (i === 2 ? 0 : 1.5), { wet: 0.35, pan: (i - 1) * 0.2 }));
  put(fx, V.bell(95, 0.8), c.pop + 0.5, LV.logo - 10, { wet: 0.45 });
  put(fx, V.pad([54, 58, 63, 66, 73], c.end - c.pop - 0.4, { att: 0.02, rel: 0.6, cut: 2400 }), c.pop, LV.logoPad, { wet: 0.25 });
  put(fx, V.shimmer(620, 0.4, 0.7), c.word, LV.shimmer);
}

// ---------- the master ----------

// a little shape (a dip in the low mids for clarity, a lift in the air), loudness to the target, glue, loudness again,
// then the true-peak ceiling last so nothing can leave above it; the tails fade to digital silence before the last
// frame, so the held frame is silent and the buffer never ends mid-sound
function master(out, end) {
  out.filter('hp', 30, 0.7);
  out.filter('ls', 80, 0.7, -2);
  out.filter('peak', 280, 0.9, -1.2);
  out.filter('hs', 9000, 0.7, 1);
  const level = () => { const g = db(TARGET.lufs - loudness(out)); out.gain(() => g); };
  level();
  compress(out, { thr: -14, ratio: 2, att: 0.008, rel: 0.14, knee: 6 });
  level();
  limit(out, TARGET.tp);
  if (Math.abs(loudness(out) - TARGET.lufs) > 0.2) { level(); limit(out, TARGET.tp); }
  const a = Math.round((end - 0.1) * SR), b = out.n - Math.round(0.08 * SR);
  out.gain((i) => (i < a ? 1 : i >= b ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * (i - a) / (b - a))));
}

// the whole soundtrack, start to the last frame, as two Float32Arrays at SR
export function renderScore(c) {
  const t0 = Date.now(), n = len(c.length), mx = mixer(n), bars = grid(c);
  music(mx, bars, c);
  effects(mx, c);
  ending(mx, c);
  mx.tonal.filter('lp', tonalCut(c, bars), 0.75);
  const pump = pumpCurve(mx.kicks, n);
  mx.tonal.gain((i) => pump[i]);
  const out = new Bus(n);
  out.mix(mx.drums); out.mix(mx.tonal); out.mix(mx.fx); out.mix(reverb(mx.send, { rt60: 1.15 }));
  master(out, c.end);
  return { L: out.L, R: out.R, sr: SR, stats: { lufs: +loudness(out).toFixed(2), tp: +truePeak(out).toFixed(2), ms: Date.now() - t0, bars: bars.map((b) => `${b.span}${b.k}:${b.t0.toFixed(3)}/${b.n}`) } };
}
