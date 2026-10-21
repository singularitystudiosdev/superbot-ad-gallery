// Gym site beat (the 'gym-site' variant): the bikeride spot's arc (one ask, superbot works, the result plays over the
// whole frame, then the end card) cut in the 'yt-thumbnail' look (beats/ytthumb.c4e81a27.js): a bare route, no model
// chips, no "<model> in superbot" header, the composer on Superbot throughout, every compressed wait on the house
// fast-forward badge. The engine holds the empty state WAIT seconds longer (chat.9b47fc30.js routeBy `wait`), types
// "Build a website for my gym, Plate Math Barbell Club." at TYPE_CPS by hand (keystrokes() below) and sends it; this
// beat draws everything else on its own clock:
//   1. The answer: one chip, "Building your site", then the build frame: the site's four parts resolving one by one
//      (x30 on the badge), the frame reading Ready.
//   2. "Your site is ready." and the preview frame: the site itself, live in a 1280 x 800 frame.
//   3. The site grows out of the preview to the whole frame, then scrolls from its hero to its last section.
//   4. The house superbot.gg end card (multicat.516afb1a.js's, ../multicat.516afb1a.css .mc-end) covers it.
// The site is real (../../../img/gymsite.6e110402/site/, its CREDITS.txt), but it was built by hand for this ad, not by
// a superbot run, so the demo note ("Simulated demo. Site built for this ad.") sits on the frame's foot from the first
// chip until the end card: without it the cut would claim an output superbot did not produce (X's Deceptive Content,
// "misleading tactics or claims"; the MSA's "results ... representative of outcomes a typical user can expect").
// Made to pass X's ads policies the way the thumbnail cut does: no other company's logo, product or feature name on
// screen (the chip wears a plain globe); a made-up gym with no address, phone, domain or price, so nothing reads as an
// offer (Deceptive Content, "offers or deals that are not available"); no people in the site's photos (CC0 equipment
// shots); no body, weight-loss or supplement claim (Unacceptable Content, Healthcare); the ask written as a sentence
// (Quality). Silent on purpose: a creator's voice is the soundtrack (?cues=1 shows the script). A pure function of t:
// the site is static and its scroll is set from t, so frozen frames (?t=) hold.
import { clamp, lerp, seg, outCubic, outQuint, outBack, inOutCubic, streamCount, rand } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';

const CSS = new URL('../gymsite.6e110402.css?v=2', import.meta.url).href;
// the frames, status rings, state pills and the clean-page rule are the thumbnail cut's; the end card and badge multicat's
const YT_CSS = new URL('../ytthumb.c4e81a27.css?v=6', import.meta.url).href;
const MC_CSS = new URL('../multicat.516afb1a.css?v=9', import.meta.url).href;
export const ID = 'gym-site';
const SITE = new URL('../../../img/gymsite.6e110402/site/index.html', import.meta.url).href;
const GYM = 'Plate Math Barbell Club';

// the ask types at this average rate (characters a second), unevenly, as the thumbnail cut's do
export const TYPE_CPS = 21;
// the empty state holds this long past the engine's CHAT_T0 (1.6 s): the ask starts typing at 2.6 s
export const WAIT = 1;
// the ask, as the engine's askBy words it (chat.9b47fc30.js); a sentence, for X's Quality policy
const ASK1 = 'Build a website for my gym, Plate Math Barbell Club.';
const SAY_B = 'Your site is ready.';
const NOTE = 'Simulated demo. Site built for this ad.';

// a hand's keystrokes for `text` (beats/ytthumb.c4e81a27.js keystrokes): each key's gap jittered, a beat more before
// each word, now and then a short hesitation, deterministic per seed, scaled to exactly text.length / TYPE_CPS
function keystrokes(text, seed) {
  const keys = [];
  let at = 0;
  for (let i = 0; i < text.length; i++) {
    let gap = 0.55 + 0.9 * rand(seed * 97 + i);
    if (text[i - 1] === ' ') gap += 0.6 + 0.9 * rand(seed * 131 + i);
    if (i > 2 && rand(seed * 173 + i) < 0.08) gap += 2.2;
    at += gap;
    keys.push(at);
  }
  const k = text.length / TYPE_CPS / at;
  return keys.map((x) => x * k);
}
const KEYS1 = keystrokes(ASK1, 5);

// the build, about 80 s of an agent planning and writing four sections, shown in under 3 s: x30 on the badge
const X_BUILD = 30;
const FF_IN = 0.2;
const SEEN = 0.45;   // a card's rise and the feed's glide to it (multicat.516afb1a.js SEEN)
const LOOK = 1.2;    // the preview holds this long before the site takes the frame
const OPEN = 0.75;   // the preview growing to the whole frame
// the hero holds, then the page scrolls in legs: to the plate math (the bar loads as it comes in), a look, to the floor,
// a look, to the foot, which holds. Each leg eases in and out; [glide, hold] seconds
const HOLD_TOP = 0.9, LEGS = [[1.5, 1.1], [1.4, 0.5], [1.8, 0.5]];
const SCROLL = LEGS.reduce((a, [m, h]) => a + m + h, 0) - LEGS[LEGS.length - 1][1], HOLD_END = LEGS[LEGS.length - 1][1];
// what each leg stops on: the calculator centred in the frame, the floor's top, the page's foot
const STOPS = ['[data-calc]', '#floor', null];
// the house end card (multicat.516afb1a.js): the frame fades to black over END_IN, the lockup's run starts END_DELAY in
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.8, END_GAP = 44;
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const END_FACE = '<svg class="mc-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="gymEndFace6e11" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#gymEndFace6e11)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#gymEndFace6e11)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#gymEndFace6e11)"/></svg>';

// the routing chip this beat draws: the browser's plain globe (chat.9b47fc30.js APPS.web), a tool, so the composer's
// chip stays on Superbot; `hold` is how long it spins before it resolves
const chip = (app, label, sw, hold) => ({ app, label, tool: true, sw, swap: sw + 0.22, done: sw + hold });

// every time in the chain from the reply r: the chip lands, the build frame comes in (`bd`), its four parts resolve
// (`parts`) and it reads Ready; the line streams at rB and the preview comes in at `prev`; the site takes the frame from
// `open` to `opened`, holds its hero, scrolls from s0 to s1, holds its foot; the end card covers it at `cut`
function plan(r) {
  const c2 = chip('web', 'Building your site', r + 0.15, 0.9);
  const bd = c2.done + 0.15, bd1 = bd + SEEN;
  const parts = [bd1 + 0.45, bd1 + 0.9, bd1 + 1.35, bd1 + 1.8];
  const ready = parts[3] + 0.25;
  const rB = ready + 0.9, prev = rB + 0.25, prev1 = prev + SEEN;
  const open = prev1 + LOOK, opened = open + OPEN;
  const s0 = opened + HOLD_TOP, s1 = s0 + SCROLL;
  const cut = s1 + HOLD_END;
  return { r, c2, bd, bd1, parts, ready, rB, prev, prev1, open, opened, s0, s1, cut, end: cut + END_DELAY + END_LEN };
}
// the chain's length from its reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

// the script a creator reads over it (?cues=1 shows each line as its beat starts); no other company's product named,
// and no line says superbot built this particular site
const LINES = (T, s) => [
  [0.3, 'superbot does the work you ask for, right in the chat.'],
  [s, 'Say my gym needs a website.'],
  [T.c2.sw, 'It plans the pages and writes the site. Sped up here.'],
  [T.rB - 0.2, 'Then it hands me a preview.'],
  [T.opened, 'Hero, training, the floor, the rules and the hours.'],
  [T.cut, 'Try it at superbot.gg.'],
];

let sheet = null;
function loadSheet() {
  if (sheet) return;
  const load = (href) => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    track(new Promise((done) => {
      l.onload = done;
      l.onerror = () => { console.error(new Error(`gym-site variant stylesheet failed to load: ${href}`)); done(); };
    }));
    document.head.appendChild(l);
    return l;
  };
  sheet = load(CSS);
  load(YT_CSS);
  load(MC_CSS);
}

// a block's entrance: it rises and settles in over 0.45s from `at` (the other beats' card entrance)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
  return ci;
}
const fade = (n, p) => { n.style.opacity = p.toFixed(3); n.style.visibility = p > 0 ? '' : 'hidden'; };
function pop(n, t, at) {
  const p = seg(t, at, at + 0.3);
  n.style.opacity = p.toFixed(3);
  n.style.transform = p >= 1 ? 'none' : `scale(${lerp(0.3, 1, outBack(p)).toFixed(4)})`;
}

// the streamed line a reply opens with: the visible prefix, the rest held in place transparent
function sayEl(x, text) {
  const n = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  let shown = -1;
  return { n, render(t, at) {
    const c = streamCount(text, at + 0.06, 70, t);
    if (c !== shown) { n.firstElementChild.textContent = text.slice(0, c); n.lastElementChild.textContent = text.slice(c); shown = c; }
  } };
}

// a status that waits (a dim ring), spins from `from`, then resolves to a green check at `at` (ytthumb's)
const STATUS = '<span class="yt-ck"><i class="yt-ring"></i><i class="yt-spin"></i><svg class="yt-ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>';
function renderStatus(n, t, from, at) {
  const ring = n.querySelector('.yt-ring'), spin = n.querySelector('.yt-spin'), ok = n.querySelector('.yt-ok');
  const on = seg(t, from - 0.1, from + 0.05) * (1 - seg(t, at - 0.08, at + 0.06));
  ring.style.opacity = (1 - seg(t, from - 0.1, from + 0.05)).toFixed(3);
  spin.style.opacity = on.toFixed(3);
  spin.style.transform = `rotate(${((t - from) * 420).toFixed(1)}deg)`;
  const p = seg(t, at, at + 0.3);
  ok.style.opacity = p.toFixed(3);
  ok.style.transform = p >= 1 ? 'none' : `scale(${lerp(0.3, 1, outBack(p)).toFixed(4)})`;
}
const statePill = (wait, done) => `<span class="yt-state"><span class="yt-state-wait"><i class="yt-spin"></i>${wait}</span><span class="yt-state-on"><svg class="yt-ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>${done}</span></span>`;
function renderState(n, t, from, at) {
  const wait = n.querySelector('.yt-state-wait'), on = n.querySelector('.yt-state-on'), spin = wait.querySelector('.yt-spin');
  spin.style.transform = `rotate(${((t - from) * 420).toFixed(1)}deg)`;
  fade(wait, 1 - seg(t, at + 0.02, at + 0.16));
  pop(on, t, at + 0.1);
}

// glyphs: Lucide (ISC) strokes, drawn in currentColor
const G = {
  code: '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
};
const g = (name) => `<svg class="yt-g" viewBox="0 0 24 24" aria-hidden="true">${G[name]}</svg>`;

// the site's four parts, as its sections read (../../../img/gymsite.6e110402/site/index.html)
const PARTS = [['Hero and headline', '“Add a plate.”'], ['Training', '3 programs'], ['The floor and its rules', '4 rules'], ['Hours', 'open 7 days']];

// opened straight on this cut (?variant=gym-site), the page is the app alone: no control pills, no key hint, the tab
// titled superbot (?controls=1 keeps them), the thumbnail cut's rule (../ytthumb.c4e81a27.css body.yt-clean)
const CLEAN = (() => { const q = new URLSearchParams(location.search); return q.get('variant') === ID && q.get('controls') !== '1'; })();

// a same-origin frame of the site, resolved once its page, fonts and photos are in (the renderer's track() waits on it)
function siteFrame(title) {
  const f = document.createElement('iframe');
  f.title = title;
  f.setAttribute('tabindex', '-1');
  f.setAttribute('aria-hidden', 'true');
  f.src = SITE;
  track(new Promise((done) => {
    f.addEventListener('load', () => {
      const d = f.contentDocument;
      const pics = d ? [...d.images].map((im) => im.decode().catch((e) => console.error(new Error(`gym-site photo failed to decode: ${im.src}`, { cause: e })))) : [];
      Promise.all([d ? d.fonts.ready : null, ...pics]).then(done, (e) => { console.error(new Error('gym-site frame did not settle', { cause: e })); done(); });
    }, { once: true });
    f.addEventListener('error', () => { console.error(new Error(`gym-site frame failed to load: ${SITE}`)); done(); }, { once: true });
  }));
  return f;
}

// the site's clock animations (document timeline), paused and set to `ms` since they started; its scroll-driven ones
// (view timelines) are left to the scroll. Each animation's own delay is inside its currentTime, as on a live page
function seekClock(frame, ms) {
  const doc = frame.contentDocument;
  if (!doc || !doc.getAnimations) return;
  for (const a of doc.getAnimations()) {
    if (a.timeline !== doc.timeline) continue;
    if (a.playState !== 'paused') a.pause();
    if (a.currentTime !== ms) a.currentTime = ms;
  }
}

// the scroll positions each leg ends on, in the site's own document: the calculator centred in the frame, the floor's
// top, the foot (the page's end)
function stopsOf(doc, win, H, max) {
  return STOPS.map((sel) => {
    if (!sel) return max;
    const el = doc.querySelector(sel);
    if (!el) { console.error(new Error(`gym-site: the site has no ${sel} to stop on`)); return max; }
    // layout offsets, not getBoundingClientRect: a block mid-reveal is translated, and the stop must not depend on that
    let top = 0;
    for (let e = el; e; e = e.offsetParent) top += e.offsetTop;
    const y = sel === '[data-calc]' ? top - (H - el.offsetHeight) / 2 : top;
    return clamp(y, 0, max);
  });
}

// the scroll at t: legs from the hero (0) to each stop, each eased in and out, with its hold after it
function scrollAt(t, s0, stops) {
  let at = s0, from = 0;
  for (let i = 0; i < LEGS.length; i++) {
    const [glide, hold] = LEGS[i], to = stops[i] ?? from;
    if (t < at + glide) return lerp(from, to, inOutCubic(seg(t, at, at + glide)));
    at += glide + hold;
    from = to;
  }
  return from;
}

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the chain keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheet();
    loadFrameSheet();
    const T = k.T;
    const cueLines = LINES(T, k.s);

    // 1. the chip rides in the engine's own reply (a bare route's reply shows nothing until the chip lands); the build
    // frame follows it, moved in after that reply on the first render
    const chipEl = (c) => x.el(`<span class="qc-sw">${x.tile(c.app)}<span class="qc-swl">${x.esc(c.label)}</span><span class="qc-st"><i class="qc-spin"></i>${x.OK}</span></span>`);
    const sp2 = chipEl(T.c2);
    const sw2 = { c: T.c2, sw: sp2, spin: sp2.querySelector('.qc-spin'), ok: sp2.querySelector('.qc-st .qc-ok') };

    const build = x.el(`<div class="bk yt-yt gs-build">
      <div class="bk-head"><span class="yt-logo">${g('code')}</span><b class="bk-title">Your site<small>${GYM}</small></b>${statePill('Building', 'Ready')}</div>
      <div class="yt-ctx">${PARTS.map(([a, b]) => `<div class="yt-ctx-r">${STATUS}<span class="yt-ctx-t"><b>${x.esc(a)}</b><small>${x.esc(b)}</small></span></div>`).join('')}</div>
    </div>`);
    const partRows = [...build.querySelectorAll('.yt-ctx-r')];
    const buildState = build.querySelector('.yt-state');
    const replyA = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"></div></div>`);
    const anchorA = x.el('<i class="mc-anchor" aria-hidden="true"></i>');
    replyA.lastElementChild.append(build, anchorA);

    // 2. the line and the preview: the site itself in a 1280 x 800 frame, scaled to the reply's width (no button in the
    // head: a button in a video is a call to action no viewer can press)
    const replyB = x.el(`<div class="msg qc-m qc-r gs-wide">${x.sbAvatar}<div class="m-main"></div></div>`);
    const sayB = sayEl(x, SAY_B);
    const prev = x.el(`<div class="bk gs-prev">
      <div class="bk-head"><span class="yt-logo">${g('globe')}</span><b class="bk-title">Preview<small>${GYM}</small></b></div>
      <div class="gs-prev-view"></div>
    </div>`);
    const prevView = prev.querySelector('.gs-prev-view');
    const prevFrame = siteFrame(`${GYM}, preview`);
    prevView.append(prevFrame);
    const anchorB = x.el('<i class="mc-anchor" aria-hidden="true"></i>');
    replyB.lastElementChild.append(sayB.n, prev, anchorB);

    // 3. the site over the whole frame, its own frame at the stage's size so the page lays out for that width
    const full = x.el('<div class="gs-full" aria-hidden="true"></div>');
    const fullFrame = siteFrame(GYM);
    full.append(fullFrame);
    let fullW = 0, fullH = 0, scrollMax = -1, stops = [];

    // 4. the end card, the badge, the demo note, and the cue strip (?cues=1 only)
    const endCard = x.el(`<div class="mc-end" role="img" aria-label="superbot.gg"><div class="mc-end-word"><b>superbot.gg</b></div><div class="mc-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.mc-end-word'), endBot = endCard.querySelector('.mc-end-bot');
    let endK = 1;
    const ff = x.el(`<div class="mc-ff" aria-hidden="true">x${X_BUILD}</div>`);
    const note = x.el(`<div class="gs-note">${x.esc(NOTE)}</div>`);
    const cues = new URLSearchParams(location.search).get('cues') === '1';
    const cue = x.el('<div class="yt-cue" aria-live="off"><span class="yt-cue-k">Voiceover</span><span class="yt-cue-t"></span></div>');
    const cueT = cue.lastElementChild;
    let cueAt = -1;

    const follow = [replyA, replyB];
    let placed = false, prevScale = 0;
    if (k.askBy[ID] !== ASK1) console.error(new Error(`gym-site: the engine's ask "${k.askBy[ID]}" is not the one this beat schedules keystrokes for`));

    return {
      nodes: [sw2.sw, ...follow, full, endCard, ff, note, cue],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[T.c2.sw, sw2.sw], [T.bd, anchorA], [T.rB, sayB.n], [T.prev, anchorB]],
      keys: KEYS1,
      asks: [],
      chips: [T.c2],
      render(t) {
        const scene = x.hub.closest('.scene');
        if (!placed) {
          let at = sw2.sw.closest('.msg');
          for (const m of follow) { at.after(m); at = m; }
          scene.append(full, endCard, ff, note);
          if (CLEAN) {
            document.body.classList.add('yt-clean');
            document.title = 'superbot';
          }
          if (cues) scene.append(cue); else cue.remove();
          placed = true;
        }

        // 1. the chip and the build frame: its four parts resolve, then it reads Ready
        x.appear(sw2.sw, t, T.c2.sw);
        x.renderSwitch(sw2, t);
        x.appear(replyA, t, T.bd);
        enter(build, t, T.bd);
        renderState(buildState, t, T.bd, T.ready);
        partRows.forEach((n, i) => renderStatus(n, t, i ? T.parts[i - 1] : T.bd1, T.parts[i]));
        const ffBuild = seg(t, T.c2.sw - FF_IN, T.c2.sw) * (1 - seg(t, T.ready, T.ready + 0.25));
        fade(ff, ffBuild);

        // 2. the line and the preview, its 1280-wide page scaled to the frame's width
        x.appear(replyB, t, T.rB);
        sayB.render(t, T.rB);
        enter(prev, t, T.prev);
        const pw = prevView.clientWidth;
        if (pw && pw / 1280 !== prevScale) { prevScale = pw / 1280; prevFrame.style.transform = `scale(${prevScale.toFixed(5)})`; }

        // 3. the site takes the frame: it grows from the preview's rectangle (clipped to it) to the whole stage, holds its
        // hero, then scrolls to its foot
        const W = scene.clientWidth, H = scene.clientHeight;
        if (W !== fullW || H !== fullH) { full.style.width = `${W}px`; full.style.height = `${H}px`; fullW = W; fullH = H; scrollMax = -1; }
        const g0 = seg(t, T.open, T.opened);
        if (g0 > 0) {
          const p = inOutCubic(g0);
          const sr = scene.getBoundingClientRect(), vr = prevView.getBoundingClientRect();
          const kpx = sr.width / W || 1;                       // screen pixels per stage pixel
          const s0 = vr.width / sr.width;                      // the preview's width as a share of the frame
          const x0 = (vr.left - sr.left) / kpx, y0 = (vr.top - sr.top) / kpx;
          const clipB = H - (vr.height / kpx) / s0;            // crop the frame to the preview's height while it grows
          const s = lerp(s0, 1, p);
          full.style.transform = p >= 1 ? 'none' : `translate(${lerp(x0, 0, p).toFixed(2)}px, ${lerp(y0, 0, p).toFixed(2)}px) scale(${s.toFixed(5)})`;
          full.style.clipPath = p >= 1 ? 'none' : `inset(0 0 ${Math.max(0, lerp(clipB, 0, p)).toFixed(2)}px 0 round ${lerp(8 / s0, 0, p).toFixed(2)}px)`;
          fade(full, outCubic(clamp(g0 / 0.3)));
        } else fade(full, 0);
        // the site's clock animations (its hero entrance, the open dot, the ticker) run from the moment the preview
        // comes in, in both frames, so the two always show one state; its scroll-driven ones follow the scroll below
        const since = Math.max(0, t - T.prev) * 1000;
        seekClock(prevFrame, since);
        seekClock(fullFrame, since);
        const win = fullFrame.contentWindow, doc = fullFrame.contentDocument;
        // the frame starts on about:blank: measure only once the site's own page (its footer) is in
        if (win && doc && doc.readyState === 'complete' && doc.querySelector('.foot')) {
          if (scrollMax < 0) { scrollMax = Math.max(0, doc.documentElement.scrollHeight - H); stops = stopsOf(doc, win, H, scrollMax); }
          // instant, never the site's own smooth scrolling (site.css scroll-behavior), which would glide on the
          // browser's clock and leave a frame short of where t puts it
          const y = Math.round(scrollAt(t, T.s0, stops));
          if (win.scrollY !== y) win.scrollTo({ top: y, behavior: 'instant' });
        }

        // the demo note: from the first chip to the end card
        fade(note, seg(t, T.c2.sw - 0.2, T.c2.sw) * (1 - seg(t, T.cut, T.cut + END_IN)));

        // 4. the end card: the frame fades to black, then the house card's own run (multicat.516afb1a.js)
        const cover = seg(t, T.cut, T.cut + END_IN);
        endCard.style.opacity = cover.toFixed(3);
        endCard.style.visibility = cover > 0 ? '' : 'hidden';
        if (cover > 0) {
          const tc = t - (T.cut + END_DELAY);
          const EW = endCard.clientWidth, EH = endCard.clientHeight;
          const natW = endWord.offsetWidth / endK;
          const kk = Math.min(1, (EW * 0.86) / (natW + END_GAP + 220));
          if (kk !== endK) { endCard.style.setProperty('--k', kk.toFixed(4)); endK = kk; }
          const w = 220 * kk, wordW = natW * kk, gap = END_GAP * kk;
          const left = (EW - (wordW + gap + w)) / 2, midY = EH / 2;
          const pp = clamp(tc / 0.55), shift = outQuint(clamp((tc - 0.3) / 1.0));
          endBot.style.opacity = outQuint(clamp(tc / 0.3)).toFixed(3);
          endBot.style.transform = `translate(${(left + wordW + gap).toFixed(2)}px, ${(midY - w / 2).toFixed(2)}px) scale(${(0.72 + 0.28 * popBack(pp)).toFixed(4)})`;
          endWord.style.opacity = shift.toFixed(3);
          endWord.style.filter = shift < 1 ? `blur(${(6 * kk * (1 - shift)).toFixed(2)}px)` : 'none';
          endWord.style.transform = `translate(${(left - 20 * kk * (1 - shift)).toFixed(2)}px, -50%)`;
        }

        if (cues) {
          let i = -1;
          cueLines.forEach(([a], j) => { if (t >= a) i = j; });
          if (i !== cueAt) { cueT.textContent = i >= 0 ? cueLines[i][1] : ''; cueAt = i; }
          fade(cue, i >= 0 ? outCubic(seg(t, cueLines[i][0], cueLines[i][0] + 0.25)) : 0);
        }
      },
    };
  },
};
