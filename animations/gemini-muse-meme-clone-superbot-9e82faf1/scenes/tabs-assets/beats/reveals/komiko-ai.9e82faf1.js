// Komiko AI Comic Generator (2025): the wait of a story-to-comic page, from the vendor's own product film
// https://www.youtube.com/watch?v=_5OhPzjkgw0 (Komiko, first-party, 2025-05-28, 1600x1080; the wait is uncut at t=28.4-33.0 s, stills reveal-refs/komiko-ai/frames/komiko_{pending_t28.4,pending_t29.6,
// pending_t30.2,pending_t30.8,pending_t31.4,pending_t31.8,landed_t32.0,landed_t33.0}.png, spec .tmp/clone-9e82faf1/reveal-refs/komiko-ai/spec.json, confidence 0.60). A light lavender app: a slim white nav at the
// left (Home / Characters / Community / Profile, then Tools with 'AI Comic Generator' selected) and the page at the right. The page opens as the generator form (heading, the four style dropdowns, 'Narration', the
// story box, the violet 'Generate comic' pill); pressing it swaps the form for a white comic sheet titled with the story ('SECRET ADMIRERS'), its panels black-ruled. Each pending panel is a rounded pastel card,
// teal at the top left through violet to peach at the bottom right, with a few soft pale spheres and the big white 'Generating your image'; the panels then resolve one at a time (an empty white panel between,
// its caption already set) into the finished pictures. Everything is redrawn in plain boxes and line glyphs; every picture is OUR meme; the Komiko mark, the Discord pill, the zap balance and cost and the
// upgrade button are omitted; system UI face.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-kmk';
const ROOT_W = 560, ROOT_H = 320;
const NAV_W = 130;                                                      // the nav's width; the page is the rest
const T_W = 76, T_H = 92, CAP_H = 14, T_GX = 5, T_GY = 6;               // a panel, its caption strip, the gutters: 5 columns x 2 rows
const G_W = 5 * T_W + 4 * T_GX, G_H = 2 * (T_H + CAP_H) + T_GY;
const PAD = 10, TITLE_H = 26;                                           // the sheet's padding and its title row
const SH_W = G_W + 2 * PAD, SH_H = PAD + TITLE_H + G_H + PAD;
const SH_L = NAV_W + (ROOT_W - NAV_W - SH_W) / 2, SH_T = (ROOT_H - SH_H) / 2;
const FM_L = NAV_W + 18, FM_W = ROOT_W - NAV_W - 36;                    // the form's column
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: linear-gradient(180deg, #f1ecfb 0%, #f6eefa 55%, #fbf0f2 100%); color: #26233a; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(80, 64, 150, .18); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
.${P}-nav { position: absolute; left: 0; top: 0; width: ${NAV_W}px; height: ${ROOT_H}px; box-sizing: border-box; padding: 14px 7px 0; background: #ffffff; box-shadow: 1px 0 0 rgba(80, 64, 150, .12); }
.${P}-ni { display: flex; align-items: center; gap: 6px; box-sizing: border-box; height: 19px; padding: 0 6px; border-radius: 6px; font-size: 9px; line-height: 19px; color: #3d3a4f; }
.${P}-ni svg { flex: none; width: 10px; height: 10px; stroke-width: 1.7; }
.${P}-on { background: #ece8fd; color: #5a3df0; font-weight: 600; }
.${P}-tl { margin: 9px 0 2px; padding: 0 6px; font-size: 8px; line-height: 12px; color: #8b88a0; }
.${P}-g { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; }
.${P}-h1 { position: absolute; left: ${FM_L}px; width: ${FM_W}px; top: 24px; text-align: center; font-size: 19px; line-height: 24px; font-weight: 700; color: #1f1c33; }
.${P}-sub { position: absolute; left: ${FM_L + 14}px; width: ${FM_W - 28}px; top: 54px; text-align: center; font-size: 8.5px; line-height: 12px; color: #6e6a85; }
.${P}-sub p { white-space: normal; }
.${P}-dd { position: absolute; top: 90px; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; height: 18px; padding: 0 7px; border-radius: 7px; background: #ffffff; box-shadow: 0 1px 3px rgba(80, 64, 150, .14); font-size: 8.5px; line-height: 18px; color: #4a4760; }
.${P}-dd svg { width: 7px; height: 7px; stroke-width: 2; }
.${P}-nr { position: absolute; left: ${FM_L + 296}px; top: 90px; display: flex; align-items: center; gap: 5px; height: 18px; font-size: 8.5px; line-height: 18px; color: #26233a; }
.${P}-ck { display: block; box-sizing: border-box; width: 10px; height: 10px; border-radius: 3px; background: #5a3df0; }
.${P}-ck svg { display: block; width: 10px; height: 10px; stroke: #ffffff; stroke-width: 2.2; }
.${P}-nt { position: absolute; left: ${FM_L}px; width: ${FM_W}px; top: 116px; font-size: 8px; line-height: 11px; color: #6e6a85; }
.${P}-nt p { white-space: normal; }
.${P}-lk { color: #5a3df0; }
.${P}-ta { position: absolute; left: ${FM_L}px; width: ${FM_W}px; top: 156px; height: 58px; box-sizing: border-box; border-radius: 8px; background: #ebe8f1; box-shadow: 0 1px 3px rgba(80, 64, 150, .1); }
.${P}-ta .${P}-lb { position: absolute; left: 8px; top: 5px; font-size: 7.5px; line-height: 10px; color: #7b7890; }
.${P}-ta .${P}-st { position: absolute; left: 8px; right: 8px; top: 18px; font-size: 9px; line-height: 12px; color: #1f1c33; white-space: normal; }
.${P}-go { position: absolute; left: ${NAV_W + (ROOT_W - NAV_W - 124) / 2}px; top: 230px; box-sizing: border-box; width: 124px; height: 25px; border-radius: 13px; background: #5a3df0; box-shadow: 0 2px 6px rgba(90, 61, 240, .35); display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 9.5px; line-height: 25px; font-weight: 600; color: #ffffff; }
.${P}-go svg { width: 10px; height: 10px; stroke-width: 1.8; }
.${P}-sh { position: absolute; left: ${SH_L}px; top: ${SH_T}px; box-sizing: border-box; width: ${SH_W}px; height: ${SH_H}px; background: #ffffff; box-shadow: 0 2px 10px rgba(80, 64, 150, .16); }
.${P}-sh .${P}-ti { position: absolute; left: ${PAD}px; top: ${PAD - 1}px; font-size: 12.5px; line-height: 22px; font-weight: 800; letter-spacing: .7px; color: #101014; }
.${P}-gd { position: absolute; left: ${PAD}px; top: ${PAD + TITLE_H}px; display: grid; grid-template-columns: repeat(5, ${T_W}px); column-gap: ${T_GX}px; row-gap: ${T_GY}px; }
.${P}-ce { position: relative; width: ${T_W}px; height: ${T_H + CAP_H}px; }
.${P}-t { position: relative; box-sizing: border-box; width: ${T_W}px; height: ${T_H}px; border: 1.5px solid #17171c; background: #ffffff; overflow: hidden; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #ffffff; }
.${P}-gc { position: absolute; left: 0; right: 0; top: 0; bottom: 0; overflow: hidden; background: linear-gradient(135deg, #27b3cc 0%, #8f98d6 30%, #b793d7 58%, #e6a6cc 80%, #f5c9a8 100%); }
.${P}-sp { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.${P}-sb { position: absolute; border-radius: 50%; background: radial-gradient(circle at 36% 30%, #fff3d2 0%, #f8dfae 55%, #efc88e 100%); }
.${P}-gc p { position: absolute; left: 2px; right: 2px; top: 32px; text-align: center; font-size: 9.5px; line-height: 11.5px; font-weight: 800; color: #ffffff; white-space: normal; text-shadow: 0 1px 2px rgba(70, 50, 140, .22); }
.${P}-cp { position: absolute; left: 0; top: ${T_H + 1}px; width: ${T_W}px; font-size: 7px; line-height: ${CAP_H - 1}px; letter-spacing: .25px; text-transform: uppercase; color: #26233a; overflow: hidden; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const PRE = 0.25;                                  // layout seconds: the form, then 'Generate comic' is pressed and the sheet stands
const FIRST = 0.85;                                // layout seconds: the sheet has stood as ten pastel cards; the first panel starts to resolve
const WH = 0.06, DIS = 0.14;                       // one panel's empty white beat, then its dissolve (a cover's opacity), layout seconds
const LAND = Array.from({ length: 10 }, (_, i) => FIRST + i * ((REF - WH - DIS - FIRST) / 9));   // panel i starts to resolve (strict reading order), the last ends at 1.84
const SW = 0.9, PH = 2 * Math.PI;                  // sphere drift: its period in layout seconds
const clamp01 = (v) => Math.min(1, Math.max(0, v));
// the spheres of one pending card: left, top, diameter in px (the big one is cut off by the card)
const SPHERES = [[28, 6, 7], [14, 17, 5.5], [58, 15, 11], [1, 42, 3.5], [-6, 59, 44], [57, 66, 10]];
const NAV = [
  ['Home', '<path d="M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10"/>'],
  ['Characters', '<circle cx="12" cy="12" r="9"/><path d="M8 14c1 2 2 3 4 3s3-1 4-3M9 10h.01M15 10h.01"/>'],
  ['Community', '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'],
  ['Profile', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18c1.5-3 9.5-3 11 0"/>'],
  null,
  ['Create Character', '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 15-5 16 0"/>'],
  ['Comics Canvas', '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>'],
  ['AI Comic Generator', '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>'],
  ['Photo to Anime', '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M4 18l5-4 4 3 3-2 4 3"/>'],
  ['Line Art Colorization', '<circle cx="12" cy="12" r="9"/><path d="M8 9h.01M12 7h.01M16 9h.01M8 14c1 3 7 3 8 0"/>'],
  ['Image to Animation', '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z"/>'],
  ['In-betweening', '<path d="M5 15l8-8 6 6-8 8zM9 11l4 4"/>'],
  ['Layer Splitter', '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>'],
];
const CHEV = '<path d="M6 9l6 6 6-6"/>';
const STORY = 'Every day she left anonymous notes in his locker, hoping he would notice her in the crowded hallway. Little did she know, he had been doing the same thing for months.';
const CAPS = ['First note', 'Locker row', 'Quiet hall', 'Folded twice', 'Slipped in', 'He looks up', 'Second note', 'Across the hall', 'Both smile', 'Next morning'];   // our own short lines, never the footage's
const SVG = (cls, body) => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24">${body}</svg>`;

export default {
  id: 'komiko-ai',
  label: 'Komiko AI Comic Generator (2025)',
  source: {
    platform: "Komiko (komiko.app) web app, 'AI Comic Generator' tool in a desktop browser; the vendor's own product film, a marketing capture on a lavender field rather than a raw screen recording",
    feature: "AI Comic Generator: a story idea is typed into the generator form (heading, the dropdowns 'Normal' / 'Anime' / 'Grid 0' / 'Flux', 'Narration', the story box) and 'Generate comic' is pressed; the page swaps for a white comic sheet titled with the story ('SECRET ADMIRERS'), its 2x2 black-ruled panels each a pastel 'Generating your image' gradient card with soft spheres, which resolve one at a time (an empty white panel between) into the finished captioned comic page",
    capture: {
      url: 'https://www.youtube.com/watch?v=_5OhPzjkgw0',
      page: 'https://www.youtube.com/watch?v=_5OhPzjkgw0',
      date: '2025-05-28',
      retrieved: '2026-10-17',
      timestamps: "t = 28.4 s the generator form with the story box and the pointer (komiko_pending_t28.4); t = 29.6-31.8 s the pending sheet: two, then four 'Generating your image' cards (komiko_pending_t29.6, _t30.2), a white panel between (komiko_pending_t31.4), panels resolving one at a time (komiko_pending_t30.8, _t31.8); t = 32.0-40.0 s the landed page (komiko_landed_t32.0, _t33.0, _t40.0); uncut, no scene change at t = 28-34 s",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=_5OhPzjkgw0', published: '2025-05-28', retrieved: '2026-10-17', note: 'Komiko - Create Characters, Comics and Anime with AI! (Komiko, first-party)' },
      { url: 'https://www.youtube.com/watch?v=EVxLkNZogXk', published: '2024-07-29', retrieved: '2026-10-17', note: 'Create Comics, Manga and Fan Art with AI - Komiko AI Tutorial (Komiko, first-party), an older build; confirms the product line only, holds no wait' },
    ],
    extrapolated: [
      "the 10-up and the captions: the footage lands FOUR 2x2 panels; here the sheet holds ten panels in 5 columns x 2 rows, each a pastel card dissolving (through an empty white panel) into a picture in strict reading order, with a small caption strip under it; the ten caption lines are our own short neutral words, not the footage's baked-in narration (and no speech bubble)",
      "the pace: the footage waits ~1.8 s pending and ~1.4 s resolving; the beat plays the same shape in the ~1.8 s window every module of this family uses: the form for the first seventh, the press, the sheet of ten pastel cards for ~0.6 layout seconds, then ten staggered resolves",
      "the form is shown for the first 0.25 layout seconds only, redrawn from the t=28.4 and t=29.6 stills; the pointer, the 'comics generated by Komiko users' gallery below it and the page scroll are left out",
      "the spheres: the footage shows a fixed pale-yellow set (one large cut off at the bottom left, five small); here the same six sit on every card and drift a few px on a sine path as a pure function of t; the footage panel is ~275 px square, ours is 76 x 92 px so the card text is set at 9.5 px instead of ~30 px",
      "the size and the page: the footage window is ~1140 px wide; here it is redrawn 560 px wide (nav, form, sheet in plain boxes and line glyphs, chrome redrawn rather than scaled); the sheet's title is set in the system face, not the footage's marker face",
      "omitted from the footage: the Komiko mark, the 'Join Discord' pill and avatar, the zap counter and cost ('-200/58140', '58140 Zaps'), 'Upgrade now', the Edit / download / share controls, the pointer, the window frame and the purple backdrop",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'komiko-ai');
    const sph = SPHERES.map(([l, tp, d]) => `<div class="${P}-sb" style="left: ${l}px; top: ${tp}px; width: ${d}px; height: ${d}px"></div>`).join('');
    const cell = (g, i) => `<div class="${P}-ce"><div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv" style="transform-origin: ${g.origin}; transform: ${g.zoom === 1 ? 'none' : `scale(${(1 / g.zoom).toFixed(5)})`}"><div class="${P}-gc"><div class="${P}-sp">${sph}</div><p>Generating your image</p></div></div></div></div>`
      + `<p class="${P}-cp" style="visibility: hidden">${CAPS[i]}</p></div>`;
    const nav = NAV.map((n) => (n === null ? `<p class="${P}-tl">Tools</p>` : `<div class="${P}-ni${n[0] === 'AI Comic Generator' ? ` ${P}-on` : ''}">${SVG('', n[1])}<p>${n[0]}</p></div>`)).join('');
    const dd = (l, w, label) => `<div class="${P}-dd" style="left: ${l}px; width: ${w}px"><p>${label}</p>${SVG('', CHEV)}</div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-nav">${nav}</div>`
      // the generator form
      + `<div class="${P}-g ${P}-fm">`
      + `<p class="${P}-h1">AI Comic Generator</p>`
      + `<div class="${P}-sub"><p>Turn your idea into captivating comics, manga, or manhwa with AI. Simply enter a story idea, choose your style, and let AI Comic Generator do the rest.</p></div>`
      + dd(FM_L, 70, 'Normal') + dd(FM_L + 76, 70, 'Anime') + dd(FM_L + 152, 70, 'Grid 0') + dd(FM_L + 228, 62, 'Flux')
      + `<div class="${P}-nr"><span class="${P}-ck">${SVG('', '<path d="M6 12.5l4 4 8-9"/>')}</span><p>Narration</p></div>`
      + `<div class="${P}-nt"><p><span class="${P}-lk">Google Gemini</span> is now available as a model option! Note: Some generations may occasionally fail due to Gemini's content moderation policies. Please use <span class="${P}-lk">Flux</span> model if generation fails.</p></div>`
      + `<div class="${P}-ta"><p class="${P}-lb">What's your story idea?</p><p class="${P}-st">${STORY}</p></div>`
      + `<div class="${P}-go">${SVG('', '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>')}<p>Generate comic</p></div>`
      + `</div>`
      // the comic sheet: its title and the ten panels
      + `<div class="${P}-g ${P}-pg"><div class="${P}-sh"><p class="${P}-ti">SECRET ADMIRERS</p><div class="${P}-gd">${tiles.map(cell).join('')}</div></div></div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const fm = q('fm'), pg = q('pg');
    const cells = [...root.querySelectorAll(`.${P}-ce`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), gc: n.querySelector(`.${P}-gc`), cp: n.querySelector(`.${P}-cp`) }));
    const sps = [...root.querySelectorAll(`.${P}-sp`)];
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
        const phase = s < PRE ? 0 : 1;                 // the form, then the sheet
        const sb = Math.min(Math.max(s, PRE), LAND[9]);   // the drift clock: held at the sheet's ends so a hidden card is static outside its wait
        const dx = Math.round(2.5 * Math.sin((PH * sb) / SW) * 2) / 2, dy = Math.round(2 * Math.cos((PH * sb) / SW + 1.3) * 2) / 2;

        put('ph', phase, (v) => { show(fm, v === 0); show(pg, v === 1); });
        put('dr', `${dx}|${dy}`, () => { sps.forEach((e) => { e.style.transform = `translate(${dx}px, ${dy}px)`; }); });
        cells.forEach((c, i) => {
          const into = phase === 0 ? -1 : s - LAND[i];   // seconds since this panel's turn; negative until it comes
          const stage = into < 0 ? 0 : into < WH ? 1 : 2;   // 0 the pastel card, 1 the empty white panel with its caption, 2 the dissolve and the picture
          const d = stage === 2 ? clamp01((into - WH) / DIS) : 0;
          const cov = Math.round((1 - d) * 20) / 20;      // the cover's opacity, a pure function of s
          put(`i${i}`, `${stage > 0 ? 1 : 0}|${cov}`, () => {
            show(c.gc, stage === 0);
            show(c.cp, stage > 0);
            c.im.style.visibility = cov < 1 ? '' : 'hidden';
            c.cv.style.opacity = cov === 1 ? '' : String(cov);
            c.cv.style.display = cov === 0 ? 'none' : '';
          });
        });
      },
    };
  },
};
