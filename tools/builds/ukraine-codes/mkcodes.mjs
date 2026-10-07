// placed.json + assign.json + the generated map (fine.js) -> quizzes/ukraine-codes/codes.js
//   node mkcodes.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { geoConicEqualArea } from 'd3-geo';
const require = createRequire(import.meta.url);
const { translit, currentName } = require('./names.js');
const { nameMatch } = require('./match.js');
const OUT = decodeURIComponent(new URL('../../../../quizzes/ukraine-codes', import.meta.url).pathname);
const placed = require('./placed.json'), assign = require('./assign.json');
const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(OUT + '/fine.js', 'utf8') + '\nthis.D = FINE;', ctx);
const D = ctx.D, proj = geoConicEqualArea().parallels(D.proj.parallels).rotate(D.proj.rotate).scale(D.proj.scale).translate(D.proj.translate);
const areaIds = new Set(D.reg.map(r => r.id));
const unitsOf = {}; for (const u of assign.units) (unitsOf[u.code] ??= []).push(u);
// names by hand where GeoNames has no current Ukrainian name for the place, or another spelling
const NAME = fs.existsSync('./name_fix.json') ? require('./name_fix.json') : {};
const byCode = {};
for (const t of placed) (byCode[t.id] ??= []).push(t);
// areas that are a stand-in: the town's own limits (Vapniarka, Pivdenne, Zelenodolsk, Holubivka) or the raion of 1988 (Chornobyl)
const APPROX = ['4350', '4842', '5655', '6446', '4593'];
const codes = {}, review = [];
for (const [id, ts] of Object.entries(byCode).sort()) {
  for (const t of ts) { t.cur = NAME[t.name + '|' + t.obl] || NAME[t.name] || currentName(t); if (!t.cur) { review.push(`no current name: ${t.name} ${t.obl} (${t.gn}; ${(t.ukNames || []).join('/')})`); t.cur = t.name; } }
  // the place the code is named for: the town its raion or city is named after, else the largest
  const us = unitsOf[id] || [];
  const named = kind => ts.filter(t => us.some(u => (!kind || u.kind === kind) && (nameMatch(u.name, t.name) || nameMatch(u.name, t.cur))));
  const seat = named('raion').length ? named('raion') : named(); // 04576 is Baryshivka (the raion), though Berezan is larger
  const main = (seat.length ? seat : ts).slice().sort((a, b) => (b.pop || 0) - (a.pop || 0))[0];
  const others = ts.filter(t => t !== main).sort((a, b) => (b.pop || 0) - (a.pop || 0));
  const [x, y] = proj([main.lng, main.lat]);
  const c = { en: translit(main.cur), uk: main.cur };
  if (main.cur.replace(/[’']/g, '') !== main.name.replace(/[’']/g, '')) c.was = main.name;
  if (others.length) c.more = others.map(t => translit(t.cur));
  if (id === '4592') c.more = ['Krasiatychi']; // the raion's seat since Poliske was left after 1986
  const alt = [...new Set(ts.flatMap(t => t.alt || []))].filter(a => a !== id); if (alt.length) c.alt = alt;
  c.ll = [+main.lat.toFixed(4), +main.lng.toFixed(4)]; c.xy = [+x.toFixed(1), +y.toFixed(1)];
  c.pop = Math.max(...ts.map(t => t.pop || 0));
  if (!areaIds.has(id)) { c.at = assign.shared[id]; if (!c.at) review.push(`no area: ${id} ${main.name}`); }
  if (ts.every(t => t.src === 'wikipedia')) c.src = 'w';
  if (APPROX.includes(id)) c.approx = 1;
  codes[id] = c;
}
for (const a of areaIds) if (!codes[a]) review.push('area without code entry: ' + a);
const head = `// Ukraine: the ${Object.keys(codes).length} local area codes inside the 27 two-digit zones (oblasts, Crimea, Kyiv, Sevastopol), as written without
// the leading 0: 2 digits for the seven largest cities (seven-digit numbers), 3 for the other oblast centres and a few
// big cities (six digits), 4 for raions and smaller cities (five digits).
//   en    the place the code is named for, romanized (CMU Resolution 55 of 2010) from uk, its Ukrainian name today
//   was   its name in Ukrtelecom's list, if it has been renamed since
//   more  other towns listed with the same code;  alt  other ways the code is written (0312 / 03122)
//   ll    [lat, lng] of the place;  xy  the same in the map units of fine.js;  pop  population (GeoNames)
//   at    the map area the code is asked on, for a town without borders of its own (its raion)
//   src   'w': not in Ukrtelecom's list, from Wikipedia's lists;  approx  1: the map area is a stand-in (the town's own limits)
// Codes: Ukrtelecom, "Коди автоматичного міжміського зв'язку" (ukrtelecom.ua/reference/trunkline_code/code, archived
// 2016-2019 at web.archive.org); checked against ru.wikipedia "Телефонный план нумерации Украины" and uk.wikipedia
// "Список телефонних кодів України". The National Numbering Plan (Order 758 of 26.08.2023) and Ukraine's ITU E.164
// communication list only the two-digit zone codes. Places: GeoNames (CC BY 4.0).
`;
fs.writeFileSync(OUT + '/codes.js', head + 'const UACODES = ' + JSON.stringify(codes).replace(/\},"/g, '},\n"') + ';\n');
console.log(Object.keys(codes).length, 'codes;', Object.values(codes).filter(c => c.at).length, 'on another area;', Object.values(codes).filter(c => c.was).length, 'renamed');
console.log(review.join('\n'));
console.log('renamed:', Object.entries(codes).filter(([, c]) => c.was).map(([k, c]) => `${k} ${c.was}→${c.uk} (${c.en})`).join('; '));
