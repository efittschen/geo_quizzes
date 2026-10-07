// South Africa Road Numbers and Languages: config for ../shared/area-quiz.js, on the 213 local and metropolitan
// municipalities of data.js (geoBoundaries ADM3, 2016 boundaries, names updated to the current ones). Two pages use
// it: this folder's index.html (R-route first digit) and ../south-africa-languages/ (home languages).
//
// R-route zones (rz): three-digit regional routes are numbered by former (pre-1994) province: R3xx and R4xx Cape
// Province, R5xx Transvaal, R6xx Natal, R7xx Orange Free State (Route Numbering and Road Traffic Signs Sub
// Committee; R1xx parallel routes, two-digit R and N routes are national and left out). Each municipality takes the
// first digit with the most kilometres of R3xx–R7xx road inside it (OpenStreetMap ref tags, May 2026), or its
// province's when it has none. The zones come out as WC/EC/NC plus four North West municipalities (Cape), GP/LP/MP
// and the rest of North West (Transvaal), KZN (Natal) and FS (Free State).
//
// Home language (lang): the language most often spoken at home by the largest share of each municipality's
// population, Census 2011 (Stats SA, on the 2016 boundaries); Raymond Mhlaba (EC129) has no 2011 table and uses
// Census 2001 (isiXhosa 91.2%). English is not the largest language in any municipality.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const IDS = DATA.reg.map(r => r.id);
const PROV = {
  WC: 'Western Cape', EC: 'Eastern Cape', NC: 'Northern Cape', FS: 'Free State', KZN: 'KwaZulu-Natal',
  NW: 'North West', GP: 'Gauteng', MP: 'Mpumalanga', LP: 'Limpopo',
};

/* ---------- R-route first digit ---------- */
const ZONE_OF = { 3: 'C', 4: 'C', 5: 'T', 6: 'N', 7: 'F' };
const FORMER = { C: 'Cape Province', T: 'Transvaal', N: 'Natal', F: 'Orange Free State' };
const DIGITS = Object.keys(ZONE_OF);
const inZone = z => IDS.filter(id => R[id].rz === z);
const digitsOfZone = z => DIGITS.filter(d => ZONE_OF[d] === z);
// Current provinces in a zone, "(part)" when only some of the province's municipalities are in it.
const zoneProvinces = z => Object.keys(PROV).filter(p => IDS.some(id => R[id].prov === p && R[id].rz === z))
  .map(p => PROV[p] + (IDS.some(id => R[id].prov === p && R[id].rz !== z) ? ' (part)' : ''));
const rShort = d => `R${d}xx`;
const zoneShort = z => digitsOfZone(z).map(rShort).join(' · ');

/* ---------- home languages ---------- */
const LANGS = {
  zu: 'isiZulu', xh: 'isiXhosa', ss: 'siSwati', nr: 'isiNdebele',
  nso: 'Sepedi', st: 'Sesotho', tn: 'Setswana',
  af: 'Afrikaans', ts: 'Xitsonga', ve: 'Tshivenda',
};
const FAMILIES = [
  ['nguni', 'Nguni languages', ['zu', 'xh', 'ss', 'nr']],
  ['sotho', 'Sotho–Tswana languages', ['nso', 'st', 'tn']],
  ['af', 'Afrikaans', ['af']],
  ['ts', 'Xitsonga', ['ts']],
  ['ve', 'Tshivenda', ['ve']],
];
const FAM = Object.fromEntries(FAMILIES.map(([k, name, langs]) => [k, { name, langs }]));
const FAM_OF = Object.fromEntries(FAMILIES.flatMap(([k, , langs]) => langs.map(l => [l, k])));
const famTitle = l => ({ nguni: 'Nguni', sotho: 'Sotho–Tswana' })[FAM_OF[l]] || 'Other';
const withLang = l => IDS.filter(id => R[id].lang === l);
const count = n => `${n} ${n === 1 ? 'municipality' : 'municipalities'}`;
const LANG_IDS = Object.keys(LANGS).filter(l => withLang(l).length);

const page = document.body.dataset.kinds || '';
const onLangPage = /lang/.test(page);

const QUIZ = {
  key: 'zaroads',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.fam })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[-34.9, 16.4], [-22.1, 32.9]], maxBounds: [[-45, 5], [-12, 45]] },
  hintLabel: 'Color by language group',
  exploreKind: onLangPage ? 'langs' : 'rzones',
  explore: id => {
    const r = R[id];
    return {
      code: onLangPage ? LANGS[r.lang] : `R${digitsOfZone(r.rz).join('/')}xx`,
      title: r.name,
      sub: [PROV[r.prov], onLangPage ? `${LANGS[r.lang]} ${r.share}%` : FORMER[r.rz]],
    };
  },
  rounds: [
    { kind: 'rzones', label: 'R-route first digit', sub: 'R3xx–R7xx' },
    { kind: 'langfam', label: 'Language groups' },
    { kind: 'langs', label: 'Nguni languages', groups: ['Nguni'] },
    { kind: 'langs', label: 'Sotho–Tswana languages', groups: ['Sotho–Tswana'] },
    { kind: 'langs', label: 'All home languages' },
  ],
  kinds: [
    {
      key: 'rzones', label: 'R-route first digit', sub: 'R3xx–R7xx', noun: ['digit', 'digits'], pickTitle: 'Digits to practice',
      groups: [{ title: 'Regional routes', sub: '', ids: DIGITS }],
      areasOf: d => inZone(ZONE_OF[d]),
      primary: area => digitsOfZone(R[area].rz)[0],
      short: rShort, name: rShort,
      about: d => [FORMER[ZONE_OF[d]], zoneProvinces(ZONE_OF[d]).join(', ')],
      clicked: area => `${zoneShort(R[area].rz)} (${FORMER[R[area].rz]})`,
      prompt: 'dial', dial: d => [['R', 'cold'], [d, 'hot'], ['xx', 'cold']],
      chip: rShort, chipTitle: d => FORMER[ZONE_OF[d]],
    },
    {
      key: 'langfam', label: 'Language groups', sub: `${FAMILIES.length} groups`, noun: ['group', 'groups'], pickTitle: 'Groups to practice',
      groups: [{ title: 'Language groups', sub: '', ids: FAMILIES.map(([k]) => k) }],
      areasOf: f => IDS.filter(id => R[id].fam === f),
      short: f => FAM[f].name.replace(' languages', ''), name: f => FAM[f].name,
      about: f => [FAM[f].langs.map(l => LANGS[l]).join(', '), count(IDS.filter(id => R[id].fam === f).length)],
      clicked: area => `${FAM[R[area].fam].name} (${R[area].name})`,
      prompt: 'name',
      chip: f => FAM[f].name, chipTitle: f => FAM[f].langs.map(l => LANGS[l]).join(', '),
    },
    {
      key: 'langs', label: 'Home languages', sub: `${LANG_IDS.length} languages`, noun: ['language', 'languages'], pickTitle: 'Languages to practice',
      groups: ['Nguni', 'Sotho–Tswana', 'Other'].map(t => ({ title: t, sub: '', ids: LANG_IDS.filter(l => famTitle(l) === t) })),
      areasOf: withLang,
      short: l => LANGS[l], name: l => LANGS[l],
      about: l => [FAM[FAM_OF[l]].name, count(withLang(l).length)],
      clicked: area => `${LANGS[R[area].lang]} (${R[area].name})`,
      prompt: 'name',
      detail: { label: 'Show language group', text: l => FAM[FAM_OF[l]].name },
      chip: l => LANGS[l], chipTitle: l => FAM[FAM_OF[l]].name,
    },
  ],
};
