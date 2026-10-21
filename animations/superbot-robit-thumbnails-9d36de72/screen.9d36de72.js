// The live view: a true screen share, as the computer-control-v3-soft variant draws it (gemini-muse-meme-superbot-
// 6fbc38f8/scenes/tabs-assets/beats/computer.ba3976b6.js). A 1470x919 desktop with Chrome full screen on it at Chrome's
// own sizes, scaled whole into the view, so tab strip, pages and cursor keep their real proportions. The pages are real
// captures (pages.9d36de72.js). Over the screen, only the takeover overlay: the vignette and its Stop button. Everything
// is painted from t by paint(), so a frozen frame holds.
import { seg, lerp, outCubic, inOutCubic, caretOn, countAt, lastAt, REDUCED } from './lib.9d36de72.js?v=9';
import { TABS, GAME, HUB, hubSrc, HUB_TOP, HUB_LEFT, HUB_H } from './pages.9d36de72.js?v=9';

export const DESK = { w: 1470, h: 919 };
const TAB_W = 240, PLUS_GAP = 8, PLUS = 28;
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

const tabHTML = (i) => `<span class="cc-tab" data-tab="${i}"><i class="cc-tbg"></i><span class="cc-fav"><img src="${TABS[i].fav}" alt="" width="16" height="16"><i class="cc-spin"></i></span><span class="cc-tt">New Tab</span><span class="cc-x">${IC.x}</span></span>`;

export function buildScreen(root) {
  root.innerHTML = `<div class="cc-desk">
      <div class="cc-win">
        <div class="cc-strip">
          <span class="cc-lights"><i></i><i></i><i></i></span>
          <span class="cc-tabs">${TABS.map((_, i) => tabHTML(i)).join('')}</span>
          <span class="cc-plus">${IC.plus}</span>
        </div>
        <div class="cc-bar">
          <span class="cc-ic">${IC.back}</span><span class="cc-ic cc-dim">${IC.fwd}</span><span class="cc-ic cc-reload">${IC.reload}${IC.x}</span>
          <span class="cc-omni">
            <span class="cc-url cc-u-ph"><span class="cc-ic">${IC.search}</span><i class="cc-caret"></i><span class="cc-ph">Search Google or type a URL</span></span>
            <span class="cc-url cc-u-type"><span class="cc-ic">${IC.search}</span><span class="cc-typed"></span><i class="cc-caret"></i></span>
            <span class="cc-url cc-u-url"><span class="cc-ic">${IC.tune}</span><span class="cc-addr"><span class="cc-host"></span><span class="cc-path"></span></span></span>
          </span>
          <i class="cc-me"></i><span class="cc-ic">${IC.more}</span>
        </div>
        <div class="cc-pages">
          <img class="cc-page cc-ntp" src="img/new-tab.png" width="1470" height="839" alt="Chrome New Tab page">
          <img class="cc-page cc-game" src="${GAME}" width="1470" height="837" alt="ROB IT on roblox.com">
          <div class="cc-page cc-hub">
            <img class="cc-hub-base" src="${hubSrc(HUB[0])}" width="1470" height="${HUB_H}" alt="ROB IT's Thumbnails page in Creator Hub">
            <div class="cc-hub-col" style="left:${HUB_LEFT}px;top:${HUB_TOP}px"><img class="cc-hub-scroll" src="${hubSrc(HUB[0])}" width="1470" height="${HUB_H}" alt=""></div>
          </div>
          <div class="cc-page cc-blank"></div>
        </div>
      </div>
      <svg class="cc-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="${ARROW}"/></svg>
    </div>
    <i class="cc-edge"><i class="cc-soft"><i class="cc-band"></i></i></i>
    <span class="cc-stop"><i></i>Stop</span>`;
  // every state's capture, decoded up front so a swap never shows a blank frame
  const preload = HUB.map((st) => { const im = new Image(); im.src = hubSrc(st); return im; });
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  return {
    root, desk: $('.cc-desk'), tabs: $$('.cc-tab'), plus: $('.cc-plus'), reload: $('.cc-reload'), omni: $('.cc-omni'),
    uPh: $('.cc-u-ph'), uType: $('.cc-u-type'), uUrl: $('.cc-u-url'), typed: $('.cc-typed'), host: $('.cc-host'), path: $('.cc-path'),
    carets: $$('.cc-caret'), ntp: $('.cc-ntp'), game: $('.cc-game'), hub: $('.cc-hub'), hubBase: $('.cc-hub-base'), hubScroll: $('.cc-hub-scroll'),
    blank: $('.cc-blank'), cursor: $('.cc-cursor'), edge: $('.cc-edge'), soft: $('.cc-soft'), stop: $('.cc-stop'),
    preload, targets: null, shownTyped: null, shownState: HUB[0],
  };
}

// fit the desktop into the view's width
export function fit(v) {
  const k = v.root.clientWidth / DESK.w;
  v.desk.style.transform = `scale(${k.toFixed(5)})`;
}

// Chrome's own controls the cursor goes to, in the desktop's px, read off the laid-out bar once
export function measure(v) {
  const d = v.desk.getBoundingClientRect();
  const k = d.width / DESK.w;
  const at = (node, fx = 0.5, fy = 0.5) => { const r = node.getBoundingClientRect(); return { x: (r.left - d.left + r.width * fx) / k, y: (r.top - d.top + r.height * fy) / k }; };
  const tab0 = at(v.tabs[0], 0, 0.5);
  const T = { omni: { x: at(v.omni, 0, 0.5).x + 220, y: at(v.omni).y }, reload: at(v.reload) };
  TABS.forEach((_, i) => {
    T[`plus:${i}`] = { x: tab0.x + i * TAB_W + PLUS_GAP + PLUS / 2, y: at(v.plus).y };
    T[`tab:${i}`] = { x: tab0.x + i * TAB_W + 104, y: tab0.y };
  });
  v.targets = T;
}

export const decodeAll = (v) => Promise.all([...v.preload, v.game, v.ntp].map((im) => im.decode().catch((e) => console.error(new Error(`capture failed to decode: ${im.src}`, { cause: e })))));

function cursorAt(S, T, t) {
  let from = REST;
  for (const m of S.moves) {
    if (m.t0 > t) break;
    const to = typeof m.to === 'string' ? T[m.to] : m.to;
    if (t < m.t1) { const k = inOutCubic(seg(t, m.t0, m.t1)); return { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k) }; }
    from = to;
  }
  return from;
}
function scrollAt(list, t) {
  const s = lastAt(list, t, 't0');
  return s ? lerp(s.from, s.to, inOutCubic(seg(t, s.t0, s.t1))) : 0;
}

export function paint(v, S, t) {
  // the takeover: the vignette fades in as its gradient turns slowly and gently breathes (held still for reduced
  // motion), and the overlay's Stop button rises in with it, bottom left over the screen
  v.edge.style.opacity = outCubic(seg(t, S.control, S.control + 0.55)).toFixed(3);
  v.edge.style.setProperty('--cc-a', `${REDUCED ? 0 : ((t * 60) % 360).toFixed(1)}deg`);
  v.soft.style.opacity = REDUCED ? '0.9' : (0.9 + 0.08 * Math.sin(t * 2.6)).toFixed(3);
  const st = outCubic(seg(t, S.control + 0.12, S.control + 0.57));
  v.stop.style.opacity = st.toFixed(3);
  v.stop.style.transform = `translateY(${REDUCED ? 0 : ((1 - st) * 8).toFixed(2)}px)`;

  const active = lastAt(S.active, t).tab;
  const viewOf = (i) => lastAt(S.views[i], t) || { v: 'ntp' };

  // tabs: a new one grows in from the + button; the active one wears the white; a loading one spins
  v.tabs.forEach((tab, i) => {
    const spec = S.tabs[i];
    const o = spec ? outCubic(seg(t, spec.openAt, spec.openAt + 0.3)) : 0;
    tab.style.width = `${(TAB_W * o).toFixed(2)}px`;
    tab.style.opacity = o.toFixed(3);
    tab.classList.toggle('is-on', i === active);
    const state = o > 0 ? viewOf(i).v : 'ntp';
    tab.dataset.state = state;
    const title = state === 'page' ? TABS[i].title : state === 'load' ? TABS[i].host + TABS[i].path : 'New Tab';
    const tt = tab.querySelector('.cc-tt');
    if (tt.textContent !== title) tt.textContent = title;
    tab.querySelector('.cc-spin').style.transform = `rotate(${((t * 540) % 360).toFixed(1)}deg)`;
  });

  // the page under the active tab: New Tab, blank while loading, the game page or Creator Hub
  const av = viewOf(active);
  v.ntp.style.visibility = av.v === 'ntp' ? 'visible' : 'hidden';
  v.blank.style.visibility = av.v === 'load' ? 'visible' : 'hidden';
  v.game.style.visibility = active === 0 && av.v === 'page' ? 'visible' : 'hidden';
  v.hub.style.visibility = active === 1 && av.v === 'page' ? 'visible' : 'hidden';
  v.reload.classList.toggle('is-load', av.v === 'load');
  const hs = lastAt(S.hub, t);
  const state = hs ? hs.state : HUB[0];
  if (state !== v.shownState) { v.hubBase.src = hubSrc(state); v.hubScroll.src = hubSrc(state); v.shownState = state; }
  v.hubScroll.style.transform = `translate(${-HUB_LEFT}px, ${(-HUB_TOP - scrollAt(S.hubScroll, t)).toFixed(2)}px)`;

  // the address bar: focused with its placeholder, being typed into, or showing the page's address
  const om = lastAt(S.omni, t);
  const mode = om.mode === 'url' && viewOf(om.tab).v === 'ntp' ? 'ph' : om.mode;
  v.uPh.style.opacity = mode === 'ph' ? '1' : '0';
  v.uType.style.opacity = mode === 'type' ? '1' : '0';
  v.uUrl.style.opacity = mode === 'url' ? '1' : '0';
  v.omni.classList.toggle('is-focus', mode !== 'url');
  if (mode === 'type') {
    const typed = om.text.slice(0, countAt(om.text, om.start, om.cps, t));
    if (typed !== v.shownTyped) { v.typed.textContent = typed; v.shownTyped = typed; }
  }
  if (mode === 'url') {
    const tab = TABS[om.tab];
    if (v.host.textContent !== tab.host) { v.host.textContent = tab.host; v.path.textContent = tab.path; }
  }
  const typing = mode === 'type' && t < om.start + om.text.length / om.cps;
  const blinkOn = typing || caretOn(t - om.at);
  v.carets.forEach((c) => { c.style.opacity = blinkOn ? '1' : '0'; });

  // the screen's own cursor
  const p = cursorAt(S, v.targets, t);
  v.cursor.style.transform = `translate(${(p.x - TIP.x).toFixed(2)}px, ${(p.y - TIP.y).toFixed(2)}px)`;
}
