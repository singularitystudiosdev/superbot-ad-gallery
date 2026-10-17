// Discord beat (the 'discord-credits' variant): two asks in one chat, cut like the bare multicat-credits chain
// (multicat.516afb1a.js `bare`): no routing chips, no model headers, no credits, the composer on Superbot throughout, each
// wait fast-forwarded under a badge in the frame's bottom right, and the house superbot.gg end card at the close. The
// engine types and sends the first ask ("Give me a breakdown of what emojis i use most in discord") and this beat answers
// it; then it carries the chat on by itself, typing, sending and answering the second ("Send jimmydodat133 a gif of a frog
// dancing") in its own reply.
//   1. The breakdown: an artifact frame (bakery.005f5570.css .bk) over the user's top eight emojis from the last 30 days
//      of messages and reactions (the scope Discord's own Checkpoint recap counts): #1 large on the left, #2 to #8 ranked
//      on bars beside it, each drawn in Twemoji, the emoji art Discord itself renders. Its pill counts the read of the
//      account's messages; as it lands the bars grow and the counts run up.
//   2. The GIF, sent: the DM with jimmydodat133 drawn in Discord's dark theme. The user's message waits with its line
//      greyed, as Discord shows one still sending, its GIF a skeleton while the GIF is made; the frog lands and dances (a real Gemini
//      Omni generation cut to a 38-frame loop, stepped at the GIF's own 12.5 fps), then the message turns solid and the
//      frame's header reads Sent; then
//   3. the house superbot.gg end card covers the chat.
// Under it plays 16 · Punchy premium groove (multicat-player.96834de7.js), the credits cuts' default soundtrack, re-cued
// to this chain: the breakdown lands on the photo's hit, the frog on the model's, Sent on the order's bell, and with no
// song to hand over to, the bed builds straight into the end card.
// The follow-up messages are built here and moved in after the engine's reply on the first render (they ride in
// inst.nodes, so the engine's show() hides them under every other variant). The engine reads inst.asks (the composer's
// typing and send presses) for them (chat.9b47fc30.js). A pure function of t, except the score, which follows the clock
// and never drives it. Its stylesheet (../discord.bccc0fdd.css) loads with the module. The emoji counts are mock data and
// nothing was sent to anyone; the frog is a real generation (img/discord.bccc0fdd/CREDITS.txt).
import { clamp, lerp, seg, outCubic, outQuint, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { LAND, landing, shimmer, settle } from './thumb-land.309eb9c5.js';
import { EXPAND, loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { shareBtn } from './share.29a362ea.js';
import { music } from '../../../music.47e5d94a.js?v=2';
// the URL multicat.516afb1a.js imports too, so every chain shares one player registry and one v16 pick
import { makePlayer as makePlayerV16 } from './multicat-player.96834de7.js?v=4';

const CSS = new URL('../discord.bccc0fdd.css?v=1', import.meta.url).href;
export const ID = 'discord-credits';
const asset = (p) => new URL('../../../' + p, import.meta.url).href;
const emojiSrc = (code) => asset(`img/discord.bccc0fdd/emoji/${code}.svg`);
const FROG = asset('img/discord.bccc0fdd/frog-frames.jpg'); // the GIF's 38 frames, 480 x 270 each, 6 across and 7 down
const GIF = asset('media/discord.bccc0fdd/frog-dance.gif');
const DM = 'https://discord.com/channels/@me';
const FRIEND = 'jimmydodat133';

export const TYPE_CPS = 55; // every ask types at this rate; the first one through its route's typeCps (chat.9b47fc30.js)
const SAY1 = 'Here are the emojis you use most on Discord, from the last 30 days.';
const SAY2 = `Sent ${FRIEND} a GIF of a frog dancing.`;
const ASK2 = `Send ${FRIEND} a gif of a frog dancing`;
// every wait plays fast-forwarded X times (the frame's badge says so): each card's pill counts its job's real wall-clock
// seconds, GEN, at X times the spot's clock, so its skeleton holds GEN / X seconds before the answer lands.
//   scan: reading 30 days of the account's messages and reactions and tallying their emojis, about 40 s (an estimate:
//         no tool was timed)
//   gif:  the frog clip from Gemini Omni 1.1 Flash (4 s at 720p), 2:04 from the request to the saved file, measured
//         2026-10-17; the cut to a GIF loop is near-instant beside it
const X = 50;
const GEN = { scan: 42, gif: 124 };
const FF_IN = 0.2; // the frame's badge fades in over this, full as a wait starts
// a card's rise and the feed's glide to it (chat.9b47fc30.js renderScroll) both take this long: its wait starts once it is in view
const SEEN = 0.45;
const CHART_HOLD = 2.4; // the landed breakdown, from its settle to the second ask starting to type
const SEND_AFTER = 0.35; // the landed GIF to its message going through (Sent)
const DM_HOLD = 2.6;    // Sent to the end card's cover: the frog dances most of a loop
// the GIF's clock: 38 frames at 8 cs, the delay the exported file carries (media/discord.bccc0fdd/frog-dance.gif)
const FPS = 12.5, FRAMES = 38, COLS = 6, ROWS = 7;
// the house end card (multicat.516afb1a.js, the 16:9 cuts' ending): the chat fades to its black over END_IN, the card's
// own 2.5s run starts END_DELAY in (mascot pops in, superbot.gg fades up beside it, hold)
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5;
const END_GAP = 44; // the house card's gap between the wordmark and the 220px face, on a 1080-high stage
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const END_FACE = '<svg class="dc-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="dcEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#dcEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#dcEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#dcEndFace)"/></svg>';
// the Discord mark (Simple Icons, img/discord.bccc0fdd/discord.svg), inlined so a frozen frame never waits on it
const MARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>';
// lucide check and plus (api.iconify.design/lucide/{check,plus}.svg): Sent's tick, the message box's attach button
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
const PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg>';
const DL_GLYPH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>';

// the breakdown's mock month: the top eight [Twemoji codepoint, Discord shortcode, uses], and every emoji the month used
const TOP = [['1f480', 'skull', 412], ['1f62d', 'sob', 287], ['1f438', 'frog', 196], ['1f525', 'fire', 143], ['1f440', 'eyes', 98], ['1f64f', 'pray', 71], ['1fae1', 'saluting_face', 54], ['2764', 'heart', 39]];
const TOTAL = 1486;
const SCOPE = 'Last 30 days, messages and reactions';
const num = (n) => n.toLocaleString('en-US');
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// every time in the chain, laid end to end from the first reply r: each answer's card comes in at `card`, works (its pill
// running) from `gen0` until `done`, and has landed by `w1`. Chipless, so the second reply comes where a first chip would
// have landed (the engine's own bare route, chat.9b47fc30.js)
function plan(r) {
  const card = r + 0.22, gen0 = card + SEEN, done = gen0 + GEN.scan / X;
  const T = { r, card, gen0, done, w1: done + LAND };
  const s = T.w1 + CHART_HOLD, typeEnd = s + ASK2.length / TYPE_CPS, send = typeEnd + 0.15;
  const rr = send + 0.35 + 0.08, at = rr + 0.22, g0 = at + SEEN, fin = g0 + GEN.gif / X, w1 = fin + LAND, sent = w1 + SEND_AFTER;
  T.gif = { ask: ASK2, s, typeEnd, send, r: rr, card: at, gen0: g0, done: fin, w1, sent, cut: sent + DM_HOLD };
  T.end = T.gif.cut + END_DELAY + END_LEN;
  return T;
}
// the chain's length from its first reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`discord variant stylesheet failed to load: ${CSS}`)); done(); };
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

// a working card's pill in its bottom left, with no tool tile (the bare cuts name no tool): what it does and its timer
const genl = (what) => `<span class="qc-genl dc-genl">${what}<b class="qc-genn">${clock(0)}</b></span>`;
// that pill at t: the timer counts the real seconds X times the clock's rate from `gen0`, rests on the full `real` from
// `done`, and the pill fades out as the answer lands (by w1). Returns how much the card is working now, 0..1, which the
// frame's badge shows by
function genPill(box) {
  const pill = box.querySelector('.qc-genl'), n = pill.querySelector('.qc-genn');
  let shown = clock(0), op = '';
  return (t, gen0, done, w1, real) => {
    const s = clock(t >= done ? real : Math.max(0, t - gen0) * X);
    if (s !== shown) { n.textContent = s; shown = s; }
    const out = 1 - seg(t, w1 - 0.25, w1), o = out.toFixed(3);
    if (o !== op) { pill.style.opacity = o; op = o; }
    return seg(t, gen0 - FF_IN, gen0) * out;
  };
}

// 1. the breakdown card
function breakdown(x) {
  const [first, ...rest] = TOP;
  const rows = rest.map(([code, name, n], i) => `<li><span class="dc-em-r">${i + 2}</span><img src="${emojiSrc(code)}" width="24" height="24" alt=""/><span class="dc-em-name">:${name}:</span><span class="dc-em-bar"><i></i></span><b class="dc-em-c">${num(n)}</b></li>`).join('');
  const table = TOP.map(([, name, n], i) => `<tr><th scope="row">${i + 1}</th><td>:${name}:</td><td>${num(n)}</td></tr>`).join('');
  const node = x.el(`<div class="bk dc-em">
    <div class="bk-head">
      <b class="bk-title">Top emojis on Discord<small>${x.esc(SCOPE)}</small></b>
      ${shareBtn('Top emojis on Discord')}
      ${EXPAND}
    </div>
    <div class="bk-view">
      <div class="dc-em-body" aria-hidden="true">
        <div class="dc-em-top">
          <span class="dc-em-k">Most used</span>
          <img class="dc-em-big" src="${emojiSrc(first[0])}" width="72" height="72" alt=""/>
          <b class="dc-em-n">${num(first[2])}</b>
          <span class="dc-em-code">:${first[1]}:</span>
          <span class="dc-em-pct">${Math.round((first[2] / TOTAL) * 100)}% of all ${num(TOTAL)}</span>
        </div>
        <ol class="dc-em-list">${rows}</ol>
      </div>
      <i class="bk-sh"></i>
      ${genl('Reading messages')}
      <table class="dc-sr"><caption>Top emojis on Discord, ${x.esc(SCOPE)}, of ${num(TOTAL)} in all</caption>
        <tr><th scope="col">Rank</th><th scope="col">Emoji</th><th scope="col">Uses</th></tr>${table}</table>
    </div>
  </div>`);
  const $ = (s) => node.querySelector(s);
  const body = $('.dc-em-body'), sh = $('.bk-sh'), big = $('.dc-em-n'), gen = genPill(node);
  const fills = [...node.querySelectorAll('.dc-em-bar i')], counts = [...node.querySelectorAll('.dc-em-c')];
  const shownN = TOP.map(() => -1), shownW = TOP.map(() => -1);
  // a count and its bar run up together over 0.55 s, #1 first and each row 50 ms after the one above
  const runUp = (t, done, i) => outCubic(seg(t, done + 0.05 * i, done + 0.05 * i + 0.55));
  return { node, render(t, T) {
    const lp = landing(t, T.done);
    shimmer(sh, t, T.card, 0, lp);
    settle(body, lp);
    TOP.forEach(([, , n], i) => {
      const p = runUp(t, T.done, i), v = Math.round(n * p);
      if (v !== shownN[i]) { (i ? counts[i - 1] : big).textContent = num(v); shownN[i] = v; }
      if (!i) return;
      const w = +((n / first[2]) * 100 * p).toFixed(2);
      if (w !== shownW[i]) { fills[i - 1].style.width = `${w}%`; shownW[i] = w; }
    });
    return gen(t, T.gen0, T.done, T.w1, GEN.scan);
  } };
}

// 2. the DM with the GIF in it
function dm(x) {
  const node = x.el(`<div class="bk dc-dm">
    <div class="bk-head">
      <b class="bk-title">${MARK}<span>Direct message</span><small class="dc-st"><span class="dc-st-a">Sending</span><span class="dc-st-b">${CHECK}Sent</span></small></b>
      ${shareBtn('Dancing frog GIF', { file: GIF })}
      <a class="bk-btn bk-publish dc-open" href="${DM}" target="_blank" rel="noopener noreferrer">${MARK}Open in Discord</a>
    </div>
    <div class="bk-view dc-view">
      <div class="dc-bar"><span class="dc-av dc-av-j">${MARK}</span><b>${FRIEND}</b></div>
      <div class="dc-log">
        <div class="dc-day"><span>October 17, 2026</span></div>
        <div class="dc-msg">
          <span class="dc-av dc-av-s">${MARK}</span>
          <div class="dc-msg-main">
            <div class="dc-msg-head"><b>sam</b><time>Today at 9:41 PM</time></div>
            <div class="dc-gif qc-skel">
              <div class="dc-gif-f" style="background-image:url('${FROG}')" role="img" aria-label="A green tree frog dancing on a lily pad under party lights"></div>
              <span class="dc-gif-tag">GIF</span>
              <a class="qc-dl" href="${GIF}" download="frog-dance.gif" aria-label="Download GIF" title="Download">${DL_GLYPH}</a>
              <i class="qc-sk"></i>
              ${genl('Creating GIF')}
            </div>
          </div>
        </div>
      </div>
      <div class="dc-input"><span class="dc-plus">${PLUS}</span><span>Message @${FRIEND}</span></div>
    </div>
  </div>`);
  const $ = (s) => node.querySelector(s);
  const gif = $('.dc-gif'), frame = $('.dc-gif-f'), sk = $('.qc-sk'), tag = $('.dc-gif-tag'), dl = $('.qc-dl');
  const head = $('.dc-msg-head'), sending = $('.dc-st-a'), sentEl = $('.dc-st-b'), gen = genPill(gif);
  let f0 = -1;
  return { node, render(t, G) {
    const lp = landing(t, G.done);
    shimmer(sk, t, G.card, 0, lp);
    settle(frame, lp);
    fade(tag, lp); fade(dl, lp);
    // the GIF's own clock: frame 0 under the skeleton, then it loops from the moment it lands
    const f = t < G.done ? 0 : Math.floor((t - G.done) * FPS + 1e-6) % FRAMES;
    if (f !== f0) { frame.style.backgroundPosition = `${(((f % COLS) / (COLS - 1)) * 100).toFixed(3)}% ${((Math.floor(f / COLS) / (ROWS - 1)) * 100).toFixed(3)}%`; f0 = f; }
    // still sending: the message's line sits greyed, as Discord shows one in flight (its GIF slot stays at full strength,
    // where the skeleton and the pill must read), until it goes through and the frame's header swaps Sending for Sent
    const s = outCubic(seg(t, G.sent, G.sent + 0.2));
    head.style.opacity = lerp(0.5, 1, s).toFixed(3);
    fade(sending, 1 - s); fade(sentEl, s);
    return gen(t, G.gen0, G.done, G.w1, GEN.gif);
  } };
}

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the chain keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheet();
    loadFrameSheet();
    const T = k.T, G = T.gif;
    // 16 · Punchy premium groove: the multicat score rendered from this chain's cue sheet (the engine's first ask, k, and
    // this plan, T). Its photo and model hits land on the breakdown and the frog, its order bell on Sent; there is no song,
    // so no play press (press: false) and the bed's build runs into the end card's cover
    const v16 = makePlayerV16({
      typing: [{ text: k.askBy[ID], s: k.s, end: k.typeEnd }, { text: G.ask, s: G.s, end: G.typeEnd }],
      sends: [k.send, G.send],
      camera: k.send, // the first send drops the composer and pulls the camera out (tabs.9b47fc30.js)
      resolved: [],
      cards: [T.card, G.card],
      gens: [[T.gen0, T.done], [G.gen0, G.done]],
      image: T.done, model: G.done, order: G.sent, play: G.cut, press: false,
      cover: G.cut, pop: G.cut + END_DELAY, word: G.cut + END_DELAY + 0.3, end: T.end,
    }, ID);
    addEventListener('variantchange', () => v16.stop());

    // 1. the breakdown, in the engine's own reply
    const say1 = sayEl(x, SAY1);
    const chart = breakdown(x);
    // the feed glides to a zero-height anchor a little under each answer's card instead of the card's own bottom, so the
    // newest card clears the feed's clip with its edge and shadow (../discord.bccc0fdd.css .dc-anchor)
    const anchor = () => x.el('<i class="dc-anchor" aria-hidden="true"></i>');
    const anchor1 = anchor();

    // 2. the second ask's user bubble and its reply
    const u = x.el(`<div class="msg qc-u"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(G.ask)}</div></div></div>`);
    const reply = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"></div></div>`);
    const say2 = sayEl(x, SAY2);
    const sent = dm(x);
    const anchor2 = anchor();
    reply.lastElementChild.append(say2.n, sent.node, anchor2);
    const follow = [u, reply];
    // Space and Enter press the cards' controls, not the spot's clock (timeline.9b47fc30.js), as on the other beats
    for (const n of [chart.node, sent.node]) n.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('a, button')) e.stopPropagation(); });

    // the end card: the house superbot.gg lockup over the spot's black. It rides in nodes (so other variants hide it) and
    // moves to the scene section on the first render, above the hub; the x50 badge with it
    const endCard = x.el(`<div class="dc-end" role="img" aria-label="superbot.gg"><div class="dc-end-word"><b>superbot.gg</b></div><div class="dc-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.dc-end-word'), endBot = endCard.querySelector('.dc-end-bot');
    const ff = x.el(`<div class="dc-ff" aria-hidden="true">x${X}</div>`);
    let endK = 1; // the lockup's scale now applied (--k)

    // QA: the pick against the clock (__AD arrives after the timeline's first frame)
    const sound = () => ({ t: window.__AD.now, music: music() });
    let placed = false, decoding = false;
    return {
      nodes: [say1.n, chart.node, anchor1, ...follow, endCard, ff],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[T.r, say1.n], [T.card, anchor1], [G.send, u], [G.r, say2.n], [G.card, anchor2]],
      // the second ask, typed into the composer and sent by the engine (renderComposer)
      asks: [{ text: G.ask, s: G.s, typeEnd: G.typeEnd, send: G.send }],
      render(t) {
        if (!placed) {
          // the follow-ups leave the engine's reply for the feed, in order right after it
          let at = say1.n.closest('.msg');
          for (const m of follow) { at.after(m); at = m; }
          // the end card and the badge leave the hub for the scene section: stage px, unscaled by the hub's camera
          x.hub.closest('.scene').append(endCard, ff);
          placed = true;
        }
        if (window.__AD && window.__AD.sound !== sound) window.__AD.sound = sound;
        if (!decoding) {
          decoding = true;
          for (const pic of chart.node.querySelectorAll('img')) {
            track(pic.decode().catch((e) => console.error(new Error(`${ID} emoji failed to decode: ${pic.src}`, { cause: e }))));
          }
          const sprite = new Image();
          sprite.src = FROG;
          track(sprite.decode().catch((e) => console.error(new Error(`${ID} GIF frames failed to decode: ${FROG}`, { cause: e }))));
        }

        // 1. the breakdown: a skeleton while the messages are read, then the bars grow and the counts run up
        say1.render(t, T.r);
        enter(chart.node, t, T.card);
        const g1 = chart.render(t, T);

        // 2. the bubble and the reply, as the engine draws its own; the DM rises, the GIF is made, lands and goes through
        x.appear(u, t, G.send);
        x.appear(reply, t, G.r);
        say2.render(t, G.r);
        enter(sent.node, t, G.card);
        const g2 = sent.render(t, G);
        // the frame's x50 badge, while either works
        fade(ff, Math.max(g1, g2));

        if (music() === 'v16') v16.sync(t); else v16.stop();

        // the end card: the chat fades to black, then the house card's own run (endcard.1d16d488.html render(t))
        const cover = seg(t, G.cut, G.cut + END_IN);
        endCard.style.opacity = cover.toFixed(3);
        endCard.style.visibility = cover > 0 ? '' : 'hidden';
        if (cover > 0) {
          const tc = t - (G.cut + END_DELAY);
          const W = endCard.clientWidth, H = endCard.clientHeight;
          // the house sizes on a 1080-high stage, scaled down (--k) only when a narrow ratio would crop the lockup
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
