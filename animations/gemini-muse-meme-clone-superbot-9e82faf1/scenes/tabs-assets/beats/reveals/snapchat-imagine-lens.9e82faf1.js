// Snapchat Imagine Lens (2025): the wait of Snapchat's open-prompt image lens, read from Snap's own first-party tutorial MP4 on the newsroom
// post 'Imagine for Everyone' (2025-10-22; wait t = 13.7-15.6 s, the picture lands at t = 15.9 s; frames reveal-refs/snapchat-imagine-lens/frames/
// ca_il_{pend_08,pend_48,pend_76,pend_80,landed}.png, spec .tmp/clone-9e82faf1/reveal-refs/snapchat-imagine-lens/spec.json, confidence 0.6).
// The whole block is the Snapchat CAMERA, not a modal: the live scene fills the screen, the avatar and a search glyph sit top-left, a rail of
// camera glyphs runs down the right edge, the prompt rides a translucent caption chip across the scene with a small 'Edit' pencil chip under
// it, and the lens carousel along the foot has the 'AI' lens selected (a white ring, a yellow 'NEW' badge) above the tabs 'Favorites | For
// You | Aesthetic'. While it generates a bright yellow determinate arc is drawn round a large white live percentage over the moving scene;
// the arc's length is the printed figure, which climbs 5 -> 100 quickly to about half and then slower. Landing: the arc and the figure go,
// and the ten pictures fill a 5 x 2 grid of rounded snap-style cards over the camera in strict reading order. The scene is our own flat
// shaded office drawn in plain boxes (never the footage); every picture is OUR meme; no Snapchat ghost, wordmark, Snapchat+ or
// subscription chrome; system UI face only.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-sil';
const ROOT_W = 560, ROOT_H = 500;
const GRID_L = 12, GRID_T = 62, GRID_W = 494, GAP = 6, COLS = 5;
const ARC_C = [GRID_L + GRID_W / 2, GRID_T + 114];   // the arc and the figure sit at the middle of the grid area
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 14px; background: #a89f93; color: #ffffff; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .12); }
.${P} p { margin: 0; white-space: nowrap; }
.${P}-sv { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; overflow: hidden; }
.${P}-sc { position: absolute; left: -6px; top: -6px; width: ${ROOT_W + 12}px; height: ${ROOT_H + 12}px; }
.${P}-b { position: absolute; display: block; }
.${P}-sh { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: linear-gradient(180deg, rgba(0, 0, 0, .34) 0, rgba(0, 0, 0, 0) 96px, rgba(0, 0, 0, 0) 330px, rgba(0, 0, 0, .42) 100%); }
.${P}-av { position: absolute; left: 12px; top: 12px; width: 34px; height: 34px; border-radius: 50%; overflow: hidden; background: #d9b48a; box-shadow: 0 0 0 1.5px rgba(255, 255, 255, .85); }
.${P}-av i { position: absolute; display: block; }
.${P}-ic { position: absolute; display: block; width: 24px; height: 24px; fill: none; stroke: #ffffff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .5)); }
.${P}-dk { position: absolute; left: 512px; top: 152px; width: 30px; height: 30px; border-radius: 50%; background: rgba(40, 40, 44, .72); }
.${P}-dk svg { position: absolute; left: 6px; top: 7px; width: 18px; height: 18px; fill: none; stroke: #ffffff; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-cp { position: absolute; left: 0; width: ${ROOT_W}px; top: 306px; height: 32px; background: rgba(34, 34, 36, .66); font-size: 14.5px; line-height: 32px; font-weight: 500; text-align: center; color: #ffffff; }
.${P}-ed { position: absolute; left: 239px; top: 349px; box-sizing: border-box; width: 82px; height: 27px; border-radius: 14px; background: rgba(30, 30, 34, .36); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .55); font-size: 12.5px; line-height: 27px; font-weight: 700; padding-left: 14px; }
.${P}-ed svg { position: absolute; left: 50px; top: 6px; width: 15px; height: 15px; fill: none; stroke: #ffffff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ln { position: absolute; top: 387px; width: 46px; height: 46px; border-radius: 50%; box-shadow: 0 0 0 1.5px rgba(255, 255, 255, .3); overflow: hidden; }
.${P}-ln i { position: absolute; display: block; }
.${P}-ai { position: absolute; left: 248px; top: 378px; box-sizing: border-box; width: 64px; height: 64px; border-radius: 50%; background: #ffffff; padding: 3.5px; }
.${P}-ai b { position: relative; display: block; width: 57px; height: 57px; border-radius: 50%; background: conic-gradient(from 200deg, #ff7a3d, #ffd23d, #3dd6ff, #7a4dff, #ff4d9d, #ff7a3d); padding: 2.5px; box-sizing: border-box; }
.${P}-ai b u { display: block; width: 52px; height: 52px; border-radius: 50%; background: radial-gradient(circle at 40% 30%, #1f2a58 0, #0a0d22 80%); text-decoration: none; }
.${P}-ai p { position: absolute; left: 0; width: 57px; top: 15px; text-align: center; font-size: 20px; line-height: 24px; font-weight: 700; color: #ffffff; }
.${P}-ai svg { position: absolute; left: 41px; top: 9px; width: 11px; height: 11px; fill: #ffffff; }
.${P}-nw { position: absolute; left: 263px; top: 432px; box-sizing: border-box; width: 34px; height: 12px; border-radius: 3px; background: #ffd400; box-shadow: 0 0 0 1.5px #0a0d22; font-size: 7.2px; line-height: 12px; font-weight: 800; text-align: center; color: #1a1a1a; letter-spacing: .3px; }
.${P}-tb { position: absolute; top: 460px; height: 26px; width: 80px; margin-left: -40px; font-size: 13.5px; line-height: 26px; font-weight: 600; text-align: center; color: rgba(255, 255, 255, .86); text-shadow: 0 1px 3px rgba(0, 0, 0, .55); }
.${P}-tb.${P}-on { width: 72px; margin-left: -36px; border-radius: 13px; background: rgba(20, 20, 22, .62); color: #ffffff; }
.${P}-ar { position: absolute; left: ${ARC_C[0] - 56}px; top: ${ARC_C[1] - 56}px; width: 112px; height: 112px; }
.${P}-ar svg { position: absolute; left: 0; top: 0; width: 112px; height: 112px; filter: drop-shadow(0 0 5px rgba(255, 224, 0, .55)); }
.${P}-pc { position: absolute; left: 0; top: 36px; width: 112px; text-align: center; font-size: 31px; line-height: 40px; font-weight: 700; color: #ffffff; text-shadow: 0 1px 7px rgba(0, 0, 0, .6); }
.${P}-g { position: absolute; left: ${GRID_L}px; top: ${GRID_T}px; display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; width: ${GRID_W}px; }
.${P}-t { position: relative; aspect-ratio: 870 / 1024; border-radius: 9px; overflow: hidden; background: rgba(30, 30, 34, .4); box-shadow: 0 0 0 1.5px rgba(255, 255, 255, .85), 0 3px 10px rgba(0, 0, 0, .3); }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: rgba(30, 30, 34, .55); }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const ARC_END = 1.0;                               // the figure reaches 100 here
const LAND = Array.from({ length: 10 }, (_, i) => 1.10 + i * (0.60 / 9));   // picture i fills its card (strict reading order), the last at 1.70; the arc goes at the first
const SETTLE = LAND[9];                            // the camera drift is frozen from the last landing on
const PROMPT = 'The ceiling is leaking water all over her desk';

// the live percent as a pure function of t: quick to about half, then slower, 5 -> 100
const percent = (s) => {
  const u = Math.min(Math.max(s / ARC_END, 0), 1);
  return Math.min(100, Math.round(5 + 95 * (1 - Math.pow(1 - u, 2.6))));
};

const box = (l, t, w, h, css) => `<i class="${P}-b" style="left: ${l}px; top: ${t}px; width: ${w}px; height: ${h}px; ${css}"></i>`;
// the flat-shaded office scene, drawn in plain boxes in a (ROOT_W + 12) x (ROOT_H + 12) space (our own drawing, never the footage)
const SCENE = [
  box(0, 0, 572, 160, 'background: linear-gradient(180deg, #f0ede7 0%, #d9d5cd 100%)'),
  box(0, 150, 572, 220, 'background: linear-gradient(180deg, #d8ccb6 0%, #cbbfa9 100%)'),
  box(60, -10, 150, 16, 'background: #ffffff; transform: rotate(-17deg); box-shadow: 0 0 22px rgba(255, 255, 255, .9)'),
  box(206, 128, 372, 62, 'border-radius: 31px; background: linear-gradient(180deg, #f6f3ee 0%, #d2cdc4 100%)'),
  box(256, 142, 74, 30, 'border-radius: 3px; background: repeating-linear-gradient(180deg, #8b8b88 0 2px, #cfcbc3 2px 5px)'),
  box(408, 72, 26, 44, 'border-radius: 6px 6px 12px 12px; background: linear-gradient(180deg, #f5f3ee, #fff); box-shadow: 0 8px 18px rgba(255, 244, 214, .75)'),
  box(124, 196, 58, 140, 'background: #cfe0ec; box-shadow: inset 0 0 0 3px #b5bcc0'),
  box(246, 184, 78, 196, 'background: #e8e3d8; box-shadow: inset 0 0 0 3px #b8b3a9'),
  box(260, 200, 50, 152, 'background: linear-gradient(180deg, #8e9ca7, #a9b4bb); box-shadow: inset 0 0 0 2px #cbc8c0'),
  box(404, 190, 168, 92, 'background: #1b1d22; box-shadow: inset 0 0 0 2px #34363c'),
  box(0, 276, 152, 120, 'background: #ddd8cf; box-shadow: inset 0 0 0 2px #c6c1b8'),
  box(0, 236, 74, 50, 'background: #1f2125; box-shadow: inset 0 0 0 3px #3a3c42'),
  box(0, 366, 572, 152, 'background: linear-gradient(180deg, #aaa195 0%, #8f867a 100%)'),
  box(-10, 350, 440, 64, 'background: #d9aa6c; transform: skewY(-8deg); box-shadow: 0 5px 0 #b5864d'),
  box(34, 380, 20, 140, 'background: #6f7378'),
  box(150, 296, 112, 70, 'background: #f1f1ee; box-shadow: 0 0 0 5px #24262a'),
  box(166, 308, 56, 4, 'background: #8e9aa5'), box(166, 318, 70, 4, 'background: #8e9aa5'), box(166, 328, 48, 4, 'background: #8e9aa5'),
  box(196, 366, 16, 18, 'background: #3b3d42'),
  box(224, 360, 104, 50, 'background: #2f3237; transform: skewX(-12deg); box-shadow: inset 0 0 0 4px #494c52'),
  box(14, 322, 38, 42, 'background: #7fc7c8; box-shadow: inset 0 0 0 3px #5fa7a9'),
  box(400, 360, 110, 130, 'border-radius: 22px 22px 8px 8px; background: #29292e'),
  box(462, 336, 100, 150, 'border-radius: 16px; background: linear-gradient(180deg, #34353b, #1c1c20)'),
].join('');

// the lens carousel: [centre x, background, glyph]
const LENS = [
  [46, 'linear-gradient(160deg, #ffd1a6, #e8825a)', box(11, 22, 24, 30, 'border-radius: 50% 50% 8px 8px; background: #fbe3cf')],
  [103, 'linear-gradient(160deg, #f4c6dc, #b86fb0)', box(9, 12, 28, 28, 'border-radius: 50%; background: #ffeaf4')],
  [160, 'linear-gradient(180deg, #8ab8ee 0%, #ecc7d8 100%)', box(18, 8, 10, 34, 'background: #7a4a66; clip-path: polygon(50% 0, 100% 100%, 0 100%)')],
  [217, 'linear-gradient(160deg, #3a3f55, #151724)', box(9, 17, 28, 12, 'border-radius: 6px; background: #f0f0f4')],
  [343, 'linear-gradient(160deg, #d8b9a3, #8a6a58)', box(9, 24, 28, 14, 'border-radius: 50%; background: #c98b8b')],
  [400, 'linear-gradient(160deg, #cfd8ea, #8fa4c4)', box(11, 9, 24, 28, 'border-radius: 50% 50% 40% 40%; background: #e8cfb5')],
  [457, 'linear-gradient(160deg, #66c0e8, #2f7fb0)', box(12, 12, 22, 22, 'border-radius: 50%; background: #dff4fb; box-shadow: inset 0 0 0 6px #3a2a20')],
  [514, 'linear-gradient(160deg, #e8d6b0, #b58f58)', box(10, 14, 26, 18, 'border-radius: 9px; background: #5a3d24')],
];

const IC = {
  search: '<svg class="' + P + '-ic" style="left: 56px; top: 17px" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
  friend: '<svg class="' + P + '-ic" style="left: 514px; top: 14px" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.6"/><path d="M2.6 20c0-3.8 2.8-6 6.4-6s6.4 2.2 6.4 6M19 6v6M16 9h6"/></svg>',
  flip: '<svg class="' + P + '-ic" style="left: 514px; top: 52px" viewBox="0 0 24 24"><path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2M20 3v5h-5M4 21v-5h5"/></svg>',
  flash: '<svg class="' + P + '-ic" style="left: 514px; top: 90px" viewBox="0 0 24 24"><path d="M13 2L5 13h6l-1 9 8-12h-6z"/><path d="M3 3l18 18"/></svg>',
  music: '<svg class="' + P + '-ic" style="left: 514px; top: 128px" viewBox="0 0 24 24"><path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.6"/><circle cx="17.5" cy="16" r="2.6"/></svg>',
  scan: '<svg class="' + P + '-ic" style="left: 514px; top: 198px" viewBox="0 0 24 24"><path d="M3 8V4h4M17 4h4v4M21 16v4h-4M7 20H3v-4"/><circle cx="12" cy="10" r="3"/><path d="M7 18c.8-3 2.6-4.2 5-4.2s4.2 1.2 5 4.2"/></svg>',
  memo: '<svg class="' + P + '-ic" style="left: 14px; top: 458px" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3.5"/><path d="M12 9v8M8 13h8"/></svg>',
  smile: '<svg class="' + P + '-ic" style="left: 518px; top: 458px" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 14c1 2.2 2.4 3 4 3s3-.8 4-3M9 9.5h.01M15 9.5h.01"/></svg>',
};

export default {
  id: 'snapchat-imagine-lens',
  label: 'Snapchat Imagine Lens (2025)',
  source: {
    platform: "Snapchat for iOS, the camera view, dark UI, 1080x1920 portrait first-party Snap Inc. tutorial MP4 (23.976 fps, 31.4 s) embedded on the Snap newsroom post 'Imagine for Everyone'",
    feature: "Imagine Lens: with the 'AI' lens selected in the lens carousel and a prompt set in the caption chip ('The ceiling is leaking water all over her desk'), the camera itself becomes the wait surface: no modal and no dimming, a bright yellow determinate arc with a large white live percentage is drawn over the moving camera preview (5% -> 8% -> 48% -> 75% -> 80%) while the right rail, the caption chip with its 'Edit' pencil chip and the carousel stay live; the generated picture then replaces the camera preview in place",
    capture: {
      url: 'https://videos.ctfassets.net/o1znirz7lzo4/OJVyb49qYkyXYrTNH8b7F/e011ea8c2e1c6bf68407907abfdc9541/Imagine_lens_tutorial_20mb.mp4',
      page: 'https://newsroom.snap.com/imagine-for-everyone',
      date: '2025-10-22',
      retrieved: '2026-10-16',
      timestamps: "video Imagine_lens_tutorial_20mb.mp4 (constant 23.976 fps): the arc + figure are on screen t = 13.7-15.6 s (10 fps samples ca_il_pend_08 = '5%', ca_il_pend_48 = '75%'-class, ca_il_pend_76, ca_il_pend_80 = '80%'; the figure reads 5 -> 8 -> 48 -> 75 -> 76 -> 77 -> 78 -> 79 -> 80); the generated picture replaces the camera preview at t = 15.6-15.9 s (ca_il_landed); a second wait runs t = 22-24 s",
    },
    refs: [
      { url: 'https://newsroom.snap.com/imagine-for-everyone', published: '2025-10-22', retrieved: '2026-10-16', note: "Imagine for Everyone (Snap Inc., first-party): the hosting page of the tutorial MP4; 'Find the Imagine Lens near the front of your Lens Carousel ... Tap the caption to edit your prompt'" },
      { url: 'https://newsroom.snap.com/imagine-a-new-way-to-create-with-lenses', published: '2025-09-05', retrieved: '2026-10-16', note: 'Imagine: a new way to create with Lenses (Snap Inc., first-party): the feature and its launch' },
    ],
    extrapolated: [
      "the landing: the footage lands ONE full-screen image over the camera at t = 15.9 s; here the arc and the figure go together at the first landing (the landed state then stays static) and the ten pictures fill a 5 x 2 grid of rounded cards over the camera in strict reading order, the cards' empty slots appearing as translucent dark cards with the first landing",
      "the figure: the footage reaches 80% before the picture lands (5 -> 8 -> 48 -> 75 -> 80, ~2 s, one sample); here it climbs 5 -> 100 as a pure function of t, quick to about half then slower, and holds 100% for a beat before the first landing",
      "the arc: the footage draws a travelling crescent with a soft glowing head; here the yellow arc is a determinate stroke whose length equals the printed percent (a closed ring at 100%) on a faint track, with a soft glow",
      "the scene: our own flat-shaded office drawn in plain boxes (a ceiling, a duct, a door, a TV, a desk with a monitor and a laptop, a chair), not the footage; the camera drifts a few pixels with t to read as live and holds still from the last landing on",
      "the prompt: the caption keeps the footage's prompt verbatim while the pictures are our memes",
      "the chrome: the avatar is a plain flat disc (no Bitmoji), the carousel's other lenses are plain gradient discs with a simple glyph, the right rail is redrawn as our own line glyphs; the footage's left rail (heart, share, view count), the unread badge, the 'Games' tab and the picture-viewer rail after the landing are omitted",
      "omitted from the footage: the ghost logo, any Snapchat+ or Lens+ chrome, the second prompt typed t = 18-22 s",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'snapchat-imagine-lens');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const lens = LENS.map(([cx, bg, glyph]) => `<div class="${P}-ln" style="left: ${cx - 23}px; background: ${bg}">${glyph}</div>`).join('');
    const tab = (label, cx, on) => `<p class="${P}-tb${on ? ` ${P}-on` : ''}" style="left: ${cx}px">${label}</p>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-sv"><div class="${P}-sc"><div class="${P}-sd" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%">${SCENE}</div></div></div>`
      + `<div class="${P}-sh"></div>`
      + `<div class="${P}-av"><i style="left: 6px; top: 4px; width: 22px; height: 12px; border-radius: 11px 11px 2px 2px; background: #4b3224"></i><i style="left: 9px; top: 9px; width: 16px; height: 17px; border-radius: 50%; background: #e7c29c"></i><i style="left: 3px; top: 25px; width: 28px; height: 16px; border-radius: 14px; background: #3d6fb0"></i></div>`
      + IC.search + IC.friend + IC.flip + IC.flash + IC.music
      + `<div class="${P}-dk"><svg viewBox="0 0 24 24"><path d="M5 9l7 7 7-7"/></svg></div>`
      + IC.scan + IC.memo + IC.smile
      + `<div class="${P}-g">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-ar"><svg viewBox="0 0 112 112"><circle cx="56" cy="56" r="46" fill="none" stroke="rgba(255, 255, 255, .26)" stroke-width="3"/>`
      + `<circle class="${P}-arc" cx="56" cy="56" r="46" fill="none" stroke="#ffe11f" stroke-width="6" pathLength="100" stroke-dasharray="5 95" transform="rotate(-90 56 56)"/></svg><p class="${P}-pc">5%</p></div>`
      + `<p class="${P}-cp">${PROMPT}</p>`
      + `<p class="${P}-ed">Edit<svg viewBox="0 0 24 24"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/></svg></p>`
      + lens
      + `<div class="${P}-ai"><b><u></u><p>AI</p><svg viewBox="0 0 24 24"><path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z"/></svg></b></div>`
      + `<p class="${P}-nw">NEW</p>`
      + tab('Favorites', 150, false) + tab('For You', 280, true) + tab('Aesthetic', 410, false)
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const sd = q('sd'), ar = q('ar'), arc = q('arc'), pc = q('pc'), grid = q('g');
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
        const gone = s >= LAND[0];                     // the arc and the figure go at the first landing
        const pct = percent(s);
        const e = Math.min(s, SETTLE);                 // the camera drift is frozen from the last landing on
        const dx = Math.round(3 * Math.sin(e * 3.1)), dy = Math.round(2 * Math.sin(e * 2.3 + 1));

        put('dr', `${dx},${dy}`, () => { sd.style.transform = `translate(${dx}px, ${dy}px)`; });
        put('ar', gone, (v) => { ar.style.visibility = v ? 'hidden' : ''; });
        put('pc', pct, (v) => { pc.textContent = `${v}%`; arc.setAttribute('stroke-dasharray', `${v} ${100 - v}`); });
        put('gv', gone, (v) => { grid.style.visibility = v ? '' : 'hidden'; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // a translucent dark card until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
