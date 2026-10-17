// Padlet 'I can't draw' (2025): the wait of the AI picture dialog on a Padlet board, from the TeacherTrainingVideos screen recording
// https://www.youtube.com/watch?v=HOYXpYZ79qs (2025-01-10, 1920x1080; frames reveal-refs/padlet-ai-image/frames/padlet_hoyx_t{196_pre_submit,197.5_pending_a,201_pending_b,206.5_pending_c,207.5_tiles,208_partial,209_landed}.png,
// spec .tmp/clone-9e82faf1/reveal-refs/padlet-ai-image/spec.json, confidence 0.6; the 2024-02-15 light-theme run 83paj9mF5zw corroborates). The whole screen is a Padlet board
// ('Draw your dream house') dimmed under a purple-grey scrim (#4b434e), with the post composer open at the right ('Muse Studio', the 'I can't draw' attachment tile, a 'Publish' pill)
// and a centred black modal over it: a header row (back chevron, the prompt field with 'Clear', a round arrow) above an empty body. The wait is that body: a thin ring with a short
// amber arc turning at its centre, the bold line 'Drawing your words...' over 'This may take up to a minute'; the body is then replaced in one frame by flat pastel colour blocks
// (salmon, periwinkle, mint, yellow) that are each hard-swapped for a finished picture, one at a time. Everything is redrawn in plain boxes and line glyphs; every picture is OUR meme;
// the Padlet wordmark, the burned-in subtitles, the yellow cursor disc and the board's breadcrumb are omitted; system UI face.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-pdl';
const ROOT_W = 560, ROOT_H = 440;
const M_L = 98, M_T = 104, M_W = 364, M_H = 204;                 // the centred modal
const PAD = 14, FLD_H = 26, G_T = 54, T_S = 63, G_X = 5;          // the grid: 5 columns x 2 rows of square tiles inside the modal body
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #f3f1f6; color: #ffffff; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .14); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ttl { position: absolute; left: 16px; top: 18px; font-size: 11.5px; line-height: 16px; font-weight: 700; color: #2a2630; }
.${P}-pc { position: absolute; box-sizing: border-box; border-radius: 4px; background: #ffffff; border: 1px solid #e4e0ea; }
.${P}-rl { position: absolute; border-radius: 50%; background: #d9d4e0; }
.${P}-fab { position: absolute; right: 12px; top: 408px; width: 22px; height: 22px; border-radius: 50%; background: #2f6fed; }
.${P}-fab svg { position: absolute; left: 5px; top: 5px; width: 12px; height: 12px; stroke: #ffffff; stroke-width: 2.4; }
.${P}-cp { position: absolute; left: 468px; top: 226px; box-sizing: border-box; width: 84px; height: 174px; border-radius: 8px; background: #25232a; }
.${P}-cp svg.${P}-g { position: absolute; top: 9px; width: 7px; height: 7px; stroke: #8f8c96; stroke-width: 2.2; }
.${P}-pub { position: absolute; left: 44px; top: 6px; box-sizing: border-box; width: 34px; height: 12px; border-radius: 6px; background: #e8456b; font-size: 5.4px; line-height: 12px; text-align: center; color: #ffffff; font-weight: 600; }
.${P}-nm { position: absolute; left: 8px; top: 28px; font-size: 7.4px; line-height: 10px; font-weight: 700; color: #d8d6dc; }
.${P}-at { position: absolute; left: 6px; top: 46px; box-sizing: border-box; width: 72px; height: 52px; border-radius: 4px; background: #2f2d35; }
.${P}-at svg { position: absolute; left: 12px; top: 21px; width: 9px; height: 9px; stroke: #4fb985; stroke-width: 1.8; }
.${P}-at p { position: absolute; left: 24px; top: 21px; font-size: 5.6px; line-height: 9px; color: #b9b6c0; }
.${P}-sc { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; background: rgba(32, 24, 38, .8); }
.${P}-mo { position: absolute; left: ${M_L}px; top: ${M_T}px; box-sizing: border-box; width: ${M_W}px; height: ${M_H}px; border-radius: 12px; background: #111111; overflow: hidden; }
.${P}-bk { position: absolute; left: ${PAD}px; top: ${PAD + 8}px; width: 10px; height: 10px; stroke: #b9b9be; stroke-width: 2.2; }
.${P}-fl { position: absolute; left: 36px; top: ${PAD}px; box-sizing: border-box; width: 285px; height: ${FLD_H}px; border-radius: ${FLD_H / 2}px; background: #232326; }
.${P}-pt { position: absolute; left: 11px; top: 0; font-size: 7.6px; line-height: ${FLD_H}px; color: #f1f1f3; }
.${P}-cl { position: absolute; right: 11px; top: 0; font-size: 8px; line-height: ${FLD_H}px; font-weight: 700; color: #c4c4c9; }
.${P}-ar { position: absolute; left: 330px; top: ${PAD}px; width: ${FLD_H}px; height: ${FLD_H}px; }
.${P}-ar svg { position: absolute; left: 8px; top: 8px; width: 10px; height: 10px; stroke: #77777c; stroke-width: 2.2; }
.${P}-ld { position: absolute; left: 0; top: ${G_T}px; width: ${M_W}px; height: ${M_H - G_T}px; }
.${P}-rg { position: absolute; left: ${(M_W - 30) / 2}px; top: 38px; width: 30px; height: 30px; }
.${P}-c1 { position: absolute; left: 0; width: ${M_W}px; top: 76px; text-align: center; font-size: 8.6px; line-height: 12px; font-weight: 700; color: #ffffff; }
.${P}-c2 { position: absolute; left: 0; width: ${M_W}px; top: 90px; text-align: center; font-size: 7px; line-height: 10px; color: #d0d0d4; }
.${P}-gd { position: absolute; left: ${PAD}px; top: ${G_T}px; display: grid; grid-template-columns: repeat(5, ${T_S}px); column-gap: ${G_X}px; row-gap: ${G_X}px; }
.${P}-t { position: relative; width: ${T_S}px; height: ${T_S}px; overflow: hidden; border-radius: 4px; background: #111111; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const PAS = 0.95;                                  // layout seconds: the spinner body ends, the pastel blocks stand (footage: ~10 s of spinner, then the blocks in one frame)
const LAND = Array.from({ length: 10 }, (_, i) => 1.12 + i * (0.72 / 9));   // block i is replaced by its picture (strict reading order), the last at 1.84
const SPIN = 0.8;                                  // layout seconds per spinner turn (turn period not measured)
const PASTEL = ['#FFA0A5', '#677DFF', '#B5F7BD', '#FFD958'];   // pink, blue, green, yellow, cycling over the ten blocks
const PROMPT = 'A lovely house in the Cotwolds with a river at';
const NAME = 'Muse Studio';

const ICON = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  exp: '<path d="M7 17L17 7M10 7h7v7"/>',
  min: '<path d="M6 12h12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  spark: '<path d="M9 2.5l1.7 4.8 4.8 1.7-4.8 1.7L9 15.5l-1.7-4.8L2.5 9l4.8-1.7zM17.5 12.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/>',
};
const SVG = (cls, body, style, vb) => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="${vb || '0 0 24 24'}">${body}</svg>`;

export default {
  id: 'padlet-ai-image',
  label: "Padlet I can't draw (2025)",
  source: {
    platform: "Padlet web app (padlet.com, signed-in account, dark theme) on a free-form board with the post composer open at the right; desktop Chrome, third-party screen recording at 1920x1080 (2560x1440 source)",
    feature: "The post composer's attachment 'I can't draw' (named 'AI Image' since March 2025): a centred modal over the dimmed board with the prompt field (back chevron, 'Clear', a round arrow) on top; pressing the arrow swaps the body for a ring spinner with the bold line 'Drawing your words...' over 'This may take up to a minute'; about 10 s later the body becomes four flat pastel colour blocks (salmon, periwinkle, mint, yellow) that are hard-swapped for the finished pictures one at a time",
    capture: {
      url: 'https://www.youtube.com/watch?v=HOYXpYZ79qs',
      page: 'https://www.youtube.com/watch?v=HOYXpYZ79qs',
      date: '2025-01-10',
      retrieved: '2026-10-17',
      timestamps: "t = 196.0 s pre-submit (the example image, cursor on the arrow); t = 197.0-207.2 s PENDING, ~10.2 s continuous, the modal body empty near-black with a thin ring + short amber arc turning, 'Drawing your words...' / 'This may take up to a minute' (padlet_hoyx_t197.5_pending_a, _t201_pending_b, _t206.5_pending_c); t = 207.4-207.6 s the body replaced by four flat blocks #FFA0A5 / #677DFF / #B5F7BD / #FFD958 (padlet_hoyx_t207.5_tiles); t = 207.6-208.8 s the blocks hard-swapped for pictures, bottom-left at 207.6, bottom-right 207.8, top-right ~208.6, top-left 208.8 (padlet_hoyx_t208_partial); t = 209 s all four landed (padlet_hoyx_t209_landed). Light-theme corroboration 83paj9mF5zw (2024-02-15) t = 55-61.5 s: spinner ~4 s, blocks, landed",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=HOYXpYZ79qs', published: '2025-01-10', retrieved: '2026-10-17', note: 'New Padlet Features - AI drawing from a description tool (TeacherTrainingVideos Short Videos)' },
      { url: 'https://www.youtube.com/watch?v=83paj9mF5zw', published: '2024-02-15', retrieved: '2026-10-17', note: 'Teachers: Create AI Images Easily with Padlet (Tech Fix: Technology and Teaching), light theme' },
    ],
    extrapolated: [
      "the landing: the footage lands FOUR pictures in a 2x2 grid in a modal that grows taller (~510 -> ~670 px at 1920 wide) and swaps them bottom-left, bottom-right, top-right, top-left (the 2024 run began bottom-right: arrival order); here ten pictures replace ten pastel blocks in a 5x2 grid in one modal of a fixed height, in strict reading order",
      "the blocks: four flat colours in the footage (salmon, periwinkle, mint, yellow); here the same four cycle over the ten blocks in reading order, each replaced hard (no cross-fade), as in the footage",
      "the pace: the footage waits ~10 s on the spinner and swaps the pictures over ~1.4 s; the beat plays it in the same ~1.8 s window every module of this family uses, the spinner ending at about half of it",
      "the spinner: a thin grey ring with a short amber arc turning in place, one turn per 0.8 s of the layout clock (period not measured), its angle a pure function of t; the arc colour is the dark capture's (the light capture's is blue-violet)",
      "the size and the page: the footage modal is ~607 px of a 1920 px frame; here the screen is redrawn at 560 px wide with a 364 px modal and 63 px tiles so ten fit, the composer a narrow card at the right (chrome redrawn, not a scaled copy); the board shows plain boxes for posts, its own text is the title only",
      "the composer and author: the footage shows the recorder's own name in the composer, here the placeholder 'Muse Studio'; the prompt is the footage's own text (it reads 'Cotwolds' on screen), clipped in the field as in the frame",
      "omitted from the footage: the burned-in white-on-blue subtitles, the yellow cursor-highlight disc and hand cursor, the Padlet wordmark and the board's breadcrumb, the example image and its 'Try this example' (pre-submit only)",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'padlet-ai-image');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv" style="background: ${PASTEL[i % 4]}"></div></div></div>`;
    const post = (l, t, w, h) => `<div class="${P}-pc" style="left: ${l}px; top: ${t}px; width: ${w}px; height: ${h}px"></div>`;
    const dot = (t) => `<div class="${P}-rl" style="left: 543px; top: ${t}px; width: 6px; height: 6px"></div>`;
    const root = x.el(`<div class="${P}">`
      + `<p class="${P}-ttl">Draw your dream house</p>`
      + post(16, 64, 76, 58) + post(16, 134, 76, 92) + post(16, 340, 120, 76) + post(146, 340, 120, 76) + post(276, 340, 120, 76) + post(468, 64, 70, 80)
      + `<div class="${P}-rl" style="left: 540px; top: 8px; width: 12px; height: 12px; background: #e0a39c"></div>` + dot(40) + dot(58) + dot(76) + dot(94)
      + `<div class="${P}-cp">${SVG(`${P}-g`, ICON.x, 'left: 8px')}${SVG(`${P}-g`, ICON.exp, 'left: 20px')}${SVG(`${P}-g`, ICON.min, 'left: 32px')}<p class="${P}-pub">Publish</p>`
      + `<p class="${P}-nm">${NAME}</p><div class="${P}-at">${SVG('', ICON.spark)}<p>I can't draw</p></div></div>`
      + `<div class="${P}-fab">${SVG('', ICON.plus)}</div>`
      + `<div class="${P}-sc"></div>`
      + `<div class="${P}-mo">${SVG(`${P}-bk`, ICON.back)}`
      + `<div class="${P}-fl"><p class="${P}-pt">${PROMPT}</p><p class="${P}-cl">Clear</p></div><div class="${P}-ar">${SVG('', ICON.arrow)}</div>`
      + `<div class="${P}-ld"><svg class="${P}-rg" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" stroke="#3b3b3d" stroke-width="1.6"/><circle class="${P}-arc" cx="15" cy="15" r="13" stroke="#e8b22d" stroke-width="1.6" stroke-dasharray="20 61.7"/></svg>`
      + `<p class="${P}-c1">Drawing your words...</p><p class="${P}-c2">This may take up to a minute</p></div>`
      + `<div class="${P}-gd">${tiles.map(cell).join('')}</div>`
      + `</div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const ld = q('ld'), gd = q('gd'), arc = q('arc');
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
        const pending = s < PAS;                       // the spinner body; the pastel blocks and pictures after it
        const ang = pending ? Math.round(((s / SPIN) % 1) * 360) : 0;   // spinner angle, a pure function of s while the spinner shows

        put('ph', pending, (v) => { ld.style.visibility = v ? '' : 'hidden'; gd.style.visibility = v ? 'hidden' : ''; });
        put('a', ang, (v) => { arc.setAttribute('transform', `rotate(${v} 15 15)`); });
        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
