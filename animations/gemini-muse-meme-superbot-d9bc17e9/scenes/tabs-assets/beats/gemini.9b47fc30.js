// Gemini beat: the reply streams, then the art resolves while the camera pushes onto it. Pure function of t (the tabs
// scene's local time) and the variant (variant.9e82faf1.js): '1' resolves one meme card out of a blur under a sweeping
// band; '10' lands ten tiles one after another in reading order, either as Default's grid or as one platform's whole
// generation UI picked via appear() (appear.9e82faf1.js; reveals/); '3d' lands a finished zombie model on a turntable
// (zombie3d.9e82faf1.js) with the same resolve as the 1-image card; 'game' types out a zombie runner's code, then boots it
// into the running game (zombiegame.7b46b820.js); 'garden' draws a garden design template onto grid paper
// (garden.410879cc.js); 'roadtrip' draws a Google-Maps-style route card, LA to SF up the coast (roadtrip.9bc0f433.js); 'logo' resolves a generated coffee shop logo (img/coffee-logo.a133a772.png) as the 1-image card
// does. Every variant keeps the beat's length. All layouts are
// built once and the variant picks which one shows; the 3D viewer (and three.js) loads the first time its variant shows.
import { lerp, seg, outCubic, streamCount } from '../../../lib.9b47fc30.js';
import { variant } from '../../../variant.9e82faf1.js';
import { track } from '../../../loads.9e82faf1.js';
import { appear } from '../../../appear.9e82faf1.js';
import { makeTileFx, gateImages } from './appear-fx.9e82faf1.js';
import { REVEALS } from './reveals/index.9e82faf1.js';
import { makeZombieViewer } from './zombie3d.9e82faf1.js?v=2';
import { makeZombieGame, gameState, codeFrame, CODE_CHARS, CODE_ROWS, CODE_LINE_H } from './zombiegame.7b46b820.js';
import { makeGarden } from './garden.410879cc.js';
import { makeRoadtrip } from './roadtrip.9bc0f433.js';

const SAY = { 1: 'Here’s your Muse meme.', 10: 'Here are 10 Muse memes.', '3d': 'Here’s your 3D zombie.', game: 'Here’s your zombie game.', garden: 'Here’s your garden design template.', roadtrip: 'Here’s a 3-day coastal drive from LA to SF.', logo: 'Here’s your coffee shop logo.' };
const ZOMBIE = new URL('../../../models/zombie-3d.9e82faf1.glb', import.meta.url).href; // the game's blocky runner
const ZOMBIE_3D = new URL('../../../models/zombie-meshy.4490ac01.glb', import.meta.url).href; // the 3D variant's Meshy 7.1 model
const BOOT = 0.75, BOOT_LEN = 0.2, PLAY = 0.8; // the code view hands over to the game at T.w0 + BOOT; play counts from T.w0 + PLAY
const SPIN0 = -0.75, SPIN = 0.55; // the turntable's angle as the card lands (a three-quarter view), and its turn in rad/s

// the ten generations: the one sourced meme (img/muse-meme.png) under a different crop and grade per tile until real
// renders replace it. They land one after another in reading order (left to right, top to bottom): tile i starts at
// T.card + TILE0 + i * STAGGER and takes TILE_LEN to land (Default; a platform reveal gets these as ctx.win(i) and its own
// non-overlapping ctx.seq(i), reveals/index.9e82faf1.js)
const TILE0 = 0.25, STAGGER = 0.11, TILE_LEN = 0.6;
const TILES = [
  { zoom: 1, origin: '50% 50%', grade: '' },
  { zoom: 1.18, origin: '50% 0%', grade: 'hue-rotate(32deg)' },
  { zoom: 1, origin: '50% 50%', grade: 'sepia(.5) saturate(1.25)' },
  { zoom: 1.22, origin: '0% 100%', grade: 'grayscale(1) contrast(1.12)' },
  { zoom: 1.1, origin: '100% 50%', grade: 'hue-rotate(-38deg) saturate(1.3)' },
  { zoom: 1, origin: '50% 50%', grade: 'contrast(1.2) saturate(1.45)' },
  { zoom: 1.25, origin: '50% 100%', grade: 'hue-rotate(95deg) saturate(1.1)' },
  { zoom: 1.14, origin: '0% 0%', grade: 'brightness(1.08) sepia(.25) hue-rotate(-12deg)' },
  { zoom: 1, origin: '50% 50%', grade: 'saturate(.55) contrast(1.1)' },
  { zoom: 1.2, origin: '100% 0%', grade: 'hue-rotate(60deg) brightness(1.05)' },
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
    media.dataset.v = variant();
    const card = x.el(`<div class="qc-img"><img src="${src}" width="870" height="1024" alt="Muse meme"/><i class="qc-gen"></i><span class="qc-genl">${x.tile('gemini')}Creating image</span></div>`);
    const grid = x.el(`<div class="qc-grid">${TILES.map((g, i) => `<div class="qc-gt"><img src="${src}" width="870" height="1024" alt="Muse meme ${i + 1}" style="transform-origin: ${g.origin}"/><i class="qc-gen"></i></div>`).join('')}<span class="qc-genl">${x.tile('gemini')}Creating 10 images<b class="qc-genn"></b></span></div>`);
    const model = x.el(`<div class="qc-img qc-3d"><canvas width="590" height="695" role="img" aria-label="3D zombie model"></canvas><i class="qc-gen"></i><span class="qc-genl">${x.tile(k.app || 'gemini')}Creating 3D model<b class="qc-genn"></b></span></div>`);
    const game = x.el(`<div class="qc-img qc-game"><canvas width="590" height="695" role="img" aria-label="Zombie runner game"></canvas><div class="qc-code"><div class="qc-tabs"><span>zombie-run.js</span></div><div class="qc-lines"><pre></pre></div></div><span class="qc-chip qc-score">Score <b>0000</b></span><span class="qc-chip qc-brains">Brains <b>0</b></span><span class="qc-genl">${x.tile('gemini')}Creating game<b class="qc-genn"></b></span></div>`);
    const logo = x.el(`<div class="qc-img qc-logo"><img src="${x.img('coffee-logo.a133a772.png')}" width="720" height="720" alt="Hearth &amp; Bean coffee shop logo"/><i class="qc-gen"></i><span class="qc-genl">${x.tile('gemini')}Creating logo</span></div>`);
    media.append(card, grid, model, game, logo);
    const garden = makeGarden(x);
    media.append(garden.node);
    const roadtrip = makeRoadtrip(x);
    media.append(roadtrip.node);
    const vis = say.firstElementChild, hid = say.lastElementChild;
    const im = card.querySelector('img'), gen = card.querySelector('.qc-gen'), genl = card.querySelector('.qc-genl');
    const tiles = [...grid.querySelectorAll('.qc-gt')].map((n, i) => {
      const im = n.querySelector('img'), gen = n.querySelector('.qc-gen');
      return { n, im, gen, g: TILES[i], fx: makeTileFx(im, gen, TILES[i]) };
    });
    const gridl = grid.querySelector('.qc-genl'), count = grid.querySelector('.qc-genn');
    const canvas = model.querySelector('canvas'), modelg = model.querySelector('.qc-gen'), modell =model.querySelector('.qc-genl'), pct = model.querySelector('.qc-genn');
    const gcanvas = game.querySelector('canvas'), code = game.querySelector('.qc-code'), pre = game.querySelector('pre');
    const gamel = game.querySelector('.qc-genl'), gpct = game.querySelector('.qc-genn');
    const chips = [...game.querySelectorAll('.qc-chip')], scoreEl = game.querySelector('.qc-score b'), brainsEl = game.querySelector('.qc-brains b');
    const logoIm = logo.querySelector('img'), logoGen = logo.querySelector('.qc-gen'), logoL = logo.querySelector('.qc-genl');
    let shown = -1, lastV = null, landed = -1, viewer = null, built = -1;
    // the 10-image variant's platform reveals (reveals/index.9e82faf1.js): each module's block is built once, the first
    // time its style shows, and display-toggled after; Default keeps the grid above
    const reveals = {};
    let lastStyle = null;
    const ctxFor = () => ({
      src, tiles: TILES, count: TILES.length, cardIn: T.card, track, gate: gateImages,
      win: (i) => { const a = T.card + TILE0 + i * STAGGER; return [a, a + TILE_LEN]; },
      seq: (i) => { const a = T.card + TILE0, step = (T.card + TILE0 + (TILES.length - 1) * STAGGER + TILE_LEN - a) / TILES.length; return [a + i * step, a + (i + 1) * step]; },
      lastLand: T.card + TILE0 + (TILES.length - 1) * STAGGER + TILE_LEN,
    });
    const revealFor = (style) => {
      if (reveals[style]) return reveals[style];
      const mod = REVEALS.find((r) => r.id === style);
      const r = mod.build(x, ctxFor());
      r.root.style.display = 'none';
      media.append(r.root);
      return (reveals[style] = r);
    };
    let runner = null, typedN = -1, pcted = -1, scored = '', brained = -1;
    return {
      nodes: [say, media],
      marks: [[T.r, say], [T.card, media]],
      render(t) {
        const v = variant();
        const style = appear();
        if (v !== lastV || style !== lastStyle) {
          card.style.display = v === '1' ? '' : 'none';
          grid.style.display = v === '10' && style === 'default' ? '' : 'none';
          for (const id in reveals) reveals[id].root.style.display = 'none';
          if (v === '10' && style !== 'default') revealFor(style).root.style.display = '';
          model.style.display = v === '3d' ? '' : 'none';
          game.style.display = v === 'game' ? '' : 'none';
          garden.node.style.display = v === 'garden' ? '' : 'none';
          roadtrip.node.style.display = v === 'roadtrip' ? '' : 'none';
          logo.style.display = v === 'logo' ? '' : 'none';
          media.dataset.v = v; // chat.css drops the feed's will-change while the 10-image variant shows
          lastV = v; lastStyle = style; shown = -1;
        }
        const text = SAY[v];
        const n = streamCount(text, T.r + 0.06, 70, t);
        if (n !== shown) { vis.textContent = text.slice(0, n); hid.textContent = text.slice(n); shown = n; }
        const ci = outCubic(seg(t, T.card, T.card + 0.45));
        media.style.opacity = ci.toFixed(3);
        media.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;
        const label = (1 - seg(t, T.w1 - 0.25, T.w1)).toFixed(3);
        if (v === 'garden') { garden.render(t, T, label); return; }
        if (v === 'roadtrip') { roadtrip.render(t, T, label); return; }
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
          if (!viewer) { viewer = makeZombieViewer(canvas, ZOMBIE_3D); track(viewer.ready); }
          // the finished model turns on its stand from the moment the card lands; it resolves in exactly as the 1-image card does
          if (ci > 0) viewer.draw({ spin: SPIN0 + SPIN * (t - T.card) });
          const rp = seg(t, T.w0, T.w1);
          resolve(canvas, modelg, rp);
          const p = Math.round(rp * 100);
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
        // a platform's reveal draws its own whole block
        if (style !== 'default') { revealFor(style).render(t); return; }
        // Default: ten tiles land one after another in reading order, each resolving out of a blur; an empty slot waits for its turn
        let done = 0;
        const first = T.card + TILE0;
        tiles.forEach((tl, i) => {
          const p = seg(t, first + i * STAGGER, first + i * STAGGER + TILE_LEN);
          if (p >= 1) done++;
          if (tl.fx.draw(p)) return;
          resolve(tl.im, tl.gen, p, { grade: tl.g.grade, zoom: tl.g.zoom, phase: i * 0.13, blur: 9 });
          if (p < 1) tl.im.style.opacity = (Number(tl.im.style.opacity) * outCubic(seg(p, 0, 0.2))).toFixed(3);
        });
        if (done !== landed) { count.textContent = `${done}/${TILES.length}`; landed = done; }
        const lastLand = first + (TILES.length - 1) * STAGGER + TILE_LEN;
        gridl.style.opacity = (1 - seg(t, lastLand, lastLand + 0.25)).toFixed(3);
      },
    };
  },
};
