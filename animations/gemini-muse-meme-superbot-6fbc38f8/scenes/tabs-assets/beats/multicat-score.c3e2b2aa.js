// The multicat variant's sound (multicat.516afb1a.js): a clean, understated bed, quiet interface effects on the beat's
// events and the ElevenLabs song at its play press, rendered in one offline pass (OfflineAudioContext) from the beat's
// own plan T, so every cue sits on the frame that draws its event and the spot's clock can seek it like a picture.
// The bed runs at the song's own tempo (tiny-chaos.mp3 measures 117.5-120 BPM, A440, B major) with its bar lines laid
// back from the song's play press, which lands on a downbeat; it sits in G# minor, the song's relative minor, on
// vi9 IVmaj9 Imaj9 V11, so the F#11 under the ElevenLabs reply resolves into the song's opening B. It steps out at the press
// (the song is the answer and plays alone) and comes back for the end card on a B major 9 that rings out under the
// lockup. Sections build as the asks do: pad alone on the empty state, a half-time pulse from the first send, the full
// four-on-the-floor groove from the Meshy ask, a plucked hook once the cat walks, a shaker under the order, a breakdown
// and a riser under the song's generation.
// cues(T, o) -> { bars, sfx }: every cue in time order (QA and the mix notes); renderScore(T, o) -> Promise<AudioBuffer>.
import { rand } from '../../../lib.9b47fc30.js';

const BEAT = 60 / 120, BAR = 4 * BEAT, S16 = BEAT / 4;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
// the buses: the bed, the effects, the song (tiny-chaos.mp3 plays here at about -17 LUFS)
const MUSIC = 0.75, SFX = 0.75, SONG = 0.72;
// the faders: every instrument's and effect's level, by its function's name, set by measurement (each part rendered
// alone, its LUFS over the groove; each effect's peak against the bed under it) so the bed sits a few dB under the
// song with its kick and sub no louder than its pad and keys, and every effect a few dB under the bed
const LEVEL = {
  kick: 0.24, sub: 0.32, pad: 2.2, ep: 2.3, pluck: 1.66, hat: 1.9, clap: 3.9, shaker: 3.8, riser: 1.6,
  key: 0.45, send: 1.25, chip: 3.5, check: 2.8, card: 14, gen: 8, land: 0.72, ok: 2, press: 2, close: 1.2, pop: 0.8, shimmer: 2,
};
const CEIL = Math.pow(10, -1 / 20); // the master's sample-peak ceiling, -1 dBFS

// the voicings: the bass alone takes the root (between 52 and 93 Hz, above the rumble a laptop cannot play), the pad
// and the stabs the colour tones, `hook` the plucked line's notes
const CHORDS = {
  'G#m9': { bass: 32, pad: [59, 63, 66, 70], hook: [78, 75, 82] },
  Emaj9: { bass: 40, pad: [56, 59, 63, 66], hook: [78, 75, 71] },
  Bmaj9: { bass: 35, pad: [58, 61, 63, 66], hook: [78, 73, 82] },
  'F#11': { bass: 42, pad: [56, 59, 61, 64], hook: [76, 73, 80, 78] },
};
const PROG = ['G#m9', 'Emaj9', 'Bmaj9', 'F#11'];
// the hook's rhythm in sixteenths, one entry per hook note
const HOOK_AT = [2, 5, 8, 13];

// every cue, from the plan. `first` is the engine's own first ask ({ s, typeEnd, send, chips }), `cps` the composer's
// typing rate, `end` the end card's { delay } after S.cut, `cycle` the spot's length
export function cues(T, o) {
  const [M, O, S] = T.steps;
  const nPre = Math.floor(S.play / BAR), b0 = S.play - nPre * BAR; // the song's press is bar nPre's downbeat
  const at = (i) => b0 + i * BAR;
  const barOf = (t) => Math.floor((t - b0) / BAR);
  const endBar = Math.ceil((S.cut - b0) / BAR - 1e-6);
  const shakeFrom = barOf(O.s), hookFrom = barOf(M.w1) + 1;
  const bars = [];
  for (let i = 0; i < nPre; i++) {
    const part = i === 0 ? 'intro' : i === nPre - 1 ? 'break' : i < 3 ? 'pulse' : 'groove';
    bars.push({ i, t: at(i), part, chord: i === 0 ? PROG[0] : PROG[(i - 1) % 4], hook: part === 'groove' && i >= hookFrom, shaker: part === 'groove' && i >= shakeFrom });
  }
  bars.push({ i: endBar, t: at(endBar), part: 'end', chord: 'Bmaj9' });
  // the chord sounding at t, for effects tuned to the bed
  const chordAt = (t) => { let c = bars[0].chord; for (const b of bars) if (b.t <= t + 1e-6 && b.part !== 'end') c = b.part === 'break' && t >= b.t + BAR / 2 ? 'F#11' : b.chord; return c; };

  const sfx = [];
  const add = (t, kind, x = {}) => sfx.push({ t, kind, ...x });
  // a typed ask: a soft key tick every few characters (a real hand's 12 or so a second, not the composer's 55)
  const typing = (s, typeEnd, n, seed) => {
    const stride = Math.max(1, Math.round(o.cps / 12));
    for (let c = 1; c <= n; c += stride) add(s + ((c - 0.5) / n) * (typeEnd - s) + (rand(seed + c) - 0.5) * 0.012, 'key', { vel: 0.55 + 0.45 * rand(seed + c * 7) });
  };
  const chips = (list) => list.forEach((ch) => { add(ch.sw, 'chip'); add(ch.done, 'check'); });
  const reveal = (g0, done, card) => { add(card, 'card'); if (done - g0 > 0.2) add(g0, 'gen', { until: done }); add(done, 'land', { notes: CHORDS[chordAt(done)].pad.map((m) => m + 24).slice(-3) }); };

  const f = o.first;
  typing(f.s, f.typeEnd, Math.round((f.typeEnd - f.s) * o.cps), 11);
  add(f.send, 'send');
  chips(f.chips);
  reveal(T.gen0, T.done, T.card);
  T.steps.forEach((st, k) => {
    typing(st.s, st.typeEnd, st.ask.length, 100 * (k + 2));
    add(st.send, 'send');
    chips(st.chips);
    if (st.kind === 'order') { add(st.card, 'card'); add(st.done, 'ok'); }
    else reveal(st.gen0, st.done, st.card);
  });
  add(S.play, 'press');
  add(S.cut, 'close');
  add(S.cut + o.end.delay, 'pop');
  add(S.cut + o.end.delay + 0.3, 'shimmer');
  sfx.sort((a, b) => a.t - b.t);
  return { b0, bars, sfx, play: S.play, cut: S.cut, songFor: o.songFor, songFade: o.songFade, cycle: o.cycle };
}

// ---------- the synth: small voices, each a few nodes scheduled at its time ----------
function noiseBuffer(c) {
  const n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
  let s = 0x9e3779b9;
  for (let i = 0; i < n; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; d[i] = s / 2147483648 - 1; }
  return b;
}
// a stereo room: decaying noise that darkens as it fades, after a short pre-delay
function roomBuffer(c, secs) {
  const n = Math.round(c.sampleRate * secs), pre = Math.round(c.sampleRate * 0.018), b = c.createBuffer(2, n, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    let s = 0x2545f491 + ch * 977, lp = 0;
    for (let i = pre; i < n; i++) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      const x = 1 - i / n;
      lp += (s / 2147483648 - 1 - lp) * (0.08 + 0.55 * x);
      d[i] = lp * x * x * x;
    }
  }
  return b;
}

function makeKit(c) {
  const NOISE = noiseBuffer(c);
  let seed = 1;
  const gain = (v = 0) => { const g = c.createGain(); g.gain.value = v; return g; };
  // filters move per render quantum (2.7 ms), not per sample: a sweep sounds the same and costs a fraction
  const filter = (type, freq, Q = 0.7) => {
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = Q;
    for (const p of [f.frequency, f.Q, f.detune, f.gain]) p.automationRate = 'k-rate';
    return f;
  };
  // a room: the dearest node in the score (a convolution per channel for the whole pass), so its impulses stay short
  const reverb = (secs) => { const r = c.createConvolver(); r.buffer = roomBuffer(c, secs); return r; };
  const pan = (p) => { const n = c.createStereoPanner(); n.pan.value = p; return n; };
  // a gain that opens to `peak` over `a` from t, holds `hold`, then falls away with time constant `tau`
  const env = (t, peak, a, tau, hold = 0) => {
    const g = gain(0);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    if (hold > 0) g.gain.setValueAtTime(peak, t + a + hold);
    g.gain.setTargetAtTime(0, t + a + hold, tau);
    return g;
  };
  // the voice being built (voice() below): its sources' last stop is when it can leave the graph
  let cur = null;
  const ends = (stop) => { if (cur) cur.end = Math.max(cur.end, stop); };
  const osc = (type, freq, t, stop) => { const n = c.createOscillator(); n.type = type; n.frequency.value = freq; n.start(t); n.stop(stop); ends(stop); return n; };
  const noise = (t, stop) => { const n = c.createBufferSource(); n.buffer = NOISE; n.loop = true; n.start(t, rand(seed++) * 1.5); n.stop(stop); ends(stop); return n; };
  // a soft saturator: a little second and third harmonic, so a sub still reads on small speakers
  const warm = (() => { const k = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; k[i] = Math.tanh(1.6 * x) / Math.tanh(1.6); } return k; })();
  // (no oversampling: what it bends is under 200 Hz, so its harmonics are nowhere near aliasing)
  const shaper = () => { const w = c.createWaveShaper(); w.curve = warm; return w; };
  // build one voice: fn reaches the shared buses only through ports, so once its sources stop (v.end) disconnecting the
  // ports drops the whole voice from the graph. Chrome renders every connected node for the whole pass, finished or
  // not, so a score of a thousand voices built up front costs seconds; built just in time and dropped, it costs its notes
  // (each port carries the voice's fader, `level`)
  const voice = (fn, level = 1) => {
    const v = { end: 0, ports: [] };
    cur = v;
    fn((bus) => { const p = gain(level); p.connect(bus); v.ports.push(p); return p; });
    cur = null;
    return v;
  };
  return { c, gain, filter, pan, env, osc, noise, shaper, voice, reverb };
}

// ---------- instruments: (kit, bus, t, ...) ----------
function kick(k, out, t, vel) {
  const o = k.osc('sine', 150, t, t + 0.7);
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(56, t + 0.055);
  o.frequency.exponentialRampToValueAtTime(50, t + 0.3);
  o.connect(k.env(t, 0.85 * vel, 0.002, 0.085, 0.025)).connect(out);
  // the beater: a few milliseconds of band-passed noise, kept low so the kick stays round
  k.noise(t, t + 0.03).connect(k.filter('bandpass', 2600, 0.8)).connect(k.env(t, 0.05 * vel, 0.0008, 0.004)).connect(out);
}
function hat(k, out, t, vel, open = false) {
  k.noise(t, t + (open ? 0.6 : 0.15)).connect(k.filter('highpass', 7600, 0.6)).connect(k.env(t, 0.16 * vel, 0.0012, open ? 0.075 : 0.016)).connect(k.pan(0.2)).connect(out);
}
function clap(k, out, wet, t, vel) {
  const g = k.gain(0), p = 0.13 * vel;
  g.gain.setValueAtTime(0, t);
  for (const d of [0, 0.009, 0.019]) { g.gain.setValueAtTime(p * 0.8, t + d); g.gain.setTargetAtTime(0, t + d + 0.001, 0.0035); }
  g.gain.setValueAtTime(p, t + 0.028);
  g.gain.setTargetAtTime(0, t + 0.029, 0.045);
  const n = k.noise(t, t + 0.4).connect(k.filter('bandpass', 1500, 0.9)).connect(g).connect(k.pan(-0.08));
  n.connect(out);
  n.connect(k.gain(0.35)).connect(wet);
}
function shaker(k, out, t, vel) {
  k.noise(t, t + 0.12).connect(k.filter('bandpass', 5800, 1.1)).connect(k.env(t, 0.07 * vel, 0.007, 0.016)).connect(k.pan(-0.25)).connect(out);
}
function sub(k, out, t, dur, m, vel) {
  const f = hz(m), stop = t + dur + 0.4;
  const g = k.env(t, 0.34 * vel, 0.006, 0.035, Math.max(0, dur - 0.04));
  const tone = k.gain(1);
  k.osc('sine', f, t, stop).connect(tone);
  k.osc('triangle', f * 2, t, stop).connect(k.gain(0.1)).connect(tone);
  tone.connect(k.shaper()).connect(k.filter('lowpass', 700, 0.5)).connect(g).connect(out);
}
function pad(k, out, wet, t, dur, notes, lvl, cutoff) {
  const lp = k.filter('lowpass', cutoff * 0.65, 0.4);
  lp.frequency.setValueAtTime(cutoff * 0.65, t);
  lp.frequency.linearRampToValueAtTime(cutoff, t + dur * 0.7);
  const g = k.env(t, lvl, Math.min(0.9, dur * 0.35), 0.4, Math.max(0, dur - Math.min(0.9, dur * 0.35)));
  lp.connect(g);
  g.connect(out);
  g.connect(k.gain(0.45)).connect(wet);
  const stop = t + dur + 2.4;
  notes.forEach((m, i) => {
    const p = k.pan([-0.38, -0.12, 0.14, 0.38][i % 4]);
    p.connect(lp);
    for (const cents of [-6, 6]) { const o = k.osc('sawtooth', hz(m), t, stop); o.detune.value = cents; o.connect(k.gain(0.5)).connect(p); }
  });
}
// a muted electric piano: a sine carrier, frequency-modulated at its own pitch with an index that falls fast
function ep(k, out, wet, t, dur, notes, vel, tau = 0.22) {
  const lp = k.filter('lowpass', 2400, 0.5);
  const bus = k.gain(1);
  bus.gain.setValueAtTime(1, t + dur);
  bus.gain.setTargetAtTime(0, t + dur, 0.05);
  lp.connect(bus);
  bus.connect(out);
  bus.connect(k.gain(0.3)).connect(wet);
  notes.forEach((m, i) => {
    const f = hz(m), stop = t + dur + 0.5, at = t + i * 0.006; // a hand's slight roll across the chord
    const car = k.osc('sine', f, at, stop), mod = k.osc('sine', f, at, stop), idx = k.gain(0);
    idx.gain.setValueAtTime(f * 1.3, at);
    idx.gain.setTargetAtTime(f * 0.12, at, 0.09);
    mod.connect(idx).connect(car.frequency);
    car.connect(k.env(at, 0.045 * vel, 0.003, tau)).connect(k.pan(i % 2 ? 0.16 : -0.16)).connect(lp);
  });
}
function pluck(k, out, fx, t, m, vel) {
  const f = hz(m), stop = t + 1.2;
  const lp = k.filter('lowpass', 4200, 0.6);
  lp.frequency.setValueAtTime(4200, t);
  lp.frequency.setTargetAtTime(1300, t, 0.07);
  k.osc('triangle', f, t, stop).connect(lp);
  k.osc('sine', f * 2, t, stop).connect(k.gain(0.22)).connect(lp);
  const g = k.env(t, 0.075 * vel, 0.003, 0.15);
  lp.connect(g);
  g.connect(out);
  g.connect(fx);
}
// an FM bell: a ratio-3.5 modulator gives the glassy partials; the index falls faster than the tone
function bell(k, out, wet, t, m, peak, tau, send = 0.6) {
  const f = hz(m), stop = t + tau * 7;
  const car = k.osc('sine', f, t, stop), mod = k.osc('sine', f * 3.5, t, stop), idx = k.gain(0);
  idx.gain.setValueAtTime(f * 1.8, t);
  idx.gain.setTargetAtTime(0, t, tau * 0.3);
  mod.connect(idx).connect(car.frequency);
  const g = k.env(t, peak, 0.004, tau);
  car.connect(g);
  g.connect(out);
  g.connect(k.gain(send)).connect(wet);
}
// a dotted-eighth ping-pong, darkened on every repeat
function pingPong(k, out, time, fb) {
  const c = k.c, inp = k.gain(1), lp = k.filter('lowpass', 2600, 0.5), l = c.createDelay(2), r = c.createDelay(2), back = k.gain(fb);
  l.delayTime.value = time; r.delayTime.value = time;
  inp.connect(lp).connect(l);
  l.connect(k.pan(-0.65)).connect(out);
  l.connect(r);
  r.connect(k.pan(0.65)).connect(out);
  r.connect(back).connect(lp);
  return inp;
}

// ---------- effects: (kit, bus, wet, cue) ----------
const FX = {
  key(k, out, wet, q) {
    const t = q.t;
    k.noise(t, t + 0.05).connect(k.filter('bandpass', 3600, 1.2)).connect(k.env(t, 0.1 * q.vel, 0.0005, 0.0055)).connect(k.pan((rand(t * 1000) - 0.5) * 0.3)).connect(out);
    k.osc('sine', 230, t, t + 0.08).connect(k.env(t, 0.035 * q.vel, 0.001, 0.011)).connect(out);
  },
  send(k, out, wet, q) {
    const t = q.t, bp = k.filter('bandpass', 500, 1.1), g = k.gain(0);
    bp.frequency.setValueAtTime(500, t - 0.16);
    bp.frequency.exponentialRampToValueAtTime(2600, t);
    g.gain.setValueAtTime(0, t - 0.16);
    g.gain.linearRampToValueAtTime(0.05, t - 0.015);
    g.gain.setTargetAtTime(0, t, 0.03);
    k.noise(t - 0.16, t + 0.25).connect(bp).connect(g).connect(out);
    // the send itself: a short rise from B4 to F#5
    const o = k.osc('sine', hz(71), t, t + 0.4);
    o.frequency.setValueAtTime(hz(71), t);
    o.frequency.exponentialRampToValueAtTime(hz(78), t + 0.05);
    const b = k.env(t, 0.06, 0.003, 0.05);
    o.connect(b);
    b.connect(out);
    b.connect(k.gain(0.3)).connect(wet);
  },
  chip(k, out, wet, q) {
    k.osc('sine', hz(87), q.t, q.t + 0.2).connect(k.env(q.t, 0.03, 0.002, 0.022)).connect(k.pan(-0.1)).connect(out);
  },
  check(k, out, wet, q) {
    bell(k, out, wet, q.t, 90, 0.02, 0.07, 0.35);
    bell(k, out, wet, q.t + 0.045, 95, 0.017, 0.08, 0.35);
  },
  card(k, out, wet, q) {
    const t = q.t, bp = k.filter('bandpass', 700, 1.4), g = k.gain(0), p = k.pan(-0.25);
    bp.frequency.setValueAtTime(700, t);
    bp.frequency.exponentialRampToValueAtTime(1700, t + 0.4);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.034, t + 0.14);
    g.gain.setTargetAtTime(0, t + 0.16, 0.09);
    p.pan.setValueAtTime(-0.25, t);
    p.pan.linearRampToValueAtTime(0.25, t + 0.45);
    k.noise(t, t + 0.9).connect(bp).connect(g).connect(p).connect(out);
  },
  // the fast-forwarded wait: an airy rise and a faint high ticker on the B major pentatonic, up to the answer
  gen(k, out, wet, q) {
    const t = q.t, u = q.until, bp = k.filter('bandpass', 900, 1.6), g = k.gain(0);
    bp.frequency.setValueAtTime(900, t);
    bp.frequency.exponentialRampToValueAtTime(3400, u);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.016, u - 0.05);
    g.gain.linearRampToValueAtTime(0, u + 0.02);
    k.noise(t, u + 0.05).connect(bp).connect(g).connect(out);
    const PENT = [95, 97, 99, 102, 104];
    for (let s = t, i = 0; s < u - 0.03; s += S16 / 2, i++) k.osc('sine', hz(PENT[Math.floor(rand(s * 977) * 5)]), s, s + 0.06).connect(k.env(s, 0.006 + 0.006 * ((s - t) / (u - t)), 0.001, 0.01)).connect(k.pan((i % 2 ? 0.3 : -0.3))).connect(out);
  },
  // the answer lands: a soft low thump, a bloom of the bed's own chord tones, a breath of air
  land(k, out, wet, q) {
    const t = q.t, o = k.osc('sine', 110, t, t + 0.5);
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(52, t + 0.12);
    o.connect(k.env(t, 0.15, 0.003, 0.07)).connect(out);
    q.notes.forEach((m, i) => bell(k, out, wet, t + i * 0.035, m, 0.02, 0.32, 0.65));
    k.noise(t, t + 0.6).connect(k.filter('highpass', 5200, 0.5)).connect(k.env(t, 0.014, 0.05, 0.1)).connect(out);
  },
  // the order is placed: a two-note confirmation, B5 then F#6, both in the F#11 bar it lands in
  ok(k, out, wet, q) {
    [[0, 83], [0.11, 90]].forEach(([d, m]) => {
      const t = q.t + d, f = hz(m);
      k.osc('sine', f, t, t + 0.8).connect(k.env(t, 0.05, 0.002, 0.12)).connect(out);
      k.osc('sine', f * 4, t, t + 0.2).connect(k.env(t, 0.008, 0.001, 0.02)).connect(out);
      k.osc('sine', f, t, t + 0.8).connect(k.env(t, 0.012, 0.002, 0.12)).connect(wet);
    });
  },
  press(k, out, wet, q) {
    const t = q.t;
    k.noise(t, t + 0.04).connect(k.filter('bandpass', 2200, 1.4)).connect(k.env(t, 0.07, 0.0005, 0.004)).connect(out);
    k.osc('sine', 880, t, t + 0.08).connect(k.env(t, 0.025, 0.001, 0.01)).connect(out);
  },
  // the chat fades to the end card's black: a low breath falling away
  close(k, out, wet, q) {
    const t = q.t, bp = k.filter('bandpass', 2200, 0.9), g = k.gain(0);
    bp.frequency.setValueAtTime(2200, t);
    bp.frequency.exponentialRampToValueAtTime(280, t + 0.6);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.035, t + 0.18);
    g.gain.setTargetAtTime(0, t + 0.24, 0.14);
    const n = k.noise(t, t + 1.3).connect(bp).connect(g);
    n.connect(out);
    n.connect(k.gain(0.4)).connect(wet);
  },
  // the mascot pops in: a rounded bubble rising to B5
  pop(k, out, wet, q) {
    const t = q.t, o = k.osc('sine', 330, t, t + 0.5);
    o.frequency.setValueAtTime(330, t);
    o.frequency.exponentialRampToValueAtTime(hz(83), t + 0.045);
    const g = k.env(t, 0.075, 0.002, 0.05);
    o.connect(g);
    g.connect(out);
    g.connect(k.gain(0.4)).connect(wet);
    k.noise(t, t + 0.03).connect(k.filter('highpass', 3000, 0.7)).connect(k.env(t, 0.025, 0.0005, 0.003)).connect(out);
  },
  // superbot.gg fades up: three glass notes of the B major chord, far back in the room
  shimmer(k, out, wet, q) {
    [90, 95, 99].forEach((m, i) => bell(k, out, wet, q.t + i * 0.09, m, 0.017, 0.6, 0.8));
  },
};

// a riser: band-passed noise opening from r0 to r1, cut dead on r1
function riser(k, out, r0, r1) {
  const bp = k.filter('bandpass', 350, 2), g = k.gain(0);
  bp.frequency.setValueAtTime(350, r0);
  bp.frequency.exponentialRampToValueAtTime(4500, r1);
  g.gain.setValueAtTime(0, r0);
  g.gain.linearRampToValueAtTime(0.055, r1);
  g.gain.linearRampToValueAtTime(0, r1 + 0.02);
  k.noise(r0, r1 + 0.05).connect(bp).connect(g).connect(out);
}

// ---------- the bed ----------
// every note goes through play(start, instrument, ...its arguments after the kit), which builds it just in time
function bed(play, out, duck, wet, fx, cue) {
  const kicks = [];
  const vel = (seed, lo = 0.82) => lo + (1 - lo) * rand(seed);
  const kickAt = (t, v) => { play(t, kick, out, t, v); kicks.push(t); };
  for (const b of cue.bars) {
    const t = b.t, ch = CHORDS[b.chord], s16 = (n) => t + n * S16;
    if (b.part === 'intro') {
      // the empty state: the pad swells in under the greeting (from the spot's start, half a bar before its line) and
      // hands over to the pulse's; one soft chord on the line
      const p0 = Math.max(0.02, t - BAR / 4);
      play(p0, pad, duck, wet, p0, t + BAR + 0.2 - p0, ch.pad, 0.05, 1100);
      play(t, ep, duck, wet, t, BAR, ch.pad, 0.75, 0.6);
      continue;
    }
    if (b.part === 'end') {
      // the lockup: the song's own B, held under the end card until the spot fades
      const len = cue.cycle - t;
      kickAt(t, 0.6);
      play(t, sub, duck, t, Math.min(1.6, len), 35, 0.8);
      play(t - 0.05, pad, duck, wet, t - 0.05, len, ch.pad, 0.05, 1300);
      play(t, ep, duck, wet, t, len, ch.pad, 0.85, 0.75);
      continue;
    }
    if (b.part === 'break') {
      // the song's generation: drums out, the chord moves to F#11 on beat 3 and a riser takes it into the press
      const half = BAR / 2, next = CHORDS['F#11'];
      play(t, pad, duck, wet, t, half, ch.pad, 0.045, 1500);
      play(t + half, pad, duck, wet, t + half, half, next.pad, 0.045, 1900);
      play(t, ep, duck, wet, t, half, ch.pad, 0.7, 0.45);
      play(t + half, ep, duck, wet, t + half, half, next.pad, 0.7, 0.45);
      play(t, sub, duck, t, half - 0.06, ch.bass, 0.8);
      play(t + half, sub, duck, t + half, half - 0.06, next.bass, 0.8);
      play(s16(2), hat, out, s16(2), 0.7);
      play(s16(6), hat, out, s16(6), 0.6);
      play(t, pluck, out, fx, t, 78, 0.8);
      play(t + half, riser, out, t + half, t + BAR - 0.02);
      continue;
    }
    play(t, pad, duck, wet, t, BAR, ch.pad, b.part === 'pulse' ? 0.04 : 0.036, b.part === 'pulse' ? 1200 : 1500);
    const groove = b.part === 'groove';
    // kick: half time on the pulse, four on the floor in the groove
    for (const n of groove ? [0, 4, 8, 12] : [0, 8]) kickAt(s16(n), vel(t * 31 + n, 0.9));
    // hats on every offbeat eighth, a touch late; an open one on the last offbeat of every other bar
    for (const n of [2, 6, 10, 14]) play(s16(n), hat, out, s16(n) + 0.012, vel(t * 17 + n, 0.6) * (groove ? 1 : 0.8), groove && n === 14 && b.i % 2 === 0);
    if (groove) for (const n of [4, 12]) play(s16(n), clap, out, wet, s16(n), vel(t * 13 + n));
    if (b.shaker) for (let n = 0; n < 16; n++) play(s16(n), shaker, out, s16(n) + (n % 2 ? 0.008 : 0), n % 4 === 2 ? 1 : 0.5 + 0.2 * rand(t * 7 + n));
    // muted stabs on the offbeats, the sub under them on the one and the and-of-three
    for (const n of groove ? [3, 6, 11] : [6, 14]) play(s16(n), ep, duck, wet, s16(n), S16 * 1.6, ch.pad, vel(t * 5 + n, 0.7));
    play(s16(0), sub, duck, s16(0), S16 * 5, ch.bass, 1);
    play(s16(10), sub, duck, s16(10), S16 * 3, ch.bass, 0.85);
    if (groove) play(s16(7), sub, duck, s16(7), S16 * 1.5, ch.bass + 12, 0.45);
    if (b.hook) ch.hook.forEach((m, i) => play(s16(HOOK_AT[i]), pluck, out, fx, s16(HOOK_AT[i]), m, vel(t * 3 + i, 0.75)));
  }
  // the pad, sub and stabs breathe with the kick, a couple of dB: felt, not heard pumping
  kicks.sort((a, b) => a - b).forEach((t) => {
    duck.gain.setValueAtTime(1, t);
    duck.gain.linearRampToValueAtTime(0.78, t + 0.012);
    duck.gain.linearRampToValueAtTime(1, t + 0.24);
  });
}

// a look-ahead peak limiter over the rendered buffer (5 ms ahead, 1.2 ms attack, 80 ms release) to the master ceiling,
// then a hard stop just above it for the little an attack that soft lets through. Returns the deepest gain it applied
function limit(buf) {
  const L = buf.getChannelData(0), R = buf.getChannelData(1), n = L.length, ahead = Math.round(buf.sampleRate * 0.005);
  const att = 1 - Math.exp(-1 / (buf.sampleRate * 0.0012)), rel = 1 - Math.exp(-1 / (buf.sampleRate * 0.08)), hard = CEIL * 1.02;
  const need = new Float32Array(n);
  for (let i = 0; i < n; i++) { const p = Math.max(Math.abs(L[i]), Math.abs(R[i])); need[i] = p > CEIL ? CEIL / p : 1; }
  // the lowest gain needed anywhere in the next `ahead` samples (a monotonic deque)
  const q = new Int32Array(n);
  let h = 0, tl = 0, g = 1, worst = 1;
  for (let i = 0, j = 0; i < n; i++) {
    for (; j < Math.min(n, i + ahead + 1); j++) { while (tl > h && need[q[tl - 1]] >= need[j]) tl--; q[tl++] = j; }
    while (q[h] < i) h++;
    const want = need[q[h]];
    g += (want - g) * (want < g ? att : rel);
    worst = Math.min(worst, g);
    L[i] = Math.max(-hard, Math.min(hard, L[i] * g));
    R[i] = Math.max(-hard, Math.min(hard, R[i] * g));
  }
  return worst;
}

// the whole mix. o: { first, cps, end, songFor, songFade, cycle, song (an ArrayBuffer of the mp3, or null),
// sampleRate, only: optional subset of ['music', 'sfx', 'song'] for a stem }
export async function renderScore(T, o) {
  const t0 = performance.now();
  const cue = cues(T, o);
  const sr = o.sampleRate || 48000;
  const c = new OfflineAudioContext(2, Math.ceil(cue.cycle * sr), sr);
  const k = makeKit(c);
  const on = (name) => !o.only || o.only.includes(name);

  const master = k.gain(1);
  master.connect(c.destination);
  // the spot's last half second fades out, so its held last frame never cuts a tail off
  master.gain.setValueAtTime(1, cue.cycle - 0.6);
  master.gain.linearRampToValueAtTime(0, cue.cycle - 0.03);

  // the bed: everything (its room and its echoes too) steps out at the song's press and comes back for the end card
  const music = k.gain(on('music') ? MUSIC : 0), duck = k.gain(1);
  const lowCut = k.filter('highpass', 28, 0.7);
  duck.connect(music);
  music.connect(lowCut).connect(master);
  music.gain.setValueAtTime(music.gain.value, cue.play - 0.06);
  music.gain.linearRampToValueAtTime(0, cue.play + 0.04);
  const back = cue.bars[cue.bars.length - 1].t;
  music.gain.setValueAtTime(0, back - 0.15);
  music.gain.linearRampToValueAtTime(on('music') ? MUSIC : 0, back - 0.1);
  const room = k.reverb(1.6);
  const wet = k.gain(0.32);
  wet.connect(room).connect(music);
  const fx = k.gain(0.5);
  fx.connect(pingPong(k, music, BEAT * 0.75, 0.34));
  fx.connect(k.gain(0.5)).connect(wet);
  // every voice, by its first sound: built a little before the pass reaches it, dropped once its sources stop
  // (o.parts, for QA: only the voices of these instruments and effects, by name: 'kick', 'pad', 'land'...)
  const jobs = [];
  const play = (t, fn, ...args) => { if (!o.parts || o.parts.includes(fn.name)) jobs.push({ t, fn, args }); };
  if (on('music')) bed(play, music, duck, wet, fx, cue);

  // the effects, in their own smaller room (a cue's voice may start up to 0.2 s before it: the send's swish)
  const sfx = k.gain(on('sfx') ? SFX : 0), sfxRoom = k.reverb(1.1), sfxWet = k.gain(0.3);
  sfx.connect(master);
  sfxWet.connect(sfxRoom).connect(sfx);
  if (on('sfx')) for (const q of cue.sfx) play(q.t - 0.2, FX[q.kind], sfx, sfxWet, q);

  jobs.sort((a, b) => a.t - b.t);
  const live = [];
  let next = 0;
  const build = (until) => {
    for (; next < jobs.length && jobs[next].t < until; next++) {
      const j = jobs[next];
      live.push(k.voice((port) => j.fn(k, ...j.args.map((a) => (a instanceof AudioNode ? port(a) : a))), LEVEL[j.fn.name] ?? 1));
    }
  };
  const drop = (now) => {
    for (let i = live.length - 1; i >= 0; i--) if (live[i].end < now) { live[i].ports.forEach((p) => p.disconnect()); live.splice(i, 1); }
  };
  const STEP = 0.5, LEAD = 1;
  build(STEP + LEAD);
  for (let s = STEP; s < cue.cycle - 0.01; s += STEP) c.suspend(s).then(() => { drop(s - 0.02); build(s + STEP + LEAD); return c.resume(); });

  // the song, from its press, fading out as the end card covers the chat (the beat's SONG_FOR and SONG_FADE)
  if (o.song && on('song')) {
    const buf = await c.decodeAudioData(o.song.slice(0));
    const src = c.createBufferSource(), g = k.gain(SONG);
    src.buffer = buf;
    const fade0 = cue.play + cue.songFor, fade1 = fade0 + cue.songFade;
    g.gain.setValueAtTime(SONG, fade0);
    g.gain.linearRampToValueAtTime(0, fade1);
    src.connect(g).connect(master);
    src.start(cue.play, 0);
    src.stop(Math.min(cue.cycle, fade1 + 0.05));
  }

  const t1 = performance.now();
  const out = await c.startRendering();
  const t2 = performance.now();
  out.limited = limit(out);
  // where the time went, for QA: building the graph (and decoding the song), rendering it, limiting the result
  out.ms = { build: Math.round(t1 - t0), render: Math.round(t2 - t1), limit: Math.round(performance.now() - t2) };
  return out;
}
