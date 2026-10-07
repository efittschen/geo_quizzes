// Geocode the Ukrtelecom towns (name in Ukrainian + oblast) with GeoNames.
const fs = require('fs');
const ADM1 = { 'Вінницька': '23', 'Волинська': '24', 'Дніпропетровська': '04', 'Донецька': '05', 'Житомирська': '27', 'Закарпатська': '25', 'Запорізька': '26', 'Івано-Франківська': '06', 'Київська': '13', 'Київ': '12', 'Кіровоградська': '10', 'Луганська': '14', 'Львівська': '15', 'Миколаївська': '16', 'Одеська': '17', 'Полтавська': '18', 'Рівненська': '19', 'Сумська': '21', 'Тернопільська': '22', 'Харківська': '07', 'Херсонська': '08', 'Хмельницька': '09', 'Черкаська': '01', 'Чернівецька': '03', 'Чернігівська': '02', 'АР Крим': '11', '': '11', 'Севастополь': '20' };
const norm = s => s.toLowerCase().replace(/[’'ʼ`´]/g, '').replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
const places = new Map();
for (const l of fs.readFileSync('gn/UA.txt', 'utf8').split('\n')) {
  const f = l.split('\t'); if (f[6] !== 'P') continue;
  places.set(f[0], { id: f[0], name: f[1], alts: f[3] ? f[3].split(',') : [], lat: +f[4], lng: +f[5], fc: f[7], adm1: f[10], pop: +f[14] || 0, uk: [] });
}
for (const l of fs.readFileSync('gnalt/UA.txt', 'utf8').split('\n')) {
  const f = l.split('\t'); const p = places.get(f[1]); if (!p) continue;
  if (f[2] === 'uk') p.uk.push({ n: f[3], pref: f[4] === '1', hist: f[7] === '1' });
  if (f[2] === 'wkdt') p.wd = f[3];
  if (f[2] === 'en' && f[4] === '1') p.en = f[3];
}
const idx = new Map();
for (const p of places.values()) for (const n of new Set([...p.alts, ...p.uk.map(u => u.n)].map(norm))) { const k = p.adm1 + '|' + n; if (!idx.has(k)) idx.set(k, []); idx.get(k).push(p); }
const rank = p => (/^PPLC|^PPLA$/.test(p.fc) ? 3e7 : 0) + (p.fc === 'PPLA2' ? 1e6 : 0) + p.pop;
function geocode(name, obl) {
  const a = ADM1[obl]; if (a === undefined) return null;
  let c = idx.get(a + '|' + norm(name)) || [];
  if (!c.length && a === '11') c = idx.get('20|' + norm(name)) || [];
  if (!c.length) return null;
  // a place whose current Ukrainian name is this name beats one that only had it once (Ivanivka vs Bilozerka)
  const nn = norm(name), cur = p => p.uk.some(u => !u.hist && norm(u.n) === nn && (u.pref || p.uk.filter(v => !v.hist).length === 1)) ? 2 : p.uk.some(u => !u.hist && norm(u.n) === nn) ? 1 : 0;
  c = c.slice().sort((x, y) => cur(y) - cur(x) || rank(y) - rank(x));
  return { ...c[0], n: c.length, second: c[1] ? c[1].pop : 0, how: cur(c[0]) };
}
module.exports = { geocode, places, norm };
if (require.main === module) {
  const rows = JSON.parse(fs.readFileSync('ukrt_rows.json', 'utf8')).filter(r => r[1]).map(r => r.slice(1, 4));
  const out = [], miss = [], amb = [];
  for (const [name, obl, code] of rows) {
    const g = geocode(name, obl);
    if (!g) { miss.push([name, obl, code]); out.push({ name, obl, code }); continue; }
    if (g.n > 1 && g.pop < 2000) amb.push([name, obl, g.name, g.pop, g.n]);
    out.push({ name, obl, code, lat: g.lat, lng: g.lng, gn: g.name, pop: g.pop, fc: g.fc, ukPref: (g.uk.find(u => u.pref) || {}).n });
  }
  fs.writeFileSync('ukrt_geo.json', JSON.stringify(out));
  console.log('rows', rows.length, 'missing', miss.length, JSON.stringify(miss));
  console.log('ambiguous small', JSON.stringify(amb));
  console.log(out.filter(o => o.pop !== undefined && o.pop < 1500).map(o => `${o.name} ${o.gn} ${o.pop}`).join('; '));
}
