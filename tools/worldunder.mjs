#!/usr/bin/env node
// worldunder: data/maps/world/world.js -> data/maps/world/under.bin.gz, the plain map of the world under a country's map
// (engine/map/world.js), which every such quiz takes as it is: its rings as numbers, with the triangles of their fills
// already cut. One file for all of them, which the browser keeps. Run it after tools/worldmap.mjs.
//
//   node tools/worldunder.mjs
//
// What is in the file (gzip; a whole number is a varint, signed ones zigzag):
//   two doubles (little-endian): k, y0 of world.js's projection; rings; for each ring its points; for each ring its
//   triangles' corners; every ring's points (tenths of a map unit, each from the last, from 0 at a ring's start); every
//   ring's corners (each from the last, from 0 at a ring's start), as earcut gives them for that ring.
// A step that does not give back world.js's outline exactly stops with an error and writes nothing.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { ROOT } from './lib/geo.mjs';

const DIR = path.join(ROOT, 'data/maps/world');
const WORLD = new Function(fs.readFileSync(path.join(DIR, 'world.js'), 'utf8') + ';return WORLD')();
const earcut = new Function(fs.readFileSync(path.join(ROOT, 'engine/lib/earcut.js'), 'utf8') + ';return earcut')();
const stop = why => { console.error('worldunder: ' + why + '; nothing written'); process.exit(1); };

const rings = [];
for (const r of WORLD.reg.filter(r => r.a)) {
  if (/[^MLZ\d.,-]/.test(r.d)) stop(`${r.id}: an outline with more than M, L and Z`);
  for (const piece of r.d.split(/(?=M)/)) {
    if (!piece.endsWith('Z')) stop(`${r.id}: a ring that is not closed`);
    const p = piece.match(/-?[\d.]+/g).map(Number);
    if (p.some(v => Math.round(v * 10) / 10 !== v)) stop(`${r.id}: a point finer than a tenth`);
    if (p.length / 2 > 65535) stop(`${r.id}: a ring of too many points`);
    rings.push(p);
  }
}

const zig = v => (v < 0 ? -v * 2 - 1 : v * 2);
const put = (o, v) => { while (v > 127) { o.push(v & 127 | 128); v = Math.floor(v / 128); } o.push(v); };
const counts = [], points = [], cuts = [], corners = [];
const tris = rings.map(p => (p.length >= 6 ? earcut(p, null, 2) : []));
for (const p of rings) put(counts, p.length / 2);
for (const t of tris) put(cuts, t.length);
for (const p of rings) { let x = 0, y = 0; for (let i = 0; i < p.length; i += 2) { const px = Math.round(p[i] * 10), py = Math.round(p[i + 1] * 10); put(points, zig(px - x)); put(points, zig(py - y)); x = px; y = py; } }
for (const t of tris) { let last = 0; for (const k of t) { put(corners, zig(k - last)); last = k; } }

const head = Buffer.alloc(16); head.writeDoubleLE(WORLD.proj.k, 0); head.writeDoubleLE(WORLD.proj.y0, 8);
const n = []; put(n, rings.length);
const bin = Buffer.concat([head, Buffer.from(n), Buffer.from(counts), Buffer.from(cuts), Buffer.from(points), Buffer.from(corners)]);

// read back the way the browser does (engine/map/world.js)
{
  const b = bin; let o = 16;
  const num = () => { let v = 0, m = 1, c; do { c = b[o++]; v += (c & 127) * m; m *= 128; } while (c > 127); return v; };
  const sig = () => { const v = num(); return v % 2 ? -(v + 1) / 2 : v / 2; };
  const R = num(), ns = Array.from({ length: R }, num), ts = Array.from({ length: R }, num);
  rings.forEach((p, i) => { if (ns[i] !== p.length / 2) stop('ring ' + i + ': its points not read back'); let x = 0, y = 0; for (let j = 0; j < p.length; j += 2) { x += sig(); y += sig(); if (x / 10 !== p[j] || y / 10 !== p[j + 1]) stop('ring ' + i + ': a point not read back'); } });
  tris.forEach((t, i) => { if (ts[i] !== t.length) stop('ring ' + i + ': its corners not read back'); let k = 0; for (const c of t) { k += sig(); if (k !== c) stop('ring ' + i + ': a corner not read back'); } });
  if (o !== b.length) stop('bytes left over');
}

const gz = zlib.gzipSync(bin, { level: 9 });
fs.writeFileSync(path.join(DIR, 'under.bin.gz'), gz);
console.log(`under.bin.gz: ${rings.length} rings, ${rings.reduce((s, p) => s + p.length / 2, 0)} points, ${tris.reduce((s, t) => s + t.length, 0) / 3} triangles, ${(gz.length / 1024).toFixed(0)} KB (world.js gzipped: ${(zlib.gzipSync(fs.readFileSync(path.join(DIR, 'world.js')), { level: 9 }).length / 1024).toFixed(0)} KB)`);
