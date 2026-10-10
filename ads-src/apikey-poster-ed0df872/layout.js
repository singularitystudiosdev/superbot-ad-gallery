'use strict';
// Lays the poster out for whatever ratio the viewport is. wide (16:9, 4:3):
// headline and key centred as one block on the left, superbot.gg and the
// mascot under it, the phone on the right. stack (1:1, 4:5): headline and key
// across the top, the phone bottom right, superbot.gg beside it. Fills the
// masked key with storm-coloured dots and sets <html data-fitted="1"> for
// render.mjs.

const PHONE_ASPECT = 1044 / 2152; // assets/phone.png
const KEY_SHARE = 0.72;           // key width as a share of the headline width
// the dot colours along the dock's masked key, sampled left to right
const DOT_STOPS = [[0, '#F346B5'], [0.25, '#A545EC'], [0.35, '#8F54FE'], [0.55, '#4A84FF'], [0.8, '#8458FD'], [1, '#B53BE8']];
const DOT_PITCH = 2.6; // centre-to-centre spacing, in dot diameters

function arrangement() {
  return innerWidth / innerHeight >= 1.2 ? 'wide' : 'stack';
}

function place(el, x, y) {
  el.style.left = `${Math.round(x)}px`;
  el.style.top = `${Math.round(y)}px`;
}

function fitHead(head, width) {
  const lines = [...head.querySelectorAll('.line')];
  const widest = () => Math.max(...lines.map(l => l.getBoundingClientRect().width));
  let size = 100;
  for (let i = 0; i < 4; i++) {
    head.style.fontSize = `${size}px`;
    size *= width / widest();
  }
  head.style.fontSize = `${Math.floor(size)}px`;
}

function sizeLockup(els, headW) {
  els.lockup.style.width = `${Math.round(headW)}px`;
  fitHead(els.head, headW);
  els.key.style.width = `${Math.round(headW * KEY_SHARE)}px`;
}

function setPhone(stage, x, y, h) {
  stage.style.width = `${Math.round(h * PHONE_ASPECT)}px`;
  stage.style.height = `${Math.round(h)}px`;
  place(stage, x, y);
}

function layoutWide(els) {
  const W = innerWidth;
  const H = innerHeight;
  const ph = 940;
  const phoneX = W - 150 - ph * PHONE_ASPECT;
  setPhone(els.stage, phoneX, (H - ph) / 2, ph);
  const margin = W >= 1800 ? 120 : 80;
  const right = phoneX - 80;
  const cx = (margin + right) / 2;
  const headW = Math.min(880, right - margin);
  sizeLockup(els, headW);
  place(els.lockup, cx - headW / 2, (H - els.lockup.offsetHeight) / 2);
  place(els.foot, cx - els.foot.offsetWidth / 2, H - 64 - els.foot.offsetHeight);
}

function layoutStack(els) {
  const W = innerWidth;
  const H = innerHeight;
  const margin = W < 1000 ? 64 : 80;
  sizeLockup(els, W - 2 * margin);
  place(els.lockup, margin, margin);
  const top = els.lockup.offsetTop + els.lockup.offsetHeight + 44;
  const ph = H - 40 - top;
  const phoneX = W - margin - ph * PHONE_ASPECT;
  setPhone(els.stage, phoneX, top, ph);
  const cx = (margin + phoneX - 24) / 2;
  place(els.foot, cx - els.foot.offsetWidth / 2, top + ph / 2 - els.foot.offsetHeight / 2);
}

function hex(c) {
  return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
}

function dotColor(t) {
  let i = 1;
  while (i < DOT_STOPS.length - 1 && t > DOT_STOPS[i][0]) i++;
  const [t0, c0] = DOT_STOPS[i - 1];
  const [t1, c1] = DOT_STOPS[i];
  const k = (t - t0) / (t1 - t0);
  const [a, b] = [hex(c0), hex(c1)];
  return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * k)).join(',')})`;
}

function fillDots(dots) {
  dots.innerHTML = '<span class="dot"></span>';
  const d = dots.firstElementChild.getBoundingClientRect().width;
  const n = Math.max(3, Math.floor(dots.clientWidth / (d * DOT_PITCH)) + 1);
  dots.innerHTML = Array.from({ length: n }, (_, i) => `<span class="dot" style="background:${dotColor(i / (n - 1))}"></span>`).join('');
}

async function layout() {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.decode().catch(e => console.error('image decode failed', i.src, e))));
  const ar = arrangement();
  document.body.dataset.ar = ar;
  const els = Object.fromEntries(['lockup', 'head', 'key', 'dots', 'foot', 'stage'].map(c => [c, document.querySelector(`.${c}`)]));
  (ar === 'wide' ? layoutWide : layoutStack)(els);
  fillDots(els.dots);
  document.documentElement.dataset.fitted = '1';
}

layout();
addEventListener('resize', layout);
