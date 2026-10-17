// Dreamina, the 2025 web redesign of ByteDance / CapCut's image generator (dreamina.capcut.com/ai-tool/generate), read from two dated screen recordings
// (YouTube Pdl9mouF1Pw 2025-10-13 at t = 104-116 s, KgOXlC0t1cs 2025-11-04; frames reveal-refs/dreamina-2026/frames/bq_dre_{pill_t105,tiles_t106,done_t116}.png,
// spec .tmp/clone-9e82faf1/reveal-refs/dreamina-2026/spec.json, confidence 0.55). A near-black page: a slim left rail (Explore / Create / Assets / Canvas), the
// mode row 'AI Image | AI Video | AI Avatar', a results column that holds our prompt as a right-hand bubble with its reference thumbnail, and the composer card
// pinned under it (the thumbnail stack, the prompt, the chips 'AI Image' / 'Image 4.0' / '3:4 | Ultra (4K)' and a white round submit). Pressing Generate puts
// NO per-tile spinner or caption on the results: the tiles are large soft BLURRED colour-gradient fields (each tile its own muted hue mix, edge to edge with
// thin black seams, drifting slowly) and the wait is carried by one floating dark pill at the bottom of the results column: a rounded mini-tile holding a thin
// grey spinner arc, then '0/1' 'Generating...' and a bold 'Go to bottom' with a double chevron. The finished pictures replace the gradients in place and the
// pill goes with the last of them. Built 'dreamina' (the 2024 sparkle-tile page) is a different screen and is left alone.
// Omitted: the Dreamina / CapCut marks, the '0/image' composer counter, the model-card popover and the 'LIMITED-TIME / 7 Days Free' promo chrome (upsell and
// credits). Every picture is OUR meme; the thumbnails are drawn blocks, the type is the system UI face.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-d26';
const ROOT_W = 560, ROOT_H = 428;
const COLS = 5, TILE_W = 94, TILE_H = 125, GAP = 2;                        // 3:4 tiles abutting with thin black seams, five by two
const GRID_X = 58, GRID_Y = 74, GRID_W = COLS * TILE_W + (COLS - 1) * GAP;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #0b0d0f; color: #e9eaed; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(255, 255, 255, .07); }
.${P} p { margin: 0; }
.${P}-rl { position: absolute; left: 0; top: 0; bottom: 0; width: 40px; background: #0e1012; box-shadow: 1px 0 0 #181a1d; }
.${P}-ri { position: absolute; left: 0; width: 40px; height: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; font-size: 5.4px; line-height: 6px; color: #7d828b; }
.${P}-ri svg { flex: none; width: 10px; height: 10px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ri.${P}-on { color: #f4f5f7; }
.${P}-mr { position: absolute; left: ${GRID_X}px; width: ${GRID_W}px; top: 8px; height: 18px; display: flex; justify-content: center; align-items: center; gap: 14px; font-size: 7.6px; line-height: 18px; font-weight: 600; color: #777c85; white-space: nowrap; }
.${P}-mr .${P}-on { color: #f4f5f7; }
.${P}-bb { position: absolute; right: ${ROOT_W - GRID_X - GRID_W}px; top: 32px; box-sizing: border-box; height: 34px; max-width: 292px; display: flex; align-items: center; gap: 7px; padding: 0 10px 0 6px; border-radius: 10px; background: #1a1b1e; }
.${P}-bb p { font-size: 7.2px; line-height: 10px; color: #e6e7ea; }
.${P}-th { position: relative; flex: none; width: 22px; height: 26px; }
.${P}-th i { position: absolute; display: block; border-radius: 3px; box-sizing: border-box; }
.${P}-g { position: absolute; left: ${GRID_X}px; top: ${GRID_Y}px; width: ${GRID_W}px; display: grid; grid-template-columns: repeat(${COLS}, ${TILE_W}px); grid-auto-rows: ${TILE_H}px; gap: ${GAP}px; background: #000; }
.${P}-t { position: relative; width: ${TILE_W}px; height: ${TILE_H}px; overflow: hidden; background: #1a1b1f; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: -14px; right: -14px; top: -14px; bottom: -14px; background-color: #1c1d21; filter: blur(9px); }
.${P}-pl { position: absolute; right: ${ROOT_W - GRID_X - GRID_W}px; top: 337px; box-sizing: border-box; height: 28px; padding: 0 11px 0 32px; border-radius: 14px; background: #202227; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 12px rgba(0, 0, 0, .45); white-space: nowrap; }
.${P}-pm { position: absolute; left: -3px; top: -1px; width: 29px; height: 29px; border-radius: 8px; transform: rotate(-9deg); background: linear-gradient(155deg, #6f7a86 0%, #566170 55%, #3d4a62 100%); box-shadow: 0 0 0 1px rgba(255, 255, 255, .06); display: grid; place-items: center; }
.${P}-pm svg { display: block; width: 14px; height: 14px; }
.${P}-pm circle { fill: none; stroke: #c9ccd2; stroke-width: 1.3; stroke-linecap: round; }
.${P}-pc { font-size: 7.2px; line-height: 10px; color: #f4f5f7; }
.${P}-pg { font-size: 7.2px; line-height: 10px; color: #f4f5f7; }
.${P}-pb { display: flex; align-items: center; gap: 2px; margin-left: 4px !important; font-size: 7.2px; line-height: 10px; font-weight: 700; color: #959aa3; }
.${P}-pb svg { flex: none; width: 7px; height: 7px; fill: none; stroke: #959aa3; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-cp { position: absolute; left: ${GRID_X}px; width: ${GRID_W}px; top: 372px; height: 50px; box-sizing: border-box; border-radius: 10px; background: #17181b; box-shadow: inset 0 0 0 1px #212327; }
.${P}-cp .${P}-th { position: absolute; left: 9px; top: 8px; }
.${P}-ct { position: absolute; left: 44px; right: 40px; top: 9px; font-size: 7.4px; line-height: 11px; color: #e9eaed; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.${P}-cr { position: absolute; left: 44px; bottom: 6px; display: flex; gap: 4px; }
.${P}-cr span { box-sizing: border-box; height: 15px; padding: 0 6px; border-radius: 5px; background: #23252a; display: flex; align-items: center; gap: 3px; font-size: 6.4px; line-height: 15px; color: #c3c6cc; white-space: nowrap; }
.${P}-cr .${P}-ai { background: #11353a; color: #34cdd9; }
.${P}-cr svg { flex: none; width: 7px; height: 7px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-cr b { display: block; width: 1px; height: 7px; background: #3a3d44; }
.${P}-sb { position: absolute; right: 9px; bottom: 8px; width: 20px; height: 20px; border-radius: 50%; background: #f4f5f7; display: grid; place-items: center; }
.${P}-sb svg { width: 9px; height: 9px; fill: none; stroke: #111214; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const LAND = Array.from({ length: 10 }, (_, i) => 0.5 + i * (1.18 / 9));   // tile i hands its gradient over to its picture (strict reading order), the last at 1.68
const END = LAND[9];
const TURN = 400;                                  // the pill arc's travel, degrees per layout second
const PROMPT = 'a muse holding up a handwritten note in a lecture hall, meme style';
// each tile's own muted hue mix: three hues from the footage's washes (copper, steel blue, lilac-grey, mauve) at low saturation
const HUES = [[18, 332, 222], [205, 226, 168], [300, 22, 242], [34, 202, 352], [162, 262, 20], [340, 42, 212], [222, 150, 302], [10, 192, 282], [282, 52, 182], [92, 332, 212]];
const f1 = (v) => v.toFixed(1);
const wash = (i, te) => {
  const [a, b, c] = HUES[i];
  const x1 = 30 + 26 * Math.sin((te * 0.55 + i * 0.7) * Math.PI), y1 = 36 + 20 * Math.cos((te * 0.45 + i * 0.4) * Math.PI);
  const x2 = 72 + 22 * Math.cos((te * 0.5 + i * 0.9) * Math.PI), y2 = 62 + 24 * Math.sin((te * 0.6 + i * 0.3) * Math.PI);
  const x3 = 50 + 30 * Math.sin((te * 0.4 + i * 1.3) * Math.PI), y3 = 86 + 14 * Math.cos((te * 0.5 + i * 0.8) * Math.PI);
  return `radial-gradient(ellipse 85% 60% at ${f1(x1)}% ${f1(y1)}%, hsl(${a} 36% 46%), transparent 72%), radial-gradient(ellipse 70% 85% at ${f1(x2)}% ${f1(y2)}%, hsl(${b} 38% 40%), transparent 70%), radial-gradient(ellipse 90% 70% at ${f1(x3)}% ${f1(y3)}%, hsl(${c} 28% 30%), transparent 76%)`;
};
const R = 5.2, CIRC = 2 * Math.PI * R;
const arc = `<svg viewBox="0 0 14 14"><g class="${P}-ag"><circle cx="7" cy="7" r="${R}" stroke-dasharray="${(CIRC * 0.7).toFixed(2)} ${(CIRC * 0.3).toFixed(2)}"/></g></svg>`;
const chev = '<svg viewBox="0 0 10 10"><path d="M2 1.8 5 4.6 8 1.8M2 5.6 5 8.4 8 5.6"/></svg>';
const thumb = `<div class="${P}-th"><i style="left: 0; top: 3px; width: 16px; height: 20px; background: #3c3f46; transform: rotate(-12deg)"></i><i style="left: 3px; top: 2px; width: 16px; height: 21px; background: #555a63; transform: rotate(7deg)"></i>`
  + `<i style="left: 2px; top: 0; width: 17px; height: 22px; background: #f1ece6; box-shadow: 0 1px 3px rgba(0, 0, 0, .5)"></i><i style="left: 6px; top: 5px; width: 9px; height: 8px; border-radius: 50%; background: #d86a86"></i><i style="left: 5px; top: 14px; width: 11px; height: 3px; background: #b9b3ab"></i></div>`;
const RAIL = [
  ['Explore', '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.6"/><path d="M6.5 3.5 5.6 5.6 3.5 6.5 4.4 4.4Z"/></svg>'],
  ['Create', '<svg viewBox="0 0 10 10"><path d="M5 1.5 6 4 8.5 5 6 6 5 8.5 4 6 1.5 5 4 4Z"/></svg>'],
  ['Assets', '<svg viewBox="0 0 10 10"><rect x="1.6" y="2.4" width="6.8" height="5.4" rx="1"/><path d="M1.6 4.4h6.8M3.4 2.4v-.9h3.2v.9"/></svg>'],
  ['Canvas', '<svg viewBox="0 0 10 10"><rect x="1.6" y="1.6" width="6.8" height="6.8" rx="1.2"/><path d="M1.6 6.2 4 4l2 2 1-1 1.4 1.4"/></svg>'],
];

export default {
  id: 'dreamina-2026',
  label: 'Dreamina (2025 redesign)',
  source: {
    platform: "Dreamina by ByteDance / CapCut, the 2025 web app at dreamina.capcut.com/ai-tool/generate, desktop Chrome, signed in, English UI, captured from two third-party YouTube screen recordings",
    feature: "text-to-image with a reference image on the redesigned dark page: the prompt collapses into a right-hand bubble with its reference thumbnail, the results column fills with large blurred colour-gradient tiles (each its own muted hue mix, no spinner, caption or percentage on a tile) and a floating dark pill at the bottom of the column carries the wait: a rounded mini-tile with a thin grey spinner arc, '0/1', 'Generating...' and a bold 'Go to bottom' with a double chevron; the finished pictures replace the gradients in place and the pill goes",
    capture: {
      url: 'https://www.youtube.com/watch?v=Pdl9mouF1Pw',
      date: '2025-10-13',
      timestamps: "video Pdl9mouF1Pw '3 Creative Ways To Use Seedream 4.0 for Photos! Dreamina Tutorial' (1280x720 screen recording of dreamina.capcut.com/ai-tool/generate): composer with chips 'AI Image / Image 4.0 / 1:1 / High (2K)' t = 50-58 s, 'click on Generate' t = 76 s, the floating pill '0/1 Generating... Go to bottom' with the spinner mini-tile t = 104-105 s (frame bq_dre_pill_t105), the blurred gradient result tiles above the composer with the chips 'AI Image / Image 4.0 / 3:4 / Ultra (4K)' t = 106 s (frame bq_dre_tiles_t106), the finished picture t = 116 s (frame bq_dre_done_t116); video KgOXlC0t1cs (Zeven 7, 2025-11-04) shows the same page and the model card list 'Image 4.0 / Nano Banana / Image 3.1 / Image 3.0'",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=Pdl9mouF1Pw', published: '2025-10-13', retrieved: '2026-10-15', note: "the pending pill ('0/1 Generating... Go to bottom', rounded mini-tile with a thin grey arc), the blurred colour-gradient tiles with thin black seams and the chips row; t = 104-116 s" },
      { url: 'https://www.youtube.com/watch?v=KgOXlC0t1cs', published: '2025-11-04', retrieved: '2026-10-15', note: 'the same generate page and chips on a second recording, confirming the layout and the model list' },
    ],
    extrapolated: [
      "ten tiles from one: the footage's batch is a single image (counter '0/1') shown as a row of three or four wide gradient fields; here ten equal 3:4 tiles sit in a 5 x 2 block with the footage's thin black seams, all in view with no scroll",
      "the pill counter reads 'N/10' and counts up as the pictures land (the footage never moved off '0/1': one image, sampled at 1 fps over ~2 s), and the pill goes at the last landing as the footage's pill goes at completion",
      "all timing: the footage's wait is ~10-12 s on screen, here the ten pictures land 0.13 s apart in strict reading order over the beat's window; the tile-by-tile landing order is ours (the footage shows one finished image)",
      "the drift of the gradients and the arc's rotation are pure functions of t at rates of our own choosing (the footage's blur is only seen to be soft and slowly changing; the arc's speed was not sampled); each tile's hue mix is our own muted variation on the footage's copper / steel-blue / lilac washes",
      "the rail icons, the mode row positions and the thumbnail stack are redrawn blocks and glyphs of our own (no brand artwork); the reference thumbnail is a drawn block, not the footage's T-shirt picture; the prompt line is our own wording",
      "the composer's right-hand counter ('0/image') and the 'Generate video' / 'Edit on canvas' chrome are left out: a credit-style count and promo",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'dreamina-2026');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-rl">${RAIL.map(([n, g], i) => `<div class="${P}-ri${n === 'Create' ? ` ${P}-on` : ''}" style="top: ${46 + i * 36}px">${g}<span>${n}</span></div>`).join('')}</div>`
      + `<div class="${P}-mr"><span class="${P}-on">AI Image</span><span>AI Video</span><span>AI Avatar</span></div>`
      + `<div class="${P}-bb">${thumb}<p>${PROMPT}</p></div>`
      + `<div class="${P}-g">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-pl"><div class="${P}-pm">${arc}</div><p class="${P}-pc"></p><p class="${P}-pg">Generating...</p><p class="${P}-pb">Go to bottom${chev}</p></div>`
      + `<div class="${P}-cp">${thumb}<p class="${P}-ct">${PROMPT}</p>`
      + `<div class="${P}-cr"><span class="${P}-ai"><svg viewBox="0 0 10 10"><rect x="1.4" y="1.8" width="7.2" height="6.4" rx="1.2"/><circle cx="4" cy="4.2" r=".9"/><path d="M1.6 7.4 4 5.8l1.6 1.2 1.2-.9 1.6 1"/></svg>AI Image<svg viewBox="0 0 10 10"><path d="M2.4 3.8 5 6.4 7.6 3.8"/></svg></span>`
      + `<span><svg viewBox="0 0 10 10"><path d="M5 1.2 8.4 3v4L5 8.8 1.6 7V3ZM5 1.2v3.6M1.6 3 5 4.8 8.4 3"/></svg>Image 4.0</span>`
      + `<span><svg viewBox="0 0 10 10"><rect x="2.8" y="1.4" width="4.4" height="7.2" rx="1"/></svg>3:4<b></b>Ultra (4K)</span></div>`
      + `<div class="${P}-sb"><svg viewBox="0 0 10 10"><path d="M5 8.2V1.8M2.2 4.4 5 1.6l2.8 2.8"/></svg></div></div>`
      + `</div>`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    const pill = root.querySelector(`.${P}-pl`);
    const pc = root.querySelector(`.${P}-pc`);
    const ag = root.querySelector(`.${P}-ag`);
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const sc = Math.min(s, END);                   // every moving part stops at the last landing
        let n = 0;
        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          if (done) n++;
          // a blurred gradient field until LAND[i], then a hard swap to the picture (never both, never neither); the blur is on the cover, never on the img
          put(`i${i}`, done, (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.cv.style.display = v ? 'none' : ''; });
          if (!done) put(`w${i}`, wash(i, sc), (v) => { c.cv.style.backgroundImage = v; });
        });
        // the floating pill: present exactly while a picture is still to come, the counter following the landings
        put('pill', n < 10, (v) => { pill.style.display = v ? '' : 'none'; });
        put('n', n, (v) => { pc.textContent = `${v}/10`; });
        put('ag', f1((sc * TURN) % 360), (v) => { ag.setAttribute('transform', `rotate(${v} 7 7)`); });
      },
    };
  },
};
