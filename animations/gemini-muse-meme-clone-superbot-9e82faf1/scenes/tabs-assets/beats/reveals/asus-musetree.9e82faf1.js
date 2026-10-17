// ASUS MuseTree (2025): the generation wait of the Idea Map in MuseTree, from the first-party film 'MuseTree – Grow Your Dreams with AI Magic'
// https://www.youtube.com/watch?v=9qHgBKKPafI (ASUS, 2025-10-31, 1920x1080; frames reveal-refs/asus-musetree/frames/mt_{idea_46.0,map_47.5,wait_49.5,wait_50.0,wait_51.0,wait_52.0,wait_52.5,wait_53.0}.png,
// spec .tmp/clone-9e82faf1/reveal-refs/asus-musetree/spec.json, confidence 0.74). The window is a dark app: a dotted dark canvas of round image nodes joined by thin peach lines (the Idea Map),
// a top strip, and the right-hand 'AI images search' rail (prompt box, Count chips, candidate thumbnails, 'Content Board'). Pressing search blacks out the WHOLE window: dead centre one peach
// glyph that morphs as the percentage under it climbs (two discs, a rounded square, a square, a quarter disc, a speech bubble, an arch), a big thin percentage and one grey caption line that
// rotates through three strings; then the black lifts and the result lands. Everything is redrawn in plain shapes (no node picture, no ASUS or MuseTree mark); every landed picture is OUR meme.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-amt';
const ROOT_W = 560, ROOT_H = 340;
const RAIL_L = 380;
const B_L = 20, B_T = 88, B_PAD = 14, B_D = 56, B_G = 8;               // the candidate board: a dark card over the map, 5 round tiles x 2 rows
const GLY = 64;                                                        // the glyph's box
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #111113; color: #e8e8ea; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(0, 0, 0, .3); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke-linecap: round; stroke-linejoin: round; }
.${P}-tb { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: 22px; background: #0b0b0c; }
.${P}-tab { position: absolute; left: 12px; top: 0; font-size: 7px; line-height: 22px; color: #d8d8dc; }
.${P}-tab-u { position: absolute; left: 12px; top: 19px; width: 36px; height: 1.5px; background: #cfa97d; }
.${P}-nt { position: absolute; right: 12px; top: 0; font-size: 6px; line-height: 22px; color: #86868c; }
.${P}-mp { position: absolute; left: 0; top: 22px; width: ${RAIL_L}px; height: ${ROOT_H - 22}px; background-color: #121214; background-image: radial-gradient(circle, #2d2d32 0.9px, transparent 1.2px); background-size: 11px 11px; }
.${P}-ed { position: absolute; left: 0; top: 22px; width: ${RAIL_L}px; height: ${ROOT_H - 22}px; }
.${P}-ed path { stroke: #b8956a; stroke-width: 1.2; }
.${P}-nd { position: absolute; border-radius: 50%; }
.${P}-nx { position: absolute; border-radius: 50%; background: #cfa97d; }
.${P}-nx svg { position: absolute; left: 50%; top: 50%; width: 9px; height: 9px; margin: -4.5px 0 0 -4.5px; stroke: #1a1612; stroke-width: 2.2; }
.${P} p.${P}-nt2 { position: absolute; font-size: 6.2px; line-height: 8.4px; text-align: center; color: #c8c8cd; white-space: normal; }
.${P}-rl { position: absolute; left: ${RAIL_L}px; top: 22px; box-sizing: border-box; width: ${ROOT_W - RAIL_L}px; height: ${ROOT_H - 22}px; background: #151517; border-left: 1px solid #2a2a2e; }
.${P}-rh { position: absolute; left: 14px; top: 14px; font-size: 8.4px; line-height: 12px; color: #eeeef0; }
.${P}-in { position: absolute; left: 12px; top: 34px; box-sizing: border-box; width: 154px; height: 46px; border: 1px solid #cfa97d; border-radius: 3px; }
.${P}-iv { position: absolute; left: 7px; top: 6px; font-size: 7.2px; line-height: 10px; color: #e4e4e8; }
.${P}-ic { position: absolute; right: 6px; bottom: 4px; font-size: 6.2px; line-height: 8px; color: #8c8c92; }
.${P}-cn { position: absolute; left: 14px; top: 92px; font-size: 7.2px; line-height: 14px; color: #a0a0a6; }
.${P}-ch { position: absolute; top: 90px; box-sizing: border-box; width: 22px; height: 15px; border-radius: 3px; font-size: 6.8px; line-height: 15px; text-align: center; color: #a0a0a6; }
.${P}-ch-on { background: #3a352e; color: #e8e8ea; }
.${P}-sb { position: absolute; left: 146px; top: 89px; width: 20px; height: 17px; border-radius: 3px; background: #cfa97d; }
.${P}-sb svg { position: absolute; left: 4px; top: 2.5px; width: 12px; height: 12px; stroke: #1a1612; stroke-width: 2; }
.${P}-th { position: absolute; top: 116px; width: 38px; height: 38px; border-radius: 50%; }
.${P}-dv { position: absolute; left: 0; right: 0; top: 168px; height: 1px; background: #2a2a2e; }
.${P}-cb { position: absolute; left: 14px; top: 180px; font-size: 8.4px; line-height: 12px; color: #eeeef0; }
.${P}-pj { position: absolute; left: 14px; top: 204px; font-size: 7.2px; line-height: 10px; color: #eeeef0; }
.${P}-mf { position: absolute; left: 56px; top: 204px; font-size: 7.2px; line-height: 10px; color: #8c8c92; }
.${P}-bd { position: absolute; left: ${B_L}px; top: ${B_T}px; box-sizing: border-box; width: ${5 * B_D + 4 * B_G + 2 * B_PAD}px; height: ${2 * B_D + B_G + 2 * B_PAD}px; border-radius: 12px; background: #1b1b1e; border: 1px solid #2e2e33; }
.${P}-gd { position: absolute; left: ${B_PAD - 1}px; top: ${B_PAD - 1}px; display: grid; grid-template-columns: repeat(5, ${B_D}px); column-gap: ${B_G}px; row-gap: ${B_G}px; }
.${P}-t { position: relative; width: ${B_D}px; height: ${B_D}px; overflow: hidden; border-radius: 50%; background: #2a2a2f; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #2a2a2f; }
.${P}-sc { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; background: #040405; }
.${P}-gl1 { position: absolute; left: 60px; top: 150px; width: 90px; height: 90px; border-radius: 50%; background: radial-gradient(circle, rgba(120, 38, 38, .28), rgba(120, 38, 38, 0) 70%); }
.${P}-gl2 { position: absolute; left: 410px; top: 130px; width: 90px; height: 90px; border-radius: 50%; background: radial-gradient(circle, rgba(60, 110, 70, .22), rgba(60, 110, 70, 0) 70%); }
.${P}-gy { position: absolute; left: ${(ROOT_W - GLY) / 2}px; top: 78px; width: ${GLY}px; height: ${GLY}px; }
.${P}-gy path { fill: #cfa97d; stroke: none; }
.${P}-pc { position: absolute; left: 0; width: ${ROOT_W}px; top: 156px; text-align: center; font-size: 27px; line-height: 34px; font-weight: 200; letter-spacing: .5px; color: #f1d9b5; }
.${P}-cp { position: absolute; left: 0; width: ${ROOT_W}px; top: 198px; text-align: center; font-size: 11px; line-height: 16px; color: #9a9a9a; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const PAS = 1.05;                                  // layout seconds: the black stands for this long, the percentage climbing 10 -> 99 (footage: ~50 points a second)
const LAND = Array.from({ length: 10 }, (_, i) => 1.12 + i * (0.72 / 9));   // picture i lands in the board (strict reading order), the last at 1.84
const CAP = ['AI inspiration exploration is starting, are you ready?', 'AI inspiration is hard at work, surprises coming soon!', 'AI inspiration exploration in progress, please wait.'];
const CAP_AT = [0, 30, 65];                        // the caption changes: footage 10% first line, 35%-60% second line, 72%-97% third line
// glyph key shapes by percent: two rects A and B, each [x, y, w, h, r_tl, r_tr, r_br, r_bl] in a 64 box; with both at the same place the glyph is one shape
const SQ = (r) => [8, 8, 48, 48, r, r, r, r];
const KEYS = [
  [10, [4, 18, 28, 28, 14, 14, 14, 14], [32, 18, 28, 28, 14, 14, 14, 14]],   // two discs
  [35, SQ(10), SQ(10)],                                                     // a rounded square
  [50, SQ(0), SQ(0)],                                                       // a square
  [60, [8, 8, 48, 48, 0, 48, 0, 0], [8, 8, 48, 48, 0, 48, 0, 0]],           // a quarter disc
  [72, [8, 8, 48, 48, 14, 14, 14, 0], [8, 8, 48, 48, 14, 14, 14, 0]],       // a speech bubble: the square with one sharp corner
  [86, [14, 6, 36, 52, 18, 18, 0, 0], [14, 6, 36, 52, 18, 18, 0, 0]],       // an arch
  [99, [14, 6, 36, 52, 18, 18, 8, 8], [14, 6, 36, 52, 18, 18, 8, 8]],       // the arch rounding further
];
const lerpRow = (a, b, f) => a.map((v, i) => v + (b[i] - v) * f);
const keyAt = (pct, which) => {
  let i = 1; while (i < KEYS.length - 1 && pct > KEYS[i][0]) i++;
  const [p0, ...r0] = KEYS[i - 1], [p1, ...r1] = KEYS[i];
  return lerpRow(r0[which], r1[which], Math.min(Math.max((pct - p0) / (p1 - p0), 0), 1));
};
const rr = (a) => {
  const [x, y, w, h, tl, tr, br, bl] = a.map((v) => +v.toFixed(2));
  if (w <= 0.01 || h <= 0.01) return '';
  return `M${x + tl} ${y}H${x + w - tr}A${tr} ${tr} 0 0 1 ${x + w} ${y + tr}V${y + h - br}A${br} ${br} 0 0 1 ${x + w - br} ${y + h}H${x + bl}A${bl} ${bl} 0 0 1 ${x} ${y + h - bl}V${y + tl}A${tl} ${tl} 0 0 1 ${x + tl} ${y}Z`;
};
const glyph = (pct) => rr(keyAt(pct, 0)) + rr(keyAt(pct, 1));

const SVG = (cls, body, style, vb) => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="${vb || '0 0 24 24'}">${body}</svg>`;

export default {
  id: 'asus-musetree',
  label: 'ASUS MuseTree (2025)',
  source: {
    platform: 'ASUS MuseTree desktop app (Windows, dark theme), the Idea Map generative canvas, as filmed in the first-party ASUS product film at 1920x1080 / 30 fps',
    feature: "On the Idea Map a prompt ('apple') is searched from the right-hand 'AI images search' rail; the app blacks out the whole window, a peach glyph morphs through several silhouettes in the middle while a large thin percentage climbs and one grey caption line changes three times, then the black lifts and the new pictures are back on the map",
    capture: {
      url: 'https://www.youtube.com/watch?v=9qHgBKKPafI',
      page: 'https://www.youtube.com/watch?v=9qHgBKKPafI',
      date: '2025-10-31',
      retrieved: '2026-10-17',
      timestamps: "t = 46.0-47.5 s the Idea Map with a selected apple node and the rail (mt_idea_46.0, mt_map_47.5); t = 49.5 s the window black, 22% with the opening caption 'AI inspiration exploration is starting, are you ready?' (mt_wait_49.5); t = 50.0 s 47%, a square, 'AI inspiration is hard at work, surprises coming soon!' (mt_wait_50.0); t = 51.0 s about 60%, a quarter disc (mt_wait_51.0); t = 52.0 s 72% (mt_wait_52.0); t = 52.5 s 86% 'AI inspiration exploration in progress, please wait.' (mt_wait_52.5); t = 53.0 s 97% (mt_wait_53.0); own re-download of the film: a second run at t = 51.0-53.0 s reads 10% two touching discs, 30% a rounded square, 50% a square, 70% a disc with a notch, 91% a square (crops under .tmp/clone-9e82faf1/wave-cn-build/src633/g/); the black lifts at about 55 s and the new nodes stand on the map",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=9qHgBKKPafI', published: '2025-10-31', retrieved: '2026-10-17', note: 'MuseTree – Grow Your Dreams with AI Magic (ASUS)' },
    ],
    extrapolated: [
      "the landing: the footage returns to the map with ONE new node (a purple tree) a beat after the black lifts; here the black lifts and ten pictures stand in a 5x2 candidate board of round tiles (the map's own node shape) over the map, each swapped in, in strict reading order, from a dark round plate",
      "the glyph: the footage's silhouettes are not one fixed list (two discs, a rounded square, a square, a quarter disc, a notched disc, a skewed square, depending on the run); here one shape set is drawn from two rectangles with per-corner radii: two discs, a rounded square, a square, a quarter disc, a speech bubble (one sharp corner) and an arch rounding further, the in-betweens interpolated by percentage, the path set by the render clock",
      "the pace: the footage's percentage climbs ~50 points a second for ~2-3 s per run; the beat plays it in the same ~1.8 s window every module of this family uses, 10 to 99 linearly, the black lifting when it would reach 100",
      "the captions: the three strings are the footage's, the switches at 30% and 65% are read between the stills (10% first, 35% and 60% second, 72% and up third)",
      "the size and the map: the footage window is 1920 px wide; here it is redrawn at 560 px with a 180 px rail, round plain nodes (no picture in them) joined by thin peach lines, two dim glows under the black where the footage shows blurred candidate thumbnails",
      "the rail: its labels are the footage's own ('AI images search', 'apple', '5/500', 'Count', '3x', '6x', '9x', 'Content Board', 'Project', 'My Favorite'); the three candidate thumbnails are plain gradient discs, not the apple pictures",
      "omitted from the footage: the ASUS mark and the window title branding, the apple and tree pictures inside the nodes, the cursor, the zoom control",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'asus-musetree');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div>`;
    const nd = (l, t, d, bg, extra) => `<div class="${P}-nd" style="left: ${l}px; top: ${t}px; width: ${d}px; height: ${d}px; background: ${bg}${extra ? `; ${extra}` : ''}"></div>`;
    const chip = (txt, l, on) => `<p class="${P}-ch${on ? ` ${P}-ch-on` : ''}" style="left: ${l}px">${txt}</p>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-mp"></div>`
      + `<svg class="${P}-ed" viewBox="0 0 ${RAIL_L} ${ROOT_H - 22}">`
      + `<path d="M58 166V120Q58 106 72 106H108"/><path d="M42 96V166"/><path d="M186 107H253Q260 107 260 100V64Q260 57 267 57"/><path d="M142 160V225Q142 233 150 233H254"/></svg>`
      + nd(30, 188, 56, 'radial-gradient(circle at 50% 60%, #7e3f8f, #4a2a63 55%, #2f5b4a)', 'box-shadow: 0 0 0 1px #2c2c30')
      + nd(18, 70, 48, '#33343b')
      + nd(110, 96, 64, 'radial-gradient(circle at 40% 35%, #f0e6d8, #c24a3a 55%, #8f2a24)', 'box-shadow: 0 0 0 2.5px #cfa97d, 0 0 12px rgba(207, 169, 125, .45)')
      + `<div class="${P}-nx" style="left: 164px; top: 118px; width: 22px; height: 22px">${SVG('', '<path d="M12 5v14M5 12h14"/>')}</div>`
      + nd(262, 56, 46, 'radial-gradient(circle at 50% 55%, #6b3c86, #3b2b57 58%, #3d6e55)')
      + nd(256, 220, 70, '#34353c')
      + `<p class="${P}-nt2" style="left: 262px; top: 238px; width: 58px">a purple tree in a field of lavender flowers</p>`
      + `<p class="${P}-nt2" style="left: 20px; top: 84px; width: 44px">Colorful tree on green grass</p>`
      + `<div class="${P}-tb"><p class="${P}-tab">Idea Map</p><div class="${P}-tab-u"></div><p class="${P}-nt">AI models from Stable Diffusion and related components.</p></div>`
      + `<div class="${P}-rl"><p class="${P}-rh">AI images search</p><div class="${P}-in"><p class="${P}-iv">apple</p><p class="${P}-ic">5/500</p></div>`
      + `<p class="${P}-cn">Count</p>${chip('3x', 70, true)}${chip('6x', 94)}${chip('9x', 118)}<div class="${P}-sb">${SVG('', '<circle cx="10" cy="10" r="5.5"/><path d="M14.5 14.5L20 20"/>')}</div>`
      + `<div class="${P}-th" style="left: 12px; background: radial-gradient(circle at 40% 35%, #f0e6d8, #c24a3a 60%, #8f2a24)"></div><div class="${P}-th" style="left: 56px; background: radial-gradient(circle at 40% 35%, #f1efb0, #8fae35 60%, #5d7a22)"></div><div class="${P}-th" style="left: 100px; background: radial-gradient(circle at 40% 35%, #e9d6d6, #b3222b 60%, #7a1820)"></div>`
      + `<div class="${P}-dv"></div><p class="${P}-cb">Content Board</p><p class="${P}-pj">Project</p><p class="${P}-mf">My Favorite</p></div>`
      + `<div class="${P}-bd"><div class="${P}-gd">${tiles.map(cell).join('')}</div></div>`
      + `<div class="${P}-sc"><div class="${P}-gl1"></div><div class="${P}-gl2"></div>`
      + `<svg class="${P}-gy" viewBox="0 0 ${GLY} ${GLY}"><path d=""/></svg>`
      + `<p class="${P}-pc">10%</p><p class="${P}-cp">${CAP[0]}</p></div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const sc = q('sc'), bd = q('bd'), gy = q('gy path'), pc = q('pc'), cp = q('cp');
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
        const pending = s < PAS;                       // the black takeover; the board after it
        const pct = Math.min(99, Math.floor(10 + 89 * Math.min(s / PAS, 1)));   // the live figure, a pure function of s
        const cap = pct >= CAP_AT[2] ? 2 : pct >= CAP_AT[1] ? 1 : 0;

        put('ph', pending, (v) => { sc.style.visibility = v ? '' : 'hidden'; bd.style.visibility = v ? 'hidden' : ''; });
        put('pc', pct, (v) => { pc.textContent = `${v}%`; gy.setAttribute('d', glyph(v)); });
        put('cap', cap, (v) => { cp.textContent = CAP[v]; });
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
