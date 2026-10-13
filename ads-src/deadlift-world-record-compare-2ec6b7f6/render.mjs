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
    const overflow = await page.evaluate((R) => {
      const stage = document.querySelector('.stage').getBoundingClientRect();
      const promptText = document.querySelector('.prompt-text').getBoundingClientRect();
      const send = document.querySelector('.send').getBoundingClientRect();
      const clipped = [...document.querySelectorAll('.prompt, .card')]
        .map((el) => ({ el: el.className, box: el.getBoundingClientRect() }))
        .filter(({ box }) => box.top < stage.top || box.bottom > stage.bottom || box.left < stage.left || box.right > stage.right)
        .map(({ el }) => el);
      if (R !== '16x9' && promptText.right > send.left) clipped.push('prompt-text runs under the send button');
      for (const h of document.querySelectorAll('.card h2')) {
        const card = h.closest('.card').getBoundingClientRect();
        if (h.getBoundingClientRect().right > card.right) clipped.push(`${h.textContent} title runs out of its card`);
      }
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
          if (crop > 0.02) clipped.push(`${card.querySelector('h2').textContent} thumbnail is cropped ${(crop * 100).toFixed(1)}%`);
        }
        const fillW = (Math.max(bar.right, gridBox.right) - Math.min(bar.left, gridBox.left)) / stage.width;
        const fillH = (Math.max(bar.bottom, gridBox.bottom) - Math.min(bar.top, gridBox.top)) / stage.height;
        if (fillW < 0.94 || fillH < 0.88) clipped.push(`composition fills only ${(fillW * 100).toFixed(1)}% x ${(fillH * 100).toFixed(1)}% of the 16:9 canvas`);
      }
      return clipped;
    }, ar);
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
