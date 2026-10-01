// Ghana Regions: config for ../shared/area-quiz.js. Each map area is one of the 261 districts (data.js); the kinds group
// them into the 16 regions (since the 2018 referendum), the 10 regions before it, and language areas.
// Language areas: the Ghanaian language most people read in each district (2021 census, GSS StatsBank "Literate
// population by Ghanaian language of literacy"). Districts where under 2% read any Ghanaian language (the far north-east,
// whose own languages are not in the census list) belong to no language area.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const slug = s => s.toLowerCase().replace(/[^a-z]+/g, '-');
const districtsWhere = (prop, v) => DATA.reg.filter(r => r[prop] === v).map(r => r.id);

// The 16 regions, by part of the country, with their capitals.
const PARTS = [
  ['South', ['Greater Accra', 'Central', 'Western', 'Eastern', 'Volta']],
  ['Middle belt', ['Ashanti', 'Western North', 'Ahafo', 'Bono', 'Bono East', 'Oti']],
  ['North', ['Northern', 'Savannah', 'North East', 'Upper East', 'Upper West']],
];
const CAPITAL = {
  'Greater Accra': 'Accra', Central: 'Cape Coast', Western: 'Sekondi-Takoradi', Eastern: 'Koforidua', Volta: 'Ho',
  Ashanti: 'Kumasi', 'Western North': 'Sefwi Wiawso', Ahafo: 'Goaso', Bono: 'Sunyani', 'Bono East': 'Techiman', Oti: 'Dambai',
  Northern: 'Tamale', Savannah: 'Damongo', 'North East': 'Nalerigu', 'Upper East': 'Bolgatanga', 'Upper West': 'Wa',
};
const REGIONS = PARTS.flatMap(([, rs]) => rs);
const OLD_OF = Object.fromEntries(DATA.reg.map(r => [r.region, r.old]));
const OLD = ['Greater Accra', 'Central', 'Western', 'Eastern', 'Volta', 'Ashanti', 'Brong-Ahafo', 'Northern', 'Upper East', 'Upper West'];
const newIn = old => REGIONS.filter(r => OLD_OF[r] === old);

// Languages of literacy, grouped.
const LANG_GROUPS = [
  ['Akan', ['Asante Twi', 'Akuapem Twi', 'Fante']],
  ['Nzema', ['Nzema']],
  ['Ga-Dangme', ['Ga', 'Dangme']],
  ['Ewe', ['Ewe']],
  ['Northern languages', ['Dagbani', 'Gonja', 'Dagaare', 'Kasem', 'Gurene']],
];
const LANGS = LANG_GROUPS.flatMap(([, ls]) => ls);
const GROUP_OF = Object.fromEntries(LANG_GROUPS.flatMap(([g, ls]) => ls.map(l => [l, g])));
const langCount = l => districtsWhere('lang', l).length;

const rid = r => 'r-' + slug(r), oid = o => 'o-' + slug(o), cid = r => 'c-' + slug(r), gid = g => 'g-' + slug(g), lid = l => 'l-' + slug(l);
const REG_OF = Object.fromEntries(REGIONS.map(r => [rid(r), r]));
const OLD_ID = Object.fromEntries(OLD.map(o => [oid(o), o]));
const CAP_OF = Object.fromEntries(REGIONS.map(r => [cid(r), r]));
const GROUP_ID = Object.fromEntries(LANG_GROUPS.map(([g]) => [gid(g), g]));
const LANG_ID = Object.fromEntries(LANGS.map(l => [lid(l), l]));

const districtLines = a => {
  const r = R[a];
  return [r.region + (r.old !== r.region ? ` · before 2019: ${r.old}` : ''), r.lang ? `${r.lang} (${GROUP_OF[r.lang]})` : 'No main language'];
};

const QUIZ = {
  key: 'ghregions',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.region })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 60, labelScale: 0.2, fly: { pad: 1.6, min: 1 / 60 },
  geo: GEO,
  street: { bounds: [[4.7, -3.3], [11.2, 1.2]], maxBounds: [[2, -6.5], [14, 4.5]] },
  hintLabel: 'Color by region',
  exploreKind: 'regions',
  explore: a => ({ code: R[a].region, title: R[a].name, sub: districtLines(a) }),
  rounds: [
    { kind: 'langgroups', label: 'Language groups', sub: 'Akan, Ewe, Ga-Dangme…' },
    { kind: 'regions', label: 'The South', groups: ['South'] },
    { kind: 'regions', label: 'The Middle belt', groups: ['Middle belt'] },
    { kind: 'regions', label: 'The North', groups: ['North'] },
    { kind: 'old', label: 'Regions before 2019', sub: 'The old 10' },
    { kind: 'regions', label: 'All 16 regions' },
    { kind: 'capitals', label: 'Regional capitals' },
    { kind: 'langs', label: 'Languages', sub: 'Twi, Fante, Ga, Ewe, Dagbani…' },
  ],
  kinds: [
    {
      key: 'regions', label: 'Regions', sub: `All ${REGIONS.length} by name`, noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: PARTS.map(([title, rs]) => ({ title, sub: '', ids: rs.map(rid) })),
      areasOf: id => districtsWhere('region', REG_OF[id]),
      primary: a => rid(R[a].region),
      short: id => REG_OF[id], name: id => REG_OF[id],
      about: id => [`Capital: ${CAPITAL[REG_OF[id]]}`, OLD_OF[REG_OF[id]] !== REG_OF[id] ? `Before 2019: ${OLD_OF[REG_OF[id]]}` : 'Same before 2019'],
      clicked: a => R[a].region,
      prompt: 'name',
      chip: id => REG_OF[id], chipTitle: id => `Capital: ${CAPITAL[REG_OF[id]]}`,
    },
    {
      key: 'old', label: 'Before 2019', sub: `The old ${OLD.length} regions`, noun: ['region', 'regions'], pickTitle: 'Old regions to practice',
      groups: [{ title: 'Regions before 2019', sub: '', ids: OLD.map(oid) }],
      areasOf: id => districtsWhere('old', OLD_ID[id]),
      primary: a => oid(R[a].old),
      short: id => OLD_ID[id], name: id => OLD_ID[id],
      about: id => newIn(OLD_ID[id]).length > 1 ? `Now: ${newIn(OLD_ID[id]).join(', ')}` : 'Unchanged',
      clicked: a => R[a].old === R[a].region ? R[a].old : `${R[a].old} (now ${R[a].region})`,
      prompt: 'name',
      chip: id => OLD_ID[id], chipTitle: id => `Now: ${newIn(OLD_ID[id]).join(', ')}`,
    },
    {
      key: 'capitals', label: 'Capitals', sub: 'Find the region', noun: ['capital', 'capitals'], pickTitle: 'Capitals to practice',
      groups: PARTS.map(([title, rs]) => ({ title, sub: '', ids: rs.map(cid) })),
      areasOf: id => districtsWhere('region', CAP_OF[id]),
      primary: a => cid(R[a].region),
      short: id => CAPITAL[CAP_OF[id]], name: id => CAPITAL[CAP_OF[id]],
      about: id => `${CAP_OF[id]} region`,
      clicked: a => `${R[a].region} (${CAPITAL[R[a].region]})`,
      prompt: 'name',
      chip: id => CAPITAL[CAP_OF[id]], chipTitle: id => CAP_OF[id],
    },
    {
      key: 'langgroups', label: 'Language groups', sub: `${LANG_GROUPS.length} groups`, noun: ['group', 'groups'], pickTitle: 'Language groups to practice',
      groups: [{ title: 'Language groups', sub: '', ids: LANG_GROUPS.map(([g]) => gid(g)) }],
      areasOf: id => DATA.reg.filter(r => r.lang && GROUP_OF[r.lang] === GROUP_ID[id]).map(r => r.id),
      short: id => GROUP_ID[id], name: id => GROUP_ID[id],
      about: id => LANG_GROUPS.find(([g]) => g === GROUP_ID[id])[1].join(' · '),
      clicked: a => R[a].lang ? GROUP_OF[R[a].lang] : 'No main language',
      prompt: 'name',
      chip: id => GROUP_ID[id], chipTitle: id => LANG_GROUPS.find(([g]) => g === GROUP_ID[id])[1].join(' · '),
    },
    {
      key: 'langs', label: 'Languages', sub: `${LANGS.length} languages`, noun: ['language', 'languages'], pickTitle: 'Languages to practice',
      groups: LANG_GROUPS.map(([title, ls]) => ({ title, sub: '', ids: ls.map(lid) })),
      areasOf: id => districtsWhere('lang', LANG_ID[id]),
      short: id => LANG_ID[id], name: id => LANG_ID[id],
      about: id => [GROUP_OF[LANG_ID[id]], `${langCount(LANG_ID[id])} districts`],
      clicked: a => R[a].lang || 'No main language',
      prompt: 'name',
      chip: id => LANG_ID[id], chipTitle: id => GROUP_OF[LANG_ID[id]],
    },
  ],
};
