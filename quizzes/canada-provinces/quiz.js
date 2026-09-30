// Canada Provinces: config for ../shared/area-quiz.js, using the province and territory shapes from
// ../canada-codes/provinces.js (the area-code map only has border lines, and 867 and 902 each span several).

const P = Object.fromEntries(PROVINCES.map(p => [p.id, p]));
const TERRITORIES = ['prYT', 'prNT', 'prNU'];
const CAPITAL = {
  AB: 'Edmonton', BC: 'Victoria', MB: 'Winnipeg', NB: 'Fredericton', NL: "St. John's", NS: 'Halifax', ON: 'Toronto',
  PE: 'Charlottetown', QC: 'Québec City', SK: 'Regina', NT: 'Yellowknife', NU: 'Iqaluit', YT: 'Whitehorse',
};
// Neighbours get different colors (g2–g9).
const COLOR = { AB: 2, BC: 3, MB: 4, NB: 5, NL: 6, NT: 7, NS: 8, NU: 9, ON: 2, PE: 9, QC: 3, SK: 5, YT: 8 };
// Area codes used in each province (902 is Nova Scotia and PEI; 867 is all three territories).
const codesIn = name => [...new Set(DATA.reg.filter(r => r.st.split(' / ').includes(name)).flatMap(r => r.k))].sort();

const QUIZ = {
  key: 'caprov',
  areas: PROVINCES.map(p => ({ id: p.id, d: p.d, lx: p.lx, ly: p.ly, a: p.a, g: String(COLOR[p.postal]) })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.2, fly: { pad: 1.6, min: 1 / 25 },
  geo: GEO,
  street: { bounds: [[41.7, -141], [62, -52.6]], maxBounds: [[35, -175], [85, -40]] },
  hintLabel: 'Color each province',
  exploreKind: 'provinces',
  explore: id => ({ code: P[id].postal, title: P[id].name, sub: [`Capital: ${CAPITAL[P[id].postal]}`, `Area codes: ${codesIn(P[id].name).join(', ')}`] }),
  rounds: [
    { kind: 'provinces', label: 'The West & the North', ids: ['prBC', 'prAB', 'prSK', 'prMB', 'prYT', 'prNT', 'prNU'] },
    { kind: 'provinces', label: 'All provinces & territories' },
  ],
  kinds: [
    {
      key: 'provinces', label: 'Provinces', sub: 'All 13 by name', noun: ['province', 'provinces'], pickTitle: 'Provinces to practice',
      groups: [
        { title: 'Provinces', sub: '', ids: PROVINCES.map(p => p.id).filter(id => !TERRITORIES.includes(id)) },
        { title: 'Territories', sub: '', ids: TERRITORIES },
      ],
      areasOf: id => [id],
      short: id => P[id].postal, name: id => P[id].name,
      about: id => [`Capital: ${CAPITAL[P[id].postal]}`, `Area codes: ${codesIn(P[id].name).join(', ')}`],
      clicked: id => P[id].name,
      prompt: 'name',
      chip: id => P[id].name, chipTitle: id => `Capital: ${CAPITAL[P[id].postal]}`,
    },
  ],
};
