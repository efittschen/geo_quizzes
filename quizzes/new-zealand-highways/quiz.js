// New Zealand State Highways: config for ../shared/area-quiz.js, on the base areas of ../new-zealand-regions/data.js.
// HIGHWAYS (highways.js) lists the areas each state highway runs through. Two-digit numbers go north to south: 10–59 in
// the North Island, 60–99 in the South Island; the first digit is a band of neighbouring districts. Single-digit highways
// (and their lettered spurs) run through many regions. A click on any district a highway runs through counts.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const regionName = rc => rc === 'Area Outside Region' ? 'Chatham Islands' : rc.replace(/ Region$/, '');
const shortTa = ta => ta.replace(/ (District|City|Territory)$/, '');
const SH = Object.keys(HIGHWAYS);
const num = id => parseInt(id, 10);
const isSingle = id => num(id) < 10;
const BANDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const inBand = d => SH.filter(id => !isSingle(id) && String(num(id))[0] === d);
const unique = list => [...new Set(list)];
const tasOf = areas => unique(areas.map(a => shortTa(R[a].ta)));
const regionsOf = areas => unique(areas.map(a => regionName(R[a].rc)));
const list = (xs, n = 4) => xs.length > n ? `${xs.slice(0, n).join(', ')} +${xs.length - n}` : xs.join(', ');
const byNum = (a, b) => num(a) - num(b) || a.localeCompare(b);

const QUIZ = {
  key: 'nzhighways',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.rc === 'Area Outside Region' ? 'CI' : regionName(r.rc) })),
  borders: [],
  context: DATA.inset,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.3, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[-47.4, 166.3], [-34.3, 178.7]], maxBounds: [[-55, 155], [-28, 190]] },
  hintLabel: 'Color by region',
  exploreKind: 'sh',
  explore: id => ({ code: shortTa(R[id].ta), title: regionName(R[id].rc), sub: list(SH.filter(s => HIGHWAYS[s].includes(id)).sort(byNum).map(s => 'SH ' + s), 12) }),
  rounds: [
    { kind: 'bands', label: 'Number bands', sub: '10s to 90s' },
    { kind: 'sh', label: 'Single-digit highways', groups: ['1–8'] },
    { kind: 'sh', label: 'North Island 10–59', groups: ['1x', '2x', '3x', '4x', '5x'] },
    { kind: 'sh', label: 'South Island 60–99', groups: ['6x', '7x', '8x', '9x'] },
    { kind: 'sh', label: 'All state highways' },
  ],
  kinds: [
    {
      key: 'bands', label: 'Number bands', sub: '10s to 90s', noun: ['band', 'bands'], pickTitle: 'Bands to practice',
      groups: [
        { title: 'North Island', sub: '10–59', ids: ['1', '2', '3', '4', '5'] },
        { title: 'South Island', sub: '60–99', ids: ['6', '7', '8', '9'] },
      ],
      areasOf: d => unique(inBand(d).flatMap(id => HIGHWAYS[id])),
      short: d => d + 'x', name: d => `SH ${d}0–${d}9`,
      about: d => [list(regionsOf(unique(inBand(d).flatMap(id => HIGHWAYS[id]))), 5), inBand(d).map(id => id).join(', ')],
      clicked: a => list(BANDS.filter(d => inBand(d).some(id => HIGHWAYS[id].includes(a))).map(d => d + 'x'), 9) || shortTa(R[a].ta),
      prompt: 'dial', dial: d => [[d, 'hot'], ['x', 'cold']],
      hints: false, // the band colors would give the answer away
      chip: d => d + 'x', chipTitle: d => list(regionsOf(unique(inBand(d).flatMap(id => HIGHWAYS[id]))), 5),
    },
    {
      key: 'sh', label: 'State highways', sub: `All ${SH.length}`, noun: ['highway', 'highways'], pickTitle: 'Highways to practice',
      groups: [
        { title: '1–8', sub: 'and spurs', ids: SH.filter(isSingle).sort(byNum) },
        ...BANDS.map(d => ({ title: d + 'x', sub: '', ids: inBand(d).sort(byNum) })),
      ],
      areasOf: id => HIGHWAYS[id],
      merge: false,
      short: id => id, name: id => 'SH ' + id,
      about: id => [list(regionsOf(HIGHWAYS[id]), 5), list(tasOf(HIGHWAYS[id]), 5)],
      clicked: a => `${shortTa(R[a].ta)}: ${list(SH.filter(s => HIGHWAYS[s].includes(a)).sort(byNum), 8) || '–'}`,
      prompt: 'dial', dial: id => [[id, 'hot']],
      chip: id => id, chipTitle: id => list(tasOf(HIGHWAYS[id]), 5),
    },
  ],
};
