// Ecuador Area Codes: config for ../shared/area-quiz.js, using the province areas from ../ecuador-regions/data.js.
// Landline numbers are (0X) XXX-XXXX with a one-digit area code 2–7, each covering whole provinces (ARCOTEL, Plan
// Técnico Fundamental de Numeración, fixed-line series report, June 2026). Morona Santiago is 07 (2 of its 40 number
// blocks are under 03).

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const IDS = DATA.reg.map(r => r.id);
const CODES = [...new Set(DATA.reg.map(r => r.phone))].sort();
const REGION = { C: 'Costa', S: 'Sierra', A: 'Amazonía', G: 'Galápagos' };
const SHORT = { p23: 'Santo Domingo' };
const provincesOf = k => IDS.filter(id => R[id].phone === k).sort((a, b) => R[a].name.localeCompare(R[b].name, 'es'));
const names = k => provincesOf(k).map(id => SHORT[id] || R[id].name).join(', ');

const QUIZ = {
  key: 'eccodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.region })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 30, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 30 },
  geo: GEO,
  street: { bounds: [[-5.1, -81.2], [1.5, -75.1]], maxBounds: [[-9, -95], [5, -70]] },
  hintLabel: 'Color by region',
  exploreKind: 'codes',
  explore: id => ({ code: '0' + R[id].phone, title: R[id].name, sub: [REGION[R[id].region], `Plate ${R[id].plate}`] }),
  rounds: [
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', label: 'Area codes', sub: `All ${CODES.length}`, noun: ['area code', 'area codes'], pickTitle: 'Codes to practice',
      groups: [{ title: 'Area codes', sub: '', ids: CODES }],
      areasOf: provincesOf,
      short: k => '0' + k, name: k => '0' + k,
      about: k => names(k),
      clicked: area => `0${R[area].phone} (${SHORT[area] || R[area].name})`,
      prompt: 'dial',
      chip: k => '0' + k, chipTitle: names,
    },
  ],
};
