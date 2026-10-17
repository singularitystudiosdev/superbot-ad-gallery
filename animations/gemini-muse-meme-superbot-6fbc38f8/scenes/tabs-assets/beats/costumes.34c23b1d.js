// Costumes beat (the 'amazon-costumes' variant): the multicat-credits cut's bare chat (no model on show: no routing
// chips, no reply header, the composer on Superbot throughout; the engine routes it so, chat.9b47fc30.js) asked "Search on
// amazon and find me the cheapest and most fun halloween costumes". superbot answers with an Amazon results page rebuilt
// in the bakery artifact frame (bakery.005f5570.css .bk):
//   1. the frame rises with the query typing into Amazon's search box, six skeleton tiles shimmer while the search runs,
//      its bottom left pill counting the agent's elapsed time fast-forwarded x50 (X, GEN; the frame's x50 badge says so)
//      and the bar counting the listings compared (LISTINGS);
//   2. six real listings land one by one in price order, cheapest first (img/costumes.34c23b1d/CREDITS.txt: titles,
//      prices, ratings and photos as Amazon listed them), then two verdicts pop: Cheapest on the crayon, Most fun on the
//      ride-on T-rex;
//   3. the house superbot.gg end card (the 16:9 cuts' ending, as the multicat cut draws it) covers the chat.
// Under it runs the multicat-credits cut's default soundtrack, 16 · Punchy premium groove (multicat-score.96834de7.js),
// re-cued to this answer: the groove under the ask and the search, a hit as the results land, a bell on Cheapest, the big
// hit and clear on Most fun, then the build into the end card. A pure function of t, except the score, which follows the
// clock and never drives it. Its stylesheet (../costumes.34c23b1d.css) loads with the module.
import { clamp, lerp, seg, outCubic, outQuint, outBack, streamCount } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';
import { LAND, landing, shimmer, settle } from './thumb-land.309eb9c5.js';
import { loadSheet as loadFrameSheet } from './bakery.005f5570.js?v=3';
// the Share control every output card carries (share.29a362ea.js)
import { shareBtn } from './share.29a362ea.js';
// v16 on the Music pill, this variant's default (music.47e5d94a.js DEFAULTS): the same specifiers multicat imports, so
// one player registry and one music pick
import { music } from '../../../music.47e5d94a.js?v=2';
import { makePlayer } from './multicat-player.96834de7.js?v=4';

const CSS = new URL('../costumes.34c23b1d.css?v=1', import.meta.url).href;
export const ID = 'amazon-costumes';
const asset = (p) => new URL('../../../' + p, import.meta.url).href;
const pic = (f) => asset(`img/costumes.34c23b1d/${f}`);
// the search the page shows, and the one its View on Amazon button opens
const QUERY = 'funny halloween costumes';
const SEARCH = 'https://www.amazon.com/s?k=funny+halloween+costumes';
const SAY = 'Here are the cheapest, most fun Halloween costumes on Amazon.';

export const TYPE_CPS = 55; // the ask types at this rate (the route's typeCps, chat.9b47fc30.js), as the multicat asks do
// the search runs fast-forwarded X times: its pill counts GEN real seconds at X times the spot's clock, so the skeleton
// holds GEN / X seconds. GEN: five Amazon searches and their result pages read and ranked (CREDITS.txt), about 45 s for
// a browsing agent
const X = 50, GEN = 45;
const FF_IN = 0.2;       // the frame's badge fades in over this, full as the search starts
const SEEN = 0.45;       // the card's rise and the feed's glide to it; the search starts once it is in view
const LISTINGS = 240;    // unique listings the five searches returned (CREDITS.txt), counted up while the search runs
// the query types into the search box this long after the card comes in, at this rate, done as the search starts (SEEN)
const Q_AT = 0.08, Q_CPS = 70;
const STAGGER = 0.12;    // the tiles land one after another, cheapest first
const BADGE_IN = 0.42;   // a verdict's pop
// the landed page, from its last tile's settle to the end card covering the chat: the score's three bars run from the
// send to the cover (multicat-score.96834de7.js bed, its grid locked to `play`, here the cover), so this puts the cover
// 6.02 s after the send and the first tile's landing on bar 2's downbeat
const HOLD = 3.12;
// the house end card (superbot-muse-split.1d16d488/endcard.1d16d488.html, the 16:9 cuts' ending): the chat fades to its
// black over END_IN, the card's own 2.5s run starts END_DELAY in (mascot pops in, superbot.gg fades up beside it, hold)
const END_IN = 0.45, END_DELAY = 0.3, END_LEN = 2.5;
const END_GAP = 44; // the house card's gap between the wordmark and the 220px face, on a 1080-high stage
// the card's pop: an outBack with the house card's softer overshoot (1.4)
const popBack = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
// the mascot face, verbatim from the house end card: the superbot cat's mask over its cyan and magenta offsets
const END_FACE = '<svg class="amc-end-face" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><mask id="amcEndFace" maskUnits="userSpaceOnUse" x="-30" y="-30" width="160" height="160"><g fill="#fff"><rect x="14" y="32" width="72" height="54" rx="15"/><path d="M14 46V28Q14 20 21 21Q28 24 36 32Z"/><path d="M86 46V28Q86 20 79 21Q72 24 64 32Z"/></g><g fill="#000"><ellipse cx="35" cy="58" rx="8" ry="11"/><ellipse cx="65" cy="58" rx="8" ry="11"/></g></mask></defs><rect x="-30" y="-30" width="160" height="160" fill="#00e5c3" mask="url(#amcEndFace)" transform="translate(-1.2 -1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#c026d3" mask="url(#amcEndFace)" transform="translate(1.2 1.2)"/><rect x="-30" y="-30" width="160" height="160" fill="#fff" mask="url(#amcEndFace)"/></svg>';

// the six picks in the order they land, cheapest first: Amazon's own title, price, star rating and rating count, read
// 2026-10-17 (CREDITS.txt). `badge`: superbot's verdict on the tile
const ITEMS = [
  { asin: 'B0H93H74JX', file: 'crayon.jpg', w: 451, h: 480, price: '$7.99', rating: 4.6, count: '15', badge: 'cheap',
    title: 'Adult Crayon Costume Set with Inflatable Crayon Prop, Funny Halloween Costume with Apron and Cone Hat' },
  { asin: 'B0GWM4NNYP', file: 'banana.jpg', w: 317, h: 480, price: '$16.99', rating: 4.5, count: '4.4K',
    title: 'Spooktacular Creations Appealing Banana Costume Adult Deluxe Set for Halloween Dress Up Party and Roleplay Cosplay' },
  { asin: 'B07NV6GV63', file: 'hotdog.jpg', w: 294, h: 480, price: '$19.98', rating: 4.4, count: '304',
    title: 'Unisex Adult Hot Dog Fancy Jumpsuit' },
  { asin: 'B0D7V3B7SY', file: 'trex.jpg', w: 343, h: 480, price: '$19.99', rating: 4.4, count: '309', badge: 'fun',
    title: 'Inflatable Dinosaur Costume Adults, Inflatable Halloween Costumes, Ride on Dino Costume, Blow Up T-rex Costume' },
  { asin: 'B07W45HH8M', file: 'plug.jpg', w: 384, h: 480, price: '$19.99', rating: 4.3, count: '1.9K',
    title: 'Spooktacular Creations Plug and Socket Halloween Costume Adult, Plug and Outlet Couples USB Costume' },
  { asin: 'B09ZQV2ZHW', file: 'chicken.jpg', w: 371, h: 480, price: '$24.99', rating: 4.6, count: '1.8K',
    title: 'KOOY Inflatable Chicken Costume Adult, Inflatables Rooster Costume Women/Men for Party' },
];
const BADGES = { cheap: 'Cheapest', fun: 'Most fun' };

// every time in the answer, from the reply r: the card comes in at `card`, the search runs from `gen0` until `done`, the
// tiles land from `done` STAGGER apart and have settled by `w1`, the verdicts pop at `badges`, and the end card covers the
// chat from `cut`
function plan(r) {
  const card = r + 0.22, gen0 = card + SEEN, done = gen0 + GEN / X;
  const lands = ITEMS.map((_, i) => done + i * STAGGER);
  const w1 = lands[lands.length - 1] + LAND;
  const cut = w1 + HOLD;
  return { r, card, gen0, done, lands, w1, badges: { cheap: w1 + 0.08, fun: w1 + 0.38 }, cut, end: cut + END_DELAY + END_LEN };
}
// the answer's length from its reply: the route's `extra` stretches the loop by what this runs past the base beat
export const LEN = plan(0).end;

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const STAR = 'M6 .8l1.55 3.3 3.6.45-2.65 2.5.68 3.57L6 8.85 2.82 10.62l.68-3.57L.85 4.55l3.6-.45z';
const stars = (cls, style = '') => `<svg class="${cls}" viewBox="0 0 60 12" aria-hidden="true"${style}>${[0, 1, 2, 3, 4].map((i) => `<path transform="translate(${i * 12} 0)" d="${STAR}"/>`).join('')}</svg>`;
// a rating's stars: the outlines, then the filled set clipped to the rating's share of five
const rated = (r) => stars('amc-s0') + stars('amc-s1', ` style="clip-path: inset(0 ${(100 - r * 20).toFixed(1)}% 0 0)"`);
const GLASS = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>';
// a price as Amazon sets it: the dollars large, the sign and the cents raised small
const priceHtml = (p) => { const [d, c] = p.slice(1).split('.'); return `<sup>$</sup>${d}<sup>${c}</sup>`; };

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`amazon-costumes variant stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

// a block's entrance: it rises and settles in over 0.45s from `at` (the other beats' card entrance)
function enter(n, t, at) {
  const ci = outCubic(seg(t, at, at + 0.45));
  n.style.opacity = ci.toFixed(3);
  n.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
  return ci;
}
const fade = (n, p) => { n.style.opacity = p.toFixed(3); n.style.visibility = p > 0 ? '' : 'hidden'; };

export default {
  // `end` (the base route's end plus `extra`) is LEN past r by construction, so the answer keeps its own clock
  times(r) { return plan(r); },
  build(k, x) {
    loadSheet();
    loadFrameSheet();
    const T = k.T;

    // v16: rendered from this answer's cue sheet (the engine's ask, k, and this plan, T); the score's slots for the
    // multicat chain's beats take this one's: the photo's hit as the first tile lands, the order's bell on Cheapest, the
    // model's big hit (and the clear to the next bar) on Most fun, and the song's play press at the end card's cover,
    // where the bed stops
    const v16 = makePlayer({
      typing: [{ text: k.askBy[ID], s: k.s, end: k.typeEnd }],
      sends: [k.send],
      camera: k.send, // the first send drops the composer and pulls the camera out (tabs.9b47fc30.js)
      resolved: [],
      cards: [T.card],
      gens: [[T.gen0, T.done]],
      image: T.done, model: T.badges.fun, order: T.badges.cheap, play: T.cut,
      cover: T.cut, pop: T.cut + END_DELAY, word: T.cut + END_DELAY + 0.3, end: T.end,
    }, ID);
    addEventListener('variantchange', () => v16.stop());

    // the streamed line the reply opens with: the visible prefix, the rest held in place transparent
    const say = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(SAY)}</span></div>`);

    const tiles = ITEMS.map((it) => `<div class="amc-tile"${it.badge ? ` data-badge="${it.badge}"` : ''}>
        <div class="amc-pic"><img src="${pic(it.file)}" width="${it.w}" height="${it.h}" alt="${x.esc(it.title)}"/><i class="amc-sk"></i>${it.badge ? `<b class="amc-badge amc-b-${it.badge}">${BADGES[it.badge]}</b>` : ''}</div>
        <div class="amc-info">
          <div class="amc-t">${x.esc(it.title)}</div>
          <div class="amc-r"><span>${it.rating.toFixed(1)}</span><span class="amc-stars">${rated(it.rating)}</span><span class="amc-rc">(${it.count})</span></div>
          <div class="amc-p">${priceHtml(it.price)}</div>
          <div class="amc-skl" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
        ${it.badge ? '<i class="amc-ring" aria-hidden="true"></i>' : ''}
      </div>`).join('');
    const media = x.el(`<div class="bk amc"><div class="bk-head"><b class="bk-title">Halloween costumes<small>6 picks · cheapest first</small></b>${shareBtn('Halloween costumes on Amazon', { url: SEARCH })}<a class="bk-btn bk-publish amc-open" href="${SEARCH}" target="_blank" rel="noopener noreferrer">View on<img src="${x.brand('amazon-wordmark.svg')}" alt="Amazon"></a></div>
      <div class="bk-view amc-view">
        <div class="amc-nav"><img class="amc-logo" src="${x.brand('amazon-wordmark-white.svg')}" alt="Amazon"/><span class="amc-search"><span class="amc-q"></span><i class="amc-caret"></i><span class="amc-go">${GLASS}</span></span></div>
        <div class="amc-bar"><span>Compared <b class="amc-n">0</b> listings</span><span class="amc-sort">Sort by: Price: Low to High</span></div>
        <div class="amc-grid">${tiles}</div>
        <span class="qc-genl amc-genl">Searching Amazon<b class="qc-genn">${clock(0)}</b></span>
      </div></div>`);
    // the feed glides to a zero-height anchor a little under the card instead of the card's own bottom, so the card clears
    // the feed's clip with its edge and shadow (as the multicat-credits cut does, ../costumes.34c23b1d.css .amc-anchor)
    const anchor = x.el('<i class="amc-anchor" aria-hidden="true"></i>');
    const $ = (s) => media.querySelector(s);
    const q = $('.amc-q'), caret = $('.amc-caret'), count = $('.amc-n'), pill = $('.qc-genl'), num = $('.qc-genn');
    const tileEls = [...media.querySelectorAll('.amc-tile')].map((n) => ({
      img: n.querySelector('.amc-pic img'), sk: n.querySelector('.amc-sk'), info: n.querySelector('.amc-info'),
      text: [...n.querySelectorAll('.amc-t, .amc-r, .amc-p')], skl: n.querySelector('.amc-skl'),
      badge: n.querySelector('.amc-badge'), ring: n.querySelector('.amc-ring'), kind: n.dataset.badge,
    }));
    // Space and Enter press the card's controls, not the spot's clock (timeline.9b47fc30.js), as on the other beats
    media.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('a, button')) e.stopPropagation(); });

    // the end card: the house superbot.gg lockup, the wordmark left and the mascot face right, over the spot's black. It
    // rides in nodes (so other variants hide it) and moves to the scene section on the first render, above the hub
    const endCard = x.el(`<div class="amc-end" role="img" aria-label="superbot.gg"><div class="amc-end-word"><b>superbot.gg</b></div><div class="amc-end-bot">${END_FACE}</div></div>`);
    const endWord = endCard.querySelector('.amc-end-word'), endBot = endCard.querySelector('.amc-end-bot');
    // the fast-forward badge, x50 over the whole frame's bottom right while the search runs; it moves as the end card does
    const ff = x.el(`<div class="amc-ff" aria-hidden="true">x${X}</div>`);
    let endK = 1; // the lockup's scale now applied (--k)

    let placed = false, decoding = false, said = -1, typed = -1, shownN = -1, shownClock = clock(0), pillOp = '';
    return {
      nodes: [say, media, anchor, endCard, ff],
      // the feed's fold glides to each element's bottom as it lands (chat.9b47fc30.js scrollOf)
      marks: [[T.r, say], [T.card, anchor]],
      render(t) {
        if (!placed) {
          // the end card and the badge leave the hub for the scene section: stage px, unscaled by the hub's camera
          x.hub.closest('.scene').append(endCard, ff);
          placed = true;
        }
        if (!decoding) {
          decoding = true;
          for (const n of tileEls) track(n.img.decode().catch((e) => console.error(new Error(`amazon-costumes image failed to decode: ${n.img.src}`, { cause: e }))));
        }

        // the reply's line streams in
        const c = streamCount(SAY, T.r + 0.06, 70, t);
        if (c !== said) { say.firstElementChild.textContent = SAY.slice(0, c); say.lastElementChild.textContent = SAY.slice(c); said = c; }

        // 1. the frame rises, the query types into the search box, the search runs under skeleton tiles
        enter(media, t, T.card);
        const qn = Math.round(QUERY.length * seg(t, T.card + Q_AT, T.card + Q_AT + QUERY.length / Q_CPS));
        if (qn !== typed) { q.textContent = QUERY.slice(0, qn); typed = qn; }
        // the caret blinks in the box until the search is sent
        caret.style.opacity = t < T.gen0 && (t - T.card) % 0.5 < 0.3 ? '1' : '0';
        const n = Math.round(LISTINGS * seg(t, T.gen0, T.done));
        if (n !== shownN) { count.textContent = String(n); shownN = n; }
        // the pill counts the search's real seconds X times the clock's rate, rests on GEN once done, and fades as the
        // first tile lands (it sits over the second row's first tile); the frame's badge shows while it generates
        const s = clock(t >= T.done ? GEN : Math.max(0, t - T.gen0) * X);
        if (s !== shownClock) { num.textContent = s; shownClock = s; }
        const out = 1 - seg(t, T.done, T.done + 0.25), o = out.toFixed(3);
        if (o !== pillOp) { pill.style.opacity = o; pillOp = o; }
        fade(ff, seg(t, T.gen0 - FF_IN, T.gen0) * out);

        // 2. the tiles land in price order, each as a thumbnail does (thumb-land.309eb9c5.js); their lines replace the
        // skeleton bars as they do
        tileEls.forEach((tl, i) => {
          const p = landing(t, T.lands[i]);
          shimmer(tl.sk, t, T.card, i, p);
          settle(tl.img, p);
          const ps = p.toFixed(3);
          for (const n of tl.text) n.style.opacity = ps;
          tl.skl.style.opacity = (1 - p).toFixed(3);
          if (!tl.badge) return;
          // the verdict pops in with its ring around the tile
          const b = seg(t, T.badges[tl.kind], T.badges[tl.kind] + BADGE_IN);
          tl.badge.style.opacity = clamp(b * 2.5).toFixed(3);
          tl.badge.style.transform = b >= 1 ? 'none' : `scale(${lerp(0.4, 1, outBack(b)).toFixed(4)})`;
          tl.ring.style.opacity = outCubic(b).toFixed(3);
          tl.ring.style.transform = b >= 1 ? 'none' : `scale(${lerp(1.06, 1, outCubic(b)).toFixed(4)})`;
        });

        // the score follows the clock while it is the pick
        if (music() === 'v16') v16.sync(t); else v16.stop();

        // 3. the end card: the chat fades to black, then the house card's own run (endcard.1d16d488.html render(t))
        const cover = seg(t, T.cut, T.cut + END_IN);
        endCard.style.opacity = cover.toFixed(3);
        endCard.style.visibility = cover > 0 ? '' : 'hidden';
        if (cover > 0) {
          const tc = t - (T.cut + END_DELAY);
          const W = endCard.clientWidth, H = endCard.clientHeight;
          // the house sizes on a 1080-high stage, scaled down (--k) only when a narrow ratio would crop the lockup
          const natW = endWord.offsetWidth / endK;
          const k2 = Math.min(1, (W * 0.86) / (natW + END_GAP + 220));
          if (k2 !== endK) { endCard.style.setProperty('--k', k2.toFixed(4)); endK = k2; }
          const w = 220 * k2, wordW = natW * k2, gap = END_GAP * k2;
          const left = (W - (wordW + gap + w)) / 2, midY = H / 2;
          const pop = clamp(tc / 0.55), shift = outQuint(clamp((tc - 0.3) / 1.0));
          endBot.style.opacity = outQuint(clamp(tc / 0.3)).toFixed(3);
          endBot.style.transform = `translate(${(left + wordW + gap).toFixed(2)}px, ${(midY - w / 2).toFixed(2)}px) scale(${(0.72 + 0.28 * popBack(pop)).toFixed(4)})`;
          endWord.style.opacity = shift.toFixed(3);
          endWord.style.filter = shift < 1 ? `blur(${(6 * k2 * (1 - shift)).toFixed(2)}px)` : 'none';
          endWord.style.transform = `translate(${(left - 20 * k2 * (1 - shift)).toFixed(2)}px, -50%)`;
        }
      },
    };
  },
};
