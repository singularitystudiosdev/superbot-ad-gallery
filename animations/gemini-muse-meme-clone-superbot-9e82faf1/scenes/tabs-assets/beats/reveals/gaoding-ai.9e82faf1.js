// 稿定 AI (GaoDing AI, 2025): the whole screen of the design editor's AI-agent flow, read from the vendor's own Bilibili tutorial BV1ZSbpzEEmi
// (3分钟带你快速上手稿定AI, 稿定设计, 2025-08-17, wait t = 77-86 s; frames reveal-refs/gaoding-ai/frames/bn_*.png, spec .tmp/clone-9e82faf1/reveal-refs/gaoding-ai/spec.json, confidence 0.55).
// A white design editor: a slim top bar, a floating tool rail, and a pale canvas whose material region is an EMPTY dashed marquee while the job runs; on the right the
// agent panel with the '对话 | 属性' tabs, a stack of task rows ('任务执行' with a spinner, turning to '任务完成' with a check), the section heading 'IP 主形象', a rounded
// lilac-to-aqua diagonal gradient tile holding one large dark centred percentage that counts up (36 -> 68 -> 76 -> 86 -> 90 -> 100) with the grey line
// '正在打磨方案中。' and a teal wand glyph under it, and the composer ('描述你的想法，输入 / 选择'). No bar, ring, ETA, timer or queue position exists.
// Omitted: the 稿定 logo and wordmark, the account avatar, every VIP / credit / upgrade control, and the clip author's burnt-in white-on-black subtitles (not product UI).
// Every picture is OUR meme, system UI face only.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-gdo';
const ROOT_W = 560, ROOT_H = 390;
const FONT = `'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans CJK SC', ${UI_FONT}`;
const COLS = 5, TILE_W = 52, TILE_H = 64, GAP = 5;                       // the delivered sheet: five columns by two rows
const MQ_X = 44, MQ_Y = 118, MQ_W = 296, MQ_H = 149;                     // the material region on the canvas
const PN_X = 356, PN_Y = 32, PN_W = 196, PN_H = 352;                     // the agent panel
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 10px; background: #f2f3f5; color: #1f2329; font-family: ${FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .08); }
.${P} p { margin: 0; }
.${P} svg { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-tp { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: 26px; background: #fff; }
.${P}-tp svg { position: absolute; top: 8px; width: 10px; height: 10px; stroke: #8a8f98; stroke-width: 1.1; }
.${P}-ex { position: absolute; right: 8px; top: 5px; height: 16px; box-sizing: border-box; padding: 0 9px; border-radius: 5px; background: #eceef1; font-size: 6.8px; line-height: 16px; font-weight: 500; color: #2b2f36; white-space: nowrap; }
.${P}-lg { position: absolute; left: 13px; top: 8px; width: 26px; height: 10px; }
.${P}-lg i { position: absolute; top: 3px; height: 4px; border-radius: 2px; background: #c8ccd3; }
.${P}-rl { position: absolute; left: 8px; top: 38px; width: 22px; height: 160px; box-sizing: border-box; border-radius: 7px; background: #fff; box-shadow: 0 1px 4px rgba(20, 30, 50, .1); }
.${P}-rl svg { position: absolute; left: 5px; width: 12px; height: 12px; stroke: #3a3f47; stroke-width: 1.1; }
.${P}-mq { position: absolute; left: ${MQ_X}px; top: ${MQ_Y}px; width: ${MQ_W}px; height: ${MQ_H}px; box-sizing: border-box; background: #fafbfc; }
.${P}-dz { position: absolute; left: ${MQ_X}px; top: ${MQ_Y}px; width: ${MQ_W}px; height: ${MQ_H}px; box-sizing: border-box; border: 1px dashed #38b4e6; }
.${P}-g { position: absolute; left: 8px; top: 8px; display: grid; grid-template-columns: repeat(${COLS}, ${TILE_W}px); grid-auto-rows: ${TILE_H}px; gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TILE_W}px; height: ${TILE_H}px; overflow: hidden; border-radius: 2px; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: transparent; }
.${P}-zm { position: absolute; left: 8px; top: 366px; height: 15px; box-sizing: border-box; padding: 0 7px; border-radius: 5px; background: #fff; box-shadow: 0 1px 3px rgba(20, 30, 50, .1); font-size: 6.4px; line-height: 15px; color: #444a53; white-space: nowrap; }
.${P}-qm { position: absolute; left: 50px; top: 366px; width: 15px; height: 15px; box-sizing: border-box; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(20, 30, 50, .1); font-size: 6.4px; line-height: 15px; text-align: center; color: #444a53; }
.${P}-pn { position: absolute; left: ${PN_X}px; top: ${PN_Y}px; width: ${PN_W}px; height: ${PN_H}px; box-sizing: border-box; border-radius: 11px; background: #fff; box-shadow: 0 2px 10px rgba(20, 30, 50, .1); overflow: hidden; }
.${P}-tb { position: absolute; left: 10px; top: 9px; font-size: 7.4px; line-height: 11px; font-weight: 600; color: #1f2329; white-space: nowrap; }
.${P}-tb span { position: absolute; left: 28px; font-weight: 400; color: #b4b8bf; }
.${P}-hi { position: absolute; top: 9px; width: 10px; height: 10px; stroke: #6d727b; stroke-width: 1.1; }
.${P}-tk { position: absolute; left: 8px; top: 28px; width: 180px; height: 54px; box-sizing: border-box; border-radius: 7px; background: #fff; box-shadow: 0 0 0 1px #eceef1, 0 1px 3px rgba(20, 30, 50, .06); }
.${P}-rw { position: absolute; left: 0; width: 180px; height: 18px; }
.${P}-rw svg { position: absolute; left: 9px; top: 4.5px; width: 9px; height: 9px; }
.${P}-rw p { position: absolute; left: 23px; top: 0; font-size: 6.8px; line-height: 18px; font-weight: 500; color: #23272e; white-space: nowrap; }
.${P}-sk { stroke: rgba(0, 190, 200, .22); stroke-width: 1.5; }
.${P}-sw { stroke: #16b8c6; stroke-width: 1.5; }
.${P}-ck { stroke: #3c424b; stroke-width: 1.1; }
.${P}-cl { position: absolute; left: 8px; width: 180px; height: 18px; box-sizing: border-box; border-radius: 6px; background: #f6f7f9; }
.${P}-cl svg { position: absolute; top: 5px; width: 8px; height: 8px; stroke: #6d727b; stroke-width: 1.1; }
.${P}-cl p { position: absolute; left: 22px; top: 0; font-size: 6.6px; line-height: 18px; color: #4a4f58; white-space: nowrap; }
.${P}-h { position: absolute; left: 10px; top: 133px; height: 11px; display: flex; align-items: center; gap: 4px; font-size: 6.8px; line-height: 11px; font-weight: 600; color: #4d2a85; white-space: nowrap; }
.${P}-h svg { flex: none; width: 8px; height: 8px; stroke: #4d2a85; stroke-width: 1.1; }
.${P}-ti { position: absolute; left: 10px; top: 150px; width: 176px; height: 120px; box-sizing: border-box; border-radius: 9px; background: linear-gradient(142deg, #e3dbfb 0%, #c3e5fb 26%, #8ae9f8 58%, #4fe0f8 100%); box-shadow: 0 2px 8px rgba(79, 224, 248, .18); }
.${P}-ti::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 34px; border-radius: 0 0 9px 9px; background: linear-gradient(0deg, rgba(235, 228, 252, .55) 0%, rgba(235, 228, 252, 0) 100%); }
.${P}-pc { position: absolute; left: 0; right: 0; top: 0; bottom: 0; z-index: 1; display: flex; align-items: center; justify-content: center; font-size: 14px; line-height: 16px; font-weight: 700; letter-spacing: .2px; color: #1b2a45; }
.${P}-cp { position: absolute; left: 10px; top: 277px; height: 11px; display: flex; align-items: center; gap: 4px; font-size: 6.6px; line-height: 11px; color: #8a8f98; white-space: nowrap; }
.${P}-cp svg { flex: none; width: 8px; height: 8px; stroke: #19b8c6; stroke-width: 1.1; }
.${P}-cm { position: absolute; left: 8px; top: 298px; width: 180px; height: 46px; box-sizing: border-box; border-radius: 8px; background: #fff; box-shadow: 0 0 0 1px #e6e8ec; }
.${P}-ph { position: absolute; left: 8px; top: 7px; font-size: 6.2px; line-height: 9px; color: #a3a8b0; white-space: nowrap; }
.${P}-ag { position: absolute; left: 8px; top: 27px; height: 12px; box-sizing: border-box; padding: 0 6px 0 14px; border-radius: 6px; background: #f2f3f5; font-size: 6px; line-height: 12px; color: #454a53; white-space: nowrap; }
.${P}-ag i { position: absolute; left: 5px; top: 3.5px; width: 5px; height: 5px; box-sizing: border-box; border-radius: 50%; border: 1px solid #8a8f98; }
.${P}-cm svg { position: absolute; top: 28px; width: 10px; height: 10px; stroke: #6d727b; stroke-width: 1.1; }
.${P}-sd { position: absolute; right: 7px; top: 26px; width: 14px; height: 14px; border-radius: 50%; background: #2a2d33; }
.${P}-sd i { position: absolute; left: 4.5px; top: 4.5px; width: 5px; height: 5px; border-radius: 1px; background: #fff; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const LAND = Array.from({ length: 10 }, (_, i) => 1.04 + i * (0.64 / 9));  // sheet tile i is delivered (strict reading order), the last at 1.68
const SHOWN = [0, 0.5, 1.0];                       // task row i appears
const FLIP = [0.5, 1.0, 1.68];                     // task row i flips from '任务执行' to '任务完成'; the last at the final landing
const PCT_S = [0, 0.3, 0.6, 0.9, 1.2, 1.68];       // the percentage's knots, layout seconds ...
const PCT_V = [36, 68, 76, 86, 90, 100];           // ... and the values the recording read at its one-second samples (36, 68, 76, 86, 90), ending at 100
const TURN = 540;                                  // the task spinner's travel, degrees per layout second

const f1 = (v) => v.toFixed(1);
const pct = (s) => {
  if (s >= PCT_S[PCT_S.length - 1]) return 100;
  for (let i = 1; i < PCT_S.length; i++) {
    if (s < PCT_S[i]) return Math.floor(PCT_V[i - 1] + (PCT_V[i] - PCT_V[i - 1]) * ((s - PCT_S[i - 1]) / (PCT_S[i] - PCT_S[i - 1])));
  }
  return 100;
};
const R = 3.9, CIRC = 2 * Math.PI * R;
const ring = `<svg class="${P}-sp" viewBox="0 0 10 10"><circle class="${P}-sk" cx="5" cy="5" r="${R}"/><g class="${P}-ag2"><circle class="${P}-sw" cx="5" cy="5" r="${R}" stroke-dasharray="${(CIRC * 0.7).toFixed(2)} ${(CIRC * 0.3).toFixed(2)}"/></g></svg>`;
const check = `<svg class="${P}-dn" viewBox="0 0 10 10"><circle class="${P}-ck" cx="5" cy="5" r="${R}"/><path class="${P}-ck" d="M3.2 5.1 4.5 6.4 6.9 3.8"/></svg>`;
const railPaths = [
  'M3.5 6.5V3a.9.9 0 0 1 1.8 0v2.5V2.4a.9.9 0 0 1 1.8 0v3V3.1a.9.9 0 0 1 1.8 0v4.2c0 1.8-1.2 3-2.8 3-1.2 0-2-.6-2.7-1.6L1.8 7a.9.9 0 0 1 1.5-.9Z',
  'M4 1.8v8.4M8 1.8v8.4M1.8 4h8.4M1.8 8h8.4',
  'M2 2.5h8v7H2ZM2 8l2.6-2.6 2 2 1.4-1.4L10 8M7.6 4.4h.1',
  'M2.5 3h7M6 3v7',
  'M2.5 3.2h7v5.6h-7Z',
  'M2.5 2.5h7v5l-2 2h-5ZM7.5 9.5v-2h2',
  'M6 3.2a1.8 1.8 0 1 0 0 .01ZM3 10c.5-2 5.5-2 6 0M6 1.5a4.5 4.5 0 1 0 .01 0Z',
  'M2.2 6a3.8 3.8 0 1 0 1.1-2.7M2.2 1.8v2h2M6 4v2.2l1.4.8',
];
const rail = railPaths.map((d, i) => `<svg viewBox="0 0 12 12" style="top: ${6 + i * 19}px"><path d="${d}"/></svg>`).join('');
const WAND = '<svg viewBox="0 0 10 10"><path d="M2 8 6.6 3.4M5.8 2.2 7.8 4.2M7.6.8v1.2M8.4 1.4H6.8M2.4 3.2v1M2.9 3.7H1.9"/></svg>';
const CHEV = (x) => `<svg viewBox="0 0 10 10" style="left: ${x}px"><path d="M2.5 3.8 5 6.3 7.5 3.8"/></svg>`;

export default {
  id: 'gaoding-ai',
  label: '稿定 AI (2025)',
  source: {
    platform: "稿定 AI (gaoding.com), the design editor's AI-agent flow in desktop web: a design canvas on the left and the agent panel with '对话 | 属性' tabs on the right, Simplified Chinese UI, captured from the vendor's own official Bilibili tutorial (稿定设计)",
    feature: "the wait of one agent task (the IP mascot flow): the canvas's material region is an empty dashed marquee; in the agent panel a stack of task rows runs ('任务执行' with a spinner glyph, turning to '任务完成' with a check), under the section heading 'IP 主形象' a rounded lilac-to-aqua diagonal gradient tile carries one large dark centred percentage counting up (36% > 68% > 76% > 86% > 90%) and the grey line '正在打磨方案中。' with a teal wand glyph sits under it; the finished artwork then lands in the marquee and the tile is replaced by the artifact. No bar, ring, ETA, timer or queue position exists",
    capture: {
      url: 'https://www.bilibili.com/video/BV1ZSbpzEEmi/',
      date: '2025-08-17',
      timestamps: "video BV1ZSbpzEEmi '3分钟带你快速上手稿定AI（保姆级教程）' (稿定设计, 192 s, captured 480x642 at 1 fps): tile 36% t = 77 s (bn_tile36pct_t77), 68% t = 78 s, 76% with the dashed canvas marquee t = 79 s (bn_tile76pct_t79), 86% t = 80 s, 90% with the first artwork already sharp on the canvas t = 81 s (bn_tile90pct_t81), caption '正在打磨方案中。' and the task rows '任务执行' / '任务完成' t = 84-86 s (bn_caption_zoom_t84_t86, bn_taskrow_zoom_t86, bn_taskrows_and_done_t86)",
    },
    refs: [
      { url: 'https://www.bilibili.com/video/BV1ZSbpzEEmi/', published: '2025-08-17', retrieved: '2026-10-15', note: "the whole editor screen (floating tool rail, dashed canvas marquee, agent panel tabs, task rows, 'IP 主形象' counting gradient tile, caption, composer)" },
    ],
    extrapolated: [
      "ten pictures from one: the footage lands ONE mascot sheet in the marquee (a banner of one hero image beside a four-up sheet); here the marquee fills with a 5 x 2 sheet of ten pictures in strict reading order, each tile delivered on its own clock, the dashed outline dropping when the last has landed (the recording's marquee is a tall portrait region down the whole canvas; ours is a wide 296 x 149 region sized to the sheet, the empty canvas around it left bare)",
      "all timing: the recording samples the count at one second (36, 68, 76, 86, 90), so the true rate is unknown; here the percentage is a pure function of the shared 1.84 s beat through those five values plus 100 at the final landing, the task rows appear at 0 / 0.5 / 1.0 s and flip to '任务完成' at 0.5 / 1.0 / 1.68 s, and the tiles land 0.07 s apart from 1.04 s",
      "the count's end: the recording shows the tile replaced by the finished artifact after 90%; here the tile stays at 100% and its caption '正在打磨方案中。' goes when the last tile lands (no extra artifact thumbnail is drawn, since every picture on screen is one of the ten)",
      "three task rows: the recording shows one '任务执行' row above one '任务完成' row in a 480 x 642 frame and never a full run; the third row and the order of their flips are ours",
      "the two collapsed cards above the heading carry the recording's own card titles ('知识检索', 'IP 设计方案') without their body text; the cards' open state and text are not shown",
      "the marquee outline is the recording's thin cyan dashed rectangle; the pale artboard fill, the zoom control ('100%', '?') and the tool-rail glyphs are our own drawings of the editor's chrome, and the top bar's mark is a generic bar of our own in place of the product logo (omitted)",
      "the gradient tile's exact stops are read off a 480 x 642 encode (pale lilac top left, bright aqua toward the right and centre, a pale lilac fade at the foot); the caption's fourth glyph reads 打磨 (打包 is the other candidate)",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'gaoding-ai');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const row = (i) => `<div class="${P}-rw ${P}-r${i}" style="top: ${i * 17 + 1}px">${ring}${check}<p class="${P}-rx"></p></div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-tp"><div class="${P}-lg"><i style="left: 0; width: 8px"></i><i style="left: 11px; width: 15px"></i></div>`
      + `<svg viewBox="0 0 10 10" style="left: 56px"><path d="M6.5 2 3.5 5l3 3"/></svg><svg viewBox="0 0 10 10" style="left: 74px"><path d="M3.5 2l3 3-3 3"/></svg><p class="${P}-ex">导出</p></div>`
      + `<div class="${P}-rl">${rail}</div>`
      + `<div class="${P}-mq"><div class="${P}-g">${tiles.map(cell).join('')}</div></div>`
      + `<div class="${P}-dz"></div>`
      + `<p class="${P}-zm">100%</p><p class="${P}-qm">?</p>`
      + `<div class="${P}-pn">`
      + `<p class="${P}-tb">对话<span>属性</span></p>`
      + `<svg class="${P}-hi" viewBox="0 0 12 12" style="left: ${PN_W - 54}px"><path d="M2 3.2a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 10 3.2v3.6a1.5 1.5 0 0 1-1.5 1.5H5.2L3 10.2V8.3H3.5A1.5 1.5 0 0 1 2 6.8Z"/></svg>`
      + `<svg class="${P}-hi" viewBox="0 0 12 12" style="left: ${PN_W - 36}px"><path d="M2 3h8M2 6h4M2 9h3M8 6.2a2 2 0 1 0 .01 0ZM8 7v1l.7.5"/></svg>`
      + `<svg class="${P}-hi" viewBox="0 0 12 12" style="left: ${PN_W - 18}px"><path d="M7.6 2.2v2.2h2.2M4.4 9.8V7.6H2.2M7.6 4.4 10.4 1.6M4.4 7.6 1.6 10.4"/></svg>`
      + `<div class="${P}-tk">${[0, 1, 2].map(row).join('')}</div>`
      + `<div class="${P}-cl" style="top: 88px"><svg viewBox="0 0 10 10" style="left: 8px"><circle cx="3.2" cy="5.6" r="1.6"/><circle cx="6.8" cy="5.6" r="1.6"/><path d="M3.2 4V2.4h3.6V4"/></svg><p>知识检索</p>${CHEV(163)}</div>`
      + `<div class="${P}-cl" style="top: 110px"><svg viewBox="0 0 10 10" style="left: 8px"><path d="M1.8 2.4h6.4v5.2H1.8ZM3.4 4.2h3.2M3.4 5.8h2"/></svg><p>IP 设计方案</p>${CHEV(163)}</div>`
      + `<p class="${P}-h"><svg viewBox="0 0 10 10"><path d="M1.8 2h6.4v6H1.8ZM2 7l2.2-2.2 1.6 1.6 1-1L8 7"/></svg>IP 主形象</p>`
      + `<div class="${P}-ti"><p class="${P}-pc"></p></div>`
      + `<p class="${P}-cp">${WAND}正在打磨方案中。</p>`
      + `<div class="${P}-cm"><p class="${P}-ph">描述你的想法，输入 / 选择</p><p class="${P}-ag"><i></i>Agent</p>`
      + `<svg viewBox="0 0 10 10" style="left: 52px"><path d="M5 2v6M2 5h6"/></svg><svg viewBox="0 0 10 10" style="left: 68px; stroke: #19b8c6"><circle cx="5" cy="5" r="3.6"/><path d="M1.4 5h7.2M5 1.4c-2 2-2 5.2 0 7.2M5 1.4c2 2 2 5.2 0 7.2"/></svg>`
      + `<div class="${P}-sd"><i></i></div></div>`
      + `</div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const dz = q('dz'), pc = q('pc'), cp = q('cp');
    const rows = [0, 1, 2].map((i) => { const r = q(`r${i}`); return { r, sp: r.querySelector(`.${P}-sp`), dn: r.querySelector(`.${P}-dn`), ag: r.querySelector(`.${P}-ag2`), tx: r.querySelector(`.${P}-rx`) }; });
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

        // the counting tile and its caption; the caption goes with the last landing
        put('pc', pct(s), (v) => { pc.textContent = `${v}%`; });
        put('cp', s >= LAND[9], (v) => { cp.style.visibility = v ? 'hidden' : ''; });

        // the task rows: each appears, runs ('任务执行', spinner), then flips to '任务完成' (check)
        rows.forEach((w, i) => {
          const on = s >= SHOWN[i], done = s >= FLIP[i];
          put(`w${i}`, on, (v) => { w.r.style.visibility = v ? '' : 'hidden'; });
          put(`f${i}`, done, (v) => { w.sp.style.visibility = v ? 'hidden' : ''; w.dn.style.visibility = v ? '' : 'hidden'; w.tx.textContent = v ? '任务完成' : '任务执行'; });
          const te = Math.min(Math.max(s - SHOWN[i], 0), Math.max(FLIP[i] - SHOWN[i], 0));   // a row's spinner stops when it completes
          put(`g${i}`, f1((te * TURN + i * 61) % 360), (v) => { w.ag.setAttribute('transform', `rotate(${v} 5 5)`); });
        });

        // the dashed marquee stays until the sheet is complete; each tile is delivered by a hard swap from the empty region
        put('dz', s >= LAND[9], (v) => { dz.style.visibility = v ? 'hidden' : ''; });
        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          put(`i${i}`, done, (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.cv.style.display = v ? 'none' : ''; });
        });
      },
    };
  },
};
