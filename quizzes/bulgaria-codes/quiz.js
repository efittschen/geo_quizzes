// Bulgaria Area Codes: config for ../shared/area-quiz.js. Each map area is one of the 96 geographic codes in force
// since 1 April 2014 (CRC decision 858/2013, amended 168/2014): 02 Sofia, 2-digit codes (032 Plovdiv) and 3-digit
// codes (0431 Kazanlak). The CRC lists each code's settlements; the areas are rebuilt from them (names.js): every
// municipality is split between the codes of its settlements, so borders inside a municipality are approximate.
// Older signs show 4-5 digit codes (0301 …), which start with today's code.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const CODES = DATA.reg.map(r => r.id).sort();
const DIGITS = [...new Set(CODES.map(k => k[0]))];
const PREFIX2 = [...new Set(CODES.map(k => k.slice(0, 2)))];
const withPrefix = p => CODES.filter(k => k.startsWith(p));
const towns = k => NAMES[k].t.join(', ');
const provs = k => NAMES[k].p.join(' · ');
const zero = k => '0' + k;
// Provinces a group of codes lies in, most codes first.
const provsOf = p => {
  const n = {};
  for (const k of withPrefix(p)) for (const v of NAMES[k].p) n[v] = (n[v] || 0) + (v === NAMES[k].p[0] ? 1 : 0.5);
  return Object.keys(n).sort((a, b) => n[b] - n[a]).join(', ');
};
const ZONE = p => p === '2' ? '02' : `0${p}x`;
const dialFor = p => p === '2' ? [['02', 'hot']] : [['0', 'cold'], [p, 'hot'], ['x', 'cold']];
const examples = p => withPrefix(p).slice(0, 4).map(k => `${zero(k)} ${NAMES[k].t[0]}`).join(', ');
// Largest cities (GeoNames population) and the 27 province capitals (Sofia is the capital of both Sofia provinces).
const BIG = ['2', '32', '52', '56', '42', '82', '64', '44'];
const CAPITALS = ['2', '32', '52', '56', '42', '82', '64', '44', '76', '54', '58', '73', '38', '46', '62', '34', '92', '66', '96', '78', '36', '94', '60', '30', '86', '84', '68'];

const QUIZ = {
  key: 'bgcodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.g2 })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[41.2, 22.3], [44.25, 28.65]], maxBounds: [[38, 17], [47, 34]] },
  hintLabel: 'Color by first two digits',
  exploreKind: 'codes',
  explore: id => ({ code: zero(id), title: towns(id), sub: provs(id) }),
  rounds: [
    { kind: 'digit1', label: 'First digit' },
    { kind: 'codes', label: 'Big cities', preset: 'Big cities' },
    { kind: 'codes', label: 'Province capitals', preset: 'Province capitals' },
    { kind: 'codes', label: 'Sofia & the west', sub: '02, 07x', groups: ['02', '07x'] },
    { kind: 'codes', label: 'South', sub: '03x', groups: ['03x'] },
    { kind: 'codes', label: 'South-east', sub: '04x', groups: ['04x'] },
    { kind: 'codes', label: 'East', sub: '05x', groups: ['05x'] },
    { kind: 'codes', label: 'Centre', sub: '06x', groups: ['06x'] },
    { kind: 'codes', label: 'North', sub: '08x, 09x', groups: ['08x', '09x'] },
    { kind: 'digit2', label: 'First two digits' },
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: DIGITS.map(d => ({ title: ZONE(d), sub: provsOf(d), ids: withPrefix(d) })),
      presets: [{ label: 'Big cities', ids: BIG }, { label: 'Province capitals', ids: CAPITALS }],
      areasOf: k => [k],
      short: zero, name: zero,
      about: k => [towns(k), provs(k)],
      clicked: id => `${zero(id)} ${NAMES[id].t[0]}`,
      prompt: 'dial',
      detail: { label: 'Show province', text: provs },
      chip: zero, chipTitle: towns,
    },
    {
      key: 'digit2', label: 'First two digits', sub: `${PREFIX2.length} zones`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: DIGITS.map(d => ({ title: ZONE(d), sub: provsOf(d), ids: PREFIX2.filter(p => p[0] === d) })),
      areasOf: withPrefix,
      short: ZONE, name: ZONE, about: p => [examples(p), provsOf(p)],
      clicked: id => `${ZONE(id.slice(0, 2))} ${NAMES[id].t[0]}`,
      prompt: 'dial', dial: dialFor,
      hints: false, // the colors are these zones
      chip: ZONE, chipTitle: provsOf,
    },
    {
      key: 'digit1', label: 'First digit', sub: 'Beginner', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: '', ids: DIGITS }],
      areasOf: withPrefix,
      short: ZONE, name: ZONE, about: d => [provsOf(d), examples(d)],
      clicked: id => `${ZONE(id[0])} ${provsOf(id[0])}`,
      prompt: 'dial', dial: dialFor,
      hints: false, // the colors give the first digit away
      chip: ZONE, chipTitle: provsOf,
    },
  ],
};
