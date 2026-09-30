// Mexico Area Codes: config for ../shared/area-quiz.js. Each map area is one area-code zone; a few zones
// have two codes (Mexico City: 55 and 56). Codes are 2 digits (33, 55, 56, 81) or 3 digits.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const BY = {}; // area code -> area ids
for (const r of DATA.reg) for (const k of r.k) (BY[k] ??= []).push(r.id);
const CODES = Object.keys(BY).sort();
const STATE_EN = { 'Ciudad de México': 'Mexico City', 'Estado de México': 'State of Mexico' };
const stateName = st => STATE_EN[st] || st;
const STATES = [...new Set(DATA.reg.map(r => r.st))].sort((a, b) => stateName(a).localeCompare(stateName(b)));
const place = id => `${R[id].ct.join(', ')} (${stateName(R[id].st)})`;
const codePlace = k => BY[k].map(place).join('; ');
// Zones by the first one or two digits of the code.
const withPrefix = p => CODES.filter(k => k.startsWith(p));
const prefixAreas = p => [...new Set(withPrefix(p).flatMap(k => BY[k]))];
const DIGIT1 = [...new Set(CODES.map(k => k[0]))];
const DIGIT2 = [...new Set(CODES.map(k => k.slice(0, 2)))];
// A two-digit zone made only of two-digit codes is just that code: show "55", not "55x".
const zoneName = p => withPrefix(p).every(k => k.length === p.length) ? p : p + 'x';
const prefixStates = p => [...new Set(prefixAreas(p).map(i => stateName(R[i].st)))].sort().join(', ');
const areasInState = st => DATA.reg.filter(r => r.st === st).map(r => r.id);
const BIG = DATA.reg.slice().sort((a, b) => b.w - a.w).slice(0, 30).map(r => r.id);

const QUIZ = {
  key: 'mxcodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.id[0] })),
  borders: DATA.ent,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 70, labelScale: 0.38, fly: { pad: 1.6, min: 1.5 / 70 },
  geo: GEO,
  street: { bounds: [[14.5, -118.4], [32.7, -86.7]], maxBounds: [[5, -130], [40, -75]] },
  hintLabel: 'Color by first digit',
  exploreKind: 'codes',
  explore: id => ({ code: R[id].k.join(', '), title: R[id].ct.join(', '), sub: stateName(R[id].st) }),
  rounds: [
    { kind: 'digit1', label: 'First digit' },
    { kind: 'codes', label: '20 largest areas', top: 20 },
    { kind: 'codes', label: 'Big cities', preset: 'Big cities' },
    { kind: 'digit2', label: 'First two digits' },
    { kind: 'codes', label: 'All area codes' },
    { kind: 'states', label: '8 largest states', top: 8 },
    { kind: 'states', label: '20 largest states', top: 20 },
    { kind: 'states', label: 'All states' },
  ],
  kinds: [
    {
      key: 'codes', labelPerArea: true, clickAll: true, label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: DIGIT1.map(d => ({ title: d + 'x', sub: '', ids: withPrefix(d) })),
      presets: [{ label: 'Big cities', ids: [...new Set(BIG.flatMap(id => R[id].k))] }],
      rankings: [{ label: 'most phone numbers', order: CODES.slice().sort((a, b) => R[BY[b][0]].w - R[BY[a][0]].w) }],
      areasOf: k => BY[k],
      short: k => k, name: k => `(${k})`, about: codePlace,
      clicked: id => `(${R[id].k.join(', ')}), ${R[id].ct[0]}`,
      prompt: 'dial',
      detail: { label: 'Show state', text: k => stateName(R[BY[k][0]].st) },
      chip: k => k, chipTitle: codePlace,
    },
    {
      key: 'digit1', label: 'First digit', sub: 'Beginner', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: 'area codes by first digit', ids: DIGIT1 }],
      areasOf: prefixAreas,
      short: zoneName, name: zoneName,
      about: p => `${withPrefix(p).length} codes: ${prefixStates(p)}`,
      clicked: id => `${zoneName(id[0])} (${R[id].ct[0]})`,
      prompt: 'dial',
      hints: false, // coloring by first digit would give the answer away
      chip: zoneName, chipTitle: prefixStates,
    },
    {
      key: 'digit2', label: 'First two digits', sub: `${DIGIT2.length} zones`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: DIGIT1.map(d => ({ title: d + 'x', sub: '', ids: DIGIT2.filter(p => p[0] === d) })),
      areasOf: prefixAreas,
      short: zoneName, name: zoneName, about: prefixStates,
      clicked: id => `${[...new Set(R[id].k.map(k => zoneName(k.slice(0, 2))))].join(' / ')} (${R[id].ct[0]})`,
      prompt: 'dial',
      chip: zoneName, chipTitle: prefixStates,
    },
    {
      key: 'states', label: 'States', sub: `All ${STATES.length} by name`, noun: ['state', 'states'], pickTitle: 'States to practice',
      groups: [{ title: 'States', sub: '', ids: STATES }],
      areasOf: areasInState,
      short: stateName, name: stateName,
      about: st => { const ks = areasInState(st).flatMap(i => R[i].k).sort(); return ks.length > 10 ? `${ks.length} area codes` : `Area codes ${ks.join(', ')}`; },
      clicked: id => stateName(R[id].st),
      prompt: 'name',
      chip: stateName, chipTitle: stateName,
    },
  ],
};
