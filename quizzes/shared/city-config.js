// City quizzes: builds the QUIZ config for ./area-quiz.js from a country's CITIES data (made by tools/cities.mjs).
// Each city is a dot (Q.dots) on the country's land and region borders (Q.base); clicking the right dot answers.
// Two kinds: 'en' asks the English name, 'local' the name in the local language and script (cities without a
// known local name are only in 'en'). Rounds take the largest cities first; custom quizzes group them by region.
//
// A page loads its cities.js, optionally sets CITY_OPTS, then this file, then area-quiz.js:
//   CITY_OPTS = { key, localLabel: 'Thai script', localNote, top: [8, 25, 50, 100] }
//     key         localStorage prefix (default <iso3>cities)
//     localLabel  how the local mode is called on the page, e.g. 'Thai script', 'Cyrillic', 'Local names'
//     top         sizes of the "Top N" rounds; a round with every city is added at the end

const QUIZ = (() => {
  const C = CITIES, O = typeof CITY_OPTS === 'object' ? CITY_OPTS : {};
  const BY = Object.fromEntries(C.list.map(c => [c.id, c]));
  const ALL = C.list.map(c => c.id); // largest first
  const LOCAL = ALL.filter(id => BY[id].local);
  const region = id => C.regions[BY[id].adm] || BY[id].adm;
  const REGIONS = [...new Set(C.list.map(c => c.adm))]; // ordered by their largest city
  const groupsOf = ids => REGIONS.map(r => ({ title: C.regions[r] || r, sub: '', ids: ids.filter(id => BY[id].adm === r) })).filter(g => g.ids.length);
  const fmtPop = n => n >= 1e6 ? `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)} million` : n.toLocaleString('en-US');
  const rank = id => ALL.indexOf(id) + 1;
  const capitals = ids => ids.filter(id => /^PPL[CA]$/.test(BY[id].fc));
  const localLabel = O.localLabel || 'Local names';
  const sizes = O.top || [8, 25, 50, 100];

  const kind = (key, ids, extra) => ({
    key, noun: ['city', 'cities'], pickTitle: 'Cities to practice',
    groups: groupsOf(ids),
    areasOf: id => [id], primary: a => a,
    areaRank: false, rankings: [{ label: 'population', order: ids }],
    presets: [{ label: 'Capitals', ids: capitals(ids) }],
    merge: false,
    about: id => [region(id), `#${rank(id)} · ${fmtPop(BY[id].pop)}`],
    chipTitle: id => region(id),
    ...extra,
  });

  const kinds = [
    kind('en', ALL, {
      label: 'English names', sub: `${ALL.length} cities`,
      prompt: 'name', name: id => BY[id].en, short: id => BY[id].en,
      clicked: a => BY[a].en, chip: id => BY[id].en,
    }),
  ];
  if (LOCAL.length) kinds.push(kind('local', LOCAL, {
    label: localLabel, sub: `${LOCAL.length} cities`,
    prompt: 'text', text: id => ({ text: BY[id].local, lang: BY[id].lang, cls: 'city' }),
    name: id => BY[id].local, short: id => BY[id].local,
    clicked: a => BY[a].local ? `${BY[a].local} · ${BY[a].en}` : BY[a].en,
    chip: id => BY[id].local, chipTitle: id => `${BY[id].en} · ${region(id)}`,
  }));

  // Hint colors by region from the shared palette (--h1…--h24): each region takes the color least used among its
  // nearest regions (by the mean position of its cities), so neighbours rarely share one.
  const PAL = 24, pos = {}, color = {}, used = Array(PAL).fill(0);
  for (const c of C.list) { const p = pos[c.adm] ??= { x: 0, y: 0, n: 0 }; p.x += c.x; p.y += c.y; p.n++; }
  for (const r of REGIONS) {
    const near = REGIONS.filter(q => color[q] !== undefined)
      .sort((a, b) => Math.hypot(pos[a].x / pos[a].n - pos[r].x / pos[r].n, pos[a].y / pos[a].n - pos[r].y / pos[r].n)
        - Math.hypot(pos[b].x / pos[b].n - pos[r].x / pos[r].n, pos[b].y / pos[b].n - pos[r].y / pos[r].n)).slice(0, 8);
    const taken = new Set(near.map(q => color[q]));
    const pick = [...Array(PAL).keys()].filter(i => !taken.has(i)).sort((a, b) => used[a] - used[b])[0] ?? 0;
    color[r] = pick; used[pick]++;
  }
  const style = document.createElement('style');
  style.textContent = REGIONS.map(r => `.r[data-g="${CSS.escape(r)}"]{--hint:var(--h${color[r] + 1})}`).join('\n');
  document.head.append(style);

  const roundsFor = (k, ids, sub) => [
    ...sizes.filter(n => n < ids.length).map(n => ({ kind: k, label: `Top ${n}`, sub, top: n })),
    { kind: k, label: `All ${ids.length}`, sub },
  ];

  return {
    key: O.key || C.iso3.toLowerCase() + 'cities',
    areas: C.list.map(c => ({ id: c.id, d: `M${c.x},${c.y}l0,0`, lx: c.x, ly: c.y, a: 1, g: c.adm })),
    borders: [],
    context: C.ctx,
    base: { land: C.land, lines: C.lines },
    dots: true,
    size: [C.w, C.h], pad: 16, maxZoom: 40, labelScale: 0.25, fly: { pad: 1.6, min: 1.5 / 40 },
    hintLabel: 'Color by region',
    exploreKind: 'en',
    explore: a => ({ code: BY[a].local || BY[a].en, title: BY[a].en, sub: [region(a), `#${rank(a)} · ${fmtPop(BY[a].pop)}`] }),
    rounds: [...roundsFor('en', ALL, 'English'), ...(LOCAL.length ? roundsFor('local', LOCAL, localLabel) : [])],
    kinds,
  };
})();
