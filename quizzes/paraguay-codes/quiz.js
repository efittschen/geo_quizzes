// Paraguay Area Codes: config for ../shared/area-quiz.js, on the district areas of ../paraguay-regions/data.js.
// Paraguay's geographic codes were abolished on paper by CONATEL RD 1626/2011 (void from 1 Feb 2014; the ITU 2021
// notification lists only NDC 21), but landlines outside Gran Asunción still use them. The last official list (ITU
// Operational Bulletin, CONATEL 2002 with the 2005 changes) is out of date: many codes have changed since (31 -> 331,
// 36 -> 336, 86 -> 786, 91 -> 491 …). So each district gets the code of the exchange at its seat, from current real
// numbers, in this order:
//   Copaco's list of codes by locality (copaco.com.py "Info Generales", 2026; Copaco is the state fixed-line operator);
//   Ministerio Público, "Guía de servicios para agentes fiscales" (municipal and governorate numbers, c. 2015; via OAS
//     MESICIC) for 3 de Febrero, Abaí, Alto Verá, Antequera, Cambyretá, Capitán Meza, Carayaó, Carlos Antonio López,
//     Cerrito, Desmochados, Dr. Cecilio Báez, Juan León Mallorquín, Moisés Bertoni, Edelira, Fram, Félix Pérez
//     Cardozo, General Artigas, Gral. Resquín, Gral. Eugenio A. Garay, Gral. Higinio Morínigo, Guazú-cuá, Humaitá,
//     Isla Umbú, Itakyry, Itapúa Poty, Jesús, José Leandro Oviedo, Juan de Mena, La Pastora, Lima, Loma Grande,
//     Loreto (also MSPBS: 0332-222325), Mayor Martínez, Mbocayaty del Yhaguy, Mbuyapey, Nanawa, Nueva Alborada,
//     Nueva Colombia, Nueva Germania, Puerto Pinasco, Quyquyhó, R.I. 3 Corrales, Raúl Arsenio Oviedo, San Roque
//     González, San Joaquín, San José Obrero, San Juan del Paraná, San Pedro del Paraná, San Rafael del Paraná, Santa
//     Rosa del Aguaray (also its municipal site: 0433), Santa Rosa del Mbutuy, Tacuaras, Tacuatí, Tte. Esteban
//     Martínez, Trinidad, Valenzuela, Vaquería, Villa Franca, Villa Oliva, Villalbín, Yabebyry, Yasy Cañy, Yatytay,
//     Ybytymí, Yhú;
//   municipios.gov.py (Primero de Marzo: 0516); OpenStreetMap phone tags (Carmelo Peralta: 0497);
//   the 2002 ITU list, rural lines of the San Juan Nepomuceno (544) and San Alberto (677) exchanges, both codes still
//     in use: José Fassardi, Mbaracayú, Puerto Adela, Santa Fe del Paraná.
// Second codes: Friesland 318 (2005 ITU change; Cooperativa Friesland 0318 219 032) in Itacurubí del Rosario,
// Kressburgo 672 (Copaco) in Carlos Antonio López. 42 districts have no code of their own in any of these (rural
// districts, mostly created since 2010, whose municipal numbers are 021 Línea Alta lines or mobiles): they are left
// out. 021 is also used by Copaco's Línea Alta wireless lines anywhere in the country.
const CODES_OF = {
  PY0000: ['21'], PY0101: ['331'], PY0102: ['331'], PY0103: ['32'], PY0104: ['332'], PY0106: ['351'], PY0107: ['39'],
  PY0201: ['342'], PY0202: ['451'], PY0203: ['432'], PY0204: ['418'], PY0205: ['41', '318'], PY0206: ['350'],
  PY0207: ['451'], PY0208: ['343'], PY0210: ['32'], PY0213: ['44'], PY0214: ['451'], PY0216: ['431'],
  PY0217: ['453'], PY0218: ['433'], PY0220: ['431'], PY0222: ['451'], PY0301: ['511'], PY0302: ['512'],
  PY0303: ['510'], PY0304: ['520'], PY0305: ['517'], PY0306: ['529'], PY0307: ['514'], PY0308: ['525'],
  PY0309: ['518'], PY0310: ['528'], PY0311: ['516'], PY0312: ['516'], PY0313: ['516'], PY0314: ['515'],
  PY0315: ['516'], PY0316: ['512'], PY0317: ['516'], PY0318: ['516'], PY0319: ['516'], PY0320: ['516'],
  PY0401: ['541'], PY0402: ['540'], PY0403: ['550'], PY0405: ['544'], PY0406: ['546'], PY0407: ['548'],
  PY0408: ['554'], PY0409: ['546'], PY0410: ['544'], PY0411: ['541'], PY0412: ['550'], PY0413: ['543'],
  PY0414: ['540'], PY0415: ['549'], PY0417: ['552'], PY0418: ['553'], PY0501: ['521'], PY0502: ['522'],
  PY0503: ['530'], PY0504: ['530'], PY0505: ['530'], PY0506: ['524'], PY0507: ['522'], PY0509: ['530'],
  PY0510: ['523'], PY0511: ['530'], PY0512: ['528'], PY0513: ['530'], PY0514: ['528'], PY0515: ['527'],
  PY0517: ['528'], PY0518: ['528'], PY0519: ['530'], PY0520: ['572'], PY0601: ['542'], PY0602: ['544'],
  PY0603: ['544'], PY0604: ['544'], PY0605: ['544'], PY0606: ['542'], PY0607: ['544'], PY0608: ['544'],
  PY0609: ['545'], PY0610: ['547'], PY0611: ['547'], PY0701: ['71'], PY0702: ['767'], PY0703: ['71'],
  PY0704: ['768'], PY0705: ['71'], PY0706: ['71'], PY0707: ['762'], PY0708: ['741'], PY0709: ['671', '672'],
  PY0710: ['765'], PY0711: ['761'], PY0712: ['743'], PY0713: ['740'], PY0714: ['775'], PY0715: ['71'],
  PY0716: ['544'], PY0717: ['717'], PY0718: ['671'], PY0719: ['73'], PY0720: ['742'], PY0721: ['768'],
  PY0722: ['775'], PY0723: ['768'], PY0724: ['764'], PY0725: ['71'], PY0726: ['763'], PY0727: ['768'],
  PY0728: ['71'], PY0729: ['768'], PY0730: ['764'], PY0801: ['81'], PY0802: ['72'], PY0803: ['782'], PY0804: ['783'],
  PY0805: ['744'], PY0806: ['781'], PY0807: ['858'], PY0808: ['782'], PY0809: ['83'], PY0810: ['72'],
  PY0901: ['531'], PY0902: ['535'], PY0903: ['531'], PY0904: ['526'], PY0905: ['532'], PY0906: ['531'],
  PY0907: ['537'], PY0908: ['580'], PY0909: ['519'], PY0910: ['536'], PY0911: ['519'], PY0912: ['538'],
  PY0913: ['539'], PY0915: ['533'], PY0916: ['534'], PY0917: ['516'], PY1001: ['61'], PY1002: ['61'],
  PY1004: ['675'], PY1005: ['631'], PY1006: ['677'], PY1007: ['674'], PY1009: ['632'], PY1010: ['633'],
  PY1011: ['644'], PY1013: ['673'], PY1014: ['676'], PY1015: ['678'], PY1017: ['677'], PY1018: ['677'],
  PY1020: ['677'], PY1022: ['672'], PY1101: ['291'], PY1102: ['228'], PY1103: ['21'], PY1104: ['293'],
  PY1105: ['224'], PY1106: ['294'], PY1107: ['21'], PY1108: ['21'], PY1109: ['21'], PY1110: ['21'], PY1111: ['292'],
  PY1112: ['21'], PY1113: ['21'], PY1114: ['21'], PY1115: ['21'], PY1116: ['225'], PY1117: ['513'], PY1118: ['275'],
  PY1119: ['295'], PY1201: ['786'], PY1202: ['780'], PY1203: ['788'], PY1204: ['786'], PY1205: ['787'],
  PY1206: ['786'], PY1207: ['786'], PY1208: ['786'], PY1210: ['786'], PY1211: ['785'], PY1212: ['784'],
  PY1213: ['786'], PY1214: ['780'], PY1215: ['780'], PY1216: ['786'], PY1301: ['336'], PY1302: ['38'],
  PY1303: ['337'], PY1401: ['46'], PY1402: ['345'], PY1403: ['48'], PY1404: ['347'], PY1407: ['47'], PY1408: ['471'],
  PY1409: ['471'], PY1410: ['464'], PY1411: ['453'], PY1415: ['677'], PY1502: ['271'], PY1503: ['498'],
  PY1504: ['226'], PY1505: ['21'], PY1506: ['21'], PY1507: ['424'], PY1508: ['495'], PY1510: ['425'],
  PY1602: ['494'], PY1604: ['491'], PY1605: ['492'], PY1606: ['493'], PY1701: ['497'], PY1705: ['497']
};

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const DEPS = {
  PY00: 'Asunción', PY01: 'Concepción', PY02: 'San Pedro', PY03: 'Cordillera', PY04: 'Guairá', PY05: 'Caaguazú',
  PY06: 'Caazapá', PY07: 'Itapúa', PY08: 'Misiones', PY09: 'Paraguarí', PY10: 'Alto Paraná', PY11: 'Central',
  PY12: 'Ñeembucú', PY13: 'Amambay', PY14: 'Canindeyú', PY15: 'Presidente Hayes', PY16: 'Boquerón', PY17: 'Alto Paraguay',
};
const FIX = { 'R.i. 3 Corrales': 'R.I. 3 Corrales', "Juan E. O'leary": "Juan E. O'Leary" };
const dname = a => FIX[R[a].dname] || R[a].dname;
const codesAt = a => CODES_OF[R[a].district] || [];
const BY = {}; // area code -> area ids
for (const r of DATA.reg) for (const k of codesAt(r.id)) (BY[k] ??= []).push(r.id);
const CODES = Object.keys(BY).sort();
const PREFIX2 = [...new Set(CODES.map(k => k.slice(0, 2)))];
const DIGITS = [...new Set(CODES.map(k => k[0]))];
const withPrefix = p => CODES.filter(k => k.startsWith(p));
const areasWith = p => [...new Set(withPrefix(p).flatMap(k => BY[k]))];
// Departments a set of areas lies in, most districts first.
const depsOf = areas => {
  const n = {};
  for (const a of new Set(areas.map(a => R[a].district))) { const d = DATA.reg.find(r => r.district === a).dep; n[d] = (n[d] || 0) + 1; }
  return Object.keys(n).sort((a, b) => n[b] - n[a]).map(d => DEPS[d]);
};
const districtsOf = k => [...new Set(BY[k].map(dname))];
const list = (xs, n) => xs.length > n ? xs.slice(0, n).join(', ') + ` +${xs.length - n}` : xs.join(', ');
const ZONE = p => list(depsOf(areasWith(p)), 4);
const BIG = ['21', '61', '71', '336', '331', '521', '522', '541', '511', '491', '786', '46', '342', '343', '631', '644', '228', '294'];

const dialFor = p => [['0', 'cold'], [p, 'hot'], ['x'.repeat(Math.max(0, 3 - p.length)), 'cold']];

const QUIZ = {
  key: 'pycodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: codesAt(r.id)[0] ? codesAt(r.id)[0].slice(0, 2) : 'none' })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.2, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[-27.6, -62.7], [-19.3, -54.2]], maxBounds: [[-32, -68], [-15, -50]] },
  hintLabel: 'Color by first two digits',
  exploreKind: 'codes',
  explore: a => ({
    code: codesAt(a).length ? codesAt(a).map(k => '0' + k).join(' / ') : '–', title: dname(a),
    sub: [DEPS[R[a].dep], ...(codesAt(a).length ? [] : ['No area code'])],
  }),
  rounds: [
    { kind: 'digit1', label: 'First digit' },
    { kind: 'codes', label: 'Big cities', preset: 'Big cities' },
    { kind: 'codes', label: 'Asunción & Central', sub: '02x', groups: ['021x', '022x', '027x', '029x'] },
    { kind: 'codes', label: 'Alto Paraná', sub: '06x', groups: ['061x', '063x', '064x', '067x'] },
    { kind: 'codes', label: 'The south', sub: '07x, 08x', groups: PREFIX2.filter(p => p[0] === '7' || p[0] === '8').map(p => `0${p}x`) },
    { kind: 'codes', label: 'The north & the Chaco', sub: '03x, 04x', groups: PREFIX2.filter(p => p[0] === '3' || p[0] === '4').map(p => `0${p}x`) },
    { kind: 'codes', label: 'The centre', sub: '05x', groups: PREFIX2.filter(p => p[0] === '5').map(p => `0${p}x`) },
    { kind: 'digit2', label: 'First two digits' },
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: PREFIX2.map(p => ({ title: `0${p}x`, sub: ZONE(p), ids: withPrefix(p) })),
      presets: [{ label: 'Big cities', ids: BIG }],
      areasOf: k => BY[k],
      primary: a => codesAt(a)[0],
      short: k => '0' + k, name: k => '0' + k,
      about: k => [list(districtsOf(k), 5), list(depsOf(BY[k]), 3)],
      clicked: a => codesAt(a).length ? `${codesAt(a).map(k => '0' + k).join(' / ')}, ${dname(a)}` : `${dname(a)}: no area code`,
      prompt: 'dial',
      detail: { label: 'Show department', text: k => list(depsOf(BY[k]), 2) },
      chip: k => '0' + k, chipTitle: k => list(districtsOf(k), 3),
    },
    {
      key: 'digit2', label: 'First two digits', sub: `${PREFIX2.length} zones`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: DIGITS.map(d => ({ title: `0${d}xx`, sub: ZONE(d), ids: PREFIX2.filter(p => p[0] === d) })),
      areasOf: areasWith,
      primary: a => codesAt(a)[0] && codesAt(a)[0].slice(0, 2),
      short: p => `0${p}x`, name: p => `0${p}x`, about: p => [ZONE(p), list(withPrefix(p).map(k => '0' + k), 6)],
      clicked: a => codesAt(a).length ? `0${codesAt(a)[0].slice(0, 2)}x, ${dname(a)}` : `${dname(a)}: no area code`,
      prompt: 'dial', dial: dialFor,
      hints: false, // the colors are these zones
      chip: p => `0${p}x`, chipTitle: ZONE,
    },
    {
      key: 'digit1', label: 'First digit', sub: 'Beginner', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: 'area codes by first digit', ids: DIGITS }],
      areasOf: areasWith,
      primary: a => codesAt(a)[0] && codesAt(a)[0][0],
      short: d => `0${d}xx`, name: d => `0${d}xx`, about: d => [ZONE(d)],
      clicked: a => codesAt(a).length ? `0${codesAt(a)[0][0]}xx, ${dname(a)}` : `${dname(a)}: no area code`,
      prompt: 'dial', dial: dialFor,
      hints: false, // the colors give the first digit away
      chip: d => `0${d}xx`, chipTitle: ZONE,
    },
  ],
};
