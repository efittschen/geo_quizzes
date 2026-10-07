// Vietnam Road Numbers: config for ../shared/area-quiz.js, on the province map of ../vietnam-regions. Provincial
// roads (đường tỉnh, ĐT) are numbered from a block of three-digit numbers per province before the July 2025 merger
// (Decree 165/2024/NĐ-CP, Appendix II); the first digit runs from 1 in the north-west to 9 in the far south.

const R = VN.R;
const block = id => `ĐT ${R[id].dt[0]}–${R[id].dt[1]}`;
const IDS = DATA.reg.map(r => r.id).sort((a, b) => R[a].dt[0] - R[b].dt[0]); // by number
const DIGITS = [...new Set(IDS.map(id => String(R[id].dt[0])[0]))];
const digitOf = id => String(R[id].dt[0])[0];
const inDigit = d => IDS.filter(id => digitOf(id) === d);
const digitName = d => `ĐT ${d}xx`;
const digitPlaces = d => inDigit(d).map(id => R[id].n).join(', ');
const digits = (...ds) => ds.flatMap(inDigit);

const QUIZ = {
  key: 'vnroads',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: String(r.dt[0])[0] })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[8.4, 102.1], [23.4, 109.5]], maxBounds: [[3, 95], [28, 117]] },
  hintLabel: 'Color by first digit',
  exploreKind: 'blocks',
  explore: id => ({ code: block(id), title: R[id].n, sub: VN.facts(id) }),
  rounds: [
    { kind: 'digit', label: 'North', sub: 'ĐT 1xx–4xx', ids: ['1', '2', '3', '4'] },
    { kind: 'digit', label: 'Centre and South', sub: 'ĐT 5xx–9xx', ids: ['5', '6', '7', '8', '9'] },
    { kind: 'digit', label: 'First digit', sub: 'ĐT 1xx–9xx' },
    { kind: 'blocks', label: 'ĐT 1xx–2xx', ids: digits('1', '2') },
    { kind: 'blocks', label: 'ĐT 3xx–4xx', ids: digits('3', '4') },
    { kind: 'blocks', label: 'ĐT 5xx–6xx', ids: digits('5', '6') },
    { kind: 'blocks', label: 'ĐT 7xx–9xx', ids: digits('7', '8', '9') },
    { kind: 'blocks', label: 'All 63 blocks' },
  ],
  kinds: [
    {
      key: 'blocks', label: 'Number blocks', sub: 'All 63 provinces', noun: ['block', 'blocks'], pickTitle: 'Blocks to practice',
      groups: DIGITS.map(d => ({ title: digitName(d), sub: '', ids: inDigit(d) })),
      areasOf: id => [id],
      short: block, name: block,
      about: id => [R[id].n, VN.REG[R[id].reg].en],
      clicked: id => `${block(id)}, ${R[id].n}`,
      prompt: 'name',
      detail: { label: 'Show region', text: id => VN.REG[R[id].reg].en },
      chip: block, chipTitle: id => R[id].n,
    },
    {
      key: 'digit', label: 'First digit', sub: `${DIGITS.length} zones`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'First digit', sub: '', ids: DIGITS }],
      areasOf: inDigit,
      short: digitName, name: digitName,
      about: digitPlaces,
      clicked: id => `${digitName(digitOf(id))}: ${digitPlaces(digitOf(id))}`,
      prompt: 'name',
      hints: false, // the colors are these zones
      chip: digitName, chipTitle: digitPlaces,
    },
  ],
};
