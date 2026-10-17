// The multicat score's instruments (score.d8ff4cca.js plays them): every sound is synthesised here with Web Audio, no
// samples. The brief is sharp and clean, never cartoony: sine and triangle tones on the key's notes (B major, the song's
// key), filtered white noise for clicks, air and hats, and no pitch glides (the kick's 25 ms punch is its only pitch
// envelope). Each voice takes a voice context v = { ac, sfx, music, rvb, noise, keep } (the epoch's three inputs, a
// shared noise buffer, and keep(src), which registers a scheduled source so a pause or seek can stop it) and a context
// time `at`; levels are linear gains, tuned against the master limiter.

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
export const NOTE = { B1: 35, E2: 40, Fs2: 42, Gs2: 44, B2: 47, E3: 52, Fs3: 54, Gs3: 56, As3: 58, B3: 59, Cs4: 61, Ds4: 63, E4: 64, Fs4: 66, Gs4: 68, As4: 70, B4: 71, Cs5: 73, Ds5: 75, E5: 76, Fs5: 78, Gs5: 80, As5: 82, B5: 83, Cs6: 85, Ds6: 87, Fs6: 90, B6: 95, Fs7: 102 };

// a gain whose envelope rises linearly to `peak` over `attack`, then decays exponentially to silence over `decay`
function env(v, at, peak, attack, decay, dest) {
  const g = v.ac.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  g.connect(dest);
  return g;
}
function osc(v, type, freq, at, dur, dest) {
  const o = v.ac.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  o.connect(dest);
  o.start(at);
  o.stop(at + dur + 0.02);
  v.keep(o, at + dur + 0.02);
  return o;
}
// a slice of the shared white noise; `seed` picks where in the buffer it starts, so repeats never phase alike
function noise(v, at, dur, dest, seed = 0) {
  const s = v.ac.createBufferSource();
  s.buffer = v.noise;
  s.connect(dest);
  s.start(at, (seed * 0.137) % (v.noise.duration - dur - 0.05));
  s.stop(at + dur + 0.02);
  v.keep(s, at + dur + 0.02);
  return s;
}
function filter(v, type, freq, q, dest) {
  const f = v.ac.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  f.connect(dest);
  return f;
}
function pan(v, p, dest) {
  const n = v.ac.createStereoPanner();
  n.pan.value = p;
  n.connect(dest);
  return n;
}
function send(v, amount, dest) {
  const g = v.ac.createGain();
  g.gain.value = amount;
  g.connect(dest);
  return g;
}

// ---- UI and story SFX (v.sfx) ----

// one key of the composer's typing: a bandpassed noise click with a little body; `space` is the wider, lower bar
export function key(v, at, { level = 1, seed = 0, space = false } = {}) {
  const f = space ? 1700 : 3000 + (seed % 7) * 260;
  noise(v, at, 0.03, filter(v, 'bandpass', f, 1.3, filter(v, 'highpass', 900, 0.7, env(v, at, 0.11 * level, 0.0008, space ? 0.03 : 0.016, v.sfx))), seed);
  osc(v, 'sine', space ? 310 : 520, at, 0.03, env(v, at, 0.035 * level, 0.001, 0.012, v.sfx));
}

// a button press (send, play): a tight high tick, a noise edge and a short low body
export function press(v, at, { level = 1 } = {}) {
  osc(v, 'triangle', 2350, at, 0.05, env(v, at, 0.09 * level, 0.001, 0.028, v.sfx));
  noise(v, at, 0.02, filter(v, 'highpass', 6000, 0.7, env(v, at, 0.1 * level, 0.0005, 0.008, v.sfx)), 3);
  osc(v, 'sine', 185, at, 0.08, env(v, at, 0.2 * level, 0.002, 0.05, v.sfx));
}

// air: a static band of noise that swells to its peak at `dur * peak` and dies away, panning across; the band never
// moves, so it reads as air, not a pitch sweep
export function whoosh(v, at, { dur = 0.5, peak = 0.4, level = 0.1, freq = 1100, from = -0.35, to = 0.35, seed = 11 } = {}) {
  const g = v.ac.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(level, at + dur * peak);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  const p = v.ac.createStereoPanner();
  p.pan.setValueAtTime(from, at);
  p.pan.linearRampToValueAtTime(to, at + dur);
  g.connect(p);
  p.connect(v.sfx);
  p.connect(send(v, 0.25, v.rvb));
  noise(v, at, dur, filter(v, 'bandpass', freq, 0.65, filter(v, 'highpass', 280, 0.7, g)), seed);
}

// a routing chip landing: a soft, short sine on the fifth with a whisper of edge
export function chipIn(v, at) {
  osc(v, 'sine', hz(NOTE.Fs6), at, 0.08, env(v, at, 0.045, 0.002, 0.05, v.sfx));
  noise(v, at, 0.01, filter(v, 'highpass', 7000, 0.7, env(v, at, 0.035, 0.0005, 0.005, v.sfx)), 5);
}

// a chip resolving to its check: a glassy root-and-fifth tick with a little room
export function tick(v, at, { level = 1 } = {}) {
  const out = v.ac.createGain();
  out.gain.value = 1;
  out.connect(v.sfx);
  out.connect(send(v, 0.35, v.rvb));
  osc(v, 'sine', hz(NOTE.B6), at, 0.3, env(v, at, 0.05 * level, 0.002, 0.2, out));
  osc(v, 'sine', hz(NOTE.Fs7), at, 0.2, env(v, at, 0.022 * level, 0.002, 0.12, out));
}

// the x50 fast-forward: a crisp clock tick per sixteenth while a generation runs
export function ffTick(v, at, { accent = false, seed = 0 } = {}) {
  const l = accent ? 0.05 : 0.03;
  noise(v, at, 0.02, filter(v, 'bandpass', 7600, 3.5, env(v, at, l * 1.6, 0.0005, 0.012, pan(v, accent ? -0.15 : 0.15, v.sfx))), seed);
  osc(v, 'sine', 3520, at, 0.02, env(v, at, l * 0.35, 0.0008, 0.008, v.sfx));
}

// a weightless low hit: the sine fundamental and its octave, so small speakers still carry it; no pitch movement
export function sub(v, at, { midi = NOTE.B1, level = 0.35, decay = 0.35 } = {}) {
  osc(v, 'sine', hz(midi), at, decay + 0.05, env(v, at, level, 0.003, decay, v.sfx));
  osc(v, 'sine', hz(midi + 12), at, decay * 0.6 + 0.05, env(v, at, level * 0.4, 0.002, decay * 0.6, v.sfx));
}

// a bright noise edge at the front of every landing
export function edge(v, at, { level = 0.12, freq = 4200, decay = 0.014, seed = 7 } = {}) {
  noise(v, at, decay + 0.02, filter(v, 'highpass', freq, 0.7, env(v, at, level, 0.0005, decay, v.sfx)), seed);
}

// a struck chord of pure tones on the key's notes, each with a quiet octave partial, into the room
export function glass(v, at, notes, { level = 0.035, decay = 0.7, room = 0.45, spread = 0.5 } = {}) {
  const out = v.ac.createGain();
  out.gain.value = 1;
  out.connect(v.sfx);
  out.connect(send(v, room, v.rvb));
  notes.forEach((m, i) => {
    const p = pan(v, notes.length > 1 ? spread * (i / (notes.length - 1) - 0.5) : 0, out);
    osc(v, 'sine', hz(m), at, decay + 0.05, env(v, at, level, 0.004, decay, p));
    osc(v, 'sine', hz(m + 12), at, decay * 0.5 + 0.05, env(v, at, level * 0.18, 0.003, decay * 0.5, p));
  });
}

// a camera shutter: two short band clicks 48 ms apart, the second smaller and brighter
export function shutter(v, at) {
  noise(v, at, 0.03, filter(v, 'bandpass', 2300, 1.2, env(v, at, 0.2, 0.0006, 0.018, v.sfx)), 21);
  noise(v, at + 0.048, 0.03, filter(v, 'bandpass', 3400, 1.4, env(v, at + 0.048, 0.13, 0.0006, 0.014, v.sfx)), 29);
}

// a confirmation: two pure notes a fourth apart, close together, ringing into the room
export function chime(v, at, [a, b] = [NOTE.Fs5, NOTE.B5], { gap = 0.085, level = 0.06 } = {}) {
  glass(v, at, [a], { level, decay: 0.55, room: 0.4 });
  glass(v, at + gap, [b], { level: level * 1.05, decay: 0.9, room: 0.5 });
}

// noise building into a hit over `dur`: a static band, louder only, cut just as the hit lands
export function riser(v, at, dur, { level = 0.09 } = {}) {
  const g = v.ac.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(level, at + dur);
  g.gain.linearRampToValueAtTime(0, at + dur + 0.025);
  g.connect(v.sfx);
  g.connect(send(v, 0.4, v.rvb));
  noise(v, at, dur + 0.05, filter(v, 'bandpass', 2600, 0.55, filter(v, 'highpass', 500, 0.7, g)), 37);
}

// ---- the bed (v.music) ----

// a tight kick: a sine with a 25 ms punch and a soft click
export function kick(v, at, { level = 0.5 } = {}) {
  const o = v.ac.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(105, at);
  o.frequency.exponentialRampToValueAtTime(52, at + 0.025);
  o.connect(env(v, at, level, 0.002, 0.24, v.music));
  o.start(at);
  o.stop(at + 0.3);
  v.keep(o, at + 0.3);
  noise(v, at, 0.012, filter(v, 'lowpass', 2200, 0.7, env(v, at, level * 0.12, 0.0005, 0.006, v.music)), 41);
}

export function hat(v, at, { level = 0.05, decay = 0.03, seed = 0 } = {}) {
  noise(v, at, decay + 0.02, filter(v, 'highpass', 7200, 0.7, filter(v, 'bandpass', 10500, 0.8, env(v, at, level, 0.0006, decay, pan(v, 0.18, v.music)))), seed);
}

// a filtered saw pulse an eighth long: the bed's bass
export function bass(v, at, { midi, level = 0.08, dur = 0.2, cutoff = 560 } = {}) {
  const lp = filter(v, 'lowpass', cutoff, 2.2, env(v, at, level, 0.004, dur, v.music));
  osc(v, 'sawtooth', hz(midi), at, dur + 0.05, lp);
  osc(v, 'sine', hz(midi), at, dur + 0.05, env(v, at, level * 0.9, 0.004, dur, v.music));
}

// a held chord: two detuned triangles per note between a highpass (the low mids stay the bass's) and a lowpass, swelling
// in over `attack` and released after `dur`; the bed's go to v.music, the end card's to `out` (v.sfx), past the bed's fade
export function pad(v, at, dur, notes, { level = 0.022, attack = 0.5, release = 0.9, cutoff = 1900, room = 0.3, out = v.music } = {}) {
  const g = v.ac.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(level, at + attack);
  g.gain.setValueAtTime(level, at + Math.max(attack, dur));
  g.gain.setTargetAtTime(0, at + Math.max(attack, dur), release / 4);
  const lp = filter(v, 'lowpass', cutoff, 0.5, filter(v, 'highpass', 170, 0.6, g));
  g.connect(out);
  g.connect(send(v, room, v.rvb));
  const end = Math.max(attack, dur) + release + 0.1;
  notes.forEach((m, i) => {
    for (const cents of [-7, 7]) {
      const o = osc(v, 'triangle', hz(m), at, end, lp);
      o.detune.value = cents + (i % 2 ? 2 : -2);
    }
  });
}

// a plucked note for the arpeggio: triangle and a quiet octave sine, short, panned
export function pluck(v, at, { midi, level = 0.04, decay = 0.2, side = 0 } = {}) {
  const p = pan(v, side, v.music);
  p.connect(send(v, 0.25, v.rvb));
  const lp = filter(v, 'lowpass', 3800, 0.6, env(v, at, level, 0.002, decay, p));
  osc(v, 'triangle', hz(midi), at, decay + 0.05, lp);
  osc(v, 'sine', hz(midi + 12), at, decay * 0.6 + 0.05, env(v, at, level * 0.25, 0.002, decay * 0.6, p));
}

// a short, dark room for the score: stereo noise under an exponential decay, rolled off above as it fades
export function roomImpulse(ac, seconds = 1.6) {
  const n = Math.round(ac.sampleRate * seconds), buf = ac.createBuffer(2, n, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const k = i / n, a = 0.55 - 0.45 * k; // the smoothing deepens as the tail goes: highs die first
      lp = lp * a + (Math.random() * 2 - 1) * (1 - a);
      d[i] = lp * Math.pow(1 - k, 2.4) * (i < 64 ? i / 64 : 1);
    }
  }
  return buf;
}

export function whiteNoise(ac, seconds = 2) {
  const buf = ac.createBuffer(1, Math.round(ac.sampleRate * seconds), ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}
