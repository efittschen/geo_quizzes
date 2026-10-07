// units.json (raions, cities, rest pieces with their towns) -> one area per code: ukr_code_areas.geojson + codes.json
//   node build.js
const fs = require('fs');
const g = require('./osmgeo.js');
const { pc } = g;
const { norm } = require('./geocode.js');
const { REPO } = require('./lib.js');
let units = require('./units.json');
const { nameMatch } = require('./match.js');
const log = (...a) => console.log(...a);

// By hand, after looking at the report (unit "oblast|name" or "oblast|rest@lat,lng" -> code, or null to drop)
const GEONAME = { 'Володарськ-Волинський': 'Хорошів', 'Котовськ': 'Подільськ', 'Новий Роздол': 'Новий Розділ', 'Переяслав-Хмельницький': 'Переяслав', 'Ульянівка': 'Благовіщенське', 'Шумське': 'Шумськ', 'Артемівськ': 'Бахмут', 'Красноармійськ': 'Покровськ', 'Дніпропетровськ': 'Дніпро', 'Кіровоград': 'Кропивницький', 'Свердловськ': 'Довжанськ', 'Краснодон': 'Сорокине', 'Красний Лиман': 'Лиман', 'Цюрупинськ': 'Олешки', 'Комінтернівське': 'Лиман', 'Володарське': 'Нікольське', 'Тельманове': 'Бойківське', 'Куйбишеве': 'Більмак', 'Фрунзівка': 'Захарівка', 'Красні Окни': 'Окни', 'Червоноармійськ': 'Пулини', 'Щорс': 'Сновськ', 'Дзержинськ': 'Романів', 'Новоград-Волинський': 'Звягель', 'Володимир-Волинський': 'Володимир', 'Мукачеве': 'Мукачів' };
// the unit is named after the town (under any of their names)
const match = (u, t) => Math.max(...[u.name, u.alt || u.name].flatMap(un => [t.name, GEONAME[t.name] || t.name].map(tn => nameMatch(un, tn))));
const OVERRIDE = {
  // raions whose name is too far from their seat's for the match
  'kharkiv|Лозівський район': '5745', 'kherson|Голопристанський район': '5539',
  'mykolaiv|Вітовський район': '512', // the raion around Mykolaiv (Zhovtnevyi until 2016), seat in the city
  'dnipropetrovsk|Дніпровський район': '56', // the raion around Dnipro, not Kamianske (Dniprodzerzhynsk)
  'donetsk|rest@48.48,37.69': '6272', // Kostiantynivka raion (its relation in OSM is broken), not Druzhkivka
  // cities of oblast significance that Ukrtelecom's list leaves out
  'donetsk|Авдіївська міська рада': '6236', 'donetsk|Мирноградська міська рада': '6239', 'donetsk|Новогродівська міська рада': '6237', // ru.wikipedia infoboxes, Wikidata P473
  'donetsk|Жданівська міська рада': '6250', // Wikidata P473 only
  'kharkiv|Люботинська міська рада': '57', // uk.wikipedia list (572), ru.wikipedia infobox (057)
  'lviv|Стебницька міська рада': '3244', // uk.wikipedia list, ru.wikipedia infobox, Wikidata
  'kyivoblast|rest@51.41,30.06': '4593', // Prypiat, in the exclusion zone
  // towns that were under a city's council, apart from the city itself (no borders of the councils in OSM)
  'luhansk|rest@49.00,38.30': '6451', // Pryvillia: Lysychansk
  'luhansk|rest@48.70,38.67': '6446', // Donetskyi: Kirovsk (Holubivka)
  'luhansk|rest@48.30,38.90': '6432', 'luhansk|rest@48.21,38.88': '6432', // Petrovske, Sofiivskyi: Krasnyi Luch (Khrustalnyi)
  'luhansk|rest@48.16,39.21': '6433', 'luhansk|rest@48.14,39.43': '6433', 'luhansk|rest@48.08,39.48': '6433', 'luhansk|rest@47.99,39.49': '6433', // Yasenivskyi, Velykokamianka, Novodarivka, Naholno-Tarasivka: Rovenky
  'zhytomyr|rest@50.33,28.75': '412', // Veresy: Zhytomyr
};
// Towns with a code of their own inside a raion or next to another city: cut out by their own limits in OSM
const CARVE = [
  { rel: 2581952, code: '6446', o: 'luhansk', name: 'Голубівка' },        // Holubivka (Kirovsk): town limits, out of what it shares with Kadiivka
  { rel: 3606547, code: '4842', o: 'odesa', name: 'Південне' },           // Pivdenne (Yuzhne): town limits
  { rel: 2788849, code: '4350', o: 'vinnytsia', name: 'Вапнярка' },       // Vapniarka: town limits
  { rel: 18292543, code: '5655', o: 'dnipropetrovsk', name: 'Зеленодольськ' }, // Zelenodolsk: town limits
  { rel: 2535206, code: '3256', o: 'lviv', name: 'Новояворівська міська рада' }, // Novoiavorivsk: its former city council
];

// 1. the same relation twice (Crimea)
{ const seen = new Set(); units = units.filter(u => { const k = u.o + '|' + u.name + '|' + Math.round(u.area) + '|' + u.bbox.map(x => x.toFixed(3)); if (u.kind !== 'rest' && seen.has(k)) return false; seen.add(k); return true; }); }
units = units.filter(u => !(u.kind === 'raion' && u.area < 5));
units.forEach((u, i) => { u.i = i; u.key = u.kind === 'rest' ? `${u.o}|rest@${((u.bbox[1] + u.bbox[3]) / 2).toFixed(2)},${((u.bbox[0] + u.bbox[2]) / 2).toFixed(2)}` : `${u.o}|${u.name}`; });

// 2. land: OSM's oblasts take in the sea off the coast, the raions do not. What is left of a coastal oblast next to
// its raions is cut to the land (OSM simplified land polygons), so the sea goes and coastal cities stay.
const LAND = require('./land.json');
const coastal = new Set(['odesa', 'mykolaiv', 'kherson', 'zaporizhzhia', 'donetsk', 'crimea', 'sevastopol']);
for (const u of units) if (coastal.has(u.o) && (u.kind === 'rest' || u.o === 'sevastopol')) {
  let l = pc.intersection(u.geom, LAND); const a0 = g.area(l);
  if (a0 < 0.3 || (!u.towns.length && a0 < 0.05 * u.area)) { u.drop = 'sea'; continue; }
  // of a coastal city, the pieces its towns are in (the rest is specks between the two coastlines, and the sea)
  const whole = l; l = u.kind === 'rest' && u.towns.length ? l.filter(p => u.towns.some(t => g.inPoly(p, t.lng, t.lat))) : l.filter(p => g.polyArea(p) >= 0.5);
  for (const p of whole) if (!l.includes(p) && g.polyArea(p) > 3) log(`  coastal piece left out of ${u.key}: ${g.polyArea(p).toFixed(1)} km² @${g.bbox([p]).map(x => x.toFixed(2))}`);
  if (!l.length) { u.drop = 'sea'; continue; }
  const a = g.area(l);
  if (a < 0.98 * u.area) log(`coastal ${u.key}: ${Math.round(u.area)} km², ${a.toFixed(1)} km² of it land, ${l.length} pieces: ${u.towns.map(t => t.name)}`);
  u.sea = u.area - a; u.geom = l; u.area = a; u.bbox = g.bbox(l); u.thin = a / l.reduce((s, p) => s + g.perimeter(p), 0);
}

// 2b. carve
{
  const { rels, ways } = g.load('osm');
  for (const c of CARVE) {
    const P = g.polyOf(rels.get(c.rel), ways).geom, bb = g.bbox(P); let got = [];
    for (const u of units) {
      if (u.o !== c.o || u.drop || u.bbox[2] < bb[0] || bb[2] < u.bbox[0] || u.bbox[3] < bb[1] || bb[3] < u.bbox[1]) continue;
      const inter = pc.intersection(u.geom, P); if (g.area(inter) < 0.05) continue;
      u.geom = pc.difference(u.geom, P); u.area = g.area(u.geom); u.bbox = g.bbox(u.geom);
      const mine = u.towns.filter(t => t.id === c.code); u.towns = u.towns.filter(t => t.id !== c.code);
      got.push({ inter, mine, from: u.key });
    }
    if (!got.length) { log('! nothing to carve for', c.name); continue; }
    const geom = got.length === 1 ? got[0].inter : pc.union(...got.map(x => x.inter));
    const nu = { kind: 'city', name: c.name, o: c.o, geom, area: g.area(geom), bbox: g.bbox(geom), towns: got.flatMap(x => x.mine), key: `${c.o}|${c.name}`, code: c.code, how: 'carved from ' + got.map(x => x.from).join(', '), i: units.length };
    units.push(nu); log(`carved ${c.name} ${nu.area.toFixed(1)} km² (${c.code}) from ${got.map(x => x.from)}; towns ${nu.towns.map(t => t.name)}`);
  }
}

// 3. which units touch (they share border points)
const at = new Map();
for (const u of units) { if (u.drop) continue; const seen = new Set(); for (const p of u.geom) for (const r of p) for (const [x, y] of r) { const k = x + ',' + y; if (seen.has(k)) continue; seen.add(k); let l = at.get(k); if (!l) at.set(k, l = []); l.push(u.i); } }
const adj = units.map(() => new Map());
for (const l of at.values()) if (l.length > 1) for (const a of l) for (const b of l) if (a !== b) adj[a].set(b, (adj[a].get(b) || 0) + 1);

// 4. codes
const codesOf = u => [...new Set(u.towns.map(t => t.id))];
for (const u of units) {
  if (u.drop) continue;
  if (u.code) continue;
  if (u.key in OVERRIDE) { if (OVERRIDE[u.key] === null) u.drop = 'override'; else u.code = OVERRIDE[u.key]; u.how = 'override'; continue; }
  const c = codesOf(u);
  if (c.length === 1) { u.code = c[0]; u.how = 'town'; }
  else if (c.length > 1) {
    const seat = u.towns.filter(t => match(u, t));
    const main = (seat.length ? seat : u.towns).slice().sort((a, b) => (b.pop || 0) - (a.pop || 0))[0];
    u.code = main.id; u.how = seat.length ? 'seat' : 'largest'; u.extra = c.filter(x => x !== u.code);
  }
}
for (let pass = 0; pass < 2; pass++) for (const u of units) {
  if (u.drop || u.code) continue;
  const nb = [...adj[u.i]].map(([j, n]) => ({ v: units[j], n })).filter(x => x.v.code && x.v.o === u.o);
  // a raion whose seat is a city of its own: the city named like it
  const score = v => Math.max(0, ...v.towns.map(t => match(u, t)));
  const named = nb.filter(x => x.v.kind !== 'raion' && score(x.v)).sort((a, b) => score(b.v) - score(a.v));
  if (u.kind === 'raion' && named.length) { u.code = named[0].v.code; u.how = 'city ' + named[0].v.name; continue; }
  // a raion that OSM no longer has (what is left of the oblast, with a city in it): the city it surrounds
  if (u.kind === 'rest' && u.area > 200) { const c = nb.filter(x => x.v.kind !== 'raion').sort((a, b) => b.n - a.n)[0]; if (c) { u.code = c.v.code; u.how = 'around ' + c.v.name; continue; } }
  // a sliver between units: the neighbour it shares most of its border with
  // a speck between two borders that do not quite meet: the neighbour it shares most of its border with
  if (u.kind === 'rest' && u.area < 0.5 && nb.length) { const b = nb.sort((a, b) => b.n - a.n)[0]; u.code = b.v.code; u.how = 'sliver of ' + b.v.name; continue; }
  // a town that was under a city's council, apart from the city: the nearest city (else the neighbour, as above)
  if (u.kind === 'rest' && u.area < 40) {
    const c = [(u.bbox[0] + u.bbox[2]) / 2, (u.bbox[1] + u.bbox[3]) / 2], km = t => Math.hypot((t.lng - c[0]) * 111 * Math.cos(c[1] * Math.PI / 180), (t.lat - c[1]) * 111);
    const near = units.filter(v => v.o === u.o && v.code && v.kind !== 'raion' && v.towns.length).map(v => ({ v, d: Math.min(...v.towns.map(km)) })).filter(x => x.d < 40).sort((a, b) => a.d - b.d)[0];
    const b = near ? near.v : nb.length ? nb.sort((a, b) => b.n - a.n)[0].v : null;
    if (b) { u.code = b.code; u.how = (near ? 'enclave of ' : 'sliver of ') + (b.kind === 'rest' ? b.towns[0].name : b.name); if (u.area >= 1) log(`  enclave ${u.key} ${u.area.toFixed(1)} km² -> ${u.how} ${b.code}${near ? ' ' + near.d.toFixed(0) + ' km' : ''}`); continue; }
  }
  if (u.kind === 'rest' && u.area < 0.3 && !nb.length) { u.drop = 'speck'; continue; }
  if (pass) log(`? no code: ${u.key} ${u.kind} ${Math.round(u.area)} km²; touches ${nb.map(x => `${x.v.name} ${x.v.code} (${x.n})`).join(', ')}`);
}

// 5. report
const byCode = new Map();
for (const u of units) if (u.code) { if (!byCode.has(u.code)) byCode.set(u.code, []); byCode.get(u.code).push(u); }
const towns = require('./towns.json');
const allCodes = [...new Set(towns.map(t => t.id))].sort();
const shared = {};
for (const u of units) for (const x of u.extra || []) if (!byCode.has(x)) shared[x] = u.code;
log('\nunits', units.filter(u => !u.drop).length, 'with code', units.filter(u => u.code).length, '| codes', allCodes.length, 'with area', byCode.size, 'sharing an area', Object.keys(shared).length);
log('codes without area:', allCodes.filter(c => !byCode.has(c) && !shared[c]).join(' '));
log('codes sharing an area:', JSON.stringify(shared));
log('units with several codes:', units.filter(u => u.extra).map(u => `${u.key}: ${u.code} (${u.how}) + ${u.extra} [${u.towns.map(t => t.name + ' ' + t.id).join(', ')}]`).join('\n  '));
log('raions coded by their city:', units.filter(u => /^city /.test(u.how || '')).length, '| slivers:', units.filter(u => /^sliver/.test(u.how || '')).length);
for (const [c, us] of byCode) { const os = new Set(us.map(u => u.o)); if (os.size > 1 && !(c === '692')) log('code in two oblasts:', c, us.map(u => u.key).join(', ')); }
for (const u of units) if (u.code && u.code.slice(0, 2) !== ({ kyiv: '44', sevastopol: '69' }[u.o] || require('./lib.js').UA.regions[u.o].phone)) log('code not of its oblast:', u.key, u.code);

// 6. one area per code
const feats = [];
for (const [code, us] of [...byCode].sort()) {
  let geom = us[0].geom; for (const u of us.slice(1)) { try { geom = pc.union(geom, u.geom); } catch (e) { log('! union failed, parts kept apart:', code, u.key); geom = geom.concat(u.geom); } }
  if (!geom.length) { log('! no land:', code); continue; }
  feats.push({ type: 'Feature', properties: { id: code, g: code.slice(0, 2), d1: code[0], units: us.map(u => u.name).join('; ') }, geometry: { type: 'MultiPolygon', coordinates: geom } });
}
// 6b. two raions that overlap a little in OSM (found with overlaps.js): the overlap stays with the first
for (const [keep, cut] of [['6454', '6474'], ['6445', '6474']]) {
  const a = feats.find(f => f.properties.id === keep), c = feats.find(f => f.properties.id === cut);
  if (a && c) c.geometry.coordinates = pc.difference(c.geometry.coordinates, a.geometry.coordinates);
}

// 7. holes: what neither an oblast nor its neighbour claims in OSM (Kotsiubynske inside Kyiv, specks on oblast borders)
{
  const byZone = {}; for (const f of feats) (byZone[f.properties.g] ??= []).push(f.geometry.coordinates);
  const all = pc.union(...Object.values(byZone).map(l => pc.union(...l)));
  const placed = require('./placed.json');
  for (const p of all) for (const ring of p.slice(1)) {
    const hole = [[ring]], a = g.polyArea(hole[0]); if (a < 0.005) continue;
    const town = placed.find(t => t.lat !== undefined && g.inPoly(hole[0], t.lng, t.lat));
    const keys = new Set(ring.map(([x, y]) => x + ',' + y)); let best = null;
    for (const f of feats) { let n = 0; for (const q of f.geometry.coordinates) for (const r of q) for (const [x, y] of r) if (keys.has(x + ',' + y)) n++; if (n && (!best || n > best.n)) best = { f, n }; }
    const f = town ? feats.find(f => f.properties.id === town.id) : best && best.f;
    if (!f) { log('! hole left open', a.toFixed(2)); continue; }
    f.geometry.coordinates = pc.union(f.geometry.coordinates, hole);
    log(`hole ${a.toFixed(2)} km² @${ring[0][1].toFixed(3)},${ring[0][0].toFixed(3)} -> ${f.properties.id}${town ? ' (' + town.name + ')' : ''}`);
  }
}
// 8. specks: a part of an area smaller than 2.5 km² that lies apart from the rest of it (a village of a city council
// inside the next raion) would be dropped by the map's simplification and leave a hole: it goes to the area around it
{
  let moved = 0;
  for (const f of feats) {
    const polys = f.geometry.coordinates; if (polys.length < 2) continue;
    const areas = polys.map(g.polyArea), max = Math.max(...areas), keep = [];
    polys.forEach((p, i) => {
      if (areas[i] >= 2.5 || areas[i] === max) { keep.push(p); return; }
      const keys = new Set(p[0].map(([x, y]) => x + ',' + y)); let best = null;
      for (const o of feats) { if (o === f) continue; let n = 0; for (const q of o.geometry.coordinates) for (const r of q) for (const [x, y] of r) if (keys.has(x + ',' + y)) n++; if (n && (!best || n > best.n)) best = { o, n }; }
      if (!best) { keep.push(p); return; } // an island
      best.o.geometry.coordinates = pc.union(best.o.geometry.coordinates, [p]); moved++;
    });
    f.geometry.coordinates = keep;
  }
  log('specks moved to the area around them:', moved);
}
fs.writeFileSync('ukr_code_areas.geojson', JSON.stringify({ type: 'FeatureCollection', features: feats }));
fs.writeFileSync('assign.json', JSON.stringify({ shared, units: units.filter(u => u.code).map(u => ({ key: u.key, kind: u.kind, name: u.name, o: u.o, code: u.code, how: u.how, area: Math.round(u.area), towns: u.towns.map(t => t.name) })) }, null, 1));
log('features', feats.length, 'points', feats.reduce((s, f) => s + f.geometry.coordinates.reduce((a, p) => a + p.reduce((b, r) => b + r.length, 0), 0), 0));
