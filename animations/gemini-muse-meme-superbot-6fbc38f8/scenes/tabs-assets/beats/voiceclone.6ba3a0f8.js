// Voice-clone call beat (the 'voiceclone-call' variant): asked "Clone my voice and make a call to 30351235", superbot asks
// for one short take of the user's voice, clones it, then places the call in that voice, opening as the product's calls do
// (superbot.gg/features#calls, 2026-10-17: "it says it is an AI, then asks"; "This call is transcribed."). Cut as the hotel call is
// (hotelcall.f934b5ee.js; the engine routes it bare: no routing chips, no "<model> in superbot" header, the composer on
// Superbot throughout, the reply straight after the send):
//   1. one line, read this out loud, and the record card (the bakery artifact frame, bakery.005f5570.css .bk): the line to
//      read and a mic button. The pointer comes in and taps it once; the take records (the pill reads Recording and its
//      timer runs, the waveform scrolls with the voice, each word of the line lights as it is said), stops by itself
//      when the line is read, and a row opens under it: Cloning your voice, its bar filling, then Sam's voice is ready;
//   2. a second line, calling with your voice, and the call card: it dials 30351235, one ringback ring, the pickup, the live
//      transcript filling in word by word on the call's own timings while the waveform scrolls with whoever speaks, the
//      cloned voice in superbot's cyan; the timer runs in real time, then the call ends. Each turn's row comes in as it
//      starts, so the card grows with the call and the feed glides with it;
//   3. a third line, done, and the house superbot.gg end card (multicat.516afb1a.js's, restated) covers the chat.
// From the first frame until the end card, a disclosure (NOTE) sits at the top of the frame, as the hotel call's does
// (hotelcall.f934b5ee.js NOTE: X's ads policy on misleading demonstrations, New York GBL 396-b, EU AI Act Art. 50(4)): the
// call is staged and every voice in it is AI-generated; it rides in the scene, so every render and export carries it.
// Both are heard: the take (media/voiceclone.6ba3a0f8/rec.mp3) from the tap and the call (call.mp3) from the dial play
// inside this cut's own score (voiceclone-score.6ba3a0f8.js) through the sound gate (sound.96834de7.js, OWN). Every voice
// is generated: the take and the clone's opener one TTS voice, its closing line cloned from the take by Chatterbox
// (media/voiceclone.6ba3a0f8/CREDITS.txt); nothing
// records the viewer's microphone and nothing dials. A pure function of t, except the audio, which follows the clock and
// never drives it. Its stylesheet (../voiceclone.6ba3a0f8.css) loads with the module.
import { clamp, lerp, seg, outCubic, outQuint, inOutCubic, streamCount, path, press, pressScale } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { REC, PICK, HANG, LINES, ENV } from './voiceclone-data.6ba3a0f8.js?v=2';
import { makeSound } from './voiceclone-score.6ba3a0f8.js';

const CSS = new URL('../voiceclone.6ba3a0f8.css?v=3', import.meta.url).href;
export const ID = 'voiceclone-call';
const TAKE = new URL('../../../media/voiceclone.6ba3a0f8/rec.mp3', import.meta.url).href;
const CALL = new URL('../../../media/voiceclone.6ba3a0f8/call.mp3', import.meta.url).href;

export const TYPE_CPS = 55; // the ask types at the hotel call's rate, through its route's typeCps (chat.9b47fc30.js)
const NUMBER = '30351235'; // the number as the ask gives it; nothing is dialled
const SAY1 = 'Read this line out loud so I can clone your voice.';
const SAY2 = `Got your voice. Calling ${NUMBER} with it now.`;
const SAY3 = `Done. I called ${NUMBER} in your voice and said it was your AI.`;
const NOTE = 'Simulated call with AI-generated voices. The names and the call are fictional.';
const CARD_AFTER = 0.5;  // a card rises while the line above it finishes streaming
const SEEN = 0.45;       // the card's rise and the feed's glide to it: the pointer and the dial wait for both
const PTR_HOV = 0.6;     // after the record card is seen: the pointer's glide onto the mic button
const CLICK_AFTER = 0.15; // the tap, once it is there
const REC_AFTER = 0.25;  // the take starts as the button turns to its stop square
const PTR_OUT = 0.7;     // the pointer drifts off and fades this long after the tap
const CLONE_AFTER = 0.1, CLONE = 1.5; // after the take: the clone row opens and its bar fills
const SAY2_AFTER = 0.35; // after the voice is ready: the second line
const ROW_LEAD = 0.2;    // a turn's row comes in this long before its first word
const WORD_IN = 0.1;     // a spoken word fades in over this
const SAY3_AFTER = 0.45, HOLD = 2.2; // after the hang-up: the third line, then the end card's cover
// the waveforms: BARS bars, each 2 of ENV's frames apart (1/15 s), the newest on the right, so each shows the last 4 s
const BARS = 60, BAR_STEP = 2;
const CLONE_H = 57; // the clone row's open height: .vcc-clone-in's padding, label row and bar (voiceclone.6ba3a0f8.css)
// the line's words: unread in the frame's dim grey, read in near white
const DIM = [120, 120, 128], LIT = [245, 245, 247];
// the house end card, as multicat.516afb1a.js has it: the chat fades to black over END_IN, the card's own 2.5 s run starts
// END_DELAY in (the mascot pops, superbot.gg fades up beside it, hold)
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5, END_GAP = 44;
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const END_FACE = '<svg class="vcc-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="vccEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#vccEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#vccEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#vccEndFace)"/></svg>';
// lucide mic and phone (Iconify, 2026-10-17); the voice glyph is the composer's own (shell.9b47fc30.js .rc-voice)
const MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></svg>';
const PHONE_GLYPH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233a14 14 0 0 0 6.392 6.384"/></svg>';
const VOICE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.4" y="9.6" width="3.2" height="4.8" rx="1.6"/><rect x="6.4" y="7.4" width="3.2" height="9.2" rx="1.6"/><rect x="10.4" y="4" width="3.2" height="16" rx="1.6"/><rect x="14.4" y="7.4" width="3.2" height="9.2" rx="1.6"/><rect x="18.4" y="9.6" width="3.2" height="4.8" rx="1.6"/></svg>';
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const rgb = (p) => `rgb(${DIM.map((c, i) => Math.round(lerp(c, LIT[i], p))).join(',')})`;

// every time in the beat, from the reply r: the record card, the tap, the take (its own length, REC.DUR), the clone; the
// second line, the call card and its dial, the call's own moments (PICK, HANG, each turn) its track's seconds from there;
// then the third line and the end card
function plan(r) {
  const card = r + CARD_AFTER, hov = card + SEEN + PTR_HOV, click = hov + CLICK_AFTER, rec = click + REC_AFTER;
  const recEnd = rec + REC.DUR, clone = recEnd + CLONE_AFTER, voice = clone + CLONE;
  const r2 = voice + SAY2_AFTER, call = r2 + CARD_AFTER, dial = call + SEEN, hang = dial + HANG;
  const r3 = hang + SAY3_AFTER, cut = r3 + HOLD;
  return { r, card, ptr: card + SEEN, hov, click, ptrOut: click + PTR_OUT, rec, recEnd, clone, voice, r2, call, dial, pick: dial + PICK, hang, r3, cut, end: cut + END_DELAY + END_LEN };
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
    sheet.onerror = () => { console.error(new Error(`voiceclone-call variant stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

// a card's entrance: it rises and settles in over 0.45 s from `at` (the other beats' card entrance)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
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
const anchor = (x, cls = '') => x.el(`<i class="vcc-anchor${cls}" aria-hidden="true"></i>`);

// a scrolling waveform: frame f of the levels is the newest bar; `paint(bar, i)` gets each bar's frame index
function waveBars(wave) { return [...wave.children].map((n) => ({ n, lv: -1, hot: null })); }
function paintWave(bars, f, level) {
  for (let i = 0; i < BARS; i++) {
    const [lv, hot] = level(f - (BARS - 1 - i) * BAR_STEP), b = bars[i];
    if (lv !== b.lv) { b.n.style.transform = `scaleY(${Math.max(0.08, lv / 99).toFixed(3)})`; b.lv = lv; }
    if (hot !== b.hot) { b.n.classList.toggle('vcc-sam', hot); b.hot = hot; }
  }
}

// the state pill: its state, label and timer, set only when they change
function pill(st) {
  const dot = st.querySelector('.vcc-dot'), stl = st.querySelector('.vcc-stl'), time = st.querySelector('.vcc-time');
  let shown = '', tShown = null;
  return { dot, set(state, label, tm) {
    if (state !== shown) { st.dataset.state = state; stl.textContent = label; shown = state; }
    if (tm !== tShown) { time.textContent = tm; tShown = tm; }
  } };
}

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the beat keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheet();
    loadFrameSheet();
    const T = k.T;
    const sb = x.tile('superbot');

    // 1. the record card: the line to read, the mic button, the waveform, then the clone row
    const say1 = sayEl(x, SAY1);
    const recCard = x.el(`<div class="bk vcc-rec">
      <div class="bk-head"><span class="qc-tile vcc-av">${MIC}</span><b class="bk-title">Clone your voice<small>Read this line out loud</small></b><span class="vcc-st"><i class="vcc-dot"></i>${x.OK}<span class="vcc-stl">Ready</span><b class="vcc-time"></b></span></div>
      <p class="vcc-script">${REC.words.map(([w]) => `<span>${x.esc(w)}</span>`).join(' ')}</p>
      <div class="vcc-bar">
        <span class="vcc-btn" role="img" aria-label="Record"><i class="vcc-ring"></i><i class="vcc-core"></i></span>
        <div class="vcc-wave" aria-hidden="true">${'<i></i>'.repeat(BARS)}<span class="vcc-hint"><b>Tap to record</b> · about 6 seconds</span></div>
      </div>
      <div class="vcc-clone"><div class="vcc-clone-in">
        <div class="vcc-clone-top">${sb}<span class="vcc-clone-l">Cloning your voice</span><span class="vcc-pct">0%</span></div>
        <div class="vcc-track"><i class="vcc-fill"></i></div>
      </div></div>
    </div>`);
    const recPill = pill(recCard.querySelector('.vcc-st'));
    const words = [...recCard.querySelectorAll('.vcc-script span')].map((n, i) => ({ n, at: T.rec + REC.words[i][1], c: '' }));
    const btn = recCard.querySelector('.vcc-btn'), core = btn.querySelector('.vcc-core'), ring = btn.querySelector('.vcc-ring');
    const hint = recCard.querySelector('.vcc-hint'), recBars = waveBars(recCard.querySelector('.vcc-wave'));
    const cloneRow = recCard.querySelector('.vcc-clone'), cloneL = cloneRow.querySelector('.vcc-clone-l');
    const pct = cloneRow.querySelector('.vcc-pct'), fill = cloneRow.querySelector('.vcc-fill');
    const recAnchor = anchor(x);

    // 2. the call: header (the number, the cloned voice, the call's state and timer), the waveform, the transcript
    const say2 = sayEl(x, SAY2, ' vcc-say-gap');
    const call = x.el(`<div class="bk vcc-call">
      <div class="bk-head"><span class="qc-tile vcc-av">${PHONE_GLYPH}</span><b class="bk-title">${NUMBER}<small>Mobile</small></b><span class="vcc-voice">${VOICE}Your voice</span><span class="vcc-st"><i class="vcc-dot"></i>${PHONE_GLYPH}<span class="vcc-stl">Calling</span><b class="vcc-time"></b></span></div>
      <div class="vcc-wave" aria-hidden="true">${'<i></i>'.repeat(BARS)}</div>
      <div class="vcc-tx" aria-live="off"></div>
    </div>`);
    const callPill = pill(call.querySelector('.vcc-st'));
    const callWave = call.querySelector('.vcc-wave'), callBars = waveBars(callWave);
    const tx = call.querySelector('.vcc-tx');
    const rows = LINES.map((l) => {
      const n = x.el(`<div class="vcc-row vcc-${l.who}"><span class="vcc-who">${l.who === 'sam' ? 'You' : NUMBER}</span><p class="vcc-line">${l.words.map(([w]) => `<span>${x.esc(w)}</span>`).join(' ')}</p></div>`);
      const a = anchor(x, ' vcc-anchor-row');
      n.append(a);
      tx.append(n);
      return { n, a, at: T.dial + l.s - ROW_LEAD, words: [...n.querySelectorAll('.vcc-line span')].map((w, i) => ({ w, at: T.dial + l.words[i][1], op: '' })), on: null };
    });
    const callAnchor = anchor(x);

    // 3. done
    const say3 = sayEl(x, SAY3, ' vcc-say-gap');

    // the disclosure: in the scene section under the end card, so the card's black covers it as the spot ends
    const note = x.el(`<p class="vcc-note" role="note">${x.esc(NOTE)}</p>`);

    // the end card: the house superbot.gg lockup over the spot's black. It rides in nodes (so other variants hide it)
    // and moves to the scene section on the first render, above the hub
    const endCard = x.el(`<div class="vcc-end" role="img" aria-label="superbot.gg"><div class="vcc-end-word"><b>superbot.gg</b></div><div class="vcc-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.vcc-end-word'), endBot = endCard.querySelector('.vcc-end-bot');
    let endK = 1; // the lockup's scale now applied (--k)

    // the sound: made on this route's first frame (every route is built at mount, so other variants never pay for it)
    let snd = null;
    addEventListener('variantchange', () => { if (snd) snd.stop(); });
    const cues = () => ({
      typing: [{ text: k.askBy[ID], s: k.s, end: k.typeEnd }], send: k.send, cards: [T.card, T.call], click: T.click,
      rec: T.rec, recEnd: T.recEnd, clone: T.clone, voice: T.voice, dial: T.dial, hang: T.hang, done: T.r3,
      cover: T.cut, pop: T.cut + END_DELAY, word: T.cut + END_DELAY + 0.3, end: T.end,
    });
    // the Export button (export.64039673.js window.__EXPORT_AUDIO) puts this soundtrack, the take and the call included, into the file
    (window.__EXPORT_AUDIO ||= {})[ID] = () => (snd ||= makeSound(cues(), TAKE, CALL)).audio();

    // QA: the sound against the clock (__AD arrives after the timeline's first frame), as the hotel call's __AD.sound
    const sound = () => ({ t: window.__AD.now, ready: snd.ready(), sounding: snd.sounding(), render: window.__VC_SOUND || null });
    let placed = false;
    return {
      nodes: [say1.n, recCard, recAnchor, say2.n, call, callAnchor, say3.n, note, endCard],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf): the record card, again as
      // its clone row opens, then the call card and each turn's row as the call grows
      marks: [[T.r, say1.n], [T.card, recAnchor], [T.clone, recAnchor], [T.r2, say2.n], [T.call, callAnchor], ...rows.map((rw) => [rw.at, rw.a]), [T.r3, say3.n]],
      render(t) {
        if (!placed) { x.hub.closest('.scene').append(note, endCard); placed = true; }
        if (!snd) snd = makeSound(cues(), TAKE, CALL);
        snd.sync(t);
        if (window.__AD && window.__AD.sound !== sound) window.__AD.sound = sound;

        // 1. the opening line and the record card
        say1.render(t, T.r);
        enter(recCard, t, T.card);
        const recState = t < T.rec ? 'ready' : t < T.recEnd ? 'rec' : t < T.voice ? 'cloning' : 'voice';
        recPill.set(recState, { ready: 'Ready', rec: 'Recording', cloning: 'Cloning', voice: 'Voice ready' }[recState], recState === 'rec' ? clock(t - T.rec) : '');
        recPill.dot.style.opacity = recState === 'rec' ? (0.45 + 0.55 * (0.5 + 0.5 * Math.cos(2 * Math.PI * (t - T.rec)))).toFixed(3) : '';

        // the mic button: the tap dips it; the disc turns to the stop square while the take runs, a ring pulsing out of
        // it, then back to a disc gone grey once the take is in
        btn.style.transform = `scale(${pressScale(t, T.click, 0.08).toFixed(4)})`;
        const sq = outCubic(seg(t, T.click + 0.05, T.rec)) * (1 - outCubic(seg(t, T.recEnd, T.recEnd + 0.25)));
        const size = lerp(34, 18, sq);
        core.style.width = core.style.height = `${size.toFixed(2)}px`;
        core.style.borderRadius = `${lerp(17, 4, sq).toFixed(2)}px`;
        const gone = seg(t, T.recEnd, T.recEnd + 0.25);
        core.style.background = gone > 0 ? `rgb(${Math.round(lerp(255, 72, gone))},${Math.round(lerp(69, 72, gone))},${Math.round(lerp(58, 78, gone))})` : '';
        const ph = t >= T.rec && t < T.recEnd ? ((t - T.rec) % 1.1) / 1.1 : 0;
        ring.style.opacity = ph ? ((1 - ph) * 0.7).toFixed(3) : '0';
        ring.style.transform = `scale(${(1 + 0.4 * outCubic(ph)).toFixed(4)})`;
        hint.style.opacity = (1 - seg(t, T.click, T.click + 0.2)).toFixed(3);

        // the take's waveform, the newest bar on the right, frozen where the take stopped
        const rf = Math.floor((Math.min(t, T.recEnd) - T.rec) * ENV.fps);
        paintWave(recBars, rf, (j) => [j >= 0 && j < REC.env.length ? REC.env[j] : 0, false]);
        // the line: each word lights as it is said
        for (const w of words) {
          const c = rgb(seg(t, w.at - 0.02, w.at + 0.1));
          if (c !== w.c) { w.n.style.color = c; w.c = c; }
        }
        // the clone row opens, its bar fills, then the voice is ready
        const open = outCubic(seg(t, T.clone, T.clone + 0.3));
        cloneRow.style.height = `${(CLONE_H * open).toFixed(2)}px`;
        const p = inOutCubic(seg(t, T.clone + 0.15, T.voice));
        fill.style.transform = `scaleX(${p.toFixed(4)})`;
        const ready = t >= T.voice;
        const label = ready ? "Sam's voice is ready" : 'Cloning your voice', pc = ready ? 'Ready' : `${Math.round(p * 100)}%`;
        if (cloneL.textContent !== label) cloneL.textContent = label;
        if (pct.textContent !== pc) pct.textContent = pc;

        // 2. the second line and the call card
        say2.render(t, T.r2);
        enter(call, t, T.call);
        // the call's state: calling (the dot breathing) until the pickup, live with the timer counting, then ended
        const state = t < T.pick ? 'calling' : t < T.hang ? 'live' : 'ended';
        callPill.set(state, state === 'calling' ? 'Calling' : state === 'live' ? 'Live' : 'Call ended', state === 'calling' ? '' : clock((state === 'live' ? t : T.hang) - T.pick));
        callPill.dot.style.opacity = state === 'calling' ? (0.35 + 0.65 * (0.5 + 0.5 * Math.cos(2 * Math.PI * Math.max(0, t - T.call)))).toFixed(3) : '';
        // the waveform: each bar is a frame of the call's levels; the cloned voice's frames in cyan
        const f = Math.floor((t - T.dial) * ENV.fps);
        paintWave(callBars, f, (j) => {
          const h = j >= 0 && j < ENV.them.length ? ENV.them[j] : 0, s = j >= 0 && j < ENV.sam.length ? ENV.sam[j] : 0;
          return [Math.max(h, s), s > h];
        });
        callWave.style.opacity = (1 - 0.55 * seg(t, T.hang, T.hang + 0.4)).toFixed(3);
        // the transcript: a turn's row comes in just before it starts, its words fading in as they are spoken
        for (const rw of rows) {
          const on = t >= rw.at;
          if (on !== rw.on) { rw.n.style.display = on ? '' : 'none'; rw.on = on; }
          if (!on) continue;
          rw.n.style.opacity = outCubic(seg(t, rw.at, rw.at + 0.25)).toFixed(3);
          for (const w of rw.words) {
            const o = seg(t, w.at - 0.02, w.at - 0.02 + WORD_IN).toFixed(3);
            if (o !== w.op) { w.w.style.opacity = o; w.op = o; }
          }
        }

        // 3. the third line
        say3.render(t, T.r3);

        // the end card: the chat fades to black, then the house card's own run (multicat.516afb1a.js)
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
      // the pointer: in from the lower right onto the mic button, one tap, then it drifts off and fades, in the section's px
      pointer(t, toScr) {
        if (t < T.ptr || t > T.ptrOut) return null;
        const b = x.box(btn);
        const to = toScr({ x: b.cx + 3, y: b.cy + 5 });
        const from = toScr({ x: b.cx + 170, y: b.cy + 120 });
        const away = toScr({ x: b.cx + 70, y: b.cy + 60 });
        const at = path(t, [{ t: T.ptr, ...from }, { t: T.hov, ...to }, { t: T.click + 0.2, ...to }, { t: T.ptrOut, ...away }]);
        return { x: at.x, y: at.y, p: press(t, T.click), v: seg(t, T.ptr, T.ptr + 0.15) * (1 - seg(t, T.ptrOut - 0.25, T.ptrOut)) };
      },
    };
  },
};
