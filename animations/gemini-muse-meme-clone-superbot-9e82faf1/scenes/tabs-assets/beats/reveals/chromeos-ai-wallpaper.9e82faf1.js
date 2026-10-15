// ChromeOS 'Create with AI' wallpaper on a Chromebook Plus: Settings > Wallpaper and style > Wallpaper > Create with AI (YouTube D5By-OW7Bzo,
// Expert Reviews, 2024-05-29, Create tapped ~25.8 s, PENDING 25.8-27.7 s, results ~27.8 s; the hi-res run at ~32-37 s; corroborated by 7NXuDC8nZn8,
// 2024-09-15; spec .tmp/clone-9e82faf1/reveal-refs/chromeos-ai-wallpaper/spec.json, confidence 0.58; frames av_setup_create.png, av_pending_creating.png,
// av_hirez_pending.png, av_result.png, av_pending_sheet.png). The wallpaper app is a pale window: a peach header band holding the breadcrumb
// (home > Wallpaper > Create with AI > Surreal), a row of prompt chips (flowers / pools / snow / glowing bubbles, the picked one brown), the prompt
// 'A surreal lake with snow' with two dotted slots under it, and two pills 'Inspire me' and the solid brown 'Create', over a page-grey results area
// that shows an empty-state illustration with 'Select 'Create' to create an image with AI.' / 'All created images will automatically appear here.'.
// Tapping 'Create' removes the chip row and swaps the pill row for the small grey caption 'Creating images...' (always three literal dots, no
// spinner, bar or percentage); the illustration gives way to the header 'Wallpaper powered by Google AI' over a two-column grid of rounded
// landscape tiles, each a soft pastel mint-and-blue gradient that fades in together and drifts slowly. About two seconds later the gradients
// sharpen in place into the pictures, the caption clears and the pills return as 'Inspire me' / 'Recreate'; the footage's grid grows downward as rows are added.
// Adapted to ten images: the footage shows four, so ten smaller tiles (about 1.9:1, five rows of two) fill the same two-column grid and land in
// reading order with the whole block on screen at the end and no scrolling at any time. Extrapolated: tiles 5-10, the smaller tile size, and the
// pill row coming back only once the tenth has landed (the footage shows it with the first four). Omitted: the laptop bezel and keyboard, the
// reviewer's hands, the shelf, the Settings sidebar and the window chrome, the 'Create hi-res image' action, the per-tile ratings, the watermark and
// the desk.
// The footage's pictures and illustration are never reproduced: every tile is our own meme, the illustration is a plain arc and sparkle.
import { seg, press } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-caw';
const ROOT_H = 560, TOP_H = 128, HEAD_H = 28, TILE_W = 140, TILE_H = 74, GAP = 6, GRID_W = 2 * TILE_W + GAP;   // five rows of two tiles fill the pane: nothing scrolls
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: 560px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #eef1f4; color: #3c3a39; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #ddd2ca; }
.${P}-top { position: absolute; left: 0; right: 0; top: 0; height: ${TOP_H}px; background: #f3e4db; }
.${P}-crumb { position: absolute; left: 18px; top: 8px; display: flex; align-items: center; gap: 7px; height: 16px; font-size: 11px; color: #3c3a39; white-space: nowrap; }
.${P}-crumb svg { flex: none; width: 10px; height: 10px; fill: none; stroke: #6b625d; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-crumb .${P}-home { width: 12px; height: 12px; stroke: #3c3a39; }
.${P}-chips { position: absolute; left: 0; right: 0; top: 34px; display: flex; justify-content: center; gap: 8px; }
.${P}-chip { display: flex; align-items: center; gap: 6px; box-sizing: border-box; height: 26px; padding: 0 10px 0 4px; border-radius: 13px; background: #f8efe9; font-size: 10.5px; color: #3c3a39; white-space: nowrap; }
.${P}-chip i { display: block; width: 18px; height: 18px; border-radius: 50%; }
.${P}-chip.${P}-pick { background: #7d4528; color: #fff; box-shadow: 0 0 0 1.5px #f3e4db, 0 0 0 3px #c28b66; }
.${P}-prompt { position: absolute; left: 0; right: 0; text-align: center; font-size: 17px; line-height: 24px; color: #8d8782; white-space: nowrap; }
.${P}-prompt u { text-decoration: none; padding-bottom: 2px; background: linear-gradient(90deg, #8d8782 50%, transparent 50%) 0 100% / 3px 1px repeat-x; }
.${P}-prompt b { font-weight: 400; color: #2d2b2a; }
.${P}-row { position: absolute; left: 0; right: 0; top: 96px; display: flex; justify-content: center; gap: 12px; height: 30px; }
.${P}-pill { display: flex; align-items: center; gap: 6px; box-sizing: border-box; height: 30px; padding: 0 14px 0 11px; border-radius: 15px; background: #f5dccd; font-size: 11px; font-weight: 500; color: #3a2a21; white-space: nowrap; }
.${P}-pill svg { flex: none; width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-pill.${P}-solid { background: #7d4528; color: #fff; }
.${P}-cap { position: absolute; left: 0; right: 0; top: 84px; text-align: center; font-size: 10px; line-height: 14px; color: #5a5a5a; }
.${P}-low { position: absolute; left: 0; right: 0; top: ${TOP_H}px; bottom: 0; }
.${P}-es { position: absolute; left: 0; right: 0; top: 80px; display: flex; flex-direction: column; align-items: center; text-align: center; }
.${P}-es svg { display: block; width: 120px; height: 100px; margin-bottom: 18px; }
.${P}-es span { font-size: 12px; line-height: 18px; color: #4a4745; }
.${P}-es small { font-size: 10.5px; line-height: 16px; color: #7a7673; }
.${P}-hd { position: absolute; left: ${(560 - GRID_W) / 2}px; top: 8px; font-size: 10.5px; line-height: 14px; color: #5a5a5a; }
.${P}-vp { position: absolute; left: 0; right: 0; top: ${HEAD_H}px; bottom: 0; overflow: hidden; }
.${P}-g { display: grid; grid-template-columns: repeat(2, ${TILE_W}px); gap: ${GAP}px; width: ${GRID_W}px; margin: 0 auto; }
.${P}-t { position: relative; height: ${TILE_H}px; border-radius: 10px; overflow: hidden; background: #dfe6ea; }
.${P}-t img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-pend { position: absolute; inset: 0; background-color: #bfe3d2; background-size: 220% 220%; }
.${P}-pend::after { content: ""; position: absolute; inset: 0; background-image: radial-gradient(rgba(255, 255, 255, .5) 0.6px, transparent 0.8px), radial-gradient(rgba(60, 90, 110, .22) 0.6px, transparent 0.8px); background-size: 3px 3px, 5px 5px; background-position: 0 0, 1px 2px; opacity: .3; }
`;

const PROMPT = ['A ', 'surreal', ' lake with ', 'snow'];
const REF = 1.84;                                 // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const GEN_AT = 0.06;                              // the cursor presses Create
const ISSUE = 0.16;                               // the empty state gives way to the ten pending tiles; the chips go, the caption replaces the pills
const FADE_IN = 0.1;                              // the pending tiles fade in together over this long
const LAND = Array.from({ length: 10 }, (_, i) => 0.42 + i * 0.14);   // tile i resolves in place (reading order), the last at 1.68
const FADE = 0.07;                                // the gradient thins away over this long before the picture lands
const SPARK = '<svg viewBox="0 0 24 24"><path d="M12 3.5l1.6 4.4 4.4 1.6-4.4 1.6L12 15.5l-1.6-4.4L6 9.5l4.4-1.6z"/><path d="M18.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/></svg>';
const GRAD = [
  ['#86d3b0', '#e2ecb4', '#a9ddc6'],               // mint into pale yellow
  ['#8fbbea', '#b4e0c9', '#86d3b0'],               // pale blue into mint
  ['#98c6e8', '#7fd0aa', '#c8e8d2'],
  ['#7fd0aa', '#a5cdee', '#d3ecd6'],
];

export default {
  id: 'chromeos-ai-wallpaper',
  label: 'ChromeOS AI wallpaper (2024)',
  source: {
    platform: "ChromeOS Wallpaper & style app 'Create with AI' on a Chromebook Plus (desktop, light theme; a hands-on review filmed on an ASUS Chromebook Plus, Expert Reviews, 2024)",
    feature: "peach header band with the breadcrumb, prompt chips and the prompt 'A surreal lake with snow' over two pills, 'Create' swapped for the caption 'Creating images...' while the 'Wallpaper powered by Google AI' grid shows rounded pastel mint-and-blue gradient tiles that fade in together and drift (no spinner, bar or percentage), then the gradients sharpen in place into the pictures and the pills return as 'Inspire me' / 'Recreate' (adapted to 10: a two-column grid of five rows of smaller tiles, all on screen, landing in reading order with no scrolling; the hi-res action, ratings, window chrome and shelf are omitted)",
    videos: [
      { id: 'D5By-OW7Bzo', date: '2024-05-29', note: 'Expert Reviews, tap t=25.8 s, pending 25.8-27.7 s, results ~27.8 s' },
      { id: '7NXuDC8nZn8', date: '2024-09-15', note: 'corroborating layout only' },
    ],
    refs: [{ url: 'https://www.youtube.com/watch?v=D5By-OW7Bzo', retrieved: '2026-10-14' }],
    extrapolated: [
      'ten tiles: the footage shows four; tiles 5-10 follow the same two-column rule, one tile every 0.14 s in reading order',
      'the tiles shrink to about 140x74 px (the footage tiles are about 1.8:1 and larger) so five rows of two fit the fixed root without scrolling',
      "the 'Inspire me' / 'Recreate' pills come back once the tenth tile has landed (the footage shows them with the first four)",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'chromeos-ai-wallpaper');
    const cell = (g, i) => `<div class="${P}-t"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; transform-origin: ${g.origin}"/><div class="${P}-pend"></div></div>`;
    const chev = '<svg viewBox="0 0 12 12"><path d="M4.5 3l3 3-3 3"/></svg>';
    const home = `<svg class="${P}-home" viewBox="0 0 12 12"><path d="M1.5 6L6 1.8 10.5 6M2.8 5.2v4.8h2.4V7.5h1.6V10h2.4V5.2"/></svg>`;
    const chip = (word, bg, on) => `<span class="${P}-chip${on ? ` ${P}-pick` : ''}"><i style="background: ${bg}"></i>${word}</span>`;
    const illo = '<svg viewBox="0 0 120 100"><path d="M20 62C16 32 48 10 78 14c24 3 38 24 32 46" fill="none" stroke="#c2d9cb" stroke-width="5" stroke-linecap="round"/><path d="M92 28c10 8 14 22 8 36" fill="none" stroke="#9db8e0" stroke-width="5" stroke-linecap="round"/><circle cx="62" cy="58" r="15" fill="#e5c3ad"/><path d="M40 92c2-18 12-26 22-26s20 8 22 26z" fill="#ead7ca"/><path d="M24 74l5 11 11 5-11 5-5 11-5-11-11-5 11-5z" fill="#8d5a3b" transform="translate(-4 -22) scale(.9)"/></svg>';
    const root = x.el(`<div class="${P}"><div class="${P}-top"><div class="${P}-crumb">${home}${chev}Wallpaper${chev}Create with AI${chev}Surreal<svg viewBox="0 0 12 12"><path d="M3 4.5l3 3 3-3"/></svg></div><div class="${P}-chips">${chip('flowers', 'radial-gradient(circle at 35% 35%, #f2b6bd, #a4414e)', false)}${chip('pools', 'radial-gradient(circle at 35% 35%, #7fe0cf, #1e7f86)', false)}${chip('snow', 'radial-gradient(circle at 35% 35%, #c3d5ef, #283a68)', true)}${chip('glowing bubbles', 'radial-gradient(circle at 35% 35%, #d7e3ee, #5f7f99)', false)}</div><div class="${P}-prompt">${PROMPT[0]}<u>${PROMPT[1]}</u>${PROMPT[2]}<u><b>${PROMPT[3]}</b></u></div><div class="${P}-row"><span class="${P}-pill">${SPARK}Inspire me</span><span class="${P}-pill ${P}-solid ${P}-mk">${SPARK}Create</span><span class="${P}-pill ${P}-solid ${P}-rk" style="display: none">${SPARK}Recreate</span></div><div class="${P}-cap" style="display: none">Creating images...</div></div><div class="${P}-low"><div class="${P}-es">${illo}<span>Select 'Create' to create an image with AI.</span><small>All created images will automatically appear here.</small></div><div class="${P}-hd" style="visibility: hidden">Wallpaper powered by Google AI</div><div class="${P}-vp" style="visibility: hidden"><div class="${P}-g">${tiles.map(cell).join('')}</div></div></div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const chips = q('chips'), prompt = q('prompt'), mk = q('mk'), rk = q('rk'), cap = q('cap'), es = q('es'), hd = q('hd'), vp = q('vp'), grid = q('g');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), pend: n.querySelector(`.${P}-pend`), g: tiles[i] }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const sd = Math.min(s, LAND[9]);               // everything that drifts from t stops at the last landing

        // Create is pressed (the label never changes while it is on screen)
        const gp = press(s, GEN_AT, 0.06, 0.06, 0.14);
        put('go', gp.toFixed(3), () => { mk.style.transform = gp > 0 ? `scale(${(1 - 0.05 * gp).toFixed(4)})` : 'none'; });

        // 0: ready (chips, Create, the empty state) / 1: creating (caption, pending grid) / 2: landed (Inspire me / Recreate)
        const ph = s < ISSUE ? 0 : s < LAND[9] ? 1 : 2;
        put('ph', ph, (v) => {
          chips.style.display = v === 0 ? '' : 'none';
          prompt.style.top = v === 0 ? '68px' : '40px';
          mk.style.display = v === 0 ? '' : 'none';
          rk.style.display = v === 2 ? '' : 'none';
          q('row').style.display = v === 1 ? 'none' : '';
          q('row').style.top = v === 0 ? '98px' : '80px';
          cap.style.display = v === 1 ? '' : 'none';
          es.style.display = v === 0 ? '' : 'none';
          hd.style.visibility = v === 0 ? 'hidden' : '';
          vp.style.visibility = v === 0 ? 'hidden' : '';
        });

        // the pending tiles fade in together (the grid never scrolls: all ten tiles are on screen throughout)
        const fi = seg(s, ISSUE, ISSUE + FADE_IN);
        put('fi', fi.toFixed(3), () => { grid.style.opacity = fi >= 1 ? '' : fi.toFixed(3); });

        cells.forEach((c, i) => {
          const a = LAND[i];
          const f = seg(s, a - FADE, a);
          put(`i${i}`, s >= a - FADE, (v) => { c.im.style.visibility = v ? '' : 'hidden'; });
          c.im.style.filter = restFilter(c.g);
          c.im.style.transform = restTransform(c.g);
          const gr = GRAD[i % GRAD.length];
          // the gradient drifts slowly while pending (a function of t alone, covered or not) and thins away just before the picture lands
          const px = 50 + 38 * Math.sin(sd * 2.1 + i * 0.9), py = 50 + 38 * Math.cos(sd * 1.7 + i * 1.3);
          put(`g${i}`, `${px.toFixed(1)},${py.toFixed(1)}`, () => {
            c.pend.style.backgroundImage = `radial-gradient(circle at 20% 25%, ${gr[0]}, transparent 62%), radial-gradient(circle at 80% 70%, ${gr[1]}, transparent 66%), linear-gradient(135deg, ${gr[2]}, ${gr[0]})`;
            c.pend.style.backgroundPosition = `${px.toFixed(1)}% ${py.toFixed(1)}%`;
          });
          put(`c${i}`, f.toFixed(3), () => {
            if (f >= 1) { c.pend.style.display = 'none'; c.pend.style.opacity = ''; } else { c.pend.style.display = ''; c.pend.style.opacity = f > 0 ? (1 - f).toFixed(3) : ''; }
          });
        });
      },
    };
  },
};
