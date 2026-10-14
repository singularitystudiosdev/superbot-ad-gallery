// Cat-surfing beat (the 'catsurf' variant): asked "Make a video of a cat surfing", Gemini answers with a generated video.
// A 16:9 player shimmers as a skeleton while "Generating video" counts up, the first frame resolves out of a blur, then
// the video plays: a CC0 cat (Quaternius) on a recoloured CC0 board (Geldvillager) riding a three.js ocean under a
// golden-hour sky (examples Water.js and Sky.js, vendored). The render is a pure function of the video time vt, so a
// frozen ?t= frame and the timeline's seeks always draw the same picture: the clip mixer is set from vt, the ocean's
// swell, the board's pitch and roll, the camera and the spray all come from vt, and the one random source is a seeded
// PRNG. The player's download icon records the canvas for real (captureStream + MediaRecorder, about 8 s, saved as
// cat-surfing.webm); window.__catsurfRecord() runs the same recording and resolves with the Blob. Nothing records
// unless asked. Squeezed into the window the Gemini beat leaves (times(r, end)) so every variant loops the same
// length; its stylesheet (../catsurf.e2265c3a.css) loads with the module. Sources: models/CREDITS.txt.
import { lerp, seg, outCubic } from '../../../lib.9b47fc30.js';
import { track } from '../../../loads.9e82faf1.js';

const SAY = 'Here’s your video of a cat surfing.';
const CSS = new URL('../catsurf.e2265c3a.css?v=1', import.meta.url).href;
const CAT = new URL('../../../models/cat.e2265c3a.glb', import.meta.url).href;
const BOARD = new URL('../../../models/surfboard.e2265c3a.glb', import.meta.url).href;
const NORMALS = new URL('../../../vendor/three/examples/textures/waternormals.jpg', import.meta.url).href;
const GLTF = '../../../vendor/three/examples/jsm/loaders/GLTFLoader.js';
const WATER = '../../../vendor/three/examples/jsm/objects/Water.js';
const SKY = '../../../vendor/three/examples/jsm/objects/Sky.js';

const LEN = 8;            // the video's length in seconds: the playhead, and what the download records
const V0 = 1.2;           // the video time the first frame shows (a clean composition for the generating reveal)
const W = 960, H = 540;   // the render's pixel size (16:9)
const FOV = 38;
const SUN = { elev: 6, az: 262 }; // golden hour: low, ahead of the camera and off to its left
const CAT_LEN = 0.95;     // the cat's length along the board, in world units
const BOARD_LEN = 2.5;
const JUMP = { at: 5.0, up: 0.5, hop: 0.34 }; // the hop: starts at vt = at, takes `up` seconds, lifts `hop` units
const TS = 3.0;           // how much faster the water's normal map scrolls than video time

// the swell: sum of shaped sine waves (one source for the board's ride and the ocean's vertex shader). phase =
// k (dx x + dz z) - w t; the crest is sharpened by s = 0.5 + 0.5 sin(phase), h = A (2 s^2 - 0.67). `fade` waves die out with distance
const WAVES = [
  { dx: -0.93, dz: 0.37, k: 0.5, w: 1.6, a: 0.34, fade: false },
  { dx: -0.72, dz: 0.69, k: 1.1, w: 2.1, a: 0.12, fade: false },
  { dx: -0.3, dz: -0.95, k: 2.4, w: 2.9, a: 0.035, fade: true },
];
const swellAt = (x, z, t) => {
  let h = 0, gx = 0, gz = 0;
  for (const o of WAVES) {
    const ph = o.k * (o.dx * x + o.dz * z) - o.w * t;
    const s = 0.5 + 0.5 * Math.sin(ph);
    h += o.a * (2 * s * s - 0.67);
    const dp = 2 * o.a * s * Math.cos(ph);
    gx += dp * o.k * o.dx; gz += dp * o.k * o.dz;
  }
  return { h, gx, gz };
};
const glslNum = (n) => (Number.isInteger(n) ? n.toFixed(1) : String(n));
const SWELL_GLSL = `
vec3 swell( vec2 p, float t ) {
  vec3 r = vec3( 0.0 );
  float fd = 1.0 - smoothstep( 10.0, 36.0, length( p ) );
  float ph, s, dp;
${WAVES.map((o) => `  ph = ${glslNum(o.k)} * ( ${glslNum(o.dx)} * p.x + ${glslNum(o.dz)} * p.y ) - ${glslNum(o.w)} * t;
  s = 0.5 + 0.5 * sin( ph );
  r.x += ${glslNum(o.a)} * ( 2.0 * s * s - 0.67 )${o.fade ? ' * fd' : ''};
  dp = 2.0 * ${glslNum(o.a)} * s * cos( ph )${o.fade ? ' * fd' : ''};
  r.y += dp * ${glslNum(o.k * o.dx)};
  r.z += dp * ${glslNum(o.k * o.dz)};`).join('\n')}
  return r;
}`;

const mulberry32 = (a) => () => {
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// the hop's envelope: 0 on the water, 1 at the top
const hopAt = (vt) => { const p = (vt - JUMP.at) / JUMP.up; return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); };

// ---- the render: one WebGL canvas, drawn by paint(vt) ----------------------------------------------------------------
async function setup(canvas) {
  const THREE = await import('three');
  const [{ GLTFLoader }, { Water }, { Sky }] = await Promise.all([import(GLTF), import(WATER), import(SKY)]);
  const loader = new GLTFLoader();
  const [catGltf, boardGltf, normals] = await Promise.all([
    loader.loadAsync(CAT), loader.loadAsync(BOARD), new THREE.TextureLoader().loadAsync(NORMALS),
  ]);
  normals.wrapS = normals.wrapT = THREE.RepeatWrapping;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.52;

  const scene = new THREE.Scene();
  const sun = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - SUN.elev), THREE.MathUtils.degToRad(SUN.az));

  // sky
  const sky = new Sky();
  sky.scale.setScalar(10000);
  const su = sky.material.uniforms;
  su.turbidity.value = 4;
  su.rayleigh.value = 1.6;
  su.mieCoefficient.value = 0.006;
  su.mieDirectionalG.value = 0.9;
  su.sunPosition.value.copy(sun);
  scene.add(sky);

  // ocean: one big plane whose vertices bunch up around the board, rolled by the shared swell
  const N = 300, SPAN = 1500;
  const geo = new THREE.PlaneGeometry(2, 2, N, N);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const a = pos.getX(i), b = pos.getY(i);
    pos.setXY(i, SPAN * Math.sign(a) * Math.pow(Math.abs(a), 3), SPAN * Math.sign(b) * Math.pow(Math.abs(b), 3));
  }
  geo.computeBoundingSphere();
  geo.boundingSphere.radius = SPAN * 2;
  const water = new Water(geo, {
    textureWidth: 512, textureHeight: 512, waterNormals: normals,
    sunDirection: sun.clone().normalize(), sunColor: 0xffd6a0, waterColor: 0x0f5a60, distortionScale: 2.2,
  });
  water.rotation.x = -Math.PI / 2;
  water.frustumCulled = false;
  const wm = water.material;
  wm.uniforms.size.value = 5;
  wm.uniforms.uWake = { value: new THREE.Vector3(0, 0, 0) };
  wm.vertexShader = wm.vertexShader
    .replace('varying vec4 worldPosition;', `varying vec4 worldPosition;\nvarying vec3 vSwell;\n${SWELL_GLSL}`)
    .replace('mirrorCoord = modelMatrix * vec4( position, 1.0 );', `vec4 flat0 = modelMatrix * vec4( position.xy, 0.0, 1.0 );
          vSwell = swell( flat0.xz, time / ${TS.toFixed(1)} );
          mirrorCoord = modelMatrix * vec4( position.xy, vSwell.x, 1.0 );`)
    .replace('vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );', 'vec4 mvPosition = modelViewMatrix * vec4( position.xy, vSwell.x, 1.0 );');
  wm.fragmentShader = wm.fragmentShader
    .replace('varying vec4 worldPosition;', 'varying vec4 worldPosition;\nvarying vec3 vSwell;\nuniform vec3 uWake;')
    .replace('vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );', `vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );
          surfaceNormal = normalize( surfaceNormal + vec3( -vSwell.y, 0.0, -vSwell.z ) * 0.9 );`)
    .replace('gl_FragColor = vec4( outgoingLight, alpha );', `
          float crest = smoothstep( 0.36, 0.6, vSwell.x + noise.x * 0.07 );
          float along = uWake.x - worldPosition.x;
          float across = worldPosition.z - uWake.z;
          float wake = smoothstep( 0.35, 1.0, along ) * exp( -along * 0.42 ) * exp( -across * across / ( 0.12 + 0.1 * along ) );
          float foam = clamp( crest * 0.5 + wake * ( 0.65 + noise.y * 0.7 ), 0.0, 0.88 );
          outgoingLight = max( outgoingLight, waterColor * 0.55 );
          outgoingLight = mix( outgoingLight, vec3( 0.98, 0.94, 0.86 ), foam );
          gl_FragColor = vec4( outgoingLight, alpha );`);
  // the mirror pass sees the sky only: the surfer sits above the flat mirror plane the Water class reflects, so its
  // reflection would land in the wrong place on a rolling surface (the wake foam grounds the board instead)
  const mirror = water.onBeforeRender;
  water.onBeforeRender = function (...a) { subject.visible = false; mirror.apply(this, a); subject.visible = true; };
  scene.add(water);

  // light: the low sun is ahead of the camera, so the subject is rim lit; a warm fill from the camera side and a
  // sky hemisphere keep the cat readable
  scene.add(new THREE.HemisphereLight(0xcfe0ff, 0xc89a68, 1.5));
  const key = new THREE.DirectionalLight(0xffc88a, 3.2);
  key.position.copy(sun).multiplyScalar(20);
  const fill = new THREE.DirectionalLight(0xffe2c0, 1.9);
  fill.position.set(5, 3, 5);
  scene.add(key, fill);

  // the board: Geldvillager's CC0 snowboard recoloured as a surfboard (cream deck, one coral stripe, teal rail), long axis on x
  const board = boardGltf.scene;
  const bb = new THREE.Box3().setFromObject(board);
  const bs = bb.getSize(new THREE.Vector3());
  const boardLong = Math.max(bs.x, bs.z);
  board.scale.setScalar(BOARD_LEN / boardLong);
  board.updateMatrixWorld(true);
  const bb2 = new THREE.Box3().setFromObject(board);
  const bc = bb2.getCenter(new THREE.Vector3());
  board.position.set(-bc.x, -bb2.max.y, -bc.z);
  const boardHolder = new THREE.Group();
  boardHolder.add(board);
  if (bs.z > bs.x) boardHolder.rotation.y = Math.PI / 2;
  board.traverse((o) => {
    if (!o.isMesh) return;
    o.frustumCulled = false;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m, i) => {
      if (i === 0) {
        m.color.set(0xf3e7cc);
        m.roughness = 0.45;
        m.metalness = 0;
        m.onBeforeCompile = (sh) => {
          sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vLocal;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocal = position;');
          sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vLocal;')
            .replace('#include <color_fragment>', `#include <color_fragment>
              float stripe = 1.0 - smoothstep( 0.0, 0.0004, abs( vLocal.x - 0.0035 ) - 0.0013 );
              diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.93, 0.36, 0.28 ), stripe );`);
        };
      } else {
        m.color.set(0x1d8f8f);
        m.roughness = 0.4;
      }
    });
  });

  // the cat: normalised to CAT_LEN along its heading, feet on the deck, head toward +x
  const cat = catGltf.scene;
  cat.updateMatrixWorld(true);
  const head = cat.getObjectByName('Head'), tail = cat.getObjectByName('Tail');
  const hp = head.getWorldPosition(new THREE.Vector3()), tp = tail.getWorldPosition(new THREE.Vector3());
  const heading = Math.atan2(hp.z - tp.z, hp.x - tp.x);
  const cb = new THREE.Box3().setFromObject(cat);
  const cs = cb.getSize(new THREE.Vector3());
  const ck = CAT_LEN / Math.max(cs.x, cs.z);
  const catHolder = new THREE.Group();
  const catFit = new THREE.Group();
  catFit.add(cat);
  catFit.scale.setScalar(ck);
  catFit.rotation.y = heading;
  catHolder.add(catFit);
  catHolder.updateMatrixWorld(true);
  const cb2 = new THREE.Box3().setFromObject(catHolder);
  const cc = cb2.getCenter(new THREE.Vector3());
  catFit.position.set(-cc.x, -cb2.min.y + 0.012, -cc.z);
  cat.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; if (o.material.map) o.material.map.anisotropy = 4; o.material.roughness = 0.85; o.material.metalness = 0; } });
  catHolder.position.x = 0.12;

  const surf = new THREE.Group();
  surf.add(boardHolder, catHolder);
  const subject = new THREE.Group(); // everything above the water: the board, the cat and the spray
  subject.add(surf);
  scene.add(subject);

  // clips: Idle runs the whole ride, Jump_Loop is blended in for the hop. Every action's time is set from vt each frame
  const mixer = new THREE.AnimationMixer(cat);
  const clip = (name) => catGltf.animations.find((c) => c.name.endsWith(`|${name}`));
  const idleClip = clip('Idle'), jumpClip = clip('Jump_Loop');
  const idle = mixer.clipAction(idleClip), jump = mixer.clipAction(jumpClip);
  idle.play(); jump.play();

  // spray: seeded sprites leaving the tail, each a pure function of vt (its age is fract(vt * rate + seed))
  const rnd = mulberry32(0xe2265c3a);
  const COUNT = 260, LIFE = 1.15;
  const seeds = Array.from({ length: COUNT }, () => ({ s: rnd(), a: rnd(), b: rnd(), c: rnd(), d: rnd() }));
  const sprayPos = new Float32Array(COUNT * 3), sprayCol = new Float32Array(COUNT * 3);
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));
  sg.setAttribute('color', new THREE.BufferAttribute(sprayCol, 3));
  const dot = document.createElement('canvas');
  dot.width = dot.height = 64;
  const g2 = dot.getContext('2d');
  const grad = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g2.fillStyle = grad;
  g2.fillRect(0, 0, 64, 64);
  const spray = new THREE.Points(sg, new THREE.PointsMaterial({
    size: 0.17, map: new THREE.CanvasTexture(dot), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  spray.frustumCulled = false;
  subject.add(spray);

  const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.05, 40000);
  const tgt = new THREE.Vector3(), cp = new THREE.Vector3();
  const eul = new THREE.Euler();

  function placeBoard(vt) {
    const t = vt;
    const at = swellAt(0, 0, t), nose = swellAt(1.1, 0, t), tl = swellAt(-1.1, 0, t), side = swellAt(0, 0.4, t), side2 = swellAt(0, -0.4, t);
    const j = hopAt(vt);
    const hop = JUMP.hop * j;
    const carve = 0.13 * Math.sin(0.9 * vt + 0.5);
    // planing: the deck rides between the water under its middle and the highest water under it, so it skims the face
    const top = Math.max(at.h, nose.h, tl.h, side.h, side2.h);
    surf.position.set(0, lerp(at.h, top, 0.7) + 0.08 + hop, 0);
    // the board follows the water's slope: pitch from the run along x, roll from the slope across it, plus a carve and a hop lean
    eul.set(Math.atan2(side2.h - side.h, 0.8) * 0.9 + 0.04 * Math.sin(1.3 * vt), carve, Math.atan2(nose.h - tl.h, 2.2) * 0.85 - 0.05 * j, 'YXZ');
    surf.rotation.copy(eul);
    // the cat leans into the carve and crouches a touch on the way up the face
    catHolder.rotation.set(-carve * 0.5, 0, 0.03 * Math.sin(1.7 * vt));
    return at.h;
  }

  function placeSpray(vt) {
    for (let i = 0; i < COUNT; i++) {
      const o = seeds[i];
      const ph = ((vt / LIFE) * 1.0 + o.s) % 1;
      const age = ph * LIFE;
      const te = vt - age;
      const eh = swellAt(0, 0, te).h;
      const j = hopAt(te);
      const ex = -1.05 - o.a * 0.25, ez = (o.b - 0.5) * 0.4;
      const vx = -1.0 - 1.6 * o.c, vy = 0.5 + 1.1 * o.d, vz = (o.a - 0.5) * 1.6;
      sprayPos[i * 3] = ex + vx * age;
      sprayPos[i * 3 + 1] = Math.max(eh + 0.05, eh + 0.05 + JUMP.hop * j + vy * age - 2.2 * age * age);
      sprayPos[i * 3 + 2] = ez + vz * age;
      const f = Math.sin(Math.PI * ph) * (1 - ph) * 1.5;
      sprayCol[i * 3] = f; sprayCol[i * 3 + 1] = f * 0.97; sprayCol[i * 3 + 2] = f * 0.9;
    }
    sg.attributes.position.needsUpdate = true;
    sg.attributes.color.needsUpdate = true;
  }

  return (vt) => {
    const t = vt;
    placeBoard(vt);
    // clips: the hop blends Jump_Loop over Idle
    const j = hopAt(vt);
    idle.time = vt % idleClip.duration;
    jump.time = (vt - JUMP.at) / JUMP.up * jumpClip.duration % jumpClip.duration;
    if (jump.time < 0) jump.time += jumpClip.duration;
    idle.setEffectiveWeight(1 - j);
    jump.setEffectiveWeight(j);
    mixer.update(0);
    placeSpray(vt);
    wm.uniforms.time.value = vt * TS;
    wm.uniforms.uWake.value.set(surf.position.x, 0, surf.position.z);
    // the camera drifts around the board and rises and falls on the swell
    const az = 0.62 + 0.14 * Math.sin(0.5 * t), rad = 3.7 + 0.3 * Math.sin(0.37 * t + 1.0), hgt = 1.2 + 0.12 * Math.sin(0.8 * t + 0.4);
    cp.set(Math.cos(az) * rad, hgt + surf.position.y * 0.6, Math.sin(az) * rad);
    tgt.set(0.2, 0.32 + surf.position.y * 0.7, 0);
    camera.position.copy(cp);
    camera.lookAt(tgt);
    renderer.render(scene, camera);
  };
}

// one viewer per canvas: draw(vt) paints when vt changes; ready settles once the first frame can be drawn
export function makeCatSurfViewer(canvas) {
  let paint = null, want = null, lastKey = '';
  const draw = (vt) => {
    want = vt;
    if (!paint) return;
    const key = vt.toFixed(4);
    if (key === lastKey) return;
    lastKey = key;
    paint(vt);
  };
  const ready = setup(canvas).then((fn) => { paint = fn; if (want !== null) draw(want); });
  ready.catch((e) => console.error('cat surfing renderer failed to load', e));
  return { ready, draw, redraw() { lastKey = ''; if (want !== null) draw(want); } };
}

// ---- the beat ---------------------------------------------------------------------------------------------------
const PAUSE = '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
const SAVE = '<svg viewBox="0 0 24 24"><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

let sheet = null;
function loadSheet() {
  if (sheet) return;
  sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = CSS;
  track(new Promise((done) => {
    sheet.onload = done;
    sheet.onerror = () => { console.error(new Error(`cat surfing stylesheet failed to load: ${CSS}`)); done(); };
  }));
  document.head.appendChild(sheet);
}

export default {
  // `end` is the base route's end (chat.9b47fc30.js routeBy), so the loop never changes length with the variant
  times(r, end = r + 2.35) {
    const T = { r };
    T.card = r + 0.22;
    T.w0 = r + 0.3; T.w1 = T.w0 + 1.0;
    T.play = T.w1 + 0.15;
    T.end = end;
    return T;
  },
  build(k, x) {
    loadSheet();
    const T = k.T;
    const say = x.el(`<div class="qc-say"><span class="qc-vis"></span><span class="qc-hid">${x.esc(SAY)}</span></div>`);
    const block = x.el(`<div class="cs">
      <div class="cs-player">
        <canvas class="cs-canvas" width="${W}" height="${H}" role="img" aria-label="A cat surfing a wave at golden hour"></canvas>
        <i class="cs-sh"></i>
        <span class="cs-len">0:08</span>
        <div class="cs-ctl"><div class="cs-bar"><i class="cs-played"></i><i class="cs-dot"></i></div>
          <div class="cs-row">${PAUSE}<span class="cs-time"></span><button type="button" class="cs-save" aria-label="Download video">${SAVE}</button></div></div>
        <span class="qc-genl">${x.tile('gemini')}Generating video<b class="qc-genn"></b></span>
        <i class="cs-prog"><i></i></i>
      </div>
      <div class="cs-t"><b>A cat surfing at golden hour</b><small>8 second video, 16:9</small></div>
    </div>`);
    const $ = (s) => block.querySelector(s);
    const canvas = $('.cs-canvas'), sh = $('.cs-sh'), len = $('.cs-len'), ctl = $('.cs-ctl');
    const played = $('.cs-played'), dot = $('.cs-dot'), time = $('.cs-time'), genl = $('.qc-genl'), pct = $('.qc-genn');
    const prog = $('.cs-prog'), progFill = prog.firstElementChild, save = $('.cs-save');
    const vis = say.firstElementChild, hid = say.lastElementChild;
    let viewer = null, shown = -1, built = -1, sec = -1, recording = false;
    const ensure = () => {
      if (!viewer) { viewer = makeCatSurfViewer(canvas); track(viewer.ready); }
      return viewer;
    };

    // The download: draw the video's own clock for LEN seconds into the canvas while a MediaRecorder watches its
    // stream, then hand back the webm. The page's clock does not draw into the canvas meanwhile.
    function record() {
      if (recording) return Promise.reject(new Error('already recording'));
      recording = true;
      const v = ensure();
      return v.ready.then(() => new Promise((resolve, reject) => {
        const type = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m));
        if (!type) { recording = false; reject(new Error('this browser cannot record webm')); return; }
        const stream = canvas.captureStream(30);
        const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 6e6 });
        const parts = [];
        rec.ondataavailable = (e) => { if (e.data.size) parts.push(e.data); };
        rec.onerror = (e) => { recording = false; reject(e.error || new Error('recording failed')); };
        rec.onstop = () => { recording = false; stream.getTracks().forEach((tr) => tr.stop()); v.redraw(); resolve(new Blob(parts, { type: 'video/webm' })); };
        const t0 = performance.now();
        const step = () => {
          const el = (performance.now() - t0) / 1000;
          if (el >= LEN) { rec.stop(); return; }
          v.draw(V0 + el);
          requestAnimationFrame(step);
        };
        v.draw(V0);
        rec.start();
        requestAnimationFrame(step);
      }));
    }
    window.__catsurfRecord = record;
    save.addEventListener('click', () => {
      if (recording) return;
      save.classList.add('cs-busy');
      save.setAttribute('aria-busy', 'true');
      record().then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'cat-surfing.webm';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }).catch((e) => console.error('cat surfing download failed', e)).finally(() => {
        save.classList.remove('cs-busy');
        save.removeAttribute('aria-busy');
      });
    });

    return {
      nodes: [say, block],
      marks: [[T.r, say], [T.card, block]],
      render(t) {
        const n = Math.min(SAY.length, Math.max(0, Math.floor((t - (T.r + 0.06)) * 70 + 1e-6)));
        if (n !== shown) { vis.textContent = SAY.slice(0, n); hid.textContent = SAY.slice(n); shown = n; }
        const ci = outCubic(seg(t, T.card, T.card + 0.45));
        block.style.opacity = ci.toFixed(3);
        block.style.transform = ci >= 1 ? 'none' : `translateY(${((1 - ci) * 14).toFixed(2)}px) scale(${lerp(0.96, 1, ci).toFixed(4)})`;

        // the video's clock: the first frame holds while it generates, then plays from T.play and loops every LEN seconds
        const el = Math.max(0, t - T.play);
        if (!recording) ensure().draw(V0 + (el % LEN));

        // generating: the skeleton shimmers and the first frame resolves out of a blur as the count reaches 100
        const rp = seg(t, T.w0, T.w1), e = outCubic(rp);
        canvas.style.filter = e >= 1 ? 'none' : `blur(${((1 - e) * 16).toFixed(2)}px) saturate(${lerp(0.3, 1, e).toFixed(3)})`;
        canvas.style.opacity = lerp(0.25, 1, e).toFixed(3);
        sh.style.transform = `translateX(${lerp(-110, 110, ((t - T.card) * 1.1) % 1).toFixed(1)}%)`;
        sh.style.opacity = (rp >= 1 ? 0 : 1 - seg(rp, 0.8, 1)).toFixed(3);
        const p = Math.round(rp * 100);
        if (p !== built) { pct.textContent = `${p}%`; built = p; }
        const label = (1 - seg(t, T.w1 - 0.25, T.w1)).toFixed(3);
        genl.style.opacity = label;
        prog.style.opacity = label;
        progFill.style.transform = `scaleX(${rp.toFixed(3)})`;

        // playing: the controls rise, the playhead runs the clip
        const pl = outCubic(seg(t, T.play, T.play + 0.25));
        ctl.style.opacity = pl.toFixed(3);
        len.style.opacity = (seg(t, T.w1 - 0.1, T.w1 + 0.15) * (1 - pl)).toFixed(3);
        const head = ((el % LEN) / LEN) * 100;
        played.style.width = `${head.toFixed(3)}%`;
        dot.style.left = `${head.toFixed(3)}%`;
        const s = Math.floor(el % LEN);
        if (s !== sec) { time.textContent = `${clock(s)} / ${clock(LEN)}`; sec = s; }
      },
    };
  },
};
