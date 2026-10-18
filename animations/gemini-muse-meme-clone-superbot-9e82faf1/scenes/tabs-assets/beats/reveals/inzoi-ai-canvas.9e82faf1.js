// inZOI 'Generate AI Texture' (Krafton, 2025): the wait of one pattern, from two third-party gameplay captures of the in-game texture generator
// https://www.youtube.com/watch?v=1j_meYoNyLU (My Gameplay Diary, 2025-04-21, 1080p60: the prompt popup t=292.5 s, hard cut into the loader t=293.1 s, loader t=293.5-296.2 s, dissolve out t=296.4 s, the 'Result' card t=296.8 s)
// https://www.youtube.com/watch?v=r6K8G_xgO88 (StoryDea, 2025-04-08, 1080p30: the popup t=741 s, the loader t=742.7-747.8 s, the Result card t=748-749 s); stills reveal-refs/inzoi-ai-canvas/frames/{mygd_t292.5,mygd_t293.5,mygd_t294.5,
// mygd_t295.5,mygd_t296.3,mygd_t296.8,storydea_t741,storydea_t745,storydea_t749}.png, spec .tmp/clone-9e82faf1/reveal-refs/inzoi-ai-canvas/spec.json, confidence 0.78. The surface is the game's editor with a small
// 'Generate AI Texture' dialog (title, info glyph, close, a one-line prompt box and a pale-blue 'Create' button). Pressing Create is a HARD CUT to a full-screen takeover: pale-blue blueprint backdrop with faint drafting
// line art in the corners (a jointed arm, gears, a compass, a pencil and a ruler), a big near-white glow, a white disc in a grey tick ring holding a clock whose hands sweep round, the bold caption 'Generating AI Texture...'
// and the sub-line 'This may take some time.'; no bar, no percent. It ends in a ~0.15 s cross-dissolve back to the editor, where a small white 'Result' card (the swatch, 'Close', 'Save') sits over the panel and the new
// pattern is the first tile of 'My Texture'. Here the editor is a neutral flat layout (a grey stage with a plain cushion shape, a category panel, a swatch grid; no 3D room, no character), the line art is our own sparse
// strokes, the prompt is our own, and the Result card holds the ten pictures as a 5 x 2 sheet whose empty plates dissolve into their pictures in strict reading order.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-izc';
const ROOT_W = 560, ROOT_H = 440;
const TW = 46, TH = 54, TG = 3;                                              // a tile; 5 * 46 + 4 * 3 = 242, 2 * 54 + 3 = 111
const CD_L = 290, CD_T = 30, CD_W = 262, CD_H = 214;                         // the Result card
const GD_L = (CD_W - (5 * TW + 4 * TG)) / 2, GD_T = 32;
const CX = ROOT_W / 2, CY = 190;                                             // the loader's clock centre
const RING = 108, FACE = 70;
const SW = ['#f0b8d8', '#c9d4f5', '#9fd6e8', '#f5b9c4', '#c26fd0', '#f08fb8', '#e07fa6', '#7d6fd6', '#d9c6f0', '#f3a45a', '#f2d66b', '#9fd8b8', '#a4b6c9', '#e8a2e0', '#6a56c4', '#e8b4f0', '#5bc6c0', '#9aa0aa', '#e5c0a0', '#f0809a', '#4f9ad8'];
const NEWSW = 'linear-gradient(135deg, #e85aa6 0%, #c24fd0 45%, #f08fb8 100%)';
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: linear-gradient(180deg, #b6b9c1 0%, #a2a6b0 55%, #8f939e 100%); color: #3a3d44; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(40, 44, 56, .3); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { display: block; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
.${P}-g { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; }
.${P}-gb { position: absolute; left: 12px; top: 10px; font-size: 9.5px; line-height: 14px; color: #ffffff; letter-spacing: .1px; }
.${P}-gb svg { position: absolute; left: -2px; top: 1px; width: 12px; height: 12px; stroke-width: 2; }
.${P}-gb span { display: inline-block; margin-left: 14px; opacity: .85; }
.${P}-sg { position: absolute; left: 82px; top: 148px; width: 150px; height: 190px; }
.${P}-cu { position: absolute; left: 14px; top: 0; width: 122px; height: 150px; border-radius: 46% 46% 32% 32% / 40% 40% 24% 24%; background: radial-gradient(ellipse at 38% 28%, #eceef2 0%, #cfd2d9 55%, #b3b7c0 100%); box-shadow: inset -10px -12px 22px rgba(90, 96, 110, .25); }
.${P}-fl { position: absolute; left: -14px; top: 140px; width: 178px; height: 34px; border-radius: 50%; background: radial-gradient(ellipse, rgba(70, 76, 90, .3) 0%, rgba(70, 76, 90, 0) 70%); }
.${P}-pa { position: absolute; left: 296px; top: 30px; box-sizing: border-box; width: 256px; height: 190px; border-radius: 8px; background: rgba(255, 255, 255, .62); box-shadow: 0 0 0 1px rgba(255, 255, 255, .5); }
.${P}-pt { position: absolute; left: 12px; top: 8px; font-size: 10px; line-height: 14px; font-weight: 700; color: #4c5058; }
.${P}-rs { position: absolute; right: 38px; top: 7px; box-sizing: border-box; height: 17px; padding: 0 9px; border-radius: 9px; background: #ffffff; font-size: 8px; line-height: 17px; color: #4c5058; }
.${P}-xx { position: absolute; right: 10px; top: 7px; width: 17px; height: 17px; border-radius: 50%; background: #ffffff; color: #4c5058; }
.${P}-xx svg { position: absolute; left: 4.5px; top: 4.5px; width: 8px; height: 8px; stroke-width: 2.2; }
.${P}-ls { position: absolute; left: 12px; top: 30px; width: 74px; }
.${P}-ls p { height: 22px; font-size: 8.5px; line-height: 22px; color: #6a6e77; }
.${P}-ls p.${P}-on { color: #2f3238; font-weight: 700; }
.${P}-th { position: absolute; top: 36px; box-sizing: border-box; width: 48px; height: 48px; border-radius: 50%; background: #d4d7de; box-shadow: inset 0 0 0 2px #ffffff; }
.${P}-th.${P}-sel { box-shadow: inset 0 0 0 2px #ffffff, 0 0 0 2px #8fc4f4; }
.${P}-pb { position: absolute; left: 296px; top: 232px; box-sizing: border-box; width: 256px; height: 198px; border-radius: 8px; background: #ffffff; box-shadow: 0 3px 10px rgba(50, 56, 70, .22); }
.${P}-tb { position: absolute; left: 10px; top: 8px; width: 236px; height: 20px; border-radius: 10px; background: #eceef2; }
.${P}-tb p { position: absolute; top: 0; width: 118px; height: 20px; text-align: center; font-size: 8.5px; line-height: 20px; color: #6a6e77; }
.${P}-tb p.${P}-on { left: 0; border-radius: 10px; background: #ffffff; color: #2f3238; box-shadow: 0 0 0 1px #dde0e6; }
.${P}-tb p.${P}-of { left: 118px; }
.${P}-ct { position: absolute; left: 10px; top: 36px; width: 236px; height: 18px; }
.${P}-bt { position: absolute; top: 0; height: 18px; border-radius: 9px; background: #d8ecfb; color: #4d93d3; }
.${P}-bt svg { position: absolute; left: 50%; top: 50%; width: 11px; height: 11px; margin: -5.5px 0 0 -5.5px; stroke-width: 1.8; }
.${P}-sw { position: absolute; left: 10px; top: 62px; width: 236px; height: 90px; }
.${P}-sd { position: absolute; box-sizing: border-box; width: 26px; height: 26px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(60, 66, 80, .12); }
.${P}-s0 { background: ${SW[0]}; }
.${P}-s0.${P}-nw { background: ${NEWSW}; }
.${P}-sl { position: absolute; left: 12px; right: 12px; height: 20px; font-size: 7.5px; line-height: 10px; color: #6a6e77; }
.${P}-sl i { position: absolute; left: 0; right: 28px; top: 14px; height: 2px; border-radius: 1px; background: #dde0e6; }
.${P}-sl i b { position: absolute; top: -2px; width: 6px; height: 6px; border-radius: 50%; background: #9fc9ee; }
.${P}-sl em { position: absolute; right: 0; top: 0; font-style: normal; }
.${P}-dl { position: absolute; left: 318px; top: 96px; box-sizing: border-box; width: 226px; height: 112px; border-radius: 8px; background: #ffffff; box-shadow: 0 4px 14px rgba(40, 46, 60, .3); }
.${P}-dl h4 { position: absolute; left: 10px; top: 9px; margin: 0; font-size: 10px; line-height: 14px; font-weight: 700; color: #2f3238; }
.${P}-dl svg.${P}-in { position: absolute; left: 124px; top: 11px; width: 10px; height: 10px; stroke-width: 1.6; color: #8fc4f4; }
.${P}-dl svg.${P}-cl { position: absolute; right: 9px; top: 11px; width: 10px; height: 10px; stroke-width: 2.2; color: #3a3d44; }
.${P}-pr { position: absolute; left: 10px; top: 30px; box-sizing: border-box; width: 206px; height: 26px; border-radius: 3px; background: #ffffff; box-shadow: 0 0 0 1px #6fb0ee; font-size: 8.6px; line-height: 26px; padding: 0 7px; color: #25282e; }
.${P}-pr .${P}-cr { display: inline-block; width: 1px; height: 11px; margin: 0 0 -2px 1px; background: #25282e; }
.${P}-cb { position: absolute; left: 58px; top: 68px; box-sizing: border-box; width: 110px; height: 28px; border-radius: 14px; background: #a9d3f6; color: #ffffff; text-align: center; font-size: 10px; line-height: 28px; font-weight: 500; }
.${P}-rc { position: absolute; left: ${CD_L}px; top: ${CD_T}px; box-sizing: border-box; width: ${CD_W}px; height: ${CD_H}px; border-radius: 8px; background: #ffffff; box-shadow: 0 4px 14px rgba(40, 46, 60, .3); }
.${P}-rc h4 { position: absolute; left: 10px; top: 9px; margin: 0; font-size: 10px; line-height: 14px; font-weight: 700; color: #2f3238; }
.${P}-gd { position: absolute; left: ${GD_L}px; top: ${GD_T}px; display: grid; grid-template-columns: repeat(5, ${TW}px); grid-template-rows: repeat(2, ${TH}px); gap: ${TG}px; }
.${P}-t { position: relative; box-sizing: border-box; width: ${TW}px; height: ${TH}px; border-radius: 4px; background: #e6e9ee; overflow: hidden; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #e6e9ee; }
.${P}-b1, .${P}-b2 { position: absolute; left: 10px; box-sizing: border-box; width: ${CD_W - 20}px; height: 24px; border-radius: 12px; text-align: center; font-size: 9.5px; line-height: 24px; }
.${P}-b1 { top: 152px; background: #ffffff; color: #3a3d44; box-shadow: inset 0 0 0 1px #c9ccd3; }
.${P}-b2 { top: 180px; background: #a9d3f6; color: #ffffff; font-weight: 500; }
.${P}-lo { background: #d0e4f1; overflow: hidden; }
.${P}-lo .${P}-gr { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; background: linear-gradient(rgba(255, 255, 255, .28) 1px, rgba(255, 255, 255, 0) 1px) 0 0 / 7px 7px, linear-gradient(90deg, rgba(255, 255, 255, .28) 1px, rgba(255, 255, 255, 0) 1px) 0 0 / 7px 7px; }
.${P}-gw { position: absolute; left: ${CX - 210}px; top: ${CY - 205}px; width: 420px; height: 410px; border-radius: 50%; background: radial-gradient(ellipse at 50% 50%, #fefefe 0%, #f6f7f8 36%, #eceef0 56%, rgba(236, 238, 240, 0) 72%); }
.${P}-la { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; }
.${P}-rg { position: absolute; left: ${CX - RING / 2}px; top: ${CY - RING / 2}px; width: ${RING}px; height: ${RING}px; border-radius: 50%; background: #c9cbce; }
.${P}-rg svg { position: absolute; left: 0; top: 0; width: ${RING}px; height: ${RING}px; stroke: #f2f3f4; stroke-width: 1.8; }
.${P}-fc { position: absolute; left: ${(RING - FACE) / 2}px; top: ${(RING - FACE) / 2}px; width: ${FACE}px; height: ${FACE}px; border-radius: 50%; background: #ffffff; box-shadow: inset 0 0 0 1px #eceeef; }
.${P}-h1, .${P}-h2 { position: absolute; left: ${FACE / 2 - 1.6}px; width: 3.2px; border-radius: 2px; background: #9ccbf3; }
.${P}-h1 { top: ${FACE / 2 - 25}px; height: 29px; transform-origin: 50% 25px; }
.${P}-h2 { top: ${FACE / 2 - 17}px; height: 21px; transform-origin: 50% 17px; background: #b4d8f6; }
.${P}-lc { position: absolute; left: 0; width: ${ROOT_W}px; text-align: center; }
.${P}-lc.${P}-c1 { top: ${CY + 76}px; font-size: 13px; line-height: 18px; font-weight: 700; color: #555a60; }
.${P}-lc.${P}-c2 { top: ${CY + 97}px; font-size: 9.5px; line-height: 14px; color: #9a9ea4; }
.${P}-dt { display: inline-block; width: 12px; text-align: left; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const TY0 = 0.02, TY1 = 0.32;                      // layout seconds: the prompt types into the dialog
const CUT = 0.34;                                  // ... Create is pressed: HARD CUT to the loader
const FADE = 1.16, LD_END = 1.26;                  // ... the loader cross-dissolves back to the editor (the Result card is already there under it)
const DIS = 0.14;                                  // one tile's dissolve into its picture (a cover's opacity), layout seconds
const LAND0 = 1.32;
const LAND = Array.from({ length: 10 }, (_, i) => LAND0 + i * ((1.78 - DIS - LAND0) / 9));   // tile i starts to dissolve (strict reading order), the last is done at 1.78
const TURNS = 1.6;                                 // the clock's long hand turns this often over the wait (the footage: several turns in 3-5 s)
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const PROMPT = 'Muse memes, bold sticker pattern';   // our own wording, never the footage's

const ICONS = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5v.5"/>',
  x: '<path d="M5 5l14 14M19 5L5 19"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  fold: '<path d="M3 7h6l2 2h10v10H3z"/>',
  bin: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>',
};
const icon = (k, cls, vb = '0 0 24 24') => `<svg${cls ? ` class="${P}-${cls}"` : ''} viewBox="${vb}">${ICONS[k]}</svg>`;
const ticks = Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, r1 = RING / 2 - 3, r2 = RING / 2 - 7; return `<path d="M${(RING / 2 + Math.sin(a) * r1).toFixed(1)} ${(RING / 2 - Math.cos(a) * r1).toFixed(1)}L${(RING / 2 + Math.sin(a) * r2).toFixed(1)} ${(RING / 2 - Math.cos(a) * r2).toFixed(1)}"/>`; }).join('');
// the drafting line art: sparse, pale, bleeding off the corners (our own strokes)
const ART = `<svg class="${P}-la" viewBox="0 0 ${ROOT_W} ${ROOT_H}">`
  + '<g stroke-linecap="round" fill="none">'
  + '<path d="M-6 38L18 82" stroke="#b4d6f4" stroke-width="12"/><path d="M18 82L66 96L58 142" stroke="#f4f8fc" stroke-width="10" stroke-linejoin="round"/>'
  + '<circle cx="18" cy="82" r="5.5" fill="#8cc0f4" stroke="none"/><circle cx="66" cy="96" r="5.5" fill="#8cc0f4" stroke="none"/><circle cx="58" cy="142" r="4.5" fill="#8cc0f4" stroke="none"/>'
  + '<circle cx="36" cy="392" r="36" stroke="#b4d6f4" stroke-width="8" stroke-dasharray="7.07 7.07"/><circle cx="36" cy="392" r="27" stroke="#c4def5" stroke-width="3"/><circle cx="36" cy="392" r="8" stroke="#c4def5" stroke-width="3"/>'
  + '<circle cx="532" cy="62" r="26" stroke="#f4f8fc" stroke-width="7" stroke-dasharray="6.8 6.8"/><circle cx="532" cy="62" r="18" stroke="#f4f8fc" stroke-width="3"/>'
  + '<path d="M508 6L492 52M508 6L526 50" stroke="#b4d6f4" stroke-width="5"/><circle cx="508" cy="6" r="4" fill="#8cc0f4" stroke="none"/>'
  + '<g transform="translate(504 372) rotate(-52)"><rect x="0" y="0" width="132" height="26" rx="3" fill="#f4f8fc" stroke="none"/>' + Array.from({ length: 12 }, (_, i) => `<path d="M${8 + i * 10} 0v${i % 2 ? 6 : 10}" stroke="#a6cdf2" stroke-width="1.4"/>`).join('') + '</g>'
  + '<g transform="translate(538 318) rotate(-28)"><rect x="0" y="0" width="76" height="12" rx="2" fill="#f4f8fc" stroke="none"/><path d="M0 0L-16 6L0 12z" fill="#b4d6f4" stroke="none"/></g>'
  + '</g></svg>';
const swatches = SW.map((c, i) => `<div class="${P}-sd ${P}-s${i}" style="left: ${(i % 7) * 35}px; top: ${Math.floor(i / 7) * 33}px${i === 0 ? '' : `; background: ${c}`}"></div>`).join('');

export default {
  id: 'inzoi-ai-canvas',
  label: "inZOI 'Generate AI Texture' (2025)",
  source: {
    platform: "PC life-sim game inZOI (Early Access), 1920x1080 fullscreen gameplay captures by two third-party channels: the Create-a-Zoi outfit editor and the Build-mode 'Customize' bar; not a web page",
    feature: "'Generate AI Texture' popup (prompt box, Create); pressing Create hard-cuts to a full-screen pale-blue blueprint loader (drafting line art in the corners, a white disc with a ticking clock, 'Generating AI Texture...' / 'This may take some time.'), then a ~0.15 s cross-dissolve back to the editor with a small 'Result' card (swatch, Close, Save)",
    capture: {
      url: 'https://www.youtube.com/watch?v=1j_meYoNyLU',
      page: 'https://www.youtube.com/watch?v=1j_meYoNyLU',
      date: '2025-04-21',
      retrieved: '2026-10-17',
      timestamps: "t = 292.5 s the popup with the prompt typed and a pale-blue 'Create' (mygd_t292.5); t = 293.1 s hard cut to the loader; t = 293.5, 294.5, 295.5 s the clock hand at different angles, 'Generating AI Texture...' / 'This may take some time.' (mygd_t293.5, mygd_t294.5, mygd_t295.5); t = 296.3 s a faint white wash over the disc as the loader ends; t = 296.4-296.7 s a 3-frame cross-dissolve to the editor; t = 296.8 s the 'Result' card with 'Close' and 'Save' (mygd_t296.8); t = 303 s the card still open, the swatch the first 'My Texture' tile. Second take https://www.youtube.com/watch?v=r6K8G_xgO88 (StoryDea, 2025-04-08): popup t = 741 s, loader t = 742.7-747.8 s, Result card t = 748-749 s (storydea_t741, storydea_t745, storydea_t749). Both uncut: one hard cut in, one dissolve out, no cut inside.",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=1j_meYoNyLU', published: '2025-04-21', retrieved: '2026-10-17', note: 'inZOI AI | How to Use Smart Zoi, Generate Textures, 3D Printer & More (My Gameplay Diary): loader 3.3 s' },
      { url: 'https://www.youtube.com/watch?v=r6K8G_xgO88', published: '2025-04-08', retrieved: '2026-10-17', note: 'inZOI Build Mode Guide | Room Presets, AI Textures & Essential Tips (StoryDea): loader 5.3 s' },
    ],
    extrapolated: [
      "the editor: the footage shows a 3D character or room with the game's panels over it; here a flat neutral editor (a grey gradient stage with a plain cushion shape, a category panel, a 'My Texture' / 'Color' swatch grid) built from plain UI shapes, no drawn person, no 3D",
      "our prompt: the dialog's text 'Muse memes, bold sticker pattern' is our own (the footage types 'rainbow glitter seamles' / 'Light blue and white checkered patt'); it types in letter by letter as a pure function of t",
      "the line art: the footage's corners hold a three-joint robotic arm, a clamp, gears, a pencil and a ruler with numerals at 50-60 % opacity; here a sparse set of our own strokes (a jointed arm, two gears, a compass, a pencil, a ruler with ticks and no numerals) in the same pale blues and whites",
      "the pace: the footage waits 3.3 s and 5.3 s; the beat plays popup -> hard cut -> loader -> dissolve -> Result card in the ~1.8 s window every module of this family uses; the clock's hands sweep 1.6 turns over the wait (footage: several turns, period not timed); the ellipsis cycles one to three dots (the footage shows it part-drawn)",
      "the Result card: the footage's card holds ONE seamless pattern square; here it holds the ten pictures as a 5 x 2 sheet of small tiles (a wider card than the footage's ~165 px one), each an empty plate dissolving (a cover's opacity) into its picture in strict reading order, with 'Close' and 'Save' stacked under it as in the footage",
      "the stills' faint white wash over the disc at t = 296.3 s (probably the pattern fading in) is not drawn; the My Texture grid's first tile turns magenta at the landing (the footage adds the new swatch there)",
      "omitted from the footage: the mouse cursor, the game's top bar, the Photo Mode chip, the key-hint column, any brand mark",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'inzoi-ai-canvas');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv" style="transform-origin: ${g.origin}; transform: ${g.zoom === 1 ? 'none' : `scale(${(1 / g.zoom).toFixed(5)})`}"></div></div></div>`;
    const lst = ['Zip-Ups', 'Windbreakers', 'Cardigans', 'Jackets', 'Coats'].map((l, i) => `<p${i === 0 ? ` class="${P}-on"` : ''}>${l}</p>`).join('');
    const thumbs = [0, 1, 2].map((i) => `<div class="${P}-th${i === 1 ? ` ${P}-sel` : ''}" style="left: ${96 + i * 52}px"></div>`).join('');
    const root = x.el(`<div class="${P}">`
      // the editor: stage, category panel, swatch panel, then the dialog (before Create) or the Result card (after it)
      + `<div class="${P}-g ${P}-ed">`
      + `<p class="${P}-gb">${icon('back')}<span>Go Back</span></p>`
      + `<div class="${P}-sg"><div class="${P}-fl"></div><div class="${P}-cu"></div></div>`
      + `<div class="${P}-pa"><p class="${P}-pt">Outerwear</p><p class="${P}-rs">Reset</p><div class="${P}-xx">${icon('x')}</div><div class="${P}-ls">${lst}</div>${thumbs}</div>`
      + `<div class="${P}-pb"><div class="${P}-tb"><p class="${P}-on">My Texture</p><p class="${P}-of">Color</p></div>`
      + `<div class="${P}-ct"><div class="${P}-bt" style="left: 0; width: 112px">${icon('spark')}</div><div class="${P}-bt" style="left: 118px; width: 88px">${icon('fold')}</div><div class="${P}-bt" style="left: 214px; width: 22px; background: #eceef2; color: #6a6e77">${icon('bin')}</div></div>`
      + `<div class="${P}-sw">${swatches}</div>`
      + `<div class="${P}-sl" style="top: 158px"><span>Gloss</span><em>0</em><i><b style="left: 4px"></b></i></div><div class="${P}-sl" style="top: 176px"><span>Pattern Scale</span><em>50</em><i><b style="left: 96px"></b></i></div></div>`
      + `<div class="${P}-dl" style="visibility: hidden;"><h4>Generate AI Texture</h4>${icon('info', 'in')}${icon('x', 'cl')}<div class="${P}-pr"><span class="${P}-tv"></span><span class="${P}-cr"></span></div><div class="${P}-cb">Create</div></div>`
      + `<div class="${P}-rc" style="visibility: hidden;"><h4>Result</h4><div class="${P}-gd">${tiles.map(cell).join('')}</div><div class="${P}-b1">Close</div><div class="${P}-b2">Save</div></div>`
      + `</div>`
      // the full-screen loader
      + `<div class="${P}-g ${P}-lo" style="visibility: hidden;"><div class="${P}-gr"></div>${ART}<div class="${P}-gw"></div>`
      + `<div class="${P}-rg"><svg viewBox="0 0 ${RING} ${RING}">${ticks}</svg><div class="${P}-fc"><div class="${P}-h2"></div><div class="${P}-h1"></div></div></div>`
      + `<p class="${P}-lc ${P}-c1">Generating AI Texture<span class="${P}-dt"></span></p><p class="${P}-lc ${P}-c2">This may take some time.</p></div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const dl = q('dl'), rc = q('rc'), lo = q('lo'), tv = q('tv'), cr = q('cr'), dt = q('dt'), h1 = q('h1'), h2 = q('h2'), s0 = q('s0');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };
    const show = (n, on) => { n.style.visibility = on ? '' : 'hidden'; };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const ph = s < CUT ? 0 : s < FADE ? 1 : s < LD_END ? 2 : 3;   // the popup, the loader, the dissolve (card already under it), the landing

        put('ph', ph, (v) => { show(dl, v === 0); show(rc, v >= 2); show(lo, v === 1 || v === 2); s0.classList.toggle(`${P}-nw`, v >= 2); });

        // the prompt typed into the dialog
        const n = Math.floor(clamp01((s - TY0) / (TY1 - TY0)) * PROMPT.length);
        put('ty', n, (v) => { tv.textContent = PROMPT.slice(0, v); });

        // the loader: the long hand sweeps 1.6 turns (the short hand a twelfth of it), the ellipsis cycles, the whole layer fades out at the end
        const u = clamp01((s - CUT) / (FADE - CUT));
        const ang = Math.round(u * 360 * TURNS / 3) * 3;
        put('hd', ang, (v) => { h1.style.transform = `rotate(${v}deg)`; h2.style.transform = `rotate(${Math.round(v / 12) + 40}deg)`; });
        put('dt', ph === 1 ? 1 + Math.floor(u * 7) % 3 : 3, (v) => { dt.textContent = '...'.slice(0, v); });
        const lop = ph === 2 ? Math.round((1 - (s - FADE) / (LD_END - FADE)) * 20) / 20 : 1;
        put('lo', lop, (v) => { lo.style.opacity = v === 1 ? '' : String(v); });

        cells.forEach((c, i) => {
          const d = ph === 3 ? clamp01((s - LAND[i]) / DIS) : 0;
          const cov = Math.round((1 - d) * 20) / 20;      // the tile cover's opacity, a pure function of s
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
