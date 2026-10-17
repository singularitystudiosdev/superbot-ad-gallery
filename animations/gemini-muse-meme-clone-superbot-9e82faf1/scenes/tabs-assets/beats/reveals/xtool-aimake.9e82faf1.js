// xTool AImake (2025): the wait of a new History entry in Atomm Studio, xTool's browser design editor for laser cutters (xTool official live, 2025-06-14,
// https://www.youtube.com/watch?v=X6ZTnTs29Xo, Generate click t ~ 272.5 s, thumbnail landed t ~ 302 s; frames reveal-refs/xtool-aimake/frames/xt_X6ZT_{272,274,279,285,291,297,301,303}.png;
// secondary https://www.youtube.com/watch?v=aKoxsZtR4XU, AImake 2024-11-18, its 'Generating NN%' tile at t = 129-141 s, frames xt_aK_*.jpg; spec .tmp/clone-9e82faf1/reveal-refs/xtool-aimake/spec.json,
// confidence 0.58). The editor only, no browser chrome: a narrow tool rail of glyphs down the left edge, the 'History' drawer (a back chevron, the title, a refresh glyph and a close
// cross, then entries each with a black label chip, a thumbnail, a timestamp and refresh / delete glyphs) and a large white canvas with mm rulers and a 10 mm grid. A Generate
// press puts a new entry on top of the drawer: its tile first shows a faint hourglass and the line 'Remaining 1 minutes' where the timestamp will be, then the timestamp and a
// bare live percentage under a morphing loader glyph climbing steadily, then the percentage goes and a dotted spinner turns for a beat; then the line-art thumbnail replaces the
// tile in one step and the refresh / delete glyphs turn dark. Everything is redrawn in plain boxes and line glyphs (the thumbnails are grey line-art boxes, never footage); every
// picture is OUR meme; no wordmark, no loader mark of the brand, no live badge, no sign-up ticker, no credits; system UI face.
import { injectStyle, restTransform, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-xam';
const ROOT_W = 560, ROOT_H = 456;
const SH_L = 204, SH_T = 20, SH_W = 340, SH_H = 420;       // the mm-ruled sheet, 1 mm = 1.1 px
const G_L = 220, G_T = 150, T_W = 56, T_H = 66, G_X = 7, G_Y = 7;   // the 5 x 2 placed designs
const GREYTXT = '#b0b0b8';
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #ffffff; color: #222228; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .12); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-rl { position: absolute; left: 0; top: 0; width: 28px; height: ${ROOT_H}px; background: #ffffff; box-shadow: 1px 0 0 #ececef; }
.${P}-rl svg { position: absolute; left: 8px; width: 12px; height: 12px; stroke: #2a2a30; stroke-width: 1.8; }
.${P}-rl svg.${P}-on { stroke: #111118; stroke-width: 2.3; }
.${P}-dr { position: absolute; left: 28px; top: 0; width: 156px; height: ${ROOT_H}px; background: #ffffff; box-shadow: 1px 0 0 #ececef; overflow: hidden; }
.${P}-hh { position: absolute; left: 0; top: 0; width: 156px; height: 28px; }
.${P}-hh svg { position: absolute; top: 9px; width: 10px; height: 10px; stroke: #55555c; stroke-width: 2; }
.${P}-hh p { position: absolute; left: 24px; top: 0; font-size: 8.6px; line-height: 28px; font-weight: 500; color: #1c1c22; }
.${P}-en { position: absolute; left: 0; width: 156px; height: 100px; }
.${P}-ch { position: absolute; left: 8px; top: 0; box-sizing: border-box; height: 14px; border-radius: 2px; background: #17171b; color: #ffffff; font-size: 6.2px; line-height: 14px; font-weight: 600; padding: 0 6px 0 16px; }
.${P}-ch svg { position: absolute; left: 4px; top: 2.5px; width: 9px; height: 9px; stroke: #ffffff; stroke-width: 2; }
.${P}-tl { position: absolute; left: 8px; top: 20px; width: 62px; height: 62px; }
.${P}-tl svg { position: absolute; left: 0; top: 0; width: 62px; height: 62px; }
.${P}-tl svg.${P}-th { stroke: #8a8a92; stroke-width: 1; }
.${P}-wt { position: absolute; left: 0; top: 0; width: 62px; height: 62px; border-radius: 3px; background: #f4f4f6; }
.${P}-wt svg.${P}-ic { left: 19px; top: 14px; width: 24px; height: 24px; stroke: #c9c9cf; stroke-width: 1.3; }
.${P}-pc { position: absolute; left: 0; top: 40px; width: 62px; text-align: center; font-size: 6.6px; line-height: 9px; font-weight: 500; color: ${GREYTXT}; }
.${P}-dt { position: absolute; left: 8px; top: 86px; font-size: 6.6px; line-height: 10px; color: ${GREYTXT}; }
.${P}-ib { position: absolute; top: 86px; width: 10px; height: 10px; stroke: #1c1c22; stroke-width: 1.8; }
.${P}-wd .${P}-e0 .${P}-ib { stroke: #cfcfd4; }
.${P}-cn { position: absolute; left: 184px; top: 0; width: ${ROOT_W - 184}px; height: ${ROOT_H}px; background: #ffffff; }
.${P}-ru { position: absolute; left: 0; top: 0; width: ${ROOT_W - 184}px; height: ${ROOT_H}px; }
.${P}-ru svg { position: absolute; left: 0; top: 0; stroke: #bdbdc4; stroke-width: 1; }
.${P}-ru p { position: absolute; font-size: 5.4px; line-height: 7px; color: #7a7a82; }
.${P}-sh { position: absolute; left: ${SH_L - 184}px; top: ${SH_T}px; width: ${SH_W}px; height: ${SH_H}px; background: #ffffff; box-shadow: 0 0 0 1px #e1e1e6; }
.${P}-sh svg { position: absolute; left: 0; top: 0; }
.${P}-gd { position: absolute; left: ${G_L}px; top: ${G_T}px; display: grid; grid-template-columns: repeat(5, ${T_W}px); column-gap: ${G_X}px; row-gap: ${G_Y}px; }
.${P}-t { position: relative; box-sizing: border-box; width: ${T_W}px; height: ${T_H}px; overflow: hidden; background: #ffffff; box-shadow: 0 0 0 1px #c9c9d0; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #ffffff; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const REM_END = 0.30;                              // 'Remaining 1 minutes' (hourglass) until here, as the footage's first ~6 s of ~29 s
const SPIN0 = 0.95;                                // the percentage goes and the dotted spinner turns until the first landing
const LAND = Array.from({ length: 10 }, (_, i) => 1.10 + i * (0.60 / 9));   // design i is placed (strict reading order), the last at 1.70; the tile becomes a thumbnail at the first
const PCT0 = 3, PCT1 = 74;                         // the footage's figures: 3% at 279 s, 23% at 285 s, 43% at 291 s, 63% at 297 s, ~74% at the end
const percent = (s) => Math.round(PCT0 + (PCT1 - PCT0) * Math.min(Math.max((s - REM_END) / (SPIN0 - REM_END), 0), 1));
const DATE = '2025/06/12 22:20:37';
const ENTRIES = [
  ['Photo to Line Art (Outline only)', '2025/06/12 22:16:30', 0],
  ['Photo to Line Art', '2025/06/12 22:03:44', 0],
  ['Photo to Kawaii Stickers', '', 1],
];
const MM = (v) => SH_L - 184 + v * 1.1;

const ICON = {
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.6-8.9A6 6 0 0 1 18 8.5a4.8 4.8 0 0 1-.5 9.5z"/>',
  add: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8.5v7M8.5 12h7"/>',
  text: '<path d="M5 5.5h14M12 5.5v14"/>',
  shape: '<rect x="4.5" y="4.5" width="15" height="15" rx="3"/>',
  table: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16M10 10v9"/>',
  shapes: '<circle cx="9" cy="9" r="5"/><rect x="11" y="11" width="9" height="9" rx="2"/>',
  apps: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  ai: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M7 15.5l2.5-6 2.5 6M8 13.5h3M15.5 9.5v6"/>',
  cursor: '<path d="M6 3l12 8-5.2 1.2L10.5 18z"/>',
  page: '<path d="M7 3.5h7l4 4V20H7z"/><path d="M14 3.5v4h4"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v4.5h-4.5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M20 16l-5-5-8 8"/>',
  retry: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 9.5a4.5 4.5 0 1 0 .8 4M15.5 6.5v3h-3"/>',
  trash: '<path d="M4 7h16M10 4h4M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  hourglass: '<path d="M7 3.5h10M7 20.5h10M8 3.5c0 5 3 6 4 8.5-1 2.5-4 3.5-4 8.5M16 3.5c0 5-3 6-4 8.5 1 2.5 4 3.5 4 8.5"/>',
};
const SVG = (cls, body, style) => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="0 0 24 24">${body}</svg>`;
// a plain grey line-art thumbnail: two figures (or three stickers), box-drawn, never a footage image
const THUMB = (kind) => (kind === 0
  ? `<svg class="${P}-th" viewBox="0 0 62 62"><circle cx="22" cy="18" r="6"/><path d="M12 54V36c0-6 4-9 10-9s10 3 10 9v18M16 40h12"/><circle cx="42" cy="22" r="5"/><path d="M34 54V40c0-5 3-8 8-8s9 3 9 8v14M47 14l3-5M51 16l4-3"/></svg>`
  : `<svg class="${P}-th" viewBox="0 0 62 62"><circle cx="14" cy="24" r="7"/><circle cx="31" cy="24" r="7"/><circle cx="48" cy="24" r="7"/><path d="M7 52V40c0-4 3-6 7-6s7 2 7 6v12M24 52V40c0-4 3-6 7-6s7 2 7 6v12M41 52V40c0-4 3-6 7-6s7 2 7 6v12"/></svg>`);

const ruler = (() => {
  const W = ROOT_W - 184;
  let tk = '', nums = '';
  for (let mm = 0; mm <= 300; mm += 10) { const px = MM(mm); tk += `M${px} ${mm % 50 === 0 ? 0 : 6}V12`; }
  for (let mm = 0; mm <= 300; mm += 50) nums += `<p style="left: ${MM(mm) + 2}px; top: 3px">${mm}</p>`;
  let tl = '';
  for (let mm = 0; mm <= 350; mm += 10) { const py = SH_T + mm * 1.1; tl += `M${mm % 50 === 0 ? 4 : 10} ${py}H16`; }
  for (let mm = 50; mm <= 350; mm += 50) nums += `<p style="left: 2px; top: ${SH_T + mm * 1.1 + 1}px">${mm}</p>`;
  return `<svg width="${W}" height="${ROOT_H}" viewBox="0 0 ${W} ${ROOT_H}"><path d="${tk}${tl}"/></svg>${nums}`;
})();
const grid = (() => {
  let minor = '', major = '';
  for (let k = 1; k * 11 < SH_W; k++) { const d = `M${k * 11} 0V${SH_H}`; if (k % 5 === 0) major += d; else minor += d; }
  for (let k = 1; k * 11 < SH_H; k++) { const d = `M0 ${k * 11}H${SH_W}`; if (k % 5 === 0) major += d; else minor += d; }
  return `<svg width="${SH_W}" height="${SH_H}" viewBox="0 0 ${SH_W} ${SH_H}"><path d="${minor}" stroke="#f0f0f3" stroke-width="1"/><path d="${major}" stroke="#dcdce1" stroke-width="1"/></svg>`;
})();

export default {
  id: 'xtool-aimake',
  label: 'xTool AImake (2025)',
  source: {
    platform: "xTool Atomm Studio (studio.atomm.com editor) in desktop Chrome, the AI image tool's 'History' drawer beside an mm-ruled design canvas; the same pending tile text in xTool's AImake web page",
    feature: "AI photo-to-line-art generation: pressing Generate puts a new entry on top of the History drawer whose tile shows a faint hourglass and 'Remaining 1 minutes' while it queues, then the loader glyph morphs under a bare percentage that climbs steadily (3% -> 23% -> 43% -> 63% in the footage), then the percentage goes and a dotted spinner turns for about a second, and the finished line-art thumbnail replaces the tile in one step with the entry's refresh and delete glyphs turning dark",
    capture: {
      url: 'https://www.youtube.com/watch?v=X6ZTnTs29Xo',
      page: "xTool official live stream, Atomm Studio photo-to-line-art run (1280x720 capture)",
      date: '2025-06-14',
      retrieved: '2026-10-17',
      timestamps: "t ~ 272.5 s Generate pressed; t = 274 s the new top entry 'Photo to Line Art (Outline only)' with the hourglass and 'Remaining 1 minutes' (xt_X6ZT_274); t = 279 s '3%'; t = 285 s '23%' with the timestamp 2025/06/12 22:20:37 under it (xt_X6ZT_285); t = 291 s 43%; t = 297 s 63%; t = 301 s the percentage gone, the dotted spinner; t ~ 302 s the line-art thumbnail has landed (xt_X6ZT_303), the entry's refresh and delete glyphs dark; the wait is ~29 s of continuous real time. Secondary: https://www.youtube.com/watch?v=aKoxsZtR4XU (AImake, 2024-11-18), the 'Generating NN%' tile with its dotted spinner at t = 129-141 s",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=X6ZTnTs29Xo', published: '2025-06-14', retrieved: '2026-10-17', note: 'primary: Atomm Studio History drawer, the whole wait from Generate to the landed thumbnail, uncut' },
      { url: 'https://www.youtube.com/watch?v=aKoxsZtR4XU', published: '2024-11-18', retrieved: '2026-10-17', note: "secondary: AImake page, 'Generating NN%' tile with the dotted spinner, the start of the wait is dissolved" },
    ],
    extrapolated: [
      "the landing: the footage lands ONE line-art thumbnail in the new top History entry; here that entry's tile becomes a line-art thumbnail at the first landing and ten pictures are placed on the canvas in a 5 x 2 arrangement in strict reading order (a static black-and-white line grade), the new entry's refresh and delete glyphs turning dark at the first landing",
      "the pace and the figures: the footage waits ~29 s ('Remaining 1 minutes' for the first ~6 s, then the percentage from 3% to ~74%, then ~1 s of dotted spinner); the beat plays it in the same ~1.8 s window every module of this family uses, the figure following 3 + 71 u over the percentage stretch as a pure function of t",
      "the loader glyph: the footage's tile glyph is the brand's own mark morphing; it is redrawn here as a plain rounded square that turns and rounds into a circle and back, the hourglass and the dotted spinner as line glyphs",
      "the canvas and the drawer's scale: the live editor is 1280 px wide with the drawer ~245 px of it; here the editor is redrawn at 560 px wide with a 156 px drawer and a 340 x 420 px sheet at 1.1 px per mm; the other History entries are the footage's labels and timestamps with plain grey line-art boxes for thumbnails",
      "omitted from the footage: the 'Live Only!' badge, the sign-up ticker along the bottom, the brand's loader mark and logo at the top of the rail, the 'New' tag on a rail glyph, the browser tab strip and address bar",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'xtool-aimake');
    const grade = (g) => (g.grade ? `${g.grade} grayscale(1) contrast(1.15)` : 'grayscale(1) contrast(1.15)');   // the line-art grade of the placed designs, static
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${grade(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const RAIL = ['cloud', 'add', 'text', 'shape', 'table', 'shapes', 'apps', 'ai'];
    const chip = (label) => `<p class="${P}-ch">${SVG('', ICON.image)}${label}</p>`;
    const icons = (top) => SVG(`${P}-ib`, ICON.retry, `left: 118px; top: ${top}px`) + SVG(`${P}-ib`, ICON.trash, `left: 136px; top: ${top}px`);
    const dots = Array.from({ length: 8 }, (_, j) => `<circle class="${P}-dp" cx="${(12 + 8 * Math.sin((j * Math.PI) / 4)).toFixed(2)}" cy="${(12 - 8 * Math.cos((j * Math.PI) / 4)).toFixed(2)}" r="1.7" fill="#a9a9b1" stroke="none"/>`).join('');
    const root = x.el(`<div class="${P} ${P}-wd">`
      + `<div class="${P}-rl">${RAIL.map((n, i) => SVG(n === 'ai' ? `${P}-on` : '', ICON[n], `top: ${18 + i * 27}px`)).join('')}${SVG('', ICON.cursor, `top: 404px`)}${SVG('', ICON.page, `top: 428px`)}</div>`
      + `<div class="${P}-dr">`
      + `<div class="${P}-hh">${SVG('', ICON.back, 'left: 9px')}<p>History</p>${SVG('', ICON.refresh, 'left: 118px')}${SVG('', ICON.close, 'left: 136px')}</div>`
      // the new top entry: pending glyphs, then the thumbnail
      + `<div class="${P}-en ${P}-e0" style="top: 32px">${chip(ENTRIES[0][0])}`
      + `<div class="${P}-tl"><div class="${P}-wt">`
      + SVG(`${P}-ic ${P}-hg`, ICON.hourglass)
      + `<svg class="${P}-ic ${P}-mg" viewBox="0 0 24 24"><g class="${P}-mq"><rect class="${P}-mr" x="5" y="5" width="14" height="14" rx="3"/><circle class="${P}-mc" cx="12" cy="12" r="2.4"/></g></svg>`
      + `<svg class="${P}-ic ${P}-sn" viewBox="0 0 24 24">${dots}</svg>`
      + `<p class="${P}-pc">3%</p></div>${THUMB(0).replace(`class="${P}-th"`, `class="${P}-th ${P}-nt"`)}</div>`
      + `<p class="${P}-dt ${P}-rm">Remaining 1 minutes</p><p class="${P}-dt ${P}-dd">${DATE}</p>${icons(86)}</div>`
      // the earlier entries
      + ENTRIES.map(([label, date, kind], i) => `<div class="${P}-en" style="top: ${132 + i * 100}px">${chip(label)}<div class="${P}-tl">${THUMB(kind)}</div>${date ? `<p class="${P}-dt">${date}</p>` : ''}${date ? icons(86) : ''}</div>`).join('')
      + `</div>`
      + `<div class="${P}-cn"><div class="${P}-ru">${ruler}</div><div class="${P}-sh">${grid}</div>${SVG('', ICON.plus, `position: absolute; left: ${ROOT_W - 184 - 18}px; top: 14px; width: 10px; height: 10px; stroke: #55555c; stroke-width: 2`)}</div>`
      + `<div class="${P}-gd">${tiles.map(cell).join('')}</div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const wt = q('wt'), hg = q('hg'), mg = q('mg'), sn = q('sn'), pc = q('pc'), nt = q('nt'), rm = q('rm'), dd = q('dd'), grd = q('gd');
    const mq = q('mq'), mr = q('mr'), mc = q('mc');
    const dp = [...root.querySelectorAll(`.${P}-dp`)];
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
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
        const gone = s >= LAND[0];                     // the tile becomes the thumbnail at the first landing
        const stage = gone ? 3 : s < REM_END ? 0 : s < SPIN0 ? 1 : 2;   // 0 queue, 1 percent, 2 dotted spinner, 3 landed
        const pct = percent(Math.min(s, SPIN0));
        const f = stage === 1 ? Math.round(s * 30) : 0;                // the loader glyph morphs on a 30 fps step
        const sp = stage === 2 ? Math.floor(s * 14) : 0;

        put('st', stage, (v) => {
          show(hg, v === 0); show(mg, v === 1); show(pc, v === 1); show(sn, v === 2);
          show(wt, v !== 3); show(nt, v === 3); show(rm, v === 0); show(dd, v !== 0);
          root.classList.toggle(`${P}-wd`, v !== 3);
          show(grd, v === 3);
        });
        put('pc', stage === 1 ? pct : -1, (v) => { if (v >= 0) pc.textContent = `${v}%`; });
        put('mg', f, () => {
          const a = f * 11, r = 3 + 4.4 * (0.5 + 0.5 * Math.sin(f * 0.33)), w = 13 + 2.4 * Math.sin(f * 0.21);
          mq.setAttribute('transform', `rotate(${a % 360} 12 12)`);
          mr.setAttribute('x', (12 - w / 2).toFixed(2)); mr.setAttribute('y', (12 - w / 2).toFixed(2));
          mr.setAttribute('width', w.toFixed(2)); mr.setAttribute('height', w.toFixed(2)); mr.setAttribute('rx', r.toFixed(2));
          mc.setAttribute('r', (2.4 + 1.4 * Math.sin(f * 0.27 + 1)).toFixed(2));
        });
        put('sp', sp, () => { dp.forEach((c, j) => { c.setAttribute('fill-opacity', (1 - (((sp - j) % 8 + 8) % 8) / 8.5).toFixed(2)); }); });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // a white empty slot until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
