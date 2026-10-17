// The multicat spot's score: an original indie-pop cue in B major at 120 bpm, written on the ElevenLabs song's own grid
// so it hands over to the song on a downbeat. The bar lines sit at G0 + 2n s, G0 chosen so bar 11's downbeat is the song's
// first beat (the play press, S.play); every other cue then lands where the chain puts it:
//   pre   0 .. G0     pad swells up out of the black
//   0     intro       pad and the "tiptoe" pizzicato motif (a cat sneaking), bell on the one; the first ask types
//   1-2   groove A    kick, bouncy bass, strummed guitar and shaker come in with the first send
//   3     groove A+   claps on 2 and 4
//   4-7   hook        the marimba hook over the full groove; bar 5 stops on beat 4, where Meshy's model lands
//   8-9   groove B    tiptoe returns, the hook answers on bells; the riser starts halfway through bar 9
//   10    build       snare roll and an arpeggio over E, F#sus4, F#; the band drops out on beat 4 (the song card lands)
//   11    the song    the score is gone; a soft crash and sub mark the song's first downbeat
//   end   sting       the superbot logo sting on the mascot's pop: a chord, a three-note mnemonic, a pad bloom, a tail
// Chords run I-vi-IV-V (B, G#m, E, F#). Instruments are the synths in multicat-dsp.08050705.js.
import { mtof, place, placeStereo, padVoice, mallet, bell, pluck, bassNote, kick, clap, snare, shaker, tambourine, crash, impact, swell, sweep } from './multicat-dsp.08050705.js';

export const BPM = 120, BEAT = 60 / BPM, BAR = 4 * BEAT;

// per chord: bass root, pad voicing (led smoothly bar to bar), guitar strum voicing, the tiptoe motif on 8ths (null rests)
const CH = {
  B:    { bass: 35, pad: [59, 63, 66, 73], gtr: [47, 54, 59, 63, 66, 71], tip: [71, null, 75, null, 78, 80, 78, 75] },
  Gsm:  { bass: 32, pad: [59, 63, 68, 70], gtr: [44, 51, 56, 59, 63, 68], tip: [68, null, 71, null, 75, 76, 75, 71] },
  E:    { bass: 40, pad: [59, 64, 68, 71], gtr: [40, 47, 52, 56, 59, 64], tip: [64, null, 68, null, 71, 73, 71, 68] },
  Fs:   { bass: 42, pad: [58, 61, 66, 68], gtr: [42, 49, 54, 58, 61, 66], tip: [66, null, 70, null, 73, 75, 73, 70] },
  Fsus: { bass: 42, pad: [59, 61, 66, 68], gtr: [42, 49, 54, 59, 61, 66], tip: [66, null, 71, null, 73, 75, 73, 71] },
};
const PROG = ['B', 'Gsm', 'E', 'Fs'];
// the marimba hook, bars 4-7: [8th, midi]
const HOOK = [
  [[0, 78], [1, 83], [2, 85], [3, 83], [4, 87], [6, 85], [7, 83]],
  [[0, 80], [2, 78], [3, 80], [4, 83], [6, 80], [7, 78]],
  [[0, 76], [2, 80], [3, 83], [4, 85], [6, 83], [7, 80]],
  [[0, 82], [2, 85], [3, 82], [4, 78], [7, 73]],
];

// the score into the buses `b` (pad, keys, gtr, bass, drums: gated off at the song; post: from the song on; verb and pverb:
// their reverb sends) from the grid's G0; `S` the song step
export function renderMusic(b, { G0, S, end }, r) {
  const at = (bar, e8 = 0) => G0 + bar * BAR + e8 * (BEAT / 2);
  const NB = Math.round((S.play - G0) / BAR); // bars before the song: 11
  const chordOf = (bar) => PROG[bar % 4];

  // ---------- pad: the pre-roll swell, then a chord a bar; stereo from two decorrelated voices ----------
  const padChord = (notes, t, dur, gain, o = {}) => {
    for (const m of notes) {
      const l = padVoice(mtof(m), dur, { detune: 6, r, ...o }), rr = padVoice(mtof(m), dur, { detune: 9, r, ...o });
      placeStereo(b.pad, [l, rr], t, gain);
      placeStereo(b.verb, [l, rr], t, gain * 0.35);
    }
  };
  padChord(CH.B.pad, 0, G0 + BAR, 0.05, { atk: 1.2, cut0: 300, cut1: 1600 });
  for (let bar = 1; bar < NB; bar++) {
    const last = bar === NB - 1;
    const g = bar < 4 ? 0.045 : 0.038;
    if (!last) padChord(CH[chordOf(bar)].pad, at(bar), BAR - 0.05, g, { atk: 0.12, rel: 0.5, cut0: 900, cut1: 2000 });
    else {
      // the build bar opens its filter wide as the riser climbs, and is cut on the song's downbeat
      padChord(CH.E.pad, at(bar), BEAT * 2, g, { atk: 0.1, rel: 0.25, cut0: 1200, cut1: 3200 });
      padChord(CH.Fsus.pad, at(bar, 4), BEAT * 0.95, g * 1.1, { atk: 0.05, rel: 0.12, cut0: 2600, cut1: 4800 });
      padChord(CH.Fs.pad, at(bar, 6), BEAT - 0.06, g * 1.2, { atk: 0.04, rel: 0.05, cut0: 4000, cut1: 7000 });
    }
  }

  // ---------- tiptoe pizzicato: bars 0-3 and 8-9 ----------
  const tiptoe = (bar, chord, gain) => CH[chord].tip.forEach((m, e) => {
    if (m === null) return;
    const s = pluck(mtof(m), { t60: 0.28, bright: 0.72, pick: 0.13, r });
    place(b.keys, s, at(bar, e), gain * (e % 2 ? 0.75 : 1), 0.32);
    place(b.verb, s, at(bar, e), gain * 0.25, 0.32);
  });
  tiptoe(0, 'B', 0.3);
  for (const bar of [1, 2, 3]) tiptoe(bar, chordOf(bar), 0.28);
  for (const bar of [8, 9]) tiptoe(bar, chordOf(bar), 0.24);
  const bl0 = bell(mtof(83), { decay: 1.6, r });
  place(b.keys, bl0, at(0), 0.1, -0.2); place(b.verb, bl0, at(0), 0.12, -0.2);

  // ---------- marimba hook (bars 4-7), doubled on bells from bar 6; bell answers in bars 8-9 ----------
  HOOK.forEach((line, i) => line.forEach(([e, m]) => {
    // the marimba plays it in its warm fourth octave; the bells double it an octave up
    const t = at(4 + i, e), s = mallet(mtof(m - 12), { decay: 0.55, r });
    place(b.keys, s, t, 0.135, 0.12); place(b.verb, s, t, 0.06, 0.12);
    if (i >= 2) { const bb = bell(mtof(m), { decay: 0.7, r }); place(b.keys, bb, t, 0.04, -0.25); place(b.verb, bb, t, 0.045, -0.25); }
  }));
  // bar 8 leaves beats 3-4 to the order's chime; bar 9 answers with the hook's opening
  for (const [bar, line] of [[8, HOOK[0].slice(0, 4)], [9, HOOK[1].slice(0, 3)]]) line.forEach(([e, m]) => {
    const bb = bell(mtof(m), { decay: 0.9, r });
    place(b.keys, bb, at(bar, e + (bar === 9 ? 4 : 0)), 0.07, -0.3); place(b.verb, bb, at(bar, e + (bar === 9 ? 4 : 0)), 0.08, -0.3);
  });
  // the build's arpeggio: 16ths climbing through E, F#sus4, F#, stopping at beat 4
  const arp = [...[64, 68, 71, 76, 80, 83, 76, 80].map((m) => [m, 'E']), ...[66, 71, 73, 78].map((m) => [m, 'Fsus']), ...[78, 82, 85, 90].map((m) => [m, 'Fs'])];
  arp.slice(0, 12).forEach(([m], i) => {
    const t = at(NB - 1, i / 2), s = mallet(mtof(m), { decay: 0.3, r });
    place(b.keys, s, t, 0.13 + i * 0.006, i % 2 ? 0.3 : -0.1); place(b.verb, s, t, 0.08, 0);
  });

  // ---------- bass: bars 1-10 ----------
  const bassPat = (bar) => (bar < 3 ? [[0, 0, 0.45], [3, 0, 0.2], [4, 0, 0.45], [7, 12, 0.18]] : [[0, 0, 0.22], [2, 12, 0.16], [3, 0, 0.18], [4, 0, 0.22], [6, 12, 0.16], [7, 7, 0.16]]);
  for (let bar = 1; bar < NB; bar++) {
    const build = bar === NB - 1;
    for (const [e, iv, d] of bassPat(bar)) {
      if (bar === 5 && e === 7) continue; // the stop on beat 4 rests its "and"
      if (build && e >= 6) continue;
      const root = build ? (e < 4 ? CH.E.bass : CH.Fs.bass) : CH[chordOf(bar)].bass;
      const dur = bar === 5 && e === 6 ? 0.4 : d;
      place(b.bass, bassNote(mtof(root + iv), dur, { r }), at(bar, e), 0.34);
    }
  }

  // ---------- strummed guitar: down on 1, down-up on 2, up on 3&, down-up on 4 ----------
  const strum = (notes, t, dir, gain, ring = 0.55) => {
    const ns = dir > 0 ? notes : [...notes].reverse().slice(0, 4);
    ns.forEach((m, i) => {
      const s = pluck(mtof(m), { t60: ring, bright: 0.55 + (m - 40) / 120, pick: 0.2, dur: ring * 1.2, r });
      place(b.gtr, s, t + i * (dir > 0 ? 0.011 : 0.008), gain * (dir > 0 ? 1 : 0.7) * (0.85 + 0.3 * r()), -0.38 + (i / ns.length) * 0.16);
    });
  };
  const STRUM = [[0, 1], [2, 1], [3, -1], [5, -1], [6, 1], [7, -1]];
  for (let bar = 1; bar < NB; bar++) {
    const build = bar === NB - 1;
    for (const [e, dir] of build ? [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1]] : STRUM) {
      if (bar === 5 && e === 7) continue;
      const chord = build ? (e < 4 ? CH.E : CH.Fsus) : CH[chordOf(bar)];
      const ring = bar === 5 && e === 6 ? 1.1 : 0.42;
      strum(chord.gtr, at(bar, e), dir, (bar < 3 ? 0.05 : 0.06) * (build ? 0.8 + e * 0.06 : 1), ring);
    }
  }

  // ---------- drums ----------
  const dr = (s, t, g, pan = 0, verb = 0) => { place(b.drums, s, t, g, pan); if (verb) place(b.verb, s, t, g * verb, pan); };
  for (let bar = 1; bar < NB; bar++) {
    const build = bar === NB - 1, full = bar >= 4 && bar <= 9;
    const kicks = build ? [0, 2, 4] : full ? [0, 3, 4] : [0, 4];
    for (const e of kicks) { if (bar === 5 && e === 4) continue; dr(kick({ r }), at(bar, e), 0.55); }
    if (bar >= 3 && !build) for (const e of [2, 6]) { if (bar === 5 && e === 6) continue; dr(clap({ r }), at(bar, e), 0.32, 0, 0.35); }
    if (bar >= 6 && bar <= 9) for (const e of [2, 6]) dr(tambourine({ r }), at(bar, e), 0.1, -0.42);
    // shaker: 8ths in the quieter bars, 16ths with offbeat accents in the full ones, humanised by a few ms
    const steps = full ? 16 : 8;
    for (let k = 0; k < steps; k++) {
      const e8 = (k * 8) / steps;
      if (bar === 5 && e8 >= 6) break;
      if (build && e8 >= 6) break;
      const acc = steps === 16 ? (k % 4 === 2 ? 1 : k % 2 ? 0.45 : 0.7) : k % 2 ? 1 : 0.6;
      dr(shaker({ r }), at(bar, e8) + (r() - 0.5) * 0.006, 0.075 * acc, 0.45);
    }
  }
  // bar 5: snare 16ths into the stop on beat 4, where the model lands; the band hits it with a crash and kick
  for (const e of [4, 4.5, 5, 5.5]) dr(snare({ r }), at(5, e), 0.12 + (e - 4) * 0.06, 0, 0.2);
  dr(kick({ r }), at(5, 6), 0.6); dr(crash({ decay: 1.4, r }), at(5, 6), 0.11, 0.2, 0.3);
  dr(crash({ decay: 1.2, r }), at(4), 0.07, -0.2, 0.25); // the hook's entrance
  dr(crash({ decay: 1.2, r }), at(6), 0.06, -0.2, 0.25);
  // bar 10: snare 8ths then 16ths, rising, stopping before beat 4
  for (let e = 0; e < 6; e += e < 4 ? 1 : 0.5) dr(snare({ r }), at(NB - 1, e), 0.09 + e * 0.045, 0, 0.25);
  // the riser: band-passed noise climbing from the middle of bar 9 into the song's downbeat, a reversed cymbal on top
  const riseAt = at(NB - 2, 4);
  dr(sweep(S.play - riseAt, { f0: 250, f1: 9000, q: 2.2, peak: 0.97, curve: 1.3, r }), riseAt, 0.22, 0, 0.3);
  dr(swell(S.play - at(NB - 1, 4), { tone: 4500, pow: 2.6, r }), at(NB - 1, 4), 0.2, 0);

  // ---------- the song's downbeat: a soft crash and sub under its first beat ----------
  place(b.post, crash({ decay: 1.6, r }), S.play, 0.06, 0.15);
  place(b.post, impact({ f0: 66, f1: 44, tau: 0.35, r }), S.play, 0.22);

  // ---------- the logo sting on the mascot's pop ----------
  const pop = S.cut + 0.3;
  [71, 75, 78, 83].forEach((m, i) => {
    const s = mallet(mtof(m), { decay: 0.9, r });
    place(b.post, s, pop + i * 0.008, 0.16, -0.2 + i * 0.13); place(b.pverb, s, pop + i * 0.008, 0.12, 0);
  });
  strumSting(b, CH.B.gtr, pop, r);
  // the mnemonic: F#5, B5, D#6 on marimba doubled by bells, the last one held
  [[0, 78], [0.18, 83], [0.36, 87]].forEach(([dt, m], i) => {
    const s = mallet(mtof(m), { decay: i === 2 ? 1.2 : 0.6, r }), bb = bell(mtof(m + 12), { decay: i === 2 ? 2 : 0.9, r });
    place(b.post, s, pop + dt, 0.2, 0); place(b.post, bb, pop + dt, 0.06, 0.2);
    place(b.pverb, s, pop + dt, 0.16, 0); place(b.pverb, bb, pop + dt, 0.1, 0.2);
  });
  // the pad bloom, released so its tail is gone before the spot ends
  const bloom = Math.max(0.5, end - 1.6 - pop);
  for (const m of [47, 59, 63, 66, 73]) {
    const l = padVoice(mtof(m), bloom, { atk: 0.25, rel: 1.1, detune: 6, cut0: 1800, cut1: 2600, r }), rr = padVoice(mtof(m), bloom, { atk: 0.25, rel: 1.1, detune: 9, cut0: 1800, cut1: 2600, r });
    placeStereo(b.post, [l, rr], pop, 0.02); placeStereo(b.pverb, [l, rr], pop, 0.015);
  }
  place(b.post, impact({ f0: 64, f1: 46, tau: 0.38, r }), pop, 0.22);
  // glints as the wordmark sharpens: sparse high bells from the B major pentatonic, spread wide
  [[0.55, 95, -0.6], [0.72, 99, 0.5], [0.9, 102, -0.3], [1.1, 104, 0.6], [1.32, 99, -0.5]].forEach(([dt, m, pan]) => {
    const bb = bell(mtof(m), { decay: 0.8, r });
    place(b.post, bb, pop + dt, 0.035, pan); place(b.pverb, bb, pop + dt, 0.05, pan);
  });
}

// the sting's guitar: one bright down-strum of the B chord that rings
function strumSting(b, notes, t, r) {
  notes.forEach((m, i) => {
    const s = pluck(mtof(m), { t60: 1.6, bright: 0.75, pick: 0.18, dur: 2, r });
    place(b.post, s, t + i * 0.012, 0.06, -0.3 + i * 0.12);
  });
}
