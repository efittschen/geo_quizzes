// OSM relations -> units (pre-2020 raions and the territories of cities of oblast significance), each with the
// Ukrtelecom towns inside it. Writes units.json (geometry + towns) and prints a review report.
//   node assemble.js [oblast ...]
const fs = require('fs');
const g = require('./osmgeo.js');
const { pc } = g;
const { places, norm } = require('./geocode.js');
const { rels, ways } = g.load('osm');
const index = require('./rel_index.json');
const towns = require('./towns.json');
const only = process.argv.slice(2);

const OBL = { 'Вінницька': 'vinnytsia', 'Волинська': 'volyn', 'Дніпропетровська': 'dnipropetrovsk', 'Донецька': 'donetsk', 'Житомирська': 'zhytomyr', 'Закарпатська': 'zakarpattia', 'Запорізька': 'zaporizhzhia', 'Івано-Франківська': 'ivanofrankivsk', 'Київська': 'kyivoblast', 'Київ': 'kyiv', 'Кіровоградська': 'kirovohrad', 'Луганська': 'luhansk', 'Львівська': 'lviv', 'Миколаївська': 'mykolaiv', 'Одеська': 'odesa', 'Полтавська': 'poltava', 'Рівненська': 'rivne', 'Сумська': 'sumy', 'Тернопільська': 'ternopil', 'Харківська': 'kharkiv', 'Херсонська': 'kherson', 'Хмельницька': 'khmelnytskyi', 'Черкаська': 'cherkasy', 'Чернівецька': 'chernivtsi', 'Чернігівська': 'chernihiv', 'АР Крим': 'crimea', 'Севастополь': 'sevastopol' };
const byId = new Map(); for (const r of index) if (!byId.has(r.id)) byId.set(r.id, r);
const geomCache = new Map();
const geomOf = id => { if (!geomCache.has(id)) { const p = g.polyOf(rels.get(id), ways); if (p.open || p.missing) console.log('  ! open/missing ways:', rels.get(id).tags.name, p.open, p.missing); geomCache.set(id, p.geom); } return geomCache.get(id); };
const { nameMatch } = require('./match.js');
const ukName = r => { const t = rels.get(r.id).tags; return t['name:uk'] || t.name; };
const safe = (fn, ...a) => { try { return fn(...a); } catch (e) { console.log('  ! clip error', e.message.slice(0, 80)); return null; } };

const out = [];
const oblasts = [...new Set(index.map(r => r.o))].filter(o => !only.length || only.includes(o)).sort();
for (const o of oblasts) {
  const mine = [...byId.values()].filter(r => r.o === o && rels.has(r.id));
  const a4 = mine.filter(r => r.kind === 'a4' && /область$|Автономна Республіка Крим|^Київ$|^Севастополь$/.test(r.name))[0];
  if (!a4) { console.log(o, 'no a4 relation yet'); continue; }
  const A4 = geomOf(a4.id);
  console.log(`\n## ${o}: ${a4.name} ${Math.round(g.area(A4))} km²`);
  const units = [];
  if (o === 'kyiv' || o === 'sevastopol') units.push({ kind: 'city', name: a4.name, geom: A4 });
  else {
    // raions: historic relations (not city districts, not Chornobyl raion, which lies inside Ivankiv raion)
    const isDistrict = r => /^\d{2}1\d{2}3/.test(r.koatuu || '');
    let ra = o === 'crimea' ? mine.filter(r => r.kind === 'a6' && /ский район$/.test(r.name))
      : mine.filter(r => r.kind === 'hr' && !isDistrict(r) && r.name !== 'Чорнобильський район');
    const seen = new Set(); ra = ra.filter(r => !seen.has(r.id) && seen.add(r.id));
    for (const r of ra) units.push({ kind: 'raion', name: ukName(r), alt: r.name, id: r.id, geom: geomOf(r.id) });
    if (o === 'crimea') for (const r of mine.filter(r => r.kind === 'a6' && /округ/.test(r.name))) units.push({ kind: 'city', name: ukName(r), alt: r.name, id: r.id, geom: geomOf(r.id) });
    // what the raions leave of the oblast: cities of oblast significance, raions that are not in OSM as historic
    let left = A4;
    for (const u of units) { const d = safe(pc.difference, left, u.geom); if (d) left = d; }
    // a raion that was not changed in 2020 is still a current one: it lies in what is left, whole
    if (o !== 'crimea') for (const r of mine.filter(r => r.kind === 'a6')) {
      const G = geomOf(r.id), inter = safe(pc.intersection, left, G) || [];
      if (g.area(inter) > 0.97 * g.area(G)) { units.push({ kind: 'raion', name: r.name, id: r.id, geom: G, unchanged: true }); left = safe(pc.difference, left, G) || left; console.log('  unchanged raion:', r.name); }
    }
    // cities: historic city councils that lie in what is left
    const hc = mine.filter(r => r.kind === 'hc').map(r => ({ ...r, geom: geomOf(r.id) })).filter(c => c.geom.length);
    for (const c of hc) {
      const inter = safe(pc.intersection, left, c.geom) || [], a = g.area(inter), A = g.area(c.geom);
      if (a > 0.9 * A && A > 0.5) { units.push({ kind: 'city', name: c.name, id: c.id, geom: inter }); left = safe(pc.difference, left, inter) || left; }
    }
    // the rest, piece by piece
    for (const p of left) {
      const a = g.polyArea(p); if (a < 0.02) continue;
      units.push({ kind: 'rest', name: 'rest', geom: [p], thin: a / g.perimeter(p) });
    }
  }
  // Chornobyl raion (abolished 1988, now in Ivankiv raion) has its own code: cut it out of Ivankiv raion
  if (o === 'kyivoblast') {
    const ch = mine.find(r => r.name === 'Чорнобильський район'), iv = units.find(u => u.name === 'Іванківський район');
    if (ch && iv) { const C = pc.intersection(iv.geom, geomOf(ch.id)); iv.geom = pc.difference(iv.geom, C); units.push({ kind: 'raion', name: ch.name, id: ch.id, geom: C }); }
  }
  for (const u of units) { u.o = o; u.area = g.area(u.geom); u.bbox = g.bbox(u.geom); u.towns = []; }
  out.push(...units);
  console.log(`  ${units.filter(u => u.kind === 'raion').length} raions, ${units.filter(u => u.kind === 'city').length} cities, ${units.filter(u => u.kind === 'rest').length} rest pieces; covered ${Math.round(units.reduce((s, u) => s + u.area, 0))} km²`);
}

// towns -> units. A name found several times in the oblast: the one in the raion named after it, else the largest.
const unitAt = (lng, lat, o) => out.find(u => u.o === o && lng >= u.bbox[0] && lng <= u.bbox[2] && lat >= u.bbox[1] && lat <= u.bbox[3] && g.inMulti(u.geom, lng, lat));
const ADM1 = { vinnytsia: '23', volyn: '24', dnipropetrovsk: '04', donetsk: '05', zhytomyr: '27', zakarpattia: '25', zaporizhzhia: '26', ivanofrankivsk: '06', kyivoblast: '13', kyiv: '12', kirovohrad: '10', luhansk: '14', lviv: '15', mykolaiv: '16', odesa: '17', poltava: '18', rivne: '19', sumy: '21', ternopil: '22', kharkiv: '07', kherson: '08', khmelnytskyi: '09', cherkasy: '01', chernivtsi: '03', chernihiv: '02', crimea: '11', sevastopol: '20' };
const byName = new Map();
for (const p of places.values()) for (const n of new Set([...p.alts, ...p.uk.map(u => u.n)].map(norm))) { const k = p.adm1 + '|' + n; if (!byName.has(k)) byName.set(k, []); byName.get(k).push(p); }
const GEONAME = { 'Володарськ-Волинський': 'Хорошів', 'Котовськ': 'Подільськ', 'Новий Роздол': 'Новий Розділ', 'Переяслав-Хмельницький': 'Переяслав', 'Ульянівка': 'Благовіщенське', 'Шумське': 'Шумськ', 'Дзержинськ|Житомирська': 'Романів', 'Поліське': 'Красятичі' };
// a name found twice in the oblast, by the raion its code belongs to
const IN_UNIT = { 'Калинівка|Київська': 'Васильківський район' };
const placed = [];
for (const t of towns) {
  const o = OBL[t.obl]; if (only.length && !only.includes(o) && !(o === 'crimea' && only.includes('sevastopol'))) continue;
  const name = GEONAME[t.name + '|' + t.obl] || GEONAME[t.name] || t.name, nn = norm(name);
  let cands = (byName.get(ADM1[o] + '|' + nn) || []).concat(o === 'crimea' ? byName.get('20|' + nn) || [] : []).map(p => ({ lat: p.lat, lng: p.lng, pop: p.pop, fc: p.fc, gn: p.name, gid: p.id, uk: p.uk, cur: p.uk.some(u => !u.hist && norm(u.n) === nn) ? 1 : 0 }));
  if (!cands.length && t.lat !== undefined) cands = [{ lat: t.lat, lng: t.lng, pop: t.pop || 0, fc: '', gn: t.gn || t.name, uk: [], cur: 1 }];
  let best = null;
  for (const c of cands) {
    const u = unitAt(c.lng, c.lat, o) || (o === 'crimea' ? unitAt(c.lng, c.lat, 'sevastopol') : null) || (o === 'kyivoblast' ? unitAt(c.lng, c.lat, 'chernihiv') : null);
    c.unit = u;
    c.score = (u && IN_UNIT[t.name + '|' + t.obl] === u.name ? 200 : 0) + (u && (nameMatch(u.name, name) || nameMatch(u.alt || u.name, name)) ? 100 : 0) + c.cur * 4 + Math.log10(c.pop + 1) * 3 + (/PPLA2?$|PPLC/.test(c.fc) ? 4 : 0) + (u ? 1 : 0);
    if (!best || c.score > best.score) best = c;
  }
  const row = { ...t, o, lat: best && best.lat, lng: best && best.lng, gn: best && best.gn, gid: best && best.gid, pop: best && best.pop, ncand: cands.length };
  if (best) { const p = places.get(best.gid); if (p) row.ukNames = p.uk.filter(u => !u.hist).map(u => u.n).filter(n => /[а-яіїєґ]/i.test(n)); }
  placed.push(row);
  if (best && best.unit) best.unit.towns.push(row); else console.log('  ! town outside every unit:', t.name, t.obl, t.id, best && [best.lat, best.lng]);
}
fs.writeFileSync('units.json', JSON.stringify(out));
fs.writeFileSync('placed.json', JSON.stringify(placed));
// report
for (const o of oblasts) {
  const us = out.filter(u => u.o === o); if (!us.length) continue;
  console.log(`\n== ${o}`);
  for (const u of us.sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name))) {
    const codes = [...new Set(u.towns.map(t => t.id))];
    const flag = codes.length === 1 ? ' ' : codes.length === 0 ? '0' : 'M';
    if (u.kind === 'rest' && u.area < 3 && !codes.length) { console.log(`  ${flag} rest ${u.area.toFixed(2)} km² thin ${u.thin.toFixed(3)} @${((u.bbox[1] + u.bbox[3]) / 2).toFixed(3)},${((u.bbox[0] + u.bbox[2]) / 2).toFixed(3)}`); continue; }
    console.log(`  ${flag} ${u.kind} ${u.name} ${Math.round(u.area)} km²${u.kind === 'rest' ? ` @${((u.bbox[1] + u.bbox[3]) / 2).toFixed(3)},${((u.bbox[0] + u.bbox[2]) / 2).toFixed(3)}` : ''}: ${u.towns.map(t => `${t.name} ${t.id}`).join(', ')}`);
  }
}
