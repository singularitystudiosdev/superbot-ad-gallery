// Renders the api key for subscriptions poster at every gallery ratio into
// <out>/<id>.<ar>.png (default out: assets/ads). Run from the repo root:
// `node ads-src/apikey-poster-ed0df872/render.mjs [outDir]`. The art board is
// 1080 tall and is captured at 1.25x, so every file is 1350 tall like the
// other posters (4:5 1080x1350, 16:9 2400x1350, 4:3 1800x1350, 1:1 1350x1350).
import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ID = 'apikey-for-subscriptions-poster-ed0df872';
const H = 1080;
const ARS = { '4x5': 4 / 5, '16x9': 16 / 9, '4x3': 4 / 3, '1x1': 1 };
const out = process.argv[2] || 'assets/ads';
const page = pathToFileURL(resolve('ads-src/apikey-poster-ed0df872/index.html')).href;

const browser = await chromium.launch();
for (const [key, r] of Object.entries(ARS)) {
  const w = Math.round(H * r);
  const p = await browser.newPage({ viewport: { width: w, height: H }, deviceScaleFactor: 1.25 });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('requestfailed', q => errs.push('reqfail ' + q.url()));
  await p.goto(page, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.dataset.fitted === '1');
  // the poster is the viewport, so any block past its edge (or a 24px safe margin) is a defect
  const boxes = await p.evaluate(() => [...document.querySelectorAll('.head, .key, .sub, .foot, .plans')]
    .filter(e => getComputedStyle(e).display !== 'none')
    .map(e => {
      const b = e.getBoundingClientRect();
      const out = b.left < 24 || b.top < 24 || b.right > innerWidth - 24 || b.bottom > innerHeight - 24;
      return { el: e.className, top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right), out };
    }));
  const head = await p.locator('.head').evaluate(e => getComputedStyle(e).fontSize);
  const file = `${out}/${ID}.${key}.png`;
  await p.screenshot({ path: file });
  const bad = boxes.filter(b => b.out).map(b => b.el);
  console.log(file, `${w}x${H}@1.25`, 'head', head, JSON.stringify(boxes.map(b => [b.el, b.top, b.bottom])),
    bad.length ? 'OVERFLOW ' + bad.join(',') : 'ok', errs.length ? 'ERRORS ' + JSON.stringify(errs) : '');
  await p.close();
}
await browser.close();
