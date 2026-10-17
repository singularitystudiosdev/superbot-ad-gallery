// DEAR API USERS, the soundtrack (v4): an original cue synthesised in WebAudio, no samples and nothing licensed. It is
// rendered once through an OfflineAudioContext and played from the ad's own clock (window.__AD), so a seek, pause, step
// or restart re-cues the buffer at the frame on screen, and at the natural end the tail rings out.
//
// 125 BPM, beat n at GRID + n * BEAT: every cue in __AD.beats lands within 40 ms of that 8th grid. F minor, turning to
// A-flat major when After superbot lands. The hits come from the ad's beat table, the pulse from the grid:
//   0.15   the code tile: a blip and a muffled thump; DEAR / API / USERS on three plucks, F Ab C
//   2.38   the bill: a four-floor pulse and bass 8ths; 2.7 to 4.1 a tick a 16th, pitched by the price, under a riser;
//          $30,000 lands on a C7(b9) stab
//   5.2    the swap: a D-flat lift (C7 wants F minor and gets D-flat), then the ticks fall with the price to $800
//   6.4    97% less: an A-flat chime, and the groove comes in (A-flat, E-flat, F minor, D-flat)
//   7.6    One download, a pluck a word; the drums drop out for the 8th before
//   9.3    the strike: a slash panned left to right with the red bar, an 808 drop
//   10.22  superbot.gg: the opening motif a third up in A-flat major (the mascot sings its last note), a button on the
//          12.18 downbeat, silent by about 14.5
// Audio needs a gesture: until one, the pill reads Tap for sound (it, or a tap on the stage, plays the spot from the top
// with sound; any key unlocks it in place). After that the pill and M toggle mute.
(function () {
  'use strict';
  const ad = window.__AD, btn = document.getElementById('snd');
  if (!ad || !btn) return;
  const q = new URLSearchParams(location.search);
  const AC = window.AudioContext || window.webkitAudioContext;
  if ((q.has('t') && !q.has('play')) || !AC) { btn.hidden = true; return; } // a frozen frame stays silent

  // ---------- grid and pitch ----------
  const SR = 48000, TAIL = 2.2;
  const BPM = 125, BEAT = 60 / BPM, E8 = BEAT / 2, S16 = BEAT / 4, GRID = 0.18;
  const beat = (n) => GRID + n * BEAT;
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const midi = (n) => { const m = /^([A-G])(b|#)?(\d)$/.exec(n); return 12 * (+m[3] + 1) + SEMI[m[1]] + (m[2] === 'b' ? -1 : m[2] === '#' ? 1 : 0); };
  const hz = (n) => 440 * Math.pow(2, ((typeof n === 'number' ? n : midi(n)) - 69) / 12);
  const ramp = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const firstSixteenth = (t) => Math.ceil((t - GRID) / S16 - 1e-6);
  // mulberry32: the same noise on every render, so every export of the cue matches (to the 16-bit LSB)
  const rng = (s) => () => { s = (s + 0x6d2b79f5) | 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };

  // ---------- the desk: a glue compressor, a generated plate, a dotted-8th ping-pong, channel strips ----------
  function desk(ctx) {
    const rand = rng(0xd3a2);
    const set = (node, v) => { for (const k in v) node[k].value = v[k]; return node; };
    const filt = (type, f, Q = 0.7) => set(Object.assign(ctx.createBiquadFilter(), { type }), { frequency: f, Q });
    const gain = (g = 1) => set(ctx.createGain(), { gain: g });
    const noise = ctx.createBuffer(1, SR * 2, SR), nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = rand() * 2 - 1;

    const bus = gain(0.7);
    bus.connect(set(ctx.createDynamicsCompressor(), { threshold: -16, knee: 8, ratio: 4, attack: 0.003, release: 0.15 })).connect(ctx.destination);
    const ir = ctx.createBuffer(2, Math.floor(SR * 2.6), SR);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (rand() * 2 - 1) * Math.pow(1 - i / d.length, 3.2); }
    const plate = ctx.createConvolver(); plate.buffer = ir;
    const verbIn = gain();
    verbIn.connect(filt('lowpass', 5200)).connect(plate).connect(gain(0.4)).connect(bus);
    const dlyIn = gain(), dl = ctx.createDelay(1), dr = ctx.createDelay(1), dlyOut = gain(0.45);
    dl.delayTime.value = dr.delayTime.value = BEAT * 0.75;
    dlyIn.connect(dl);
    dl.connect(set(ctx.createStereoPanner(), { pan: -0.7 })).connect(dlyOut);
    dl.connect(dr).connect(set(ctx.createStereoPanner(), { pan: 0.7 })).connect(dlyOut);
    dr.connect(filt('lowpass', 3800)).connect(gain(0.36)).connect(dl);
    dlyOut.connect(bus);
    const padBus = gain(); padBus.connect(bus); // ducked against every kick

    function strip(level, o = {}) {
      const g = gain(level);
      const tail = o.pan ? g.connect(set(ctx.createStereoPanner(), { pan: o.pan })) : g;
      tail.connect(o.to || bus);
      if (o.verb) tail.connect(gain(o.verb)).connect(verbIn);
      if (o.delay) tail.connect(gain(o.delay)).connect(dlyIn);
      return g;
    }
    // the frequency is anchored at t0, so a ramp scheduled after it glides from the note rather than from time 0
    function osc(type, f, t0, t1, dest, detune = 0) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.frequency.setValueAtTime(f, t0); o.detune.value = detune;
      o.connect(dest); o.start(t0); o.stop(t1); return o;
    }
    function hiss(t0, t1, dest) {
      const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true;
      s.connect(dest); s.start(t0, rand() * 1.5); s.stop(t1); return s;
    }
    // a percussive envelope into dest: linear attack to peak, then an exponential fall with time constant tau
    function env(t, peak, a, tau, dest) {
      const g = gain(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.setTargetAtTime(0, t + a, tau);
      g.connect(dest); return g;
    }
    function shaper(k) {
      const s = ctx.createWaveShaper(), c = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) c[i] = Math.tanh(k * (i / 511.5 - 1)) / Math.tanh(k);
      s.curve = c; s.oversample = '2x'; return s;
    }
    return { ctx, bus, padBus, filt, gain, strip, osc, hiss, env, shaper };
  }

  // ---------- drums ----------
  function drums(D) {
    const { bus, filt, strip, osc, hiss, env, shaper } = D;
    function kick(t, v = 1, muffle = 0) {
      const out = muffle ? filt('lowpass', muffle) : shaper(1.8);
      out.connect(bus);
      const o = osc('sine', 150, t, t + 0.8, env(t, v, 0.002, 0.12, out));
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(52, t + 0.09); o.frequency.exponentialRampToValueAtTime(42, t + 0.5);
      if (!muffle) { const hp = filt('highpass', 2500); hp.connect(env(t, v * 0.25, 0.001, 0.006, bus)); hiss(t, t + 0.05, hp); }
    }
    // an 808: a sine falling onto the note, saturated so a laptop speaker hears it; drop keeps falling
    function boom(t, note, len, v, drop = false) {
      const f = hz(note), sh = shaper(2.5); sh.connect(bus);
      const o = osc('sine', f * 2.2, t, t + len + 0.3, env(t, v, 0.004, len / 4, sh));
      o.frequency.setValueAtTime(f * 2.2, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.07);
      if (drop) o.frequency.exponentialRampToValueAtTime(f * 0.6, t + len);
    }
    function clap(t, v = 0.3, o = {}) {
      const bp = filt('bandpass', 1300, 0.9); bp.connect(strip(v, { pan: o.pan || -0.08, verb: o.verb ?? 0.22 }));
      const g = D.gain(0); g.connect(bp);
      [0, 0.011, 0.023].forEach((d) => { g.gain.setValueAtTime(1, t + d); g.gain.setTargetAtTime(0.15, t + d + 0.001, 0.004); });
      g.gain.setValueAtTime(0.9, t + 0.034); g.gain.setTargetAtTime(0, t + 0.035, 0.06);
      hiss(t, t + 0.45, g);
    }
    function hat(t, v = 0.05, open = false) {
      const hp = filt('highpass', 7500); hp.connect(strip(v, { pan: 0.22 }));
      hiss(t, t + (open ? 0.6 : 0.12), env(t, 1, 0.001, open ? 0.09 : 0.014, hp));
    }
    function crash(t, v = 0.15, len = 1.8) {
      const hp = filt('highpass', 4200); hp.connect(strip(v, { verb: 0.35 }));
      hiss(t, t + len + 0.2, env(t, 1, 0.002, len / 4, hp));
      [3170, 4630, 5810, 7340].forEach((f) => osc('square', f, t, t + len, env(t, 0.05, 0.002, len / 6, hp)));
    }
    return { kick, boom, clap, hat, crash };
  }

  // ---------- tonal voices ----------
  function synths(D) {
    const { filt, strip, osc, env, shaper } = D;
    // a pad: two detuned saws a note through one lowpass that moves along cut = [[t, hz], ...]
    function pad(t0, t1, notes, v, o) {
      const a = o.a ?? 0.4, r = o.r ?? 0.3;
      const lp = filt('lowpass', o.cut[0][1], 0.8); lp.connect(strip(v / notes.length, { verb: o.verb ?? 0.32, to: D.padBus }));
      lp.frequency.setValueAtTime(o.cut[0][1], o.cut[0][0]);
      o.cut.slice(1).forEach(([t, f]) => lp.frequency.exponentialRampToValueAtTime(f, t));
      const g = D.gain(0); g.connect(lp);
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(1, t0 + a); g.gain.setValueAtTime(1, t1); g.gain.setTargetAtTime(0, t1, r / 3);
      for (const n of notes) for (const d of [-7, 7]) osc('sawtooth', hz(n), t0, t1 + r * 2 + 0.1, g, d);
    }
    function pluck(t, note, v, o = {}) {
      const lp = filt('lowpass', 5200, 2); lp.connect(strip(v, { pan: o.pan || 0, verb: o.verb ?? 0.18, delay: o.delay ?? 0.3 }));
      lp.frequency.setValueAtTime(5200, t); lp.frequency.setTargetAtTime(700, t, 0.09);
      const g = env(t, 1, 0.003, o.tau || 0.2, lp);
      osc('sawtooth', hz(note), t, t + 1.4, g, -5); osc('triangle', hz(note), t, t + 1.4, g, 5);
    }
    // a bell: two-operator FM at an inharmonic 3.5 ratio, the index falling faster than the level
    function bell(t, note, v, o = {}) {
      const f = hz(note);
      const car = osc('sine', f, t, t + 3, env(t, 1, 0.002, o.tau || 0.45, strip(v, { pan: o.pan || 0, verb: o.verb ?? 0.35, delay: o.delay ?? 0.25 })));
      const idx = D.gain(0); idx.connect(car.frequency);
      idx.gain.setValueAtTime(f * 2.2, t); idx.gain.setTargetAtTime(0, t, 0.2);
      osc('sine', f * 3.5, t, t + 3, idx);
    }
    function stab(t, notes, v, len, o = {}) {
      const out = strip(v / notes.length, { verb: o.verb ?? 0.3, pan: o.pan || 0 });
      let head = out;
      if (o.drive) { head = shaper(o.drive); head.connect(out); }
      const lp = filt('lowpass', 6000, 1.5); lp.connect(head);
      lp.frequency.setValueAtTime(6000, t); lp.frequency.setTargetAtTime(o.floor || 900, t + 0.02, len / 3);
      const g = D.gain(0); g.connect(lp);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + 0.005); g.gain.setTargetAtTime(0.45, t + 0.01, 0.12); g.gain.setTargetAtTime(0, t + len, 0.08);
      for (const n of notes) { osc('sawtooth', hz(n), t, t + len + 0.6, g, -6); osc('square', hz(n), t, t + len + 0.6, g, 6); }
    }
    function bass(t, note, len, v) {
      const lp = filt('lowpass', 1400, 5); lp.connect(strip(v));
      lp.frequency.setValueAtTime(1400, t); lp.frequency.setTargetAtTime(240, t + 0.005, 0.06);
      const g = D.gain(0); g.connect(lp);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + 0.004); g.gain.setValueAtTime(1, t + len - 0.02); g.gain.linearRampToValueAtTime(0, t + len);
      osc('sawtooth', hz(note), t, t + len + 0.01, g);
      const sub = D.gain(0.6); sub.connect(g); osc('sine', hz(note) / 2, t, t + len + 0.01, sub);
    }
    return { pad, pluck, bell, stab, bass };
  }

  // ---------- effects: counter ticks, swells, sweeps, the strike, the mascot ----------
  function fx(D) {
    const { filt, strip, osc, hiss, env } = D;
    function tick(t, f, v, pan = 0) { osc('square', f, t, t + 0.06, env(t, 1, 0.001, 0.009, strip(v, { pan, delay: 0.08 }))); }
    // a reversed cymbal: band-passed noise rising into tEnd and cut on it
    function swell(tEnd, len, v) {
      const t0 = tEnd - len, bp = filt('bandpass', 600, 0.8); bp.connect(strip(v, { verb: 0.2 }));
      bp.frequency.setValueAtTime(600, t0); bp.frequency.exponentialRampToValueAtTime(7000, tEnd);
      const g = D.gain(0); g.connect(bp);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(1, tEnd - 0.01); g.gain.linearRampToValueAtTime(0, tEnd);
      hiss(t0, tEnd + 0.01, g);
    }
    function riser(t0, t1, v) {
      const lp = filt('lowpass', 700, 4); lp.connect(strip(v, { verb: 0.25 }));
      lp.frequency.setValueAtTime(700, t0); lp.frequency.exponentialRampToValueAtTime(6000, t1);
      const g = D.gain(0); g.connect(lp);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(1, t1 - 0.01); g.gain.linearRampToValueAtTime(0, t1);
      for (const d of [-9, 9]) { const o = osc('sawtooth', hz('F3'), t0, t1 + 0.01, g, d); o.frequency.exponentialRampToValueAtTime(hz('F5'), t1); }
      const bp = filt('bandpass', 1000, 1.2), n = D.gain(0.6); bp.connect(n).connect(g);
      bp.frequency.setValueAtTime(1000, t0); bp.frequency.exponentialRampToValueAtTime(8000, t1);
      hiss(t0, t1 + 0.01, bp);
    }
    // the price deflating: noise and a falling saw under a closing lowpass
    function fall(t0, t1, v) {
      const lp = filt('lowpass', 7000, 3); lp.connect(strip(v, { verb: 0.3 }));
      lp.frequency.setValueAtTime(7000, t0); lp.frequency.exponentialRampToValueAtTime(260, t1);
      const g = D.gain(0); g.connect(lp);
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(1, t0 + 0.08); g.gain.setTargetAtTime(0, t1 - 0.15, 0.08);
      hiss(t0, t1 + 0.5, g);
      const s = D.gain(0.3); s.connect(g);
      const o = osc('sawtooth', hz('Ab5'), t0, t1 + 0.4, s); o.frequency.exponentialRampToValueAtTime(hz('Ab2'), t1);
    }
    // the strike: a band-passed slash and a falling zip, panned left to right as the bar draws across
    function slash(t, len, v) {
      const pan = D.ctx.createStereoPanner(); pan.connect(strip(v, { verb: 0.3 }));
      pan.pan.setValueAtTime(-0.8, t); pan.pan.linearRampToValueAtTime(0.8, t + len);
      const bp = filt('bandpass', 9000, 1.6); bp.connect(pan);
      bp.frequency.setValueAtTime(9000, t); bp.frequency.exponentialRampToValueAtTime(900, t + len);
      const g = D.gain(0); g.connect(bp);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + 0.01); g.gain.setValueAtTime(1, t + len * 0.7); g.gain.setTargetAtTime(0, t + len * 0.7, 0.06);
      hiss(t, t + len + 0.5, g);
      const lp = filt('lowpass', 3000); lp.connect(pan);
      const z = osc('sawtooth', 1600, t, t + len + 0.1, env(t, 0.2, 0.005, len / 2, lp)); z.frequency.exponentialRampToValueAtTime(160, t + len);
    }
    // the mascot: a sine gliding up onto the note, then its cyan and magenta glitch layers as a blip left and right
    function boop(t, note, v) {
      const f = hz(note), out = strip(v, { verb: 0.2, delay: 0.2 }), g = D.gain(0); g.connect(out);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + 0.01); g.gain.setTargetAtTime(0, t + 0.08, 0.07);
      const o = osc('sine', f / 2.5, t, t + 0.6, g); o.frequency.exponentialRampToValueAtTime(f, t + 0.08);
      [[0.11, 2, -0.6], [0.15, 3, 0.6]].forEach(([d, k, p]) => osc('square', f * k, t + d, t + d + 0.08, env(t + d, 1, 0.001, 0.012, strip(v * 0.18, { pan: p }))));
    }
    return { tick, swell, riser, fall, slash, boop };
  }

  // ---------- the score ----------
  // A. the letter, 0 to 2.38: F minor and sparse; the tile blips, DEAR / API / USERS on F Ab C (the ad's rise() starts
  // word i at dearIn + 0.4 + i * 0.14)
  function letter(I, T) {
    I.pad(T.dearIn, T.costIn, ['F2', 'C3', 'Ab3', 'Eb4', 'G4'], 0.5, { a: 1.3, r: 0.3, cut: [[T.dearIn, 260], [T.costIn, 1500]] });
    I.kick(T.dearIn, 0.5, 320);
    I.bell(T.dearIn + 0.02, 'C6', 0.2, { tau: 0.22 });
    ['F4', 'Ab4', 'C5'].forEach((n, i) => I.pluck(T.dearIn + 0.44 + i * 0.14, n, 0.28, { pan: (i - 1) * 0.3 }));
    [2, 3, 4].forEach((n) => I.kick(beat(n), 0.4, 240));
    [2.5, 3.5].forEach((n) => I.hat(beat(n), 0.03));
    I.swell(T.costIn, 0.8, 0.16);
  }

  // B. the bill, 2.38 to 5.2: the pulse arrives; a tick a 16th, pitched a semitone per $2,500, climbs with the count;
  // $30,000 lands on a C7(b9) stab and the bass turns to C under a 16th-hat build into the swap
  function bill(I, T, K, price) {
    const top = price(T.countB);
    K(T.costIn, 0.85); I.boom(T.costIn, 'F1', 1.0, 0.45); I.crash(T.costIn, 0.06, 1.2);
    I.pad(T.costIn, T.countB, ['F2', 'C3', 'F3', 'Ab3', 'C4'], 0.42, { a: 0.3, r: 0.05, cut: [[T.costIn, 700], [T.countB, 2600]] });
    I.pad(T.countB, T.swap, ['C3', 'E3', 'Bb3', 'Db4'], 0.36, { a: 0.01, r: 0.06, cut: [[T.countB, 3200], [T.swap, 1100]] });
    for (let n = 5; beat(n) < T.swap - 0.1; n++) {
      if (Math.abs(beat(n) - T.countB) > 0.12) K(beat(n), 0.72);
      if (beat(n) + E8 < T.countB) I.hat(beat(n) + E8, 0.05);
    }
    for (let k = 0, t = beat(5); t < T.swap - 0.05; t = beat(5) + ++k * E8) {
      if (t > T.countB - 0.1 && t < T.countB) continue;
      I.bass(t, (t < T.countB ? 'F' : 'C') + (k % 4 === 2 ? 3 : 2), E8 * 0.8, 0.14 + 0.1 * ramp(t, T.costIn, T.swap));
    }
    for (let n = firstSixteenth(T.countA), t; (t = GRID + n * S16) < T.countB - 0.01; n++) {
      I.tick(t, hz(midi('F5') + Math.round(12 * price(t) / top)), 0.06, n % 2 ? -0.3 : 0.3);
    }
    I.riser(T.countA, T.countB, 0.08);
    K(T.countB, 0.9); I.boom(T.countB, 'C2', 0.6, 0.4);
    I.stab(T.countB, ['C3', 'E3', 'Bb3', 'Db4', 'G4'], 0.3, 0.7, { drive: 2 });
    for (let n = firstSixteenth(T.countB + 0.1), t; (t = GRID + n * S16) < T.swap - 0.02; n++) I.hat(t, 0.02 + 0.07 * ramp(t, T.countB, T.swap));
    I.swell(T.swap, 0.9, 0.24);
  }

  // C. the turn, 5.2 to 6.42: After superbot lands on D-flat; the price falls a tick a 16th to $800 under a sweep, and
  // 97% less chimes A-flat C E-flat
  function turn(I, T, K, price) {
    const top = price(T.countB);
    K(T.swap, 0.95); I.boom(T.swap, 'Db2', 1.1, 0.45); I.crash(T.swap, 0.09, 1.3);
    I.stab(T.swap, ['Db3', 'F3', 'Ab3', 'C4', 'F4'], 0.26, 0.5);
    I.pad(T.swap, beat(13), ['Db3', 'F3', 'Ab3', 'C4', 'Eb4'], 0.5, { a: 0.03, r: 0.15, cut: [[T.swap, 5000], [T.rollB, 1300]] });
    I.bell(T.swap + 0.02, 'Ab5', 0.14, { pan: 0.3 });
    I.fall(T.rollA, T.rollB + 0.05, 0.07);
    for (let n = firstSixteenth(T.rollA), t; (t = GRID + n * S16) < T.rollB + 0.02; n++) {
      I.tick(t, hz(midi('F5') + Math.round(12 * price(t) / top)), 0.06, n % 2 ? -0.3 : 0.3);
    }
    ['Ab5', 'C6', 'Eb6'].forEach((n, i) => I.bell(T.less + i * 0.06, n, 0.13, { pan: (i - 1) * 0.4, tau: 0.35 }));
  }

  // D. the groove, 6.42 to 10.22: four on the floor, claps on 2 and 4, offbeat hats and bass; A-flat, E-flat from One
  // download, F minor, D-flat on the strike. The 8th before the strike drops out; the strike slashes and drops an 808
  function groove(I, T, K) {
    const CH = [
      [beat(13), ['Eb3', 'Ab3', 'C4', 'G4'], 'Ab1'],
      [T.lineIn, ['Eb3', 'G3', 'Bb3', 'F4'], 'Eb2'],
      [beat(17), ['F3', 'Ab3', 'C4', 'G4'], 'F2'],
      [T.strike, ['F3', 'Ab3', 'Db4', 'C5'], 'Db2'],
      [T.endIn],
    ];
    const root = (t) => CH.filter((c) => c[0] <= t + 0.01).pop()[2];
    for (let i = 0; i < 4; i++) I.pad(CH[i][0], CH[i + 1][0], CH[i][1], 0.5, { a: 0.02, r: 0.08, cut: [[CH[i][0], 3600], [CH[i + 1][0], 2200]] });
    const gap = (t) => t > T.strike - E8 - 0.02 && t < T.strike; // the breath before the strike
    I.crash(beat(13), 0.05, 0.9);
    for (let n = 13; n <= 20; n++) {
      const t = beat(n), off = t + E8;
      if (Math.abs(t - T.strike) > 0.05) K(t, 0.9);
      if (n % 2 === 0 && !gap(t)) I.clap(t, 0.32);
      if (!gap(off) && off < T.endIn - 0.05) { I.hat(off, 0.07); I.bass(off, root(off), E8 * 0.85, 0.2); }
      for (const d of [0.25, 0.75]) { const s = t + d * BEAT; if (!gap(s) && s < T.endIn - 0.05) I.hat(s, 0.02); }
    }
    // One download lands on the and of the beat: a syncopated stab, clap and short crash push the line in
    I.crash(T.lineIn, 0.08, 0.8); I.clap(T.lineIn, 0.3); I.boom(T.lineIn, 'Eb2', 0.35, 0.3);
    I.stab(T.lineIn, ['Eb3', 'G3', 'Bb3', 'Eb4', 'G4'], 0.34, 0.3);
    // a pluck a word (the ad's rise() starts word i at lineIn + 0.05 + i * 0.1), One download on the accent
    ['Eb5', 'G4', 'Bb4', 'Eb5', 'G5', 'Bb5'].forEach((n, i) => I.pluck(T.lineIn + 0.07 + i * 0.1, n, i ? 0.13 : 0.24, { pan: ((i % 3) - 1) * 0.35, tau: 0.12 }));
    I.swell(T.strike, 0.45, 0.18);
    K(T.strike, 1); I.boom(T.strike, 'Db2', 0.9, 0.55, true); I.clap(T.strike, 0.45, { verb: 0.45 });
    I.slash(T.strike, 0.3, 0.2); I.stab(T.strike, ['Db3', 'Ab3', 'Db4'], 0.26, 0.35, { drive: 3, floor: 500 }); I.crash(T.strike, 0.08, 1.1);
  }

  // E. superbot.gg, 10.22 on: A-flat major; the opening motif a third up (A-flat C E-flat), the mascot singing the E-flat
  // as it pops (the ad shows it from endIn + 0.3); the groove thins for a bar and a button closes it on 12.18
  function end(I, T, K) {
    K(T.endIn, 1); I.boom(T.endIn, 'Ab1', 2.4, 0.5); I.crash(T.endIn, 0.1, 1.6);
    I.stab(T.endIn, ['Ab3', 'C4', 'Eb4', 'G4'], 0.2, 0.4);
    I.pad(T.endIn, beat(25), ['Eb3', 'Ab3', 'C4', 'Eb4', 'Bb4'], 0.55, { a: 0.02, r: 1.0, cut: [[T.endIn, 5200], [beat(25), 1400]] });
    I.pluck(T.endIn + 0.1, 'Ab4', 0.24, { pan: -0.3 }); I.pluck(T.endIn + 0.22, 'C5', 0.24, { pan: 0.3 });
    I.boop(T.endIn + 0.32, 'Eb5', 0.32);
    ['Ab5', 'C6', 'Eb6', 'G6'].forEach((n, i) => I.bell(beat(22) + i * S16, n, 0.07, { pan: i % 2 ? 0.4 : -0.4, tau: 0.3 }));
    for (let n = 21; n <= 24; n++) {
      const t = beat(n), fade = 1 - (n - 21) * 0.2;
      if (n > 21) { K(t, 0.7 * fade, 2800 - (n - 22) * 800); if (n % 2 === 0) I.clap(t, 0.22 * fade); }
      I.hat(t + E8, 0.05 * fade); I.bass(t + E8, 'Ab1', E8 * 0.85, 0.16 * fade);
    }
    const button = beat(25);
    K(button, 0.8); I.boom(button, 'Ab1', 1.3, 0.42);
    I.pluck(button, 'Ab4', 0.22, { delay: 0.4 }); I.bell(button + 0.005, 'Ab5', 0.12, { tau: 0.6 });
  }

  // the whole cue: peak-normalised to -1 dBFS (-10.4 LUFS), then 3.6 dB down to the gallery's -14 LUFS integrated
  // (ffmpeg ebur128 on the export), with a 0.3 s fade on the very end
  const TRIM = Math.pow(10, -3.6 / 20);
  function render(T, cycle, price) {
    const ctx = new OfflineAudioContext(2, Math.ceil((cycle + TAIL) * SR), SR);
    const D = desk(ctx), I = Object.assign({}, drums(D), synths(D), fx(D)), kicks = [];
    const K = (t, v, muffle) => { I.kick(t, v, muffle); kicks.push(t); };
    letter(I, T); bill(I, T, K, price); turn(I, T, K, price); groove(I, T, K); end(I, T, K);
    for (const t of kicks.sort((a, b) => a - b)) { D.padBus.gain.setTargetAtTime(0.4, t, 0.004); D.padBus.gain.setTargetAtTime(1, t + 0.03, 0.08); }
    return ctx.startRendering().then((buf) => {
      const chans = [0, 1].map((c) => buf.getChannelData(c)), n = buf.length, fade = Math.floor(SR * 0.3);
      let peak = 0;
      for (const d of chans) for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(d[i]));
      const k = peak > 0 ? (0.891 / peak) * TRIM : 1;
      for (const d of chans) for (let i = 0; i < n; i++) d[i] *= k * Math.min(1, (n - i) / fade);
      return buf;
    });
  }

  function wav(buf) {
    const ch = buf.numberOfChannels, n = buf.length, view = new DataView(new ArrayBuffer(44 + n * ch * 2));
    const str = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); view.setUint32(4, 36 + n * ch * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, ch, true); view.setUint32(24, buf.sampleRate, true);
    view.setUint32(28, buf.sampleRate * ch * 2, true); view.setUint16(32, ch * 2, true); view.setUint16(34, 16, true);
    str(36, 'data'); view.setUint32(40, n * ch * 2, true);
    const chans = [...Array(ch)].map((_, c) => buf.getChannelData(c));
    for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < ch; c++, o += 2) view.setInt16(o, Math.max(-1, Math.min(1, chans[c][i])) * 0x7fff, true);
    return new Blob([view], { type: 'audio/wav' });
  }

  // ---------- playback, slaved to the ad's clock ----------
  const ctx = new AC({ latencyHint: 'interactive' });
  const master = ctx.createGain(); master.connect(ctx.destination);
  let buffer = null, src = null, cueAd = 0, cueCtx = 0, muted = false;
  const unlocked = () => ctx.state === 'running';
  const rendered = render(ad.beats, ad.CYCLE, ad.price).then((b) => { buffer = b; return b; });
  rendered.catch((err) => { console.error('soundtrack: render failed', err); btn.hidden = true; throw err; });

  // start the buffer at ad time t, with an 8 ms fade-in so a mid-note cue does not click
  function cue(t) {
    stop();
    const g = ctx.createGain(), s = ctx.createBufferSource(), at = ctx.currentTime + 0.005;
    g.connect(master); s.buffer = buffer; s.connect(g);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(1, at + 0.008);
    s.start(at, Math.min(t + 0.005 + (ctx.outputLatency || ctx.baseLatency || 0), buffer.duration));
    s.onended = () => { if (src && src.s === s) src = null; };
    src = { s, g }; cueAd = t; cueCtx = ctx.currentTime;
  }
  function stop() {
    if (!src) return;
    const { s, g } = src, at = ctx.currentTime;
    g.gain.cancelScheduledValues(at); g.gain.setValueAtTime(g.gain.value, at); g.gain.linearRampToValueAtTime(0, at + 0.015);
    s.onended = null; s.stop(at + 0.02); src = null;
  }
  // every frame: playing and drifted more than 60 ms (a seek, a restart, a resume) re-cues; paused or stepped stops;
  // paused at the end leaves the tail ringing
  function follow() {
    requestAnimationFrame(follow);
    if (!buffer || !unlocked()) return;
    const t = ad.time;
    if (ad.playing && t < ad.CYCLE - 0.02) {
      if (!src || Math.abs(cueAd + (ctx.currentTime - cueCtx) - t) > 0.06) cue(t);
    } else if (!ad.playing && src && t < ad.CYCLE) stop();
  }
  requestAnimationFrame(follow);

  function paint() {
    const state = !unlocked() ? 'locked' : muted ? 'muted' : 'on';
    btn.dataset.state = state;
    btn.setAttribute('aria-label', state === 'locked' ? 'Play with sound' : muted ? 'Unmute' : 'Mute');
  }
  function setMuted(m) { muted = m; master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.012); paint(); }
  // inside a gesture: resume the context; fromTop replays the spot so the cue is heard from its first hit
  function unlock(fromTop) {
    if (unlocked()) return;
    ctx.resume().then(() => { if (fromTop && ad.time > 0.5) ad.play(0); paint(); })
      .catch((err) => { console.error('soundtrack: audio unlock failed', err); throw err; });
  }
  ctx.onstatechange = paint;
  btn.addEventListener('click', (e) => { e.stopPropagation(); if (unlocked()) setMuted(!muted); else unlock(true); });
  // a tap on the stage plays with sound; a tap on the live end card only unlocks (its link opens superbot.gg)
  document.addEventListener('click', (e) => unlock(!e.target.closest('.end.live')));
  addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') { if (unlocked()) setMuted(!muted); else { muted = false; unlock(false); } }
    else unlock(false);
  });
  // the gallery lightbox forwards its own clicks and keys as { type: 'unmute' } (its iframe allows autoplay); the spot
  // replays only if it has already ended
  addEventListener('message', (e) => { if (e.data && e.data.type === 'unmute') unlock(ad.time >= ad.CYCLE - 0.02); });
  paint();

  // QA and offline renders: the cue as a buffer or a 16-bit WAV, and where playback stands
  ad.soundtrack = {
    rendered,
    wav: () => rendered.then(wav),
    get state() { return { context: ctx.state, muted, cued: !!src, at: src ? cueAd + (ctx.currentTime - cueCtx) : null }; },
  };
})();
