// The spot's script as data: the one prompt the user types and sends, what superbot does on the screen, the one-line
// activity it logs for each step, and the breakthroughs it posts to the chat. One pass is L seconds; the clock
// (main.af4c3c6b.js) loops it. The agent keeps going round the four sites: a first pass that opens each one, then
// rechecks that reload them and read the new prices. Every visit that turns up a new low across all four is posted to
// the chat as a line and a result card; a visit that does not is logged in the activity tab only.
import { SITES, cheapest } from './sites.af4c3c6b.js';
import { STREAM_CPS } from './lib.af4c3c6b.js';

const ASK = 'Find me the cheapest 2 tickets for Velvet Static at Ball Arena on Nov 14';
const TYPE_CPS = 40; // the user's typing in the composer
const URL_CPS = 34; // superbot's typing in Chrome's address bar
const FIRST = 7.0; // one first visit: open a tab, type the address, read, sort, find the cheapest
const RECHECK = 4.8; // one recheck: switch to the tab, reload, read, find the cheapest
const POST = 0.25; // a breakthrough reaches the chat this long after the activity tab logs it
const HOLD = 3.4; // the last card stays up this long once it is fully out, before the loop comes round

export function buildSchedule() {
  const S = { chat: [], typing: [], acts: [], moves: [], tabs: [{ openAt: -1 }], views: [[{ at: -1, v: 'ntp' }], [], [], []], active: [{ at: -1, tab: 0 }],
    omni: [{ at: -1, mode: 'ph' }], menus: [], hovers: [], scrolls: [[], [], [], []], control: 3.0, L: 0 };
  const act = (at, text, win = false) => S.acts.push({ at, text, win });
  const move = (t0, t1, to) => S.moves.push({ t0, t1, to });
  const view = (i, at, v) => S.views[i].push({ at, ...v });
  const scroll = (i, t0, t1, from, to) => S.scrolls[i].push({ t0, t1, from, to });
  const say = (at, text) => { S.typing.push({ start: at, text, send: at + text.length / TYPE_CPS + 0.18 }); S.chat.push({ at: at + text.length / TYPE_CPS + 0.18, kind: 'user', text }); };
  const bot = (at, text, card, after) => { const c = { at, kind: 'bot', text, card, after }; S.chat.push(c); return c; };

  // the lowest pair found so far across all four sites, and the first one, for the savings the last card quotes
  let best = null, first = null, lows = 0, drops = 0;
  // ways to say a new low, taken in turn so the stream does not repeat itself: a site that had not led yet beating the
  // best so far, and a site's own price dropping below it
  const beat = [
    (name, d) => `New low. ${name} is $${d} less per seat:`,
    (name, d) => `${name} just beat that by $${d} a seat:`,
    (name) => `Lower again, this time on ${name}:`,
  ];
  const drop = [
    (name, was, p) => `Price drop on ${name}, $${was} down to $${p}:`,
    (name, was, p) => `${name} dropped too, now $${p} a seat:`,
    (name, was, p) => `Another drop. ${name} is down $${was - p} a seat:`,
  ];
  // what a visit found: logged always, posted to the chat only when it beats every site so far
  function found(i, round, at, after) {
    const site = SITES[i], c = cheapest(site, round);
    const before = round > 0 ? cheapest(site, round - 1).p : null;
    const dropped = before !== null && c.p < before;
    if (best && c.p >= best.p) {
      act(at, before === null ? `${site.name} lowest: $${c.p} each, Section ${c.s}` : dropped ? `${site.name} dropped to $${c.p} each` : `${site.name} still $${c.p} each`);
      return null;
    }
    const card = { site: i, seat: `Section ${c.s}, Row ${c.r}`, price: c.p };
    let line;
    if (!best) { line = `Found a first pair on ${site.name}:`; act(at, `First pair: $${c.p} each on ${site.name}`, true); }
    else if (dropped) { line = drop[drops % drop.length](site.name, before, c.p); drops += 1; act(at, `New low: ${site.name} dropped to $${c.p} each`, true); }
    else { line = beat[lows % beat.length](site.name, best.p - c.p); lows += 1; act(at, `New low: $${c.p} each on ${site.name}`, true); }
    best = { ...c, site: i };
    first = first || best;
    return bot(at + POST, line, card, after);
  }

  function firstVisit(i, s0, after) {
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
    const shown = enter + 0.45;
    view(i, shown, { v: 'page', round: 0, sorted: false });
    act(shown + 0.05, `Opened ${site.host}`);
    move(shown + 0.1, shown + 0.55, `list:${i}`);
    scroll(i, shown + 0.6, shown + 1.6, 0, 320);
    act(shown + 0.6, `Reading ${site.count} listings for 2 seats together`);
    move(shown + 1.7, shown + 2.15, `sort:${i}`);
    S.menus.push({ tab: i, t0: shown + 2.2, t1: shown + 2.68 });
    move(shown + 2.28, shown + 2.6, `opt:${i}`);
    view(i, shown + 2.68, { v: 'page', round: 0, sorted: true });
    scroll(i, shown + 2.68, shown + 2.68, 0, 0);
    act(shown + 2.7, 'Sorted by price, low to high');
    move(shown + 2.85, shown + 3.3, `row:${i}`);
    S.hovers.push({ tab: i, t0: shown + 3.25 });
    return found(i, 0, shown + 3.45, after);
  }

  function recheck(i, s0, round, after) {
    const site = SITES[i];
    move(s0, s0 + 0.45, `tab:${i}`);
    S.active.push({ at: s0 + 0.5, tab: i });
    S.omni.push({ at: s0 + 0.5, mode: 'url', tab: i });
    move(s0 + 0.6, s0 + 1.0, 'reload');
    view(i, s0 + 1.05, { v: 'load' });
    act(s0 + 1.05, `Rechecking ${site.name}`);
    view(i, s0 + 1.45, { v: 'page', round, sorted: true });
    scroll(i, s0 + 1.45, s0 + 1.45, 0, 0);
    move(s0 + 1.55, s0 + 1.95, `list:${i}`);
    scroll(i, s0 + 2.0, s0 + 2.8, 0, 300);
    scroll(i, s0 + 2.95, s0 + 3.4, 300, 0);
    move(s0 + 3.45, s0 + 3.85, `row:${i}`);
    S.hovers.push({ tab: i, t0: s0 + 3.8 });
    return found(i, round, s0 + 3.95, after);
  }

  // the one ask, and superbot taking control; from here on the user only watches
  say(0.5, ASK);
  act(S.control + 0.1, 'Took control of your computer');
  bot(3.0, "On it. I'll check StubHub, SeatGeek, Ticketmaster and Vivid Seats, compare all-in prices with fees, and post every new low here.");

  // the first pass: open every site
  const R1 = 4.0;
  SITES.forEach((_, i) => firstVisit(i, R1 + i * FIRST, i === 3 ? "That's all 4 sites. Rechecking each one for drops now." : undefined));
  act(R1 + 4 * FIRST - 0.2, 'Checked all 4 sites, rechecking for drops');

  // the second pass: reload each one
  const R2 = R1 + 4 * FIRST + 0.4;
  SITES.forEach((_, i) => recheck(i, R2 + i * RECHECK, 1));

  // the third pass, already under way when the loop comes round; its find is the lowest yet
  const R3 = R2 + 4 * RECHECK + 0.4;
  recheck(0, R3, 2);
  const last = recheck(1, R3 + RECHECK, 2, 'Still watching all 4.');
  if (!last) throw new Error('the loop must end on a breakthrough: retune SITES so the third pass finds a new low');
  last.text = `Lowest yet, $${(first.p - best.p) * 2} less for the pair than the first find:`;
  // the last card's text, card and closing line all out (feed.af4c3c6b.js's stream timing), then a held beat
  S.L = last.at + 0.08 + last.text.length / STREAM_CPS + 0.15 + 0.35 + last.after.length / STREAM_CPS + HOLD;

  for (const list of [S.chat, S.acts, S.moves, S.active, S.omni, S.typing]) list.sort((a, b) => (a.at ?? a.t0 ?? a.start) - (b.at ?? b.t0 ?? b.start));
  // a row stays hovered until the cursor leaves it, on the next move
  for (const h of S.hovers) {
    const leave = S.moves.find((m) => m.t0 > h.t0);
    h.t1 = leave ? leave.t0 + 0.12 : S.L;
  }
  return S;
}
