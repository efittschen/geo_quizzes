// Argentina Area Codes: config for ../shared/area-quiz.js. Each map area is one area code (característica,
// 2 to 4 digits: 011, 0351, 03541). Codes are colored by their first two digits, which follow the region.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const BY = {}; // area code -> area ids
for (const r of DATA.reg) for (const k of r.k) (BY[k] ??= []).push(r.id);
const CODES = Object.keys(BY).sort();
const PREFIX2 = [...new Set(CODES.map(k => k.slice(0, 2)))];
const DIGITS = [...new Set(CODES.map(k => k[0]))];
const withPrefix = p => CODES.filter(k => k.startsWith(p));
const areasWith = p => [...new Set(withPrefix(p).flatMap(k => BY[k]))];
const BIG = ['11', '221', '223', '291', '341', '342', '343', '351', '358', '261', '264', '266', '299', '297', '280', '2966', '2901', '2920', '2954', '362', '370', '376', '379', '381', '383', '380', '385', '387', '388'];
// What each first digit and each pair of first digits covers (from the original quiz's legend).
const ZONES = { 1: 'Buenos Aires city and most of the conurbano (011)', 2: 'Buenos Aires province, La Pampa, Cuyo and Patagonia', 3: 'Córdoba, Santa Fe, Entre Ríos and the whole north (plus Zárate and Campana)' };
const ZONES2 = {
  11: 'Buenos Aires city & conurbano', 22: 'Southeast Buenos Aires province', 23: 'West Buenos Aires & La Pampa', 24: 'Central Buenos Aires, south Santa Fe',
  26: 'Cuyo: Mendoza, San Juan, San Luis', 28: 'Trelew & the Chubut coast', 29: 'Patagonia & Bahía Blanca', 33: 'North Buenos Aires, south Córdoba',
  34: 'Santa Fe & Entre Ríos', 35: 'Córdoba', 36: 'Chaco', 37: 'Corrientes, Formosa, Misiones', 38: 'The northwest',
};
const townOf = (id, k) => R[id].n[R[id].k.indexOf(k)] || R[id].n[0];
const place = k => BY[k].map(id => `${townOf(id, k)}, ${R[id].st}`).join(' and ');

// Zone modes show just the zone's digits, padded with x's to the most common code length there ("035xx").
function dialFor(p) {
  const lens = {}; for (const k of withPrefix(p)) lens[k.length] = (lens[k.length] || 0) + 1;
  const len = +Object.entries(lens).sort((a, b) => b[1] - a[1])[0][0];
  return [['0', 'cold'], [p, 'hot'], ['x'.repeat(Math.max(0, len - p.length)), 'cold']];
}
// A few of a zone's shortest codes (the bigger cities), as examples in the feedback.
const examples = p => withPrefix(p).sort((a, b) => a.length - b.length || a.localeCompare(b)).slice(0, 3).map(k => `0${k} ${townOf(BY[k][0], k)}`).join(', ');

const QUIZ = {
  key: 'arcodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.k[0].slice(0, 2) })),
  borders: DATA.ent,
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 90, labelScale: 0.38, fly: { pad: 1.6, min: 1.5 / 90 },
  geo: GEO,
  street: { bounds: [[-55.1, -73.6], [-21.8, -53.6]], maxBounds: [[-60, -90], [-15, -40]] },
  hintLabel: 'Color by first two digits',
  exploreKind: 'codes',
  explore: id => ({ code: '0' + R[id].k[0], title: R[id].ct.join(', '), sub: [R[id].st, ZONES2[R[id].k[0].slice(0, 2)]] }),
  rounds: [
    { kind: 'digit1', label: 'First digit' },
    { kind: 'digit2', label: 'First two digits' },
    { kind: 'codes', label: 'Capitals & big cities', preset: 'Capitals & big cities' },
    { kind: 'codes', label: 'City codes', sub: '2–3 digits', preset: 'City codes' },
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', labelPerArea: true, clickAll: true, label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: PREFIX2.map(p => ({ title: `0${p}`, sub: ZONES2[p], ids: withPrefix(p) })),
      presets: [
        { label: 'Capitals & big cities', ids: BIG },
        { label: 'City codes', ids: CODES.filter(k => k.length <= 3) },
      ],
      areasOf: k => BY[k],
      short: k => '0' + k, name: k => '0' + k,
      about: k => [place(k), `0${k[0]}: ${ZONES[k[0]]}` + (k.length > 2 ? ` · 0${k.slice(0, 2)}: ${ZONES2[k.slice(0, 2)]}` : '')],
      clicked: id => `0${R[id].k[0]}, ${R[id].n[0]}`,
      pin: k => { const id = BY[k][0]; return { x: R[id].tx, y: R[id].ty, ll: TOWN_LL[id], label: `0${k} ${townOf(id, k)}` }; },
      prompt: 'dial',
      detail: { label: 'Show province', text: k => R[BY[k][0]].st },
      chip: k => '0' + k, chipTitle: k => place(k),
    },
    {
      key: 'digit2', label: 'First two digits', sub: `${PREFIX2.length} zones`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: 'area codes by first two digits', ids: PREFIX2 }],
      areasOf: areasWith,
      short: p => `0${p}`, name: p => `0${p}x`, about: p => [ZONES2[p], examples(p)],
      clicked: id => `0${R[id].k[0].slice(0, 2)}x (${ZONES2[R[id].k[0].slice(0, 2)]})`,
      prompt: 'dial', dial: dialFor,
      hints: false, // the colors are these zones
      chip: p => `0${p}`, chipTitle: p => ZONES2[p],
    },
    {
      key: 'digit1', label: 'First digit', sub: 'Beginner', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: 'area codes by first digit', ids: DIGITS }],
      areasOf: areasWith,
      short: d => `0${d}`, name: d => `0${d}x`, about: d => [ZONES[d], examples(d)],
      clicked: id => `0${R[id].k[0][0]}x (${ZONES[R[id].k[0][0]]})`,
      prompt: 'dial', dial: dialFor,
      hints: false, // the colors give the first digit away
      chip: d => `0${d}`, chipTitle: d => ZONES[d],
    },
  ],
};
