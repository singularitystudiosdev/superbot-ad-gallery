// The chat on the left: the user's messages as bubbles and superbot's replies as plain streamed text (no name or mark
// over them); the composer under it types the user's draft in and lights its send button. The composer keeps +, the
// effort picker (High), the mic and send. A reply that carries a price card opens it the way the house lands an image
// (thumb-land.309eb9c5.js): the card's room eases open, it waits a beat as a shimmering skeleton, the skeleton fades
// away, and only then does the price fade in and settle (timeline.d35be136.js cardTimes). Items are laid out once at
// their final size (streamed text keeps its unrevealed rest as transparent text), so the feed scrolls by summing what
// has arrived, a card's room counted as it opens.
import { seg, lerp, outCubic, inOutCubic, caretOn, countAt, el, esc, glyph, REDUCED } from './lib.d35be136.js';
import { CHAT, TYPING, STREAM_CPS, CARD, cardTimes } from './timeline.d35be136.js';

const GAP = 14; // between chat items (.cm margin-bottom)
const ENTER = 0.45; // an item's fade and rise
const SWEEPS = 1.4; // shimmer passes per second (thumb-land.309eb9c5.js)

function item(c) {
  if (c.kind === 'user') return `<div class="cm cm-u"><span>${esc(c.text)}</span></div>`;
  const card = c.card ? `<div class="cm-cardwrap"><div class="cm-card">
      <div class="cm-card-in">
        <span class="cm-fav"><img src="img/${c.card.site.fav}" alt="" width="24" height="24"></span>
        <span class="cm-card-t"><b>${esc(c.card.site.name)}</b><small>${esc(c.card.seat)}</small><small>2 seats together, fees included</small></span>
        <span class="cm-card-p"><b>$${c.card.price}</b><small>each</small></span>
      </div>
      <i class="cm-sk"></i>
    </div></div>` : '';
  const after = c.after ? `<p class="cm-say"><span class="cm-v"></span><span class="cm-h">${esc(c.after)}</span></p>` : '';
  return `<div class="cm cm-b"><p class="cm-say"><span class="cm-v"></span><span class="cm-h">${esc(c.text)}</span></p>${card}${after}</div>`;
}

export function buildChat(pane) {
  const feedIn = pane.querySelector('.ch-in');
  const items = CHAT.map((c) => {
    const node = el(item(c));
    feedIn.appendChild(node);
    const lines = [...node.querySelectorAll('.cm-say')].map((p) => ({ v: p.firstElementChild, h: p.lastElementChild, text: p.lastElementChild.textContent, shown: -1 }));
    const wrap = node.querySelector('.cm-cardwrap');
    return {
      c, node, lines, h: 0, cardH: 0, ...cardTimes(c.at, c.text),
      wrap, card: wrap && wrap.firstElementChild, inner: node.querySelector('.cm-card-in'), sk: node.querySelector('.cm-sk'),
    };
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

// a price card: its room opens, the skeleton sweeps, the skeleton fades away, then the price lands. Returns how open
// it is
function paintCard(it, t) {
  const o = REDUCED ? (t >= it.open ? 1 : 0) : inOutCubic(seg(t, it.open, it.open + CARD.open));
  it.wrap.style.height = o >= 1 ? '' : `${(it.cardH * o).toFixed(2)}px`;
  it.card.style.opacity = outCubic(seg(t, it.open + 0.1, it.open + CARD.open)).toFixed(3);
  it.card.style.transform = o >= 1 || REDUCED ? 'none' : `scale(${lerp(0.97, 1, o).toFixed(4)})`;
  it.sk.style.opacity = (1 - outCubic(seg(t, it.loaded, it.loaded + CARD.skOut))).toFixed(3);
  it.sk.style.transform = `translateX(${lerp(-100, 100, ((t - it.open) * SWEEPS) % 1).toFixed(1)}%)`;
  const p = outCubic(seg(t, it.land, it.land + CARD.land));
  it.inner.style.opacity = p.toFixed(3);
  it.inner.style.transform = p >= 1 || REDUCED ? 'none' : `translateY(${((1 - p) * 4).toFixed(2)}px)`;
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
    if (k <= 0) continue;
    if (it.c.kind === 'bot') {
      stream(it.lines[0], it.c.at + 0.08, t);
      if (it.lines[1]) stream(it.lines[1], it.land + 0.35, t);
    }
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
