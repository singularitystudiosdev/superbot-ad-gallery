// Nothing OS Wallpaper Studio (2026): the wait of the AI wallpaper generator, from a third-party how-to filmed on a Nothing Phone (4a)
// https://www.youtube.com/watch?v=fABZo1XG7RQ (HardReset.Info, 2026-03-24, 1920x1080; the wait is uncut at t=87.4-92.3 s, stills reveal-refs/nothing-ai-wallpaper/frames/nw_{86.5,87.5,88.5,
// 89.5,90.5,91.5,92.5,94.0}.png, spec .tmp/clone-9e82faf1/reveal-refs/nothing-ai-wallpaper/spec.json, confidence 0.6; corroborated by gAcvt4037As, 2026-04-27). The phone screen only, on a lavender
// page: a status bar, a back arrow, the centred title ('Wallpaper Studio', then 'Flora + Painting' once Create wallpaper is tapped) and an (i) glyph, the stacked 'Flora' / 'Painting' pair with its '+' join, the navy
// 'Create wallpaper' pill over 'Surprise me'. The tap empties the page: a rounded phone-aspect card with a faint 1 px rim holds a heavily blurred muted colour field (rose top-left, olive mid, blue-violet
// low) that drifts, under a sparse 7 px dot-matrix overlay that fades in and out, with the small static 'Processing...' caption below and no spinner, bar or percentage. The card then resolves into the
// finished artwork, the back arrow returns with a download glyph, and 'Set as wallpaper' and 'Recreate' appear. Everything is redrawn in plain boxes and line glyphs; every picture is OUR meme; the
// recorder's logos, the hand, the desk and the Terms of Service modal are omitted; system UI face.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-nwp';
const ROOT_W = 560, ROOT_H = 500;
const CARD_W = 144, CARD_H = 312, STAGE_TOP = 84;                    // the pending card (phone aspect, 9:19.5)
const T_W = 70, T_H = 150, T_GX = 14, T_GY = 12;                     // a landed tile, phone-aspect, 5 columns x 2 rows
const G_W = 5 * T_W + 4 * T_GX, G_H = 2 * T_H + T_GY;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: linear-gradient(180deg, #a5a8cf 0%, #9b9ecb 45%, #8e91be 100%); color: #141b3a; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(20, 27, 58, .16); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { fill: none; stroke: #141b3a; stroke-linecap: round; stroke-linejoin: round; }
.${P}-g { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; }
.${P}-clk { position: absolute; left: 24px; top: 9px; font-size: 11.5px; line-height: 14px; font-weight: 500; color: #141b3a; }
.${P}-sg { position: absolute; top: 10px; height: 12px; stroke-width: 1.8; }
.${P}-ti { position: absolute; left: 0; width: ${ROOT_W}px; top: 40px; text-align: center; font-size: 15.5px; line-height: 22px; font-weight: 500; color: #141b3a; }
.${P}-ic { position: absolute; top: 43px; width: 17px; height: 17px; stroke-width: 1.7; }
.${P}-card { position: absolute; left: ${(ROOT_W - CARD_W) / 2}px; top: ${STAGE_TOP}px; box-sizing: border-box; width: ${CARD_W}px; height: ${CARD_H}px; border-radius: 24px; border: 1px solid rgba(94, 100, 150, .55); background: #8e91be; }
.${P}-in { position: absolute; left: 4px; top: 4px; right: 4px; bottom: 4px; border-radius: 20px; overflow: hidden; background: #7b7ea9; }
.${P}-fl { position: absolute; left: -26px; top: -26px; right: -26px; bottom: -26px; }
.${P}-bl { position: absolute; border-radius: 50%; }
.${P}-b1 { left: -16px; top: 2px; width: 130px; height: 150px; background: radial-gradient(closest-side, rgba(164, 98, 124, .95), rgba(164, 98, 124, 0)); }
.${P}-b2 { left: 22px; top: 118px; width: 150px; height: 120px; background: radial-gradient(closest-side, rgba(150, 140, 96, .95), rgba(150, 140, 96, 0)); }
.${P}-b3 { left: 40px; top: 214px; width: 150px; height: 150px; background: radial-gradient(closest-side, rgba(50, 58, 126, .95), rgba(50, 58, 126, 0)); }
.${P}-b4 { left: 30px; top: 40px; width: 120px; height: 120px; background: radial-gradient(closest-side, rgba(66, 66, 98, .85), rgba(66, 66, 98, 0)); }
.${P}-dm { position: absolute; left: 0; top: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 50% 50%, rgba(238, 239, 252, .95) 0.5px, rgba(238, 239, 252, 0) 1px); background-size: 7px 7px; opacity: 0; }
.${P}-pr { position: absolute; left: 0; width: ${ROOT_W}px; top: ${STAGE_TOP + CARD_H + 38}px; text-align: center; font-size: 11.5px; line-height: 15px; color: #3a3f68; }
.${P}-st { position: absolute; left: ${(ROOT_W - 150) / 2}px; width: 150px; box-sizing: border-box; border-radius: 17px; border: 1px solid rgba(255, 255, 255, .5); overflow: hidden; }
.${P}-st p { position: absolute; left: 0; right: 0; text-align: center; font-size: 13px; line-height: 16px; color: #ffffff; }
.${P}-fo { top: ${STAGE_TOP}px; height: 154px; background: linear-gradient(160deg, #d8d4e6, #b9a9c4 55%, #7d6382); }
.${P}-pa { top: ${STAGE_TOP + 158}px; height: 154px; background: linear-gradient(150deg, #a8302c 0%, #e8e2d6 28%, #e2b72c 52%, #2e8a6a 82%, #26505e 100%); }
.${P}-sd { position: absolute; top: ${STAGE_TOP + 24}px; width: 112px; height: ${CARD_H - 48}px; border-radius: 18px; background: linear-gradient(170deg, #c8d2e4, #e6c6a8 50%, #b8c4d6); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .4); opacity: .7; }
.${P}-pl { position: absolute; left: ${ROOT_W / 2 - 11}px; top: ${STAGE_TOP + 147}px; box-sizing: border-box; width: 22px; height: 22px; border-radius: 50%; background: #ffffff; box-shadow: 0 0 0 1px rgba(20, 27, 58, .1); }
.${P}-pl svg { position: absolute; left: 5px; top: 5px; width: 12px; height: 12px; stroke-width: 2.2; }
.${P}-go { position: absolute; left: ${(ROOT_W - 168) / 2}px; top: 408px; box-sizing: border-box; width: 168px; height: 34px; border-radius: 17px; background: #141b3a; }
.${P}-go p { position: absolute; left: 0; right: 0; top: 9px; text-align: center; font-size: 13px; line-height: 16px; font-weight: 500; color: #ffffff; }
.${P}-sub { position: absolute; left: 0; width: ${ROOT_W}px; top: 450px; display: flex; align-items: center; justify-content: center; gap: 7px; font-size: 13px; line-height: 16px; color: #141b3a; }
.${P}-sub svg { display: block; width: 14px; height: 14px; stroke-width: 1.7; }
.${P}-gd { position: absolute; left: ${(ROOT_W - G_W) / 2}px; top: ${STAGE_TOP}px; display: grid; grid-template-columns: repeat(5, ${T_W}px); column-gap: ${T_GX}px; row-gap: ${T_GY}px; }
.${P}-t { position: relative; box-sizing: border-box; width: ${T_W}px; height: ${T_H}px; border-radius: 16px; border: 1px solid rgba(70, 76, 130, .6); background: #8e91be; }
.${P}-ti2 { position: absolute; left: 3px; top: 3px; right: 3px; bottom: 3px; border-radius: 13px; overflow: hidden; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: linear-gradient(180deg, #8a7890 0%, #7b7ea9 45%, #565c8a 100%); }
.${P}-nv { position: absolute; top: 478px; }
.${P}-nv svg { display: block; stroke: none; fill: #141b3a; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const PRE = 0.3;                                   // layout seconds: the carousel state, then the tap empties the page
const BLANK = 0.14;                                // the header stays empty this long after the tap (frame 87.5), then 'Flora + Painting'
const PAS = 1.2;                                   // layout seconds: the blurred card ends, the ten cards stand
const DIS = 0.14;                                  // one tile's dissolve (a cover's opacity), layout seconds
const LAND = Array.from({ length: 10 }, (_, i) => PAS + i * ((REF - DIS - PAS) / 9));   // tile i starts to dissolve (strict reading order), the last ends at 1.84
const SW = 0.9, PH = 2 * Math.PI;                  // blob drift: its period in layout seconds
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// the dot-matrix strength over the pending window: none while the card first appears, a ramp up to a crest at ~3/4, then gone before the landing
const dots = (u) => (u < 0.2 ? 0 : u < 0.72 ? (u - 0.2) / 0.52 : clamp01((1 - u) / 0.28));
// the field's saturation over the window: muted, richer mid-wait, then a muted violet-grey just before landing (stages 0.7 -> 0.85 -> 0.45)
const sat = (u) => (u < 0.4 ? 0.7 + (0.15 * u) / 0.4 : u < 0.7 ? 0.85 : 0.85 - (0.4 * (u - 0.7)) / 0.3);
const BLOBS = [['b1', 5, 7, 0], ['b2', 7, 5, 1.7], ['b3', 6, 8, 3.1], ['b4', 8, 6, 4.4]];   // class, drift x px, drift y px, phase

const ICON = {
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.01"/>',
  down: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01"/>',
  again: '<path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5"/>',
  wifi: '<path d="M2 9a14 14 0 0 1 20 0M5 12.5a9.5 9.5 0 0 1 14 0M8.5 16a4.5 4.5 0 0 1 7 0M12 19.5v.01" transform="translate(0 -1)"/>',
  batt: '<rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21 10.5v3"/><path d="M5.5 9.5h6v5h-6z" fill="#141b3a"/>',
};
const SVG = (cls, body, style, vb) => `<svg${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} viewBox="${vb || '0 0 24 24'}">${body}</svg>`;

export default {
  id: 'nothing-ai-wallpaper',
  label: 'Nothing Wallpaper Studio (2026)',
  source: {
    platform: 'Nothing OS 4.x/5.x Settings > Wallpaper Studio on a Nothing Phone (4a) / (4a) Pro (AI wallpaper generator, Terms-of-Service gate on first use), a phone app filmed top-down on a desk; third-party how-to footage, no first-party clip found',
    feature: "Wallpaper Studio: two style cards ('Flora' over 'Painting', joined by '+') are combined with 'Create wallpaper'; the header re-titles to 'Flora + Painting', the page empties to a rounded phone-aspect card holding a heavily blurred, drifting colour field under a sparse dot-matrix overlay with the static caption 'Processing...', then the card resolves into the finished artwork and 'Set as wallpaper' and 'Recreate' appear",
    capture: {
      url: 'https://www.youtube.com/watch?v=fABZo1XG7RQ',
      page: 'https://www.youtube.com/watch?v=fABZo1XG7RQ',
      date: '2026-03-24',
      retrieved: '2026-10-17',
      timestamps: "t = 86.5 s the carousel with 'Flora' / 'Painting' and 'Create wallpaper' being tapped (nw_86.5); t = 87.4-92.3 s the uncut wait: 87.5 header empty, card rim and blurred field, 'Processing...' (nw_87.5); 88.5 header 'Flora + Painting' (nw_88.5); 89.5 dot grid visible (nw_89.5); 90.5-91.5 blur calms, dots clearest then fading (nw_90.5, nw_91.5); t = 92.5 s the artwork fills the card, back arrow and download glyph, 'Set as wallpaper' and 'Recreate' (nw_92.5); 94.0 settled (nw_94.0)",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=fABZo1XG7RQ', published: '2026-03-24', retrieved: '2026-10-17', note: 'NOTHING Phone (4a) - Generate AI Wallpaper (HardReset.Info)' },
      { url: 'https://www.youtube.com/watch?v=gAcvt4037As', published: '2026-04-27', retrieved: '2026-10-17', note: 'Nothing Phone 4a/4a Pro: How to Create Own Wallpaper with AI (Games & Apps Tutorials), corroborates the same wait and result buttons' },
    ],
    extrapolated: [
      'the landing: the footage lands ONE wallpaper in the card; here the card area becomes a 5x2 set of ten small phone-aspect cards, each dissolving from a muted violet-grey cover to a picture in strict reading order (a cover opacity stepping down over 0.14 s, hard-ended, no fade on the picture itself)',
      "the pace: the footage waits ~4.9 s; the beat plays the same shape in the ~1.8 s window every module of this family uses: 'Wallpaper Studio' for the first sixth, the tap, the card with its dot matrix crest at ~3/4 of the wait, then the landing",
      "the colour field: the footage's blur is a camera-filmed render of a latent; here three-to-four soft radial blobs (rose, olive, blue-violet, muted) drift on small sine paths under a fixed blur, with saturation set from t in three stages (0.7 -> 0.85 -> 0.45); not a copy of any picture",
      'the dot matrix: a 7 px-pitch field of small pale dots whose strength is a pure function of t (none at first, a crest at ~3/4 of the wait, none at the landing); the footage shows it once per wait, strongest late, and whether it encodes progress is unverified',
      "the carousel opening: the footage's style cards are pictures; here plain gradients stand for 'Flora' and 'Painting' and the two side cards, shown for the first 0.3 layout seconds only",
      "the size and the page: the footage screen is a 390 px-wide phone; here the page is redrawn 560 px wide with a centred column, the status bar glyphs, back arrow, (i) and download glyphs, the 'Surprise me' dice and the 'Recreate' arrow as line glyphs (chrome redrawn, not a scaled copy); the system's android navigation row is drawn as three small shapes",
      'omitted from the footage: the HardReset logo tokens, the hand and the desk, the phone bezel and camera, the Terms of Service modal (Agree / No thanks) of the corroborating take',
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'nothing-ai-wallpaper');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-ti2"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv"></div></div></div></div>`;
    const blobs = BLOBS.map(([c]) => `<div class="${P}-bl ${P}-${c}"></div>`).join('');
    const root = x.el(`<div class="${P}">`
      + `<p class="${P}-clk">11:20</p>`
      + SVG(`${P}-sg`, ICON.wifi, 'left: 506px; width: 14px') + SVG(`${P}-sg`, ICON.batt, 'left: 524px; width: 16px')
      + `<p class="${P}-ti">Wallpaper Studio</p>`
      + SVG(`${P}-ic ${P}-ba`, ICON.back, 'left: 24px') + SVG(`${P}-ic ${P}-if`, ICON.info, 'left: 519px') + SVG(`${P}-ic ${P}-dn`, ICON.down, 'left: 519px')
      // the carousel state
      + `<div class="${P}-g ${P}-pre">`
      + `<div class="${P}-sd" style="left: 74px"></div><div class="${P}-sd" style="left: 374px"></div>`
      + `<div class="${P}-st ${P}-fo"><p style="top: 69px">Flora</p></div><div class="${P}-st ${P}-pa"><p style="top: 69px">Painting</p></div>`
      + `<div class="${P}-pl">${SVG('', ICON.plus)}</div>`
      + `<div class="${P}-go"><p>Create wallpaper</p></div>`
      + `<p class="${P}-sub">${SVG('', ICON.dice)}Surprise me</p>`
      + `</div>`
      // the wait: the card and its caption
      + `<div class="${P}-g ${P}-wait">`
      + `<div class="${P}-card"><div class="${P}-in"><div class="${P}-fl">${blobs}</div><div class="${P}-dm"></div></div></div>`
      + `<p class="${P}-pr">Processing...</p>`
      + `</div>`
      // the result: ten cards and the two buttons
      + `<div class="${P}-g ${P}-res">`
      + `<div class="${P}-gd">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-go"><p>Set as wallpaper</p></div>`
      + `<p class="${P}-sub">${SVG('', ICON.again)}Recreate</p>`
      + `</div>`
      + `<div class="${P}-nv" style="left: 205px">${SVG('', '<path d="M12 3l-7 5.5 7 5.5z" transform="translate(0 0.8) scale(.9)"/>', 'width: 14px; height: 14px')}</div>`
      + `<div class="${P}-nv" style="left: 273px">${SVG('', '<circle cx="12" cy="12" r="8"/>', 'width: 14px; height: 14px')}</div>`
      + `<div class="${P}-nv" style="left: 341px">${SVG('', '<rect x="5" y="5" width="14" height="14" rx="2.4"/>', 'width: 14px; height: 14px')}</div>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const pre = q('pre'), wait = q('wait'), res = q('res'), ti = q('ti');
    const ba = q('ba'), inf = q('if'), dn = q('dn'), fl = q('fl'), dm = q('dm');
    const blobEls = BLOBS.map(([c]) => q(c));
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
        const phase = s < PRE ? 0 : s < PAS ? 1 : 2;   // the carousel, the wait, the ten cards
        const title = phase === 0 ? 'Wallpaper Studio' : s < PRE + BLANK ? '' : 'Flora + Painting';
        const u = phase === 1 ? (s - PRE) / (PAS - PRE) : 0;   // progress through the wait, 0..1
        const dotA = Math.round(dots(u) * 0.7 * 50) / 50;          // dot-matrix strength, a pure function of s
        const sa = phase === 1 ? Math.round(sat(u) * 100) / 100 : 0.7;
        const fa = phase === 1 ? Math.round((0.9 - 0.05 * clamp01((u - 0.6) / 0.4)) * 100) / 100 : 0.9;   // the field's own opacity: near-empty just before the landing
        const sb = Math.min(Math.max(s, PRE), PAS);                  // the drift clock: held at the wait's ends so the hidden card is static outside it
        const bx = BLOBS.map(([, ax, ay, ph]) => [Math.round(ax * Math.sin((PH * sb) / SW + ph) * 2) / 2, Math.round(ay * Math.cos((PH * sb) / SW + ph * 1.3) * 2) / 2]);

        put('ph', phase, (v) => {
          show(pre, v === 0); show(wait, v === 1); show(res, v === 2);
          show(ba, v !== 1); show(inf, v === 0); show(dn, v === 2);
        });
        put('ti', title, (v) => { ti.textContent = v; });
        put('f', `${sa}|${fa}`, () => { fl.style.filter = `blur(13px) saturate(${sa})`; fl.style.opacity = String(fa); });
        put('d', dotA, (v) => { dm.style.opacity = String(v); });
        put('bl', bx.map((b) => b.join(',')).join('|'), () => { blobEls.forEach((el, i) => { el.style.transform = `translate(${bx[i][0]}px, ${bx[i][1]}px)`; }); });
        cells.forEach((c, i) => {
          const d = phase === 2 ? clamp01((s - LAND[i]) / DIS) : 0;   // 0 until its turn, 1 when its picture stands
          const cov = Math.round((1 - d) * 20) / 20;                  // the cover's opacity, a pure function of s
          put(`i${i}`, cov, (v) => {
            c.im.style.visibility = v < 1 ? '' : 'hidden';
            c.cv.style.opacity = v === 1 ? '' : String(v);
            c.cv.style.display = v === 0 ? 'none' : '';
          });
        });
      },
    };
  },
};
