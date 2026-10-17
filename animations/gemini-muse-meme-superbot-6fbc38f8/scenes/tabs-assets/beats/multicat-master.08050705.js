// Mastering for the multicat soundtrack (multicat-score.08050705.js): an ITU-R BS.1770-4 loudness meter (K-weighting,
// 400 ms blocks at 75% overlap, absolute -70 LUFS and relative -10 LU gates), a 4x-oversampled true-peak meter and a
// look-ahead true-peak limiter, so the mix is set to a measured integrated loudness with no inter-sample overs.
// Pure functions over Float32Arrays at 48 kHz.
import { SR } from './multicat-dsp.08050705.js';

// the K-weighting pre-filter (shelf, then RLB high-pass), BS.1770-4's own 48 kHz coefficients
const K1 = { b: [1.53512485958697, -2.69169618940638, 1.19839281085285], a: [-1.69065929318241, 0.73248077421585] };
const K2 = { b: [1, -2, 1], a: [-1.99004745483398, 0.99007225036621] };
function kWeight(x) {
  const o = new Float64Array(x.length);
  let s = [0, 0], u = [0, 0];
  for (let i = 0; i < x.length; i++) {
    const y1 = K1.b[0] * x[i] + s[0]; s[0] = K1.b[1] * x[i] - K1.a[0] * y1 + s[1]; s[1] = K1.b[2] * x[i] - K1.a[1] * y1;
    const y2 = K2.b[0] * y1 + u[0]; u[0] = K2.b[1] * y1 - K2.a[0] * y2 + u[1]; u[1] = K2.b[2] * y1 - K2.a[1] * y2;
    o[i] = y2;
  }
  return o;
}
const lufs = (ms) => -0.691 + 10 * Math.log10(ms);

// mean-square of each 400 ms block (100 ms hop) of the K-weighted stereo sum
function blocks(L, R) {
  const kl = kWeight(L), kr = kWeight(R), B = Math.round(0.4 * SR), H = Math.round(0.1 * SR), out = [];
  for (let s = 0; s + B <= L.length; s += H) {
    let acc = 0;
    for (let i = s; i < s + B; i++) acc += kl[i] * kl[i] + kr[i] * kr[i];
    out.push(acc / B);
  }
  return out;
}
// integrated loudness, gated (LUFS)
export function integrated(L, R) {
  const z = blocks(L, R).filter((m) => lufs(m) > -70);
  if (!z.length) return -Infinity;
  const rel = lufs(z.reduce((a, b) => a + b, 0) / z.length) - 10;
  const g = z.filter((m) => lufs(m) > rel);
  return lufs(g.reduce((a, b) => a + b, 0) / g.length);
}
// short-term loudness (3 s window) every `step` seconds, for the mix report
export function shortTerm(L, R, step = 0.5) {
  const kl = kWeight(L), kr = kWeight(R), W = 3 * SR, out = [];
  for (let e = Math.round(step * SR); e <= L.length; e += Math.round(step * SR)) {
    let acc = 0;
    const s = Math.max(0, e - W);
    for (let i = s; i < e; i++) acc += kl[i] * kl[i] + kr[i] * kr[i];
    out.push([+(e / SR).toFixed(2), +lufs(acc / W).toFixed(1)]);
  }
  return out;
}

// 4x polyphase interpolator (windowed sinc, 12 taps a phase): the inter-sample estimate between x[i] and x[i+1]
const TAPS = 12, PH = 4;
const FIR = (() => {
  const h = [];
  for (let p = 1; p < PH; p++) {
    const row = [];
    for (let k = 0; k < TAPS; k++) {
      const x = k - TAPS / 2 + 1 - p / PH, w = 0.5 + 0.5 * Math.cos((Math.PI * x) / (TAPS / 2 + 1));
      row.push(x === 0 ? 1 : (Math.sin(Math.PI * x) / (Math.PI * x)) * w);
    }
    h.push(row);
  }
  return h;
})();
// the largest absolute value at sample i and the three interpolated points after it
function tpAt(x, i) {
  let m = Math.abs(x[i]);
  for (const row of FIR) {
    let s = 0;
    for (let k = 0; k < TAPS; k++) { const j = i + k - TAPS / 2 + 1; if (j >= 0 && j < x.length) s += x[j] * row[k]; }
    if (Math.abs(s) > m) m = Math.abs(s);
  }
  return m;
}
export function truePeak(L, R) {
  let m = 0;
  for (let i = 0; i < L.length; i++) m = Math.max(m, tpAt(L, i), tpAt(R, i));
  return 20 * Math.log10(m || 1e-12);
}

// look-ahead limiter on the true-peak estimate: the gain each sample needs, its minimum over the next `ahead` samples,
// an exponential release, then a moving average as long as the look-ahead, so the gain is already down when a peak arrives
function limit(L, R, ceilingDb, aheadMs = 1.5, releaseMs = 90) {
  const c = Math.pow(10, ceilingDb / 20), n = L.length, A = Math.max(2, Math.round((aheadMs / 1000) * SR));
  const need = new Float32Array(n);
  let any = false;
  for (let i = 0; i < n; i++) {
    const p = Math.max(Math.abs(L[i]), Math.abs(R[i])) > c * 0.5 ? Math.max(tpAt(L, i), tpAt(R, i)) : 0;
    need[i] = p > c ? c / p : 1;
    if (need[i] < 1) any = true;
  }
  if (!any) return 0;
  // forward-looking minimum over [i, i + A] (monotonic deque)
  const fmin = new Float32Array(n), dq = new Int32Array(n);
  let h = 0, tl = 0;
  for (let i = n - 1; i >= 0; i--) {
    while (tl > h && need[dq[tl - 1]] >= need[i]) tl--;
    dq[tl++] = i;
    while (dq[h] > i + A) h++;
    fmin[i] = need[dq[h]];
  }
  // the average of the last A envelope values is at most the gain any peak inside them needs, and it moves smoothly
  const rel = Math.exp(-1 / ((releaseMs / 1000) * SR));
  const ring = new Float64Array(A).fill(1);
  let env = 1, acc = A, most = 1;
  for (let i = 0; i < n; i++) {
    env = fmin[i] < env ? fmin[i] : 1 - (1 - env) * rel;
    acc += env - ring[i % A]; ring[i % A] = env;
    const g = acc / A;
    L[i] *= g; R[i] *= g;
    if (g < most) most = g;
  }
  return -20 * Math.log10(most);
}

const scale = (L, R, g) => { for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; } };

// set the mix to `target` LUFS integrated with true peaks under `ceiling` dBTP, in place; returns the measured result
export function master(L, R, { target = -16, ceiling = -1 } = {}) {
  let lim = 0;
  for (let pass = 0; pass < 4; pass++) {
    const now = integrated(L, R), err = target - now;
    if (pass > 0 && Math.abs(err) < 0.05) break;
    scale(L, R, Math.pow(10, err / 20));
    lim = Math.max(lim, limit(L, R, ceiling - 0.3));
  }
  return { lufs: +integrated(L, R).toFixed(2), truePeak: +truePeak(L, R).toFixed(2), maxLimitDb: +lim.toFixed(2) };
}
