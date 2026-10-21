// The left pane (the chat with its composer) and the activity tab under the live view, both painted from t. Items are
// laid out once, at their final size (streamed text keeps its unrevealed rest as transparent text), so a pane scrolls by
// summing the heights of what has arrived, each weighted by its entrance: the newest line slides up into view. The
// activity tab is text only: one plain line per step, a breakthrough's line bold in the ink with a 🎉 after it.
import { seg, outCubic, caretOn, countAt, lastAt, el, esc, REDUCED, STREAM_CPS } from './lib.af4c3c6b.js';
import { SITES, fav } from './sites.af4c3c6b.js';

const TYPE_CPS = 40;
const GAP = 14; // between chat items (.cm margin-bottom)
const ENTER = 0.32; // an item's fade and rise

// the composer's placeholder: the hub's own line until the prompt is sent, then follow-ups the user could send, one at a
// time, each rising in, held long enough to read, then fading up and out before the next rises in
const HINT_FIRST = 'How can superbot help you today?';
const HINTS = [
  'Look across my websites...',
  'Make sure to include tax in the price...',
  'Notify me when it drops below $50...',
  'Only show seats in the lower bowl...',
  'Buy them if they hit $45 each...',
  'Find 4 seats together instead...',
  'Add a parking pass to the order...',
  'Check again every hour until the show...',
];
const HINT_SLOT = 4.2; // one suggestion, in to out
const HINT_FADE = 0.35; // its rise in, and its fade out
const HINT_RISE = 5; // px it travels in and out
function hintAt(t, from) {
  if (t < from) return { text: HINT_FIRST, k: 1, y: 0 };
  const n = Math.floor((t - from) / HINT_SLOT), p = t - from - n * HINT_SLOT;
  const kin = outCubic(seg(p, 0, HINT_FADE)), kout = seg(p, HINT_SLOT - HINT_FADE, HINT_SLOT);
  return { text: HINTS[n % HINTS.length], k: Math.min(kin, 1 - kout), y: ((1 - kin) - kout) * HINT_RISE };
}

// superbot's messages are bare text and cards, no name line over them
function chatItem(c) {
  if (c.kind === 'user') return `<div class="cm cm-u"><span>${esc(c.text)}</span></div>`;
  const card = c.card ? `<div class="cm-card">
      <span class="cm-fav"><img src="${fav(SITES[c.card.site].id)}" alt="" width="18" height="18"></span>
      <span class="cm-card-t"><b>${esc(SITES[c.card.site].name)}</b><small>${esc(c.card.seat)}</small><small>2 seats together, fees included</small></span>
      <span class="cm-card-p"><b>$${c.card.price}</b><small>each</small></span>
    </div>` : '';
  const after = c.after ? `<p class="cm-say cm-after"><span class="cm-v"></span><span class="cm-h">${esc(c.after)}</span></p>` : '';
  return `<div class="cm cm-b"><p class="cm-say"><span class="cm-v"></span><span class="cm-h">${esc(c.text)}</span></p>${card}${after}</div>`;
}

export function buildFeed(left, act, S) {
  const feedIn = left.querySelector('.ch-in');
  const items = S.chat.map((c) => {
    const node = el(chatItem(c));
    feedIn.appendChild(node);
    const say = [...node.querySelectorAll('.cm-say')].map((p) => ({ v: p.firstElementChild, h: p.lastElementChild, text: p.lastElementChild.textContent, shown: -1 }));
    const textEnd = c.at + 0.08 + (c.text.length / STREAM_CPS);
    const cardAt = textEnd + 0.15;
    return { c, node, say, card: node.querySelector('.cm-card'), textEnd, cardAt, h: 0 };
  });
  const actIn = act.querySelector('.ac-in');
  const rows = S.acts.map((a) => {
    const node = el(a.win ? `<div class="ac-row ac-win">${esc(a.text)}<span class="ac-fx" aria-hidden="true">🎉</span></div>` : `<div class="ac-row">${esc(a.text)}</div>`);
    actIn.appendChild(node);
    return { a, node, h: 0 };
  });
  return {
    feed: left.querySelector('.ch-feed'), feedIn, items,
    typed: left.querySelector('.rc-typed'), ph: left.querySelector('.rc-hint'), caret: left.querySelector('.rc-caret'), send: left.querySelector('.rc-send'),
    list: act.querySelector('.ac-list'), actIn, rows, empty: act.querySelector('.ac-empty'), shownTyped: null, shownHint: null,
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
  for (const it of f.items) {
    const k = enter(t, it.c.at);
    reveal(it.node, k);
    if (k <= 0) continue;
    if (it.c.kind === 'bot') {
      stream(it.say[0], it.c.at + 0.08, t);
      if (it.card) reveal(it.card, enter(t, it.cardAt));
      if (it.say[1]) stream(it.say[1], it.cardAt + 0.35, t);
    }
  }
  const room = f.feed.clientHeight - 28; // the feed's top and bottom padding (.ch-in)
  f.feedIn.style.transform = `translateY(${(-scrolled(f.items, t, room)).toFixed(2)}px)`;

  // composer: the user's draft types in, the send button lights while there is text; while it is empty the placeholder
  // turns through its suggestions (with reduced motion they only fade)
  const draft = S.typing.find((d) => t >= d.start && t < d.send);
  const text = draft ? draft.text.slice(0, countAt(draft.text, draft.start, TYPE_CPS, t)) : '';
  if (text !== f.shownTyped) { f.typed.textContent = text; f.shownTyped = text; }
  const hint = hintAt(t, S.typing[0].send);
  if (hint.text !== f.shownHint) { f.ph.textContent = hint.text; f.shownHint = hint.text; }
  f.ph.style.opacity = hint.k.toFixed(3);
  f.ph.style.transform = REDUCED || !hint.y ? 'none' : `translateY(${hint.y.toFixed(2)}px)`;
  f.ph.style.display = text ? 'none' : '';
  f.caret.style.display = draft ? '' : 'none';
  f.caret.style.opacity = !draft || t < draft.start + draft.text.length / TYPE_CPS || caretOn(t) ? '1' : '0';
  f.send.classList.toggle('is-on', !!text);

  // activity
  const last = lastAt(S.acts, t);
  f.empty.style.opacity = last ? '0' : '1';
  for (const r of f.rows) reveal(r.node, enter(t, r.a.at));
  const actRoom = f.list.clientHeight - 12; // .ac-in padding
  f.actIn.style.transform = `translateY(${(-scrolled(f.rows, t, actRoom)).toFixed(2)}px)`;
}
