// Russia Area Codes: config for ../shared/area-quiz.js. Each map area is one federal subject (region);
// a region can have several area codes, and code 818 covers two regions.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const BY = {}; // area code -> region ids
for (const r of DATA.reg) for (const k of r.k) (BY[k] ??= []).push(r.id);
const CODES = Object.keys(BY).sort();
const FDS = ['C', 'NW', 'S', 'NC', 'V', 'U', 'SIB', 'FE'];
const regionsIn = fd => DATA.reg.filter(r => r.fd === fd).map(r => r.id);
const byName = (a, b) => R[a].n.localeCompare(R[b].n);
const codeFd = k => R[BY[k][0]].fd;
const where = k => BY[k].map(i => `${R[i].n}: ${R[i].ct.join(', ')}`).join('; ');
// Zones by the first one or two digits of the code. A region can sit in two zones (Tatarstan: 843 and 855).
const withPrefix = p => CODES.filter(k => k.startsWith(p));
const prefixAreas = p => [...new Set(withPrefix(p).flatMap(k => BY[k]))];
const prefixRegions = p => prefixAreas(p).map(i => R[i].n).join(', ');
const prefixesOf = (id, len) => [...new Set(R[id].k.map(k => k.slice(0, len)))];
const zoneName = p => p.padEnd(3, 'x');
const DIGIT1 = [...new Set(CODES.map(k => k[0]))];
const DIGIT2 = [...new Set(CODES.map(k => k.slice(0, 2)))];

const QUIZ = {
  key: 'rucodes',
  // Hint color group = first digit of the region's codes (no region mixes first digits).
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.k[0][0] })),
  borders: DATA.fd,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 45, labelScale: 0.3, fly: { pad: 1.6, min: 1 / 30 },
  geo: GEO,
  street: { bounds: [[41.2, 19.6], [77.7, 190]], maxBounds: [[25, 0], [86, 215]] },
  hintLabel: 'Color by first digit',
  exploreKind: 'codes',
  explore: id => ({ code: R[id].k.join(', '), title: R[id].n, sub: [R[id].ct.join(', '), `${FDN[R[id].fd]} Federal District`] }),
  rounds: [
    { kind: 'digit1', label: 'First digit', sub: '3xx, 4xx, 8xx' },
    { kind: 'digit2', label: 'First two digits' },
    { kind: 'codes', label: 'Siberia & the Far East', groups: ['Siberian', 'Far Eastern'] },
    { kind: 'codes', label: 'Central & Northwest', groups: ['Central', 'Northwestern'] },
    { kind: 'codes', label: 'All area codes' },
    { kind: 'districts', label: 'Federal districts' },
    { kind: 'regions', label: 'Siberia & the Far East', groups: ['Siberian', 'Far Eastern'] },
    { kind: 'regions', label: 'European Russia', sub: 'Central, Northwestern, Southern, North Caucasian, Volga', groups: ['Central', 'Northwestern', 'Southern', 'North Caucasian', 'Volga'] },
    { kind: 'regions', label: 'All regions' },
  ],
  kinds: [
    {
      key: 'codes', labelPerArea: true, clickAll: true, label: 'Area codes', sub: 'Every code', noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: FDS.map(fd => ({ title: FDN[fd], sub: '', ids: CODES.filter(k => codeFd(k) === fd) })),
      areasOf: k => BY[k],
      short: k => k, name: k => `(${k})`, about: where, clicked: id => `${R[id].n} (${R[id].k.join(', ')})`,
      prompt: 'dial',
      detail: { label: 'Show district', text: k => `${FDN[codeFd(k)]} Federal District` },
      chip: k => k, chipTitle: k => BY[k].map(i => R[i].n).join(' and '),
    },
    {
      key: 'digit1', label: 'First digit', sub: 'Beginner', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: 'area codes by first digit', ids: DIGIT1 }],
      areasOf: prefixAreas,
      short: zoneName, name: zoneName,
      about: p => `${withPrefix(p).length} codes in ${prefixAreas(p).length} regions`,
      clicked: id => `${prefixesOf(id, 1).map(zoneName).join(' / ')} (${R[id].n})`,
      prompt: 'dial',
      hints: false, // coloring by first digit would give the answer away
      chip: zoneName, chipTitle: prefixRegions,
    },
    {
      key: 'digit2', label: 'First two digits', sub: '18 zones', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: DIGIT1.map(d => ({ title: zoneName(d), sub: '', ids: DIGIT2.filter(p => p[0] === d) })),
      areasOf: prefixAreas,
      short: zoneName, name: zoneName, about: prefixRegions,
      clicked: id => `${prefixesOf(id, 2).map(zoneName).join(' / ')} (${R[id].n})`,
      prompt: 'dial',
      chip: zoneName, chipTitle: prefixRegions,
    },
    {
      key: 'districts', label: 'Federal districts', sub: 'Beginner', noun: ['district', 'districts'], pickTitle: 'Districts to practice',
      groups: [{ title: 'Federal districts', sub: '', ids: FDS }],
      areasOf: regionsIn,
      short: fd => FDN[fd], name: fd => FDN[fd], about: fd => `${regionsIn(fd).length} regions`,
      clicked: id => `the ${FDN[R[id].fd]} district (${R[id].n})`,
      prompt: 'name',
      chip: fd => FDN[fd], chipTitle: fd => regionsIn(fd).map(i => R[i].n).sort().join(', '),
    },
    {
      key: 'regions', label: 'Regions', sub: 'All 83 by name', noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: FDS.map(fd => ({ title: FDN[fd], sub: '', ids: regionsIn(fd).sort(byName) })),
      areasOf: id => [id],
      short: id => R[id].n, name: id => R[id].n,
      about: id => [R[id].ct.join(', '), `Area code ${R[id].k.join(', ')}`],
      clicked: id => R[id].n,
      prompt: 'name',
      chip: id => R[id].n, chipTitle: id => R[id].ct.join(', '),
    },
  ],
};
