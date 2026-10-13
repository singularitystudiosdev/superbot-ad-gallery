// Renders the white 2x2 poster: <id>.png is the prompt and four results cropped tight,
// <id>.4x5.png is the full 4:5 canvas for the gallery (864x1080 CSS at 1.25x = 1080x1350),
// <id>.16x9.png is the same poster re-fit to a 16:9 canvas (1920x1080 CSS at 1.25x = 2400x1350).
// Usage: node render.mjs [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AD_ID = 'baking-website-compare-muse-2ec6b7f6';

const sourceDir = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.argv[2] ?? join(sourceDir, 'out'));
mkdirSync(outDir, { recursive: true });

async function renderRatio({ browser, ratio, viewport, outputs }) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1.25 });
  await page.goto(pathToFileURL(join(sourceDir, 'index.html')).href, { waitUntil: 'load' });
  if (ratio === '16x9') await page.evaluate(() => document.body.classList.add('ratio-16x9'));
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
  if (overflow.length) throw new Error(`Elements overflow the ${ratio} canvas: ${overflow.join(', ')}`);
  for (const { selector, file } of outputs) {
    const target = join(outDir, file);
    await page.locator(selector).screenshot({ path: target });
    console.log(`rendered ${target}`);
  }
  await page.close();
}

const browser = await chromium.launch({ headless: true });
try {
  await renderRatio({
    browser,
    ratio: '4x5',
    viewport: { width: 864, height: 1080 },
    outputs: [
      { selector: '.content', file: `${AD_ID}.png` },
      { selector: '.stage', file: `${AD_ID}.4x5.png` },
    ],
  });
  await renderRatio({
    browser,
    ratio: '16x9',
    viewport: { width: 1920, height: 1080 },
    outputs: [{ selector: '.stage', file: `${AD_ID}.16x9.png` }],
  });
} finally {
  await browser.close();
}
