// California Postmiles: config for ../shared/area-quiz.js. Each map area is one of the 58 counties (data.js, id = the
// Caltrans county code stenciled on postmile markers and bridge signs, e.g. SBD 15 42.10). Codes and districts:
// Caltrans GIS, State Highway Network postmiles (CHhighway/Postmiles_1_mile, fields County and District); every code
// checked against the county its postmile points fall in. Callbox placards use other, county-run prefixes (not here).

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const DISTRICT = {
  1: 'Eureka', 2: 'Redding', 3: 'Marysville / Sacramento', 4: 'Bay Area / Oakland', 5: 'Central Coast', 6: 'Fresno / Bakersfield',
  7: 'Los Angeles / Ventura', 8: 'San Bernardino / Riverside', 9: 'Bishop', 10: 'Stockton', 11: 'San Diego', 12: 'Orange County',
};
const districtName = n => `District ${n} · ${DISTRICT[n]}`;
const inDistrict = n => DATA.reg.filter(r => r.dist === String(n)).map(r => r.id).sort();
const groupsOf = ns => ns.map(districtName);

const QUIZ = {
  key: 'uscapostmiles',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.dist })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[32.5, -124.4], [42.0, -114.1]], maxBounds: [[28, -130], [46, -108]] },
  hintLabel: 'Color by Caltrans district',
  exploreKind: 'codes',
  explore: a => ({ code: a, title: `${R[a].name} County`, sub: districtName(R[a].dist) }),
  rounds: [
    { kind: 'codes', label: 'Southern California', sub: 'LA, ORA, SD…', groups: groupsOf([7, 8, 11, 12]) },
    { kind: 'codes', label: 'Bay Area', sub: 'District 4', groups: groupsOf([4]) },
    { kind: 'codes', label: 'Central Coast', sub: 'District 5', groups: groupsOf([5]) },
    { kind: 'codes', label: 'Far North', sub: 'Districts 1 and 2', groups: groupsOf([1, 2]) },
    { kind: 'codes', label: 'Sacramento Valley & Sierra', sub: 'District 3', groups: groupsOf([3]) },
    { kind: 'codes', label: 'San Joaquin Valley & east', sub: 'Districts 6, 9, 10', groups: groupsOf([6, 9, 10]) },
    { kind: 'codes', label: 'Northern California', sub: 'Districts 1 to 4', groups: groupsOf([1, 2, 3, 4]) },
    { kind: 'codes', label: 'All 58 counties' },
  ],
  kinds: [
    {
      key: 'codes', label: 'County codes', sub: `All ${DATA.reg.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: Object.keys(DISTRICT).map(n => ({ title: districtName(n), sub: '', ids: inDistrict(n) })),
      areasOf: id => [id],
      short: id => id, name: id => id,
      about: id => [`${R[id].name} County`, districtName(R[id].dist)],
      clicked: a => `${a} · ${R[a].name}`,
      prompt: 'dial', dial: id => [[id, 'hot']],
      detail: { label: 'Show district', text: id => districtName(R[id].dist) },
      chip: id => id, chipTitle: id => R[id].name,
    },
  ],
};
