// Activity-rail loop cuts ('cc-activity-edge', '-footer', '-header', '-news-rail', '-news-left', '-news-footer'): the
// computer-control-v3-soft live view (computer.ba3976b6.js: the Your computer frame with Share, Expand and Stop and the
// controlling-your-computer pill) on a job that loops. Asked to keep checking flight sites for the cheapest Denver to
// Tokyo flight, superbot loops over Google Flights, Kayak and momondo on the user's screen, a tab per site
// (ccact-screen.5204eced.js: the cursor, keys, tabs and pages only, no effects drawn over the screen); when the user asks
// for nonstop only it starts a second loop, reloading Google Flights and ticking each other site's Nonstop filter. Its
// progress is on the frame, one look per variant (ccact-hud.5204eced.js): the task top right of the screen with its loop
// and step, a bar that fills once per loop and starts over with the next, three looks with the cheapest fare so far as
// the topline; and to the right of the frame a small activity rail, an icon and a line per thing superbot did. While it
// works the user checks in from the composer ("any updates?", "what's the best so far?") and changes the job ("only
// nonstop flights please"); superbot answers each in the thread, and the live view stays docked at the bottom of the
// thread the whole time: every message lands above it. The follow-ups, the docked frame and its rail are built here, in
// one feed item that leaves the engine's reply for the feed on the first render, right after it (it rides in
// inst.nodes, so the engine's show() hides it under every other variant); the engine types and sends the follow-ups from
// inst.asks (chat.9b47fc30.js). Expand opens the same screen, larger, in a side panel, as v3-soft's does. A pure function
// of t. The fares are the captures' own, read the day they were taken; nothing was booked or controlled. Its stylesheet
// (../ccact.5204eced.css) loads with the module, after the sheets it builds on.
import { seg, outCubic, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { EXPAND, loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { shareBtn } from './share.29a362ea.js';
import { TOP, screenHtml, bindScreen, paintScreen, pictures } from './ccact-screen.5204eced.js?v=1';
import { LOOKS, railHtml, bindRail } from './ccact-hud.5204eced.js?v=2';

export const ASK = 'Keep checking flight sites for the cheapest flight from Denver to Tokyo, Dec 10 to 20';
export const TYPE_CPS = 55; // the ask's typing rate (chat.9b47fc30.js typing)
export const LEN = 22.4; // the reply to the loop's end: two loops, three check-ins and the answer held to read
const SAY = 'On it. I’ll loop through Google Flights, Kayak and momondo and keep the cheapest Denver to Tokyo round trip for Dec 10 to 20.';
// the user's check-ins, typed into the composer while superbot works, and superbot's answers in the thread
const ASKS = ['any updates?', 'only nonstop flights please', "what's the best so far?"];
const REPLIES = [
  'Loop 1, two of three sites done. Cheapest so far is $1,155 round trip on Kayak, 1 stop in LA. momondo is next.',
  'Got it, nonstop only. Starting loop 2: Google Flights again, then momondo and Kayak with the Nonstop filter on.',
  'Loop 2, two of three sites done. Best nonstop so far is $1,497 on ANA, found on momondo. Checking Kayak to confirm.',
  'Done. Cheapest nonstop is $1,497 round trip on ANA, Denver to Tokyo Narita, Dec 10 to 20, on momondo and Kayak. Want me to book it, or keep looping for a drop?',
];
const FIT = 560 / 1470; // the card's view (the bakery frame's 560x350), as v3-soft fits its desktop
const FIT_BIG = 688 / 1470; // the Expand panel's view (.cc3-big)
const CLOSE = '<svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
const SHEETS = [
  new URL('../computer.ba3976b6.css?v=11', import.meta.url).href,
  new URL('../computer-progress.a05be571.css?v=1', import.meta.url).href,
  new URL('../flights.92b9b0b0.css?v=1', import.meta.url).href,
  new URL('../ccact.5204eced.css?v=3', import.meta.url).href,
];

// the sheets this cut builds on are loaded by their own beats when they build; load any not there yet, then this one's
function loadSheets() {
  for (const href of SHEETS) {
    if (document.querySelector(`link[href="${href}"]`)) continue;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    track(new Promise((done) => {
      link.onload = done;
      link.onerror = () => { console.error(new Error(`activity-rail loop stylesheet failed to load: ${href}`)); done(); };
    }));
    document.head.appendChild(link);
  }
}

// a spot on a results page, in the desktop's px once the page has scrolled by `by`
const on = (x, y, by) => ({ x, y: TOP + y - by });
// the screen's script on the beat's clock (o: seconds after the reply to spot time): the tabs superbot opens, which is
// active, the page each shows, the omnibox, the scrolls, the reloads and the cursor's moves. Loop 1 is the first visit to
// each site; loop 2 goes back to each tab
function script(o) {
  const GF = 'google.com/travel/flights/search?q=Denver+to+Tokyo+Dec+10-20';
  const KY = 'kayak.com/flights/DEN-TYO/2026-12-10/2026-12-20', MO = 'momondo.com/flight-search/DEN-TYO/2026-12-10/2026-12-20';
  const moves = [
    // loop 1: a new tab per site, then the cheapest fare on its results
    [0.95, 1.55, { at: 'plus', n: 1 }], [3.15, 3.7, on(1150, 432, 150)],
    [4.4, 4.95, { at: 'plus', n: 2 }], [6.5, 7.05, on(985, 446, 90)],
    [7.8, 8.35, { at: 'plus', n: 3 }], [9.8, 10.35, on(985, 445, 90)],
    // loop 2: back to Google Flights and reload it, then momondo's and Kayak's Nonstop boxes and their nonstop fares
    [11.5, 12.0, { at: 'tab', i: 1 }], [12.25, 12.7, { at: 'reload' }], [13.35, 13.85, on(1150, 432, 150)],
    [14.3, 14.8, { at: 'tab', i: 3 }], [15.0, 15.5, on(138, 643, 90)], [15.8, 16.3, on(985, 458, 90)],
    [16.8, 17.3, { at: 'tab', i: 2 }], [17.5, 18.0, on(138, 645, 90)], [18.3, 18.8, on(985, 458, 90)],
  ];
  return {
    rest: { x: 1010, y: 640 },
    moves: moves.map(([a, b, k]) => [o(a), o(b), k]),
    reloads: [o(12.75)],
    // each tab opens 0.08 s after its click; its page loads between each `loads` window (the first its first paint)
    tabs: [
      { fav: 'flights.92b9b0b0/fav-gflights.png', title: 'Denver to Tokyo | Google Flights', open: o(1.73), loads: [[o(2.55), o(2.9)], [o(12.8), o(13.25)]] },
      { fav: 'flights.92b9b0b0/fav-kayak.png', title: 'DEN to TYO, 12/10 to 12/20', open: o(5.08), loads: [[o(6.0), o(6.3)]] },
      { fav: 'flights.92b9b0b0/fav-momondo.png', title: 'DEN to TYO, 12/10 to 12/20', open: o(8.48), loads: [[o(9.3), o(9.55)]] },
    ],
    active: [[-1, 0], [o(1.73), 1], [o(5.08), 2], [o(8.48), 3], [o(12.1), 1], [o(14.9), 3], [o(17.4), 2]],
    pages: [[-1, 'home'], [o(1.73), 'ntp'], [o(2.85), 'gf'], [o(5.08), 'ntp'], [o(6.25), 'ky'], [o(8.48), 'ntp'], [o(9.5), 'mo'], [o(12.1), 'gf'], [o(14.9), 'mo'], [o(15.7), 'mon'], [o(17.4), 'ky'], [o(18.2), 'kyn']],
    scroll: { gf: [[o(3.05), o(3.6), 0, 150]], ky: [[o(6.45), o(6.9), 0, 90]], mo: [[o(9.7), o(10.15), 0, 90]], mon: [[0, 0, 90, 90]], kyn: [[0, 0, 90, 90]] },
    omni: [
      { t: -1, mode: 'url', text: 'superbot.gg' },
      { t: o(1.73), mode: 'edit', text: 'google.com/travel/flights', a: o(1.9), b: o(2.45) },
      { t: o(2.55), mode: 'url', text: GF },
      { t: o(5.08), mode: 'edit', text: KY, a: o(5.25), b: o(5.9) },
      { t: o(6.0), mode: 'url', text: `${KY}?sort=price_a` },
      { t: o(8.48), mode: 'edit', text: MO, a: o(8.65), b: o(9.25) },
      { t: o(9.3), mode: 'url', text: `${MO}?sort=price_a` },
      { t: o(12.1), mode: 'url', text: GF },
      { t: o(14.9), mode: 'url', text: `${MO}?sort=price_a` },
      { t: o(15.7), mode: 'url', text: `${MO}?sort=price_a&fs=stops=0` },
      { t: o(17.4), mode: 'url', text: `${KY}?sort=price_a` },
      { t: o(18.2), mode: 'url', text: `${KY}?sort=price_a&fs=stops=0` },
    ],
  };
}

// `end` is the route's end (chat.9b47fc30.js routeBy, base end plus extra), so the run length is the router's call
function times(r, end = r + LEN) {
  const o = (s) => r + s;
  const T = { r, card: o(0.22), take: o(0.62), end };
  // the plan's steps as superbot starts each (ccact-hud.5204eced.js TASKS), then done; loop 2 starts at the seventh
  T.tasks = [0.8, 2.95, 4.35, 6.4, 7.75, 9.65, 11.45, 13.35, 14.3, 16.75].map(o);
  T.done = o(19.25);
  T.news = [3.95, 7.3, 10.5, 13.95, 16.45, 18.95].map(o); // the topline as each fare is read (ccact-hud.5204eced.js NEWS)
  // the rail's rows as each lands (ccact-hud.5204eced.js ACTS)
  T.acts = [0.62, 1.73, 3.95, 5.08, 6.9, 7.3, 8.48, 10.5, 10.9, 11.45, 12.75, 13.95, 15.6, 16.05, 16.45, 18.1, 19.25].map(o);
  T.asks = [
    { text: ASKS[0], s: o(6.2), typeEnd: o(6.75), send: o(6.9) },
    { text: ASKS[1], s: o(9.9), typeEnd: o(10.75), send: o(10.9) },
    { text: ASKS[2], s: o(15.15), typeEnd: o(15.9), send: o(16.05) },
  ];
  T.replies = [o(7.4), o(11.35), o(16.6), o(19.45)];
  T.S = script(o);
  return T;
}

// a row that joins the thread above the docked frame: it opens from nothing (its height and the thread's 12px gap
// after it, chat.css .feed-in) as it fades up, so the frame below never moves and the thread above rises. The rows and
// the dock share one feed item (.cxa-thread), since a grid keeps its gap beside a row of no height
function grow(n, t, a) {
  const p = outCubic(seg(t, a, a + 0.42));
  n.style.opacity = p.toFixed(3);
  n.style.height = p >= 1 ? '' : `${(n.scrollHeight * p).toFixed(2)}px`;
  n.style.marginBottom = `${(12 * p).toFixed(2)}px`;
  n.style.transform = p >= 1 ? 'none' : `translateY(${((1 - p) * 8).toFixed(2)}px)`;
}
// superbot's line, streamed in; the rest of it laid out unseen, so the row's height is the whole line's from the start
const sayHtml = (x, s, cls = '') => `<div class="qc-say ${cls}"><span class="qc-vis"></span><span class="qc-hid">${x.esc(s)}</span></div>`;
function streamer(node, s) {
  const vis = node.firstElementChild, hid = node.lastElementChild;
  let shown = -1;
  return (t, a) => { const n = streamCount(s, a + 0.06, 70, t); if (n !== shown) { vis.textContent = s.slice(0, n); hid.textContent = s.slice(n); shown = n; } };
}

function build(k, x, look) {
  loadFrameSheet();
  loadSheets();
  const T = k.T, S = T.S;
  const sb = x.tile('superbot', 'cc3-sb');
  const say = x.el(sayHtml(x, SAY));
  const sayAt = streamer(say, SAY);
  const block = x.el(`<div class="bk cc3 cxa">
    <div class="bk-head">
      <b class="bk-title">Your computer<small>Live view</small></b>
      ${shareBtn('Computer control')}
      ${EXPAND}
      <span class="bk-btn bk-publish cc3-stop"><i></i>Stop</span>
    </div>
    <div class="bk-view cc3-screen">${screenHtml(x, sb, S, FIT, look)}</div>
  </div>`);
  const card = bindScreen(block, look);
  const rail = x.el(railHtml(look.rail, !!look.news));
  const railAt = bindRail(rail);

  // the thread after the reply: each check-in, superbot's answer to it, the final answer, then the docked frame with its
  // rail beside it
  const userRow = (s) => x.el(`<div class="msg qc-u cxa-row"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(s)}</div></div></div>`);
  const sbRow = (s) => x.el(`<div class="msg qc-m qc-r cxa-row">${x.sbAvatar}<div class="m-main">${sayHtml(x, s, 'cxa-say')}</div></div>`);
  const rows = [
    [userRow(ASKS[0]), T.asks[0].send], [sbRow(REPLIES[0]), T.replies[0]],
    [userRow(ASKS[1]), T.asks[1].send], [sbRow(REPLIES[1]), T.replies[1]],
    [userRow(ASKS[2]), T.asks[2].send], [sbRow(REPLIES[2]), T.replies[2]],
    [sbRow(REPLIES[3]), T.replies[3]],
  ];
  const streams = rows.map(([n]) => n.querySelector('.qc-say')).map((n) => n && streamer(n, n.textContent));
  const dock = x.el(`<div class="msg qc-m qc-r cxa-dock">${x.sbAvatar}<div class="m-main"><div class="cxa-pair cxa-pair-${look.rail}"></div></div></div>`);
  dock.querySelector('.cxa-pair').append(block, rail);
  const thread = x.el('<div class="cxa-thread"></div>');
  thread.append(...rows.map(([n]) => n), dock);

  // Expand: a side panel on the right of the app (the hub) with the same screen share, larger, as v3-soft's. Built the
  // first time it opens; while open it is painted with the card, from the same t
  const expand = block.querySelector('.bk-expand');
  expand.setAttribute('role', 'button');
  expand.setAttribute('tabindex', '0');
  expand.setAttribute('aria-expanded', 'false');
  let side = null, big = null, open = false;
  const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
  function setOpen(want) {
    if (want === open) return;
    if (want && !side) {
      side = x.el(`<aside class="cc3-side cxa" aria-label="Your computer, live view">
        <div class="bk-head">
          <b class="bk-title">Your computer<small>Live view</small></b>
          <span class="bk-btn bk-publish cc3-stop"><i></i>Stop</span>
          <button class="cc3-side-x" type="button" aria-label="Close">${CLOSE}</button>
        </div>
        <div class="cc3-screen cc3-big">${screenHtml(x, sb, S, FIT_BIG, look)}</div>
      </aside>`);
      block.closest('.hub').appendChild(side);
      big = bindScreen(side, look);
      side.querySelector('.cc3-side-x').addEventListener('click', () => setOpen(false));
      // keys on the panel's buttons are theirs, not the spot clock's (space would pause it)
      side.addEventListener('keydown', (e) => { if (e.target.closest('button')) e.stopPropagation(); });
      side.getBoundingClientRect(); // lay it out closed first, so the first open slides in
    }
    open = want;
    side.classList.toggle('is-open', want);
    expand.setAttribute('aria-expanded', String(want));
    if (want) addEventListener('keydown', onKey); else removeEventListener('keydown', onKey);
  }
  expand.addEventListener('click', () => setOpen(!open));
  expand.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  });
  addEventListener('variantchange', () => setOpen(false));

  let placed = false, decoding = false;
  return {
    nodes: [say, thread],
    // the feed glides to the reply, then to the docked frame's foot, and stays on it: every later row opens above it
    marks: [[T.r, say], [T.card, dock]],
    // the check-ins, typed into the composer and sent by the engine (renderComposer)
    asks: T.asks,
    render(t) {
      if (!placed) {
        // the rows and the dock leave the engine's reply for the feed, right after it
        say.closest('.msg').after(thread);
        placed = true;
      }
      // a frozen frame waits on every capture; decode() only works once the nodes have left the template's inert
      // document, which they have by the first render
      if (!decoding) {
        decoding = true;
        for (const pic of pictures(card)) track(pic.decode().catch((e) => console.error(new Error(`activity-rail loop capture failed to decode: ${pic.src}`, { cause: e }))));
      }
      sayAt(t, T.r);
      rows.forEach(([n, a], i) => { grow(n, t, a); if (streams[i]) streams[i](t, a); });
      const ci = outCubic(seg(t, T.card, T.card + 0.45));
      dock.style.opacity = '1';
      block.style.opacity = ci.toFixed(3);
      block.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${(0.96 + 0.04 * ci).toFixed(4)})`;
      paintScreen(card, S, T, t);
      railAt(T, t, outCubic(seg(t, T.take, T.take + 0.45)));
      // the panel belongs to the card: a restart that takes the card away closes it
      if (open && t < T.card) setOpen(false);
      if (open) paintScreen(big, S, T, t);
    },
  };
}

// each look as a beat on this cut's clock
const cut = (look) => ({ times, build: (k, x) => build(k, x, look) });
export const CUTS = {
  'cc-activity-edge': cut(LOOKS.edge),
  'cc-activity-footer': cut(LOOKS.footer),
  'cc-activity-header': cut(LOOKS.header),
  'cc-activity-news-rail': cut(LOOKS.newsRail),
  'cc-activity-news-left': cut(LOOKS.newsLeft),
  'cc-activity-news-footer': cut(LOOKS.newsFooter),
};
