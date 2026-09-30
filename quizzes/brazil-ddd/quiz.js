// Brazil Area Codes: config for ../shared/area-quiz.js. Each map area is one area code (DDD).

const INFO = Object.fromEntries(DATA.ddd.map(r => [r.c, r]));
const CODES = DATA.ddd.map(r => r.c);
const DIGITS = [...new Set(CODES.map(c => c[0]))];
const UFS = [...new Set(CODES.map(c => INFO[c].uf))];
const REGIONS = [
  ['North', ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO']],
  ['Northeast', ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE']],
  ['Central-West', ['DF', 'GO', 'MT', 'MS']],
  ['Southeast', ['ES', 'MG', 'RJ', 'SP']],
  ['South', ['PR', 'RS', 'SC']],
];
const place = c => INFO[c].ct.join(', ') + ' (' + INFO[c].uf + ')';
const codesWithDigit = d => CODES.filter(c => c[0] === d);
const codesInState = u => CODES.filter(c => INFO[c].uf === u);
const stateNames = codes => [...new Set(codes.map(c => INFO[c].uf))].map(u => UFN[u]).join(', ');

const QUIZ = {
  key: 'dddquiz',
  areas: DATA.ddd.map(r => ({ id: r.c, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.c[0] })),
  borders: DATA.uf,
  size: [DATA.w, DATA.h], pad: 18, maxZoom: 14, labelScale: 0.42, fly: { pad: 3, min: 0.2 },
  geo: GEO,
  street: { bounds: [[-33.8, -74], [5.3, -34.8]], maxBounds: [[-42, -85], [14, -25]] },
  hintLabel: 'Color by first digit',
  exploreKind: 'codes',
  explore: c => ({ code: c, title: UFN[INFO[c].uf], sub: INFO[c].ct.join(', ') }),
  rounds: [
    { kind: 'digits', label: 'First digit' },
    { kind: 'codes', label: 'Southeast', sub: 'São Paulo, Rio, Espírito Santo, Minas (1x–3x)', groups: ['1x', '2x', '3x'] },
    { kind: 'codes', label: '20 largest areas', top: 20 },
    { kind: 'codes', label: 'South & Southeast', sub: '1x–5x', groups: ['1x', '2x', '3x', '4x', '5x'] },
    { kind: 'codes', label: 'All area codes' },
    { kind: 'states', label: 'North', groups: ['North'] },
    { kind: 'states', label: 'Northeast', groups: ['Northeast'] },
    { kind: 'states', label: 'Centre-West, Southeast & South', groups: ['Central-West', 'Southeast', 'South'] },
    { kind: 'states', label: 'All states' },
  ],
  kinds: [
    {
      key: 'codes', labelPerArea: true, clickAll: true, label: 'Area codes', sub: 'Every code', noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: DIGITS.map(d => ({ title: d + 'x', sub: [...new Set(codesWithDigit(d).map(c => INFO[c].uf))].join(' · '), ids: codesWithDigit(d) })),
      areasOf: c => [c],
      short: c => c, name: c => `(${c})`, about: place, clicked: c => `(${c}), ${INFO[c].ct[0]}`,
      prompt: 'dial',
      detail: { label: 'Show state', text: c => UFN[INFO[c].uf] },
      chip: c => c, chipTitle: place,
    },
    {
      key: 'digits', label: 'First digit', sub: 'Beginner', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: 'area codes by first digit', ids: DIGITS }],
      areasOf: codesWithDigit,
      short: d => d + 'x', name: d => d + 'x', about: d => stateNames(codesWithDigit(d)),
      clicked: c => `${c[0]}x (${stateNames(codesWithDigit(c[0]))})`,
      prompt: 'dial',
      hints: false, // coloring by first digit would give the answer away
      chip: d => d + 'x', chipTitle: d => stateNames(codesWithDigit(d)),
    },
    {
      key: 'states', label: 'States', sub: 'All 27 by name', noun: ['state', 'states'], pickTitle: 'States to practice',
      groups: REGIONS.map(([title, ufs]) => ({ title, sub: '', ids: ufs.filter(u => UFS.includes(u)).sort((a, b) => UFN[a].localeCompare(UFN[b])) })),
      areasOf: codesInState,
      short: u => u, name: u => UFN[u], about: u => 'Area codes ' + codesInState(u).join(', '),
      clicked: c => UFN[INFO[c].uf],
      prompt: 'name',
      chip: u => UFN[u], chipTitle: u => UFN[u],
    },
  ],
};
