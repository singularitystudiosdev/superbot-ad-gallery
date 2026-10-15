// Freepik Spaces (Magnific, 2025): the Image Generator node on the Spaces node canvas, read from the first-party tutorial 'Build your first creative AI
// workflow in Spaces | Magnific Academy' (YouTube AWcvnBDsnY0, official Magnific channel, published 2025-11-04), the wait at t = 326 - 340 s of the recording
// (frames reveal-refs/freepik-spaces/frames/bk_*.png, spec .tmp/clone-9e82faf1/reveal-refs/freepik-spaces/spec.json, confidence 0.55). The node's output well is
// a FLAT near-black rounded rectangle (#0E0E0E, the canvas colour) for the whole wait: no skeleton, spinner, bar, percentage or ETA. The only in-flight signs are
// (1) the node's BORDER, which is replaced by a travelling multi-hue gradient stroke running round the rectangle (a violet tail fading into a teal-green head,
// with a soft outer bloom) and (2) a small grey caption at the node's bottom-left stepping 'Image in queue...' -> 'Generating image...' -> 'Finishing up...'.
// The downstream Video Generator node, waiting on the result, shows its own 'Video in queue...' under a white halo. When the image is ready the pixels hard-swap
// into the well, the stroke and the caption go, and the node keeps its blue selection ring with the prompt footer (placeholder, model chip, ratio chip, count,
// run button). Differs from the built canvases: comfyui (static green outline, 'Total x%' bar, live preview), flora-ai (run-handle spinner, green glow, queue
// capsule), weavy ('Processing' pill), kaiber-superstudio (white rectangle). Omitted: the Freepik / Magnific brand, the top bar, the right-hand rail, the zoom
// control, any plan, credit or upgrade chrome. Every picture is OUR meme, system UI face only.
import { injectStyle, restTransform, restFilter, ownSrc, UI_FONT } from './util.9e82faf1.js';

const P = 'rv-fsp';
const ROOT_W = 560, ROOT_H = 250;
const COLS = 5, TILE_W = 52, TILE_H = 61, GAP = 6;                         // 870 x 1024 pictures (0.85), five columns in the node's output well
const NODE_X = 140, NODE_Y = 50, NODE_W = 300, NODE_H = 182;               // the Image Generator node
const CANVAS = '#0e0e0e';
const CSS = `
.${P} { position: relative; box-sizing: border-box; width: ${ROOT_W}px; max-width: 100%; height: ${ROOT_H}px; border-radius: 12px; background: ${CANVAS}; background-image: radial-gradient(circle, rgba(255, 255, 255, .13) 0.7px, rgba(255, 255, 255, 0) 1.1px); background-size: 14px 14px; color: #c8c8cc; font-family: ${UI_FONT}; -webkit-font-smoothing: antialiased; overflow: hidden; box-shadow: 0 0 0 1px rgba(255, 255, 255, .08); }
.${P}-wires { position: absolute; left: 0; top: 0; width: ${ROOT_W}px; height: ${ROOT_H}px; overflow: visible; pointer-events: none; }
.${P}-wires path { fill: none; stroke-width: 1.5; stroke-linecap: round; }
.${P}-lb { position: absolute; margin: 0; font-size: 7.5px; line-height: 10px; font-weight: 500; color: #d6d6da; white-space: nowrap; display: flex; align-items: center; gap: 3px; }
.${P}-lb svg { flex: none; width: 7px; height: 7px; fill: none; stroke: #b8b8bd; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-tx { position: absolute; left: 10px; top: 24px; box-sizing: border-box; width: 100px; height: 44px; padding: 7px 8px; border-radius: 5px; background: #1b3e5f; box-shadow: inset 0 0 0 1px #2d5b88; font-size: 6.6px; line-height: 9px; color: #cfdbe8; overflow: hidden; }
.${P}-bar { position: absolute; left: 226px; top: 12px; box-sizing: border-box; width: 128px; height: 18px; border-radius: 9px; background: #17171a; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .06); display: flex; align-items: center; justify-content: space-around; padding: 0 7px; }
.${P}-bar svg { width: 8px; height: 8px; fill: none; stroke: #e4e4e7; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-bar svg .${P}-sf { fill: #e4e4e7; }
.${P}-bar i { flex: none; width: 1px; height: 9px; background: rgba(255, 255, 255, .14); }
.${P}-pt { position: absolute; box-sizing: border-box; width: 11px; height: 11px; margin: -5.5px 0 0 -5.5px; border-radius: 50%; background: #2a2b2f; box-shadow: inset 0 0 0 1px #4d4e55; }
.${P}-pt svg { position: absolute; left: 2.5px; top: 2.5px; width: 6px; height: 6px; fill: none; stroke: #d9d9de; stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.${P}-nd { position: absolute; left: ${NODE_X}px; top: ${NODE_Y}px; box-sizing: border-box; width: ${NODE_W}px; height: ${NODE_H}px; border-radius: 10px; background: #171717; border: 1.5px solid #3f6fe0; }
.${P}-nd.${P}-run { background: ${CANVAS}; border-color: #26262a; }
.${P}-nd.${P}-end { background: ${CANVAS}; border-color: #3f6fe0; }
.${P}-g { position: absolute; left: 6.5px; top: 7px; display: grid; grid-template-columns: repeat(${COLS}, ${TILE_W}px); grid-auto-rows: ${TILE_H}px; gap: ${GAP}px; }
.${P}-t { position: relative; width: ${TILE_W}px; height: ${TILE_H}px; border-radius: 4px; overflow: hidden; background: ${CANVAS}; }
.${P}-z { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
.${P}-t img { position: absolute; left: 0; top: 0; display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-cv { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: ${CANVAS}; }
.${P}-ft { position: absolute; left: 7px; right: 7px; bottom: 7px; height: 30px; }
.${P}-ph { position: absolute; left: 3px; top: 0; margin: 0; font-size: 7.5px; line-height: 11px; color: #5d5d62; white-space: nowrap; }
.${P}-ch { position: absolute; left: 0; right: 0; bottom: 0; height: 14px; display: flex; align-items: center; gap: 5px; }
.${P}-c { box-sizing: border-box; height: 14px; padding: 0 6px; border-radius: 7px; background: #212123; font-size: 6.4px; line-height: 14px; font-weight: 600; color: #d4d4d8; white-space: nowrap; }
.${P}-rn { margin-left: auto; width: 14px; height: 14px; border-radius: 50%; background: #e8e8ea; position: relative; }
.${P}-rn svg { position: absolute; left: 3.5px; top: 3.5px; width: 7px; height: 7px; fill: none; stroke: #17171a; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.${P}-cp { position: absolute; left: 12px; bottom: 15px; margin: 0; font-size: 8px; line-height: 11px; color: #c8c8cc; white-space: nowrap; }
.${P}-rw { position: absolute; left: -1.5px; top: -1.5px; right: -1.5px; bottom: -1.5px; pointer-events: none; }
.${P}-bl { position: absolute; left: 0; top: 0; right: 0; bottom: 0; filter: blur(5px); opacity: .7; }
.${P}-rg { position: absolute; left: 0; top: 0; right: 0; bottom: 0; box-sizing: border-box; padding: 1.5px; border-radius: 10px; background: conic-gradient(from var(--a, 0deg), rgba(124, 92, 255, 0) 0deg, #7c5cff 110deg, #46b5d4 190deg, #3fe0a8 262deg, rgba(63, 224, 168, 0) 318deg, rgba(63, 224, 168, 0) 360deg); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; }
.${P}-vl { left: 470px; top: 34px; }
.${P}-vn { position: absolute; left: 470px; top: ${NODE_Y}px; box-sizing: border-box; width: 82px; height: 82px; border-radius: 8px; background: ${CANVAS}; border: 1.5px solid #26262a; }
.${P}-vn.${P}-vq { border-color: rgba(255, 255, 255, .55); box-shadow: 0 0 9px rgba(255, 255, 255, .2); }
.${P}-vc { position: absolute; left: 7px; bottom: 9px; margin: 0; font-size: 6.6px; line-height: 9px; color: #c8c8cc; white-space: nowrap; }
`;

const REF = 1.84;                                  // the beat in seconds from the card's entrance: cardIn .. lastLand, stretched with the real window
const RUN = 0.1;                                   // the node is submitted: the border stroke lights and 'Image in queue...' appears (idle before)
const GENERATING = 0.4;                            // caption steps to 'Generating image...'
const FINISHING = 1.0;                             // caption steps to 'Finishing up...'
const LAND = Array.from({ length: 10 }, (_, i) => 1.04 + i * (0.64 / 9));  // cell i hands over to its picture (strict reading order), the last at 1.68
const TURN = 230;                                  // the stroke's travel, degrees of the gradient per layout second (about one and a quarter turns inside the beat)

const GL = {
  img: '<rect x="1" y="1.5" width="8" height="7" rx="1.5"/><circle cx="3.6" cy="4" r=".9"/><path d="M1.5 8 4 5.6 6 7.4 7.4 6.2 9 7.8"/>',
};
const lbIcon = (d) => `<svg viewBox="0 0 10 10">${d}</svg>`;
const BAR = [
  '<path class="' + P + '-sf" d="M2.6 1.6 8 5 2.6 8.4Z"/>',
  '<path d="M6 1.5h2.5V4M4 8.5H1.5V6M8.3 1.7 5.8 4.2M1.7 8.3 4.2 5.8"/>',
  '<path d="M1.6 5a3.4 3.4 0 1 0 1-2.4M1.4 1.4v1.4h1.4M5 3v2.2l1.4.8"/>',
  '<rect x="2" y="4.4" width="6" height="4.2" rx="1"/><path d="M3.4 4.4V3.2a1.6 1.6 0 0 1 3.2 0v1.2"/>',
  '<rect x="3.4" y="3.4" width="5" height="5" rx="1"/><path d="M6.6 3.4V2.4a.9.9 0 0 0-.9-.9H2.4a.9.9 0 0 0-.9.9v3.3c0 .5.4.9.9.9h1"/>',
  '<path d="M2 3h6M4 3V1.8h2V3M3 3l.3 5.2h3.4L7 3"/>',
  '<path d="M5 1.5v5M2.8 4.6 5 6.8l2.2-2.2M1.8 8.5h6.4"/>',
];
const barHtml = BAR.map((d, i) => (i === 4 ? '<i></i>' : '') + `<svg viewBox="0 0 10 10">${d}</svg>`).join('');

const STAGES = ['Image in queue...', 'Generating image...', 'Finishing up...'];
const f1 = (v) => v.toFixed(1);

export default {
  id: 'freepik-spaces',
  label: 'Freepik Spaces (2025)',
  source: {
    platform: "Freepik Spaces / Magnific Spaces node canvas (freepik.com > Spaces), dark theme, captured from the first-party tutorial 'Build your first creative AI workflow in Spaces | Magnific Academy' on the official Magnific (Freepik) YouTube channel",
    feature: "a text-to-image run on the Spaces infinite canvas: a Text node feeds an 'Image Generator' node (model chip 'Google Nano Banana'); while it runs the node body stays a flat near-black well and its BORDER carries a travelling teal-to-violet gradient stroke with a soft outer bloom, a grey caption at the node's bottom-left steps 'Image in queue...' -> 'Generating image...' -> 'Finishing up...', and the downstream Video Generator node reads 'Video in queue...'; the finished pictures hard-swap into the well, the stroke and caption go, a blue selection ring and the prompt footer remain",
    capture: { url: 'https://www.youtube.com/watch?v=AWcvnBDsnY0', date: '2025-11-04', timestamps: "video AWcvnBDsnY0 'Build your first creative AI workflow in Spaces | Magnific Academy': idle node, 'Image in queue...' at t = 326 s, 'Generating image...' at t = 330 s, 'Finishing up...' at t = 336 s, result landed at t = 340 s (frames bk_idle_image_generator_node, bk_t326_image_in_queue, bk_t330_generating_image, bk_t336_finishing_up, bk_t340_result_landed)" },
    refs: [
      { url: 'https://www.youtube.com/watch?v=AWcvnBDsnY0', published: '2025-11-04', retrieved: '2026-10-15', note: "official Magnific Academy tutorial; the Image Generator wait at t = 326 - 340 s is the source of the stroke, the caption strings, the flat well and the Video Generator 'Video in queue...'" },
    ],
    extrapolated: [
      'ten outputs from one observed: the recording generates a single 9:16 image (count 1); here the node holds a 5 x 2 well of ten pictures, all in view with no scroll, landing in strict reading order',
      'all timing: the clip shows about 2 s of queue, about 7 s generating and about 2 s finishing for one image; here the three captions are compressed into the shared 1.84 s beat (queue, generating, then the ten hand-overs during Finishing up...), and the stroke runs about 1.25 turns in it',
      'the stroke is a CSS conic gradient (violet tail, teal-green head) masked to a 1.5 px ring plus a blurred copy as the bloom, its angle a pure function of t; the recording shows the arc at only two positions (bottom right at t = 330, mostly round the node at t = 336), the travel direction and speed are ours',
      "the finished state follows the t = 340 frame (blue selection ring, prompt footer) with the footer's count chip reading 10 and the ratio chip 1:1 as in the idle frame; the recording's own prompt text and its 'Creation' node are not reproduced (the Text node carries our own line)",
      "the Video Generator node's caption becomes 'Generating video...' once the pictures land, as in the recording's next frames; its elapsed-time line is omitted",
      'the canvas is a plain dot field at the recording\'s colour (#0E0E0E), nodes at about 1:1 of the frame; node and font sizes are ours',
    ],
  },
  build(x, ctx) {
    injectStyle(P, CSS);
    const { tiles } = ctx;
    const src = ownSrc(ctx.src, 'freepik-spaces');
    const cell = (g, i) => `<div class="${P}-t"><div class="${P}-z" style="transform-origin: ${g.origin}; transform: ${restTransform(g)}"><img src="${src}" width="870" height="1024" decoding="sync" alt="Muse meme ${i + 1}" style="visibility: hidden; filter: ${restFilter(g)}"/><div class="${P}-cv"></div></div></div>`;
    const wires = `<svg class="${P}-wires" viewBox="0 0 ${ROOT_W} ${ROOT_H}"><path class="${P}-w1" d="M110 34 C170 34 96 212 ${NODE_X} 212" stroke="#4fb878"/><path class="${P}-w2" d="M${NODE_X + NODE_W} 62 C${NODE_X + NODE_W + 46} 62 424 110 470 110" stroke="#6a5bd1"/></svg>`;
    const root = x.el(`<div class="${P}">${wires}`
      + `<p class="${P}-lb" style="left: 12px; top: 10px">${lbIcon('<rect x="1.2" y="1.2" width="7.6" height="7.6" rx="1.6"/><path d="M3 3.6h4M5 3.6v3.8"/>')}Text</p>`
      + `<div class="${P}-tx">Ten Muse memes, one picture per cell</div>`
      + `<div class="${P}-pt" style="left: 110px; top: 34px">${lbIcon('<rect x="1.4" y="1.4" width="7.2" height="7.2" rx="1.4"/><path d="M3.2 3.8h3.6M5 3.8v3"/>')}</div>`
      + `<div class="${P}-bar">${barHtml}</div>`
      + `<p class="${P}-lb" style="left: ${NODE_X}px; top: 35px">${lbIcon('<path d="M2 8 6.8 3.2M6 1.6 6.4 2.8 7.6 3.2 6.4 3.6 6 4.8 5.6 3.6 4.4 3.2 5.6 2.8Z"/>')}Image Generator</p>`
      + `<div class="${P}-nd"><div class="${P}-g">${tiles.map(cell).join('')}</div>`
      + `<div class="${P}-ft"><p class="${P}-ph">Describe the image you want to generate...</p><div class="${P}-ch"><span class="${P}-c">Google Nano Banana</span><span class="${P}-c">1:1</span><span class="${P}-c">10</span><span class="${P}-rn"><svg viewBox="0 0 10 10"><path d="M8.2 4.2A3.4 3.4 0 0 0 2 3.2M1.6 1.4v2h2M1.8 5.8A3.4 3.4 0 0 0 8 6.8M8.4 8.6v-2h-2"/></svg></span></div></div>`
      + `<p class="${P}-cp"></p>`
      + `<div class="${P}-rw" style="visibility: hidden"><div class="${P}-bl"><div class="${P}-rg"></div></div><div class="${P}-rg"></div></div></div>`
      + `<div class="${P}-pt" style="left: ${NODE_X}px; top: 212px">${lbIcon('<rect x="1.4" y="1.4" width="7.2" height="7.2" rx="1.4"/><path d="M3.2 3.8h3.6M5 3.8v3"/>')}</div>`
      + `<div class="${P}-pt" style="left: ${NODE_X + NODE_W}px; top: 62px">${lbIcon(GL.img)}</div>`
      + `<p class="${P}-lb ${P}-vl">${lbIcon('<rect x="1" y="2" width="5.6" height="6" rx="1.2"/><path d="M6.6 4.2 9 3v4L6.6 5.8"/>')}Video Generator</p>`
      + `<div class="${P}-vn"><p class="${P}-vc"></p></div>`
      + `<div class="${P}-pt" style="left: 470px; top: 110px">${lbIcon(GL.img)}</div></div>`);
    const nd = root.querySelector(`.${P}-nd`);
    const ft = root.querySelector(`.${P}-ft`);
    const cp = root.querySelector(`.${P}-cp`);
    const rw = root.querySelector(`.${P}-rw`);
    const vn = root.querySelector(`.${P}-vn`);
    const vc = root.querySelector(`.${P}-vc`);
    const w2 = root.querySelector(`.${P}-w2`);
    const cells = [...root.querySelectorAll(`.${P}-t`)].map((n) => ({ im: n.querySelector('img'), cv: n.querySelector(`.${P}-cv`) }));
    ctx.gate(cells.map((c) => c.im));

    // memoised writes: the DOM is set from t alone, so a seek lands on the same state whatever came before
    const memo = new Map();
    const put = (key, v, fn) => { if (memo.get(key) !== v) { memo.set(key, v); fn(v); } };

    return {
      root,
      render(t) {
        const k = (ctx.lastLand - ctx.cardIn) / REF;   // the beat's window against the layout above
        const s = (t - ctx.cardIn) / k;                // layout seconds since the card entered
        const te = Math.min(s, LAND[9]);               // the stroke's clock stops at the last landing
        // 0 idle (blue ring, footer), 1 running (flat well, stroke, caption), 2 landed (pictures, blue ring, footer)
        const phase = s >= LAND[9] ? 2 : s >= RUN ? 1 : 0;
        const stage = phase !== 1 ? -1 : s >= FINISHING ? 2 : s >= GENERATING ? 1 : 0;

        put('ph', phase, (v) => {
          nd.classList.toggle(`${P}-run`, v === 1);
          nd.classList.toggle(`${P}-end`, v === 2);
          ft.style.visibility = v === 1 ? 'hidden' : '';
          rw.style.visibility = v === 1 ? '' : 'hidden';
          vn.classList.toggle(`${P}-vq`, v === 1);
          w2.setAttribute('stroke', v === 1 ? '#3a3a40' : '#6a5bd1');
        });
        put('cp', stage, (v) => { cp.textContent = v < 0 ? '' : STAGES[v]; });
        put('vc', phase, (v) => { vc.textContent = v === 1 ? 'Video in queue...' : v === 2 ? 'Generating video...' : ''; });
        // the stroke travels round the node from the moment it lights and holds its last angle at the last landing
        put('a', f1((Math.max(te - RUN, 0) * TURN) % 360), (v) => { rw.style.setProperty('--a', `${v}deg`); });

        cells.forEach((c, i) => {
          const done = s >= LAND[i];
          // flat well until LAND[i], then a hard swap to the picture (never both, never neither)
          put(`i${i}`, done, (v) => {
            c.im.style.visibility = v ? '' : 'hidden';
            c.cv.style.display = v ? 'none' : '';
          });
        });
      },
    };
  },
};
