// Budapest Districts: config for ../shared/area-quiz.js. The 23 districts (kerületek) as on Budapest street-name
// signs ("XI. kerület"), from OpenStreetMap (admin_level 9). Sides of the Danube and district names: English
// Wikipedia, List of districts in Budapest; districts II, XIII, XV and XVI have no name of their own.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const SIDE = { Buda: [1, 2, 3, 11, 12, 22], Pest: [4, 5, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 18, 19, 20, 23], 'Csepel Island': [21] };
const NAMES = {
  1: 'Várkerület', 3: 'Óbuda-Békásmegyer', 4: 'Újpest', 5: 'Belváros-Lipótváros', 6: 'Terézváros', 7: 'Erzsébetváros',
  8: 'Józsefváros', 9: 'Ferencváros', 10: 'Kőbánya', 11: 'Újbuda', 12: 'Hegyvidék', 14: 'Zugló', 17: 'Rákosmente',
  18: 'Pestszentlőrinc-Pestszentimre', 19: 'Kispest', 20: 'Pesterzsébet', 21: 'Csepel', 22: 'Budafok-Tétény', 23: 'Soroksár',
};
const id = n => 'd' + String(n).padStart(2, '0');
const sideOf = d => Object.keys(SIDE).find(s => SIDE[s].includes(R[d].num));
const label = d => `${R[d].roman}. kerület`;

const QUIZ = {
  key: 'budistricts',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.id })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 12, labelScale: 0.25, fly: { pad: 1.6, min: 1.5 / 12 },
  geo: GEO,
  street: { bounds: [[47.35, 18.92], [47.62, 19.34]], maxBounds: [[47.1, 18.5], [47.9, 19.8]] },
  hintLabel: 'Color each district',
  exploreKind: 'districts',
  explore: d => ({ code: R[d].roman, title: NAMES[R[d].num] || label(d), sub: sideOf(d) }),
  rounds: [
    { kind: 'districts', label: 'Buda', groups: ['Buda'] },
    { kind: 'districts', label: 'Pest', groups: ['Pest'] },
    { kind: 'districts', label: 'All districts' },
  ],
  kinds: [
    {
      key: 'districts', label: 'Districts', sub: 'All 23', noun: ['district', 'districts'], pickTitle: 'Districts to practice',
      groups: Object.entries(SIDE).map(([title, nums]) => ({ title, sub: '', ids: nums.map(id) })),
      areasOf: d => [d],
      short: d => R[d].roman, name: label,
      about: d => [NAMES[R[d].num], sideOf(d)].filter(Boolean),
      clicked: d => label(d),
      prompt: 'name',
      chip: d => R[d].roman, chipTitle: d => NAMES[R[d].num] || label(d),
    },
  ],
};
