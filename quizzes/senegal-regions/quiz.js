// Senegal Regions: config for ../shared/area-quiz.js. Each map area is one of the 46 departments (OCHA COD-AB admin2,
// with Keur Massar, created 2021). Regions, Casamance (Ziguinchor, Sédhiou, Kolda), plate codes and the two landline
// zones are groups of departments. ../senegal-codes uses the same config with data-kinds="codes".

const D = Object.fromEntries(DATA.reg.map(d => [d.id, d]));
const byName = (a, b) => D[a].n.localeCompare(D[b].n, 'fr');
const REGIONS = [...new Set(DATA.reg.map(d => d.r))].sort();
const RN = Object.fromEntries(DATA.reg.map(d => [d.r, d.rn]));
const PL = Object.fromEntries(DATA.reg.map(d => [d.r, d.pl]));
const deptsIn = rg => DATA.reg.filter(d => d.r === rg).map(d => d.id).sort(byName);
const regionsByName = ids => ids.slice().sort((a, b) => RN[a].localeCompare(RN[b], 'fr'));

// Casamance: the three regions south of The Gambia.
const ZONES = { CAS: 'Casamance', REST: 'Rest of Senegal' };
const zoneRegions = z => regionsByName(REGIONS.filter(rg => deptsIn(rg).some(id => D[id].z === z)));
const zoneGroups = () => Object.keys(ZONES).map(z => ({ title: ZONES[z], sub: '', ids: zoneRegions(z) }));

// Sonatel fixed lines (the only geographic numbers): 33 8 Dakar region, 33 9 every other region.
const LANDLINE = { 338: 'Dakar region', 339: 'Other 13 regions' };
const PHONE = document.body.dataset.kinds === 'codes';

const QUIZ = {
  key: 'snregions',
  areas: DATA.reg.map(d => ({ id: d.id, d: d.d, lx: d.lx, ly: d.ly, a: d.a, g: d.r })),
  borders: [DATA.rb],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 60, labelScale: 0.22, fly: { pad: 1.6, min: 1 / 60 },
  geo: GEO,
  street: { bounds: [[12.3, -17.55], [16.7, -11.35]], maxBounds: [[9, -22], [20, -7]] },
  hintLabel: 'Color by region',
  exploreKind: 'departments',
  // The phone page shows each area's landline prefix, the regions page its plate code.
  explore: id => ({
    code: PHONE ? `33 ${D[id].k[2]}` : D[id].pl, title: D[id].n,
    sub: [`${D[id].rn} region`, ...(D[id].z === 'CAS' ? ['Casamance'] : [])],
  }),
  rounds: [
    { kind: 'zones', label: 'Casamance & the rest' },
    { kind: 'regions', label: 'Casamance', groups: ['Casamance'] },
    { kind: 'regions', label: 'All regions' },
    { kind: 'plates', label: 'Plate codes' },
    { kind: 'departments', label: 'Casamance', sub: 'Ziguinchor, Sédhiou, Kolda', groups: ['Ziguinchor', 'Sédhiou', 'Kolda'] },
    { kind: 'departments', label: 'Dakar & Thiès', groups: ['Dakar', 'Thiès'] },
    { kind: 'departments', label: 'The north', sub: 'Saint-Louis, Louga, Matam', groups: ['Saint-Louis', 'Louga', 'Matam'] },
    { kind: 'departments', label: 'The east', sub: 'Tambacounda, Kédougou', groups: ['Tambacounda', 'Kédougou'] },
    { kind: 'departments', label: 'The centre', sub: 'Diourbel, Fatick, Kaolack, Kaffrine', groups: ['Diourbel', 'Fatick', 'Kaolack', 'Kaffrine'] },
    { kind: 'departments', label: 'All departments' },
    { kind: 'codes', label: 'Landline codes', sub: '33 8, 33 9' },
  ],
  kinds: [
    {
      key: 'zones', label: 'Casamance', sub: 'Beginner', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: '', ids: Object.keys(ZONES) }],
      areasOf: z => DATA.reg.filter(d => d.z === z).map(d => d.id),
      short: z => ZONES[z], name: z => ZONES[z],
      about: z => zoneRegions(z).map(rg => RN[rg]).join(', '),
      clicked: id => `${ZONES[D[id].z]} (${D[id].rn})`,
      prompt: 'name',
      chip: z => ZONES[z], chipTitle: z => zoneRegions(z).map(rg => RN[rg]).join(', '),
    },
    {
      key: 'regions', label: 'Regions', sub: `All ${REGIONS.length} by name`, noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: zoneGroups(),
      areasOf: deptsIn,
      short: rg => RN[rg], name: rg => RN[rg],
      about: rg => [`Plate ${PL[rg]}`, deptsIn(rg).map(id => D[id].n).join(', ')],
      clicked: id => D[id].rn,
      prompt: 'name',
      chip: rg => RN[rg], chipTitle: rg => deptsIn(rg).map(id => D[id].n).join(', '),
    },
    {
      key: 'departments', label: 'Departments', sub: `All ${DATA.reg.length} by name`, noun: ['department', 'departments'], pickTitle: 'Departments to practice',
      groups: regionsByName(REGIONS).map(rg => ({ title: RN[rg], sub: '', ids: deptsIn(rg) })),
      areasOf: id => [id],
      short: id => D[id].n, name: id => D[id].n,
      about: id => `${D[id].rn} region`,
      clicked: id => `${D[id].n} (${D[id].rn})`,
      prompt: 'name',
      detail: { label: 'Show region', text: id => `${D[id].rn} region` },
      chip: id => D[id].n, chipTitle: id => `${D[id].rn} region`,
    },
    {
      key: 'plates', label: 'Plate codes', sub: `${REGIONS.length} region codes`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: zoneGroups(),
      areasOf: deptsIn,
      short: rg => PL[rg], name: rg => PL[rg],
      about: rg => `${RN[rg]} region`,
      clicked: id => `${D[id].pl} (${D[id].rn})`,
      prompt: 'dial',
      chip: rg => PL[rg], chipTitle: rg => RN[rg],
    },
    {
      key: 'codes', label: 'Landline codes', sub: '33 8, 33 9', noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: [{ title: 'Sonatel landlines', sub: '', ids: Object.keys(LANDLINE) }],
      areasOf: k => DATA.reg.filter(d => d.k === k).map(d => d.id),
      short: k => `33 ${k[2]}`, name: k => `33 ${k[2]}`,
      about: k => LANDLINE[k],
      clicked: id => `33 ${D[id].k[2]} (${LANDLINE[D[id].k]})`,
      prompt: 'dial', dial: k => [['33', 'cold'], [k[2], 'hot']],
      chip: k => `33 ${k[2]}`, chipTitle: k => LANDLINE[k],
    },
  ],
};
