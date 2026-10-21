// The flight-search loop's screen share (beats/flights.92b9b0b0.js): v3-soft's desktop and takeover overlay
// (computer.ba3976b6.js, its cc3-* markup and sheet) with Chrome working through three flight sites instead of opening
// one tab. Superbot opens a tab per site, types its address, waits out the load (the tab's throbber), scrolls the results
// and rings the fare it reads, as its overlay can; a filter click swaps the page for its filtered capture, and a click on
// an older tab brings it back. The pages are real captures (img/flights.92b9b0b0/CREDITS.txt). Everything follows a
// script the beat lays out on its clock (`S`), and every value is set from t, so frozen frames (?t=) hold. One markup
// and one painter for any scale: the card's view and the Expand panel's.
import { lerp, seg, outCubic, inOutCubic, path, press, blink } from '../../../lib.9b47fc30.js';

export const TOP = 82; // the page area's top on the desktop: Chrome's 42px tab strip and 40px toolbar (computer.ba3976b6.css)
const TAB_W = 240; // Chrome's widest tab (.cc3-tab); four fit the 1470px strip at full width
const PLUS_GAP = 8, PLUS = 28; // the new-tab button's left margin and size (.cc3-plus)
const TIP = { x: 4, y: 2.5 }; // the arrow's hotspot in its 24px box
const ARROW = 'M4 2.5 4 19.5 8.6 15.3 11.5 21.8 14.4 20.5 11.6 14.2 17.8 14.2Z';
const SB_TITLE = 'the AI plans you pay for, in one app'; // superbot.gg's page title, the tab open before superbot starts
// Chrome's glyphs, as computer.ba3976b6.js draws them
const ICON = {
  x: '<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>',
  plus: '<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',
  back: '<svg viewBox="0 0 16 16"><path d="M13 8H3M7 4L3 8l4 4"/></svg>',
  fwd: '<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  reload: '<svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 3v3h-3"/></svg>',
  tune: '<svg viewBox="0 0 16 16"><path d="M3 5h5.5M12.5 5H13M3 11h.5M7.5 11H13"/><circle cx="10.5" cy="5" r="1.6"/><circle cx="5.5" cy="11" r="1.6"/></svg>',
  search: '<svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>',
  more: '<svg viewBox="0 0 16 16"><path d="M8 3.5h.01M8 8h.01M8 12.5h.01"/></svg>',
};
// every page the screen can show, each as captured: 1470 wide, as tall as the capture (the results ones scroll)
export const PAGES = {
  home: { src: 'computer.ba3976b6/superbot-home.png', h: 839, alt: 'superbot.gg: the agent to manage your agents.' },
  ntp: { src: 'computer.ba3976b6/new-tab.png', h: 839, alt: 'Chrome New Tab page' },
  gf: { src: 'flights.92b9b0b0/gflights.jpg', h: 1250, alt: 'Google Flights: Denver to Tokyo, Dec 10 to 20' },
  ky: { src: 'flights.92b9b0b0/kayak.jpg', h: 1250, alt: 'KAYAK: Denver to Tokyo, cheapest first' },
  kyn: { src: 'flights.92b9b0b0/kayak-nonstop.jpg', h: 1250, alt: 'KAYAK: Denver to Tokyo, nonstop only' },
  mo: { src: 'flights.92b9b0b0/momondo.jpg', h: 1250, alt: 'momondo: Denver to Tokyo, cheapest first' },
  mon: { src: 'flights.92b9b0b0/momondo-nonstop.jpg', h: 1250, alt: 'momondo: Denver to Tokyo, nonstop only' },
};

// the entry of a time-sorted list ([t, ...] rows or { t } objects) in force at t, and the one before it
function current(list, t, at = (e) => e[0]) {
  let i = -1;
  while (i + 1 < list.length && t >= at(list[i + 1])) i++;
  return { cur: list[i], prev: list[i - 1], i };
}
// a page's scroll at t: its segments [a, b, from, to] in order, holding the first `from` before them
function scrollAt(list = [[0, 0, 0, 0]], t) {
  let v = list[0][2];
  for (const [a, b, from, to] of list) if (t >= a) v = lerp(from, to, b > a ? inOutCubic(seg(t, a, b)) : 1);
  return v;
}

// one screen share's insides at a scale: Chrome with superbot.gg and the script's tabs, the pages with the fares superbot
// rings, the screen's cursor and its click rings; then the takeover overlay and the heads-up layer over both
export function screenHtml(x, sb, S, fit, hud) {
  const tabs = S.tabs.map((tb) => `<span class="cc3-tab fl-tab"><i class="cc3-bg"></i><span class="cc3-fav fl-fav"><img src="${x.img(tb.fav)}" width="16" height="16" alt=""><i class="fl-throb"></i></span><span class="cc3-tt fl-tt"><span>New Tab</span><span>${x.esc(tb.title)}</span></span><span class="cc3-x">${ICON.x}</span></span>`).join('');
  // each ring in its page, numbered by its place in the script (pages and script order differ)
  const rings = (id) => S.hl.map((h, i) => (h.page === id ? `<i class="fl-hl" data-i="${i}" style="left:${h.box[0]}px;top:${h.box[1]}px;width:${h.box[2]}px;height:${h.box[3]}px"></i>` : '')).join('');
  const pages = Object.entries(PAGES).map(([id, p]) => `<div class="fl-pg" data-pg="${id}"><img src="${x.img(p.src)}" width="1470" height="${p.h}" alt="${x.esc(p.alt)}">${rings(id)}</div>`).join('');
  return `<div class="cc3-desk" style="transform: scale(${fit.toFixed(5)})">
          <div class="cc3-win">
            <div class="cc3-strip">
              <span class="cc3-lights"><i></i><i></i><i></i></span>
              <span class="cc3-tab cc3-t1"><i class="cc3-bg"></i><span class="cc3-fav">${sb}</span><span class="cc3-tt">${x.esc(SB_TITLE)}</span><span class="cc3-x">${ICON.x}</span></span>
              ${tabs}
              <span class="cc3-plus">${ICON.plus}</span>
            </div>
            <div class="cc3-bar">
              <span class="cc3-ic">${ICON.back}</span><span class="cc3-ic cc3-dim">${ICON.fwd}</span><span class="cc3-ic">${ICON.reload}</span>
              <span class="cc3-omni">
                <span class="cc3-url fl-u"><span class="cc3-ic">${ICON.tune}</span><span class="fl-ut"></span></span>
                <span class="cc3-url fl-e"><span class="cc3-ic">${ICON.search}</span><span class="fl-et"></span><i class="cc3-caret"></i><span class="cc3-ph">Search Google or type a URL</span></span>
              </span>
              <i class="cc3-me"></i><span class="cc3-ic">${ICON.more}</span>
            </div>
            <div class="fl-pages">${pages}</div>
          </div>
          ${S.clicks.map(() => '<i class="fl-ring"></i>').join('')}
          <svg class="cc3-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="${ARROW}"/></svg>
        </div>
        <i class="cc3-edge"><i class="cc3-soft"><i class="cc3-band"></i></i></i>
        <span class="cc3-pill">${sb}<span>superbot is controlling your computer</span></span>${hud.html(x, sb)}`;
}

// the nodes one view paints, looked up once; the heads-up layer binds its own (it may reach into the frame's header, so
// it gets the whole view: the card or the Expand panel) and hands back its painter
export function bindScreen(root, hud) {
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const t1 = $('.cc3-t1');
  return {
    t1, bg1: t1.querySelector('.cc3-bg'), plus: $('.cc3-plus'), cursor: $('.cc3-cursor'), omni: $('.cc3-omni'),
    tabs: $$('.fl-tab').map((n) => ({ n, bg: n.querySelector('.cc3-bg'), img: n.querySelector('.fl-fav img'), throb: n.querySelector('.fl-throb'), tt: n.querySelector('.fl-tt').children })),
    u: $('.fl-u'), ut: $('.fl-ut'), e: $('.fl-e'), et: $('.fl-et'), caret: $('.fl-e .cc3-caret'), ph: $('.fl-e .cc3-ph'),
    pages: Object.fromEntries($$('.fl-pg').map((n) => [n.dataset.pg, n])), hl: $$('.fl-hl').sort((a, b) => a.dataset.i - b.dataset.i), rings: $$('.fl-ring'),
    pics: $$('.fl-pg img'), edge: $('.cc3-edge'), soft: $('.cc3-soft'), pill: $('.cc3-pill'), hud: hud.bind(root),
    keys: null, last: { url: null, typed: null },
  };
}

// a cursor target in the desktop's px: a point, the new-tab button with n tabs open, or the tab at index i (0 is
// superbot.gg). Read off the first tab and the button, which never move, so the cursor stays where it clicked when a
// new tab pushes the button right, as a real one does
function spot(v, k) {
  if (k.at === 'plus') return { x: v.t1.offsetLeft + TAB_W * k.n + PLUS_GAP + PLUS / 2, y: v.plus.offsetTop + PLUS / 2 };
  if (k.at === 'tab') return { x: v.t1.offsetLeft + TAB_W * k.i + TAB_W / 2, y: v.t1.offsetTop + v.t1.offsetHeight / 2 };
  return k;
}

// one view at t
export function paintScreen(v, S, T, t) {
  // the takeover: the vignette fades in as its gradient turns slowly and gently breathes, the pill rises
  const g = outCubic(seg(t, T.take, T.take + 0.55));
  v.edge.style.opacity = g.toFixed(3);
  v.edge.style.setProperty('--cc3-a', `${((t * 60) % 360).toFixed(1)}deg`);
  v.soft.style.opacity = (0.9 + 0.08 * Math.sin(t * 2.6)).toFixed(3);
  const pi = outCubic(seg(t, T.take + 0.12, T.take + 0.57));
  v.pill.style.opacity = pi.toFixed(3);
  v.pill.style.transform = `translate(-50%, ${((1 - pi) * 8).toFixed(2)}px)`;

  // tabs: each slides in when superbot opens it, shows Chrome's throbber while its page loads, then its favicon and
  // title; the active one carries the white tab shape
  const act = current(S.active, t);
  const actF = outCubic(seg(t, act.cur[0], act.cur[0] + 0.15));
  const weight = (i) => (act.cur[1] === i ? actF : 0) + (act.prev && act.prev[1] === i ? 1 - actF : 0);
  v.bg1.style.opacity = weight(0).toFixed(3);
  S.tabs.forEach((tb, i) => {
    const n = v.tabs[i], o = outCubic(seg(t, tb.open, tb.open + 0.3));
    n.n.style.width = `${(TAB_W * o).toFixed(2)}px`;
    n.n.style.opacity = o.toFixed(3);
    n.bg.style.opacity = weight(i + 1).toFixed(3);
    const loading = t >= tb.load[0] && t < tb.load[1];
    n.throb.style.opacity = loading ? '1' : '0';
    n.throb.style.transform = `rotate(${((t * 720) % 360).toFixed(1)}deg)`;
    n.img.style.opacity = seg(t, tb.load[1], tb.load[1] + 0.1).toFixed(3);
    const tf = seg(t, tb.load[1], tb.load[1] + 0.12);
    n.tt[0].style.opacity = (1 - tf).toFixed(3);
    n.tt[1].style.opacity = tf.toFixed(3);
  });

  // the omnibox: the active page's address, or focused for typing (white, the blue ring) with the typed address and
  // its caret; the two cross over quickly, as the address bar does
  const om = current(S.omni, t, (e) => e.t);
  const of = outCubic(seg(t, om.cur.t, om.cur.t + 0.15));
  const editOf = (e) => (e && e.mode === 'edit' ? 1 : 0);
  const ed = lerp(editOf(om.prev), editOf(om.cur), of);
  v.u.style.opacity = (1 - ed).toFixed(3);
  v.e.style.opacity = ed.toFixed(3);
  v.omni.style.background = ed > 0 ? `rgb(${Math.round(lerp(241, 255, ed))},${Math.round(lerp(243, 255, ed))},${Math.round(lerp(244, 255, ed))})` : '';
  v.omni.style.boxShadow = ed > 0 ? `inset 0 0 0 2px rgba(26,115,232,${(0.9 * ed).toFixed(3)})` : '';
  const url = (om.cur.mode === 'url' ? om.cur : om.prev && om.prev.mode === 'url' ? om.prev : S.omni[0]).text;
  if (url !== v.last.url) { v.ut.textContent = url; v.last.url = url; }
  const e = om.cur.mode === 'edit' ? om.cur : om.prev && om.prev.mode === 'edit' ? om.prev : null;
  const typed = e ? e.text.slice(0, Math.round(e.text.length * seg(t, e.a, e.b))) : '';
  if (typed !== v.last.typed) { v.et.textContent = typed; v.ph.style.display = typed ? 'none' : ''; v.last.typed = typed; }
  v.caret.style.opacity = e && t >= e.b && !blink(t - e.b) ? '0' : '1';

  // the pages: the one the active tab shows, crossing over from the last quickly, as a tab switch or a page's first
  // paint does, each at its own scroll
  const pg = current(S.pages, t);
  const pf = outCubic(seg(t, pg.cur[0], pg.cur[0] + 0.18));
  for (const [id, n] of Object.entries(v.pages)) {
    const o = id === pg.cur[1] ? pf : pg.prev && id === pg.prev[1] ? 1 - pf : 0;
    n.style.opacity = o.toFixed(3);
    n.style.visibility = o > 0 ? '' : 'hidden';
    n.style.transform = `translateY(${(-scrollAt(S.scroll[id], t)).toFixed(2)}px)`;
  }
  // the fare superbot reads, ringed on the page in the overlay's pink as it lands, gone when superbot moves on
  S.hl.forEach((h, i) => {
    const on = outCubic(seg(t, h.on, h.on + 0.3)) * (1 - seg(t, h.off, h.off + 0.2));
    v.hl[i].style.opacity = on.toFixed(3);
    v.hl[i].style.transform = `scale(${lerp(1.12, 1, outCubic(seg(t, h.on, h.on + 0.3))).toFixed(4)})`;
  });

  // the cursor, in the desktop's px: a glide per move, held between them; resolved once the layout is there
  if (!v.keys) {
    v.keys = [{ t: -1, ...S.rest }];
    for (const [a, b, k] of S.moves) {
      v.keys.push({ t: a, x: v.keys[v.keys.length - 1].x, y: v.keys[v.keys.length - 1].y });
      v.keys.push({ t: b, ...spot(v, k) });
    }
  }
  const at = path(t, v.keys);
  v.cursor.style.transform = `translate(${(at.x - TIP.x).toFixed(2)}px, ${(at.y - TIP.y).toFixed(2)}px)`;
  // each click rings out from where the cursor clicked, as the overlay marks superbot's clicks
  S.clicks.forEach((c, i) => {
    const r = v.rings[i], k = seg(t, c, c + 0.45), p = path(c, v.keys);
    r.style.opacity = (k > 0 && k < 1 ? 0.85 * (1 - k) : 0).toFixed(3);
    r.style.transform = `translate(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px) scale(${lerp(0.3, 1.5, outCubic(k)).toFixed(3)})`;
  });
  // the new-tab button's hover circle comes up under the cursor and darkens on each press, gone once its tab is in
  let h = 0, pr = 0;
  S.tabs.forEach((tb) => {
    const c = tb.open - 0.08;
    h = Math.max(h, seg(t, c - 0.25, c - 0.1) * (1 - seg(t, tb.open, tb.open + 0.2)));
    pr = Math.max(pr, press(t, c));
  });
  v.plus.style.background = `rgba(60,64,67,${(0.1 * h + 0.1 * pr).toFixed(3)})`;

  v.hud(T, t);
}

// every capture a frozen frame waits on
export const pictures = (v) => v.pics;
