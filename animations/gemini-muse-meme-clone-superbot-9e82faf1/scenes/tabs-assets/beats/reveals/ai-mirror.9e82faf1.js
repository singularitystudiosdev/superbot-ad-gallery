// AI Mirror (2026), the AI Mirror: AI Photo & Video mobile app's art-generation wait (YouTube QynxdEeV2g4, HowToMastery, 2026-06-11,
// t~92.0-174.0 s, Android; iKa5W_ilYso, Guide4Things, 2026-10-05, for the editor chrome; spec .tmp/clone-9e82faf1/reveal-refs/ai-mirror/spec.json,
// confidence 0.66; frames bi_QynxdEeV2g4_t92 / t100 / t112 / t152 / t174). Pressing DRAW dims the whole template editor under a ~55% black scrim
// (the black top bar with its X, the template name and the photo, the thumbnail strip, the disabled 'Change Photo' / 'Save' pills and the 'More
// Styles' sheet all stay drawn, dimmed) and sets one large DETERMINATE circular meter dead centre: a bright violet ring (about 110 px at the
// footage's 720 px canvas, ~8 px stroke) over a dark grey track whose arc length EQUALS the printed percentage, the live white percentage
// (about 30 px, bold) inside it, and under it a bold white stage caption that cycles through a fixed five-message list in order, 'Uploading...' ->
// 'Prepping AI Toolkit...' -> 'AI Drawing...' -> 'Adding textures...' -> 'Enhancing Details...' (a ticker: in the footage it loops while the
// percentage keeps climbing). The percentage runs 5 -> 98 -> 99, then the result screen replaces the overlay.
// Adapted to ten images: the whole job is compressed into the beat. The percentage climbs 5 -> 99 -> 100 from t (the arc length is the same
// number), the five captions come about evenly over it, once each, then the scrim lifts and the editor's photo area becomes a 5 + 5 block of ten
// empty slots, each handing over to its result in strict reading order with everything in view and no scroll. The meter, the percentage and the
// caption are functions of t that stop at the last landing.
// Omitted: the 'Fast Queue' pill under the caption, the 'PRO' pill and the home screen's wordmark, 'Try Free', the 'Your art is ready / Try it
// free to unlock now!' paywall result screen and 'Save My Art', the DRAW button and the consent card. The editor's photo is our own meme and
// every result is our own meme; no logo or platform font is drawn (a plain ring, plain glyphs, system type).
import { seg } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-amr';
const ROOT_W = 560, ROOT_H = 420, BAR_H = 34, ED_H = 256;
const COLS = 5, TW = 84, TH = 112, GAP = 8;
const M = 110, STROKE = 8, MR = (M - STROKE) / 2, MC = 2 * Math.PI * MR;   // the meter: 110 px across, 8 px stroke
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #000000; color: #ffffff; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #1f1f22; }
.${P}-bar { position: absolute; left: 0; right: 0; top: 0; height: ${BAR_H}px; display: flex; align-items: center; gap: 10px; padding: 0 14px; background: #000000; font-size: 12px; font-weight: 700; color: #ffffff; white-space: nowrap; }
.${P}-bar svg { flex: none; width: 13px; height: 13px; fill: none; stroke: #ffffff; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ed { position: absolute; left: 0; right: 0; top: ${BAR_H}px; height: ${ED_H}px; overflow: hidden; background: #0d0d0f; }
.${P}-pz { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-pz img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 0; }
.${P}-pen { position: absolute; right: 6px; top: 176px; display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: #e8661f; }
.${P}-pen svg { width: 9px; height: 9px; fill: none; stroke: #ffffff; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.${P}-th { position: absolute; left: 0; right: 0; top: ${BAR_H + ED_H}px; height: 42px; background: #000000; }
.${P}-th i { position: absolute; left: ${(ROOT_W - 32) / 2}px; top: 5px; box-sizing: border-box; width: 32px; height: 32px; border-radius: 3px; border: 1.5px solid #ffffff; background: linear-gradient(160deg, #6b6b70, #2a2a2e); }
.${P}-pills { position: absolute; left: 0; right: 0; top: ${BAR_H + ED_H + 46}px; height: 32px; background: #000000; }
.${P}-pills span { position: absolute; top: 0; display: flex; align-items: center; justify-content: center; gap: 6px; box-sizing: border-box; height: 32px; border-radius: 9px; background: #2c2c2e; font-size: 11px; font-weight: 700; color: #ffffff; white-space: nowrap; }
.${P}-pills svg { width: 11px; height: 11px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-sheet { position: absolute; left: 0; right: 0; bottom: 0; height: 42px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; box-sizing: border-box; border-radius: 12px 12px 0 0; background: #1c1c1e; font-size: 11px; font-weight: 700; color: #ffffff; }
.${P}-sheet svg { width: 10px; height: 8px; fill: none; stroke: #c8c8cc; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.${P}-sc { position: absolute; left: 0; right: 0; top: ${BAR_H}px; bottom: 0; background: rgba(0, 0, 0, .55); }
.${P}-mt { position: absolute; left: ${(ROOT_W - M) / 2}px; top: 82px; width: ${M}px; height: ${M}px; }
.${P}-mt svg { display: block; width: ${M}px; height: ${M}px; fill: none; stroke-width: ${STROKE}; }
.${P}-trk { stroke: #3a3a3c; }
.${P}-arc { stroke: url(#${P}-grad); stroke-linecap: round; }
.${P}-pc { position: absolute; left: 0; top: 0; width: ${M}px; height: ${M}px; display: grid; place-items: center; font-size: 29px; font-weight: 800; color: #ffffff; white-space: nowrap; }
.${P}-cap { position: absolute; left: 0; right: 0; top: 206px; height: 22px; font-size: 15px; line-height: 22px; font-weight: 700; text-align: center; color: #ffffff; white-space: nowrap; }
.${P}-ov { position: absolute; left: 0; right: 0; top: ${BAR_H}px; height: ${ED_H}px; }
.${P}-gr { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-g { position: absolute; left: ${(ROOT_W - (COLS * TW + (COLS - 1) * GAP)) / 2}px; top: ${BAR_H + 12}px; display: grid; grid-template-columns: repeat(${COLS}, ${TW}px); gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TW}px; height: ${TH}px; border-radius: 9px; overflow: hidden; background: #1a1a1d; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #1a1a1d; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const START = 0.06;                                // DRAW is pressed: the scrim drops and the meter reads 5%
const FULL_AT = 1.04;                              // the meter reads 100
const GRID_AT = 1.1;                               // the scrim lifts: the ten empty slots appear in the editor's photo area
const LAND = Array.from({ length: 10 }, (_, i) => 1.14 + i * (0.54 / 9));   // slot i hands over to its result (strict reading order), the last at 1.68
const HOLD5 = 0.06;                                // the meter reads 5% for this long before it starts to climb
const CLIMB_END = 0.96;                            // the percentage reaches 99 here and holds
const STAGES = ['Uploading...', 'Prepping AI Toolkit...', 'AI Drawing...', 'Adding textures...', 'Enhancing Details...'];
const STAGE_LEN = (GRID_AT - START) / STAGES.length;   // the five captions come about evenly over the wait

const X_ICON = '<svg viewBox="0 0 12 12"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/></svg>';
const HEART = '<svg viewBox="0 0 14 14"><path d="M7 11.6L2.6 7.3a2.6 2.6 0 013.7-3.7L7 4.3l.7-.7a2.6 2.6 0 013.7 3.7zM11.6 1.5v3M10.1 3h3"/></svg>';
const PEN = '<svg viewBox="0 0 12 12"><path d="M2 10l.6-2.6L8 2l2 2-5.4 5.4zM7 3l2 2"/></svg>';
const PHOTO = '<svg viewBox="0 0 12 12"><rect x="1.5" y="2.5" width="9" height="7" rx="1.2"/><path d="M2 8.5l2.4-2.4 1.8 1.8 1-1 1.8 1.6"/></svg>';
const SAVE = '<svg viewBox="0 0 12 12"><path d="M6 2v5.6M3.6 5.4L6 7.8l2.4-2.4M2.5 10h7"/></svg>';
const UP = '<svg viewBox="0 0 10 8"><path d="M1.6 6L5 2.6 8.4 6"/></svg>';

export default {
  id: 'ai-mirror',
  label: 'AI Mirror (2026)',
  source: {
    platform: 'AI Mirror: AI Photo & Video mobile app (POLYVERSE INC.; Android phone screen in a 1280x720 screen recording, YouTube, 2026-06-11, with the editor chrome cross-checked on 2026-10-05)',
    feature: "dimmed template editor under a ~55% black scrim with one large DETERMINATE violet circular meter (arc length equals the printed percentage, live white % inside) and a rotating five-message stage caption 'Uploading...' -> 'Prepping AI Toolkit...' -> 'AI Drawing...' -> 'Adding textures...' -> 'Enhancing Details...'; adapted to 10: the percentage climbs 5 -> 99 -> 100, the captions come once each, then the scrim lifts onto a 5 + 5 block of empty slots landing in strict reading order; the 'Fast Queue' pill and the paywall result screen are omitted",
    videoId: 'QynxdEeV2g4',
    capture: { url: 'https://www.youtube.com/watch?v=QynxdEeV2g4', date: '2026-06-11', timestamps: 'DRAW at t=92.0 s; meter at 5% at 92.5 s, 13% (Uploading...) at 100 s, 31% (Adding textures...) at 112 s, 98% at 146.5 s, 99% at 171 s; result screen at 174.0 s' },
    refs: [
      { url: 'https://www.youtube.com/watch?v=QynxdEeV2g4', published: '2026-06-11', retrieved: '2026-10-15', note: 'How to Use Ai Mirror App Step by Step Guide (HowToMastery); frames bi_QynxdEeV2g4_t90_compose, t92, t100, t112, t152, t174' },
      { url: 'https://www.youtube.com/watch?v=iKa5W_ilYso', published: '2026-10-05', retrieved: '2026-10-15', note: "How to Use Ai Mirror App (Guide4Things); the editor's top bar and bottom bar; its own wait is a simpler 'Analyzing your photo...' spinner, not the meter" },
    ],
    extrapolated: [
      'ten results landing in a 5 + 5 block of slots in the editor\'s photo area in strict reading order, all in view with no scroll: the footage ends the wait on a single result screen with a paywall, so the block, the slot look and the pace are ours',
      'the ~80 s job is compressed into the beat: the percentage climbs linearly 5 -> 99 (the footage runs ~1.2 %/s and stalls at 98 for ~24 s), holds 99, then reads 100 briefly before the scrim lifts',
      'the five captions come once each, about evenly over the wait: the footage cycles them about every 5 s and loops them while the percentage keeps climbing',
      "the editor's photo is a crop of our own meme and the thumbnail strip, 'Change Photo' / 'Save' pills and 'More Styles' sheet are drawn from the frames with plain glyphs; the editor is laid out at 560 x 420 rather than as the footage's portrait phone, so the meter keeps its 110 px / 8 px size while the screen around it is wider",
      "the DRAW press is not drawn: the beat starts on the un-dimmed editor and the scrim drops at once, as the footage does; the violet gradient stops are read from the frames",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'ai-mirror');
    const srcPhoto = ownSrc(ctx.src, 'ai-mirror-photo');   // the editor's photo, full width: a different decode size from the 84 x 112 tiles
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/><div class="${P}-cv"></div></div></div>`;
    const c = M / 2;
    const meter = `<svg viewBox="0 0 ${M} ${M}"><defs><linearGradient id="${P}-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#a875ff"/></linearGradient></defs><circle class="${P}-trk" cx="${c}" cy="${c}" r="${MR}"/><circle class="${P}-arc" cx="${c}" cy="${c}" r="${MR}" transform="rotate(-90 ${c} ${c})" stroke-dasharray="0 ${MC.toFixed(3)}"/></svg>`;
    const root = x.el(`<div class="${P}"><div class="${P}-bar">${X_ICON}New Year Card${HEART}</div><div class="${P}-ed"><div class="${P}-pz"><img src="${srcPhoto}" width="870" height="1024" decoding="sync" alt="Template photo"/></div><div class="${P}-pen">${PEN}</div></div><div class="${P}-th"><i></i></div><div class="${P}-pills"><span style="left: 28px; width: 252px">${PHOTO}Change Photo</span><span style="left: 288px; width: 244px; background: #1f1f21; color: #5c5c60">${SAVE}Save</span></div><div class="${P}-sheet">${UP}More Styles</div><div class="${P}-sc" style="visibility: hidden"></div><div class="${P}-ov" style="visibility: hidden"><div class="${P}-mt">${meter}<div class="${P}-pc">5%</div></div><div class="${P}-cap">${STAGES[0]}</div></div><div class="${P}-gr" style="visibility: hidden"><div class="${P}-g">${tiles.map(cell).join('')}</div></div></div>`);
    const q = (s) => root.querySelector(`.${P}-${s}`);
    const sc = q('sc'), ov = q('ov'), gr = q('gr'), ed = q('pz'), pen = q('pen'), arc = q('arc'), pc = q('pc'), cap = q('cap');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), g: tiles[i] }));
    ctx.gate([root.querySelector(`.${P}-pz img`), ...cells.map((c2) => c2.im)]);

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const te = Math.min(s, LAND[9]);               // the wait's clock stops at the last landing: the meter, the percentage and the caption hold there

        // the editor is dimmed and the meter drawn from the press until the scrim lifts onto the result slots
        const wait = s >= START && s < GRID_AT, grid = s >= GRID_AT;
        put('sc', wait, (v) => { sc.style.visibility = v ? '' : 'hidden'; ov.style.visibility = v ? '' : 'hidden'; });
        put('gr', grid, (v) => { gr.style.visibility = v ? '' : 'hidden'; ed.style.visibility = v ? 'hidden' : ''; pen.style.visibility = v ? 'hidden' : ''; });

        // the determinate meter: 5% at the press, 99% by CLIMB_END (held), 100 at FULL_AT; the arc length is the same number as the digits
        const v = te >= FULL_AT ? 100 : 5 + 94 * seg(te, START + HOLD5, CLIMB_END);
        const shown = te >= FULL_AT ? 100 : Math.min(99, Math.round(v));
        put('arc', v.toFixed(2), () => { arc.setAttribute('stroke-dasharray', `${(MC * v / 100).toFixed(3)} ${MC.toFixed(3)}`); });
        put('pct', shown, (n) => { pc.textContent = `${n}%`; });

        // the stage caption: the five messages in order, about evenly over the wait, each once
        const si = Math.max(0, Math.min(STAGES.length - 1, Math.floor((te - START) / STAGE_LEN)));
        put('cap', si, (n) => { cap.textContent = STAGES[n]; });

        cells.forEach((c2, i) => {
          const done = s >= LAND[i];
          // a hard swap: the empty slot is replaced by its result
          put(`i${i}`, done, (d) => { c2.im.style.visibility = d ? '' : 'hidden'; c2.cv.style.display = d ? 'none' : ''; });
        });
      },
    };
  },
};
