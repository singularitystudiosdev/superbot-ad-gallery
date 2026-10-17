// The multicat score's mastering (multicat-score.96834de7.js): the rendered bed is measured with an ITU-R BS.1770
// integrated loudness meter (K-weighting, 400 ms blocks at 75% overlap, -70 LUFS absolute and -10 LU relative gates),
// brought to a target loudness, then held under a sample-peak ceiling by a lookahead limiter (a held minimum of the gain
// each sample needs, box-smoothed over the lookahead so it never clicks, released over 80 ms). Operates in place.

// BS.1770 K-weighting at 48 kHz: the head shelf, then the RLB highpass
const SHELF = { b: [1.53512485958697, -2.69169618940638, 1.19839281085285], a: [-1.69065929318241, 0.73248077421585] };
const RLB = { b: [1, -2, 1], a: [-1.99004745483398, 0.99007225036621] };

function biquad(x, { b, a }) {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[0] * y1 - a[1] * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}

// integrated loudness of [from, to) seconds of the stereo buffer, in LUFS
export function loudness(buf, from = 0, to = buf.duration) {
  if (buf.sampleRate !== 48000) throw new Error(`loudness: K-weighting coefficients are for 48 kHz, got ${buf.sampleRate}`);
  const sr = buf.sampleRate, a = Math.round(from * sr), z = Math.min(buf.length, Math.round(to * sr));
  const chans = [0, 1].map((c) => biquad(biquad(buf.getChannelData(c).subarray(a, z), SHELF), RLB));
  const block = Math.round(0.4 * sr), hop = Math.round(0.1 * sr), blocks = [];
  for (let s = 0; s + block <= z - a; s += hop) {
    let e = 0;
    for (const ch of chans) for (let i = s; i < s + block; i++) e += ch[i] * ch[i];
    blocks.push(e / block);
  }
  const lufs = (ms) => -0.691 + 10 * Math.log10(ms);
  const mean = (xs) => xs.reduce((s, v) => s + v, 0) / xs.length;
  const abs = blocks.filter((e) => lufs(e) > -70);
  if (!abs.length) return -Infinity;
  const rel = lufs(mean(abs)) - 10;
  return lufs(mean(abs.filter((e) => lufs(e) > rel)));
}

export function gain(buf, g) {
  for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= g; }
}

// hold every sample at or under `ceiling` (linear), in place; returns the deepest gain reduction applied, in dB
export function limit(buf, ceiling, lookahead = 0.003, release = 0.08) {
  const sr = buf.sampleRate, n = buf.length, look = Math.max(1, Math.round(lookahead * sr));
  const L = buf.getChannelData(0), R = buf.getChannelData(1);
  const need = new Float32Array(n);
  for (let i = 0; i < n; i++) { const p = Math.max(Math.abs(L[i]), Math.abs(R[i])); need[i] = p > ceiling ? ceiling / p : 1; }
  // held minimum over the next `look` samples (a monotonic deque)
  const held = new Float32Array(n), q = new Int32Array(n + look);
  let head = 0, tail = 0;
  for (let i = n - 1; i >= 0; i--) {
    while (tail > head && need[q[tail - 1]] >= need[i]) tail--;
    q[tail++] = i;
    while (q[head] > i + look - 1) head++;
    held[i] = need[q[head]];
  }
  // trailing box average over `look` (still reaches each peak's need by the peak), then an 80 ms release
  const rel = 1 - Math.exp(-1 / (release * sr));
  // (the samples before the first count as unity gain)
  let sum = look, g = 1, deepest = 1;
  for (let i = 0; i < n; i++) {
    sum += held[i] - (i >= look ? held[i - look] : 1);
    const box = sum / look;
    g = box < g ? box : g + (box - g) * rel;
    L[i] *= g; R[i] *= g;
    if (g < deepest) deepest = g;
  }
  return 20 * Math.log10(deepest);
}

export function peak(buf) {
  let p = 0;
  for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) p = Math.max(p, Math.abs(d[i])); }
  return p;
}
