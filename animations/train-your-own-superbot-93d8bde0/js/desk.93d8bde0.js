// The creator's screen: Chrome full screen on a 1536x864 desktop, the pages inside it real captures of his own Roblox
// session (img/rbx/, CREDITS.txt): the ROB IT game page, its ⋯ menu, Creator Hub's Game details and the start place's
// Thumbnails page, plain and in its edit view. Chrome's frame is the reference spot's (computer.ba3976b6.js/.css: tab
// strip 42px, toolbar 40px, Chrome's own palette), widened to this desktop. The Thumbnails page scrolls the way the real
// one does: only its content column moves (the header and both rails are fixed), so the column is a stitched capture
// (thumbs-edit-content) slid under a clip. The same desk is built twice: full screen for the recording, and small inside
// Superbot's live view, where `annot` (page px) and `content` (scrolling px) carry the agent's marks. Pure: the director
// sets a state each frame and render() writes only what changed.
import { h, css, op, esc } from './lib.93d8bde0.js';

export const DESK = { w: 1536, h: 864 };
export const PAGE = { w: 1536, h: 782, top: 82 }; // the page area under tab strip + toolbar
// the Thumbnails page's scrolling column, in page px (measured on the live page: x 403, y 72, 1133x710; the stitched
// capture stops at x 1518 so the window's own scrollbar stays put)
export const COL = { x: 403, y: 72, w: 1115, h: 710, contentH: 1270 };

const ICON = {
  x: '<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>',
  plus: '<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',
  back: '<svg viewBox="0 0 16 16"><path d="M13 8H3M7 4L3 8l4 4"/></svg>',
  fwd: '<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  reload: '<svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 3v3h-3"/></svg>',
  tune: '<svg viewBox="0 0 16 16"><path d="M3 5h5.5M12.5 5H13M3 11h.5M7.5 11H13"/><circle cx="10.5" cy="5" r="1.6"/><circle cx="5.5" cy="11" r="1.6"/></svg>',
  search: '<svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>',
  more: '<svg viewBox="0 0 16 16"><path d="M8 3.5h.01M8 8h.01M8 12.5h.01"/></svg>',
  clock: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></svg>',
  spin: '<svg viewBox="0 0 16 16"><path d="M8 2.5a5.5 5.5 0 1 1-5.5 5.5"/></svg>',
};
// the Roblox mark (Wikimedia Commons, Roblox_player_icon_black.svg) as the tab's favicon
const RBX = '<svg viewBox="0 0 60.8 60.8"><path fill="#1f1f1f" fill-rule="evenodd" d="M14.87 3.525 57.27 14.875 45.93 57.275 3.53 45.925ZM34.73 37.995 37.9 26.165 26.07 22.995 22.89 34.825Z"/></svg>';

const SHOTS = {
  ntp: 'img/chrome-new-tab.webp',
  game: 'img/rbx/game-base-safe.webp',
  menu: 'img/rbx/game-menu-safe.webp',
  details: 'img/rbx/details.webp',
  thumbs: 'img/rbx/thumbs-0.webp',
  edit: 'img/rbx/thumbs-edit-0.webp',
};
export const SHOT_URLS = [...Object.values(SHOTS), 'img/rbx/thumbs-edit-content.webp'];
// the omnibox's suggestions as Chrome lists them for "roblox.com" from his history (the page titles are the real ones)
const SUGGEST = [
  ['roblox.com/games/96168869671905/ROB-IT', 'ROB IT | Play on Roblox'],
  ['roblox.com/home', 'Home - Roblox'],
  ['create.roblox.com/dashboard/creations', 'Creations | Creator Hub'],
];

export function makeDesk({ scale = 1 } = {}) {
  const pages = Object.entries(SHOTS).map(([k, src]) => `<img class="tc-page tc-p-${k}" data-page="${k}" src="${src}" width="${PAGE.w}" height="${PAGE.h}" alt="" decoding="async">`).join('');
  const root = h(`<div class="tc-desk" style="transform: scale(${scale})">
    <div class="tc-win">
      <div class="tc-strip">
        <span class="tc-lights"><i></i><i></i><i></i></span>
        <span class="tc-tab"><i class="tc-tbg"></i><span class="tc-fav"><span class="tc-fav-rbx">${RBX}</span><span class="tc-fav-spin">${ICON.spin}</span></span><span class="tc-tt"></span><span class="tc-x">${ICON.x}</span></span>
        <span class="tc-plus">${ICON.plus}</span>
      </div>
      <div class="tc-bar">
        <span class="tc-ic">${ICON.back}</span><span class="tc-ic tc-dim">${ICON.fwd}</span><span class="tc-ic">${ICON.reload}</span>
        <span class="tc-omni"><span class="tc-omni-ic">${ICON.tune}</span><span class="tc-url"><span class="tc-url-typed"></span><span class="tc-url-sel"></span><i class="tc-caret"></i><span class="tc-ph">Search Google or type a URL</span></span></span>
        <i class="tc-me"></i><span class="tc-ic">${ICON.more}</span>
      </div>
      <div class="tc-view">
        ${pages}
        <div class="tc-col"><img class="tc-col-img" src="img/rbx/thumbs-edit-content.webp" width="${COL.w}" height="${COL.contentH}" alt="" decoding="async"><div class="tc-content"></div></div>
        <div class="tc-hovers"></div>
        <div class="tc-annot"></div>
      </div>
      <div class="tc-suggest">${SUGGEST.map(([u, title], i) => `<div class="tc-sg" data-i="${i}"><span class="tc-sg-ic">${i === 2 ? ICON.clock : RBX}</span><span class="tc-sg-u">${esc(u)}</span><span class="tc-sg-t"> - ${esc(title)}</span></div>`).join('')}</div>
    </div>
  </div>`);
  const $ = (s) => root.querySelector(s);
  const v = {
    root, tab: $('.tc-tab'), tt: $('.tc-tt'), favR: $('.tc-fav-rbx'), favS: $('.tc-fav-spin'), omni: $('.tc-omni'),
    typed: $('.tc-url-typed'), sel: $('.tc-url-sel'), caret: $('.tc-caret'), ph: $('.tc-ph'), suggest: $('.tc-suggest'),
    sg: [...root.querySelectorAll('.tc-sg')], view: $('.tc-view'), col: $('.tc-col'), colImg: $('.tc-col-img'),
    content: $('.tc-content'), hovers: $('.tc-hovers'), annot: $('.tc-annot'),
    pages: Object.fromEntries([...root.querySelectorAll('.tc-page')].map((el) => [el.dataset.page, el])),
  };
  const hoverEls = [];
  return {
    root, view: v.view, annot: v.annot, content: v.content, col: v.col,
    imgs: [...root.querySelectorAll('img')],
    /** s: { pages: {name: opacity}, edit: opacity of the scrolling edit view, scroll, tab: {title, loading, spin, fav},
          omni: {typed, sel, caret, focus, ph}, suggest: opacity, suggestSel, hovers: [{x,y,w,h,r,bg,o}] } */
    render(s) {
      for (const [k, el] of Object.entries(v.pages)) op(el, (s.pages && s.pages[k]) || 0);
      op(v.col, s.edit || 0);
      css(v.colImg, 'transform', `translateY(${(-(s.scroll || 0)).toFixed(2)}px)`);
      css(v.content, 'transform', `translateY(${(-(s.scroll || 0)).toFixed(2)}px)`);
      const tab = s.tab || {};
      if (v.tt.textContent !== (tab.title || '')) v.tt.textContent = tab.title || '';
      op(v.favR, tab.fav && !tab.loading ? 1 : 0);
      op(v.favS, tab.loading ? 1 : 0);
      css(v.favS, 'transform', `rotate(${((tab.spin || 0) % 360).toFixed(1)}deg)`);
      const o = s.omni || {};
      if (v.typed.textContent !== (o.typed || '')) v.typed.textContent = o.typed || '';
      if (v.sel.textContent !== (o.sel || '')) v.sel.textContent = o.sel || '';
      op(v.caret, o.caret ? 1 : 0);
      op(v.ph, o.ph ? 1 : 0);
      css(v.omni, 'background', o.focus ? '#fff' : '#f1f3f4');
      css(v.omni, 'box-shadow', o.focus ? 'inset 0 0 0 2px rgba(26,115,232,.9)' : 'none');
      op(v.suggest, s.suggest || 0);
      css(v.suggest, 'visibility', s.suggest > 0 ? 'visible' : 'hidden');
      v.sg.forEach((el, i) => css(el, 'background', i === s.suggestSel ? '#e8eaed' : 'transparent'));
      const hv = s.hovers || [];
      while (hoverEls.length < hv.length) { const el = h('<i class="tc-hover"></i>'); v.hovers.appendChild(el); hoverEls.push(el); }
      hoverEls.forEach((el, i) => {
        const q = hv[i];
        if (!q) { op(el, 0); return; }
        op(el, q.o ?? 1);
        css(el, 'transform', `translate(${q.x}px, ${q.y}px)`);
        css(el, 'width', `${q.w}px`); css(el, 'height', `${q.h}px`);
        css(el, 'border-radius', `${q.r ?? 6}px`);
        css(el, 'background', q.bg || 'rgba(0,0,0,.06)');
        css(el, 'box-shadow', q.ring || 'none');
      });
    },
  };
}
