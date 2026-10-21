// Computer-control progress beats (the 'computer-control-v3-progress-a', '-b' and '-c' variants): the
// computer-control-v3-soft cut (computer.ba3976b6.js) carried on past its new tab into a task with a plan you can see.
// The same frame and live view (the artifact frame with Share, Expand and Stop; a 1470x919 desktop with Chrome full
// screen on it, scaled whole into the view; the pink and purple takeover vignette), and on it, at the view's own size, a
// progress bar and the task superbot is on in the frame's top right. Superbot types a search into the omnibox, the video
// results come in, it opens one and the clip plays (the hacker cut's generated cats and kitten clip,
// img/hacker.7dfcf32a/CREDITS.txt). Meanwhile the user types two follow-ups into the composer, one changing the work and
// one asking how it is going; superbot answers each under the card, and a change re-plans the task list: the bar eases
// to the new plan's share and the chip rings once. Each cut's script, look and plans are progress-data.81e9d268.js's:
//   a ('line'): a thin bar along the view's top edge and a dark task chip; "actually, make it kittens" sends superbot
//     back to the omnibox to search again;
//   b ('card'): a step card with one segment per step; "wait, play the newest one" turns the cursor mid-glide;
//   c ('pill'): the takeover pill grows a progress bar and a light Now chip names the task; "and make it full screen
//     when it plays" adds a step, and the player goes full screen.
// The follow-ups type into the composer through inst.asks and land as the engine's own bubbles, placed after the reply
// as discord.bccc0fdd.js places its own. A pure function of t: nothing animates in CSS. Expand opens the same side panel
// as the v3-soft cut, painted from the same t. Its stylesheet (../progress.81e9d268.css) loads with the module, after
// the v3-soft cut's (../computer.ba3976b6.css), whose Chrome and takeover classes it reuses. Nothing is really controlled.
import { clamp, lerp, seg, outCubic, inOutCubic, path, press, blink, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { EXPAND, loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { shareBtn } from './share.29a362ea.js';
import { SCRIPTS, LEN, CATS, PLAYED, UP_NEXT, GRID, PAGE_TOP, PLAYER, FULL, SPRITE, REPLAN, thumbAt } from './progress-data.81e9d268.js?v=1';

export { LEN };
const SHEETS = [new URL('../computer.ba3976b6.css?v=11', import.meta.url).href, new URL('../progress.81e9d268.css?v=1', import.meta.url).href];
const DESK_W = 1470;
const FIT = 560 / DESK_W; // the card's view (the bakery frame's 560x350)
const FIT_BIG = 688 / DESK_W; // the side panel's view (.cc3-big, 688px wide)
const TAB_W = 240; // Chrome's widest tab (.cc3-tab)
const TIP = { x: 4, y: 2.5 }; // the arrow's hotspot in its 24px box
const SHOT = { home: 'computer.ba3976b6/superbot-home.png', ntp: 'computer.ba3976b6/new-tab.png' };
const PAGE = { w: 1470, h: 839 }; // both captures' size
const TITLE = 'the AI plans you pay for, in one app'; // superbot.gg's page title, up to its separator
const ARROW = 'M4 2.5 4 19.5 8.6 15.3 11.5 21.8 14.4 20.5 11.6 14.2 17.8 14.2Z';
const MAX_STEPS = 6; // the step card's segments: the longest plan's steps
const PILL = 'superbot is controlling your computer';
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
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>',
};

let sheetsOn = false;
function loadSheets() {
  if (sheetsOn) return;
  sheetsOn = true;
  for (const href of SHEETS) {
    if (document.querySelector(`link[href="${href}"]`)) continue; // the v3-soft beat may have loaded its own already
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    track(new Promise((done) => {
      link.onload = done;
      link.onerror = () => { console.error(new Error(`computer-control progress stylesheet failed to load: ${href}`)); done(); };
    }));
    document.head.appendChild(link);
  }
}

// --- the plan: its progress, the task on show and the moment a follow-up re-plans it ---

const planAt = (plans, t) => { let i = 0; while (i + 1 < plans.length && t >= plans[i + 1].at) i++; return i; };
const share = (steps, t) => steps.reduce((sum, st) => sum + seg(t, st.a, st.b), 0) / steps.length;
// the bar's fill: the plan on show's share of steps done; after a re-plan it eases there from the old plan's share
function progressAt(plans, t) {
  const i = planAt(plans, t), now = share(plans[i].steps, t);
  if (!i) return now;
  const at = plans[i].at;
  return lerp(share(plans[i - 1].steps, at), now, outCubic(seg(t, at, at + REPLAN)));
}
// the task chip's ring as a follow-up changes the plan: up at once, gone within the second
function flashAt(plans, t) {
  const i = planAt(plans, t);
  if (!i) return 0;
  const at = plans[i].at;
  return seg(t, at, at + 0.1) * (1 - seg(t, at + 0.1, at + 1.0));
}
// every change of the task on show, in time order: a step becomes the task once the one before it is done; a re-plan
// names its plan's first unfinished step (with the new count); the last plan ends on the cut's `done` line
function eventsOf(plans, doneLine) {
  const out = [];
  plans.forEach((p, i) => {
    const until = i + 1 < plans.length ? plans[i + 1].at : Infinity;
    p.steps.forEach((st, j) => {
      const from = Math.max(p.at, j ? p.steps[j - 1].b : -Infinity);
      if (from < until && from < st.b) out.push({ at: from, label: st.label, k: j + 1, n: p.steps.length });
    });
    if (until === Infinity) out.push({ at: p.steps[p.steps.length - 1].b, label: doneLine, k: p.steps.length, n: p.steps.length, done: true });
  });
  return out;
}
const COUNT = { line: (e) => `${e.k}/${e.n}`, card: (e) => `Step ${e.k} of ${e.n}`, pill: (e) => `${e.k}/${e.n}` };
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// --- markup ---

// one search's results page: the filter chips, then the videos in the order this search brings them back
function results(x, s) {
  const cards = s.order.map((id, i) => {
    const c = CATS[id], at = thumbAt(i);
    return `<div class="cpx-card" style="left: ${at.x - GRID.w / 2}px; top: ${at.y - GRID.h / 2 - PAGE_TOP}px"><span class="cpx-th"><img data-src="${x.img('hacker.7dfcf32a/' + c.img)}" width="480" height="270" alt="${x.esc(c.alt)}"><b class="cpx-dur">${c.dur}</b></span><b class="cpx-tn">${x.esc(c.title)}</b><span class="cpx-tm">${c.meta}</span></div>`;
  }).join('');
  return `<div class="cpx-page cpx-res"><div class="cpx-chips"><span>All</span><span class="on">Videos</span><span>Images</span><span>News</span></div>${cards}</div>`;
}

// the watch page and the player over it (on the desk, so full screen can cover Chrome)
function watch(x) {
  const next = UP_NEXT.map((id) => { const c = CATS[id]; return `<div class="cpx-nx"><img data-src="${x.img('hacker.7dfcf32a/' + c.img)}" width="480" height="270" alt="${x.esc(c.alt)}"><span>${x.esc(c.title)}<small>${c.meta}</small></span></div>`; }).join('');
  return `<div class="cpx-page cpx-watch"><b class="cpx-wt">${x.esc(PLAYED.title)}</b><span class="cpx-wm">${PLAYED.meta}</span><div class="cpx-next"><b>Up next</b>${next}</div></div>
    <i class="cpx-fsbg"></i>
    <div class="cpx-player" style="left: ${PLAYER.x}px; top: ${PLAYER.y}px; width: ${PLAYER.w}px; height: ${PLAYER.h}px"><canvas class="cpx-spr" width="${SPRITE.w}" height="${SPRITE.h}" role="img" aria-label="${x.esc(PLAYED.alt)}"></canvas>
      <div class="cpx-ctrl"><span class="cpx-bar"><i></i></span><span class="cpx-pp">${ICON.pause}</span><b class="cpx-vt">0:00 / ${PLAYED.dur}</b><span class="cpx-fsb">${ICON.full}</span></div></div>`;
}

// the progress bar and the current task, at the view's size over the takeover's edge, one look per cut
function hud(x, look, sb) {
  const state = `<i class="cpx-spin"></i><span class="cpx-ok">${x.OK}</span>`;
  const pill = `<span class="cc3-pill">${sb}<span>${PILL}</span></span>`;
  if (look === 'line') {
    return `<span class="cpx-hud cpx-line"><i class="cpx-fill"></i></span>
      <span class="cpx-hud cpx-task cpx-ring">${state}<span class="cpx-lbl"></span><b class="cpx-n"></b></span>${pill}`;
  }
  if (look === 'card') {
    return `<span class="cpx-hud cpx-steps cpx-ring"><span class="cpx-row">${state}<span class="cpx-n"></span><b class="cpx-pct"></b></span><span class="cpx-lbl"></span><span class="cpx-segs">${'<i><b></b></i>'.repeat(MAX_STEPS)}</span></span>${pill}`;
  }
  return `<span class="cpx-hud cpx-now cpx-ring"><b class="cpx-tag">Now</b><span class="cpx-lbl"></span><span class="cpx-n"></span></span>
    <span class="cc3-pill cpx-meter">${sb}<span>${PILL}</span><span class="cpx-track"><i class="cpx-fill"></i></span><b class="cpx-pct"></b></span>`;
}

// one screen share's insides at a scale: the desktop (Chrome, its pages, the player, the screen's cursor), the
// takeover's edge, the HUD
function screen(x, S, sb, fit) {
  return `<div class="cc3-desk" style="transform: scale(${fit.toFixed(5)})">
      <div class="cc3-win">
        <div class="cc3-strip">
          <span class="cc3-lights"><i></i><i></i><i></i></span>
          <span class="cc3-tab cc3-t1"><i class="cc3-bg"></i><span class="cc3-fav">${sb}</span><span class="cc3-tt">${x.esc(TITLE)}</span><span class="cc3-x">${ICON.x}</span></span>
          <span class="cc3-tab cc3-t2"><i class="cc3-bg"></i><span class="cc3-tt">New Tab</span><span class="cc3-x">${ICON.x}</span></span>
          <span class="cc3-plus">${ICON.plus}</span>
        </div>
        <div class="cc3-bar">
          <span class="cc3-ic">${ICON.back}</span><span class="cc3-ic cc3-dim">${ICON.fwd}</span><span class="cc3-ic">${ICON.reload}</span>
          <span class="cc3-omni">
            <span class="cc3-url cc3-u1"><span class="cc3-ic">${ICON.tune}</span>superbot.gg</span>
            <span class="cc3-url cc3-u2"><span class="cc3-ic">${ICON.search}</span><i class="cc3-caret"></i><span class="cc3-ph">Search Google or type a URL</span></span>
            <span class="cc3-url cpx-u3"><span class="cc3-ic">${ICON.search}</span><span class="cpx-q"></span><i class="cc3-caret"></i></span>
          </span>
          <i class="cc3-me"></i><span class="cc3-ic">${ICON.more}</span>
        </div>
        <img class="cc3-page cc3-p1" src="${x.img(SHOT.home)}" width="${PAGE.w}" height="${PAGE.h}" alt="superbot.gg: the agent to manage your agents.">
        <img class="cc3-page cc3-p2" src="${x.img(SHOT.ntp)}" width="${PAGE.w}" height="${PAGE.h}" alt="Chrome New Tab page">
        ${S.searches.map((s) => results(x, s)).join('')}
        ${watch(x)}
      </div>
      <svg class="cc3-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="${ARROW}"/></svg>
    </div>
    <i class="cc3-edge"><i class="cc3-soft"><i class="cc3-band"></i></i></i>
    ${hud(x, S.look, sb)}`;
}

// the nodes one view paints, looked up once
function bind(root) {
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const t1 = $('.cc3-t1'), res = $$('.cpx-res'), spr = $('.cpx-spr');
  return {
    t1, t2: $('.cc3-t2'), tt2: $('.cc3-t2 .cc3-tt'), plus: $('.cc3-plus'), cursor: $('.cc3-cursor'), bg1: t1.querySelector('.cc3-bg'),
    omni: $('.cc3-omni'), u1: $('.cc3-u1'), u2: $('.cc3-u2'), u3: $('.cpx-u3'), caret: $('.cc3-u2 .cc3-caret'), q: $('.cpx-q'), qCaret: $('.cpx-u3 .cc3-caret'),
    p1: $('.cc3-p1'), p2: $('.cc3-p2'), res, cards: res.map((g) => [...g.querySelectorAll('.cpx-th')]), watch: $('.cpx-watch'),
    fsbg: $('.cpx-fsbg'), player: $('.cpx-player'), ctx: spr.getContext('2d'), ctrl: $('.cpx-ctrl'), vbar: $('.cpx-bar i'), vt: $('.cpx-vt'),
    edge: $('.cc3-edge'), soft: $('.cc3-soft'), pill: $('.cc3-pill'),
    huds: $$('.cpx-hud'), fill: $('.cpx-fill'), lbl: $('.cpx-lbl'), n: $('.cpx-n'), pct: $('.cpx-pct'), spin: $('.cpx-spin'), ok: $('.cpx-ok'),
    tag: $('.cpx-tag'), segs: $$('.cpx-segs i'), ring: $('.cpx-ring'), shown: {}, frame: -1,
  };
}
// a text node's content, written only when it changes
const put = (v, key, node, text) => { if (node && v.shown[key] !== text) { node.textContent = text; v.shown[key] = text; } };

// --- one view at t ---

// the takeover (as computer.ba3976b6.js paints it) and the screen's cursor along the cut's path
function paintTakeover(v, S, t) {
  const g = outCubic(seg(t, S.take, S.take + 0.55));
  v.edge.style.opacity = g.toFixed(3);
  v.edge.style.setProperty('--cc3-a', `${((t * 60) % 360).toFixed(1)}deg`);
  v.soft.style.opacity = (0.9 + 0.08 * Math.sin(t * 2.6)).toFixed(3);
  const pi = outCubic(seg(t, S.take + 0.12, S.take + 0.57));
  v.pill.style.opacity = pi.toFixed(3);
  v.pill.style.transform = `translate(-50%, ${((1 - pi) * 8).toFixed(2)}px)`;
  const at = path(t, S.cursor);
  v.cursor.style.transform = `translate(${(at.x - TIP.x).toFixed(2)}px, ${(at.y - TIP.y).toFixed(2)}px)`;
  // in full screen the player hides an idle cursor, as players do
  if (S.cursorOut) v.cursor.style.opacity = (1 - seg(t, S.cursorOut, S.cursorOut + 0.3)).toFixed(3);
  return at;
}

// the new-tab button's hover and click, the new tab sliding in, and its title following its page
function paintTabs(v, S, t) {
  const h = seg(t, S.hov - 0.15, S.hov) * (1 - seg(t, S.open, S.open + 0.2));
  v.plus.style.background = `rgba(60,64,67,${(0.1 * h + 0.1 * press(t, S.click)).toFixed(3)})`;
  const o = outCubic(seg(t, S.open, S.open + 0.3));
  v.t2.style.width = `${(TAB_W * o).toFixed(2)}px`;
  v.t2.style.opacity = o.toFixed(3);
  v.bg1.style.opacity = (1 - outCubic(seg(t, S.open, S.open + 0.2))).toFixed(3);
  const s = [...S.searches].reverse().find((x) => t >= x.enter);
  put(v, 'tt2', v.tt2, t >= S.pick.click + 0.1 ? PLAYED.title : s ? `${s.q} - Search` : 'New Tab');
}

// the omnibox: superbot.gg, then the New Tab's focused empty box, then the query typing in; Enter leaves it unfocused
// with the query; a click back in (cut a) selects the old query whole and the new one types over it
function paintOmni(v, S, t) {
  const f = outCubic(seg(t, S.open + 0.04, S.open + 0.22));
  const s0 = S.searches[0], typing = t >= s0.type0;
  v.u1.style.opacity = (1 - f).toFixed(3);
  v.u2.style.opacity = typing ? '0' : f.toFixed(3);
  v.u3.style.opacity = typing ? '1' : '0';
  const back = S.refocus.findIndex((rf, j) => t >= rf && t < S.searches[j + 1].enter);
  const focus = (t >= S.open && t < s0.enter) || back >= 0;
  const k = t < s0.enter ? f : focus ? 1 : 0;
  v.omni.style.background = k > 0 ? `rgb(${Math.round(lerp(241, 255, k))},${Math.round(lerp(243, 255, k))},${Math.round(lerp(244, 255, k))})` : '';
  v.omni.style.boxShadow = k > 0 ? `inset 0 0 0 2px rgba(26,115,232,${(0.9 * k).toFixed(3)})` : '';
  v.caret.style.opacity = f >= 1 && !blink(t - S.open) ? '0' : '1';
  let i = 0;
  while (i + 1 < S.searches.length && t >= S.searches[i + 1].type0) i++;
  const s = S.searches[i], sel = back >= 0 && t >= S.refocus[back] + 0.05 && t < S.searches[back + 1].type0;
  put(v, 'q', v.q, s.q.slice(0, Math.round(s.q.length * seg(t, s.type0, s.type1))));
  v.q.classList.toggle('cpx-sel', sel);
  const keys = t >= s.type0 && t < s.enter;
  v.qCaret.style.opacity = !sel && (keys || (focus && blink(t - s.type0))) ? '1' : '0';
}

// the pages, each in over the last: superbot.gg, the New Tab page, each search's results (the videos landing in turn),
// the watch page. A result under the cursor takes its hover ring
function paintPages(v, S, t, cur) {
  const f = outCubic(seg(t, S.open + 0.04, S.open + 0.22));
  v.p1.style.opacity = (1 - f).toFixed(3);
  const ins = [S.open + 0.04, ...S.searches.map((s) => s.enter), S.pick.click + 0.08];
  [v.p2, ...v.res, v.watch].forEach((n, j) => {
    const a = outCubic(seg(t, ins[j], ins[j] + 0.18)), b = j + 1 < ins.length ? outCubic(seg(t, ins[j + 1], ins[j + 1] + 0.18)) : 0;
    n.style.opacity = (a * (1 - b)).toFixed(3);
  });
  v.cards.forEach((list, g) => {
    const s = S.searches[g], top = t >= s.enter + 0.3 && t < ins[g + 2];
    list.forEach((th, i) => {
      const c = outCubic(seg(t, s.enter + 0.06 + i * 0.05, s.enter + 0.28 + i * 0.05)), card = th.parentNode, at = thumbAt(i);
      card.style.opacity = c.toFixed(3);
      card.style.transform = c >= 1 ? 'none' : `translateY(${((1 - c) * 10).toFixed(2)}px)`;
      const over = top && Math.abs(cur.x - at.x) <= GRID.w / 2 && Math.abs(cur.y - at.y) <= GRID.h / 2;
      th.classList.toggle('is-over', over);
    });
  });
}

// the player: in with the watch page, the clip frame by frame off its sheet (held on its first frame until it plays,
// on its last after), its bar and clock; full screen (cut c) grows it over the whole desk on black, and its controls
// hide a moment later, as a player's do
function paintPlayer(v, S, t, sheet) {
  const w = outCubic(seg(t, S.pick.click + 0.08, S.pick.click + 0.32));
  const k = S.fs ? inOutCubic(seg(t, S.fs.on, S.fs.on + 0.4)) : 0;
  v.player.style.opacity = w.toFixed(3);
  const sc = k > 0 ? lerp(1, FULL.w / PLAYER.w, k) : lerp(0.97, 1, w);
  v.player.style.transform = sc === 1 && k === 0 ? 'none' : `translate(${((FULL.x - PLAYER.x) * k).toFixed(2)}px, ${((FULL.y - PLAYER.y) * k).toFixed(2)}px) scale(${sc.toFixed(4)})`;
  v.player.style.borderRadius = `${(12 * (1 - k)).toFixed(2)}px`;
  v.fsbg.style.opacity = k.toFixed(3);
  if (S.fs) v.ctrl.style.opacity = (1 - seg(t, S.fs.on + 1.4, S.fs.on + 1.7)).toFixed(3);
  const fr = clamp(Math.floor((t - S.play) * SPRITE.fps), 0, SPRITE.n - 1);
  if (fr !== v.frame && sheet.complete && sheet.naturalWidth) {
    v.ctx.drawImage(sheet, (fr % SPRITE.cols) * SPRITE.w, Math.floor(fr / SPRITE.cols) * SPRITE.h, SPRITE.w, SPRITE.h, 0, 0, SPRITE.w, SPRITE.h);
    v.frame = fr;
  }
  const pt = Math.max(0, t - S.play);
  v.vbar.style.transform = `scaleX(${Math.min(1, pt / PLAYED.len).toFixed(4)})`;
  put(v, 'vt', v.vt, `${clock(pt)} / ${PLAYED.dur}`);
}

// the HUD: in just after the pill; the bar's fill and percent; the task, the old one sliding up and out and the new
// one in after it; the step count; spinner or check; the step card's segments; the ring on a re-plan
function paintHud(v, S, events, t) {
  const g = outCubic(seg(t, S.take + 0.2, S.take + 0.65));
  for (const n of v.huds) n.style.opacity = g.toFixed(3);
  const p = progressAt(S.plans, t);
  if (v.fill) v.fill.style.transform = `scaleX(${p.toFixed(4)})`;
  put(v, 'pct', v.pct, `${Math.round(p * 100)}%`);
  let i = 0;
  while (i + 1 < events.length && t >= events[i + 1].at) i++;
  const cur = events[i], prev = i ? events[i - 1] : null, swap = prev && prev.label !== cur.label;
  const out = swap ? seg(t, cur.at, cur.at + 0.14) : 1, inn = swap ? seg(t, cur.at + 0.14, cur.at + 0.32) : 1;
  put(v, 'lbl', v.lbl, out < 1 ? prev.label : cur.label);
  v.lbl.style.opacity = (out < 1 ? 1 - out : inn).toFixed(3);
  v.lbl.style.transform = out < 1 ? `translateY(${(-4 * out).toFixed(2)}px)` : inn < 1 ? `translateY(${(4 * (1 - inn)).toFixed(2)}px)` : 'none';
  put(v, 'n', v.n, COUNT[S.look](cur));
  if (v.spin) {
    v.spin.style.display = cur.done ? 'none' : '';
    v.spin.style.transform = `rotate(${((t * 400) % 360).toFixed(1)}deg)`;
    v.ok.style.display = cur.done ? '' : 'none';
  }
  if (v.tag) { put(v, 'tag', v.tag, cur.done ? 'Done' : 'Now'); v.tag.classList.toggle('is-done', !!cur.done); }
  v.ring.style.setProperty('--cpx-ring', flashAt(S.plans, t).toFixed(3));
  if (v.segs.length) paintSegments(v, S, t);
}

// the step card's segments: one per step of the plan on show, each filling as its step runs; a re-plan grows in the
// steps it adds (and eases each segment from the old plan's fill)
function paintSegments(v, S, t) {
  const pi = planAt(S.plans, t), plan = S.plans[pi], old = pi ? S.plans[pi - 1] : null;
  const b = old ? outCubic(seg(t, plan.at, plan.at + REPLAN)) : 1;
  v.segs.forEach((n, j) => {
    const inNew = j < plan.steps.length, inOld = old ? j < old.steps.length : inNew;
    const grow = inNew ? (inOld ? 1 : b) : inOld ? 1 - b : 0;
    const now = inNew ? seg(t, plan.steps[j].a, plan.steps[j].b) : 0;
    const fill = old ? lerp(inOld ? seg(plan.at, old.steps[j].a, old.steps[j].b) : 0, now, b) : now;
    n.style.display = grow > 0 ? '' : 'none';
    n.style.flexGrow = grow.toFixed(3);
    n.style.marginLeft = j ? `${(3 * grow).toFixed(2)}px` : '0';
    n.firstElementChild.style.transform = `scaleX(${fill.toFixed(4)})`;
  });
}

function paint(v, S, events, t, sheet) {
  const cur = paintTakeover(v, S, t);
  paintTabs(v, S, t);
  paintOmni(v, S, t);
  paintPages(v, S, t, cur);
  paintPlayer(v, S, t, sheet);
  paintHud(v, S, events, t);
}

// --- the beat ---

// superbot's line, streamed in as the engine streams a reply
function sayOf(x, text) {
  const n = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  const vis = n.firstElementChild, hid = n.lastElementChild;
  let shown = -1;
  return { n, render(t, t0) { const c = streamCount(text, t0, 70, t); if (c !== shown) { vis.textContent = text.slice(0, c); hid.textContent = text.slice(c); shown = c; } } };
}

// a view's pictures load on its first frame (so the other variants never fetch them); a frozen frame waits on them
function wake(root) {
  for (const pic of root.querySelectorAll('img[data-src]')) {
    pic.src = pic.dataset.src;
    pic.removeAttribute('data-src');
    track(pic.decode().catch((e) => console.error(new Error(`computer-control progress picture failed to decode: ${pic.src}`, { cause: e }))));
  }
}

function build(k, x) {
  loadFrameSheet();
  loadSheets();
  const S = k.T, events = eventsOf(S.plans, S.done);
  const sb = x.tile('superbot', 'cc3-sb');
  const say = sayOf(x, S.say);
  const block = x.el(`<div class="bk cc3 cpx">
    <div class="bk-head">
      <b class="bk-title">Your computer<small>Live view</small></b>
      ${shareBtn('Computer control')}
      ${EXPAND}
      <span class="bk-btn bk-publish cc3-stop"><i></i>Stop</span>
    </div>
    <div class="bk-view cc3-screen">${screen(x, S, sb, FIT)}</div>
  </div>`);
  const card = bind(block);
  // the follow-ups: the user's bubble as the engine draws an ask, and superbot's answer under it
  const follow = S.msgs.map((m) => {
    const u = x.el(`<div class="msg qc-u"><span class="avatar">S</span><div class="m-main"><div class="m-head"><span class="m-name">sam</span></div><div class="m-text">${x.esc(m.text)}</div></div></div>`);
    const r = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"></div></div>`);
    const s = sayOf(x, m.say);
    r.lastElementChild.append(s.n);
    return { m, u, r, s };
  });
  const sheet = new Image();

  // Expand: the v3-soft cut's side panel on the right of the app, the same screen share larger, painted from the same t
  const expand = block.querySelector('.bk-expand');
  expand.setAttribute('role', 'button');
  expand.setAttribute('tabindex', '0');
  expand.setAttribute('aria-expanded', 'false');
  let side = null, big = null, open = false;
  const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
  function setOpen(on) {
    if (on === open) return;
    if (on && !side) {
      side = x.el(`<aside class="cc3-side" aria-label="Your computer, live view">
        <div class="bk-head">
          <b class="bk-title">Your computer<small>Live view</small></b>
          <span class="bk-btn bk-publish cc3-stop"><i></i>Stop</span>
          <button class="cc3-side-x" type="button" aria-label="Close">${ICON.close}</button>
        </div>
        <div class="cc3-screen cc3-big">${screen(x, S, sb, FIT_BIG)}</div>
      </aside>`);
      block.closest('.hub').appendChild(side);
      big = bind(side);
      wake(side);
      side.querySelector('.cc3-side-x').addEventListener('click', () => setOpen(false));
      // keys on the panel's buttons are theirs, not the spot clock's (space would pause it)
      side.addEventListener('keydown', (e) => { if (e.target.closest('button')) e.stopPropagation(); });
      side.getBoundingClientRect(); // lay it out closed first, so the first open slides in
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

  let placed = false, woke = false;
  return {
    nodes: [say.n, block, ...follow.flatMap((f) => [f.u, f.r])],
    // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
    marks: [[S.r, say.n], [S.card, block], ...follow.flatMap((f) => [[f.m.send, f.u], [f.m.r, f.r]])],
    // the follow-ups, typed into the composer and sent by the engine (renderComposer)
    asks: S.msgs.map((m) => ({ text: m.text, s: m.s, typeEnd: m.typeEnd, send: m.send })),
    render(t) {
      if (!placed) {
        // the follow-ups leave the engine's reply for the feed, in order right after it
        let at = say.n.closest('.msg');
        for (const f of follow) { at.after(f.u, f.r); at = f.r; }
        placed = true;
      }
      if (!woke) {
        woke = true;
        wake(block);
        sheet.src = x.img(SPRITE.src);
        track(sheet.decode().catch((e) => console.error(new Error(`computer-control progress clip failed to decode: ${sheet.src}`, { cause: e }))));
      }
      say.render(t, S.r + 0.06);
      const ci = outCubic(seg(t, S.card, S.card + 0.45));
      block.style.opacity = ci.toFixed(3);
      block.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
      paint(card, S, events, t, sheet);
      for (const f of follow) {
        x.appear(f.u, t, f.m.send);
        x.appear(f.r, t, f.m.r);
        f.s.render(t, f.m.r + 0.06);
      }
      // the panel belongs to the card: a restart that takes the card away closes it
      if (open && t < S.card) setOpen(false);
      if (open) paint(big, S, events, t, sheet);
    },
  };
}

// one beat per cut. `end` is the route's end (chat.9b47fc30.js routeBy: the base end plus `extra`, LEN less the base
// beat's); it should be the plan's own, and a mismatch is reported rather than cut short
const beat = (id) => ({
  times(r, end) {
    const T = SCRIPTS[id](r);
    if (end !== undefined && Math.abs(end - T.end) > 0.05) console.error(new Error(`computer-control progress ${id}: the route ends at ${end.toFixed(2)}, the plan at ${T.end.toFixed(2)}`));
    return T;
  },
  build,
});
export const progressA = beat('a');
export const progressB = beat('b');
export const progressC = beat('c');
