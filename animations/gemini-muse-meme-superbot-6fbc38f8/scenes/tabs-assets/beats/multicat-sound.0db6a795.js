// The multicat variant's sound (beats/multicat.516afb1a.js): a tight, tempo-locked bed under the chain and crisp effects on
// each of its beats, synthesized live with Web Audio from oscillators and one noise buffer (no samples, nothing cartoony:
// short envelopes, fast attacks, no pitch slides). The score is a pure function of the beat's times: every note and effect
// is an event at a clock time, laid out once by score(). The bed runs at the tempo that puts exactly ten bars between the
// first send and the song's play press, so it drops on the send and hands the song a downbeat; it sits in the song's key
// (B major, measured from tiny-chaos.mp3) and stops on the song card's landing, one beat before the song. A look-ahead
// scheduler plays the events the spot's clock is about to cross while it runs, at its speed, and drops what it has not
// started on a pause, seek, speed change or variant change. The context starts on the first gesture (the browser's
// autoplay rule); from then on the ElevenLabs song joins the same master, so the Sound pill (and M) mutes all of it, and
// one limiter guards the sum. window.__MCSOUND exposes the score and renders the whole mix offline, for QA.
// On the Music pill it is pick 'v10' (music.47e5d94a.js): it starts, sounds and shows its pill only while the variant is
// multicat and v10 is the pick; there the beat hands it no song element, so the song keeps its own output and the pill's
// mute reaches it through the beat (`muted`).
import { variant } from '../../../variant.9e82faf1.js?v=3';
import { music } from '../../../music.47e5d94a.js?v=2';

const CSS = new URL('../multicat-sound.0db6a795.css', import.meta.url).href;
const ID = 'multicat', PICK = 'v10';
const on = () => variant() === ID && music() === PICK;
const BEATS_TO_SONG = 40; // ten bars of 4/4 from the first send to the song's play press (119.25 bpm on this chain)
const LOOK = 0.1;         // seconds of real time scheduled ahead of the clock
// how late (clock s, at 1x) an event may still play after a stalled frame: a one-off hit that marks something on screen
// plays a little late rather than not at all; the bed's notes and the keys drop, so a stall never bursts a backlog
const LATE = { send: 0.15, chip: 0.15, check: 0.15, card: 0.15, land: 0.15, press: 0.15, sting: 0.25, air: 0.25 };
const LATE_BED = 0.04;
const STORE = 'multicat-sound';
// bus levels: the bed sits under the effects and a few LU under the song, so the song lands as a lift; the song (already
// mastered, -14 LUFS, -1.6 dBTP) passes at unity
const MIX = { music: 0.4, sfx: 0.8, verb: 0.28, song: 1, master: 0.9 };

// the bed's chords, one per bar from the intro (bar 0) to the bar the song card lands in (10); a pair splits its bar at
// beat 3. `root` is the bass note, `stab` the chord's voicing (MIDI), all in B major
const B = { root: 35, stab: [59, 63, 66, 73] };    // B add9
const GSM = { root: 32, stab: [56, 63, 66, 71] };  // G#m7
const E = { root: 40, stab: [59, 63, 66, 68] };    // Emaj9 over its bass
const FSUS = { root: 42, stab: [59, 61, 66, 71] }; // F#sus4
const FS = { root: 42, stab: [58, 61, 66, 70] };   // F#
const BARS = [B, B, GSM, E, [FSUS, FS], B, GSM, E, [FSUS, FS], E, [FSUS, FS]];
const PING = [90, 95];                  // a chip's check, F#6 then B6: tones of every chord in the bed
const STING = [47, 54, 59, 61, 66, 71]; // the end card's B5 add9: no third, so it sits on the song's fading tail

const hz = (m) => 440 * 2 ** ((m - 69) / 12);
// a seeded generator (mulberry32), so the score and the noise are the same on every load
const prng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};
// the chord sounding at beat b (beat 0 is the first send)
function chordAt(b) {
  const bar = Math.min(BARS.length - 1, Math.max(0, Math.floor(b / 4) + 1)), c = BARS[bar];
  return Array.isArray(c) ? c[b - (bar - 1) * 4 < 2 ? 0 : 1] : c;
}

// ---------- the score ----------
// every event of the spot, { t (clock s), v (voice), ...its params }, sorted by t
function score(k, T, o) {
  const t0 = k.send, P = (o.songAt - t0) / BEATS_TO_SONG;
  const ev = [];
  const add = (t, v, p) => ev.push({ t, v, ...p });
  // the generations' fast-forward windows: there the effects' 32nd ticks take over from the bed's hats
  const gens = [[T.gen0, T.done], ...T.steps.filter((st) => st.gen).map((st) => [st.gen0, st.done])];
  bed(add, (b) => t0 + b * P, P, (t) => gens.some(([a, b]) => t >= a - 0.02 && t < b));
  effects(add, k, T, o, t0, P);
  ev.sort((a, b) => a.t - b.t);
  return { ev, t0, P };
}

// the bed: an intro bar under the greeting and the first ask, the drop on the first send, then four-bar phrases (kick on
// 1 and 3, claps on 2 and 4, offbeat bass, dotted stabs, hats opening to 16ths, a pluck arp while the model builds and
// walks); the last bar thins to hats and a 16th bass pulse into the song card's landing, where the bed stops. The hats
// rest while `ff(t)`, a generation's fast-forward, has the ticks
function bed(add, at, P, ff) {
  add(0.15, 'pad', { notes: [59, 61, 66, 71], len: at(0) - 0.15, hold: true });
  for (let b = -2; b < 0; b += 0.5) add(at(b), 'pluck', { n: 71, vel: 0.35 + 0.15 * (b + 2), pan: 0 });
  add(at(0), 'cymbal', { vel: 0.7 });
  for (let bar = 1; bar <= 10; bar++) {
    const b0 = (bar - 1) * 4, last = bar === 10;
    for (let i = 0; i < (last ? 12 : 16); i++) {
      const q = i % 4;
      if (ff(at(b0 + i / 4))) continue;
      if (bar <= 2) { if (q === 2) add(at(b0 + i / 4), 'hat', { vel: 0.8 }); }
      else add(at(b0 + i / 4), 'hat', { vel: last ? 0.3 + 0.7 * (i / 11) : [0.32, 0.5, 0.9, 0.5][q] });
    }
    if (bar === 5 || bar === 6) {
      const seq = [0, 1, 2, 3, 2, 1];
      for (let i = 0; i < 16; i++) add(at(b0 + i / 4), 'pluck', { n: chordAt(b0 + i / 4).stab[seq[i % 6]] + 12, vel: 0.45, pan: i % 2 ? 0.3 : -0.3 });
    }
    add(at(b0), 'kick');
    if (last) {
      add(at(b0), 'stab', { notes: chordAt(b0).stab, vel: 1 });
      for (const off of [0.5, 1.5]) add(at(b0 + off), 'bass', { n: chordAt(b0 + off).root, len: P * 0.42 });
      for (let i = 8; i < 12; i++) add(at(b0 + i / 4), 'bass', { n: chordAt(b0 + i / 4).root, len: P * 0.18, vel: 0.5 + 0.5 * ((i - 8) / 3) });
      continue;
    }
    add(at(b0 + 2), 'kick');
    add(at(b0 + 1), 'clap', { vel: 0.75 });
    add(at(b0 + 3), 'clap', { vel: 0.75 });
    for (const off of [0.5, 1.5, 2.5, 3.5]) add(at(b0 + off), 'bass', { n: chordAt(b0 + off).root + (off === 3.5 ? 12 : 0), len: P * 0.42 });
    for (const [off, vel] of [[0, 1], [1.5, 0.75], [3, 0.6]]) add(at(b0 + off), 'stab', { notes: chordAt(b0 + off).stab, vel });
  }
  add(at(39), 'kick');
  add(at(39), 'cymbal', { vel: 1 });
}

// the effects, on the chain's own times: a key per typed character, the send, each routing chip landing and checking,
// each card rising in, a fast-forward tick (32nds of the bed) with a level-only hiss while a generation runs, a hit as
// each answer lands, the play button's click, and the end card's sting
function effects(add, k, T, o, t0, P) {
  const rnd = prng(0x0db6a795);
  const asks = [{ text: o.ask, s: k.s, typeEnd: k.typeEnd, send: k.send, chips: k.chips }, ...T.steps.map((st) => ({ text: st.ask, s: st.s, typeEnd: st.typeEnd, send: st.send, chips: st.chips }))];
  for (const a of asks) {
    // character i shows once round(len * progress) reaches it (chat.9b47fc30.js renderComposer)
    for (let i = 1; i <= a.text.length; i++) {
      add(a.s + ((i - 0.5) / a.text.length) * (a.typeEnd - a.s), 'key', { space: a.text[i - 1] === ' ', f: 2600 + 1800 * rnd(), pan: (rnd() - 0.5) * 0.24, vel: 0.75 + 0.25 * rnd(), off: rnd() });
    }
    add(a.send, 'send');
    a.chips.forEach((c, i) => { add(c.sw + 0.05, 'chip'); add(c.done, 'check', { n: PING[Math.min(i, PING.length - 1)] }); });
  }
  const answers = [{ card: T.card, gen0: T.gen0, done: T.done, gen: true }, ...T.steps.map((st) => ({ card: st.card, gen0: st.gen0, done: st.done, gen: !!st.gen }))];
  const step = P / 8;
  for (const a of answers) {
    add(a.card, 'card');
    if (a.gen) {
      for (let n = Math.ceil((a.gen0 - t0) / step); t0 + n * step < a.done - 0.02; n++) {
        add(t0 + n * step, 'tick', { vel: 0.35 + 0.65 * ((t0 + n * step - a.gen0) / (a.done - a.gen0)), pan: n % 2 ? 0.22 : -0.22 });
      }
      add(a.gen0, 'hiss', { len: a.done - a.gen0 });
    }
    const c = chordAt((a.done - t0) / P);
    add(a.done, 'land', { notes: [...c.stab, c.stab[c.stab.length - 1] + 12] });
  }
  add(o.songAt - 0.03, 'press');
  add(o.songAt + 0.08, 'press', { vel: 0.45 });
  add(o.endPop + 0.02, 'sting');
  add(o.endPop + 0.3, 'air');
}

// ---------- the voices ----------
// the building blocks every voice draws on, bound to one context and its outputs; `keep` records each source's start, so
// a stopped run can silence the ones still to come
function kit(ac, G, out, keep) {
  const gain = (v) => { const g = ac.createGain(); g.gain.value = v; return g; };
  const filter = (type, f, Q = 0.707) => { const n = ac.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = Q; return n; };
  const pan = (p) => { const n = ac.createStereoPanner(); n.pan.value = p; return n; };
  // a start is never before the context's zero (a fresh context's first note, started a fraction of a period early)
  const begin = (src, at, end, offset = 0) => { const from = Math.max(0, at); src.start(from, offset); src.stop(Math.max(from, end)); keep(src, from); return src; };
  return {
    out, gain, filter, pan,
    // nodes wired in order; returns the last
    wire: (...ns) => { for (let i = 1; i < ns.length; i++) ns[i - 1].connect(ns[i]); return ns[ns.length - 1]; },
    // `phase` (0..1) starts it that fraction of a period early, behind its shut envelope, so a stacked chord's saws do not
    // all begin in phase and spike together
    osc: (type, f, at, end, detune = 0, phase = 0) => { const n = ac.createOscillator(); n.type = type; n.frequency.value = f; n.detune.value = detune; return begin(n, at - phase / f, end); },
    noise: (at, end, off = 0) => { const n = ac.createBufferSource(); n.buffer = G.noise; n.loop = true; return begin(n, at, end, off * (G.noise.duration - 0.05)); },
    // a percussive gain: opens to `peak` over `a`, then decays to silence (-43 dB) over `d`
    perc: (at, peak, a, d) => { const g = ac.createGain(), p = g.gain; p.value = 0; p.setValueAtTime(0, at); p.linearRampToValueAtTime(peak, at + a); p.setTargetAtTime(0, at + a, d / 5); return g; },
    // a held gain: opens over `a`, holds for `len`, releases over `r`
    hold: (at, peak, a, len, r) => { const g = ac.createGain(), p = g.gain; p.value = 0; p.setValueAtTime(0, at); p.linearRampToValueAtTime(peak, at + a); p.setValueAtTime(peak, at + a + len); p.setTargetAtTime(0, at + a + len, r / 4); return g; },
    verb: (n, amount) => { n.connect(gain(amount)).connect(out.verb); },
    shaper: () => { const n = ac.createWaveShaper(); n.curve = G.curve; return n; },
  };
}

// a voice: (kit, event, start time in the context, clock rate); lengths given in clock seconds are divided by the rate
const VOICES = {
  kick(k, e, at) {
    const v = e.vel ?? 1, o = k.osc('sine', 150, at, at + 0.42);
    o.frequency.setValueAtTime(150, at);
    o.frequency.exponentialRampToValueAtTime(50, at + 0.045);
    k.wire(o, k.perc(at, 0.74 * v, 0.0015, 0.24), k.out.music);
    k.wire(k.noise(at, at + 0.02, 0.1), k.filter('highpass', 3200), k.perc(at, 0.16 * v, 0.0004, 0.01), k.out.music);
  },
  clap(k, e, at) {
    const v = e.vel ?? 1, g = k.gain(0), p = g.gain;
    p.setValueAtTime(0, at);
    for (const d of [0, 0.01, 0.02]) { p.setValueAtTime(2.2 * v, at + d); p.setTargetAtTime(0, at + d, 0.0025); }
    p.setValueAtTime(1.8 * v, at + 0.03);
    p.setTargetAtTime(0, at + 0.03, 0.03);
    const out = k.wire(k.noise(at, at + 0.25, 0.37), k.filter('bandpass', 1450, 1.1), k.filter('highpass', 650), g);
    out.connect(k.out.music);
    k.verb(out, 0.3);
  },
  hat(k, e, at) {
    k.wire(k.noise(at, at + 0.06, 0.6), k.filter('highpass', 7200), k.perc(at, 1 * (e.vel ?? 1), 0.0006, 0.045), k.pan(0.16), k.out.music);
  },
  cymbal(k, e, at) {
    const out = k.wire(k.noise(at, at + 1, 0.8), k.filter('highpass', 5200), k.filter('lowpass', 13000), k.perc(at, 0.15 * (e.vel ?? 1), 0.001, 0.75));
    out.connect(k.out.music);
    k.verb(out, 0.3);
  },
  bass(k, e, at, r) {
    const v = e.vel ?? 1, len = e.len / r, end = at + len + 0.1, f = hz(e.n), sum = k.gain(1);
    k.osc('sine', f, at, end).connect(sum);
    k.wire(k.osc('triangle', 2 * f, at, end), k.gain(0.6), sum);
    k.wire(sum, k.shaper(), k.filter('highpass', 38), k.filter('lowpass', 900), k.hold(at, 0.15 * v, 0.004, len, 0.035), k.out.music);
  },
  stab(k, e, at) {
    const lp = k.filter('lowpass', 4200, 1.1);
    lp.frequency.setValueAtTime(4200, at);
    lp.frequency.setTargetAtTime(1500, at, 0.07);
    const out = k.wire(lp, k.filter('highpass', 240), k.perc(at, 0.42 * (e.vel ?? 1), 0.002, 0.2));
    e.notes.forEach((n, i) => [-7, 7].forEach((dt, j) => k.wire(k.osc('sawtooth', hz(n), at, at + 0.26, dt, (i * 0.29 + j * 0.5) % 1), k.pan(i % 2 ? 0.22 : -0.22), lp)));
    out.connect(k.out.music);
    k.verb(out, 0.25);
  },
  pluck(k, e, at) {
    const f = hz(e.n), env = k.perc(at, 0.32 * (e.vel ?? 1), 0.0015, 0.15);
    k.osc('sine', f, at, at + 0.2).connect(env);
    k.wire(k.osc('triangle', 2 * f, at, at + 0.2), k.gain(0.18), env);
    const out = k.wire(env, k.filter('highpass', 420), k.pan(e.pan || 0));
    out.connect(k.out.music);
    k.verb(out, 0.35);
  },
  pad(k, e, at, r) {
    const len = e.len / r, a = e.a ?? 0.4, end = at + Math.max(len, a) + 0.8, lp = k.filter('lowpass', 1100, 0.5);
    const out = k.wire(lp, k.filter('highpass', 200), k.hold(at, 0.05, a, Math.max(0, len - a), 0.5));
    e.notes.forEach((n, i) => [-6, 6].forEach((dt, j) => k.wire(k.osc('sawtooth', hz(n), at, end, dt, (i * 0.29 + j * 0.5) % 1), k.pan(dt < 0 ? -0.3 : 0.3), lp)));
    out.connect(k.out.music);
    k.verb(out, 0.5);
  },
  key(k, e, at) {
    const v = e.vel ?? 1;
    k.wire(k.noise(at, at + 0.025, e.off), k.filter('bandpass', e.f, 1.4), k.perc(at, 0.75 * v, 0.0004, 0.012), k.pan(e.pan), k.out.sfx);
    k.wire(k.osc('sine', e.space ? 150 : 240, at, at + 0.035), k.perc(at, 0.09 * v, 0.001, 0.02), k.out.sfx);
  },
  send(k, e, at) {
    k.wire(k.noise(at, at + 0.02, 0.21), k.filter('highpass', 3500), k.perc(at, 0.36, 0.0004, 0.008), k.out.sfx);
    k.wire(k.osc('sine', 170, at, at + 0.09), k.perc(at, 0.2, 0.001, 0.06), k.out.sfx);
    const tone = k.perc(at, 0.1, 0.002, 0.14);
    for (const n of [83, 90]) k.osc('sine', hz(n), at, at + 0.18).connect(tone);
    tone.connect(k.out.sfx);
    k.verb(tone, 0.3);
    k.wire(k.noise(at, at + 0.15, 0.55), k.filter('bandpass', 1700, 0.9), k.perc(at, 0.14, 0.012, 0.09), k.out.sfx);
  },
  chip(k, e, at) {
    k.wire(k.noise(at, at + 0.015, 0.73), k.filter('highpass', 5000), k.perc(at, 0.15, 0.0003, 0.005), k.pan(0.1), k.out.sfx);
    k.wire(k.osc('sine', hz(100), at, at + 0.05), k.perc(at, 0.05, 0.001, 0.03), k.pan(0.1), k.out.sfx);
  },
  check(k, e, at) {
    const f = hz(e.n), out = k.gain(1);
    k.wire(k.osc('sine', f, at, at + 0.3), k.perc(at, 0.22, 0.0015, 0.24), out);
    k.wire(k.osc('sine', 2 * f, at, at + 0.12), k.perc(at, 0.045, 0.001, 0.08), out);
    k.wire(k.noise(at, at + 0.01, 0.31), k.filter('highpass', 6000), k.perc(at, 0.09, 0.0003, 0.004), out);
    out.connect(k.out.sfx);
    k.verb(out, 0.3);
  },
  card(k, e, at) {
    const out = k.wire(k.noise(at, at + 0.3, 0.44), k.filter('bandpass', 1100, 0.6), k.filter('lowpass', 3200), k.perc(at, 0.13, 0.05, 0.14));
    out.connect(k.out.sfx);
    k.verb(out, 0.2);
  },
  tick(k, e, at) {
    k.wire(k.noise(at, at + 0.012, e.pan > 0 ? 0.12 : 0.62), k.filter('bandpass', 4800, 1.6), k.perc(at, 0.8 * (e.vel ?? 1), 0.0003, 0.006), k.pan(e.pan), k.out.sfx);
  },
  hiss(k, e, at, r) {
    const len = e.len / r, g = k.gain(0), p = g.gain;
    p.setValueAtTime(0, at);
    p.linearRampToValueAtTime(0.07, at + len);
    p.linearRampToValueAtTime(0, at + len + 0.03);
    k.wire(k.noise(at, at + len + 0.05, 0.9), k.filter('bandpass', 2600, 0.5), g, k.out.sfx);
  },
  land(k, e, at) {
    k.wire(k.noise(at, at + 0.02, 0.05), k.filter('highpass', 2500), k.perc(at, 0.42, 0.0004, 0.008), k.out.sfx);
    const o = k.osc('sine', 95, at, at + 0.25);
    o.frequency.setValueAtTime(95, at);
    o.frequency.exponentialRampToValueAtTime(58, at + 0.04);
    k.wire(o, k.perc(at, 0.3, 0.0015, 0.17), k.out.sfx);
    const lp = k.filter('lowpass', 6000, 0.9);
    lp.frequency.setValueAtTime(6000, at);
    lp.frequency.setTargetAtTime(1300, at, 0.09);
    const chord = k.wire(lp, k.filter('highpass', 200), k.perc(at, 0.14, 0.002, 0.45));
    e.notes.forEach((n, i) => [-8, 8].forEach((dt, j) => k.wire(k.osc('sawtooth', hz(n), at, at + 0.5, dt, (i * 0.29 + j * 0.5) % 1), k.pan((i / (e.notes.length - 1) - 0.5) * 0.6), lp)));
    chord.connect(k.out.sfx);
    k.verb(chord, 0.35);
    const air = k.wire(k.noise(at, at + 0.35, 0.67), k.filter('highpass', 7500), k.perc(at, 0.2, 0.002, 0.28));
    air.connect(k.out.sfx);
    k.verb(air, 0.4);
  },
  press(k, e, at) {
    const v = e.vel ?? 1;
    k.wire(k.noise(at, at + 0.02, 0.27), k.filter('bandpass', 3200, 2.2), k.perc(at, 0.42 * v, 0.0003, 0.008), k.out.sfx);
    k.wire(k.osc('sine', 1500, at, at + 0.03), k.perc(at, 0.06 * v, 0.0005, 0.012), k.out.sfx);
  },
  sting(k, e, at) {
    const sub = k.perc(at, 0.42, 0.004, 1.1);
    k.osc('sine', hz(35), at, at + 1.3).connect(sub);
    k.wire(k.osc('sine', hz(47), at, at + 1.3), k.gain(0.35), sub);
    sub.connect(k.out.sfx);
    k.wire(k.noise(at, at + 0.03, 0.15), k.filter('highpass', 2000), k.perc(at, 0.42, 0.0004, 0.012), k.out.sfx);
    const lp = k.filter('lowpass', 5200, 0.8);
    lp.frequency.setValueAtTime(5200, at);
    lp.frequency.setTargetAtTime(1500, at, 0.25);
    const chord = k.wire(lp, k.filter('highpass', 110), k.perc(at, 0.065, 0.004, 2));
    STING.forEach((n, i) => [-6, 6].forEach((dt, j) => k.wire(k.osc('sawtooth', hz(n), at, at + 2.1, dt, (i * 0.29 + j * 0.5) % 1), k.pan((i / (STING.length - 1) - 0.5) * 0.8), lp)));
    chord.connect(k.out.sfx);
    k.verb(chord, 0.45);
    const bell = k.gain(1);
    k.wire(k.osc('sine', hz(95), at, at + 1.6), k.perc(at, 0.1, 0.002, 1.5), bell);
    k.wire(k.osc('sine', hz(102), at, at + 1), k.perc(at, 0.045, 0.002, 0.9), bell);
    bell.connect(k.out.sfx);
    k.verb(bell, 0.5);
  },
  air(k, e, at) {
    const g = k.gain(0), p = g.gain;
    p.setValueAtTime(0, at);
    p.linearRampToValueAtTime(0.07, at + 0.25);
    p.setTargetAtTime(0, at + 0.25, 0.12);
    const out = k.wire(k.noise(at, at + 1, 0.48), k.filter('highpass', 6500), g);
    out.connect(k.out.sfx);
    k.verb(out, 0.6);
  },
};

// ---------- the mix ----------
function noiseBuffer(ac) {
  const buf = ac.createBuffer(1, 2 * ac.sampleRate, ac.sampleRate), d = buf.getChannelData(0), r = prng(0x9e82);
  for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1;
  return buf;
}
// a small, bright room: 1.2 s of decaying stereo noise
function impulse(ac) {
  const len = Math.round(1.2 * ac.sampleRate), buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c), r = prng(0x51ab + c);
    for (let i = 0; i < len; i++) { const t = i / ac.sampleRate; d[i] = (r() * 2 - 1) * Math.exp(-t / 0.2) * Math.min(1, t / 0.004); }
  }
  return buf;
}
// the bass's gentle saturation
function softClip() {
  const c = new Float32Array(1024);
  for (let i = 0; i < c.length; i++) { const x = (i / (c.length - 1)) * 2 - 1; c[i] = Math.tanh(1.6 * x) / Math.tanh(1.6); }
  return c;
}
// buses into one master: the bed (through a gentle glue compressor that holds its downbeats, a kick under a stacked stab,
// together), the effects, a reverb return (high- and low-cut, so it adds air, not mud) and the song, through a 28 Hz
// high-pass and a hard-knee limiter at -1 dBFS, then the master gain the Sound pill mutes
function graph(ac) {
  const gain = (v) => { const g = ac.createGain(); g.gain.value = v; return g; };
  const filter = (type, f) => { const n = ac.createBiquadFilter(); n.type = type; n.frequency.value = f; return n; };
  const G = { music: gain(MIX.music), sfx: gain(MIX.sfx), verb: gain(1), song: gain(MIX.song), master: gain(MIX.master), noise: noiseBuffer(ac), curve: softClip() };
  const mix = gain(1), conv = ac.createConvolver();
  conv.buffer = impulse(ac);
  G.verb.connect(filter('highpass', 280)).connect(filter('lowpass', 6500)).connect(conv).connect(gain(MIX.verb)).connect(mix);
  const glue = ac.createDynamicsCompressor();
  glue.threshold.value = -14; glue.knee.value = 6; glue.ratio.value = 3; glue.attack.value = 0.004; glue.release.value = 0.14;
  G.music.connect(glue).connect(mix);
  for (const bus of [G.sfx, G.song]) bus.connect(mix);
  const lim = ac.createDynamicsCompressor();
  lim.threshold.value = -1; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.08;
  mix.connect(filter('highpass', 28)).connect(lim).connect(G.master).connect(ac.destination);
  return G;
}

// the whole spot's audio, rendered offline at 1x with the song faded as the beat fades it: for QA (peaks, loudness, sync).
// `only`, a list of voice names, renders just those (a stem) and leaves the song out
async function renderOffline(events, o, sampleRate = 48000, only = null) {
  const end = Math.max(events[events.length - 1].t, o.songFadeEnd) + 2.5;
  const ac = new OfflineAudioContext(2, Math.ceil(end * sampleRate), sampleRate), G = graph(ac);
  const k = kit(ac, G, { music: G.music, sfx: G.sfx, verb: G.verb }, () => {});
  for (const e of events) if (!only || only.includes(e.v)) VOICES[e.v](k, e, e.t, 1);
  if (o.songSrc && !only) {
    const src = ac.createBufferSource(), g = ac.createGain();
    src.buffer = await ac.decodeAudioData(await (await fetch(o.songSrc)).arrayBuffer());
    g.gain.setValueAtTime(1, o.songFadeAt);
    g.gain.linearRampToValueAtTime(0, o.songFadeEnd);
    src.connect(g).connect(G.song);
    src.start(o.songAt);
    src.stop(o.songFadeEnd + 0.05);
  }
  return ac.startRendering();
}

// ---------- the Sound pill ----------
const SPEAKER = '<path d="M11 5 6 9H3v6h3l5 4z"/>';
const ICON = {
  on: `<svg viewBox="0 0 24 24" aria-hidden="true">${SPEAKER}<path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>`,
  off: `<svg viewBox="0 0 24 24" aria-hidden="true">${SPEAKER}<path d="m16 9 5 6M21 9l-5 6"/></svg>`,
};
const LABEL = { on: 'On', off: 'Off', locked: 'Turn on' };
let sheet = null;
function makePill(onPress) {
  if (!sheet) {
    sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = CSS;
    sheet.onerror = () => console.error(new Error(`multicat sound pill stylesheet failed to load: ${CSS}`));
    document.head.appendChild(sheet);
  }
  const bar = document.createElement('div');
  bar.className = 'sound-select';
  bar.innerHTML = '<span class="vs-label" aria-hidden="true">Sound</span><button type="button" aria-keyshortcuts="M"></button>';
  document.body.appendChild(bar);
  const btn = bar.querySelector('button');
  btn.addEventListener('click', (e) => { onPress(); if (e.detail > 0) btn.blur(); });
  // Space and Enter press the pill, not the spot's clock (timeline.9b47fc30.js)
  btn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });
  let shown = '';
  return {
    show(on, state) {
      bar.hidden = !on;
      if (state === shown) return;
      btn.innerHTML = (state === 'on' ? ICON.on : ICON.off) + LABEL[state];
      btn.setAttribute('aria-pressed', String(state === 'on'));
      btn.title = state === 'locked' ? 'Turn sound on (M)' : state === 'on' ? 'Mute (M)' : 'Unmute (M)';
      shown = state;
    },
  };
}

// ---------- the live engine ----------
// k: the chain's first ask (s, typeEnd, send, chips); T: the multicat beat's plan; o: { ask, song (its <audio>), songSrc,
// songAt, songFadeAt, songFadeEnd, endPop }. Returns { render(t) }, called every frame the multicat route draws.
export function makeSound(k, T, o) {
  const { ev: events, t0, P } = score(k, T, o);
  let ac = null, G = null, songNode = null, run = null, idx = 0, lastT = null, failed = null;
  let muted = localStorage.getItem(STORE) === 'off';
  if (o.song) o.song.muted = muted;
  const state = () => (muted ? 'off' : ac && ac.state === 'running' ? 'on' : 'locked');
  const pill = makePill(() => (state() === 'locked' ? start() : setMuted(!muted)));

  function sync() {
    // the song joins the master once the context runs; until then the <audio> plays on its own
    if (ac && ac.state === 'running' && o.song && !songNode) { songNode = ac.createMediaElementSource(o.song); songNode.connect(G.song); }
    pill.show(on(), state());
  }
  function start() {
    if (!ac) {
      ac = new AudioContext({ latencyHint: 'interactive' });
      G = graph(ac);
      G.master.gain.value = muted ? 0 : MIX.master;
      ac.addEventListener('statechange', sync);
    }
    if (ac.state !== 'running') ac.resume().then(sync, (e) => console.error(new Error('multicat sound: the audio context would not start', { cause: e })));
    sync();
  }
  function setMuted(m) {
    muted = m;
    localStorage.setItem(STORE, m ? 'off' : 'on');
    if (o.song) o.song.muted = m;
    if (m && run) stop(true);
    if (G) G.master.gain.setTargetAtTime(m ? 0 : MIX.master, ac.currentTime, 0.015);
    if (!m) start();
    sync();
  }

  // a run: one stretch of uninterrupted playback, anchored at clock t = context time c, at one rate
  function begin(t, now, rate) {
    const lat = Math.min(0.3, Math.max(0, (ac.outputLatency || 0) + (ac.baseLatency || 0) - 0.016));
    const out = { music: ac.createGain(), sfx: ac.createGain(), verb: ac.createGain() };
    for (const key of Object.keys(out)) out[key].connect(G[key]);
    const r = { t, c: now - lat, lat, rate, out, pending: [] };
    r.kit = kit(ac, G, out, (src, at) => r.pending.push([src, at]));
    run = r;
    idx = events.findIndex((e) => e.t >= t - 1e-6);
    if (idx < 0) idx = events.length;
    // a held note already sounding at t (the intro pad) comes back in from here
    for (const e of events) if (e.hold && e.t < t && t < e.t + e.len) fire({ ...e, len: e.t + e.len - t, a: 0.08 }, now, rate);
  }
  // end the run: what has not started is silenced, what sounds rings out (or, `hard`, fades out in ~30 ms)
  function stop(hard) {
    const r = run, now = ac.currentTime;
    run = null;
    for (const [src, at] of r.pending) if (at > now) src.disconnect();
    if (hard) for (const g of Object.values(r.out)) g.gain.setTargetAtTime(0, now, 0.01);
    setTimeout(() => { for (const g of Object.values(r.out)) g.disconnect(); }, hard ? 200 : 3000);
  }
  function fire(e, when, rate) {
    const at = Math.max(when, ac.currentTime);
    VOICES[e.v](run.kit, e, at, rate);
    const qa = window.__MCSOUND;
    if (qa && qa.logging) qa.log.push({ v: e.v, t: e.t, at, now: ac.currentTime, clock: lastT });
  }

  const leave = () => { if (run) stop(true); sync(); };
  addEventListener('variantchange', leave);
  addEventListener('musicchange', leave);
  // the first gesture starts the context (the autoplay rule); a press on the pill itself goes through the pill
  const unlock = (e) => { if (on() && !muted && !(e.target.closest && e.target.closest('.sound-select'))) start(); };
  for (const type of ['pointerdown', 'keydown']) addEventListener(type, unlock, true);
  addEventListener('keydown', (e) => {
    if ((e.key !== 'm' && e.key !== 'M') || !on() || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target && e.target.tagName)) return;
    if (state() !== 'locked') setMuted(!muted);
  });
  sync();

  window.__MCSOUND = {
    events, t0, bpm: 60 / P, log: [], logging: false,
    get state() { return { sound: state(), ctx: ac ? ac.state : 'none', running: !!run, song: !!songNode, failed: failed && String(failed.cause) }; },
    get ctxTime() { return ac ? ac.currentTime : null; },
    get latency() { return run ? run.lat : null; },
    offline: (sampleRate, only) => renderOffline(events, o, sampleRate, only),
  };

  // one frame of the scheduler
  function tick(t) {
    // a gesture earlier in the page's life (the variant pick) already allows sound
    if (!ac && !muted && on() && navigator.userActivation && navigator.userActivation.hasBeenActive) start();
    const ad = window.__AD;
    const running = !!ac && ac.state === 'running' && !muted && !!(ad && ad.playing) && !document.body.classList.contains('freeze') && on();
    if (!running) { if (run) stop(false); lastT = t; return; }
    const now = ac.currentTime, rate = ad.speed || 1;
    // a seek, a speed change or the clock drifting from the context's: start a new run from here
    if (run && (rate !== run.rate || t < lastT - 1e-6 || Math.abs(run.t + (now - run.c - run.lat) * run.rate - t) > 0.05 * rate + 0.03)) stop(false);
    if (!run) begin(t, now, rate);
    lastT = t;
    const horizon = t + (LOOK + run.lat) * rate;
    while (idx < events.length && events[idx].t < horizon) {
      const e = events[idx++];
      if (e.t >= t - (LATE[e.v] ?? LATE_BED) * rate) fire(e, run.c + (e.t - run.t) / run.rate, rate);
    }
    if (run.pending.length > 600) run.pending = run.pending.filter(([, at]) => at > now - 0.1);
  }

  (window.__PICKS ||= {})[PICK] = { ready: () => true, sounding: () => !!run && !!ac && ac.state === 'running' && !muted };
  return {
    get muted() { return muted; },
    // the sound runs inside the spot's frame loop (timeline.9b47fc30.js), where an exception would stop the picture too:
    // a failure is logged with its cause, the sound goes quiet, and the spot plays on without it
    render(t) {
      if (failed) return;
      try {
        tick(t);
      } catch (e) {
        failed = new Error('multicat sound failed: the spot plays on without its bed and effects', { cause: e });
        console.error(failed);
        if (G) G.master.gain.setTargetAtTime(0, ac.currentTime, 0.01);
      }
    },
  };
}
