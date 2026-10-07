// Australia Power Networks: config for ../shared/area-quiz.js. The 16 electricity distribution networks, whose names
// and markings are on the poles. Areas are rebuilt from 2001 census districts (ABS ASGC 2001):
// - NSW: the distribution districts of the Electricity Supply Act 1995 (NSW), Schedule 3, which name local government
//   areas as they were then; Merriwa (part) split by the nearest Ausgrid or Essential Energy substation (OSM).
// - Victoria: each district takes the operator of the nearest zone substation (OSM operator tags).
// - Queensland: Energex = the south-east councils ("from the NSW border north to Gympie and west to the base of the
//   Great Dividing Range"), edge councils by nearest substation; Essential Energy = Goondiwindi region; Ergon = the rest.
// - Western Australia: Horizon Power = councils outside the South West Interconnected System (Kalbarri, Albany,
//   Kalgoorlie) whose towns Horizon supplies (Horizon Power customer charter); Western Power = the rest.
// - One network each: ACT (Evoenergy), SA (SA Power Networks), Tasmania (TasNetworks), NT (Power and Water).
// Borders are approximate. Lord Howe Island (its own board) and the other territories are left out.

const NET = {
  ausgrid: { n: 'Ausgrid', st: ['NSW'] },
  endeavour: { n: 'Endeavour Energy', st: ['NSW'] },
  essential: { n: 'Essential Energy', st: ['NSW', 'QLD'] },
  evoenergy: { n: 'Evoenergy', st: ['ACT'] },
  citipower: { n: 'CitiPower', st: ['VIC'] },
  powercor: { n: 'Powercor', st: ['VIC'] },
  jemena: { n: 'Jemena', st: ['VIC'] },
  united: { n: 'United Energy', st: ['VIC'] },
  ausnet: { n: 'AusNet', st: ['VIC'] },
  energex: { n: 'Energex', st: ['QLD'] },
  ergon: { n: 'Ergon Energy', st: ['QLD'] },
  sapn: { n: 'SA Power Networks', st: ['SA'] },
  tasnetworks: { n: 'TasNetworks', st: ['TAS'] },
  westernpower: { n: 'Western Power', st: ['WA'] },
  horizon: { n: 'Horizon Power', st: ['WA'] },
  pwc: { n: 'Power and Water', st: ['NT'] },
};
const STATE = { NSW: 'New South Wales', ACT: 'Australian Capital Territory', VIC: 'Victoria', QLD: 'Queensland', SA: 'South Australia', TAS: 'Tasmania', WA: 'Western Australia', NT: 'Northern Territory' };
const IDS = Object.keys(NET);
const AREAS_OF = {};
for (const r of DATA.reg) (AREAS_OF[r.op] ??= []).push(r.id);
const name = id => NET[id].n;
const states = id => NET[id].st.join(', ');
const statesLong = id => NET[id].st.map(s => STATE[s]).join(', ');
const opOf = area => DATA.reg.find(r => r.id === area).op;
const inStates = (...st) => IDS.filter(id => NET[id].st.some(s => st.includes(s)));

const QUIZ = {
  key: 'aupower',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.op })),
  borders: [STATE_LINES],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 60, labelScale: 0.25, fly: { pad: 1.6, min: 1 / 60 },
  geo: GEO,
  street: { bounds: [[-43.7, 113], [-10.6, 153.7]], maxBounds: [[-50, 95], [0, 170]] },
  hintLabel: 'Color each network',
  exploreKind: 'net',
  explore: area => { const id = opOf(area); return { code: name(id), title: statesLong(id), sub: [] }; },
  rounds: [
    { kind: 'net', label: 'New South Wales & ACT', sub: 'Ausgrid, Endeavour, Essential, Evoenergy', ids: ['ausgrid', 'endeavour', 'essential', 'evoenergy'] },
    { kind: 'net', label: 'Victoria', sub: '5 networks', ids: inStates('VIC') },
    { kind: 'net', label: 'Queensland & WA', sub: 'Energex, Ergon, Western Power, Horizon', ids: ['energex', 'ergon', 'westernpower', 'horizon'] },
    { kind: 'net', label: 'All 16 networks' },
  ],
  kinds: [
    {
      key: 'net', label: 'Networks', sub: 'All 16', noun: ['network', 'networks'], pickTitle: 'Networks to practice',
      groups: [
        { title: 'NSW & ACT', sub: '', ids: ['ausgrid', 'endeavour', 'essential', 'evoenergy'] },
        { title: 'Victoria', sub: '', ids: inStates('VIC') },
        { title: 'Queensland', sub: '', ids: ['energex', 'ergon'] },
        { title: 'Western Australia', sub: '', ids: inStates('WA') },
        { title: 'SA, Tasmania, NT', sub: '', ids: inStates('SA', 'TAS', 'NT') },
      ],
      areasOf: id => AREAS_OF[id],
      short: name, name,
      about: statesLong,
      clicked: area => `${name(opOf(area))} · ${states(opOf(area))}`,
      prompt: 'name',
      merge: false, // keep the state borders: Essential Energy's area crosses into Queensland
      detail: { label: 'Show state', text: statesLong },
      chip: name, chipTitle: statesLong,
    },
  ],
};
