// Computer-control loop engine (the cc-loop-* variants: ccloop-thumbs, ccloop-comments, ccloop-sponsors .0c0f5071.js).
// The 'computer-control-v3-soft' cut (computer.ba3976b6.js) turned into a job that runs in rounds: asked once, superbot
// takes the screen and keeps looping through a script of steps, and the live view says where it is. Three things are
// added to that cut's card:
//   1. a progress row inside the frame, under its header: the round (the loop's count, with a loop mark), one segment per
//      step of that round filling in turn, and "Step n of m"; a round's last beat fills every segment and the next round
//      starts them empty again;
//   2. a task HUD in the live view's top right, in the takeover pill's material: a spinner and the step superbot is on, a
//      check on a finished round, a note mark (and a violet ring) on a step that carries out something the user asked for;
//   3. the user talking to it while it works: follow-up asks are typed into the composer and sent by the engine (inst.asks,
//      chat.9b47fc30.js), each with superbot's short answer, and they land ABOVE the card. The card sits in its own message
//      at the foot of the thread, every follow-up opens a slot over it from 0 height, and the feed's fold stays on the
//      card's bottom (marks), so the live view never leaves the bottom of the chat, above the composer.
// The screen is the v3-soft desktop (a 1470px desk with Chrome full screen, scaled whole into the view, the screen's own
// cursor, the vignette and pill), its pages built by each variant at the desk's px. A variant script gives the ask, the
// first answer, its tabs, its steps (key, round, task, dur, tab, page, ptr: cursor stops by selector, click: true for a
// click), its follow-ups (at: [step key, seconds], ask, reply), `of` (the step count of a round the spot ends inside), its
// pages' markup and its own paint(p, t, T) for what moves on them; T.S[key] is a step's { a, b } and T.clicks[key] its
// click times. Expand opens the same screen, larger, in a
// side panel (as v3-soft does). The desk, Chrome, cursor and overlay styles are copied into ../ccloop.0c0f5071.css (ccl-*)
// so these cuts hold their look while computer.ba3976b6.css changes. A pure function of t; nothing is really controlled.
import { lerp, seg, outCubic, path, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { EXPAND, loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { shareBtn } from './share.29a362ea.js';

const CSS = new URL('../ccloop.0c0f5071.css?v=1', import.meta.url).href;
const DESK = { w: 1470, h: 919 }; // the desktop in its own px (computer.ba3976b6.js DESK)
const FIT = 560 / DESK.w; // the card's view, 560 wide
const FIT_BIG = 688 / DESK.w; // the side panel's view (.ccl-big)
const TAB_W = 240;
const TIP = { x: 4, y: 2.5 }; // the arrow's hotspot in its 24px box
const LEAD = 1.3; // the reply lands; the loop's first step starts this much later
const MOVE = 0.55; // a cursor glide to its next stop
const FOLLOW_CPS = 26; // the follow-up asks type at this many characters a second
const SEGS = 6; // the most steps a round has
export const TYPE_CPS = 40; // the first ask's typing rate (chat.9b47fc30.js routeBy typeCps)
const ARROW = 'M4 2.5 4 19.5 8.6 15.3 11.5 21.8 14.4 20.5 11.6 14.2 17.8 14.2Z';
const ICON = {
  x: '<svg viewBox="0 0 16 16"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>',
  plus: '<svg viewBox="0 0 16 16"><path d="M8 3v10M3 8h10"/></svg>',
  back: '<svg viewBox="0 0 16 16"><path d="M13 8H3M7 4L3 8l4 4"/></svg>',
  fwd: '<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
  reload: '<svg viewBox="0 0 16 16"><path d="M13 8a5 5 0 1 1-1.5-3.5M13 3v3h-3"/></svg>',
  lock: '<svg viewBox="0 0 16 16"><rect x="4" y="7" width="8" height="6" rx="1.2"/><path d="M6 7V5.5a2 2 0 0 1 4 0V7"/></svg>',
  more: '<svg viewBox="0 0 16 16"><path d="M8 3.5h.01M8 8h.01M8 12.5h.01"/></svg>',
  close: '<svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
  loop: '<svg viewBox="0 0 24 24"><path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/></svg>',
  ok: '<svg class="ccl-ok" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  note: '<svg class="ccl-nt" viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9 11h6M9 14h4"/></svg>',
};

const sheets = new Set();
function loadSheet(href) {
  if (!href || sheets.has(href)) return;
  sheets.add(href);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  track(new Promise((done) => {
    link.onload = done;
    link.onerror = () => { console.error(new Error(`computer-control loop stylesheet failed to load: ${href}`)); done(); };
  }));
  document.head.appendChild(link);
}

// a streamed line of superbot's (cats.70783379.js sayEl): the typed part shows, the rest holds its room
function sayEl(x, text) {
  const n = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  let shown = -1;
  return { n, render(t, at) {
    const c = streamCount(text, at + 0.06, 70, t);
    if (c !== shown) { n.firstElementChild.textContent = text.slice(0, c); n.lastElementChild.textContent = text.slice(c); shown = c; }
  } };
}

// the script laid on the clock from the loop's start t0: each step's window, the follow-ups' typing, sends and answers,
// each step's click times, and the working steps of each round (the progress row's segments)
function plan(sc, t0) {
  let at = t0;
  const steps = sc.steps.map((s, i) => { const st = { ...s, i, a: at, b: at + s.dur }; at = st.b; return st; });
  const S = Object.fromEntries(steps.filter((s) => s.key).map((s) => [s.key, s]));
  const when = ([key, dt]) => S[key].a + dt;
  const follow = (sc.follow || []).map((f) => {
    const s = when(f.at), typeEnd = s + f.ask.length / FOLLOW_CPS, send = typeEnd + 0.15;
    return { ...f, s, typeEnd, send, r: send + 0.65 };
  });
  const clicks = Object.fromEntries(steps.filter((s) => s.key).map((s) => [s.key, (s.ptr || []).filter((p) => p.click).map((p) => s.a + p.dt + 0.1)]));
  const rounds = {};
  for (const s of steps) if (!s.done) (rounds[s.round] = rounds[s.round] || []).push(s);
  return { steps, S, follow, clicks, rounds, stepsEnd: at };
}

// the screen share's insides at a scale: Chrome (tab strip, toolbar, the variant's pages), the screen's cursor and a
// click ring, then the takeover overlay: vignette, task HUD, status pill
function screen(x, sb, fit, sc) {
  // a tab's favicon: a coloured square with the site's letter
  const fav = (tb) => `<span class="ccl-fav" style="background:${tb.color || '#5f6368'}">${x.esc(tb.mark || '')}</span>`;
  return `<div class="ccl-desk" style="transform: scale(${fit.toFixed(5)})">
          <div class="ccl-win">
            <div class="ccl-strip">
              <span class="ccl-lights"><i></i><i></i><i></i></span>
              ${sc.tabs.map((tb) => `<span class="ccl-tab"><i class="ccl-bg"></i>${fav(tb)}<span class="ccl-tt">${x.esc(tb.title)}</span><span class="ccl-x">${ICON.x}</span></span>`).join('')}
              <span class="ccl-plus">${ICON.plus}</span>
            </div>
            <div class="ccl-bar">
              <span class="ccl-ic">${ICON.back}</span><span class="ccl-ic ccl-dim">${ICON.fwd}</span><span class="ccl-ic">${ICON.reload}</span>
              <span class="ccl-omni">${sc.tabs.map((tb) => `<span class="ccl-url"><span class="ccl-ic">${ICON.lock}</span>${x.esc(tb.host)}<small>${x.esc(tb.path || '')}</small></span>`).join('')}</span>
              <i class="ccl-me"></i><span class="ccl-ic">${ICON.more}</span>
            </div>
            ${sc.pages(x)}
          </div>
          <i class="ccl-click"></i>
          <svg class="ccl-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="${ARROW}"/></svg>
        </div>
        <i class="ccl-edge"><i class="ccl-soft"><i class="ccl-band"></i></i></i>
        <span class="ccl-hud" role="status"><span class="ccl-hic"><i class="ccl-spin"></i>${ICON.ok}${ICON.note}</span><span class="ccl-task"></span></span>
        <span class="ccl-pill">${sb}<span>superbot is controlling your computer</span></span>`;
}

const progRow = () => `<div class="ccl-prog"><span class="ccl-round">${ICON.loop}<b>Round 1</b></span><span class="ccl-segs">${'<i><b></b></i>'.repeat(SEGS)}</span><span class="ccl-step"></span></div>`;

// the nodes one view paints, looked up once
function bind(root, sc) {
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const desk = $('.ccl-desk');
  const pages = Object.fromEntries($$('.ccl-page').map((n) => [n.dataset.page, n]));
  return {
    root, desk, pages, tabs: $$('.ccl-tab'), bgs: $$('.ccl-bg'), urls: $$('.ccl-url'), cursor: $('.ccl-cursor'), ring: $('.ccl-click'),
    edge: $('.ccl-edge'), soft: $('.ccl-soft'), pill: $('.ccl-pill'), hud: $('.ccl-hud'), task: $('.ccl-task'), spin: $('.ccl-spin'),
    ok: $('.ccl-ok'), nt: $('.ccl-nt'), round: $('.ccl-round b'), segs: $$('.ccl-segs i'), fills: $$('.ccl-segs b'), count: $('.ccl-step'),
    p: sc.bind(root), last: { task: null, round: null, step: null, n: -1 },
  };
}

// where an element's centre sits on the desk, in the desk's px
function deskPt(v, el, dx = 0, dy = 0) {
  const d = v.desk.getBoundingClientRect(), r = el.getBoundingClientRect(), k = d.width / DESK.w || 1;
  return { x: (r.left - d.left + r.width / 2) / k + dx, y: (r.top - d.top + r.height / 2) / k + dy };
}

// the step on screen at t: before the loop the first, after it the last
function stepAt(steps, t) {
  if (t < steps[0].a) return { st: steps[0], pre: true };
  let i = steps.length - 1;
  while (i > 0 && steps[i].a > t) i--;
  return { st: steps[i], pre: false };
}

// the cursor's path: from its rest, a glide to each step's stops (a stop names a selector, or desk px), holding between
function cursorAt(v, sc, T, t) {
  const keys = [{ t: T.loop, x: sc.rest[0], y: sc.rest[1] }];
  for (const st of T.steps) {
    for (const p of st.ptr || []) {
      const el = typeof p.at === 'string' ? v.root.querySelector(p.at) : null;
      const to = el ? deskPt(v, el, p.dx, p.dy) : { x: p.at[0], y: p.at[1] };
      const prev = keys[keys.length - 1], arrive = st.a + p.dt;
      keys.push({ t: Math.max(prev.t, arrive - (p.move || MOVE)), x: prev.x, y: prev.y }, { t: arrive, ...to });
    }
  }
  return path(t, keys);
}

// the takeover: the vignette fades in as its gradient turns and breathes, the pill rises
function paintTakeover(v, T, t) {
  const g = outCubic(seg(t, T.take, T.take + 0.55));
  v.edge.style.opacity = g.toFixed(3);
  v.edge.style.setProperty('--ccl-a', `${((t * 60) % 360).toFixed(1)}deg`);
  v.soft.style.opacity = (0.9 + 0.08 * Math.sin(t * 2.6)).toFixed(3);
  const pi = outCubic(seg(t, T.take + 0.12, T.take + 0.57));
  v.pill.style.opacity = pi.toFixed(3);
  v.pill.style.transform = `translate(-50%, ${((1 - pi) * 8).toFixed(2)}px)`;
}

// Chrome: the step's page, crossfading from the last step's when it changes; the tabs (the first open from the start,
// each other one sliding open the first time a step uses it) with the active tab and its address following the step
function paintChrome(v, T, t, st, prev, pre) {
  const sw = pre ? 1 : outCubic(seg(t, st.a, st.a + 0.18)); // a page or tab switch, quick, as Chrome's is
  for (const [name, n] of Object.entries(v.pages)) {
    const o = name === st.page ? (prev && prev.page !== st.page ? sw : 1) : prev && name === prev.page && prev.page !== st.page ? 1 - sw : 0;
    n.style.opacity = o.toFixed(3);
    n.style.visibility = o > 0 ? '' : 'hidden';
  }
  v.tabs.forEach((tab, i) => {
    const first = T.steps.find((s) => s.tab === i);
    const w = i === 0 || !first ? 1 : outCubic(seg(t, first.a - 0.05, first.a + 0.25));
    tab.style.width = `${(TAB_W * w).toFixed(2)}px`;
    tab.style.opacity = w.toFixed(3);
    const on = i === st.tab ? (prev && prev.tab !== i ? sw : 1) : prev && i === prev.tab && st.tab !== i ? 1 - sw : 0;
    v.bgs[i].style.opacity = on.toFixed(3);
    v.urls[i].style.opacity = on.toFixed(3);
  });
}

// the screen's cursor, and a ring where it clicks
function paintCursor(v, sc, T, t) {
  const at = cursorAt(v, sc, T, t);
  v.cursor.style.transform = `translate(${(at.x - TIP.x).toFixed(2)}px, ${(at.y - TIP.y).toFixed(2)}px)`;
  const click = Object.values(T.clicks).flat().filter((c) => t >= c - 0.06 && t < c + 0.45).pop();
  if (click === undefined) { v.ring.style.opacity = '0'; return; }
  const r = seg(t, click - 0.06, click + 0.45);
  v.ring.style.opacity = (0.9 * (1 - r)).toFixed(3);
  v.ring.style.transform = `translate(${at.x.toFixed(2)}px, ${at.y.toFixed(2)}px) scale(${lerp(0.4, 1.3, outCubic(r)).toFixed(3)})`;
}

// the HUD: in with the loop, then each step's task rises in as the step starts; a spinner while it works, a check on a
// finished round, the note mark on a step the user asked for
function paintHud(v, T, t, st, pre) {
  const h = outCubic(seg(t, T.loop - 0.3, T.loop + 0.1));
  const ti = pre ? 1 : outCubic(seg(t, st.a, st.a + 0.22));
  v.hud.style.opacity = (h * lerp(0.35, 1, ti)).toFixed(3);
  v.hud.style.transform = `translateY(${((1 - h) * -6).toFixed(2)}px)`;
  if (v.last.task !== st.task) { v.task.textContent = st.task; v.last.task = st.task; }
  v.task.style.transform = `translateY(${((1 - ti) * 5).toFixed(2)}px)`;
  v.hud.classList.toggle('is-note', !!st.note);
  v.spin.style.opacity = st.done || st.note ? '0' : '1';
  v.spin.style.transform = `rotate(${((t * 400) % 360).toFixed(1)}deg)`;
  v.ok.style.opacity = st.done ? '1' : '0';
  v.nt.style.opacity = st.note && !st.done ? '1' : '0';
}

// the progress row: the round's working steps as segments, filled to where the loop is. A round the spot ends inside
// still counts the steps it would run (sc.of)
function paintProgress(v, sc, T, t, st, pre) {
  const work = T.rounds[st.round], of = Math.max(work.length, (sc.of || {})[st.round] || 0);
  const k = st.done ? of : pre ? 0 : Math.max(0, work.indexOf(st));
  if (v.last.round !== st.round) { v.round.textContent = `Round ${st.round}`; v.last.round = st.round; }
  const label = st.done ? 'Done' : `Step ${k + 1} of ${of}`;
  if (v.last.step !== label) { v.count.textContent = label; v.last.step = label; }
  if (v.last.n !== of) { v.segs.forEach((n, i) => { n.style.display = i < of ? '' : 'none'; }); v.last.n = of; }
  for (let i = 0; i < of; i++) {
    const s = work[i];
    const f = st.done || i < k ? 1 : i > k || pre || !s ? 0 : seg(t, s.a, s.b);
    v.fills[i].style.transform = `scaleX(${f.toFixed(4)})`;
  }
}

// one view at t
function paint(v, sc, T, t) {
  const { st, pre } = stepAt(T.steps, t);
  const prev = pre || st.i === 0 ? null : T.steps[st.i - 1];
  paintTakeover(v, T, t);
  paintChrome(v, T, t, st, prev, pre);
  paintCursor(v, sc, T, t);
  paintHud(v, T, t, st, pre);
  paintProgress(v, sc, T, t, st, pre);
  sc.paint(v.p, t, T, st);
}

// the follow-ups: each ask's bubble and superbot's answer, in slots that open above the card as they land
function makeThread(x, T) {
  const thread = x.el('<div class="qc-m ccl-thread"></div>');
  const msgs = T.follow.map((f) => {
    const u = x.el(`<div class="ccl-slot"><div class="msg qc-u"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(f.ask)}</div></div></div></div>`);
    const r = x.el(`<div class="ccl-slot"><div class="msg qc-m">${x.sbAvatar}<div class="m-main"></div></div></div>`);
    const rs = sayEl(x, f.reply);
    r.querySelector('.m-main').append(rs.n);
    thread.append(u, r);
    return { f, u, r, rs };
  });
  // a slot opens from 0 to its message's height (plus the thread's 12px gap) as the message lands, then lets go
  const grow = (slot, t, a) => {
    const p = outCubic(seg(t, a, a + 0.35));
    slot.style.height = p >= 1 ? 'auto' : `${((slot.firstElementChild.offsetHeight + 12) * p).toFixed(2)}px`;
    x.appear(slot.firstElementChild, t, a);
  };
  return { thread, msgs, render(t) { for (const m of msgs) { grow(m.u, t, m.f.send); grow(m.r, t, m.f.r); m.rs.render(t, m.f.r); } } };
}

// Expand: the same screen share, larger, in a side panel on the right of the app (built the first time it opens),
// painted from the same t; its close button, Escape or a variant pick closes it
function makeExpand(block, x, sb, sc) {
  const expand = block.querySelector('.bk-expand');
  expand.setAttribute('role', 'button');
  expand.setAttribute('tabindex', '0');
  expand.setAttribute('aria-expanded', 'false');
  const panel = { side: null, view: null, open: false };
  const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
  function setOpen(on) {
    if (on === panel.open) return;
    if (on && !panel.side) {
      panel.side = x.el(`<aside class="ccl-side" aria-label="Your computer, live view">
        <div class="bk-head">
          <b class="bk-title">Your computer<small>Live view</small></b>
          <span class="bk-btn bk-publish ccl-stop"><i></i>Stop</span>
          <button class="ccl-side-x" type="button" aria-label="Close">${ICON.close}</button>
        </div>
        ${progRow()}
        <div class="ccl-screen ccl-big">${screen(x, sb, FIT_BIG, sc)}</div>
      </aside>`);
      block.closest('.hub').appendChild(panel.side);
      panel.view = bind(panel.side, sc);
      panel.side.querySelector('.ccl-side-x').addEventListener('click', () => setOpen(false));
      // keys on the panel's buttons are theirs, not the spot clock's (space would pause it)
      panel.side.addEventListener('keydown', (e) => { if (e.target.closest('button')) e.stopPropagation(); });
      panel.side.getBoundingClientRect(); // lay it out closed first, so the first open slides in
    }
    panel.open = on;
    panel.side.classList.toggle('is-open', on);
    expand.setAttribute('aria-expanded', String(on));
    if (on) addEventListener('keydown', onKey); else removeEventListener('keydown', onKey);
  }
  expand.addEventListener('click', () => setOpen(!panel.open));
  expand.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    e.stopPropagation();
    setOpen(!panel.open);
  });
  addEventListener('variantchange', () => setOpen(false));
  return { panel, setOpen };
}

// a variant: its script in, the beat module out, with the run length and first ask the router needs
export function makeLoop(sc) {
  const steps = sc.steps.reduce((n, s) => n + s.dur, 0);
  const LEN = LEAD + steps + (sc.tail ?? 0.4);
  const beat = {
    // `end` is the route's end (chat.9b47fc30.js routeBy, base end plus extra): r + LEN
    times(r, end = r + LEN) {
      const T = { r, card: r + 0.22, take: r + 0.62, loop: r + LEAD, end };
      return Object.assign(T, plan(sc, T.loop));
    },
    build(k, x) {
      loadFrameSheet();
      loadSheet(CSS);
      loadSheet(sc.css);
      const T = k.T;
      const sb = x.tile('superbot', 'ccl-sb');
      const say = sayEl(x, sc.say);
      const block = x.el(`<div class="bk ccl">
        <div class="bk-head">
          <b class="bk-title">Your computer<small>Live view</small></b>
          ${shareBtn('Computer control')}
          ${EXPAND}
          <span class="bk-btn bk-publish ccl-stop"><i></i>Stop</span>
        </div>
        ${progRow()}
        <div class="bk-view ccl-screen">${screen(x, sb, FIT, sc)}</div>
      </div>`);
      // the card rides in its own message at the foot of the thread; the follow-ups open above it
      const pin = x.el(`<div class="msg qc-m ccl-pin">${x.sbAvatar}<div class="m-main"></div></div>`);
      pin.lastElementChild.append(block);
      const th = makeThread(x, T), card = bind(block, sc), { panel, setOpen } = makeExpand(block, x, sb, sc);
      let placed = false;
      return {
        nodes: [say.n, th.thread, pin],
        // the fold glides to the card and stays on its bottom: as the follow-ups open above it, the thread scrolls up
        marks: [[T.r, say.n], [T.card, pin], ...th.msgs.flatMap((m) => [[m.f.send, pin], [m.f.r, pin]])],
        asks: T.follow.map((f) => ({ text: f.ask, s: f.s, typeEnd: f.typeEnd, send: f.send })),
        chips: [],
        render(t) {
          // the thread and the card move out of the engine's reply, after it, on the first frame of this variant; every
          // image on the pages is in before a frozen frame is
          if (!placed) {
            say.n.closest('.msg').after(th.thread, pin);
            for (const pic of block.querySelectorAll('img')) {
              track(pic.decode().catch((e) => console.error(new Error(`${sc.id}: page image failed to decode: ${pic.src}`, { cause: e }))));
            }
            placed = true;
          }
          say.render(t, T.r);
          const ci = outCubic(seg(t, T.card, T.card + 0.45));
          pin.style.opacity = ci.toFixed(3);
          block.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
          th.render(t);
          paint(card, sc, T, t);
          // the panel belongs to the card: a restart that takes the card away closes it
          if (panel.open && t < T.card) setOpen(false);
          if (panel.open) paint(panel.view, sc, T, t);
        },
      };
    },
  };
  return { beat, LEN, ASK: sc.ask, TYPE_CPS };
}
