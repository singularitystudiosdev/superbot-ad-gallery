// The chat on the left: the user's messages as bubbles and superbot's replies as plain streamed text (no name or mark
// over them); the composer under it types the user's draft in and lights its send button. The composer keeps +, the
// effort picker (High), the mic and send. A reply may carry a card: the lowest performer (its real thumbnail and play-
// through rate), the three new takes, or the take now live. A card opens the way the house lands an image
// (thumb-land.309eb9c5.js): its room eases open, it waits a beat as a shimmering skeleton, the skeleton fades away, and
// only then does its content fade in and settle (timeline.d35be136.js cardTimes); the three takes land one after
// another. Items are laid out once at their final size, so the feed scrolls by summing what has arrived.
import { seg, lerp, outCubic, inOutCubic, caretOn, countAt, el, esc, glyph, REDUCED } from './lib.d35be136.js';
import { CHAT, TYPING, STREAM_CPS, CARD, cardTimes } from './timeline.d35be136.js';

const GAP = 14; // between chat items (.cm margin-bottom)
const ENTER = 0.45; // an item's fade and rise
const SWEEPS = 1.4; // shimmer passes per second (thumb-land.309eb9c5.js)
const STAGGER = 0.16; // between the three takes landing

function cardHtml(card) {
  if (card.kind === 'trio') {
    return `<div class="cm-card cm-trio">${card.imgs.map((src) => `<span class="cm-take"><img src="img/${src}" alt="" width="768" height="432"><i class="cm-sk"></i></span>`).join('')}</div>`;
  }
  return `<div class="cm-card">
      <div class="cm-card-in">
        <span class="cm-thumb"><img src="img/${card.img}" alt="" width="200" height="113"></span>
        <span class="cm-card-t"><b>${esc(card.title)}</b><small>${esc(card.sub)}</small></span>
        <span class="cm-card-p is-${card.tone}"><b>${esc(card.value)}</b><small>${esc(card.label)}</small></span>
      </div>
      <i class="cm-sk"></i>
    </div>`;
}

function item(c) {
  if (c.kind === 'user') return `<div class="cm cm-u"><span>${esc(c.text)}</span></div>`;
  const card = c.card ? `<div class="cm-cardwrap">${cardHtml(c.card)}</div>` : '';
  return `<div class="cm cm-b"><p class="cm-say"><span class="cm-v"></span><span class="cm-h">${esc(c.text)}</span></p>${card}</div>`;
}

export function buildChat(pane) {
  const feedIn = pane.querySelector('.ch-in');
  const items = CHAT.map((c) => {
    const node = el(item(c));
    feedIn.appendChild(node);
    // superbot's replies stream; the user's bubbles arrive whole
    const p = node.querySelector('.cm-say');
    const line = p && { v: p.firstElementChild, h: p.lastElementChild, text: p.lastElementChild.textContent, shown: -1 };
    const wrap = node.querySelector('.cm-cardwrap');
    const card = wrap && wrap.firstElementChild;
    // what lands: the card's one content block, or each of the three takes with its own sweep
    const parts = !card ? [] : card.classList.contains('cm-trio')
      ? [...card.querySelectorAll('.cm-take')].map((s) => ({ el: s.querySelector('img'), sk: s.querySelector('.cm-sk') }))
      : [{ el: card.querySelector('.cm-card-in'), sk: card.querySelector('.cm-sk') }];
    return { c, node, line, h: 0, cardH: 0, ...cardTimes(c.at, c.text), wrap, card, parts };
  });
  pane.querySelector('.rc-effort-ic').innerHTML = glyph('gauge');
  return {
    feed: pane.querySelector('.ch-feed'), feedIn, items,
    typed: pane.querySelector('.rc-typed'), hint: pane.querySelector('.rc-hint'), caret: pane.querySelector('.rc-caret'), send: pane.querySelector('.rc-send'),
    shownTyped: null,
  };
}

// heights once laid out (fonts loaded), each card at its full height
export function measureChat(f) {
  for (const it of f.items) {
    it.h = it.node.offsetHeight + GAP;
    if (it.wrap) it.cardH = it.wrap.offsetHeight;
  }
}

const enter = (t, at) => outCubic(seg(t, at, at + ENTER));
// an arrival fades in and rises 8px; with reduced motion it only fades
function reveal(node, k) {
  node.style.opacity = k.toFixed(3);
  node.style.transform = k >= 1 || REDUCED ? 'none' : `translateY(${((1 - k) * 8).toFixed(2)}px)`;
}
function stream(line, start, t) {
  const n = countAt(line.text, start, STREAM_CPS, t);
  if (n === line.shown) return;
  line.shown = n;
  line.v.textContent = line.text.slice(0, n);
  line.h.textContent = line.text.slice(n);
}

// a card: its room opens, the skeleton sweeps, the skeleton fades away, then the content lands. Returns how open it is
function paintCard(it, t) {
  const o = REDUCED ? (t >= it.open ? 1 : 0) : inOutCubic(seg(t, it.open, it.open + CARD.open));
  it.wrap.style.height = o >= 1 ? '' : `${(it.cardH * o).toFixed(2)}px`;
  it.card.style.opacity = outCubic(seg(t, it.open + 0.1, it.open + CARD.open)).toFixed(3);
  it.card.style.transform = o >= 1 || REDUCED ? 'none' : `scale(${lerp(0.97, 1, o).toFixed(4)})`;
  it.parts.forEach((part, i) => {
    const d = i * STAGGER;
    part.sk.style.opacity = (1 - outCubic(seg(t, it.loaded + d, it.loaded + d + CARD.skOut))).toFixed(3);
    part.sk.style.transform = `translateX(${lerp(-100, 100, ((t - it.open) * SWEEPS + i * 0.17) % 1).toFixed(1)}%)`;
    const p = outCubic(seg(t, it.land + d, it.land + d + CARD.land));
    part.el.style.opacity = p.toFixed(3);
    part.el.style.transform = p >= 1 || REDUCED ? 'none' : `translateY(${((1 - p) * 4).toFixed(2)}px)`;
  });
  return o;
}

export function paintChat(f, t) {
  let used = 0;
  for (const it of f.items) {
    const k = enter(t, it.c.at);
    reveal(it.node, k);
    let h = it.h;
    if (it.wrap) h -= it.cardH * (1 - (k > 0 ? paintCard(it, t) : 0));
    used += h * k;
    if (k > 0 && it.c.kind === 'bot') stream(it.line, it.c.at + 0.08, t);
  }
  // the feed scrolls only once what has arrived outgrows it
  const room = f.feed.clientHeight - 30; // .ch-in's top and bottom padding
  f.feedIn.style.transform = `translateY(${(-Math.max(0, used - room)).toFixed(2)}px)`;

  // composer: the user's draft types in, the send button lights while there is text
  const draft = TYPING.find((d) => t >= d.start && t < d.send);
  const text = draft ? draft.text.slice(0, countAt(draft.text, draft.start, draft.cps, t)) : '';
  if (text !== f.shownTyped) { f.typed.textContent = text; f.shownTyped = text; }
  f.hint.style.display = text ? 'none' : '';
  f.caret.style.display = draft ? '' : 'none';
  f.caret.style.opacity = !draft || t < draft.start + draft.text.length / draft.cps || caretOn(t) ? '1' : '0';
  f.send.classList.toggle('is-on', !!text);
}
