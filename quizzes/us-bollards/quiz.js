// US Bollards: config for ../shared/area-quiz.js. See a bollard, click a state it is found in.
// The pictures are the US ones of ../shared/pictures/bollards/photos.js that name their states (geohints lists them per
// state DOT); a bollard found in several states is answered by any of them. The map is the area-code map of
// ../us-codes/data.js, each state drawn as one area (its area codes together, under the state outlines).

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
const SEVERAL = 'Several regions';
const NAME = Object.fromEntries(Object.entries(USPS).map(([name, code]) => [code, name]));
const REGION = Object.fromEntries(CENSUS.flatMap(([region, states]) => states.map(st => [st, region])));

// One area per state: its counties of the US Regions map joined (../shared/maps/us-states/states.js).
const STATE_AREAS = Object.keys(USPS).map(st => { const r = US_STATES.reg.find(r => r.id === USPS[st]); return { id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, s: r.s, g: '' }; });

const DIR = new URL('img/', document.querySelector('script[src$="photos.js"]').src).href;
const P = Object.fromEntries(PHOTOS.items.filter(it => it.c === 'USA' && it.t).map(it => [String(it.n), { ...it, states: it.t.split(/,\s*/) }]));
const ALL = Object.keys(P);
for (const id of ALL) for (const st of P[id].states) if (!USPS[st]) throw new Error(`unknown state: ${st}`);
// A bollard's region: the Census region of its states, or "Several regions".
const regionOf = id => { const rs = new Set(P[id].states.map(st => REGION[st])); return rs.size === 1 ? [...rs][0] : SEVERAL; };
const GROUPS = [...CENSUS.map(([region]) => region), SEVERAL].map(title => ({ title, sub: '', ids: ALL.filter(id => regionOf(id) === title) })).filter(g => g.ids.length);
const inState = code => ALL.filter(id => P[id].states.includes(NAME[code]));
const photo = id => ({ src: `${DIR}${P[id].n}.webp`, alt: 'bollard', label: P[id].t, link: P[id].m ? 'https://' + P[id].m : '' });

const QUIZ = {
  key: 'usbollards',
  areas: STATE_AREAS,
  borders: [US_STATES.reg.map(r => r.d).join('')], // every state's outline, also where a round leaves it out
  
  proj: US_STATES.proj, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
  
  size: [US_STATES.w, US_STATES.h], pad: 16, maxZoom: 60, labelScale: 0.14, fly: { pad: 1.6, min: 0.03 },
  hintLabel: '', hintsDefault: false,
  exploreKind: 'photos',
  explore: a => ({ code: a, title: NAME[a], sub: '', photos: inState(a).map(photo) }),
  rounds: [...GROUPS.map(g => ({ kind: 'photos', label: g.title, groups: [g.title] })), { kind: 'photos', label: 'All bollards' }],
  kinds: [{
    key: 'photos', label: 'Bollards', sub: `${ALL.length} pictures`, noun: ['bollard', 'bollards'], pickTitle: 'Bollards to practice',
    groups: GROUPS,
    areasOf: id => P[id].states.map(st => USPS[st]),
    areaLabel: a => a, flashArea: true,
    areaRank: false, hints: false,
    short: id => P[id].states.map(st => USPS[st]).join(' '), name: id => P[id].t, about: () => '',
    clicked: a => NAME[a],
    prompt: 'photo', photo,
    chip: id => String(GROUPS.find(g => g.ids.includes(id)).ids.indexOf(id) + 1), chipTitle: id => P[id].t,
  }],
};
