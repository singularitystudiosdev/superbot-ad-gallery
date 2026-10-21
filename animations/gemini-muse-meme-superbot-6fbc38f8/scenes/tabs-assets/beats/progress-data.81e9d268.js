// The computer-control progress cuts' scripts (beats/progress.81e9d268.js draws them). Each one is the
// computer-control-v3-soft cut carried on past the new tab: superbot types a search into Chrome's omnibox, opens a video
// from the results and plays it, while the frame shows a progress bar and, at its top right, the task it is on. Mid-run
// the user types two follow-ups into the composer, one changing the work and one asking how it is going, and superbot
// answers each in the thread; a change re-plans the task list behind the bar. Per cut: the ask, superbot's first line,
// the searches, the order the results come back in, the cursor's path, the follow-ups and the plans. All moments from
// the reply (r), on the v3-soft cut's own clock up to the new tab (computer.ba3976b6.js times), so a frozen frame (?t=)
// holds. Desk px throughout (the 1470x919 desktop, computer.ba3976b6.css .cc3-desk).

export const QUERY_CPS = 17;   // superbot types into the omnibox at this rate
const FOLLOW_CPS = 21;         // the user types a follow-up into the composer at this rate
const SEND_GAP = 0.15;         // a follow-up is sent this long after its last key, as the engine sends the ask
const ANSWER = 0.45;           // superbot answers a follow-up this long after it is sent
export const REPLAN = 0.6;     // a new plan's progress eases over from the old one's in this long
export const SPRITE = { src: 'hacker.7dfcf32a/cat-laser-sprite.jpg?v=2', cols: 10, n: 105, fps: 24, w: 640, h: 360 };

// the results' videos: the hacker cut's generated cats (img/hacker.7dfcf32a/CREDITS.txt), its made-up titles and counts.
// The laser kitten is the one with a clip (SPRITE), so every cut ends up playing it
export const CATS = {
  laser: { img: 'cat-laser.jpg', title: 'Kitten vs. the laser dot', meta: '1.2M views · 3 days ago', dur: '0:42', len: 42, alt: 'A grey-and-white kitten pouncing at a red laser dot' },
  mug: { img: 'cat-mug.jpg', title: 'This cat knocks everything off the table', meta: '860K views · 1 week ago', dur: '1:08', alt: 'A tuxedo cat pushing a mug off a table' },
  box: { img: 'cat-box.jpg', title: 'If it fits, he sits', meta: '2.4M views · 2 weeks ago', dur: '0:57', alt: 'An orange cat squeezed into a small box' },
  sun: { img: 'cat-sun.jpg', title: 'Sleepiest cat ever', meta: '540K views · 5 days ago', dur: '2:14', alt: 'A calico cat asleep in a sunbeam' },
  bubbles: { img: 'cat-bubbles.jpg', title: 'Cat discovers bubbles', meta: '3.1M views · 1 month ago', dur: '0:36', alt: 'A tabby batting at soap bubbles' },
  kittens: { img: 'cat-kittens.jpg', title: 'Two kittens, one blanket', meta: '970K views · 4 days ago', dur: '1:21', alt: 'Two kittens play-wrestling on a blanket' },
};
export const PLAYED = CATS.laser;
export const UP_NEXT = ['kittens', 'box', 'bubbles', 'mug'];

// the results grid, in the page's px (the page starts 82px down the desk, under the tab strip and toolbar)
export const GRID = { x0: 43, y0: 88, w: 440, h: 248, gx: 32, row: 346 };
export const PAGE_TOP = 82;
// the player on the watch page, in desk px, and full screen: 16:9 across the whole desk, centred
export const PLAYER = { x: 43, y: 106, w: 960, h: 540 };
export const FULL = { x: 0, y: (919 - 1470 * 9 / 16) / 2, w: 1470 };
// the cursor's stops: its rest on superbot.gg (computer.ba3976b6.js REST), Chrome's new-tab button (the first tab's
// right edge plus the button's margin and half its size: 88 + 240 + 8 + 14, and its centre 25px down the strip), the
// omnibox's text, out of the video's way, and the player's full screen button
const REST = { x: 1010, y: 640 };
export const PLUS = { x: 350, y: 25 };
const OMNI = { x: 300, y: 62 };
const AWAY = { x: 1250, y: 770 };
const FS_BTN = { x: PLAYER.x + PLAYER.w - 28, y: PLAYER.y + PLAYER.h - 26 };
// a result's thumbnail centre on the desk
export const thumbAt = (i) => ({ x: GRID.x0 + (i % 3) * (GRID.w + GRID.gx) + GRID.w / 2, y: PAGE_TOP + GRID.y0 + Math.floor(i / 3) * GRID.row + GRID.h / 2 });

// the v3-soft cut's moments: the card, the takeover, the glide to the new-tab button, its click and the new tab
const base = (r) => ({ r, card: r + 0.22, take: r + 0.62, ptr: r + 1.0, hov: r + 1.75, click: r + 1.9, open: r + 1.98 });
// a follow-up: typed into the composer from s, sent, and answered (`say`) at r
const ask = (text, s, say) => { const typeEnd = s + text.length / FOLLOW_CPS, send = typeEnd + SEND_GAP; return { text, s, typeEnd, send, r: send + ANSWER, say }; };
// a search: typed into the omnibox from type0, Enter at enter, the results in `order`
const search = (q, type0, order) => { const type1 = type0 + q.length / QUERY_CPS; return { q, type0, type1, enter: type1 + 0.18, order }; };
// where an eased glide (lib.9b47fc30.js path: inOutCubic between keys) has got to by t
const along = (t, a, b) => { const f = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))); const e = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2; return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e }; };
const tab = (T) => ({ label: 'Opening a new tab', a: T.take, b: T.open + 0.3 });
const looking = (T, s) => ({ label: `Searching “${s.q}”`, a: T.open + 0.3, b: s.enter + 0.5 });

// a: the line and the task chip. The user swaps cats for kittens just as superbot reaches the top video, so it goes
// back to the omnibox and searches again; then they ask how far along it is
function planA(r) {
  const T = base(r);
  const s1 = search('funny cat videos', T.open + 0.45, ['mug', 'box', 'bubbles', 'sun', 'laser', 'kittens']);
  const m1 = ask('actually, make it kittens', s1.enter + 0.1, 'Got it. Switching the search to kittens.');
  const refocus = m1.r + 0.9; // the click back into the omnibox, which selects the old query whole
  const s2 = search('funny kitten videos', refocus + 0.4, ['laser', 'kittens', 'bubbles', 'box', 'mug', 'sun']);
  const m2 = ask('how far along are you?', s2.enter + 0.2, 'Step 4 of 5. Opening the top kitten video now.');
  const click = m2.r + 0.6, play = click + 0.35;
  const go = { t: s1.enter + 0.7, ...PLUS }, top = { t: s1.enter + 2.1, ...thumbAt(0) }, cut = { t: m1.r + 0.05, ...along(m1.r + 0.05, go, top) };
  Object.assign(T, {
    look: 'line', say: 'On it. I’m taking control of your computer now.', searches: [s1, s2], refocus: [refocus], msgs: [m1, m2],
    pick: { grid: 1, i: 0, click }, play, end: play + 3.4, done: 'Done. Your kitten video is playing',
    cursor: [{ t: T.ptr, ...REST }, { t: T.hov, ...PLUS }, go, cut, { t: refocus - 0.05, ...OMNI }, { t: s2.enter + 0.9, ...OMNI }, { t: s2.enter + 1.9, ...thumbAt(0) }, { t: click + 0.25, ...thumbAt(0) }, { t: click + 0.85, ...AWAY }],
    plans: [
      { at: -Infinity, steps: [tab(T), looking(T, s1), { label: 'Opening the top video', a: s1.enter + 0.5, b: s1.enter + 2.6 }, { label: 'Playing it', a: s1.enter + 2.6, b: s1.enter + 3.2 }] },
      { at: m1.r, steps: [tab(T), looking(T, s1), { label: `Searching “${s2.q}”`, a: m1.r, b: s2.enter + 0.5 }, { label: 'Opening the top kitten video', a: s2.enter + 0.5, b: click + 0.1 }, { label: 'Playing it', a: click + 0.1, b: play + 0.7 }] },
    ],
  });
  return T;
}

// b: the step card. The user asks how it is going while superbot searches, then, with the cursor on its way to the most
// viewed video, asks for the newest one instead: the cursor turns for it mid-glide
function planB(r) {
  const T = base(r);
  const m1 = ask('how’s it going?', T.open - 0.35, 'Step 2 of 4. Searching for cat videos now.');
  const s1 = search('cat videos', T.open + 0.45, ['mug', 'box', 'laser', 'sun', 'bubbles', 'kittens']);
  const m2 = ask('wait, play the newest one', s1.enter + 0.35, 'Switching to the newest one, from 3 days ago.');
  const turn = m2.r + 0.05, click = m2.r + 1.05, play = click + 0.35;
  const go = { t: s1.enter + 0.8, ...PLUS }, most = { t: s1.enter + 2.4, ...thumbAt(4) }, cut = { t: turn, ...along(turn, go, most) };
  Object.assign(T, {
    look: 'card', say: 'On it. Taking control of your computer.', searches: [s1], refocus: [], msgs: [m1, m2],
    pick: { grid: 0, i: 2, click }, play, end: play + 3.6, done: 'Done. Newest video playing',
    cursor: [{ t: T.ptr, ...REST }, { t: T.hov, ...PLUS }, go, cut, { t: turn + 0.8, ...thumbAt(2) }, { t: click + 0.25, ...thumbAt(2) }, { t: click + 0.85, ...AWAY }],
    plans: [
      { at: -Infinity, steps: [tab(T), looking(T, s1), { label: 'Opening the most viewed video', a: s1.enter + 0.5, b: s1.enter + 2.6 }, { label: 'Playing it', a: s1.enter + 2.6, b: s1.enter + 3.2 }] },
      { at: m2.r, steps: [tab(T), looking(T, s1), { label: 'Opening the newest video', a: m2.r, b: click + 0.1 }, { label: 'Playing it', a: click + 0.1, b: play + 0.7 }] },
    ],
  });
  return T;
}

// c: the progress pill and the Now chip. While superbot searches, the user adds a step (full screen once it plays);
// once it plays they ask how much longer, and superbot clicks the player's full screen button
function planC(r) {
  const T = base(r);
  const s1 = search('funny cat videos', T.open + 0.45, ['laser', 'mug', 'box', 'sun', 'bubbles', 'kittens']);
  const m1 = ask('and make it full screen when it plays', T.open + 0.55, 'Will do. I added a full screen step.');
  const click = m1.r + 0.45, play = click + 0.35;
  const m2 = ask('how much longer?', play + 0.1, 'Last step. Going full screen now.');
  const fs = { click: m2.r + 0.4, on: m2.r + 0.45 };
  Object.assign(T, {
    look: 'pill', say: 'Sure. Taking control of your computer now.', searches: [s1], refocus: [], msgs: [m1, m2],
    pick: { grid: 0, i: 0, click }, play, fs, cursorOut: fs.on + 0.7, end: play + 4.5, done: 'Done. Playing in full screen',
    cursor: [{ t: T.ptr, ...REST }, { t: T.hov, ...PLUS }, { t: s1.enter + 0.6, ...PLUS }, { t: s1.enter + 1.5, ...thumbAt(0) }, { t: click + 0.25, ...thumbAt(0) }, { t: click + 0.85, ...AWAY }, { t: play + 0.9, ...AWAY }, { t: fs.click - 0.15, ...FS_BTN }],
    plans: [
      { at: -Infinity, steps: [tab(T), looking(T, s1), { label: 'Opening the top video', a: s1.enter + 0.5, b: click + 0.1 }, { label: 'Playing it', a: click + 0.1, b: play + 0.5 }] },
      { at: m1.r, steps: [tab(T), looking(T, s1), { label: 'Opening the top video', a: s1.enter + 0.5, b: click + 0.1 }, { label: 'Playing it', a: click + 0.1, b: play + 0.5 }, { label: 'Going full screen', a: play + 0.5, b: fs.on + 0.45 }] },
    ],
  });
  return T;
}

export const SCRIPTS = { a: planA, b: planB, c: planC };
// each cut's run past its reply: the route's `extra` is this less the base beat's (chat.9b47fc30.js)
export const LEN = { a: planA(0).end, b: planB(0).end, c: planC(0).end };
