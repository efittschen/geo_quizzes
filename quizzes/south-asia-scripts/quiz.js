// South Asia Scripts: config for ../shared/area-quiz.js. Read a sign and click where you'd see it.
// Each map area is a state/territory or country; each script is written in several of them.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const SC = SA.scripts, SENT = SA.sentences;
const SCRIPT_KEYS = Object.keys(SC);
// Scripts written in each area, main one first (Jammu and Kashmir: Urdu before Devanagari).
const PRIMARY = { JK: 'arab' };
const RS = {};
for (const s of SCRIPT_KEYS) for (const id of SC[s].r) (RS[id] ??= []).push(s);
for (const id in PRIMARY) RS[id] = [PRIMARY[id], ...RS[id].filter(s => s !== PRIMARY[id])];
// Language tags for each sign, so fonts use each language's own letter shapes (Marathi and Nepali aren't Hindi).
const LANG = {
  Hindi: 'hi', Marathi: 'mr', Nepali: 'ne', Bengali: 'bn', Assamese: 'as', Punjabi: 'pa', Gujarati: 'gu', Odia: 'or',
  Telugu: 'te', Kannada: 'kn', Malayalam: 'ml', Tamil: 'ta', Urdu: 'ur', Dzongkha: 'dz', Ladakhi: 'lbj', Tibetan: 'bo',
  Meitei: 'mni', Mizo: 'lus', Khasi: 'kha', Garo: 'grt',
};
// How to tell apart languages that share a script (shown in the Languages mode).
const LANG_TIPS = {
  Hindi: 'है “is” · का/की/के “of” · यहाँ “here” · no ळ',
  Marathi: 'ळ (शाळा, जळगाव) · आहे “is” · येथे “here”',
  Nepali: 'छ/छन् “is/are” · polite -नुहोस् with final ् · -लाई · loanwords in -ङ (पार्किङ)',
};

const SIGNS = SENT.map((_, i) => 's' + i);
const sign = id => SENT[+id.slice(1)];
const scriptsOf = a => RS[a].map(s => SC[s].n).join(' and ');
const writes = a => `${R[a].n} (${scriptsOf(a)})`;
const spot = s => `${SC[s].n}: ${SC[s].tip}`;
// After answering: the language and meaning, what gives this sign away, and how to spot the script (or the language).
const signAbout = (id, byLanguage) => {
  const S = sign(id);
  return [`“${S.en.replace(/\.$/, '')}”`, S.x, (byLanguage && LANG_TIPS[S.l] && `${S.l}: ${LANG_TIPS[S.l]}`) || spot(S.s)].filter(Boolean);
};
const oneSignPerScript = () => SCRIPT_KEYS.map(s => { const ids = SIGNS.filter(id => sign(id).s === s); return ids[Math.random() * ids.length | 0]; });
const signText = id => { const S = sign(id); return { text: S.t, cls: 's-' + S.s, lang: LANG[S.l] }; };
const byScript = SCRIPT_KEYS.map(s => ({ title: SC[s].n, sub: SC[s].g, ids: SIGNS.filter(id => sign(id).s === s) }));
const REGION_GROUPS = [
  ['Countries', ['NP', 'BD', 'BT']],
  ['North', ['JK', 'LA', 'HP', 'PB', 'CH', 'HR', 'DL', 'UT', 'UP', 'RJ']],
  ['Central & East', ['MP', 'CT', 'BR', 'JH', 'WB', 'OR']],
  ['Northeast', ['SK', 'AS', 'AR', 'NL', 'MN', 'MZ', 'TR', 'ML']],
  ['West', ['GJ', 'DH', 'MH', 'GA']],
  ['South', ['TG', 'AP', 'KA', 'KL', 'TN', 'PY', 'LD', 'AN']],
];

const QUIZ = {
  key: 'scripts',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: RS[r.id][0] })),
  borders: DATA.cty,
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 50, labelScale: 0.38, fly: { pad: 1.6, min: 1.5 / 50 },
  hintLabel: 'Color by script',
  hintsDefault: false,
  lettersLabel: 'Show script letters',
  exploreKind: 'scripts',
  explore: a => {
    const ex = SENT.find(S => S.r.includes(a)) || SENT.find(S => S.s === RS[a][0]);
    return { code: RS[a].map(s => SC[s].g).join(' '), title: `${R[a].n}: ${scriptsOf(a)}`, sub: [`${ex.l} · ${ex.t} · “${ex.en.replace(/\.$/, '')}”`, spot(RS[a][0])] };
  },
  rounds: [
    { kind: 'scripts', label: "South India's scripts", sub: 'Telugu, Kannada, Malayalam, Tamil', ids: ['telu', 'knda', 'mlym', 'taml'] },
    { kind: 'scripts', label: 'All scripts' },
    { kind: 'signs', label: 'One sign per script', sub: 'Random', preset: 'One per script' },
    { kind: 'signs', label: 'All signs' },
    { kind: 'languages', label: 'Languages', sub: 'Match the language' },
    { kind: 'regions', label: 'South', groups: ['South'] },
    { kind: 'regions', label: 'Northeast', groups: ['Northeast'] },
    { kind: 'regions', label: 'North', groups: ['North'] },
    { kind: 'regions', label: 'All states & countries' },
  ],
  kinds: [
    {
      key: 'signs', label: 'Signs', sub: `${SENT.length} signs, by script`, noun: ['sign', 'signs'], pickTitle: 'Signs to practice',
      groups: byScript, presets: [{ label: 'One per script', ids: oneSignPerScript }],
      areasOf: id => SC[sign(id).s].r,
      areaLabel: a => SC[RS[a][0]].g, flashArea: true, dim: false,
      short: id => SC[sign(id).s].g, name: id => sign(id).l === SC[sign(id).s].n ? sign(id).l : `${sign(id).l} · ${SC[sign(id).s].n}`, about: id => signAbout(id, false),
      clicked: a => writes(a),
      prompt: 'text', text: signText,
      chip: id => sign(id).t, chipTitle: id => `${sign(id).l}: ${sign(id).en}`,
    },
    {
      key: 'languages', label: 'Languages', sub: 'Harder', noun: ['sign', 'signs'], pickTitle: 'Signs to practice',
      groups: byScript, presets: [{ label: 'One per script', ids: oneSignPerScript }],
      areasOf: id => sign(id).r,
      areaLabel: a => SC[RS[a][0]].g, flashArea: true, dim: false,
      short: id => SC[sign(id).s].g, name: id => sign(id).l, about: id => signAbout(id, true),
      // Marathi is Devanagari too, but only counts in Maharashtra.
      clicked: (a, id) => SC[sign(id).s].r.includes(a) ? `${R[a].n}: script ✓, language ✗` : writes(a),
      prompt: 'text', text: signText,
      chip: id => sign(id).t, chipTitle: id => `${sign(id).l}: ${sign(id).en}`,
    },
    {
      key: 'scripts', label: 'Scripts', sub: `Beginner: ${SCRIPT_KEYS.length} scripts`, noun: ['script', 'scripts'], pickTitle: 'Scripts to practice',
      groups: [{ title: 'Scripts', sub: '', ids: SCRIPT_KEYS }],
      areasOf: s => SC[s].r,
      areaLabel: a => SC[RS[a][0]].g, flashArea: true, dim: false,
      hints: false, // coloring by script would give the answer away
      short: s => SC[s].g, name: s => `${SC[s].g} ${SC[s].n}`, about: s => SC[s].tip,
      clicked: a => writes(a),
      prompt: 'name',
      chip: s => `${SC[s].g} ${SC[s].n}`, chipTitle: s => SC[s].tip,
    },
    {
      key: 'regions', label: 'States & countries', sub: `All ${DATA.reg.length} by name`, noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: REGION_GROUPS.map(([title, ids]) => ({ title, sub: '', ids: ids.filter(id => R[id]).sort((a, b) => R[a].n.localeCompare(R[b].n)) })),
      areasOf: id => [id],
      short: id => id, name: id => R[id].n, about: id => scriptsOf(id),
      clicked: a => R[a].n,
      prompt: 'name',
      chip: id => R[id].n, chipTitle: id => scriptsOf(id),
    },
  ],
};
