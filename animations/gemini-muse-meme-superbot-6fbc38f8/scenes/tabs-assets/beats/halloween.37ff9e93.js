// Halloween shopping beat (the 'halloween-shopping' variant): two shopping asks in one chat, with no model on show, the
// look of the multi-tool cat's credits cut (multicat.516afb1a.js `bare`): no routing chips, no reply headers, the
// composer on Superbot throughout, each reply answering straight after its send. The engine types and sends the first
// ask and this beat answers it; then it carries the chat on by itself, typing, sending and answering the second.
//   1. "Search on amazon and buy the cheapest halloween king sized bag of candy": the reply's card is the Amazon page
//      superbot drives, rebuilt live from real listings (halloween-data.37ff9e93.js; provenance in
//      img/halloween.37ff9e93/CREDITS.txt). The query types into the search field, the results come in, superbot's
//      pointer sorts them by price (the tiles slide into order), rings the cheapest king size bag, opens it, presses
//      Buy Now, and the page turns to "Order placed, thanks!".
//   2. "Use Temu to buy x3 pumpkin costumes size small, cheapest and cutest": the same run on Temu: the search, Size S,
//      price low to high, the cheapest of the cute ones ringed, its sheet open on size S, the quantity stepped to 3,
//      Buy now, and the order's confirmation.
//   3. the house superbot.gg end card (multicat's) covers the chat.
// Each reply opens with what superbot is doing and closes, under its card, with what it bought. Under it all plays v16,
// the credits cut's punchy premium groove (multicat-player.96834de7.js), re-cued to this chain: the pointer's clicks
// tick, the pick and the first order hit, the second order rings. The follow-ups ride in inst.nodes and move in after the
// engine's reply on the first render, as multicat's do. A pure function of t. Nothing was ordered: the pages are rebuilt.
import { clamp, lerp, seg, outCubic, outQuint, outBack, inOutCubic, streamCount, path } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { shareBtn } from './share.29a362ea.js';
import { makePlayer as makePlayerV16 } from './multicat-player.96834de7.js?v=3';
import { music } from '../../../music.47e5d94a.js?v=2';
import { AMAZON, TEMU } from './halloween-data.37ff9e93.js?v=1';

const CSS = new URL('../halloween.37ff9e93.css?v=1', import.meta.url).href;
// the end card, the anchors and the wide composer are multicat's (../multicat.516afb1a.css .mc-end, .mc-anchor, .qc-wide)
const MC_CSS = new URL('../multicat.516afb1a.css?v=9', import.meta.url).href;
export const ID = 'halloween-shopping';
const asset = (p) => new URL('../../../img/halloween.37ff9e93/' + p, import.meta.url).href;

export const TYPE_CPS = 55;  // every ask types at this rate; the first one through its route's typeCps (chat.9b47fc30.js)
const ASK2 = 'Use Temu to buy x3 pumpkin costumes size small, cheapest and cutest';
const Q_CPS = 34;            // superbot's own typing in a store's search field
const REORDER = 0.5;         // the tiles' slide into price order
const PAGE_IN = 0.35;        // the order confirmation's crossfade over the page
const HOLD_A = 1.3;          // the first order's closing line, from its landing to the second ask starting to type
const HOLD_B = 1.7;          // the second's, to the end card covering the chat
// the house end card (multicat.516afb1a.js): the chat fades to its black over END_IN, the card's own 2.5s run starts
// END_DELAY in (mascot pops in, superbot.gg fades up beside it, hold)
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5;
const END_GAP = 44;
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const END_FACE = '<svg class="mc-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="hwEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#hwEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#hwEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#hwEndFace)"/></svg>';

// The store page's layout, in its own 896 x 560 px (fitted to the 560 x 350 view, ../halloween.37ff9e93.css .hw-pg):
// what the pointer aims at is placed from here, so its path and the page agree. Four tiles in a row from TILE_X0
const TILE_W = 200, TILE_GAP = 16, TILE_X0 = 24;
const slotX = (i) => TILE_X0 + i * (TILE_W + TILE_GAP);
// the product sheet: a 640 x 420 box at BOX, its picture left, its column (COL_X wide COL_W) right
const BOX = { x: 128, y: 100, w: 640, h: 420 }, COL_X = 308, COL_W = 308;
// what each store's pointer presses: its filters (the last one sorts by price), a tile's middle, the sheet's quantity
// plus and its buy button (centres, page px)
const STORE = {
  amazon: { gridY: 160, go: { x: 677, y: 30 }, filters: [{ x: 790, y: 119 }], plus: null, buy: { x: BOX.x + COL_X + COL_W / 2, y: BOX.y + 374 } },
  temu: { gridY: 134, go: { x: 662, y: 32 }, filters: [{ x: 70, y: 90 }, { x: 222, y: 90 }], plus: { x: BOX.x + COL_X + 98, y: BOX.y + 262 }, buy: { x: BOX.x + COL_X + COL_W / 2, y: BOX.y + 374 } },
};

// one store run on its own clock, from its card coming in at `a`: the query types and is sent, the results come in,
// each filter is pressed (the last sorts, and the tiles slide into price order), the pick is ringed and opened, the
// quantity steps up (qty - 1 presses on the plus), Buy is pressed and the confirmation lands (`placed`, settled by w1)
function run(D, a) {
  const S = STORE[D.store];
  const q0 = a + 0.4, q1 = q0 + D.query.length / Q_CPS, go = q1 + 0.12, res = go + 0.12;
  let c = res + 0.55;
  const filters = S.filters.map(() => { const at = c; c += 0.5; return at; });
  const sort = filters[filters.length - 1];
  const pick = sort + 0.1 + REORDER + 0.3, open = pick + 0.45;
  c = open + 0.75;
  const plus = Array.from({ length: (D.qty || 1) - 1 }, () => { const at = c; c += 0.3; return at; });
  // with no quantity to set, the sheet still holds long enough to read before Buy is pressed
  const buy = (plus.length ? plus[plus.length - 1] + 0.42 : open + 0.95), placed = buy + 0.22;
  return { card: a, q0, q1, go, res, filters, sort, pick, open, plus, buy, placed, w1: placed + PAGE_IN + 0.1 };
}

// every time in the chain, from the first reply r: the Amazon run in it, the second ask, the Temu run in its reply, then
// the end card. Each reply's closing line streams in as its run settles (`after`), and the feed glides to it
export function plan(r) {
  const A = { r, ...run(AMAZON, r + 0.22) };
  A.after = A.w1 + 0.05;
  const s = A.after + HOLD_A, typeEnd = s + ASK2.length / TYPE_CPS, send = typeEnd + 0.15, rb = send + 0.35 + 0.08;
  const B = { s, typeEnd, send, r: rb, ...run(TEMU, rb + 0.22) };
  B.after = B.w1 + 0.05;
  const cut = B.after + HOLD_B;
  return { r, A, B, cut, end: cut + END_DELAY + END_LEN };
}
// the chain's length from its first reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

const $$ = (n) => n.toFixed(2);
const money = (v) => `$${v.toFixed(2)}`;
const STAR = '<svg viewBox="0 0 100 20" preserveAspectRatio="xMinYMid meet"><path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" transform="translate(0 0)"/><path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" transform="translate(20 0)"/><path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" transform="translate(40 0)"/><path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" transform="translate(60 0)"/><path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" transform="translate(80 0)"/></svg>';
// a rating as five stars filled to it (a grey row, the coloured row clipped over it), with its count
const stars = (x, it) => (it.rating ? `<span class="hw-st"><span class="hw-st-bg">${STAR}</span><span class="hw-st-fg" style="clip-path: inset(0 ${$$(100 - it.rating * 20)}% 0 0)">${STAR}</span></span>${it.reviews ? `<small>${x.esc(it.reviews)}</small>` : ''}` : '');
const GLASS = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>';
const CART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2.5l2.2 10.5h10.6L20.5 7H7"/><circle cx="9.5" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const CARET = '<svg class="hw-dd" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3"/></svg>';
// superbot's pointer on the page: the arrow with its name beside it, as a shared cursor carries one
const POINTER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 2.5l14.2 8.3-6.3 1.4-3.2 5.7z"/></svg><span class="hw-cur-n">superbot</span>';

// Amazon's price: the dollars large, the sign and the cents raised small
const amzPrice = (v) => { const [d, c] = v.toFixed(2).split('.'); return `<span class="hw-pr"><sup>$</sup>${d}<sup>${c}</sup></span>`; };

// a results tile; `tags` are superbot's verdicts, shown on the pick once it is ringed
function tile(x, D, it, i) {
  const pick = it.id === D.pick;
  const price = D.store === 'amazon' ? amzPrice(it.price) : `<span class="hw-pr"><small>$</small>${it.price.toFixed(2)}</span>${it.was ? `<s>${money(it.was)}</s>` : ''}`;
  const under = D.store === 'amazon'
    ? `<span class="hw-tile-b">Add to cart</span>`
    : `<span class="hw-tile-sold">${x.esc(it.sold || '')}</span><span class="hw-tile-c">${CART}</span>`;
  return `<div class="hw-tile" data-i="${i}" style="left: ${slotX(i)}px">
    <div class="hw-tile-im"><img src="${asset(it.file)}" alt="${x.esc(it.title)}" decoding="async"/></div>
    <div class="hw-tile-t">${x.esc(it.short)}</div>
    ${D.store === 'amazon' ? `<div class="hw-tile-r">${stars(x, it)}</div><div class="hw-tile-p">${price}</div>${it.size ? `<div class="hw-tile-s">${x.esc(it.size)}</div>` : ''}` : `<div class="hw-tile-p">${price}</div><div class="hw-tile-r">${stars(x, it)}</div>`}
    ${under}
    ${pick ? `<i class="hw-ring"></i><span class="hw-tags">${D.tags.map((tg) => `<i>${x.esc(tg)}</i>`).join('')}</span>` : ''}
  </div>`;
}

// the page's top: Amazon's dark bar (logo, search, account, cart) and its nav strip, or Temu's white bar and its chips
function top(x, D) {
  if (D.store === 'amazon') {
    return `<div class="hw-amz-top"><img class="hw-logo" src="${asset(D.logoDark)}" alt="Amazon"/>
      <div class="hw-q"><span class="hw-q-all">All${CARET}</span><span class="hw-q-t"><span class="hw-qv"></span><i class="hw-qc"></i></span><span class="hw-go">${GLASS}</span></div>
      <span class="hw-acct"><small>Hello, Sam</small><b>Account &amp; Lists</b></span><span class="hw-cart">${CART}<b>Cart</b></span></div>
      <div class="hw-amz-nav"><b>All</b><span>Today’s Deals</span><span>Halloween</span><span>Grocery</span><span>Customer Service</span><span>Registry</span><span>Gift Cards</span></div>
      <div class="hw-amz-bar"><span>Results for <b>“${x.esc(D.query)}”</b></span><span class="hw-f hw-sort">Sort by: <b class="hw-fv" data-a="Featured" data-b="Price: Low to High">Featured</b>${CARET}</span></div>`;
  }
  return `<div class="hw-temu-top"><img class="hw-logo" src="${asset(D.logo)}" alt="Temu"/>
      <div class="hw-q"><span class="hw-q-t"><span class="hw-qv"></span><i class="hw-qc"></i></span><span class="hw-go">${GLASS}</span></div>
      <span class="hw-acct"><b>Sign in / Register</b></span><span class="hw-cart">${CART}</span></div>
      <div class="hw-temu-chips"><span class="hw-f hw-chip"><b class="hw-fv" data-a="Size" data-b="Size: ${x.esc(D.sizeLabel)}">Size</b>${CARET}</span><span class="hw-f hw-chip">Sort by: <b class="hw-fv" data-a="Relevance" data-b="Price low to high">Relevance</b>${CARET}</span><span class="hw-chip hw-chip-x">Free shipping</span><span class="hw-chip hw-chip-x">4+ stars</span></div>`;
}

// the pick's sheet: its picture, title, rating and price, then the store's buy controls (Temu: its sizes, S chosen, and
// the quantity stepper)
function sheet(x, D, it) {
  const sizes = D.store === 'temu' ? `<div class="hw-sh-l">Size</div><div class="hw-sizes">${D.sizes.map((z) => `<span class="${z === D.sizeLabel ? 'on' : ''}">${x.esc(z)}</span>`).join('')}</div>` : '';
  const qty = D.store === 'temu'
    ? `<div class="hw-sh-l">Qty</div><div class="hw-qty"><span class="hw-qty-m">–</span><b class="hw-qty-n">1</b><span class="hw-qty-p">+</span></div>`
    : `<div class="hw-sh-stock">In Stock</div><div class="hw-sh-qty">Quantity: 1${CARET}</div>`;
  const buttons = D.store === 'amazon' ? '<span class="hw-btn hw-add">Add to Cart</span><span class="hw-btn hw-buy">Buy Now</span>' : '<span class="hw-btn hw-buy">Buy now</span>';
  return `<div class="hw-sheet"><div class="hw-sh-box" style="left: ${BOX.x}px; top: ${BOX.y}px; width: ${BOX.w}px; height: ${BOX.h}px">
    <div class="hw-sh-im"><img src="${asset(it.file)}" alt=""/></div>
    <div class="hw-sh-col" style="left: ${COL_X}px; width: ${COL_W}px">
      <div class="hw-sh-t">${x.esc(it.title)}</div>
      <div class="hw-sh-r">${stars(x, it)}</div>
      <div class="hw-sh-p">${D.store === 'amazon' ? amzPrice(it.price) : `<span class="hw-pr"><small>$</small>${it.price.toFixed(2)}</span>${it.was ? `<s>${money(it.was)}</s>` : ''}`}</div>
      ${sizes}${qty}
      <div class="hw-sh-btns">${buttons}</div>
    </div></div></div>`;
}

// the confirmation the run lands on: the store's own words, the item, where it ships and the subtotal (no tax or total is
// claimed: those need a real cart)
function done(x, D, it) {
  const n = D.qty || 1, sub = money(it.price * n);
  const line = D.store === 'amazon' ? 'Order placed, thanks!' : 'Thank you! Your order has been placed.';
  return `<div class="hw-done"><div class="hw-done-box">
    <div class="hw-done-h"><span class="hw-chk">${CHECK}</span><b>${line}</b></div>
    <p class="hw-done-s">${D.store === 'amazon' ? 'Confirmation will be sent to your email.' : 'We’ll email you as soon as it ships.'}</p>
    <p class="hw-done-to"><b>Shipping to Sam,</b> 455 Market St, Ste 1480, San Francisco, CA</p>
    <div class="hw-done-it"><span class="hw-done-im"><img src="${asset(it.file)}" alt=""/>${n > 1 ? `<i>×${n}</i>` : ''}</span>
      <div class="hw-done-tx"><b>${x.esc(D.arrives)}</b><span>${x.esc(it.title)}</span><small>${D.store === 'temu' ? `Size: ${x.esc(D.sizeLabel)} · ` : ''}Qty: ${n}</small></div>
      <b class="hw-done-p">${money(it.price)}</b></div>
    <div class="hw-done-sub"><span>Subtotal (${n} item${n > 1 ? 's' : ''})</span><b>${sub}</b></div>
  </div></div>`;
}

// the reply's card: the bakery artifact frame (bakery.005f5570.css .bk) around the live store page
function card(x, D) {
  const it = D.items.find((i) => i.id === D.pick);
  const n = D.qty || 1;
  const html = `<div class="bk hw-card hw-${D.store}">
    <div class="bk-head"><b class="bk-title">${D.name} order<small class="hw-sub" data-b="${n} item${n > 1 ? 's' : ''} · ${money(it.price * n)} subtotal">Shopping…</small></b>${shareBtn(`${D.name} order`)}<a class="bk-btn bk-publish hw-open" href="${it.url}" target="_blank" rel="noopener noreferrer"><img src="${asset(D.mark)}" alt="${D.name}">View order</a></div>
    <div class="bk-view"><div class="hw-pg hw-pg-${D.store}">
      ${top(x, D)}
      <div class="hw-grid" style="top: ${STORE[D.store].gridY}px">${D.items.map((i, k) => tile(x, D, i, k)).join('')}</div>
      ${sheet(x, D, it)}
      ${done(x, D, it)}
      <span class="hw-ripple"></span><span class="hw-cur">${POINTER}</span>
    </div></div></div>`;
  return { n: x.el(html), it };
}

// a block's entrance: it rises and settles in over 0.45s from `at` (multicat.516afb1a.js enter)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
  return ci;
}
// a style write only when it changes, as the other beats cache theirs
const put = (n, k, v) => { if (n.style[k] !== v) n.style[k] = v; };
// (the sheet and the confirmation start hidden in the stylesheet, so they are shown outright, never by clearing the style)
const show = (n, p) => { put(n, 'opacity', p.toFixed(3)); put(n, 'visibility', p > 0 ? 'visible' : 'hidden'); };

// the streamed line every reply opens (and here, closes) with: the visible prefix, the rest held in place transparent
function sayEl(x, text) {
  const n = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  let shown = -1;
  return { n, render(t, at) {
    const c = streamCount(text, at + 0.06, 70, t);
    if (c !== shown) { n.firstElementChild.textContent = text.slice(0, c); n.lastElementChild.textContent = text.slice(c); shown = c; }
  } };
}

// one store card's moving parts at t, given its run R: the field types, the tiles come in and slide into price order, the
// pick is ringed, the sheet rises, the quantity counts up, and the confirmation crossfades over it all. The pointer
// follows its stops (a press at each), and the frame's subtitle turns from Shopping… to the order's count and subtotal
function driver(x, D, c, R) {
  const S = STORE[D.store], root = c.n;
  const q = (s) => root.querySelector(s);
  const qv = q('.hw-qv'), qc = q('.hw-qc'), go = q('.hw-go'), sub = q('.hw-sub');
  const tiles = [...root.querySelectorAll('.hw-tile')];
  const fv = [...root.querySelectorAll('.hw-fv')], fs = [...root.querySelectorAll('.hw-f')];
  const ring = q('.hw-ring'), tags = q('.hw-tags');
  const sh = q('.hw-sheet'), box = q('.hw-sh-box'), qn = q('.hw-qty-n'), plusB = q('.hw-qty-p'), buyB = q('.hw-buy');
  const dn = q('.hw-done'), dbox = q('.hw-done-box'), chk = q('.hw-chk');
  const cur = q('.hw-cur'), rip = q('.hw-ripple');
  // relevance order is the data's; price order the sort's
  const order = D.items.map((it, i) => i).sort((a, b) => D.items[a].price - D.items[b].price);
  const rank = D.items.map((_, i) => order.indexOf(i));
  const pickI = D.items.findIndex((it) => it.id === D.pick);
  const tileC = (i, sorted) => ({ x: slotX(sorted ? rank[i] : i) + TILE_W / 2, y: S.gridY + 100 });
  // the pointer's stops: each press held a moment either side; it comes in by the search button as the results land
  const presses = [...R.filters.map((at, i) => ({ at, ...S.filters[i] })), { at: R.open, ...tileC(pickI, true) }, ...R.plus.map((at) => ({ at, ...S.plus })), { at: R.buy, ...S.buy }];
  const keys = [{ t: R.res, x: S.go.x + 30, y: S.go.y + 60 }];
  for (const p of presses) keys.push({ t: p.at - 0.1, x: p.x, y: p.y }, { t: p.at + 0.06, x: p.x, y: p.y });
  // it rests on the pick before pressing it, so the ring is seen under it
  keys.push({ t: R.pick - 0.1, ...tileC(pickI, true) });
  keys.sort((a, b) => a.t - b.t);
  let lastN = -1, sorted = null, subOn = null;
  return (t) => {
    // the query, typed into the field, and the search button's press
    const n = Math.round(D.query.length * seg(t, R.q0, R.q1));
    if (n !== lastN) { qv.textContent = D.query.slice(0, n); lastN = n; }
    put(qc, 'opacity', t >= R.q0 - 0.2 && t < R.go + 0.1 && Math.floor(t * 2.4) % 2 === 0 ? '1' : '0');
    const pg = seg(t, R.go - 0.05, R.go) * (1 - seg(t, R.go, R.go + 0.14));
    put(go, 'transform', pg > 0 ? `scale(${(1 - 0.1 * pg).toFixed(4)})` : 'none');
    // each filter takes its new value as it is pressed
    fv.forEach((v, i) => {
      const on = t >= R.filters[i] + 0.04;
      if (v.dataset.on !== String(on)) { v.textContent = on ? v.dataset.b : v.dataset.a; v.dataset.on = String(on); fs[i].classList.toggle('on', on); }
    });
    // the tiles: in one by one as the results land, then each slides from its relevance slot to its price slot, lifting
    // a little as it passes the others
    const so = inOutCubic(seg(t, R.sort + 0.1, R.sort + 0.1 + REORDER));
    tiles.forEach((tl, i) => {
      const a = outCubic(seg(t, R.res + i * 0.07, R.res + i * 0.07 + 0.3));
      const xx = lerp(slotX(i), slotX(rank[i]), so) - slotX(i);
      const lift = Math.sin(Math.PI * so) * (rank[i] < i ? -10 : 6);
      put(tl, 'opacity', a.toFixed(3));
      put(tl, 'transform', a >= 1 && so === 0 ? 'none' : `translate(${xx.toFixed(2)}px, ${((1 - a) * 12 + lift).toFixed(2)}px)`);
      put(tl, 'zIndex', rank[i] < i ? '2' : '1');
    });
    const isSorted = so >= 1;
    if (isSorted !== sorted) { sorted = isSorted; root.classList.toggle('hw-sorted', isSorted); }
    // superbot's verdict on the pick: the ring draws in, its tags pop
    const rp = outBack(seg(t, R.pick, R.pick + 0.32));
    if (ring) { put(ring, 'opacity', clamp(rp).toFixed(3)); put(ring, 'transform', rp >= 1 ? 'none' : `scale(${lerp(1.06, 1, clamp(rp)).toFixed(4)})`); }
    if (tags) [...tags.children].forEach((tg, i) => {
      const p = outBack(seg(t, R.pick + 0.08 + i * 0.12, R.pick + 0.38 + i * 0.12));
      put(tg, 'opacity', clamp(p * 1.4).toFixed(3));
      put(tg, 'transform', p >= 1 ? 'none' : `translateY(${((1 - p) * 8).toFixed(2)}px) scale(${lerp(0.7, 1, p).toFixed(4)})`);
    });
    // the sheet: the page dims and its box rises in as the pick is pressed, and it all clears as the confirmation lands
    const sp = outCubic(seg(t, R.open + 0.05, R.open + 0.4));
    const dp = outCubic(seg(t, R.placed, R.placed + PAGE_IN));
    show(sh, sp * (1 - dp));
    put(box, 'transform', sp >= 1 ? 'none' : `translateY(${((1 - sp) * 26).toFixed(2)}px) scale(${lerp(0.97, 1, sp).toFixed(4)})`);
    // the quantity counts each plus press, the plus and Buy dip under theirs
    if (qn) {
      const v = String(1 + R.plus.filter((at) => t >= at + 0.04).length);
      if (qn.textContent !== v) qn.textContent = v;
      const pp = Math.max(0, ...R.plus.map((at) => seg(t, at - 0.05, at) * (1 - seg(t, at, at + 0.14))));
      put(plusB, 'transform', pp > 0 ? `scale(${(1 - 0.12 * pp).toFixed(4)})` : 'none');
    }
    const pb = seg(t, R.buy - 0.05, R.buy) * (1 - seg(t, R.buy, R.buy + 0.16));
    put(buyB, 'transform', pb > 0 ? `scale(${(1 - 0.06 * pb).toFixed(4)})` : 'none');
    // the confirmation: over the page, its box settling and its check popping
    show(dn, dp);
    put(dbox, 'transform', dp >= 1 ? 'none' : `translateY(${((1 - dp) * 16).toFixed(2)}px)`);
    const cp = outBack(seg(t, R.placed + 0.15, R.placed + 0.45));
    put(chk, 'transform', `scale(${lerp(0.4, 1, clamp(cp, 0, 1.2)).toFixed(4)})`);
    put(chk, 'opacity', clamp(cp * 2).toFixed(3));
    // the pointer, in from the results to the last press, out as the confirmation lands; a ripple at each press
    const vis = seg(t, R.res, R.res + 0.2) * (1 - seg(t, R.placed - 0.05, R.placed + 0.15));
    const at = path(t, keys);
    const pr = Math.max(0, ...presses.map((p) => seg(t, p.at - 0.06, p.at) * (1 - seg(t, p.at, p.at + 0.12))));
    put(cur, 'opacity', vis.toFixed(3));
    put(cur, 'transform', `translate(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px) scale(${(1 - 0.14 * pr).toFixed(4)})`);
    const last = presses.filter((p) => t >= p.at).pop();
    const rpp = last ? seg(t, last.at, last.at + 0.4) : 1;
    put(rip, 'opacity', (rpp < 1 ? (1 - rpp) * 0.9 * vis : 0).toFixed(3));
    if (last) put(rip, 'transform', `translate(${last.x.toFixed(1)}px, ${last.y.toFixed(1)}px) scale(${lerp(0.3, 1.6, outQuint(rpp)).toFixed(4)})`);
    // the frame's subtitle: what it is doing, then what it bought
    const placedNow = t >= R.placed + 0.15;
    if (placedNow !== subOn) { sub.textContent = placedNow ? sub.dataset.b : 'Shopping…'; subOn = placedNow; }
  };
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

    // 1. Amazon, in the engine's own reply: the opening line, the card, the closing line
    const say1 = sayEl(x, AMAZON.say);
    const amz = card(x, AMAZON);
    const anchorA = x.el('<i class="mc-anchor" aria-hidden="true"></i>');
    const afterA = sayEl(x, AMAZON.after);
    afterA.n.classList.add('hw-after');

    // 2. the second ask, its reply (no header: bare), the Temu card and its closing line
    const u = x.el(`<div class="msg qc-u"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(ASK2)}</div></div></div>`);
    const reply = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"></div></div>`);
    const say2 = sayEl(x, TEMU.say);
    const temu = card(x, TEMU);
    const anchorB = x.el('<i class="mc-anchor" aria-hidden="true"></i>');
    const afterB = sayEl(x, TEMU.after);
    afterB.n.classList.add('hw-after');
    reply.lastElementChild.append(say2.n, temu.n, anchorB, afterB.n);
    const follow = [u, reply];
    const driveA = driver(x, AMAZON, amz, A), driveB = driver(x, TEMU, temu, B);
    // Space and Enter press the cards' controls, not the spot's clock (timeline.9b47fc30.js), as on the other beats
    for (const n of [amz.n, temu.n]) n.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('a, button')) e.stopPropagation(); });

    // v16 on this chain: the asks typing (and superbot's own typing in each search field), the sends, a tick on every
    // press of the pointer, the cards and the sheets rising, an impact as the cheapest bag is ringed and a bigger one as
    // its order lands (the fuller section follows it), the bell on Temu's confirmation; the bed resolves as the end card
    // covers the chat. Nothing generates on a timer here, so no stopwatch
    const runs = [A, B];
    const v16 = makePlayerV16({
      typing: [{ text: k.askBy[ID], s: k.s, end: k.typeEnd }, { text: AMAZON.query, s: A.q0, end: A.q1 }, { text: ASK2, s: B.s, end: B.typeEnd }, { text: TEMU.query, s: B.q0, end: B.q1 }],
      sends: [k.send, A.go, B.send, B.go],
      camera: k.send,
      resolved: runs.flatMap((R) => [...R.filters, R.open, ...R.plus, R.buy]),
      cards: [A.card, A.open, B.card, B.open],
      gens: [],
      image: A.pick, model: A.placed, order: B.placed, play: T.cut,
      cover: T.cut, pop: T.cut + END_DELAY, word: T.cut + END_DELAY + 0.3, end: T.end,
    }, ID);
    addEventListener('variantchange', () => v16.stop());

    // the end card: the house superbot.gg lockup over the spot's black; it rides in nodes (so other variants hide it) and
    // moves to the scene section on the first render, above the hub
    const endCard = x.el(`<div class="mc-end" role="img" aria-label="superbot.gg"><div class="mc-end-word"><b>superbot.gg</b></div><div class="mc-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.mc-end-word'), endBot = endCard.querySelector('.mc-end-bot');
    let endK = 1, placed = false, decoding = false;

    return {
      nodes: [say1.n, amz.n, anchorA, afterA.n, ...follow, endCard],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[A.r, say1.n], [A.card, anchorA], [A.after, afterA.n], [B.send, u], [B.r, say2.n], [B.card, anchorB], [B.after, afterB.n]],
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
        enter(amz.n, t, A.card);
        driveA(t);
        afterA.render(t, A.after);
        x.appear(afterA.n, t, A.after);

        // 2. Temu
        x.appear(u, t, B.send);
        x.appear(reply, t, B.r);
        say2.render(t, B.r);
        enter(temu.n, t, B.card);
        driveB(t);
        afterB.render(t, B.after);
        x.appear(afterB.n, t, B.after);

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
