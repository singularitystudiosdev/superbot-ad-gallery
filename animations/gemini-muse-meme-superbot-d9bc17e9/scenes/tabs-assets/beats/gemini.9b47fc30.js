// Gemini beat: the reply streams, then the art resolves while the camera pushes onto it. Pure function of t (the tabs
// scene's local time) and the variant (variant.9e82faf1.js): '1' resolves one meme card out of a blur under a sweeping
// band; '10' generates ten tiles at once, each landing on its own clock inside the same window; '3d' builds a zombie
// model from the feet up on a turntable (zombie3d.9e82faf1.js); 'game' types out a zombie runner's code, then boots it
// into the running game (zombiegame.7b46b820.js); 'garden' draws a garden design template onto grid paper
// (garden.410879cc.js); 'logo' resolves a generated coffee shop logo (img/coffee-logo.a133a772.png) as the 1-image card
// does. Every variant keeps the beat's length. All layouts are
// built once and the variant picks which one shows; the 3D viewer (and three.js) loads the first time its variant shows.
import { lerp, seg, outCubic, inOutCubic, streamCount } from '../../../lib.9b47fc30.js';
import { variant } from '../../../variant.9e82faf1.js';
import { track } from '../../../loads.9e82faf1.js';
import { makeZombieViewer } from './zombie3d.9e82faf1.js';
import { makeZombieGame, gameState, codeFrame, CODE_CHARS, CODE_ROWS, CODE_LINE_H } from './zombiegame.7b46b820.js';
import { makeGarden } from './garden.410879cc.js';

const SAY = { 1: 'Here’s your Muse meme.', 10: 'Here are 10 Muse memes.', '3d': 'Here’s your 3D zombie.', game: 'Here’s your zombie game.', garden: 'Here’s your garden design template.', logo: 'Here’s your coffee shop logo.' };
const ZOMBIE = new URL('../../../models/zombie-3d.9e82faf1.glb', import.meta.url).href;
const BOOT = 0.75, BOOT_LEN = 0.2, PLAY = 0.8; // the code view hands over to the game at T.w0 + BOOT; play counts from T.w0 + PLAY
const SPIN0 = -0.75, SPIN = 0.55; // the turntable's angle as the card lands (a three-quarter view), and its turn in rad/s

// the ten generations: the one sourced meme (img/muse-meme.png) under a different crop and grade per tile until real
// renders replace it; `at` is when the tile lands, as a share of the resolve window, scattered so they finish out of order
const TILES = [
  { at: 0.62, zoom: 1, origin: '50% 50%', grade: '' },
  { at: 0.9, zoom: 1.18, origin: '50% 0%', grade: 'hue-rotate(32deg)' },
  { at: 0.74, zoom: 1, origin: '50% 50%', grade: 'sepia(.5) saturate(1.25)' },
  { at: 1, zoom: 1.22, origin: '0% 100%', grade: 'grayscale(1) contrast(1.12)' },
  { at: 0.68, zoom: 1.1, origin: '100% 50%', grade: 'hue-rotate(-38deg) saturate(1.3)' },
  { at: 0.95, zoom: 1, origin: '50% 50%', grade: 'contrast(1.2) saturate(1.45)' },
  { at: 0.8, zoom: 1.25, origin: '50% 100%', grade: 'hue-rotate(95deg) saturate(1.1)' },
  { at: 0.58, zoom: 1.14, origin: '0% 0%', grade: 'brightness(1.08) sepia(.25) hue-rotate(-12deg)' },
  { at: 0.88, zoom: 1, origin: '50% 50%', grade: 'saturate(.55) contrast(1.1)' },
  { at: 0.77, zoom: 1.2, origin: '100% 0%', grade: 'hue-rotate(60deg) brightness(1.05)' },
];

// one image resolving at progress p: blur and desaturation clear, the scale settles onto its crop, the band sweeps
// and fades out
function resolve(im, gen, p, { grade = '', zoom = 1, phase = 0, blur = 18 } = {}) {
  const e = outCubic(p);
  im.style.filter = e >= 1 ? grade || 'none' : `blur(${((1 - e) * blur).toFixed(2)}px) saturate(${lerp(0.3, 1, e).toFixed(3)}) ${grade}`.trim();
  im.style.opacity = lerp(0.3, 1, e).toFixed(3);
  const s = zoom * (e >= 1 ? 1 : lerp(1.08, 1, e));
  im.style.transform = s === 1 ? 'none' : `scale(${s.toFixed(4)})`;
  gen.style.transform = `translateX(${lerp(-110, 110, (p * 2 + phase) % 1).toFixed(1)}%)`;
  gen.style.opacity = (p >= 1 ? 0 : 1 - seg(p, 0.8, 1)).toFixed(3);
}

export default {
  times(r) {
    const T = { r };
    T.card = r + 0.22;
    T.w0 = r + 0.3; T.w1 = T.w0 + 1.2;
    T.end = T.w1 + 0.85;
    return T;
  },
  build(k, x) {
    const T = k.T;
    const src = x.img('muse-meme.png');
    const say = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(SAY[variant()])}</span></div>`);
    const media = x.el('<div class="qc-media"></div>');
    const card = x.el(`<div class="qc-img"><img src="${src}" width="870" height="1024" alt="Muse meme"/><i class="qc-gen"></i><span class="qc-genl">${x.tile('gemini')}Creating image</span></div>`);
    const grid = x.el(`<div class="qc-grid">${TILES.map((g, i) => `<div class="qc-gt"><img src="${src}" width="870" height="1024" alt="Muse meme ${i + 1}" style="transform-origin: ${g.origin}"/><i class="qc-gen"></i></div>`).join('')}<span class="qc-genl">${x.tile('gemini')}Creating 10 images<b class="qc-genn"></b></span></div>`);
    const model = x.el(`<div class="qc-img qc-3d"><canvas width="590" height="695" role="img" aria-label="3D zombie model"></canvas><span class="qc-genl">${x.tile('gemini')}Creating 3D model<b class="qc-genn"></b></span></div>`);
    const game = x.el(`<div class="qc-img qc-game"><canvas width="590" height="695" role="img" aria-label="Zombie runner game"></canvas><div class="qc-code"><div class="qc-tabs"><span>zombie-run.js</span></div><div class="qc-lines"><pre></pre></div></div><span class="qc-chip qc-score">Score <b>0000</b></span><span class="qc-chip qc-brains">Brains <b>0</b></span><span class="qc-genl">${x.tile('gemini')}Creating game<b class="qc-genn"></b></span></div>`);
    const logo = x.el(`<div class="qc-img qc-logo"><img src="${x.img('coffee-logo.a133a772.png')}" width="720" height="720" alt="Hearth &amp; Bean coffee shop logo"/><i class="qc-gen"></i><span class="qc-genl">${x.tile('gemini')}Creating logo</span></div>`);
    media.append(card, grid, model, game, logo);
    const garden = makeGarden(x);
    media.append(garden.node);
    const vis = say.firstElementChild, hid = say.lastElementChild;
    const im = card.querySelector('img'), gen = card.querySelector('.qc-gen'), genl = card.querySelector('.qc-genl');
    const tiles = [...grid.querySelectorAll('.qc-gt')].map((n, i) => ({ n, im: n.querySelector('img'), gen: n.querySelector('.qc-gen'), g: TILES[i] }));
    const gridl = grid.querySelector('.qc-genl'), count = grid.querySelector('.qc-genn');
    const canvas = model.querySelector('canvas'), modell = model.querySelector('.qc-genl'), pct = model.querySelector('.qc-genn');
    const gcanvas = game.querySelector('canvas'), code = game.querySelector('.qc-code'), pre = game.querySelector('pre');
    const gamel = game.querySelector('.qc-genl'), gpct = game.querySelector('.qc-genn');
    const chips = [...game.querySelectorAll('.qc-chip')], scoreEl = game.querySelector('.qc-score b'), brainsEl = game.querySelector('.qc-brains b');
    const logoIm = logo.querySelector('img'), logoGen = logo.querySelector('.qc-gen'), logoL = logo.querySelector('.qc-genl');
    let shown = -1, lastV = null, landed = -1, viewer = null, built = -1;
    let runner = null, typedN = -1, pcted = -1, scored = '', brained = -1;
    return {
      nodes: [say, media],
      marks: [[T.r, say], [T.card, media]],
      render(t) {
        const v = variant();
        if (v !== lastV) {
          card.style.display = v === '1' ? '' : 'none';
          grid.style.display = v === '10' ? '' : 'none';
          model.style.display = v === '3d' ? '' : 'none';
          game.style.display = v === 'game' ? '' : 'none';
          garden.node.style.display = v === 'garden' ? '' : 'none';
          logo.style.display = v === 'logo' ? '' : 'none';
          lastV = v; shown = -1;
        }
        const text = SAY[v];
        const n = streamCount(text, T.r + 0.06, 70, t);
        if (n !== shown) { vis.textContent = text.slice(0, n); hid.textContent = text.slice(n); shown = n; }
        const ci = outCubic(seg(t, T.card, T.card + 0.45));
        media.style.opacity = ci.toFixed(3);
        media.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
        const label = (1 - seg(t, T.w1 - 0.25, T.w1)).toFixed(3);
        if (v === 'garden') { garden.render(t, T, label); return; }
        if (v === 'game') {
          if (!runner) { runner = makeZombieGame(gcanvas, ZOMBIE); track(runner.ready); }
          const g = Math.max(0, t - (T.w0 + PLAY));
          runner.draw({ g });
          // code phase: the card lands on the editor and Gemini types the game into it
          const p = seg(t, T.card, T.w0 + BOOT);
          const n = Math.round(outCubic(p) * CODE_CHARS);
          if (n !== typedN) {
            const f = codeFrame(n);
            pre.innerHTML = f.html;
            pre.style.transform = `translateY(${-Math.round(Math.max(0, f.line - (CODE_ROWS - 1)) * CODE_LINE_H)}px)`;
            typedN = n;
          }
          const pc = Math.round(p * 100);
          if (pc !== pcted) { gpct.textContent = `${pc}%`; pcted = pc; }
          // boot: the editor lifts away and the runner settles into frame
          const b = outCubic(seg(t, T.w0 + BOOT, T.w0 + BOOT + BOOT_LEN));
          code.style.opacity = (1 - b).toFixed(3);
          code.style.transform = b > 0 ? `translateY(${(-12 * b).toFixed(2)}px)` : 'none';
          code.style.visibility = b >= 1 ? 'hidden' : '';
          gcanvas.style.opacity = b.toFixed(3);
          gcanvas.style.transform = b >= 1 ? 'none' : `scale(${lerp(1.04, 1, b).toFixed(4)})`;
          gamel.style.opacity = (1 - b).toFixed(3);
          const hud = gameState(g);
          const sc = String(hud.score).padStart(4, '0');
          if (sc !== scored) { scoreEl.textContent = sc; scored = sc; }
          if (hud.brains !== brained) { brainsEl.textContent = hud.brains; brained = hud.brains; }
          for (const c of chips) c.style.opacity = b.toFixed(3);
          return;
        }
        if (v === '3d') {
          if (!viewer) { viewer = makeZombieViewer(canvas, ZOMBIE); track(viewer.ready); }
          const build = inOutCubic(seg(t, T.w0, T.w1));
          if (ci > 0) viewer.draw({ build, spin: SPIN0 + SPIN * (t - T.card), scan: 1 - seg(t, T.w1 - 0.1, T.w1 + 0.25) });
          const p = Math.round(build * 100);
          if (p !== built) { pct.textContent = `${p}%`; built = p; }
          modell.style.opacity = label;
          return;
        }
        if (v === 'logo') {
          // the generated logo resolves exactly as the 1-image card does
          resolve(logoIm, logoGen, seg(t, T.w0, T.w1));
          logoL.style.opacity = label;
          return;
        }
        if (v !== '10') {
          resolve(im, gen, seg(t, T.w0, T.w1));
          genl.style.opacity = label;
          return;
        }
        let done = 0;
        tiles.forEach((tl, i) => {
          const pi = outCubic(seg(t, T.card + i * 0.025, T.card + 0.35 + i * 0.025));
          tl.n.style.opacity = pi.toFixed(3);
          tl.n.style.transform = pi >= 1 ? 'none' : `scale(${lerp(0.9, 1, pi).toFixed(4)})`;
          const p = seg(t, T.w0, T.w0 + (T.w1 - T.w0) * tl.g.at);
          if (p >= 1) done++;
          resolve(tl.im, tl.gen, p, { grade: tl.g.grade, zoom: tl.g.zoom, phase: i * 0.13, blur: 9 });
        });
        if (done !== landed) { count.textContent = `${done}/${TILES.length}`; landed = done; }
        gridl.style.opacity = label;
      },
    };
  },
};
