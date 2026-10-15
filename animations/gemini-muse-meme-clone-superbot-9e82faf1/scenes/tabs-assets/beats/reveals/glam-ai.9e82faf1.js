// Glam AI (2025), the Glam AI: Video & Photo Editor mobile app's style-generation wait (YouTube EqFROdA1ito, Tutorial Wiz, 2025-07-30,
// t~170.2-184.4 s, Android; rEDiK2heeJE, AppSavants, 2025-07-15, t~53.2-58.0 s, iOS; spec .tmp/clone-9e82faf1/reveal-refs/glam-ai/spec.json,
// confidence 0.62; frames bi_EqFROdA1ito_t170.5 / t174.0 / t180.0, bi_rEDiK2heeJE_t53.5 / t55.5). Tapping Generate hands the whole screen to a
// full-bleed wait over the user's own submitted photo, kept SHARP (no blur, no desaturation) under a bottom black gradient, in two phases. Phase 1
// 'Uploading': a bold white 'Uploading' header, a thin white indeterminate arc turning round a bold '100%', 'Uploading...' and the two-line
// line 'Don't close this screen while uploading is in progress'. Phase 2 'Processing' draws NO spinner at all (five frames of it over 8 s were
// pixel-identical): a rose-pink-bordered 2:3 tile carrying the chosen style's cover art, a bold server ETA ('2 minutes left' in one capture, '1
// minutes left', verbatim grammar, in the other: an estimate, never a live countdown), a busy-queue line and a white 'Hide' pill, with a small
// translucent chevron-down circle top left.
// Adapted to ten images: the stage is one 560 x 400 phone-style screen (the footage's portrait phone laid out wide), the two phases follow the
// press in order (the '100%' is read off t and reaches 100 inside the upload; the ETA flips '2 minutes left' -> '1 minutes left' once), then the
// wait overlay lifts and a 5 + 5 block of ten empty slots takes its place over the same photo, each slot handing over to its result in strict
// reading order with everything in view and no scroll. The arc, the '100%' and the ETA are functions of t that stop at the last landing; every
// element of phase 2 is static.
// Omitted: 'Upgrade and get your result in just 2 minutes', the gradient 'Upgrade & Get It in 2 Min' pill and its glyph, '5 coins', the
// composer, the Android status bar, the recording's cursor highlight and the bottom nav's labels. The style cover art is a soft gradient of
// our own (never the app's cover); the submission photo is our own meme, and every result tile is our own meme. No logo or platform font is drawn.
import { seg } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-gla';
const ROOT_W = 560, ROOT_H = 400, NAV_H = 30;
const COLS = 5, TW = 80, TH = 120, GAP = 10;
const RING = 46, RING_R = 20, RING_C = 2 * Math.PI * RING_R;
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #181818; color: #ffffff; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #262626; }
.${P}-ph { position: absolute; left: 0; right: 0; top: 0; bottom: 0; overflow: hidden; background: #2a2a2a; }
.${P}-pz { position: absolute; left: 0; right: 0; top: 0; bottom: 0; transform: scale(1.9); transform-origin: 50% 100%; }
.${P}-pz img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 100%; }
.${P}-sc { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: linear-gradient(180deg, rgba(0, 0, 0, .3) 0%, rgba(0, 0, 0, .2) 40%, rgba(24, 24, 24, .78) 76%, #1d1d1d 100%); }
.${P}-p1, .${P}-p2, .${P}-gr { position: absolute; left: 0; right: 0; top: 0; bottom: ${NAV_H}px; }
.${P}-hd { position: absolute; left: 0; right: 0; top: 24px; height: 20px; font-size: 14px; line-height: 20px; font-weight: 700; text-align: center; color: #ffffff; white-space: nowrap; }
.${P}-ring { position: absolute; left: ${(ROOT_W - RING) / 2}px; top: 246px; width: ${RING}px; height: ${RING}px; }
.${P}-ring svg { display: block; width: ${RING}px; height: ${RING}px; fill: none; stroke: #ffffff; stroke-width: 2.6; stroke-linecap: round; }
.${P}-pc { position: absolute; left: 0; right: 0; top: 246px; height: ${RING}px; display: grid; place-items: center; font-size: 19px; font-weight: 800; color: #ffffff; white-space: nowrap; }
.${P}-u1 { position: absolute; left: 0; right: 0; top: 302px; height: 18px; font-size: 13px; line-height: 18px; font-weight: 700; text-align: center; color: #ffffff; white-space: nowrap; }
.${P}-u2 { position: absolute; left: 150px; width: 260px; top: 322px; font-size: 12px; line-height: 16px; text-align: center; color: rgba(255, 255, 255, .88); }
.${P}-back { position: absolute; left: 14px; top: 20px; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: rgba(51, 51, 51, .6); }
.${P}-back svg { width: 12px; height: 12px; fill: none; stroke: #ffffff; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.${P}-card { position: absolute; left: ${(ROOT_W - 64) / 2}px; top: 66px; box-sizing: border-box; width: 64px; height: 96px; border-radius: 11px; border: 3px solid #f2a0be; overflow: hidden; background: #f2a0be; }
.${P}-art { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: radial-gradient(circle at 76% 18%, rgba(255, 255, 255, .55) 0 4px, rgba(255, 255, 255, 0) 5px), radial-gradient(circle at 24% 34%, rgba(255, 255, 255, .5) 0 2.5px, rgba(255, 255, 255, 0) 3.5px), radial-gradient(circle at 62% 64%, rgba(255, 255, 255, .45) 0 2px, rgba(255, 255, 255, 0) 3px), radial-gradient(ellipse 60% 34% at 50% 100%, rgba(255, 82, 156, .95) 0 62%, rgba(255, 82, 156, 0) 68%), radial-gradient(circle at 50% 36%, rgba(255, 238, 220, .92) 0 15%, rgba(255, 238, 220, 0) 18%), linear-gradient(165deg, #ff7eb8 0%, #ff9fa8 48%, #ffc98a 100%); }
.${P}-eta { position: absolute; left: 0; right: 0; top: 180px; height: 28px; font-size: 22px; line-height: 28px; font-weight: 800; text-align: center; color: #ffffff; white-space: nowrap; }
.${P}-cap { position: absolute; left: 0; right: 0; top: 214px; height: 18px; font-size: 12.5px; line-height: 18px; text-align: center; color: rgba(255, 255, 255, .88); white-space: nowrap; }
.${P}-hide { position: absolute; left: ${(ROOT_W - 200) / 2}px; top: 258px; display: flex; align-items: center; justify-content: center; gap: 5px; box-sizing: border-box; width: 200px; height: 34px; border-radius: 17px; background: #ffffff; font-size: 13px; font-weight: 700; color: #111111; }
.${P}-hide svg { width: 11px; height: 11px; fill: none; stroke: #111111; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.${P}-g { position: absolute; left: ${(ROOT_W - (COLS * TW + (COLS - 1) * GAP)) / 2}px; top: 58px; display: grid; grid-template-columns: repeat(${COLS}, ${TW}px); gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TW}px; height: ${TH}px; border-radius: 10px; overflow: hidden; background: rgba(255, 255, 255, .1); }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: rgba(255, 255, 255, .1); }
.${P}-nav { position: absolute; left: 0; right: 0; bottom: 0; height: ${NAV_H}px; display: flex; align-items: center; justify-content: center; gap: 92px; background: #181818; }
.${P}-nav svg { width: 14px; height: 14px; fill: none; stroke: #b9b9b9; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const UP_AT = 0.06;                                // Generate is tapped: the upload screen takes over
const PCT_FULL = 0.34;                             // the upload's '100%' is reached
const PROC_AT = 0.64;                              // 'Uploading' gives way to 'Processing'
const ETA_AT = 0.9;                                // the server's estimate drops from 2 minutes to 1
const GRID_AT = 1.04;                              // the wait overlay lifts: the ten empty slots appear over the photo
const LAND = Array.from({ length: 10 }, (_, i) => 1.12 + i * (0.56 / 9));   // slot i hands over to its result (strict reading order), the last at 1.68
const SPIN = 520;                                  // the upload arc's turn in degrees per layout second

const CHEV = '<svg viewBox="0 0 12 12"><path d="M2.6 4.6l3.4 3.4 3.4-3.4"/></svg>';
const NAV = '<svg viewBox="0 0 14 14"><path d="M3 2.5v9M7 2.5v9M11 2.5v9"/></svg><svg viewBox="0 0 14 14"><circle cx="7" cy="7" r="5"/></svg><svg viewBox="0 0 14 14"><path d="M9 2.5L4.5 7 9 11.5"/></svg>';

export default {
  id: 'glam-ai',
  label: 'Glam AI (2025)',
  source: {
    platform: 'Glam AI: Video & Photo Editor mobile app (glam.ai, Play package app.getglam; Android in a 1280x720 screen recording, iOS in a 640x360 one, YouTube, 2025-07-30 and 2025-07-15)',
    feature: "full-screen wait over the user's own submitted photo, kept sharp under a bottom black gradient: phase 1 'Uploading' (a thin white indeterminate arc round a bold '100%', 'Uploading...', \"Don't close this screen while uploading is in progress\"), phase 2 'Processing' with NO spinner (a rose-pink-bordered 2:3 tile carrying the style's cover art, a bold ETA '2 minutes left' -> '1 minutes left', 'The queue is busy.', a white 'Hide' pill); adapted to 10: the overlay lifts onto a 5 + 5 block of empty slots landing in strict reading order; the upgrade line and pill and the '5 coins' cost are omitted",
    videoId: 'EqFROdA1ito',
    capture: { url: 'https://www.youtube.com/watch?v=EqFROdA1ito', date: '2025-07-30', timestamps: 'tap at t=170.2 s; Uploading at 170.5-172.5 s (arc turning, 100% fixed); Processing at 173.5-184.3 s (tile region pixel-identical at 174.0 and 180.0); wait ends 184.4 s' },
    refs: [
      { url: 'https://www.youtube.com/watch?v=EqFROdA1ito', published: '2025-07-30', retrieved: '2026-10-15', note: 'Glam AI App Tutorial (Tutorial Wiz); frames bi_EqFROdA1ito_t169.0 .. t180.0, detail zoom of the arc and the two pills' },
      { url: 'https://www.youtube.com/watch?v=rEDiK2heeJE', published: '2025-07-15', retrieved: '2026-10-15', note: "GLAM AI Tutorial (AppSavants); iOS, 'Uploading' at 53.5 s, 'Processing' with '2 minutes left' at 55.5 s, result at 58.5 s" },
    ],
    extrapolated: [
      'ten results landing in a 5 + 5 block of slots in strict reading order, all in view with no scroll: the footage ends the wait on a single full-bleed result, so the block, the slot look and the pace are ours',
      "the upload's '100%' counts up to 100 from t: the footage shows '100%' for the whole upload (the arc is the only motion), so the count-up is ours and it is held at 100 from there",
      "the ETA flips once from '2 minutes left' to '1 minutes left' inside the beat: the two captures show a different static value each and neither ever ticked down, so the flip stands in for the estimate's own change",
      'the screen is drawn wide (560 x 400) rather than as the footage\'s portrait phone, so the stack is laid out at about 0.55 of the footage\'s height and the type is scaled up to stay legible; the photo crop, the gradient stops and the style tile\'s art are our own',
      'a style cover tile of our own (a soft pink-to-peach gradient with a few soft highlights) stands in for the chosen style\'s cover, which is style-dependent and not reproducible from the capture',
      "'The queue is busy.' is the footage's sentence cut before its upgrade clause (the omitted part); the bottom nav is three plain glyphs",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'glam-ai');
    const srcPhoto = ownSrc(ctx.src, 'glam-ai-photo');   // the sharp submission photo, full-bleed: a different decode size from the 80 x 120 tiles
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/><div class="${P}-cv"></div></div></div>`;
    const dash = `${(RING_C * 0.55).toFixed(2)} ${RING_C.toFixed(2)}`;
    const root = x.el(`<div class="${P}"><div class="${P}-ph"><div class="${P}-pz"><img src="${srcPhoto}" width="870" height="1024" decoding="sync" alt="Submitted photo"/></div></div><div class="${P}-sc"></div><div class="${P}-p1" style="visibility: hidden"><div class="${P}-hd">Uploading</div><div class="${P}-ring"><svg viewBox="0 0 ${RING} ${RING}"><circle cx="${RING / 2}" cy="${RING / 2}" r="${RING_R}" stroke-dasharray="${dash}"/></svg></div><div class="${P}-pc">0%</div><div class="${P}-u1">Uploading...</div><div class="${P}-u2">Don't close this screen while uploading is in progress</div></div><div class="${P}-p2" style="visibility: hidden"><div class="${P}-hd">Processing</div><div class="${P}-back">${CHEV}</div><div class="${P}-card"><div class="${P}-art"></div></div><div class="${P}-eta">2 minutes left</div><div class="${P}-cap">The queue is busy.</div><div class="${P}-hide">Hide${CHEV}</div></div><div class="${P}-gr" style="visibility: hidden"><div class="${P}-g">${tiles.map(cell).join('')}</div></div><div class="${P}-nav">${NAV}</div></div>`);
    const q = (s) => root.querySelector(`.${P}-${s}`);
    const p1 = q('p1'), p2 = q('p2'), gr = q('gr'), ring = q('ring').firstElementChild, pc = q('pc'), eta = q('eta');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), g: tiles[i] }));
    ctx.gate([root.querySelector(`.${P}-ph img`), ...cells.map((c) => c.im)]);

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const te = Math.min(s, LAND[9]);               // the wait's clock stops at the last landing: the arc, the count and the estimate hold there

        // phase 1: the upload screen, then phase 2: processing (static), then the overlay lifts onto the result slots
        const up = s >= UP_AT && s < PROC_AT, proc = s >= PROC_AT && s < GRID_AT, grid = s >= GRID_AT;
        put('p1', up, (v) => { p1.style.visibility = v ? '' : 'hidden'; });
        put('p2', proc, (v) => { p2.style.visibility = v ? '' : 'hidden'; });
        put('gr', grid, (v) => { gr.style.visibility = v ? '' : 'hidden'; });

        // the thin arc turns with t (a function of t alone, covered or not) and the percentage reaches 100 inside the upload
        const deg = (((te * SPIN) % 360) + 360) % 360;
        put('arc', deg.toFixed(0), (d) => { ring.style.transform = `rotate(${d}deg)`; });
        const pct = Math.floor(100 * seg(te, UP_AT, PCT_FULL) + 1e-9);
        put('pct', pct, (v) => { pc.textContent = `${v}%`; });

        // the server's estimate: 2 minutes, then 1 (the footage's two captures), a static swap
        put('eta', te >= ETA_AT, (v) => { eta.textContent = v ? '1 minutes left' : '2 minutes left'; });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // a hard swap: the empty slot is replaced by its result
          put(`i${i}`, done, (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.cv.style.display = v ? 'none' : ''; });
        });
      },
    };
  },
};
