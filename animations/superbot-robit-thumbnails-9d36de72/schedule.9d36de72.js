// The spot's script as data: what the user types and sends, what superbot answers, what it does on the screen and the
// one-line activity it logs for each step. One pass is L seconds; the clock (main.9d36de72.js) loops it. superbot opens
// ROB IT, reads the thumbnail performance in Creator Hub, makes a new version of the weakest thumbnail, uploads it,
// turns the weak one off and saves, then comes back the next day and does it again.
import { TABS, AT, SCROLL } from './pages.9d36de72.js?v=9';

const ASK = 'This is my game, continually make iterations on my existing thumbnails and replace my lowest performer roblox.com/games/96168869671905/ROB-IT';
const TYPE_CPS = 40; // the user's typing in the composer (feed.9d36de72.js reads the same rate)
const PAGE_TOP = 82; // the page area starts under Chrome's tab strip and toolbar

const onGame = (p) => ({ x: p.x, y: PAGE_TOP + p.y });
const onHub = (p, scroll) => ({ x: p.x, y: PAGE_TOP + p.y - (p.y >= 72 ? scroll : 0) });

export function buildSchedule() {
  const S = { chat: [], typing: [], acts: [], moves: [], tabs: [{ openAt: -1 }], views: [[{ at: -1, v: 'ntp' }], []], active: [{ at: -1, tab: 0 }],
    omni: [{ at: -1, mode: 'ph' }], hub: [], hubScroll: [], control: 0, panel: 0, L: 0 };
  const act = (at, icon, text, sub) => S.acts.push({ at, icon, text, sub });
  const move = (t0, t1, to) => S.moves.push({ t0, t1, to });
  const view = (i, at, v) => S.views[i].push({ at, v });
  const hub = (at, state) => S.hub.push({ at, state });
  const scroll = (t0, t1, from, to) => S.hubScroll.push({ t0, t1, from, to });
  const say = (at, text) => { const send = at + text.length / TYPE_CPS + 0.18; S.typing.push({ start: at, text, send }); S.chat.push({ at: send, kind: 'user', text }); return send; };
  const bot = (at, text) => S.chat.push({ at, kind: 'bot', text });
  const card = (at, img, line1, line2) => S.chat.push({ at, kind: 'card', img, line1, line2 });
  const typeUrl = (at, tab, cps) => { const text = TABS[tab].host + TABS[tab].path; S.omni.push({ at, mode: 'type', text, start: at, cps }); return at + text.length / cps + 0.12; };

  // one replacement, from the table scrolled to the play-through rates: name the weakest, make its new version, then
  // Edit active thumbnails, Upload thumbnails, untick the weak one, Save Changes
  function replace(s0, day, weakRow, weakNo, rate, img, editState, upState, offState, savedState) {
    move(s0, s0 + 0.45, onHub(AT.rate(weakRow), SCROLL));
    act(s0 + 0.6, 'down', `Lowest performer: thumbnail ${weakNo}`, `${rate} play-through rate`);
    act(s0 + 1.1, 'image', `Making a new version of thumbnail ${weakNo}`);
    card(s0 + 2.6, img, `Thumbnail ${weakNo}, new version`, `Replaces the ${rate} original`);
    move(s0 + 2.8, s0 + 3.25, onHub(AT.edit, SCROLL));
    hub(s0 + 3.3, editState);
    act(s0 + 3.3, 'pen', 'Editing active thumbnails');
    move(s0 + 3.5, s0 + 3.85, onHub(AT.upload, SCROLL));
    hub(s0 + 3.95, upState);
    act(s0 + 3.95, 'upload', 'Uploaded the new version');
    move(s0 + 4.2, s0 + 4.65, onHub(AT.box(weakRow), SCROLL));
    hub(s0 + 4.75, offState);
    act(s0 + 4.75, 'square', `Turned off thumbnail ${weakNo}`, `${rate} play-through rate`);
    move(s0 + 4.95, s0 + 5.4, onHub(AT.save, SCROLL));
    hub(s0 + 5.5, savedState);
    act(s0 + 5.5, 'check', 'Saved changes', '4 thumbnails active');
    return s0 + 5.5;
  }
  // a fresh read of the table: scroll down to every row, then right to the play-through rates
  function read(shown, range, wide) {
    move(shown + 0.1, shown + 0.55, onGame(AT.table));
    scroll(shown + 0.6, shown + 1.4, 0, SCROLL);
    act(shown + 0.6, 'scan', 'Reading thumbnail performance', range);
    hub(shown + 1.75, wide);
    act(shown + 1.75, 'sort', 'Comparing play-through rates');
    return shown + 1.9;
  }

  // the ask; the computer pane slides in once it is sent, then superbot takes control
  const sent = say(0.5, ASK);
  S.panel = sent + 0.1;
  S.control = sent + 0.75;
  act(S.control + 0.1, 'monitor', 'Taking control of your computer');
  bot(sent + 0.6, "On it. I'll check how each thumbnail performs in Creator Hub, make a new version of the weakest one and swap it in, then keep going.");

  // the game page, in the tab that was open
  const g0 = S.control + 0.5;
  move(g0, g0 + 0.5, 'omni');
  const gEnter = typeUrl(g0 + 0.7, 0, 40);
  view(0, gEnter, 'load');
  S.omni.push({ at: gEnter, mode: 'url', tab: 0 });
  act(gEnter, 'globe', 'Opening ROB IT on roblox.com');
  view(0, gEnter + 0.45, 'page');
  move(gEnter + 0.55, gEnter + 1.0, onGame(AT.carousel));
  act(gEnter + 1.05, 'eye', 'Looking at your live thumbnails', '4 active');
  const u2 = say(gEnter + 0.4, 'Keep the robber in every one');
  bot(u2 + 0.5, 'Will do. Every new version keeps the robber front and center.');

  // Creator Hub's Thumbnails page, in a new tab
  const h0 = gEnter + 2.4;
  move(h0, h0 + 0.5, 'plus:1');
  S.tabs.push({ openAt: h0 + 0.55 });
  view(1, h0 + 0.55, 'ntp');
  S.active.push({ at: h0 + 0.55, tab: 1 });
  S.omni.push({ at: h0 + 0.55, mode: 'ph' });
  const hEnter = typeUrl(h0 + 0.75, 1, 90);
  view(1, hEnter, 'load');
  S.omni.push({ at: hEnter, mode: 'url', tab: 1 });
  act(hEnter, 'globe', 'Opening Creator Hub', 'ROB IT, Thumbnails');
  hub(hEnter, 'v1L0');
  scroll(hEnter, hEnter, 0, 0);
  const shown1 = hEnter + 0.6;
  view(1, shown1, 'page');
  const r1 = read(shown1, 'Oct 14 to Oct 21', 'v1L1');
  bot(r1 + 0.9, "Thumbnail 3 is your weakest at 0.41% play-through rate. Here's a new version of it:");
  const saved1 = replace(r1, 1, 2, 3, '0.41%', 'it-1', 'e1', 'e1n', 'e1u', 'v1s');
  bot(saved1 + 0.4, "Swapped it in. I'll check back as new data comes in and keep replacing the weakest one.");

  // the next day: reload, read again, replace the new weakest
  const d2 = saved1 + 2.0;
  act(d2, 'refresh', 'Checking again', 'a day later');
  move(d2, d2 + 0.45, 'reload');
  view(1, d2 + 0.5, 'load');
  hub(d2 + 0.5, 'v2L0');
  scroll(d2 + 0.5, d2 + 0.5, 0, 0);
  view(1, d2 + 1.1, 'page');
  const r2 = read(d2 + 1.1, 'Oct 15 to Oct 22', 'v2L1');
  move(r2, r2 + 0.4, onHub(AT.rate(3), SCROLL));
  act(r2 + 0.5, 'up', 'New version: 1.16% play-through rate', 'your best thumbnail now');
  bot(r2 + 1.6, "Your new version hit 1.16%, now your best thumbnail. Thumbnail 3 is the weakest at 0.53%, so here's a new version of it:");
  const saved2 = replace(r2 + 1.0, 2, 2, 3, '0.53%', 'it-2', 'e2', 'e2n', 'e2u', 'v2s');
  const u3 = say(saved2 + 0.3, 'This is great, keep going');
  bot(u3 + 0.5, "Will do. I'll keep making new versions and replacing the weakest one every day.");

  // the day after, already under way when the loop comes round
  const d3 = u3 + 1.8;
  act(d3, 'refresh', 'Checking again', 'a day later');
  move(d3, d3 + 0.45, 'reload');
  view(1, d3 + 0.5, 'load');
  hub(d3 + 0.5, 'v3L0');
  scroll(d3 + 0.5, d3 + 0.5, 0, 0);
  view(1, d3 + 1.1, 'page');
  const r3 = read(d3 + 1.1, 'Oct 16 to Oct 23', 'v3L1');
  move(r3, r3 + 0.45, onHub(AT.rate(1), SCROLL));
  act(r3 + 0.6, 'down', 'Lowest performer: thumbnail 2', '0.63% play-through rate');
  bot(r3 + 0.9, "Thumbnail 2 slipped to 0.63%. Here's a new version of it:");
  act(r3 + 1.1, 'image', 'Making a new version of thumbnail 2');
  card(r3 + 2.6, 'it-4', 'Thumbnail 2, new version', 'Replaces the 0.63% original');
  S.L = r3 + 4.6;

  for (const list of [S.chat, S.acts, S.moves, S.active, S.omni, S.typing, S.hub]) list.sort((a, b) => (a.at ?? a.t0 ?? a.start) - (b.at ?? b.t0 ?? b.start));
  S.views.forEach((list) => list.sort((a, b) => a.at - b.at));
  return S;
}
