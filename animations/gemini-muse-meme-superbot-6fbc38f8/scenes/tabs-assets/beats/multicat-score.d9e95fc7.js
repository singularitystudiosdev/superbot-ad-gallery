// The multicat variant's score (beats/multicat.516afb1a.js plays it through soundtrack.d9e95fc7.js): an original indie-pop
// cue in B major at 120.25 bpm, the key and tempo measured off the ElevenLabs song it hands over to (tiny-chaos.mp3: B
// major, in tune, 120.25 bpm, first downbeat 0.205 s in), so the song lands as the cue's own chorus. Everything is
// synthesised here (kick, claps, shaker, a bouncy bass, Karplus-Strong acoustic guitars, a kalimba, pads, risers) and
// rendered offline with the song itself mixed in, so every hit sits on its frame to the sample.
//   - each ask: typing ticks under the composer's characters, a whoosh and a bubble pop on its send
//   - each routing chip: a blip as it lands, a tick as it resolves
//   - each generation (the x50 fast-forward): a riser with an accelerating roll and a click train at 50 clicks a second
//     (one per real second the timer counts), dropping on the frame the answer lands
//   - the order: a ka-ching on its confirmation
//   - the song card: a half cadence on F#, a beat of air, the play press, then the real song (V to I)
//   - the end card: a stab as the mascot pops (its pitch follows the pop's overshoot), then the hook
// The hook: a four-note kalimba motif, D#5 F#5 B5 A#5. It answers itself in the opening (B5 F#5 D#5) and at each drop, and
// the end card leaves it hanging on A#5, the leading tone, with a two-note pickup timed to the run's last frame: on a
// replay or a looped export, the opening's B5 resolves it.
const BPM = 120.25;
const BEAT = 60 / BPM, E8 = BEAT / 2;
const TAIL = 2.4; // the end card's ring past the run's last frame

// pitches (MIDI), B major
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const B1 = 35, E2 = 40, Fs2 = 42, Gs2 = 44;
const Ds5 = 75, Fs5 = 78, Gs5 = 80, As5 = 82, B5 = 83, Cs6 = 85, B6 = 95, Ds7 = 99;
// strummed voicings, low string first; `root` is the bass note
const CHORD = {
  B: { root: B1, gtr: [47, 54, 59, 63, 66] },
  Fs: { root: Fs2, gtr: [42, 49, 54, 58, 61, 66] },
  Fs7: { root: Fs2, gtr: [42, 49, 52, 58, 61, 66] },
  Gsm: { root: Gs2, gtr: [44, 51, 56, 59, 63, 68] },
  E: { root: E2, gtr: [40, 47, 52, 56, 59, 64] },
  Bmaj9: { root: B1, gtr: [47, 54, 58, 61, 63, 66] },
};
const MOTIF = [Ds5, Fs5, B5, As5];

// deterministic noise, so every render of the spot is the same audio
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------- the mixer: one bus per instrument (pan, reverb send), all into the score bus; the song beside it ----------
function impulse(oc, rnd) {
  const len = Math.floor(oc.sampleRate * 1.8), ir = oc.createBuffer(2, len, oc.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const x = i / len, k = 0.25 + 0.7 * x; // darker as it decays
      lp += (1 - k) * ((rnd() * 2 - 1) - lp);
      d[i] = lp * Math.pow(1 - x, 2.6) * (i < oc.sampleRate * 0.012 ? i / (oc.sampleRate * 0.012) : 1);
    }
  }
  return ir;
}

function mixer(oc) {
  const rnd = rng(7);
  const score = oc.createGain();
  score.connect(oc.destination);
  const verb = oc.createConvolver();
  verb.buffer = impulse(oc, rnd);
  const verbIn = oc.createGain();
  verbIn.gain.value = 0.5;
  verbIn.connect(verb).connect(score);
  const bus = (pan, send, chain = []) => {
    const head = oc.createGain(), p = oc.createStereoPanner();
    p.pan.value = pan;
    let n = head;
    for (const f of chain) { n.connect(f); n = f; }
    n.connect(p).connect(score);
    if (send) { const s = oc.createGain(); s.gain.value = send; p.connect(s).connect(verbIn); }
    return head;
  };
  const filt = (type, freq, q = 0.7, gain = 0) => { const f = oc.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; f.gain.value = gain; return f; };
  const noise = oc.createBuffer(1, oc.sampleRate * 5, oc.sampleRate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = rnd() * 2 - 1;
  return {
    oc, rnd, noise, score, ks: new Map(), ev: [],
    b: {
      kick: bus(0, 0.03), sub: bus(0, 0), snare: bus(0, 0.3), clap: bus(0, 0.28), hat: bus(0.28, 0.08, [filt('highpass', 5200)]),
      bass: bus(0, 0.02), gtrL: bus(-0.5, 0.2, [filt('highpass', 95), filt('peaking', 2600, 0.8, 2.5)]), gtrR: bus(0.5, 0.2, [filt('highpass', 95), filt('peaking', 2600, 0.8, 2.5)]),
      kal: bus(0.12, 0.38), pad: bus(0, 0.55, [filt('lowpass', 3200)]), fx: bus(0, 0.3), crash: bus(0, 0.45), ui: bus(0, 0.14), typing: bus(-0.12, 0.05),
    },
  };
}

// ---------- voices ----------
// a voice is made at render time, just before it starts (renderScore): `at` queues its maker under its start time
const at = (m, t, make) => { m.ev.push([t, make]); };
const osc =(m, type, f) => { const o = m.oc.createOscillator(); o.type = type; o.frequency.value = f; return o; };
const gainAt = (m, t, peak, attack, tau) => { const g = m.oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + attack); g.gain.setTargetAtTime(0, t + attack, tau); return g; };

// a burst of filtered noise: attack, then an exponential fall with time constant tau
function noiseHit(m, dest, t, v, type, freq, q, attack, tau) {
  const s = m.oc.createBufferSource(), f = m.oc.createBiquadFilter(), g = gainAt(m, t, v, attack, tau);
  s.buffer = m.noise;
  f.type = type; f.frequency.value = freq; f.Q.value = q;
  s.connect(f).connect(g).connect(dest);
  s.start(t, m.rnd() * 1.4);
  s.stop(t + attack + tau * 7);
  return f;
}

function kick(m, t, v) {
  const o = osc(m, 'sine', 170), g = gainAt(m, t, v, 0.003, 0.1);
  o.frequency.setValueAtTime(170, t);
  o.frequency.exponentialRampToValueAtTime(54, t + 0.08);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.4);
  o.connect(g).connect(m.b.kick);
  o.start(t); o.stop(t + 0.75);
  noiseHit(m, m.b.kick, t, v * 0.18, 'highpass', 3200, 0.7, 0.0005, 0.004);
}
function snare(m, t, v) {
  noiseHit(m, m.b.snare, t, v, 'bandpass', 1900, 0.6, 0.001, 0.045);
  const o = osc(m, 'triangle', 210), g = gainAt(m, t, v * 0.5, 0.001, 0.03);
  o.frequency.exponentialRampToValueAtTime(160, t + 0.08);
  o.connect(g).connect(m.b.snare);
  o.start(t); o.stop(t + 0.25);
}
function clap(m, t, v) {
  for (const [d, k] of [[0, 0.9], [0.011, 0.75], [0.022, 1]]) noiseHit(m, m.b.clap, t + d, v * k, 'bandpass', 1350, 1.2, 0.0008, 0.005);
  noiseHit(m, m.b.clap, t + 0.026, v * 0.6, 'bandpass', 1150, 0.8, 0.001, 0.06);
}
const shaker = (m, t, v) => noiseHit(m, m.b.hat, t, v, 'bandpass', 8200, 0.9, 0.004, 0.016);
function sub(m, t, v, tau) {
  const o = osc(m, 'sine', 62), g = gainAt(m, t, v, 0.004, tau);
  o.frequency.setValueAtTime(64, t);
  o.frequency.exponentialRampToValueAtTime(38, t + tau * 4);
  o.connect(g).connect(m.b.sub);
  o.start(t); o.stop(t + tau * 7);
}
function crash(m, t, v, tau) {
  noiseHit(m, m.b.crash, t, v, 'highpass', 5200, 0.5, 0.002, tau);
  noiseHit(m, m.b.crash, t, v * 0.5, 'bandpass', 9500, 1.5, 0.002, tau * 1.4);
}
// a bouncy bass note: triangle and saw under a lowpass that snaps shut
function bass(m, t, midi, len, v) {
  const f = mtof(midi), lp = m.oc.createBiquadFilter(), g = m.oc.createGain();
  lp.type = 'lowpass'; lp.Q.value = 3;
  lp.frequency.setValueAtTime(1500, t);
  lp.frequency.setTargetAtTime(330, t + 0.005, 0.07);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + 0.005);
  g.gain.setTargetAtTime(v * 0.6, t + 0.005, 0.08);
  g.gain.setTargetAtTime(0, t + len, 0.025);
  for (const [type, k, d] of [['triangle', 1, 0], ['sawtooth', 0.35, 4]]) {
    const o = osc(m, type, f), og = m.oc.createGain();
    o.detune.value = d; og.gain.value = k;
    o.connect(og).connect(lp);
    o.start(t); o.stop(t + len + 0.2);
  }
  lp.connect(g).connect(m.b.bass);
}
// a Karplus-Strong string, tuned by an allpass for the fractional period; cached per note and take
function ksBuffer(m, midi, take) {
  const key = midi * 4 + take;
  if (m.ks.has(key)) return m.ks.get(key);
  const sr = m.oc.sampleRate, period = sr / mtof(midi), N = Math.floor(period - 0.5), frac = period - 0.5 - N;
  const C = (1 - frac) / (1 + frac), len = Math.floor(sr * 1.8);
  const buf = m.oc.createBuffer(1, len, sr), out = buf.getChannelData(0), line = new Float32Array(N);
  const loss = Math.pow(0.001, period / (sr * (midi < 50 ? 3.2 : 2.2)));
  const rnd = rng(midi * 31 + take * 977);
  let lp = 0, last = 0, x1 = 0, y1 = 0, idx = 0;
  for (let i = 0; i < len; i++) {
    let exc = 0;
    if (i < N) { lp += 0.55 * ((rnd() * 2 - 1) - lp); exc = lp; }
    const d = line[idx], avg = 0.5 * (d + last) * loss;
    last = d;
    const ap = C * avg + x1 - C * y1;
    x1 = avg; y1 = ap;
    const y = exc + ap;
    line[idx] = y; idx = (idx + 1) % N;
    out[i] = y * 0.5;
  }
  m.ks.set(key, buf);
  return buf;
}
// a strum across the voicing (down from the low string, up from the high one), double-tracked left and right, rung for `len`
function strum(m, t, chord, dir, v, len) {
  const notes = dir === 'up' ? [...chord.gtr].reverse().slice(0, 4) : chord.gtr;
  [[m.b.gtrL, 0, 0], [m.b.gtrR, 0.011, 1]].forEach(([dest, lag, take]) => {
    notes.forEach((midi, i) => {
      const at = t + lag + i * (dir === 'up' ? 0.007 : 0.011), s = m.oc.createBufferSource(), g = m.oc.createGain();
      s.buffer = ksBuffer(m, midi, take + (dir === 'up' ? 2 : 0));
      g.gain.setValueAtTime(v * (0.75 + 0.25 * m.rnd()), at);
      g.gain.setTargetAtTime(0, t + len, 0.035);
      s.connect(g).connect(dest);
      s.start(at); s.stop(Math.min(at + 1.8, t + len + 0.25));
    });
  });
}
// a kalimba tine: the fundamental, a faint octave, the short metallic plink near 5.8x, and the thumb's click
function kal(m, t, midi, v, pan = 0.12) {
  const f = mtof(midi), p = m.oc.createStereoPanner();
  p.pan.value = pan;
  p.connect(m.b.kal);
  for (const [ratio, k, tau] of [[1, 1, 0.42], [2, 0.1, 0.12], [5.8, 0.16, 0.025]]) {
    const o = osc(m, 'sine', f * ratio), g = gainAt(m, t, v * k, 0.002, tau);
    o.connect(g).connect(p);
    o.start(t); o.stop(t + tau * 8);
  }
  noiseHit(m, p, t, v * 0.06, 'highpass', 4500, 0.7, 0.0005, 0.003);
}
function bell(m, t, midi, v) {
  const f = mtof(midi);
  for (const [ratio, k, tau] of [[1, 1, 0.5], [2, 0.45, 0.3], [3.01, 0.22, 0.18], [4.12, 0.16, 0.1], [5.43, 0.08, 0.06]]) {
    const o = osc(m, 'sine', f * ratio), g = gainAt(m, t, v * k, 0.001, tau);
    o.connect(g).connect(m.b.ui);
    o.start(t); o.stop(t + tau * 8);
  }
}
// a sustained chord: two detuned saws a note under a lowpass that can open over the swell
function pad(m, t0, t1, notes, v, { attack = 0.6, release = 0.8, cut = 1400, cutTo = cut } = {}) {
  const lp = m.oc.createBiquadFilter(), g = m.oc.createGain();
  lp.type = 'lowpass'; lp.Q.value = 0.6;
  lp.frequency.setValueAtTime(cut, t0);
  lp.frequency.exponentialRampToValueAtTime(cutTo, t1);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(v, t0 + attack);
  g.gain.setValueAtTime(v, t1);
  g.gain.setTargetAtTime(0, t1, release / 4);
  lp.connect(g).connect(m.b.pad);
  for (const midi of notes) for (const d of [-7, 7]) {
    const o = osc(m, 'sawtooth', mtof(midi));
    o.detune.value = d;
    o.connect(lp);
    o.start(t0); o.stop(t1 + release * 2);
  }
}

// ---------- sound design ----------
// filtered noise rising to t1, then a 30 ms gap before the hit (the inhale that makes a drop land)
function riser(m, t0, t1, v, from = 380, to = 7000) {
  const s = m.oc.createBufferSource(), f = m.oc.createBiquadFilter(), g = m.oc.createGain();
  s.buffer = m.noise;
  f.type = 'bandpass'; f.Q.value = 1.3;
  f.frequency.setValueAtTime(from, t0);
  f.frequency.exponentialRampToValueAtTime(to, t1 - 0.03);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(v, t1 - 0.03);
  g.gain.linearRampToValueAtTime(0, t1 - 0.008);
  s.connect(f).connect(g).connect(m.b.fx);
  s.start(t0, 0.2); s.stop(t1);
  // a saw an octave-and-a-half glide under it
  const o = osc(m, 'sawtooth', mtof(Fs2 + 12)), lp = m.oc.createBiquadFilter(), og = m.oc.createGain();
  o.frequency.setValueAtTime(mtof(Fs2 + 12), t0);
  o.frequency.exponentialRampToValueAtTime(mtof(Fs2 + 31), t1 - 0.03);
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(500, t0);
  lp.frequency.exponentialRampToValueAtTime(3800, t1 - 0.03);
  og.gain.setValueAtTime(0, t0);
  og.gain.linearRampToValueAtTime(v * 0.22, t1 - 0.03);
  og.gain.linearRampToValueAtTime(0, t1 - 0.008);
  o.connect(lp).connect(og).connect(m.b.fx);
  o.start(t0); o.stop(t1);
}
// a snare roll from t0 that tightens from eighths to 32nds and swells into t1 (free time: it is a fall into the hit)
function roll(m, t0, t1, v) {
  for (let t = t1 - BEAT / 8, dt = BEAT / 8; t > t0; dt = Math.min(E8, dt * 1.13), t -= dt) {
    const hit = t, k = 0.12 + 0.88 * Math.pow((t - t0) / (t1 - t0), 1.7);
    at(m, hit, () => snare(m, hit, v * k));
  }
}
// the x50 badge's sound: a square at 25 Hz through a highpass, one click per edge, 50 a second, one per real second counted
function whirr(m, t0, t1, v) {
  const o = osc(m, 'square', 25), hp = m.oc.createBiquadFilter(), g = m.oc.createGain();
  hp.type = 'highpass'; hp.frequency.value = 2600;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(v, t0 + 0.08);
  g.gain.setValueAtTime(v, t1 - 0.02);
  g.gain.linearRampToValueAtTime(0, t1);
  o.connect(hp).connect(g).connect(m.b.fx);
  o.start(t0); o.stop(t1 + 0.01);
}
function whoosh(m, t1, dur, v) {
  const s = m.oc.createBufferSource(), f = m.oc.createBiquadFilter(), g = m.oc.createGain(), t0 = t1 - dur;
  s.buffer = m.noise;
  f.type = 'bandpass'; f.Q.value = 1.6;
  f.frequency.setValueAtTime(600, t0);
  f.frequency.exponentialRampToValueAtTime(3000, t1);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(v, t1);
  g.gain.setTargetAtTime(0, t1, 0.04);
  s.connect(f).connect(g).connect(m.b.fx);
  s.start(t0, m.rnd()); s.stop(t1 + 0.3);
}
// a message bubble's send: a short upward sine pop
function pop(m, t, v) {
  const o = osc(m, 'sine', 480), g = gainAt(m, t, v, 0.002, 0.035);
  o.frequency.setValueAtTime(480, t);
  o.frequency.exponentialRampToValueAtTime(1150, t + 0.05);
  o.connect(g).connect(m.b.ui);
  o.start(t); o.stop(t + 0.3);
}
// a routing chip lands: F#6 then B6
function blip(m, t, v) {
  [[90, 0], [95, 0.045]].forEach(([midi, d]) => {
    const o = osc(m, 'triangle', mtof(midi)), g = gainAt(m, t + d, v, 0.002, 0.05);
    o.connect(g).connect(m.b.ui);
    o.start(t + d); o.stop(t + d + 0.4);
  });
}
// a chip resolves: a glassy tick on D#7
function tick(m, t, v) {
  const o = osc(m, 'sine', mtof(Ds7)), g = gainAt(m, t, v, 0.001, 0.022);
  o.connect(g).connect(m.b.ui);
  o.start(t); o.stop(t + 0.2);
}
// the mascot's pop: a sine whose pitch rides the card's own scale curve, B3 at its 0.72 to B5 at 1, overshoot included
function bloop(m, t, v, popBack) {
  const n = 64, curve = new Float32Array(n);
  for (let i = 0; i < n; i++) curve[i] = mtof(59 + 24 * popBack(i / (n - 1)));
  for (const [type, k, mul] of [['sine', 1, 1], ['triangle', 0.25, 2]]) {
    const o = osc(m, type, curve[0] * mul), g = m.oc.createGain();
    const c = mul === 1 ? curve : curve.map((f) => f * mul);
    o.frequency.setValueCurveAtTime(c, t, 0.55);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v * k, t + 0.012);
    g.gain.setTargetAtTime(0, t + 0.3, 0.07);
    o.connect(g).connect(m.b.ui);
    o.start(t); o.stop(t + 0.9);
  }
}
function impact(m, t, v, big) {
  kick(m, t, v);
  sub(m, t, v * (big ? 0.85 : 0.55), big ? 0.22 : 0.14);
  crash(m, t, v * (big ? 0.3 : 0.2), big ? 0.38 : 0.26);
}

// ---------- the groove ----------
// one bar's parts at `level` 1 (light), 2 (full) or 3 (the big drop), beat positions in [from, to) of a bar of `beats`;
// `b` is the beat's length (a bar can run a hair off 120.25 so a section's last hit lands on its frame)
const BASS = {
  1: [[0, 0, 0.42], [1.5, 0, 0.3], [2, 0, 0.42], [3.5, 7, 0.3]],
  2: [[0, 0, 0.4], [0.75, 0, 0.18], [1.5, 12, 0.32], [2, 0, 0.4], [2.75, 7, 0.18], [3, 0, 0.3], [3.5, 12, 0.32]],
};
const STRUM = { 1: [[0, 'down', 0.8], [1.5, 'up', 0.4], [2, 'down', 0.6]], 2: [[0, 'down', 1], [1, 'down', 0.7], [1.5, 'up', 0.45], [2.5, 'up', 0.45], [3, 'down', 0.75], [3.5, 'up', 0.5]] };
function bar(m, t0, b, chord, level, { beats = 4, from = 0, to = beats } = {}) {
  const on = (p) => p >= from && p < to;
  const lv = Math.min(level, 2);
  for (let i = 0; i < beats; i++) {
    const t = t0 + i * b;
    if (on(i) && (level > 1 || i % 2 === 0)) at(m, t, () => kick(m, t, level === 1 ? 0.6 : 0.82));
    if (on(i) && level > 1 && i % 2 === 1) at(m, t, () => clap(m, t, level === 3 ? 0.5 : 0.38));
  }
  for (let s = 0; s < beats * 4; s++) {
    const p = s / 4, t = t0 + p * b;
    if (on(p) && (level > 1 || s % 2 === 0)) at(m, t, () => shaker(m, t, [0.1, 0.05, 0.16, 0.06][s % 4] * (level === 3 ? 1.25 : 1)));
  }
  for (const [p, iv, len] of BASS[lv]) {
    const t = t0 + p * b;
    if (p < beats && on(p)) at(m, t, () => bass(m, t, chord.root + iv, len * b * 2, level === 3 ? 0.42 : 0.34));
  }
  const strums = STRUM[lv].filter(([p]) => p < beats && on(p));
  strums.forEach(([p, dir, v], i) => {
    const next = i + 1 < strums.length ? strums[i + 1][0] : Math.min(to, beats), t = t0 + p * b;
    at(m, t, () => strum(m, t, chord, dir, v * (level === 3 ? 0.17 : 0.14), (next - p) * b));
  });
}
// one soft key click per typed character (spaces are silent)
function typing(m, text, charAt, v) {
  [...text].forEach((ch, i) => {
    const t = charAt(i);
    if (ch !== ' ') at(m, t, () => noiseHit(m, m.b.typing, t + m.rnd() * 0.002, v * (0.6 + 0.4 * m.rnd()), 'bandpass', 2600 + 1800 * m.rnd(), 1.4, 0.0005, 0.005));
  });
}
// a generation's build: from the card coming in to the answer landing, the riser, the roll, the x50 click train while the
// timer runs, a pad on the dominant swelling under it
function build(m, g, v, rollV, chord) {
  at(m, g.card, () => riser(m, g.card, g.done, v));
  roll(m, Math.max(g.card, g.done - 1.6), g.done, rollV);
  at(m, g.gen0, () => whirr(m, g.gen0, g.done, 0.05));
  at(m, g.card, () => pad(m, g.card, g.done - 0.02, chord.gtr.slice(1).map((n) => n + 12), 0.025, { attack: (g.done - g.card) * 0.8, release: 0.1, cut: 600, cutTo: 3000 }));
}
function kaching(m, t, v) {
  noiseHit(m, m.b.ui, t - 0.035, v * 0.4, 'bandpass', 3600, 2.2, 0.001, 0.012);
  bell(m, t, B6, v);
  bell(m, t + 0.07, Ds7, v * 0.8);
  noiseHit(m, m.b.crash, t + 0.02, v * 0.2, 'highpass', 8500, 0.7, 0.002, 0.12);
}
// the real song, from its first sample at the play press, faded out under the end card's cover as the beat's own audio did
function songIn(m, c, song) {
  const s = m.oc.createBufferSource(), g = m.oc.createGain();
  s.buffer = song;
  g.gain.setValueAtTime(c.gain, c.play);
  g.gain.setValueAtTime(c.gain, c.play + c.for);
  g.gain.linearRampToValueAtTime(0, c.play + c.for + c.fade);
  s.connect(g).connect(m.oc.destination);
  s.start(c.play, 0, c.for + c.fade + 0.05);
}

// ---------- the cue ----------
// `c` is the beat's cue sheet (multicat.516afb1a.js cueSheet), `loop` the run's last frame, `song` the decoded track
function compose(m, c, loop, song) {
  const [g1, g2, g3] = c.gens;
  const send1 = c.sends[0];
  const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const kalAt = (t, n, v, pan) => at(m, t, () => kal(m, t, n, v, pan));
  const bassAt = (t, n, len, v) => at(m, t, () => bass(m, t, n, len, v));

  // UI under the whole run
  c.asks.forEach((a) => typing(m, a.text, a.at, 0.075));
  c.sends.forEach((t, i) => { at(m, t - 0.2, () => whoosh(m, t, 0.2, i ? 0.06 : 0.09)); at(m, t, () => pop(m, t, 0.12)); });
  c.chips.forEach((ch) => { at(m, ch.sw, () => blip(m, ch.sw, 0.07)); at(m, ch.done, () => tick(m, ch.done, 0.05)); });

  // intro: B5 resolves the end card's pickup (the loop's seam), the answer falls to D#5 over Badd9, the pad opens as the ask types
  [[B5, 0], [Fs5, E8], [Ds5, E8 * 2]].forEach(([n, d], i) => kalAt(0.02 + d, n, [0.48, 0.32, 0.28][i], 0.2));
  at(m, 0, () => pad(m, 0, send1, [B1 + 12, 54, 61, 63, 66], 0.045, { attack: 0.9, release: 0.5, cut: 500, cutTo: 2600 }));
  const r0 = c.asks[0].s + 0.1;
  at(m, r0, () => riser(m, r0, send1, 0.07, 600, 5000));

  // section 1, light, from the first send to the photo's card: B, then F# under the riser into the first drop
  bar(m, send1, BEAT, CHORD.B, 1, { to: 2 });
  const fs1 = send1 + 2 * BEAT;
  at(m, fs1, () => { kick(m, fs1, 0.6); strum(m, fs1, CHORD.Fs, 'down', 0.11, g1.done - fs1 - 0.05); });
  for (let t = fs1; t < g1.done - 0.05; t += E8) bassAt(t, Fs2, E8 * 0.7, 0.2 + 0.2 * (t - fs1) / (g1.done - fs1));
  build(m, g1, 0.2, 0.4, CHORD.Fs);
  // drop 1: the photo lands
  at(m, g1.done, () => impact(m, g1.done, 0.9, false));
  [[Ds5, 0], [Fs5, E8], [B5, E8 * 2]].forEach(([n, d], i) => kalAt(g1.done + d, n, 0.3 - i * 0.03));

  // section 2, full: B | G#m | E, from the photo to the model's card, then F# under the long build into the big drop
  [CHORD.B, CHORD.Gsm, CHORD.E].forEach((ch, i) => bar(m, g1.done + i * 4 * BEAT, BEAT, ch, 2, { to: Math.min(4, (g2.card - g1.done) / BEAT - i * 4) }));
  const pulse0 = g1.done + Math.ceil((g2.card - g1.done) / E8) * E8;
  for (let t = pulse0; t < g2.done - 0.06; t += E8) bassAt(t, Fs2, E8 * 0.7, 0.22 + 0.22 * (t - g2.card) / (g2.done - g2.card));
  for (let t = pulse0; t < g2.done - 1.2; t += BEAT) at(m, t, () => kick(m, t, 0.55));
  build(m, g2, 0.28, 0.5, CHORD.Fs);
  // drop 2, the biggest: the walking cat. Section 3 runs B | F# | G#m (three beats) at a beat that lands the order on its frame
  at(m, g2.done, () => impact(m, g2.done, 1, true));
  const b3 = (c.order.done - g2.done) / 11;
  [CHORD.B, CHORD.Fs, CHORD.Gsm].forEach((ch, i) => bar(m, g2.done + i * 4 * b3, b3, ch, 3, { beats: i === 2 ? 3 : 4 }));
  // the hook over it: the motif, its answer over F#, its fall over G#m
  MOTIF.forEach((n, i) => kalAt(g2.done + i * b3 / 2, n, 0.3));
  [[Cs6, 4], [As5, 4.5], [Fs5, 5], [Cs6 - 12, 5.5], [B5, 8], [Gs5, 8.5], [Ds5, 9]].forEach(([n, p]) => kalAt(g2.done + p * b3, n, 0.22, -0.1));
  // the order's card: a beat of 16th claps up into the ka-ching
  for (let i = 0; i < 4; i++) { const t = c.order.done - (4 - i) * b3 / 4; at(m, t, () => clap(m, t, 0.18 + 0.08 * i)); }

  // the order lands: ka-ching on E, and section 4, full: E | G#m F# up to the song's card
  at(m, c.order.done - 0.035, () => { kaching(m, c.order.done, 0.32); impact(m, c.order.done, 0.7, false); });
  bar(m, c.order.done, BEAT, CHORD.E, 2);
  const s4 = c.order.done + 4 * BEAT, s4end = (g3.card - s4) / BEAT;
  bar(m, s4, BEAT, CHORD.Gsm, 2, { to: Math.min(2, s4end) });
  bar(m, s4 + 2 * BEAT, BEAT, CHORD.Fs, 2, { beats: 2, to: Math.min(2, s4end - 2) });
  build(m, g3, 0.18, 0.38, CHORD.Fs);
  // the song's card lands on F#7, a half cadence, held a beat; the play press clicks; the song (B major) resolves it
  at(m, g3.done, () => { impact(m, g3.done, 0.75, false); strum(m, g3.done, CHORD.Fs7, 'down', 0.2, 0.42); bass(m, g3.done, Fs2, 0.4, 0.4); });
  const click = c.song.play - 0.03;
  at(m, click, () => noiseHit(m, m.b.ui, click, 0.12, 'bandpass', 2400, 1.2, 0.0005, 0.006));
  if (song) at(m, c.song.play, () => songIn(m, c.song, song));

  // the end card: an inhale under the chat's fade, the stab and the bloop as the mascot pops, the hook as the wordmark comes up
  const stab = c.end.pop + 0.02;
  at(m, c.end.cover, () => riser(m, c.end.cover, stab, 0.06, 300, 4000));
  at(m, c.end.pop, () => bloop(m, c.end.pop, 0.16, popBack));
  at(m, stab, () => {
    impact(m, stab, 0.85, true);
    strum(m, stab, CHORD.Bmaj9, 'down', 0.2, 2.2);
    bass(m, stab, B1, 1.1, 0.42);
    pad(m, stab, loop - 0.6, [B1 + 12, 54, 58, 61, 63, 66], 0.04, { attack: 0.25, release: 2.2, cut: 2400, cutTo: 900 });
  });
  at(m, c.end.word, () => noiseHit(m, m.b.crash, c.end.word, 0.035, 'highpass', 7000, 0.6, 0.35, 0.25));
  // the motif on the song's own grid (its eighths fall within 8 ms of the wordmark's start), left hanging on A#5
  const grid = c.song.play + c.song.downbeat, first = grid + Math.ceil((c.end.word - 0.02 - grid) / E8) * E8;
  MOTIF.forEach((n, i) => kalAt(first + i * E8, n, i === 3 ? 0.36 : 0.3, 0.05));
  // the pickup into the loop: F#5 and A#5 on the last two eighths; the opening's B5 is the next downbeat
  kalAt(loop - 2 * E8, Fs5, 0.14, 0.2);
  kalAt(loop - E8, As5, 0.17, 0.2);
}

// the score bus's level against the song, and the ceiling the soft clip holds peaks under
const SCORE_GAIN = 0.6, CEIL = 0.97;
// voices are made just in time, CHUNK seconds of them at each suspend, each at least LEAD ahead of its start: Chrome's
// offline renderer pulls every node in the graph on every 128-frame quantum, so a score built up front renders ~10x slower
const CHUNK = 0.5, LEAD = 0.1;

/** Render the whole spot's audio, t = 0 to the run's last frame plus the end card's ring: the score with the song in it.
    `cues` is the beat's cue sheet, `loop` the run's length (__AD.CYCLE), `songData` the track's encoded bytes or null. */
export async function renderScore(cues, loop, songData, sampleRate = 44100) {
  const length = Math.ceil((loop + TAIL) * sampleRate);
  const oc = new OfflineAudioContext(2, length, sampleRate);
  const song = songData ? await oc.decodeAudioData(songData.slice(0)) : null;
  const m = mixer(oc);
  m.score.gain.value = SCORE_GAIN;
  compose(m, cues, loop, song);
  const ev = m.ev.sort((a, b) => a[0] - b[0]);
  let i = 0, failure = null;
  const upTo = (until) => { while (i < ev.length && ev[i][0] < until) ev[i++][1](); };
  upTo(CHUNK + LEAD);
  for (let s = CHUNK; s < length / sampleRate; s += CHUNK) {
    const until = s + CHUNK + LEAD;
    // a voice that throws must not stall the render: it is kept, the render resumes, and it is rethrown below
    oc.suspend(s).then(() => {
      try { upTo(until); } catch (e) { failure = failure || e; }
      return oc.resume();
    });
  }
  const out = await oc.startRendering();
  if (failure) throw failure;
  // a soft knee over the summed mix: transparent under 0.8, a smooth curve up to CEIL above it
  for (let ch = 0; ch < out.numberOfChannels; ch++) {
    const d = out.getChannelData(ch);
    for (let j = 0; j < d.length; j++) {
      const x = d[j], a = Math.abs(x);
      if (a > 0.8) d[j] = Math.sign(x) * (0.8 + (CEIL - 0.8) * Math.tanh((a - 0.8) / (CEIL - 0.8)));
    }
  }
  return out;
}
