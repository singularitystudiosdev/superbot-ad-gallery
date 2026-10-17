// The multicat score's cue sheet (score.83a92e2b.js): when every section, beat and sound effect falls, read off the spot's
// own clock (the engine's first ask, chat.9b47fc30.js, and the multicat beat's plan, beats/multicat.516afb1a.js times()),
// so a retimed spot moves its sound with it. The music is tempo-mapped to the picture: between each pair of reveals it
// takes the whole number of beats nearest the song's 120 bpm, so every reveal lands on a downbeat and the ElevenLabs song
// enters on the score's own grid. Pure data, no audio.
// the spot's clocks, handed over by the beat as it builds (setPlan): the engine's first route k, its send, the chain plan T,
// the chain's end (chatEnd), and the beat's TYPE_CPS, END_DELAY, FF_IN, SONG, SONG_FOR and SONG_FADE
let P = null;
export function setPlan(p) { P = p; }
export const plan = () => P;

const V = 'multicat';
const BEAT = 0.5;        // the song's beat (media/multicat.516afb1a/tiny-chaos.mp3: 120 bpm, beat one at 0 s)
const HOLD = 0.4;        // the scene's hold past the chat's end (scenes/tabs.9b47fc30.js dur)
// the engine's chip clock after a send (chat.9b47fc30.js typing, chipsAt) and the chip tile's pop (renderSwitch)
const SW_AFTER = 0.35, CHIP_DONE = 0.65, CHIP_POP = 0.05;
const WORD_AFTER = 0.3;  // the end card's wordmark starts this long after its mascot pops (multicat.516afb1a.js end card)
const HERO_AT = 0.2;     // the greeting fades in from 0.15 s (scenes/tabs.9b47fc30.js heroIn)
const PRESS = 0.015;     // the song's play button bottoms out at its play time; the click lands just before
const TICK_EVERY = 3;    // one key tick per this many typed characters: the asks type at 55 a second

// when character i (1-based) of an ask shows in the composer: chat.9b47fc30.js renderComposer rounds the typed count
const keyAt = (a, i) => a.s + (i - 0.5) * (a.typeEnd - a.s) / a.text.length;

// whole beats from a up to b, as near the song's tempo as fits
function beats(a, b) {
  const n = Math.max(1, Math.round((b - a) / BEAT)), p = (b - a) / n;
  return Array.from({ length: n }, (_, i) => a + i * p);
}

// the chord on beat i of a section: its progression a bar (4 beats) each, then its `last` chord over its final beats
export function chordAt(sec, i) {
  if (sec.last && i >= sec.beats.length - sec.last.beats) return sec.last.chord;
  return sec.chords[Math.floor(i / 4) % sec.chords.length];
}

export function cueSheet() {
  const { k, T, TYPE_CPS, END_DELAY, FF_IN } = P;
  const text = k.askBy[V], send = P.send, sw = send + SW_AFTER;
  const first = { kind: 'image', text, s: k.s, typeEnd: k.s + text.length / TYPE_CPS, send, chips: [{ sw, done: sw + CHIP_DONE }], card: T.card, gen0: T.gen0, done: T.done };
  const asks = [first, ...T.steps.map((st) => ({ kind: st.kind, text: st.ask, s: st.s, typeEnd: st.typeEnd, send: st.send, chips: st.chips, card: st.card, gen0: st.gen ? st.gen0 : null, done: st.done }))];
  const [M, O, S] = T.steps;
  const at = {
    send, image: T.done, model: M.done, order: O.done, play: S.play, cut: S.cut,
    pop: S.cut + END_DELAY, word: S.cut + END_DELAY + WORD_AFTER, end: P.chatEnd + HOLD,
  };

  // the reveals' grid; the build before the first reveal runs back from it at that section's beat, to just after the send
  const reveal = beats(at.image, at.model), walk = beats(at.model, at.order), order = beats(at.order, at.play);
  const p = reveal.length > 1 ? reveal[1] - reveal[0] : BEAT;
  const pre = [];
  for (let b = at.image - p; b > send; b -= p) pre.unshift(b);
  const sections = [
    { name: 'pre', beats: pre, t1: at.image, chords: ['G#m'], last: { chord: 'F#sus', beats: 2 } },
    { name: 'reveal', beats: reveal, t1: at.model, chords: ['E', 'B', 'F#sus', 'G#m'] },
    { name: 'walk', beats: walk, t1: at.order, chords: ['E', 'B', 'F#sus'] },
    { name: 'order', beats: order, t1: at.play, chords: ['G#m', 'E', 'F#sus'], last: { chord: 'F#', beats: 1 } },
  ];

  // every effect on the motion it scores
  const sfx = [{ kind: 'hero', at: HERO_AT }, { kind: 'camera', at: send - 0.08, dur: 0.8 }];
  for (const a of asks) {
    for (let i = 1; i <= a.text.length; i += TICK_EVERY) sfx.push({ kind: 'key', at: keyAt(a, i) });
    sfx.push({ kind: 'send', at: a.send });
    for (const c of a.chips) sfx.push({ kind: 'chip', at: c.sw + CHIP_POP }, { kind: 'check', at: c.done });
    sfx.push({ kind: 'card', at: a.card });
    if (a.gen0 !== null) sfx.push({ kind: 'gen', at: a.gen0 - FF_IN, until: a.done });
    sfx.push({ kind: 'land', what: a.kind, at: a.done });
  }
  sfx.push({ kind: 'play', at: at.play - PRESS }, { kind: 'swell', at: at.cut, until: at.pop }, { kind: 'sting', at: at.pop, until: at.end }, { kind: 'word', at: at.word });
  sfx.sort((x, y) => x.at - y.at);

  return { at, asks, sections, sfx, gen: { image: T.gen0 - FF_IN, model: M.gen0 - FF_IN, song: S.gen0 - FF_IN }, orderCard: O.card };
}
