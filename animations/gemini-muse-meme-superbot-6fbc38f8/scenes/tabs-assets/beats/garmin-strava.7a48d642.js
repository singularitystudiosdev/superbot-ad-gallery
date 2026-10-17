// Garmin-to-Strava beat (the 'garmin-strava' variant): asked "Connect to my garmin account, and then after every one of
// my runs, post it to strava for me", superbot sets the automation up, then keeps it. One chat with no model on show (the
// multicat-credits look: no routing chips, no "<model> in superbot" header, the composer on Superbot throughout).
//   1. The setup: a line, then a "Garmin to Strava" frame whose two accounts connect in turn (Garmin Connect, then
//      Strava, each resolving to a green Connected) and whose rule, "When a run ends on your Garmin", switches on; only
//      then does superbot say it is done.
//   2. The next morning: a day divider, then superbot speaks unasked, with the run it just posted as Strava's feed shows
//      it: the athlete, Morning Run, its distance, pace and time, its route drawing itself onto the map, kudos coming in.
//   3. The house superbot.gg end card covers the chat (multicat's lockup and its stylesheet, ../multicat.516afb1a.css
//      .mc-end, which the multicat route loads at mount whatever the variant).
// The run is real geography and invented numbers: a 5.25 mi loop routed on OpenStreetMap through Fort Collins
// (garmin-strava-data.7a48d642.js); the map is SVG drawn from OpenStreetMap, no tile loads
// (../../../img/garmin-strava.7a48d642/CREDITS.txt). Nothing is connected or posted.
// Its soundtrack is the Music pill's v16 (multicat-score.96834de7.js, the multicat-credits default), re-cued to this chain:
// the bed's bars lock to the end card's cover where multicat's lock to its song, the rule switching on takes the model's
// impact, the Strava post landing takes the photo's, the first kudos the order's bell. A pure function of t, except that
// audio, which follows the clock and never drives it. Its stylesheet (../garmin-strava.7a48d642.css) loads with the module.
import { clamp, lerp, seg, outCubic, outQuint, outBack, inOutCubic, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { LAND, landing, shimmer, settle } from './thumb-land.309eb9c5.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { shareBtn } from './share.29a362ea.js';
import { MAP_W, MAP_H, ROUTE, ROUTE_LEN, START, FINISH, MILES } from './garmin-strava-data.7a48d642.js';
import { music } from '../../../music.47e5d94a.js?v=2';
import { makePlayer } from './multicat-player.96834de7.js?v=3';

export const ID = 'garmin-strava';
const CSS = new URL('../garmin-strava.7a48d642.css?v=1', import.meta.url).href;
const MAP = new URL('../../../img/garmin-strava.7a48d642/map.svg', import.meta.url).href;
const STRAVA_URL = 'https://www.strava.com/dashboard';

export const TYPE_CPS = 60; // the ask (89 characters) types at this rate (chat.9b47fc30.js routeBy typeCps)
const SAY1 = 'Connecting your Garmin and Strava accounts.';
const SAY_DONE = 'Done. Every run you finish now posts to Strava.';
const SAY2 = 'You just finished a run, so I posted it to Strava.';
const DAY = 'Next morning, 7:32 AM';
// the run, as the card states it: the routed loop's length, an 8:14 /mi pace, and the time the two make (5.25 x 8:14 =
// 43:12); it starts at 6:48 AM, so it ends at 7:31 and posts at 7:32, the divider's time
const DIST = `${MILES.toFixed(2)} mi`, PACE = '8:14', TIME = '43m 12s';
const WHEN = 'Today at 6:48 AM', WHERE = 'Fort Collins, Colorado';
// the kudos as they come in: each [count shown, its giver's initial and colour]
const KUDOS = [[1, 'J', '#60a5fa'], [3, 'M', '#f472b6'], [6, 'A', '#a3e635']];

// a card's rise and the feed's glide to it both take this long (multicat.516afb1a.js SEEN): its steps start once it is in view
const SEEN = 0.45;
const CONNECT = 0.55;  // the Garmin account resolves this long after its card is in view
const STRAVA_AFTER = 0.4; // and Strava this long after Garmin
const RULE_AFTER = 0.4;   // the rule switches on this long after Strava connects
const SWITCH = 0.22;      // the switch's knob travel
const DONE_AFTER = 0.3;   // the done line streams this long after the switch
const DAY_AFTER = 1.4;    // the setup holds this long after the switch, then the night passes
const POSTING = 0.5;      // the post's skeleton, once its card is in view, before the Strava card lands
const DRAW = 1.1;         // the route drawing itself, after the card lands
const KUDO_GAP = 0.35;
// the end card's cover sits this long after the switch, so the v16 bed (bars of 2 s locked to the cover) puts a downbeat
// just after the switch: its impact clears the drums for a beat, not a bar (multicat-score.96834de7.js bed clears)
const COVER_AFTER_RULE = 6.17;
// the house end card (multicat.516afb1a.js END_IN, END_DELAY, END_LEN, END_GAP): the chat fades to black, the lockup runs
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5, END_GAP = 44;
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const END_FACE = '<svg class="mc-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="gsEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#gsEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#gsEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#gsEndFace)"/></svg>';

// the marks, inline so CSS colours them: Garmin's delta (the triangle of the Simple Icons Garmin logo, CC0) and Strava's
// chevrons (Simple Icons, CC0); the rest are Lucide glyphs (ISC)
const GARMIN = '<svg viewBox="19.45 8.45 3.3 2.9" aria-hidden="true"><path d="M22.134 11.051h-2.165c-.079 0-.148-.039-.187-.108s-.039-.146 0-.215l1.084-1.874a.21.21 0 0 1 .187-.108a.21.21 0 0 1 .187.108l1.084 1.874a.2.2 0 0 1 0 .215a.22.22 0 0 1-.19.108"/></svg>';
const STRAVA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>';
const REPEAT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m17 2l4 4l-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4l4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>';
const THUMB = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88M7 10v12"/></svg>';
const COMMENT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092a10 10 0 1 0-4.777-4.719"/></svg>';
const OK = '<svg class="gs-ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

// every time in the chain, from the reply r: the setup frame comes in at `card1`, Garmin connects at `garmin`, Strava at
// `strava`, the rule switches `on` and the done line streams at `said`; the night passes at `day`; superbot's post line streams at `r2`, its card comes in at
// `card2`, the post lands at `done` (settled by `w2`), the route draws to `drawn`, the kudos land at `kudos`; the end card
// covers the chat at `cut`
function plan(r) {
  const card1 = r + 0.22, c1 = card1 + SEEN;
  const garmin = c1 + CONNECT, strava = garmin + STRAVA_AFTER, on = strava + RULE_AFTER;
  const said = on + DONE_AFTER, day = on + DAY_AFTER, r2 = day + 0.4, card2 = r2 + 0.22, gen0 = card2 + SEEN, done = gen0 + POSTING;
  const w2 = done + LAND, drawn = w2 + DRAW;
  const kudos = KUDOS.map((_, i) => drawn + 0.15 + i * KUDO_GAP);
  const cut = on + COVER_AFTER_RULE;
  return { r, card1, garmin, strava, on, said, day, r2, card2, gen0, done, w2, drawn, kudos, cut, end: cut + END_DELAY + END_LEN };
}
// the chain's length from its reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;
if (plan(0).kudos.at(-1) + 0.8 > plan(0).cut) console.error(new Error('garmin-strava: the last kudos lands under the end card'));

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`garmin-strava variant stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

// a block's entrance: it rises and settles in over 0.45s from `at` (the other beats' card entrance)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
  return ci;
}
const fade = (n, p) => { n.style.opacity = p.toFixed(3); n.style.visibility = p > 0 ? '' : 'hidden'; };
// a mark that pops in from `at`: scale from 0.3 with a little overshoot
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

// an account row's status: a spinner over a shimmering "Connecting", then a green check and Connected from `at`
function statusEl() {
  return '<span class="gs-st"><span class="gs-st-wait"><i class="gs-spin"></i><span class="gs-st-l">Connecting</span></span><span class="gs-st-ok">' + OK + 'Connected</span></span>';
}
function renderStatus(n, t, since, at) {
  const wait = n.querySelector('.gs-st-wait'), ok = n.querySelector('.gs-st-ok'), spin = n.querySelector('.gs-spin'), l = n.querySelector('.gs-st-l');
  const p = seg(t, at, at + 0.3);
  wait.style.opacity = (1 - seg(t, at - 0.08, at + 0.06)).toFixed(3);
  spin.style.transform = `rotate(${((t - since) * 420).toFixed(1)}deg)`;
  l.style.setProperty('--sh', `${(100 - ((t - since) * 140) % 200).toFixed(1)}%`);
  ok.style.opacity = p.toFixed(3);
  ok.firstElementChild.style.transform = p >= 1 ? 'none' : `scale(${lerp(0.3, 1, outBack(p)).toFixed(4)})`;
}

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the chain keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheet();
    loadFrameSheet();
    const T = k.T;

    // v16, re-cued: the typing and send are the engine's (k), the rest this plan's
    const v16 = makePlayer({
      typing: [{ text: k.askBy[ID], s: k.s, end: k.typeEnd }],
      sends: [k.send],
      camera: k.send, // the send drops the composer and pulls the camera out (tabs.9b47fc30.js)
      resolved: [T.garmin, T.strava],
      cards: [T.card1, T.card2],
      gens: [[T.gen0, T.done]],
      image: T.done, model: T.on, order: T.kudos[0], play: T.cut,
      cover: T.cut, pop: T.cut + END_DELAY, word: T.cut + END_DELAY + 0.3, end: T.end,
    }, ID);
    addEventListener('variantchange', () => v16.stop());

    // 1. the setup, in the engine's own reply
    const say1 = sayEl(x, SAY1);
    const auto = x.el(`<div class="bk gs-auto">
      <div class="bk-head"><b class="bk-title">Garmin to Strava<small>Every run, automatically</small></b><span class="gs-state"><span class="gs-state-wait"><i class="gs-spin"></i>Setting up</span><span class="gs-state-on">${OK}On</span></span></div>
      <div class="gs-acct"><span class="gs-tile gs-t-garmin">${GARMIN}</span><span class="gs-txt"><b>Garmin Connect</b><small>Forerunner 265</small></span>${statusEl()}</div>
      <div class="gs-acct"><span class="gs-tile gs-t-strava">${STRAVA}</span><span class="gs-txt"><b>Strava</b><small>Sam</small></span>${statusEl()}</div>
      <div class="gs-rule"><span class="gs-tile gs-t-rule">${REPEAT}</span><span class="gs-txt"><b>When a run ends on your Garmin</b><small>Post it to Strava with its map, pace and time</small></span><span class="gs-sw" role="switch" aria-checked="false" aria-label="Post every run to Strava"><i></i></span></div>
    </div>`);
    const [aG, aS] = auto.querySelectorAll('.gs-acct');
    const sw = auto.querySelector('.gs-sw'), knob = sw.firstElementChild;
    const stWait = auto.querySelector('.gs-state-wait'), stOn = auto.querySelector('.gs-state-on'), stSpin = stWait.querySelector('.gs-spin');
    // the feed glides to a zero-height anchor a little under each card instead of the card's own bottom, so the newest card
    // clears the feed's clip with its edge and shadow (as multicat-credits does, ../multicat.516afb1a.css .mc-anchor)
    const anchor1 = x.el('<i class="mc-anchor" aria-hidden="true"></i>');
    const sayDone = sayEl(x, SAY_DONE);
    sayDone.n.classList.add('gs-said');

    // 2. the next morning: the divider, then superbot's own message with the Strava post
    const day = x.el(`<div class="msg qc-m gs-day">${x.sbAvatar}<div class="m-main"><span class="gs-day-t">${x.esc(DAY)}</span></div></div>`);
    const reply2 = x.el(`<div class="msg qc-m qc-r">${x.sbAvatar}<div class="m-main"></div></div>`);
    const say2 = sayEl(x, SAY2);
    const post = x.el(`<div class="bk gs-post">
      <div class="bk-head"><b class="bk-title">Morning Run<small>Posted to Strava</small></b>${shareBtn('Morning Run on Strava', { url: STRAVA_URL })}<a class="bk-btn bk-publish gs-open" href="${STRAVA_URL}" target="_blank" rel="noopener noreferrer">${STRAVA}View on Strava</a></div>
      <div class="bk-view gs-view"><div class="gs-sv">
        <div class="gs-sv-head"><span class="gs-sv-av">S</span><span class="gs-sv-who"><b>Sam</b><small>${x.esc(WHEN)} · ${x.esc(WHERE)}</small></span><span class="gs-sv-mark">${STRAVA}</span></div>
        <div class="gs-sv-title">Morning Run</div>
        <div class="gs-sv-stats"><span><small>Distance</small><b>${DIST}</b></span><span><small>Pace</small><b>${PACE}<i> /mi</i></b></span><span><small>Time</small><b>${TIME}</b></span></div>
        <div class="gs-sv-map"><img alt="Map of a 5.25 mile run loop through Fort Collins: west on Mountain Avenue, around Sheldon Lake in City Park, back through the Colorado State University campus" width="${MAP_W}" height="${MAP_H}"/><svg viewBox="0 0 ${MAP_W} ${MAP_H}" aria-hidden="true"><path class="gs-route" d="${ROUTE}" style="stroke-dasharray:${ROUTE_LEN} ${ROUTE_LEN}"/><circle class="gs-start" cx="${START[0]}" cy="${START[1]}" r="4.2"/><g transform="translate(${FINISH[0]} ${FINISH[1]})"><g class="gs-fin"><circle r="4.6"/><path d="M-3 -3h2v2h-2zM1 -3h2v2h-2zM-1 -1h2v2h-2zM-3 1h2v2h-2zM1 1h2v2h-2z"/></g></g></svg></div>
        <div class="gs-sv-foot"><span class="gs-kav">${KUDOS.map(([, a, c]) => `<i style="--c:${c}">${a}</i>`).join('')}</span><span class="gs-kt">Be the first to give kudos!</span><span class="gs-kb">${THUMB}</span><span class="gs-kb">${COMMENT}</span></div>
      </div><i class="bk-sh"></i><span class="qc-genl mc-genl-bare">Posting to Strava</span></div>
    </div>`);
    const anchor2 = x.el('<i class="mc-anchor" aria-hidden="true"></i>');
    reply2.lastElementChild.append(say2.n, post, anchor2);
    const page = post.querySelector('.gs-sv'), shP = post.querySelector('.bk-sh'), pill = post.querySelector('.qc-genl');
    const mapImg = post.querySelector('.gs-sv-map img'), route = post.querySelector('.gs-route');
    const start = post.querySelector('.gs-start'), fin = post.querySelector('.gs-fin');
    const kStack = post.querySelector('.gs-kav'), kAvs = [...kStack.children], kText = post.querySelector('.gs-kt'), kBtn = post.querySelector('.gs-kb');
    // Space and Enter press the cards' controls, not the spot's clock (timeline.9b47fc30.js), as on the other beats
    for (const n of [auto, post]) n.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('a, button')) e.stopPropagation(); });

    // 3. the end card: the house lockup, riding in nodes (so other variants hide it), moved over the hub on the first render
    const endCard = x.el(`<div class="mc-end" role="img" aria-label="superbot.gg"><div class="mc-end-word"><b>superbot.gg</b></div><div class="mc-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.mc-end-word'), endBot = endCard.querySelector('.mc-end-bot');
    let endK = 1;

    const follow = [day, reply2];
    let placed = false, kudosShown = -1, sw0 = -1;
    return {
      nodes: [say1.n, auto, anchor1, sayDone.n, ...follow, endCard],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[T.r, say1.n], [T.card1, anchor1], [T.said, sayDone.n], [T.day, day], [T.r2, say2.n], [T.card2, anchor2]],
      render(t) {
        if (!placed) {
          // the next morning's messages leave the engine's reply for the feed, right after it
          let at = auto.closest('.msg');
          for (const m of follow) { at.after(m); at = m; }
          x.hub.closest('.scene').append(endCard);
          // the map loads with the route's first frame, not at mount under every variant
          mapImg.src = MAP;
          track(mapImg.decode().catch((e) => console.error(new Error(`garmin-strava map failed to decode: ${MAP}`, { cause: e }))));
          placed = true;
        }

        // 1. the setup: the line, the frame, Garmin then Strava connecting, the rule switching on
        say1.render(t, T.r);
        enter(auto, t, T.card1);
        renderStatus(aG, t, T.card1, T.garmin);
        renderStatus(aS, t, T.card1, T.strava);
        const s = inOutCubic(seg(t, T.on, T.on + SWITCH));
        if (s !== sw0) {
          knob.style.transform = `translateX(${(14 * s).toFixed(2)}px)`;
          sw.style.setProperty('--on', s.toFixed(3));
          sw.setAttribute('aria-checked', String(s >= 1));
          sw0 = s;
        }
        stSpin.style.transform = `rotate(${((t - T.card1) * 420).toFixed(1)}deg)`;
        fade(stWait, 1 - seg(t, T.on + 0.02, T.on + 0.16));
        pop(stOn, t, T.on + 0.1);
        sayDone.render(t, T.said);

        // 2. the night passes, superbot posts
        x.appear(day, t, T.day);
        x.appear(reply2, t, T.r2);
        say2.render(t, T.r2);
        enter(post, t, T.card2);
        const lp = landing(t, T.done);
        shimmer(shP, t, T.card2, 0, lp);
        settle(page, lp);
        pill.style.opacity = (seg(t, T.gen0 - 0.2, T.gen0) * (1 - seg(t, T.w2 - 0.25, T.w2))).toFixed(3);
        // the route draws itself from the start dot, at an eased run's pace; the finish flag lands as it closes the loop
        const d = inOutCubic(seg(t, T.w2, T.drawn));
        route.style.strokeDashoffset = (ROUTE_LEN * (1 - d)).toFixed(1);
        pop(start, t, T.w2 - 0.05);
        pop(fin, t, T.drawn - 0.1);
        // the kudos: each giver's avatar joins the stack and pops in, the count follows, the thumb bumps
        let n = 0, given = 0;
        KUDOS.forEach(([count], i) => { pop(kAvs[i], t, T.kudos[i]); if (t >= T.kudos[i]) { n = count; given = i + 1; } });
        if (n !== kudosShown) {
          kAvs.forEach((a, i) => { a.style.display = i < given ? '' : 'none'; });
          kStack.style.display = given ? '' : 'none';
          kText.textContent = n ? `${n} gave kudos` : 'Be the first to give kudos!';
          kBtn.classList.toggle('gs-kb-on', n > 0);
          kudosShown = n;
        }
        const bump = Math.max(0, ...T.kudos.map((a) => Math.sin(Math.PI * seg(t, a, a + 0.28))));
        kBtn.style.transform = bump > 0 ? `scale(${(1 + 0.16 * bump).toFixed(4)})` : 'none';

        // the soundtrack follows the clock while v16 is the pick (music.47e5d94a.js DEFAULTS)
        if (music() === 'v16') v16.sync(t); else v16.stop();

        // 3. the end card: the chat fades to black, then the house card's own run (multicat.516afb1a.js)
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
          const pp = clamp(tc / 0.55), shift = outQuint(clamp((tc - 0.3) / 1.0));
          endBot.style.opacity = outQuint(clamp(tc / 0.3)).toFixed(3);
          endBot.style.transform = `translate(${(left + wordW + gap).toFixed(2)}px, ${(midY - w / 2).toFixed(2)}px) scale(${(0.72 + 0.28 * popBack(pp)).toFixed(4)})`;
          endWord.style.opacity = shift.toFixed(3);
          endWord.style.filter = shift < 1 ? `blur(${(6 * kk * (1 - shift)).toFixed(2)}px)` : 'none';
          endWord.style.transform = `translate(${(left - 20 * kk * (1 - shift)).toFixed(2)}px, -50%)`;
        }
      },
    };
  },
};
