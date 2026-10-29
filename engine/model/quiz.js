// The QUIZ contract: what a page's config (engine/types/layer.js, engine/types/city.js, engine/types/post.js, …) gives the engine, and
// readQuiz, which takes it as the page says (its <body>'s data-kinds and data-key).
//
// The map
//   areas          [{ id, d, lx, ly, a, s, g, top, dot, w, real }]: an area's outline (SVG path in map units), label
//                  point and size on the map (made by the map's build, never worked out here), size on the ground (s:
//                  "largest area"), hint group (g), drawn above its neighbours (top), drawn as a dot of a size on the
//                  screen (dot) or on the ground (w, in map units), its own outline where it is drawn as a circle (real)
//   borders        [d]: lines drawn above the areas (state lines)
//   context        a path drawn under the areas, not tapped (a world quiz's places not asked; a board's frames)
//   base           { land, lines }: a city quiz's country and region borders under its dots; dots: true
//   size, pad      the map's size [w, h] in map units and its padding; home: [x0, y0, x1, y1], the part shown at first
//   maxZoom, labelScale, fly: { pad, min }, flyAnswer   how far it zooms, its labels' size, how it flies to a place
//   proj, kpu      its Web Mercator projection (see mercator.js) and km per map unit; worldMap: its map is the world's
//   board          the map is a board of tiles (engine/types/lang.js)
// The quiz
//   key            the quiz's short name (what it kept before its record had the page's name; data-key replaces it)
//   kinds          what can be asked, one kind per layer of items (see model/kinds.js)
//   rounds         hand-made rounds (else the standard rule, model/rounds.js)
//   explore(area) -> { code, title, sub, photos }; exploreKind; exploreList { label, items: [{ label, areas, rare,
//                  code, title, sub }] }; learn { title, sub, sections: [{ title, sub, areas, photos }] }
//   hintLabel, hintsDefault, lettersLabel   the options' texts and defaults
//   free           map play: { span, measure(point, id) -> [km shown, km scored] }
//   single         a page of one round (Easy to Hard): { draw(), points, tag, cls }; back: its background
//   langLabel      the languages chosen once for all rounds, under this heading
// Worked out here: grouping (the layers that only group), maps and backs (the maps a round is played on, a city
// quiz's backgrounds).

export function readQuiz(QUIZ, data) {
  const Q = { ...QUIZ };
  // a page shows only the kinds its <body> names (one config, several pages)
  if (data.kinds) { const keep = data.kinds.split(/\s+/); Q.kinds = Q.kinds.filter(k => keep.includes(k.key)); }
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
