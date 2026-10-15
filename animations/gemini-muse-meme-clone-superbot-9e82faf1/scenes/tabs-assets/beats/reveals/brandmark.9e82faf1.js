// Brandmark's logo generator, app.brandmark.io/v3/ (YouTube QU-BB47cFmI, 'How to Use Brandmark io Logo Maker', 2023-07-04, t=326.0-333.0 s;
// spec .tmp/clone-9e82faf1/reveal-refs/brandmark/spec.json, confidence 0.70; frame au_brandmark_330_52pct.png). After the onboarding wizard
// the page turns one flat amber (#FBCD5F), edge to edge, with no site nav and no step trail. A small icon block of three touching,
// sharp-cornered tiles in an L (mint #84C49D with a dropper glyph top-left, pink #E94A86 with a brush glyph top-right, cream #FEF2DC with a pencil
// glyph under the pink one; flat colours sampled from the frame) sits above the letter-spaced small caps 'GENERATING LOGOS' and a very small grey
// percentage that climbs 16 > 26 > 33 > 41 > 48 > 55 > 60 > 69 > 77 > 77 > 86 > 98 at 0.5 s spacing from t=326.5 s (none yet on the first frame).
// Sizes are the frame's own proportions at 560 wide (the 1920 px frame x 0.2917): tiles ~32 x 29 px, caption ~7.5 px, percentage ~5 px.
// No spinner, no bar, no skeleton; at ~98 % the page is replaced whole by the results page.
// Extrapolated (not in the footage): the results page the wait cuts to is drawn as a white page with a navy right panel (the footage shows
// that page only as a white logo grid with a navy right panel) and ten square tiles in a 4 + 4 + 2 block landing in strict reading order.
// The percentage between its 0.5 s samples is interpolated, and the icon block is held static (its motion between samples is unmeasured).
// Omitted: the macOS browser chrome and the webcam inset of the recording, the faint ghost of the previous brand name that cross-fades in the
// top-right of the first amber frames (a page-transition artefact), and any logo. Every tile is our own meme; the glyphs are plain strokes
// drawn here.
import { seg } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-bmk';
const ROOT_H = 340, LEFT_W = 362, COLS = 4, GAP = 6;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: 560px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #fbcd5f; color: #3a3226; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; }
.${P}-wait { position: absolute; inset: 0; background: #fbcd5f; }
.${P}-ico { position: absolute; left: 50%; top: 112px; width: 64px; height: 58px; margin-left: -32px; }
.${P}-ico i { position: absolute; display: block; width: 32px; height: 29px; }
.${P}-ico i:nth-child(1) { left: 0; top: 0; background: #84c49d; }
.${P}-ico i:nth-child(2) { left: 32px; top: 0; background: #e94a86; }
.${P}-ico i:nth-child(3) { left: 32px; top: 29px; background: #fef2dc; }
.${P}-ico svg { position: absolute; left: 8px; top: 6px; display: block; width: 16px; height: 17px; fill: none; stroke: #232d30; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.${P}-cap { position: absolute; left: 0; right: 0; top: 175px; height: 16px; text-align: center; font-size: 7.5px; font-weight: 500; line-height: 16px; letter-spacing: .3em; text-indent: .3em; color: #3a3226; white-space: nowrap; }
.${P}-pct { position: absolute; left: 0; right: 0; top: 193px; height: 12px; text-align: center; font-size: 5px; line-height: 12px; color: #6b6357; }
.${P}-res { position: absolute; inset: 0; background: #ffffff; }
.${P}-top { position: absolute; left: 0; right: 0; top: 0; height: 4px; background: #fbcd5f; }
.${P}-left { position: absolute; left: 0; top: 0; bottom: 0; width: ${LEFT_W}px; }
.${P}-g { position: absolute; left: 20px; right: 20px; top: 50%; display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; transform: translateY(-50%); }
.${P}-t { position: relative; aspect-ratio: 1; overflow: hidden; background: #f6efdc; }
.${P}-cv { position: absolute; inset: 0; background: #f6efdc; }
.${P}-t img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-side { position: absolute; right: 0; top: 0; bottom: 0; width: ${560 - LEFT_W}px; background: #1d2a52; }
.${P}-side i { position: absolute; display: block; background: #2b3b6c; }
.${P}-side i:nth-child(1) { left: 22px; right: 22px; top: 70px; height: 124px; border-radius: 6px; }
.${P}-side i:nth-child(2) { left: 22px; width: 84px; top: 212px; height: 8px; border-radius: 4px; background: #3a4c82; }
.${P}-side i:nth-child(3) { left: 22px; width: 130px; top: 228px; height: 6px; border-radius: 3px; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance, stretched with the real window
const WAIT_SEC = 7;                                // the footage's wait, 326.0 .. 333.0 s
const CUT = 0.86;                                  // the wait page is replaced whole by the results page (layout seconds)
const LAND = Array.from({ length: 10 }, (_, i) => 0.95 + i * (0.74 / 9));   // tile i has landed (reading order), the last at 1.69
const FADE = 0.07;                                 // the tile's cover thins away over this long before the picture has landed
const LAST = LAND[9];                              // nothing moves after this
// the footage's 0.5 s samples from t=326.5 s of QU-BB47cFmI
const SAMPLES = [16, 26, 33, 41, 48, 55, 60, 69, 77, 77, 86, 98];
const FIRST_AT = 0.5;                              // seconds into the wait of the first percentage

const pctAt = (sec) => {
  if (sec < FIRST_AT) return '';
  const x = Math.min(SAMPLES.length - 1, (sec - FIRST_AT) / 0.5), i = Math.min(SAMPLES.length - 2, Math.floor(x));
  return `${Math.round(SAMPLES[i] + (SAMPLES[i + 1] - SAMPLES[i]) * (x - i))}%`;
};

const DROPPER = '<svg viewBox="0 0 16 17" aria-hidden="true"><path d="M11.8 1.6l2.6 2.6-2 2-2.6-2.6z"/><path d="M8.2 4.2l3.6 3.6M10 2.4l3.6 3.6"/><path d="M9.4 5.4L3.4 11.4 2.2 14.6l3.2-1.2 6-6"/></svg>';
const BRUSH = '<svg viewBox="0 0 16 17" aria-hidden="true"><rect x="4.5" y="1.5" width="7" height="8"/><path d="M4.5 6h7M4.5 4h7"/><path d="M8 9.5v3.2a1.2 1.2 0 0 1-2.4 0V9.5" transform="translate(1.2 0)"/></svg>';
const PENCIL = '<svg viewBox="0 0 16 17" aria-hidden="true"><path d="M2.4 3.6l2-1.6 8.4 8.2-1.6 2z"/><path d="M4.4 2l2.8 2.8"/><path d="M11.2 12.2L13.6 15l-3.6-1z"/></svg>';

export default {
  id: 'brandmark',
  label: 'Brandmark (2023)',
  source: {
    platform: 'Brandmark logo generator, app.brandmark.io/v3/ (desktop browser on macOS; the Web Whizz tutorial on YouTube, 2023-07-04)',
    feature: "full-bleed amber (#FBCD5F) wait page: an L-shaped icon block of three touching sharp tiles (mint #84C49D dropper top-left, pink #E94A86 brush top-right, cream #FEF2DC pencil below the pink one) above letter-spaced small caps 'GENERATING LOGOS' and a small grey percentage climbing 16 > 26 > 33 > 41 > 48 > 55 > 60 > 69 > 77 > 86 > 98; the page is then replaced whole (adapted to 10: a white results page with a navy right panel and a 4 + 4 + 2 block of square tiles landing in reading order; the browser chrome, the previous brand-name ghost and any logo are omitted)",
    videos: [{ id: 'QU-BB47cFmI', published: '2023-07-04', t: '326.0-333.0 s' }],
    extrapolated: ['the results page: ten square tiles in a 4 + 4 + 2 block landing in strict reading order beside a navy panel', 'the navy panel contents (plain bars; the footage shows a navy right panel only)', 'the percentage between its 0.5 s samples', 'whether the count starts at 0 or 16 (the first loader frame shows none, so none is drawn until 0.5 s)', 'the icon block is held static at its three tiles (its motion between the sampled frames is unmeasured)', 'the glyph drawings (plain strokes after the frame, not its artwork)'],
    refs: [{ url: 'https://www.youtube.com/watch?v=QU-BB47cFmI', retrieved: '2026-10-14' }],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'brandmark');
    const cell = (g, i) => `<div class="${P}-t"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; transform-origin: ${g.origin}"/><div class="${P}-cv"></div></div>`;
    const root = x.el(`<div class="${P}"><div class="${P}-wait"><div class="${P}-ico"><i>${DROPPER}</i><i>${BRUSH}</i><i>${PENCIL}</i></div><div class="${P}-cap">GENERATING LOGOS</div><div class="${P}-pct"></div></div><div class="${P}-res" style="visibility: hidden"><div class="${P}-top"></div><div class="${P}-left"><div class="${P}-g">${tiles.map(cell).join('')}</div></div><div class="${P}-side"><i></i><i></i><i></i></div></div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const wait = q('wait'), res = q('res'), pct = q('pct');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), g: tiles[i] }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.min((t - ctx.cardIn) / k, LAST); // layout seconds since the card entered; frozen once the last tile has landed

        // the wait page: the percentage follows the footage's clock, sec seconds into the 7 s wait
        const sec = Math.max(0, Math.min(1, s / CUT)) * WAIT_SEC;
        put('pct', pctAt(sec), (txt) => { pct.textContent = txt; });

        // the wait page is replaced whole by the results page
        const cut = s >= CUT;
        put('cut', cut, (c) => { wait.style.visibility = c ? 'hidden' : ''; res.style.visibility = c ? '' : 'hidden'; });

        cells.forEach((c, i) => {
          const a = LAND[i];
          const f = seg(s, a - FADE, a);
          put(`i${i}`, s >= a - FADE, (n) => { c.im.style.visibility = n ? '' : 'hidden'; });
          c.im.style.filter = restFilter(c.g);
          c.im.style.transform = restTransform(c.g);
          put(`c${i}`, f.toFixed(3), () => { if (f >= 1) { c.cv.style.display = 'none'; c.cv.style.opacity = ''; } else { c.cv.style.display = ''; c.cv.style.opacity = f > 0 ? (1 - f).toFixed(3) : ''; } });
        });
      },
    };
  },
};
