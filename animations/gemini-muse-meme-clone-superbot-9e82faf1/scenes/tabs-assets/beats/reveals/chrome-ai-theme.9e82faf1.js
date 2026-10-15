// Chrome 'Create theme with AI' in the Customize Chrome side panel (YouTube -W93tyRZKAk, Brad Dale, 2024-07-14, Chrome 126 on Windows 11, a 640x316
// desktop capture; Create pressed ~47.0 s, PENDING 47.0-52.5 s, tiles resolved 52.5-53.4 s; spec .tmp/clone-9e82faf1/reveal-refs/chrome-ai-theme/spec.json,
// confidence 0.56; frames aw_composer_before_create.png, aw_sheet_create_press.png, aw_pending_skeleton_tiles.png, aw_pending_skeleton_tiles_b.png,
// aw_result_generated_tiles.png). A New Tab Page on the left (white, an apps-grid glyph and an avatar at the top right, the round customise buttons at the
// bottom right) beside the open 'Customize Chrome' side panel on the right. The panel holds a white card: a back arrow with 'Create theme with AI', the
// Subject field ('Lightning'), 'Add optional details' with the Style ('Photography') and Mood ('Dark') dropdowns, a row of colour swatches (red, blue
// ticked, yellow, green, black, an eyedropper) and the filled blue 'Create' pill, then a hairline and the disclaimer 'This is an experimental AI feature
// and won't always get it right. Learn more' over an 'Inspiration' group (caption 'Meadow, Oil Painting, Intellectual, Yellow', pictures). Pressing Create
// changes nothing in the panel but the area under the hairline: the disclaimer and the Inspiration group go, and a 3-wide block of rounded, flat, pale
// pastel tiles with no captions takes their place. The tiles shimmer, the sampled colour cycling #ECF2FE -> #F7FBFC -> #E1EDFA -> #ECF2FE on a ~2.0 s
// period, each tile a little out of step with its neighbours. There is no status text, spinner, percentage or toast; the panel stays open throughout.
// Then the same cells are simply painted over by the finished theme pictures (no fade is measurable at 30 fps).
// Adapted to ten images: the footage's grid shows six tiles at the panel's edge (it scrolls), so ten square tiles in a 3 + 3 + 3 + 1 block, filled in
// reading order, one every ~0.14 s of the beat, with the panel sized so all ten are on screen with no scrolling. The ~2.0 s shimmer period is
// scaled into the beat with the pending window (5.5 s there, ~1.5 s here), and is frozen at the last landing. Omitted: the browser chrome (tab strip,
// bookmarks bar, address bar), the Google and Chrome marks, the mouse cursor, the page behind the panel's New Tab shortcuts, and the 'Inspiration'
// heading and captions that come back a few seconds after the grid lands. The footage's pictures are never reproduced: every tile is our own meme, and
// the Inspiration thumbnails drawn before the press are plain colour washes.
import { press } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-cat';
const ROOT_H = 512, PANEL_W = 232, HEAD_H = 30, CARD_M = 8, CARD_P = 9, TILE = 62, GAP = 6, COLS = 3;
const IW = COLS * TILE + (COLS - 1) * GAP;           // the card's inner width: three tiles and two gaps
const CSS = `
.${P} { position: relative; box-sizing: border-box; display: flex; width: 560px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #fff; color: #202124; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #dadce0; }
.${P}-ntp { position: relative; flex: 1; min-width: 0; background: #fff; }
.${P}-apps { position: absolute; right: 50px; top: 16px; display: grid; grid-template-columns: repeat(3, 3px); gap: 2.5px; }
.${P}-apps i { display: block; width: 3px; height: 3px; border-radius: 50%; background: #5f6368; }
.${P}-av { position: absolute; right: 12px; top: 9px; width: 24px; height: 24px; box-sizing: border-box; border-radius: 50%; border: 2px solid #e8eaed; background: radial-gradient(circle at 36% 34%, #e8c9a4 0 22%, #7b8f6a 24% 60%, #4d5d4a 62%); }
.${P}-box { position: absolute; left: 50%; top: 168px; width: 210px; height: 28px; box-sizing: border-box; margin-left: -105px; border-radius: 14px; box-shadow: inset 0 0 0 1px #dadce0; }
.${P}-box svg { position: absolute; left: 10px; top: 8px; width: 12px; height: 12px; fill: none; stroke: #9aa0a6; stroke-width: 1.5; stroke-linecap: round; }
.${P}-fab { position: absolute; bottom: 14px; display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; }
.${P}-fab svg { width: 12px; height: 12px; fill: none; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.${P}-fab.${P}-f1 { right: 46px; background: #0b57d0; }
.${P}-fab.${P}-f1 svg { stroke: #fff; }
.${P}-fab.${P}-f2 { right: 12px; background: #d3e3fd; }
.${P}-fab.${P}-f2 svg { stroke: #202124; }
.${P}-panel { position: relative; flex: none; box-sizing: border-box; display: flex; flex-direction: column; width: ${PANEL_W}px; background: #f8f9fc; box-shadow: inset 1px 0 0 #e3e6ea; }
.${P}-grip { position: absolute; left: -5px; top: 244px; display: flex; justify-content: center; gap: 2px; width: 9px; height: 20px; padding-top: 4px; box-sizing: border-box; border-radius: 3px; background: #fff; box-shadow: 0 0 0 1px #dadce0; z-index: 2; }
.${P}-grip i { display: block; width: 1px; height: 11px; background: #80868b; }
.${P}-hd { flex: none; display: flex; align-items: center; justify-content: space-between; height: ${HEAD_H}px; padding: 0 12px 0 ${CARD_M + CARD_P}px; font-size: 10.5px; font-weight: 600; color: #202124; white-space: nowrap; }
.${P}-hd svg { width: 9px; height: 9px; fill: none; stroke: #3c4043; stroke-width: 1.5; stroke-linecap: round; }
.${P}-card { position: relative; flex: 1; min-height: 0; box-sizing: border-box; margin: 0 ${CARD_M}px ${CARD_M}px; padding: ${CARD_P}px ${CARD_P}px 0; border-radius: 12px; background: #fff; box-shadow: 0 0 0 1px #e8eaf6, 0 1px 3px rgba(60, 64, 67, .12); overflow: hidden; }
.${P}-bar { position: absolute; right: 2px; top: 8px; width: 2px; height: 92px; border-radius: 1px; background: #c3d1f7; }
.${P}-back { display: flex; align-items: center; gap: 6px; height: 18px; margin-bottom: 7px; font-size: 10.5px; font-weight: 600; color: #202124; white-space: nowrap; }
.${P}-back svg { flex: none; width: 10px; height: 10px; fill: none; stroke: #3c4043; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-dd { display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; height: 26px; padding: 0 8px 0 9px; border-radius: 8px; box-shadow: inset 0 0 0 1px #dadce0; font-size: 9px; color: #5f6368; white-space: nowrap; }
.${P}-dd svg { flex: none; width: 8px; height: 8px; fill: #5f6368; }
.${P}-sub { margin-bottom: 7px; }
.${P}-lab { height: 13px; margin-bottom: 4px; font-size: 9px; font-weight: 600; line-height: 13px; color: #3c4043; white-space: nowrap; }
.${P}-two { display: flex; gap: 6px; margin-bottom: 7px; }
.${P}-two .${P}-dd { flex: 1; min-width: 0; }
.${P}-sw { display: flex; gap: 4px; margin-bottom: 7px; }
.${P}-sw span { position: relative; flex: 1; display: grid; place-items: center; box-sizing: border-box; height: 28px; border-radius: 7px; background: #f1f3f4; }
.${P}-sw b { display: block; width: 13px; height: 13px; border-radius: 50%; }
.${P}-sw svg { width: 9px; height: 9px; fill: none; stroke: #5f6368; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-sw u { position: absolute; right: 5px; top: 5px; display: grid; place-items: center; width: 8px; height: 8px; border-radius: 50%; background: #fff; text-decoration: none; }
.${P}-sw u svg { width: 6px; height: 6px; stroke: #0b57d0; stroke-width: 2; }
.${P}-mk { display: flex; justify-content: flex-end; height: 24px; margin-bottom: 8px; }
.${P}-go { display: flex; align-items: center; gap: 4px; box-sizing: border-box; height: 24px; padding: 0 11px 0 9px; border-radius: 12px; background: #0b57d0; font-size: 9.5px; font-weight: 600; color: #fff; white-space: nowrap; }
.${P}-go svg { width: 10px; height: 10px; fill: none; stroke: #fff; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-rule { height: 1px; margin: 0 -${CARD_P}px; background: #e8eaed; }
.${P}-low { position: relative; padding-top: 9px; }
.${P}-pre { position: absolute; left: 0; right: 0; top: 9px; }
.${P}-note { font-size: 7.5px; line-height: 10.5px; color: #5f6368; }
.${P}-note u { color: #0b57d0; }
.${P}-insp { margin-top: 10px; padding: 8px; border-radius: 10px; background: #f8f9fc; }
.${P}-ih { display: flex; align-items: center; justify-content: space-between; height: 14px; font-size: 10px; font-weight: 600; color: #202124; }
.${P}-ih svg { width: 8px; height: 8px; fill: none; stroke: #5f6368; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ic { margin: 3px 0 5px; font-size: 7.5px; line-height: 10px; font-weight: 600; color: #0b57d0; white-space: nowrap; overflow: hidden; }
.${P}-ir { display: flex; gap: ${GAP}px; }
.${P}-ir i { display: block; flex: none; width: ${TILE - 8}px; height: ${TILE - 8}px; border-radius: 8px; }
.${P}-g { display: grid; grid-template-columns: repeat(${COLS}, ${TILE}px); gap: ${GAP}px; width: ${IW}px; }
.${P}-t { position: relative; width: ${TILE}px; height: ${TILE}px; border-radius: 9px; overflow: hidden; background: #ecf2fe; }
.${P}-t img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-pend { position: absolute; inset: 0; background: #ecf2fe; }
`;

const REF = 1.84;                                 // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const GEN_AT = 0.06;                              // the cursor presses Create
const ISSUE = 0.16;                               // the disclaimer and the Inspiration group give way to the ten skeleton tiles
const LAND = Array.from({ length: 10 }, (_, i) => 0.4 + i * 0.1425);   // tile i is painted over by its picture (reading order), the last at 1.68
const SHIM = 2.0 * (LAND[9] - ISSUE) / 5.5;       // the footage's ~2.0 s shimmer period scaled by this beat's pending window against the footage's 5.5 s
const STEP_C = 0.19, STEP_R = 0.11;               // how far a neighbour's shimmer is out of step, per column and per row (in cycles)

// the sampled shimmer colours, cycled #ECF2FE -> #F7FBFC -> #E1EDFA -> #ECF2FE
const KEY = [[0xec, 0xf2, 0xfe], [0xf7, 0xfb, 0xfc], [0xe1, 0xed, 0xfa]];
const MINT = [0xe2, 0xf3, 0xea];
const cyc = (u) => {
  const w = ((u % 1) + 1) % 1 * 3, i = Math.floor(w), f = w - i;
  const a = KEY[i % 3], b = KEY[(i + 1) % 3];
  return [0, 1, 2].map((k) => a[k] + (b[k] - a[k]) * f);
};
const mix = (a, b, f) => a.map((v, k) => v + (b[k] - v) * f);
const hex = (c) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
const wash = (u) => `linear-gradient(135deg, ${hex(cyc(u))} 0%, ${hex(cyc(u + 0.22))} 52%, ${hex(mix(cyc(u + 0.45), MINT, 0.55))} 100%)`;

const dd = (txt) => `<div class="${P}-dd"><span>${txt}</span><svg viewBox="0 0 10 10"><path d="M1.5 3.2h7L5 7.2z"/></svg></div>`;
const SW = ['#ea4335', '#1a73e8', '#fbbc04', '#34a853', '#3c4043'];

export default {
  id: 'chrome-ai-theme',
  label: 'Chrome Create theme with AI (2024)',
  source: {
    platform: "Google Chrome for desktop (Chrome 126, Windows 11, July 2024; the Customize Chrome side panel over the New Tab Page, light theme; a tutorial screen recording on YouTube)",
    feature: "New Tab Page beside the open Customize Chrome panel; Create theme with AI with Subject 'Lightning', Style 'Photography', Mood 'Dark', the swatch row and a blue Create pill; pressing Create swaps the disclaimer and the Inspiration group under the hairline for a 3-wide block of pale pastel skeleton tiles (no captions, no status text, spinner or percentage) shimmering #ECF2FE -> #F7FBFC -> #E1EDFA on a ~2.0 s period, then the same cells are painted over by the finished pictures (adapted to 10: a 3 + 3 + 3 + 1 block filling in reading order, all on screen with no scrolling)",
    videos: [
      { id: '-W93tyRZKAk', date: '2024-07-14', note: 'Brad Dale; Create pressed ~47.0 s, pending 47.0-52.5 s with the panel open, tiles resolved 52.5-53.4 s; the pending frames at 48.0 s and 50.5 s' },
      { id: 'Ue8DWQZ0KPI', date: '2023-12-12', note: 'BrenTech; context only: here the panel closes on Create, so no pending state is on camera' },
      { id: '1rA43IA8ByA', date: '2024-04-03', note: 'OnlineComputerTips; context only: the panel closes on Create' },
      { id: 'D3YEehbF4q4', date: '2024-01-23', note: 'context only: the education / description panel' },
      { id: '82lh287iHyo', date: '2024-06-12', note: 'context only: the education / description panel' },
    ],
    refs: [{ url: 'https://www.youtube.com/watch?v=-W93tyRZKAk', retrieved: '2026-10-14' }],
    extrapolated: [
      'ten tiles: the footage shows a 3-wide grid cut off at the panel edge (two rows visible, six tiles at most); a 3 + 3 + 3 + 1 block follows the same 3-column rule',
      'the panel is 232 px wide and the tiles 62 px square (the footage panel is ~270 px at its capture scale) so the whole ten-tile block, composer included, fits the fixed 512 px root with no scrolling',
      'the tiles land one at a time in reading order (about every 0.14 s of the beat); in the footage the whole grid is painted over within ~0.9 s, with no order measurable',
      "the shimmer period is the footage's ~2.0 s scaled into the beat (pending window against the footage's 5.5 s) and the per-tile phase offsets are estimated from the two pending frames",
      'the New Tab Page is not re-themed: the frames show it unchanged (white) through the landing, so no picture is applied to it',
      'the search box outline on the New Tab Page is drawn empty (the capture is cropped to the panel)',
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'chrome-ai-theme');
    const cell = (g, i) => `<div class="${P}-t"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; transform-origin: ${g.origin}"/><div class="${P}-pend"></div></div>`;
    const sw = SW.map((c, i) => `<span><b style="background: ${c}"></b>${i === 1 ? '<u><svg viewBox="0 0 8 8"><path d="M1.5 4.2l1.8 1.8L6.6 2"/></svg></u>' : ''}</span>`).join('')
      + '<span><svg viewBox="0 0 12 12"><path d="M8.6 1.6l1.8 1.8-1.5 1.5L7.1 3.1zM6.4 3.8l1.8 1.8-4.6 4.6H1.8V8.4z"/></svg></span>';
    const wash3 = ['linear-gradient(160deg, #cdd7c4, #e4c96f)', 'linear-gradient(160deg, #234b52, #e8b94b)', 'linear-gradient(160deg, #c3d8dc, #d8cc5e)'];
    const root = x.el(`<div class="${P}"><div class="${P}-ntp"><div class="${P}-apps">${'<i></i>'.repeat(9)}</div><div class="${P}-av"></div><div class="${P}-box"><svg viewBox="0 0 12 12"><circle cx="5" cy="5" r="3.4"/><path d="M7.6 7.6L10.8 10.8"/></svg></div><div class="${P}-fab ${P}-f1"><svg viewBox="0 0 12 12"><path d="M6 1.6v8.8M1.6 6h8.8"/></svg></div><div class="${P}-fab ${P}-f2"><svg viewBox="0 0 12 12"><path d="M8.4 1.8l1.8 1.8-6.2 6.2-2.4.6.6-2.4z"/></svg></div></div><div class="${P}-panel"><div class="${P}-grip"><i></i><i></i></div><div class="${P}-hd">Customize Chrome<svg viewBox="0 0 10 10"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg></div><div class="${P}-card"><div class="${P}-bar"></div><div class="${P}-back"><svg viewBox="0 0 10 10"><path d="M9 5H1.5M4.6 1.8L1.5 5l3.1 3.2"/></svg>Create theme with AI</div>${dd('Lightning').replace(`class="${P}-dd"`, `class="${P}-dd ${P}-sub"`)}<div class="${P}-lab">Add optional details</div><div class="${P}-two">${dd('Photography')}${dd('Dark')}</div><div class="${P}-sw">${sw}</div><div class="${P}-mk"><div class="${P}-go"><svg viewBox="0 0 12 12"><rect x="1.6" y="2.4" width="8.8" height="7.6" rx="1.6"/><path d="M3.4 8.4l2-2.4 1.4 1.6 1-1.2 1.2 2M9 1v3M7.5 2.5h3"/></svg>Create</div></div><div class="${P}-rule"></div><div class="${P}-low"><div class="${P}-pre"><div class="${P}-note">This is an experimental AI feature and won't always get it right. <u>Learn more</u></div><div class="${P}-insp"><div class="${P}-ih">Inspiration<svg viewBox="0 0 10 10"><path d="M2 5.5l3-2.6 3 2.6M2 9l3-2.6L8 9"/></svg></div><div class="${P}-ic">Meadow, Oil Painting, Intellectual, Yellow</div><div class="${P}-ir">${wash3.map((g) => `<i style="background: ${g}"></i>`).join('')}</div></div></div><div class="${P}-g" style="visibility: hidden">${tiles.map(cell).join('')}</div></div></div></div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const go = q('go'), pre = q('pre'), grid = q('g');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), pend: n.querySelector(`.${P}-pend`), g: tiles[i], col: i % COLS, row: Math.floor(i / COLS) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const sd = Math.min(s, LAND[9]);               // the shimmer stops at the last landing

        // Create is pressed (the panel, the composer and the button's label never change)
        const gp = press(s, GEN_AT, 0.06, 0.06, 0.14);
        put('go', gp.toFixed(3), () => { go.style.transform = gp > 0 ? `scale(${(1 - 0.05 * gp).toFixed(4)})` : 'none'; });

        // the disclaimer and the Inspiration group give way to the skeleton grid
        const on = s >= ISSUE;
        put('iss', on, (v) => { pre.style.display = v ? 'none' : ''; grid.style.visibility = v ? '' : 'hidden'; });

        cells.forEach((c, i) => {
          const a = LAND[i];
          put(`i${i}`, s >= a, (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.pend.style.display = v ? 'none' : ''; });
          c.im.style.filter = restFilter(c.g);
          c.im.style.transform = restTransform(c.g);
          // the pastel wash cycles with t (each tile a little out of step); a function of t alone, covered or not
          const u = sd / SHIM + c.col * STEP_C + c.row * STEP_R;
          const bg = wash(u);
          put(`w${i}`, bg, (v) => { c.pend.style.background = v; });
        });
      },
    };
  },
};
