// The spot's script as data: what the user types and sends, what superbot answers, what it does on the screen and the
// one-line activity it logs for each step. One pass is L seconds; the clock (main.9d36de72.js) loops it. The agent keeps
// going round the four sites: a first pass that opens each one, then rechecks that reload them and read the new prices.
import { SITES, cheapest } from './sites.9d36de72.js?v=4';

const ASK = 'Find me the cheapest 2 tickets for Velvet Static at Ball Arena on Nov 14';
const TYPE_CPS = 40; // the user's typing in the composer
const URL_CPS = 34; // superbot's typing in Chrome's address bar
const FIRST = 7.0; // one first visit: open a tab, type the address, read, sort, find the cheapest
const RECHECK = 4.8; // one recheck: switch to the tab, reload, read, find the cheapest

export function buildSchedule() {
  const S = { chat: [], typing: [], acts: [], moves: [], tabs: [{ openAt: -1 }], views: [[{ at: -1, v: 'ntp' }], [], [], []], active: [{ at: -1, tab: 0 }],
    omni: [{ at: -1, mode: 'ph' }], menus: [], hovers: [], scrolls: [[], [], [], []], control: 3.2, panel: 0, L: 0 };
  const act = (at, icon, text, sub) => S.acts.push({ at, icon, text, sub });
  const move = (t0, t1, to) => S.moves.push({ t0, t1, to });
  const view = (i, at, v) => S.views[i].push({ at, ...v });
  const scroll = (i, t0, t1, from, to) => S.scrolls[i].push({ t0, t1, from, to });
  const say = (at, text) => { S.typing.push({ start: at, text, send: at + text.length / TYPE_CPS + 0.18 }); S.chat.push({ at: at + text.length / TYPE_CPS + 0.18, kind: 'user', text }); };
  const bot = (at, text) => S.chat.push({ at, kind: 'bot', text });

  // the found price, said the way a recheck reads it against the last pass; when it beats every site so far, a line
  // in the log and a price card in the chat
  let best = Infinity;
  const logPrice = (at, i, round) => {
    const site = SITES[i], c = cheapest(site, round), seat = `Sec ${c.s}, Row ${c.r}`;
    const before = round === 0 ? null : cheapest(site, round - 1).p;
    if (before === null) act(at, 'tag', `${site.name}: $${c.p} each`, seat);
    else if (c.p < before) act(at, 'down', `${site.name} dropped to $${c.p} each`, seat);
    else act(at, 'tag', `${site.name}: still $${c.p} each`);
    if (c.p < best) {
      act(at + 0.4, 'down', best === Infinity ? `Lowest so far: $${c.p}` : `New lowest: $${c.p} on ${site.name}`);
      S.chat.push({ at: at + 0.5, kind: 'card', site: i, seat: `Section ${c.s}, Row ${c.r}`, price: c.p });
    }
    best = Math.min(best, c.p);
  };

  function firstVisit(i, s0) {
    const site = SITES[i];
    const url = site.host + site.path;
    if (i === 0) move(s0, s0 + 0.5, 'omni');
    else {
      move(s0, s0 + 0.5, `plus:${i}`);
      S.tabs.push({ openAt: s0 + 0.55 });
      view(i, s0 + 0.55, { v: 'ntp' });
      S.active.push({ at: s0 + 0.55, tab: i });
      S.omni.push({ at: s0 + 0.55, mode: 'ph' });
    }
    const ty = s0 + 0.75;
    S.omni.push({ at: ty, mode: 'type', text: url, start: ty });
    const enter = ty + url.length / URL_CPS + 0.12;
    view(i, enter, { v: 'load' });
    S.omni.push({ at: enter, mode: 'url', tab: i });
    act(enter, 'globe', `Opening ${site.host}`);
    const shown = enter + 0.45;
    view(i, shown, { v: 'page', round: 0, sorted: false });
    move(shown + 0.1, shown + 0.55, `list:${i}`);
    scroll(i, shown + 0.6, shown + 1.6, 0, 320);
    act(shown + 0.6, 'scan', `Reading ${site.count} listings`, '2 seats together');
    move(shown + 1.7, shown + 2.15, `sort:${i}`);
    S.menus.push({ tab: i, t0: shown + 2.2, t1: shown + 2.68 });
    move(shown + 2.28, shown + 2.6, `opt:${i}`);
    view(i, shown + 2.68, { v: 'page', round: 0, sorted: true });
    scroll(i, shown + 2.68, shown + 2.68, 0, 0);
    act(shown + 2.7, 'sort', 'Sorted by lowest price');
    move(shown + 2.85, shown + 3.3, `row:${i}`);
    S.hovers.push({ tab: i, t0: shown + 3.25 });
    logPrice(shown + 3.45, i, 0);
  }

  function recheck(i, s0, round) {
    const site = SITES[i];
    move(s0, s0 + 0.45, `tab:${i}`);
    S.active.push({ at: s0 + 0.5, tab: i });
    S.omni.push({ at: s0 + 0.5, mode: 'url', tab: i });
    move(s0 + 0.6, s0 + 1.0, 'reload');
    view(i, s0 + 1.05, { v: 'load' });
    act(s0 + 1.05, 'refresh', `Rechecking ${site.name}`);
    view(i, s0 + 1.45, { v: 'page', round, sorted: true });
    scroll(i, s0 + 1.45, s0 + 1.45, 0, 0);
    move(s0 + 1.55, s0 + 1.95, `list:${i}`);
    scroll(i, s0 + 2.0, s0 + 2.8, 0, 300);
    scroll(i, s0 + 2.95, s0 + 3.4, 300, 0);
    move(s0 + 3.45, s0 + 3.85, `row:${i}`);
    S.hovers.push({ tab: i, t0: s0 + 3.8 });
    logPrice(s0 + 3.95, i, round);
  }

  // the ask; the computer panel slides in once it is sent, then superbot takes control
  say(0.5, ASK);
  S.panel = S.chat[0].at + 0.1;
  act(S.control + 0.1, 'monitor', 'Taking control of your computer');
  bot(3.7, "On it. I'll check StubHub, SeatGeek, Ticketmaster and Vivid Seats for 2 seats together and keep looking for the lowest price.");

  // the first pass: open every site
  const R1 = 4.0;
  SITES.forEach((_, i) => firstVisit(i, R1 + i * FIRST));
  say(R1 + FIRST + 0.9, 'Make sure the prices include fees');
  bot(R1 + FIRST + 2.4, "Got it. I'm comparing all-in prices with fees on every site.");
  act(R1 + FIRST + 2.5, 'fees', 'Comparing prices with fees included');
  const end1 = R1 + 4 * FIRST;
  const best1 = SITES[1], c1 = cheapest(best1, 0);
  bot(end1 + 0.2, `Checked all 4 sites. ${best1.name} is still the cheapest at $${c1.p} each, fees included. I'll keep rechecking every site for price drops.`);
  act(end1 + 0.3, 'check', `Cheapest: ${best1.name}, $${c1.p} each`, `Sec ${c1.s}, Row ${c1.r}`);

  // the second pass: reload each one
  const R2 = end1 + 1.4;
  SITES.forEach((_, i) => recheck(i, R2 + i * RECHECK, 1));
  say(R2 + 0.8, 'Perfect, keep watching. Prices usually drop closer to the show');
  bot(R2 + 3.1, `Will do. I'll keep checking all four and tell you the moment anything beats $${c1.p}.`);
  const end2 = R2 + 4 * RECHECK;
  const best2 = SITES[3], c2 = cheapest(best2, 1);
  bot(end2 + 0.2, `Price drop on ${best2.name}: that's $${(c1.p - c2.p) * 2} less for the pair than ${best1.name}. Still watching.`);
  act(end2 + 0.3, 'bell', `Sent you the ${best2.name} price drop`);

  // the third pass, already under way when the loop comes round; the price drop holds a beat first
  const R3 = end2 + 2.2;
  recheck(0, R3, 2);
  recheck(1, R3 + RECHECK, 2);
  say(R3 + 0.6, 'Grab them if they hit $50 each');
  bot(R3 + 2.0, "Deal. The moment 2 seats together hit $50 or less, I'll buy them for you.");
  act(R3 + 2.1, 'ticket', 'Buy rule: 2 seats together', 'at $50 each or less');
  S.L = R3 + 2 * RECHECK + 0.6;

  for (const list of [S.chat, S.acts, S.moves, S.active, S.omni, S.typing]) list.sort((a, b) => (a.at ?? a.t0 ?? a.start) - (b.at ?? b.t0 ?? b.start));
  // a row stays hovered until the cursor leaves it, on the next move
  for (const h of S.hovers) {
    const leave = S.moves.find((m) => m.t0 > h.t0);
    h.t1 = leave ? leave.t0 + 0.12 : S.L;
  }
  return S;
}
