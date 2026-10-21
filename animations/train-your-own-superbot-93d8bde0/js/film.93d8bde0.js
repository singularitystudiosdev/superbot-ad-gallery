// "Train your own Superbot": the director. Builds the stage (the Superbot app from the kit, his Chrome, the recording
// overlay, the presenter's facecam, the end card), derives the cue sheet from the voice, and draws the film as a pure
// function of t on the reference spot's clock.
import { makeApp, makeCreatePanel, makeRecPill, makeThread, makeMark } from '../kit/kit.93d8bde0.js';
import { seg, outCubic, outBack, clamp, h, css, op, vis, esc } from './lib.93d8bde0.js';
import { makeDesk } from './desk.93d8bde0.js';
import { buildTiming, NAME } from './timing.93d8bde0.js';
import { buildUser } from './sc-user.93d8bde0.js';
import { buildAgent } from './sc-agent.93d8bde0.js';
import { makePip } from './pip.93d8bde0.js';
import { startClock, mountControls } from './clock.93d8bde0.js';
import { VO } from './vo.93d8bde0.js';

const q = new URLSearchParams(location.search);
if (q.has('clean')) document.body.classList.add('clean');
const stage = document.getElementById('stage');
function fit() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  stage.style.transform = `translate(-50%, -50%) scale(${k})`;
}
addEventListener('resize', fit);
fit();

const T = buildTiming(VO);
const layer = (cls) => { const el = h(`<div class="layer ${cls}"></div>`); stage.appendChild(el); return el; };

// ---- the app: his other Superbots in the sidebar, the new-chat hero, the composer ----
const ROWS = [
  { id: 'discord', title: 'Discord mod queue', status: 'working', base: 134 },
  { id: 'robux', title: 'Weekly Robux report', status: 'idle', base: 41 },
  { id: 'devforum', title: 'DevForum replies', status: 'working', base: 1012 },
  { id: 'wall', title: 'Group wall cleanup', status: 'idle', base: 0 },
  { id: 'inbox', title: 'Inbox triage', status: 'working', base: 388 },
];
const appLayer = layer('app-layer');
const appWrap = h('<div class="scale125"></div>');
appLayer.appendChild(appWrap);
const app = makeApp({ rows: ROWS });
appWrap.appendChild(app.root);
const create = makeCreatePanel();
app.root.appendChild(create.root);
const rob = app.addRowTop('rob', NAME, 'working');
app.setActive(null);
const headName = app.head.querySelector('.sbk-head-name');
const listCount = app.list.querySelector('.sbk-list-head span:last-child');
// every disc stays a neutral letter, and so does its tooltip
app.discs.querySelectorAll('.sbk-disc[title]').forEach((d, i) => d.setAttribute('title', ['Mail', 'Files', 'Calendar', 'Chat', 'Connect an app'][i] || ''));
const thread = makeThread({ duration: '0:00', outcome: 'Worked for 3d 4h' });
const agent = buildAgent({ T, app, thread, kitMark: makeMark });

// ---- his Chrome, the recording overlay, the pointer ----
const deskWrap = layer('desk-wrap');
const deskScale = h('<div class="scale125"></div>');
deskWrap.appendChild(deskScale);
const desk = makeDesk({ scale: 1 });
deskScale.appendChild(desk.root);
const recLayer = layer('rec-layer');
const edge = h('<i class="rv-edge"><i class="rv-soft"><i class="rv-band"></i></i></i>');
recLayer.appendChild(edge);
const soft = edge.firstElementChild;
const pill = makeRecPill({ timer: '0:00' });
const pillWrap = h('<div class="rv-pill"><div class="sbk sbk-bare"></div></div>');
pillWrap.firstElementChild.appendChild(pill.root);
recLayer.appendChild(pillWrap);
const ptrLayer = layer('ptr-layer');

// ---- the first line's caption, the end card, the facecam ----
const capLayer = layer('cap-layer');
const L1 = T.line('L1');
const cap = h(`<div class="pip-cap">${L1.words.map((w) => `<span>${esc(w.w)}</span>`).join(' ')}</div>`);
capLayer.appendChild(cap);
const capWords = [...cap.children];
const L9 = T.l9;
const cut = L9.words.findIndex((w) => /\.$/.test(w.w)) + 1; // the line's two sentences, one per row
const endEl = h(`<div class="end"><i class="end-glow"></i><div class="end-in">
  <div class="end-line"><span class="end-l1">${L9.words.slice(0, cut).map((w) => `<span>${esc(w.w)}</span>`).join(' ')}</span><span class="end-l2">${L9.words.slice(cut).map((w) => `<span>${esc(w.w)}</span>`).join(' ')}</span></div>
  <div class="end-lock"><span class="end-face"></span><span class="end-word">superbot.gg</span></div>
</div></div>`);
layer('end-layer').appendChild(endEl);
const endWords = [...endEl.querySelectorAll('.end-line > span > span')];
const endMark = makeMark({ size: 150 });
endEl.querySelector('.end-face').appendChild(endMark.el);
const endLock = endEl.querySelector('.end-lock'), endWord = endEl.querySelector('.end-word'), endFace = endEl.querySelector('.end-face');
const pip = makePip({ src: 'media/presenter.93d8bde0.mp4', poster: 'img/presenter-poster.93d8bde0.jpg' });
stage.appendChild(pip.el);

// ---- scenes 1 to 5 need the thread at rest to aim the recording's flight ----
agent.restPose();
const user = buildUser({ stage, T, VO, app, create, desk, deskWrap, pill, pillWrap, edge, soft, ptrLayer, appWrap, poster: thread.poster });
thread.root.querySelector('.sbk-rec-meta').textContent = user.recLen;

// the sidebar over the film: the new bot slides in at the top, the others keep their own schedules
const STATUS = {
  discord: [[0, 'working'], [T.s7 + 4.0, 'idle']],
  robux: [[0, 'idle'], [T.s7 + 2.0, 'working']],
  devforum: [[0, 'working']],
  wall: [[0, 'idle'], [T.s7 + 7.0, 'needs']],
  inbox: [[0, 'working'], [T.s7 + 9.5, 'idle']],
  rob: [[0, 'working']],
};
const clocks = new Map([...app.rows.values()].map((r) => [r.id, r.el.querySelector('.sbk-row-clock')]));
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function sidebar(t) {
  for (const [id, sched] of Object.entries(STATUS)) {
    let st = sched[0][1];
    for (const [at, s] of sched) if (t >= at) st = s;
    const row = app.rows.get(id);
    if (row.status !== st) app.setRowStatus(id, st);
    const base = (ROWS.find((r) => r.id === id) || { base: 0 }).base;
    const c = clocks.get(id), txt = fmt(base + Math.max(0, t - (id === 'rob' ? T.rowAdd : 0)));
    if (c && c.textContent !== txt) c.textContent = txt;
  }
  const r = outCubic(seg(t, T.rowAdd, T.rowAdd + 0.4));
  css(rob.el, 'max-height', `${(r * 48).toFixed(2)}px`);
  op(rob.el, r);
  const active = t >= T.rowAdd ? 'rob' : null;
  if (rob.el.getAttribute('data-active') !== String(active === 'rob')) app.setActive(active);
  const count = String(ROWS.length + (t >= T.rowAdd ? 1 : 0));
  if (listCount.textContent !== count) listCount.textContent = count;
  const title = t >= T.appBack[0] ? NAME : 'New chat';
  if (headName.textContent !== title) headName.textContent = title;
  op(app.hero, 1 - seg(t, T.appBack[0] - 0.2, T.appBack[0]));
}

function draw(t) {
  sidebar(t);
  app.paint(t * 1000);
  create.paint(t * 1000);
  user.render(t);
  agent.render(t);
  // the first line, word by word under the hero
  const cv = seg(t, L1.start - 0.15, L1.start + 0.1) * (1 - seg(t, L1.end + 0.5, L1.end + 0.8));
  op(cap, cv); vis(cap, cv > 0);
  L1.words.forEach((w, i) => capWords[i].classList.toggle('on', t >= w.t0 - 0.02));
  // the end card
  const e = seg(t, T.endIn, T.endIn + 0.45);
  op(endEl, e); vis(endEl, e > 0);
  L9.words.forEach((w, i) => {
    const p = outCubic(seg(t, w.t0 - 0.06, w.t0 + 0.16));
    op(endWords[i], p); css(endWords[i], 'transform', `translateY(${((1 - p) * 12).toFixed(2)}px)`);
  });
  const pop = clamp(outBack(seg(t, T.endIn + 0.25, T.endIn + 0.75), 1.4), 0, 1.2);
  css(endFace, 'transform', `scale(${(0.4 + 0.6 * pop).toFixed(4)})`); op(endFace, clamp(pop));
  const wd = outCubic(seg(t, T.endIn + 0.45, T.endIn + 0.9));
  op(endWord, wd); css(endWord, 'transform', `translateX(${((1 - wd) * -18).toFixed(2)}px)`);
  op(endLock, 1);
  endMark.paint(t * 1000);
  if (clock) pip.render(t, clock);
}

// everything a frame shows, loaded, before a frozen frame counts as ready: the fonts, and every image with its pixels
// (checked live, since a frame may swap an image's source); a broken image is reported, never waited on forever
let fontsReady = false;
document.fonts.ready.then(() => { fontsReady = true; });
const broken = new Set();
stage.addEventListener('error', (e) => {
  if (e.target.tagName !== 'IMG') return;
  broken.add(e.target.currentSrc || e.target.src);
  console.error(new Error(`image failed to load: ${e.target.currentSrc || e.target.src}`));
}, true);
const imagesReady = () => [...stage.querySelectorAll('img')].every((im) => !im.getAttribute('src') || broken.has(im.currentSrc || im.src) || (im.complete && im.naturalWidth > 0));

// the clock draws its first frame as it starts, before it is assigned: the facecam joins from the second frame on
let clock = null;
clock = startClock({ cycle: VO.total, draw, ready: () => fontsReady && imagesReady() && pip.ready });
mountControls(clock);
pip.mountSound(clock);
