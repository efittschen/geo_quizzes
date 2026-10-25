#!/usr/bin/env node
// A country's city quiz from lloyd.py's levels: quizzes/<slug>-cities/cities.js gets the new list (the old one goes),
// its index.html the rounds Top 10 and Top 25 (and All, the 100).
//
//   node tools/builds/city-vali/quiz.mjs <cc> [--dry]
//
// The list: the towns of the 10 level, then those the 25 level adds, then those the 100 level adds, each part by
// population (CITIES.order 'spawns': the custom quizzes offer this order and the one by population). A town the old
// list had keeps its entry there (names set right by hand when it was made); a new one gets its names from Wikidata
// (CC0) by its GeoNames ID: English (GeoNames' name where Wikidata's is that of an administrative unit, such as "Ura
// Gewog", or has a comma or brackets), and the local language (cut at a comma or bracket: "फतेहपुर, उत्तर प्रदेश"; without what signs leave off: "เทศบาลเมือง", "kirkonkylä", "Ciudad de", "Kampung") of the old list's towns in its region (else the
// country's first), else GeoNames' name. Regions: the old ones, and new ones by GeoNames' admin1 names.
// --dry prints the list and the new names, and writes nothing.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { geoAlbersUsa, geoDistance } from 'd3-geo';
import { ROOT, CACHE, UA, cached, projectionFrom, sleep } from '../../lib/geo.mjs';

const cc = (process.argv[2] || '').toUpperCase(), DRY = process.argv.includes('--dry');
const WORK = path.join(CACHE, 'builds', 'city-vali'), EARTH = 6371;
const Q = JSON.parse(fs.readFileSync(path.join(WORK, 'countries.json'), 'utf8')).find(q => q.cc === cc);
if (!Q) { console.error('usage: quiz.mjs <cc> [--dry]'); process.exit(1); }
const L = JSON.parse(fs.readFileSync(path.join(WORK, `${cc}_MovingWorld_200000_levels.json`), 'utf8'));
const TOWNS = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(WORK, `${cc}_towns.json`), 'utf8')).towns.map(t => [t.id, t]));
const file = path.join(ROOT, 'quizzes', `${Q.slug}-cities`, 'cities.js'), page = path.join(ROOT, 'quizzes', `${Q.slug}-cities`, 'index.html');
// the old list: the copy kept before the first write (tools/cache/builds/city-vali/old/), else the file as it is
const oldFile = path.join(WORK, 'old', `${Q.slug}-cities.js`), src = fs.readFileSync(fs.existsSync(oldFile) ? oldFile : file, 'utf8'), ctx = {}; vm.createContext(ctx);
vm.runInContext(src.replace('const CITIES', 'var CITIES'), ctx);
const C = ctx.CITIES, OLD = Object.fromEntries(C.list.map(c => [c.id, c]));
const ids = L.levels.flatMap(l => l.new), cut = L.levels.map(l => l.k);

// the local language of a region: what the old list's towns there are in
const langOf = adm => {
  const n = {}; for (const c of C.list) if (c.adm === adm && c.lang) n[c.lang] = (n[c.lang] || 0) + 1;
  return Object.entries(n).sort((x, y) => y[1] - x[1])[0]?.[0] || C.langs[0];
};

// Wikidata names of the new towns
const namesFile = path.join(WORK, `names_${cc}.json`), NAMES = fs.existsSync(namesFile) ? JSON.parse(fs.readFileSync(namesFile, 'utf8')) : {};
const fresh = ids.filter(id => !OLD[id] && !NAMES[id]), langs = [...new Set([...C.langs, ...fresh.map(id => langOf(TOWNS[id].adm))])];
for (let i = 0; i < fresh.length; i += 150) {
  const batch = fresh.slice(i, i + 150);
  const query = `SELECT ?gn ?lang ?label WHERE { VALUES ?gn { ${batch.map(id => `"${id}"`).join(' ')} } ?item wdt:P1566 ?gn .
    ?item rdfs:label ?label . BIND(LANG(?label) AS ?lang) FILTER(?lang IN (${['en', ...langs].map(l => `"${l}"`).join(', ')})) }`;
  let rows = null;
  for (let t = 0; t < 6 && !rows; t++) {
    const res = await fetch('https://query.wikidata.org/sparql', { method: 'POST', headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'query=' + encodeURIComponent(query) }).catch(() => null);
    if (res?.ok) rows = (await res.json()).results.bindings; else await sleep(3000 * 2 ** t);
  }
  if (!rows) throw new Error('Wikidata query failed repeatedly');
  for (const id of batch) NAMES[id] = {};
  for (const r of rows) (NAMES[r.gn.value] ??= {})[r.lang.value] ??= r.label.value;
  fs.writeFileSync(namesFile, JSON.stringify(NAMES));
  await sleep(1500);
}

// regions: the old names, and GeoNames' for new ones
const admin1 = fs.readFileSync(await cached('https://download.geonames.org/export/dump/admin1CodesASCII.txt', 'geonames_admin1CodesASCII.txt'), 'utf8');
const ADM = Object.fromEntries(admin1.split('\n').filter(l => l.startsWith(cc + '.')).map(l => { const c = l.split('\t'); return [c[0].slice(cc.length + 1), c[1]]; }));
const regions = { ...C.regions };
for (const id of ids) { const a = (OLD[id] || TOWNS[id]).adm; regions[a] ??= ADM[a] || a; }

// points of the old lists set right
const FIX = { JP: { 16201: { lat: 36.6959, lng: 137.2137 } } }; // Toyama: the old point lay 18 km off, in the middle of the municipality's mountains
const proj = C.proj.type === 'albersUsa' ? geoAlbersUsa().scale(C.proj.scale).translate(C.proj.translate) : projectionFrom(C.proj);
const round = (v, n) => Math.round(v * 10 ** n) / 10 ** n;
// what a Wikidata or GeoNames name carries besides the town's name on signs, per language
const AFFIX = {
  en: [/^Kampung\s+/, /^Thị [Tt]rấn\s+/, /\s+(village|city|town)$/i, /\s*\(.*\)\s*$/],
  th: [/^เทศบาล(นคร|เมือง|ตำบล)/], fi: [/n kirkonkylä$/, / kirkonkylä$/], sv: [/ kyrkoby$/], es: [/^[Cc]iudad de /], vi: [/^Thị [Tt]rấn\s+/],
};
// names set right by hand (GeoNames ID -> fields), from the checks of the new towns
const NAMEFIX = {
  PE: { 3698194: { en: 'Chocope' } }, MY: { 1736633: { en: 'Kundasang' } }, ES: { 2520171: { en: 'Caravaca de la Cruz', local: 'Caravaca de la Cruz' } },
  IT: { 2523577: { en: 'Rossano', local: 'Rossano' } },
};
const bare = (name, lang) => (AFFIX[lang] || []).reduce((s, re) => s.replace(re, ''), name).trim();
const list = ids.map(id => {
  if (OLD[id] && FIX[cc]?.[id]) { const c = { ...OLD[id], ...FIX[cc][id] }, [x, y] = proj([c.lng, c.lat]); return { ...c, x: round(x, 1), y: round(y, 1) }; }
  if (OLD[id]) return OLD[id];
  const t = TOWNS[id], lang = langOf(t.adm), nm = NAMES[id] || {}, [x, y] = proj([t.lng, t.lat]);
  const admin = /\b(gewog|district|union|upazila|municipality|commune|township|county|province|region|prefecture|department|parish|ward|division|rural|urban|council)\b|[,(]/i;
  const c = { id, en: bare(nm.en && !admin.test(nm.en) ? nm.en : t.name, 'en'), local: lang === 'en' ? null : (nm[lang] && bare(nm[lang].split(/\s*[,(（]/)[0], lang)) || null, lang, lat: round(t.lat, 4), lng: round(t.lng, 4), x: round(x, 1), y: round(y, 1), pop: t.pop, adm: t.adm, fc: t.fc };
  Object.assign(c, NAMEFIX[cc]?.[id]);
  if (C.proj.type === 'albersUsa') c.k = round(geoDistance(proj.invert([x - 0.5, y]), proj.invert([x + 0.5, y])) * EARTH, 3); // km per map unit, as the old list has it
  return c;
});
const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.round(n / 1000) + 'k';
const added = list.filter(c => !OLD[c.id]);
console.log(`${cc}: ${list.length} towns (levels ${cut.join(', ')}); ${added.length} not on the old list${added.length ? ': ' + added.map(c => `${c.en}${c.local && c.local !== c.en ? ` / ${c.local}` : ''} ${fmt(c.pop)}${NAMES[c.id]?.en ? '' : ' (GeoNames name)'}`).join(', ') : ''}`);
if (DRY) process.exit(0);

// cities.js: the header, the list, the order
const NEW = { ...C, order: 'spawns', regions, list };
const header = `// ${C.country}: ${list.length} cities for the map "A Moving World", picked by tools/builds/city-vali (lloyd.py, quiz.mjs).
// Where Vali (github.com/slashP/Vali) puts that map's locations was run again on the Street View coverage of its
// location pool, ${L.merge > 1 ? `the locations merged in ${L.merge}s, ` : ''}and the towns chosen so that each part of the country has as many as its share of
// the locations: every town serves an equal share, handed out by optimal transport, at the least sum of distance /
// population^${L.alpha} (so larger towns may serve from farther). Levels ${cut.join(', ')}, each holding the one before; in the list,
// each level's new towns by population. Candidates: ${L.floor ? `the towns of the earlier list of this quiz and GeoNames towns of ${L.floor.toLocaleString('en')}+ people` : 'the towns of the earlier list of this quiz'}, with covered road near them.
// Cities: GeoNames (geonames.org, CC BY 4.0), filtered and modified. Names: Wikidata (CC0), set right by hand where the
// earlier list of this quiz had the town. Base map: as before.
// Fields: id (GeoNames), en, local (name in the local language and script, null if unknown), lang, lat/lng, x/y (map
// units, same projection as land/lines), pop, adm (GeoNames first-level region, named in regions), fc (GeoNames type).
const CITIES = `;
fs.writeFileSync(file, header + JSON.stringify(NEW) + ';\n');

// index.html: the rounds (Top 10, Top 25, then All), and the description
const top = cut.slice(0, -1);
let html = fs.readFileSync(page, 'utf8');
html = html.replace(/const CITY_OPTS = \{([^]*?)\};/, (m, body) => {
  body = body.replace(/,?\s*top: \[[^\]]*\]/, '');
  return `const CITY_OPTS = {${body.replace(/\s*$/, '')}, top: [${top.join(', ')}] };`;
});
html = html.replace(/(<meta name="description" content=")([^"]*)"/, (m, a, d) => a + d.replace(/the largest cities of /, 'the cities of ').replace(/'s largest cities/, "'s cities") + '"');
fs.writeFileSync(page, html);
console.log(`-> ${path.relative(ROOT, file)}, ${path.relative(ROOT, page)} (rounds ${top.map(n => 'Top ' + n).join(', ')}, All)`);
