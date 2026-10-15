// Katalist AI's storyboard screen while a script becomes a board of shots (Katalist's own quick start, YouTube EtenWXNv0V0,
// 2024-04-16, t~50-60 s; later builds -EmerTHABbk 2025-11-20, adG0ZKWRALw 2025-12-25 and 4u0rWBkzvpQ 2024-09-11; spec
// .tmp/clone-9e82faf1/reveal-refs/katalist-ai/spec.json, confidence 0.6; frames ay_grid_generating_t52.png, ay_grid_queued_t56.png,
// ay_grid_progress_t76.png). A near-black page under a slim grey bar titled 'Demo', and a grid of shot cards. Each card is a flat
// dark 16:9 slot with a thin pink outline, a grey ring that fills with a pink arc and ONE centred bold line: 'Waiting for frame
// context...' until the shot's turn, then the phase strings 'Encoding prompt...' -> 'Extracting Script...' -> 'Queued for
// generation...'. Under the slot sits a rounded description box (the scene's prose) and two grey pill chips with an hourglass,
// 'Generating scene' and 'Generating character'. A card that lands swaps its slot for the keyframe and its pills for the scene
// name and the character name; a toast 'New Visual Generated!' fires while the batch fills. The footage also draws a thin
// progress bar along each pending card's lower edge (spec, from the 44-84 s window; the three frames do not show it, so its
// teal #7BC7A8 is the spec's eyeballed sample).
// Adapted to ten shots: four columns, 4 + 4 + 2 cards in reading order, the two cells left in the last row holding the
// footage's right-hand Characters / Exports panel. The spinners, arcs, bars, phase strings and the toast are all computed from
// t and held at the last landing.
// Omitted: the Katalist wordmark, '< Projects', the 'Demo' account badge and avatar, the Beta chip, the browser frame and the
// creator's webcam bubble. The footage's pictures are never reproduced: every slot is our own meme.
import { seg } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-kat';
const ROOT_H = 458, COLS = 4, GAP = 6, CARD_H = 136;
const CSS = `
.${P} { box-sizing: border-box; display: flex; flex-direction: column; width: 560px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #101010; color: #c8ccc6; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #262626; position: relative; }
.${P}-top { flex: none; display: grid; place-items: center; height: 24px; background: #2c2c2c; font-size: 8.5px; font-weight: 500; letter-spacing: .02em; color: #ececec; }
.${P}-g { flex: none; box-sizing: border-box; display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); grid-auto-rows: ${CARD_H}px; gap: ${GAP}px; padding: 8px 10px 0; }
.${P}-c { position: relative; display: flex; flex-direction: column; min-width: 0; height: ${CARD_H}px; overflow: hidden; }
.${P}-s { position: relative; flex: none; aspect-ratio: 16 / 9; border-radius: 3px; overflow: hidden; background: #272627; }
.${P}-s img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-pend { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; background: #272627; box-shadow: inset 0 0 0 1px #8a4c69; }
.${P}-ring { display: block; width: 17px; height: 17px; border-radius: 50%; -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3.4px), #000 calc(100% - 3px)); mask: radial-gradient(farthest-side, transparent calc(100% - 3.4px), #000 calc(100% - 3px)); }
.${P}-tx { font-size: 6.3px; font-weight: 700; line-height: 8px; letter-spacing: .01em; color: #c9779f; white-space: nowrap; }
.${P}-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: #333; }
.${P}-bar u { position: absolute; left: 0; top: 0; bottom: 0; width: 0; background: #7bc7a8; }
.${P}-d { flex: none; box-sizing: border-box; height: 40px; margin-top: 4px; padding: 4px 5px; border-radius: 4px; background: #2a2a2a; font-size: 5.4px; line-height: 7px; color: #b4b4b4; overflow: hidden; }
.${P}-k { flex: none; display: flex; gap: 2px; margin-top: 5px; height: 12px; min-width: 0; }
.${P}-k span { display: flex; align-items: center; gap: 2px; box-sizing: border-box; height: 12px; padding: 0 4px 0 3px; border-radius: 6px; background: #2a2a2a; font-size: 5px; color: #b4b4b4; white-space: nowrap; overflow: hidden; }
.${P}-k svg { flex: none; width: 5px; height: 5px; fill: none; stroke: #b4b4b4; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-k svg.${P}-fill { fill: #b4b4b4; stroke: none; }
.${P}-pn { grid-column: 3 / span 2; grid-row: 3; box-sizing: border-box; height: ${CARD_H}px; padding: 8px 10px; border-radius: 4px; background: #1b1b1b; overflow: hidden; }
.${P}-pn h4 { margin: 0 0 4px; font-size: 7px; font-weight: 600; line-height: 9px; color: #eaeaea; }
.${P}-who { display: flex; align-items: center; gap: 5px; height: 16px; margin-bottom: 7px; font-size: 6.3px; color: #cfcfcf; }
.${P}-who i { display: block; width: 14px; height: 14px; border-radius: 50%; background: #3a3a3a; box-shadow: inset 0 0 0 1px #4a4a4a; }
.${P}-ex { display: flex; align-items: center; gap: 4px; height: 11px; font-size: 6px; color: #7a7a7a; white-space: nowrap; }
.${P}-ex svg { flex: none; width: 6px; height: 6px; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-ex.${P}-on { color: #d4d4d4; }
.${P}-toast { position: absolute; right: 10px; top: 29px; box-sizing: border-box; height: 18px; padding: 0 9px; border-radius: 4px; background: #333; box-shadow: 0 2px 6px rgba(0, 0, 0, .5); font-size: 6.6px; line-height: 18px; font-weight: 500; color: #f2f2f2; white-space: nowrap; }
`;

const SHOTS = [
  ['Ancient Mesopotamia', 'Our protagonist begins in ancient Mesopotamia, marveling at humanity’s first steps in agriculture and writing amidst bustling ziggurats.'],
  ['Ancient Greek Agora', 'In Ancient Greece, they walk through the Agora, engaging in debates with philosophers like Socrates, witnessing the birth of democracy and theater.'],
  ['Roman Empire Road', 'Roaming the expansive roads of the Roman Empire, our protagonist sees the grandeur of Rome, its aqueducts and the Colosseum.'],
  ['Middle Ages Europe', 'In the Middle Ages, they traverse European castles and monasteries, observing knights, peasants, and the pervasive power of the Church.'],
  ['Italian Renaissance', 'The Renaissance unfolds around them in Italy, where they encounter the brilliance of Da Vinci and Michelangelo, amidst a revival of arts and sciences.'],
  ['Age of Exploration', 'Aboard ships of the Age of Exploration, they navigate uncharted seas with explorers like Magellan, witnessing the discovery of new worlds and the impacts of colonization.'],
  ['Industrial Revolution', 'Amid smoke and steam of the Industrial Revolution, our protagonist witnesses profound changes as factories and railways reshape cities and daily life.'],
  ['World Wars', 'They walk through the trenches of World War I and the devastated streets of World War II, experiencing the toll of global conflict.'],
  ['Digital Revolution', 'In the late 20th century, they observe the digital revolution first-hand, from the creation of the first personal computers to the dawn of the internet.'],
  ['21st Century Reflection', 'In the twenty-first century, our protagonist pauses to reflect, looking back across every era crossed on the long road from the first cities to today.'],
];
const PHASES = ['Encoding prompt...', 'Extracting Script...', 'Queued for generation...'];
const WAIT = 'Waiting for frame context...';
const NEW = 'New Visual Generated!';
const REF = 1.84;                                 // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const LAND = Array.from({ length: 10 }, (_, i) => 0.4 + i * 0.1425);   // shot i's keyframe lands (strict reading order), the last at 1.6825
const LEAD = 0.4;                                 // a shot leaves 'Waiting for frame context...' this long before it lands, then cycles the three phases
const FADE = 0.06;                                // the slot's cover thins away over this long before the keyframe lands
const HOUR = '<svg viewBox="0 0 12 12"><path d="M3 1.5h6M3 10.5h6M3.6 1.5c0 3 4.8 3 4.8 4.5S3.6 7.5 3.6 10.5M8.4 1.5c0 3-4.8 3-4.8 4.5s4.8 1.5 4.8 4.5"/></svg>';
const MOUNT = `<svg class="${P}-fill" viewBox="0 0 12 12"><path d="M0.8 10 4.6 3.6 7 7.4 8.4 5.6 11.2 10z"/></svg>`;
const PERSON = `<svg class="${P}-fill" viewBox="0 0 12 12"><circle cx="6" cy="3.6" r="2.3"/><path d="M1.8 11c0-3 2-4.4 4.2-4.4s4.2 1.4 4.2 4.4z"/></svg>`;
const DL = '<svg viewBox="0 0 12 12"><path d="M6 1.5v6M3.4 5.2 6 7.8l2.6-2.6M2 10.5h8"/></svg>';
const EXPORTS = ['ZIP', 'PowerPoint', 'Video', 'Copy Presentation Link'];

export default {
  id: 'katalist-ai',
  label: 'Katalist storyboard (2024)',
  source: {
    platform: "Katalist AI web app, app.katalist.ai storyboard screen (desktop browser, dark theme; Katalist's own quick start guide, YouTube EtenWXNv0V0, 2024-04-16, t~50-60 s)",
    feature: "dark storyboard page with a grid of shot cards: each pending card is a flat dark slot with a pink outline, a grey ring filling with a pink arc and one centred line ('Waiting for frame context...', then 'Encoding prompt...' -> 'Extracting Script...' -> 'Queued for generation...'), a thin progress bar on its lower edge, its scene prose, and the labelled hourglass chips 'Generating scene' / 'Generating character'; a card that lands swaps in its keyframe and its scene / character chips, and the toast 'New Visual Generated!' shows while the batch fills (adapted to 10: four columns, 4 + 4 + 2 cards in strict reading order, the Characters / Exports panel in the two free cells; wordmark, '< Projects', Demo badge, avatar, Beta chip, browser frame and webcam omitted)",
    refs: [
      { url: 'https://www.youtube.com/watch?v=EtenWXNv0V0', published: '2024-04-16', retrieved: '2026-10-14' },
      { url: 'https://www.youtube.com/watch?v=-EmerTHABbk', published: '2025-11-20', retrieved: '2026-10-14', note: "later build: the pre-grid 'Generating your story, please wait...' overlay (not drawn)" },
      { url: 'https://www.youtube.com/watch?v=adG0ZKWRALw', published: '2025-12-25', retrieved: '2026-10-14', note: 'later build: same overlay copy (not drawn)' },
      { url: 'https://www.youtube.com/watch?v=4u0rWBkzvpQ', published: '2024-09-11', retrieved: '2026-10-14', note: "later build: upper-case 'GENERATING ...' caption over the grid (not drawn)" },
    ],
    extrapolated: [
      'ten shot cards in a 4 + 4 + 2 block: the footage shows a three-column grid of nine cards at the fold (the first three rows) and scrolls; ours holds all ten with no scroll',
      "the tenth description and scene name ('21st Century Reflection') come from the footage's scene list; its prose is our own, as is 'Muse' for the character chip the footage calls by another name",
      "descriptions: scenes 1-6 follow the footage's prose (the Roman Empire card is cut to end at 'the Colosseum.' to fit four lines in the narrower card); scenes 7-9 are cut off at the fold in the footage and are completed here",
      'the per-card progress bar (teal #7BC7A8, 2 px on the slot\'s lower edge) is the spec\'s reading of the 44-84 s window; none of the three reference frames shows it',
      "the phase order per card (Waiting -> Encoding -> Extracting -> Queued -> landed) and its timing: the footage shows the strings on neighbouring cards at t=52 and t=56, never one card's whole run",
      "the ring's pink arc growing from empty to the landing, and the hourglass turning: the footage shows static arcs of different lengths and an hourglass glyph",
      "the toast is held from the first landing to the last; the footage fires it as a card lands, with no duration",
      'right-hand panel reduced to Characters and Exports (the footage adds a Scenes list that grows as shots land)',
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'katalist-ai');
    const card = (g, i) => {
      const [name, text] = SHOTS[i];
      return `<div class="${P}-c"><div class="${P}-s"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; transform-origin: ${g.origin}"/><div class="${P}-pend"><i class="${P}-ring"></i><span class="${P}-tx">${WAIT}</span><div class="${P}-bar"><u></u></div></div></div><div class="${P}-d">${x.esc(text)}</div><div class="${P}-k ${P}-wk"><span>${HOUR}Generating scene</span><span>${HOUR}Generating character</span></div><div class="${P}-k ${P}-dn" style="display: none"><span>${MOUNT}${x.esc(name)}</span><span>${PERSON}Muse</span></div></div>`;
    };
    const panel = `<div class="${P}-pn"><h4>Characters</h4><div class="${P}-who"><i></i>Muse</div><h4>Exports</h4>${EXPORTS.map((e) => `<div class="${P}-ex">${DL}${e}</div>`).join('')}</div>`;
    const root = x.el(`<div class="${P}"><div class="${P}-top">Demo</div><div class="${P}-g">${tiles.map(card).join('')}${panel}</div><div class="${P}-toast" style="display: none">${NEW}</div></div>`);
    const cells = [...root.querySelectorAll(`.${P}-c`)].map((n, i) => {
      const im = n.querySelector('img');
      im.style.transform = restTransform(tiles[i]);   // the tile's resting crop and grade, set once and never animated
      im.style.filter = restFilter(tiles[i]);
      return {
        im, pend: n.querySelector(`.${P}-pend`), ring: n.querySelector(`.${P}-ring`), tx: n.querySelector(`.${P}-tx`), fill: n.querySelector(`.${P}-bar u`),
        wk: n.querySelector(`.${P}-wk`), dn: n.querySelector(`.${P}-dn`), glyphs: [...n.querySelectorAll(`.${P}-wk svg`)],
      };
    });
    const toast = root.querySelector(`.${P}-toast`);
    const exps = [...root.querySelectorAll(`.${P}-ex`)];
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const te = Math.min(s, LAND[9]);               // the wait's clock stops at the last landing: spinners, arcs, bars and phases hold there
        const tr = Math.max(te, 0);

        cells.forEach((c, i) => {
          const a = LAND[i];
          const start = a - LEAD;
          const f = seg(s, a - FADE, a);
          put(`i${i}`, s >= a - FADE, (v) => { c.im.style.visibility = v ? '' : 'hidden'; });
          put(`c${i}`, f.toFixed(3), () => {
            if (f >= 1) { c.pend.style.display = 'none'; c.pend.style.opacity = ''; } else { c.pend.style.display = ''; c.pend.style.opacity = f > 0 ? (1 - f).toFixed(3) : ''; }
          });
          put(`k${i}`, s >= a, (v) => { c.wk.style.display = v ? 'none' : ''; c.dn.style.display = v ? '' : 'none'; });

          // the slot's line: waiting for its turn, then the three phases of its run
          const act = seg(tr, start, a);
          const ph = tr < start ? -1 : Math.min(2, Math.floor(act * 3));
          put(`t${i}`, ph, (v) => { c.tx.textContent = v < 0 ? WAIT : PHASES[v]; });
          // the ring's arc grows over the run (empty while waiting), turning slowly; the bar fills along the lower edge from the start of the batch
          const arc = ph < 0 ? 0 : Math.max(0.06, act) * 0.92;
          const rot = ((tr * 150 + i * 53) % 360 + 360) % 360;
          put(`a${i}`, `${(arc * 100).toFixed(1)}|${rot.toFixed(0)}`, () => {
            const e = (arc * 360).toFixed(1);
            c.ring.style.background = arc > 0 ? `conic-gradient(#d381ae 0deg ${e}deg, #3b3b3b ${e}deg 360deg)` : '#3b3b3b';
            c.ring.style.transform = `rotate(${rot.toFixed(0)}deg)`;
          });
          const bar = seg(tr, 0, a);
          put(`b${i}`, bar.toFixed(3), () => { c.fill.style.width = `${(bar * 100).toFixed(1)}%`; });
          // the hourglass chips turn with t, each glyph out of step with its neighbour
          const hr = ((tr * 240 + i * 31) % 360 + 360) % 360;
          put(`h${i}`, hr.toFixed(0), () => { c.glyphs.forEach((g, j) => { g.style.transform = `rotate(${(hr + j * 90) % 360}deg)`; }); });
        });

        // the toast fires with the first keyframe and runs until the batch is whole
        const tin = seg(s, LAND[0], LAND[0] + 0.06);
        const tvis = s >= LAND[0] && s < LAND[9];
        put('ts', `${tvis}|${tin.toFixed(3)}`, () => { toast.style.display = tvis ? '' : 'none'; toast.style.opacity = tin < 1 ? tin.toFixed(3) : ''; });
        // the exports light up once the board is whole
        put('ex', s >= LAND[9], (v) => exps.forEach((e) => e.classList.toggle(`${P}-on`, v)));
      },
    };
  },
};
