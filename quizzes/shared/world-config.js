// World quizzes ("which country?"): builds the QUIZ config for ./area-quiz.js from the world map (WORLD in
// ./world.js, made by tools/worldmap.mjs) and the facts about its places (FACTS in ./world-facts.js, made by
// tools/worldfacts.mjs). A page loads both, sets WORLD_OPTS, then loads this file and area-quiz.js:
//   WORLD_OPTS = { type, key }
//     type  'countries'  a name, click the country
//           'flags'      a flag, click a place that flies it
//           'domains'    a top-level domain (.de), click its country
//           'phones'     a calling code (+49), click a place that dials it
//           'side'       a part of the world, click every place in it that drives on the left
//           'writing'    words on a sign, click a place where that script or language is written (needs WRITING,
//                        see world-languages/data.js)
//     script  with 'writing': the Countries page of one script ('cyrl': Cyrillic Countries), which tells its
//           countries apart. Only the places with Street View are asked. Letters: the ones the other languages add
//           to one language's alphabet (WRITING.pages). Words: those of the script's own table (SCRIPT, loaded
//           before with ./reading.js: the words of its Words quiz) that not every country writes. Each is asked
//           with a click on every country that writes it. The script's languages can be at areas of the page's
//           own instead of countries (EXTRA_AREAS, loaded before: India's Hindi states as one area).
//           A script whose page asks by area (WRITING.pages.<script>.areas: Latin) has three kinds of question,
//           each asked among the countries of one area only: a letter, several letters at once (which narrow it
//           down to fewer countries than any of them alone), a word of a sign. Places that write the same languages are one area to click.
//     key   localStorage prefix (default: the type)
//
// The rounds are about the places GeoGuessr players meet: those with Street View (FACTS.sv). Their size alone
// sets the level, as in every quiz: Beginner under 10, Intermediate under 30, Hard under 60, Expert above. So those
// places come in small sets of neighbours (REGIONS, each under 10), then in parts of a continent, then by
// continent, then all of them; the last round asks every place on the map. Each round frames its part of the map.
// Custom quizzes pick from every place, by region.

const QUIZ = (() => {
  const O = typeof WORLD_OPTS === 'object' ? WORLD_OPTS : {};
  const TYPE = O.type || 'countries';
  // (a page can bring areas of its own, drawn on the world map: EXTRA_AREAS = { id: { n, i2, d, lx, ly, a, b } })
  const EXTRA = typeof EXTRA_AREAS === 'object' ? EXTRA_AREAS : {};
  const W = { ...Object.fromEntries(WORLD.reg.map(r => [r.id, r])), ...Object.fromEntries(Object.entries(EXTRA).map(([id, r]) => [id, { id, ...r }])) };
  const SV = new Set(FACTS.sv), LEFT = new Set(FACTS.left);
  // Places of their own: every place that flies a flag (not a glacier or a reef).
  const OWN = WORLD.reg.map(r => r.id).filter(id => FACTS.flag[id]);
  const list = s => s.split(' ');

  // Regions: neighbours worth telling apart, few enough that a region's Street View places stay under 10 (a
  // Beginner round), each in a part of its continent. [region, part, continent, places]
  const REGIONS = [
    ['Nordics', 'Northern & Western Europe', 'Europe', 'ISL FRO NOR SJM SWE FIN ALD DNK'],
    ['Western Europe', 'Northern & Western Europe', 'Europe', 'IRL GBR IMN JEY GGY FRA MCO BEL NLD LUX'],
    ['Iberia & Italy', 'Central & Southern Europe', 'Europe', 'PRT ESP AND GIB ITA SMR VAT MLT'],
    ['Central Europe', 'Central & Southern Europe', 'Europe', 'DEU CHE LIE AUT CZE SVK POL HUN SVN'],
    ['Baltics & East', 'Eastern Europe', 'Europe', 'EST LVA LTU BLR UKR MDA RUS'],
    ['Balkans', 'Eastern Europe', 'Europe', 'HRV BIH SRB MNE KOS ALB MKD'],
    ['Southeast Europe', 'Eastern Europe', 'Europe', 'ROU BGR GRC TUR CYP'],
    ['Middle East', 'West & South Asia', 'Asia', 'ISR PSX LBN JOR SYR IRQ IRN KWT SAU BHR QAT ARE OMN YEM'],
    ['Central & South Asia', 'West & South Asia', 'Asia', 'GEO ARM AZE KAZ KGZ UZB TKM TJK AFG PAK IND NPL BTN BGD LKA MDV IOT'],
    ['East Asia', 'East & Southeast Asia', 'Asia', 'MNG CHN PRK KOR JPN TWN HKG MAC'],
    ['Southeast Asia', 'East & Southeast Asia', 'Asia', 'MMR THA LAO KHM VNM MYS SGP BRN IDN TLS PHL'],
    ['North & West Africa', 'Africa', 'Africa', 'MAR SAH DZA TUN LBY EGY SDN MRT MLI NER TCD SEN GMB GNB GIN SLE LBR CIV BFA GHA TGO BEN NGA CPV CMR CAF GNQ GAB STP COG COD AGO'],
    ['East Africa', 'Africa', 'Africa', 'ERI DJI ETH SOM SDS KEN UGA RWA BDI TZA MDG COM MYT REU MUS SYC'],
    ['Southern Africa', 'Africa', 'Africa', 'ZMB MWI MOZ ZWE BWA NAM ZAF LSO SWZ SHN'],
    ['Canada, USA & Mexico', 'North America', 'North America', 'GRL CAN SPM USA BMU MEX'],
    ['Central America & Caribbean', 'North America', 'North America', 'GTM BLZ SLV HND NIC CRI PAN CUB JAM HTI DOM PRI BHS TCA CYM VIR VGB AIA MAF SXM BLM KNA ATG MSR GLP DMA MTQ LCA VCT BRB GRD TTO ABW CUW'],
    ['Northern South America', 'South America', 'South America', 'COL VEN GUY SUR GUF ECU PER BOL BRA'],
    ['Southern Cone', 'South America', 'South America', 'PRY CHL ARG URY FLK SGS'],
    ['Oceania', 'Oceania', 'Oceania', 'AUS NZL NFK CXR CCK HMD ATF PNG SLB VUT NCL FJI WLF TUV NRU KIR MHL FSM PLW GUM MNP WSM ASM TON NIU COK PYF PCN'],
  ];
  const REGION = {}; // place -> [region, part, continent]
  for (const [region, part, continent, ids] of REGIONS) for (const id of list(ids)) REGION[id] = [region, part, continent];
  const lost = OWN.filter(id => !REGION[id]);
  if (lost.length) console.warn('world-config: no region for', lost.join(' '));

  // The part of the map that holds these places: their main land, with some room around it.
  const boxOf = ids => {
    const b = ids.map(id => W[id].b);
    const x0 = Math.min(...b.map(v => v[0])), y0 = Math.min(...b.map(v => v[1])), x1 = Math.max(...b.map(v => v[2])), y1 = Math.max(...b.map(v => v[3]));
    const m = Math.max(x1 - x0, y1 - y0) * .06;
    return [x0 - m, y0 - m, x1 + m, y1 + m];
  };
  const uniq = a => [...new Set(a)];
  const bySize = (a, b) => W[b].a - W[a].a;
  const names = ids => ids.map(id => W[id].n).join(' · ');

  /* ---------- one item, one or a few places: countries, flags, domains, calling codes ---------- */
  // items: { item: [places] }. An item belongs to the region of its home, its largest place with Street View, and
  // goes by that place's name (coded: after the item itself, ".fr · France"); its other places are told with the answer.
  function facts(items, kind) {
    const ALL = Object.keys(items);
    const home = Object.fromEntries(ALL.map(it => { const p = [...items[it]].sort(bySize); return [it, p.find(id => SV.has(id)) || p[0]]; }));
    const BASE = ALL.filter(it => SV.has(home[it]));
    const byName = (a, b) => W[home[a]].n.localeCompare(W[home[b]].n) || a.localeCompare(b);
    const framed = (key, label, ids) => ({ kind: kind.key, key, label, ids, sub: 'Street View', box: boxOf(uniq(ids.map(it => home[it]))) });
    const level = i => uniq(REGIONS.map(r => r[i]));
    const at = (i, n) => BASE.filter(it => REGION[home[it]][i] === n);
    const candidates = [
      ...[0, 1, 2].flatMap(i => level(i).map(n => framed(`${i}.${n}`, n, at(i, n)))),
      { kind: kind.key, key: 'sv', label: 'Street View', ids: BASE },
      { kind: kind.key, key: 'all', label: `All ${kind.noun[1]}`, ids: ALL },
    ];
    // Every round asks at least two things, and no two rounds ask the same ones (the wider one stays).
    const sig = r => [...r.ids].sort().join(',');
    const rounds = candidates.filter((r, i) => r.ids.length > 1 && !candidates.slice(i + 1).some(q => sig(q) === sig(r)));
    return {
      rounds, areas: uniq(ALL.flatMap(it => items[it])),
      kinds: [{
        pickTitle: `${kind.label} to practice`, sub: `${ALL.length} ${kind.noun[1]}`, hints: false, merge: false,
        groups: level(0).map(n => ({ title: n, sub: '', ids: ALL.filter(it => REGION[home[it]][0] === n).sort(byName) })),
        presets: [{ label: 'Street View', ids: BASE }],
        areasOf: it => items[it], clicked: a => W[a].n,
        name: it => (kind.coded ? `${it} · ` : '') + W[home[it]].n, about: it => names(items[it].filter(id => id !== home[it])),
        chipTitle: it => names(items[it]),
        ...kind,
      }],
    };
  }
  const invert = (of) => { const items = {}; for (const id of OWN) for (const it of [].concat(of(id) || [])) (items[it] ??= []).push(id); return items; };
  const coded = (items, kind) => facts(items, { coded: true, short: it => it, chip: it => it, prompt: 'dial', ...kind });
  const FLAGS = new URL('../world-flags/img/', document.currentScript.src).href;
  const flag = code => ({ src: `${FLAGS}${code}.svg`, alt: 'flag', label: names(OWN.filter(id => FACTS.flag[id] === code)), cls: 'flag' });

  /* ---------- driving side: every place of a part of the world that drives on the left ---------- */
  // A left-driving place outside the part asked is a wrong click, so the parts are ones nobody has to guess at.
  function side() {
    const GROUPS = [
      ['Europe', 'Europe & Africa', 'IRL GBR IMN JEY GGY MLT CYP'],
      ['Africa', 'Europe & Africa', 'ZAF NAM BWA LSO SWZ ZWE ZMB MWI MOZ TZA KEN UGA MUS SYC SHN'],
      ['South Asia', 'Asia & Oceania', 'PAK IND NPL BTN BGD LKA MDV'],
      ['Southeast Asia', 'Asia & Oceania', 'THA MYS SGP BRN IDN TLS CXR CCK'],
      ['East Asia', 'Asia & Oceania', 'JPN HKG MAC'],
      ['Oceania', 'Asia & Oceania', 'AUS NZL NFK PNG SLB FJI TUV NRU KIR WSM TON NIU COK PCN'],
      ['South America', 'Americas', 'GUY SUR FLK SGS'],
      ['Caribbean & Bermuda', 'Americas', 'BMU BHS TCA CYM JAM VIR VGB AIA KNA ATG MSR DMA LCA VCT BRB GRD TTO'],
    ].map(([title, part, ids]) => ({ title, part, ids: list(ids).filter(id => LEFT.has(id)) }));
    const rest = OWN.filter(id => LEFT.has(id) && !GROUPS.some(g => g.ids.includes(id)));
    if (rest.length) console.warn('world-config: left-hand traffic outside the groups', rest.join(' '));
    const G = Object.fromEntries(GROUPS.map(g => [g.title, g]));
    const groupOf = a => GROUPS.find(g => g.ids.includes(a));
    const sideOf = a => LEFT.has(a) ? 'Left' : 'Right';
    const parts = uniq(GROUPS.map(g => g.part));
    return {
      areas: OWN,
      rounds: [
        ...parts.map(p => { const gs = GROUPS.filter(g => g.part === p); return { kind: 'left', label: p, ids: gs.map(g => g.title), box: boxOf(gs.flatMap(g => g.ids)) }; }),
        { kind: 'left', label: 'All left-hand traffic' },
      ],
      explore: a => ({ code: sideOf(a), title: W[a].n, sub: groupOf(a) ? groupOf(a).title : '' }),
      kinds: [{
        key: 'left', label: 'Left-hand traffic', sub: `${FACTS.left.length} places`, noun: ['region', 'regions'], pickTitle: 'Regions to practice',
        groups: parts.map(p => ({ title: p, sub: '', ids: GROUPS.filter(g => g.part === p).map(g => g.title) })),
        areasOf: g => G[g].ids, clickAll: true, dim: false, hints: false, areaRank: false,
        areaLabel: a => W[a].i2, flashArea: true, primary: () => null, // no outline of a place's whole group on hover: it would give the others away
        short: g => g, name: g => `Left · ${g}`, about: g => names(G[g].ids),
        clicked: a => [W[a].n, sideOf(a), LEFT.has(a) ? groupOf(a).title : ''].filter(Boolean).join(' · '),
        prompt: 'name', chip: g => g, chipTitle: g => names(G[g].ids),
      }],
    };
  }

  /* ---------- writing: scripts, and the languages that share one ---------- */
  function writing() {
    const ONE = O.script, PAGE = ONE && WRITING.pages[ONE], NOT = new Set(PAGE && PAGE.not ? list(PAGE.not) : []);
    const L = Object.fromEntries(WRITING.languages.filter(l => !ONE || l.s === ONE)
      .map(l => [l.id, { ...l, p: list(l.p).filter(id => FACTS.flag[id] && (!ONE || (SV.has(id) && !NOT.has(id)))) }]).filter(([, l]) => !ONE || l.p.length));
    const S = Object.fromEntries(WRITING.scripts.filter(s => !ONE || s[0] === ONE).map(([id, n, g, also, one]) => [id, { id, n, g, one, langs: Object.keys(L).filter(l => L[l].s === id), also: also && !ONE ? list(also) : [] }]));
    for (const s of Object.values(S)) s.p = uniq([...s.langs.flatMap(l => L[l].p), ...s.also]);
    // Asked as scripts: every script but Latin. Asked as languages: those that share their script with others
    // (unless the script is marked as one item, whatever the language).
    const SHARED = Object.keys(S).filter(s => S[s].langs.length > 1 && !S[s].one);
    const SCRIPTS = Object.keys(S).filter(s => s !== 'latn'), LANGS = SHARED.flatMap(s => S[s].langs);
    const langsAt = {}, scriptsAt = {};
    for (const l of Object.keys(L)) for (const a of L[l].p) (langsAt[a] ??= []).push(l);
    for (const s of Object.keys(S)) for (const a of S[s].p) (scriptsAt[a] ??= []).push(s);
    const onSV = ids => ids.some(id => SV.has(id));
    // A sign: a few words of one language, drawn anew every time it is asked. What was drawn is told with the answer.
    // Languages share words (Skole is Norwegian and Danish), so one of the words is always the language's alone.
    const users = {};
    for (const l of WRITING.languages) for (const [text] of l.w) users[text] = (users[text] || 0) + 1;
    const mix = a => [...a].sort(() => Math.random() - .5);
    const drawn = {};
    const draw = (id, lang, n) => {
      const own = mix(L[lang].w.filter(x => users[x[0]] === 1)).slice(0, 1);
      const w = mix([...own, ...mix(L[lang].w.filter(x => x !== own[0])).slice(0, n - own.length)]);
      drawn[id] = { lang, w };
      return { text: w.map(x => x[0]).join('  ·  '), cls: `s-${L[lang].s} l-${lang}`, lang: L[lang].t || '' };
    };
    const meaning = id => drawn[id] ? drawn[id].w.map(x => x[1]).join(' · ') : '';
    const pick = a => a[Math.random() * a.length | 0];
    // WRITING.rounds: [label, items, places to frame]
    const sets = (kind, table) => table.map(([label, ids, frame]) => ({ kind, label, ids: list(ids), sub: 'Street View', ...(frame ? { box: boxOf(list(frame)) } : {}) }));
    // primary: no outline of every place that shares the hovered one's script: it would give the answer's shape away
    const common = { areaLabel: a => W[a].i2, flashArea: true, primary: () => null, dim: false, hints: false, areaRank: false, prompt: 'text' };
    const languages = {
      ...common, key: 'languages', label: 'Languages', sub: `${LANGS.length} languages`, noun: ['language', 'languages'], pickTitle: 'Languages to practice',
      groups: SHARED.map(s => ({ title: S[s].n, sub: '', ids: S[s].langs })),
      areasOf: l => L[l].p,
      short: l => L[l].n, name: l => L[l].n, about: l => [L[l].tell, meaning(l)].filter(Boolean),
      clicked: a => [W[a].n, (langsAt[a] || []).map(l => L[l].n).join(', ')].join(' · '),
      text: l => draw(l, l, 3),
      chip: l => L[l].n, chipTitle: l => [L[l].tell, names(L[l].p)].filter(Boolean).join(' · '),
    };
    // A capital and its small letter, or the letter alone where it has no capital of its own (ß, ı).
    const both = c => { const C = c.toUpperCase(); return C.length === 1 && C !== c && C.toLowerCase() === c ? `${C} ${c}` : c; };
    if (ONE && PAGE && PAGE.areas) return byArea();
    function byArea() {
      const MOST = PAGE.most || 4, covered = id => FACTS.flag[id] && SV.has(id) && !NOT.has(id);
      const LANG = { ...L };
      for (const m of PAGE.more || []) LANG[m.id] = { ...m, w: [], p: list(m.p).filter(covered) };
      const at = {}; // place -> its languages
      for (const l in LANG) for (const p of LANG[l].p) (at[p] ??= []).push(l);
      // Language areas: the places that write exactly the same languages (and letters) are one, named after its
      // largest place, with the letters beyond a to z and the words of those languages.
      const of = (l, p, all, here) => list((LANG[l][here] || {})[p] ?? LANG[l][all] ?? '').filter(Boolean);
      const lettersAt = p => uniq(at[p].flatMap(l => of(l, p, 'x', 'xat'))).sort();
      // Rare at a place: a letter that each of its languages writing it has in a few words only, or writes in a part
      // of it only (r, rat). It is asked like the others and shown in another color.
      const rareAt = p => lettersAt(p).filter(c => at[p].every(l => !of(l, p, 'x', 'xat').includes(c) || of(l, p, 'r', 'rat').includes(c)));
      const same = {}, UNIT = {}, unitOf = {};
      for (const p of OWN) if (at[p]) (same[`${at[p].slice().sort().join('+')} ${lettersAt(p).join('')} ${rareAt(p).join('')}`] ??= []).push(p);
      for (const places of Object.values(same)) {
        places.sort(bySize);
        UNIT[places[0]] = { id: places[0], langs: at[places[0]], places };
        for (const p of places) unitOf[p] = places[0];
      }
      for (const u of Object.values(UNIT)) {
        u.letters = new Set(lettersAt(u.id)); u.rare = new Set(rareAt(u.id));
        u.words = new Map(u.langs.flatMap(l => LANG[l].w.map(([text, meaning]) => [text.toLowerCase(), { text, meaning, t: LANG[l].t }])));
        u.name = u.places.length > 3 ? u.langs.map(l => LANG[l].n).join(' · ') : names(u.places);
        u.label = W[u.places[0]].i2;
      }
      const shapes = Object.values(UNIT).map(u => {
        const drawn = u.places.filter(p => !W[p].dot), big = W[u.places[0]];
        return { id: u.id, d: drawn.length ? drawn.map(p => W[p].d).join('') : `M${big.lx},${big.ly}l0,0`, lx: big.lx, ly: big.ly, a: u.places.reduce((n, p) => n + W[p].a, 0), g: '', dot: !drawn.length };
      });
      // What is asked in an area: what some of its language areas write and not all, nor more than MOST of them.
      const AREA = PAGE.areas.map(([label, ids, part]) => { const places = list(ids).filter(p => unitOf[p]); return { label, part, places, units: uniq(places.map(p => unitOf[p])), box: boxOf(places) }; });
      const LETTER = {}, WORD = {}, SET = {};
      const told = (A, units) => units.length && units.length < A.units.length && units.length <= MOST;
      for (const A of AREA) {
        const has = (u, c) => UNIT[u].letters.has(c), letters = uniq(A.units.flatMap(u => [...UNIT[u].letters]));
        for (const c of letters) { const units = A.units.filter(u => has(u, c)); if (told(A, units)) LETTER[`${A.label}:${c}`] = { c, A, units }; }
        const words = new Map();
        for (const u of A.units) for (const [k, w] of UNIT[u].words) (words.get(k) || words.set(k, { ...w, units: [] }).get(k)).units.push(u);
        for (const [k, w] of words) if (told(A, w.units)) WORD[`${A.label}:${k}`] = { ...w, A };
        // Several letters at once, as on one sign: the language areas that write all of them, which are fewer than
        // any of the letters says alone (æ and å: Norway and Denmark write both, the Faroes have no å). A question
        // is such a group of areas; its letters are two or three that each matter (without any one of them more
        // areas would fit), and with them, for a larger set, other letters the whole group writes.
        const writers = cs => A.units.filter(v => cs.every(c => has(v, c)));
        const tell = cs => {
          const units = writers(cs);
          if (!told(A, units) || cs.some((_, i) => writers(cs.filter((_, j) => j !== i)).length === units.length)) return;
          (SET[`${A.label}=${units.join('+')}`] ??= { A, units, sets: [], more: letters.filter(c => units.every(u => has(u, c))) }).sets.push(cs);
        };
        letters.forEach((c, i) => letters.slice(i + 1).forEach((d, j) => { tell([c, d]); letters.slice(i + j + 2).forEach(e => tell([c, d, e])); }));
        // A language area with a letter of its own needs no second one to be told, but is asked as a set too: two
        // of its letters that only it writes together.
        for (const u of A.units) if (!SET[`${A.label}=${u}`]) {
          const mine = letters.filter(c => has(u, c)), pairs = mine.flatMap((c, i) => mine.slice(i + 1).map(d => [c, d])).filter(cs => writers(cs).length === 1);
          if (pairs.length) SET[`${A.label}=${u}`] = { A, units: [u], sets: pairs, more: mine };
        }
      }
      const drawn = {}; // the letters last shown for a set
      const mine = { areaLabel: a => UNIT[a].label, flashArea: true, primary: () => null, dim: false, hints: false, areaRank: false, merge: false, prompt: 'text', clickAll: true, fresh: true, clicked: a => UNIT[a].name };
      const where = units => units.map(u => UNIT[u].name).join(' · ');
      // said with an answer: where it is written, and apart from them where it is rare
      const split = (units, rare) => [where(units.filter(u => !rare(u))), units.some(rare) ? `rare: ${where(units.filter(rare))}` : ''].filter(Boolean);
      const kind = (key, label, noun, ITEMS, extra) => ({
        ...mine, key, label, noun, sub: `${Object.keys(ITEMS).length} ${noun[1]}`, pickTitle: `${label} to practice`,
        groups: AREA.map(A => ({ title: A.label, sub: '', ids: Object.keys(ITEMS).filter(id => ITEMS[id].A === A) })).filter(g => g.ids.length),
        ...extra,
      });
      const kinds = [
        kind('letters', 'Letters', ['letter', 'letters'], LETTER, {
          areasOf: id => LETTER[id].units, short: id => LETTER[id].c, name: id => both(LETTER[id].c),
          rare: (id, a) => UNIT[a].rare.has(LETTER[id].c), about: id => split(LETTER[id].units, u => UNIT[u].rare.has(LETTER[id].c)),
          text: id => ({ text: both(LETTER[id].c), cls: `s-${ONE} letter`, tag: LETTER[id].A.label }),
          chip: id => LETTER[id].c, chipTitle: id => `${LETTER[id].A.label} · ${where(LETTER[id].units)}`,
        }),
        kind('sets', 'Sets', ['set', 'sets'], SET, {
          areasOf: id => SET[id].units, short: id => (drawn[id] || []).join(' '), name: id => where(SET[id].units), about: id => (drawn[id] || []).join(' · '),
          rare: (id, a) => (drawn[id] || []).some(c => UNIT[a].rare.has(c)), // (it fits by a letter that is rare there)
          // (drawn anew each time: letters that tell the group, filled up to three or four with others it writes)
          text: id => {
            const S = SET[id], core = pick(S.sets), size = Math.max(core.length, 3 + (Math.random() * 2 | 0));
            drawn[id] = mix([...core, ...mix(S.more.filter(c => !core.includes(c))).slice(0, size - core.length)]);
            return { text: drawn[id].join('  ·  '), cls: `s-${ONE} letter`, tag: S.A.label };
          },
          chip: id => SET[id].units.map(u => UNIT[u].label).join(' '), chipTitle: id => `${SET[id].A.label} · ${where(SET[id].units)}`,
        }),
        kind('words', 'Words', ['word', 'words'], WORD, {
          areasOf: id => WORD[id].units, short: id => WORD[id].text, name: id => `${WORD[id].text} · ${WORD[id].meaning}`, about: id => where(WORD[id].units),
          text: id => ({ text: WORD[id].text, cls: `s-${ONE} word`, tag: WORD[id].A.label, lang: WORD[id].t || '' }),
          say: id => ({ text: WORD[id].text, lang: WORD[id].t }),
          chip: id => WORD[id].text, chipTitle: id => `${WORD[id].meaning} · ${WORD[id].A.label} · ${where(WORD[id].units)}`,
        }),
      ].filter(k => k.groups.length);
      // Rounds: each area, the parts of the world with several areas, everything.
      const parts = uniq(AREA.map(A => A.part).filter(Boolean)).filter(p => AREA.filter(A => A.part === p).length > 1);
      const rounds = kinds.flatMap(k => [
        ...k.groups.filter(g => g.ids.length > 1).map(g => ({ kind: k.key, label: g.title, ids: g.ids, box: AREA.find(A => A.label === g.title).box })),
        ...parts.map(p => ({ kind: k.key, label: p, ids: k.groups.filter(g => AREA.find(A => A.label === g.title).part === p).flatMap(g => g.ids), box: boxOf(uniq(AREA.filter(A => A.part === p).flatMap(A => A.places))) })).filter(r => r.ids.length > 1),
        { kind: k.key, label: `All ${k.noun[1]}` },
      ]);
      return {
        shapes, places: Object.keys(unitOf), rounds, kinds,
        // The areas with their language areas, each with its places in that area, its languages and the letters it
        // writes (the rare ones apart; by: each language's own there, [name, letters, the rare ones of them]): what
        // the script's Alphabets page asks the other way round (tools/builds/languages reads it here).
        parts: AREA.map(A => ({ label: A.label, units: A.units.map(u => ({
          places: UNIT[u].places.filter(p => A.places.includes(p)).map(p => W[p].n), langs: UNIT[u].langs.map(l => LANG[l].n), letters: [...UNIT[u].letters], rare: [...UNIT[u].rare],
          by: UNIT[u].langs.map(l => [LANG[l].n, of(l, u, 'x', 'xat'), of(l, u, 'r', 'rat')]),
        })) })),
        // Explore: a place's letters, and under them its languages; where it has several, each with its own letters.
        explore: a => {
          const U = UNIT[a], own = l => [LANG[l].n, ...(U.langs.length > 1 ? [of(l, a, 'x', 'xat').join(' ')] : [])].filter(Boolean).join(' · ');
          return { code: [...U.letters].join(' ') || 'a–z', title: U.name, sub: [...U.langs.map(own), U.rare.size ? `rare: ${[...U.rare].join(' ')}` : '', U.places.length > 3 ? names(U.places) : ''].filter(Boolean) };
        },
      };
    }
    if (ONE) {
      const SC = typeof SCRIPT === 'object' && SCRIPT.script === ONE ? SCRIPT : null;
      // The page's areas: where the script's languages are (its own regions too), and where its letters are written.
      const HERE = new Set([...(SC ? Object.values(SC.langs).map(l => l.at) : Object.keys(langsAt)), ...(PAGE ? Object.keys(langsAt) : [])]);
      const AREAS = [...OWN, ...Object.keys(EXTRA)].filter(id => HERE.has(id) && (EXTRA[id] || SV.has(id)) && !NOT.has(id));
      // The letters the other languages add to the core one's alphabet, each with the languages that write it.
      const core = new Set(PAGE ? list(L[PAGE.core].abc) : []), LETTER = {}, letterRounds = PAGE ? PAGE.letters : [];
      if (PAGE) for (const l of Object.keys(L)) for (const c of list(L[l].abc)) if (!core.has(c)) (LETTER[c] ??= []).push(l);
      const placesOf = c => uniq(LETTER[c].flatMap(l => L[l].p)), lettersAt = a => Object.keys(LETTER).filter(c => placesOf(c).includes(a));
      const loose = Object.keys(LETTER).filter(c => !letterRounds.some(r => list(r[1]).includes(c)));
      if (loose.length) console.warn('world-config: letters in no round', loose.join(' '));
      // The words of the script's table, each with the countries that write it: those that not all of them do.
      const WORD = {};
      for (const w of SC ? READING.words() : []) { const p = uniq(w.langs.map(t => SC.langs[t].at)).filter(id => AREAS.includes(id)); if (p.length && p.length < AREAS.length) WORD[w.id] = { ...w, p }; }
      const themes = SC ? SC.words.themes.map(t => ({ title: t.title, sub: '', ids: Object.keys(WORD).filter(id => WORD[id].themes.includes(t.title)) })).filter(g => g.ids.length) : [];
      const cap = s => s[0].toUpperCase() + s.slice(1), written = w => (w !== w.toLowerCase() ? w : pick([w, cap(w), w.toUpperCase()]));
      const kinds = [];
      if (Object.keys(LETTER).length) kinds.push({
        ...common, key: 'letters', label: 'Letters', sub: `${Object.keys(LETTER).length} letters`, noun: ['letter', 'letters'], pickTitle: 'Letters to practice',
        groups: letterRounds.map(([title, ids]) => ({ title, sub: '', ids: list(ids).filter(c => LETTER[c]) })),
        areasOf: placesOf, clickAll: true, fresh: true,
        short: c => c, name: both, about: c => LETTER[c].map(l => L[l].n).join(' · '),
        clicked: a => [W[a].n, lettersAt(a).join(' ')].filter(Boolean).join(' · '),
        text: c => ({ text: both(c), cls: `s-${ONE} letter`, lang: '' }),
        chip: c => c, chipTitle: c => names(placesOf(c)),
      });
      if (themes.length) kinds.push({
        ...common, key: 'words', label: 'Words', sub: `${Object.keys(WORD).length} words`, noun: ['word', 'words'], pickTitle: 'Words to practice',
        groups: themes,
        areasOf: id => WORD[id].p, clickAll: true, fresh: true,
        short: id => WORD[id].word, name: id => `${WORD[id].word} · ${WORD[id].meaning}`, about: id => [WORD[id].notes.join(' · '), names(WORD[id].p)],
        clicked: a => W[a].n,
        text: id => ({ text: written(WORD[id].word), cls: `s-${ONE} word`, lang: WORD[id].langs[0] }),
        say: id => ({ text: WORD[id].word, lang: WORD[id].langs[0] }),
        chip: id => WORD[id].word, chipTitle: id => `${WORD[id].meaning} · ${names(WORD[id].p)}`,
      });
      return {
        areas: AREAS, home: boxOf(PAGE && PAGE.home ? list(PAGE.home) : AREAS),
        rounds: [
          ...letterRounds.map(([label, ids, frame]) => ({ kind: 'letters', label, ids: list(ids).filter(c => LETTER[c]), box: boxOf(list(frame)) })),
          ...(kinds.some(k => k.key === 'letters') ? [{ kind: 'letters', label: 'All letters' }] : []),
          ...themes.map(t => ({ kind: 'words', label: t.title, ids: t.ids })), ...(themes.length ? [{ kind: 'words', label: 'All words' }] : []),
        ],
        explore: a => ({ code: lettersAt(a).join(' ') || S[ONE].g, title: W[a].n, sub: langsAt[a] ? langsAt[a].map(l => [L[l].n, L[l].tell].filter(Boolean).join(' · ')) : Object.values(SC ? SC.langs : {}).filter(l => l.at === a).map(l => l.name) }),
        kinds,
      };
    }
    return {
      areas: OWN.filter(id => langsAt[id] || scriptsAt[id]),
      rounds: [
        ...sets('scripts', WRITING.rounds.scripts),
        { kind: 'scripts', label: 'Street View', key: 'sv', ids: SCRIPTS.filter(s => onSV(S[s].p)) },
        { kind: 'scripts', label: 'All scripts' },
        ...sets('languages', WRITING.rounds.languages),
        { kind: 'languages', label: 'Street View', key: 'sv', ids: LANGS.filter(l => onSV(L[l].p)) },
        { kind: 'languages', label: 'All languages' },
      ],
      explore: a => ({
        code: (scriptsAt[a] || []).filter(s => s !== 'latn').map(s => S[s].g).join(' ') || 'Aa', title: W[a].n,
        sub: (langsAt[a] || []).map(l => [L[l].n, L[l].tell].filter(Boolean).join(' · ')),
      }),
      kinds: [{
        ...common, key: 'scripts', label: 'Scripts', sub: `${SCRIPTS.length} scripts`, noun: ['script', 'scripts'], pickTitle: 'Scripts to practice',
        groups: [{ title: 'Scripts', sub: '', ids: SCRIPTS }],
        areasOf: s => S[s].p,
        short: s => S[s].g, name: s => S[s].n,
        about: s => drawn[s] ? [[L[drawn[s].lang].n, meaning(s)].join(' · '), names(S[s].p.filter(id => SV.has(id)))].filter(Boolean) : '',
        clicked: a => [W[a].n, (scriptsAt[a] || []).map(s => S[s].n).join(', ')].join(' · '),
        text: s => draw(s, pick(S[s].langs), 2),
        chip: s => `${S[s].g} ${S[s].n}`, chipTitle: s => names(S[s].p),
      }, languages],
    };
  }

  const flagItems = () => invert(id => FACTS.flag[id]);
  const T = {
    countries: () => facts(Object.fromEntries(OWN.map(id => [id, [id]])), {
      key: 'countries', label: 'Countries', noun: ['country', 'countries'], prompt: 'name',
      short: id => W[id].i2, chip: id => W[id].i2,
    }),
    flags: () => { const items = flagItems(); return facts(items, {
      key: 'flags', label: 'Flags', noun: ['flag', 'flags'], prompt: 'photo', photo: flag, areaRank: false,
      modes: ['list', 'type', 'pairs'], answers: it => items[it].map(id => W[id].n), looks: true,
      short: it => W[items[it].slice().sort(bySize)[0]].i2, chip: it => it.toUpperCase(),
    }); },
    domains: () => coded(invert(id => FACTS.tld[id]), { key: 'domains', label: 'Domains', noun: ['domain', 'domains'] }),
    phones: () => coded(invert(id => FACTS.idd[id]), { key: 'codes', label: 'Calling codes', noun: ['code', 'codes'], areaRank: false }),
    side, writing,
  };
  const Q = T[TYPE]();
  const inQuiz = new Set(Q.places || Q.areas);
  const EXPLORE = {
    countries: a => ({ code: W[a].i2, title: W[a].n, sub: SV.has(a) ? 'Street View' : '' }),
    flags: a => ({ code: W[a].i2, title: W[a].n, photos: [flag(FACTS.flag[a])] }),
    domains: a => ({ code: FACTS.tld[a], title: W[a].n }),
    phones: a => ({ code: FACTS.idd[a].join(', '), title: W[a].n }),
  };

  return {
    key: O.key || TYPE,
    // dots last, so they lie on top of their neighbours (shapes: a page's own areas, each made of several places)
    areas: Q.shapes ? [...Q.shapes.filter(s => !s.dot), ...Q.shapes.filter(s => s.dot)] : [...Q.areas.filter(id => !W[id].dot), ...Q.areas.filter(id => W[id].dot)]
      .map(id => ({ id, d: W[id].dot ? `M${W[id].lx},${W[id].ly}l0,0` : W[id].d, lx: W[id].lx, ly: W[id].ly, a: W[id].a, g: '', dot: !!W[id].dot })),
    borders: [],
    // every other place, and the real outline of each dot
    context: WORLD.reg.filter(r => !inQuiz.has(r.id) || r.dot).map(r => r.d).join(''),
    size: [WORLD.w, WORLD.h], pad: 12, flyAnswer: true,
    ...(Q.home ? { home: Q.home } : {}), // a page about one part of the world shows that part
    ...(Q.parts ? { parts: Q.parts } : {}),
    ...(WORLD.proj ? { proj: WORLD.proj, kpu: WORLD.kpu } : {}), // Web Mercator (tools/worldmap.mjs): Street View coverage can be laid on it
    maxZoom: 60, labelScale: .38, fly: { pad: 2.4, min: .045 },
    hintLabel: '', hintsDefault: false,
    exploreKind: Q.kinds[0].key, explore: Q.explore || EXPLORE[TYPE],
    rounds: Q.rounds, kinds: Q.kinds,
  };
})();
