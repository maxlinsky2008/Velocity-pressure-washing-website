import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const existing = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
const n = existing.length + 1;
const outFile = path.join(dir, `screenshot-${n}${label}.png`);

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

// Force all scroll-reveal elements visible
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
});
await new Promise(r => setTimeout(r, 400));

await page.screenshot({ path: outFile, fullPage: true });
await browser.close();
console.log(`Saved: ${outFile}`);
