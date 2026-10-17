// Intel AI Playground (2026): the wait of the Image Gen tab, from Intel's own 'AI Playground 3.0 Demo Reel'
// https://www.youtube.com/watch?v=5Rrjy5cSWFs (Intel Technology, 2026-03-16, 1920x1080; frames reveal-refs/intel-ai-playground/frames/ip_{01_prompt_idle,02b_pending_step1,02_pending_step2,03_pending_step9,
// 07_pending_final,05_landing,crop_pill_33.0,crop_pill_33.4,crop_pill_33.8}.png, spec .tmp/clone-9e82faf1/reveal-refs/intel-ai-playground/spec.json, confidence 0.82). A light desktop workbench: a thin title bar with window
// glyphs, the canvas at the left (a 'Show History' chip, a pale output panel with ONE square picture centred in it, 'Let's Generate' over the bordered prompt box with its mode chips) and the permanent
// 'Image Gen Settings' sidebar at the right. The wait is a frosted translucent pill centred on the picture: a blue spinner over the bold 'Generating N/9', while the picture behind it is a low-resolution
// latent preview that sharpens as the counter climbs. It is then replaced by the finished image. Everything is redrawn in plain boxes and line glyphs; every picture is OUR meme; the
// 'AI PLAYGROUND from intel' wordmark, the burned-in subtitles, the Intel mark, the face in the Reference Image well and the history rail are omitted; system UI face.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-iap';
const ROOT_W = 560, ROOT_H = 410;
const SB_X = 400, SB_W = 160, TOP = 22;                              // the sidebar (right) and the thin title bar above it
const PN_X = 12, PN_Y = 46, PN_W = 376, PN_H = 240;                  // the pale output panel
const PV = 224;                                                      // the square preview inside it
const PILL_W = 118, PILL_H = 62;
const T_S = 70, T_G = 4, G_L = (PN_W - (5 * T_S + 4 * T_G)) / 2, G_T = (PN_H - (2 * T_S + T_G)) / 2;   // the landed sheet: 5 columns x 2 rows of square tiles centred in the panel
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #ffffff; color: #1b1b1f; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .14); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-bar { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${TOP}px; box-sizing: border-box; background: #ffffff; border-bottom: 1px solid #eef0f3; }
.${P}-wg { position: absolute; top: 7px; width: 8px; height: 8px; stroke: #2b2f38; stroke-width: 2; }
.${P}-hs { position: absolute; left: 7px; top: 29px; box-sizing: border-box; width: 50px; height: 12px; border-radius: 3px; background: #f0f2f5; font-size: 5.8px; line-height: 12px; text-align: center; color: #565b66; }
.${P}-hs p { position: absolute; left: 0; right: 0; top: 0; text-align: center; }
.${P}-pn { position: absolute; left: ${PN_X}px; top: ${PN_Y}px; box-sizing: border-box; width: ${PN_W}px; height: ${PN_H}px; border-radius: 4px; background: #f2f6f9; overflow: hidden; }
.${P}-pv { position: absolute; left: ${(PN_W - PV) / 2}px; top: ${(PN_H - PV) / 2}px; width: ${PV}px; height: ${PV}px; overflow: hidden; background: #1c1a3a; }
.${P}-pb { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-pz { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-pv img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-pill { position: absolute; left: ${(PN_W - PILL_W) / 2}px; top: ${(PN_H - PILL_H) / 2}px; box-sizing: border-box; width: ${PILL_W}px; height: ${PILL_H}px; border-radius: 8px; background: rgba(240, 240, 246, .56); border: 1px solid rgba(255, 255, 255, .45); box-shadow: 0 3px 10px rgba(30, 30, 60, .12); -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px); }
.${P}-sp { position: absolute; left: ${(PILL_W - 2 - 17) / 2}px; top: 9px; width: 17px; height: 17px; }
.${P}-gn { position: absolute; left: 0; right: 0; top: 33px; text-align: center; font-size: 9.2px; line-height: 12px; font-weight: 700; color: #1d1d33; }
.${P}-gd { position: absolute; left: ${G_L}px; top: ${G_T}px; display: grid; grid-template-columns: repeat(5, ${T_S}px); column-gap: ${T_G}px; row-gap: ${T_G}px; }
.${P}-t { position: relative; width: ${T_S}px; height: ${T_S}px; overflow: hidden; border-radius: 3px; background: #e4e8ee; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #e4e8ee; }
.${P}-lg { position: absolute; left: ${PN_X}px; width: ${PN_W}px; top: 297px; text-align: center; font-size: 10.5px; line-height: 14px; font-weight: 700; color: #16161a; }
.${P}-bx { position: absolute; left: ${PN_X}px; top: 316px; box-sizing: border-box; width: ${PN_W}px; height: 78px; border-radius: 5px; background: #ffffff; border: 1px solid #edf0f4; }
.${P}-pt { position: absolute; left: 7px; top: 8px; font-size: 6.4px; line-height: 9px; color: #5a5f69; }
.${P}-pl { position: absolute; left: 7px; top: 40px; width: 8px; height: 8px; stroke: #3b404a; stroke-width: 2; }
.${P}-ch { position: absolute; top: 55px; box-sizing: border-box; height: 14px; border-radius: 3px; background: #f5f6f8; font-size: 5.8px; line-height: 14px; font-weight: 700; color: #2a2f3a; }
.${P}-ch p { position: absolute; left: 0; right: 0; top: 0; text-align: center; }
.${P}-on { background: #5b9bf8; color: #ffffff; }
.${P}-sd { position: absolute; left: 330px; top: 55px; box-sizing: border-box; width: 36px; height: 14px; border-radius: 3px; }
.${P}-sd svg { position: absolute; left: 14px; top: 3px; width: 8px; height: 8px; stroke: #ffffff; stroke-width: 2.4; }
.${P}-send { background: #3f8bf4; }
.${P}-stop { background: #e03131; }
.${P}-stop i { position: absolute; left: 14px; top: 4px; width: 7px; height: 6px; border-radius: 1px; background: #ffffff; }
.${P}-fg { position: absolute; top: 397px; width: 9px; height: 9px; stroke: #4a4f59; stroke-width: 2; }
.${P}-sb { position: absolute; left: ${SB_X}px; top: ${TOP}px; box-sizing: border-box; width: ${SB_W}px; height: ${ROOT_H - TOP}px; background: #ffffff; border-left: 1px solid #e8ebf0; }
.${P}-sb p { position: absolute; font-size: 5.6px; line-height: 7px; color: #2c313b; }
.${P}-st { left: 7px; top: 3px; font-size: 7.6px !important; line-height: 10px !important; font-weight: 700; color: #16161a !important; }
.${P}-ar { position: absolute; right: 7px; top: 4px; width: 8px; height: 8px; stroke: #2b2f38; stroke-width: 2; }
.${P}-rt { position: absolute; box-sizing: border-box; border: 1px solid #e3e7ee; border-radius: 1px; background: #fbfcfd; }
.${P}-rt.${P}-sel { border-color: #4c8df6; background: #ffffff; }
.${P}-rl { position: absolute; width: 10.4px; text-align: center; font-size: 4.4px !important; line-height: 6px !important; color: #7d8491 !important; }
.${P}-fd { position: absolute; box-sizing: border-box; height: 11px; border-radius: 3px; background: #eef1f6; }
.${P}-fd p { position: absolute; left: 0; right: 0; top: 2px; text-align: center; font-size: 5.6px; color: #4b515c; }
.${P}-tk { position: absolute; left: 58px; width: 94px; height: 2.4px; border-radius: 2px; background: #e4e9f0; }
.${P}-fl { position: absolute; left: 58px; height: 2.4px; border-radius: 2px; background: #4c8df6; }
.${P}-th { position: absolute; box-sizing: border-box; width: 8px; height: 8px; border-radius: 50%; background: #ffffff; border: 1.2px solid #4c8df6; }
.${P}-cb { position: absolute; left: 51px; box-sizing: border-box; width: 7px; height: 7px; border-radius: 1.5px; background: #ffffff; border: 1px solid #a9b1be; }
.${P}-cb svg { position: absolute; left: 0.6px; top: 0.6px; width: 5px; height: 5px; stroke: #2c313b; stroke-width: 3; }
.${P}-gi { position: absolute; width: 8px; height: 8px; stroke: #5a606c; stroke-width: 2; }
.${P}-rf { position: absolute; left: 60px; top: 168px; width: 78px; height: 92px; border-radius: 2px; background: #dcdfe4; }
.${P}-bt { position: absolute; box-sizing: border-box; height: 12px; border-radius: 3px; }
.${P}-bt p { position: absolute; left: 0; right: 0; top: 2.5px; text-align: center; font-weight: 600; }
.${P}-bl { background: #4c8df6; }
.${P}-bl p { color: #ffffff !important; }
.${P}-bo { background: #ffffff; border: 1px solid #dde2ea; }
.${P}-dv { position: absolute; left: 7px; width: 145px; top: 303px; height: 1px; background: #e8ebf0; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const STEP_AT = [0, 0.34, 0.58, 0.64, 0.70, 0.76, 0.82, 0.88, 0.94];   // layout seconds at which the counter reaches 1..9 (footage: 1/9 at t=33.0-33.4, 2/9 at 33.8, then 9/9 held from 34.0)
const PAS = 1.2;                                   // layout seconds: the pill and the preview end, the sheet stands (empty tiles)
const LAND = Array.from({ length: 10 }, (_, i) => PAS + i * ((REF - PAS) / 9));   // tile i is replaced by its picture (strict reading order), the last at 1.84
const SPIN = 0.8;                                  // layout seconds per spinner turn (turn period not measured)
const BLUR = [14, 10, 7.5, 5.5, 4, 3, 2, 1.2, 0.6]; // preview blur in px at counter 1..9: discrete per step, a pure function of the counter
const PROMPT = 'Close photo up of a punk rocker on stage in the 1970s, rocking, tattoos, glasses';
const RATIOS = [['21/9', 9, 4], ['16/9', 9, 5], ['3/2', 8, 5.5], ['4/3', 8, 6], ['1/1', 7, 7], ['3/4', 6, 8], ['2/3', 5.5, 8], ['9/16', 5, 9], ['9/21', 4, 9]];

const ICON = {
  min: '<path d="M5 12h14"/>',
  max: '<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12l4 4 10-10"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01"/>',
  undo: '<path d="M9 6L4 11l5 5M4 11h10a6 6 0 010 12"/>',
  reset: '<path d="M4 12a8 8 0 0113-6l3 3M20 4v5h-5M20 12a8 8 0 01-13 6l-3-3M4 20v-5h5"/>',
  gear: '<circle cx="12" cy="12" r="3.5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
};
const SVG = (cls, body, style, vb) => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="${vb || '0 0 24 24'}">${body}</svg>`;

export default {
  id: 'intel-ai-playground',
  label: 'Intel AI Playground (2026)',
  source: {
    platform: "Intel AI Playground v3.x beta (open-source Windows AI PC app for Intel Core Ultra / Intel Arc, github.com/intel/AI-Playground), light theme, shown full-screen at 1920x1080 in Intel's own first-party demo reel",
    feature: "The Image Gen tab: after the prompt is sent, a translucent frosted pill centred on the output picture carries a small blue spinner over the bold counter 'Generating N/9' (N = the sampler step, matching 'Steps: 9' in the right sidebar) while the picture behind it is a live latent preview that sharpens step by step; the pill then clears and the finished image stays",
    capture: {
      url: 'https://www.youtube.com/watch?v=5Rrjy5cSWFs',
      page: 'https://www.youtube.com/watch?v=5Rrjy5cSWFs',
      date: '2026-03-16',
      retrieved: '2026-10-17',
      timestamps: "t = 31.0-32.5 s idle (the 'Let's Generate' page with the prompt typed; ip_01_prompt_idle); t = 33.0 and 33.4 s 'Generating 1/9' (ip_02b_pending_step1, ip_crop_pill_33.0, ip_crop_pill_33.4), t = 33.8 s 'Generating 2/9' (ip_02_pending_step2, ip_crop_pill_33.8), t = 34.0-35.0 s 'Generating 9/9' (ip_03_pending_step9, ip_07_pending_final); t = 34.5-36.5 s the pill clears and the finished image stays (ip_05_landing); 'Image Gen History' (ip_06_history_after) follows and is not part of the wait",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=5Rrjy5cSWFs', published: '2026-03-16', retrieved: '2026-10-17', note: 'AI Playground 3.0 Demo Reel (Intel Technology)' },
    ],
    extrapolated: [
      "the landing: the footage lands ONE image (the pill clears over the same square canvas); here the output panel becomes a 5x2 sheet of ten pictures that replace ten empty tiles in strict reading order, hard-swapped, no cross-fade",
      "the pace: the footage counts 1/9 and 2/9 over ~0.8 s, reaches 9/9 within ~0.2 s and holds it ~1 s; the beat plays the same shape in the ~1.8 s window every module of this family uses, the counter reaching 9 at about half of it and the preview blur stepping down with the counter",
      "the spinner: a thin light ring with a short blue arc turning in place, one turn per 0.8 s of the layout clock (period not measured), its angle a pure function of t",
      "the preview: the footage shows a low-resolution latent of the rocker; here one of our own pictures sits behind a blur grade that steps down discretely with the counter (14 px at 1/9 to 0.6 px at 9/9), the blur set per step on a wrapper, never animated",
      "the size and the page: the footage window is 1920 px wide; here the screen is redrawn at 560 px wide with a 376 px output panel and a 160 px sidebar so ten tiles fit (chrome redrawn, not a scaled copy); the ratio swatches, sliders, seed field, checkboxes and buttons keep the footage's strings",
      "the Reference Image well: the footage shows the recorder's own face; here a plain grey box",
      "the send button: red with a white square (stop) while generating as in the footage, blue with an arrow once the sheet has landed (as in the idle frame)",
      "omitted from the footage: the 'AI PLAYGROUND from intel' wordmark and the Intel mark, the burned-in subtitles ('Describe A Cool Character!', 'Have Fun Creating New Looks!'), the mouse cursor, the Intel Arc gear/history rail that opens after the landing",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'intel-ai-playground');
    const srcPv = ownSrc(ctx.src, 'intel-ai-playground-pv');
    const g0 = tiles[0];
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const lab = (cls, left, top, w, txt) => `<p class="${cls}" style="left: ${left}px; top: ${top}px${w ? `; width: ${w}px; white-space: normal` : ''}">${txt}</p>`;
    const slider = (top, fillW, thumbX, w) => `<div class="${P}-tk" style="top: ${top}px${w ? `; width: ${w}px` : ''}"></div><div class="${P}-fl" style="top: ${top}px; width: ${fillW}px"></div><div class="${P}-th" style="left: ${thumbX - 4}px; top: ${top - 2.8}px"></div>`;
    const check = (top) => `<div class="${P}-cb" style="top: ${top}px">${SVG('', ICON.check)}</div>`;
    const chip = (left, w, txt, on) => `<div class="${P}-ch${on ? ` ${P}-on` : ''}" style="left: ${left}px; width: ${w}px"><p>${txt}</p></div>`;
    const swatches = RATIOS.map(([r, w, h], i) => {
      const cx = 58 + i * 10.4 + 5.2;
      return `<div class="${P}-rt${r === '1/1' ? ` ${P}-sel` : ''}" style="left: ${(cx - w / 2).toFixed(2)}px; top: ${28 - h}px; width: ${w}px; height: ${h}px"></div>`
        + `<p class="${P}-rl" style="left: ${(cx - 5.2).toFixed(2)}px; top: 29.6px">${r}</p>`;
    }).join('');
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-bar">${SVG(`${P}-wg`, ICON.min, 'left: 523px')}${SVG(`${P}-wg`, ICON.max, 'left: 536px')}${SVG(`${P}-wg`, ICON.x, 'left: 549px')}</div>`
      + `<div class="${P}-hs"><p>Show History</p></div>`
      + `<div class="${P}-pn">`
      + `<div class="${P}-pv"><div class="${P}-pb"><div class="${P}-pz" style="transform-origin: ${g0.origin}; transform: ${restTransform(g0)}"><img src="${srcPv}" width="870" height="1024" decoding="sync" alt="Latent preview" style="visibility: hidden; filter: ${restFilter(g0)}"/></div></div></div>`
      + `<div class="${P}-gd">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-pill"><svg class="${P}-sp" viewBox="0 0 30 30"><circle cx="15" cy="15" r="12.5" stroke="#c4d8fb" stroke-width="3"/><circle class="${P}-arc" cx="15" cy="15" r="12.5" stroke="#4c8df6" stroke-width="3" stroke-dasharray="26 52.5"/></svg><p class="${P}-gn">Generating 1/9</p></div>`
      + `</div>`
      + `<p class="${P}-lg">Let's Generate</p>`
      + `<div class="${P}-bx"><p class="${P}-pt">${PROMPT}</p>${SVG(`${P}-pl`, ICON.plus)}`
      + chip(10, 28, 'Chat') + chip(40, 40, 'Image Gen', true) + chip(84, 40, 'Image Edit') + chip(128, 28, 'Video') + chip(250, 72, 'Image Gen Settings')
      + `<div class="${P}-sd ${P}-send">${SVG('', ICON.arrow)}</div><div class="${P}-sd ${P}-stop"><i></i></div></div>`
      + SVG(`${P}-fg`, ICON.gear, 'left: 9px') + SVG(`${P}-fg`, ICON.code, 'left: 22px')
      + `<div class="${P}-sb">`
      + `<p class="${P}-st">Image Gen Settings</p>${SVG(`${P}-ar`, ICON.arrow)}`
      + lab('', 7, 29.5, 0, 'Aspect Ratio') + swatches
      + lab('', 7, 46.5, 0, 'Resolution') + `<div class="${P}-fd" style="left: 58px; top: 44.5px; width: 42px"><p>1024</p></div><p style="left: 103px; top: 46.5px">×</p><div class="${P}-fd" style="left: 110px; top: 44.5px; width: 42px"><p>1024</p></div>`
      + lab('', 7, 62.5, 0, 'Steps: 9') + slider(66, 94 * 0.18, 58 + 94 * 0.18)
      + lab('', 7, 74.5, 0, 'Batch Count: 1') + slider(78, 0, 58)
      + lab('', 7, 86.5, 0, 'Seed: 457096') + `<div class="${P}-fd" style="left: 7px; top: 96px; width: 63px"><p style="text-align: left; left: 4px; color: #868d99">457096</p></div>`
      + SVG(`${P}-gi`, ICON.dice, 'left: 131px; top: 97.5px') + SVG(`${P}-gi`, ICON.undo, 'left: 143px; top: 97.5px')
      + lab('', 7, 113, 0, 'Show Preview') + check(113.5)
      + lab('', 7, 128.6, 46, 'Safety Checker Strength') + slider(132, 40, 58 + 80 * 0.5, 80) + lab('', 141, 129, 0, '0.5')
      + lab('', 7, 146.5, 40, 'Activate FaceSwap') + check(148)
      + `<div class="${P}-rf"></div>` + lab('', 7, 225, 0, 'Reference Image')
      + `<div class="${P}-bt ${P}-bl" style="left: 73px; top: 282px; width: 52px"><p>Load Image</p></div>`
      + `<div class="${P}-dv"></div>`
      + SVG(`${P}-gi`, ICON.reset, 'left: 37px; top: 309px') + lab('', 48, 309, 0, 'Reset Preset Settings')
      + `<div class="${P}-bt ${P}-bo" style="left: 55px; top: 326px; width: 48px"><p>Open ComfyUI</p></div>`
      + `<div class="${P}-bt ${P}-bo" style="left: 50px; top: 345px; width: 58px"><p>Create New Preset</p></div>`
      + `</div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const pv = q('pv'), pb = q('pb'), pill = q('pill'), gd = q('gd'), arc = q('arc'), gn = q('gn'), stop = q('stop'), send = q('send');
    const pvImg = pv.querySelector('img');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate([pvImg, ...cells.map((c) => c.im)]);

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const pending = s < PAS;                       // the pill over the preview; the sheet after it
        const n = STEP_AT.filter((a) => s >= a).length;   // the counter, 1..9 (9 stays once reached)
        const ang = pending ? Math.round(((s / SPIN) % 1) * 360) : 0;   // spinner angle, a pure function of s while the pill shows

        put('ph', pending, (v) => {
          pv.style.visibility = v ? '' : 'hidden'; pvImg.style.visibility = v ? '' : 'hidden'; pill.style.visibility = v ? '' : 'hidden';
          gd.style.visibility = v ? 'hidden' : ''; stop.style.visibility = v ? '' : 'hidden'; send.style.visibility = v ? 'hidden' : '';
        });
        put('n', n, (v) => {
          gn.textContent = `Generating ${v}/9`;
          const b = BLUR[v - 1];
          pb.style.filter = `blur(${b}px)`;
          pb.style.transform = `scale(${(1 + b * 0.014).toFixed(3)})`;
        });
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
