// Google Search AI Mode image creation (2025-26 redesign): the dark AI Mode page's image turn, read from the YouTube walkthrough WSbevSn8j1o (2025-12-19, dark theme; wait t = 36-44 s,
// frames reveal-refs/google-search-create-images-2026/frames/bq_gsc_*.png, spec .tmp/clone-9e82faf1/reveal-refs/google-search-create-images-2026/spec.json, confidence 0.56) and the light
// 2026-08 clip sv02B5IhuhY (caption 'Generating image with Nano Banana 2 Lite'). The whole screen is the dark AI Mode page: the tab strip 'AI Mode | All | Images | Videos | News | More', a left
// icon rail, the right-aligned user bubble with our prompt, a three-dot composing bubble that is replaced by the single caption line 'Generating image with Nano Banana' (no tile,
// skeleton, percentage or ETA exists anywhere) while a thin multicolour gradient sweep runs along the top edge under the tabs; at the end the sweep is gone and the line reads
// 'Here's your generated image.' with the result under it. The caption's model token is a parameter (MODEL). Omitted: the Google 'G' mark, every wordmark. Every picture is OUR meme.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-gs6';
const ROOT_W = 560, ROOT_H = 380;
const MODEL = 'Nano Banana';                       // build-variable: the recorded dark capture names this model, the 2026-08 capture 'Nano Banana 2 Lite'
const COLS = 5, TILE_W = 82, TILE_H = 94, GAP = 10;
const COL_X = 74, COL_W = COLS * TILE_W + (COLS - 1) * GAP;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #15191d; color: #e8eaed; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(255, 255, 255, .08); }
.${P}-ic { fill: none; stroke: #c4c7c5; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-rl { position: absolute; left: 0; top: 0; bottom: 0; width: 26px; background: #111417; box-shadow: 1px 0 0 #23282c; }
.${P}-rl svg { position: absolute; left: 7px; width: 12px; height: 12px; }
.${P}-tb { position: absolute; left: ${COL_X}px; top: 15px; display: flex; align-items: center; gap: 15px; margin: 0; font-size: 8px; line-height: 14px; color: #bdc1c6; white-space: nowrap; }
.${P}-tb span { display: flex; align-items: center; gap: 3px; }
.${P}-tb svg { width: 6px; height: 6px; stroke-width: 1.6; }
.${P}-tb .${P}-on { color: #ffffff; font-weight: 600; }
.${P}-hl { position: absolute; left: 26px; right: 0; top: 36px; height: 1px; background: #2e3134; }
.${P}-sw { position: absolute; left: 26px; right: 0; top: 35px; height: 3px; overflow: hidden; }
.${P}-sh { position: absolute; top: 0; height: 3px; width: 62%; }
.${P}-ub { position: absolute; right: 36px; top: 54px; box-sizing: border-box; width: 172px; padding: 7px 9px; border-radius: 9px; background: #202428; font-size: 7.8px; line-height: 11px; color: #e8eaed; margin: 0; }
.${P}-cp { position: absolute; left: ${COL_X}px; top: 99px; margin: 0; font-size: 8.4px; line-height: 12px; color: #e8eaed; white-space: nowrap; }
.${P}-cp i { font-style: normal; color: #bdc1c6; }
.${P}-db { position: absolute; left: ${COL_X}px; top: 96px; box-sizing: border-box; width: 36px; height: 20px; border-radius: 10px; background: #202428; display: flex; align-items: center; justify-content: center; gap: 4px; }
.${P}-db i { display: block; width: 4px; height: 4px; border-radius: 50%; background: #9aa0a6; }
.${P}-g { position: absolute; left: ${COL_X}px; top: 118px; display: grid; grid-template-columns: repeat(${COLS}, ${TILE_W}px); grid-auto-rows: ${TILE_H}px; gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TILE_W}px; height: ${TILE_H}px; border-radius: 8px; overflow: hidden; background: #202428; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #1e2226; }
.${P}-cm { position: absolute; left: ${COL_X}px; top: 337px; box-sizing: border-box; width: ${COL_W}px; height: 26px; border-radius: 13px; background: #1e2226; box-shadow: inset 0 0 0 1px #2e3134; }
.${P}-cm svg { position: absolute; left: 10px; top: 8px; width: 10px; height: 10px; }
.${P}-ph { position: absolute; left: 28px; top: 0; margin: 0; font-size: 7.8px; line-height: 26px; color: #9aa0a6; white-space: nowrap; }
.${P}-cc { position: absolute; right: 8px; top: 5px; height: 16px; box-sizing: border-box; padding: 0 8px; border-radius: 8px; background: #2c3136; margin: 0; font-size: 7px; line-height: 16px; color: #e8eaed; white-space: nowrap; }
.${P}-ft { position: absolute; left: ${COL_X}px; width: ${COL_W}px; top: 367px; margin: 0; text-align: center; font-size: 5.6px; line-height: 8px; color: #80868b; white-space: nowrap; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const DOTS = 0.3;                                  // the three-dot composing bubble hands over to the caption
const DONE = 1.0;                                  // the caption becomes 'Here's your generated image.', the sweep is gone
const LAND = Array.from({ length: 10 }, (_, i) => 1.06 + i * (0.62 / 9));  // picture i lands (strict reading order), the last at 1.68
const SWEEP = 1.15;                                // the sweep head's travel across the bar, bar widths per layout second
const HUE = 150;                                   // the sweep's hue rotation, degrees per layout second

const PROMPT = 'Please create ten Muse memes, one picture each.';
const f1 = (v) => v.toFixed(1);
const TABS = ['All', 'Images', 'Videos', 'News'];
const CARET = `<svg class="${P}-ic" viewBox="0 0 10 10"><path d="M2 3.6 5 6.6 8 3.6"/></svg>`;

export default {
  id: 'google-search-create-images-2026',
  label: 'Google Search AI Mode image (2025)',
  source: {
    platform: "Google Search (google.com) in AI Mode (udm=50) in desktop Chrome on Windows, dark OS theme (and a light-theme clip six months later), English UI, 1280x720 screen recordings from third-party YouTube walkthroughs",
    feature: "image creation inside the AI Mode conversation: the submitted prompt becomes a right-aligned bubble; a small assistant bubble with three grey composing dots is replaced by the single status caption 'Generating image with Nano Banana' (the model token names whichever image model Search routed to: the 2026-08 light clip reads 'Nano Banana 2 Lite') while an indeterminate multicolour gradient sweep runs along the top edge under the tab strip; then the caption is replaced by 'Here's your generated image.' with the finished image under it and the sweep gone; no placeholder tile, skeleton, percentage or ETA anywhere",
    capture: {
      url: 'https://www.youtube.com/watch?v=WSbevSn8j1o',
      date: '2025-12-19',
      timestamps: "video WSbevSn8j1o 'Create Images In Google Search in AIMode (Ro Drop)' (dark): idle t = 33-35 s, submitted prompt + 'Generating image with Nano Banana' + top-edge sweep t = 36-43 s (frames bq_gsc_wait_t38, bq_gsc_wait_t42: the caption identical, the sweep blue->green then red->purple->teal), 'Here's your generated image.' with the finished image t = 44 s (bq_gsc_done_t44); video sv02B5IhuhY (2026-08-06, light): three-dot bubble t = 48-49 s, 'Generating image with Nano Banana 2 Lite' t = 50 s (bq_gsc_nano2lite_t50), 'Here's your generated image.' t = 52 s (bq_gsc_nano2lite_done_t52)",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=WSbevSn8j1o', published: '2025-12-19', retrieved: '2026-10-15', note: "the dark capture: the user bubble, the caption 'Generating image with Nano Banana' byte-stable for 8 s, the top-edge colour sweep, the landing line 'Here's your generated image.'; top-edge average colours sampled per second in the spec" },
      { url: 'https://www.youtube.com/watch?v=sv02B5IhuhY', published: '2026-08-06', retrieved: '2026-10-15', note: "the light capture: the composing dots bubble, then 'Generating image with Nano Banana 2 Lite', then 'Here's your generated image.'" },
    ],
    extrapolated: [
      "ten pictures from one: the recording lands ONE finished image card under 'Here's your generated image.'; here ten of our memes are laid as a compact 5 x 2 grid under that line, landing in strict reading order",
      "all timing: the recording's wait is about 8 s (dark) or 2 s (light); here the dots, the caption and the landing share the 1.84 s beat, the pictures landing 0.07 s apart",
      "the dark slots between 'Here's your generated image.' and each picture: the recording shows the image card appear as a dark rounded box before it paints; here ten such boxes appear when the line changes and each is replaced in place by its picture",
      "the sweep: the recording samples its average colour per second (rgb 79,46,45 -> 64,74,51 -> 36,55,71 -> 33,46,74 ...) and shows a hue-rotating band that travels left to right; here a bright head crosses the bar while its hue turns, both pure functions of t, and the bar disappears when the line changes",
      "the user prompt, 'Describe your image' / 'Create Images' composer strings and the disclaimer line are the page's own idle strings; the prompt wording is ours; the Google 'G' mark and the browser chrome are omitted",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'google-search-create-images-2026');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-rl"><svg class="${P}-ic" viewBox="0 0 12 12" style="top: 50px"><path d="M9.6 6.8V9.6a1 1 0 0 1-1 1H2.4a1 1 0 0 1-1-1V3.4a1 1 0 0 1 1-1h2.8M4.2 8l.4-1.8 4.6-4.6a1 1 0 0 1 1.4 1.4L6 7.6Z"/></svg>`
      + `<svg class="${P}-ic" viewBox="0 0 12 12" style="top: 75px"><path d="M1.6 6a4.4 4.4 0 1 0 1.4-3.2L1.6 4.2M1.6 1.8v2.4h2.4M6 3.6V6l1.6 1"/></svg></div>`
      + `<p class="${P}-tb"><span class="${P}-on">AI Mode${CARET}</span>${TABS.map((n) => `<span>${n}</span>`).join('')}<span>More${CARET}</span></p>`
      + `<div class="${P}-hl"></div><div class="${P}-sw"><div class="${P}-sh"></div></div>`
      + `<p class="${P}-ub">${PROMPT}</p>`
      + `<div class="${P}-db"><i></i><i></i><i></i></div>`
      + `<p class="${P}-cp"></p>`
      + `<div class="${P}-g">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-cm"><svg class="${P}-ic" viewBox="0 0 10 10"><path d="M5 1.5v7M1.5 5h7"/></svg><p class="${P}-ph">Describe your image</p><p class="${P}-cc">Create Images</p></div>`
      + `<p class="${P}-ft">AI-generated, may include mistakes. Don't enter sensitive personal info.</p>`
      + `</div>`);
    const sw = root.querySelector(`.${P}-sw`);
    const sh = root.querySelector(`.${P}-sh`);
    const db = root.querySelector(`.${P}-db`);
    const dots = [...db.querySelectorAll('i')];
    const cp = root.querySelector(`.${P}-cp`);
    const grid = root.querySelector(`.${P}-g`);
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
        const done = s >= DONE;
        const stage = done ? 2 : s >= DOTS ? 1 : 0;    // 0 composing dots, 1 the caption, 2 the landing line and the results

        // the dots bubble, the caption, then the landing line; the top-edge sweep runs until the line changes
        put('st', stage, (v) => {
          db.style.visibility = v === 0 ? '' : 'hidden';
          cp.style.visibility = v === 0 ? 'hidden' : '';
          cp.innerHTML = v === 2 ? "Here's your generated image." : `Generating image with <i>${MODEL}</i>`;
          grid.style.visibility = v === 2 ? '' : 'hidden';
          sw.style.visibility = v === 2 ? 'hidden' : '';
        });
        // the sweep and the dots are frozen at DONE (hidden then), so a landed block is the same DOM whatever came before
        const te = Math.min(s, DONE);
        put('sw', f1((te * HUE) % 360), (v) => {
          const c = (d, a) => `hsl(${(parseFloat(v) + d) % 360} 78% 58% / ${a})`;
          sh.style.background = `linear-gradient(90deg, ${c(0, 0)} 0%, ${c(0, 0.95)} 30%, ${c(70, 0.95)} 62%, ${c(140, 0)} 100%)`;
          sw.style.background = c(70, 0.2);
          sw.style.boxShadow = `0 3px 9px ${c(35, 0.2)}`;
        });
        put('sp', f1(((te * SWEEP) % 1.62 - 0.62) * 100), (v) => { sh.style.left = `${v}%`; });
        dots.forEach((d, i) => put(`d${i}`, f1(0.35 + 0.65 * Math.abs(Math.sin((Math.min(te, DOTS) * 4 - i * 0.28) * Math.PI / 1.5))), (v) => { d.style.background = `rgba(154, 160, 166, ${v})`; }));

        cells.forEach((c, i) => {
          const landed = s >= LAND[i];
          // a dark slot until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, landed, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
