// The spot's clock: builds the schedule, the chat and the live view, waits for fonts and images so every measured
// position is final, then paints one frame per animation frame from t, looping every L seconds. ?t=12.5 freezes a frame
// (for thumbnails and captures); space pauses, R restarts, the arrow keys step a second.
import { buildSchedule } from './schedule.9d36de72.js?v=9';
import { buildScreen, fit, measure, paint, decodeAll } from './screen.9d36de72.js?v=9';
import { buildFeed, measureFeed, paintFeed } from './feed.9d36de72.js?v=9';
import { seg, lerp, outCubic, REDUCED } from './lib.9d36de72.js?v=9';

const S = buildSchedule();
const stage = document.getElementById('stage');
const dip = document.getElementById('dip');
const view = buildScreen(document.querySelector('.cc-view'));
const feed = buildFeed(document.querySelector('.ch'), document.querySelector('.ac'), S);

function scaleStage() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  stage.style.transform = `translate(-50%, -50%) scale(${k})`;
}
addEventListener('resize', scaleStage);
scaleStage();

const params = new URLSearchParams(location.search);
const frozen = params.has('t') ? Number(params.get('t')) : null;
if (frozen !== null) document.body.classList.add('freeze');
// the key hint only on ?controls=1, so the gallery's embed is the app alone
if (params.get('controls') === '1') document.querySelector('.hint').hidden = false;

// the computer pane: off the right edge until the first message is sent, then it slides in, its divider with it, as
// the chat narrows to its left (with reduced motion it fades in instead)
const chat = document.querySelector('.ch'), panel = document.querySelector('.cc');
const APP_W = 1200, CHAT_W = 548, PANEL_W = 652, PANEL_IN = 0.5;
function dock(t) {
  const k = outCubic(seg(t, S.panel, S.panel + PANEL_IN));
  chat.style.width = `${lerp(APP_W, CHAT_W, REDUCED ? (k > 0 ? 1 : 0) : k).toFixed(2)}px`;
  panel.style.transform = REDUCED || k >= 1 ? 'none' : `translateX(${((1 - k) * (PANEL_W + 2)).toFixed(2)}px)`;
  panel.style.opacity = REDUCED ? k.toFixed(3) : '1';
  panel.style.visibility = k > 0 ? 'visible' : 'hidden';
}

function frame(t) {
  const lt = ((t % S.L) + S.L) % S.L;
  // a short dip to black where the loop comes round
  dip.style.opacity = Math.max(seg(lt, S.L - 0.45, S.L), 1 - seg(lt, 0, 0.35)).toFixed(3);
  dock(lt);
  paint(view, S, lt);
  paintFeed(feed, S, lt);
}

let origin = 0, paused = false, pausedAt = 0;
const now = () => (paused ? pausedAt : (performance.now() - origin) / 1000);
function loop() {
  frame(now());
  requestAnimationFrame(loop);
}

async function start() {
  await document.fonts.ready;
  await Promise.all([...document.images].filter((img) => img.getAttribute('src')).map((img) => img.decode().catch((e) => console.error(new Error(`image failed to decode: ${img.src}`, { cause: e })))));
  await decodeAll(view);
  fit(view);
  measure(view);
  measureFeed(feed);
  if (frozen !== null) { frame(frozen); window.__ready = true; return; }
  origin = performance.now();
  window.__ready = true;
  loop();
}

addEventListener('keydown', (e) => {
  if (frozen !== null) return;
  if (e.key === ' ') {
    e.preventDefault();
    if (paused) { origin = performance.now() - pausedAt * 1000; paused = false; } else { pausedAt = now(); paused = true; }
  } else if (e.key === 'r' || e.key === 'R') {
    origin = performance.now(); pausedAt = 0;
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const d = e.key === 'ArrowRight' ? 1 : -1;
    if (paused) pausedAt = Math.max(0, pausedAt + d); else origin -= d * 1000;
  }
});

start().catch((e) => { console.error(e); throw e; });
