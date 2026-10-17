// Halloween shopping beat (the 'halloween-shopping' variant): two shopping asks in one chat, with no model on show, the
// look of the multi-tool cat's credits cut (multicat.516afb1a.js `bare`): no routing chips, no reply headers, the
// composer on Superbot throughout, each reply answering straight after its send. The engine types and sends the first
// ask and this beat answers it; then it carries the chat on by itself, typing, sending and answering the second.
// Each answer is told the way the burger cut tells its order (doordash.d9bc17e9.js): one line saying what was ordered,
// then the order's confirmation in the bakery artifact frame, landing out of a skeleton sweep (thumb-land.309eb9c5.js);
// only the end result, no browsing shown.
//   1. "Search on amazon and buy the cheapest halloween king sized bag of candy": Amazon's "Order placed, thanks!" for
//      the cheapest king size Halloween listing found.
//   2. "Use Temu to buy x3 pumpkin costumes size small, cheapest and cutest": Temu's confirmation for three of the
//      cheapest cute pumpkin costume, size S.
//   3. the house superbot.gg end card (multicat's) covers the chat.
// The pages are REBUILT (HTML drawn live in each store's look) around real listings (halloween-data.37ff9e93.js;
// provenance in img/halloween.37ff9e93/CREDITS.txt): nothing was ordered. Under it all plays v16, the credits cut's
// punchy premium groove (multicat-player.96834de7.js), re-cued to this chain. The follow-ups ride in inst.nodes and move
// in after the engine's reply on the first render, as multicat's do. A pure function of t.
import { clamp, lerp, seg, outCubic, outQuint, outBack, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { LAND, landing, shimmer, settle } from './thumb-land.309eb9c5.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { shareBtn } from './share.29a362ea.js';
import { makePlayer as makePlayerV16 } from './multicat-player.96834de7.js?v=4';
import { music } from '../../../music.47e5d94a.js?v=2';
import { AMAZON, TEMU } from './halloween-data.37ff9e93.js?v=2';

const CSS = new URL('../halloween.37ff9e93.css?v=2', import.meta.url).href;
// the end card, the anchors and the wide composer are multicat's (../multicat.516afb1a.css .mc-end, .mc-anchor, .qc-wide)
const MC_CSS = new URL('../multicat.516afb1a.css?v=9', import.meta.url).href;
export const ID = 'halloween-shopping';
const asset = (p) => new URL('../../../img/halloween.37ff9e93/' + p, import.meta.url).href;

export const TYPE_CPS = 55;  // every ask types at this rate; the first one through its route's typeCps (chat.9b47fc30.js)
const ASK2 = 'Use Temu to buy x3 pumpkin costumes size small, cheapest and cutest';
const ORDER_LOAD = 0.58;     // an order generates nothing: its confirmation lands this long after its card comes in (multicat's)
const HOLD_A = 1.8;          // the Amazon confirmation, from its landing to the second ask starting to type
const HOLD_B = 2.2;          // the Temu one, to the end card covering the chat
// the house end card (multicat.516afb1a.js): the chat fades to its black over END_IN, the card's own 2.5s run starts
// END_DELAY in (mascot pops in, superbot.gg fades up beside it, hold)
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5;
const END_GAP = 44;
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const END_FACE = '<svg class="mc-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="hwEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#hwEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#hwEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#hwEndFace)"/></svg>';

// every time in the chain, from the first reply r: each order's card comes in at `card` and its confirmation lands at
// `done`, settled by w1; the second ask types after the first has shown HOLD_A, the end card covers HOLD_B after the second
export function plan(r) {
  const A = { r, card: r + 0.22 };
  A.done = A.card + ORDER_LOAD; A.w1 = A.done + LAND;
  const s = A.w1 + HOLD_A, typeEnd = s + ASK2.length / TYPE_CPS, send = typeEnd + 0.15, rb = send + 0.35 + 0.08;
  const B = { s, typeEnd, send, r: rb, card: rb + 0.22 };
  B.done = B.card + ORDER_LOAD; B.w1 = B.done + LAND;
  const cut = B.w1 + HOLD_B;
  return { r, A, B, cut, end: cut + END_DELAY + END_LEN };
}
// the chain's length from its first reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

const money = (v) => `$${v.toFixed(2)}`;
const CART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2.5l2.2 10.5h10.6L20.5 7H7"/><circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg>';
const GLASS = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const CARET = '<svg class="hw-dd" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3"/></svg>';

// the store's bar over its confirmation: Amazon's dark bar and nav strip, or Temu's white bar
function top(D) {
  if (D.store === 'amazon') {
    return `<div class="hw-amz-top"><img class="hw-logo" src="${asset(D.logoDark)}" alt="Amazon"/>
      <div class="hw-q"><span class="hw-q-all">All${CARET}</span><span class="hw-q-t"></span><span class="hw-go">${GLASS}</span></div>
      <span class="hw-acct"><small>Hello, Sam</small><b>Account &amp; Lists</b></span><span class="hw-cart">${CART}<b>Cart</b></span></div>
      <div class="hw-amz-nav"><b>All</b><span>Today’s Deals</span><span>Halloween</span><span>Grocery</span><span>Customer Service</span><span>Registry</span><span>Gift Cards</span></div>`;
  }
  return `<div class="hw-temu-top"><img class="hw-logo" src="${asset(D.logo)}" alt="Temu"/>
      <div class="hw-q"><span class="hw-q-t"></span><span class="hw-go">${GLASS}</span></div>
      <span class="hw-acct"><b>Orders &amp; Account</b></span><span class="hw-cart">${CART}</span></div>`;
}

// the confirmation: the store's own words, the item, where it ships and the subtotal (no tax or total is claimed: those
// need a real cart)
function done(x, D) {
  const it = D.item, n = D.qty || 1;
  const line = D.store === 'amazon' ? 'Order placed, thanks!' : 'Thank you! Your order has been placed.';
  return `<div class="hw-done"><div class="hw-done-box">
    <div class="hw-done-h"><span class="hw-chk">${CHECK}</span><b>${line}</b></div>
    <p class="hw-done-s">${D.store === 'amazon' ? 'Confirmation will be sent to your email.' : 'We’ll email you as soon as it ships.'}</p>
    <p class="hw-done-to"><b>Shipping to Sam,</b> 455 Market St, Ste 1480, San Francisco, CA</p>
    <div class="hw-done-it"><span class="hw-done-im"><img src="${asset(it.file)}" alt="${x.esc(it.title)}"/>${n > 1 ? `<i>×${n}</i>` : ''}</span>
      <div class="hw-done-tx"><b>${x.esc(D.arrives)}</b><span>${x.esc(it.title)}</span><small>${D.sizeLabel ? `Size: ${x.esc(D.sizeLabel)} · ` : ''}Qty: ${n}</small></div>
      <b class="hw-done-p">${money(it.price)}</b></div>
    <div class="hw-done-sub"><span>Subtotal (${n} item${n > 1 ? 's' : ''})</span><b>${money(it.price * n)}</b></div>
  </div></div>`;
}

// the reply's card: the bakery artifact frame (bakery.005f5570.css .bk) around the confirmation page, which settles into
// the view as the skeleton's sweep fades (the burger cut's order card)
function card(x, D) {
  const it = D.item, n = D.qty || 1;
  const html = `<div class="bk hw-card hw-${D.store}">
    <div class="bk-head"><b class="bk-title">${D.name} order<small>${n} item${n > 1 ? 's' : ''} · ${money(it.price * n)} subtotal</small></b>${shareBtn(`${D.name} order`)}<a class="bk-btn bk-publish hw-open" href="${it.url}" target="_blank" rel="noopener noreferrer"><img src="${asset(D.mark)}" alt="${D.name}">View order</a></div>
    <div class="bk-view"><div class="hw-zoom"><div class="hw-pg hw-pg-${D.store}">${top(D)}${done(x, D)}</div></div><i class="bk-sh"></i></div></div>`;
  const n0 = x.el(html);
  return { n: n0, zoom: n0.querySelector('.hw-zoom'), sh: n0.querySelector('.bk-sh'), chk: n0.querySelector('.hw-chk') };
}

// a block's entrance: it rises and settles in over 0.45s from `at` (multicat.516afb1a.js enter)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
  return ci;
}

// the streamed line every reply opens with: the visible prefix, the rest held in place transparent
function sayEl(x, text) {
  const n = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  let shown = -1;
  return { n, render(t, at) {
    const c = streamCount(text, at + 0.06, 70, t);
    if (c !== shown) { n.firstElementChild.textContent = text.slice(0, c); n.lastElementChild.textContent = text.slice(c); shown = c; }
  } };
}

// one order card at t: the skeleton's sweep until the confirmation lands at R.done, then the page settles and its
// check pops
function drawCard(c, t, R) {
  enter(c.n, t, R.card);
  const lp = landing(t, R.done);
  shimmer(c.sh, t, R.card, 0, lp);
  settle(c.zoom, lp);
  const cp = outBack(seg(t, R.done + 0.12, R.done + 0.42));
  c.chk.style.transform = `scale(${lerp(0.4, 1, clamp(cp, 0, 1.2)).toFixed(4)})`;
  c.chk.style.opacity = clamp(cp * 2).toFixed(3);
}

let sheetLink = null;
function loadSheet() {
  if (sheetLink) return;
  for (const href of [MC_CSS, CSS]) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    track(new Promise((ok) => {
      l.onload = ok;
      l.onerror = () => { console.error(new Error(`halloween variant stylesheet failed to load: ${href}`)); ok(); };
    }));
    document.head.appendChild(l);
    sheetLink = l;
  }
}

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the chain keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheet();
    loadFrameSheet();
    const T = k.T, { A, B } = T;

    // 1. Amazon, in the engine's own reply: its line and its order card
    const say1 = sayEl(x, AMAZON.say);
    const amz = card(x, AMAZON);
    const anchorA = x.el('<i class="mc-anchor" aria-hidden="true"></i>');

    // 2. the second ask, its reply (no header: bare), its line and the Temu order card
    const u = x.el(`<div class="msg qc-u"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(ASK2)}</div></div></div>`);
    const reply = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"></div></div>`);
    const say2 = sayEl(x, TEMU.say);
    const temu = card(x, TEMU);
    const anchorB = x.el('<i class="mc-anchor" aria-hidden="true"></i>');
    reply.lastElementChild.append(say2.n, temu.n, anchorB);
    const follow = [u, reply];
    // Space and Enter press the cards' controls, not the spot's clock (timeline.9b47fc30.js), as on the other beats
    for (const n of [amz.n, temu.n]) n.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('a, button')) e.stopPropagation(); });

    // v16 on this chain: the two asks typing, their sends, each card rising, the bigger hit as Amazon's order lands (the
    // fuller section follows it), the smaller one and the bell as Temu's lands; the bed resolves as the end card covers
    // the chat. Nothing generates on a timer here, so no stopwatch
    const v16 = makePlayerV16({
      typing: [{ text: k.askBy[ID], s: k.s, end: k.typeEnd }, { text: ASK2, s: B.s, end: B.typeEnd }],
      sends: [k.send, B.send],
      camera: k.send,
      resolved: [],
      cards: [A.card, B.card],
      gens: [],
      image: B.done, model: A.done, order: B.done, play: T.cut,
      cover: T.cut, pop: T.cut + END_DELAY, word: T.cut + END_DELAY + 0.3, end: T.end,
    }, ID);
    addEventListener('variantchange', () => v16.stop());

    // the end card: the house superbot.gg lockup over the spot's black; it rides in nodes (so other variants hide it) and
    // moves to the scene section on the first render, above the hub
    const endCard = x.el(`<div class="mc-end" role="img" aria-label="superbot.gg"><div class="mc-end-word"><b>superbot.gg</b></div><div class="mc-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.mc-end-word'), endBot = endCard.querySelector('.mc-end-bot');
    let endK = 1, placed = false, decoding = false;

    return {
      nodes: [say1.n, amz.n, anchorA, ...follow, endCard],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[A.r, say1.n], [A.card, anchorA], [B.send, u], [B.r, say2.n], [B.card, anchorB]],
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
          for (const pic of [...amz.n.querySelectorAll('img'), ...temu.n.querySelectorAll('img')]) {
            track(pic.decode().catch((e) => console.error(new Error(`halloween image failed to decode: ${pic.src}`, { cause: e }))));
          }
        }
        if (music() === 'v16') v16.sync(t); else v16.stop();

        // 1. Amazon
        say1.render(t, A.r);
        drawCard(amz, t, A);

        // 2. Temu
        x.appear(u, t, B.send);
        x.appear(reply, t, B.r);
        say2.render(t, B.r);
        drawCard(temu, t, B);

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
