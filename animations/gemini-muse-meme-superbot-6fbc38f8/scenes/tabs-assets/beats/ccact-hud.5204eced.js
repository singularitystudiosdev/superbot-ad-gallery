// The activity loop cut's side panel (beats/ccact.5204eced.js), in Muse's look: to the right of the frame a grey card
// with the loop superbot is on, the search's topline (the cheapest fare so far) in a white card at its top, then a row per
// thing superbot did, newest on top, each with its 3D icon (Microsoft Fluent Emoji 3D, img/ccact.5204eced/CREDITS.txt), a
// bold line and a grey detail. Every value is set from t, so frozen ?t= frames hold. The fares are the captures' own
// (img/flights.92b9b0b0/CREDITS.txt). Styles in ../ccact.5204eced.css (cxa-*), with the progress cuts' changing-line cell
// (computer-progress.a05be571.css, ccp-lbl).
import { lerp, seg, outCubic, outBack, esc } from '../../../lib.9b47fc30.js';

// the topline as each fare is read (T.news): what it is, the fare, where and how; the label turns to nonstop with loop 2
export const NEWS = [
  { label: 'Cheapest so far', price: '$1,594', sub: 'United · nonstop · Google Flights' },
  { label: 'Cheapest so far', price: '$1,155', sub: '1 stop · Kayak', drop: '↓ $439' },
  { label: 'Cheapest so far', price: '$1,155', sub: '1 stop · Kayak and momondo' },
  { label: 'Cheapest nonstop', price: '$1,594', sub: 'United · Google Flights' },
  { label: 'Cheapest nonstop', price: '$1,497', sub: 'ANA · momondo', drop: '↓ $97' },
  { label: 'Cheapest nonstop', price: '$1,497', sub: 'ANA · momondo and Kayak' },
];
// the rail's rows (T.acts): an icon, a line, a detail; a fare's row carries its drop
export const ACTS = [
  ['cursor', 'Took control', 'Your computer'],
  ['globe', 'Google Flights', 'Opened · loop 1'],
  ['tag', '$1,594', 'United nonstop'],
  ['globe', 'Kayak', 'Opened · loop 1'],
  ['chat', 'You asked', '“any updates?”'],
  ['tag', '$1,155', 'Kayak · 1 stop', '↓ $439'],
  ['globe', 'momondo', 'Opened · loop 1'],
  ['tag', '$1,155', 'momondo · 1 stop'],
  ['chat', 'You asked', '“only nonstop”'],
  ['loop', 'Loop 2', 'Nonstop only'],
  ['reload', 'Google Flights', 'Reloaded · loop 2'],
  ['tag', '$1,594', 'United nonstop'],
  ['filter', 'momondo', 'Nonstop filter on'],
  ['chat', 'You asked', '“best so far?”'],
  ['tag', '$1,497', 'ANA nonstop', '↓ $97'],
  ['filter', 'Kayak', 'Nonstop filter on'],
  ['check', 'Done', '$1,497 on ANA'],
];
// each icon's Fluent Emoji 3D file (img/ccact.5204eced/<name>.png, 96px)
export const ICONS = {
  cursor: 'laptop', globe: 'globe_with_meridians', tag: 'label', chat: 'speech_balloon', loop: 'repeat_button',
  reload: 'counterclockwise_arrows_button', filter: 'magnifying_glass_tilted_right', check: 'check_mark_button',
  activity: 'clipboard', plane: 'airplane',
};
export const icon = (x, name, cls) => `<img class="cxa-3d ${cls}" src="${x.img(`ccact.5204eced/${ICONS[name]}.png`)}" width="96" height="96" alt="" aria-hidden="true">`;

const newsIn = (T, t) => outCubic(seg(t, T.news[0], T.news[0] + 0.4));

// a line that changes: every version stacked in one cell (.ccp-lbl), the running one rising in, the last one rising
// out; the cell's width follows the running line's, so its box fits the text
const lines = (list, cls = '') => `<span class="ccp-lbl ${cls}">${list.map((s) => `<span>${esc(s)}</span>`).join('')}</span>`;
function paintLines(cell, at, t) {
  const spans = cell.children;
  let cur = 0;
  for (let i = 0; i < spans.length; i++) {
    const a = at[i], b = at[i + 1];
    if (t >= a) cur = i;
    const into = i === 0 && t < a ? 1 : outCubic(seg(t, a, a + 0.24)), out = b === undefined ? 0 : outCubic(seg(t, b, b + 0.18));
    spans[i].style.opacity = (into * (1 - out)).toFixed(3);
    spans[i].style.transform = `translateY(${((1 - into) * 5 - out * 5).toFixed(2)}px)`;
  }
  const f = outCubic(seg(t, at[cur], at[cur] + 0.24));
  const w = lerp(spans[Math.max(cur - 1, 0)].offsetWidth, spans[cur].offsetWidth, f);
  cell.style.width = w ? `${w.toFixed(2)}px` : '';
}

// the topline card: the plane, its label, the fare and where it is from, each a changing line; a drop shows what it saved
// for a moment
const uniq = (key) => NEWS.reduce((acc, n, i) => (acc.length && NEWS[acc[acc.length - 1]][key] === n[key] ? acc : [...acc, i]), []);
const LABELS = uniq('label'), PRICES = uniq('price');
const DROPS = NEWS.map((n, i) => (n.drop ? i : -1)).filter((i) => i >= 0);
function newsHtml(x) {
  return `<span class="cxa-news">${icon(x, 'plane', 'cxa-nico')}<span class="cxa-nt"><span class="cxa-nl">${lines(LABELS.map((i) => NEWS[i].label))}</span><span class="cxa-np">${lines(PRICES.map((i) => NEWS[i].price), 'cxa-price')}${DROPS.map((i) => `<b class="cxa-drop">${esc(NEWS[i].drop)}</b>`).join('')}</span>${lines(NEWS.map((n) => n.sub), 'cxa-sub')}</span></span>`;
}
function bindNews(box) {
  const [label, price, sub] = box.querySelectorAll('.cxa-nl .ccp-lbl, .cxa-np .ccp-lbl, .cxa-sub'), drops = box.querySelectorAll('.cxa-drop');
  return (T, t) => {
    paintLines(label, LABELS.map((i) => T.news[i]), t);
    paintLines(price, PRICES.map((i) => T.news[i]), t);
    paintLines(sub, T.news, t);
    DROPS.forEach((i, k) => {
      const d = T.news[i], on = Math.min(1, outBack(seg(t, d + 0.15, d + 0.45))) * (1 - seg(t, d + 2.4, d + 2.7));
      // outBack leaves a residue at 0, so the badge only takes room once it visibly shows
      drops[k].style.opacity = on.toFixed(3);
      drops[k].style.display = on > 0.001 ? '' : 'none';
      drops[k].style.transform = `scale(${lerp(0.6, 1, on).toFixed(3)})`;
    });
  };
}

// the panel: its header (the clipboard, Activity and the loop under it), the topline card, then the rows, newest on top,
// each opening from nothing as it lands so the older ones move down and leave by the foot
export function railHtml(x) {
  const rows = ACTS.map(([ic, title, sub, drop], i) => `<div class="cxa-act" data-i="${i}">${icon(x, ic, 'cxa-ic')}<span class="cxa-at"><b>${esc(title)}${drop ? `<em>${esc(drop)}</em>` : ''}</b><small>${esc(sub)}</small></span></div>`).reverse().join('');
  return `<aside class="cxa-rail" aria-label="Activity">
      <div class="cxa-rh">${icon(x, 'activity', 'cxa-hico')}<span class="cxa-rt"><b>Activity</b>${lines(['Loop 1', 'Loop 2'], 'cxa-rl')}</span></div>
      <div class="cxa-rnews">${newsHtml(x)}</div>
      <div class="cxa-acts">${rows}</div>
    </aside>`;
}
export function bindRail(rail) {
  const rows = [...rail.querySelectorAll('.cxa-act')].sort((a, b) => a.dataset.i - b.dataset.i);
  const loop = rail.querySelector('.cxa-rl'), wrap = rail.querySelector('.cxa-rnews'), news = bindNews(wrap);
  return (T, t, on) => {
    rail.style.opacity = on.toFixed(3);
    rail.style.transform = on >= 1 ? 'none' : `translateX(${((1 - on) * -10).toFixed(2)}px)`;
    paintLines(loop, T.loops, t);
    rows.forEach((n, i) => {
      const a = T.acts[i], p = outCubic(seg(t, a, a + 0.35));
      n.style.display = p > 0 ? '' : 'none';
      n.style.opacity = p.toFixed(3);
      n.style.height = p >= 1 ? '' : `${(n.scrollHeight * p).toFixed(2)}px`;
      n.classList.toggle('is-new', i === rows.length - 1 || t < T.acts[i + 1]);
    });
    const o = newsIn(T, t);
    wrap.style.height = o >= 1 ? '' : `${(wrap.scrollHeight * o).toFixed(2)}px`;
    wrap.style.opacity = o.toFixed(3);
    news(T, t);
  };
}
