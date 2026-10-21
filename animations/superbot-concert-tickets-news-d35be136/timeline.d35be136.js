// The spot as data: the four ticket sites (real captures of one show, img/CREDITS.txt), the agent's visits to them,
// what the user types and superbot answers, and the news it posts. One pass is L seconds; main.d35be136.js loops it,
// dipping to black where it comes round. Every price here is the one its capture shows.

// cursor targets are in page px, read off each 1470x839 capture
export const SITES = [
  { host: 'stubhub.com', name: 'StubHub', url: 'stubhub.com/gracie-abrams-denver-tickets-12-3-2026/event/161246896',
    title: 'Gracie Abrams', fav: 'fav-stubhub.png', page: 'stubhub', qty: { page: 'stubhub-qty', at: { x: 730, y: 519 } },
    price: { x: 1398, y: 190 }, seat: 'Sec 374, Row 11', cost: 42 },
  { host: 'seatgeek.com', name: 'SeatGeek', url: 'seatgeek.com/gracie-abrams-tickets/denver-colorado-ball-arena-2026-12-03-8-pm/concert/18270512',
    title: 'Gracie Abrams with Rachel Chinouriri', fav: 'fav-seatgeek.png', page: 'seatgeek', qty: { page: 'seatgeek-qty', at: { x: 734, y: 389 } },
    price: { x: 584, y: 230 }, seat: 'Sec 378, Row 15', cost: 40 },
  { host: 'vividseats.com', name: 'Vivid Seats', url: 'vividseats.com/gracie-abrams-tickets-denver-ball-arena-12-3-2026--concerts-alternative/production/7091517',
    title: 'Gracie Abrams Denver tickets - Ball Arena - 12/03/2026 | Vivid Seats', fav: 'fav-vividseats.png', page: 'vividseats', sort: { x: 452, y: 396 },
    price: { x: 452, y: 484 }, seat: 'Sec 374, Row 11', cost: 41 },
  { host: 'tickpick.com', name: 'TickPick', url: 'tickpick.com/buy-gracie-abrams-tickets-ball-arena-12-3-26-8pm/8002236',
    title: 'Gracie Abrams & Rachel Chinouriri Denver Tickets - Ball Arena, Dec 3 | TickPick', fav: 'fav-tickpick.png', page: 'tickpick', sort: { x: 92, y: 108 },
    price: { x: 612, y: 360 }, seat: 'Sec 374, Row 11', cost: 38 },
];
// the tab superbot opens on: Chrome's New Tab page (a real capture, from the computer-control-v3-soft variant)
export const NEW_TAB = { page: 'new-tab', title: 'New Tab' };

export const TAKE = 3.0; // the vignette and the pill fade in: superbot has control
const FIRST = 4.2; // the first visit starts
const VISIT_LEN = 5.5;
// the first pass, then the rechecks already under way when the loop comes round
const ORDER = [0, 1, 2, 3, 0, 1];
// one visit's beats: click the address bar, type the event's address, load, pick 2 tickets in the site's dialog (or
// check its sort), then rest the cursor on the cheapest listing and read it
export const VISITS = ORDER.map((i, n) => {
  const s = FIRST + n * VISIT_LEN;
  return { site: SITES[i], first: n < SITES.length, s, click: s + 0.5, type: s + 0.65, enter: s + 2.05, load: s + 2.3,
    toCtl: s + 2.55, atCtl: s + 3.05, pick: s + 3.15, toPrice: s + 3.45, atPrice: s + 4.05, read: s + 4.15 };
});
export const L = 36.5;

// the news: only what matters. StubHub flagging demand, and every new lowest price on the first pass; each new lowest
// is a hit, which superbot also posts in the chat as a price card
export const NEWS = [];
const HITS = [];
let low = Infinity;
for (const V of VISITS.filter((v) => v.first)) {
  const { site } = V;
  if (site.qty && site.name === 'StubHub') NEWS.push({ at: V.pick + 0.35, icon: 'flame', tone: 'hot', title: 'Selling fast on StubHub', sub: 'Its event page flags the Dec 3 show' });
  if (site.cost < low) {
    const saved = low === Infinity ? null : (low - site.cost) * 2;
    NEWS.push({ at: V.read, icon: 'down', tone: 'good', title: saved ? `New lowest: $${site.cost} on ${site.name}` : `Lowest so far: $${site.cost} on ${site.name}`,
      sub: saved ? `${site.seat}, $${saved} less for the pair` : `${site.seat}, fees included` });
    HITS.push({ at: V.read + 0.15, kind: 'bot', text: saved ? `New lowest, $${saved} less for the pair:` : 'Lowest so far:',
      card: { site, seat: site.seat.replace('Sec', 'Section'), price: site.cost } });
    low = site.cost;
  }
}

// the chat: what the user types into the composer and sends, and superbot's replies
const TYPE_CPS = 40;
export const TYPING = [];
export const CHAT = [];
const say = (at, text) => {
  const send = at + text.length / TYPE_CPS + 0.18;
  TYPING.push({ start: at, text, send, cps: TYPE_CPS });
  CHAT.push({ at: send, kind: 'user', text });
};
const best = SITES.reduce((a, b) => (b.cost < a.cost ? b : a));
const first = SITES[0];
const scanned = VISITS[SITES.length - 1].read;

say(0.5, 'Find me the cheapest 2 tickets for Gracie Abrams at Ball Arena on Dec 3');
CHAT.push({ at: 2.7, kind: 'chip', text: 'Taking control of your computer', done: 3.4 });
CHAT.push({ at: 3.6, kind: 'bot', text: "On it. I'm checking StubHub, SeatGeek, Vivid Seats and TickPick for 2 seats together. Anything important goes in News." });
CHAT.push(...HITS);
CHAT.push({ at: scanned + 1.4, kind: 'bot', text: `Checked all 4 sites. ${best.name} is the cheapest at $${best.cost} each, fees included, $${(first.cost - best.cost) * 2} less for the pair than ${first.name}. I'll keep rechecking every site for drops.` });
say(scanned + 4.2, 'Buy them if they drop under $35 each');
CHAT.push({ at: scanned + 6.4, kind: 'bot', text: "Deal. If 2 seats together drop under $35 each, I'll buy them and let you know." });
export const TITLE = { before: 'New chat', after: 'Gracie Abrams tickets' };
