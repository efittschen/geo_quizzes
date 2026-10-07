#!/usr/bin/env node
// The postcodes that have an area of their own, for tools/postcodes.mjs --only. Without the list the postcodes of
// PO boxes and single organisations count too, and are drawn as land around their post office.
//
//   node tools/builds/postcodes/areas.mjs US AU     writes tools/cache/builds/postcode-areas/<CC>.txt, one per line
//
// US: the ZIP Code Tabulation Areas of the Census Bureau (gazetteer file of 2024; public domain).
// AU: the Postal Areas of the Australian Bureau of Statistics (ASGS Edition 3, 2021; CC BY 4.0).
import fs from 'node:fs';
import path from 'node:path';
import { cached, unzipText, CACHE } from '../../lib/geo.mjs';

const DIR = path.join('builds', 'postcode-areas');
fs.mkdirSync(path.join(CACHE, DIR), { recursive: true });
const LIST = {
  US: async () => unzipText(await cached('https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_Gaz_zcta_national.zip', path.join(DIR, '2024_Gaz_zcta_national.zip')), '2024_Gaz_zcta_national.txt')
    .split('\n').slice(1).map(l => l.split('\t')[0].trim()),
  AU: async () => { // the service answers 2,000 areas at a time
    const codes = [];
    for (let at = 0; ; at += 2000) {
      const url = `https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/POA/MapServer/2/query?where=1%3D1&outFields=poa_code_2021&returnGeometry=false&orderByFields=poa_code_2021&resultOffset=${at}&f=json`;
      const page = JSON.parse(fs.readFileSync(await cached(url, path.join(DIR, `au_poa_${at}.json`)), 'utf8')).features;
      codes.push(...page.map(f => f.attributes.poa_code_2021));
      if (page.length < 2000) return codes;
    }
  },
};
for (const cc of process.argv.slice(2)) {
  const codes = [...new Set((await LIST[cc]()).filter(c => /^\d+$/.test(c)))].sort();
  fs.writeFileSync(path.join(CACHE, DIR, `${cc}.txt`), codes.join('\n') + '\n');
  console.log(`${cc}: ${codes.length} postcodes with an area`);
}
