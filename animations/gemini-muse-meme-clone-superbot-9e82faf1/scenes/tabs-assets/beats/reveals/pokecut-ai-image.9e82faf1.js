// Pokecut AI image (2026): the wait of the guest AI Image Generator at https://www.pokecut.com/ai-image-generator (live no-login capture 2026-10-17, 1280x900,
// ~25 s wait; frames reveal-refs/pokecut-ai-image/frames/cg_pokecut_{pending-32pct_t1.5,pending-92pct_t11,pending-97pct_t19,transition_t23,landed_t24.5,
// landed-toolbar_t33}.png, spec .tmp/clone-9e82faf1/reveal-refs/pokecut-ai-image/spec.json, confidence 0.68). The page is a full-screen canvas editor: a pale
// grey ground, a thin white top bar with undo / redo glyphs, a slim floating icon rail down the left edge (image, text, sticker, brush, lines, shape, layers,
// help), a centred empty white portrait artboard and a composer docked at the bottom centre (an 'Inspiration' chip, the prompt, an upload button, the model
// chip, a settings button and a round arrow submit) with a zoom row ('32%') bottom left. The wait lives only inside the artboard: a determinate circular ring
// (thin light track, saturated blue arc growing clockwise from the top) with the live percentage centred in it and the single caption 'Thinking...' under it;
// the arrow is grey while it runs. Landing: the ring goes and the artwork sits on the canvas, selected, with the blue arrow, the floating object toolbar over
// it and the corner / edge handles; here ten small artboards sit in a 5 x 2 grid on the canvas and fill in strict reading order. Everything is redrawn in
// plain boxes and line glyphs; every picture is OUR meme; no wordmark, no countdown offer, no credits pill, no sign-up / log-in, no promo card; system UI face.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-pkc';
const ROOT_W = 560, ROOT_H = 448;
const AB_L = 210, AB_T = 86, AB_W = 140, AB_H = 188;           // the single pending artboard
const G_L = 81, G_T = 86, T_W = 70, T_H = 94, G_X = 12, G_Y = 12;   // the 5 x 2 landed grid of small artboards
const BLUE = '#3338ee';
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #f0f0f0; color: #2b2b36; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .1); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-tb { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: 30px; background: #ffffff; box-shadow: 0 1px 0 #e9e9ec; }
.${P}-un, .${P}-re { position: absolute; top: 8px; width: 14px; height: 14px; stroke: #b4b4bc; stroke-width: 1.7; }
.${P}-un { left: 114px; }
.${P}-re { left: 142px; }
.${P}-ld .${P}-un { stroke: #3a3a44; }
.${P}-rl { position: absolute; left: 10px; top: 72px; box-sizing: border-box; width: 24px; height: 184px; border-radius: 6px; background: #ffffff; box-shadow: 0 1px 4px rgba(0, 0, 0, .2); }
.${P}-rl svg { position: absolute; left: 6px; width: 12px; height: 12px; stroke: #34343c; stroke-width: 2; }
.${P}-ab { position: absolute; left: ${AB_L}px; top: ${AB_T}px; width: ${AB_W}px; height: ${AB_H}px; background: #ffffff; }
.${P}-rg { position: absolute; left: ${(AB_W - 44) / 2}px; top: 63px; width: 44px; height: 44px; }
.${P}-rg svg { position: absolute; left: 0; top: 0; width: 44px; height: 44px; }
.${P}-pc { position: absolute; left: 0; top: 16px; width: 44px; text-align: center; font-size: 9.5px; line-height: 12px; font-weight: 700; color: ${BLUE}; }
.${P}-th { position: absolute; left: 0; top: 113px; width: ${AB_W}px; text-align: center; font-size: 8px; line-height: 11px; font-weight: 500; color: #54546a; }
.${P}-gd { position: absolute; left: ${G_L}px; top: ${G_T}px; display: grid; grid-template-columns: repeat(5, ${T_W}px); column-gap: ${G_X}px; row-gap: ${G_Y}px; }
.${P}-t { position: relative; width: ${T_W}px; height: ${T_H}px; overflow: hidden; background: #ffffff; box-shadow: 0 1px 3px rgba(0, 0, 0, .12); }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #ffffff; }
.${P}-sl { position: absolute; left: ${G_L}px; top: ${G_T}px; box-sizing: border-box; width: ${T_W}px; height: ${T_H}px; box-shadow: 0 0 0 1px ${BLUE}, 0 0 7px 1px rgba(110, 70, 250, .38); }
.${P}-sl i { position: absolute; box-sizing: border-box; display: block; background: #ffffff; }
.${P}-sl i.${P}-cn { width: 7px; height: 7px; border-radius: 50%; border: 1.2px solid ${BLUE}; }
.${P}-sl i.${P}-eh { border: 1px solid #8d8da0; border-radius: 2px; }
.${P}-ct { position: absolute; left: 62px; top: 38px; box-sizing: border-box; width: 436px; height: 38px; border-radius: 5px; background: #ffffff; box-shadow: 0 1px 6px rgba(0, 0, 0, .2); }
.${P}-ti { position: absolute; top: 5px; height: 11px; font-size: 6.3px; line-height: 11px; font-weight: 500; color: #2b2b36; }
.${P}-ti svg { position: absolute; left: 0; top: 1px; width: 9px; height: 9px; stroke: #2b2b36; stroke-width: 2; }
.${P}-ti svg.${P}-cv2 { left: auto; right: 0; top: 3px; width: 5px; height: 5px; stroke: #6a6a76; stroke-width: 2.4; }
.${P}-ri { position: absolute; top: 23px; width: 10px; height: 10px; stroke: #2b2b36; stroke-width: 2; }
.${P}-in { position: absolute; left: 126px; top: 352px; box-sizing: border-box; width: 62px; height: 17px; border-radius: 5px; background: linear-gradient(90deg, #b19ae0, #a2b2f6); color: #ffffff; font-size: 6.8px; line-height: 17px; font-weight: 700; padding-left: 17px; }
.${P}-ld .${P}-in { background: linear-gradient(90deg, #7a45e6, #5c5cf0); }
.${P}-in svg { position: absolute; left: 5px; top: 3px; width: 10px; height: 10px; stroke: #ffffff; stroke-width: 1.8; }
.${P}-cl { position: absolute; left: 418px; top: 352px; box-sizing: border-box; width: 16px; height: 16px; border-radius: 4px; background: #ffffff; box-shadow: 0 1px 3px rgba(0, 0, 0, .22); }
.${P}-cl svg { position: absolute; left: 3px; top: 3px; width: 10px; height: 10px; stroke: #1c1c24; stroke-width: 2.6; }
.${P}-cb { position: absolute; left: 126px; top: 374px; box-sizing: border-box; width: 308px; height: 66px; border-radius: 6px; border: 1.5px solid transparent; background: linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(180deg, #4fc3f7, #8b45f5) border-box; }
.${P}-pt { position: absolute; left: 8px; top: 8px; font-size: 7.2px; line-height: 10px; color: #1f1f26; }
.${P}-ch2 { position: absolute; right: 8px; top: 24px; font-size: 5px; line-height: 6px; color: #55555e; }
.${P}-ub { position: absolute; left: 6px; top: 34px; box-sizing: border-box; width: 20px; height: 20px; border-radius: 5px; background: #f3f3f6; }
.${P}-ub svg { position: absolute; left: 4px; top: 4px; width: 12px; height: 12px; stroke: #5b5b66; stroke-width: 1.7; }
.${P}-md { position: absolute; left: 144px; top: 35px; box-sizing: border-box; width: 104px; height: 18px; border-radius: 5px; background: #f3f3f6; color: #9a9aa2; font-size: 6.2px; line-height: 18px; font-weight: 700; padding-left: 19px; }
.${P}-ld .${P}-md { color: #2b2b36; }
.${P}-md svg { position: absolute; left: 5px; top: 4px; width: 10px; height: 10px; stroke: #8f8f98; stroke-width: 1.7; }
.${P}-ld .${P}-md svg { stroke: #2b2b36; }
.${P}-md svg.${P}-cv2 { left: auto; right: 4px; top: 5.5px; width: 7px; height: 7px; stroke: #55555e; stroke-width: 3; }
.${P}-sg { position: absolute; left: 254px; top: 35px; box-sizing: border-box; width: 18px; height: 18px; border-radius: 5px; background: #f3f3f6; }
.${P}-sg svg { position: absolute; left: 4px; top: 4px; width: 10px; height: 10px; stroke: #5b5b66; stroke-width: 1.8; }
.${P}-sb { position: absolute; left: 278px; top: 34px; box-sizing: border-box; width: 20px; height: 20px; border-radius: 50%; background: #686868; }
.${P}-ld .${P}-sb { background: ${BLUE}; }
.${P}-sb svg { position: absolute; left: 4px; top: 4px; width: 12px; height: 12px; stroke: #ffffff; stroke-width: 2.4; }
.${P}-zm { position: absolute; left: 8px; top: 422px; box-sizing: border-box; width: 84px; height: 18px; border-radius: 5px; background: #ffffff; box-shadow: 0 1px 4px rgba(0, 0, 0, .16); }
.${P}-zm svg { position: absolute; top: 5px; width: 8px; height: 8px; stroke: #2b2b36; stroke-width: 2.2; }
.${P}-zp { position: absolute; left: 22px; top: 0; width: 28px; text-align: center; font-size: 6.4px; line-height: 18px; font-weight: 600; color: #2b2b36; }
.${P}-zd { position: absolute; left: 63px; top: 4px; width: 1px; height: 10px; background: #e0e0e4; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const ARC_END = 1.0;                               // the ring reaches its last figure here
const LAND = Array.from({ length: 10 }, (_, i) => 1.10 + i * (0.60 / 9));   // artboard i fills (strict reading order), the last at 1.70; the ring goes at the first
const SETTLE = LAND[0];
const PROMPT = 'a lecture-hall meme with bold caption, high contrast';
const MODEL = 'ChatGPT Image 2.5-flare';
const TAU = 6;                                     // the footage's curve: 32% at 1.5 s, 92% at 11 s, 97% at 19 s, 98% at 23.7 s, as 98 (1 - e^(-6u)) over the wait
const percent = (s) => {
  const u = Math.min(Math.max(s / ARC_END, 0), 1);
  return Math.min(98, Math.round((98 * (1 - Math.exp(-TAU * u))) / (1 - Math.exp(-TAU))));
};

const ICON = {
  image: '<rect x="3" y="3.5" width="18" height="17" rx="3"/><circle cx="9" cy="9.5" r="1.7"/><path d="M21 16l-5-5-9 9"/>',
  text: '<path d="M5 5.5h14M12 5.5v14"/>',
  sticker: '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9l-5 5H6a2 2 0 0 1-2-2z"/><path d="M9 10.5v.01M15 10.5v.01M9 14.5c1.6 1.4 4.4 1.4 6 0"/>',
  brush: '<path d="M4 20l1.6-4.6L15 6l3 3-9.4 9.4zM14 7l3 3M19 3v5M16.5 5.5h5"/>',
  lines: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>',
  shape: '<rect x="4.5" y="4.5" width="15" height="15" rx="3"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5zM3 12.5l9 5 9-5M3 16.5l9 5 9-5"/>',
  help: '<circle cx="12" cy="12" r="9.5" fill="#34343c"/><path d="M9.7 9.6a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.1.9-1.1 1.7M12 16.6v.1" stroke="#ffffff"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>',
  spark: '<path d="M9 3l1.6 4.4L15 9l-4.4 1.6L9 15l-1.6-4.4L3 9l4.4-1.6zM17 13l.9 2.6 2.6.9-2.6.9L17 20l-.9-2.6-2.6-.9 2.6-.9z"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  upload: '<rect x="3" y="4" width="14" height="14" rx="3"/><circle cx="8" cy="9" r="1.4"/><path d="M17 14l-3.5-3.5L6 18M18 3v8M15 6l3-3 3 3"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6"/>',
  arrow: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  hand: '<path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11M11 10V5a1.5 1.5 0 0 1 3 0v6M14 10V6.5a1.5 1.5 0 0 1 3 0V14c0 3.5-2.5 6-5.5 6C9 20 7.5 18.5 6 16l-1.6-3c-.5-.9.6-1.8 1.4-1.2L8 13.5"/>',
  hd: '<rect x="3" y="4" width="18" height="16" rx="3" fill="#2b2b36"/>',
  stack: '<rect x="4" y="4" width="13" height="13" rx="2.5"/><path d="M8 20h10a2 2 0 0 0 2-2V8"/>',
  person: '<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><circle cx="12" cy="10" r="3"/><path d="M6.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5"/>',
  eraser: '<path d="M4 15l9-9 6 6-6 6H8zM9 20h11"/>',
  shirt: '<path d="M8 4l-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5M12 8v4l3 2"/>',
  expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
  crop: '<path d="M6 3v15h15M3 6h15v15"/>',
  bag: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8M3 13h18"/>',
  trash: '<path d="M4 7h16M10 4h4M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',
  save: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
};
const SVG = (cls, body, style) => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="0 0 24 24">${body}</svg>`;

export default {
  id: 'pokecut-ai-image',
  label: 'Pokecut AI image (2026)',
  source: {
    platform: "Pokecut 'AI Image Generator' (pokecut.com/ai-image-generator), the first-party guest generator of the web editor, no account used; live capture in headless Chrome at 1280x900, light UI",
    feature: "AI image generation from a text prompt (model chip 'ChatGPT Image 2.5-flare'): the full-screen canvas editor stays live and only the empty white artboard changes - a determinate circular ring whose blue arc sweeps clockwise with the live percentage inside it (0% -> 32% -> 53% -> 68% -> 78% -> 89% -> 92% -> 97% -> 98%) and the caption 'Thinking...' under it; the finished image then replaces the ring in place, selected, with the object toolbar over it",
    capture: {
      url: 'https://www.pokecut.com/ai-image-generator',
      page: 'https://www.pokecut.com/ai-image-generator',
      date: '2026-10-17',
      retrieved: '2026-10-17',
      timestamps: "live guest run 2026-10-17, PNG burst at ~260 ms: t = 0.0 s the submit arrow clicked; t = 0.1 s the artboard shows the ring at 0% with 'Thinking...'; t = 1.5 s 32% (cg_pokecut_pending-32pct_t1.5); t = 11 s 92% (cg_pokecut_pending-92pct_t11); t = 19 s 97% (cg_pokecut_pending-97pct_t19); the figure crawls to 98% by t ~ 23.7 s; t ~ 23-25 s the ring goes and the finished image fills the artboard (cg_pokecut_transition_t23, cg_pokecut_landed_t24.5); t ~ 25.4 s the object toolbar, size chip and handles are on it (cg_pokecut_landed-toolbar_t33); the wait is ~25 s on this single sample, a second guest run showed the same ring",
    },
    refs: [
      { url: 'https://www.pokecut.com/ai-image-generator', published: '2026-10-17', retrieved: '2026-10-17', note: 'Pokecut - Free Online AI Image Generator: Text to Image Online for Free (the live guest page; guest mode, no sign-up used)' },
    ],
    extrapolated: [
      "the landing: the footage lands ONE image that fills the single portrait artboard at t ~ 24-25 s; here the ring goes at the first landing and ten small white artboards sit in a 5 x 2 grid on the canvas and fill in strict reading order, the first one carrying the selection outline, the corner / edge handles and the floating object toolbar (Chat to edit / Enhance / Background / Portrait Editor / Erase / AI Replace / AI Clothes Changer) as the footage shows them on its one image",
      "the figure: the footage shows 0 -> 32 -> 92 -> 97 -> 98 over ~24 s; here it follows 98 (1 - e^(-6u)) / (1 - e^(-6)) as a pure function of t across the wait (32% at the footage's 1.5 s mark, 92% at 11 s) and holds 98% for a beat before the first landing; the arc length equals the printed figure",
      "the pace: the footage waits ~25 s; the beat plays it in the same ~1.8 s window every module of this family uses",
      "the artboard's size and the page's scale: the live artboard is ~275 x 370 px of a 1280 px page; here the page is redrawn at 560 px wide with the artboard 140 x 188 px, and the ten landed artboards are 70 x 94 px (chrome redrawn, not scaled copies)",
      "the chrome states: the submit arrow is grey while the wait runs and blue once an image is on the canvas, the Inspiration chip, the model chip and the undo glyph likewise go from washed to full strength at the landing, as in the footage's pending and landed frames",
      "omitted from the footage: the Pokecut wordmark, the '$1 USD offer ending soon' countdown, the credits pill and '10' credit badge, 'Sign up', 'Log in', the purple 'Claim Your Free Credits' card, the '864 x 1184' size chip, the '1/9' thumbnail chip and the rotate handle",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'pokecut-ai-image');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const RAIL = ['image', 'text', 'sticker', 'brush', 'lines', 'shape', 'layers', 'help'];
    const tool = (left, w, icon, label, chev) => `<p class="${P}-ti" style="left: ${left}px; width: ${w}px; padding-left: 12px">${SVG('', icon)}${label}${chev ? SVG(`${P}-cv2`, ICON.chev) : ''}</p>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-tb">${SVG(`${P}-un`, ICON.undo)}${SVG(`${P}-re`, ICON.redo)}</div>`
      + `<div class="${P}-rl">${RAIL.map((n, i) => SVG('', ICON[n], `top: ${8 + i * 22}px`)).join('')}</div>`
      + `<div class="${P}-ab">`
      + `<div class="${P}-rg"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" fill="none" stroke="#e9eaf8" stroke-width="3.2"/>`
      + `<circle class="${P}-arc" cx="22" cy="22" r="19" fill="none" stroke="${BLUE}" stroke-width="3.2" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 22 22)"/></svg><p class="${P}-pc">0%</p></div>`
      + `<p class="${P}-th">Thinking...</p>`
      + `</div>`
      + `<div class="${P}-gd">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-sl"><i class="${P}-cn" style="left: -3.5px; top: -3.5px"></i><i class="${P}-cn" style="right: -3.5px; top: -3.5px"></i><i class="${P}-cn" style="left: -3.5px; bottom: -3.5px"></i><i class="${P}-cn" style="right: -3.5px; bottom: -3.5px"></i>`
      + `<i class="${P}-eh" style="left: 29px; top: -2.5px; width: 12px; height: 5px"></i><i class="${P}-eh" style="left: 29px; bottom: -2.5px; width: 12px; height: 5px"></i>`
      + `<i class="${P}-eh" style="left: -2.5px; top: 41px; width: 5px; height: 12px"></i><i class="${P}-eh" style="right: -2.5px; top: 41px; width: 5px; height: 12px"></i></div>`
      + `<div class="${P}-ct">`
      + tool(8, 50, ICON.spark, 'Chat to edit', false)
      + tool(66, 50, ICON.hd, 'Enhance', true)
      + tool(124, 58, ICON.stack, 'Background', true)
      + tool(190, 70, ICON.person, 'Portrait Editor', true)
      + tool(268, 30, ICON.eraser, 'Erase', false)
      + tool(306, 46, ICON.person, 'AI Replace', false)
      + tool(360, 66, ICON.shirt, 'AI Clothes Changer', false)
      + [ICON.history, ICON.person, ICON.expand, ICON.sliders, ICON.crop, ICON.bag, ICON.trash, ICON.save].map((d, i) => SVG(`${P}-ri`, d, `left: ${8 + i * 17}px`)).join('')
      + `</div>`
      + `<p class="${P}-in">${SVG('', ICON.bulb)}Inspiration</p>`
      + `<div class="${P}-cl">${SVG('', ICON.chev)}</div>`
      + `<div class="${P}-cb">`
      + `<p class="${P}-pt">${PROMPT}</p><p class="${P}-ch2">${PROMPT.length}/3000</p>`
      + `<div class="${P}-ub">${SVG('', ICON.upload)}</div>`
      + `<p class="${P}-md">${SVG('', '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M4.6 7.8l14.8 8.4M4.6 16.2L19.4 7.8"/>')}${MODEL}${SVG(`${P}-cv2`, ICON.chev)}</p>`
      + `<div class="${P}-sg">${SVG('', ICON.sliders)}</div>`
      + `<div class="${P}-sb">${SVG('', ICON.arrow)}</div>`
      + `</div>`
      + `<div class="${P}-zm">${SVG('', ICON.minus, 'left: 8px')}<p class="${P}-zp">32%</p>${SVG('', ICON.plus, 'left: 52px')}<div class="${P}-zd"></div>${SVG('', ICON.hand, 'left: 68px')}</div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const ab = q('ab'), arc = q('arc'), pc = q('pc'), grid = q('gd'), sl = q('sl'), ct = q('ct');
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
        const gone = s >= LAND[0];                     // the ring goes at the first landing
        const pct = percent(Math.min(s, SETTLE));      // frozen from the first landing on (the artboard is hidden then)

        put('pct', pct, (v) => { arc.setAttribute('stroke-dasharray', `${v} ${100 - v}`); pc.textContent = `${v}%`; });
        put('ab', gone, (v) => { ab.style.visibility = v ? 'hidden' : ''; });
        put('gd', gone, (v) => { grid.style.visibility = v ? '' : 'hidden'; });
        put('sl', gone, (v) => { sl.style.visibility = v ? '' : 'hidden'; ct.style.visibility = v ? '' : 'hidden'; });
        put('ld', gone, (v) => { root.classList.toggle(`${P}-ld`, v); });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // a white empty artboard until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
