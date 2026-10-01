// South Korea Regions: config for ../shared/area-quiz.js, on the map of ../south-korea-codes (each area a si-do or a
// part of one). The 17 si-do as before the 1 July 2026 Gwangju-Jeonnam merger, which is what coverage shows; Gunwi
// is in Daegu (since 2023). Kinds, coarse to fine: traditional regions, local-road prefixes, si-do in English, si-do
// in Hangul (short form as on plates, and the full official name).

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const S = KR.sido;
const SIDO = Object.keys(S);
const METRO = ['SE', 'BS', 'DG', 'IC', 'GJ', 'DJ', 'US', 'SJ'];
const DO = SIDO.filter(s => !METRO.includes(s));
const RG = Object.fromEntries(KR.regions.map(g => [g.id, g]));
const ROADS = DO.map(s => S[s].road);
const ROAD_SIDO = Object.fromEntries(DO.map(s => [S[s].road, s]));
const sidoAreas = s => DATA.reg.filter(r => r.sido === s).map(r => r.id);
const codesOf = s => [...new Set(DATA.reg.filter(r => r.sido === s).map(r => r.code))].join(', ');
const roadName = p => `${p}xx`;
const byRegion = ids => KR.regions.map(g => ({ title: g.en, sub: g.sub, ids: ids.filter(s => S[s].region === g.id) })).filter(g => g.ids.length);
const fullName = s => S[s].old ? `${S[s].full} (${S[s].old})` : S[s].full;
const sidoAbout = s => [fullName(s), `${RG[S[s].region].en} · ${codesOf(s)}`];
const sido = a => R[a].sido;
const hangulText = key => s => ({ text: S[s][key], lang: 'ko', cls: 'ko' });

const sidoKind = extra => ({
  noun: ['si-do', 'si-do'], pickTitle: 'Si-do to practice',
  groups: byRegion(SIDO),
  areasOf: sidoAreas, primary: sido,
  about: sidoAbout, chipTitle: s => S[s].en,
  ...extra,
});

const QUIZ = {
  key: 'krregions',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.sido })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.25, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[33.1, 124.6], [38.65, 130.95]], maxBounds: [[29, 118], [43, 137]] },
  hintLabel: 'Color each si-do',
  exploreKind: 'provinces',
  explore: a => {
    const s = sido(a);
    return { code: S[s].ko, title: S[s].en, sub: [fullName(s), `${RG[S[s].region].en}${S[s].road ? ` · Local roads ${roadName(S[s].road)}` : ''}`] };
  },
  rounds: [
    { kind: 'regions', label: 'Traditional regions' },
    { kind: 'roads', label: 'Local-road prefixes' },
    { kind: 'provinces', label: 'Metropolitan cities', sub: 'and Sejong', ids: METRO },
    { kind: 'provinces', label: 'Provinces', ids: DO },
    { kind: 'hangul', label: 'Hangul: cities', sub: '서울, 부산…', ids: METRO },
    { kind: 'hangul', label: 'Hangul: provinces', sub: '경기, 충북…', ids: DO },
    { kind: 'provinces', label: 'All si-do' },
    { kind: 'hangul', label: 'All si-do in Hangul', sub: 'Short names' },
    { kind: 'hangulfull', label: 'Full Hangul names' },
  ],
  kinds: [
    {
      key: 'regions', label: 'Traditional regions', sub: `${KR.regions.length} regions`, noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: [{ title: 'Regions', sub: '', ids: KR.regions.map(g => g.id) }],
      areasOf: g => SIDO.filter(s => S[s].region === g).flatMap(sidoAreas),
      primary: a => S[sido(a)].region,
      short: g => RG[g].en, name: g => RG[g].en,
      about: g => [`${RG[g].ko} · ${RG[g].sub}`],
      clicked: a => `${S[sido(a)].en} (${RG[S[sido(a)].region].en})`,
      prompt: 'name',
      chip: g => RG[g].en, chipTitle: g => RG[g].sub,
    },
    {
      key: 'roads', label: 'Local-road prefixes', sub: `${ROADS.length} provinces`, noun: ['prefix', 'prefixes'], pickTitle: 'Prefixes to practice',
      groups: [{ title: 'Local roads (지방도)', sub: '', ids: ROADS }],
      areasOf: p => sidoAreas(ROAD_SIDO[p]),
      primary: a => S[sido(a)].road,
      short: roadName, name: roadName,
      about: p => [S[ROAD_SIDO[p]].en, fullName(ROAD_SIDO[p])],
      clicked: a => S[sido(a)].road ? `${roadName(S[sido(a)].road)} (${S[sido(a)].en})` : `${S[sido(a)].en}: no local roads`,
      prompt: 'text', text: p => ({ text: roadName(p), cls: 'shield' }),
      chip: roadName, chipTitle: p => S[ROAD_SIDO[p]].en,
    },
    sidoKind({
      key: 'provinces', label: 'Si-do', sub: `All ${SIDO.length} by name`,
      short: s => S[s].en, name: s => S[s].en,
      clicked: a => S[sido(a)].en,
      prompt: 'name',
      chip: s => S[s].en, chipTitle: s => S[s].ko,
    }),
    sidoKind({
      key: 'hangul', label: 'Hangul', sub: 'Short names', 
      short: s => S[s].ko, name: s => S[s].ko,
      about: s => [S[s].en, ...sidoAbout(s)],
      clicked: a => `${S[sido(a)].ko} · ${S[sido(a)].en}`,
      prompt: 'text', text: hangulText('ko'),
      chip: s => S[s].ko,
    }),
    sidoKind({
      key: 'hangulfull', label: 'Hangul full names', sub: 'Official names',
      short: s => S[s].ko, name: s => S[s].full,
      about: s => [S[s].en, ...sidoAbout(s)],
      clicked: a => `${S[sido(a)].full} · ${S[sido(a)].en}`,
      prompt: 'text', text: hangulText('full'),
      chip: s => S[s].full,
    }),
  ],
};
