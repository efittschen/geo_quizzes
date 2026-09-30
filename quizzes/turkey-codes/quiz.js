// Turkey Area Codes: config for ../shared/area-quiz.js. Each map area is a province with one area code; İstanbul has
// two (212 on the European side, 216 on the Asian side).

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const BY = {}; // area code -> area ids
for (const r of DATA.reg) for (const k of r.k) (BY[k] ??= []).push(r.id);
const CODES = Object.keys(BY).sort();
const PREFIX2 = [...new Set(CODES.map(k => k.slice(0, 2)))];
const DIGITS = [...new Set(CODES.map(k => k[0]))];
const withPrefix = p => CODES.filter(k => k.startsWith(p));
const areasWith = p => [...new Set(withPrefix(p).flatMap(k => BY[k]))];
const BIG = ['212', '216', '312', '232', '224', '242', '322', '332', '342', '352', '462', '412', '362', '222', '324', '262'];
const ZONES = { 2: 'the west: Marmara, the Aegean and the Antalya coast', 3: 'the centre, the eastern Mediterranean coast and the western Black Sea', 4: 'the east, the south-east and the eastern Black Sea' };
const ZONES2 = {
  21: 'İstanbul', 22: 'Bursa, Eskişehir, Yalova, Bilecik', 23: 'İzmir, Manisa', 24: 'Antalya, Isparta, Burdur', 25: 'Muğla, Aydın, Denizli',
  26: 'Kocaeli, Sakarya, Balıkesir', 27: 'Afyon, Kütahya, Uşak', 28: 'Thrace and Çanakkale', 31: 'Ankara, Kırıkkale', 32: 'Adana, Mersin, Hatay, Osmaniye',
  33: 'Konya, Karaman', 34: 'Gaziantep, Maraş, Kilis, and Sivas', 35: 'Kayseri, Yozgat, Tokat, Amasya', 36: 'Samsun, Çorum, Kastamonu, Sinop',
  37: 'Zonguldak, Karabük, Bartın, Bolu, Çankırı', 38: 'Cappadocia (Nevşehir, Niğde, Aksaray, Kırşehir), and Düzce', 41: 'Diyarbakır, Şanlıurfa, Adıyaman',
  42: 'Malatya, Elazığ, Bingöl, Tunceli', 43: 'Van, Bitlis, Muş, Hakkari', 44: 'Erzurum, Erzincan', 45: 'Ordu, Giresun, Gümüşhane, Bayburt',
  46: 'Trabzon, Rize, Artvin', 47: 'Ağrı, Kars, Iğdır, Ardahan', 48: 'Mardin, Siirt, Şırnak, Batman',
};
const place = k => BY[k].map(id => `${R[id].ct[0]}, ${R[id].st}`).join(' and ');

// Zone modes show just the zone's digits, padded with x's to the code length ("021x").
const dialFor = p => [['0', 'cold'], [p, 'hot'], ['x'.repeat(3 - p.length), 'cold']];
const examples = p => withPrefix(p).slice(0, 3).map(k => `0${k} ${R[BY[k][0]].ct[0]}`).join(', ');

const QUIZ = {
  key: 'trcodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.k[0].slice(0, 2) })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[35.8, 25.6], [42.2, 44.9]], maxBounds: [[30, 15], [47, 55]] },
  hintLabel: 'Color by first two digits',
  exploreKind: 'codes',
  explore: id => ({ code: '0' + R[id].k[0], title: R[id].ct[0], sub: `${R[id].st} region` }),
  rounds: [
    { kind: 'digit1', label: 'First digit' },
    { kind: 'codes', label: 'Big cities', preset: 'Big cities' },
    { kind: 'digit2', label: 'First two digits' },
    { kind: 'codes', label: '40 largest areas', top: 40 },
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', labelPerArea: true, clickAll: true, label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: PREFIX2.map(p => ({ title: `0${p}x`, sub: ZONES2[p], ids: withPrefix(p) })),
      presets: [{ label: 'Big cities', ids: BIG }],
      areasOf: k => BY[k],
      short: k => '0' + k, name: k => '0' + k,
      about: k => [place(k), `0${k.slice(0, 2)}x: ${ZONES2[k.slice(0, 2)]}`],
      clicked: id => `0${R[id].k[0]}, ${R[id].ct[0]}`,
      prompt: 'dial',
      detail: { label: 'Show region', text: k => `${R[BY[k][0]].st} region` },
      chip: k => '0' + k, chipTitle: place,
    },
    {
      key: 'digit2', label: 'First two digits', sub: `${PREFIX2.length} zones`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: DIGITS.map(d => ({ title: `0${d}xx`, sub: '', ids: PREFIX2.filter(p => p[0] === d) })),
      areasOf: areasWith,
      short: p => `0${p}x`, name: p => `0${p}x`, about: p => [ZONES2[p], examples(p)],
      clicked: id => `0${R[id].k[0].slice(0, 2)}x (${ZONES2[R[id].k[0].slice(0, 2)]})`,
      prompt: 'dial', dial: dialFor,
      hints: false, // the colors are these zones
      chip: p => `0${p}x`, chipTitle: p => ZONES2[p],
    },
    {
      key: 'digit1', label: 'First digit', sub: 'Beginner', noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: [{ title: 'Zones', sub: 'area codes by first digit', ids: DIGITS }],
      areasOf: areasWith,
      short: d => `0${d}xx`, name: d => `0${d}xx`, about: d => ZONES[d],
      clicked: id => `0${R[id].k[0][0]}xx (${ZONES[R[id].k[0][0]]})`,
      prompt: 'dial', dial: dialFor,
      hints: false, // the colors give the first digit away
      chip: d => `0${d}xx`, chipTitle: d => ZONES[d],
    },
  ],
};
