// Bolivia Area Codes: config for ../shared/area-quiz.js, using the department areas from ../bolivia-regions/data.js.
// Landline numbers are 8 digits, A + 7: the zone digit A is 2, 3 or 4, each covering three whole departments
// (Plan Técnico Fundamental de Numeración 2021, RM 339, Cuadro 1). There is no finer official code level.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const IDS = DATA.reg.map(r => r.id);
const CODES = [...new Set(DATA.reg.map(r => r.phone))].sort();
const ZONE = { A: 'Altiplano', V: 'Valleys', L: 'Lowlands' };
const departmentsOf = k => IDS.filter(id => R[id].phone === k).sort((a, b) => R[a].name.localeCompare(R[b].name, 'es'));
const names = k => departmentsOf(k).map(id => R[id].name).join(', ');

const QUIZ = {
  key: 'bocodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.zone })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 20, labelScale: 0.12, fly: { pad: 1.6, min: 1.5 / 20 },
  geo: GEO,
  street: { bounds: [[-22.9, -69.7], [-9.6, -57.4]], maxBounds: [[-30, -82], [-2, -45]] },
  hintLabel: 'Color by zone',
  exploreKind: 'codes',
  explore: id => ({ code: R[id].phone, title: R[id].name, sub: [ZONE[R[id].zone], `Plate ${R[id].plate}`] }),
  rounds: [
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', label: 'Area codes', sub: `All ${CODES.length}`, noun: ['area code', 'area codes'], pickTitle: 'Codes to practice',
      groups: [{ title: 'Area codes', sub: '', ids: CODES }],
      areasOf: departmentsOf,
      short: k => k, name: k => k,
      about: k => names(k),
      clicked: area => `${R[area].phone} (${R[area].name})`,
      prompt: 'dial',
      hints: false, // the colors would be these zones
      chip: k => k, chipTitle: names,
    },
  ],
};
