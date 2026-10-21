// The live view: the user's 1470x919 desktop with Chrome full screen on it, scaled whole into the sidebar's card (the
// computer-control-v3-soft variant's screen share, computer.ba3976b6.js). Chrome opens on a New Tab page; once superbot
// has control it visits each ticket site in that tab, typing the event's address, picking 2 tickets or checking the
// sort, and resting the screen's own cursor on the cheapest listing. Over it only the takeover's vignette.
import { seg, lerp, outCubic, inOutCubic, esc } from './lib.d35be136.js';
import { SITES, NEW_TAB, VISITS, TAKE } from './timeline.d35be136.js';

const DESK = { w: 1470, h: 919 };
const PAGE_TOP = 82; // Chrome's tab strip and toolbar, in desktop px
const OMNI = { x: 560, y: 62 }; // where the cursor clicks the address bar
const REST = { x: 1010, y: 640 }; // where the cursor sits until superbot moves it
const TIP = { x: 4, y: 2.5 }; // the arrow's hotspot in its 24px box
const TYPE_CPS = 80;
const SB_TITLE = 'the AI plans you pay for, in one app'; // superbot.gg's title, the tab superbot was asked from
const ARROW = 'M4 2.5 4 19.5 8.6 15.3 11.5 21.8 14.4 20.5 11.6 14.2 17.8 14.2Z';
export const SB_MARK = '<span class="sb-tile"><i class="sbm sbm-c"></i><i class="sbm sbm-m"></i><i class="sbm sbm-w"></i></span>';
// Chrome's glyphs (computer.ba3976b6.js ICON)
const CHROME = {
  x: '<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>',
  plus: '<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',
  back: '<svg viewBox="0 0 16 16"><path d="M13 8H3M7 4L3 8l4 4"/></svg>',
  fwd: '<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  reload: '<svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 3v3h-3"/></svg>',
  tune: '<svg viewBox="0 0 16 16"><path d="M3 5h5.5M12.5 5H13M3 11h.5M7.5 11H13"/><circle cx="10.5" cy="5" r="1.6"/><circle cx="5.5" cy="11" r="1.6"/></svg>',
  search: '<svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>',
  more: '<svg viewBox="0 0 16 16"><path d="M8 3.5h.01M8 8h.01M8 12.5h.01"/></svg>',
};

// the cursor's glides; it waits at REST until the first
const MOVES = VISITS.flatMap((V) => [
  { t0: V.s, t1: V.s + 0.45, to: OMNI },
  { t0: V.toCtl, t1: V.atCtl, to: onPage(V.site.qty ? V.site.qty.at : V.site.sort) },
  { t0: V.toPrice, t1: V.atPrice, to: onPage(V.site.price) },
]);
function onPage(p) { return { x: p.x, y: p.y + PAGE_TOP }; }
function cursorAt(t) {
  let from = REST;
  for (const m of MOVES) {
    if (t < m.t0) return from;
    if (t < m.t1) {
      const k = inOutCubic(seg(t, m.t0, m.t1));
      return { x: lerp(from.x, m.to.x, k), y: lerp(from.y, m.to.y, k) };
    }
    from = m.to;
  }
  return from;
}

// which page and tab are on screen, and what the address bar holds
function screenAt(t) {
  const k = VISITS.findLastIndex((V) => t >= V.s);
  if (k < 0) return { page: NEW_TAB.page, tab: NEW_TAB, omni: { ph: true } };
  const V = VISITS[k], site = V.site, prev = k ? VISITS[k - 1].site : NEW_TAB;
  const shown = t < V.load ? prev : site;
  const page = t < V.load ? prev.page : site.qty && t < V.pick + 0.1 ? site.qty.page : site.page;
  const was = prev.url ? { text: prev.url } : { ph: true };
  let omni;
  if (t < V.click) omni = was;
  else if (t < V.type) omni = { ...was, focus: true, sel: !!prev.url, caret: !prev.url };
  else if (t < V.enter) {
    const n = Math.min(site.url.length, Math.floor((t - V.type) * TYPE_CPS));
    omni = { focus: true, text: site.url.slice(0, n), caret: n < site.url.length || Math.floor((t - V.type) / 0.53) % 2 === 0 };
  } else omni = { text: site.url };
  return { page, tab: shown, omni };
}

export function buildScreen(view) {
  const pages = [NEW_TAB.page, ...new Set(SITES.flatMap((s) => (s.qty ? [s.qty.page, s.page] : [s.page])))];
  view.innerHTML = `
    <div class="cc-desk">
      <div class="cc-win">
        <div class="cc-strip">
          <span class="cc-lights"><i></i><i></i><i></i></span>
          <span class="cc-tab"><span class="cc-fav">${SB_MARK}</span><span class="cc-tt">${esc(SB_TITLE)}</span><span class="cc-x">${CHROME.x}</span></span>
          <span class="cc-tab is-on"><span class="cc-fav cc-site-fav"><img alt="" width="16" height="16"></span><span class="cc-tt cc-site-tt"></span><span class="cc-x">${CHROME.x}</span></span>
          <span class="cc-plus">${CHROME.plus}</span>
        </div>
        <div class="cc-bar">
          <span class="cc-ic">${CHROME.back}</span><span class="cc-ic cc-dim">${CHROME.fwd}</span><span class="cc-ic">${CHROME.reload}</span>
          <span class="cc-omni"><span class="cc-ic cc-i-tune">${CHROME.tune}</span><span class="cc-ic cc-i-search">${CHROME.search}</span><span class="cc-url"></span><i class="cc-caret"></i><span class="cc-ph">Search Google or type a URL</span></span>
          <i class="cc-me"></i><span class="cc-ic">${CHROME.more}</span>
        </div>
        ${pages.map((p) => `<img class="cc-page" data-page="${p}" src="img/${p}.webp" width="1470" height="839" alt="">`).join('')}
      </div>
      <svg class="cc-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="${ARROW}"/></svg>
    </div>
    <i class="cc-edge"><i class="cc-soft"><i class="cc-band"></i></i></i>`;
  const $ = (s) => view.querySelector(s);
  return {
    view, desk: $('.cc-desk'), cursor: $('.cc-cursor'), favWrap: $('.cc-site-fav'), fav: $('.cc-site-fav img'), tt: $('.cc-site-tt'),
    omni: $('.cc-omni'), url: $('.cc-url'), caret: $('.cc-caret'), ph: $('.cc-ph'), edge: $('.cc-edge'), soft: $('.cc-soft'),
    pages: Object.fromEntries([...view.querySelectorAll('.cc-page')].map((img) => [img.dataset.page, img])),
    favs: SITES.map((s) => Object.assign(new Image(), { src: `img/${s.fav}` })), shown: {},
  };
}

// the desktop scales whole to the view's width; the view takes the desktop's shape
export function fitScreen(v) {
  const k = v.view.clientWidth / DESK.w;
  v.desk.style.transform = `scale(${k.toFixed(5)})`;
  v.view.style.height = `${(DESK.h * k).toFixed(2)}px`;
}

export function paintScreen(v, t) {
  // the takeover: the vignette fades in as its gradient turns and gently breathes
  const g = outCubic(seg(t, TAKE, TAKE + 0.55));
  v.edge.style.opacity = g.toFixed(3);
  v.edge.style.setProperty('--cc-a', `${((t * 60) % 360).toFixed(1)}deg`);
  v.soft.style.opacity = (0.9 + 0.08 * Math.sin(t * 2.6)).toFixed(3);

  const sc = screenAt(t);
  if (v.shown.page !== sc.page) {
    if (v.shown.page) v.pages[v.shown.page].classList.remove('is-on');
    v.pages[sc.page].classList.add('is-on');
    v.shown.page = sc.page;
  }
  if (v.shown.tab !== sc.tab) {
    v.favWrap.style.visibility = sc.tab.fav ? 'visible' : 'hidden';
    if (sc.tab.fav) v.fav.src = `img/${sc.tab.fav}`;
    v.tt.textContent = sc.tab.title;
    v.shown.tab = sc.tab;
  }
  const o = sc.omni, text = o.text || '';
  if (v.shown.text !== text) { v.url.textContent = text; v.shown.text = text; }
  v.omni.classList.toggle('is-focus', !!o.focus);
  v.url.classList.toggle('is-sel', !!o.sel);
  v.ph.style.display = o.ph ? '' : 'none';
  v.caret.style.visibility = o.focus && o.caret ? 'visible' : 'hidden';

  const at = cursorAt(t);
  v.cursor.style.transform = `translate(${(at.x - TIP.x).toFixed(2)}px, ${(at.y - TIP.y).toFixed(2)}px)`;
}
