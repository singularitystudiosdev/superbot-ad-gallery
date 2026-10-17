// The multicat spot's cue sheet: every sound and when it plays, in the spot's own seconds, laid out from the beat's plan
// (multicat.516afb1a.js plan(): the asks, chips, cards, landings, the song and the end card), so a retimed beat
// re-scores itself. transport.d8ff4cca.js plays it on the spot's clock; the voices are sfx.d8ff4cca.js.
//   The SFX sit on the picture: each lands on the frame its moment happens (a key, a send, a chip, a landing).
//   The bed is a minimal pulse at the song's tempo, 120 BPM in B major, phased so its bar lines meet the song's first
//   downbeat (the track's first beat is 0.205 s in, measured from tiny-chaos.mp3): it hands the song a bar it already
//   agrees with, breaks down for the last bar, and is out before the song plays. The song plays alone; the end card
//   gets a hit and a held chord.
import { NOTE as N, key, press, whoosh, chipIn, tick, ffTick, sub, edge, glass, shutter, chime, riser, kick, hat, bass, pad, pluck } from './sfx.d8ff4cca.js';

const BEAT = 0.5, BAR = 4 * BEAT, SIXTEENTH = BEAT / 4;
const SONG_BEAT = 0.205; // the song's first beat, seconds into the track
const KEY_GAP = 0.05;    // the typing's ticks thin to at most one per this, so a fast ask clicks and never buzzes
// the bar's chord, cycling by bar: Bmaj9, G#m9, Emaj9, F#9sus4. `pad` the held voicing, `root` the bass, `arp` the pluck
// notes, `glass` the landing chord's top
const CHORDS = [
  { pad: [N.B3, N.Ds4, N.Fs4, N.As4, N.Cs5], root: N.B2, arp: [N.B4, N.Ds5, N.Fs5, N.As5, N.Cs6], glass: [N.Fs5, N.B5, N.Ds6] },
  { pad: [N.Gs3, N.B3, N.Ds4, N.Fs4, N.As4], root: N.Gs2, arp: [N.Gs4, N.B4, N.Ds5, N.Fs5, N.As5], glass: [N.Ds5, N.Gs5, N.B5] },
  { pad: [N.E3, N.Gs3, N.B3, N.Ds4, N.Fs4], root: N.E2, arp: [N.Gs4, N.B4, N.Ds5, N.Fs5, N.Gs5], glass: [N.Gs5, N.B5, N.Ds6] },
  { pad: [N.Fs3, N.B3, N.Cs4, N.E4, N.Gs4], root: N.Fs2, arp: [N.Fs4, N.B4, N.Cs5, N.E5, N.Gs5], glass: [N.Fs5, N.B5, N.Cs6] },
];
// the arpeggio: a 3-3-2 figure in sixteenths per half bar, as [sixteenth, arp note]
const ARP = [[0, 0], [3, 2], [6, 3], [8, 1], [11, 2], [14, 4]];

// first: the engine's first ask ({ text, s, typeEnd, send, chips }); T: the beat's plan; ff: the x50 badge's lead-in
export function cueSheet(first, T, { ffIn }) {
  const [M, O, S] = T.steps;
  const cues = [];
  const at = (t, fn, hold = 0) => cues.push({ at: t, hold, fn });

  // ---- the grid: bars run back from the song's first downbeat, so bar `n` starts at bar0 + n * BAR
  const down = S.play + SONG_BEAT;
  const bar0 = down - BAR * Math.floor(down / BAR);
  const bars = Math.round((down - bar0) / BAR); // the bed's bars, 0 .. bars - 1; bar `bars` is the song's first
  const chordAt = (t) => CHORDS[((Math.floor((t - bar0) / BAR) % 4) + 4) % 4];
  const kickEnd = down - 2 * BEAT;   // the breakdown: the kick, bass and hats are out two beats before the song's downbeat
  const bedOut = S.play - 0.05;      // nothing in the bed starts after this

  // the pads: one held chord a bar (the first swells in under the greeting from 0), the last released before the song
  for (let n = 0; n < bars; n++) {
    const s = n === 0 ? 0 : bar0 + n * BAR, e = Math.min(bar0 + (n + 1) * BAR, S.play - 0.25), ch = CHORDS[n % 4];
    at(s, (v, when, into) => pad(v, when, (e - s - into) / v.rate, ch.pad, { attack: into > 0 ? 0.12 : n === 0 ? 1.2 : 0.25, release: n === bars - 1 ? 0.35 : 0.7, level: n === 0 ? 0.014 : 0.016 }), e - s);
  }
  // the pulse: from bar 1 a kick on the beat, hats on the off-eighths and the bass on every eighth (softer under the
  // kick, so it pumps); bar 0 has only a muffled off-beat bass under the typing. From bar 6 the arpeggio comes in and the
  // hats pick up ghost sixteenths
  for (let n = 0; n < bars; n++) {
    const b = bar0 + n * BAR, ch = CHORDS[n % 4];
    for (let i = 0; i < 8; i++) {
      const t = b + i * BEAT / 2, on = i % 2 === 0;
      if (t >= kickEnd) break;
      if (n === 0) { if (!on) at(t, (v, w) => bass(v, w, { midi: ch.root, level: 0.05, cutoff: 260, dur: 0.16 })); continue; }
      if (on) at(t, (v, w) => kick(v, w, { level: 0.2 }));
      else at(t, (v, w) => hat(v, w, { level: 0.05, seed: i + n * 8 }));
      at(t, (v, w) => bass(v, w, { midi: ch.root, level: on ? 0.045 : 0.075, cutoff: n < 6 ? 420 : 520 }));
      if (n >= 6) at(t + SIXTEENTH, (v, w) => hat(v, w, { level: 0.016, decay: 0.02, seed: 90 + i + n * 8 }));
    }
    if (n >= 6) for (const [six, note] of ARP) for (const half of [0, 8]) {
      const t = b + (six + half) * SIXTEENTH;
      if (t < bedOut - 0.15) at(t, (v, w) => pluck(v, w, { midi: ch.arp[note], level: 0.032, side: note % 2 ? 0.3 : -0.3 }));
    }
  }

  // ---- the asks: keys as each character lands in the composer (chat.9b47fc30.js renderComposer), the send press, and
  // the bubble rising into the thread
  const asks = [{ text: first.text, s: first.s, typeEnd: first.typeEnd, send: first.send }, ...T.steps.map((st) => ({ text: st.ask, s: st.s, typeEnd: st.typeEnd, send: st.send }))];
  asks.forEach((a, j) => {
    let last = -1;
    for (let i = 1; i <= a.text.length; i++) {
      const t = a.s + ((i - 0.5) / a.text.length) * (a.typeEnd - a.s);
      if (t - last < KEY_GAP) continue;
      last = t;
      const space = a.text[i - 1] === ' ', seed = i * 7 + j * 31;
      at(t, (v, w) => key(v, w, { level: 0.8 + 0.4 * ((seed * 13) % 10) / 10, seed, space }));
    }
    at(a.send, (v, w) => press(v, w));
    // the first send drops the composer and pulls the camera out: a longer, wider air
    if (j === 0) at(a.send - 0.08, (v, w) => whoosh(v, w, { dur: 0.62, peak: 0.42, level: 0.075, freq: 900 }));
    else at(a.send, (v, w) => whoosh(v, w, { dur: 0.3, peak: 0.35, level: 0.03, freq: 1600, from: 0.1, to: 0.3, seed: 13 + j }));
  });

  // ---- routing: a chip lands, then resolves to its check
  for (const c of [...first.chips, ...T.steps.flatMap((st) => st.chips)]) {
    at(c.sw, (v, w) => chipIn(v, w));
    at(c.done, (v, w) => tick(v, w));
  }

  // ---- the answers: each card rises in on a short air; each generation ticks fast-forward under the x50 badge; each
  // answer lands with a hit, its top chord taken from the bar it lands in. Every landing ducks the bed
  const ducks = [];
  for (const c of [T.card, M.card, O.card, S.card]) at(c, (v, w) => whoosh(v, w, { dur: 0.42, peak: 0.35, level: 0.04, freq: 1500, from: -0.1, to: 0.2, seed: 17 }));
  for (const [g0, done] of [[T.gen0, T.done], [M.gen0, M.done], [S.gen0, S.done]]) {
    for (let k = Math.ceil((g0 - ffIn - bar0) / SIXTEENTH); bar0 + k * SIXTEENTH < done - 0.04; k++) {
      at(bar0 + k * SIXTEENTH, (v, w) => ffTick(v, w, { accent: k % 4 === 0, seed: k }));
    }
  }
  // the photo: a shutter and a low hit
  at(T.done, (v, w) => { shutter(v, w); edge(v, w, { level: 0.08 }); sub(v, w, { level: 0.2, decay: 0.3 }); glass(v, w + 0.01, chordAt(T.done).glass, { level: 0.026, decay: 0.75 }); });
  // the 3D model: the weightiest landing
  at(M.done, (v, w) => { edge(v, w, { level: 0.1, freq: 3600 }); sub(v, w, { level: 0.25, decay: 0.42 }); glass(v, w + 0.01, chordAt(M.done).glass, { level: 0.03, decay: 1 }); });
  // the order: a two-note confirmation
  at(O.done, (v, w) => { edge(v, w, { level: 0.05, freq: 5000 }); chime(v, w, [N.Fs5, N.B5]); });
  // the song's card: a light landing, then the play press
  at(S.done, (v, w) => { edge(v, w, { level: 0.06 }); glass(v, w, chordAt(S.done).glass, { level: 0.02, decay: 0.5 }); });
  at(S.play, (v, w) => press(v, w, { level: 0.85 }));
  ducks.push(T.done, M.done, O.done, S.done);

  // ---- the end card: air builds as the chat fades to black, the mascot pops on a low hit and a held Bmaj9, and the
  // wordmark fades up on a soft shimmer (multicat.516afb1a.js END_DELAY and the wordmark's shift 0.3 s after the pop)
  const pop = S.cut + 0.3;
  at(pop - 0.5, (v, w) => riser(v, w, 0.5 / v.rate, { level: 0.08 }));
  at(pop, (v, w) => {
    edge(v, w, { level: 0.1, freq: 3200, decay: 0.02 });
    sub(v, w, { level: 0.22, decay: 1.5 });
    glass(v, w, [N.B4, N.Fs5, N.Cs6, N.Ds6], { level: 0.03, decay: 2.4, room: 0.7, spread: 0.8 });
  });
  at(pop, (v, w, into) => pad(v, w, (1.4 - into) / v.rate, CHORDS[0].pad, { attack: into > 0 ? 0.1 : 0.03, release: 2.6, level: 0.018, room: 0.5, out: v.sfx }), 1.4);
  at(pop + 0.3, (v, w) => { whoosh(v, w, { dur: 0.75, peak: 0.5, level: 0.032, freq: 2600, from: -0.3, to: 0.1, seed: 23 }); glass(v, w + 0.2, [N.Fs6, N.B6], { level: 0.012, decay: 1.1, room: 0.8 }); });

  cues.sort((a, b) => a.at - b.at);
  // the bed's lanes, [spot s, value] points: its level falls away as the song's card plays in, and its lowpass closes
  // over the breakdown bar
  const lanes = {
    level: [[0, 1], [S.play - 0.3, 1], [S.play + 0.05, 0]],
    cutoff: [[0, 16000], [bar0 + (bars - 1) * BAR, 16000], [S.play - 0.1, 1300]],
  };
  return { cues, lanes, ducks, grid: { bar0, bars, down } };
}
