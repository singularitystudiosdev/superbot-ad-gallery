// Storybird.ai (2024): the wait of one story, from a third-party desktop tutorial capture
// https://www.youtube.com/watch?v=tYFtEf6y9Mc (Matteo Orlandi, 2024-01-04, ~1600x900; the wait is uncut at t=296.0-316.5 s and the page lands at t=318 s, stills reveal-refs/storybird-ai/frames/storybird_{102_pending_start,
// 103_pending_bar,104_pending_bar2,105_pending_bar3,106_pending_near,107_landed}.png, spec .tmp/clone-9e82faf1/reveal-refs/storybird-ai/spec.json, confidence 0.63). Submitting the prompt swaps the page for a FULL-WINDOW
// overlay on a cream field: an autumn-forest illustration (orange trees, a dark green mass along the top, a bird, a cottage faint behind the panel), a dark-green top bar with the nav, and a centred translucent
// rounded panel holding a round cover thumbnail, a horizontal bar that fills left to right (black outline, grey track, green fill) and the two lines 'Setting up your story experience...' / 'This usually takes about
// 15 seconds'. When it is full the window shows, for a moment, a blank cream page with a small orange arc spinner, and then the story page: a title strip, the voice / page strip, 'Book Mode' / 'Video Mode' and the book
// spread in an orange frame. Here the scenery is our own flat-shape drawing (never the brand's artwork or mark), the spread holds the ten pictures as a 5 x 2 grid of illustration plates, each an empty cream plate
// that dissolves into its picture in strict reading order; system UI face with a serif for the caption, as the footage has.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-sbd';
const ROOT_W = 560, ROOT_H = 424;
const NAV_H = 34;
const PN_W = 224, PN_H = 196, PN_L = (ROOT_W - PN_W) / 2, PN_T = 118;      // the translucent panel
const BAR_L = 22, BAR_W = PN_W - 2 * BAR_L, BAR_T = 104;                    // the bar inside the panel
const PL_W = 80, PL_H = 92, PL_G = 10;                                      // a plate; 5 * 80 + 4 * 10 = 440, 2 * 92 + 10 = 194
const BK_T = 180, BK_L = 40, BK_W = 480, BK_PAD = 6, GRID_PAD = 14;         // the book spread
const BK_H = 2 * BK_PAD + 2 * GRID_PAD + 2 * PL_H + PL_G;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #f0e7d2; color: #231f20; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(60, 50, 30, .22); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { display: block; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
.${P}-g { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; }
.${P} svg.${P}-art { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; stroke: none; }
.${P}-nv { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${NAV_H}px; background: #304941; }
.${P}-nl { position: absolute; top: 0; height: ${NAV_H}px; font-size: 10px; line-height: ${NAV_H}px; font-weight: 700; color: #ffffff; }
.${P}-ul { position: absolute; left: 0; right: 0; top: 22px; height: 1.5px; background: #ffffff; }
.${P}-pn { position: absolute; left: ${PN_L}px; top: ${PN_T}px; box-sizing: border-box; width: ${PN_W}px; height: ${PN_H}px; border-radius: 12px; background: rgba(240, 232, 214, .8); box-shadow: 0 1px 4px rgba(50, 40, 20, .25), inset 0 0 0 1px rgba(255, 255, 255, .25); }
.${P}-ci { position: absolute; left: ${PN_W / 2 - 25}px; top: 26px; box-sizing: border-box; width: 50px; height: 50px; border-radius: 50%; overflow: hidden; background: #e8dcc4; box-shadow: 0 0 0 2px #f6efdf, 0 0 0 3.5px #d9a363; }
.${P}-ci .${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-ci img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-br { position: absolute; left: ${BAR_L}px; top: ${BAR_T}px; box-sizing: border-box; width: ${BAR_W}px; height: 10px; border: 1.5px solid #111111; border-radius: 6px; background: #d3d5d7; overflow: hidden; }
.${P}-fl { position: absolute; left: 0; top: 0; height: 100%; width: 0; background: #008106; }
.${P}-cp { position: absolute; left: 0; right: 0; top: 126px; text-align: center; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 13px; line-height: 18px; font-weight: 700; color: #050505; }
.${P}-sb { position: absolute; left: 0; right: 0; top: 152px; text-align: center; font-size: 8.5px; line-height: 12px; color: #1d1b1a; }
.${P}-sp { position: absolute; left: ${ROOT_W / 2 - 14}px; top: ${NAV_H + (ROOT_H - NAV_H) / 2 - 14}px; width: 28px; height: 28px; color: #d27d5a; }
.${P}-sp svg { width: 28px; height: 28px; stroke-width: 3; }
.${P}-sp .${P}-rg { stroke: rgba(210, 125, 90, .22); }
.${P}-ts { position: absolute; left: ${BK_L}px; top: 46px; box-sizing: border-box; width: ${BK_W}px; height: 54px; border-radius: 10px; background: #f6eedc; box-shadow: 0 0 0 1px #ecd9b5; }
.${P}-ti { position: absolute; left: 14px; top: 8px; font-size: 15px; line-height: 20px; font-weight: 800; color: #231f20; }
.${P}-tg { position: absolute; left: 14px; top: 31px; display: flex; align-items: center; gap: 6px; font-size: 8.5px; line-height: 14px; font-weight: 700; }
.${P}-tg span { box-sizing: border-box; padding: 0 8px; border: 1px solid #d27d5a; border-radius: 8px; color: #d27d5a; font-weight: 500; }
.${P}-ic { position: absolute; right: 14px; top: 11px; display: flex; gap: 9px; }
.${P}-ic svg { width: 12px; height: 12px; stroke-width: 1.8; color: #231f20; }
.${P}-ic svg:first-child { color: #1e8f5a; }
.${P}-vs { position: absolute; left: ${BK_L}px; top: 108px; box-sizing: border-box; width: ${BK_W}px; height: 34px; border-radius: 8px; background: #f4e5c2; box-shadow: 0 0 0 1px #ebd8b1; }
.${P}-vs .${P}-ln { position: absolute; left: 12px; right: 12px; top: 8px; height: 2.5px; border-radius: 2px; background: #111111; }
.${P}-vs .${P}-kn { position: absolute; left: 10px; top: 5.5px; width: 7px; height: 7px; border-radius: 50%; background: #111111; }
.${P}-vs p { position: absolute; top: 17px; font-size: 8.5px; line-height: 14px; font-weight: 700; color: #231f20; }
.${P}-vs p.${P}-gy { font-weight: 500; color: #9a9189; }
.${P}-vs svg { position: absolute; left: 280px; top: 18px; width: 12px; height: 12px; stroke-width: 1.5; }
.${P}-pl { position: absolute; top: 150px; box-sizing: border-box; height: 22px; border-radius: 11px; background: #d27d5a; color: #ffffff; text-align: center; font-size: 9px; line-height: 22px; font-weight: 700; }
.${P}-bk { position: absolute; left: ${BK_L}px; top: ${BK_T}px; box-sizing: border-box; width: ${BK_W}px; height: ${BK_H}px; padding: ${BK_PAD}px; border-radius: 8px 8px 4px 4px; background: #d27d5a; }
.${P}-pp { position: relative; width: 100%; height: 100%; border-radius: 3px; background: linear-gradient(90deg, #ffffff 0%, #f6f3ee 47%, #dcd6ca 50%, #f6f3ee 53%, #ffffff 100%); }
.${P}-gd { position: absolute; left: ${GRID_PAD}px; top: ${GRID_PAD}px; display: grid; grid-template-columns: repeat(5, ${PL_W}px); grid-template-rows: repeat(2, ${PL_H}px); gap: ${PL_G}px; }
.${P}-t { position: relative; box-sizing: border-box; width: ${PL_W}px; height: ${PL_H}px; background: #ffffff; overflow: hidden; box-shadow: 0 0 0 1px #e2d4bb, 0 1px 3px rgba(80, 50, 20, .22); }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #f1e7d3; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const OV_END = 0.96;                               // layout seconds: the overlay (the bar full at 0.94), then the blank cream page with its spinner
const BL_END = 1.18;                               // ... then the story page, its ten plates empty
const DIS = 0.14;                                  // one plate's dissolve into its picture (a cover's opacity), layout seconds
const LAND = Array.from({ length: 10 }, (_, i) => BL_END + 0.04 + i * ((1.78 - DIS - BL_END - 0.04) / 9));   // plate i starts to dissolve (strict reading order), the last is done at 1.78
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const TITLE = 'The Garden of Small Memes';           // our own story title, never the footage's

const el = (cx, cy, rx, ry, fill) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const trunk = (x, y0, y1, w) => `<path d="M${x} ${y0}V${y1}" stroke="#f8d4b4" stroke-width="${w}" fill="none"/>`;
const br = (d) => `<path d="${d}" stroke="#f8d4b4" stroke-width="1.6" fill="none"/>`;
// a stylised autumn tree: stacked foliage lobes in three warm tones over a pale trunk
const tree = (x, top, sc) => `${trunk(x, top - 6 * sc, 300, 3 * sc)}${br(`M${x} ${top + 40 * sc}L${x - 18 * sc} ${top + 14 * sc}M${x} ${top + 70 * sc}L${x + 20 * sc} ${top + 40 * sc}`)}`
  + el(x, top + 16 * sc, 22 * sc, 20 * sc, '#f8c590') + el(x, top + 42 * sc, 32 * sc, 24 * sc, '#f4b07a') + el(x, top + 70 * sc, 40 * sc, 28 * sc, '#ee9c6b') + el(x, top + 100 * sc, 44 * sc, 28 * sc, '#e58d5e') + el(x, top + 126 * sc, 38 * sc, 18 * sc, '#cf7b52');
const pale = (x, top, sc) => `${trunk(x, top, 300, 2.5 * sc)}` + el(x, top + 22 * sc, 18 * sc, 26 * sc, '#f7ead8') + el(x, top + 58 * sc, 26 * sc, 32 * sc, '#f7ead8') + el(x, top + 100 * sc, 32 * sc, 34 * sc, '#f7ead8');
const fern = (x, y, sc, c1, c2) => [[-28, -46, c1], [-8, -58, c2], [14, -52, c1], [30, -34, c2], [-40, -22, c2]].map(([dx, dy, c]) => `<path d="M${x} ${y}Q${x + dx * sc * 0.4} ${y + dy * sc * 0.6} ${x + dx * sc} ${y + dy * sc}Q${x + dx * sc * 0.7} ${y + dy * sc * 0.3} ${x} ${y}Z" fill="${c}"/>`).join('');
// the scenery, all of it flat shapes of our own: a dark green mass along the top with ragged lower edges, the orange trees either side, pale trees and a cottage faint at the centre, ferns at the foot, a bird
const ART = `<svg class="${P}-art" viewBox="0 0 ${ROOT_W} ${ROOT_H}">`
  + `<path d="M0 0H${ROOT_W}V56C548 66 540 90 532 106C524 122 508 112 500 94C494 82 486 74 476 84C464 98 470 120 456 130C444 138 438 116 428 102C418 90 402 84 390 66H170C152 78 134 76 122 94C110 112 98 132 86 146C74 158 66 128 56 116C46 104 30 104 18 120C10 130 4 128 0 124Z" fill="#304941"/>`
  + `<path d="M0 124C14 150 30 186 52 210C74 232 110 250 150 252C110 270 60 300 0 330Z" fill="#f3e6d3"/><path d="M${ROOT_W} 100C548 140 540 190 520 214C500 238 470 252 438 254C470 280 520 310 ${ROOT_W} 340Z" fill="#f3e6d3"/>`
  + el(96, 214, 40, 78, '#284a40') + el(190, 222, 22, 60, '#33584c') + el(450, 206, 36, 74, '#284a40') + el(372, 232, 20, 50, '#33584c')
  + pale(232, 150, 0.8) + pale(318, 128, 0.9) + el(280, 250, 46, 20, '#f1e1c8')
  + `<path d="M246 270V246L280 226L314 246V270Z" fill="#e6b27c"/><path d="M240 248L280 220L320 248Z" fill="#d99a63"/><path d="M266 270V252H282V270ZM292 250H304V262H292Z" fill="#c98a5c"/>`
  + tree(140, 62, 1) + tree(413, 66, 1) + tree(164, 168, 0.55) + tree(384, 150, 0.7)
  + el(68, 310, 50, 40, '#e8d3b6') + el(500, 318, 44, 36, '#e8d3b6')
  + fern(92, 372, 1.5, '#7ea593', '#5b8a79') + fern(122, 380, 1.1, '#e9994f', '#d97f3d') + fern(436, 346, 1.4, '#e9994f', '#d97f3d') + fern(466, 354, 1.1, '#7ea593', '#5b8a79')
  + `<path d="M232 54L246 70L262 58L248 48Z" fill="#e9994f"/><path d="M248 58L262 54L270 64L254 66Z" fill="#7a5a44"/>`
  + `</svg>`;
const ICONS = [
  '<circle cx="12" cy="12" r="3"/><path d="M2 12c3-5 7-7 10-7s7 2 10 7c-3 5-7 7-10 7s-7-2-10-7z"/>',
  '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  '<path d="M5 21V4M5 4h13l-3 4 3 4H5"/>',
  '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 11l7.6-4M8.2 13l7.6 4"/>',
  '<path d="M12 20l-7-7a4.5 4.5 0 016.4-6.4L12 7.2l.6-.6A4.5 4.5 0 0119 13z"/>',
];

export default {
  id: 'storybird-ai',
  label: 'Storybird.ai (2024)',
  source: {
    platform: 'storybird.ai story creator in a desktop browser (a third-party tutorial screen capture, ~1600x900)',
    feature: "after the prompt and the 'Select an image style' modal are submitted, a full-window overlay takes the page: an illustrated forest scene, a dark green top bar, and a centred translucent rounded panel with a round cover thumbnail, a horizontal bar that fills left to right and 'Setting up your story experience...' / 'This usually takes about 15 seconds'; then a blank cream page with a small orange spinner, then the story page (title strip, voice / page strip, 'Book Mode' / 'Video Mode', the book spread)",
    capture: {
      url: 'https://www.youtube.com/watch?v=tYFtEf6y9Mc',
      page: 'https://www.youtube.com/watch?v=tYFtEf6y9Mc',
      date: '2024-01-04',
      retrieved: '2026-10-17',
      timestamps: "t = 292.0 s the 'Select an image style' modal (storybird_101_style_modal); t = 296.0 s the overlay, bar empty, caption without its dots (storybird_102_pending_start); t = 300.0 / 306.0 / 312.0 / 316.5 s the bar green and growing, caption 'Setting up your story experience...' (storybird_103_pending_bar, _104_pending_bar2, _105_pending_bar3 shows the blank cream page with its orange spinner at ~312-317 s, _106_pending_near); t = 318.0 s the story page (storybird_107_landed); t = 325.0 s the book editor spread (storybird_108_landed_editor); uncut, no scene change at t = 294-318 s",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=tYFtEf6y9Mc', published: '2024-01-04', retrieved: '2026-10-17', note: "Creare STORIE ILLUSTRATE e LIBRI con l'Intelligenza Artificiale - Tutorial Storybird.ai (Matteo Orlandi, third-party); the only source of the wait" },
    ],
    extrapolated: [
      "the 10-up: the footage lands ONE story (a cover thumbnail and one page illustration); here the book spread holds ten pictures as a 5 x 2 grid of illustration plates, each an empty cream plate dissolving (a cover's opacity) into its picture in strict reading order; the spread's text page is not drawn, the grid spans both pages with the spine behind it",
      "the story page's content: the title 'The Garden of Small Memes' and its 'Adventure' tag are our own (the footage's story is another language and another title); the footage's byline, date, description, 'Check out ...' banner and the right-hand 'Do you like this story?' panel with its four buttons are left out",
      "the bar's colour: the footage bar is a solid green fill (no violet or pink) on a grey track with a black outline, filling in a few jumps; here the same green fill is a continuous pure function of t, full at 0.94 layout seconds",
      'the pace: the footage waits ~20 s on the overlay and ~1 s on the blank page; the beat plays the same overlay -> blank page -> story page shape in the ~1.8 s window every module of this family uses, and the caption is shown with its dots throughout (the footage drops them for the first second only)',
      "the scenery and the size: the footage shows the brand's own forest illustration at ~1280 px wide; here it is redrawn 560 px wide as flat shapes of our own (orange trees, dark green mass, a cottage, a bird, ferns), the thumbnail is one of our pictures, and the top bar keeps only the nav labels 'Create' / 'Library' / 'Blog'",
      "omitted from the footage: the 'StoryBird.ai' mark and its mascot (the footage's panel thumbnail), the 'Dashboard' account link, the '$3.00' balance and its menu, the cursor",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'storybird-ai');
    const srcCover = ownSrc(ctx.src, 'storybird-ai-cover');   // the overlay's round thumbnail: its own URL, a different decode size from the 80 x 92 plates
    const cg = tiles[2];
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv" style="transform-origin: ${g.origin}; transform: ${g.zoom === 1 ? 'none' : `scale(${(1 / g.zoom).toFixed(5)})`}"></div></div></div>`;
    const nav = [['Create', 350], ['Library', 394], ['Blog', 442]].map(([l, lx]) => `<p class="${P}-nl" style="left: ${lx}px">${l}<span class="${P}-ul" style="visibility: hidden;"></span></p>`).join('');
    const root = x.el(`<div class="${P}">`
      // the overlay: the scenery under a translucent panel
      + `<div class="${P}-g ${P}-ov">${ART}<div class="${P}-pn"><div class="${P}-ci"><div class="${P}-z" style="transform-origin: ${cg.origin}; transform: ${restTransform(cg)}"><img src="${srcCover}" width="870" height="1024" decoding="sync" alt="Story cover" style="filter: ${restFilter(cg)}"/></div></div>`
      + `<div class="${P}-br"><div class="${P}-fl"></div></div><p class="${P}-cp">Setting up your story experience...</p><p class="${P}-sb">This usually takes about 15 seconds</p></div></div>`
      // the blank cream page and its spinner
      + `<div class="${P}-g ${P}-bl"><div class="${P}-sp"><svg viewBox="0 0 24 24"><circle class="${P}-rg" cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9"/></svg></div></div>`
      // the story page: the title strip, the voice / page strip, the mode pills and the book spread holding the ten plates
      + `<div class="${P}-g ${P}-pg"><div class="${P}-ts"><p class="${P}-ti">${TITLE}</p><div class="${P}-tg"><p>Tags:</p><span>Adventure</span></div><div class="${P}-ic">${ICONS.map((d) => `<svg viewBox="0 0 24 24">${d}</svg>`).join('')}</div></div>`
      + `<div class="${P}-vs"><div class="${P}-ln"></div><div class="${P}-kn"></div><p style="left: 12px">Select a voice</p><p class="${P}-gy" style="left: 218px">Previous Page</p><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/></svg><p style="left: 300px">Next Page</p></div>`
      + `<p class="${P}-pl" style="left: 198px; width: 76px">Book Mode</p><p class="${P}-pl" style="left: 282px; width: 80px">Video Mode</p>`
      + `<div class="${P}-bk"><div class="${P}-pp"><div class="${P}-gd">${tiles.map(cell).join('')}</div></div></div></div>`
      + `<div class="${P}-nv">${nav}</div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const ov = q('ov'), bl = q('bl'), pg = q('pg'), fl = q('fl'), sa = q('sp').querySelector('svg');
    const uls = [...root.querySelectorAll(`.${P}-ul`)];
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate([root.querySelector(`.${P}-ci img`), ...cells.map((c) => c.im)]);

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };
    const show = (n, on) => { n.style.visibility = on ? '' : 'hidden'; };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const phase = s < OV_END ? 0 : s < BL_END ? 1 : 2;   // the overlay, the blank page, the story page

        put('ph', phase, (v) => { show(ov, v === 0); show(bl, v === 1); show(pg, v === 2); show(uls[0], v === 0); show(uls[1], v > 0); });
        // the bar: a pure function of s, whole pixels, full at 0.94 and held
        const w = Math.round(clamp01(s / 0.94) * (BAR_W - 3));
        put('fl', w, (v) => { fl.style.width = `${v}px`; });
        // the page's arc spinner: its angle is a function of t alone, whole degrees
        const ang = Math.floor((Math.min(s, BL_END) * 720) % 360);
        put('sp', ang, (a) => { sa.style.transform = `rotate(${a}deg)`; });

        cells.forEach((c, i) => {
          const d = phase === 2 ? clamp01((s - LAND[i]) / DIS) : 0;
          const cov = Math.round((1 - d) * 20) / 20;      // the plate cover's opacity, a pure function of s
          put(`i${i}`, cov, () => {
            c.im.style.visibility = cov < 1 ? '' : 'hidden';
            c.cv.style.opacity = cov === 1 ? '' : String(cov);
            c.cv.style.display = cov === 0 ? 'none' : '';
          });
        });
      },
    };
  },
};
