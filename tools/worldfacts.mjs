#!/usr/bin/env node
// worldfacts: facts about every place on the world map -> quizzes/shared/world-facts.js, and the flags of the
// flag quiz -> quizzes/world-flags/img/. The world quizzes (shared/world-config.js) are built from them.
//
//   node tools/worldfacts.mjs
//
// Writes  const FACTS = { sv, left, tld, idd, flag }
//   sv    the places GeoGuessr players meet: those with a Plonk It guide (plonkit.net/guide), i.e. with official
//         Street View coverage
//   left  the places that drive on the left (Wikidata, driving side P1622)
//   tld   { place: '.de' }       its country code top-level domain, where one is in use
//   idd   { place: ['+49'] }     its calling code; North American numbers outside the US and Canada come with
//                                their area code ('+1 876')
//   flag  { place: 'de' }        its picture in world-flags/img/ (flag-icons, MIT); a place that flies another
//                                country's flag names that one
// Places are the ids of quizzes/shared/world.js. Sources are downloaded once into tools/cache/worldfacts/.
import fs from 'node:fs';
import path from 'node:path';
import { cached, sleep, ROOT, CACHE } from './lib/geo.mjs';

const DIR = 'worldfacts';
fs.mkdirSync(path.join(CACHE, DIR, 'flags'), { recursive: true });
const json = async (url, name) => JSON.parse(fs.readFileSync(await cached(url, path.join(DIR, name)), 'utf8'));

const WORLD = new Function(fs.readFileSync(path.join(ROOT, 'quizzes', 'shared', 'world.js'), 'utf8') + ';return WORLD')();
// Not places of their own in any list: a glacier, uninhabited reefs, and two states no list knows.
const SKIP = new Set(['KAS', 'ATC', 'SOL', 'CYN']);
const places = WORLD.reg.filter(r => !SKIP.has(r.id));

const countries = await json('https://raw.githubusercontent.com/mledoze/countries/master/countries.json', 'countries.json');
const C = Object.fromEntries(countries.map(c => [c.cca2, c]));
const missing = places.filter(r => !C[r.i2]).map(r => r.id);
if (missing.length) console.warn('warning: no facts for', missing.join(' '));

// Street View: the places with a Plonk It guide. Regions of a country (US-AK, PT-AZ) and general guides are passed over.
const guides = (await json('https://www.plonkit.net/api/guides', 'plonkit-guides.json')).data;
const guided = new Set(guides.map(g => g.code).filter(code => /^[A-Z]{2}$/.test(code)));
const ALSO = { PSX: 'IL' }; // the guide "Israel & the West Bank"
const sv = places.filter(r => guided.has(r.i2) || guided.has(ALSO[r.id])).map(r => r.id);

// Driving side, by ISO alpha-3 code.
const query = 'SELECT ?a3 ?sideLabel WHERE { ?c wdt:P298 ?a3 . ?c p:P1622 ?st . ?st ps:P1622 ?side . FILTER NOT EXISTS { ?st pq:P582 ?end } SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } }';
const sides = (await json(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`, 'side.json')).results.bindings;
const leftA3 = new Set(sides.filter(b => b.sideLabel.value === 'left').map(b => b.a3.value));
const left = places.filter(r => C[r.i2] && leftA3.has(C[r.i2].cca3)).map(r => r.id);

// Domains. Assigned but not in use (Svalbard is .no, Saint Martin and Saint Barthélemy .fr) or not assigned (Kosovo,
// Western Sahara): no domain of their own.
const NO_TLD = new Set(['KOS', 'SJM', 'BLM', 'MAF', 'SAH']);
const tld = Object.fromEntries(places.filter(r => C[r.i2] && !NO_TLD.has(r.id) && /^\.[a-z]{2}$/.test(C[r.i2].tld[0] || '')).map(r => [r.id, C[r.i2].tld[0]]));

// Calling codes. The dataset splits a code into root and suffixes: one suffix completes it (+4|9); Russia and
// Kazakhstan share +7; the US and Canada are +1, the other North American places +1 and their area codes.
// Western Sahara dials Morocco's code, the Vatican Rome's numbers, Åland Finland's and Svalbard Norway's; Saint Helena
// without Ascension's +247.
const IDD = { SAH: ['+212'], VAT: ['+39'], ALD: ['+358'], SJM: ['+47'], SHN: ['+290'] };
const idd = {};
for (const r of places) {
  const d = C[r.i2] && C[r.i2].idd;
  if (IDD[r.id]) idd[r.id] = IDD[r.id];
  else if (!d || !d.root) continue;
  else if (d.root === '+7' || (d.root === '+1' && d.suffixes.length > 3)) idd[r.id] = [d.root];
  else if (d.root === '+1') idd[r.id] = d.suffixes.map(s => `+1 ${s}`);
  else idd[r.id] = d.suffixes.map(s => d.root + s);
}

// Flags: one picture per place. Places whose only official flag is their country's use that picture.
const FLIES = { REU: 'FRA', MYT: 'FRA', GLP: 'FRA', GUF: 'FRA', MAF: 'FRA', BLM: 'FRA', SPM: 'FRA', WLF: 'FRA', ATF: 'FRA', NCL: 'FRA', SJM: 'NOR', HMD: 'AUS' };
const out = path.join(ROOT, 'quizzes', 'world-flags', 'img');
fs.mkdirSync(out, { recursive: true });
const flag = {};
const I2 = Object.fromEntries(WORLD.reg.map(r => [r.id, r.i2.toLowerCase()]));
for (const r of places) {
  const code = I2[FLIES[r.id] || r.id], file = path.join(CACHE, DIR, 'flags', `${code}.svg`), had = fs.existsSync(file);
  try { await cached(`https://cdn.jsdelivr.net/npm/flag-icons@7/flags/4x3/${code}.svg`, path.join(DIR, 'flags', `${code}.svg`)); }
  catch (e) { console.warn(`warning: no flag for ${r.id}: ${e.message}`); continue; }
  if (!had) await sleep(150);
  fs.copyFileSync(file, path.join(out, `${code}.svg`));
  flag[r.id] = code;
}

const file = path.join(ROOT, 'quizzes', 'shared', 'world-facts.js');
const head = `// Generated by tools/worldfacts.mjs: Street View places (plonkit.net/guide), driving side (Wikidata), domains and calling codes (mledoze/countries, ODbL), flags (flag-icons, MIT)\n`;
fs.writeFileSync(file, `${head}const FACTS = ${JSON.stringify({ sv, left, tld, idd, flag })};\n`);
const kb = fs.readdirSync(out).reduce((sum, f) => sum + fs.statSync(path.join(out, f)).size, 0) / 1024;
console.log(`${places.length} places: ${sv.length} with Street View, ${left.length} drive on the left, ${Object.keys(tld).length} domains, ${Object.keys(idd).length} with a calling code, ${new Set(Object.values(flag)).size} flags (${kb.toFixed(0)} KB)`);
