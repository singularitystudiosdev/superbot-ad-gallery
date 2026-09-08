'use strict';

// ---- data ----
let ITEMS = [];
let filter = 'All';
let openIdx = -1; // index into filtered list currently shown in the lightbox

const $ = (id) => document.getElementById(id);

function filtered() {
  return ITEMS.filter(i => filter === 'All' || i.group === filter);
}

// ---- grid + filters ----
function renderChips() {
  const counts = { All: ITEMS.length };
  for (const it of ITEMS) counts[it.group] = (counts[it.group] || 0) + 1;
  const chips = $('chips');
  chips.innerHTML = '';
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
    f.src = it.src;
    f.allow = 'autoplay';
    f.title = it.title;
    // refocus the parent so ESC/arrows keep working after the frame grabs focus
    f.addEventListener('load', () => $('lbClose').focus());
    stage.appendChild(f);
  }
  $('lbTitle').textContent = it.title;
  $('lbPos').textContent = `${openIdx + 1} / ${list.length} · ${it.group}`;
}

function open(item, e) {
  openIdx = filtered().indexOf(item);
  if (e) { // open transition grows from the clicked tile
    $('lbStage').style.setProperty('--ox', `${(e.clientX / innerWidth) * 100}%`);
    $('lbStage').style.setProperty('--oy', `${(e.clientY / innerHeight) * 100}%`);
  }
  $('lb').hidden = false;
  document.body.style.overflow = 'hidden';
  renderStage();
}

function close() {
  $('lb').hidden = true;
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
  .then(data => { ITEMS = data; renderChips(); renderGrid(); })
  .catch(err => {
    console.error(err);
    document.getElementById('empty').hidden = false;
    document.getElementById('empty').textContent = 'failed to load manifest.json — serve over http';
  });
