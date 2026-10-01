// Paraguay Regions: config for ../shared/area-quiz.js. Map areas are the 263 districts (INE/DGEEC via OCHA COD-AB
// v01, boundaries of 2022), cut where an OpenStreetMap Mennonite colony boundary (community=Mennonite, ODbL) crosses
// them, so a district or a colony is a group of areas. Levels: the two natural regions (Región Oriental and the Chaco,
// Región Occidental: Presidente Hayes, Boquerón, Alto Paraguay), the 17 departments plus the capital Asunción (Ley
// 71/92), their capitals (en.wikipedia, Departments of Paraguay), and the Mennonite colonies, where German is the
// written language (en.wikipedia, Mennonites in Paraguay). Two small colonies mapped in OSM from themennonitemap.org
// (Colonia Uruguaya, Reinfeld) are left out: that source is not open data.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const DEPS = [
  ['PY00', 'Asunción', 'Asunción'], ['PY01', 'Concepción', 'Concepción'], ['PY02', 'San Pedro', 'San Pedro del Ycuamandyyú'],
  ['PY03', 'Cordillera', 'Caacupé'], ['PY04', 'Guairá', 'Villarrica'], ['PY05', 'Caaguazú', 'Coronel Oviedo'],
  ['PY06', 'Caazapá', 'Caazapá'], ['PY07', 'Itapúa', 'Encarnación'], ['PY08', 'Misiones', 'San Juan Bautista'],
  ['PY09', 'Paraguarí', 'Paraguarí'], ['PY10', 'Alto Paraná', 'Ciudad del Este'], ['PY11', 'Central', 'Areguá'],
  ['PY12', 'Ñeembucú', 'Pilar'], ['PY13', 'Amambay', 'Pedro Juan Caballero'], ['PY14', 'Canindeyú', 'Salto del Guairá'],
  ['PY15', 'Presidente Hayes', 'Villa Hayes'], ['PY16', 'Boquerón', 'Filadelfia'], ['PY17', 'Alto Paraguay', 'Fuerte Olimpo'],
];
const DEP = Object.fromEntries(DEPS.map(([id, name, capital]) => [id, { id, name, capital }]));
const CHACO = ['PY15', 'PY16', 'PY17'];
const REGION = { E: 'Región Oriental', W: 'Chaco' };
const REGION_SUB = { E: 'East of the Paraguay River', W: 'Región Occidental' };
const regionOf = dep => CHACO.includes(dep) ? 'W' : 'E';
const byName = (a, b) => a.localeCompare(b, 'es');
const depIds = r => DEPS.map(d => d[0]).filter(id => regionOf(id) === r).sort((a, b) => byName(DEP[a].name, DEP[b].name));
const depAreas = id => DATA.reg.filter(r => r.dep === id).map(r => r.id);
const regionAreas = k => DATA.reg.filter(r => regionOf(r.dep) === k).map(r => r.id);

// Mennonite colonies: the areas cut out of the districts by each colony's boundary.
const COLONIES = [...new Set(DATA.reg.filter(r => r.colony).map(r => r.colony))].sort(byName);
const colonyAreas = c => DATA.reg.filter(r => r.colony === c).map(r => r.id);
const colonyDeps = c => [...new Set(colonyAreas(c).map(a => R[a].dep))];
const colonyRegion = c => colonyDeps(c).some(d => CHACO.includes(d)) ? 'W' : 'E';
const colonyAbout = c => [`${REGION[colonyRegion(c)]} · ${colonyDeps(c).map(d => DEP[d].name).join(', ')}`,
  [...new Set(colonyAreas(c).map(a => R[a].dname))].join(', ')];
const areaName = a => R[a].colony ? `${R[a].dname} (${R[a].colony})` : R[a].dname;

const QUIZ = {
  key: 'pyregions',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.colony ? 'c' + r.id.split('-')[1] : 'n' })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.16, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[-27.6, -62.7], [-19.3, -54.2]], maxBounds: [[-32, -68], [-15, -50]] },
  hintLabel: 'Color colonies',
  exploreKind: 'departments',
  explore: a => ({
    code: DEP[R[a].dep].name, title: R[a].dname,
    sub: [REGION[regionOf(R[a].dep)], `Capital: ${DEP[R[a].dep].capital}`, ...(R[a].colony ? [`Mennonite colony: ${R[a].colony}`] : [])],
  }),
  rounds: [
    { kind: 'regions', label: 'Chaco or east' },
    { kind: 'departments', label: 'Chaco', sub: 'Región Occidental', groups: ['Chaco'] },
    { kind: 'colonies', label: 'Chaco colonies', sub: 'Mennonite', groups: ['Chaco'] },
    { kind: 'departments', label: 'Región Oriental', sub: '14 + Asunción', groups: ['Región Oriental'] },
    { kind: 'departments', label: 'All departments', sub: '17 + Asunción' },
    { kind: 'capitals', label: 'Department capitals' },
    { kind: 'colonies', label: 'Eastern colonies', sub: 'Mennonite', groups: ['Región Oriental'] },
    { kind: 'colonies', label: 'All colonies', sub: 'Mennonite' },
  ],
  kinds: [
    {
      key: 'regions', label: 'Regions', sub: 'Chaco or east', noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: [{ title: 'Regions', sub: '', ids: ['E', 'W'] }],
      areasOf: regionAreas,
      primary: a => regionOf(R[a].dep),
      short: k => REGION[k], name: k => REGION[k],
      about: k => [REGION_SUB[k], depIds(k).map(d => DEP[d].name).join(', ')],
      clicked: a => `${REGION[regionOf(R[a].dep)]} (${DEP[R[a].dep].name})`,
      prompt: 'name',
      chip: k => REGION[k], chipTitle: k => REGION_SUB[k],
    },
    {
      key: 'departments', label: 'Departments', sub: '17 + Asunción by name', noun: ['department', 'departments'], pickTitle: 'Departments to practice',
      groups: ['E', 'W'].map(k => ({ title: REGION[k], sub: REGION_SUB[k], ids: depIds(k) })),
      areasOf: depAreas,
      primary: a => R[a].dep,
      short: id => DEP[id].name, name: id => DEP[id].name,
      about: id => [REGION[regionOf(id)], `Capital: ${DEP[id].capital}`],
      clicked: a => DEP[R[a].dep].name,
      prompt: 'name',
      detail: { label: 'Show region', text: id => REGION[regionOf(id)] },
      chip: id => DEP[id].name, chipTitle: id => DEP[id].capital,
    },
    {
      key: 'capitals', label: 'Capitals', sub: 'Department capitals', noun: ['capital', 'capitals'], pickTitle: 'Capitals to practice',
      groups: ['E', 'W'].map(k => ({ title: REGION[k], sub: REGION_SUB[k], ids: depIds(k).sort((a, b) => byName(DEP[a].capital, DEP[b].capital)) })),
      areasOf: depAreas,
      primary: a => R[a].dep,
      short: id => DEP[id].capital, name: id => DEP[id].capital,
      about: id => [DEP[id].name, REGION[regionOf(id)]],
      clicked: a => `${DEP[R[a].dep].capital} (${DEP[R[a].dep].name})`,
      prompt: 'name',
      detail: { label: 'Show region', text: id => REGION[regionOf(id)] },
      chip: id => DEP[id].capital, chipTitle: id => DEP[id].name,
    },
    {
      key: 'colonies', label: 'Mennonite colonies', sub: `${COLONIES.length} colonies`, noun: ['colony', 'colonies'], pickTitle: 'Colonies to practice',
      groups: ['W', 'E'].map(k => ({ title: REGION[k], sub: REGION_SUB[k], ids: COLONIES.filter(c => colonyRegion(c) === k) })),
      areasOf: colonyAreas,
      primary: a => R[a].colony || undefined,
      merge: false, hintLabel: 'Color colonies',
      short: c => c, name: c => c,
      about: colonyAbout,
      clicked: a => R[a].colony ? `${R[a].colony} (${R[a].dname})` : `${R[a].dname}: no colony`,
      prompt: 'name',
      detail: { label: 'Show department', text: c => colonyDeps(c).map(d => DEP[d].name).join(', ') },
      chip: c => c, chipTitle: c => colonyDeps(c).map(d => DEP[d].name).join(', '),
    },
  ],
};
