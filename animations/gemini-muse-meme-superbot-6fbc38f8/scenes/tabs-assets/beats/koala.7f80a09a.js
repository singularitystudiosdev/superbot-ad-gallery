// Koala beat (the 'koala-discord' variant): two Discord asks in one chat, cut like the bare multicat-credits chain
// (multicat.516afb1a.js `bare`): no routing chips, no model headers, the composer on Superbot throughout, and the house
// superbot.gg end card at the close. The engine types and sends the first ask ("Send mrmoonshot a koala gif in discord")
// and this beat answers it; then it carries the chat on by itself, typing, sending and answering the second ("Ok now react
// to every message of his with a koala emoji") in its own reply.
//   1. The GIF, sent: the DM with mrmoonshot in Discord's dark theme. The user's message waits greyed, as Discord shows one
//      still sending, its GIF slot a skeleton while a koala GIF is found; the koala lands and yawns (a real clip cut to a
//      33-frame loop, stepped at the GIF's own 12.5 fps), the message goes through and the frame's header reads Sent; then
//      mrmoonshot is typing, and his answer lands under it.
//   2. The reactions: the same DM, the whole history this time. A koala reaction pops onto each of his messages, newest
//      first, one after another, as the log scrolls back through the days to Discord's own start of the history; the
//      frame's header counts them up to all of his messages.
//   3. the house superbot.gg end card covers the chat.
// Under it plays 16 · Punchy premium groove (multicat-player.96834de7.js), the credits cuts' default soundtrack, re-cued
// to this chain: the koala landing takes the model's hit (the fuller section follows it), his answer the order's bell, each
// reaction a resolve tick, the last one the photo's hit, and the bed builds into the end card.
// The follow-up messages are built here and moved in after the engine's reply on the first render (they ride in
// inst.nodes, so the engine's show() hides them under every other variant). The engine reads inst.asks (the composer's
// typing and send presses) for them (chat.9b47fc30.js). A pure function of t, except the score, which follows the clock and
// never drives it. Its stylesheet (../koala.7f80a09a.css) loads with the module. The history, the times and mrmoonshot's
// answer are made up and nothing was sent to anyone; the koala is a real clip (media/koala.7f80a09a/CREDITS.txt).
import { clamp, lerp, seg, outCubic, outQuint, outBack, inOutCubic, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { LAND, landing, shimmer, settle } from './thumb-land.309eb9c5.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { shareBtn } from './share.29a362ea.js';
import { music } from '../../../music.47e5d94a.js?v=2';
// the URL multicat.516afb1a.js imports too, so every chain shares one player registry and one v16 pick
import { makePlayer as makePlayerV16 } from './multicat-player.96834de7.js?v=3';

const CSS = new URL('../koala.7f80a09a.css?v=1', import.meta.url).href;
// the end card is multicat's (../multicat.516afb1a.css .mc-end)
const MC_CSS = new URL('../multicat.516afb1a.css?v=9', import.meta.url).href;
export const ID = 'koala-discord';
const asset = (p) => new URL('../../../' + p, import.meta.url).href;
const emojiSrc = (code) => asset(`img/koala.7f80a09a/emoji/${code}.svg`);
const SPRITE = asset('img/koala.7f80a09a/koala-frames.jpg'); // the GIF's 33 frames, 360 x 270 each, 6 across and 6 down
const GIF = asset('media/koala.7f80a09a/koala-yawn.gif');
const DM = 'https://discord.com/channels/@me';
const FRIEND = 'mrmoonshot';
const KOALA = '1f428';
// the Twemoji the messages use inline, by the token a line writes ({sob})
const EMOJI = { sob: '1f62d', skull: '1f480' };

export const TYPE_CPS = 55; // every ask types at this rate; the first one through its route's typeCps (chat.9b47fc30.js)
const ASK2 = 'Ok now react to every message of his with a koala emoji';

// the DM's history, oldest first: a day's divider, or one author's run of messages (one line each, as Discord groups
// them under one name). The last run is mrmoonshot's answer to the GIF, which lands live on the first card
const LOG = [
  { day: 'September 28, 2026' },
  { who: 'm', time: '9/28/26, 4:12 PM', lines: ['yo', 'you coming to the rooftop thing saturday'] },
  { who: 's', time: '9/28/26, 4:20 PM', lines: ['whose'] },
  { who: 'm', time: '9/28/26, 4:21 PM', lines: ['jake’s', 'bring chips'] },
  { who: 's', time: '9/28/26, 4:22 PM', lines: ['bet'] },
  { day: 'October 3, 2026' },
  { who: 'm', time: '10/3/26, 11:47 AM', lines: ['did you see the launch', 'it actually landed'] },
  { who: 's', time: '10/3/26, 11:52 AM', lines: ['watching the replay rn'] },
  { day: 'October 9, 2026' },
  { who: 'm', time: '10/9/26, 8:03 PM', lines: ['can i borrow your charger tmrw', 'mine is cooked {skull}'] },
  { who: 's', time: '10/9/26, 8:05 PM', lines: ['ya'] },
  { who: 'm', time: '10/9/26, 8:05 PM', lines: ['goat'] },
  { day: 'October 14, 2026' },
  { who: 'm', time: '10/14/26, 6:30 PM', lines: ['who’s driving friday'] },
  { who: 's', time: '10/14/26, 6:41 PM', lines: ['not me lol'] },
  { who: 'm', time: '10/14/26, 6:41 PM', lines: ['classic', 'fine i’ll drive'] },
  { day: 'October 17, 2026' },
  { who: 'm', time: 'Today at 9:12 PM', lines: ['bro you up'] },
  { who: 's', time: 'Today at 9:41 PM', gif: true },
  { who: 'm', time: 'Today at 9:41 PM', lines: ['LMAOOO why a koala {sob}'], reply: true },
];
// his messages, every one of which takes a koala
const N = LOG.filter((m) => m.who === 'm').reduce((n, m) => n + m.lines.length, 0);
const SAY1 = `Sent ${FRIEND} a koala GIF on Discord.`;
const SAY2 = `Reacted with a koala to all ${N} of ${FRIEND}’s messages.`;

// a card's rise and the feed's glide to it (chat.9b47fc30.js renderScroll) both take this long: its work starts once in view
const SEEN = 0.45;
const FIND = 0.7;        // the GIF slot's skeleton: a koala GIF found
const SEND_AFTER = 0.3;  // the landed GIF to its message going through (Sent)
const TYPE_IN = 0.45;    // Sent to mrmoonshot typing
const TYPING = 1.0;      // his typing, to his answer landing
const GROW = 0.3;        // his answer's row opening under the GIF
const HOLD_A = 1.4;      // his answer, to the second ask starting to type
const POP = 0.28;        // one reaction to the next
const FIRST = 0.6;       // the first reaction (his answer to the GIF) to the next: the GIF stands between them, so it is held
const TOP_IN = 0.6;      // the last reaction to the log resting on the history's start
const HOLD_B = 1.6;      // the last reaction to the end card's cover
// the GIF's clock: 33 frames at 8 cs, the delay the exported file carries (media/koala.7f80a09a/koala-yawn.gif)
const FPS = 12.5, FRAMES = 33, COLS = 6, ROWS = 6;
// the house end card (multicat.516afb1a.js): the chat fades to its black over END_IN, the card's own 2.5s run starts
// END_DELAY in (mascot pops in, superbot.gg fades up beside it, hold)
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5;
const END_GAP = 44;
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const END_FACE = '<svg class="mc-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="kdEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#kdEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#kdEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#kdEndFace)"/></svg>';
// the Discord mark (Simple Icons, CC0), inlined so a frozen frame never waits on it; on the default avatars too
const MARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>';
// lucide check, plus and download (api.iconify.design/lucide): Sent's tick, the message box's attach button, the GIF's save
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
const PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg>';
const DL_GLYPH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>';

// every time in the chain, from the first reply r: the GIF card comes in at A.card, its slot shimmers from gen0 until the
// koala lands (done), the message goes through (sent), he types and his answer lands (reply). The second ask types from
// B.s; its card comes in at B.card, the reactions pop from B.go (the first held FIRST, then one every POP), and the
// header reads done at B.done.
// Chipless, so the second reply comes where a first chip would have landed (the engine's own bare route)
function plan(r) {
  const card = r + 0.22, gen0 = card + SEEN, done = gen0 + FIND, w1 = done + LAND, sent = w1 + SEND_AFTER;
  const typing = sent + TYPE_IN, reply = typing + TYPING;
  const A = { r, card, gen0, done, w1, sent, typing, reply };
  const s = reply + GROW + HOLD_A, typeEnd = s + ASK2.length / TYPE_CPS, send = typeEnd + 0.15, rr = send + 0.35 + 0.08;
  const at = rr + 0.22, go = at + SEEN + 0.1;
  const pops = Array.from({ length: N }, (_, i) => go + (i ? FIRST + (i - 1) * POP : 0));
  const last = pops[N - 1];
  const B = { s, typeEnd, send, r: rr, card: at, go, pops, done: last + 0.2, top: last + TOP_IN };
  const cut = last + HOLD_B;
  return { r, A, B, cut, end: cut + END_DELAY + END_LEN };
}
// the chain's length from its first reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

let sheets = false;
function loadSheet() {
  if (sheets) return;
  sheets = true;
  for (const href of [MC_CSS, CSS]) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    track(new Promise((ok) => {
      l.onload = ok;
      l.onerror = () => { console.error(new Error(`koala variant stylesheet failed to load: ${href}`)); ok(); };
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

// a message line, its {token}s drawn as Twemoji
const line = (x, s) => x.esc(s).replace(/\{(\w+)\}/g, (_, k) => `<img src="${emojiSrc(EMOJI[k])}" width="18" height="18" alt=":${k}:"/>`);
const RX_PILL = `<div class="kd-rx"><span class="kd-rx-p"><img src="${emojiSrc(KOALA)}" width="16" height="16" alt=":koala:"/>1</span></div>`;

// the GIF in sam's message: the sprite the beat steps, its tag and its save button; the first card's starts as a skeleton
const gifHtml = (skel) => `<div class="kd-gif${skel ? ' qc-skel' : ''}">
  <div class="kd-gif-f" style="background-image:url('${SPRITE}')" role="img" aria-label="A koala in a gum tree giving a huge yawn"></div>
  <span class="kd-gif-tag">GIF</span>
  <a class="qc-dl" href="${GIF}" download="koala-yawn.gif" aria-label="Download GIF" title="Download">${DL_GLYPH}</a>
  ${skel ? '<i class="qc-sk"></i>' : ''}
</div>`;

// the DM in the artifact frame. `react`: the second card, the whole history from its start with a reaction row under each
// of his messages; else the first, bottom-anchored, his answer in a row that opens when it lands
function dmCard(x, react) {
  const rows = LOG.map((m) => {
    if (m.day) return `<div class="kd-day"><span>${m.day}</span></div>`;
    const body = m.gif ? gifHtml(!react) : m.lines.map((l) => `<div class="kd-line">${line(x, l)}</div>${react && m.who === 'm' ? RX_PILL : ''}`).join('');
    const grp = `<div class="kd-grp${m.gif ? ' kd-g-gif' : ''}"><span class="kd-av kd-av-${m.who}">${MARK}</span><div class="kd-main"><div class="kd-head"><b>${m.who === 'm' ? FRIEND : 'sam'}</b><time>${m.time}</time></div>${body}</div></div>`;
    return m.reply && !react ? `<div class="kd-grow">${grp}</div>` : grp;
  }).join('');
  const start = react ? `<div class="kd-start"><span class="kd-av kd-av-m">${MARK}</span><h3>${FRIEND}</h3><small>${FRIEND}</small><p>This is the beginning of your direct message history with <b>${FRIEND}</b>.</p></div>` : '';
  const status = react
    ? `<span class="kd-st-a">Reacting <b class="kd-n">0</b> of ${N}</span><span class="kd-st-b">${CHECK}${N} reactions added</span>`
    : `<span class="kd-st-a">Sending</span><span class="kd-st-b">${CHECK}Sent</span>`;
  return x.el(`<div class="bk kd${react ? ' kd-rxc' : ''}">
    <div class="bk-head">
      <b class="bk-title">${MARK}<span>Direct message</span><small class="kd-st">${status}</small></b>
      ${shareBtn(react ? `Koala reactions for ${FRIEND}` : 'Koala GIF', react ? {} : { file: GIF })}
      <a class="bk-btn bk-publish kd-open" href="${DM}" target="_blank" rel="noopener noreferrer">${MARK}Open in Discord</a>
    </div>
    <div class="bk-view kd-view">
      <div class="kd-bar"><span class="kd-av kd-av-m">${MARK}</span><b>${FRIEND}</b></div>
      <div class="kd-log${react ? ' kd-scroll' : ''}"><div class="kd-list">${start}${rows}</div></div>
      <div class="kd-input"><span class="kd-plus">${PLUS}</span><span>Message @${FRIEND}</span></div>
      ${react ? '' : `<div class="kd-typing" aria-hidden="true"><span class="kd-dots"><i></i><i></i><i></i></span><span><b>${FRIEND}</b> is typing…</span></div>`}
    </div>
  </div>`);
}

// the GIF's own clock: frame 0 until it lands at `from`, then it loops at its 12.5 fps
function gifStep(frame) {
  let f0 = -1;
  return (t, from) => {
    const f = t < from ? 0 : Math.floor((t - from) * FPS + 1e-6) % FRAMES;
    if (f !== f0) { frame.style.backgroundPosition = `${(((f % COLS) / (COLS - 1)) * 100).toFixed(3)}% ${((Math.floor(f / COLS) / (ROWS - 1)) * 100).toFixed(3)}%`; f0 = f; }
  };
}

// 1. the GIF, sent: the slot shimmers, the koala lands and loops, the message goes through, he types and answers
function sendCard(x) {
  const node = dmCard(x, false);
  const $ = (s) => node.querySelector(s);
  const frame = $('.kd-gif-f'), sk = $('.qc-sk'), tag = $('.kd-gif-tag'), dl = $('.qc-dl');
  const head = $('.kd-g-gif .kd-head'), sending = $('.kd-st-a'), sentEl = $('.kd-st-b');
  const typing = $('.kd-typing'), dots = [...typing.querySelectorAll('.kd-dots i')];
  const grow = $('.kd-grow'), answer = grow.firstElementChild;
  const step = gifStep(frame);
  return { node, render(t, A) {
    const lp = landing(t, A.done);
    shimmer(sk, t, A.card, 0, lp);
    settle(frame, lp);
    fade(tag, lp); fade(dl, lp);
    step(t, A.done);
    // still sending: the message's line sits greyed, as Discord shows one in flight, until it goes through and the frame's
    // header swaps Sending for Sent
    const s = outCubic(seg(t, A.sent, A.sent + 0.2));
    put(head, 'opacity', lerp(0.5, 1, s).toFixed(3));
    fade(sending, 1 - s); fade(sentEl, s);
    // mrmoonshot typing: the line under the message box, its dots pulsing in turn
    put(typing, 'opacity', (seg(t, A.typing, A.typing + 0.15) * (1 - seg(t, A.reply - 0.05, A.reply + 0.1))).toFixed(3));
    dots.forEach((d, i) => put(d, 'opacity', (0.35 + 0.65 * Math.sin(Math.PI * ((((t - A.typing) * 1.6 - i * 0.18) % 1 + 1) % 1))).toFixed(3)));
    // his answer: its row opens and the bottom-anchored log glides up to it (its height read off the laid-out row)
    const g = inOutCubic(seg(t, A.reply, A.reply + GROW));
    put(grow, 'height', g >= 1 ? '' : `${(g * grow.scrollHeight).toFixed(2)}px`);
    put(answer, 'opacity', seg(t, A.reply + 0.05, A.reply + GROW).toFixed(3));
  } };
}

// 2. the reactions: a koala onto each of his messages, newest first, the log scrolled back with them to the history's start.
// A message's reaction row opens as its koala is added (RX_H tall, RX_GAP under the line), as Discord's does, so the log
// grows while it scrolls: every position below is worked out from the log laid out with every row shut, plus the rows open
// above that point at t
const RX_H = 24, RX_GAP = 4, RX = RX_H + RX_GAP, RX_OPEN = 0.22;
function reactCard(x) {
  const node = dmCard(x, true);
  const $ = (s) => node.querySelector(s);
  const log = $('.kd-log'), list = $('.kd-list'), count = $('.kd-n'), going = $('.kd-st-a'), doneEl = $('.kd-st-b');
  // his reactions, newest first: the order they are added in; each pill's row and the message line it sits under
  const pills = [...node.querySelectorAll('.kd-rx-p')].reverse();
  const rows = pills.map((p) => p.parentNode), lines = rows.map((r) => r.previousElementSibling);
  const step = gifStep($('.kd-gif-f'));
  const name = $('.kd-start h3');
  // how open reaction i's row is at t
  const open = (B, i, t) => inOutCubic(seg(t, B.pops[i], B.pops[i] + RX_OPEN));
  // the log laid out with every row shut (../koala.7f80a09a.css .kd-measure): the list's height, the view's, each
  // reaction's message line centre in the list, and where the log comes to rest: the history's start with its big avatar
  // just above the view, so his name, "This is the beginning…" and his first messages with their koalas fill it
  const measure = () => {
    list.classList.add('kd-measure');
    const H0 = list.offsetHeight, V = log.clientHeight;
    const ys = lines.map((ln) => ln.offsetTop + ln.offsetHeight / 2);
    const rest = Math.max(0, name.offsetTop - 6);
    list.classList.remove('kd-measure');
    return H0 && V ? { H0, V, ys, rest } : null;
  };
  // where the log is scrolled to (px from the list's top) at t: it follows the reaction being added, holding that message
  // FOCUS down the view just after its koala lands (the rows above it are still shut then, as they are added newest first),
  // so each pill is read on its way down the view before the next; then it rests on the start of the history (rest). Straight
  // lines between those stops, averaged over 0.3 s so the glide never steps, and held inside the list as it is at t
  const FOCUS = 0.42, LAG = 0.12;
  const scrollAt = (g, B, t) => {
    const fill = (i) => g.H0 + RX * (i + 1) - g.V; // the furthest it can scroll once row i is open
    const stops = B.pops.map((at, i) => [at + LAG, clamp(g.ys[i] - FOCUS * g.V, g.rest, Math.max(g.rest, fill(i)))]);
    // the first stop is held until just before the second reaction, so his answer's koala is read before the log moves on
    const keys = [[B.card, Math.max(0, g.H0 - g.V)], stops[0], [B.pops[1] - 0.1, stops[0][1]], ...stops.slice(1), [B.top, g.rest]];
    const at = (u) => {
      if (u <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i++) if (u <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], (u - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
      return g.rest;
    };
    let sum = 0;
    for (let k = -3; k <= 3; k++) sum += at(t + k * 0.05);
    const H = g.H0 + RX * B.pops.reduce((s, _, i) => s + open(B, i, t), 0);
    return clamp(sum / 7, 0, Math.max(0, H - g.V));
  };
  let shownN = -1, shownY = '';
  return { node, render(t, A, B) {
    step(t, A.done);
    const g = measure();
    if (g) {
      const y = `translateY(${(-scrollAt(g, B, t)).toFixed(2)}px)`;
      if (y !== shownY) { list.style.transform = y; shownY = y; }
    }
    // each reaction's row opens and its pill pops in: up from small with a little overshoot, Discord's own pop
    pills.forEach((p, i) => {
      const at = B.pops[i], o = open(B, i, t);
      put(rows[i], 'height', `${(RX_H * o).toFixed(2)}px`);
      put(rows[i], 'marginTop', `${(RX_GAP * o).toFixed(2)}px`);
      // clipped only while it opens, so the pop's overshoot is not
      put(rows[i], 'overflow', o >= 1 ? 'visible' : '');
      const q = outBack(seg(t, at + 0.04, at + 0.32));
      put(p, 'opacity', seg(t, at + 0.04, at + 0.14).toFixed(3));
      put(p, 'transform', q >= 1 ? 'none' : `scale(${lerp(0.4, 1, q).toFixed(4)})`);
    });
    const n = B.pops.filter((at) => t >= at).length;
    if (n !== shownN) { count.textContent = String(n); shownN = n; }
    const d = outCubic(seg(t, B.done, B.done + 0.2));
    fade(going, 1 - d); fade(doneEl, d);
  } };
}

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the chain keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheet();
    loadFrameSheet();
    const T = k.T, { A, B } = T;
    // 16 · Punchy premium groove: the multicat score rendered from this chain's cue sheet. The koala landing takes the
    // model's hit (the fuller section follows it), his answer the order's bell, every reaction a resolve tick and the last
    // one the photo's hit; the song's press sits on the end card's cover, where the bed resolves
    const v16 = makePlayerV16({
      typing: [{ text: k.askBy[ID], s: k.s, end: k.typeEnd }, { text: ASK2, s: B.s, end: B.typeEnd }],
      sends: [k.send, B.send],
      camera: k.send, // the first send drops the composer and pulls the camera out (tabs.9b47fc30.js)
      resolved: B.pops,
      cards: [A.card, B.card],
      gens: [],
      image: B.done, model: A.done, order: A.reply, play: T.cut,
      cover: T.cut, pop: T.cut + END_DELAY, word: T.cut + END_DELAY + 0.3, end: T.end,
    }, ID);
    addEventListener('variantchange', () => v16.stop());

    // 1. the GIF, in the engine's own reply
    const say1 = sayEl(x, SAY1);
    const sent = sendCard(x);
    const anchor = () => x.el('<i class="kd-anchor" aria-hidden="true"></i>');
    const anchor1 = anchor();

    // 2. the second ask's user bubble and its reply
    const u = x.el(`<div class="msg qc-u"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(ASK2)}</div></div></div>`);
    const reply = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"></div></div>`);
    const say2 = sayEl(x, SAY2);
    const reacts = reactCard(x);
    const anchor2 = anchor();
    reply.lastElementChild.append(say2.n, reacts.node, anchor2);
    const follow = [u, reply];
    // Space and Enter press the cards' controls, not the spot's clock (timeline.9b47fc30.js), as on the other beats
    for (const n of [sent.node, reacts.node]) n.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('a, button')) e.stopPropagation(); });

    // the end card: the house superbot.gg lockup over the spot's black; it rides in nodes (so other variants hide it) and
    // moves to the scene section on the first render, above the hub
    const endCard = x.el(`<div class="mc-end" role="img" aria-label="superbot.gg"><div class="mc-end-word"><b>superbot.gg</b></div><div class="mc-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.mc-end-word'), endBot = endCard.querySelector('.mc-end-bot');
    let endK = 1, placed = false, decoding = false;

    return {
      nodes: [say1.n, sent.node, anchor1, ...follow, endCard],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[A.r, say1.n], [A.card, anchor1], [B.send, u], [B.r, say2.n], [B.card, anchor2]],
      // the second ask, typed into the composer and sent by the engine (renderComposer); no chips, so the composer's
      // platform chip stays on Superbot (renderRouting)
      asks: [{ text: ASK2, s: B.s, typeEnd: B.typeEnd, send: B.send }],
      chips: [],
      render(t) {
        if (!placed) {
          // the follow-ups leave the engine's reply for the feed, in order right after it
          let at = say1.n.closest('.msg');
          for (const m of follow) { at.after(m); at = m; }
          x.hub.closest('.scene').append(endCard);
          placed = true;
        }
        if (!decoding) {
          decoding = true;
          for (const pic of [...sent.node.querySelectorAll('img'), ...reacts.node.querySelectorAll('img')]) {
            track(pic.decode().catch((e) => console.error(new Error(`${ID} emoji failed to decode: ${pic.src}`, { cause: e }))));
          }
          const sprite = new Image();
          sprite.src = SPRITE;
          track(sprite.decode().catch((e) => console.error(new Error(`${ID} GIF frames failed to decode: ${SPRITE}`, { cause: e }))));
        }
        if (music() === 'v16') v16.sync(t); else v16.stop();

        // 1. the GIF: the card rises, the koala is found and lands, the message goes through, he answers
        say1.render(t, A.r);
        enter(sent.node, t, A.card);
        sent.render(t, A);

        // 2. the bubble and the reply, as the engine draws its own; the history scrolls back under the reactions
        x.appear(u, t, B.send);
        x.appear(reply, t, B.r);
        say2.render(t, B.r);
        enter(reacts.node, t, B.card);
        reacts.render(t, A, B);

        // 3. the end card: the chat fades to black, then the house card's own run (multicat.516afb1a.js)
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
