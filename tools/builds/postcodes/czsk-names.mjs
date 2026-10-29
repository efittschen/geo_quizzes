// Czechia's and Slovakia's postcode quizzes (their post.js, in data/maps/<quiz id>/) under the names the countries use:
// regions as the kraje are called (GeoNames has Slovakia's in ASCII: Banska Bystrica), and the English names GeoNames
// gives a few cities (Prague, Pilsen). Run by build-all.sh after the postcode quizzes are made.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../../lib/geo.mjs';

const MAP = {
  czechia: { r: { 'Hlavní město Praha': 'Praha' }, c: { Prague: 'Praha', Pilsen: 'Plzeň', 'Brno střed': 'Brno-střed' } },
  slovakia: { r: { Bratislava: 'Bratislavský kraj', Trnava: 'Trnavský kraj', Trencin: 'Trenčiansky kraj', Nitra: 'Nitriansky kraj', Zilina: 'Žilinský kraj', 'Banska Bystrica': 'Banskobystrický kraj', Presov: 'Prešovský kraj', Kosice: 'Košický kraj' }, c: {} },
};
for (const [slug, M] of Object.entries(MAP)) {
  const file = path.join(ROOT, 'data', 'maps', `${slug}-postcodes`, 'post.js');
  const src = fs.readFileSync(file, 'utf8');
  const P = new Function(src + ';return POST')();
  const fix = (s, m) => s.split(', ').map(x => m[x] || x).join(', ');
  for (const k of Object.keys(P.name)) P.name[k] = [fix(P.name[k][0], M.r), fix(P.name[k][1], M.c)];
  const head = src.slice(0, src.indexOf('const POST')).replace(/\n$/, '') + '\n// Names: the kraje as the country calls them and the cities by their local names (set after the tool ran).\n';
  fs.writeFileSync(file, head + `const POST = ${JSON.stringify(P)};\n`);
  console.log(slug, [...new Set(Object.values(P.name).flatMap(v => v[0].split(', ')))].join(' | '));
}
