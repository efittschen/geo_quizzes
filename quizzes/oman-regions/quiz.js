// Oman Regions: config for ../shared/area-quiz.js. Each map area is one of the 63 wilayats (data.js, from
// OpenStreetMap admin_level 6); the 11 governorates (muhafazat) are groups of them. Both levels can be asked by
// English name or in Arabic script (the form on bilingual signs, without the محافظة / ولاية prefix).

const W = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const GOVS = [ // ISO 3166-2 suffix, English, Arabic, seat
  ['MU', 'Musandam', 'مسندم', 'Khasab'],
  ['BU', 'Al Buraimi', 'البريمي', 'Al Buraimi'],
  ['BS', 'Al Batinah North', 'شمال الباطنة', 'Sohar'],
  ['BJ', 'Al Batinah South', 'جنوب الباطنة', 'Rustaq'],
  ['MA', 'Muscat', 'مسقط', 'Muscat'],
  ['ZA', 'Ad Dhahirah', 'الظاهرة', 'Ibri'],
  ['DA', 'Ad Dakhiliyah', 'الداخلية', 'Nizwa'],
  ['SS', 'Ash Sharqiyah North', 'شمال الشرقية', 'Ibra'],
  ['SJ', 'Ash Sharqiyah South', 'جنوب الشرقية', 'Sur'],
  ['WU', 'Al Wusta', 'الوسطى', 'Haima'],
  ['ZU', 'Dhofar', 'ظفار', 'Salalah'],
].map(([id, en, ar, seat]) => ({ id, en, ar, seat }));
const G = Object.fromEntries(GOVS.map(g => [g.id, g]));
const PARTS = [ // coarse groups for the rounds
  ['North coast', ['MU', 'BS', 'BJ', 'MA']],
  ['Interior', ['BU', 'ZA', 'DA', 'SS', 'SJ']],
  ['South', ['WU', 'ZU']],
];
const byName = (a, b) => W[a].en.localeCompare(W[b].en);
const wilayatsOf = g => DATA.reg.filter(r => r.gov === g).map(r => r.id).sort(byName);
const govIds = ids => ids.filter(id => G[id]);
const AR = 'ar';

const govKind = (key, extra) => ({
  key, noun: ['governorate', 'governorates'], pickTitle: 'Governorates to practice',
  groups: PARTS.map(([title, ids]) => ({ title, sub: '', ids })),
  areasOf: wilayatsOf,
  primary: a => W[a].gov,
  about: g => [`Seat: ${G[g].seat}`, `${wilayatsOf(g).length} wilayats`],
  ...extra,
});
const wilKind = (key, extra) => ({
  key, noun: ['wilayat', 'wilayats'], pickTitle: 'Wilayats to practice',
  groups: GOVS.map(g => ({ title: g.en, sub: g.ar, ids: wilayatsOf(g.id) })),
  areasOf: id => [id],
  about: id => [`${G[W[id].gov].en} governorate`],
  ...extra,
});

const QUIZ = {
  key: 'omregions',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.gov })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.24, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[16.6, 51.9], [26.5, 59.9]], maxBounds: [[10, 44], [32, 66]] },
  hintLabel: 'Color by governorate',
  exploreKind: 'wilayats',
  explore: a => ({ code: W[a].ar, title: W[a].en, sub: [`${G[W[a].gov].en} governorate · ${G[W[a].gov].ar}`] }),
  rounds: [
    { kind: 'govs', label: 'North coast', sub: 'Governorates', groups: ['North coast'] },
    { kind: 'govs', label: 'Interior & south', sub: 'Governorates', groups: ['Interior', 'South'] },
    { kind: 'govs', label: 'All 11 governorates' },
    { kind: 'govsAr', label: 'Governorates', sub: 'Arabic script' },
    { kind: 'wilayats', label: 'Muscat', sub: 'Wilayats', groups: ['Muscat'] },
    { kind: 'wilayats', label: 'Dhofar', sub: 'Wilayats', groups: ['Dhofar'] },
    { kind: 'wilayats', label: 'Ad Dakhiliyah', sub: 'Wilayats', groups: ['Ad Dakhiliyah'] },
    { kind: 'wilayats', label: 'Al Batinah', sub: 'Wilayats, North and South', groups: ['Al Batinah North', 'Al Batinah South'] },
    { kind: 'wilayats', label: 'The Sharqiyah', sub: 'Wilayats, North and South', groups: ['Ash Sharqiyah North', 'Ash Sharqiyah South'] },
    { kind: 'wilayats', label: 'North coast', sub: 'Wilayats', groups: ['Musandam', 'Al Batinah North', 'Al Batinah South', 'Muscat'] },
    { kind: 'wilayatsAr', label: 'North coast', sub: 'Wilayats, Arabic script', groups: ['Musandam', 'Al Batinah North', 'Al Batinah South', 'Muscat'] },
    { kind: 'wilayats', label: 'The north', sub: 'Wilayats, all but Al Wusta and Dhofar', groups: GOVS.filter(g => !['WU', 'ZU'].includes(g.id)).map(g => g.en) },
    { kind: 'wilayats', label: 'All 63 wilayats' },
    { kind: 'wilayatsAr', label: 'All 63 wilayats', sub: 'Arabic script' },
  ],
  kinds: [
    govKind('govs', {
      label: 'Governorates', sub: `All ${GOVS.length} by name`,
      short: g => G[g].en, name: g => G[g].en,
      clicked: a => G[W[a].gov].en,
      prompt: 'name',
      chip: g => G[g].en, chipTitle: g => G[g].ar,
    }),
    govKind('govsAr', {
      label: 'Governorates in Arabic', sub: `All ${GOVS.length}, Arabic script`,
      short: g => G[g].ar, name: g => `${G[g].ar} · ${G[g].en}`,
      clicked: a => `${G[W[a].gov].ar} · ${G[W[a].gov].en}`,
      prompt: 'text', text: g => ({ text: G[g].ar, lang: AR, cls: 'city' }),
      chip: g => G[g].ar, chipTitle: g => G[g].en,
    }),
    wilKind('wilayats', {
      label: 'Wilayats', sub: `All ${DATA.reg.length} by name`,
      short: id => W[id].en, name: id => W[id].en,
      clicked: a => W[a].en,
      prompt: 'name',
      chip: id => W[id].en, chipTitle: id => `${W[id].ar} · ${G[W[id].gov].en}`,
    }),
    wilKind('wilayatsAr', {
      label: 'Wilayats in Arabic', sub: `All ${DATA.reg.length}, Arabic script`,
      short: id => W[id].ar, name: id => `${W[id].ar} · ${W[id].en}`,
      clicked: a => `${W[a].ar} · ${W[a].en}`,
      prompt: 'text', text: id => ({ text: W[id].ar, lang: AR, cls: 'city' }),
      chip: id => W[id].ar, chipTitle: id => `${W[id].en} · ${G[W[id].gov].en}`,
    }),
  ],
};
