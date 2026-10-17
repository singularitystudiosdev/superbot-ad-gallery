// Roblox Studio Material Generator (2026): the wait of the docked 'Material Generator' widget in Roblox Studio (desktop, dark theme), from Ivica Milaric's screen recording
// https://www.youtube.com/watch?v=tHzpZDw-1OM (2026-08-20, 1280x720, 30 fps; frames reveal-refs/roblox-material-generator/frames/rbx_t{56.5,57.0,57.25,57.5,58.5,62.0,66.0,70.0,73.5,74.5,77.0}.png
// and rbx_loader_strip_10fps_t60.png, spec .tmp/clone-9e82faf1/reveal-refs/roblox-material-generator/spec.json, confidence 0.62). The whole screen is a game-engine studio window:
// a thin menu bar (File Edit View Plugins Test Window Help), a tab row (Home Avatar UI Script Model Plugins ...), a ribbon of plain glyph buttons over their labels (Select, Move,
// Scale, Rotate, Transform, Part, Terrain ...), a 3D viewport tab 'Test Experience' drawn flat (sky gradient over a grey checkered baseplate in perspective), the Explorer tree on
// the right with its service names verbatim, a Properties pane, the Command Bar line at the foot, and the docked 'Material Generator' panel at the left: the prompt card
// ('dark brown rough wooden surface') with the blue 'Generate' button. The wait lives in that panel only: Generate is replaced by a tiny three-bar loader (one bar lit blue and taller,
// stepping left to right) over four empty dark outlined slots (3 across + 1), with a greyed echo of the prompt below them and no caption anywhere; the tiles then land, the first
// selected with a blue outline, 'Generate' returns and the 'Studs Per Tile 10' / 'Pattern Organic' / 'Name' / 'Base Material None' rows with the blue 'Save' button appear.
// Everything is redrawn in plain boxes and line glyphs; every picture is OUR meme; no player avatars, no account chrome, no baseplate pad or brand mark; system UI face.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT, MONO_FONT } from './util.9e82faf1.js';

const P = 'rv-rbx';
const ROOT_W = 560, ROOT_H = 512;
const MENU_H = 14, TABS_H = 16, RIB_H = 34, BODY_T = MENU_H + TABS_H + RIB_H, CMD_H = 16;   // menu bar, tab row, ribbon, then the body down to the command bar
const BODY_H = ROOT_H - BODY_T - CMD_H;
const DK_W = 220, VP_L = 220, VP_W = 230, EX_L = 450, EX_W = ROOT_W - EX_L, STRIP_H = 14;
const G_L = 8, G_T = 72, T_S = 64, G_G = 3;          // the 3-across grid of square slots inside the dock (3+3+3+1 for ten)
const BLUE = '#4a6cf7', LIT = '#6081e7';
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 10px; background: #181a1e; color: #d4d5d9; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(255, 255, 255, .12); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-mn { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${MENU_H}px; background: #131518; display: flex; gap: 9px; padding-left: 6px; box-sizing: border-box; }
.${P}-mn p { font-size: 6.4px; line-height: ${MENU_H}px; color: #d4d5d9; }
.${P}-tr { position: absolute; left: 0; top: ${MENU_H}px; width: ${ROOT_W}px; height: ${TABS_H}px; background: #181a1e; }
.${P}-tt { position: absolute; left: 7px; top: 0; font-size: 6.6px; line-height: ${TABS_H}px; color: #d4d5d9; }
.${P}-tg { position: absolute; top: 4px; width: 7px; height: 7px; stroke-width: 2; }
.${P}-tb { position: absolute; left: 112px; top: 0; height: ${TABS_H}px; display: flex; }
.${P}-tb p { box-sizing: border-box; height: ${TABS_H}px; padding: 0 5px; font-size: 6.4px; line-height: ${TABS_H}px; color: #b9bbc1; }
.${P}-tb p.${P}-on { background: #2b2d33; color: #ffffff; border-radius: 3px 3px 0 0; }
.${P}-rb { position: absolute; left: 0; top: ${MENU_H + TABS_H}px; width: ${ROOT_W}px; height: ${RIB_H}px; background: #202226; border-top: 1px solid #2b2c31; border-bottom: 1px solid #2b2c31; box-sizing: border-box; }
.${P}-bt { position: absolute; top: 3px; width: 26.5px; height: 28px; text-align: center; }
.${P}-bt svg { display: block; margin: 2px auto 0; width: 13px; height: 13px; stroke: #dcdde1; stroke-width: 1.7; }
.${P}-bt p { margin-top: 3px; font-size: 5.1px; line-height: 6px; color: #d4d5d9; }
.${P}-bt.${P}-dim svg { stroke: #6a6c73; }
.${P}-bt.${P}-dim p { color: #6a6c73; }
.${P}-dk { position: absolute; left: 0; top: ${BODY_T}px; width: ${DK_W}px; height: ${BODY_H}px; background: #202226; border-right: 1px solid #111215; box-sizing: border-box; }
.${P}-dh { position: absolute; left: 0; top: 0; width: ${DK_W - 1}px; text-align: center; font-size: 6.4px; line-height: ${STRIP_H}px; color: #c4c5ca; }
.${P}-di { position: absolute; top: 3px; width: 7px; height: 7px; stroke: #b8bac0; stroke-width: 2.2; }
.${P}-pc { position: absolute; left: 4px; top: 17px; box-sizing: border-box; width: ${DK_W - 9}px; height: 48px; border-radius: 4px; background: #25272c; }
.${P}-pt { position: absolute; left: 4px; top: 5px; font-size: 7px; line-height: 10px; color: #b4b5ba; }
.${P}-gb { position: absolute; left: 164px; top: 29px; box-sizing: border-box; width: 38px; height: 15px; border-radius: 2px; background: ${BLUE}; text-align: center; font-size: 6.6px; line-height: 15px; font-weight: 700; color: #ffffff; }
.${P}-ld { position: absolute; left: 180px; top: 30px; box-sizing: border-box; width: 22px; height: 13px; border-radius: 3px; background: #2a2c31; }
.${P}-lb { position: absolute; bottom: 2px; width: 2.4px; border-radius: 1px; background: #c8c8cc; }
.${P}-gd { position: absolute; left: ${G_L}px; top: ${G_T}px; display: grid; grid-template-columns: repeat(3, ${T_S}px); column-gap: ${G_G}px; row-gap: ${G_G}px; }
.${P}-t { position: relative; width: ${T_S}px; height: ${T_S}px; overflow: hidden; border-radius: 2px; background: #202226; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #202226; }
.${P}-ol { position: absolute; left: 0; right: 0; top: 0; bottom: 0; box-sizing: border-box; border: 1px solid #33353c; border-radius: 2px; }
.${P}-sl { position: absolute; left: 0; right: 0; top: 0; bottom: 0; box-sizing: border-box; border: 1.5px solid ${LIT}; border-radius: 2px; }
.${P}-ec { position: absolute; left: ${G_L}px; top: 212px; box-sizing: border-box; width: ${DK_W - 2 * G_L - 1}px; height: 14px; border-radius: 3px; background: #1a1b1f; font-size: 6.4px; line-height: 14px; color: #565765; padding-left: 5px; }
.${P}-ec svg { position: absolute; right: 4px; top: 4px; width: 6px; height: 6px; stroke: #565765; stroke-width: 2; }
.${P}-pr { position: absolute; left: 0; top: 0; width: ${DK_W - 1}px; height: ${BODY_H}px; }
.${P}-pl { position: absolute; left: 20px; width: 62px; text-align: right; font-size: 6.4px; line-height: 12px; color: #c4c5ca; }
.${P}-fd { position: absolute; left: 90px; box-sizing: border-box; height: 12px; border-radius: 2px; background: #2a2c31; font-size: 6.4px; line-height: 12px; color: #d4d5d9; padding-left: 5px; overflow: hidden; }
.${P}-fd svg { position: absolute; right: 4px; top: 4px; width: 5px; height: 5px; stroke: #c4c5ca; stroke-width: 2.6; }
.${P}-sk { position: absolute; left: 124px; top: 5px; width: 52px; height: 2px; border-radius: 1px; background: #3a3c42; }
.${P}-sk i { position: absolute; left: 0; top: 0; width: 34px; height: 2px; border-radius: 1px; background: #ffffff; }
.${P}-kn { position: absolute; left: 154px; top: 2.5px; width: 7px; height: 7px; border-radius: 50%; background: #ffffff; }
.${P}-ck { position: absolute; left: 90px; top: 2px; box-sizing: border-box; width: 8px; height: 8px; border-radius: 2px; border: 1px solid #5a5c63; background: #181a1e; }
.${P}-sv { position: absolute; left: 50px; top: 0; box-sizing: border-box; width: 100px; height: 14px; border-radius: 2px; background: #2f55f0; text-align: center; font-size: 6.6px; line-height: 14px; font-weight: 700; color: #ffffff; }
.${P}-vp { position: absolute; left: ${VP_L}px; top: ${BODY_T + STRIP_H}px; width: ${VP_W}px; height: ${BODY_H - STRIP_H}px; overflow: hidden; background: linear-gradient(180deg, #7fc3e6 0%, #b4dbee 24%, #d0e6f1 29%, #8b97ad 29.2%, #7b87a1 100%); }
.${P}-vp svg { position: absolute; left: 0; top: 0; }
.${P}-fg { position: absolute; left: 0; width: ${VP_W}px; top: ${Math.round((BODY_H - STRIP_H) * 0.29)}px; height: 34px; background: linear-gradient(180deg, rgba(203, 226, 238, .9), rgba(203, 226, 238, 0)); }
.${P}-vs { position: absolute; left: ${VP_L}px; top: ${BODY_T}px; width: ${VP_W}px; height: ${STRIP_H}px; background: #181a1e; }
.${P}-vs p { position: absolute; top: 0; height: ${STRIP_H}px; box-sizing: border-box; padding: 0 7px; font-size: 6.2px; line-height: ${STRIP_H}px; color: #b9bbc1; }
.${P}-vs p.${P}-on { background: #25272c; color: #ffffff; }
.${P}-ex { position: absolute; left: ${EX_L}px; top: ${BODY_T}px; width: ${EX_W}px; height: ${BODY_H}px; background: #202226; border-left: 1px solid #111215; box-sizing: border-box; }
.${P}-eh { position: absolute; left: 0; width: ${EX_W - 1}px; text-align: center; font-size: 6.2px; line-height: ${STRIP_H}px; color: #c4c5ca; }
.${P}-es { position: absolute; left: 4px; top: 16px; box-sizing: border-box; width: ${EX_W - 9}px; height: 11px; border-radius: 2px; background: #2a2c31; font-size: 5.8px; line-height: 11px; color: #c4c5ca; padding-left: 4px; }
.${P}-er { position: absolute; left: 0; height: 9.5px; width: ${EX_W - 1}px; }
.${P}-er p { position: absolute; top: 0; font-size: 5.6px; line-height: 9.5px; color: #dcdde1; }
.${P}-er i { position: absolute; top: 2.5px; width: 4.5px; height: 4.5px; border-radius: 1px; }
.${P}-er svg { position: absolute; top: 3px; width: 4px; height: 4px; stroke: #8a8c93; stroke-width: 3; }
.${P}-pf { position: absolute; left: 4px; top: 297px; box-sizing: border-box; width: ${EX_W - 9}px; height: 11px; border-radius: 2px; background: #2a2c31; font-size: 5.4px; line-height: 11px; color: #8a8c93; padding-left: 4px; }
.${P}-cb { position: absolute; left: 0; top: ${ROOT_H - CMD_H}px; width: ${ROOT_W}px; height: ${CMD_H}px; background: #181a1e; border-top: 1px solid #2b2c31; box-sizing: border-box; }
.${P}-cb p { position: absolute; top: 0; line-height: ${CMD_H - 1}px; }
.${P}-cm { left: 9px; font-family: ${MONO_FONT}; font-size: 6.2px; color: #5b5d65; }
.${P}-rn { right: 8px; font-size: 6.2px; color: #b9bbc1; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const LAND0 = 1.40, STEP = 1 / 30;                 // the first tile lands at 1.40 layout s, the other nine one frame step apart (reading order), the last at 1.70
const LAND = Array.from({ length: 10 }, (_, i) => LAND0 + i * STEP);
const LSTEP = 0.17;                                // layout seconds per loader step (the lit bar moves left, centre, right, then repeats)
const PROMPT = 'dark brown rough wooden surface';

const ICON = {
  select: '<path d="M6 4l12 7-5 1.5L10.5 18z"/>',
  move: '<path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>',
  scale: '<rect x="4" y="9" width="11" height="11" rx="1"/><path d="M10 14l9-9M13 5h6v6"/>',
  rotate: '<path d="M19 12a7 7 0 1 1-2.4-5.3M19 4v4.5h-4.5"/>',
  transform: '<path d="M5 5h14v14H5zM5 5l14 14M19 5L5 19"/>',
  part: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12v9M12 12L4 7.5M12 12l8-4.5"/>',
  terrain: '<path d="M2.5 19l6-10 4 6 3-4 6 8z"/>',
  character: '<circle cx="12" cy="7" r="3"/><path d="M12 10v6M7 12.5l5-1.5 5 1.5M12 16l-3.5 5M12 16l3.5 5"/>',
  gui: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 9.5h17M7 7.2v.1"/>',
  script: '<path d="M7 3.5h8l4 4V20.5H7zM15 3.5v4h4M10 12h6M10 15.5h6"/>',
  imp: '<path d="M4 8l8-4 8 4v8l-8 4-8-4zM12 8v8M9 13l3 3 3-3"/>',
  material: '<circle cx="12" cy="12" r="8"/><path d="M6.5 8.5c4 1 7 4 8.5 9"/>',
  color: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>',
  group: '<rect x="4" y="4" width="16" height="16" rx="1.5" stroke-dasharray="3 2.5"/><rect x="9" y="9" width="6" height="6"/>',
  lock: '<rect x="5.5" y="11" width="13" height="9" rx="1.5"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>',
  anchor: '<circle cx="12" cy="5.5" r="2"/><path d="M12 7.5V20M7 11.5h10M5 14c0 3.4 3 6 7 6s7-2.6 7-6"/>',
  explorer: '<path d="M5 5h14M5 10h14M5 15h9M5 20h9M8 5v15"/>',
  props: '<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="1.8" fill="#202226"/><circle cx="15" cy="12" r="1.8" fill="#202226"/><circle cx="8" cy="17" r="1.8" fill="#202226"/>',
  toolbox: '<rect x="3.5" y="8" width="17" height="12" rx="1.5"/><path d="M9 8V5.5h6V8M3.5 13.5h17"/>',
  assets: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  undock: '<path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/>',
  copy: '<rect x="8" y="8" width="11" height="11" rx="1.5"/><path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15"/>',
  tri: '<path d="M8 5l9 7-9 7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  sq: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
};
const SVG = (cls, body, style) => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="0 0 24 24">${body}</svg>`;

const MENU = ['File', 'Edit', 'View', 'Plugins', 'Test', 'Window', 'Help'];
const TABS = ['Home', 'Avatar', 'UI', 'Script', 'Model', 'Plugins', 'Untitled', 'Testing', 'New Tab...', 'Untitled'];
const RIBBON = [
  ['Select', 'select'], ['Move', 'move'], ['Scale', 'scale'], ['Rotate', 'rotate'], ['Transform', 'transform'], ['Part', 'part'], ['Terrain', 'terrain'], ['Character', 'character'],
  ['GUI', 'gui'], ['Script', 'script'], ['Import', 'imp'], ['Material', 'material'], ['Color', 'color', 1], ['Group', 'group', 1], ['Lock', 'lock', 1], ['Anchor', 'anchor', 1],
  ['Explorer', 'explorer'], ['Properties', 'props'], ['Toolbox', 'toolbox'], ['Assets', 'assets'],
];
const TREE = [   // [indent, label, swatch colour, expandable]
  [0, 'Workspace', '#4aa3e8', 1], [1, 'Camera', '#c9cbd0', 0], [1, 'Terrain', '#4fb87a', 0], [1, 'SpawnLocation', '#c9cbd0', 1], [1, 'Baseplate', '#c9cbd0', 1], [0, 'Players', '#4aa3e8', 0], [0, 'Lighting', '#e8c24a', 0],
  [0, 'MaterialService', '#4aa3e8', 0], [0, 'NetworkClient', '#c9cbd0', 0], [0, 'ReplicatedFirst', '#c9cbd0', 0], [0, 'ReplicatedStorage', '#c9cbd0', 0], [0, 'ServerScriptService', '#4fb87a', 1], [0, 'ServerStorage', '#c9cbd0', 0],
  [0, 'StarterGui', '#e8c24a', 0], [0, 'StarterPack', '#e8c24a', 0], [0, 'StarterPlayer', '#e8c24a', 1], [0, 'Teams', '#c9cbd0', 1], [0, 'SoundService', '#4aa3e8', 0], [0, 'TextChatService', '#4aa3e8', 1],
];

// the flat 3D viewport: a grey checker baseplate receding to a horizon, drawn once as two static paths (nothing here moves)
function baseplate() {
  const W = VP_W, H = BODY_H - STRIP_H, Y0 = Math.round(H * 0.29), CX = W / 2, NEAR = H - Y0, S = 100, DD = 0.14, ROWS = 56, COLS = 12;
  const f = (n) => (Math.round(n * 10) / 10).toString();
  const pt = (u, d) => `${f(CX + (u * S) / d)},${f(Y0 + NEAR / d)}`;
  let a = '', b = '';
  for (let k = 0; k < ROWS; k++) {
    const d0 = 1 + k * DD, d1 = 1 + (k + 1) * DD;
    for (let u = -COLS; u < COLS; u++) {
      const cell = `M${pt(u, d0)}L${pt(u + 1, d0)}L${pt(u + 1, d1)}L${pt(u, d1)}Z`;
      if ((u + k) % 2 === 0) a += cell; else b += cell;
    }
  }
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><path d="${a}" fill="#808ca5"/><path d="${b}" fill="#75819b"/></svg>`;
}

export default {
  id: 'roblox-material-generator',
  label: 'Roblox Studio Material Generator (2026)',
  source: {
    platform: "Roblox Studio (desktop, dark theme) 2026: the dockable 'Material Generator' widget docked at the left of a Studio window beside the 3D viewport tab 'Test Experience', with the Explorer and Properties panels on the right and the Command Bar at the foot; third-party creator screen recording at 1280x720, 30 fps",
    feature: "Text to PBR material: a one-line prompt is typed at the top of the widget and the blue 'Generate' button pressed; the button is replaced by a three-bar loader (one bar lit blue at a time, stepping left to right) and four empty dark outlined slots (3 across + 1) appear at once with a greyed echo of the prompt below them and no caption; about 16 s later all four material tiles land in one frame, the first selected with a blue outline, 'Generate' returns and the 'Studs Per Tile', 'Pattern', 'Name' and 'Base Material' rows with a blue 'Save' button appear",
    capture: {
      url: 'https://www.youtube.com/watch?v=tHzpZDw-1OM',
      page: 'https://www.youtube.com/watch?v=tHzpZDw-1OM',
      date: '2026-08-20',
      retrieved: '2026-10-17',
      timestamps: "t = 56.5-57.25 s the prompt 'dark brown rough wooden surface' typed, the blue 'Generate' button idle then pressed (rbx_t56.5, rbx_t57.0, rbx_t57.25); t = 57.5-74.0 s PENDING, uncut, ~16.5 s: the button is a three-bar loader (a blue-lit bar travels left to right across three small grey bars, ~1.2 s per pass, rbx_loader_strip_10fps_t60) over four empty outlined slots and the greyed prompt echo (rbx_t57.5, rbx_t58.5, rbx_t62.0, rbx_t66.0, rbx_t70.0, rbx_t73.5); t = 74.0 s (between rbx_t73.5 and rbx_t74.5) all four tiles appear at once, the first outlined blue; t = 75-77 s settled with 'Generate' back, 'Studs Per Tile 10', 'Pattern Organic', 'Name', 'Base Material None' and 'Save' (rbx_t74.5, rbx_t77.0). Corroboration: https://www.youtube.com/watch?v=0mdYrDKlTkI (2026-04-22), a regeneration, six slots, pending ~64-76.5 s",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=tHzpZDw-1OM', published: '2026-08-20', retrieved: '2026-10-17', note: 'Quick Guide for Using AI to Generate Textures in Roblox Studio (Ivica Milaric)' },
      { url: 'https://www.youtube.com/watch?v=0mdYrDKlTkI', published: '2026-04-22', retrieved: '2026-10-17', note: 'How to Use the Material Generator in Roblox Studio (Ivica Milaric), corroboration' },
    ],
    extrapolated: [
      "the landing count: the footage lands FOUR tiles (3 across + 1) in one frame; here ten square tiles sit in the same 3-across flow (3 + 3 + 3 + 1) and the six slots beyond the footage's four appear with the picture they hold, the first four slots showing outlined and empty while pending exactly as in the footage",
      "the landing order: the footage lands every tile in a single frame; here the ten pictures land one frame step (1/30 of a layout second) apart in strict reading order, the loader going and 'Generate' returning with the first, the first tile outlined blue",
      "the landing swap: each outlined empty slot becomes its picture in a hard cut, no fade, as in the footage",
      "the pace: the footage waits ~16.5 s; the beat plays it in the same ~1.8 s window every module of this family uses, the loader taking one step per 0.17 layout seconds (the footage steps about every 0.4 s, 10 fps strip)",
      "the loader: three bars, the lit one blue and taller, stepping left, centre, right and repeating, its state a pure function of t; the footage's bar easing and heights were read at 4x zoom off a 10 fps strip, not measured natively",
      "the sizes and the page's scale: the footage's slots are ~85 px in a 355 px dock of a 1280 px frame; here the window is redrawn at 560 px wide with a 220 px dock and 64 px tiles so ten fit with no scroll (chrome redrawn, not scaled copies), the baseplate and its checker redrawn flat as static shapes",
      "the large preview: the footage opens the selected tile as a big tiled preview under the grid; it is omitted here (a second picture would be an extra image beyond the ten tiles), the selection outline and the property rows and 'Save' stay as in the landed frame",
      "omitted from the footage: the player-avatar and account icons top right, the baseplate's sunburst pad, the viewport navigation cube, the document-tab and play-control icons beyond plain glyphs, the creator's mouse pointer, the Properties pane's contents",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'roblox-material-generator');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div><div class="${P}-ol"></div>${i === 0 ? `<div class="${P}-sl"></div>` : ''}</div>`;
    const ribbon = RIBBON.map(([name, ic, dim], i) => `<div class="${P}-bt${dim ? ` ${P}-dim` : ''}" style="left: ${8 + i * 26.5}px">${SVG('', ICON[ic])}<p>${name}</p></div>`).join('');
    const tree = TREE.map(([ind, name, col, exp], i) => `<div class="${P}-er" style="top: ${32 + i * 9.5}px">${exp ? SVG('', ICON.chev, `left: ${3 + ind * 7}px`) : ''}<i style="left: ${9 + ind * 7}px; background: ${col}"></i><p style="left: ${16 + ind * 7}px">${name}</p></div>`).join('');
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-mn">${MENU.map((m) => `<p>${m}</p>`).join('')}</div>`
      + `<div class="${P}-tr"><p class="${P}-tt">Test</p>${SVG(`${P}-tg`, ICON.tri, `left: 36px; fill: #4a8cf5; stroke: #4a8cf5`)}${SVG(`${P}-tg`, ICON.pause, 'left: 46px; stroke: #8a8c93')}${SVG(`${P}-tg`, ICON.sq, 'left: 56px; fill: #e5484d; stroke: #e5484d')}`
      + `<div class="${P}-tb">${TABS.map((n, i) => `<p${i === 0 ? ` class="${P}-on"` : ''}>${n}</p>`).join('')}</div></div>`
      + `<div class="${P}-rb">${ribbon}</div>`
      + `<div class="${P}-dk">`
      + `<p class="${P}-dh">Material Generator</p>${SVG(`${P}-di`, ICON.undock, 'right: 17px')}${SVG(`${P}-di`, ICON.x, 'right: 6px')}`
      + `<div class="${P}-pc"><p class="${P}-pt">${PROMPT}</p>`
      + `<p class="${P}-gb">Generate</p>`
      + `<div class="${P}-ld"><i class="${P}-lb" style="left: 5px"></i><i class="${P}-lb" style="left: 9.8px"></i><i class="${P}-lb" style="left: 14.6px"></i></div></div>`
      + `<div class="${P}-gd">${tiles.map(cell).join('')}</div>`
      + `<p class="${P}-ec">${PROMPT}${SVG('', ICON.copy)}</p>`
      + `<div class="${P}-pr">`
      + `<p class="${P}-pl" style="top: 344px">Studs Per Tile</p><div class="${P}-fd" style="top: 344px; width: 28px">10</div><div class="${P}-sk" style="top: 344px"><i></i></div><div class="${P}-kn" style="top: 344px"></div>`
      + `<p class="${P}-pl" style="top: 359px">Pattern</p><div class="${P}-ck" style="top: 360px"></div><p class="${P}-pl" style="top: 359px; left: 102px; width: auto; text-align: left">Organic</p>`
      + `<p class="${P}-pl" style="top: 374px">Name</p><div class="${P}-fd" style="top: 374px; width: 100px">DarkBrownRoughWood</div>`
      + `<p class="${P}-pl" style="top: 389px">Base Material</p><div class="${P}-fd" style="top: 389px; width: 100px">None${SVG('', ICON.chev)}</div>`
      + `<p class="${P}-sv" style="top: 411px">Save</p>`
      + `</div>`
      + `</div>`
      + `<div class="${P}-vs"><p class="${P}-on" style="left: 0">Test Experience</p><p style="left: 62px">Trail</p></div>`
      + `<div class="${P}-vp">${baseplate()}<div class="${P}-fg"></div></div>`
      + `<div class="${P}-ex"><p class="${P}-eh" style="top: 0">Explorer</p><p class="${P}-es">Search</p>${tree}`
      + `<p class="${P}-eh" style="top: 281px">Properties</p><p class="${P}-pf">Filter Properties (Ctrl+Shift+P)</p></div>`
      + `<div class="${P}-cb"><p class="${P}-cm">Execute a command with Ctrl↵ or use Ctrl+Up/Down for history</p><p class="${P}-rn">Run</p></div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const gb = q('gb'), ld = q('ld'), ec = q('ec'), pr = q('pr'), sl = q('sl');
    const bars = [...ld.querySelectorAll(`.${P}-lb`)];
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), ol: n.querySelector(`.${P}-ol`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const landed = s >= LAND[0];                   // the loader goes and 'Generate' returns with the first picture
        const lit = Math.floor(s / LSTEP) % 3;         // the lit bar while the loader shows, a pure function of s

        put('gen', landed, (v) => { gb.style.visibility = v ? '' : 'hidden'; ld.style.visibility = v ? 'hidden' : ''; ec.style.visibility = v ? 'hidden' : ''; pr.style.visibility = v ? '' : 'hidden'; sl.style.visibility = v ? '' : 'hidden'; });
        bars.forEach((b, i) => {
          const on = landed ? 0 : i === lit ? 1 : 2;   // 0: loader hidden (idle grey), 1: the lit bar, 2: a grey bar
          put(`b${i}`, on, (v) => { b.style.height = v === 1 ? '9px' : '6px'; b.style.background = v === 1 ? LIT : '#c8c8cc'; });
        });

        cells.forEach((c, i) => {
          // 0: no slot yet (slots beyond the footage's four), 1: an empty outlined slot, 2: the picture
          const state = s >= LAND[i] ? 2 : i < 4 ? 1 : 0;
          put(`i${i}`, state, (v) => {
            c.im.style.visibility = v === 2 ? '' : 'hidden';
            c.cv.style.display = v === 2 ? 'none' : '';
            c.ol.style.visibility = v === 1 ? '' : 'hidden';
          });
        });
      },
    };
  },
};
