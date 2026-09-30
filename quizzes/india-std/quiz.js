// India STD Codes: config for ../shared/area-quiz.js. Each map area is a two-digit STD prefix region.
// A question shows just the digits that matter, padded to the usual code length (e.g. 014xx), and you click
// the region they point to.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const PREFIXES = DATA.reg.map(r => r.k[0]).sort();
const DIGITS = [...new Set(PREFIXES.map(p => p[0]))];
const regionOf = p => 'p' + p;
const codesWith = p => DATA.q.filter(q => q.c.startsWith(p));
const CODES_BY_PREFIX = Object.fromEntries([...PREFIXES, ...DIGITS].map(p => [p, codesWith(p)]));
const shuffled = a => a.map(x => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
const hubs = p => R[regionOf(p)].hubs.slice(0, 3).map(h => `0${h[0]} ${h[1]}`).join(', ');
const describe = p => [R[regionOf(p)].st.join(', '), ...(R[regionOf(p)].hubs.length ? [`Hubs: ${hubs(p)}`] : [])];

// "014xx": the prefix in bold, padded with x's to the most common code length in that zone.
function dialFor(p) {
  const lens = {}; for (const q of CODES_BY_PREFIX[p]) lens[q.c.length] = (lens[q.c.length] || 0) + 1;
  const len = +Object.entries(lens).sort((a, b) => b[1] - a[1])[0][0];
  return [['0', 'cold'], [p, 'hot'], ['x'.repeat(Math.max(0, len - p.length)), 'cold']];
}
const zoneHubs = d => PREFIXES.filter(p => p[0] === d).flatMap(p => R[regionOf(p)].hubs.slice(0, 1)).slice(0, 4).map(h => `0${h[0]} ${h[1]}`).join(', ');

const QUIZ = {
  key: 'inpre',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.k[0][0] })),
  borders: DATA.ent,
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 50, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 50 },
  geo: GEO,
  street: { bounds: [[8, 68], [35.5, 97.5]], maxBounds: [[0, 55], [42, 110]] },
  hintLabel: 'Color by first digit',
  exploreKind: 'prefix2',
  explore: id => {
    const r = R[id];
    return { code: '0' + r.k[0], title: `Prefix ${r.k[0]}: ${r.st.join(', ')}`, sub: [`${r.cnt} codes`, ...(r.hubs.length ? [`Hubs: ${r.hubs.map(h => `0${h[0]} ${h[1]}`).join(', ')}`] : [])] };
  },
  rounds: [
    { kind: 'prefix1', label: 'First digit' },
    { kind: 'prefix2', label: 'Prefixes 1x–2x', groups: ['1x', '2x'] },
    { kind: 'prefix2', label: 'Prefixes 1x–5x', groups: ['1x', '2x', '3x', '4x', '5x'] },
    { kind: 'prefix2', label: 'All prefixes' },
  ],
  kinds: [
    {
      key: 'prefix2', label: 'Two-digit prefix', sub: `${PREFIXES.length} prefixes`, noun: ['prefix', 'prefixes'], pickTitle: 'Prefixes to practice',
      groups: DIGITS.map(d => ({ title: d + 'x', sub: '', ids: PREFIXES.filter(p => p[0] === d) })),
      presets: [
        { label: '10 random', ids: () => shuffled(PREFIXES).slice(0, 10) },
        { label: '25 random', ids: () => shuffled(PREFIXES).slice(0, 25) },
      ],
      areasOf: p => [regionOf(p)],
      short: p => p, name: p => `prefix ${p}`, about: describe,
      clicked: area => `prefix ${R[area].k[0]} (${R[area].st.join(', ')})`,
      prompt: 'dial', dial: dialFor,
      detail: { label: 'Show states', text: p => R[regionOf(p)].st.join(', ') },
      chip: p => p, chipTitle: p => R[regionOf(p)].st.join(', '),
    },
    {
      key: 'prefix1', label: 'First digit', sub: 'Beginner', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: 'STD codes by first digit', ids: DIGITS }],
      areasOf: d => PREFIXES.filter(p => p[0] === d).map(regionOf),
      short: d => d + 'x', name: d => `zone ${d}`, about: d => [ZONES[d], zoneHubs(d)],
      clicked: area => `zone ${R[area].k[0][0]} (${ZONES[R[area].k[0][0]].split(':')[0]})`,
      prompt: 'dial', dial: dialFor,
      hints: false, // coloring by first digit would give the answer away
      chip: d => d + 'x', chipTitle: d => ZONES[d],
    },
  ],
};
