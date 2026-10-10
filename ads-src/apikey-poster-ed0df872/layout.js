'use strict';
// Lays the poster out for whatever ratio the viewport is: picks the
// arrangement (wide 16:9, mid 4:3 and 1:1, tall 4:5), fits the headline to its
// column, places the key dock and plans under it, then fills the masked key
// with as many storm-coloured dots as fit. Sets <html data-fitted="1"> when
// done, for render.mjs.

// 4:3 has the widest headline column, so its size is capped to leave room for the plans
const HEAD_MAX = { wide: Infinity, mid: 124, tall: Infinity };
// the dot colours along the dock's masked key, sampled left to right
const DOT_STOPS = [[0, '#F346B5'], [0.25, '#A545EC'], [0.35, '#8F54FE'], [0.55, '#4A84FF'], [0.8, '#8458FD'], [1, '#B53BE8']];
const DOT_PITCH = 2.6; // centre-to-centre spacing, in dot diameters

function arrangement() {
  const r = innerWidth / innerHeight;
  return r >= 1.6 ? 'wide' : r >= 0.95 ? 'mid' : 'tall';
}

function fitHead(head, ar) {
  const lines = [...head.querySelectorAll('.line')];
  const widest = () => Math.max(...lines.map(l => l.getBoundingClientRect().width));
  let size = 100;
  for (let i = 0; i < 4; i++) {
    head.style.fontSize = `${size}px`;
    size *= head.clientWidth / widest();
  }
  head.style.fontSize = `${Math.floor(Math.min(size, HEAD_MAX[ar]))}px`;
}

// mid and tall stack under the headline, so their tops depend on its fitted height
function stack(ar, head) {
  const dock = document.querySelector('.dock');
  const plans = document.querySelector('.plans');
  const below = head.offsetTop + head.offsetHeight;
  if (ar === 'mid') {
    const W = innerWidth - 160;
    dock.style.width = `${Math.round(W * 0.53)}px`;
    plans.style.width = `${Math.round(W * 0.44)}px`;
    plans.style.top = `${below + 40}px`;
    const plansMid = plans.offsetTop + plans.offsetHeight / 2;
    dock.style.top = `${Math.round(plansMid - dock.offsetHeight / 2)}px`;
  } else if (ar === 'tall') {
    dock.style.top = `${below + 32}px`;
    plans.style.top = `${dock.offsetTop + dock.offsetHeight + 32}px`;
  }
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

function fillDots() {
  const dots = document.querySelector('.dots');
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
  const head = document.querySelector('.head');
  fitHead(head, ar);
  stack(ar, head);
  fillDots();
  document.documentElement.dataset.fitted = '1';
}

layout();
addEventListener('resize', layout);
