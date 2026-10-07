// Thailand Roads: config for ../shared/area-quiz.js on the province map of ../thailand-regions (data.js, geo.js).
//
// Rural roads (Department of Rural Roads) are numbered with the province's two-letter Thai abbreviation, e.g. ชม.3029
// in Chiang Mai. Abbreviations: Thai Wikipedia's province tables; every one checked against road refs in OpenStreetMap
// (taginfo: all 77 prefixes are in use, Bangkok's as กท.; 225 of 230 mapped rural roads with a prefix lie in that
// province, the rest at province edges).
//
// National highways: the first digit of a 3- or 4-digit number gives the region (1 North, 2 Northeast, 3 Central, East,
// West and upper South, 4 South; Wikipedia, "Thai highway network"). Regions overlap, so each province's digits come
// from its own 4-digit routes (they stay inside one province): every OSM trunk/primary/secondary way with a 4-digit
// ref, counted per province; a digit counts when it has at least 2 routes and 20% of the province's routes. Lop Buri
// and Saraburi (2, 3), Nakhon Sawan (1, 3) and Chumphon (3, 4) get two digits.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const R6 = [['N', 'North'], ['NE', 'Northeast'], ['C', 'Central'], ['E', 'East'], ['W', 'West'], ['S', 'South']];
const N6 = Object.fromEntries(R6);
const byName = (a, b) => R[a].en.localeCompare(R[b].en);
const in6 = k => DATA.reg.filter(r => r.r6 === k).map(r => r.id).sort(byName);
const DIGITS = ['1', '2', '3', '4'];
const HWY = { 1: 'North', 2: 'Northeast', 3: 'Central, East, West, upper South', 4: 'South' };
const withDigit = d => DATA.reg.filter(r => r.hw.includes(d)).map(r => r.id);
const pre = id => R[id].ab + '.';

const QUIZ = {
  key: 'throads',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.r6 })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.22, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[5.6, 97.3], [20.5, 105.7]], maxBounds: [[0, 88], [27, 115]] },
  hintLabel: 'Color by region',
  exploreKind: 'rural',
  explore: id => ({ code: pre(id), title: R[id].en, sub: [R[id].th, `Highways ${R[id].hw.map(d => d + 'xxx').join(', ')}`] }),
  rounds: [
    { kind: 'hwy', label: 'Highway first digit' },
    { kind: 'rural', label: 'West', groups: ['West'] },
    { kind: 'rural', label: 'East', groups: ['East'] },
    { kind: 'rural', label: 'North', groups: ['North'] },
    { kind: 'rural', label: 'South', groups: ['South'] },
    { kind: 'rural', label: 'Northeast', groups: ['Northeast'] },
    { kind: 'rural', label: 'Central', groups: ['Central'] },
    { kind: 'rural', label: 'All provinces' },
  ],
  kinds: [
    {
      key: 'rural', label: 'Rural roads', sub: `${DATA.reg.length} province prefixes`, noun: ['prefix', 'prefixes'], pickTitle: 'Prefixes to practice',
      groups: R6.map(([k, name]) => ({ title: name, sub: '', ids: in6(k) })),
      areasOf: id => [id],
      short: pre, name: id => `${pre(id)} ${R[id].en}`,
      about: id => [R[id].th, `${N6[R[id].r6]} region`],
      clicked: id => `${pre(id)} ${R[id].en}`,
      prompt: 'text', text: id => ({ text: pre(id), lang: 'th' }),
      chip: pre, chipTitle: id => R[id].en,
    },
    {
      key: 'hwy', label: 'Highways', sub: 'First digit', noun: ['digit', 'digits'], pickTitle: 'Digits to practice',
      groups: [{ title: 'First digit', sub: '3- and 4-digit routes', ids: DIGITS }],
      areasOf: withDigit,
      short: d => d + 'xxx', name: d => d + 'xxx',
      about: d => [HWY[d], `${withDigit(d).length} provinces`],
      clicked: id => `${R[id].hw.map(d => d + 'xxx').join(' / ')} (${R[id].en})`,
      prompt: 'name',
      hints: false, // the region colors nearly give the digit away
      chip: d => d + 'xxx', chipTitle: d => HWY[d],
    },
  ],
};
