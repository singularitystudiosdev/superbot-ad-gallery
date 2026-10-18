// Thumbnail beat (the 'yt-thumbnail' variant): a creator's demo for a voiceover read over it (the line each beat starts is
// in LINES below, and on screen with ?cues=1), cut tight: short holds between the answers. The engine holds the empty
// state WAIT seconds longer (chat.9b47fc30.js routeBy `wait`), types "Make a thumbnail for my AI agents video." at
// TYPE_CPS and sends it down a bare route (no engine chips, the composer on Superbot throughout); this beat draws
// everything else on its own clock, with no model on show (the multidog-credits look: no model chips, no "<model> in
// superbot" header):
//   1. The answer: superbot opens the creator's channel in their own signed-in browser (the way superbot works a site,
//      superbot.gg/features "it drives your own browser, signed in") and reads the video (a frame with the channel, the
//      video, and the context it pulls: the transcript, the title, the key frames, the channel's thumbnail style).
//   2. Three thumbnails in the channel's style generate under skeletons, then land in reading order.
//   3. "Upload them to that video as an A/B test." is typed and sent; superbot opens the video's editor and uploads the
//      three as one A/B test, each upload filling its bar, the test going Live, then a done line.
//   4. The house superbot.gg end card (multicat.516afb1a.js's, its stylesheet ../multicat.516afb1a.css .mc-end) covers it.
// Made to pass X's ads policies (checked 2026-10-17 against help.x.com's live text): no third party's logo, trade dress,
// product or feature name on screen (Unacceptable Content, "Unauthorized References": the frames name no video platform,
// the chips wear a plain globe, not a platform's mark), the video is one of the creator's with no other brand in it, the
// asks are written grammatically (Quality, "Editorial"), and every wait the cut compresses wears the house fast-forward
// badge, x10 on the read, x50 on the generation, x20 on the upload (Deceptive Content, "misleading tactics or claims").
// No frame carries a button that names an action a viewer could mistake for the ad's own (the thumbnails frame's
// Download button is gone, 2026-10-18): a video can't be clicked, and X bars "non-functional features or calls-to-action
// in the ad creative" (Deceptive Content, "Non-existent Features or Functionality").
// Both asks are typed by hand, not swept: each key lands on its own schedule (keystrokes() below, through the engine's
// `keys`), uneven and a little slower than the other cuts. Opened straight on this variant (?variant=yt-thumbnail), the
// page shows the app alone: no pills, no key hint, the tab titled superbot (?controls=1 brings the pills back).
// The channel, the video and its numbers are Mevesa's as listed on 2026-10-17; the three thumbnails are real GPT Image 2
// generations made on a ChatGPT plan from that video's thumbnail and frames (../../../img/ytthumb.c4e81a27/CREDITS.txt).
// Nothing was uploaded. Silent on purpose: the creator's voice is the soundtrack. A pure function of t. Its stylesheet
// (../ytthumb.c4e81a27.css) loads with the module.
import { clamp, lerp, seg, outCubic, outQuint, outBack, inOutCubic, streamCount, rand } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { LAND, landing, shimmer, settle } from './thumb-land.309eb9c5.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';

const CSS = new URL('../ytthumb.c4e81a27.css?v=6', import.meta.url).href;
// the end card and the fast-forward badge are multicat's (../multicat.516afb1a.css .mc-end, .mc-ff)
const MC_CSS = new URL('../multicat.516afb1a.css?v=9', import.meta.url).href;
export const ID = 'yt-thumbnail';
const asset = (p) => new URL('../../../img/ytthumb.c4e81a27/' + p, import.meta.url).href;
const THUMBS = [1, 2, 3].map((i) => asset(`agents-${i}.jpg`));
const CURRENT = asset('agents-video.jpg'), AVATAR = asset('avatar.jpg');

// the channel and the video, as listed on 2026-10-17 (published 2026-08-13: 2 months before). One of the channel's videos
// with no other company's name or mark in its title or thumbnail, so the cut shows no brand but superbot's
const CHANNEL = 'Mevesa', HANDLE = '@Mevesa', SUBS = '1.9M subscribers';
const VIDEO = 'AI Agents Are Taking Over the Internet — And Nobody Is Ready';
const VIEWS = '52K views · 2 months ago', DUR = '12:17';
// each thumbnail's headline, as its picture reads
const NAMES = ['AI Agents Are Taking Over', 'Is Anyone Ready?', 'The Rise of AI Agents'];
const ALTS = [
  'Thumbnail A: the host pulls his sunglasses down, surprised, beside "AI Agents Are Taking Over, Nobody Is Ready"',
  'Thumbnail B: the host shrugs, one palm up, beside "Is Anyone Ready? AI Agents Are Here"',
  'Thumbnail C: the host, arms crossed, beside "The Rise of AI Agents" and a checklist',
];

// both asks type at this average rate (characters a second), 30% under the 30 the cut first ran at, unevenly
export const TYPE_CPS = 21;
// the empty state holds this long past the engine's CHAT_T0 (1.6 s): the first ask starts typing at 2.6 s
export const WAIT = 1;
// the first ask, as the engine's askBy words it (chat.9b47fc30.js); its keystrokes are scheduled here. Both are written
// as sentences: X's Quality policy asks an ad for proper grammar and punctuation
const ASK1 = 'Make a thumbnail for my AI agents video.';
const ASK2 = 'Upload them to that video as an A/B test.';

// a hand's keystrokes for `text`: each key's gap jittered between about half and one and a half the mean, a beat more
// before each new word, now and then a short hesitation; deterministic per `seed`, then scaled so the whole ask takes
// exactly text.length / TYPE_CPS (the window the engine and plan() time it by). Each character's time from the ask's
// start, rising, the last the ask's end
function keystrokes(text, seed) {
  const keys = [];
  let at = 0;
  for (let i = 0; i < text.length; i++) {
    let gap = 0.55 + 0.9 * rand(seed * 97 + i);
    if (text[i - 1] === ' ') gap += 0.6 + 0.9 * rand(seed * 131 + i);
    if (i > 2 && rand(seed * 173 + i) < 0.08) gap += 2.2;
    at += gap;
    keys.push(at);
  }
  const k = text.length / TYPE_CPS / at;
  return keys.map((x) => x * k);
}
const KEYS1 = keystrokes(ASK1, 3), KEYS2 = keystrokes(ASK2, 7);
const SAY_B = 'Here are three thumbnails in your channel’s style.';
const SAY_C = 'Uploading all three to that video as an A/B test.';
const SAY_DONE = 'Done. The A/B test is live on your AI agents video.';

// GPT Image 2 makes the three at once: 37 to 62 s each, measured making these (2026-10-17), 47 s their mean (the
// multicat cut's figure too). The wait plays X times fast (the house x50), so it holds under a second
const X = 50, GEN = 47;
// the other two waits the cut compresses, each wearing its rate on the same badge: the channel's open and read (about
// 20 s in a browser, shown in about 2) and the video's editor, the three uploads and the test's start (about 40 s, shown
// in about 2)
const X_READ = 10, X_UP = 20;
const FF_IN = 0.2;
const SEEN = 0.45; // a card's rise and the feed's glide to it (multicat.516afb1a.js SEEN)
// the house end card (multicat.516afb1a.js): the chat fades to black over END_IN, the lockup's run starts END_DELAY in
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.8, END_GAP = 44;
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const END_FACE = '<svg class="mc-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="ytEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#ytEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#ytEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#ytEndFace)"/></svg>';

// the routing chips this beat draws, both the browser's (chat.9b47fc30.js APPS.web, a plain globe; tools, so the
// composer's chip stays on Superbot): `hold` is how long each spins before it resolves
const chip = (app, label, sw, hold) => ({ app, label, tool: true, sw, swap: sw + 0.22, done: sw + hold });

// every time in the chain from the reply r (the ask's send + 0.43), each answer following the last after a short look:
// the browser chip lands at once and the channel frame comes in (`yt`), its four context rows resolve (`reads`) and it
// reads Ready; the reply streams at rB, the thumbnails' frame comes in at `thumbs`, generates from gen0 to done and has
// landed by w1; the second ask types from s2 and sends at send2, the editor chip lands, the upload frame comes in at
// `up`, its three uploads fill (`ups`), the test starts (`test`), the frame reads Live (`live`) and the done line streams
// (`said`); the end card covers it all at `cut`, a short read later
function plan(r) {
  const c2 = chip('web', 'Opening your channel in your browser', r + 0.15, 0.9);
  const yt = c2.done + 0.15, yt1 = yt + SEEN;
  const reads = [yt1 + 0.4, yt1 + 0.8, yt1 + 1.2, yt1 + 1.6];
  const ready = reads[3] + 0.25;
  const rB = ready + 1.1, thumbs = rB + 0.25, gen0 = thumbs + SEEN, done = gen0 + GEN / X;
  const lands = [done, done + 0.12, done + 0.24], w1 = lands[2] + LAND;
  const s2 = w1 + 1.5, typeEnd2 = s2 + ASK2.length / TYPE_CPS, send2 = typeEnd2 + 0.15;
  const c4 = chip('web', 'Opening the video’s editor', send2 + 0.35, 0.8);
  const rC = c4.done + 0.1, up = rC + 0.25, up1 = up + SEEN;
  const ups = [0, 1, 2].map((i) => [up1 + 0.15 + i * 0.25, up1 + 0.85 + i * 0.25]);
  const test = ups[2][1] + 0.3, live = test + 0.2, said = live + 0.25;
  const cut = said + 1.5;
  return { r, c2, yt, yt1, reads, ready, rB, thumbs, gen0, done, lands, w1, s2, typeEnd2, send2, c4, rC, up, up1, ups, test, live, said, cut, end: cut + END_DELAY + END_LEN };
}
// the chain's length from its reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

// the voiceover against the beat each line goes with: shown on screen only with ?cues=1, each line from the moment its
// beat starts; s is the first ask's typing start (CHAT_T0 + WAIT). The creator's script, reworded to pass X's ads
// policies: it names no other company's product (Unacceptable Content, "Unauthorized References": the first script
// named Devin, Perplexity, ChatGPT, GPT Image 2 and YouTube), and its price claim is the one superbot.gg makes, calls on
// your own plans are free on superbot (superbot.gg/api.md), not "never upcharged", which the house models' API-rate
// billing makes untrue (Deceptive Content, "omitting vital information on pricing")
// About 80 words: 26 to 29 s read at a brisk to natural pace, against the cut's 25 s
const LINES = (T, s) => [
  [0.3, 'superbot runs your AI tasks on the plans you already pay for, and those calls cost nothing extra on superbot.'],
  [s, 'Say I want a new thumbnail for one of my videos.'],
  [T.c2.sw, 'It opens my channel in my own browser, so I barely have to explain.'],
  [T.rB - 0.3, 'Now it makes three options. Sped up here.'],
  [T.lands[0], 'Great. Uploading is just as simple:'],
  [T.s2, '“Upload them to that video as an A/B test.”'],
  [T.c4.sw, '(it uploads all three; sped up)'],
  [T.said, 'And the test is live.'],
  [T.cut, 'Check out superbot.gg, linked below.'],
];

let sheet = null;
function loadSheet() {
  if (sheet) return;
  const load = (href) => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    track(new Promise((done) => {
      l.onload = done;
      l.onerror = () => { console.error(new Error(`yt-thumbnail variant stylesheet failed to load: ${href}`)); done(); };
    }));
    document.head.appendChild(l);
    return l;
  };
  sheet = load(CSS);
  load(MC_CSS);
}

// a block's entrance: it rises and settles in over 0.45s from `at` (the other beats' card entrance)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
  return ci;
}
const fade = (n, p) => { n.style.opacity = p.toFixed(3); n.style.visibility = p > 0 ? '' : 'hidden'; };
// a mark that pops in from `at`: scale from 0.3 with a little overshoot
function pop(n, t, at) {
  const p = seg(t, at, at + 0.3);
  n.style.opacity = p.toFixed(3);
  n.style.transform = p >= 1 ? 'none' : `scale(${lerp(0.3, 1, outBack(p)).toFixed(4)})`;
}

// the streamed line a reply opens with: the visible prefix, the rest held in place transparent
function sayEl(x, text) {
  const n = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  let shown = -1;
  return { n, render(t, at) {
    const c = streamCount(text, at + 0.06, 70, t);
    if (c !== shown) { n.firstElementChild.textContent = text.slice(0, c); n.lastElementChild.textContent = text.slice(c); shown = c; }
  } };
}

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
// a generating pill's timer counts GEN's real seconds X times the clock's rate from gen0, rests on GEN from done, and the
// pill fades out as the last thumbnail settles (w1); returns how much is generating now, 0..1, for the frame's badge
function genPill(pill) {
  const num = pill.querySelector('.qc-genn');
  let shown = '';
  return (t, gen0, done, w1) => {
    const s = clock(t >= done ? GEN : Math.max(0, t - gen0) * X);
    if (s !== shown) { num.textContent = s; shown = s; }
    const out = 1 - seg(t, w1 - 0.25, w1);
    pill.style.opacity = (seg(t, gen0 - 0.2, gen0) * out).toFixed(3);
    return seg(t, gen0 - FF_IN, gen0) * out;
  };
}

// a status that waits (a dim ring), spins from `from`, then resolves to a green check at `at`
const STATUS = '<span class="yt-ck"><i class="yt-ring"></i><i class="yt-spin"></i><svg class="yt-ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>';
function renderStatus(n, t, from, at) {
  const ring = n.querySelector('.yt-ring'), spin = n.querySelector('.yt-spin'), ok = n.querySelector('.yt-ok');
  const on = seg(t, from - 0.1, from + 0.05) * (1 - seg(t, at - 0.08, at + 0.06));
  ring.style.opacity = (1 - seg(t, from - 0.1, from + 0.05)).toFixed(3);
  spin.style.opacity = on.toFixed(3);
  spin.style.transform = `rotate(${((t - from) * 420).toFixed(1)}deg)`;
  const p = seg(t, at, at + 0.3);
  ok.style.opacity = p.toFixed(3);
  ok.style.transform = p >= 1 ? 'none' : `scale(${lerp(0.3, 1, outBack(p)).toFixed(4)})`;
}
// a frame's state pill: a spinner over `wait` until `at`, then a green `done` pill pops in
const statePill = (wait, done) => `<span class="yt-state"><span class="yt-state-wait"><i class="yt-spin"></i>${wait}</span><span class="yt-state-on"><svg class="yt-ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>${done}</span></span>`;
function renderState(n, t, from, at) {
  const wait = n.querySelector('.yt-state-wait'), on = n.querySelector('.yt-state-on'), spin = wait.querySelector('.yt-spin');
  spin.style.transform = `rotate(${((t - from) * 420).toFixed(1)}deg)`;
  fade(wait, 1 - seg(t, at + 0.02, at + 0.16));
  pop(on, t, at + 0.1);
}

// glyphs: Lucide (ISC) strokes, drawn in currentColor
const G = {
  flask: '<path d="M9 3h6M10 3v6.5L4.6 18.4A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.4-2.6L14 9.5V3"/><path d="M7.5 15h9"/>',
  // the browser the channel is opened in: a plain globe, no platform's mark
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
};
const g = (name, cls = '') => `<svg class="yt-g ${cls}" viewBox="0 0 24 24" aria-hidden="true">${G[name]}</svg>`;

// opened straight on this cut (?variant=yt-thumbnail, as the gallery and its links do), the page is the app alone: no
// control pills, no key hint, the tab titled superbot (?controls=1 keeps the controls); picking this cut from the pill
// on another one keeps them, so the picker stays reachable
const CLEAN = (() => { const q = new URLSearchParams(location.search); return q.get('variant') === ID && q.get('controls') !== '1'; })();

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the chain keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheet();
    loadFrameSheet();
    const T = k.T;
    const cueLines = LINES(T, k.s);

    // 1. the browser chip rides in the engine's own reply (a bare route's reply comes in at r with nothing above it, and
    // shows nothing until the chip lands); the rest of the chain is built here and moved in after that reply on the first
    // render, in order
    const chipEl = (c) => x.el(`<span class="qc-sw">${x.tile(c.app)}<span class="qc-swl">${x.esc(c.label)}</span><span class="qc-st"><i class="qc-spin"></i>${x.OK}</span></span>`);
    const sw = (c, sp) => ({ c, sw: sp, spin: sp.querySelector('.qc-spin'), ok: sp.querySelector('.qc-st .qc-ok') });
    const row = (c) => { const w = x.el(`<div class="msg qc-m">${x.sbAvatar}<div class="m-main"></div></div>`); const sp = chipEl(c); w.lastElementChild.append(sp); return { w, ...sw(c, sp) }; };
    const sw2 = sw(T.c2, chipEl(T.c2));
    const row4 = row(T.c4);

    // the channel frame: the channel as the creator's own signed-in browser shows it, the video, and what superbot reads
    // from it. Headed by a plain globe and "Your channel", never a platform's logo or name (X's Unauthorized References)
    const ctx = [['Transcript', `${DUR} · auto-captions`], ['Title and description', ''], ['Key frames', ''], ['Your thumbnail style', 'from your last 12 videos']];
    const ytCard = x.el(`<div class="bk yt-yt">
      <div class="bk-head"><span class="yt-logo">${g('globe')}</span><b class="bk-title">Your channel<small>Signed in · ${HANDLE}</small></b>${statePill('Reading', 'Ready')}</div>
      <div class="yt-ch"><img class="yt-av" src="${AVATAR}" width="160" height="160" alt="${CHANNEL}’s channel picture"/><span class="yt-txt"><b>${CHANNEL}</b><small>${HANDLE} · ${SUBS}</small></span></div>
      <div class="yt-vid"><span class="yt-vid-th"><img src="${CURRENT}" width="1280" height="720" alt="The video’s current thumbnail: AI Agents Are Taking Over the Internet, Nobody Is Ready"/><i>${DUR}</i></span><span class="yt-txt"><small>Video</small><b>${x.esc(VIDEO)}</b><small>${VIEWS}</small></span></div>
      <div class="yt-ctx">${ctx.map(([a, b]) => `<div class="yt-ctx-r">${STATUS}<span class="yt-ctx-t"><b>${a}</b>${b ? `<small>${b}</small>` : ''}</span></div>`).join('')}</div>
    </div>`);
    const ctxRows = [...ytCard.querySelectorAll('.yt-ctx-r')];
    const ytState = ytCard.querySelector('.yt-state');
    const replyA = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"></div></div>`);
    const anchorA = x.el('<i class="mc-anchor" aria-hidden="true"></i>');
    replyA.lastElementChild.append(ytCard, anchorA);

    // 2. the thumbnails: three, generating, then landing in reading order (no model header, no tool tile on the pill, and
    // no Download button in the head: a button in a video is a call to action no viewer can press)
    const replyB = x.el(`<div class="msg qc-m qc-r yt-wide">${x.sbAvatar}<div class="m-main"></div></div>`);
    const sayB = sayEl(x, SAY_B);
    const thumbs = x.el(`<div class="bk yt-th">
      <div class="bk-head"><b class="bk-title">Thumbnails<small>3 options · 1280 × 720</small></b></div>
      <div class="yt-th-view"><div class="yt-th-grid">${THUMBS.map((src, i) => `<div class="yt-th-t qc-skel"><img src="${src}" width="1280" height="720" alt="${x.esc(ALTS[i]).replaceAll('"', '&quot;')}"/><i class="qc-sk"></i></div>`).join('')}</div>
      <span class="qc-genl mc-genl-bare">Creating thumbnails<b class="qc-genn">0:00</b></span></div>
    </div>`);
    const tiles = [...thumbs.querySelectorAll('.yt-th-t')].map((n) => ({ n, im: n.querySelector('img'), sk: n.querySelector('.qc-sk') }));
    const gen = genPill(thumbs.querySelector('.qc-genl'));
    const anchorB = x.el('<i class="mc-anchor" aria-hidden="true"></i>');
    replyB.lastElementChild.append(sayB.n, thumbs, anchorB);

    // 3. the second ask, then the upload frame
    const u2 = x.el(`<div class="msg qc-u"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(ASK2)}</div></div></div>`);
    const replyC = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"></div></div>`);
    const sayC = sayEl(x, SAY_C);
    const upCard = x.el(`<div class="bk yt-up">
      <div class="bk-head"><span class="yt-logo">${g('globe')}</span><b class="bk-title">A/B test<small>3 thumbnails · in your browser</small></b>${statePill('Uploading', 'Live')}</div>
      <div class="yt-up-vid"><span class="yt-up-th"><img src="${CURRENT}" width="1280" height="720" alt=""/></span><span class="yt-txt"><b>${x.esc(VIDEO)}</b><small>Your video · ${VIEWS}</small></span></div>
      ${THUMBS.map((src, i) => `<div class="yt-up-r"><span class="yt-up-th"><img src="${src}" width="1280" height="720" alt=""/></span><span class="yt-txt"><b>${NAMES[i]}</b><small>Thumbnail ${i + 1} of 3</small></span><span class="yt-bar"><i></i></span>${STATUS}</div>`).join('')}
      <div class="yt-up-r yt-up-test"><span class="yt-up-ic">${g('flask')}</span><span class="yt-txt"><b>Thumbnail test</b><small>Each viewer sees one; the most watch time wins</small></span>${STATUS}</div>
    </div>`);
    const upRows = [...upCard.querySelectorAll('.yt-up-r')], bars = upRows.slice(0, 3).map((n) => n.querySelector('.yt-bar i'));
    const upState = upCard.querySelector('.yt-state');
    const anchorC = x.el('<i class="mc-anchor" aria-hidden="true"></i>');
    const sayDone = sayEl(x, SAY_DONE);
    sayDone.n.classList.add('yt-said');
    replyC.lastElementChild.append(sayC.n, upCard, anchorC, sayDone.n);


    // 5. the end card, the fast-forward badge, and the cue strip (?cues=1 only)
    const endCard = x.el(`<div class="mc-end" role="img" aria-label="superbot.gg"><div class="mc-end-word"><b>superbot.gg</b></div><div class="mc-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.mc-end-word'), endBot = endCard.querySelector('.mc-end-bot');
    let endK = 1;
    const ff = x.el(`<div class="mc-ff" aria-hidden="true">x${X}</div>`);
    let ffRate = X;
    const cues = new URLSearchParams(location.search).get('cues') === '1';
    const cue = x.el('<div class="yt-cue" aria-live="off"><span class="yt-cue-k">Voiceover</span><span class="yt-cue-t"></span></div>');
    const cueT = cue.lastElementChild;
    let cueAt = -1;

    const follow = [replyA, replyB, u2, row4.w, replyC];
    const pics = [...ytCard.querySelectorAll('img'), ...thumbs.querySelectorAll('img'), ...upCard.querySelectorAll('img')];
    let placed = false;
    if (k.askBy[ID] !== ASK1) console.error(new Error(`yt-thumbnail: the engine's ask "${k.askBy[ID]}" is not the one this beat schedules keystrokes for`));

    return {
      nodes: [sw2.sw, ...follow, endCard, ff, cue],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[T.c2.sw, sw2.sw], [T.yt, anchorA], [T.rB, sayB.n], [T.thumbs, anchorB], [T.send2, u2], [T.c4.sw, row4.w], [T.rC, sayC.n], [T.up, anchorC], [T.said, sayDone.n]],
      // both asks' keystrokes (the engine's renderComposer types by them): the first ask's here, the second's on its ask
      keys: KEYS1,
      // the second ask, typed into the composer and sent by the engine (renderComposer), and the chips, both tools, so
      // the composer's platform chip (renderRouting) stays on Superbot
      asks: [{ text: ASK2, s: T.s2, typeEnd: T.typeEnd2, send: T.send2, keys: KEYS2 }],
      chips: [T.c2, T.c4],
      render(t) {
        if (!placed) {
          let at = sw2.sw.closest('.msg');
          for (const m of follow) { at.after(m); at = m; }
          const scene = x.hub.closest('.scene');
          scene.append(endCard, ff);
          // the app alone (CLEAN): the page's pills and key hint hidden (../ytthumb.c4e81a27.css body.yt-clean), the tab
          // titled as the app's
          if (CLEAN) {
            document.body.classList.add('yt-clean');
            document.title = 'superbot';
          }
          if (cues) scene.append(cue); else cue.remove();
          for (const pic of pics) track(pic.decode().catch((e) => console.error(new Error(`yt-thumbnail image failed to decode: ${pic.src}`, { cause: e }))));
          placed = true;
        }

        // 1. the chips, the channel frame and its reads; the first chip comes in on its own, inside the engine's reply
        x.appear(sw2.sw, t, T.c2.sw);
        x.renderSwitch(sw2, t);
        x.appear(row4.w, t, T.c4.sw);
        x.renderSwitch(row4, t);
        x.appear(replyA, t, T.yt);
        enter(ytCard, t, T.yt);
        renderState(ytState, t, T.yt, T.ready);
        ctxRows.forEach((n, i) => renderStatus(n, t, i ? T.reads[i - 1] : T.yt1, T.reads[i]));

        // 2. the thumbnails: skeletons while GPT Image 2 works, then each lands as a thumbnail does (thumb-land.309eb9c5.js)
        x.appear(replyB, t, T.rB);
        sayB.render(t, T.rB);
        enter(thumbs, t, T.thumbs);
        tiles.forEach((s, i) => {
          const lp = landing(t, T.lands[i]);
          shimmer(s.sk, t, T.thumbs, i, lp);
          settle(s.im, lp);
        });
        // the fast-forward badge wears each compressed wait's rate: the channel's open and read, the generation, the upload
        const ffGen = gen(t, T.gen0, T.done, T.w1);
        const ffRead = seg(t, T.c2.sw - FF_IN, T.c2.sw) * (1 - seg(t, T.ready, T.ready + 0.25));
        const ffUp = seg(t, T.c4.sw - FF_IN, T.c4.sw) * (1 - seg(t, T.test, T.test + 0.25));
        const rate = ffRead > 0 ? X_READ : ffUp > 0 ? X_UP : X;
        if (rate !== ffRate) { ff.textContent = `x${rate}`; ffRate = rate; }
        fade(ff, Math.max(ffGen, ffRead, ffUp));

        // 3. the upload: each bar fills, its check pops, the test starts, the frame reads Live, the done line streams
        x.appear(u2, t, T.send2);
        x.appear(replyC, t, T.rC);
        sayC.render(t, T.rC);
        enter(upCard, t, T.up);
        renderState(upState, t, T.up, T.live);
        upRows.forEach((n, i) => {
          const [a, b] = i < 3 ? T.ups[i] : [T.ups[2][1], T.test];
          renderStatus(n, t, a, b);
          if (i < 3) bars[i].style.transform = `scaleX(${inOutCubic(seg(t, a, b - 0.05)).toFixed(4)})`;
        });
        sayDone.render(t, T.said);

        // 4. the end card: the chat fades to black, then the house card's own run (multicat.516afb1a.js)
        const cover = seg(t, T.cut, T.cut + END_IN);
        endCard.style.opacity = cover.toFixed(3);
        endCard.style.visibility = cover > 0 ? '' : 'hidden';
        if (cover > 0) {
          const tc = t - (T.cut + END_DELAY);
          const W = endCard.clientWidth, H = endCard.clientHeight;
          const natW = endWord.offsetWidth / endK;
          const kk = Math.min(1, (W * 0.86) / (natW + END_GAP + 220));
          if (kk !== endK) { endCard.style.setProperty('--k', kk.toFixed(4)); endK = kk; }
          const w = 220 * kk, wordW = natW * kk, gap = END_GAP * kk;
          const left = (W - (wordW + gap + w)) / 2, midY = H / 2;
          const pp = clamp(tc / 0.55), shift = outQuint(clamp((tc - 0.3) / 1.0));
          endBot.style.opacity = outQuint(clamp(tc / 0.3)).toFixed(3);
          endBot.style.transform = `translate(${(left + wordW + gap).toFixed(2)}px, ${(midY - w / 2).toFixed(2)}px) scale(${(0.72 + 0.28 * popBack(pp)).toFixed(4)})`;
          endWord.style.opacity = shift.toFixed(3);
          endWord.style.filter = shift < 1 ? `blur(${(6 * kk * (1 - shift)).toFixed(2)}px)` : 'none';
          endWord.style.transform = `translate(${(left - 20 * kk * (1 - shift)).toFixed(2)}px, -50%)`;
        }

        // the cue strip: the line the voiceover is on, fading in as each starts
        if (cues) {
          let i = -1;
          cueLines.forEach(([a], j) => { if (t >= a) i = j; });
          if (i !== cueAt) { cueT.textContent = i >= 0 ? cueLines[i][1] : ''; cueAt = i; }
          fade(cue, i >= 0 ? outCubic(seg(t, cueLines[i][0], cueLines[i][0] + 0.25)) : 0);
        }
      },
    };
  },
};
