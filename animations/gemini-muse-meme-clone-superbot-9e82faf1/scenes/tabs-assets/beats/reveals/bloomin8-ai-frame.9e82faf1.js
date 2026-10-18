// Bloomin8 AI frame app (2025): the wait of one picture on the phone page, from two phone screen recordings
// https://www.youtube.com/watch?v=d61mqAzhSgQ (Adam's Simple & Fast Reviews, 2025-02-10; handheld, uncut: the composer t~199, the orb t~202-209, the title and caption streaming t~209-212, the art landed t~213) and
// https://www.youtube.com/watch?v=YQ8kBTZCZmM (Alder & Jade Reviews, 2025-03-24; a clean split-screen with the phone screen on the left: the orb and the streaming title wait t~238-253, the art landed after), stills
// reveal-refs/bloomin8-ai-frame/frames/{t202,t207,t210,t212,t213,t215,alder_t244,alder_t250,alder_t256}.png, spec .tmp/clone-9e82faf1/reveal-refs/bloomin8-ai-frame/spec.json. The phone page is a white editorial page: a header
// row ('1 Devices Connected', a frame icon, a photo / video toggle), a portrait mat with a thick black keyline, a serif title and a smaller caption under it, and a bottom row (a trash icon, a black pill, a heart icon).
// PENDING: the mat is empty white and a small soft blurred pink / violet / blue orb drifts in it, pulsing, while the AI-written title and then the caption type in letter by letter below the mat. LANDED: the art fills the
// mat. Here the page is a centred column in the 560 block (no hand, desk or room), the black pill carries a neutral spark glyph (never the brand's word), and the mat holds the ten pictures as a 5 x 2 sheet, each an empty
// white plate that dissolves into its picture in strict reading order once the orb has faded.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-bl8';
const ROOT_W = 560, ROOT_H = 520;
const COL_W = 380, COL_L = (ROOT_W - COL_W) / 2;                           // the phone page, a centred column
const HD_H = 34;
const MT_L = 20, MT_T = 40, MT_W = 340, MT_H = 330, MT_B = 3;               // the mat: a 3 px black keyline around white
const PL_W = 60, PL_H = 71, PL_G = 4;                                       // a plate; 5 * 60 + 4 * 4 = 316, 2 * 71 + 4 = 146
const GD_W = 5 * PL_W + 4 * PL_G, GD_H = 2 * PL_H + PL_G;
const GD_L = (MT_W - 2 * MT_B - GD_W) / 2, GD_T = (MT_H - 2 * MT_B - GD_H) / 2;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #e9e4e7; color: #141414; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(60, 40, 60, .2); }
.${P} p { margin: 0; }
.${P} svg { display: block; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
.${P}-pg { position: absolute; left: ${COL_L}px; top: 0; box-sizing: border-box; width: ${COL_W}px; height: ${ROOT_H}px; overflow: hidden; background: #ffffff; box-shadow: 0 0 0 1px rgba(60, 40, 60, .08), 0 4px 18px rgba(60, 40, 60, .14); }
.${P}-bk { position: absolute; left: 14px; top: 10px; width: 14px; height: 14px; stroke-width: 2; color: #111111; }
.${P}-dv { position: absolute; left: 80px; top: 0; height: ${HD_H}px; display: flex; align-items: center; gap: 4px; font-size: 8.5px; line-height: 12px; color: #8b8b8b; white-space: nowrap; }
.${P}-dv svg { width: 11px; height: 11px; stroke-width: 1.6; }
.${P}-fi { position: absolute; left: 238px; top: 10px; width: 14px; height: 14px; stroke-width: 1.6; color: #6f6f6f; }
.${P}-tg { position: absolute; right: 14px; top: 6px; box-sizing: border-box; width: 58px; height: 22px; border-radius: 11px; background: #ececec; }
.${P}-tk { position: absolute; left: 0; top: 0; width: 22px; height: 22px; border-radius: 50%; background: #ffffff; box-shadow: 0 1px 3px rgba(0, 0, 0, .18); }
.${P}-tk svg { position: absolute; left: 5px; top: 5px; width: 12px; height: 12px; stroke-width: 1.8; color: #111111; }
.${P}-tg > svg { position: absolute; left: 36px; top: 5px; width: 13px; height: 12px; stroke-width: 1.8; color: #9a9a9a; }
.${P}-mt { position: absolute; left: ${MT_L}px; top: ${MT_T}px; box-sizing: border-box; width: ${MT_W}px; height: ${MT_H}px; border: ${MT_B}px solid #0d0d0d; background: #ffffff; overflow: hidden; }
.${P}-gd { position: absolute; left: ${GD_L}px; top: ${GD_T}px; display: grid; grid-template-columns: repeat(5, ${PL_W}px); grid-template-rows: repeat(2, ${PL_H}px); gap: ${PL_G}px; }
.${P}-t { position: relative; box-sizing: border-box; width: ${PL_W}px; height: ${PL_H}px; background: #ffffff; overflow: hidden; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #ffffff; }
.${P}-ob { position: absolute; left: ${(MT_W - 2 * MT_B) / 2 - 34}px; top: ${(MT_H - 2 * MT_B) / 2 - 34}px; width: 68px; height: 68px; border-radius: 50%; filter: blur(7px); background: radial-gradient(circle at 34% 32%, rgba(255, 128, 196, .95) 0%, rgba(255, 128, 196, 0) 56%), radial-gradient(circle at 66% 38%, rgba(176, 112, 244, .9) 0%, rgba(176, 112, 244, 0) 58%), radial-gradient(circle at 52% 72%, rgba(96, 196, 252, .9) 0%, rgba(96, 196, 252, 0) 60%); }
.${P}-ti { position: absolute; left: ${MT_L}px; top: 382px; width: ${MT_W - 10}px; height: 42px; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 18px; line-height: 21px; font-weight: 400; color: #141414; }
.${P}-cp { position: absolute; left: ${MT_L}px; top: 430px; width: ${MT_W - 10}px; height: 28px; font-size: 9.5px; line-height: 14px; color: #2c2c2c; }
.${P}-th { visibility: hidden; }
.${P}-dc { position: absolute; top: 473px; width: 28px; height: 28px; border-radius: 50%; background: #efecee; }
.${P}-dc svg { position: absolute; left: 7px; top: 7px; width: 14px; height: 14px; stroke-width: 1.8; color: #ffffff; }
.${P}-pl { position: absolute; left: ${COL_W / 2 - 50}px; top: 472px; width: 100px; height: 30px; border-radius: 6px; background: #0d0d0d; color: #ffffff; }
.${P}-pl svg { position: absolute; left: 41px; top: 7px; width: 16px; height: 16px; stroke-width: 1.6; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const TI0 = 0.06, TI1 = 0.54;                      // layout seconds: the title types in
const CP0 = 0.54, CP1 = 1.16;                      // ... then the caption (the orb drifts on through both)
const FADE0 = 1.12, FADE1 = 1.24;                  // ... the orb fades out of the empty mat
const DIS = 0.14;                                  // one plate's dissolve into its picture (a cover's opacity), layout seconds
const LAND0 = 1.26;
const LAND = Array.from({ length: 10 }, (_, i) => LAND0 + i * ((1.78 - DIS - LAND0) / 9));   // plate i starts to dissolve (strict reading order), the last is done at 1.78
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const TITLE = 'Ten Muse Memes: A Small Gallery of Surprises';                        // our own wording, never the footage's
const CAPTION = 'A gallery of memes, each one a small surprise, hung together in one frame and ready to be shared.';
const r1 = (v) => Math.round(v * 10) / 10;

const ICONS = {
  back: '<path d="M9 3L4 8.5 9 14"/>',
  dev: '<rect x="1.5" y="5" width="12" height="9" rx="1.2"/><path d="M4 5V2.5h14V15"/><path d="M5 18h8"/>',
  fr: '<rect x="2" y="2" width="20" height="20" rx="3"/><rect x="7" y="7" width="10" height="10" rx="1.5"/>',
  cam: '<path d="M3 8h4l1.6-2.4h6.8L17 8h4v11H3z"/><circle cx="12" cy="13.4" r="3.2"/>',
  vid: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 11l6-3.5v9L16 13z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  heart: '<path d="M12 20l-7-7a4.5 4.5 0 016.4-6.4L12 7.2l.6-.6A4.5 4.5 0 0119 13z"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
};
const icon = (k, cls, vb = '0 0 24 24') => `<svg${cls ? ` class="${P}-${cls}"` : ''} viewBox="${vb}">${ICONS[k]}</svg>`;

export default {
  id: 'bloomin8-ai-frame',
  label: 'Bloomin8 AI frame (2025)',
  source: {
    platform: 'Bloomin8 AI digital frame companion app on a phone (two third-party review videos: a handheld phone filming in 1080p, and a clean split-screen phone screen recording)',
    feature: 'a prompt submitted in the app turns the page into an editorial gallery card: a white page, a header row (back chevron, 1 Devices Connected, a frame icon, a photo / video toggle), an EMPTY portrait mat with a thick black keyline holding a small soft blurred pink / violet / blue orb that drifts and pulses, an AI-written serif title and then a smaller caption typing in letter by letter under the mat, a trash icon, a black pill and a heart icon along the bottom; then the art fades into the mat',
    capture: {
      url: 'https://www.youtube.com/watch?v=d61mqAzhSgQ',
      page: 'https://www.youtube.com/watch?v=d61mqAzhSgQ',
      date: '2025-02-10',
      retrieved: '2026-10-17',
      timestamps: "d61mqAzhSgQ (2025-02-10, handheld, uncut): t = 199-201 s the prompt composer bar; t = 202 s the empty keyline mat with the orb at its top edge (t202.png); t = 207-209 s the orb pulsing in the empty mat; t = 210 s the title 'Morning Reverie: A Drip of Dreams' and the caption already streaming ('... a dance of abstrac', t210.png); t = 212-213 s the art fades into the mat, title complete (t212.png, t213.png); t = 215 s landed (t215.png). YQ8kBTZCZmM (2025-03-24, phone screen recording left of a presenter): t = 244 s / 250 s the white page, the empty keyline mat with the orb, the title 'Flying Breakfast in a Rainy Wonderland' and its caption streaming (alder_t244.png, alder_t250.png); t = 253-256 s the art lands in the same mat, title and caption complete (alder_t256.png)",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=d61mqAzhSgQ', published: '2025-02-10', retrieved: '2026-10-17', note: "BLOOMIN8 AI Digital Frame - Image & Video Generated, AI Enhanced, Share Photos - Worth Buying? (Adam's Simple & Fast Reviews, third-party); one handheld take with the whole wait uncut" },
      { url: 'https://www.youtube.com/watch?v=YQ8kBTZCZmM', published: '2025-03-24', retrieved: '2026-10-17', note: 'Transform Your Space with the Bloomin8 AI Frame (Alder & Jade Reviews, third-party); the phone screen recording on the left is the clean read of the page layout and strings' },
    ],
    extrapolated: [
      "the 10-up: the footage lands ONE picture with ONE AI title; here the mat holds the ten pictures as a 5 x 2 sheet of plates, each an empty white plate dissolving (a cover's opacity) into its picture in strict reading order once the orb has faded out; the footage's mat is a tall portrait (~2:3), here it is nearly square so the ten plates can be read, and the white margin round the art is the sheet's own",
      "the wording: the title 'Ten Muse Memes: A Small Gallery of Surprises' and the caption are our own (the footage's AI titles, 'Morning Reverie: A Drip of Dreams' and 'Flying Breakfast in a Rainy Wonderland', belong to other pictures); both type in as a pure function of t (the title, then the caption), the footage's caption is a sans face and stays one here, and the footage's streaming is cut off mid-word at the instant of the still",
      "the pace: the footage waits ~7 s (first take) / ~14 s (second take) on the orb; the beat plays the same empty mat + orb + typing title and caption -> landed shape in the ~1.8 s window every module of this family uses",
      "the orb: a blurred three-colour radial gradient on a div whose position and size are pure functions of t (a small drift and a pulse); the footage's orb is a soft pink, violet and cyan smudge ~60 px across drifting and breathing, its exact path is not recoverable from the stills",
      "the page: only the phone screen is drawn as a centred 380 px column on a neutral backdrop (no hand, desk, room, presenter or phone bezel); the black pill is drawn with a neutral spark glyph where the footage prints the brand's word, the trash and heart are the footage's faint grey discs, the header toggle keeps the camera segment selected",
      "omitted from the footage: the brand word on the pill, the prompt composer bar and its chip row, the second camera angle on the physical frame, the 'Image List' screen, the handheld camera drift and the phone's status bar and home indicator",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'bloomin8-ai-frame');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv" style="transform-origin: ${g.origin}; transform: ${g.zoom === 1 ? 'none' : `scale(${(1 / g.zoom).toFixed(5)})`}"></div></div></div>`;
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-pg">`
      // the header row: back, the device count, the frame icon, the photo / video toggle
      + icon('back', 'bk', '0 0 14 17')
      + `<p class="${P}-dv">${icon('dev', '', '0 0 18 18')}1 Devices Connected</p>`
      + icon('fr', 'fi')
      + `<div class="${P}-tg"><div class="${P}-tk">${icon('cam', '')}</div>${icon('vid', '')}</div>`
      // the mat: the keyline round white, the ten plates, the orb above them
      + `<div class="${P}-mt"><div class="${P}-gd">${tiles.map(cell).join('')}</div><div class="${P}-ob" style="opacity: 1;"></div></div>`
      // the title and the caption: the typed part and the rest, hidden, so the lines wrap the same from the first letter
      + `<p class="${P}-ti"><span class="${P}-tv"></span><span class="${P}-th">${TITLE}</span></p>`
      + `<p class="${P}-cp"><span class="${P}-tv"></span><span class="${P}-th">${CAPTION}</span></p>`
      // the bottom row: the trash, the black pill, the heart
      + `<div class="${P}-dc" style="left: 22px">${icon('trash', '')}</div><div class="${P}-pl">${icon('spark', '')}</div><div class="${P}-dc" style="left: ${COL_W - 50}px">${icon('heart', '')}</div>`
      + `</div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const ob = q('ob');
    const ti = q('ti'), cp = q('cp');
    const txt = (p) => ({ tv: p.querySelector(`.${P}-tv`), th: p.querySelector(`.${P}-th`) });
    const tiT = txt(ti), cpT = txt(cp);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };
    const typed = (key, T, full, a, b, s) => {
      const n = Math.floor(clamp01((s - a) / (b - a)) * full.length);
      put(key, n, (v) => { T.tv.textContent = full.slice(0, v); T.th.textContent = full.slice(v); });
    };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered

        // the title, then the caption, typed letter by letter
        typed('ti', tiT, TITLE, TI0, TI1, s);
        typed('cp', cpT, CAPTION, CP0, CP1, s);

        // the orb: its drift and its pulse are functions of s alone (tenths of a pixel), and it fades out of the mat before the plates dissolve
        const so = Math.min(s, FADE1);                  // the orb holds its last pose once it is gone, so the landed state is static
        const sc = r1(1 + 0.14 * Math.sin(so * 8.2) + 0.05 * Math.sin(so * 3.1 + 0.7));
        const ox = r1(Math.sin(so * 5.3) * 38 + Math.sin(so * 2.1 + 1) * 18);
        const oy = r1(Math.cos(so * 4.1) * 30 + Math.sin(so * 2.7) * 14);
        const op = Math.round((1 - clamp01((s - FADE0) / (FADE1 - FADE0))) * 20) / 20;
        put('ob', `${ox}|${oy}|${sc}|${op}`, () => {
          ob.style.transform = `translate(${ox}px, ${oy}px) scale(${sc})`;
          ob.style.opacity = String(op);
          ob.style.display = op === 0 ? 'none' : '';
        });

        cells.forEach((c, i) => {
          const d = clamp01((s - LAND[i]) / DIS);
          const cov = Math.round((1 - d) * 20) / 20;      // the plate cover's opacity, a pure function of s
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
