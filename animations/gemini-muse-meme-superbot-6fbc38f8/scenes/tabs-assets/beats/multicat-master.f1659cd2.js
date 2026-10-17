// The multicat soundtrack's master stage (multicat-score.f1659cd2.js runs it on the rendered mix), done offline on the whole
// buffer, both channels linked: a light glue compressor with no hidden makeup gain, a trim, then a lookahead brickwall
// limiter.

const db = (v) => Math.pow(10, v / 20);

// glue compressor: an RMS detector (mean square of both channels) with separate attack and release, a soft knee and a
// gentle ratio, so the bed and the song sit as one mix without the pump a peak detector would add on every transient.
// Returns the deepest gain reduction in dB
export function compress(buffer, { threshold = -18, ratio = 2, knee = 6, attack = 0.01, release = 0.15 } = {}) {
  const n = buffer.length, ch = [];
  for (let c = 0; c < buffer.numberOfChannels; c++) ch.push(buffer.getChannelData(c));
  const att = Math.exp(-1 / (attack * buffer.sampleRate)), rel = Math.exp(-1 / (release * buffer.sampleRate));
  let env = 0, deepest = 0;
  for (let i = 0; i < n; i++) {
    let p = 0;
    for (const d of ch) p += d[i] * d[i];
    p /= ch.length;
    env = p > env ? att * env + (1 - att) * p : rel * env + (1 - rel) * p;
    const lv = env > 1e-12 ? 10 * Math.log10(env) : -120, over = lv - threshold;
    let cut = 0;
    if (over >= knee / 2) cut = over * (1 - 1 / ratio);
    else if (over > -knee / 2) cut = ((over + knee / 2) ** 2 / (2 * knee)) * (1 - 1 / ratio);
    if (cut > 0) {
      const g = db(-cut);
      for (const d of ch) d[i] *= g;
      if (cut > deepest) deepest = cut;
    }
  }
  return -deepest;
}

export function trim(buffer, gainDb) {
  const g = db(gainDb);
  for (let c = 0; c < buffer.numberOfChannels; c++) { const d = buffer.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= g; }
}

// a sample's true peak: the larger of it and the waveform between it and the next sample, read at quarter steps by a
// 16-tap Hann-windowed sinc (4x oversampling, as a true-peak meter reads the overs a DAC draws on bright material)
const TAPS = 8;
const PHASES = [0.25, 0.5, 0.75].map((f) => Array.from({ length: 2 * TAPS }, (_, j) => {
  const x = f - (j - TAPS + 1);
  return (x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x)) * 0.5 * (1 + Math.cos(Math.PI * x / TAPS));
}));
function truePeak(d, i) {
  let m = Math.abs(d[i]);
  if (i < TAPS || i + TAPS >= d.length) return m;
  for (const h of PHASES) {
    let v = 0;
    for (let j = 0; j < h.length; j++) v += d[i + j - TAPS + 1] * h[j];
    if (Math.abs(v) > m) m = Math.abs(v);
  }
  return m;
}

// The limiter: one gain curve, each sample's needed gain (ceiling / its true peak), released forward over `release` s,
// then smoothed backward over `attack` s so the gain is already down when a peak arrives. Both passes only ever lower the
// curve, so nothing passes the ceiling.

export function limit(buffer, { ceiling = -1.5, attack = 0.003, release = 0.08 } = {}) {
  const n = buffer.length, ch = [];
  for (let c = 0; c < buffer.numberOfChannels; c++) ch.push(buffer.getChannelData(c));
  const top = db(ceiling), g = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let p = 0;
    for (const d of ch) { const a = Math.abs(d[i]) > top * 0.35 ? truePeak(d, i) : 0; if (a > p) p = a; }
    g[i] = p > top ? top / p : 1;
  }
  const rel = Math.exp(-1 / (release * buffer.sampleRate)), att = Math.exp(-1 / (attack * buffer.sampleRate));
  for (let i = 1; i < n; i++) { const back = 1 - (1 - g[i - 1]) * rel; if (back < g[i]) g[i] = back; }
  for (let i = n - 2; i >= 0; i--) { const ahead = 1 - (1 - g[i + 1]) * att; if (ahead < g[i]) g[i] = ahead; }
  let reduced = 1;
  for (let i = 0; i < n; i++) {
    if (g[i] < reduced) reduced = g[i];
    if (g[i] < 1) for (const d of ch) d[i] *= g[i];
  }
  return { maxReductionDb: 20 * Math.log10(reduced) };
}

// sample peak of the buffer in dBFS
export function peakDb(buffer) {
  let p = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) { const d = buffer.getChannelData(c); for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > p) p = a; } }
  return p > 0 ? 20 * Math.log10(p) : -Infinity;
}
