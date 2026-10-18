// SwitchBot AI Art Frame (2025): the wait of one picture, from a third-party top-down desk review
// https://www.youtube.com/watch?v=ZbheCBepUj4 (Byte of Geek, 2025-11-14, one uncut shot at t=464-492 s; stills reveal-refs/switchbot-ai-art-frame/frames/bog_{t466,t474,t481,t484,t488}.png, second source
// https://www.youtube.com/watch?v=_ieds0FdeXw Lars Klint 2025-12-10, klint_generate_image_t614.png, spec .tmp/clone-9e82faf1/reveal-refs/switchbot-ai-art-frame/spec.json). A desk seen from above on a warm-grey
// wood tone: on the left a black frame with a white mat holding a colour e-ink panel (it keeps the OLD picture while the phone works), on the right a black phone running the app. The phone shows a 'Generate Image'
// page (a white-bordered card with a soft blue gradient drifting inside, 'Generating image... Please wait.'), then a 'Process Image' page (the picture, a small chip with a spinner and a live percent, 'Syncing image
// to your AI Art Frame... Please wait.'), and when the percent is full 'Synchronized successfully' and a 'Finish' button while the PANEL refreshes: a pale green-yellow ghost, near-black, dark red with the picture
// emerging, then the picture. Here the panel refresh is a cover whose colour and opacity are pure functions of t, the panel is wide enough for the 5 x 2 sheet, and the ten pictures land in strict reading order.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-sba';
const ROOT_W = 560, ROOT_H = 380;
const FR_L = 10, FR_T = 34, FR_W = 392, FR_H = 312, FR_B = 10;              // the black frame (outer), its border
const MAT_W = FR_W - 2 * FR_B, MAT_H = FR_H - 2 * FR_B;                      // the white mat 372 x 292
const TW = 64, TH = 75, TG = 3;                                              // a tile; 5 * 64 + 4 * 3 = 332, 2 * 75 + 3 = 153
const PW = 5 * TW + 4 * TG, PH = 2 * TH + TG;                                // the e-ink panel
const PN_L = (MAT_W - PW) / 2, PN_T = 70;
const PH_L = 416, PH_T = 44, PH_W = 134, PH_H = 292, BZ = 5;                 // the phone, its bezel
const SC_W = PH_W - 2 * BZ, SC_H = PH_H - 2 * BZ;                            // the phone screen 124 x 282
const CD_W = 76, CD_H = 116;                                                 // the generate card
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #8d8883; color: #ffffff; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(40, 36, 32, .35); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { display: block; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
.${P} svg.${P}-wd { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; stroke: none; }
.${P}-fr { position: absolute; left: ${FR_L}px; top: ${FR_T}px; box-sizing: border-box; width: ${FR_W}px; height: ${FR_H}px; padding: ${FR_B}px; background: #151515; box-shadow: 0 7px 14px rgba(30, 26, 22, .42), inset 0 0 0 1px #2c2c2c; }
.${P}-mt { position: relative; width: ${MAT_W}px; height: ${MAT_H}px; background: #f2f0eb; box-shadow: inset 0 0 0 1px #d8d5cd, inset 0 2px 3px rgba(60, 55, 45, .2); }
.${P}-pn { position: absolute; left: ${PN_L}px; top: ${PN_T}px; box-sizing: border-box; width: ${PW}px; height: ${PH}px; background: #e8e6df; box-shadow: 0 0 0 1px #c7c4bb; overflow: hidden; }
.${P}-pv { position: absolute; left: 0; top: 0; width: ${PW}px; height: ${PH}px; overflow: hidden; }
.${P}-pv .${P}-z, .${P}-cd .${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-pv img, .${P}-cd img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-gd { position: absolute; left: 0; top: 0; display: grid; grid-template-columns: repeat(5, ${TW}px); grid-template-rows: repeat(2, ${TH}px); gap: ${TG}px; }
.${P}-t { position: relative; box-sizing: border-box; width: ${TW}px; height: ${TH}px; background: #e8e6df; overflow: hidden; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #7a2a1a; }
.${P}-rf { position: absolute; left: 0; top: 0; width: ${PW}px; height: ${PH}px; }
.${P}-ph { position: absolute; left: ${PH_L}px; top: ${PH_T}px; box-sizing: border-box; width: ${PH_W}px; height: ${PH_H}px; border-radius: 19px; background: #0b0b0c; box-shadow: 0 6px 12px rgba(30, 26, 22, .45), 0 0 0 1.5px #26262a; }
.${P}-sc { position: absolute; left: ${BZ}px; top: ${BZ}px; width: ${SC_W}px; height: ${SC_H}px; border-radius: 14px; background: #172030; overflow: hidden; }
.${P}-cm { position: absolute; left: ${SC_W / 2 - 3}px; top: 5px; width: 6px; height: 6px; border-radius: 50%; background: #07080a; box-shadow: 0 0 0 1px #1d2433; }
.${P}-bk { position: absolute; left: 8px; top: 17px; width: 7px; height: 7px; color: #e9edf4; }
.${P}-bk svg { width: 7px; height: 7px; stroke-width: 2; }
.${P}-g { position: absolute; left: 0; top: 0; width: ${SC_W}px; height: ${SC_H}px; }
.${P}-ti { position: absolute; left: 0; right: 0; top: 16px; text-align: center; font-size: 7px; line-height: 10px; font-weight: 600; color: #f1f4f9; }
.${P}-cd { position: absolute; left: ${(SC_W - CD_W) / 2}px; top: 36px; box-sizing: border-box; width: ${CD_W}px; height: ${CD_H}px; border: 2px solid #ffffff; background: #070a10; padding: 1.5px; }
.${P}-cd .${P}-in { position: relative; width: 100%; height: 100%; overflow: hidden; }
.${P}-gr { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.${P}-cp { position: absolute; left: 8px; right: 8px; top: ${36 + CD_H + 16}px; text-align: center; white-space: normal; font-size: 5.8px; line-height: 8px; color: #d9dee8; }
.${P} p.${P}-cp { white-space: normal; }
.${P}-ch { position: absolute; left: ${CD_W / 2 - 11}px; top: ${CD_H - 40}px; box-sizing: border-box; width: 22px; height: 26px; border-radius: 4px; background: rgba(9, 13, 21, .88); }
.${P}-sp { position: absolute; left: 7px; top: 4px; width: 8px; height: 8px; color: #ffffff; }
.${P}-sp svg { width: 8px; height: 8px; stroke-width: 2.4; }
.${P}-sp .${P}-rg { stroke: rgba(255, 255, 255, .25); }
.${P}-pc { position: absolute; left: 0; right: 0; top: 15px; text-align: center; font-size: 5.6px; line-height: 8px; font-weight: 600; color: #ffffff; }
.${P}-fn { position: absolute; left: 8px; right: 8px; top: ${SC_H - 31}px; height: 15px; border-radius: 3px; background: #eceff5; color: #1b2130; text-align: center; font-size: 6.4px; line-height: 15px; font-weight: 500; }
.${P}-hb { position: absolute; left: ${SC_W / 2 - 18}px; top: ${SC_H - 8}px; width: 36px; height: 2px; border-radius: 1px; background: #e4e7ee; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const GEN_END = 0.46;                              // layout seconds: the 'Generate Image' page, then 'Process Image' with the percent climbing
const SYNC_END = 1.0;                              // the percent is full at 0.96, at 1.00 'Synchronized successfully' and the panel's refresh begins
const GRID_ON = 1.16;                              // the panel is solid black by now: the old picture is swapped for the grid of ten (covers dark red)
const DIS = 0.14;                                  // one tile's dissolve into its picture (a cover's opacity), layout seconds
const LAND = Array.from({ length: 10 }, (_, i) => 1.32 + i * ((1.78 - DIS - 1.32) / 9));   // tile i starts to dissolve (strict reading order), the last is done at 1.78
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const lerp = (a, b, u) => a + (b - a) * clamp01(u);
const GHOST = [200, 212, 148], BLACK = [24, 26, 20], RED = [122, 42, 26];   // the panel's refresh colours: pale green-yellow, near-black, dark red
const mix = (a, b, u) => a.map((v, i) => Math.round(lerp(v, b[i], u)));
// the refresh cover over the panel: its colour and opacity are pure functions of s
const refresh = (s) => {
  if (s < SYNC_END || s >= 1.6) return 'display: none;';
  const col = s < 1.1 ? GHOST : s < 1.16 ? mix(GHOST, BLACK, (s - 1.1) / 0.06) : s < 1.24 ? BLACK : s < 1.3 ? mix(BLACK, RED, (s - 1.24) / 0.06) : RED;
  const a = s < 1.08 ? 0.88 * (s - SYNC_END) / 0.08 : s < 1.1 ? 0.88 : s < 1.16 ? lerp(0.88, 1, (s - 1.1) / 0.06) : s < 1.34 ? 1 : 1 - (s - 1.34) / 0.26;
  const op = s >= GRID_ON && s < 1.34 ? 1 : Math.min(0.98, Math.round(a * 50) / 50);   // exactly 1 from the moment the grid replaces the old picture
  return `background: rgb(${col.join(', ')}); opacity: ${op};`;
};
// the soft blue field of the generate card: two light blobs drift over a blue linear ramp
const drift = (s) => {
  const w = 2 * Math.PI * 0.5 * s, r5 = (v) => Math.round(v * 2) / 2;
  const x1 = r5(50 + 34 * Math.cos(w)), y1 = r5(54 + 30 * Math.sin(w)), x2 = r5(50 - 34 * Math.cos(w * 0.8 + 1)), y2 = r5(46 - 30 * Math.sin(w * 0.8 + 1));
  return `background: radial-gradient(circle at ${x1}% ${y1}%, rgba(160, 222, 246, .95) 0%, rgba(160, 222, 246, 0) 62%), radial-gradient(circle at ${x2}% ${y2}%, rgba(128, 150, 246, .8) 0%, rgba(128, 150, 246, 0) 58%), linear-gradient(165deg, #4a9ff8 0%, #5cb2f3 55%, #63b8ea 100%);`;
};

// the desk: a few faint plank seams and grain strokes in flat colour, nothing else
const SEAM = (y) => `<path d="M0 ${y}H${ROOT_W}" stroke="rgba(52, 47, 42, .22)" stroke-width="1.2"/>`;
const GRAIN = (x, y, l, o) => `<path d="M${x} ${y}q${l / 3} -2 ${l / 2} 0t${l / 2} 0" stroke="rgba(235, 230, 222, ${o})" stroke-width="1" fill="none"/>`;
const WOOD = `<svg class="${P}-wd" viewBox="0 0 ${ROOT_W} ${ROOT_H}">`
  + SEAM(96) + SEAM(214) + SEAM(318)
  + GRAIN(16, 20, 96, 0.14) + GRAIN(210, 12, 140, 0.12) + GRAIN(400, 28, 120, 0.12) + GRAIN(40, 360, 150, 0.12) + GRAIN(300, 364, 130, 0.12) + GRAIN(420, 352, 110, 0.1)
  + GRAIN(30, 150, 70, 0.1) + GRAIN(410, 176, 100, 0.1) + GRAIN(100, 268, 120, 0.1) + GRAIN(470, 300, 80, 0.1)
  + `</svg>`;

export default {
  id: 'switchbot-ai-art-frame',
  label: 'SwitchBot AI Art Frame (2025)',
  source: {
    platform: "an AI e-ink art frame driven from its phone app, filmed top-down on a desk (a third-party review, 2160p)",
    feature: "the app's 'Generate Image' page (a white-bordered card with a soft blue gradient drifting inside, 'Generating image... Please wait.'), then the 'Process Image' page (the picture, a spinner chip with a live percent, 'Syncing image to your AI Art Frame... Please wait.') while the frame still shows the old picture, then the panel's own refresh (pale green-yellow ghost, near-black, dark red with the picture emerging, the picture) as the phone says 'Synchronized successfully' with a 'Finish' button",
    capture: {
      url: 'https://www.youtube.com/watch?v=ZbheCBepUj4',
      page: 'https://www.youtube.com/watch?v=ZbheCBepUj4',
      date: '2025-11-14',
      retrieved: '2026-10-17',
      timestamps: "ZbheCBepUj4 t = 466 s 'Generate Image' card, old picture on the frame (bog_t466); t = 474 s the finished picture with a crop bar (bog_t474); t = 481 s 'Process Image', spinner and '64%', 'Syncing image to your AI Art Frame... Please wait.', frame still old (bog_t481); t = 484 s the panel's pale green-yellow ghost, phone 'Synchronized successfully' and 'Finish' (bog_t484); t = 486 s near-black; t = 488 s dark red with the picture emerging (bog_t488); t = 492 s the final picture; one uncut shot, t = 464-492 s. Second source _ieds0FdeXw (2025-12-10): t = 614 s the same 'Generate Image' card on a second phone (klint_generate_image_t614), a 20-25 s generate wait at t = 611-634 s, and the large frame's refresh at t = 263-292 s (yellowish ghost, solid yellow, grey-green, solid blue, dark, dark red, picture)",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=ZbheCBepUj4', published: '2025-11-14', retrieved: '2026-10-17', note: "Byte of Geek, 'SwitchBot's New AI Art Frame Powered by NanoBanana Is INSANE!' (third-party, 640 s); the uncut generate, sync and refresh at t = 464-492 s" },
      { url: 'https://www.youtube.com/watch?v=_ieds0FdeXw', published: '2025-12-10', retrieved: '2026-10-17', note: "Lars Klint, 'SwitchBot AI Art Frame - Make your own art, llamas riding dinosaurs' (third-party, 959 s); the same 'Generate Image' card with a typed prompt, and the large frame's longer refresh" },
    ],
    extrapolated: [
      'the 10-up: the footage lands ONE picture on a portrait panel; here the panel is a wide e-ink panel (332 x 153) and lands a 5 x 2 sheet of the ten pictures inside the mat, each tile a dark red cover dissolving (a cover opacity) into its picture in strict reading order',
      "the panel's shape and size: the footage frame is portrait with a ~225 x 375 px panel in a large mat; here the frame is landscape so ten portrait tiles fit one sheet, with the mat kept wide and white",
      "the refresh palette: pale green-yellow ghost, near-black and dark red are the footage's three phases (bog_t484, t486, t488); the footage ghost is the NEW picture bleached, here it is a green-yellow cover over the old picture at 88% opacity; the second source's solid yellow, grey-green and solid blue phases of the large panel are left out",
      "the pace: the footage waits ~9 s on 'Generate Image', ~6-8 s on 'Process Image' and refreshes for ~9-10 s; the beat plays generate -> sync -> refresh -> landing in the ~1.8 s window every module of this family uses, the percent climbing 0 to 100 over the sync page",
      "the crop page: the footage shows the finished portrait with a crop bar between 'Generate Image' and 'Process Image' (bog_t474); here the page goes straight from 'Generate Image' to 'Process Image'",
      "the pictures: the old picture on the panel ('Previous picture') and the picture on the phone are our own, each with its own image URL; the footage's Starry Night cat and reviewer portrait are not drawn",
      "the desk and the phone: redrawn as flat shapes of our own on a warm-grey wood tone (the footage's wood grain, the reviewer's hand, the phone's status bar with the clock and the app's other chrome are left out); no brand mark, no 'AI Studio' header, no 'Nano Banana' label",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'switchbot-ai-art-frame');
    const srcPrev = ownSrc(ctx.src, 'switchbot-ai-art-frame-prev');   // the panel's old picture: its own URL
    const srcNew = ownSrc(ctx.src, 'switchbot-ai-art-frame-new');     // the phone's picture: its own URL
    const gp = tiles[6], gn = tiles[2];
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv" style="transform-origin: ${g.origin}; transform: ${g.zoom === 1 ? 'none' : `scale(${(1 / g.zoom).toFixed(5)})`}"></div></div></div>`;
    const back = `<div class="${P}-bk"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></div>`;
    const root = x.el(`<div class="${P}">${WOOD}`
      // the frame: black border, white mat, the e-ink panel holding the old picture, the grid of ten and the refresh cover
      + `<div class="${P}-fr"><div class="${P}-mt"><div class="${P}-pn">`
      + `<div class="${P}-pv"><div class="${P}-z" style="transform-origin: ${gp.origin}; transform: ${restTransform(gp)}"><img src="${srcPrev}" width="870" height="1024" decoding="sync" alt="Previous picture" style="filter: ${restFilter(gp)}"/></div></div>`
      + `<div class="${P}-gd" style="visibility: hidden;">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-rf" style="display: none;"></div>`
      + `</div></div></div>`
      // the phone
      + `<div class="${P}-ph"><div class="${P}-sc"><div class="${P}-cm"></div>${back}`
      + `<div class="${P}-g ${P}-gen"><p class="${P}-ti">Generate Image</p><div class="${P}-cd"><div class="${P}-in"><div class="${P}-gr"></div></div></div><p class="${P}-cp">Generating image... Please wait.</p></div>`
      + `<div class="${P}-g ${P}-prc" style="visibility: hidden;"><p class="${P}-ti">Process Image</p><div class="${P}-cd"><div class="${P}-in"><div class="${P}-z" style="transform-origin: ${gn.origin}; transform: ${restTransform(gn)}"><img src="${srcNew}" width="870" height="1024" decoding="sync" alt="New picture" style="filter: ${restFilter(gn)}"/></div>`
      + `<div class="${P}-ch" style="visibility: hidden;"><div class="${P}-sp"><svg viewBox="0 0 24 24"><circle class="${P}-rg" cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9"/></svg></div><p class="${P}-pc">0%</p></div></div></div>`
      + `<p class="${P}-cp ${P}-c1">Syncing image to your AI Art Frame... Please wait.</p><p class="${P}-cp ${P}-c2" style="visibility: hidden;">Synchronized successfully</p><p class="${P}-fn" style="visibility: hidden;">Finish</p></div>`
      + `<div class="${P}-hb"></div></div></div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const gen = q('gen'), prc = q('prc'), gr = q('gr'), ch = q('ch'), pc = q('pc'), c1 = q('c1'), c2 = q('c2'), fn = q('fn'), rf = q('rf'), gd = q('gd');
    const sa = q('sp').querySelector('svg');
    const prev = q('pv').querySelector('img');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate([prev, root.querySelector(`.${P}-prc img`), ...cells.map((c) => c.im)]);

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn2) => { if (memo.get(key) !== v) { memo.set(key, v); fn2(v); } };
    const show = (n, on) => { n.style.visibility = on ? '' : 'hidden'; };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const ph = s < GEN_END ? 0 : s < SYNC_END ? 1 : 2;   // 'Generate Image', 'Process Image' syncing, 'Synchronized successfully'

        put('ph', ph, (v) => { show(gen, v === 0); show(prc, v > 0); show(c1, v === 1); show(c2, v === 2); show(fn, v === 2); show(ch, v === 1); });
        // the generate card's drifting blue: a pure function of s, frozen when the page is left
        put('gr', drift(Math.min(s, GEN_END)), (v) => { gr.style.cssText = v; });
        // the live percent, whole numbers, 100 at 0.96 and held; the chip's arc spinner turns with s
        const pct = Math.round(clamp01((s - GEN_END) / (0.96 - GEN_END)) * 100);
        put('pc', pct, (v) => { pc.textContent = `${v}%`; });
        const ang = Math.floor((Math.min(s, SYNC_END) * 1080) % 360);
        put('sp', ang, (a) => { sa.style.transform = `rotate(${a}deg)`; });
        // the panel: the old picture until the refresh has made it black, then the grid; the cover runs ghost -> black -> dark red
        const on = s >= GRID_ON;
        put('gd', on, (v) => { show(gd, v); show(prev, !v); });
        put('rf', refresh(s), (v) => { rf.style.cssText = v; });

        cells.forEach((c, i) => {
          const d = on ? clamp01((s - LAND[i]) / DIS) : 0;
          const cov = Math.round((1 - d) * 20) / 20;      // the tile cover's opacity, a pure function of s
          put(`i${i}`, cov, () => {
            c.im.style.visibility = cov < 1 ? '' : 'hidden';
            c.cv.style.opacity = cov === 1 ? '' : String(cov);
            c.cv.style.display = cov === 0 ? 'none' : '';
          });
        });
      },
    };
  },
};
