'use strict';
// Lays the poster out for whatever ratio the viewport is: picks the
// arrangement (wide 16:9, mid 4:3 and 1:1, tall 4:5), fits the headline to its
// column, places the key and plans under it, then draws one wire from the key
// to every plan row. Sets <html data-fitted="1"> when done, for render.mjs.

function arrangement() {
  const r = innerWidth / innerHeight;
  return r >= 1.6 ? 'wide' : r >= 0.95 ? 'mid' : 'tall';
}

// 4:3 has the widest headline column, so its size is capped to leave room for the plans
const HEAD_MAX = { wide: Infinity, mid: 124, tall: Infinity };

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
  const key = document.querySelector('.key');
  const sub = document.querySelector('.sub');
  const plans = document.querySelector('.plans');
  const below = head.offsetTop + head.offsetHeight;
  if (ar === 'mid') {
    const W = innerWidth - 160;
    const keyW = Math.round(W * 0.44);
    const plansW = Math.round(W * 0.48);
    key.style.width = `${keyW}px`;
    plans.style.width = `${plansW}px`;
    plans.style.top = `${below + 40}px`;
    const plansMid = plans.offsetTop + plans.offsetHeight / 2;
    key.style.top = `${Math.round(plansMid - key.offsetHeight / 2 - 40)}px`;
    sub.style.width = `${keyW}px`;
    sub.style.top = `${key.offsetTop + key.offsetHeight + 28}px`;
  } else if (ar === 'tall') {
    key.style.top = `${below + 32}px`;
    plans.style.top = `${key.offsetTop + key.offsetHeight + 28}px`;
  }
}

function drawWires(ar) {
  const svg = document.querySelector('.wires');
  const poster = document.querySelector('.poster').getBoundingClientRect();
  const key = document.querySelector('.key').getBoundingClientRect();
  const card = document.querySelector('.plans').getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${poster.width} ${poster.height}`);
  if (ar === 'tall') { svg.innerHTML = ''; return; }
  const x0 = key.right - poster.left;
  const y0 = key.top + key.height / 2 - poster.top;
  const x1 = card.left - poster.left;
  const bend = (x1 - x0) * 0.6;
  let paths = '';
  let dots = '';
  for (const row of document.querySelectorAll('.row')) {
    const r = row.getBoundingClientRect();
    const y1 = r.top + r.height / 2 - poster.top;
    paths += `<path d="M${x0} ${y0} C${x0 + bend} ${y0} ${x1 - bend} ${y1} ${x1} ${y1}"/>`;
    dots += `<circle cx="${x1}" cy="${y1}" r="4"/>`;
  }
  svg.innerHTML = `<defs><linearGradient id="wire" gradientUnits="userSpaceOnUse" x1="${x0}" y1="0" x2="${x1}" y2="0">`
    + `<stop offset="0" stop-color="#C9549F"/><stop offset=".5" stop-color="#8B66E7"/><stop offset="1" stop-color="#4769F5"/>`
    + `</linearGradient></defs>${paths}${dots}`;
}

async function layout() {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.decode().catch(e => console.error('image decode failed', i.src, e))));
  const ar = arrangement();
  document.body.dataset.ar = ar;
  const head = document.querySelector('.head');
  fitHead(head, ar);
  stack(ar, head);
  drawWires(ar);
  document.documentElement.dataset.fitted = '1';
}

layout();
addEventListener('resize', layout);
