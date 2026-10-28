// Shared engine for "click the right area" map quizzes. The page itself (panel and map) comes from ./quiz-page.js.
//
// A quiz page defines a global QUIZ config before loading this file:
//   key          the quiz's short name. What a page keeps in the browser is in the record of the page (its folder
//                name, see assets/js/store.js); the short name is how it was kept before, and what moves it over
//   areas        [{ id, d, lx, ly, a, g }]  SVG path, label point, size and hint-color group of each map area
//                (lx/ly/a may be left out: they're then computed from the path); top: true draws the area above
//                its neighbours with its own border (e.g. a tiny city enlarged so it can be seen); dot: true draws
//                it (a zero-length path "Mx,yl0,0") as a dot that keeps its size on screen (Monaco on a world map);
//                w: a city quiz's dot of a size on the ground instead, its width in map units (city-config.js, dotKm)
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
//   learn        optional { title, sub, sections: [{ title, sub, areas, photos }] } (or a function returning it): a
//                Learn button beside Explore opens a sheet of everything to learn, one card per section: a small map
//                of the whole with its areas lit, its title and lines (sub: a line or several), its pictures
//   exploreList  optional { label, items: [{ label, areas, rare, code, title, sub }] }: Explore also shows one of a
//                list at a time, picked beside Back (a language: the tiles of its letters lit, the `rare` ones of
//                them in the color of rare answers)
//   context      optional SVG path drawn under the areas (neighbouring countries), not clickable
//   base, dots   city quizzes: base { land, lines } draws the country and its region borders under the areas;
//                dots: true draws each area (a zero-length path "Mx,yl0,0") as a dot that keeps its size on
//                screen at every zoom, with its label above it (see shared/city-config.js)
//   geo/street   leave out to offer the quiz map only (no street map, no overlay: the street map with the quiz
//                map's outlines and colors on it, no bare map: the street map without any borders, and no
//                satellite map)
//   free         city quizzes: { span, measure(point, id) -> [km shown, km scored] } also offers playing on the map
//                itself: the dots stay hidden, a click anywhere answers, and points fall with the distance to the
//                city (GeoGuessr's 5000 · e^(−10 · d / D), D = span, the map's diagonal in km)
//   single       a page of one round only (city-config.js, CITY_OPTS.single): the setup screen is its Start, with
//                no rounds, Explore, My stats or map pickers; every start (Restart, Again) draws the round anew
//                (single.draw(), asked in that order), on the map by distance on the background the page names
//                (back), scored by single.points, each question with its tag (single.tag). No review cards, no best
//   streets      city quizzes: the cities.js the map is drawn from (its projection, land and insets). Offers the street
//                map behind the quiz map, with the region borders on it (overlay), alone, or bare (without its own
//                borders either), or the satellite map instead: ./map-tiles.js
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
//   langsAlways  (no longer followed, 2026-10-21: a round box shows its languages only once it is the round picked,
//                as its other switches)
//   langLabel    'Country': the languages are chosen once for the whole list, in a row of their own above the
//                rounds under this heading, instead of in each round's box (the countries of a script's words: a
//                choice a player has to see). A round with nothing in the language chosen is left out.
//
// One config can serve several pages: <body data-kinds="states" data-key="dddstates"> keeps only the listed
// kinds; each page keeps its own scores (data-key: its short name, see `key`), e.g. an area-code quiz and a states
// quiz on the same map.
//
// Besides the rounds, players can pick their own items ("Custom quiz"), save them under a name (localStorage)
// and share them as a link: ?quiz=<kind>.<bits>&name=…, one bit per item of the kind, in the kind's order. The review
// page's Practice opens a round of given items at once: ?practice=<kind>&items=<ids>&mode=…&map=…&back=… (see "practice").
//
// Every answer goes into the answer log (assets/js/answers.js, see "the answer log" below); My stats beside Explore
// shows it on the map (./area-stats.js).
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
  // The map is drawn by WebGL (gl-map.js, with earcut.js), both asked for at once, side by side; the SVG map shows
  // until its first picture is there (see glm below), and stays where WebGL 2 is missing or the address asks for it
  // (?svg=1, to compare).
  const GL_LOAD = !new URLSearchParams(location.search).has('svg') ? Promise.all(['earcut.js', 'gl-map.js'].map(src => new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = HERE + src; s.onload = ok; s.onerror = no; document.head.append(s);
  }))) : null;
  const MAX_TRIES = 3;
  const RESULT_CLASS = ['got', 't2', 't3', 'miss']; // index = wrong clicks before the right one
  const FRESH_MS = 700; // how long an answer's color stays in a kind that starts every question on a clean map

  const NS = 'http://www.w3.org/2000/svg';
  const $ = id => document.getElementById(id);
  const svg = $('map'), gR = $('regions'), gB = $('borders'), gL = $('labels');
  const hoverUse = $('hoverUse'), ansUse = $('ansUse'), askUse = $('askUse'), askLine = $('askLine'), askCtx = $('askCtx'); // (askUse, askLine: the place asked, prompt 'area')
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
    if (a.w) { p.style.strokeWidth = a.w + 'px'; p.style.vectorEffect = 'none'; svg.classList.add('ground'); } // (a dot of a size on the ground: it grows and shrinks with the map; svg.ground: no ring around it)
    SPARE.appendChild(p); EL[a.id] = p;
  }
  // A map made ready in Web Mercator beforehand (mercator.js, ready) needs no geo.js: an area's label point as latitude
  // and longitude (for the street map and My stats) is its point on the map's own projection; its outline where the
  // map draws it as a circle comes with it (real, for Shape).
  const READY = !!(Q.proj && Q.proj.type === 'mercator' && Q.proj.grain && typeof MERCATOR === 'object');
  const labOf = id => (Q.geo && Q.geo[id] ? Q.geo[id].lab : READY ? MERCATOR.latlng(AREA[id].lx, AREA[id].ly, Q.proj) : null);
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
     the answer away), detail: { label, text(id) } for an optional hint under the prompt, sign(id, el) to show a
     name asked ('name') as a picture instead (a city on its country's road sign: draws into el and returns true, or
     false for the plain name; the "Sign" switch turns it off), presets: [{ label, ids }]
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
     never compared letter by letter. The list starts folded away: then nothing is offered while typing, the arrow
     keys mark nothing, and Enter or OK answers with what is typed, compared as in Type. The button by the field opens
     it, and folds it again, for every quiz (the settings' listOpen). In Hard mode there is no list and no button.
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
     typeMode: { typed, text, say, time } is what the Type mode asks and takes instead, where the kind is names in
     another script (./reading.js): a typeface anew each time, any spelling the letters allow, the name said aloud;
     its typed(id, text) is true for a spelling it reads, else undefined: the usual check then decides.
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
     code   the other way round from the map, for phone codes: the code's areas outlined on the map, its code typed.
            Only the digits count, with or without the leading 0 (0201 or 201), as the code is written in the quiz (its
            short name and its name; "021 · 031" is either, "(07) 2/3" 072 or 073); a form that is another code's of the
            layer counts for neither. The keyboard is the phone's digits.
            Codes with the same areas (overlays: 212, 646 and 332 in Manhattan) look alike outlined, so they are asked
            together, those of the round that are still to come: "Which 3 codes are used here?". They are typed one by
            one ("✓ 212 · 2 more") or at once, apart by commas or spaces ("212, 646 332"); any code of those areas fills a
            place, and each code keeps its own result and review card. A code used here but over other areas as well,
            or only in part of them (917 over all of New York City, for Manhattan), is told so and costs no try.
            Codes over a larger area and those of its parts are told apart at a glance: a question about a part says
            "Part of a larger area" over it and "used only in this part", the larger area drawn dashed around it; a
            question about the larger area says "Whole area" and "used across this whole area", its parts drawn dashed
            inside it. A round asks a place's parts before the codes over all of it (604 and 250 before the four codes
            over all of British Columbia). The outline is the place's edge, without the lines between its areas.
            Give up (by the field) shows the codes and goes on, the question missed; once they are shown it is Next,
            as is Enter with nothing typed. Each question starts on a map without colors (fresh): an answer's color,
            the second try's yellow among them, would hide the next outline where it lies over it.
     draw   the place drawn on the map, asked as on the map (its name, code or picture): Outline, a line that closes
            itself and is filled once let go, or Brush, a broad round brush (its width the same on screen at every zoom,
            so zoomed in it draws finer); as many pieces as it takes (islands), Undo (Backspace, Z) the last, Clear all
            of them, Done (Enter) answers. One finger draws, two move and zoom the map; with a mouse the left button
            draws, the wheel zooms, and the right or middle button or Space held moves the map. One try: DRAW_PASS or
            more of the drawing and the place as one (the area both cover, of the place and what is drawn outside it at
            DRAW_OUT of its size, on the ground, a band of DRAW_EDGE screen pixels along the place's edge left out) is
            right, less is a miss, and the place is shown under the drawing with what it scored. The drawing stays
            until the next one begins. What shows of the borders is the map's choice, as in every mode. Offered on every
            kind where a place is clicked (drawable): not on dots (cities), a board of tiles, a place asked by its
            outline (prompt 'area') or answered typed, nor where a place answers many questions (fresh) or the answer
            is picked area by area (pickAll).
     name   "Name it", the other way round from the map: the place outlined on the map as prompt 'area' asks it (a city's
            dot ringed, the map centred on it, at most a third of the map wide) and its name given from the list of the
            kind's names, as in List, but a click on a name answers at once (Enter the one marked); what is typed
            narrows the list by every form that counts (the name, the one answered, answers(id): "Fukushima" finds
            福島県), and what finds none is compared as in Type. A kind in another script lists its own names (its
            text: 福島県, বরগুনা). A wrong name flashes its place, as a wrong click; an answered place shows the color of
            its answer. On a touch screen the field is not focused by itself (the keyboard would cover the map), and
            on a phone the answer is told right under the field.
     shape  the same without a map: the place alone, filled and outlined, scaled to fit (the union of its areas: a unit
            of the kind's layout as one shape, from shapes.js where stored, holes and islands kept; a place the map
            draws as a circle, by its real outline), in the color of its answer once answered; always played as on the
            quiz map. Both offered on every kind whose question
            names one place (nameable: prompt 'name' or 'text'), not on codes (prompt 'dial': they have 'code'),
            pictures, a board of tiles, a layer that only groups, a place already answered typed (prompt 'area'), nor
            where a place answers many questions (fresh), is clicked or picked area by area (clickAll, pickAll) or is
            labelled per area; Shape not on dots (cities). A review's clock gives them Type's time.
     Each mode is played as a kind of its own, '<kind>~<mode>', with the kind's items and rounds: its best results (per
     map, as every kind's) and its review cards are its own, and a round played perfectly in any mode counts for the
     stars. The name answered is the kind's answer(id): the Latin name of a name in another script or form. */
  const MODES = [['map', 'Map'], ['list', 'List'], ['type', 'Type'], ['pairs', 'Pairs'], ['pick', 'Pick'], ['pickback', 'Pick back'], ['code', 'Type code'], ['name', 'Name it'], ['shape', 'Shape'], ['draw', 'Draw']], PAIRS = 7, DRAW_PASS = 70;
  // (draw: a place that is clicked on the map, one place a question, not a city's dot or a tile of a board)
  const drawable = K => !Q.dots && !Q.board && !K.groupsOnly && K.prompt !== 'area' && !K.typed && !K.fresh && !K.pickAll;
  // (name, shape: one place a question, asked by its name, or its name in another script or on a sign)
  const nameable = K => !Q.board && !K.groupsOnly && (K.prompt === 'name' || K.prompt === 'text') && !K.typed && !K.fresh && !K.pickAll && !K.clickAll && !K.areaLabel && !K.labelPerArea;
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
  // typed(id, text) of the mode 'code': the digits typed, against the forms of each code (see MODES); a kind of plate
  // codes (K.plates) its letters and digits, whatever the case ("cj" is CJ, "01" and "1" are 01).
  function codeTyped(K) {
    const norm = t => K.plates ? String(t).toUpperCase().replace(/[^\p{L}\p{N}]/gu, '') : String(t).replace(/\D/g, '');
    const forms = id => {
      const out = new Set();
      for (const written of [K.short ? K.short(id) : id, K.name ? K.name(id) : '']) for (let part of String(written).split('·')) {
        const alt = !K.plates && part.match(/^(.*?)(\d+)\/(\d+)\s*$/); // "(07) 2/3": 072 or 073
        for (const p of alt ? [alt[1] + alt[2], alt[1] + alt[3]] : [part]) { const d = norm(p); if (d) { out.add(d); if (/^\d+$/.test(d)) out.add(d.replace(/^0+(?=\d)/, '')); } }
      }
      return out;
    };
    const owners = new Map(), mine = {}, owner = new Map();
    for (const id of new Set(K.ids)) { mine[id] = forms(id); for (const f of mine[id]) { owners.set(f, (owners.get(f) || 0) + 1); owner.set(f, id); } } // (an item in two groups is one code)
    // a plate code typed without its marks (ck for ČK, sb for ŠB), where that is no other code and no other's too:
    // Germany's MU stays München, not Mühldorf's MÜ
    const plain = t => t.normalize('NFD').replace(/\p{M}/gu, ''), loose = new Map();
    if (K.plates) for (const [f, n] of owners) { const p = plain(f); if (p !== f && !owners.has(p)) loose.set(p, loose.has(p) ? null : (n === 1 ? owner.get(f) : null)); }
    // codeOf(text): the code typed, if it is one of the layer's (and no other's too)
    const codeOf = text => {
      let t = norm(text); if (!owners.has(t) && /^\d+$/.test(t)) t = t.replace(/^0+(?=\d)/, '');
      return t && owners.get(t) === 1 ? owner.get(t) : (!owners.has(t) && loose.get(plain(t))) || null;
    };
    // same(id): the codes with exactly its areas (itself among them)
    const outline = id => [...new Set(K.areas[id])].sort().join(' '), byOutline = new Map();
    for (const id of new Set(K.ids)) { const o = outline(id); if (!byOutline.has(o)) byOutline.set(o, []); byOutline.get(o).push(id); }
    // How each outline lies among the others: the outlines wholly inside it or across its edge (its parts), the
    // smallest one around it (the larger area it is part of), and how many lie wholly inside it (those are asked
    // first: 604 and 250 before the codes over all of British Columbia).
    const sets = new Map([...byOutline.keys()].map(o => [o, new Set(o.split(' '))])), rel = new Map();
    for (const [o, O] of sets) {
      const parts = []; let around = null, inside = 0;
      for (const [x, X] of sets) {
        if (x === o) continue;
        let n = 0; for (const a of X) if (O.has(a)) n++;
        if (!n) continue;
        if (n === O.size) { if (!around || X.size < around.length) around = [...X]; } else { parts.push([...X].filter(a => O.has(a))); if (n === X.size) inside++; }
      }
      rel.set(o, { parts, around, inside });
    }
    const scope = id => { const r = rel.get(outline(id)); return r.around ? 'part' : r.parts.length ? 'whole' : ''; };
    return { typed: (id, text) => codeOf(text) === id, codeOf, same: id => byOutline.get(outline(id)), scope,
      around: id => rel.get(outline(id)).around, parts: id => rel.get(outline(id)).parts, depth: id => rel.get(outline(id)).inside };
  }
  // Name it, Shape (see MODES): the kind's own names, the list to pick from (on a kind of another script its text, as it
  // asks it: 福島県); typed(id, text) by every form of each (its name, its own one, the one answered, answers(id)), where an
  // item with the same areas counts too (the place shown is either of them); tell(id): its name as told, each form once.
  function namedTyped(K, answerName) {
    // (a text drawn at random each time it is asked, a sign of several: its name instead)
    const textOf = id => (K.text(id) || {}).text, fixed = K.prompt === 'text' && K.text && K.ids.every(id => [1, 2, 3, 4].every(() => textOf(id) === textOf(id)));
    const ownName = id => (fixed && textOf(id)) || K.name(id), all = {};
    for (const id of K.ids) all[id] ??= [...new Set([ownName(id), K.name(id), answerName(id), ...[].concat(K.answers ? K.answers(id) : [])].filter(Boolean).map(String))];
    const typed = typedOf(Object.fromEntries(Object.entries(all).map(([id, l]) => [id, [...new Set(l.map(plainName))]])));
    const outline = id => [...new Set(K.areas[id])].sort().join(' '), alike = new Map(), forms = new Map(), plain = new Map();
    for (const id of new Set(K.ids)) { const o = outline(id); (alike.get(o) || alike.set(o, []).get(o)).push(id); }
    for (const id of K.ids) { const n = ownName(id); forms.set(n, [...new Set([...(forms.get(n) || []), ...all[id]])]); }
    const names = [...forms.keys()].sort((a, b) => a.localeCompare(b));
    return { named: true, ownName, typed: (id, text) => alike.get(outline(id)).some(x => typed(x, text)), choices: () => names,
      choiceForms: n => plain.get(n) || plain.set(n, (forms.get(n) || [n]).map(plainOf)).get(n),
      tell: id => { const out = []; for (const p of [K.name(id), ownName(id), answerName(id)]) if (p && !out.some(o => String(o).includes(p))) out.push(p); return out.join(' · '); } };
  }
  for (const K of Object.values(KINDS)) {
    const answerName = K.answer || (KINDS[K.of] ? id => KINDS[K.of].name(id) : K.name);
    const named = nameable(K) ? namedTyped(K, answerName) : null;
    if (named) K.modes = [...(K.modes || []), 'name', ...(Q.dots ? [] : ['shape'])];
    if (drawable(K)) K.modes = [...(K.modes || []), 'draw'];
    for (const mode of K.modes || []) {
      const forms = Object.fromEntries(K.ids.map(id => [id, [...new Set([answerName(id), ...[].concat(K.answers ? K.answers(id) : [])].filter(Boolean).map(plainName))]]));
      const names = [...new Set(K.ids.map(answerName))].sort((a, b) => a.localeCompare(b));
      KINDS[`${K.key}~${mode}`] = { ...K, key: `${K.key}~${mode}`, base: K.key, mode, of: undefined, modes: undefined, clickAll: false, pickAll: false,
        cards: `${K.cards || K.key}~${mode}`, label: `${K.label} · ${modeLabel(K, mode)}`, answerName,
        ...(mode === 'pairs' ? { pairs: true, typed: undefined, choices: undefined, time: () => 1.5 }
          : mode === 'pick' || mode === 'pickback' ? { choose4: mode, typed: undefined, choices: undefined, time: () => 1.5 }
          : mode === 'code' ? { prompt: 'area', ...codeTyped(K), choices: undefined, inputMode: K.plates ? 'text' : 'numeric', fresh: true, time: () => 3 * Math.max(1, (G.group || []).length) }
          : mode === 'draw' ? { draw: true, typed: undefined, choices: undefined, time: () => 6 }
          : mode === 'name' || mode === 'shape' ? { prompt: mode === 'name' ? 'area' : 'shape', ...named, shape: mode === 'shape', time: () => 3 }
          : { typed: typedOf(forms), choices: mode === 'list' ? () => names : undefined, time: () => (mode === 'list' ? 2 : 3) }) };
      // (a name in another script: Type reads it as the kind's typeMode says, the usual check deciding what that doesn't take)
      const T = KINDS[`${K.key}~${mode}`];
      if (mode === 'type' && K.typeMode) { const std = T.typed; Object.assign(T, K.typeMode, { typed: (id, text) => K.typeMode.typed(id, text) ?? std(id, text) }); }
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
     only when the hand rests (REST ms) or lets go: never while zooming, however far (zoomed in far, lines and labels
     are thick until then, zoomed out far, the sea shows beyond the picture, as the street map's library does), and
     while held never at all (a drag that goes on past the picture shows the sea beside it). A move by the wheel that
     does not zoom is drawn again when the view has come EDGE of the way into what was drawn ahead. Meanwhile lines and
     labels grow and shrink with the picture. */
  // Points are told apart, and those worked out here rounded, to 1/QN of a map unit: hundredths, or finer where the
  // map's own points are (Q.grain, mercator.js).
  const QN = Math.max(100, Math.round(1 / (Q.grain || 1)));
  const [MW, MH] = Q.size, PAD = Q.pad, stage = $('stage'), AHEAD = .5, EDGE = .6, REST = 120;
  let base = { x: 0, y: 0, w: MW, h: MH }, vb = { ...base };
  // The picture's box: the stage's and `ahead` of its size more on every side (a share, so it follows the stage's size).
  let ahead = 0;
  function reach(a) { if (a !== ahead) Object.assign(svg.style, { left: -a * 100 + '%', top: -a * 100 + '%', width: (1 + 2 * a) * 100 + '%', height: (1 + 2 * a) * 100 + '%' }); ahead = a; }
  reach(AHEAD);
  // The map drawn by WebGL (GL_LOAD above): the SVG's shapes and labels are then only read, not drawn, and a tap is
  // found on them by their outlines (areaAt). It draws every view as it comes, so the outlines take the detail of the
  // view while the map zooms, not only once it rests (syncDetail in slide), the dots grow and the labels stay; the
  // triangles of every zoom step are made ahead while the page is idle (bandsAhead).
  let glm = null;
  if (GL_LOAD) GL_LOAD.then(() => {
    glm = glMap(stage, svg); if (!glm) return;
    glm.view(vb, dotPx(scale()));
    for (const k in LAYOUTS) { const L = LAYOUTS[k]; if (L && L.pre && L.queued) { L.queued = false; bandsAhead(L); } } // (made before WebGL came: its triangles now)
  }, () => {});
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
  // The picture drawn for the view. In the middle of a move (moving: the picture stretched too far) the outlines keep
  // the detail they have: they take the one for the view only once the move is over (at rest, let go), so zooming
  // never stops to change them.
  function apply(moving) {
    cancelAnimationFrame(raf); clearTimeout(resting);
    svg.setAttribute('viewBox', `${vb.x - ahead * vb.w} ${vb.y - ahead * vb.h} ${vb.w * (1 + 2 * ahead)} ${vb.h * (1 + 2 * ahead)}`);
    if (slid) { svg.style.transform = ''; slid = false; }
    drawn = { ...vb };
    const s = scale(); if (glm) glm.view(vb, dotPx(s));
    if (s !== sized) sizeLabels(s);
    if (moving) resting = setTimeout(apply, REST); else { syncDetail(s); svg.classList.remove('zooming'); }
    worldNear(pictureBox());
    showTiles();
    if (live) liveSoon(); // (a piece being drawn follows the map, see draw)
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
    const zooming = Math.abs(Math.log(k)) >= .01;
    if (!pts.size && !zooming && out > EDGE) return apply(true); // (not while held, not while zooming)
    if (zooming) svg.classList.add('zooming'); // (the labels are hidden while the map zooms: the browser paints it again as it grows)
    // (the picture's own corner lies `ahead` of the stage's size outside the stage's)
    const tx = n.x - k * d.x + n.s * (drawn.x - vb.x) + ahead * r.width * (1 - k), ty = n.y - k * d.y + n.s * (drawn.y - vb.y) + ahead * r.height * (1 - k);
    svg.style.transform = `translate(${tx}px,${ty}px) scale(${k})`; slid = true;
    if (glm) { glm.view(vb, dotPx(n.s)); syncDetail(n.s); worldNear(pictureBox()); } // (WebGL draws the view itself at once, at its detail: nothing of it is stretched)
    showTiles();
    if (live) liveSoon();
    clearTimeout(resting); resting = setTimeout(apply, REST);
  }
  const glide = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(slide); }; // once per frame, however many steps came
  function scale() { const r = stageBox(); return Math.min(r.width / vb.w, r.height / vb.h) || 1; }
  function toSvg(cx, cy, v) {
    const r = stageBox(); const s = Math.min(r.width / v.w, r.height / v.h);
    const ox = (r.width - v.w * s) / 2, oy = (r.height - v.h * s) / 2;
    return { x: v.x + (cx - r.left - ox) / s, y: v.y + (cy - r.top - oy) / s };
  }
  // On the street map, the overlay, the bare map and the satellite map the map zooms in as far as the street map's
  // tiles go (zoom level 19; the satellite map's are enlarged past 8); a Mercator map has 256 · 2^zoom / 360 / k screen pixels to its unit there (k: its units to a degree of
  // longitude, mercator.js).
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
  let live = null, spaceHeld = false; // Draw: the piece being drawn, and whether Space holds the map to be moved (see draw)
  svg.addEventListener('pointerdown', e => {
    svg.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    // (Draw: one finger, the pen or the left button draws; the right or middle button, or Space held, moves the map)
    if (pts.size === 1 && sketching() && (e.pointerType === 'touch' || e.button === 0) && !spaceHeld) { moved = true; sketchFrom(e); return; }
    if (pts.size === 1) { if (e.button === 1 && sketching()) e.preventDefault(); drag = { x: e.clientX, y: e.clientY, v: { ...vb }, s: scale() }; moved = false; downArea = areaAt(e); }
    else if (pts.size === 2) { sketchDrop(); const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, v: { ...vb } }; moved = true; drag = null; }
  });
  svg.addEventListener('contextmenu', e => { if (sketching()) e.preventDefault(); }); // (the right button moves the map)
  svg.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) { if (e.pointerType === 'mouse') hover(areaAt(e)); return; }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (live && live.id === e.pointerId) sketchTo(e);
    else if (pinch && pts.size === 2) {
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
    const t = glm ? glm.at(toSvg(e.clientX, e.clientY, vb)) : e.target, d = t && t.dataset; if (!d) return null; // (WebGL: the shape under it, by its outline)
    if (d.a) return d.a;
    const p = d.u !== undefined ? UNDER[+d.u] : null; if (!p) return null;
    if (view !== 'explore') return p.areas[0];
    const q = toSvg(e.clientX, e.clientY, vb), at = s => inside(s, q.x, q.y);
    // (its shape drawn at a view's detail may reach half a pixel past its areas: then the area there, of any unit)
    return p.areas.find(a => at(shapeOf(SVG_SPACE, a))) || (shapesNear(SVG_SPACE, q.x, q.y).find(at) || {}).a || p.areas[0];
  }
  function up(e) {
    if (live && live.id === e.pointerId) sketchEnd();
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
  // areas not shown, there to be tapped, and only what was answered shows. The bare map is the street map alone with
  // the tiles' own borders taken out too (map-tiles.js, tiles.bare()); the satellite map, photos from above with no
  // names, roads or borders on them (tiles.sat()).

  /* ---------- one interface over the maps ---------- */
  let mapStyle = 'quiz';
  const onStreet = () => mapStyle === 'street' || mapStyle === 'overlay' || mapStyle === 'bare' || mapStyle === 'sat'; // on the street map, with or without the areas
  const overlaid = () => mapStyle === 'overlay';
  const plain = () => mapStyle === 'street' || mapStyle === 'bare' || mapStyle === 'sat'; // the street map alone: nothing may give the borders away
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
  // The street map's tiles behind the map: on the street map and the overlay, and behind a city quiz's map (showBack);
  // on the bare map, and behind a city quiz's bare map, without their borders; on the satellite map its photos.
  function syncStreets() {
    const on = onStreet() || shownBack !== 'quiz';
    svg.classList.toggle('streets', on);
    if (on || tiles) withTiles(() => { const look = onStreet() ? mapStyle : shownBack; tiles.street(look === 'quiz' ? null : look === 'bare' || look === 'sat' ? look : 'street'); apply(); });
  }
  function activeKind() { return view === 'explore' ? (MS && MS.kind()) || Q.exploreKind : view === 'setup' ? choiceKind() : G.kind; } // (MS: My stats, its layer)
  // The item under the pointer: outlined on the quiz map, tinted on the overlay; in a kind with pickAll, where areas
  // are picked one by one, the area alone.
  // (not on the street map alone: that would show its borders)
  function hover(area) {
    if (view === 'play' && (KINDS[G.kind].prompt === 'area' || KINDS[G.kind].draw)) { hoverUse.setAttribute('d', ''); return; } // (the place asked is the only one outlined; a drawing has none)
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
  const boxOf_ = a => { if (EL[a].isConnected && !glm) return EL[a].getBBox(); const s = shapeOf(SVG_SPACE, a); return { x: s.x0, y: s.y0, width: s.x1 - s.x0, height: s.y1 - s.y0 }; }; // (WebGL: the SVG's shapes are not laid out, see glm)
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
      const ll = labOf(id); if (ll) { lat += ll[0] * w; lng += ll[1] * w; }
    }
    const m = { x: x / a, y: y / a, ll: [lat / a, lng / a], area: a };
    if (areas.length > 1) {
      // Items spread over several areas (e.g. a zone covering Central Russia and the Far East) can have
      // their average point outside all of them, so put the label on the member area closest to it.
      const near = areas.reduce((b, id) => Math.hypot(AREA[id].lx - m.x, AREA[id].ly - m.y) < Math.hypot(AREA[b].lx - m.x, AREA[b].ly - m.y) ? id : b);
      Object.assign(m, { x: AREA[near].lx, y: AREA[near].ly, ll: labOf(near) });
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
        e.el.dataset.raw = (Math.sqrt(m.area) * Q.labelScale).toPrecision(5); // (its size on the map before it is held within 9 to 15 px, see sizeLabels: for the WebGL labels)
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
  // The dots' size on the screen at scale s (see sizeLabels).
  function dotPx(s) { const r = stageBox(), s0 = base && r.width ? Math.min(r.width / base.w, r.height / base.h) : s; return 11 * Math.sqrt(Math.max(1, s / s0)); }
  function sizeLabels(s = scale()) {
    sized = s;
    // Dots (cities, small countries) are 11 px across on the screen when zoomed out and grow as the map is zoomed in,
    // with the square root of the zoom (twice as large at 4 times, 70 px at 40): zooming in makes them easier to tap,
    // and still pulls crowded ones apart, as the map grows faster than they do (--dot, in the CSS). (Dots of a size
    // on the ground, an area's w, keep theirs.)
    const dot = dotPx(s);
    svg.style.setProperty('--dot', dot.toFixed(1) + 'px');
    for (const c of gPins.querySelectorAll('circle')) c.setAttribute('r', (4.5 / s).toFixed(3));
    for (const c of gFree.querySelectorAll('circle')) c.setAttribute('r', (5 / s).toFixed(3));
    for (const t of gPins.querySelectorAll('text')) { t.setAttribute('font-size', (13 / s).toFixed(3)); t.setAttribute('dy', (-9 / s).toFixed(3)); t.style.strokeWidth = (3 / s).toFixed(3) + 'px'; }
    for (const e of ENTRIES) {
      const fs = Q.dots ? 12 / s : Math.min(15 / s, Math.max(9 / s, Math.sqrt(e.area) * Q.labelScale));
      e.el.setAttribute('font-size', fs.toFixed(3)); e.el.style.strokeWidth = (3 / s).toFixed(3) + 'px';
      if (Q.dots) e.el.setAttribute('dy', (-(dot / 2 + 7.5) / s).toFixed(3)); // city names sit above their dot, like pins
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
  // A kind with fresh: the colors of the answers leave the map, at once or after `wait` ms. Hard mode (the setup's
  // switch) does the same in every kind, and takes the answers' names off too: nothing answered is left to go by.
  // The round's results show them all again.
  const hardMode = () => !!($('optHard') && $('optHard').checked);
  let freshTimer;
  function fresh(wait) {
    clearTimeout(freshTimer);
    const clear = () => { for (const a of AREAS) for (const p of shapesOf(a)) p.classList.remove(...RESULT_CLASS, 'rare'); if (hardMode()) clearLabels(); };
    if (wait) freshTimer = setTimeout(clear, wait); else clear();
  }
  function clearMap() {
    clearPin(); gFree.replaceChildren(); clearTimeout(freshTimer);
    for (const t of flashTimers.values()) clearTimeout(t);
    flashTimers.clear();
    for (const a of AREAS) for (const p of shapesOf(a)) p.classList.remove('got', 't2', 't3', 'miss', 'ans', 'sel', 'pick', 'flash', 'found', 'rare', 'out', 'pre');
    clearLabels(); labelsOut();
    mark(null); sketchClear(); showAsked(null); // (a round ended before its first answer leaves no place outlined)
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
    let n = 0; for (const u of units) for (const a of u) n += Q.geo && Q.geo[a] && Q.geo[a].rings ? Q.geo[a].rings.reduce((m, r) => m + r.length, 0) : AREA[a].d.length;
    const s = units.map(u => u.join(',')).join('|') + '|' + Math.round(MW) + 'x' + Math.round(MH) + '|' + n + '|' + (Q.grain || '');
    let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36) + ':' + units.length;
  }
  function layoutOf(kind) {
    if (kind in LAYOUTS) return LAYOUTS[kind];
    const K = KINDS[kind];
    if (K.draw || K.named) return LAYOUTS[kind] = layoutOf(K.base); // (Draw, Name it and Shape show the map of the kind they ask, its stored shapes too)
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
    bandsAhead(L);
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
  // Stored shapes: a version's outlines at a band, a unit's at a time (a band's list, with the areas it leaves loose).
  const bandLines = (L, d, T) => (L.bands ??= {})[d + ':' + T] ??= Object.assign([], { loose: new Set(L.pre.loose[d]) });
  const lineOf = (L, d, T, i) => bandLines(L, d, T)[i] ??= runsD(L.pre.lines[d][i], T);
  function drawUnits() {
    const L = LAYOUTS[layoutKind], lines = L.pre ? bandLines(L, detail, band) : (L.lines ??= [])[detail] ??= unitOutlines(L.units, DETAIL[detail]);
    UNIT_LINES.forEach((p, i) => p.setAttribute('d', L.pre ? lineOf(L, detail, band, i) : lines[i]));
    for (const a of AREAS) EL[a].classList.toggle('tight', underOf[a] !== undefined && !lines.loose.has(a));
    if (!L.ahead && !L.pre) { L.ahead = true; whenIdle(() => DETAIL.forEach((d, i) => { L.lines[i] ??= unitOutlines(L.units, d); })); }
  }
  // With stored shapes, every zoom step of a layout is made in the background from the moment its kind is on the map
  // (the round picked on the setup screen, Explore, a round played), so that zooming only puts finished paths in place:
  // every band a view can reach, from the street map's closest to the map zoomed out as far as it goes (at this
  // screen's size), the band on screen and its neighbours first; each unit's fill and the outline versions drawn at
  // that band, a unit at a time while the page has nothing else to do. A kind put on the map later goes first.
  const BANDS_TODO = [], soon = window.requestIdleCallback ? f => requestIdleCallback(f, { timeout: 1000 }) : f => setTimeout(f, 40);
  let aheadOn = false;
  function bandsAhead(L) {
    if (!L || !L.pre || L.queued || !stageBox().width) return; // (a map not laid out: its bands are made as they are shown)
    L.queued = true;
    const widest = Math.min(30, bandOf(scale() * vb.w / (base.w * (Q.world ? 3 : 1.15))));
    const steps = Array.from({ length: widest + 1 }, (_, T) => T).sort((a, b) => Math.abs(a - band) - Math.abs(b - band) || a - b);
    const tasks = [];
    for (const T of steps) {
      // (band T holds the scales from .5·QN / 2^T to .5·QN / 2^(T-1) screen pixels to a map unit; FINE and above draw version 1)
      const hi = T ? .5 * QN / 2 ** (T - 1) : Infinity, lo = T ? .5 * QN / 2 ** T : .5 * QN;
      const versions = [...(hi >= FINE ? [1] : []), ...(lo < FINE ? [0] : [])];
      L.units.forEach((_, i) => tasks.push(() => {
        const w = wholeOf(L, i, T); for (const d of versions) lineOf(L, d, T, i);
        if (glm) { glm.prepare(w, ['e', 's']); for (const d of versions) glm.prepare(lineOf(L, d, T, i), ['r']); } // (WebGL: their triangles too)
      }));
    }
    BANDS_TODO.unshift(...tasks);
    if (!aheadOn) { aheadOn = true; soon(work); }
    // (without idle callbacks, Safari: 8 ms at a time, every 40 ms)
    function work(deadline) {
      const t0 = performance.now(), more = deadline ? () => deadline.timeRemaining() > 2 : () => performance.now() - t0 < 8;
      do BANDS_TODO.shift()(); while (BANDS_TODO.length && more()); // (one at least, also when the page is never idle)
      if (BANDS_TODO.length) soon(work); else aheadOn = false;
    }
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
    if ($('optHard')) $('optHard').checked = !!savedOpts.hard;
    if ($('optSign')) $('optSign').checked = savedOpts.sign ?? true;
  }
  function saveOpts() { store('opts', { colors: $('optColors').checked, detail: $('optDetail').checked, letters: lettersOpt ? lettersOpt.checked : false, hard: hardMode(), sign: $('optSign') ? $('optSign').checked : true }); }
  $('optColors').addEventListener('change', () => { syncHints(); saveOpts(); });
  $('optDetail').addEventListener('change', saveOpts);
  if ($('optSign')) $('optSign').addEventListener('change', saveOpts);
  if ($('optHard')) $('optHard').addEventListener('change', saveOpts);
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
    // A mode that answers without the map (a list, typing, four to pick from, a shape) has none, while playing and on
    // its results: the panel takes the page, everything in it larger (see .nomap).
    $('app').classList.toggle('nomap', (id === 'play' || id === 'done') && !!KINDS[G.kind] && ['list', 'type', 'pick', 'pickback', 'shape'].includes(KINDS[G.kind].mode));
    if (id !== 'play') looksEl.hidden = true;
    shapeEl.hidden = !(id === 'play' && !!KINDS[G.kind] && !!KINDS[G.kind].shape);
    $('app').classList.toggle('naming', id === 'play' && !!KINDS[G.kind] && !!KINDS[G.kind].named && !KINDS[G.kind].shape); // (Name it: on a phone the answer under the field, see .naming)
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
    syncHints(); syncDraw();
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
  // The maps to play on: the quiz map, the street map, the overlay (the street map with the quiz map's outlines and
  // colors on it), the bare map (the street map without even its own borders), or the satellite map (photos from
  // above, without names either: the hardest): a small picker on the
  // map itself, shown on the setup screen. City quizzes (Q.free) choose
  // between clicking anywhere on the map (the default) and clicking the dots instead: that is asked in the box of
  // the round picked, under its name (playRow), not on the map.
  const FREE = !!Q.free, ONE = Q.single; // (ONE: a page of one round, see single above)
  if (ONE) document.body.classList.add('single');
  const SWITCHES = FREE || ROUNDS.some(r => r.of) || Q.kinds.some(k => KINDS[k.key].modes); // rounds with a switch in their box: Map or Dots, a language, how to answer
  const MAPS = FREE ? [['free', 'Map', 'by distance'], ['quiz', 'Dots', '3 tries']]
    : [['quiz', 'Quiz map', 'with borders'], ['overlay', 'Overlay', 'borders on streets'], ['street', 'Street map', 'hard, no borders'], ['bare', 'Bare map', 'no borders at all'], ['sat', 'Satellite', 'no names, no borders']].slice(0, Q.geo || READY ? 5 : 1);
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
    ? { proj: Q.proj, kpu: Q.kpu, areas: Q.areas.filter(a => labOf(a.id)).map(a => ({ d: a.d, lat: labOf(a.id)[0], lng: labOf(a.id)[1], x: a.lx, y: a.ly })) } : null);
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
  // map shows the streets alone, the bare map without the tiles' own borders too, the satellite map photos from above
  // with no names at all. Their picker takes the place of the
  // map picker, which they don't have.
  const BACKS = Q.streets ? [['quiz', 'Quiz map', 'drawn'], ['overlay', 'Overlay', 'borders on streets'], ['street', 'Street map', 'no borders'], ['bare', 'Bare map', 'no borders at all'], ['sat', 'Satellite', 'no names, no borders']] : [];
  let chosenBack = BACKS.some(([m]) => m === load('back')) ? load('back') : BACKS.some(([m]) => m === Q.back) ? Q.back : 'quiz'; // (Q.back: the page's own, city-config.js)
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
    svg.classList.toggle('plain', back === 'street' || back === 'bare' || back === 'sat');
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
  // ?practice=<kind>&items=<item ids, each URI-encoded, apart by commas>: a round of exactly those items, as the review
  // page's Practice asks for (assets/js/stats.js), in the way and on the map it says (mode, map, back), at once.
  const practiced = (kind, items) => {
    const K = KINDS[kind]; if (!K || !items) return null;
    const own = new Map(itemList(kind).map(x => [String(x), x]));
    const ids = uniq(items.split(',').map(x => { try { return decodeURIComponent(x); } catch (e) { return x; } }).filter(x => own.has(x)).map(x => own.get(x))).filter(id => K.areas[id]);
    return ids.length ? { kind, ids, practice: true } : null;
  };
  const SHARED = decode(params.get('quiz')) || practiced(params.get('practice'), params.get('items'));
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
    for (const r of ROUNDS) if (!r.random) { const p = STORE.print(roundIds(r)); for (const map of ['quiz', 'overlay', 'street', 'bare', 'sat', 'free']) { const k = `${r.kind}/${map}/${p}`; if (best[k] && !best[k].name) unnamed.push([k, r.label]); } }
    if (unnamed.length) keep(r => { for (const [k, name] of unnamed) if (r.best?.[k]) r.best[k].name = name; });
  }
  // How a card is reviewed: the way the last perfect round with it was played, which is kept with the card (see
  // area-review.js): on that map (the quiz map, the overlay, the street map, the bare map, the satellite map; a city quiz's dots or its
  // map by distance) and, in a city quiz, with that background. A card not played perfectly since that is kept goes by the
  // best results, which don't say when: the map of a perfect result of a round, a saved or a custom quiz with its
  // item in it, the hardest of several (a player goes from the dots to the distance, not back); or else (a round
  // that has changed since) of any perfect result of its kind, the easiest of several; and with none the map
  // chosen on the setup screen. Its background is the one chosen there, as nothing tells what it was.
  const EASIEST = ['quiz', 'overlay', 'street', 'bare', 'sat', 'free'].filter(m => MAPS.some(([x]) => x === m)); // (the dots before the map by distance)
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
    const rounds = ROUNDS.filter(r => !r.random && !ONE && (!folder || folderOf(r.kind) === folder)).map(r => { // (a page of one round: none, its rounds are drawn anew)
      const ids = roundIds(r), kinds = [r.kind, ...(KINDS[r.kind].modes || []).map(m => `${r.kind}~${m}`)]; // (in any mode)
      const best = Math.max(0, ...kinds.flatMap(k => ['quiz', 'overlay', 'street', 'bare', 'sat', 'free'].map(map => { const b = bestFor(k, ids, map); return b ? b.s / ids.length : 0; })));
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
    const best = !random && (free ? ['free'] : ['quiz', 'overlay', 'street', 'bare', 'sat']).map(map => bestFor(played, ids, map)).filter(Boolean).sort((x, y) => y.s - x.s)[0];
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
    if (b.dataset.choice === choice) { const h = document.createElement('span'); h.className = 'langs helps'; rows.push(h); } // (the options: see helpRow)
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
    if (SHARED && inOpen(SHARED.kind)) section(-1, SHARED.practice ? 'Practice' : 'Shared with you', [withIcons(answerable(roundBtn('shared', SHARED.name, kindNote(SHARED.kind), SHARED.kind, SHARED.ids)),
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
  // The options (colors, detail, letters, Hard mode) as switches in the box of the round picked, where they are seen:
  // each the checkbox of the Help group (quiz-page.js) that it stands for, which keeps them and is hidden itself.
  function helpRow() {
    const row = $('rounds').querySelector('.helps'); if (!row) return;
    row.replaceChildren(...[...$('helpWrap').querySelectorAll('.toggle')].filter(t => !t.hidden).map(t => {
      const box = t.querySelector('input'), l = document.createElement('button'); l.type = 'button';
      l.textContent = t.textContent.trim(); l.setAttribute('aria-pressed', box.checked);
      l.onclick = e => { e.stopPropagation(); box.checked = !box.checked; box.dispatchEvent(new Event('change')); l.setAttribute('aria-pressed', box.checked); };
      return l;
    }));
    row.hidden = !row.children.length;
  }
  function syncSetup() {
    const cur = current(), K = KINDS[cur.kind], n = cur.ids.length;
    for (const b of $('rounds').querySelectorAll('.round')) b.setAttribute('aria-pressed', b.dataset.choice === choice);
    if ($('customCount')) $('customCount').textContent = choice === 'custom' ? plural(SEL[pickKind].size, KINDS[pickKind].noun) : '';
    $('customWrap').hidden = choice !== 'custom';
    $('startBtn').disabled = n === 0;
    $('startBtn').textContent = 'Start'; // (how many, and of what, the round's box says; a custom quiz with none picked can't start)
    $('optDetailWrap').hidden = !K.detail;
    if (K.detail) $('optDetailText').textContent = K.detail.label;
    if ($('optSignWrap')) $('optSignWrap').hidden = !K.sign;
    $('optColorsWrap').hidden = !['quiz', 'overlay'].includes(chosenMap) || K.hints === false;
    $('optColorsText').textContent = hintLabelOf(cur.kind);
    if ($('optHardWrap')) $('optHardWrap').hidden = !!Q.board || !!K.fresh || !!K.pickAll; // (those start every question on a clean map already, or have none)
    $('helpWrap').hidden = true; helpRow(); // (its switches are in the box of the round picked)
    pressed('mapSeg', 'map', chosenMap);
    if (view === 'setup') {
      // (a kind whose answers are sets of areas, dim: false, shows the whole map: the round's areas are its answers;
      // a page of one round shows none: its round is drawn at the start)
      const chosen = K.dim === false || ONE ? [] : cur.ids.flatMap(id => K.areas[id]);
      markOut(K.dim === false ? AREAS : chosen);
      // On the street map alone the round's areas are tinted instead (the map itself has no borders to dim).
      const inRound = new Set(chosen);
      for (const a of AREAS) EL[a].classList.toggle('pre', plain() && inRound.has(a));
      showLabels(cur.kind, ONE ? [] : cur.ids);
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

  /* ---------- Learn (Q.learn): everything to learn on one sheet ---------- */
  // A sheet over the whole page, one card for each part of the map: where it is (a small map of the whole, the part
  // lit), what it is, and its pictures (a click shows one large, with its label). Opened with Learn beside Explore;
  // Close or Escape shuts it. Built when it is first opened.
  const learnBtn = $('learnBtn');
  let learnSheet = null;
  function openLearn() {
    if (!learnSheet) {
      const L = typeof Q.learn === 'function' ? Q.learn() : Q.learn, el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
      learnSheet = el('div', 'learn'); learnSheet.id = 'learn'; learnSheet.setAttribute('role', 'dialog'); learnSheet.setAttribute('aria-modal', 'true'); learnSheet.setAttribute('aria-label', L.title || 'Learn');
      const head = el('header', 'learn-head'), close = el('button', 'ghost small', 'Close');
      close.type = 'button'; close.onclick = closeLearn;
      head.append(el('h2', '', L.title || 'Learn'), ...(L.sub ? [el('p', '', L.sub)] : []), close);
      // the map's areas once, each card's map using them (a card's map costs next to nothing more)
      const [x0, y0, x1, y1] = HOME, box = `${x0 - PAD} ${y0 - PAD} ${x1 - x0 + 2 * PAD} ${y1 - y0 + 2 * PAD}`;
      const defs = document.createElementNS(NS, 'svg'); defs.setAttribute('class', 'learn-defs'); defs.setAttribute('aria-hidden', 'true');
      const all = document.createElementNS(NS, 'g'); all.id = 'learnAll';
      for (const a of Q.areas) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', a.d); p.id = 'learn-' + a.id; p.setAttribute('vector-effect', 'non-scaling-stroke'); all.append(p); }
      defs.append(all);
      const use = (href, cls) => { const u = document.createElementNS(NS, 'use'); u.setAttribute('href', '#' + href); if (cls) u.setAttribute('class', cls); return u; };
      const grid = el('div', 'learn-grid');
      for (const s of L.sections) {
        const card = el('section', 'learn-card'), map = document.createElementNS(NS, 'svg'), text = el('div', 'learn-text');
        map.setAttribute('class', 'learn-map'); map.setAttribute('viewBox', box); map.setAttribute('aria-hidden', 'true');
        map.append(use('learnAll', 'base'), ...(s.areas || []).map(a => use('learn-' + a, 'on')));
        // a part too small to see lit on so small a map (islands far out): a ring around it as well
        const parts = (s.areas || []).map(a => AREA[a]).filter(Boolean), side = Math.max(x1 - x0, y1 - y0);
        if (parts.length) {
          const r = A => Math.sqrt(A.a || 0) / 2, bx0 = Math.min(...parts.map(A => A.lx - r(A))), bx1 = Math.max(...parts.map(A => A.lx + r(A))), by0 = Math.min(...parts.map(A => A.ly - r(A))), by1 = Math.max(...parts.map(A => A.ly + r(A)));
          if (Math.max(bx1 - bx0, by1 - by0) < side * 0.08) {
            const ring = document.createElementNS(NS, 'circle'); ring.setAttribute('class', 'ring'); ring.setAttribute('vector-effect', 'non-scaling-stroke');
            ring.setAttribute('cx', (bx0 + bx1) / 2); ring.setAttribute('cy', (by0 + by1) / 2); ring.setAttribute('r', side * 0.06);
            map.append(ring);
          }
        }
        text.append(el('h3', '', s.title), ...[].concat(s.sub || []).map(line => el('p', '', line)));
        const photos = el('div', 'learn-photos'); photos.append(...(s.photos || []).map(thumb));
        card.append(map, text, photos); grid.append(card);
      }
      learnSheet.append(defs, head, grid);
      document.body.append(learnSheet);
    }
    learnSheet.hidden = false; learnSheet.scrollTop = 0;
    learnSheet.querySelector('.learn-head button').focus({ preventScroll: true });
  }
  function closeLearn() { if (learnSheet) learnSheet.hidden = true; if (learnBtn) learnBtn.focus({ preventScroll: true }); }
  if (learnBtn) { learnBtn.hidden = !Q.learn; learnBtn.onclick = openLearn; }
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

  // The outline of some areas as one place: their edges, but those two of them share (a code used across a province
  // of two parts is one outline, not two). From these areas alone, so it costs next to nothing; where neighbours'
  // borders don't line up, a line between them stays.
  function outerEdges(areas) {
    const key = (p, q) => { const a = Math.round(p[0] * QN) + ',' + Math.round(p[1] * QN), b = Math.round(q[0] * QN) + ',' + Math.round(q[1] * QN); return a < b ? a + ' ' + b : b + ' ' + a; };
    const curved = a => /[AaCcQqSsTtHhVv]/.test(AREA[a].d); // (a tiny place drawn as a circle: its own outline, whole)
    const rings = [...new Set(areas)].filter(a => AREA[a] && !curved(a)).flatMap(a => shapeOf(SVG_SPACE, a).rings), n = new Map();
    for (const r of rings) { let p = r[r.length - 1]; for (const q of r) { const k = key(p, q); n.set(k, (n.get(k) || 0) + 1); p = q; } }
    let d = '';
    for (const r of rings) {
      let p = r[r.length - 1], on = false;
      for (const q of r) {
        const keep = n.get(key(p, q)) === 1 && (p[0] !== q[0] || p[1] !== q[1]);
        if (keep) { if (!on) d += `M${+p[0].toFixed(2)},${+p[1].toFixed(2)}`; d += `L${+q[0].toFixed(2)},${+q[1].toFixed(2)}`; }
        on = keep; p = q;
      }
    }
    return d + [...new Set(areas)].filter(a => AREA[a] && curved(a)).map(a => AREA[a].d).join('');
  }
  // The place asked (prompt 'area'): outlined, and flown to when it is out of view or too small to see.
  // ctx (MODES 'code'): { around: the larger area the place is part of, tinted blue under it with its parts' lines
  // dashed, or parts: the parts of the place that have codes of their own, dashed }; a part is shown with the larger
  // area around it in view. A dot (a city, MODES 'name'): ringed, and the map centred on it, at most a third of the map
  // wide (the region around it), unless it is in the middle of a view as narrow already.
  function showAsked(areas, ctx) {
    if (!askUse) return;
    const dots = !!areas && areas.length > 0 && (Q.dots || areas.every(a => AREA[a].dot));
    askUse.setAttribute('d', areas ? outline(areas) : '');
    if (askLine) askLine.setAttribute('d', areas ? (dots ? outline(areas) : outerEdges(areas)) : '');
    for (const p of [askUse, askLine]) if (p) p.classList.toggle('dot', dots);
    if (askCtx) { askCtx.setAttribute('d', areas && ctx ? (ctx.around ? outline(ctx.around) : ctx.parts.map(outerEdges).join('')) : ''); askCtx.setAttribute('class', ctx && ctx.around ? 'around' : 'parts'); }
    if (!areas || !areas.length) return;
    if (ctx && ctx.around) areas = [...new Set([...areas, ...ctx.around])];
    const s = scale(), bs = areas.map(boxOf_);
    const x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y)), x1 = Math.max(...bs.map(b => b.x + b.width)), y1 = Math.max(...bs.map(b => b.y + b.height));
    const ar = base.w / base.h;
    if (dots) {
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = Math.min(vb.w, base.w / 3), h = w / ar;
      if (vb.w <= base.w / 3 && Math.abs(cx - vb.x - vb.w / 2) < vb.w * .35 && Math.abs(cy - vb.y - vb.h / 2) < vb.h * .35) return;
      vb = clampV({ x: cx - w / 2, y: cy - h / 2, w, h }); apply(); return;
    }
    const inView = x0 >= vb.x && x1 <= vb.x + vb.w && y0 >= vb.y && y1 <= vb.y + vb.h;
    if (inView && Math.max(x1 - x0, y1 - y0) * s >= 24) return;
    // with room around it (four times its size, a twelfth of the map at least): its neighbours place it
    const w = Math.min(base.w, Math.max((x1 - x0) * 4, (y1 - y0) * 4 * ar, base.w / 12)), h = w / ar;
    vb = clampV({ x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h }); apply();
  }

  /* ---------- game ---------- */
  const G = { kind: Q.kinds[0].key, items: [], queue: [], i: 0, tries: 0, revealed: false, found: new Set(), picked: new Set(), cleared: false, group: null, got: [], score: 0, streak: 0, best: 0, res: [], t0: 0, retry: false, review: false, missed: [], points: 0, box: null, back: null };
  // Map play: points per answer by distance; 4,000 or more counts as close (a perfect answer for the stars).
  const FREE_MAX = 5000, FREE_CLOSE = 4000, FREE_LEGEND = ['4,000+', '2,500+', '1,000+', 'Under 1,000'];
  const DRAW_LEGEND = [`${DRAW_PASS}%+`, '', '', `Under ${DRAW_PASS}%`]; // (Draw: right or not, one try)
  const freeClass = p => p >= FREE_CLOSE ? 0 : p >= 2500 ? 1 : p >= 1000 ? 2 : 3;
  const fmtKm = km => (km < 10 ? km.toFixed(1) : Math.round(km).toLocaleString('en-US')) + ' km';
  const fmtPts = n => `${n.toLocaleString('en-US')} ${n === 1 ? 'point' : 'points'}`;
  const missTitle = $('missWrap').querySelector('h2'), MISS_TITLE = missTitle ? missTitle.textContent : '';
  const scoreLabel = $('sScore').nextElementSibling, SCORE_LABEL = scoreLabel ? scoreLabel.textContent : '';
  const legendItems = [...$('done').querySelectorAll('.legend li')], LEGEND = legendItems.map(li => li.lastChild.textContent);
  let timer = 0;
  // On from an answer: to the next question, or the round's end. A replay answered right (a card asked again after a
  // miss) waits for its rating first, Hard, Good or Easy (area-review.js), and nothing is answered meanwhile (rating).
  const onward = go => (RV ? RV.after(go) : go());
  const rating = () => !!(RV && RV.rating());

  // The answer log (assets/js/answers.js): a question's clock (from when it is asked; in pairs, from the pair before),
  // its wrong tries, and what they gave: an item of the kind (the place clicked, the name picked or typed, the wrong
  // pair) or a text typed that names none ('"' before it). Its answer is logged once its result is known, after the
  // review has graded it (r: the tries, 3 missed, as G.res has them; more: v, a measure, and the pairs' given).
  const A = { t: 0, wrong: 0, given: [], pairs: new Map() };
  const typedAs = (K, id, text) => (K.typed && K.ids.find(x => x !== id && K.typed(x, text))) ?? '"' + text;
  // (an item as its card is called on the review page: the question asked, and the first word of what is said of it)
  const labelOf = (K, x) => {
    try {
      const ask = String(K.prompt === 'text' && K.text ? K.text(x).text : K.prompt === 'photo' ? K.name(x) : K.chip(x)).split(' · ')[0].trim();
      const more = K.prompt === 'photo' || !K.chipTitle ? '' : String(K.chipTitle(x) || '').split(' · ')[0].split(', ')[0].trim();
      return more && !ask.includes(more) ? `${ask} · ${more}` : ask;
    } catch (err) { return String(x); }
  };
  function logged(id, r, more = {}) {
    if (typeof ANSWERS !== 'object') return;
    const K = KINDS[G.kind], given = (more.given || A.given).filter(x => x != null && x !== id), items = given.filter(x => !String(x).startsWith('"'));
    ANSWERS.add({ quiz: PAGE_ID, kind: K.base || G.kind, item: id, look: mapStyle + (shownBack !== 'quiz' ? '+' + shownBack : ''), mode: K.mode || (K.typed ? (K.choices ? 'list' : 'type') : 'map'),
      review: G.review, replay: G.review ? !!G.replay : G.retry, r, ms: performance.now() - A.t, v: more.v, given,
      names: Object.fromEntries([id, ...items].map(x => [x, labelOf(K, x)])), layer: (KINDS[K.base] || K).label, card: (K.cards || G.kind) + '|' + id });
  }

  // "Areas left" counter, top middle of the map, for items that need a click on each of their areas.
  const countEl = document.createElement('div');
  countEl.className = 'count'; countEl.hidden = true; countEl.setAttribute('aria-live', 'polite');
  $('stage').appendChild(countEl);
  const needAll = (K, id) => K.clickAll && !plain() && K.areas[id].length > 1;
  // An answer's name as it is told: in a mode, with the name answered where that is another (福島県 · Fukushima).
  const told = (K, id) => (K.tell ? K.tell(id) : K.answerName && K.answerName(id) !== K.name(id) ? `${K.name(id)} · ${K.answerName(id)}` : K.name(id)); // (Name it, Shape: tell, see namedTyped)
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
  // a voice of the language as tagged (zh-TW), else of its language (zh)
  const voiceOf = lang => {
    const V = speechSynthesis.getVoices(), tag = v => v.lang.replace('_', '-').toLowerCase(), l = String(lang).toLowerCase();
    return V.find(v => tag(v) === l) || V.find(v => tag(v).split('-')[0] === l.split('-')[0]);
  };
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
    if (KINDS[kind].shape) map = 'quiz'; // (a shape is asked without a map: its results and cards are the quiz map's, whatever map is picked)
    if (ONE) { map = 'free'; back = Q.back || back; }
    Object.assign(G, { kind, items, queue: ONE ? items.slice() : shuffle(items), i: 0, score: 0, streak: 0, best: 0, res: [], t0: performance.now(), retry, review, points: 0, box, back: null });
    if (KINDS[kind].depth) { const d = KINDS[kind].depth; G.queue = G.queue.map((id, n) => [id, n]).sort((x, y) => d(x[0]) - d(y[0]) || x[1] - y[1]).map(x => x[0]); } // (MODES 'code': a place's parts first, then the codes over all of it)
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
  // MODES 'code': the codes of the asked one's areas that the round still has to ask, brought up to follow it, and
  // asked with it (see MODES).
  function together(K, id) {
    const later = G.queue.slice(G.i + 1).filter((x, n, a) => x !== id && K.same(id).includes(x) && a.indexOf(x) === n);
    for (const x of later) G.queue.splice(G.queue.indexOf(x, G.i + 1), 1);
    G.queue.splice(G.i + 1, 0, ...later);
    return [id, ...later];
  }
  // … its question: which codes, and whether the place is part of a larger area or the whole of one (a line over it)
  function codeAsk(K, id) {
    const n = G.group.length, codes = n > 1 ? `${n} ${K.noun[1]} are` : `${K.noun[0]} is`, scope = K.scope(id);
    const q = scope === 'part' ? `Which ${codes} used only in this part?` : scope === 'whole' ? `Which ${codes} used across this whole area?` : n > 1 ? `Which ${n} ${K.noun[1]} are used here?` : `Which ${K.noun[0]} is this?`;
    const tag = document.createElement('span'); tag.className = 'scope ' + scope; tag.textContent = scope === 'part' ? 'Part of a larger area' : scope === 'whole' ? 'Whole area' : '';
    $('bigname').replaceChildren(...(scope ? [tag] : []), q);
  }
  function ask() {
    const id = G.queue[G.i], K = KINDS[G.kind];
    G.tries = 0; G.revealed = false; G.found = new Set(); G.picked = new Set(); G.cleared = false; G.got = [];
    A.t = performance.now(); A.wrong = 0; A.given = [];
    G.group = K.same ? together(K, id) : null;
    mark(null); syncCheck();
    const back = K.choose4 === 'pickback'; // (a pick back asks the name, in big letters)
    const isArea = K.prompt === 'area' && !back, isName = K.prompt === 'name' || isArea || back, isText = K.prompt === 'text' && !back, isPhoto = K.prompt === 'photo' && !back, isShape = !!K.shape;
    $('dial').hidden = isName || isText || isPhoto || isShape; $('bigname').hidden = !isName; $('bigname').classList.toggle('asking', isArea); $('bigname').classList.remove('signed');
    if ($('card')) $('card').hidden = !isText;
    if ($('photo')) $('photo').hidden = !isPhoto;
    shapeEl.hidden = !isShape; shapeEl.className = 'shape';
    const shown = isShape ? shapeEl : isPhoto ? $('photo') : isText ? $('card') : isName ? $('bigname') : $('dial');
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
    else if (isArea) { if (K.same) codeAsk(K, id); else $('bigname').textContent = K.ask ? K.ask : `Which ${K.noun[0]} is this?`; showAsked(K.areas[id], K.same && { around: K.around(id), parts: K.parts(id) }); }
    else if (isShape) drawShape(K, id);
    else if (isName) {
      const signed = !back && K.sign && !!$('optSign') && $('optSign').checked && K.sign(id, $('bigname'));
      if (!signed) $('bigname').textContent = back ? K.answerName(id) : K.name(id);
      if (ONE) { const tag = document.createElement('span'); tag.className = 'tier'; tag.textContent = ONE.tag(G.i); $('bigname').prepend(tag); }
      $('bigname').classList.toggle('signed', !!signed);
      if (signed) $('bigname').dataset.name = K.name(id); else delete $('bigname').dataset.name; // (the name asked, which the sign shows among others)
    }
    else if (K.dial) $('code').replaceChildren(...K.dial(id).map(([text, cls]) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; return s; }));
    else $('code').textContent = K.short(id);
    if (typedForm) {
      typedForm.hidden = !K.typed;
      if (K.inputMode) $('typed').setAttribute('inputmode', K.inputMode); else $('typed').removeAttribute('inputmode'); // (a code: the phone's digits)
      // (Name it on a touch screen: not focused, so that the phone's keyboard leaves the map in view; a name is tapped
      // in the list, or the field to type)
      if (K.typed) { $('typed').value = ''; if (!(K.named && !K.shape && matchMedia('(pointer: coarse)').matches)) $('typed').focus({ preventScroll: true }); }
    }
    marked = 0; steered = false; syncList(); syncPicks(id); syncLooks(); syncGiveUp(); syncDraw();
    // The optional hint under the prompt, e.g. the state a code is in; empty (and hidden) otherwise.
    const ask = $('ask'); ask.replaceChildren();
    if (K.detail && $('optDetail').checked) { const s = document.createElement('strong'); s.textContent = K.detail.text(id); ask.append(s); }
    if (K.same && K.same(id).length > G.group.length) ask.append((ask.childNodes.length ? ' · ' : '') + `${K.same(id).length} codes share this area: any ${G.group.length === 1 ? 'one' : G.group.length} of them`);
    if (K.same && K.scope(id)) ask.append((ask.childNodes.length ? ' · ' : '') + (K.scope(id) === 'part' ? 'The dashed line is the larger area, which has codes of its own' : 'Its parts (dashed) have codes of their own too'));
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
    if (view === 'play' && !rating() && !KINDS[G.kind].typed && !KINDS[G.kind].pairs && !KINDS[G.kind].choose4 && !KINDS[G.kind].draw) { if (KINDS[G.kind].pickAll) togglePick(area); else answer(area); }
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
    if (view !== 'play' || rating() || !K.pickAll || target === undefined || (!G.revealed && !G.picked.size)) return;
    const want = K.areas[target];
    if (G.revealed || (G.picked.size === want.length && want.every(a => G.picked.has(a)))) { answer(want[0]); return; }
    const extra = [...G.picked].filter(a => !want.includes(a)), missing = want.filter(a => !G.picked.has(a));
    for (const a of extra) {
      G.picked.delete(a); pathsOf([a])[0].classList.remove('pick'); pickLabel(a, false); flashArea(a);
    }
    for (const a of G.picked) if (!G.found.has(a)) { G.found.add(a); const p = pathsOf([a])[0]; p.classList.remove('pick'); p.classList.add('found'); }
    wrong([extra.length ? 'Not ' + extra.map(a => K.clicked(a, target)).join(', ') : '', missing.length ? `${missing.length} missing` : ''].filter(Boolean).join(' · '), extra.map(a => K.primary(a)));
    syncCheck();
  }
  if (checkBtn) checkBtn.onclick = check;
  // A typed answer: right, it counts as a click on the item's area; wrong, as a wrong click.
  const typedForm = $('typedForm');
  if (typedForm) typedForm.addEventListener('submit', e => {
    e.preventDefault();
    if (rating()) return;
    const K = KINDS[G.kind], id = G.queue[G.i];
    // An answer from a list is the name marked in it, however it was sent (Enter, OK, a phone's Go): what is typed
    // only narrows the list, it is never compared letter by letter.
    // (with nothing typed and no name marked by the arrow keys, a stray Enter answers nothing; Name it and Shape: what
    // finds no name in the list is taken as typed, and compared as in Type)
    const typedText = $('typed').value.trim();
    const text = K.choices && !folded() ? (typedText || steered ? listed[marked] || (K.named ? typedText : '') : '') : typedText; // (the list folded, or Hard mode: what is typed)
    if (K.same && view === 'play' && id !== undefined && !text && G.revealed) { giveUp(); return; } // (the codes shown: Enter goes on)
    if (view !== 'play' || !K.typed || id === undefined || !text) return;
    if (K.same) { typedCodes(K, id, text); return; }
    if (K.typed(id, text)) answer(K.areas[id][0]);
    else {
      const as = typedAs(K, id, text);
      if (K.named && !K.shape && !String(as).startsWith('"')) flash(G.kind, as); // (Name it: the place named lights up on the map, as one clicked)
      wrong(text, as); if (K.choices) { $('typed').value = ''; marked = 0; syncList(); } else $('typed').select();
    }
  });
  // An answer picked from a list (K.choices): what is typed narrows it, Enter or a click takes the one marked.
  const typedList = $('typedList'), plainOf = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const listBtn = $('typedListBtn');
  let listed = [], marked = 0, steered = false; // steered: a name marked with the arrow keys
  let listMin = !STORE.settings().listOpen; // the list folded away (as it starts): nothing offered while typing
  const folded = () => listMin || hardMode(); // (Hard mode: no list at all)
  function syncList() {
    if (!typedList) return;
    const K = KINDS[G.kind];
    if (listBtn) listBtn.hidden = !K || !K.typed || !K.choices || hardMode();
    if (!K || !K.typed || !K.choices) { typedList.hidden = true; return; }
    const q = plainOf($('typed').value.trim()), all = K.choices(), seen = new Set(), forms = K.choiceForms || (n => [plainOf(n)]); // (Name it, Shape: a name is found by each of its forms)
    const tiers = !q ? [all] : [all.filter(n => forms(n).some(f => f.startsWith(q))), all.filter(n => forms(n).some(f => f.split(/[\s,.-]+/).some(w => w.startsWith(q)))), all.filter(n => forms(n).some(f => f.includes(q)))];
    listed = tiers.flat().filter(n => !seen.has(n) && seen.add(n));
    marked = Math.max(0, Math.min(marked, listed.length - 1));
    const shown = !folded() ? listed.map((n, i) => [n, i]) : [];
    typedList.replaceChildren(...shown.map(([n, i]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'opt' + (i === marked ? ' on' : ''); b.textContent = n;
      b.setAttribute('role', 'option'); b.setAttribute('aria-selected', i === marked);
      b.onclick = () => (K.named ? pickChoice(n) : fillChoice(n));
      b.ondblclick = () => { if (K.named) return; fillChoice(n); typedForm.requestSubmit(); };
      return b;
    }));
    typedList.hidden = folded();
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
  // Name it, Shape: a name clicked answers at once. (The second click of a double click comes to the next question's
  // list: within a moment of an answer that went on to it, a click answers nothing.)
  let pickedAt = { t: 0, q: 0 }; // (q: when the question then on screen was asked, A.t)
  function pickChoice(n) {
    const now = performance.now(); if (now - pickedAt.t < 400 && A.t !== pickedAt.q) return;
    pickedAt = { t: now, q: A.t };
    $('typed').value = n; steered = true; marked = Math.max(0, listed.indexOf(n));
    typedForm.requestSubmit();
  }
  if (typedList) {
    $('typed').addEventListener('input', () => { marked = 0; steered = false; syncList(); });
    $('typed').addEventListener('keydown', e => {
      const K = KINDS[G.kind];
      if (!K || !K.choices || !listed.length) return;
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !folded()) {
        e.preventDefault(); marked = (marked + (e.key === 'ArrowDown' ? 1 : -1) + listed.length) % listed.length; steered = true; syncList();
        typedList.querySelector('.on')?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') { e.preventDefault(); typedForm.requestSubmit(); }
    });
  }
  if (listBtn) listBtn.onclick = () => {
    listMin = !listMin;
    STORE.setSettings(s => { delete s.listMin; if (listMin) delete s.listOpen; else s.listOpen = true; });
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
  // Give up (MODES 'code'): the codes shown and the question missed, then on to the next; Next once they are shown.
  const giveUpBtn = $('giveUpBtn');
  function syncGiveUp() {
    if (!giveUpBtn) return;
    const K = KINDS[G.kind]; giveUpBtn.hidden = !(view === 'play' && K && K.same);
    giveUpBtn.textContent = G.revealed ? 'Next' : 'Give up';
  }
  function giveUp() {
    const K = KINDS[G.kind], id = G.queue[G.i];
    if (view !== 'play' || rating() || !K.same || id === undefined) return;
    if (!G.revealed) {
      G.revealed = true; G.tries = MAX_TRIES; G.streak = 0;
      if (RV && !G.review) RV.missed(id); // (as a wrong answer would)
    }
    for (const x of [...G.group, ...K.same(id)]) if (G.got.length < G.group.length && !G.got.includes(x)) G.got.push(x);
    answerGroup(K);
    $('typed').focus({ preventScroll: true });
  }
  if (giveUpBtn) giveUpBtn.onclick = giveUp;
  // MODES 'code': what is typed, a code or several (apart by commas, or by spaces where each part is a code: "02 42"
  // is one code). Each code of the outline's fills a place; once all are filled the question is answered.
  function typedCodes(K, id, text) {
    const sibs = K.same(id), here = new Set(K.areas[id]), wrongs = [], notes = [];
    const tokens = text.split(/[,;+&/]|\band\b/i).map(t => t.trim()).filter(Boolean)
      .flatMap(t => (K.codeOf(t) || !/\s/.test(t) || !t.split(/\s+/).every(K.codeOf) ? [t] : t.split(/\s+/)));
    for (const t of tokens) {
      const x = K.codeOf(t);
      if (x && sibs.includes(x)) { if (!G.got.includes(x)) G.got.push(x); continue; }
      const over = x && K.areas[x].filter(a => here.has(a)).length;
      if (over) notes.push(`${K.name(x)} is used here too, but ${over === here.size ? 'across the whole larger area' : K.areas[x].length === over ? 'only in part of it' : 'over another area'}`);
      else wrongs.push(t);
    }
    $('typed').value = ''; $('typed').focus({ preventScroll: true });
    const need = G.group.length, done = G.got.length >= need, got = G.got.map(x => K.name(x)).join(' · ');
    if (done && (!wrongs.length || G.revealed)) { answerGroup(K); return; }
    const rest = `${need - G.got.length} more`, all = need === sibs.length ? sibs.map(x => K.name(x)).join(' · ') : `any ${need} of ${sibs.map(x => K.name(x)).join(' · ')}`;
    if (wrongs.length) {
      wrong(wrongs.join(', '), wrongs.map(t => K.codeOf(t) || '"' + t)); syncGiveUp(); // a try less (one for all that was typed)
      if (done) { answerGroup(K); return; }
      if (G.revealed) setFeedback($('fb'), 'bad', `✗ ${wrongs.join(', ')}`, [`→ ${all}`, ...(G.got.length ? [`✓ ${got} · ${rest}`] : [])]);
      else if (G.got.length || notes.length) $('fb').append(...[...notes, ...(G.got.length ? [`✓ ${got} · ${rest}`] : [])].map(line => { const p = document.createElement('p'); p.className = 'c'; p.textContent = line; return p; }));
      return;
    }
    if (notes.length) { setFeedback($('fb'), '', notes[0], [...notes.slice(1), G.got.length ? `✓ ${got} · ${rest}` : K.scope(id) === 'part' ? 'The question is the code(s) of this part only' : 'The question is the code(s) of the whole area']); return; }
    setFeedback($('fb'), 'ok', `✓ ${got}`, G.revealed ? [rest, `→ ${all}`] : rest);
  }
  // The codes of an outline answered: each one its own result, tick and card, as if asked one after the other.
  function answerGroup(K) {
    const members = G.queue.slice(G.i, G.i + G.group.length), names = G.got.map(x => K.name(x)).join(' · ');
    if (G.review) G.tries = RV.grade(G.tries > 0 || G.revealed); // a review grades by the clock: known, unsure or not known
    const k = RESULT_CLASS[G.tries];
    const title = G.revealed ? names : `✓ ${names}` + (G.tries ? ` · try ${G.tries + 1}` : '');
    setFeedback($('fb'), G.tries === 0 ? 'ok' : 'bad', title, K.about(members[0]));
    if (K.fresh || hardMode()) fresh();
    members.forEach((m, n) => {
      for (const p of pathsOf(K.areas[m])) { p.classList.remove('ans', 'flash', 'found', 'pick', ...RESULT_CLASS); p.classList.add(k); }
      showLabel(G.kind, m);
      const tick = $('ticks').children[G.i]; if (tick) { tick.classList.remove('now'); tick.classList.add(k); }
      G.res.push(G.tries);
      if (G.tries === 0) { G.score++; G.streak++; G.best = Math.max(G.best, G.streak); } else G.streak = 0;
      if (RV) { if (n && !G.review && G.tries) RV.asked(); RV.answered(m, G.tries === 0); } // (each missed one counts as missed)
      logged(m, G.revealed ? 3 : Math.min(A.wrong, 3));
      G.i++;
    });
    if (K.fresh || hardMode()) fresh(FRESH_MS);
    if (members.length > 1) { // the review's line about each card: one, about them all
      const fb = $('fb'), t = fb.querySelector('.t'); if (t && G.review) t.textContent = t.textContent.replace(told(K, members[members.length - 1]), names);
      const seen = new Set(); for (const p of fb.querySelectorAll('p.c')) { if (seen.has(p.textContent)) p.remove(); else seen.add(p.textContent); }
    }
    onward(() => { if (G.i >= G.queue.length) finish(); else ask(); });
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
      if (K.fresh || hardMode()) fresh();
      for (const p of pathsOf(K.areas[target])) { p.classList.remove('ans', 'flash', 'found', 'pick', ...RESULT_CLASS); p.classList.add(k); }
      if (K.rare) K.areas[target].forEach((a, i) => pathsOf(K.areas[target])[i].classList.toggle('rare', !!K.rare(target, a)));
      // (Name it: the place in the color of its answer, its outline kept, a dot without its ring; Shape: the shape)
      if (K.named) { if (K.shape) shapeEl.classList.add(k); else { askUse.setAttribute('d', ''); if (askLine.classList.contains('dot')) askLine.setAttribute('d', ''); } }
      if (K.fresh || hardMode()) fresh(FRESH_MS);
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
      logged(target, G.revealed ? 3 : Math.min(A.wrong, 3));
      G.i++;
      onward(() => { if (G.i >= G.queue.length) finish(); else ask(); });
      return;
    }
    if (K.flashArea || K.labelPerArea) flashArea(area);
    else { const clicked = K.primary(area); if (clicked) flash(G.kind, clicked); }
    wrong(K.clicked(area, target), K.primary(area));
  }
  // A wrong answer, `what` being what was clicked or typed: a try less, and after the last one the answer is shown.
  // (as: what it gave, for the answer log: an item of the kind, several, or a text)
  function wrong(what, as) {
    const K = KINDS[G.kind], target = G.queue[G.i];
    if (!G.revealed) { A.wrong++; A.given.push(...[].concat(as ?? [])); }
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

  /* ---------- shape (MODES 'shape'): the place alone, filled and outlined, scaled to fit ---------- */
  // Drawn as the map draws it: a unit of the kind's layout as one shape (shapes.js, at the detail its size here needs),
  // else its areas, each filled on its own (holes and islands kept, the seams between them closed by a line of the
  // fill's color); the outline of one shape its own, of several the edges they don't share (outerEdges). A place the
  // map draws as a circle or a dot (too small to see there) by its real outline, from its latitudes and longitudes, where
  // the map is in Web Mercator.
  const shapeEl = document.createElement('div');
  shapeEl.className = 'shape'; shapeEl.hidden = true;
  shapeEl.innerHTML = '<svg preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g class="fill"></g><path class="line"/></svg>';
  $('bigname').before(shapeEl);
  const CURVED = /[AaCcQqSsTt]/;
  function realD(a) {
    const A = AREA[a], g = Q.geo && Q.geo[a], P = Q.proj;
    if (READY && A.real && (A.dot || CURVED.test(A.d))) return A.real; // (a map made ready: its own, come with it)
    if (!(A.dot || CURVED.test(A.d)) || !g || !g.rings || !P || P.type !== 'mercator' || typeof MERCATOR !== 'object') return A.d;
    const near = P.lng0 + A.lx / P.k; // (each point within half a turn of where the map has it)
    return g.rings.map(r => 'M' + r.map(([lat, lng]) => `${+((lng + 360 * Math.round((near - lng) / 360) - P.lng0) * P.k).toFixed(3)},${+((P.y0 - MERCATOR.my(lat)) * P.k).toFixed(3)}`).join('L') + 'Z').join('');
  }
  function drawShape(K, id) {
    const areas = [...new Set(K.areas[id])], set = new Set(areas), L = layoutOf(K.base || K.key), pic = shapeEl.firstChild, [fill, line] = pic.children;
    // its box, roughly (each area a square of its size around its middle), for the detail; then its own, once drawn
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const a of areas) { const A = AREA[a], h = Math.sqrt(A.a || 0) / 2; x0 = Math.min(x0, A.lx - h); y0 = Math.min(y0, A.ly - h); x1 = Math.max(x1, A.lx + h); y1 = Math.max(y1, A.ly + h); }
    const r = pic.getBoundingClientRect(), k = Math.min(r.width / (x1 - x0 || 1), r.height / (y1 - y0 || 1));
    const T = typeof SHAPES === 'object' && SHAPES.lv && k > 0 ? bandOf(k) : 0;
    const parts = [];
    if (L) L.units.forEach((u, i) => {
      if (!set.has(u[0])) return; // (a unit's areas are all of an item, or none)
      const own = u.filter(a => !AREA[a].top && !AREA[a].dot), d = own.length > 1 && wholeOf(L, i, T);
      parts.push(...(d ? [d] : own.map(realD)), ...u.filter(a => AREA[a].top || AREA[a].dot).map(realD));
    });
    else parts.push(...areas.map(realD));
    fill.replaceChildren(...parts.map(d => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); return p; }));
    const small = areas.filter(a => AREA[a].dot || CURVED.test(AREA[a].d));
    line.setAttribute('d', parts.length === 1 ? parts[0] : outerEdges(areas.filter(a => !small.includes(a))) + small.map(realD).join(''));
    let b = null; try { b = fill.getBBox(); } catch (e) { /* (not drawn: the rough box) */ }
    if (b && b.width + b.height > 0) { x0 = b.x; y0 = b.y; x1 = b.x + b.width; y1 = b.y + b.height; }
    const pad = Math.max(x1 - x0, y1 - y0) * .04 || 1;
    pic.setAttribute('viewBox', `${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`);
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
        if (view !== 'play' || b.disabled || rating()) return;
        if (t === right) { answer(K.areas[id][0]); return; }
        if (G.revealed) return; // (the answer shown: only it goes on)
        b.disabled = true; b.classList.add('no');
        wrong(t, [...G.items, ...K.ids].find(x => word(x) === t));
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
  // The next board: the next PAIRS questions of the queue (each tile knows its place in it), and beside them as many
  // names as a board holds: theirs, and others that match none of them (of the round first, then of the kind), so the
  // last of a board is never left to match itself, nor a review's two or three cards. Both sides shuffled.
  function pairsBoard() {
    const K = KINDS[G.kind], from = G.next, upto = Math.min(G.queue.length, from + PAIRS), places = [];
    for (let i = from; i < upto; i++) places.push(i);
    G.next = upto; G.left = places.length; G.sel = null; G.wrongs = new Map();
    A.t = performance.now(); A.pairs = new Map(); // (for the answer log: each question's wrong pairs)
    const tile = (i, side, name) => {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.i = i; b.dataset.side = side;
      if (side === 'q') { b.append(pairsAsk(K, G.queue[i])); b.style.gridColumn = '1'; } else { b.textContent = b.dataset.name = name; b.style.gridColumn = '2'; }
      b.onclick = () => pairsPick(b);
      return b;
    };
    const mine = new Set(places.map(i => K.answerName(G.queue[i])));
    const others = [...new Set([...shuffle(G.items), ...shuffle(K.ids)].map(K.answerName))].filter(n => !mine.has(n)).slice(0, Math.max(0, PAIRS - mine.size));
    const qs = shuffle(places).map(i => tile(i, 'q')), as = shuffle([...places.map(i => [i, K.answerName(G.queue[i])]), ...others.map(n => [-1, n])]).map(([i, n]) => tile(i, 'a', n));
    pairsEl.replaceChildren(...qs, ...as); // (each in its column, row by row)
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
    if (b.disabled || view !== 'play' || rating()) return;
    if (!G.sel || G.sel.dataset.side === b.dataset.side) { if (G.sel) G.sel.classList.remove('sel'); G.sel = b; b.classList.add('sel'); return; }
    const first = G.sel; G.sel = null; first.classList.remove('sel');
    const K = KINDS[G.kind], q = first.dataset.side === 'q' ? first : b, a = q === first ? b : first;
    const qi = +q.dataset.i, ai = +a.dataset.i, target = G.queue[qi];
    if (K.answerName(target) !== a.dataset.name) {
      for (const t of [q, a]) { t.classList.add('no'); setTimeout(() => t.classList.remove('no'), 600); }
      for (const i of ai >= 0 ? [qi, ai] : [qi]) G.wrongs.set(i, (G.wrongs.get(i) || 0) + 1); // (a name of no question: against the question alone)
      const named = ai >= 0 ? G.queue[ai] : K.ids.find(x => K.answerName(x) === a.dataset.name); // (what each was paired with, for the answer log)
      (A.pairs.get(qi) || A.pairs.set(qi, []).get(qi)).push(named);
      if (ai >= 0) (A.pairs.get(ai) || A.pairs.set(ai, []).get(ai)).push(target);
      G.streak = 0; $('sStreak').textContent = 0;
      setFeedback($('fb'), 'bad', `✗ ${a.dataset.name}`, '');
      return;
    }
    const tries = Math.min(G.wrongs.get(qi) || 0, MAX_TRIES);
    for (const t of [q, a]) { t.disabled = true; t.classList.add(RESULT_CLASS[tries]); }
    pairsSettle(qi, tries);
    // (the last board done: the round is through, as after its last question, not ended early: see G.i in a review's finished)
    onward(() => {
      if (--G.left === 0) { if (G.next < G.queue.length) setTimeout(pairsBoard, 450); else G.ending = setTimeout(() => { G.i = G.queue.length; finish(); }, 450); }
      else if (RV) { G.i = qi; RV.asked(); } // (a review's clock: from one pair to the next)
    });
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
    logged(target, tries, { given: A.pairs.get(qi) || [] }); A.t = performance.now(); // (the next pair's clock starts)
  }

  /* ---------- draw (MODES 'draw'): the place drawn on the map, answered by how well the two match ---------- */
  // A drawing is pieces in map units, so it stays where it was drawn as the map moves: { tool, pts: [x, y, …], r: the
  // brush's half width }. The piece being drawn (live) is drawn on a canvas over the map, which leaves the map's own
  // picture as it is; let go, it is a path in that picture (#sketch), moved and drawn with it. It looks like the town
  // names' painting: yellow, half see-through, the pieces as one.
  const TOOLS = [['outline', 'Outline'], ['brush', 'Brush']], BRUSH = 14, DRAW_GRID = 600; // (BRUSH: the brush's half width in screen pixels)
  const DRAW_EDGE = 5, DRAW_OUT = .25; // (the band along the edge that is not counted, in screen pixels at the zoom drawn; the weight of what is drawn outside)
  let tool = TOOLS.some(([t]) => t === load('tool')) ? load('tool') : 'outline';
  const D = { pieces: [], old: false }; // old: the drawing is the last question's, shown with its answer until the next one begins
  const gSketch = document.createElementNS(NS, 'g'); gSketch.id = 'sketch'; svg.insertBefore(gSketch, gL);
  const liveCv = document.createElement('canvas'); liveCv.className = 'sketch-live'; svg.after(liveCv);
  function sketching() { const K = KINDS[G.kind]; return view === 'play' && !!K && !!K.draw && G.queue[G.i] !== undefined && !rating(); }
  // Where the map lies in the stage: s screen pixels to a map unit, the map's corner at (ox, oy) of the stage.
  function onStage() { const r = stageBox(), s = Math.min(r.width / vb.w, r.height / vb.h); return { r, s, ox: (r.width - vb.w * s) / 2 - vb.x * s, oy: (r.height - vb.h * s) / 2 - vb.y * s }; }
  const css = n => getComputedStyle(stage).getPropertyValue(n).trim(); // (the stage keeps the light colors on the street map)
  function sketchFrom(e) {
    if (D.old) { sketchClear(); if (hardMode()) fresh(); }
    const { r, s, ox, oy } = onStage();
    live = { id: e.pointerId, tool, pts: [(e.clientX - r.left - ox) / s, (e.clientY - r.top - oy) / s], r: BRUSH / s, t: performance.now(), len: 0 };
    liveSoon(); syncDraw();
  }
  function sketchTo(e) {
    const { r, s, ox, oy } = onStage(), p = live.pts;
    for (const c of (e.getCoalescedEvents && e.getCoalescedEvents().length ? e.getCoalescedEvents() : [e])) {
      const x = (c.clientX - r.left - ox) / s, y = (c.clientY - r.top - oy) / s, d = Math.hypot(x - p[p.length - 2], y - p[p.length - 1]) * s;
      if (d < 2) continue; // (closer than 2 screen pixels: nothing to add)
      p.push(x, y); live.len += d;
    }
    liveSoon();
  }
  // Let go: an outline closes and is filled, a brush stroke stays as it is; a tap with the outline draws nothing.
  function sketchEnd() {
    const p = live; live = null; liveSoon();
    if (p.tool === 'brush' || p.pts.length >= 6) { D.pieces.push(p); gSketch.append(pieceEl(p)); }
    syncDraw();
  }
  // A second finger: the map is moved, not drawn on. What it began just before goes; a piece drawn a while stays.
  function sketchDrop() {
    if (!live) return;
    if (performance.now() - live.t > 300 && live.len > 24) sketchEnd(); else { live = null; liveSoon(); syncDraw(); }
  }
  function sketchClear() { D.pieces = []; D.old = false; gSketch.replaceChildren(); gSketch.classList.remove('old'); syncDraw(); }
  function sketchUndo() { if (D.old || !D.pieces.length) return; D.pieces.pop(); gSketch.lastChild.remove(); syncDraw(); }
  // A piece as a path: in map units, to the map's own grain.
  const pieceD = p => { const q = v => Math.round(v * QN) / QN, a = p.pts; let d = `M${q(a[0])},${q(a[1])}`; for (let i = 2; i < a.length; i += 2) d += `L${q(a[i])},${q(a[i + 1])}`; return d + (a.length < 4 ? `L${q(a[0]) + 1 / QN},${q(a[1])}` : '') + (p.tool === 'outline' ? 'Z' : ''); };
  function pieceEl(p) {
    const el = document.createElementNS(NS, 'path'); el.setAttribute('class', p.tool); el.setAttribute('d', pieceD(p));
    if (p.tool === 'brush') el.setAttribute('stroke-width', 2 * p.r);
    return el;
  }
  // The piece being drawn, on its canvas: once a frame however many points came.
  let liveRaf = 0;
  function liveSoon() { if (!liveRaf) liveRaf = requestAnimationFrame(drawLive); }
  function drawLive() {
    liveRaf = 0;
    const { r, s, ox, oy } = onStage(), k = window.devicePixelRatio || 1, w = Math.round(r.width * k), h = Math.round(r.height * k), x = liveCv.getContext('2d');
    if (liveCv.width !== w || liveCv.height !== h) { liveCv.width = w; liveCv.height = h; } else x.clearRect(0, 0, w, h);
    if (!live) return;
    x.setTransform(k * s, 0, 0, k * s, k * ox, k * oy); x.lineCap = x.lineJoin = 'round';
    const path = new Path2D(pieceD(live)), yellow = css('--yellow');
    x.globalAlpha = .5;
    if (live.tool === 'brush') { x.strokeStyle = yellow; x.lineWidth = 2 * live.r; x.stroke(path); }
    else { x.fillStyle = yellow; x.fill(path); x.globalAlpha = 1; x.strokeStyle = css('--ink'); x.lineWidth = 2 / s; x.stroke(path); }
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
  }

  // The tools, under the question.
  const drawEl = document.createElement('div'), toolsEl = document.createElement('div');
  drawEl.className = 'drawbar'; drawEl.hidden = true; toolsEl.className = 'tools'; toolsEl.setAttribute('role', 'group'); toolsEl.setAttribute('aria-label', 'Tool');
  const drawBtn = (label, cls, onclick, key) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = label; if (key) b.title = key; b.onclick = () => { onclick(); b.blur(); }; return b; }; // (blurred: Enter is Done again)
  toolsEl.append(...TOOLS.map(([t, label]) => { const b = drawBtn(label, '', () => { tool = t; store('tool', t); syncDraw(); }); b.dataset.tool = t; return b; }));
  const undoBtn = drawBtn('Undo', 'ghost small', sketchUndo, 'Z'), clearBtn = drawBtn('Clear', 'ghost small', sketchClear), doneBtn = drawBtn('Done', 'primary', drawDone, 'Enter');
  drawEl.append(toolsEl, undoBtn, clearBtn, doneBtn);
  $('ask').after(drawEl);
  function syncDraw() {
    const on = view === 'play' && !!KINDS[G.kind] && !!KINDS[G.kind].draw, mine = !D.old && D.pieces.length > 0;
    drawEl.hidden = !on; svg.classList.toggle('sketch', on);
    for (const b of toolsEl.children) b.setAttribute('aria-pressed', b.dataset.tool === tool);
    undoBtn.disabled = !mine; clearBtn.disabled = !mine && !D.old; // (Clear takes the last question's drawing off its answer too)
    doneBtn.disabled = !(mine || (G.revealed && sketching())); // (a review's time run out: Done goes on, see area-review.js)
  }

  // How well a drawing matches the place (its areas): the area both cover, of the place and of what is drawn outside it,
  // that at DRAW_OUT of its size (a hand drawn line runs a little wide all round: the user's own drawings, 2026-10-21),
  // on the ground. Along the place's edge a band DRAW_EDGE screen pixels to each side, at the zoom the drawing was made
  // at, counts for neither. Both are drawn on a grid of DRAW_GRID cells across their box, each row counted by its real
  // size: on a map in Web Mercator a map unit at latitude φ is cos²φ of one at the equator (mercator.js); the other maps
  // are equal-area. A dot (a place too small to see: Monaco on a world map) is one dab of the brush, there where it is.
  function overlap(areas, pieces) {
    const dot = BRUSH / scale(), box = [Infinity, Infinity, -Infinity, -Infinity], add = (x0, y0, x1, y1) => { box[0] = Math.min(box[0], x0); box[1] = Math.min(box[1], y0); box[2] = Math.max(box[2], x1); box[3] = Math.max(box[3], y1); };
    const rs = pieces.map(p => p.r).sort((a, b) => a - b), edge = rs.length ? rs[rs.length >> 1] * DRAW_EDGE / BRUSH : 0; // (in map units, at the zoom of the middle piece)
    for (const a of areas) { const A = AREA[a]; if (A.dot) add(A.lx - dot, A.ly - dot, A.lx + dot, A.ly + dot); else { const b = boxOf_(a); add(b.x - edge, b.y - edge, b.x + b.width + edge, b.y + b.height + edge); } }
    for (const p of pieces) for (let i = 0, r = p.tool === 'brush' ? p.r : 0; i < p.pts.length; i += 2) add(p.pts[i] - r, p.pts[i + 1] - r, p.pts[i] + r, p.pts[i + 1] + r);
    const cell = Math.max(box[2] - box[0], box[3] - box[1]) / DRAW_GRID || 1, w = Math.ceil((box[2] - box[0]) / cell) + 2, h = Math.ceil((box[3] - box[1]) / cell) + 2;
    const grid = paint => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.setTransform(1 / cell, 0, 0, 1 / cell, 1 - box[0] / cell, 1 - box[1] / cell); x.fillStyle = x.strokeStyle = '#000'; x.lineCap = x.lineJoin = 'round';
      paint(x);
      return x.getImageData(0, 0, w, h).data;
    };
    const place = grid(x => { for (const a of areas) { const A = AREA[a]; if (A.dot) { x.beginPath(); x.arc(A.lx, A.ly, dot, 0, 2 * Math.PI); x.fill(); } else x.fill(new Path2D(A.d), 'evenodd'); } });
    const drawn = grid(x => { for (const p of pieces) { const path = new Path2D(pieceD(p)); if (p.tool === 'brush') { x.lineWidth = 2 * p.r; x.stroke(path); } else x.fill(path); } });
    // the band: the cells within `edge` of the place's own edge (where it meets what is not the place, never the lines
    // between its areas), by a distance from that edge in two passes over the grid
    const R = edge / cell, inP = k => place[k * 4 + 3] >= 128, far = new Float32Array(w * h).fill(Infinity), S = Math.SQRT2;
    if (R > 0) {
      for (let j = 0, k = 0; j < h; j++) for (let i = 0; i < w; i++, k++) { const t = inP(k); if ((i > 0 && inP(k - 1) !== t) || (i < w - 1 && inP(k + 1) !== t) || (j > 0 && inP(k - w) !== t) || (j < h - 1 && inP(k + w) !== t)) far[k] = 0; }
      for (let j = 0, k = 0; j < h; j++) for (let i = 0; i < w; i++, k++) {
        let d = far[k]; if (i > 0) d = Math.min(d, far[k - 1] + 1);
        if (j > 0) { d = Math.min(d, far[k - w] + 1); if (i > 0) d = Math.min(d, far[k - w - 1] + S); if (i < w - 1) d = Math.min(d, far[k - w + 1] + S); }
        far[k] = d;
      }
      for (let j = h - 1, k = w * h - 1; j >= 0; j--) for (let i = w - 1; i >= 0; i--, k--) {
        let d = far[k]; if (i < w - 1) d = Math.min(d, far[k + 1] + 1);
        if (j < h - 1) { d = Math.min(d, far[k + w] + 1); if (i < w - 1) d = Math.min(d, far[k + w + 1] + S); if (i > 0) d = Math.min(d, far[k + w - 1] + S); }
        far[k] = d;
      }
    }
    const P = Q.proj && Q.proj.type === 'mercator' && typeof MERCATOR === 'object' ? Q.proj : null;
    let both = 0, either = 0;
    for (let j = 0; j < h; j++) {
      const y = box[1] + (j - .5) * cell, f = P ? Math.cos(MERCATOR.latOf(P.y0 - y / P.k) * Math.PI / 180) ** 2 : 1;
      let b = 0, e = 0;
      for (let k = j * w * 4 + 3, end = k + w * 4; k < end; k += 4) {
        if (far[k >> 2] <= R) continue;
        const t = place[k] >= 128, m = drawn[k] >= 128;
        if (t && m) b++; if (t) e++; else if (m) e += DRAW_OUT;
      }
      both += b * f; either += e * f;
    }
    return either ? both / either : 0;
  }
  // Done: one try. The place is shown in the color of the result, the drawing over it and the share they have in
  // common under the name; with the place out of view the view widens to both. Then the next question.
  function drawDone() {
    const K = KINDS[G.kind], id = G.queue[G.i], pieces = D.old ? [] : D.pieces;
    if (!sketching() || live || (!pieces.length && !G.revealed)) return;
    const areas = K.areas[id], pct = Math.round(overlap(areas, pieces) * 100), ok = pct >= DRAW_PASS && !G.revealed;
    G.tries = ok ? 0 : MAX_TRIES;
    if (G.review) G.tries = RV.grade(!ok); // a review grades by the clock: known, unsure or not known
    const k = RESULT_CLASS[G.tries];
    for (const p of pathsOf(areas)) { p.classList.remove('ans', 'flash', 'found', 'pick', ...RESULT_CLASS); p.classList.add(k); }
    showLabel(G.kind, id);
    const tick = $('ticks').children[G.i]; tick.classList.remove('now'); tick.classList.add(k);
    G.res.push(G.tries);
    if (G.tries === 0) { G.score++; G.streak++; G.best = Math.max(G.best, G.streak); } else G.streak = 0;
    setFeedback($('fb'), ok ? 'ok' : 'bad', (ok ? '✓ ' : '') + told(K, id), K.about(id));
    const n = document.createElement('p'); n.className = 'pct'; n.textContent = pct + '%'; $('fb').querySelector('.t').after(n);
    if (K.photo) $('fb').prepend(thumb(K.photo(id)));
    if (K.pin) showPin(K.pin(id));
    say(id);
    D.old = true; gSketch.classList.add('old');
    const b = areas.map(boxOf_), x0 = Math.min(...b.map(r => r.x)), y0 = Math.min(...b.map(r => r.y)), x1 = Math.max(...b.map(r => r.x + r.width)), y1 = Math.max(...b.map(r => r.y + r.height));
    if (x1 < vb.x || x0 > vb.x + vb.w || y1 < vb.y || y0 > vb.y + vb.h) flyToPts([{ x: x0, y: y0 }, { x: x1, y: y1 }, ...pieces.flatMap(p => p.pts.filter((_, i) => i % 2 === 0).map((x, i) => ({ x, y: p.pts[2 * i + 1] })))]);
    if (RV) RV.answered(id, G.tries === 0);
    logged(id, ok ? 0 : 3, { v: pct });
    G.i++;
    onward(() => { if (G.i >= G.queue.length) finish(); else ask(); });
  }

  // Map play: one click anywhere answers. The city appears in the color of the points, joined to the click.
  function answerFree(p) {
    const K = KINDS[G.kind], target = G.queue[G.i], now = performance.now();
    // Nothing left to ask, a broken point, or the second click of a double click: not an answer.
    if (target === undefined || rating() || !Number.isFinite(p.x + p.y) || now - (G.lastFree || 0) < 350) return;
    G.lastFree = now;
    const a = AREA[K.areas[target][0]];
    const [km, scored] = Q.free.measure(p, target), S = ONE && ONE.points(km, p, target, G.i);
    const pts = S ? S.pts : Math.round(FREE_MAX * Math.exp(-10 * scored / Q.free.span));
    const t = G.review ? RV.grade(pts < FREE_CLOSE) : S ? ONE.cls(S.base) : freeClass(pts), k = RESULT_CLASS[t];
    for (const el of pathsOf(K.areas[target])) { el.classList.remove('ans', 'flash', ...RESULT_CLASS); el.classList.add(k); }
    showLabel(G.kind, target);
    const line = document.createElementNS(NS, 'line'), dot = document.createElementNS(NS, 'circle');
    line.setAttribute('x1', p.x); line.setAttribute('y1', p.y); line.setAttribute('x2', a.lx); line.setAttribute('y2', a.ly);
    dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
    gFree.replaceChildren(line, dot); sizeLabels();
    const tick = $('ticks').children[G.i]; tick.classList.remove('now'); tick.classList.add(k);
    G.res.push(t); G.points += pts;
    if (t === 0) { G.score++; G.streak++; G.best = Math.max(G.best, G.streak); } else G.streak = 0;
    setFeedback($('fb'), t === 0 ? 'ok' : 'bad', K.name(target), [`${fmtKm(km)} · ${S && S.mult > 1 ? `${S.base} × ${S.mult} = ` : ''}${fmtPts(pts)}`, ...(ONE ? [] : [[].concat(K.about(target))[0]])]); // (a page of one round: its places' region says nothing)
    // Bring the city into view when it lies outside what the map shows now.
    if (a.lx < vb.x || a.lx > vb.x + vb.w || a.ly < vb.y || a.ly > vb.y + vb.h) flyToPts([p, { x: a.lx, y: a.ly }]);
    if (RV && !ONE) RV.answered(target, t === 0);
    logged(target, S ? t : freeClass(pts), { v: [pts, Math.round(km * 10) / 10] });
    G.i++;
    // The last answer stays on screen for a moment before the results.
    onward(() => { if (G.i >= G.queue.length) { $('sScore').textContent = G.points.toLocaleString('en-US'); G.ending = setTimeout(finish, 1500); } else ask(); });
  }
  function finish() {
    clearInterval(timer); clearTimeout(G.ending); const ms = performance.now() - G.t0; const n = G.res.filter(t => t !== undefined).length; // (pairs: in any order)
    const K = KINDS[G.kind];
    mark(null); showAsked(null);
    for (const id of G.items) showLabel(G.kind, id);
    if (hardMode() && !K.fresh) { clearTimeout(freshTimer); G.queue.forEach((id, i) => { if (G.res[i] !== undefined) for (const p of pathsOf(K.areas[id])) p.classList.add(RESULT_CLASS[G.res[i]]); }); }
    const complete = n === G.items.length;
    const prev = G.retry || ONE ? null : bestFor(G.kind, G.items, mapStyle); // (a page of one round keeps no best: its rounds are drawn anew)
    const free = mapStyle === 'free';
    const better = !prev || (free ? G.points > (prev.p || 0) || (G.points === prev.p && ms < prev.t) : G.score > prev.s || (G.score === prev.s && ms < prev.t));
    if (!G.retry && complete && !ONE) {
      // Map play keeps two records: the most points (with its time) and the most close answers, which the stars use.
      if (free && (better || G.score > (prev ? prev.s : 0))) { keepBest(G.kind, G.items, mapStyle, { s: Math.max(G.score, prev ? prev.s : 0), t: better ? ms : prev.t, p: better ? G.points : prev.p }); saveRating(); }
      else if (!free && better) { keepBest(G.kind, G.items, mapStyle, { s: G.score, t: ms }); saveRating(); }
    }
    $('rScore').textContent = free ? G.points.toLocaleString('en-US') : `${G.score} of ${n}`;
    const most = ONE ? ONE.max(n) : n * FREE_MAX, pct = n ? Math.round((free ? G.points / most : G.score / n) * 100) : 0;
    let line = free ? `${pct}% of ${most.toLocaleString('en-US')} · ${G.score}/${n} close · ${fmt(ms)}` : `${pct}% · ${fmt(ms)} · streak ${G.best}`;
    if (prev && complete) line += better ? ' · new best' : free ? ` · best ${(prev.p || 0).toLocaleString('en-US')}` : ` · best ${prev.s}/${n}`;
    legendItems.forEach((li, i) => { li.lastChild.textContent = free ? (ONE ? ONE.legend : FREE_LEGEND)[i] : K.draw ? DRAW_LEGEND[i] : LEGEND[i]; li.hidden = !!K.draw && !G.review && !DRAW_LEGEND[i]; });
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
    $('missWrap').hidden = !missed.length; $('retryBtn').hidden = !missed.length || !!ONE;
    $('retryBtn').textContent = free ? `Retry (${missed.length})` : `Retry missed (${missed.length})`;
    if (missTitle) missTitle.textContent = free ? 'Not close' : MISS_TITLE;
    G.missed = missed.map(([id]) => id);
    show('done');
    // A perfect round puts its questions on the review stack.
    if (RV && !ONE) { if (complete && !G.retry && G.score === n) RV.learned(G.kind, G.items); RV.finished(); }
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
    if (MS && MS.kind()) { MS.pick(area); return; } // (My stats: what the player answered there)
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
  $('startBtn').onclick = () => { const cur = current(); if (ONE) start(cur.kind, ONE.draw()); else if (cur.ids.length) start(playKind(cur.kind), cur.ids, { box: cur.box }); };
  $('exploreBtn').onclick = () => {
    useMap(chosenMap); clearMap(); show('explore');
    if (!plain()) showAllLabels(Q.exploreKind);
    showCode('--'); if (ePick) ePick.value = '';
    setFeedback($('eInfo'), '', '', '');
  };
  $('restartBtn').onclick = () => start(G.kind, ONE ? ONE.draw() : G.items, { retry: G.retry, box: G.box });
  $('endBtn').onclick = () => { if (!G.res.length) { openSetup(); return; } finish(); };
  $('againBtn').onclick = () => start(G.kind, ONE ? ONE.draw() : G.items, { retry: G.retry, box: G.box });
  $('retryBtn').onclick = () => start(G.kind, G.missed, { retry: true, box: G.box });
  $('menuBtn').onclick = openSetup;
  $('eBack').onclick = openSetup;
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'Escape') { if (lightbox.hidden && learnSheet && !learnSheet.hidden) closeLearn(); lightbox.hidden = true; return; }
    // 1–4 pick one of four (choose4)
    if (/^[1-4]$/.test(e.key) && view === 'play' && KINDS[G.kind].choose4) { const o = picksEl.children[+e.key - 1]; if (o && !o.disabled) o.click(); return; }
    // Enter checks the picks (pickAll); on a button, the button's own Enter does
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && view === 'play' && KINDS[G.kind].pickAll) { e.preventDefault(); check(); return; }
    // Draw: Enter is Done, Backspace or Z undoes the last piece, Space held moves the map
    if (view === 'play' && KINDS[G.kind].draw) {
      if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') { e.preventDefault(); drawDone(); return; }
      if (e.key === 'Backspace' || e.key === 'z' || e.key === 'Z') { e.preventDefault(); sketchUndo(); return; }
      if (e.key === ' ') { e.preventDefault(); spaceHeld = true; svg.classList.add('space'); return; }
    }
    const zoomIn = e.key === '+' || e.key === '=', zoomOut = e.key === '-', reset = e.key === '0';
    if (zoomIn) zoomCenter(1.4); else if (zoomOut) zoomCenter(1 / 1.4); else if (reset) frameRound(true);
  });
  const spaceUp = () => { spaceHeld = false; svg.classList.remove('space'); };
  document.addEventListener('keyup', e => { if (e.key === ' ' && spaceHeld) { e.preventDefault(); spaceUp(); } });
  addEventListener('blur', spaceUp); // (let go elsewhere)

  /* ---------- review: learned questions come back on a schedule, timed (see ./area-review.js) ---------- */
  // Loaded from here, so quiz pages need no changes: the schedule (assets/js/srs.js), then the review mode, which
  // gets what it needs of this engine and returns the calls made above (asked, missed, grade, answered, after, rating,
  // learned, finished).
  let RV = null, MS = null; // (MS: My stats, see below)
  {
    const here = document.currentScript.src, ROOT = new URL('../../', here).href;
    const script = src => new Promise(done => { const s = document.createElement('script'); s.src = src; s.onload = done; document.head.append(s); });
    script(ROOT + 'assets/js/srs.js').then(() => script(new URL('area-review.js', here).href)).then(() => {
      RV = areaReview({
        $, Q, G, KINDS, PAGE: PAGE_ID, ROOT, RESULT_CLASS, shuffle, fmt, start, told, markOut, mark, pathsOf, showLabel, setFeedback, needAll, flyTo, onStreet, showAnswer, syncDraw,
        free: () => mapStyle === 'free', home: () => resetView(),
        reviewModes, played: () => ({ m: mapStyle, ...(shownBack !== 'quiz' ? { b: shownBack } : {}) }), // how the round on screen is played
        maps: () => (FREE ? [] : MAPS.map(m => m[0])), backs: () => BACKS.map(b => b[0]), // what the review's map picker offers
      });
      if (SHARED && SHARED.practice && view === 'setup') $('startBtn').click(); // (Practice: at once, with its review counting)
    });
    // My stats (./area-stats.js): the layer chosen, each place colored by the player's answers there; it is told when
    // to draw the view (enter), and answers kind and pick (see activeKind, explore).
    script(new URL('area-stats.js', here).href).then(() => {
      MS = areaStats({ $, Q, KINDS, PAGE: PAGE_ID, AREAS, pathsOf, mark, setFeedback, showLabels, plain, chosen: () => choiceKind(), enter: () => { useMap(chosenMap); clearMap(); show('explore'); } });
    });
  }

  // Practice (see "practice" above): played the way and on the map it asks for.
  if (SHARED && SHARED.practice) {
    chosenMode = modesOf(SHARED.kind).includes(params.get('mode')) ? params.get('mode') : 'map';
    if (MAPS.some(([m]) => m === params.get('map'))) chosenMap = params.get('map');
    if (BACKS.some(([b]) => b === params.get('back'))) chosenBack = params.get('back');
  }
  openSetup();
  requestAnimationFrame(frameRound);
})();
