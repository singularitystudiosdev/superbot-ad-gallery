// Computer-control beat (the 'computer-control-v3' variant): asked "Take computer control and open a tab", superbot
// answers in one line and shows a live view of the user's screen in the artifact frame (bakery.005f5570.js: the title,
// Share and, in Publish's place, a Stop button). The view is the whole display edge to edge, as a real screen share
// shows it: the browser fills the display, with no made-up margin around the window. It takes
// control the way a desktop agent can actually show it, with a click-through overlay window over the whole display: a
// glow in superbot's two mark colours (chat.css .sbm-c / .sbm-m) fades in round the display's edges, so on the
// browser all the way round, brightest on the edge and fading smoothly inward, and a small pill rises at the bottom ("superbot is
// controlling your computer"). Then the shared pointer glides onto the browser's new-tab button, presses it, and a New Tab grows in beside the first: the active state moves to it, the
// page crossfades to a new-tab page and the address bar takes focus with a blinking caret. Every move is an eased
// fade or glide (outCubic, path's inOutCubic), nothing bounces. Squeezed into the window the Gemini beat leaves plus
// the route's `extra` (chat.9b47fc30.js routeBy), so the scene is a pure function of t. Its stylesheet
// (../computer.ba3976b6.css) loads with the module. The screen is drawn UI, not a capture: nothing is controlled.
// withEdge(look) is the same beat with another takeover edge, the pink and purple vignettes of the
// 'computer-control-v3-*' variants (computer.ba3976b6.css .cc3-e-soft, -deep, -flow, -pulse).
import { lerp, seg, outCubic, path, press, blink, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
// the Share control every output card carries, in front of the header's button
import { shareBtn } from './share.29a362ea.js';

const SAY = 'Done. I took control of your computer and opened a new tab.';
const CSS = new URL('../computer.ba3976b6.css?v=8', import.meta.url).href;
const TAB_W = 150; // a tab's width (computer.ba3976b6.css .cc3-tab)
const PLUS_GAP = 4; // the new-tab button's left margin (.cc3-plus)
const PLUS = 24; // the new-tab button's size (.cc3-plus)
const ICON = {
  x: '<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>',
  plus: '<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',
  back: '<svg viewBox="0 0 16 16"><path d="M13 8H3M7 4L3 8l4 4"/></svg>',
  fwd: '<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  reload: '<svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 3v3h-3"/></svg>',
  lock: '<svg viewBox="0 0 16 16"><rect x="4" y="7" width="8" height="6" rx="1.5"/><path d="M6 7V5.5a2 2 0 0 1 4 0V7"/></svg>',
  search: '<svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>',
  globe: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5"/><path d="M2.5 8h11M8 2.5c1.6 1.6 2.4 3.4 2.4 5.5S9.6 11.9 8 13.5M8 2.5C6.4 4.1 5.6 5.9 5.6 8s.8 3.9 2.4 5.5"/></svg>',
};
const SHORTCUTS = [['D', 'Docs'], ['M', 'Mail'], ['C', 'Calendar'], ['N', 'News']];

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

const beat = {
  // `end` is the route's end (chat.9b47fc30.js routeBy, base end plus extra), so the loop length is the router's call
  times(r, end = r + 3.75) {
    const T = { r };
    T.card = r + 0.22;
    T.take = r + 0.62; // the ring and the pill fade in: superbot has control
    T.ptr = r + 1.0; // the pointer appears and glides to the new-tab button
    T.hov = r + 1.75;
    T.click = r + 1.9;
    T.open = r + 1.98; // the new tab grows in and the page crossfades
    T.rest = T.open + 0.75; // the pointer fades away, leaving the clean new tab
    T.end = end;
    return T;
  },
  // `look` names the takeover edge: '' is the cyan and magenta edge glow, the rest the vignettes (withEdge below)
  build(k, x, look = '') {
    loadFrameSheet();
    loadSheet();
    const T = k.T;
    const sb = x.tile('superbot', 'cc3-sb');
    const say = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(SAY)}</span></div>`);
    const block = x.el(`<div class="bk cc3${look ? ` cc3-e-${look}` : ''}">
      <div class="bk-head">
        <b class="bk-title">Your computer<small>Live view</small></b>
        ${shareBtn('Computer control')}
        <span class="bk-btn bk-publish cc3-stop"><i></i>Stop</span>
      </div>
      <div class="bk-view cc3-screen">
        <div class="cc3-win">
          <div class="cc3-strip">
            <span class="cc3-lights"><i></i><i></i><i></i></span>
            <span class="cc3-tab cc3-t1"><i class="cc3-bg"></i><span class="cc3-fav">${sb}</span><span class="cc3-tt">superbot</span><span class="cc3-x">${ICON.x}</span></span>
            <span class="cc3-tab cc3-t2"><i class="cc3-bg"></i><span class="cc3-fav cc3-globe">${ICON.globe}</span><span class="cc3-tt">New Tab</span><span class="cc3-x">${ICON.x}</span></span>
            <span class="cc3-plus">${ICON.plus}</span>
          </div>
          <div class="cc3-bar">
            <span class="cc3-ic">${ICON.back}</span><span class="cc3-ic cc3-dim">${ICON.fwd}</span><span class="cc3-ic">${ICON.reload}</span>
            <span class="cc3-omni">
              <span class="cc3-url cc3-u1"><span class="cc3-ic">${ICON.lock}</span>superbot.gg</span>
              <span class="cc3-url cc3-u2"><span class="cc3-ic">${ICON.search}</span><i class="cc3-caret"></i><span class="cc3-ph">Search or type a URL</span></span>
            </span>
          </div>
          <div class="cc3-page">
            <div class="cc3-p1">${sb}<b>superbot</b></div>
            <div class="cc3-p2">
              <span class="cc3-find"><span class="cc3-ic">${ICON.search}</span>Search or type a URL</span>
              <span class="cc3-cuts">${SHORTCUTS.map(([l, n]) => `<span class="cc3-cut"><i>${l}</i>${n}</span>`).join('')}</span>
            </div>
          </div>
        </div>
        <i class="cc3-edge"><i class="cc3-soft"><i class="cc3-band"></i></i></i>
        <span class="cc3-pill">${sb}<span>superbot is controlling your computer</span></span>
      </div>
    </div>`);
    const $ = (s) => block.querySelector(s);
    const view = $('.cc3-screen'), t1 = $('.cc3-t1'), t2 = $('.cc3-t2'), plus = $('.cc3-plus');
    const bg1 = t1.querySelector('.cc3-bg'), omni = $('.cc3-omni'), u1 = $('.cc3-u1'), u2 = $('.cc3-u2'), caret = $('.cc3-caret');
    const p1 = $('.cc3-p1'), p2 = $('.cc3-p2'), edge = $('.cc3-edge'), soft = $('.cc3-soft'), pill = $('.cc3-pill');
    const vis = say.firstElementChild, hid = say.lastElementChild;
    let shown = -1;

    return {
      nodes: [say, block],
      marks: [[T.r, say], [T.card, block]],
      render(t) {
        const n = streamCount(SAY, T.r + 0.06, 70, t);
        if (n !== shown) { vis.textContent = SAY.slice(0, n); hid.textContent = SAY.slice(n); shown = n; }
        const ci = outCubic(seg(t, T.card, T.card + 0.45));
        block.style.opacity = ci.toFixed(3);
        block.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;

        // the takeover: the edge fades in as its gradient turns slowly and gently breathes, the pill rises. The flowing
        // vignette slides its gradient back and forth (--cc3-p), the pulsing one breathes its depth (--cc3-d)
        const g = outCubic(seg(t, T.take, T.take + 0.55));
        edge.style.opacity = g.toFixed(3);
        edge.style.setProperty('--cc3-a', `${((t * 60) % 360).toFixed(1)}deg`);
        if (look === 'flow') edge.style.setProperty('--cc3-p', `${(50 + 50 * Math.sin(t * 0.9)).toFixed(2)}%`);
        if (look === 'pulse') edge.style.setProperty('--cc3-d', `${(7 + 5 * Math.sin(t * 2.2)).toFixed(2)}px`);
        soft.style.opacity = ((look ? 0.9 : 0.78) + 0.08 * Math.sin(t * 2.6)).toFixed(3);
        const pi = outCubic(seg(t, T.take + 0.12, T.take + 0.57));
        pill.style.opacity = pi.toFixed(3);
        pill.style.transform = `translate(-50%, ${((1 - pi) * 8).toFixed(2)}px)`;

        // the click: the button lights under the pointer and dips, then the new tab grows in and takes the active state
        const h = seg(t, T.hov - 0.15, T.hov) * (1 - seg(t, T.open, T.open + 0.2));
        plus.style.background = `rgba(60,64,67,${(0.12 * h).toFixed(3)})`;
        plus.style.transform = `scale(${(1 - 0.1 * press(t, T.click)).toFixed(3)})`;
        const o = outCubic(seg(t, T.open, T.open + 0.34));
        t2.style.width = `${(TAB_W * o).toFixed(2)}px`;
        t2.style.opacity = o.toFixed(3);
        bg1.style.opacity = (1 - outCubic(seg(t, T.open, T.open + 0.22))).toFixed(3);

        // the page and the address bar follow the active tab: superbot.gg fades out, the new-tab page fades up
        const f = outCubic(seg(t, T.open + 0.06, T.open + 0.42));
        p1.style.opacity = (1 - f).toFixed(3);
        p2.style.opacity = f.toFixed(3);
        p2.style.transform = `translateY(${((1 - f) * 6).toFixed(2)}px)`;
        u1.style.opacity = (1 - f).toFixed(3);
        u2.style.opacity = f.toFixed(3);
        omni.style.background = f > 0 ? `rgb(${Math.round(lerp(241, 255, f))},${Math.round(lerp(243, 255, f))},${Math.round(lerp(244, 255, f))})` : '';
        omni.style.boxShadow = f > 0 ? `inset 0 0 0 2px rgba(26,115,232,${(0.9 * f).toFixed(3)})` : '';
        caret.style.opacity = f >= 1 && !blink(t - T.open) ? '0' : '1';
      },
      // the pointer appears over the page, glides onto the new-tab button and presses it; it rests while the tab grows
      // in, then fades. The button's x is read off the first tab (it never moves), so a frozen frame after the click
      // still finds the spot the button was pressed, in the section's px
      pointer(t, toScr) {
        if (t < T.ptr || t >= T.rest + 0.35) return null;
        const v = x.box(view), a = x.box(t1), b = x.box(plus);
        const from = toScr({ x: v.x + v.w * 0.58, y: v.y + v.h * 0.64 });
        const to = toScr({ x: a.x + a.w + PLUS_GAP + PLUS / 2 + 1, y: b.cy + 3 });
        const at = path(t, [{ t: T.ptr, ...from }, { t: T.hov, ...to }]);
        return { x: at.x, y: at.y, p: press(t, T.click), v: seg(t, T.ptr, T.ptr + 0.18) * (1 - seg(t, T.rest, T.rest + 0.35)) };
      },
    };
  },
};

export default beat;
// the vignette variants (chat.9b47fc30.js routeBy 'computer-control-v3-*'): the same beat with another takeover edge
export const withEdge = (look) => ({ times: beat.times, build: (k, x) => beat.build(k, x, look) });
