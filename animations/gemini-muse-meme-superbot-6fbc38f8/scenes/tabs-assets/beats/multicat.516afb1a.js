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
// Under it all runs a music bed in the song's key and tempo (bed.47e5d94a.js, BED): it plays from the top, muffles as
// the song's card lands, makes way once the song is actually sounding (its bar line falls on the song's first downbeat),
// and comes back for its final chord on the song's beat as the end card's mascot pops. The Music pill (music.47e5d94a.js)
// swaps that bed for one of five other soundtracks made for the spot, or for none: each takes its cues from this plan
// and plays only while it is the pick (soundV2, scoreV3, trackV4 and mountMix below; v1 runs on its own).
// Every generation (the photo, the model, the song) waits under a skeleton whose bottom left pill counts the tool's real
// elapsed time, while an x50 badge sits in the frame's bottom right: the wait plays fast-forwarded (X, GEN).
// The follow-up messages are built here and moved in after the engine's reply on the first render (they ride in
// inst.nodes, so the engine's show() hides them under every other variant). The engine reads inst.asks (the composer's
// typing and send presses) and inst.chips (the platform chip's swaps) for them (chat.9b47fc30.js). A pure function of
// t, except the audio, which follows the clock and never drives it. Its stylesheet (../multicat.516afb1a.css) loads with
// the module.
import { clamp, lerp, seg, outCubic, outQuint, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { LAND, landing, shimmer, settle } from './thumb-land.309eb9c5.js';
import { EXPAND, loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
// the Share control every output card carries (share.29a362ea.js)
import { shareBtn, shareDisc, SHARE_GLYPH, shareAttrs } from './share.29a362ea.js';
import { makeCatViewer } from './cat3d.516afb1a.js?v=1';
import { makeBed } from './bed.47e5d94a.js?v=2';
import { DUR, PEAKS, LINES, WORDS } from './multicat-data.516afb1a.js';
import { music } from '../../../music.47e5d94a.js';
// the other soundtracks on the Music pill: v2's band and effects, v3's synthesized score and its sound pill, v4's
// hit-synced score with the song mixed in, v5's broadcast mix with the song mixed in (v1 is music.942e79ba.js)
import { makeSound } from './multicat-sound.2e5dba12.js';
import { makeScore } from './multicat-score.9b4885bb.js';
import { soundOff } from '../../../sound.9b4885bb.js';
import { renderScore } from './multicat-score.d9e95fc7.js';
import { makeSoundtrack } from './soundtrack.d9e95fc7.js';
import { mountMix, mixOwnsSong } from './multicat-mix.08050705.js';

const CSS = new URL('../multicat.516afb1a.css?v=5', import.meta.url).href;
const asset = (p) => new URL('../../../' + p, import.meta.url).href;
const CAT = asset('img/multicat.516afb1a/cat.jpg');
const COVER = asset('img/multicat.516afb1a/cover.jpg'); // the song's cover: that same cat, cropped to its face
const ORDER = asset('img/multicat.516afb1a/order-placed.jpg');
const MODEL = asset('models/cat-walk.516afb1a.glb');
const SONG = asset('media/multicat.516afb1a/tiny-chaos.mp3');
const BED = asset('media/multicat.516afb1a/bed.47e5d94a.m4a');
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
// the music bed (media/multicat.516afb1a/CREDITS.txt): ElevenLabs Music in the song's key and tempo, B major at 120 BPM,
// in 2 s bars, each beat 0.02 s past its grid line as the song's are. Its body plays BED_BAR as the song starts, so the
// song's first downbeat lands on the bed's bar line; its final chord, struck BED_HIT into the track, rings out to its end
const BEAT = 0.5;
const BED_BAR = 22, BED_HIT = 27.5;
const BED_FREE = 1.5; // the body runs this long past BED_BAR, silent by then, then stops
// as the song's card lands (S.done to S.play) the bed muffles to MUFFLE_HZ and dips to MUFFLE_GAIN; it is gone once the
// song is actually sounding, or GRACE after the play press if the song never starts
const OPEN_HZ = 20000, MUFFLE_HZ = 700, MUFFLE_GAIN = 0.6, GRACE = 0.6;
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
// (its timer running) from `gen0` until `done`, and has landed by `w1`
function plan(r) {
  const card = r + 0.22, gen0 = card + SEEN, done = gen0 + GEN.image / X;
  const T = { r, card, gen0, done, w1: done + LAND, steps: [] };
  let s = T.w1 + IMAGE_HOLD;
  for (const st of STEPS) {
    const typeEnd = s + st.ask.length / TYPE_CPS, send = typeEnd + 0.15;
    const chips = chipsAt(send + 0.35, st.chips);
    const rr = chips[chips.length - 1].done + 0.08, at = rr + 0.22, g0 = at + SEEN;
    const fin = st.gen ? g0 + GEN[st.gen] / X : at + ORDER_LOAD, w1 = fin + LAND, play = w1 + PLAY_AFTER;
    T.steps.push({ ...st, s, typeEnd, send, chips, r: rr, card: at, gen0: g0, done: fin, w1, play, cut: play + SONG_FOR });
    s = w1 + st.hold;
  }
  T.end = s;
  return T;
}
// the chain's length from its first reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

// v4's cue sheet (multicat-score.d9e95fc7.js): every moment its music hits, off the clock the frames are drawn by.
// k is the route's first beat (the engine's ask, send, chips and reply), T the chain's plan
function cueSheet(k, T) {
  const [M, O, S] = T.steps;
  // the composer shows round(len * progress) characters (chat.9b47fc30.js renderComposer): character i lands half a step in
  const ask = (text, s, typeEnd) => ({ text, s, at: (i) => s + (i + 0.5) * (typeEnd - s) / text.length });
  return {
    asks: [ask(k.askBy.multicat, k.s, k.typeEnd), ...T.steps.map((st) => ask(st.ask, st.s, st.typeEnd))],
    sends: [k.send, ...T.steps.map((st) => st.send)],
    chips: [...k.chips, ...T.steps.flatMap((st) => st.chips)].map((c) => ({ sw: c.sw, done: c.done })),
    gens: [T, M, S].map((g) => ({ card: g.card, gen0: g.gen0, done: g.done })),
    order: { card: O.card, done: O.done },
    // the song's first downbeat sits 0.205 s into tiny-chaos.mp3 (measured); 0.95 sits it at the score's level
    song: { play: S.play, for: SONG_FOR, fade: SONG_FADE, gain: 0.95, downbeat: 0.205 },
    end: { cover: S.cut, pop: S.cut + END_DELAY, word: S.cut + END_DELAY + 0.3 },
  };
}

const DL_GLYPH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>';
const dl = (href, name) => `<a class="qc-dl" href="${href}" download="${name}" aria-label="Download image" title="Download">${DL_GLYPH}</a>`;
const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.2v13.6L19 12z"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
const DOWNLOAD = '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 19.5h14"/></svg>';
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// a generating card's pill in its bottom left: the app, what it makes, and its timer
const genl = (x, app, what) => `<span class="qc-genl">${x.tile(app)}${what}<b class="qc-genn">${clock(0)}</b></span>`;
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

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the chain keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheet();
    loadFrameSheet();
    const T = k.T;
    const [M, O, S] = T.steps;
    // v2's soundtrack, on this chain's clock: it hands over to the song at the play press and stings the end card's mascot
    const soundV2 = makeSound({ k, T, ends: { ask0: (k.askBy && k.askBy.multicat) || '', play: S.play, pop: S.cut + END_DELAY } });
    // v5's soundtrack: its cue sheet is this plan, plus the first ask and its chip as the engine times them
    mountMix({ cues: { T, ask0: { text: k.askBy.multicat, s: k.s, typeEnd: k.typeEnd, send: k.send }, chips0: k.chips }, song: SONG });

    // 1. GPT Image 2, in the engine's own reply
    const say1 = sayEl(x, SAY1);
    const media1 = x.el(`<div class="qc-media"><div class="qc-img qc-skel mc-img"><img src="${CAT}" width="1536" height="1152" alt="A photorealistic brown tabby cat standing side-on, looking at the camera"/><i class="qc-sk"></i>${genl(x, 'gptimage', 'Creating image')}${shareDisc('Realistic cat', { file: CAT })}${dl(CAT, 'cat.jpg')}</div></div>`);
    const card1 = media1.firstElementChild;
    const im1 = card1.querySelector('img'), sk1 = card1.querySelector('.qc-sk'), gen1 = genPill(card1);
    const dl1 = card1.querySelector('.qc-dl'), share1 = card1.querySelector('.qc-share');

    // 2-4: each ask's user bubble, its chip rows and its reply
    const follow = [];
    const steps = T.steps.map((st) => {
      const u = x.el(`<div class="msg qc-u"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(st.ask)}</div></div></div>`);
      const rows = st.chips.map((c) => {
        const w = x.el(`<div class="msg qc-m">${x.sbAvatar}<div class="m-main"><span class="qc-sw">${x.tile(c.app)}<span class="qc-swl">${x.esc(c.label)}</span><span class="qc-st"><i class="qc-spin"></i>${x.OK}</span></span></div></div>`);
        return { c, w, sw: w.querySelector('.qc-sw'), spin: w.querySelector('.qc-spin'), ok: w.querySelector('.qc-st .qc-ok') };
      });
      // the credits frame under the resolved chips, the engine's (chat.9b47fc30.js credits), tiled with the answering app
      const credits = st.credits ? x.el(`<div class="msg qc-m">${x.sbAvatar}<div class="m-main"><span class="qc-cr">${x.tile(st.app)}<span class="qc-cr-t">Credits used until you connect</span><span class="qc-cr-n">${st.credits} credits</span><button type="button" class="qc-cr-b">Connect</button></span></div></div>`) : null;
      const reply = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"><div class="qc-who">${x.who(st.app)}</div></div></div>`);
      const say = sayEl(x, st.say);
      reply.lastElementChild.append(say.n);
      follow.push(u, ...rows.map((rw) => rw.w), ...(credits ? [credits] : []), reply);
      return { st, u, rows, credits, creditsAt: st.chips[st.chips.length - 1].done + 0.1, reply, who: reply.querySelector('.qc-who'), say };
    });
    const [mStep, oStep, sStep] = steps;

    // 2. Meshy's model in the 3D variant's artifact frame
    const model = x.el(`<div class="bk mc-3d"><div class="bk-head"><b class="bk-title">Cat 3D model<small>Animated · GLB</small></b>${shareBtn('Cat 3D model', { file: MODEL })}${EXPAND}<a class="bk-btn bk-publish" href="${MODEL}" download="cat.glb">${DL_GLYPH}Download</a></div><div class="bk-view qc-3d qc-skel"><canvas width="1400" height="875" role="img" aria-label="Animated 3D cat model walking on a turntable"></canvas><i class="qc-sk"></i>${genl(x, 'meshy', 'Creating 3D model')}</div></div>`);
    mStep.reply.lastElementChild.append(model);
    const canvas = model.querySelector('canvas'), skM = model.querySelector('.qc-sk'), genM = genPill(model);

    // 3. the DoorDash order, framed as the doordash variant's is
    const order = x.el(`<div class="bk mc-dd"><div class="bk-head"><b class="bk-title">Petco order<small>1 item · $16.49 subtotal</small></b>${shareBtn('Petco order')}<a class="bk-btn bk-publish mc-dd-open" href="${STORE}" target="_blank" rel="noopener noreferrer"><img src="${x.brand('doordash-logo.svg')}" alt="">View in DoorDash</a></div><div class="bk-view"><div class="mc-dd-cam"><div class="mc-dd-zoom"><img class="mc-dd-shot" src="${ORDER}" width="896" height="560" alt="${x.esc(ORDER_ALT)}"></div></div><i class="bk-sh"></i></div></div>`);
    oStep.reply.lastElementChild.append(order);
    const zoom = order.querySelector('.mc-dd-zoom'), shO = order.querySelector('.bk-sh');

    // 4. the ElevenLabs track
    const song = x.el(`<div class="mc-sg"><div class="mc-sg-card">
      <div class="mc-sg-art"><img src="${COVER}" width="256" height="256" alt="Cover art: the cat from the first answer"/></div>
      <div class="mc-sg-side">
        <div class="mc-sg-t"><b>${TITLE}</b><small>Indie pop · ElevenLabs Music</small></div>
        <div class="mc-sg-row"><span class="mc-sg-btn">${PLAY}${PAUSE}</span><div class="mc-sg-wave">${wave('mc-w0')}${wave('mc-w1')}</div><span class="mc-sg-time">${clock(0)} / ${clock(DUR)}</span></div>
      </div>
      <button type="button" class="mc-sg-share" ${shareAttrs(`${TITLE}, a song about cats`, { file: SONG })}>${SHARE_GLYPH}</button>
      <a class="mc-sg-dl" href="${SONG}" download="tiny-chaos.mp3" aria-label="Download" title="Download">${DOWNLOAD}</a>
      <div class="mc-sg-gen qc-skel"><i class="qc-sk"></i>${genl(x, 'elevenlabs', 'Creating song')}</div>
    </div><div class="mc-ly" aria-live="off"></div></div>`);
    sStep.reply.lastElementChild.append(song);
    const $ = (s) => song.querySelector(s);
    const btn = $('.mc-sg-btn'), time = $('.mc-sg-time'), played = $('.mc-w1'), lyric = $('.mc-ly');
    const skelS = $('.mc-sg-gen'), skS = $('.mc-sg-gen .qc-sk'), genS = genPill(skelS);
    const [playIcon, pauseIcon] = btn.querySelectorAll('svg');
    // Space and Enter press the cards' controls, not the spot's clock (timeline.9b47fc30.js), as on the other beats
    for (const n of [media1, model, order, song]) n.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('a, button')) e.stopPropagation(); });

    // the end card: the house superbot.gg lockup, the wordmark left and the mascot face right, over the spot's black. It
    // rides in nodes (so other variants hide it) and moves to the scene section on the first render, above the hub
    const endCard = x.el(`<div class="mc-end" role="img" aria-label="superbot.gg"><div class="mc-end-word"><b>superbot.gg</b></div><div class="mc-end-bot">${END_FACE}</div></div>`);
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
    let blocked = false, songLevel = -1;
    const unblock = () => { blocked = false; };
    addEventListener('variantchange', () => audio.pause());
    // the gallery lightbox's nudge (a click in its chrome): the song may try again
    addEventListener('message', (e) => { if (e.data && e.data.type === 'unmute') unblock(); });
    // whether the song is actually sounding: the bed makes way on this, not on the clock alone, so a song slow to start
    // leaves no gap
    let songOn = false;
    audio.addEventListener('playing', () => { songOn = true; });
    for (const ev of ['pause', 'waiting', 'ended', 'error']) audio.addEventListener(ev, () => { songOn = false; });
    function syncAudio(t, running) {
      const pick = music();
      // v5 carries the song in its own mix, so this element stays silent under it
      if (pick === 'v5' && mixOwnsSong()) { if (!audio.paused) audio.pause(); return; }
      // the picked soundtrack's own sound pill mutes the song too (v4 reaches here only as its own fallback)
      const muted = (pick === 'v2' && soundV2.muted) || (pick === 'v3' && soundOff()) || (pick === 'v4' && trackV4.muted);
      if (audio.muted !== muted) audio.muted = muted;
      const at = t - S.play;
      if (!running || at < 0 || at >= Math.min(DUR, SONG_FOR + SONG_FADE)) { if (!audio.paused) audio.pause(); return; }
      // it fades out as the end card covers the chat, so the cut never lands mid-note: evenly in dB (to -40 dB), so its
      // tail decays under the bed's closing chord instead of dropping away at the last moment. The fade rides the bed's
      // context once it carries the song (iOS ignores an element's volume), else the element's volume
      const level = Math.pow(0.01, seg(at, SONG_FOR, SONG_FOR + SONG_FADE));
      const carry = bed.carry(audio);
      if (!carry) audio.volume = level;
      else if (level !== songLevel) {
        if (audio.volume !== 1) audio.volume = 1;
        carry.gain.setTargetAtTime(level, carry.context.currentTime, 0.015);
      }
      songLevel = level;
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

    // the bed: its body from the top, placed so its BED_BAR plays as the song starts; its final chord on the first song
    // beat at or after the end card's mascot pops (S.cut + END_DELAY)
    const bed = makeBed(BED, [
      { from: 0, to: BED_BAR + BED_FREE, at: S.play - BED_BAR },
      { from: BED_HIT, to: Infinity, at: S.play + Math.ceil((SONG_FOR + END_DELAY) / BEAT) * BEAT },
    ]);
    function syncBed(t, running) {
      const muffle = seg(t, S.done, S.play);
      const gone = songOn || t >= S.play + GRACE;
      bed.sync(t, running, [
        { gain: gone ? 0 : 1 - (1 - MUFFLE_GAIN) * muffle, cutoff: OPEN_HZ * Math.pow(MUFFLE_HZ / OPEN_HZ, muffle) },
        { gain: 1 },
      ]);
    }

    // v3's score, on this beat's own moments: the four asks typing and sending, the chips resolving, the three generations,
    // each answer landing, the song's ask and play press, and the end card's mascot popping in
    const scoreV3 = makeScore({
      asks: [{ text: k.askBy.multicat, s: k.s, typeEnd: k.typeEnd }, ...T.steps.map((st) => ({ text: st.ask, s: st.s, typeEnd: st.typeEnd }))],
      sends: [k.send, ...T.steps.map((st) => st.send)],
      chips: [...k.chips, ...T.steps.flatMap((st) => st.chips)].map((c) => c.done),
      gens: [[T.gen0, T.done], [M.gen0, M.done], [S.gen0, S.done]],
      photo: T.done, model: M.done, order: O.done, songAsk: S.send, play: S.play, logo: S.cut + END_DELAY,
    });
    window.__MC_SCORE = scoreV3; // QA: scoreV3.bounce() renders it offline
    // v4's soundtrack: its score with the song mixed in, rendered once when it is first picked and played on the clock
    // (soundtrack.d9e95fc7.js); the song's <audio> above is its fallback if the score cannot render
    const trackV4 = makeSoundtrack({
      id: 'multicat',
      async render() {
        const res = await fetch(SONG);
        if (!res.ok) throw new Error(`multicat: the song failed to load (${res.status}): ${SONG}`);
        return renderScore(cueSheet(k, T), window.__AD.CYCLE, await res.arrayBuffer());
      },
    });

    let placed = false, viewer = null, decoding = false, sec = -1, cut = -1, playing = null, line = -1, lit = -1;
    return {
      nodes: [say1.n, media1, ...follow, endCard, ff],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[T.r, say1.n], [T.card, media1], ...steps.flatMap((p) => [[p.st.send, p.u], ...p.rows.map((rw) => [rw.c.sw, rw.w]), ...(p.credits ? [[p.creditsAt, p.credits]] : []), [p.st.r, p.who], [p.st.r, p.say.n], [p.st.card, p.reply.lastElementChild.lastElementChild]])],
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
        // QA: the bed and the song against the clock (__AD arrives after the timeline's first frame)
        if (window.__AD && !window.__AD.sound) window.__AD.sound = () => ({ t: window.__AD.now, music: music(), bed: bed.state(), song: { on: songOn, paused: audio.paused, at: +audio.currentTime.toFixed(3), volume: +audio.volume.toFixed(3) } });
        if (!decoding) {
          decoding = true;
          for (const pic of [im1, order.querySelector('img'), song.querySelector('img')]) {
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
        let li = 0;
        while (li + 1 < LINES.length && el >= LINE_AT[li + 1]) li++;
        if (li !== line) { lyric.innerHTML = LINE_WORDS[li].map((w) => `<span>${x.esc(w[0])}</span>`).join(' '); line = li; lit = -1; }
        const n = on ? LINE_WORDS[li].filter((w) => el >= w[1]).length : 0;
        if (n !== lit) { [...lyric.children].forEach((w, i) => w.classList.toggle('on', i < n)); lit = n; }
        lyric.style.opacity = seg(t, S.play - 0.2, S.play + 0.2).toFixed(3);
        // the soundtrack the Music pill picks: each of them follows the clock only while it is the pick
        const running = clockRuns(t), pick = music();
        trackV4.sync(t);
        // v4 plays the song inside its own mix, unless that failed to render
        if (pick !== 'v4' || trackV4.failed) syncAudio(t, running); else if (!audio.paused) audio.pause();
        syncBed(t, running && pick === 'bed');
        soundV2.render(t);
        scoreV3.render(t);

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
};
