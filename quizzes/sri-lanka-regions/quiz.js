// Sri Lanka Provinces & Districts: config for ../shared/area-quiz.js. Each map area is one of the 339 Divisional
// Secretariat (DS) divisions (HDX COD-AB v03); the 25 districts and 9 provinces are groups of whole DS divisions.
// Names in English, Sinhala and Tamil script, as on trilingual signs: districts by their town name (no
// දිස්ත්‍රික්කය / மாவட்டம்), provinces with පළාත / மாகாணம். Where sources differ, the spelling two of COD-AB,
// Census 2024 (DCS) and Wikidata share. Language areas: each DS division's majority in Census 2024 (DCS, table A6):
// Sinhalese, or Tamil-speaking (Sri Lankan Tamil, Indian Tamil, Moor); Tamil-speaking divisions outside the North and
// East with more Tamils than Moors are the hill-country Tamil areas.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const PROV = {
  LK1: { en: 'Western', si: 'බස්නාහිර පළාත', ta: 'மேல் மாகாணம்' },
  LK2: { en: 'Central', si: 'මධ්‍යම පළාත', ta: 'மத்திய மாகாணம்' },
  LK3: { en: 'Southern', si: 'දකුණු පළාත', ta: 'தென் மாகாணம்' },
  LK4: { en: 'Northern', si: 'උතුරු පළාත', ta: 'வட மாகாணம்' },
  LK5: { en: 'Eastern', si: 'නැගෙනහිර පළාත', ta: 'கிழக்கு மாகாணம்' },
  LK6: { en: 'North Western', si: 'වයඹ පළාත', ta: 'வட மேல் மாகாணம்' },
  LK7: { en: 'North Central', si: 'උතුරු මැද පළාත', ta: 'வட மத்திய மாகாணம்' },
  LK8: { en: 'Uva', si: 'ඌව පළාත', ta: 'ஊவா மாகாணம்' },
  LK9: { en: 'Sabaragamuwa', si: 'සබරගමුව පළාත', ta: 'சபரகமுவ மாகாணம்' },
};
const DIST = {
  LK11: { en: 'Colombo', si: 'කොළඹ', ta: 'கொழும்பு' },
  LK12: { en: 'Gampaha', si: 'ගම්පහ', ta: 'கம்பஹா' },
  LK13: { en: 'Kalutara', si: 'කළුතර', ta: 'களுத்துறை' },
  LK21: { en: 'Kandy', si: 'මහනුවර', ta: 'கண்டி' },
  LK22: { en: 'Matale', si: 'මාතලේ', ta: 'மாத்தளை' },
  LK23: { en: 'Nuwara Eliya', si: 'නුවරඑළිය', ta: 'நுவரெலியா' },
  LK31: { en: 'Galle', si: 'ගාල්ල', ta: 'காலி' },
  LK32: { en: 'Matara', si: 'මාතර', ta: 'மாத்தறை' },
  LK33: { en: 'Hambantota', si: 'හම්බන්තොට', ta: 'அம்பாந்தோட்டை' },
  LK41: { en: 'Jaffna', si: 'යාපනය', ta: 'யாழ்ப்பாணம்' },
  LK42: { en: 'Mannar', si: 'මන්නාරම', ta: 'மன்னார்' },
  LK43: { en: 'Vavuniya', si: 'වවුනියා', ta: 'வவுனியா' },
  LK44: { en: 'Mullaitivu', si: 'මුලතිව්', ta: 'முல்லைத்தீவு' },
  LK45: { en: 'Kilinochchi', si: 'කිලිනොච්චි', ta: 'கிளிநொச்சி' },
  LK51: { en: 'Batticaloa', si: 'මඩකලපුව', ta: 'மட்டக்களப்பு' },
  LK52: { en: 'Ampara', si: 'අම්පාර', ta: 'அம்பாறை' },
  LK53: { en: 'Trincomalee', si: 'ත්‍රිකුණාමලය', ta: 'திருகோணமலை' },
  LK61: { en: 'Kurunegala', si: 'කුරුණෑගල', ta: 'குருநாகல்' },
  LK62: { en: 'Puttalam', si: 'පුත්තලම', ta: 'புத்தளம்' },
  LK71: { en: 'Anuradhapura', si: 'අනුරාධපුර', ta: 'அனுராதபுரம்' },
  LK72: { en: 'Polonnaruwa', si: 'පොළොන්නරුව', ta: 'பொலன்னறுவை' },
  LK81: { en: 'Badulla', si: 'බදුල්ල', ta: 'பதுளை' },
  LK82: { en: 'Monaragala', si: 'මොණරාගල', ta: 'மொனராகலை' },
  LK91: { en: 'Ratnapura', si: 'රත්නපුර', ta: 'இரத்தினபுரி' },
  LK92: { en: 'Kegalle', si: 'කෑගල්ල', ta: 'கேகாலை' },
};
const LANG = {
  S: { en: 'Sinhala majority', about: 'Sinhalese majority' },
  T: { en: 'Tamil majority', about: 'Tamil-speaking majority: Sri Lankan Tamil, Moor' },
  H: { en: 'Hill-country Tamil', about: 'Tamil-speaking majority: Indian (Malaiyaha) Tamil' },
};
const PROVS = Object.keys(PROV);
const dsIn = (key, v) => DATA.reg.filter(r => r[key] === v).map(r => r.id);
const distsIn = pv => Object.keys(DIST).filter(dt => dt.slice(0, 3) === pv);
const DISTS = PROVS.flatMap(distsIn);
const LANGS = Object.keys(LANG);
const byProvince = PROVS.map(pv => ({ title: PROV[pv].en, sub: PROV[pv].si, ids: distsIn(pv) }));
const provOf = dt => PROV[dt.slice(0, 3)];
const provLine = dt => `${provOf(dt).en} Province`;
const script = (text, lang) => ({ text, lang, cls: lang });
const langOfArea = a => LANG[R[a].lg];
const langCount = l => DATA.reg.filter(r => r.lg === l).length;

// One kind per level and script: English names, Sinhala script, Tamil script.
const distKind = (key, label, f, prompt) => ({
  key, label, sub: `All ${DISTS.length}${f === 'en' ? ' by name' : f === 'si' ? ' in Sinhala script' : ' in Tamil script'}`,
  noun: ['district', 'districts'], pickTitle: 'Districts to practice',
  groups: byProvince,
  areasOf: dt => dsIn('dt', dt),
  primary: a => R[a].dt,
  short: dt => DIST[dt][f], name: dt => f === 'en' ? DIST[dt].en : `${DIST[dt][f]} · ${DIST[dt].en}`,
  about: dt => [`${DIST[dt].si} · ${DIST[dt].ta}`, provLine(dt)],
  clicked: a => `${DIST[R[a].dt][f]}${f === 'en' ? '' : ' · ' + DIST[R[a].dt].en}`,
  ...prompt,
  chip: dt => DIST[dt][f], chipTitle: dt => `${DIST[dt].en} · ${provLine(dt)}`,
});
const provKind = (key, label, f, prompt) => ({
  key, label, sub: `${PROVS.length}${f === 'en' ? ' by name' : f === 'si' ? ' in Sinhala script' : ' in Tamil script'}`,
  noun: ['province', 'provinces'], pickTitle: 'Provinces to practice',
  groups: [{ title: 'Provinces', sub: 'පළාත · மாகாணம்', ids: PROVS }],
  areasOf: pv => dsIn('pv', pv),
  primary: a => R[a].pv,
  short: pv => PROV[pv][f], name: pv => f === 'en' ? `${PROV[pv].en} Province` : `${PROV[pv][f]} · ${PROV[pv].en}`,
  about: pv => [`${PROV[pv].si} · ${PROV[pv].ta}`, distsIn(pv).map(dt => DIST[dt].en).join(', ')],
  clicked: a => `${PROV[R[a].pv][f]}${f === 'en' ? ' Province' : ' · ' + PROV[R[a].pv].en}`,
  ...prompt,
  hints: false, // the colors are the provinces
  chip: pv => PROV[pv][f], chipTitle: pv => `${PROV[pv].en} Province`,
});

const QUIZ = {
  key: 'lkregions',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.pv })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.22, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[5.85, 79.45], [9.9, 81.95]], maxBounds: [[3, 76], [12.5, 85]] },
  hintLabel: 'Color by province',
  exploreKind: 'districts',
  explore: a => ({
    code: DIST[R[a].dt].en, title: `${DIST[R[a].dt].si} · ${DIST[R[a].dt].ta}`,
    sub: [provLine(R[a].dt), `${R[a].n} DS division · ${langOfArea(a).en}`],
  }),
  rounds: [
    { kind: 'provinces', label: 'Provinces', sub: 'English' },
    { kind: 'lang', label: 'Tamil vs Sinhala areas', sub: 'Census 2024' },
    { kind: 'provincesSi', label: 'Provinces', sub: 'Sinhala script' },
    { kind: 'provincesTa', label: 'Provinces', sub: 'Tamil script' },
    { kind: 'districts', label: 'North & East', sub: 'Northern, Eastern', groups: ['Northern', 'Eastern'] },
    { kind: 'districts', label: 'West & South', sub: 'Western, Southern, Sabaragamuwa', groups: ['Western', 'Southern', 'Sabaragamuwa'] },
    { kind: 'districts', label: 'Centre', sub: 'Central, Uva, North Western, North Central', groups: ['Central', 'Uva', 'North Western', 'North Central'] },
    { kind: 'districts', label: 'All 25 districts', sub: 'English' },
    { kind: 'districtsSi', label: 'All 25 districts', sub: 'Sinhala script' },
    { kind: 'districtsTa', label: 'All 25 districts', sub: 'Tamil script' },
  ],
  kinds: [
    distKind('districts', 'Districts', 'en', { prompt: 'name' }),
    distKind('districtsSi', 'Districts in Sinhala', 'si', { prompt: 'text', text: dt => script(DIST[dt].si, 'si') }),
    distKind('districtsTa', 'Districts in Tamil', 'ta', { prompt: 'text', text: dt => script(DIST[dt].ta, 'ta') }),
    provKind('provinces', 'Provinces', 'en', { prompt: 'name' }),
    provKind('provincesSi', 'Provinces in Sinhala', 'si', { prompt: 'text', text: pv => script(PROV[pv].si, 'si') }),
    provKind('provincesTa', 'Provinces in Tamil', 'ta', { prompt: 'text', text: pv => script(PROV[pv].ta, 'ta') }),
    {
      key: 'lang', label: 'Language areas', sub: 'Tamil vs Sinhala', noun: ['area', 'areas'], pickTitle: 'Areas to practice',
      groups: [{ title: 'Majority by DS division', sub: 'Census 2024', ids: LANGS }],
      areasOf: l => dsIn('lg', l),
      primary: a => R[a].lg,
      areaRank: false,
      short: l => LANG[l].en, name: l => LANG[l].en,
      about: l => [LANG[l].about, `${langCount(l)} of ${DATA.reg.length} DS divisions`],
      clicked: a => `${LANG[R[a].lg].en} (${R[a].n}, ${DIST[R[a].dt].en})`,
      prompt: 'name',
      hints: false, // province colors would hint at the North and East
      chip: l => LANG[l].en, chipTitle: l => LANG[l].about,
    },
  ],
};
