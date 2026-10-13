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
  const overflow = await page.evaluate((R) => {
    const stage = document.querySelector('.stage').getBoundingClientRect();
    const clipped = [...document.querySelectorAll('.prompt, .card')]
      .map((el) => ({ el: el.className, box: el.getBoundingClientRect() }))
      .filter(({ box }) => box.top < stage.top || box.bottom > stage.bottom || box.left < stage.left || box.right > stage.right)
      .map(({ el }) => el);
    if (R === '16x9') {
      // 16:9 layout: chat pill on top (one line of text, inside the pill, clear of the send button), the 2x2 of horizontal cards
      // directly below at exactly the pill's width, and the composition filling at least 94% x 88% of the canvas
      const bar = document.querySelector('.prompt').getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(document.querySelector('.prompt-text'));
      const ink = range.getBoundingClientRect();
      if (range.getClientRects().length !== 1) clipped.push('prompt text wraps onto more than one line');
      if (ink.left < bar.left + 1 || ink.right > bar.right - 1 || ink.top < bar.top + 1 || ink.bottom > bar.bottom - 1) clipped.push('prompt text spills out of the pill');
      const sendBox = document.querySelector('.send').getBoundingClientRect();
      if (ink.right > sendBox.left - 8) clipped.push('prompt text runs into the send button');
      const gridBox = document.querySelector('.grid').getBoundingClientRect();
      if (gridBox.top < bar.bottom || Math.abs(gridBox.left - bar.left) > 1 || Math.abs(gridBox.right - bar.right) > 1) clipped.push('chat bar and card grid are not the same width, stacked bar over grid');
      for (const card of document.querySelectorAll('.card')) {
        const cardBox = card.getBoundingClientRect();
        const head = card.querySelector('header').getBoundingClientRect();
        const shot = card.querySelector('.shot').getBoundingClientRect();
        const name = card.querySelector('h2').getBoundingClientRect();
        if (!(head.right <= shot.left + 1 && name.left >= head.left - 1 && name.right <= head.right + 1)) clipped.push(`${card.querySelector('h2').textContent} label does not fit its column beside the image`);
        if (shot.right > cardBox.right || shot.bottom > cardBox.bottom) clipped.push('card image spills out of its card');
        const img = card.querySelector('.shot img');
        const crop = 1 - Math.min(img.naturalWidth / img.naturalHeight, shot.width / shot.height) / Math.max(img.naturalWidth / img.naturalHeight, shot.width / shot.height);
        if (crop > 0.22) clipped.push(`${card.querySelector('h2').textContent} screenshot is cropped ${(crop * 100).toFixed(1)}%`);
      }
      const fillW = (Math.max(bar.right, gridBox.right) - Math.min(bar.left, gridBox.left)) / stage.width;
      const fillH = (Math.max(bar.bottom, gridBox.bottom) - Math.min(bar.top, gridBox.top)) / stage.height;
      if (fillW < 0.94 || fillH < 0.88) clipped.push(`composition fills only ${(fillW * 100).toFixed(1)}% x ${(fillH * 100).toFixed(1)}% of the 16:9 canvas`);
    }
    return clipped;
  }, ratio);
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
