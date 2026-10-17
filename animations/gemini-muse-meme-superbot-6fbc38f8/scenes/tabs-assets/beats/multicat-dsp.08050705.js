// Sample-level synthesis primitives for the multicat spot's soundtrack (multicat-score.08050705.js). Pure functions over
// Float32Arrays at SR: no Web Audio, no DOM and a seeded noise source, so the same cue sheet renders bit for bit in the
// page's worker and in Node (where the mix is measured). Every sound here is made from oscillators and noise; nothing
// is sampled.
export const SR = 48000;
const TAU = Math.PI * 2;
export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const db = (d) => Math.pow(10, d / 20);
const len = (s) => Math.max(1, Math.round(s * SR));

// mulberry32: a seeded uniform source in [0, 1)
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// a stereo bus of n samples
export class Bus {
  constructor(n) { this.L = new Float32Array(n); this.R = new Float32Array(n); }
  get n() { return this.L.length; }
}

// add a mono signal at t seconds, equal-power panned (-1 left .. 1 right, unity in both channels at the centre)
export function place(bus, sig, t, gain = 1, pan = 0) {
  const a = ((Math.max(-1, Math.min(1, pan)) + 1) * Math.PI) / 4;
  const gl = Math.cos(a) * Math.SQRT2 * gain, gr = Math.sin(a) * Math.SQRT2 * gain;
  const i0 = Math.round(t * SR), { L, R } = bus;
  for (let i = Math.max(0, -i0), n = Math.min(sig.length, L.length - i0); i < n; i++) { L[i0 + i] += sig[i] * gl; R[i0 + i] += sig[i] * gr; }
}
// add a stereo pair [l, r] at t seconds
export function placeStereo(bus, [l, r], t, gain = 1) {
  const i0 = Math.round(t * SR), { L, R } = bus;
  for (let i = Math.max(0, -i0), n = Math.min(l.length, L.length - i0); i < n; i++) { L[i0 + i] += l[i] * gain; R[i0 + i] += r[i] * gain; }
}
// mix a whole bus into another
export function sum(into, from, gain = 1) {
  for (let i = 0; i < into.n; i++) { into.L[i] += from.L[i] * gain; into.R[i] += from.R[i] * gain; }
}

// ---------- filters ----------
// Zavalishin/Simper trapezoidal state-variable filter: stable under per-sample cutoff sweeps
export class SVF {
  constructor(fc = 1000, q = 0.707) { this.ic1 = 0; this.ic2 = 0; this.set(fc, q); }
  set(fc, q) {
    const g = Math.tan((Math.PI * Math.min(Math.max(fc, 10), SR * 0.45)) / SR);
    this.k = 1 / q; this.a1 = 1 / (1 + g * (g + this.k)); this.a2 = g * this.a1; this.a3 = g * this.a2;
  }
  // one sample in; lp, bp and hp out on the instance
  run(v0) {
    const v3 = v0 - this.ic2, v1 = this.a1 * this.ic1 + this.a2 * v3, v2 = this.ic2 + this.a2 * this.ic1 + this.a3 * v3;
    this.ic1 = 2 * v1 - this.ic1; this.ic2 = 2 * v2 - this.ic2;
    this.lp = v2; this.bp = v1; this.hp = v0 - this.k * v1 - v2;
    return v2;
  }
}

// RBJ cookbook biquad, transposed direct form II
export class Biquad {
  constructor(type, fc, q = 0.707, gainDb = 0) {
    const A = Math.pow(10, gainDb / 40), w = (TAU * fc) / SR, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q);
    let b0, b1, b2, a0, a1, a2;
    if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else if (type === 'bp') { b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    else if (type === 'peak') { b0 = 1 + al * A; b1 = -2 * c; b2 = 1 - al * A; a0 = 1 + al / A; a1 = -2 * c; a2 = 1 - al / A; }
    else if (type === 'lowshelf' || type === 'highshelf') {
      const sq = 2 * Math.sqrt(A) * al, sg = type === 'lowshelf' ? 1 : -1;
      b0 = A * ((A + 1) - sg * (A - 1) * c + sq); b1 = sg * 2 * A * ((A - 1) - sg * (A + 1) * c); b2 = A * ((A + 1) - sg * (A - 1) * c - sq);
      a0 = (A + 1) + sg * (A - 1) * c + sq; a1 = -sg * 2 * ((A - 1) + sg * (A + 1) * c); a2 = (A + 1) + sg * (A - 1) * c - sq;
    } else throw new Error(`Biquad: unknown type ${type}`);
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0; this.z1 = 0; this.z2 = 0;
  }
  run(x) { const y = this.b0 * x + this.z1; this.z1 = this.b1 * x - this.a1 * y + this.z2; this.z2 = this.b2 * x - this.a2 * y; return y; }
  // filter a whole array in place
  apply(a) { for (let i = 0; i < a.length; i++) a[i] = this.run(a[i]); return a; }
}
// one filter chain per channel over a bus, in place: specs are [type, fc, q, gainDb]
export function eqBus(bus, specs) {
  for (const ch of [bus.L, bus.R]) for (const s of specs) new Biquad(...s).apply(ch);
}

// ---------- envelopes and helpers ----------
// a sample's amplitude: linear attack, exponential decay (time constant tau)
export const ad = (t, atk, tau) => (t < atk ? t / atk : Math.exp(-(t - atk) / tau));
// smooth fade over the last `s` seconds of a signal, and over the first `a` seconds, in place
export function fades(sig, a = 0.002, s = 0.005) {
  const na = len(a), ns = len(s), n = sig.length;
  for (let i = 0; i < Math.min(na, n); i++) sig[i] *= i / na;
  for (let i = 0; i < Math.min(ns, n); i++) sig[n - 1 - i] *= i / ns;
  return sig;
}
export const softclip = (x, drive = 1) => Math.tanh(x * drive) / Math.tanh(drive);

// band-limited sawtooth step correction (PolyBLEP)
function blep(p, dt) {
  if (p < dt) { p /= dt; return p + p - p * p - 1; }
  if (p > 1 - dt) { p = (p - 1) / dt; return p * p + p + p + 1; }
  return 0;
}

// white noise, seeded
export function noise(dur, r) { const n = len(dur), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = r() * 2 - 1; return o; }

// ---------- instruments (each returns a mono Float32Array starting at the note's onset) ----------

// warm analog pad voice: two detuned PolyBLEP saws through a slowly opening low-pass, ADSR. `detune` in cents
export function padVoice(f, dur, { atk = 0.35, rel = 0.9, detune = 7, cut0 = 500, cut1 = 2200, q = 0.8, r }) {
  const n = len(dur + rel), o = new Float32Array(n), flt = new SVF(cut0, q);
  const f1 = f * Math.pow(2, detune / 1200), f2 = f * Math.pow(2, -detune / 1200);
  let p1 = r(), p2 = r();
  const d1 = f1 / SR, d2 = f2 / SR, nd = len(dur);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const s1 = 2 * p1 - 1 - blep(p1, d1), s2 = 2 * p2 - 1 - blep(p2, d2);
    p1 += d1; if (p1 >= 1) p1 -= 1; p2 += d2; if (p2 >= 1) p2 -= 1;
    if ((i & 31) === 0) flt.set(cut0 + (cut1 - cut0) * Math.min(1, t / (atk * 2.5)), q);
    const env = (t < atk ? Math.sin((t / atk) * Math.PI / 2) ** 2 : 1) * (i < nd ? 1 : Math.exp(-(i - nd) / (rel * SR / 4.6)));
    o[i] = flt.run((s1 + s2) * 0.5) * env;
  }
  return fades(o, 0.001, 0.02);
}

// marimba-like struck bar: fundamental, the 4th and 10th tuned overtones and a felt-mallet thump
export function mallet(f, { decay = 0.55, bright = 1, r }) {
  const dur = decay * 5, n = len(dur), o = new Float32Array(n), thump = new SVF(f * 2, 0.7);
  const parts = [[1, 1, decay], [3.98, 0.28 * bright, decay * 0.22], [9.9, 0.07 * bright, decay * 0.08]].filter(([k]) => k * f < SR * 0.42);
  const ph = parts.map(() => r() * 0.2);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = 0;
    for (let k = 0; k < parts.length; k++) s += Math.sin(TAU * (parts[k][0] * f * t + ph[k])) * parts[k][1] * Math.exp(-t / parts[k][2]);
    const nz = t < 0.012 ? thump.run((r() * 2 - 1) * (1 - t / 0.012)) * 0.25 * bright : 0;
    o[i] = (s + nz) * Math.min(1, t / 0.0015);
  }
  return fades(o, 0.0005, 0.01);
}

// glockenspiel / bell bar: inharmonic partials of a free bar, long shimmer
export function bell(f, { decay = 1.4, r }) {
  const parts = [[1, 1, decay], [2.756, 0.42, decay * 0.45], [5.404, 0.2, decay * 0.22], [8.933, 0.09, decay * 0.12]].filter(([k]) => k * f < SR * 0.4);
  const n = len(decay * 4.5), o = new Float32Array(n), ph = parts.map(() => r());
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = 0;
    for (let k = 0; k < parts.length; k++) s += Math.sin(TAU * (parts[k][0] * f * t + ph[k])) * parts[k][1] * Math.exp(-t / parts[k][2]);
    o[i] = s * Math.min(1, t / 0.001);
  }
  return fades(o, 0.0005, 0.02);
}

// plucked string (Karplus-Strong with an allpass fine tune): `t60` the ring time, `bright` 0..1, `pick` the pluck point
export function pluck(f, { t60 = 1.2, bright = 0.6, pick = 0.18, dur = t60 * 1.1, r }) {
  const s = 0.5 * (1 - bright * 0.9);            // loop low-pass weight: 0.5 darkest, smaller brighter
  const total = SR / f, P = Math.max(2, Math.floor(total - s - 0.1)), frac = total - s - P, C = (1 - frac) / (1 + frac);
  const rho = Math.pow(10, -3 / (t60 * f));       // per-period loss for the ring time
  const buf = new Float32Array(P), excite = new SVF(800 + 9000 * bright, 0.6);
  for (let i = 0; i < P; i++) buf[i] = excite.run(r() * 2 - 1);
  const pk = Math.max(1, Math.round(P * pick)), comb = Float32Array.from(buf, (v, i) => v - (i >= pk ? buf[i - pk] : 0) * 0.9);
  buf.set(comb);
  const n = len(dur), o = new Float32Array(n);
  let idx = 0, prev = 0, apx = 0, apy = 0;
  for (let i = 0; i < n; i++) {
    const x = buf[idx];
    const lp = rho * ((1 - s) * x + s * prev); prev = x;
    const ap = C * lp + apx - C * apy; apx = lp; apy = ap;
    buf[idx] = ap; o[i] = x;
    if (++idx === P) idx = 0;
  }
  return fades(o, 0.0008, 0.03);
}

// round electric-style bass: sine with 2nd and 3rd harmonics, gently saturated, plucky envelope
export function bassNote(f, dur, { r }) {
  const rel = 0.06, n = len(dur + rel), o = new Float32Array(n), nd = len(dur), lp = new SVF(900, 0.6);
  let ph = r();
  for (let i = 0; i < n; i++) {
    const t = i / SR, p = TAU * ph;
    ph += f / SR;
    const tone = Math.sin(p) + 0.32 * Math.sin(2 * p) + 0.1 * Math.sin(3 * p);
    const env = Math.min(1, t / 0.004) * (0.62 + 0.38 * Math.exp(-t / 0.12)) * (i < nd ? 1 : Math.exp(-(i - nd) / (rel * SR / 5)));
    o[i] = lp.run(softclip(tone * 0.8, 1.6)) * env;
  }
  return fades(o, 0.001, 0.01);
}

// ---------- drums ----------
export function kick({ punch = 1, r }) {
  const n = len(0.5), o = new Float32Array(n), click = new SVF(3500, 0.7);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = 54 + (165 - 54) * Math.exp(-t / 0.032);
    ph += f / SR;
    const body = Math.sin(TAU * ph) * Math.exp(-t / 0.17) * Math.min(1, t / 0.001);
    click.run(r() * 2 - 1);
    o[i] = softclip(body * 1.15, 1.3) + click.hp * 0.22 * punch * Math.exp(-t / 0.0025);
  }
  return fades(o, 0.0002, 0.02);
}
export function clap({ r }) {
  const n = len(0.35), o = new Float32Array(n), bp = new SVF(1250, 0.9), hp = new Biquad('hp', 600);
  const bursts = [0, 0.0095, 0.019];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let env = 0;
    for (const b of bursts) if (t >= b && t < 0.028) env = Math.max(env, Math.exp(-(t - b) / 0.004));
    if (t >= 0.027) env = Math.max(env, 0.85 * Math.exp(-(t - 0.027) / 0.1));
    bp.run(r() * 2 - 1);
    o[i] = hp.run(bp.bp * env * 2.2);
  }
  return fades(o, 0.0002, 0.02);
}
export function snare({ r }) {
  const n = len(0.3), o = new Float32Array(n), bp = new SVF(1900, 0.7), hp = new Biquad('hp', 900);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const tone = (Math.sin(TAU * 188 * t) * 0.7 + Math.sin(TAU * 332 * t) * 0.35) * Math.exp(-t / 0.05);
    bp.run(r() * 2 - 1);
    o[i] = tone * 0.6 + hp.run(bp.bp) * 1.4 * Math.exp(-t / 0.11) * Math.min(1, t / 0.0008);
  }
  return fades(o, 0.0002, 0.02);
}
// shaker / closed hat: high-passed noise with a short envelope (`decay`), `tone` the band centre
export function shaker({ decay = 0.045, atk = 0.006, tone = 7000, r }) {
  const n = len(atk + decay * 6), o = new Float32Array(n), f = new SVF(tone, 1.1);
  for (let i = 0; i < n; i++) { const t = i / SR; f.run(r() * 2 - 1); o[i] = (f.hp * 0.6 + f.bp * 0.9) * ad(t, atk, decay); }
  return fades(o, 0.0002, 0.005);
}
// tambourine: two jingle bands, a double strike
export function tambourine({ r }) {
  const n = len(0.32), o = new Float32Array(n), a = new SVF(9400, 3), b = new SVF(6700, 3);
  for (let i = 0; i < n; i++) {
    const t = i / SR, x = r() * 2 - 1;
    a.run(x); b.run(x);
    const env = ad(t, 0.002, 0.07) + (t > 0.016 ? 0.6 * ad(t - 0.016, 0.002, 0.09) : 0);
    o[i] = (a.bp + b.bp * 0.8) * env * 1.6;
  }
  return fades(o, 0.0002, 0.01);
}
// crash: metallic square cluster (the classic six-oscillator cymbal) over bright noise, long decay
export function crash({ decay = 1.3, r }) {
  const n = len(decay * 3.5), o = new Float32Array(n), hp = new SVF(5200, 0.8), hp2 = new Biquad('hp', 4000);
  const fs = [263, 400, 421, 474, 587, 845].map((v) => v * 2.1), ph = fs.map(() => r());
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let m = 0;
    for (let k = 0; k < 6; k++) { ph[k] += fs[k] / SR; if (ph[k] >= 1) ph[k] -= 1; m += ph[k] < 0.5 ? 1 : -1; }
    hp.run(m * 0.12 + (r() * 2 - 1));
    o[i] = hp2.run(hp.hp) * ad(t, 0.002, decay) * 0.8;
  }
  return fades(o, 0.0003, 0.05);
}

// ---------- sound effects ----------
// a filtered-noise sweep: band centre from f0 to f1 (exponential), shaped by a raised-sine bell peaking at `peak` (0..1)
export function sweep(dur, { f0 = 400, f1 = 4000, q = 1.2, peak = 0.5, curve = 1, r }) {
  const n = len(dur), o = new Float32Array(n), f = new SVF(f0, q);
  for (let i = 0; i < n; i++) {
    const p = i / n;
    if ((i & 15) === 0) f.set(f0 * Math.pow(f1 / f0, Math.pow(p, curve)), q);
    const e = p < peak ? Math.sin((p / peak) * Math.PI / 2) ** 2 : Math.cos(((p - peak) / (1 - peak)) * Math.PI / 2) ** 2;
    f.run(r() * 2 - 1);
    o[i] = f.bp * e;
  }
  return fades(o, 0.001, 0.005);
}
// a sine whose pitch glides from f0 to f1 over `glide` s, exp decay `tau`
export function blip(f0, f1, { glide = 0.03, tau = 0.04, atk = 0.001, r }) {
  const n = len(atk + tau * 7), o = new Float32Array(n);
  let ph = r ? r() : 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = f0 * Math.pow(f1 / f0, Math.min(1, t / glide));
    ph += f / SR;
    o[i] = Math.sin(TAU * ph) * ad(t, atk, tau);
  }
  return fades(o, 0.0005, 0.005);
}
// a key or button click: a band-limited noise tick over a short wooden thock
export function click({ tone = 3200, body = 220, tick = 1, thock = 0.6, len: l = 0.005, r }) {
  const n = len(0.06), o = new Float32Array(n), bp = new SVF(tone, 1.4);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    bp.run(r() * 2 - 1);
    o[i] = bp.bp * tick * 2 * ad(t, 0.0004, l) + Math.sin(TAU * body * t) * thock * ad(t, 0.0008, 0.011);
  }
  return fades(o, 0.0002, 0.004);
}
// low impact: a falling sine thump with a soft noise transient
export function impact({ f0 = 70, f1 = 38, tau = 0.45, r }) {
  const n = len(tau * 5), o = new Float32Array(n), lp = new SVF(900, 0.7);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = f1 + (f0 - f1) * Math.exp(-t / 0.08);
    ph += f / SR;
    lp.run(r() * 2 - 1);
    o[i] = Math.sin(TAU * ph) * ad(t, 0.003, tau) + lp.lp * 0.5 * ad(t, 0.001, 0.025);
  }
  return fades(o, 0.0005, 0.05);
}
// reverse swell: high-passed noise rising to a hard stop at its end (a reversed cymbal)
export function swell(dur, { tone = 5000, pow = 3, r }) {
  const n = len(dur), o = new Float32Array(n), hp = new SVF(tone, 0.8);
  for (let i = 0; i < n; i++) { hp.run(r() * 2 - 1); o[i] = (hp.hp * 0.7 + hp.bp * 0.5) * Math.pow(i / n, pow); }
  return fades(o, 0.005, 0.004);
}

// ---------- space ----------
// stereo feedback-delay-network reverb (8 lines, Householder mix, damped): wet signal only, same length as the input
export function reverb(bus, { rt60 = 1.6, damp = 5500, pre = 0.018, width = 1 } = {}) {
  const ms = [31.1, 37.3, 41.9, 47.3, 53.1, 59.9, 67.3, 73.7], N = 8;
  const lens = ms.map((v) => Math.round((v / 1000) * SR)), lines = lens.map((l) => new Float32Array(l)), idx = new Array(N).fill(0);
  const g = lens.map((l) => Math.pow(10, (-3 * l) / (rt60 * SR))), lpz = new Float32Array(N), dc = Math.exp((-TAU * damp) / SR);
  // input diffusion: two allpasses per side
  const mkAp = (l, k) => ({ b: new Float32Array(Math.round((l / 1000) * SR)), i: 0, k });
  const apL = [mkAp(4.77, 0.62), mkAp(11.3, 0.55)], apR = [mkAp(5.31, 0.62), mkAp(12.7, 0.55)];
  const ap = (a, x) => { const d = a.b[a.i], y = -a.k * x + d; a.b[a.i] = x + a.k * y; if (++a.i === a.b.length) a.i = 0; return y; };
  const pd = Math.max(1, Math.round(pre * SR)), preL = new Float32Array(pd), preR = new Float32Array(pd);
  const out = new Bus(bus.n), y = new Float32Array(N);
  let pi = 0;
  for (let n = 0; n < bus.n; n++) {
    let inL = preL[pi], inR = preR[pi];
    preL[pi] = bus.L[n]; preR[pi] = bus.R[n]; if (++pi === pd) pi = 0;
    inL = ap(apL[1], ap(apL[0], inL)); inR = ap(apR[1], ap(apR[0], inR));
    let s = 0;
    for (let k = 0; k < N; k++) { const v = lines[k][idx[k]]; lpz[k] = v * (1 - dc) + lpz[k] * dc; y[k] = lpz[k] * g[k]; s += y[k]; }
    s *= 2 / N;
    let oL = 0, oR = 0;
    for (let k = 0; k < N; k++) {
      const v = y[k] - s;
      lines[k][idx[k]] = v + (k & 1 ? inR : inL) * 0.35;
      if (++idx[k] === lens[k]) idx[k] = 0;
      if (k & 1) oR += k & 2 ? -y[k] : y[k]; else oL += k & 2 ? -y[k] : y[k];
    }
    const mid = (oL + oR) / 2, side = ((oL - oR) / 2) * width;
    out.L[n] = (mid + side) * 0.5; out.R[n] = (mid - side) * 0.5;
  }
  return out;
}
