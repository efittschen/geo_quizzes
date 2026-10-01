// South Korea Area Codes: config for ../shared/area-quiz.js. Each map area is a si-do, or the part of one that dials
// another code: Gwacheon and Gwangmyeong (02), Bucheon and Daebudo (032), Gyeryong (042), Gyeongsan (053) and Gunwi
// (054, Daegu since 2023). Codes: MSIT 전기통신번호관리세칙 (Notice 2021-93) Art. 7(3) and Annex 1.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const S = KR.sido;
const BY = {}; // code -> area ids
for (const r of DATA.reg) (BY[r.code] ??= []).push(r.id);
const CODES = Object.keys(BY).sort();
const DIGITS = [...new Set(CODES.map(k => k[1]))];
const withDigit = d => CODES.filter(k => k[1] === d);
const areasWith = d => withDigit(d).flatMap(k => BY[k]);
const ZONES = { 2: 'Seoul', 3: 'Capital area & Gangwon', 4: 'Chungcheong', 5: 'Gyeongsang', 6: 'Jeolla & Jeju' };
const BIG = ['02', '051', '032', '053', '042', '062', '052'];
const REGION = Object.fromEntries(KR.regions.map(g => [g.id, g.en]));
// Name of a map area: the si-do, or the cities in it that dial another code.
const areaName = id => KR.pieces[id] ? `${KR.pieces[id]} (${S[R[id].sido].en})` : S[R[id].sido].en;
// The si-do whose code it is comes first (02: Seoul, then Gwacheon and Gwangmyeong).
const place = k => BY[k].slice().sort((a, b) => !!KR.pieces[a] - !!KR.pieces[b]).map(areaName).join(', ');
const mainSido = k => S[R[BY[k].find(id => !KR.pieces[id])].sido];
const zoneShort = d => d === '2' ? '02' : `0${d}x`;

const QUIZ = {
  key: 'krcodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.code })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[33.1, 124.6], [38.65, 130.95]], maxBounds: [[29, 118], [43, 137]] },
  hintLabel: 'Color each area code',
  exploreKind: 'codes',
  explore: id => ({ code: R[id].code, title: areaName(id), sub: [S[R[id].sido].full, `${REGION[S[R[id].sido].region]} region`] }),
  rounds: [
    { kind: 'digit1', label: 'First digit' },
    { kind: 'codes', label: 'Big cities', preset: 'Big cities' },
    { kind: 'codes', label: 'North', sub: '02, 03x, 04x', groups: ['02', '03x', '04x'] },
    { kind: 'codes', label: 'South', sub: '05x, 06x', groups: ['05x', '06x'] },
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: DIGITS.map(d => ({ title: zoneShort(d), sub: ZONES[d], ids: withDigit(d) })),
      presets: [{ label: 'Big cities', ids: BIG }],
      areasOf: k => BY[k],
      short: k => k, name: k => k,
      about: k => [place(k), `${mainSido(k).full} · ${REGION[mainSido(k).region]}`],
      clicked: id => `${R[id].code}, ${areaName(id)}`,
      prompt: 'dial', dial: k => [[k, 'hot']],
      detail: { label: 'Show region', text: k => REGION[mainSido(k).region] },
      chip: k => k, chipTitle: place,
    },
    {
      key: 'digit1', label: 'First digit', sub: 'Beginner', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: '', ids: DIGITS }],
      areasOf: areasWith,
      short: zoneShort, name: zoneShort, about: d => [ZONES[d], withDigit(d).join(', ')],
      clicked: id => `${zoneShort(R[id].code[1])} (${ZONES[R[id].code[1]]})`,
      prompt: 'dial', dial: d => d === '2' ? [['02', 'hot']] : [['0', 'cold'], [d, 'hot'], ['x', 'cold']],
      hints: false, // the colors give the zones away
      chip: zoneShort, chipTitle: d => ZONES[d],
    },
  ],
};
