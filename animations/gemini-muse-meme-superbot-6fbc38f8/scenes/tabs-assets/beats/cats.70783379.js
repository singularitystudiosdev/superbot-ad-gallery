// Cats beat (the 'cats-chatbot' variant): five asks in one chat, cut like the bare koala-discord and multicat-credits
// chains (no routing chips, no model headers, the composer on Superbot throughout, the house superbot.gg end card at the
// close). The engine types and sends the first ask ("Connect to my discord and send a cat gif to MrCatMan131") and this
// beat answers it; then it carries the chat on by itself, typing, sending and answering the other four in their own replies.
//   1. Discord: the DM with MrCatMan131 in Discord's dark theme (the koala cut's frame, ../koala.7f80a09a.css). Discord's
//      app icon connects over the DM first (Connecting to Discord, then Connected), then the user's message waits greyed
//      under Sending while its GIF slot shimmers, the cat lands and squints on loop, the message goes through (Sent),
//      MrCatMan131 is typing, and his answer lands.
//   2. The 3D cat: the multicat cut's walking Meshy cat (cat3d.516afb1a.js) builds under a skeleton, its pill counting the
//      tool's real seconds at x50 (the frame's badge says so), then walks on a turntable.
//   3. DoorDash: the multicat cut's rebuilt Petco "Confirming your order" card.
//   4. The song: "Nine Lives", made for this cut (Lyria), generates under a skeleton at x50, then plays: its real waveform
//      fills in and its sung line lights word by word. It plays on under the fifth ask, a little lower, as the cut's bed.
//   5. The subscriptions: the user's five other AI plans, each with its app's own icon, cancelled one after another
//      (Active, Canceling, Canceled with the date its paid access ends), the frame counting them and the monthly spend
//      on them running down to $0.00, then a held beat (the film's laugh plays in it).
//   6. The website: three styles of a cat café's site land side by side out of their skeletons, and the user's pointer
//      picks one (it takes a ring and a check, the other two recede).
//   7. The captcha: a generic image challenge ("Select all images with cats") over a dimmed sign-in page; superbot's
//      pointer taps the four cats and Verify, and the page reads Verified.
//   8. The feedback: the ask goes in with an email draft attached (a chip in the composer, a file card in the bubble);
//      superbot reads it and marks it up, six harsh notes landing one by one, each lighting its phrase in the draft, and
//      a 2/10 verdict, with nothing nice said; then the end card covers the chat.
// Under it plays 16 · Punchy premium groove (multicat-player.96834de7.js), re-cued to this chain: the cat landing takes the
// photo's hit, the 3D cat the model's (the fuller section follows it), the order its bell, the song's play press ends the
// bed (it is moved to the song's G major), every cancel a resolve tick. The follow-up messages are built here and moved in
// after the engine's reply on the first render (they ride in inst.nodes, so the engine's show() hides them under every
// other variant); the engine reads inst.asks for their typing and sends (chat.9b47fc30.js). A pure function of t, except
// the audio, which follows the clock and never drives it. Its stylesheet (../cats.70783379.css) loads with the module.
// Everything on screen is made up and nothing was sent, ordered or cancelled; sources in img/cats.70783379/CREDITS.txt.
import { clamp, lerp, seg, outCubic, outQuint, outBack, inOutCubic, streamCount, path } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { LAND, landing, shimmer, settle } from './thumb-land.309eb9c5.js';
import { EXPAND, loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { shareBtn, SHARE_GLYPH, shareAttrs } from './share.29a362ea.js';
import { makeCatViewer } from './cat3d.516afb1a.js?v=1';
import { music } from '../../../music.47e5d94a.js?v=2';
import { songLevel } from '../../../sound.96834de7.js?v=2';
// the URLs multicat.516afb1a.js imports too, so every chain shares one player registry and one renderer
import { makePlayer as makePlayerV16 } from './multicat-player.96834de7.js?v=4';
import { renderScore } from './multicat-score.96834de7.js?v=3';
import { DUR, PEAKS, LINES, WORDS } from './cats-data.70783379.js';

export const ID = 'cats-chatbot';
const CSS = new URL('../cats.70783379.css?v=3', import.meta.url).href;
// the DM frame is the koala cut's (../koala.7f80a09a.css .kd-*), the 3D, order and song cards and the end card multicat's
const SHEETS = [new URL('../multicat.516afb1a.css?v=9', import.meta.url).href, new URL('../koala.7f80a09a.css?v=1', import.meta.url).href, CSS];
const asset = (p) => new URL('../../../' + p, import.meta.url).href;
const icon = (n) => asset(`img/cats.70783379/icons/${n}.png`);
const cafePic = (n) => asset(`img/hacker.7dfcf32a/${n}.jpg`); // the hacker cut's generated cat photos (that folder's CREDITS.txt)
const capPic = (n) => asset(`img/cats.70783379/captcha/${n}.jpg`);
const SPRITE = asset('img/cats.70783379/cat-gif-frames.jpg'); // the GIF's 46 frames, 360 x 270 each, 8 across and 6 down
const GIF = asset('media/cats.70783379/cat-squint.gif');
const COVER = asset('img/cats.70783379/cover.jpg');
const SONG = asset('media/cats.70783379/nine-lives.mp3');
const MODEL = asset('models/cat-walk.516afb1a.glb');
const ORDER = asset('img/multicat.516afb1a/order-placed.jpg');
const STORE = 'https://www.doordash.com/convenience/store/25109364/';
const ORDER_ALT = 'DoorDash order placed: Confirming your order from Petco, one Purina Fancy Feast Seafood Classic Collection Broths Variety Pack (1.4 oz x 12 ct), $16.49 subtotal, $0.00 delivery fee';
const DM = 'https://discord.com/channels/@me';
const FRIEND = 'MrCatMan131';
const TITLE = 'Nine Lives';

export const TYPE_CPS = 55; // every ask types at this rate; the first one through its route's typeCps (chat.9b47fc30.js)
const ASK1 = `Connect to my discord and send a cat gif to ${FRIEND}`;
const ASKS = ['Make me a 3d hyperrealistic model of a cat', 'Order me catfood on doordash', 'Now make me a song about cats', 'Unsubscribe from all my other AI subscriptions',
  'Build me a website for my cat café', 'Get past this captcha', 'Give me feedback on this'];

// the DM's recent history, oldest first: a day's divider or one author's run of messages. The last run is his answer to
// the GIF, which lands live
const LOG = [
  { day: 'October 18, 2026' },
  { who: 'c', time: 'Yesterday at 10:14 PM', lines: ['my cat just knocked my monitor off the desk', 'while i was in a ranked game'] },
  { who: 's', time: 'Yesterday at 10:15 PM', lines: ['legend'] },
  { day: 'October 19, 2026' },
  { who: 'c', time: 'Today at 3:02 PM', lines: ['need a cat gif asap', 'its an emergency'] },
  { who: 's', time: 'Today at 3:06 PM', gif: true },
  { who: 'c', time: 'Today at 3:06 PM', lines: ['LMAOOO the side eye {sob}'], reply: true },
];
// the plans, each with its app's own icon (img/cats.70783379/CREDITS.txt), its US monthly price as the maker's own pricing
// page or help centre states it (read 2026-10-19), and the day its paid access would end once cancelled
const SUBS = [
  { icon: 'chatgpt', name: 'ChatGPT Plus', price: 20, until: 'Nov 2' },
  { icon: 'claude', name: 'Claude Pro', price: 20, until: 'Nov 8' },
  { icon: 'gemini', name: 'Google AI Pro', price: 19.99, until: 'Nov 14' },
  { icon: 'midjourney', name: 'Midjourney Standard', price: 30, until: 'Oct 27' },
  { icon: 'suno', name: 'Suno Pro', price: 10, until: 'Nov 5' },
];
const SPEND = SUBS.reduce((s, x) => s + x.price, 0);
const usd = (n) => `$${n.toFixed(2)}`;
const SAY = [
  `Connected to Discord and sent ${FRIEND} a cat GIF.`,
  'Here’s your hyperrealistic 3D cat.',
  'Your cat food has been ordered from Petco.',
  'Here’s an upbeat indie pop song about cats.',
  `Canceled all ${SUBS.length} of your other AI subscriptions.`,
  'Here are three styles for your cat café’s site. Pick one.',
  'Done. You’re past the captcha.',
  'Honestly? This email doesn’t work. Here’s why.',
];
// 6. the café's site in three styles (made up; its photos are the hacker cut's generated cats and this cut's cover), and
// the one the user picks
const CAFE = 'Whisker &amp; Bean';
const DESIGNS = [
  { name: 'Cozy', note: 'Warm serif', html: () => `<div class="ct-site ct-s-cozy"><div class="ct-nav"><b>${CAFE}</b><span>Menu</span><span>Cats</span><span>Visit</span></div><div class="ct-hero"><h4>Coffee with a side of purrs.</h4><p>Lattes, pastries and twelve resident cats.</p><i class="ct-btn">Book a visit</i></div><img src="${cafePic('cat-sun')}" alt=""/></div>` },
  { name: 'Bold', note: 'Big type', html: () => `<div class="ct-site ct-s-bold"><div class="ct-nav"><b>WHISKER &amp; BEAN</b><i>OPEN 7AM</i></div><h4>CATS +<br/>COFFEE.</h4><img src="${cafePic('cat-box')}" alt=""/><i class="ct-btn">GRAB A SEAT →</i></div>` },
  { name: 'Minimal', note: 'Clean grid', html: () => `<div class="ct-site ct-s-min"><b class="ct-logo">${CAFE}</b><p>A quiet café with resident cats.</p><div class="ct-row3"><img src="${cafePic('cat-kittens')}" alt=""/><img src="${cafePic('cat-mug')}" alt=""/><img src="${COVER}" alt=""/></div><i class="ct-btn">Reserve a table</i></div>` },
];
const PICK = 1;
// 7. the challenge's nine tiles (generated for this cut, img/cats.70783379/CREDITS.txt), and the four with cats in them,
// in the order superbot taps them
const TILES = ['cat-wall', 'hydrant', 'cat-porch', 'bicycle', 'cat-window', 'traffic-light', 'dog', 'cat-street', 'car'];
const CATS = [0, 2, 4, 7];
// 8. the attached draft (made up), its phrases marked by number (6: every run of exclamation points), the notes on them
// and the verdict: harsh, and nothing kind
const MAIL_SUBJECT = 'Quick question!!';
const MAIL_BODY = ['Hi there!!', 'Hope this email finds you well!! I wanted to reach out about a super exciting opportunity that could be a total game changer for you and your team!!! Let me know if you have 5 mins to hop on a quick call this week!!', 'Thanks so much!!', 'Sam'];
const MAIL_WORDS = MAIL_BODY.join(' ').split(/\s+/).filter(Boolean).length;
const MAIL_BANGS = [MAIL_SUBJECT, ...MAIL_BODY].join(' ').split('!').length - 1;
const MARKS = [[1, 'Quick question'], [2, 'Hope this email finds you well'], [3, 'super exciting opportunity'], [4, 'total game changer'], [5, 'hop on a quick call this week']];
const NOTES = [
  '“Quick question” is what spam says, and there is no question anywhere in this email.',
  'Filler. Nobody has ever kept reading because of this line.',
  'Vague hype. You never say what the opportunity actually is.',
  'A claim with zero proof behind it. It reads like a scam.',
  'You ask a stranger for their time before giving them one reason to care.',
  `${MAIL_BANGS} exclamation points in ${MAIL_WORDS + 2} words. This reads as panic, not enthusiasm.`,
];
const VERDICT = 'As written, this gets deleted unread. Start over.';

// a card's rise and the feed's glide to it (chat.9b47fc30.js renderScroll) both take this long: its work starts once in view
const SEEN = 0.45;
const CONNECT = 0.95;   // Discord connecting over the DM, to Connected
const CONN_OUT = 0.25;  // Connected, held, then the panel lifts off the DM
const FIND = 0.7;       // the GIF slot's skeleton: the cat GIF found
const SEND_AFTER = 0.3, TYPE_IN = 0.45, TYPING = 1.0, GROW = 0.3, HOLD_1 = 1.35;
// the generating cards run fast-forwarded X times (the frame's badge says so): each card's timer counts its tool's real
// wall-clock seconds, GEN, at X times the spot's clock. model: Meshy image to 3D, as the multicat cut measures it; song:
// this track's own generation, 63.7 s (Lyria 3.5, 2026-10-19)
const X = 50, FF_IN = 0.2;
const GEN = { model: 105, song: 64 };
const HOLD_2 = 2.4;
const ORDER_LOAD = 0.58, HOLD_3 = 1.6;
const PLAY_AFTER = 0.2;
const SONG_HOLD = 1.0;   // the song's play press to the last ask starting to type; it plays on under that ask, its first line whole
const SONG_UNDER = 0.75; // the song's level under the last ask and its card (-2.5 dB), so the keys and the cancels read over it
const SONG_FADE = 0.9;   // its fade-out as the end card covers the chat
// one plan's cancel, the next one's start, the last to the end card's cover (room for the film's laugh, ads-src/superbot-cats-16x9-70783379)
const CANCEL = 0.5, STRIDE = 0.44, HOLD_5 = 2.4;
// 6. the styles: their skeletons to the first landing, the next two after it, the last landing to the pointer arriving on
// the pick (its travel PICK_MOVE), the pick to the captcha ask typing
const DESIGN = 0.85, DESIGN_STAGGER = 0.14, PICK_AFTER = 0.9, PICK_MOVE = 0.55, HOLD_D = 1.5;
// 7. the captcha in view to superbot's pointer setting off, its first tap after that, one tap to the next, the last tap to
// Verify, Verify to Verified, Verified to the end card's cover
const CAP_IN = 0.3, CAP_FIRST = 0.45, TILE = 0.34, VERIFY = 0.5, CHECKING = 0.6, HOLD_C = 1.4;
// 8. the draft in view to the first note (superbot reading it), one note to the next, the last note to the verdict, the
// verdict to the end card's cover (the film's line runs through it)
const READ = 0.5, NOTE = 0.42, VERDICT_AFTER = 0.4, HOLD_F = 3.2;
// the house end card (multicat.516afb1a.js): the chat fades to its black over END_IN, the card's own 2.5s run starts
// END_DELAY in (mascot pops in, superbot.gg fades up beside it, hold)
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5, END_GAP = 44;
// the GIF's clock: 46 frames at 8 cs (12.5 fps), the first 24 of the clip forward and back again (media/cats.70783379/cat-squint.gif)
const FPS = 12.5, FRAMES = 46, COLS = 8, ROWS = 6;
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const END_FACE = '<svg class="mc-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="ctEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#ctEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#ctEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#ctEndFace)"/></svg>';
// the Discord mark (Simple Icons, CC0), as the koala cut inlines it
const MARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>';
// lucide check, plus, download, x (api.iconify.design/lucide)
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
const PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg>';
const DL_GLYPH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>';
const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.2v13.6L19 12z"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
const DOWNLOAD = '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 19.5h14"/></svg>';
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// every time in the chain, from the first reply r. A: the DM (connects, the GIF found and landed, sent, his answer);
// M, O, S, U, D, C, F: the seven asks the beat types itself, each { s, typeEnd, send, r, card } and its own work after the card
function plan(r) {
  const A = { r, card: r + 0.22 };
  A.c0 = A.card + SEEN; A.conn = A.c0 + CONNECT; A.gen0 = A.conn + CONN_OUT + 0.1; A.done = A.gen0 + FIND;
  A.w1 = A.done + LAND; A.sent = A.w1 + SEND_AFTER; A.typing = A.sent + TYPE_IN; A.reply = A.typing + TYPING;
  let s = A.reply + GROW + HOLD_1;
  const step = (ask) => {
    const typeEnd = s + ask.length / TYPE_CPS, send = typeEnd + 0.15, rr = send + 0.35 + 0.08, card = rr + 0.22;
    return { ask, s, typeEnd, send, r: rr, card, gen0: card + SEEN };
  };
  const M = step(ASKS[0]);
  M.done = M.gen0 + GEN.model / X; M.w1 = M.done + LAND; s = M.w1 + HOLD_2;
  const O = step(ASKS[1]);
  O.done = O.card + ORDER_LOAD; O.w1 = O.done + LAND; s = O.w1 + HOLD_3;
  const S = step(ASKS[2]);
  S.done = S.gen0 + GEN.song / X; S.w1 = S.done + LAND; S.play = S.w1 + PLAY_AFTER; s = S.play + SONG_HOLD;
  const U = step(ASKS[3]);
  U.go = U.gen0 + 0.1;
  U.starts = SUBS.map((_, i) => U.go + i * STRIDE);
  U.dones = U.starts.map((a) => a + CANCEL);
  U.done = U.dones[U.dones.length - 1] + 0.15;
  s = U.done + HOLD_5;
  const D = step(ASKS[4]);
  D.d0 = D.gen0;
  D.lands = DESIGNS.map((_, i) => D.d0 + DESIGN + i * DESIGN_STAGGER);
  D.pick = D.lands[D.lands.length - 1] + LAND + PICK_AFTER;
  D.ptr = D.pick - PICK_MOVE;
  s = D.pick + HOLD_D;
  const C = step(ASKS[5]);
  C.go = C.gen0 + CAP_IN;
  C.taps = CATS.map((_, i) => C.go + CAP_FIRST + i * TILE);
  C.verify = C.taps[C.taps.length - 1] + VERIFY;
  C.done = C.verify + CHECKING;
  s = C.done + HOLD_C;
  const F = step(ASKS[6]);
  F.att = true;
  F.f0 = F.gen0 + READ;
  F.notes = NOTES.map((_, i) => F.f0 + i * NOTE);
  F.verdict = F.notes[F.notes.length - 1] + VERDICT_AFTER;
  const cut = F.verdict + HOLD_F;
  return { r, A, M, O, S, U, D, C, F, steps: [M, O, S, U, D, C, F], cut, end: cut + END_DELAY + END_LEN };
}
// the chain's length from its first reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

let sheets = false;
function loadSheets() {
  if (sheets) return;
  sheets = true;
  for (const href of SHEETS) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    track(new Promise((ok) => {
      l.onload = ok;
      l.onerror = () => { console.error(new Error(`${ID} stylesheet failed to load: ${href}`)); ok(); };
    }));
    document.head.appendChild(l);
  }
}

// a block's entrance: it rises and settles in over 0.45s from `at` (the other beats' card entrance)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
  return ci;
}
// a style write only when it changes
const put = (n, k, v) => { if (n.style[k] !== v) n.style[k] = v; };
const fade = (n, p) => { put(n, 'opacity', p.toFixed(3)); put(n, 'visibility', p > 0 ? '' : 'hidden'); };

// the streamed line every reply opens with: the visible prefix, the rest held in place transparent
function sayEl(x, text) {
  const n = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  let shown = -1;
  return { n, render(t, at) {
    const c = streamCount(text, at + 0.06, 70, t);
    if (c !== shown) { n.firstElementChild.textContent = text.slice(0, c); n.lastElementChild.textContent = text.slice(c); shown = c; }
  } };
}

// a generating card's pill in its bottom left (bare: no tool tile) and its timer: the real seconds X times the clock's rate
// from gen0, resting on the full `real` from done; it fades out as the answer lands (by w1). Returns how much the card is
// generating now, 0..1, which the frame's x50 badge shows by
const genl = (what) => `<span class="qc-genl mc-genl-bare">${what}<b class="qc-genn">${clock(0)}</b></span>`;
function genPill(box) {
  const pill = box.querySelector('.qc-genl'), num = pill.querySelector('.qc-genn');
  let shown = clock(0);
  return (t, gen0, done, w1, real) => {
    const s = clock(t >= done ? real : Math.max(0, t - gen0) * X);
    if (s !== shown) { num.textContent = s; shown = s; }
    const out = 1 - seg(t, w1 - 0.25, w1);
    put(pill, 'opacity', out.toFixed(3));
    return seg(t, gen0 - FF_IN, gen0) * out;
  };
}

// the track's measured envelope as one filled shape (multicat.516afb1a.js waveD)
const waveD = (peaks) => {
  const n = peaks.top.length, y = (v, dir) => (50 + dir * Math.max(1.5, v) * 0.48).toFixed(1);
  let d = 'M0 50';
  for (let i = 0; i < n; i++) d += `L${i} ${y(peaks.top[i], -1)}`;
  for (let i = n - 1; i >= 0; i--) d += `L${i} ${y(peaks.bot[i], 1)}`;
  return `${d}Z`;
};
const WAVE_D = waveD(PEAKS);
const wave = (cls) => `<svg class="${cls}" viewBox="0 0 ${PEAKS.top.length - 1} 100" preserveAspectRatio="none" aria-hidden="true"><path d="${WAVE_D}"/></svg>`;
const LINE_WORDS = LINES.map((_, i) => WORDS.filter((w) => w[3] === i));
const LINE_AT = LINE_WORDS.map((ws) => ws[0][1] - 0.35);

// a message line: its {sob} drawn as the system's colour emoji
const line = (x, s) => x.esc(s).replace(/\{sob\}/g, '<span class="ct-emo">\u{1F62D}</span>');
const gifHtml = () => `<div class="kd-gif qc-skel ct-gif">
  <div class="kd-gif-f" style="background-image:url('${SPRITE}')" role="img" aria-label="An orange tabby cat on a sofa slowly narrowing its eyes into a side-eye squint"></div>
  <span class="kd-gif-tag">GIF</span>
  <a class="qc-dl" href="${GIF}" download="cat-squint.gif" aria-label="Download GIF" title="Download">${DL_GLYPH}</a>
  <i class="qc-sk"></i>
</div>`;
const who = (w) => (w === 'c' ? FRIEND : 'sam');

// 1. the DM: Discord connects over it, the GIF is found and lands, the message goes through, he types and answers
function dmCard(x) {
  const rows = LOG.map((m) => {
    if (m.day) return `<div class="kd-day"><span>${m.day}</span></div>`;
    const body = m.gif ? gifHtml() : m.lines.map((l) => `<div class="kd-line">${line(x, l)}</div>`).join('');
    const grp = `<div class="kd-grp${m.gif ? ' kd-g-gif' : ''}"><span class="kd-av ${m.who === 'c' ? 'ct-av-c' : 'kd-av-s'}">${MARK}</span><div class="kd-main"><div class="kd-head"><b>${who(m.who)}</b><time>${m.time}</time></div>${body}</div></div>`;
    return m.reply ? `<div class="kd-grow">${grp}</div>` : grp;
  }).join('');
  const node = x.el(`<div class="bk kd ct-dm">
    <div class="bk-head">
      <b class="bk-title">${MARK}<span>Direct message</span><small class="kd-st"><span class="kd-st-a ct-st-c">Connecting</span><span class="kd-st-a ct-st-s">Sending</span><span class="kd-st-b">${CHECK}Sent</span></small></b>
      ${shareBtn('Cat GIF', { file: GIF })}
      <a class="bk-btn bk-publish kd-open" href="${DM}" target="_blank" rel="noopener noreferrer">${MARK}Open in Discord</a>
    </div>
    <div class="bk-view kd-view">
      <div class="kd-bar"><span class="kd-av ct-av-c">${MARK}</span><b>${FRIEND}</b></div>
      <div class="kd-log"><div class="kd-list">${rows}</div></div>
      <div class="kd-input"><span class="kd-plus">${PLUS}</span><span>Message @${FRIEND}</span></div>
      <div class="kd-typing" aria-hidden="true"><span class="kd-dots"><i></i><i></i><i></i></span><span><b>${FRIEND}</b> is typing…</span></div>
      <div class="ct-conn" aria-hidden="true">
        <span class="ct-conn-app"><img src="${icon('discord')}" width="64" height="64" alt=""/><i class="ct-conn-ok">${CHECK}</i></span>
        <span class="ct-conn-t"><b class="ct-conn-a">Connecting to Discord</b><b class="ct-conn-b">Connected to Discord</b></span>
        <small>Signed in as sam</small>
        <i class="ct-conn-bar"><i></i></i>
      </div>
    </div>
  </div>`);
  const $ = (s) => node.querySelector(s);
  const frame = $('.kd-gif-f'), sk = $('.kd-gif .qc-sk'), tag = $('.kd-gif-tag'), dl = $('.kd-gif .qc-dl');
  const head = $('.kd-g-gif .kd-head'), conning = $('.ct-st-c'), sending = $('.ct-st-s'), sentEl = $('.kd-st-b');
  const typing = $('.kd-typing'), dots = [...typing.querySelectorAll('.kd-dots i')];
  const grow = $('.kd-grow'), answer = grow.firstElementChild;
  const conn = $('.ct-conn'), connA = $('.ct-conn-a'), connB = $('.ct-conn-b'), ok = $('.ct-conn-ok'), bar = $('.ct-conn-bar i'), app = $('.ct-conn-app');
  let f0 = -1;
  return { node, frame, render(t, A) {
    // Discord connecting over the DM: its icon breathes while the bar runs, the check pops, then the panel lifts off
    const okp = outBack(seg(t, A.conn - 0.18, A.conn + 0.12));
    put(ok, 'opacity', seg(t, A.conn - 0.18, A.conn - 0.06).toFixed(3));
    put(ok, 'transform', `scale(${lerp(0.3, 1, okp).toFixed(4)})`);
    put(bar, 'transform', `scaleX(${outCubic(seg(t, A.c0 - 0.1, A.conn - 0.1)).toFixed(4)})`);
    const breathe = 1 + 0.035 * Math.sin(Math.max(0, t - A.card) * 7) * (1 - seg(t, A.conn - 0.2, A.conn));
    put(app, 'transform', `scale(${breathe.toFixed(4)})`);
    const sw = seg(t, A.conn - 0.06, A.conn + 0.08);
    fade(connA, 1 - sw); fade(connB, sw);
    const lift = seg(t, A.conn + CONN_OUT - 0.05, A.conn + CONN_OUT + 0.2);
    fade(conn, 1 - lift);
    put(conn, 'transform', lift > 0 ? `scale(${lerp(1, 1.03, lift).toFixed(4)})` : 'none');
    // the GIF slot: a skeleton until the cat lands, then it squints on loop
    const lp = landing(t, A.done);
    shimmer(sk, t, A.gen0, 0, lp);
    settle(frame, lp);
    fade(tag, lp); fade(dl, lp);
    const f = t < A.done ? 0 : Math.floor((t - A.done) * FPS + 1e-6) % FRAMES;
    if (f !== f0) { frame.style.backgroundPosition = `${(((f % COLS) / (COLS - 1)) * 100).toFixed(3)}% ${((Math.floor(f / COLS) / (ROWS - 1)) * 100).toFixed(3)}%`; f0 = f; }
    // the header: Connecting, then Sending (the message greyed, as Discord shows one in flight), then Sent
    const c = outCubic(seg(t, A.conn, A.conn + 0.2)), s = outCubic(seg(t, A.sent, A.sent + 0.2));
    fade(conning, 1 - c); fade(sending, c * (1 - s)); fade(sentEl, s);
    put(head, 'opacity', lerp(0.5, 1, s).toFixed(3));
    // his typing under the message box, its dots pulsing in turn, then his answer's row opens
    put(typing, 'opacity', (seg(t, A.typing, A.typing + 0.15) * (1 - seg(t, A.reply - 0.05, A.reply + 0.1))).toFixed(3));
    dots.forEach((d, i) => put(d, 'opacity', (0.35 + 0.65 * Math.sin(Math.PI * ((((t - A.typing) * 1.6 - i * 0.18) % 1 + 1) % 1))).toFixed(3)));
    const g = inOutCubic(seg(t, A.reply, A.reply + GROW));
    put(grow, 'height', g >= 1 ? '' : `${(g * grow.scrollHeight).toFixed(2)}px`);
    put(answer, 'opacity', seg(t, A.reply + 0.05, A.reply + GROW).toFixed(3));
  } };
}

// 5. the subscriptions: one row a plan, cancelled one after another; the footer's monthly spend runs down with them
const SPIN = '<i class="ct-spin" aria-hidden="true"></i>';
function subsCard(x) {
  const rows = SUBS.map((p) => `<div class="ct-row">
    <img class="ct-ic" src="${icon(p.icon)}" width="34" height="34" alt="${x.esc(p.name)}"/>
    <span class="ct-txt"><b>${x.esc(p.name)}</b><small><span class="ct-a"><s>${usd(p.price)}/month</s> · Renews ${p.until}</span><span class="ct-b">Canceled · access until ${p.until}</span></small></span>
    <span class="ct-pill"><span class="ct-on"><i class="ct-dot"></i>Active</span><span class="ct-ing">${SPIN}Canceling</span><span class="ct-off">${CHECK}Canceled</span></span>
  </div>`).join('');
  const node = x.el(`<div class="bk ct-subs">
    <div class="bk-head">
      <b class="bk-title">AI subscriptions<small class="kd-st"><span class="kd-st-a">Canceling <b class="ct-n">0</b> of ${SUBS.length}</span><span class="kd-st-b">${CHECK}${SUBS.length} canceled</span></small></b>
      ${EXPAND}
    </div>
    <div class="bk-view ct-view">
      <div class="ct-rows">${rows}</div>
      <div class="ct-foot"><span>Monthly spend on other AIs</span><span class="ct-total"><s class="ct-was">${usd(SPEND)}</s><b class="ct-now">${usd(SPEND)}</b></span></div>
    </div>
  </div>`);
  const $ = (s) => node.querySelector(s);
  const parts = [...node.querySelectorAll('.ct-row')].map((r) => ({
    row: r, on: r.querySelector('.ct-on'), ing: r.querySelector('.ct-ing'), off: r.querySelector('.ct-off'),
    a: r.querySelector('.ct-a'), b: r.querySelector('.ct-b'), txt: r.querySelector('.ct-txt'), spin: r.querySelector('.ct-spin'), tick: r.querySelector('.ct-off svg'),
  }));
  const count = $('.ct-n'), going = $('.ct-subs .kd-st-a'), doneEl = $('.ct-subs .kd-st-b'), now = $('.ct-now'), was = $('.ct-was');
  let shownN = -1, shownSpend = '';
  return { node, render(t, U) {
    parts.forEach((p, i) => {
      const a = U.starts[i], d = U.dones[i];
      const ing = seg(t, a, a + 0.12) * (1 - seg(t, d - 0.04, d + 0.08));
      fade(p.on, 1 - seg(t, a, a + 0.12));
      fade(p.ing, ing);
      const off = seg(t, d - 0.04, d + 0.1);
      fade(p.off, off);
      put(p.tick, 'transform', `scale(${lerp(0.3, 1, outBack(seg(t, d - 0.04, d + 0.26))).toFixed(4)})`);
      put(p.spin, 'transform', `rotate(${(Math.max(0, t - a) * 540).toFixed(1)}deg)`);
      // the row: its price line swapped for the date its paid access ends and its text dimmed; the app icon keeps its colour
      const sw = seg(t, d, d + 0.2);
      fade(p.a, 1 - sw); fade(p.b, sw);
      put(p.txt, 'opacity', lerp(1, 0.6, outCubic(seg(t, d, d + 0.3))).toFixed(3));
      put(p.row, 'background', ing > 0.01 ? `rgba(255,255,255,${(0.035 * ing).toFixed(4)})` : '');
    });
    // the header counts the plan being cancelled now: 1 of 5 from the first start
    const n = Math.max(1, U.starts.filter((a) => t >= a).length);
    if (n !== shownN) { count.textContent = String(n); shownN = n; }
    // the spend runs down by each plan's price over its tick, so the figure counts rather than jumps
    const left = SUBS.reduce((s, p, i) => s + p.price * (1 - outCubic(seg(t, U.dones[i], U.dones[i] + 0.3))), 0);
    const txt = usd(Math.max(0, Math.round(left * 100) / 100));
    if (txt !== shownSpend) { now.textContent = txt; shownSpend = txt; }
    fade(was, seg(t, U.dones[0], U.dones[0] + 0.25));
    const dd = outCubic(seg(t, U.done, U.done + 0.2));
    fade(going, 1 - dd); fade(doneEl, dd);
  } };
}

// 6. the styles: three previews (each site laid out at 344 x 215 and drawn at half size), landing one after another out of
// their skeletons; the pick takes a ring and a check while the others recede. pickEl is where the pointer clicks
const REFRESH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>';
const PHONES = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>';
const INFO = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>';
function webCard(x) {
  const opts = DESIGNS.map((d) => `<div class="ct-opt"><div class="ct-prev qc-skel"><div class="ct-fit">${d.html()}</div><i class="qc-sk"></i><span class="ct-badge">${CHECK}</span></div><div class="ct-opt-l"><b>${d.name}</b><small>${d.note}</small></div></div>`).join('');
  const node = x.el(`<div class="bk ct-web">
    <div class="bk-head"><b class="bk-title">Cat café website<small class="kd-st"><span class="kd-st-a">Designing 3 styles</span><span class="kd-st-a">Pick a style</span><span class="kd-st-b">${CHECK}${DESIGNS[PICK].name} picked</span></small></b>${EXPAND}</div>
    <div class="bk-view ct-wview"><div class="ct-opts">${opts}</div></div>
  </div>`);
  const parts = [...node.querySelectorAll('.ct-opt')].map((o) => ({ o, prev: o.querySelector('.ct-prev'), fit: o.querySelector('.ct-fit'), sk: o.querySelector('.qc-sk'), badge: o.querySelector('.ct-badge') }));
  const [designing, picking, picked] = node.querySelectorAll('.kd-st > span');
  return { node, pickEl: parts[PICK].prev, render(t, D) {
    parts.forEach((q, i) => {
      const lp = landing(t, D.lands[i]);
      shimmer(q.sk, t, D.d0, i, lp);
      settle(q.fit, lp);
      // the pick: a ring and a check pop on it, a small press; the other two recede
      const k = outCubic(seg(t, D.pick, D.pick + 0.25));
      if (i === PICK) {
        put(q.prev, 'boxShadow', k > 0 ? `0 0 0 ${(2.5 * k).toFixed(2)}px #f2f2f5, 0 10px 28px rgba(0,0,0,${(0.45 * k).toFixed(3)})` : '');
        const press = seg(t, D.pick - 0.08, D.pick) * (1 - seg(t, D.pick, D.pick + 0.18));
        put(q.o, 'transform', `scale(${(1 - 0.03 * press + 0.025 * k).toFixed(4)})`);
        fade(q.badge, seg(t, D.pick, D.pick + 0.08));
        put(q.badge, 'transform', `scale(${lerp(0.3, 1, outBack(seg(t, D.pick, D.pick + 0.3))).toFixed(4)})`);
      } else {
        put(q.o, 'opacity', lerp(1, 0.42, k).toFixed(3));
      }
    });
    const ready = outCubic(seg(t, D.lands[D.lands.length - 1] + LAND - 0.1, D.lands[D.lands.length - 1] + LAND + 0.1));
    const done = outCubic(seg(t, D.pick, D.pick + 0.2));
    fade(designing, 1 - ready); fade(picking, ready * (1 - done)); fade(picked, done);
  } };
}

// 7. the captcha: a generic image challenge (no vendor's marks) over a dimmed sign-in page. Each cat tile shrinks and takes a
// blue check as superbot taps it; Verify dips, spins, and the challenge gives way to Verified. targets() is where its
// pointer goes, in tap order, then Verify
function capCard(x) {
  const tiles = TILES.map((f) => `<div class="ct-tile"><img src="${capPic(f)}" width="256" height="256" alt=""/><span class="ct-tick">${CHECK}</span></div>`).join('');
  const node = x.el(`<div class="bk ct-cap">
    <div class="bk-head"><b class="bk-title">Captcha<small class="kd-st"><span class="kd-st-a">${SPIN}Solving</span><span class="kd-st-b">${CHECK}Solved</span></small></b></div>
    <div class="bk-view ct-cview">
      <div class="ct-page"><div class="ct-pbar"><i></i><span></span></div><div class="ct-pform"><b>Sign in</b><i></i><i></i><span>Continue</span></div></div>
      <div class="ct-scrim"></div>
      <div class="ct-modal" role="img" aria-label="An image challenge: select all images with cats">
        <div class="ct-mhead"><small>Select all images with</small><b>cats</b><small>Click verify once there are none left.</small></div>
        <div class="ct-grid">${tiles}</div>
        <div class="ct-mfoot"><span class="ct-icons">${REFRESH}${PHONES}${INFO}</span><span class="ct-verify"><i class="ct-vspin"></i><b>VERIFY</b></span></div>
      </div>
      <div class="ct-ok"><span>${CHECK}</span><b>Verified</b></div>
    </div>
  </div>`);
  const tileEls = [...node.querySelectorAll('.ct-tile')];
  const $ = (q) => node.querySelector(q);
  const modal = $('.ct-modal'), scrim = $('.ct-scrim'), ok = $('.ct-ok'), verify = $('.ct-verify'), vspin = $('.ct-vspin'), vtext = $('.ct-verify b');
  const [solving, solved] = node.querySelectorAll('.kd-st > span');
  const spin = solving.querySelector('.ct-spin');
  return { node, targets: () => [...CATS.map((i) => tileEls[i]), verify], render(t, C) {
    CATS.forEach((ti, i) => {
      const at = C.taps[i], el = tileEls[ti];
      put(el.firstElementChild, 'transform', `scale(${lerp(1, 0.84, outCubic(seg(t, at, at + 0.16))).toFixed(4)})`);
      const tick = el.lastElementChild;
      fade(tick, seg(t, at, at + 0.06));
      put(tick, 'transform', `scale(${lerp(0.3, 1, outBack(seg(t, at, at + 0.26))).toFixed(4)})`);
    });
    const press = seg(t, C.verify - 0.08, C.verify) * (1 - seg(t, C.verify, C.verify + 0.14));
    put(verify, 'transform', `scale(${(1 - 0.06 * press).toFixed(4)})`);
    const checking = seg(t, C.verify, C.verify + 0.08);
    fade(vspin, checking); fade(vtext, 1 - checking);
    put(vspin, 'transform', `rotate(${(Math.max(0, t - C.verify) * 540).toFixed(1)}deg)`);
    put(spin, 'transform', `rotate(${(Math.max(0, t - C.go) * 540).toFixed(1)}deg)`);
    // Verified: the challenge lifts away, the page clears and the check pops
    const out = outCubic(seg(t, C.done - 0.05, C.done + 0.25));
    fade(modal, 1 - out);
    put(modal, 'transform', `translate(-50%, -50%) scale(${lerp(1, 0.94, out).toFixed(4)})`);
    put(scrim, 'opacity', lerp(1, 0.25, out).toFixed(3));
    fade(ok, seg(t, C.done + 0.05, C.done + 0.2));
    put(ok, 'transform', `translate(-50%, -50%) scale(${lerp(0.6, 1, outBack(seg(t, C.done + 0.05, C.done + 0.4))).toFixed(4)})`);
    const d = outCubic(seg(t, C.done, C.done + 0.2));
    fade(solving, 1 - d); fade(solved, d);
  } };
}

// 8. the feedback: the draft as a light email (subject and body, its marked phrases numbered), the six notes under it
// and the verdict. A note lands, its phrase in the draft lights; the verdict and the 2/10 score close it. MAIL_ICON is
// lucide's mail; X_ICON lucide's x
const MAIL_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
const X_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
// the chip in the composer while the ask types, and the file card in the user's bubble
export const MAIL_CHIP = `<span class="ct-achip">${MAIL_ICON}${MAIL_SUBJECT}</span>`;
const mailAtt = () => `<div class="ct-att"><span class="ct-att-ic">${MAIL_ICON}</span><span class="ct-att-t"><b>${MAIL_SUBJECT}</b><small>Email draft · ${MAIL_WORDS} words</small></span></div>`;
function markUp(x, text) {
  // the draft's text with its numbered phrases and every run of exclamation points wrapped as marks; a mark's number rides
  // on it, out of the text's flow, so the line never shifts as the numbers pop in
  let h = x.esc(text);
  for (const [n, phrase] of MARKS) h = h.replace(x.esc(phrase), `<mark class="ct-mk" data-n="${n}">${x.esc(phrase)}<sup class="ct-mn" data-n="${n}">${n}</sup></mark>`);
  return h.replace(/!+/g, (m) => `<mark class="ct-mk ct-mk6" data-n="6">${m}</mark>`);
}
function fbCard(x) {
  const body = MAIL_BODY.map((l) => `<p>${markUp(x, l)}</p>`).join('').replace('team<mark class="ct-mk ct-mk6" data-n="6">!!!</mark>', 'team<mark class="ct-mk ct-mk6" data-n="6">!!!<sup class="ct-mn" data-n="6">6</sup></mark>');
  const notes = NOTES.map((n, i) => `<li><i>${i + 1}</i><span>${x.esc(n)}</span></li>`).join('');
  const node = x.el(`<div class="bk ct-fb">
    <div class="bk-head"><b class="bk-title">Feedback<small class="kd-st"><span class="kd-st-a">${SPIN}Reading your draft</span><span class="kd-st-b ct-bad">${X_ICON}${NOTES.length} problems</span></small></b><span class="ct-score">2/10</span></div>
    <div class="bk-view ct-fview">
      <div class="ct-mail"><div class="ct-mail-h"><span class="ct-att-ic">${MAIL_ICON}</span><span>Subject: <b>${markUp(x, MAIL_SUBJECT)}</b></span></div><div class="ct-mail-b">${body}</div></div>
      <ol class="ct-notes">${notes}</ol>
      <div class="ct-verdict"><b>Verdict:</b> ${x.esc(VERDICT)}</div>
    </div>
  </div>`);
  const lis = [...node.querySelectorAll('.ct-notes li')], verdict = node.querySelector('.ct-verdict'), score = node.querySelector('.ct-score');
  const marks = [...node.querySelectorAll('.ct-mk')], nums = [...node.querySelectorAll('.ct-mn')];
  const [reading, bad] = node.querySelectorAll('.kd-st > span');
  const spin = reading.querySelector('.ct-spin');
  return { node, render(t, F) {
    put(spin, 'transform', `rotate(${(Math.max(0, t - F.card) * 540).toFixed(1)}deg)`);
    lis.forEach((li, i) => {
      const k = outCubic(seg(t, F.notes[i], F.notes[i] + 0.3));
      put(li, 'opacity', k.toFixed(3));
      put(li, 'transform', k >= 1 ? 'none' : `translateY(${((1 - k) * 8).toFixed(2)}px)`);
    });
    // each phrase lights as its note lands, its number popping beside it
    for (const m of marks) m.classList.toggle('on', t >= F.notes[+m.dataset.n - 1]);
    for (const nm of nums) {
      const at = F.notes[+nm.dataset.n - 1];
      fade(nm, seg(t, at, at + 0.08));
      put(nm, 'transform', `scale(${lerp(0.3, 1, outBack(seg(t, at, at + 0.3))).toFixed(4)})`);
    }
    const v = outCubic(seg(t, F.verdict, F.verdict + 0.3));
    fade(verdict, v);
    put(verdict, 'transform', v >= 1 ? 'none' : `translateY(${((1 - v) * 8).toFixed(2)}px)`);
    fade(score, seg(t, F.verdict, F.verdict + 0.1));
    put(score, 'transform', `scale(${lerp(0.4, 1, outBack(seg(t, F.verdict, F.verdict + 0.35))).toFixed(4)})`);
    const d = outCubic(seg(t, F.notes[0] - 0.15, F.notes[0] + 0.05));
    fade(reading, 1 - d); fade(bad, d);
  } };
}

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the chain keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheets();
    loadFrameSheet();
    const T = k.T, { A, M, O, S, U, D, C, F } = T;
    // the v16 cue sheet: the first ask as the engine types it, the four this beat types; the cat landing takes the photo's
    // hit, the 3D cat the model's, the order its bell, the song's press ends the bed (moved to the song's G major, -4), the
    // cards rise, the generations tick, and Discord connecting, the GIF sent, his answer, every cancel, each style landing
    // and the pick, each captcha tap, Verify and Verified, each feedback note and the verdict resolve
    const cues = {
      transpose: -4,
      typing: [{ text: k.askBy[ID], s: k.s, end: k.typeEnd }, ...T.steps.map((st) => ({ text: st.ask, s: st.s, end: st.typeEnd }))],
      sends: [k.send, ...T.steps.map((st) => st.send)],
      camera: k.send, // the first send drops the composer and pulls the camera out (tabs.9b47fc30.js)
      resolved: [A.conn, A.sent, A.reply, ...U.dones, ...D.lands, D.pick, ...C.taps, C.verify, C.done, ...F.notes, F.verdict],
      cards: [A.card, ...T.steps.map((st) => st.card)],
      gens: [[M.gen0, M.done], [S.gen0, S.done]],
      image: A.done, model: M.done, order: O.done, play: S.play,
      cover: T.cut, pop: T.cut + END_DELAY, word: T.cut + END_DELAY + 0.3, end: T.end,
    };
    const v16 = makePlayerV16(cues, ID);
    addEventListener('variantchange', () => v16.stop());
    // the song's level against the clock: whole from its press through the last ask's typing, eased down under its card, faded evenly
    // in dB to -40 dB as the end card covers the chat; lower again (0.6) from the website ask on (syncAudio below, and the export's mixdown)
    const songGain = (t) => lerp(1, SONG_UNDER, inOutCubic(seg(t, U.send - 0.2, U.send + 0.5))) * lerp(1, 0.6, seg(t, D.s, D.s + 0.6)) * Math.pow(0.01, seg(t, T.cut, T.cut + SONG_FADE));
    const songStop = Math.min(S.play + DUR, T.cut + SONG_FADE);
    // the cut's whole soundtrack for offline renders (window.__EXPORT_AUDIO, read by export-render.07e9fa90.mjs and the
    // film's capture): this cue sheet's score with the song laid in at its press under songGain, at 0.9 as the page plays
    // it, so the file's sound is the page's
    let mixdown = null;
    (window.__EXPORT_AUDIO ||= {})[ID] = () => (mixdown ||= Promise.all([
      renderScore(cues),
      fetch(SONG).then((r) => { if (!r.ok) throw new Error(`${r.status} ${SONG}`); return r.arrayBuffer(); }).then((ab) => new OfflineAudioContext(2, 1, 48000).decodeAudioData(ab)),
    ]).then(([{ buffer }, song]) => {
      const sr = buffer.sampleRate, at = Math.round(S.play * sr), stop = Math.round(songStop * sr);
      for (let c = 0; c < 2; c++) {
        const out = buffer.getChannelData(c), voice = song.getChannelData(Math.min(c, song.numberOfChannels - 1));
        for (let i = 0; i < voice.length && at + i < Math.min(out.length, stop); i++) out[at + i] += voice[i] * 0.9 * songGain((at + i) / sr);
      }
      return buffer;
    }));
    // the capture's cues (the film's compose script reads them): when each card is the one in focus, and the cut
    window.__CATS_CUES = { r: T.r, cut: T.cut, end: T.end, play: S.play, send0: k.send, cancelled: U.done, pick: D.pick, verified: C.done, verdict: F.verdict,
      steps: T.steps.map((st) => ({ ask: st.ask, s: st.s, send: st.send, r: st.r, card: st.card })),
      focus: [[A.card - 0.3, '.ct-dm'], [M.send - 0.2, '.mc-3d'], [O.send - 0.2, '.mc-dd'], [S.send - 0.2, '.mc-sg'], [U.send - 0.2, '.ct-subs'], [D.send - 0.2, '.ct-web'], [C.send - 0.2, '.ct-cap'], [F.send - 0.2, '.ct-fb']] };

    // 1. the DM, in the engine's own reply
    const say1 = sayEl(x, SAY[0]);
    const dm = dmCard(x);
    const anchor = () => x.el('<i class="mc-anchor" aria-hidden="true"></i>');
    const anchor1 = anchor();

    // 2-5: each ask's user bubble and its reply
    const follow = [];
    const steps = T.steps.map((st, i) => {
      const u = x.el(`<div class="msg qc-u"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div>${st.att ? mailAtt() : ''}<div class="m-text">${x.esc(st.ask)}</div></div></div>`);
      const reply = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"></div></div>`);
      const say = sayEl(x, SAY[i + 1]);
      reply.lastElementChild.append(say.n);
      follow.push(u, reply);
      return { st, u, reply, say };
    });
    const [mStep, oStep, sStep, uStep, dStep, cStep, fStep] = steps;

    // 2. the 3D cat in the artifact frame
    const model = x.el(`<div class="bk mc-3d"><div class="bk-head"><b class="bk-title">Cat 3D model<small>Rigged · GLB</small></b>${shareBtn('Cat 3D model', { file: MODEL })}${EXPAND}<a class="bk-btn bk-publish" href="${MODEL}" download="cat.glb">${DL_GLYPH}Download</a></div><div class="bk-view qc-3d qc-skel"><canvas width="1400" height="875" role="img" aria-label="A hyperrealistic 3D tabby cat model walking on a turntable"></canvas><i class="qc-sk"></i>${genl('Creating 3D model')}</div></div>`);
    mStep.reply.lastElementChild.append(model);
    mStep.out = model;
    const canvas = model.querySelector('canvas'), skM = model.querySelector('.qc-sk'), genM = genPill(model);

    // 3. the DoorDash order
    const order = x.el(`<div class="bk mc-dd"><div class="bk-head"><b class="bk-title">Petco order<small>1 item · $16.49 subtotal</small></b>${shareBtn('Petco order')}<a class="bk-btn bk-publish mc-dd-open" href="${STORE}" target="_blank" rel="noopener noreferrer"><img src="${x.brand('doordash-logo.svg')}" alt="">View in DoorDash</a></div><div class="bk-view"><div class="mc-dd-cam"><div class="mc-dd-zoom"><img class="mc-dd-shot" src="${ORDER}" width="896" height="560" alt="${x.esc(ORDER_ALT)}"></div></div><i class="bk-sh"></i></div></div>`);
    oStep.reply.lastElementChild.append(order);
    oStep.out = order;
    const zoom = order.querySelector('.mc-dd-zoom'), shO = order.querySelector('.bk-sh');

    // 4. the song: cover, title, play button, waveform and clock, the sung line under the strip
    const song = x.el(`<div class="mc-sg ct-sg"><div class="mc-sg-card">
      <div class="mc-sg-art"><img src="${COVER}" width="256" height="256" alt="Cover art: an orange tabby cat's face"/></div>
      <div class="mc-sg-side">
        <div class="mc-sg-t"><b>${TITLE}</b><small>Indie pop</small></div>
        <div class="mc-sg-row"><span class="mc-sg-btn">${PLAY}${PAUSE}</span><div class="mc-sg-wave">${wave('mc-w0')}${wave('mc-w1')}</div><span class="mc-sg-time">${clock(0)} / ${clock(DUR)}</span></div>
      </div>
      <button type="button" class="mc-sg-share" ${shareAttrs(`${TITLE}, a song about cats`, { file: SONG })}>${SHARE_GLYPH}</button>
      <a class="mc-sg-dl" href="${SONG}" download="nine-lives.mp3" aria-label="Download" title="Download">${DOWNLOAD}</a>
      <div class="mc-sg-gen qc-skel"><i class="qc-sk"></i>${genl('Creating song')}</div>
    </div><div class="mc-ly" aria-live="off"></div></div>`);
    sStep.reply.lastElementChild.append(song);
    sStep.out = song;
    const $s = (q) => song.querySelector(q);
    const btn = $s('.mc-sg-btn'), time = $s('.mc-sg-time'), played = $s('.mc-w1'), lyric = $s('.mc-ly');
    const skelS = $s('.mc-sg-gen'), skS = $s('.mc-sg-gen .qc-sk'), genS = genPill(skelS);
    const [playIcon, pauseIcon] = btn.querySelectorAll('svg');

    // 5. the subscriptions
    const subs = subsCard(x);
    uStep.reply.lastElementChild.append(subs.node);
    uStep.out = subs.node;

    // 6. the styles, 7. the captcha
    const web = webCard(x);
    dStep.reply.lastElementChild.append(web.node);
    dStep.out = web.node;
    const cap = capCard(x);
    cStep.reply.lastElementChild.append(cap.node);
    cStep.out = cap.node;
    // 8. the feedback
    const fb = fbCard(x);
    fStep.reply.lastElementChild.append(fb.node);
    fStep.out = fb.node;
    for (const p of steps) { p.anchor = anchor(); p.reply.lastElementChild.append(p.anchor); }
    // Space and Enter press the cards' controls, not the spot's clock (timeline.9b47fc30.js), as on the other beats
    for (const n of [dm.node, model, order, song, subs.node, web.node, cap.node, fb.node]) n.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('a, button')) e.stopPropagation(); });

    // the end card and the x50 badge ride in nodes (so other variants hide them) and move to the scene section on the
    // first render, above the hub
    const endCard = x.el(`<div class="mc-end" role="img" aria-label="superbot.gg"><div class="mc-end-word"><b>superbot.gg</b></div><div class="mc-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.mc-end-word'), endBot = endCard.querySelector('.mc-end-bot');
    const ff = x.el(`<div class="mc-ff" aria-hidden="true">x${X}</div>`);
    let endK = 1;

    // the song's element follows the clock: it plays while the clock runs through its window, at the clock's speed, under
    // songGain and the sound pill's mute (songLevel)
    const audio = new Audio();
    audio.preload = 'auto';
    let blocked = false;
    const unblock = () => { blocked = false; };
    addEventListener('variantchange', () => audio.pause());
    addEventListener('message', (e) => { if (e.data && e.data.type === 'unmute') unblock(); });
    function syncAudio(t) {
      const ad = window.__AD;
      const running = !document.body.classList.contains('freeze') && !!ad && ad.playing;
      if (!running || t < S.play || t >= songStop) { if (!audio.paused) audio.pause(); return; }
      audio.volume = clamp(songGain(t) * 0.9 * (music() === 'v16' ? songLevel() : 1));
      const rate = ad.speed || 1;
      if (audio.playbackRate !== rate) audio.playbackRate = rate;
      const at = t - S.play;
      if (Math.abs(audio.currentTime - at) > 0.3) audio.currentTime = at;
      if (audio.paused && !blocked) {
        audio.play().catch((e) => {
          // autoplay with sound waits for a gesture: the next click or key lets it start
          blocked = true;
          console.warn(`${ID}: the song waits for a click or key to play (autoplay policy)`, e);
          addEventListener('pointerdown', unblock, { once: true });
          addEventListener('keydown', unblock, { once: true });
        });
      }
    }

    let placed = false, viewer = null, decoding = false, sec = -1, cutPct = -1, playing = null, lineN = -1, lit = -1;
    return {
      nodes: [say1.n, dm.node, anchor1, ...follow, endCard, ff],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[A.r, say1.n], [A.card, anchor1], ...steps.flatMap((p) => [[p.st.send, p.u], [p.st.r, p.say.n], [p.st.card, p.anchor]])],
      // the seven follow-up asks, typed into the composer and sent by the engine (the feedback ask with its email's chip);
      // no routing chips, so the composer stays on Superbot
      asks: T.steps.map((st) => ({ text: st.ask, s: st.s, typeEnd: st.typeEnd, send: st.send, ...(st.att ? { att: MAIL_CHIP } : {}) })),
      chips: [],
      // the pointer, in the section's px (chat.9b47fc30.js placeCursor): the user's, in from below right to the picked
      // style and a click; then superbot's, across the cat tiles in turn, a tap on each, and Verify
      pointer(t, toScr) {
        if (t >= D.ptr - 0.05 && t < D.pick + 0.9) {
          const b = x.box(web.pickEl);
          const at = path(t, [{ t: D.ptr, ...toScr({ x: b.cx + 170, y: b.cy + 150 }) }, { t: D.pick - 0.08, ...toScr({ x: b.cx + 10, y: b.cy + 8 }) }]);
          const p = seg(t, D.pick - 0.08, D.pick) * (1 - seg(t, D.pick + 0.02, D.pick + 0.16));
          return { x: at.x, y: at.y, p, v: seg(t, D.ptr - 0.05, D.ptr + 0.12) * (1 - seg(t, D.pick + 0.55, D.pick + 0.9)) };
        }
        if (t >= C.go - 0.05 && t < C.done + 0.7) {
          const els = cap.targets(), times = [...C.taps, C.verify];
          const pts = els.map((el, i) => { const b = x.box(el); return { t: times[i] - 0.08, ...toScr({ x: b.cx + 4, y: b.cy + 6 }) }; });
          const start = { t: C.go, x: pts[0].x + 120, y: pts[0].y + 170 };
          // it rests on each target from its arrival to its tap, then moves on
          const keys = [start, ...pts.flatMap((q, i) => [q, { t: times[i] + 0.04, x: q.x, y: q.y }])];
          const at = path(t, keys);
          const p = Math.max(0, ...times.map((tt) => seg(t, tt - 0.06, tt) * (1 - seg(t, tt + 0.02, tt + 0.14))));
          return { x: at.x, y: at.y, p, v: seg(t, C.go - 0.05, C.go + 0.12) * (1 - seg(t, C.done + 0.35, C.done + 0.7)) };
        }
        return null;
      },
      render(t) {
        if (!placed) {
          let at = say1.n.closest('.msg');
          for (const m of follow) { at.after(m); at = m; }
          x.hub.closest('.scene').append(endCard, ff);
          audio.src = SONG;
          placed = true;
        }
        if (!decoding) {
          decoding = true;
          for (const pic of [...dm.node.querySelectorAll('img'), order.querySelector('img'), song.querySelector('img'), ...subs.node.querySelectorAll('img'), ...web.node.querySelectorAll('img'), ...cap.node.querySelectorAll('img')]) {
            track(pic.decode().catch((e) => console.error(new Error(`${ID} image failed to decode: ${pic.src}`, { cause: e }))));
          }
          const sprite = new Image();
          sprite.src = SPRITE;
          track(sprite.decode().catch((e) => console.error(new Error(`${ID} GIF frames failed to decode: ${SPRITE}`, { cause: e }))));
        }
        if (!viewer) { viewer = makeCatViewer(canvas, MODEL); track(viewer.ready); }
        if (music() === 'v16') v16.sync(t); else v16.stop();
        syncAudio(t);

        // 1. the DM
        say1.render(t, A.r);
        enter(dm.node, t, A.card);
        dm.render(t, A);

        // 2-5: the bubbles and replies, as the engine draws its own
        for (const p of steps) { x.appear(p.u, t, p.st.send); x.appear(p.reply, t, p.st.r); p.say.render(t, p.st.r); }

        // 2. the 3D cat: builds behind the skeleton, lands, walks as the turntable turns
        const cm = enter(model, t, M.card);
        if (cm > 0) viewer.draw({ spin: -0.3 + 0.22 * (t - M.w1), time: t - M.card });
        const lpm = landing(t, M.done);
        shimmer(skM, t, M.card, 0, lpm);
        settle(canvas, lpm);
        const gm = genM(t, M.gen0, M.done, M.w1, GEN.model);

        // 3. the order: a skeleton until O.done, then the card fades in and settles
        enter(order, t, O.card);
        const lpo = landing(t, O.done);
        shimmer(shO, t, O.card, 0, lpo);
        settle(zoom, lpo);

        // 4. the song: a skeleton while it generates, then the press, the waveform uncovering, the sung line lighting
        enter(song, t, S.card);
        const lps = landing(t, S.done);
        shimmer(skS, t, S.card, 0, lps);
        fade(skelS, 1 - lps);
        const gs = genS(t, S.gen0, S.done, S.w1, GEN.song);
        fade(ff, Math.max(gm, gs));
        const el = Math.min(DUR, Math.max(0, t - S.play));
        const s = Math.floor(el);
        if (s !== sec) { time.textContent = `${clock(s)} / ${clock(DUR)}`; sec = s; }
        const c = +((1 - el / DUR) * 100).toFixed(3);
        if (c !== cutPct) { played.style.clipPath = `inset(0 ${c}% 0 0)`; cutPct = c; }
        const press = seg(t, S.play - 0.12, S.play) * (1 - seg(t, S.play, S.play + 0.1));
        btn.style.transform = press > 0 ? `scale(${(1 - 0.12 * press).toFixed(4)})` : 'none';
        const on = t >= S.play;
        if (on !== playing) { playIcon.style.display = on ? 'none' : ''; pauseIcon.style.display = on ? '' : 'none'; playing = on; }
        let li = 0;
        while (li + 1 < LINES.length && el >= LINE_AT[li + 1]) li++;
        if (li !== lineN) { lyric.innerHTML = LINE_WORDS[li].map((w) => `<span>${x.esc(w[0])}</span>`).join(' '); lineN = li; lit = -1; }
        const n = on ? LINE_WORDS[li].filter((w) => el >= w[1]).length : 0;
        if (n !== lit) { [...lyric.children].forEach((w, i) => w.classList.toggle('on', i < n)); lit = n; }
        lyric.style.opacity = seg(t, S.play - 0.2, S.play + 0.2).toFixed(3);

        // 5. the subscriptions
        enter(subs.node, t, U.card);
        subs.render(t, U);

        // 6. the styles, 7. the captcha
        enter(web.node, t, D.card);
        web.render(t, D);
        enter(cap.node, t, C.card);
        cap.render(t, C);
        enter(fb.node, t, F.card);
        fb.render(t, F);

        // the end card: the chat fades to black, then the house card's own run (multicat.516afb1a.js)
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
          const pop = clamp(tc / 0.55), shift = outQuint(clamp((tc - 0.3) / 1.0));
          endBot.style.opacity = outQuint(clamp(tc / 0.3)).toFixed(3);
          endBot.style.transform = `translate(${(left + wordW + gap).toFixed(2)}px, ${(midY - w / 2).toFixed(2)}px) scale(${(0.72 + 0.28 * popBack(pop)).toFixed(4)})`;
          endWord.style.opacity = shift.toFixed(3);
          endWord.style.filter = shift < 1 ? `blur(${(6 * kk * (1 - shift)).toFixed(2)}px)` : 'none';
          endWord.style.transform = `translate(${(left - 20 * kk * (1 - shift)).toFixed(2)}px, -50%)`;
        }
      },
    };
  },
};
