// Bolivia Departments: config for ../shared/area-quiz.js. 9 departments (OCHA COD-AB admin1) in 3 zones by whole
// department: Altiplano (Zona Andina: La Paz, Oruro, Potosí), Valleys (Zona Subandina: Cochabamba, Chuquisaca, Tarija),
// Lowlands (Llanos Orientales: Santa Cruz, Beni, Pando), as listed by the Embassy of Bolivia in France. The physical
// regions don't follow department borders exactly (northern La Paz is lowland, the Chaco reaches Tarija and
// Chuquisaca). Each department's letter in the box on licence plates (es.wikipedia, Matrículas automovilísticas de
// Bolivia; the same letters as ISO 3166-2:BO) and its capital (Wikipedia, Departments of Bolivia).

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const IDS = DATA.reg.map(r => r.id);
const ZONES = [['A', 'Altiplano'], ['V', 'Valleys'], ['L', 'Lowlands']];
const ZONE = Object.fromEntries(ZONES);
const ZONE_SUB = { A: 'Zona Andina', V: 'Zona Subandina', L: 'Llanos Orientales' };
const CAPITAL = {
  BO01: 'Sucre', BO02: 'La Paz', BO03: 'Cochabamba', BO04: 'Oruro', BO05: 'Potosí',
  BO06: 'Tarija', BO07: 'Santa Cruz de la Sierra', BO08: 'Trinidad', BO09: 'Cobija',
};
const byName = (a, b) => R[a].name.localeCompare(R[b].name, 'es');
const inZone = k => IDS.filter(id => R[id].zone === k).sort(byName);
const facts = id => [`Capital: ${CAPITAL[id]}`, `Plate ${R[id].plate}`, `Phone zone ${R[id].phone}`];

const QUIZ = {
  key: 'bodept',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.zone })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 20, labelScale: 0.12, fly: { pad: 1.6, min: 1.5 / 20 },
  geo: GEO,
  street: { bounds: [[-22.9, -69.7], [-9.6, -57.4]], maxBounds: [[-30, -82], [-2, -45]] },
  hintLabel: 'Color by zone',
  exploreKind: 'departments',
  explore: id => ({ code: R[id].plate, title: R[id].name, sub: [ZONE[R[id].zone], ...facts(id)] }),
  rounds: [
    { kind: 'zones', label: 'Altiplano, valleys, lowlands' },
    { kind: 'departments', label: 'Altiplano', groups: ['Altiplano'] },
    { kind: 'departments', label: 'Valleys', groups: ['Valleys'] },
    { kind: 'departments', label: 'Lowlands', groups: ['Lowlands'] },
    { kind: 'departments', label: 'All departments' },
    { kind: 'capitals', label: 'Department capitals' },
    { kind: 'plates', label: 'Plate letters' },
  ],
  kinds: [
    {
      key: 'zones', label: 'Zones', sub: 'Altiplano, valleys, lowlands', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: '', ids: ZONES.map(([k]) => k) }],
      areasOf: inZone,
      primary: area => R[area].zone,
      short: k => ZONE[k], name: k => ZONE[k],
      about: k => [ZONE_SUB[k], inZone(k).map(id => R[id].name).join(', ')],
      clicked: area => `${ZONE[R[area].zone]} (${R[area].name})`,
      prompt: 'name',
      hints: false, // the colors are these zones
      chip: k => ZONE[k], chipTitle: k => ZONE_SUB[k],
    },
    {
      key: 'departments', label: 'Departments', sub: `All ${IDS.length} by name`, noun: ['department', 'departments'], pickTitle: 'Departments to practice',
      groups: ZONES.map(([k, name]) => ({ title: name, sub: ZONE_SUB[k], ids: inZone(k) })),
      areasOf: id => [id],
      short: id => R[id].name, name: id => R[id].name,
      about: id => [ZONE[R[id].zone], ...facts(id)],
      clicked: id => R[id].name,
      prompt: 'name',
      detail: { label: 'Show zone', text: id => ZONE[R[id].zone] },
      chip: id => R[id].name, chipTitle: id => CAPITAL[id],
    },
    {
      key: 'capitals', label: 'Capitals', sub: `All ${IDS.length}`, noun: ['capital', 'capitals'], pickTitle: 'Capitals to practice',
      groups: ZONES.map(([k, name]) => ({ title: name, sub: ZONE_SUB[k], ids: inZone(k).sort((a, b) => CAPITAL[a].localeCompare(CAPITAL[b], 'es')) })),
      areasOf: id => [id],
      short: id => CAPITAL[id], name: id => CAPITAL[id],
      about: id => [R[id].name, ZONE[R[id].zone]],
      clicked: id => `${CAPITAL[id]} (${R[id].name})`,
      prompt: 'name',
      detail: { label: 'Show zone', text: id => ZONE[R[id].zone] },
      chip: id => CAPITAL[id], chipTitle: id => R[id].name,
    },
    {
      key: 'plates', label: 'Plate letters', sub: `All ${IDS.length}`, noun: ['letter', 'letters'], pickTitle: 'Letters to practice',
      groups: ZONES.map(([k, name]) => ({ title: name, sub: ZONE_SUB[k], ids: inZone(k).sort((a, b) => R[a].plate.localeCompare(R[b].plate)) })),
      areasOf: id => [id],
      short: id => R[id].plate, name: id => R[id].plate,
      about: id => [R[id].name, ZONE[R[id].zone]],
      clicked: id => `${R[id].plate}: ${R[id].name}`,
      prompt: 'dial', dial: id => [[R[id].plate, 'hot']],
      detail: { label: 'Show zone', text: id => ZONE[R[id].zone] },
      chip: id => R[id].plate, chipTitle: id => R[id].name,
    },
  ],
};
