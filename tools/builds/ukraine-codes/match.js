// Is the unit ("Смілянський район", "Уманська міська рада") named after the town ("Сміла", "Умань")? Returns the length
// of their common beginning if it is long enough (3 letters, or the whole town name), else 0.
const norm = s => s.toLowerCase().replace(/[’'ʼ`´\- ]/g, '').replace(/ё/g, 'е');
function nameMatch(unit, town) {
  const a = norm(unit.replace(/^(городской|муниципальный) округ /, '')), b = norm(town); let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n >= Math.min(4, b.length - 1) || (n >= 3 && n >= b.length - 2) ? n : 0;
}
module.exports = { nameMatch };
