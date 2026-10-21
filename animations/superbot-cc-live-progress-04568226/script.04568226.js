// The run, in seconds. The user asks for the cheapest Denver to Tokyo round trip; superbot takes the computer and loops
// over five travel sites, one tab each, while the user checks in twice: an update request and a change of plan
// (nonstop only). Every bar, chip, bubble and price on screen is derived from the numbers here.
export const LOOP = 34;
export const SITE_DUR = 4.2;
export const T = {
  card: 2.9, // the live view rises in under the thread
  take: 3.4, // the orange vignette and the pill: superbot has control
  bar: 3.6, // progress starts
  replan: 17.6, // the user's change of plan lands: nonstop only, one step added
  refiltered: 18.4,
  compare: 27.0,
  done: 28.4,
  release: 29.4, // the takeover overlay fades: control handed back
};

const nonstop = { air: 'United', code: 'UA', tint: '#1d4f9c', dep: '11:20 AM', arr: '4:05 PM+1', dur: '12h 45m', stops: 'Nonstop' };
const leg = (air, code, tint, dep, arr, dur, stops, price, fare = 'Round trip') => ({ air, code, tint, dep, arr, dur, stops, price, fare });

// each site: its tab, its page, the fares superbot reads off it. `filter` sites are visited after the change of plan:
// superbot ticks Nonstop only before the results land
export const SITES = [
  {
    id: 'gf', name: 'Google Flights', fav: 'img/fav-gflights.png', at: 4.0, fares: 41, look: 'gf',
    url: 'google.com/travel/flights/search?q=DEN-TYO+Mar+12-22',
    rows: [
      { ...nonstop, price: 1148, fare: 'Round trip' },
      leg('ANA', 'NH', '#13448f', '8:30 AM', '5:10 PM+1', '16h 40m', '1 stop, LAX', 689),
      leg('Air Canada', 'AC', '#d22630', '6:00 AM', '3:15 PM+1', '17h 15m', '1 stop, YVR', 701),
      leg('Alaska, JAL', 'JL', '#c8102e', '6:15 AM', '3:55 PM+1', '17h 40m', '1 stop, SEA', 742),
      leg('Delta', 'DL', '#003a70', '7:00 AM', '4:30 PM+1', '17h 30m', '1 stop, SEA', 768),
      leg('American', 'AA', '#36495a', '7:45 AM', '6:35 PM+1', '18h 50m', '1 stop, DFW', 812),
    ],
  },
  {
    id: 'kayak', name: 'KAYAK', fav: 'img/fav-kayak.jpg', at: 8.2, fares: 57, look: 'kayak',
    url: 'kayak.com/flights/DEN-TYO/2027-03-12/2027-03-22',
    rows: [
      { ...nonstop, price: 1132, fare: 'Round trip' },
      leg('ANA', 'NH', '#13448f', '8:30 AM', '5:10 PM+1', '16h 40m', '1 stop, LAX', 695),
      leg('Air Canada', 'AC', '#d22630', '6:00 AM', '3:15 PM+1', '17h 15m', '1 stop, YVR', 642),
      leg('Hacker Fare', 'ZG', '#5b6b7a', '6:40 AM', '4:25 PM+1', '17h 45m', '1 stop, SFO', 671, '2 tickets'),
      leg('Delta', 'DL', '#003a70', '7:00 AM', '4:30 PM+1', '17h 30m', '1 stop, SEA', 759),
      leg('American', 'AA', '#36495a', '7:45 AM', '6:35 PM+1', '18h 50m', '1 stop, DFW', 799),
    ],
  },
  {
    id: 'sky', name: 'Skyscanner', fav: 'img/fav-skyscanner.png', at: 12.4, fares: 33, look: 'sky',
    url: 'skyscanner.com/transport/flights/den/tyoa/270312/270322',
    rows: [
      leg('Air Canada', 'AC', '#d22630', '6:00 AM', '3:15 PM+1', '17h 15m', '1 stop, YVR', 649),
      leg('Zipair', 'ZG', '#2c7a6b', '6:40 AM', '4:25 PM+1', '17h 45m', '1 stop, SFO', 618, 'Self transfer'),
      leg('ANA', 'NH', '#13448f', '8:30 AM', '5:10 PM+1', '16h 40m', '1 stop, LAX', 702),
      { ...nonstop, price: 1119, fare: 'Round trip' },
      leg('Alaska, JAL', 'JL', '#c8102e', '6:15 AM', '3:55 PM+1', '17h 40m', '1 stop, SEA', 736),
      leg('Delta', 'DL', '#003a70', '7:00 AM', '4:30 PM+1', '17h 30m', '1 stop, SEA', 771),
    ],
  },
  {
    id: 'expedia', name: 'Expedia', fav: 'img/fav-expedia.png', at: 18.6, fares: 5, look: 'expedia', filter: true,
    url: 'expedia.com/Flights-Search?leg1=DEN,TYO,2027-03-12&stops=0',
    rows: [
      { ...nonstop, price: 1086, fare: 'Economy' },
      { ...nonstop, air: 'ANA, run by United', code: 'NH', tint: '#13448f', price: 1128, fare: 'Economy' },
      { ...nonstop, price: 1412, fare: 'Refundable' },
      { ...nonstop, price: 2180, fare: 'Premium Plus' },
      { ...nonstop, price: 4890, fare: 'Business' },
    ],
  },
  {
    id: 'united', name: 'United', fav: 'img/fav-united.jpg', at: 22.8, fares: 4, look: 'united', filter: true,
    url: 'united.com/en/us/fsr/choose-flights?f=DEN&t=NRT&d=2027-03-12&r=2027-03-22',
    rows: [
      { ...nonstop, air: 'United UA 139', price: 1061, fare: 'Economy' },
      { ...nonstop, air: 'United UA 139', price: 1389, fare: 'Flexible' },
      { ...nonstop, air: 'United UA 139', price: 2104, fare: 'Premium Plus' },
      { ...nonstop, air: 'United UA 139', price: 4920, fare: 'Polaris' },
    ],
  },
];

// a site's beats: tab open, page in, filter click, results, scan, the cheapest ringed
for (const s of SITES) {
  const S = s.at;
  s.click = S + (s === SITES[0] ? 0.3 : 0.4); // the omnibox (first site) or the new-tab button
  s.open = S + 0.45;
  s.typeAt = S + 0.5;
  s.load = S + 1.0; // the URL commits, the page and its skeleton come up
  s.filterAt = s.filter ? S + 1.45 : null;
  s.rowsAt = S + (s.filter ? 1.85 : 1.5);
  s.scanTo = S + 2.8;
  s.found = S + 3.2;
  s.best = s.rows.reduce((b, r, i) => (r.price < s.rows[b].price ? i : b), 0);
  s.nonstopBest = s.rows.reduce((b, r, i) => (r.stops === 'Nonstop' && (b < 0 || r.price < s.rows[b].price) ? i : b), -1);
}
const [GF, KAYAK, SKY, EXPEDIA, UNITED] = SITES;

// the plan: five sites, then the change of plan adds a re-filter of the three already read
export const STEPS = [
  { at: GF.at, n: 1, of: 5 }, { at: KAYAK.at, n: 2, of: 5 }, { at: SKY.at, n: 3, of: 5 },
  { at: T.replan, n: 4, of: 6 }, { at: EXPEDIA.at, n: 5, of: 6 }, { at: UNITED.at, n: 6, of: 6 },
];

// progress, 0..1: each site fills its share in three eased steps (page up, results in, cheapest found). The change
// of plan dips it, as one more step joins the plan
function siteKeys(s, from, to) {
  const d = to - from;
  return [[s.at, from], [s.load, from + d * 0.25], [s.rowsAt + 0.3, from + d * 0.6], [s.found, to]];
}
export const PROGRESS = [
  [T.bar, 0],
  ...siteKeys(GF, 0, 0.2), ...siteKeys(KAYAK, 0.2, 0.4), ...siteKeys(SKY, 0.4, 0.6),
  [T.replan, 0.6], [T.replan + 0.5, 3 / 6], [T.refiltered, 4 / 6],
  ...siteKeys(EXPEDIA, 4 / 6, 5 / 6), ...siteKeys(UNITED, 5 / 6, 0.95),
  [T.compare, 0.95], [T.done, 1],
];

// the current task, top right of the frame
const siteTasks = (s, verb) => [
  { at: s.at, text: `${verb} ${s.id === 'united' ? 'united.com' : s.name === 'KAYAK' ? 'Kayak' : s.name}` },
  ...(s.filter ? [{ at: s.filterAt - 0.3, text: '🎛️ Filtering to nonstop' }] : []),
  { at: s.rowsAt, text: `👀 Scanning ${s.fares} ${s.filter ? 'nonstop fares' : 'fares'}` },
  { at: s.found, text: '📝 Noting the cheapest' },
];
export const TASKS = [
  { at: T.take, text: '🧡 Taking control' },
  ...siteTasks(GF, '✈️ Opening'), ...siteTasks(KAYAK, '🔎 Opening'), ...siteTasks(SKY, '🔎 Opening'),
  { at: T.replan, text: '🔁 Switching to nonstop only' },
  ...siteTasks(EXPEDIA, '🛫 Opening'), ...siteTasks(UNITED, '🛫 Checking'),
  { at: T.compare, text: '🧮 Comparing every site' },
  { at: T.done, text: '✅ Cheapest fare found', done: true },
];

// the topline news: the cheapest fare so far, re-scoped by the change of plan
const fare = (s, i, label, at) => ({ at, label, price: s.rows[i].price, site: s, detail: `${s.rows[i].air.split(' UA')[0]}, ${s.rows[i].stops.split(',')[0].toLowerCase()}` });
export const NEWS = [
  { at: T.bar, label: 'Cheapest so far', price: null, site: null, detail: 'Looking for fares' },
  fare(GF, GF.best, 'Cheapest so far', GF.found),
  fare(KAYAK, KAYAK.best, 'Cheapest so far', KAYAK.found),
  fare(SKY, SKY.best, 'Cheapest so far', SKY.found),
  fare(SKY, SKY.nonstopBest, 'Cheapest nonstop', T.replan + 0.6),
  fare(EXPEDIA, EXPEDIA.best, 'Cheapest nonstop', EXPEDIA.found),
  fare(UNITED, UNITED.best, 'Cheapest nonstop', UNITED.found),
  { ...fare(UNITED, UNITED.best, 'Best fare', T.done), final: true },
];

// the thread: the user types in the composer, sends, and the bubble lands above the live view, which never moves
export const THREAD = [
  { kind: 'user', at: 2.1, type: 0.3, text: 'Find me the cheapest round trip from Denver to Tokyo, March 12 to 22 ✈️' },
  { kind: 'status', at: 2.5, doneAt: T.take + 0.2, text: 'Taking control of your computer' },
  { kind: 'agent', at: 3.05, text: "On it 🙌 I'll loop through 5 travel sites and track the cheapest fare." },
  { kind: 'user', at: 12.7, type: 11.7, text: 'any updates? 👀' },
  { kind: 'agent', at: 13.15, text: '2 of 5 sites done ✅ Best so far is $642 on Kayak (Air Canada, 1 stop). Checking Skyscanner now 🔎' },
  { kind: 'user', at: 16.9, type: 15.6, text: 'actually, nonstop only please 🙏' },
  { kind: 'agent', at: 17.35, text: 'You got it 👍 Nonstop only from here. Best nonstop so far is $1,119 on Skyscanner, so Expedia and united.com are next.' },
  { kind: 'agent', at: T.done + 0.3, text: 'Found it 🎉 The cheapest nonstop is $1,061 on united.com, UA 139 out Mar 12 and back Mar 22. Want me to book it?' },
];
