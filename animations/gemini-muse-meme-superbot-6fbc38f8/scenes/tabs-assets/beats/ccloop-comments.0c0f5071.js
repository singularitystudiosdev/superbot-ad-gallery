// The 'cc-loop-comments' variant (the computer-control loop engine, ccloop.0c0f5071.js): "Keep replying to new comments
// on my latest video..." and superbot works the video's comments in rounds on the creator's own screen. Each round it
// refreshes for new comments (they slide in at the top, marked New), answers the question among them (a reply box opens,
// the answer types, Reply posts it under the comment as the creator), hearts the best ones, and flags the spam and removes
// it (the comment collapses out of the list); a counter card on the left keeps the day's totals. The user's follow-ups
// change the job as it runs: "Pin the one asking for a part 2." becomes round 2's note step (the comment is pinned and
// rises to the top), "Skip the trolls, don't reply to them." round 3's (the troll's comment is marked Skipped). The spot
// ends while round 3 types its answer. The channel and video are Mevesa's (the yt-thumbnail cut's creator, its thumbnail
// from img/ytthumb.c4e81a27/); every commenter, comment and count is made up for the demo, and the page is drawn here at
// the desk's px, naming no video platform. Its page styles are ../ccloop-comments.0c0f5071.css.
import { lerp, seg, outCubic, inOutCubic, press, streamCount } from '../../../lib.9b47fc30.js';
import { makeLoop } from './ccloop.0c0f5071.js?v=1';

const img = (p) => new URL('../../../img/' + p, import.meta.url).href;
const AVATAR = img('ytthumb.c4e81a27/avatar.jpg');
const VIDEO = img('ytthumb.c4e81a27/agents-video.jpg');
const GAP = 14;
const HEART = '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/></svg>';
const PIN = '<svg viewBox="0 0 24 24"><path d="M9 3h6l-1 6 4 4H6l4-4zM12 13v8"/></svg>';
const REFRESH = '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5"/></svg>';
// every comment, newest first; `at` is when a new one arrives ([step key, seconds]), the rest are there from the start
const COMMENTS = [
  { id: 'n7', who: '@hottakes99', ago: 'just now', text: 'All hype. Unsubscribed.', hearts: 0, color: '#64748b', at: ['r3-check', 0.75] },
  { id: 'n6', who: '@dee.makes', ago: 'just now', text: 'Can you do one on AI video tools next?', hearts: 2, color: '#0891b2', at: ['r3-check', 0.55] },
  { id: 'n5', who: '@free.gift.drop', ago: '1 minute ago', text: 'First 100 people get a free gift card, click my profile', hearts: 0, color: '#9ca3af', at: ['r2-check', 0.75] },
  { id: 'n4', who: '@sam.k', ago: '1 minute ago', text: 'What’s the track at the end of the video?', hearts: 1, color: '#ea580c', at: ['r2-check', 0.55] },
  { id: 'n3', who: '@earn.daily.500', ago: '2 minutes ago', text: 'Make $500 a day from home, message me now', hearts: 0, color: '#9ca3af', at: ['r1-check', 0.95] },
  { id: 'n2', who: '@marco.dev', ago: '2 minutes ago', text: 'Best explanation of agents I’ve seen. Part 2 please!', hearts: 9, color: '#2563eb', at: ['r1-check', 0.75] },
  { id: 'n1', who: '@lena.codes', ago: '3 minutes ago', text: 'Which tool did you use for the email demo at 4:12?', hearts: 4, color: '#db2777', at: ['r1-check', 0.55] },
  { id: 'e1', who: '@kai.rivera', ago: '20 minutes ago', text: 'Subscribed. This is the channel I needed this year.', hearts: 3, color: '#16a34a' },
  { id: 'e2', who: '@jules.m', ago: '34 minutes ago', text: 'So are agents going to replace browsers, or live inside them?', hearts: 18, color: '#7c3aed' },
  { id: 'e3', who: '@priya_s', ago: '1 hour ago', text: 'Saving this one to show my team on Monday.', hearts: 7, color: '#ca8a04' },
];
// the answers superbot types as the creator, by comment
const REPLIES = {
  n1: 'Thanks Lena! Every tool from the video is linked in the description.',
  n4: 'It’s in the description, the track list is at the bottom.',
  n6: 'Great idea, it’s on the list for a future video!',
};
// the day's totals before the spot, as the counter card shows them
const START = { replied: 41, hearted: 58, removed: 8, pinned: 0 };

const CHECKS = { 'r1-check': 3, 'r2-check': 2, 'r3-check': 2 }; // how many comments each round's refresh brings in

// when everything on the page happens, off the steps' windows and clicks
function cues(T) {
  const S = T.S, C = T.clicks;
  return {
    arrive: (c) => (c.at ? S[c.at[0]].a + c.at[1] : -Infinity),
    hearts: { n2: C['r1-heart'][0], e1: C['r1-heart'][1] },
    answers: { n1: C['r1-answer'], n4: C['r2-answer'], n6: C['r3-answer'] }, // [Reply opens the box, Reply posts]
    posted: { n1: C['r1-answer'][1] + 0.1, n4: C['r2-answer'][1] + 0.1 },
    removed: { n3: C['r1-spam'][0] + 0.2, n5: C['r2-spam'][0] + 0.2 },
    flagged: { n3: S['r1-spam'].a + 0.2, n5: S['r2-spam'].a + 0.2 },
    pin: C['r2-pin'][0] + 0.15,
    skip: S['r3-skip'].a + 0.9,
  };
}

// the counter card's totals, and the refresh: it spins while a round checks, then says how many came in
function paintCounts(p, t, T, ev) {
  const count = (times) => times.filter((x) => t >= x).length;
  const totals = {
    replied: START.replied + count(Object.values(ev.posted)), hearted: START.hearted + count(Object.values(ev.hearts)),
    removed: START.removed + count(Object.values(ev.removed)), pinned: START.pinned + (t >= ev.pin ? 1 : 0),
  };
  for (const [k, n] of Object.entries(p.stats)) if (p.last[k] !== totals[k]) { n.textContent = totals[k]; p.last[k] = totals[k]; }
  const check = Object.keys(CHECKS).map((k) => T.S[k]).filter((s) => t >= s.a).pop();
  p.refresh.style.transform = check && t < check.a + 1.2 ? `rotate(${(((t - check.a) * 520) % 360).toFixed(1)}deg)` : '';
  const found = check && t >= check.a + 1.2 && t < check.b + 2 ? `${CHECKS[check.key]} new` : '';
  if (p.last.found !== found) { p.found.textContent = found; p.last.found = found; }
}

// one comment at t: its marks (pinned, New, Spam, Skipped), its heart, its answer; gives back how present it is
function paintComment(it, c, t, T, ev) {
  const arrive = ev.arrive(c);
  const pin = c.id === 'n2' ? outCubic(seg(t, ev.pin, ev.pin + 0.3)) : 0;
  it.pin.style.display = pin > 0 ? '' : 'none';
  it.pin.style.opacity = pin.toFixed(3);
  // New holds through the round it came in
  const done = c.at && T.S[`r${c.at[0][1]}-done`];
  it.isNew.style.display = c.at && t >= arrive && (!done || t < done.b) ? '' : 'none';
  const fl = ev.flagged[c.id] !== undefined ? outCubic(seg(t, ev.flagged[c.id], ev.flagged[c.id] + 0.3)) : 0;
  it.flag.style.display = fl > 0 ? '' : 'none';
  it.n.style.setProperty('--cm-f', fl.toFixed(3));
  it.remove.style.opacity = fl.toFixed(3);
  if (ev.removed[c.id] !== undefined) it.remove.style.transform = `scale(${(1 - 0.06 * press(t, ev.removed[c.id] - 0.1)).toFixed(4)})`;
  const sk = c.id === 'n7' ? outCubic(seg(t, ev.skip, ev.skip + 0.3)) : 0;
  it.skip.style.display = sk > 0 ? '' : 'none';
  it.n.style.setProperty('--cm-s', sk.toFixed(3));
  const hAt = ev.hearts[c.id], h = hAt !== undefined && t >= hAt ? 1 : 0;
  it.heart.classList.toggle('on', !!h);
  if (hAt !== undefined) it.heart.style.transform = `scale(${(1 + 0.25 * Math.sin(Math.PI * seg(t, hAt, hAt + 0.3))).toFixed(4)})`;
  it.count.textContent = c.hearts + h;
  it.by.style.display = h ? '' : 'none';
  if (ev.answers[c.id]) paintAnswer(it, c, t, ev.answers[c.id]);
  const out = ev.removed[c.id] !== undefined ? outCubic(seg(t, ev.removed[c.id], ev.removed[c.id] + 0.4)) : 0;
  return { pres: outCubic(seg(t, arrive, arrive + 0.45)) * (1 - out), h: it.n.offsetHeight };
}

// the answer: the box opens on Reply, the text types, Reply posts it as the creator
function paintAnswer(it, c, t, [open, send]) {
  const o = outCubic(seg(t, open + 0.05, open + 0.4));
  it.rep.style.height = o >= 1 ? 'auto' : `${(it.rin.offsetHeight * o).toFixed(2)}px`;
  const text = REPLIES[c.id], n = streamCount(text, open + 0.45, 38, t);
  if (it.shown !== n) { it.typed.textContent = text.slice(0, n); it.rest.textContent = text.slice(n); it.shown = n; }
  const ps = send !== undefined ? outCubic(seg(t, send + 0.1, send + 0.35)) : 0;
  it.box.style.opacity = (1 - ps).toFixed(3);
  it.send.style.opacity = (1 - ps).toFixed(3);
  it.send.style.transform = send !== undefined ? `scale(${(1 - 0.06 * press(t, send)).toFixed(4)})` : '';
  it.posted.style.opacity = ps.toFixed(3);
}

// the list, top to bottom from each comment's height and presence (new ones open in, removed ones close up); after the
// pin the pinned comment leads, the move easing between the two layouts
function layout(p, t, ev, pos) {
  const ys = (order) => { const y = {}; let at = 0; for (const id of order) { y[id] = at; at += (pos[id].h + GAP) * pos[id].pres; } return y; };
  const base = COMMENTS.map((c) => c.id), pinned = ['n2', ...base.filter((id) => id !== 'n2')];
  const y0 = ys(base), y1 = ys(pinned), f = inOutCubic(seg(t, ev.pin + 0.15, ev.pin + 0.75));
  for (const c of COMMENTS) {
    const it = p.items[c.id], pr = pos[c.id].pres;
    const y = lerp(y0[c.id], y1[c.id], f) - (1 - Math.min(1, pr * 1.6)) * 12;
    it.n.style.transform = `translateY(${y.toFixed(2)}px)`;
    it.n.style.opacity = pr.toFixed(3);
    it.n.style.visibility = pr > 0 ? '' : 'hidden';
    it.n.style.zIndex = c.id === 'n2' && f > 0 && f < 1 ? '2' : '';
  }
}

const script = {
  id: 'cc-loop-comments',
  css: new URL('../ccloop-comments.0c0f5071.css?v=1', import.meta.url).href,
  ask: 'Keep replying to new comments on my latest video. Answer questions, heart the good ones, remove spam.',
  say: 'On it. I’ll keep checking for new comments until you stop me.',
  rest: [1180, 640],
  tabs: [{ title: 'Comments: AI Agents Are Taking Over', host: 'studio.mevesa.channel', path: '/video/comments', mark: 'M', color: '#6d28d9' }],
  steps: [
    { key: 'r1-check', round: 1, task: 'Checking for new comments', dur: 2.2, tab: 0, page: 'comments', ptr: [{ dt: 0.3, at: '.cm-refresh', click: true }] },
    { key: 'r1-answer', round: 1, task: 'Answering a question', dur: 3.5, tab: 0, page: 'comments', ptr: [{ dt: 0.5, at: '.cm[data-id="n1"] .cm-rb', click: true }, { dt: 2.75, at: '.cm[data-id="n1"] .cm-send', click: true }] },
    { key: 'r1-heart', round: 1, task: 'Hearting the best comments', dur: 2.0, tab: 0, page: 'comments', ptr: [{ dt: 0.45, at: '.cm[data-id="n2"] .cm-heart', click: true }, { dt: 1.15, at: '.cm[data-id="e1"] .cm-heart', click: true }] },
    { key: 'r1-spam', round: 1, task: 'Removing spam', dur: 2.2, tab: 0, page: 'comments', ptr: [{ dt: 0.9, at: '.cm[data-id="n3"] .cm-remove', click: true }] },
    { key: 'r1-done', round: 1, done: true, task: 'Round 1 done: 1 reply, 2 hearts, 1 spam', dur: 1.1, tab: 0, page: 'comments' },
    { key: 'r2-check', round: 2, task: 'Checking for new comments', dur: 2.1, tab: 0, page: 'comments', ptr: [{ dt: 0.3, at: '.cm-refresh', click: true }] },
    { key: 'r2-pin', round: 2, note: true, task: 'Pinning the part 2 comment', dur: 1.9, tab: 0, page: 'comments', ptr: [{ dt: 0.5, at: '.cm[data-id="n2"] .cm-pinb', click: true }] },
    { key: 'r2-answer', round: 2, task: 'Answering a question', dur: 3.2, tab: 0, page: 'comments', ptr: [{ dt: 0.5, at: '.cm[data-id="n4"] .cm-rb', click: true }, { dt: 2.45, at: '.cm[data-id="n4"] .cm-send', click: true }] },
    { key: 'r2-spam', round: 2, task: 'Removing spam', dur: 2.0, tab: 0, page: 'comments', ptr: [{ dt: 0.8, at: '.cm[data-id="n5"] .cm-remove', click: true }] },
    { key: 'r2-done', round: 2, done: true, task: 'Round 2 done: 1 pinned, 1 reply, 1 spam', dur: 1.1, tab: 0, page: 'comments' },
    { key: 'r3-check', round: 3, task: 'Checking for new comments', dur: 2.3, tab: 0, page: 'comments', ptr: [{ dt: 0.3, at: '.cm-refresh', click: true }] },
    { key: 'r3-skip', round: 3, note: true, task: 'Skipping the troll (your note)', dur: 1.6, tab: 0, page: 'comments', ptr: [{ dt: 0.5, at: '.cm[data-id="n7"] .cm-who b' }] },
    { key: 'r3-answer', round: 3, task: 'Answering a question', dur: 3.0, tab: 0, page: 'comments', ptr: [{ dt: 0.5, at: '.cm[data-id="n6"] .cm-rb', click: true }] },
  ],
  tail: 0,
  of: { 3: 5 }, // round 3 is cut off while it answers; hearts and spam would follow
  follow: [
    { at: ['r1-heart', 0.15], ask: 'How many have you answered so far?', reply: '42 replies today, plus 60 hearts. Clearing spam now.' },
    { at: ['r2-check', 0.1], ask: 'Pin the one asking for a part 2.', reply: 'Done, pinning it to the top now.' },
    { at: ['r3-check', 0.1], ask: 'Skip the trolls, don’t reply to them.', reply: 'Got it. Trolls get skipped, no replies.' },
  ],
  pages(x) {
    const item = (c) => `<div class="cm" data-id="${c.id}"><div class="cm-in">
        <span class="cm-pin">${PIN}Pinned by Mevesa</span>
        <div class="cm-row">
          <span class="cm-av" style="background:${c.color}">${x.esc(c.who[1].toUpperCase())}</span>
          <div class="cm-body">
            <div class="cm-who"><b>${x.esc(c.who)}</b><small>${x.esc(c.ago)}</small><em class="cm-new">New</em><em class="cm-flag">Spam</em><em class="cm-skip">Skipped: troll</em></div>
            <p>${x.esc(c.text)}</p>
            <div class="cm-acts"><span class="cm-heart">${HEART}<i>${c.hearts}</i></span><span class="cm-rb">Reply</span><span class="cm-pinb">${PIN}Pin</span><span class="cm-by">${HEART}by Mevesa</span></div>
          </div>
          <span class="cm-remove">Remove</span>
        </div>
        ${REPLIES[c.id] ? `<div class="cm-rep"><div class="cm-rin">
          <img class="cm-me" src="${AVATAR}" width="160" height="160" alt="">
          <div class="cm-box"><span class="cm-typed"></span><span class="cm-rest">${x.esc(REPLIES[c.id])}</span></div>
          <span class="cm-send">Reply</span>
          <div class="cm-posted"><b>@Mevesa</b><em>Creator</em><p>${x.esc(REPLIES[c.id])}</p></div>
        </div></div>` : ''}
      </div></div>`;
    return `<div class="ccl-page cm-page" data-page="comments">
        <header class="cm-top"><img class="cm-avt" src="${AVATAR}" width="160" height="160" alt=""><b>Mevesa</b><span>Comments</span></header>
        <div class="cm-main">
          <aside class="cm-side">
            <div class="cm-video"><img src="${VIDEO}" width="1280" height="720" alt=""><b>AI Agents Are Taking Over the Internet</b><small>12:17 · 1,284 comments</small></div>
            <div class="cm-stats"><h2>Today</h2>
              <div><span>Replied</span><b data-k="replied"></b></div>
              <div><span>Hearted</span><b data-k="hearted"></b></div>
              <div><span>Spam removed</span><b data-k="removed"></b></div>
              <div><span>Pinned</span><b data-k="pinned"></b></div>
            </div>
          </aside>
          <section class="cm-list">
            <div class="cm-bar"><b>Newest first</b><span class="cm-refresh">${REFRESH}<span class="cm-found"></span></span></div>
            <div class="cm-items">${COMMENTS.map(item).join('')}</div>
          </section>
        </div>
      </div>`;
  },
  bind(root) {
    const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
    const items = Object.fromEntries($$('.cm').map((n) => [n.dataset.id, {
      n, pin: n.querySelector('.cm-pin'), isNew: n.querySelector('.cm-new'), flag: n.querySelector('.cm-flag'), skip: n.querySelector('.cm-skip'),
      heart: n.querySelector('.cm-heart'), count: n.querySelector('.cm-heart i'), by: n.querySelector('.cm-by'), remove: n.querySelector('.cm-remove'),
      rep: n.querySelector('.cm-rep'), rin: n.querySelector('.cm-rin'), typed: n.querySelector('.cm-typed'), rest: n.querySelector('.cm-rest'),
      box: n.querySelector('.cm-box'), send: n.querySelector('.cm-send'), posted: n.querySelector('.cm-posted'), shown: -1,
    }]));
    return { items, stats: Object.fromEntries($$('.cm-stats b').map((n) => [n.dataset.k, n])), refresh: $('.cm-refresh svg'), found: $('.cm-found'), last: {} };
  },
  paint(p, t, T) {
    const ev = cues(T);
    paintCounts(p, t, T, ev);
    const pos = Object.fromEntries(COMMENTS.map((c) => [c.id, paintComment(p.items[c.id], c, t, T, ev)]));
    layout(p, t, ev, pos);
  },
};

const loop = makeLoop(script);
export default loop.beat;
export const { LEN, ASK, TYPE_CPS } = loop;
