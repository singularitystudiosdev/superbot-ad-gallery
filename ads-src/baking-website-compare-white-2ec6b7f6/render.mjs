// Renders the 16:9 poster to PNG (1920x1080 CSS canvas at 1.25x = 2400x1350).
// Usage: node render.mjs [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AD_ID = 'baking-website-compare-white-2ec6b7f6';

const sourceDir = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.argv[2] ?? join(sourceDir, 'out'));
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1.25 });
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
  const file = join(outDir, `${AD_ID}.16x9.png`);
  await page.locator('.stage').screenshot({ path: file });
  console.log(`rendered ${file}`);
} finally {
  await browser.close();
}
