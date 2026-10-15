// QuickQR Art, the AI QR-art generator at quickqr.art/app/generate, as it waits on a run (YouTube IZ2y2zZ_wH4, 2023-09-27, 'QR Codes
// WIth Art - Amazing & Free - Step by Step AI Tutorial', t~20-37 s; spec .tmp/clone-9e82faf1/reveal-refs/quickqr-art/spec.json,
// confidence 0.55; frames ax_t20/22/26/30/34.png and ax_pending_canvas.png). A white two-column app: a slim icon rail, a control panel
// ('QR Code Content' with a Link field and the short-link toggle, a prompt box, 'Aspect Ratio' chips, the QR Ratio / QR Weight sliders,
// 'QR Pattern' and 'Position', then a lavender pill 'Generate') and, to its right, the result canvas. Pressing the pill gives the canvas
// a GHOST QR MATRIX, the link's own QR drawn as faint grey modules on a near-white tile (a content-shaped skeleton, not a flat block),
// with a purple-to-magenta ring spinner at its centre, an unlabelled decimal readout under the ring that climbs (13,6 .. 30,2, comma
// decimal) and, under the canvas, the grey line 'The system is processing, please wait a moment'. The pill never relabels: it stays
// 'Generate' (a small spinner turns in it while the run lasts). The caption clears a few seconds before the art arrives; the ghost, ring and
// readout stay until the finished QR art takes the tile in one hard swap (no fade could be seen at 30 fps).
// Adapted to ten images: ten square ghost tiles in a 4 + 4 + 2 block, the caption under the block, then the pictures landing in
// reading order. EXTRAPOLATED from the one-tile footage: the ten tiles and their landing order and instants (press ~0.06, ghosts at
// 0.14, caption clear at 0.37, tiles 0.40 .. 1.68 in layout seconds against the footage's press ~t=21.5, caption clear ~t=31, art ~t=37),
// one shared readout counting 13,6 -> 30,2 over the pending run (the footage's one readout rose ~2 per second over 8 s; its meaning, a percent
// or a timer, is unconfirmed) frozen at the last landing, and the ghost modules (a plausible, deterministic 25 x 25 grid with three finder
// squares, a timing line and an alignment mark; it encodes nothing). Omitted: the wordmark and every logo, the Product Hunt badge, the
// Tools menu, the credits chip, the account avatar, the Fusion Art strip, the tutorial's pink annotations, and every number but the readout.
// Decoy: EUvCOLMIEks (2026-08-14) is the Hugging Face Space huggingface-projects/QR-code-AI-art-generator, NOT quickqr.art, and is not drawn.
import { seg, press } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, hash, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-qqr';
const ROOT_H = 344, RAIL_W = 26, PANEL_W = 154, COLS = 4, GAP = 5;
const CSS = `
.${P} { box-sizing: border-box; display: flex; width: 560px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #fff; color: #23232b; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #e6e6ea; }
.${P}-rail { flex: none; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: 11px; width: ${RAIL_W}px; padding: 12px 0; border-right: 1px solid #f0f0f3; }
.${P}-rail i { display: block; width: 12px; height: 12px; border-radius: 4px; box-shadow: inset 0 0 0 1.4px #6c6c78; }
.${P}-rail i:nth-child(2) { border-radius: 50%; }
.${P}-rail i:nth-child(4) { border-radius: 2px 6px 2px 6px; }
.${P}-rail i:nth-child(5) { height: 6px; margin: 3px 0; border-radius: 3px; }
.${P}-rail i:nth-child(6) { border-radius: 2px; box-shadow: inset 0 0 0 1.4px #6c6c78, inset 0 3.5px 0 0 #fff, inset 0 4.6px 0 0 #6c6c78; }
.${P}-rail .${P}-on { background: #3b4bf0; box-shadow: none; border-radius: 3px; }
.${P}-panel { flex: none; box-sizing: border-box; display: flex; flex-direction: column; width: ${PANEL_W}px; padding: 10px 9px 8px 9px; }
.${P}-hd { display: flex; align-items: center; justify-content: space-between; height: 11px; font-size: 7px; font-weight: 600; color: #23232b; white-space: nowrap; }
.${P}-hd small { font-size: 5.5px; font-weight: 400; color: #8d8d99; }
.${P}-sw { display: block; width: 14px; height: 7px; border-radius: 4px; background: #e4e4ea; }
.${P}-sw.${P}-on { background: #2f3ff0; box-shadow: inset -5.5px 0 0 -0.5px #fff; }
.${P}-fld { display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; height: 17px; margin-top: 4px; padding: 0 6px; border-radius: 4px; box-shadow: inset 0 0 0 1px #dcdce3; font-size: 6.5px; color: #3a3a44; white-space: nowrap; overflow: hidden; }
.${P}-fld svg { flex: none; width: 5px; height: 7px; fill: none; stroke: #8d8d99; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-short { display: flex; align-items: center; justify-content: space-between; margin-top: 5px; height: 9px; font-size: 5.8px; color: #6f6f7c; white-space: nowrap; }
.${P}-pr { display: flex; align-items: center; justify-content: space-between; margin-top: 7px; height: 11px; font-size: 7px; font-weight: 600; white-space: nowrap; }
.${P}-pr b { box-sizing: border-box; height: 11px; padding: 0 5px; border-radius: 6px; background: #eef0ff; font-size: 6px; line-height: 11px; font-weight: 600; color: #3b4bf0; }
.${P}-ta { box-sizing: border-box; height: 32px; margin-top: 4px; padding: 5px 6px; border-radius: 4px; box-shadow: inset 0 0 0 1px #dcdce3; font-size: 6.5px; color: #3a3a44; }
.${P}-lab { height: 9px; margin-top: 8px; font-size: 6.2px; line-height: 9px; color: #5b5b68; }
.${P}-ar { display: flex; gap: 3px; margin-top: 3px; }
.${P}-ar span { flex: 1; display: grid; place-items: center; box-sizing: border-box; height: 20px; border-radius: 4px; background: #f1f1f5; }
.${P}-ar span i { display: block; background: #7b7b88; border-radius: 1.5px; }
.${P}-ar .${P}-on { background: #2f3ff0; }
.${P}-ar .${P}-on i { background: #fff; }
.${P}-sl { display: flex; align-items: center; justify-content: space-between; height: 10px; margin-top: 7px; font-size: 6.2px; color: #5b5b68; white-space: nowrap; }
.${P}-trk { position: relative; flex: none; width: 74px; height: 2.5px; border-radius: 2px; background: #e4e4ea; }
.${P}-trk i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 2px; background: #2f3ff0; }
.${P}-pat { display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; height: 24px; margin-top: 7px; padding: 0 4px 0 6px; border-radius: 4px; box-shadow: inset 0 0 0 1px #ececf1; font-size: 6.2px; color: #3a3a44; white-space: nowrap; }
.${P}-pat svg.${P}-mini { flex: none; display: block; width: 15px; height: 15px; }
.${P}-pos { display: grid; grid-template-columns: repeat(3, 4px); gap: 2px; }
.${P}-pos i { display: block; width: 4px; height: 4px; border-radius: 50%; background: #dcdcf2; }
.${P}-pos i.${P}-on { background: #2f3ff0; }
.${P}-adv { display: flex; align-items: center; gap: 4px; height: 10px; margin-top: 7px; font-size: 6.2px; color: #5b5b68; }
.${P}-adv i { display: block; width: 7px; height: 7px; border-radius: 50%; background: #e4e4ea; }
.${P}-go { position: relative; margin-top: auto; flex: none; display: flex; align-items: center; justify-content: center; gap: 5px; height: 22px; border-radius: 11px; background: #8c92f7; font-size: 8px; font-weight: 500; color: #fff; }
.${P}-wheel { display: none; width: 8px; height: 8px; border-radius: 50%; background: conic-gradient(from 0deg, rgba(255, 255, 255, 0) 0deg, rgba(255, 255, 255, .9) 300deg, rgba(255, 255, 255, 0) 360deg); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.6px), #000 calc(100% - 1.2px)); mask: radial-gradient(farthest-side, transparent calc(100% - 1.6px), #000 calc(100% - 1.2px)); }
.${P}-pub { flex: none; height: 9px; margin-top: 4px; font-size: 5.8px; line-height: 9px; text-align: center; color: #7d7d89; }
.${P}-cv { position: relative; flex: 1; min-width: 0; box-sizing: border-box; padding: 10px 8px 0 8px; background: #fff; }
.${P}-g { display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; }
.${P}-t { position: relative; aspect-ratio: 1; border-radius: 6px; overflow: hidden; background: #f7f7f7; box-shadow: inset 0 0 0 1px #e8e8e8; }
.${P}-t img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-pend { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; background: #f7f7f7; box-shadow: inset 0 0 0 1px #e8e8e8; }
.${P}-qr { position: absolute; left: 4%; top: 4%; width: 92%; height: 92%; display: block; }
.${P}-ring { position: relative; display: block; flex: none; width: 24px; height: 24px; border-radius: 50%; background: conic-gradient(from 0deg, rgba(123, 47, 247, 0) 0deg, #7b2ff7 40deg, #a238d9 150deg, #e0419a 300deg, rgba(224, 65, 154, 0) 300deg); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3.5px)); mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3.5px)); }
.${P}-num { position: relative; display: block; flex: none; font-size: 8px; font-weight: 500; line-height: 9px; font-variant-numeric: tabular-nums; color: #23232b; }
.${P}-cap { height: 11px; margin-top: 8px; font-size: 7.5px; line-height: 11px; text-align: center; color: #5a5a64; white-space: nowrap; }
`;

const LINK = 'https://example.com/muse';
const PROMPT = 'robot';
const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const GEN_AT = 0.06;                               // the cursor presses 'Generate' (footage ~t=21.5 s)
const ISSUE = 0.14;                                // the empty canvas gives way to the ghost tiles (footage t=22 s)
const CAP_OFF = 0.37;                              // the caption clears; ghosts, rings and readout stay (footage ~t=31 s of 22..37)
const LAND = Array.from({ length: 10 }, (_, i) => 0.4 + i * 0.1425);   // tile i hands its ghost over to the picture (reading order), the last at 1.68
const N0 = 136, N1 = 302;                          // the readout in tenths: 13,6 .. 30,2 (the footage's samples all end in an even tenth)

// a plausible QR-like 25 x 25 module grid (three finder squares with their separators, a timing line, an alignment mark, hashed data
// elsewhere), as ONE svg path of horizontal runs. Deterministic in the seed; it encodes nothing.
const SIZE = 25;
const qrPath = (seed) => {
  const fin = (x, y) => {   // the finder squares sit top-left, top-right and bottom-left; [distance from its centre] or null
    for (const [cx, cy] of [[3, 3], [SIZE - 4, 3], [3, SIZE - 4]]) if (Math.abs(x - cx) < 5 && Math.abs(y - cy) < 5) return Math.max(Math.abs(x - cx), Math.abs(y - cy));
    return null;
  };
  const dark = (x, y) => {
    const m = fin(x, y);
    if (m !== null) return m < 4 && m !== 2;   // ring, gap, 3 x 3 core; the fourth ring out is the light separator
    if (y === 6 && x > 7 && x < SIZE - 8) return x % 2 === 0;
    if (x === 6 && y > 7 && y < SIZE - 8) return y % 2 === 0;
    const ax = Math.abs(x - 18), ay = Math.abs(y - 18);
    if (ax < 3 && ay < 3) { const m = Math.max(ax, ay); return m !== 1; }
    return hash(seed, y * SIZE + x) < 0.5;
  };
  let d = '';
  for (let y = 0; y < SIZE; y++) {
    let run = 0;
    for (let x = 0; x <= SIZE; x++) {
      if (x < SIZE && dark(x, y)) { run++; continue; }
      if (run) { d += `M${x - run} ${y}h${run}v1h-${run}z`; run = 0; }
    }
  }
  return d;
};
const ghost = (seed) => `<svg class="${P}-qr" viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges" aria-hidden="true"><path fill="#ededed" d="${qrPath(seed)}"/></svg>`;
const fmt = (n) => `${Math.floor(n / 10)},${n % 10}`;

export default {
  id: 'quickqr-art',
  label: 'QuickQR Art (2023)',
  source: {
    platform: 'QuickQR Art web app, quickqr.art/app/generate (AI QR-art generator; a narrated 1280x720 tutorial screen recording, YouTube IZ2y2zZ_wH4, 2023-09-27)',
    feature: "white two-column app: icon rail, control panel (Link field, prompt, aspect chips, sliders, QR Pattern / Position, a lavender 'Generate' pill that never relabels) and a result canvas whose tile holds a ghost QR matrix (faint grey modules on near-white) with a purple-to-magenta ring spinner, an unlabelled incrementing readout (13,6 .. 30,2) and the grey caption 'The system is processing, please wait a moment' under it; the caption clears first, then the art lands (adapted to 10: a 4 + 4 + 2 block of ghost tiles landing in reading order; the ten tiles, the landing order and instants, the shared readout and the module grid are EXTRAPOLATED from the one-tile footage; the wordmark and logos, Product Hunt badge, credits chip, account avatar, Fusion Art strip, tutorial annotations and every number but the readout are omitted)",
    refs: [{ url: 'https://www.youtube.com/watch?v=IZ2y2zZ_wH4', retrieved: '2026-10-14', published: '2023-09-27' }],
    videos: ['IZ2y2zZ_wH4 (2023-09-27, source: quickqr.art/app/generate, pending t=22-34 s)', 'OMj_iMnkIw0 (2023-06-13, first-party promo, provenance only: no wait state in it)', 'EUvCOLMIEks (2026-08-14, DECOY: the Hugging Face Space huggingface-projects/QR-code-AI-art-generator, not quickqr.art)'],
    extrapolated: ['ten tiles in a 4 + 4 + 2 block instead of one tile', 'strict reading-order landing and its instants (0.40 .. 1.68 layout seconds)', 'caption clear at 0.37 layout seconds (footage: ~t=31 of 22..37)', 'one shared readout 13,6 -> 30,2 stretched over the pending run and frozen at the last landing', 'the ghost module grid (deterministic, encodes nothing)', 'the hard swap of ghost for picture (no fade resolvable at 30 fps)'],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'quickqr-art');
    const cell = (g, i) => `<div class="${P}-t"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; transform-origin: ${g.origin}"/><div class="${P}-pend">${ghost(i + 3)}<i class="${P}-ring"></i><b class="${P}-num">${fmt(N0)}</b></div></div>`;
    const chev = '<svg viewBox="0 0 6 8"><path d="M1 3l2-2 2 2M1 5l2 2 2-2"/></svg>';
    const ar = [[5, 9], [9, 9], [11, 6], [7, 9], [9, 7]].map(([w, h], i) => `<span${i === 1 ? ` class="${P}-on"` : ''}><i style="width: ${w}px; height: ${h}px"></i></span>`).join('');
    const pos = Array.from({ length: 9 }, (_, i) => `<i${i === 4 ? ` class="${P}-on"` : ''}></i>`).join('');
    const root = x.el(`<div class="${P}"><div class="${P}-rail"><i></i><i></i><i class="${P}-on"></i><i></i><i></i><i></i></div><div class="${P}-panel"><div class="${P}-hd">QR Code Content<small>Upload classic QR code</small></div><div class="${P}-fld"><span>Link</span>${chev}</div><div class="${P}-fld">${x.esc(LINK)}</div><div class="${P}-short"><span>Use short link for getting better QR Art</span><i class="${P}-sw ${P}-on"></i></div><div class="${P}-pr">Enter prompt<b>Inspire</b></div><div class="${P}-ta">${x.esc(PROMPT)}</div><div class="${P}-lab">Aspect Ratio</div><div class="${P}-ar">${ar}</div><div class="${P}-sl">QR Ratio<div class="${P}-trk"><i style="width: 100%"></i></div></div><div class="${P}-pat"><span>QR Pattern</span><svg class="${P}-mini" viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges"><path fill="#2a2a33" d="${qrPath(1)}"/></svg><span>Position</span><div class="${P}-pos">${pos}</div></div><div class="${P}-sl">QR Weight<div class="${P}-trk"><i style="width: 52%"></i></div></div><div class="${P}-adv"><i></i>Advanced</div><div class="${P}-go"><i class="${P}-wheel"></i><span>Generate</span></div><div class="${P}-pub">Your generation will be public</div></div><div class="${P}-cv"><div class="${P}-g" style="visibility: hidden">${tiles.map(cell).join('')}</div><div class="${P}-cap" style="visibility: hidden">The system is processing, please wait a moment</div></div></div>`);
    const go = root.querySelector(`.${P}-go`), wheel = root.querySelector(`.${P}-wheel`), grid = root.querySelector(`.${P}-g`), cap = root.querySelector(`.${P}-cap`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => ({ im: n.querySelector('img'), pend: n.querySelector(`.${P}-pend`), ring: n.querySelector(`.${P}-ring`), num: n.querySelector(`.${P}-num`), g: tiles[i] }));
    ctx.gate(cells.map((c) => c.im));
    cells.forEach((c) => { c.im.style.filter = restFilter(c.g); c.im.style.transform = restTransform(c.g); });

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const sp = Math.min(s, LAND[9]);               // the run's clock: ring and readout freeze at the last landing

        // 'Generate' is pressed (it never changes label); a small wheel turns in it for as long as the run lasts
        const gp = press(s, GEN_AT, 0.06, 0.06, 0.14);
        put('go', gp.toFixed(3), () => { go.style.transform = gp > 0 ? `scale(${(1 - 0.05 * gp).toFixed(4)})` : 'none'; });
        const running = s >= ISSUE && s < LAND[9];
        put('run', running, (v) => { wheel.style.display = v ? 'block' : 'none'; });
        const wdeg = (((sp * 560) % 360) + 360) % 360;
        put('wh', wdeg.toFixed(0), (d) => { wheel.style.transform = `rotate(${d}deg)`; });

        // the empty canvas gives way to the ghost tiles; the caption clears before the art arrives
        const on = s >= ISSUE;
        put('iss', on, (v) => { grid.style.visibility = v ? '' : 'hidden'; });
        put('cap', on && s < CAP_OFF, (v) => { cap.style.visibility = v ? '' : 'hidden'; });

        // the shared readout climbs 13,6 -> 30,2 over the run (even tenths, as in the footage)
        const n = Math.round(N0 / 2 + (N1 / 2 - N0 / 2) * seg(sp, ISSUE, LAND[9])) * 2;
        const txt = fmt(n);

        cells.forEach((c, i) => {
          const a = LAND[i];
          put(`i${i}`, s >= a, (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.pend.style.display = v ? 'none' : ''; });
          // the ring turns with t (its phase differs per tile); a function of the run's clock alone
          const deg = (((sp * 520 + i * 47) % 360) + 360) % 360;
          put(`r${i}`, deg.toFixed(0), (d) => { c.ring.style.transform = `rotate(${d}deg)`; });
          put(`n${i}`, txt, (v) => { c.num.textContent = v; });
        });
      },
    };
  },
};
