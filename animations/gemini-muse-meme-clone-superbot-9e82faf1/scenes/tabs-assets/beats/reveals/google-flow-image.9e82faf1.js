// Google Flow (2026): the project page of Google's AI creative studio, read from four YouTube walkthroughs (v1OJC0rJ4CQ 2026-04-18, dmmSR3FOQfM 2026-03-05, oKjDeMtBZ4g 2026-03-04,
// hEEu5-zJFbQ 2025-12-31; frames reveal-refs/google-flow-image/frames/bm_flow_*.png, spec .tmp/clone-9e82faf1/reveal-refs/google-flow-image/spec.json, confidence 0.5).
// The whole screen is the reveal: a pure black page, a header row (back arrow, the project's date title, a wide rounded search pill with a filter icon, add / film / settings / more icons), a
// masonry of large rounded flat slate tiles and a floating bottom composer (prompt line, '+', a model chip, an aspect chip and a round submit arrow). Every pending tile carries only a tiny
// picture glyph top-left and a BARE percentage top-right (0% -> 2% -> 20% ...) climbing while it renders - no spinner, caption, bar or shimmer. A tile hard-swaps to its picture in place, the
// badge leaving with the slate, and the arrival toast 'Image saved to project' / 'Dismiss' shows once the batch is in. Omitted: the Flow / Google wordmark, the PRO chip and avatar, the details
// panel and the pre-submit 'Generating will use N credits' cost line. Every picture is OUR meme; system UI face only.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-gfl';
const ROOT_W = 560, ROOT_H = 414;
const GX = 14, GY = 48, GAP = 6, GW = ROOT_W - 2 * GX;                          // the masonry's box
const ROWS = [[1.5, 0.75, 1.0, 0.65, 0.8], [0.8, 1.3, 0.7, 1.1, 1.0]];        // two justified rows of five: each tile's aspect (w/h), unequal widths and row heights
const rects = [];
{
  let y = GY;
  ROWS.forEach((row) => {
    const sum = row.reduce((a, b) => a + b, 0), h = Math.round((GW - (row.length - 1) * GAP) / sum);
    let x = GX;
    row.forEach((a, k) => {
      const w = k === row.length - 1 ? GX + GW - x : Math.round(a * h);
      rects.push({ x, y, w, h });
      x += w + GAP;
    });
    y += h + GAP;
  });
}
const GRID_END = Math.max(...rects.map((r) => r.y + r.h));
const CMP_Y = GRID_END + 40;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #000; color: #d4d5d9; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(255, 255, 255, .1); }
.${P} p { margin: 0; }
.${P}-hd { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: 40px; }
.${P}-bk { position: absolute; left: 14px; top: 14px; width: 11px; height: 11px; fill: none; stroke: #e3e3e6; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ti { position: absolute; left: 34px; top: 0; height: 40px; line-height: 40px; font-size: 7.6px; color: #e3e3e6; white-space: nowrap; }
.${P}-km { position: absolute; left: 100px; top: 15px; width: 10px; height: 10px; fill: #c4c5c9; }
.${P}-sr { position: absolute; left: 150px; top: 9px; width: 250px; height: 22px; box-sizing: border-box; border-radius: 11px; background: #131314; }
.${P}-sr svg { position: absolute; top: 5.5px; fill: none; stroke: #c4c5c9; stroke-width: 1.4; stroke-linecap: round; }
.${P}-ic { position: absolute; top: 14px; width: 11px; height: 11px; fill: none; stroke: #e3e3e6; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-t { position: absolute; border-radius: 9px; overflow: hidden; background: #1c1d20; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: #26272a; background-image: radial-gradient(ellipse at 50% 30%, #4b4d53 0%, #34363a 38%, #202124 72%, #19191b 100%); background-size: 190% 170%; background-repeat: no-repeat; }
.${P}-gl { position: absolute; left: 6px; top: 6px; width: 8px; height: 8px; fill: none; stroke: #b9bac0; stroke-width: 1.1; stroke-linecap: round; stroke-linejoin: round; }
.${P}-pc { position: absolute; right: 6px; top: 5px; font-size: 6.8px; line-height: 10px; color: #b9bac0; font-variant-numeric: tabular-nums; white-space: nowrap; }
.${P}-ts { position: absolute; right: ${GX}px; top: ${GRID_END + 8}px; height: 22px; box-sizing: border-box; padding: 0 9px 0 8px; border-radius: 6px; background: #2b2c2f; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(0, 0, 0, .5), 0 0 0 1px rgba(255, 255, 255, .07); }
.${P}-ts svg { flex: none; width: 9px; height: 9px; fill: none; stroke: #a8c7fa; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-tx { font-size: 6.4px; line-height: 22px; color: #e3e3e6; white-space: nowrap; }
.${P}-dm { font-size: 6.4px; line-height: 22px; color: #a8c7fa; margin-left: 12px; white-space: nowrap; }
.${P}-cp { position: absolute; left: 60px; top: ${CMP_Y}px; width: 440px; height: 84px; box-sizing: border-box; border-radius: 15px; background: #1a1a1b; box-shadow: 0 0 0 1px rgba(255, 255, 255, .09), 0 4px 18px rgba(0, 0, 0, .55); }
.${P}-pr { position: absolute; left: 16px; top: 15px; font-size: 7.6px; line-height: 12px; color: #77787d; white-space: nowrap; }
.${P}-pl { position: absolute; left: 14px; bottom: 10px; width: 10px; height: 10px; fill: none; stroke: #c4c5c9; stroke-width: 1.4; stroke-linecap: round; }
.${P}-ch { position: absolute; bottom: 9px; height: 16px; box-sizing: border-box; padding: 0 8px 0 6px; border-radius: 8px; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .13); display: flex; align-items: center; gap: 4px; font-size: 6.4px; line-height: 16px; color: #d4d5d9; white-space: nowrap; }
.${P}-ch svg { flex: none; width: 8px; height: 8px; fill: none; stroke: #c4c5c9; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-go { position: absolute; right: 10px; bottom: 8px; width: 18px; height: 18px; border-radius: 50%; background: #c4c5c9; }
.${P}-go svg { position: absolute; left: 4.5px; top: 4.5px; width: 9px; height: 9px; fill: none; stroke: #1a1a1b; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
`;

const REF = 1.84;                                                           // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const LAND = Array.from({ length: 10 }, (_, i) => 0.9 + i * (0.78 / 9));    // tile i hands over to its picture (strict reading order), the last at 1.68
const LEAD = 0.03;                                                          // tile i starts its climb a hair after tile i - 1 (the badges of one batch are not in lock-step)
const f1 = (v) => v.toFixed(1);
const PIC = '<svg class="' + P + '-gl" viewBox="0 0 10 10"><rect x="1.2" y="1.2" width="7.6" height="7.6" rx="1.4"/><path d="M1.6 7.2 4 4.8 5.6 6.4 6.8 5.2 8.4 6.8"/></svg>';

export default {
  id: 'google-flow-image',
  label: 'Google Flow (2026)',
  source: {
    platform: "Google Flow (labs.google/flow), Google Labs' AI creative studio, project page in desktop Chrome, captured from third-party and official YouTube walkthroughs (English and Spanish UI)",
    feature: "an image generation batch on a Flow project page: flat dark slate tiles join the project's masonry, each with a small picture glyph top-left and a bare percentage in its top-right corner that climbs while it renders (0% -> 2% -> 20% ...); the page header and the floating bottom composer stay live; a tile's picture replaces its slate in place and the toast 'Image saved to project' / 'Dismiss' shows as the batch arrives",
    capture: {
      url: 'https://www.youtube.com/watch?v=v1OJC0rJ4CQ',
      date: '2026-04-18',
      timestamps: "video v1OJC0rJ4CQ 'The ULTIMATE Google Flow Guide': extracted frame 0392 (variable frame rate, NOT seconds): four slate tiles each '3%', toast 'Image saved to project' / 'Dismiss', composer 'What do you want to create?' with '+', a Nano Banana chip and a round submit arrow, single enlarged tile '17%' then '20%' (frame 0052); video dmmSR3FOQfM (2026-03-05) t = 699 s: a large video card '0%' then '2%' with the Spanish composer; oKjDeMtBZ4g (2026-03-04) composer chips; hEEu5-zJFbQ (2025-12-31) t ~ 130-150 s finished-tile overlays",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=v1OJC0rJ4CQ', published: '2026-04-18', retrieved: '2026-10-15', note: "the 2x2 pending batch with a bare '3%' top-right on every tile, the toast 'Image saved to project' / 'Dismiss', the bottom composer and the header row" },
      { url: 'https://www.youtube.com/watch?v=dmmSR3FOQfM', published: '2026-03-05', retrieved: '2026-10-15', note: "a large pending video card with the bare '0%' -> '2%' top-right and a camera glyph top-left, the smoky grey wash, the composer" },
      { url: 'https://www.youtube.com/watch?v=oKjDeMtBZ4g', published: '2026-03-04', retrieved: '2026-10-15', note: "Google's own walkthrough: composer layout and chips (no wait legible)" },
      { url: 'https://www.youtube.com/watch?v=hEEu5-zJFbQ', published: '2025-12-31', retrieved: '2026-10-15', note: 'text-to-image run, generation cut in the edit: only finished-tile overlays legible' },
    ],
    extrapolated: [
      "ten tiles from four: the footage shows a 2x2 batch beside finished tiles; here ten flat slate tiles sit in two justified rows of five (unequal widths and row heights, a masonry that keeps all ten in view with no scroll), each on its own clock",
      "all timing and the percentage curve: only 0 -> 2, 3 and 17 -> 20 were seen and never a run; here each badge climbs from 0% along an ease-out curve to the high nineties and leaves with its slate at its landing, the tiles landing 0.087 s apart in strict reading order, the badges of one batch offset by a few hundredths of a second",
      "the landing swap: the recordings cut the render, so the hard swap in place (slate, glyph and badge out, picture in) is ours, as is the toast appearing once the last tile has landed (the recording shows it during a batch)",
      "the grey bloom drift inside each pending tile is ours (the recording shows a very slow shift of the light patch) and is frozen when its tile lands",
      "the chip strings: 'Nano Banana Pro' and '16:9' are the right panel's model and aspect labels (the composer chip in the pending frame reads 'Nano Banana 2' with 'x4'); the date title 'Apr 09, 11:57 AM' is the frame-0392 header",
      "the header's icon glyphs (search, filter, add, film strip, settings, more) are generic strokes of our own; the finished pictures are our own memes, not the recording's character sheets",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'google-flow-image');
    const cell = (g, i) => {
      const r = rects[i];
      return `<div class="${P}-t" style="left: ${r.x}px; top: ${r.y}px; width: ${r.w}px; height: ${r.h}px"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
        + `<div class="${P}-cv"></div></div>${PIC}<p class="${P}-pc"></p></div>`;
    };
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-hd">`
      + `<svg class="${P}-bk" viewBox="0 0 10 10"><path d="M8.5 5H1.8M4.6 2 1.6 5 4.6 8"/></svg>`
      + `<p class="${P}-ti">Apr 09, 11:57 AM</p>`
      + `<svg class="${P}-km" viewBox="0 0 10 10"><circle cx="5" cy="1.8" r=".9"/><circle cx="5" cy="5" r=".9"/><circle cx="5" cy="8.2" r=".9"/></svg>`
      + `<div class="${P}-sr"><svg style="left: 8px" width="11" height="11" viewBox="0 0 10 10"><circle cx="4.2" cy="4.2" r="2.8"/><path d="M6.4 6.4 8.8 8.8"/></svg><svg style="right: 8px" width="11" height="11" viewBox="0 0 10 10"><path d="M1.5 2.5h7M2.8 5h4.4M4 7.5h2"/></svg></div>`
      + `<svg class="${P}-ic" style="left: 450px" viewBox="0 0 10 10"><path d="M5 1.5v7M1.5 5h7"/></svg>`
      + `<svg class="${P}-ic" style="left: 474px" viewBox="0 0 10 10"><rect x="1.2" y="1.2" width="7.6" height="7.6" rx="1"/><path d="M3.2 1.2v7.6M6.8 1.2v7.6M1.2 3.6h2M1.2 6.4h2M6.8 3.6h2M6.8 6.4h2"/></svg>`
      + `<svg class="${P}-ic" style="left: 498px" viewBox="0 0 10 10"><circle cx="5" cy="5" r="1.7"/><path d="M5 1v1.4M5 7.6V9M1 5h1.4M7.6 5H9M2.2 2.2l1 1M6.8 6.8l1 1M2.2 7.8l1-1M6.8 3.2l1-1"/></svg>`
      + `<svg class="${P}-km" style="left: 526px" viewBox="0 0 10 10"><circle cx="5" cy="1.8" r=".9"/><circle cx="5" cy="5" r=".9"/><circle cx="5" cy="8.2" r=".9"/></svg>`
      + `</div>`
      + tiles.map(cell).join('')
      + `<div class="${P}-ts"><svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/><path d="M3 5.2 4.5 6.7 7.2 3.7"/></svg><p class="${P}-tx">Image saved to project</p><p class="${P}-dm">Dismiss</p></div>`
      + `<div class="${P}-cp"><p class="${P}-pr">What do you want to create?</p>`
      + `<svg class="${P}-pl" viewBox="0 0 10 10"><path d="M5 1.5v7M1.5 5h7"/></svg>`
      + `<p class="${P}-ch" style="right: 106px"><svg viewBox="0 0 10 10"><path d="M5 .8 6.1 3.9 9.2 5 6.1 6.1 5 9.2 3.9 6.1.8 5 3.9 3.9Z"/></svg>Nano Banana Pro</p>`
      + `<p class="${P}-ch" style="right: 54px"><svg viewBox="0 0 10 10"><rect x="1" y="2.4" width="8" height="5.2" rx="1"/></svg>16:9</p>`
      + `<div class="${P}-go"><svg viewBox="0 0 10 10"><path d="M1.6 5h6.8M5.6 2.2 8.4 5 5.6 7.8"/></svg></div>`
      + `</div></div>`);
    const ts = root.querySelector(`.${P}-ts`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({
      im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), gl: n.querySelector(`.${P}-gl`), pc: n.querySelector(`.${P}-pc`),
    }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        put('ts', s >= LAND[9], (v) => { ts.style.visibility = v ? '' : 'hidden'; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // slate, glyph and badge until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
            c.gl.style.display = v ? 'none' : '';
            c.pc.style.display = v ? 'none' : '';
          });
          const a = i * LEAD, te = Math.min(s, LAND[i]);   // this tile's clock stops at its landing
          const x01 = Math.min(Math.max((te - a) / (LAND[i] - a), 0), 1);
          put(`p${i}`, done ? '' : `${Math.floor(96 * (1 - Math.pow(1 - x01, 1.7)))}%`, (v) => { c.pc.textContent = v; });
          put(`d${i}`, f1(50 + 30 * Math.sin((te * 0.9 + i * 0.7) * Math.PI)), (v) => { c.cv.style.backgroundPosition = `${v}% ${f1(40 + 12 * Math.cos((te * 0.7 + i * 0.5) * Math.PI))}%`; });
        });
      },
    };
  },
};
