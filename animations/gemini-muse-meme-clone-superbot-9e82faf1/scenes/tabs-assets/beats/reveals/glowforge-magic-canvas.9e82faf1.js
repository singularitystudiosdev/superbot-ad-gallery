// Glowforge Magic Canvas (2023): the wait of the Magic Canvas card inside the Glowforge web design app (app.glowforge.com/designs/new, desktop Chrome, 2023-02-11 unedited
// 1080p screen recording https://www.youtube.com/watch?v=_KtrCQXwirw, click t = 46.5-47.2 s, easel t = 47.5-50.0 s, landed t = 50.5-51.5 s; frames
// reveal-refs/glowforge-magic-canvas/frames/gf_KtrC_{46.0,47.5,48.5,49.5,50.0,51.5}.jpg, spec .tmp/clone-9e82faf1/reveal-refs/glowforge-magic-canvas/spec.json, confidence 0.60).
// The app only, no browser chrome: a dark teal top nav (Dashboard / Catalog / Shop / Community / Support), a light tool row (zoom '100%', select / pan / undo / redo
// glyphs, the teal add button, three tool glyphs), a ruled bed canvas (light rulers, dark laser bed) and the white Magic Canvas card over it. The card's header pill carries
// the quoted prompt and its style line and an 'Edit' button; on the left a purple easel outline holds a grey tulip glyph that is drawn in from the top down while small yellow
// four-point sparkles twinkle, then both clear to the empty easel; on the right the greyed 'Make more Magic!' and 'Use this image' buttons wait. The wait has no word,
// percent or timer in the footage: only the easel carries it. Everything is redrawn as plain vector shapes (the easel is a loading glyph, not a brand mark); every
// picture is OUR meme; no wordmark, no account name, no upsell; system UI face.
import { injectStyle, restTransform, ownSrc, UI_FONT, MONO_FONT } from './util.9e82faf1.js';

const P = 'rv-gmc';
const ROOT_W = 560, ROOT_H = 456;
const TEAL = '#1ba3b1', PURPLE = '#4b0f6b', GREY = '#4d4d4d', YELLOW = '#f6e96b';
const T_W = 62, T_H = 73, G_X = 5, G_Y = 5;                 // the landed sheet: 5 x 2 pictures
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #0b1b1b; color: #222222; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .25); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-nv { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: 28px; background: #072322; }
.${P}-nv p { position: absolute; top: 0; width: 64px; text-align: center; font-size: 8.4px; line-height: 28px; font-weight: 600; color: #ffffff; }
.${P}-tr { position: absolute; left: 0; top: 28px; width: ${ROOT_W}px; height: 30px; background: #f7f7f7; box-shadow: 0 1px 0 #d9d9d9; }
.${P}-tr svg { position: absolute; width: 11px; height: 11px; top: 10px; stroke: #5a5a5a; stroke-width: 1.9; }
.${P}-tr svg.${P}-ac { stroke: ${TEAL}; }
.${P}-tr svg.${P}-dm { stroke: #bdbdbd; }
.${P}-zp { position: absolute; left: 48px; top: 6px; box-sizing: border-box; width: 42px; height: 18px; border-radius: 9px; background: #ffffff; box-shadow: 0 0 0 1px #dedede; }
.${P}-zp p { position: absolute; left: 0; top: 0; width: 30px; text-align: center; font-size: 8px; line-height: 18px; color: #333333; }
.${P}-zp svg { left: 29px; top: 6px; width: 8px; height: 8px; stroke: #888888; stroke-width: 2.2; }
.${P}-ad { position: absolute; left: 277px; top: 0; width: 31px; height: 30px; background: ${TEAL}; }
.${P}-ad svg { left: 7px; top: 6px; width: 17px; height: 17px; stroke: #ffffff; stroke-width: 1.7; }
.${P}-rt { position: absolute; left: 0; top: 58px; width: ${ROOT_W}px; height: 10px; background: #f4f4f4; box-shadow: 0 1px 0 #cfcfcf; }
.${P}-rl { position: absolute; left: 0; top: 68px; width: 16px; height: ${ROOT_H - 68}px; background: #f4f4f4; box-shadow: 1px 0 0 #cfcfcf; }
.${P}-rt p, .${P}-rl p { position: absolute; font-size: 5.4px; line-height: 7px; color: #6a6a6a; }
.${P}-rt p { top: 1px; }
.${P}-rl p { left: 4px; }
.${P}-rt svg, .${P}-rl svg { position: absolute; left: 0; top: 0; stroke: #9a9a9a; stroke-width: 1; }
.${P}-bd { position: absolute; left: 16px; top: 68px; width: ${ROOT_W - 16}px; height: ${ROOT_H - 68}px; background: #0b1b1b; }
.${P}-cd { position: absolute; left: 44px; top: 62px; box-sizing: border-box; width: 480px; height: 330px; border-radius: 6px; background: #ffffff; box-shadow: 0 5px 22px rgba(0, 0, 0, .55); }
.${P}-hd { position: absolute; left: 12px; top: 12px; box-sizing: border-box; width: 456px; height: 26px; border-radius: 4px; background: #e8e8e8; }
.${P}-hd svg.${P}-bk { position: absolute; left: 8px; top: 7px; width: 11px; height: 11px; stroke: #555555; stroke-width: 2.2; }
.${P}-ht { position: absolute; left: 28px; top: 0; font-family: ${MONO_FONT}; font-size: 9px; line-height: 26px; color: #222222; }
.${P}-ht i { font-style: italic; }
.${P}-ed { position: absolute; right: 8px; top: 4px; box-sizing: border-box; width: 52px; height: 18px; border-radius: 9px; background: #ffffff; box-shadow: 0 0 0 1px #d3d3d3; }
.${P}-ed svg { position: absolute; left: 8px; top: 4px; width: 10px; height: 10px; stroke: #444444; stroke-width: 1.8; }
.${P}-ed p { position: absolute; left: 22px; top: 0; font-size: 8.4px; line-height: 18px; color: #333333; }
.${P}-sg { position: absolute; left: 16px; top: 50px; width: 340px; height: 270px; }
.${P}-es { position: absolute; left: 87px; top: 36px; width: 165px; height: 231px; }
.${P}-es svg { position: absolute; left: 0; top: 0; width: 165px; height: 231px; }
.${P}-gd { position: absolute; left: 5px; top: 52px; display: grid; grid-template-columns: repeat(5, ${T_W}px); column-gap: ${G_X}px; row-gap: ${G_Y}px; }
.${P}-t { position: relative; box-sizing: border-box; width: ${T_W}px; height: ${T_H}px; overflow: hidden; background: #ffffff; box-shadow: inset 0 0 0 1px #cfcfcf; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #ffffff; }
.${P}-mm { position: absolute; left: 358px; top: 120px; box-sizing: border-box; width: 112px; height: 22px; border-radius: 11px; background: #d9d9d9; color: #ffffff; font-size: 8.2px; line-height: 22px; font-weight: 700; padding-left: 24px; }
.${P}-mm svg { position: absolute; left: 7px; top: 4px; width: 14px; height: 14px; stroke: #f2f2f2; stroke-width: 1.6; }
.${P}-ui { position: absolute; left: 358px; top: 148px; box-sizing: border-box; width: 112px; height: 20px; border-radius: 10px; background: #ffffff; box-shadow: inset 0 0 0 1px #e1e1e1; color: #bdbdbd; font-size: 8.4px; line-height: 20px; font-weight: 600; padding-left: 24px; }
.${P}-ui svg { position: absolute; left: 7px; top: 3px; width: 14px; height: 14px; stroke: #ffffff; stroke-width: 2.2; }
.${P}-ui i { position: absolute; left: 7px; top: 3px; width: 14px; height: 14px; border-radius: 50%; background: #c9c9c9; }
.${P}-ld .${P}-mm { background: ${TEAL}; }
.${P}-ld .${P}-mm svg { stroke: #ffffff; }
.${P}-ld .${P}-ui { color: #2a2a2a; box-shadow: inset 0 0 0 1px #cfcfcf; }
.${P}-ld .${P}-ui i { background: #2f2f2f; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const TUL0 = 0.06, TUL1 = 0.78;                    // the tulip is drawn in from the top down between these two instants
const CLEAR = 0.95;                                // easel and sparkles clear to the empty easel here, as in the footage's last wait frame
const LAND = Array.from({ length: 10 }, (_, i) => 1.10 + i * (0.60 / 9));   // picture i lands (strict reading order), the last at 1.70; the easel goes at the first
const BANDS = 12, SOFT = 3;                        // the tulip's white cover is 12 bands with a 3-band soft edge
const SPARKS = [                                   // x, y in the easel's 150 x 210 box, period (layout s), phase
  [38, 52, 0.46, 0.05], [112, 46, 0.58, 0.40], [122, 88, 0.42, 0.72], [28, 98, 0.52, 0.25],
  [100, 150, 0.62, 0.55], [52, 150, 0.48, 0.88], [102, 66, 0.37, 0.15], [47, 74, 0.55, 0.62],
];
const STAR = 'M0 -8 Q1 -1 8 0 Q1 1 0 8 Q-1 1 -8 0 Q-1 -1 0 -8Z';
const PROMPT = '"dragon breathing fire"';
const STYLE = 'Geometric style';
const NAV = [['Dashboard', 158], ['Catalog', 222], ['Shop', 275], ['Community', 332], ['Support', 400]];

const ICON = {
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  cursor: '<path d="M6 3l12 8-5.2 1.2L10.5 18z"/>',
  hand: '<path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11M11 10V5a1.5 1.5 0 0 1 3 0v6M14 10V6.5a1.5 1.5 0 0 1 3 0V14c0 3.5-2.5 6-5.5 6C9 20 7.5 18.5 6 16l-1.6-3c-.5-.9.6-1.8 1.4-1.2L8 13.5"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>',
  add: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v10M7 12h10"/>',
  wand: '<rect x="3.5" y="5" width="12" height="14" rx="2"/><path d="M19 4v5M16.5 6.5h5M8 12h4M8 15h6"/>',
  shapes: '<circle cx="9" cy="9" r="5"/><circle cx="15" cy="15" r="5" fill="#5a5a5a"/>',
  text: '<path d="M5 5.5h14M12 5.5v14"/>',
  dots: '<path d="M12 5v.01M12 12v.01M12 19v.01" stroke-width="3"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  pen: '<rect x="3.5" y="5" width="15" height="15" rx="3"/><path d="M20 3.5l-9 9-.8 3 3-.8 9-9z" fill="#ffffff"/>',
  magic: '<path d="M10 3l1.9 5.1L17 10l-5.1 1.9L10 17l-1.9-5.1L3 10l5.1-1.9zM18 14l1 2.6 2.6 1-2.6 1L18 21.2l-1-2.6-2.6-1 2.6-1z"/>',
  check: '<path d="M6 12.5l4 4 8-9"/>',
};
const SVG = (cls, body, style) => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="0 0 24 24">${body}</svg>`;

const EASEL = (() => {
  let o = `<svg viewBox="0 0 150 210">`;
  o += `<path d="M62 26 L67 10 Q75 4 83 10 L88 26 M34 184 L22 206 M116 184 L128 206 M75 184 L75 198" stroke="${PURPLE}" stroke-width="5.5" fill="none"/>`;
  o += `<rect x="6" y="26" width="138" height="158" rx="8" fill="#ffffff" stroke="${PURPLE}" stroke-width="5.5"/>`;
  o += `<path d="M30 52 L55 66 L75 42 L95 66 L120 52 C124 84 108 106 75 112 C42 106 26 84 30 52 Z" fill="${GREY}" stroke="none"/>`;
  o += `<path d="M54 66 L75 92 L96 66" stroke="#ffffff" stroke-width="4" fill="none"/>`;
  o += `<path d="M75 110 C73 126 76 140 72 160" stroke="${GREY}" stroke-width="6" fill="none"/>`;
  o += `<path d="M73 146 C54 146 46 134 45 118 C62 122 72 130 73 146 Z M75 136 C92 132 100 122 101 106 C86 110 77 120 75 136 Z" fill="${GREY}" stroke="none"/>`;
  for (let k = 0; k < BANDS; k++) o += `<rect class="${P}-bn" x="10" y="${(38 + k * 10.5).toFixed(1)}" width="130" height="11.4" fill="#ffffff" fill-opacity="1" stroke="none"/>`;
  SPARKS.forEach(([x, y]) => { o += `<g class="${P}-sp" transform="translate(${x} ${y}) scale(0)" opacity="0"><path d="${STAR}" fill="${YELLOW}" stroke="none"/></g>`; });
  return o + '</svg>';
})();

const ruleTop = (() => {
  let ticks = '', nums = '';
  for (let x = 20, n = 1; x < ROOT_W; x += 40, n++) { ticks += `M${x} 0v10`; nums += `<p style="left: ${x + 3}px">${n}</p>`; }
  for (let x = 20; x < ROOT_W; x += 10) ticks += `M${x} 7v3`;
  return `<svg width="${ROOT_W}" height="10" viewBox="0 0 ${ROOT_W} 10"><path d="${ticks}"/></svg>${nums}`;
})();
const ruleLeft = (() => {
  let ticks = '', nums = '';
  for (let y = 22, n = 1; y < ROOT_H - 68 - 10; y += 40, n++) { ticks += `M0 ${y}h16`; nums += `<p style="top: ${y + 2}px">${n}</p>`; }
  for (let y = 22; y < ROOT_H - 68; y += 10) ticks += `M12 ${y}h4`;
  return `<svg width="16" height="${ROOT_H - 68}" viewBox="0 0 16 ${ROOT_H - 68}"><path d="${ticks}"/></svg>${nums}`;
})();

export default {
  id: 'glowforge-magic-canvas',
  label: 'Glowforge Magic Canvas (2023)',
  source: {
    platform: "Glowforge web design app (app.glowforge.com/designs/new) in desktop Chrome, the Premium 'Magic Canvas' text-to-image card over the laser-bed canvas; light tool row, dark teal top nav, ruled bed",
    feature: "Text-to-image for laser engraving: after 'Make Magic!' the card swaps to its result layout and carries the wait with a looping easel placeholder only (a purple easel outline, a grey tulip glyph drawn in from the top down and small yellow sparkles twinkling, then the easel is empty); 'Make more Magic!' and 'Use this image' stay grey until the picture lands, then the picture replaces the easel in one hard step and the buttons turn active. No status word, percent or timer is ever shown",
    capture: {
      url: 'https://www.youtube.com/watch?v=_KtrCQXwirw',
      page: "Testing Glowforge's New MAGIC CANVAS Feature! (third-party maker channel, unedited full-screen Chrome recording, 1920x1080)",
      date: '2023-02-11',
      retrieved: '2026-10-17',
      timestamps: "t = 46.0 s the picker; t = 46.5-47.2 s 'Make Magic!' clicked; t = 47.5 s easel with the tulip starting; t = 48.5 s tulip drawn in to the middle with sparkles (gf_KtrC_48.5); t = 49.5 s tulip full; t = 50.0 s the empty easel (gf_KtrC_50.0), buttons grey; t = 50.4 s the picture lands in one step; t = 51.5 s landed, 'Make more Magic!' teal, 'Use this image' dark check (gf_KtrC_51.5); the wait is ~3.3 s wall-clock",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=_KtrCQXwirw', published: '2023-02-11', retrieved: '2026-10-17', note: "primary: uncut Magic Canvas wait, 1080p screen recording of app.glowforge.com" },
      { url: 'https://www.youtube.com/watch?v=emCRRetqMPs', published: '2023', retrieved: '2026-10-17', note: "official promo, cut: easel at t = 6 s, result at t = 7 s; corroboration of the easel placeholder only" },
      { url: 'https://glowforge.com/latest-improvements/a-better-magic-canvas-image-model', published: 'undated, current at retrieval', retrieved: '2026-10-17', note: 'first-party page: Magic Canvas still ships with an upgraded image model' },
    ],
    extrapolated: [
      "the landing: the footage lands ONE 520 x 520 line-art picture in the card; here the easel goes at the first landing and ten pictures sit in a 5 x 2 sheet that fills in strict reading order (a static black-and-white line grade), and the buttons turn active at the first landing",
      "the pace: the footage waits ~3.3 s; the beat plays it in the same ~1.8 s window every module of this family uses, so the tulip's draw-in, the sparkle periods and the empty-easel beat are compressed with it",
      "the animation's timing: the easel was read from 0.5 s stills, so the tulip sweeps once top to bottom (12 soft-edged bands, as the footage's soft ~20-40 px vertical gradient) and the eight sparkles pop 0.6 -> 1.2 -> 0 on fixed periods and phases, all pure functions of t",
      "the card's size and the page's scale: the live card is ~990 x 700 px of a 1456 px view; here the page is redrawn at 560 px wide with the card 480 x 330 px (chrome redrawn, not scaled copies)",
      "the button states: 'Use this image' keeps its white outlined look and turns from a grey check and grey text to a dark check and dark text at the landing, as in the footage's landed frame, while 'Make more Magic!' goes from grey to teal",
      "omitted from the footage: the Glowforge wordmark, the account name, the 'NEW' badge, the Offline / Print machine corner, the browser tab strip and address bar, the thumbnail strip under the picture",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'glowforge-magic-canvas');
    const grade = (g) => (g.grade ? `${g.grade} grayscale(1) contrast(1.15)` : 'grayscale(1) contrast(1.15)');   // the line-art grade of the engraving sheet, static
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${grade(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const tool = (left, icon, cls) => SVG(cls || '', icon, `left: ${left}px`);
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-rt">${ruleTop}</div><div class="${P}-rl">${ruleLeft}</div><div class="${P}-bd"></div>`
      + `<div class="${P}-nv">${NAV.map(([n, c]) => `<p style="left: ${c - 32}px">${n}</p>`).join('')}</div>`
      + `<div class="${P}-tr">`
      + tool(34, ICON.minus) + `<div class="${P}-zp"><p>100%</p>${SVG('', ICON.chev)}</div>` + tool(94, ICON.plus)
      + tool(212, ICON.cursor, `${P}-ac`) + tool(229, ICON.hand) + tool(246, ICON.undo, `${P}-dm`) + tool(263, ICON.redo, `${P}-dm`)
      + `<div class="${P}-ad">${SVG('', ICON.add)}</div>`
      + tool(311, ICON.wand) + tool(328, ICON.shapes) + tool(346, ICON.text) + tool(363, ICON.dots)
      + `</div>`
      + `<div class="${P}-cd">`
      + `<div class="${P}-hd">${SVG(`${P}-bk`, ICON.back)}<p class="${P}-ht">${PROMPT} — <i>${STYLE}</i></p><div class="${P}-ed">${SVG('', ICON.pen)}<p>Edit</p></div></div>`
      + `<div class="${P}-sg"><div class="${P}-es">${EASEL}</div><div class="${P}-gd">${tiles.map(cell).join('')}</div></div>`
      + `<p class="${P}-mm">${SVG('', ICON.magic)}Make more Magic!</p>`
      + `<p class="${P}-ui"><i></i>${SVG('', ICON.check)}Use this image</p>`
      + `</div>`
      + `</div>`);
    const es = root.querySelector(`.${P}-es`), grid = root.querySelector(`.${P}-gd`);
    const bands = [...root.querySelectorAll(`.${P}-bn`)];
    const sparks = [...root.querySelectorAll(`.${P}-sp`)];
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
        const gone = s >= LAND[0];                     // the easel goes at the first landing
        const wait = s < CLEAR;                        // tulip and sparkles live until the easel clears
        const p = gone || !wait ? 0 : Math.min(Math.max((s - TUL0) / (TUL1 - TUL0), 0), 1);

        bands.forEach((b, j) => {
          const cover = gone || !wait ? 1 : Math.min(Math.max(1 - (p * (BANDS + SOFT) - j) / SOFT, 0), 1);
          put(`b${j}`, cover.toFixed(2), (v) => { b.setAttribute('fill-opacity', v); });
        });
        sparks.forEach((g, j) => {
          const [sx, sy, per, ph] = SPARKS[j];
          let sc = 0, op = 0;
          if (wait && !gone && s >= TUL0 + 0.02) {
            const u = (((s - TUL0) / per + ph) % 1 + 1) % 1;
            const a = Math.sin(Math.PI * u);
            sc = Math.round((0.6 + 0.6 * u) * a * 20) / 20;
            op = Math.round(a * 10) / 10;
          }
          put(`s${j}`, `${sc}|${op}`, () => { g.setAttribute('transform', `translate(${sx} ${sy}) scale(${sc})`); g.setAttribute('opacity', String(op)); });
        });
        put('es', gone, (v) => { es.style.visibility = v ? 'hidden' : ''; });
        put('gd', gone, (v) => { grid.style.visibility = v ? '' : 'hidden'; });
        put('ld', gone, (v) => { root.classList.toggle(`${P}-ld`, v); });

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
