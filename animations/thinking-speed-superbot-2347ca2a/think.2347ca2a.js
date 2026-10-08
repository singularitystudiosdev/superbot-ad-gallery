// think.2347ca2a.js: image 1, live. thought-variants/b's thinking bubble (desk-thought.js), its mascot
// (mascot.js, the thinking pose) and its marks and "actual speed" note, at the crop the screenshot was taken at,
// drawn as a pure function of t so the ad can seek frame-exact.
// The pacer, the whole-word cut, the clock and the line shift are desk-thought.js's (themselves superbot-desktop's
// reasoning-pacer.ts, step-words.ts formatClock and thought-bubble.tsx lineShift), copied as they are, with the
// page's FAST knobs and BEAT_MS. The one change is the clock they run on: instead of rAF and setTimeout, the
// stream is simulated once on a 120 Hz frame grid (the display image 1 was captured on: its first pacer step
// reveals exactly "They're asking: “Schedule a meeting", 35 of 261 chars), and each frame reads that timeline.

const FAST = { holdMs: 0, leadMs: 60, tailMs: 60, minCps: 2500, maxCps: 20000 };
const STEP_SEP = ' · ';
const CLOCK_TICK_MS = 250;
const BEAT_MS = 40;
const KEEP_THOUGHTS = 6;
const WORD_IN_MS = 80;      // desk-thought.css: a new word fades in over 80 ms
const SCROLL_MS = 100;      // desk-thought.css: a new line glides up over 100 ms
const SHEEN_MS = 1800, SHEEN_STEPS = 24;
const FRAME_MS = 1000 / 120;

// ---------- desk-thought.js, verbatim ----------
/** reasoning-pacer.ts pacerStep: advance `shown` toward `target` characters at `now`. */
function pacerStep(state, target, ended, now, knobs) {
  if (target <= 0) return { shown: 0, lastAt: now };
  const firstAt = state.firstAt ?? now;
  if (now - firstAt < knobs.holdMs) return { shown: 0, firstAt, lastAt: now };
  const shown = Math.min(state.shown, target);
  const dt = state.lastAt === undefined ? 0 : Math.max(0, now - state.lastAt);
  const backlog = target - shown;
  if (backlog <= 0) return { shown: target, firstAt, lastAt: now };
  const window = ended ? knobs.tailMs : knobs.leadMs;
  const cps = Math.min(knobs.maxCps, Math.max(knobs.minCps, (backlog / window) * 1000));
  return { shown: Math.min(target, shown + (cps * dt) / 1000), firstAt, lastAt: now };
}

/** reasoning-pacer.ts isSpaceCode. */
function isSpaceCode(code) {
  if (code <= 0x20) return code === 0x20 || (code >= 0x09 && code <= 0x0d);
  if (code < 0xa0) return false;
  return code === 0xa0 || code === 0x1680 || (code >= 0x2000 && code <= 0x200a) || code === 0x2028 || code === 0x2029 || code === 0x202f || code === 0x205f || code === 0x3000 || code === 0xfeff;
}

/** reasoning-pacer.ts revealedEnd: the end of the last whole word at `shown`. */
function revealedEnd(text, shown) {
  if (shown >= text.length) return text.length;
  const cut = Number.isNaN(shown) ? 0 : Math.max(0, Math.floor(shown));
  if (isSpaceCode(text.charCodeAt(cut))) return cut;
  for (let index = cut - 1; index >= 0; index -= 1) {
    if (isSpaceCode(text.charCodeAt(index))) return index;
  }
  return 0;
}

/** reasoning-pacer.ts revealedTrimmedEnd. */
function revealedTrimmedEnd(text, shown) {
  let end = revealedEnd(text, shown);
  while (end > 0 && isSpaceCode(text.charCodeAt(end - 1))) end -= 1;
  return end;
}

/** step-words.ts formatClock: the live clock, floored whole seconds. */
function formatClock(ms) {
  const total = Number.isFinite(ms) && ms > 0 ? Math.floor(ms / 1000) : 0;
  if (total < 60) return `${total}s`;
  return `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, '0')}s`;
}

/** thought-bubble.tsx lineShift: how far the folded text scrolls when it grows. */
function lineShift(before, after, box) {
  return Math.max(0, Math.max(0, after - box) - Math.max(0, before - box));
}

// ---------- the page's markup (index.html marks + mascot, desk-thought.js MARKUP, the speed note) ----------
const MARKUP = `
  <div class="marks">
    <span class="plus plus-a"></span><span class="plus plus-b"></span>
    <span class="sq sq-a"></span><span class="sq sq-b"></span><span class="sq sq-c"></span><span class="sq sq-d"></span>
    <span class="dot"></span>
  </div>
  <div class="mascot">
    <svg class="mark" viewBox="0 0 100 100" focusable="false">
      <defs>
        <mask id="tv-mark-face" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160">
          <g fill="#fff">
            <rect x="14" y="32" width="72" height="54" rx="15"/>
            <path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/>
            <path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/>
          </g>
          <g fill="#000">
            <ellipse class="mark-eye mark-eye-l" cx="35" cy="58" rx="8" ry="11"/>
            <ellipse class="mark-eye mark-eye-r" cx="65" cy="58" rx="8" ry="11"/>
          </g>
        </mask>
      </defs>
      <g class="mark-body">
        <rect class="ghost-teal" x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#tv-mark-face)"/>
        <rect class="ghost-magenta" x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#tv-mark-face)"/>
        <rect x="-30" y="-30" width="160" height="160" fill="#ffffff" mask="url(#tv-mark-face)"/>
      </g>
    </svg>
  </div>
  <div class="desk-thought">
    <div class="sb-thought" data-slot="thought-bubble" data-settled="false" data-look="spotlight" data-live="true">
      <span class="sb-thought-tail" aria-hidden="true">
        <span class="sb-thought-dot" data-size="small"></span>
        <span class="sb-thought-dot"></span>
      </span>
      <div class="sb-thought-bubble" data-open="false">
        <div class="sb-thought-head">
          <span class="sb-sonar-label"><span class="sb-swap-line" data-slot="thinking-line-text">Thinking</span></span>
          <span class="sb-sonar-clock"><span class="sb-sonar-clock-sep">${STEP_SEP}</span><span class="sb-sonar-clock-digits">0s</span></span>
        </div>
        <div class="sb-thought-lines" data-slot="thought-bubble-body" data-clipped="false">
          <div class="sb-thought-layer"><p class="sb-thought-text" data-slot="thought-bubble-text"></p></div>
        </div>
      </div>
    </div>
  </div>
  <div class="speed-note">
    <img class="speed-arrow" src="assets/arrow.png" width="512" height="512" alt="">
    <span class="speed-text">actual speed</span>
  </div>`;

// ---------- mascot.js's thinking pose ----------
const EYES = [{ cx: 35, cy: 58 }, { cx: 65, cy: 58 }];
const EYE_RY = 11, BLINK_MS = 120;
const easeOut = (p) => 1 - (1 - Math.min(1, Math.max(0, p))) ** 3;
function thinkingPose(t, blink) {
  const s = t / 1000;
  const e = easeOut(t / 260);
  return {
    eyeDx: e * (3 + Math.sin(s * 1.3) * 1.2),
    eyeDy: e * (-4 + Math.sin(s * 0.9) * 0.8),
    eyeRy: blink ? 1 : EYE_RY - e,
    rot: e * Math.sin(s * 2.4) * 3,
    y: e * Math.sin(s * 4.8) * 1.2,
  };
}

// --ease-standard-decelerate, cubic-bezier(0, 0, 0, 1): x = u^3, y = 3u^2 - 2u^3
const decel = (x) => { const u = Math.cbrt(Math.min(1, Math.max(0, x))); return 3 * u * u - 2 * u * u * u; };

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** desk-thought.js run() + reveal() on a 120 Hz frame grid: every chunk the page would append, and when. A
    thought's reveal() is called on a frame (its setTimeout snapped to the grid), its first step runs one frame
    later, and the next thought is called BEAT_MS after the last chunk lands. */
function simulate(texts) {
  const events = [];
  const starts = [];
  let callAt = 0;
  texts.forEach((text, block) => {
    starts.push(callAt);
    let state = { shown: 0, lastAt: callAt };
    let drawn = 0, gap = block > 0 ? '\n\n' : '', now = callAt;
    while (drawn < text.length) {
      now += FRAME_MS;
      state = pacerStep(state, text.length, true, now, FAST);
      const count = Math.floor(state.shown);
      const end = count < text.length ? revealedTrimmedEnd(text, count) : text.length;
      if (end > drawn) {
        events.push({ at: now, block, chunk: gap + text.slice(drawn, end), end });
        gap = '';
        drawn = end;
      }
    }
    callAt = Math.ceil((now + BEAT_MS) / FRAME_MS) * FRAME_MS;
  });
  return { events, starts, endAt: callAt };
}

/** The stream's script: Jev's asks in shuffled passes, each in one of its forms (desk-thought.js run()), until
    the stream has run `fillMs`, then image 1's two: an outcome ask's "Hmm" form, which ends "toward it, but I
    can't promise it.", and "They're asking: “Schedule a meeting with my team next Tuesday”". */
function script(thoughts, fillMs, seed) {
  const rand = mulberry32(seed);
  const last = thoughts.find((x) => x.ask === 'Schedule a meeting with my team next Tuesday');
  const prev = thoughts.find((x) => x.ask === 'Make a million dollars');
  if (!last || !prev) throw new Error('think: image 1 thoughts missing from thoughts.2347ca2a.js');
  const pool = thoughts.filter((x) => x !== last && x !== prev);
  const texts = [];
  while (simulate(texts).endAt < fillMs) {
    for (const item of shuffled(pool, rand)) texts.push(item.forms[Math.floor(rand() * item.forms.length)]);
  }
  while (texts.length && simulate(texts).endAt > fillMs) texts.pop();
  texts.push(prev.forms.find((f) => f.startsWith('Hmm,')), last.forms.find((f) => f.startsWith("They're asking:")));
  return texts;
}

/**
 * host: the scene box (page px, 1456 wide). opts.lastFrameAt: ad seconds of the last frame before the cut, which
 * lands on image 1 (its second chunk just mounted); opts.clockAtLast: the clock's elapsed ms on that frame.
 * Returns { measure(), render(t) }; measure() must run once the fonts are in.
 */
export function createThinkScene(host, thoughts, { lastFrameAt, clockAtLast = 11900, seed = 7, fillMs = 9000 }) {
  host.innerHTML = MARKUP;
  const q = (s) => host.querySelector(s);
  const digits = q('.sb-sonar-clock-digits');
  const sheen = q('.sb-swap-line');
  const lines = q('.sb-thought-lines');
  const para = q('.sb-thought-text');
  const eyes = [...host.querySelectorAll('.mark-eye')];
  const body = q('.mark-body');

  const texts = script(thoughts, fillMs, seed);
  const { events, starts } = simulate(texts);
  // image 1's frame: the last thought's second chunk ("with my team next Tuesday”"), 6 ms after it mounted
  // (its words at about half their fade, as in the screenshot)
  const lastBlock = texts.length - 1;
  const hit = events.filter((e) => e.block === lastBlock)[1];
  if (!hit) throw new Error('think: the last thought revealed in one step; image 1 cannot be matched');
  const offset = hit.at + 6 - lastFrameAt * 1000;   // sim ms = ad ms + offset
  const clockZero = hit.at + 6 - clockAtLast;
  // the mascot blinks on mascot.js's schedule (first at 1.8 s, then every 2.2-4 s), seeded
  const rand = mulberry32(seed * 31 + 1);
  const blinks = [1800];
  while (blinks[blinks.length - 1] < offset + 20000) blinks.push(blinks[blinks.length - 1] + BLINK_MS + 2200 + rand() * 1800);

  let heights = [], rooms = [], shifts = [], drawnN = -2, fresh = [];

  // the paragraph as the page holds it after events[0..n]: the newest KEEP_THOUGHTS thoughts, one span each,
  // each revealed word a span (desk-thought.js appendWords), whitespace plain text
  function build(n) {
    para.textContent = '';
    fresh = [];
    if (n < 0) return;
    const newest = events[n].block;
    const blocks = new Map();
    for (let b = Math.max(0, newest - KEEP_THOUGHTS + 1); b <= newest; b += 1) blocks.set(b, para.appendChild(document.createElement('span')));
    for (let i = 0; i <= n; i += 1) {
      const ev = events[i], into = blocks.get(ev.block);
      if (!into) continue;
      const re = /(\s*)(\S+)/g;
      let at = 0;
      for (let m = re.exec(ev.chunk); m !== null; m = re.exec(ev.chunk)) {
        if (m[1]) into.append(m[1]);
        const word = document.createElement('span');
        word.className = 'sb-thought-word';
        word.textContent = m[2];
        into.append(word);
        if (ev.at > events[n].at - WORD_IN_MS - 1) fresh.push({ word, at: ev.at });
        at = re.lastIndex;
      }
      if (at < ev.chunk.length) into.append(ev.chunk.slice(at));
    }
  }

  // the ResizeObserver pass, done once: each state's paragraph height, the window it shows, and the shift
  function measure() {
    heights = []; rooms = []; shifts = [];
    for (let n = 0; n < events.length; n += 1) {
      build(n);
      // offsetHeight is the untransformed border box, what the page's ResizeObserver reads (borderBoxSize)
      heights.push(para.offsetHeight);
      rooms.push(lines.clientHeight);
      shifts.push(n > 0 && heights[n - 1] > 0 ? lineShift(heights[n - 1], heights[n], rooms[n]) : 0);
    }
    drawnN = -2;
  }

  function eventsAt(sim) {
    let lo = 0, hi = events.length; // first index with at > sim
    while (lo < hi) { const mid = (lo + hi) >> 1; if (events[mid].at <= sim) lo = mid + 1; else hi = mid; }
    return lo - 1;
  }

  function render(t) {
    const sim = t * 1000 + offset;
    const n = eventsAt(sim);
    if (n !== drawnN) { build(n); drawnN = n; }
    for (const f of fresh) f.word.style.opacity = decel((sim - f.at) / WORD_IN_MS).toFixed(3);
    lines.dataset.clipped = String(n >= 0 && heights[n] > rooms[n]);
    // the glide: the newest shift, while its 100 ms run (a new shift restarts it, as data-scroll a/b does)
    let k = n;
    while (k > 0 && !shifts[k]) k -= 1;
    const p = k > 0 && shifts[k] ? (sim - events[k].at) / SCROLL_MS : 1;
    para.style.transform = p < 1 ? `translateY(${(shifts[k] * (1 - decel(p))).toFixed(2)}px)` : 'none';
    // the head: the clock on its 250 ms tick, the label's stepped sheen
    const el = sim - clockZero;
    digits.textContent = formatClock(Math.floor(el / CLOCK_TICK_MS) * CLOCK_TICK_MS);
    const ph = Math.floor((((el % SHEEN_MS) + SHEEN_MS) % SHEEN_MS) / SHEEN_MS * SHEEN_STEPS) / SHEEN_STEPS;
    sheen.style.backgroundPosition = `${(-220 * ph).toFixed(3)}% 0`;
    // the mascot, thinking since the stream started
    const since = sim - starts[0];
    const blink = blinks.some((b) => since >= b && since < b + BLINK_MS);
    const pose = thinkingPose(since, blink);
    eyes.forEach((eye, i) => {
      eye.setAttribute('cx', (EYES[i].cx + pose.eyeDx).toFixed(3));
      eye.setAttribute('cy', (EYES[i].cy + pose.eyeDy).toFixed(3));
      eye.setAttribute('ry', pose.eyeRy.toFixed(3));
    });
    body.setAttribute('transform', `translate(0 ${pose.y.toFixed(3)}) rotate(${pose.rot.toFixed(3)} 50 86)`);
  }

  return { measure, render, texts, events };
}
