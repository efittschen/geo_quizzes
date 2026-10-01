// Austria Regions and Austria Road Numbers: config for ../shared/area-quiz.js. Map areas are the political districts
// (Vienna as one), with every municipality that has bilingual town signs drawn on its own; all from Statistik Austria's
// 2026 municipalities. Kinds: the 9 states; the 3 bilingual-sign areas; the B-road number blocks (each district
// goes to the block with most B-road length in it); every B road (the districts it runs through).
// austria-regions/index.html shows "states signs", austria-roads/index.html "blocks roads".

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const AREA_IDS = DATA.reg.map(r => r.id);
const STATES = {
  1: ['Burgenland', 'Burgenland', 'Eisenstadt', 'Bgld.'], 2: ['Carinthia', 'Kärnten', 'Klagenfurt', 'Ktn.'],
  3: ['Lower Austria', 'Niederösterreich', 'St. Pölten', 'NÖ'], 4: ['Upper Austria', 'Oberösterreich', 'Linz', 'OÖ'],
  5: ['Salzburg', 'Salzburg', 'Salzburg', 'Sbg.'], 6: ['Styria', 'Steiermark', 'Graz', 'Stmk.'],
  7: ['Tyrol', 'Tirol', 'Innsbruck', 'T'], 8: ['Vorarlberg', 'Vorarlberg', 'Bregenz', 'Vbg.'], 9: ['Vienna', 'Wien', 'Vienna', 'W'],
};
const ST_IDS = Object.keys(STATES);
const stName = s => STATES[s][0];
// Districts named like a bilingual municipality drawn on its own (Oberwart, Oberpullendorf) say "district".
const MUNI_NAMES = new Set(AREA_IDS.filter(a => a[0] === 'm').map(a => R[a].name));
const areaName = a => R[a].name === 'Wien(Stadt)' ? 'Vienna' : MUNI_NAMES.has(R[a].name) && a[0] === 'd' ? `${R[a].name} (district)`
  : R[a].name.replace(/\(Stadt\)$|[ -]Stadt$/, ' (city)').replace(/^Stadt (.*)$/, '$1 (city)').replace(/\(Land\)$/, ' (district)');

// Bilingual town signs
const LANGS = { sl: ['German–Slovene', 'Slovene', 'Carinthia'], hr: ['German–Croatian', 'Croatian', 'Burgenland'], hu: ['German–Hungarian', 'Hungarian', 'Burgenland'] };
const LANG_IDS = ['sl', 'hr', 'hu'];
const signAreas = l => AREA_IDS.filter(a => R[a].langs.split(' ').includes(l));
const pick = a => a[Math.random() * a.length | 0];

// B-road blocks and roads
const BLOCKS = {
  1: 'B 1–49 · B 209–233', 50: 'B 50–63', 64: 'B 64–78', 80: 'B 80–111', 112: 'B 112–117',
  119: 'B 119–149', 150: 'B 150–168', 169: 'B 169–189 · B 197–199', 190: 'B 190–205',
};
const BLOCK_IDS = Object.keys(BLOCKS).sort((a, b) => a - b);
const blockAreas = b => AREA_IDS.filter(a => R[a].blk === b);
const blockStates = b => [...new Set(blockAreas(b).map(a => R[a].st))].map(stName).join(', ');
const RD = Object.fromEntries(ROADS.map(([nr, name, km, units]) => [nr, { nr, name, km, units }]));
const ROAD_IDS = ROADS.map(r => r[0]);
const ROAD_GROUPS = [[1, 49], [50, 63], [64, 78], [80, 111], [112, 117], [119, 149], [150, 168], [169, 189], [190, 205], [209, 233], [300, 399]];
const roadGroup = nr => { const n = parseInt(nr); return n >= 197 && n <= 199 ? 7 : ROAD_GROUPS.findIndex(([a, z]) => n >= a && n <= z); };
const groupTitle = ([a, z]) => a === 169 ? 'B 169–189 · 197–199' : a === 300 ? 'B 301–320' : `B ${a}–${z}`;
const roadStates = nr => [...new Set(RD[nr].units.map(a => R[a].st))].map(stName).join(', ');
const roadsAt = a => ROAD_IDS.filter(nr => RD[nr].units.includes(a));

const QUIZ = {
  key: 'atregions',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.st })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.25, fly: { pad: 1.8, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[46.37, 9.53], [49.02, 17.16]], maxBounds: [[43, 4], [52, 23]] },
  hintLabel: 'Color by state',
  exploreKind: 'states',
  explore: a => ({
    code: STATES[R[a].st][3], title: areaName(a),
    sub: [stName(R[a].st), ...(R[a].langs ? [R[a].langs.split(' ').map(l => LANGS[l][0]).join(', ')] : []), `B ${roadsAt(a).join(', ')}`],
  }),
  rounds: [
    { kind: 'states', label: 'States' },
    { kind: 'signs', label: 'Bilingual town signs' },
    { kind: 'blocks', label: 'Number blocks' },
    ...ROAD_GROUPS.map(g => ({ kind: 'roads', label: groupTitle(g), groups: [groupTitle(g)] })),
    { kind: 'roads', label: 'Longest 50', top: 50 },
    { kind: 'roads', label: 'All B roads' },
  ],
  kinds: [
    {
      key: 'states', label: 'States', sub: 'All 9 by name', noun: ['state', 'states'], pickTitle: 'States to practice',
      groups: [{ title: 'States', sub: '', ids: ST_IDS }],
      areasOf: s => AREA_IDS.filter(a => R[a].st === s),
      short: stName, name: stName,
      about: s => [STATES[s][1], `Capital: ${STATES[s][2]}`],
      clicked: a => stName(R[a].st),
      prompt: 'name',
      hints: false, // the colors are the states
      chip: stName, chipTitle: s => STATES[s][1],
    },
    {
      key: 'signs', label: 'Bilingual signs', sub: 'Slovene, Croatian, Hungarian', noun: ['sign area', 'sign areas'], pickTitle: 'Sign languages to practice',
      groups: [{ title: 'Languages', sub: '', ids: LANG_IDS }],
      areasOf: signAreas,
      short: l => LANGS[l][1], name: l => LANGS[l][0],
      about: l => [`${LANGS[l][2]} · ${SIGNS[l].length} places in ${SIGN_MUNIS[l]} municipalities`, SIGNS[l].slice(0, 3).map(p => p.join(' / ')).join(' · ')],
      clicked: a => R[a].langs ? `${areaName(a)} · ${R[a].langs.split(' ').map(l => LANGS[l][1]).join(', ')}` : areaName(a),
      prompt: 'text', text: l => ({ text: pick(SIGNS[l]).join('\n'), cls: 'osign', lang: l }),
      chip: l => LANGS[l][0], chipTitle: l => LANGS[l][2],
    },
    {
      key: 'blocks', label: 'Number blocks', sub: `${BLOCK_IDS.length} blocks`, noun: ['block', 'blocks'], pickTitle: 'Blocks to practice',
      groups: [{ title: 'Blocks', sub: '', ids: BLOCK_IDS }],
      areasOf: blockAreas,
      short: b => BLOCKS[b], name: b => BLOCKS[b],
      about: b => blockStates(b),
      clicked: a => `${areaName(a)} · ${BLOCKS[R[a].blk]}`,
      prompt: 'name',
      hints: false, // block areas follow the states
      chip: b => BLOCKS[b], chipTitle: blockStates,
    },
    {
      key: 'roads', label: 'B roads', sub: `All ${ROAD_IDS.length}`, noun: ['road', 'roads'], pickTitle: 'Roads to practice',
      groups: ROAD_GROUPS.map(g => ({ title: groupTitle(g), sub: '', ids: ROAD_IDS.filter(nr => roadGroup(nr) === ROAD_GROUPS.indexOf(g)) })),
      rankings: [{ label: 'length', order: ROAD_IDS.slice().sort((a, b) => RD[b].km - RD[a].km) }],
      areaRank: false,
      merge: false,
      areasOf: nr => RD[nr].units,
      short: nr => `B ${nr}`, name: nr => `B ${nr}`,
      about: nr => [RD[nr].name, roadStates(nr)],
      clicked: a => `${areaName(a)} · B ${roadsAt(a).slice(0, 12).join(', ')}${roadsAt(a).length > 12 ? ' …' : ''}`,
      prompt: 'text', text: nr => ({ text: nr, cls: 'bsign', lang: 'de' }),
      flashArea: true,
      chip: nr => `B ${nr}`, chipTitle: nr => RD[nr].name,
    },
  ],
};
