// The live view: the user's 1470x919 desktop with Chrome full screen on it, scaled whole into the side panel (the
// computer-control-v3-soft variant's screen share, computer.ba3976b6.js). Chrome is on ROB IT's game page; once
// superbot has control it types the Creator Hub Thumbnails address, reads the performance table, scrolls to the play-
// through rates, then opens the edit view, uploads a new take, unchecks the lowest performer, checks the new one and
// saves. Every page is a real capture (img/CREDITS.txt); a scroll is a short crossfade between two captures of the same
// page, and the agent's changes are real pixels laid over the edit view (timeline.d35be136.js MARKS). Over it only
// the takeover's vignette and, in the view's bottom right corner, the user's controls: Take control and Stop.
import { seg, lerp, outCubic, inOutCubic, esc, glyph } from './lib.d35be136.js';
import { GAME, HUB, NAV, URL_CPS, PAGES, MOVES, MARKS, TAKE } from './timeline.d35be136.js';

const DESK = { w: 1470, h: 919 };
const PAGE_TOP = 82; // Chrome's tab strip and toolbar, in desktop px
const OMNI = { x: 560, y: 62 }; // where the cursor clicks the address bar
const REST = { x: 1010, y: 640 }; // where the cursor sits until superbot moves it
const TIP = { x: 4, y: 2.5 }; // the arrow's hotspot in its 24px box
const SB_TITLE = 'the AI plans you pay for, in one app'; // superbot.gg's title, a tab the user has open
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

const onPage = (p) => ({ x: p.x, y: p.y + PAGE_TOP });
const at = (to) => (to === 'omni' ? OMNI : onPage(to));
function cursorAt(t) {
  let from = REST;
  for (const m of MOVES) {
    if (t < m.t0) return from;
    const to = at(m.to);
    if (t < m.t1) {
      const k = inOutCubic(seg(t, m.t0, m.t1));
      return { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k) };
    }
    from = to;
  }
  return from;
}

// the address bar: the game page's address until superbot clicks it, the Creator Hub address typing in, then shown
function omniAt(t) {
  if (t < NAV.click) return { text: GAME.url };
  if (t < NAV.type) return { focus: true, text: GAME.url, sel: true };
  if (t < NAV.enter) {
    const n = Math.min(HUB.url.length, Math.floor((t - NAV.type) * URL_CPS));
    return { focus: true, text: HUB.url.slice(0, n), caret: n < HUB.url.length || Math.floor((t - NAV.type) / 0.53) % 2 === 0 };
  }
  return { text: HUB.url };
}

export function buildScreen(view) {
  const pages = [...new Set(PAGES.map((p) => p.page))];
  view.innerHTML = `
    <div class="cc-desk">
      <div class="cc-win">
        <div class="cc-strip">
          <span class="cc-lights"><i></i><i></i><i></i></span>
          <span class="cc-tab"><span class="cc-fav">${SB_MARK}</span><span class="cc-tt">${esc(SB_TITLE)}</span><span class="cc-x">${CHROME.x}</span></span>
          <span class="cc-tab is-on"><span class="cc-fav"><img src="img/logo-roblox.svg" alt="" width="16" height="16"></span><span class="cc-tt cc-site-tt"></span><span class="cc-x">${CHROME.x}</span></span>
          <span class="cc-plus">${CHROME.plus}</span>
        </div>
        <div class="cc-bar">
          <span class="cc-ic">${CHROME.back}</span><span class="cc-ic cc-dim">${CHROME.fwd}</span><span class="cc-ic">${CHROME.reload}</span>
          <span class="cc-omni"><span class="cc-ic cc-i-tune">${CHROME.tune}</span><span class="cc-ic cc-i-search">${CHROME.search}</span><span class="cc-url"></span><i class="cc-caret"></i></span>
          <i class="cc-me"></i><span class="cc-ic">${CHROME.more}</span>
        </div>
        ${pages.map((p) => `<img class="cc-page" data-page="${p}" src="img/${p}.webp" width="1470" height="839" alt="">`).join('')}
        ${MARKS.map((m) => `<img class="cc-mark" src="img/${m.img}" alt="" style="left:${m.box.x}px;top:${m.box.y + PAGE_TOP}px;width:${m.box.w}px;height:${m.box.h}px;${m.radius ? `border-radius:${m.radius}px;object-fit:cover;` : ''}">`).join('')}
      </div>
      <svg class="cc-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="${ARROW}"/></svg>
    </div>
    <i class="cc-edge"><i class="cc-soft"><i class="cc-band"></i></i></i>
    <span class="cc-ctl"><span class="cc-btn cc-take">${glyph('pointer')}Take control</span><span class="cc-btn cc-stop"><i></i>Stop</span></span>`;
  const $ = (s) => view.querySelector(s);
  return {
    view, desk: $('.cc-desk'), cursor: $('.cc-cursor'), tt: $('.cc-site-tt'),
    omni: $('.cc-omni'), url: $('.cc-url'), caret: $('.cc-caret'), edge: $('.cc-edge'), soft: $('.cc-soft'), ctl: $('.cc-ctl'),
    pages: Object.fromEntries([...view.querySelectorAll('.cc-page')].map((img) => [img.dataset.page, img])),
    marks: [...view.querySelectorAll('.cc-mark')], shown: {},
  };
}

// the desktop scales whole to the view's width; the view takes the desktop's shape
export function fitScreen(v) {
  const k = v.view.clientWidth / DESK.w;
  v.desk.style.transform = `scale(${k.toFixed(5)})`;
  v.view.style.height = `${(DESK.h * k).toFixed(2)}px`;
}

// each page's opacity at t: the current one fading in over its event's `fade` on top of the one before it
function pageMix(t) {
  const k = PAGES.findLastIndex((p) => t >= p.at);
  const cur = PAGES[k], prev = PAGES[k - 1];
  const mix = cur.fade ? outCubic(seg(t, cur.at, cur.at + cur.fade)) : 1;
  const out = {};
  if (prev && mix < 1) out[prev.page] = 1;
  out[cur.page] = Math.max(out[cur.page] || 0, mix);
  return out;
}

export function paintScreen(v, t) {
  // the takeover: the vignette fades in as its gradient turns and gently breathes; the controls come with it
  const g = outCubic(seg(t, TAKE, TAKE + 0.55));
  v.edge.style.opacity = g.toFixed(3);
  v.ctl.style.opacity = g.toFixed(3);
  v.edge.style.setProperty('--cc-a', `${((t * 60) % 360).toFixed(1)}deg`);
  v.soft.style.opacity = (0.9 + 0.08 * Math.sin(t * 2.6)).toFixed(3);

  const mix = pageMix(t);
  for (const [name, img] of Object.entries(v.pages)) {
    const o = mix[name] || 0;
    img.style.opacity = o.toFixed(3);
    img.style.visibility = o > 0 ? 'visible' : 'hidden';
  }
  // the agent's marks live on the edit view's table and show only with it
  const onTable = mix['edit-table'] || 0;
  MARKS.forEach((m, k) => { v.marks[k].style.opacity = (onTable * outCubic(seg(t, m.at, m.at + 0.25))).toFixed(3); });

  const title = t < NAV.load ? GAME.title : HUB.title;
  if (v.shown.title !== title) { v.tt.textContent = title; v.shown.title = title; }
  const o = omniAt(t);
  if (v.shown.text !== o.text) { v.url.textContent = o.text; v.shown.text = o.text; }
  v.omni.classList.toggle('is-focus', !!o.focus);
  v.url.classList.toggle('is-sel', !!o.sel);
  v.caret.style.visibility = o.focus && o.caret ? 'visible' : 'hidden';

  const c = cursorAt(t);
  v.cursor.style.transform = `translate(${(c.x - TIP.x).toFixed(2)}px, ${(c.y - TIP.y).toFixed(2)}px)`;
}
