// Computer-control beat (the 'computer-control' variant): asked "Take computer control and open a tab", superbot
// answers with one line and a small browser window. A status pill on the window's lower edge says Superbot is controlling
// the computer; the takeover cursor glides to the + button with a little purple square fading out radially around its
// tip, presses (the square pulses), and a New Tab grows in next to the old one and becomes the active tab: the address
// bar takes focus with a blinking caret and its placeholder, and the page shows a new-tab state. The cursor then settles
// in the address bar. The cursor itself is the scene's pointer (chat.9b47fc30.js draws it from the beat's pointer());
// the purple square is drawn here, in the window's own px, and both follow one path that is a function of t alone, so
// every frozen frame (?t=) is identical: no timers, no wall clock. The end is held to the route's end (chat.9b47fc30.js
// routeBy, base end plus extra). Its stylesheet (../computer-control.e1ecb597.css) loads with the module.
import { lerp, seg, outCubic, inOutCubic, streamCount, press, path, blink } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';

const SAY = 'Taking control of your computer. Opening a new tab.';
const CSS = new URL('../computer-control.e1ecb597.css?v=1', import.meta.url).href;

// the window's geometry in its own px (computer-control.e1ecb597.css mirrors it): the width, the tab strip and the + button
const W = 440;
const TAB_W = 118, TAB_GAP = 2, TAB_X = 62;
const PLUS_X = TAB_X + TAB_W + 8, PLUS_Y = 24; // the + button's centre before the new tab opens
const ADDR_X = 100, ADDR_Y = 59;                // the address bar: left edge, centre line
const START = { x: W - 40, y: 205 };            // where the takeover cursor comes in from, inside the window
const REST = { x: ADDR_X + 92, y: ADDR_Y + 2 }; // where it settles

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`computer-control variant stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

export default {
  // `end` is the route's end (chat.9b47fc30.js routeBy, base end plus extra), so the loop length is the router's call
  times(r, end = r + 4.15) {
    const T = { r };
    T.card = r + 0.35;          // the window rises in as the line streams
    T.ptr = T.card + 0.55;      // the cursor (and its purple square) appears once the window has landed
    T.hit = T.ptr + 1.05;       // the cursor reaches + and presses
    T.tab = T.hit + 0.08;       // the new tab grows in
    T.rest = T.hit + 0.75;      // the cursor drifts to the address bar
    T.end = end;
    return T;
  },
  build(k, x) {
    loadSheet();
    const T = k.T;
    const say = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(SAY)}</span></div>`);
    const win = x.el(`<div class="ccx" style="width:${W}px">
      <div class="ccx-win">
        <div class="ccx-bar">
          <i class="ccx-dot ccx-d1"></i><i class="ccx-dot ccx-d2"></i><i class="ccx-dot ccx-d3"></i>
          <span class="ccx-tab ccx-t1"><i class="ccx-fav ccx-fav-sb"></i><span class="ccx-tl">superbot</span><span class="ccx-tx">&times;</span></span>
          <span class="ccx-tab ccx-t2"><span class="ccx-tin"><i class="ccx-fav"></i><span class="ccx-tl">New Tab</span><span class="ccx-tx">&times;</span></span></span>
          <span class="ccx-plus"><svg viewBox="0 0 24 24"><path d="M12 5.5v13M5.5 12h13"/></svg></span>
        </div>
        <div class="ccx-tool">
          <span class="ccx-nav"><svg viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6"/></svg></span>
          <span class="ccx-nav"><svg viewBox="0 0 24 24"><path d="M9.5 6l6 6-6 6"/></svg></span>
          <span class="ccx-addr"><span class="ccx-url">superbot.gg</span><span class="ccx-ph">Search or type a URL</span><i class="ccx-caret"></i></span>
        </div>
        <div class="ccx-page ccx-p1"><i class="ccx-sk ccx-sk-h"></i><i class="ccx-sk ccx-sk-a"></i><i class="ccx-sk ccx-sk-b"></i><i class="ccx-sk ccx-sk-c"></i></div>
        <div class="ccx-page ccx-p2"><span class="ccx-nt">New Tab</span><span class="ccx-tiles"><i></i><i></i><i></i><i></i></span></div>
      </div>
      <span class="ccx-pill"><i class="ccx-pd"></i><span class="ccx-pt">Superbot is controlling your computer</span><span class="ccx-stop">Stop</span></span>
      <i class="ccx-sq"></i><i class="ccx-sq ccx-ping"></i>
    </div>`);
    const $ = (s) => win.querySelector(s);
    const frame = $('.ccx-win'), t1 = $('.ccx-t1'), t2 = $('.ccx-t2'), plus = $('.ccx-plus'), plusIc = plus.firstElementChild;
    const url = $('.ccx-url'), ph = $('.ccx-ph'), caret = $('.ccx-caret'), addr = $('.ccx-addr');
    const p1 = $('.ccx-p1'), p2 = $('.ccx-p2'), pill = $('.ccx-pill'), pd = $('.ccx-pd');
    const sq = $('.ccx-sq'), ping = $('.ccx-ping');
    const vis = say.firstElementChild, hid = say.lastElementChild;
    let shown = -1;

    // the cursor's tip in the window's px: in from the lower right to +, then on to the address bar
    const tip = (t) => path(t, [
      { t: T.ptr, x: START.x, y: START.y },
      { t: T.hit, x: PLUS_X, y: PLUS_Y },
      { t: T.hit + 0.1, x: PLUS_X, y: PLUS_Y },
      { t: T.rest + 0.55, x: REST.x, y: REST.y },
    ]);
    const vOf = (t) => outCubic(seg(t, T.ptr, T.ptr + 0.25));

    return {
      nodes: [say, win],
      marks: [[T.r, say], [T.card, win]],
      render(t) {
        const n = streamCount(SAY, T.r + 0.06, 70, t);
        if (n !== shown) { vis.textContent = SAY.slice(0, n); hid.textContent = SAY.slice(n); shown = n; }

        const i = outCubic(seg(t, T.card, T.card + 0.5));
        win.style.opacity = i.toFixed(3);
        win.style.transform = i >= 1 ? 'none' : `translateY(${((1 - i) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, i).toFixed(4)})`;

        // while superbot holds the computer the window carries a purple edge glow
        const g = outCubic(seg(t, T.card + 0.3, T.card + 0.9));
        frame.style.boxShadow = `inset 0 0 0 1px rgba(255,255,255,.09), inset 0 0 0 1px rgba(139,92,246,${(0.5 * g).toFixed(3)}), inset 0 0 26px rgba(139,92,246,${(0.17 * g).toFixed(3)}), 0 12px 30px rgba(0,0,0,.4)`;
        pd.style.opacity = (0.65 + 0.35 * Math.sin((t - T.card) * 5)).toFixed(3);

        // the new tab: grows in beside the first, which hands it the active look; + slides along
        const a = inOutCubic(seg(t, T.tab, T.tab + 0.38));
        t2.style.width = (TAB_W * a).toFixed(2) + 'px';
        t2.style.opacity = Math.min(1, a * 2).toFixed(3);
        t2.firstElementChild.style.opacity = seg(a, 0.35, 1).toFixed(3);
        t1.style.background = `rgba(31,31,35,${(1 - a).toFixed(3)})`;
        t1.style.color = a > 0.5 ? '#8e8e93' : '';
        plus.style.transform = `translateX(${((TAB_W + TAB_GAP) * a).toFixed(2)}px)`;
        const hit = press(t, T.hit, 0.06, 0.06, 0.14);
        plusIc.style.transform = `scale(${(1 - 0.18 * hit).toFixed(3)})`;
        plus.style.background = `rgba(255,255,255,${(0.14 * hit).toFixed(3)})`;

        // the address bar and the page follow the active tab
        url.style.opacity = (1 - a).toFixed(3);
        ph.style.opacity = a.toFixed(3);
        p1.style.opacity = (1 - a).toFixed(3);
        p2.style.opacity = a.toFixed(3);
        p2.style.transform = `translateY(${((1 - a) * 6).toFixed(2)}px)`;
        const f = seg(t, T.tab + 0.2, T.tab + 0.5);
        addr.style.boxShadow = `inset 0 0 0 1.5px rgba(139,92,246,${(0.9 * f).toFixed(3)})`;
        caret.style.opacity = (f > 0 && blink(t - T.tab) ? 1 : 0).toFixed(0);

        // the purple square rides the cursor tip (centred on it); the click sets off a ping that grows and fades
        const c = tip(t), v = vOf(t);
        sq.style.opacity = v.toFixed(3);
        sq.style.transform = `translate(${(c.x - 28).toFixed(1)}px, ${(c.y - 28).toFixed(1)}px) scale(${(1 + 0.12 * hit).toFixed(3)})`;
        const pg = seg(t, T.hit, T.hit + 0.55), po = outCubic(pg);
        ping.style.opacity = pg > 0 && pg < 1 ? (0.9 * (1 - po)).toFixed(3) : '0';
        ping.style.transform = `translate(${(c.x - 28).toFixed(1)}px, ${(c.y - 28).toFixed(1)}px) scale(${lerp(1, 1.9, po).toFixed(3)})`;
      },
      // the takeover cursor, in the section's px: the window's own path scaled and shifted to where the window sits
      pointer(t, toScr) {
        if (t < T.ptr) return null;
        // the hub is zoomed inside the section, so the window's box is larger in section px than its own px: scale by the ratio
        const b = x.box(win), c = tip(t), z = b.w / W;
        // placeCursor anchors the 64px svg 6.3px right of and 4.3px below the arrow's drawn tip, so that much is added to put the tip on the square's centre
        const s = toScr({ x: b.x + c.x * z + 6.3, y: b.y + c.y * z + 4.3 });
        return { x: s.x, y: s.y, p: press(t, T.hit, 0.06, 0.06, 0.14), v: vOf(t) };
      },
    };
  },
};
