// AI Roguelite (v3.41, 2024): the wait and reveal of a game screen's generated art, from a third-party uncut 720p play-through
// https://www.youtube.com/watch?v=oopha0tDrIo (Video game viewer, 2024-11-01, one uncut capture: the play screen opens at t=342 s with a grey 'Consulting the AI...' box, the box goes at t=410 s, item, character and zone cards
// fill in behind ring spinners t=410-440 s, a big grey ring sits over the location picture t=446 s, the location picture lands blurred with a blue ring at t=449 s and is sharp by t=452 s), stills
// reveal-refs/ai-roguelite-ingame/frames/airog_{t343,t360,t408,t418,t428,t440,t446,t449.5,t452,t480}.png, spec .tmp/clone-9e82faf1/reveal-refs/ai-roguelite-ingame/spec.json, confidence 0.7. The surface is a dark RPG
// game board in a 2 x 2 arrangement: the stats card and the inventory panel at left, the location picture on top and a dark-blue story pane below at right, a bar of icon buttons and a text input along the bottom. First a grey
// 'Consulting the AI...' box sits over the dimmed board while the story text prints behind it; then the box goes, cards fill in one by one behind ring spinners and a big grey ring covers the location placeholder (a static
// swirl of blue and teal); last the location picture lands blurred under a blue ring and sharpens. Here the board is flat dark panels with plain frames and glyphs (no game art, no icons of the game), the story wording is our
// own, and the location picture is the ten Muse memes as a 5 x 2 sheet of tiles, each a blue swirl placeholder that lands blurred under a ring in strict reading order and sharpens.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-arl';
const ROOT_W = 560, ROOT_H = 500;
const LC_L = 8, LC_W = 156;                                                   // left column
const RC_L = 172, RC_W = 380;                                                 // right column
const TW = 68, TH = 80, TG = 3;                                               // a tile; 5 * 68 + 4 * 3 = 352, 2 * 80 + 3 = 163
const GD_L = (RC_W - (5 * TW + 4 * TG)) / 2, GD_T = 28;
const LOC_H = 217;                                                            // the location panel
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #0a0f1d; color: #e8ebf5; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(10, 14, 28, .6); }
.${P} p, .${P} span { margin: 0; }
.${P} p { white-space: nowrap; }
.${P} svg { display: block; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
.${P}-pn { position: absolute; box-sizing: border-box; border: 2px solid #5a4630; box-shadow: inset 0 0 0 1px #b08d45, 0 0 0 1px #151008; overflow: hidden; }
.${P}-st { left: ${LC_L}px; top: 8px; width: ${LC_W}px; height: 132px; background: linear-gradient(180deg, #2a2118, #1d1812); }
.${P}-pt { position: absolute; left: 5px; top: 5px; box-sizing: border-box; width: 50px; height: 62px; background: #a5afd3; border: 1px solid #6c7599; color: #8189ad; }
.${P}-pt svg { position: absolute; left: 11px; top: 13px; width: 28px; height: 36px; stroke-width: 1.8; }
.${P}-lv { position: absolute; left: 5px; top: 70px; width: 146px; height: 13px; line-height: 13px; font-size: 9px; text-align: center; background: #2f2f4a; color: #cfd4ea; }
.${P}-br { position: absolute; left: 61px; width: 54px; height: 8px; box-sizing: border-box; border: 1px solid #0d0b09; }
.${P}-bt { position: absolute; left: 118px; width: 34px; height: 10px; font-size: 8px; line-height: 10px; color: #d6d2c6; }
.${P}-gs { position: absolute; top: 90px; box-sizing: border-box; width: 34px; height: 34px; border-radius: 6px; background: #231d28; border: 1px solid #3a3040; color: #51485a; }
.${P}-gs svg { position: absolute; left: 7px; top: 5px; width: 18px; height: 22px; stroke-width: 1.8; }
.${P}-iv { left: ${LC_L}px; top: 146px; width: ${LC_W}px; height: 294px; background: linear-gradient(180deg, #1f2e3a 0%, #2d4a3a 38%, #35593a 70%, #2a4630 100%); }
.${P}-vl { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: rgba(30, 36, 70, .28); }
.${P}-cd { position: absolute; box-sizing: border-box; background: #2b2230; border: 1px solid #5a4630; overflow: hidden; color: #d9c79a; }
.${P}-cd svg.${P}-gl { position: absolute; left: 50%; top: 5px; stroke-width: 1.8; }
.${P}-cl { position: absolute; left: 0; right: 0; bottom: 2px; text-align: center; font-size: 8px; line-height: 10px; color: #f0e8d4; }
.${P}-cd svg.${P}-rg, .${P}-t svg.${P}-rg, .${P}-bg svg.${P}-rg { position: absolute; left: 50%; top: 50%; }
.${P}-g1 { width: 24px; height: 24px; margin-left: -12px; top: 6px; }
.${P}-g2 { width: 34px; height: 34px; margin-left: -17px; top: 10px; }
.${P}-r22 { margin: -11px 0 0 -11px; }
.${P}-r24 { margin: -12px 0 0 -12px; }
.${P}-r44 { margin: -22px 0 0 -22px; }
.${P}-ra { stroke: #3a8fd8; }
.${P}-rb { stroke: rgba(190, 196, 208, .55); }
.${P}-rc { stroke: #9ea3ae; }
.${P}-sp { position: absolute; left: 12px; top: 232px; box-sizing: border-box; width: 26px; height: 26px; background: #bda06a; border: 1px solid #6d5a36; color: #4b3b20; }
.${P}-sp svg { margin: 4px; width: 16px; height: 16px; stroke-width: 2; }
.${P}-bb { position: absolute; left: ${LC_L}px; top: 446px; width: ${LC_W}px; height: 46px; display: flex; align-items: center; justify-content: space-between; padding: 0 5px; box-sizing: border-box; background: #1d1812; border: 2px solid #5a4630; box-shadow: inset 0 0 0 1px #b08d45; }
.${P}-bn { box-sizing: border-box; width: 24px; height: 24px; background: #bda06a; border: 1px solid #6d5a36; color: #4b3b20; }
.${P}-bn svg { margin: 3px; width: 16px; height: 16px; stroke-width: 2; }
.${P}-lc { left: ${RC_L}px; top: 8px; width: ${RC_W}px; height: ${LOC_H}px; background: radial-gradient(circle at 20% 30%, rgba(36, 200, 180, .35), rgba(36, 200, 180, 0) 40%), radial-gradient(circle at 78% 70%, rgba(70, 110, 255, .45), rgba(70, 110, 255, 0) 45%), linear-gradient(140deg, #1e2f78, #32515c 55%, #1a2a66); }
.${P}-lb { position: absolute; left: 0; top: 0; width: 100%; height: 19px; line-height: 19px; text-align: center; font-size: 10px; letter-spacing: .3px; background: rgba(56, 56, 83, .85); color: #dfe3f4; }
.${P}-lv2 { position: absolute; right: 0; bottom: 0; width: 120px; height: 19px; line-height: 19px; text-align: center; font-size: 10px; background: #4c5413; color: #e4e9b8; }
.${P}-gd { position: absolute; left: ${GD_L}px; top: ${GD_T}px; display: grid; grid-template-columns: repeat(5, ${TW}px); grid-template-rows: repeat(2, ${TH}px); gap: ${TG}px; }
.${P}-t { position: relative; box-sizing: border-box; width: ${TW}px; height: ${TH}px; border-radius: 2px; background: #1a2236; overflow: hidden; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: radial-gradient(circle at 28% 26%, rgba(36, 200, 180, .6) 0, rgba(36, 200, 180, 0) 34%), radial-gradient(circle at 74% 68%, rgba(90, 130, 255, .65) 0, rgba(90, 130, 255, 0) 42%), radial-gradient(circle at 70% 20%, rgba(20, 30, 110, .8) 0, rgba(20, 30, 110, 0) 40%), linear-gradient(140deg, #1e2f78, #32515c 55%, #1a2a66); }
.${P}-bg { position: absolute; left: ${GD_L + 176 - 22}px; top: ${GD_T + 81 - 22}px; width: 44px; height: 44px; }
.${P}-sy { left: ${RC_L}px; top: 233px; width: ${RC_W}px; height: 259px; background: #000d29; }
.${P}-rk { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: linear-gradient(115deg, rgba(20, 40, 110, .0) 0%, rgba(20, 40, 110, .45) 12%, rgba(5, 15, 50, .0) 22%, rgba(20, 40, 110, .4) 38%, rgba(5, 15, 50, 0) 50%, rgba(20, 40, 110, .45) 66%, rgba(5, 15, 50, 0) 78%, rgba(20, 40, 110, .4) 90%, rgba(5, 15, 50, 0) 100%); }
.${P}-tx { position: absolute; left: 14px; right: 14px; top: 12px; font-size: 11px; line-height: 15px; color: #d6dcf0; }
.${P}-tx p { white-space: normal; }
.${P}-tx p.${P}-h1, .${P}-tx p.${P}-h3 { font-style: italic; color: #d9bd7a; }
.${P}-tx p.${P}-pa { margin: 6px 0; }
.${P}-th { visibility: hidden; }
.${P}-br2 { position: absolute; left: 154px; top: 100px; width: 72px; height: 62px; color: #8a63a8; }
.${P}-br2 svg { width: 72px; height: 62px; stroke-width: 1.6; }
.${P}-in { position: absolute; left: 8px; right: 8px; bottom: 6px; height: 18px; display: flex; gap: 6px; }
.${P}-sl { flex: none; box-sizing: border-box; width: 82px; height: 18px; padding: 0 6px; line-height: 17px; font-size: 9px; background: #e4e8f6; color: #2a3050; border: 1px solid #5a4630; }
.${P}-ip { flex: 1; box-sizing: border-box; height: 18px; padding: 0 6px; line-height: 17px; font-size: 9px; background: #b9c3e7; color: #6c7599; font-style: italic; border: 1px solid #5a4630; }
.${P}-sd { flex: none; box-sizing: border-box; width: 18px; height: 18px; background: #2f6fb8; color: #ffffff; border: 1px solid #1d4a80; }
.${P}-sd svg { margin: 3px; width: 10px; height: 10px; stroke-width: 2.4; }
.${P}-dm { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; background: rgba(24, 30, 66, .5); }
.${P}-cb { position: absolute; left: ${(ROOT_W - 200) / 2}px; top: ${(ROOT_H - 70) / 2}px; box-sizing: border-box; width: 200px; height: 70px; background: #828794; border: 1px solid #c7ccd8; box-shadow: 0 2px 6px rgba(0, 0, 0, .35); text-align: center; font-size: 13px; line-height: 68px; color: #ffffff; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const BOX_END = 0.58;                              // layout seconds: the 'Consulting the AI...' box over the dimmed board, then it goes
const TY0 = 0.14, TY1 = 0.52;                      // ... the story text prints behind the box
const FILL = [0.7, 0.82, 0.94, 1.06, 1.18];       // ... each card's ring turns into its picture, one after another
const WAIT_END = 1.28;                             // ... the big grey ring over the location placeholder goes; the sheet starts to land
const BL = 0.18;                                   // one tile's blur-to-sharp, layout seconds
const DIS = 0.08;                                  // ... of which the placeholder cover dissolves (a cover's opacity)
const LAND0 = 1.3;
const LAND = Array.from({ length: 10 }, (_, i) => LAND0 + i * ((1.78 - BL - LAND0) / 9));   // tile i starts to land (strict reading order), the last is sharp at 1.78
const BLUR0 = 9;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// our own wording, never the footage's
const TEXTS = ['New area: the Muse Gallery', 'Lantern light spills down a long hall. Ten muse memes hang side by side on the walls, each one waiting to be seen. Somewhere a clock ticks. Step closer and look.', 'New quest: "Ten Frames" - look at every meme in the gallery.'];
const OFF = [0, TEXTS[0].length, TEXTS[0].length + TEXTS[1].length];
const TOTAL = OFF[2] + TEXTS[2].length;

const ICONS = {
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 22c0-5 3.5-8 8-8s8 3 8 8"/>',
  key: '<circle cx="8" cy="12" r="4.5"/><path d="M12.5 12H22M18 12v4M21 12v3"/>',
  lamp: '<path d="M9 3h6M12 3v3M7 9c0-2 2-3 5-3s5 1 5 3l1 9H6zM9 21h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  cog: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  book: '<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z M12 6v14"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>',
  chest: '<path d="M3 10h18v10H3zM3 10c0-4 3-6 9-6s9 2 9 6M12 13v3"/>',
  glass: '<circle cx="10" cy="10" r="6"/><path d="M15 15l6 6"/>',
  star: '<path d="M12 3l2.4 6.2 6.6.5-5 4.3 1.6 6.4L12 17l-5.6 3.4L8 14 3 9.7l6.6-.5z"/>',
  send: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  brain: '<path d="M12 4v16M12 6c-3-3-8-1-7 3-3 1-2 5 1 5-1 3 2 6 6 4M12 6c3-3 8-1 7 3 3 1 2 5-1 5 1 3-2 6-6 4M8 9c1 0 2 1 2 2M16 9c-1 0-2 1-2 2"/>',
};
const icon = (k, vb = '0 0 24 24') => `<svg viewBox="${vb}">${ICONS[k]}</svg>`;
const ring = (cls, size, arc) => `<svg class="${P}-rg ${P}-r${size} ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" style="visibility: hidden;"><circle class="${P}-rb" cx="12" cy="12" r="9" stroke-width="3"/><path class="${arc}" d="M12 3a9 9 0 0 1 9 9" stroke-width="3"/></svg>`;

// the cards: three items and two characters, plain glyphs and our own labels
const CARDS = [
  { x: 6, y: 6, w: 44, h: 56, g: 'key', n: 'Brass key' },
  { x: 56, y: 6, w: 44, h: 56, g: 'lamp', n: 'Lantern' },
  { x: 106, y: 6, w: 44, h: 56, g: 'clock', n: 'Old clock' },
  { x: 6, y: 70, w: 69, h: 70, g: 'person', n: 'Curator' },
  { x: 81, y: 70, w: 69, h: 70, g: 'person', n: 'Guide' },
];
const BARS = [['#a62a2a', 6], ['#2a5fb0', 20], ['#2a9a58', 34], ['#a58a3a', 48]];
const BUTTONS = ['cog', 'book', 'map', 'chest', 'glass'];

export default {
  id: 'ai-roguelite-ingame',
  label: 'AI Roguelite in-game art (2024)',
  source: {
    platform: "a PC indie text-RPG (AI Roguelite v3.41) with live image generation, 1280 x 720 gameplay capture by a third-party channel; the surface is the game's main play screen, a 2 x 2 board of framed panels",
    feature: "after the game starts the play screen shows empty panels under a grey 'Consulting the AI...' box while the story text is written; then the box goes and item, character and zone cards each fill in behind a ring spinner, one after another; a big grey ring sits over the location placeholder (a static swirl of blue and teal), and last the location picture lands blurred under a blue ring and sharpens within about three seconds",
    capture: {
      url: 'https://www.youtube.com/watch?v=oopha0tDrIo',
      page: 'https://www.youtube.com/watch?v=oopha0tDrIo',
      date: '2024-11-01',
      retrieved: '2026-10-17',
      timestamps: "t = 340 s character-creation screen; t = 342.0 s hard switch to the play screen: the grey 'Consulting the AI...' box over empty panels, 'Area Name:' and 'Zone #' labels (airog_t343); t = 343-410 s the same box, a mauve brain glyph pulsing in the story pane, the story text appearing behind the box around t = 390 s (airog_t360, airog_t408); t = 410 s the box is gone, the story text is complete; t = 418-440 s item, character and zone cards fill in behind ring spinners (airog_t418, airog_t428, airog_t440); t = 446 s a big grey ring over the still-placeholder location picture (airog_t446); t = 449.0 s the location picture lands blurred under a blue ring (airog_t449.5); t = 452 s sharp (airog_t452); t = 480 s settled (airog_t480); uncut, 107 s from the game start to the last picture",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=oopha0tDrIo', published: '2024-11-01', retrieved: '2026-10-17', note: "Video game viewer, 'AI Roguelite Gameplay | An odd Gem of an RPG?' (third-party, 2009 s); the only source of the wait, section t = 335-485 s, one uncut capture" },
    ],
    extrapolated: [
      "the 10-up: the footage lands ONE location picture in the upper-right panel; here that panel holds the ten Muse memes as a 5 x 2 sheet of tiles, each a blue swirl placeholder (a cover) that dissolves into its picture blurred under a small blue ring and sharpens, in strict reading order; the footage's panel label ('Old Jennings manor') and 'Area Level: 1' bar are kept as our own 'Muse Gallery' and 'Area Level: 1'",
      "the cards: the footage fills three item cards, two character cards and three zone cards; here five cards (three items, two characters) fill one after another behind a grey ring with a blue arc, as plain glyphs on flat dark cards with our own labels; the zone strip is not drawn, the meadow painting behind the inventory is a flat green gradient under a blue veil",
      "the game art: every picture of the footage (portrait, meadow, road, manor, item and character art, wood and parchment frames, the game's icons) is not reproduced; the board is flat dark panels with a plain brown frame and a gold hairline, plain stroke glyphs and flat bars",
      "the story: the footage's story text (a haunted manor) is replaced by our own short text about a gallery of ten muse memes; it prints behind the grey box during the wait as pure function of t (the footage prints it around t = 390 s)",
      "the pace: the footage waits ~68 s on the grey box and ~39 s on the cards and the location picture; the beat plays box -> cards behind rings -> blurred-to-sharp landing in the ~1.8 s window every module of this family uses; the footage's pulsing mauve brain glyph is drawn as a small glyph pulsing behind the box",
      "the blur: the footage's landing blur (about 12 px) is read off one still (airog_t449.5); here each tile starts at 9 px and sharpens over ~0.18 layout seconds, so the last tile is sharp at the end of the beat",
      "omitted from the footage: the hammer tile, the party silhouettes' stat icons, the hover cards, the zone arrows and padlocks, the player's portrait art, and any brand mark",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'ai-roguelite-ingame');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv" style="transform-origin: ${g.origin}; transform: ${g.zoom === 1 ? 'none' : `scale(${(1 / g.zoom).toFixed(5)})`}"></div></div>${ring(`${P}-tr`, 24, `${P}-ra`)}</div>`;
    const card = (c) => { const big = c.h > 60; return `<div class="${P}-cd ${P}-ci" style="left: ${c.x}px; top: ${c.y}px; width: ${c.w}px; height: ${c.h}px;"><svg class="${P}-gl ${P}-${big ? 'g2' : 'g1'}" viewBox="0 0 24 24" style="visibility: hidden;">${ICONS[c.g]}</svg><p class="${P}-cl" style="visibility: hidden;">${c.n}</p>${ring(`${P}-cr`, 22, `${P}-ra`)}</div>`; };
    const bars = BARS.map(([col, y]) => `<div class="${P}-br" style="top: ${y + 8}px; background: ${col};"></div><p class="${P}-bt" style="top: ${y + 7}px;">20/20</p>`).join('');
    const root = x.el(`<div class="${P}">`
      // left column: the stats card and the inventory panel with its cards and the bottom bar of buttons
      + `<div class="${P}-pn ${P}-st"><div class="${P}-pt">${icon('person')}</div>${bars}<p class="${P}-lv">Player Level: 1</p><div class="${P}-gs" style="left: 6px;">${icon('person')}</div><div class="${P}-gs" style="left: 46px;">${icon('person')}</div></div>`
      + `<div class="${P}-pn ${P}-iv"><div class="${P}-vl"></div>${CARDS.map(card).join('')}<div class="${P}-sp">${icon('star')}</div></div>`
      + `<div class="${P}-bb">${BUTTONS.map((b) => `<div class="${P}-bn">${icon(b)}</div>`).join('')}</div>`
      // right column: the location panel (the ten tiles) and the story pane
      + `<div class="${P}-pn ${P}-lc"><p class="${P}-lb">Muse Gallery</p><div class="${P}-gd">${tiles.map(cell).join('')}</div><div class="${P}-bg">${ring(`${P}-bgr`, 44, `${P}-rc`)}</div><p class="${P}-lv2">Area Level: 1</p></div>`
      + `<div class="${P}-pn ${P}-sy"><div class="${P}-rk"></div><div class="${P}-br2" style="visibility: hidden;">${icon('brain', '0 0 24 24')}</div>`
      + `<div class="${P}-tx"><p class="${P}-h1"><span class="${P}-tv"></span><span class="${P}-th">${TEXTS[0]}</span></p><p class="${P}-pa"><span class="${P}-tv"></span><span class="${P}-th">${TEXTS[1]}</span></p><p class="${P}-h3"><span class="${P}-tv"></span><span class="${P}-th">${TEXTS[2]}</span></p></div>`
      + `<div class="${P}-in"><div class="${P}-sl">Option A</div><div class="${P}-ip">Say something...</div><div class="${P}-sd">${icon('send')}</div></div></div>`
      // the wait: the dimming and the grey box
      + `<div class="${P}-dm"></div><div class="${P}-cb"><p>Consulting the AI...</p></div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const tvs = [...root.querySelectorAll(`.${P}-tv`)], ths = [...root.querySelectorAll(`.${P}-th`)];
    const dm = q('dm'), cb = q('cb'), brain = q('br2'), bgr = q('bgr');
    const cards = [...root.querySelectorAll(`.${P}-ci`)].map((n) => ({ gl: n.querySelector(`.${P}-gl`), cl: n.querySelector(`.${P}-cl`), rg: n.querySelector(`.${P}-cr`) }));
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), rg: n.querySelector(`.${P}-tr`), arc: n.querySelector(`.${P}-tr .${P}-ra`) }));
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
        const boxOn = s < BOX_END;
        const ang = Math.floor((s * 900) % 360 / 18) * 18;   // the rings' turn, a pure function of s

        put('bx', boxOn, (v) => { dm.style.display = v ? '' : 'none'; cb.style.display = v ? '' : 'none'; });

        // the story text prints behind the box, letter by letter; the rest stays in its line, hidden, so nothing reflows
        const n = Math.floor(clamp01((s - TY0) / (TY1 - TY0)) * TOTAL);
        put('ty', n, (v) => TEXTS.forEach((tx, i) => { const m = Math.min(tx.length, Math.max(0, v - OFF[i])); tvs[i].textContent = tx.slice(0, m); ths[i].textContent = tx.slice(m); }));
        // the faint glyph pulsing in the story pane before the text starts
        const pul = s < TY0 ? Math.round((0.35 + 0.35 * Math.sin(s * 40)) * 20) / 20 : -1;
        put('br', pul, (v) => { show(brain, v >= 0); brain.style.opacity = v >= 0 ? String(v) : ''; });

        // the cards: empty slots under the box, then a ring each, then the picture, one after another
        cards.forEach((c, i) => {
          const st = s < BOX_END ? 0 : s < FILL[i] ? 1 : 2;
          put(`c${i}`, `${st}|${st === 1 ? ang : 0}`, () => {
            show(c.rg, st === 1); show(c.gl, st === 2); show(c.cl, st === 2);
            c.rg.style.transform = st === 1 ? `rotate(${ang}deg)` : '';
          });
        });

        // the big grey ring over the location placeholder: from the box's end until the sheet starts to land
        const bg = s >= BOX_END && s < WAIT_END;
        put('bg', `${bg}|${bg ? ang : 0}`, () => { show(bgr, bg); bgr.style.transform = bg ? `rotate(${ang}deg)` : ''; });

        cells.forEach((c, i) => {
          const d = clamp01((s - LAND[i]) / DIS);         // the cover dissolves
          const b = clamp01((s - LAND[i]) / BL);          // the picture sharpens
          const cov = Math.round((1 - d) * 20) / 20;      // the tile cover's opacity, a pure function of s
          const blur = Math.round(BLUR0 * (1 - b) * 2) / 2;
          const rs = s < WAIT_END ? 0 : s >= LAND[i] + BL ? 0 : s >= LAND[i] ? 2 : 1;   // none, a grey ring waiting, a blue ring landing
          put(`i${i}`, `${cov}|${blur}|${rs}|${rs ? ang : 0}`, () => {
            c.im.style.visibility = cov < 1 ? '' : 'hidden';
            c.im.style.filter = blur > 0 ? `blur(${blur}px)${ctx.tiles[i].grade ? ` ${ctx.tiles[i].grade}` : ''}` : restFilter(ctx.tiles[i]);
            c.cv.style.opacity = cov === 1 ? '' : String(cov);
            c.cv.style.display = cov === 0 ? 'none' : '';
            show(c.rg, rs > 0);
            c.rg.style.transform = rs ? `rotate(${ang}deg)` : '';
            c.arc.style.stroke = rs === 0 ? '' : rs === 1 ? '#9ea3ae' : '#3a8fd8';
          });
        });
      },
    };
  },
};
