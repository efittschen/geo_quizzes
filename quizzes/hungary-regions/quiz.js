// Hungary Counties (and Minority Signs, ../hungary-signs): config for ../shared/area-quiz.js.
// Map areas are the 19 counties and Budapest, each split where it holds settlements with nationality-language
// signs, built from OpenStreetMap settlement boundaries. County of each settlement: KSH gazetteer 2025.
// Regions: the 8 NUTS 2 statistical regions (KSH 2022 census codelist), grouped into the 3 NUTS 1 large regions.
// Sign languages: a settlement counts for a nationality when at least 10% of its people belong to it (KSH 2022
// census, "belonging to the nationality", any question) and it has that nationality's self-government (KSH gazetteer
// 2025): the conditions of Act CLXXIX of 2011 § 6 for bilingual place- and street-name signs.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const LARGE = [['HU1', 'Central Hungary'], ['HU2', 'Transdanubia'], ['HU3', 'Great Plain and North']];
const REGIONS = {
  HU11: 'Budapest', HU12: 'Pest', HU21: 'Central Transdanubia', HU22: 'Western Transdanubia', HU23: 'Southern Transdanubia',
  HU31: 'Northern Hungary', HU32: 'Northern Great Plain', HU33: 'Southern Great Plain',
};
const COUNTIES = {
  HU110: ['Budapest', ''], HU120: ['Pest', 'Budapest'],
  HU211: ['Fejér', 'Székesfehérvár'], HU212: ['Komárom-Esztergom', 'Tatabánya'], HU213: ['Veszprém', 'Veszprém'],
  HU221: ['Győr-Moson-Sopron', 'Győr'], HU222: ['Vas', 'Szombathely'], HU223: ['Zala', 'Zalaegerszeg'],
  HU231: ['Baranya', 'Pécs'], HU232: ['Somogy', 'Kaposvár'], HU233: ['Tolna', 'Szekszárd'],
  HU311: ['Borsod-Abaúj-Zemplén', 'Miskolc'], HU312: ['Heves', 'Eger'], HU313: ['Nógrád', 'Salgótarján'],
  HU321: ['Hajdú-Bihar', 'Debrecen'], HU322: ['Jász-Nagykun-Szolnok', 'Szolnok'], HU323: ['Szabolcs-Szatmár-Bereg', 'Nyíregyháza'],
  HU331: ['Bács-Kiskun', 'Kecskemét'], HU332: ['Békés', 'Békéscsaba'], HU333: ['Csongrád-Csanád', 'Szeged'],
};
// Settlements per sign language and the three largest (KSH gazetteer 2025 population).
const LANGS = {
  GE: ['German', 151, 'Pilisvörösvár, Taksony, Pilisszentiván'],
  CR: ['Croatian', 46, 'Dusnok, Kópháza, Hercegszántó'],
  SK: ['Slovak', 33, 'Tótkomlós, Pilisszántó, Piliscsév'],
  RO: ['Romanian', 10, 'Battonya, Kétegyháza, Méhkerék'],
  RU: ['Rusyn', 7, 'Sajópálfala, Garadna, Komlóska'],
  SL: ['Slovene', 6, 'Felsőszölnök, Apátistvánfalva, Alsószölnök'],
  SE: ['Serbian', 1, 'Lórév'],
  GR: ['Greek', 1, 'Beloiannisz'],
};
const countyName = c => COUNTIES[c][0];
const regionOf = c => c.slice(0, 4);
const ofCounty = c => DATA.reg.filter(r => r.county === c).map(r => r.id);
const ofRegion = g => DATA.reg.filter(r => regionOf(r.county) === g).map(r => r.id);
const langsOf = a => R[a].langs ? R[a].langs.split('.') : [];
const ofLang = l => DATA.reg.filter(r => langsOf(r.id).includes(l)).map(r => r.id);
const byName = ids => ids.sort((a, b) => countyName(a).localeCompare(countyName(b), 'hu'));
const settlements = n => `${n} ${n === 1 ? 'settlement' : 'settlements'}`;

const QUIZ = {
  key: 'hucounties',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.county })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.22, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[45.7, 16.1], [48.6, 22.9]], maxBounds: [[43, 12], [51, 27]] },
  hintLabel: 'Color by county',
  exploreKind: 'counties',
  explore: a => {
    const c = R[a].county, l = langsOf(a);
    return { code: countyName(c), title: REGIONS[regionOf(c)], sub: l.length ? [l.map(x => LANGS[x][0]).join(' · '), R[a].places.join(', ')] : '' };
  },
  rounds: [
    { kind: 'regions', label: 'Statistical regions' },
    { kind: 'counties', label: 'Transdanubia', groups: ['Transdanubia'] },
    { kind: 'counties', label: 'Great Plain and North', groups: ['Great Plain and North'] },
    { kind: 'counties', label: 'All counties' },
    { kind: 'signs', label: 'Sign languages' },
  ],
  kinds: [
    {
      key: 'counties', label: 'Counties', sub: `${Object.keys(COUNTIES).length} by name`, noun: ['county', 'counties'], pickTitle: 'Counties to practice',
      groups: LARGE.map(([k, title]) => ({ title, sub: '', ids: byName(Object.keys(COUNTIES).filter(c => c.startsWith(k))) })),
      areasOf: ofCounty,
      primary: a => R[a].county,
      short: countyName, name: countyName,
      about: c => [REGIONS[regionOf(c)], COUNTIES[c][1] ? `Seat: ${COUNTIES[c][1]}` : 'Capital'],
      clicked: a => countyName(R[a].county),
      prompt: 'name',
      chip: countyName, chipTitle: c => REGIONS[regionOf(c)],
    },
    {
      key: 'regions', label: 'Regions', sub: `${Object.keys(REGIONS).length} statistical regions`, noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: LARGE.map(([k, title]) => ({ title, sub: '', ids: Object.keys(REGIONS).filter(g => g.startsWith(k)) })),
      areasOf: ofRegion,
      primary: a => regionOf(R[a].county),
      short: g => REGIONS[g], name: g => REGIONS[g],
      about: g => Object.keys(COUNTIES).filter(c => regionOf(c) === g).map(countyName).join(', '),
      clicked: a => REGIONS[regionOf(R[a].county)],
      prompt: 'name',
      chip: g => REGIONS[g], chipTitle: g => Object.keys(COUNTIES).filter(c => regionOf(c) === g).map(countyName).join(', '),
    },
    {
      key: 'signs', label: 'Sign languages', sub: `${Object.keys(LANGS).length} languages`, noun: ['language', 'languages'], pickTitle: 'Languages to practice',
      groups: [{ title: 'Languages', sub: '', ids: Object.keys(LANGS) }],
      areasOf: ofLang,
      areaRank: false,
      short: l => LANGS[l][0], name: l => LANGS[l][0],
      about: l => [settlements(LANGS[l][1]), LANGS[l][2]],
      clicked: a => langsOf(a).length ? langsOf(a).map(l => LANGS[l][0]).join(' · ') : `${countyName(R[a].county)} · Hungarian only`,
      prompt: 'name',
      hints: false, dim: false,
      chip: l => LANGS[l][0], chipTitle: l => LANGS[l][2],
    },
  ],
};
