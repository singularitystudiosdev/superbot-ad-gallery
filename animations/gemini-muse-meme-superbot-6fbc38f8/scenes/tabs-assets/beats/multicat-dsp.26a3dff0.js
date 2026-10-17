// The multicat spot's sound engine, part 1: plain DSP over Float32Arrays at 48 kHz, with no Web Audio nodes, so the
// mix renders sample for sample the same in a worker, a page or node: seeded noise, RBJ biquads, band-limited
// oscillators, a stereo bus, an FDN reverb, a glue compressor, a BS.1770-4 loudness meter and a lookahead true-peak
// limiter. Nothing here knows the spot; multicat-score.26a3dff0.js writes the music and the effects with it.

export const SR = 48000;
export const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const db = (d) => Math.pow(10, d / 20);
export const len = (s) => Math.max(1, Math.ceil(s * SR));
const TAU = 2 * Math.PI;

// mulberry32: the same stream for the same seed, so every render is identical
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

export function noise(n, r) {
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = r() * 2 - 1;
  return x;
}

// RBJ cookbook biquad: lp, hp, bp (0 dB peak), peak, hs, ls
export class Biquad {
  constructor(type, f, q = 0.707, gain = 0) {
    this.type = type;
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
    this.set(f, q, gain);
  }
  set(f, q = this.q, gain = this.gain) {
    this.q = q; this.gain = gain;
    const w = TAU * Math.min(Math.max(f, 10), SR * 0.48) / SR, cw = Math.cos(w), al = Math.sin(w) / (2 * q), A = Math.pow(10, gain / 40);
    const sq = 2 * Math.sqrt(A) * al;
    let b0, b1, b2, a0, a1, a2;
    switch (this.type) {
      case 'lp': b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; break;
      case 'hp': b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; break;
      case 'bp': b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al; break;
      case 'peak': b0 = 1 + al * A; b1 = -2 * cw; b2 = 1 - al * A; a0 = 1 + al / A; a1 = -2 * cw; a2 = 1 - al / A; break;
      case 'hs': b0 = A * ((A + 1) + (A - 1) * cw + sq); b1 = -2 * A * ((A - 1) + (A + 1) * cw); b2 = A * ((A + 1) + (A - 1) * cw - sq); a0 = (A + 1) - (A - 1) * cw + sq; a1 = 2 * ((A - 1) - (A + 1) * cw); a2 = (A + 1) - (A - 1) * cw - sq; break;
      case 'ls': b0 = A * ((A + 1) - (A - 1) * cw + sq); b1 = 2 * A * ((A - 1) - (A + 1) * cw); b2 = A * ((A + 1) - (A - 1) * cw - sq); a0 = (A + 1) + (A - 1) * cw + sq; a1 = -2 * ((A - 1) + (A + 1) * cw); a2 = (A + 1) + (A - 1) * cw - sq; break;
      default: throw new Error(`unknown biquad type: ${this.type}`);
    }
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = a1 / a0; this.a2 = a2 / a0;
  }
  tick(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

// filter x in place; f (Hz) may be a function of the sample's time in seconds, re-read every 32 samples (a sweep)
export function filter(x, type, f, q = 0.707, gain = 0) {
  const sweep = typeof f === 'function';
  const bq = new Biquad(type, sweep ? f(0) : f, q, gain);
  for (let i = 0; i < x.length; i++) {
    if (sweep && (i & 31) === 0) bq.set(f(i / SR));
    x[i] = bq.tick(x[i]);
  }
  return x;
}

// multiply x in place by an envelope of time in seconds
export function shape(x, env) {
  for (let i = 0; i < x.length; i++) x[i] *= env(i / SR);
  return x;
}

// a percussive envelope: linear attack, exponential decay, and a short fade to exact silence at the buffer's end
export const perc = (att, dec, n) => (t) => (t < att ? t / att : Math.exp(-(t - att) / dec)) * Math.min(1, (n / SR - t) / 0.004);

// a sine whose frequency is a function of time (a kick's drop, an impact's fall)
export function sine(n, f) {
  const x = new Float32Array(n), fn = typeof f === 'function';
  let ph = 0;
  for (let i = 0; i < n; i++) { x[i] = Math.sin(TAU * ph); ph += (fn ? f(i / SR) : f) / SR; }
  return x;
}

// polyBLEP sawtooth: alias-suppressed, so the plucks stay clean up top
const blep = (p, dt) => (p < dt ? (p /= dt, p + p - p * p - 1) : p > 1 - dt ? (p = (p - 1) / dt, p * p + p + p + 1) : 0);
export function saw(n, f, ph = 0) {
  const x = new Float32Array(n), dt = f / SR;
  let p = ph;
  for (let i = 0; i < n; i++) { x[i] = 2 * p - 1 - blep(p, dt); p += dt; if (p >= 1) p -= 1; }
  return x;
}

// two-operator FM: a clean glassy pluck (ratio 2, harmonic) whose brightness falls with its index
export function fm(n, f, { ratio = 2, index = 2.4, idec = 0.12, floor = 0.25 } = {}) {
  const x = new Float32Array(n);
  let pc = 0, pm = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, I = index * Math.exp(-t / idec) + floor;
    x[i] = Math.sin(TAU * pc + I * Math.sin(TAU * pm));
    pc += f / SR; pm += (f * ratio) / SR;
  }
  return x;
}

export const sat = (x, drive) => { const k = Math.tanh(drive); for (let i = 0; i < x.length; i++) x[i] = Math.tanh(drive * x[i]) / k; return x; };

// a stereo bus: mono voices land on it at a time, a gain and an equal-power pan
export class Bus {
  constructor(n) { this.n = n; this.L = new Float32Array(n); this.R = new Float32Array(n); }
  add(x, t, g = 1, pan = 0) {
    const a = (pan + 1) * Math.PI / 4;
    this.addSt(x, x, t, g * Math.cos(a) * Math.SQRT2, g * Math.sin(a) * Math.SQRT2);
  }
  addSt(l, r, t, gl = 1, gr = gl) {
    const o = Math.round(t * SR), m = Math.min(l.length, this.n - o);
    for (let i = Math.max(0, -o); i < m; i++) { this.L[o + i] += l[i] * gl; this.R[o + i] += r[i] * gr; }
  }
  mix(b, g = 1) { for (let i = 0; i < this.n; i++) { this.L[i] += b.L[i] * g; this.R[i] += b.R[i] * g; } }
  gain(fn) { for (let i = 0; i < this.n; i++) { const g = fn(i); this.L[i] *= g; this.R[i] *= g; } }
  filter(type, f, q, gain) { filter(this.L, type, f, q, gain); filter(this.R, type, f, q, gain); }
}

// an 8-line feedback delay network (Householder mix, damped lines): a short, dense, unmuddy room for the send bus
export function reverb(bus, { rt60 = 1.2, pre = 0.014, damp = 6000, hp = 300 } = {}) {
  const out = new Bus(bus.n), D = [1201, 1427, 1663, 1871, 2143, 2393, 2659, 2953];
  const lines = D.map((d) => ({ buf: new Float32Array(d), i: 0, g: Math.pow(10, (-3 * d) / (rt60 * SR)), lp: 0 }));
  const pd = Math.round(pre * SR), dc = Math.exp(-TAU * damp / SR);
  const v = new Float32Array(8);
  for (let n = 0; n < bus.n; n++) {
    const inp = n >= pd ? (bus.L[n - pd] + bus.R[n - pd]) * 0.5 : 0;
    let sum = 0;
    for (let k = 0; k < 8; k++) { const ln = lines[k]; ln.lp = ln.buf[ln.i] * (1 - dc) + ln.lp * dc; v[k] = ln.lp * ln.g; sum += v[k]; }
    sum *= 2 / 8;
    let l = 0, r = 0;
    for (let k = 0; k < 8; k++) {
      const ln = lines[k];
      ln.buf[ln.i] = v[k] - sum + inp;
      ln.i = (ln.i + 1) % ln.buf.length;
      if (k & 1) r += v[k] * (k & 2 ? -1 : 1); else l += v[k] * (k & 2 ? -1 : 1);
    }
    out.L[n] = l * 0.35; out.R[n] = r * 0.35;
  }
  out.filter('hp', hp, 0.6);
  out.filter('lp', 9000, 0.6);
  return out;
}

// BS.1770-4 K-weighting at 48 kHz (the standard's published coefficients) and the gated integrated loudness, in LUFS
const KW = [[1.53512485958697, -2.69169618940638, 1.19839281085285, -1.69065929318241, 0.73248077421585], [1, -2, 1, -1.99004745483398, 0.99007225036621]];
function kweigh(x) {
  const y = Float64Array.from(x);
  for (const [b0, b1, b2, a1, a2] of KW) {
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < y.length; i++) { const o = b0 * y[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = y[i]; y2 = y1; y1 = o; y[i] = o; }
  }
  return y;
}
export function loudness(bus) {
  const l = kweigh(bus.L), r = kweigh(bus.R), B = Math.round(0.4 * SR), H = Math.round(0.1 * SR), blocks = [];
  for (let s = 0; s + B <= bus.n; s += H) {
    let e = 0;
    for (let i = s; i < s + B; i++) e += l[i] * l[i] + r[i] * r[i];
    blocks.push(e / B);
  }
  const lufs = (p) => -0.691 + 10 * Math.log10(p);
  const mean = (a) => a.reduce((p, q) => p + q, 0) / a.length;
  const abs = blocks.filter((p) => lufs(p) > -70);
  if (!abs.length) return -Infinity;
  const gate = lufs(mean(abs)) - 10, rel = abs.filter((p) => lufs(p) > gate);
  return lufs(mean(rel));
}

// a sample's peak with the three inter-sample points between it and the next (4-point Hermite), so a peak the
// player's resampler would make is caught too
function tpAt(x, i) {
  const y0 = x[i - 1] || 0, y1 = x[i], y2 = x[i + 1] || 0, y3 = x[i + 2] || 0;
  const c1 = 0.5 * (y2 - y0), c2 = y0 - 2.5 * y1 + 2 * y2 - 0.5 * y3, c3 = 0.5 * (y3 - y0) + 1.5 * (y1 - y2);
  let m = Math.abs(y1);
  for (const f of [0.25, 0.5, 0.75]) m = Math.max(m, Math.abs(((c3 * f + c2) * f + c1) * f + y1));
  return m;
}
export function truePeak(bus) {
  let m = 0;
  for (let i = 0; i < bus.n; i++) m = Math.max(m, tpAt(bus.L, i), tpAt(bus.R, i));
  return 20 * Math.log10(m || 1e-9);
}

// a feed-forward glue compressor on the stereo link's level (RMS, soft knee): it evens the hits into the bed
export function compress(bus, { thr = -18, ratio = 2, att = 0.01, rel = 0.16, knee = 6 } = {}) {
  const ca = Math.exp(-1 / (att * SR)), cr = Math.exp(-1 / (rel * SR)), cs = Math.exp(-1 / (0.008 * SR));
  let ms = 0, g = 0;
  for (let i = 0; i < bus.n; i++) {
    ms = cs * ms + (1 - cs) * Math.max(bus.L[i] * bus.L[i], bus.R[i] * bus.R[i]);
    const lv = 10 * Math.log10(ms + 1e-12), over = lv - thr;
    const red = over <= -knee / 2 ? 0 : over >= knee / 2 ? over * (1 - 1 / ratio) : ((1 - 1 / ratio) * (over + knee / 2) ** 2) / (2 * knee);
    g = red > g ? ca * g + (1 - ca) * red : cr * g + (1 - cr) * red;
    const k = db(-g);
    bus.L[i] *= k; bus.R[i] *= k;
  }
}

// a lookahead brickwall limiter on the true-peak estimate: the gain reaches what a peak needs before the peak arrives
// (a linear ramp over `look`) and recovers over `rel`, so nothing leaves above the ceiling
export function limit(bus, ceilDb, { look = 0.002, rel = 0.09 } = {}) {
  const c = db(ceilDb), n = bus.n, need = new Float32Array(n), L = Math.max(1, Math.round(look * SR));
  for (let i = 0; i < n; i++) need[i] = Math.min(1, c / Math.max(tpAt(bus.L, i), tpAt(bus.R, i), 1e-9));
  for (let i = n - 2; i >= 0; i--) need[i] = Math.min(need[i], need[i + 1] + 1 / L);
  const up = 1 - Math.exp(-1 / (rel * SR));
  let g = 1;
  for (let i = 0; i < n; i++) {
    g = Math.min(need[i], g + (1 - g) * up);
    bus.L[i] *= g; bus.R[i] *= g;
  }
}
