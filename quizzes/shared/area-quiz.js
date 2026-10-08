// Shared engine for "click the right area" map quizzes. The page itself (panel and map) comes from ./quiz-page.js.
//
// A quiz page defines a global QUIZ config before loading this file:
//   key          the quiz's short name. What a page keeps in the browser is in the record of the page (its folder
//                name, see assets/js/store.js); the short name is how it was kept before, and what moves it over
//   areas        [{ id, d, lx, ly, a, g }]  SVG path, label point, size and hint-color group of each map area
//                (lx/ly/a may be left out: they're then computed from the path); top: true draws the area above
//                its neighbours with its own border (e.g. a tiny city enlarged so it can be seen); dot: true draws
//                it (a zero-length path "Mx,yl0,0") as a dot that keeps its size on screen (Monaco on a world map)
//   borders      [d]                         thicker outlines drawn on top (states, federal districts…)
//   size, pad    SVG map size [w, h] and padding; maxZoom, labelScale, fly: { pad, min } tune the quiz map
//   home         optional [x0, y0, x1, y1]: the part of the map the page shows when zoomed out (a continent of the
//                world map); flyAnswer: true flies to an answer that is shown when it can't be seen in the view
//   geo          { [areaId]: { rings: [[[lat, lng]…]…], lab: [lat, lng] } } for the street map
//   street       { bounds, maxBounds } in [lat, lng]
//   hintLabel    text of the "color areas" option
//   kinds        what can be asked, see KINDS below
//   explore(areaId) -> { code, title, sub, photos }  (sub may be an array of lines; photos: pictures to show, as
//                returned by a kind's photo(id))
//   context      optional SVG path drawn under the areas (neighbouring countries), not clickable
//   base, dots   city quizzes: base { land, lines } draws the country and its region borders under the areas;
//                dots: true draws each area (a zero-length path "Mx,yl0,0") as a dot that keeps its size on
//                screen at every zoom, with its label above it (see shared/city-config.js)
//   geo/street   leave out to offer the quiz map only (no street map, and no overlay: the street map with the
//                quiz map's outlines and colors on it)
//   free         city quizzes: { span, measure(point, id) -> [km shown, km scored] } also offers playing on the map
//                itself: the dots stay hidden, a click anywhere answers, and points fall with the distance to the
//                city (GeoGuessr's 5000 · e^(−10 · d / D), D = span, the map's diagonal in km)
//   streets      city quizzes: the cities.js the map is drawn from (its projection, land and insets). Offers the street
//                map behind the quiz map, with the region borders on it (overlay) or alone: ./map-tiles.js
//   proj, kpu    how the quiz map is projected and its km per map unit (from its data.js): Street View coverage can
//                then be laid on the quiz map too, not only on the street map (see useCover)
//   hintsDefault whether "color areas" starts ticked (default true)
//   lettersLabel optional option text: show every area's label while playing
//   (per kind)   merge: false keeps every area drawn separately even when the kind's items group them;
//                unitColors(areas) -> [css colors] picks each group's color from its own list (default: the palette)
//   rounds       ready-made quizzes offered on the setup screen: [{ kind, label, sub?, and one of groups: [group
//                titles] | top: N (largest first, or rank: i for another ranking) | preset: label | ids: [...] or
//                () => [...] }]; with none of them a round is every item of its kind. Rounds are grouped by size into
//                Beginner (under 10), Intermediate (under 30), Hard (under 60) and Expert: size alone sets a round's
//                level. Rounds of kinds not on the page are left out. Without rounds, the engine makes them by one
//                rule for every quiz (see standardRounds): what the layer quizzes of shared/layer-config.js get.
//                key: tells apart rounds with the same label; box: [x0, y0, x1, y1] frames a part of the map while
//                the round is chosen and played.
//   (languages)  a kind can ask another kind's items in another language: of: '<that kind's key>', and both carry
//                lang: the language's name ('English', 'Thai'). It needs no rounds of its own: every round of the
//                kind it follows offers it as a language to pick, in the round's own box (where a round's sub would
//                be), with the round's items that have a name in that language. The language picked last is the one
//                every box starts with; best scores, stars and review cards stay per kind.
//
// One config can serve several pages: <body data-kinds="states" data-key="dddstates"> keeps only the listed
// kinds; each page keeps its own scores (data-key: its short name, see `key`), e.g. an area-code quiz and a states
// quiz on the same map.
//
// Besides the rounds, players can pick their own items ("Custom quiz"), save them under a name (localStorage)
// and share them as a link: ?quiz=<kind>.<bits>&name=…, one bit per item of the kind, in the kind's order.
//
// Seterra-style play: a wrong click flashes red and you try again; after MAX_TRIES wrong clicks the
// answer flashes and you click it to move on. Answered areas are colored by the number of attempts.

(() => {
  const Q = { ...QUIZ };
  if (typeof MERCATOR === 'object') MERCATOR.quiz(Q); // the quiz map in Web Mercator, every part at its real place (mercator.js)
  const pageKinds = document.body.dataset.kinds;
  if (pageKinds) Q.kinds = Q.kinds.filter(k => pageKinds.split(/\s+/).includes(k.key));
  // A layer that only groups the layers below it into rounds (groupsOnly) is not asked itself: see standardRounds.
  const GROUPING = Q.kinds.filter(k => k.groupsOnly);
  Q.kinds = Q.kinds.filter(k => !k.groupsOnly);
  if (document.body.dataset.key) Q.key = document.body.dataset.key;
  // Explore labels by the page's own first kind if the configured one isn't on this page.
  if (!Q.kinds.some(k => k.key === Q.exploreKind)) Q.exploreKind = Q.kinds[0].key;
  const HERE = document.currentScript.src.replace(/[^/]*$/, ''); // where the shared scripts are
  const MAX_TRIES = 3;
  const RESULT_CLASS = ['got', 't2', 't3', 'miss']; // index = wrong clicks before the right one
  // Standard OpenStreetMap tiles: free for light use with attribution, no API key needed.
  const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const NS = 'http://www.w3.org/2000/svg';
  const $ = id => document.getElementById(id);
  const svg = $('map'), gR = $('regions'), gB = $('borders'), gL = $('labels');
  const hoverUse = $('hoverUse'), ansUse = $('ansUse');
  const AREA = {}, EL = {};

  // The rings of an SVG path made of M/L/Z commands, each a list of [x, y] points.
  function pathRings(d) {
    const toks = d.match(/[MmLlZz]|-?(?:\d+\.?\d*|\.\d+)/g), rings = []; let ring = null, x = 0, y = 0, sx = 0, sy = 0, mode = 'M';
    for (let i = 0; i < toks.length;) {
      const t = toks[i];
      if (/[A-Za-z]/.test(t)) { i++; if (t === 'z' || t === 'Z') { if (ring) rings.push(ring); ring = null; x = sx; y = sy; } else mode = t; continue; }
      const a = +toks[i], b = +toks[i + 1]; i += 2;
      if (mode === 'M' || mode === 'm') {
        if (mode === 'm') { x += a; y += b; } else { x = a; y = b; }
        if (ring) rings.push(ring); ring = [[x, y]]; sx = x; sy = y; mode = mode === 'M' ? 'L' : 'l';
      } else { if (mode === 'l') { x += a; y += b; } else { x = a; y = b; } ring.push([x, y]); }
    }
    if (ring) rings.push(ring);
    return rings;
  }
  // Label point (centroid of the largest ring) and area (shoelace) of such a path.
  function pathStats(d) {
    const stats = pathRings(d).map(r => {
      let A = 0, cx = 0, cy = 0;
      for (let i = 0; i < r.length; i++) { const [x0, y0] = r[i], [x1, y1] = r[(i + 1) % r.length], c = x0 * y1 - x1 * y0; A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c; }
      return { A: A / 2, cx: cx / (3 * A), cy: cy / (3 * A) };
    });
    const big = stats.reduce((m, r) => Math.abs(r.A) > Math.abs(m.A) ? r : m);
    return { lx: big.cx, ly: big.cy, a: stats.reduce((sum, r) => sum + Math.abs(r.A), 0) };
  }

  /* ---------- build quiz map ---------- */
  for (const a of Q.areas) {
    if (a.lx === undefined || a.a === undefined) Object.assign(a, pathStats(a.d), a.lx === undefined ? {} : { lx: a.lx, ly: a.ly });
    AREA[a.id] = a;
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', a.d); p.setAttribute('class', 'r');
    p.dataset.a = a.id; p.dataset.g = a.g;
    if (a.top) p.classList.add('top');
    if (a.dot) p.classList.add('dot');
    gR.appendChild(p); EL[a.id] = p;
  }
  // Areas marked top stay above everything else in the map (they may overlap their neighbours).
  const raiseTops = () => { for (const a of Q.areas) if (a.top) gR.appendChild(EL[a.id]); };
  raiseTops();
  if (Q.context) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', Q.context); $('ctx').appendChild(p); }
  // A quiz map in Web Mercator lies on the plain map of the world (Q.world, see mercator.js; world.js is fetched
  // unless it is the page's own map): the neighbours, and what lies between a country's far-off parts.
  if (Q.world && typeof MERCATOR === 'object') {
    const lay = () => {
      const p = document.createElementNS(NS, 'path'); p.setAttribute('d', WORLD.reg.filter(r => r.a).map(r => r.d).join(''));
      for (const [s, dx, dy] of MERCATOR.world(WORLD, Q.proj, Q.size[0])) { // (a second time for a map over the 180th meridian)
        const g = document.createElementNS(NS, 'g'); g.setAttribute('transform', `translate(${dx},${dy}) scale(${s})`);
        g.append(p.cloneNode()); $('ctx').prepend(g);
      }
      const note = $('stage').querySelector('.note'); if (note && !/Natural Earth/.test(note.textContent)) note.append(' · World: Natural Earth');
    };
    if (typeof WORLD === 'object') lay(); else { const s = document.createElement('script'); s.src = HERE + 'world.js'; s.onload = lay; document.head.append(s); }
  }
  // City quizzes: the country's land and its region borders under the clickable dots (Q.base = { land, lines }).
  if (Q.base) for (const cls of ['land', 'lines']) if (Q.base[cls]) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', Q.base[cls]); p.setAttribute('class', cls); $('ctx').appendChild(p); }
  if (Q.dots) svg.classList.add('dots');
  for (const d of Q.borders) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); gB.appendChild(p); }
  const AREAS = Q.areas.map(a => a.id);
  const gPins = document.createElementNS(NS, 'g'); gPins.id = 'pins'; svg.appendChild(gPins);
  const gFree = document.createElementNS(NS, 'g'); gFree.id = 'free'; svg.insertBefore(gFree, gR); // map play: the last guess, under the dots
  let streetPin = null;
  let tiles = null; // map tiles in the quiz map's own projection (map-tiles.js), once asked for: see withTiles

  /* ---------- what can be asked ----------
     Each kind: key, label, sub, noun [one, many], pickTitle, groups [{ title, sub, ids }],
     areasOf(id), short(id) for labels, name(id), about(id), clicked(areaId) describes a wrong click,
     prompt 'dial' | 'name', chip(id), chipTitle(id), optional hints: false (coloring would give
     the answer away), detail: { label, text(id) } for an optional hint under the prompt, presets: [{ label, ids }]
     for quick-select buttons next to All / None, rankings: [{ label, order, expand? }] for "Top N by …"
     (expand(id) widens each pick, e.g. ranking cities, then taking every code dialed there; a "largest area"
     ranking comes first unless areaRank: false, with each area's size shared between the items covering it,
     so a code alone in its area outranks one of five codes sharing an area of the same size), primary(areaId) naming the item a click on that area "is", and chipClass(id).
     prompt 'text' shows text(id) -> { text, cls, lang } on the sign card instead. prompt 'photo' shows a picture,
     photo(id) -> { src, alt, label, link }: a click enlarges it, and once answered it comes with its label and
     link (e.g. the place in Street View); missed pictures are listed as pictures. areaLabel(areaId) labels
     each area on its own (e.g. a script's letter) instead of one label per item; flashArea: true flashes
     only the clicked area on a wrong click; clicked(areaId, targetId) may use the target; about(id) and
     presets' ids may be arrays or functions returning them. dim: false keeps every area lit while playing
     (when the answer is the whole map's business, dimming the rest would give it away). labelPerArea: true
     labels every area with all the items dialed there (main one first), so a code covering two areas shows
     on both. clickAll: true makes an item covering several areas need a click on each of them on the quiz
     map and on the overlay, with a counter on the map; on the street map one click still counts and highlights
     them all.
     dial(id) -> [[text, 'hot' | 'cold'], …] shows the dial code in parts (e.g. only the prefix bold); pin(id) ->
     { x, y, ll, label } marks a place (e.g. the town the code belongs to) after the question is answered. */
  const kindOf = k => {
    const ids = k.groups.flatMap(g => g.ids);
    const areas = Object.fromEntries(ids.map(id => [id, k.areasOf(id)]));
    const at = {}; // areaId -> items that include it
    for (const id of ids) for (const a of areas[id]) (at[a] ??= []).push(id);
    const size = id => areas[id].reduce((s, a) => s + (AREA[a].size ?? AREA[a].a ?? 0) / at[a].length, 0); // (size: an area's on an equal-area map, where the quiz map is Mercator)
    const rankings = [...(k.areaRank === false ? [] : [{ label: 'largest area', order: ids.slice().sort((a, b) => size(b) - size(a)) }]), ...(k.rankings || [])];
    const many = k.noun[1], count = new Set(ids).size;
    return { ...k, ids, areas, at, rankings, primary: k.primary || (a => (at[a] || [])[0]),
      sub: k.sub ?? `${count.toLocaleString('en-US')} ${count === 1 ? k.noun[0] : many}`, pickTitle: k.pickTitle ?? `${many[0].toUpperCase()}${many.slice(1)} to practice` };
  };
  const KINDS = Object.fromEntries(Q.kinds.map(k => [k.key, kindOf(k)]));

  /* ---------- rounds: ready-made quizzes, grouped by how many items they ask ---------- */
  const TIERS = [[10, 'Beginner'], [30, 'Intermediate'], [60, 'Hard'], [Infinity, 'Expert']];
  const tierOf = n => TIERS.findIndex(([max]) => n < max);
  const uniq = ids => [...new Set(ids)];
  const call = v => typeof v === 'function' ? v() : v;
  const presetOf = r => (KINDS[r.kind].presets || []).find(p => p.label === r.preset);
  function roundIds(r) {
    const K = KINDS[r.kind];
    let ids = K.ids;
    if (r.ids) ids = call(r.ids);
    else if (r.groups) ids = K.groups.filter(g => r.groups.includes(g.title)).flatMap(g => g.ids);
    else if (r.preset) ids = call(presetOf(r).ids);
    else if (r.top) { const rank = K.rankings[r.rank || 0]; ids = rank.order.slice(0, r.top); if (rank.expand) ids = ids.flatMap(rank.expand); }
    return uniq(ids).filter(id => K.areas[id]);
  }
  // The rounds of a quiz that brings none: the same rule for every layer of every quiz, coarse layers first.
  //   A layer of under 10 items is one round, named after the layer.
  //   A bigger layer is cut by the layers above it (the items inside each of their units) and by its own groups,
  //   and ends with all of it. Names: one round per unit ("Bavaria"), of 3 items or more. Codes: by the coarsest
  //   layer of codes above (the first digit), neighbours joined while a round stays under 30 ("Two digits · 02x–04x").
  //   Its quick selections (Big cities) are rounds too. No round has a note; kinds in another language have none.
  //   A layer marked groupsOnly has no round of its own and only cuts the layers below it: units named after where
  //   they are ("North-West"), which ask nothing.
  function standardRounds() {
    const layers = [...Q.kinds.filter(k => !KINDS[k.of]).map(k => KINDS[k.key]), ...GROUPING.map(kindOf)].map(K => ({ K, ids: uniq(K.ids), code: !['name', 'text', 'photo'].includes(K.prompt) }));
    layers.sort((a, b) => a.ids.length - b.ids.length);
    // the units of a coarser layer that hold this layer's items: [[title, ids]…], or null if they don't hold nearly all
    const cutBy = (L, P) => {
      const held_ = new Map(P.ids.map(p => [p, []])), has = (a, p) => (P.K.at[a] || []).includes(p);
      for (const id of L.ids) { const areas = L.K.areas[id]; for (const p of areas.length ? P.K.at[areas[0]] || [] : []) if (held_.has(p) && areas.every(a => has(a, p))) held_.get(p).push(id); }
      const units = P.ids.map(p => [P.K.short(p), held_.get(p), P.K.name(p)]).filter(u => u[1].length);
      const held = new Set(units.flatMap(u => u[1])).size, twice = units.reduce((n, u) => n + u[1].length, 0) - held;
      return units.length > 1 && held >= 0.9 * L.ids.length && twice <= 0.1 * L.ids.length ? units : null;
    };
    const rounds = [];
    for (const [i, L] of layers.entries()) {
      const { K, ids } = L, kind = K.key, n = ids.length;
      if (K.groupsOnly) continue;
      if (n < 10) { rounds.push({ kind, label: K.label }); continue; }
      // (two cuts can name a unit alike, "North" of 4 regions and of 6: the later one says which cut it is)
      // A round of a small part of the map frames that part (from its areas' middles and sizes).
      const boxOf = list => {
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const id of list) for (const a of K.areas[id]) { const A = AREA[a], r = Math.sqrt(A.a || 0) * 0.7; x0 = Math.min(x0, A.lx - r); y0 = Math.min(y0, A.ly - r); x1 = Math.max(x1, A.lx + r); y1 = Math.max(y1, A.ly + r); }
        return (x1 - x0) * (y1 - y0) < 0.25 * Q.size[0] * Q.size[1] ? [x0, y0, x1, y1] : undefined;
      };
      const seen = new Set([ids.slice().sort().join('|')]), named = new Set(), add = (label, list, key, cut) => {
        const sig = list.slice().sort().join('|');
        if (list.length < 3 || seen.has(sig)) return;
        if (named.has(label) && cut) label = `${label} · ${cut}`;
        seen.add(sig); named.add(label); rounds.push({ kind, label, key, ids: list, box: boxOf(list) });
      };
      for (const p of K.presets || []) if (typeof p.ids !== 'function') add(p.label, uniq(p.ids).filter(id => K.areas[id]), 'preset ' + p.label);
      const above = layers.slice(0, i).map(P => [P, cutBy(L, P)]).filter(c => c[1]);
      const own = K.groups.length > 1 ? K.groups.map(g => [g.title, uniq(g.ids)]) : null;
      if (L.code) {
        // codes: the coarsest cut by codes above, else the layer's own groups; neighbours joined while under 30
        const cut = (above.find(c => c[0].code) || [])[1] || own, digits = cut && cut.every(u => /^[\d(+][\d\s()x·…-]*$/.test(u[0]));
        if (cut && digits) {
          const bundles = [];
          for (const u of cut) { const b = bundles[bundles.length - 1]; if (b && (b.ids.length < 3 || b.ids.length + u[1].length < 30)) { b.to = u[0]; b.ids.push(...u[1]); } else bundles.push({ from: u[0], to: u[0], ids: [...u[1]] }); }
          if (bundles.length > 1 && bundles[bundles.length - 1].ids.length < 3) { const last = bundles.pop(), b = bundles[bundles.length - 1]; b.to = last.to; b.ids.push(...last.ids); }
          if (bundles.length > 1) for (const b of bundles) add(`${K.label} · ${b.from === b.to ? b.from : `${b.from}–${b.to}`}`, uniq(b.ids), 'cut ' + b.from);
        } else if (cut) for (const u of cut) add(u[2] || u[0], u[1], 'cut ' + u[0]); // units with names (a state's codes): by name
      } else {
        for (const [P, units] of above) if (!P.code) for (const u of units) add(u[2] || u[0], u[1], `in ${P.K.key} ${u[0]}`, P.K.label); // by the unit's name, not its short form ("Texas", not "TX")
        if (own) for (const u of own) add(u[0], u[1], 'group ' + u[0], 'groups');
      }
      const proper = /^\p{Lu}/u.test(K.noun[1]);
      rounds.push({ kind, label: rounds.some(r => r.kind === kind) ? `All ${proper ? K.label : K.label[0].toLowerCase() + K.label.slice(1)}` : K.label });
    }
    return rounds;
  }
  let ROUNDS = (Q.rounds || standardRounds()).filter(r => KINDS[r.kind]);
  if (!ROUNDS.length) ROUNDS = Q.kinds.filter(k => !KINDS[k.of]).map(k => ({ kind: k.key, label: k.label, sub: k.sub }));
  // Rounds drawn at random (e.g. one sign per script) have no fixed items, so no best score either.
  ROUNDS = ROUNDS.map(r => ({ ...r, id: r.kind + ':' + (r.key || r.label), random: typeof r.ids === 'function' || (!!r.preset && typeof presetOf(r).ids === 'function') }));
  // A round in another language (a kind that is `of` the round's kind): the same round with the items that have a
  // name in that language. `of` is the round it belongs to, whose box offers it.
  ROUNDS = ROUNDS.flatMap(r => [r, ...Q.kinds.filter(k => k.of === r.kind && KINDS[k.key]).map(k => {
    const mine = () => roundIds(r).filter(id => KINDS[k.key].areas[id]);
    return { ...r, kind: k.key, id: k.key + ':' + (r.key || r.label), of: r, ids: r.random ? mine : mine(), groups: null, preset: null, top: null };
  }).filter(v => v.random || v.ids.length)]);

  /* ---------- pan & zoom for the quiz map (viewBox based) ---------- */
  const [MW, MH] = Q.size, PAD = Q.pad;
  let base = { x: 0, y: 0, w: MW, h: MH }, vb = { ...base };
  svg.setAttribute('viewBox', `0 0 ${MW} ${MH}`);
  const HOME = Q.home || [0, 0, MW, MH]; // what the map shows when zoomed out: all of it, or the page's part
  function fit() {
    const r = svg.getBoundingClientRect(); if (!r.width || !r.height) return;
    const a = r.width / r.height;
    let w = HOME[2] - HOME[0] + PAD * 2, h = HOME[3] - HOME[1] + PAD * 2;
    if (w / h < a) w = h * a; else h = w / a;
    base = { x: (HOME[0] + HOME[2]) / 2 - w / 2, y: (HOME[1] + HOME[3]) / 2 - h / 2, w, h };
  }
  function apply() {
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`); sizeLabels(); syncDetail();
    if (tiles) { const r = svg.getBoundingClientRect(), s = Math.min(r.width / vb.w, r.height / vb.h); if (s) tiles.view(vb.x - (r.width / s - vb.w) / 2, vb.y - (r.height / s - vb.h) / 2, s); }
  }
  function scale() { const r = svg.getBoundingClientRect(); return Math.min(r.width / vb.w, r.height / vb.h) || 1; }
  function toSvg(cx, cy, v) {
    const r = svg.getBoundingClientRect(); const s = Math.min(r.width / v.w, r.height / v.h);
    const ox = (r.width - v.w * s) / 2, oy = (r.height - v.h * s) / 2;
    return { x: v.x + (cx - r.left - ox) / s, y: v.y + (cy - r.top - oy) / s };
  }
  function clampV(v) {
    const minW = base.w / Q.maxZoom, maxW = base.w * (Q.world ? 3 : 1.15); // (a map lying on the world's shows more of it when zoomed out)
    const k = Math.min(Math.max(v.w, minW), maxW) / v.w;
    if (k !== 1) { const cx = v.x + v.w / 2, cy = v.y + v.h / 2; v.w *= k; v.h *= k; v.x = cx - v.w / 2; v.y = cy - v.h / 2; }
    const mx = v.w * .5, my = v.h * .5;
    v.x = Math.min(Math.max(v.x, -mx), MW - v.w + mx); v.y = Math.min(Math.max(v.y, -my), MH - v.h + my);
    return v;
  }
  function zoomAt(cx, cy, f, from = vb) {
    const p = toSvg(cx, cy, from); const w = from.w / f, h = from.h / f;
    const r = svg.getBoundingClientRect(); const s = Math.min(r.width / w, r.height / h);
    const ox = (r.width - w * s) / 2, oy = (r.height - h * s) / 2;
    vb = clampV({ x: p.x - (cx - r.left - ox) / s, y: p.y - (cy - r.top - oy) / s, w, h }); apply();
  }
  function zoomCenter(f) { const r = svg.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, f); }
  function resetView() { fit(); vb = { ...base }; apply(); }
  // Show a part of the map, [x0, y0, x1, y1] (a round's box), or all of it.
  function frame(box) {
    resetView();
    if (!box) return;
    const ar = base.w / base.h, w = Math.max(box[2] - box[0], (box[3] - box[1]) * ar) + PAD * 2, h = w / ar;
    vb = clampV({ x: (box[0] + box[2]) / 2 - w / 2, y: (box[1] + box[3]) / 2 - h / 2, w, h }); apply();
  }
  // The view to go back to: the box of the round being played or chosen.
  const frameRound = () => {
    const r = view === 'play' ? { kind: G.kind, ids: G.items, box: G.box } : view === 'setup' ? current() : {};
    if (onStreet()) frameStreet(r); else frame(r.box);
  };
  let raf = 0;
  svg.addEventListener('wheel', e => { e.preventDefault(); const f = Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0022)); zoomAt(e.clientX, e.clientY, f); }, { passive: false });
  $('zIn').onclick = () => zoomCenter(1.6); $('zOut').onclick = () => zoomCenter(1 / 1.6); $('zFit').onclick = () => frameRound();
  window.addEventListener('resize', () => {
    if (!svg.getBoundingClientRect().width) return;
    const c = { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 }; const k = vb.w / base.w;
    fit(); vb = { w: base.w * k, h: base.h * k }; vb.x = c.x - vb.w / 2; vb.y = c.y - vb.h / 2; vb = clampV(vb); apply();
  });

  const pts = new Map(); let drag = null, pinch = null, downArea = null, moved = false;
  svg.addEventListener('pointerdown', e => {
    svg.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) { drag = { x: e.clientX, y: e.clientY, v: { ...vb }, s: scale() }; moved = false; downArea = e.target.dataset ? e.target.dataset.a : null; }
    else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, v: { ...vb } }; moved = true; drag = null; }
  });
  svg.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) { if (e.pointerType === 'mouse') hover(e.target.dataset && e.target.dataset.a); return; }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size === 2) {
      const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const p = toSvg(pinch.m.x, pinch.m.y, pinch.v); const f = d / pinch.d; const w = pinch.v.w / f, h = pinch.v.h / f;
      const r = svg.getBoundingClientRect(); const s = Math.min(r.width / w, r.height / h); const ox = (r.width - w * s) / 2, oy = (r.height - h * s) / 2;
      vb = clampV({ x: p.x - (m.x - r.left - ox) / s, y: p.y - (m.y - r.top - oy) / s, w, h });
      cancelAnimationFrame(raf); raf = requestAnimationFrame(apply);
    } else if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!moved && Math.hypot(dx, dy) > 6) { moved = true; svg.classList.add('grab'); }
      if (moved) { vb = clampV({ ...drag.v, x: drag.v.x - dx / drag.s, y: drag.v.y - dy / drag.s }); cancelAnimationFrame(raf); raf = requestAnimationFrame(apply); }
    }
  });
  function up(e) {
    const had = pts.delete(e.pointerId); // false when the press began outside the map
    if (pts.size < 2) pinch = null;
    if (pts.size === 0) {
      svg.classList.remove('grab');
      if (!moved && e.type === 'pointerup') {
        // Map play: only a plain click or tap that began on the map answers.
        if (mapStyle === 'free' && view === 'play') { if (had && (e.pointerType !== 'mouse' || e.button === 0)) answerFree(toSvg(e.clientX, e.clientY, vb)); }
        else if (downArea) pick(downArea);
      }
      drag = null; downArea = null;
    }
  }
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('pointerleave', () => hover(null));

  /* ---------- street map (hard mode), and the overlay: the same map with the areas drawn on it ---------- */
  let lmap = null;
  const SP = {}; // polygon per area
  const CAN_HOVER = matchMedia('(hover: hover)').matches;
  // Tiles only look crisp at whole zoom levels, so zoom in one extra step if most of the country still fits.
  function fitHome() {
    const b = L.latLngBounds(Q.street.bounds), z = lmap.getBoundsZoom(b), size = lmap.getSize();
    const nw = lmap.project(b.getNorthWest(), z + 1), se = lmap.project(b.getSouthEast(), z + 1);
    const fits = Math.min(size.x / (se.x - nw.x), size.y / (se.y - nw.y)) >= 0.8;
    lmap.setView(b.getCenter(), fits ? z + 1 : z);
  }
  // The street map's layers load `ahead` pixels beyond the edge of the map, and look for new tiles while it is dragged
  // (on a phone too, and twice as often as Leaflet's default): so a move finds its sides there.
  const loadsAhead = Layer => Layer.extend({
    options: { updateInterval: 100, updateWhenIdle: false },
    _getTiledPixelBounds(center) {
      const b = Layer.prototype._getTiledPixelBounds.call(this, center), pad = L.point(this.options.ahead, this.options.ahead);
      return L.bounds(b.min.subtract(pad), b.max.add(pad));
    },
  });
  function initStreet() {
    if (lmap) return;
    lmap = L.map('street', { minZoom: 2, maxBounds: Q.street.maxBounds });
    lmap.attributionControl.setPrefix(false); // credits name the map data only, not the Leaflet library
    fitHome();
    new (loadsAhead(L.TileLayer))(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION, ahead: 256 }).addTo(lmap); // one ring of tiles: OpenStreetMap asks not to fetch much ahead
    // The areas get a pane of their own, under pins and labels: the overlay tints the map with it as a whole.
    lmap.createPane('areas').style.zIndex = 350;
    for (const a of AREAS) {
      const poly = L.polygon(Q.geo[a].rings, { pane: 'areas', stroke: false, fillOpacity: 0, bubblingMouseEvents: false }).addTo(lmap);
      // 'r' and data-g as on the quiz map, so the areas take the quiz's hint colors on the overlay.
      const el = poly.getElement();
      el.classList.add('ar', 'r'); el.dataset.g = AREA[a].g;
      if (AREA[a].top) el.classList.add('top');
      poly.on('click', () => pick(a));
      if (CAN_HOVER) poly.on({ mouseover: () => hover(a), mouseout: () => hover(null) });
      SP[a] = poly;
    }
    lmap.on('zoomend', syncOverlayDetail);
  }

  // A round's box is in quiz-map units, so the overlay shows the round's areas instead (or all of the map, without a
  // box). The street map alone stays as it is.
  function frameStreet({ kind, ids, box }) {
    if (!overlaid()) return;
    if (box && ids.length) lmap.fitBounds(L.featureGroup(ids.flatMap(id => KINDS[kind].areas[id]).map(a => SP[a])).getBounds(), { padding: [30, 30] });
    else fitHome();
  }

  /* ---------- one interface over the maps ---------- */
  let mapStyle = 'quiz';
  const onStreet = () => mapStyle === 'street' || mapStyle === 'overlay'; // on the street map, with or without the areas
  const overlaid = () => mapStyle === 'overlay';
  const plain = () => mapStyle === 'street'; // the street map alone: nothing may give the borders away
  const pathsOf = areas => onStreet() ? areas.map(a => SP[a].getElement()) : areas.map(a => EL[a]);
  // An area's shape on the quiz map and, once the street map exists, on that too.
  const shapesOf = a => SP[a] ? [EL[a], SP[a].getElement()] : [EL[a]];
  // Classes the stylesheet reads on either map (hints, fade, merged, picking).
  const mapClass = (cls, on) => { svg.classList.toggle(cls, on); $('street').classList.toggle(cls, on); };

  // The middle of what the map in use shows, and its size as the street map's zoom level (256 · 2^zoom pixels around
  // the globe): the quiz map is Web Mercator like the street map (mercator.js), so one says it for the other.
  function placeInView() {
    if (onStreet() && lmap) { const c = lmap.getCenter(); return { lat: c.lat, lng: c.lng, zoom: lmap.getZoom() }; }
    const P = Q.proj;
    return { lat: MERCATOR.latOf(P.y0 - (vb.y + vb.h / 2) / P.k), lng: P.lng0 + (vb.x + vb.w / 2) / P.k, zoom: Math.log2(scale() * P.k * 360 / 256) };
  }
  // keep: the picker changed the map (no round is starting), so the new map shows the place the old one showed, at
  // the same size: only the look changes. Else each map starts from its whole.
  function useMap(style, keep) {
    const was = keep && typeof MERCATOR === 'object' && Q.proj && Q.proj.type === 'mercator' ? placeInView() : null;
    clearLabels(); hover(null);
    mapStyle = style;
    $('street').hidden = !onStreet();
    $('street').classList.toggle('overlay', overlaid());
    svg.style.display = onStreet() ? 'none' : '';
    $('zoomCtl').hidden = onStreet();
    svg.classList.toggle('free', style === 'free');
    if (onStreet()) {
      initStreet(); lmap.invalidateSize();
      // (the street map keeps to whole zoom levels on its own: not for this one step)
      if (was) { const snap = lmap.options.zoomSnap; lmap.options.zoomSnap = 0; lmap.setView([was.lat, was.lng], was.zoom, { animate: false }); lmap.options.zoomSnap = snap; }
      else fitHome();
    } else if (was) {
      fit();
      const P = Q.proj, r = svg.getBoundingClientRect(), s = 256 * 2 ** was.zoom / 360 / P.k, w = r.width / s, h = r.height / s;
      vb = clampV({ x: (was.lng - P.lng0) * P.k - w / 2, y: (P.y0 - MERCATOR.my(was.lat)) * P.k - h / 2, w, h }); apply();
    } else resetView();
    syncHints(); syncCover();
  }
  function activeKind() { return view === 'explore' ? Q.exploreKind : view === 'setup' ? choiceKind() : G.kind; }
  // The item under the pointer: outlined on the quiz map, tinted on the overlay.
  let hovered = [];
  function hover(area) {
    const K = KINDS[activeKind()], id = area && K.primary(area);
    for (const p of hovered) p.classList.remove('hov');
    hovered = id && overlaid() ? pathsOf(K.areas[id]) : [];
    for (const p of hovered) p.classList.add('hov');
    hoverUse.setAttribute('d', id && !onStreet() ? K.areas[id].map(a => AREA[a].d).join(' ') : '');
  }
  function mark(areas) { ansUse.setAttribute('d', areas && !onStreet() ? areas.map(a => AREA[a].d).join(' ') : ''); }
  function flyTo(areas) {
    // Not too close: zoom level 9, or two steps closer than the whole map where that is a city.
    if (onStreet()) { lmap.fitBounds(L.featureGroup(areas.map(a => SP[a])).getBounds(), { padding: [60, 60], maxZoom: Math.max(9, lmap.getBoundsZoom(L.latLngBounds(Q.street.bounds)) + 2) }); return; }
    const bs = areas.map(a => EL[a].getBBox());
    const x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y));
    const x1 = Math.max(...bs.map(b => b.x + b.width)), y1 = Math.max(...bs.map(b => b.y + b.height));
    const ar = base.w / base.h;
    const w = Math.max((x1 - x0) * Q.fly.pad, (y1 - y0) * Q.fly.pad * ar, base.w * Q.fly.min); const h = w / ar;
    vb = clampV({ x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h }); apply();
  }

  function flyToPts(ps) {
    const xs = ps.map(p => p.x), ys = ps.map(p => p.y), ar = base.w / base.h;
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const w = Math.max((x1 - x0) * Q.fly.pad, (y1 - y0) * Q.fly.pad * ar, base.w * Q.fly.min, vb.w), h = w / ar; // never zooms in
    vb = clampV({ x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h }); apply();
  }

  /* ---------- labels: one per item of a kind; items at the same spot share a label ("495 / 499") ---------- */
  let labelKind = null, ENTRIES = [], ENTRY_OF = {}, AREA_ENTRY = {};
  function itemCentre(areas) {
    let a = 0, x = 0, y = 0, lat = 0, lng = 0;
    for (const id of areas) {
      const r = AREA[id], w = r.a || 1; a += w; x += r.lx * w; y += r.ly * w;
      if (Q.geo) { lat += Q.geo[id].lab[0] * w; lng += Q.geo[id].lab[1] * w; }
    }
    const m = { x: x / a, y: y / a, ll: [lat / a, lng / a], area: a };
    if (areas.length > 1) {
      // Items spread over several areas (e.g. a zone covering Central Russia and the Far East) can have
      // their average point outside all of them, so put the label on the member area closest to it.
      const near = areas.reduce((b, id) => Math.hypot(AREA[id].lx - m.x, AREA[id].ly - m.y) < Math.hypot(AREA[b].lx - m.x, AREA[b].ly - m.y) ? id : b);
      Object.assign(m, { x: AREA[near].lx, y: AREA[near].ly, ll: Q.geo ? Q.geo[near].lab : null });
    }
    return m;
  }
  function buildLabels(kind) {
    if (labelKind === kind) return;
    clearLabels();
    labelKind = kind; ENTRIES = []; ENTRY_OF = {}; AREA_ENTRY = {}; gL.replaceChildren();
    const K = KINDS[kind], byPos = {};
    const entry = (key, m) => {
      let e = byPos[key];
      if (!e) {
        e = byPos[key] = { ...m, ids: [], shown: new Set(), marker: null, el: document.createElementNS(NS, 'text') };
        e.el.setAttribute('x', m.x); e.el.setAttribute('y', m.y); e.el.setAttribute('class', 'off');
        gL.appendChild(e.el); ENTRIES.push(e);
      }
      return e;
    };
    if (K.areaLabel) {
      // One fixed label per area (e.g. its script's letter), shown when any item covering the area is shown.
      for (const a of AREAS) {
        const e = AREA_ENTRY[a] = entry(a, itemCentre([a])); e.fixed = K.areaLabel(a); e.el.textContent = e.fixed;
        for (const id of K.at[a] || []) { e.ids.push(id); (ENTRY_OF[id] ??= []).push(e); }
      }
    } else if (K.labelPerArea) {
      // One label per area listing every item dialed there, the area's main one first.
      for (const a of AREAS) {
        const ids = K.at[a]; if (!ids) continue;
        const e = AREA_ENTRY[a] = entry(a, itemCentre([a])), main = K.primary(a);
        for (const id of [main, ...ids.filter(x => x !== main)]) { e.ids.push(id); (ENTRY_OF[id] ??= []).push(e); }
      }
    } else {
      for (const id of K.ids) {
        const m = itemCentre(K.areas[id]), e = entry(Math.round(m.x) + ',' + Math.round(m.y), m);
        e.ids.push(id); ENTRY_OF[id] = [e];
      }
    }
    sizeLabels();
  }
  function renderEntry(e) {
    const K = KINDS[labelKind];
    // A flashed area ('area:…' in shown) reveals everything on its label for a moment.
    const all = [...e.shown].some(s => s.startsWith('area:'));
    const text = e.fixed !== undefined ? (e.shown.size ? e.fixed : '')
      : e.ids.filter(id => all || e.shown.has(id)).map(id => K.short(id)).join(' / ');
    if (e.fixed === undefined) e.el.textContent = text;
    e.el.classList.toggle('off', !text);
    if (onStreet() && text) {
      if (!e.marker) {
        const span = document.createElement('span');
        e.marker = L.marker(e.ll, { icon: L.divIcon({ className: 'st-label', html: span, iconSize: [0, 0] }), interactive: false, keyboard: false }).addTo(lmap);
      }
      e.marker.getElement().querySelector('span').textContent = text;
    } else if (e.marker) { e.marker.remove(); e.marker = null; }
  }
  function showLabel(kind, id, on = true) {
    buildLabels(kind);
    for (const e of ENTRY_OF[id] || []) { on ? e.shown.add(id) : e.shown.delete(id); renderEntry(e); }
  }
  function showLabels(kind, ids) {
    buildLabels(kind); clearLabels();
    for (const id of ids) for (const e of ENTRY_OF[id] || []) e.shown.add(id);
    for (const e of ENTRIES) renderEntry(e);
  }
  function showAllLabels(kind) { showLabels(kind, KINDS[kind].ids); }
  function clearLabels() { for (const e of ENTRIES) { e.shown.clear(); renderEntry(e); } }
  function sizeLabels() {
    const s = scale();
    for (const c of gPins.querySelectorAll('circle')) c.setAttribute('r', (4.5 / s).toFixed(3));
    for (const c of gFree.querySelectorAll('circle')) c.setAttribute('r', (5 / s).toFixed(3));
    for (const t of gPins.querySelectorAll('text')) { t.setAttribute('font-size', (13 / s).toFixed(3)); t.setAttribute('dy', (-9 / s).toFixed(3)); t.style.strokeWidth = (3 / s).toFixed(3) + 'px'; }
    for (const e of ENTRIES) {
      const fs = Q.dots ? 12 / s : Math.min(15 / s, Math.max(9 / s, Math.sqrt(e.area) * Q.labelScale));
      e.el.setAttribute('font-size', fs.toFixed(3)); e.el.style.strokeWidth = (3 / s).toFixed(3) + 'px';
      if (Q.dots) e.el.setAttribute('dy', (-13 / s).toFixed(3)); // city names sit above their dot, like pins
    }
  }

  // A pin for the place the last answered question was about (e.g. the town behind a code).
  function showPin(p) {
    clearPin();
    if (!p) return;
    if (onStreet()) {
      streetPin = L.circleMarker(p.ll, { radius: 6, weight: 2, color: '#fff', fillColor: '#15283A', fillOpacity: 1, interactive: false })
        .bindTooltip(p.label, { permanent: true, direction: 'top', offset: [0, -6], className: 'st-pin' }).addTo(lmap);
      return;
    }
    const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
    const t = document.createElementNS(NS, 'text'); t.setAttribute('x', p.x); t.setAttribute('y', p.y); t.textContent = p.label;
    gPins.append(c, t); sizeLabels();
  }
  function clearPin() { gPins.replaceChildren(); if (streetPin) { streetPin.remove(); streetPin = null; } }

  const flashTimers = new Map();
  function clearMap() {
    clearPin(); gFree.replaceChildren();
    for (const t of flashTimers.values()) clearTimeout(t);
    flashTimers.clear();
    for (const a of AREAS) for (const p of shapesOf(a)) p.classList.remove('got', 't2', 't3', 'miss', 'ans', 'sel', 'flash', 'found', 'out', 'pre');
    clearLabels();
    mark(null);
  }
  // Dim the areas outside the current set, on the quiz map and the overlay. The street map alone never dims (its
  // stylesheet ignores 'out'): that would give away borders.
  function markOut(areas) {
    const inSet = new Set(areas);
    for (const a of AREAS) for (const p of shapesOf(a)) p.classList.toggle('out', !inSet.has(a));
    syncUnitsOut();
  }

  /* ---------- layouts: when a kind's items are groups of areas (zones, states), each group is one shape ----------
     Areas answered by exactly the same items form a unit. The quiz map then draws only the units' outlines and
     colors each unit in one color: the areas' own hint color when a unit has only one, otherwise a color per unit
     that differs from its neighbours'. Code kinds (clickAll) and per-area labels (areaLabel) keep every area. */
  const LAYOUTS = {};
  const PALETTE = Array.from({ length: 10 }, (_, i) => `var(--h${i + 1})`);
  function layoutOf(kind) {
    if (kind in LAYOUTS) return LAYOUTS[kind];
    const K = KINDS[kind];
    let L = null;
    if (!K.clickAll && !K.areaLabel && K.merge !== false) {
      const byKey = new Map();
      for (const a of AREAS) {
        const key = K.at[a] ? [...K.at[a]].sort().join('|') : 'area:' + a;
        byKey.set(key, [...(byKey.get(key) || []), a]);
      }
      const units = [...byKey.values()];
      if (units.some(u => u.length > 1)) L = { units, color: unitColors(K, units) };
    }
    return LAYOUTS[kind] = L;
  }
  // Which units touch: draw each unit in its own color on a canvas and look across the lines between them.
  // Only pixels inside a unit count (all four neighbours the same), so blended edge pixels can't fake a unit.
  function unitAdjacency(units) {
    const S = 1000 / Math.max(MW, MH), w = Math.ceil(MW * S), h = Math.ceil(MH * S);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true }); x.scale(S, S);
    units.forEach((u, i) => { x.fillStyle = `rgb(${(i + 1) & 255},${(i + 1) >> 8},0)`; for (const a of u) x.fill(new Path2D(AREA[a].d), 'evenodd'); });
    const px = x.getImageData(0, 0, w, h).data, adj = units.map(() => new Set());
    const id = k => px[k * 4 + 3] === 255 && px[k * 4 + 2] === 0 ? px[k * 4] + (px[k * 4 + 1] << 8) : 0;
    const pure = k => { const v = id(k); return v && id(k - 1) === v && id(k + 1) === v && id(k - w) === v && id(k + w) === v ? v : 0; };
    for (let j = 1; j < h - 5; j++) for (let i = 1; i < w - 5; i++) {
      const u = pure(j * w + i); if (!u) continue;
      for (const k of [j * w + i + 4, (j + 4) * w + i]) { const v = pure(k); if (v && v !== u) { adj[u - 1].add(v - 1); adj[v - 1].add(u - 1); } }
    }
    return adj;
  }
  function unitColors(K, units) {
    const g = a => AREA[a].g;
    // Zones inside one hint color (e.g. two-digit zones colored by first digit) keep it, so the hint still means
    // something. Named places (states, districts) always get their own colors.
    if (!K.unitColors && K.prompt !== 'name' && units.every(u => u.every(a => g(a) === g(u[0])))) return null;
    const adj = unitAdjacency(units), col = [], used = new Map();
    const options = units.map(u => K.unitColors ? K.unitColors(u) : PALETTE);
    for (const i of units.map((_, i) => i).sort((a, b) => adj[b].size - adj[a].size)) {
      const taken = new Set([...adj[i]].map(j => col[j]));
      const free = options[i].filter(c => !taken.has(c));
      col[i] = (free.length ? free : options[i]).reduce((m, c) => (used.get(c) || 0) < (used.get(m) || 0) ? c : m);
      used.set(col[i], (used.get(col[i]) || 0) + 1);
    }
    return Object.fromEntries(units.flatMap((u, i) => u.map(a => [a, col[i]])));
  }
  /* A unit's outline: the edges of its areas that have the unit on one side only, joined into lines. Edges two of
     its areas share point for point drop out by counting. Where neighbours' borders don't line up exactly, an edge
     is tested a little to either side instead, so those inner borders disappear as well. The line then sits on the
     unit's real edge at every zoom.
     There are two versions of every outline. Zoomed out, a gap between two of a unit's areas that is narrower than
     the line is wide gets no outline: it would only show as a thicker line or as a speck. Zoomed in, from FINE
     screen pixels per map unit, nearly every gap is outlined, so a narrow strait keeps both of its shores. */
  // In map units: far is how far off an edge another of the unit's areas still counts as being next to it, gap the
  // widest hole between the unit's areas that is left without an outline.
  const DETAIL = [{ far: 1, gap: 1.5 }, { far: .3, gap: .5 }], FINE = 3;
  // Also in map units: the height of a row of edges and the size of a cell of areas (both only for speed), how far
  // off an edge to look for its own area and for areas right next to it, and how long a piece of edge to test at once.
  const ROW = 4, CELL = 16, OWN = .01, NEAR = .3, STEP = 1;
  // Outlines are worked out in a flat space: the quiz map's, or the street map's for the overlay (GEO_SPACE below).
  // rings(a): the area's rings there; k: how many of its units make one map unit, which scales every size above.
  const SVG_SPACE = { k: 1, rings: a => pathRings(AREA[a].d), shapes: {}, cells: null };
  function shapeOf(S, a) {
    if (S.shapes[a]) return S.shapes[a];
    const rings = S.rings(a); let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const r of rings) for (const [x, y] of r) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return S.shapes[a] = { a, rings, x0, y0, x1, y1, rows: null, row: ROW * S.k };
  }
  // The areas that may contain a point: those whose bounding box touches the point's cell of a coarse grid.
  function shapesNear(S, x, y) {
    const cell = CELL * S.k;
    if (!S.cells) {
      S.cells = new Map();
      for (const a of AREAS) {
        if (AREA[a].top) continue; // areas on top keep their own border
        const s = shapeOf(S, a);
        for (let i = Math.floor(s.x0 / cell), i1 = Math.floor(s.x1 / cell); i <= i1; i++) for (let j = Math.floor(s.y0 / cell), j1 = Math.floor(s.y1 / cell); j <= j1; j++) {
          const k = i * 4096 + j, l = S.cells.get(k); if (l) l.push(s); else S.cells.set(k, [s]);
        }
      }
    }
    return S.cells.get(Math.floor(x / cell) * 4096 + Math.floor(y / cell)) || [];
  }
  // Is the point inside the area (even-odd, like its fill)? The area's edges are sorted into rows by height once,
  // so a test only looks at the edges near the point.
  function inside(s, x, y) {
    if (x < s.x0 || x > s.x1 || y < s.y0 || y > s.y1) return false;
    if (!s.rows) {
      s.rows = {};
      for (const r of s.rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
        const p = r[j], q = r[i];
        for (let k = Math.floor(Math.min(p[1], q[1]) / s.row), k1 = Math.floor(Math.max(p[1], q[1]) / s.row); k <= k1; k++) (s.rows[k] ??= []).push(p, q);
      }
    }
    const row = s.rows[Math.floor(y / s.row)] || []; let c = false;
    for (let i = 0; i < row.length; i += 2) { const p = row[i], q = row[i + 1]; if ((p[1] > y) !== (q[1] > y) && x < (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1]) + p[0]) c = !c; }
    return c;
  }
  function unitOutlines(units, detail, S = SVG_SPACE) {
    const sc = S.k, far = detail.far * sc, gap = detail.gap * sc;
    const unit = {}; units.forEach((u, i) => { for (const a of u) unit[a] = i; });
    // Every edge once: its area, how many areas have it, and the two units it lies between (v: -1 while only one).
    // Points and edges are numbered, which is much quicker to look up than their coordinates as text.
    const points = new Map(), edges = new Map();
    const idOf = p => { const k = Math.round(p[0] * 100) * 67108864 + Math.round(p[1] * 100); let i = points.get(k); if (i === undefined) points.set(k, i = points.size); return i; };
    for (const a of AREAS) {
      if (AREA[a].top) continue; // areas on top keep their own border
      for (const r of shapeOf(S, a).rings) {
        let p = r[r.length - 1], kp = idOf(p);
        for (const q of r) {
          const kq = idOf(q);
          if (kq !== kp) {
            const k = kp < kq ? kp * 4194304 + kq : kq * 4194304 + kp, e = edges.get(k);
            if (!e) edges.set(k, { p, q, kp, kq, a, n: 1, u: unit[a], v: -1, side: 0 });
            else { e.n++; if (unit[a] !== e.u) e.v = unit[a]; }
          }
          p = q; kp = kq;
        }
      }
    }
    // side: 1 when the unit lies to the left of the edge from p to q, -1 to the right (0: on neither side)
    const lines = units.map(() => []);
    for (const e of edges.values()) {
      if (e.n > 1 && e.v < 0) continue; // shared by two areas of one unit
      const dx = e.q[0] - e.p[0], dy = e.q[1] - e.p[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, own = shapeOf(S, e.a);
      if (e.v >= 0) { // the border between two units
        e.side = inside(own, (e.p[0] + e.q[0]) / 2 + nx * OWN * sc, (e.p[1] + e.q[1]) / 2 + ny * OWN * sc) ? 1 : -1;
        lines[e.u].push(e); lines[e.v].push({ ...e, side: -e.side });
        continue;
      }
      // An edge no other area has. Is the unit on that side of it, at the point t of the way along? Its own area
      // lies right at the edge; another of its areas may lie a little further off, across a gap between the two.
      const other = (x, y) => { for (const s of shapesNear(S, x, y)) if (s !== own && unit[s.a] === e.u && inside(s, x, y)) return true; return false; };
      const on = (t, d) => {
        const x = e.p[0] + dx * t, y = e.p[1] + dy * t, ox = nx * d, oy = ny * d, near = NEAR * sc;
        return inside(own, x + ox * OWN * sc, y + oy * OWN * sc) || other(x + ox * near, y + oy * near) || (far > near && other(x + ox * far, y + oy * far));
      };
      const sideAt = t => { const l = on(t, 1), r = on(t, -1); return l && r ? 2 : l ? 1 : r ? -1 : 0; }; // 2: a border inside the unit
      // A long edge may lie on the unit's outline for only part of its length (its neighbours change along it), so
      // it is tested piece by piece, and the point where the answer changes is narrowed down.
      const n = Math.ceil(len / (STEP * sc)), at = t => [Math.round((e.p[0] + dx * t) * 100) / 100, Math.round((e.p[1] + dy * t) * 100) / 100];
      for (let i = 1, from = 0, side = sideAt(.5 / n); i <= n; i++) {
        const next = i < n ? sideAt((i + .5) / n) : null;
        if (next === side) continue;
        let to = 1;
        if (i < n) { let lo = (i - .5) / n, hi = (i + .5) / n; for (let k = 0; k < 6; k++) { const mid = (lo + hi) / 2; if (sideAt(mid) === side) lo = mid; else hi = mid; } to = (lo + hi) / 2; }
        if (side !== 2) {
          const p = from ? at(from) : e.p, q = to < 1 ? at(to) : e.q;
          lines[e.u].push({ p, q, kp: from ? idOf(p) : e.kp, kq: to < 1 ? idOf(q) : e.kq, side });
        }
        from = to; side = next;
      }
    }
    return lines.map(es => joinEdges(es, gap));
  }
  // Edges end to end as one path, so the line has joins instead of thousands of loose ends. A small ring of edges
  // with the unit on its outside runs around a gap between the unit's areas, not around an island: it is left out.
  function joinEdges(es, gap) {
    const at = new Map(), seen = new Set(); let d = '';
    for (const e of es) for (const k of [e.kp, e.kq]) { const l = at.get(k); if (l) l.push(e); else at.set(k, [e]); }
    for (const e0 of es) {
      if (seen.has(e0)) continue;
      const part = [e0]; let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; // everything connected to this edge
      seen.add(e0);
      for (const e of part) {
        for (const [x, y] of [e.p, e.q]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        for (const k of [e.kp, e.kq]) for (const f of at.get(k)) if (!seen.has(f)) { seen.add(f); part.push(f); }
      }
      if (x1 - x0 < gap && y1 - y0 < gap) {
        const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2; let turn = 0; // positive: the unit lies inside the ring
        for (const e of part) turn += e.side * ((e.p[0] - cx) * (e.q[1] - cy) - (e.q[0] - cx) * (e.p[1] - cy));
        if (turn < 1e-6) continue; // a gap, or a stray edge
      }
      const used = new Set();
      for (const e of part) {
        if (used.has(e)) continue;
        used.add(e);
        const run = [e.p, e.q]; let end = e.kq;
        for (let turn = 0; turn < 2; turn++) { // grow the line at its end, then at its start
          for (let f; (f = at.get(end).find(f => !used.has(f)));) { used.add(f); const fwd = f.kp === end; run.push(fwd ? f.q : f.p); end = fwd ? f.kq : f.kp; }
          run.reverse(); end = e.kp;
        }
        d += 'M' + run.map(p => p[0] + ',' + p[1]).join('L');
      }
    }
    return d;
  }
  // The units' outlines go on top of the areas (under any areas marked top), the lines of dimmed units first so
  // that a line two units share is drawn in the stronger of their two colors.
  let layoutKind = null, UNIT_LINES = [], detail = 0;
  function applyLayout(kind) {
    const L = layoutOf(kind), key = L ? kind : null;
    if (key === layoutKind) return;
    layoutKind = key;
    for (const p of UNIT_LINES) p.remove();
    UNIT_LINES = [];
    for (const a of AREAS) EL[a].style.removeProperty('--hint');
    mapClass('merged', !!L);
    if (!L) return;
    if (L.color) for (const a of AREAS) EL[a].style.setProperty('--hint', L.color[a]);
    UNIT_LINES = L.units.map(() => { const line = document.createElementNS(NS, 'path'); line.setAttribute('class', 'unit'); return line; });
    drawUnits();
    syncUnitsOut();
  }
  // Each version of the outlines is worked out when it is first shown.
  function drawUnits() {
    const L = LAYOUTS[layoutKind], lines = (L.lines ??= [])[detail] ??= unitOutlines(L.units, DETAIL[detail]);
    UNIT_LINES.forEach((p, i) => p.setAttribute('d', lines[i]));
  }
  function syncDetail() {
    const d = scale() >= FINE ? 1 : 0;
    if (d === detail) return;
    detail = d;
    if (layoutKind) drawUnits();
  }
  function syncUnitsOut() {
    if (!layoutKind) return;
    const out = LAYOUTS[layoutKind].units.map(u => u.every(a => EL[a].classList.contains('out')));
    UNIT_LINES.forEach((p, i) => p.classList.toggle('out', out[i]));
    for (const o of [true, false]) for (const p of UNIT_LINES) if (p.classList.contains('out') === o) gR.appendChild(p);
    raiseTops();
    if (overlayKind !== layoutKind) return; // the overlay's lines, in the same order
    OVERLAY_LINES.forEach((l, i) => { l.getElement().classList.toggle('out', out[i]); if (!out[i]) l.bringToFront(); });
    for (const a of AREAS) if (AREA[a].top) SP[a].bringToFront();
  }
  /* The overlay shows the same layout on the street map. Its outlines are worked out again, from the areas' [lat, lng]
     rings (which need not match the quiz map's point for point), in a flat space of their own: thousandths of a
     degree, east–west shrunk to its true size at the middle of the map. ll turns a point back into [lat, lng]; px is
     the number of screen pixels per map unit at a zoom level, as scale() gives it for the quiz map. */
  const GEO_SPACE = Q.geo && (() => {
    const [[s, w], [n, e]] = Q.street.bounds, c = Math.cos((s + n) / 2 * Math.PI / 180), r = v => Math.round(v * 100) / 100;
    const k = Math.hypot((e - w) * c, n - s) * 1000 / Math.hypot(MW, MH);
    return {
      k, shapes: {}, cells: null,
      rings: a => Q.geo[a].rings.map(ring => ring.map(([lat, lng]) => [r((lng - w) * 1000 * c), r((n - lat) * 1000)])),
      ll: ([x, y]) => [n - y / 1000, w + x / (1000 * c)],
      px: zoom => 256 * 2 ** zoom / 360 / (1000 * c) * k,
    };
  })();
  let overlayKind = null, OVERLAY_LINES = [], overlayShown = null;
  function overlayLayout() {
    if (overlayKind !== layoutKind) {
      overlayKind = layoutKind; overlayShown = null;
      for (const l of OVERLAY_LINES) l.remove();
      const lay = layoutKind && LAYOUTS[layoutKind], color = lay && lay.color;
      for (const a of AREAS) { const st = SP[a].getElement().style; if (color) st.setProperty('--hint', color[a]); else st.removeProperty('--hint'); }
      OVERLAY_LINES = lay ? lay.units.map(() => L.polyline([], { pane: 'areas', className: 'unit', interactive: false }).addTo(lmap)) : [];
      syncUnitsOut();
    }
    syncOverlayDetail();
  }
  // As on the quiz map, there are two versions of the outlines, and the zoom level picks one.
  function syncOverlayDetail() {
    if (!overlaid() || !overlayKind) return;
    const lay = LAYOUTS[overlayKind], d = GEO_SPACE.px(lmap.getZoom()) >= FINE ? 1 : 0;
    const lines = (lay.geoLines ??= [])[d] ??= unitOutlines(lay.units, DETAIL[d], GEO_SPACE).map(path => path ? pathRings(path).map(run => run.map(GEO_SPACE.ll)) : []);
    if (lines === overlayShown) return;
    overlayShown = lines;
    OVERLAY_LINES.forEach((l, i) => l.setLatLngs(lines[i]));
  }
  const hintLabelOf = kind => {
    const K = KINDS[kind], L = layoutOf(kind);
    return K.hintLabel || (L && L.color && !K.unitColors ? `Color each ${K.noun[0]}` : Q.hintLabel);
  };

  function syncHints() {
    const kind = activeKind();
    applyLayout(kind);
    mapClass('hints', $('optColors').checked && !(view === 'play' && KINDS[kind].hints === false));
    svg.classList.toggle('all-labels', !!(Q.lettersLabel && $('optLetters') && $('optLetters').checked && view === 'play'));
    if (overlaid()) overlayLayout();
  }

  /* ---------- storage & options ---------- */
  // Kept in this browser, in the page's record (assets/js/store.js): under `last` what was chosen on the setup screen
  // (store and load; a selection of items per kind as 'sel.<kind>'), under `custom` the player's own quizzes, under
  // `best` the best result of every round played, and `stars`, the progress per level worked out from them.
  const PAGE_ID = document.body.dataset.quiz || location.pathname.replace(/\/(index\.html)?$/, '').split('/').pop();
  STORE.adopt(PAGE_ID, Q.key, Q.kinds.map(k => k.key)); // what was kept under the quiz's short name before
  // The record is read once for all that is asked of it in one go (every round's best, when the rounds are listed).
  let held = null;
  const record = () => held || (queueMicrotask(() => { held = null; }), held = STORE.quiz(PAGE_ID));
  const keep = change => { STORE.setQuiz(PAGE_ID, change); held = null; };
  function store(k, v) {
    keep(r => {
      const last = r.last ||= {}, sel = k.startsWith('sel.') ? (last.sel ||= {}) : null, name = sel ? k.slice(4) : k;
      if (v == null) delete (sel || last)[name]; else (sel || last)[name] = v;
      if (sel && !Object.keys(sel).length) delete last.sel;
    });
  }
  function load(k) { const last = record().last || {}; return (k.startsWith('sel.') ? (last.sel || {})[k.slice(4)] : last[k]) ?? null; }

  $('optColorsText').textContent = Q.hintLabel;
  $('optColors').checked = Q.hintsDefault ?? true;
  const lettersOpt = $('optLetters');
  if (lettersOpt) { $('optLettersWrap').hidden = !Q.lettersLabel; $('optLettersText').textContent = Q.lettersLabel || ''; }
  const savedOpts = load('opts');
  if (savedOpts) {
    $('optColors').checked = savedOpts.colors; $('optDetail').checked = savedOpts.detail ?? savedOpts.state ?? false;
    if (lettersOpt) lettersOpt.checked = !!savedOpts.letters;
  }
  function saveOpts() { store('opts', { colors: $('optColors').checked, detail: $('optDetail').checked, letters: lettersOpt ? lettersOpt.checked : false }); }
  $('optColors').addEventListener('change', () => { syncHints(); saveOpts(); });
  $('optDetail').addEventListener('change', saveOpts);
  if (lettersOpt) lettersOpt.addEventListener('change', () => { syncHints(); saveOpts(); });

  /* ---------- helpers ---------- */
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmt = ms => { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const plural = (n, [one, many]) => `${n} ${n === 1 ? one : many}`;

  function setFeedback(el, cls, title, sub) {
    el.className = 'feedback' + (cls ? ' ' + cls : '');
    el.replaceChildren();
    if (title) { const p = document.createElement('p'); p.className = 't'; p.textContent = title; el.appendChild(p); }
    for (const line of [].concat(sub || [])) { const p = document.createElement('p'); p.className = 'c'; p.textContent = line; el.appendChild(p); }
  }
  function pressed(seg, attr, value) {
    for (const b of $(seg).querySelectorAll('button')) b.setAttribute('aria-pressed', b.dataset[attr] === value);
  }

  let view = 'setup';
  function show(id) {
    view = id;
    ['setup', 'play', 'done', 'explore'].forEach(x => $(x).hidden = x !== id);
    $('app').classList.toggle('playing', id !== 'setup');
    $('startbar').hidden = id !== 'setup';
    $('mapSeg').hidden = id !== 'setup' || $('mapSeg').childElementCount < 2;
    mapBar.hidden = id !== 'setup';
    mapClass('picking', id === 'setup');
    // Hint colors fade while playing and on the results, so the answer colors stand out.
    mapClass('fade', id === 'play' || id === 'done');
    svg.classList.toggle('freeplay', id === 'play' && mapStyle === 'free'); // map play hides the dots still to be asked
    $('app').classList.toggle('reviewing', G.review && (id === 'play' || id === 'done')); // a review round and its results
    if (id !== 'play') countEl.hidden = true;
    syncHints();
  }

  /* ---------- setup: pick a round (or build a custom quiz), a map, and start ---------- */
  $('kindSeg').parentElement.hidden = Q.kinds.length < 2; // nothing to choose between
  for (const k of Q.kinds) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.kind = k.key;
    const t = document.createElement('b'); t.textContent = k.label;
    const s = document.createElement('small'); s.textContent = KINDS[k.key].sub;
    b.append(t, s); $('kindSeg').appendChild(b);
    b.onclick = () => { pickKind = k.key; buildPicker(); };
  }

  let pickKind = KINDS[load('kind')] ? load('kind') : Q.kinds[0].key;
  // The maps to play on: the quiz map, the street map, or the overlay (the street map with the quiz map's outlines
  // and colors on it): a small picker on the map itself, shown on the setup screen. City quizzes (Q.free) choose
  // between clicking anywhere on the map (the default) and clicking the dots instead: that is asked in the box of
  // the round picked, under its name (playRow), not on the map.
  const FREE = !!Q.free;
  const SWITCHES = FREE || ROUNDS.some(r => r.of); // rounds with a switch in their box: Map or Dots, a language
  const MAPS = FREE ? [['free', 'Map', 'by distance'], ['quiz', 'Dots', '3 tries']]
    : [['quiz', 'Quiz map', 'with borders'], ['overlay', 'Overlay', 'borders on streets'], ['street', 'Street map', 'hard, no borders']].slice(0, Q.geo ? 3 : 1);
  let chosenMap = MAPS.some(([m]) => m === load('map')) ? load('map') : MAPS[0][0];
  $('mapSeg').hidden = FREE || MAPS.length < 2; // nothing to choose between
  $('mapSeg').replaceChildren(...(FREE ? [] : MAPS).map(([m, t, sub]) => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.map = m; b.textContent = t; b.title = sub;
    return b;
  }));
  // The quiz map can carry map tiles redrawn in its own projection (map-tiles.js, loaded when first asked for), where
  // the page says how it is projected: the city quizzes (Q.streets, their cities.js) and the area quizzes with a
  // projection in their data.js (Q.proj).
  const TILED = Q.streets || (Q.proj && Q.kpu && /^(conicEqualArea|albersUsa|mercator)$/.test(Q.proj.type)
    ? { proj: Q.proj, kpu: Q.kpu, areas: Q.areas.filter(a => Q.geo && Q.geo[a.id]).map(a => ({ d: a.d, lat: Q.geo[a.id].lab[0], lng: Q.geo[a.id].lab[1], x: a.lx, y: a.ly })) } : null);
  let waiting = null; // what to do once the script is there
  function withTiles(then) {
    if (tiles) return then();
    if (waiting) return waiting.push(then);
    waiting = [then];
    const s = document.createElement('script'); s.src = HERE + 'map-tiles.js';
    s.onload = () => {
      tiles = mapTiles($('stage'), TILED);
      if (Q.streets) for (const cls of ['box', 'land']) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', tiles.insets[cls]); p.setAttribute('class', 'inset-' + cls); $('ctx').insertBefore(p, $('ctx').querySelector('.lines')); }
      for (const f of waiting) f();
    };
    document.head.append(s);
  }
  // The pickers on the map, in one bar: the maps, and beside them the switch for the coverage.
  const mapBar = document.createElement('div'); mapBar.className = 'mapbar';
  $('mapSeg').before(mapBar); mapBar.append($('mapSeg'));
  // City quizzes can have the street map behind the quiz map: the overlay keeps the region borders on it, the street
  // map shows the streets alone. Their picker takes the place of the map picker, which they don't have.
  const BACKS = Q.streets ? [['quiz', 'Quiz map', 'drawn'], ['overlay', 'Overlay', 'borders on streets'], ['street', 'Street map', 'no borders']] : [];
  let chosenBack = BACKS.some(([m]) => m === load('back')) ? load('back') : 'quiz';
  const backSeg = document.createElement('div');
  backSeg.className = 'maps'; backSeg.hidden = !BACKS.length; backSeg.setAttribute('role', 'group'); backSeg.setAttribute('aria-label', 'Background');
  backSeg.replaceChildren(...BACKS.map(([m, t, sub]) => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.back = m; b.textContent = t; b.title = sub;
    b.onclick = () => useBack(m);
    return b;
  }));
  mapBar.append(backSeg);
  function useBack(back) {
    chosenBack = back; store('back', back);
    for (const b of backSeg.children) b.setAttribute('aria-pressed', b.dataset.back === back);
    svg.classList.toggle('streets', back !== 'quiz'); svg.classList.toggle('plain', back === 'street');
    if (back !== 'quiz' || tiles) withTiles(() => { tiles.streets().show(chosenBack !== 'quiz'); apply(); });
  }
  if (BACKS.length) useBack(chosenBack);
  // Street View coverage on top of the map, whatever the map: a switch of its own beside the map picker. It is the
  // layer of the Coverage page (data/coverage, see the README): on the street map and the overlay a layer of that
  // map, on the quiz map redrawn in the quiz map's projection, where that is known (TILED).
  const COVER = HERE + '../../data/coverage';
  let coverOn = !!load('cover'), coverMeta = null, coverLayer = null, covered = false;
  const coverSeg = document.createElement('div'), coverBtn = document.createElement('button');
  coverSeg.className = 'maps'; coverSeg.hidden = !(TILED || Q.geo); coverBtn.type = 'button'; coverBtn.textContent = 'Coverage'; coverBtn.title = 'Street View coverage';
  coverBtn.onclick = () => { coverOn = !coverOn; store('cover', coverOn || null); syncCover(); };
  coverSeg.append(coverBtn); mapBar.append(coverSeg);
  function syncCover() {
    const here = onStreet() ? !!Q.geo : !!TILED; // can the map in use show it
    coverBtn.disabled = !here; coverBtn.setAttribute('aria-pressed', coverOn && here);
    if (!coverOn && !covered) return;
    covered = true;
    (coverMeta ||= fetch(COVER + '/meta.json').then(r => r.json())).then(meta => {
      if (TILED) withTiles(() => { tiles.coverage(COVER, meta).show(coverOn && !onStreet()); apply(); });
      if (!lmap) return;
      if (!coverLayer) {
        lmap.createPane('coverage').style.zIndex = 300; // over the street map's tiles, under the areas
        const have = Object.fromEntries(Object.entries(meta.tiles).map(([z, l]) => [z, new Set(l)]));
        coverLayer = new (loadsAhead(L.TileLayer).extend({ _isValidTile(c) { // only the tiles that exist are asked for
          if (!L.TileLayer.prototype._isValidTile.call(this, c)) return false;
          const z = c.z - 2, n = 2 ** z; return !!have[z] && have[z].has(`${((c.x % n) + n) % n}/${c.y}`);
        } }))(COVER + '/{z}/{x}/{y}.png', { pane: 'coverage', tileSize: 1024, zoomOffset: -2, minNativeZoom: 2, maxNativeZoom: meta.zoom, ahead: 512,
          attribution: 'Coverage: <a href="https://github.com/slashP/Vali">Vali</a> location pool' });
      }
      if (coverOn && onStreet()) coverLayer.addTo(lmap); else coverLayer.remove();
    }, () => {});
  }
  const SEL = {};
  for (const k in KINDS) {
    const saved = load('sel.' + k);
    SEL[k] = new Set(Array.isArray(saved) ? saved.filter(id => KINDS[k].ids.includes(id)) : KINDS[k].ids);
  }
  let groupEls = [], chipEls = {};

  // Saved quizzes ({ name, kind, ids }) and a quiz shared by link.
  const SAVED = (record().custom || []).filter(s => KINDS[s.kind] && Array.isArray(s.ids));
  const keepSaved = () => keep(r => { r.custom = SAVED; });
  const itemList = kind => uniq(KINDS[kind].ids);
  function encode(kind, ids) {
    const set = new Set(ids), bytes = new Uint8Array(Math.ceil(itemList(kind).length / 8));
    itemList(kind).forEach((id, i) => { if (set.has(id)) bytes[i >> 3] |= 1 << (i & 7); });
    return kind + '.' + btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(s) {
    const [kind, bits] = (s || '').split('.');
    if (!KINDS[kind] || !bits) return null;
    try {
      const bin = atob(bits.replace(/-/g, '+').replace(/_/g, '/'));
      const ids = itemList(kind).filter((id, i) => (bin.charCodeAt(i >> 3) >> (i & 7)) & 1);
      return ids.length ? { kind, ids } : null;
    } catch (e) { return null; }
  }
  const params = new URLSearchParams(location.search);
  const SHARED = decode(params.get('quiz'));
  if (SHARED) SHARED.name = (params.get('name') || '').trim().slice(0, 40) || 'Shared quiz';

  // The layers of a quiz are folders: tabs under the list of rounds, the open one showing its rounds (and its saved
  // quizzes, and a custom quiz of its kind). A kind in another language is in the folder of the kind it follows.
  const folderOf = kind => KINDS[KINDS[kind].of] ? KINDS[kind].of : kind;
  const FOLDERS = uniq(ROUNDS.filter(r => !r.of).map(r => r.kind)), lastIn = {}; // lastIn: the round last chosen in a folder
  const PAGE_FOLDERS = !!document.body.dataset.folders; // the tabs are pages of their own, made by quiz-page.js
  // What Start plays: 'r:<round id>', 's:<saved index>', 'shared' or 'custom'.
  let choice = SHARED ? 'shared' : load('choice') || '';
  if (!PAGE_FOLDERS) $('folders').replaceChildren(...FOLDERS.map(k => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.folder = k; b.textContent = KINDS[k].label;
    b.onclick = () => { if (folderOf(choiceKind()) === k) return; choice = lastIn[k] || 'r:' + ROUNDS.find(r => !r.of && r.kind === k).id; store('choice', choice); buildRounds(); frameRound(); $('setup').scrollTop = 0; };
    return b;
  }));
  const roundOf = key => ROUNDS.find(r => 'r:' + r.id === key);
  const savedOf = key => key.startsWith('s:') ? SAVED[+key.slice(2)] : null;
  function validChoice() {
    if (!(choice === 'custom' || (choice === 'shared' && SHARED) || savedOf(choice) || roundOf(choice))) choice = 'r:' + ROUNDS[0].id;
  }
  function choiceKind() {
    validChoice();
    if (choice === 'custom') return pickKind;
    return (choice === 'shared' ? SHARED : savedOf(choice) || roundOf(choice)).kind;
  }
  function current() {
    const kind = choiceKind();
    if (choice === 'custom') return { kind, ids: KINDS[kind].ids.filter(id => SEL[kind].has(id)) };
    if (choice === 'shared') return SHARED;
    const round = roundOf(choice);
    return savedOf(choice) || { kind, ids: roundIds(round), box: round.box };
  }
  function choose(key) {
    choice = key; store('choice', key === 'shared' ? '' : key);
    if (roundOf(key)) lastIn[folderOf(roundOf(key).kind)] = key;
    if (SWITCHES) buildRounds(); // the box picked shows its switches
    if (key === 'custom') buildPicker(); else syncSetup();
    frameRound();
    if (key === 'custom') $('customWrap').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // The best result of a set of items on a map, as { s: score, t: ms, p: points }: whatever round or custom quiz asks
  // exactly those items shares it. It is kept with the name of the round it was played as, for someone reading the
  // data file.
  const bestKey = (kind, ids, map) => `${kind}/${map}/${STORE.print(ids)}`;
  const bestFor = (kind, ids, map = chosenMap) => STORE.bestIn((record().best || {})[bestKey(kind, ids, map)]);
  const nameOf = (kind, ids) => { const p = STORE.print(ids), r = ROUNDS.find(r => r.kind === kind && !r.random && STORE.print(roundIds(r)) === p); return r ? r.label : (SAVED.find(q => q.kind === kind && STORE.print(q.ids) === p) || {}).name; };
  const keepBest = (kind, ids, map, best) => keep(r => { (r.best ||= {})[bestKey(kind, ids, map)] = STORE.bestOut(best, ids.length, nameOf(kind, ids)); });
  { // results taken over from the layout before came without a name: those of this page's rounds get theirs
    const best = record().best || {}, unnamed = [];
    for (const r of ROUNDS) if (!r.random) { const p = STORE.print(roundIds(r)); for (const map of ['quiz', 'overlay', 'street', 'free']) { const k = `${r.kind}/${map}/${p}`; if (best[k] && !best[k].name) unnamed.push([k, r.label]); } }
    if (unnamed.length) keep(r => { for (const [k, name] of unnamed) if (r.best?.[k]) r.best[k].name = name; });
  }
  // One star per level, up to the quiz's highest: a level's star is earned when every one of its rounds has been
  // played perfectly (all right on the first try, on any map). Until then the star fills with the average best
  // score of those rounds. A level without rounds of its own follows the next harder one; random rounds don't count.
  const STAR = 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z';
  const starHtml = p => {
    const svg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg>`;
    return `<span class="star${p >= 1 ? ' done' : p > 0 ? ' part' : ''}" role="img" aria-label="${p >= 1 ? 'Level done' : `${Math.round(p * 100)}% done`}">${svg}` +
      `<span class="fill" style="width:${Math.round(Math.min(p, 1) * 100)}%">${svg}</span></span>`;
  };
  function levelProgress(folder) { // of one folder's rounds, or of all
    const rounds = ROUNDS.filter(r => !r.random && (!folder || folderOf(r.kind) === folder)).map(r => {
      const ids = roundIds(r);
      const best = Math.max(0, ...['quiz', 'overlay', 'street', 'free'].map(map => { const b = bestFor(r.kind, ids, map); return b ? b.s / ids.length : 0; }));
      return { tier: tierOf(ids.length), best };
    });
    if (!rounds.length) return [];
    const top = Math.max(...rounds.map(r => r.tier)), levels = [];
    for (let t = top; t >= 0; t--) {
      const own = rounds.filter(r => r.tier === t);
      levels[t] = own.length ? own.reduce((sum, r) => sum + r.best, 0) / own.length : levels[t + 1];
    }
    return levels;
  }
  // Kept for the home and country pages, in the page's record (e.g. "brazil-ddd").
  function saveRating() {
    const levels = levelProgress(); if (!levels.length) return;
    keep(r => { r.stars = levels; });
  }
  const ICONS = {
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    del: '<path d="M6 6l12 12M18 6 6 18"/>',
    save: '<path d="M12 5v14M5 12h14"/>',
  };
  function iconBtn(icon, label, onclick) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'icon'; b.title = label; b.setAttribute('aria-label', label);
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[icon]}</svg>`; b.onclick = onclick;
    return b;
  }
  function roundBtn(key, title, sub, kind, ids, random) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'round'; b.dataset.choice = key;
    const t = document.createElement('b'); t.textContent = title;
    const n = document.createElement('span'); n.className = 'n'; n.textContent = plural(ids.length, KINDS[kind].noun);
    b.append(t, n);
    if (sub) { const s = document.createElement('small'); s.textContent = sub; b.append(s); }
    const free = chosenMap === 'free';
    const best = !random && (free ? ['free'] : ['quiz', 'overlay', 'street']).map(map => bestFor(kind, ids, map)).filter(Boolean).sort((x, y) => y.s - x.s)[0];
    if (best) { const e = document.createElement('span'); e.className = 'best'; e.textContent = (best.s === ids.length ? '✓ ' : '') + (free ? (best.p || 0).toLocaleString('en-US') : `${best.s}/${ids.length}`); b.append(e); }
    b.onclick = () => choose(key);
    return b;
  }
  // A round offered in several languages is one box. It shows (and a click on it chooses) the round in the language
  // picked last, or in its first one; once it is the round picked, its languages are a switch under its name.
  function roundBox(variants) {
    const keyOf = v => 'r:' + v.id, langOf = v => KINDS[v.kind].lang || KINDS[v.kind].label;
    if (variants.length < 2) { const r = variants[0]; return answerable(roundBtn(keyOf(r), r.label, r.sub, r.kind, roundIds(r), r.random)); }
    const on = variants.find(v => keyOf(v) === choice) || variants.find(v => langOf(v) === load('lang')) || variants[0];
    const langs = () => options(variants.map(v => [langOf(v), '', v === on, () => { store('lang', langOf(v)); choice = keyOf(v); store('choice', choice); buildRounds(); frameRound(); }]));
    return answerable(roundBtn(keyOf(on), on.label, '', on.kind, roundIds(on), on.random), ...(keyOf(on) === choice ? [langs()] : []));
  }
  // A switch in a round's box, where its sub would be: one of its options is on. [label, title, on, onclick] each.
  function options(list) {
    const row = document.createElement('span'); row.className = 'langs';
    row.append(...list.map(([label, title, on, click]) => {
      const l = document.createElement('button'); l.type = 'button'; l.textContent = label; if (title) l.title = title; l.setAttribute('aria-pressed', on);
      l.onclick = e => { e.stopPropagation(); click(); };
      return l;
    }));
    return row;
  }
  // City quizzes: how to answer, on the map by distance or on the dots. Asked in the box of the round picked.
  const playRow = () => options(MAPS.map(([m, t, sub]) => [t, sub, m === chosenMap, () => { chosenMap = m; if (view === 'setup') useMap(chosenMap, true); buildRounds(); }]));
  // The box of the round picked, with its switches (its languages; how to answer). A box with buttons in it is a
  // group, not a button itself.
  function answerable(b, ...rows) {
    if (FREE && b.dataset.choice === choice) rows.push(playRow());
    if (!rows.length) return b;
    const box = document.createElement('div'), kids = [...b.childNodes], best = n => n.classList && n.classList.contains('best'), side = document.createElement('span');
    box.className = b.className; box.dataset.choice = b.dataset.choice; box.setAttribute('role', 'group'); box.setAttribute('aria-label', kids[0].textContent);
    side.className = 'switches'; side.append(...rows, ...kids.filter(best)); // next to each other, the best result after them
    box.append(...kids.filter(n => !best(n)), side);
    box.onclick = b.onclick;
    return box;
  }
  const withIcons = (btn, ...icons) => { const d = document.createElement('div'); d.className = 'round-row'; d.append(btn, ...icons); return d; };
  // The quiz's own kind label tells saved quizzes apart when a page has several kinds.
  const kindNote = kind => Q.kinds.length > 1 ? KINDS[kind].label : '';

  function buildRounds() {
    const wrap = $('rounds'); wrap.replaceChildren();
    const many = FOLDERS.length > 1, open = folderOf(choiceKind()), inOpen = kind => !many || folderOf(kind) === open;
    const levels = levelProgress(many ? open : null);
    if (!PAGE_FOLDERS) { $('folders').hidden = !many; for (const b of $('folders').children) b.setAttribute('aria-selected', b.dataset.folder === open); }
    const section = (tier, title, rows) => {
      if (!rows.length) return;
      const h = document.createElement('h3'); h.className = 'tier-t';
      if (tier >= 0) {
        const lvl = document.createElement('span'); lvl.className = 'lvl'; lvl.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < TIERS.length; i++) { const bar = document.createElement('i'); if (i <= tier) bar.className = 'on'; lvl.append(bar); }
        h.append(lvl);
      }
      h.append(title);
      if (tier >= 0 && levels[tier] !== undefined) h.insertAdjacentHTML('beforeend', starHtml(levels[tier]));
      const d = document.createElement('div'); d.className = 'tier'; d.dataset.tier = tier; d.append(h, ...rows); wrap.append(d);
    };
    if (SHARED && inOpen(SHARED.kind)) section(-1, 'Shared with you', [withIcons(answerable(roundBtn('shared', SHARED.name, kindNote(SHARED.kind), SHARED.kind, SHARED.ids)),
      iconBtn('save', 'Save to your quizzes', () => saveQuiz(SHARED.name, SHARED.kind, SHARED.ids)))]);
    const byTier = TIERS.map(() => []);
    for (const r of ROUNDS) if (!r.of && inOpen(r.kind)) byTier[tierOf(roundIds(r).length)].push(roundBox(ROUNDS.filter(v => v === r || v.of === r)));
    TIERS.forEach(([, name], i) => section(i, name, byTier[i]));
    section(-1, 'Your quizzes', SAVED.map((s, i) => inOpen(s.kind) && withIcons(answerable(roundBtn('s:' + i, s.name, kindNote(s.kind), s.kind, s.ids)),
      iconBtn('link', 'Copy a link to this quiz', () => copyLink(s.kind, s.ids, s.name)),
      iconBtn('del', 'Delete this quiz', () => deleteQuiz(i)))).filter(Boolean));
    const custom = document.createElement('button'); custom.type = 'button'; custom.className = 'round custom'; custom.dataset.choice = 'custom';
    const ct = document.createElement('b'); ct.textContent = 'Custom quiz';
    const cn = document.createElement('span'); cn.className = 'n'; cn.id = 'customCount';
    const cs = document.createElement('small'); cs.textContent = 'Pick your own';
    custom.append(ct, cn, cs); custom.onclick = () => { if (many && folderOf(pickKind) !== open) pickKind = open; choose('custom'); };
    wrap.append(answerable(custom));
    // a custom quiz is of the open folder's kind, in any of its languages
    for (const b of $('kindSeg').children) b.hidden = !inOpen(b.dataset.kind);
    $('kindSeg').parentElement.hidden = [...$('kindSeg').children].filter(b => !b.hidden).length < 2;
    syncSetup();
    saveRating();
  }
  function saveQuiz(name, kind, ids) {
    name = (name || '').trim().slice(0, 40) || `My ${KINDS[kind].noun[1]} (${ids.length})`;
    SAVED.push({ name, kind, ids: [...ids] }); keepSaved();
    choice = 's:' + (SAVED.length - 1); store('choice', choice);
    buildRounds(); toast('Saved');
  }
  function deleteQuiz(i) {
    if (!confirm(`Delete “${SAVED[i].name}”?`)) return;
    SAVED.splice(i, 1); keepSaved();
    if (choice === 's:' + i) choice = '';
    else if (choice.startsWith('s:') && +choice.slice(2) > i) choice = 's:' + (+choice.slice(2) - 1);
    validChoice(); store('choice', choice); buildRounds();
  }
  function shareUrl(kind, ids, name) {
    const u = new URL(location.href); u.search = ''; u.hash = '';
    u.searchParams.set('quiz', encode(kind, ids)); if (name) u.searchParams.set('name', name);
    return u.href;
  }
  async function copyLink(kind, ids, name) {
    const url = shareUrl(kind, ids, name);
    try { await navigator.clipboard.writeText(url); toast('Link copied'); }
    catch (e) { window.prompt('Link', url); } // no clipboard access (e.g. plain http)
  }
  let toastTimer = 0;
  function toast(msg) { $('toast').textContent = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').textContent = ''; }, 4000); }

  function buildPicker() {
    const K = KINDS[pickKind], sel = SEL[pickKind];
    $('pickTitle').textContent = K.pickTitle;
    $('topBy').replaceChildren(...K.rankings.map((r, i) => { const o = document.createElement('option'); o.value = i; o.textContent = r.label; return o; }));
    $('topn').hidden = !K.rankings.length;
    $('presets').replaceChildren(...(K.presets || []).flatMap(pr => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'linkbtn'; b.textContent = pr.label;
      b.onclick = () => { sel.clear(); (typeof pr.ids === 'function' ? pr.ids() : pr.ids).forEach(id => sel.add(id)); syncPicker(); };
      return [' · ', b];
    }));
    const wrap = $('groups'); wrap.replaceChildren(); groupEls = []; chipEls = {};
    for (const g of K.groups) {
      const div = document.createElement('div'); div.className = 'grp';
      const label = document.createElement('label'); label.className = 'grp-t';
      const box = document.createElement('input'); box.type = 'checkbox';
      box.onchange = () => { for (const id of g.ids) box.checked ? sel.add(id) : sel.delete(id); syncPicker(); };
      const b = document.createElement('b'); b.textContent = g.title;
      const span = document.createElement('span');
      label.append(box, b, span);
      const chips = document.createElement('div'); chips.className = 'codes';
      for (const id of g.ids) {
        const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cd';
        btn.textContent = K.chip(id); btn.title = K.chipTitle(id);
        if (K.chipClass) { const c = K.chipClass(id); if (c) btn.classList.add(c); }
        btn.onclick = () => toggleItems([id]);
        chips.appendChild(btn); chipEls[id] = btn;
      }
      div.append(label, chips); wrap.appendChild(div);
      groupEls.push({ g, box, span });
    }
    syncPicker();
  }
  // Toggle a set of items together: select all of them unless they're all selected already.
  function toggleItems(ids) {
    const sel = SEL[pickKind], all = ids.every(id => sel.has(id));
    for (const id of ids) all ? sel.delete(id) : sel.add(id);
    syncPicker();
  }
  // A click on the map while a round is chosen turns that round into a custom quiz to edit.
  function editAsCustom() {
    const cur = current();
    pickKind = cur.kind; SEL[pickKind] = new Set(cur.ids);
    choice = 'custom'; store('choice', choice); buildPicker();
  }
  function syncPicker() {
    const K = KINDS[pickKind], sel = SEL[pickKind];
    for (const { g, box, span } of groupEls) {
      const n = g.ids.filter(id => sel.has(id)).length;
      box.checked = n === g.ids.length; box.indeterminate = n > 0 && n < g.ids.length;
      span.textContent = (g.sub ? g.sub + ' · ' : '') + `${n}/${g.ids.length}`;
    }
    for (const id of K.ids) chipEls[id].setAttribute('aria-pressed', sel.has(id));
    pressed('kindSeg', 'kind', pickKind);
    store('sel.' + pickKind, sel.size < uniq(K.ids).length ? [...sel] : null); store('kind', pickKind); // every item picked is the default: nothing to keep
    syncSetup();
  }
  // Everything that follows from the chosen round and map: start button, help options, the map preview.
  function syncSetup() {
    const cur = current(), K = KINDS[cur.kind], n = cur.ids.length;
    for (const b of $('rounds').querySelectorAll('.round')) b.setAttribute('aria-pressed', b.dataset.choice === choice);
    if ($('customCount')) $('customCount').textContent = choice === 'custom' ? plural(SEL[pickKind].size, KINDS[pickKind].noun) : '';
    $('customWrap').hidden = choice !== 'custom';
    $('startBtn').disabled = n === 0;
    $('startBtn').textContent = n ? `Start with ${plural(n, K.noun)}` : `Pick some ${K.noun[1]}`;
    $('optDetailWrap').hidden = !K.detail;
    if (K.detail) $('optDetailText').textContent = K.detail.label;
    $('optColorsWrap').hidden = !['quiz', 'overlay'].includes(chosenMap) || K.hints === false;
    $('optColorsText').textContent = hintLabelOf(cur.kind);
    $('helpWrap').hidden = [...$('helpWrap').querySelectorAll('.toggle')].every(t => t.hidden);
    pressed('mapSeg', 'map', chosenMap);
    if (view === 'setup') {
      const chosen = cur.ids.flatMap(id => K.areas[id]);
      markOut(chosen);
      // On the street map alone the round's areas are tinted instead (the map itself has no borders to dim).
      const inRound = new Set(chosen);
      for (const a of AREAS) if (SP[a]) SP[a].getElement().classList.toggle('pre', plain() && inRound.has(a));
      showLabels(cur.kind, cur.ids);
      syncHints();
    }
    store('map', chosenMap);
  }
  // "Top N by …": replace the selection with the first N of a ranking (optionally widened by expand).
  $('topN').value = load('topN') || 20;
  $('topGo').onclick = () => {
    const K = KINDS[pickKind], sel = SEL[pickKind];
    const n = Math.max(1, Math.min(K.ids.length, parseInt($('topN').value, 10) || 20));
    $('topN').value = n; store('topN', n);
    const rank = K.rankings[+$('topBy').value || 0];
    let ids = rank.order.slice(0, n);
    if (rank.expand) ids = [...new Set(ids.flatMap(rank.expand))];
    sel.clear(); ids.filter(id => K.areas[id]).forEach(id => sel.add(id)); syncPicker();
  };
  $('selAll').onclick = () => { KINDS[pickKind].ids.forEach(id => SEL[pickKind].add(id)); syncPicker(); };
  $('selNone').onclick = () => { SEL[pickKind].clear(); syncPicker(); };
  // The preview switches with the map choice; best scores are kept per map, so the rounds list follows too.
  for (const b of $('mapSeg').querySelectorAll('button')) b.onclick = () => { chosenMap = b.dataset.map; if (view === 'setup') useMap(chosenMap, true); buildRounds(); };
  $('saveBtn').onclick = () => {
    const cur = current(); if (!cur.ids.length) return;
    saveQuiz($('saveName').value, cur.kind, cur.ids); $('saveName').value = '';
  };
  $('saveName').addEventListener('keydown', e => { if (e.key === 'Enter') $('saveBtn').click(); });
  $('shareBtn').onclick = () => { const cur = current(); if (cur.ids.length) copyLink(cur.kind, cur.ids, $('saveName').value.trim()); };

  function openSetup() {
    clearInterval(timer); clearTimeout(G.ending); useMap(chosenMap); clearMap();
    show('setup');
    buildPicker(); buildRounds();
    frameRound();
  }

  /* ---------- pictures (prompt 'photo') ---------- */
  // A picture shown large over the page; a click anywhere or Escape closes it. Once its question is answered
  // (reveal) it comes with its label and link.
  const lightbox = document.createElement('div'); lightbox.className = 'lightbox'; lightbox.hidden = true;
  lightbox.innerHTML = '<figure><img alt=""><figcaption><span></span><a target="_blank" rel="noopener"></a></figcaption></figure>';
  document.body.append(lightbox);
  lightbox.onclick = e => { if (e.target.tagName !== 'A') lightbox.hidden = true; };
  function zoomPhoto(p, reveal) {
    const [img, cap] = lightbox.firstChild.children, [label, link] = cap.children;
    img.src = p.src; img.alt = p.alt || '';
    cap.hidden = !reveal; label.textContent = p.label || '';
    link.hidden = !p.link; if (p.link) { link.href = p.link; link.textContent = p.linkLabel || 'Street View'; }
    lightbox.hidden = false;
  }
  // An answered picture, small: a click shows it large with its label.
  function thumb(p) {
    const b = document.createElement('button'), im = document.createElement('img');
    b.type = 'button'; b.className = 'ph' + (p.cls ? ' ' + p.cls : ''); b.title = p.label || '';
    im.src = p.src; im.alt = p.label || ''; im.loading = 'lazy';
    b.append(im); b.onclick = () => zoomPhoto(p, true);
    return b;
  }
  // Q.flyAnswer: a shown answer the view doesn't show (outside it, or a speck) is flown to; the next question
  // returns to the view before.
  function showAnswer(areas) {
    if (overlaid()) { if (areas.length && !areas.some(a => lmap.getBounds().intersects(SP[a].getBounds()))) flyTo(areas); return; }
    if (!Q.flyAnswer || !areas.length) return;
    const s = scale();
    const seen = areas.some(a => {
      const b = EL[a].getBBox(), x = b.x + b.width / 2, y = b.y + b.height / 2;
      return x > vb.x && x < vb.x + vb.w && y > vb.y && y < vb.y + vb.h && (AREA[a].dot || Math.max(b.width, b.height) * s >= 16);
    });
    if (seen) return;
    G.back ??= { ...vb };
    flyTo(areas);
  }

  /* ---------- game ---------- */
  const G = { kind: Q.kinds[0].key, items: [], queue: [], i: 0, tries: 0, revealed: false, found: new Set(), score: 0, streak: 0, best: 0, res: [], t0: 0, retry: false, review: false, missed: [], points: 0, box: null, back: null };
  // Map play: points per answer by distance; 4,000 or more counts as close (a perfect answer for the stars).
  const FREE_MAX = 5000, FREE_CLOSE = 4000, FREE_LEGEND = ['4,000+', '2,500+', '1,000+', 'Under 1,000'];
  const freeClass = p => p >= FREE_CLOSE ? 0 : p >= 2500 ? 1 : p >= 1000 ? 2 : 3;
  const fmtKm = km => (km < 10 ? km.toFixed(1) : Math.round(km).toLocaleString('en-US')) + ' km';
  const fmtPts = n => `${n.toLocaleString('en-US')} ${n === 1 ? 'point' : 'points'}`;
  const missTitle = $('missWrap').querySelector('h2'), MISS_TITLE = missTitle ? missTitle.textContent : '';
  const scoreLabel = $('sScore').nextElementSibling, SCORE_LABEL = scoreLabel ? scoreLabel.textContent : '';
  const legendItems = [...$('done').querySelectorAll('.legend li')], LEGEND = legendItems.map(li => li.lastChild.textContent);
  let timer = 0;

  // "Areas left" counter, top middle of the map, for items that need a click on each of their areas.
  const countEl = document.createElement('div');
  countEl.className = 'count'; countEl.hidden = true; countEl.setAttribute('aria-live', 'polite');
  $('stage').appendChild(countEl);
  const needAll = (K, id) => K.clickAll && !plain() && K.areas[id].length > 1;
  const remaining = (K, id) => K.areas[id].filter(a => !G.found.has(a));
  function updateCount() {
    const K = KINDS[G.kind], id = G.queue[G.i];
    countEl.hidden = !(view === 'play' && id !== undefined && needAll(K, id));
    if (countEl.hidden) return;
    const left = remaining(K, id).length, b = document.createElement('b');
    b.textContent = left;
    countEl.replaceChildren(b, left === K.areas[id].length ? ' areas' : ' more');
  }

  function start(kind, items, { retry = false, review = false, box = null } = {}) {
    clearInterval(timer); clearTimeout(G.ending);
    Object.assign(G, { kind, items, queue: shuffle(items), i: 0, score: 0, streak: 0, best: 0, res: [], t0: performance.now(), retry, review, points: 0, box, back: null });
    useMap(chosenMap); clearMap();
    if (box) { if (onStreet()) frameStreet({ kind, ids: items, box }); else frame(box); }
    if (scoreLabel) scoreLabel.textContent = mapStyle === 'free' ? 'Points' : SCORE_LABEL;
    markOut(KINDS[kind].dim === false ? AREAS : items.flatMap(id => KINDS[kind].areas[id]));
    $('ticks').replaceChildren(...G.queue.map(() => document.createElement('i')));
    setFeedback($('fb'), '', '', '');
    show('play'); ask();
    timer = setInterval(() => $('sTime').textContent = fmt(performance.now() - G.t0), 500);
  }
  function ask() {
    const id = G.queue[G.i], K = KINDS[G.kind];
    G.tries = 0; G.revealed = false; G.found = new Set();
    mark(null);
    const isName = K.prompt === 'name', isText = K.prompt === 'text', isPhoto = K.prompt === 'photo';
    $('dial').hidden = isName || isText || isPhoto; $('bigname').hidden = !isName;
    if ($('card')) $('card').hidden = !isText;
    if ($('photo')) $('photo').hidden = !isPhoto;
    const shown = isPhoto ? $('photo') : isText ? $('card') : isName ? $('bigname') : $('dial');
    shown.classList.remove('pop'); void shown.offsetWidth; shown.classList.add('pop');
    // The view goes back to where it was before it flew to a shown answer.
    if (G.back) { vb = G.back; G.back = null; apply(); }
    if (isPhoto) {
      const p = K.photo(id), next = G.queue[G.i + 1];
      $('photoImg').src = p.src; $('photoImg').alt = p.alt || '';
      $('photo').onclick = () => zoomPhoto(p, false);
      if (next !== undefined) new Image().src = K.photo(next).src; // the next picture is there when it is asked
    }
    else if (isText) { const t = K.text(id); $('sent').textContent = t.text; $('sent').className = 'sent ' + (t.cls || ''); $('sent').lang = t.lang || ''; }
    else if (isName) $('bigname').textContent = K.name(id);
    else if (K.dial) $('code').replaceChildren(...K.dial(id).map(([text, cls]) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; return s; }));
    else $('code').textContent = K.short(id);
    // The optional hint under the prompt, e.g. the state a code is in; empty (and hidden) otherwise.
    const ask = $('ask'); ask.replaceChildren();
    if (K.detail && $('optDetail').checked) { const s = document.createElement('strong'); s.textContent = K.detail.text(id); ask.append(s); }
    $('sQ').textContent = (G.i + 1) + '/' + G.queue.length;
    $('sScore').textContent = mapStyle === 'free' ? G.points.toLocaleString('en-US') : G.score; $('sStreak').textContent = G.streak;
    [...$('ticks').children].forEach((t, i) => t.classList.toggle('now', i === G.i));
    updateCount();
    if (RV) RV.asked();
  }
  function pick(area) {
    if (view === 'setup') {
      if (choice !== 'custom') editAsCustom();
      const ids = KINDS[pickKind].at[area]; if (ids) toggleItems(ids); return;
    }
    if (view === 'explore') { explore(area); return; }
    if (view === 'play') answer(area);
  }
  function flash(kind, id) {
    const K = KINDS[kind], key = kind + ':' + id;
    for (const p of pathsOf(K.areas[id])) p.classList.add('flash');
    showLabel(kind, id, true);
    clearTimeout(flashTimers.get(key));
    flashTimers.set(key, setTimeout(() => {
      for (const p of pathsOf(K.areas[id])) p.classList.remove('flash');
      if (!G.res.some((t, i) => G.queue[i] === id)) showLabel(kind, id, false);
      flashTimers.delete(key);
    }, 800));
  }
  // Flash just the clicked area (and its label, when labels are per area).
  function flashArea(area) {
    const key = 'area:' + area, p = pathsOf([area])[0];
    p.classList.add('flash');
    buildLabels(G.kind);
    const e = AREA_ENTRY[area];
    if (e) { e.shown.add(key); renderEntry(e); }
    clearTimeout(flashTimers.get(key));
    flashTimers.set(key, setTimeout(() => { p.classList.remove('flash'); if (e) { e.shown.delete(key); renderEntry(e); } flashTimers.delete(key); }, 800));
  }
  function answer(area) {
    const K = KINDS[G.kind], target = G.queue[G.i];
    clearPin();
    if (K.areas[target].includes(area)) {
      if (needAll(K, target)) {
        // One of several areas: mark it found and wait for the rest.
        const wasFound = G.found.has(area);
        G.found.add(area);
        const left = remaining(K, target).length;
        if (left > 0) {
          if (!wasFound) {
            const p = pathsOf([area])[0]; p.classList.remove('ans', 'flash'); p.classList.add('found');
            buildLabels(G.kind); const e = AREA_ENTRY[area]; if (e) { e.shown.add(target); renderEntry(e); }
            if (G.revealed) mark(remaining(K, target));
          }
          updateCount();
          setFeedback($('fb'), 'ok', `✓ ${K.name(target)}`, `${left} more`);
          return;
        }
      }
      if (G.review) G.tries = RV.grade(G.tries > 0 || G.revealed); // a review grades by the clock: known, unsure or not known
      const k = RESULT_CLASS[G.tries];
      for (const p of pathsOf(K.areas[target])) { p.classList.remove('ans', 'flash', 'found', ...RESULT_CLASS); p.classList.add(k); }
      showLabel(G.kind, target);
      const tick = $('ticks').children[G.i]; tick.classList.remove('now'); tick.classList.add(k);
      G.res.push(G.tries);
      if (G.tries === 0) { G.score++; G.streak++; G.best = Math.max(G.best, G.streak); } else G.streak = 0;
      const title = G.revealed ? K.name(target) : `✓ ${K.name(target)}` + (G.tries ? ` · try ${G.tries + 1}` : '');
      setFeedback($('fb'), G.tries === 0 ? 'ok' : 'bad', title, K.about(target));
      if (K.photo) $('fb').prepend(thumb(K.photo(target)));
      if (K.pin) showPin(K.pin(target));
      if (RV) RV.answered(target, G.tries === 0);
      G.i++;
      if (G.i >= G.queue.length) finish(); else ask();
      return;
    }
    if (K.flashArea || K.labelPerArea) flashArea(area);
    else { const clicked = K.primary(area); if (clicked) flash(G.kind, clicked); }
    const what = K.clicked(area, target);
    if (G.revealed) {
      setFeedback($('fb'), 'bad', `✗ ${what}`, `→ ${K.name(target)}`);
      return;
    }
    G.tries++;
    G.streak = 0; $('sStreak').textContent = 0;
    if (RV && !G.review) RV.missed(target); // a wrong click counts for a question on the review stack
    const left = G.review ? 0 : MAX_TRIES - G.tries; // a review shows the answer after one wrong click
    if (left > 0) {
      setFeedback($('fb'), 'bad', `✗ ${what}`, `${plural(left, ['try', 'tries'])} left`);
    } else {
      G.revealed = true;
      const rest = remaining(K, target);
      for (const p of pathsOf(rest)) p.classList.add('ans');
      mark(rest);
      if (plain()) flyTo(K.areas[target]);
      else showAnswer(rest);
      setFeedback($('fb'), 'bad', `✗ ${what}`, `→ ${K.name(target)}`);
    }
  }
  // Map play: one click anywhere answers. The city appears in the color of the points, joined to the click.
  function answerFree(p) {
    const K = KINDS[G.kind], target = G.queue[G.i], now = performance.now();
    // Nothing left to ask, a broken point, or the second click of a double click: not an answer.
    if (target === undefined || !Number.isFinite(p.x + p.y) || now - (G.lastFree || 0) < 350) return;
    G.lastFree = now;
    const a = AREA[K.areas[target][0]];
    const [km, scored] = Q.free.measure(p, target);
    const pts = Math.round(FREE_MAX * Math.exp(-10 * scored / Q.free.span));
    const t = G.review ? RV.grade(pts < FREE_CLOSE) : freeClass(pts), k = RESULT_CLASS[t];
    for (const el of pathsOf(K.areas[target])) { el.classList.remove('ans', 'flash', ...RESULT_CLASS); el.classList.add(k); }
    showLabel(G.kind, target);
    const line = document.createElementNS(NS, 'line'), dot = document.createElementNS(NS, 'circle');
    line.setAttribute('x1', p.x); line.setAttribute('y1', p.y); line.setAttribute('x2', a.lx); line.setAttribute('y2', a.ly);
    dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
    gFree.replaceChildren(line, dot); sizeLabels();
    const tick = $('ticks').children[G.i]; tick.classList.remove('now'); tick.classList.add(k);
    G.res.push(t); G.points += pts;
    if (t === 0) { G.score++; G.streak++; G.best = Math.max(G.best, G.streak); } else G.streak = 0;
    setFeedback($('fb'), t === 0 ? 'ok' : 'bad', K.name(target), [`${fmtKm(km)} · ${fmtPts(pts)}`, [].concat(K.about(target))[0]]);
    // Bring the city into view when it lies outside what the map shows now.
    if (a.lx < vb.x || a.lx > vb.x + vb.w || a.ly < vb.y || a.ly > vb.y + vb.h) flyToPts([p, { x: a.lx, y: a.ly }]);
    if (RV) RV.answered(target, t === 0);
    G.i++;
    // The last answer stays on screen for a moment before the results.
    if (G.i >= G.queue.length) { $('sScore').textContent = G.points.toLocaleString('en-US'); G.ending = setTimeout(finish, 1500); } else ask();
  }
  function finish() {
    clearInterval(timer); clearTimeout(G.ending); const ms = performance.now() - G.t0; const n = G.res.length;
    const K = KINDS[G.kind];
    mark(null);
    for (const id of G.items) showLabel(G.kind, id);
    const complete = n === G.items.length;
    const prev = G.retry ? null : bestFor(G.kind, G.items, mapStyle);
    const free = mapStyle === 'free';
    const better = !prev || (free ? G.points > (prev.p || 0) || (G.points === prev.p && ms < prev.t) : G.score > prev.s || (G.score === prev.s && ms < prev.t));
    if (!G.retry && complete) {
      // Map play keeps two records: the most points (with its time) and the most close answers, which the stars use.
      if (free && (better || G.score > (prev ? prev.s : 0))) { keepBest(G.kind, G.items, mapStyle, { s: Math.max(G.score, prev ? prev.s : 0), t: better ? ms : prev.t, p: better ? G.points : prev.p }); saveRating(); }
      else if (!free && better) { keepBest(G.kind, G.items, mapStyle, { s: G.score, t: ms }); saveRating(); }
    }
    $('rScore').textContent = free ? G.points.toLocaleString('en-US') : `${G.score} of ${n}`;
    const pct = n ? Math.round((free ? G.points / (n * FREE_MAX) : G.score / n) * 100) : 0;
    let line = free ? `${pct}% of ${(n * FREE_MAX).toLocaleString('en-US')} · ${G.score}/${n} close · ${fmt(ms)}` : `${pct}% · ${fmt(ms)} · streak ${G.best}`;
    if (prev && complete) line += better ? ' · new best' : free ? ` · best ${(prev.p || 0).toLocaleString('en-US')}` : ` · best ${prev.s}/${n}`;
    legendItems.forEach((li, i) => { li.lastChild.textContent = free ? FREE_LEGEND[i] : LEGEND[i]; });
    $('rLine').textContent = line;
    const missed = G.queue.slice(0, n).map((id, i) => [id, G.res[i]]).filter(([, t]) => t > 0)
      .sort((a, b) => K.ids.indexOf(a[0]) - K.ids.indexOf(b[0]));
    $('chips').replaceChildren(...missed.map(([id, t]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip ' + RESULT_CLASS[t];
      b.dataset.id = id; b.textContent = K.chip(id); b.title = K.chipTitle(id);
      if (K.photo) { const p = K.photo(id), im = document.createElement('img'); im.src = p.src; im.alt = ''; im.loading = 'lazy'; b.classList.add('ph'); b.textContent = K.name(id); b.prepend(im); }
      return b;
    }));
    $('rPick').textContent = '';
    $('missWrap').hidden = !missed.length; $('retryBtn').hidden = !missed.length;
    $('retryBtn').textContent = free ? `Retry (${missed.length})` : `Retry missed (${missed.length})`;
    if (missTitle) missTitle.textContent = free ? 'Not close' : MISS_TITLE;
    G.missed = missed.map(([id]) => id);
    show('done');
    // A perfect round puts its questions on the review stack.
    if (RV) { if (complete && !G.retry && G.score === n) RV.learned(G.kind, G.items); RV.finished(); }
  }
  $('chips').addEventListener('click', e => {
    const chip = e.target.closest('[data-id]'); if (!chip) return;
    const id = chip.dataset.id, K = KINDS[G.kind];
    mark(K.areas[id]); $('rPick').textContent = `${K.name(id)}: ${K.about(id)}`;
    flyTo(K.areas[id]);
    if (K.photo) zoomPhoto(K.photo(id), true);
  });

  /* ---------- explore ---------- */
  function explore(area) {
    for (const p of pathsOf(AREAS)) p.classList.remove('sel');
    pathsOf([area])[0].classList.add('sel'); mark([area]);
    if (plain()) { clearLabels(); for (const id of KINDS[Q.exploreKind].at[area] || []) showLabel(Q.exploreKind, id); }
    const info = Q.explore(area);
    $('eCode').textContent = info.code; $('eDial').classList.toggle('multi', info.code.includes(','));
    setFeedback($('eInfo'), '', info.title, info.sub);
    if (info.photos) { const g = document.createElement('div'); g.className = 'gallery'; g.append(...info.photos.map(thumb)); $('eInfo').append(g); }
  }

  /* ---------- buttons & keys ---------- */
  $('startBtn').onclick = () => { const cur = current(); if (cur.ids.length) start(cur.kind, cur.ids, { box: cur.box }); };
  $('exploreBtn').onclick = () => {
    useMap(chosenMap); clearMap(); show('explore');
    if (!plain()) showAllLabels(Q.exploreKind);
    $('eCode').textContent = '--'; $('eDial').classList.remove('multi');
    setFeedback($('eInfo'), '', '', '');
  };
  $('restartBtn').onclick = () => start(G.kind, G.items, { retry: G.retry, box: G.box });
  $('endBtn').onclick = () => { if (!G.res.length) { openSetup(); return; } finish(); };
  $('againBtn').onclick = () => start(G.kind, G.items, { retry: G.retry, box: G.box });
  $('retryBtn').onclick = () => start(G.kind, G.missed, { retry: true, box: G.box });
  $('menuBtn').onclick = openSetup;
  $('eBack').onclick = openSetup;
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'Escape') { lightbox.hidden = true; return; }
    const zoomIn = e.key === '+' || e.key === '=', zoomOut = e.key === '-', reset = e.key === '0';
    if (onStreet()) { if (zoomIn) lmap.zoomIn(); else if (zoomOut) lmap.zoomOut(); else if (reset) { if (overlaid()) frameRound(); else fitHome(); } return; }
    if (zoomIn) zoomCenter(1.4); else if (zoomOut) zoomCenter(1 / 1.4); else if (reset) frameRound();
  });

  /* ---------- review: learned questions come back on a schedule, timed (see ./area-review.js) ---------- */
  // Loaded from here, so quiz pages need no changes: the schedule (assets/js/srs.js), then the review mode, which
  // gets what it needs of this engine and returns the calls made above (asked, missed, grade, answered, learned, finished).
  let RV = null;
  {
    const here = document.currentScript.src, ROOT = new URL('../../', here).href;
    const script = src => new Promise(done => { const s = document.createElement('script'); s.src = src; s.onload = done; document.head.append(s); });
    script(ROOT + 'assets/js/srs.js').then(() => script(new URL('area-review.js', here).href)).then(() => {
      RV = areaReview({
        $, Q, G, KINDS, PAGE: PAGE_ID, ROOT, RESULT_CLASS, shuffle, fmt, start, markOut, mark, pathsOf, showLabel, setFeedback, needAll, flyTo, onStreet, showAnswer,
        free: () => mapStyle === 'free', home: () => onStreet() ? fitHome() : resetView(),
      });
    });
  }

  openSetup();
  requestAnimationFrame(frameRound);
})();
