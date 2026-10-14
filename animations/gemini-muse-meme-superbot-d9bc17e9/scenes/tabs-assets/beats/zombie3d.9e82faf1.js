// The 3D variant's model viewer: one WebGL canvas drawing the zombie (models/zombie-3d.9e82faf1.glb) as Gemini
// "generates" it. draw({ build, spin, scan }) is a pure function of its arguments: `build` (0..1) raises a clipping
// plane from the feet to the head, solid below it and a Gemini-blue wireframe ghost above, with a scan ring at the
// cut; `spin` turns the turntable (radians); `scan` (0..1) fades the ghost and the ring once the build lands.
// three.js loads on first use, so the image variants never pay for it; `ready` settles once the first frame is drawn.
const CSS_W = 236, CSS_H = Math.round(236 * 1024 / 870); // the meme card's footprint (chat.css .qc-img), so the camera push frames it the same
const PIXEL_RATIO = 2.5;  // stays crisp under the stage scale and the camera push
const FOV = 28;
const VIEW_H = 1.34;      // world units visible top to bottom; the model is normalised to 1 unit tall
const GHOST = 0x8ab4f8, RING = 0xa8c7fa;

export function makeZombieViewer(canvas, url) {
  let paint = null, want = null, lastKey = '';
  const draw = (s) => {
    want = s;
    if (!paint) return;
    const key = `${s.build.toFixed(4)}|${s.spin.toFixed(4)}|${s.scan.toFixed(3)}`;
    if (key === lastKey) return;
    lastKey = key;
    paint(s);
  };
  const ready = setup(canvas, url).then((fn) => { paint = fn; if (want) draw(want); });
  ready.catch((e) => console.error('3D zombie viewer failed to load', e));
  return { ready, draw };
}

async function setup(canvas, url) {
  const THREE = await import('three');
  const { GLTFLoader } = await import('../../../vendor/three/examples/jsm/loaders/GLTFLoader.js');
  const gltf = await new GLTFLoader().loadAsync(url);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(PIXEL_RATIO);
  renderer.setSize(CSS_W, CSS_H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3a48, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(1.5, 2.5, 2.5);
  const rim = new THREE.DirectionalLight(RING, 1.6);
  rim.position.set(-2, 1.5, -2.5);
  scene.add(key, rim);

  // the model, 1 unit tall, feet on y = 0, centred on the turntable's axis
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3()), centre = box.getCenter(new THREE.Vector3());
  const k = 1 / size.y;
  model.scale.setScalar(k);
  model.position.set(-centre.x * k, -box.min.y * k, -centre.z * k);

  // the cut: `below` keeps y <= h on the solid model, `above` keeps y >= h on the wireframe ghost
  const below = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  const above = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const ghostMat = new THREE.MeshBasicMaterial({ color: GHOST, wireframe: true, transparent: true, depthWrite: false, clippingPlanes: [above] });
  const ghost = model.clone(true);
  ghost.traverse((o) => { if (o.isMesh) o.material = ghostMat; });
  model.traverse((o) => { if (o.isMesh) for (const m of [].concat(o.material)) m.clippingPlanes = [below]; });
  const turntable = new THREE.Group();
  turntable.add(model, ghost);
  scene.add(turntable);

  // the scan ring riding the cut, and a soft contact shadow under the feet
  const ringMat = new THREE.MeshBasicMaterial({ color: RING, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.004, 8, 96), ringMat);
  ring.rotation.x = Math.PI / 2;
  const discMat = new THREE.MeshBasicMaterial({ color: GHOST, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.46, 64), discMat);
  disc.rotation.x = -Math.PI / 2;
  const scanner = new THREE.Group();
  scanner.add(ring, disc);
  scene.add(scanner, contactShadow(THREE));

  const camera = new THREE.PerspectiveCamera(FOV, CSS_W / CSS_H, 0.01, 50);
  camera.position.set(0, 0.6, VIEW_H / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2))));
  camera.lookAt(0, 0.47, 0);

  return ({ build, spin, scan }) => {
    const h = THREE.MathUtils.lerp(-0.01, 1.01, build);
    below.constant = h;
    above.constant = -h;
    ghostMat.opacity = 0.42 * scan;
    ghost.visible = scan > 0.001;
    scanner.position.y = h;
    ringMat.opacity = 0.95 * scan;
    discMat.opacity = 0.14 * scan;
    scanner.visible = scan > 0.001;
    turntable.rotation.y = spin;
    renderer.render(scene, camera);
  };
}

function contactShadow(THREE) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,0.6)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  return shadow;
}
