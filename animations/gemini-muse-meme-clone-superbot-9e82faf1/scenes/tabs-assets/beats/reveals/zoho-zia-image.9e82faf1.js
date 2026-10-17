// Zoho Zia image (2025): the wait of Zia's image-to-design conversion inside the Zoho CRM Canvas editor, read from Zoho's own YouTube walkthrough Xx2olyIXM54 (2025-05-19; wait un-cut
// t = 91-99 s; frame reveal-refs/zoho-zia-image/frames/am_zoho_generating.png, spec .tmp/clone-9e82faf1/reveal-refs/zoho-zia-image/spec.json, confidence 0.55). While pending the whole
// block is a dark charcoal takeover with no header, rail or logo: one small near-black rounded tile in the middle holding a miniature of the picture being converted, a thin teal
// determinate bar pinned at the tile's top edge, and one light-grey line centred under the tile that swaps in place ('Converting your image... Please wait.' -> 'Almost done! Generating
// image response.'). At the result the takeover lifts and a light CRM-style design editor shows a 5 x 2 design of the ten pictures, filling in strict reading order. Omitted: every
// Zoho / Zia logo and plan chrome. Every picture is OUR meme; system UI face only.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-zia';
const ROOT_W = 560, ROOT_H = 350;
const COLS = 5, TILE_W = 72, TILE_H = 96, GAP_X = 14, GAP_Y = 22;
const BAR_W = 48;                                   // the bar's full width in px: the fill is a whole number of px from t alone
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #eef1f5; color: #1f2933; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .1); }
.${P}-tk { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; background: #414143; }
.${P}-tl { position: absolute; left: ${(ROOT_W - 64) / 2}px; top: 124px; box-sizing: border-box; width: 64px; height: 64px; border-radius: 12px; background: #1c1f21; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .05); }
.${P}-tr { position: absolute; left: 8px; top: 8px; width: ${BAR_W}px; height: 2px; border-radius: 1px; background: rgba(255, 255, 255, .08); }
.${P}-br { position: absolute; left: 0; top: 0; height: 2px; width: 0; border-radius: 1px; background: #53c9a1; }
.${P}-mn { position: absolute; left: 10px; top: 17px; width: 44px; height: 34px; }
.${P}-cp { position: absolute; left: 0; right: 0; top: 207px; margin: 0; text-align: center; font-size: 11px; line-height: 14px; color: #d3d4d6; white-space: nowrap; }
.${P}-ed { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; background: #eef1f5; }
.${P}-hd { position: absolute; left: 0; right: 0; top: 0; height: 30px; background: #ffffff; box-shadow: inset 0 -1px 0 #dfe3e8; }
.${P}-hi { position: absolute; left: 12px; top: 8px; width: 14px; height: 14px; border-radius: 4px; background: #2f6fe4; }
.${P}-hi i { position: absolute; left: 3px; top: 3px; width: 8px; height: 8px; border-radius: 2px; background: #ffffff; }
.${P}-ht { position: absolute; left: 34px; top: 8px; margin: 0; font-size: 8.4px; line-height: 14px; font-weight: 600; color: #1f2933; white-space: nowrap; }
.${P}-pv { position: absolute; right: 64px; top: 7px; box-sizing: border-box; height: 16px; padding: 0 9px; border-radius: 8px; box-shadow: inset 0 0 0 1px #cfd5dc; margin: 0; font-size: 7.4px; line-height: 16px; color: #3e4c59; }
.${P}-sv { position: absolute; right: 12px; top: 7px; box-sizing: border-box; height: 16px; padding: 0 11px; border-radius: 8px; background: #2f6fe4; margin: 0; font-size: 7.4px; line-height: 16px; color: #ffffff; font-weight: 500; }
.${P}-lp { position: absolute; left: 0; top: 30px; bottom: 0; width: 104px; background: #f7f8fa; box-shadow: inset -1px 0 #dfe3e8; }
.${P}-lh { position: absolute; left: 12px; top: 12px; margin: 0; font-size: 6.6px; line-height: 9px; letter-spacing: .4px; color: #7b8794; }
.${P}-li { position: absolute; left: 10px; width: 84px; height: 22px; box-sizing: border-box; border-radius: 5px; background: #ffffff; box-shadow: inset 0 0 0 1px #e1e5ea; }
.${P}-li i { position: absolute; left: 6px; top: 6px; width: 10px; height: 10px; border-radius: 3px; background: #c5d6f6; }
.${P}-li p { position: absolute; left: 23px; top: 6px; margin: 0; font-size: 7.4px; line-height: 10px; color: #3e4c59; white-space: nowrap; }
.${P}-ab { position: absolute; left: 116px; top: 44px; box-sizing: border-box; width: 432px; height: 286px; border-radius: 6px; background: #ffffff; box-shadow: 0 0 0 1px #dfe3e8, 0 2px 6px rgba(31, 41, 51, .08); }
.${P}-at { position: absolute; left: 12px; top: 12px; margin: 0; font-size: 9px; line-height: 13px; font-weight: 600; color: #1f2933; white-space: nowrap; }
.${P}-g { position: absolute; left: 12px; top: 40px; display: grid; grid-template-columns: repeat(${COLS}, ${TILE_W}px); gap: ${GAP_Y}px ${GAP_X}px; }
.${P}-c { position: relative; width: ${TILE_W}px; height: ${TILE_H + 12}px; }
.${P}-t { position: relative; width: ${TILE_W}px; height: ${TILE_H}px; border-radius: 4px; overflow: hidden; background: #f1f3f6; box-shadow: 0 0 0 1px #dfe3e8; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #f4f6f9; }
.${P}-fl { position: absolute; left: 0; right: 0; bottom: 0; margin: 0; text-align: center; font-size: 6.2px; line-height: 9px; color: #7b8794; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const SWAP = 0.66;                                 // the caption swaps from 'Converting...' to 'Almost done!'
const OPEN = 0.98;                                 // the takeover lifts and the editor opens; the bar is full here
const LAND = Array.from({ length: 10 }, (_, i) => 1.04 + i * (0.64 / 9));  // picture i lands in the design (strict reading order), the last at 1.68

const CAPTIONS = ['Converting your image... Please wait.', 'Almost done! Generating image response.'];
const TITLE = 'Muse memes layout';
const ITEMS = ['Text', 'Image', 'Field', 'Button', 'List'];
// the miniature in the tile: three overlapping picture cards (blue sky, pale mountains, a yellow sun), all drawn from plain shapes
const MINI = `<svg class="${P}-mn" viewBox="0 0 44 34"><rect x="0" y="9" width="10" height="17" fill="#586272"/><rect x="34" y="9" width="10" height="17" fill="#5d6878"/>`
  + `<rect x="5" y="3" width="34" height="28" fill="#aac7ec"/><rect x="5" y="3" width="11" height="28" fill="#c3d9f4"/><rect x="16" y="3" width="11" height="28" fill="#b3cdee"/>`
  + `<circle cx="31" cy="10" r="2.6" fill="#f2e24b"/><circle cx="18" cy="13" r="1.6" fill="#dfe6a0"/>`
  + `<path d="M5 31V22L12 15 19 22 25 17 39 25V31Z" fill="#f1f5fb"/><path d="M28 31V25L39 25V31Z" fill="#c8cdd3"/></svg>`;

export default {
  id: 'zoho-zia-image',
  label: 'Zoho Zia image (2025)',
  source: {
    platform: "Zoho CRM web app, Canvas design editor, desktop browser, 1280x720 screen recording of Zoho's own first-party YouTube walkthrough, signed in to a Zoho CRM tenant",
    feature: "Zia image-to-design: the user picks a mockup file in a 'Choose a file' dialog and Zia converts it into an editable Canvas design. While it works the whole viewport is a dark charcoal takeover with no header, rail or logo: one small near-black rounded tile in the middle holds a miniature of the picture with a thin bright-green determinate bar pinned at its top edge, and one light-grey ~11 px line under the tile swaps in place from 'Converting your image... Please wait.' to 'Almost done! Generating image response.'; no percentage, spinner, ETA or cancel control exists. When it ends the takeover clears and the converted design is open in the editor",
    capture: {
      url: 'https://www.youtube.com/watch?v=Xx2olyIXM54',
      date: '2025-05-19',
      timestamps: "video Xx2olyIXM54 (wait un-cut): the 'Choose a file' dialog t = 84-86 s, the takeover with the tile, the bar and 'Converting your image... Please wait.' t = 91-96 s, 'Almost done! Generating image response.' t = 96-99 s (frame am_zoho_generating at t = 94.5 s), the design open in the editor t ~ 99-100 s",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=Xx2olyIXM54', published: '2025-05-19', retrieved: '2026-10-15', note: "Zia - AI Image to Design in Zoho CRM (Zoho, first-party): the wait un-cut, both captions read verbatim, the tile with its miniature and the bar" },
    ],
    extrapolated: [
      "all timing: the recording's wait runs ~8-9 s (one sample); here the pending takeover, the lift and the ten landings share the 1.84 s beat, the caption swapping at 66 % of the pending part",
      "the bar's fill: the recording shows the bar as a thin line near full width on the one kept frame; here it is a determinate fill from empty to full, linear in t, over the pending part (the percentage it tracks is unknown)",
      "the miniature: the recording shows a small three-card picture glyph in the tile; here it is a plain-shape drawing of three overlapping picture cards, not a live thumbnail of our meme",
      "the landed state: the recording lands one converted design in the Canvas editor and never holds on it; the editor chrome here (title bar with Preview and Save, an elements panel, the artboard), the artboard heading 'Muse memes layout' and the 'Field 1' .. 'Field 10' chips are our own, and the design holds ten pictures in a 5 x 2 grid, each blank pale until its picture lands, in strict reading order",
      "the Zoho / Zia logos, the CRM navigation and plan chrome are omitted; the takeover colour is read from the kept frame (#414143), the tile (#1c1f21) and the bar (green) likewise",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'zoho-zia-image');
    const cell = (g, i) => `<div class="${P}-c"><div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div><p class="${P}-fl">Field ${i + 1}</p></div>`;
    const item = (name, i) => `<div class="${P}-li" style="top: ${30 + i * 28}px"><i></i><p>${name}</p></div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-tk"><div class="${P}-tl"><div class="${P}-tr"><div class="${P}-br"></div></div>${MINI}</div><p class="${P}-cp"></p></div>`
      + `<div class="${P}-ed">`
      + `<div class="${P}-hd"><div class="${P}-hi"><i></i></div><p class="${P}-ht">${TITLE}</p><p class="${P}-pv">Preview</p><p class="${P}-sv">Save</p></div>`
      + `<div class="${P}-lp"><p class="${P}-lh">Elements</p>${ITEMS.map(item).join('')}</div>`
      + `<div class="${P}-ab"><p class="${P}-at">${TITLE}</p><div class="${P}-g">${tiles.map(cell).join('')}</div></div>`
      + `</div></div>`);
    const tk = root.querySelector(`.${P}-tk`);
    const ed = root.querySelector(`.${P}-ed`);
    const br = root.querySelector(`.${P}-br`);
    const cp = root.querySelector(`.${P}-cp`);
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
        const open = s >= OPEN;
        const px = Math.round(Math.min(s / OPEN, 1) * BAR_W);   // the bar's fill, a pure function of t

        // the takeover while pending, then the editor; each screen is shown by visibility alone
        put('sc', open, (v) => { tk.style.visibility = v ? 'hidden' : ''; ed.style.visibility = v ? '' : 'hidden'; });
        put('bar', px, (v) => { br.style.width = `${v}px`; });
        put('cp', s >= SWAP ? 1 : 0, (v) => { cp.textContent = CAPTIONS[v]; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // a blank pale slot until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
