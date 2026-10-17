// Refund beat (the 'refund' variant): three asks in one chat, answered with no model on show, as the multicat-credits cut
// is (beats/multicat.516afb1a.js `bare`): no routing chips, no "<model> in superbot" headers, the composer on Superbot.
// The engine types the first ask ("Call customer support and get me a refund on my subscription") and this beat answers
// it; then it carries the chat on by itself, typing the next asks into the composer (inst.asks, chat.9b47fc30.js).
//   1. The call: superbot dials Nimbus+ (a made-up streaming service, so no real company is rated), works its phone menu
//      (2 for billing, 0 for an agent) and holds, the call card's timer counting the real wait fast-forwarded x50 with the
//      frame's badge on (the multicat cut's X).
//   2. While it holds, the second ask ("Also send support an email requesting my refund at the same time"): a Gmail
//      draft to support writes itself and sends. The call card above it keeps holding.
//   3. Superbot, unasked: the agent picked up. The live transcript plays the call with sound (media/refund.d3537b02/call.mp3,
//      its words lighting on their timings, refund-data.d3537b02.js) and lands "Refund approved".
//   4. "Ok rate them 1 star on every possible rating platform": one 1-star review, posted to ten platforms row by row
//      (fast-forwarded too), then
//   5. the house superbot.gg end card covers the chat (the multicat cut's, its .mc-end and .mc-ff styles).
// Under it all plays its own score (refund-score.d3537b02.js through refund-player.d3537b02.js), the multicat-credits
// cut's 16 · Punchy premium groove re-cued to this chain: it stops dead as the agent picks up, so the call plays alone.
// The follow-up messages ride in inst.nodes (the engine's show() hides them under every other variant) and move in
// after the engine's reply on the first render. A pure function of t, except the audio, which follows the clock.
import { clamp, lerp, seg, outCubic, outQuint, outBack, streamCount, rand } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { LAND } from './thumb-land.309eb9c5.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { shareBtn } from './share.29a362ea.js';
import { DUR, LINES, WORDS, FPS, LEVEL } from './refund-data.d3537b02.js';
import { makePlayer } from './refund-player.d3537b02.js';
import { music } from '../../../music.47e5d94a.js?v=2';
import { variant } from '../../../variant.9e82faf1.js?v=3';
import { songLevel } from '../../../sound.96834de7.js?v=2';

const CSS = new URL('../refund.d3537b02.css?v=1', import.meta.url).href;
export const ID = 'refund';
const asset = (p) => new URL('../../../' + p, import.meta.url).href;
const logo = (n) => asset(`img/refund.d3537b02/${n}.svg`);
const CALL = asset('media/refund.d3537b02/call.mp3');

// the company and what superbot gets back from it (made up: a real one would be getting the 1-star reviews)
const CO = 'Nimbus+', PHONE = '+1 (800) 555-0199', MAIL_TO = 'support@nimbusplus.tv';
const AMOUNT = '$119.99', CARD = 'Visa ending 4242', REF = 'NB-48213';
const ASK2 = 'Also send support an email requesting my refund at the same time';
const ASK3 = 'Ok rate them 1 star on every possible rating platform';
const SAY1 = `Calling ${CO} support now.`;
const SAY2 = 'On it. Emailing support while I hold.';
const SAY3 = `Dana from ${CO} picked up.`;
const SUBJECT = `Refund request for my ${CO} Premium renewal`;
const BODY = `Hi ${CO} Support,\n\nI cancelled my Premium plan on Oct 1, but was still charged ${AMOUNT} for the annual renewal on Oct 3. Please refund the full ${AMOUNT} to my original payment method.\n\nThanks,\nSam`;
// the ten platforms the review goes up on, in posting order: [tile, name]
const PLATFORMS = [
  ['trustpilot', 'Trustpilot'], ['google', 'Google'], ['yelp', 'Yelp'], ['bbb', 'BBB'], ['appstore', 'App Store'],
  ['googleplay', 'Google Play'], ['roku', 'Roku'], ['amazon', 'Amazon Appstore'], ['consumeraffairs', 'ConsumerAffairs'], ['smartcustomer', 'SmartCustomer'],
];
const SAY4 = 'On it. Posting your 1-star review everywhere it can go.';

export const TYPE_CPS = 55; // every ask types at this rate, as the multicat cut's do; the first through its route's typeCps
const X = 50;               // the fast-forward on the hold and the posting, as the multicat cut's generations
const FF_IN = 0.2;          // the frame's x50 badge fades in over this
const SEEN = 0.45;          // a card's rise and the feed's glide to it: what it shows starts once it is in view
const RING = 1.0;           // the line rings this long before the phone menu answers
const KEYS = [[0.25, '2'], [0.75, '0']]; // the menu's key presses, from the menu answering: billing, then an agent
const MENU = 1.15;          // the phone menu, from its answer to the hold
const ASK_IN_HOLD = 0.55;   // the hold runs this long before the second ask starts typing
const BODY_CPS = 260;       // the email writes itself this fast
const PICK_AFTER = 0.75;    // the hold runs on this long after the email is sent, then the agent picks up
const VOICE_IN = 0.4;       // the agent's first word, this long after the line picks up (its card is still rising)
const RESULT_AFTER = 0.15;  // the "Refund approved" row lands this long after the call's last word
const ENDED_AFTER = 0.35;   // and the call ends this long after that
const RESULT_HOLD = 1.25;   // the approved refund shows this long before the last ask types
const QUOTE_CPS = 320;      // the review writes itself this fast
const POST_STRIDE = 0.17;   // one platform posts every this many seconds
const REVIEW_HOLD = 1.35;   // the posted reviews show this long before the end card
// the house end card (the multicat cut's): the chat fades to black over END_IN, the card's own 2.5 s run starts END_DELAY in
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5;
const END_GAP = 44;
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const END_FACE = '<svg class="mc-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="rfEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#rfEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#rfEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#rfEndFace)"/></svg>';

// every time in the chain, laid end to end from the first reply r (each reply comes where a chip would have landed: the
// engine's chipless route, chat.9b47fc30.js)
function plan(r) {
  const T = { r, card: r + 0.22 };
  T.c0 = T.card + SEEN;                 // the call card in view: the line starts ringing
  T.menu = T.c0 + RING;                 // the phone menu answers
  T.keys = KEYS.map(([at, d]) => [T.menu + at, d]);
  T.hold0 = T.menu + MENU;              // on hold
  // 2. the email, asked while the call holds
  const s2 = T.hold0 + ASK_IN_HOLD, te2 = s2 + ASK2.length / TYPE_CPS, send2 = te2 + 0.15, r2 = send2 + 0.35 + 0.08;
  T.mail = { ask: ASK2, s: s2, typeEnd: te2, send: send2, r: r2, card: r2 + 0.22 };
  T.mail.b0 = T.mail.card + SEEN;       // the draft starts writing
  T.mail.b1 = T.mail.b0 + BODY.length / BODY_CPS;
  T.mail.press = T.mail.b1 + 0.25;      // Send is pressed
  T.mail.sent = T.mail.press + 0.12;
  // 3. the agent picks up: superbot says so, unasked, and the call plays in its transcript card
  T.pick = T.mail.sent + PICK_AFTER;
  T.held = (T.pick - T.hold0) * X;      // the wait the hold stands for, in real seconds
  T.r3 = T.pick + 0.12;
  T.card3 = T.r3 + 0.22;
  T.a0 = T.pick + VOICE_IN;             // the call's audio
  T.result = T.a0 + DUR + RESULT_AFTER;
  T.ended = T.result + ENDED_AFTER;
  // 4. the reviews
  const s4 = T.result + RESULT_HOLD, te4 = s4 + ASK3.length / TYPE_CPS, send4 = te4 + 0.15, r4 = send4 + 0.35 + 0.08;
  T.rev = { ask: ASK3, s: s4, typeEnd: te4, send: send4, r: r4, card: r4 + 0.22 };
  T.rev.q0 = T.rev.card + SEEN;
  T.rev.posts = PLATFORMS.map((_, i) => T.rev.q0 + 0.5 + i * POST_STRIDE);
  T.rev.w1 = T.rev.posts[T.rev.posts.length - 1] + LAND;
  // 5. the end card
  T.cut = T.rev.w1 + REVIEW_HOLD;
  T.end = T.cut + END_DELAY + END_LEN;
  return T;
}
// the chain's length from its first reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
// the call's own clock at t: 1x through the ring and the menu, X times through the hold, 1x again once the agent is on
const callTime = (T, t) => (t < T.hold0 ? Math.max(0, t - T.c0) : t < T.pick ? T.hold0 - T.c0 + (t - T.hold0) * X : T.hold0 - T.c0 + T.held + (Math.min(t, T.ended) - T.pick));

const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.5l-5.8 3.05 1.1-6.5-4.7-4.6 6.5-.95z"/></svg>';
const stars = (cls) => `<span class="rf-stars ${cls}" role="img" aria-label="1 of 5 stars">${Array.from({ length: 5 }, (_, i) => `<i${i ? '' : ' class="on"'}>${STAR}</i>`).join('')}</span>`;
const SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5z"/><path d="M11.5 13.5L20 4"/></svg>';
const SPIN = '<i class="rf-spin" aria-hidden="true"></i>';
const BARS = 28; // the call card's line meter

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`refund variant stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

// a block's entrance: it rises and settles in over 0.45 s from `at` (the other beats' card entrance)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
  return ci;
}
const fade = (n, p) => { n.style.opacity = p.toFixed(3); n.style.visibility = p > 0 ? '' : 'hidden'; };
const setText = (n, s) => { if (n.textContent !== s) n.textContent = s; };

// a streamed line: the visible prefix, the rest held in place transparent, so the block never reflows
function streamEl(x, cls, text, cps) {
  const n = x.el(`<div class="${cls}"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  let shown = -1;
  return { n, render(t, at) {
    const c = streamCount(text, at + 0.06, cps, t);
    if (c !== shown) { n.firstElementChild.textContent = text.slice(0, c); n.lastElementChild.textContent = text.slice(c); shown = c; }
  } };
}
const sayEl = (x, text) => streamEl(x, 'qc-say', text, 70);

// a status icon: a spinner until `at`, then the house check (chat.css .qc-ok) pops in
function statusEl(x) {
  const n = x.el(`<span class="rf-ic">${SPIN}${x.OK}</span>`);
  const spin = n.firstElementChild, ok = n.lastElementChild;
  return { n, render(t, from, at) {
    const live = t >= from && t < at;
    spin.style.opacity = live ? '1' : '0';
    if (live) spin.style.transform = `rotate(${((t - from) * 420).toFixed(1)}deg)`;
    const o = seg(t, at, at + 0.3);
    ok.style.opacity = o.toFixed(3);
    ok.style.transform = `scale(${lerp(0.3, 1, outBack(o)).toFixed(4)})`;
  } };
}

// the call card's status pill: a dot and a word, plus the call's clock when `timed`
function pillEl(x, timed) {
  const n = x.el(`<span class="rf-state"><i class="rf-dot"></i><span class="rf-st-t"></span>${timed ? '<b class="rf-st-n"></b>' : ''}</span>`);
  const word = n.querySelector('.rf-st-t'), num = n.querySelector('.rf-st-n');
  let shown = '';
  return { n, render(state, label, time) {
    if (state !== shown) { n.dataset.s = state; shown = state; }
    setText(word, label);
    if (num) setText(num, time);
  } };
}

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the chain keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheet();
    loadFrameSheet();
    const T = k.T, M = T.mail, R = T.rev;
    const minutes = Math.round(T.held / 60);
    const QUOTE = `Charged me ${AMOUNT} after I cancelled, then kept me on hold for ${minutes} minutes to get it back.`;
    const co = () => `<span class="qc-tile rf-co"><img src="${logo('nimbus')}" alt=""/></span>`;
    const anchor = () => x.el('<i class="rf-anchor" aria-hidden="true"></i>');

    // the score: 16 · Punchy premium groove re-cued to this chain, played on the clock while v16 is the pick (the
    // variant's default, music.47e5d94a.js DEFAULTS)
    const score = makePlayer({
      typing: [{ text: k.askBy[ID], s: k.s, end: k.typeEnd }, { text: M.ask, s: M.s, end: M.typeEnd }, { text: R.ask, s: R.s, end: R.typeEnd }],
      sends: [k.send, M.send, R.send],
      camera: k.send, // the first send drops the composer and pulls the camera out (tabs.9b47fc30.js)
      cards: [T.card, M.card, T.card3, R.card],
      ring: [T.c0, T.menu], keys: T.keys, hold: [T.hold0, T.pick],
      draft: [M.b0, M.b1], press: M.press, sent: M.sent,
      pick: T.pick, voice: [T.a0, T.a0 + DUR], result: T.result,
      posts: R.posts, postWin: [R.q0 + 0.3, R.posts[R.posts.length - 1]],
      cover: T.cut, pop: T.cut + END_DELAY, word: T.cut + END_DELAY + 0.3, end: T.end,
    });
    addEventListener('variantchange', () => score.stop());

    // 1. the call, in the engine's own reply
    const say1 = sayEl(x, SAY1);
    const call = x.el(`<div class="bk rf-call"><div class="bk-head">${co()}<b class="bk-title">${CO} Support<small>Phone call</small></b></div>
      <div class="rf-call-body"><div class="rf-clock"><b class="rf-time">0:00</b><small>${PHONE}</small><span class="rf-meter" aria-hidden="true">${'<i></i>'.repeat(BARS)}</span></div>
      <div class="rf-steps"></div></div></div>`);
    const pill1 = pillEl(x, false);
    call.querySelector('.bk-head').append(pill1.n);
    const steps1 = [['Dial', `${CO} support`], ['Phone menu', '2 for billing, 0 for an agent'], ['Hold', 'until a person answers']].map(([b, s]) => {
      const st = statusEl(x);
      const row = x.el(`<div class="rf-step"><b>${b}</b><span>${x.esc(s)}</span></div>`);
      row.prepend(st.n);
      call.querySelector('.rf-steps').append(row);
      return { row, st };
    });
    const time1 = call.querySelector('.rf-time'), bars = [...call.querySelectorAll('.rf-meter i')];
    const anchor1 = anchor();

    // every follow-up: its user bubble (or none, for superbot's own word) and its reply
    const bubble = (text) => x.el(`<div class="msg qc-u"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(text)}</div></div></div>`);
    const reply = () => x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"></div></div>`);

    // 2. the email draft
    const u2 = bubble(ASK2), r2 = reply(), say2 = sayEl(x, SAY2);
    const mail = x.el(`<div class="bk rf-mail"><div class="bk-head"><span class="qc-tile rf-co"><img src="${logo('gmail')}" alt=""/></span><b class="bk-title">Refund request<small class="rf-mail-st">Draft</small></b>
      <span class="bk-btn bk-publish rf-send">${SEND}<span>Send</span></span></div>
      <div class="rf-f"><span>To</span><b>${MAIL_TO}</b></div><div class="rf-f"><span>Subject</span><b>${x.esc(SUBJECT)}</b></div></div>`);
    const body = streamEl(x, 'rf-msg', BODY, BODY_CPS);
    mail.append(body.n);
    const send = mail.querySelector('.rf-send'), sendLabel = send.querySelector('span'), mailSt = mail.querySelector('.rf-mail-st');
    const anchor2 = anchor();
    r2.lastElementChild.append(say2.n, mail, anchor2);

    // 3. the agent picks up: the live transcript, its words lighting as they are said, then the outcome
    const r3 = reply(), say3 = sayEl(x, SAY3);
    const live = x.el(`<div class="bk rf-live"><div class="bk-head">${co()}<b class="bk-title">${CO} Support<small>Live transcript</small></b></div><div class="rf-tx"></div>
      <div class="rf-res"><span class="rf-res-ok">${x.OK}</span><b>Refund approved</b><span>${AMOUNT} back to your ${CARD}</span><small>Ref ${REF}</small></div></div>`);
    const pill3 = pillEl(x, true);
    live.querySelector('.bk-head').append(pill3.n);
    const lines = LINES.map((ln, i) => {
      const words = WORDS.filter((w) => w[3] === i);
      const n = x.el(`<div class="rf-ln" data-who="${ln.who}">${ln.who === 'sb' ? x.tile('superbot') : co()}<div><span class="rf-who">${ln.who === 'sb' ? 'Superbot' : `Dana, ${CO}`}</span><p>${words.map((w) => `<span>${x.esc(w[0])}</span>`).join(' ')}</p></div></div>`);
      live.querySelector('.rf-tx').append(n);
      return { n, words, spans: [...n.querySelectorAll('p span')], lit: -1 };
    });
    const res = live.querySelector('.rf-res');
    const anchor3 = anchor();
    r3.lastElementChild.append(say3.n, live, anchor3);

    // 4. the reviews
    const u4 = bubble(ASK3), r4 = reply(), say4 = sayEl(x, SAY4);
    const rev = x.el(`<div class="bk rf-rev"><div class="bk-head"><b class="bk-title">1-star review<small>${PLATFORMS.length} platforms</small></b><span class="rf-count"></span>${shareBtn('1-star review')}</div>
      <div class="rf-rev-top">${stars('rf-big')}</div><ul class="rf-plats"></ul></div>`);
    const quote = streamEl(x, 'rf-quote', QUOTE, QUOTE_CPS);
    rev.querySelector('.rf-rev-top').append(quote.n);
    const firstStar = rev.querySelector('.rf-big i.on');
    const plats = PLATFORMS.map(([tile, name]) => {
      const st = statusEl(x);
      const row = x.el(`<li><span class="qc-tile rf-pt"><img src="${logo(tile)}" alt=""/></span><b>${x.esc(name)}</b>${stars('rf-mini')}</li>`);
      row.append(st.n);
      rev.querySelector('.rf-plats').append(row);
      return { row, st };
    });
    const count = rev.querySelector('.rf-count');
    const anchor4 = anchor();
    r4.lastElementChild.append(say4.n, rev, anchor4);

    const follow = [u2, r2, r3, u4, r4];
    // Space and Enter press the cards' controls, not the spot's clock (timeline.9b47fc30.js), as on the other beats
    for (const n of [call, mail, live, rev]) n.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('a, button')) e.stopPropagation(); });

    // the end card and the x50 badge: the multicat cut's (../multicat.516afb1a.css .mc-end, .mc-ff), moved to the scene
    // section on the first render
    const endCard = x.el(`<div class="mc-end" role="img" aria-label="superbot.gg"><div class="mc-end-word"><b>superbot.gg</b></div><div class="mc-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.mc-end-word'), endBot = endCard.querySelector('.mc-end-bot');
    const ff = x.el(`<div class="mc-ff" aria-hidden="true">x${X}</div>`);
    let endK = 1;

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

    // the call's audio follows the clock: it plays while the clock runs through its window, at the clock's speed, and
    // follows the sound pill's mute (sound.96834de7.js songLevel). Its file loads on the route's first render
    const audio = new Audio();
    audio.preload = 'auto';
    let blocked = false;
    const unblock = () => { blocked = false; };
    addEventListener('variantchange', () => audio.pause());
    addEventListener('message', (e) => { if (e.data && e.data.type === 'unmute') unblock(); });
    function syncAudio(t, running) {
      // the call plays under the score (v16, the default) and alone (none); another pick carried over in ?music= is silent
      const pick = music();
      if (pick !== 'v16' && pick !== 'none') { if (!audio.paused) audio.pause(); return; }
      const at = t - T.a0;
      if (!running || at < 0 || at >= DUR) { if (!audio.paused) audio.pause(); return; }
      audio.volume = songLevel();
      const rate = (window.__AD && window.__AD.speed) || 1;
      if (audio.playbackRate !== rate) audio.playbackRate = rate;
      if (Math.abs(audio.currentTime - at) > 0.3) audio.currentTime = at;
      if (audio.paused && !blocked) {
        audio.play().catch((e) => {
          blocked = true;
          console.warn('refund: the call waits for a click or key to play (autoplay policy)', e);
          addEventListener('pointerdown', unblock, { once: true });
          addEventListener('keydown', unblock, { once: true });
        });
      }
    }

    // the line meter at t: two ring bursts, a blip per key, hold music while it holds, then the call's own level
    function meter(t) {
      const lv = (t >= T.a0 && t < T.a0 + DUR) ? LEVEL[clamp(Math.floor((t - T.a0) * FPS), 0, LEVEL.length - 1)] / 100 : 0;
      const ring = t >= T.c0 && t < T.menu ? (Math.floor((t - T.c0) / 0.5) % 2 ? 0.08 : 0.42) : 0;
      const key = T.keys.reduce((a, [at]) => Math.max(a, t >= at ? Math.exp(-(t - at) / 0.09) * 0.7 : 0), 0);
      const hold = t >= T.hold0 && t < T.pick ? 1 : 0, beat = Math.floor(t * 6);
      bars.forEach((b, i) => {
        let h = 0.06 + ring * (0.7 + 0.3 * Math.sin(i * 0.9)) + key * (0.5 + 0.5 * rand(i * 3.1));
        if (hold) h += 0.18 + 0.4 * rand(beat * 31 + i) * (0.6 + 0.4 * Math.sin(t * 5 + i * 0.45));
        if (lv) h += lv * (0.45 + 0.55 * rand(Math.floor(t * 30) * 17 + i));
        b.style.transform = `scaleY(${clamp(h, 0.06, 1).toFixed(3)})`;
      });
    }

    const sound = () => ({ t: window.__AD.now, music: music(), call: { paused: audio.paused, at: +audio.currentTime.toFixed(3), volume: +audio.volume.toFixed(3) } });
    let placed = false, decoding = false, posted = -1;
    return {
      nodes: [say1.n, call, anchor1, ...follow, endCard, ff],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[T.r, say1.n], [T.card, anchor1], [M.send, u2], [M.r, say2.n], [M.card, anchor2], [T.r3, say3.n], [T.card3, anchor3], [R.send, u4], [R.r, say4.n], [R.card, anchor4]],
      // the follow-up asks, typed into the composer and sent by the engine (renderComposer); no chips, so the composer
      // stays on Superbot (renderRouting)
      asks: [M, R].map((a) => ({ text: a.ask, s: a.s, typeEnd: a.typeEnd, send: a.send })),
      chips: [],
      render(t) {
        if (!placed) {
          let at = say1.n.closest('.msg');
          for (const m of follow) { at.after(m); at = m; }
          x.hub.closest('.scene').append(endCard, ff);
          audio.src = CALL;
          placed = true;
        }
        if (window.__AD && window.__AD.sound !== sound) window.__AD.sound = sound;
        if (!decoding) {
          decoding = true;
          for (const pic of [...call.querySelectorAll('img'), ...mail.querySelectorAll('img'), ...rev.querySelectorAll('img')]) {
            track(pic.decode().catch((e) => console.error(new Error(`refund image failed to decode: ${pic.src}`, { cause: e }))));
          }
        }

        // 1. the call card: ringing, the menu, the hold (its clock X times fast), then on the line and ended
        say1.render(t, T.r);
        enter(call, t, T.card);
        const ct = callTime(T, t);
        setText(time1, clock(ct));
        const state = t < T.menu ? ['ring', 'Calling'] : t < T.hold0 ? ['menu', 'Phone menu'] : t < T.pick ? ['hold', 'On hold'] : t < T.ended ? ['live', 'On the line'] : ['ended', 'Ended'];
        pill1.render(...state);
        steps1[0].st.render(t, T.c0, T.menu);
        steps1[1].st.render(t, T.menu, T.hold0);
        steps1[2].st.render(t, T.hold0, T.pick);
        steps1.forEach((s, i) => s.row.classList.toggle('on', t >= [T.c0, T.menu, T.hold0][i]));
        meter(t);

        // 2. the email: bubble, reply, the draft writing itself, Send pressed, Sent
        x.appear(u2, t, M.send);
        x.appear(r2, t, M.r);
        say2.render(t, M.r);
        enter(mail, t, M.card);
        body.render(t, M.b0);
        const pr = seg(t, M.press - 0.08, M.press) * (1 - seg(t, M.press, M.press + 0.1));
        send.style.transform = pr > 0 ? `scale(${(1 - 0.1 * pr).toFixed(4)})` : 'none';
        const isSent = t >= M.sent;
        send.classList.toggle('rf-sent', isSent);
        setText(sendLabel, isSent ? 'Sent' : 'Send');
        setText(mailSt, isSent ? `Sent to ${CO} Support` : 'Draft');

        // 3. picked up: the live transcript, the outcome
        x.appear(r3, t, T.r3);
        say3.render(t, T.r3);
        enter(live, t, T.card3);
        pill3.render(t < T.ended ? 'live' : 'ended', t < T.ended ? 'Live' : 'Call ended', clock(ct));
        const el = t - T.a0;
        for (const ln of lines) {
          fade(ln.n, seg(el, ln.words[0][1] - 0.25, ln.words[0][1] - 0.05));
          const n = ln.words.filter((w) => el >= w[1]).length;
          if (n !== ln.lit) { ln.spans.forEach((s, i) => s.classList.toggle('on', i < n)); ln.lit = n; }
        }
        const rp = outCubic(seg(t, T.result, T.result + 0.4));
        res.style.opacity = rp.toFixed(3);
        res.style.transform = rp >= 1 ? 'none' : `translateY(${((1 - rp) * 6).toFixed(2)}px)`;

        // 4. the reviews: the review writes, its one star stamps, then each platform posts
        x.appear(u4, t, R.send);
        x.appear(r4, t, R.r);
        say4.render(t, R.r);
        enter(rev, t, R.card);
        quote.render(t, R.q0);
        const sp = seg(t, R.q0 + 0.05, R.q0 + 0.4);
        firstStar.style.transform = sp > 0 && sp < 1 ? `scale(${lerp(1.6, 1, outBack(sp)).toFixed(4)})` : 'none';
        firstStar.style.opacity = (sp > 0 ? 1 : 0.25).toFixed(2);
        let n = 0;
        plats.forEach((p, i) => {
          const at = R.posts[i];
          p.st.render(t, R.q0 + 0.3, at);
          p.row.classList.toggle('on', t >= at);
          if (t >= at) n++;
        });
        if (n !== posted) { count.textContent = `${n} of ${PLATFORMS.length} posted`; posted = n; }

        // the frame's x50 badge, while the call holds and while the reviews post
        const ffHold = seg(t, T.hold0 - FF_IN, T.hold0) * (1 - seg(t, T.pick - 0.2, T.pick));
        const ffPost = seg(t, R.q0 + 0.3 - FF_IN, R.q0 + 0.3) * (1 - seg(t, R.posts[R.posts.length - 1] - 0.05, R.w1));
        fade(ff, Math.max(ffHold, ffPost));

        // the audio: the call on its element, the score on the spot's audio context
        const running = clockRuns(t);
        syncAudio(t, running);
        if (music() === 'v16') score.sync(t); else score.stop();

        // the end card: the chat fades to black, then the house card's own run
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
