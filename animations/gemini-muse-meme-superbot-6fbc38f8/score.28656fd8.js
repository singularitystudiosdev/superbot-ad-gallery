// The multicat variant's soundtrack (music.28656fd8.js plays it): a clean, cool 120 bpm deep-house bed in B major, synthesized
// note by note on an OfflineAudioContext from the spot's own timeline (the multicat beat's plan), so a second of the buffer is
// a second of the spot and every hit lands where the picture does. Its bar line is the shipped song's (tiny-chaos.mp3: 120 bpm,
// B major, first downbeat SONG_ONE into the file, measured by spectral-flux beat phase), run back from the song's play press:
//   intro    a G#m9 pad and a bell under the greeting; a noise riser through the first ask's send into the first chip
//   groove   a soft kick, offbeat hats, a muted sub bass and rootless electric-piano stabs on Emaj9 D#m7 C#m9 F#13, building
//            ask by ask (four on the floor and a rim, then shaker, clap and a delayed pluck line); each generation runs a 16th
//            arp that lands as a bell on its answer, each later send a soft swoosh
//   handoff  the last bar is the V (F#13) into the song's I: a rim roll and a riser, a Bmaj9 stab on the song's
//            anticipation, then silence, so the song plays alone
//   resolve  a swell under the end card's cover, then Bmaj9 (pad, piano, a sub boom and a bell arp up the wordmark's fade)
//            on the bar line the mascot pops on, faded out before the clock holds its last frame
// Every cue snaps to the 16th grid; the noise is seeded, so every render is identical. The render ships as
// media/multicat.516afb1a/score.28656fd8.mp3 (window.__score.render() in a headless page, written as a 48 kHz WAV, then
// libmp3lame 192 kbps; Chromium and WebKit decode it sample-aligned to the WAV): after changing a sound here, re-render it
// and set FILE_FOR in music.28656fd8.js to fingerprint().
// the spot's clocks, handed over by the beat when it mounts the player (music.28656fd8.js mountMusic): its chain plan T, the
// first ask's send, and the run's length (__AD.CYCLE)
let clocks = null;
export function setClocks(c) { clocks = c; }

const SR = 48000;
const BEAT = 0.5, BAR = 4 * BEAT, SIX = BEAT / 4; // 120 bpm, the song's tempo
const SONG_ONE = 0.207; // s into tiny-chaos.mp3 of its first downbeat
const LEVEL = 0.6;      // the mix into the soft clipper: the groove at about -17 LUFS, 3 dB under the song's -14
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
const mod = (a, n) => ((a % n) + n) % n;

// each chord: its bass root, a rootless electric-piano voicing (voice-led bar to bar) and a wider pad voicing, all MIDI
const CHORDS = {
  'G#m9': { root: 32, ep: [54, 58, 59, 63], pad: [56, 59, 63, 66, 70] },
  'Emaj9': { root: 40, ep: [51, 54, 56, 59], pad: [52, 59, 63, 66, 68] },
  'D#m7': { root: 39, ep: [51, 54, 58, 61], pad: [54, 58, 61, 63, 70] },
  'C#m9': { root: 37, ep: [52, 56, 59, 63], pad: [52, 56, 59, 63, 68] },
  'F#13': { root: 42, ep: [52, 56, 58, 63], pad: [52, 58, 63, 66, 68] },
  'Bmaj9': { root: 35, ep: [47, 54, 58, 61, 63], pad: [47, 59, 63, 66, 70, 73] },
};
// the groove's loop, counted back from the song's bar so its last two bars are the ii-V into the song's B
const LOOP = ['Emaj9', 'D#m7', 'C#m9', 'F#13'];
// [16th, length in 16ths, velocity, interval above the root, plays the next bar's root (the house anticipation)]
const BASS_A = [[0, 3, 1], [6, 2, 0.8], [10, 2, 0.85], [14, 2, 0.75, 0, true]];
const BASS_B = [[0, 2, 1], [3, 1, 0.7, 12], [6, 2, 0.85], [10, 2, 0.9], [12, 1, 0.6, 7], [14, 2, 0.8, 0, true]];
const BASS_V = [[0, 6, 1], [8, 3, 0.9], [11, 1, 0.7, 12], [12, 2, 0.8]];
// the piano's stabs: [16th, length in 16ths, velocity]; -2 is the anticipation of its own bar's chord
const KEYS = [[-2, 7, 0.85], [6, 1.5, 0.55], [10, 3, 0.72]];

// every time the score needs, from the spot's own clocks (setClocks: the beat's plan, its first send, the run's length)
export function cueSheet() {
  const T = clocks.T; // the chain from its first reply (window.__AD.ART)
  const [M, O, S] = T.steps;
  const len = clocks.len();     // the run under this variant (scenes/tabs.9b47fc30.js dur)
  const one = S.play + SONG_ONE; // the song's first downbeat on the spot's clock: the bar line
  const bar0 = mod(one, BAR);    // the first bar line after 0
  const at = (bar, six = 0) => bar0 + bar * BAR + six * SIX;
  const snap = (t) => bar0 + Math.round((t - bar0) / SIX) * SIX;
  const song = Math.round((one - bar0) / BAR);
  const groove = Math.round((clocks.send + 0.35 - bar0) / BAR); // the bar line the first routing chip lands on
  const resolve = Math.ceil((S.cut + 0.3 - bar0) / BAR);      // the first bar line after the end card's mascot starts its pop
  const cues = {
    hello: at(0), groove: at(groove), imageGen: snap(T.gen0), image: snap(T.done), send2: snap(M.send), modelGen: snap(M.gen0),
    model: snap(M.done), send3: snap(O.send), order: snap(O.done), send4: snap(S.send), songGen: snap(S.gen0), songCard: snap(S.done),
    stop: at(song, -2), song: one, swell: snap(S.cut), resolve: at(resolve), end: len,
  };
  return { len, bar0, at, groove, song, cues, gens: [[cues.imageGen, cues.image], [cues.modelGen, cues.model], [cues.songGen, cues.songCard]] };
}
// the cue sheet as one string: the shipped render (music.28656fd8.js FILE_FOR) is only used while it still matches
export const fingerprint = () => Object.values(cueSheet().cues).map((v) => v.toFixed(3)).join(' ');

function mulberry(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// a 2.4 s stereo room: seeded noise under an exponential decay, darkening as it falls, after a 12 ms predelay
function room(c, rand) {
  const n = Math.round(2.4 * SR), pre = Math.round(0.012 * SR), b = c.createBuffer(2, n, SR);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    let y = 0;
    for (let i = pre; i < n; i++) {
      const x = (i - pre) / (n - pre);
      y += (0.08 + 0.6 * (1 - x)) * ((rand() * 2 - 1) - y);
      d[i] = y * Math.exp(-7 * x);
    }
  }
  return b;
}

// transparent under 0.6, rounding the rare peak toward 0.95 (no lookahead, so nothing is delayed off the grid)
function softClip() {
  const n = 4096, curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = 1.5 * (i / (n - 1) * 2 - 1), a = Math.abs(x);
    curve[i] = a < 0.6 ? x : Math.sign(x) * (0.6 + 0.35 * Math.tanh((a - 0.6) / 0.35));
  }
  return curve;
}

// the buses: piano, pad, pluck and bass ride a gain the kicks duck; a room and a dotted-8th delay as sends
function mixer(c, rand) {
  const amp = (v = 1) => { const g = c.createGain(); g.gain.value = v; return g; };
  const send = (from, to, v) => from.connect(amp(v)).connect(to);
  const pan = (v) => { const p = c.createStereoPanner(); p.pan.value = v; return p; };
  const mix = amp(), duck = amp(), gate = amp(), pre = amp(LEVEL / 1.5), clip = c.createWaveShaper(), air = c.createBiquadFilter();
  clip.curve = softClip();
  air.type = 'highshelf';
  air.frequency.value = 3500;
  air.gain.value = 3;
  duck.connect(mix);
  mix.connect(air).connect(pre).connect(clip).connect(gate).connect(c.destination);
  const verb = c.createConvolver();
  verb.buffer = room(c, rand);
  const verbIn = amp();
  verbIn.connect(verb).connect(amp(0.5)).connect(mix);
  const dly = c.createDelay(1), dlyIn = amp(), fb = amp(0.3), dlp = c.createBiquadFilter();
  dly.delayTime.value = 3 * SIX;
  dlp.frequency.value = 2800;
  dlyIn.connect(dly).connect(dlp).connect(fb).connect(dly);
  dlp.connect(amp(0.5)).connect(mix);
  send(dlp, verbIn, 0.3);
  // the piano drifts slowly side to side, its presence and tine edge lifted
  const ep = amp(), epPan = pan(0), lfo = c.createOscillator(), shelf = c.createBiquadFilter(), presence = c.createBiquadFilter();
  shelf.type = 'highshelf';
  shelf.frequency.value = 2000;
  shelf.gain.value = 5;
  presence.type = 'peaking';
  presence.frequency.value = 1200;
  presence.gain.value = 3;
  lfo.frequency.value = 0.4;
  lfo.connect(amp(0.3)).connect(epPan.pan);
  lfo.start(0);
  ep.connect(presence).connect(shelf).connect(epPan).connect(duck);
  send(ep, verbIn, 0.16);
  const pad = amp(), pluck = amp(), bell = amp(), bass = amp(), drums = amp(), hats = amp(), shaker = amp(), rim = amp(), clap = amp(), fx = amp();
  pad.connect(duck); send(pad, verbIn, 0.55);
  pluck.connect(duck); send(pluck, dlyIn, 0.45); send(pluck, verbIn, 0.2);
  bell.connect(mix); send(bell, verbIn, 0.5); send(bell, dlyIn, 0.22);
  const warm = c.createWaveShaper(); // the bass's 2nd and 3rd harmonics, so it reads on a laptop speaker
  warm.curve = Float32Array.from({ length: 1024 }, (_, i) => Math.tanh(1.8 * (i / 1023 * 2 - 1)) / Math.tanh(1.8));
  bass.connect(warm).connect(duck);
  drums.connect(mix);
  hats.connect(pan(0.18)).connect(drums);
  shaker.connect(pan(-0.3)).connect(drums);
  rim.connect(pan(-0.1)).connect(drums); send(rim, verbIn, 0.18);
  clap.connect(drums); send(clap, verbIn, 0.3);
  fx.connect(mix); send(fx, verbIn, 0.35);
  return { amp, duck, gate, bus: { ep, pad, pluck, bell, bass, drums, hats, shaker, rim, clap, fx } };
}

// the instruments, each a few nodes scheduled at absolute times
function kit(c, rand) {
  const m = mixer(c, rand), { amp, bus } = m, kicks = [];
  const NOISE = c.createBuffer(1, 2 * SR, SR);
  NOISE.getChannelData(0).forEach((_, i, d) => { d[i] = rand() * 2 - 1; });
  const noise = (t, end) => { const s = c.createBufferSource(); s.buffer = NOISE; s.loop = true; s.start(t, rand() * 1.5); s.stop(end); return s; };
  const filt = (type, f, Q = 0.7) => { const n = c.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = Q; return n; };
  const osc = (type, f, t, end) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; o.start(t); o.stop(end); return o; };
  // struck: up to `peak` in `a`, decaying toward peak * floor (time constant d), released at `off` (time constant r)
  const strike = (g, t, peak, a, d, floor = 0, off = 0, r = 0.05) => {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(peak * floor, t + a, d);
    if (off > t + a) g.gain.setTargetAtTime(0, off, r);
  };
  return {
    ...m, rand, kicks,
    // an FM electric piano: a ratio-1 modulator barks on the strike and settles into a round sine
    ep(t, n, len, vel) {
      const f = midi(n), end = t + len + 0.6, car = osc('sine', f, t, end), fm = osc('sine', f, t, end), idx = amp(f * (0.8 + 1.8 * vel)), g = amp(0);
      idx.gain.setTargetAtTime(f * 0.22, t, 0.16);
      fm.connect(idx).connect(car.frequency);
      strike(g, t, 0.13 * vel, 0.004, 0.4, 0.3, t + len, 0.08);
      car.connect(g).connect(bus.ep);
    },
    // detuned saws, spread across the field under one slow lowpass
    pad(t, notes, len, level, attack, release = 0.8) {
      const lp = filt('lowpass', 700, 0.3), g = amp(0), end = t + len + release * 5;
      lp.frequency.setValueAtTime(700, t);
      lp.frequency.linearRampToValueAtTime(3200, t + Math.min(len, attack + 1.2));
      lp.frequency.linearRampToValueAtTime(1500, t + len);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(level, t + attack);
      g.gain.setValueAtTime(level, t + len);
      g.gain.setTargetAtTime(0, t + len, release);
      lp.connect(g).connect(bus.pad);
      notes.forEach((n, i) => [-1, 1].forEach((side) => {
        const o = osc('sawtooth', midi(n), t, end), p = c.createStereoPanner();
        o.detune.value = side * (5 + rand() * 4);
        p.pan.value = side * (0.25 + 0.5 * (i / Math.max(1, notes.length - 1)));
        o.connect(amp(0.5 / notes.length)).connect(p).connect(lp);
      }));
    },
    // a muted sub: a sine and a soft octave, short and round
    bass(t, n, len, vel) {
      const f = midi(n), end = t + len + 0.3, g = amp(0), lp = filt('lowpass', 420, 0.9);
      osc('sine', f, t, end).connect(g);
      osc('triangle', f * 2, t, end).connect(amp(0.18)).connect(g);
      strike(g, t, 0.24 * vel, 0.006, 0.18, 0.55, t + len, 0.025);
      g.connect(lp).connect(bus.bass);
    },
    // a felt kick: a short pitch drop and a soft click; it ducks the music bus
    kick(t, vel, low = 48, decay = 0.11) {
      const o = osc('sine', 150, t, t + decay * 9), g = amp(0), hp = filt('highpass', 2500), cg = amp(0);
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(low, t + 0.07);
      strike(g, t, 0.42 * vel, 0.002, decay);
      o.connect(g).connect(bus.drums);
      strike(cg, t, 0.09 * vel, 0.001, 0.004);
      noise(t, t + 0.03).connect(hp).connect(cg).connect(bus.drums);
      kicks.push(t);
    },
    hat(t, vel, open = false) {
      const hp = filt('highpass', 7200, 0.6), pk = filt('peaking', 10000, 1), g = amp(0);
      pk.gain.value = 5;
      strike(g, t, 0.22 * vel, 0.001, open ? 0.075 : 0.02);
      noise(t, t + (open ? 0.6 : 0.15)).connect(hp).connect(pk).connect(g).connect(bus.hats);
    },
    shaker(t, vel) {
      const g = amp(0);
      strike(g, t, 0.1 * vel, 0.014, 0.025);
      noise(t, t + 0.2).connect(filt('bandpass', 6200, 0.9)).connect(g).connect(bus.shaker);
    },
    rim(t, vel) {
      const end = t + 0.2, g = amp(0), gn = amp(0);
      osc('sine', 1700, t, end).connect(amp(0.5)).connect(g);
      osc('triangle', 520, t, end).connect(amp(0.7)).connect(g);
      strike(g, t, 0.15 * vel, 0.0008, 0.014);
      strike(gn, t, 0.1 * vel, 0.0008, 0.01);
      noise(t, end).connect(filt('bandpass', 3200, 1.6)).connect(gn).connect(bus.rim);
      g.connect(bus.rim);
    },
    // three quick bursts and a short tail of band-passed noise
    clap(t, vel) {
      const g = amp(0);
      g.gain.setValueAtTime(0, t);
      for (const d of [0, 0.011, 0.022]) { g.gain.setValueAtTime(0.2 * vel, t + d); g.gain.setTargetAtTime(0, t + d + 0.001, 0.004); }
      g.gain.setValueAtTime(0.14 * vel, t + 0.033);
      g.gain.setTargetAtTime(0, t + 0.034, 0.055);
      noise(t, t + 0.5).connect(filt('bandpass', 1350, 1.3)).connect(g).connect(bus.clap);
    },
    pluck(t, n, vel) {
      const lp = filt('lowpass', 4200, 2.5), g = amp(0);
      lp.frequency.setValueAtTime(4200, t);
      lp.frequency.setTargetAtTime(650, t, 0.05);
      strike(g, t, 0.075 * vel, 0.002, 0.13);
      osc('sawtooth', midi(n), t, t + 0.9).connect(lp).connect(g).connect(bus.pluck);
    },
    // a glassy FM bell (an inharmonic 3.5 ratio, its brightness falling away)
    bell(t, n, vel) {
      const f = midi(n), end = t + 3.2, car = osc('sine', f, t, end), fm = osc('sine', f * 3.5, t, end), idx = amp(f * 1.4 * vel), g = amp(0);
      idx.gain.setTargetAtTime(0, t, 0.35);
      fm.connect(idx).connect(car.frequency);
      strike(g, t, 0.075 * vel, 0.002, 0.6);
      car.connect(g).connect(bus.bell);
    },
    // a send: band-passed air rising into the moment the message goes
    swoosh(t, vel) {
      const bp = filt('bandpass', 900, 1.1), g = amp(0);
      bp.frequency.setValueAtTime(900, t - 0.1);
      bp.frequency.exponentialRampToValueAtTime(5200, t + 0.05);
      g.gain.setValueAtTime(0, t - 0.1);
      g.gain.linearRampToValueAtTime(0.05 * vel, t);
      g.gain.setTargetAtTime(0, t, 0.03);
      noise(t - 0.1, t + 0.2).connect(bp).connect(g).connect(bus.fx);
    },
    // filtered noise opening from t0 and cut at t1 (a band-pass riser, or a lowpass swell)
    riser(t0, t1, peak, type = 'bandpass') {
      const f = filt(type, 400, type === 'bandpass' ? 1.6 : 0.5), g = amp(0);
      f.frequency.setValueAtTime(400, t0);
      f.frequency.exponentialRampToValueAtTime(type === 'bandpass' ? 7000 : 5000, t1);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(peak, t1 - 0.01);
      g.gain.linearRampToValueAtTime(0, t1 + 0.04);
      noise(t0, t1 + 0.1).connect(f).connect(g).connect(bus.fx);
    },
  };
}

// one groove bar: drums by section (s counts bars from the groove's first), the bass line and the piano's stabs
function grooveBar(k, q, b, chordOf) {
  const s = b - q.groove, last = b === q.song - 1, ch = chordOf(b), next = chordOf(b + 1);
  const t = (six) => q.at(b, six), vary = (v) => v * (0.88 + 0.24 * k.rand());
  for (const six of last ? [0, 4, 8] : s >= 2 ? [0, 4, 8, 12] : [0, 8]) k.kick(t(six), six % 8 ? 0.85 : 1);
  if (s >= 2) k.rim(t(4), vary(0.8));
  if (s >= 2 && !last) k.rim(t(12), vary(0.8));
  if (s >= 6 && !last) for (const six of [4, 12]) k.clap(t(six), vary(0.75));
  for (let six = 0; six < (last ? 14 : 16); six++) {
    const open = six === 14 && s >= 6 && s % 2 === 0;
    if (six % 4 === 2) k.hat(t(six), vary(open ? 0.85 : 0.75), open);
    else if (six % 2 && s >= 3) k.hat(t(six), vary(0.32));
    if (s >= 6) k.shaker(t(six), vary(six % 2 ? 0.55 : 0.85));
  }
  if (last) for (let six = 10; six < 14; six++) k.rim(t(six), 0.35 + 0.15 * (six - 10));
  for (const [six, len, vel, iv = 0, ant] of last ? BASS_V : s >= 2 ? BASS_B : BASS_A) k.bass(t(six), (ant ? next : ch).root + iv, len * SIX, vel);
  for (const [six, len, vel] of b === q.groove ? [[0, 5, 0.9], ...KEYS.slice(1)] : KEYS) {
    ch.ep.forEach((n, i) => k.ep(t(six) + i * 0.006, n, len * SIX, vary(vel)));
  }
  // the last section's pluck line, echoed by the delay
  if (s >= 6 && !last) for (const [six, n] of [[3, ch.ep[3] + 12], [7, ch.ep[1] + 24], [11, ch.ep[2] + 12]]) k.pluck(t(six), n, vary(0.5));
}

function arrange(k, q) {
  const C = q.cues;
  const chordOf = (b) => CHORDS[b < q.groove ? 'G#m9' : b >= q.song ? 'Bmaj9' : LOOP[mod(b - q.song, 4)]];
  const chordAt = (t) => chordOf(Math.floor((t - q.bar0) / BAR + 1e-6));
  const bells = (t, steps, vel) => { const ch = chordAt(t); steps.forEach((i, j) => k.bell(t + j * SIX, ch.ep[i] + 24, vel - j * 0.08)); };
  // intro: the greeting's pad and bell, and a riser through the first ask's send into the first chip
  k.pad(0, CHORDS['G#m9'].pad, C.groove - 0.05, 0.9, 1.4, 0.45);
  bells(C.hello, [2, 3], 0.7);
  k.riser(C.groove - BAR / 2, C.groove, 0.14);
  for (let b = q.groove; b < q.song; b++) {
    grooveBar(k, q, b, chordOf);
    k.pad(q.at(b), chordOf(b).pad, BAR, 0.55, 0.25, 0.5);
  }
  // each generation: a rising 16th arp under its skeleton, landing as a bell on its answer
  for (const [g0, g1] of q.gens) {
    const n = Math.round((g1 - g0) / SIX);
    for (let i = 0; i < n; i++) { const ch = chordAt(g0 + i * SIX); k.pluck(g0 + i * SIX, ch.ep[i % 4] + 12 * (1 + Math.floor(i / 4) % 2), 0.35 + 0.45 * (i / Math.max(1, n - 1))); }
  }
  bells(C.image, [2, 3], 0.8);
  bells(C.model, [1, 2, 3], 0.85);
  bells(C.order, [2, 3], 0.8);
  bells(C.songCard, [3], 0.7);
  for (const t of [C.send2, C.send3, C.send4]) k.swoosh(t, 1);
  // the handoff: the riser climbs the V bar, a Bmaj9 stab on the song's anticipation, then the gate closes
  k.riser(q.at(q.song - 1), C.stop, 0.16);
  const B = CHORDS['Bmaj9'];
  B.ep.forEach((n, i) => k.ep(C.stop + i * 0.006, n, 1.5 * SIX, 0.7));
  k.bass(C.stop, B.root, 1.5 * SIX, 0.8);
  // the end card: a swell under its cover, then Bmaj9 on the mascot's bar line, a bell arp up the wordmark's fade
  k.riser(C.swell, C.resolve, 0.1, 'lowpass');
  k.pad(C.swell, B.pad, q.len - C.swell, 0.8, C.resolve - C.swell, 0.6);
  k.kick(C.resolve, 1, midi(B.root), 0.35);
  k.bass(C.resolve, B.root, 2.2, 1);
  B.ep.forEach((n, i) => k.ep(C.resolve + i * 0.008, n, 2.4, 0.85));
  [78, 82, 85, 87].forEach((n, i) => k.bell(C.resolve + i * 2 * SIX, n, 0.8 - i * 0.07));
  // the kicks pump the music bus
  const dg = k.duck.gain;
  for (const t of [...k.kicks].sort((a, b) => a - b)) { dg.setTargetAtTime(0.62, t, 0.004); dg.setTargetAtTime(1, t + 0.04, 0.09); }
  // the gate: open, shut just after the handoff's stab (the song's own pickup starts 0.16 s later), open for the swell,
  // and faded out before the clock holds its last frame
  const g = k.gate.gain;
  g.setValueAtTime(1, 0);
  g.setValueAtTime(1, C.stop + 0.06);
  g.linearRampToValueAtTime(0, C.stop + 0.2);
  g.setValueAtTime(0, C.swell - 0.02);
  g.linearRampToValueAtTime(1, C.swell);
  g.setValueAtTime(1, q.len - 1.3);
  g.linearRampToValueAtTime(0, q.len - 0.1);
}

// the whole score as one stereo buffer, as long as the run
export function renderScore() {
  const q = cueSheet();
  const c = new OfflineAudioContext(2, Math.ceil(q.len * SR), SR);
  arrange(kit(c, mulberry(0x28656fd8)), q);
  return c.startRendering();
}
