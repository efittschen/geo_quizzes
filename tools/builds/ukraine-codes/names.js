// Current Ukrainian name (GeoNames) and English name (official romanization, CMU Resolution 55 of 2010) of each town.
const M = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ie', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ю': 'iu', 'я': 'ia', 'ь': '' };
const F = { 'є': 'ye', 'ї': 'yi', 'й': 'y', 'ю': 'yu', 'я': 'ya' };
function translit(s) {
  return s.split(/([ \-])/).map(w => {
    if (w === ' ' || w === '-') return w;
    const lw = w.toLowerCase().replace(/[’'ʼ`]/g, ''); let r = '';
    for (let i = 0; i < lw.length; i++) {
      const ch = lw[i];
      if (ch === 'г' && lw[i - 1] === 'з') { r += 'gh'; continue; }
      r += i === 0 && F[ch] ? F[ch] : M[ch] !== undefined ? M[ch] : ch;
    }
    return /^[А-ЯІЇЄҐ]/.test(w) ? r[0].toUpperCase() + r.slice(1) : r;
  }).join('');
}
const skel = s => s.toLowerCase().replace(/[^a-z]/g, '').replace(/yi|iy|yy|ii/g, 'i').replace(/y/g, 'i').replace(/ie/g, 'e').replace(/iu/g, 'u').replace(/ia/g, 'a').replace(/g/g, 'h').replace(/(.)\1/g, '$1');
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }
const close = (uk, gn) => lev(skel(translit(uk)), skel(gn)) <= Math.max(1, Math.round(skel(gn).length / 5));
// the town's name today: the listed name if GeoNames still calls the place that, else GeoNames' Ukrainian name for it
function currentName(t) {
  const fix = s => s.replace(/['ʼ`]/g, '’');
  if (!t.gn || close(t.name, t.gn)) return fix(t.name);
  const c = (t.ukNames || []).filter(n => close(n, t.gn));
  return c.length ? fix(c[0]) : null;
}
module.exports = { translit, currentName, close };
if (require.main === module) {
  const placed = require('./placed.json');
  console.log(['Згурівка', 'Запоріжжя', 'Єнакієве', 'Слов’янськ', 'Кам’янець-Подільський', 'Юр’ївка', 'Яготин', 'Розгірче', 'Київ', 'Ічня', 'Їжаківка', 'Біла Церква', 'Йосипівка', 'Щолкіне'].map(translit).join(', '));
  for (const t of placed) { const c = currentName(t); if (c !== t.name.replace(/['ʼ`]/g, '’')) console.log(t.name, t.obl, '→', c, '|', t.gn, '|', (t.ukNames || []).join('/')); }
}
