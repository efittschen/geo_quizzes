// The QUIZ contract: what a page's config (engine/types/layer.js, engine/types/city.js, engine/types/post.js, …) gives the engine, and
// readQuiz, which takes it as the page says (its <body>'s data-kinds and data-key).
//
// The map
//   areas          [{ id, d, lx, ly, a, s, g, top, dot, w, real }]: an area's outline (SVG path in map units), label
//                  point and size on the map (made by the map's build, never worked out here), size on the ground (s:
//                  "largest area"), hint group (g), drawn above its neighbours (top), drawn as a dot of a size on the
//                  screen (dot) or on the ground (w, in map units), its own outline where it is drawn as a circle (real),
//                  a dot of one layer only (only: drawn and tapped while a layer it is of is on the map; readQuiz)
//   borders        [d]: lines drawn above the areas (state lines)
//   context        a path drawn under the areas, not tapped (a world quiz's places not asked; a board's frames)
//   base           { land, lines }: a city quiz's country and region borders under its dots; dots: true
//   size, pad      the map's size [w, h] in map units and its padding; home: [x0, y0, x1, y1], the part shown at first
//   maxZoom, labelScale, fly: { pad, min }, flyAnswer   how far it zooms, its labels' size, how it flies to a place
//   proj, kpu      its Web Mercator projection (see mercator.js) and km per map unit; worldMap: its map is the world's
//   outlineOf(id)  an area's outline, where the page leaves them for later (<body data-outlines>: map/shapes.js)
//   board          the map is a board of tiles (engine/types/lang.js)
// The quiz
//   key            the quiz's short name (what it kept before its record had the page's name; data-key replaces it)
//   kinds          what can be asked, one kind per layer of items (see model/kinds.js)
//   rounds         hand-made rounds (else the standard rule, model/rounds.js)
//   later          the kinds whose words come when they are opened (<body data-words>: engine/app/words.js)
//   explore(area) -> { code, title, sub, photos }; exploreKind; exploreList { label, items: [{ label, areas, rare,
//                  code, title, sub }] }; learn { title, sub, sections: [{ title, sub, areas, photos }] }
//   hintLabel, hintsDefault, lettersLabel   the options' texts and defaults
//   free           map play: { span, measure(point, id) -> [km shown, km scored] }
//   single         a page of one round (Easy to Hard): { draw(), points, tag, cls }; back: its background
//   langLabel      the languages chosen once for all rounds, under this heading
// Worked out here: grouping (the layers that only group), maps and backs (the maps a round is played on, a city
// quiz's backgrounds), and a layer's places too small to tap drawn as dots (DOTS).
//
// DOTS (data/quizzes/<page>/dots.js, made by tools/builds/tap-dots from its list): { layer: [[x, y, area, …], …] }, a
// dot at x, y in map units for those areas of the layer. Each dot is an area of its own, of that layer only: an item
// with one of those areas has the dot among its areas, a tap on them is a tap on the dot (dotOf), and it is asked in
// their place (model/kinds.js: askAreas). The areas stay as they are, in the layer and in every other.

export function readQuiz(QUIZ, data, dots) {
  const Q = { ...QUIZ };
  // a page shows only the kinds its <body> names (one config, several pages)
  if (data.kinds) { const keep = data.kinds.split(/\s+/); Q.kinds = Q.kinds.filter(k => keep.includes(k.key)); }
  if (dots) {
    const byId = new Map(Q.areas.map(a => [String(a.id), a])), added = [], standsAll = {};
    Q.kinds = Q.kinds.map(k => {
      const list = dots[k.key]; if (!list) return k;
      const of = {}, stands = {};
      list.forEach(([x, y, ...areas], i) => {
        const first = byId.get(String(areas[0])); if (!first) return;
        const id = `dot:${k.key}:${i}`;
        added.push({ id, d: `M${x},${y}l0,0`, lx: x, ly: y, a: 0, g: first.g, dot: true, only: true });
        stands[id] = standsAll[id] = areas.map(String);
        for (const a of stands[id]) of[a] = id;
      });
      const base = a => (stands[a] ? stands[a][0] : a), own = k.areasOf;
      return {
        ...k,
        areasOf: id => { const list = own(id) || [], mine = [...new Set(list.map(a => of[a]).filter(Boolean))]; return mine.length ? [...list, ...mine] : list; },
        dotOf: a => of[a],
        ...(k.primary ? { primary: a => k.primary(base(a)) } : {}),
        ...(k.clicked ? { clicked: a => k.clicked(base(a)) } : {}),
        ...(k.areaLabel ? { areaLabel: a => k.areaLabel(base(a)) } : {}),
      };
    });
    Q.areas = [...Q.areas, ...added]; // (last: a dot is drawn above the areas)
    if (QUIZ.explore) Q.explore = a => QUIZ.explore(standsAll[a] ? standsAll[a][0] : a);
  }
  if (data.key) Q.key = data.key;
  // a layer that only groups the layers below it into rounds is not asked itself
  Q.grouping = Q.kinds.filter(k => k.groupsOnly);
  Q.kinds = Q.kinds.filter(k => !k.groupsOnly);
  if (!Q.kinds.some(k => k.key === Q.exploreKind)) Q.exploreKind = Q.kinds[0].key;
  // The maps its rounds are played on, the first the one chosen at first: a city quiz by distance (free) or on its
  // dots, on a background; a country's map of areas also on the street map's tiles (overlay, street, bare, sat); any
  // other the quiz map alone.
  const areaMap = !!Q.proj && !Q.worldMap && !Q.dots;
  Q.maps = Q.free ? ['free', 'quiz'] : areaMap ? ['quiz', 'overlay', 'street', 'bare', 'sat'] : ['quiz'];
  Q.backs = Q.free ? ['quiz', 'overlay', 'street', 'bare', 'sat'] : [];
  return Q;
}
