// Chaos Cosmos AI Assets Generator (2026 beta), 3D Models branch: the whole screen of a 3D authoring host, read from the vendor's own YouTube clip fWkK_ggWXxs
// (2026-09-09, wait t = 96-104 s; frames reveal-refs/chaos-cosmos/frames/bs_cc_*.png, spec .tmp/clone-9e82faf1/reveal-refs/chaos-cosmos/spec.json, confidence 0.55).
// The screen is a SketchUp-style desktop host: a thin menu strip and toolbar strip, a tool rail, a live 3D living-room viewport filling the middle and a right tray
// ('Components'), with the dark 'Cosmos Browser' panel docked over the viewport's left. In the panel the 'Create your 3D model' form (Image, Settings, Model, Preset
// Draft | Medium | High | Custom) is replaced by an empty 2:3 card carrying a thin wireframe-cube glyph with two ticked step chips under it ('In queue', then 'Generating'),
// the cube clears to a single grey open spinner arc, and the finished results land in the panel. No percentage, timer, ETA or bar exists anywhere in the wait.
// Omitted: the clip author's burnt-in caption ('Generating this model took around one minute. / ... Preset' is not product UI), every Chaos / V-Ray / SketchUp /
// Microsoft mark and model name, the avatar, the quota tabs and the 'Start over' control. The room is our own flat-shaded drawing, every picture is OUR meme.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-chc';
const ROOT_W = 560, ROOT_H = 372;
const PX = 18, PY = 50, PW = 260, PH = 236;            // the docked panel over the viewport
const COLS = 5, TILE_W = 44, TILE_H = 66, GAP = 5;      // 2:3 cards, five columns by two rows
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 6px; background: #1a1a1a; color: #2a2a2a; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .35); }
.${P} p { margin: 0; }
.${P} i { display: block; }
.${P}-mb { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: 12px; background: #f3f3f3; box-shadow: 0 1px 0 #d6d6d6; display: flex; align-items: center; gap: 8px; padding-left: 8px; box-sizing: border-box; }
.${P}-mb span { font-size: 6.2px; line-height: 12px; color: #2f2f2f; white-space: nowrap; }
.${P}-tb { position: absolute; left: 0; top: 12px; width: ${ROOT_W}px; height: 22px; background: #f6f6f6; box-shadow: 0 1px 0 #d2d2d2; }
.${P}-tb i { position: absolute; top: 6px; width: 9px; height: 9px; border-radius: 2px; box-sizing: border-box; }
.${P}-lr { position: absolute; left: 0; top: 34px; width: 16px; height: ${ROOT_H - 34}px; background: #ececec; box-shadow: 1px 0 0 #d2d2d2; }
.${P}-lr i { position: absolute; left: 3.5px; width: 9px; height: 9px; border-radius: 50%; box-sizing: border-box; }
.${P}-vp { position: absolute; left: 16px; top: 34px; width: 422px; height: ${ROOT_H - 34}px; background: #0c0c0c; overflow: hidden; }
.${P}-sn { position: absolute; left: 0; top: 0; width: 422px; height: 12px; background: #e6e6e6; }
.${P}-sn span { position: absolute; top: 2.5px; height: 8px; box-sizing: border-box; padding: 0 5px; border-radius: 2px 2px 0 0; background: #f7f7f7; font-size: 5.6px; line-height: 8px; color: #444; white-space: nowrap; }
.${P}-sc { position: absolute; left: 0; top: 12px; width: 422px; height: 314px; overflow: hidden; background: #e0d8cf; }
.${P}-fl, .${P}-nl { position: absolute; left: -8px; top: 0; width: 438px; height: 314px; }
.${P}-wl { position: absolute; left: 0; top: 0; width: 438px; height: 226px; background: linear-gradient(180deg, #ece6df 0%, #ded5cb 100%); }
.${P}-fr { position: absolute; left: 0; top: 226px; width: 438px; height: 88px; background: repeating-linear-gradient(62deg, #b47e40 0, #b47e40 4px, #9f6c31 4px, #9f6c31 8px); }
.${P}-fg { position: absolute; left: 0; top: 226px; width: 438px; height: 88px; background: linear-gradient(180deg, rgba(0, 0, 0, .26) 0%, rgba(255, 255, 255, .06) 100%); }
.${P}-bb { position: absolute; left: 0; top: 220px; width: 438px; height: 7px; background: #8b5b2d; }
.${P}-d1, .${P}-d2 { position: absolute; border-radius: 50%; box-sizing: border-box; border: 3px solid #b88a52; background-color: #c99d66; background-image: radial-gradient(circle at 50% 50%, #4d3118 0, #4d3118 1.15px, transparent 1.55px); background-size: 5px 5px; box-shadow: 0 2px 5px rgba(60, 40, 20, .3); }
.${P}-d1 { left: 322px; top: 18px; width: 104px; height: 104px; }
.${P}-d2 { left: 396px; top: -2px; width: 72px; height: 72px; }
.${P}-sb { position: absolute; background: #3f666e; border-radius: 6px; }
.${P}-sk { position: absolute; background: #5c8a91; border-radius: 6px; box-shadow: inset 0 -3px 0 rgba(0, 0, 0, .1); }
.${P}-ss { position: absolute; left: 66px; top: 262px; width: 340px; height: 9px; background: rgba(40, 20, 8, .3); border-radius: 50%; }
.${P}-cb { position: absolute; left: 404px; top: 180px; width: 44px; height: 84px; background: #b98c57; box-shadow: inset 0 0 0 2px #a67a47; }
.${P}-cb i { position: absolute; left: 3px; right: 3px; height: 2px; background: #8d6234; }
.${P}-bw { position: absolute; left: 408px; top: 172px; width: 26px; height: 9px; border-radius: 50%; background: #6c4b31; }
.${P}-ct { position: absolute; left: 108px; top: 286px; width: 270px; height: 44px; border-radius: 50%; background: #4a2d20; box-shadow: 0 -2px 0 #5d3b2a; }
.${P}-fb { position: absolute; left: 196px; top: 280px; width: 28px; height: 20px; border-radius: 50%; background: #a8412c; box-shadow: inset -4px -3px 0 rgba(0, 0, 0, .16); }
.${P}-st { position: absolute; left: 0; top: 326px; width: 422px; height: 12px; background: #ececec; box-sizing: border-box; padding-left: 8px; font-size: 5.6px; line-height: 12px; color: #4a4a4a; white-space: nowrap; }
.${P}-tr { position: absolute; left: 438px; top: 34px; width: ${ROOT_W - 438}px; height: ${ROOT_H - 34}px; background: #efeff0; box-shadow: -1px 0 0 #d2d2d2; overflow: hidden; }
.${P}-th { height: 12px; box-sizing: border-box; padding: 0 7px; background: #e1e1e3; box-shadow: 0 1px 0 #d0d0d3; font-size: 6px; line-height: 12px; font-weight: 600; color: #333; white-space: nowrap; }
.${P}-tr .${P}-th2 { height: 11px; box-sizing: border-box; padding: 0 7px; margin-top: 1px; background: #e9e9eb; font-size: 5.8px; line-height: 11px; color: #3a3a3a; white-space: nowrap; }
.${P}-tx { margin: 4px 6px 0; height: 28px; display: flex; gap: 4px; }
.${P}-tx i { flex: none; width: 28px; height: 28px; box-sizing: border-box; border-radius: 2px; background: #fff; box-shadow: inset 0 0 0 1px #cfcfd2; }
.${P}-tx b { flex: 1; height: 8px; margin-top: 2px; background: #fff; box-shadow: inset 0 0 0 1px #cfcfd2; }
.${P}-tl { margin: 5px 6px 0; display: flex; gap: 9px; font-size: 5.6px; line-height: 8px; color: #555; }
.${P}-tc { margin: 4px 6px 0; display: flex; align-items: center; gap: 5px; height: 17px; }
.${P}-tc i { flex: none; width: 15px; height: 15px; box-sizing: border-box; border-radius: 2px; background: #fff; box-shadow: inset 0 0 0 1px #cfcfd2; }
.${P}-tc b { flex: 1; height: 3px; border-radius: 1px; background: #c9c9cd; }
.${P}-pn { position: absolute; left: ${PX}px; top: ${PY}px; width: ${PW}px; height: ${PH}px; box-sizing: border-box; background: #1d1e20; border-radius: 3px; box-shadow: 0 0 0 1px #3a3c40, 0 4px 16px rgba(0, 0, 0, .4); overflow: hidden; color: #d1d2d4; }
.${P}-tt { position: absolute; left: 0; top: 0; width: ${PW}px; height: 15px; background: #28292c; font-size: 6.4px; line-height: 15px; padding-left: 8px; box-sizing: border-box; color: #e9eaec; white-space: nowrap; }
.${P}-tt svg { position: absolute; top: 4.5px; width: 6px; height: 6px; fill: none; stroke: #b9bbc0; stroke-width: 1; stroke-linecap: round; }
.${P}-se { position: absolute; left: 8px; top: 19px; width: 244px; height: 13px; box-sizing: border-box; border-radius: 3px; background: #2b2d31; padding: 0 6px; font-size: 6px; line-height: 13px; color: #8d8f94; white-space: nowrap; }
.${P}-tg { position: absolute; left: 8px; top: 36px; width: 244px; height: 12px; display: flex; font-size: 5.8px; line-height: 11px; letter-spacing: .3px; color: #8d8f94; }
.${P}-tg span { flex: 1; text-align: center; box-sizing: border-box; }
.${P}-tg .${P}-on { color: #6dbbcf; box-shadow: inset 0 -1.2px 0 #4a9db3; }
.${P}-bd { position: absolute; left: 0; top: 52px; width: ${PW}px; height: 160px; }
.${P}-h1 { position: absolute; left: 8px; top: 2px; font-size: 8px; line-height: 11px; font-weight: 600; color: #ecedef; white-space: nowrap; }
.${P}-lb { position: absolute; left: 8px; font-size: 6.2px; line-height: 10px; color: #a7a9ae; white-space: nowrap; }
.${P}-lb.${P}-hd { font-weight: 600; color: #e1e2e5; font-size: 6.6px; }
.${P}-im { position: absolute; left: 8px; top: 27px; width: 244px; height: 24px; box-sizing: border-box; border-radius: 3px; background: #26282b; box-shadow: inset 0 0 0 1px #34363a; }
.${P}-im i { position: absolute; left: 4px; top: 4px; width: 16px; height: 16px; border-radius: 2px; background: #3a3c41; box-shadow: inset 0 0 0 1px #4a4d53; }
.${P}-im i b { position: absolute; left: 5px; top: 3px; width: 6px; height: 10px; border-radius: 3px 3px 1px 1px; background: #8a8c92; }
.${P}-im p { position: absolute; left: 26px; top: 0; font-size: 6px; line-height: 24px; color: #b6b8bc; white-space: nowrap; }
.${P}-sg { position: absolute; right: 8px; display: flex; gap: 0; height: 12px; box-sizing: border-box; border-radius: 2px; box-shadow: inset 0 0 0 1px #3a3d42; }
.${P}-sg span { height: 12px; box-sizing: border-box; padding: 0 5px; font-size: 5.8px; line-height: 12px; color: #9a9ca1; white-space: nowrap; }
.${P}-sg .${P}-sl { color: #dff3f8; background: #25444d; box-shadow: inset 0 0 0 1px #4a9db3; border-radius: 2px; }
.${P}-sg .${P}-dm { color: #5c5e63; }
.${P}-cn { position: absolute; left: ${PW - 8 - 56}px; top: 214px; width: 56px; height: 14px; box-sizing: border-box; border-radius: 7px; background: #f3f4f5; color: #25272a; font-size: 6.4px; line-height: 14px; text-align: center; font-weight: 500; box-shadow: 0 0 0 1px #b9bbc0; }
.${P}-cd { position: absolute; left: 85px; top: 2px; width: 90px; height: 135px; box-sizing: border-box; border-radius: 4px; background: #232427; box-shadow: inset 0 0 0 1px #313337; }
.${P}-cd > svg { position: absolute; left: 0; top: 0; width: 90px; height: 135px; }
.${P}-sq { position: absolute; left: 35px; top: 57px; width: 20px; height: 20px; }
.${P}-sq svg { display: block; width: 20px; height: 20px; }
.${P}-cu path { fill: none; stroke: #8b8e94; stroke-width: 1; stroke-linejoin: round; stroke-linecap: round; }
.${P}-cu .${P}-cf { fill: #1b1c1e; stroke: none; }
.${P}-sp circle { fill: none; stroke-width: 1.8; stroke-linecap: round; }
.${P}-sp .${P}-tk { stroke: rgba(160, 163, 169, .22); }
.${P}-sp .${P}-sw { stroke: #a5a8ae; }
.${P}-cr { position: absolute; left: 0; top: 144px; width: ${PW}px; height: 13px; display: flex; justify-content: center; gap: 6px; }
.${P}-cp { height: 13px; box-sizing: border-box; border-radius: 4px; padding: 0 6px 0 4px; background: #26282b; box-shadow: inset 0 0 0 1px #34363a; display: flex; align-items: center; gap: 3px; font-size: 5.8px; line-height: 13px; color: #9fa6aa; white-space: nowrap; }
.${P}-cp svg { flex: none; width: 6px; height: 6px; fill: none; stroke: #7fb7c6; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-cp.${P}-ac { color: #bfe4ee; background: #1f3f49; box-shadow: inset 0 0 0 1px #4a9db3; }
.${P}-ah { position: absolute; left: 10px; top: 2px; font-size: 8px; line-height: 11px; font-weight: 600; color: #ecedef; white-space: nowrap; }
.${P}-g { position: absolute; left: 10px; top: 18px; display: grid; grid-template-columns: repeat(${COLS}, ${TILE_W}px); grid-auto-rows: ${TILE_H}px; gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TILE_W}px; height: ${TILE_H}px; border-radius: 3px; overflow: hidden; background: #232427; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #232427; box-shadow: inset 0 0 0 1px #313337; border-radius: 3px; }
.${P}-cv svg { position: absolute; left: 15px; top: 28px; width: 14px; height: 14px; }
.${P}-pv { position: absolute; left: 0; top: 214px; width: ${PW}px; height: 16px; }
.${P}-pv p { position: absolute; left: 10px; top: 0; font-size: 5.8px; line-height: 16px; color: #8d8f94; white-space: nowrap; }
.${P}-pv span { position: absolute; left: 34px; top: 2px; height: 12px; box-sizing: border-box; padding: 0 12px 0 5px; border-radius: 2px; background: #3a3c40; font-size: 5.8px; line-height: 12px; color: #b9bbc0; white-space: nowrap; }
.${P}-pv i { position: absolute; right: 10px; top: 1px; width: 14px; height: 14px; border-radius: 50%; background: #2d8bff; }
.${P}-pv svg { position: absolute; right: 13px; top: 4px; width: 8px; height: 8px; fill: none; stroke: #fff; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const FORM_END = 0.30;                             // the 'Create your 3D model' form hands over to the empty card
const CHIP2 = 0.46;                                // 'Generating' follows 'In queue'
const SPIN = 0.62;                                 // the cube clears to a single grey spinner arc
const GRID_AT = 0.90;                              // the card gives way to the 'Your assets' grid of ten still-empty cards
const LAND = Array.from({ length: 10 }, (_, i) => 1.04 + i * (0.64 / 9));  // card i fills with its picture (strict reading order), the last at 1.68
const TURN = 540;                                  // a spinner arc's travel, degrees per layout second
const ORBIT = 1.1;                                 // the live viewport's slow camera drift

const f1 = (v) => v.toFixed(1);
const R = 3.9, CIRC = 2 * Math.PI * R;
const arc = (cls) => `<svg class="${P}-sp ${cls}" viewBox="0 0 10 10"><circle class="${P}-tk" cx="5" cy="5" r="${R}"/><g class="${P}-ag"><circle class="${P}-sw" cx="5" cy="5" r="${R}" stroke-dasharray="${(CIRC * 0.7).toFixed(2)} ${(CIRC * 0.3).toFixed(2)}"/></g></svg>`;
const TICK = '<svg viewBox="0 0 10 10"><path d="M1.8 5.4 4.1 7.6 8.3 2.6"/></svg>';
const dot = (c) => `<i style="background: ${c}"></i>`;
const tbIcons = Array.from({ length: 26 }, (_, i) => `<i style="left: ${8 + i * 13}px; background: ${['#6b7c8c', '#c2553a', '#4a78b8', '#8a8f94', '#d39b2c', '#5a9a6a'][i % 6]}; opacity: .85; ${i % 5 === 2 ? 'border-radius: 50%;' : ''}"></i>`).join('');
const lrIcons = Array.from({ length: 16 }, (_, i) => `<i style="top: ${6 + i * 15}px; background: ${['#59616b', '#8a8f94', '#3d5f8a', '#a4552f'][i % 4]}; opacity: .8; ${i % 3 === 0 ? 'border-radius: 2px;' : ''}"></i>`).join('');
const MENU = ['File', 'Edit', 'View', 'Camera', 'Draw', 'Tools', 'Window', 'Extensions', 'Help'];
const cubeGlyph = `<svg class="${P}-cu" viewBox="0 0 90 135"><path class="${P}-cf" d="M45 41 69 54.5 69 82 45 95.5 21 82 21 54.5Z"/><path d="M45 41 69 54.5 69 82 45 95.5 21 82 21 54.5ZM21 54.5 45 68 69 54.5M45 68V95.5"/></svg>`;

export default {
  id: 'chaos-cosmos',
  label: 'Chaos Cosmos AI (2026)',
  source: {
    platform: "Chaos Cosmos 'AI Assets Generator' (3D Models branch, 2026 beta): the docked 'Cosmos Browser' panel opened over a live 3D viewport in a desktop 3D authoring host (the footage is SketchUp 2026 Pro with the V-Ray toolbars), English UI, captured from the vendor's own YouTube channel",
    feature: "the wait of one image-to-3D job inside the host: pressing Generate replaces the panel's 'Create your 3D model' form (Image row, Settings with Model and Preset Draft | Medium | High | Custom) with a tall empty 2:3 card carrying a thin wireframe-cube glyph, two ticked step chips under it ('In queue', then the accented 'Generating'), then the cube clears to a single grey open spinner arc in the blank card; the finished model replaces the card content in place by a hard swap. The 3D viewport (a living room) and the host's menu, toolbars and right tray stay live behind the panel; no percentage, timer, ETA or progress bar exists",
    capture: {
      url: 'https://www.youtube.com/watch?v=fWkK_ggWXxs',
      date: '2026-09-09',
      timestamps: "video fWkK_ggWXxs 'Generate Custom 3D Models with AI in Chaos Cosmos (New Beta Feature)' (Chaos V-Ray, 3:09): generator form t = 96 s (frame bs_cc_form), post-Generate empty 2:3 card with the wireframe cube and the 'In queue' / 'Generating' chips t = 99 s (bs_cc_stepchips), blank card with the grey spinner arc t = 100 s (bs_cc_spinner), finished model in the panel t = 101 s (bs_cc_done), the viewport back on the same room with no asset placed t = 105 s (bs_cc_scene_after)",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=fWkK_ggWXxs', published: '2026-09-09', retrieved: '2026-10-15', note: "the whole screen (host menu and toolbars, tool rail, live living-room viewport, right tray) and the panel's form, queue chips, cube placeholder, spinner arc and finished model" },
      { url: 'https://documentation.chaos.com/space/COSMOS/1133903900/AI+Assets+Generator', published: '2026-10', retrieved: '2026-10-15', note: 'the generator form fields and presets (text only; no media of the generating state)' },
    ],
    extrapolated: [
      "ten results from one: the footage generates ONE 3D model rendered large in the panel; here the panel's 'Your assets' view holds a 5 x 2 grid of ten 2:3 cards that fill with our pictures in strict reading order, each card landing on its own clock after the grid appears with every card still blank",
      "all timing: the form-to-card hand-over, the chip ticks, the cube-to-spinner swap and the grid are 0.3 / 0.46 / 0.62 / 0.9 s into the shared 1.84 s beat (the recording shows the chips and the arc about one second apart and the clip author's caption says the real job took around one minute); the cards land 0.07 s apart",
      "the 'Your assets' heading and the cards' own small grey spinner arcs: the recording shows only the single arc in the one big card; the grid view with a pending arc per card is ours, the arc turning by a pure function of t and frozen when its card lands",
      "the form's Model and Resolution rows use our own wording ('Standard' | 'Fast', 512 | 1024 | 1536) in place of the recording's named model and preset numbers, and the Image row shows a generic file line instead of the real file name",
      "the room is our own simple flat-shaded drawing (wall, sofa, floor, round wall disc, cabinet, coffee table), never traced from the footage; its slow camera drift is ours (the recording's viewport is still), clamped at the last landing so the landed screen is static",
      "the finished results are our own memes in the panel's cards; the recording's finished result is the generated 3D model of the user's sculpture photograph",
      "the host's menu items and the tray's rows are generic desktop-host wording; the host's own name, the V-Ray toolbars, the Cosmos wordmark glyph, the avatar, the Online | Downloaded quota tabs and 'Start over' are omitted",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'chaos-cosmos');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv">${arc(`${P}-sg2`)}</div></div></div>`;
    const sofa = `<div class="${P}-ss"></div>`
      + `<div class="${P}-sb" style="left: 62px; top: 140px; width: 332px; height: 90px"></div>`
      + [0, 1, 2].map((i) => `<div class="${P}-sk" style="left: ${70 + i * 106}px; top: 148px; width: 100px; height: 72px"></div>`).join('')
      + `<div class="${P}-sb" style="left: 372px; top: 152px; width: 28px; height: 112px; border-radius: 9px; background: #46737b"></div>`
      + `<div class="${P}-sb" style="left: 62px; top: 244px; width: 332px; height: 22px; border-radius: 3px; background: #365a61"></div>`
      + [0, 1, 2].map((i) => `<div class="${P}-sk" style="left: ${66 + i * 106}px; top: 216px; width: 104px; height: 32px; background: #6a979d"></div>`).join('')
      + `<div class="${P}-sb" style="left: 72px; top: 266px; width: 5px; height: 6px; border-radius: 1px; background: #2e2013"></div><div class="${P}-sb" style="left: 380px; top: 266px; width: 5px; height: 6px; border-radius: 1px; background: #2e2013"></div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-mb">${MENU.map((m) => `<span>${m}</span>`).join('')}</div>`
      + `<div class="${P}-tb">${tbIcons}</div>`
      + `<div class="${P}-lr">${lrIcons}</div>`
      + `<div class="${P}-vp"><div class="${P}-sn"><span style="left: 6px">Scene</span><span style="left: 34px; background: #ececec; color: #666">Top View</span></div>`
      + `<div class="${P}-sc"><div class="${P}-fl"><div class="${P}-wl"></div><div class="${P}-d2"></div><div class="${P}-d1"></div><div class="${P}-fr"></div><div class="${P}-fg"></div><div class="${P}-bb"></div></div>`
      + `<div class="${P}-nl"><div class="${P}-cb"><i style="top: 20px"></i><i style="top: 42px"></i><i style="top: 64px"></i></div><div class="${P}-bw"></div>${sofa}<div class="${P}-ct"></div><div class="${P}-fb"></div></div></div>`
      + `<p class="${P}-st">Click or drag to select objects. Shift = Add/Subtract.</p></div>`
      + `<div class="${P}-tr"><p class="${P}-th">Components</p><p class="${P}-th2">Entity Info</p><p class="${P}-th2">Materials</p><p class="${P}-th2">Components</p>`
      + `<div class="${P}-tx"><i></i><b></b></div><div class="${P}-tl"><span>Select</span><span>Edit</span><span>Statistics</span></div>`
      + `<div class="${P}-tc"><i></i><b></b></div><div class="${P}-tc"><i></i><b style="width: 60%; flex: none"></b></div><div class="${P}-tc"><i></i><b></b></div>`
      + `<p class="${P}-th2" style="margin-top: 5px">Styles</p><p class="${P}-th2">Environments</p><p class="${P}-th2">Tags</p><p class="${P}-th2">Shadows</p><p class="${P}-th2">Scenes</p></div>`
      + `<div class="${P}-pn">`
      + `<p class="${P}-tt">Cosmos Browser<svg viewBox="0 0 10 10" style="left: ${PW - 44}px"><path d="M1.5 5h7"/></svg><svg viewBox="0 0 10 10" style="left: ${PW - 31}px"><path d="M1.8 1.8h6.4v6.4H1.8Z"/></svg><svg viewBox="0 0 10 10" style="left: ${PW - 18}px"><path d="M2 2 8 8M8 2 2 8"/></svg></p>`
      + `<p class="${P}-se">Search...</p>`
      + `<div class="${P}-tg"><span class="${P}-on">3D MODELS</span><span>MATERIALS</span></div>`
      + `<div class="${P}-bd ${P}-fm">`
      + `<p class="${P}-h1">Create your 3D model</p>`
      + `<p class="${P}-lb" style="top: 18px">Image</p>`
      + `<div class="${P}-im"><i><b></b></i><p>reference-image.png · 1.32 MB</p></div>`
      + `<p class="${P}-lb ${P}-hd" style="top: 58px">Settings</p>`
      + `<p class="${P}-lb" style="top: 74px">Model</p><div class="${P}-sg" style="top: 73px"><span class="${P}-sl">Standard</span><span>Fast</span></div>`
      + `<p class="${P}-lb" style="top: 92px">Preset</p><div class="${P}-sg" style="top: 91px"><span>Draft</span><span class="${P}-sl">Medium</span><span>High</span><span class="${P}-dm">Custom</span></div>`
      + `<p class="${P}-lb" style="top: 110px">Resolution</p><div class="${P}-sg" style="top: 109px"><span>512</span><span class="${P}-sl">1024</span><span>1536</span></div>`
      + `<p class="${P}-lb" style="top: 128px">Texture resolution</p><div class="${P}-sg" style="top: 127px"><span>1K</span><span class="${P}-sl">2K</span><span>4K</span></div>`
      + `<p class="${P}-lb" style="top: 148px; color: #6f7176">Advanced</p>`
      + `</div>`
      + `<div class="${P}-bd ${P}-pd">`
      + `<div class="${P}-cd">${cubeGlyph}<div class="${P}-sq">${arc(`${P}-big`)}</div></div>`
      + `<div class="${P}-cr"><p class="${P}-cp ${P}-c1">${TICK}In queue</p><p class="${P}-cp ${P}-ac ${P}-c2">${TICK}Generating</p></div>`
      + `</div>`
      + `<div class="${P}-bd ${P}-as"><p class="${P}-ah">Your assets</p><div class="${P}-g">${tiles.map(cell).join('')}</div></div>`
      + `<p class="${P}-cn">Cancel</p>`
      + `<div class="${P}-pv"><p>Preview</p><span>Texture</span><i></i><svg viewBox="0 0 10 10"><path d="M5 1.6v5.6M2.8 5.2 5 7.4l2.2-2.2M2 8.8h6"/></svg></div>`
      + `</div></div>`);
    const q = (s) => root.querySelector(`.${P}-${s}`);
    const fm = q('fm'), pd = q('pd'), as = q('as'), cn = q('cn'), pv = q('pv'), c2 = q('c2'), cu = q('cu'), sq = q('sq'), fl = q('fl'), nl = q('nl');
    const bigAg = sq.querySelector(`.${P}-ag`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), ag: n.querySelector(`.${P}-ag`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const phase = s < FORM_END ? 0 : s < GRID_AT ? 1 : 2;

        // the form, then the empty card with its step chips, then the grid of results; each panel body is shown by visibility alone
        put('ph', phase, (v) => {
          fm.style.visibility = v === 0 ? '' : 'hidden';
          pd.style.visibility = v === 1 ? '' : 'hidden';
          as.style.visibility = v === 2 ? '' : 'hidden';
          cn.style.visibility = v === 2 ? 'hidden' : '';
          pv.style.visibility = v === 2 ? '' : 'hidden';
        });
        put('c2', s >= CHIP2, (v) => { c2.style.visibility = v ? '' : 'hidden'; });
        put('sp', s >= SPIN, (v) => { cu.style.visibility = v ? 'hidden' : ''; sq.style.visibility = v ? '' : 'hidden'; });
        put('big', f1((Math.min(Math.max(s - SPIN, 0), GRID_AT - SPIN) * TURN) % 360), (v) => { bigAg.setAttribute('transform', `rotate(${v} 5 5)`); });

        // the live viewport: a slow camera drift, a far wall layer and a near furniture layer, stopped at the last landing
        const o = Math.sin(Math.min(s, LAND[9]) * ORBIT * Math.PI) * 3;
        put('fl', f1(o * 0.6), (v) => { fl.style.transform = `translateX(${v}px)`; });
        put('nl', f1(o * 1.4), (v) => { nl.style.transform = `translateX(${v}px)`; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // blank card with its own arc until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.cv.style.display = v ? 'none' : ''; });
          const te = Math.min(Math.max(s - GRID_AT, 0), Math.max(LAND[i] - GRID_AT, 0));   // this card's clock stops at its landing
          put(`a${i}`, f1((te * TURN + i * 37) % 360), (v) => { c.ag.setAttribute('transform', `rotate(${v} 5 5)`); });
        });
      },
    };
  },
};
