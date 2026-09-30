// Australia States: config for ../shared/area-quiz.js, using the state and territory outlines from
// ../australia-prefixes/data.js (DATA.ent). Names come from geo.js (STATE_NAMES, from the towns inside each).

const FULL = { ACT: 'Australian Capital Territory' };
const STATES = DATA.ent.map((d, i) => ({ id: 'st' + i, d, name: FULL[STATE_NAMES[i]] || STATE_NAMES[i] }));
const S = Object.fromEntries(STATES.map(s => [s.id, s]));
const ABBR = { 'Western Australia': 'WA', 'Northern Territory': 'NT', 'South Australia': 'SA', 'Queensland': 'QLD', 'New South Wales': 'NSW', 'Victoria': 'VIC', 'Tasmania': 'TAS', 'Australian Capital Territory': 'ACT' };
const CAPITAL = { 'Western Australia': 'Perth', 'Northern Territory': 'Darwin', 'South Australia': 'Adelaide', 'Queensland': 'Brisbane', 'New South Wales': 'Sydney', 'Victoria': 'Melbourne', 'Tasmania': 'Hobart', 'Australian Capital Territory': 'Canberra' };
const AREA_CODE = { 'New South Wales': '02', 'Australian Capital Territory': '02', 'Victoria': '03', 'Tasmania': '03', 'Queensland': '07', 'South Australia': '08', 'Western Australia': '08', 'Northern Territory': '08' };
const TERRITORIES = ['Northern Territory', 'Australian Capital Territory'];
const COLOR = { WA: 1, NT: 2, SA: 3, QLD: 4, NSW: 5, VIC: 6, TAS: 7, ACT: 8 };
const byName = (a, b) => S[a].name.localeCompare(S[b].name);

const QUIZ = {
  key: 'austates',
  areas: STATES.map(s => ({ id: s.id, d: s.d, g: String(COLOR[ABBR[s.name]]) })), // label point and size come from the path
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.2, fly: { pad: 1.6, min: 1 / 25 },
  geo: GEO,
  street: { bounds: [[-43.7, 113], [-10.6, 153.7]], maxBounds: [[-50, 95], [0, 170]] },
  hintLabel: 'Color each state',
  exploreKind: 'states',
  explore: id => ({ code: ABBR[S[id].name], title: S[id].name, sub: [`Capital: ${CAPITAL[S[id].name]}`, `Area code: ${AREA_CODE[S[id].name]}`] }),
  rounds: [
    { kind: 'states', label: 'All states & territories' },
  ],
  kinds: [
    {
      key: 'states', label: 'States', sub: 'All 8 by name', noun: ['state', 'states'], pickTitle: 'States to practice',
      groups: [
        { title: 'States', sub: '', ids: STATES.filter(s => !TERRITORIES.includes(s.name)).map(s => s.id).sort(byName) },
        { title: 'Territories', sub: '', ids: STATES.filter(s => TERRITORIES.includes(s.name)).map(s => s.id).sort(byName) },
      ],
      areasOf: id => [id],
      short: id => ABBR[S[id].name], name: id => S[id].name,
      about: id => [`Capital: ${CAPITAL[S[id].name]}`, `Area code: ${AREA_CODE[S[id].name]}`],
      clicked: id => S[id].name,
      prompt: 'name',
      chip: id => S[id].name, chipTitle: id => `Capital: ${CAPITAL[S[id].name]}`,
    },
  ],
};
