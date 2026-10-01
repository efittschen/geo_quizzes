// Paraguay Districts: config for ../shared/area-quiz.js, using the areas of ../paraguay-regions/data.js. The 263
// districts (distritos, the municipalities: 262 plus Asunción) of INE/DGEEC via OCHA COD-AB v01 (boundaries of 2022,
// with the districts created up to 2021). Districts crossed by a Mennonite colony boundary are drawn as several areas;
// a click on any of them counts. Areas are colored by department.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const DEPS = [
  ['PY00', 'Asunción'], ['PY01', 'Concepción'], ['PY02', 'San Pedro'], ['PY03', 'Cordillera'], ['PY04', 'Guairá'],
  ['PY05', 'Caaguazú'], ['PY06', 'Caazapá'], ['PY07', 'Itapúa'], ['PY08', 'Misiones'], ['PY09', 'Paraguarí'],
  ['PY10', 'Alto Paraná'], ['PY11', 'Central'], ['PY12', 'Ñeembucú'], ['PY13', 'Amambay'], ['PY14', 'Canindeyú'],
  ['PY15', 'Presidente Hayes'], ['PY16', 'Boquerón'], ['PY17', 'Alto Paraguay'],
];
const DEP = Object.fromEntries(DEPS);
const CHACO = ['PY15', 'PY16', 'PY17'];
const FIX = { 'R.i. 3 Corrales': 'R.I. 3 Corrales', "Juan E. O'leary": "Juan E. O'Leary" };
const byName = (a, b) => a.localeCompare(b, 'es');
const D = {}; // district pcode -> { id, name, dep, areas }
for (const r of DATA.reg) (D[r.district] ??= { id: r.district, name: FIX[r.dname] || r.dname, dep: r.dep, areas: [] }).areas.push(r.id);
// Names used twice (Bella Vista in Amambay and Itapúa) get their department.
const count = {};
for (const d of Object.values(D)) count[d.name] = (count[d.name] || 0) + 1;
const label = id => count[D[id].name] > 1 ? `${D[id].name} (${DEP[D[id].dep]})` : D[id].name;
const inDep = dep => Object.keys(D).filter(id => D[id].dep === dep).sort((a, b) => byName(label(a), label(b)));
const region = dep => CHACO.includes(dep) ? 'Chaco' : 'Región Oriental';

const QUIZ = {
  key: 'pydistricts',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.dep })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 60, labelScale: 0.12, fly: { pad: 1.8, min: 1 / 30 },
  geo: GEO,
  street: { bounds: [[-27.6, -62.7], [-19.3, -54.2]], maxBounds: [[-32, -68], [-15, -50]] },
  hintLabel: 'Color by department',
  exploreKind: 'districts',
  explore: a => ({ code: DEP[R[a].dep], title: label(R[a].district), sub: [region(R[a].dep)] }),
  rounds: [
    { kind: 'districts', label: 'Amambay', groups: ['Amambay'] },
    { kind: 'districts', label: 'Boquerón & Alto Paraguay', sub: 'Chaco', groups: ['Boquerón', 'Alto Paraguay'] },
    { kind: 'districts', label: 'Chaco', sub: 'Presidente Hayes, Boquerón, Alto Paraguay', groups: ['Presidente Hayes', 'Boquerón', 'Alto Paraguay'] },
    { kind: 'districts', label: 'Asunción & Central', groups: ['Asunción', 'Central'] },
    { kind: 'districts', label: 'Concepción', groups: ['Concepción'] },
    { kind: 'districts', label: 'San Pedro', groups: ['San Pedro'] },
    { kind: 'districts', label: 'Canindeyú', groups: ['Canindeyú'] },
    { kind: 'districts', label: 'Cordillera', groups: ['Cordillera'] },
    { kind: 'districts', label: 'Caaguazú', groups: ['Caaguazú'] },
    { kind: 'districts', label: 'Alto Paraná', groups: ['Alto Paraná'] },
    { kind: 'districts', label: 'Paraguarí', groups: ['Paraguarí'] },
    { kind: 'districts', label: 'Guairá', groups: ['Guairá'] },
    { kind: 'districts', label: 'Caazapá & Misiones', groups: ['Caazapá', 'Misiones'] },
    { kind: 'districts', label: 'Ñeembucú', groups: ['Ñeembucú'] },
    { kind: 'districts', label: 'Itapúa', groups: ['Itapúa'] },
    { kind: 'districts', label: 'All districts' },
  ],
  kinds: [
    {
      key: 'districts', label: 'Districts', sub: `All ${Object.keys(D).length} by name`, noun: ['district', 'districts'], pickTitle: 'Districts to practice',
      groups: DEPS.map(([dep, name]) => ({ title: name, sub: region(dep), ids: inDep(dep) })),
      areasOf: id => D[id].areas,
      primary: a => R[a].district,
      merge: false, // keep the department colors; a district's colony parts stay separate areas
      short: label, name: label,
      about: id => [DEP[D[id].dep], region(D[id].dep)],
      clicked: a => `${label(R[a].district)} (${DEP[R[a].dep]})`,
      prompt: 'name',
      detail: { label: 'Show department', text: id => DEP[D[id].dep] },
      chip: label, chipTitle: id => DEP[D[id].dep],
    },
  ],
};
