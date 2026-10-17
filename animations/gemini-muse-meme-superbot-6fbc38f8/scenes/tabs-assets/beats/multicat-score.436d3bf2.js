// The multicat variant's score (beats/multicat.516afb1a.js): one clean B major bed under the four asks, a hit on every
// answer landing, the ElevenLabs song handed in on its play press and a resolve on the end card. It is rendered once, in
// the browser (OfflineAudioContext), from the beat's own plan, so every hit sits on the frame it scores by construction,
// then plays as one buffer kept in step with the spot's clock (__AD, timeline.9b47fc30.js); the song rides in that same
// buffer, so it never drifts from the bed. Clean tones only (filtered saws, sines, FM bells, shaped noise): no samples
// besides the song, no pitch glides, no novelty effects. The bed's bar lines are laid on the landings (each section's
// tempo stretched to the song's 120 bpm grid), so every landing is a downbeat.
//   intro  G#m9 pad, the routing motif (send, then the chip's swap), 16th ticks while GPT Image 2 works
//   photo  Emaj9: the pulse starts on the landing (8th-note FM pluck, sub)
//   model  Badd9: kick, off-beat bass and hats join
//   order  C#m9, 16th hats
//   song   F#11 rings on the card's landing over a stopped groove, then the track on its play press (B major, 120 bpm)
//   end    the track closes down under the card's cover, Bmaj9 on the mascot's pop, a glass chord under the wordmark
// The sound pill (../multicat-score.436d3bf2.css) is the unmute gate: a browser holds audio until a click or key, so the
// first press of it replays the spot from the top with sound. The score plays at 1x only (a buffer cannot hold its pitch
// at other speeds), and a frozen capture (?t=) neither renders nor plays it.
// On the Music pill it is pick 'v12' (music.47e5d94a.js): the beat calls sync(t) only while v12 is the pick and idle()
// otherwise, so it renders, wakes, sounds and shows its pill only then; `failed` hands the song back to the beat.
import { track } from '../../../loads.9e82faf1.js';
import { variant } from '../../../variant.9e82faf1.js?v=3';
import { music } from '../../../music.47e5d94a.js?v=2';

const PICK = 'v12';
const on = () => variant() === 'multicat' && music() === PICK;

const CSS = new URL('../multicat-score.436d3bf2.css?v=1', import.meta.url).href;
const BEAT = 0.5;        // the song's beat (tiny-chaos.mp3 runs 120 bpm, first downbeat 28 ms in)
const ECHO = 0.373;      // the plucks' ping-pong echo: a dotted 8th of the bed's tempo
const DRIFT = 0.06;      // how far the heard audio may wander from the clock before it is re-seated (s)
// after each start, the heard audio's lead over the frames is averaged over this window (s after the start); a mean past
// SETTLE_TOL re-seats it once. Frame times are quantised to 1/60 s, so a single frame cannot tell 10 ms from noise
const SETTLE = [0.2, 0.6], SETTLE_TOL = 0.012;
const SONG_GAIN = 0.7;   // the mastered track
const BED_LEVEL = 0.55;  // the bed under the asks, about 6 LU under the track; the end card's resolve plays at full level
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

// the harmony, one chord per section (MIDI notes): `bass` the sub's root, `pad` the voicing, `arp` the pluck's tones,
// `bell` the landing's struck chord. vi, IV, I, ii, V, then I: each landing lifts the top voice
const CHORDS = [
  { name: 'G#m9', bass: 32, pad: [56, 59, 63, 66, 70] },
  { name: 'Emaj9', bass: 28, pad: [52, 56, 59, 63, 66], arp: [64, 68, 71, 75, 78, 80], bell: [68, 71, 75, 78] },
  { name: 'Badd9', bass: 35, pad: [59, 63, 66, 71, 73], arp: [66, 71, 73, 75, 78, 83], bell: [71, 75, 78, 85] },
  { name: 'C#m9', bass: 37, pad: [61, 64, 68, 71, 75], arp: [68, 71, 73, 75, 76, 80], bell: [73, 76, 80, 87] },
  { name: 'F#11', bass: 30, pad: [66, 71, 73, 76, 78], bell: [78, 83, 85, 88] },
  { name: 'Bmaj9', bass: 35, pad: [59, 66, 70, 73, 75], bell: [59, 66, 70, 73, 75, 78], glass: [78, 82, 85, 87] },
];
const ARP = [0, 2, 1, 3, 2, 4, 3, 5]; // one bar of 8ths through `arp`, restarted on every landing
const SEND_NOTE = 83, SWAP_NOTE = 90; // B5 on a send, F#6 as the chip routes it: in every chord of the bed

// every cue the score plays, read off the beat's plan (beats/multicat.516afb1a.js plan) and the engine's first route
function cuesOf({ T, send, swap, pop, word, end, song }) {
  const [M, O, S] = T.steps;
  const routed = (st) => st.chips.find((c) => !c.tool).swap; // superbot's own step (rigging) does not route
  return {
    sends: [send, M.send, O.send, S.send], swaps: [swap, ...T.steps.map(routed)],
    cards: [T.card, M.card, O.card, S.card], reveals: [T.done, M.done, O.done, S.done],
    gens: [[T.gen0, T.done], [M.gen0, M.done], [S.gen0, S.done]],
    play: S.play, cut: S.cut, pop, word, end, song,
  };
}

// the bed's sections, landing to landing: each holds a whole number of beats near the song's, so every landing is a bar line
const gridOf = (reveals) => reveals.slice(0, -1).map((a, i) => {
  const b = reveals[i + 1], n = Math.max(1, Math.round((b - a) / BEAT));
  return { a, b, n, per: (b - a) / n };
});

// a seeded generator, so every render of the score is the same score
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
function noiseOf(ac, sec, rnd) {
  const b = ac.createBuffer(1, Math.floor(sec * ac.sampleRate), ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1;
  return b;
}
// a stereo room: decaying noise whose tail darkens, 12 ms of soft onset
function roomOf(ac, sec, rnd) {
  const n = Math.floor(sec * ac.sampleRate), on = ac.sampleRate * 0.012, b = ac.createBuffer(2, n, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const x = i / n;
      lp += (0.6 - 0.48 * x) * ((rnd() * 2 - 1) - lp);
      d[i] = lp * (1 - x) ** 2.4 * Math.min(1, i / on);
    }
  }
  return b;
}

// the mixing desk: a gentle glue compressor on the bed, a room, a ping-pong echo, a limiter and the closing fade.
// Pads and plucks reach the bed through `duck` (dips under each landing) and `pump` (dips under each kick). The bed sits
// at BED_LEVEL until the cut to the end card (`lift`), where nothing of it is left sounding, then at full level
function desk(ac, end, lift) {
  const param = (node, values) => { Object.entries(values).forEach(([k, val]) => { node[k].value = val; }); return node; };
  const master = ac.createGain();
  const limit = param(ac.createDynamicsCompressor(), { threshold: -2, knee: 0, ratio: 20, attack: 0.002, release: 0.1 });
  master.connect(limit).connect(ac.destination);
  master.gain.setValueAtTime(1, end - 1.25);
  master.gain.exponentialRampToValueAtTime(0.0001, end - 0.02);
  const glue = param(ac.createDynamicsCompressor(), { threshold: -20, knee: 10, ratio: 2.5, attack: 0.015, release: 0.25 });
  const trim = ac.createGain();
  trim.gain.setValueAtTime(BED_LEVEL, 0);
  trim.gain.setValueAtTime(1, lift);
  glue.connect(trim).connect(master);
  const bed = ac.createGain(), duck = ac.createGain(), pump = ac.createGain();
  bed.connect(glue);
  duck.connect(pump).connect(bed);
  const room = ac.createConvolver();
  room.buffer = roomOf(ac, 2.6, rng(7));
  const roomOut = ac.createGain();
  roomOut.gain.value = 0.8;
  room.connect(roomOut).connect(glue);
  const echoIn = ac.createGain(), dl = ac.createDelay(1), dr = ac.createDelay(1), fb = ac.createGain(), tone = ac.createBiquadFilter();
  const pl = ac.createStereoPanner(), pr = ac.createStereoPanner(), echoOut = ac.createGain();
  dl.delayTime.value = dr.delayTime.value = ECHO;
  param(tone, { frequency: 2600 });
  fb.gain.value = 0.34; pl.pan.value = -0.7; pr.pan.value = 0.7; echoOut.gain.value = 0.5;
  echoIn.connect(tone).connect(dl);
  dl.connect(pl).connect(echoOut);
  dl.connect(dr).connect(pr).connect(echoOut);
  dr.connect(fb).connect(tone);
  echoOut.connect(glue);
  echoOut.connect(room);
  // a channel: its level into `via`, plus room and echo sends
  const chan = (level, rev = 0, echo = 0, via = bed) => {
    const n = ac.createGain();
    n.gain.value = level;
    n.connect(via);
    for (const [amt, to] of [[rev, room], [echo, echoIn]]) if (amt) { const s = ac.createGain(); s.gain.value = amt; n.connect(s).connect(to); }
    return n;
  };
  return { master, duck, pump, chan };
}

// the building blocks every instrument is made of
function parts(ac) {
  const rnd = rng(11), noise = noiseOf(ac, 2, rnd);
  const osc = (type, f, t0, t1) => { const o = ac.createOscillator(); o.type = type; o.frequency.value = f; o.start(t0); o.stop(t1); return o; };
  // attack to `peak`, then an exponential decay over d; returns the gain node, already wired to `out`
  const amp = (out, t, a, peak, d) => {
    const g = ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    g.connect(out);
    return g;
  };
  const noiseAt = (t, dur, type, f, q = 0.7) => {
    const s = ac.createBufferSource(), flt = ac.createBiquadFilter();
    s.buffer = noise; flt.type = type; flt.frequency.value = f; flt.Q.value = q;
    s.connect(flt); s.start(t, rnd() * 1.2); s.stop(t + dur);
    return flt;
  };
  // FM: a sine carrier whose brightness (the modulation index) decays from `i0` to `i1` times its frequency over `di`
  const fm = (m, ratio, t, i0, i1, di, end) => {
    const f = hz(m), car = osc('sine', f, t, end), mod = osc('sine', f * ratio, t, end), idx = ac.createGain();
    idx.gain.setValueAtTime(f * i0, t);
    idx.gain.exponentialRampToValueAtTime(f * i1, t + di);
    mod.connect(idx).connect(car.frequency);
    return car;
  };
  return { osc, amp, noiseAt, fm };
}

// the struck and plucked instruments: one onset each
function struck(B, { osc, amp, fm }) {
  return {
    pluck(m, t, v) { fm(m, 1, t, 1.4, 0.04, 0.18, t + 0.5).connect(amp(B.pluck, t, 0.003, v, 0.42)); },
    bell(m, t, v, d) {
      fm(m, 3, t, 2.2, 0.1, d * 0.4, t + d + 0.1).connect(amp(B.bell, t, 0.004, v, d));
      osc('sine', hz(m), t, t + d * 1.3 + 0.1).connect(amp(B.bell, t, 0.01, v * 0.6, d * 1.3));
    },
    tick(m, t, v, d = 0.11) {
      osc('sine', hz(m), t, t + d + 0.02).connect(amp(B.tick, t, 0.0015, v, d));
      osc('sine', hz(m) * 2, t, t + 0.06).connect(amp(B.tick, t, 0.001, v * 0.35, 0.04));
    },
    boom(m, t, v) {
      osc('sine', hz(m), t, t + 1.6).connect(amp(B.sub, t, 0.004, v, 1.5));
      osc('sine', hz(m) * 2, t, t + 0.6).connect(amp(B.sub, t, 0.003, v * 0.35, 0.5));
    },
  };
}

// the noise-made instruments: kick, hats, air and the reverse swell
function noisy(ac, B, { osc, amp, noiseAt }) {
  return {
    kick(t, v) {
      const o = osc('sine', 150, t, t + 0.45);
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(52, t + 0.045); // the kick's own body, 45 ms: a thump, not a glide
      o.connect(amp(B.drum, t, 0.002, v, 0.36));
      noiseAt(t, 0.02, 'highpass', 3000).connect(amp(B.drum, t, 0.0005, v * 0.12, 0.008));
    },
    hat(t, v) { noiseAt(t, 0.1, 'highpass', 7600).connect(amp(B.drum, t, 0.0008, v, 0.045)); },
    air(t, v) { noiseAt(t, 0.8, 'highpass', 6000).connect(amp(B.swell, t, 0.002, v, 0.6)); },
    // a reverse swell into t1: band-passed noise and the coming chord's top notes rise together, then stop dead on the hit
    swell(t1, len, v, notes) {
      const t0 = t1 - len, rise = (peak) => Float32Array.from({ length: 64 }, (_, i) => peak * (i / 63) ** 2.6);
      const up = (src, peak) => { const g = ac.createGain(); g.gain.setValueCurveAtTime(rise(peak), t0, len - 0.008); g.gain.linearRampToValueAtTime(0, t1); src.connect(g).connect(B.swell); };
      up(noiseAt(t0, len + 0.01, 'bandpass', 2400), v);
      notes.forEach((m) => up(osc('sine', hz(m), t0, t1 + 0.01), v * 0.25));
    },
  };
}

// the held instruments: sub, pad and the glass chord
function held(ac, B, { osc }) {
  return {
    sub(m, t0, t1, v, a = 0.02, r = 0.2) {
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(v, t0 + a);
      g.gain.setValueAtTime(v, Math.max(t0 + a, t1 - r));
      g.gain.linearRampToValueAtTime(0, t1);
      g.connect(B.sub);
      // the 2nd and 3rd partials carry the root to a laptop speaker that cannot play 41 Hz
      [[1, 1], [2, 0.3], [3, 0.1]].forEach(([k, l]) => { const n = ac.createGain(); n.gain.value = l; osc('sine', hz(m) * k, t0, t1 + 0.01).connect(n).connect(g); });
    },
    pad(notes, t0, t1, { level, a, r, cut }) {
      const lp = ac.createBiquadFilter(), g = ac.createGain();
      lp.Q.value = 0.5;
      cut.forEach(([t, f], i) => (i ? lp.frequency.exponentialRampToValueAtTime(f, t) : lp.frequency.setValueAtTime(f, t)));
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(level, t0 + a);
      g.gain.setValueAtTime(level, Math.max(t0 + a, t1 - r));
      g.gain.linearRampToValueAtTime(0, t1);
      lp.connect(g).connect(B.pad);
      notes.forEach((m) => [-7, 7].forEach((cents, i) => {
        const o = osc('sawtooth', hz(m), t0, t1 + 0.02), p = ac.createStereoPanner(), n = ac.createGain();
        o.detune.value = cents; p.pan.value = i ? 0.45 : -0.45; n.gain.value = 1 / notes.length;
        o.connect(n).connect(p).connect(lp);
      }));
    },
    // a sustained glass chord that swells in over `rise` and dies away over `hold`; its pairs sit 3 cents apart, a slow
    // shimmer rather than a wobble
    glass(notes, t0, rise, hold, v) {
      notes.forEach((m) => [-1.5, 1.5].forEach((cents) => {
        const o = osc('sine', hz(m), t0, t0 + rise + hold + 0.05), g = ac.createGain();
        o.detune.value = cents;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(v, t0 + rise);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + rise + hold);
        o.connect(g).connect(B.glass);
      }));
    },
  };
}

// the instruments, each a function of its start time, on their mixer channels
function kit(ac, mix) {
  const pluckTone = ac.createBiquadFilter();
  const B = {
    pad: mix.chan(0.5, 0.5, 0, mix.duck), pluck: pluckTone, bell: mix.chan(0.5, 0.55, 0.16), tick: mix.chan(0.45, 0.4, 0.1),
    drum: mix.chan(0.6, 0.04), sub: mix.chan(0.75), swell: mix.chan(0.45, 0.5), glass: mix.chan(0.4, 0.9, 0.1),
  };
  pluckTone.connect(mix.chan(0.55, 0.22, 0.3, mix.duck));
  const p = parts(ac);
  return { pluckTone: pluckTone.frequency, ...struck(B, p), ...noisy(ac, B, p), ...held(ac, B, p) };
}

// before the photo: the G#m9 pad breathes in under the greeting and opens as the camera pulls out on the first send
function layIntro(v, c) {
  const ch = CHORDS[0], r0 = c.reveals[0], s0 = c.sends[0];
  v.pad(ch.pad, 0.25, r0 + 0.12, { level: 0.15, a: 1.4, r: 0.18, cut: [[0.25, 520], [s0 - 0.1, 700], [s0 + 0.7, 1300], [r0, 2000]] });
  v.sub(ch.bass, 1, r0 + 0.05, 0.1, 1.2, 0.12);
}

// landing to landing: the pad, the pluck's bar, and from the model on the groove (kick, off-beat bass, hats)
function laySections(v, c, grid, mix) {
  grid.forEach((s, i) => {
    const ch = CHORDS[i + 1], groove = i >= 1;
    v.pad(ch.pad, s.a, s.b + 0.12, { level: 0.14, a: 0.06, r: 0.18, cut: [[s.a, 1500 + 400 * i], [s.b, 2000 + 400 * i]] });
    // the pluck brightens toward each landing; across a generation it opens all the way, so the wait builds
    const gen = c.gens.find(([, g1]) => Math.abs(g1 - s.b) < 1e-6);
    v.pluckTone.setValueAtTime(2400 + 400 * i, s.a);
    if (gen) v.pluckTone.setValueAtTime(2400 + 400 * i, gen[0]);
    v.pluckTone.exponentialRampToValueAtTime(gen ? 6000 : 3400 + 400 * i, s.b - 0.01);
    for (let k = 0; k < s.n * 2; k++) v.pluck(ch.arp[ARP[k % 8]], s.a + (k * s.per) / 2, 0.2 * (k === 0 ? 1.15 : k % 2 ? 0.6 : 0.85));
    if (!groove) { v.sub(ch.bass, s.a, s.b + 0.05, 0.22, 0.01, 0.15); return; }
    v.sub(ch.bass, s.a, s.b + 0.05, 0.08, 0.01, 0.15);
    for (let j = 0; j < s.n; j++) {
      const b = s.a + j * s.per;
      v.kick(b, j ? 0.5 : 0.62);
      mix.pump.gain.setValueAtTime(1, b - 0.002);
      mix.pump.gain.linearRampToValueAtTime(0.62, b + 0.012);
      mix.pump.gain.linearRampToValueAtTime(1, b + 0.24);
      v.sub(ch.bass + 12, b + s.per / 2, b + s.per * 0.88, 0.2, 0.005, 0.06);
      v.hat(b + s.per / 2, 0.05);
      if (i >= 2) { v.hat(b + s.per / 4, 0.02); v.hat(b + (3 * s.per) / 4, 0.02); }
    }
  });
}

// the motifs and the landings: a send tick and a routing tick per ask, 16th ticks under each fast-forwarded generation,
// and on every landing a reverse swell into a sub, a struck chord and a breath of air, the bed ducking under it
function layHits(v, c, grid, mix) {
  c.sends.forEach((t) => v.tick(SEND_NOTE, t, 0.1));
  c.swaps.forEach((t) => v.tick(SWAP_NOTE, t, 0.075));
  c.gens.forEach(([g0, g1]) => {
    const s = grid.find((x) => Math.abs(x.b - g1) < 1e-6) || grid.find((x) => Math.abs(x.a - g1) < 1e-6);
    // the coming chord's two top notes, lifted above the pluck's range where they sit in it
    const into = CHORDS[c.reveals.indexOf(g1) + 1], top = into.bell.slice(-2).map((m) => (m < 84 ? m + 12 : m));
    for (let k = 1; g1 - (k * s.per) / 4 >= g0; k++) {
      const t = g1 - (k * s.per) / 4, x = (t - g0) / (g1 - g0);
      v.tick(top[k % 2], t, 0.012 + 0.05 * x * x, 0.05);
    }
  });
  c.reveals.forEach((r, j) => {
    const ch = CHORDS[j + 1];
    v.swell(r, Math.min(0.7, r - c.cards[j]), 0.1, ch.bell.slice(-3));
    v.boom(ch.bass, r, j === 3 ? 0.42 : 0.5);
    ch.bell.forEach((m, k) => v.bell(m, r + k * 0.012, 0.075, 1.6));
    v.air(r, 0.05);
    mix.duck.gain.setValueAtTime(1, r - 0.06);
    mix.duck.gain.linearRampToValueAtTime(0.5, r + 0.01);
    mix.duck.gain.linearRampToValueAtTime(1, r + 0.7);
  });
  // the song's card lands on a stopped groove: F#11 rings for the breath before the track
  const [, , , r3] = c.reveals, V = CHORDS[4];
  v.pad(V.pad, r3, c.play + 0.16, { level: 0.14, a: 0.03, r: 0.3, cut: [[r3, 3000], [c.play, 1600]] });
}

// the track, from its play press to the end card: it closes down (low-pass and fade) under the card's cover, gone by the pop
function laySong(ac, mix, c, song) {
  const src = ac.createBufferSource(), lp = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = song;
  lp.frequency.value = 18000; // open until the cut (a filter's default is 350 Hz, which muffles the whole track)
  lp.frequency.setValueAtTime(18000, c.cut);
  lp.frequency.exponentialRampToValueAtTime(420, c.pop);
  g.gain.setValueAtTime(SONG_GAIN, c.cut);
  g.gain.linearRampToValueAtTime(SONG_GAIN * 0.35, c.pop);
  g.gain.linearRampToValueAtTime(0, c.pop + 0.25);
  src.connect(lp).connect(g).connect(mix.master);
  src.start(c.play, 0, c.pop + 0.3 - c.play);
}

// the end card: a swell across the cover into Bmaj9 on the mascot's pop, the glass chord rising with the wordmark
function layEnd(v, c) {
  const E = CHORDS[5];
  v.swell(c.pop, c.pop - c.cut, 0.09, E.bell.slice(-3));
  v.boom(E.bass, c.pop, 0.55);
  E.bell.forEach((m, k) => v.bell(m, c.pop + k * 0.014, 0.07, 2.4));
  v.air(c.pop, 0.06);
  v.pad(E.pad, c.pop, c.end, { level: 0.15, a: 0.05, r: 1.6, cut: [[c.pop, 1200], [c.end, 2600]] });
  v.sub(E.bass, c.pop, c.end, 0.14, 0.01, 1.8);
  v.glass(E.glass, c.word, 0.9, c.end - c.word - 0.9, 0.035);
}

async function renderScore(c, rate) {
  const ac = new OfflineAudioContext({ numberOfChannels: 2, length: Math.ceil((c.end + 0.05) * rate), sampleRate: rate });
  const res = await fetch(c.song);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${c.song}`);
  const song = await ac.decodeAudioData(await res.arrayBuffer());
  const mix = desk(ac, c.end, c.cut), v = kit(ac, mix), grid = gridOf(c.reveals);
  layIntro(v, c);
  laySections(v, c, grid, mix);
  layHits(v, c, grid, mix);
  laySong(ac, mix, c, song);
  layEnd(v, c);
  const out = await ac.startRendering();
  // the limiter's knee lets a sample through: scale the whole score under full scale rather than clip it
  let peak = 0;
  for (let ch = 0; ch < out.numberOfChannels; ch++) for (const x of out.getChannelData(ch)) peak = Math.max(peak, Math.abs(x));
  if (!(peak > 0)) throw new Error(`the score rendered silent or broken (peak ${peak})`);
  if (peak > 0.97) for (let ch = 0; ch < out.numberOfChannels; ch++) out.getChannelData(ch).forEach((x, i, d) => { d[i] = (x * 0.97) / peak; });
  return { buffer: out, grid, peak };
}

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`multicat score stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

const ICON_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>';
const ICON_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';
const LABEL = { wait: 'Loading sound', locked: 'Play with sound', on: 'Sound on', muted: 'Sound off', speed: 'Sound plays at 1×', failed: 'Sound unavailable' };

// what the speakers play lags what is scheduled by the output latency
const latency = (ctx) => (ctx.baseLatency || 0) + (ctx.outputLatency || 0);

// the sound pill: the unmute gate, then a mute toggle. paint(state) shows a state; a press hands the shown one to onPress
function makeGate(onPress) {
  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'mc-sound-v12';
  pill.hidden = true;
  pill.innerHTML = `<span class="mc-snd-on">${ICON_ON}</span><span class="mc-snd-off">${ICON_OFF}</span><span class="mc-snd-l"></span>`;
  const label = pill.querySelector('.mc-snd-l');
  document.body.appendChild(pill);
  let shown = '';
  pill.addEventListener('click', (e) => { if (e.detail > 0) pill.blur(); onPress(shown); });
  // Space and Enter press the pill, not the spot's clock (timeline.9b47fc30.js), as on the variant pill
  pill.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.stopPropagation(); });
  return {
    pill,
    paint(s) {
      if (s === shown) return;
      shown = s;
      pill.hidden = s === 'hidden';
      pill.dataset.state = s;
      pill.disabled = s === 'wait' || s === 'failed';
      pill.setAttribute('aria-pressed', String(s === 'on' || s === 'speed'));
      label.textContent = LABEL[s] || '';
    },
  };
}

// one playing source of the score on `master`, faded in over 8 ms and out over 12, so a re-seat never clicks
function makeVoice(ctx, master) {
  let v = null;
  return {
    get on() { return !!v; },
    // where in the buffer the speakers are now: from the context's output timestamp (what the hardware plays at a
    // performance.now() time) where the browser has one, else from its clock less the reported latency
    heard() {
      const ts = ctx.getOutputTimestamp ? ctx.getOutputTimestamp() : null;
      if (ts && ts.performanceTime > 0 && ts.contextTime > 0) return v.offset + ts.contextTime - v.at + (performance.now() - ts.performanceTime) / 1000;
      return v.offset + (ctx.currentTime - v.at) - latency(ctx);
    },
    // the heard audio's lead over the frame's time t, averaged over the frames SETTLE[0] to SETTLE[1] s after the start:
    // that mean once the window closes, else null (and null ever after it was read)
    settle(t) {
      const age = ctx.currentTime - v.at;
      if (age < SETTLE[0] || v.read) return null;
      v.sum += this.heard() - t;
      v.n++;
      if (age < SETTLE[1]) return null;
      v.read = true;
      return v.sum / v.n;
    },
    start(buffer, offset) {
      const src = ctx.createBufferSource(), g = ctx.createGain(), at = ctx.currentTime;
      src.buffer = buffer;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(1, at + 0.008);
      src.connect(g).connect(master);
      src.start(at, offset);
      v = { src, g, at, offset, sum: 0, n: 0, read: false };
    },
    stop() {
      if (!v) return;
      const at = ctx.currentTime;
      v.g.gain.cancelScheduledValues(at);
      v.g.gain.setValueAtTime(v.g.gain.value, at);
      v.g.gain.linearRampToValueAtTime(0, at + 0.012);
      v.src.stop(at + 0.015);
      v = null;
    },
  };
}

// the score's audio context, its voice and its render (reported through hooks.ready / hooks.failed). Any click or key
// outside the pill is the gesture a browser waits for, and wakes the context unless hooks.quiet(); the pill's own press
// decides for itself
function openAudio(cues, pill, hooks) {
  let ctx;
  try {
    ctx = new AudioContext({ latencyHint: 'interactive' });
  } catch (e) {
    console.error(new Error('multicat score: no AudioContext', { cause: e }));
    return null;
  }
  const master = ctx.createGain();
  master.connect(ctx.destination);
  ctx.addEventListener('statechange', () => { if (ctx.state === 'running') hooks.unlocked(); });
  track(renderScore(cues, ctx.sampleRate).then(hooks.ready, (e) => { hooks.failed(); console.error(new Error('multicat score failed to render', { cause: e })); }));
  const wake = (e) => {
    if (hooks.quiet() || ctx.state === 'running' || pill.contains(e.target)) return;
    ctx.resume().catch((e2) => console.error(new Error('multicat score: resume refused', { cause: e2 })));
  };
  addEventListener('pointerdown', wake, true);
  addEventListener('keydown', wake, true);
  return { ctx, voice: makeVoice(ctx, master) };
}

let current = null; // the live score, for frame-exact QA (scoreState)

// the score for one plan: render it on the first multicat frame, then keep it in step with the clock on every frame
export function makeScore(plan) {
  const cues = cuesOf(plan);
  let audio = null, out = null, muted = false, unlocked = false, failed = false, lastCt = -1, bias = 0;
  const stateNow = () => {
    const ad = window.__AD;
    if (failed) return 'failed';
    if (!out) return 'wait';
    if (muted) return 'muted';
    if (audio.ctx.state !== 'running') return 'locked';
    return ad && ad.speed !== 1 ? 'speed' : 'on';
  };
  const paint = () => gate.paint(on() ? stateNow() : 'hidden');
  const gate = makeGate((was) => {
    if (!audio) return;
    if (was === 'on' || was === 'speed') { muted = true; audio.voice.stop(); paint(); return; }
    // the first unlock replays the spot from the top, so the score is heard whole
    const first = was === 'locked' && !unlocked;
    muted = false;
    audio.ctx.resume().then(() => { if (first && window.__AD) window.__AD.play(0); paint(); },
      (e) => console.error(new Error('multicat score: resume refused', { cause: e })));
  });
  const leave = () => { if (audio) audio.voice.stop(); paint(); };
  addEventListener('variantchange', leave);
  addEventListener('musicchange', leave);
  const ensure = () => {
    if (audio || failed) return;
    loadSheet();
    audio = openAudio(cues, gate.pill, { ready: (r) => { out = r; }, failed: () => { failed = true; }, unlocked: () => { unlocked = true; }, quiet: () => muted || !on() });
    if (!audio) failed = true;
  };
  const score = {
    cues,
    get failed() { return failed; },
    // not the pick (or not this variant): silent, pill hidden
    idle() { if (audio) audio.voice.stop(); paint(); },
    sync(t) {
      // a frozen capture is silent: no context, no render
      if (document.body.classList.contains('freeze')) return;
      ensure();
      paint();
      if (!audio) return;
      const { ctx, voice } = audio, ad = window.__AD, ct = ctx.currentTime, ticking = ct !== lastCt;
      lastCt = ct;
      const run = !!out && !muted && ctx.state === 'running' && !!ad && ad.playing && ad.speed === 1 && t < out.buffer.duration - 0.05;
      if (!run) { voice.stop(); return; }
      if (voice.on && Math.abs(voice.heard() - t) < DRIFT) {
        // a start that settled off the frame (a latency the browser misreports, a clock still waking) is learnt into
        // `bias` and re-seated once
        const lead = voice.settle(t);
        if (lead === null || Math.abs(lead) < SETTLE_TOL) return;
        bias = Math.max(-0.1, Math.min(0.1, bias - lead));
      } else if (!voice.on && !ticking) return; // a context just resumed reads 'running' before its clock moves
      voice.stop();
      voice.start(out.buffer, t + latency(ctx) + bias); // scheduled one latency ahead, so what is heard is the frame shown
    },
    state: () => ({ state: stateNow(), ready: !!out, peak: out && out.peak, grid: out && out.grid, ctx: audio && audio.ctx.state,
      playing: !!audio && audio.voice.on, heard: audio && audio.voice.on ? audio.voice.heard() : null, bias }),
    get buffer() { return out && out.buffer; },
  };
  current = score;
  (window.__PICKS ||= {})[PICK] = { ready: () => !!out || failed, sounding: () => !!audio && audio.voice.on && audio.ctx.state === 'running' && !muted };
  return score;
}

// the live score's cues, render and playback state (null before the multicat beat builds)
export const scoreState = () => current;
