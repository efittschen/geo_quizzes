// Sri Lanka Area Codes: config for ../shared/area-quiz.js, on the map of ../sri-lanka-regions (339 Divisional
// Secretariat divisions, HDX COD-AB v03). Codes: TRCSL Numbering Plan, Annex 1 (29 geographic codes, 0 + 2 digits).
// No official extent per code exists, so each DS division gets the code of its DS office's landline (Ministry of Home
// Affairs DS contact list, 2021; DMC list for gaps), else the code most dialled in it on OpenStreetMap (phone tags), else
// its neighbours' code (new divisions, Kilinochchi): code areas are approximate.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
// code -> [town, x, y, lat, lng] (GeoNames), the place TRCSL names for the code
const TOWN = {"11":["Colombo",136.3,1243.1,6.93548,79.84868],"21":["Jaffna",205.8,71.6,9.66845,80.00742],"23":["Mannar",150.7,362.5,8.98945,79.87842],"24":["Vavuniya",412.6,464.9,8.7514,80.4971],"25":["Anuradhapura",376.8,653.2,8.31223,80.41306],"26":["Trincomalee",722.6,539.2,8.5778,81.2289],"27":["Polonnaruwa",627,812.9,7.93965,81.00274],"31":["Negombo",131.1,1126.1,7.2083,79.8358],"32":["Chilaw",114.2,968.5,7.57583,79.79528],"33":["Gampaha",197.6,1177.1,7.0897,79.9925],"34":["Kalutara",183.1,1394.2,6.5831,79.9593],"35":["Kegalle",347,1107.6,7.2523,80.3436],"36":["Avissawella",289,1235.8,6.953,80.2075],"37":["Kurunegala",357.6,1008.3,7.4839,80.3683],"38":["Panadura",159.1,1338.4,6.7132,79.9026],"41":["Matara",428.2,1666.5,5.94851,80.53528],"45":["Ratnapura",372.3,1350.4,6.6858,80.4036],"47":["Hambantota",676.9,1591.1,6.1241,81.1185],"51":["Hatton",454,1262.3,6.8916,80.5955],"52":["Nuwara Eliya",533.7,1228.3,6.97078,80.78286],"54":["Nawalapitiya",427.1,1192.9,7.0534,80.5321],"55":["Badulla",650.7,1224.2,6.9802,81.0577],"57":["Bandarawela",619.9,1287.2,6.8334,80.9853],"63":["Ampara",915.9,1087.8,7.29754,81.68202],"65":["Batticaloa",919.9,910.8,7.7102,81.6924],"66":["Matale",465.2,1014.4,7.4698,80.6217],"67":["Kalmunai",980.7,1039.8,7.40902,81.83472],"81":["Kandy",470.3,1091.2,7.2906,80.6336],"91":["Galle",289.7,1624.5,6.0461,80.2103]};
const TOWN_DIST = { 31: 'Gampaha', 32: 'Puttalam', 36: 'Colombo', 38: 'Kalutara', 51: 'Nuwara Eliya', 54: 'Kandy', 57: 'Badulla', 67: 'Ampara' };
// code -> DS divisions dialling it
const CODE_DS = {"11":["LK1103","LK1106","LK1109","LK1112","LK1118","LK1121","LK1124","LK1127","LK1130","LK1131","LK1133","LK1136","LK1215","LK1218","LK1221","LK1233","LK1236","LK1239"],"21":["LK4103","LK4104","LK4106","LK4109","LK4112","LK4115","LK4118","LK4121","LK4124","LK4127","LK4130","LK4133","LK4136","LK4139","LK4142","LK4403","LK4406","LK4409","LK4412","LK4415","LK4503","LK4506","LK4509","LK4512"],"23":["LK4203","LK4206","LK4209","LK4212","LK4215"],"24":["LK4303","LK4306","LK4309","LK4312"],"25":["LK4418","LK5303","LK7103","LK7106","LK7109","LK7112","LK7115","LK7118","LK7121","LK7124","LK7127","LK7130","LK7133","LK7136","LK7139","LK7142","LK7145","LK7148","LK7151","LK7154","LK7157","LK7160","LK7163","LK7166"],"26":["LK5306","LK5309","LK5312","LK5315","LK5318","LK5321","LK5324","LK5327","LK5330","LK5333"],"27":["LK5203","LK7203","LK7206","LK7209","LK7210","LK7212","LK7215"],"31":["LK1203","LK1206","LK1209","LK6245","LK6248"],"32":["LK6142","LK6203","LK6206","LK6209","LK6212","LK6215","LK6218","LK6221","LK6224","LK6227","LK6230","LK6233","LK6236","LK6239","LK6242"],"33":["LK1212","LK1224","LK1227","LK1230"],"34":["LK1309","LK1310","LK1312","LK1315","LK1318","LK1321","LK1324","LK1327","LK1330","LK1333","LK1336","LK1339","LK3103"],"35":["LK9203","LK9206","LK9209","LK9212","LK9215","LK9218"],"36":["LK1115","LK9103","LK9221","LK9224","LK9227","LK9230","LK9233"],"37":["LK6103","LK6106","LK6109","LK6112","LK6115","LK6118","LK6121","LK6124","LK6127","LK6130","LK6133","LK6136","LK6139","LK6145","LK6148","LK6149","LK6151","LK6154","LK6157","LK6160","LK6163","LK6166","LK6169","LK6172","LK6175","LK6178","LK6181","LK6184","LK6187"],"38":["LK1303","LK1306"],"41":["LK3203","LK3206","LK3209","LK3212","LK3215","LK3218","LK3221","LK3224","LK3227","LK3230","LK3233","LK3236","LK3239","LK3242","LK3245","LK3248"],"45":["LK9106","LK9109","LK9112","LK9115","LK9118","LK9121","LK9124","LK9127","LK9130","LK9133","LK9136","LK9139","LK9142","LK9145","LK9151","LK9154"],"47":["LK3303","LK3306","LK3309","LK3312","LK3315","LK3318","LK3321","LK3324","LK3325","LK3327","LK3330","LK3333","LK8227","LK8230","LK8233","LK9148"],"51":["LK2315","LK2327","LK2330"],"52":["LK2303","LK2309","LK2312","LK2318","LK2324"],"54":["LK2157","LK2321"],"55":["LK2121","LK8103","LK8106","LK8109","LK8112","LK8115","LK8118","LK8119","LK8121","LK8124","LK8203","LK8206","LK8209","LK8212","LK8215","LK8218","LK8221","LK8224"],"57":["LK8127","LK8130","LK8133","LK8136","LK8139","LK8142"],"63":["LK5206","LK5209","LK5212","LK5215","LK5234","LK5242","LK5248","LK5251"],"65":["LK5103","LK5104","LK5106","LK5109","LK5110","LK5115","LK5118","LK5121","LK5124","LK5127","LK5130","LK5133","LK5136","LK5139"],"66":["LK2203","LK2206","LK2209","LK2212","LK2215","LK2218","LK2221","LK2224","LK2227","LK2230","LK2233","LK7218"],"67":["LK5216","LK5218","LK5221","LK5225","LK5227","LK5230","LK5233","LK5236","LK5239","LK5245"],"81":["LK2103","LK2106","LK2109","LK2112","LK2115","LK2118","LK2124","LK2127","LK2130","LK2133","LK2134","LK2136","LK2139","LK2142","LK2145","LK2148","LK2151","LK2154","LK2306"],"91":["LK3106","LK3109","LK3112","LK3115","LK3118","LK3121","LK3124","LK3127","LK3130","LK3133","LK3134","LK3136","LK3139","LK3142","LK3145","LK3148","LK3151","LK3154","LK3157","LK3160","LK3163"]};
const DIST = {
  LK11: 'Colombo', LK12: 'Gampaha', LK13: 'Kalutara', LK21: 'Kandy', LK22: 'Matale', LK23: 'Nuwara Eliya', LK31: 'Galle',
  LK32: 'Matara', LK33: 'Hambantota', LK41: 'Jaffna', LK42: 'Mannar', LK43: 'Vavuniya', LK44: 'Mullaitivu',
  LK45: 'Kilinochchi', LK51: 'Batticaloa', LK52: 'Ampara', LK53: 'Trincomalee', LK61: 'Kurunegala', LK62: 'Puttalam',
  LK71: 'Anuradhapura', LK72: 'Polonnaruwa', LK81: 'Badulla', LK82: 'Monaragala', LK91: 'Ratnapura', LK92: 'Kegalle',
};
const CODE_OF = {};
for (const [k, ids] of Object.entries(CODE_DS)) for (const id of ids) CODE_OF[id] = k;
const CODES = Object.keys(CODE_DS).sort();
const DIGITS = [...new Set(CODES.map(k => k[0]))];
const withDigit = d => CODES.filter(k => k[0] === d);
const areasWith = d => withDigit(d).flatMap(k => CODE_DS[k]);
const ZONES = {
  1: 'Colombo', 2: 'North & North Central', 3: 'West & North West', 4: 'South & Ratnapura',
  5: 'Hill country & Uva', 6: 'East & Matale', 8: 'Kandy', 9: 'Galle',
};
const BIG = ['11', '21', '31', '81', '26', '67', '91', '65', '41', '25'];
const town = k => TOWN[k][0];
const townDist = k => TOWN_DIST[k] || town(k);
const districts = k => [...new Set(CODE_DS[k].map(id => DIST[R[id].dt]))].join(', ');
const zoneShort = d => `0${d}x`;

const QUIZ = {
  key: 'lkcodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: CODE_OF[r.id][0] })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.26, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[5.85, 79.45], [9.9, 81.95]], maxBounds: [[3, 76], [12.5, 85]] },
  hintLabel: 'Color by first digit',
  exploreKind: 'codes',
  explore: a => ({ code: '0' + CODE_OF[a], title: town(CODE_OF[a]), sub: [`${R[a].n} DS division`, `${DIST[R[a].dt]} District`] }),
  rounds: [
    { kind: 'digit1', label: 'First digit' },
    { kind: 'codes', label: 'North', sub: '02x', groups: ['02x'] },
    { kind: 'codes', label: 'West', sub: '01x, 03x', groups: ['01x', '03x'] },
    { kind: 'codes', label: 'South', sub: '04x, 09x', groups: ['04x', '09x'] },
    { kind: 'codes', label: 'Big cities', preset: 'Big cities' },
    { kind: 'codes', label: 'Hills & East', sub: '05x, 06x, 08x', groups: ['05x', '06x', '08x'] },
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: DIGITS.map(d => ({ title: zoneShort(d), sub: ZONES[d], ids: withDigit(d) })),
      presets: [{ label: 'Big cities', ids: BIG }],
      areasOf: k => CODE_DS[k],
      primary: a => CODE_OF[a],
      short: k => '0' + k, name: k => '0' + k,
      about: k => [`${town(k)} · ${townDist(k)} District`, districts(k)],
      clicked: a => `0${CODE_OF[a]}, ${town(CODE_OF[a])}`,
      prompt: 'dial', dial: k => [['0', 'cold'], [k, 'hot']],
      detail: { label: 'Show town', text: k => town(k) },
      pin: k => ({ x: TOWN[k][1], y: TOWN[k][2], ll: [TOWN[k][3], TOWN[k][4]], label: `0${k} ${town(k)}` }),
      chip: k => '0' + k, chipTitle: k => town(k),
    },
    {
      key: 'digit1', label: 'First digit', sub: `${DIGITS.length} zones`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: 'area codes by first digit', ids: DIGITS }],
      areasOf: areasWith,
      primary: a => CODE_OF[a][0],
      short: zoneShort, name: zoneShort,
      about: d => [ZONES[d], withDigit(d).map(k => `0${k} ${town(k)}`).join(', ')],
      clicked: a => `${zoneShort(CODE_OF[a][0])} (${ZONES[CODE_OF[a][0]]})`,
      prompt: 'dial', dial: d => [['0', 'cold'], [d, 'hot'], ['x', 'cold']],
      hints: false, // the colors give the first digit away
      chip: zoneShort, chipTitle: d => ZONES[d],
    },
  ],
};
