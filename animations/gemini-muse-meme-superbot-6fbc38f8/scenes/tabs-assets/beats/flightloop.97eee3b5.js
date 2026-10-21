// Flight-loop cuts ('flight-loop-<look>-97eee3b5'): the computer-control-v3-soft live view (computer.ba3976b6.js: the
// Your computer frame with Share, Expand and Stop, the pink and purple takeover vignette, the "superbot is controlling
// your computer" pill, Chrome full screen on a 1470x919 desktop scaled into the view) on a longer job. Asked "Take control
// of my computer and find me the cheapest flight from Denver to Tokyo, Dec 18 to Jan 2", superbot loops: it opens Google
// Flights, Kayak, Skyscanner and Expedia in new tabs, sorts each by price and reads the cheapest fare (its overlay rings
// the row), then cycles back through the tabs as the user changes the ask. While it works the user types into the
// composer: an update request ("how's it going?"), a change of plan ("skip basic economy, I need a carry on": the basic
// fare drops out and two sites are rechecked) and a new date ("also try Dec 19": two more checks, so the bar's total
// grows). Each message and superbot's answer grow into the thread ABOVE the live view, which stays docked at the bottom of
// the chat, right over the composer. The frame carries superbot's progress, placed per look (LOOKS): the running task top
// right (or in the header) and a bar inside the frame (its top or bottom edge, the header's edge, the pill, a footer);
// the news looks add the topline, the cheapest fare so far, rolling to each new low. The pages are drawn here, not
// captured: each site's results as plain text in its own colours, no logos; airlines by IATA code; the fares are
// illustrative. A pure function of t: every value is set from t, so frozen frames (?t=) hold. Its stylesheet
// (../flightloop.97eee3b5.css) loads with the module, beside computer.ba3976b6.css, whose cc3-* classes it reuses.
import { lerp, seg, outCubic, outBack, path, press, blink, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { EXPAND, loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { shareBtn } from './share.29a362ea.js';

const SHEETS = [new URL('../computer.ba3976b6.css?v=11', import.meta.url).href, new URL('../flightloop.97eee3b5.css?v=1', import.meta.url).href];
export const ASK = 'Take control of my computer and find me the cheapest flight from Denver to Tokyo, Dec 18 to Jan 2';
export const TYPE_CPS = 90;  // the ask types at this rate (the route's typeCps, chat.9b47fc30.js)
const FOLLOW_CPS = 38;       // the follow-ups type at a person's pace
const SAY_CPS = 70;          // superbot's lines stream at the engine's rate
const SAY0 = 'On it. I’ll loop through the booking sites and keep the cheapest fare.';
const FOLLOW = [
  { ask: "how's it going?", say: '2 of 4 sites done. Cheapest so far is $1,092 round trip on Kayak, ANA with 1 stop.' },
  { ask: 'skip basic economy, I need a carry on', say: 'Got it. The $1,064 fare was basic economy, so I dropped it. Best with a carry on is $1,092 on Kayak. Rechecking Skyscanner and Expedia.' },
  { ask: 'also try Dec 19, I can leave a day later', say: 'Adding Dec 19. Checking it on Google Flights and Kayak.' },
];
const SAY_DONE = 'Done. Cheapest with a carry on is $1,027 round trip on Kayak: ANA, Dec 19 to Jan 2, 1 stop. Want me to book it?';

const DESK = { w: 1470, h: 919 }; // the desktop in its own px (computer.ba3976b6.css .cc3-desk)
const FIT = 560 / DESK.w, FIT_BIG = 688 / DESK.w; // the card's view and the Expand panel's (.cc3-big)
const TAB_W = 240, PLUS_GAP = 8, PLUS = 28; // Chrome's widest tab, the new-tab button's margin and size (.cc3-tab, .cc3-plus)
const TIP = { x: 4, y: 2.5 }; // the arrow's hotspot in its 24px box
const REST = { x: 1010, y: 640 }, AWAY = { x: 1160, y: 560 }; // the cursor before superbot moves it, and once it is done
const SHOT = { home: 'computer.ba3976b6/superbot-home.png', ntp: 'computer.ba3976b6/new-tab.png' };
const PAGE = { w: 1470, h: 839 };
const HOME_TITLE = 'the AI plans you pay for, in one app';
const ARROW = 'M4 2.5 4 19.5 8.6 15.3 11.5 21.8 14.4 20.5 11.6 14.2 17.8 14.2Z';
const ICON = {
  x: '<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>',
  plus: '<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',
  back: '<svg viewBox="0 0 16 16"><path d="M13 8H3M7 4L3 8l4 4"/></svg>',
  fwd: '<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  reload: '<svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 3v3h-3"/></svg>',
  tune: '<svg viewBox="0 0 16 16"><path d="M3 5h5.5M12.5 5H13M3 11h.5M7.5 11H13"/><circle cx="10.5" cy="5" r="1.6"/><circle cx="5.5" cy="11" r="1.6"/></svg>',
  search: '<svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>',
  more: '<svg viewBox="0 0 16 16"><path d="M8 3.5h.01M8 8h.01M8 12.5h.01"/></svg>',
  close: '<svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
  ok: '<svg viewBox="0 0 16 16"><path d="M4 8.4l2.6 2.6L12 5.6"/></svg>',
};

// the booking sites, in the order superbot opens them (tab = index + 1): name as plain text, a lettered favicon, the
// page's colours, and the address each check loads (`d`: December's departure day, `nb`: basic economy filtered out)
const SITES = [
  { name: 'Google Flights', letter: 'G', fav: '#1a73e8', title: 'Denver to Tokyo | Google Flights', head: '#ffffff', band: '#f8f9fa', ink: '#202124', muted: '#5f6368', acc: '#1a73e8', goInk: '#ffffff', bg: '#ffffff',
    url: (d, nb) => ['google.com', `/travel/flights?q=flights%20DEN%20to%20TYO%202026-12-${d}%20to%202027-01-02${nb ? '%20no%20basic' : ''}`] },
  { name: 'Kayak', letter: 'K', fav: '#ff690f', title: 'DEN to TYO flights | KAYAK', head: '#ffffff', band: '#f2f2f2', ink: '#212121', muted: '#5b5b5b', acc: '#ff690f', goInk: '#ffffff', bg: '#f2f2f2',
    url: (d, nb) => ['kayak.com', `/flights/DEN-TYO/2026-12-${d}/2027-01-02?sort=price_a${nb ? '&fs=fareclass=-basic' : ''}`] },
  { name: 'Skyscanner', letter: 'S', fav: '#0062e3', title: 'Cheap flights from Denver to Tokyo | Skyscanner', head: '#05203c', band: '#05203c', ink: '#ffffff', muted: '#c2c9cd', acc: '#0062e3', goInk: '#ffffff', bg: '#eff3f8',
    url: (d, nb) => ['skyscanner.com', `/transport/flights/den/tyoa/2612${d}/270102/?sortby=cheapest${nb ? '&fare=standard' : ''}`] },
  { name: 'Expedia', letter: 'E', fav: '#191e3b', title: 'DEN to TYO flights | Expedia', head: '#191e3b', band: '#f3f3f5', ink: '#ffffff', muted: '#c7c9d9', acc: '#fddb32', goInk: '#191e3b', bg: '#f3f3f5',
    url: (d, nb) => ['expedia.com', `/Flights-Search?leg1=from:DEN,to:TYO,departure:12/${d}/2026&sort=PRICE_INCREASING${nb ? '&filters=nobasic' : ''}`] },
];
// the airlines on the results: departure and journey length in minutes, the stop, the Tokyo airport, the badge colour
const AIR = {
  UA: { name: 'United', dep: 675, dur: 925, via: 'SFO', to: 'NRT', color: '#1d4f91' },
  NH: { name: 'ANA', dep: 580, dur: 985, via: 'LAX', to: 'HND', color: '#13448f' },
  DL: { name: 'Delta', dep: 420, dur: 935, via: 'SEA', to: 'HND', color: '#c01933' },
  JL: { name: 'Japan Airlines', dep: 370, dur: 1030, via: 'LAX', to: 'HND', color: '#cc0000' },
  AA: { name: 'American', dep: 390, dur: 1125, via: 'DFW', to: 'HND', color: '#0078d2' },
  AC: { name: 'Air Canada', dep: 485, dur: 925, via: 'YVR', to: 'NRT', color: '#d22630' },
};
const TZ = 16 * 60; // Tokyo runs 16 hours ahead of Denver in December
const DOW = { 18: 'Fri', 19: 'Sat' };
// every check, in order: the site, the departure day, whether basic economy is filtered out, the five fares it finds,
// cheapest first (B: basic economy), and the task line while it runs
const CHECKS = [
  { site: 0, d: 18, nb: false, task: 'Searching Google Flights', fares: 'UA 1148, NH 1212, DL 1236, JL 1305, AA 1341' },
  { site: 1, d: 18, nb: false, task: 'Searching Kayak', fares: 'NH 1092, UA 1151, AC 1166, DL 1238, JL 1299' },
  { site: 2, d: 18, nb: false, task: 'Searching Skyscanner', fares: 'AC 1064 B, NH 1095, UA 1149, DL 1231, AA 1336' },
  { site: 3, d: 18, nb: false, task: 'Searching Expedia', fares: 'UA 1071 B, AC 1076 B, NH 1099, DL 1240, JL 1302' },
  { site: 2, d: 18, nb: true, task: 'Rechecking Skyscanner', fares: 'NH 1095, UA 1149, DL 1231, AA 1336, JL 1340' },
  { site: 3, d: 18, nb: true, task: 'Rechecking Expedia', fares: 'NH 1099, DL 1240, JL 1302, UA 1318, AA 1344' },
  { site: 0, d: 19, nb: true, task: 'Dec 19 on Google Flights', fares: 'UA 1041, NH 1068, DL 1130, JL 1214, AA 1290' },
  { site: 1, d: 19, nb: true, task: 'Dec 19 on Kayak', fares: 'NH 1027, UA 1046, AC 1101, DL 1139, JL 1225' },
].map((c) => ({ ...c, fares: c.fares.split(', ').map((f) => { const [code, price, b] = f.split(' '); return { code, price: +price, basic: b === 'B' }; }) }));
// a check's moments from its start: the tab click, the Enter (or the filter or date click), the sort click, the fares
// landing, the cheapest read; the next check starts VIS in
const VIS = 1.95;
const AT = { click: 0.3, act: 0.72, sort: 1.1, rows: 1.15, read: 1.65 };
const ROW_STAGGER = 0.06, ROW_IN = 0.2;

const money = (n) => `$${n.toLocaleString('en-US')}`;
const clockOf = (m) => { const h = Math.floor(m / 60) % 24, mm = m % 60, d = Math.floor(m / 1440); return `${h % 12 || 12}:${String(mm).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}${d ? `<sup>+${d}</sup>` : ''}`; };
const span = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;

// a follow-up's moments: it types from s, is sent, and superbot answers no sooner than `after`
function follow(i, s, after = 0) {
  const f = FOLLOW[i], typeEnd = s + f.ask.length / FOLLOW_CPS, send = typeEnd + 0.12;
  return { ...f, s, typeEnd, send, r: Math.max(send + 0.5, after) };
}

// the cheapest fare superbot knows of at each moment it learns one, under the ask as it stands then: the topline's values
function newsOf(T) {
  const seen = [], out = [];
  const best = (nb) => seen.filter((f) => !(nb && f.basic)).reduce((a, f) => (!a || f.price < a.price ? f : a), null);
  const push = (at, nb) => {
    const f = best(nb), last = out[out.length - 1];
    if (!f || (last && last.f === f)) return;
    const d = last ? f.price - last.f.price : 0;
    out.push({ at, f, up: d > 0, tag: d ? `${d < 0 ? '↓' : '↑'} ${money(Math.abs(d))}` : '' });
  };
  const steps = [...T.checks.map((c) => ({ at: c.read, c })), { at: T.fu[1].r + 0.6, nb: true }].sort((a, b) => a.at - b.at);
  for (const st of steps) {
    if (st.c) { seen.push(...st.c.fares.map((f) => ({ ...f, site: st.c.site, d: st.c.d }))); push(st.at, st.c.nb); } else push(st.at, true);
  }
  return out.map((n) => {
    const a = AIR[n.f.code], on = `on ${SITES[n.f.site].name}`, day = n.f.d === 19 ? ', Dec 19' : '';
    return { at: n.at, tag: n.tag, up: n.up, price: money(n.f.price), short: on, mid: `${a.name} ${on}${day}`, long: `${a.name}, 1 stop, ${on}${day}` };
  });
}

// every time in the cut, from the reply r
function plan(r) {
  const T = { r, card: r + 0.22, take: r + 0.62, hud: r + 0.75, checks: [], fu: [] };
  const check = (i, a) => {
    const c = CHECKS[i], prev = [...T.checks].reverse().find((p) => p.site === c.site) || null;
    const k = { ...c, i, slot: c.site + 1, a, prev, how: !prev ? 'new' : prev.d !== c.d ? 'date' : 'filter', end: a + VIS };
    for (const [key, d] of Object.entries(AT)) k[key] = a + d;
    T.checks.push(k);
    return k;
  };
  check(0, r + 1.0); check(1, T.checks[0].end);
  T.fu.push(follow(0, T.checks[1].read + 0.15));
  check(2, T.checks[1].end); check(3, T.checks[2].end);
  T.fu.push(follow(1, T.checks[3].a + 0.2, T.checks[3].read + 0.1));
  check(4, T.fu[1].r + 0.9); check(5, T.checks[4].end);
  T.fu.push(follow(2, T.checks[5].a + 0.05, T.checks[5].read + 0.1));
  check(6, T.fu[2].r + 0.6); check(7, T.checks[6].end);
  const last = T.checks[7];
  T.done = last.read + 0.1;
  T.final = last.read + 0.3;
  T.end = T.final + SAY_DONE.length / SAY_CPS + 2.4;
  // the checks planned: four, then two rechecks once basic economy is out, then two more for Dec 19
  T.planned = [{ at: -Infinity, n: 4 }, { at: T.fu[1].send + 0.3, n: 6 }, { at: T.fu[2].send + 0.3, n: 8 }];
  T.tasks = [{ at: T.take + 0.1, label: 'Taking control' }, ...T.checks.map((c) => ({ at: c.a, label: c.task })),
    { at: T.checks[3].read + 0.05, label: 'Updating the search' }, { at: T.checks[5].read + 0.05, label: 'Adding Dec 19' },
    { at: T.done, label: 'Found the cheapest fare', done: true }].sort((a, b) => a.at - b.at);
  T.news = newsOf(T);
  return T;
}
export const LEN = plan(0).end;
const LABELS = [...new Set(plan(0).tasks.map((k) => k.label))];
const NEWS0 = plan(0).news;

let loaded = false;
function loadSheets() {
  if (loaded) return;
  loaded = true;
  for (const href of SHEETS) {
    const sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = href;
    track(new Promise((done) => {
      sheet.onload = done;
      sheet.onerror = () => { console.error(new Error(`flight-loop stylesheet failed to load: ${href}`)); done(); };
    }));
    document.head.appendChild(sheet);
  }
}

// ---------- markup ----------
function pageHtml(x, s) {
  const vars = `--head:${s.head};--band:${s.band};--ink:${s.ink};--muted:${s.muted};--acc:${s.acc};--go-ink:${s.goInk};--bg:${s.bg}`;
  const row = '<div class="ccl-row"><div class="ccl-rc"></div><i class="ccl-sk"></i><i class="ccl-ring"></i></div>';
  return `<div class="ccl-page" style="${vars}">
    <div class="ccl-pb"><b class="ccl-pname">${x.esc(s.name)}</b><span>Flights</span><span>Hotels</span><span>Cars</span><span class="ccl-psign">Sign in</span></div>
    <div class="ccl-form"><span class="ccl-f ccl-f-from">Denver (DEN)</span><span class="ccl-f ccl-f-to">Tokyo (TYO)</span><span class="ccl-f ccl-f-d1"></span><span class="ccl-f ccl-f-d2">Sat, Jan 2</span><span class="ccl-f ccl-f-pax">1 adult, Economy</span><span class="ccl-go">Search</span></div>
    <div class="ccl-tools"><span class="ccl-fc">Stops</span><span class="ccl-fc">Airlines</span><span class="ccl-fc">Bags</span><span class="ccl-fc">Times</span><span class="ccl-fc ccl-nb">No basic economy</span>
      <span class="ccl-sort"><span class="ccl-so ccl-best">Best</span><span class="ccl-so ccl-cheap">Cheapest</span><span class="ccl-so">Fastest</span></span></div>
    <div class="ccl-rows">${row.repeat(5)}</div>
  </div>`;
}
function fareHtml(x, f) {
  const a = AIR[f.code];
  return `<i class="ccl-badge" style="--al:${a.color}">${f.code}</i>
    <span><b>${clockOf(a.dep)}<i class="ccl-dash"></i>${clockOf(a.dep + a.dur + TZ)}</b><small>${x.esc(a.name)}</small></span>
    <span><b>${span(a.dur)}</b><small>DEN to ${a.to}</small></span>
    <span><b>1 stop</b><small>${a.via}</small></span>
    <span class="ccl-ft${f.basic ? ' ccl-basic' : ''}">${f.basic ? 'Basic Economy' : 'Economy'}</span>
    <span class="ccl-pr"><b>${money(f.price)}</b><small>round trip</small></span>`;
}
// the shared screen: Chrome (superbot.gg's tab, then one per site), the screen's own cursor
function deskHtml(x, sb, fit) {
  const tabs = SITES.map((s) => `<span class="cc3-tab ccl-tab"><i class="cc3-bg"></i><span class="ccl-fv" style="background:${s.fav}">${s.letter}<i class="ccl-fspin"></i></span><span class="cc3-tt"></span><span class="cc3-x">${ICON.x}</span></span>`).join('');
  return `<div class="cc3-desk" style="transform: scale(${fit.toFixed(5)})">
    <div class="cc3-win">
      <div class="cc3-strip">
        <span class="cc3-lights"><i></i><i></i><i></i></span>
        <span class="cc3-tab ccl-t0"><i class="cc3-bg"></i><span class="cc3-fav">${sb}</span><span class="cc3-tt">${x.esc(HOME_TITLE)}</span><span class="cc3-x">${ICON.x}</span></span>${tabs}
        <span class="cc3-plus">${ICON.plus}</span>
      </div>
      <div class="cc3-bar">
        <span class="cc3-ic">${ICON.back}</span><span class="cc3-ic cc3-dim">${ICON.fwd}</span><span class="cc3-ic">${ICON.reload}</span>
        <span class="cc3-omni"><span class="cc3-url ccl-url"><span class="cc3-ic ccl-ui"></span><span class="ccl-host"></span><span class="ccl-rest"></span><i class="cc3-caret"></i><span class="cc3-ph">Search Google or type a URL</span></span></span>
        <i class="cc3-me"></i><span class="cc3-ic">${ICON.more}</span>
      </div>
      <img class="ccl-shot ccl-home" src="${x.img(SHOT.home)}" width="${PAGE.w}" height="${PAGE.h}" alt="superbot.gg: the agent to manage your agents.">
      <img class="ccl-shot ccl-ntp" src="${x.img(SHOT.ntp)}" width="${PAGE.w}" height="${PAGE.h}" alt="Chrome New Tab page">
      ${SITES.map((s) => pageHtml(x, s)).join('')}
    </div>
    <svg class="cc3-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="${ARROW}"/></svg>
  </div>`;
}
// the heads-up pieces a look places: in the header, over the view, under it
function partsOf(x, sb, look, fit) {
  const task = (count) => `<span class="ccl-st"><i class="ccl-spin"></i><i class="ccl-ok">${ICON.ok}</i></span><span class="ccl-lbl ccl-tl">${LABELS.map((l) => `<span>${x.esc(l)}</span>`).join('')}</span>${count ? '<b class="ccl-n"></b>' : ''}`;
  const details = (key) => [...new Set(['Searching fares', ...NEWS0.map((n) => n[key])])];
  const news = (lead, key) => `<span class="ccl-nl">${lead}</span><span class="ccl-nv"><span class="ccl-roll"><span class="ccl-ra"></span><span class="ccl-rb"></span></span><span class="ccl-lbl ccl-nd" data-key="${key}">${details(key).map((d) => `<span>${x.esc(d)}</span>`).join('')}</span><span class="ccl-delta"></span></span>`;
  const bar = (where) => `<i class="ccl-bar ccl-bar-${where}"><i class="ccl-fill"></i></i>`;
  const head = (look.news === 'head' ? `<span class="ccl-news ccl-news-head">${news('Cheapest', 'short')}</span>` : '')
    + (look.task === 'head' ? `<span class="ccl-task ccl-task-head">${task(true)}</span>` : '');
  const view = `${deskHtml(x, sb, fit)}
    <i class="cc3-edge"><i class="cc3-soft"><i class="cc3-band"></i></i></i>
    <span class="cc3-pill">${sb}<span>superbot is controlling your computer</span>${look.bar === 'pill' ? `<b class="ccl-n"></b>${bar('pill')}` : ''}</span>
    ${look.task === 'chip' ? `<span class="ccl-glass ccl-task ccl-task-chip">${task(look.bar !== 'pill')}</span>` : ''}
    ${look.news === 'corner' ? `<span class="ccl-glass ccl-news ccl-news-corner">${news('Cheapest so far', 'mid')}</span>` : ''}
    ${look.bar === 'top' || look.bar === 'bottom' ? bar(look.bar) : ''}`;
  const foot = look.news === 'foot' ? `<div class="ccl-foot">${bar('foot')}<span class="ccl-news">${news('Cheapest so far', 'long')}</span><b class="ccl-n"></b></div>` : '';
  return { head, headBar: look.bar === 'head' ? bar('head') : '', view, foot };
}

// ---------- one view: the card's, or the Expand panel's ----------
function bindView(root) {
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const tabs = [$('.ccl-t0'), ...$$('.ccl-tab')];
  const swap = (cell) => cell && { cell, items: [...cell.children] };
  const newsEl = $('.ccl-news');
  return {
    desk: $('.cc3-desk'), tabs, bgs: tabs.map((n) => n.querySelector('.cc3-bg')), titles: tabs.map((n) => n.querySelector('.cc3-tt')),
    spins: tabs.map((n) => n.querySelector('.ccl-fspin')), favs: tabs.map((n) => n.querySelector('.ccl-fv')), plus: $('.cc3-plus'),
    omni: $('.cc3-omni'), ui: $('.ccl-ui'), host: $('.ccl-host'), rest: $('.ccl-rest'), caret: $('.ccl-url .cc3-caret'), ph: $('.ccl-url .cc3-ph'),
    home: $('.ccl-home'), ntp: $('.ccl-ntp'), cursor: $('.cc3-cursor'), edge: $('.cc3-edge'), soft: $('.cc3-soft'), pill: $('.cc3-pill'),
    pages: $$('.ccl-page').map((el) => ({ el, d1: el.querySelector('.ccl-f-d1'), nb: el.querySelector('.ccl-nb'), best: el.querySelector('.ccl-best'), cheap: el.querySelector('.ccl-cheap'),
      rows: [...el.querySelectorAll('.ccl-row')].map((row) => ({ row, rc: row.querySelector('.ccl-rc'), sk: row.querySelector('.ccl-sk'), ring: row.querySelector('.ccl-ring') })) })),
    task: $('.ccl-task'), tl: swap($('.ccl-tl')), spin: $('.ccl-spin'), ok: $('.ccl-ok'), counts: $$('.ccl-n'), fills: $$('.ccl-fill'), fades: $$('.ccl-bar-top, .ccl-bar-bottom'),
    news: newsEl, nd: swap($('.ccl-nd')), ra: $('.ccl-ra'), rb: $('.ccl-rb'), roll: $('.ccl-roll'), delta: $('.ccl-delta'),
    memo: {},
  };
}
const put = (v, key, n, text, html = false) => { if (v.memo[key] !== text) { if (html) n.innerHTML = text; else n.textContent = text; v.memo[key] = text; } };
const fade = (n, o) => { n.style.opacity = o.toFixed(3); };

// the cursor's keyframes, in the desktop's px, read once off the laid-out card
function cursorPlan(v, T) {
  const off = (el) => { let x = 0, y = 0; for (let n = el; n && n !== v.desk; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; } return { x, y }; };
  const mid = (el) => { const o = off(el); return { x: o.x + el.offsetWidth / 2, y: o.y + el.offsetHeight / 2 }; };
  const t0 = off(v.tabs[0]), pg = v.pages[0], r0 = pg.rows[0].row, ro = off(r0);
  const plusAt = (s) => ({ x: t0.x + s * TAB_W + PLUS_GAP + PLUS / 2, y: off(v.plus).y + PLUS / 2 });
  const tabAt = (s) => ({ x: t0.x + s * TAB_W + TAB_W / 2, y: t0.y + v.tabs[0].offsetHeight / 2 });
  const cheap = mid(pg.cheap), nb = mid(pg.nb), d1 = mid(pg.d1), fare = { x: ro.x + r0.offsetWidth - 120, y: ro.y + r0.offsetHeight / 2 };
  const keys = [{ t: 0, ...REST }];
  let at = REST;
  for (const c of T.checks) {
    keys.push({ t: c.a, ...at });
    if (c.how === 'new') {
      const p = plusAt(c.slot);
      keys.push({ t: c.click - 0.02, ...p }, { t: c.act + 0.06, ...p }, { t: c.sort - 0.02, ...cheap }, { t: c.rows + 0.12, ...cheap });
    } else {
      const tab = tabAt(c.slot), to = c.how === 'date' ? d1 : nb;
      keys.push({ t: c.click - 0.02, ...tab }, { t: c.click + 0.1, ...tab }, { t: c.act - 0.02, ...to }, { t: c.rows + 0.12, ...to });
    }
    keys.push({ t: c.read - 0.06, ...fare });
    at = fare;
  }
  keys.push({ t: T.done + 0.4, ...fare }, { t: T.done + 1.1, ...AWAY });
  return keys;
}

// one site's page at t: which check's fares it shows, sorted yet, loading, and superbot's ring on the cheapest
function pageAt(T, site, t) {
  let c = null;
  for (const k of T.checks) if (k.site === site && t >= k.click) c = k;
  if (!c) return null;
  if (t < c.act) return c.prev ? { c, src: c.prev, sorted: true, land: c.prev.rows, ring: 1 - seg(t, c.click, c.click + 0.2) } : { c, blank: true };
  return { c, src: c, sorted: c.prev ? true : t >= c.sort, land: c.rows, ring: outCubic(seg(t, c.read - 0.15, c.read + 0.05)) };
}

function paintPage(x, v, p, s, t) {
  const pg = v.pages[s], key = `p${s}`;
  if (!p || p.blank) return;
  put(v, `${key}d`, pg.d1, `${DOW[p.src.d]}, Dec ${p.src.d}`);
  pg.nb.classList.toggle('ccl-on', p.src.nb);
  pg.cheap.classList.toggle('ccl-on', p.sorted);
  pg.best.classList.toggle('ccl-on', !p.sorted);
  pg.d1.classList.toggle('ccl-on', p.c.how === 'date' && t >= p.c.act - 0.05 && t < p.c.act + 0.35);
  if (v.memo[`${key}f`] !== p.src.i) {
    p.src.fares.forEach((f, i) => { pg.rows[i].rc.innerHTML = fareHtml(x, f); });
    v.memo[`${key}f`] = p.src.i;
  }
  const sh = `${(100 - ((t * 140) % 200)).toFixed(1)}%`;
  pg.rows.forEach((r, i) => {
    const k = 1 - outCubic(seg(t, p.land + i * ROW_STAGGER, p.land + i * ROW_STAGGER + ROW_IN));
    fade(r.sk, k);
    if (k > 0) r.sk.style.setProperty('--sh', sh);
    fade(r.ring, i === 0 ? p.ring : 0);
  });
}

// the desktop at t: tabs, address bar, the page on show, the cursor
function paintDesk(x, v, T, t, cur) {
  let c = null;
  for (const k of T.checks) if (t >= k.click) c = k;
  const slot = c ? c.slot : 0;
  const pages = SITES.map((_, s) => pageAt(T, s, t));
  const on = c ? pages[c.site] : null;
  // tabs: each site's opens on its first check's click (the new-tab button's click), the active one white
  SITES.forEach((_, s) => {
    const first = T.checks.find((k) => k.site === s), o = outCubic(seg(t, first.click, first.click + 0.3)), i = s + 1;
    v.tabs[i].style.width = `${(TAB_W * o).toFixed(2)}px`;
    fade(v.tabs[i], o);
    const p = pages[s], fresh = p && p.blank;
    put(v, `tt${i}`, v.titles[i], fresh ? 'New Tab' : SITES[s].title);
    fade(v.favs[i], fresh ? 0 : 1);
    const loading = p && !p.blank && t >= p.c.act && t < p.c.rows + 0.3;
    fade(v.spins[i], loading ? 1 : 0);
    if (loading) v.spins[i].style.transform = `rotate(${((t * 600) % 360).toFixed(1)}deg)`;
  });
  const opened = (i) => { const k = T.checks.find((q) => q.slot === i); return outCubic(seg(t, k.click, k.click + 0.2)); };
  v.bgs.forEach((bg, i) => fade(bg, i !== slot ? 0 : i ? opened(i) : 1));
  // the new-tab button's hover circle under the cursor, darker on the press
  const nc = T.checks.filter((k) => k.how === 'new').map((k) => seg(t, k.click - 0.12, k.click) * (1 - seg(t, k.click + 0.1, k.click + 0.3)) * 0.1 + 0.1 * press(t, k.click));
  v.plus.style.background = `rgba(60,64,67,${Math.max(...nc).toFixed(3)})`;
  // the address bar: superbot.gg, then a new tab's focused box with the address typing in, then the page's address
  const typing = c && on && on.blank;
  if (!c) { put(v, 'ui', v.ui, ICON.tune, true); put(v, 'host', v.host, 'superbot.gg'); put(v, 'rest', v.rest, ''); }
  else if (typing) {
    const [h, r] = SITES[c.site].url(c.d, c.nb), full = h + r;
    const n = Math.round(full.length * seg(t, c.click + 0.08, c.act - 0.06));
    put(v, 'ui', v.ui, ICON.search, true); put(v, 'host', v.host, full.slice(0, n)); put(v, 'rest', v.rest, '');
  } else {
    const [h, r] = SITES[c.site].url(on.src.d, on.src.nb);
    put(v, 'ui', v.ui, ICON.tune, true); put(v, 'host', v.host, h); put(v, 'rest', v.rest, r);
  }
  const empty = typing && !v.host.textContent;
  v.ph.style.display = empty ? '' : 'none';
  fade(v.caret, typing && (t < c.click + 0.08 || t > c.act - 0.06 ? blink(t - c.click) : true) ? 1 : 0);
  v.caret.style.display = typing ? '' : 'none';
  v.omni.style.background = typing ? '#fff' : '';
  v.omni.style.boxShadow = typing ? 'inset 0 0 0 2px rgba(26,115,232,.9)' : '';
  // the page on show: superbot.gg, a new tab's page until the address loads, or the site
  fade(v.home, slot === 0 ? 1 : 0);
  fade(v.ntp, typing ? 1 : 0);
  pages.forEach((p, s) => { fade(v.pages[s].el, c && s === c.site && p && !p.blank ? 1 : 0); paintPage(x, v, p, s, t); });
  v.cursor.style.transform = `translate(${(cur.x - TIP.x).toFixed(2)}px, ${(cur.y - TIP.y).toFixed(2)}px)`;
}

// a changing line: every version stacked in one cell; the running one fades and rises in, the last fades out, and the
// cell's width eases from one's to the other's
function paintSwap(sw, from, to, p) {
  if (!sw) return;
  if (from === to) p = 1;
  const w = (i) => (i < 0 ? 0 : sw.items[i].offsetWidth);
  sw.items.forEach((n, i) => {
    const o = i === to ? p : i === from ? 1 - p : 0;
    n.style.opacity = o.toFixed(3);
    n.style.transform = o > 0 && o < 1 ? `translateY(${((i === to ? 1 - p : -p) * 6).toFixed(2)}px)` : 'none';
  });
  sw.cell.style.width = `${lerp(w(from), w(to), p).toFixed(2)}px`;
}
const lastAt = (list, t) => { let i = -1; while (i + 1 < list.length && t >= list[i + 1].at) i++; return i; };

// superbot's layer: vignette and pill (v3-soft's), the task, the count, the bar and the topline
function paintHud(v, T, t) {
  const g = outCubic(seg(t, T.take, T.take + 0.55));
  fade(v.edge, g);
  v.edge.style.setProperty('--cc3-a', `${((t * 60) % 360).toFixed(1)}deg`);
  v.soft.style.opacity = (0.9 + 0.08 * Math.sin(t * 2.6)).toFixed(3);
  const pi = outCubic(seg(t, T.take + 0.12, T.take + 0.57));
  fade(v.pill, pi);
  v.pill.style.transform = `translate(-50%, ${((1 - pi) * 8).toFixed(2)}px)`;
  const show = outCubic(seg(t, T.hud, T.hud + 0.4));
  if (v.task) fade(v.task, show);
  v.fades.forEach((n) => fade(n, show));
  // the task: its line, the ring turning until done, then the check
  const ti = lastAt(T.tasks, t), tk = T.tasks[Math.max(0, ti)];
  const tp = ti < 0 ? 0 : outCubic(seg(t, tk.at, tk.at + 0.3));
  paintSwap(v.tl, ti > 0 ? LABELS.indexOf(T.tasks[ti - 1].label) : -1, ti < 0 ? -1 : LABELS.indexOf(tk.label), tp);
  if (v.spin) {
    const d = seg(t, T.done, T.done + 0.25);
    fade(v.spin, 1 - d);
    v.spin.style.transform = `rotate(${((t * 420) % 360).toFixed(1)}deg)`;
    fade(v.ok, d);
    v.ok.style.transform = `scale(${lerp(0.3, 1, outBack(d)).toFixed(4)})`;
  }
  // which check of how many, and the bar: each check fills its share as it runs, the total eases up as checks are added
  const started = T.checks.filter((k) => t >= k.a).length, pl = lastAt(T.planned, t);
  const count = started ? `${started} of ${T.planned[pl].n}` : '';
  if (v.memo.n !== count) { v.counts.forEach((n) => { n.textContent = count; }); v.memo.n = count; }
  const plan = pl < 1 ? T.planned[0].n : lerp(T.planned[pl - 1].n, T.planned[pl].n, outCubic(seg(t, T.planned[pl].at, T.planned[pl].at + 0.5)));
  const done = T.checks.reduce((s, k) => s + seg(t, k.a, k.read), 0);
  v.fills.forEach((n) => { n.style.transform = `scaleX(${Math.min(1, done / plan).toFixed(4)})`; });
  if (v.news) paintNews(v, T, t, show);
}

// the topline: the cheapest fare so far rolling in over the last, what it is and where, a tag on each change
function paintNews(v, T, t, show) {
  const N = T.news, i = lastAt(N, t), n = N[Math.max(0, i)];
  const p = i < 0 ? 0 : outCubic(seg(t, n.at, n.at + 0.35));
  const corner = v.news.classList.contains('ccl-news-corner');
  fade(v.news, corner ? outCubic(seg(t, N[0].at - 0.05, N[0].at + 0.3)) : show);
  put(v, 'ra', v.ra, i > 0 ? N[i - 1].price : '');
  put(v, 'rb', v.rb, i < 0 ? '' : n.price);
  v.ra.style.transform = `translateY(${(-p * 100).toFixed(1)}%)`;
  fade(v.ra, 1 - p);
  v.rb.style.transform = `translateY(${((1 - p) * 100).toFixed(1)}%)`;
  fade(v.rb, p);
  v.roll.style.width = `${lerp(v.ra.offsetWidth, v.rb.offsetWidth, p).toFixed(2)}px`;
  const key = v.nd.cell.dataset.key, of = (k) => (k < 0 ? 0 : v.nd.items.findIndex((s) => s.textContent === N[k][key]));
  paintSwap(v.nd, i < 0 ? -1 : i ? of(i - 1) : 0, i < 0 ? 0 : of(i), i < 0 ? 1 : p);
  put(v, 'dt', v.delta, i < 0 ? '' : n.tag);
  v.delta.classList.toggle('ccl-up', i >= 0 && n.up);
  fade(v.delta, i < 0 ? 0 : seg(t, n.at + 0.2, n.at + 0.45) * (1 - seg(t, n.at + 2.2, n.at + 2.6)));
}

// ---------- the beat ----------
function sayEl(x, text, cls = '') {
  const n = x.el(`<div class="qc-say ${cls}"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  const vis = n.firstElementChild, hid = n.lastElementChild;
  let shown = -1;
  return { n, render(t, at) { const c = streamCount(text, at + 0.06, SAY_CPS, t); if (c !== shown) { vis.textContent = text.slice(0, c); hid.textContent = text.slice(c); shown = c; } } };
}
// a follow-up row grows from no height as it lands, so the thread rises and the live view under it stays put
function grow(x, n, t, at, first) {
  const p = outCubic(seg(t, at, at + 0.42));
  n.style.height = p <= 0 ? '0px' : p >= 1 ? 'auto' : `${(n.scrollHeight * p).toFixed(2)}px`;
  n.style.marginBottom = `${(12 * p).toFixed(2)}px`;
  if (first) n.style.marginTop = `${(3 * p).toFixed(2)}px`;
  x.appear(n, t, at);
}

function makeBeat(look) {
  return {
    // `end` (the base route's end plus `extra`) is LEN past r by construction, so the cut keeps its own clock
    times(r) { return plan(r); },
    build(k, x) {
      loadFrameSheet();
      loadSheets();
      const T = k.T, sb = x.tile('superbot', 'cc3-sb');
      const say0 = sayEl(x, SAY0);
      const parts = partsOf(x, sb, look, FIT);
      const block = x.el(`<div class="bk cc3 ccl ccl-L-${look.id}">
        <div class="bk-head"><b class="bk-title">Your computer<small>Live view</small></b>${parts.head}${shareBtn('Computer control')}${EXPAND}<span class="bk-btn bk-publish cc3-stop"><i></i>Stop</span>${parts.headBar}</div>
        <div class="bk-view cc3-screen">${parts.view}</div>${parts.foot}
      </div>`);
      const anchor = x.el('<i class="ccl-anchor" aria-hidden="true"></i>');
      const dock = x.el(`<div class="msg qc-m qc-r ccl-dock">${x.sbAvatar}<div class="m-main"></div></div>`);
      dock.lastElementChild.append(block, anchor);
      // the follow-ups and superbot's answers, then the closing line: all above the docked live view
      const user = (text) => x.el(`<div class="msg qc-u ccl-fu"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(text)}</div></div></div>`);
      const reply = (say) => { const n = x.el(`<div class="msg qc-m qc-r ccl-fu">${x.sbAvatar}<div class="m-main"></div></div>`); n.lastElementChild.append(say.n); return n; };
      const rows = T.fu.map((f) => { const say = sayEl(x, f.say); return { f, u: user(f.ask), say, r: reply(say) }; });
      const fin = sayEl(x, SAY_DONE), finRow = reply(fin);
      const tail = x.el('<div class="qc-m ccl-tail"></div>');
      tail.append(...rows.flatMap((p) => [p.u, p.r]), finRow, dock);
      const card = bindView(block);
      let placed = false, cur = null;

      // Expand: v3-soft's side panel, the same screen share larger, painted from the same t while open
      const expand = block.querySelector('.bk-expand');
      expand.setAttribute('role', 'button');
      expand.setAttribute('tabindex', '0');
      expand.setAttribute('aria-expanded', 'false');
      let side = null, big = null, open = false;
      const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
      function setOpen(on) {
        if (on === open) return;
        if (on && !side) {
          const bp = partsOf(x, sb, look, FIT_BIG);
          side = x.el(`<aside class="cc3-side ccl-side ccl-L-${look.id}" aria-label="Your computer, live view">
            <div class="bk-head"><b class="bk-title">Your computer<small>Live view</small></b>${bp.head}<span class="bk-btn bk-publish cc3-stop"><i></i>Stop</span><button class="cc3-side-x" type="button" aria-label="Close">${ICON.close}</button>${bp.headBar}</div>
            <div class="cc3-screen cc3-big">${bp.view}</div>${bp.foot}
          </aside>`);
          block.closest('.hub').appendChild(side);
          big = bindView(side);
          side.querySelector('.cc3-side-x').addEventListener('click', () => setOpen(false));
          side.addEventListener('keydown', (e) => { if (e.target.closest('button')) e.stopPropagation(); });
          side.getBoundingClientRect();
        }
        open = on;
        side.classList.toggle('is-open', on);
        expand.setAttribute('aria-expanded', String(on));
        if (on) addEventListener('keydown', onKey); else removeEventListener('keydown', onKey);
      }
      expand.addEventListener('click', () => setOpen(!open));
      expand.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        e.stopPropagation();
        setOpen(!open);
      });
      addEventListener('variantchange', () => setOpen(false));

      let decoding = false;
      const paint = (v, t, at) => { paintDesk(x, v, T, t, at); paintHud(v, T, t); };
      return {
        nodes: [say0.n, tail],
        // the feed's fold follows the docked card's bottom from the moment it lands, so every row grown above it rises
        marks: [[T.r, say0.n], [T.card, anchor]],
        asks: T.fu.map((f) => ({ text: f.ask, s: f.s, typeEnd: f.typeEnd, send: f.send })),
        render(t) {
          if (!placed) { say0.n.closest('.msg').after(tail); placed = true; }
          if (!decoding) {
            decoding = true;
            for (const pic of [card.home, card.ntp]) track(pic.decode().catch((e) => console.error(new Error(`flight-loop capture failed to decode: ${pic.src}`, { cause: e }))));
          }
          if (!cur && card.desk.offsetParent) cur = cursorPlan(card, T);
          say0.render(t, T.r);
          rows.forEach((p, i) => { grow(x, p.u, t, p.f.send, i === 0); grow(x, p.r, t, p.f.r); p.say.render(t, p.f.r); });
          grow(x, finRow, t, T.final);
          fin.render(t, T.final);
          dock.style.opacity = t >= T.card ? '1' : '0';
          const ci = outCubic(seg(t, T.card, T.card + 0.45));
          block.style.opacity = ci.toFixed(3);
          block.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
          const at = cur ? path(t, cur) : REST;
          paint(card, t, at);
          if (open && t < T.card) setOpen(false);
          if (open) paint(big, t, at);
        },
      };
    },
  };
}

// the looks: where the task, the bar and the topline sit
const LOOKS = [
  { id: 'edge', task: 'chip', bar: 'top', news: null },
  { id: 'header', task: 'head', bar: 'head', news: null },
  { id: 'pill', task: 'chip', bar: 'pill', news: null },
  { id: 'news-corner', task: 'chip', bar: 'top', news: 'corner' },
  { id: 'news-footer', task: 'head', bar: 'foot', news: 'foot' },
  { id: 'news-header', task: 'chip', bar: 'bottom', news: 'head' },
];
export const looks = Object.fromEntries(LOOKS.map((l) => { const id = `flight-loop-${l.id}-97eee3b5`; return [id, makeBeat(l)]; }));
