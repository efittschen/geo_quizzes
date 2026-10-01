// Vienna Districts: config for ../shared/area-quiz.js. Vienna's 23 Gemeindebezirke; each area's id is the district
// number, as at the start of every Vienna street-name sign ("7., Neubaugasse"). Postcodes 1XX0 carry it too.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, { ...r, nm: r.name.replace(/^Wien-/, '') }]));
const IDS = DATA.reg.map(r => r.id).sort((a, b) => a - b);
const INNER = IDS.filter(id => +id <= 9), OUTER = IDS.filter(id => +id >= 10);
const GROUPS = [{ title: 'Districts 1–9', sub: '', ids: INNER }, { title: 'Districts 10–23', sub: '', ids: OUTER }];
const num = id => `${id}.`;
const plz = id => `1${id.padStart(2, '0')}0`;
const nm = id => R[id].nm;

const kind = (key, extra) => ({
  key, noun: ['district', 'districts'], pickTitle: 'Districts to practice',
  groups: GROUPS,
  areasOf: id => [id],
  about: id => [`${num(id)} ${nm(id)}`, plz(id)],
  clicked: id => `${num(id)} ${nm(id)}`,
  chipTitle: id => `${num(id)} ${nm(id)}`,
  ...extra,
});

const QUIZ = {
  key: 'atvienna',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.id })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 12, labelScale: 0.3, fly: { pad: 1.8, min: 1 / 8 },
  geo: GEO,
  street: { bounds: [[48.118, 16.182], [48.323, 16.578]], maxBounds: [[47.9, 15.8], [48.5, 17]] },
  hintLabel: 'Color each district',
  exploreKind: 'numbers',
  explore: id => ({ code: num(id), title: nm(id), sub: plz(id) }),
  rounds: [
    { kind: 'numbers', label: 'Districts 1–9', sub: 'Sign numbers', groups: ['Districts 1–9'] },
    { kind: 'names', label: 'Districts 1–9', sub: 'Names', groups: ['Districts 1–9'] },
    { kind: 'numbers', label: 'Districts 10–23', sub: 'Sign numbers', groups: ['Districts 10–23'] },
    { kind: 'numbers', label: 'All 23', sub: 'Sign numbers' },
    { kind: 'postcodes', label: 'All 23', sub: 'Postcodes' },
    { kind: 'names', label: 'Districts 10–23', sub: 'Names', groups: ['Districts 10–23'] },
    { kind: 'names', label: 'All 23', sub: 'Names' },
  ],
  kinds: [
    kind('numbers', {
      label: 'Sign numbers', sub: '1.–23.',
      short: num, name: num,
      prompt: 'text', text: id => ({ text: num(id), cls: 'wsign', lang: 'de' }),
      chip: num,
    }),
    kind('postcodes', {
      label: 'Postcodes', sub: '1010–1230',
      short: plz, name: plz,
      prompt: 'name',
      chip: plz,
    }),
    kind('names', {
      label: 'Names', sub: 'Innere Stadt … Liesing',
      short: nm, name: nm,
      prompt: 'name',
      chip: nm, chipTitle: id => `${num(id)} · ${plz(id)}`,
    }),
  ],
};
