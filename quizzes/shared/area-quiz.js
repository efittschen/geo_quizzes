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
//   exploreList  optional { label, items: [{ label, areas, rare, code, title, sub }] }: Explore also shows one of a
//                list at a time, picked beside Back (a language: the tiles of its letters lit, the `rare` ones of
//                them in the color of rare answers)
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
//   board        true where the "map" is a board of tiles (shared/lang-config.js): it is fitted to its box again when
//                a round starts, since on a phone that box grows once the round's panel replaces the list of rounds
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
//                every box starts with (before any is picked: the kind marked start: true, else the kind the
//                others follow), and a box stands in the level of the round it shows; best scores, stars and
//                review cards stay per kind.
//   langsAlways  true: every round box shows its languages, not only the box of the round picked (a click on one
//                picks that round in that language)
//   langLabel    'Country': the languages are chosen once for the whole list, in a row of their own above the
//                rounds under this heading, instead of in each round's box (the countries of a script's words: a
//                choice a player has to see). A round with nothing in the language chosen is left out.
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
  const FRESH_MS = 700; // how long an answer's color stays in a kind that starts every question on a clean map

  const NS = 'http://www.w3.org/2000/svg';
  const $ = id => document.getElementById(id);
  const svg = $('map'), gR = $('regions'), gB = $('borders'), gL = $('labels');
  const hoverUse = $('hoverUse'), ansUse = $('ansUse'), askUse = $('askUse'); // (askUse: the place asked, prompt 'area')
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
  // Every area gets its element, but it is put in the drawing only while the kind played or explored draws it
  // (placeAreas): a round of states draws no Kreis. The others wait in SPARE, which is no part of the page.
  const SPARE = document.createElementNS(NS, 'g');
  for (const a of Q.areas) {
    if (a.lx === undefined || a.a === undefined) Object.assign(a, pathStats(a.d), a.lx === undefined ? {} : { lx: a.lx, ly: a.ly });
    AREA[a.id] = a;
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', a.d); p.setAttribute('class', 'r');
    p.dataset.a = a.id; p.dataset.g = a.g;
    if (a.top) p.classList.add('top');
    if (a.dot) p.classList.add('dot');
    SPARE.appendChild(p); EL[a.id] = p;
  }
  // Areas marked top stay above everything else in the map (they may overlap their neighbours).
  const raiseTops = () => { for (const a of Q.areas) if (a.top && EL[a.id].isConnected) gR.appendChild(EL[a.id]); };
  if (Q.context) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', Q.context); $('ctx').appendChild(p); }
  // A quiz map in Web Mercator lies on the plain map of the world (Q.world, see mercator.js; world.js is fetched
  // unless it is the page's own map): the neighbours, and what lies between a country's far-off parts.
  // The world under the map is two shapes, its land (without a line) and its lines (coasts and borders), holding only
  // what lies near the picture drawn: the countries whose box meets it, and the lines of the cells of a grid that
  // meet it. Both are made anew with every full redraw (worldNear, from apply): drawing the whole world every time,
  // or even a shape for every part of it, is what the browser would otherwise do. A line two countries share stays
  // in the one shape of lines (it has one color, not two see-through ones over each other).
  let worldNear = () => {};
  if (Q.world && typeof MERCATOR === 'object') {
    const lay = () => {
      const path = cls => { const p = document.createElementNS(NS, 'path'); p.setAttribute('class', cls); p.setAttribute('d', ''); return p; };
      const places = WORLD.reg.filter(r => r.a), CELL = WORLD.w / 32, cells = new Map();
      const add = (c, run) => { const l = cells.get(c); if (l) l.push(run); else cells.set(c, [run]); };
      // (world.js writes a ring as "Mx,yLx,y…Z": its points are taken as they are written, not read and written again)
      for (const r of places) for (const part of r.d.split('M')) {
        const ring = part.replace('Z', '').split('L'), n = ring.length; if (!part) continue;
        const x = new Float64Array(n), y = new Float64Array(n);
        for (let i = 0; i < n; i++) { const k = ring[i].indexOf(','); x[i] = +ring[i].slice(0, k); y[i] = +ring[i].slice(k + 1); }
        // the cell of each of the ring's edges (by its middle; edge i runs from point i to the next one)
        const cell = new Float64Array(n);
        for (let i = 0, j = n - 1; i < n; j = i++) cell[j] = (Math.floor((x[j] + x[i]) / 2 / CELL) + 64) * 4096 + Math.floor((y[j] + y[i]) / 2 / CELL) + 64;
        let from = 0; while (from < n && cell[from] === cell[(from + n - 1) % n]) from++; // where the ring enters a cell: its runs are walked from there
        if (from === n) { add(cell[0], ring.join('L') + 'Z'); continue; } // all of it in one cell
        for (let i = 0, run; i < n; i++) {
          const at = (from + i) % n;
          if (!i || cell[at] !== cell[(at + n - 1) % n]) add(cell[at], run = [ring[at]]);
          run.push(ring[(at + 1) % n]);
        }
      }
      // each cell's lines as a piece of path, with the box of its points
      const pieces = [...cells.values()].map(runs => {
        const pts = runs.flatMap(run => (typeof run === 'string' ? run.replace('Z', '').split('L') : run)), box = [Infinity, Infinity, -Infinity, -Infinity];
        for (const t of pts) { const k = t.indexOf(','), x = +t.slice(0, k), y = +t.slice(k + 1); if (x < box[0]) box[0] = x; if (x > box[2]) box[2] = x; if (y < box[1]) box[1] = y; if (y > box[3]) box[3] = y; }
        return { box, d: runs.map(run => 'M' + (typeof run === 'string' ? run : run.join('L'))).join('') };
      });
      const copies = MERCATOR.world(WORLD, Q.proj, Q.size[0]).map(([s, dx, dy]) => { // (a second one for a map over the 180th meridian)
        const g = document.createElementNS(NS, 'g'), land = path('wland'), lines = path('wline');
        g.setAttribute('transform', `translate(${dx},${dy}) scale(${s})`); g.append(land, lines); $('ctx').prepend(g);
        return { s, dx, dy, land, lines, key: '' };
      });
      // [x0, y0, x1, y1]: the picture drawn, in the quiz map's units
      worldNear = ([X0, Y0, X1, Y1]) => {
        for (const c of copies) {
          const x0 = (X0 - c.dx) / c.s, y0 = (Y0 - c.dy) / c.s, x1 = (X1 - c.dx) / c.s, y1 = (Y1 - c.dy) / c.s, meets = b => b[2] >= x0 && b[0] <= x1 && b[3] >= y0 && b[1] <= y1;
          const land = places.filter(r => meets(r.b)), lines = pieces.filter(p => meets(p.box)), key = land.map(r => r.id).join() + '|' + lines.map(p => pieces.indexOf(p)).join();
          if (key === c.key) continue;
          c.key = key; c.land.setAttribute('d', land.map(r => r.d).join('')); c.lines.setAttribute('d', lines.map(p => p.d).join(''));
        }
      };
      setTimeout(() => worldNear(pictureBox())); // (after the page's script has run, which lay may run in)
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
     prompt 'text' shows text(id) -> { text, cls, lang, tag } on the sign card instead (tag: a small label over it,
     e.g. the country a letter is read that way in). prompt 'photo' shows a picture,
     photo(id) -> { src, alt, label, link }: a click enlarges it, and once answered it comes with its label and
     link (e.g. the place in Street View); missed pictures are listed as pictures. areaLabel(areaId) labels
     each area on its own (e.g. a script's letter) instead of one label per item; flashArea: true flashes
     only the clicked area on a wrong click; clicked(areaId, targetId) may use the target; about(id) and
     presets' ids may be arrays or functions returning them. dim: false keeps every area lit while playing
     (when the answer is the whole map's business, dimming the rest would give it away). labelPerArea: true
     labels every area with all the items dialed there (main one first), so a code covering two areas shows
     on both. clickAll: true makes an item covering several areas need a click on each of them on the quiz
     map and on the overlay, with a counter on the map ("3 areas", or what areaNoun calls them: 'letters'); on the
     street map one click still counts and highlights them all. fresh: true is for areas that are the answer to many of the kind's items (a country that writes
     many letters): every question starts on a map without colors, an answer's color leaving it after a moment,
     and the results show none. pickAll: true asks for every area of the item at once, as a set (where a road
     marking may be seen, in all its prefectures): a click picks an area and a second one drops it, then Check (or
     Enter) answers with what is picked. A wrong check drops the wrong picks (flashed), keeps the right ones (green,
     fixed) and says how many are missing, a try less; after the last one the rest is shown, and Check goes on.
     Every area stays lit (as dim: false), and an answer's colors stay until the next question's first pick.
     rare(id, areaId) -> true colors a right area another way (blue): the answer holds
     there, but is seldom met (a letter a country writes in a few words only).
     dial(id) -> [[text, 'hot' | 'cold'], …] shows the dial code in parts (e.g. only the prefix bold); pin(id) ->
     { x, y, ll, label } marks a place (e.g. the town the code belongs to) after the question is answered.
     prompt 'area' outlines the item's areas on the map as the question (flying to them when they are out of view
     or too small to see) and says ask(id), else "Which <noun> is this?": with typed, the player names a place
     they are shown, the other way round from clicking a place they are named.
     choices() -> [names], with typed: the answer is picked from that list instead of spelled. What is typed only
     narrows the list (names that start with it first, then those with a word that does, then the rest that
     contain it); a click on a name puts it in the field (a double click answers with it at once), the arrow keys
     move the mark, and Enter or OK answers with the name marked: typed then gets that name, so what is typed is
     never compared letter by letter. The button by the field folds the list away, to just the name marked once
     something is typed, and back, for every quiz (the settings' listMin).
     A picture's cls 'blur' shows it blurred while it is asked (and when enlarged before it is answered).
     typed(id, text) -> true | false makes the answer one to type, in a field under the prompt (a name read in
     another script, written in Latin letters): a wrong one counts like a wrong click, a shown answer is typed to
     go on, and clicks on the map answer nothing. time(id) is how many times longer than a click such an answer
     may take on the review's clock.
     say(id) -> { text, lang } has the answer said aloud once it is given: see "sound" below.
     cards: '<kind>' gives a kind the review cards of another one, whose questions it shares (a country's words
     among the words of all countries): a word learned in one is learned in the other.
     modes: ['list', 'type', 'pairs'] (any of them) are ways to answer besides clicking the map: see MODES below.
     answer(id) is the name answered in them (default: the name in the kind it is `of`, else its own name), answers(id)
     more names that count when typed; defaultMode the one a page starts in before one is picked.
     looks: true (a kind of flag pictures) offers the flags waving or hanging, not only flat: see LOOKS below. */
  const kindOf = k => {
    const ids = k.groups.flatMap(g => g.ids);
    const areas = Object.fromEntries(ids.map(id => [id, k.areasOf(id)]));
    const at = {}; // areaId -> items that include it
    for (const id of ids) for (const a of areas[id]) (at[a] ??= []).push(id);
    const size = id => areas[id].reduce((s, a) => s + (AREA[a].size ?? AREA[a].a ?? 0) / at[a].length, 0); // (size: an area's on an equal-area map, where the quiz map is Mercator)
    const rankings = [...(k.areaRank === false ? [] : [{ label: 'largest area', order: ids.slice().sort((a, b) => size(b) - size(a)) }]), ...(k.rankings || [])];
    const many = k.noun[1], count = new Set(ids).size;
    return { ...k, ids, areas, at, rankings, primary: k.primary || (a => (at[a] || [])[0]), ...(k.pickAll ? { dim: false } : {}),
      sub: k.sub ?? `${count.toLocaleString('en-US')} ${count === 1 ? k.noun[0] : many}`, pickTitle: k.pickTitle ?? `${many[0].toUpperCase()}${many.slice(1)} to practice` };
  };
  const KINDS = Object.fromEntries(Q.kinds.map(k => [k.key, kindOf(k)]));

  /* ---------- ways to answer: on the map, or (a kind's modes) from a list, typed, or in pairs ----------
     list   the name picked from a list of all the kind's names, narrowed by what is typed (see choices)
     type   the name typed (see typed)
     pairs  a board of questions and names, up to PAIRS pairs at a time, to match: a question and its name, picked one
            after the other; a wrong pair counts against both and flashes. A round bigger than a board is played board
            after board. The map lies under the board, and shows the answers once the round is over.
     pick   the question as asked, and four names to pick from (its own and three of the round's, or of the kind's
            where the round has too few); the switch says "<its language> → <the other's>": "Kanji → English"
     pickback  the other way round: the name, and four questions to pick from ("English → Kanji")
            (a wrong pick is a wrong try, as a wrong click; the number keys pick too)
     Each mode is played as a kind of its own, '<kind>~<mode>', with the kind's items and rounds: its best results (per
     map, as every kind's) and its review cards are its own, and a round played perfectly in any mode counts for the
     stars. The name answered is the kind's answer(id): the Latin name of a name in another script or form. */
  const MODES = [['map', 'Map'], ['list', 'List'], ['type', 'Type'], ['pairs', 'Pairs'], ['pick', 'Pick'], ['pickback', 'Pick back']], PAIRS = 7;
  // A mode's name on its switch: the picks by the languages they go between, where the kind and the one it is of say theirs.
  const modeLabel = (K, m) => {
    const mine = K.lang, theirs = KINDS[K.of] && KINDS[K.of].lang;
    if (mine && theirs && (m === 'pick' || m === 'pickback')) return m === 'pick' ? `${mine} → ${theirs}` : `${theirs} → ${mine}`;
    return MODES.find(x => x[0] === m)[1];
  };
  // A question as words (a pick's or a pair's): its text in its script, its name, or its code.
  const askText = (K, id) => (K.prompt === 'text' ? K.text(id).text : K.prompt === 'name' || K.prompt === 'area' ? K.name(id) : K.chip(id));
  // A typed name as it is compared: no capitals, accents, spaces or punctuation ("&" is "and"); and whether two such
  // names are one slip apart (a letter added, dropped or changed, or two letters swapped).
  const plainName = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^\p{L}\p{N}]+/gu, '');
  function oneOff(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0; while (i < a.length && a[i] === b[i]) i++;
    return a.slice(i + 1) === b.slice(i + 1) || a.slice(i) === b.slice(i + 1) || a.slice(i + 1) === b.slice(i)
      || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
  }
  // typed(id, text) from each item's names (forms[id], plain): one of them, or one slip from one of six letters or
  // more, unless what is typed is another item's name.
  function typedOf(forms) {
    const owner = new Map();
    for (const [id, list] of Object.entries(forms)) for (const f of list) (owner.get(f) || owner.set(f, new Set()).get(f)).add(id);
    return (id, text) => {
      const t = plainName(text), mine = forms[id] || [];
      if (mine.includes(t)) return true;
      if (owner.has(t)) return false;
      return t.length >= 6 && mine.some(f => f.length >= 6 && oneOff(t, f));
    };
  }
  for (const K of Object.values(KINDS)) {
    const answerName = K.answer || (KINDS[K.of] ? id => KINDS[K.of].name(id) : K.name);
    for (const mode of K.modes || []) {
      const forms = Object.fromEntries(K.ids.map(id => [id, [...new Set([answerName(id), ...[].concat(K.answers ? K.answers(id) : [])].filter(Boolean).map(plainName))]]));
      const names = [...new Set(K.ids.map(answerName))].sort((a, b) => a.localeCompare(b));
      KINDS[`${K.key}~${mode}`] = { ...K, key: `${K.key}~${mode}`, base: K.key, mode, of: undefined, modes: undefined, clickAll: false, pickAll: false,
        cards: `${K.cards || K.key}~${mode}`, label: `${K.label} · ${modeLabel(K, mode)}`, answerName,
        ...(mode === 'pairs' ? { pairs: true, typed: undefined, choices: undefined, time: () => 1.5 }
          : mode === 'pick' || mode === 'pickback' ? { choose4: mode, typed: undefined, choices: undefined, time: () => 1.5 }
          : { typed: typedOf(forms), choices: mode === 'list' ? () => names : undefined, time: () => (mode === 'list' ? 2 : 3) }) };
    }
  }

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

  /* ---------- pan & zoom for the quiz map ----------
     The view is a box of the map (vb), shown in the stage. The picture of the map (the SVG) is drawn for a view and
     reaches beyond each side of the stage by AHEAD of the stage's size (the browser only paints the part near the
     stage, so a larger picture costs next to nothing). While a finger, the mouse or the wheel moves the map, that
     picture is only moved and sized to the view: the browser slides what it has drawn already, which costs it next to
     nothing. Drawing a large map again for every step of a move (as a change of the SVG's viewBox does) is what made
     moving it slow, and drawing it again in the middle of a drag is what made the drag stutter. So it is drawn again
     only when the hand rests (REST ms) or lets go, and while held only once the picture is stretched or shrunk by
     more than HELD_STRETCH (a drag that goes on past the picture shows the sea beside it until then, as the street
     map's library does). Moved by the wheel, it is drawn again when the view has come EDGE of the way into what was
     drawn ahead or the picture is stretched by more than STRETCH. Meanwhile lines and labels grow and shrink with the
     picture. */
  // Points are told apart, and those worked out here rounded, to 1/QN of a map unit: hundredths, or finer where the
  // map's own points are (Q.grain, mercator.js).
  const QN = Math.max(100, Math.round(1 / (Q.grain || 1)));
  const [MW, MH] = Q.size, PAD = Q.pad, stage = $('stage'), AHEAD = .5, EDGE = .6, STRETCH = 1.6, HELD_STRETCH = 4, REST = 120;
  let base = { x: 0, y: 0, w: MW, h: MH }, vb = { ...base };
  // The picture's box: the stage's and `ahead` of its size more on every side (a share, so it follows the stage's size).
  let ahead = 0;
  function reach(a) { if (a !== ahead) Object.assign(svg.style, { left: -a * 100 + '%', top: -a * 100 + '%', width: (1 + 2 * a) * 100 + '%', height: (1 + 2 * a) * 100 + '%' }); ahead = a; }
  reach(AHEAD);
  svg.setAttribute('viewBox', `${-ahead * MW} ${-ahead * MH} ${MW * (1 + 2 * ahead)} ${MH * (1 + 2 * ahead)}`);
  stage.addEventListener('scroll', () => { stage.scrollLeft = stage.scrollTop = 0; }); // (a browser without `overflow: clip` could be made to scroll the stage to the picture's rest)
  // The map's box on the screen is the stage's: the picture is larger, and moved (none while the street map is shown).
  const stageBox = () => (svg.style.display === 'none' ? { left: 0, top: 0, width: 0, height: 0 } : stage.getBoundingClientRect());
  const HOME = Q.home || [0, 0, MW, MH]; // what the map shows when zoomed out: all of it, or the page's part
  function fit() {
    const r = stageBox(); if (!r.width || !r.height) return;
    const a = r.width / r.height;
    let w = HOME[2] - HOME[0] + PAD * 2, h = HOME[3] - HOME[1] + PAD * 2;
    if (w / h < a) w = h * a; else h = w / a;
    base = { x: (HOME[0] + HOME[2]) / 2 - w / 2, y: (HOME[1] + HOME[3]) / 2 - h / 2, w, h };
  }
  let sized = 0; // the scale the labels were last sized for: moving the map without zooming leaves them as they are
  let drawn = null, slid = false, raf = 0, resting = 0; // the view the picture is drawn for; whether it is moved from there
  const showTiles = () => { if (tiles) { const r = stageBox(), s = Math.min(r.width / vb.w, r.height / vb.h); if (s) tiles.view(vb.x - (r.width / s - vb.w) / 2, vb.y - (r.height / s - vb.h) / 2, s); } };
  // The picture drawn for the view.
  function apply() {
    cancelAnimationFrame(raf); clearTimeout(resting);
    svg.setAttribute('viewBox', `${vb.x - ahead * vb.w} ${vb.y - ahead * vb.h} ${vb.w * (1 + 2 * ahead)} ${vb.h * (1 + 2 * ahead)}`);
    if (slid) { svg.style.transform = ''; slid = false; }
    drawn = { ...vb };
    const s = scale(); if (s !== sized) sizeLabels(s); syncDetail(s);
    worldNear(pictureBox());
    showTiles();
  }
  // The part of the map the picture holds (the stage's view and what is drawn ahead), [x0, y0, x1, y1] in map units.
  function pictureBox() {
    const r = stageBox(), k = Math.min(r.width / vb.w, r.height / vb.h) || 1, w = r.width / k * (1 + 2 * ahead), h = r.height / k * (1 + 2 * ahead), cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2;
    return [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
  }
  // The picture as it is, moved and sized to the view; drawn again where that no longer does (see above).
  function slide() {
    const r = stageBox();
    if (!drawn || !r.width || !r.height) return apply();
    // where a view puts the map in the stage: its scale, and the room left beside it
    const put = v => { const s = Math.min(r.width / v.w, r.height / v.h); return { s, x: (r.width - v.w * s) / 2, y: (r.height - v.h * s) / 2 }; };
    const d = put(drawn), n = put(vb), k = n.s / d.s;
    // how far the view reaches into what is drawn ahead (1: to its end), on its worst side
    const out = Math.max((drawn.x - vb.x) / drawn.w, (vb.x + vb.w - drawn.x - drawn.w) / drawn.w, (drawn.y - vb.y) / drawn.h, (vb.y + vb.h - drawn.y - drawn.h) / drawn.h) / ahead;
    if (pts.size ? k > HELD_STRETCH || k < 1 / HELD_STRETCH : out > EDGE || k > STRETCH || k < 1 / STRETCH) return apply();
    // (the picture's own corner lies `ahead` of the stage's size outside the stage's)
    const tx = n.x - k * d.x + n.s * (drawn.x - vb.x) + ahead * r.width * (1 - k), ty = n.y - k * d.y + n.s * (drawn.y - vb.y) + ahead * r.height * (1 - k);
    svg.style.transform = `translate(${tx}px,${ty}px) scale(${k})`; slid = true;
    showTiles();
    clearTimeout(resting); resting = setTimeout(apply, REST);
  }
  const glide = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(slide); }; // once per frame, however many steps came
  function scale() { const r = stageBox(); return Math.min(r.width / vb.w, r.height / vb.h) || 1; }
  function toSvg(cx, cy, v) {
    const r = stageBox(); const s = Math.min(r.width / v.w, r.height / v.h);
    const ox = (r.width - v.w * s) / 2, oy = (r.height - v.h * s) / 2;
    return { x: v.x + (cx - r.left - ox) / s, y: v.y + (cy - r.top - oy) / s };
  }
  // On the street map and the overlay the map zooms in as far as the street map's tiles go (zoom level 19); a Mercator
  // map has 256 · 2^zoom / 360 / k screen pixels to its unit there (k: its units to a degree of longitude, mercator.js).
  const STREET_MAX = Q.proj && Q.proj.type === 'mercator' ? 256 * 2 ** 19 / 360 / Q.proj.k : 0;
  function clampV(v) {
    const r = stageBox(), deep = onStreet() && STREET_MAX && r.width;
    const minW = deep ? Math.min(r.width, r.height * v.w / v.h) / STREET_MAX : base.w / Q.maxZoom, maxW = base.w * (Q.world ? 3 : 1.15); // (a map lying on the world's shows more of it when zoomed out)
    const k = Math.min(Math.max(v.w, minW), maxW) / v.w;
    if (k !== 1) { const cx = v.x + v.w / 2, cy = v.y + v.h / 2; v.w *= k; v.h *= k; v.x = cx - v.w / 2; v.y = cy - v.h / 2; }
    const mx = v.w * .5, my = v.h * .5;
    v.x = Math.min(Math.max(v.x, -mx), MW - v.w + mx); v.y = Math.min(Math.max(v.y, -my), MH - v.h + my);
    return v;
  }
  // (show: how the new view gets on screen: drawn at once, or the picture moved to it while the wheel turns)
  function zoomAt(cx, cy, f, from = vb, show = apply) {
    const p = toSvg(cx, cy, from); const w = from.w / f, h = from.h / f;
    const r = stageBox(); const s = Math.min(r.width / w, r.height / h);
    const ox = (r.width - w * s) / 2, oy = (r.height - h * s) / 2;
    vb = clampV({ x: p.x - (cx - r.left - ox) / s, y: p.y - (cy - r.top - oy) / s, w, h }); show();
  }
  function zoomCenter(f) { const r = stageBox(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, f); }
  function resetView() { fit(); vb = { ...base }; apply(); }
  // Show a part of the map, [x0, y0, x1, y1] (a round's box), or all of it.
  function frame(box) {
    resetView();
    if (!box) return;
    const ar = base.w / base.h, w = Math.max(box[2] - box[0], (box[3] - box[1]) * ar) + PAD * 2, h = w / ar;
    vb = clampV({ x: (box[0] + box[2]) / 2 - w / 2, y: (box[1] + box[3]) / 2 - h / 2, w, h }); apply();
  }
  // The view to go back to: the box of the round being played or chosen. The street map alone stays where it is (a
  // round's box would give it away); asked to (all: the button, the key), it shows all of the map.
  const frameRound = (all = false) => {
    const r = view === 'play' ? { kind: G.kind, ids: G.items, box: G.box } : view === 'setup' ? current() : {};
    if (plain()) { if (all === true) resetView(); return; }
    frame(r.box);
  };
  svg.addEventListener('wheel', e => { e.preventDefault(); const f = Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0022)); zoomAt(e.clientX, e.clientY, f, vb, glide); }, { passive: false });
  $('zIn').onclick = () => zoomCenter(1.6); $('zOut').onclick = () => zoomCenter(1 / 1.6); $('zFit').onclick = () => frameRound(true);
  // The stage changes size: the map keeps its middle and how far it is zoomed in. Not only with the window: on a
  // phone the panel lies above the map, and grows and shrinks with what it shows (the round's question, an answer),
  // so the stage does with it. (A finger on the map: once it lets go, see up.)
  let stageSize = '', refitLater = false;
  function refit() {
    const r = stageBox(), size = r.width + 'x' + r.height;
    if (!r.width || size === stageSize) return;
    if (pts.size) { refitLater = true; return; }
    stageSize = size; refitLater = false;
    const c = { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 }; const k = vb.w / base.w;
    fit(); vb = { w: base.w * k, h: base.h * k }; vb.x = c.x - vb.w / 2; vb.y = c.y - vb.h / 2; vb = clampV(vb); apply();
  }
  { const r = stageBox(); stageSize = r.width + 'x' + r.height; } // (the size the map is first fitted to: nothing to do for it)
  window.addEventListener('resize', refit);
  if (window.ResizeObserver) new ResizeObserver(refit).observe(stage);

  const pts = new Map(), TAP_SLOP = 10; let drag = null, pinch = null, downArea = null, moved = false;
  svg.addEventListener('pointerdown', e => {
    svg.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) { drag = { x: e.clientX, y: e.clientY, v: { ...vb }, s: scale() }; moved = false; downArea = areaAt(e); }
    else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, v: { ...vb } }; moved = true; drag = null; }
  });
  svg.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) { if (e.pointerType === 'mouse') hover(areaAt(e)); return; }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size === 2) {
      const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const p = toSvg(pinch.m.x, pinch.m.y, pinch.v); const f = d / pinch.d; const w = pinch.v.w / f, h = pinch.v.h / f;
      const r = stageBox(); const s = Math.min(r.width / w, r.height / h); const ox = (r.width - w * s) / 2, oy = (r.height - h * s) / 2;
      vb = clampV({ x: p.x - (m.x - r.left - ox) / s, y: p.y - (m.y - r.top - oy) / s, w, h });
      glide();
    } else if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      // (the grabbing hand is for a mouse: a new cursor is a new style for every area of the map, which a finger need not wait for)
      // (a finger wobbles more than a mouse: a tap is still a tap within TAP_SLOP pixels)
      if (!moved && Math.hypot(dx, dy) > (e.pointerType === 'touch' ? TAP_SLOP : 6)) { moved = true; if (e.pointerType === 'mouse') svg.classList.add('grab'); }
      if (moved) { vb = clampV({ ...drag.v, x: drag.v.x - dx / drag.s, y: drag.v.y - dy / drag.s }); glide(); }
    }
  });
  // The area a press or the pointer is on. On a unit drawn as one shape any of its areas, since they are all the same
  // item (a round of states asks nothing of the Kreise); in Explore, which tells about an area, the one under it.
  function areaAt(e) {
    const t = e.target, d = t && t.dataset; if (!d) return null;
    if (d.a) return d.a;
    const p = d.u !== undefined ? UNDER[+d.u] : null; if (!p) return null;
    if (view !== 'explore') return p.areas[0];
    const q = toSvg(e.clientX, e.clientY, vb), at = s => inside(s, q.x, q.y);
    // (its shape drawn at a view's detail may reach half a pixel past its areas: then the area there, of any unit)
    return p.areas.find(a => at(shapeOf(SVG_SPACE, a))) || (shapesNear(SVG_SPACE, q.x, q.y).find(at) || {}).a || p.areas[0];
  }
  function up(e) {
    const had = pts.delete(e.pointerId); // false when the press began outside the map
    // one finger of a pinch lifted: the other one goes on moving the map from where it is (it is no tap)
    if (pinch && pts.size === 1) { const [p] = pts.values(); drag = { x: p.x, y: p.y, v: { ...vb }, s: scale() }; }
    if (pts.size < 2) pinch = null;
    if (pts.size === 0) {
      svg.classList.remove('grab');
      // the hand lets go: the picture is drawn for where the map is now (unless it is that picture already)
      if (slid || !drawn || ['x', 'y', 'w', 'h'].some(k => drawn[k] !== vb[k])) apply();
      if (refitLater) refit(); // (the stage changed size while it was held)
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

  /* ---------- the street map and the overlay: the quiz map on the street map's tiles ---------- */
  // Every quiz map that offers them is in Web Mercator (mercator.js), the street map's own projection, so the street
  // map's tiles lie under it as they are (map-tiles.js, behind the quiz map, following its view: see showTiles). The
  // overlay is the quiz map itself, tinting the tiles (area-quiz.css); the street map alone is the same map with its
  // areas not shown, there to be tapped, and only what was answered shows.

  /* ---------- one interface over the maps ---------- */
  let mapStyle = 'quiz';
  const onStreet = () => mapStyle === 'street' || mapStyle === 'overlay'; // on the street map, with or without the areas
  const overlaid = () => mapStyle === 'overlay';
  const plain = () => mapStyle === 'street'; // the street map alone: nothing may give the borders away
  const pathsOf = areas => areas.map(a => EL[a]);
  const shapesOf = a => [EL[a]];
  // Classes the stylesheet reads on the map (hints, fade, merged, picking).
  const mapClass = (cls, on) => svg.classList.toggle(cls, on);

  // keep: the picker changed the map (no round is starting), so the new map shows the place the old one showed, at
  // the same size (as far as it zooms): only the look changes. Else each map starts from its whole.
  function useMap(style, keep) {
    clearLabels(); hover(null);
    mapStyle = style;
    svg.classList.toggle('free', style === 'free');
    svg.classList.toggle('overlay', overlaid()); svg.classList.toggle('blind', plain());
    syncStreets();
    if (keep) { vb = clampV({ ...vb }); apply(); } else resetView();
    syncHints(); syncCover();
  }
  // The street map's tiles behind the map: on the street map and the overlay, and behind a city quiz's map (showBack).
  function syncStreets() {
    const on = onStreet() || shownBack !== 'quiz';
    svg.classList.toggle('streets', on);
    if (on || tiles) withTiles(() => { tiles.streets().show(onStreet() || shownBack !== 'quiz'); apply(); });
  }
  function activeKind() { return view === 'explore' ? Q.exploreKind : view === 'setup' ? choiceKind() : G.kind; }
  // The item under the pointer: outlined on the quiz map, tinted on the overlay; in a kind with pickAll, where areas
  // are picked one by one, the area alone.
  // (not on the street map alone: that would show its borders)
  function hover(area) {
    if (view === 'play' && KINDS[G.kind].prompt === 'area') { hoverUse.setAttribute('d', ''); return; } // (the place asked is the only one outlined)
    const K = KINDS[activeKind()], id = area && K.primary(area);
    hoverUse.setAttribute('d', !area || plain() ? '' : K.pickAll ? outline([area]) : id ? outline(K.areas[id]) : '');
  }
  function mark(areas) { ansUse.setAttribute('d', areas ? outline(areas) : ''); }
  // The shapes of some areas as one: where they make up units drawn as one shape (see `whole` below), by those.
  function outline(areas) {
    const done = new Set();
    return areas.map(a => { const p = UNDER[underOf[a]]; if (!p || !p.whole) return AREA[a].d; if (done.has(p)) return ''; done.add(p); return p.getAttribute('d'); }).join(' ');
  }
  // An area's box on the quiz map: from its outline where it is not drawn itself.
  const boxOf_ = a => { if (EL[a].isConnected) return EL[a].getBBox(); const s = shapeOf(SVG_SPACE, a); return { x: s.x0, y: s.y0, width: s.x1 - s.x0, height: s.y1 - s.y0 }; };
  function flyTo(areas) {
    const bs = areas.map(boxOf_);
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
        e = byPos[key] = { ...m, ids: [], shown: new Set(), el: document.createElementNS(NS, 'text') };
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
    sizeLabels(); labelsOut();
  }
  // A label of an area's own (areaLabel) is marked dimmed with its area, for a page that keeps those labels on show
  // (a board of tiles, see lang-config.js).
  function labelsOut() { for (const a in AREA_ENTRY) AREA_ENTRY[a].el.classList.toggle('out', EL[a].classList.contains('out')); }
  function renderEntry(e) {
    const K = KINDS[labelKind];
    // A flashed area ('area:…' in shown) reveals everything on its label for a moment.
    const all = [...e.shown].some(s => s.startsWith('area:'));
    const text = e.fixed !== undefined ? (e.shown.size ? e.fixed : '')
      : [...new Set(e.ids.filter(id => all || e.shown.has(id)).map(id => K.short(id)))].join(' / '); // (items named alike at one spot, such as two pictures of one region's plates, once)
    if (e.fixed === undefined) e.el.textContent = text;
    e.el.classList.toggle('off', !text);
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
  function sizeLabels(s = scale()) {
    sized = s;
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
    const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
    const t = document.createElementNS(NS, 'text'); t.setAttribute('x', p.x); t.setAttribute('y', p.y); t.textContent = p.label;
    gPins.append(c, t); sizeLabels();
  }
  function clearPin() { gPins.replaceChildren(); }

  const flashTimers = new Map();
  // A kind with fresh: the colors of the answers leave the map, at once or after `wait` ms.
  let freshTimer;
  function fresh(wait) {
    clearTimeout(freshTimer);
    const clear = () => { for (const a of AREAS) for (const p of shapesOf(a)) p.classList.remove(...RESULT_CLASS, 'rare'); };
    if (wait) freshTimer = setTimeout(clear, wait); else clear();
  }
  function clearMap() {
    clearPin(); gFree.replaceChildren(); clearTimeout(freshTimer);
    for (const t of flashTimers.values()) clearTimeout(t);
    flashTimers.clear();
    for (const a of AREAS) for (const p of shapesOf(a)) p.classList.remove('got', 't2', 't3', 'miss', 'ans', 'sel', 'pick', 'flash', 'found', 'rare', 'out', 'pre');
    clearLabels(); labelsOut();
    mark(null);
  }
  // Dim the areas outside the current set. The street map alone never shows it (its stylesheet ignores 'out'): that
  // would give away borders.
  function markOut(areas) {
    const inSet = new Set(areas);
    for (const a of AREAS) for (const p of shapesOf(a)) p.classList.toggle('out', !inSet.has(a));
    labelsOut(); syncUnitsOut();
  }

  /* ---------- layouts: when a kind's items are groups of areas (zones, states), each group is one shape ----------
     Areas answered by exactly the same items form a unit. The quiz map then draws only the units' outlines and
     colors each unit in one color: the areas' own hint color when a unit has only one, otherwise a color per unit
     that differs from its neighbours'. Code kinds (clickAll) and per-area labels (areaLabel) keep every area. */
  const LAYOUTS = {};
  const PALETTE = Array.from({ length: 10 }, (_, i) => `var(--h${i + 1})`);
  /* Precomputed (shapes.js beside the page, made by tools/builds/layer-shapes): for each kind whose items group areas,
     its units' colors, their shapes (dissolve) and their outlines (unitOutlines, both versions), worked out by this
     very code when the page was built. They are used where the units the page finds in its data are the ones they
     were made for (sig); else all of it is worked out here, as the page opens.
     Every line is kept once, as an arc: [x, y, then each next point's dx, dy], in 1/QN of a map unit. A shape
     or an outline is a list of runs, a run a list of arcs (~i: arc i backwards), each starting where the last ended.
     Each point between an arc's ends has a level (SHAPES.lv): how fine a view needs it. A view keeps only the points
     its pixels can show (band, see syncDetail), as the street map's library does at every zoom, but looked up, not
     worked out: zoomed out, a map draws a fraction of its points. Two units that share a border share its points. */
  const PRE = typeof SHAPES === 'object' && SHAPES.v === 1 && SHAPES.q === QN && !window.SHAPES_DUMP ? SHAPES.kinds : {};
  const ARC = [], BAND = [];
  function arcPts(i, T = 0) {
    if (T) { const all = arcPts(i), lv = SHAPES.lv[i]; return (BAND[T] ??= [])[i] ??= all.filter((_, j) => j === 0 || j === all.length - 1 || lv[j - 1] >= T); }
    if (ARC[i]) return ARC[i];
    const a = SHAPES.arcs[i], pts = [[a[0] / QN, a[1] / QN]];
    for (let j = 2, x = a[0], y = a[1]; j < a.length; j += 2) { x += a[j]; y += a[j + 1]; pts.push([x / QN, y / QN]); }
    return ARC[i] = pts;
  }
  function runPts(run, T = 0) {
    const pts = [];
    for (const r of run) { const a = r < 0 ? arcPts(~r, T).slice().reverse() : arcPts(r, T); pts.pop(); pts.push(...a); }
    return pts;
  }
  // (a ring left with fewer than four corners keeps all its points: an island too small to see stays one)
  const ringsD = (rings, T = 0) => rings.map(r => { let p = runPts(r, T); if (T && p.length < 5) p = runPts(r); p.pop(); return 'M' + p.join('L') + 'Z'; }).join('');
  const runsD = (runs, T = 0) => runs.map(r => 'M' + runPts(r, T).join('L')).join('');
  // (the units, and the outlines they are made of as the page's data has them: points in latitude and longitude, else
  // the path's own text; the same in every browser)
  function sigOf(units) {
    let n = 0; for (const u of units) for (const a of u) n += Q.geo && Q.geo[a] ? Q.geo[a].rings.reduce((m, r) => m + r.length, 0) : AREA[a].d.length;
    const s = units.map(u => u.join(',')).join('|') + '|' + Math.round(MW) + 'x' + Math.round(MH) + '|' + n + '|' + (Q.grain || '');
    let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36) + ':' + units.length;
  }
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
      if (units.some(u => u.length > 1)) {
        const P = PRE[kind] || PRE[KINDS[kind] && KINDS[kind].like], pre = P && P.sig === sigOf(units) ? P : null; // (a layer asked another way has the shapes of the one it is like)
        L = { units, pre, color: pre ? pre.color && Object.fromEntries(units.flatMap((u, i) => u.map(a => [a, pre.color[i]]))) : unitColors(K, units) };
      }
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
    // each pixel's unit (0: none, or a blend), then the same for the pixels inside one: both as plain lists of numbers
    const id = new Uint16Array(w * h), pure = new Uint16Array(w * h);
    for (let k = 0, q = 0; k < id.length; k++, q += 4) if (px[q + 3] === 255 && px[q + 2] === 0) id[k] = px[q] + (px[q + 1] << 8);
    for (let j = 1; j < h - 1; j++) for (let k = j * w + 1, end = (j + 1) * w - 1; k < end; k++) { const v = id[k]; if (v && id[k - 1] === v && id[k + 1] === v && id[k - w] === v && id[k + w] === v) pure[k] = v; }
    for (let j = 1; j < h - 5; j++) for (let k = j * w + 1, end = (j + 1) * w - 5; k < end; k++) {
      const u = pure[k]; if (!u) continue;
      for (const v of [pure[k + 4], pure[k + 4 * w]]) if (v && v !== u) { adj[u - 1].add(v - 1); adj[v - 1].add(u - 1); }
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
  // Outlines are worked out in a flat space, the quiz map's: rings(a) are the area's rings there; k: how many of its
  // units make one map unit, which scales every size above.
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
    const idOf = p => { const k = Math.round(p[0] * QN) * 67108864 + Math.round(p[1] * QN); let i = points.get(k); if (i === undefined) points.set(k, i = points.size); return i; };
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
    // loose: the areas with an edge that gets no outline although no other area has it: it faces another of the
    // unit's areas across a narrow gap, or along a border that doesn't line up (see `tight` below).
    const lines = units.map(() => []), loose = new Set();
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
      const n = Math.ceil(len / (STEP * sc)), at = t => [Math.round((e.p[0] + dx * t) * QN) / QN, Math.round((e.p[1] + dy * t) * QN) / QN];
      for (let i = 1, from = 0, side = sideAt(.5 / n); i <= n; i++) {
        const next = i < n ? sideAt((i + .5) / n) : null;
        if (next === side) continue;
        let to = 1;
        if (i < n) { let lo = (i - .5) / n, hi = (i + .5) / n; for (let k = 0; k < 6; k++) { const mid = (lo + hi) / 2; if (sideAt(mid) === side) lo = mid; else hi = mid; } to = (lo + hi) / 2; }
        if (side === 2) loose.add(e.a);
        else {
          const p = from ? at(from) : e.p, q = to < 1 ? at(to) : e.q;
          lines[e.u].push({ p, q, kp: from ? idOf(p) : e.kp, kq: to < 1 ? idOf(q) : e.kq, side, own: e.a });
        }
        from = to; side = next;
      }
    }
    return Object.assign(lines.map(es => joinEdges(es, gap, loose)), { loose });
  }
  // Edges end to end as one path, so the line has joins instead of thousands of loose ends. A small ring of edges
  // with the unit on its outside runs around a gap between the unit's areas, not around an island: it is left out.
  function joinEdges(es, gap, loose) {
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
        if (turn < 1e-6) { for (const e of part) if (e.own !== undefined) loose.add(e.own); continue; } // a gap, or a stray edge
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
  /* A unit is drawn as one shape (UNDER, `whole`): its border alone, the edges only one of its areas has (dissolve),
     with a line of its own color around it as each area had (it closes narrow gaps between its areas). Its areas are
     then not in the drawing at all (placeAreas), and the shape is what is clicked: a round of states draws and asks
     16 shapes, not 400 Kreise. Only an area with a state of its own is put in (the one picked in Explore, one flashing).
     Where the areas' borders don't meet point for point, the edges don't join up into a border: such a unit is drawn
     as its areas, one by one, over one shape of all of them in their color (no seam of the sea can show between
     them), and only the areas that need a line of their own color keep it (those unitOutlines calls loose), the
     others are `tight`. */
  function dissolve(areas, S = SVG_SPACE) {
    const key = p => Math.round(p[0] * QN) + ',' + Math.round(p[1] * QN), edges = new Map();
    for (const a of areas) for (const r of S.rings(a)) for (let i = 0; i < r.length; i++) {
      const p = r[i], q = r[(i + 1) % r.length], kp = key(p), kq = key(q); if (kp === kq) continue;
      const k = kp < kq ? kp + '|' + kq : kq + '|' + kp, e = edges.get(k);
      if (e) e.n++; else edges.set(k, { p, q, kp, kq, n: 1 });
    }
    // (an edge had an odd number of times is a border, as filling all the areas as one shape counts it: a spike that
    // goes out and back along an edge has it twice more)
    const border = [...edges.values()].filter(e => e.n % 2), at = new Map();
    for (const e of border) for (const k of [e.kp, e.kq]) { const l = at.get(k); if (l) l.push(e); else at.set(k, [e]); }
    for (const l of at.values()) if (l.length % 2) return null; // an end that goes nowhere: the borders don't meet
    const used = new Set(); let d = '';
    for (const e0 of border) {
      if (used.has(e0)) continue;
      used.add(e0);
      const run = [e0.p, e0.q]; let end = e0.kq;
      while (end !== e0.kp) {
        const f = at.get(end).find(f => !used.has(f)); if (!f) return null;
        used.add(f); const fwd = f.kp === end; run.push(fwd ? f.q : f.p); end = fwd ? f.kq : f.kp;
      }
      run.pop();
      d += 'M' + run.map(p => p[0] + ',' + p[1]).join('L') + 'Z';
    }
    return d;
  }
  let layoutKind, UNIT_LINES = [], UNDER = [], underOf = {}, detail = 0, band = 0; // (layoutKind: undefined until the first layout)
  // A unit drawn as one shape, at a band's detail (stored shapes only: one worked out here has all its points).
  function wholeOf(L, i, T) {
    if (!L.pre) return ((L.whole ??= {})[0] ??= [])[i] ??= dissolve(L.units[i].filter(a => !AREA[a].top && !AREA[a].dot));
    return ((L.whole ??= {})[T] ??= [])[i] ??= L.pre.fill[i] && ringsD(L.pre.fill[i], T);
  }
  function applyLayout(kind) {
    const L = layoutOf(kind), key = L ? kind : null;
    if (key === layoutKind) return;
    layoutKind = key;
    for (const p of [...UNIT_LINES, ...UNDER]) if (p) p.remove();
    UNIT_LINES = []; UNDER = []; underOf = {};
    for (const a of AREAS) { EL[a].style.removeProperty('--hint'); EL[a].classList.remove('tight'); }
    mapClass('merged', !!L);
    if (!L) return placeAreas();
    if (L.color) for (const a of AREAS) EL[a].style.setProperty('--hint', L.color[a]);
    UNIT_LINES = L.units.map(() => { const line = document.createElementNS(NS, 'path'); line.setAttribute('class', 'unit'); return line; });
    UNDER = L.units.map((u, i) => {
      const areas = u.filter(a => !AREA[a].top && !AREA[a].dot); if (areas.length < 2) return null;
      const p = document.createElementNS(NS, 'path'), hint = EL[areas[0]].style.getPropertyValue('--hint'), d = wholeOf(L, i, band);
      p.setAttribute('d', d || areas.map(a => AREA[a].d).join('')); p.dataset.g = AREA[areas[0]].g; p.dataset.u = i; if (hint) p.style.setProperty('--hint', hint);
      for (const a of areas) underOf[a] = i;
      p.areas = areas; p.whole = !!d;
      return p;
    });
    UNDER.forEach((p, i) => paintUnder(i));
    placeAreas();
    drawUnits();
    syncUnitsOut();
  }
  // What the quiz map draws, bottom up: the shapes under units, the areas that are drawn themselves (every one not in
  // a unit drawn as one shape, and of those the ones with a state of their own: picked in Explore, flashing), the
  // units' outlines, the areas on top. The rest wait in SPARE.
  const ownState = el => el.classList.contains('sel') || el.classList.contains('flash');
  const drawnItself = a => { const p = UNDER[underOf[a]]; return !p || !p.whole || ownState(EL[a]); };
  function placeAreas() {
    const shown = AREAS.filter(drawnItself);
    gR.replaceChildren(...UNDER.filter(Boolean), ...shown.filter(a => !AREA[a].top).map(a => EL[a]), ...UNIT_LINES, ...shown.filter(a => AREA[a].top).map(a => EL[a]));
    SPARE.replaceChildren(...AREAS.filter(a => !EL[a].isConnected).map(a => EL[a]));
  }
  // An area of a unit drawn as one shape is put in the drawing while it has a state of its own, and taken out after.
  function placeArea(a) {
    const el = EL[a], want = drawnItself(a);
    if (want === el.isConnected) return;
    if (want) gR.insertBefore(el, UNIT_LINES.find(l => l.isConnected) || null); else SPARE.appendChild(el);
  }
  // The shape under a unit is in the state all of the unit's areas are in (lit or not, answered, flashing).
  const AREA_ONLY = new Set(['r', 'tight', 'top', 'dot']);
  function paintUnder(i) {
    const p = UNDER[i]; if (!p) return;
    const [first, ...rest] = p.areas, cls = ['r', 'under', ...(p.whole ? ['whole'] : []), ...[...EL[first].classList].filter(c => !AREA_ONLY.has(c) && rest.every(a => EL[a].classList.contains(c)))].join(' ');
    if (p.getAttribute('class') !== cls) p.setAttribute('class', cls);
  }
  // (it follows them by itself, whoever changes an area's state, drawn or not: before the map is next drawn)
  const following = new MutationObserver(changes => {
    if (!UNDER.length) return;
    const units = new Set();
    for (const c of changes) { const a = c.target.dataset.a, i = underOf[a]; if (i === undefined) continue; units.add(i); if (UNDER[i] && UNDER[i].whole) placeArea(a); }
    for (const i of units) paintUnder(i);
  });
  following.observe(gR, { attributes: true, attributeFilter: ['class'], subtree: true });
  following.observe(SPARE, { attributes: true, attributeFilter: ['class'], subtree: true });

  // Each version of the outlines is worked out when it is first shown, and the other one right after it, as soon as
  // the page has nothing to do: zooming in would else stand still at FINE the first time, until it is worked out.
  const whenIdle = window.requestIdleCallback ? f => requestIdleCallback(f, { timeout: 4000 }) : f => setTimeout(f, 1500);
  function drawUnits() {
    const L = LAYOUTS[layoutKind], lines = L.pre ? ((L.bands ??= {})[detail + ':' + band] ??= Object.assign(L.pre.lines[detail].map(runs => runsD(runs, band)), { loose: new Set(L.pre.loose[detail]) }))
      : (L.lines ??= [])[detail] ??= unitOutlines(L.units, DETAIL[detail]);
    UNIT_LINES.forEach((p, i) => p.setAttribute('d', lines[i]));
    for (const a of AREAS) EL[a].classList.toggle('tight', underOf[a] !== undefined && !lines.loose.has(a));
    if (!L.ahead && !L.pre) { L.ahead = true; whenIdle(() => DETAIL.forEach((d, i) => { L.lines[i] ??= unitOutlines(L.units, d); })); }
  }
  // The detail a view draws: the version of the outlines (detail), and the band of points kept, those that lie half a
  // screen pixel or more off a line without them (band T: a tolerance of 2^(T-1) / QN map units, see SHAPES.lv).
  const bandOf = s => { const t = .5 / s * QN; return t < 1 ? 0 : Math.floor(Math.log2(t)) + 1; };
  function syncDetail(s = scale()) {
    const d = s >= FINE ? 1 : 0, T = typeof SHAPES === 'object' && SHAPES.lv ? bandOf(s) : 0;
    if (d === detail && T === band) return;
    const shapes = T !== band;
    detail = d; band = T;
    if (!layoutKind) return;
    const L = LAYOUTS[layoutKind];
    if (shapes && L.pre) UNDER.forEach((p, i) => { if (p && p.whole) p.setAttribute('d', wholeOf(L, i, band)); });
    drawUnits();
  }
  function syncUnitsOut() {
    if (!layoutKind) return;
    const out = LAYOUTS[layoutKind].units.map(u => u.every(a => EL[a].classList.contains('out')));
    UNIT_LINES.forEach((p, i) => p.classList.toggle('out', out[i]));
    for (const o of [true, false]) for (const p of UNIT_LINES) if (p.classList.contains('out') === o) gR.appendChild(p);
    raiseTops();
  }
  // For tools/builds/layer-shapes: with window.SHAPES_DUMP set before the page loads, the page works out what PRE
  // holds for each of its kinds, the same way as without it, and leaves it in window.SHAPES_OUT as paths (the build
  // turns them into arcs).
  if (window.SHAPES_DUMP) {
    const kinds = {};
    for (const k of Q.kinds) {
      const L = layoutOf(k.key); if (!L) continue;
      const lines = DETAIL.map(d => unitOutlines(L.units, d));
      kinds[k.key] = {
        sig: sigOf(L.units),
        color: L.color && L.units.map(u => L.color[u[0]]),
        fill: L.units.map(u => { const areas = u.filter(a => !AREA[a].top && !AREA[a].dot); return areas.length < 2 ? null : dissolve(areas); }),
        lines: lines.map(l => l.slice()), loose: lines.map(l => [...l.loose]),
      };
    }
    window.SHAPES_OUT = { v: 1, q: QN, kinds };
  }
  const hintLabelOf = kind => {
    const K = KINDS[kind], L = layoutOf(kind);
    return K.hintLabel || (L && L.color && !K.unitColors ? `Color each ${K.noun[0]}` : Q.hintLabel);
  };

  function syncHints() {
    const kind = activeKind();
    applyLayout(kind);
    mapClass('hints', $('optColors').checked && !plain() && !(view === 'play' && KINDS[kind].hints === false));
    svg.classList.toggle('all-labels', !!(Q.lettersLabel && $('optLetters') && $('optLetters').checked && view === 'play'));
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
    pairsEl.hidden = !(id === 'play' && KINDS[G.kind] && KINDS[G.kind].pairs);
    // A mode that answers without the map (a list, typing, four to pick from) has none, while playing and on its
    // results: the panel takes the page, everything in it larger (see .nomap).
    $('app').classList.toggle('nomap', (id === 'play' || id === 'done') && !!KINDS[G.kind] && ['list', 'type', 'pick', 'pickback'].includes(KINDS[G.kind].mode));
    if (id !== 'play') looksEl.hidden = true;
    ['setup', 'play', 'done', 'explore'].forEach(x => $(x).hidden = x !== id);
    $('app').classList.toggle('playing', id !== 'setup');
    $('startbar').hidden = id !== 'setup';
    // The map picker: on the setup screen, and during a review, to change the map its cards are asked on.
    const picking = id === 'setup' || (id === 'play' && G.review);
    $('mapSeg').hidden = !picking || FREE || $('mapSeg').childElementCount < 2;
    mapBar.hidden = !picking;
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
    if (window.parent !== window && new URLSearchParams(location.search).has('cards')) return; // (opened out of sight by the review page: no map is looked at)
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
    b.onclick = () => (view === 'play' && G.review ? reviewLook({ back: m }) : useBack(m));
    return b;
  }));
  mapBar.append(backSeg);
  function useBack(back) {
    chosenBack = back; store('back', back);
    for (const b of backSeg.children) b.setAttribute('aria-pressed', b.dataset.back === back);
    showBack(back);
  }
  // The one on screen: the chosen one, or in a review the one of its cards (see reviewModes).
  let shownBack = 'quiz';
  function showBack(back) {
    if (back === shownBack) return;
    shownBack = back;
    svg.classList.toggle('plain', back === 'street');
    syncStreets();
  }
  if (BACKS.length) useBack(chosenBack);
  // Street View coverage on top of the map, whatever the map: a switch of its own beside the map picker. It is the
  // layer of the Coverage page (data/coverage, see the README), redrawn in the quiz map's projection where that is
  // known (TILED).
  const COVER = HERE + '../../data/coverage';
  let coverOn = !!load('cover'), coverMeta = null, covered = false;
  const coverSeg = document.createElement('div'), coverBtn = document.createElement('button');
  coverSeg.className = 'maps'; coverSeg.hidden = !TILED; coverBtn.type = 'button'; coverBtn.textContent = 'Coverage'; coverBtn.title = 'Street View coverage';
  coverBtn.onclick = () => { coverOn = !coverOn; store('cover', coverOn || null); syncCover(); };
  coverSeg.append(coverBtn); mapBar.append(coverSeg);
  function syncCover() {
    coverBtn.disabled = !TILED; coverBtn.setAttribute('aria-pressed', coverOn && !!TILED);
    if (!TILED || (!coverOn && !covered)) return;
    covered = true;
    (coverMeta ||= fetch(COVER + '/meta.json').then(r => r.json())).then(meta => withTiles(() => { tiles.coverage(COVER, meta).show(coverOn); apply(); }), () => {});
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
  // The round a box shows, of a round and its other languages: the one picked, else the one in the language picked
  // last, else the one of the kind a quiz starts with, else the first.
  const keyOf = v => 'r:' + v.id, langOf = v => KINDS[v.kind].lang || KINDS[v.kind].label;
  const variantsOf = r => ROUNDS.filter(v => v === r || v.of === r);
  // (Q.langLabel: the language chosen for the whole list, and of each round the one in that language, if it has one)
  const LANGS = Q.langLabel ? uniq(Q.kinds.filter(k => ROUNDS.some(r => r.kind === k.key)).map(k => k.lang || k.label)) : []; // in the order of the kinds
  const listLang = () => (LANGS.includes(load('lang')) ? load('lang') : langOf((Q.kinds.find(k => k.start) ? ROUNDS.find(r => KINDS[r.kind].start) : null) || ROUNDS[0]));
  const shownOf = variants => (Q.langLabel ? variants.find(v => langOf(v) === listLang())
    : variants.find(v => keyOf(v) === choice) || variants.find(v => langOf(v) === load('lang')) || variants.find(v => KINDS[v.kind].start) || variants[0]);
  function validChoice() {
    if (!(choice === 'custom' || (choice === 'shared' && SHARED) || savedOf(choice) || roundOf(choice))) choice = keyOf(ROUNDS.filter(r => !r.of).map(r => shownOf(variantsOf(r))).find(Boolean));
  }
  // Another language for the whole list: the round picked stays picked, in that language, where it has one.
  function pickLang(lang) {
    const picked = roundOf(choice), same = picked && variantsOf(picked.of || picked).find(v => langOf(v) === lang);
    store('lang', lang);
    if (picked) { choice = same ? keyOf(same) : ''; validChoice(); store('choice', choice); }
    buildRounds(); frameRound();
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
  const nameOf = (kind, ids) => { kind = KINDS[kind].base || kind; const p = STORE.print(ids), r = ROUNDS.find(r => r.kind === kind && !r.random && STORE.print(roundIds(r)) === p); return r ? r.label : (SAVED.find(q => q.kind === kind && STORE.print(q.ids) === p) || {}).name; };
  const keepBest = (kind, ids, map, best) => keep(r => { (r.best ||= {})[bestKey(kind, ids, map)] = STORE.bestOut(best, ids.length, nameOf(kind, ids)); });
  { // results taken over from the layout before came without a name: those of this page's rounds get theirs
    const best = record().best || {}, unnamed = [];
    for (const r of ROUNDS) if (!r.random) { const p = STORE.print(roundIds(r)); for (const map of ['quiz', 'overlay', 'street', 'free']) { const k = `${r.kind}/${map}/${p}`; if (best[k] && !best[k].name) unnamed.push([k, r.label]); } }
    if (unnamed.length) keep(r => { for (const [k, name] of unnamed) if (r.best?.[k]) r.best[k].name = name; });
  }
  // How a card is reviewed: the way the last perfect round with it was played, which is kept with the card (see
  // area-review.js): on that map (the quiz map, the overlay, the street map; a city quiz's dots or its map by
  // distance) and, in a city quiz, with that background. A card not played perfectly since that is kept goes by the
  // best results, which don't say when: the map of a perfect result of a round, a saved or a custom quiz with its
  // item in it, the hardest of several (a player goes from the dots to the distance, not back); or else (a round
  // that has changed since) of any perfect result of its kind, the easiest of several; and with none the map
  // chosen on the setup screen. Its background is the one chosen there, as nothing tells what it was.
  const EASIEST = ['quiz', 'overlay', 'street', 'free'].filter(m => MAPS.some(([x]) => x === m)); // (the dots before the map by distance)
  const family = kind => KINDS[kind].cards || kind; // kinds that share their cards
  // Per family: { any: the maps with a perfect result, on: { item: the maps with one that has the item in it } }.
  function perfectMaps() {
    const out = {}, maps = {}; // maps: '<kind>/<items>' -> the maps those items were played perfectly on
    for (const [k, b] of Object.entries(record().best || {})) {
      const i = k.lastIndexOf('/'), j = k.lastIndexOf('/', i - 1), kind = k.slice(0, j), map = k.slice(j + 1, i);
      if (!KINDS[kind] || !EASIEST.includes(map) || !(b.score >= b.of)) continue;
      (maps[kind + '/' + k.slice(i + 1)] ||= new Set()).add(map);
      (out[family(kind)] ||= { any: new Set(), on: {} }).any.add(map);
    }
    const asked = [...ROUNDS.filter(r => !r.random).map(r => [r.kind, roundIds(r)]), ...SAVED.map(q => [q.kind, q.ids]), ...(SHARED ? [[SHARED.kind, SHARED.ids]] : []),
      ...Object.keys(KINDS).map(k => [k, KINDS[k].ids.filter(id => SEL[k].has(id))])];
    for (const [kind, ids] of asked) for (const map of maps[kind + '/' + STORE.print(ids)] || []) for (const id of ids) (out[family(kind)].on[id] ||= new Set()).add(map);
    return out;
  }
  // -> (kind, item, card) => { map, back }, for the cards of one review.
  function reviewModes() {
    let perfect = null;
    return (kind, id, card) => {
      if (EASIEST.includes(card.m)) return { map: card.m, back: BACKS.some(([b]) => b === card.b) ? card.b : 'quiz' };
      const p = (perfect ||= perfectMaps())[family(kind)], own = p && p.on[id];
      return { map: (own ? [...EASIEST].reverse().find(m => own.has(m)) : p && EASIEST.find(m => p.any.has(m))) || chosenMap, back: chosenBack };
    };
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
      const ids = roundIds(r), kinds = [r.kind, ...(KINDS[r.kind].modes || []).map(m => `${r.kind}~${m}`)]; // (in any mode)
      const best = Math.max(0, ...kinds.flatMap(k => ['quiz', 'overlay', 'street', 'free'].map(map => { const b = bestFor(k, ids, map); return b ? b.s / ids.length : 0; })));
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
    const played = playKind(kind), free = chosenMap === 'free' && played === kind; // (its best in the mode picked)
    const best = !random && (free ? ['free'] : ['quiz', 'overlay', 'street']).map(map => bestFor(played, ids, map)).filter(Boolean).sort((x, y) => y.s - x.s)[0];
    if (best) { const e = document.createElement('span'); e.className = 'best'; e.textContent = (best.s === ids.length ? '✓ ' : '') + (free ? (best.p || 0).toLocaleString('en-US') : `${best.s}/${ids.length}`); b.append(e); }
    b.onclick = () => choose(key);
    return b;
  }
  // A round offered in several languages is one box. It shows (and a click on it chooses) the round in the language
  // picked last, or in its first one; once it is the round picked, its languages are a switch under its name.
  function roundBox(variants) {
    if (variants.length < 2) { const r = variants[0]; return answerable(roundBtn(keyOf(r), r.label, r.sub, r.kind, roundIds(r), r.random)); }
    const on = shownOf(variants);
    if (Q.langLabel) return answerable(roundBtn(keyOf(on), on.label, '', on.kind, roundIds(on), on.random));
    const langs = () => options(variants.map(v => [langOf(v), '', v === on, () => { store('lang', langOf(v)); choice = keyOf(v); store('choice', choice); buildRounds(); frameRound(); }]));
    return answerable(roundBtn(keyOf(on), on.label, '', on.kind, roundIds(on), on.random), ...(keyOf(on) === choice || Q.langsAlways ? [langs()] : []));
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
  // How to answer (MODES): the mode picked last on this page, where the kind offers it, else the kind's own first one
  // (defaultMode), else the map. A switch in the box of the round picked, where its kind offers more than the map.
  let chosenMode = load('mode');
  const modesOf = kind => ['map', ...(KINDS[kind].modes || [])];
  const modeFor = kind => { const m = modesOf(kind), d = KINDS[kind].defaultMode; return m.includes(chosenMode) ? chosenMode : m.includes(d) ? d : 'map'; };
  const playKind = kind => (modeFor(kind) === 'map' ? kind : `${kind}~${modeFor(kind)}`);
  const modeRow = kind => { const row = options(modesOf(kind).map(m => [modeLabel(KINDS[kind], m), '', m === modeFor(kind), () => { chosenMode = m; store('mode', m); buildRounds(); }])); row.classList.add('modes'); return row; };
  // The box of the round picked, with its switches (its languages; how to answer). A box with buttons in it is a
  // group, not a button itself.
  function answerable(b, ...rows) {
    if (b.dataset.choice === choice && modesOf(choiceKind()).length > 1) rows.push(modeRow(choiceKind()));
    if (FREE && b.dataset.choice === choice && modeFor(choiceKind()) === 'map') rows.push(playRow());
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
    // (a page whose tabs are other pages has no room for folders of its own: its kinds' rounds are one list)
    const many = FOLDERS.length > 1 && !PAGE_FOLDERS, open = folderOf(choiceKind()), inOpen = kind => !many || folderOf(kind) === open;
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
    if (LANGS.length > 1) { const row = options(LANGS.map(l => [l, '', l === listLang(), () => pickLang(l)])); row.classList.add('list'); section(-1, Q.langLabel, [row]); }
    for (const r of ROUNDS) if (!r.of && inOpen(r.kind)) { const variants = variantsOf(r); if (shownOf(variants)) byTier[tierOf(roundIds(shownOf(variants)).length)].push(roundBox(variants)); }
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
      for (const a of AREAS) EL[a].classList.toggle('pre', plain() && inRound.has(a));
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
  for (const b of $('mapSeg').querySelectorAll('button')) b.onclick = () => {
    if (view === 'play' && G.review) { reviewLook({ map: b.dataset.map }); return; }
    chosenMap = b.dataset.map; if (view === 'setup') useMap(chosenMap, true); buildRounds();
  };
  // A review asks its cards on the maps they were last played on (see reviewModes); the picker changes that for the
  // rest of the review, from the question on screen (area-review.js keeps it), and leaves the setup screen's choice.
  function reviewLook(look) {
    if (look.map) useMap(look.map, true);
    if (look.back) showBack(look.back);
    syncReviewPickers();
    if (RV) RV.look(look);
  }
  function syncReviewPickers() {
    pressed('mapSeg', 'map', mapStyle);
    for (const b of backSeg.children) b.setAttribute('aria-pressed', b.dataset.back === shownBack);
  }
  $('saveBtn').onclick = () => {
    const cur = current(); if (!cur.ids.length) return;
    saveQuiz($('saveName').value, cur.kind, cur.ids); $('saveName').value = '';
  };
  $('saveName').addEventListener('keydown', e => { if (e.key === 'Enter') $('saveBtn').click(); });
  $('shareBtn').onclick = () => { const cur = current(); if (cur.ids.length) copyLink(cur.kind, cur.ids, $('saveName').value.trim()); };

  function openSetup() {
    clearInterval(timer); clearTimeout(G.ending); useMap(chosenMap); showBack(chosenBack); clearMap();
    pressed('mapSeg', 'map', chosenMap); for (const b of backSeg.children) b.setAttribute('aria-pressed', b.dataset.back === chosenBack);
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
    img.src = p.src; img.alt = p.alt || ''; img.dataset.look = reveal ? '' : p.cls || ''; // (a blurred picture stays so until answered)
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
  // returns to the view before. A review does the same on every map for an answer outside the view, since it keeps
  // the view from question to question.
  function showAnswer(areas) {
    if (overlaid()) {
      if (areas.length && !areas.some(a => { const b = boxOf_(a); return b.x < vb.x + vb.w && b.x + b.width > vb.x && b.y < vb.y + vb.h && b.y + b.height > vb.y; })) flyTo(areas);
      return;
    }
    if (!(Q.flyAnswer || G.review) || !areas.length) return;
    const s = scale();
    const seen = areas.some(a => {
      const b = boxOf_(a), x = b.x + b.width / 2, y = b.y + b.height / 2;
      return x > vb.x && x < vb.x + vb.w && y > vb.y && y < vb.y + vb.h && (!Q.flyAnswer || AREA[a].dot || Math.max(b.width, b.height) * s >= 16);
    });
    if (seen) return;
    G.back ??= { ...vb };
    flyTo(areas);
  }

  // The place asked (prompt 'area'): outlined, and flown to when it is out of view or too small to see.
  function showAsked(areas) {
    if (!askUse) return;
    askUse.setAttribute('d', areas ? outline(areas) : '');
    if (!areas || !areas.length) return;
    const s = scale(), bs = areas.map(boxOf_);
    const x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y)), x1 = Math.max(...bs.map(b => b.x + b.width)), y1 = Math.max(...bs.map(b => b.y + b.height));
    const inView = x0 >= vb.x && x1 <= vb.x + vb.w && y0 >= vb.y && y1 <= vb.y + vb.h;
    if (inView && Math.max(x1 - x0, y1 - y0) * s >= 24) return;
    // with room around it (four times its size, a twelfth of the map at least): its neighbours place it
    const ar = base.w / base.h, w = Math.min(base.w, Math.max((x1 - x0) * 4, (y1 - y0) * 4 * ar, base.w / 12)), h = w / ar;
    vb = clampV({ x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h }); apply();
  }

  /* ---------- game ---------- */
  const G = { kind: Q.kinds[0].key, items: [], queue: [], i: 0, tries: 0, revealed: false, found: new Set(), picked: new Set(), cleared: false, score: 0, streak: 0, best: 0, res: [], t0: 0, retry: false, review: false, missed: [], points: 0, box: null, back: null };
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
  // An answer's name as it is told: in a mode, with the name answered where that is another (福島県 · Fukushima).
  const told = (K, id) => (K.answerName && K.answerName(id) !== K.name(id) ? `${K.name(id)} · ${K.answerName(id)}` : K.name(id));
  const remaining = (K, id) => K.areas[id].filter(a => !G.found.has(a));
  function updateCount() {
    const K = KINDS[G.kind], id = G.queue[G.i];
    countEl.hidden = !(view === 'play' && id !== undefined && needAll(K, id));
    if (countEl.hidden) return;
    const left = remaining(K, id).length, b = document.createElement('b');
    b.textContent = left;
    countEl.replaceChildren(b, left === K.areas[id].length ? ` ${K.areaNoun || 'areas'}` : ' more');
  }

  /* ---------- sound: an answer said aloud (a kind with say) ---------- */
  // The browser speaks, in a voice of the device for the answer's language: what has no such voice stays silent, so
  // it depends on the device what is heard. The switch in the round's panel turns the sound off and on, for every
  // quiz (the settings' `sound`, see store.js).
  const soundBtn = $('soundBtn'), SPEAKS = typeof speechSynthesis === 'object' && typeof SpeechSynthesisUtterance === 'function';
  let soundOn = STORE.settings().sound !== false;
  if (SPEAKS) speechSynthesis.getVoices(); // (the list is fetched when first asked for, and may come late)
  const voiceOf = lang => speechSynthesis.getVoices().find(v => v.lang.replace('_', '-').toLowerCase().split('-')[0] === lang);
  function say(id) {
    const K = KINDS[G.kind];
    if (!SPEAKS || !soundOn || !K.say) return;
    const s = K.say(id), voice = s && s.text && voiceOf(s.lang);
    if (!voice) return;
    const u = new SpeechSynthesisUtterance(s.text);
    u.voice = voice; u.lang = voice.lang; u.rate = .8;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
  function syncSound() {
    if (!soundBtn) return;
    soundBtn.hidden = !(SPEAKS && KINDS[G.kind].say);
    soundBtn.setAttribute('aria-pressed', soundOn); soundBtn.textContent = soundOn ? 'Sound on' : 'Sound off';
  }
  if (soundBtn) soundBtn.onclick = () => {
    soundOn = !soundOn;
    STORE.setSettings(s => { if (soundOn) delete s.sound; else s.sound = false; });
    if (!soundOn) speechSynthesis.cancel();
    syncSound();
  };

  // map, back: a review asks its cards the way they were last played perfectly (see reviewModes), not as chosen on the
  // setup screen.
  function start(kind, items, { retry = false, review = false, box = null, map = chosenMap, back = chosenBack } = {}) {
    clearInterval(timer); clearTimeout(G.ending);
    if (KINDS[kind].mode && map === 'free') map = 'quiz'; // (a mode answers on the dots of a city quiz, not by distance)
    Object.assign(G, { kind, items, queue: shuffle(items), i: 0, score: 0, streak: 0, best: 0, res: [], t0: performance.now(), retry, review, points: 0, box, back: null });
    syncSound();
    useMap(map); showBack(back); clearMap();
    if (box && !plain()) frame(box); // (the street map alone stays where it is: a round's box would give it away)
    if (scoreLabel) scoreLabel.textContent = mapStyle === 'free' ? 'Points' : SCORE_LABEL;
    markOut(KINDS[kind].dim === false ? AREAS : items.flatMap(id => KINDS[kind].areas[id]));
    $('ticks').replaceChildren(...G.queue.map(() => document.createElement('i')));
    setFeedback($('fb'), '', '', '');
    show('play');
    if (review) syncReviewPickers();
    if (Q.board) frame(box);
    if (KINDS[kind].pairs) pairsStart(); else ask();
    timer = setInterval(() => $('sTime').textContent = fmt(performance.now() - G.t0), 500);
  }
  function ask() {
    const id = G.queue[G.i], K = KINDS[G.kind];
    G.tries = 0; G.revealed = false; G.found = new Set(); G.picked = new Set(); G.cleared = false;
    mark(null); syncCheck();
    const back = K.choose4 === 'pickback'; // (a pick back asks the name, in big letters)
    const isArea = K.prompt === 'area' && !back, isName = K.prompt === 'name' || isArea || back, isText = K.prompt === 'text' && !back, isPhoto = K.prompt === 'photo' && !back;
    $('dial').hidden = isName || isText || isPhoto; $('bigname').hidden = !isName; $('bigname').classList.toggle('asking', isArea);
    if ($('card')) $('card').hidden = !isText;
    if ($('photo')) $('photo').hidden = !isPhoto;
    const shown = isPhoto ? $('photo') : isText ? $('card') : isName ? $('bigname') : $('dial');
    shown.classList.remove('pop'); void shown.offsetWidth; shown.classList.add('pop');
    // The view goes back to where it was before it flew to a shown answer.
    if (G.back) { vb = G.back; G.back = null; apply(); }
    if (isPhoto) {
      const p = K.photo(id), next = G.queue[G.i + 1];
      showPicture(p); $('photoImg').alt = p.alt || ''; $('photo').dataset.look = p.cls || '';
      $('photo').onclick = () => zoomPhoto({ ...p, src: G.shownSrc || p.src }, false); // (enlarged as it is shown)
      if (next !== undefined) { new Image().src = K.photo(next).src; if (K.looks) dressAhead(K.photo(next).src); } // the next picture is there when it is asked (and drawn, in a look)
    }
    else if (isText) { const t = K.text(id); $('sent').textContent = t.text; $('sent').className = 'sent ' + (t.cls || ''); $('sent').lang = t.lang || ''; $('card').dataset.tag = t.tag || ''; }
    else if (isArea) { $('bigname').textContent = K.ask ? K.ask : `Which ${K.noun[0]} is this?`; showAsked(K.areas[id]); }
    else if (isName) $('bigname').textContent = back ? K.answerName(id) : K.name(id);
    else if (K.dial) $('code').replaceChildren(...K.dial(id).map(([text, cls]) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; return s; }));
    else $('code').textContent = K.short(id);
    if (typedForm) { typedForm.hidden = !K.typed; if (K.typed) { $('typed').value = ''; $('typed').focus({ preventScroll: true }); } }
    marked = 0; steered = false; syncList(); syncPicks(id); syncLooks();
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
    if (view === 'play' && !KINDS[G.kind].typed && !KINDS[G.kind].pairs && !KINDS[G.kind].choose4) { if (KINDS[G.kind].pickAll) togglePick(area); else answer(area); }
  }
  // A kind with pickAll: a click picks an area or drops it; Check answers with the picks (see KINDS).
  const checkBtn = $('checkBtn');
  function syncCheck() {
    if (!checkBtn) return;
    const K = KINDS[G.kind];
    checkBtn.hidden = !K.pickAll;
    checkBtn.disabled = !G.revealed && !G.picked.size;
    checkBtn.textContent = G.revealed ? 'Next' : G.picked.size ? `Check · ${plural(G.picked.size, K.areaNoun ? [K.areaNoun.replace(/s$/, ''), K.areaNoun] : ['area', 'areas'])} picked` : 'Check';
  }
  function pickLabel(area, on) {
    buildLabels(G.kind);
    const e = AREA_ENTRY[area]; if (!e) return;
    on ? e.shown.add('pick') : e.shown.delete('pick'); renderEntry(e);
  }
  function togglePick(area) {
    if (G.revealed || G.found.has(area) || G.queue[G.i] === undefined) return; // the answer shown: Check goes on
    // The last answer's colors and names leave the map with the first pick of the next question.
    if (!G.cleared) { fresh(); clearLabels(); G.cleared = true; }
    const on = !G.picked.has(area);
    if (on) G.picked.add(area); else G.picked.delete(area);
    for (const p of pathsOf([area])) p.classList.toggle('pick', on);
    pickLabel(area, on);
    syncCheck();
  }
  function check() {
    const K = KINDS[G.kind], target = G.queue[G.i];
    if (view !== 'play' || !K.pickAll || target === undefined || (!G.revealed && !G.picked.size)) return;
    const want = K.areas[target];
    if (G.revealed || (G.picked.size === want.length && want.every(a => G.picked.has(a)))) { answer(want[0]); return; }
    const extra = [...G.picked].filter(a => !want.includes(a)), missing = want.filter(a => !G.picked.has(a));
    for (const a of extra) {
      G.picked.delete(a); pathsOf([a])[0].classList.remove('pick'); pickLabel(a, false); flashArea(a);
    }
    for (const a of G.picked) if (!G.found.has(a)) { G.found.add(a); const p = pathsOf([a])[0]; p.classList.remove('pick'); p.classList.add('found'); }
    wrong([extra.length ? 'Not ' + extra.map(a => K.clicked(a, target)).join(', ') : '', missing.length ? `${missing.length} missing` : ''].filter(Boolean).join(' · '));
    syncCheck();
  }
  if (checkBtn) checkBtn.onclick = check;
  // A typed answer: right, it counts as a click on the item's area; wrong, as a wrong click.
  const typedForm = $('typedForm');
  if (typedForm) typedForm.addEventListener('submit', e => {
    e.preventDefault();
    const K = KINDS[G.kind], id = G.queue[G.i];
    // An answer from a list is the name marked in it, however it was sent (Enter, OK, a phone's Go): what is typed
    // only narrows the list, it is never compared letter by letter.
    // (with nothing typed and no name marked by the arrow keys, a stray Enter answers nothing)
    const text = K.choices ? ($('typed').value.trim() || steered ? listed[marked] || '' : '') : $('typed').value.trim();
    if (view !== 'play' || !K.typed || id === undefined || !text) return;
    if (K.typed(id, text)) answer(K.areas[id][0]);
    else { wrong(text); if (K.choices) { $('typed').value = ''; marked = 0; syncList(); } else $('typed').select(); }
  });
  // An answer picked from a list (K.choices): what is typed narrows it, Enter or a click takes the one marked.
  const typedList = $('typedList'), plainOf = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const listBtn = $('typedListBtn');
  let listed = [], marked = 0, steered = false; // steered: a name marked with the arrow keys
  let listMin = !!STORE.settings().listMin; // the list folded away: only the name marked shows, once there is one
  function syncList() {
    if (!typedList) return;
    const K = KINDS[G.kind];
    if (listBtn) listBtn.hidden = !K || !K.typed || !K.choices;
    if (!K || !K.typed || !K.choices) { typedList.hidden = true; return; }
    const q = plainOf($('typed').value.trim()), all = K.choices(), seen = new Set();
    const tiers = !q ? [all] : [all.filter(n => plainOf(n).startsWith(q)), all.filter(n => plainOf(n).split(/[\s,.-]+/).some(w => w.startsWith(q))), all.filter(n => plainOf(n).includes(q))];
    listed = tiers.flat().filter(n => !seen.has(n) && seen.add(n));
    marked = Math.max(0, Math.min(marked, listed.length - 1));
    const shown = !listMin ? listed.map((n, i) => [n, i]) : (q || steered) && listed.length ? [[listed[marked], marked]] : [];
    typedList.replaceChildren(...shown.map(([n, i]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'opt' + (i === marked ? ' on' : ''); b.textContent = n;
      b.setAttribute('role', 'option'); b.setAttribute('aria-selected', i === marked);
      b.onclick = () => fillChoice(n);
      b.ondblclick = () => { fillChoice(n); typedForm.requestSubmit(); };
      return b;
    }));
    typedList.hidden = listMin && !shown.length;
    if (listBtn) {
      listBtn.setAttribute('aria-expanded', !listMin);
      listBtn.title = listMin ? 'Show the list' : 'Hide the list'; listBtn.setAttribute('aria-label', listBtn.title);
    }
  }
  // A name clicked in the list: in the field, and marked, ready to be answered with (Enter or OK).
  function fillChoice(n) {
    $('typed').value = n; marked = 0; steered = true; syncList();
    marked = Math.max(0, listed.indexOf(n)); syncList();
    $('typed').focus({ preventScroll: true });
  }
  if (typedList) {
    $('typed').addEventListener('input', () => { marked = 0; steered = false; syncList(); });
    $('typed').addEventListener('keydown', e => {
      const K = KINDS[G.kind];
      if (!K || !K.choices || !listed.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); marked = (marked + (e.key === 'ArrowDown' ? 1 : -1) + listed.length) % listed.length; steered = true; syncList();
        typedList.querySelector('.on')?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') { e.preventDefault(); typedForm.requestSubmit(); }
    });
  }
  if (listBtn) listBtn.onclick = () => {
    listMin = !listMin;
    STORE.setSettings(s => { if (listMin) s.listMin = true; else delete s.listMin; });
    syncList();
    typedList.querySelector('.on')?.scrollIntoView({ block: 'nearest' });
    $('typed').focus({ preventScroll: true });
  };
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
            p.classList.toggle('rare', !!(K.rare && K.rare(target, area)));
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
      if (K.fresh) fresh();
      for (const p of pathsOf(K.areas[target])) { p.classList.remove('ans', 'flash', 'found', 'pick', ...RESULT_CLASS); p.classList.add(k); }
      if (K.rare) K.areas[target].forEach((a, i) => pathsOf(K.areas[target])[i].classList.toggle('rare', !!K.rare(target, a)));
      if (K.fresh) fresh(FRESH_MS);
      showLabel(G.kind, target);
      const tick = $('ticks').children[G.i]; tick.classList.remove('now'); tick.classList.add(k);
      G.res.push(G.tries);
      if (G.tries === 0) { G.score++; G.streak++; G.best = Math.max(G.best, G.streak); } else G.streak = 0;
      const title = G.revealed ? told(K, target) : `✓ ${told(K, target)}` + (G.tries ? ` · try ${G.tries + 1}` : '');
      setFeedback($('fb'), G.tries === 0 ? 'ok' : 'bad', title, K.about(target));
      if (K.photo) $('fb').prepend(thumb(K.photo(target)));
      if (K.pin) showPin(K.pin(target));
      say(target);
      if (RV) RV.answered(target, G.tries === 0);
      G.i++;
      if (G.i >= G.queue.length) finish(); else ask();
      return;
    }
    if (K.flashArea || K.labelPerArea) flashArea(area);
    else { const clicked = K.primary(area); if (clicked) flash(G.kind, clicked); }
    wrong(K.clicked(area, target));
  }
  // A wrong answer, `what` being what was clicked or typed: a try less, and after the last one the answer is shown.
  function wrong(what) {
    const K = KINDS[G.kind], target = G.queue[G.i];
    if (G.revealed) {
      setFeedback($('fb'), 'bad', `✗ ${what}`, `→ ${told(K, target)}`);
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
      setFeedback($('fb'), 'bad', `✗ ${what}`, `→ ${told(K, target)}`);
    }
  }
  /* ---------- how a flag is seen (a kind's looks: flag pictures) ----------
     Flat as it is, Waving on its pole in the wind, Hanging limp from it, or Mixed (one of the three for each
     picture): a still picture drawn anew for each question, its waves and folds at random, the flag cut into thin
     strips that are moved, narrowed and shaded, in front of a sky and its pole. Only how the picture is shown: cards
     and results are the same in every look. A switch under the picture while playing; kept for the page. */
  const LOOKS = [['flat', 'Flat'], ['waving', 'Waving'], ['hanging', 'Hanging'], ['mixed', 'Mixed']];
  let flagLook = LOOKS.some(([l]) => l === load('look')) ? load('look') : 'flat';
  // picture -> a canvas of it to cut strips from: drawn whole first (Firefox cuts an SVG's parts wrongly), an SVG at the
  // size of its viewBox (it has no other), and a photo of a flag without the even margin around it (a letterbox).
  const sources = new Map();
  function source(src) {
    if (!sources.has(src)) sources.set(src, (async () => {
      const svg = /\.svg(\?|$)/.test(src);
      let url = src;
      if (svg) {
        const text = await (await fetch(src)).text(), vb = text.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
        url = URL.createObjectURL(new Blob([/<svg[^>]*\swidth=/.test(text) || !vb ? text : text.replace('<svg', `<svg width="${vb[1]}" height="${vb[2]}"`)], { type: 'image/svg+xml' }));
      }
      const img = new Image(); img.src = url; await img.decode();
      const w = img.naturalWidth || 640, h = img.naturalHeight || 480, cv = document.createElement('canvas');
      cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h);
      return svg ? cv : trimmed(cv);
    })());
    return sources.get(src);
  }
  // A picture without the margin of one even color all around it, where it has one (a flag drawn into a larger frame).
  function trimmed(cv) {
    const w = cv.width, h = cv.height, d = cv.getContext('2d').getImageData(0, 0, w, h).data;
    const same = (x, y) => { const i = (y * w + x) * 4; return Math.abs(d[i] - d[0]) + Math.abs(d[i + 1] - d[1]) + Math.abs(d[i + 2] - d[2]) < 30; };
    const row = y => { for (let x = 0; x < w; x++) if (!same(x, y)) return false; return true; };
    const col = x => { for (let y = 0; y < h; y++) if (!same(x, y)) return false; return true; };
    if (!(row(0) && row(h - 1) && col(0) && col(w - 1))) return cv;
    let t = 0, b = h - 1, l = 0, r = w - 1;
    while (t < h / 3 && row(t)) t++; while (b > h * 2 / 3 && row(b)) b--; while (l < w / 3 && col(l)) l++; while (r > w * 2 / 3 && col(r)) r--;
    const out = document.createElement('canvas'); out.width = r - l + 1; out.height = b - t + 1;
    out.getContext('2d').drawImage(cv, l, t, out.width, out.height, 0, 0, out.width, out.height);
    return out;
  }
  // A flag as cloth, by physics: the model of three.js's former cloth example (Verlet integration, distance constraints
  // between neighbouring points of a grid, pinned points, gravity, a gusting wind). The edge at the pole is pinned along
  // it; the cloth is let go and simulated until it settles (no wind: it hangs) or for a while in the wind (it waves),
  // then seen from a little below at an angle around the pole, lit by the sun and the sky, and drawn as triangles of the
  // flag picture, the far ones first, its light and shade softened over it. Self-contained, as it also runs in a worker:
  // pic a canvas or bitmap of the flag, W and H the picture's size, small for a pairs tile, make(w, h) a canvas.
  function clothDraw(pic, look, W, H, make) {
    const r = Math.random, small = W < 400, nw = pic.width, nh = pic.height;
    const NX = small ? 16 : 22, NY = Math.max(small ? 6 : 8, Math.round(NX * nh / nw)), N = NX * NY;
    const X = new Float64Array(N * 3), O = new Float64Array(N * 3), pinned = new Uint8Array(N), id = (i, j) => j * NX + i;
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const k = id(i, j) * 3; X[k] = i; X[k + 1] = -j; X[k + 2] = (r() - 0.5) * 0.01; if (i === 0) pinned[id(i, j)] = 1; }
    O.set(X);
    const CA = [], CB = [], CR = [], CK = [];
    const link = (a, b, k) => { CA.push(a); CB.push(b); CR.push(Math.hypot(X[a * 3] - X[b * 3], X[a * 3 + 1] - X[b * 3 + 1], X[a * 3 + 2] - X[b * 3 + 2])); CK.push(k); };
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      if (i + 1 < NX) link(id(i, j), id(i + 1, j), 1);
      if (j + 1 < NY) link(id(i, j), id(i, j + 1), 1);
      if (i + 1 < NX && j + 1 < NY) { link(id(i, j), id(i + 1, j + 1), 1); link(id(i + 1, j), id(i, j + 1), 1); }
      if (i + 2 < NX) link(id(i, j), id(i + 2, j), 0.15); // (a little stiffness against bending)
      if (j + 2 < NY) link(id(i, j), id(i, j + 2), 0.15);
    }
    const waving = look === 'waving', wind = waving ? 80 + r() * 60 : 0, steps = waving ? 220 : 260, dt2 = 0.016 * 0.016;
    const g = -9.8 * (waving ? 6 : 12), damp = waving ? 0.985 : 0.965, poleR = 0.25, gust = r() * 100, M = CA.length; // (no wind: settles sooner)
    for (let s = 0; s < steps; s++) {
      const t = s * 0.016 + gust;
      for (let k = 0; k < N; k++) {
        if (pinned[k]) continue;
        const i = k % NX, j = (k / NX) | 0, b = k * 3;
        let fx = 0, fz = 0;
        if (wind) { const w = wind * (0.75 + 0.25 * Math.sin(t * 1.3 + i * 0.25) + 0.15 * Math.sin(t * 3.1 + j * 0.4)); fx = w; fz = w * 0.35 * Math.sin(t * 2 + i * 0.5 + j * 0.3); }
        for (let q = 0; q < 3; q++) { const x = X[b + q], v = (x - O[b + q]) * damp; O[b + q] = x; X[b + q] = x + v + (q === 0 ? fx : q === 1 ? g : fz) * dt2; }
      }
      for (let it = 0; it < 4; it++) {
        for (let c = 0; c < M; c++) {
          const a = CA[c] * 3, b = CB[c] * 3, dx = X[b] - X[a], dy = X[b + 1] - X[a + 1], dz = X[b + 2] - X[a + 2];
          const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6, f = (len - CR[c]) / len * 0.5 * CK[c];
          if (!pinned[CA[c]]) { X[a] += dx * f; X[a + 1] += dy * f; X[a + 2] += dz * f; }
          if (!pinned[CB[c]]) { X[b] -= dx * f; X[b + 1] -= dy * f; X[b + 2] -= dz * f; }
        }
        for (let k = 0; k < N; k++) { if (pinned[k]) continue; const b = k * 3, h = Math.hypot(X[b], X[b + 2]); if (h < poleR) { const m = poleR / (h || 1e-6); X[b] *= m; X[b + 2] *= m; } }
      }
    }
    // the view: from a little below, at an angle around the pole
    const yaw = (r() - 0.5) * 1.6, pitch = 0.12 + r() * 0.15, light = [0.45, 0.65, 0.6];
    const cam = (x, y, z) => { const x1 = x * Math.cos(yaw) - z * Math.sin(yaw), z1 = x * Math.sin(yaw) + z * Math.cos(yaw); return [x1, y * Math.cos(pitch) - z1 * Math.sin(pitch), y * Math.sin(pitch) + z1 * Math.cos(pitch)]; };
    const V = []; for (let k = 0; k < N; k++) V.push(cam(X[k * 3], X[k * 3 + 1], X[k * 3 + 2]));
    const poleTop = cam(0, 1.2, 0), poleBot = cam(0, -NY * 3.5, 0);
    let minX = poleTop[0], maxX = poleTop[0], minY = poleTop[1], maxY = poleTop[1];
    for (const v of V) { minX = Math.min(minX, v[0]); maxX = Math.max(maxX, v[0]); minY = Math.min(minY, v[1]); maxY = Math.max(maxY, v[1]); }
    const sc = Math.min(W * 0.8 / (maxX - minX || 1), H * 0.82 / (maxY - minY || 1)), ox = W / 2 - (minX + maxX) / 2 * sc, oy = H * 0.08 + maxY * sc;
    const scr = v => [ox + v[0] * sc, oy - v[1] * sc];
    const cv = make(W, H), ctx = cv.getContext('2d');
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#b4c9da'); sky.addColorStop(1, '#e6ecf0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    const [tx, ty] = scr(poleTop), by = scr(poleBot)[1], pw = Math.max(small ? 3 : 4, sc * poleR * 1.6);
    const pole = ctx.createLinearGradient(tx - pw / 2, 0, tx + pw / 2, 0); pole.addColorStop(0, '#5f666c'); pole.addColorStop(0.5, '#d6dade'); pole.addColorStop(1, '#5a6166');
    const drawPole = c => { c.fillStyle = pole; c.fillRect(tx - pw / 2, ty, pw, Math.max(by, H) - ty); c.fillStyle = '#8e969b'; c.beginPath(); c.arc(tx, ty, pw * 0.8, 0, 2 * Math.PI); c.fill(); };
    // the flag smaller (cheaper to cut from); the cloth on a layer of its own, and its light on another
    const k0 = Math.min(1, (small ? 200 : 360) / nw), src = make(Math.round(nw * k0), Math.round(nh * k0));
    src.getContext('2d').drawImage(pic, 0, 0, src.width, src.height);
    const layer = make(W, H), lc = layer.getContext('2d'), shade = make(W, H), sh = shade.getContext('2d');
    // each point's light: from the tilt of the cloth around it (either side lit alike), sun and sky
    const lightAt = new Float64Array(N), P = k => [X[k * 3], X[k * 3 + 1], X[k * 3 + 2]];
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const e = P(id(Math.min(NX - 1, i + 1), j)), w = P(id(Math.max(0, i - 1), j)), n = P(id(i, Math.max(0, j - 1))), so = P(id(i, Math.min(NY - 1, j + 1)));
      const u = [e[0] - w[0], e[1] - w[1], e[2] - w[2]], v = [so[0] - n[0], so[1] - n[1], so[2] - n[2]];
      const nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0], nl = Math.hypot(nx, ny, nz) || 1;
      lightAt[id(i, j)] = 0.42 + 0.68 * Math.abs((nx * light[0] + ny * light[1] + nz * light[2]) / nl);
    }
    const tris = [];
    for (let j = 0; j + 1 < NY; j++) for (let i = 0; i + 1 < NX; i++) {
      const a = id(i, j), b = id(i + 1, j), c = id(i + 1, j + 1), d = id(i, j + 1);
      const su = i / (NX - 1) * src.width, sv = j / (NY - 1) * src.height, su2 = (i + 1) / (NX - 1) * src.width, sv2 = (j + 1) / (NY - 1) * src.height;
      tris.push([[a, b, c], [[su, sv], [su2, sv], [su2, sv2]]], [[a, c, d], [[su, sv], [su2, sv2], [su, sv2]]]);
    }
    const depth = t => (V[t[0][0]][2] + V[t[0][1]][2] + V[t[0][2]][2]) / 3;
    tris.sort((x, y) => depth(x) - depth(y));
    let poleDrawn = false;
    for (const t of tris) {
      if (!poleDrawn && depth(t) > 0) { drawPole(lc); poleDrawn = true; }
      const d = t[0].map(q => scr(V[q])), s = t[1];
      const cx = (d[0][0] + d[1][0] + d[2][0]) / 3, cy = (d[0][1] + d[1][1] + d[2][1]) / 3;
      const gg = d.map(([x, y]) => { const dx = x - cx, dy = y - cy, m = Math.hypot(dx, dy) || 1; return [x + dx / m * 0.7, y + dy / m * 0.7]; }); // (a little larger: no seams)
      const [[x0, y0], [x1, y1], [x2, y2]] = s, [[X0, Y0], [X1, Y1], [X2, Y2]] = d;
      const den = x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1); if (!den) continue;
      const ma = (X0 * (y1 - y2) + X1 * (y2 - y0) + X2 * (y0 - y1)) / den, mc = (X0 * (x2 - x1) + X1 * (x0 - x2) + X2 * (x1 - x0)) / den;
      const me = (X0 * (x1 * y2 - x2 * y1) + X1 * (x2 * y0 - x0 * y2) + X2 * (x0 * y1 - x1 * y0)) / den;
      const mb = (Y0 * (y1 - y2) + Y1 * (y2 - y0) + Y2 * (y0 - y1)) / den, md = (Y0 * (x2 - x1) + Y1 * (x0 - x2) + Y2 * (x1 - x0)) / den;
      const mf = (Y0 * (x1 * y2 - x2 * y1) + Y1 * (x2 * y0 - x0 * y2) + Y2 * (x0 * y1 - x1 * y0)) / den;
      lc.save(); lc.beginPath(); lc.moveTo(gg[0][0], gg[0][1]); lc.lineTo(gg[1][0], gg[1][1]); lc.lineTo(gg[2][0], gg[2][1]); lc.closePath(); lc.clip();
      lc.setTransform(ma, mb, mc, md, me, mf); lc.drawImage(src, 0, 0); lc.restore();
      // its light as a grey: 128 leaves the cloth as it is, darker shades it, lighter lights it
      const gv = Math.round(Math.max(0, Math.min(255, (lightAt[t[0][0]] + lightAt[t[0][1]] + lightAt[t[0][2]]) / 3 * 128)));
      sh.fillStyle = 'rgb(' + gv + ',' + gv + ',' + gv + ')'; sh.beginPath(); sh.moveTo(gg[0][0], gg[0][1]); sh.lineTo(gg[1][0], gg[1][1]); sh.lineTo(gg[2][0], gg[2][1]); sh.closePath(); sh.fill();
    }
    if (!poleDrawn) drawPole(lc);
    // the light softened (drawn small and back up), kept to the cloth, laid over it as an overlay
    const tiny = make(Math.max(1, W >> 2), Math.max(1, H >> 2)), soft = make(W, H), so = soft.getContext('2d');
    tiny.getContext('2d').drawImage(shade, 0, 0, tiny.width, tiny.height);
    so.imageSmoothingEnabled = true; so.drawImage(tiny, 0, 0, W, H);
    so.globalCompositeOperation = 'destination-in'; so.drawImage(shade, 0, 0);
    lc.globalCompositeOperation = 'overlay'; lc.drawImage(soft, 0, 0); lc.globalCompositeOperation = 'source-over';
    ctx.drawImage(layer, 0, 0);
    return cv;
  }
  // The cloth is worked out away from the page, in a worker (on a slow phone it takes a moment, which must not stop the
  // page), where the browser has one; else on the page itself.
  let clothWorker = null, clothJobs = 0;
  const clothWaiting = new Map();
  function clothPicture(pic, look, W, H) {
    if (clothWorker === null) {
      try {
        if (typeof OffscreenCanvas !== 'function') throw new Error('no OffscreenCanvas');
        const code = `const clothDraw = ${clothDraw.toString()};\nonmessage = async e => { const { id, pic, look, W, H } = e.data; try { const cv = clothDraw(pic, look, W, H, (w, h) => new OffscreenCanvas(w, h)); postMessage({ id, blob: await cv.convertToBlob({ type: 'image/jpeg', quality: 0.88 }) }); } catch (err) { postMessage({ id, error: String(err) }); } };`;
        clothWorker = new Worker(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
        clothWorker.onmessage = e => { const w = clothWaiting.get(e.data.id); clothWaiting.delete(e.data.id); if (w) { if (e.data.error) w.reject(new Error(e.data.error)); else w.resolve(URL.createObjectURL(e.data.blob)); } };
      } catch (err) { clothWorker = false; }
    }
    if (!clothWorker) {
      const cv = clothDraw(pic, look, W, H, (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; });
      return Promise.resolve(cv.toDataURL('image/jpeg', 0.88));
    }
    return createImageBitmap(pic).then(bitmap => new Promise((resolve, reject) => {
      const id = ++clothJobs; clothWaiting.set(id, { resolve, reject });
      clothWorker.postMessage({ id, pic: bitmap, look, W, H }, [bitmap]);
    }));
  }
  async function dressFlag(src, look, small = false) {
    if (look === 'mixed') look = ['flat', 'waving', 'hanging'][Math.random() * 3 | 0];
    if (look === 'flat') return src;
    return clothPicture(await source(src), look, small ? 320 : 640, small ? 200 : 400);
  }
  // A flag drawn ahead (the next question's), taken when it is asked; drawn anew each time it is asked again.
  const drawnAhead = new Map();
  function dressAhead(src) {
    if (flagLook === 'flat' || drawnAhead.has(src)) return;
    const look = flagLook, job = dressFlag(src, look).catch(() => src);
    drawnAhead.set(src, { look, job });
  }
  function dressed(src) {
    const a = drawnAhead.get(src); drawnAhead.delete(src);
    return a && a.look === flagLook ? a.job : dressFlag(src, flagLook).catch(() => src);
  }
  // A picture into an img, in the look picked (flat at once, else once drawn); the last one asked for wins.
  function dressInto(im, K, small = false) {
    const src = im.dataset.src, token = (im.dataset.token = String(+(im.dataset.token || 0) + 1));
    const put = url => { if (im.src.startsWith('blob:') && im.src !== url) URL.revokeObjectURL(im.src); im.src = url; im.style.visibility = ''; }; // (a drawing replaced is let go)
    if (!K.looks || flagLook === 'flat') { put(src); return Promise.resolve(src); }
    im.style.visibility = 'hidden';
    return (small ? dressFlag(src, flagLook, true).catch(() => src) : dressed(src)).then(url => { if (im.dataset.token === token) put(url); return url; });
  }
  function showPicture(p) {
    const im = $('photoImg'); im.dataset.src = p.src; G.shownSrc = p.src;
    dressInto(im, KINDS[G.kind]).then(url => { if (im.dataset.src === p.src) G.shownSrc = url; });
  }
  const looksEl = document.createElement('div');
  looksEl.className = 'looks'; looksEl.hidden = true; looksEl.setAttribute('role', 'group'); looksEl.setAttribute('aria-label', 'Look');
  looksEl.append(...LOOKS.map(([l, t]) => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.look = l; b.textContent = t;
    b.onclick = () => {
      flagLook = l; store('look', l); syncLooks();
      // the picture on screen drawn again in it (or the board's)
      if (KINDS[G.kind].pairs) for (const im of pairsEl.querySelectorAll('img[data-src]')) dressInto(im, KINDS[G.kind], true);
      else if (KINDS[G.kind].photo && G.queue[G.i] !== undefined) showPicture(KINDS[G.kind].photo(G.queue[G.i]));
    };
    return b;
  }));
  $('photo').after(looksEl);
  function syncLooks() {
    looksEl.hidden = !(view === 'play' && KINDS[G.kind] && KINDS[G.kind].looks);
    for (const b of looksEl.children) b.setAttribute('aria-pressed', b.dataset.look === flagLook);
  }

  /* ---------- picks (MODES 'pick', 'pickback'): four to pick from, under the question ---------- */
  const picksEl = document.createElement('div');
  picksEl.className = 'picks'; picksEl.hidden = true; $('dial').after(picksEl);
  function syncPicks(id) {
    const K = KINDS[G.kind];
    picksEl.hidden = !K || !K.choose4 || id == null;
    if (picksEl.hidden) { picksEl.replaceChildren(); return; }
    const back = K.choose4 === 'pickback', word = x => (back ? askText(K, x) : K.answerName(x)), right = word(id);
    const others = list => shuffle([...new Set(list.filter(x => x !== id).map(word))].filter(t => t !== right));
    let pool = others(G.items); if (pool.length < 3) pool = [...new Set([...pool, ...others(K.ids)])];
    picksEl.replaceChildren(...shuffle([right, ...pool.slice(0, 3)]).map(t => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      if (back && K.prompt === 'text' && K.text(id).lang) b.lang = K.text(id).lang;
      b.onclick = () => {
        if (view !== 'play' || b.disabled) return;
        if (t === right) { answer(K.areas[id][0]); return; }
        if (G.revealed) return; // (the answer shown: only it goes on)
        b.disabled = true; b.classList.add('no');
        wrong(t);
        if (G.revealed) for (const o of picksEl.children) o.classList.toggle('ans', o.textContent === right);
      };
      return b;
    }));
  }

  /* ---------- pairs (MODES): questions and names on a board over the map, matched one pair after another ---------- */
  // (one grid of two columns, questions left and names right, row by row: a row is as high as its taller tile)
  const pairsEl = document.createElement('div');
  pairsEl.className = 'pairs'; pairsEl.hidden = true; $('stage').append(pairsEl);
  // A question as it stands on its tile: its picture, its text in its script, its name or its code.
  function pairsAsk(K, id) {
    if (K.prompt === 'photo') { const p = K.photo(id), im = document.createElement('img'); im.alt = p.alt || ''; im.dataset.look = p.cls || ''; im.dataset.src = p.src; dressInto(im, K, true); return im; }
    const s = document.createElement('span');
    s.textContent = askText(K, id); if (K.prompt === 'text' && K.text(id).lang) s.lang = K.text(id).lang;
    return s;
  }
  function pairsStart() {
    G.next = 0; G.left = 0;
    for (const id of ['dial', 'bigname', 'card', 'photo']) if ($(id)) $(id).hidden = true;
    if (typedForm) typedForm.hidden = true;
    syncList(); syncPicks(null); syncLooks(); $('ask').replaceChildren();
    pairsBoard();
  }
  // The next board: the next PAIRS questions of the queue (each tile knows its place in it), both sides shuffled.
  function pairsBoard() {
    const K = KINDS[G.kind], from = G.next, upto = Math.min(G.queue.length, from + PAIRS), places = [];
    for (let i = from; i < upto; i++) places.push(i);
    G.next = upto; G.left = places.length; G.sel = null; G.wrongs = new Map();
    const tile = (i, side) => {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.i = i; b.dataset.side = side;
      if (side === 'q') b.append(pairsAsk(K, G.queue[i])); else b.textContent = K.answerName(G.queue[i]);
      b.onclick = () => pairsPick(b);
      return b;
    };
    const qs = shuffle(places).map(i => tile(i, 'q')), as = shuffle(places).map(i => tile(i, 'a'));
    pairsEl.replaceChildren(...qs.flatMap((q, n) => [q, as[n]]));
    pairsEl.scrollTop = 0;
    G.i = from; pairsStats();
    if (RV) RV.asked();
  }
  function pairsStats() {
    $('sQ').textContent = `${G.res.filter(t => t !== undefined).length}/${G.queue.length}`;
    $('sScore').textContent = G.score; $('sStreak').textContent = G.streak;
  }
  // A tile picked: the first of a pair is marked; the second, from the other side, matches it or not. A name that two
  // questions share matches either.
  function pairsPick(b) {
    if (b.disabled || view !== 'play') return;
    if (!G.sel || G.sel.dataset.side === b.dataset.side) { if (G.sel) G.sel.classList.remove('sel'); G.sel = b; b.classList.add('sel'); return; }
    const first = G.sel; G.sel = null; first.classList.remove('sel');
    const K = KINDS[G.kind], q = first.dataset.side === 'q' ? first : b, a = q === first ? b : first;
    const qi = +q.dataset.i, ai = +a.dataset.i, target = G.queue[qi];
    if (K.answerName(target) !== K.answerName(G.queue[ai])) {
      for (const t of [q, a]) { t.classList.add('no'); setTimeout(() => t.classList.remove('no'), 600); }
      for (const i of [qi, ai]) G.wrongs.set(i, (G.wrongs.get(i) || 0) + 1);
      G.streak = 0; $('sStreak').textContent = 0;
      setFeedback($('fb'), 'bad', `✗ ${K.answerName(G.queue[ai])}`, '');
      return;
    }
    const tries = Math.min(G.wrongs.get(qi) || 0, MAX_TRIES);
    for (const t of [q, a]) { t.disabled = true; t.classList.add(RESULT_CLASS[tries]); }
    pairsSettle(qi, tries);
    if (--G.left === 0) { if (G.next < G.queue.length) setTimeout(pairsBoard, 450); else G.ending = setTimeout(finish, 450); }
    else if (RV) { G.i = qi; RV.asked(); } // (a review's clock: from one pair to the next)
  }
  // A question matched, as answer() takes one on the map: its areas colored by its tries, its result, what is said.
  function pairsSettle(qi, tries) {
    const K = KINDS[G.kind], target = G.queue[qi];
    G.i = qi; G.tries = tries;
    if (G.review) G.tries = RV.grade(tries > 0);
    const k = RESULT_CLASS[G.tries];
    for (const p of pathsOf(K.areas[target])) { p.classList.remove('ans', 'flash', 'found', 'pick', ...RESULT_CLASS); p.classList.add(k); }
    showLabel(G.kind, target);
    const tick = $('ticks').children[qi]; if (tick) tick.classList.add(k);
    G.res[qi] = G.tries;
    if (G.tries === 0) { G.score++; G.streak++; G.best = Math.max(G.best, G.streak); } else G.streak = 0;
    setFeedback($('fb'), G.tries === 0 ? 'ok' : 'bad', `${G.tries === 0 ? '✓ ' : ''}${told(K, target)}`, K.about(target));
    if (K.photo) $('fb').prepend(thumb(K.photo(target)));
    say(target);
    pairsStats();
    if (RV) RV.answered(target, G.tries === 0);
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
    clearInterval(timer); clearTimeout(G.ending); const ms = performance.now() - G.t0; const n = G.res.filter(t => t !== undefined).length; // (pairs: in any order)
    const K = KINDS[G.kind];
    mark(null); showAsked(null);
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
    if (legendItems[0]) legendItems[0].parentNode.hidden = !!(K.fresh || K.pickAll);
    $('rLine').textContent = line;
    const missed = G.queue.map((id, i) => [id, G.res[i]]).filter(([, t]) => t > 0)
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
  // (a code of many letters is set smaller, on the pages that say how: `long`)
  const showCode = code => { $('eCode').textContent = code; $('eDial').classList.toggle('multi', code.includes(',')); $('eDial').classList.toggle('long', code.length > 14); };
  function explore(area) {
    for (const p of pathsOf(AREAS)) p.classList.remove('sel', ...(ePick ? ['rare'] : []));
    if (ePick) ePick.value = '';
    pathsOf([area])[0].classList.add('sel'); mark([area]);
    if (plain()) { clearLabels(); for (const id of KINDS[Q.exploreKind].at[area] || []) showLabel(Q.exploreKind, id); }
    const info = Q.explore(area);
    showCode(info.code);
    setFeedback($('eInfo'), '', info.title, info.sub);
    if (info.photos) { const g = document.createElement('div'); g.className = 'gallery'; g.append(...info.photos.map(thumb)); $('eInfo').append(g); }
  }
  // Q.exploreList: one of the list, picked beside Back: all its areas are lit at once.
  const ePick = Q.exploreList ? document.createElement('select') : null;
  if (ePick) {
    ePick.id = 'ePick'; ePick.setAttribute('aria-label', Q.exploreList.label);
    ePick.append(new Option(Q.exploreList.label, ''), ...Q.exploreList.items.map((it, i) => new Option(it.label, i)));
    ePick.onchange = () => {
      const it = Q.exploreList.items[ePick.value], rare = new Set(it ? it.rare : []);
      for (const p of pathsOf(AREAS)) p.classList.remove('sel', 'rare');
      for (const a of it ? it.areas : []) { const p = pathsOf([a])[0]; p.classList.add('sel'); p.classList.toggle('rare', rare.has(a)); }
      mark(it ? it.areas : null);
      showCode(it ? it.code : '--'); setFeedback($('eInfo'), '', it ? it.title : '', it ? it.sub : '');
    };
    $('eBack').after(ePick);
  }

  /* ---------- buttons & keys ---------- */
  $('startBtn').onclick = () => { const cur = current(); if (cur.ids.length) start(playKind(cur.kind), cur.ids, { box: cur.box }); };
  $('exploreBtn').onclick = () => {
    useMap(chosenMap); clearMap(); show('explore');
    if (!plain()) showAllLabels(Q.exploreKind);
    showCode('--'); if (ePick) ePick.value = '';
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
    // 1–4 pick one of four (choose4)
    if (/^[1-4]$/.test(e.key) && view === 'play' && KINDS[G.kind].choose4) { const o = picksEl.children[+e.key - 1]; if (o && !o.disabled) o.click(); return; }
    // Enter checks the picks (pickAll); on a button, the button's own Enter does
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && view === 'play' && KINDS[G.kind].pickAll) { e.preventDefault(); check(); return; }
    const zoomIn = e.key === '+' || e.key === '=', zoomOut = e.key === '-', reset = e.key === '0';
    if (zoomIn) zoomCenter(1.4); else if (zoomOut) zoomCenter(1 / 1.4); else if (reset) frameRound(true);
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
        $, Q, G, KINDS, PAGE: PAGE_ID, ROOT, RESULT_CLASS, shuffle, fmt, start, told, markOut, mark, pathsOf, showLabel, setFeedback, needAll, flyTo, onStreet, showAnswer,
        free: () => mapStyle === 'free', home: () => resetView(),
        reviewModes, played: () => ({ m: mapStyle, ...(shownBack !== 'quiz' ? { b: shownBack } : {}) }), // how the round on screen is played
        maps: () => (FREE ? [] : MAPS.map(m => m[0])), backs: () => BACKS.map(b => b[0]), // what the review's map picker offers
      });
    });
  }

  openSetup();
  requestAnimationFrame(frameRound);
})();
