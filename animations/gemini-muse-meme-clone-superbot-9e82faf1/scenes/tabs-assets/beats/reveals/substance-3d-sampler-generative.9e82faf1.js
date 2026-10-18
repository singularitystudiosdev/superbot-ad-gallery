// Substance 3D Sampler (Beta 4.4.1) 'Generative (Beta)' text-to-texture (2024): the wait and reveal of a variations grid, from the vendor's own tutorial, a 1080p macOS screen recording
// https://www.youtube.com/watch?v=YD3tPlO5h3g (Adobe Substance 3D, official channel, 2024-05-23, 937 s tutorial, one uncut take over the wait: 10 fps frame diff over the 46 s section peaks at 1.6 % of the frame: press at t=78.8 s,
// panel locks and four ring-spinner tiles appear at t=78.9 s, the four textures land in one frame at t=92.9 s), stills reveal-refs/substance-3d-sampler-generative/frames/adobe_t{77.0,78.6,79.4,82.0,86.0,90.0,92.6,93.2,94.0,96.0,100.0}.png,
// spec .tmp/clone-9e82faf1/reveal-refs/substance-3d-sampler-generative/spec.json, confidence 0.62. The surface is a dark dockable-panel desktop app: a narrow generator panel at left (type dropdown, prompt box, blue button), a 3D viewport in
// the middle with a white shaded cylinder on dark grey, a layers / properties column at right. The idle panel holds a typed prompt and the blue button; pressing it locks the dropdown and the prompt (greyed), turns the button into an outline
// 'Cancel processing' and adds a 'Variations' section of dark tiles, each with a blue ring spinner, while the viewport does not change; after about 14 s all tiles swap to pictures in the same frame, the button becomes 'Generate more' and the
// prompt unlocks. Here the window is drawn flat (a generic title, no product name, logo or menu of the app), the cylinder is a plain CSS-shaded shape that stays white as in the footage, the prompt is our own, and the grid is the
// ten Muse memes as 5 x 2 sharp tiles that land in a quick reading-order sweep (~0.3 s; the footage lands its four in one frame).
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-s3s';
const ROOT_W = 560, ROOT_H = 410;
const TB_H = 22, MB_H = 18, BODY_T = TB_H + MB_H, BODY_H = ROOT_H - BODY_T;
const RAIL_W = 18, PAN_W = 296, VP_W = 160, RC_W = ROOT_W - RAIL_W - PAN_W - VP_W;
const TW = 52, TH = 61, TG = 4;                                              // a tile; 5 * 52 + 4 * 4 = 276, 2 * 61 + 4 = 126
const PAD = (PAN_W - (5 * TW + 4 * TG)) / 2;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #323232; color: #d6d6d6; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .55); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { display: block; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
.${P}-tb { position: absolute; left: 0; top: 0; width: 100%; height: ${TB_H}px; background: #2c2c2c; border-bottom: 1px solid #1d1d1d; box-sizing: border-box; }
.${P}-lt { position: absolute; top: 6px; width: 10px; height: 10px; border-radius: 50%; }
.${P}-ttl { position: absolute; left: 0; right: 0; top: 0; text-align: center; font-size: 10px; line-height: ${TB_H - 1}px; font-weight: 600; color: #c9c9c9; letter-spacing: .1px; }
.${P}-mb { position: absolute; left: 0; top: ${TB_H}px; width: 100%; height: ${MB_H}px; background: #2f2f2f; }
.${P}-mi { position: absolute; top: 0; font-size: 9px; line-height: ${MB_H}px; color: #cfcfcf; }
.${P}-pj { position: absolute; left: 0; right: 0; top: 0; text-align: center; font-size: 9px; line-height: ${MB_H}px; font-style: italic; color: #bdbdbd; }
.${P}-bd { position: absolute; left: 0; top: ${BODY_T}px; width: 100%; height: ${BODY_H}px; }
.${P}-rl { position: absolute; left: 0; top: 0; width: ${RAIL_W}px; height: 100%; background: #2b2b2b; border-right: 1px solid #1f1f1f; box-sizing: border-box; }
.${P}-rl svg { position: absolute; left: 3px; width: 12px; height: 12px; stroke-width: 1.7; color: #9a9a9a; }
.${P}-pn { position: absolute; left: ${RAIL_W}px; top: 0; width: ${PAN_W}px; height: 100%; background: #323232; border-right: 1px solid #1f1f1f; box-sizing: border-box; }
.${P}-ph { position: absolute; left: ${PAD}px; top: 8px; font-size: 8px; line-height: 10px; letter-spacing: .5px; color: #9d9d9d; }
.${P}-px { position: absolute; right: ${PAD}px; top: 8px; width: 9px; height: 9px; stroke-width: 2; color: #9d9d9d; }
.${P}-tabs { position: absolute; left: ${PAD}px; right: ${PAD}px; top: 24px; height: 17px; border-bottom: 1px solid #484848; }
.${P}-tab { position: absolute; top: 0; font-size: 9px; line-height: 15px; color: #a5a5a5; }
.${P}-tab.${P}-on { color: #ffffff; box-shadow: 0 1px 0 #ffffff; }
.${P}-lb { position: absolute; left: ${PAD}px; font-size: 8px; line-height: 10px; color: #b5b5b5; }
.${P}-sl { position: absolute; left: ${PAD}px; right: ${PAD}px; top: 60px; height: 20px; box-sizing: border-box; border: 1px solid #3a3a3a; border-radius: 3px; background: #1f1f1f; }
.${P}-sl p { position: absolute; left: 7px; top: 0; font-size: 9px; line-height: 18px; color: #e2e2e2; }
.${P}-sl svg { position: absolute; right: 5px; top: 5px; width: 9px; height: 9px; stroke-width: 2.2; color: #d0d0d0; }
.${P}-ta { position: absolute; left: ${PAD}px; right: ${PAD}px; top: 100px; height: 54px; box-sizing: border-box; border: 1px solid #3a3a3a; border-radius: 3px; background: #1f1f1f; }
.${P}-ta.${P}-fo { border-color: #2f7de1; }
.${P}-ta p { position: absolute; left: 6px; top: 7px; font-size: 9px; line-height: 12px; color: #e8e8e8; }
.${P}-cr { display: inline-block; width: 1px; height: 10px; margin-left: 1px; vertical-align: -2px; background: #f2f2f2; }
.${P}-ta svg { position: absolute; bottom: 5px; width: 12px; height: 12px; stroke-width: 1.7; color: #a8a8a8; }
.${P}-bx { position: absolute; left: ${PAD}px; right: ${PAD}px; top: 162px; height: 23px; box-sizing: border-box; border-radius: 3px; text-align: center; }
.${P}-bx svg { position: absolute; top: 5px; width: 12px; height: 12px; stroke-width: 1.8; }
.${P}-bx p { position: absolute; left: 0; right: 0; top: 0; font-size: 9px; line-height: 23px; text-align: center; }
.${P}-b0 { background: #1272e7; color: #ffffff; font-weight: 700; }
.${P}-b0 p { font-weight: 700; padding-left: 14px; }
.${P}-b0 svg { left: 96px; }
.${P}-b1, .${P}-b2 { background: #343434; border: 1px solid #4b4b4b; color: #d6d6d6; }
.${P}-b1 p, .${P}-b2 p { padding-left: 14px; line-height: 21px; }
.${P}-b1 svg { left: 82px; top: 4px; }
.${P}-b2 svg { left: 88px; top: 4px; }
.${P}-lnk { position: absolute; left: 0; right: 0; top: 193px; text-align: center; font-size: 8px; line-height: 10px; color: #b0b0b0; text-decoration: underline; }
.${P}-dv { position: absolute; left: ${PAD}px; right: ${PAD}px; top: 210px; height: 1px; background: #444444; }
.${P}-vr { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.${P}-vh { position: absolute; left: ${PAD}px; top: 218px; font-size: 9px; line-height: 12px; color: #dedede; }
.${P}-vh span { color: #8c8c8c; }
.${P}-gd { position: absolute; left: ${PAD}px; top: 236px; display: grid; grid-template-columns: repeat(5, ${TW}px); grid-template-rows: repeat(2, ${TH}px); gap: ${TG}px; }
.${P}-t { position: relative; box-sizing: border-box; width: ${TW}px; height: ${TH}px; background: #252525; border: 1px solid #1c1c1c; overflow: hidden; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #252525; }
.${P}-rg { position: absolute; left: 50%; top: 50%; margin: -9px 0 0 -9px; width: 18px; height: 18px; }
.${P}-rb { stroke: #262a2c; }
.${P}-ra { stroke: #2f7de1; }
.${P}-vp { position: absolute; left: ${RAIL_W + PAN_W}px; top: 0; width: ${VP_W}px; height: 100%; background: #333333; border-right: 1px solid #1f1f1f; box-sizing: border-box; overflow: hidden; }
.${P}-um { position: absolute; left: 8px; top: 8px; font-size: 8px; line-height: 10px; color: #b8b8b8; }
.${P}-ms { position: absolute; left: 8px; bottom: 7px; font-size: 8px; line-height: 10px; color: #a0a0a0; }
.${P}-vi { position: absolute; bottom: 6px; width: 11px; height: 11px; stroke-width: 1.6; color: #a6a6a6; }
.${P}-cy { position: absolute; left: ${(VP_W - 108) / 2}px; top: 92px; width: 108px; height: 140px; }
.${P}-cb { position: absolute; left: 0; top: 11px; width: 108px; height: 129px; border-radius: 6px 6px 54px 54px / 6px 6px 20px 20px; background: linear-gradient(90deg, #cfcbc6 0%, #f4efe7 18%, #fcf8f1 42%, #eeeae3 66%, #d3d2d3 88%, #b8b8bc 100%); box-shadow: 0 10px 18px rgba(0, 0, 0, .35); }
.${P}-cm { position: absolute; left: 0; top: 0; width: 108px; height: 24px; border-radius: 50%; background: linear-gradient(180deg, #8d8a86 0%, #b9b4ad 55%, #e5e0d8 100%); box-shadow: 0 0 0 1px rgba(255, 255, 255, .12); }
.${P}-ci { position: absolute; left: 5px; top: 3px; width: 98px; height: 17px; border-radius: 50%; background: linear-gradient(90deg, #d8d3cb, #b9b5b0 60%, #a7a5a5); }
.${P}-rc { position: absolute; left: ${RAIL_W + PAN_W + VP_W}px; top: 0; width: ${RC_W}px; height: 100%; background: #2f2f2f; box-sizing: border-box; }
.${P}-rh { position: absolute; left: 8px; font-size: 8px; line-height: 10px; letter-spacing: .4px; color: #a4a4a4; }
.${P}-rz { position: absolute; left: 14px; top: 40px; width: 58px; height: 52px; color: #4f4f4f; }
.${P}-rz svg { position: absolute; stroke-width: 1.5; }
.${P}-rt { position: absolute; left: 4px; right: 4px; top: 104px; text-align: center; font-size: 7px; line-height: 9px; font-style: italic; color: #666666; }
.${P}-rs { position: absolute; left: 0; right: 0; top: 148px; height: 1px; background: #1f1f1f; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const IDLE_END = 0.16;                             // layout seconds: the idle panel holds the typed prompt and the blue button
const PRESS_END = 0.23;                            // ... the button face lightens (the press), then the panel locks and the variations appear
const LAND0 = 1.44, LGAP = 0.036;                  // ... the footage lands every tile in one frame; here a quick reading-order sweep ~0.03 s apart (as aws-bedrock does), last tile still at ~1.76
const LAND = Array.from({ length: 10 }, (_, i) => LAND0 + i * LGAP);
const PROMPT = 'ten muse memes, sharp --no blur';   // our own wording, never the footage's

const ICONS = {
  gen: '<rect x="3.5" y="6" width="13" height="14" rx="2"/><path d="M17 2.5l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/>',
  cancel: '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
  chev: '<path d="M5 9l7 7 7-7"/>',
  close: '<path d="M5 5l14 14M19 5L5 19"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.4-5.7M20 3.5V8.5h-5"/>',
  imgadd: '<rect x="3" y="4" width="15" height="14" rx="2"/><path d="M3 15l4-4 3 3 3-3 5 5M19 18v5M16.5 20.5h5"/>',
  plus: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
  crop: '<path d="M7 2v15h15M2 7h15v15"/>',
  rect: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8v8H8z"/>',
  stamp: '<path d="M9 21h6M12 21v-5M8 16h8l-1-6a3 3 0 1 0-6 0z"/>',
  box: '<rect x="3" y="4" width="18" height="6" rx="1"/><path d="M5 10v9h14v-9M10 14h4"/>',
  grid: '<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  cam: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  file: '<path d="M6 2h8l5 5v15H6zM14 2v5h5"/>',
  pic: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M3 17l5-5 4 4 3-3 6 5"/>',
  down: '<path d="M12 4v14M6 12l6 7 6-7"/>',
};
const icon = (k, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24">${ICONS[k]}</svg>`;
const ring = () => `<svg class="${P}-rg" viewBox="0 0 24 24" width="18" height="18" style="visibility: hidden;"><circle class="${P}-rb" cx="12" cy="12" r="9" stroke-width="3"/><path class="${P}-ra" d="M12 3a9 9 0 1 1-8.2 5.3" stroke-width="3"/></svg>`;

export default {
  id: 'substance-3d-sampler-generative',
  label: 'Substance 3D Sampler generative variations (2024)',
  source: {
    platform: "a macOS pro desktop app for 3D materials (Substance 3D Sampler Beta 4.4.1), 1920 x 1080 screen recording of the vendor's own tutorial; the surface is a dockable-panel window with a narrow generator panel, a 3D viewport with a white cylinder and a layers / properties column",
    feature: "text-to-texture: the typed prompt is sent with a blue button; the panel locks (dropdown and prompt greyed, the button an outline 'Cancel processing') and a 'Variations (4)' section of dark tiles with blue ring spinners appears under it while the viewport stays unchanged; after about 14 s every tile swaps to its texture in the same frame, the button becomes 'Generate more' and the prompt unlocks",
    capture: {
      url: 'https://www.youtube.com/watch?v=YD3tPlO5h3g',
      page: 'https://www.youtube.com/watch?v=YD3tPlO5h3g',
      date: '2024-05-23',
      retrieved: '2026-10-17',
      timestamps: "source-video seconds (section cut on a keyframe, +-0.5 s): t = 77.0 s idle panel, prompt typed, blue 'Generate' button (adobe_t77.0); t = 78.8 s the cursor presses the button (face lightens, adobe_t78.6); t = 78.9 s the panel locks in one frame: 'Cancel processing', 'Variations (4)' with four dark tiles (adobe_t79.4); t = 79.4-92.8 s four blue ring spinners turn, nothing else changes (adobe_t82.0, adobe_t86.0, adobe_t90.0, adobe_t92.6); t = 92.9 s all four tiles swap to textures in one frame, the button reads 'Generate more' (adobe_t93.2); t = 94-100 s hover previews, the cylinder is still plain white (adobe_t94.0, adobe_t96.0, adobe_t100.0); uncut over t = 66-112 s (10 fps frame diff peaks at 1.6 % of the frame), about 14 s from the press to the landing",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=YD3tPlO5h3g', published: '2024-05-23', retrieved: '2026-10-17', note: "How to Use Generative Tools in Sampler for Fast Iterations (Adobe Substance 3D, official channel); the only source of the wait, the Text to Texture section t = 66-112 s" },
    ],
    extrapolated: [
      "the 10-up: the footage fills a 2 x 2 'Variations (4)' grid; here 'Variations (10)' holds ten tiles as a 5 x 2 grid in the same narrow panel, 52 x 61 px each, each a flat #252525 plate with a blue ring spinner that swaps to its picture; the footage lands all tiles in one frame, so the ten tiles land in a quick strict reading-order sweep 0.036 layout seconds apart (about 0.3 s in all, as aws-bedrock-image-playground does for its one-frame swap) so every landing is a distinct observable moment",
      "the pictures: seamless gravel textures in the footage, the ten Muse memes here (a crop of each, sharp at landing); the hover thumbs-up / thumbs-down / flag strip and the enlarged hover preview of the footage are not drawn",
      "the cylinder: a plain white shape shaded with CSS gradients (lit from the left, a rim ellipse, a soft shadow); as in the footage it does not take the texture at landing (the footage only changes it after the user adds a layer), so it stays white",
      "the prompt: the footage types 'ground with small rocks --no plants'; here the prompt is our own 'ten muse memes, sharp --no blur', shown typed with a caret and a blue focus border while idle",
      "the pace: the footage idles ~1.8 s on the typed prompt, presses at 78.8 s and waits ~14 s on the spinners; the beat plays idle -> press -> locked panel with ten ring spinners -> all pictures at once in the ~1.8 s window every module of this family uses; the rings turn faster than the footage's one turn per second so the compressed wait still reads as a spin",
      "the window: drawn flat with a generic title 'Material Studio (Beta)', the footage's panel title 'GENERATIVE (BETA)', 'Generate' and 'History' tabs, 'Type: Texture' dropdown, 'Text or Image input' label, 'Generate' / 'Cancel processing' / 'Generate more' button, 'Variations' label, a small terms link, 'Untitled material' and 'No available channels'-style hints are kept as plain strings; the product name and version, the macOS menu bar, the License menu, the 2D material view, the terms link's product name and the 'SBSAR' drop hint are not reproduced; the layers / properties column is two empty headings with a plain drop hint",
      "omitted from the footage: the product logo and name, the tool icons' exact art (plain stroke glyphs here), the mouse cursor, the viewport toolbar's real icons, any brand mark",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'substance-3d-sampler-generative');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv" style="transform-origin: ${g.origin}; transform: ${g.zoom === 1 ? 'none' : `scale(${(1 / g.zoom).toFixed(5)})`}"></div></div>${ring()}</div>`;
    const rail = ['plus', 'crop', 'rect', 'stamp'].map((k, i) => icon(k).replace('<svg', `<svg style="top: ${10 + i * 24}px"`)).join('')
      + ['box', 'grid', 'cog'].map((k, i) => icon(k).replace('<svg', `<svg style="bottom: ${10 + i * 24}px"`)).join('');
    const vi = [['info', 8], ['cam', 24], ['globe', 40], ['cog', 56]].map(([k, r]) => icon(k, `${P}-vi`).replace('<svg', `<svg style="right: ${r + 56}px"`)).join('');
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-tb"><i class="${P}-lt" style="left: 8px; background: #ff5f57;"></i><i class="${P}-lt" style="left: 23px; background: #febc2e;"></i><i class="${P}-lt" style="left: 38px; background: #28c840;"></i><p class="${P}-ttl">Material Studio (Beta)</p></div>`
      + `<div class="${P}-mb"><p class="${P}-mi" style="left: 10px;">File</p><p class="${P}-mi" style="left: 34px;">Edit</p><p class="${P}-mi" style="left: 60px;">Window</p><p class="${P}-mi" style="left: 100px;">Help</p><p class="${P}-pj">Untitled Project*</p></div>`
      + `<div class="${P}-bd">`
      + `<div class="${P}-rl">${rail}</div>`
      // the generator panel
      + `<div class="${P}-pn"><p class="${P}-ph">GENERATIVE (BETA)</p>${icon('close', `${P}-px`)}`
      + `<div class="${P}-tabs"><p class="${P}-tab ${P}-on" style="left: 0;">Generate</p><p class="${P}-tab" style="left: 52px;">History</p></div>`
      + `<div class="${P}-lk"><p class="${P}-lb" style="top: 50px;">Type</p><div class="${P}-sl"><p>Texture</p>${icon('chev')}</div>`
      + `<p class="${P}-lb" style="top: 88px;">Text or Image input</p>`
      + `<div class="${P}-ta ${P}-fo"><p><span class="${P}-tx">${PROMPT}</span><i class="${P}-cr"></i></p>${icon('refresh').replace('<svg', `<svg style="left: 7px"`)}${icon('imgadd').replace('<svg', `<svg style="left: 24px"`)}</div></div>`
      + `<div class="${P}-bx ${P}-b0">${icon('gen')}<p>Generate</p></div>`
      + `<div class="${P}-bx ${P}-b1" style="display: none;">${icon('cancel')}<p>Cancel processing</p></div>`
      + `<div class="${P}-bx ${P}-b2" style="display: none;">${icon('gen')}<p>Generate more</p></div>`
      + `<p class="${P}-lnk">Generative AI terms</p>`
      + `<div class="${P}-vr" style="visibility: hidden;"><div class="${P}-dv"></div><p class="${P}-vh">Variations <span>(10)</span></p><div class="${P}-gd">${tiles.map(cell).join('')}</div></div>`
      + `</div>`
      // the 3D viewport: a plain shaded cylinder
      + `<div class="${P}-vp"><p class="${P}-um">Untitled material</p><div class="${P}-cy"><div class="${P}-cb"></div><div class="${P}-cm"><div class="${P}-ci"></div></div></div><p class="${P}-ms">1 ms</p>${vi}</div>`
      // the layers / properties column
      + `<div class="${P}-rc"><p class="${P}-rh" style="top: 8px;">LAYERS</p><div class="${P}-rz">${icon('pic').replace('<svg', '<svg style="left: 0; top: 4px; width: 30px; height: 26px"')}${icon('file').replace('<svg', '<svg style="left: 30px; top: 0; width: 24px; height: 30px"')}${icon('down').replace('<svg', '<svg style="left: 22px; top: 32px; width: 14px; height: 18px"')}</div><p class="${P}-rt">Drag and drop here</p><div class="${P}-rs"></div><p class="${P}-rh" style="top: 158px;">PROPERTIES</p></div>`
      + `</div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const lk = q('lk'), ta = q('ta'), cr = q('cr'), vr = q('vr'), b0 = q('b0'), b1 = q('b1'), b2 = q('b2');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), rg: n.querySelector(`.${P}-rg`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };
    const show = (n, on) => { n.style.visibility = on ? '' : 'hidden'; };
    const disp = (n, on) => { n.style.display = on ? '' : 'none'; };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const ang = Math.floor((s * 720) % 360 / 18) * 18;   // the rings' turn, a pure function of s
        // the panel's state: 0 idle, 1 the press, 2 locked and waiting, 3 landed
        const ph = s < IDLE_END ? 0 : s < PRESS_END ? 1 : s < LAND[0] ? 2 : 3;

        put('ph', ph, (v) => {
          disp(b0, v < 2); disp(b1, v === 2); disp(b2, v === 3);
          b0.style.background = v === 1 ? '#3b8cf2' : '';
          lk.style.opacity = v === 2 ? '0.4' : '';
          ta.classList.toggle(`${P}-fo`, v < 2); cr.style.display = v < 2 ? '' : 'none';
          show(vr, v >= 2);
        });

        cells.forEach((c, i) => {
          const landed = s >= LAND[i];
          const wait = ph === 2 && !landed;
          put(`i${i}`, `${landed}|${wait}|${wait ? ang : 0}`, () => {
            c.im.style.visibility = landed ? '' : 'hidden';
            c.cv.style.display = landed ? 'none' : '';
            show(c.rg, wait);
            c.rg.style.transform = wait ? `rotate(${ang}deg)` : '';
          });
        });
      },
    };
  },
};
