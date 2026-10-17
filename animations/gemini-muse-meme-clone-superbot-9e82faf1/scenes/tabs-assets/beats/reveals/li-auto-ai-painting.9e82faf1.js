// Li Auto AI painting (2025): the wait of the 绘画大师 (Painting Master) panel on a Li Auto L-series centre screen, from the 理想座舱用车指南 Bilibili short
// https://www.bilibili.com/video/BV1sj2vBpEJ8/ (2025-12-04, 1080x1920 portrait handheld capture; frames reveal-refs/li-auto-ai-painting/frames/li_{11.4,12.2,12.6,13.0,13.4,14.2,14.6,15.0}.png,
// spec .tmp/clone-9e82faf1/reveal-refs/li-auto-ai-painting/spec.json, confidence 0.66). The screen is a light in-car UI: a left column (gear letter, a plain grey car silhouette, three small
// control glyphs, a media card, a dock of six icons), a right painting panel (back chevron, the prompt as its title, a grid of paintings over one thin percentage bar) and a bottom climate bar;
// a small voice-assistant pill rides the top edge and the assistant's caption sits under the screen. The wait: the grid is flat empty plates at 10% and 23%, warm blurred pictures from 40%
// that stay blurred up to 80%, then every picture is sharp at 100%, a '更多风格' / '重新生成' row appears under the grid and the pill says '可以继续说'. Everything is redrawn in plain boxes and
// line glyphs; every picture is OUR meme; the car brand mark, licence plate, the film-strip of posters at the right edge, the confetti, the uploader watermark and the platform logo are omitted.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-lap';
const ROOT_W = 560, ROOT_H = 360;
const PAN_L = 156, PAN_T = 32, PAN_W = 396, PAN_H = 220;               // the painting panel
const G_L = 14, G_T = 48, T_W = 68, T_H = 50, G_X = 6;                  // 5 columns x 2 rows of landscape tiles inside it
const BAR_T = 176, BAR_W = 330;                                          // the thin progress line
const BLEED = 12;                                                        // the blur wrapper is this much bigger than its tile on every side, so a blurred edge never fades to the panel
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #e6e8ec; color: #2a2c31; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .14); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-cd { position: absolute; box-sizing: border-box; border-radius: 12px; background: #f6f7f9; }
.${P}-gr { position: absolute; left: 0; right: 0; top: 7px; text-align: center; font-size: 14px; line-height: 16px; font-weight: 500; color: #34363c; }
.${P}-car { position: absolute; left: 17px; top: 30px; width: 106px; height: 54px; }
.${P}-ic { position: absolute; width: 12px; height: 12px; stroke: #5b5e66; stroke-width: 1.8; }
.${P}-sp { position: absolute; top: 98px; width: 1px; height: 12px; background: #d6d8dd; }
.${P}-md { position: absolute; box-sizing: border-box; border-radius: 12px; background: #f8eeee; }
.${P}-cov { position: absolute; left: 8px; top: 10px; width: 24px; height: 24px; border-radius: 4px; background: linear-gradient(135deg, #2c1d22, #b8453c); }
.${P}-mt { position: absolute; left: 38px; top: 9px; font-size: 7.2px; line-height: 10px; font-weight: 700; color: #2b2b30; }
.${P}-ms { position: absolute; left: 38px; top: 21px; font-size: 6.4px; line-height: 9px; color: #7a7c82; }
.${P}-ml { position: absolute; left: 8px; top: 42px; width: 124px; height: 2px; border-radius: 1px; background: #dcd0d0; }
.${P}-mf { position: absolute; left: 0; top: 0; width: 70px; height: 2px; border-radius: 1px; background: #b4575c; }
.${P}-tr { position: absolute; top: 52px; width: 18px; height: 18px; border-radius: 50%; font-size: 6.6px; line-height: 18px; text-align: center; font-weight: 600; color: #3a3c42; }
.${P}-tr svg { position: absolute; left: 3px; top: 3px; width: 12px; height: 12px; stroke: #3a3c42; stroke-width: 1.8; }
.${P}-pl { position: absolute; left: 218px; top: 6px; box-sizing: border-box; width: 124px; height: 20px; border-radius: 10px; background: #ffffff; box-shadow: 0 1px 4px rgba(0, 0, 0, .14); }
.${P}-mc { position: absolute; left: 3px; top: 3px; width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #f3e6d3, #b89c78); }
.${P}-pt { position: absolute; left: 22px; top: 0; font-size: 7px; line-height: 20px; color: #3a3c42; }
.${P}-st { position: absolute; top: 8px; font-size: 6.4px; line-height: 9px; color: #6d7078; }
.${P}-pn { position: absolute; left: ${PAN_L}px; top: ${PAN_T}px; box-sizing: border-box; width: ${PAN_W}px; height: ${PAN_H}px; border-radius: 12px; background: #f6f7f9; }
.${P}-bk { position: absolute; left: 10px; top: 8px; box-sizing: border-box; width: 26px; height: 26px; border-radius: 8px; background: #e9ebee; }
.${P}-bk svg { position: absolute; left: 8px; top: 8px; width: 10px; height: 10px; stroke: #5b5e66; stroke-width: 2.2; }
.${P}-ti { position: absolute; left: 46px; top: 14px; font-size: 10px; line-height: 14px; font-weight: 600; color: #2a2c31; }
.${P}-gd { position: absolute; left: ${G_L}px; top: ${G_T}px; display: grid; grid-template-columns: repeat(5, ${T_W}px); column-gap: ${G_X}px; row-gap: ${G_X}px; }
.${P}-t { position: relative; width: ${T_W}px; height: ${T_H}px; overflow: hidden; border-radius: 6px; background: #d3d6da; }
.${P}-bw { position: absolute; left: -${BLEED}px; top: -${BLEED}px; right: -${BLEED}px; bottom: -${BLEED}px; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #d3d6da; }
.${P}-bl { position: absolute; left: ${G_L}px; top: ${BAR_T}px; width: ${BAR_W}px; height: 2px; border-radius: 1px; background: #d6d8dc; }
.${P}-bf { position: absolute; left: 0; top: 0; height: 2px; border-radius: 1px; background: #8a8c90; }
.${P}-pc { position: absolute; left: ${G_L + BAR_W + 8}px; top: ${BAR_T - 5}px; width: 34px; font-size: 7.4px; line-height: 12px; color: #6a6c70; }
.${P}-rw { position: absolute; left: 0; top: 192px; width: ${PAN_W}px; height: 22px; }
.${P}-bt { position: absolute; top: 0; box-sizing: border-box; width: 64px; height: 22px; border-radius: 7px; font-size: 7.6px; line-height: 22px; text-align: center; font-weight: 600; }
.${P}-b1 { left: 130px; background: #2a2f3d; color: #ffffff; }
.${P}-b2 { left: 202px; background: #e3e5e9; color: #34363c; }
.${P}-cb { position: absolute; left: ${PAN_L}px; top: 260px; box-sizing: border-box; width: ${PAN_W}px; height: 42px; border-radius: 12px; background: #f6f7f9; }
.${P}-cl { position: absolute; top: 16px; font-size: 6.4px; line-height: 10px; color: #4a4d54; }
.${P}-cs { position: absolute; left: 34px; top: 11px; font-size: 10px; line-height: 14px; font-weight: 700; color: #2a2c31; }
.${P}-ca { position: absolute; left: 130px; top: 0; width: 300px; height: 30px; border-radius: 8px; background: rgba(18, 20, 24, .84); color: #ffffff; text-align: center; font-size: 14px; line-height: 30px; font-weight: 700; letter-spacing: .5px; }
`;

const REF = 1.84;                                   // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const PAS = 1.0;                                    // layout seconds: the pending ramp ends (footage: 10% at 12.2 s to the landing at 15.0 s)
const LAND = Array.from({ length: 10 }, (_, i) => 1.12 + i * (0.72 / 9));   // tile i turns sharp (strict reading order), the last at 1.84
// the footage's percentage as (layout second, percent): 12.2 s -> 10, 12.6 -> 23, 13.0 -> 40, 13.4 -> 50, 14.2 -> 80, the landing at 15.0 s (the span 12.2-15.0 is 2.8 s mapped onto PAS)
const PCT = [[0, 10], [0.143, 23], [0.286, 40], [0.429, 50], [0.714, 80], [1.0, 99]];
const SHOW = 30;                                    // the percentage from which the plates hold a (blurred) picture; below it they are flat empty plates, as at 10% and 23%
const blurFor = (p) => (p >= 90 ? 5 : p >= 70 ? 6 : p >= 50 ? 8 : 10);   // px on the picture wrapper by percentage: heavy up to the landing, as on the screen
const PRM = '生成一个油画风格的海底世界';
const TTL = '油画风格的海底世界';
const CAP1 = '（收到，正在准备绘图）', CAP2 = '（稍等一下哦）';
const SWAP = 65;                                    // the caption flips between 50% (first string) and 80% (second string) on the screen

const ICON = {
  chev: '<path d="M15 5l-7 7 7 7"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  home: '<path d="M4 11l8-7 8 7M6 10v9h12v-9"/>',
  cam: '<rect x="3" y="7" width="14" height="10" rx="2"/><path d="M17 11l4-2v6l-4-2"/>',
  nav: '<path d="M12 3L5 20l7-4 7 4z"/>',
  car: '<path d="M4 15l2-6h12l2 6v3H4zM7 18v2M17 18v2"/>',
  tog: '<rect x="4" y="5" width="16" height="6" rx="3"/><rect x="4" y="13" width="16" height="6" rx="3"/>',
  grid: '<rect x="5" y="5" width="5" height="5" rx="1"/><rect x="14" y="5" width="5" height="5" rx="1"/><rect x="5" y="14" width="5" height="5" rx="1"/><rect x="14" y="14" width="5" height="5" rx="1"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
  fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-6 3-6s2 3-3 6zM14 12c4 0 6 1 6 3s-3 2-6-3zM12 14c0 4-1 6-3 6s-2-3 3-6zM10 12c-4 0-6-1-6-3s3-2 6 3z"/>',
  seat: '<path d="M8 4c2 0 3 2 3 4l1 6h5l1 5M8 14l-1 6"/>',
  wind: '<path d="M4 8h10a3 3 0 1 0-3-3M4 13h14a3 3 0 1 1-3 3M4 18h7"/>',
  ac: '<path d="M4 12h9a3 3 0 1 0-3-3M4 17h12a3 3 0 1 1-3 3"/>',
  plug: '<path d="M9 4v5M15 4v5M7 9h10v3a5 5 0 0 1-10 0zM12 17v4"/>',
  swirl: '<path d="M3 15c3-6 8-6 10-2s5 2 8-3M4 19c4-2 9-2 16 0"/>',
  planet: '<circle cx="12" cy="12" r="5"/><path d="M3 15c3 3 12-1 18-7"/>',
};
const SVG = (cls, body, style, vb) => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="${vb || '0 0 24 24'}">${body}</svg>`;
const piece = (tab, x) => { let i = 1; while (i < tab.length - 1 && x > tab[i][0]) i++; const [x0, y0] = tab[i - 1], [x1, y1] = tab[i]; const f = Math.min(Math.max((x - x0) / (x1 - x0), 0), 1); return y0 + (y1 - y0) * f; };

export default {
  id: 'li-auto-ai-painting',
  label: 'Li Auto AI painting (2025)',
  source: {
    platform: 'Li Auto L-series in-car centre screen (车机, 5.x OTA with the MindGPT assistant), the 绘画大师 (Painting Master) app on the right half of the screen; voice-driven (理想同学); a third-party handheld portrait capture of the screen, 1080x1920',
    feature: "A prompt spoken or typed into 绘画大师, then the start control: the panel's grid shows four flat empty plates under one thin progress line with a trailing percentage, blurred warm pictures fill the plates from 40% and stay blurred while the percentage climbs, the assistant's caption reads '（收到，正在准备绘图）' then '（稍等一下哦）', and at 100% all four pictures are sharp at once, numbered 1-4, with a '更多风格' / '重新生成' row under them and the assistant pill reading '可以继续说'",
    capture: {
      url: 'https://www.bilibili.com/video/BV1sj2vBpEJ8/',
      page: 'https://www.bilibili.com/video/BV1sj2vBpEJ8/',
      date: '2025-12-04',
      retrieved: '2026-10-17',
      timestamps: "t = 11.4 s the prompt is accepted, the map page still shows (li_11.4); t = 12.2 s four flat empty plates, bar at 10% (li_12.2); t = 12.6 s 23% (li_12.6); t = 13.0 s 40%, blurred warm pictures in all four plates (li_13.0); t = 13.4 s 50%, caption still '（收到，正在准备绘图）' (li_13.4); t = 14.2 s 80%, caption '（稍等一下哦）' (li_14.2; the spec's 75% is the frame's 80%); t = 14.6 s still blurred, 80%; t = 15.0 s all four sharp, bar 100%, the pill 'can continue', confetti (li_15.0); t = 15.4-16.4 s the '更多风格' / '重新生成' row under the pictures (own re-download of the 480x852 rendition, crops under .tmp/clone-9e82faf1/wave-cn-build/src633/f/li_15.4.png ff.)",
    },
    refs: [
      { url: 'https://www.bilibili.com/video/BV1sj2vBpEJ8/', published: '2025-12-04', retrieved: '2026-10-17', note: '理想车主必看｜绘画大师AI 绘画太有趣了 (理想座舱用车指南)' },
    ],
    extrapolated: [
      'the landing: the footage lands FOUR pictures in a 2x2 grid at once (blurred at 14.6 s, sharp at 15.0 s); here ten pictures fill a 5x2 grid and turn from blurred to sharp one after another in strict reading order, the last at the end of the beat',
      'the grid and the size: the footage tiles are ~16:10 and large (the panel is ~45% of the screen); here the screen is redrawn at 560 px wide with 68 x 50 px tiles so ten fit under one bar, the chrome around them redrawn not scaled',
      "the pace: the footage waits ~2.8 s between 10% and the landing; the beat plays it in the same ~1.8 s window every module of this family uses, the percentage following the footage's own figures (10, 23, 40, 50, 80) piecewise, and reaching 99 just before the first picture turns sharp (100 at the first landing)",
      'the blur grades: the footage shows a warm abstract blur in each plate; here each plate shows its own picture under a stepped blur (10, 8, 6, 5 px by percentage), the grade chosen by the render clock and set on a wrapper, never on the picture; the blur px are scaled to the small tiles, not measured',
      "the caption switch: read between 50% (first string) and 80% (second); set at 65%. The caption is the burned-in subtitle under the screen in the footage; here a dark band over the bottom edge of the screen, shown while the bar is below 100%",
      "the pill: the footage's top pill carries the spoken prompt and then '可以继续说'; the prompt text here is the footage's own (油画风格的海底世界), the mascot a plain disc",
      "the media card: the footage's podcast title and cover are replaced by neutral text ('Evening mix' / 'Instrumental') and a plain gradient cover; the car is a plain grey silhouette without badge, plate or brand shape",
      "the actions row: the footage shows '更多风格' (dark) and '重新生成' (light) under the pictures a beat after they land; here it stands from the last landing",
      'omitted from the footage: the per-picture numbers 1-4 and the small caption on each picture, the movie-poster strip at the screen edge, the confetti (it would cover the tiles at the landing), the dashboard, windscreen, hands and cabin, the plate on the car render, the platform logo and the uploader watermark',
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'li-auto-ai-painting');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-bw" style="filter: none"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div></div>`;
    const ico = (n, l, t, c) => SVG(`${P}-ic`, ICON[n], `left: ${l}px; top: ${t}px${c ? `; stroke: ${c}` : ''}`);
    const lab = (txt, l) => `<p class="${P}-cl" style="left: ${l}px">${txt}</p>`;
    const root = x.el(`<div class="${P}">`
      // status strip
      + `<p class="${P}-st" style="left: 458px">SOS</p><p class="${P}-st" style="left: 484px">5G</p><p class="${P}-st" style="left: 504px">3°C</p><p class="${P}-st" style="left: 526px">11:00</p>`
      // the left column: car card
      + `<div class="${P}-cd" style="left: 8px; top: 32px; width: 140px; height: 128px"><p class="${P}-gr">P</p>`
      + `<svg class="${P}-car" viewBox="0 0 106 54"><path d="M4 38c0-5 3-8 10-10l14-4 14-11c4-3 10-4 18-4 11 0 20 4 27 12l9 3c6 2 8 6 8 12v6H4z" fill="#aeb2b9" stroke="none"/><path d="M28 24l14-11c4-3 10-4 18-4 8 0 14 2 20 6l-4 9z" fill="#4a4d55" stroke="none"/><rect x="4" y="38" width="98" height="4" rx="2" fill="#8b8f97" stroke="none"/><circle cx="28" cy="42" r="8" fill="#2a2c31" stroke="none"/><circle cx="82" cy="42" r="8" fill="#2a2c31" stroke="none"/><circle cx="28" cy="42" r="3.4" fill="#b8bcc3" stroke="none"/><circle cx="82" cy="42" r="3.4" fill="#b8bcc3" stroke="none"/></svg>`
      + ico('swirl', 28, 98) + `<div class="${P}-sp" style="left: 56px"></div>` + ico('plug', 64, 98) + `<div class="${P}-sp" style="left: 92px"></div>` + ico('swirl', 100, 98)
      + `</div>`
      // media card
      + `<div class="${P}-md" style="left: 8px; top: 166px; width: 140px; height: 86px"><div class="${P}-cov"></div><p class="${P}-mt">Evening mix</p><p class="${P}-ms">Instrumental</p>`
      + `<div class="${P}-ml"><div class="${P}-mf"></div></div>`
      + `<div class="${P}-tr" style="left: 8px">15</div><div class="${P}-tr" style="left: 40px">${SVG('', '<path d="M8 5l11 7-11 7z" fill="#3a3c42"/>')}</div><div class="${P}-tr" style="left: 72px">30</div><div class="${P}-tr" style="left: 98px">${SVG('', ICON.heart)}</div><div class="${P}-tr" style="left: 120px">${SVG('', ICON.planet, 'stroke: #2f9ad0')}</div></div>`
      // the dock on the left
      + `<div class="${P}-cd" style="left: 8px; top: 260px; width: 140px; height: 42px">${['home', 'cam', 'nav', 'car', 'tog', 'grid'].map((n, i) => ico(n, 10 + i * 22, 15)).join('')}</div>`
      // the painting panel
      + `<div class="${P}-pn">`
      + `<div class="${P}-bk">${SVG('', ICON.chev)}</div><p class="${P}-ti">${TTL}</p>`
      + `<div class="${P}-gd">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-bl"><div class="${P}-bf" style="width: 0px"></div></div><p class="${P}-pc">10%</p>`
      + `<div class="${P}-rw"><p class="${P}-bt ${P}-b1">更多风格</p><p class="${P}-bt ${P}-b2">重新生成</p></div>`
      + `</div>`
      // the climate bar
      + `<div class="${P}-cb">${ico('lock', 10, 15)}<p class="${P}-cs">26.5</p>${ico('fan', 74, 15)}${lab('A/C', 90)}${ico('seat', 114, 15, '#d8453b')}${ico('wind', 138, 15)}${ico('ac', 162, 15)}${ico('plug', 186, 15)}${ico('swirl', 210, 15)}`
      + `${lab('自动灯光', 254)}${lab('舒适模式', 300)}${lab('公路模式', 346)}</div>`
      // the assistant pill (top) and its caption band (bottom edge)
      + `<div class="${P}-pl"><div class="${P}-mc"></div><p class="${P}-pt">${PRM}</p></div>`
      + `<div class="${P}-ca" style="top: 316px">${CAP1}</div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const bf = q('bf'), pc = q('pc'), rw = q('rw'), ca = q('ca'), pt = q('pt');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ bw: n.querySelector(`.${P}-bw`), im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const landed = s >= LAND[0];
        const pct = landed ? 100 : Math.min(Math.floor(piece(PCT, Math.min(s, PAS))), 99);   // the live figure: pending 10..99, 100 once the first picture is sharp
        const shown = pct >= SHOW;
        const blur = shown ? blurFor(pct) : 0;

        put('pc', pct, (v) => { pc.textContent = `${v}%`; bf.style.width = `${(BAR_W * v / 100).toFixed(1)}px`; });
        put('cap', !landed && pct < SWAP ? 1 : !landed ? 2 : 0, (v) => { ca.style.visibility = v ? '' : 'hidden'; if (v) ca.textContent = v === 1 ? CAP1 : CAP2; });
        put('pill', landed, (v) => { pt.textContent = v ? '可以继续说' : PRM; });
        put('row', s >= LAND[9], (v) => { rw.style.visibility = v ? '' : 'hidden'; });
        cells.forEach((c, i) => {
          const sharp = s >= LAND[i];
          const b = sharp ? 0 : blur;
          const key = sharp ? 2 : shown ? 1 : 0;
          put(`i${i}`, `${key}:${b}`, () => {
            c.bw.style.filter = b ? `blur(${b}px)` : 'none';
            c.im.style.visibility = key ? '' : 'hidden';
            c.cv.style.display = key ? 'none' : '';
          });
        });
      },
    };
  },
};
