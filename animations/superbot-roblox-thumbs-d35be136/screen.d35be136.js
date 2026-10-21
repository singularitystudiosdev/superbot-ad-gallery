// The live view: the user's 1728x1117 desktop (a 16-inch MacBook Pro's default) with Chrome full screen on it, scaled
// whole into the side panel (the computer-control-v3-soft variant's screen share, computer.ba3976b6.js). Every page is
// a real capture (img/CREDITS.txt) and changes only where the real page does: a carousel arrow, a navigation, the edit
// view. In the edit view the content column scrolls for real: its stitched capture moves under the fixed header and
// rails, and the overlay scrollbar's thumb travels with it. What superbot changes there (a new take landing on row 6,
// the rows below moving down one, a box unchecked or checked) is real pixels from the same capture, inside the
// scrolling content. Over the screen only the takeover's vignette and the user's controls: Take control and Stop.
import { seg, lerp, outCubic, inOutCubic, esc, glyph } from './lib.d35be136.js';
import { GAME, HUB, TYPE_URL, URL_CPS, PAGES, SCROLLS, MOVES, UPLOADS, UNCHECKS, NAV, TAKE, COL, ROW, INACTIVE, rowTop } from './timeline.d35be136.js';

const DESK = { w: 1728, h: 1117 };
const PAGE = { w: 1728, h: 1035 };
const PAGE_TOP = 82; // Chrome's tab strip and toolbar, in desktop px
const OMNI = { x: 640, y: 62 }; // where the cursor clicks the address bar
const REST = { x: 1240, y: 760 }; // where the cursor sits until superbot moves it
const TIP = { x: 4, y: 2.5 }; // the arrow's hotspot in its 24px box
const THUMB = { x: 1720, w: 6, top: 3, len: (COL.h - 6) * COL.h / COL.contentH }; // the overlay scrollbar's thumb
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

const at = (to) => (to === 'omni' ? OMNI : { x: to.x, y: to.y + PAGE_TOP });
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
const pageAt = (t) => PAGES[PAGES.findLastIndex((p) => t >= p.at)].page;
function scrollAt(t) {
  let y = 0;
  for (const s of SCROLLS) {
    if (t < s.t0) break;
    y = t < s.t1 ? lerp(s.from, s.to, inOutCubic(seg(t, s.t0, s.t1))) : s.to;
  }
  return y;
}

// the address bar: the page's own address, except while round 1 types the Creator Hub one in
function omniAt(t, onHub) {
  if (t >= TYPE_URL.click && t < TYPE_URL.type) return { focus: true, text: GAME.url, sel: true };
  if (t >= TYPE_URL.type && t < TYPE_URL.enter) {
    const n = Math.min(HUB.url.length, Math.floor((t - TYPE_URL.type) * URL_CPS));
    return { focus: true, text: HUB.url.slice(0, n), caret: n < HUB.url.length || Math.floor((t - TYPE_URL.type) / 0.53) % 2 === 0 };
  }
  return { text: onHub ? HUB.url : GAME.url };
}

const imgTag = (src, style, cls = '') => `<img class="${cls}" src="img/${src}" alt="" style="${style}">`;
const box = (x, y, w, h) => `left:${x}px;top:${y}px;width:${w}px;height:${h}px;`;

export function buildScreen(view) {
  const pages = [...new Set(PAGES.map((p) => p.page))];
  const plain = pages.filter((p) => p !== 'hub-edit');
  // a new take's row: Creator Hub's own blank upload row (row 9), the take on its thumbnail, its box (checked once
  // superbot checks it)
  const uploadRow = (u) => `<div class="cc-up" style="${box(0, 0, COL.w, ROW.h)}">
      ${imgTag('row-blank.webp', box(0, 0, COL.w, ROW.h))}
      ${imgTag(u.img, `${box(ROW.thumb.x - COL.x, ROW.thumb.y, ROW.thumb.w, ROW.thumb.h)}border-radius:4px;object-fit:cover;`, 'cc-up-thumb')}
      ${imgTag('cb-on.png', box(ROW.box.x - COL.x, ROW.box.y, ROW.box.s, ROW.box.s), 'cc-up-box')}
    </div>`;
  const inactiveTop = rowTop(INACTIVE.first), inactiveH = INACTIVE.rows * ROW.h - 1; // the table's own bottom line stays
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
          <span class="cc-ic">${CHROME.back}</span><span class="cc-ic cc-fwd">${CHROME.fwd}</span><span class="cc-ic">${CHROME.reload}</span>
          <span class="cc-omni"><span class="cc-ic cc-i-tune">${CHROME.tune}</span><span class="cc-ic cc-i-search">${CHROME.search}</span><span class="cc-url"></span><i class="cc-caret"></i></span>
          <i class="cc-me"></i><span class="cc-ic">${CHROME.more}</span>
        </div>
        ${plain.map((p) => `<img class="cc-page" data-page="${p}" src="img/${p}.webp" width="${PAGE.w}" height="${PAGE.h}" alt="">`).join('')}
        <div class="cc-page cc-edit" data-page="hub-edit">
          <img src="img/hub-edit.webp" width="${PAGE.w}" height="${PAGE.h}" alt="">
          <div class="cc-col" style="${box(COL.x, COL.y, COL.w, COL.h)}">
            <div class="cc-col-in" style="height:${COL.contentH}px">
              <img src="img/hub-col.webp" alt="" style="${box(0, 0, COL.w, COL.contentH)}">
              ${UNCHECKS.map((u) => imgTag('cb-off.png', box(ROW.box.x - COL.x, rowTop(u.row) + ROW.box.y, ROW.box.s, ROW.box.s), 'cc-off')).join('')}
              <div class="cc-inactive" style="${box(0, inactiveTop, COL.w, inactiveH)}">
                ${imgTag('rows-inactive.webp', box(0, 0, COL.w, INACTIVE.rows * ROW.h), 'cc-old')}
                ${UPLOADS.map(uploadRow).join('')}
              </div>
            </div>
          </div>
          <i class="cc-track" style="${box(THUMB.x - 4, COL.y, THUMB.w + 8, COL.h)}"></i>
          <i class="cc-thumb" style="${box(THUMB.x, COL.y + THUMB.top, THUMB.w, THUMB.len)}"></i>
        </div>
      </div>
      <svg class="cc-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="${ARROW}"/></svg>
    </div>
    <i class="cc-edge"><i class="cc-soft"><i class="cc-band"></i></i></i>
    <span class="cc-ctl"><span class="cc-btn cc-take">${glyph('pointer')}Take control</span><span class="cc-btn cc-stop"><i></i>Stop</span></span>`;
  const $ = (s) => view.querySelector(s);
  return {
    view, desk: $('.cc-desk'), cursor: $('.cc-cursor'), tt: $('.cc-site-tt'), fwd: $('.cc-fwd'),
    omni: $('.cc-omni'), url: $('.cc-url'), caret: $('.cc-caret'), edge: $('.cc-edge'), soft: $('.cc-soft'), ctl: $('.cc-ctl'),
    pages: Object.fromEntries([...view.querySelectorAll('.cc-page')].map((el) => [el.dataset.page, el])),
    colIn: $('.cc-col-in'), thumb: $('.cc-thumb'), offs: [...view.querySelectorAll('.cc-off')], old: $('.cc-old'),
    ups: [...view.querySelectorAll('.cc-up')].map((el) => ({ el, box: el.querySelector('.cc-up-box') })), shown: {},
  };
}

// the desktop scales whole to the view's width; the view takes the desktop's shape
export function fitScreen(v) {
  const k = v.view.clientWidth / DESK.w;
  v.desk.style.transform = `scale(${k.toFixed(5)})`;
  v.view.style.height = `${(DESK.h * k).toFixed(2)}px`;
}

// the edit view at t: the column's scroll and the scrollbar's thumb, the new takes on row 6 with the rows below moved
// down one per take, and the boxes superbot has changed
function paintEdit(v, t) {
  const y = scrollAt(t);
  v.colIn.style.transform = `translateY(${(-y).toFixed(2)}px)`;
  v.thumb.style.transform = `translateY(${((COL.h - 6 - THUMB.len) * (y / COL.maxScroll)).toFixed(2)}px)`;
  const landed = UPLOADS.filter((u) => t >= u.at).length;
  v.old.style.transform = `translateY(${(landed * ROW.h).toFixed(2)}px)`;
  UPLOADS.forEach((u, i) => {
    const up = v.ups[i];
    const on = t >= u.at;
    up.el.style.visibility = on ? 'visible' : 'hidden';
    if (!on) return;
    up.el.style.transform = `translateY(${((landed - 1 - i) * ROW.h).toFixed(2)}px)`; // newest on row 6
    up.box.style.visibility = t >= u.checkAt ? 'visible' : 'hidden';
  });
  UNCHECKS.forEach((u, i) => { v.offs[i].style.visibility = t >= u.at ? 'visible' : 'hidden'; });
}

export function paintScreen(v, t) {
  // the takeover: the vignette fades in as its gradient turns and gently breathes; the controls come with it
  const g = outCubic(seg(t, TAKE, TAKE + 0.55));
  v.edge.style.opacity = g.toFixed(3);
  v.ctl.style.opacity = g.toFixed(3);
  v.edge.style.setProperty('--cc-a', `${((t * 60) % 360).toFixed(1)}deg`);
  v.soft.style.opacity = (0.9 + 0.08 * Math.sin(t * 2.6)).toFixed(3);

  const p = pageAt(t);
  if (v.shown.page !== p) {
    if (v.shown.page) v.pages[v.shown.page].classList.remove('is-on');
    v.pages[p].classList.add('is-on');
    v.shown.page = p;
  }
  if (p === 'hub-edit') paintEdit(v, t);

  const onHub = p.startsWith('hub');
  const title = onHub ? HUB.title : GAME.title;
  if (v.shown.title !== title) { v.tt.textContent = title; v.shown.title = title; }
  const nav = NAV.findLast((n) => t >= n.at);
  v.fwd.classList.toggle('cc-dim', !(nav && nav.fwd));
  const o = omniAt(t, onHub);
  if (v.shown.text !== o.text) { v.url.textContent = o.text; v.shown.text = o.text; }
  v.omni.classList.toggle('is-focus', !!o.focus);
  v.url.classList.toggle('is-sel', !!o.sel);
  v.caret.style.visibility = o.focus && o.caret ? 'visible' : 'hidden';

  const c = cursorAt(t);
  v.cursor.style.transform = `translate(${(c.x - TIP.x).toFixed(2)}px, ${(c.y - TIP.y).toFixed(2)}px)`;
}
