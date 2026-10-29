// Easy to Hard: a round is five places, one of each position MapTap asked them at on its days (cities.js: pos, 1 to 5:
// easy to hard; a place asked on several days is there for each), no name twice, drawn anew at every start, and
// scored as MapTap scores (maptap.gg: js/location-detection.js, the
// round scoring of its page and data/scoring-config.json, read 2026-10-27):
//   - the distance's score, 0 to 100: 100 · e^(−3.5 · km / 16,250), km rounded; from 16,250 km 1, from 16,750 km 0
//   - a tap in the place's country is raised to 25 + 0.75 · that score, one on land in its continent to 10 + 0.9 ·
//     that score, neither above 80 (and never below the score itself); a place at sea has neither
//   - times the position's multiplier: 1, 1, 2, 3, 3 (Easy, Easy, Medium, Hard, Hard): 1,000 a round at most
// The country and continent of a tap are those of the world map at its point (world.js, Natural Earth), as MapTap
// finds them at its own; a place's are worked out with it once (cities.js: cc, ct; a point just off the map's coast:
// the nearest outline within 25 km, see tools/builds/world-places/build.py). Loaded after world.js and cities.js,
// before city-config.js, which takes CITY_OPTS.single.
const WORLD_PLACES = (() => {
  const MULT = [1, 1, 2, 3, 3], TIER = ['Easy', 'Easy', 'Medium', 'Hard', 'Hard'];
  const POS = [0, 1, 2, 3, 4].map(i => CITIES.list.filter(c => c.pos.includes(i + 1)).map(c => c.id));
  const BY = Object.fromEntries(CITIES.list.map(c => [c.id, c]));
  // (the world map's places without a code of their own count as the country they lie in)
  const CODE = { Somaliland: 'SO', 'Turkish Republic of Northern Cyprus': 'CY' };
  // (each with the box of all its parts: world.js's b is that of its main one only, without Sicily or Hawaii)
  const boxOf = d => { const n = d.match(/-?\d*\.?\d+/g).map(Number), b = [Infinity, Infinity, -Infinity, -Infinity]; for (let i = 0; i + 1 < n.length; i += 2) { b[0] = Math.min(b[0], n[i]); b[2] = Math.max(b[2], n[i]); b[1] = Math.min(b[1], n[i + 1]); b[3] = Math.max(b[3], n[i + 1]); } return b; };
  const PLACES = WORLD.reg.map(r => ({ code: r.i2 && r.i2.length === 2 ? r.i2 : CODE[r.n] || null, c: r.c, d: r.d, path: null })).filter(r => r.code).map(r => ({ ...r, b: boxOf(r.d) }));
  const cx = document.createElement('canvas').getContext('2d');
  // The place of the world map at a map point: { code, c }, or null at sea.
  function at(x, y) {
    x = ((x % WORLD.w) + WORLD.w) % WORLD.w;
    for (const r of PLACES) {
      if (x < r.b[0] || x > r.b[2] || y < r.b[1] || y > r.b[3]) continue;
      if (cx.isPointInPath(r.path ||= new Path2D(r.d), x, y)) return r;
    }
    return null;
  }
  // Five places, one of each position, no name twice.
  function draw() {
    const used = new Set();
    return POS.map(ids => {
      const left = ids.filter(id => !used.has(BY[id].en)), id = left[Math.random() * left.length | 0];
      used.add(BY[id].en); return id;
    });
  }
  // A tap at map point p, km from place id, asked at position i (0 to 4): { base: 0 to 100, mult, pts }.
  function points(km, p, id, i) {
    const d = Math.round(km), f = d >= 16250 ? (d < 16750 ? 0.01 : 0) : Math.exp(-3.5 * d / 16250);
    const score = Math.round(Math.max(0, Math.min(100, 100 * f)));
    const tap = at(p.x, p.y), aim = BY[id];
    const floor = !tap || !aim.cc ? 0 : tap.code === aim.cc ? 25 : tap.c === aim.ct ? 10 : 0;
    const base = floor ? Math.round(Math.max(score, Math.min(floor + score / 100 * (100 - floor), 80))) : score;
    return { base, mult: MULT[i], pts: base * MULT[i] };
  }
  return {
    draw, points,
    tag: i => `${TIER[i]} ×${MULT[i]}`,
    max: n => MULT.slice(0, n).reduce((s, m) => s + 100 * m, 0),
    // the colors of an answer by its score before the multiplier, and the legend of the results
    cls: base => (base >= 80 ? 0 : base >= 50 ? 1 : base >= 20 ? 2 : 3),
    legend: ['80+', '50+', '20+', 'Under 20'],
  };
})();
