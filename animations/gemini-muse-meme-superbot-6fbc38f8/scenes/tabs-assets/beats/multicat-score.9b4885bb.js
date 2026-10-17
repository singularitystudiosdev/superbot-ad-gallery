// The multicat variant's score (multicat.516afb1a.js hands it the beat's own times): sparse sound effects on moments the
// spot already animates, and an 8-bar bed that adds one layer per tool, then gives way to the real song. Everything is
// synthesized here at run time in WebAudio (oscillators, seeded noise, Karplus-Strong plucks, additive bells, a generated
// reverb): no samples, no borrowed melody. Each cue nods to a famous campaign's sound by style only, never its notes:
//   keys, send swoosh   Apple's iPhone and iMessage spots, where the UI's own clicks carry the edit
//   x50 generations     a tape fast-forward whir, the time-lapse trope
//   photo lands         a camera shutter ("Shot on iPhone")
//   bed                 the iPod silhouette spots: 120 bpm indie pop, strummed muted guitar, handclaps, a bouncy bass and
//                       glockenspiel, in B major, the key measured from the song it hands over to (tiny-chaos.mp3)
//   3D model lands      a product-reveal sub swell (Apple's product films)
//   cat food lands      a can's pull tab, then a crystal ting (Fancy Feast's crystal-goblet spots; the order is Fancy Feast)
//   end card            a sonic logo in the Intel "bong" and Netflix "ta-dum" tradition: two notes and a bloom of its own
// Quiet beats stay silent: the empty state, the streamed replies, the credits rows, and the song while it plays.
// The score follows the spot's clock and never drives it: cues are scheduled a little ahead while the clock runs (at its
// speed), cut when it pauses, seeks or leaves the variant, and a jump past a cue skips it. The last cue's tail rings out
// over the held end frame.
import { seg } from '../../../lib.9b47fc30.js';
import { soundOut, makeMaster } from '../../../sound.9b4885bb.js';

const BEAT = 60 / 120, BAR = 4 * BEAT, EIGHTH = BEAT / 2;
// cues are scheduled LOOK spot seconds ahead of the clock, more when frames come slowly (up to MAX_LOOK) so a stalled frame
// never delays or bunches them; a clock step that strays from the wall clock by SEEK is a seek (what it skipped stays silent),
// and a cue missed by more than LATE is dropped rather than played late
const LOOK = 0.15, MAX_LOOK = 1.5, SEEK = 0.25, LATE = 0.1;
const BED = 0.5, SFX = 0.8, VERB = 0.9; // bus levels into the master
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

// a seeded generator, so every play of the spot sounds the same
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- per-context bank: buses, a reverb, the shared noise and the plucked strings ----------
const BANKS = new WeakMap();
function bankOf(ac, out) {
  let b = BANKS.get(ac);
  if (b) return b;
  const bus = (g, to = out) => { const n = ac.createGain(); n.gain.value = g; n.connect(to); return n; };
  // a generated room: two channels of seeded noise under a curved decay, darkened
  const verb = ac.createConvolver();
  const n = Math.floor(ac.sampleRate * 2.2), ir = ac.createBuffer(2, n, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c), r = rng(11 + c); for (let i = 0; i < n; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / n, 3.2); }
  verb.buffer = ir;
  const dark = ac.createBiquadFilter();
  dark.type = 'lowpass'; dark.frequency.value = 5200;
  verb.connect(dark).connect(bus(VERB));
  const noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), nd = noise.getChannelData(0), nr = rng(5);
  for (let i = 0; i < nd.length; i++) nd[i] = nr() * 2 - 1;
  b = { bed: bus(BED), sfx: bus(SFX), verb, noise, ks: new Map() };
  BANKS.set(ac, b);
  return b;
}

const panned = (ac, out, pan) => { if (!pan) return out; const p = ac.createStereoPanner(); p.pan.value = pan; p.connect(out); return p; };
// an attack to g, then an exponential fall to silence by a + d
function envelope(ac, at, g, a, d) {
  const env = ac.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(Math.max(g, 1e-4), at + a);
  env.gain.exponentialRampToValueAtTime(1e-4, at + a + d);
  return env;
}

// ---------- voices ----------
// filtered noise under a fast envelope: key clicks, claps, shutters, hiss, air
function hiss(ac, b, at, out, { type = 'bandpass', f, f1, q = 1, a = 0.002, d = 0.05, g, off = 0, pan = 0 }) {
  const src = ac.createBufferSource();
  src.buffer = b.noise; src.loop = true;
  const flt = ac.createBiquadFilter();
  flt.type = type; flt.Q.value = q;
  flt.frequency.setValueAtTime(f, at);
  if (f1) flt.frequency.exponentialRampToValueAtTime(f1, at + a + d);
  src.connect(flt).connect(envelope(ac, at, g, a, d)).connect(panned(ac, out, pan));
  src.start(at, off % 1.9); src.stop(at + a + d + 0.02);
}

// an oscillator under a pluck envelope, its pitch gliding from f to f1 when given
function tone(ac, at, out, { type = 'sine', f, f1, glide = 0.1, a = 0.003, d = 0.3, g, pan = 0, lp }) {
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(f, at);
  if (f1) osc.frequency.exponentialRampToValueAtTime(f1, at + glide);
  let head = osc;
  if (lp) { const flt = ac.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = lp; head = osc.connect(flt); }
  head.connect(envelope(ac, at, g, a, d)).connect(panned(ac, out, pan));
  osc.start(at); osc.stop(at + a + d + 0.02);
}

// a Karplus-Strong string, rendered once per pitch and damping: one period of soft noise fed back through an averaging loop
function ksBuffer(ac, b, f, loss) {
  const key = `${f.toFixed(2)}/${loss}`;
  let buf = b.ks.get(key);
  if (buf) return buf;
  const sr = ac.sampleRate, n = Math.floor(sr * 1.4), p = Math.max(2, Math.round(sr / f - 0.5));
  buf = ac.createBuffer(1, n, sr);
  const y = buf.getChannelData(0), r = rng(Math.round(f * 7));
  let lp = 0, peak = 0;
  for (let i = 0; i < p; i++) { lp += 0.55 * (r() * 2 - 1 - lp); y[i] = lp; }
  for (let i = p; i < n; i++) y[i] = loss * 0.5 * (y[i - p] + (i - p - 1 >= 0 ? y[i - p - 1] : 0));
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(y[i]));
  for (let i = 0; i < n; i++) y[i] /= peak || 1;
  b.ks.set(key, buf);
  return buf;
}
function pluck(ac, b, at, out, { f, loss, g, len, lp = 3600, pan = 0 }) {
  const src = ac.createBufferSource();
  src.buffer = ksBuffer(ac, b, f, loss);
  const flt = ac.createBiquadFilter();
  flt.type = 'lowpass'; flt.frequency.value = lp; flt.Q.value = 0.5;
  const env = ac.createGain();
  env.gain.setValueAtTime(g, at); env.gain.setValueAtTime(g, at + len); env.gain.exponentialRampToValueAtTime(1e-4, at + len + 0.08);
  src.connect(flt).connect(env).connect(panned(ac, out, pan));
  src.start(at); src.stop(at + len + 0.1);
}

// a struck bar (glockenspiel, bells): an ideal bar's inharmonic modes, the upper ones dying first
const BAR_MODES = [[1, 1, 1], [2.756, 0.26, 0.4], [5.404, 0.09, 0.18], [8.933, 0.035, 0.08]];
function bell(ac, at, out, { f, g, d = 1.2, pan = 0 }) {
  const o = panned(ac, out, pan);
  for (const [k, gk, dk] of BAR_MODES) {
    if (f * k > 15000) continue;
    const osc = ac.createOscillator();
    osc.frequency.value = f * k;
    osc.connect(envelope(ac, at, g * gk, 0.002, d * dk)).connect(o);
    osc.start(at); osc.stop(at + d * dk + 0.03);
  }
}

// a soft swelling chord tone: two detuned triangles, darkened
function pad(ac, at, out, { f, g, a = 0.06, d = 2.4, pan = 0 }) {
  for (const cents of [-7, 7]) {
    const osc = ac.createOscillator();
    osc.type = 'triangle'; osc.frequency.value = f; osc.detune.value = cents;
    const flt = ac.createBiquadFilter();
    flt.type = 'lowpass'; flt.frequency.value = 2400;
    osc.connect(flt).connect(envelope(ac, at, g, a, d)).connect(panned(ac, out, pan + cents / 40));
    osc.start(at); osc.stop(at + a + d + 0.03);
  }
}

// ---------- cue sounds ----------
function keyTick(ac, b, at, out, { space, v, f, off }) {
  if (space) { hiss(ac, b, at, out, { type: 'lowpass', f: 700, q: 0.7, a: 0.001, d: 0.045, g: 0.14 * v, off }); return; }
  hiss(ac, b, at, out, { f, q: 3, a: 0.0005, d: 0.016, g: 0.15 * v, off, pan: (f - 3500) / 6000 });
  hiss(ac, b, at, out, { type: 'lowpass', f: 900, q: 0.7, a: 0.001, d: 0.028, g: 0.08 * v, off: off + 0.5 });
}

function swoosh(ac, b, at, out) {
  hiss(ac, b, at, out, { f: 480, f1: 3800, q: 1.4, a: 0.07, d: 0.2, g: 0.3, pan: -0.15, off: 0.2 });
  hiss(ac, b, at + 0.03, out, { type: 'highpass', f: 2500, f1: 6500, q: 0.7, a: 0.05, d: 0.16, g: 0.06, pan: 0.2, off: 0.9 });
}

// a chip resolving: a quiet two-step tink in the bed's key (B6, then F#7)
function tink(ac, b, at, out) {
  tone(ac, at, out, { f: midi(95), a: 0.002, d: 0.12, g: 0.06 });
  tone(ac, at + 0.05, out, { f: midi(102), a: 0.002, d: 0.1, g: 0.03 });
}

// a generation fast-forwarding: noise through a rising band, chopped by a quickening ratchet, over a motor glide
function whir(ac, b, at, out, span) {
  const end = at + Math.max(span, 0.12);
  const src = ac.createBufferSource();
  src.buffer = b.noise; src.loop = true;
  const flt = ac.createBiquadFilter();
  flt.type = 'bandpass'; flt.Q.value = 4;
  flt.frequency.setValueAtTime(380, at); flt.frequency.exponentialRampToValueAtTime(2300, end);
  const chop = ac.createGain();
  chop.gain.value = 0.55;
  const lfo = ac.createOscillator();
  lfo.type = 'square';
  lfo.frequency.setValueAtTime(16, at); lfo.frequency.exponentialRampToValueAtTime(40, end);
  const depth = ac.createGain();
  depth.gain.value = 0.45;
  lfo.connect(depth).connect(chop.gain);
  const env = ac.createGain();
  env.gain.setValueAtTime(0, at); env.gain.linearRampToValueAtTime(0.3, at + 0.08);
  env.gain.setValueAtTime(0.3, end); env.gain.linearRampToValueAtTime(0, end + 0.07);
  src.connect(flt).connect(chop).connect(env).connect(out);
  const motor = ac.createOscillator();
  motor.type = 'triangle';
  motor.frequency.setValueAtTime(170, at); motor.frequency.exponentialRampToValueAtTime(520, end);
  const mg = ac.createGain();
  mg.gain.setValueAtTime(0, at); mg.gain.linearRampToValueAtTime(0.016, at + 0.1);
  mg.gain.setValueAtTime(0.016, end); mg.gain.linearRampToValueAtTime(0, end + 0.07);
  motor.connect(mg).connect(out);
  for (const n of [src, lfo, motor]) { n.start(at); n.stop(end + 0.1); }
}

// the photo landing: a shutter's two blades, each a click over a short body
function shutter(ac, b, at, out) {
  hiss(ac, b, at, out, { f: 3800, q: 2, a: 0.0005, d: 0.012, g: 0.55, off: 0.1 });
  hiss(ac, b, at, out, { type: 'lowpass', f: 1400, q: 0.8, a: 0.001, d: 0.045, g: 0.25, off: 0.4 });
  hiss(ac, b, at + 0.075, out, { f: 2600, q: 2.5, a: 0.0005, d: 0.016, g: 0.4, off: 0.7 });
  hiss(ac, b, at + 0.075, out, { type: 'lowpass', f: 1000, q: 0.8, a: 0.001, d: 0.06, g: 0.18, off: 1.1 });
}

// the 3D model landing: a sub drop onto the bed's tonic (B1), air falling away, two sparkles
function reveal(ac, b, at, out) {
  tone(ac, at, out, { f: 98, f1: midi(35), glide: 0.25, a: 0.012, d: 1.1, g: 0.3 });
  hiss(ac, b, at, out, { type: 'lowpass', f: 2600, f1: 380, q: 0.5, a: 0.02, d: 0.7, g: 0.1, off: 0.3 });
  bell(ac, at + 0.06, out, { f: midi(95), g: 0.07, d: 1.4, pan: -0.3 });
  bell(ac, at + 0.14, out, { f: midi(102), g: 0.045, d: 1.2, pan: 0.3 });
}

// the cat food landing: a can's pull tab (crack, thunk, hiss of air)
function canTab(ac, b, at, out) {
  hiss(ac, b, at, out, { f: 4200, q: 3, a: 0.0005, d: 0.008, g: 0.5, off: 0.15 });
  hiss(ac, b, at + 0.006, out, { type: 'lowpass', f: 1800, q: 4, a: 0.001, d: 0.03, g: 0.22, off: 0.55 });
  hiss(ac, b, at + 0.012, out, { type: 'highpass', f: 2800, f1: 5200, q: 0.7, a: 0.015, d: 0.24, g: 0.16, off: 1.3 });
}
// then a crystal glass's ring on B6: two near-unison modes beating slowly, inharmonic uppers dying first
function crystal(ac, b, at, out) {
  const f = midi(95);
  for (const [k, hz, gk, d] of [[1, 0, 1, 1.8], [1, 2.4, 0.8, 1.8], [2.32, 0, 0.3, 0.7], [4.25, 0, 0.12, 0.3]]) {
    tone(ac, at, out, { f: f * k + hz, a: 0.002, d, g: 0.06 * gk, pan: hz ? 0.25 : -0.1 });
  }
}

function press(ac, b, at, out) {
  hiss(ac, b, at, out, { f: 2000, q: 1.5, a: 0.0005, d: 0.006, g: 0.3, off: 0.8 });
  tone(ac, at, out, { f: 900, f1: 500, glide: 0.03, a: 0.001, d: 0.05, g: 0.12 });
}

// the sonic logo, in three cues on the end card's own moments: the mascot's pop (B5 over a sub thump), a fifth up as it
// settles (F#6), and an open bloom (B, F#, C#: no third, so it sits over the song's fading verse) as the wordmark rises
function logoPop(ac, b, at, out) {
  bell(ac, at, out, { f: midi(83), g: 0.2, d: 1.6 });
  tone(ac, at, out, { f: 82, f1: midi(35), glide: 0.12, a: 0.004, d: 0.5, g: 0.28 });
}
function logoFifth(ac, b, at, out) { bell(ac, at, out, { f: midi(90), g: 0.17, d: 1.6, pan: 0.1 }); }
function logoBloom(ac, b, at, out) {
  [71, 78, 85, 90].forEach((m, i) => pad(ac, at + i * 0.012, out, { f: midi(m), g: 0.05, a: 0.07, d: 2.4, pan: (i - 1.5) * 0.18 }));
  bell(ac, at, out, { f: midi(95), g: 0.07, d: 2.2, pan: -0.2 });
  hiss(ac, b, at, out, { type: 'highpass', f: 7000, q: 0.5, a: 0.3, d: 1.2, g: 0.02, off: 0.6 });
}

// ---------- the bed ----------
// one bar per chord, I vi IV V in B: the strummed voicing, the bass root, and the glockenspiel's four eighths
const CHORDS = [
  { v: [59, 63, 66, 71], root: 47, gl: [[0, 90], [2, 87], [4, 83], [6, 85]] }, // B
  { v: [56, 59, 63, 68], root: 44, gl: [[0, 87], [2, 83], [4, 80], [6, 83]] }, // G#m
  { v: [59, 64, 68, 71], root: 40, gl: [[0, 83], [2, 80], [4, 88], [6, 87]] }, // E
  { v: [58, 61, 66, 70], root: 42, gl: [[0, 85], [2, 82], [4, 90], [6, 88]] }, // F#
];
// down-down-up, up-down-up on the eighths: [eighth, stroke, velocity, ring]
const STRUM = [[0, 1, 1, 0.34], [2, 1, 0.75, 0.2], [3, -1, 0.55, 0.13], [5, -1, 0.55, 0.13], [6, 1, 0.8, 0.2], [7, -1, 0.5, 0.13]];
// the bouncy bass: [eighth, semitones over the root, length]
const BASS = [[0, 0, 0.42], [3, 0, 0.18], [4, 7, 0.36], [6, 12, 0.2]];

function strum(ac, b, at, out, { notes, dir, v, ring, loss, lp }) {
  const order = dir > 0 ? notes : [...notes].reverse();
  order.forEach((m, i) => pluck(ac, b, at + i * 0.011, out, { f: midi(m), loss, g: 0.22 * v * (1 - i * 0.06), len: ring, lp, pan: (notes.indexOf(m) - 1.5) * 0.14 }));
}
function bass(ac, at, out, { f, g, len, lp }) {
  const osc = ac.createOscillator();
  osc.type = 'sawtooth'; osc.frequency.value = f;
  const flt = ac.createBiquadFilter();
  flt.type = 'lowpass'; flt.Q.value = 2;
  flt.frequency.setValueAtTime(lp, at); flt.frequency.exponentialRampToValueAtTime(260, at + 0.16);
  const env = ac.createGain();
  env.gain.setValueAtTime(0, at); env.gain.linearRampToValueAtTime(g, at + 0.004);
  env.gain.setValueAtTime(g * 0.7, at + len); env.gain.exponentialRampToValueAtTime(1e-4, at + len + 0.06);
  osc.connect(flt).connect(env).connect(out);
  osc.start(at); osc.stop(at + len + 0.08);
  tone(ac, at, out, { f, a: 0.004, d: len + 0.04, g: g * 0.4 });
}
function clap(ac, b, at, out, { g, off }) {
  for (const k of [0, 0.011, 0.023]) hiss(ac, b, at + k, out, { f: 1150, q: 1.6, a: 0.0008, d: 0.009, g: g * 0.85, off: off + k });
  hiss(ac, b, at + 0.031, out, { f: 1100, q: 1.2, a: 0.001, d: 0.13, g: g * 0.55, off: off + 0.3 });
}
function kick(ac, b, at, out, { g }) {
  tone(ac, at, out, { f: 150, f1: 48, glide: 0.09, a: 0.002, d: 0.3, g });
  hiss(ac, b, at, out, { type: 'lowpass', f: 3000, a: 0.0005, d: 0.006, g: g * 0.25, off: 1.7 });
}

// the bed's events: from the photo's landing (the downbeat) to the first bar line a beat past the song's ask, where it
// lands on a soft B chord. Layer 1 (strum, claps, kick) starts with the photo; layer 2 (bass, shaker) on the first beat
// after the 3D model lands; layer 3 (glockenspiel) a beat after the cat food lands. The drums drop out on the song's
// send, and the tonal layers dim and darken to the closing chord.
function bedOf(m, add, r) {
  const B0 = m.photo;
  const onBeat = (t) => B0 + Math.ceil((t - B0) / BEAT - 1e-6) * BEAT;
  const L2 = onBeat(m.model), L3 = onBeat(m.order + BEAT);
  const END = B0 + Math.ceil((m.songAsk + BEAT - B0) / BAR - 1e-6) * BAR;
  const dim = (t) => 1 - 0.65 * seg(t, m.songAsk, END);
  const lp = (t, top) => 500 + (top - 500) * dim(t);
  for (let bar = 0; B0 + bar * BAR < END; bar++) {
    const c = CHORDS[bar % CHORDS.length], t0 = B0 + bar * BAR;
    for (let e = 0; e < 8; e++) {
      const at = t0 + e * EIGHTH, f = dim(at), drums = at < m.songAsk;
      const s = STRUM.find((x) => x[0] === e);
      if (s) add(at, 'bed', 0.12, (ac, b, w, o) => strum(ac, b, w, o, { notes: c.v, dir: s[1], v: s[2] * f, ring: s[3], loss: 0.975, lp: lp(at, 3400) }));
      if (drums && (e === 0 || e === 4)) add(at, 'bed', 0, (ac, b, w, o) => kick(ac, b, w, o, { g: 0.42 }));
      if (drums && (e === 2 || e === 6)) { const off = r() * 1.5; add(at, 'bed', 0.18, (ac, b, w, o) => clap(ac, b, w, o, { g: 0.3, off })); }
      if (at >= L2) {
        const bl = BASS.find((x) => x[0] === e);
        if (bl) add(at, 'bed', 0, (ac, b, w, o) => bass(ac, w, o, { f: midi(c.root + bl[1]), g: 0.13 * f, len: bl[2], lp: lp(at, 1500) }));
        if (drums) { const off = r() * 1.5, g = e % 2 ? 0.075 : 0.045; add(at, 'bed', 0, (ac, b, w, o) => hiss(ac, b, w, o, { type: 'highpass', f: 6500, q: 0.7, a: 0.01, d: 0.05, g, off, pan: 0.25 })); }
      }
      if (at >= L3) {
        const gl = c.gl.find((x) => x[0] === e);
        if (gl) add(at, 'bed', 0.3, (ac, b, w, o) => bell(ac, w, o, { f: midi(gl[1]), g: 0.11 * f, d: 1, pan: -0.2 }));
      }
    }
  }
  // the closing B chord, rung out under the song's reply
  const f = dim(END);
  add(END, 'bed', 0.3, (ac, b, w, o) => {
    strum(ac, b, w, o, { notes: CHORDS[0].v, dir: 1, v: f, ring: 1.1, loss: 0.996, lp: lp(END, 3400) });
    bass(ac, w, o, { f: midi(47), g: 0.13 * f, len: 0.8, lp: lp(END, 1500) });
    bell(ac, w, o, { f: midi(95), g: 0.11 * f, d: 1.6, pan: -0.2 });
  }, 2.5);
  return END;
}

// every cue of the score, sorted by spot time: { at, bus, wet (reverb send), play(ac, bank, when, out, span), span?, tail }
export function scoreOf(m) {
  const cues = [];
  const r = rng(2026);
  const add = (at, bus, wet, play, tail = 1.5, span = 0) => cues.push({ at, bus, wet, play, tail, span });
  // the asks typing: a key per character, as each appears in the composer (chat.9b47fc30.js renderComposer)
  for (const a of m.asks) {
    const step = (a.typeEnd - a.s) / a.text.length;
    [...a.text].forEach((ch, i) => {
      const v = 0.65 + 0.35 * r(), f = 2600 + 1800 * r(), off = r() * 1.5;
      add(a.s + (i + 0.5) * step, 'sfx', 0, (ac, b, w, o) => keyTick(ac, b, w, o, { space: ch === ' ', v, f, off }), 0.2);
    });
  }
  for (const t of m.sends) add(t, 'sfx', 0.1, swoosh, 0.6);
  for (const t of m.chips) add(t, 'sfx', 0.15, tink, 0.6);
  for (const [g0, done] of m.gens) add(g0, 'sfx', 0, whir, 0.3, done - g0);
  add(m.photo, 'sfx', 0.08, shutter, 0.4);
  add(m.model, 'sfx', 0.35, reveal, 1.8);
  add(m.order, 'sfx', 0.1, canTab, 0.5);
  add(m.order + 0.2, 'sfx', 0.5, crystal, 2.2);
  add(m.play, 'sfx', 0, press, 0.3);
  add(m.logo, 'sfx', 0.4, logoPop, 2);
  add(m.logo + 0.16, 'sfx', 0.45, logoFifth, 2);
  add(m.logo + 0.32, 'sfx', 0.5, logoBloom, 3);
  bedOf(m, add, r);
  return cues.sort((x, y) => x.at - y.at);
}

// one cue onto a context: its own gain (so a pause can cut it), into its bus and, by `wet`, the reverb
function fire(ac, b, c, when, rate) {
  const vca = ac.createGain();
  vca.connect(c.bus === 'bed' ? b.bed : b.sfx);
  if (c.wet) { const w = ac.createGain(); w.gain.value = c.wet; vca.connect(w).connect(b.verb); }
  const span = c.span / rate;
  c.play(ac, b, when, vca, span);
  return { vca, end: when + span + c.tail };
}

// the first cue at or after spot time t
function firstAt(cues, t) {
  let lo = 0, hi = cues.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (cues[mid].at < t) lo = mid + 1; else hi = mid; }
  return lo;
}

// m: the beat's marks, in spot seconds. asks [{ text, s, typeEnd }], sends [t], chips [done], gens [[gen0, done]], and the
// moments photo, model, order (each answer landing), songAsk (the song's send), play (its play press), logo (the mascot's pop)
export function makeScore(m) {
  const cues = scoreOf(m);
  let live = [], last = null, lastWall = 0, horizon = 0, look = LOOK, liveAc = null;

  // cut what is ringing or queued, fast but without a click
  function halt() {
    if (!live.length) return;
    const now = liveAc.currentTime, gone = live;
    live = [];
    for (const c of gone) if (c.end > now) { c.vca.gain.cancelScheduledValues(now); c.vca.gain.setTargetAtTime(0, now, 0.012); }
    setTimeout(() => gone.forEach((c) => c.vca.disconnect()), 250);
  }
  addEventListener('variantchange', () => { halt(); last = null; });
  addEventListener('musicchange', () => { halt(); last = null; });

  return {
    cues,
    render(t) {
      const s = soundOut(), ad = window.__AD;
      const running = !document.body.classList.contains('freeze') && !!(ad && ad.playing);
      if (!s || !running) {
        // the run's natural end lets the last tail ring over the held frame; a pause, a stop or a mute cuts it
        if (!(ad && t >= ad.CYCLE - 0.05)) halt();
        last = null;
        return;
      }
      const { ac, out } = s;
      liveAc = ac;
      const wall = performance.now(), rate = ad.speed || 1;
      if (last !== null) {
        const step = t - last, expected = ((wall - lastWall) / 1000) * rate;
        if (step < -1e-4 || Math.abs(step - expected) > SEEK) { halt(); last = null; }
        else look = Math.min(MAX_LOOK, Math.max(LOOK, 1.5 * expected));
      }
      if (last === null) horizon = t;
      last = t; lastWall = wall;
      const until = t + look, now = ac.currentTime, b = bankOf(ac, out);
      for (let i = firstAt(cues, Math.max(horizon, t - LATE)); i < cues.length && cues[i].at < until; i++) {
        live.push(fire(ac, b, cues[i], now + Math.max(0, (cues[i].at - t) / rate), rate));
      }
      horizon = Math.max(horizon, until);
      if (live.length > 64) live = live.filter((c) => c.end > now || (c.vca.disconnect(), false));
    },
    // QA: the whole score from spot time `from` to `to`, rendered offline at speed 1 (the verify step reads its levels)
    bounce(from = 0, to = cues[cues.length - 1].at + 3, sr = 44100) {
      const ac = new OfflineAudioContext(2, Math.ceil((to - from) * sr), sr);
      const b = bankOf(ac, makeMaster(ac));
      for (const c of cues) if (c.at >= from && c.at < to) fire(ac, b, c, c.at - from, 1);
      return ac.startRendering();
    },
  };
}
