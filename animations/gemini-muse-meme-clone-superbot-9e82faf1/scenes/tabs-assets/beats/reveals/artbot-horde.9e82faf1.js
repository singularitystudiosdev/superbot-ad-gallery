// ArtBot, the AI Horde web UI (artbot.site/create, ArtBot v2 build v.20250704_22.49.54), 'Pending images' card, first-hand headless-Chrome capture
// 1280x800 on 2026-10-15 (spec .tmp/clone-9e82faf1/reveal-refs/artbot-horde/spec.json, confidence 0.72; frames be_art_idle.png,
// be_art_pressed.png, be_art_wait_1s/11s/34s/52s/77s/118s.png). A light two-column Create screen: on the left a blue Prompt panel (the
// prompt text, 'Prompts' / 'Tags' pills, a red 'Clear'), the '(66 chars)' counter, a button row ('Reset?', a teal 'Create', a small icon
// button) and grey settings panels (image model, sampler, aspect, image count); on the right a white 'Pending images' card with its
// stat row, the line 'Filter: all (N image requests)' and the job tiles. Before the press the card reads 'No pending images. Create
// something new!'. Pressing 'Create' lightens the button (#6AB7C6 -> #8AC5D1, the label never changes) and a spinner button appears
// beside it; the tile appears at once as an opaque #202020 square ruled with a fine grid, carrying 'Waiting to request image...'
// over a small image glyph, then a #19897D particle swarm clustered at its centre with two live white bold monospace lines at the
// bottom left, 'Queued... (Position #N)' and 'P% / (Ss remaining)', and a #14B8A6 bar along the bottom edge that grows with the
// percentage. The footage's wait ran 118 s without ever leaving the queue (Position #290 -> #275, 1.04% -> 5.21%, '1536s remaining'
// -> '1456s remaining').
// Adapted to ten images: ten tiles in a 4 + 4 + 2 block, each counting its own position down to #1, then reading 'Processing...' with
// the bar near full, then handing over to the picture, in strict reading order. Every counter, particle, spinner and bar is computed
// from t and is frozen at the last landing. Omitted: the ArtBot mascot, wordmark and top navigation, the '(33 kudos)' line and every
// other kudos or account figure, the 'Image successfully requested!' toast, the tile's own filter / sort controls. The footage's
// pictures are never reproduced: every tile is our own meme.
import { seg, press } from '../../../../lib.9b47fc30.js';
import { injectStyle, restTransform, restFilter, ownSrc, hash, UI_FONT, MONO_FONT } from './util.9e82faf1.js';

const P = 'rv-abh';
const ROOT_H = 372, LEFT_W = 156, COLS = 4, GAP = 4, NDOT = 16;
const CSS = `
.${P} { box-sizing: border-box; display: flex; width: 560px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: #f2f2f2; color: #1b1b1b; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px #d6d6d6; }
.${P}-l { flex: none; box-sizing: border-box; display: flex; flex-direction: column; gap: 5px; width: ${LEFT_W}px; padding: 9px 4px 9px 9px; }
.${P}-h { flex: none; height: 16px; font-size: 14px; line-height: 16px; font-weight: 700; color: #14b8a6; }
.${P}-pm { flex: none; box-sizing: border-box; padding: 5px; border-radius: 3px; background: #1d4d74; color: #fff; }
.${P}-pt { height: 9px; font-size: 6.5px; line-height: 9px; font-weight: 700; }
.${P}-ta { box-sizing: border-box; height: 32px; margin-top: 3px; padding: 3px 4px; border-radius: 3px; background: #f9fafb; font-size: 5.8px; line-height: 8px; color: #1b1b1b; overflow: hidden; }
.${P}-pl { display: flex; align-items: center; gap: 3px; margin-top: 4px; }
.${P}-pl span { box-sizing: border-box; height: 11px; padding: 0 4px; border-radius: 3px; background: #6ab7c6; font-size: 5.5px; line-height: 11px; color: #fff; }
.${P}-pl .${P}-clr { margin-left: auto; background: #f65f5f; font-weight: 700; }
.${P}-np { margin-top: 5px; height: 8px; font-size: 5.8px; line-height: 8px; font-weight: 700; white-space: nowrap; }
.${P}-np small { font-size: 4.8px; font-weight: 400; }
.${P}-ct { flex: none; display: flex; align-items: center; gap: 3px; }
.${P}-cn { flex: none; width: 33px; font-family: ${MONO_FONT}; font-size: 4.8px; line-height: 7px; color: #222; white-space: nowrap; }
.${P}-bt { box-sizing: border-box; display: flex; align-items: center; justify-content: center; height: 14px; border-radius: 3px; font-size: 5.6px; font-weight: 700; color: #fff; white-space: nowrap; }
.${P}-rs { background: #f65f5f; width: 31px; }
.${P}-cr { background: #6ab7c6; width: 32px; font-weight: 500; }
.${P}-ic { background: #6ab7c6; width: 13px; }
.${P}-sp { display: none; background: #6ab7c6; width: 13px; }
.${P}-bt svg { display: block; width: 8px; height: 8px; fill: none; stroke: #fff; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-sp svg { stroke-width: 1.6; }
.${P}-gp { flex: none; display: flex; flex-direction: column; justify-content: center; gap: 5px; box-sizing: border-box; padding: 4px 6px 4px 7px; border-radius: 3px; background: #a0a0a8; box-shadow: inset 3px 0 0 #6b6b73; color: #fff; }
.${P}-gp div { display: flex; flex-direction: column; align-items: stretch; gap: 2px; font-size: 5.8px; font-weight: 700; white-space: nowrap; }
.${P}-gp div span { box-sizing: border-box; height: 11px; padding: 0 4px; border-radius: 3px; background: #f9fafb; font-size: 5.4px; font-weight: 400; line-height: 11px; color: #1b1b1b; overflow: hidden; }
.${P}-c { position: relative; flex: 1; min-width: 0; box-sizing: border-box; margin: 9px 9px 9px 2px; padding: 6px; border-radius: 4px; background: #f2f2f2; box-shadow: 0 0 0 1px #b8a0aa; display: flex; flex-direction: column; }
.${P}-ch { flex: none; display: flex; align-items: center; gap: 4px; height: 12px; font-size: 7.5px; font-weight: 700; color: #111; }
.${P}-ch svg { width: 9px; height: 9px; fill: none; stroke: #111; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-st { flex: none; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; height: 15px; margin-top: 4px; padding: 0 8px; border-radius: 2px; box-shadow: inset 0 0 0 1px #3a3a3a; font-family: ${MONO_FONT}; font-size: 5.4px; color: #111; }
.${P}-st span { display: flex; align-items: center; gap: 2px; }
.${P}-st svg { width: 6px; height: 6px; fill: none; stroke: #111; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-fl { flex: none; height: 10px; margin-top: 4px; font-family: ${MONO_FONT}; font-size: 5.4px; line-height: 10px; color: #111; white-space: nowrap; }
.${P}-body { position: relative; flex: 1; min-height: 0; }
.${P}-es { position: absolute; left: 0; right: 0; top: 50%; text-align: center; transform: translateY(-50%); font-size: 7px; color: #9d9ea8; }
.${P}-g { position: absolute; left: 0; right: 0; top: 2px; display: grid; grid-template-columns: repeat(${COLS}, minmax(0, 1fr)); gap: ${GAP}px; }
.${P}-t { position: relative; aspect-ratio: 1; border-radius: 2px; overflow: hidden; background: #202020; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #202020; }
.${P}-pd { position: absolute; left: 0; right: 0; top: 0; bottom: 0; overflow: hidden; background-color: #202020; background-image: radial-gradient(circle at 50% 46%, rgba(0, 0, 0, 0) 38%, rgba(0, 0, 0, .34) 100%), linear-gradient(rgba(255, 255, 255, .05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, .05) 1px, transparent 1px); background-size: 100% 100%, 3px 3px, 3px 3px; }
.${P}-pc { position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 2px; height: 10px; padding: 0 3px; background: rgba(0, 0, 0, .62); font-family: ${MONO_FONT}; font-size: 4.8px; color: #fff; }
.${P}-pc svg { width: 5px; height: 5px; fill: none; stroke: #fff; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-x { position: absolute; right: 3px; top: 3px; width: 6px; height: 6px; fill: none; stroke: #fff; stroke-width: 1.5; stroke-linecap: round; }
.${P}-sw { position: absolute; left: 50%; top: 46%; width: 0; height: 0; }
.${P}-d { position: absolute; left: 0; top: 0; border-radius: 50%; background: #19897d; }
.${P}-ig { position: absolute; left: 50%; top: 46%; width: 14px; height: 14px; margin: -7px 0 0 -7px; fill: none; stroke: #fff; stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.${P}-tx { position: absolute; left: 5px; right: 2px; bottom: 6px; font-family: ${MONO_FONT}; font-size: 5.1px; line-height: 7px; font-weight: 700; color: #fff; white-space: nowrap; }
.${P}-tx span { display: block; height: 7px; }
.${P}-br { position: absolute; left: 0; bottom: 0; height: 2px; width: 0; background: #14b8a6; }
.${P}-s1 .${P}-cr { background: #8ac5d1; }
.${P}-s1 .${P}-sp { display: flex; }
`;

const PROMPT = 'a muse holding up a handwritten note in a lecture hall, meme style';
const REF = 1.84;                                 // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const GEN_AT = 0.06;                              // the cursor presses 'Create'
const ISSUE = 0.14;                               // the empty card gives way to the ten tiles, 'Waiting to request image...'
const QS = 0.30;                                  // the queue lines appear
const Q = Array.from({ length: 10 }, (_, i) => 0.80 + i * 0.07);            // tile i reaches Position #1 and starts processing (strict reading order)
const LAND = Q.map((q) => q + 0.25);                                          // tile i hands over to its picture, the last at 1.68
const POS0 = (i) => 290 + 2 * i;                  // a later request sits a little further back
const PCT_Q = 72;                                 // percent when a tile leaves the queue
const ETA0 = 1536, ETA_Q = 24;                    // the footage's first ETA; a receding estimate, not a 1:1 countdown

// an unfinished tile's live numbers, from the tile's own clock alone
function live(s, i) {
  const te = Math.min(s, LAND[i]);
  if (te < QS) return { state: 'wait', l1: 'Waiting to request image...', l2: '', bar: 0 };
  if (te < Q[i]) {
    const f = seg(te, QS, Q[i] - 0.04), pos = Math.max(1, Math.round(1 + (POS0(i) - 1) * Math.pow(1 - f, 1.6)));
    const pct = 1.04 + (PCT_Q - 1.04) * Math.pow(f, 1.35), eta = Math.round(ETA_Q + (ETA0 - ETA_Q) * Math.pow(1 - f, 1.25));
    return { state: 'queued', l1: `Queued... (Position #${pos})`, l2: `${+pct.toFixed(2)}% / (${eta}s remaining)`, bar: pct };
  }
  const f = seg(te, Q[i], LAND[i]), pct = PCT_Q + (99 - PCT_Q) * f, eta = Math.max(1, Math.round(ETA_Q - (ETA_Q - 1) * f));
  return { state: 'proc', l1: 'Processing...', l2: `${+pct.toFixed(2)}% / (${eta}s remaining)`, bar: pct };
}

const CLOCK = '<svg viewBox="0 0 12 12"><path d="M1.5 3.5v5.5h9v-5.5zM1.5 7.2l2.6-2.2 2.2 1.9 1.4-1.1 2.8 2.4"/></svg>';
const X = `<svg class="${P}-x" viewBox="0 0 6 6"><path d="M.6 .6l4.8 4.8M5.4 .6L.6 5.4"/></svg>`;
const IMG_BIG = `<svg class="${P}-ig" viewBox="0 0 24 24"><path d="M3 5.5h14.5v13H3zM3 15.2l4.4-4.4 3.8 3.8 2.4-2.4 3.9 3.9M14.6 8.5a1.4 1.4 0 1 0 .01 0"/><path d="M19.5 12v8M17 14.6l2.5-2.6 2.5 2.6"/></svg>`;
const ICON_PLUS = '<svg viewBox="0 0 12 12"><path d="M2 2h8v8H2zM6 4v4M4 6h4"/></svg>';
const ICON_SCR = '<svg viewBox="0 0 12 12"><path d="M1.5 2.5h4v7h-4zM7 4h3.5v4H7"/></svg>';
const RING = '<svg viewBox="0 0 12 12"><path d="M6 1.6a4.4 4.4 0 1 1-4.1 2.8"/></svg>';
const BIN = '<svg viewBox="0 0 12 12"><path d="M2.5 3.5h7M4.5 3.5V2h3v1.5M3.5 3.5l.4 6.5h4.2l.4-6.5"/></svg>';
const TICK = '<svg viewBox="0 0 12 12"><path d="M2.5 6.5l2.5 2.5 4.5-5"/></svg>';
const UP = '<svg viewBox="0 0 12 12"><path d="M6 9V2.5M3.2 5L6 2.2 8.8 5M2 10h8"/></svg>';
const WARN = '<svg viewBox="0 0 12 12"><path d="M6 1.8l4.6 8H1.4zM6 5v2.4M6 8.6v.2"/></svg>';
const GRID4 = '<svg viewBox="0 0 12 12"><path d="M2 2h3v3H2zM7 2h3v3H7zM2 7h3v3H2zM7 7h3v3H7z"/></svg>';
const STAT = (n, sv) => `<span>${sv}<b style="font-weight: 400">${n}</b></span>`;

export default {
  id: 'artbot-horde',
  label: 'ArtBot / AI Horde (2026)',
  source: {
    platform: "ArtBot v2 (AI Horde web UI), artbot.site/create, desktop Chrome 1280x800, light theme; first-hand headless-Chrome capture, 384 frames at ~310 ms plus DOM dumps, 2026-10-15 (build v.20250704_22.49.54; no account, no login)",
    feature: "left form: blue Prompt panel, a teal 'Create' button (label never changes: it lightens from #6AB7C6 to #8AC5D1 and a separate spinner button appears beside it) and grey settings panels; right 'Pending images' card whose tile is an opaque #202020 square ruled with a fine grid, a #19897D particle swarm clustered at its centre, two live white bold monospace lines at the bottom left ('Queued... (Position #N)' / 'P% / (Ss remaining)') and a #14B8A6 bar along its bottom edge (adapted to 10: a 4 + 4 + 2 block, each tile counting its position down and handing over to its picture in reading order; the mascot and top navigation, the kudos line and the request toast are omitted)",
    capture: { url: 'https://artbot.site/create', date: '2026-10-15', timestamps: 'press t=0; first queue line t=5.5 s (Position #288, 1% / 1536s remaining); t=118.3 s Position #275, 5.21% / 1456s remaining, still queued' },
    refs: [{ url: 'https://artbot.site/create', published: '2026-10-15', retrieved: '2026-10-15', note: 'first-hand capture, 118 s of the wait, spec .tmp/clone-9e82faf1/reveal-refs/artbot-horde/spec.json' }],
    extrapolated: [
      "the whole generating and landing stage: the capture ended at +118.3 s still queued at Position #275 ('1456s remaining', about 24 minutes from the end), so the 'Processing...' line, the bar running near full and the hand-over of tile to picture are our own",
      "ten tiles in a 4 + 4 + 2 block, all in view with no scroll, landing in strict reading order: the footage has one tile and its Pending images card lists jobs down one column",
      "the counters' pace: Position runs down to #1, the percentage up and the ETA down within the one beat (the footage's position moved a few places in 118 s, once back up, and its ETA receded ~80 s); each tile counts from #290 (+2 per tile) and its own clock",
      "the card's stat row and the 'Filter: all (N image requests)' line change to ten requests; the footage shows one",
      "the Create button returns to its resting #6AB7C6 and the spinner button goes once the last picture has landed",
      "the plain '(66 chars)' counter and the left form's settings panels as drawn: condensed from the frames; the unsampled tile grid texture is drawn as a faint #262626 ruling on #202020 and the swarm as sixteen small discs",
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'artbot-horde');
    const dots = Array.from({ length: NDOT }, () => `<i class="${P}-d"></i>`).join('');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/><div class="${P}-cv"></div></div><div class="${P}-pd"><div class="${P}-pc">${CLOCK}0 / 1</div>${X}<div class="${P}-sw">${dots}</div>${IMG_BIG}<div class="${P}-tx"><span></span><span></span></div><u class="${P}-br"></u></div></div>`;
    const root = x.el(`<div class="${P}"><div class="${P}-l"><div class="${P}-h">Create</div><div class="${P}-pm"><div class="${P}-pt">Prompt</div><div class="${P}-ta">${x.esc(PROMPT)}</div><div class="${P}-pl"><span>Prompts</span><span>Tags</span><span class="${P}-clr">Clear</span></div><div class="${P}-np">Negative prompt <small>(optional)</small></div></div><div class="${P}-ct"><div class="${P}-cn">(66 chars)</div><div class="${P}-bt ${P}-rs">${BIN}Reset?</div><div class="${P}-bt ${P}-cr">Create</div><div class="${P}-bt ${P}-ic">${ICON_SCR}</div><div class="${P}-bt ${P}-sp">${RING}</div></div><div class="${P}-gp"><div>Image model<span>AlbedoBase XL (SDXL) (5)</span></div><div>Sampler<span>k_euler_a</span></div></div><div class="${P}-gp"><div>Aspect<span>Square</span></div><div>Images<span>10</span></div></div></div><div class="${P}-c"><div class="${P}-ch">${CLOCK}Pending images</div><div class="${P}-st"></div><div class="${P}-fl"></div><div class="${P}-body"><div class="${P}-es">No pending images. Create something new!</div><div class="${P}-g" style="visibility: hidden">${tiles.map(cell).join('')}</div></div></div></div>`);
    const cr = root.querySelector(`.${P}-cr`), sp = root.querySelector(`.${P}-sp svg`), es = root.querySelector(`.${P}-es`), grid = root.querySelector(`.${P}-g`), stat = root.querySelector(`.${P}-st`), fl = root.querySelector(`.${P}-fl`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n, i) => {
      const ds = [...n.querySelectorAll(`.${P}-d`)];
      return {
        im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`), pd: n.querySelector(`.${P}-pd`), sw: n.querySelector(`.${P}-sw`), ig: n.querySelector(`.${P}-ig`),
        l1: n.querySelector(`.${P}-tx span:nth-child(1)`), l2: n.querySelector(`.${P}-tx span:nth-child(2)`), br: n.querySelector(`.${P}-br`), ds, g: tiles[i],
        // the swarm: a tight cluster at the centre (twelve discs) and four lone discs out near the tile's edges, each with its own orbit
        sd: ds.map((_, j) => ({ r: j < 12 ? 1 + hash(i * 31 + 3, j) * 7 : 20 + hash(i * 31 + 5, j) * 10, a: hash(i * 31 + 7, j) * Math.PI * 2, w: (0.6 + hash(i * 31 + 9, j)) * (j % 2 ? 1 : -1) * 5.5, sz: j < 12 ? 1.6 + hash(i * 31 + 11, j) * 1.8 : 1.4 + hash(i * 31 + 13, j) * 0.8 })),
      };
    });
    ctx.gate(cells.map((c) => c.im));
    cells.forEach((c) => c.sd.forEach((d, j) => { c.ds[j].style.width = c.ds[j].style.height = `${d.sz.toFixed(2)}px`; c.ds[j].style.margin = `${(-d.sz / 2).toFixed(2)}px 0 0 ${(-d.sz / 2).toFixed(2)}px`; }));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const te = Math.min(s, LAND[9]);               // the wait's clock stops at the last landing: every counter, particle and spinner holds there

        // 'Create' is pressed (it never changes label): it lightens and a spinner button appears while the run is on
        const gp = press(s, GEN_AT, 0.06, 0.06, 0.14);
        put('go', gp.toFixed(3), () => { cr.style.transform = gp > 0 ? `scale(${(1 - 0.05 * gp).toFixed(4)})` : 'none'; });
        const stage = s < GEN_AT ? 0 : s < LAND[9] ? 1 : 2;
        put('stage', stage, (v) => { root.className = `${P} ${P}-s${v === 1 ? 1 : 0}`; });
        put('spin', (te * 540 % 360).toFixed(0), (d) => { sp.style.transform = `rotate(${d}deg)`; });

        // the empty card gives way to the ten tiles
        const on = s >= ISSUE;
        put('iss', on, (v) => { es.style.display = v ? 'none' : ''; grid.style.visibility = v ? '' : 'hidden'; });
        const nDone = LAND.filter((a) => s >= a).length;
        put('stat', `${on}|${nDone}`, () => {
          stat.innerHTML = on ? `${STAT(nDone, TICK)}${STAT(0, RING)}${STAT(10 - nDone, UP)}${STAT(0, WARN)}${STAT(10, GRID4)}` : `${STAT(0, TICK)}${STAT(0, RING)}${STAT(0, UP)}${STAT(0, WARN)}${STAT(0, GRID4)}`;
          fl.textContent = `Filter: all (${on ? 10 : 0} image requests)`;
        });

        cells.forEach((c, i) => {
          const a = LAND[i];
          const done = s >= a;
          // a hard swap: the placeholder is replaced by the picture (the footage's hand-over was never sampled)
          put(`i${i}`, done, (v) => { c.im.style.visibility = v ? '' : 'hidden'; c.cv.style.display = v ? 'none' : ''; c.pd.style.display = v ? 'none' : ''; });
          const lv = live(s, i);
          put(`l1${i}`, lv.l1, (v) => { c.l1.textContent = v; });
          put(`l2${i}`, lv.l2, (v) => { c.l2.textContent = v; });
          put(`br${i}`, lv.bar.toFixed(2), () => { c.br.style.width = `${lv.bar.toFixed(2)}%`; });
          put(`ig${i}`, lv.state === 'wait', (v) => { c.ig.style.display = v ? '' : 'none'; c.sw.style.display = v ? 'none' : ''; });
          // the swarm drifts on its orbits with the tile's own clock; a function of t alone
          const tt = Math.min(s, a);
          c.sd.forEach((d, j) => {
            const ang = d.a + d.w * tt, rr = d.r * (1 + 0.18 * Math.sin(tt * 7 + j));
            const px = (rr * Math.cos(ang)).toFixed(1), py = (rr * Math.sin(ang)).toFixed(1);
            put(`d${i}-${j}`, `${px},${py}`, () => { c.ds[j].style.transform = `translate(${px}px, ${py}px)`; });
          });
        });
      },
    };
  },
};
