// The multicat spot's sound engine, part 2: every instrument and effect, synthesized from the DSP in
// multicat-dsp.26a3dff0.js (no samples). Each voice returns a buffer peak-normalised to 1 (mono) or { l, r } (stereo),
// so the score sets every level in dB. The palette is broadcast-clean on purpose: short envelopes, filtered noise, tuned
// sines, no pitch glides on anything tonal (nothing slides, boings or whistles); the only moving pitch is a kick's or an
// impact's sub drop, which reads as weight, not as a gag.
import { SR, midi, len, rng, noise, filter, shape, perc, sine, saw, fm, sat } from './multicat-dsp.26a3dff0.js';

function peak1(...xs) {
  let m = 0;
  for (const x of xs) for (let i = 0; i < x.length; i++) m = Math.max(m, Math.abs(x[i]));
  if (m > 0) for (const x of xs) for (let i = 0; i < x.length; i++) x[i] /= m;
  return xs.length === 1 ? xs[0] : { l: xs[0], r: xs[1] };
}
const addTo = (x, y, g = 1, at = 0) => { for (let i = 0; i < y.length && at + i < x.length; i++) x[at + i] += y[i] * g; return x; };
const cents = (f, c) => f * Math.pow(2, c / 1200);

// ---------- drums ----------

// a tight tuned kick: a sine falling to 50 Hz, driven so its harmonics carry on a TV's small speakers, plus a click
export function kick() {
  const n = len(0.3), x = sine(n, (t) => 57 + 120 * Math.exp(-t / 0.024));
  shape(x, perc(0.001, 0.072, n));
  sat(x, 1.7);
  const c = filter(noise(len(0.006), rng(11)), 'hp', 2800);
  shape(c, perc(0.0002, 0.0012, c.length));
  return peak1(addTo(x, c, 0.6));
}

// a layered clap: three micro-bursts and a short tail of band-passed noise, with a little body underneath
export function clap(seed) {
  const n = len(0.3), x = filter(filter(noise(n, rng(seed)), 'bp', 1450, 0.85), 'hp', 650), end = n / SR;
  shape(x, (t) => {
    let e = 0;
    for (const b of [0, 0.0085, 0.017]) if (t >= b && t < 0.025) e = Math.max(e, Math.exp(-(t - b) / 0.0032));
    if (t >= 0.025) e = Math.max(e, 0.85 * Math.exp(-(t - 0.025) / 0.065));
    return e * Math.min(1, (end - t) / 0.004);
  });
  peak1(x);
  const body = sine(len(0.05), 205);
  shape(body, perc(0.0005, 0.014, body.length));
  return peak1(addTo(x, body, 0.3));
}

export function hat(seed, dec = 0.018) {
  const n = len(dec * 7 + 0.01), x = filter(filter(noise(n, rng(seed)), 'hp', 7200, 0.7), 'peak', 10500, 1, 4);
  return peak1(shape(x, perc(0.0004, dec, n)));
}

export function shaker(seed) {
  const n = len(0.1), x = filter(filter(noise(n, rng(seed)), 'bp', 6400, 1.3), 'hp', 4200);
  return peak1(shape(x, perc(0.007, 0.026, n)));
}

// a cymbal-like air hit: wide, decorrelated high noise
export function air(seed, dec = 0.8) {
  const n = len(dec * 3.2), l = noise(n, rng(seed)), r = noise(n, rng(seed + 1));
  for (const x of [l, r]) { filter(x, 'hp', 4800, 0.7); filter(x, 'lp', 13500, 0.7); filter(x, 'peak', 8200, 0.8, 3); shape(x, perc(0.0015, dec, n)); }
  return peak1(l, r);
}

// a reversed-cymbal swell that lands exactly at its end (place it `dur` before the hit): its filter opens as it rises
export function swell(seed, dur, lo = 1200, hi = 10000) {
  const n = len(dur), l = noise(n, rng(seed)), r = noise(n, rng(seed + 7));
  for (const x of [l, r]) {
    filter(x, 'lp', (t) => lo * Math.pow(hi / lo, t / dur), 0.8);
    filter(x, 'hp', 450);
    shape(x, (t) => Math.pow(t / dur, 2.6) * Math.min(1, (dur - t) / 0.005));
  }
  return peak1(l, r);
}

// ---------- tonal ----------

// a bass note: a sine for weight under a low-passed saw that carries the pitch on small speakers, gently driven and
// cleared below 40 Hz; a held note sags a touch, then a short release so consecutive eighths articulate
export function bass(m, dur) {
  const f = midi(m), n = len(dur + 0.03), x = sine(n, f), s = filter(saw(n, f), 'lp', 1150, 0.8);
  for (let i = 0; i < n; i++) x[i] *= 0.7;
  addTo(x, s, 0.85);
  sat(x, 1.25);
  filter(x, 'hp', 40, 0.7);
  shape(x, (t) => Math.min(1, t / 0.004) * (t < dur ? 1 - 0.2 * (t / dur) : 0.8 * Math.max(0, 1 - (t - dur) / 0.03)));
  return peak1(x);
}

// a chord pluck: three detuned band-limited saws per note across the stereo field, a fast filter envelope, a short decay
export function pluck(notes, dur, { cut = 5000, base = 1300, fdec = 0.085, dec = 0.22 } = {}) {
  const n = len(dur + 0.06), l = new Float32Array(n), r = new Float32Array(n);
  notes.forEach((m, k) => {
    const f = midi(m), mid = saw(n, f, 0.41 * k);
    addTo(l, saw(n, cents(f, -8), 0.13 * k)); addTo(l, mid, 0.6);
    addTo(r, saw(n, cents(f, 8), 0.77 * k)); addTo(r, mid, 0.6);
  });
  const fc = (t) => base + cut * Math.exp(-t / fdec);
  const env = (t) => Math.min(1, t / 0.003) * Math.exp(-t / dec) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / 0.05));
  for (const x of [l, r]) { filter(x, 'lp', fc, 0.9); shape(x, env); }
  return peak1(l, r);
}

// a soft saw pad, detuned left and right, low-passed; it fades in over `att` and out over `rel` past `dur`
export function pad(notes, dur, { att = 0.06, rel = 0.35, cut = 2600 } = {}) {
  const n = len(dur + rel), l = new Float32Array(n), r = new Float32Array(n);
  notes.forEach((m, k) => { const f = midi(m); addTo(l, saw(n, cents(f, -6), 0.2 * k)); addTo(r, saw(n, cents(f, 6), 0.6 * k)); });
  const env = (t) => Math.min(1, t / att) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / rel));
  for (const x of [l, r]) { filter(x, 'lp', cut, 0.7); filter(x, 'hp', 200, 0.7); shape(x, env); }
  return peak1(l, r);
}

// a plain decaying sub note, under the end card's logo chord
export function sub(m, dec) {
  const n = len(dec * 5), x = sine(n, midi(m));
  return peak1(sat(shape(x, perc(0.006, dec, n)), 1.2));
}

// the hook's voice and the sonic logo's: a clean FM pluck (harmonic ratio), glassy on the attack and round in the tail
export function bell(m, dec = 0.4) {
  const n = len(dec * 5 + 0.05), x = fm(n, midi(m), { ratio: 2, index: 2.2, idec: 0.09, floor: 0.2 });
  addTo(x, shape(sine(n, midi(m) * 4), perc(0.001, 0.05, n)), 0.12);
  return peak1(shape(x, perc(0.0015, dec, n)));
}

// ---------- effects ----------

// the picture's landings: a sub drop for weight, a short low body and a snap for the front edge
export function impact(size) {
  const n = len(0.5 + 0.7 * size), sub = sine(n, (t) => 40 + 50 * Math.exp(-t / 0.055));
  shape(sub, perc(0.001, 0.13 + 0.25 * size, n));
  sat(sub, 1.5);
  const r = rng(91), body = filter(noise(len(0.12), r), 'bp', 170, 1.1), snap = filter(noise(len(0.012), r), 'hp', 3200);
  shape(body, perc(0.0006, 0.028, body.length));
  shape(snap, perc(0.0002, 0.0016, snap.length));
  peak1(body); peak1(snap);
  return peak1(addTo(addTo(sub, body, 0.55), snap, 0.4));
}

// one keystroke: a short bright click with a small body, each one a little different
export function key(seed) {
  const r = rng(seed), n = len(0.028), x = filter(noise(n, r), 'bp', 2400 + 1900 * r(), 1.4);
  shape(x, perc(0.0003, 0.0038, n));
  peak1(x);
  const b = sine(n, 850 + 350 * r());
  return peak1(addTo(x, shape(b, perc(0.0004, 0.005, n)), 0.35));
}

// a UI tick (a chip landing, the platform chip's swap)
export function tick(f) {
  const n = len(0.04), x = shape(sine(n, f), perc(0.0004, 0.008, n)), c = filter(noise(len(0.003), rng(23)), 'hp', 3500);
  return peak1(addTo(x, shape(c, perc(0.0002, 0.0008, c.length)), 0.35));
}

// a resolved chip's confirm: a short tuned tone with two harmonic partials, no inharmonic ring
export function tink(m) {
  const f = midi(m), n = len(0.3), x = sine(n, f);
  addTo(x, sine(n, f * 2), 0.26);
  addTo(x, sine(n, f * 3), 0.08);
  return peak1(shape(x, perc(0.0008, 0.06, n)));
}

// the send swish: band-passed air sweeping up, peaking at `peak` s from its start (place it that much before the send)
export function swish(seed, peak = 0.14, tail = 0.06) {
  const dur = peak + tail * 5, n = len(dur), l = noise(n, rng(seed)), r = noise(n, rng(seed + 3));
  for (const x of [l, r]) {
    filter(x, 'bp', (t) => 900 * Math.pow(6, Math.min(1, t / (peak + tail))), 1.1);
    shape(x, (t) => (t < peak ? Math.pow(t / peak, 2) : Math.exp(-(t - peak) / tail)) * Math.min(1, (dur - t) / 0.004));
  }
  return peak1(l, r);
}

// a soft air pass for a camera move or a card's rise: low-passed noise, bell-shaped, drifting left to right
export function whoosh(seed, dur, top = 2200) {
  const n = len(dur), l = noise(n, rng(seed)), r = noise(n, rng(seed + 5));
  const bellAt = (t) => Math.pow(Math.sin(Math.PI * Math.min(1, t / dur)), 2);
  filter(l, 'lp', (t) => 260 + top * bellAt(t), 0.8); filter(r, 'lp', (t) => 260 + top * bellAt(t), 0.8);
  shape(l, (t) => bellAt(t) * (1 - 0.4 * t / dur)); shape(r, (t) => bellAt(t) * (0.6 + 0.4 * t / dur));
  return peak1(l, r);
}

// the fast-forwarded generation: a band of air rising through the spectrum under a tremolo that speeds up, with two
// held key notes inside it (they never bend); it cuts dead at its end, into the landing
export function riser(seed, dur, notes) {
  const n = len(dur), l = noise(n, rng(seed)), r = noise(n, rng(seed + 9));
  const p = (t) => Math.min(1, t / dur);
  let ph = 0;
  const trem = new Float32Array(n);
  for (let i = 0; i < n; i++) { ph += (7 + 21 * p(i / SR) * p(i / SR)) / SR; trem[i] = 0.68 + 0.32 * Math.sin(2 * Math.PI * ph); }
  for (const x of [l, r]) filter(x, 'bp', (t) => 650 * Math.pow(12, Math.pow(p(t), 1.3)), 2.2);
  peak1(l, r);
  const tone = new Float32Array(n);
  notes.forEach((m) => addTo(tone, sine(n, midi(m)), 0.5));
  const env = (i) => Math.pow(p(i / SR), 1.4) * Math.min(1, (dur - i / SR) / 0.006) * trem[i];
  for (let i = 0; i < n; i++) { const e = env(i), k = 0.22 * Math.pow(p(i / SR), 1.5) * tone[i]; l[i] = (l[i] + k) * e; r[i] = (r[i] + k) * e; }
  return peak1(l, r);
}

// the play button's press: a tactile snap, a small high tone and a low thump
export function press() {
  const n = len(0.05), r = rng(5), snap = filter(noise(n, r), 'hp', 4000);
  shape(snap, perc(0.0002, 0.0012, n));
  peak1(snap);
  addTo(snap, shape(sine(n, 2300), perc(0.0003, 0.003, n)), 0.35);
  return peak1(addTo(snap, shape(sine(n, 165), perc(0.0006, 0.011, n)), 0.55));
}

// a wide high shimmer that blooms in over `att` (the end card's wordmark sharpening into focus)
export function shimmer(seed, att, dec) {
  const n = len(att + dec * 4), l = noise(n, rng(seed)), r = noise(n, rng(seed + 2));
  for (const x of [l, r]) { filter(x, 'bp', 9500, 0.9); filter(x, 'hp', 6000); shape(x, (t) => (t < att ? Math.pow(t / att, 2) : Math.exp(-(t - att) / dec)) * Math.min(1, (n / SR - t) / 0.01)); }
  return peak1(l, r);
}
