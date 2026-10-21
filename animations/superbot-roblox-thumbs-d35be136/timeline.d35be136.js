// The spot as data. The user asks superbot to keep iterating ROB IT's thumbnails; superbot runs round after round in
// the user's Chrome (real captures, img/CREDITS.txt): on the game page it pages the carousel to a random thumbnail,
// makes a novel perspective of it (Nano Banana 2.1), then in Creator Hub uploads it, reads the play-through rates,
// unchecks the lowest performer, checks the new take and saves. Pages change only where the real UI changes (a carousel
// arrow, a navigation, the edit view); scrolling moves the real stitched column. The chat shows only the winners; the
// news is the plain list of what it is doing. One pass is L seconds; main.d35be136.js loops it.

export const GAME = { title: 'ROB IT | Play on Roblox', url: 'roblox.com/games/96168869671905/ROB-IT' };
export const HUB = { title: 'Creator Dashboard', url: 'create.roblox.com/dashboard/creations/experiences/9472441390/places/96168869671905/thumbnails' };
const LINK = 'https://www.roblox.com/games/96168869671905/ROB-IT';

const TYPE_CPS = 45; // the user's typing in the composer
export const URL_CPS = 80; // superbot's typing in Chrome's address bar
export const STREAM_CPS = 70;

// a card's beats in the chat (chat.d35be136.js): its lead-in line streams, the card's room eases open, it waits a
// beat as a shimmering skeleton, the skeleton fades away, then the content fades in and settles
export const CARD = { open: 0.5, wait: 1.2, skOut: 0.2, land: 0.45 };
export function cardTimes(at, text) {
  const open = at + 0.08 + text.length / STREAM_CPS + 0.1;
  const loaded = open + CARD.open + CARD.wait;
  const land = loaded + CARD.skOut;
  return { open, loaded, land, shown: land + CARD.land };
}

// ---- the page geometry, read off the captures (page px; the edit view's column in content px) ----
export const COL = { x: 403, y: 72, w: 1309, h: 963, contentH: 2134, maxScroll: 1171 };
const ROW0 = 535.7, ROW_H = 89.3; // row 1's top in the column's content, and a row's height
export const rowTop = (k) => ROW0 + ROW_H * (k - 1); // row k, 1-based
export const ROW = { h: ROW_H, thumb: { x: 553.5, y: 16.3, w: 100, h: 56.5 }, box: { x: 475, y: 33.5, s: 22 } };
export const INACTIVE = { first: 6, rows: 5 }; // rows 6..10 are the unchecked uploads; new uploads land on row 6
const SCROLLED = 480; // the column scrolled so all ten rows show
const NEXT = { x: 970, y: 244 }, CAROUSEL = { x: 640, y: 236 }; // the carousel's Next arrow and its image
const EDIT_BTN = { x: 535, y: 309 }, UPLOAD = { x: 667, y: 309 }, SAVE = { x: 504, y: 309 };
const BACK = { x: 22, y: -20 }, FWD = { x: 54, y: -20 }; // Chrome's toolbar, above the page (page y < 0)
const RATE_X = 1388, BOX_X = 486; // the play-through rate text's right side, a checkbox's centre
const inView = (contentY, scroll) => COL.y + contentY - scroll; // a content y as page y at that scroll

export const TYPING = [];
export const CHAT = [];
export const NEWS = [];
export const PAGES = [{ at: -1, page: 'game-c0' }]; // each a cut, as the real page changes
export const SCROLLS = []; // the edit view's column: { t0, t1, from, to }
export const MOVES = []; // the screen's cursor, page px; 'omni' is the address bar
export const UPLOADS = []; // each new take: { at (lands on row 6), img, checkAt }
export const UNCHECKS = []; // { at, row }
export const NAV = []; // Chrome's back/forward state changes: { at, back?, fwd? }
export const TYPE_URL = {}; // round 1 types the Creator Hub address

const say = (at, text) => {
  const send = at + text.length / TYPE_CPS + 0.18;
  TYPING.push({ start: at, text, send, cps: TYPE_CPS });
  CHAT.push({ at: send, kind: 'user', text });
  return send;
};
const bot = (at, text, card) => { const c = { at, kind: 'bot', text, card }; CHAT.push(c); return c; };
const news = (at, title, breakthrough) => NEWS.push({ at, title, breakthrough: !!breakthrough });
const move = (t0, t1, to) => MOVES.push({ t0, t1, to });
const page = (at, p) => PAGES.push({ at, page: p });
const scroll = (t0, t1, from, to) => SCROLLS.push({ t0, t1, from, to });

// ---- the ask ----
const SENT = say(0.5, `This is my game ${LINK} continually make iterations on my existing thumbnails and replace my lowest performer`);
export const OPEN = SENT; // the side panel slides in as the message sends
export const TAKE = SENT + 0.5; // the vignette and the in-frame controls fade in: superbot has control
bot(SENT + 0.7, "On it. Every round I'll take a random thumbnail from ROB IT's page, make a new take on it, upload it and swap it in for your lowest performer.");

// one round in Creator Hub's edit view, from the Upload click: the new take lands on row 6, the column scrolls to the
// rates, the cursor reads the lowest, unchecks it, checks the new take, scrolls back up and saves
function swapRound(u, low, take) {
  move(u - 0.6, u - 0.1, UPLOAD);
  news(u, 'Uploading new thumbnail');
  const land = u + 0.8;
  scroll(land + 0.2, land + 0.9, 0, SCROLLED);
  const rateY = inView(rowTop(low.row) + 56, SCROLLED);
  move(land + 1.0, land + 1.6, { x: RATE_X, y: rateY });
  news(land + 1.7, `Replacing lowest performer, ${low.rate}`);
  move(land + 1.9, land + 2.3, { x: BOX_X, y: inView(rowTop(low.row) + 44.5, SCROLLED) });
  UNCHECKS.push({ at: land + 2.4, row: low.row });
  move(land + 2.6, land + 3.0, { x: BOX_X, y: inView(rowTop(INACTIVE.first) + 44.5, SCROLLED) });
  UPLOADS.push({ at: land, img: take, checkAt: land + 3.1 });
  scroll(land + 3.4, land + 4.0, SCROLLED, 0);
  move(land + 4.1, land + 4.6, SAVE);
  const saved = land + 4.7;
  const card = bot(saved + 0.3, `Winner, now live in place of the ${low.rate} thumbnail:`,
    { kind: 'live', img: take, title: 'Novel perspective of your thumbnail', sub: `Replaced the ${low.rate} thumbnail`, value: 'Live', label: 'winner', tone: 'good' });
  news(cardTimes(card.at, card.text).shown, `New thumbnail live, replacing ${low.rate}`);
  return cardTimes(card.at, card.text).shown;
}
// on the game page: page the carousel `clicks` times from item `from`, then take the image it lands on
function pickOnGame(s, from, clicks) {
  let at = s, item = from;
  if (clicks) move(at, at + 0.45, NEXT);
  for (let i = 0; i < clicks; i++) { at += i ? 0.4 : 0.55; item = (item + 1) % 5; page(at + 0.08, `game-c${item}`); }
  move(at + 0.2, at + 0.6, CAROUSEL);
  news(at + 0.7, 'Picked a random thumbnail from the game page');
  news(at + 1.1, 'Researching new methods for it');
  news(at + 1.7, 'Breakthrough: a novel perspective of it', true);
  return at + 0.6;
}

// ---- round 1: page the carousel from the trailer to thumbnail 4, type the Creator Hub address, open the edit view ----
const S1 = SENT + 1.8;
let t = pickOnGame(S1, 0, 4); // random pick: thumbnail 4 (img/CREDITS.txt)
move(t + 0.2, t + 0.65, 'omni');
TYPE_URL.click = t + 0.7; TYPE_URL.type = t + 0.85;
TYPE_URL.enter = TYPE_URL.type + HUB.url.length / URL_CPS + 0.15;
page(TYPE_URL.enter + 0.25, 'hub-view');
move(TYPE_URL.enter + 0.5, TYPE_URL.enter + 1.0, EDIT_BTN);
page(TYPE_URL.enter + 1.15, 'hub-edit');
const R1 = swapRound(TYPE_URL.enter + 1.9, { row: 4, rate: '0.81%' }, 'take1.webp');

// ---- round 2: back to the game page (the carousel still on thumbnail 4, the random pick again), forward to Creator
// Hub, swap out the next lowest ----
const S2 = R1 + 0.8;
move(S2, S2 + 0.4, BACK);
page(S2 + 0.55, 'game-c4'); NAV.push({ at: S2 + 0.55, fwd: true });
t = pickOnGame(S2 + 0.7, 4, 0);
move(t + 0.9, t + 1.3, FWD);
page(t + 1.45, 'hub-edit'); NAV.push({ at: t + 1.45, fwd: false });
const R2 = swapRound(t + 2.3, { row: 2, rate: '0.82%' }, 'take2.webp');

// ---- round 3: back, page the carousel round to thumbnail 2, forward, swap out the next lowest ----
const S3 = R2 + 0.8;
move(S3, S3 + 0.4, BACK);
page(S3 + 0.55, 'game-c4'); NAV.push({ at: S3 + 0.55, fwd: true });
t = pickOnGame(S3 + 0.7, 4, 3); // random pick: thumbnail 2
move(t + 0.9, t + 1.3, FWD);
page(t + 1.45, 'hub-edit'); NAV.push({ at: t + 1.45, fwd: false });
const R3 = swapRound(t + 2.3, { row: 5, rate: '0.83%' }, 'take3.webp');

const end = bot(R3 + 0.6, "Three new thumbnails live. I'll keep going: a fresh take every round, swapped in for whatever is lowest.");
NEWS.sort((a, b) => a.at - b.at);
PAGES.sort((a, b) => a.at - b.at);
export const L = end.at + 0.08 + end.text.length / STREAM_CPS + 3.5;
