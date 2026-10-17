// Vheer (vheer.com, the free Text to Image app at /app/text-to-image, 2026): read FIRST-HAND from one live headless capture on 2026-10-15 (1280x800 Chrome, no account;
// frames reveal-refs/vheer/frames/bf_vheer_{idle,uploading_0s,processing_11s,result_21s,toast_25s}.png, spec .tmp/clone-9e82faf1/reveal-refs/vheer/spec.json, confidence 0.6).
// A light three-column app on a warm off-white (#FAF9F5): a left tool nav ('Tools': Text to Image, Text to Video, Image to Image, ...), a bare centre canvas under a
// 'Dashboard > Text to Image' breadcrumb with a 'History' button, and a right settings column ('Prompt' box with 'Enhance', 'Select Model', 'Aspect Ratio',
// 'Number of Images', the Generate button). The wait draws NO tile: a black open-ring spinner floats on the bare canvas with 'Uploading request...' and then, a
// moment later, 'Processing... This may take up to 2 minutes' (an honest upper bound, never a countdown) and a small grey model line under it, while the Generate
// button itself turns into a full-width disabled grey (#9A9997) pill carrying its own small white spinner and 'Generating...'. When the picture is ready the canvas
// fills, an 'Image generated successfully!' toast slides in at the top right and the button goes back to 'Generate'.
// Omitted: the Vheer wordmark / mark and the model glyph, 'Get Started - Free' / 'Sign In' / 'Recent Library' history chrome, the 'GPT-Image-2 is now on Vheer' banner, the
// bottom ad banner / video and the pop-out ad, the crowns on the count buttons and the '| 0' credit counter on the button. Every picture is OUR meme, system UI face.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-vhr';
const ROOT_W = 560, ROOT_H = 316;
const COLS = 5, TILE_W = 54, TILE_H = 64, GAP = 4;                         // portrait tiles (0.84), five columns by two rows on the bare canvas
const GRID_W = COLS * TILE_W + (COLS - 1) * GAP, GRID_X = 105 + Math.round((305 - GRID_W) / 2), GRID_Y = 88;
const BG = '#faf9f5';
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: ${BG}; color: #1c1c1b; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .09); }
.${P} p { margin: 0; }
.${P}-nv { position: absolute; left: 0; top: 0; bottom: 0; width: 104px; box-shadow: 1px 0 0 #e8e6e0; }
.${P}-nt { position: absolute; left: 8px; top: 11px; font-size: 5.8px; line-height: 8px; color: #75736f; }
.${P}-ni { position: absolute; left: 4px; width: 96px; height: 17px; box-sizing: border-box; padding: 0 5px; border-radius: 4px; display: flex; align-items: center; gap: 5px; font-size: 6.5px; line-height: 17px; color: #2a2a28; white-space: nowrap; }
.${P}-ni.${P}-on { background: #eeede8; }
.${P}-ni svg { flex: none; width: 8px; height: 8px; fill: none; stroke: #2a2a28; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ni em { margin-left: auto; font-style: normal; font-size: 8px; line-height: 17px; color: #75736f; }
.${P}-hd { position: absolute; left: 105px; right: 0; top: 0; height: 28px; box-shadow: 0 1px 0 #e8e6e0; }
.${P}-hd svg { position: absolute; left: 11px; top: 10px; width: 8px; height: 8px; fill: none; stroke: #2a2a28; stroke-width: 1.2; stroke-linecap: round; }
.${P}-bc { position: absolute; left: 30px; top: 0; display: flex; align-items: center; gap: 5px; font-size: 6.6px; line-height: 28px; color: #75736f; white-space: nowrap; }
.${P}-bc b { font-weight: 400; color: #1c1c1b; }
.${P}-hy { position: absolute; right: 8px; top: 6px; box-sizing: border-box; height: 16px; padding: 0 8px; border-radius: 4px; background: ${BG}; box-shadow: inset 0 0 0 1px #d9d7d1; font-size: 6.4px; line-height: 16px; color: #1c1c1b; }
.${P}-cn { position: absolute; left: 105px; width: 305px; top: 28px; bottom: 0; }
.${P}-sp { position: absolute; z-index: 2; left: 0; right: 0; top: 98px; display: flex; flex-direction: column; align-items: center; }
.${P}-rg { display: block; width: 24px; height: 24px; }
.${P}-rg circle { fill: none; stroke: #1c1c1b; stroke-width: 2.2; stroke-linecap: round; }
.${P}-s1 { margin-top: 10px !important; font-size: 7px; line-height: 10px; font-weight: 500; color: #1c1c1b; white-space: nowrap; }
.${P}-s2 { margin-top: 5px !important; font-size: 5.8px; line-height: 8px; color: #8e8c88; white-space: nowrap; }
.${P}-g { position: absolute; left: ${GRID_X - 105}px; top: ${GRID_Y - 28}px; display: grid; grid-template-columns: repeat(${COLS}, ${TILE_W}px); grid-auto-rows: ${TILE_H}px; gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TILE_W}px; height: ${TILE_H}px; border-radius: 3px; overflow: hidden; background: ${BG}; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: ${BG}; }
.${P}-ab { position: absolute; left: 0; right: 0; top: 200px; display: flex; justify-content: center; align-items: center; gap: 9px; }
.${P}-ab svg { flex: none; width: 8px; height: 8px; fill: none; stroke: #55534f; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ab span { display: flex; align-items: center; gap: 3px; font-size: 6.6px; line-height: 14px; color: #1c1c1b; }
.${P}-ab .${P}-dl { box-sizing: border-box; height: 15px; padding: 0 8px; border-radius: 8px; background: #111; color: #fff; }
.${P}-ab .${P}-dl svg { stroke: #fff; }
.${P}-rt { position: absolute; left: 420px; width: 130px; top: 0; bottom: 0; }
.${P}-lb { position: absolute; left: 0; font-size: 6.4px; line-height: 9px; color: #1c1c1b; white-space: nowrap; }
.${P}-tr { position: absolute; right: 2px; top: 37px; width: 7px; height: 7px; fill: none; stroke: #75736f; stroke-width: 1.1; stroke-linecap: round; stroke-linejoin: round; }
.${P}-pr { position: absolute; left: 0; right: 0; top: 49px; height: 82px; box-sizing: border-box; padding: 7px 7px; border-radius: 5px; background: ${BG}; box-shadow: inset 0 0 0 1px #e0ded8; font-size: 6.4px; line-height: 10px; color: #9b9994; }
.${P}-en { position: absolute; right: 5px; bottom: 5px; box-sizing: border-box; height: 13px; padding: 0 6px 0 4px; border-radius: 7px; box-shadow: inset 0 0 0 1px #e0ded8; display: flex; align-items: center; gap: 3px; font-size: 5.8px; line-height: 13px; color: #2a2a28; }
.${P}-en svg { flex: none; width: 6px; height: 6px; fill: none; stroke: #2a2a28; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-sl { position: absolute; left: 0; right: 0; top: 148px; height: 22px; box-sizing: border-box; padding: 0 7px; border-radius: 5px; background: ${BG}; box-shadow: inset 0 0 0 1px #e0ded8; display: flex; align-items: center; font-size: 6.6px; line-height: 22px; color: #75736f; }
.${P}-sl svg { margin-left: auto; width: 7px; height: 7px; fill: none; stroke: #75736f; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ar { position: absolute; right: 0; top: 177px; box-sizing: border-box; width: 58px; height: 20px; padding: 0 6px; border-radius: 5px; background: ${BG}; box-shadow: inset 0 0 0 1px #e0ded8; display: flex; align-items: center; gap: 4px; font-size: 6.4px; line-height: 20px; color: #2a2a28; }
.${P}-ar i { display: block; width: 6px; height: 6px; box-sizing: border-box; border-radius: 1.5px; box-shadow: inset 0 0 0 1px #75736f; }
.${P}-ar svg { margin-left: auto; width: 7px; height: 7px; fill: none; stroke: #75736f; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-nm { position: absolute; left: 0; right: 0; top: 207px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.${P}-nm span { box-sizing: border-box; height: 16px; border-radius: 4px; background: #f0eee8; text-align: center; font-size: 6.4px; line-height: 16px; color: #2a2a28; }
.${P}-nm .${P}-on { background: #111; color: #fff; }
.${P}-gb { position: absolute; left: 0; right: 0; top: 232px; height: 24px; box-sizing: border-box; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 7px; line-height: 24px; color: #fff; white-space: nowrap; }
.${P}-gb svg { flex: none; width: 8px; height: 8px; fill: none; stroke: #fff; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-gb circle { fill: none; stroke: #fff; stroke-width: 1.6; stroke-linecap: round; }
.${P}-gs { position: absolute; left: 0; right: 0; top: 262px; text-align: center; font-size: 5.6px; line-height: 8px; color: #9b9994; white-space: nowrap; }
.${P}-to { position: absolute; right: 8px; top: 8px; width: 152px; height: 34px; box-sizing: border-box; padding: 6px 8px 0 26px; border-radius: 6px; background: #fff; box-shadow: 0 0 0 1px rgba(0, 0, 0, .06), 0 4px 14px rgba(0, 0, 0, .16); }
.${P}-to i { position: absolute; left: 8px; top: 11px; width: 10px; height: 10px; border-radius: 50%; background: #1c1c1b; }
.${P}-to i svg { position: absolute; left: 2px; top: 2px; width: 6px; height: 6px; fill: none; stroke: #fff; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-to .${P}-x { position: absolute; left: -3px; top: -3px; width: 8px; height: 8px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 1px #ddd; }
.${P}-to .${P}-x svg { left: 2px; top: 2px; width: 4px; height: 4px; stroke: #555; stroke-width: 1.3; }
.${P}-t1 { font-size: 6.8px; line-height: 10px; font-weight: 600; color: #1c1c1b; white-space: nowrap; }
.${P}-t2 { margin-top: 2px !important; font-size: 5.8px; line-height: 8px; color: #75736f; white-space: nowrap; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const UPLOAD = 0.32;                               // 'Uploading request...' gives way to 'Processing...' (the capture: by ~2 s of 21)
const LAND = Array.from({ length: 10 }, (_, i) => 0.74 + i * (0.94 / 9));  // picture i fills its slot (strict reading order), the last at 1.68
const END = LAND[9];
const TURN = 420;                                  // the ring's travel, degrees per layout second
const PROMPT = 'a muse holding up a handwritten note in a lecture hall, meme style';
const f1 = (v) => v.toFixed(1);
const ICON = [
  '<svg viewBox="0 0 10 10"><rect x="1.4" y="1.4" width="7.2" height="7.2" rx="1.4"/><path d="M1.8 7 4 4.8 5.6 6.4 6.6 5.4 8.2 7"/></svg>',
  '<svg viewBox="0 0 10 10"><rect x="1.2" y="2.4" width="7.6" height="5.6" rx="1"/><path d="M1.2 4.2h7.6M4 2.4 3.2 1.2M6.4 2.4 5.6 1.2"/></svg>',
  '<svg viewBox="0 0 10 10"><path d="M2 8 6 4M5.2 1.6 5.6 2.8 6.8 3.2 5.6 3.6 5.2 4.8 4.8 3.6 3.6 3.2 4.8 2.8ZM8 5.6l.3.8.8.3-.8.3-.3.8-.3-.8-.8-.3.8-.3Z"/></svg>',
  '<svg viewBox="0 0 10 10"><rect x="1.4" y="1.4" width="7.2" height="7.2" rx="1"/><path d="M1.4 5h7.2M5 1.4v7.2"/></svg>',
  '<svg viewBox="0 0 10 10"><path d="M2 2.2h6M2 5h6M2 7.8h4"/></svg>',
  '<svg viewBox="0 0 10 10"><path d="M2.6 1.4h4l1.6 1.6v5.6H2.6ZM6.6 1.4V3h1.6M3.8 5h2.8M3.8 6.6h2.8"/></svg>',
  '<svg viewBox="0 0 10 10"><path d="M1.6 6.4 5.6 2.4 8 4.8 4 8.8H2.4ZM4.4 3.6 6.8 6"/></svg>',
  '<svg viewBox="0 0 10 10"><circle cx="5" cy="5.4" r="2.4"/><path d="M2.6 3.2h1.2l.6-1.2h1.2l.6 1.2h1.2"/></svg>',
];
const NAV = [['Text to Image', 0], ['Text to Video', 1], ['Image to Image', 2], ['Multi Images to Image', 3], ['Image to Video', 1], ['Image to Prompt', 4], ['Image to Text', 5], ['Background Remover', 6], ['Portrait & Styles', 7, 1], ['Image Templates', 3, 1], ['Image Tools', 2, 1], ['File Compressors', 5, 1], ['Emoji Tools', 0, 1]];
const R = 9.4, CIRC = 2 * Math.PI * R;
const ring = `<svg class="${P}-rg" viewBox="0 0 24 24"><g class="${P}-rt2"><circle cx="12" cy="12" r="${R}" stroke-dasharray="${(CIRC * 0.78).toFixed(2)} ${(CIRC * 0.22).toFixed(2)}"/></g></svg>`;
const sm = `<svg class="${P}-sm" viewBox="0 0 10 10" width="8" height="8"><g class="${P}-sg"><circle cx="5" cy="5" r="3.5" stroke-dasharray="${(2 * Math.PI * 3.5 * 0.78).toFixed(2)} ${(2 * Math.PI * 3.5 * 0.22).toFixed(2)}"/></g></svg>`;
const bolt = '<svg class="' + P + '-bo" viewBox="0 0 10 10"><path d="M5.6 1 2.6 5.6h2.2L4.4 9 7.6 4.2H5.4Z"/></svg>';

export default {
  id: 'vheer',
  label: 'Vheer (2026)',
  source: {
    platform: "Vheer (vheer.com) free Text to Image web app, route /app/text-to-image, desktop Chrome 1280x800, no account, English UI; captured first-hand by a live headless run on 2026-10-15",
    feature: "text to image in a light three-column app (tool nav, bare centre canvas, right settings column): the wait draws no tile, a black ring spinner floats on the empty canvas with 'Uploading request...' and then 'Processing... This may take up to 2 minutes' (an upper bound, not a countdown) and a small grey model line, while the Generate button becomes a full-width disabled grey pill with its own small white spinner and 'Generating...'; the picture then fills the canvas, an 'Image generated successfully!' toast arrives at the top right and the button reads 'Generate' again",
    capture: {
      url: 'https://www.vheer.com/app/text-to-image',
      date: '2026-10-15',
      timestamps: "one live generation, t counted from pressing Generate: 'Uploading request...' with the ring spinner and the grey line 'Vheer Quality • 1:1' t = 0 s (frame bf_vheer_uploading_0s), the string became 'Processing... This may take up to 2 minutes' by t ~ 2 s and stayed (frame bf_vheer_processing_11s, the button a disabled #9A9997 pill with a white ring and 'Generating...'), the status text left the page at t = 21.1 s and the picture was painted by t = 21.4 s (frame bf_vheer_result_21s), the 'Image generated successfully! / Your image is ready to download.' toast at t = 25 s (frame bf_vheer_toast_25s)",
    },
    refs: [
      { url: 'https://www.vheer.com/app/text-to-image', published: '2026-10-15', retrieved: '2026-10-15', note: "the live app: the two-stage status copy under the ring spinner, the greyed 'Generating...' button, the settings column ('Prompt', 'Enhance', 'Select Model', 'Aspect Ratio', 'Number of Images') and the success toast" },
      { url: 'https://www.vheer.com/tools/text-to-image', published: '2026-10-15', retrieved: '2026-10-15', note: 'the marketing route that redirects into the app route above' },
    ],
    extrapolated: [
      "ten pictures from one: the capture's batch is a single 1:1 picture filling the canvas with an Edit / Download bar under it; here the ten land in strict reading order as a 5 x 2 block on the canvas, each slot blank until its picture arrives (the canvas has no placeholder), all in view with no scroll",
      "the timing: the capture's wait is ~21 s with the first string lasting ~2 s; here the first string lasts the first sixth of the beat and the ten pictures land 0.1 s apart; the ring and the button spinner turn at rates of our own choosing (the capture's turn rate was not measured) and stop at the last landing",
      "the 'Number of Images' row reads '1 | 2 | 5 | 10' with '10' selected and the aspect ratio '4:5' with the grey lines 'Vheer Quality • 4:5' and 'Vheer Quality · 4:5 · 10 image(s)': the capture's row is 1 | 2 | 3 | 4 and its ratio 1:1 (so '1 image(s)'); the numbers follow our ten pictures of about 0.84 aspect",
      "the prompt box holds our own prompt wording; in the capture it holds a similar single-sentence prompt greyed while generating, greyed here for the whole beat",
      "the toast appears with the last picture and stays; in the capture it arrives ~3.5 s after the picture and slides out later",
      "the tool nav lists thirteen entries from the capture's left column with our own redrawn glyphs, the model glyph / wordmark, 'Get Started', 'Sign In' and 'Recent Library' left out (account and upsell chrome)",
      "the Edit / trash / Download bar under the grid is the capture's bar redrawn small for the grid; the bar appears with the last picture",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'vheer');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const chev = '<svg viewBox="0 0 10 10"><path d="M2.4 3.8 5 6.4 7.6 3.8"/></svg>';
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-nv"><p class="${P}-nt">Tools</p>${NAV.map(([n, g, more], i) => `<div class="${P}-ni${i === 0 ? ` ${P}-on` : ''}" style="top: ${26 + i * 18}px">${ICON[g]}<span>${n.replace('&', '&amp;')}</span>${more ? '<em>›</em>' : ''}</div>`).join('')}</div>`
      + `<div class="${P}-hd"><svg viewBox="0 0 10 10"><rect x="1.2" y="1.6" width="7.6" height="6.8" rx="1.2"/><path d="M3.8 1.6v6.8"/></svg><p class="${P}-bc"><span>Dashboard</span><span>›</span><b>Text to Image</b></p><p class="${P}-hy">History</p></div>`
      + `<div class="${P}-cn">`
      + `<div class="${P}-sp"><span class="${P}-rw">${ring}</span><p class="${P}-s1"></p><p class="${P}-s2">Vheer Quality • 4:5</p></div>`
      + `<div class="${P}-g">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-ab"><svg viewBox="0 0 10 10"><path d="M1.8 2.8h6.4M4 2.8V1.6h2v1.2M2.8 2.8l.4 5.6h3.6l.4-5.6"/></svg><span><svg viewBox="0 0 10 10"><path d="M1.6 8.4 2 6.4 7 1.4 8.6 3 3.6 8Z"/></svg>Edit</span><span class="${P}-dl"><svg viewBox="0 0 10 10"><path d="M5 1.6v5M2.8 4.8 5 7l2.2-2.2M1.8 8.6h6.4"/></svg>Download</span></div>`
      + `</div>`
      + `<div class="${P}-rt">`
      + `<p class="${P}-lb" style="top: 37px">Prompt</p><svg class="${P}-tr" viewBox="0 0 10 10"><path d="M1.8 2.8h6.4M4 2.8V1.6h2v1.2M2.8 2.8l.4 5.6h3.6l.4-5.6"/></svg>`
      + `<div class="${P}-pr">${PROMPT}<p class="${P}-en"><svg viewBox="0 0 10 10"><path d="M4 1.6 5 4 7.4 5 5 6 4 8.4 3 6 .6 5 3 4ZM8 1l.4 1 1 .4-1 .4L8 3.8 7.6 2.8l-1-.4 1-.4Z"/></svg>Enhance</p></div>`
      + `<p class="${P}-lb" style="top: 137px">Select Model</p><div class="${P}-sl">Vheer Quality${chev}</div>`
      + `<p class="${P}-lb" style="top: 183px">Aspect Ratio</p><div class="${P}-ar"><i></i>4:5${chev}</div>`
      + `<p class="${P}-lb" style="top: 197px">Number of Images</p><div class="${P}-nm"><span>1</span><span>2</span><span>5</span><span class="${P}-on">10</span></div>`
      + `<p class="${P}-gb">${bolt}${sm}<span class="${P}-gt"></span></p><p class="${P}-gs">Vheer Quality · 4:5 · 10 image(s)</p>`
      + `</div>`
      + `<div class="${P}-to"><span class="${P}-x"><svg viewBox="0 0 10 10"><path d="M2 2 8 8M8 2 2 8"/></svg></span><i><svg viewBox="0 0 10 10"><path d="M2 5.2 4.2 7.4 8 2.8"/></svg></i><p class="${P}-t1">Image generated successfully!</p><p class="${P}-t2">Your image is ready to download.</p></div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const sp = q('sp'), s1 = q('s1'), rg = q('rt2'), ab = q('ab'), gb = q('gb'), gt = q('gt'), sm_ = q('sm'), bo = q('bo'), sg = q('sg'), to = q('to');
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
        const sc = Math.min(s, END);                   // the spinners stop at the last landing
        const first = s >= LAND[0], last = s >= END;
        let stage = 0;
        if (s >= UPLOAD) stage = 1;

        // the floating spinner and its two-stage caption live on the bare canvas until the first picture arrives
        put('sp', first, (v) => { sp.style.visibility = v ? 'hidden' : ''; });
        put('cap', stage, (v) => { s1.textContent = v ? 'Processing... This may take up to 2 minutes' : 'Uploading request...'; });
        put('rg', f1((sc * TURN) % 360), (v) => { rg.setAttribute('transform', `rotate(${v} 12 12)`); });
        put('sg', f1((sc * TURN * 1.1) % 360), (v) => { sg.setAttribute('transform', `rotate(${v} 5 5)`); });

        cells.forEach((c, i) => {
          // a blank slot (the canvas colour) until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, s >= LAND[i], (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.cv.style.display = v ? 'none' : ''; });
        });

        // the Generate button: a disabled grey pill with its own spinner until the last picture, then the black 'Generate'
        put('gb', last, (v) => {
          gb.style.background = v ? '#111' : '#9a9997';
          sm_.style.display = v ? 'none' : '';
          bo.style.display = v ? '' : 'none';
          gt.textContent = v ? 'Generate' : 'Generating...';
        });
        put('ab', last, (v) => { ab.style.visibility = v ? '' : 'hidden'; to.style.visibility = v ? '' : 'hidden'; });
      },
    };
  },
};
