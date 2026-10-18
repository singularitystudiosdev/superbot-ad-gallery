// render-montage.mjs <ar> <t0> <t1> <outdir> [mode=montage|end] [fps=30]
// Frame-exact capture of a hacker variant (VARIANT: 'hacker' by default, or 'hacker-hello') (a pure function of t: window.__AD.seek). Pass 1 measures, per frame, the
// newest answer card and its ask bubble; a zero-phase smoothed camera frames them (zoom 1..ZMAX). Pass 2 captures each
// frame whole at one fixed scale, ZMAX x the output's px per stage px (m_*.png), so the closest crop is still drawn at
// full resolution; camera.py then cuts each frame's crop out with sub-pixel precision (f_*.png). (Capturing each crop at
// its own zoom let Chrome round its origin and size to whole pixels and snap images apart from text: a still camera
// shook.) The x150 badge is hidden and its opacity logged, to be drawn by the edit in the final frame's corner. mode=end
// hides the chat (the end card over black) and, its camera still, captures its one crop directly.
// The camera's card at each moment is the variant's own `focus` list (its cues), else the 'hacker' cut's four cards.
// BASE: where the repo is served (default http://127.0.0.1:8737); VARIANT: the variant to capture; CHROME: an installed Chrome to drive instead of
// Playwright's own build (the cuts here were drawn by /Applications/Google Chrome.app); PY: the python3 camera.py runs on
// (numpy and opencv-python).
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [ar, t0s, t1s, out, mode = 'montage', fpsS = '30'] = process.argv.slice(2);
// the stage is ar.js's (1080 high, the ratio's width); a narrow ratio's frames come out at X's size for it (OUT output
// px per stage px: 9:16 1080x1920, 4:5 1440x1800), rasterized at DPR 2 x OUT so the scale-up stays sharp
const W = { '16x9': 1920, '1x1': 1080, '4x5': 864, '9x16': 608 }[ar];
const OUT = { '16x9': 1, '1x1': 1, '4x5': 1800 / 1080, '9x16': 1920 / 1080 }[ar]; // 4:5 at X's 1440x1800
const FPS = +fpsS, t0 = +t0s, t1 = +t1s, H = 1080, DPR = 2 * OUT, ZMAX = 1.7, MASTER = ZMAX * OUT;
const BASE = process.env.BASE || 'http://127.0.0.1:8737';
const VARIANT = process.env.VARIANT || 'hacker';
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true, ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}), args: ['--use-angle=metal', '--enable-gpu', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: mode === 'end' ? DPR : MASTER });
page.on('pageerror', (e) => console.error('pageerror', e.message));
await page.goto(`${BASE}/animations/gemini-muse-meme-superbot-6fbc38f8/?variant=${VARIANT}&ar=${ar}&t=0`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__AD && window.__AD.ready, null, { timeout: 120000 });
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: `#s-tabs .hk-ff{visibility:hidden!important}${mode === 'end' ? '#s-tabs .sbsite{visibility:hidden!important}' : ''}` });
const cues = await page.evaluate((v) => window.__HACKER_CUES[v], VARIANT);
fs.writeFileSync(path.join(out, 'cues.json'), JSON.stringify(cues, null, 1));

// warm-up: every bitmap decoded and the 3D viewer drawn before frame 0
await page.evaluate(async ([a, b]) => {
  for (let t = a; t <= b + 1e-6; t += 0.25) {
    window.__AD.seek(t);
    await Promise.all([...document.querySelectorAll('#stage img')].map((im) => im.decode().catch(() => {})));
    await new Promise(requestAnimationFrame);
  }
}, [t0, t1]);

const N = Math.round((t1 - t0) * FPS);
const seek = (t) => page.evaluate(async (t) => { window.__AD.seek(t); await new Promise(requestAnimationFrame); }, t);

// pass 1: what the camera should frame
const meta = [];
for (let i = 0; i < N; i++) {
  const t = t0 + i / FPS;
  await seek(t);
  meta.push(await page.evaluate(({ t, cues }) => {
    const box = (n) => { if (!n || !n.offsetParent) return null; const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
    const c0 = cues.calls - 0.05;
    let sel = t >= cues.apps - 0.1 ? '.hk-apps' : t >= cues.models ? '.hk-3d' : t >= cues.images ? '.hk-img' : t >= c0 ? '.hk-call' : null;
    if (cues.focus) { sel = null; for (const [at, s] of cues.focus) if (t >= at) sel = s; }
    const card = sel && document.querySelector(sel);
    let parts = [];
    if (card) {
      const msg = card.closest('.msg');
      parts.push(box(msg));
      // the ask bubble that card answers: the nearest visible user message before it
      let p = msg.previousElementSibling;
      while (p && !(p.classList.contains('qc-u') && p.offsetParent)) p = p.previousElementSibling;
      if (p) parts.push(box(p));
      // and the next ask once it is sent (its bubble rises under the card)
      let q = msg.nextElementSibling;
      while (q && !(q.classList.contains('qc-u') && q.offsetParent)) q = q.nextElementSibling;
      if (q && +getComputedStyle(q).opacity > 0.05) parts.push(box(q));
      // and the composer, so the frame always rests on the chat's bottom edge and shows the next ask typing
      parts.push(box(document.querySelector('#s-tabs .composer')));
    } else {
      parts.push(box(document.querySelector('#s-tabs .composer')));
      const hero = document.querySelector('#s-tabs .ask-hero');
      if (hero && +getComputedStyle(hero).opacity > 0.2) parts.push(box(hero));
    }
    parts = parts.filter(Boolean);
    const x0 = Math.min(...parts.map((b) => b.x)), y0 = Math.min(...parts.map((b) => b.y));
    const x1 = Math.max(...parts.map((b) => b.x + b.w)), y1 = Math.max(...parts.map((b) => b.y + b.h));
    const ff = document.querySelector('#s-tabs .hk-ff');
    return { t, focus: sel, x0, y0, x1, y1, ff: ff ? +ff.style.opacity || 0 : 0 };
  }, { t, cues }));
}

// the camera: fit the focus box with a margin, zoom 1..ZMAX, then a zero-phase smoothing pass so it eases between cards
const cam = meta.map((m) => {
  if (mode === 'end') return { cx: W / 2, cy: H / 2, z: 1 };
  const bw = m.x1 - m.x0 + 120, bh = m.y1 - m.y0 + 110;
  const z = Math.max(1, Math.min(ZMAX, (W * 0.94) / bw, (H * 0.92) / bh));
  // horizontally the camera holds the thread's centre (the frame's): only its push and its height follow the cards
  return { cx: W / 2, cy: (m.y0 + m.y1) / 2, z };
});
const smooth = (key, tau) => {
  const a = 1 - Math.exp(-1 / (FPS * tau));
  const f = cam.map((c) => c[key]);
  for (let i = 1; i < f.length; i++) f[i] = f[i - 1] + a * (f[i] - f[i - 1]);
  for (let i = f.length - 2; i >= 0; i--) f[i] = f[i + 1] + a * (f[i] - f[i + 1]);
  f.forEach((v, i) => { cam[i][key] = v; });
};
smooth('cx', 0.16); smooth('cy', 0.16); smooth('z', 0.2);
const crops = cam.map(({ cx, cy, z }) => {
  const w = W / z, h = H / z;
  const x = Math.min(Math.max(cx - w / 2, 0), W - w), y = Math.min(Math.max(cy - h / 2, 0), H - h);
  return { x, y, w, h, z };
});
fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify(meta.map((m, i) => ({ ...m, crop: crops[i] }))));

// pass 2: the end card's one still crop, or every montage frame whole at the master scale for camera.py
const cdp = await page.context().newCDPSession(page);
const t00 = Date.now();
for (let i = 0; i < N; i++) {
  await seek(t0 + i / FPS);
  const c = crops[i];
  const shot = mode === 'end'
    ? { format: 'png', clip: { x: c.x, y: c.y, width: c.w, height: c.h, scale: c.z * OUT }, optimizeForSpeed: true }
    : { format: 'png', optimizeForSpeed: true };
  const { data } = await cdp.send('Page.captureScreenshot', shot);
  fs.writeFileSync(path.join(out, `${mode === 'end' ? 'f' : 'm'}_${String(i).padStart(4, '0')}.png`), Buffer.from(data, 'base64'));
  if (i % 60 === 0) console.log(`${i}/${N} ${((Date.now() - t00) / 1000).toFixed(0)}s`);
}
await browser.close();
if (mode !== 'end') {
  const cam = spawnSync(process.env.PY || 'python3', ['-I', path.join(path.dirname(fileURLToPath(import.meta.url)), 'camera.py'), out, ar, String(W), String(H)], { stdio: 'inherit' });
  if (cam.status !== 0) throw new Error(`camera.py failed (${cam.status})`);
}
console.log(`done ${N} frames`);
