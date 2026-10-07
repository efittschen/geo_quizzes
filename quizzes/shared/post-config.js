// Postcode quizzes: builds the QUIZ config for area-quiz.js from a map (DATA, GEO) and its postcode zones (POST,
// made by tools/postcodes.mjs). The page loads the map, post.js, sets POST_OPTS and then loads this file.
//   POST       { digits, mask, levels, bounds, area: { areaId: [finest zones] }, name: { zone: [regions, places] },
//                n: { zone: postcodes } }; levels are prefix lengths, coarse to fine ([0]: letter zones, one level)
//   POST_OPTS  { key, label? (letter zones: what they are called, e.g. 'Postcode areas'), rest? (letter zones: the
//                greyed rest of the code, e.g. '# #AA'), groups? (letter zones: [[title, 'AB DD …'], …] instead of
//                grouping by region), maxZoom?, labelScale?, borders? }
// One kind per level ("First digit", "Two digits", …), each zone a group of map areas drawn as one shape; an area
// lying in two zones answers for both. Areas are colored by first digit, so that hint is off for the first level.

const QUIZ = (() => {
  const P = POST, O = typeof POST_OPTS !== 'undefined' ? POST_OPTS : {};
  const LETTERS = P.levels[0] === 0;
  const uniq = a => [...new Set(a)];
  const cut = (z, l) => l ? z.slice(0, l) : z;
  const zonesOf = (a, l) => uniq((P.area[a] || []).map(z => cut(z, l)));
  const AREAS = DATA.reg.map(r => r.id);
  const FINE = P.levels[P.levels.length - 1];

  // "80xxx": the zone's characters, then the rest of the mask ("##-###" -> "00-xxx")
  const parts = z => {
    if (LETTERS) return [[z, 'hot'], [O.rest || '', 'cold']];
    let hot = '', cold = '', i = 0;
    for (const ch of P.mask) {
      if (ch === '#') { if (i < z.length) hot += z[i++]; else cold += 'x'; }
      else if (i < z.length) hot += ch; else cold += ch;
    }
    return [[hot, 'hot'], [cold, 'cold']];
  };
  const fmt = z => parts(z).map(p => p[0]).join('');
  const places = z => (P.name[z] || [])[1] || '';
  const regions = z => (P.name[z] || [])[0] || '';
  const count = z => P.n[z] ? `${P.n[z].toLocaleString('en-US')} ${P.n[z] === 1 ? 'postcode' : 'postcodes'}` : '';

  const WORD = { 1: 'First digit', 2: 'Two digits', 3: 'Three digits', 4: 'Four digits' };
  const labelOf = l => LETTERS ? O.label || 'Postcode areas' : WORD[l];
  const kindKey = l => LETTERS ? 'areas' : 'p' + l;

  const kinds = [], rounds = [];
  for (const l of P.levels) {
    const at = {}; // zone -> areas
    for (const a of AREAS) for (const z of zonesOf(a, l)) (at[z] ??= []).push(a);
    const ids = Object.keys(at).sort();
    const first = P.levels[0], coarse = !LETTERS && l === first && l === 1;
    // groups: letter zones by region, digit zones by first digit
    const custom = {};
    for (const [title, list] of O.groups || []) for (const z of list.split(/\s+/)) custom[z] = title;
    const groupOf = z => LETTERS ? custom[z] || regions(z).split(', ')[0] || 'Other' : z[0];
    const order = (O.groups || []).map(g => g[0]);
    const titles = uniq(ids.map(groupOf)).sort((a, b) => LETTERS && O.groups ? (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99) : 0), single = coarse || titles.length === 1;
    const groups = single ? [{ title: 'Zones', sub: '', ids }]
      : titles.map(t => ({ title: LETTERS ? t : fmt(t), sub: LETTERS ? '' : places(t), ids: ids.filter(z => groupOf(z) === t) }));
    kinds.push({
      key: kindKey(l), label: labelOf(l), sub: `${ids.length.toLocaleString('en-US')} zones`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups,
      areasOf: z => at[z],
      primary: a => zonesOf(a, l)[0],
      short: z => z, name: fmt,
      about: z => [places(z), regions(z), count(z)].filter(Boolean),
      clicked: a => `${zonesOf(a, l).map(fmt).join(' / ')} · ${places(zonesOf(a, l)[0]) || regions(zonesOf(a, l)[0])}`,
      prompt: 'dial', dial: parts,
      ...(coarse ? { hints: false } : {}), // the colors are the first digits
      ...(!coarse && !LETTERS ? { detail: { label: 'Show places', text: places } } : {}),
      chip: z => z, chipTitle: z => places(z) || regions(z),
    });
    // rounds: the whole level when small; else first digits (or regions) bundled into rounds of under 30, then all
    const kind = kindKey(l), word = labelOf(l);
    if (single || ids.length < (LETTERS ? 30 : 10)) { rounds.push({ kind, label: word }); continue; }
    const bundles = []; let cur = null;
    for (const g of groups) {
      if (LETTERS || !cur || cur.n + g.ids.length >= 30) { cur = { titles: [], n: 0 }; bundles.push(cur); }
      cur.titles.push(g.title); cur.n += g.ids.length;
    }
    const short = t => LETTERS ? t : t.replace(/[x\s-]+$/, '') + 'x'.repeat(l - 1);
    if (bundles.length > 1) for (const b of bundles) {
      if (LETTERS && b.n < 3) continue;
      rounds.push({ kind, label: LETTERS ? b.titles[0] : `${word} · ${b.titles.length > 1 ? `${short(b.titles[0])}–${short(b.titles[b.titles.length - 1])}` : short(b.titles[0])}`, groups: b.titles });
    }
    rounds.push({ kind, label: `All ${word.toLowerCase()}` });
  }

  const [[s, w], [n, e]] = P.bounds, zoom = O.maxZoom || 40;
  return {
    key: O.key,
    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: LETTERS ? r.id : ((P.area[r.id] || [''])[0][0] || '') })),
    borders: O.borders || [],
    context: DATA.ctx,
    proj: DATA.proj, kpu: DATA.kpu,
    size: [DATA.w, DATA.h], pad: 16, maxZoom: zoom, labelScale: O.labelScale || 0.25, fly: { pad: 1.6, min: 1.5 / zoom },
    geo: GEO,
    street: { bounds: [[s, w], [n, e]], maxBounds: [[s - 8, w - 12], [n + 8, e + 12]] },
    hintLabel: LETTERS ? 'Color zones' : 'Color by first digit',
    exploreKind: kindKey(FINE),
    explore: a => {
      const zs = zonesOf(a, FINE);
      return { code: zs.map(fmt).join(', '), title: places(zs[0]) || regions(zs[0]), sub: [regions(zs[0]), ...P.levels.slice(0, -1).reverse().map(l => `${fmt(cut(zs[0], l))} · ${places(cut(zs[0], l))}`)].filter(Boolean) };
    },
    rounds,
    kinds,
  };
})();
