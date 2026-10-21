// The spot as data: the user's ask, what superbot does in the user's Chrome (real captures of ROB IT's game page and
// its Creator Hub Thumbnails page, img/CREDITS.txt), its replies and cards in the chat, and the news it posts. One pass
// is L seconds; main.d35be136.js loops it, dipping to black where it comes round. Every figure on screen is the one
// Creator Hub showed on Oct 21, 2026.

// what the browser shows, in order: a page change at `at`, crossfading over `fade` seconds (a scroll), or cutting
// (a navigation). Pages are 1470x839 captures under Chrome's 82px of tab strip and toolbar
export const GAME = { page: 'game', title: 'ROB IT | Play on Roblox', url: 'roblox.com/games/96168869671905/ROB-IT' };
export const HUB = { title: 'Creator Dashboard', url: 'create.roblox.com/dashboard/creations/experiences/9472441390/places/96168869671905/thumbnails' };

const TYPE_CPS = 40; // the user's typing in the composer
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

export const TYPING = [];
export const CHAT = [];
const say = (at, text) => {
  const send = at + text.length / TYPE_CPS + 0.18;
  TYPING.push({ start: at, text, send, cps: TYPE_CPS });
  CHAT.push({ at: send, kind: 'user', text });
  return send;
};
const bot = (at, text, card) => { const c = { at, kind: 'bot', text, card }; CHAT.push(c); return c; };

// ---- the run ----
const SENT = say(0.5, 'This is my game, continually make iterations on my existing thumbnails and replace my lowest performer');
export const OPEN = SENT; // the side panel slides in as the message sends
export const TAKE = SENT + 0.5; // the vignette and the in-frame controls fade in: superbot has control
bot(SENT + 0.7, "On it. I'll read ROB IT's thumbnail performance in Creator Hub, make new takes on your thumbnails and swap one in for the lowest performer.");

// Chrome: from the game page to the Thumbnails page, read the table, scroll to the rates
const S1 = SENT + 1.7;
export const NAV = { s: S1, click: S1 + 0.5, type: S1 + 0.65 };
NAV.enter = NAV.type + HUB.url.length / URL_CPS + 0.15;
NAV.load = NAV.enter + 0.25;
const toTable = NAV.load + 0.9, toRate = toTable + 1.2, read = toRate + 0.9;

// the edit: back up, Edit active thumbnails, Upload thumbnails, the new take lands in the table, uncheck the lowest,
// check the new one, back up, Save Changes
const E = read + 4.6;
export const EDIT = {
  up: E, editClick: E + 0.95, edit: E + 1.05, uploadClick: E + 1.85, down: E + 2.55, landed: E + 3.0,
  uncheck: E + 3.75, check: E + 4.55, up2: E + 5.0, saveClick: E + 5.85,
};

export const PAGES = [
  { at: -1, page: 'game', fade: 0 },
  { at: NAV.load, page: 'thumbs-top', fade: 0 },
  { at: toTable, page: 'thumbs-table', fade: 0.35 },
  { at: toRate, page: 'thumbs-rate', fade: 0.3 },
  { at: EDIT.up, page: 'thumbs-top', fade: 0.35 },
  { at: EDIT.edit, page: 'edit-top', fade: 0 },
  { at: EDIT.down, page: 'edit-table', fade: 0.35 },
  { at: EDIT.up2, page: 'edit-top', fade: 0.35 },
];

// the screen's cursor glides (page px, before Chrome's 82px are added; `omni` is the address bar)
export const MOVES = [
  { t0: NAV.s, t1: NAV.s + 0.45, to: 'omni' },
  { t0: toTable - 0.55, t1: toTable - 0.1, to: { x: 980, y: 520 } },
  { t0: toRate + 0.25, t1: read - 0.05, to: { x: 1204, y: 316 } }, // just under row 1's Qualified Play Through Rate, 0.63%
  { t0: EDIT.up + 0.1, t1: EDIT.editClick - 0.1, to: { x: 529, y: 306 } }, // Edit active thumbnails
  { t0: EDIT.editClick + 0.25, t1: EDIT.uploadClick - 0.1, to: { x: 666, y: 309 } }, // Upload thumbnails
  { t0: EDIT.landed + 0.1, t1: EDIT.uncheck - 0.1, to: { x: 536, y: 305 } }, // row 1's checkbox
  { t0: EDIT.uncheck + 0.15, t1: EDIT.check - 0.1, to: { x: 536, y: 751 } }, // the new take's checkbox
  { t0: EDIT.up2 + 0.2, t1: EDIT.saveClick - 0.1, to: { x: 503, y: 309 } }, // Save Changes
];

// what the agent changes on the edit view's table: the new take lands in row 6's thumbnail, row 1 unchecks, row 6
// checks (real checkbox pixels from the same capture, img/cb-*.png), boxes in page px
export const MARKS = [
  { at: EDIT.landed, img: 'it1.webp', box: { x: 652, y: 723, w: 100, h: 56.5 }, radius: 4 },
  { at: EDIT.uncheck, img: 'cb-off.png', box: { x: 525, y: 294.5, w: 22, h: 22 } },
  { at: EDIT.check, img: 'cb-on.png', box: { x: 525, y: 740.5, w: 22, h: 22 } },
];

// the chat's cards and the news. A card's news line waits until the card has loaded; the swap is the hit, with
// confetti
export const NEWS = [];
const stat = bot(read + 0.15, 'Your lowest performer right now:', { kind: 'stat', img: 'row-lowest.webp', title: 'Thumbnail 1, Home Page', sub: '129,560 impressions, 810 qualified plays', value: '0.63%', label: 'play-through', tone: 'low' });
NEWS.push({ at: cardTimes(stat.at, stat.text).shown, title: 'Lowest performer: 0.63% play-through' });
const trio = bot(read + 2.6, 'Made 3 new takes on your thumbnails:', { kind: 'trio', imgs: ['it1.webp', 'it2.webp', 'it3.webp'] });
NEWS.push({ at: cardTimes(trio.at, trio.text).shown, title: '3 new takes on your thumbnails' });
const live = bot(EDIT.saveClick + 0.35, 'Swapped this one in for the 0.63% thumbnail:', { kind: 'live', img: 'it1.webp', title: 'Steal the Diamond', sub: 'Active on the Home Page', value: 'Live', label: 'saved', tone: 'good' });
NEWS.push({ at: cardTimes(live.at, live.text).shown, title: 'New take live, replacing the 0.63% thumbnail', burst: true });
const end = bot(cardTimes(live.at, live.text).shown + 0.6, "Done. Creator Hub suggests 7 days between tests, so I'll check again on Oct 28 and swap the next lowest for a new take.");
NEWS.push({ at: end.at + 1.3, title: 'Next check: Oct 28, after 7 days of data' });
NEWS.sort((a, b) => a.at - b.at);

export const L = end.at + 5.5;
