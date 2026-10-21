// The live view: a true screen share, as the computer-control-v3-soft variant draws it (gemini-muse-meme-superbot-
// 6fbc38f8/scenes/tabs-assets/beats/computer.ba3976b6.js). A 1470x919 desktop with Chrome full screen on it at Chrome's
// own sizes, scaled whole into the view, so tab strip, pages and cursor keep their real proportions. Over it, only the
// takeover's vignette. Everything is painted from t by paint(), so a frozen frame holds.
import { seg, lerp, outCubic, inOutCubic, caretOn, countAt, lastAt, REDUCED } from './lib.af4c3c6b.js';
import { SITES, fav, pageHTML, rowsHTML, cheapest } from './sites.af4c3c6b.js';

export const DESK = { w: 1470, h: 919 };
const TAB_W = 240, PLUS_GAP = 8, PLUS = 28;
const URL_CPS = 34;
const TIP = { x: 4, y: 2.5 }; // the arrow's hotspot in its 24px box
const REST = { x: 1010, y: 640 }; // where the cursor sits before superbot moves it
const ARROW = 'M4 2.5 4 19.5 8.6 15.3 11.5 21.8 14.4 20.5 11.6 14.2 17.8 14.2Z';
const IC = {
  x: '<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>',
  plus: '<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',
  back: '<svg viewBox="0 0 16 16"><path d="M13 8H3M7 4L3 8l4 4"/></svg>',
  fwd: '<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  reload: '<svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 3v3h-3"/></svg>',
  tune: '<svg viewBox="0 0 16 16"><path d="M3 5h5.5M12.5 5H13M3 11h.5M7.5 11H13"/><circle cx="10.5" cy="5" r="1.6"/><circle cx="5.5" cy="11" r="1.6"/></svg>',
  search: '<svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>',
  more: '<svg viewBox="0 0 16 16"><path d="M8 3.5h.01M8 8h.01M8 12.5h.01"/></svg>',
};

function tabHTML(i) {
  return `<span class="cc-tab" data-tab="${i}"><i class="cc-tbg"></i><span class="cc-fav"><img src="${fav(SITES[i].id)}" alt="" width="16" height="16"><i class="cc-spin"></i></span><span class="cc-tt">New Tab</span><span class="cc-x">${IC.x}</span></span>`;
}

export function buildScreen(root) {
  root.innerHTML = `<div class="cc-desk">
      <div class="cc-win">
        <div class="cc-strip">
          <span class="cc-lights"><i></i><i></i><i></i></span>
          <span class="cc-tabs">${SITES.map((_, i) => tabHTML(i)).join('')}</span>
          <span class="cc-plus">${IC.plus}</span>
        </div>
        <div class="cc-bar">
          <span class="cc-ic">${IC.back}</span><span class="cc-ic cc-dim">${IC.fwd}</span><span class="cc-ic cc-reload">${IC.reload}${IC.x}</span>
          <span class="cc-omni">
            <span class="cc-url cc-u-ph"><span class="cc-ic">${IC.search}</span><i class="cc-caret"></i><span class="cc-ph">Search Google or type a URL</span></span>
            <span class="cc-url cc-u-type"><span class="cc-ic">${IC.search}</span><span class="cc-typed"></span><i class="cc-caret"></i></span>
            <span class="cc-url cc-u-url"><span class="cc-ic">${IC.tune}</span><span><span class="cc-host"></span><span class="cc-path"></span></span></span>
          </span>
          <i class="cc-me"></i><span class="cc-ic">${IC.more}</span>
        </div>
        <div class="cc-pages">
          <img class="cc-page cc-ntp" src="img/new-tab.png" width="1470" height="839" alt="Chrome New Tab page">
          ${SITES.map((_, i) => `<div class="cc-page cc-site">${pageHTML(i)}</div>`).join('')}
          <div class="cc-page cc-blank"></div>
        </div>
      </div>
      <svg class="cc-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="${ARROW}"/></svg>
    </div>
    <i class="cc-edge"><i class="cc-soft"><i class="cc-band"></i></i></i>`;
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  const sites = $$('.cc-site').map((wrap) => ({
    wrap, list: wrap.querySelector('.st-list'), sortV: wrap.querySelector('.st-sort-v'), menu: wrap.querySelector('.st-menu'),
    secs: [...wrap.querySelectorAll('.st-map [data-sec]')], key: '', hoverSec: null,
  }));
  return {
    root, desk: $('.cc-desk'), tabs: $$('.cc-tab'), plus: $('.cc-plus'), reload: $('.cc-reload'), omni: $('.cc-omni'),
    uPh: $('.cc-u-ph'), uType: $('.cc-u-type'), uUrl: $('.cc-u-url'), typed: $('.cc-typed'), host: $('.cc-host'), path: $('.cc-path'),
    carets: $$('.cc-caret'), ntp: $('.cc-ntp'), blank: $('.cc-blank'), sites, cursor: $('.cc-cursor'), edge: $('.cc-edge'), soft: $('.cc-soft'),
    targets: null, shownTyped: null,
  };
}

// fit the desktop into the view's width
export function fit(v) {
  const k = v.root.clientWidth / DESK.w;
  v.desk.style.transform = `scale(${k.toFixed(5)})`;
}

// every spot the cursor goes to, in the desktop's own px, read off the laid-out page once (fonts loaded, lists filled)
export function measure(v) {
  const d = v.desk.getBoundingClientRect();
  const k = d.width / DESK.w;
  const at = (node, fx = 0.5, fy = 0.5) => { const r = node.getBoundingClientRect(); return { x: (r.left - d.left + r.width * fx) / k, y: (r.top - d.top + r.height * fy) / k }; };
  const tab0 = at(v.tabs[0], 0, 0.5);
  const T = { omni: { x: at(v.omni, 0, 0.5).x + 220, y: at(v.omni).y }, reload: at(v.reload) };
  SITES.forEach((_, i) => {
    T[`plus:${i}`] = { x: tab0.x + i * TAB_W + PLUS_GAP + PLUS / 2, y: at(v.plus).y };
    T[`tab:${i}`] = { x: tab0.x + i * TAB_W + 104, y: tab0.y };
    const s = v.sites[i];
    T[`list:${i}`] = at(s.wrap.querySelector('.st-listwrap'), 0.62, 0.45);
    T[`sort:${i}`] = at(s.wrap.querySelector('.st-sort-v'), 0.5, 0.55);
    T[`opt:${i}`] = at(s.wrap.querySelector('.st-opt-low'), 0.35, 0.55);
    T[`row:${i}`] = at(s.wrap.querySelector('.st-row'), 0.56, 0.5);
  });
  v.targets = T;
}

function cursorAt(S, T, t) {
  let from = REST;
  for (const m of S.moves) {
    if (m.t0 > t) break;
    const to = T[m.to];
    if (t < m.t1) { const k = inOutCubic(seg(t, m.t0, m.t1)); return { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k) }; }
    from = to;
  }
  return from;
}

function scrollAt(list, t) {
  const s = lastAt(list, t, 't0');
  return s ? lerp(s.from, s.to, outCubic(seg(t, s.t0, s.t1))) : 0;
}

export function paint(v, S, t) {
  // the takeover: the vignette fades in as its gradient turns slowly and gently breathes (held still for reduced motion)
  v.edge.style.opacity = outCubic(seg(t, S.control, S.control + 0.55)).toFixed(3);
  v.edge.style.setProperty('--cc-a', `${REDUCED ? 0 : ((t * 60) % 360).toFixed(1)}deg`);
  v.soft.style.opacity = REDUCED ? '0.9' : (0.9 + 0.08 * Math.sin(t * 2.6)).toFixed(3);

  const active = lastAt(S.active, t).tab;
  const viewOf = (i) => lastAt(S.views[i], t);

  // tabs: a new one grows in from the + button; the active one wears the white
  v.tabs.forEach((tab, i) => {
    const spec = S.tabs[i];
    const o = spec ? outCubic(seg(t, spec.openAt, spec.openAt + 0.3)) : 0;
    tab.style.width = `${(TAB_W * o).toFixed(2)}px`;
    tab.style.opacity = o.toFixed(3);
    tab.classList.toggle('is-on', i === active);
    const vw = o > 0 ? viewOf(i) : null;
    const state = vw ? vw.v : 'ntp';
    tab.dataset.state = state;
    const title = state === 'page' ? `${SITES[i].name}: Velvet Static Tickets` : state === 'load' ? SITES[i].host + SITES[i].path : 'New Tab';
    const tt = tab.querySelector('.cc-tt');
    if (tt.textContent !== title) tt.textContent = title;
    tab.querySelector('.cc-spin').style.transform = `rotate(${((t * 540) % 360).toFixed(1)}deg)`;
  });
  // the page under the active tab
  const av = viewOf(active);
  v.ntp.style.visibility = av.v === 'ntp' ? 'visible' : 'hidden';
  v.blank.style.visibility = av.v === 'load' ? 'visible' : 'hidden';
  v.reload.classList.toggle('is-load', av.v === 'load');
  v.sites.forEach((s, i) => {
    const vw = viewOf(i);
    const on = i === active && vw && vw.v === 'page';
    s.wrap.style.visibility = on ? 'visible' : 'hidden';
    if (!vw || vw.v !== 'page') return;
    const key = `${vw.round}:${vw.sorted}`;
    if (s.key !== key) {
      s.key = key;
      s.list.innerHTML = rowsHTML(i, vw.round, vw.sorted);
      s.sortV.textContent = vw.sorted ? SITES[i].sortLow : SITES[i].sortDefault;
      const has = new Set([...s.list.querySelectorAll('.st-row')].map((r) => r.dataset.sec));
      s.secs.forEach((p) => p.classList.toggle('has', has.has(p.dataset.sec)));
    }
    s.list.style.transform = `translateY(${(-scrollAt(S.scrolls[i], t)).toFixed(2)}px)`;
    const menu = S.menus.find((m) => m.tab === i && t >= m.t0 && t < m.t1);
    s.menu.style.visibility = menu ? 'visible' : 'hidden';
    s.menu.style.opacity = menu ? outCubic(seg(t, menu.t0, menu.t0 + 0.12)).toFixed(3) : '0';
    s.menu.querySelector('.st-opt-low').classList.toggle('is-hover', !!menu && t >= menu.t0 + 0.38);
    const hover = S.hovers.some((h) => h.tab === i && t >= h.t0 && t < h.t1);
    const first = s.list.firstElementChild;
    first.classList.toggle('is-hover', hover);
    const sec = hover ? String(cheapest(SITES[i], vw.round).s) : null;
    if (sec !== s.hoverSec) { s.hoverSec = sec; s.secs.forEach((p) => p.classList.toggle('on', p.dataset.sec === sec)); }
  });

  // the address bar: focused with its placeholder, being typed into, or showing the page's address
  const om = lastAt(S.omni, t);
  const mode = om.mode === 'url' && viewOf(om.tab).v === 'ntp' ? 'ph' : om.mode;
  v.uPh.style.opacity = mode === 'ph' ? '1' : '0';
  v.uType.style.opacity = mode === 'type' ? '1' : '0';
  v.uUrl.style.opacity = mode === 'url' ? '1' : '0';
  v.omni.classList.toggle('is-focus', mode !== 'url');
  if (mode === 'type') {
    const typed = om.text.slice(0, countAt(om.text, om.start, URL_CPS, t));
    if (typed !== v.shownTyped) { v.typed.textContent = typed; v.shownTyped = typed; }
  }
  if (mode === 'url') {
    const site = SITES[om.tab];
    if (v.host.textContent !== site.host) { v.host.textContent = site.host; v.path.textContent = site.path; }
  }
  const typing = mode === 'type' && t < om.start + om.text.length / URL_CPS;
  const blinkOn = typing || caretOn(t - om.at);
  v.carets.forEach((c) => { c.style.opacity = blinkOn ? '1' : '0'; });

  // the screen's own cursor
  const p = cursorAt(S, v.targets, t);
  v.cursor.style.transform = `translate(${(p.x - TIP.x).toFixed(2)}px, ${(p.y - TIP.y).toFixed(2)}px)`;
}

// fill every page's list once so measure() has rows to read; paint() redraws them from the schedule after
export function primeLists(v) {
  v.sites.forEach((s, i) => { s.list.innerHTML = rowsHTML(i, 0, true); s.key = ''; });
}
