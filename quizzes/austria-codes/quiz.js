// Austria Area Codes: config for ../shared/area-quiz.js. Each map area is one of the 1,022 local networks (Ortsnetze)
// of KEM-V 2009; its id is the area code without the 0 (1 Vienna, 316 Graz, 2742 St. Pölten …).

// Generated from the RTR code areas: states each zone covers (5 % of its area or more, largest first; Tyrol in
// zone 4 is East Tyrol), second states of code areas (20 % or more), population of the 200 largest municipalities
// per code (Statistik Austria 2026), and the codes of the 20 largest municipalities.
const ZONE_ST = {"1":["9","3"],"2":["3","1"],"3":["6","1"],"4":["2","7"],"5":["7","8"],"6":["5","4"],"7":["4","3"],"21":["1","3"],"22":["3"],"25":["3"],"26":["3","1"],"27":["3"],"28":["3"],"29":["3"],"31":["6"],"33":["1","6"],"34":["6"],"35":["6"],"36":["6"],"38":["6"],"42":["2"],"43":["2"],"46":["2"],"47":["2"],"48":["7","2"],"51":["7"],"52":["7"],"53":["7"],"54":["7"],"55":["8"],"56":["7"],"61":["4","5"],"62":["5","4"],"64":["5"],"65":["5"],"66":["5"],"72":["4"],"73":["4"],"74":["3"],"75":["4"],"76":["4"],"77":["4"],"79":["4"],"214":["1","3"],"216":["3","1"],"217":["1"],"221":["3"],"223":["3"],"224":["3"],"225":["3","1"],"226":["3"],"227":["3"],"228":["3"],"252":["3"],"253":["3"],"255":["3"],"257":["3"],"261":["1"],"262":["3","1"],"263":["3"],"264":["3","6"],"266":["3"],"267":["3"],"268":["1"],"271":["3"],"272":["3"],"273":["3"],"274":["3"],"275":["3"],"276":["3"],"277":["3"],"278":["3"],"281":["3","4"],"282":["3"],"284":["3"],"285":["3"],"286":["3"],"287":["3"],"291":["3"],"294":["3"],"295":["3"],"298":["3"],"311":["6"],"312":["6"],"313":["6"],"314":["6"],"315":["6"],"316":["6"],"317":["6"],"318":["6"],"332":["1"],"333":["6"],"335":["1"],"336":["1"],"338":["6","1"],"345":["6"],"346":["6"],"347":["6"],"351":["6"],"353":["6"],"357":["6"],"358":["6"],"361":["6"],"362":["6"],"363":["6","4"],"368":["6"],"383":["6"],"384":["6"],"385":["6"],"386":["6"],"388":["6","3"],"421":["2"],"422":["2"],"423":["2"],"424":["2"],"425":["2"],"426":["2"],"427":["2"],"428":["2"],"435":["2"],"463":["2"],"471":["2"],"473":["2"],"476":["2"],"478":["2"],"482":["2"],"484":["7"],"485":["7"],"487":["7"],"512":["7"],"521":["7"],"522":["7"],"523":["7"],"524":["7"],"525":["7"],"526":["7"],"527":["7"],"528":["7"],"533":["7"],"535":["7"],"537":["7"],"541":["7"],"544":["7"],"547":["7"],"551":["8"],"552":["8"],"555":["8"],"557":["8"],"558":["8"],"563":["7"],"567":["7"],"613":["4","5"],"621":["5","4"],"622":["5"],"623":["4","5"],"624":["5"],"627":["5","4"],"641":["5"],"643":["5"],"645":["5","6"],"646":["5"],"647":["5"],"648":["5"],"654":["5"],"656":["5"],"658":["5"],"662":["5"],"721":["4"],"722":["4"],"723":["4"],"724":["4"],"725":["4","3"],"726":["4","3"],"727":["4"],"728":["4"],"732":["4"],"735":["4"],"741":["3"],"743":["3"],"744":["3"],"747":["3"],"748":["3"],"756":["4"],"758":["4"],"761":["4"],"766":["4","5"],"767":["4"],"768":["4"],"771":["4"],"772":["4"],"773":["4"],"774":["4"],"775":["4"],"776":["4"],"794":["4"],"795":["4"]};
const ALSO_ST = {"2143":["3"],"2145":["1"],"2162":["1"],"2164":["1"],"2255":["3"],"2624":["1"],"2649":["3"],"2813":["4"],"3382":["1"],"3460":["2"],"3631":["6"],"3882":["3"],"3883":["3"],"4736":["5"],"6137":["4"],"6138":["4"],"6213":["5"],"6217":["4"],"6454":["6"],"7250":["3"],"7252":["3"],"7260":["3"],"7665":["5"],"2664":["6"],"2665":["6"]};
const CODE_POP = {"1":2084952,"316":326782,"732":243433,"662":172286,"512":149748,"463":113897,"4242":66051,"7242":65764,"2742":60112,"5572":52252,"2622":50025,"7252":44527,"5522":55484,"5574":69476,"2243":28153,"2252":65024,"2732":25581,"7229":43665,"4352":25011,"5577":24704,"3842":24455,"7472":23980,"3862":37404,"6245":21607,"2236":60968,"5372":20118,"5576":24827,"7722":17534,"2266":17363,"6582":17360,"2272":16758,"5262":16467,"2682":16396,"4762":21944,"5552":14994,"7243":14942,"2630":14637,"5223":21999,"5242":14581,"4276":14558,"5332":20529,"6132":14137,"2262":13790,"3452":20054,"3152":13369,"7612":23116,"7672":20190,"2635":12984,"7752":12965,"3512":12792,"3124":21060,"2952":12573,"5523":12426,"2282":12348,"2287":12324,"3172":12212,"7223":12191,"4212":12178,"2249":12156,"2246":12142,"4852":12105,"2254":12017,"2572":11976,"6212":11722,"3462":11675,"6412":11593,"3112":11554,"5412":11076,"7442":11053,"3847":10960,"6462":10804,"4232":10803,"2822":10710,"3382":10358,"6542":10217,"2231":9931,"7259":9910,"5352":9908,"4358":9836,"7613":9726,"4254":9591,"3144":9557,"7262":9519,"3142":9517,"3572":9441,"2247":9389,"7674":9360,"7435":9291,"3135":9265,"4274":9171,"7235":15801,"2162":8895,"3463":8877,"2167":8867,"2672":8815,"2772":8633,"5578":8592,"2235":8403,"5238":8291,"5356":8284,"7942":8244,"6215":8219,"5224":8198,"2244":8197,"3865":8132,"3352":8130,"3612":8081,"2242":7982,"7221":14639,"2782":7961,"2233":7897,"7614":7890,"2623":7849,"2274":7799,"5442":7766,"7742":7763,"7224":14016,"5244":7669,"3573":7656,"3852":7648,"2245":7575,"2626":7563,"6244":7557,"4227":7537,"6135":7525,"2734":7470,"5672":7420,"3137":7418,"6133":7396,"6246":7385,"3117":7385,"3136":7191,"6225":7175,"4255":7171,"3155":7168,"2165":7055,"3577":7055,"7583":7039,"4282":6930,"7227":6915,"6216":6720,"5573":6703,"6432":6698,"3332":6687,"3126":6681,"2746":6624,"3687":6616,"3453":6584,"2783":6529,"5525":6502,"7246":6497,"2982":6489,"3856":6371,"5234":6343,"6235":6243,"7226":6235,"2522":6206,"3466":6164,"7274":6137,"6272":6124,"6243":6014,"4236":5983,"7434":5977};
const BIG = ["1", "316", "732", "662", "512", "463", "4242", "7242", "2742", "5572", "2622", "7252", "5522", "5574", "2243", "2252", "2732", "7229", "4352"];

const ST = { 1: 'Burgenland', 2: 'Carinthia', 3: 'Lower Austria', 4: 'Upper Austria', 5: 'Salzburg', 6: 'Styria', 7: 'Tyrol', 8: 'Vorarlberg', 9: 'Vienna' };
const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const CODES = DATA.reg.map(r => r.id).sort();
const has = new Set(CODES);
// Zone of a code by its first n digits (Vienna's 1 is its own zone at every level).
const zoneOf = (k, n) => k.slice(0, n);
const zones = n => [...new Set(CODES.map(k => zoneOf(k, n)))];
const DIGIT1 = zones(1), DIGIT2 = zones(2), DIGIT3 = zones(3);
const codesIn = z => CODES.filter(k => k.startsWith(z));
const areasIn = codesIn;
// "02 6xx": a zone shows its digits, then x's up to its longest code; a zone that is a whole code shows just it.
const pad = z => has.has(z) ? '' : 'x'.repeat(Math.max(...codesIn(z).map(k => k.length)) - z.length);
const zoneLabel = z => `0${z}${pad(z)}`;
const dialFor = z => [['0', 'cold'], [z, 'hot'], ...(pad(z) ? [[pad(z), 'cold']] : [])];
const stateName = (s, z) => s === '7' && z[0] === '4' ? 'East Tyrol' : ST[s];
const statesOf = z => (ZONE_ST[z] || [R[codesIn(z)[0]].st]).map(s => stateName(s, z)).join(', ');
const codeStates = k => [R[k].st, ...(ALSO_ST[k] || [])].map(s => stateName(s, k)).join(', ');
// Examples: the codes of the zone's largest towns.
const examples = z => codesIn(z).slice().sort((a, b) => (CODE_POP[b] || 0) - (CODE_POP[a] || 0)).slice(0, 3).map(k => `0${k} ${R[k].name}`).join(' · ');
const zoneClicked = n => area => `${zoneLabel(zoneOf(area, n))} · ${R[area].name}`;
const BY_POP = CODES.slice().sort((a, b) => (CODE_POP[b] || 0) - (CODE_POP[a] || 0));

const zoneKind = (key, n, ids, label, groups) => ({
  key, label, sub: `${ids.length} zones`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
  groups,
  areasOf: areasIn,
  short: zoneLabel, name: zoneLabel, about: z => [statesOf(z), examples(z)],
  clicked: zoneClicked(n),
  prompt: 'dial', dial: dialFor,
  hints: n > 2, // coloring by the first two digits would give the first and second digits away
  chip: zoneLabel, chipTitle: statesOf,
});

const QUIZ = {
  key: 'atcodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.id.slice(0, 2) })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 60, labelScale: 0.3, fly: { pad: 1.8, min: 1.5 / 60 },
  geo: GEO,
  street: { bounds: [[46.37, 9.53], [49.02, 17.16]], maxBounds: [[43, 4], [52, 23]] },
  hintLabel: 'Color by first two digits',
  exploreKind: 'codes',
  explore: id => ({ code: '0' + id, title: R[id].name, sub: codeStates(id) }),
  rounds: [
    { kind: 'digit1', label: 'First digit' },
    { kind: 'codes', label: 'Big cities', preset: 'Big cities' },
    { kind: 'digit2', label: 'First two digits' },
    ...DIGIT1.filter(d => d !== '1').map(d => ({ kind: 'digit3', label: `First three digits: ${zoneLabel(d)}`, sub: statesOf(d), groups: [zoneLabel(d)] })),
    { kind: 'codes', label: '50 largest areas', top: 50 },
    { kind: 'digit3', label: 'First three digits' },
    ...DIGIT1.filter(d => d !== '1').map(d => ({ kind: 'codes', label: `All ${zoneLabel(d)} codes`, sub: statesOf(d), groups: DIGIT2.filter(z => z[0] === d).map(zoneLabel) })),
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', label: 'Area codes', sub: `All ${CODES.length.toLocaleString('en-US')}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: DIGIT2.map(z => ({ title: zoneLabel(z), sub: statesOf(z), ids: codesIn(z) })),
      presets: [{ label: 'Big cities', ids: BIG }],
      rankings: [{ label: 'population', order: BY_POP }],
      areasOf: k => [k],
      short: k => '0' + k, name: k => '0' + k,
      about: k => [R[k].name, codeStates(k)],
      clicked: area => `0${area} · ${R[area].name}`,
      prompt: 'dial',
      detail: { label: 'Show state', text: codeStates },
      chip: k => '0' + k, chipTitle: k => R[k].name,
    },
    zoneKind('digit3', 3, DIGIT3, 'First three digits', DIGIT1.map(d => ({ title: zoneLabel(d), sub: statesOf(d), ids: DIGIT3.filter(z => z[0] === d) }))),
    zoneKind('digit2', 2, DIGIT2, 'First two digits', DIGIT1.map(d => ({ title: zoneLabel(d), sub: statesOf(d), ids: DIGIT2.filter(z => z[0] === d) }))),
    { ...zoneKind('digit1', 1, DIGIT1, 'First digit', [{ title: 'Zones', sub: '', ids: DIGIT1 }]), sub: 'Beginner' },
  ],
};
