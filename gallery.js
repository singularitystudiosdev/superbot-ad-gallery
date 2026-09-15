'use strict';

// ---- data ----
let ITEMS = [];
let filter = 'All';
let openIdx = -1; // index into filtered list currently shown in the lightbox

const $ = (id) => document.getElementById(id);

// ---- aspect ratio (the animations read ?ar= through assets/ar.js) ----
const RATIOS = [['4x5', '4:5', 4 / 5], ['16x9', '16:9', 16 / 9], ['4x3', '4:3', 4 / 3], ['1x1', '1:1', 1]];
let ar = localStorage.getItem('gallery.ar') || '16x9';
if (!RATIOS.some(r => r[0] === ar)) ar = '16x9';

// the download link: assets/video/<id>.<ratio>.mp4, rendered offline by .tmp/ar-render (one loop, 1080 high)
function renderDl() {
  const a = $('lbDl');
  const it = $('lb').hidden ? null : filtered()[openIdx];
  if (!it || it.type !== 'animation') { a.hidden = true; return; }
  const label = RATIOS.find(x => x[0] === ar)[1];
  a.href = `assets/video/${it.id}.${ar}.mp4`;
  a.download = `${it.id}-${label.replace(':', 'x')}.mp4`;
  a.textContent = `⤓ download ${label}`;
  a.hidden = false;
}

function renderAr() {
  const box = $('lbAr');
  box.innerHTML = '';
  document.documentElement.style.setProperty('--tile-ar', RATIOS.find(x => x[0] === ar)[1].replace(':', '/'));
  for (const [key, label] of RATIOS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = key === ar ? 'on' : '';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(key === ar));
    b.textContent = label;
    b.onclick = () => setAr(key);
    box.appendChild(b);
  }
}

function setAr(key) {
  if (key === ar) return;
  ar = key;
  localStorage.setItem('gallery.ar', key);
  renderAr();
  if (!$('lb').hidden) renderStage(); // reloads the open frame at the new ratio; every spot loops anyway
  renderDl();
}

// the frame fits the same box the 16:9 frame used (92vw x 82vh, capped at 1280x720) at the chosen ratio
function frameSize() {
  const r = RATIOS.find(x => x[0] === ar)[2];
  const bw = Math.min(innerWidth * 0.92, 1280), bh = Math.min(innerHeight * 0.82, 720);
  const w = Math.min(bw, bh * r);
  return { w: Math.round(w), h: Math.round(w / r) };
}

function sizeFrame() {
  const f = $('lbStage').querySelector('iframe');
  if (!f) return;
  const { w, h } = frameSize();
  f.style.width = `${w}px`;
  f.style.height = `${h}px`;
}
addEventListener('resize', sizeFrame);

function filtered() {
  return ITEMS.filter(i => filter === 'All' || i.group === filter);
}

// ---- grid + filters ----
function renderChips() {
  const counts = { All: ITEMS.length };
  for (const it of ITEMS) counts[it.group] = (counts[it.group] || 0) + 1;
  const chips = $('chips');
  chips.innerHTML = '';
  if (Object.keys(counts).length < 3) { chips.hidden = true; return; } // one real group: no filters
  for (const [name, n] of Object.entries(counts)) {
    const b = document.createElement('button');
    b.className = 'chip' + (filter === name ? ' on' : '');
    b.textContent = `[${name.toLowerCase()} ${n}]`;
    b.onclick = () => { filter = name; renderChips(); renderGrid(); };
    chips.appendChild(b);
  }
}

function renderGrid() {
  const list = filtered();
  const grid = $('grid');
  grid.innerHTML = '';
  $('empty').hidden = list.length > 0;
  $('count').textContent = `${list.length} items`;
  for (const it of list) {
    const t = document.createElement('button');
    t.className = 'tile' + (it.type === 'animation' ? ' anim' : '');
    const wh = it.w ? ` width="${it.w}" height="${it.h}"` : '';
    t.innerHTML =
      `<img src="${it.thumb}" alt="${it.title}" loading="lazy"${wh}>` +
      `<span class="meta"><span class="badge">${it.type === 'animation' ? '▶ play' : '⤢ zoom'}</span>` +
      `<span class="g">${it.group}</span><br><span class="t">${it.title}</span></span>`;
    const im = t.querySelector('img');
    if (im.complete) im.classList.add('loaded');
    else im.onload = () => im.classList.add('loaded');
    t.onclick = (e) => open(it, e);
    grid.appendChild(t);
  }
}

// ---- lightbox ----
function renderStage() {
  const list = filtered();
  const it = list[openIdx];
  const stage = $('lbStage');
  stage.innerHTML = '';
  if (it.type === 'image') {
    const img = document.createElement('img');
    img.src = it.src;
    img.alt = it.title;
    img.onclick = (e) => { // click-to-zoom, origin follows the click
      img.style.setProperty('--zx', `${(e.clientX / innerWidth) * 100}%`);
      img.style.setProperty('--zy', `${(e.clientY / innerHeight) * 100}%`);
      img.classList.toggle('zoomed');
    };
    stage.appendChild(img);
  } else {
    const f = document.createElement('iframe');
    f.src = `${it.src}${it.src.includes('?') ? '&' : '?'}ar=${ar}`;
    f.allow = 'autoplay';
    f.title = it.title;
    // refocus the parent so ESC/arrows keep working after the frame grabs focus
    f.addEventListener('load', () => $('lbClose').focus());
    stage.appendChild(f);
    sizeFrame();
  }
  renderDl();
  $('lbTitle').textContent = it.title;
  $('lbPos').textContent = `${openIdx + 1} / ${list.length} · ${it.group}${it.type === 'animation' ? ` · ${RATIOS.find(x => x[0] === ar)[1]}` : ''}`;
}

function open(item, e) {
  openIdx = filtered().indexOf(item);
  if (e) { // open transition grows from the clicked tile
    $('lbStage').style.setProperty('--ox', `${(e.clientX / innerWidth) * 100}%`);
    $('lbStage').style.setProperty('--oy', `${(e.clientY / innerHeight) * 100}%`);
  }
  $('lb').hidden = false;
  document.body.classList.add('lb-open');
  document.body.style.overflow = 'hidden';
  renderStage();
}

function close() {
  $('lb').hidden = true;
  document.body.classList.remove('lb-open');
  $('lbDl').hidden = true;
  $('lbStage').innerHTML = ''; // kills the iframe rAF + audio
  document.body.style.overflow = '';
}

function step(d) {
  const list = filtered();
  openIdx = (openIdx + d + list.length) % list.length;
  renderStage();
}

$('lbClose').onclick = close;
$('lbPrev').onclick = () => step(-1);
$('lbNext').onclick = () => step(1);
$('lb').addEventListener('click', (e) => { if (e.target === $('lb')) close(); });
document.addEventListener('keydown', (e) => {
  if ($('lb').hidden) return;
  if (e.key === 'Escape') close();
  else if (e.key === 'ArrowLeft') step(-1);
  else if (e.key === 'ArrowRight') step(1);
});

// ---- boot ----
fetch('manifest.json')
  .then(r => r.json())
  .then(data => { ITEMS = data; renderAr(); renderChips(); renderGrid(); })
  .catch(err => {
    console.error(err);
    document.getElementById('empty').hidden = false;
    document.getElementById('empty').textContent = 'failed to load manifest.json — serve over http';
  });
