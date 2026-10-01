// Portugal Area Codes: config for ../shared/area-quiz.js. 52 geographic codes (ANACOM numbering plan): 21 Lisbon,
// 22 Porto and 50 three-digit codes. Braga has two (253 and the overlay 257) on one area. The first digit is always 2,
// so the coarse level is the first two digits (21…29). ANACOM names each code's area after a town but publishes no
// borders: the areas here are rebuilt from CAOP2025 parishes, each given the code most OSM landline numbers in it
// use (approximate). Azores and Madeira are drawn as insets.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const BY = {}; // area code -> area ids
for (const r of DATA.reg) for (const k of r.k) (BY[k] ??= []).push(r.id);
const CODES = Object.keys(BY).sort();
const ZONES = [...new Set(CODES.map(k => k.slice(0, 2)))];
const EN = { Lisboa: 'Lisbon', Açores: 'Azores' };
const en = s => EN[s] || s;
const ZONE_SUB = {
  21: 'Lisbon', 22: 'Porto', 23: 'Aveiro · Coimbra · Viseu', 24: 'Leiria · Santarém · Portalegre',
  25: 'Braga · Viana do Castelo · Vila Real', 26: 'Oeste · Setúbal · Évora', 27: 'Guarda · Castelo Branco · Bragança',
  28: 'Algarve · Beja', 29: 'Azores · Madeira',
};
const zoneTitle = p => p.length === 2 && BY[p] ? p : `${p}x`;
const withPrefix = p => CODES.filter(k => k.startsWith(p));
const areasWith = p => [...new Set(withPrefix(p).flatMap(k => BY[k]))];
// Codes of the 20 largest cities (GeoNames population, as in ../portugal-cities), largest first.
const BIG = ['21', '22', '253', '239', '244', '265', '291', '232', '234', '289', '255', '266'];
const town = k => en(R[BY[k][0]].name);
const district = k => en(R[BY[k][0]].dist);
const place = k => `${town(k)}, ${district(k)}`;

// Numbers have 9 digits, no trunk prefix: 21x xxx xxx, 22x xxx xxx, 2xx xxx xxx. The dial shows the code in bold
// and the subscriber digit that follows a two-digit code faintly.
const dialCode = k => k.length === 2 ? [[k, 'hot'], ['·', 'cold']] : [[k, 'hot']];
const dialZone = p => BY[p] ? [[p, 'hot'], ['·', 'cold']] : [[p, 'hot'], ['x', 'cold']];

const QUIZ = {
  key: 'ptcodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.z })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[36.9, -9.6], [42.2, -6.1]], maxBounds: [[28, -35], [46, 0]] },
  hintLabel: 'Color by first two digits',
  exploreKind: 'codes',
  explore: id => ({ code: R[id].k.join(', '), title: en(R[id].name), sub: en(R[id].dist) }),
  rounds: [
    { kind: 'digit2', label: 'First two digits' },
    { kind: 'codes', label: 'Islands', sub: '29x', groups: ['29x'] },
    { kind: 'codes', label: 'Interior', sub: '27x', groups: ['27x'] },
    { kind: 'codes', label: 'Big cities', preset: 'Big cities' },
    { kind: 'codes', label: 'North', sub: '22 · 25x', groups: ['22', '25x'] },
    { kind: 'codes', label: 'Centre', sub: '23x · 24x', groups: ['23x', '24x'] },
    { kind: 'codes', label: 'South', sub: '21 · 26x · 28x', groups: ['21', '26x', '28x'] },
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', labelPerArea: true, clickAll: true, label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: ZONES.map(p => ({ title: zoneTitle(p), sub: ZONE_SUB[p], ids: withPrefix(p) })),
      presets: [{ label: 'Big cities', ids: BIG }],
      areasOf: k => BY[k],
      short: k => k, name: k => k,
      about: k => [place(k), `${zoneTitle(k.slice(0, 2))}: ${ZONE_SUB[k.slice(0, 2)]}`],
      clicked: id => `${R[id].k.join(' / ')}, ${en(R[id].name)}`,
      prompt: 'dial', dial: dialCode,
      detail: { label: 'Show district', text: district },
      chip: k => k, chipTitle: place,
    },
    {
      key: 'digit2', label: 'First two digits', sub: `${ZONES.length} zones`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: '21…29', ids: ZONES }],
      areasOf: areasWith,
      short: zoneTitle, name: zoneTitle,
      about: p => [ZONE_SUB[p], withPrefix(p).slice(0, 4).map(k => `${k} ${town(k)}`).join(' · ')],
      clicked: id => `${zoneTitle(R[id].z)} (${ZONE_SUB[R[id].z]})`,
      prompt: 'dial', dial: dialZone,
      hints: false, // the colors are these zones
      chip: zoneTitle, chipTitle: p => ZONE_SUB[p],
    },
  ],
};
