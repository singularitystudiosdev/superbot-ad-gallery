// Zoom AI backgrounds (2026): the wait of the 'Create a background' generator in the Zoom Workplace desktop client (Windows, dark theme), from the Stony Brook
// DoIT training screen recording https://www.youtube.com/watch?v=MZ0m2OJCR_A (2026-09-04, 1280x720, 25 fps; frames reveal-refs/zoom-ai-background/frames/
// zoomSB_{136.0,136.75,137.5,138.25,139.0,139.5,141.0,164.5,165.25,166.5,167.75,168.25,170.0}.jpg, spec .tmp/clone-9e82faf1/reveal-refs/zoom-ai-background/spec.json,
// confidence 0.70). The whole screen is a live meeting window: a near-black stage with the participant name centred in large white type (the camera is off), a dark
// bottom control bar of plain line glyphs over their labels (Audio, Video, Participants, Chat, React, Raise hand, Share, Host tools, More, End), and a docked right
// 'Video & effects' panel: a self-view preview, the back row 'Create a background', the 'Select a space' and 'Select style' dropdown chips, a rounded prompt field with
// a round purple send button, a status row and the result tiles. The wait lives only in that last block: the label 'Generating' with a sparkle over two charcoal tiles,
// each holding a thin grey arc spinner that turns in place, the send button a square stop glyph; the images then replace the tiles, the label becomes 'Showing results'
// and the button an up arrow. Everything is redrawn in plain boxes and line glyphs; every picture is OUR meme; the participant is OUR placeholder 'Muse Studio'; the
// 'zoom Workplace' wordmark is omitted; system UI face.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-zab';
const ROOT_W = 560, ROOT_H = 512;
const TOP_H = 22, CTL_H = 44, PN_L = 352, PN_W = 208;       // title strip, control bar, docked panel
const G_L = 8, G_T = 192, T_W = 93, T_H = 52, G_X = 6, G_Y = 6;   // the 2-col grid of 16:9 tiles inside the panel
const PURPLE = '#6c63ff';
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #0e0f11; color: #ffffff; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(255, 255, 255, .12); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-tb { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${TOP_H}px; background: #131416; }
.${P}-rm { position: absolute; left: 12px; top: 0; font-size: 7.5px; line-height: ${TOP_H}px; color: #e6e7ea; padding-left: 12px; }
.${P}-rm svg { position: absolute; left: 0; top: 7px; width: 8px; height: 8px; stroke: #c9cbd0; stroke-width: 2; }
.${P}-wi { position: absolute; top: 6px; width: 10px; height: 10px; stroke: #c9cbd0; stroke-width: 1.8; }
.${P} svg.${P}-sh { stroke: #2fd16b; fill: #2fd16b; }
.${P}-nm { position: absolute; left: 0; top: ${TOP_H}px; width: ${PN_L}px; height: ${ROOT_H - TOP_H - CTL_H}px; text-align: center; font-size: 37px; line-height: ${ROOT_H - TOP_H - CTL_H}px; font-weight: 700; letter-spacing: -.3px; color: #ffffff; }
.${P}-pn-tag { position: absolute; left: 6px; top: ${ROOT_H - CTL_H - 16}px; height: 12px; box-sizing: border-box; padding: 0 5px 0 15px; border-radius: 2px; background: #202124; font-size: 6.2px; line-height: 12px; color: #ffffff; }
.${P}-pn-tag svg { position: absolute; left: 3px; top: 2px; width: 8px; height: 8px; stroke: #f2545b; stroke-width: 2; }
.${P}-cb { position: absolute; left: 0; top: ${ROOT_H - CTL_H}px; width: ${PN_L}px; height: ${CTL_H}px; background: #131416; }
.${P}-ci { position: absolute; top: 7px; height: 30px; text-align: center; }
.${P}-ci svg { display: block; margin: 0 auto; width: 14px; height: 14px; stroke: #ffffff; stroke-width: 1.7; }
.${P}-ci p { margin-top: 4px; font-size: 5.8px; line-height: 8px; color: #e6e7ea; }
.${P}-ci i { position: absolute; font-style: normal; font-size: 5px; line-height: 5px; color: #e6e7ea; }
.${P}-ca { position: absolute; top: 14px; width: 6px; height: 6px; stroke: #c9cbd0; stroke-width: 2.4; }
.${P}-pnl { position: absolute; left: ${PN_L}px; top: ${TOP_H}px; box-sizing: border-box; width: ${PN_W}px; height: ${ROOT_H - TOP_H}px; background: #1b1c1e; border-left: 1px solid #2e2f33; }
.${P}-hd { position: absolute; left: 0; top: 0; width: ${PN_W - 1}px; text-align: center; font-size: 8.3px; line-height: 26px; color: #ffffff; }
.${P}-hg { position: absolute; top: 8px; width: 10px; height: 10px; stroke: #d6d8dc; stroke-width: 1.8; }
.${P}-pv { position: absolute; left: ${G_L}px; top: 30px; box-sizing: border-box; width: 192px; height: 56px; border-radius: 3px; overflow: hidden; background: linear-gradient(180deg, #5a7fb8 0%, #e9a56e 46%, #f0cf9a 62%, #5f8a45 63%, #7aa24f 80%, #4e7a3a 100%); }
.${P}-pv i { position: absolute; display: block; background: #3c4560; }
.${P}-pv svg { position: absolute; right: 4px; top: 4px; width: 8px; height: 8px; stroke: #ffffff; stroke-width: 2; }
.${P}-bk { position: absolute; left: 0; top: 92px; width: ${PN_W - 1}px; text-align: center; font-size: 8px; line-height: 18px; font-weight: 600; color: #ffffff; }
.${P}-bk-a { position: absolute; left: 10px; top: 5px; width: 8px; height: 8px; stroke: #d6d8dc; stroke-width: 2; }
.${P}-ch { position: absolute; top: 114px; box-sizing: border-box; height: 20px; border-radius: 4px; border: 1px solid #55575d; font-size: 7.4px; line-height: 18px; color: #ffffff; padding-left: 6px; }
.${P}-ch svg { position: absolute; right: 5px; top: 7px; width: 6px; height: 6px; stroke: #ffffff; stroke-width: 2.6; }
.${P}-pt { position: absolute; left: ${G_L}px; top: 140px; box-sizing: border-box; width: 192px; height: 24px; border-radius: 12px; border: 1.2px solid #6b6cff; background: #1b1c1e; font-size: 7.2px; line-height: 21px; color: #ffffff; padding-left: 7px; }
.${P}-sb { position: absolute; right: 3px; top: 3px; box-sizing: border-box; width: 15px; height: 15px; border-radius: 50%; background: ${PURPLE}; }
.${P}-sb svg { position: absolute; left: 3.5px; top: 3.5px; width: 8px; height: 8px; stroke: #ffffff; stroke-width: 2.4; }
.${P}-sb svg.${P}-stop { fill: #ffffff; stroke: none; }
.${P}-sa { position: absolute; left: 12px; top: 172px; height: 14px; font-size: 7.4px; line-height: 14px; color: #ffffff; padding-left: 14px; }
.${P}-sa svg { position: absolute; left: 0; top: 2px; width: 10px; height: 10px; fill: #ffffff; stroke: none; }
.${P}-gd { position: absolute; left: ${G_L}px; top: ${G_T}px; display: grid; grid-template-columns: repeat(2, ${T_W}px); column-gap: ${G_X}px; row-gap: ${G_Y}px; }
.${P}-t { position: relative; width: ${T_W}px; height: ${T_H}px; overflow: hidden; border-radius: 4px; background: #1b1c1e; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #2a2b2f; }
.${P}-sp { position: absolute; left: ${(T_W - 18) / 2}px; top: ${(T_H - 18) / 2}px; width: 18px; height: 18px; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const LAND = Array.from({ length: 10 }, (_, i) => 1.10 + i * (0.60 / 9));   // tile i fills (strict reading order), the last at 1.70; the label flips at the first
const SPIN = 0.7;                                  // layout seconds per spinner turn (~1 rev/s by eye in the footage)
const PROMPT = 'Fall foliage on a hill in the countryside';
const NAME = 'Muse Studio';

const ICON = {
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.1"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  up: '<path d="M12 19V6M6 12l6-6 6 6"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  micOff: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" stroke="#f2545b"/><path d="M4 4l16 16" stroke="#f2545b"/>',
  cam: '<rect x="3" y="6.5" width="12" height="11" rx="2"/><path d="M15 11l6-3.5v9L15 13"/>',
  camOff: '<rect x="3" y="6.5" width="12" height="11" rx="2" stroke="#f2545b"/><path d="M15 11l6-3.5v9L15 13M4 4l16 16" stroke="#f2545b"/>',
  people: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3.4 2.8-5.2 5.5-5.2s4.9 1.8 5.5 5.2M16 6a3 3 0 0 1 0 5.6M17.5 14c1.8.6 3 2.3 3.3 5"/>',
  chat: '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6l-4.5 3.5V17H6a2 2 0 0 1-2-2z"/>',
  react: '<path d="M12 20.5s-8-4.6-8-10.2A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 8 2.5c0 5.6-8 10.2-8 10.2z"/>',
  hand: '<path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11M11 10V5a1.5 1.5 0 0 1 3 0v6M14 10V6.5a1.5 1.5 0 0 1 3 0V14c0 3.5-2.5 6-5.5 6C9 20 7.5 18.5 6 16l-1.6-3c-.5-.9.6-1.8 1.4-1.2L8 13.5"/>',
  share: '<rect x="3.5" y="4.5" width="17" height="13" rx="2"/><path d="M12 14V8M9 11l3-3 3 3M8 21h8"/>',
  host: '<path d="M12 3l7.5 3v5.5c0 4.6-3 7.8-7.5 9.5-4.5-1.7-7.5-4.9-7.5-9.5V6z"/><circle cx="12" cy="11" r="2.4"/>',
  more: '<circle cx="12" cy="12" r="9"/><path d="M8 12v.01M12 12v.01M16 12v.01"/>',
  end: '<circle cx="12" cy="12" r="9" fill="#e5484d" stroke="#e5484d"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#ffffff"/>',
  caret: '<path d="M6 15l6-6 6 6"/>',
  min: '<path d="M5 12h14"/>',
  max: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
  link: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M9 9h6v6"/>',
  star: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  grid: '<rect x="4" y="4" width="4" height="4"/><rect x="10" y="4" width="4" height="4"/><rect x="16" y="4" width="4" height="4"/><rect x="4" y="10" width="4" height="4"/><rect x="10" y="10" width="4" height="4"/><rect x="16" y="10" width="4" height="4"/>',
  ring: '<rect x="5" y="5" width="14" height="14" rx="4"/><path d="M9 12h6"/>',
  tag: '<path d="M6 5h6l7 7-6 6-7-7z"/>',
};
const SVG = (cls, body, style) => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="0 0 24 24">${body}</svg>`;
const SPARK = '<path d="M9 2.5l1.7 4.8 4.8 1.7-4.8 1.7L9 15.5l-1.7-4.8L2.5 9l4.8-1.7zM17.5 12.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/>';

export default {
  id: 'zoom-ai-background',
  label: 'Zoom AI backgrounds (2026)',
  source: {
    platform: "Zoom Workplace desktop client (Windows, dark theme) in a live meeting: the docked right-hand 'Video & effects' panel, sub-view 'Create a background' (AI virtual-background generator, Zoom AI Companion); third-party university training screen recording at 1280x720, 25 fps",
    feature: "Create a virtual background from a text description (optional 'Select a space' and 'Select style' dropdowns, a rounded prompt field with a round purple send button): the label row reads 'Generating' with a sparkle over two charcoal tiles that each hold a thin grey arc spinner turning in place and the send button becomes a square stop glyph; the two images then replace the tiles with the label 'Showing results' and the up arrow back on the button",
    capture: {
      url: 'https://www.youtube.com/watch?v=MZ0m2OJCR_A',
      page: 'https://www.youtube.com/watch?v=MZ0m2OJCR_A',
      date: '2026-09-04',
      retrieved: '2026-10-17',
      timestamps: "run 1 (prompt 'Fall foliage on a hill in the countryside'): t = 136.5 s the cursor on the purple send button (submit); t = 136.75-138.25 s PENDING, 'Generating' + sparkle over two charcoal tiles each with a rotating grey arc, the send button a stop square (zoomSB_136.75, zoomSB_137.5, zoomSB_138.25); t = 138.25-139.25 s the two images fade in under the still-turning spinners and the label cross-fades to 'Showing results' (zoomSB_139.0); t = 139.5 s RESULTS, two image tiles, the send button an up arrow (zoomSB_139.5, zoomSB_141.0). run 2 (style 'Cinematic'): t = 164.75-168.0 s 'Generating' + two spinner tiles (zoomSB_165.25, zoomSB_166.5, zoomSB_167.75), t = 168.25 s 'Showing results' with two darker images (zoomSB_168.25); t = 170 s a tile hovered ('Use background')",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=MZ0m2OJCR_A', published: '2026-09-04', retrieved: '2026-10-17', note: 'Creating a Virtual Background with Zoom AI (DoIT Training at Stony Brook University)' },
    ],
    extrapolated: [
      "the landing: the footage lands TWO images in one 2-up row, both within ~0.1 s of each other; here ten 16:9 tiles sit in a 2-column grid of five rows in the panel and fill in strict reading order, two charcoal spinner tiles being the pending state exactly as in the footage",
      "the landing swap: the footage cross-fades image over charcoal for ~0.8 s with the spinner still showing on top; here the swap is a hard cut per tile (no opacity), the spinner going with the charcoal and the label flipping to 'Showing results' with the first tile",
      "the pace: the footage waits ~2.5-3.3 s; the beat plays it in the same ~1.8 s window every module of this family uses",
      "the spinner: a ~270-degree thin grey arc turning in place, one turn per 0.7 s of the layout clock (the footage turns about once a second, period not measured), its angle a pure function of t",
      "the tile size and the page's scale: the footage's tiles are ~104 x 84 px in a 250 px panel of a 1280 px frame; here the window is redrawn at 560 px wide with a 208 px panel and 93 x 52 px 16:9 tiles so ten fit (chrome redrawn, not scaled copies)",
      "the self-view preview: the footage shows its own real background photo; here a plain drawn sunset gradient stands in, and the stage shows the placeholder participant 'Muse Studio' instead of the person in the footage",
      "the chips: 'Select style' stays unset as in run 1 (run 2's 'Cinematic' thumbnail chip is not drawn)",
      "omitted from the footage: the 'zoom Workplace' wordmark, the red annotation arrow and cursor, the DoIT title cards, the recording's letterbox bars",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'zoom-ai-background');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"><svg class="${P}-sp" viewBox="0 0 18 18"><circle class="${P}-arc" cx="9" cy="9" r="7.4" fill="none" stroke="#b8babf" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="34.9 11.6"/></svg></div></div></div>`;
    const ctl = (cx, w, icon, label, extra) => `<div class="${P}-ci" style="left: ${cx - w / 2}px; width: ${w}px">${SVG('', icon)}<p>${label}</p>${extra || ''}</div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-tb"><p class="${P}-rm">${SVG('', ICON.info)}${NAME}'s Personal Meeting Room</p>`
      + SVG(`${P}-wi ${P}-sh`, '<path d="M12 3l7.5 3v5.5c0 4.6-3 7.8-7.5 9.5-4.5-1.7-7.5-4.9-7.5-9.5V6z"/>', 'left: 430px')
      + SVG(`${P}-wi`, ICON.link, 'left: 450px') + SVG(`${P}-wi`, ICON.star, 'left: 470px') + SVG(`${P}-wi`, ICON.grid, 'left: 490px')
      + SVG(`${P}-wi`, ICON.min, 'left: 512px') + SVG(`${P}-wi`, ICON.max, 'left: 530px') + SVG(`${P}-wi`, ICON.x, 'left: 546px')
      + `</div>`
      + `<p class="${P}-nm">${NAME}</p>`
      + `<p class="${P}-pn-tag">${SVG('', ICON.micOff)}${NAME}</p>`
      + `<div class="${P}-cb">`
      + ctl(24, 30, ICON.micOff, 'Audio') + SVG(`${P}-ca`, ICON.caret, 'left: 41px')
      + ctl(66, 30, ICON.camOff, 'Video') + SVG(`${P}-ca`, ICON.caret, 'left: 83px')
      + ctl(116, 42, ICON.people, 'Participants', `<i style="left: 29px; top: 1px">1</i>`) + SVG(`${P}-ca`, ICON.caret, 'left: 138px')
      + ctl(160, 26, ICON.chat, 'Chat') + SVG(`${P}-ca`, ICON.caret, 'left: 176px')
      + ctl(194, 26, ICON.react, 'React') + SVG(`${P}-ca`, ICON.caret, 'left: 210px')
      + ctl(230, 36, ICON.hand, 'Raise hand') + SVG(`${P}-ca`, ICON.caret, 'left: 252px')
      + ctl(266, 26, ICON.share, 'Share')
      + ctl(298, 36, ICON.host, 'Host tools')
      + ctl(330, 26, ICON.more, 'More')
      + `</div>`
      + `<div class="${P}-pnl">`
      + `<p class="${P}-hd">Video &amp; effects</p>${SVG(`${P}-hg`, ICON.gear, 'left: 10px')}${SVG(`${P}-hg`, ICON.x, 'right: 10px')}`
      + `<div class="${P}-pv"><i style="left: 20px; top: 6px; width: 8px; height: 32px"></i><i style="left: 32px; top: 14px; width: 7px; height: 24px; background: #5a3d42"></i><i style="left: 118px; top: 18px; width: 12px; height: 20px; background: #4b5878"></i><i style="left: 132px; top: 24px; width: 9px; height: 14px"></i>${SVG('', ICON.link)}</div>`
      + `<p class="${P}-bk">${SVG(`${P}-bk-a`, ICON.back)}Create a background</p>`
      + `<p class="${P}-ch" style="left: ${G_L}px; width: 88px">Select a space${SVG('', ICON.chev)}</p>`
      + `<p class="${P}-ch" style="left: ${G_L + 94}px; width: 80px">Select style${SVG('', ICON.chev)}</p>`
      + `<div class="${P}-pt">${PROMPT}<div class="${P}-sb">${SVG(`${P}-up`, ICON.up)}${SVG(`${P}-stop`, '<rect x="7" y="7" width="10" height="10" rx="1.5"/>')}</div></div>`
      + `<p class="${P}-sa">${SVG('', SPARK)}<span class="${P}-st">Generating</span></p>`
      + `<div class="${P}-gd">${tiles.map(cell).join('')}</div>`
      + `</div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const st = q('st'), up = q('up'), stop = q('stop');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), arc: n.querySelector(`.${P}-arc`), sp: n.querySelector(`.${P}-sp`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const results = s >= LAND[0];                  // the label flips with the first picture
        const ang = s >= LAND[1] ? 0 : Math.round(((s / SPIN) % 1) * 360);   // spinner angle, a pure function of s while a spinner shows

        put('lbl', results, (v) => { st.textContent = v ? 'Showing results' : 'Generating'; });
        put('btn', results, (v) => { up.style.visibility = v ? '' : 'hidden'; stop.style.visibility = v ? 'hidden' : ''; });

        cells.forEach((c, i) => {
          // 0: an empty slot (panel colour), 1: a charcoal tile with its turning spinner (the two pending slots), 2: the picture
          const state = s >= LAND[i] ? 2 : i < 2 ? 1 : 0;
          put(`i${i}`, state, (v) => {
            c.im.style.visibility = v === 2 ? '' : 'hidden';
            c.cv.style.display = v === 2 ? 'none' : '';
            c.cv.style.background = v === 0 ? '#1b1c1e' : '';
            c.sp.style.visibility = v === 0 ? 'hidden' : '';
          });
          put(`a${i}`, ang, (v) => { c.arc.setAttribute('transform', `rotate(${v} 9 9)`); });
        });
      },
    };
  },
};
