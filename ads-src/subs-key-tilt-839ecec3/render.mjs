// Renders the tilted subscriptions-key poster to <out>/<id>.{16x9,4x3,1x1,4x5}.png (default out: assets/ads).
// Run from the repo root: `node ads-src/subs-key-tilt-839ecec3/render.mjs [outDir]`.
// The art board is 1080 CSS px tall at every ratio and captured at 1.25x, so each file is 1350 px tall like the other posters:
// 16x9 = 1920 wide (2400x1350), 4x3 = 1440 (1800x1350), 1x1 = 1080 (1350x1350), 4x5 = 864 (1080x1350).
// index.html reads ?ar=<ratio> and style.css re-places the pieces per [data-ar].
import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ID = 'subs-key-tilt-phone-839ecec3';
const out = process.argv[2] || 'assets/ads';
const base = pathToFileURL(resolve('ads-src/subs-key-tilt-839ecec3/index.html')).href;
const RATIOS = { '4x5': 864, '16x9': 1920, '4x3': 1440, '1x1': 1080 };
const MARGIN = 24;

const browser = await chromium.launch();
let bad = 0;
for (const [ar, width] of Object.entries(RATIOS)) {
  const page = await browser.newPage({ viewport: { width, height: 1080 }, deviceScaleFactor: 1.25 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('requestfailed', q => errs.push('reqfail ' + q.url()));
  await page.goto(`${base}?ar=${ar}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  // headline, key dock and lockup must stay inside the safe margin (measured on the drawn text, not the 1080px layout box);
  // the phone may bleed off the bottom/right on purpose
  const boxes = await page.evaluate(() => {
    const u = els => {
      let l = 1e9, t = 1e9, r = -1e9, b = -1e9;
      for (const e of els) { const k = e.getBoundingClientRect(); l = Math.min(l, k.left); t = Math.min(t, k.top); r = Math.max(r, k.right); b = Math.max(b, k.bottom); }
      return { l: Math.round(l), t: Math.round(t), r: Math.round(r), b: Math.round(b) };
    };
    const text = e => { const g = document.createRange(); g.selectNodeContents(e); return g; };
    return {
      '.head': u([text(document.querySelector('.l1')), text(document.querySelector('.l2'))]),
      '.dock': u([document.querySelector('.dock')]),
      '.lockup': u([document.querySelector('.mascot'), text(document.querySelector('.domain'))]),
      '.phone': u([document.querySelector('.phone')]),
    };
  });
  const font = await page.evaluate(() => getComputedStyle(document.querySelector('.l2')).fontFamily);
  const outside = ['.head', '.dock', '.lockup'].filter(q => { const b = boxes[q]; return b.l < MARGIN || b.t < MARGIN || b.r > width - MARGIN || b.b > 1080 - MARGIN; });
  if (outside.length) { bad++; errs.push('outside safe margin: ' + outside.join(' ')); }
  const file = `${out}/${ID}.${ar}.png`;
  await page.screenshot({ path: file });
  console.log(file, JSON.stringify(boxes), 'font', font, errs.length ? 'ERRORS ' + JSON.stringify(errs) : 'ok');
  await page.close();
}
await browser.close();
if (bad) process.exitCode = 1;
