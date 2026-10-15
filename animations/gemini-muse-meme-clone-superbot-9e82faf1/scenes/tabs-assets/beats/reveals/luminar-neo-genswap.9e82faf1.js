// Luminar Neo GenSwap (Skylum, Luminar Neo 1.16.0, macOS desktop), the wait after 'Swap' (YouTube 8qgA_Cc8gUQ, Luminar / Skylum,
// 2023-11-14, t=30.25-36.0 s; and Ej-EuNRKtPw, Tim Harris AI, 2023-11-14, t=428.25-430.5 s; spec
// .tmp/clone-9e82faf1/reveal-refs/luminar-neo-genswap/spec.json, confidence 0.6; frames bd_lum_official_t29.0 .. t37.0 and
// bd_lum_timharris_t427.75 .. t431.0). A dark #1E1E1E editor window: a slim top bar (traffic lights, 'Cancel', 'Save'), a full-bleed
// canvas holding the photo, and two bars floating at the bottom: the prompt bar ('Add your prompt here' / the typed prompt, a
// right-hand x and the remaining-character counter, 256 minus the prompt length) and the GenSwap toolbar (the GenSwap chip, undo,
// redo, info, eye, '38%' brush size, 'Select | Deselect', a slider with its value, 'Reset Selection', and the 'Swap' pill, a
// blue-to-violet gradient). Pressing Swap drops the photo in ONE step to about 27% luminance (a black scrim at about 0.73 alpha,
// held flat, no blur, no fade) and a faint pale constellation / wireframe mesh of 1 px lines and small node dots drifts over the
// dimmed photo; the bars stay lit, only the Swap pill (label unchanged), 'Reset Selection', undo and redo desaturate to grey. There
// is no status text, percentage, spinner, bar or timer. The result then replaces the dim photo in a single frame (hard swap, no
// cross-fade), scrim and mesh gone, the pill blue-violet again.
// Adapted to ten images: the canvas holds a 5 x 2 block of ten photos, all dimmed together at the press, and the ten results land
// one by one in strict reading order, each in one step (its scrim gone, the new picture on show). The mesh is drawn over the whole
// block while anything is still pending (landed tiles sit above it) and is gone once the last has landed. Extrapolated: the ten
// tiles and their staggered landing, and the pale fog stand-in shown before Swap (the footage's own photo is never reproduced).
// Omitted: the LUMINAR NEO wordmark (the Skylum logo), the pricing page, the promo-code lower third, the creator's watermark, and
// the 'TIP: Use nouns ...' card that sits over the wait in the Tim Harris capture only (it may be a first-run onboarding tip, and
// the first-party capture shows none); the window's brand wallpaper is video chrome and is not drawn.
import { seg, press } from '../../../../lib.9b47fc30.js';
import { injectStyle, hash, ownSrc, restTransform, restFilter, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-lng';
const ROOT_H = 340, BAR_W = 396, TW = 102, TH = 120, GAP = 4, COLS = 5;
const GW = COLS * TW + (COLS - 1) * GAP, GH = 2 * TH + GAP;   // the photo block, px
const CSS = `
.${P} { box-sizing: border-box; position: relative; display: flex; flex-direction: column; width: 560px; max-width: 100%; height: ${ROOT_H}px; border-radius: 10px; background: #1e1e1e; color: #e6e6e6; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #2c2c2c; }
.${P}-top { flex: none; display: flex; align-items: center; gap: 4px; height: 24px; padding: 0 8px; background: #262626; }
.${P}-top > i { display: block; width: 5.5px; height: 5.5px; border-radius: 50%; }
.${P}-top > i:nth-child(1) { background: #ff5f57; }
.${P}-top > i:nth-child(2) { background: #febc2e; }
.${P}-top > i:nth-child(3) { background: #28c840; }
.${P}-top .${P}-sp { flex: 1; }
.${P}-btn { box-sizing: border-box; display: grid; place-items: center; height: 13px; padding: 0 9px; border-radius: 3px; background: #333333; font-size: 6.5px; line-height: 13px; color: #e8e8e8; white-space: nowrap; }
.${P}-save { margin-left: 5px; background: #2c2c2c; color: #5f5f5f; box-shadow: inset 0 0 0 1px #2c2c2c; }
.${P}-cv { position: relative; flex: 1; min-height: 0; }
.${P}-g { position: absolute; left: 50%; top: 10px; width: ${GW}px; height: ${GH}px; margin-left: ${-GW / 2}px; display: grid; grid-template-columns: repeat(${COLS}, ${TW}px); grid-auto-rows: ${TH}px; gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TW}px; height: ${TH}px; overflow: hidden; background: linear-gradient(180deg, #e9ecee 0%, #d5dadc 52%, #8f9a86 78%, #6f7b64 100%); }
.${P}-z { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
.${P}-z img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-sc { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.73); }
.${P}-mesh { position: absolute; left: 50%; top: 10px; width: ${GW}px; height: ${GH}px; margin-left: ${-GW / 2}px; z-index: 2; pointer-events: none; overflow: hidden; }
.${P}-mesh line { stroke: #f2f4f5; stroke-width: 0.6px; }
.${P}-mesh circle { fill: #f2f4f5; }
.${P}-cur { position: absolute; left: 0; top: 0; width: 9px; height: 12px; z-index: 4; pointer-events: none; }
.${P}-bars { position: absolute; left: 50%; bottom: 7px; width: ${BAR_W}px; margin-left: ${-BAR_W / 2}px; display: flex; flex-direction: column; gap: 3px; }
.${P}-pb { box-sizing: border-box; display: flex; align-items: center; height: 15px; padding: 0 7px; border-radius: 5px; background: #2f2f2f; font-size: 6.5px; color: #f1f1f1; white-space: nowrap; overflow: hidden; }
.${P}-pb span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.${P}-pb b { flex: none; font-weight: 400; font-size: 7px; line-height: 7px; color: #cfcfcf; margin-right: 9px; }
.${P}-pb em { flex: none; font-style: normal; font-weight: 600; font-size: 6px; color: #e8e8e8; }
.${P}-pb u { flex: none; display: block; width: 6px; height: 6px; margin-left: 3px; border-radius: 50%; box-shadow: inset 0 0 0 1px #77797a; clip-path: polygon(0 0, 100% 0, 100% 62%, 56% 100%, 0 100%); }
.${P}-tb { box-sizing: border-box; display: flex; align-items: center; height: 17px; padding: 0 0 0 0; border-radius: 6px; background: #3a3a3a; font-size: 6.2px; color: #ececec; white-space: nowrap; overflow: hidden; }
.${P}-chip { flex: none; display: flex; align-items: center; gap: 4px; box-sizing: border-box; width: 44px; height: 100%; padding-left: 5px; background: #424444; font-size: 6.2px; }
.${P}-chip svg { flex: none; width: 6px; height: 6px; }
.${P}-ic { flex: none; display: flex; align-items: center; justify-content: center; width: 11px; height: 100%; }
.${P}-ic svg { width: 6.5px; height: 6.5px; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-eye { flex: none; display: flex; align-items: center; gap: 5px; height: 100%; padding: 0 5px; }
.${P}-eye svg { width: 8px; height: 8px; fill: none; stroke: #f0f0f0; stroke-width: 1.2; }
.${P}-eye svg path { fill: #f0f0f0; stroke: none; }
.${P}-eye em { font-style: normal; font-size: 6.2px; }
.${P}-seg { flex: none; display: flex; align-items: center; height: 100%; margin-left: 3px; border-radius: 4px; background: #333333; }
.${P}-seg span { display: grid; place-items: center; width: 34px; height: 11px; font-size: 6.2px; line-height: 11px; }
.${P}-seg span:first-child { background: #424242; border-radius: 3px; }
.${P}-sl { flex: none; position: relative; display: flex; align-items: center; gap: 6px; width: 66px; height: 100%; margin: 0 4px 0 6px; font-size: 6.2px; }
.${P}-sl i { position: relative; display: block; flex: 1; height: 1.5px; border-radius: 1px; background: #6a6c6d; }
.${P}-sl i b { position: absolute; left: 0; top: 0; width: 36%; height: 100%; background: #5a8fd0; border-radius: 1px; }
.${P}-sl i s { position: absolute; left: 36%; top: -2px; width: 5.5px; height: 5.5px; margin-left: -2.7px; border-radius: 50%; background: #dcdcdc; }
.${P}-reset { flex: none; display: grid; place-items: center; box-sizing: border-box; height: 11px; margin: 0 5px 0 3px; padding: 0 6px; border-radius: 3px; background: #4a4a4a; font-size: 6.2px; line-height: 11px; }
.${P}-swap { flex: none; display: grid; place-items: center; box-sizing: border-box; width: 46px; height: 11px; margin-right: 3px; border-radius: 3px; font-size: 6.4px; font-weight: 500; line-height: 11px; color: #fff; }
`;

const PROMPT = 'a muse holding up a handwritten note, meme style';
const COUNT = 256 - PROMPT.length;                 // the counter is the characters left of 256 ('blooming tree' reads 243, 'dark' 252)
const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const GEN_AT = 0.2;                                // the cursor presses Swap
const ISSUE = 0.3;                                 // the photos drop to the scrim in one step; the mesh begins
const LAND = Array.from({ length: 10 }, (_, i) => 0.62 + i * 0.12);   // tile i's hard swap (reading order), the last at 1.70

const mixRGB = (a, b, k) => { const h = (v, i) => parseInt(v.slice(1 + 2 * i, 3 + 2 * i), 16); return `rgb(${[0, 1, 2].map((i) => Math.round(h(a, i) + (h(b, i) - h(a, i)) * k)).join(',')})`; };
const SWAP_STOPS = ['#2fa5e8', '#766ED9', '#7a40d6'], GREY = '#4C4F4E';

// the constellation: three drifting clusters of nodes, the pairs within reach joined by thin lines (the topology is fixed, the motion is t)
const CLUSTERS = [0, 1, 2].map((c) => {
  const nodes = Array.from({ length: 10 }, (_, i) => ({ ox: (hash(c * 31 + 1, i) - 0.5) * 120, oy: (hash(c * 31 + 2, i) - 0.5) * 70, ph: hash(c * 31 + 3, i) * 6.283, sp: 1.1 + hash(c * 31 + 4, i) * 1.3 }));
  const pairs = [];
  for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
    const d = Math.hypot(nodes[a].ox - nodes[b].ox, nodes[a].oy - nodes[b].oy);
    if (d < 58) pairs.push({ a, b, o: 0.2 + 0.4 * hash(c * 31 + 5, a * 10 + b) });
  }
  return { nodes, pairs, fx: 0.31 + 0.12 * c, fy: 0.23 + 0.09 * c, p0: hash(c + 7, 1) * 6.283, p1: hash(c + 7, 2) * 6.283 };
});

export default {
  id: 'luminar-neo-genswap',
  label: 'Luminar Neo GenSwap (2023)',
  source: {
    platform: 'Luminar Neo 1.16.0 (Skylum) desktop app, macOS, Edit mode with the Generative Tools > GenSwap tool active',
    feature: "dark editor window: top bar 'Cancel' / 'Save', a canvas of photos, a prompt bar and a GenSwap toolbar ('GenSwap', 'Select', 'Deselect', 'Reset Selection', the 'Swap' pill). Swap drops the photo in one step to about 27% luminance (a black scrim at about 0.73 alpha, held flat) under a pale animated constellation mesh while the bars stay lit and only the Swap pill desaturates (label unchanged); no status text, percentage, spinner, bar or timer; the result replaces the dim photo in a single frame (adapted to 10: a 5 x 2 block of ten photos dimmed together, landing one by one in reading order; the Skylum wordmark, pricing page, promo-code lower third, creator watermark and the Tim Harris TIP card are omitted)",
    refs: [
      { url: 'https://www.youtube.com/watch?v=8qgA_Cc8gUQ', videoId: '8qgA_Cc8gUQ', published: '2023-11-14', retrieved: '2026-10-15' },
      { url: 'https://www.youtube.com/watch?v=Ej-EuNRKtPw', videoId: 'Ej-EuNRKtPw', published: '2023-11-14', retrieved: '2026-10-15' },
    ],
    extrapolated: ['ten photos in a 5 x 2 block (the footage has one canvas photo)', 'tiles landing one by one in reading order, each in one hard step', 'the pale fog stand-in shown before Swap is pressed', 'the mesh and scrim shown per photo, landed photos sitting above the mesh', 'the prompt text'],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'luminar-neo-genswap');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform: ${restTransform(g)}; transform-origin: ${g.origin}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/><div class="${P}-sc" style="display: none"></div></div></div>`;
    const NS = 'http://www.w3.org/2000/svg';
    const glyph = `<svg viewBox="0 0 6 6"><rect x="0" y="0" width="2.7" height="2.7" fill="#4fc3f7"/><rect x="3.3" y="0" width="2.7" height="2.7" fill="#7aa7ff"/><rect x="0" y="3.3" width="2.7" height="2.7" fill="#7ad7c9"/><rect x="3.3" y="3.3" width="2.7" height="2.7" fill="#9a8cf5"/></svg>`;
    const undo = '<svg viewBox="0 0 12 12"><path d="M3 5h5a2.5 2.5 0 010 5H5M3 5l2-2M3 5l2 2"/></svg>';
    const redo = '<svg viewBox="0 0 12 12"><path d="M9 5H4a2.5 2.5 0 000 5h3M9 5L7 3M9 5L7 7"/></svg>';
    const info = '<svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.6"/><path d="M6 5.4v3M6 3.6v.1"/></svg>';
    const eye = '<svg viewBox="0 0 12 12"><path d="M0.8 6C2 3.7 3.9 2.6 6 2.6S10 3.7 11.2 6C10 8.3 8.1 9.4 6 9.4S2 8.3 0.8 6z" style="fill: none; stroke: #f0f0f0"/><circle cx="6" cy="6" r="1.7" style="fill: #f0f0f0; stroke: none"/></svg>';
    const root = x.el(`<div class="${P}"><div class="${P}-top"><i></i><i></i><i></i><div class="${P}-sp"></div><div class="${P}-btn ${P}-cancel">Cancel</div><div class="${P}-btn ${P}-save">Save</div></div><div class="${P}-cv"><div class="${P}-g">${tiles.map(cell).join('')}</div><svg class="${P}-mesh" viewBox="0 0 ${GW} ${GH}" width="${GW}" height="${GH}" style="display: none"></svg><svg class="${P}-cur" viewBox="0 0 9 12"><path d="M0.6 0.6V10l2.5-2.3 1.8 4 1.5-.7-1.8-3.9H8.4z" fill="#ffffff" stroke="#000000" stroke-width="0.7" stroke-linejoin="round"/></svg><div class="${P}-bars"><div class="${P}-pb"><span>${x.esc(PROMPT)}</span><b>&times;</b><em>${COUNT}</em><u></u></div><div class="${P}-tb"><div class="${P}-chip">${glyph}GenSwap</div><div class="${P}-ic ${P}-undo">${undo}</div><div class="${P}-ic ${P}-redo">${redo}</div><div class="${P}-ic">${info}</div><div class="${P}-eye">${eye}<em>38% &#8964;</em></div><div class="${P}-seg"><span>Select</span><span>Deselect</span></div><div class="${P}-sl"><i><b></b><s></s></i>44</div><div class="${P}-reset">Reset Selection</div><div class="${P}-swap">Swap</div></div></div></div></div>`);
    // the placeholder in the prompt bar is only ever replaced by the typed prompt, so no 'Add your prompt here' string is drawn (it would be hidden behind the prompt)
    const q = (c) => root.querySelector(`.${P}-${c}`);
    const grid = q('g'), mesh = q('mesh'), cur = q('cur'), swap = q('swap'), reset = q('reset'), undoEl = q('undo'), redoEl = q('redo'), save = q('save');
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ tile: n, im: n.querySelector('img'), sc: n.querySelector(`.${P}-sc`) }));
    ctx.gate(cells.map((c) => c.im));

    // the mesh pool: one line per pair, one dot per node
    const svgNode = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
    const pool = CLUSTERS.map((cl) => ({ cl, lines: cl.pairs.map((p) => { const e = svgNode('line', { 'stroke-opacity': p.o.toFixed(2) }); mesh.appendChild(e); return e; }), dots: cl.nodes.map(() => { const e = svgNode('circle', { r: '0.8' }); mesh.appendChild(e); return e; }) }));

    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const pending = s >= ISSUE && s < LAND[9];     // the scrim and the mesh live from the drop until the last landing

        // the cursor glides to Swap and presses it (it stays there)
        const cp = seg(s, -0.5, GEN_AT - 0.04);
        put('cur', cp.toFixed(3), () => { cur.style.transform = `translate(${(462 - (1 - cp) * 40).toFixed(1)}px, ${((ROOT_H - 36) - (1 - cp) * 26).toFixed(1)}px)`; });

        // Swap desaturates in place (its label never changes) and Reset Selection, undo and redo grey with it; all come back at the landing
        const dk = s < LAND[9] ? seg(s, GEN_AT, ISSUE + 0.02) : 0;
        put('sw', dk.toFixed(3), () => {
          swap.style.background = `linear-gradient(90deg, ${SWAP_STOPS.map((c, i) => `${mixRGB(c, GREY, dk)}${i === 1 ? ' 55%' : ''}`).join(', ')})`;
          swap.style.color = mixRGB('#ffffff', '#7b807f', dk);
          reset.style.color = mixRGB('#f0f0f0', '#6c6c6c', dk); reset.style.background = mixRGB('#4a4a4a', '#3e3e3e', dk);
          undoEl.style.color = mixRGB('#cfcfcf', '#5c5c5c', dk); redoEl.style.color = mixRGB('#6d6d6d', '#5c5c5c', dk);
        });
        put('press', press(s, GEN_AT, 0.06, 0.06, 0.14).toFixed(3), (v) => { const p = parseFloat(v); swap.style.transform = p > 0 ? `scale(${(1 - 0.05 * p).toFixed(4)})` : 'none'; });
        // Save lights with an outline once the work starts
        put('save', s >= ISSUE, (v) => { save.style.color = v ? '#f2f2f2' : '#5f5f5f'; save.style.background = v ? '#2c2c2c' : '#2c2c2c'; save.style.boxShadow = v ? 'inset 0 0 0 1px #4a67c8' : 'inset 0 0 0 1px #2c2c2c'; });

        // the photos: pale stand-in, then the scrim in one step, then each result in one step
        cells.forEach((c, i) => {
          const landed = s >= LAND[i];
          put(`i${i}`, landed, (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.tile.style.zIndex = v ? '3' : ''; });
          put(`c${i}`, !landed && s >= ISSUE, (v) => { c.sc.style.display = v ? '' : 'none'; });
        });

        // the constellation, from t alone
        put('mesh', pending, (v) => { mesh.style.display = v ? '' : 'none'; });
        // the mesh is a function of t clamped to the pending window, so it is frozen outside it (and identical however the time was reached)
        const tm = Math.min(Math.max(t, ctx.cardIn + ISSUE * k), ctx.cardIn + LAND[9] * k), tq = Math.round(tm * 60) / 60;
        pool.forEach(({ cl, lines, dots }, ci) => {
          const cx = GW * (0.5 + 0.34 * Math.sin(tq * cl.fx * 2 + cl.p0)), cy = GH * (0.5 + 0.28 * Math.sin(tq * cl.fy * 2 + cl.p1));
          const pts = cl.nodes.map((n) => [cx + n.ox + 7 * Math.sin(tq * n.sp + n.ph), cy + n.oy + 5 * Math.cos(tq * n.sp * 0.8 + n.ph)]);
          put(`m${ci}`, tq, () => {
            cl.pairs.forEach((p, j) => { const e = lines[j], a = pts[p.a], b = pts[p.b]; e.setAttribute('x1', a[0].toFixed(1)); e.setAttribute('y1', a[1].toFixed(1)); e.setAttribute('x2', b[0].toFixed(1)); e.setAttribute('y2', b[1].toFixed(1)); });
            pts.forEach((a, j) => { dots[j].setAttribute('cx', a[0].toFixed(1)); dots[j].setAttribute('cy', a[1].toFixed(1)); });
          });
        });
      },
    };
  },
};
