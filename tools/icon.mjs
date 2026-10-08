#!/usr/bin/env node
// icon: the app icon of the site on a phone's home screen (manifest.webmanifest) -> assets/icons/: a globe of the
// home map's land (world-atlas, Natural Earth) with a pin on it, in the colors of assets/css/base.css.
//
//   node tools/icon.mjs [--lng 15] [--lat 28]
//
// Writes  icon-192.png, icon-512.png   the manifest's icons; the globe stays inside the middle 80%, so a phone may
//                                      cut the square to a circle or any other shape ("maskable")
//         apple-touch-icon.png         180 px, for iPhones
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import * as d3 from 'd3-geo';
import { feature } from 'topojson-client';
import { chromium } from 'playwright-core';
import { ROOT, cached } from './lib/geo.mjs';

const { values: o } = parseArgs({ options: { lng: { type: 'string', default: '15' }, lat: { type: 'string', default: '28' } } });
const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'; // the home map's countries, as in assets/js/common.js
const INK = '#15283A', DEEP = '#2C4A63', SEA = '#D6E2E7', YELLOW = '#F2B705';
const S = 512, C = S / 2, R = 152, CY = C + 22; // globe and pin together within 205 of the middle: the part no phone cuts off

const land = feature(JSON.parse(fs.readFileSync(await cached(WORLD_URL, 'world-atlas_countries-110m.json'), 'utf8')), 'land');
const proj = d3.geoOrthographic().rotate([-o.lng, -o.lat]).scale(R).translate([C, CY]).clipAngle(90).precision(0.3);

// A pin with its tip at (x, y): a round head of radius r, its middle h above the tip, and the two tangents down to it.
function pin(x, y, r, h) {
  const a = Math.acos(r / h), dx = r * Math.sin(a), dy = r * Math.cos(a), f = v => v.toFixed(1);
  return `<path d="M${f(x)},${f(y)}L${f(x + dx)},${f(y - h + dy)}A${r},${r} 0 1 0 ${f(x - dx)},${f(y - h + dy)}Z" fill="${YELLOW}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>`
    + `<circle cx="${f(x)}" cy="${f(y - h)}" r="${f(r * 0.4)}" fill="${INK}"/>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">`
  + `<rect width="${S}" height="${S}" fill="${INK}"/><circle cx="${C}" cy="${CY}" r="${R}" fill="${DEEP}"/>`
  + `<path d="${d3.geoPath(proj)(land)}" fill="${SEA}"/>${pin(C + 12, CY - 10, 52, 136)}</svg>`;

const dir = path.join(ROOT, 'assets', 'icons');
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch();
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" style="display:block" `)}`);
  await page.screenshot({ path: path.join(dir, name) });
  await page.close();
  console.log(`assets/icons/${name}`);
}
await browser.close();
