// eBay app AI backgrounds (2024): the iOS seller app's photo editor 'Background' sheet, from Millennial Profit's screen recording
// https://www.youtube.com/watch?v=WT4Y1NmIqjk (2024-07-22, 1920x1080, the phone strip at x 0-605; frames reveal-refs/ebay-ai-background/frames/ebay_phone_t79.5.png,
// ebay_phone_t82.0.png, ebay_phone_t84.4.png, ebay_phone_t103.5.png, spec .tmp/clone-9e82faf1/reveal-refs/ebay-ai-background/spec.json, confidence 0.55). The whole screen is
// a black phone page: the cut-out product at the top, 'Choose a solid color' over a 'White' row, 'Choose an AI-generated background' with a four-point sparkle over the three
// dark cards 'Studio' / 'Surface' / 'Outside' (each a small gradient preview). Tapping a card swaps the list for the results page: a grid of rounded tiles that each hold a
// veiled near-white lilac ghost of the cut-out (the product shape legible but pastel, as if a pale sheet lay over it) with a faint warm sheen drifting across them about every
// 1.5 s, a full-width 'Generate more' pill greyed under the grid and the 'Edit Scene' pencil link below it. The backgrounds then land at once, the pill turns white.
// Redrawn in plain boxes and glyphs; every picture is OUR meme; the eBay marks, the facecam, the subscribe overlay and the tap indicator are omitted.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-eab';
const ROOT_W = 560, ROOT_H = 344;
const PAD = 18, T = 100, GAP = 6, COLS = 5;               // the results grid: 5 x 2 square tiles across the page (524 px of 560)
const GRID_T = 14, PILL_T = 262, EDIT_T = 314;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #000; color: #fff; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(255, 255, 255, .14); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { display: block; }
.${P}-ct { position: absolute; left: 50%; top: 6px; width: 150px; height: 74px; margin-left: -75px; overflow: hidden; -webkit-mask-image: radial-gradient(ellipse at center, #000 54%, transparent 88%); mask-image: radial-gradient(ellipse at center, #000 54%, transparent 88%); }
.${P}-cz { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-ct img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-pg { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; }
.${P}-hd { position: absolute; left: ${PAD}px; display: flex; align-items: center; gap: 6px; font-size: 13px; line-height: 16px; font-weight: 700; letter-spacing: .1px; }
.${P}-hd svg { width: 14px; height: 14px; }
.${P}-rw { position: absolute; left: ${PAD}px; box-sizing: border-box; width: ${ROOT_W - 2 * PAD}px; height: 40px; border-radius: 10px; background: #17161a; border: 1px solid #3a393e; }
.${P}-sw { position: absolute; left: 7px; top: 4px; width: 56px; height: 30px; border-radius: 4px; overflow: hidden; }
.${P}-rw p { position: absolute; left: 76px; top: 0; font-size: 13px; line-height: 38px; font-weight: 500; }
.${P}-rs { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; }
.${P}-gd { position: absolute; left: ${PAD}px; top: ${GRID_T}px; display: grid; grid-template-columns: repeat(${COLS}, ${T}px); gap: ${GAP}px; }
.${P}-t { position: relative; width: ${T}px; height: ${T}px; overflow: hidden; border-radius: 10px; background: #000; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: rgba(226, 216, 231, .87); }
.${P}-sh { position: absolute; top: 0; bottom: 0; width: 46px; background: linear-gradient(100deg, rgba(255, 232, 222, 0), rgba(255, 232, 222, .34) 50%, rgba(255, 232, 222, 0)); }
.${P}-pl { position: absolute; left: ${PAD}px; top: ${PILL_T}px; box-sizing: border-box; width: ${ROOT_W - 2 * PAD}px; height: 38px; border-radius: 19px; background: #e4e1e6; color: #1c1b1d; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; font-weight: 700; }
.${P}-pl svg { width: 14px; height: 14px; }
.${P}-ed { position: absolute; left: 0; top: ${EDIT_T}px; width: ${ROOT_W}px; display: flex; align-items: center; justify-content: center; gap: 7px; font-size: 13px; line-height: 16px; font-weight: 500; }
.${P}-ed svg { width: 13px; height: 13px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const PEND = 0.22;                                 // a style card is tapped: the list gives way to the results page of veiled ghost tiles
const LAND0 = 1.40, STEP = 1 / 30;                 // the first background lands at 1.40 layout s, the other nine one frame step apart (reading order), the last at 1.70
const LAND = Array.from({ length: 10 }, (_, i) => LAND0 + i * STEP);
const SHEEN = 0.55;                                // layout seconds per drift of the sheen across the grid (the footage drifts about every 1.5 s)
const PILL_GREY = '#7f7d80', PILL_WHITE = '#e4e1e6';

// the four-point multicolour sparkle: the four quadrants of one star in blue, magenta, amber and teal (plain fills, no gradient reference)
const sparkle = () => '<svg viewBox="0 0 24 24"><path d="M12 1.5C12.9 8 16 11.1 22.5 12H12z" fill="#d946ef"/><path d="M22.5 12C16 12.9 12.9 16 12 22.5V12z" fill="#f59e0b"/><path d="M12 22.5C11.1 16 8 12.9 1.5 12H12z" fill="#14b8a6"/><path d="M1.5 12C8 11.1 11.1 8 12 1.5V12z" fill="#3b82f6"/></svg>';
const PENCIL = '<svg viewBox="0 0 24 24"><path d="M4 20l1-4.5L16.5 4a2 2 0 0 1 3 0l.5.5a2 2 0 0 1 0 3L8.5 19zM14.5 6l3.5 3.5"/></svg>';

// the swatch previews are plain gradients, never footage images
const SWATCH = {
  White: 'background: #ffffff',
  Studio: 'background: radial-gradient(circle at 50% 46%, #ffffff 0, #f3f3f3 13px, rgba(255, 255, 255, 0) 14px), linear-gradient(180deg, #dcdcdc, #cdcdcd)',
  Surface: 'background: linear-gradient(180deg, #fafafa 0%, #f1efef 56%, #b98f68 57%, #a97e56 100%)',
  Outside: 'background: linear-gradient(180deg, #e9d8b0 0%, #cfd6b4 34%, #7c9a5c 35%, #4f7a3c 70%, #8a8b72 71%, #6e6f5a 100%)',
};

export default {
  id: 'ebay-ai-background',
  label: 'eBay AI backgrounds (2024)',
  source: {
    platform: "eBay iOS seller app (2024-07 build), the photo editor's 'Background' sheet, a black phone page; portrait screen recording, third-party creator video (Millennial Profit) at 1920x1080 with the phone strip at x 0-605",
    feature: "Background generation for a cut-out product photo: tapping a style card ('Studio', 'Surface' or 'Outside') under 'Choose an AI-generated background' swaps the list for a 2x2 grid of rounded tiles that each show a veiled near-white lilac ghost of the cut-out, a faint warm sheen drifting across them about every 1.5 s, the 'Generate more' pill greyed with a small sparkle and the 'Edit Scene' pencil link under it; about 3.4 s later the tiles land at once and the pill turns white",
    capture: {
      url: 'https://www.youtube.com/watch?v=WT4Y1NmIqjk',
      page: 'https://www.youtube.com/watch?v=WT4Y1NmIqjk',
      date: '2024-07-22',
      retrieved: '2026-10-17',
      timestamps: "t = 79.5 s the sheet idle ('Choose a solid color' over 'White', 'Choose an AI-generated background' over 'Studio' / 'Surface' / 'Outside', ebay_phone_t79.5); t = 80.6-84.0 s PENDING, uncut, 3.4 s, the first generation: a 2x2 grid of ghost tiles, the grey 'Generate more' pill and 'Edit Scene' (ebay_phone_t80.3, t80.9, t82.0, t83.4); the sheen shifts the mean tile colour (222,213,224) -> (224,214,219) at t = 82.3-82.5 and 83.8-84.0; t = 84.1 s the four backgrounds land at once, the pill white (ebay_phone_t84.4); t = 101.0-106.0 s 'Generate more' with results already there, five seconds, two new rows of ghost tiles under the first two landed backgrounds (ebay_phone_t101.5, t103.5, t105.5)",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=WT4Y1NmIqjk', published: '2024-07-22', retrieved: '2026-10-17', note: "eBay's AI background tool in the seller app, screen recording (Millennial Profit)" },
    ],
    extrapolated: [
      'the landing count: the footage lands FOUR tiles (2x2) and later four more under the first four; here ten tiles sit in a 5 x 2 grid across the page (the phone column redrawn as the full 560 px page so ten fit with no scroll) and every one of them shows its ghost while pending',
      "the landing order: the footage lands every tile in one frame; here the ten backgrounds land one frame step (1/30 of a layout second) apart in strict reading order, each a hard swap from its ghost, the 'Generate more' pill turning white once the tenth has landed",
      "the ghost: the footage veils the cut-out product on a lilac-grey tile; our pictures are full photographs, so each tile holds its own picture under a static near-white lilac veil on a cover (the pastel look comes from the veil, not from fading the picture), measured from the stills as a tile ground near #C9C1CC and a lightest ghost near #EBE6F0",
      "the sheen: the footage's warm drift is a barely visible mean-colour shift every ~1.5 s (it may be a compression artefact); here a soft warm band sweeps once across the whole grid every 0.55 layout seconds, its position a pure function of t, so it crosses the tiles in reading order",
      "the pace: the footage waits 3.4 s; the beat plays it in the same ~1.8 s window every module of this family uses",
      "the page: the footage's sheet is a 605 px phone strip with 568 px rows 108 px tall; here the same rows (cut-out, 'White', 'Studio', 'Surface', 'Outside') are redrawn at 40 px, the style previews as plain gradients (a sphere on grey, a wood table, hills), the cut-out as one of our pictures under a soft edge",
      "omitted from the footage: the eBay marks, the creator's facecam and branded backdrop, the subscribe overlay, the purple tap indicator, the iOS status bar, the 'Edit Scene' sheet and its colour chips, the second ('Generate more') batch of ghost rows",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'ebay-ai-background');
    const csrc = ownSrc(ctx.src, 'ebay-ai-background-cutout');   // the cut-out is a larger raster of the same picture: a URL of its own keeps their decode apart
    const g0 = tiles[0];
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div><div class="${P}-sh" style="visibility: hidden"></div></div>`;
    const row = (name, top) => `<div class="${P}-rw" style="top: ${top}px"><div class="${P}-sw" style="${SWATCH[name]}"></div><p>${name}</p></div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-pg">`
      + `<div class="${P}-ct"><div class="${P}-cz" style="transform-origin: ${g0.origin}; transform: ${restTransform(g0)}"><img src="${csrc}" width="870" height="1024" decoding="sync" alt="Product photo" style="filter: ${restFilter(g0)}"/></div></div>`
      + `<p class="${P}-hd" style="top: 88px">Choose a solid color</p>${row('White', 110)}`
      + `<div class="${P}-hd" style="top: 162px"><p>Choose an AI-generated background</p>${sparkle()}</div>${row('Studio', 184)}${row('Surface', 232)}${row('Outside', 280)}`
      + `</div>`
      + `<div class="${P}-rs" style="visibility: hidden">`
      + `<div class="${P}-gd">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-pl" style="background: ${PILL_GREY}">${sparkle()}<p>Generate more</p></div>`
      + `<div class="${P}-ed">${PENCIL}<p>Edit Scene</p></div>`
      + `</div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const pg = q('pg'), rs = q('rs'), pill = q('pl');
    const cutImg = q('ct').querySelector('img');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), sh: n.querySelector(`.${P}-sh`) }));
    ctx.gate([cutImg, ...cells.map((c) => c.im)]);

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const results = s >= PEND;                     // the list before, the results page from the tap on

        put('pg', results, (v) => { pg.style.visibility = v ? 'hidden' : ''; rs.style.visibility = v ? '' : 'hidden'; });
        put('pill', s >= LAND[9], (v) => { pill.style.background = v ? PILL_WHITE : PILL_GREY; });

        // the sheen: one warm band sweeping across the whole grid left to right, each tile showing its own slice of it
        const X = -50 + 640 * (((s / SHEEN) % 1 + 1) % 1);
        cells.forEach((c, i) => {
          const col = i % COLS, shown = results && s < LAND[i];
          put(`s${i}`, shown, (v) => { c.sh.style.visibility = v ? '' : 'hidden'; });
          const left = shown ? Math.round((X - col * (T + GAP)) * 2) / 2 : 0;   // at rest (0) whenever hidden, so the style is a function of t alone
          put(`x${i}`, left, (v) => { c.sh.style.left = `${v}px`; });
        });

        // 0: the list (picture and veil unseen), 1: the picture seen through its veil (the ghost), 2: the background landed, the veil gone; reading order
        cells.forEach((c, i) => {
          const state = !results ? 0 : s >= LAND[i] ? 2 : 1;
          put(`i${i}`, state, (v) => { c.im.style.visibility = v === 0 ? 'hidden' : ''; c.cv.style.display = v === 2 ? 'none' : ''; });
        });
      },
    };
  },
};
