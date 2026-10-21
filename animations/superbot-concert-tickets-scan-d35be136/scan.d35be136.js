// Concert tickets scan: superbot's computer-control live view (the 'computer-control-v3-soft' variant's frame,
// gemini-muse-meme-superbot-6fbc38f8 beats/computer.ba3976b6.js, drawn at twice its size) while the agent prices one
// concert, two tickets, across four ticket sites and starts over, forever. Each site: the cursor clicks the address
// bar, the event's address types in, the page loads, the agent picks 2 tickets (or checks the sort), then rests on the
// cheapest listing. The pages are real captures of those sites (img/CREDITS.txt); every price the Activity tab logs is
// the one its capture shows. The Activity tab, attached to the frame's right edge, logs each step as one line with an
// icon, newest at the bottom. Inside the view nothing but the takeover overlay: the vignette and the status pill.
// A pure function of t over one LOOP whose end is its start, so ?t=<s> freezes any frame.

const LOOP = 24; // s; a multiple of 6 so the vignette's 60deg/s turn closes on itself
const SITE_LEN = 5.5;
const FIT = 1120 / 1470; // the 1470x919 desktop into the 1120x700 view
const PAGE_TOP = 82; // Chrome's tab strip and toolbar, in desktop px
const OMNI = { x: 560, y: 62 }; // where the cursor clicks the address bar
const TIP = { x: 4, y: 2.5 }; // the arrow's hotspot in its 24px box
const TYPE_CPS = 80;
const ROW_IN = 0.35; // a log row's entrance, s
const ROW_GAP = 16;
const STILL_AT = 21.6; // the frame reduced motion holds: TickPick read, the new lowest logged

// cursor targets are in page px, read off each 1470x839 capture
const SITES = [
  { host: 'stubhub.com', name: 'StubHub', url: 'stubhub.com/gracie-abrams-denver-tickets-12-3-2026/event/161246896',
    title: 'Gracie Abrams', fav: 'fav-stubhub.png', page: 'stubhub', qty: { page: 'stubhub-qty', at: { x: 730, y: 519 } },
    price: { x: 1398, y: 190 }, seat: 'Sec 374, Row 11', cost: 42 },
  { host: 'seatgeek.com', name: 'SeatGeek', url: 'seatgeek.com/gracie-abrams-tickets/denver-colorado-ball-arena-2026-12-03-8-pm/concert/18270512',
    title: 'Gracie Abrams with Rachel Chinouriri', fav: 'fav-seatgeek.png', page: 'seatgeek', qty: { page: 'seatgeek-qty', at: { x: 734, y: 389 } },
    price: { x: 584, y: 230 }, seat: 'Sec 378, Row 15', cost: 40 },
  { host: 'vividseats.com', name: 'Vivid Seats', url: 'vividseats.com/gracie-abrams-tickets-denver-ball-arena-12-3-2026--concerts-alternative/production/7091517',
    title: 'Gracie Abrams Denver tickets - Ball Arena - 12/03/2026 | Vivid Seats', fav: 'fav-vividseats.png', page: 'vividseats', sort: { x: 452, y: 396 },
    price: { x: 452, y: 484 }, seat: 'Sec 374, Row 11', cost: 41 },
  { host: 'tickpick.com', name: 'TickPick', url: 'tickpick.com/buy-gracie-abrams-tickets-ball-arena-12-3-26-8pm/8002236',
    title: 'Gracie Abrams & Rachel Chinouriri Denver Tickets - Ball Arena, Dec 3 | TickPick', fav: 'fav-tickpick.png', page: 'tickpick', sort: { x: 92, y: 108 },
    price: { x: 612, y: 360 }, seat: 'Sec 374, Row 11', cost: 38 },
];
const SB_TITLE = 'the AI plans you pay for, in one app'; // superbot.gg's title, the tab superbot was opened from

const ARROW = 'M4 2.5 4 19.5 8.6 15.3 11.5 21.8 14.4 20.5 11.6 14.2 17.8 14.2Z';
const SB_MARK = '<span class="sb-tile"><i class="sbm sbm-c"></i><i class="sbm sbm-m"></i><i class="sbm sbm-w"></i></span>';
// Chrome's glyphs (computer.ba3976b6.js ICON) and the frame's buttons (bakery.005f5570.js EXPAND, share.29a362ea.js)
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
const SHARE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4"/><path d="M8 8l4-4 4 4"/><path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>';
const EXPAND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
// the Activity tab's icons: lucide, from the Iconify API (api.iconify.design/lucide.json)
const lucide = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const ICON = {
  globe: lucide('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20a14.5 14.5 0 0 0 0-20M2 12h20"/>'),
  ticket: lucide('<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Zm11-4v2m0 10v2m0-8v2"/>'),
  sort: lucide('<path d="m3 16l4 4l4-4m-4 4V4m4 0h10M11 8h7m-7 4h4"/>'),
  tag: lucide('<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>'),
  down: lucide('<path d="M16 17h6v-6"/><path d="m22 17l-8.5-8.5l-5 5L2 7"/>'),
  check: lucide('<circle cx="12" cy="12" r="10"/><path d="m16 9l-5.5 5.5L8 12"/>'),
  refresh: lucide('<path d="M3 12a9 9 0 0 1 9-9a9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5m5 4a9 9 0 0 1-9 9a9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>'),
};

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const outCubic = (k) => 1 - (1 - k) ** 3;
const inOutCubic = (k) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);
const onPage = (p) => ({ x: p.x, y: p.y + PAGE_TOP });
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// one site's beats, from its start
function beats(i) {
  const s = i * SITE_LEN;
  return {
    s, click: s + 0.5, type: s + 0.65, enter: s + 2.05, load: s + 2.3, toCtl: s + 2.55, atCtl: s + 3.05,
    pick: s + 3.15, toPrice: s + 3.45, atPrice: s + 4.05, read: s + 4.15, best: s + 4.75,
  };
}
const SCAN_END = SITES.length * SITE_LEN;

// the log, one row per step (a read carries its seats on a second line); the lowest price so far decides which reads
// earn a "lowest" row
const LOG = [];
let low = Infinity;
SITES.forEach((site, i) => {
  const B = beats(i);
  LOG.push({ t: B.click, icon: 'globe', text: `Opening ${site.host}` });
  LOG.push(site.qty ? { t: B.pick, icon: 'ticket', text: 'Choosing 2 tickets' } : { t: B.atCtl, icon: 'sort', text: 'Sorted by lowest price' });
  LOG.push({ t: B.read, icon: 'tag', text: `${site.name}: $${site.cost} each`, sub: site.seat });
  if (site.cost < low) {
    LOG.push({ t: B.best, icon: 'down', text: i === 0 ? `Lowest so far: $${site.cost}` : `New lowest: $${site.cost} on ${site.name}` });
    low = site.cost;
  }
});
const BEST = SITES.reduce((a, b) => (b.cost < a.cost ? b : a));
LOG.push({ t: SCAN_END + 0.2, icon: 'check', text: `Cheapest: ${BEST.name}, $${BEST.cost} each`, sub: `${BEST.seat}, fees included` });
LOG.push({ t: SCAN_END + 1.2, icon: 'refresh', text: `Rechecking ${SITES.length} sites for price drops` });

// the cursor's glides; before the first, it rests where the last left it (the loop's end is its start)
const MOVES = SITES.flatMap((site, i) => {
  const B = beats(i);
  return [
    { t0: B.s, t1: B.s + 0.45, to: OMNI },
    { t0: B.toCtl, t1: B.atCtl, to: onPage(site.qty ? site.qty.at : site.sort) },
    { t0: B.toPrice, t1: B.atPrice, to: onPage(site.price) },
  ];
});
function cursorAt(u) {
  let from = MOVES[MOVES.length - 1].to;
  for (const m of MOVES) {
    if (u < m.t0) return from;
    if (u < m.t1) {
      const k = inOutCubic(seg(u, m.t0, m.t1));
      return { x: lerp(from.x, m.to.x, k), y: lerp(from.y, m.to.y, k) };
    }
    from = m.to;
  }
  return from;
}

// which site is on screen, which capture, and what the address bar holds
function screenAt(u) {
  const i = Math.floor(u / SITE_LEN);
  const last = SITES[SITES.length - 1];
  if (i >= SITES.length) return { site: last, page: last.page, omni: { text: last.url } };
  const site = SITES[i], prev = SITES[(i + SITES.length - 1) % SITES.length], B = beats(i);
  const shown = u < B.load ? prev : site;
  const page = u < B.load ? prev.page : site.qty && u < B.pick + 0.1 ? site.qty.page : site.page;
  let omni;
  if (u < B.click) omni = { text: prev.url };
  else if (u < B.type) omni = { focus: true, text: prev.url, sel: true };
  else if (u < B.enter) {
    const n = Math.min(site.url.length, Math.floor((u - B.type) * TYPE_CPS));
    omni = { focus: true, text: site.url.slice(0, n), caret: n < site.url.length || Math.floor((u - B.type) / 0.53) % 2 === 0 };
  } else omni = { text: site.url };
  return { site: shown, page, omni };
}

function build(cmp) {
  const pages = [...new Set(SITES.flatMap((s) => (s.qty ? [s.qty.page, s.page] : [s.page])))];
  cmp.innerHTML = `
    <section class="bk" aria-label="Your computer, live view">
      <div class="bk-head">
        <b class="bk-title">Your computer<small>Live view</small></b>
        <span class="bk-btn bk-share">${SHARE}</span>
        <span class="bk-btn bk-expand">${EXPAND}Expand</span>
        <span class="bk-btn bk-stop"><i></i>Stop</span>
      </div>
      <div class="bk-view">
        <div class="cc-desk" style="transform: scale(${FIT.toFixed(5)})">
          <div class="cc-win">
            <div class="cc-strip">
              <span class="cc-lights"><i></i><i></i><i></i></span>
              <span class="cc-tab"><span class="cc-fav">${SB_MARK}</span><span class="cc-tt">${esc(SB_TITLE)}</span><span class="cc-x">${CHROME.x}</span></span>
              <span class="cc-tab is-on"><span class="cc-fav"><img class="cc-site-fav" alt="" width="16" height="16"></span><span class="cc-tt cc-site-tt"></span><span class="cc-x">${CHROME.x}</span></span>
              <span class="cc-plus">${CHROME.plus}</span>
            </div>
            <div class="cc-bar">
              <span class="cc-ic">${CHROME.back}</span><span class="cc-ic cc-dim">${CHROME.fwd}</span><span class="cc-ic">${CHROME.reload}</span>
              <span class="cc-omni"><span class="cc-ic cc-i-tune">${CHROME.tune}</span><span class="cc-ic cc-i-search">${CHROME.search}</span><span class="cc-url"></span><i class="cc-caret"></i></span>
              <i class="cc-me"></i><span class="cc-ic">${CHROME.more}</span>
            </div>
            ${pages.map((p) => `<img class="cc-page" data-page="${p}" src="img/${p}.webp" width="1470" height="839" alt="">`).join('')}
          </div>
          <svg class="cc-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="${ARROW}"/></svg>
        </div>
        <i class="cc-edge"><i class="cc-soft"><i class="cc-band"></i></i></i>
        <span class="cc-pill">${SB_MARK}<span>superbot is controlling your computer</span></span>
      </div>
    </section>
    <aside class="act" aria-label="Activity">
      <div class="act-head"><b class="act-title">Activity<small>Cheapest tickets</small></b></div>
      <div class="act-task"><span class="act-ic">${ICON.ticket}</span><span><b>Gracie Abrams at Ball Arena, Denver</b><span>Thu, Dec 3, 8:00 PM. 2 tickets</span></span></div>
      <ol class="act-log">${LOG.map((e) => `<li class="act-row"><span class="act-ic">${ICON[e.icon]}</span><span>${esc(e.text)}${e.sub ? `<span class="act-sub">${esc(e.sub)}</span>` : ''}</span></li>`).join('')}</ol>
    </aside>`;
  const $ = (s) => cmp.querySelector(s);
  const v = {
    cursor: $('.cc-cursor'), fav: $('.cc-site-fav'), tt: $('.cc-site-tt'), omni: $('.cc-omni'), url: $('.cc-url'), caret: $('.cc-caret'),
    edge: $('.cc-edge'), soft: $('.cc-soft'), log: $('.act-log'), rows: [...cmp.querySelectorAll('.act-row')],
    pages: Object.fromEntries([...cmp.querySelectorAll('.cc-page')].map((img) => [img.dataset.page, img])),
    shown: {}, heights: [],
  };
  return v;
}

// row heights, once the type is in: a wrapped row is taller and pushes the rest further up
function measure(v) {
  v.heights = v.rows.map((r) => r.offsetHeight);
  v.logH = v.log.clientHeight;
}

function paint(v, t) {
  const u = ((t % LOOP) + LOOP) % LOOP;

  // the takeover overlay: the vignette's gradient turns and gently breathes; ten breaths a loop
  v.edge.style.setProperty('--cc-a', `${((u * 60) % 360).toFixed(1)}deg`);
  v.soft.style.opacity = (0.9 + 0.08 * Math.sin((u / LOOP) * Math.PI * 2 * 10)).toFixed(3);

  // the page, the tab and the address bar
  const sc = screenAt(u);
  if (v.shown.page !== sc.page) {
    if (v.shown.page) v.pages[v.shown.page].classList.remove('is-on');
    v.pages[sc.page].classList.add('is-on');
    v.shown.page = sc.page;
  }
  if (v.shown.site !== sc.site) {
    v.fav.src = `img/${sc.site.fav}`;
    v.tt.textContent = sc.site.title;
    v.shown.site = sc.site;
  }
  const o = sc.omni;
  if (v.shown.text !== o.text) { v.url.textContent = o.text; v.shown.text = o.text; }
  v.omni.classList.toggle('is-focus', !!o.focus);
  v.url.classList.toggle('is-sel', !!o.sel);
  v.caret.style.visibility = o.focus && o.caret ? 'visible' : 'hidden';

  const at = cursorAt(u);
  v.cursor.style.transform = `translate(${(at.x - TIP.x).toFixed(2)}px, ${(at.y - TIP.y).toFixed(2)}px)`;

  // the log: rows by age, newest at the bottom; a new row rises in from below the list's edge as it lifts the rest
  // by its height, so the two never overlap. A row older than the loop's start happened in the previous loop, so the
  // log at the loop's end is the log at its start
  const order = LOG.map((e, k) => ({ k, age: u >= e.t ? u - e.t : u - e.t + LOOP })).sort((a, b) => a.age - b.age);
  let lift = 0;
  order.forEach(({ k, age }, j) => {
    const row = v.rows[k];
    const p = outCubic(seg(age, 0, ROW_IN));
    const h = v.heights[k] + ROW_GAP;
    if (lift > v.logH) { row.style.visibility = 'hidden'; return; }
    row.style.visibility = 'visible';
    row.style.transform = `translateY(${(-lift + (1 - p) * h).toFixed(2)}px)`;
    row.style.opacity = p.toFixed(3);
    // the newest row is in ink; it settles to muted as the next one comes in
    const ink = j === 0 ? 1 : j === 1 ? 1 - outCubic(seg(order[0].age, 0, ROW_IN)) : 0;
    const c = Math.round(lerp(161, 229, ink)), c2 = Math.round(lerp(166, 234, ink));
    row.style.color = `rgb(${c},${c},${c2})`;
    lift += h * p;
  });
}

// fit the 1920x1080 stage to the window
function fit(stage) {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  stage.style.transform = `translate(-50%, -50%) scale(${k.toFixed(4)})`;
}

async function main() {
  const stage = document.querySelector('.stage');
  const v = build(stage.querySelector('.cmp'));
  fit(stage);
  addEventListener('resize', () => fit(stage));
  // a frozen frame waits on every capture; the tab's favicon gets its src at the first paint
  await Promise.all([document.fonts.ready, ...Object.values(v.pages).map((img) => img.decode().catch((e) => console.error(new Error(`capture failed to decode: ${img.src}`, { cause: e }))))]);
  measure(v);

  const q = new URLSearchParams(location.search);
  const still = q.has('t') ? Number(q.get('t')) : matchMedia('(prefers-reduced-motion: reduce)').matches && !q.has('play') ? STILL_AT : null;
  if (still !== null) {
    paint(v, still);
    document.documentElement.dataset.ready = '1';
    return;
  }
  const speed = Number(q.get('speed')) || 1;
  const t0 = performance.now();
  const tick = (now) => { paint(v, ((now - t0) / 1000) * speed); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  document.documentElement.dataset.ready = '1';
}

main().catch((e) => { console.error(e); throw e; });
