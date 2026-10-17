// The multicat variant's instruments and sound effects (beats/multicat-score.2e5dba12.js plays them), synthesized with
// Web Audio: no samples, no hotlinks. Every voice schedules its own nodes into any BaseAudioContext (the score renders
// offline) at an absolute time `at`, onto `out`. Noise and the plucked strings come from a seeded generator, so every
// render of the score is sample-identical.

export const hz = (m) => 440 * 2 ** ((m - 69) / 12);

// mulberry32: a small seeded generator, 0..1
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// per-context state: the shared noise loop, the plucked-string buffers, and where the next noise read starts
const caches = new WeakMap();
function cacheOf(ctx) {
  let c = caches.get(ctx);
  if (!c) caches.set(ctx, (c = { noise: null, plucks: new Map(), reads: 0 }));
  return c;
}

const gain = (ctx, v = 1) => { const g = ctx.createGain(); g.gain.value = v; return g; };
function filt(ctx, type, f, q = 0.707) { const n = ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; return n; }
const pan = (ctx, v) => { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, v)); return p; };
const chain = (...n) => { for (let i = 0; i + 1 < n.length; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; };
const send = (ctx, from, to, v) => { if (to) chain(from, gain(ctx, v), to); };
function osc(ctx, type, f, at, end) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, at);
  o.start(at);
  o.stop(end);
  return o;
}
// an attack-decay envelope: silence, up to `peak` over `a`, then an exponential fall to silence over `d`
function ad(p, at, peak, a, d) {
  p.setValueAtTime(0, at);
  p.linearRampToValueAtTime(peak, at + a);
  p.exponentialRampToValueAtTime(0.0001, at + a + d);
  p.setValueAtTime(0, at + a + d + 0.001);
}

// white noise from one shared two-second loop, each read starting somewhere new so repeats never sound alike
function noiseSrc(ctx, at, dur) {
  const c = cacheOf(ctx);
  if (!c.noise) {
    const n = ctx.sampleRate * 2, r = rng(7);
    c.noise = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = c.noise.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = r() * 2 - 1;
  }
  const s = ctx.createBufferSource();
  s.buffer = c.noise;
  s.loop = true;
  s.start(at, (c.reads++ * 0.1373) % 1.8);
  s.stop(at + dur + 0.05);
  return s;
}

// a room: a stereo impulse of decaying, darkened noise
export function makeVerb(ctx, secs = 1.5) {
  const sr = ctx.sampleRate, n = Math.floor(sr * secs), b = ctx.createBuffer(2, n, sr), r = rng(11);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      lp += 0.32 * (r() * 2 - 1 - lp);
      d[i] = lp * Math.pow(1 - i / n, 3.4) * Math.min(1, i / (sr * 0.01));
    }
  }
  const c = ctx.createConvolver();
  c.buffer = b;
  return c;
}

// ---------- the band: the song's own kit (indie pop, 120 bpm: kick, handclaps, shaker, bouncy bass, strummed guitar) ----------

export function kick(ctx, out, at, vel = 1) {
  const o = osc(ctx, 'sine', 150, at, at + 0.45), g = gain(ctx, 0);
  o.frequency.exponentialRampToValueAtTime(46, at + 0.12);
  ad(g.gain, at, vel, 0.002, 0.36);
  chain(o, g, out);
  const ng = gain(ctx, 0);
  ad(ng.gain, at, vel * 0.16, 0.001, 0.012);
  chain(noiseSrc(ctx, at, 0.02), filt(ctx, 'highpass', 2500), ng, out);
}

// three quick slaps of band-passed noise and a short tail, as hands clap
export function clap(ctx, out, at, vel = 1, verb = null) {
  const g = gain(ctx, 0), p = g.gain;
  p.setValueAtTime(0, at);
  for (const [dt, v] of [[0, 1], [0.011, 0.75], [0.022, 0.9]]) {
    p.setValueAtTime(vel * v, at + dt);
    p.exponentialRampToValueAtTime(vel * 0.12, at + dt + 0.009);
  }
  p.setValueAtTime(vel * 0.6, at + 0.032);
  p.exponentialRampToValueAtTime(0.0001, at + 0.2);
  chain(noiseSrc(ctx, at, 0.25), filt(ctx, 'highpass', 700), filt(ctx, 'bandpass', 1350, 0.9), g, out);
  send(ctx, g, verb, 0.4);
}

export function shaker(ctx, out, at, vel, side = 0.25) {
  const g = gain(ctx, 0);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vel, at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.07);
  chain(noiseSrc(ctx, at, 0.08), filt(ctx, 'highpass', 6500), g, pan(ctx, side), out);
}

// a round triangle with a square's bite filtered off fast: the bounce comes from the pattern (multicat-score)
export function bass(ctx, out, at, midi, dur, vel = 1) {
  const f = hz(midi), end = at + dur + 0.08;
  const lp = filt(ctx, 'lowpass', 1600, 4), g = gain(ctx, 0);
  lp.frequency.setValueAtTime(1600, at);
  lp.frequency.exponentialRampToValueAtTime(300, at + 0.14);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vel, at + 0.006);
  g.gain.exponentialRampToValueAtTime(vel * 0.55, at + 0.12);
  g.gain.setValueAtTime(vel * 0.55, at + Math.max(0.13, dur));
  g.gain.exponentialRampToValueAtTime(0.0001, end + 0.04);
  osc(ctx, 'triangle', f, at, end + 0.05).connect(lp);
  chain(osc(ctx, 'square', f, at, end + 0.05), gain(ctx, 0.3), lp);
  chain(lp, g, out);
}

// one plucked string (Karplus-Strong, tuned with an allpass for the fractional delay), rendered once per pitch
function stringBuffer(ctx, midi) {
  const c = cacheOf(ctx);
  if (c.plucks.has(midi)) return c.plucks.get(midi);
  const sr = ctx.sampleRate, f = hz(midi), p = sr / f, N = Math.floor(p - 0.5), d = p - 0.5 - N, C = (1 - d) / (1 + d);
  const len = Math.floor(sr * 2), b = ctx.createBuffer(1, len, sr), y = b.getChannelData(0), r = rng(midi * 31 + 3);
  const loss = Math.exp(Math.log(0.001) / (f * 1.7)); // a 1.7 s ring
  let lp = 0;
  for (let i = 0; i <= N; i++) { lp += 0.55 * (r() * 2 - 1 - lp); y[i] = lp; }
  let x1 = 0, y1 = 0;
  for (let i = N + 1; i < len; i++) {
    const x = 0.5 * (y[i - N] + y[i - N - 1]) * loss;
    const v = C * x + x1 - C * y1;
    x1 = x; y1 = v; y[i] = v;
  }
  c.plucks.set(midi, b);
  return b;
}

export function pluck(ctx, out, at, midi, vel, dur, side = 0) {
  const s = ctx.createBufferSource(), g = gain(ctx, vel);
  s.buffer = stringBuffer(ctx, midi);
  g.gain.setValueAtTime(vel, at + dur);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.08);
  chain(s, g, pan(ctx, side), out);
  s.start(at);
  s.stop(at + dur + 0.1);
}

// a strum across a voicing: down from the low string, or up across the top three, each string a few ms after the last
export function strum(ctx, out, at, notes, up, vel, dur) {
  const order = up ? notes.slice(-3).reverse() : notes;
  order.forEach((m, i) => pluck(ctx, out, at + i * (up ? 0.008 : 0.012), m, vel * (1 - i * 0.06), dur - i * 0.01, (m - 57) / 30));
}

// a glockenspiel bar: its fundamental plus the bar's inharmonic partials, ringing short
export function glock(ctx, out, at, midi, vel, verb = null) {
  const f = hz(midi), g = gain(ctx, 1);
  for (const [k, a, d] of [[1, 1, 0.9], [2.76, 0.25, 0.25], [5.4, 0.08, 0.1]]) {
    const pg = gain(ctx, 0);
    ad(pg.gain, at, vel * a, 0.002, d);
    chain(osc(ctx, 'sine', f * k, at, at + d + 0.05), pg, g);
  }
  g.connect(out);
  send(ctx, g, verb, 0.45);
}

export function pad(ctx, out, at, dur, notes, vel) {
  const lp = filt(ctx, 'lowpass', 1100, 0.5), g = gain(ctx, 0);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vel, at + 0.6);
  g.gain.setValueAtTime(vel, at + dur);
  g.gain.linearRampToValueAtTime(0, at + dur + 0.6);
  for (const m of notes) for (const cents of [-8, 8]) { const o = osc(ctx, 'sawtooth', hz(m), at, at + dur + 0.7); o.detune.value = cents; o.connect(lp); }
  chain(lp, g, out);
}

// ---------- the cats: a buzzy source through three moving formants ("mi-a-ow"), with vibrato and, for the trills, a purr ----------

// f0: [s, Hz] pitch points; fm: [s, F1, F2, F3] formant points; trill: [Hz, depth, until s]
const MEOWS = {
  mew: { dur: 0.42, f0: [[0, 640], [0.1, 880], [0.26, 780], [0.42, 560]], fm: [[0, 500, 1900, 3200], [0.14, 950, 1700, 3000], [0.42, 600, 1000, 2600]] },
  mrrow: { dur: 0.62, trill: [26, 0.7, 0.16], f0: [[0, 420], [0.16, 560], [0.3, 700], [0.62, 430]], fm: [[0, 450, 1300, 2600], [0.18, 900, 1600, 2900], [0.62, 550, 900, 2500]] },
  meep: { dur: 0.24, f0: [[0, 820], [0.08, 1060], [0.24, 940]], fm: [[0, 600, 2100, 3300], [0.24, 850, 1800, 3100]] },
  mrrp: { dur: 0.36, trill: [30, 0.8, 0.22], f0: [[0, 500], [0.12, 620], [0.36, 900]], fm: [[0, 500, 1200, 2600], [0.36, 700, 2000, 3100]] },
};

export function meow(ctx, out, at, kind, vel = 1, side = 0, verb = null) {
  const M = MEOWS[kind], end = at + M.dur;
  const src = osc(ctx, 'sawtooth', M.f0[0][1], at, end + 0.05);
  for (const [dt, f] of M.f0.slice(1)) src.frequency.linearRampToValueAtTime(f, at + dt);
  chain(osc(ctx, 'sine', 6.5, at, end + 0.05), gain(ctx, M.f0[0][1] * 0.012), src.frequency);
  const amp = gain(ctx, 0), pre = filt(ctx, 'lowpass', 5000);
  amp.gain.setValueAtTime(0, at);
  amp.gain.linearRampToValueAtTime(vel, at + 0.035);
  amp.gain.setValueAtTime(vel, end - 0.09);
  amp.gain.linearRampToValueAtTime(0, end);
  src.connect(pre);
  [1, 0.55, 0.22].forEach((lvl, j) => {
    const bp = filt(ctx, 'bandpass', M.fm[0][j + 1], [5, 8, 10][j]);
    bp.frequency.setValueAtTime(M.fm[0][j + 1], at);
    for (const row of M.fm.slice(1)) bp.frequency.linearRampToValueAtTime(row[j + 1], at + row[0]);
    chain(pre, bp, gain(ctx, lvl * 4), amp);
  });
  chain(noiseSrc(ctx, at, M.dur), filt(ctx, 'bandpass', 3000, 0.8), gain(ctx, 0.05), amp);
  let tail = amp;
  if (M.trill) {
    const [rate, depth, until] = M.trill, tr = gain(ctx, 1 - depth / 2), lfoG = gain(ctx, depth / 2);
    tr.gain.setValueAtTime(1 - depth / 2, at);
    tr.gain.linearRampToValueAtTime(1, at + until);
    lfoG.gain.setValueAtTime(depth / 2, at);
    lfoG.gain.linearRampToValueAtTime(0, at + until);
    chain(osc(ctx, 'triangle', rate, at, end + 0.05), lfoG, tr.gain);
    tail = chain(amp, tr);
  }
  chain(tail, pan(ctx, side), out);
  send(ctx, tail, verb, 0.18);
}

// ---------- the interface: keys, sends, chips, cards, the fast-forward wait, landings ----------

// a key under the composer: a short click with a little pitched body; the space bar sits lower
export function tick(ctx, out, at, vel, space, seed) {
  const g = gain(ctx, 0), og = gain(ctx, 0);
  ad(g.gain, at, vel, 0.0008, space ? 0.03 : 0.018);
  chain(noiseSrc(ctx, at, 0.04), filt(ctx, 'bandpass', space ? 1700 : 3000 + seed * 900, 2.2), g, pan(ctx, (seed - 0.5) * 0.3), out);
  ad(og.gain, at, vel * 0.3, 0.0008, 0.012);
  chain(osc(ctx, 'sine', space ? 700 : 1500 + seed * 300, at, at + 0.04), og, out);
}

export function whoosh(ctx, out, at, dur, f0, f1, vel, p0 = -0.4, p1 = 0.4) {
  const bp = filt(ctx, 'bandpass', f0, 1.4), g = gain(ctx, 0), pn = pan(ctx, p0);
  bp.frequency.setValueAtTime(f0, at);
  bp.frequency.exponentialRampToValueAtTime(f1, at + dur);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vel, at + dur * 0.55);
  g.gain.linearRampToValueAtTime(0, at + dur);
  pn.pan.setValueAtTime(p0, at);
  pn.pan.linearRampToValueAtTime(p1, at + dur);
  chain(noiseSrc(ctx, at, dur), bp, g, pn, out);
}

// a bubble: a sine that bends up into its note and is gone
export function pop(ctx, out, at, f, vel, rise = 1.7) {
  const o = osc(ctx, 'sine', f, at, at + 0.16), g = gain(ctx, 0);
  o.frequency.exponentialRampToValueAtTime(f * rise, at + 0.05);
  ad(g.gain, at, vel, 0.003, 0.1);
  chain(o, g, out);
}

export function blip(ctx, out, at, midi, vel) {
  const o = osc(ctx, 'triangle', hz(midi), at, at + 0.16), g = gain(ctx, 0);
  o.frequency.exponentialRampToValueAtTime(hz(midi + 2), at + 0.04);
  ad(g.gain, at, vel, 0.003, 0.12);
  chain(o, g, out);
}

// the x50 fast-forward: band-passed noise sweeping up, and a rising saw chattering faster, both cut as the answer lands
export function riser(ctx, out, at, dur, vel) {
  const end = at + dur, am = gain(ctx, 0.5), bp = filt(ctx, 'bandpass', 500, 2), g = gain(ctx, 0), og = gain(ctx, 0);
  bp.frequency.setValueAtTime(500, at);
  bp.frequency.exponentialRampToValueAtTime(6000, end);
  for (const [p, v] of [[g.gain, vel], [og.gain, vel * 0.16]]) {
    p.setValueAtTime(0, at);
    p.linearRampToValueAtTime(v, at + Math.min(0.15, dur * 0.3));
    p.linearRampToValueAtTime(v * 1.3, end - 0.03);
    p.linearRampToValueAtTime(0, end + 0.02);
  }
  const saw = osc(ctx, 'sawtooth', 180, at, end + 0.05), lfo = osc(ctx, 'square', 16, at, end + 0.05);
  saw.frequency.exponentialRampToValueAtTime(1100, end);
  lfo.frequency.exponentialRampToValueAtTime(42, end);
  chain(lfo, gain(ctx, 0.5), am.gain);
  chain(saw, filt(ctx, 'lowpass', 2400), og, am);
  chain(noiseSrc(ctx, at, dur + 0.05), bp, g, am);
  am.connect(out);
}

// a landing: a quick major arpeggio up the glockenspiel over a breath of high air
export function sparkle(ctx, out, at, root, vel, verb = null) {
  [0, 4, 7, 12, 16].forEach((iv, i) => glock(ctx, out, at + i * 0.045, root + iv, vel * (1 - i * 0.08), verb));
  const g = gain(ctx, 0);
  ad(g.gain, at, vel * 0.1, 0.05, 0.4);
  chain(noiseSrc(ctx, at, 0.5), filt(ctx, 'highpass', 8000), g, out);
}

export function click(ctx, out, at, vel) {
  const o = osc(ctx, 'sine', 1200, at, at + 0.07), g = gain(ctx, 0), ng = gain(ctx, 0);
  o.frequency.exponentialRampToValueAtTime(420, at + 0.03);
  ad(g.gain, at, vel, 0.001, 0.045);
  chain(o, g, out);
  ad(ng.gain, at, vel * 0.4, 0.0005, 0.008);
  chain(noiseSrc(ctx, at, 0.02), filt(ctx, 'highpass', 3000), ng, out);
}

// a soft footfall: a low thump and a little dull scuff
export function paw(ctx, out, at, vel, side) {
  const o = osc(ctx, 'sine', 150, at, at + 0.09), g = gain(ctx, 0), ng = gain(ctx, 0);
  o.frequency.exponentialRampToValueAtTime(80, at + 0.05);
  ad(g.gain, at, vel, 0.002, 0.06);
  chain(o, g, pan(ctx, side), out);
  ad(ng.gain, at, vel * 0.5, 0.002, 0.03);
  chain(noiseSrc(ctx, at, 0.04), filt(ctx, 'lowpass', 900), ng, pan(ctx, side), out);
}

// a bag of kibble shaken twice: dozens of tiny dry clicks under two swells
export function kibble(ctx, out, at, dur, vel) {
  const r = rng(Math.round(at * 1000));
  for (let dt = 0; dt < dur; dt += 0.01 + r() * 0.018) {
    const g = gain(ctx, 0), swell = Math.abs(Math.sin((2 * Math.PI * dt) / dur));
    ad(g.gain, at + dt, vel * (0.4 + 0.6 * r()) * swell, 0.0005, 0.006);
    chain(noiseSrc(ctx, at + dt, 0.012), filt(ctx, 'bandpass', 2500 + r() * 3000, 3), g, pan(ctx, r() * 0.6 - 0.3), out);
  }
}

// a sub drop under a reveal
export function boom(ctx, out, at, vel) {
  const o = osc(ctx, 'sine', 110, at, at + 0.9), g = gain(ctx, 0);
  o.frequency.exponentialRampToValueAtTime(42, at + 0.4);
  ad(g.gain, at, vel, 0.01, 0.8);
  chain(o, g, out);
}

// a reversed cymbal: air swelling up to a hit
export function swell(ctx, out, at, dur, vel) {
  const g = gain(ctx, 0);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vel, at + dur);
  g.gain.linearRampToValueAtTime(0, at + dur + 0.02);
  chain(noiseSrc(ctx, at, dur + 0.05), filt(ctx, 'highpass', 4500), g, out);
}
