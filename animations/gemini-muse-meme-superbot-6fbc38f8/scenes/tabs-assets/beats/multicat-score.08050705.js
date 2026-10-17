// The multicat spot's soundtrack, rendered whole: the original score (multicat-music.08050705.js) and sound effects
// (multicat-sfx.08050705.js) on the beat's own timeline, mixed with the ElevenLabs song the spot plays (the diegetic
// track, decoded by the caller), then mastered to a measured -16 LUFS integrated with true peaks under -1 dBTP
// (multicat-master.08050705.js). A pure function of its inputs: the page renders it in a worker
// (multicat-mix-worker.08050705.js), and the same call in Node is how the mix was measured.
//   bus     what               processing
//   music   pad, keys, guitar, bass, drums
//                              stem EQ, ducked under the UI's big moments, glued, gated off on the song's downbeat
//   verb    the score's sends  1.7 s plate-ish FDN, faded out with the music
//   post    sting, song marks  from the song on; its own 2.2 s reverb (pverb)
//   ui      sound effects      dry, plus a 0.7 s room (room)
//   song    the ElevenLabs track, from the play press; low-passed and faded as the end card covers the chat
import { SR, Bus, rng, db, sum, eqBus, SVF, reverb as fdn } from './multicat-dsp.08050705.js';
import { master, integrated, shortTerm } from './multicat-master.08050705.js';
import { renderMusic, BAR } from './multicat-music.08050705.js';
import { renderSfx } from './multicat-sfx.08050705.js';

// stem levels (dB) into the mix, before mastering
const MIX = { pad: 1.5, keys: -3, gtr: 10, bass: -7, drums: -7, verb: -3, post: -4.5, pverb: -5, ui: 0, room: -6, song: -1 };
const SONG_FOR = 5.6, SONG_FADE = 0.9; // as the beat plays the cat's song (multicat.516afb1a.js); a chain may pass its own songFor
const reverb = (bus, rt60, damp, pre = 0.02) => fdn(bus, { rt60, damp, pre });

// a gain curve over n samples: 1, dipping by `depth` dB at each [t, depth, attack, hold, release]
function duckCurve(n, events) {
  const g = new Float32Array(n).fill(1);
  for (const [t, depth, a, h, rel] of events) {
    const lo = db(depth), i0 = Math.max(0, Math.round((t - a) * SR)), i1 = Math.min(n, Math.round((t + h + rel) * SR));
    for (let i = i0; i < i1; i++) {
      const tt = i / SR - t;
      const p = tt < 0 ? 1 + tt / a : tt < h ? 1 : 1 - (tt - h) / rel; // 0..1 how far down
      const v = 1 - (1 - lo) * Math.sin((Math.max(0, Math.min(1, p)) * Math.PI) / 2);
      if (v < g[i]) g[i] = v;
    }
  }
  return g;
}
// multiply a bus by a curve, or fade it between two times (1 -> 0 equal-power when `out`)
function applyCurve(bus, g) { for (let i = 0; i < bus.n; i++) { bus.L[i] *= g[i]; bus.R[i] *= g[i]; } }
function fadeBetween(bus, t0, t1, out = true) {
  const i0 = Math.round(t0 * SR), i1 = Math.round(t1 * SR);
  for (let i = Math.max(0, i0); i < bus.n; i++) {
    const p = i >= i1 ? 1 : (i - i0) / (i1 - i0), v = out ? Math.cos((p * Math.PI) / 2) : Math.sin((p * Math.PI) / 2);
    if (out && p >= 1) { bus.L[i] = 0; bus.R[i] = 0; continue; }
    bus.L[i] *= v; bus.R[i] *= v;
  }
}
// gentle feed-forward bus compressor (peak detector, soft knee): `thr` dBFS, `ratio`, attack/release ms
function glue(bus, { thr = -16, ratio = 2, atk = 10, rel = 160, knee = 6 } = {}) {
  const ca = Math.exp(-1 / ((atk / 1000) * SR)), cr = Math.exp(-1 / ((rel / 1000) * SR));
  let env = 0, most = 0;
  for (let i = 0; i < bus.n; i++) {
    const x = Math.max(Math.abs(bus.L[i]), Math.abs(bus.R[i]));
    env = x > env ? x + (env - x) * ca : x + (env - x) * cr;
    const lv = 20 * Math.log10(env + 1e-9), over = lv - thr;
    const gr = over <= -knee / 2 ? 0 : over >= knee / 2 ? over * (1 - 1 / ratio) : ((over + knee / 2) ** 2 / (2 * knee)) * (1 - 1 / ratio);
    const g = Math.pow(10, -gr / 20);
    bus.L[i] *= g; bus.R[i] *= g;
    if (gr > most) most = gr;
  }
  return most;
}

// the song from the play press: songFor seconds, then low-passed and faded over SONG_FADE as the end card covers the chat
function placeSong(bus, song, S, songFor) {
  const i0 = Math.round(S.play * SR), n = Math.min(song.L.length, Math.round((songFor + SONG_FADE) * SR));
  const fl = new SVF(18000, 0.6), fr = new SVF(18000, 0.6), cut = Math.round(songFor * SR), fadeN = Math.round(SONG_FADE * SR);
  for (let i = 0; i < n && i0 + i < bus.n; i++) {
    let gl = Math.min(1, i / (0.004 * SR)), l = song.L[i], r = song.R[i];
    if (i >= cut) {
      const p = (i - cut) / fadeN;
      if ((i & 15) === 0) { const fc = 18000 * Math.pow(600 / 18000, Math.min(1, p)); fl.set(fc, 0.6); fr.set(fc, 0.6); }
      gl *= Math.cos((Math.min(1, p) * Math.PI) / 2);
    }
    l = fl.run(l); r = fr.run(r);
    bus.L[i0 + i] += l * gl; bus.R[i0 + i] += r * gl;
  }
}

// T: the beat's plan (multicat.516afb1a.js plan); ask0: the first ask { text, s, typeEnd, send }; chips0: its routing
// chips; song: { L, R } Float32Arrays at 48 kHz (or null); songFor: how long the song plays before its fade; cycle: the
// spot's length. Returns the mastered stereo mix
export function renderMix({ T, ask0, chips0, song, songFor = SONG_FOR, cycle, target = -16, ceiling = -1, stems = false }) {
  const S = T.steps[2];
  const G0 = S.play - BAR * Math.floor(S.play / BAR); // the bar line every bar sits on: bar 11 is the song's downbeat
  const end = cycle + 0.3, n = Math.ceil(end * SR);
  const mk = () => new Bus(n);
  const b = { pad: mk(), keys: mk(), gtr: mk(), bass: mk(), drums: mk(), verb: mk(), post: mk(), pverb: mk(), ui: mk(), room: mk() };
  const r = rng(0x08050705);
  renderMusic(b, { G0, S, end }, r);
  renderSfx(b, { T, ask0, chips0, S }, r);

  eqBus(b.gtr, [['hp', 90, 0.7], ['peak', 220, 0.9, 1.5], ['peak', 1200, 1, 2], ['peak', 3000, 0.9, 2.5]]);
  eqBus(b.keys, [['hp', 170, 0.7]]);
  eqBus(b.pad, [['hp', 110, 0.7], ['lp', 6500, 0.7]]);
  eqBus(b.bass, [['hp', 36, 0.7], ['lp', 2500, 0.7]]);
  eqBus(b.drums, [['hp', 38, 0.7]]);
  eqBus(b.ui, [['hp', 60, 0.7]]);

  // the score: stems summed, ducked, glued, then gated off on the song's downbeat (its reverb tail fades just after)
  const music = mk();
  for (const k of ['pad', 'keys', 'gtr', 'bass', 'drums']) sum(music, b[k], db(MIX[k]));
  const ducks = [
    ...[ask0, ...T.steps].map((a) => [a.send + 0.02, -1.5, 0.04, 0.18, 0.3]),
    [T.done, -3, 0.02, 0.25, 0.45],
    [T.steps[1].done, -3.5, 0.02, 0.35, 0.45],
  ];
  applyCurve(music, duckCurve(n, ducks));
  const glueDb = glue(music, { thr: -12, ratio: 1.8 });
  fadeBetween(music, S.play - 0.012, S.play + 0.04);
  const wet = reverb(b.verb, 1.7, 5600);
  fadeBetween(wet, S.play, S.play + 0.35);

  const songBus = mk();
  if (song) placeSong(songBus, song, S, songFor);

  const mix = mk();
  sum(mix, music);
  sum(mix, wet, db(MIX.verb));
  sum(mix, b.post, db(MIX.post));
  sum(mix, reverb(b.pverb, 2.2, 6000), db(MIX.pverb));
  sum(mix, b.ui, db(MIX.ui));
  sum(mix, reverb(b.room, 0.7, 8000, 0.008), db(MIX.room));
  sum(mix, songBus, db(MIX.song));
  eqBus(mix, [['hp', 24, 0.7]]);
  // a clean tail: everything is down to silence by `end`
  fadeBetween(mix, cycle - 0.5, end);

  const report = master(mix.L, mix.R, { target, ceiling });
  const part = (a, z) => +integrated(mix.L.subarray(Math.round(a * SR), Math.round(z * SR)), mix.R.subarray(Math.round(a * SR), Math.round(z * SR))).toFixed(1);
  report.glueDb = +glueDb.toFixed(2);
  report.grid = { G0: +G0.toFixed(4), bpm: 60 / (BAR / 4) };
  report.sections = { intro: part(0, ask0.send), score: part(ask0.send, S.play), song: part(S.play, S.cut), end: part(S.cut, cycle) };
  if (stems) report.shortTerm = shortTerm(mix.L, mix.R, 0.5);
  return { L: mix.L, R: mix.R, sr: SR, report };
}