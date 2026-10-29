// The maps a round is played on, on a map with a projection (a board of tiles has none), and what lies under it: the
// quiz map; the overlay (the quiz map tinting the street map's tiles); the street map, the bare map (its tiles without
// borders) and the satellite map (EOX Sentinel-2, never Google), the areas there only to be tapped (blind); map play
// (free). A city quiz has a background of these too. Street View coverage over any of them. The tiles are
// engine/lib/map-tiles.js (shared with the town-name quizzes), loaded when first asked for.
//
//   const tiles = makeTiles(quiz, shapes, view, { root })
//   tiles.use(name, keep)    the map shown; keep: the same place (the picker changed it), else from its whole
//   tiles.back(name)         a city quiz's background
//   tiles.coverage(on)       Street View coverage
//   tiles.shown              the map shown; tiles.onStreet(), tiles.plain(), tiles.overlaid()
//   tiles.near()             the tiles follow the view

const STREETS = ['street', 'overlay', 'bare', 'sat'], PLAIN = ['street', 'bare', 'sat'];

export function makeTiles(quiz, { stage, svg }, view, { root }) {
  // (on the street map's tiles the map zooms in as far as they go, level 19: 256 · 2^19 / 360 / k screen pixels to a
  // map unit, k its units to a degree of longitude)
  const deepest = quiz.proj ? 256 * 2 ** 19 / 360 / quiz.proj.k : 0;
  // (opened out of sight by the review page: no map is looked at)
  const unseen = window.parent !== window && new URLSearchParams(location.search).has('cards');
  let tiles = null, waiting = null, shown = 'quiz', back = 'quiz', cover = false, covered = false, meta = null;

  function withTiles(then) {
    if (!quiz.proj || unseen) return;
    if (tiles) return then();
    if (waiting) return waiting.push(then);
    waiting = [then];
    const s = document.createElement('script');
    s.src = root + 'engine/lib/map-tiles.js';
    s.onload = () => { tiles = mapTiles(stage, quiz); for (const f of waiting) f(); };
    document.head.append(s);
  }
  const onStreet = () => STREETS.includes(shown);
  function streets() {
    const on = onStreet() || back !== 'quiz';
    svg.classList.toggle('streets', on);
    if (on || tiles) withTiles(() => {
      const look = onStreet() ? shown : back;
      tiles.street(look === 'quiz' ? null : look === 'bare' || look === 'sat' ? look : 'street');
      view.render();
    });
  }
  function coverage() {
    if (!quiz.proj || (!cover && !covered)) return;
    covered = true;
    const dir = root + 'data/site/coverage';
    (meta ||= fetch(dir + '/meta.json').then(r => r.json())).then(m => withTiles(() => { tiles.coverage(dir, m).show(cover); view.render(); }));
  }
  function near() {
    if (!tiles) return;
    const r = view.stageBox(), v = view.get(), s = Math.min(r.width / v.w, r.height / v.h);
    if (s) tiles.view(v.x - (r.width / s - v.w) / 2, v.y - (r.height / s - v.h) / 2, s);
  }

  return {
    use(name, keep) {
      shown = name;
      svg.classList.toggle('overlay', name === 'overlay'); svg.classList.toggle('blind', PLAIN.includes(name));
      view.deep(onStreet() ? deepest : 0);
      streets();
      if (keep) view.keep(); else view.home();
      coverage();
    },
    back(name) { back = name; svg.classList.toggle('plain', PLAIN.includes(name)); streets(); },
    coverage(on) { cover = on; coverage(); },
    near,
    get shown() { return shown; }, get backShown() { return back; },
    onStreet, plain: () => PLAIN.includes(shown), overlaid: () => shown === 'overlay',
  };
}
