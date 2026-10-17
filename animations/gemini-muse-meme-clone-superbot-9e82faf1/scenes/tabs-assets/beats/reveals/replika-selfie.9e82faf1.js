// Replika, the 'AI Images' generator (2024): the wait of one generation, from a third-party Android screen recording
// https://www.youtube.com/watch?v=Gtinwvw81So (Variety Channel Arena, 2024-07-06, 1080x2340; the wait is uncut at t=348.0-359.2 s, stills reveal-refs/replika-selfie/frames/replika_{102_pending_empty,
// 103_pending_black,104_pending_blob,105_pending_blob2,106_pending_blob3,107_pending_blob4,108_landed,109_landed2}.png, spec .tmp/clone-9e82faf1/reveal-refs/replika-selfie/spec.json, confidence 0.62).
// A saturated-blue companion-app route (a periwinkle field, #4356a6 below a lighter top): plain status bar, a back arrow, the previous result cut off at the top with its share / download glyphs, then ONE
// full-width rounded result card and two pills along the bottom, 'Regenerate' and 'Done', both dimmed while the card works. The card goes empty flat blue (a small white arc spinner bottom-right) ->
// black -> a small magenta / violet blob blooming at its centre -> swelling warm brown / pink colour clouds (the decoder's live preview). Here the card area then becomes a 5 x 2 grid of rounded cards,
// each holding that cloud and each dissolving into one of OUR pictures in strict reading order, after which 'Regenerate' lights up and 'Done' turns white. Everything is plain boxes, radial gradients and
// line glyphs; the footage's generated person and the status bar's app icons are left out; system UI face.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-rpk';
const ROOT_W = 560, ROOT_H = 520;
const CARD_L = 20, CARD_T = 112, CARD_W = 520, CARD_H = 330;           // the result card and, after it, the grid's footprint
const T_W = 96, T_H = 160, T_G = 10;                                   // a tile of the 5 x 2 grid: 5 * 96 + 4 * 10 = 520, 2 * 160 + 10 = 330
const PV_T = 56, PV_H = 46;                                             // the previous result, cut off at the top of the page
const PL_T = 458, PL_H = 40;                                            // the two pills
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: linear-gradient(180deg, #5b73c9 0%, #4a60b4 11%, #4356a6 26%, #4356a6 100%); color: #ffffff; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(30, 42, 110, .35); }
.${P} p { margin: 0; white-space: nowrap; }
.${P} svg { display: block; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
.${P}-sb { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: 24px; }
.${P}-sb .${P}-tm { position: absolute; left: 22px; top: 4px; font-size: 11px; line-height: 16px; font-weight: 700; letter-spacing: .1px; }
.${P}-sb .${P}-gl { position: absolute; right: 20px; top: 5px; display: flex; align-items: center; gap: 5px; height: 14px; }
.${P}-sb .${P}-gl svg { width: 12px; height: 12px; stroke-width: 1.6; }
.${P}-sb .${P}-gl p { font-size: 9px; line-height: 14px; font-weight: 600; }
.${P}-bt { display: block; width: 14px; height: 7px; box-sizing: border-box; border: 1.3px solid #ffffff; border-radius: 2px; }
.${P}-bt i { display: block; width: 4px; height: 4px; margin: 0.5px; border-radius: 1px; background: #ffffff; }
.${P}-bk { position: absolute; left: ${CARD_L - 4}px; top: 26px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; }
.${P}-bk svg { width: 16px; height: 16px; stroke-width: 2.4; }
.${P}-pv { position: absolute; left: ${CARD_L}px; top: ${PV_T}px; width: ${CARD_W}px; height: ${PV_H}px; overflow: hidden; border-radius: 0 0 18px 18px; background: #2b2e50; }
.${P}-pv img { position: absolute; left: 0; top: -250px; display: block; width: ${CARD_W}px; height: 612px; object-fit: cover; }
.${P}-fd { position: absolute; left: 0; right: 0; top: 0; height: 18px; background: linear-gradient(180deg, rgba(80, 104, 187, .95) 0%, rgba(80, 104, 187, 0) 100%); }
.${P}-ib { position: absolute; bottom: 7px; width: 26px; height: 26px; border-radius: 50%; background: rgba(32, 42, 108, .55); display: flex; align-items: center; justify-content: center; }
.${P}-ib svg { width: 13px; height: 13px; stroke-width: 2; }
.${P}-mn { position: absolute; left: ${CARD_L}px; top: ${CARD_T}px; width: ${CARD_W}px; height: ${CARD_H}px; border-radius: 18px; overflow: hidden; }
.${P}-gc { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.${P}-sp { position: absolute; right: 16px; bottom: 16px; width: 22px; height: 22px; }
.${P}-sp svg { width: 22px; height: 22px; stroke-width: 2.2; }
.${P}-sp .${P}-rg { stroke: rgba(255, 255, 255, .28); }
.${P}-gd { position: absolute; left: ${CARD_L}px; top: ${CARD_T}px; width: ${CARD_W}px; height: ${CARD_H}px; display: grid; grid-template-columns: repeat(5, ${T_W}px); grid-template-rows: repeat(2, ${T_H}px); gap: ${T_G}px; }
.${P}-t { position: relative; box-sizing: border-box; width: ${T_W}px; height: ${T_H}px; border-radius: 14px; overflow: hidden; background: #0a0a0a; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-pl { position: absolute; top: ${PL_T}px; height: ${PL_H}px; box-sizing: border-box; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 14px; line-height: ${PL_H}px; font-weight: 700; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const EMPTY_END = 0.20;                            // layout seconds: the empty flat blue card, then it goes black
const BLOOM_AT = 0.32;                             // the black card's small magenta blob starts to bloom
const CLOUD_AT = 0.62;                             // the blob has bloomed; the warm clouds swell from here
const SWAP = 1.04;                                 // the single card hands over to ten cloud cards
const DIS = 0.16;                                  // one cloud's dissolve into its picture (a cover's opacity), layout seconds
const LAND = Array.from({ length: 10 }, (_, i) => SWAP + 0.02 + i * ((1.62 - DIS - SWAP - 0.02) / 9));   // tile i starts to dissolve (strict reading order), the last is done at 1.62
const PILL_AT = 1.64, PILL_END = 1.82;             // the pills brighten once the last picture is in
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const f = (n, d = 1) => String(Math.round(n * 10 ** d) / 10 ** d);
const mix = (a, b, k) => Math.round(a + (b - a) * k);
const rad = (rx, ry, x, y, stops) => `radial-gradient(ellipse ${f(rx)}% ${f(ry)}% at ${f(x)}% ${f(y)}%, ${stops})`;
const OFFS = [[0, 0], [3, -2], [-3, 3], [2, 4], [-4, -2], [4, 2], [-2, -4], [3, 3], [-3, -3], [0, 4]];   // each cloud card's own little drift of its blobs, in % of the card

// the black card's blob, b 0..1: a small violet-magenta core that grows, with two maroon streaks at the sides and a magenta glow at the foot
function blobBg(b) {
  const ca = Math.min(1, 0.2 + 1.2 * b);
  return [
    rad(8 + 38 * b, 10 + 44 * b, 50, 38, `rgba(168, 112, 222, ${f(0.95 * ca, 2)}) 0%, rgba(140, 52, 170, ${f(0.75 * ca, 2)}) 40%, rgba(90, 17, 90, ${f(0.35 * ca, 2)}) 70%, rgba(0, 0, 0, 0) 100%`),
    `linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(96, 10, 62, ${f(0.5 * b, 2)}) 16%, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0) 70%, rgba(96, 10, 62, ${f(0.5 * b, 2)}) 84%, rgba(0, 0, 0, 0) 100%)`,
    rad(55, 14, 50, 104, `rgba(200, 30, 110, ${f(0.55 * b, 2)}) 0%, rgba(0, 0, 0, 0) 100%`),
    '#08060a',
  ].join(', ');
}

// the swelling clouds, u 0..1 (the blob fades out as the warm colour comes in): a pale mauve mass above, a dark one below it, warm brown sides, a pink floor
function cloudBg(u, dx, dy) {
  const ka = Math.min(1, u * 1.5), kc = Math.pow(1 - u, 1.4), ks = 0.5 * (1 - u);
  return [
    rad(46 + 16 * u, 54 + 10 * u, 50, 38, `rgba(168, 112, 222, ${f(0.95 * kc, 2)}) 0%, rgba(140, 52, 170, ${f(0.7 * kc, 2)}) 45%, rgba(90, 17, 90, 0) 100%`),
    rad(10 + 36 * u, 10 + 30 * u, 50 + dx, 30 + dy, `rgba(236, 224, 236, ${f(0.96 * ka, 2)}) 0%, rgba(214, 190, 204, ${f(0.7 * ka, 2)}) 50%, rgba(190, 150, 160, 0) 100%`),
    rad(8 + 20 * u, 14 + 26 * u, 50 - dx, 68 + dy, `rgba(24, 20, 28, ${f(0.97 * ka, 2)}) 0%, rgba(30, 24, 32, ${f(0.6 * ka, 2)}) 55%, rgba(30, 24, 32, 0) 100%`),
    rad(62, 9 + 14 * u, 50 + dx, 100, `rgba(226, 62, 130, ${f(0.95 * u, 2)}) 0%, rgba(190, 50, 110, ${f(0.6 * u, 2)}) 50%, rgba(190, 50, 110, 0) 100%`),
    `linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(96, 10, 62, ${f(ks, 2)}) 16%, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0) 70%, rgba(96, 10, 62, ${f(ks, 2)}) 84%, rgba(0, 0, 0, 0) 100%)`,
    `linear-gradient(90deg, rgba(190, 122, 86, ${f(0.95 * ka, 2)}) 0%, rgba(150, 106, 92, ${f(0.8 * ka, 2)}) 28%, rgba(120, 96, 104, ${f(0.6 * ka, 2)}) 50%, rgba(150, 100, 84, ${f(0.8 * ka, 2)}) 74%, rgba(205, 96, 92, ${f(0.95 * ka, 2)}) 100%)`,
    '#0a070b',
  ].join(', ');
}

const SVG = (cls, vb, body) => `<svg${cls ? ` class="${cls}"` : ''} viewBox="${vb}">${body}</svg>`;
const SHARE = '<path d="M12 15V4M8 8l4-4 4 4M5 12v7h14v-7"/>';
const DOWNLOAD = '<path d="M12 4v11M8 11l4 4 4-4M5 19h14"/>';

export default {
  id: 'replika-selfie',
  label: 'Replika AI Images (2024)',
  source: {
    platform: "Replika Android app (com.replika.app), the 'AI Images' generator reached from the chat's image icon; a third-party 1080x2340 phone screen recording",
    feature: "'AI Images': pressing the white 'Generate' pill replaces the blue composer with a full-screen blue results page whose rounded image card goes empty flat blue -> black -> a small magenta latent blob blooming at its centre -> swelling warm brown / pink colour clouds, then snaps to the finished picture; 'Regenerate' and 'Done' sit along the bottom, dimmed (Done greyed) until it lands",
    capture: {
      url: 'https://www.youtube.com/watch?v=Gtinwvw81So',
      page: 'https://www.youtube.com/watch?v=Gtinwvw81So',
      date: '2024-07-06',
      retrieved: '2026-10-17',
      timestamps: "t = 347.6 s the composer ('AI Images', '317 / 500', white 'Generate' pill; replika_101_composer); t = 348.0-349.4 s the results page with an empty flat blue card, a small white arc spinner bottom-right, 'Regenerate' / 'Done' dimmed (replika_102_pending_empty); t = 350.0-351.0 s the card black with a small magenta / violet blob at the centre (replika_103_pending_black); t = 351.5-358.5 s the blob swelling into warm brown / pink colour clouds (replika_104_pending_blob, _105_pending_blob2, _106_pending_blob3, _107_pending_blob4); t = 359.0-360.0 s the finished picture, 'Regenerate' active and 'Done' white (replika_108_landed, _109_landed2); uncut, no scene change at t = 347-360 s",
    },
    refs: [
      { url: 'https://www.youtube.com/watch?v=Gtinwvw81So', published: '2024-07-06', retrieved: '2026-10-17', note: 'How To Create Create Images Of Your Replika (Variety Channel Arena, third-party screen recording); the only source of the wait' },
    ],
    extrapolated: [
      "the 10-up: the footage lands ONE picture in ONE full-width card; here the card area becomes a 5 x 2 grid of rounded cards at the moment of landing, each holding the footage's cloud and dissolving (a cover's opacity) into one of ten pictures in strict reading order, after which 'Regenerate' brightens and 'Done' turns white",
      'the pace: the footage waits ~10.5 s (an empty card ~1.4 s, black ~0.6 s, a blob ~0.5 s, swelling clouds ~7 s); the beat plays the same four looks in the ~1.8 s window every module of this family uses, the clouds for ~0.4 layout seconds before the grid',
      'the card shape: the footage card is portrait (~3:4) on a 1080-px-wide phone; here the page is laid out 560 px wide, so the single card is a full-width landscape card and the clouds are drawn with radial gradients (their radii, positions and alphas are a pure function of t) rather than copied from the decoder preview, which a few smooth blobs only approximate',
      "the page: 'AI Images' / '1 of 4' title, the up / down arrows and the Android navigation bar are left out; the previous result strip at the top is one of our own pictures with the footage's share / download glyphs redrawn as plain line icons; the status bar keeps only the clock and the generic glyphs (no app icons)",
      "omitted from the footage: the generated person (the picture is one of ours), the status bar's notification app icons, the composer ('Generate', 'Enhance', 'Aspect ratio', 'Styles'), the '317 / 500' counter and the Samsung chrome",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'replika-selfie');
    const srcPrev = ownSrc(ctx.src, 'replika-selfie-prev');   // the strip's picture: its own URL, a different decode size from the 96 x 160 tiles
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/>`
      + `<div class="${P}-cv" style="transform-origin: ${g.origin}; transform: ${g.zoom === 1 ? 'none' : `scale(${(1 / g.zoom).toFixed(5)})`}; background: ${cloudBg(1, OFFS[i][0], OFFS[i][1])}"></div></div></div>`;
    const sig = SVG('', '0 0 24 24', '<path d="M4 20h2M9 20v-4M14 20v-8M19 20V6"/>');
    const wifi = SVG('', '0 0 24 24', '<path d="M3 9c5-4.5 13-4.5 18 0M6 13c3.5-3 8.5-3 12 0M9.5 16.5c1.5-1.2 3.5-1.2 5 0"/>');
    const root = x.el(`<div class="${P}">`
      + `<div class="${P}-sb"><p class="${P}-tm">6:49</p><div class="${P}-gl">${wifi}${sig}<p>33%</p><span class="${P}-bt"><i></i></span></div></div>`
      + `<div class="${P}-bk">${SVG('', '0 0 24 24', '<path d="M15 5l-7 7 7 7"/>')}</div>`
      + `<div class="${P}-pv"><img src="${srcPrev}" width="870" height="1024" decoding="sync" alt="Previous result"/><div class="${P}-fd"></div>`
      + `<div class="${P}-ib" style="right: 52px">${SVG('', '0 0 24 24', SHARE)}</div><div class="${P}-ib" style="right: 16px">${SVG('', '0 0 24 24', DOWNLOAD)}</div></div>`
      // the single result card
      + `<div class="${P}-mn"><div class="${P}-gc"></div><div class="${P}-sp"><svg viewBox="0 0 24 24"><circle class="${P}-rg" cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9"/></svg></div></div>`
      // the 5 x 2 grid of cloud cards that become the ten pictures
      + `<div class="${P}-gd">${tiles.map(cell).join('')}</div>`
      + `<p class="${P}-pl ${P}-rb" style="left: ${CARD_L}px; width: 236px">Regenerate</p><p class="${P}-pl ${P}-dn" style="left: ${CARD_L + 246}px; width: 274px">Done</p>`
      + `</div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const mn = q('mn'), gc = q('gc'), sp = q('sp'), gd = q('gd'), rb = q('rb'), dn = q('dn'), pvImg = root.querySelector(`.${P}-pv img`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    const sa = sp.querySelector('svg');
    ctx.gate([pvImg, ...cells.map((c) => c.im)]);

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };
    const show = (n, on) => { n.style.visibility = on ? '' : 'hidden'; };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.max((t - ctx.cardIn) / k, 0);   // layout seconds since the card entered
        const grid = s >= SWAP;

        put('ph', grid, (g) => { show(mn, !g); show(gd, g); });
        // the single card: empty blue, black, the blob, the clouds
        const cs = Math.min(s, SWAP);
        let key, bg;
        if (cs < EMPTY_END) { key = 'e'; bg = 'rgb(68, 84, 150)'; }
        else if (cs < BLOOM_AT) { key = 'k'; bg = '#0a0a0a'; }
        else if (cs < CLOUD_AT) { const b = Math.round(clamp01((cs - BLOOM_AT) / (CLOUD_AT - BLOOM_AT)) * 32) / 32; key = `b${b}`; bg = blobBg(b); }
        else { const u = Math.round(clamp01((cs - CLOUD_AT) / (SWAP - CLOUD_AT)) * 40) / 40; key = `c${u}`; bg = cloudBg(u, 0, 0); }
        put('gc', key, () => { gc.style.background = bg; });
        // the arc spinner: its angle is a function of t alone, whole degrees
        const ang = Math.floor((cs * 600) % 360);
        put('sp', ang, (a) => { sa.style.transform = `rotate(${a}deg)`; });

        cells.forEach((c, i) => {
          const d = grid ? clamp01((s - LAND[i]) / DIS) : 0;
          const cov = Math.round((1 - d) * 20) / 20;      // the cloud cover's opacity, a pure function of s
          put(`i${i}`, cov, () => {
            c.im.style.visibility = cov < 1 ? '' : 'hidden';
            c.cv.style.opacity = cov === 1 ? '' : String(cov);
            c.cv.style.display = cov === 0 ? 'none' : '';
          });
        });
        // the pills: dimmed while the card works, bright once the last picture is in
        const pb = Math.round(clamp01((s - PILL_AT) / (PILL_END - PILL_AT)) * 10) / 10;
        put('pb', pb, (v) => {
          rb.style.color = `rgb(${mix(112, 255, v)}, ${mix(128, 255, v)}, ${mix(194, 255, v)})`;
          rb.style.background = `rgba(${mix(52, 40, v)}, ${mix(70, 56, v)}, ${mix(140, 140, v)}, ${f(0.35 + 0.65 * v, 2)})`;
          dn.style.color = `rgb(${mix(142, 44, v)}, ${mix(152, 46, v)}, ${mix(200, 60, v)})`;
          dn.style.background = `rgb(${mix(104, 255, v)}, ${mix(114, 255, v)}, ${mix(168, 255, v)})`;
        });
      },
    };
  },
};
