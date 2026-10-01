// Ecuador Provinces: config for ../shared/area-quiz.js. 24 provinces (dissolved from INEC cantons) in 4 natural
// regions, with each province's plate letter (first letter on licence plates and taxis). Galápagos is drawn as an
// inset closer to the mainland; the street map has it at its real position.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const IDS = DATA.reg.map(r => r.id);
const REGIONS = [['C', 'Costa'], ['S', 'Sierra'], ['A', 'Amazonía'], ['G', 'Galápagos']];
const REGION = Object.fromEntries(REGIONS);
const REGION_SUB = { C: 'Coast', S: 'Andes', A: 'Oriente', G: 'Islands' };
// Provincial capitals (Wikipedia, Provinces of Ecuador).
const CAPITAL = {
  '01': 'Cuenca', '02': 'Guaranda', '03': 'Azogues', '04': 'Tulcán', '05': 'Latacunga', '06': 'Riobamba', '07': 'Machala',
  '08': 'Esmeraldas', '09': 'Guayaquil', '10': 'Ibarra', '11': 'Loja', '12': 'Babahoyo', '13': 'Portoviejo', '14': 'Macas',
  '15': 'Tena', '16': 'Puyo', '17': 'Quito', '18': 'Ambato', '19': 'Zamora', '20': 'Puerto Baquerizo Moreno', '21': 'Nueva Loja',
  '22': 'Puerto Francisco de Orellana', '23': 'Santo Domingo', '24': 'Santa Elena',
};
const SHORT = { p23: 'Santo Domingo' };
const byName = (a, b) => R[a].name.localeCompare(R[b].name, 'es');
const inRegion = k => IDS.filter(id => R[id].region === k).sort(byName);
const short = id => SHORT[id] || R[id].name;
const facts = id => [`Plate ${R[id].plate}`, `Area code 0${R[id].phone}`, `Capital: ${CAPITAL[R[id].code]}`];

// The Galápagos inset gets a frame (from its own outline, with a margin).
const insetBox = (() => {
  const n = R.p20.d.match(/-?\d+\.?\d*/g).map(Number), xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
  const m = 14, x0 = Math.min(...xs) - m, x1 = Math.max(...xs) + m, y0 = Math.min(...ys) - m, y1 = Math.max(...ys) + m;
  return `M${x0},${y0}H${x1}V${y1}H${x0}Z`;
})();

const plateDial = id => [[R[id].plate, 'hot'], ['··-····', 'cold']];

const QUIZ = {
  key: 'ecprov',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.region })),
  borders: [insetBox],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 30, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 30 },
  geo: GEO,
  street: { bounds: [[-5.1, -81.2], [1.5, -75.1]], maxBounds: [[-9, -95], [5, -70]] },
  hintLabel: 'Color by region',
  exploreKind: 'provinces',
  explore: id => ({ code: R[id].plate, title: R[id].name, sub: [`${REGION[R[id].region]}`, ...facts(id)] }),
  rounds: [
    { kind: 'regions', label: 'Natural regions' },
    { kind: 'provinces', label: 'Costa', groups: ['Costa'] },
    { kind: 'provinces', label: 'Amazonía', groups: ['Amazonía'] },
    { kind: 'plates', label: 'Plate letters: Costa', groups: ['Costa'] },
    { kind: 'plates', label: 'Plate letters: Amazonía', groups: ['Amazonía'] },
    { kind: 'provinces', label: 'Sierra', groups: ['Sierra'] },
    { kind: 'plates', label: 'Plate letters: Sierra', groups: ['Sierra'] },
    { kind: 'provinces', label: 'All provinces' },
    { kind: 'plates', label: 'All plate letters' },
  ],
  kinds: [
    {
      key: 'regions', label: 'Natural regions', sub: 'Costa, Sierra, Amazonía, Galápagos', noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: [{ title: 'Regions', sub: '', ids: REGIONS.map(([k]) => k) }],
      areasOf: inRegion,
      primary: area => R[area].region,
      short: k => REGION[k], name: k => REGION[k],
      about: k => [REGION_SUB[k], `${inRegion(k).length} provinces`],
      clicked: area => `${REGION[R[area].region]} (${R[area].name})`,
      prompt: 'name',
      hints: false, // the colors are these regions
      chip: k => REGION[k], chipTitle: k => REGION_SUB[k],
    },
    {
      key: 'provinces', label: 'Provinces', sub: `All ${IDS.length} by name`, noun: ['province', 'provinces'], pickTitle: 'Provinces to practice',
      groups: REGIONS.map(([k, name]) => ({ title: name, sub: REGION_SUB[k], ids: inRegion(k) })),
      areasOf: id => [id],
      short, name: id => R[id].name,
      about: id => [REGION[R[id].region], ...facts(id)],
      clicked: id => R[id].name,
      prompt: 'name',
      detail: { label: 'Show region', text: id => REGION[R[id].region] },
      chip: short, chipTitle: id => `Plate ${R[id].plate}`,
    },
    {
      key: 'plates', label: 'Plate letters', sub: `All ${IDS.length}`, noun: ['letter', 'letters'], pickTitle: 'Letters to practice',
      groups: REGIONS.map(([k, name]) => ({ title: name, sub: REGION_SUB[k], ids: inRegion(k).sort((a, b) => R[a].plate.localeCompare(R[b].plate)) })),
      areasOf: id => [id],
      short: id => R[id].plate, name: id => R[id].plate,
      about: id => [R[id].name, REGION[R[id].region]],
      clicked: id => `${R[id].plate}: ${R[id].name}`,
      prompt: 'dial', dial: plateDial,
      detail: { label: 'Show region', text: id => REGION[R[id].region] },
      chip: id => R[id].plate, chipTitle: id => R[id].name,
    },
  ],
};
