// beehiiv AI image (2024): the wait of the '/AI Image' block in beehiiv's legacy post editor, from the AI Copywriting Creators tutorial
// https://www.youtube.com/watch?v=mbB4_Ek9D5o (2024-04-24, 1920x1080 letterboxed; frames reveal-refs/beehiiv-ai-image/frames/bh_{02_t237.5,05_t244,06_t247.0,07_t247.8,08_t248.9,09_t252}.png,
// spec .tmp/clone-9e82faf1/reveal-refs/beehiiv-ai-image/spec.json, confidence 0.6; the first-party 'AI Tools - beehiiv 101' dVjv-xWeFSo (2023-07-11) and the help article
// https://www.beehiiv.com/support/article/15882638374551 corroborate). A light two-column editor: a slim top bar, a centre column of body text with the dark inline 'Prompt' card
// (prompt text, the 'Photorealistic' style chip, 'Generate image'), and the right 'Post Settings' sidebar with its action bar. The wait washes the WHOLE editor and sidebar to
// about a quarter strength, greys the prompt card and floats a dark toast with three pulsing dots over 'Generating cool new stuff'; the wash then lifts, a flat near-black 'Preview'
// card fills the prompt card's place, and the picture paints into it above the prompt with 'Discard', 'Insert', 'Regenerate'. Everything is redrawn in plain boxes and line glyphs; the
// body text is our own neutral filler; every picture is OUR meme; the recorder's click ring, the letterbox bars, the 'CW' avatar and any beehiiv mark are omitted; system UI face.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-bhv';
const ROOT_W = 560, ROOT_H = 440;
const TOP_H = 24, SB_L = 392, COL_L = 28, COL_W = 334, CARD_T = 150;   // top bar, sidebar, text column, the card's top edge (fixed: the card grows downward)
const SH_L = 8, SH_T = 20, SH_P = 4, T_S = 58, G_X = 5;                  // the sheet in the Preview card: 5 columns x 2 rows of square tiles
const SH_W = COL_W - 2 * SH_L, SH_H = 2 * SH_P + 2 * T_S + G_X;
const PRE_H = SH_T + SH_H + 6 + 66 + 8;                                  // the Preview card's height
const PINK = '#e1458d';
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #ffffff; color: #1f2430; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .14); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-tb { position: absolute; left: 0; top: 0; width: ${SB_L}px; height: ${TOP_H}px; }
.${P}-tb p, .${P}-tb svg { position: absolute; }
.${P}-tx { top: 0; font-size: 6.4px; line-height: ${TOP_H}px; color: #4b5260; }
.${P}-tg { top: 8px; width: 8px; height: 8px; stroke: #6b7280; stroke-width: 2; }
.${P}-sd { position: absolute; left: ${SB_L}px; top: 0; box-sizing: border-box; width: ${ROOT_W - SB_L}px; height: ${ROOT_H}px; border-left: 1px solid #eceef1; }
.${P}-sd p { position: absolute; }
.${P}-tab { top: 0; font-size: 6.4px; line-height: ${TOP_H}px; color: #4b5260; }
.${P}-tab.${P}-on { color: #111827; font-weight: 600; box-shadow: inset 0 -1.5px 0 #111827; }
.${P}-hd { left: 10px; top: 30px; font-size: 9px; line-height: 14px; font-weight: 700; color: #111827; }
.${P}-lb { left: 10px; font-size: 6.4px; line-height: 9px; color: #374151; font-weight: 500; }
.${P}-fd { position: absolute; left: 10px; box-sizing: border-box; width: 150px; height: 16px; border: 1px solid #e5e7eb; border-radius: 3px; background: #ffffff; }
.${P}-fd p { left: 5px; top: 0; font-size: 6.2px; line-height: 14px; color: #6b7280; }
.${P}-fd svg { position: absolute; right: 5px; top: 4px; width: 6px; height: 7px; stroke: #6b7280; stroke-width: 2.2; }
.${P}-tgl { position: absolute; left: 10px; box-sizing: border-box; width: 17px; height: 9px; border-radius: 5px; background: #374151; }
.${P}-tgl i { position: absolute; right: 1.5px; top: 1.5px; width: 6px; height: 6px; border-radius: 50%; background: #ffffff; }
.${P}-tgl.${P}-off { background: #e5e7eb; }
.${P}-tgl.${P}-off i { right: auto; left: 1.5px; }
.${P}-tl { left: 32px; font-size: 6.4px; line-height: 9px; color: #374151; }
.${P}-btn { position: absolute; top: 270px; box-sizing: border-box; height: 18px; border: 1px solid #e5e7eb; border-radius: 3px; background: #ffffff; }
.${P}-btn p { left: 17px; top: 0; font-size: 6.2px; line-height: 16px; color: #1f2937; }
.${P}-btn svg { position: absolute; left: 5px; top: 4px; width: 8px; height: 8px; stroke: #4b5563; stroke-width: 1.8; }
.${P}-ab { position: absolute; left: 0; top: ${ROOT_H - 28}px; width: ${ROOT_W - SB_L - 1}px; height: 28px; background: #ffffff; box-shadow: 0 -1px 0 #eceef1; }
.${P}-ab p { top: 0; font-size: 5.8px; line-height: 28px; color: #1f2937; }
.${P}-ab svg { position: absolute; top: 10px; width: 8px; height: 8px; stroke: #4b5563; stroke-width: 1.8; }
.${P}-ab p.${P}-sch { left: 124px; top: 6px; box-sizing: border-box; width: 38px; height: 16px; border-radius: 3px; background: #111827; font-size: 5.8px; line-height: 16px; text-align: center; color: #ffffff; font-weight: 600; }
.${P}-bd { position: absolute; left: ${COL_L}px; top: 44px; width: ${COL_W}px; }
.${P}-bd p { font-size: 7.4px; line-height: 11px; color: #1f2937; }
.${P}-gt { position: absolute; top: ${CARD_T + 8}px; width: 9px; height: 9px; stroke: #6b7280; stroke-width: 2; }
.${P}-card { position: absolute; left: ${COL_L}px; top: ${CARD_T}px; box-sizing: border-box; width: ${COL_W}px; border-radius: 4px; background: #14181d; color: #ffffff; overflow: hidden; }
.${P}-card p { position: absolute; }
.${P}-pc { height: 88px; }
.${P}-pre { height: ${PRE_H}px; }
.${P}-lbl { left: 10px; font-size: 6.2px; line-height: 9px; font-weight: 600; color: #ffffff; }
.${P}-cnt { right: 40px; font-size: 5px; line-height: 9px; color: #c9ced6; }
.${P}-pb { position: absolute; right: 10px; width: 26px; height: 2px; border-radius: 1px; background: #3a414c; }
.${P}-pb i { position: absolute; left: 0; top: 0; width: 5px; height: 2px; border-radius: 1px; background: #f0457d; }
.${P}-ptx { left: 10px; font-size: 7px; line-height: 10px; color: #f3f4f6; }
.${P}-chp { position: absolute; left: 10px; height: 14px; }
.${P}-chp p { left: 12px; top: 0; font-size: 6.4px; line-height: 14px; color: #f0679b; font-weight: 600; }
.${P}-chp svg { position: absolute; top: 3px; width: 8px; height: 8px; stroke: #f0679b; stroke-width: 1.8; }
.${P}-gen { position: absolute; right: 10px; height: 14px; }
.${P}-gen p { left: 12px; top: 0; font-size: 6.4px; line-height: 14px; color: #f3f4f6; }
.${P}-gen svg, .${P}-act svg { position: absolute; top: 3px; width: 8px; height: 8px; stroke: #f0679b; stroke-width: 1.8; }
.${P}-act { position: absolute; top: 0; height: 14px; }
.${P}-act p { left: 11px; top: 0; font-size: 6.4px; line-height: 14px; color: #f3f4f6; }
.${P}-act svg { stroke: #e5e7eb; }
.${P}-sh { position: absolute; left: ${SH_L}px; top: ${SH_T}px; box-sizing: border-box; width: ${SH_W}px; height: ${SH_H}px; border-radius: 2px; background: #101419; }
.${P}-gd { position: absolute; left: ${SH_P}px; top: ${SH_P}px; display: grid; grid-template-columns: repeat(5, ${T_S}px); column-gap: ${G_X}px; row-gap: ${G_X}px; }
.${P}-t { position: relative; width: ${T_S}px; height: ${T_S}px; overflow: hidden; background: #101419; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #101419; }
.${P}-sc { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; background: rgba(255, 255, 255, .75); }
.${P}-vl { position: absolute; left: 0; top: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, .57); }
.${P}-ts { position: absolute; left: 278px; top: ${CARD_T + 88 + 14}px; box-sizing: border-box; width: 112px; height: 40px; border-radius: 4px; background: #1c2128; box-shadow: 0 1px 4px rgba(0, 0, 0, .18); }
.${P}-dt { position: absolute; top: 9px; width: 5px; height: 5px; border-radius: 50%; }
.${P}-ts p { position: absolute; left: 0; width: 112px; top: 21px; text-align: center; font-size: 6.8px; line-height: 10px; color: #ffffff; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const PEND = 0.88;                                 // layout seconds: the wash and toast end, the black Preview card stands (footage: ~9.4 s wait, then ~1.4 s of black before the first paint)
const LAND = Array.from({ length: 10 }, (_, i) => 1.12 + i * (0.72 / 9));   // picture i paints in (strict reading order), the last at 1.84
const PULSE = 0.6;                                 // layout seconds per dot cycle (the footage: about 0.5-0.8 s)
const DOTS = ['#4b63f5', '#9b5ce0', '#f0457d'];
const PROMPT = 'A man running down a beach in the sunshine';
const BODY = [
  'Small habits are easy to start and easy to skip, so the first week matters.',
  'Pick one change that takes under five minutes and write it down somewhere.',
  'Put the note where you will see it every morning before the day gets busy.',
  'The goal is not a perfect streak, only a routine that survives a late night.',
  'Check back in a month, keep what worked and drop what felt like a chore.',
  'Then add one more small change and repeat the same steps from the start.',
];

const ICON = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  undo: '<path d="M9 7L4 12l5 5M4 12h10a6 6 0 0 1 0 12"/>',
  redo: '<path d="M15 7l5 5-5 5M20 12H10a6 6 0 0 0 0 12"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
  chat: '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6l-4.5 3.5V17H6a2 2 0 0 1-2-2z"/>',
  more: '<path d="M12 5v.01M12 12v.01M12 19v.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  grip: '<path d="M9 6v.01M15 6v.01M9 12v.01M15 12v.01M9 18v.01M15 18v.01"/>',
  chev: '<path d="M7 10l5-5 5 5M7 14l5 5 5-5"/>',
  caret: '<path d="M6 9l6 6 6-6"/>',
  img: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 16l5-5 4 4 3-3 4 4"/>',
  spark: '<path d="M9 2.5l1.7 4.8 4.8 1.7-4.8 1.7L9 15.5l-1.7-4.8L2.5 9l4.8-1.7zM17.5 12.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.6"/>',
  user: '<circle cx="10" cy="8.5" r="3.3"/><path d="M4 19c.6-3.6 3-5.4 6-5.4M17 13v6M14 16h6"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
  tick: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  regen: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>',
};
const SVG = (cls, body, style) => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="0 0 24 24">${body}</svg>`;

export default {
  id: 'beehiiv-ai-image',
  label: 'beehiiv AI image (2024)',
  source: {
    platform: "beehiiv legacy post editor (app.beehiiv.com, light theme), the inline '/AI Image' block ('Prompt' card, 'Generate image') in the draft's text column beside the 'Post Settings' sidebar; third-party tutorial screen recording at 1920x1080 (letterboxed)",
    feature: "'Generate image' on the dark Prompt card: the whole editor and sidebar wash to ~25% strength and the card greys while a dark toast with three pulsing dots (blue, violet, pink) reads 'Generating cool new stuff' (~9.4 s); the wash then lifts, the card becomes a flat near-black 'Preview' block for ~1.4 s, and the picture paints into it above the prompt, the footer reading 'Discard', 'Insert', 'Regenerate' and the request counter 14 -> 15 of 100",
    capture: {
      url: 'https://www.youtube.com/watch?v=mbB4_Ek9D5o',
      page: 'https://www.youtube.com/watch?v=mbB4_Ek9D5o',
      date: '2024-04-24',
      retrieved: '2026-10-17',
      timestamps: "t = 236.0-237.4 s idle (dark 'Prompt' card, 'A man running down a beach in the sunshine', 'Photorealistic', 'Generate image'; bh_01_t236.6, bh_02_t237.5); t = 237.5 s click, t = 237.9 s the page dims; t = 237.9-247.35 s PENDING, ~9.4 s continuous: editor + sidebar washed to ~25%, the card grey, the toast with three pulsing dots and 'Generating cool new stuff' under the card's right edge (bh_03_t238.3, bh_04_t241, bh_05_t244, bh_06_t247.0); t = 247.4-248.8 s the card a solid near-black 'Preview' block with no picture yet (bh_07_t247.8); t = 248.9-249.3 s the picture paints in; t = 250-256 s settled with 'Discard / Insert / Regenerate' and '15 / 100 AI requests' (bh_08_t248.9, bh_09_t252). Corroboration dVjv-xWeFSo (2023-07-11) t~253-263 s: the same wash and toast over a regenerated picture",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=mbB4_Ek9D5o', published: '2024-04-24', retrieved: '2026-10-17', note: 'Beehiiv Newsletter Tutorial: AI Image Letdown? (AI Copywriting Creators)' },
      { url: 'https://www.youtube.com/watch?v=dVjv-xWeFSo', published: '2023-07-11', retrieved: '2026-10-17', note: 'AI Tools - beehiiv 101 (beehiiv)' },
      { url: 'https://www.beehiiv.com/support/article/15882638374551', published: '2026-10-05', retrieved: '2026-10-17', note: "help article: 'A loading screen will appear letting you know it's Generating cool new stuff.'" },
    ],
    extrapolated: [
      "the landing: the footage paints ONE picture into the Preview card (a letterboxed band first, then filling the card, ~0.4 s); here the black card holds a 5x2 sheet of ten pictures that each paint in hard (no fade), in strict reading order",
      "the Preview card's footer: the footage's black frame (bh_07) shows 'Prompt' and the counter; the prompt text, the style chip and the three footer buttons are drawn from the landed frame (bh_09) and stand from the black moment on, the 'Generate image' button of the pending card gone with the toast",
      "the pace: the footage waits ~9.4 s, holds the black card ~1.4 s and paints in ~0.4 s; the beat plays it in the same ~1.8 s window every module of this family uses",
      "the dots: three dots (blue, violet, pink) that grow and brighten one after another, one cycle per 0.6 s of the layout clock (the footage: about 0.5-0.8 s), each dot's size and strength a pure function of t",
      "the wash: the footage's editor sits at ~25% strength; here a white layer of 75% over the whole editor and sidebar does it, the card standing above it with its own 57% veil (the footage's mid-grey #9a9a9e)",
      "the size and the page: the footage editor is ~1456 px wide in view; here it is redrawn at 560 px wide with a 168 px sidebar and a 334 px text column (chrome redrawn, not a scaled copy); the body text is our own filler, not the footage's article",
      "omitted from the footage: the recorder's yellow click ring, the black letterbox bars, the 'CW' avatar, the faint ghost watermark at the right of the settled frame, the pink outline of the idle card (the frame is already washed when the wait starts), and any beehiiv mark",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'beehiiv-ai-image');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const tx = (l, w, txt, cls) => `<p class="${P}-tx${cls ? ` ${cls}` : ''}" style="left: ${l}px">${txt}</p>`;
    const gl = (l, icon) => SVG(`${P}-tg`, icon, `left: ${l}px`);
    const lb = (top, txt) => `<p class="${P}-lb" style="top: ${top}px">${txt}</p>`;
    const fd = (top, txt, sel) => `<div class="${P}-fd" style="top: ${top}px"><p>${txt}</p>${sel ? SVG('', ICON.chev) : ''}</div>`;
    const tgl = (top, txt, off) => `<div class="${P}-tgl${off ? ` ${P}-off` : ''}" style="top: ${top}px"><i></i></div><p class="${P}-tl" style="top: ${top}px">${txt}</p>`;
    const tab = (l, txt, on) => `<p class="${P}-tab${on ? ` ${P}-on` : ''}" style="left: ${l}px">${txt}</p>`;
    const abp = (l, txt, icon) => `<p style="left: ${l}px">${txt}</p>${icon ? SVG('', icon, `left: ${l - 11}px`) : ''}`;
    const root = x.el(`<div class="${P}">`
      // the editor under the wash: top bar, the text column, the left-gutter handles, the sidebar
      + `<div class="${P}-tb">${gl(10, ICON.back)}${tx(20, 0, 'Exit')}${tx(52, 0, 'Draft')}${tx(86, 0, 'Synced')}<span style="position: absolute; left: 80px; top: 10px; width: 4px; height: 4px; border-radius: 50%; background: #22c55e"></span>`
      + `${tx(246, 0, '181 words')}${gl(284, ICON.undo)}${gl(298, ICON.redo)}${gl(314, ICON.search)}${gl(336, ICON.chat)}${gl(352, ICON.more)}</div>`
      + `<div class="${P}-bd">${BODY.map((l, i) => `<p style="margin-top: ${i === 3 ? 7 : 0}px">${l}</p>`).join('')}</div>`
      + SVG(`${P}-gt`, ICON.plus, 'left: 6px') + SVG(`${P}-gt`, ICON.grip, 'left: 17px')
      + `<div class="${P}-sd">`
      + tab(10, 'Post', true) + tab(38, 'Email') + tab(66, 'Website') + tab(106, 'SEO') + tab(128, 'Delivery')
      + `<p class="${P}-hd">Post Settings</p>`
      + lb(54, 'Title *') + fd(64, 'Draft') + tgl(88, 'Show title in email')
      + lb(108, 'Subtitle') + fd(118, '') + tgl(142, 'Show subtitle in email')
      + lb(162, 'Content Tags') + fd(172, 'Select Content Tag(s)', true)
      + lb(196, 'Authors') + fd(206, 'Select Author(s)', true)
      + lb(230, 'Guest Authors') + fd(240, 'Select Guest Author(s)', true)
      + `<div class="${P}-btn" style="left: 10px; width: 70px">${SVG('', ICON.user)}<p>New guest author</p></div><div class="${P}-btn" style="left: 90px; width: 44px">${SVG('', ICON.ext)}<p>Manage</p></div>`
      + tgl(304, 'Show byline in email', true)
      + `<div class="${P}-ab">${abp(16, 'Preview', ICON.eye)}${abp(44, 'Send Test')}${abp(77, 'Save Template')}<p class="${P}-sch">Schedule</p></div>`
      + `</div>`
      + `<div class="${P}-sc"></div>`
      // the card: the prompt card while the wash stands, the Preview card (same top edge, grown downward) after it
      + `<div class="${P}-card ${P}-pc"><p class="${P}-lbl" style="top: 8px">Prompt</p><p class="${P}-cnt" style="top: 8px">14 / 100 AI requests</p><div class="${P}-pb" style="top: 12px"><i></i></div>`
      + `<p class="${P}-ptx" style="top: 24px">${PROMPT}</p>`
      + `<div class="${P}-chp" style="top: 64px">${SVG('', ICON.img)}<p>Photorealistic</p></div>`
      + `<div class="${P}-gen" style="top: 64px">${SVG('', ICON.spark)}<p>Generate image</p></div>`
      + `<div class="${P}-vl"></div></div>`
      + `<div class="${P}-card ${P}-pre"><p class="${P}-lbl" style="top: 6px">Preview</p>`
      + `<div class="${P}-sh"><div class="${P}-gd">${tiles.map(cell).join('')}</div></div>`
      + `<p class="${P}-lbl" style="top: ${SH_T + SH_H + 8}px">Prompt</p><p class="${P}-cnt" style="top: ${SH_T + SH_H + 8}px">15 / 100 AI requests</p><div class="${P}-pb" style="top: ${SH_T + SH_H + 12}px"><i></i></div>`
      + `<p class="${P}-ptx" style="top: ${SH_T + SH_H + 22}px">${PROMPT}</p>`
      + `<div class="${P}-chp" style="top: ${SH_T + SH_H + 46}px">${SVG('', ICON.img)}<p>Photorealistic</p></div>`
      + `<div class="${P}-act" style="top: ${SH_T + SH_H + 46}px; left: 156px; width: 44px">${SVG('', ICON.trash)}<p>Discard</p></div>`
      + `<div class="${P}-act" style="top: ${SH_T + SH_H + 46}px; left: 208px; width: 38px">${SVG('', ICON.tick)}<p>Insert</p></div>`
      + `<div class="${P}-act" style="top: ${SH_T + SH_H + 46}px; left: 254px; width: 60px">${SVG('', ICON.regen)}<p>Regenerate</p></div>`
      + `</div>`
      + `<div class="${P}-ts">${DOTS.map((c, i) => `<div class="${P}-dt" style="left: ${(112 - 23) / 2 + i * 9}px; background: ${c}"></div>`).join('')}<p>Generating cool new stuff</p></div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const sc = q('sc'), pc = q('pc'), pre = q('pre'), ts = q('ts');
    const dots = [...root.querySelectorAll(`.${P}-dt`)];
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const pending = s < PEND;                      // the wash, the greyed prompt card and the toast; the black Preview card after it

        put('ph', pending, (v) => {
          sc.style.display = v ? '' : 'none';
          ts.style.display = v ? '' : 'none';
          pc.style.visibility = v ? '' : 'hidden';
          pre.style.visibility = v ? 'hidden' : '';
        });
        dots.forEach((d, j) => {
          // each dot grows and brightens in turn: its strength a pure function of the layout clock, quantised to quarters
          const w = pending ? Math.round((0.5 + 0.5 * Math.cos(2 * Math.PI * (s / PULSE - j / 3))) * 4) / 4 : 0;
          put(`d${j}`, w, (v) => { d.style.opacity = String(0.4 + 0.6 * v); d.style.transform = `scale(${(0.7 + 0.5 * v).toFixed(3)})`; });
        });
        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
