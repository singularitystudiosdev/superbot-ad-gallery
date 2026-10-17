// The multicat score's instruments (multicat-score.96834de7.js plays them): every voice is synthesised into an
// OfflineAudioContext graph at an absolute time, so the whole bed renders once into a buffer that the player keeps on the
// spot's clock. The palette is a restrained tech-pop kit: a tuned sine kick with a short click, a three-burst clap in a
// small room, soft closed hats rolled off above 13 kHz, a saturated sub bass, filtered detuned-saw plucks and pads, and
// UI sounds built from short filtered noise and sines. No pitch-swept zips, no boings: transients are milliseconds long,
// tails are filtered, every hit sits in B major. Seeded noise, so every render is the same.
const FLOOR = 0.0001; // the floor exponential ramps decay to

// mulberry32: the seeded random every voice draws from
export function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// a stereo room: decorrelated noise under an exponential decay, darkening as it rings (a one-pole lowpass whose cutoff
// falls from 11 kHz toward `damp`), after `pre` seconds of pre-delay
function impulse(ctx, seconds, pre, damp, rnd) {
  const sr = ctx.sampleRate, n = Math.round(sr * seconds), buf = ctx.createBuffer(2, n, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let y = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      if (t < pre) continue;
      const fc = damp + (11000 - damp) * Math.exp((-3 * t) / seconds);
      const a = Math.exp((-2 * Math.PI * fc) / sr);
      y = (1 - a) * (rnd() * 2 - 1) + a * y;
      d[i] = y * Math.exp((-6.9 * (t - pre)) / seconds) * (1 - i / n);
    }
  }
  return buf;
}

const curves = new Map();
// tanh saturation: adds the 2nd and 3rd harmonics that let a sub read on laptop speakers (oversampled only for the
// kick's 190 Hz attack: under a lowpass, a sub's harmonics never reach the fold)
function drive(ctx, k, oversample = 'none') {
  if (!curves.has(k)) {
    const c = new Float32Array(1024);
    for (let i = 0; i < c.length; i++) { const x = (i / (c.length - 1)) * 2 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); }
    curves.set(k, c);
  }
  const s = ctx.createWaveShaper();
  s.curve = curves.get(k);
  s.oversample = oversample;
  return s;
}

// the mix: three buses into one output, the music bus pumping under the kick and the impacts (duck), two reverbs
export function makeMix(ctx, seed) {
  const rnd = seeded(seed);
  const out = ctx.createGain();
  // a 30 Hz highpass on the sum: nothing under the kick's fundamental but rumble
  const floor = ctx.createBiquadFilter();
  floor.type = 'highpass';
  floor.frequency.value = 30;
  out.connect(floor).connect(ctx.destination);
  const bus = (to, level = 1) => { const g = ctx.createGain(); g.gain.value = level; g.connect(to); return g; };
  const duck = bus(out);
  // each reverb's return, [gain node, its level], so the score can close them while the song plays
  const returns = [];
  const reverb = (seconds, pre, damp, level) => {
    const c = ctx.createConvolver();
    c.buffer = impulse(ctx, seconds, pre, damp, rnd);
    const back = bus(out, level);
    c.connect(back);
    returns.push([back, level]);
    return c;
  };
  const noise = ctx.createBuffer(2, ctx.sampleRate * 3, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = noise.getChannelData(ch); for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1; }
  return {
    ctx, rnd, out, duck, noise, returns,
    music: bus(duck), drums: bus(out), sfx: bus(out),
    room: reverb(0.55, 0.008, 4200, 0.9), plate: reverb(2.6, 0.022, 3200, 0.7),
  };
}

// ---------- building blocks ----------
const gainAt = (m, level = 0) => { const g = m.ctx.createGain(); g.gain.value = level; return g; };
function filter(m, type, freq, q = 0.707) { const f = m.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; return f; }
const chain = (...nodes) => { for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]); return nodes[nodes.length - 1]; };
function sends(m, node, room = 0, plate = 0) {
  if (room) chain(node, gainAt(m, room), m.room);
  if (plate) chain(node, gainAt(m, plate), m.plate);
}
// a strike: silent until t, up to `peak` over `attack`, then an exponential fall to nothing over `decay`
function strike(g, t, peak, attack, decay) {
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(FLOOR, t + attack + decay);
}
function noiseAt(m, t, dur, ch) {
  const s = m.ctx.createBufferSource();
  s.buffer = m.noise;
  const off = m.rnd() * (m.noise.duration - dur - 0.1);
  s.start(t, off, dur + 0.05);
  if (ch === undefined) return s;
  // one channel of the stereo noise, so two calls make a wide, decorrelated pair
  const split = m.ctx.createChannelSplitter(2), g = gainAt(m, 1);
  s.connect(split);
  split.connect(g, ch);
  return g;
}
function osc(m, type, freq, t, stop) {
  const o = m.ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.start(t);
  o.stop(stop);
  return o;
}
function pan(m, p) { const s = m.ctx.createStereoPanner(); s.pan.value = p; return s; }
// the music bus dips under a hit: by `depth` (gain), back over `release` seconds. The hits that duck (DUCKS: a voice's
// arguments after t to its [depth, release]) are known before anything renders, so every piece of a split render
// (multicat-score.96834de7.js) pumps under all of them, its own and its neighbours'
export const DUCKS = { kick: () => [0.55, 0.2], impact: (level, size = 1) => [0.3, 0.55 * size] };
export function applyDucks(m, ducks, shift = 0) {
  const g = m.duck.gain;
  g.setValueAtTime(1, 0);
  for (const [t, depth, release] of ducks) {
    if (t - shift < 0) continue;
    g.setTargetAtTime(depth, t - shift, 0.004);
    g.setTargetAtTime(1, t - shift + 0.03, release / 3);
  }
}

// ---------- drums ----------
export function kick(m, t, v = 1) {
  const body = osc(m, 'sine', 190, t, t + 0.45);
  body.frequency.exponentialRampToValueAtTime(60, t + 0.04);
  body.frequency.exponentialRampToValueAtTime(48, t + 0.3);
  const g = gainAt(m);
  strike(g, t, 0.5 * v, 0.002, 0.28);
  chain(body, drive(m.ctx, 1.8, '2x'), g, m.drums);
  // the beater: 6 ms of band-passed noise, felt more than heard
  const click = gainAt(m);
  strike(click, t, 0.16 * v, 0.0005, 0.007);
  chain(noiseAt(m, t, 0.02), filter(m, 'highpass', 1800), filter(m, 'bandpass', 4200, 0.7), click, m.drums);
}

export function clap(m, t, v = 1) {
  const g = gainAt(m);
  g.gain.setValueAtTime(0, t);
  for (let i = 0; i < 3; i++) {
    const at = t + i * 0.0095;
    g.gain.setValueAtTime(0.9 * v, at);
    g.gain.exponentialRampToValueAtTime(0.08 * v, at + 0.008);
  }
  g.gain.setValueAtTime(0.65 * v, t + 0.029);
  g.gain.exponentialRampToValueAtTime(FLOOR, t + 0.2);
  const out = chain(noiseAt(m, t, 0.25), filter(m, 'highpass', 750), filter(m, 'bandpass', 1500, 0.9), g, gainAt(m, 0.75));
  out.connect(m.drums);
  sends(m, out, 0.3, 0.05);
  // the snap on top and a little body under it
  const snap = gainAt(m);
  strike(snap, t, 0.12 * v, 0.001, 0.08);
  chain(noiseAt(m, t, 0.12), filter(m, 'highpass', 3200), filter(m, 'lowpass', 9000), snap, m.drums);
  const tone = osc(m, 'triangle', 205, t, t + 0.1);
  tone.frequency.exponentialRampToValueAtTime(180, t + 0.06);
  const tg = gainAt(m);
  strike(tg, t, 0.12 * v, 0.001, 0.06);
  chain(tone, tg, m.drums);
}

export function hat(m, t, v = 1, open = false) {
  const g = gainAt(m);
  strike(g, t, 0.26 * v, 0.0008, open ? 0.2 : 0.032);
  const out = chain(noiseAt(m, t, open ? 0.3 : 0.06), filter(m, 'highpass', 7200), filter(m, 'bandpass', 9600, 0.6),
    filter(m, 'lowpass', 13000), g, pan(m, 0.16));
  out.connect(m.drums);
  if (open) sends(m, out, 0.12, 0);
}

// ---------- music ----------
export function bass(m, t, dur, freq, v = 1) {
  const g = gainAt(m);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.19 * v, t + 0.005);
  g.gain.setTargetAtTime(0.145 * v, t + 0.02, 0.08);
  g.gain.setTargetAtTime(0, t + dur, 0.018);
  const lp = filter(m, 'lowpass', 240, 0.8);
  osc(m, 'sine', freq, t, t + dur + 0.15).connect(lp);
  chain(osc(m, 'triangle', freq, t, t + dur + 0.15), gainAt(m, 0.4), lp);
  chain(lp, drive(m.ctx, 2.6), filter(m, 'lowpass', 1100), g, m.music);
}

// a plucked chord: detuned saw pairs, one lowpass closing fast from `bright` Hz, a short exponential tail
export function pluck(m, t, freqs, v = 1, len = 0.32, bright = 3400) {
  const sum = gainAt(m, 1), lp = filter(m, 'lowpass', bright, 1.3), g = gainAt(m);
  lp.frequency.setValueAtTime(bright, t);
  lp.frequency.setTargetAtTime(1100, t + 0.004, 0.075);
  // alternate notes to either side
  const sides = [pan(m, -0.25), pan(m, 0.25)];
  sides.forEach((p) => p.connect(sum));
  freqs.forEach((f, i) => {
    for (const cents of [-7, 7]) osc(m, 'sawtooth', f * 2 ** (cents / 1200), t, t + len + 0.1).connect(sides[i % 2]);
  });
  strike(g, t, 0.14 * v, 0.003, len);
  const out = chain(sum, lp, g);
  out.connect(m.music);
  sends(m, out, 0.08, 0.2);
}

// a held chord: three detuned saws a note, spread wide, lowpassed soft; it swells in and lets go
export function pad(m, t0, t1, freqs, level, cutoff = 1100, attack = 0.5, release = 0.8) {
  // each note's flat copy left, sharp copy right, the centre one in the middle
  const sum = gainAt(m, 1), g = gainAt(m), spread = [pan(m, -0.55), sum, pan(m, 0.55)];
  spread[0].connect(sum);
  spread[2].connect(sum);
  freqs.forEach((f) => [-9, 0, 9].forEach((cents, j) => osc(m, 'sawtooth', f * 2 ** (cents / 1200), t0, t1 + release * 3).connect(spread[j])));
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(level, t0 + attack);
  g.gain.setValueAtTime(level, t1);
  g.gain.setTargetAtTime(0, t1, release / 3);
  const out = chain(sum, filter(m, 'lowpass', cutoff, 0.4), g);
  out.connect(m.music);
  sends(m, out, 0, 0.4);
}

// ---------- sound effects ----------
// air rising: wide band-passed noise opening from f0 to f1, swelling exponentially, cut clean at t1
export function riser(m, t0, t1, level, f0 = 450, f1 = 7000) {
  const g = gainAt(m);
  g.gain.setValueAtTime(FLOOR, t0);
  g.gain.exponentialRampToValueAtTime(level, t1 - 0.012);
  g.gain.linearRampToValueAtTime(0, t1);
  const bp = filter(m, 'bandpass', f0, 1.6);
  bp.frequency.setValueAtTime(f0, t0);
  bp.frequency.exponentialRampToValueAtTime(f1, t1);
  [0, 1].forEach((ch) => chain(noiseAt(m, t0, t1 - t0, ch), pan(m, ch ? 0.6 : -0.6), bp));
  const out = chain(bp, g);
  out.connect(m.sfx);
  sends(m, out, 0, 0.18);
}

// a soft pass of air: band-passed noise sweeping f0 to f1, panned across, peaking 45% in
export function whoosh(m, t, dur, level, f0 = 500, f1 = 2400) {
  const g = gainAt(m);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(level, t + dur * 0.45);
  g.gain.exponentialRampToValueAtTime(FLOOR, t + dur);
  const bp = filter(m, 'bandpass', f0, 1.1);
  bp.frequency.setValueAtTime(f0, t);
  bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const p = pan(m, -0.35);
  p.pan.linearRampToValueAtTime(0.35, t + dur);
  const out = chain(noiseAt(m, t, dur), bp, g, p);
  out.connect(m.sfx);
  sends(m, out, 0, 0.12);
}

// a key or a muted click: a few ms of band-passed noise, with an optional low thock under it
export function tick(m, t, { freq = 3200, level = 0.04, q = 2.5, len = 0.01, body = 0, at = 0 } = {}) {
  const g = gainAt(m);
  strike(g, t, level, 0.0006, len);
  chain(noiseAt(m, t, len + 0.02), filter(m, 'bandpass', freq, q), g, pan(m, at), m.sfx);
  if (body) {
    const bg = gainAt(m);
    strike(bg, t, level * 0.7, 0.001, 0.018);
    chain(osc(m, 'sine', body, t, t + 0.05), bg, m.sfx);
  }
}

// a pressed button: a rounded sine knock settling a fifth down, with a 3 ms click on its front
export function tock(m, t, level = 0.11) {
  const o = osc(m, 'sine', 1180, t, t + 0.12);
  o.frequency.exponentialRampToValueAtTime(780, t + 0.018);
  const g = gainAt(m);
  strike(g, t, level, 0.001, 0.06);
  const out = chain(o, filter(m, 'lowpass', 5000), g);
  out.connect(m.sfx);
  sends(m, out, 0.25, 0);
  tick(m, t, { freq: 5200, level: level * 0.35, len: 0.004, q: 1 });
}

// a resolved step: a short glassy B6 with a hair of noise, quiet and dry
export function done(m, t, level = 0.035) {
  const g = gainAt(m);
  strike(g, t, level, 0.0008, 0.05);
  const out = chain(osc(m, 'sine', 1975.5, t, t + 0.1), g);
  out.connect(m.sfx);
  sends(m, out, 0.3, 0.1);
  tick(m, t, { freq: 6000, level: level * 0.5, len: 0.004, q: 1.2 });
}

// a landing: a sub drop from 105 Hz to 41 Hz with a dark thump and a little bright air in the plate
export function impact(m, t, level = 0.7, size = 1) {
  const sub = osc(m, 'sine', 105, t, t + 1.6 * size);
  sub.frequency.exponentialRampToValueAtTime(46, t + 0.45 * size);
  const g = gainAt(m);
  strike(g, t, level, 0.003, 1.1 * size);
  chain(sub, drive(m.ctx, 1.4), g, m.sfx);
  const thump = gainAt(m);
  strike(thump, t, level * 0.4, 0.001, 0.09);
  const th = chain(noiseAt(m, t, 0.15), filter(m, 'lowpass', 900), thump);
  th.connect(m.sfx);
  sends(m, th, 0.2, 0.25);
  const air = gainAt(m);
  strike(air, t, level * 0.05, 0.002, 0.3 * size);
  sends(m, chain(noiseAt(m, t, 0.4 * size), filter(m, 'highpass', 4500), filter(m, 'lowpass', 11000), air), 0, 0.9);
}

// a soft bell for a confirmation: two-operator FM at a 2:1 ratio, its brightness falling fast, staggered note by note
export function bell(m, t, freqs, level = 0.06, stagger = 0.07) {
  freqs.forEach((f, i) => {
    const at = t + i * stagger;
    const car = osc(m, 'sine', f, at, at + 1.6), mod = osc(m, 'sine', f * 2, at, at + 1.6), idx = gainAt(m);
    idx.gain.setValueAtTime(f * 1.1, at);
    idx.gain.exponentialRampToValueAtTime(f * 0.02, at + 0.35);
    chain(mod, idx, car.frequency);
    const g = gainAt(m);
    strike(g, at, level * (i ? 0.8 : 1), 0.002, 1.2);
    const out = chain(car, filter(m, 'lowpass', 6500), g, pan(m, i % 2 ? 0.2 : -0.2));
    out.connect(m.sfx);
    sends(m, out, 0.1, 0.45);
  });
}

// the end card's chord: a wide Bmaj9 that blooms open fast and closes over seconds, never ducked
export function bloom(m, t, freqs, level = 0.03) {
  const sum = gainAt(m, 1), lp = filter(m, 'lowpass', 380, 0.6), g = gainAt(m);
  freqs.forEach((f, i) => [-6, 6].forEach((cents) => chain(osc(m, 'sawtooth', f * 2 ** (cents / 1200), t, t + 4), pan(m, (i / (freqs.length - 1)) * 1.2 - 0.6), sum)));
  lp.frequency.setValueAtTime(380, t);
  lp.frequency.linearRampToValueAtTime(2600, t + 0.1);
  lp.frequency.setTargetAtTime(700, t + 0.14, 0.7);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(level, t + 0.012);
  g.gain.setTargetAtTime(0, t + 0.05, 0.85);
  const out = chain(sum, lp, g);
  out.connect(m.sfx);
  sends(m, out, 0, 0.55);
}
