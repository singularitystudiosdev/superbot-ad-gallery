// capture.mjs <mode montage|end|audio> <t0> <t1> <outdir> [fps=60]
// Frame-exact capture of the 'cats-chatbot' variant of the muse meme spot (a pure function of t: window.__AD.seek), for the
// film compose.py cuts. montage: pass 1 measures, per frame, the card in focus (window.__CATS_CUES.focus, set by
// beats/cats.70783379.js), its ask bubble, the next ask once sent and the composer; a zero-phase smoothed camera frames
// them (zoom 1..ZMAX, the hacker montage's camera, ads-src/hacker-announcement-7dfcf32a/render-montage.mjs). Pass 2 captures
// each frame whole at ZMAX x scale (m_*.png) and camera.py cuts each crop out with sub-pixel precision (f_*.png). The x50
// badge is hidden and its opacity logged (meta.json `ff`), to be drawn by the edit at the output's own corner. end: the
// chat hidden (the end card over black), captured whole at 1920x1080. audio: the variant's whole soundtrack
// (window.__EXPORT_AUDIO['cats-chatbot'], the page's own v16 score with the song laid in) as a 48 kHz float WAV; t0 and t1
// are ignored. BASE: where the gallery repo is served (default http://127.0.0.1:8795); PY: the python camera.py runs on.
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [mode, t0s, t1s, out, fpsS = '60'] = process.argv.slice(2);
const W = 1920, H = 1080, FPS = +fpsS, t0 = +t0s, t1 = +t1s, ZMAX = 1.7;
const BASE = process.env.BASE || 'http://127.0.0.1:8795';
const VARIANT = 'cats-chatbot';
const HERE = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--enable-gpu', '--force-color-profile=srgb'] });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: mode === 'montage' ? ZMAX : 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('console.error', m.text().slice(0, 300)); });
  await page.goto(`${BASE}/animations/gemini-muse-meme-superbot-6fbc38f8/?variant=${VARIANT}&ar=16x9&t=0`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__AD && window.__AD.ready && window.__CATS_CUES, null, { timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  const cues = await page.evaluate(() => window.__CATS_CUES);
  fs.writeFileSync(path.join(out, 'cues.json'), JSON.stringify({ ...cues, cycle: await page.evaluate(() => window.__AD.CYCLE) }, null, 1));

  if (mode === 'audio') {
    const { b64, len, peak } = await page.evaluate(async (v) => {
      const buf = await window.__EXPORT_AUDIO[v]();
      const L = buf.getChannelData(0), R = buf.getChannelData(1), n = buf.length;
      const pcm = new Float32Array(n * 2);
      let peak = 0;
      for (let i = 0; i < n; i++) { pcm[2 * i] = L[i]; pcm[2 * i + 1] = R[i]; peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
      const bytes = new Uint8Array(pcm.buffer);
      let s = '';
      for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode(...bytes.subarray(i, i + 32768));
      return { b64: btoa(s), len: n, peak };
    }, VARIANT);
    const pcm = Buffer.from(b64, 'base64'), SR = 48000;
    const head = Buffer.alloc(44);
    head.write('RIFF', 0); head.writeUInt32LE(36 + pcm.length, 4); head.write('WAVE', 8);
    head.write('fmt ', 12); head.writeUInt32LE(16, 16); head.writeUInt16LE(3, 20); head.writeUInt16LE(2, 22);
    head.writeUInt32LE(SR, 24); head.writeUInt32LE(SR * 8, 28); head.writeUInt16LE(8, 32); head.writeUInt16LE(32, 34);
    head.write('data', 36); head.writeUInt32LE(pcm.length, 40);
    fs.writeFileSync(path.join(out, 'chat.wav'), Buffer.concat([head, pcm]));
    console.log(`audio ${(len / SR).toFixed(3)} s, peak ${(20 * Math.log10(peak)).toFixed(2)} dBFS`);
  } else {
    await page.addStyleTag({ content: `#s-tabs .mc-ff{visibility:hidden!important}${mode === 'end' ? '#s-tabs .sbsite{visibility:hidden!important}' : ''}` });
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
      meta.push(await page.evaluate(({ t, focus }) => {
        const box = (n) => { if (!n || !n.offsetParent) return null; const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
        let sel = null;
        for (const [at, s] of focus) if (t >= at) sel = s;
        // the shown variant's own: every chain builds its cards into the page, the others hidden (display: none), and several share
        // these classes (multicat's .mc-3d, .mc-dd, .mc-sg, .mc-ff), so the one laid out is the one
        const shown = (q) => [...document.querySelectorAll(`#s-tabs ${q}`)].find((n) => n.offsetParent);
        const card = sel && shown(sel);
        let parts = [];
        if (card && card.offsetParent) {
          const msg = card.closest('.msg');
          parts.push(box(msg));
          let p = msg.previousElementSibling;
          while (p && !(p.classList.contains('qc-u') && p.offsetParent)) p = p.previousElementSibling;
          if (p) parts.push(box(p));
          let q = msg.nextElementSibling;
          while (q && !(q.classList.contains('qc-u') && q.offsetParent)) q = q.nextElementSibling;
          if (q && +getComputedStyle(q).opacity > 0.05) parts.push(box(q));
          parts.push(box(document.querySelector('#s-tabs .composer')));
        } else {
          parts.push(box(document.querySelector('#s-tabs .composer')));
          const hero = document.querySelector('#s-tabs .ask-hero');
          if (hero && +getComputedStyle(hero).opacity > 0.2) parts.push(box(hero));
          // once the first ask is sent its bubble rises: frame it with the composer
          const u = [...document.querySelectorAll('#s-tabs .msg.qc-u')].find((n) => n.offsetParent && +getComputedStyle(n).opacity > 0.05);
          if (u) parts.push(box(u));
        }
        parts = parts.filter(Boolean);
        const x0 = Math.min(...parts.map((b) => b.x)), y0 = Math.min(...parts.map((b) => b.y));
        const x1 = Math.max(...parts.map((b) => b.x + b.w)), y1 = Math.max(...parts.map((b) => b.y + b.h));
        const ff = shown('.mc-ff');
        return { t, focus: sel, x0, y0, x1, y1, ff: ff ? +ff.style.opacity || 0 : 0 };
      }, { t, focus: cues.focus }));
    }
    // the camera: fit the focus box with a margin, zoom 1..ZMAX, then a zero-phase smoothing pass so it eases between cards;
    // horizontally it holds the thread's centre, only its push and its height follow the cards
    const cam = meta.map((m) => {
      if (mode === 'end') return { cx: W / 2, cy: H / 2, z: 1 };
      const bw = m.x1 - m.x0 + 120, bh = m.y1 - m.y0 + 110;
      return { cx: W / 2, cy: (m.y0 + m.y1) / 2, z: Math.max(1, Math.min(ZMAX, (W * 0.94) / bw, (H * 0.92) / bh)) };
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
      return { x: Math.min(Math.max(cx - w / 2, 0), W - w), y: Math.min(Math.max(cy - h / 2, 0), H - h), w, h, z };
    });
    fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify(meta.map((m, i) => ({ ...m, crop: crops[i] }))));

    // pass 2: the end card whole, or every montage frame whole at the master scale for camera.py
    const cdp = await page.context().newCDPSession(page);
    const tStart = Date.now();
    for (let i = 0; i < N; i++) {
      await seek(t0 + i / FPS);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
      fs.writeFileSync(path.join(out, `${mode === 'end' ? 'f' : 'm'}_${String(i).padStart(4, '0')}.png`), Buffer.from(data, 'base64'));
      if (i % 120 === 0) console.log(`${i}/${N} ${((Date.now() - tStart) / 1000).toFixed(0)}s`);
    }
    if (mode === 'montage') {
      const r = spawnSync(process.env.PY || 'python3', ['-I', path.join(HERE, 'camera.py'), out, String(W), String(H)], { stdio: 'inherit' });
      if (r.status !== 0) throw new Error(`camera.py failed (${r.status})`);
    }
    console.log(`done ${N} frames`);
  }
} finally {
  await browser.close();
}
