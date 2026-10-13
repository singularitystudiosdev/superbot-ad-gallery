// Renders the poster to PNG at every gallery aspect ratio (1350px tall, CSS canvas is 1080 tall at 1.25x).
// Usage: node render.mjs [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AD_ID = 'baking-website-compare-2ec6b7f6';
const CANVAS_WIDTHS = { '4x5': 864, '16x9': 1920, '4x3': 1440, '1x1': 1080 };

const sourceDir = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.argv[2] ?? join(sourceDir, 'out'));
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  for (const [aspect, width] of Object.entries(CANVAS_WIDTHS)) {
    const page = await browser.newPage({ viewport: { width, height: 1080 }, deviceScaleFactor: 1.25 });
    const url = `${pathToFileURL(join(sourceDir, 'index.html')).href}?ar=${aspect}&still=1`;
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const brokenImages = await page.evaluate(() =>
      [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
    );
    if (brokenImages.length) throw new Error(`Images failed to load for ${aspect}: ${brokenImages.join(', ')}`);
    const overflow = await page.evaluate(() => {
      const stage = document.querySelector('.stage').getBoundingClientRect();
      return [...document.querySelectorAll('.prompt, .card, .lockup')]
        .map((el) => ({ el: el.className, box: el.getBoundingClientRect() }))
        .filter(({ box }) => box.top < stage.top || box.bottom > stage.bottom || box.left < stage.left || box.right > stage.right)
        .map(({ el }) => el);
    });
    if (overflow.length) throw new Error(`Elements overflow the ${aspect} canvas: ${overflow.join(', ')}`);
    const file = join(outDir, `${AD_ID}.${aspect}.png`);
    await page.locator('.stage').screenshot({ path: file });
    console.log(`rendered ${file}`);
    await page.close();
  }
} finally {
  await browser.close();
}
