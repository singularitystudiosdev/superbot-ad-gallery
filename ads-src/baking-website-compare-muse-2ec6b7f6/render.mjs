// Renders the white 2x2 poster: <id>.png is the prompt and four results cropped tight,
// <id>.4x5.png is the full 4:5 canvas for the gallery (864x1080 CSS at 1.25x = 1080x1350).
// Usage: node render.mjs [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AD_ID = 'baking-website-compare-muse-2ec6b7f6';

const sourceDir = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.argv[2] ?? join(sourceDir, 'out'));
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1080 }, deviceScaleFactor: 1.25 });
  await page.goto(pathToFileURL(join(sourceDir, 'index.html')).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const brokenImages = await page.evaluate(() =>
    [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
  );
  if (brokenImages.length) throw new Error(`Images failed to load: ${brokenImages.join(', ')}`);
  const overflow = await page.evaluate(() => {
    const stage = document.querySelector('.stage').getBoundingClientRect();
    return [...document.querySelectorAll('.prompt, .card')]
      .map((el) => ({ el: el.className, box: el.getBoundingClientRect() }))
      .filter(({ box }) => box.top < stage.top || box.bottom > stage.bottom || box.left < stage.left || box.right > stage.right)
      .map(({ el }) => el);
  });
  if (overflow.length) throw new Error(`Elements overflow the canvas: ${overflow.join(', ')}`);
  const tightFile = join(outDir, `${AD_ID}.png`);
  await page.locator('.content').screenshot({ path: tightFile });
  console.log(`rendered ${tightFile}`);
  const canvasFile = join(outDir, `${AD_ID}.4x5.png`);
  await page.locator('.stage').screenshot({ path: canvasFile });
  console.log(`rendered ${canvasFile}`);
} finally {
  await browser.close();
}
