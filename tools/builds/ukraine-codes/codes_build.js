// Ukrtelecom towns -> canonical codes. Writes towns.json: [{ name, obl, raw, forms, id, lat, lng, gn, pop, src }]
const fs = require('fs');
const { geocode } = require('./geocode.js');
const rows = JSON.parse(fs.readFileSync('ukrt_rows.json', 'utf8')).filter(r => r[1]).map(r => r.slice(1, 4));
function forms(c) {
  const out = []; let base = '';
  for (let part of c.split(',')) {
    part = part.trim(); if (!part) continue;
    if (part.startsWith('"')) { out.push(base + part.replace(/"/g, '')); continue; }
    const m = part.match(/^0?(\d+)\s*(?:"(\d+)")?$/); if (!m) throw new Error('code? ' + c);
    base = m[1]; out.push(base + (m[2] || ''));
  }
  return out;
}
// Names Ukrtelecom still lists under a pre-2016 name or another spelling -> the name GeoNames knows (for geocoding only)
const GEONAME = { 'Володарськ-Волинський': 'Хорошів', 'Котовськ': 'Подільськ', 'Новий Роздол': 'Новий Розділ', 'Переяслав-Хмельницький': 'Переяслав', 'Ульянівка': 'Благовіщенське', 'Шумське': 'Шумськ' };
// not found by name in GeoNames (spelling): coordinates and Wikidata item by hand
const MANUAL = {
  'Біловодськ|Луганська': { lat: 49.2086, lng: 39.5861, pop: 7700 },
  'Новоазовськ|Донецька': { lat: 47.1136, lng: 38.0821, pop: 11100 },
  'Овідіополь|Одеська': { lat: 46.24721, lng: 30.43746, pop: 11572 },
  'Ширяєве|Одеська': { lat: 47.38483, lng: 30.19065, pop: 6537 },
  'Ямпіль|Сумська': { lat: 51.94765, lng: 33.78759, pop: 7200 },
};
const FIX = { 'Хотин|Чернівецька': ['3731'], 'Алупка|АР Крим': ['654'] }; // 37312 = 03731 + first subscriber digit; 0654 written with its 0
const towns = rows.map(([name, obl, raw]) => ({ name, obl: obl || 'АР Крим', raw, forms: FIX[name + '|' + (obl || 'АР Крим')] || forms(raw), src: 'ukrtelecom' }));
// Codes missing from the Ukrtelecom list, as in ru.wikipedia "Телефонный план нумерации Украины" and uk.wikipedia "Список телефонних кодів України"
towns.push(
  { name: 'Чернівці', obl: 'Вінницька', raw: '4357', forms: ['4357'], src: 'wikipedia' },
  { name: 'Поліське', obl: 'Київська', raw: '4592', forms: ['4592'], src: 'wikipedia' },
  { name: 'Чорнобиль', obl: 'Київська', raw: '4593', forms: ['4593'], src: 'wikipedia' },
  { name: 'Южне', obl: 'Одеська', raw: '4842', forms: ['4842'], src: 'wikipedia' },
  { name: 'П’ятихатки', obl: 'Дніпропетровська', raw: '5651', forms: ['5651'], src: 'wikipedia' },
  { name: 'Зеленодольськ', obl: 'Дніпропетровська', raw: '5655', forms: ['5655'], src: 'wikipedia' }, // uk.wikipedia list, ru.wikipedia infobox, Wikidata P473
);
const allForms = new Set(towns.flatMap(t => t.forms));
for (const t of towns) {
  const f = t.forms.slice().sort((a, b) => a.length - b.length || a.localeCompare(b));
  if (f.length === 1) t.id = f[0];
  else if (f.length === 2 && f[1] === f[0] + '2' && f[0].length === 2) t.id = f[0];            // 32, 32"2": Lviv, Odesa, Dnipro, Kharkiv, Zaporizhzhia
  else if (f.every(x => x.startsWith(f[0])) && f[0].length === 3 && /^..2$/.test(f[0]) && f[1] === f[0] + '2') t.id = f[0]; // 34 "2","22"
  else { // 563, 5632: the short form if no other place's code starts with it
    const short = f[0], long = f[f.length - 1];
    const shared = [...allForms].some(x => x !== short && x.startsWith(short) && !t.forms.includes(x));
    t.id = shared ? long : short;
  }
  t.alt = t.forms.filter(x => x !== t.id);
}
// towns in the network of a capital: 322 Briukhovychi = Lviv (32), 572 Merefa = Kharkiv (57)
const capital = new Set(towns.filter(t => t.id.length === 2).map(t => t.id));
for (const t of towns) if (t.id.length === 3 && t.id[2] === '2' && capital.has(t.id.slice(0, 2))) { t.alt = [t.id]; t.id = t.id.slice(0, 2); }
for (const t of towns) {
  const g = geocode(GEONAME[t.name] || t.name, t.obl);
  if (g) Object.assign(t, { lat: g.lat, lng: g.lng, gn: g.name, gid: g.id, wd: g.wd, pop: g.pop, fc: g.fc, ukPref: (g.uk.find(u => u.pref) || {}).n, cands: g.n, how: g.how });
  else if (MANUAL[t.name + '|' + t.obl]) Object.assign(t, MANUAL[t.name + '|' + t.obl]);
}
fs.writeFileSync('towns.json', JSON.stringify(towns, null, 0));
const ids = [...new Set(towns.map(t => t.id))].sort();
console.log('towns', towns.length, 'codes', ids.length, 'by length', [2, 3, 4, 5].map(n => ids.filter(i => i.length === n).length));
console.log('2-3 digit:', ids.filter(i => i.length < 4).map(i => i + ' ' + towns.filter(t => t.id === i).map(t => t.name).join('/')).join('; '));
console.log('with alt:', towns.filter(t => t.alt.length).map(t => `${t.name} ${t.id} (${t.alt})`).join('; '));
console.log('no geocode:', towns.filter(t => t.lat === undefined).map(t => t.name + ' ' + t.obl).join('; '));
const per = {}; for (const i of ids) (per[i.slice(0, 2)] ??= []).push(i);
console.log(Object.entries(per).map(([k, v]) => k + ':' + v.length).join(' '));
