// The four ticket sites the agent scans, rebuilt as event pages at Chrome's own size on a 1470px desktop (the page area
// under the tab strip and toolbar is 1470x837), plus the listings each round reads off them. Wordmarks and favicons are
// the sites' own files (img/CREDITS.txt); the event itself is invented, so no real artist is shown.
import { esc } from './lib.9d36de72.js?v=5';

export const EVENT = { artist: 'Velvet Static', tour: 'Afterglow Tour', date: 'Sat, Nov 14, 2026', time: '7:30 PM', venue: 'Ball Arena', city: 'Denver, CO' };

// cheapest pair of seats together, fees included, per round (a round past the list keeps the last)
export const SITES = [
  { id: 'stubhub', name: 'StubHub', host: 'stubhub.com', path: '/velvet-static-tickets', count: 186,
    sortBy: 'Sort by', sortDefault: 'Recommended', sortLow: 'Price low to high', sortOpts: ['Recommended', 'Price low to high', 'Price high to low', 'Best seats'],
    cheap: [{ p: 71, s: 318, r: 16 }, { p: 69, s: 318, r: 16 }, { p: 66, s: 320, r: 11 }] },
  { id: 'seatgeek', name: 'SeatGeek', host: 'seatgeek.com', path: '/velvet-static-tickets', count: 203,
    sortBy: 'Sort', sortDefault: 'Best deals', sortLow: 'Lowest price', sortOpts: ['Best deals', 'Lowest price', 'Highest price', 'Best seats'],
    cheap: [{ p: 58, s: 321, r: 12 }, { p: 58, s: 321, r: 12 }, { p: 55, s: 321, r: 12 }] },
  { id: 'ticketmaster', name: 'Ticketmaster', host: 'ticketmaster.com', path: '/velvet-static-tickets', count: 94,
    sortBy: 'Sort By', sortDefault: 'Best Seats', sortLow: 'Lowest Price', sortOpts: ['Best Seats', 'Lowest Price', 'Highest Price'],
    cheap: [{ p: 76, s: 305, r: 9 }, { p: 76, s: 305, r: 9 }] },
  { id: 'vividseats', name: 'Vivid Seats', host: 'vividseats.com', path: '/velvet-static-tickets', count: 158,
    sortBy: 'Sort by', sortDefault: 'Recommended', sortLow: 'Price: Low to High', sortOpts: ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Best Seats'],
    cheap: [{ p: 63, s: 316, r: 18 }, { p: 52, s: 312, r: 8 }] },
];

export const cheapest = (site, round) => site.cheap[Math.min(round, site.cheap.length - 1)];
export const fav = (id) => `img/${id}-fav.png`;

// the eleven dearer listings beside the cheapest: price steps above it, and the seats they sell
const STEPS = [3, 6, 9, 13, 17, 22, 29, 37, 48, 61, 79];
const POOL = [[322, 14], [309, 7], [318, 3], [324, 10], [303, 15], [311, 2], [114, 18], [106, 21], [315, 1], [102, 12], [110, 6]];
// the order a site's own default sort shows them in (index 0 is the cheapest, never on top)
const DEFAULT_ORDER = [8, 3, 11, 5, 1, 9, 0, 6, 10, 2, 7, 4];

export function listings(siteIndex, round, sorted) {
  const site = SITES[siteIndex];
  const c = cheapest(site, round);
  const rows = [{ s: c.s, r: c.r, p: c.p }];
  STEPS.forEach((step, k) => {
    const [s, r] = POOL[(k + siteIndex * 3) % POOL.length];
    rows.push({ s, r, p: c.p + step + ((k + siteIndex) % 3) });
  });
  return sorted ? rows : DEFAULT_ORDER.map((k) => rows[k]);
}

// ---------- seat map: a generic arena, stage at the top, floor, a lower and an upper ring of sections ----------
const CX = 320, CY = 268;
const rad = (d) => (d * Math.PI) / 180;
function sector(r0x, r0y, r1x, r1y, a0, a1) {
  const pts = [];
  for (let k = 0; k <= 6; k++) { const a = rad(a0 + ((a1 - a0) * k) / 6); pts.push([CX + r1x * Math.sin(a), CY - r1y * Math.cos(a)]); }
  for (let k = 6; k >= 0; k--) { const a = rad(a0 + ((a1 - a0) * k) / 6); pts.push([CX + r0x * Math.sin(a), CY - r0y * Math.cos(a)]); }
  return `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}Z`;
}
function ring(first, n, a0, a1, r0x, r0y, r1x, r1y) {
  const span = (a1 - a0) / n;
  let out = '';
  for (let k = 0; k < n; k++) {
    const s = first + k, b0 = a0 + k * span + 0.6, b1 = a0 + (k + 1) * span - 0.6, mid = rad((b0 + b1) / 2);
    const lx = CX + ((r0x + r1x) / 2) * Math.sin(mid), ly = CY - ((r0y + r1y) / 2) * Math.cos(mid);
    out += `<path class="st-sec" data-sec="${s}" d="${sector(r0x, r0y, r1x, r1y, b0, b1)}"/><text data-sec="${s}" x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}">${s}</text>`;
  }
  return out;
}
const MAP = `<svg class="st-map" viewBox="0 0 640 520" aria-hidden="true">
  <rect class="st-stage" x="258" y="80" width="124" height="40" rx="6"/><text class="st-stage-t" x="320" y="105">Stage</text>
  <rect class="st-floor" x="252" y="170" width="136" height="186" rx="8"/><text class="st-floor-t" x="320" y="268">Floor</text>
  ${ring(101, 16, 42, 318, 150, 122, 205, 168)}
  ${ring(301, 24, 30, 330, 214, 176, 282, 232)}
</svg>`;

// ---------- page markup ----------
const CHEV = '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';
const SEARCH = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
const HEAD = {
  stubhub: `<img class="st-logo" src="img/stubhub-logo.svg" width="96" height="44" alt="StubHub">
    <span class="st-search">${SEARCH}Search events, artists, teams and more</span>
    <nav><span>Explore</span><span>Sell</span><span>Favorites</span><span>My Tickets</span><span class="st-sign">Sign in</span></nav>`,
  seatgeek: `<img class="st-logo" src="img/seatgeek-logo.svg" width="62" height="44" alt="SeatGeek">
    <nav class="st-cats"><span>Sports</span><span>Music</span><span>More</span></nav>
    <span class="st-search">${SEARCH}Search by team, artist, event or venue</span>
    <nav><span>Sell</span><span class="st-sign">Log in</span></nav>`,
  ticketmaster: `<img class="st-logo" src="img/ticketmaster-logo.svg" width="168" height="24" alt="Ticketmaster">
    <nav class="st-cats"><span>Concerts</span><span>Sports</span><span>Arts, Theater &amp; Comedy</span><span>Family</span></nav>
    <nav><span class="st-sign">Sign In/Register</span></nav>`,
  vividseats: `<img class="st-logo" src="img/vividseats-logo.png" width="140" height="32" alt="Vivid Seats">
    <span class="st-search">${SEARCH}Search for events, performers, teams or venues</span>
    <nav><span>Sports</span><span>Concerts</span><span>Theater</span><span class="st-sign">Sign In</span></nav>`,
};

export function pageHTML(i) {
  const site = SITES[i];
  const opts = site.sortOpts.map((o, k) => `<span class="st-opt${k === 1 ? ' st-opt-low' : ''}">${esc(o)}</span>`).join('');
  return `<div class="st st-${site.id}" data-site="${i}">
    <header class="st-head">${HEAD[site.id]}</header>
    <section class="st-event">
      <div class="st-ev-t"><h1>${esc(EVENT.artist)}</h1><span class="st-tour">${esc(EVENT.tour)}</span></div>
      <div class="st-ev-m"><span>${esc(EVENT.date)}</span><span>${esc(EVENT.time)}</span><span>${esc(EVENT.venue)}, ${esc(EVENT.city)}</span></div>
    </section>
    <div class="st-body">
      <div class="st-col">
        <div class="st-tools">
          <span class="st-chip st-qty">2 tickets${CHEV}</span>
          <span class="st-chip st-fees"><i class="st-tog"></i>Prices include fees</span>
          <span class="st-sort"><small>${esc(site.sortBy)}</small><b class="st-sort-v">${esc(site.sortDefault)}</b>${CHEV}</span>
        </div>
        <div class="st-count"><b>${site.count}</b> listings for 2 seats together</div>
        <div class="st-listwrap"><div class="st-list"></div></div>
        <div class="st-menu">${opts}</div>
      </div>
      <div class="st-mapwrap">${MAP}</div>
    </div>
  </div>`;
}

// one listing row; k is its rank on the cheapest-first list, for the badges a site hands its best deals
function badge(id, k) {
  if (id === 'stubhub') return k <= 1 ? '<span class="st-badge">Great price</span>' : '';
  if (id === 'seatgeek') { const score = (10 - k * 0.7).toFixed(1); return `<span class="st-deal st-deal-${k <= 2 ? 'a' : k <= 6 ? 'b' : 'c'}">${score}</span>`; }
  if (id === 'ticketmaster') return '<span class="st-badge">Verified Resale Ticket</span>';
  return k <= 2 ? '<span class="st-badge">Great deal</span>' : '';
}
export function rowsHTML(i, round, sorted) {
  const site = SITES[i];
  const rows = listings(i, round, sorted);
  const ranked = [...rows].sort((a, b) => a.p - b.p);
  return rows.map((row) => {
    const k = ranked.indexOf(row);
    return `<div class="st-row" data-sec="${row.s}">
      ${site.id === 'seatgeek' ? badge(site.id, k) : ''}
      <div class="st-seat"><b>Section ${row.s}</b><span>Row ${row.r}</span><small>2 tickets together</small></div>
      ${site.id === 'seatgeek' ? '' : badge(site.id, k)}
      <div class="st-price"><b>$${row.p}</b><small>${site.id === 'seatgeek' ? 'each, incl. fees' : 'incl. fees'}</small></div>
    </div>`;
  }).join('');
}
