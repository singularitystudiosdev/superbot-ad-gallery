// Hotel-call beat (the 'hotelcall' variant): asked "Call my hotel and tell them I need to change my reservation to be on
// the 25-30th instead of the 20-25th", superbot finds the stay and phones the front desk itself. Cut as the
// multicat-credits chain is (the engine routes it bare: no routing chips, no "<model> in superbot" header, the composer on
// Superbot throughout, the reply straight after the send):
//   1. one line: it found the stay and is calling;
//   2. the call card (the bakery artifact frame, bakery.005f5570.css .bk): it dials, the ringback plays, the desk picks up
//      and the live transcript fills in word by word on the call's own timings while the waveform scrolls with whoever
//      is speaking, superbot's side in its cyan (hotelcall-data.f934b5ee.js); the timer runs in real time, then the call
//      ends. Each turn's row comes in as it starts, so the card grows with the call and the feed glides with it;
//   3. a second line, it's done, and the reservation card: the old dates strike through and the new ones land;
//   4. the house superbot.gg end card (multicat.516afb1a.js's, restated) covers the chat.
// The call is heard: its track (media/hotelcall.f934b5ee/call.mp3, CREDITS.txt there) plays from the dial inside this
// cut's own score (hotelcall-score.f934b5ee.js) through the sound gate (sound.96834de7.js, whose pill this variant shows).
// A pure function of t, except the audio, which follows the clock and never drives it. Its stylesheet
// (../hotelcall.f934b5ee.css) loads with the module.
import { clamp, lerp, seg, outCubic, outQuint, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { PICK, HANG, LINES, ENV } from './hotelcall-data.f934b5ee.js';
import { makeSound } from './hotelcall-score.f934b5ee.js';

const CSS = new URL('../hotelcall.f934b5ee.css?v=1', import.meta.url).href;
export const ID = 'hotelcall';
const CALL = new URL('../../../media/hotelcall.f934b5ee/call.mp3', import.meta.url).href;

export const TYPE_CPS = 55; // the ask types at the multicat chain's rate, through its route's typeCps (chat.9b47fc30.js)
const SAY1 = 'Found your stay at The Calder in your email. Calling the front desk now.';
const SAY2 = 'Done. Your stay at The Calder is now Oct 25–30, same room and rate.';
const HOTEL = 'The Calder', DESK = 'Front desk', PHONE = '+1 (415) 555-0142'; // a fictional hotel on a 555-01xx number
const CARD_AFTER = 0.5;  // the call card rises while the opening line finishes streaming
const SEEN = 0.45;       // the card's rise and the feed's glide to it: the dial waits for both
const ROW_LEAD = 0.2;    // a turn's row comes in this long before its first word
const WORD_IN = 0.1;     // a spoken word fades in over this
const SAY2_AFTER = 0.45, RES_AFTER = 0.35; // after the hang-up: the second line, then the reservation card
const STRIKE_AFTER = 0.6, SWAP_AFTER = 0.3; // after the card comes in: the old dates strike through, then the new ones land
const HOLD = 2.4;        // the reservation card, from its rise to the end card's cover (1.5 s on the new dates)
// the waveform: BARS bars, each 2 of ENV's frames apart (1/15 s), the newest on the right, so it shows the last 4 s
const BARS = 60, BAR_STEP = 2;
// the house end card, as multicat.516afb1a.js has it: the chat fades to black over END_IN, the card's own 2.5 s run starts
// END_DELAY in (the mascot pops, superbot.gg fades up beside it, hold)
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5, END_GAP = 44;
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const END_FACE = '<svg class="hc-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="hcEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#hcEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#hcEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#hcEndFace)"/></svg>';
// lucide bed-double, phone and arrow-right (Iconify, 2026-10-17)
const BED = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4m-8-6v6M2 18h20"/></svg>';
const PHONE_GLYPH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233a14 14 0 0 0 6.392 6.384"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-7-7l7 7l-7 7"/></svg>';
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// every time in the beat, from the reply r: the call card comes in at `card` and dials at `dial`; the call's own moments
// (PICK, HANG, each turn) are its track's seconds from there; then the second line, the reservation card and the end card
function plan(r) {
  const card = r + CARD_AFTER, dial = card + SEEN, hang = dial + HANG;
  const r2 = hang + SAY2_AFTER, res = r2 + RES_AFTER, strike = res + STRIKE_AFTER, cut = res + HOLD;
  return { r, card, dial, pick: dial + PICK, hang, r2, res, strike, swap: strike + SWAP_AFTER, cut, end: cut + END_DELAY + END_LEN };
}
// the beat's length from its reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`hotelcall variant stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

// a card's entrance: it rises and settles in over 0.45 s from `at` (the other beats' card entrance)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
  return ci;
}

// a streamed reply line: the visible prefix, the rest held in place transparent
function sayEl(x, text, cls = '') {
  const n = x.el(`<div class="qc-say${cls}"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  let shown = -1;
  return { n, render(t, at) {
    const c = streamCount(text, at + 0.06, 70, t);
    if (c !== shown) { n.firstElementChild.textContent = text.slice(0, c); n.lastElementChild.textContent = text.slice(c); shown = c; }
  } };
}

// the feed glides to a zero-height anchor a little under each card instead of the card's own bottom, so the newest card
// clears the feed's clip with its edge and shadow (multicat.516afb1a.js bare)
const anchor = (x, cls = '') => x.el(`<i class="hc-anchor${cls}" aria-hidden="true"></i>`);

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the beat keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheet();
    loadFrameSheet();
    const T = k.T;

    const say1 = sayEl(x, SAY1);
    // 2. the call: header (the hotel, its number, the call's state and timer), the waveform, the transcript
    const call = x.el(`<div class="bk hc-call">
      <div class="bk-head"><span class="qc-tile hc-av">${BED}</span><b class="bk-title">${HOTEL}<small>${DESK}, ${PHONE}</small></b><span class="hc-st"><i class="hc-dot"></i>${PHONE_GLYPH}<span class="hc-stl">Calling</span><b class="hc-time"></b></span></div>
      <div class="hc-wave" aria-hidden="true">${'<i></i>'.repeat(BARS)}</div>
      <div class="hc-tx" aria-live="off"></div>
    </div>`);
    const st = call.querySelector('.hc-st'), dot = st.querySelector('.hc-dot'), stl = st.querySelector('.hc-stl'), time = st.querySelector('.hc-time');
    const wave = call.querySelector('.hc-wave'), bars = [...wave.children].map((n) => ({ n, lv: -1, sb: null }));
    const tx = call.querySelector('.hc-tx');
    const rows = LINES.map((l) => {
      const n = x.el(`<div class="hc-row hc-${l.who}"><span class="hc-who">${l.who === 'sb' ? 'Superbot' : 'Maya'}</span><p class="hc-line">${l.words.map(([w]) => `<span>${x.esc(w)}</span>`).join(' ')}</p></div>`);
      const a = anchor(x, ' hc-anchor-row');
      n.append(a);
      tx.append(n);
      return { n, a, at: T.dial + l.s - ROW_LEAD, words: [...n.querySelectorAll('.hc-line span')].map((w, i) => ({ w, at: T.dial + l.words[i][1], op: '' })), on: null };
    });
    const callAnchor = anchor(x);

    // 3. done: the reservation card, the old dates struck through and the new ones beside them
    const say2 = sayEl(x, SAY2, ' hc-say2');
    const res = x.el(`<div class="bk hc-res">
      <div class="bk-head"><b class="bk-title">Reservation updated<small>${HOTEL}, king room</small></b><span class="hc-ok">${x.OK}Confirmed</span></div>
      <div class="hc-dates"><div class="hc-was"><small>Was</small><b>Oct 20–25</b><i class="hc-strike"></i></div><span class="hc-arrow">${ARROW}</span><div class="hc-now"><small>Now</small><b>Oct 25–30</b></div></div>
      <div class="hc-facts"><span><small>Check-in</small>Sun, Oct 25</span><span><small>Check-out</small>Fri, Oct 30</span><span><small>Nights</small>5</span><span><small>Rate</small>Unchanged</span></div>
    </div>`);
    const was = res.querySelector('.hc-was b'), strike = res.querySelector('.hc-strike'), arrow = res.querySelector('.hc-arrow');
    const now = res.querySelector('.hc-now'), facts = res.querySelector('.hc-facts'), ok = res.querySelector('.hc-ok');
    const resAnchor = anchor(x);

    // 4. the end card: the house superbot.gg lockup over the spot's black. It rides in nodes (so other variants hide it)
    // and moves to the scene section on the first render, above the hub
    const endCard = x.el(`<div class="hc-end" role="img" aria-label="superbot.gg"><div class="hc-end-word"><b>superbot.gg</b></div><div class="hc-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.hc-end-word'), endBot = endCard.querySelector('.hc-end-bot');
    let endK = 1; // the lockup's scale now applied (--k)

    // the sound: made on this route's first frame (every route is built at mount, so other variants never pay for it)
    let snd = null;
    addEventListener('variantchange', () => { if (snd) snd.stop(); });
    const cues = () => ({
      typing: [{ text: k.askBy[ID], s: k.s, end: k.typeEnd }], send: k.send, cards: [T.card, T.res],
      dial: T.dial, hang: T.hang, done: T.r2, swap: T.swap, cover: T.cut, pop: T.cut + END_DELAY, word: T.cut + END_DELAY + 0.3, end: T.end,
    });

    // QA: the call's sound against the clock (__AD arrives after the timeline's first frame), as multicat's __AD.sound
    const sound = () => ({ t: window.__AD.now, ready: snd.ready(), sounding: snd.sounding(), render: window.__HC_SOUND || null });
    let placed = false, stShown = '', timeShown = null;
    return {
      nodes: [say1.n, call, callAnchor, say2.n, res, resAnchor, endCard],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf); each turn's row anchors
      // the card's new bottom, so the feed follows the call as it grows
      marks: [[T.r, say1.n], [T.card, callAnchor], ...rows.map((rw) => [rw.at, rw.a]), [T.r2, say2.n], [T.res, resAnchor]],
      render(t) {
        if (!placed) { x.hub.closest('.scene').append(endCard); placed = true; }
        if (!snd) snd = makeSound(cues(), CALL);
        snd.sync(t);
        if (window.__AD && window.__AD.sound !== sound) window.__AD.sound = sound;

        // 1. the opening line, then the call card
        say1.render(t, T.r);
        enter(call, t, T.card);

        // the call's state: calling (the dot breathing) until the pickup, live with the timer counting, then ended
        const state = t < T.pick ? 'calling' : t < T.hang ? 'live' : 'ended';
        if (state !== stShown) { st.dataset.state = state; stl.textContent = state === 'calling' ? 'Calling' : state === 'live' ? 'Live' : 'Call ended'; stShown = state; }
        const tm = state === 'calling' ? '' : clock((state === 'live' ? t : T.hang) - T.pick);
        if (tm !== timeShown) { time.textContent = tm; timeShown = tm; }
        dot.style.opacity = state === 'calling' ? (0.35 + 0.65 * (0.5 + 0.5 * Math.cos(2 * Math.PI * Math.max(0, t - T.card)))).toFixed(3) : '';

        // the waveform: each bar is a frame of the call's levels, the newest on the right; superbot's frames in its cyan
        const f = Math.floor((t - T.dial) * ENV.fps);
        for (let i = 0; i < BARS; i++) {
          const j = f - (BARS - 1 - i) * BAR_STEP, b = bars[i];
          const h = j >= 0 && j < ENV.sb.length ? ENV.hotel[j] : 0, s = j >= 0 && j < ENV.sb.length ? ENV.sb[j] : 0;
          const lv = Math.max(h, s), sb = s > h;
          if (lv !== b.lv) { b.n.style.transform = `scaleY(${Math.max(0.08, lv / 99).toFixed(3)})`; b.lv = lv; }
          if (sb !== b.sb) { b.n.classList.toggle('hc-sb', sb); b.sb = sb; }
        }
        wave.style.opacity = (1 - 0.55 * seg(t, T.hang, T.hang + 0.4)).toFixed(3);

        // the transcript: a turn's row comes in just before it starts, its words fading in as they are spoken
        for (const rw of rows) {
          const on = t >= rw.at;
          if (on !== rw.on) { rw.n.style.display = on ? '' : 'none'; rw.on = on; }
          if (!on) continue;
          rw.n.style.opacity = outCubic(seg(t, rw.at, rw.at + 0.25)).toFixed(3);
          for (const w of rw.words) {
            const p = seg(t, w.at - 0.02, w.at - 0.02 + WORD_IN), o = p.toFixed(3);
            if (o !== w.op) { w.w.style.opacity = o; w.op = o; }
          }
        }

        // 3. the second line and the reservation card: the strike draws across the old dates, then the new ones land
        say2.render(t, T.r2);
        enter(res, t, T.res);
        const sp = outCubic(seg(t, T.strike, T.strike + 0.3));
        strike.style.transform = `scaleX(${sp.toFixed(4)})`;
        was.style.opacity = lerp(1, 0.5, sp).toFixed(3);
        const np = outCubic(seg(t, T.swap, T.swap + 0.4));
        now.style.opacity = np.toFixed(3);
        now.style.transform = np >= 1 ? 'none' : `translateX(${((1 - np) * -8).toFixed(2)}px)`;
        arrow.style.opacity = np.toFixed(3);
        facts.style.opacity = np.toFixed(3);
        ok.style.opacity = np.toFixed(3);

        // 4. the end card: the chat fades to black, then the house card's own run (multicat.516afb1a.js)
        const cover = seg(t, T.cut, T.cut + END_IN);
        endCard.style.opacity = cover.toFixed(3);
        endCard.style.visibility = cover > 0 ? '' : 'hidden';
        if (cover > 0) {
          const tc = t - (T.cut + END_DELAY);
          const W = endCard.clientWidth, H = endCard.clientHeight;
          const natW = endWord.offsetWidth / endK;
          const kk = Math.min(1, (W * 0.86) / (natW + END_GAP + 220));
          if (kk !== endK) { endCard.style.setProperty('--k', kk.toFixed(4)); endK = kk; }
          const w = 220 * kk, wordW = natW * kk, gap = END_GAP * kk;
          const left = (W - (wordW + gap + w)) / 2, midY = H / 2;
          const pop = clamp(tc / 0.55), shift = outQuint(clamp((tc - 0.3) / 1.0));
          endBot.style.opacity = outQuint(clamp(tc / 0.3)).toFixed(3);
          endBot.style.transform = `translate(${(left + wordW + gap).toFixed(2)}px, ${(midY - w / 2).toFixed(2)}px) scale(${(0.72 + 0.28 * popBack(pop)).toFixed(4)})`;
          endWord.style.opacity = shift.toFixed(3);
          endWord.style.filter = shift < 1 ? `blur(${(6 * kk * (1 - shift)).toFixed(2)}px)` : 'none';
          endWord.style.transform = `translate(${(left - 20 * kk * (1 - shift)).toFixed(2)}px, -50%)`;
        }
      },
    };
  },
};
