// Bangladesh Divisions & Districts: config for ../shared/area-quiz.js. Each map area is one of the 64 districts (zila);
// the 8 divisions (bibhag) are groups of whole districts. Every level comes in English and in Bangla script, the form
// seen on bilingual route signs (Bangla above English). Names: Wikidata labels without the জেলা/বিভাগ suffix.
// Postcode zones (page bangladesh-postcodes): the first digit of the 4-digit postcode, the same for every code in a
// district (GeoNames postal codes, CC BY 4.0, checked against the per-district ranges listed on Wikipedia).

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const DIV = Object.fromEntries(DATA.reg.map(r => [r.dv, { name: r.div, bn: r.dbn }]));
const DIVS = Object.keys(DIV).sort((a, b) => DIV[a].name.localeCompare(DIV[b].name));
const districtsIn = dv => DATA.reg.filter(r => r.dv === dv).map(r => r.id).sort((a, b) => R[a].name.localeCompare(R[b].name));
const DISTRICTS = DIVS.flatMap(districtsIn);
const byDivision = DIVS.map(dv => ({ title: DIV[dv].name, sub: DIV[dv].bn, ids: districtsIn(dv) }));
const divLine = id => `${R[id].div} Division · ${R[id].dbn} বিভাগ`;
const bnText = text => ({ text, lang: 'bn', cls: 'bn' });
const PC = {"BD1004": "8", "BD1006": "8", "BD1009": "8", "BD1042": "8", "BD1078": "8", "BD1079": "8", "BD2003": "4", "BD2012": "3", "BD2013": "3", "BD2015": "4", "BD2019": "3", "BD2022": "4", "BD2030": "3", "BD2046": "4", "BD2051": "3", "BD2075": "3", "BD2084": "4", "BD3026": "1", "BD3029": "7", "BD3033": "1", "BD3035": "8", "BD3048": "2", "BD3054": "7", "BD3056": "1", "BD3059": "1", "BD3067": "1", "BD3068": "1", "BD3082": "7", "BD3086": "8", "BD3093": "1", "BD4001": "9", "BD4018": "7", "BD4041": "7", "BD4044": "7", "BD4047": "9", "BD4050": "7", "BD4055": "7", "BD4057": "7", "BD4065": "7", "BD4087": "9", "BD4539": "2", "BD4561": "2", "BD4572": "2", "BD4589": "2", "BD5010": "5", "BD5038": "5", "BD5064": "6", "BD5069": "6", "BD5070": "6", "BD5076": "6", "BD5081": "6", "BD5088": "6", "BD5527": "5", "BD5532": "5", "BD5549": "5", "BD5552": "5", "BD5573": "5", "BD5577": "5", "BD5585": "5", "BD5594": "5", "BD6036": "3", "BD6058": "3", "BD6090": "3", "BD6091": "3"};
const PDIGITS = [...new Set(Object.values(PC))].sort();
const districtsWith = d => DISTRICTS.filter(id => PC[id] === d);

const QUIZ = {
  key: 'bdregions',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.dv })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.26, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[20.6, 88.0], [26.65, 92.7]], maxBounds: [[17, 83], [30, 97]] },
  hintLabel: 'Color by division',
  exploreKind: 'districts',
  explore: id => ({ code: R[id].bn, title: R[id].name, sub: divLine(id) }),
  rounds: [
    { kind: 'divisions', label: 'Divisions', sub: 'English' },
    { kind: 'divisionsBn', label: 'Divisions', sub: 'Bangla script' },
    { kind: 'districts', label: 'North', sub: 'Rangpur, Rajshahi', groups: ['Rangpur', 'Rajshahi'] },
    { kind: 'districts', label: 'Centre', sub: 'Dhaka, Mymensingh', groups: ['Dhaka', 'Mymensingh'] },
    { kind: 'districts', label: 'East', sub: 'Sylhet, Chattogram', groups: ['Sylhet', 'Chattogram'] },
    { kind: 'districts', label: 'Southwest', sub: 'Khulna, Barishal', groups: ['Khulna', 'Barishal'] },
    { kind: 'districtsBn', label: 'Western half', sub: 'Bangla script · Rangpur, Rajshahi, Khulna, Barishal', groups: ['Rangpur', 'Rajshahi', 'Khulna', 'Barishal'] },
    { kind: 'districtsBn', label: 'Eastern half', sub: 'Bangla script · Dhaka, Mymensingh, Sylhet, Chattogram', groups: ['Dhaka', 'Mymensingh', 'Sylhet', 'Chattogram'] },
    { kind: 'districts', label: 'All 64 districts', sub: 'English' },
    { kind: 'districtsBn', label: 'All 64 districts', sub: 'Bangla script' },
    { kind: 'postcodes', label: 'Postcode zones', sub: 'First digit' },
  ],
  kinds: [
    {
      key: 'districts', label: 'Districts', sub: `All ${DISTRICTS.length} by name`, noun: ['district', 'districts'], pickTitle: 'Districts to practice',
      groups: byDivision,
      areasOf: id => [id],
      short: id => R[id].name, name: id => R[id].name,
      about: id => [R[id].bn, divLine(id)],
      clicked: a => `${R[a].name} · ${R[a].bn}`,
      prompt: 'name',
      chip: id => R[id].name, chipTitle: id => `${R[id].bn} · ${R[id].div} Division`,
    },
    {
      key: 'districtsBn', label: 'Districts in Bangla', sub: `All ${DISTRICTS.length} in Bangla script`, noun: ['district', 'districts'], pickTitle: 'Districts to practice',
      groups: byDivision,
      areasOf: id => [id],
      short: id => R[id].bn, name: id => `${R[id].bn} · ${R[id].name}`,
      about: id => [R[id].name, divLine(id)],
      clicked: a => `${R[a].bn} · ${R[a].name}`,
      prompt: 'text', text: id => bnText(R[id].bn),
      chip: id => R[id].bn, chipTitle: id => `${R[id].name} · ${R[id].div} Division`,
    },
    {
      key: 'divisions', label: 'Divisions', sub: `${DIVS.length} divisions`, noun: ['division', 'divisions'], pickTitle: 'Divisions to practice',
      groups: [{ title: 'Divisions', sub: 'বিভাগ', ids: DIVS }],
      areasOf: districtsIn,
      short: dv => DIV[dv].name, name: dv => DIV[dv].name,
      about: dv => [`${DIV[dv].bn} বিভাগ`, `${districtsIn(dv).length} districts`],
      clicked: a => `${R[a].div} Division (${R[a].name} District)`,
      prompt: 'name',
      hints: false, // the colors are the divisions
      chip: dv => DIV[dv].name, chipTitle: dv => `${DIV[dv].bn} বিভাগ`,
    },
    {
      key: 'divisionsBn', label: 'Divisions in Bangla', sub: `${DIVS.length} in Bangla script`, noun: ['division', 'divisions'], pickTitle: 'Divisions to practice',
      groups: [{ title: 'Divisions', sub: 'বিভাগ', ids: DIVS }],
      areasOf: districtsIn,
      short: dv => DIV[dv].bn, name: dv => `${DIV[dv].bn} · ${DIV[dv].name}`,
      about: dv => [`${DIV[dv].name} Division`, `${districtsIn(dv).length} districts`],
      clicked: a => `${R[a].dbn} · ${R[a].div} Division`,
      prompt: 'text', text: dv => bnText(DIV[dv].bn),
      hints: false,
      chip: dv => DIV[dv].bn, chipTitle: dv => `${DIV[dv].name} Division`,
    },
    {
      key: 'postcodes', label: 'Postcode zones', sub: `${PDIGITS.length} zones by first digit`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: 'postcodes by first digit', ids: PDIGITS }],
      areasOf: districtsWith,
      short: d => `${d}xxx`, name: d => `${d}xxx`,
      about: d => [districtsWith(d).map(id => R[id].name).join(', ')],
      clicked: a => `${PC[a]}xxx · ${R[a].name}`,
      prompt: 'dial', dial: d => [[d, 'hot'], ['xxx', 'cold']],
      hints: false, // the colors are the zones
      chip: d => `${d}xxx`, chipTitle: d => districtsWith(d).map(id => R[id].name).join(', '),
    },
  ],
};
