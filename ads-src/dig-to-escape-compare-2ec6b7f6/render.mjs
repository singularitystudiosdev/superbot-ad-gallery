// Renders the white 2x2 thumbnail poster at every gallery ratio (rendered at 1.25x):
//   <id>.png       prompt and four results cropped tight (from the 1:1 layout)
//   <id>.1x1.png   1080x1080 CSS canvas -> 1350x1350
//   <id>.4x5.png   864x1080 CSS canvas -> 1080x1350
//   <id>.16x9.png  1920x1080 CSS canvas -> 2400x1350
// Usage: node render.mjs [outDir]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AD_ID = 'dig-to-escape-compare-2ec6b7f6';
const RATIOS = [
  { name: '1x1', width: 1080, height: 1080, tight: true },
  { name: '4x5', width: 864, height: 1080 },
  { name: '16x9', width: 1920, height: 1080 },
];

const sourceDir = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.argv[2] ?? join(sourceDir, 'out'));
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  for (const ratio of RATIOS) {
    const page = await browser.newPage({ viewport: { width: ratio.width, height: ratio.height }, deviceScaleFactor: 1.25 });
    const url = new URL(pathToFileURL(join(sourceDir, 'index.html')).href);
    if (ratio.name !== '1x1') url.searchParams.set('ratio', ratio.name);
    await page.goto(url.href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const brokenImages = await page.evaluate(() =>
      [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src),
    );
    if (brokenImages.length) throw new Error(`Images failed to load: ${brokenImages.join(', ')}`);
    const problems = await page.evaluate(() => {
      const stage = document.querySelector('.stage').getBoundingClientRect();
      const promptText = document.querySelector('.prompt-text');
      const send = document.querySelector('.send').getBoundingClientRect();
      const text = promptText.getBoundingClientRect();
      const out = [...document.querySelectorAll('.prompt, .card')]
        .map((el) => ({ el: el.className, box: el.getBoundingClientRect() }))
        .filter(({ box }) => box.top < stage.top || box.bottom > stage.bottom || box.left < stage.left || box.right > stage.right)
        .map(({ el }) => `${el} overflows the canvas`);
      const overlaps = text.left < send.right && text.right > send.left && text.top < send.bottom && text.bottom > send.top;
      if (overlaps) out.push('prompt text runs under the send button');
      if (promptText.scrollWidth > promptText.clientWidth + 1) out.push('prompt text is clipped');
      return out;
    });
    if (problems.length) throw new Error(`[${ratio.name}] Layout problem: ${problems.join(', ')}`);
    if (ratio.tight) {
      const tightFile = join(outDir, `${AD_ID}.png`);
      await page.locator('.content').screenshot({ path: tightFile });
      console.log(`rendered ${tightFile}`);
    }
    const canvasFile = join(outDir, `${AD_ID}.${ratio.name}.png`);
    await page.locator('.stage').screenshot({ path: canvasFile });
    console.log(`rendered ${canvasFile}`);
    await page.close();
  }
} finally {
  await browser.close();
}
