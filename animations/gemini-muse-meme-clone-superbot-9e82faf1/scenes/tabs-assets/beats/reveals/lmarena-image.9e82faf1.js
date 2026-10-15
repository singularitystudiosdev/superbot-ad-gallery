// LMArena image battle (2025): Battle mode of the lmarena.ai chat product, light theme, read from two public screen recordings (YouTube bvXk0rwW-yI 'Creating Prompts,
// Images and Scripts in LMArena Battles', 2025-10-25, the pending state at t = 95 - 110 s; and EODWmtGsHOc 'Paid AI Tools FREE - Video & Image Generation Free',
// 2026-01-28, the 'Generating image...' wording at t = 66 s and the video battle at t = 80 - 94 s; frames reveal-refs/lmarena-image/frames/bl_lmarena_*.png, spec
// .tmp/clone-9e82faf1/reveal-refs/lmarena-image/spec.json, confidence 0.66). The wait is DOUBLED and HEADERED: Battle runs two anonymous models, so the thread
// holds two bordered pane cards side by side, each with a header (a filled dot, 'Assistant A' / 'Assistant B', an expand glyph) and, at the top-left of its
// otherwise empty body, one bare grey caption 'Generating...'. No spinner, bar, percentage, timer or cancel anywhere; the caption is static. The two panes race: when a
// model finishes its pane fills in place and its caption goes. Here pane A's five pictures land first, in reading order, then pane B's five. Differs from every built
// single-output wait (one tile, one panel, one bubble) and from stable-assistant (a chat reply bubble) by the two headered side-by-side cards and the empty body.
// Omitted: the LMArena / arena.ai mark and wordmark, the model-picker chrome, the sign-in nags; every picture is OUR meme.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-lma';
const ROOT_W = 560, ROOT_H = 340;
const COLS = 3, TILE_W = 60, TILE_H = 70, GAP = 6;                          // 870 x 1024 pictures (0.85), five per pane: three across the first row, two in the second
const PANE_W = 212, PANE_H = 190, PANE_T = 66;
const PAGE = '#fdfdfd', PANE = '#f8f8f8', HAIR = '#ebebee', INK = '#1a1a1a', GREY = '#8e8e93';
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: ${PAGE}; color: ${INK}; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .09); }
.${P} svg { flex: none; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-sb { position: absolute; left: 0; top: 0; bottom: 0; width: 112px; box-sizing: border-box; padding: 12px 8px 0; background: ${PANE}; box-shadow: 1px 0 0 ${HAIR}; }
.${P}-ni { display: flex; align-items: center; gap: 5px; margin: 0 0 7px; font-size: 7.5px; line-height: 10px; font-weight: 500; color: ${INK}; white-space: nowrap; }
.${P}-ni svg { width: 8px; height: 8px; }
.${P}-sg { margin: 12px 0 4px; font-size: 6.5px; line-height: 9px; font-weight: 600; color: #6e6e73; }
.${P}-hi { box-sizing: border-box; margin: 0 -3px 1px; height: 17px; padding: 0 4px; border-radius: 5px; font-size: 7px; line-height: 17px; color: ${INK}; white-space: nowrap; overflow: hidden; }
.${P}-hi.${P}-cur { background: #ececef; }
.${P}-ft { position: absolute; left: 8px; bottom: 6px; margin: 0; display: flex; gap: 4px; font-size: 5px; line-height: 8px; color: #6e6e73; white-space: nowrap; }
.${P}-tb { position: absolute; left: 112px; top: 0; width: 448px; height: 28px; display: flex; align-items: center; }
.${P}-md { display: flex; align-items: center; gap: 4px; margin: 0 0 0 10px; font-size: 8.5px; line-height: 12px; font-weight: 500; color: ${INK}; }
.${P}-md svg { width: 8px; height: 8px; }
.${P}-dt { margin: 0 12px 0 auto; font-size: 10px; line-height: 10px; letter-spacing: 1px; color: ${INK}; }
.${P}-bb { position: absolute; right: 12px; top: 34px; box-sizing: border-box; max-width: 300px; padding: 6px 10px; border-radius: 10px; background: #f1f1f3; margin: 0; font-size: 8px; line-height: 11px; color: ${INK}; white-space: nowrap; }
.${P}-pn { position: absolute; top: ${PANE_T}px; box-sizing: border-box; width: ${PANE_W}px; height: ${PANE_H}px; border-radius: 8px; background: ${PANE}; box-shadow: inset 0 0 0 1px ${HAIR}; }
.${P}-ph { display: flex; align-items: center; height: 24px; padding: 0 8px; }
.${P}-dot { flex: none; width: 7px; height: 7px; border-radius: 50%; background: ${INK}; }
.${P}-ln { margin: 0 0 0 5px; font-size: 7.5px; line-height: 10px; font-weight: 500; color: ${INK}; white-space: nowrap; }
.${P}-ph svg { width: 8px; height: 8px; margin-left: auto; color: #4a4a50; }
.${P}-g { position: absolute; left: 8px; top: 28px; display: grid; grid-template-columns: repeat(${COLS}, ${TILE_W}px); grid-auto-rows: ${TILE_H}px; gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TILE_W}px; height: ${TILE_H}px; border-radius: 4px; overflow: hidden; background: ${PANE}; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: ${PANE}; }
.${P}-gn { position: absolute; left: 9px; top: 29px; margin: 0; font-size: 8px; line-height: 11px; color: ${GREY}; white-space: nowrap; }
.${P}-cp { position: absolute; left: 120px; top: 270px; box-sizing: border-box; width: 432px; height: 54px; border-radius: 12px; background: #fff; box-shadow: inset 0 0 0 1px ${HAIR}; }
.${P}-ph2 { position: absolute; left: 11px; top: 11px; margin: 0; font-size: 8.5px; line-height: 12px; color: #9a9aa0; white-space: nowrap; }
.${P}-ic { position: absolute; left: 11px; bottom: 8px; display: flex; align-items: center; gap: 9px; color: #4a4a50; }
.${P}-ic svg { width: 9px; height: 9px; }
.${P}-sn { position: absolute; right: 9px; bottom: 8px; width: 15px; height: 15px; border-radius: 50%; background: #c9c9cd; color: #fff; display: flex; align-items: center; justify-content: center; }
.${P}-sn svg { width: 8px; height: 8px; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const RUN = 0.1;                                   // the prompt is sent: both pane cards appear with their captions (idle before)
const LAND = Array.from({ length: 10 }, (_, i) => 0.8 + i * (0.88 / 9));   // tile i is in place (strict reading order: pane A's five, then pane B's five), the last at 1.68

const ICON = {
  swords: '<path d="M2 2l6 6M8 2 2 8M1.6 3.6 3.6 1.6M6.4 8.4l2-2"/>',
  caret: '<path d="M2.6 4 5 6.4 7.4 4"/>',
  chat: '<path d="M1.6 2.4h6.8v4.4H5.2L3.2 8.4V6.8H1.6z"/>',
  cup: '<path d="M3 1.8h4v2.6a2 2 0 0 1-4 0zM3 2.6H1.6c0 1.2.6 1.8 1.6 1.9M7 2.6h1.4c0 1.2-.6 1.8-1.6 1.9M5 6.4v1.2M3.4 8.2h3.2"/>',
  exp: '<path d="M6 1.6h2.4V4M4 8.4H1.6V6M8.2 1.8 5.8 4.2M1.8 8.2 4.2 5.8"/>',
  plus: '<path d="M5 2v6M2 5h6"/>',
  globe: '<circle cx="5" cy="5" r="3.6"/><path d="M1.4 5h7.2M5 1.4c1.6 1.8 1.6 5.4 0 7.2M5 1.4c-1.6 1.8-1.6 5.4 0 7.2"/>',
  img: '<rect x="1.4" y="1.6" width="7.2" height="6.8" rx="1.2"/><circle cx="3.6" cy="4" r=".8"/><path d="M1.8 8 4.2 5.6 6 7.2 7.2 6.2 8.4 7.4"/>',
  up: '<path d="M5 8V2.2M2.6 4.4 5 2l2.4 2.4"/>',
};
const ico = (d) => `<svg viewBox="0 0 10 10">${d}</svg>`;

const HISTORY = ['create me a prompt t...', 'Prompt: "Create a cle...', 'create me a prompt f...', '"Create a clean, educ...'];

export default {
  id: 'lmarena-image',
  label: 'LMArena image battle (2025)',
  source: {
    platform: "LMArena (lmarena.ai, now arena.ai) chat product in Battle mode, light theme, desktop Chrome / Firefox, captured from two public screen recordings and a live read of the image arena shell",
    feature: "text-to-image in Battle mode: the prompt bubble sits right-aligned in the thread and TWO bordered pane cards appear side by side, each with a header (filled dot, 'Assistant A' / 'Assistant B', expand glyph) and a bare grey 'Generating...' caption at the top-left of its empty body; the panes run in parallel with no spinner, bar, percentage or timer; when a model finishes its pane fills in place and the caption goes",
    capture: { url: 'https://www.youtube.com/watch?v=bvXk0rwW-yI', date: '2025-10-25', timestamps: "video bvXk0rwW-yI 'Creating Prompts, Images and Scripts in LMArena Battles' (Cognito Coding): submit t = 95 s, both panes 'Generating...' t = 95.5 / 101 / 107 s, panes filled t = 111 - 118 s; video EODWmtGsHOc (2026-01-28): Direct image mode 'Generating image...' t = 66 s, video battle with both panes 'Generating video...' t = 80 - 94 s" },
    refs: [
      { url: 'https://www.youtube.com/watch?v=bvXk0rwW-yI', published: '2025-10-25', retrieved: '2026-10-15', note: "primary capture: the Battle chip, the right-aligned prompt bubble, the two #F8F8F8 pane cards with 'Assistant A' / 'Assistant B' headers and a bare 'Generating...' at each body's top-left, the 'Ask followup...' composer" },
      { url: 'https://www.youtube.com/watch?v=EODWmtGsHOc', published: '2026-01-28', retrieved: '2026-10-15', note: "the image-mode wording 'Generating image...' and the video battle's two-pane wait; the same product, other output modes" },
    ],
    extrapolated: [
      'ten outputs from two observed: Battle runs two models and the recordings hold two answers; here each pane lands five pictures (three across, then two), all in view with no scroll',
      "all timing: the clip shows about 15 s of 'Generating...' before the panes fill; here it is compressed into the shared 1.84 s beat, pane A's five pictures landing first in reading order and then pane B's five, each pane's caption going when its first picture lands (the recording fills both panes at about the same moment)",
      "the wording is the text-battle 'Generating...' from the 2025-10-25 recording, not the image-mode 'Generating image...': the recording of the image battle itself was account-walled, so the wait is composed from the text and video battles",
      "the pane bodies hold five of our own pictures on landing (the recording's panes fill with text or video); no vote buttons are drawn, because no captured frame shows them for an image battle",
      "the composer reads 'Ask followup...' as in the 2025-10-25 frames (the image-mode composer's own placeholder, 'Describe the image you want to generate...', is from the single-chat view); the sidebar history lines are the recording's own, verbatim; node, pane and font sizes are ours",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'lmarena-image');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/><div class="${P}-cv"></div></div></div>`;
    const px = (n) => 120 + n * (PANE_W + 8);
    const pane = (n, label) => `<div class="${P}-pn" style="left: ${px(n)}px; visibility: hidden"><div class="${P}-ph"><span class="${P}-dot"></span><p class="${P}-ln">${label}</p>${ico(ICON.exp)}</div>`
      + `<div class="${P}-g">${tiles.slice(n * 5, n * 5 + 5).map((g, j) => cell(g, n * 5 + j)).join('')}</div><p class="${P}-gn">Generating...</p></div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-sb"><p class="${P}-ni">${ico(ICON.chat)}New Chat</p><p class="${P}-ni">${ico(ICON.cup)}Leaderboard</p><p class="${P}-sg">Today</p>`
      + HISTORY.map((h, i) => `<p class="${P}-hi${i === 0 ? ` ${P}-cur` : ''}">${h}</p>`).join('')
      + `<p class="${P}-ft"><span>Terms of Use</span><span>Privacy Policy</span><span>Cookies</span></p></div>`
      + `<div class="${P}-tb"><p class="${P}-md">${ico(ICON.swords)}Battle${ico(ICON.caret)}</p><p class="${P}-dt">···</p></div>`
      + `<p class="${P}-bb">Ten Muse memes, one picture per cell</p>`
      + pane(0, 'Assistant A') + pane(1, 'Assistant B')
      + `<div class="${P}-cp"><p class="${P}-ph2">Ask followup...</p><div class="${P}-ic">${ico(ICON.plus)}${ico(ICON.globe)}${ico(ICON.img)}</div><span class="${P}-sn">${ico(ICON.up)}</span></div></div>`);
    const panes = [...root.querySelectorAll(`.${P}-pn`)];
    const caps = panes.map((n) => n.querySelector(`.${P}-gn`));
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        put('pn', s >= RUN, (v) => { panes.forEach((n) => { n.style.visibility = v ? '' : 'hidden'; }); });
        // each pane's caption goes with its first picture (A: tile 1, B: tile 6)
        caps.forEach((c, n) => put(`cap${n}`, s < LAND[n * 5], (v) => { c.style.visibility = v ? '' : 'hidden'; }));
        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // flat pane-coloured cover until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
