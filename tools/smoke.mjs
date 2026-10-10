#!/usr/bin/env node
// smoke: open quiz pages in headless Chromium, report script errors and whether a round can be played, and save
// screenshots (setup and first question) to look at.
//
//   node tools/smoke.mjs quizzes/thailand-cities/index.html [more pages…] [--shots <dir>] [--dark]
//
// Exit code 1 if any page has an error. Serves the repository itself on a free local port.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright-core';
import { ROOT } from './lib/geo.mjs';

const { values: o, positionals: pages } = parseArgs({ allowPositionals: true, options: { shots: { type: 'string' }, dark: { type: 'boolean', default: false } } });
if (!pages.length) { console.error('usage: smoke <page.html>… [--shots dir] [--dark]'); process.exit(1); }
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();
if (o.shots) fs.mkdirSync(o.shots, { recursive: true });
let failed = false;

for (const p of pages) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 }, colorScheme: o.dark ? 'dark' : 'light' });
  const errors = [];
  page.on('pageerror', e => errors.push('page error: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|tile\.openstreetmap|favicon/.test(m.text())) errors.push('console: ' + m.text()); });
  page.on('requestfailed', r => { if (!/fonts\.g|tile\.openstreetmap|cdnjs/.test(r.url())) errors.push('request failed: ' + r.url()); });
  const result = { page: p, errors, rounds: 0, started: false, prompt: '', clicked: false, shots: [] };
  try {
    await page.goto(base + p, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    result.rounds = await page.locator('#rounds .round').count();
    const slug = p.replace(/[^a-z0-9]+/gi, '_');
    if (o.shots) { const f = path.join(o.shots, `${slug}_setup.png`); await page.screenshot({ path: f }); result.shots.push(f); }
    if (result.rounds) {
      await page.locator('#rounds .round').first().click();
      await page.locator('#startBtn').click();
      await page.waitForTimeout(500);
      result.started = await page.locator('#play').isVisible();
      result.prompt = (await page.evaluate(() => ['bigname', 'sent', 'code'].map(id => { const e = document.getElementById(id); return e && e.offsetParent ? e.textContent.trim() : ''; }).filter(Boolean)[0] || '')) || '';
      // picture quizzes: the question is a picture, which must have loaded
      const photo = page.locator('#photoImg');
      if (!result.prompt && await photo.count() && await photo.isVisible()) {
        const src = await photo.evaluate(im => im.complete && im.naturalWidth ? im.getAttribute('src') : '');
        if (src) result.prompt = 'picture ' + src.split('/').pop(); else errors.push('picture did not load');
      }
      // click some area that is part of the round and check the game reacts
      const area = page.locator('#regions .r:not(.out):not(.under)').first();
      if (await area.count()) { await area.click({ force: true }); await page.waitForTimeout(300); result.clicked = (await page.locator('#fb').textContent()).trim().length > 0; }
      if (o.shots) { const f = path.join(o.shots, `${slug}_play.png`); await page.screenshot({ path: f }); result.shots.push(f); }
    } else errors.push('no rounds on the setup screen');
    if (!result.started && result.rounds) errors.push('round did not start');
  } catch (e) { errors.push('smoke test error: ' + e.message); }
  if (errors.length) failed = true;
  console.log(JSON.stringify(result));
  await page.close();
}
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
