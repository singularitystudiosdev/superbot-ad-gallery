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
    const problems = await page.evaluate((R) => {
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
      if (R === '16x9') {
        // 16:9 layout: chat pill on top (one line of text, inside the pill, clear of the send button), the 2x2 of horizontal cards
        // directly below at exactly the pill's width, and the composition filling at least 94% x 88% of the canvas
        const bar = document.querySelector('.prompt').getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(document.querySelector('.prompt-text'));
        const ink = range.getBoundingClientRect();
        if (range.getClientRects().length !== 1) out.push('prompt text wraps onto more than one line');
        if (ink.left < bar.left + 1 || ink.right > bar.right - 1 || ink.top < bar.top + 1 || ink.bottom > bar.bottom - 1) out.push('prompt text spills out of the pill');
        const sendBox = document.querySelector('.send').getBoundingClientRect();
        if (ink.right > sendBox.left - 8) out.push('prompt text runs into the send button');
        const gridBox = document.querySelector('.grid').getBoundingClientRect();
        if (gridBox.top < bar.bottom || Math.abs(gridBox.left - bar.left) > 1 || Math.abs(gridBox.right - bar.right) > 1) out.push('chat bar and card grid are not the same width, stacked bar over grid');
        for (const card of document.querySelectorAll('.card')) {
          const cardBox = card.getBoundingClientRect();
          const head = card.querySelector('header').getBoundingClientRect();
          const shot = card.querySelector('.shot').getBoundingClientRect();
          const name = card.querySelector('h2').getBoundingClientRect();
          if (!(head.right <= shot.left + 1 && name.left >= head.left - 1 && name.right <= head.right + 1)) out.push(`${card.querySelector('h2').textContent} label does not fit its column beside the image`);
          if (shot.right > cardBox.right || shot.bottom > cardBox.bottom) out.push('card image spills out of its card');
          const img = card.querySelector('.shot img');
          const crop = 1 - Math.min(img.naturalWidth / img.naturalHeight, shot.width / shot.height) / Math.max(img.naturalWidth / img.naturalHeight, shot.width / shot.height);
          if (crop > 0.02) out.push(`${card.querySelector('h2').textContent} thumbnail is cropped ${(crop * 100).toFixed(1)}%`);
        }
        const fillW = (Math.max(bar.right, gridBox.right) - Math.min(bar.left, gridBox.left)) / stage.width;
        const fillH = (Math.max(bar.bottom, gridBox.bottom) - Math.min(bar.top, gridBox.top)) / stage.height;
        if (fillW < 0.94 || fillH < 0.88) out.push(`composition fills only ${(fillW * 100).toFixed(1)}% x ${(fillH * 100).toFixed(1)}% of the 16:9 canvas`);
      }
      return out;
    }, ratio.name);
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
