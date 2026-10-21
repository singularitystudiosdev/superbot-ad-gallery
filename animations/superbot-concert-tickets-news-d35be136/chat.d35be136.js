// The chat on the left: the user's messages as bubbles, superbot's "taking control" chip, and superbot's replies as
// plain streamed text (no name or mark over them); the composer under it types the user's draft in and lights its send
// button. The composer keeps +, the effort picker (High), the mic and send. Items are laid out once at their final size
// (streamed text keeps its unrevealed rest as transparent text), so the feed scrolls by summing what has arrived.
import { seg, outCubic, caretOn, countAt, el, esc, glyph, REDUCED } from './lib.d35be136.js';
import { CHAT, TYPING, TITLE } from './timeline.d35be136.js';

const STREAM_CPS = 70;
const GAP = 14; // between chat items (.cm margin-bottom)
const ENTER = 0.32; // an item's fade and rise
const OK = '<svg class="cm-ok" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

function item(c) {
  if (c.kind === 'user') return `<div class="cm cm-u"><span>${esc(c.text)}</span></div>`;
  if (c.kind === 'chip') return `<div class="cm cm-c"><span class="cm-chip"><span class="cm-chip-ic">${glyph('monitor')}</span><span>${esc(c.text)}</span><span class="cm-st"><i class="cm-spin"></i>${OK}</span></span></div>`;
  const card = c.card ? `<div class="cm-card">
      <span class="cm-fav"><img src="img/${c.card.site.fav}" alt="" width="18" height="18"></span>
      <span class="cm-card-t"><b>${esc(c.card.site.name)}</b><small>${esc(c.card.seat)}</small><small>2 seats together, fees included</small></span>
      <span class="cm-card-p"><b>$${c.card.price}</b><small>each</small></span>
    </div>` : '';
  const after = c.after ? `<p class="cm-say"><span class="cm-v"></span><span class="cm-h">${esc(c.after)}</span></p>` : '';
  return `<div class="cm cm-b"><p class="cm-say"><span class="cm-v"></span><span class="cm-h">${esc(c.text)}</span></p>${card}${after}</div>`;
}

export function buildChat(pane) {
  const feedIn = pane.querySelector('.ch-in');
  const items = CHAT.map((c) => {
    const node = el(item(c));
    feedIn.appendChild(node);
    const lines = [...node.querySelectorAll('.cm-say')].map((p) => ({ v: p.firstElementChild, h: p.lastElementChild, text: p.lastElementChild.textContent, shown: -1 }));
    const cardAt = c.at + 0.08 + c.text.length / STREAM_CPS + 0.15;
    return { c, node, lines, card: node.querySelector('.cm-card'), spin: node.querySelector('.cm-spin'), ok: node.querySelector('.cm-ok'), cardAt, h: 0 };
  });
  pane.querySelector('.rc-effort-ic').innerHTML = glyph('gauge');
  return {
    feed: pane.querySelector('.ch-feed'), feedIn, items, title: pane.querySelector('.ch-title'),
    typed: pane.querySelector('.rc-typed'), hint: pane.querySelector('.rc-hint'), caret: pane.querySelector('.rc-caret'), send: pane.querySelector('.rc-send'),
    shownTyped: null,
  };
}

// heights once laid out (fonts loaded)
export function measureChat(f) {
  for (const it of f.items) it.h = it.node.offsetHeight + GAP;
}

const enter = (t, at) => outCubic(seg(t, at, at + ENTER));
// an arrival fades in and rises 6px; with reduced motion it only fades
function reveal(node, k) {
  node.style.opacity = k.toFixed(3);
  node.style.transform = k >= 1 || REDUCED ? 'none' : `translateY(${((1 - k) * 6).toFixed(2)}px)`;
}
function stream(line, start, t) {
  const n = countAt(line.text, start, STREAM_CPS, t);
  if (n === line.shown) return;
  line.shown = n;
  line.v.textContent = line.text.slice(0, n);
  line.h.textContent = line.text.slice(n);
}

export function paintChat(f, t) {
  const firstSend = CHAT.find((c) => c.kind === 'user').at;
  const title = t >= firstSend ? TITLE.after : TITLE.before;
  if (f.title.textContent !== title) f.title.textContent = title;
  let used = 0;
  for (const it of f.items) {
    const k = enter(t, it.c.at);
    reveal(it.node, k);
    used += it.h * k;
    if (k <= 0) continue;
    if (it.c.kind === 'chip') {
      const done = t >= it.c.done;
      it.spin.style.display = done ? 'none' : '';
      it.spin.style.transform = `rotate(${((t * 400) % 360).toFixed(1)}deg)`;
      it.ok.style.opacity = done ? outCubic(seg(t, it.c.done, it.c.done + 0.2)).toFixed(3) : '0';
    } else if (it.c.kind === 'bot') {
      stream(it.lines[0], it.c.at + 0.08, t);
      if (it.card) reveal(it.card, enter(t, it.cardAt));
      if (it.lines[1]) stream(it.lines[1], it.cardAt + 0.35, t);
    }
  }
  // the feed scrolls only once what has arrived outgrows it
  const room = f.feed.clientHeight - 28; // .ch-in's top and bottom padding
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
