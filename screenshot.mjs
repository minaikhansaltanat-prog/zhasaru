import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const mobile = process.argv.includes('--mobile');

const dir = './temporary screenshots';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let n = 1;
while (fs.existsSync(path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`))) n++;
const outPath = path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`);

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();

if (mobile) {
  // Note: deliberately NOT using isMobile/hasTouch device emulation here —
  // combined with fullPage screenshots it triggers a known Puppeteer bug
  // that doubles the captured height. A plain narrow viewport still hits
  // every max-width media query in the CSS, which is all we need visually.
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
} else {
  await page.setViewport({ width: 1440, height: 900 });
}

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 500));

// Scroll through the full page first so lazy images and reveal-on-scroll
// animations have actually triggered before the screenshot is taken.
const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
const step = mobile ? 700 : 900;
for (let y = 0; y < scrollHeight; y += step) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await new Promise((r) => setTimeout(r, 120));
}
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise((r) => setTimeout(r, 600));

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log('Saved: ' + outPath);
