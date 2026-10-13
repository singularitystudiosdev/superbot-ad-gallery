// Renders the white 2x2 thumbnail poster: <id>.png is the prompt and four results cropped tight,
// <id>.1x1.png is the full square canvas for the gallery (1080x1080 CSS at 1.25x = 1350x1350).
// Usage: node render.mjs [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AD_ID = 'deadlift-world-record-compare-2ec6b7f6';

const sourceDir = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.argv[2] ?? join(sourceDir, 'out'));
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1.25 });
  await page.goto(pathToFileURL(join(sourceDir, 'index.html')).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const brokenImages = await page.evaluate(() =>
    [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
  );
  if (brokenImages.length) throw new Error(`Images failed to load: ${brokenImages.join(', ')}`);
  const overflow = await page.evaluate(() => {
    const stage = document.querySelector('.stage').getBoundingClientRect();
    const promptText = document.querySelector('.prompt-text').getBoundingClientRect();
    const send = document.querySelector('.send').getBoundingClientRect();
    const clipped = [...document.querySelectorAll('.prompt, .card')]
      .map((el) => ({ el: el.className, box: el.getBoundingClientRect() }))
      .filter(({ box }) => box.top < stage.top || box.bottom > stage.bottom || box.left < stage.left || box.right > stage.right)
      .map(({ el }) => el);
    if (promptText.right > send.left) clipped.push('prompt-text runs under the send button');
    return clipped;
  });
  if (overflow.length) throw new Error(`Layout problem: ${overflow.join(', ')}`);
  const tightFile = join(outDir, `${AD_ID}.png`);
  await page.locator('.content').screenshot({ path: tightFile });
  console.log(`rendered ${tightFile}`);
  const canvasFile = join(outDir, `${AD_ID}.1x1.png`);
  await page.locator('.stage').screenshot({ path: canvasFile });
  console.log(`rendered ${canvasFile}`);
} finally {
  await browser.close();
}
