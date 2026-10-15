// Vertex AI Media Studio (2025): the Image tab of the Media Studio page in the Google Cloud console, read from two public screen recordings of the page
// (YouTube CmIWb2NgbZE 'Generate images in Google Media Studio using AI on Google Cloud', 2025-04-09, submit at t = 42.6 s, first picture at t = 53.5 s, done at
// t = 54.2 s; and D069muPM5Jc 'Google Vertex AI | Media Studio | Image Generation | Video Generation', 2025-05-28; frames reveal-refs/vertex-ai-studio/frames/
// bl_vertex_*.png, spec .tmp/clone-9e82faf1/reveal-refs/vertex-ai-studio/spec.json, confidence 0.62). The wait is TWO separate layers and nothing in either is a
// spinner: (1) the output canvas fills with a grid of PALE ghost tiles (near-white blue-grey, rounded, no border, no icon, no text) whose luminance ripples softly
// (frame-to-frame mean 231 <-> 241) and (2) ONE dark grey stadium pill (#5F6367, white 12 px label 'Generating images. This may take several minutes.') floats over
// the middle of the grid. While it runs the Settings rail and the header actions read disabled and the prompt bar is dim; when the pictures are ready the pill goes and
// the rail comes back live. Here the ghosts resolve blur-up through a COVER laid over each picture, in strict reading order. Differs from azure-ai-foundry-images
// (one dark tile, thin spinner arc, caption and Stop pill inside it), aws-bedrock-image-playground (a spinner in every tile) and openai-playground-images (caption and
// elapsed timer in a dark tile). Omitted: the console chrome (Google Cloud mark, search bar, product nav), 'Get code', and the browser; every picture is OUR meme.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-vtx';
const ROOT_W = 560, ROOT_H = 300;
const COLS = 5, TILE = 66, GAP = 8;                                          // square tiles (the 1:1 aspect chip is selected), five columns in the canvas
const GRID_L = 11, GRID_T = 66;
const PILL_W = 212, PILL_H = 30;
const INK = '#1f1f1f', MUTE = '#5f6368', OFF = '#b4b9c0';
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #eff3f7; color: ${INK}; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(60, 64, 67, .14); }
.${P} svg { flex: none; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-rl { position: absolute; left: 0; top: 0; bottom: 0; width: 26px; background: #fff; box-shadow: 1px 0 0 #dfe3e8; }
.${P}-pl { position: absolute; left: 4px; top: 82px; box-sizing: border-box; width: 18px; height: 62px; border-radius: 9px; background: #fff; box-shadow: 0 1px 4px rgba(60, 64, 67, .3); display: flex; flex-direction: column; align-items: center; justify-content: space-around; padding: 4px 0; color: ${MUTE}; }
.${P}-pl svg { width: 9px; height: 9px; }
.${P}-pl .${P}-on { color: #0b57d0; }
.${P}-hd { position: absolute; left: 26px; top: 0; width: 384px; height: 28px; box-shadow: 0 1px 0 #dfe3e8; display: flex; align-items: center; }
.${P}-hd svg { width: 9px; height: 9px; margin-left: 9px; color: #0b57d0; }
.${P}-ti { margin: 0 0 0 9px; font-size: 9px; line-height: 12px; font-weight: 500; color: ${INK}; white-space: nowrap; }
.${P}-ac { margin: 0 0 0 auto; padding-right: 10px; display: flex; align-items: center; gap: 9px; font-size: 7px; line-height: 10px; color: #0b57d0; white-space: nowrap; }
.${P}-ac span { display: flex; align-items: center; gap: 2.5px; }
.${P}-ac svg { width: 8px; height: 8px; margin: 0; color: inherit; }
.${P}-cn { position: absolute; left: 26px; top: 28px; width: 384px; height: 204px; }
.${P}-g { position: absolute; left: ${GRID_L}px; top: ${GRID_T - 28}px; display: grid; grid-template-columns: repeat(${COLS}, ${TILE}px); grid-auto-rows: ${TILE}px; gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TILE}px; height: ${TILE}px; border-radius: 8px; overflow: hidden; background: #e8ebef; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-pg { position: absolute; left: ${(384 - PILL_W) / 2}px; top: ${GRID_T - 28 + (2 * TILE + GAP - PILL_H) / 2}px; box-sizing: border-box; width: ${PILL_W}px; height: ${PILL_H}px; border-radius: ${PILL_H / 2}px; background: #5f6367; color: #fff; margin: 0; font-size: 7.4px; line-height: ${PILL_H}px; text-align: center; white-space: nowrap; }
.${P}-pb { position: absolute; left: 36px; top: 246px; box-sizing: border-box; width: 364px; height: 32px; border-radius: 16px; background: #fff; box-shadow: inset 0 0 0 1px #c4c7c5; display: flex; align-items: center; }
.${P}-pb svg { width: 9px; height: 9px; margin-left: 11px; color: #0b57d0; }
.${P}-pt { margin: 0 0 0 8px; font-size: 8px; line-height: 11px; color: ${INK}; white-space: nowrap; }
.${P}-sd { margin-left: auto; margin-right: 10px; width: 10px; height: 10px; color: ${MUTE}; }
.${P}-sr { position: absolute; left: 410px; top: 0; bottom: 0; width: 150px; box-sizing: border-box; padding: 12px 11px 0; background: #fff; box-shadow: -1px 0 0 #dfe3e8; }
.${P}-sh { display: flex; align-items: center; margin: 0; font-size: 8.5px; line-height: 12px; font-weight: 500; color: ${INK}; }
.${P}-sh svg { width: 8px; height: 8px; margin-left: auto; color: ${INK}; }
.${P}-lb { position: relative; margin: 9px 0 0; font-size: 6.5px; line-height: 9px; font-weight: 500; color: ${INK}; white-space: nowrap; }
.${P}-md { position: relative; box-sizing: border-box; margin-top: 3px; height: 20px; border-radius: 3px; box-shadow: inset 0 0 0 1px #747775; display: flex; align-items: center; padding: 0 7px; font-size: 7.5px; line-height: 10px; color: ${INK}; }
.${P}-md svg { width: 8px; height: 8px; margin-left: auto; }
.${P}-ch { display: grid; grid-template-columns: repeat(3, 40px); grid-auto-rows: 34px; gap: 1px 0; margin: 4px 0 0 -3px; }
.${P}-c { box-sizing: border-box; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 6.5px; line-height: 8px; font-weight: 500; color: ${MUTE}; }
.${P}-c svg { width: 8px; height: 8px; }
.${P}-c.${P}-sel { background: #d3e3fd; color: #0b57d0; }
.${P}-sl { position: relative; margin-top: 8px; height: 22px; display: flex; align-items: center; }
.${P}-tr { width: 80px; height: 3px; border-radius: 2px; background: #0b57d0; position: relative; }
.${P}-tr::after { content: ''; position: absolute; left: 76px; top: -3px; width: 9px; height: 9px; border-radius: 50%; background: #0b57d0; }
.${P}-nv { margin-left: auto; box-sizing: border-box; width: 22px; height: 18px; border-radius: 3px; box-shadow: inset 0 0 0 1px #747775; text-align: center; font-size: 7.5px; line-height: 18px; color: ${INK}; }
.${P}-ad { display: flex; align-items: center; margin: 9px 0 0; font-size: 7.5px; line-height: 10px; color: #0b57d0; white-space: nowrap; }
.${P}-ad svg { width: 8px; height: 8px; margin-right: 4px; }
.${P}-ao { display: flex; align-items: center; margin: 12px 0 0; padding-top: 8px; box-shadow: 0 -1px 0 #dfe3e8; font-size: 8px; line-height: 11px; font-weight: 500; color: ${INK}; }
.${P}-ao svg { width: 8px; height: 8px; margin-left: auto; }
.${P}-dis .${P}-ac, .${P}-dis .${P}-ac svg { color: ${OFF}; }
.${P}-dis .${P}-sh, .${P}-dis .${P}-sh svg, .${P}-dis .${P}-lb, .${P}-dis .${P}-md, .${P}-dis .${P}-nv, .${P}-dis .${P}-ao, .${P}-dis .${P}-ao svg { color: ${OFF}; }
.${P}-dis .${P}-md { box-shadow: inset 0 0 0 1px #dadce0; }
.${P}-dis .${P}-nv { box-shadow: inset 0 0 0 1px #dadce0; }
.${P}-dis .${P}-c { color: ${OFF}; }
.${P}-dis .${P}-c.${P}-sel { background: #eaf0fa; color: ${OFF}; }
.${P}-dis .${P}-tr, .${P}-dis .${P}-tr::after { background: #c3cfe6; }
.${P}-dis .${P}-ad { color: ${OFF}; }
.${P}-dis .${P}-pt, .${P}-dis .${P}-sd, .${P}-dis .${P}-pb svg { color: ${OFF}; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const RUN = 0.1;                                   // the prompt is sent: the ghosts appear and the pill fades in (idle before)
const PILL_IN = 0.14;                              // the pill's fade-in
const PILL_OUT = 0.16;                             // the pill's fade-out, ending exactly at the last landing
const BU = 0.26;                                   // a cell's blur-up: its picture shows through the cover and the cover clears, ending at its landing
const LAND = Array.from({ length: 10 }, (_, i) => 1.0 + i * (0.68 / 9));   // cell i is resolved (strict reading order), the last at 1.68
const PERIOD = 0.8;                                // one ghost pulse in layout seconds
const PHASE = 0.11;                                // pulse offset between neighbouring cells, in periods

const ICON = {
  back: '<path d="M8 5H2M4.6 2.4 2 5l2.6 2.6"/>',
  img: '<rect x="1.4" y="1.6" width="7.2" height="6.8" rx="1.2"/><circle cx="3.6" cy="4" r=".8"/><path d="M1.8 8 4.2 5.6 6 7.2 7.2 6.2 8.4 7.4"/>',
  aud: '<path d="M1.5 5h1M3.7 3v4M5.9 1.8v6.4M8.1 3.6v2.8"/>',
  mus: '<path d="M3.5 7.4V1.8l4-.8v5.6"/><circle cx="2.5" cy="7.6" r="1.1"/><circle cx="6.5" cy="6.8" r="1.1"/>',
  vid: '<rect x="1.2" y="2.4" width="5.2" height="5.2" rx="1"/><path d="M6.4 4.2 8.8 3v4L6.4 5.8"/>',
  exp: '<path d="M5 1.5v5M2.8 4.6 5 6.8l2.2-2.2M1.8 8.5h6.4"/>',
  rst: '<path d="M1.6 5a3.4 3.4 0 1 0 1-2.4M1.4 1.4v1.6h1.6"/>',
  his: '<path d="M1.6 5a3.4 3.4 0 1 0 1-2.4M1.4 1.4v1.6h1.6M5 3v2.2l1.4.8"/>',
  edit: '<path d="M2 8l.4-1.8L7 1.6l1.4 1.4-4.6 4.6zM6 2.6l1.4 1.4"/>',
  send: '<path d="M1.4 1.6 8.8 5 1.4 8.4 2.4 5zM2.4 5H6"/>',
  up: '<path d="M2 6.2 5 3.4l3 2.8"/>',
  dn: '<path d="M2 3.8 5 6.6l3-2.8"/>',
  plus: '<path d="M5 2v6M2 5h6"/>',
  r11: '<rect x="2" y="2" width="6" height="6" rx="1"/>',
  r916: '<rect x="3" y="1.2" width="4" height="7.6" rx="1"/>',
  r169: '<rect x="1.2" y="3" width="7.6" height="4" rx="1"/>',
  r34: '<rect x="2.4" y="1.6" width="5.2" height="6.8" rx="1"/>',
  r43: '<rect x="1.6" y="2.4" width="6.8" height="5.2" rx="1"/>',
};
const ico = (d) => `<svg viewBox="0 0 10 10">${d}</svg>`;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const f2 = (v) => v.toFixed(2);

export default {
  id: 'vertex-ai-studio',
  label: 'Vertex AI Media Studio (2025)',
  source: {
    platform: "Google Cloud console > Vertex AI Studio > Media Studio, Image tab (console.cloud.google.com/vertex-ai/studio/media/generate?tab=image), light theme, Imagen 3, captured from two public screen recordings of the page",
    feature: "text-to-image: the prompt is sent from the bottom pill bar and the empty output canvas fills with pale rounded ghost tiles that ripple in luminance with no spinner, no border, no text, while ONE dark grey stadium pill reading 'Generating images. This may take several minutes.' floats over the middle of the grid; the Settings rail (Model, Aspect ratio, Number of results, Advanced options) and the header actions read disabled during the wait; the finished pictures take the same slots, the pill goes and the rail is live again",
    capture: { url: 'https://www.youtube.com/watch?v=CmIWb2NgbZE', date: '2025-04-09', timestamps: "video CmIWb2NgbZE 'Generate images in Google Media Studio using AI on Google Cloud': idle t = 40.0 s, submitted with the pill fading in over the first ghost at t = 42.6 s, full grid with pill t = 43.5 / 45.0 s, mid-wait t = 48.0 s, picture starting to resolve at the tile edge t = 51.0 s, pill fading out t = 53.0 s, four finished images t = 54.2 s; corroborating video D069muPM5Jc (2025-05-28): submit t = 91-94 s, results t = 97-100 s" },
    refs: [
      { url: 'https://www.youtube.com/watch?v=CmIWb2NgbZE', published: '2025-04-09', retrieved: '2026-10-15', note: "primary capture: the 2x2 ghost grid, the #5F6367 stadium pill (about 272 x 39 px at 1280 x 720) and the sentence verbatim, the 231 <-> 241 luminance ripple, the disabled Settings rail" },
      { url: 'https://www.youtube.com/watch?v=D069muPM5Jc', published: '2025-05-28', retrieved: '2026-10-15', note: "corroborating capture of the same wait (about 6 s on screen), including a second submission with a changed prompt" },
    ],
    extrapolated: [
      'ten outputs from four observed: the recordings run Number of results = 4 (a 2x2 grid); here the canvas holds a 5 x 2 grid of ten ghosts, all in view with no scroll, and the Number of results box reads 10',
      'all timing: the clips show 6 - 11 s of wait; here the idle, the ghost ripple and the ten blur-up hand-overs are compressed into the shared 1.84 s beat, one resolved cell after another in strict reading order, the last at 1.68 s; the recording lands all four at once',
      "the blur-up: the recording only hints at it (a sun glow bleeding in from a tile edge at t = 51 s); here each ghost clears through a blurred cover over its own picture, the blur and the cover's alpha pure functions of t",
      'the ghost ripple is a sine of t, a per-cell phase offset, a fixed 0.8 layout-second period and a soft diagonal sheen; the recording gives only the frame-to-frame mean (231 - 241) and standard deviation, not a period',
      "the pill fades in over about 0.14 s and out over the last 0.16 s before the final landing as in the t = 53 frame; it is centred on the canvas grid, scaled down with the page (about 212 x 30 px); node, rail and font sizes are ours",
      "the prompt bar holds our own line ('Ten Muse memes, one picture per cell') instead of the recording's 'Generate image of sunrise with sunflowers'; the console's header bar, left product nav, 'Get code' and the right-rail disclaimer are not reproduced",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'vertex-ai-studio');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/><div class="${P}-cv"></div></div></div>`;
    const chip = (d, label, sel) => `<span class="${P}-c${sel ? ` ${P}-sel` : ''}">${ico(d)}${label}</span>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-rl"><div class="${P}-pl"><span class="${P}-on">${ico(ICON.img)}</span>${ico(ICON.aud)}${ico(ICON.mus)}${ico(ICON.vid)}</div></div>`
      + `<div class="${P}-hd">${ico(ICON.back)}<p class="${P}-ti">Media Studio</p><div class="${P}-ac"><span>${ico(ICON.exp)}Export</span><span>${ico(ICON.rst)}Reset</span><span>${ico(ICON.his)}History</span></div></div>`
      + `<div class="${P}-cn"><div class="${P}-g" style="visibility: hidden">${tiles.map(cell).join('')}</div><p class="${P}-pg" style="visibility: hidden">Generating images. This may take several minutes.</p></div>`
      + `<div class="${P}-pb">${ico(ICON.edit)}<p class="${P}-pt">Ten Muse memes, one picture per cell</p><span class="${P}-sd">${ico(ICON.send)}</span></div>`
      + `<div class="${P}-sr"><p class="${P}-sh">Settings${ico(ICON.up)}</p>`
      + `<p class="${P}-lb">Model</p><div class="${P}-md">Imagen 3${ico(ICON.dn)}</div>`
      + `<p class="${P}-lb">Aspect ratio</p><div class="${P}-ch">${chip(ICON.r11, '1:1', true)}${chip(ICON.r916, '9:16')}${chip(ICON.r169, '16:9')}${chip(ICON.r34, '3:4')}${chip(ICON.r43, '4:3')}</div>`
      + `<p class="${P}-lb">Number of results</p><div class="${P}-sl"><div class="${P}-tr"></div><span class="${P}-nv">10</span></div>`
      + `<p class="${P}-ad">${ico(ICON.plus)}Add Reference</p><p class="${P}-ao">Advanced options${ico(ICON.dn)}</p></div></div>`);
    const grid = root.querySelector(`.${P}-g`);
    const pill = root.querySelector(`.${P}-pg`);
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
        // 0 idle (empty canvas), 1 running (ghosts, pill, disabled rail), 2 landed (pictures, live rail)
        const phase = s >= LAND[9] ? 2 : s >= RUN ? 1 : 0;

        put('ph', phase, (v) => {
          root.classList.toggle(`${P}-dis`, v === 1);
          grid.style.visibility = v === 0 ? 'hidden' : '';
          pill.style.visibility = v === 1 ? '' : 'hidden';
        });
        put('pg', phase === 1 ? f2(Math.max(0.02, Math.min(1, (s - RUN) / PILL_IN, (LAND[9] - s) / PILL_OUT))) : '0', (v) => { pill.style.opacity = v; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          const start = LAND[i] - BU;
          const p = done ? 1 : clamp01((s - start) / BU);     // 0 ghost .. 1 resolved
          // the ghost: a pale blue-grey wash whose luminance ripples 231 <-> 241 as a sine of t, a soft diagonal sheen across it
          const L = Math.round(236 + 5 * Math.sin(2 * Math.PI * (s / PERIOD + i * PHASE)));
          const ease = p * p * (3 - 2 * p);
          const a = f2(1 - ease), blur = f2(9 * (1 - ease));
          put(`c${i}`, done ? 'x' : `${L}|${a}|${blur}`, (v) => {
            if (v === 'x') return;
            c.cv.style.background = `linear-gradient(135deg, rgba(${L - 3}, ${L}, ${L + 3}, ${a}) 0%, rgba(${L + 4}, ${L + 7}, ${L + 9}, ${a}) 46%, rgba(${L - 3}, ${L}, ${L + 3}, ${a}) 100%)`;
            c.cv.style.backdropFilter = `blur(${blur}px)`;
          });
          put(`i${i}`, `${p > 0 || done ? 1 : 0}${done ? 1 : 0}`, (v) => {
            c.im.style.visibility = v[0] === '1' ? '' : 'hidden';
            c.cv.style.display = v[1] === '1' ? 'none' : '';
          });
        });
      },
    };
  },
};
