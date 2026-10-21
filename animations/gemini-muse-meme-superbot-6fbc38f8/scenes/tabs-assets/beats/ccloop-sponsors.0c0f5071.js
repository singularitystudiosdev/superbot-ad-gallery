// The 'cc-loop-sponsors' variant (the computer-control loop engine, ccloop.0c0f5071.js): "Find sponsors for my channel..."
// and superbot works a sponsor pipeline in rounds across the creator's own sheet and mail. Round 1 finds three brands that
// fit (they fill the sheet's empty rows with a fit score), writes the pitch, sends it to all three and logs them Pitched.
// Round 2 checks the inbox: Packwise answers with $1,500 for a 60-second spot; "Any replies yet?" is answered above the
// card, "Don't go under $2,000 per video." becomes the note step (superbot counters at $2,000, the HUD ringed violet), the
// offer is logged and the oldest pitch gets a follow-up. Round 3 finds Packwise's yes and is logging the deal at $2,000
// when the spot ends. The sheet's active-cell outline walks to each cell superbot writes, and the formula bar shows it.
// The channel is Mevesa (the yt-thumbnail cut's creator); every brand, message and amount is made up for the demo, and the
// sheet and mail are drawn here at the desk's px, naming no real product. Its page styles are ../ccloop-sponsors.0c0f5071.css.
import { seg, outCubic, press, streamCount } from '../../../lib.9b47fc30.js';
import { makeLoop } from './ccloop.0c0f5071.js?v=1';

const BRANDS = [
  { id: 'orbit', name: 'Orbitdesk', what: 'standing desks', color: '#0f766e', fit: '82%' },
  { id: 'code', name: 'Codelane', what: 'coding course', color: '#b45309', fit: '79%' },
  { id: 'pack', name: 'Packwise', what: 'travel backpacks', color: '#2563eb', fit: '94%', found: 0.6 },
  { id: 'leaf', name: 'Nimbleleaf', what: 'notes app', color: '#16a34a', fit: '91%', found: 1.05 },
  { id: 'luma', name: 'Lumacast', what: 'creator lights', color: '#db2777', fit: '88%', found: 1.5 },
];
const FILLER = 4; // empty sheet rows under the brands
// each cell write: [brand, column, value, step key, seconds into it]; status values pick the pill's colour
const WRITES = [
  ['pack', 'st', 'Pitched', 'r1-log', 0.35], ['leaf', 'st', 'Pitched', 'r1-log', 0.75], ['luma', 'st', 'Pitched', 'r1-log', 1.15],
  ['pack', 'touch', 'Today', 'r1-log', 0.35], ['leaf', 'touch', 'Today', 'r1-log', 0.75], ['luma', 'touch', 'Today', 'r1-log', 1.15],
  ['pack', 'st', 'Negotiating', 'r2-log', 0.35], ['pack', 'offer', '$1,500 → $2,000', 'r2-log', 0.85],
  ['orbit', 'st', 'Followed up', 'r2-follow', 2.2],
  ['pack', 'st', 'Deal', 'r3-log', 0.5], ['pack', 'offer', '$2,000', 'r3-log', 1.0],
];
const START = { orbit: { st: 'Pitched', offer: '', touch: '4 days ago' }, code: { st: 'Declined', offer: '', touch: '1 week ago' } };
const PITCH = {
  subject: 'Sponsorship: Mevesa, 1.9M subscribers',
  body: 'Hi Packwise team, I make videos about AI for 1.9M subscribers, and a lot of them work on the go. Could we talk about a 60-second integration this month?',
};
const FOLLOW = { subject: 'Re: Sponsorship on Mevesa', body: 'Hi again! Floating this back up. Happy to share audience numbers if that helps.' };
const COUNTER = 'Thanks! For a 60-second integration my rate is $2,000. Happy to send dates.';

const script = {
  id: 'cc-loop-sponsors',
  css: new URL('../ccloop-sponsors.0c0f5071.css?v=1', import.meta.url).href,
  ask: 'Find sponsors for my channel. Pitch brands that fit, log every reply in my sheet, and follow up until they answer.',
  say: 'On it. I’ll keep working the list until you stop me.',
  rest: [1100, 640],
  tabs: [
    { title: 'Sponsor pipeline', host: 'sheets.mevesa.channel', path: '/sponsors', mark: 'S', color: '#16a34a' },
    { title: 'Mail', host: 'mail.mevesa.channel', path: '/inbox', mark: 'M', color: '#2563eb' },
  ],
  steps: [
    { key: 'r1-find', round: 1, task: 'Finding brands that fit', dur: 2.8, tab: 0, page: 'sheet', ptr: [{ dt: 0.75, at: '.sp-row[data-b="pack"] .sp-fit' }, { dt: 1.2, at: '.sp-row[data-b="leaf"] .sp-fit' }, { dt: 1.65, at: '.sp-row[data-b="luma"] .sp-fit' }] },
    { key: 'r1-pitch', round: 1, task: 'Writing the pitch', dur: 3.2, tab: 1, page: 'compose', ptr: [{ dt: 0.4, at: '.sp-subj' }] },
    { key: 'r1-send', round: 1, task: 'Sending to 3 brands', dur: 1.5, tab: 1, page: 'compose', ptr: [{ dt: 0.35, at: '.sp-send', click: true }] },
    { key: 'r1-log', round: 1, task: 'Logging it in your sheet', dur: 1.9, tab: 0, page: 'sheet', ptr: [{ dt: 0.3, at: '.sp-row[data-b="pack"] .sp-st' }, { dt: 0.7, at: '.sp-row[data-b="leaf"] .sp-st' }, { dt: 1.1, at: '.sp-row[data-b="luma"] .sp-st' }] },
    { key: 'r1-done', round: 1, done: true, task: 'Round 1 done: 3 brands pitched', dur: 1.1, tab: 0, page: 'sheet' },
    { key: 'r2-check', round: 2, task: 'Checking for replies', dur: 2.4, tab: 1, page: 'inbox', ptr: [{ dt: 0.3, at: '.sp-inav', click: true }] },
    { key: 'r2-read', round: 2, task: 'Reading Packwise’s offer', dur: 2.9, tab: 1, page: 'inbox', ptr: [{ dt: 0.4, at: '.sp-msg[data-m="offer"]', click: true }, { dt: 1.4, at: '.sp-m1 mark' }] },
    { key: 'r2-counter', round: 2, note: true, task: 'Countering at $2,000 (your floor)', dur: 3.2, tab: 1, page: 'inbox', ptr: [{ dt: 2.55, at: '.sp-rsend', click: true }] },
    { key: 'r2-log', round: 2, task: 'Logging the offer', dur: 1.7, tab: 0, page: 'sheet', ptr: [{ dt: 0.3, at: '.sp-row[data-b="pack"] .sp-st' }, { dt: 0.8, at: '.sp-row[data-b="pack"] .sp-offer' }] },
    { key: 'r2-follow', round: 2, task: 'Following up with Orbitdesk', dur: 2.6, tab: 1, page: 'compose', ptr: [{ dt: 1.9, at: '.sp-send', click: true }] },
    { key: 'r2-done', round: 2, done: true, task: 'Round 2 done: 1 counter, 1 follow-up', dur: 1.1, tab: 0, page: 'sheet' },
    { key: 'r3-check', round: 3, task: 'Checking for replies', dur: 2.6, tab: 1, page: 'inbox', ptr: [{ dt: 0.3, at: '.sp-inav', click: true }, { dt: 1.3, at: '.sp-msg[data-m="deal"]', click: true }] },
    { key: 'r3-log', round: 3, task: 'Logging the deal', dur: 2.4, tab: 0, page: 'sheet', ptr: [{ dt: 0.45, at: '.sp-row[data-b="pack"] .sp-st' }, { dt: 0.95, at: '.sp-row[data-b="pack"] .sp-offer' }] },
  ],
  tail: 0,
  of: { 3: 4 }, // round 3 is cut off while it logs; it would follow up and look for more brands
  follow: [
    { at: ['r1-pitch', 0.5], ask: 'Who are you pitching first?', reply: 'Brands that already sponsor channels like yours: Packwise, Nimbleleaf and Lumacast.' },
    { at: ['r2-check', 1.0], ask: 'Any replies yet?', reply: 'One so far: Packwise offered $1,500 for a 60-second spot.' },
    { at: ['r2-read', 0.85], ask: 'Don’t go under $2,000 per video.', reply: 'Got it. I’ll counter at $2,000.' },
  ],
  pages(x) {
    const cols = ['st', 'offer', 'touch'];
    const row = (b, i) => `<div class="sp-row" data-b="${b.id}"><span class="sp-n">${i + 2}</span>
        <span class="sp-brand"><i style="background:${b.color}">${b.name[0]}</i>${x.esc(b.name)}<small>${x.esc(b.what)}</small></span>
        <span class="sp-fit">${b.fit}</span>${cols.map((c) => `<span class="sp-${c}"><em></em></span>`).join('')}</div>`;
    const top = (title, sub, cls) => `<header class="sp-top"><i class="sp-ico ${cls}"></i><b>${title}</b><span>${sub}</span></header>`;
    const nav = `<nav class="sp-nav"><span class="sp-cbtn">Compose</span><span class="sp-inav">Inbox<i></i></span><span>Sent</span><span>Drafts</span></nav>`;
    return `<div class="ccl-page sp-page" data-page="sheet">
        ${top('Sponsor pipeline', 'Mevesa · 2026', 'sp-ico-sheet')}
        <div class="sp-fx"><i>fx</i><span class="sp-fxv"></span></div>
        <div class="sp-grid">
          <div class="sp-row sp-letters"><span></span><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span></div>
          <div class="sp-row sp-hrow"><span class="sp-n">1</span><span>Brand</span><span>Fit</span><span>Status</span><span>Offer</span><span>Last touch</span></div>
          ${BRANDS.map(row).join('')}
          ${Array.from({ length: FILLER }, (_, i) => `<div class="sp-row sp-empty"><span class="sp-n">${BRANDS.length + 2 + i}</span><span></span><span></span><span></span><span></span><span></span></div>`).join('')}
          <i class="sp-sel"></i>
        </div>
      </div>
      <div class="ccl-page sp-page" data-page="compose">
        ${top('Mail', 'Mevesa', 'sp-ico-mail')}
        <div class="sp-mail">${nav}
          <section class="sp-compose">
            <div class="sp-f"><label>To</label><span class="sp-chip"></span><span class="sp-more"></span></div>
            <div class="sp-f"><label>Subject</label><span class="sp-subj"></span></div>
            <p class="sp-body"><span class="sp-typed"></span><span class="sp-rest"></span></p>
            <div class="sp-cfoot"><span class="sp-send">Send</span><span class="sp-sent"></span></div>
          </section>
        </div>
      </div>
      <div class="ccl-page sp-page" data-page="inbox">
        ${top('Mail', 'Mevesa', 'sp-ico-mail')}
        <div class="sp-mail">${nav}
          <section class="sp-ilist">
            <div class="sp-msg" data-m="deal"><b>Packwise Partnerships</b><small>now</small><span>Re: Sponsorship on Mevesa</span><p>Deal at $2,000. Sending the contract today!</p></div>
            <div class="sp-msg" data-m="offer"><b>Packwise Partnerships</b><small>9:41</small><span>Re: Sponsorship on Mevesa</span><p>Love the channel! Could you do a 60-second integration for $1,500?</p></div>
            <div class="sp-msg sp-old"><b>Nimbleleaf</b><small>Yesterday</small><span>Re: Sponsorship on Mevesa</span><p>Thanks, we’ll review and get back to you.</p></div>
            <div class="sp-msg sp-old"><b>Orbitdesk</b><small>Mon</small><span>Automatic reply</span><p>I’m out of the office until Monday.</p></div>
          </section>
          <section class="sp-read">
            <div class="sp-m sp-m1"><h2>Re: Sponsorship on Mevesa</h2><b>Packwise Partnerships</b>
              <p>Hi! Love the channel. Could you do a 60-second integration in your next video for <mark>$1,500</mark>?</p>
              <div class="sp-reply"><p><span class="sp-rtyped"></span><span class="sp-rrest">${x.esc(COUNTER)}</span></p><span class="sp-rsend">Send</span><span class="sp-rsent">✓ Sent</span></div>
            </div>
            <div class="sp-m sp-m2"><h2>Re: Sponsorship on Mevesa</h2><b>Packwise Partnerships</b>
              <p><mark>Deal at $2,000.</mark> Sending the contract today, excited to work together!</p>
            </div>
          </section>
        </div>
      </div>`;
  },
  bind(root) {
    const $ = (s) => root.querySelector(s);
    const cells = Object.fromEntries(BRANDS.map((b) => {
      const r = $(`.sp-row[data-b="${b.id}"]`);
      return [b.id, { row: r, st: r.querySelector('.sp-st em'), offer: r.querySelector('.sp-offer em'), touch: r.querySelector('.sp-touch em'), stCell: r.querySelector('.sp-st'), offerCell: r.querySelector('.sp-offer'), touchCell: r.querySelector('.sp-touch') }];
    }));
    return {
      cells, sel: $('.sp-sel'), fxv: $('.sp-fxv'), chip: $('.sp-chip'), more: $('.sp-more'), subj: $('.sp-subj'), typed: $('.sp-typed'), rest: $('.sp-rest'),
      send: $('.sp-send'), sent: $('.sp-sent'), inav: $('.sp-inav i'), deal: $('.sp-msg[data-m="deal"]'), offer: $('.sp-msg[data-m="offer"]'),
      m1: $('.sp-m1'), m2: $('.sp-m2'), rtyped: $('.sp-rtyped'), rrest: $('.sp-rrest'), rsend: $('.sp-rsend'), rsent: $('.sp-rsent'),
      last: {},
    };
  },
  paint(p, t, T) {
    paintSheet(p, t, T);
    paintCompose(p, t, T);
    paintInbox(p, t, T);
  },
};

// set a node's text only when it changes
function text(p, key, n, value) { if (p.last[key] !== value) { n.textContent = value; p.last[key] = value; } }

// the sheet: the found brands fade into their rows, each write lands in its cell under the active-cell outline (the
// outline glides to the cell first) with a short flash, and the formula bar shows the cell's value
function paintSheet(p, t, T) {
  const S = T.S;
  for (const b of BRANDS) {
    const c = p.cells[b.id], o = b.found === undefined ? 1 : outCubic(seg(t, S['r1-find'].a + b.found, S['r1-find'].a + b.found + 0.35));
    c.row.style.setProperty('--sp-in', o.toFixed(3));
    const vals = { st: '', offer: '', touch: '', ...(START[b.id] || {}), ...(o > 0 && b.found !== undefined ? { st: 'Researching' } : {}) };
    for (const [id, col, value, key, dt] of WRITES) if (id === b.id && t >= S[key].a + dt) vals[col] = value;
    text(p, `${b.id}.st`, c.st, vals.st);
    c.st.dataset.s = vals.st;
    text(p, `${b.id}.offer`, c.offer, vals.offer);
    text(p, `${b.id}.touch`, c.touch, vals.touch);
  }
  const done = WRITES.filter(([, , , key, dt]) => t >= S[key].a + dt - 0.25);
  const w = done[done.length - 1];
  if (!w) { p.sel.style.opacity = '0'; text(p, 'fx', p.fxv, ''); return; }
  const [id, col, value, key, dt] = w, at = S[key].a + dt;
  const cell = p.cells[id][`${col}Cell`], prev = done[done.length - 2];
  const from = prev ? p.cells[prev[0]][`${prev[1]}Cell`] : cell, f = outCubic(seg(t, at - 0.25, at - 0.05));
  const box = (n) => ({ x: n.offsetLeft, y: n.offsetTop, w: n.offsetWidth, h: n.offsetHeight }); // in .sp-grid's px
  const a = box(from), b = box(cell), lx = (k) => a[k] + (b[k] - a[k]) * f;
  p.sel.style.opacity = '1';
  p.sel.style.transform = `translate(${lx('x').toFixed(2)}px, ${lx('y').toFixed(2)}px)`;
  p.sel.style.width = `${lx('w').toFixed(2)}px`;
  p.sel.style.height = `${lx('h').toFixed(2)}px`;
  p.sel.style.setProperty('--sp-flash', (1 - seg(t, at, at + 0.8)).toFixed(3));
  text(p, 'fx', p.fxv, t >= at ? value : '');
}

// the compose window: round 1's pitch to the three brands, round 2's follow-up to Orbitdesk; Send, then the sent note
function paintCompose(p, t, T) {
  const S = T.S, follow = t >= S['r2-follow'].a;
  const m = follow ? FOLLOW : PITCH, a = follow ? S['r2-follow'].a : S['r1-pitch'].a;
  const sendAt = follow ? T.clicks['r2-follow'][0] : T.clicks['r1-send'][0];
  text(p, 'chip', p.chip, follow ? 'Orbitdesk Partnerships' : 'Packwise Partnerships');
  text(p, 'more', p.more, follow ? '' : '+2 more, each one personalized');
  text(p, 'subj', p.subj, m.subject.slice(0, streamCount(m.subject, a + 0.15, 60, t)));
  const n = streamCount(m.body, a + 0.55, follow ? 60 : 62, t);
  text(p, 'typed', p.typed, m.body.slice(0, n));
  text(p, 'rest', p.rest, m.body.slice(n));
  p.send.style.transform = `scale(${(1 - 0.06 * press(t, sendAt)).toFixed(4)})`;
  text(p, 'sent', p.sent, follow ? '✓ Follow-up sent' : '✓ 3 pitches sent');
  p.sent.style.opacity = outCubic(seg(t, sendAt + 0.15, sendAt + 0.4)).toFixed(3);
}

// the inbox: Packwise's offer arrives in round 2 and opens; the counter types and sends; the yes arrives in round 3
function paintInbox(p, t, T) {
  const S = T.S;
  const offerIn = S['r2-check'].a + 0.9, dealIn = S['r3-check'].a + 0.9;
  const openOffer = T.clicks['r2-read'][0], openDeal = T.clicks['r3-check'][1];
  for (const [n, at] of [[p.offer, offerIn], [p.deal, dealIn]]) {
    const o = outCubic(seg(t, at, at + 0.4));
    n.style.setProperty('--sp-in', o.toFixed(3));
  }
  p.offer.classList.toggle('is-unread', t >= offerIn && t < openOffer);
  p.offer.classList.toggle('is-open', t >= openOffer && t < openDeal);
  p.deal.classList.toggle('is-unread', t >= dealIn && t < openDeal);
  p.deal.classList.toggle('is-open', t >= openDeal);
  const unread = (t >= offerIn && t < openOffer ? 1 : 0) + (t >= dealIn && t < openDeal ? 1 : 0);
  text(p, 'inav', p.inav, unread ? String(unread) : '');
  const m1 = outCubic(seg(t, openOffer + 0.1, openOffer + 0.4)) * (1 - outCubic(seg(t, openDeal + 0.1, openDeal + 0.4)));
  p.m1.style.opacity = m1.toFixed(3);
  p.m2.style.opacity = outCubic(seg(t, openDeal + 0.1, openDeal + 0.4)).toFixed(3);
  const ca = S['r2-counter'].a, send = T.clicks['r2-counter'][0];
  const n = streamCount(COUNTER, ca + 0.3, 36, t);
  text(p, 'rtyped', p.rtyped, COUNTER.slice(0, n));
  text(p, 'rrest', p.rrest, COUNTER.slice(n));
  p.rsend.style.transform = `scale(${(1 - 0.06 * press(t, send)).toFixed(4)})`;
  p.rsend.style.opacity = t >= send + 0.2 ? '0' : '1';
  p.rsent.style.opacity = outCubic(seg(t, send + 0.15, send + 0.4)).toFixed(3);
}

const loop = makeLoop(script);
export default loop.beat;
export const { LEN, ASK, TYPE_CPS } = loop;
