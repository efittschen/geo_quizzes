// Hungary Area Codes: config for ../shared/area-quiz.js. Each map area is one geographic area code: the NMHH
// settlement list gives every one of Hungary's 3,155 settlements its code, and the areas are the OpenStreetMap
// settlement boundaries dissolved per code. Codes are 1 (Budapest) and 22–99 (54 in all; 55 is a test code).

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const CODES = DATA.reg.map(r => r.id).sort((a, b) => a.length - b.length || a.localeCompare(b));
const DIGITS = [...new Set(CODES.map(k => k[0]))];
const withDigit = d => CODES.filter(k => k[0] === d);
// The 10 largest cities (KSH gazetteer 2025): Budapest, Debrecen, Szeged, Miskolc, Pécs, Győr, Nyíregyháza,
// Kecskemét, Székesfehérvár, Szombathely.
const BIG = ['1', '52', '62', '46', '72', '96', '42', '76', '22', '94'];
const zoneOf = d => d === '1' ? '1' : d + 'x';
const names = d => withDigit(d).map(k => `${k} ${R[k].name}`);
const settlements = k => `${R[k].n} ${R[k].n === 1 ? 'settlement' : 'settlements'}`;

const QUIZ = {
  key: 'hucodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.digit })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[45.7, 16.1], [48.6, 22.9]], maxBounds: [[43, 12], [51, 27]] },
  hintLabel: 'Color by first digit',
  exploreKind: 'codes',
  explore: id => ({ code: id, title: R[id].name, sub: settlements(id) }),
  rounds: [
    { kind: 'digit1', label: 'First digit' },
    { kind: 'codes', label: '1 and 2x', sub: 'Budapest and around', groups: ['1', '2x'] },
    { kind: 'codes', label: '7x', sub: 'South', groups: ['7x'] },
    { kind: 'codes', label: '3x and 4x', sub: 'North', groups: ['3x', '4x'] },
    { kind: 'codes', label: '5x and 6x', groups: ['5x', '6x'] },
    { kind: 'codes', label: '8x and 9x', sub: 'West', groups: ['8x', '9x'] },
    { kind: 'codes', label: 'Big cities', preset: 'Big cities' },
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: DIGITS.map(d => ({ title: zoneOf(d), sub: '', ids: withDigit(d) })),
      presets: [{ label: 'Big cities', ids: BIG }],
      areasOf: k => [k],
      short: k => k, name: k => k,
      about: k => [R[k].name, settlements(k)],
      clicked: a => `${a} ${R[a].name}`,
      prompt: 'dial',
      chip: k => k, chipTitle: k => R[k].name,
    },
    {
      key: 'digit1', label: 'First digit', sub: `${DIGITS.length} zones`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: '', ids: DIGITS }],
      areasOf: withDigit,
      short: zoneOf, name: zoneOf, about: d => withDigit(d).map(k => R[k].name).join(', '),
      clicked: a => zoneOf(a[0]),
      prompt: 'dial', dial: d => d === '1' ? [['1', 'hot']] : [[d, 'hot'], ['x', 'cold']],
      hints: false, // the colors are these zones
      chip: zoneOf, chipTitle: d => names(d).join(', '),
    },
  ],
};
