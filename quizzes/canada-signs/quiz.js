// Canada Sign Languages: config for ../shared/area-quiz.js. Road-sign language by area: French in Québec, English
// and French in New Brunswick and on provincial highways in Ontario's French Language Services Act designated areas,
// Inuktitut syllabics in Nunavut, English elsewhere. The finer level asks each bilingual area. Ontario's designated
// areas follow O. Reg. 272/25 as it stands from 1 January 2029 (current municipal boundaries), built from Statistics
// Canada 2021 census subdivisions.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const PROV = {
  QC: 'Québec', ON: 'Ontario', AB: 'Alberta', SK: 'Saskatchewan', PE: 'Prince Edward Island', NL: 'Newfoundland and Labrador',
  BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick', NS: 'Nova Scotia', YT: 'Yukon', NT: 'Northwest Territories', NU: 'Nunavut',
};
// Ontario's designated areas: [area id, name, municipalities, part of Ontario]
const FLSA = [
  ['on-ottawa', 'Ottawa', 'City of Ottawa', 'East'],
  ['on-prescott', 'Prescott and Russell', 'United Counties of Prescott and Russell', 'East'],
  ['on-sdg', 'Stormont, Dundas and Glengarry', 'Cornwall, North Dundas, North Glengarry, North Stormont, South Glengarry, South Stormont', 'East'],
  ['on-kingston', 'Kingston', 'City of Kingston', 'East'],
  ['on-renfrew', 'Pembroke area', 'Pembroke, Laurentian Valley, Whitewater Region', 'East'],
  ['on-toronto', 'Toronto', 'City of Toronto', 'South'],
  ['on-peel', 'Brampton & Mississauga', 'Brampton, Mississauga', 'South'],
  ['on-markham', 'Markham', 'City of Markham', 'South'],
  ['on-hamilton', 'Hamilton', 'City of Hamilton', 'South'],
  ['on-niagara', 'Port Colborne & Welland', 'Port Colborne, Welland', 'South'],
  ['on-simcoe', 'Penetanguishene area', 'Penetanguishene, Tiny, Essa', 'South'],
  ['on-london', 'London', 'City of London', 'South'],
  ['on-sarnia', 'Sarnia', 'City of Sarnia', 'South'],
  ['on-chatham', 'Chatham-Kent', 'Municipality of Chatham-Kent', 'South'],
  ['on-essex', 'Windsor area', 'Windsor, Amherstburg, Essex, Lakeshore, LaSalle, Tecumseh', 'South'],
  ['on-nipissing', 'Nipissing District', 'All', 'North'],
  ['on-callander', 'Callander', 'Municipality of Callander', 'North'],
  ['on-sudbury', 'Sudbury', 'Sudbury District, Greater Sudbury', 'North'],
  ['on-timiskaming', 'Timiskaming District', 'All', 'North'],
  ['on-cochrane', 'Cochrane District', 'All', 'North'],
  ['on-algoma', 'Algoma District', 'All', 'North'],
  ['on-thunderbay', 'Greenstone & Marathon area', 'Greenstone, Marathon, Manitouwadge, Terrace Bay', 'North'],
  ['on-ignace', 'Ignace', 'Township of Ignace', 'North'],
];
const F = Object.fromEntries(FLSA.map(([id, name, munis, part]) => [id, { name, munis, part }]));
const BILINGUAL = ['NB', ...FLSA.map(f => f[0])];
const SIGNS = {
  fr: { name: 'French', areas: ['QC'], about: 'Québec' },
  enfr: { name: 'English & French', areas: BILINGUAL, about: 'New Brunswick · Ontario designated areas' },
  iu: { name: 'Inuktitut', areas: ['NU'], about: 'Nunavut' },
  en: { name: 'English', areas: ['BC', 'AB', 'SK', 'MB', 'on-rest', 'NS', 'PE', 'NL', 'YT', 'NT'], about: 'Rest of Canada' },
};
const placeName = area => F[area] ? F[area].name : area === 'on-rest' ? 'Ontario' : PROV[area];
const signOf = area => Object.keys(SIGNS).find(k => SIGNS[k].areas.includes(area));
const bilName = id => id === 'NB' ? 'New Brunswick' : F[id].name;
const bilAbout = id => id === 'NB' ? 'Whole province' : F[id].munis;
const PARTS = [['East', 'Eastern Ontario'], ['South', 'Southern Ontario'], ['North', 'Northern Ontario']];
const ofPart = part => FLSA.filter(f => f[3] === part).map(f => f[0]);

const QUIZ = {
  key: 'casigns',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.id })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 80, labelScale: 0.2, fly: { pad: 1.6, min: 1 / 60 },
  geo: GEO,
  street: { bounds: [[41.7, -141], [62, -52.6]], maxBounds: [[35, -175], [85, -40]] },
  hintLabel: 'Color each area',
  exploreKind: 'signs',
  explore: area => ({ code: SIGNS[signOf(area)].name, title: placeName(area), sub: F[area] ? F[area].munis : '' }),
  rounds: [
    { kind: 'signs', label: 'Sign languages' },
    { kind: 'bilingual', label: 'Eastern Ontario', ids: ofPart('East') },
    { kind: 'bilingual', label: 'Northern Ontario', ids: ofPart('North') },
    { kind: 'bilingual', label: 'Southern Ontario', ids: ofPart('South') },
    { kind: 'bilingual', label: 'All bilingual areas' },
  ],
  kinds: [
    {
      key: 'signs', label: 'Sign languages', sub: `${Object.keys(SIGNS).length} languages`, noun: ['language', 'languages'], pickTitle: 'Languages to practice',
      groups: [{ title: 'Road signs', sub: '', ids: Object.keys(SIGNS) }],
      areasOf: k => SIGNS[k].areas,
      areaRank: false,
      short: k => SIGNS[k].name, name: k => SIGNS[k].name,
      about: k => SIGNS[k].about,
      clicked: area => `${placeName(area)}: ${SIGNS[signOf(area)].name}`,
      prompt: 'name',
      chip: k => SIGNS[k].name, chipTitle: k => SIGNS[k].about,
    },
    {
      key: 'bilingual', label: 'Bilingual areas', sub: `${BILINGUAL.length} areas`, noun: ['area', 'areas'], pickTitle: 'Areas to practice',
      groups: [{ title: 'New Brunswick', sub: '', ids: ['NB'] }, ...PARTS.map(([p, t]) => ({ title: t, sub: '', ids: ofPart(p) }))],
      areasOf: id => [id],
      short: bilName, name: bilName,
      about: bilAbout,
      clicked: placeName,
      prompt: 'name',
      chip: bilName, chipTitle: bilAbout,
    },
  ],
};
