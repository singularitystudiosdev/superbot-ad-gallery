// Study guide beat (the 'studyguide' variant): one ask, "Make me a study guide for my test, look through my google
// classroom to find all relevant info", answered the way the multicat-credits cut answers (multicat.516afb1a.js `bare`):
// no model on show, the composer on Superbot throughout, the reply straight after the send. The engine types and sends
// the ask (chat.9b47fc30.js, a bare route); this beat answers it inside the engine's reply:
//   1. superbot looks through Google Classroom, rebuilt light inside the bakery artifact frame (bakery.005f5570.css .bk):
//      from the class list the pointer opens AP Biology; on its Stream, Ms. Rivera's announcement names the test and is
//      ringed; on Classwork every Unit 4 post is read in turn, tagged with what superbot took from it, and Unit 3 is left
//      alone. The frame's title counts as it goes, ending on "9 sources found".
//   2. the study guide generates under a skeleton whose pill counts its real seconds while the frame's x50 badge says the
//      wait plays fast-forwarded (as the multicat cut's generations do), then lands as a Google Doc that scrolls from its
//      overview, through photosynthesis, to "What you missed on Quiz 4.1".
//   3. the house superbot.gg end card (the multicat cut's) covers the chat.
// The class, its teacher, posts, dates and grades are made up; the biology is not (img/studyguide.40e96f96/CREDITS.txt).
// Under it plays v16 on the Music pill (multicat-score.96834de7.js through multicat-player.96834de7.js), rendered from
// this plan's cue sheet, its bed building into the end card where the cat cut's builds into its song. A pure function of
// t, except that audio, which follows the clock. Its stylesheet (../studyguide.40e96f96.css) and the Classroom and Docs
// chrome's typeface load with the module.
import { clamp, lerp, seg, outCubic, outQuint, inOutCubic, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { LAND, landing, shimmer, settle } from './thumb-land.309eb9c5.js';
import { EXPAND, loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
import { shareBtn } from './share.29a362ea.js';
import { music } from '../../../music.47e5d94a.js?v=2';
// the same instance the multicat chains use (the full URL keys it), so the Music pill sees every chain's player
import { makePlayer } from './multicat-player.96834de7.js?v=4';

const CSS = new URL('../studyguide.40e96f96.css?v=2', import.meta.url).href;
export const ID = 'studyguide';
const asset = (p) => new URL('../../../img/studyguide.40e96f96/' + p, import.meta.url).href;
const CLASSROOM = asset('classroom.svg'), DOCS = asset('docs.svg'), SLIDES = asset('slides.svg');
// Google Sans Flex (OFL), Latin only: the Classroom and Docs chrome's face
const FONT = asset('google-sans-flex-latin.woff2');
const CLASS_URL = 'https://classroom.google.com/';
const DOC_URL = 'https://docs.google.com/document/';
const DOC_TITLE = 'Unit 4 Test Study Guide';

export const TYPE_CPS = 55; // the ask types at the multicat chains' rate (chat.9b47fc30.js typing)
const SAY1 = 'Looking through your Google Classroom for everything on the test.';
const SAY2 = 'Here’s your study guide for Friday’s Unit 4 test.';
// the doc's generation plays X times fast (the frame's badge says so): its pill counts GEN real seconds at X times the
// spot's clock. GEN is an estimate: the nine sources' text in one long-context prompt, then about 1,100 words of guide
// streamed at the 30 to 40 tokens a second a frontier model writes
const X = 50, GEN = 52;
const FF_IN = 0.2; // the frame's badge fades in over this, full as the generation starts
const SEEN = 0.45; // a card's rise and the feed's glide to it (multicat.516afb1a.js SEEN): its generation starts once in view
// the house end card, as the multicat cut runs it (multicat.516afb1a.js END_*)
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5, END_GAP = 44;
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const END_FACE = '<svg class="sg-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="sgEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#sgEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#sgEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#sgEndFace)"/></svg>';

// the browse, in seconds from the Classroom card's entrance: the page lands, the pointer opens AP Biology, the Stream
// comes in and its announcement is ringed, the pointer opens Classwork, then each Unit 4 post is read STEP apart
const BR = { land: 0.45, ptrIn: 0.7, click1: 1.25, stream: 1.4, found: 1.95, click2: 2.85, classwork: 3.0, read0: 3.3, step: 0.3 };
// Unit 4's posts on Classwork, newest first as Classroom lists them: [kind, title, the right-hand date, superbot's tag]
const UNIT4 = [
  ['assignment', 'Unit 4 Review Packet', 'Due Oct 22', '24 questions'],
  ['material', 'Ch. 10 Photosynthesis slides', 'Posted Oct 15', '42 slides'],
  ['assignment', 'Photosynthesis Pigments Lab', 'Due Oct 16', 'Your lab data'],
  ['quiz', 'Quiz 4.1: Cellular Respiration', 'Due Oct 13', '17/20, 3 missed'],
  ['assignment', 'Lab: Yeast Fermentation', 'Due Oct 9', 'Your lab report'],
  ['material', 'Glycolysis and Krebs Cycle notes', 'Posted Oct 7', '4 pages'],
  ['material', 'Ch. 9 Cellular Respiration slides', 'Posted Oct 6', '38 slides'],
  ['material', 'Unit 4 Vocabulary', 'Posted Oct 6', '28 terms'],
];
const UNIT3 = [
  ['assignment', 'Unit 3 Test', 'Due Oct 2', ''],
  ['material', 'Cell Organelles slides', 'Posted Sep 22', ''],
  ['assignment', 'Lab: Membrane Transport', 'Due Sep 25', ''],
];
// after the doc lands: it holds, scrolls to its photosynthesis section, holds, scrolls to the quiz review, holds; the
// end card covers it 6.25 s after the generation ends, so the score's bars (anchored on that cover) put a downbeat 0.25 s
// after the doc lands (multicat-score.96834de7.js: the drums clear for the landing until the next downbeat)
const DOC = { scroll1: [0.9, 2.1], scroll2: [3.3, 4.5], cut: 6.25 - LAND };

// every time in the beat, from the reply r
function plan(r) {
  const card = r + 0.22;
  const reads = UNIT4.map((_, i) => card + BR.read0 + i * BR.step);
  const done = reads[reads.length - 1] + BR.step + 0.15; // the title reads "9 sources found"
  const r2 = done + 0.45, dcard = r2 + 0.22, gen0 = dcard + SEEN, fin = gen0 + GEN / X, w1 = fin + LAND;
  const cut = w1 + DOC.cut;
  return { r, card, found: card + BR.found, reads, done, r2, dcard, gen0, fin, w1, cut, end: cut + END_DELAY + END_LEN };
}
// the beat's length from its reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

// Material Symbols (Apache 2.0) the Classroom and Docs chrome draw, 24-unit paths
const SYM = {
  menu: 'M3 18v-2h18v2zm0-5v-2h18v2zm0-5V6h18v2z',
  apps: 'M6 8a2 2 0 1 1 0-4a2 2 0 0 1 0 4m6 0a2 2 0 1 1 0-4a2 2 0 0 1 0 4m6 0a2 2 0 1 1 0-4a2 2 0 0 1 0 4M6 14a2 2 0 1 1 0-4a2 2 0 0 1 0 4m6 0a2 2 0 1 1 0-4a2 2 0 0 1 0 4m6 0a2 2 0 1 1 0-4a2 2 0 0 1 0 4M6 20a2 2 0 1 1 0-4a2 2 0 0 1 0 4m6 0a2 2 0 1 1 0-4a2 2 0 0 1 0 4m6 0a2 2 0 1 1 0-4a2 2 0 0 1 0 4',
  home: 'M6 19h3v-6h6v6h3v-9l-6-4.5L6 10zm-2 2V9l8-6l8 6v12h-7v-6h-2v6zm8-8.75',
  calendar: 'M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V2h2v2h8V2h2v2h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22zm0-2h14V10H5zM5 8h14V6H5zm0 0V6z',
  school: 'm12 21l-7-3.8v-6L1 9l11-6l11 6v8h-2v-6.9l-2 1.1v6zm0-8.3L18.85 9L12 5.3L5.15 9zm0 6.025l5-2.7V12.25L12 15l-5-2.75v3.775zm0-3.775',
  todo: 'M5.55 19L2 15.45l1.4-1.4l2.125 2.125l4.25-4.25l1.4 1.425zm0-8L2 7.45l1.4-1.4l2.125 2.125l4.25-4.25l1.4 1.425zM13 17v-2h9v2zm0-8V7h9v2z',
  assignment: 'M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h4.2q.325-.9 1.088-1.45T12 1t1.713.55T14.8 3H19q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zm2-2h7v-2H7zm0-4h10v-2H7zm0-4h10V7H7zm5.538-4.962q.212-.213.212-.538t-.213-.537T12 2.75t-.537.213t-.213.537t.213.538t.537.212t.538-.213M5 19V5z',
  material: 'M7.5 22q-1.45 0-2.475-1.025T4 18.5v-13q0-1.45 1.025-2.475T7.5 2H20v15q-.625 0-1.062.438T18.5 18.5t.438 1.063T20 20v2zM6 15.325q.35-.175.725-.25T7.5 15H8V4h-.5q-.625 0-1.062.438T6 5.5zM10 15h8V4h-8zm-4 .325V4zM7.5 20h9.325q-.15-.35-.237-.712T16.5 18.5q0-.4.075-.775t.25-.725H7.5q-.65 0-1.075.438T6 18.5q0 .65.425 1.075T7.5 20',
  quiz: 'M14.738 14.688q.312-.313.312-.738t-.312-.737T14 12.9t-.737.313t-.313.737t.313.738T14 15t.738-.312M13.25 11.8h1.5q0-.725.15-1.062t.7-.888q.75-.75 1-1.212t.25-1.088q0-1.125-.788-1.837T14 5q-1.025 0-1.787.575T11.15 7.1l1.35.55q.225-.625.613-.937T14 6.4q.6 0 .975.338t.375.912q0 .35-.2.663t-.7.787q-.825.725-1.012 1.138T13.25 11.8M8 18q-.825 0-1.412-.587T6 16V4q0-.825.588-1.412T8 2h12q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18zm0-2h12V4H8zm-4 6q-.825 0-1.412-.587T2 20V6h2v14h14v2zM8 4v12z',
  yourwork: 'M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h4.2q.35-.9 1.1-1.45T12 1t1.7.55T14.8 3H19q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm7.538-16.963q.212-.212.212-.537t-.213-.537T12 2.75t-.537.213t-.213.537t.213.538t.537.212t.538-.213M5 17.85q1.35-1.325 3.138-2.087T12 15t3.863.763T19 17.85V5H5zm9.475-5.875Q15.5 10.95 15.5 9.5t-1.025-2.475T12 6T9.525 7.025T8.5 9.5t1.025 2.475T12 13t2.475-1.025M7 19h10v-.25q-1.05-.875-2.325-1.312T12 17t-2.675.438T7 18.75zm3.938-8.437Q10.5 10.125 10.5 9.5t.438-1.062T12 8t1.063.438T13.5 9.5t-.437 1.063T12 11t-1.062-.437m1.062.862',
  folder: 'M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h6l2 2h8q.825 0 1.413.588T22 8v10q0 .825-.587 1.413T20 20zm0-2h16V8h-8.825l-2-2H4zm0 0V6z',
  more: 'M12 20q-.825 0-1.412-.587T10 18t.588-1.412T12 16t1.413.588T14 18t-.587 1.413T12 20m0-6q-.825 0-1.412-.587T10 12t.588-1.412T12 10t1.413.588T14 12t-.587 1.413T12 14m0-6q-.825 0-1.412-.587T10 6t.588-1.412T12 4t1.413.588T14 6t-.587 1.413T12 8',
  check: 'm9.55 15.15l8.475-8.475q.3-.3.7-.3t.7.3t.3.713t-.3.712l-9.175 9.2q-.3.3-.7.3t-.7-.3L4.55 13q-.3-.3-.288-.712t.313-.713t.713-.3t.712.3z',
  chevron: 'M12.6 12L8 7.4L9.4 6l6 6l-6 6L8 16.6z',
  doc: 'M8 18h8v-2H8zm0-4h8v-2H8zm-2 8q-.825 0-1.412-.587T4 20V4q0-.825.588-1.412T6 2h8l6 6v12q0 .825-.587 1.413T18 22zm7-13V4H6v16h12V9zM6 4v5zv16z',
};
const sym = (name, cls = '') => `<svg class="gc-sym ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${SYM[name]}"/></svg>`;
const DL_GLYPH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>';
// the pointer the browse is driven with: the system arrow, black with a white keyline, its hotspot at (3, 2)
const POINTER = '<svg viewBox="0 0 22 26" aria-hidden="true"><path d="M3 2v18.5l4.6-4.4l3 6.9l3.2-1.4l-3-6.8h6.4z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  // the sheet declares the face (@font-face, so the Export button's renderer can inline it); a frozen capture (?t=) waits
  // for the sheet and then the face, like any tracked asset
  track(new Promise((done) => {
    sheet.onload = () => document.fonts.load('400 16px "Google Sans Flex"')
      .then((f) => { if (!f.length) console.error(new Error(`studyguide: Google Sans Flex did not load: ${FONT}`)); })
      .catch((e) => console.error(new Error(`studyguide: Google Sans Flex failed to load: ${FONT}`, { cause: e })))
      .then(done);
    sheet.onerror = () => { console.error(new Error(`studyguide variant stylesheet failed to load: ${CSS}`)); done(); };
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

// the streamed line a reply opens with: the visible prefix, the rest held in place transparent
function sayEl(x, text) {
  const n = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(text)}</span></div>`);
  let shown = -1;
  return { n, render(t, at) {
    const c = streamCount(text, at + 0.06, 70, t);
    if (c !== shown) { n.firstElementChild.textContent = text.slice(0, c); n.lastElementChild.textContent = text.slice(c); shown = c; }
  } };
}

// where n sits inside root, in root's untransformed px (offsets ignore the scale and scroll transforms)
function boxOf(n, root) {
  let x = 0, y = 0;
  for (let e = n; e && e !== root; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; }
  return { x, y, w: n.offsetWidth, h: n.offsetHeight };
}

// ---------- 1. Google Classroom ----------

const CLASSES = [
  { name: 'AP Biology', sec: 'Period 3', who: 'Ms. Rivera', c: 'green', due: 'Due Thursday', what: 'Unit 4 Review Packet' },
  { name: 'Precalculus', sec: 'Period 1', who: 'Mr. Okafor', c: 'blue', due: 'Due Monday', what: 'Section 6.3 Homework' },
  { name: 'English 11', sec: 'Period 5', who: 'Ms. Brooks', c: 'orange', due: 'Due Friday', what: 'Gatsby Ch. 5 Reflection' },
  { name: 'U.S. History', sec: 'Period 6', who: 'Mr. Chen', c: 'purple', due: '', what: '' },
  { name: 'Spanish III', sec: 'Period 2', who: 'Sra. Morales', c: 'teal', due: '', what: '' },
  { name: 'Chemistry Club', sec: 'Thursdays', who: 'Mr. Patel', c: 'pink', due: '', what: '' },
];
// a class header's illustration: soft shapes in the header's own colour, as Classroom's theme art sits behind the name
const DECO = '<svg class="gc-deco" viewBox="0 0 240 100" preserveAspectRatio="xMaxYMid slice" aria-hidden="true"><circle cx="205" cy="18" r="46" fill="#fff" fill-opacity=".1"/><circle cx="168" cy="92" r="30" fill="#fff" fill-opacity=".08"/><path d="M232 100c-26-6-40-26-34-52c22 4 38 24 34 52z" fill="#fff" fill-opacity=".12"/></svg>';
const BANNER = '<svg class="gc-deco" viewBox="0 0 720 150" preserveAspectRatio="xMaxYMid slice" aria-hidden="true"><circle cx="610" cy="40" r="92" fill="#fff" fill-opacity=".09"/><circle cx="470" cy="150" r="58" fill="#fff" fill-opacity=".07"/><g fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="3"><ellipse cx="612" cy="78" rx="62" ry="38"/><ellipse cx="600" cy="78" rx="26" ry="14"/><path d="M560 70q20-14 40 0t40 0"/></g><g fill="#fff" fill-opacity=".18"><path d="M690 150c-40-8-62-40-52-84c36 8 60 40 52 84z"/><path d="M520 30c-18 2-30-8-32-26c18-2 30 8 32 26z"/></g><g fill="#fff" fill-opacity=".35"><circle cx="560" cy="110" r="5"/><circle cx="660" cy="30" r="4"/><circle cx="520" cy="72" r="3"/></g></svg>';

const classCard = (c, i) => `<div class="gc-cc gc-${c.c}${i === 0 ? ' gc-cc-go' : ''}">
  <div class="gc-cc-h">${DECO}<b>${c.name}</b><small>${c.sec}</small><span>${c.who}</span></div>
  <i class="gc-cc-av">${c.who.split(' ').pop()[0]}</i>
  <div class="gc-cc-b">${c.due ? `<small>${c.due}</small><span>${c.what}</span>` : ''}</div>
  <div class="gc-cc-f">${sym('yourwork')}${sym('folder')}</div></div>`;

const workRow = ([kind, title, date, tag]) => `<div class="gc-it"><i class="gc-hl"></i><span class="gc-ic">${sym(kind)}</span><b>${title}</b><span class="gc-due">${date}</span>${tag ? `<span class="sg-tag gc-tag">${sym('check')}${tag}</span>` : ''}</div>`;

function buildClassroom(x, T) {
  const node = x.el(`<div class="bk sg-cr"><div class="bk-head"><b class="bk-title">Google Classroom<small class="sg-status"></small></b><a class="bk-btn bk-publish sg-open" href="${CLASS_URL}" target="_blank" rel="noopener noreferrer"><img src="${CLASSROOM}" alt="">Open in Classroom</a></div><div class="bk-view qc-skel"><div class="sg-zoom"><div class="gc" role="img" aria-label="Google Classroom: AP Biology, Period 3, its Stream and Classwork, read by superbot">
    <header class="gc-bar"><span class="gc-ib">${sym('menu')}</span><img class="gc-logo" src="${CLASSROOM}" alt=""><span class="gc-name">Classroom</span>
      <span class="gc-crumb">${sym('chevron')}<span><b>AP Biology</b><small>Period 3</small></span></span>
      <span class="gc-right"><span class="gc-ib">${sym('apps')}</span><i class="gc-me">S</i></span></header>
    <nav class="gc-rail"><span class="gc-ri gc-ri-home">${sym('home')}</span><span class="gc-ri">${sym('calendar')}</span><hr><span class="gc-ri">${sym('school')}</span><span class="gc-ri">${sym('todo')}</span><hr>${CLASSES.slice(0, 4).map((c, i) => `<span class="gc-ri gc-ra${i === 0 ? ' gc-ri-bio' : ''}"><i class="gc-${c.c}">${c.name[0]}</i></span>`).join('')}</nav>
    <div class="gc-tabs"><span class="gc-tab gc-tab-s">Stream</span><span class="gc-tab gc-tab-w">Classwork</span><span class="gc-tab">People</span><span class="gc-tab">Grades</span><i class="gc-ul"></i></div>
    <section class="gc-home"><h2>Classes</h2><div class="gc-grid">${CLASSES.map(classCard).join('')}</div></section>
    <section class="gc-stream"><div class="gc-ban">${BANNER}<b>AP Biology</b><small>Period 3</small></div>
      <div class="gc-sr"><div class="gc-up"><b>Upcoming</b><small>Due Thursday</small><span>11:59 PM: Unit 4 Review Packet</span><em>View all</em></div>
        <div class="gc-posts">
          <article class="gc-post gc-ann"><header><i class="gc-tch">R</i><span><b>Ms. Rivera</b><small>Oct 16</small></span>${sym('more')}</header>
            <p>Unit 4 Test is next Friday, Oct 23! It covers chapters 9 and 10 (cellular respiration and photosynthesis): 35 multiple choice and 2 free response. Go over your Quiz 4.1 corrections and finish the review packet in Classwork.</p>
            <footer><i class="gc-me">S</i><span>Add class comment</span></footer>
            <span class="sg-tag gc-found">${sym('check')}Test: Friday, Oct 23</span></article>
          <article class="gc-post gc-mini"><span class="gc-ic">${sym('material')}</span><span><b>Ms. Rivera posted a new material: Ch. 10 Photosynthesis slides</b><small>Oct 15</small></span></article>
          <article class="gc-post gc-mini"><span class="gc-ic">${sym('assignment')}</span><span><b>Ms. Rivera posted a new assignment: Photosynthesis Pigments Lab</b><small>Oct 14</small></span></article>
        </div></div></section>
    <section class="gc-work"><div class="gc-ws">
      <div class="gc-wtop"><span class="gc-yw">${sym('yourwork')}View your work</span><span class="gc-lk">${sym('calendar')}Google Calendar</span><span class="gc-lk">${sym('folder')}Class Drive folder</span></div>
      <div class="gc-topic"><h3>Unit 4: Cellular Energy</h3>${sym('more')}</div>${UNIT4.map(workRow).join('')}
      <div class="gc-topic gc-topic-3"><h3>Unit 3: Cell Structure and Function</h3>${sym('more')}</div>${UNIT3.map(workRow).join('')}
    </div></section>
    <i class="gc-ptr">${POINTER}</i>
  </div></div><i class="qc-sk"></i></div></div>`);
  const q = (s) => node.querySelector(s), qa = (s) => [...node.querySelectorAll(s)];
  const gc = q('.gc'), zoom = q('.sg-zoom'), sk = q('.qc-sk'), status = q('.sg-status');
  const home = q('.gc-home'), stream = q('.gc-stream'), work = q('.gc-work'), ws = q('.gc-ws');
  const tabs = q('.gc-tabs'), ul = q('.gc-ul'), tabS = q('.gc-tab-s'), tabW = q('.gc-tab-w'), crumb = q('.gc-crumb');
  const go = q('.gc-cc-go'), goTitle = go.querySelector('b'), riHome = q('.gc-ri-home'), riBio = q('.gc-ri-bio');
  const ann = q('.gc-ann'), found = q('.gc-found'), ptr = q('.gc-ptr');
  const rows = qa('.gc-it').slice(0, UNIT4.length), topic3 = q('.gc-topic-3');
  let said = null, tabSel = null;
  return { node, render(t) {
    const u = t - T.card;
    enter(node, t, T.card);
    // the page loads under the skeleton while superbot connects, then lands
    const lp = landing(t, T.card + BR.land);
    shimmer(sk, t, T.card, 0, lp);
    settle(zoom, lp);

    // the three pages: home until the class opens, its Stream, then Classwork. Each swap is a page load, not a dissolve:
    // the old page clears in 0.1 s, the new one comes up 0.15 s later, so the two never show through each other
    const page = (at) => [seg(u, at - 0.2, at - 0.1), seg(u, at - 0.1, at + 0.05)];
    const [outS, inS] = page(BR.stream), [outW, inW] = page(BR.classwork);
    fade(home, 1 - outS);
    fade(stream, inS * (1 - outW));
    fade(work, inW);
    tabs.style.opacity = crumb.style.opacity = inS.toFixed(3);
    riHome.classList.toggle('on', inS < 0.5);
    riBio.classList.toggle('on', inS >= 0.5);
    // the Classwork tab takes the class colour as it is clicked, before its page is up
    const sel = u >= BR.click2 + 0.02 ? tabW : tabS;
    if (sel !== tabSel) { tabS.classList.toggle('on', sel === tabS); tabW.classList.toggle('on', sel === tabW); tabSel = sel; }
    // the tab underline slides from Stream to Classwork as the click lands
    const bs = boxOf(tabS, tabs), bw = boxOf(tabW, tabs), m = inOutCubic(seg(u, BR.click2 + 0.02, BR.click2 + 0.3));
    ul.style.transform = `translateX(${lerp(bs.x, bw.x, m).toFixed(2)}px)`;
    ul.style.width = `${lerp(bs.w, bw.w, m).toFixed(2)}px`;

    // the pointer: in from the lower right, onto AP Biology's name, a press; onto the Classwork tab, a press; then away
    const g = boxOf(goTitle, gc), wt = boxOf(tabW, gc);
    const p0 = { x: 520, y: 470 }, p1 = { x: g.x + g.w * 0.45, y: g.y + g.h * 0.6 }, p2 = { x: wt.x + wt.w * 0.5, y: wt.y + wt.h * 0.62 };
    const a = inOutCubic(seg(u, BR.ptrIn, BR.click1 - 0.12)), b = inOutCubic(seg(u, BR.stream + 0.75, BR.click2 - 0.12));
    const px = lerp(lerp(p0.x, p1.x, a), p2.x, b), py = lerp(lerp(p0.y, p1.y, a), p2.y, b);
    const press = Math.max(seg(u, BR.click1 - 0.08, BR.click1) * (1 - seg(u, BR.click1, BR.click1 + 0.12)), seg(u, BR.click2 - 0.08, BR.click2) * (1 - seg(u, BR.click2, BR.click2 + 0.12)));
    ptr.style.transform = `translate(${(px - 3).toFixed(2)}px, ${(py - 2).toFixed(2)}px) scale(${(1 - 0.14 * press).toFixed(4)})`;
    ptr.style.opacity = (seg(u, BR.ptrIn - 0.15, BR.ptrIn + 0.1) * (1 - seg(u, BR.classwork + 0.15, BR.classwork + 0.45))).toFixed(3);
    // AP Biology's card lifts under the pointer (Classroom's hover) and dips on the press
    const hover = seg(u, BR.click1 - 0.3, BR.click1 - 0.15);
    go.classList.toggle('hover', hover > 0 && outS < 1);
    go.style.transform = press > 0 && u < BR.stream ? `scale(${(1 - 0.015 * press).toFixed(4)})` : 'none';

    // the Stream: the announcement that names the test is ringed and tagged
    const f = outCubic(seg(t, T.found, T.found + 0.3));
    ann.style.setProperty('--ring', f.toFixed(3));
    found.style.opacity = f.toFixed(3);
    found.style.transform = `translateY(${((1 - f) * 6).toFixed(2)}px) scale(${lerp(0.9, 1, f).toFixed(4)})`;

    // Classwork: each Unit 4 post flashes as it is read, then rests tinted, its tag replacing the date
    let n = 0;
    rows.forEach((row, i) => {
      const at = T.reads[i], h = seg(t, at, at + 0.12), rest = seg(t, at + 0.12, at + 0.5);
      if (t >= at) n++;
      row.style.setProperty('--hl', (h * lerp(1, 0.55, rest)).toFixed(3));
      row.style.setProperty('--tag', outCubic(seg(t, at + 0.05, at + 0.3)).toFixed(3));
    });
    // the list scrolls to keep the post being read in view, then on to show Unit 3, left unread
    const viewH = work.clientHeight, maxY = ws.scrollHeight - viewH;
    let y = 0;
    const want = (n2) => clamp(boxOf(n2, ws).y + n2.offsetHeight - viewH + 30, 0, maxY);
    rows.forEach((row, i) => { const at = T.reads[i] - 0.18; if (t > at) y = lerp(y, want(row), inOutCubic(seg(t, at, at + 0.3))); });
    const last = T.done - 0.3;
    if (t > last) y = lerp(y, clamp(boxOf(topic3, ws).y + 140 - viewH + 30, 0, maxY), inOutCubic(seg(t, last, last + 0.45)));
    ws.style.transform = `translateY(${(-y).toFixed(2)}px)`;

    // the frame's title says where the browse is
    const s = t < T.card + BR.stream ? 'Opening your classes' : t < T.found ? 'AP Biology, Period 3' : t < T.reads[0] ? 'Found your Unit 4 test'
      : t < T.done ? `Reading ${n} of ${UNIT4.length} posts` : `${UNIT4.length + 1} sources found`;
    if (s !== said) { status.textContent = s; said = s; }
  } };
}

// ---------- 2. the study guide, a Google Doc ----------

const chip = (icon, text) => `<span class="sgd-chip"><img src="${icon}" alt="">${text}</span>`;
const DOC_PAGES = [`
  <h1 class="sgd-t">${DOC_TITLE}</h1>
  <p class="sgd-sub">AP Biology, Period 3 (Ms. Rivera) | Test: Friday, Oct 23 | Chapters 9 and 10</p>
  <table class="sgd-call"><tr><td><b>What’s on the test:</b> 35 multiple choice and 2 free response questions on cellular respiration and photosynthesis. Ms. Rivera’s tip: go over your Quiz 4.1 corrections. ${chip(CLASSROOM, 'Announcement, Oct 16')}</td></tr></table>
  <h2>1. Cellular respiration (Ch. 9)</h2>
  <p class="sgd-eq">C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub> → 6CO<sub>2</sub> + 6H<sub>2</sub>O + ATP</p>
  <table class="sgd-tbl"><tr><th>Stage</th><th>Where</th><th>Makes (per glucose)</th></tr>
    <tr><td>Glycolysis</td><td>Cytoplasm</td><td>2 ATP (net), 2 NADH, 2 pyruvate</td></tr>
    <tr><td>Pyruvate oxidation</td><td>Mitochondrial matrix</td><td>2 NADH, 2 CO<sub>2</sub>, 2 acetyl CoA</td></tr>
    <tr><td>Krebs cycle</td><td>Mitochondrial matrix</td><td>2 ATP, 6 NADH, 2 FADH<sub>2</sub>, 4 CO<sub>2</sub></td></tr>
    <tr><td>Electron transport chain</td><td>Inner mitochondrial membrane</td><td>About 26 to 28 ATP; O<sub>2</sub> takes the electrons and becomes water</td></tr></table>
  <ul><li><b>Fermentation</b> (no O<sub>2</sub>) regenerates NAD<sup>+</sup> so glycolysis can keep making ATP: lactic acid in muscles, ethanol and CO<sub>2</sub> in yeast (your Yeast Fermentation lab).</li></ul>
  <p class="sgd-src">From ${chip(SLIDES, 'Ch. 9 Cellular Respiration slides')} ${chip(DOCS, 'Glycolysis and Krebs Cycle notes')}</p>
  <h2 class="sgd-photo">2. Photosynthesis (Ch. 10)</h2>
  <p class="sgd-eq">6CO<sub>2</sub> + 6H<sub>2</sub>O + light → C<sub>6</sub>H<sub>12</sub>O<sub>6</sub> + 6O<sub>2</sub></p>
  <ul><li><b>Light reactions</b> (thylakoid membranes): water is split and O<sub>2</sub> is released; photosystem II, then photosystem I, make ATP and NADPH.</li>
    <li><b>Calvin cycle</b> (stroma): rubisco fixes CO<sub>2</sub>, then ATP and NADPH turn it into G3P, the sugar the plant builds glucose from.</li>
    <li><b>Pigments</b>: chlorophyll a and b absorb red and blue light and reflect green (your Pigments Lab).</li></ul>
  <p class="sgd-src">From ${chip(SLIDES, 'Ch. 10 Photosynthesis slides')} ${chip(CLASSROOM, 'Photosynthesis Pigments Lab')}</p>`, `
  <h2 class="sgd-quiz">3. What you missed on Quiz 4.1 (17/20)</h2>
  <ol><li>Q6: Where does the electron transport chain happen? <b>The inner mitochondrial membrane.</b></li>
    <li>Q11: What is the final electron acceptor? <b>Oxygen, which forms water.</b></li>
    <li>Q14: Which stage makes most of the ATP? <b>Oxidative phosphorylation, through ATP synthase.</b></li></ol>
  <p class="sgd-src">From ${chip(CLASSROOM, 'Quiz 4.1: Cellular Respiration')}</p>
  <h2>4. Key vocabulary</h2>
  <table class="sgd-tbl sgd-voc"><tr><td><b>ATP synthase</b></td><td>Enzyme that makes ATP as H<sup>+</sup> ions flow back across the membrane</td></tr>
    <tr><td><b>Chemiosmosis</b></td><td>Making ATP from an H<sup>+</sup> gradient (respiration and photosynthesis both use it)</td></tr>
    <tr><td><b>NADH, FADH<sub>2</sub></b></td><td>Electron carriers that feed the electron transport chain</td></tr>
    <tr><td><b>Rubisco</b></td><td>Enzyme that fixes CO<sub>2</sub> in the Calvin cycle</td></tr></table>
  <h2>5. Practice questions</h2>
  <ol><li>Why does a cell make far less ATP without oxygen?</li>
    <li>A plant is kept in the dark for three days. What happens to the Calvin cycle, and why?</li>
    <li>Trace one carbon atom from CO<sub>2</sub> in the air to the CO<sub>2</sub> you breathe out.</li></ol>`];

function buildDoc(x, T) {
  const node = x.el(`<div class="bk sg-dc"><div class="bk-head"><b class="bk-title">${DOC_TITLE}<small>Google Doc · 2 pages</small></b>${shareBtn(DOC_TITLE)}${EXPAND}<a class="bk-btn bk-publish sg-open" href="${DOC_URL}" target="_blank" rel="noopener noreferrer"><img src="${DOCS}" alt="">Open in Docs</a></div><div class="bk-view qc-skel"><div class="sg-zoom sg-dz"><div class="sgd">
    <header class="sgd-bar"><img class="sgd-logo" src="${DOCS}" alt=""><span class="sgd-tt"><b>${DOC_TITLE}</b><span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Tools</span><span>Extensions</span><span>Help</span></span><span class="sgd-share">Share</span><i class="gc-me">S</i></header>
    <div class="sgd-tb"><span>100%</span><i></i><span>Normal text</span><i></i><span>Arial</span><i></i><span>11</span><i></i><b>B</b><em>I</em><u>U</u><span class="sgd-a">A</span></div>
    <div class="sgd-cv"><div class="sgd-sc">${DOC_PAGES.map((p) => `<div class="sgd-pg">${p}</div>`).join('')}</div></div>
  </div></div><i class="qc-sk"></i><span class="qc-genl sg-genl">Creating study guide<b class="qc-genn">${clock(0)}</b></span></div></div>`);
  const q = (s) => node.querySelector(s);
  const zoom = q('.sg-zoom'), sk = q('.qc-sk'), pill = q('.qc-genl'), num = q('.qc-genn');
  const cv = q('.sgd-cv'), sc = q('.sgd-sc'), photo = q('.sgd-photo'), quiz = q('.sgd-quiz');
  let shown = clock(0);
  return { node, render(t) {
    enter(node, t, T.dcard);
    const lp = landing(t, T.fin);
    shimmer(sk, t, T.dcard, 0, lp);
    settle(zoom, lp);
    // the pill counts the real seconds X times the clock's rate, rests on GEN, and fades as the doc lands
    const s = clock(t >= T.fin ? GEN : Math.max(0, t - T.gen0) * X);
    if (s !== shown) { num.textContent = s; shown = s; }
    fade(pill, 1 - seg(t, T.w1 - 0.25, T.w1));
    // the page scrolls to photosynthesis, then on past the page break to the quiz review
    const top = (h) => clamp(boxOf(h, sc).y - 40, 0, sc.scrollHeight - cv.clientHeight);
    const y = lerp(lerp(0, top(photo), inOutCubic(seg(t, T.w1 + DOC.scroll1[0], T.w1 + DOC.scroll1[1]))), top(quiz), inOutCubic(seg(t, T.w1 + DOC.scroll2[0], T.w1 + DOC.scroll2[1])));
    sc.style.transform = `translateY(${(-y).toFixed(2)}px)`;
    // how much the doc is generating now, which the frame's badge shows by
    return seg(t, T.gen0 - FF_IN, T.gen0) * (1 - seg(t, T.w1 - 0.25, T.w1));
  } };
}

// ---------- the beat ----------

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the beat keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheet();
    loadFrameSheet();
    const T = k.T;
    const say1 = sayEl(x, SAY1), say2 = sayEl(x, SAY2);
    const cr = buildClassroom(x, T), dc = buildDoc(x, T);
    // the feed glides to a zero-height anchor a little under each card instead of its bottom, so the newest card clears
    // the feed's clip with its edge and shadow (as multicat.516afb1a.css .mc-anchor)
    const anchor = () => x.el('<i class="sg-anchor" aria-hidden="true"></i>');
    const a1 = anchor(), a2 = anchor();
    // the end card and the x50 badge ride in nodes (so other variants hide them) and move to the scene section on the
    // first render, above the hub, as the multicat cut's do
    const endCard = x.el(`<div class="sg-end" role="img" aria-label="superbot.gg"><div class="sg-end-word"><b>superbot.gg</b></div><div class="sg-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.sg-end-word'), endBot = endCard.querySelector('.sg-end-bot');
    const ff = x.el(`<div class="sg-ff" aria-hidden="true">x${X}</div>`);
    let endK = 1, placed = false;
    // Space and Enter press the cards' controls, not the spot's clock (timeline.9b47fc30.js), as on the other beats
    for (const n of [cr.node, dc.node]) n.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('a, button')) e.stopPropagation(); });

    // v16 (the default on the Music pill, music.47e5d94a.js DEFAULTS): the multicat score rendered from this beat's cue
    // sheet. A glassy tick as each post is read, air as each page and card comes in, a sub hit as the test is found (the
    // score's `image`), a bell on "9 sources found" (`order`), the big landing on the doc (`model`); `play` is where the
    // multicat bed hands over to its song, here the end card's cover, so the groove builds straight into the sting; with no
    // song there is no play press either (`press: false`, as the Discord chain has)
    const v16 = makePlayer({
      typing: [{ text: k.askBy[ID], s: k.s, end: k.typeEnd }],
      sends: [k.send],
      camera: k.send, // the send drops the composer and pulls the camera out (tabs.9b47fc30.js)
      resolved: T.reads,
      cards: [T.card, T.card + BR.stream, T.card + BR.classwork, T.dcard],
      gens: [[T.gen0, T.fin]],
      image: T.found, model: T.fin, order: T.done, play: T.cut,
      cover: T.cut, pop: T.cut + END_DELAY, word: T.cut + END_DELAY + 0.3, end: T.end, press: false,
    }, ID);
    addEventListener('variantchange', () => v16.stop());

    return {
      nodes: [say1.n, cr.node, a1, say2.n, dc.node, a2, endCard, ff],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[T.r, say1.n], [T.card, a1], [T.r2, say2.n], [T.dcard, a2]],
      render(t) {
        if (!placed) {
          x.hub.closest('.scene').append(endCard, ff);
          placed = true;
        }
        say1.render(t, T.r);
        cr.render(t);
        x.appear(say2.n, t, T.r2);
        say2.render(t, T.r2);
        const g = dc.render(t);
        fade(ff, g);
        if (music() === 'v16') v16.sync(t); else v16.stop();

        // the end card: the chat fades to black, then the house card's own run (multicat.516afb1a.js)
        const cover = seg(t, T.cut, T.cut + END_IN);
        endCard.style.opacity = cover.toFixed(3);
        endCard.style.visibility = cover > 0 ? '' : 'hidden';
        if (cover > 0) {
          const tc = t - (T.cut + END_DELAY);
          const W = endCard.clientWidth, H = endCard.clientHeight;
          // the house sizes on a 1080-high stage, scaled down (--k) only when a narrow ratio would crop the lockup
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
    };
  },
};
