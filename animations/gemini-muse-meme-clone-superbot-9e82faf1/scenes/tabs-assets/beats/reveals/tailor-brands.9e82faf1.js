// Tailor Brands' logo wizard, studio.tailorbrands.com/business/<id>/wizard/generate (YouTube ZuxfyfEYzbI, 'How to create a logo with
// TailorBrands', 2019-07-03, t=209-220 s; spec .tmp/clone-9e82faf1/reveal-refs/tailor-brands/spec.json, confidence 0.80; frames
// au_tailor_209_0pct.png, au_tailor_211_10pct.png, au_tailor_212_21pct.png, au_tailor_215_64pct.png, au_tailor_217_85pct.png,
// au_tailor_220_100pct.png). After the style questionnaire the page turns one flat dusty teal (#73ACB6), edge to edge. Dead centre sits an
// illustration, a two-line UPPERCASE caption that changes by phase and a big bold percentage counting 0 -> 100: 0-28 % a paper sheet with a
// brush and a pencil and 'DESIGNING YOUR PERFECT LOGO', 42-64 % a stack of tilted white cards carrying an isometric cube and 'CREATING YOUR
// BUSINESS CARDS', 76-100 % a single white phone mockup and 'PLANNING YOUR SOCIAL POSTS'. No spinner, no bar, no skeleton; a green
// 'Need Help?' chat pill stays pinned bottom-right through the wait (support chrome, kept). At 100 % the page is replaced whole.
// The percentages follow the footage's 1 fps samples (0, 3, 10, 21, 28, 42, 64, 76, 85, 95, 98, 100) between the phase swaps, from t alone.
// Extrapolated (not in the footage): the results grid the wait cuts to, ten tiles on a white page landing in reading order, and the thin
// full-width wizard bar that sits filled on it. Omitted: the browser chrome and the Windows taskbar of the screen recording, the site nav
// with the wordmark and step trail, the creator's sponsor subtitle, and any logo. The footage's own artwork is never reproduced: the cards,
// cube, phone and pen are plain flat shapes drawn here, and every tile is our own meme.
import { seg } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-tlb';
const ROOT_H = 360, COLS = 5, GAP = 8;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: 560px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #73acb6; color: #26343b; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; }
.${P}-wait { position: absolute; inset: 0; background: #73acb6; }
.${P}-ill { position: absolute; left: 50%; top: 58px; width: 168px; height: 126px; margin-left: -84px; }
.${P}-ill svg { position: absolute; inset: 0; display: block; width: 168px; height: 126px; overflow: visible; }
.${P}-cap { position: absolute; left: 0; right: 0; top: 200px; display: flex; flex-direction: column; align-items: center; height: 32px; font-size: 11.5px; font-weight: 400; line-height: 16px; letter-spacing: .07em; color: #34454d; text-transform: uppercase; white-space: nowrap; }
.${P}-pct { position: absolute; left: 0; right: 0; top: 248px; height: 40px; text-align: center; font-size: 32px; font-weight: 700; line-height: 40px; letter-spacing: -.01em; color: #212e35; }
.${P}-res { position: absolute; inset: 0; background: #ffffff; }
.${P}-bar { position: absolute; left: 0; right: 0; top: 0; height: 3px; background: #4a90d9; }
.${P}-g { position: absolute; left: 24px; right: 24px; top: 50%; display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; transform: translateY(-50%); margin-top: -8px; }
.${P}-t { position: relative; aspect-ratio: 3 / 4; border-radius: 5px; overflow: hidden; background: #e4edef; box-shadow: 0 1px 3px rgba(38, 52, 59, .18); }
.${P}-cv { position: absolute; inset: 0; background: #e4edef; }
.${P}-t img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-help { position: absolute; right: 12px; bottom: 11px; display: flex; align-items: center; gap: 5px; box-sizing: border-box; height: 22px; padding: 0 10px 0 8px; border-radius: 11px; background: #4fc6a2; box-shadow: 0 1px 4px rgba(20, 60, 50, .3); font-size: 8.5px; font-weight: 600; color: #ffffff; white-space: nowrap; }
.${P}-help i { display: block; flex: none; box-sizing: border-box; width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid #ffffff; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance, stretched with the real window
const PROG_END = 0.92;                             // the count reaches 100 %
const CUT = 1.0;                                   // the wait page is replaced whole by the results page
const LAND = Array.from({ length: 10 }, (_, i) => 1.08 + i * (0.62 / 9));   // tile i has landed (reading order), the last at 1.70
const FADE = 0.07;                                 // the tile's cover thins away over this long before the picture has landed
const LAST = LAND[9];                              // nothing moves after this
// the footage's 1 fps samples, 209 .. 220 s of ZuxfyfEYzbI
const SAMPLES = [0, 3, 10, 21, 28, 42, 64, 76, 85, 95, 98, 100];
const PH_AT = [4.5, 6.5];                          // seconds into the footage where the caption + illustration swap (28 -> 42 % and 64 -> 76 %)
const CAPS = [['DESIGNING YOUR', 'PERFECT LOGO'], ['CREATING YOUR', 'BUSINESS CARDS'], ['PLANNING YOUR', 'SOCIAL POSTS']];

const pctAt = (v) => {
  const x = Math.max(0, Math.min(SAMPLES.length - 1, v)), i = Math.min(SAMPLES.length - 2, Math.floor(x));
  return Math.round(SAMPLES[i] + (SAMPLES[i + 1] - SAMPLES[i]) * (x - i));
};

// three flat illustrations in a 168 x 126 box
const ART_PAPER = '<svg viewBox="0 0 168 126" aria-hidden="true"><rect x="36" y="2" width="96" height="112" fill="#e3ebec"/><rect x="36" y="100" width="96" height="14" fill="#d9e3e5"/><path d="M26 44l-9 66" stroke="#2c3338" stroke-width="5" stroke-linecap="round"/><path d="M27 38l-1 8" stroke="#9aa3a6" stroke-width="3" stroke-linecap="round"/><g transform="rotate(14 146 36)"><rect x="141" y="18" width="9" height="30" rx="1.5" fill="#d9a93f"/><path d="M141 18l4.5-9 4.5 9z" fill="#c9a77c"/><path d="M143.5 13.5l2-4 2 4z" fill="#3b3b3b"/></g></svg>';
const ART_CARDS = '<svg viewBox="0 0 168 126" aria-hidden="true"><rect x="18" y="14" width="132" height="92" fill="#e9eded" transform="rotate(-5 84 60)"/><rect x="18" y="14" width="132" height="92" fill="#f0f3f3" transform="rotate(3 84 60)"/><rect x="20" y="16" width="128" height="90" fill="#f7f9f9" stroke="#dde3e4" stroke-width="1" transform="rotate(-1 84 60)"/><path d="M84 36l22 12.5v25L84 86 62 73.5v-25z" fill="#0d86d0"/><path d="M84 36l22 12.5L84 61 62 48.5z" fill="#b5dbf1"/><path d="M62 48.5L84 61v25L62 73.5z" fill="#0b78bd"/><path d="M106 48.5L84 61v25l22-12.5z" fill="#1a96de"/></svg>';
const ART_PHONE = '<svg viewBox="0 0 168 126" aria-hidden="true"><g transform="rotate(-3 84 63)"><rect x="60" y="2" width="48" height="118" rx="7" fill="#f4f6f6" stroke="#cfd8da" stroke-width="1.5"/><rect x="65" y="14" width="38" height="84" fill="#ffffff"/><rect x="65" y="18" width="38" height="7" fill="#3b57b5"/><rect x="69" y="31" width="30" height="22" fill="#a3d3ee"/><rect x="69" y="59" width="30" height="22" fill="#8ec8ea"/><rect x="65" y="90" width="38" height="5" fill="#1f6fc0"/><circle cx="84" cy="109" r="4" fill="none" stroke="#c4cdcf" stroke-width="1.2"/><circle cx="84" cy="7" r="1.3" fill="#aab4b6"/></g></svg>';

export default {
  id: 'tailor-brands',
  label: 'Tailor Brands logo wizard (2019)',
  source: {
    platform: 'Tailor Brands logo wizard, studio.tailorbrands.com/business/<id>/wizard/generate (desktop Chrome on Windows; the sponsored walkthrough on YouTube, 2019-07-03)',
    feature: "full-bleed dusty-teal (#73ACB6) wait page: a flat illustration (paper sheet, tilted white cards with an isometric cube, a white phone), a two-line uppercase caption that changes by phase ('DESIGNING YOUR PERFECT LOGO' 0-28 %, 'CREATING YOUR BUSINESS CARDS' 42-64 %, 'PLANNING YOUR SOCIAL POSTS' 76-100 %) over a big bold percentage, and a green 'Need Help?' pill pinned bottom-right; at 100 % the page is replaced whole (adapted to 10: a white results grid, 5 x 2 tiles landing in reading order; the browser chrome, site nav and any logo are omitted)",
    videos: [{ id: 'ZuxfyfEYzbI', published: '2019-07-03', t: '209-220 s' }],
    extrapolated: ['the results grid: ten 3:4 tiles on a white page in a 5 x 2 block landing in strict reading order', 'the thin filled wizard bar along the top of the results page', 'the exact easing of the percentage between its 1 fps samples', 'the phase-swap instants (between the sampled 28 -> 42 % and 64 -> 76 % frames)'],
    refs: [{ url: 'https://www.youtube.com/watch?v=ZuxfyfEYzbI', retrieved: '2026-10-14' }],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'tailor-brands');
    const cell = (g, i) => `<div class="${P}-t"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; transform-origin: ${g.origin}"/><div class="${P}-cv"></div></div>`;
    const root = x.el(`<div class="${P}"><div class="${P}-wait"><div class="${P}-ill"><div class="${P}-a0" style="visibility: hidden">${ART_PAPER}</div><div class="${P}-a1" style="visibility: hidden">${ART_CARDS}</div><div class="${P}-a2" style="visibility: hidden">${ART_PHONE}</div></div><div class="${P}-cap"></div><div class="${P}-pct"></div></div><div class="${P}-res" style="visibility: hidden"><div class="${P}-bar"></div><div class="${P}-g">${tiles.map(cell).join('')}</div></div><div class="${P}-help"><i></i>Need Help?</div></div>`);
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const wait = q('wait'), res = q('res'), cap = q('cap'), pct = q('pct');
    const art = [q('a0'), q('a1'), q('a2')];
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), g: tiles[i] }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = Math.min((t - ctx.cardIn) / k, LAST); // layout seconds since the card entered; frozen once the last tile has landed

        // the wait page: caption, illustration and percentage all follow the footage's clock, v seconds into the 11 s wait
        const v = Math.max(0, Math.min(1, s / PROG_END)) * 11;
        const ph = v < PH_AT[0] ? 0 : v < PH_AT[1] ? 1 : 2;
        put('ph', ph, (n) => {
          cap.innerHTML = `<span>${x.esc(CAPS[n][0])}</span><span>${x.esc(CAPS[n][1])}</span>`;
          art.forEach((a, i) => { a.style.visibility = i === n ? '' : 'hidden'; });
        });
        put('pct', pctAt(v), (n) => { pct.textContent = `${n}%`; });

        // at 100 % the wait page is replaced whole by the results page
        const cut = s >= CUT;
        put('cut', cut, (c) => { wait.style.visibility = c ? 'hidden' : ''; res.style.visibility = c ? '' : 'hidden'; });

        cells.forEach((c, i) => {
          const a = LAND[i];
          const f = seg(s, a - FADE, a);
          put(`i${i}`, s >= a - FADE, (n) => { c.im.style.visibility = n ? '' : 'hidden'; });
          c.im.style.filter = restFilter(c.g);
          c.im.style.transform = restTransform(c.g);
          put(`c${i}`, f.toFixed(3), () => { if (f >= 1) { c.cv.style.display = 'none'; c.cv.style.opacity = ''; } else { c.cv.style.display = ''; c.cv.style.opacity = f > 0 ? (1 - f).toFixed(3) : ''; } });
        });
      },
    };
  },
};
