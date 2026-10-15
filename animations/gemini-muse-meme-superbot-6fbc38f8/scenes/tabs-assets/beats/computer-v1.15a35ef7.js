// Computer-control beat, first take (the 'computer-control-v1' variant): asked "Take computer control and open a tab",
// superbot answers with one line and an artifact frame showing the user's screen, a light browser window on the desktop
// with one tab open. Superbot then takes control: a cyan ring draws around the screen and an "in control" pill with a
// Stop button rises at its foot. Superbot's own cursor (a cyan arrow with a name tag, the multiplayer-cursor convention)
// comes in, glides to the tab strip's + button and clicks it (a ring ripples out from the tip). A New Tab grows in beside
// the first and becomes the active tab: the address bar empties to its placeholder with a blinking caret, the page swaps
// to a new-tab page, and the header's status reads "New tab opened". Everything is a function of t alone (no timers, no
// wall clock), so every frozen frame (?t=) is identical. The frame and header come from the bakery sheet
// (../bakery.005f5570.css); the screen's own styles are ../computer-v1.15a35ef7.css, loaded with the module.
import { lerp, seg, outCubic, streamCount, press, path, blink } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';

const SAY = 'Taking control of your computer to open a new tab.';
const CSS = new URL('../computer-v1.15a35ef7.css?v=1', import.meta.url).href;

// the screen's geometry in the 560x350 view's px (computer-v1.15a35ef7.css mirrors it): the window is inset WIN px, its
// tab strip starts TAB_X px in and tabs are TAB_W wide; the + button is 26px round, 4px right of the last tab, its
// centre 15px above the strip's 36px foot
const WIN = 14, TAB_X = 72, TAB_W = 150, STRIP = 36;
const PLUS = { x: WIN + TAB_X + TAB_W + 4 + 13, y: WIN + STRIP - 2 - 13 };
const START = { x: 404, y: 238 };  // where Superbot's cursor appears, over the page
const REST = { x: 452, y: 176 };   // where it settles once the tab is open, right of the new-tab page's search box

const ICON = {
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  fwd: '<svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  reload: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  // the pointer, tip at (2, 2) of a 20px box
  arrow: '<svg viewBox="0 0 20 20"><path d="M2 2v14.2l4-3.9 2.7 6.1 2.6-1.1-2.7-6h5.6z"/></svg>',
};
const SHORTCUTS = [['M', 'Mail'], ['C', 'Calendar'], ['D', 'Drive'], ['N', 'News']];

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`computer-control-v1 variant stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

function markup(esc) {
  const tab = (cls, label) => `<span class="ccv-tab ${cls}"><span class="ccv-tin"><i class="ccv-fav"></i><span>${esc(label)}</span></span></span>`;
  const lines = [92, 78, 86, 64, 0, 88, 72, 80, 46].map((w) => (w ? `<i style="width:${w}%"></i>` : '<b></b>')).join('');
  return `<div class="bk ccv">
    <div class="bk-head"><div class="bk-title">Your computer<small class="ccv-status">Connecting</small></div></div>
    <div class="bk-view ccv-view">
      <div class="ccv-win">
        <div class="ccv-strip">
          <span class="ccv-lights"><i></i><i></i><i></i></span>
          ${tab('ccv-t1 is-on', 'Weekly plan')}${tab('ccv-t2', 'New Tab')}
          <span class="ccv-plus">${ICON.plus}</span>
        </div>
        <div class="ccv-bar">
          <span class="ccv-nav">${ICON.back}${ICON.fwd}${ICON.reload}</span>
          <span class="ccv-omni"><span class="ccv-url">docs.example.com/weekly-plan</span><span class="ccv-ph">Search or type a URL</span><i class="ccv-caret"></i></span>
        </div>
        <div class="ccv-page">
          <div class="ccv-doc"><h3>Weekly plan</h3><div class="ccv-lines">${lines}</div></div>
          <div class="ccv-ntp">
            <span class="ccv-find">${ICON.search}Search or type a URL</span>
            <span class="ccv-shorts">${SHORTCUTS.map(([l, n]) => `<span><i>${l}</i>${n}</span>`).join('')}</span>
          </div>
        </div>
      </div>
      <i class="ccv-ring"></i>
      <span class="ccv-pill"><i class="ccv-live"></i>Superbot is in control<span class="ccv-stop">Stop</span></span>
      <i class="ccv-ripple"></i>
      <span class="ccv-cur">${ICON.arrow}<span class="ccv-tag">Superbot</span></span>
    </div>
  </div>`;
}

export default {
  // `end` is the route's end (chat.9b47fc30.js routeBy, base end plus extra), so the loop length is the router's call
  times(r, end = r + 3.95) {
    const T = { r };
    T.card = r + 0.22;          // the screen rises in
    T.take = T.card + 0.42;     // Superbot takes control: the ring draws, the pill rises
    T.cur = T.take + 0.24;      // its cursor appears over the page
    T.click = T.cur + 0.72;     // ...glides to the + button and clicks
    T.tab = T.click + 0.06;     // the New Tab grows in and takes focus
    T.done = T.tab + 0.4;       // the header says so
    T.end = end;
    return T;
  },
  build(k, x) {
    loadFrameSheet();
    loadSheet();
    const T = k.T;
    const say = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(SAY)}</span></div>`);
    const block = x.el(markup(x.esc));
    const q = (s) => block.querySelector(s);
    const status = q('.ccv-status'), t1 = q('.ccv-t1'), t2 = q('.ccv-t2'), plus = q('.ccv-plus');
    const url = q('.ccv-url'), ph = q('.ccv-ph'), caret = q('.ccv-caret'), doc = q('.ccv-doc'), ntp = q('.ccv-ntp');
    const ring = q('.ccv-ring'), pill = q('.ccv-pill'), ripple = q('.ccv-ripple'), cur = q('.ccv-cur');
    const vis = say.firstElementChild, hid = say.lastElementChild;
    const keys = [{ t: T.cur, ...START }, { t: T.click - 0.08, ...PLUS }, { t: T.click + 0.2, ...PLUS }, { t: T.click + 0.8, ...REST }];
    ripple.style.left = `${PLUS.x}px`;
    ripple.style.top = `${PLUS.y}px`;
    let shown = -1, said = '';

    return {
      nodes: [say, block],
      marks: [[T.r, say], [T.card, block]],
      render(t) {
        const n = streamCount(SAY, T.r + 0.06, 70, t);
        if (n !== shown) { vis.textContent = SAY.slice(0, n); hid.textContent = SAY.slice(n); shown = n; }
        const ci = outCubic(seg(t, T.card, T.card + 0.45));
        block.style.opacity = ci.toFixed(3);
        block.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
        const st = t >= T.done ? 'New tab opened' : t >= T.take ? 'Superbot in control' : 'Connecting';
        if (st !== said) { status.textContent = st; said = st; }

        // the takeover: the ring draws, then the pill rises at the screen's foot
        ring.style.opacity = outCubic(seg(t, T.take, T.take + 0.25)).toFixed(3);
        const pi = outCubic(seg(t, T.take + 0.08, T.take + 0.36));
        pill.style.opacity = pi.toFixed(3);
        pill.style.transform = `translate(-50%, ${((1 - pi) * 10).toFixed(2)}px)`;

        // Superbot's cursor: in over the page, onto the + button (which lights under it), press, then aside
        const at = path(t, keys);
        const pr = press(t, T.click);
        cur.style.opacity = seg(t, T.cur, T.cur + 0.15).toFixed(3);
        cur.style.transform = `translate(${(at.x - 2).toFixed(1)}px, ${(at.y - 2).toFixed(1)}px) scale(${(1 - 0.14 * pr).toFixed(3)})`;
        plus.classList.toggle('is-hot', t >= T.click - 0.12 && t < T.tab + 0.3);
        const rp = seg(t, T.click, T.click + 0.42);
        ripple.style.opacity = (t < T.click ? 0 : 1 - rp).toFixed(3);
        ripple.style.transform = `translate(-50%, -50%) scale(${lerp(0.4, 1.5, outCubic(rp)).toFixed(4)})`;

        // the New Tab grows in, takes focus, and its page replaces the document
        const w = TAB_W * outCubic(seg(t, T.tab, T.tab + 0.28));
        t2.style.width = `${w.toFixed(1)}px`;
        t1.classList.toggle('is-on', t < T.tab);
        t2.classList.toggle('is-on', t >= T.tab);
        url.style.opacity = (1 - seg(t, T.tab, T.tab + 0.12)).toFixed(3);
        ph.style.opacity = seg(t, T.tab + 0.1, T.tab + 0.25).toFixed(3);
        caret.style.opacity = t >= T.tab + 0.15 && blink(t - T.tab - 0.15) ? '1' : '0';
        doc.style.opacity = (1 - seg(t, T.tab, T.tab + 0.2)).toFixed(3);
        const ni = outCubic(seg(t, T.tab + 0.05, T.tab + 0.35));
        ntp.style.opacity = ni.toFixed(3);
        ntp.style.transform = ni >= 1 ? 'none' : `translateY(${((1 - ni) * 6).toFixed(2)}px)`;
      },
    };
  },
};
