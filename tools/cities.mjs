#!/usr/bin/env node
// cities: a country's largest cities -> quizzes/<slug>-cities/cities.js for the city quiz (shared/city-config.js).
//
//   node tools/cities.mjs --iso2 TH --iso3 THA --name Thailand --adm1 regions.geojson --langs th
//        --out quizzes/thailand-cities/cities.js [--top 200] [--lang-by-region map.json]
//        [--exclude 1234,5678] [--include 2345] [--strip '^เทศบาล(นคร|เมือง|ตำบล)'] [--width 1000]
//
// Cities: GeoNames country dump (CC BY 4.0): populated places (PPL, PPLA–PPLA4, PPLC, PPLG; not PPLX parts of
// towns) by population, the top N plus every national and first-level capital. Names: Wikidata (CC0) labels,
// found through the GeoNames ID (P1566): English, and the local language (--langs, first one is the default;
// --lang-by-region maps GeoNames admin1 codes to another language, e.g. {"07": "ca"} for Catalonia), falling
// back to GeoNames' own alternate names. Cities without a local name are left out of the local-name mode only.
// The base map (land, region borders, neighbours) comes from --adm1, in the same projection as the city dots.
//
// Review the result by hand: drop parts of a city that GeoNames lists as cities (--exclude, e.g. Bangkok's
// districts), and check short vs official name forms (e.g. 横浜 vs 横浜市): keep the form people see on signs;
// --strip removes a regular expression from every local name (repeatable), e.g. Thai municipality prefixes.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { cached, unzipText, readGeoJSON, fitProjection, planarFeatures, landAndLines, contextPath, kmPerUnit, sleep, UA } from './lib/geo.mjs';

const { values: o } = parseArgs({
  options: {
    iso2: { type: 'string' }, iso3: { type: 'string' }, name: { type: 'string' }, adm1: { type: 'string' },
    langs: { type: 'string' }, out: { type: 'string' }, top: { type: 'string', default: '200' },
    'lang-by-region': { type: 'string' }, exclude: { type: 'string', default: '' }, include: { type: 'string', default: '' },
    width: { type: 'string', default: '1000' }, 'min-area': { type: 'string', default: '2' },
    strip: { type: 'string', multiple: true, default: [] },
  },
});
for (const k of ['iso2', 'iso3', 'name', 'adm1', 'langs', 'out']) if (!o[k]) { console.error(`missing --${k}`); process.exit(1); }
const ISO2 = o.iso2.toUpperCase(), LANGS = o.langs.split(',').map(s => s.trim()).filter(Boolean);
const LANG_BY_REGION = o['lang-by-region'] ? JSON.parse(fs.readFileSync(o['lang-by-region'], 'utf8')) : {};
const ALL_LANGS = [...new Set([...LANGS, ...Object.values(LANG_BY_REGION)])];
const EXCLUDE = new Set(o.exclude.split(',').map(s => s.trim()).filter(Boolean));
const INCLUDE = new Set(o.include.split(',').map(s => s.trim()).filter(Boolean));
const round = (v, n) => Math.round(v * 10 ** n) / 10 ** n;

/* ---------- base map ---------- */
const adm = readGeoJSON(o.adm1);
adm.features.forEach((f, i) => { f.properties = { ...f.properties, id: f.properties?.id ?? f.properties?.shapeISO ?? String(i) }; });
const { proj, w, h, def } = fitProjection(adm, +o.width);
const { topo } = planarFeatures(adm, proj, { minArea: +o['min-area'] });
const { land, lines } = landAndLines(topo);
const ctx = await contextPath(proj, w, h, o.iso3.toUpperCase());

/* ---------- GeoNames: pick the cities ---------- */
const KEEP = new Set(['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC', 'PPLG']);
const dump = unzipText(await cached(`https://download.geonames.org/export/dump/${ISO2}.zip`, `geonames_${ISO2}.zip`), `${ISO2}.txt`);
const places = [];
for (const line of dump.split('\n')) {
  const c = line.split('\t');
  if (c.length < 15 || c[6] !== 'P') continue;
  const [id, name, , , lat, lng, , fc, cc, , a1] = c, pop = +c[14];
  if (cc !== ISO2 || (!KEEP.has(fc) && !INCLUDE.has(id)) || EXCLUDE.has(id)) continue;
  places.push({ id, name, lat: +lat, lng: +lng, fc, adm: a1, pop });
}
places.sort((a, b) => b.pop - a.pop);
const top = +o.top, picked = new Map();
for (const p of places) {
  if (picked.size >= top) break;
  if (p.pop > 0 || INCLUDE.has(p.id)) picked.set(p.id, p);
}
for (const p of places) if (p.fc === 'PPLC' || p.fc === 'PPLA' || INCLUDE.has(p.id)) picked.set(p.id, p);
const list = [...picked.values()].sort((a, b) => b.pop - a.pop);

const admin1 = fs.readFileSync(await cached('https://download.geonames.org/export/dump/admin1CodesASCII.txt', 'geonames_admin1CodesASCII.txt'), 'utf8');
const REGIONS = {};
for (const line of admin1.split('\n')) {
  const [code, name] = line.split('\t');
  if (code?.startsWith(ISO2 + '.')) REGIONS[code.slice(ISO2.length + 1)] = name;
}

/* ---------- Wikidata: English and local names ---------- */
async function sparql(query) {
  for (let i = 0; i < 7; i++) {
    const res = await fetch('https://query.wikidata.org/sparql', {
      method: 'POST',
      headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'query=' + encodeURIComponent(query),
    }).catch(() => null);
    if (res?.ok) return (await res.json()).results.bindings;
    const wait = +(res?.headers.get('retry-after') || 0) * 1000 || 3000 * 2 ** i;
    console.warn(`Wikidata ${res?.status ?? 'network error'}, retrying in ${Math.round(wait / 1000)} s`);
    await sleep(wait + Math.random() * 2000);
  }
  throw new Error('Wikidata query failed repeatedly');
}
const WD = {}; // geonameid -> { en, [lang]: label }
for (let i = 0; i < list.length; i += 150) {
  const batch = list.slice(i, i + 150);
  const vars = ALL_LANGS.map((l, j) => `OPTIONAL { ?item rdfs:label ?l${j} FILTER(LANG(?l${j}) = "${l}") }`).join('\n');
  const rows = await sparql(`SELECT ?gn ?item ?en ${ALL_LANGS.map((_, j) => `?l${j}`).join(' ')} WHERE {
    VALUES ?gn { ${batch.map(p => `"${p.id}"`).join(' ')} }
    ?item wdt:P1566 ?gn .
    OPTIONAL { ?item rdfs:label ?en FILTER(LANG(?en) = "en") }
    ${vars}
  }`);
  for (const r of rows) {
    const gn = r.gn.value, cur = WD[gn];
    const rec = { en: r.en?.value, ...Object.fromEntries(ALL_LANGS.map((l, j) => [l, r[`l${j}`]?.value])) };
    // Several items can carry the same GeoNames ID: keep the one with the most names.
    const score = x => x ? Object.values(x).filter(Boolean).length : -1;
    if (score(rec) > score(cur)) WD[gn] = rec;
  }
  await sleep(1200 + Math.random() * 800);
}

/* ---------- fallback: GeoNames alternate names ---------- */
const langOf = p => LANG_BY_REGION[p.adm] || LANGS[0];
let ALT = null;
async function altNames() {
  if (ALT) return ALT;
  ALT = {};
  const txt = unzipText(await cached(`https://download.geonames.org/export/dump/alternatenames/${ISO2}.zip`, `geonames_alt_${ISO2}.zip`), `${ISO2}.txt`);
  const want = new Set(list.map(p => p.id));
  for (const line of txt.split('\n')) {
    const c = line.split('\t');
    if (!want.has(c[1]) || !c[2]) continue;
    (ALT[c[1]] ??= []).push({ lang: c[2], name: c[3], preferred: c[4] === '1', short: c[5] === '1', historic: c[7] === '1' });
  }
  return ALT;
}
async function fallback(p, lang) {
  const names = ((await altNames())[p.id] || []).filter(n => n.lang === lang && !n.historic);
  return (names.find(n => n.preferred) || (names.length === 1 ? names[0] : null))?.name || null;
}

/* ---------- write ---------- */
const out = [];
let noLocal = 0;
for (const p of list) {
  const wd = WD[p.id] || {}, lang = langOf(p);
  let local = wd[lang] || await fallback(p, lang);
  for (const re of o.strip) if (local) local = local.replace(new RegExp(re, 'u'), '').trim() || local;
  if (!local) noLocal++;
  const [x, y] = proj([p.lng, p.lat]);
  out.push({ id: p.id, en: wd.en || p.name, local, lang, lat: round(p.lat, 4), lng: round(p.lng, 4), x: round(x, 1), y: round(y, 1), pop: p.pop, adm: p.adm, fc: p.fc });
}
const usedRegions = Object.fromEntries([...new Set(out.map(c => c.adm))].map(a => [a, REGIONS[a] || a]));
const CITIES = { country: o.name, iso3: o.iso3.toUpperCase(), langs: LANGS, w, h, kpu: kmPerUnit(proj, w, h), proj: def, land, lines, ctx, regions: usedRegions, list: out };
fs.mkdirSync(path.dirname(o.out), { recursive: true });
fs.writeFileSync(o.out, `// ${o.name}: the ${out.length} largest cities by population (top ${top} plus every capital), generated by tools/cities.mjs.
// Cities: GeoNames (geonames.org, CC BY 4.0), filtered and modified. Names: Wikidata (CC0). Base map: ${path.basename(o.adm1)}.
// Fields: id (GeoNames), en, local (name in the local language and script, null if unknown), lang, lat/lng, x/y (map
// units, same projection as land/lines), pop, adm (GeoNames first-level region, named in regions), fc (GeoNames type).
const CITIES = ${JSON.stringify(CITIES)};\n`);
console.log(`${out.length} cities (${noLocal} without a local name), ${Object.keys(usedRegions).length} regions, map ${w}x${h}, ${(fs.statSync(o.out).size / 1024).toFixed(0)} KB -> ${o.out}`);
