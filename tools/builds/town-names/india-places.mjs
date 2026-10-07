#!/usr/bin/env node
// india-places: India's own list of places for the town-name quiz -> tools/cache/places_IN.tsv (name, lat, lng),
// which tools/lib/names.mjs reads in place of GeoNames. GeoNames lists India very unevenly: Uttar Pradesh has
// 155,000 places, West Bengal 4,300 and Assam 1,400, so whole states had no name parts.
//
//   node tools/builds/town-names/india-places.mjs      (from the repository root; needs bsdtar for the 7z archive)
//
// Villages: the village boundaries of the Local Government Directory (Ministry of Panchayati Raj), as collected
// in github.com/yashveeeeeeer/india-geodata (CC0; 351 MB). A village is placed at the middle of its largest
// outline; its name is the census name, else the Survey of India's. Forest blocks ("Forest", "R F") are no
// places and are left out.
// That file has no villages for Himachal Pradesh, Jammu and Kashmir, Ladakh, Sikkim and the north-east apart from
// Assam and Tripura. Those states come from the habitations of the rural roads programme (PMGSY GeoSadak, Ministry
// of Rural Development, Government Open Data License - India), as mirrored in github.com/datameet/pmgsy-geosadak.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { spawn, execFileSync } from 'node:child_process';
import { CACHE, cached } from '../../lib/geo.mjs';

const REGISTER = 'https://github.com/yashveeeeeeer/india-geodata/releases/download/admin%2Fvillages/LGD_Villages.geojsonl.7z';
const HABITATIONS = 'https://raw.githubusercontent.com/datameet/pmgsy-geosadak/master/data/Habitation';
// The states taken from the habitations, by the file name there and by the register's name for the state.
const FROM_HABITATIONS = { HimachalPradesh: 'HIMACHAL PRADESH', JammuAndKashmir: 'JAMMU & KASHMIR', Ladakh: 'LADAKH', ArunachalPradesh: 'ARUNACHAL PRADESH', Manipur: 'MANIPUR', Meghalaya: 'MEGHALAYA', Mizoram: 'MIZORAM', Nagaland: 'NAGALAND', Sikkim: 'SIKKIM' };
const FOREST = /^(reserved? forest|protected forest|forest|r\.? ?f\.?|p\.? ?f\.?)$/i;
const inIndia = (lng, lat) => lng >= 68 && lng <= 97.5 && lat >= 6 && lat <= 37.5;   // some coordinates are swapped or empty

// A name as a sign would write it: no census marks ("Mus*", "(Part)", "(245)"), capitals only at the start of words.
function clean(s) {
  s = (s || '').replace(/\(.*?\)/g, ' ').replace(/\*+/g, ' ').replace(/\s+/g, ' ').trim();
  if (s === s.toUpperCase() || s === s.toLowerCase()) s = s.toLowerCase().replace(/(^|[\s\-.])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
  return s;
}
const rows = [], count = {};
const add = (state, name, lng, lat) => { name = clean(name); if (!name || FOREST.test(name) || !inIndia(lng, lat)) return; rows.push(`${name}\t${lat.toFixed(5)}\t${lng.toFixed(5)}`); count[state] = (count[state] || 0) + 1; };

/* ---------- villages ---------- */
const archive = await cached(REGISTER, 'lgd_villages_IN.geojsonl.7z');
const tar = spawn('bsdtar', ['-xOf', archive], { stdio: ['ignore', 'pipe', 'inherit'] });
const skip = new Set(Object.values(FROM_HABITATIONS));
for await (const line of readline.createInterface({ input: tar.stdout, crlfDelay: Infinity })) {
  if (!line) continue;
  const f = JSON.parse(line), p = f.properties, g = f.geometry, state = (p.stname || '').trim();
  if (!g || skip.has(state)) continue;
  let best = null;
  for (const poly of g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates]) {
    let w = 999, e = -999, s = 99, n = -99;
    for (const [x, y] of poly[0] || []) { w = Math.min(w, x); e = Math.max(e, x); s = Math.min(s, y); n = Math.max(n, y); }
    if (!best || (e - w) * (n - s) > best[0]) best = [(e - w) * (n - s), (w + e) / 2, (s + n) / 2];
  }
  if (best) add(state, clean(p.vilname11) || p.vilnam_soi, best[1], best[2]);
}
if (!rows.length) { console.error('no villages read: is bsdtar installed?'); process.exit(1); }
const villages = rows.length;

/* ---------- habitations: a shapefile of points per state ---------- */
for (const [file, state] of Object.entries(FROM_HABITATIONS)) {
  const zip = await cached(`${HABITATIONS}/${file}.zip`, `pmgsy_${file}.zip`);
  const members = execFileSync('unzip', ['-Z1', zip]).toString().split('\n'), read = ext => execFileSync('unzip', ['-p', zip, members.find(m => m.toLowerCase().endsWith(ext))], { maxBuffer: 1 << 30 });
  const dbf = read('.dbf'), shp = read('.shp'), n = dbf.readUInt32LE(4), head = dbf.readUInt16LE(8), len = dbf.readUInt16LE(10);
  let at = 1, name = null;
  for (let p = 32; dbf[p] !== 0x0d; p += 32) { const field = dbf.toString('latin1', p, p + 11).split('\0')[0]; if (field === 'HAB_NAME') name = [at, dbf[p + 16]]; at += dbf[p + 16]; }
  for (let i = 0, p = 100; i < n && p < shp.length; i++) {
    const size = shp.readInt32BE(p + 4) * 2, type = shp.readInt32LE(p + 8);
    if (type === 1 || type === 11 || type === 21) add(state, dbf.toString('utf8', head + i * len + name[0], head + i * len + name[0] + name[1]), shp.readDoubleLE(p + 12), shp.readDoubleLE(p + 20));
    p += 8 + size;
  }
}

fs.writeFileSync(path.join(CACHE, 'places_IN.tsv'), rows.join('\n') + '\n');
console.log(`${rows.length} places: ${villages} villages, ${rows.length - villages} habitations`);
console.log(Object.entries(count).sort((a, b) => b[1] - a[1]).map(([s, c]) => `${s} ${c}`).join(', '));
