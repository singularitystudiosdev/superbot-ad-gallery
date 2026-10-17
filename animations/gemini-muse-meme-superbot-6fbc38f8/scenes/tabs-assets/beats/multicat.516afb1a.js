// Multicat beat (the 'multicat' variant): four asks in one chat, each routed to a different tool. The engine types and
// routes the first ask ("Make me a realistic image of a cat", GPT Image 2) and this beat answers it; then it carries the
// chat on by itself: three more asks are typed into the composer, sent, routed (their chips land and resolve, the
// composer's platform chip follows) and answered, each in its own reply.
//   1. GPT Image 2: the photo lands as the 1-image card does (thumb-land.309eb9c5.js).
//   2. Meshy: the 3D model of that cat builds in the 3D variant's artifact frame, then walks on a turntable
//      (cat3d.516afb1a.js). Meshy made the mesh; its rigger takes humanoids only, so superbot rigged and keyed the walk
//      itself, and the chip after Meshy's says so.
//   3. DoorDash: a rebuilt Petco "Confirming your order" card for a real listing (img/multicat.516afb1a/CREDITS.txt).
//   4. ElevenLabs: the song generates under a skeleton, then plays: the real track (media/multicat.516afb1a/tiny-chaos.mp3) under its real waveform, the
//      sung line lighting word by word on its forced-alignment timings (multicat-data.516afb1a.js), and the audio itself
//      kept in step with the spot's clock while it runs; it plays through its second sung line, then fades out as
//   5. the house superbot.gg end card (the 16:9 cuts' ending: the wordmark, then the mascot) covers the chat.
// Under it all runs the soundtrack the Music pill picks (music.47e5d94a.js): 5 · Broadcast mix by default, an original
// score and effects with the song mixed in, rendered from this plan (multicat-mix.08050705.js, mountMix below); or none,
// the song alone on its own element.
// Every generation (the photo, the model, the song) waits under a skeleton whose bottom left pill counts the tool's real
// elapsed time, while an x50 badge sits in the frame's bottom right: the wait plays fast-forwarded (X, GEN).
// The follow-up messages are built here and moved in after the engine's reply on the first render (they ride in
// inst.nodes, so the engine's show() hides them under every other variant). The engine reads inst.asks (the composer's
// typing and send presses) and inst.chips (the platform chip's swaps) for them (chat.9b47fc30.js). A pure function of
// t, except the audio, which follows the clock and never drives it. Its stylesheet (../multicat.516afb1a.css) loads with
// the module.
// The 'multicat-credits' variant (`bare`, the named export) is the same chain with no model on show: no routing chips, no
// connect frame, no "<model> in superbot" reply headers (the engine routes it with no chips and keeps the composer on
// Superbot), each reply answering straight after its send; no tool logo on the generating pills, no credits, and a
// song card with neither its cover nor the sung line under it.
import { clamp, lerp, seg, outCubic, outQuint, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { LAND, landing, shimmer, settle } from './thumb-land.309eb9c5.js';
import { EXPAND, loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
// the Share control every output card carries (share.29a362ea.js)
import { shareBtn, shareDisc, SHARE_GLYPH, shareAttrs } from './share.29a362ea.js';
import { makeCatViewer } from './cat3d.516afb1a.js?v=1';
import { DUR, PEAKS, LINES, WORDS } from './multicat-data.516afb1a.js';
import { music } from '../../../music.47e5d94a.js?v=2';
// v5 on the Music pill: the broadcast mix, with the song mixed in
import { mountMix, mixOwnsSong } from './multicat-mix.08050705.js?v=3';
// v6-v17 on the Music pill: soundtracks made for the multicat cut alone, each mounted once from build() below
import { variant } from '../../../variant.9e82faf1.js?v=3';
import { mountScore as mountV6 } from '../../../score.535ee6dc.js';
import { cueSheet as cueSheetV7 } from './score.d8ff4cca.js';
import { makeTransport as makeTransportV7 } from './transport.d8ff4cca.js';
import { makeGate as makeGateV7 } from './sound-gate.d8ff4cca.js';
import { mountMusic as mountV8 } from '../../../music.28656fd8.js';
import { makeSound as makeSoundV9 } from './multicat-sound.c3e2b2aa.js';
import { makeSound as makeSoundV10 } from './multicat-sound.0db6a795.js';
import { cueSheet as cueSheetV11 } from './multicat-score.26a3dff0.js';
import { makeSound as makeSoundV11 } from './multicat-sound.26a3dff0.js';
import { makeScore as makeScoreV12 } from './multicat-score.436d3bf2.js';
import { mountSound as mountV13 } from '../../../sound.f1659cd2.js';
// v14 runs on its own (music.ff209337.js, index.html); v15's player too (score.83a92e2b.js), on the clocks handed over here
import { setPlan as setPlanV15 } from '../../../score-cues.83a92e2b.js?v=1';
import { makePlayer as makePlayerV16 } from './multicat-player.96834de7.js?v=2';
import { songLevel as songLevelV16 } from '../../../sound.96834de7.js?v=2';
import { makeSound as makeSoundV17 } from './multicat-sound.b9427543.js';

const CSS = new URL('../multicat.516afb1a.css?v=9', import.meta.url).href;
// the two variants this module answers: the base chain and its bare twin (the export `bare`)
export const ID = 'multicat', BARE_ID = 'multicat-credits';
const asset = (p) => new URL('../../../' + p, import.meta.url).href;
const CAT = asset('img/multicat.516afb1a/cat.jpg');
const COVER = asset('img/multicat.516afb1a/cover.jpg'); // the song's cover: that same cat, cropped to its face
const ORDER = asset('img/multicat.516afb1a/order-placed.jpg');
const MODEL = asset('models/cat-walk.516afb1a.glb');
const SONG = asset('media/multicat.516afb1a/tiny-chaos.mp3');
const STORE = 'https://www.doordash.com/convenience/store/25109364/';
const ORDER_ALT = 'DoorDash order placed: Confirming your order from Petco, one Purina Fancy Feast Seafood Classic Collection Broths Variety Pack (1.4 oz x 12 ct), $16.49 subtotal, $0.00 delivery fee';
const TITLE = 'Tiny Chaos';

export const TYPE_CPS = 55; // every ask types at this rate; the first one through its route's typeCps (chat.9b47fc30.js)
const CHIP_STRIDE = 0.77;  // the engine's routing chip clock (chat.9b47fc30.js chipsAt), so every chip lands alike
const SAY1 = 'Here’s your realistic cat.';
const IMAGE_HOLD = 1;       // the landed photo, from its settle to the next ask starting to type
// the generating cards run fast-forwarded X times (the frame's badge says so): each card's timer counts its tool's real
// wall-clock seconds, GEN, at X times the spot's clock, so its skeleton holds GEN / X seconds before the answer lands.
//   image: GPT Image 2 at medium quality, 40.5 to 52 s measured (ofox.ai 2026-09-07: 41.4 and 40.5 s;
//          simplemetrics.xyz: 42, 46 and 52 s), 47 s their mean
//   model: Meshy text to 3D, about 45 s for the preview mesh, then the texture pass (aigamingdev.com Meshy review,
//          hands-on: each generation under 90 s)
//   song:  ElevenLabs Music, 13.3 s for a 30 s track (Replicate elevenlabs/music); this one runs 32 s
const X = 50;
const FF_IN = 0.2; // the frame's badge fades in over this, full as a generation starts
// a card's rise and the feed's glide to it (enter, chat.9b47fc30.js renderScroll) both take this long: its generation, and
// its timer, start once it is in view, so a short one (the song's 0.28 s) never runs half under the composer
const SEEN = 0.45;
const GEN = { image: 47, model: 105, song: 14 };
const ORDER_LOAD = 0.58; // the order generates nothing: its confirmation lands this long after its card comes in
const PLAY_AFTER = 0.2;  // the song's play press, after its card lands
// how much of the song plays before the end card: through its second sung line ("...down the hall" ends at 4.92s); the
// audio then fades out under the card's cover
const SONG_FOR = 5.6;
// the house end card (superbot-muse-split.1d16d488/endcard.1d16d488.html, the 16:9 cuts' ending): the chat fades to its
// black over END_IN, the card's own 2.5s run starts END_DELAY in (mascot pops in, superbot.gg fades up beside it, hold)
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5;
const END_GAP = 44;    // the house card's gap between the wordmark and the 220px face, on a 1080-high stage
const SONG_FADE = 0.9; // the audio's fade-out as the card covers the chat
// the card's pop: an outBack with the house card's softer overshoot (1.4)
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
// the mascot face, verbatim from the house end card: the superbot cat's mask over its cyan and magenta offsets
const END_FACE = '<svg class="mc-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="mcEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#mcEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#mcEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#mcEndFace)"/></svg>';
// the turntable's angle as the 3D model lands, and its turn in rad/s: slow, so the walk stays near side-on, where a gait reads
const SPIN_LAND = -0.3, SPIN = 0.22;
// `credits`: what the generation charges until the user connects their own plan, priced as the single-tool cuts are
// (chat.9b47fc30.js creditsBy: '3d' 20, song 15; the first ask's 4 is the engine's); an order charges none.
// `gen`: the step's GEN entry, when it generates. `hold`: how long its landed answer shows before the next ask types
const STEPS = [
  { kind: 'model', ask: 'Make me an animated 3d model of a realistic cat', app: 'meshy', say: 'Here’s your cat as an animated 3D model.', gen: 'model', hold: 2.6, credits: 20,
    chips: [['meshy', 'Switching to Meshy'], ['superbot', 'Rigging and animating the cat', true]] },
  { kind: 'order', ask: 'Order me catfood from doordash', app: 'doordash', say: 'Your cat food has been ordered from Petco.', hold: 1.6, credits: 0,
    chips: [['doordash', 'Connecting to DoorDash']] },
  { kind: 'song', ask: 'Make me a song about cats', app: 'elevenlabs', say: 'Here’s an upbeat indie pop song about cats.', gen: 'song', hold: PLAY_AFTER + SONG_FOR + END_DELAY + END_LEN, credits: 15,
    chips: [['elevenlabs', 'Switching to ElevenLabs']] },
];

// a chip list on the engine's clock; `tool` chips (superbot's own rigging) leave the composer's platform chip alone
const chipsAt = (sw, list) => list.map(([app, label, tool], i) => { const at = sw + i * CHIP_STRIDE; return { app, label, tool: !!tool, sw: at, swap: at + 0.22, done: at + 0.65 }; });

// every time in the chain, laid end to end from the first reply r: each answer's card comes in at `card`, generates
// (its timer running) from `gen0` until `done`, and has landed by `w1`. `bare` drops the chips, so each reply comes
// where the first chip would have landed (the engine's own chipless route, chat.9b47fc30.js)
function plan(r, bare = false) {
  const card = r + 0.22, gen0 = card + SEEN, done = gen0 + GEN.image / X;
  const T = { r, card, gen0, done, w1: done + LAND, steps: [] };
  let s = T.w1 + IMAGE_HOLD;
  for (const st of STEPS) {
    const typeEnd = s + st.ask.length / TYPE_CPS, send = typeEnd + 0.15;
    const chips = bare ? [] : chipsAt(send + 0.35, st.chips);
    const rr = (chips.length ? chips[chips.length - 1].done : send + 0.35) + 0.08, at = rr + 0.22, g0 = at + SEEN;
    const fin = st.gen ? g0 + GEN[st.gen] / X : at + ORDER_LOAD, w1 = fin + LAND, play = w1 + PLAY_AFTER;
    T.steps.push({ ...st, s, typeEnd, send, chips, r: rr, card: at, gen0: g0, done: fin, w1, play, cut: play + SONG_FOR });
    s = w1 + st.hold;
  }
  T.end = s;
  return T;
}
// the chain's length from its first reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;
export const BARE_LEN = plan(0, true).end;

const DL_GLYPH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>';
const dl = (href, name) => `<a class="qc-dl" href="${href}" download="${name}" aria-label="Download image" title="Download">${DL_GLYPH}</a>`;
const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.2v13.6L19 12z"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
const DOWNLOAD = '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 19.5h14"/></svg>';
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// a generating card's pill in its bottom left: the app, what it makes, and its timer; `bare` leaves the app's tile out
const genl = (x, app, what, bare = false) => `<span class="qc-genl${bare ? ' mc-genl-bare' : ''}">${bare ? '' : x.tile(app)}${what}<b class="qc-genn">${clock(0)}</b></span>`;
// that pill at t: the timer counts the real seconds X times the clock's rate from `gen0`, rests on the full `real` from
// `done`, and the pill fades out as the answer lands (by w1). Returns how much the card is generating now, 0..1, which
// the frame's badge shows by
function genPill(box) {
  const pill = box.querySelector('.qc-genl'), num = pill.querySelector('.qc-genn');
  let shown = clock(0), op = '';
  return (t, gen0, done, w1, real) => {
    const s = clock(t >= done ? real : Math.max(0, t - gen0) * X);
    if (s !== shown) { num.textContent = s; shown = s; }
    const out = 1 - seg(t, w1 - 0.25, w1), o = out.toFixed(3);
    if (o !== op) { pill.style.opacity = o; op = o; }
    return seg(t, gen0 - FF_IN, gen0) * out;
  };
}

// the track's measured envelope as one filled shape: the top edge left to right, then the bottom edge back
const WAVE_D = (() => {
  const n = PEAKS.top.length;
  const y = (v, dir) => (50 + dir * Math.max(1.5, v) * 0.48).toFixed(1);
  let d = 'M0 50';
  for (let i = 0; i < n; i++) d += `L${i} ${y(PEAKS.top[i], -1)}`;
  for (let i = n - 1; i >= 0; i--) d += `L${i} ${y(PEAKS.bot[i], 1)}`;
  return `${d}Z`;
})();
const wave = (cls) => `<svg class="${cls}" viewBox="0 0 ${PEAKS.top.length - 1} 100" preserveAspectRatio="none" aria-hidden="true"><path d="${WAVE_D}"/></svg>`;
// each sung line's words, and when the line takes the lyric slot (just before its first word)
const LINE_WORDS = LINES.map((_, i) => WORDS.filter((w) => w[3] === i));
const LINE_AT = LINE_WORDS.map((ws) => ws[0][1] - 0.35);

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`multicat variant stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

// a block's entrance: it rises and settles in over 0.45s from `at` (the other beats' card entrance)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
  return ci;
}
const fade = (n, p) => { n.style.opacity = p.toFixed(3); n.style.visibility = p > 0 ? '' : 'hidden'; };

// the streamed line every reply opens with: the visible prefix, the rest held in place transparent
function sayEl(x, text) {
  const n = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  let shown = -1;
  return { n, render(t, at) {
    const c = streamCount(text, at + 0.06, 70, t);
    if (c !== shown) { n.firstElementChild.textContent = text.slice(0, c); n.lastElementChild.textContent = text.slice(c); shown = c; }
  } };
}

const make = (bare) => ({
  // `end` (the base route's end plus `extra`) is LEN (BARE_LEN) past r by construction, so the chain keeps its own clock
  times(r) { return plan(r, bare); },
  build(k, x) {
    loadSheet();
    loadFrameSheet();
    const T = k.T;
    const [M, O, S] = T.steps;
    const id = bare ? BARE_ID : ID;
    // v5's soundtrack: its cue sheet is this plan, plus the first ask and its chip as the engine times them (none, bare)
    mountMix({ id, cues: { T, ask0: { text: k.askBy[id], s: k.s, typeEnd: k.typeEnd, send: k.send }, chips0: k.chips }, song: SONG });
    // v6-v17: mounted on the base chain only (v16 on both, below), each plays only while it is the pick. songRules[pick] says whether that pick
    // plays the song itself (owned: the element below stays silent) or has muted it (muted); packRenders follow the clock
    const songRules = {}, packRenders = [];
    // picked through the Music pill (a gesture), a soundtrack whose own unlock missed that gesture may start now
    const activated = () => !!(navigator.userActivation && navigator.userActivation.hasBeenActive);
    if (!bare) {
      mountV6();
      // v7: SFX on the picture and a pulse bed at the song's tempo (score.d8ff4cca.js), played on the clock by its
      // transport behind its sound pill; that pill's mute mutes the song too
      const v7 = makeTransportV7(cueSheetV7({ text: k.askBy[ID], s: k.s, typeEnd: k.typeEnd, send: k.send, chips: k.chips }, T, { ffIn: FF_IN }), { active: () => variant() === ID && music() === 'v7' });
      makeGateV7(v7, ID);
      songRules.v7 = { muted: () => v7.muted };
      packRenders.push((t) => v7.sync(t));
      addEventListener('musicchange', () => { if (music() === 'v7' && activated()) v7.unlock(); });
      (window.__PICKS ||= {}).v7 = { ready: () => true, sounding: () => v7.sounding };
      // v8: a deep-house bed rendered from this plan (score.28656fd8.js), shipped as an MP3 while the cues still match; its
      // pill's mute mutes the song too
      const v8 = mountV8({ T, send: k.send, len: () => window.__AD.CYCLE });
      songRules.v8 = { muted: () => v8.off };
      // v9: a quiet bed and soft effects with the song mixed in, rendered from this plan into one buffer
      const v9 = makeSoundV9(T, { song: SONG, first: { s: k.s, typeEnd: k.typeEnd, send: k.send, chips: k.chips }, cps: TYPE_CPS, end: { delay: END_DELAY }, songFor: SONG_FOR, songFade: SONG_FADE });
      songRules.v9 = { owned: () => !v9.failed };
      packRenders.push((t) => (music() === 'v9' ? v9.sync(t) : v9.idle()));
      // v10: a tight, tempo-locked bed and crisp effects synthesized live from this plan; no song element (it keeps its own
      // output), its pill's mute mutes the song through songRules
      const v10 = makeSoundV10(k, T, { ask: k.askBy[ID], song: null, songSrc: SONG, songAt: S.play, songFadeAt: S.play + SONG_FOR, songFadeEnd: S.play + SONG_FOR + SONG_FADE, endPop: S.cut + END_DELAY });
      songRules.v10 = { muted: () => v10.muted };
      packRenders.push((t) => v10.render(t));
      // v11: a broadcast-style score rendered in a worker from this plan; the song stays on its element, trimmed to sit
      // level with the bed and faded on its own curve (songRules trim)
      const v11 = makeSoundV11(cueSheetV11(k, T, { cps: TYPE_CPS, endDelay: END_DELAY }));
      songRules.v11 = { trim: (el, at) => v11.trim(el, at, SONG_FOR) };
      packRenders.push((t, running) => v11.sync(t, running));
      // v12: one clean bed with a hit on every landing and the song riding in it, rendered from this plan (it plays at 1x
      // only); the end card's pop, its wordmark 0.3 s on, and the spot's last frame 0.7 s past the chain
      const popV12 = S.cut + END_DELAY;
      const v12 = makeScoreV12({ T, send: k.send, swap: k.chips[0].swap, pop: popV12, word: popV12 + 0.3, end: T.end + 0.7, song: SONG });
      songRules.v12 = { owned: () => !v12.failed };
      packRenders.push((t) => (music() === 'v12' ? v12.sync(t) : v12.idle()));
      // v13: a crisp, tight mix (bed, effects and the song, mastered) rendered offline from this route; it follows the clock
      // on its own frame loop
      const v13 = mountV13({ route: { ask: k.askBy[ID], s: k.s, typeEnd: k.typeEnd, send: k.send, chips: k.chips, T }, song: SONG, songFor: SONG_FOR, songFade: SONG_FADE, endDelay: END_DELAY });
      songRules.v13 = { owned: () => !v13.failed };
      // v15: a cool, polished score whose player (score.83a92e2b.js) reads this chain's clocks; it carries the song once
      // its whole render is in. The chain's end is the engine's (chat.9b47fc30.js chatEnd: the plan's end and 0.3 s)
      setPlanV15({ k, send: k.send, T, chatEnd: T.end + 0.3, TYPE_CPS, END_DELAY, FF_IN, SONG, SONG_FOR, SONG_FADE });
      songRules.v15 = { owned: () => !!(window.__SCORE_V15 && window.__SCORE_V15.ownsSong) };
      // v17: sharp synthesized effects on every event and a B major bed that clears out on the song's first beat, then the
      // end card's chord; the song plays on its element at 0.75 (about 6 LU over the groove) and follows the pill's mute
      const v17 = makeSoundV17({
        first: { text: k.askBy[ID], s: k.s, typeEnd: k.typeEnd, send: k.send, chips: k.chips },
        T, endDelay: END_DELAY, endLen: END_LEN,
        song: { url: SONG, at: S.play, gain: 0.75, fadeAt: S.play + SONG_FOR, fadeLen: SONG_FADE, stopAt: S.play + Math.min(DUR, SONG_FOR + SONG_FADE) },
      });
      songRules.v17 = { muted: () => v17.muted, trim: (el) => { el.volume *= 0.75; } };
      packRenders.push((t) => { if (music() === 'v17') v17.sync(t); });
    }
    // v16, on both chains (the bare multicat-credits cut plays it by default, music.47e5d94a.js DEFAULTS): a tight, punchy,
    // premium score rendered from this chain's cue sheet (the engine's first ask, k, and this plan, T; bare has no chips);
    // the song plays on its element at 0.9 (its -14.1 LUFS to the score's -15) and follows the sound pill's mute
    const v16 = makePlayerV16({
      typing: [{ text: k.askBy[id], s: k.s, end: k.typeEnd }, ...T.steps.map((st) => ({ text: st.ask, s: st.s, end: st.typeEnd }))],
      sends: [k.send, ...T.steps.map((st) => st.send)],
      camera: k.send, // the first send drops the composer and pulls the camera out (tabs.9b47fc30.js)
      resolved: [...k.chips.map((c) => c.done), ...T.steps.flatMap((st) => st.chips.map((c) => c.done))],
      cards: [T.card, ...T.steps.map((st) => st.card)],
      gens: [[T.gen0, T.done], ...T.steps.filter((st) => st.gen).map((st) => [st.gen0, st.done])],
      image: T.done, model: M.done, order: O.done, play: S.play,
      cover: S.cut, pop: S.cut + END_DELAY, word: S.cut + END_DELAY + 0.3, end: T.end,
    }, id);
    songRules.v16 = { trim: (el) => { el.volume *= 0.9 * songLevelV16(); } };
    packRenders.push((t) => (music() === 'v16' ? v16.sync(t) : v16.stop()));
    addEventListener('variantchange', () => v16.stop());

    // 1. GPT Image 2, in the engine's own reply
    const say1 = sayEl(x, SAY1);
    const media1 = x.el(`<div class="qc-media"><div class="qc-img qc-skel mc-img"><img src="${CAT}" width="1536" height="1152" alt="A photorealistic brown tabby cat standing side-on, looking at the camera"/><i class="qc-sk"></i>${genl(x, 'gptimage', 'Creating image', bare)}${shareDisc('Realistic cat', { file: CAT })}${dl(CAT, 'cat.jpg')}</div></div>`);
    const card1 = media1.firstElementChild;
    const im1 = card1.querySelector('img'), sk1 = card1.querySelector('.qc-sk'), gen1 = genPill(card1);
    const dl1 = card1.querySelector('.qc-dl'), share1 = card1.querySelector('.qc-share');
    // bare: the feed glides to a zero-height anchor a little under each answer's card instead of the card's own bottom,
    // so the newest card clears the feed's clip with its edge and shadow (../multicat.516afb1a.css .mc-anchor)
    const anchor = () => (bare ? x.el('<i class="mc-anchor" aria-hidden="true"></i>') : null);
    const anchor1 = anchor();

    // 2-4: each ask's user bubble, its chip rows and its reply
    const follow = [];
    const steps = T.steps.map((st) => {
      const u = x.el(`<div class="msg qc-u"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(st.ask)}</div></div></div>`);
      const rows = st.chips.map((c) => {
        const w = x.el(`<div class="msg qc-m">${x.sbAvatar}<div class="m-main"><span class="qc-sw">${x.tile(c.app)}<span class="qc-swl">${x.esc(c.label)}</span><span class="qc-st"><i class="qc-spin"></i>${x.OK}</span></span></div></div>`);
        return { c, w, sw: w.querySelector('.qc-sw'), spin: w.querySelector('.qc-spin'), ok: w.querySelector('.qc-st .qc-ok') };
      });
      // the credits frame under the resolved chips, the engine's (chat.9b47fc30.js credits), tiled with the answering app;
      // bare shows none
      const credits = st.credits && !bare ? x.el(`<div class="msg qc-m">${x.sbAvatar}<div class="m-main"><span class="qc-cr">${x.tile(st.app)}<span class="qc-cr-t">Credits used until you connect</span><span class="qc-cr-n">${st.credits} credits</span><button type="button" class="qc-cr-b">Connect</button></span></div></div>`) : null;
      const reply = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main">${bare ? '' : `<div class="qc-who">${x.who(st.app)}</div>`}</div></div>`);
      const say = sayEl(x, st.say);
      reply.lastElementChild.append(say.n);
      follow.push(u, ...rows.map((rw) => rw.w), ...(credits ? [credits] : []), reply);
      return { st, u, rows, credits, creditsAt: credits ? st.chips[st.chips.length - 1].done + 0.1 : 0, reply, who: reply.querySelector('.qc-who'), say };
    });
    const [mStep, oStep, sStep] = steps;

    // 2. Meshy's model in the 3D variant's artifact frame
    const model = x.el(`<div class="bk mc-3d"><div class="bk-head"><b class="bk-title">Cat 3D model<small>Animated · GLB</small></b>${shareBtn('Cat 3D model', { file: MODEL })}${EXPAND}<a class="bk-btn bk-publish" href="${MODEL}" download="cat.glb">${DL_GLYPH}Download</a></div><div class="bk-view qc-3d qc-skel"><canvas width="1400" height="875" role="img" aria-label="Animated 3D cat model walking on a turntable"></canvas><i class="qc-sk"></i>${genl(x, 'meshy', 'Creating 3D model', bare)}</div></div>`);
    mStep.reply.lastElementChild.append(model);
    mStep.out = model;
    const canvas = model.querySelector('canvas'), skM = model.querySelector('.qc-sk'), genM = genPill(model);

    // 3. the DoorDash order, framed as the doordash variant's is
    const order = x.el(`<div class="bk mc-dd"><div class="bk-head"><b class="bk-title">Petco order<small>1 item · $16.49 subtotal</small></b>${shareBtn('Petco order')}<a class="bk-btn bk-publish mc-dd-open" href="${STORE}" target="_blank" rel="noopener noreferrer"><img src="${x.brand('doordash-logo.svg')}" alt="">View in DoorDash</a></div><div class="bk-view"><div class="mc-dd-cam"><div class="mc-dd-zoom"><img class="mc-dd-shot" src="${ORDER}" width="896" height="560" alt="${x.esc(ORDER_ALT)}"></div></div><i class="bk-sh"></i></div></div>`);
    oStep.reply.lastElementChild.append(order);
    oStep.out = order;
    const zoom = order.querySelector('.mc-dd-zoom'), shO = order.querySelector('.bk-sh');

    // 4. the ElevenLabs track
    const song = x.el(`<div class="mc-sg${bare ? ' mc-sg-bare' : ''}"><div class="mc-sg-card">
      ${bare ? '' : `<div class="mc-sg-art"><img src="${COVER}" width="256" height="256" alt="Cover art: the cat from the first answer"/></div>`}
      <div class="mc-sg-side">
        <div class="mc-sg-t"><b>${TITLE}</b><small>Indie pop · ElevenLabs Music</small></div>
        <div class="mc-sg-row"><span class="mc-sg-btn">${PLAY}${PAUSE}</span><div class="mc-sg-wave">${wave('mc-w0')}${wave('mc-w1')}</div><span class="mc-sg-time">${clock(0)} / ${clock(DUR)}</span></div>
      </div>
      <button type="button" class="mc-sg-share" ${shareAttrs(`${TITLE}, a song about cats`, { file: SONG })}>${SHARE_GLYPH}</button>
      <a class="mc-sg-dl" href="${SONG}" download="tiny-chaos.mp3" aria-label="Download" title="Download">${DOWNLOAD}</a>
      <div class="mc-sg-gen qc-skel"><i class="qc-sk"></i>${genl(x, 'elevenlabs', 'Creating song', bare)}</div>
    </div>${bare ? '' : '<div class="mc-ly" aria-live="off"></div>'}</div>`);
    sStep.reply.lastElementChild.append(song);
    sStep.out = song;
    for (const p of steps) { p.anchor = anchor(); if (p.anchor) p.reply.lastElementChild.append(p.anchor); }
    const $ = (s) => song.querySelector(s);
    const btn = $('.mc-sg-btn'), time = $('.mc-sg-time'), played = $('.mc-w1'), lyric = $('.mc-ly');
    const skelS = $('.mc-sg-gen'), skS = $('.mc-sg-gen .qc-sk'), genS = genPill(skelS);
    const [playIcon, pauseIcon] = btn.querySelectorAll('svg');
    // Space and Enter press the cards' controls, not the spot's clock (timeline.9b47fc30.js), as on the other beats
    for (const n of [media1, model, order, song]) n.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('a, button')) e.stopPropagation(); });

    // the end card: the house superbot.gg lockup, the wordmark left and the mascot face right, over the spot's black. It
    // rides in nodes (so other variants hide it) and moves to the scene section on the first render, above the hub
    const endCard = x.el(`<div class="mc-end" role="img" aria-label="superbot.gg"><div class="mc-end-word"><b>superbot.gg</b></div><div class="mc-end-bot">${bare ? END_FACE.replaceAll('mcEndFace', 'mcEndFaceBare') : END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.mc-end-word'), endBot = endCard.querySelector('.mc-end-bot');
    // the fast-forward badge, x50 over the whole frame's bottom right while any generation runs; it rides in nodes and
    // moves to the scene section as the end card does
    const ff = x.el(`<div class="mc-ff" aria-hidden="true">x${X}</div>`);
    let endK = 1; // the lockup's scale now applied (--k)

    // whether the spot's clock runs: the timeline says so (__AD.playing); failing that, it moved lately by about a frame's step
    let lastT = null, movedAt = -1, lastStep = 0;
    function clockRuns(t) {
      const now = performance.now();
      if (lastT !== null && t !== lastT) { lastStep = t - lastT; movedAt = now; }
      lastT = t;
      const ad = window.__AD;
      const moving = now - movedAt < 400 && lastStep > 0 && lastStep < 0.2;
      return !document.body.classList.contains('freeze') && (ad && typeof ad.playing === 'boolean' ? ad.playing : moving);
    }

    // the song's audio follows the clock: it plays while the clock runs through the play window, at the clock's speed. Its
    // file loads on the route's first render, so the play press never waits on the network
    const audio = new Audio();
    audio.preload = 'auto';
    let blocked = false;
    const unblock = () => { blocked = false; };
    addEventListener('variantchange', () => audio.pause());
    // the gallery lightbox's nudge (a click in its chrome): the song may try again
    addEventListener('message', (e) => { if (e.data && e.data.type === 'unmute') unblock(); });
    function syncAudio(t, running) {
      // a pick that carries the song in its own mix (v5, and any songRules owner) keeps this element silent under it
      const pick = music(), rule = songRules[pick];
      if ((pick === 'v5' && mixOwnsSong()) || (rule && rule.owned && rule.owned())) { if (!audio.paused) audio.pause(); return; }
      const muted = !!(rule && rule.muted && rule.muted());
      if (audio.muted !== muted) audio.muted = muted;
      const at = t - S.play;
      if (!running || at < 0 || at >= Math.min(DUR, SONG_FOR + SONG_FADE)) { if (!audio.paused) audio.pause(); return; }
      // it fades out as the end card covers the chat, evenly in dB (to -40 dB), so the cut never lands mid-note
      audio.volume = Math.pow(0.01, seg(at, SONG_FOR, SONG_FOR + SONG_FADE));
      // a pick that sets the song's level in its own mix (songRules trim) has the last word
      if (rule && rule.trim) rule.trim(audio, at);
      const rate = (window.__AD && window.__AD.speed) || 1;
      if (audio.playbackRate !== rate) audio.playbackRate = rate;
      if (Math.abs(audio.currentTime - at) > 0.3) audio.currentTime = at;
      if (audio.paused && !blocked) {
        audio.play().catch((e) => {
          // autoplay with sound waits for a gesture: the next click or key lets it start
          blocked = true;
          console.warn('multicat: the song waits for a click or key to play (autoplay policy)', e);
          addEventListener('pointerdown', unblock, { once: true });
          addEventListener('keydown', unblock, { once: true });
        });
      }
    }

    // QA: the pick and this route's song element against the clock (__AD arrives after the timeline's first frame)
    const sound = () => ({ t: window.__AD.now, music: music(), song: { paused: audio.paused, at: +audio.currentTime.toFixed(3), volume: +audio.volume.toFixed(3) } });
    let placed = false, viewer = null, decoding = false, sec = -1, cut = -1, playing = null, line = -1, lit = -1;
    return {
      nodes: [say1.n, media1, ...(anchor1 ? [anchor1] : []), ...follow, endCard, ff],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[T.r, say1.n], [T.card, anchor1 || media1], ...steps.flatMap((p) => [[p.st.send, p.u], ...p.rows.map((rw) => [rw.c.sw, rw.w]), ...(p.credits ? [[p.creditsAt, p.credits]] : []), ...(p.who ? [[p.st.r, p.who]] : []), [p.st.r, p.say.n], [p.st.card, p.anchor || p.out]])],
      // the follow-up asks, typed into the composer and sent by the engine (renderComposer), and their chips, which move
      // the composer's platform chip (renderRouting)
      asks: T.steps.map((st) => ({ text: st.ask, s: st.s, typeEnd: st.typeEnd, send: st.send })),
      chips: T.steps.flatMap((st) => st.chips),
      render(t) {
        if (!placed) {
          // the follow-ups leave the engine's reply for the feed, in order right after it
          let at = say1.n.closest('.msg');
          for (const m of follow) { at.after(m); at = m; }
          // the end card leaves the hub for the scene section: stage px, unscaled by the hub's camera
          x.hub.closest('.scene').append(endCard, ff);
          audio.src = SONG;
          placed = true;
        }
        if (window.__AD && window.__AD.sound !== sound) window.__AD.sound = sound;
        if (!decoding) {
          decoding = true;
          // bare's song card has no cover, so no third picture
          for (const pic of [im1, order.querySelector('img'), song.querySelector('img')].filter(Boolean)) {
            track(pic.decode().catch((e) => console.error(new Error(`multicat image failed to decode: ${pic.src}`, { cause: e }))));
          }
        }
        if (!viewer) { viewer = makeCatViewer(canvas, MODEL); track(viewer.ready); }

        // 1. the photo: a skeleton while GPT Image 2 works, then it lands as the 1-image card does
        say1.render(t, T.r);
        enter(media1, t, T.card);
        const lp1 = landing(t, T.done);
        shimmer(sk1, t, T.card, 0, lp1);
        settle(im1, lp1);
        fade(dl1, lp1); fade(share1, lp1);
        const g1 = gen1(t, T.gen0, T.done, T.w1, GEN.image);

        // 2-4: bubble, chips, reply header and line, as the engine draws its own
        for (const p of steps) {
          x.appear(p.u, t, p.st.send);
          p.rows.forEach((rw) => { x.appear(rw.w, t, rw.c.sw); x.renderSwitch(rw, t); });
          if (p.credits) x.appear(p.credits, t, p.creditsAt);
          x.appear(p.reply, t, p.st.r);
          p.say.render(t, p.st.r);
        }

        // 2. the model: builds behind the skeleton, lands like the 3D variant's, walking as the turntable turns
        const cm = enter(model, t, M.card);
        if (cm > 0) viewer.draw({ spin: SPIN_LAND + SPIN * (t - M.w1), time: t - M.card });
        const lpm = landing(t, M.done);
        shimmer(skM, t, M.card, 0, lpm);
        settle(canvas, lpm);
        const gm = genM(t, M.gen0, M.done, M.w1, GEN.model);

        // 3. the order: a skeleton until O.done, then the card fades in and settles (doordash.d9bc17e9.js)
        enter(order, t, O.card);
        const lpo = landing(t, O.done);
        shimmer(shO, t, O.card, 0, lpo);
        settle(zoom, lpo);

        // 4. the song: a skeleton over the strip while ElevenLabs works, then the button presses into pause, the white
        // waveform uncovers to the playhead, the sung line lights
        enter(song, t, S.card);
        const lps = landing(t, S.done);
        shimmer(skS, t, S.card, 0, lps);
        fade(skelS, 1 - lps);
        const gs = genS(t, S.gen0, S.done, S.w1, GEN.song);
        // the frame's x50 badge, while any of the three generates
        fade(ff, Math.max(g1, gm, gs));
        const el = Math.min(DUR, Math.max(0, t - S.play));
        const s = Math.floor(el);
        if (s !== sec) { time.textContent = `${clock(s)} / ${clock(DUR)}`; sec = s; }
        const c = +((1 - el / DUR) * 100).toFixed(3);
        if (c !== cut) { played.style.clipPath = `inset(0 ${c}% 0 0)`; cut = c; }
        const press = seg(t, S.play - 0.12, S.play) * (1 - seg(t, S.play, S.play + 0.1));
        btn.style.transform = press > 0 ? `scale(${(1 - 0.12 * press).toFixed(4)})` : 'none';
        const on = t >= S.play;
        if (on !== playing) { playIcon.style.display = on ? 'none' : ''; pauseIcon.style.display = on ? '' : 'none'; playing = on; }
        // the sung line (bare has none)
        if (lyric) {
          let li = 0;
          while (li + 1 < LINES.length && el >= LINE_AT[li + 1]) li++;
          if (li !== line) { lyric.innerHTML = LINE_WORDS[li].map((w) => `<span>${x.esc(w[0])}</span>`).join(' '); line = li; lit = -1; }
          const n = on ? LINE_WORDS[li].filter((w) => el >= w[1]).length : 0;
          if (n !== lit) { [...lyric.children].forEach((w, i) => w.classList.toggle('on', i < n)); lit = n; }
          lyric.style.opacity = seg(t, S.play - 0.2, S.play + 0.2).toFixed(3);
        }
        // the song's element; v5 follows the clock on its own (multicat-mix.08050705.js), the others that need a frame here
        const running = clockRuns(t);
        syncAudio(t, running);
        for (const follow of packRenders) follow(t, running);

        // the end card: the chat fades to black, then the house card's own run (endcard.1d16d488.html render(t))
        const cover = seg(t, S.cut, S.cut + END_IN);
        endCard.style.opacity = cover.toFixed(3);
        endCard.style.visibility = cover > 0 ? '' : 'hidden';
        if (cover > 0) {
          const tc = t - (S.cut + END_DELAY);
          const W = endCard.clientWidth, H = endCard.clientHeight;
          // the house sizes on a 1080-high stage, scaled down (--k) only when a narrow ratio would crop the lockup
          const natW = endWord.offsetWidth / endK;
          const k = Math.min(1, (W * 0.86) / (natW + END_GAP + 220));
          if (k !== endK) { endCard.style.setProperty('--k', k.toFixed(4)); endK = k; }
          const w = 220 * k, wordW = natW * k, gap = END_GAP * k;
          const left = (W - (wordW + gap + w)) / 2, midY = H / 2;
          const pop = clamp(tc / 0.55), shift = outQuint(clamp((tc - 0.3) / 1.0));
          endBot.style.opacity = outQuint(clamp(tc / 0.3)).toFixed(3);
          endBot.style.transform = `translate(${(left + wordW + gap).toFixed(2)}px, ${(midY - w / 2).toFixed(2)}px) scale(${(0.72 + 0.28 * popBack(pop)).toFixed(4)})`;
          endWord.style.opacity = shift.toFixed(3);
          endWord.style.filter = shift < 1 ? `blur(${(6 * k * (1 - shift)).toFixed(2)}px)` : 'none';
          endWord.style.transform = `translate(${(left - 20 * k * (1 - shift)).toFixed(2)}px, -50%)`;
        }
      },
    };
  },
});

export default make(false);
export const bare = make(true);
