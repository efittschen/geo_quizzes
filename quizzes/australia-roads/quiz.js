// Victoria C Roads: config for ../shared/area-quiz.js. Victoria's C routes (minor rural roads, C101–C996) cluster by
// their first digit, an unofficial and non-contiguous pattern (C1 runs along the Princes Highway both ways from
// Melbourne). Each 2001 census district (ABS ASGC 2001) takes the first digit of the nearest C route in OpenStreetMap,
// so the borders are approximate. Questions show a real route number with its first digit in bold.

const DIGITS = Object.keys(ROUTES).sort();
const label = d => `C${d}xx`;
const pick = a => a[Math.random() * a.length | 0];
const range = d => `${ROUTES[d][0]}–${ROUTES[d].at(-1)}`;
const count = d => `${ROUTES[d].length} routes`;
const digitOf = area => area.slice(1);

const QUIZ = {
  key: 'auvicroads',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.id })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[-39.2, 140.9], [-33.9, 150]], maxBounds: [[-42, 136], [-31, 154]] },
  hintLabel: 'Color by first digit',
  exploreKind: 'digit',
  explore: area => ({ code: label(digitOf(area)), title: range(digitOf(area)), sub: [count(digitOf(area))] }),
  rounds: [
    { kind: 'digit', label: 'First digit', sub: 'C1xx–C9xx' },
  ],
  kinds: [
    {
      key: 'digit', label: 'First digit', sub: `${DIGITS.length} zones`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'First digit', sub: '', ids: DIGITS }],
      areasOf: d => ['c' + d],
      short: label, name: label,
      about: d => [range(d), count(d)],
      clicked: area => `${label(digitOf(area))} · ${range(digitOf(area))}`,
      prompt: 'dial', dial: d => { const r = pick(ROUTES[d]); return [['C', 'hot'], [r[1], 'hot'], [r.slice(2), 'cold']]; },
      chip: label, chipTitle: range,
    },
  ],
};
