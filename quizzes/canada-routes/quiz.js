// Canada Route Numbers: config for ../shared/area-quiz.js. Each item is a provincial route-number band whose
// numbers tell the region (Québec 200s south / 300s north of the St. Lawrence, Ontario 400-series vs secondary
// highways, Alberta and Saskatchewan secondary-highway bands, PEI counties, Newfoundland regional ranges).
// Areas (data.js): census divisions grouped by the band most of their numbered routes belong to (OpenStreetMap
// route relations); Newfoundland's regions are rebuilt from census subdivisions the same way. Provinces without
// region-coded numbers are drawn whole and are never an answer.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const PROV = {
  QC: 'Québec', ON: 'Ontario', AB: 'Alberta', SK: 'Saskatchewan', PE: 'Prince Edward Island', NL: 'Newfoundland and Labrador',
  BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick', NS: 'Nova Scotia', YT: 'Yukon', NT: 'Northwest Territories', NU: 'Nunavut',
};
const units = test => DATA.reg.map(r => r.id).filter(test);
const ab = d => units(id => id.startsWith('AB-') && id.slice(3).includes(d));
// [id, province, numbers, short, areas, about]
const BANDS = [
  ['qc-200', 'QC', '200–299', '200s', ['QC-S'], 'South shore'],
  ['qc-300', 'QC', '300–399', '300s', ['QC-N'], 'North shore'],
  ['on-400', 'ON', '400–499', '400s', ['ON-4'], '400-series highways'],
  ['on-500', 'ON', '500–699', '500s–600s', ['ON-5'], 'Secondary highways'],
  ['ab-500', 'AB', '500–599', '500s', ab('5'), 'East–west · south'],
  ['ab-600', 'AB', '600–699', '600s', ab('6'), 'East–west · north'],
  ['ab-700', 'AB', '700–799', '700s', ab('7'), 'North–south · west'],
  ['ab-800', 'AB', '800–899', '800s', ab('8'), 'North–south · east'],
  ['sk-600', 'SK', '600–699', '600s', ['SK-S'], 'North–south'],
  ['sk-700', 'SK', '700–799', '700s', ['SK-S'], 'East–west'],
  ['sk-900', 'SK', '900–999', '900s', ['SK-N'], 'Northern secondary'],
  ['pe-100', 'PE', '101–199', '100s', ['PE-1'], 'Prince County'],
  ['pe-200', 'PE', '201–299', '200s', ['PE-2'], 'Queens County'],
  ['pe-300', 'PE', '301–399', '300s', ['PE-3'], 'Kings County'],
  ['nl-avalon', 'NL', '2–203', '2–203', ['NL-avalon'], 'Avalon Peninsula'],
  ['nl-burin', 'NL', '210–222', '210s', ['NL-burin'], 'Burin Peninsula'],
  ['nl-bonavista', 'NL', '204–205, 230–239', '230s', ['NL-bonavista'], 'Bonavista Peninsula'],
  ['nl-kittiwake', 'NL', '301–346', '301–346', ['NL-kittiwake'], 'Kittiwake Coast, Fogo, Twillingate'],
  ['nl-exploits', 'NL', '350–371', '350–371', ['NL-exploits'], "Exploits Valley, Bay d'Espoir"],
  ['nl-baieverte', 'NL', '380–392, 410–419', '380s, 410s', ['NL-baieverte'], 'Baie Verte'],
  ['nl-gnp', 'NL', '401, 420–438', '420s–430s', ['NL-gnp'], 'Great Northern Peninsula'],
  ['nl-western', 'NL', '402–408, 440–490', '440–490', ['NL-western'], 'Western Newfoundland'],
  ['nl-labrador', 'NL', '500–520', '500s', ['NL-labrador'], 'Labrador'],
].map(([id, pr, nums, short, areas, about]) => ({ id, pr, nums, short, areas, about }));
const B = Object.fromEntries(BANDS.map(b => [b.id, b]));
const PROVS = ['QC', 'ON', 'AB', 'SK', 'PE', 'NL'];
const SHORT = { QC: 'Québec', ON: 'Ontario', AB: 'Alberta', SK: 'Saskatchewan', PE: 'PEI', NL: 'NL' };
const ofProv = pr => BANDS.filter(b => b.pr === pr).map(b => b.id);
const bandsAt = area => BANDS.filter(b => b.areas.includes(area));
const unitName = area => {
  const r = R[area], bs = bandsAt(area);
  return bs.length ? bs.map(b => b.about).join(' · ') : PROV[r.prov];
};

const QUIZ = {
  key: 'caroutes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.id })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.2, fly: { pad: 1.6, min: 1 / 25 },
  geo: GEO,
  street: { bounds: [[41.7, -141], [62, -52.6]], maxBounds: [[35, -175], [85, -40]] },
  hintLabel: 'Color each area',
  exploreKind: 'routes',
  explore: area => {
    const bs = bandsAt(area);
    return { code: bs.length ? bs.map(b => b.nums).join(' · ') : '–', title: PROV[R[area].prov], sub: bs.map(b => b.about) };
  },
  rounds: [
    { kind: 'routes', label: 'Québec & Ontario', ids: [...ofProv('QC'), ...ofProv('ON')] },
    { kind: 'routes', label: 'Alberta & Saskatchewan', ids: [...ofProv('AB'), ...ofProv('SK')] },
    { kind: 'routes', label: 'Prince Edward Island', groups: [PROV.PE] },
    { kind: 'routes', label: 'Newfoundland and Labrador', groups: [PROV.NL] },
    { kind: 'routes', label: 'All route bands' },
  ],
  kinds: [
    {
      key: 'routes', label: 'Route numbers', sub: `${BANDS.length} bands`, noun: ['band', 'bands'], pickTitle: 'Bands to practice',
      groups: PROVS.map(pr => ({ title: PROV[pr], sub: '', ids: ofProv(pr) })),
      areasOf: id => B[id].areas,
      areaRank: false,
      short: id => B[id].short, name: id => `${SHORT[B[id].pr]} ${B[id].nums}`,
      about: id => B[id].about,
      clicked: area => unitName(area),
      prompt: 'name',
      chip: id => `${B[id].pr} ${B[id].nums}`, chipTitle: id => B[id].about,
    },
  ],
};
