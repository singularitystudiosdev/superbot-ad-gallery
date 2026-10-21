// The two Roblox pages superbot works in, as real captures of the account owner's signed-in Chrome (img/CREDITS.txt):
// ROB IT's game page, and ROB IT's Thumbnails page in Creator Hub in each state the run passes through. Creator Hub's
// top bar (72px) and its left navigation (403px) stay put while its content column scrolls, so the spot draws the
// capture twice: whole, for the fixed parts, and clipped to the content column, shifted by the scroll.

export const TABS = [
  { host: 'roblox.com', path: '/games/96168869671905/ROB-IT', title: 'ROB IT | Play on Roblox', fav: 'img/roblox-fav.png' },
  { host: 'create.roblox.com', path: '/dashboard/creations/experiences/9472441390/places/96168869671905/thumbnails', title: '[🎃] 💎 ROB IT / Thumbnails', fav: 'img/creatorhub-fav.png' },
];
export const GAME = 'img/rbx/rbx-game.webp';
// the Thumbnails page per state: v view mode, e edit mode; 1..3 the day; L0 the table at its left edge, L1 scrolled to
// Qualified Play Through Rate; s just saved; n a new version uploaded; u the weakest one unticked
export const HUB = ['v1L0', 'v1L1', 'e1', 'e1n', 'e1u', 'v1s', 'v2L0', 'v2L1', 'e2', 'e2n', 'e2u', 'v2s', 'v3L0', 'v3L1'];
export const hubSrc = (state) => `img/rbx/ch-${state}.webp`;
export const HUB_TOP = 72, HUB_LEFT = 403, HUB_H = 1060; // the fixed bar's height, the left navigation's width, the capture's height
export const SCROLL = 220; // how far the content column scrolls to show every row

// points on the pages, in the page's own px (the page area starts 82px down the desktop, under Chrome's bar)
export const AT = {
  carousel: { x: 705, y: 250 },
  table: { x: 930, y: 700 },
  edit: { x: 535, y: 309 }, // Edit active thumbnails
  save: { x: 504, y: 309 }, // Save Changes
  upload: { x: 667, y: 309 }, // Upload thumbnails
  box: (row) => ({ x: 536, y: [652, 740, 830, 919, 1008][row] }), // a row's Active checkbox, edit mode
  rate: (row) => ({ x: 1150, y: [652, 740, 830, 919, 1008][row] }), // a row's play-through rate, the table scrolled right
};
