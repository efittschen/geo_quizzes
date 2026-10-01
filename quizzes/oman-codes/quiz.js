// Oman Area Codes: config for ../shared/area-quiz.js, on the wilayat map of ../oman-regions/data.js. Oman's 8-digit
// fixed numbers starting 23–26 are geographic (ITU-T notice of the TRA, 14.IX.2025), each lead covering whole
// governorates; 21 and 22 are fixed lines with no region. Al Buraimi is not named by the ITU table; its fixed lines
// in OpenStreetMap all start 25 (it was part of Ad Dhahirah until 2006).

const W = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const GOV = {
  MA: 'Muscat', ZU: 'Dhofar', MU: 'Musandam', BU: 'Al Buraimi', DA: 'Ad Dakhiliyah', BS: 'Al Batinah North',
  BJ: 'Al Batinah South', SJ: 'Ash Sharqiyah South', SS: 'Ash Sharqiyah North', ZA: 'Ad Dhahirah', WU: 'Al Wusta',
};
const CODES = ['23', '24', '25', '26'];
const areasOf = c => DATA.reg.filter(r => r.code === c).map(r => r.id);
const govsOf = c => [...new Set(areasOf(c).map(a => W[a].gov))].map(g => GOV[g]).join(', ');

const QUIZ = {
  key: 'omcodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.gov })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[16.6, 51.9], [26.5, 59.9]], maxBounds: [[10, 44], [32, 66]] },
  hintLabel: 'Color by governorate',
  exploreKind: 'codes',
  explore: a => ({ code: W[a].code, title: W[a].en, sub: `${GOV[W[a].gov]} governorate` }),
  rounds: [
    { kind: 'codes', label: 'Fixed-line codes', sub: '23 · 24 · 25 · 26' },
  ],
  kinds: [
    {
      key: 'codes', label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: [{ title: 'Fixed lines', sub: '', ids: CODES }],
      areasOf,
      short: c => c, name: c => c,
      about: c => govsOf(c),
      clicked: a => `${W[a].code}, ${GOV[W[a].gov]}`,
      prompt: 'dial',
      chip: c => c, chipTitle: govsOf,
    },
  ],
};
