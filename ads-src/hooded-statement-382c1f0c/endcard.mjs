// endcard.mjs <ar 16x9|1x1> <outdir> [probe|capture] [t0] [t1] [fps=30]
// The superbot.gg end card, taken from the muse meme spot's multidog-credits cut (the card with the mascot it ends on).
// probe: stills of the cut's last 7 s every 0.5 s, to find where the card starts (the chat fades out over 27.13-27.57 s).
// capture: frame-exact PNGs of [t0, t1) on the spot's own clock (window.__AD.seek), 1080 tall: work/end16, work/end1.
// BASE: where the repo is served (default http://127.0.0.1:8737); CHROME: an installed Chrome to drive instead of
// Playwright's own build (the renders here were drawn by /Applications/Google Chrome.app).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [ar, out, mode = 'probe', t0s, t1s, fpsS = '30'] = process.argv.slice(2);
const H = 1080, W = { '16x9': 1920, '1x1': 1080 }[ar], FPS = +fpsS;
const BASE = process.env.BASE || 'http://127.0.0.1:8737';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}), args: ['--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(`${BASE}/animations/gemini-muse-meme-superbot-6fbc38f8/?variant=multidog-credits&ar=${ar}&t=0`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__AD && window.__AD.ready, null, { timeout: 60000 });
const cycle = await page.evaluate(() => window.__AD.CYCLE);
console.log('CYCLE', cycle);
const seek = (t) => page.evaluate(async (t) => { window.__AD.seek(t); await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame); }, t);
if (mode === 'probe') {
  for (let t = Math.max(0, cycle - 7); t <= cycle + 0.001; t += 0.5) {
    await seek(t);
    await page.screenshot({ path: path.join(out, `p_${t.toFixed(2)}.png`) });
  }
} else {
  const t0 = +t0s, t1 = Math.min(+t1s, cycle);
  const n = Math.round((t1 - t0) * FPS);
  for (let i = 0; i < n; i++) {
    await seek(t0 + i / FPS);
    await page.screenshot({ path: path.join(out, `f_${String(i).padStart(4, '0')}.png`) });
  }
  console.log('frames', n);
}
await browser.close();
