// Pixel Watch 5 generative watch faces (2026): the wait of one watch face, from a third-party overhead take of the watch on a white table
// https://www.youtube.com/watch?v=pTKbhrQNv2E (HardReset.Info, 2026-08-30, 1080p, 121 s, uncut: the prompt confirmation t=52 s, the wait t=56-80 s, the face lands t=80 s), stills
// reveal-refs/pixel-watch-ai-face/frames/{t52,t56,t64,t70,t80}.png, spec .tmp/clone-9e82faf1/reveal-refs/pixel-watch-ai-face/spec.json, confidence 0.7. The surface is the watch: a round black OLED face in a polished steel
// bezel on a sage sport band. The prompt confirmation screen (the dictated text in two centred lines, a back arrow, a keyboard glyph, a frosted-cyan check pill) gives way to the wait: a small clock at the top, one frosted-cyan
// blob with a regular lattice of paler dots that morphs between rounded shapes and slowly turns, the bold caption 'Analysing prompt' and then 'Creating design', and 'N% complete' climbing underneath. The generated face lands
// under 'How's this?'. Here the watch is drawn flat in the 560 block (no crown logo, hands, desk or props, no brand mark on the face), the dictated text is our own, and the landing holds the ten pictures as a 5 x 2 grid of
// small rounded tiles fitted inside the round face, each an empty dark plate that dissolves into its picture in strict reading order.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-pwf';
const ROOT_W = 560, ROOT_H = 520;
const CX = ROOT_W / 2, CY = ROOT_H / 2;
const BZ = 436, FC = 400;                                                   // the bezel and the face, diameters
const FL = CX - FC / 2, FT = CY - FC / 2;                                    // the face's top left in the root
const TL_W = 60, TL_H = 70, TL_G = 5;                                        // a tile; 5 * 60 + 4 * 5 = 320, 2 * 70 + 5 = 145
const GD_L = (FC - (5 * TL_W + 4 * TL_G)) / 2, GD_T = 144;
const BL_W = 124, BL_H = 112, BL_CY = 168;                                   // the blob, its centre's height in the face
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #f1f2f0; color: #ffffff; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(40, 50, 40, .18); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { display: block; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
.${P}-bd { position: absolute; left: ${CX - 88}px; width: 176px; background: linear-gradient(90deg, #6f8566 0%, #889d7f 30%, #93a789 55%, #839879 80%, #6c8163 100%); }
.${P}-bd.${P}-up { top: 0; height: ${CY + 10}px; border-radius: 0 0 4px 4px; }
.${P}-bd.${P}-dn { top: ${CY - 10}px; height: ${ROOT_H - CY + 10}px; border-radius: 4px 4px 0 0; }
.${P}-cr { position: absolute; left: ${CX + BZ / 2 - 6}px; top: ${CY - 16}px; box-sizing: border-box; width: 18px; height: 32px; border-radius: 3px 5px 5px 3px; background: repeating-linear-gradient(0deg, #c9ced2 0, #c9ced2 2px, #7b8187 2px, #7b8187 3.5px); box-shadow: 0 1px 3px rgba(0, 0, 0, .3); }
.${P}-bz { position: absolute; left: ${CX - BZ / 2}px; top: ${CY - BZ / 2}px; box-sizing: border-box; width: ${BZ}px; height: ${BZ}px; border-radius: 50%; background: conic-gradient(from 20deg, #e9ecee, #9aa0a6 14%, #3a3d42 28%, #b8bdc2 46%, #f1f3f4 60%, #7d838a 74%, #2e3135 88%, #e9ecee); box-shadow: 0 10px 26px rgba(30, 40, 30, .28), 0 0 0 1px rgba(40, 44, 48, .35); }
.${P}-fc { position: absolute; left: ${FL}px; top: ${FT}px; box-sizing: border-box; width: ${FC}px; height: ${FC}px; border-radius: 50%; background: #000000; overflow: hidden; box-shadow: 0 0 0 3px #0c0d0e, 0 0 0 4px rgba(255, 255, 255, .16); }
.${P}-g { position: absolute; left: 0; top: 0; width: ${FC}px; height: ${FC}px; }
.${P}-gl { position: absolute; left: ${FC / 2 - 66}px; top: 12px; box-sizing: border-box; width: 132px; height: 30px; border-radius: 50%; border-top: 3px solid rgba(255, 255, 255, .9); border-left: 3px solid transparent; border-right: 3px solid transparent; border-bottom: 0; }
.${P}-dc { position: absolute; left: 0; right: 0; top: 130px; height: 56px; text-align: center; font-size: 22px; line-height: 28px; font-weight: 500; color: #f6f6f6; }
.${P}-ln { display: block; height: 28px; }
.${P}-th { visibility: hidden; }
.${P}-ba { position: absolute; left: 82px; top: 246px; width: 26px; height: 26px; stroke-width: 2.4; color: #ffffff; }
.${P}-kb { position: absolute; left: 292px; top: 249px; width: 28px; height: 22px; stroke-width: 1.8; color: #ffffff; }
.${P}-ck { position: absolute; left: ${FC / 2 - 88}px; top: 286px; box-sizing: border-box; width: 176px; height: 68px; border-radius: 50% / 58%; background: linear-gradient(115deg, #dff8f7 0%, #a8e2e8 14%, #e8fbfa 28%, #9fdde5 44%, #e2f9f8 60%, #a3dfe6 76%, #d9f6f6 100%); box-shadow: inset 0 0 12px rgba(255, 255, 255, .5); }
.${P}-ck svg { position: absolute; left: 77px; top: 20px; width: 22px; height: 22px; stroke-width: 2.2; color: #2f4f58; }
.${P}-clk { position: absolute; left: 0; right: 0; top: 46px; text-align: center; font-size: 18px; line-height: 22px; font-weight: 600; letter-spacing: .3px; }
.${P}-bl { position: absolute; left: ${FC / 2 - BL_W / 2}px; top: ${BL_CY - BL_H / 2}px; width: ${BL_W}px; height: ${BL_H}px; border-radius: 50%; background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, .9) 0, rgba(255, 255, 255, .9) 2.4px, rgba(255, 255, 255, 0) 3.8px) 0 0 / 15px 15px, radial-gradient(circle at 50% 50%, rgba(255, 255, 255, .55) 0, rgba(255, 255, 255, .55) 2.1px, rgba(255, 255, 255, 0) 3.4px) 7.5px 7.5px / 15px 15px, linear-gradient(150deg, #d6f6f5 0%, #aae4e9 55%, #8fd5df 100%); }
.${P}-cp { position: absolute; left: 0; right: 0; top: 274px; text-align: center; font-size: 23px; line-height: 30px; font-weight: 700; }
.${P}-pc { position: absolute; left: 0; right: 0; top: 320px; text-align: center; font-size: 16px; line-height: 22px; font-weight: 500; color: #f0f0f0; }
.${P}-hd { position: absolute; left: 0; right: 0; top: 62px; text-align: center; font-size: 23px; line-height: 30px; font-weight: 600; }
.${P}-gd { position: absolute; left: ${GD_L}px; top: ${GD_T}px; display: grid; grid-template-columns: repeat(5, ${TL_W}px); grid-template-rows: repeat(2, ${TL_H}px); gap: ${TL_G}px; }
.${P}-t { position: relative; box-sizing: border-box; width: ${TL_W}px; height: ${TL_H}px; border-radius: 10px; background: #1b1d20; overflow: hidden; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #1b1d20; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const TY0 = 0.04, TY1 = 0.34;                      // layout seconds: the dictated prompt types in on the confirmation screen
const CF_END = 0.44;                               // ... the confirmation screen holds, then the wait
const AN_END = 0.74;                               // ... 'Analysing prompt', then 'Creating design'
const TICK = 0.96;                                 // ... the clock reads 16:58, then 16:59
const PD_END = 1.24;                               // ... the wait ends at 100 %, the face lands under 'How's this?'
const DIS = 0.14;                                  // one tile's dissolve into its picture (a cover's opacity), layout seconds
const LAND0 = 1.3;
const LAND = Array.from({ length: 10 }, (_, i) => LAND0 + i * ((1.78 - DIS - LAND0) / 9));   // tile i starts to dissolve (strict reading order), the last is done at 1.78
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const L1 = 'Make my watch face', L2 = 'from my Muse memes';   // our own wording, never the footage's: two centred lines
const PROMPT = `${L1} ${L2}`;
const r1 = (v) => Math.round(v * 10) / 10;
// the blob's eight corner radii (percent): each wanders around 50 with its own two frequencies, so the shape goes from an oval to a rounder tilted oval to a lobed square
const RAD = [[17, 8.6, 0.2, 7, 5.1, 1.9], [16, 7.3, 1.7, 8, 6.2, 0.4], [17, 9.1, 3.1, 7, 4.7, 2.6], [15, 8.2, 4.4, 8, 5.6, 5.0], [17, 6.8, 2.2, 7, 7.7, 3.3], [16, 9.4, 5.2, 8, 4.4, 1.1], [17, 7.9, 0.9, 7, 6.7, 4.1], [15, 8.8, 3.8, 8, 5.3, 2.8]];

const ICONS = {
  back: '<path d="M21 13H5M12 6l-7 7 7 7"/>',
  kb: '<rect x="1.5" y="3.5" width="25" height="15" rx="2.5"/><path d="M6 8h1M10.5 8h1M15 8h1M19.5 8h1M6 12h1M10.5 12h1M15 12h1M19.5 12h1M9 15.5h10"/>',
  ok: '<path d="M4 12.5l5 5 11-11"/>',
};
const icon = (k, cls, vb) => `<svg${cls ? ` class="${P}-${cls}"` : ''} viewBox="${vb}">${ICONS[k]}</svg>`;

export default {
  id: 'pixel-watch-ai-face',
  label: 'Pixel Watch AI watch face (2026)',
  source: {
    platform: 'Google Pixel Watch 5 (Wear OS) on a white table, filmed from above in one uncut take by a third-party channel: a round OLED in a polished bezel on a sage band',
    feature: "generative watch faces: the dictated prompt is confirmed with a frosted-cyan check pill, the face goes black and shows a small clock, a frosted-cyan dotted blob that morphs between rounded shapes, the caption 'Analysing prompt' and then 'Creating design' and 'N% complete' climbing; the finished face lands under \"How's this?\"",
    capture: {
      url: 'https://www.youtube.com/watch?v=pTKbhrQNv2E',
      page: 'https://www.youtube.com/watch?v=pTKbhrQNv2E',
      date: '2026-08-30',
      retrieved: '2026-10-17',
      timestamps: "t = 52 s the prompt confirmation: dictated text in two centred lines, a back arrow, a keyboard glyph, a frosted-cyan check pill (t52.png); t = 56 s the wait: clock 16:58, a frosted-cyan dotted blob (an irregular oval), 'Analysing prompt', '0% complete' (t56.png); t = 64 s the blob a rounder tilted oval, 'Creating design', '19% complete' (t64.png); t = 70 s the blob a four-lobed shape, 'Creating design', '29% complete', clock 16:59 (t70.png); t ~ 74-78 s 36 %, 39 %, 42 %; t = 80 s landed: \"How's this?\" over the generated face (t80.png); uncut, no scene change at t = 52-80 s",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=pTKbhrQNv2E', published: '2026-08-30', retrieved: '2026-10-17', note: 'Google Pixel Watch 5 Generative Watch Faces - How to Make Your Own (HardReset.Info, third-party); the only source of the wait, one uncut overhead take' },
    ],
    extrapolated: [
      "the 10-up: the footage lands ONE generated watch face; here the landing holds the ten pictures as a 5 x 2 grid of small rounded tiles fitted inside the round face under \"How's this?\", each an empty dark plate dissolving (a cover's opacity) into its picture in strict reading order; the footage's face (digits, date, weekday, progress arc) is not drawn",
      "our prompt: the dictated text 'Make my watch face from my Muse memes' is our own (the footage dictates another subject); it types in letter by letter on the confirmation screen as a pure function of t, while the footage's still shows the text mid-way",
      "the percent: the footage's counter is read at 0 % (t = 56 s), 3 %, 19 %, 29 %, 36 %, 39 % and 42 %; here it climbs monotonically from 0 % to 100 % as a pure function of t, the 42 -> 100 stretch and the 3-19 stretch are not seen",
      "the blob: a frosted-cyan div with a static dotted radial-gradient lattice whose eight corner radii, scale, squash and turn are pure functions of t; the footage's blob goes from an irregular oval through a rounder tilted oval to a four-lobed shape, its exact path is not recoverable from the stills (a single div with border-radius cannot draw the footage's exact four lobes)",
      "the pace: the footage waits ~24 s; the beat plays the same confirmation screen -> 'Analysing prompt' -> 'Creating design' -> landed shape in the ~1.8 s window every module of this family uses; the clock ticks 16:58 -> 16:59 at the phase change as the footage does (there at t ~ 66-70 s)",
      "the watch: only the face is drawn, flat, as a round black glass in a steel conic bezel with a crown and a sage band above and below, in the 560 block (no table, plant, hand or desk props); the white glare arc across the top edge of the glass is kept",
      "omitted from the footage: the 'Listening...' and 'Describe your ideal watchface' screens, any brand mark, the complications and progress arc on the generated face, the finger that accepts it",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'pixel-watch-ai-face');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv" style="transform-origin: ${g.origin}; transform: ${g.zoom === 1 ? 'none' : `scale(${(1 / g.zoom).toFixed(5)})`}"></div></div></div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-bd ${P}-up"></div><div class="${P}-bd ${P}-dn"></div><div class="${P}-cr"></div>`
      + `<div class="${P}-bz"></div>`
      + `<div class="${P}-fc">`
      // the prompt confirmation screen: the dictated text, the back arrow, the keyboard glyph and the check pill
      + `<div class="${P}-g ${P}-cf" style="visibility: hidden;"><p class="${P}-dc">${[L1, L2].map((l) => `<span class="${P}-ln"><span class="${P}-tv"></span><span class="${P}-th">${l}</span></span>`).join('')}</p>${icon('back', 'ba', '0 0 26 26')}${icon('kb', 'kb', '0 0 28 22')}<div class="${P}-ck">${icon('ok', '', '0 0 24 24')}</div></div>`
      // the wait: the clock, the blob, the caption and the percent
      + `<div class="${P}-g ${P}-pd" style="visibility: hidden;"><p class="${P}-clk"></p><div class="${P}-bl"></div><p class="${P}-cp"></p><p class="${P}-pc"></p></div>`
      // the landing: the heading and the ten tiles
      + `<div class="${P}-g ${P}-ld" style="visibility: hidden;"><p class="${P}-hd">How's this?</p><div class="${P}-gd">${tiles.map(cell).join('')}</div></div>`
      + `<div class="${P}-gl"></div>`
      + `</div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const cf = q('cf'), pd = q('pd'), ld = q('ld');
    const tvs = [...root.querySelectorAll(`.${P}-tv`)], ths = [...root.querySelectorAll(`.${P}-th`)], clk = q('clk'), bl = q('bl'), cp = q('cp'), pc = q('pc');
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
        const phase = s < CF_END ? 0 : s < PD_END ? 1 : 2;   // the confirmation screen, the wait, the landing

        put('ph', phase, (v) => { show(cf, v === 0); show(pd, v === 1); show(ld, v === 2); });

        // the dictated prompt, typed letter by letter over its two centred lines; the rest stays in its line, hidden, so the lines never reflow
        const n = Math.floor(clamp01((s - TY0) / (TY1 - TY0)) * PROMPT.length);
        put('ty', n, (v) => {
          const n1 = Math.min(v, L1.length), n2 = Math.max(0, v - L1.length - 1);
          tvs[0].textContent = L1.slice(0, n1); ths[0].textContent = L1.slice(n1);
          tvs[1].textContent = L2.slice(0, n2); ths[1].textContent = L2.slice(n2);
        });

        // the wait: the clock, the caption and the percent are pure functions of s, the percent counts 0 -> 100 over the wait
        const u = clamp01((s - CF_END) / (PD_END - CF_END));
        put('ck', s < TICK ? '16:58' : '16:59', (v) => { clk.textContent = v; });
        put('cp', s < AN_END ? 'Analysing prompt' : 'Creating design', (v) => { cp.textContent = v; });
        put('pc', Math.floor(100 * (1 - Math.pow(1 - u, 1.7))), (v) => { pc.textContent = `${v}% complete`; });

        // the blob: eight corner radii, a squash and a turn, tenths of a unit, held at its last pose once the wait is over so the landed state is static
        const so = Math.min(s, PD_END) - CF_END;
        const rad = RAD.map(([a, f, p, b, g, q2]) => r1(Math.min(70, Math.max(30, 50 + a * Math.sin(f * so + p) * 0.6 + b * Math.sin(g * so + q2)))));
        const sx = r1(1 + 0.06 * Math.sin(so * 7.4 + 0.5)), sy = r1(1 + 0.09 * Math.sin(so * 6.1 + 2.2));
        const rot = Math.round(so * 70 * 2) / 2;
        const sh = `${rad.slice(0, 4).join('% ')}% / ${rad.slice(4).join('% ')}%`;
        put('bl', `${sh}|${sx}|${sy}|${rot}`, () => { bl.style.borderRadius = sh; bl.style.transform = `rotate(${rot}deg) scale(${sx}, ${sy})`; });

        cells.forEach((c, i) => {
          const d = phase === 2 ? clamp01((s - LAND[i]) / DIS) : 0;
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
