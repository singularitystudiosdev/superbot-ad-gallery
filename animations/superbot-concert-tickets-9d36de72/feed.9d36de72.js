// The left pane (the chat with its composer) and the activity tab under the live view, both painted from t. Items are
// laid out once, at their final size (streamed text keeps its unrevealed rest as transparent text), so a pane scrolls by
// summing the heights of what has arrived, each weighted by its entrance: the newest line slides up into view.
import { seg, outCubic, caretOn, countAt, el, esc, REDUCED } from './lib.9d36de72.js?v=3';
import { SITES, fav } from './sites.9d36de72.js?v=3';

const STREAM_CPS = 70;
const TYPE_CPS = 40;
const GAP = 14; // between chat items (.cm margin-bottom)
const ENTER = 0.32; // an item's fade and rise
export const SB_MARK = '<span class="sb-tile"><i class="sbm sbm-c"></i><i class="sbm sbm-m"></i><i class="sbm sbm-w"></i></span>';
const OK = '<svg class="cm-ok" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

// lucide glyphs (lucide.dev, via api.iconify.design), plain line icons in the row's own ink
const G = {
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20a14.5 14.5 0 0 0 0-20M2 12h20"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.9-1.9"/>',
  sort: '<path d="m3 16 4 4 4-4m-4 4V4m4 0h10M11 8h7m-7 4h4"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  down: '<path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/>',
  fees: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76M15 9l-6 6m0-6h.01M15 15h.01"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m16 9-5.5 5.5L8 12"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0m-10.47-5.674A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5m5 4a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Zm11-4v2m0 10v2m0-8v2"/>',
};
export const glyph = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${G[name]}</svg>`;
const MUTED = [161, 161, 166], INK = [229, 229, 234]; // #a1a1a6 settled rows, #e5e5ea the newest
const FADE = 36; // the log's top edge fades over this many px once rows scroll under it

function chatItem(c) {
  if (c.kind === 'user') return `<div class="cm cm-u"><span>${esc(c.text)}</span></div>`;
  if (c.kind === 'chip') return `<div class="cm cm-c"><span class="cm-chip">${SB_MARK}<span>${esc(c.text)}</span><span class="cm-st"><i class="cm-spin"></i>${OK}</span></span></div>`;
  const card = c.card ? `<div class="cm-card">
      <span class="cm-fav"><img src="${fav(SITES[c.card.site].id)}" alt="" width="18" height="18"></span>
      <span class="cm-card-t"><b>${esc(SITES[c.card.site].name)}</b><small>${esc(c.card.seat)}</small><small>2 seats together, fees included</small></span>
      <span class="cm-card-p"><b>$${c.card.price}</b><small>each</small></span>
    </div>` : '';
  const after = c.after ? `<p class="cm-say cm-after"><span class="cm-v"></span><span class="cm-h">${esc(c.after)}</span></p>` : '';
  return `<div class="cm cm-b"><div class="cm-who">${SB_MARK}Superbot</div><p class="cm-say"><span class="cm-v"></span><span class="cm-h">${esc(c.text)}</span></p>${card}${after}</div>`;
}

export function buildFeed(left, act, S) {
  const feedIn = left.querySelector('.ch-in');
  const items = S.chat.map((c) => {
    const node = el(chatItem(c));
    feedIn.appendChild(node);
    const say = [...node.querySelectorAll('.cm-say')].map((p) => ({ v: p.firstElementChild, h: p.lastElementChild, text: p.lastElementChild.textContent, shown: -1 }));
    const textEnd = c.at + 0.08 + (c.text.length / STREAM_CPS);
    const cardAt = textEnd + 0.15;
    return { c, node, say, card: node.querySelector('.cm-card'), spin: node.querySelector('.cm-spin'), ok: node.querySelector('.cm-ok'), textEnd, cardAt, h: 0 };
  });
  const actIn = act.querySelector('.ac-in');
  const rows = S.acts.map((a) => {
    const sub = a.sub ? `<span class="ac-sub">${esc(a.sub)}</span>` : '';
    const node = el(`<li class="ac-row"><span class="ac-ic">${glyph(a.icon)}</span><span class="ac-tx">${esc(a.text)}${sub}</span></li>`);
    actIn.appendChild(node);
    return { a, node, h: 0 };
  });
  act.querySelector('.ac-task .ac-ic').innerHTML = glyph('ticket');
  return {
    feed: left.querySelector('.ch-feed'), feedIn, items, title: left.querySelector('.ch-title'),
    typed: left.querySelector('.rc-typed'), ph: left.querySelector('.rc-hint'), caret: left.querySelector('.rc-caret'), send: left.querySelector('.rc-send'),
    list: act.querySelector('.ac-list'), actIn, rows, empty: act.querySelector('.ac-empty'), task: act.querySelector('.ac-task'),
    subtitle: act.querySelector('.ac-title small'), shownTyped: null,
  };
}

// heights once laid out (fonts loaded)
export function measureFeed(f) {
  for (const it of f.items) it.h = it.node.offsetHeight + GAP;
  for (const r of f.rows) r.h = r.node.offsetHeight;
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
// how far a pane has scrolled: what has arrived, less the room it has
function scrolled(list, t, room) {
  let used = 0;
  for (const it of list) used += it.h * enter(t, it.c ? it.c.at : it.a.at);
  return Math.max(0, used - room);
}

export function paintFeed(f, S, t) {
  // chat
  const firstSend = S.chat.find((c) => c.kind === 'user').at;
  const title = t >= firstSend ? 'Velvet Static tickets' : 'New chat';
  if (f.title.textContent !== title) f.title.textContent = title;
  for (const it of f.items) {
    const k = enter(t, it.c.at);
    reveal(it.node, k);
    if (k <= 0) continue;
    if (it.c.kind === 'chip') {
      const done = t >= it.c.done;
      it.spin.style.display = done ? 'none' : '';
      it.spin.style.transform = `rotate(${((t * 400) % 360).toFixed(1)}deg)`;
      it.ok.style.opacity = done ? outCubic(seg(t, it.c.done, it.c.done + 0.2)).toFixed(3) : '0';
    } else if (it.c.kind === 'bot') {
      stream(it.say[0], it.c.at + 0.08, t);
      if (it.card) reveal(it.card, enter(t, it.cardAt));
      if (it.say[1]) stream(it.say[1], it.cardAt + 0.35, t);
    }
  }
  const room = f.feed.clientHeight - 28; // the feed's top and bottom padding (.ch-in)
  f.feedIn.style.transform = `translateY(${(-scrolled(f.items, t, room)).toFixed(2)}px)`;

  // composer: the user's draft types in, the send button lights while there is text
  const draft = S.typing.find((d) => t >= d.start && t < d.send);
  const text = draft ? draft.text.slice(0, countAt(draft.text, draft.start, TYPE_CPS, t)) : '';
  if (text !== f.shownTyped) { f.typed.textContent = text; f.shownTyped = text; }
  f.ph.style.display = text ? 'none' : '';
  f.caret.style.display = draft ? '' : 'none';
  f.caret.style.opacity = !draft || t < draft.start + draft.text.length / TYPE_CPS || caretOn(t) ? '1' : '0';
  f.send.classList.toggle('is-on', !!text);

  // activity: the task pins under the header once asked; steps arrive at the foot, the newest in ink, settling to
  // muted as the next one comes in; once they scroll, the top edge fades
  const asked = enter(t, firstSend);
  reveal(f.task, asked);
  f.subtitle.style.opacity = asked.toFixed(3);
  f.empty.style.opacity = (1 - asked).toFixed(3);
  const newest = f.rows.findLastIndex((r) => r.a.at <= t);
  f.rows.forEach((r, k) => {
    reveal(r.node, enter(t, r.a.at));
    const ink = k === newest ? 1 : k === newest - 1 ? 1 - enter(t, f.rows[newest].a.at) : 0;
    r.node.style.color = `rgb(${MUTED.map((m, c) => Math.round(m + (INK[c] - m) * ink)).join(',')})`;
  });
  const actRoom = f.list.clientHeight - 16; // .ac-in padding
  const shift = scrolled(f.rows, t, actRoom);
  f.actIn.style.transform = `translateY(${(-shift).toFixed(2)}px)`;
  f.list.style.setProperty('--fade', `${Math.min(FADE, shift).toFixed(1)}px`);
}
