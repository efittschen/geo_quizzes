// South Africa Area Codes: config for ../shared/area-quiz.js. Each map area is one area code (010 shares
// Johannesburg's area with 011). Code areas cross province lines, so provinces have their own quiz
// (../south-africa-provinces/), built from the province outlines instead.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
// In the Telkom-based data these four areas' town points sit 40–85 km from the city they name; use the city itself
// (it lies inside the same area), so the pin after each answer marks the real town.
const CITY_POINT = {'c14': [710.8, 275], 'c15': [859.3, 152.7], 'c39': [899.7, 646.7], 'c51': [641.2, 523.5]};
for (const [id, [tx, ty]] of Object.entries(CITY_POINT)) Object.assign(R[id], { tx, ty });
const BY = {}; // area code -> area ids
for (const r of DATA.reg) for (const k of r.k) (BY[k] ??= []).push(r.id);
const CODES = Object.keys(BY).sort();
const DIGITS = [...new Set(CODES.map(k => k[0]))];
const BIG = ['11', '12', '21', '31', '41', '43', '51', '13', '15', '53', '18', '33'];
// The town a code belongs to (010 and 011 are both Johannesburg).
const townOf = (id, k) => R[id].n[R[id].k.indexOf(k)] || R[id].n[0];
const where = k => BY[k].map(id => `${townOf(id, k)} (${R[id].st})`).join('; ');
const codesWithDigit = d => CODES.filter(k => k[0] === d);

const QUIZ = {
  key: 'zacodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.k[0][0] })),
  borders: DATA.ent,
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 90, labelScale: 0.38, fly: { pad: 1.6, min: 1.5 / 90 },
  geo: GEO,
  street: { bounds: [[-34.9, 16.4], [-22.1, 32.9]], maxBounds: [[-45, 5], [-12, 45]] },
  hintLabel: 'Color by first digit',
  exploreKind: 'codes',
  explore: id => {
    const r = R[id];
    return {
      code: '0' + r.k[0], title: r.ct.join(', '),
      sub: [r.st, ...(r.k.length > 1 ? [`Also ${r.k.slice(1).map(k => '0' + k + ' ' + townOf(id, k)).join(', ')}`] : []), `Zone ${r.k[0][0]}: ${ZONES[r.k[0][0]]}`],
    };
  },
  rounds: [
    { kind: 'digit1', label: 'First digit' },
    { kind: 'codes', label: 'Big cities', preset: 'Big cities' },
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', labelPerArea: true, clickAll: true, label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: DIGITS.map(d => ({ title: '0' + d + 'x', sub: '', ids: codesWithDigit(d) })),
      presets: [{ label: 'Big cities', ids: BIG }],
      areasOf: k => BY[k],
      short: k => '0' + k, name: k => `0${k}`,
      about: k => [BY[k].map(id => `${townOf(id, k)}, ${R[id].st}`).join('; '), `Zone ${k[0]}: ${ZONES[k[0]]}`],
      clicked: id => `0${R[id].k[0]}, ${R[id].n[0]}`,
      pin: k => { const id = BY[k][0]; return { x: R[id].tx, y: R[id].ty, ll: TOWN_LL[id], label: `0${k} ${townOf(id, k)}` }; },
      prompt: 'dial',
      detail: { label: 'Show province', text: k => R[BY[k][0]].st },
      chip: k => '0' + k, chipTitle: where,
    },
    {
      key: 'digit1', label: 'First digit', sub: 'Beginner', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: 'area codes by first digit', ids: DIGITS }],
      areasOf: d => [...new Set(codesWithDigit(d).flatMap(k => BY[k]))],
      short: d => `0${d}x`, name: d => `0${d}x`, about: d => ZONES[d],
      clicked: id => `0${R[id].k[0][0]}x (${ZONES[R[id].k[0][0]].split(':')[0]})`,
      prompt: 'dial',
      hints: false, // coloring by first digit would give the answer away
      chip: d => `0${d}x`, chipTitle: d => ZONES[d],
    },
  ],
};
