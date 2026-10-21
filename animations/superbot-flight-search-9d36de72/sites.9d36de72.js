// The four flight search sites the agent scans, rebuilt as results pages at Chrome's own size on a 1470px desktop (the
// page area under the tab strip and toolbar is 1470x837), plus the fares each round reads off them. Wordmarks, site
// favicons and airline marks are the companies' own files (img/CREDITS.txt); flights, times and fares are invented.
import { esc } from './lib.9d36de72.js?v=7';

export const TRIP = { from: 'Denver (DEN)', to: 'New York (NYC)', date: 'Fri, Dec 18', who: '1 adult, Economy' };
export const AIR = { united: 'United', frontier: 'Frontier', delta: 'Delta', jetblue: 'JetBlue', american: 'American' };

// every nonstop the pages list: airline, departure in minutes after midnight (Denver time), block time, arrival airport
const FLIGHTS = [
  { air: 'frontier', dep: 360, dur: 227, to: 'LGA' }, { air: 'united', dep: 435, dur: 232, to: 'EWR' },
  { air: 'delta', dep: 520, dur: 236, to: 'JFK' }, { air: 'jetblue', dep: 545, dur: 229, to: 'JFK' },
  { air: 'american', dep: 630, dur: 238, to: 'LGA' }, { air: 'united', dep: 715, dur: 231, to: 'LGA' },
  { air: 'frontier', dep: 800, dur: 226, to: 'LGA' }, { air: 'delta', dep: 945, dur: 235, to: 'LGA' },
  { air: 'jetblue', dep: 1030, dur: 230, to: 'JFK' }, { air: 'united', dep: 1170, dur: 228, to: 'EWR' },
  { air: 'american', dep: 1290, dur: 233, to: 'JFK' }, { air: 'delta', dep: 400, dur: 237, to: 'JFK' },
];

// the cheapest nonstop each site lists, per round (a round past the list keeps the last); f indexes FLIGHTS
export const SITES = [
  { id: 'googleflights', name: 'Google Flights', host: 'google.com', path: '/travel/flights', open: 'Google Flights', count: 38,
    tab: 'Denver to New York | Google Flights', logo: 'google-logo.svg', sortBy: 'Sort by', sortDefault: 'Top flights', sortLow: 'Price',
    sortOpts: ['Top flights', 'Price', 'Departure time', 'Duration'], cheap: [{ f: 1, p: 142 }, { f: 1, p: 139 }, { f: 1, p: 136 }] },
  { id: 'kayak', name: 'Kayak', host: 'kayak.com', path: '/flights/DEN-NYC/2026-12-18', open: 'kayak.com', count: 41,
    tab: 'DEN to NYC, Fri 12/18 | KAYAK', logo: 'kayak-logo.svg', sortBy: 'Sort by', sortDefault: 'Best', sortLow: 'Cheapest',
    sortOpts: ['Best', 'Cheapest', 'Quickest', 'Earliest takeoff'], cheap: [{ f: 0, p: 128 }, { f: 0, p: 128 }, { f: 0, p: 124 }] },
  { id: 'expedia', name: 'Expedia', host: 'expedia.com', path: '/Flights-Search', open: 'expedia.com', count: 35,
    tab: 'DEN to NYC flights | Expedia', logo: 'expedia-logo.svg', sortBy: 'Sort by', sortDefault: 'Recommended', sortLow: 'Price (lowest)',
    sortOpts: ['Recommended', 'Price (lowest)', 'Duration (shortest)', 'Departure (earliest)'], cheap: [{ f: 2, p: 146 }, { f: 2, p: 146 }] },
  { id: 'skyscanner', name: 'Skyscanner', host: 'skyscanner.com', path: '/transport/flights/den/nyca/261218', open: 'skyscanner.com', count: 44,
    tab: 'Cheap flights from Denver to New York | Skyscanner', logo: 'skyscanner-logo.svg', sortBy: 'Sort by', sortDefault: 'Best', sortLow: 'Cheapest first',
    sortOpts: ['Best', 'Cheapest first', 'Fastest first', 'Outbound: departure time'], cheap: [{ f: 3, p: 133 }, { f: 1, p: 119 }] },
];

const clock = (m) => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return `${h % 12 || 12}:${String(mm).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
const span = (d) => `${Math.floor(d / 60)}h ${d % 60}m`;
// a site's cheapest flight in a round, said plainly: what it is and where it lands
export function cheapest(site, round) {
  const c = site.cheap[Math.min(round, site.cheap.length - 1)], fl = FLIGHTS[c.f];
  return { p: c.p, air: AIR[fl.air], dep: clock(fl.dep), to: fl.to };
}
export const fav = (id) => `img/${id}-fav.png`;

// the eleven dearer flights beside the cheapest: price steps above it
const STEPS = [6, 11, 15, 19, 24, 31, 38, 47, 58, 71, 89];
// the order a site's own default sort shows them in (index 0 is the cheapest, never on top)
const DEFAULT_ORDER = [8, 3, 11, 5, 1, 9, 0, 6, 10, 2, 7, 4];
export function listings(siteIndex, round, sorted) {
  const site = SITES[siteIndex], c = site.cheap[Math.min(round, site.cheap.length - 1)];
  const others = FLIGHTS.map((_, k) => k).filter((k) => k !== c.f);
  const rows = [{ f: c.f, p: c.p }];
  STEPS.forEach((step, k) => rows.push({ f: others[(k + siteIndex * 2) % others.length], p: c.p + step + ((k + siteIndex) % 3) }));
  return sorted ? rows : DEFAULT_ORDER.map((k) => rows[k]);
}

// ---------- page markup ----------
const CHEV = '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';
const SEARCH = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const PLANE = '<svg viewBox="0 0 24 24"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2"/></svg>';
const NAV = {
  googleflights: '<nav class="st-cats"><span>Travel</span><span>Explore</span><span class="is-on">Flights</span><span>Hotels</span></nav><nav><span class="st-sign">Sign in</span></nav>',
  kayak: `<nav class="st-cats"><span class="is-on">Flights</span><span>Stays</span><span>Cars</span><span>Packages</span></nav><nav><span class="st-sign">Sign in</span></nav>`,
  expedia: `<nav class="st-cats"><span>Shop travel</span></nav><nav><span>Support</span><span>Trips</span><span class="st-sign">Sign in</span></nav>`,
  skyscanner: `<nav class="st-cats"><span class="is-on">Flights</span><span>Hotels</span><span>Car hire</span></nav><nav><span class="st-sign">Log in</span></nav>`,
};
const BOX = (on) => `<i class="fl-box${on ? ' is-on' : ''}"></i>`;
const SIDE = `<aside class="fl-side">
  <h3>Stops</h3>
  <p>${BOX(true)}<span>Nonstop</span><small>from $119</small></p><p>${BOX(false)}<span>1 stop</span><small>from $96</small></p><p>${BOX(false)}<span>2+ stops</span><small>from $141</small></p>
  <h3>Departure time</h3>
  <p>${BOX(false)}<span>Morning</span><small>5 AM to 12 PM</small></p><p>${BOX(false)}<span>Afternoon</span><small>12 PM to 6 PM</small></p><p>${BOX(false)}<span>Evening</span><small>after 6 PM</small></p>
  <h3>Airlines</h3>
  ${Object.values(AIR).map((a) => `<p>${BOX(true)}<span>${a}</span></p>`).join('')}
</aside>`;
// the fare by day around the chosen date, as relative bars (no figures, so no page contradicts its own list); the chosen
// day in the site's colour
const DAYS = [[14, 152], [15, 138], [16, 129], [17, 147], [18, 128], [19, 161], [20, 173], [21, 134], [22, 156]];
const CHART = `<div class="fl-rail"><h3>Cheapest nonstop, December</h3><div class="fl-chart">${DAYS.map(([d, p]) =>
  `<span class="fl-day${d === 18 ? ' is-on' : ''}"><i style="height:${Math.round((p - 100) * 2)}px"></i><b>${d}</b></span>`).join('')}</div>
  <p class="fl-note">Fares for this route are typical for December.</p></div>`;

export function pageHTML(i) {
  const site = SITES[i];
  const opts = site.sortOpts.map((o, k) => `<span class="st-opt${k === 1 ? ' st-opt-low' : ''}">${esc(o)}</span>`).join('');
  const logo = site.id === 'googleflights' ? `<img class="st-logo" src="img/${site.logo}" alt="Google"><span class="st-logo-t">Flights</span>` : `<img class="st-logo" src="img/${site.logo}" alt="${esc(site.name)}">`;
  return `<div class="st st-${site.id}" data-site="${i}">
    <header class="st-head">${logo}${NAV[site.id]}</header>
    <section class="fl-search">
      <span class="fl-field">${PLANE}${esc(TRIP.from)}</span><span class="fl-swap">${ARROW}</span><span class="fl-field">${esc(TRIP.to)}</span>
      <span class="fl-field">${esc(TRIP.date)}</span><span class="fl-field">One way</span><span class="fl-field">${esc(TRIP.who)}</span>
      <span class="fl-go">${SEARCH}Search</span>
    </section>
    <div class="st-body">
      ${SIDE}
      <div class="st-col">
        <div class="st-tools">
          <span class="st-count"><b>${site.count}</b> nonstop flights</span>
          <span class="st-sort"><small>${esc(site.sortBy)}</small><b class="st-sort-v">${esc(site.sortDefault)}</b>${CHEV}</span>
        </div>
        <div class="st-listwrap"><div class="st-list"></div></div>
        <div class="st-menu">${opts}</div>
      </div>
      ${CHART}
    </div>
  </div>`;
}

const BADGE = { googleflights: 'Lowest price', kayak: 'Cheapest', expedia: 'Lowest price', skyscanner: 'Cheapest' };
export function rowsHTML(i, round, sorted) {
  const site = SITES[i];
  const rows = listings(i, round, sorted);
  const low = Math.min(...rows.map((r) => r.p));
  return rows.map((row) => {
    const fl = FLIGHTS[row.f];
    const arr = fl.dep + fl.dur + 120; // New York is two hours ahead of Denver
    return `<div class="st-row">
      <span class="fl-logo"><img src="img/air-${fl.air}.png" alt="" width="28" height="28"></span>
      <span class="fl-leg"><b>${clock(fl.dep)}</b><small>DEN</small></span>
      <span class="fl-mid"><small>${span(fl.dur)}</small><i></i><small class="fl-direct">Nonstop</small></span>
      <span class="fl-leg"><b>${clock(arr)}${arr >= 1440 ? '<sup>+1</sup>' : ''}</b><small>${fl.to}</small></span>
      <span class="fl-air">${AIR[fl.air]}</span>
      ${row.p === low && sorted ? `<span class="st-badge">${BADGE[site.id]}</span>` : ''}
      <span class="st-price"><b>$${row.p}</b><small>one way</small></span>
    </div>`;
  }).join('');
}
