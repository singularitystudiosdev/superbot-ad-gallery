// Renders the white 2x2 thumbnail poster: <id>.png is the prompt and four results cropped tight,
// <id>.1x1.png, <id>.4x5.png (1080x1350) and <id>.16x9.png (2400x1350) are the full canvases (1.25x).
// Usage: node render.mjs [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AD_ID = 'deadlift-world-record-compare-2ec6b7f6';

const sourceDir = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.argv[2] ?? join(sourceDir, 'out'));
mkdirSync(outDir, { recursive: true });

const RATIOS = [
  { ar: '1x1', width: 1080, height: 1080, tight: true },
  { ar: '4x5', width: 864, height: 1080 },
  { ar: '16x9', width: 1920, height: 1080 },
];

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1.25 });
  await page.goto(pathToFileURL(join(sourceDir, 'index.html')).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  for (const { ar, width, height, tight } of RATIOS) {
    await page.setViewportSize({ width, height });
    await page.evaluate((value) => { document.documentElement.dataset.ar = value; }, ar);
    await page.evaluate(() => document.fonts.ready);
    const brokenImages = await page.evaluate(() =>
      [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
    );
    if (brokenImages.length) throw new Error(`[${ar}] Images failed to load: ${brokenImages.join(', ')}`);
    const overflow = await page.evaluate(() => {
      const stage = document.querySelector('.stage').getBoundingClientRect();
      const promptText = document.querySelector('.prompt-text').getBoundingClientRect();
      const send = document.querySelector('.send').getBoundingClientRect();
      const clipped = [...document.querySelectorAll('.prompt, .card')]
        .map((el) => ({ el: el.className, box: el.getBoundingClientRect() }))
        .filter(({ box }) => box.top < stage.top || box.bottom > stage.bottom || box.left < stage.left || box.right > stage.right)
        .map(({ el }) => el);
      if (promptText.right > send.left) clipped.push('prompt-text runs under the send button');
      for (const h of document.querySelectorAll('.card h2')) {
        const card = h.closest('.card').getBoundingClientRect();
        if (h.getBoundingClientRect().right > card.right) clipped.push(`${h.textContent} title runs out of its card`);
      }
      return clipped;
    });
    if (overflow.length) throw new Error(`[${ar}] Layout problem: ${overflow.join(', ')}`);
    if (tight) {
      const tightFile = join(outDir, `${AD_ID}.png`);
      await page.locator('.content').screenshot({ path: tightFile });
      console.log(`rendered ${tightFile}`);
    }
    const canvasFile = join(outDir, `${AD_ID}.${ar}.png`);
    await page.locator('.stage').screenshot({ path: canvasFile });
    console.log(`rendered ${canvasFile}`);
  }
} finally {
  await browser.close();
}
