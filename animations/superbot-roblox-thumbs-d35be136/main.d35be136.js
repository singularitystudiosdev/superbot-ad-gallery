// The spot's clock: builds the chat, the live view and the news under it, waits for fonts and images so every
// measured size is final, then paints one frame per animation frame from t, looping every L seconds with a short dip
// to black where it comes round. ?t=12.5 freezes a frame (thumbnails, captures); reduced motion holds one still frame.
import { seg, outCubic, REDUCED } from './lib.d35be136.js';
import { L, OPEN } from './timeline.d35be136.js';
import { buildScreen, fitScreen, paintScreen } from './screen.d35be136.js';
import { buildChat, measureChat, paintChat } from './chat.d35be136.js';
import { buildSide, measureSide, paintSide } from './side.d35be136.js';

const STILL_AT = L - 1.5; // the frame reduced motion holds: the whole run settled, every news line in
const OPEN_LEN = 0.55;
const CENTRE = 300; // the 600px chat column's offset to sit centred in the 1200px app before the panel opens
const stage = document.getElementById('stage');
const dip = document.getElementById('dip');
const chatPane = document.querySelector('.ch');
const sidePane = document.querySelector('.side');
const screen = buildScreen(document.querySelector('.cc-view'));
const chat = buildChat(document.querySelector('.ch'));
const side = buildSide(document.querySelector('.nw'));

function fit() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  stage.style.transform = `translate(-50%, -50%) scale(${k.toFixed(4)})`;
}

// before the first send the chat sits centred and the panel is away; then the panel slides in from the right edge as
// the chat glides left. With reduced motion it simply appears
function openPanel(t) {
  const k = REDUCED ? (t >= OPEN ? 1 : 0) : outCubic(seg(t, OPEN, OPEN + OPEN_LEN));
  chatPane.style.transform = k >= 1 ? 'none' : `translateX(${((1 - k) * CENTRE).toFixed(2)}px)`;
  sidePane.style.transform = k >= 1 ? 'none' : `translateX(${((1 - k) * 100).toFixed(2)}%)`;
  sidePane.style.visibility = k > 0 ? 'visible' : 'hidden';
}

function frame(t) {
  const lt = ((t % L) + L) % L;
  dip.style.opacity = Math.max(seg(lt, L - 0.45, L), 1 - seg(lt, 0, 0.35)).toFixed(3);
  openPanel(lt);
  paintScreen(screen, lt);
  paintChat(chat, lt);
  paintSide(side, lt);
}

async function start() {
  fit();
  addEventListener('resize', fit);
  // a frozen frame waits on every page capture, mark and card image
  const imgs = [...document.querySelectorAll('img[src]')];
  await Promise.all([document.fonts.ready, ...imgs.map((img) => img.decode().catch((e) => console.error(new Error(`image failed to decode: ${img.src}`, { cause: e }))))]);
  fitScreen(screen);
  measureChat(chat);
  measureSide(side);

  const q = new URLSearchParams(location.search);
  const still = q.has('t') ? Number(q.get('t')) : matchMedia('(prefers-reduced-motion: reduce)').matches && !q.has('play') ? STILL_AT : null;
  if (still !== null) {
    frame(still);
    document.documentElement.dataset.ready = '1';
    return;
  }
  const speed = Number(q.get('speed')) || 1;
  const t0 = performance.now();
  const tick = (now) => { frame(((now - t0) / 1000) * speed); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  document.documentElement.dataset.ready = '1';
}

start().catch((e) => { console.error(e); throw e; });
