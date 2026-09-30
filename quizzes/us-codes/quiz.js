// US Area Codes: config for ../shared/area-quiz.js. Each map area has a main code (its id) and often
// overlay codes dialed in the same place (Houston: 713, 281, 346, 621, 832). A few overlays cover two areas
// (917: Manhattan and Brooklyn), so a code can be answered by clicking any area it rings in.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const BY = {}; // area code -> area ids
for (const r of DATA.reg) for (const k of r.k) (BY[k] ??= []).push(r.id);
const CODES = Object.keys(BY).sort();
const AREA_IDS = DATA.reg.map(r => r.id).sort(); // one per area, named by its main code
const isMain = k => !!R[k];
const USPS = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT',
  'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI',
  'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH',
  'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN',
  'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'Washington, D.C.': 'DC', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY',
};
// US Census Bureau regions.
const CENSUS = [
  ['Northeast', ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'New Jersey', 'New York', 'Pennsylvania', 'Rhode Island', 'Vermont']],
  ['Midwest', ['Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan', 'Minnesota', 'Missouri', 'Nebraska', 'North Dakota', 'Ohio', 'South Dakota', 'Wisconsin']],
  ['South', ['Alabama', 'Arkansas', 'Delaware', 'Florida', 'Georgia', 'Kentucky', 'Louisiana', 'Maryland', 'Mississippi', 'North Carolina', 'Oklahoma', 'South Carolina', 'Tennessee', 'Texas', 'Virginia', 'Washington, D.C.', 'West Virginia']],
  ['West', ['Alaska', 'Arizona', 'California', 'Colorado', 'Hawaii', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Oregon', 'Utah', 'Washington', 'Wyoming']],
];
const STATES = [...new Set(DATA.reg.map(r => r.st))].sort();
const place = id => `${R[id].ct.join(', ')} (${USPS[R[id].st]})`;
const codeState = k => R[BY[k][0]].st;
// Other codes dialed in the same area(s) as k.
const sameArea = k => [...new Set(BY[k].flatMap(i => R[i].k))].filter(x => x !== k);
const areasInState = st => DATA.reg.filter(r => r.st === st).map(r => r.id);
const codesInState = st => CODES.filter(k => codeState(k) === st);
const BIG = ['212', '718', '213', '310', '415', '408', '619', '312', '713', '214', '512', '210', '602', '702', '303', '206', '503', '617', '215', '202', '305', '404', '407', '813', '704', '615', '313', '614', '801', '504'];

const QUIZ = {
  key: 'uscodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.id[0] })),
  borders: DATA.ent,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 50, labelScale: 0.38, fly: { pad: 1.6, min: 1.5 / 50 },
  geo: GEO,
  street: { bounds: [[24.4, -124.8], [49.4, -66.9]], maxBounds: [[10, -200], [75, -50]] },
  hintLabel: 'Color by first digit',
  exploreKind: 'codes',
  explore: id => ({
    code: id, title: R[id].ct.join(', '),
    sub: R[id].st + (R[id].k.length > 1 ? ` · also ${R[id].k.slice(1).join(', ')}` : ''),
  }),
  rounds: [
    { kind: 'codes', label: '8 largest areas', top: 8 },
    { kind: 'codes', label: '25 largest areas', top: 25 },
    { kind: 'codes', label: 'Texas', groups: ['Texas'] },
    { kind: 'codes', label: 'California', groups: ['California'] },
    { kind: 'codes', label: 'Big cities', preset: 'Big cities' },
    { kind: 'codes', label: 'All area codes' },
    { kind: 'states', label: 'Northeast', groups: ['Northeast'] },
    { kind: 'states', label: 'Midwest', groups: ['Midwest'] },
    { kind: 'states', label: 'West', groups: ['West'] },
    { kind: 'states', label: 'South', groups: ['South'] },
    { kind: 'states', label: 'All states' },
  ],
  kinds: [
    {
      key: 'codes', labelPerArea: true, clickAll: true, label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: STATES.map(st => ({ title: st, sub: '', ids: codesInState(st) })),
      // Overlays are as much a part of a place as its original code, so picks always take every code in an area.
      presets: [{ label: 'Big cities', ids: [...new Set(BIG.flatMap(id => R[id].k))] }],
      // "Largest area" (added by the engine) ranks codes by their share of area; "biggest cities" ranks places
      // by population and takes every code dialed there.
      rankings: [
        { label: 'biggest cities', order: AREA_IDS.slice().sort((a, b) => (R[b].w || 0) - (R[a].w || 0)), expand: id => R[id].k },
      ],
      // A click on an area is that area's main code, never an overlay it shares with a neighbour.
      primary: area => area,
      areasOf: k => BY[k],
      short: k => k, name: k => `(${k})`,
      about: k => BY[k].map(place).join('; ') + (sameArea(k).length ? ` · same area: ${sameArea(k).join(', ')}` : ''),
      clicked: area => `(${R[area].k.join(', ')}), ${R[area].ct[0]}`,
      prompt: 'dial',
      detail: { label: 'Show state', text: codeState },
      chip: k => k,
      chipTitle: k => (isMain(k) ? '' : 'Overlay: ') + BY[k].map(place).join('; '),
      chipClass: k => isMain(k) ? '' : 'ov',
    },
    {
      key: 'states', label: 'States', sub: `All ${STATES.length} by name`, noun: ['state', 'states'], pickTitle: 'States to practice',
      groups: CENSUS.map(([title, sts]) => ({ title, sub: '', ids: sts.filter(st => STATES.includes(st)) })),
      areasOf: areasInState,
      short: st => USPS[st], name: st => st,
      about: st => { const ks = codesInState(st); return ks.length > 12 ? `${ks.length} area codes` : `Area codes ${ks.join(', ')}`; },
      clicked: area => R[area].st,
      prompt: 'name',
      chip: st => st, chipTitle: st => USPS[st],
    },
  ],
};
