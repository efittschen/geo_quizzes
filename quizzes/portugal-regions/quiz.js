// Portugal Regions: config for ../shared/area-quiz.js. Map areas are the 308 municipalities (CAOP2025, DGT), so every
// level is a grouping of them: mainland / Azores / Madeira, then the 18 districts and 2 autonomous regions.
// Road modes: national and regional roads (EN/ER) numbered 101–398 run north to south within each class (1945 road
// plan); each class is split into five number bands, and each mainland municipality belongs to the band whose roads
// have the most kilometres in it (OSM road refs; municipalities without such roads take their neighbours' band).
// The bands and their areas are this quiz's own grouping (approximate). Azores and Madeira are drawn as insets.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const EN = { Lisboa: 'Lisbon', Açores: 'Azores' };
const en = s => EN[s] || s;
const sortPt = ids => ids.slice().sort((a, b) => en(a).localeCompare(en(b), 'pt'));

const PARTS = [['C', 'Mainland'], ['A', 'Azores'], ['M', 'Madeira']];
const PART = Object.fromEntries(PARTS);
// Districts grouped by the NUTS 2 region (2024) that holds most of their area (CAOP2025).
const DISTRICT_GROUPS = [
  ['North', ['Viana do Castelo', 'Braga', 'Porto', 'Vila Real', 'Bragança']],
  ['Centre', ['Aveiro', 'Viseu', 'Guarda', 'Coimbra', 'Castelo Branco', 'Leiria']],
  ['West & Tagus', ['Lisboa', 'Santarém']],
  ['Alentejo', ['Portalegre', 'Évora', 'Setúbal', 'Beja']],
  ['Algarve', ['Faro']],
  ['Autonomous regions', ['Açores', 'Madeira']],
];
const GROUP_OF = Object.fromEntries(DISTRICT_GROUPS.flatMap(([g, ds]) => ds.map(d => [d, g])));
const areasIn = (prop, v) => DATA.reg.filter(r => r[prop] === v).map(r => r.id);

// Road bands per class: '101-108' … ; the districts each band's area covers most, for the answer line.
const BANDS = { 1: ['101-108', '109-112', '113-119', '120-123', '124-125'], 2: ['201-221', '222-241', '242-251', '252-265', '266-270'], 3: ['301-325', '326-355', '356-375', '376-393', '394-398'] };
const bandName = b => 'N ' + b.replace('-', '–');
const bandDistricts = (cl, b) => {
  const by = {};
  for (const r of DATA.reg) if (r['n' + cl] === b) by[r.dist] = (by[r.dist] || 0) + r.a;
  return Object.entries(by).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([d]) => en(d)).join(' · ');
};
const roadKind = cl => ({
  key: 'n' + cl, label: `Roads ${cl}xx`, sub: `EN/ER ${BANDS[cl][0].slice(0, 3)}–${BANDS[cl].at(-1).slice(4)}`, noun: ['band', 'bands'], pickTitle: 'Bands to practice',
  groups: [{ title: `N ${cl}xx`, sub: 'north → south', ids: BANDS[cl] }],
  areasOf: b => areasIn('n' + cl, b),
  short: bandName, name: bandName,
  about: b => bandDistricts(cl, b),
  clicked: a => R[a]['n' + cl] ? `${bandName(R[a]['n' + cl])} (${R[a].name})` : R[a].name,
  prompt: 'name',
  chip: bandName, chipTitle: b => bandDistricts(cl, b),
});

const QUIZ = {
  key: 'ptregions',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.dist })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.22, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[36.9, -9.6], [42.2, -6.1]], maxBounds: [[28, -35], [46, 0]] },
  hintLabel: 'Color by district',
  exploreKind: 'districts',
  explore: a => {
    const r = R[a];
    return { code: '', title: r.name, sub: [r.isl ? `${r.isl} · ${en(r.dist)}` : en(r.dist), ...(r.n1 ? [[r.n1, r.n2, r.n3].map(bandName).join(' · ')] : [])] };
  },
  rounds: [
    { kind: 'parts', label: 'Mainland & islands' },
    { kind: 'districts', label: 'North', groups: ['North'] },
    { kind: 'districts', label: 'Centre', groups: ['Centre'] },
    { kind: 'districts', label: 'South', sub: 'West & Tagus · Alentejo · Algarve', groups: ['West & Tagus', 'Alentejo', 'Algarve'] },
    { kind: 'n1', label: 'Roads 1xx', sub: 'EN/ER 101–125' },
    { kind: 'n2', label: 'Roads 2xx', sub: 'EN/ER 201–270' },
    { kind: 'n3', label: 'Roads 3xx', sub: 'EN/ER 301–398' },
    { kind: 'districts', label: 'All districts', sub: '18 + Azores, Madeira' },
  ],
  kinds: [
    {
      key: 'parts', label: 'Mainland & islands', sub: '3 parts', noun: ['part', 'parts'], pickTitle: 'Parts to practice',
      groups: [{ title: 'Portugal', sub: '', ids: PARTS.map(([k]) => k) }],
      areasOf: p => areasIn('part', p),
      short: p => PART[p], name: p => PART[p],
      about: p => p === 'C' ? '18 districts' : 'Autonomous region',
      clicked: a => PART[R[a].part],
      prompt: 'name',
      chip: p => PART[p], chipTitle: p => PART[p],
    },
    {
      key: 'districts', label: 'Districts', sub: '18 + 2 autonomous regions', noun: ['district', 'districts'], pickTitle: 'Districts to practice',
      groups: DISTRICT_GROUPS.map(([title, ds]) => ({ title, sub: '', ids: sortPt(ds) })),
      areasOf: d => areasIn('dist', d),
      short: en, name: en,
      about: d => [d === 'Açores' || d === 'Madeira' ? 'Autonomous region' : `District · ${GROUP_OF[d]}`, `${areasIn('dist', d).length} municipalities`],
      clicked: a => en(R[a].dist),
      prompt: 'name',
      chip: en, chipTitle: d => GROUP_OF[d],
    },
    roadKind(1), roadKind(2), roadKind(3),
  ],
};
