// HeadshotPro (headshotpro.com, 2025), the dedicated 'preparing your headshots' wait page of its order flow, in a March 2025 tutorial
// screen recording (YouTube LKYEsk7jCIA, 2025-03-03, wait t=216-227 s, results from t=228 s; spec
// .tmp/clone-9e82faf1/reveal-refs/headshotpro/spec.json, confidence 0.7; frames bc_upload_213s, bc_wait_219s, bc_wait_224s,
// bc_wait_227s, bc_bar_crop_224s, bc_results_232s). After the wizard's last step the app leaves for a near-empty near-white page
// (#F8FAFC) with one narrow column in the middle: a small grey caption 'This process can take up to 2 hours', a slim fully rounded
// grey track carrying a short green (#58B880) segment, the bold headline 'Hold tight! We're preparing your headshots', the body
// 'Our AI is hard at work to get your headshots ready. You may close this screen and come back later.', a hairline, three
// green-check trust rows ('17,943,292 AI headshots already created' / '102.000+ happy customers' / 'Founded in Holland. We respect
// your privacy.'), a second hairline and 'Need help with your order? Contact support in our chat.'. There is no spinner, percentage,
// countdown or skeleton: the green segment is the only thing that moves, and it never fills from the left, it shuttles along the
// track. The tutorial then cuts to the finished 'Your headshot results' page: a slim sidebar and a Keepers panel holding a grid of
// portraits (landscape-ish tiles, about 1.23 : 1).
// Adapted to ten images: the segment shuttles between the track's two ends from t alone and is frozen at the last landing; the page
// gives way to the results page, whose ten tiles (4 + 4 + 2, all in view with no scroll) start as blank grey cells and take their
// pictures in strict reading order. Omitted: the HeadshotPro wordmark and pinwheel in the top bar, the floating support bubble, the
// 'Get more photos' button, the 'Unlock more photos' card in the grid and the sidebar's 'Earn free photos' entry (all upsell), the
// browser frame, the presenter's webcam bubble and the editor's caption bar. The footage's portraits are never reproduced: every
// tile is our own meme.
import { seg } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-hsp';
const ROOT_H = 408, SIDE_W = 94, COLS = 4, GAP = 4;
const CSS = `
.${P} { box-sizing: border-box; display: flex; flex-direction: column; width: 560px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #f8fafc; color: #4e4e67; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #e3e7ec; }
.${P}-top { flex: none; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; height: 28px; padding: 0 22px 0 26px; background: #fff; font-size: 7.5px; color: #8b9098; }
.${P}-top u { text-decoration: underline; text-underline-offset: 1.5px; }
.${P}-top div { display: flex; align-items: center; gap: 7px; }
.${P}-top em { font-style: normal; box-sizing: border-box; height: 15px; padding: 0 6px; border-radius: 4px; box-shadow: inset 0 0 0 1px #e6e9ee; line-height: 15px; font-size: 7px; color: #4e4e67; }
.${P}-main { position: relative; flex: 1; min-height: 0; background: #f8fafc; overflow: hidden; }
.${P}-wait { position: absolute; left: 0; right: 0; top: 0; bottom: 0; display: block; }
.${P}-col { box-sizing: border-box; width: 300px; margin: 0 auto; padding-top: 64px; }
.${P}-cap { height: 11px; font-size: 7px; line-height: 11px; color: #9aa0a6; white-space: nowrap; }
.${P}-bar { position: relative; width: 150px; height: 4px; margin-top: 4px; border-radius: 2px; background: #e7e9eb; overflow: hidden; }
.${P}-bar i { position: absolute; top: 0; bottom: 0; width: ${30}px; left: 0; border-radius: 2px; background: #58b880; }
.${P}-h { margin-top: 14px; font-size: 12px; line-height: 16px; font-weight: 700; letter-spacing: -.005em; color: #4e4e67; white-space: nowrap; }
.${P}-body { margin-top: 5px; font-size: 8.5px; line-height: 13px; color: #8d929a; }
.${P}-hr { height: 1px; margin-top: 13px; background: #eceff3; }
.${P}-trust { display: flex; flex-direction: column; gap: 6px; margin-top: 13px; }
.${P}-row { display: flex; align-items: center; gap: 5px; height: 11px; font-size: 7.5px; line-height: 11px; color: #6b7280; white-space: nowrap; }
.${P}-row svg { flex: none; width: 8px; height: 8px; fill: none; stroke: #58b880; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-row b { font-weight: 600; color: #4e4e67; }
.${P}-help { margin-top: 13px; font-size: 8px; line-height: 12px; color: #6b7280; white-space: nowrap; }
.${P}-res { position: absolute; left: 0; right: 0; top: 0; bottom: 0; display: flex; background: #f8fafc; visibility: hidden; }
.${P}-side { flex: none; box-sizing: border-box; width: ${SIDE_W}px; padding: 12px 6px 0 10px; }
.${P}-nav { display: flex; align-items: center; gap: 4px; height: 17px; margin-bottom: 3px; padding: 0 5px; border-radius: 4px; font-size: 7px; color: #7c828b; white-space: nowrap; }
.${P}-nav i { flex: none; width: 5px; height: 5px; border-radius: 50%; box-shadow: inset 0 0 0 1px #aab0b8; }
.${P}-nav.${P}-on { background: #ede9fe; color: #3f3a8c; font-weight: 600; }
.${P}-nav.${P}-on i { box-shadow: inset 0 0 0 1px #6d62d8; }
.${P}-rm { flex: 1; min-width: 0; box-sizing: border-box; padding: 12px 12px 0 4px; }
.${P}-rh { height: 14px; font-size: 11px; line-height: 14px; font-weight: 700; color: #2f2d5a; white-space: nowrap; }
.${P}-rs { height: 10px; margin-top: 2px; font-size: 6.5px; line-height: 10px; color: #8d929a; white-space: nowrap; }
.${P}-panel { margin-top: 7px; box-sizing: border-box; padding: 7px; border-radius: 6px; background: #fff; box-shadow: 0 0 0 1px #eceff3; }
.${P}-ph { display: flex; align-items: center; justify-content: space-between; height: 14px; }
.${P}-ph b { font-size: 8px; font-weight: 600; color: #2f2d5a; }
.${P}-ph em { font-style: normal; box-sizing: border-box; height: 13px; padding: 0 6px; border-radius: 4px; box-shadow: inset 0 0 0 1px #e6e9ee; line-height: 13px; font-size: 6.5px; color: #4e4e67; }
.${P}-pk { height: 10px; margin: 1px 0 6px; font-size: 6.5px; line-height: 10px; color: #6b7280; white-space: nowrap; }
.${P}-g { display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; }
.${P}-t { position: relative; aspect-ratio: 6 / 5; border-radius: 3px; overflow: hidden; background: #e9edf1; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #e9edf1; }
`;

const REF = 1.84;                                 // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const GRID_AT = 0.80;                             // the wait page gives way to the results page (blank cells)
const LAND = Array.from({ length: 10 }, (_, i) => 0.92 + i * 0.078);   // cell i takes its picture (strict reading order), the last at 1.622
const FADE = 0.05;                                // a cell's grey cover thins away over this long before the picture lands
const PERIOD = 0.5;                               // one there-and-back of the green segment, in layout seconds
const SEG_W = 30, TRACK_W = 150;                  // the green segment against its track, in px
const CHECK = '<svg viewBox="0 0 10 10"><path d="M1.8 5.3l2.2 2.2 4.4-4.8"/></svg>';

export default {
  id: 'headshotpro',
  label: 'HeadshotPro (2025)',
  source: {
    platform: "HeadshotPro (headshotpro.com), the 'preparing your headshots' wait page after the order wizard, then the 'Your headshot results' page (desktop browser, light theme; a tutorial screen recording on YouTube: LKYEsk7jCIA, 2025-03-03)",
    feature: "near-white dedicated wait page: grey 'This process can take up to 2 hours' over a slim rounded track whose green segment shuttles between two positions (never fills), bold 'Hold tight! We're preparing your headshots', body copy, three green-check trust rows and a support line; then the results page with a Keepers panel of portrait tiles (adapted to 10: a 4 + 4 + 2 block filling in reading order; the wordmark, support bubble, 'Get more photos' button, 'Unlock more photos' card and 'Earn free photos' entry are omitted)",
    refs: [
      { url: 'https://www.youtube.com/watch?v=LKYEsk7jCIA', id: 'LKYEsk7jCIA', published: '2025-03-03', retrieved: '2026-10-15', note: 'the wait on screen, t=216-227 s; the results page from t=228 s (recorded about two weeks later)' },
    ],
    extrapolated: [
      "ten landscape-ish tiles (6 : 5) in a 4 + 4 + 2 block, all in view with no scroll: the footage's Keepers panel holds eleven portraits (about 1.23 : 1) in four columns with an upsell card in the first row and scrolls",
      "the landing: the footage cuts from the wait to the results page recorded weeks later, so no tile ever lands on camera; the blank cells, their order and their timing are ours",
      "the shuttle: the three stills (t=219, 224, 227) all show the segment at the same spot (about 64-84 % of the track) while the spec's 0.5 s samples read two spots; ours goes there and back along the whole track as a smooth sweep, one cycle per 0.5 layout seconds, and holds still at the last landing",
      "the track: about half the column wide in the stills (the spec reads 289 px), with a short segment about a fifth of it",
      "the results header: 'You selected 10 keepers.' (the footage reads 'You selected 11 keepers. That's 3.7x more than you'd get in an offline photoshoot!'; the comparison claim is dropped)",
      "the top bar's 'Support' and 'EN' / 'Logout' are kept as plain text; the sidebar's entries are plain dots and labels",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'headshotpro');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/><div class="${P}-cv"></div></div></div>`;
    const nav = (n, on) => `<div class="${P}-nav${on ? ` ${P}-on` : ''}"><i></i>${n}</div>`;
    const root = x.el(`<div class="${P}"><div class="${P}-top"><u>Support</u><div><em>EN</em><u>Logout</u></div></div><div class="${P}-main"><div class="${P}-wait"><div class="${P}-col"><div class="${P}-cap">This process can take up to 2 hours</div><div class="${P}-bar"><i></i></div><div class="${P}-h">Hold tight! We're preparing your headshots</div><div class="${P}-body">Our AI is hard at work to get your headshots ready. You may close this screen and come back later.</div><div class="${P}-hr"></div><div class="${P}-trust"><div class="${P}-row">${CHECK}<span>17,943,292 AI headshots already created</span></div><div class="${P}-row">${CHECK}<span>102.000+ happy customers</span></div><div class="${P}-row">${CHECK}<span>Founded in Holland. <b>We respect your privacy.</b></span></div></div><div class="${P}-hr"></div><div class="${P}-help">Need help with your order? Contact support in our chat.</div></div></div><div class="${P}-res"><div class="${P}-side">${nav('Keepers', true)}${nav('All photos', false)}${nav('Share with friends', false)}</div><div class="${P}-rm"><div class="${P}-rh">Your headshot results</div><div class="${P}-rs">It's time to download your keepers. Use the "Actions" menu to download your headshots.</div><div class="${P}-panel"><div class="${P}-ph"><b>Keepers</b><em>Actions</em></div><div class="${P}-pk">You selected 10 keepers.</div><div class="${P}-g">${tiles.map(cell).join('')}</div></div></div></div></div></div>`);
    const wait = root.querySelector(`.${P}-wait`), res = root.querySelector(`.${P}-res`), seg1 = root.querySelector(`.${P}-bar i`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const te = Math.min(Math.max(s, 0), LAND[9]);  // the wait's clock stops at the last landing: the segment holds there

        // the wait page, then the results page
        const on = s >= GRID_AT;
        put('wait', on, (v) => { wait.style.display = v ? 'none' : 'block'; });
        put('res', on, (v) => { res.style.visibility = v ? 'visible' : 'hidden'; });

        // the green segment shuttles along the track (never fills from the left), from t alone: a smooth there-and-back
        const ph = (te / PERIOD) % 1;
        const p = 0.5 - 0.5 * Math.cos(ph * 2 * Math.PI);
        put('seg', p.toFixed(4), () => { seg1.style.left = `${(p * (TRACK_W - SEG_W)).toFixed(2)}px`; });

        cells.forEach((c, i) => {
          const a = LAND[i];
          const f = seg(s, a - FADE, a);
          put(`i${i}`, s >= a - FADE, (v) => { c.im.style.visibility = v ? '' : 'hidden'; });
          put(`c${i}`, f.toFixed(3), () => {
            if (f >= 1) { c.cv.style.display = 'none'; c.cv.style.opacity = ''; } else { c.cv.style.display = ''; c.cv.style.opacity = f > 0 ? (1 - f).toFixed(3) : ''; }
          });
        });
      },
    };
  },
};
