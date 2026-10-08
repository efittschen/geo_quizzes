/* Quiz maps in Web Mercator: the projection of the street map and of GeoGuessr's own map. A quiz is then practised on
   the shapes a player guesses on, with every part of a country at its real place (no boxes for Alaska or the
   Azores), and the street map fits under a quiz map as it is, north up.

   The map files are older than this choice. They hold each map drawn in an equal-area projection of its own, far-off
   parts in boxes, and beside it the same shapes as latitude and longitude (geo.js; a cities.js has every city's).
   This file redraws a page's map when the page loads, before its quiz is built, and changes nothing else: ids, names
   and tables stay. quiz-page.js loads it on every quiz page; the scripts that build on a map call it first:

     MERCATOR.quiz(Q)        area-quiz.js, for an area quiz: every area from its rings in Q.geo, the borders through
                             the areas themselves (their old and new outlines match point for point) or the old
                             projection, the neighbouring land through the old projection: Q.proj where the map file
                             names it, else worked out from the areas. Pins follow their latitude and longitude.
     MERCATOR.cities(C)      city-config.js and paint-quiz.js, for a cities.js: its land, region borders and
                             neighbours, a part in a box by the cities in it; city-config.js places the dots.
     MERCATOR.names(N, m)    paint-quiz.js, for the town names on that map (m: what cities() returned): the places,
                             the 80% areas and the grid of the painting. The brush keeps its size on the ground.

   A map keeps its width in map units; its height follows from Mercator. Its `proj` is then
   { type: 'mercator', k, lng0, y0 }: k map units per degree of longitude, lng0 its west edge, y0 its north edge as
   Mercator's y in degrees. x = (lng − lng0) · k, y = (y0 − my(lat)) · k.

   A redrawn map lies on the plain map of the world (world.js, which tools/worldmap.mjs draws in the same
   projection): MERCATOR.world(proj, w) says where that map goes under it. So a page's own neighbouring land is no
   longer drawn, and neither are the boxes that framed its far-off parts.

   A map that cannot be redrawn stays as it was, and MERCATOR.left says why (an area without latitude and longitude:
   the road quizzes). MERCATOR.notes lists what was left out of a map that was redrawn. */
const MERCATOR = (() => {
  const RAD = Math.PI / 180, r1 = v => Math.round(v * 10) / 10;
  const my = lat => Math.log(Math.tan(Math.PI / 4 + Math.max(-85.05, Math.min(85.05, lat)) * RAD / 2)) / RAD; // Mercator's y, in degrees
  const latOf = y => (2 * Math.atan(Math.exp(y * RAD)) - Math.PI / 2) / RAD;
  const left = [], notes = [], done = []; // done: what was redrawn on this page, and how long it took

  // A map W units wide over the box [[south, west], [north, east]].
  function frame([[s, w], [n, e]], W) {
    const k = W / (e - w), top = my(n), mid = latOf((top + my(s)) / 2);
    return {
      w: W, h: Math.ceil((top - my(s)) * k), kpu: Math.round(111.32 * Math.cos(mid * RAD) / k * 1e4) / 1e4,
      proj: { type: 'mercator', k, lng0: w, y0: top },
      at: (lat, lng) => [(lng - w) * k, (top - my(lat)) * k],
    };
  }
  // The box around points [lat, lng], as frame() takes it.
  const boxOf = () => { let s = 90, w = Infinity, n = -90, e = -Infinity; return { add(lat, lng) { if (lat < s) s = lat; if (lat > n) n = lat; if (lng < w) w = lng; if (lng > e) e = lng; }, get: () => [[s, w], [n, e]] }; };

  /* ---------- the old projections ---------- */
  // d3's geoConicEqualArea as a map file records it: a map point -> [lat, lng], with lng running on past 180
  // (Chukotka follows Siberia); null off the projection.
  function conic(P) {
    const sy0 = Math.sin(P.parallels[0] * RAD), n = (sy0 + Math.sin(P.parallels[1] * RAD)) / 2, c = 1 + sy0 * (2 * n - sy0), r0 = Math.sqrt(c) / n;
    const raw = (l, f) => { const r = Math.sqrt(c - 2 * n * Math.sin(f)) / n; return [r * Math.sin(l * n), r0 - r * Math.cos(l * n)]; };
    const cen = P.center || [0, 33.6442], [cx, cy] = raw(cen[0] * RAD, cen[1] * RAD);
    return fan({ n, c, lng0: -P.rotate[0], k: P.scale, tx: P.translate[0] - P.scale * cx, ty: P.translate[1] - P.scale * (r0 - cy) });
  }
  // The same projection by its bare numbers: X = tx + r · sin(n·dλ), Y = ty + r · cos(n·dλ), r = k · √(c − 2n·sin φ) / n.
  function fan({ n, c, lng0, k, tx, ty }) {
    return {
      at(lat, lng) { const r = k * Math.sqrt(Math.max(0, c - 2 * n * Math.sin(lat * RAD))) / n, a = n * (lng - lng0) * RAD; return [tx + r * Math.sin(a), ty + r * Math.cos(a)]; },
      ll(X, Y) {
        const dx = X - tx, dy = Y - ty, sg = Math.sign(n), r = Math.hypot(dx, dy), s = (c - (r * n / k) ** 2) / (2 * n);
        return Math.abs(s) > 1 ? null : [Math.asin(s) / RAD, lng0 + Math.atan2(dx * sg, dy * sg) / n / RAD];
      },
    };
  }
  // d3's geoAlbersUsa: the lower 48, and Alaska and Hawaii each in a box with a projection of its own.
  function albersUsa({ scale: k, translate: [tx, ty] }) {
    const main = conic({ parallels: [29.5, 45.5], rotate: [96, 0], center: [-0.6, 38.7], scale: k, translate: [tx, ty] });
    const parts = [
      { box: [tx - 0.425 * k, ty + 0.12 * k, tx - 0.214 * k, ty + 0.234 * k], ...conic({ parallels: [55, 65], rotate: [154, 0], center: [-2, 58.5], scale: 0.35 * k, translate: [tx - 0.307 * k, ty + 0.201 * k] }) },
      { box: [tx - 0.214 * k, ty + 0.166 * k, tx - 0.115 * k, ty + 0.234 * k], ...conic({ parallels: [8, 18], rotate: [157, 0], center: [-3, 19.9], scale: k, translate: [tx - 0.205 * k, ty + 0.212 * k] }) },
    ];
    return { main, parts };
  }
  const inBox = (b, x, y) => x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];
  // A map point -> [lat, lng] through a projection and the parts drawn in boxes on it.
  const placer = (main, parts) => (x, y) => { for (const p of parts) if (inBox(p.box, x, y)) return p.ll(x, y); return main.ll(x, y); };
  // … and a projection worked out from pairs [x, y, lat, lng] where the map file does not name it: least squares over
  // the six numbers (Levenberg–Marquardt). Returns the projection and how far it misses the pairs, in map units.
  function fit(pairs) {
    const lat0 = pairs.reduce((s, p) => s + p[2], 0) / pairs.length, lng0 = pairs.reduce((s, p) => s + p[3], 0) / pairs.length;
    const xs = pairs.map(p => p[0]), lngs = pairs.map(p => p[3]);
    const n0 = Math.abs(Math.sin(lat0 * RAD)) < 0.02 ? 0.02 * (lat0 < 0 ? -1 : 1) : Math.sin(lat0 * RAD);
    const kx = (Math.max(...xs) - Math.min(...xs)) / ((Math.max(...lngs) - Math.min(...lngs)) * RAD * Math.cos(lat0 * RAD) || 1);
    const make = v => fan({ n: v[0], c: v[1], lng0: v[2], k: v[3], tx: v[4], ty: v[5] });
    const miss = v => { const f = make(v), out = new Float64Array(2 * pairs.length); pairs.forEach((p, i) => { const [x, y] = f.at(p[2], p[3]); out[2 * i] = x - p[0]; out[2 * i + 1] = y - p[1]; }); return out; };
    const sum = e => { let s = 0; for (const x of e) s += x * x; return Number.isFinite(s) ? s : Infinity; };
    // start: one standard parallel through the middle, the pole placed by the pairs' mean
    let v = [n0, 1 + n0 * n0, lng0, kx, 0, 0];
    { const e = miss(v); let ex = 0, ey = 0; for (let i = 0; i < pairs.length; i++) { ex += e[2 * i]; ey += e[2 * i + 1]; } v[4] = -ex / pairs.length; v[5] = -ey / pairs.length; }
    let e = miss(v), cost = sum(e), damp = 1e-3;
    for (let it = 0; it < 80 && cost > 1e-6 * pairs.length; it++) {
      const J = [], step = [1e-6, 1e-6, 1e-5, 1e-4, 1e-3, 1e-3];
      for (let j = 0; j < 6; j++) { const u = v.slice(); u[j] += step[j] * Math.max(1, Math.abs(v[j])); const d = miss(u), h = u[j] - v[j]; J.push(d.map((x, i) => (x - e[i]) / h)); }
      const A = [...Array(6)].map(() => Array(6).fill(0)), g = Array(6).fill(0);
      for (let a = 0; a < 6; a++) { for (let b = a; b < 6; b++) { let s = 0; for (let i = 0; i < e.length; i++) s += J[a][i] * J[b][i]; A[a][b] = A[b][a] = s; } let s = 0; for (let i = 0; i < e.length; i++) s += J[a][i] * e[i]; g[a] = s; }
      let moved = false;
      for (let tries = 0; tries < 12 && !moved; tries++) {
        const M = A.map((row, i) => row.map((x, j) => (i === j ? x * (1 + damp) : x))), d = solve(M, g.map(x => -x));
        const u = d && v.map((x, i) => x + d[i]), eu = u && miss(u), cu = u ? sum(eu) : Infinity;
        if (cu < cost) { moved = cost - cu > 1e-7 * cost; v = u; e = eu; cost = cu; damp /= 4; } else damp *= 6;
      }
      if (!moved) break;
    }
    const d = []; for (let i = 0; i < pairs.length; i++) d.push(Math.hypot(e[2 * i], e[2 * i + 1])); d.sort((a, b) => a - b);
    return { ...make(v), median: d[d.length >> 1], most: d[Math.floor(d.length * 0.98)] };
  }
  // … and for a map in some other projection: a map point -> [lat, lng] by the pairs [x, y, lat, lng] nearest to
  // it (the six nearest, a plane through them); null where none is near.
  function nearby(pairs) {
    const CELL = 12, grid = new Map(), cell = (x, y) => Math.floor(x / CELL) * 1e5 + Math.floor(y / CELL);
    for (const p of pairs) { const k = cell(p[0], p[1]); (grid.get(k) || grid.set(k, []).get(k)).push(p); }
    return (x, y) => {
      let found = [];
      for (let r = 1; r <= 6 && found.length < 6; r++) { found = []; for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) for (const p of grid.get(cell(x + i * CELL, y + j * CELL)) || []) found.push(p); }
      if (found.length < 3) return null;
      const near = found.map(p => [(p[0] - x) ** 2 + (p[1] - y) ** 2, p]).sort((a, b) => a[0] - b[0]).slice(0, 6).map(e => e[1]);
      // least squares: lat and lng as planes over (x, y) around the point
      const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], bl = [0, 0, 0], bn = [0, 0, 0];
      for (const [px, py, lat, lng] of near) { const v = [1, px - x, py - y]; for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) A[i][j] += v[i] * v[j]; bl[i] += v[i] * lat; bn[i] += v[i] * lng; } }
      const a = solve(A.map(r => r.slice()), bl), b = solve(A, bn);
      return a && b ? [a[0], b[0]] : [near[0][2], near[0][3]];
    };
  }
  function solve(A, b) { // Gauss elimination
    const n = b.length, M = A.map((r, i) => [...r, b[i]]);
    for (let i = 0; i < n; i++) {
      let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
      if (Math.abs(M[p][i]) < 1e-300) return null;
      [M[i], M[p]] = [M[p], M[i]];
      for (let r = i + 1; r < n; r++) { const f = M[r][i] / M[i][i]; for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]; }
    }
    const x = Array(n);
    for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let c = i + 1; c < n; c++) s -= M[i][c] * x[c]; x[i] = s / M[i][i]; }
    return x.every(Number.isFinite) ? x : null;
  }

  /* ---------- paths ---------- */
  // The runs of points of an SVG path of straight lines (M L H V Z, either case, also without their letters);
  // null when it has anything else (an arc: an area drawn as a circle).
  function runs(d) {
    if (!d || /[^MLHVZmlhvz\d\s,.eE+-]/.test(d)) return null;
    const out = [], re = /([MLHVZmlhvz])|(-?\d*\.?\d+(?:e-?\d+)?)/g;
    let cmd = '', nums = [], x = 0, y = 0, run = null, m;
    const flush = () => {
      const C = cmd.toUpperCase(), rel = cmd !== C;
      if (C === 'H' || C === 'V') for (const v of nums) { if (C === 'H') x = rel ? x + v : v; else y = rel ? y + v : v; run.pts.push([x, y]); }
      else for (let i = 0; i + 1 < nums.length; i += 2) {
        x = rel ? x + nums[i] : nums[i]; y = rel ? y + nums[i + 1] : nums[i + 1];
        if (C === 'M' && i === 0) out.push(run = { pts: [], closed: false });
        run.pts.push([x, y]);
      }
      nums = [];
    };
    while ((m = re.exec(d))) {
      if (m[1]) { if (cmd) flush(); cmd = m[1]; if (cmd === 'Z' || cmd === 'z') { if (run) { run.closed = true; [x, y] = run.pts[0]; } cmd = ''; } }
      else { if (!cmd) cmd = 'L'; nums.push(+m[2]); }
    }
    if (cmd) flush();
    return out;
  }
  const write = list => list.map(r => { let s = '', last = ''; for (const [x, y] of r.pts) { const p = r1(x) + ',' + r1(y); if (p !== last) s += (s ? 'L' : 'M') + p; last = p; } return s + (r.closed ? 'Z' : ''); }).join('');
  // A path through a change of place (x, y) -> [x, y] or null; points that cannot be placed are left out, and so are,
  // if asked, the boxes that framed a far-off part (a run of four upright and level sides).
  const boxed = r => r.pts.length >= 4 && r.pts.length <= 5 && r.pts.every((p, i) => { const q = r.pts[(i + 1) % r.pts.length]; return Math.abs(p[0] - q[0]) < 1e-6 || Math.abs(p[1] - q[1]) < 1e-6; });
  function redraw(d, to, noBoxes) {
    const list = runs(d); if (!list) return null;
    return write(list.filter(r => !(noBoxes && boxed(r))).map(r => ({ closed: r.closed, pts: r.pts.map(([x, y]) => to(x, y)).filter(Boolean) })).filter(r => r.pts.length > 1));
  }
  // Where the world's map (world.js: W.proj) goes under a map with projection P that is w map units wide: a list of
  // [scale, dx, dy], one per turn of the globe the map reaches into (a country over the 180th meridian needs two).
  function world(W, P, w) {
    const s = P.k / W.proj.k, out = [];
    for (const t of [0, -1, 1]) { const dx = (360 * t - 180 - P.lng0) * P.k; if (dx < w && dx + 360 * P.k > 0) out.push([s, dx, (P.y0 - W.proj.y0) * P.k]); }
    return out;
  }
  const shoelace = pts => { let a = 0, cx = 0, cy = 0; for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length], c = x0 * y1 - x1 * y0; a += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c; } return { a: a / 2, cx: cx / (3 * a), cy: cy / (3 * a) }; };

  /* ---------- an area quiz ---------- */
  function quiz(Q) {
    const why = reason => { left.push(reason); return false; }, t0 = performance.now();
    if (!Q || Q.dots || (Q.proj && Q.proj.type === 'mercator')) return false;
    if (!Q.geo || !Q.size || !Q.areas.length || !Q.areas.every(a => Q.geo[a.id] && Q.geo[a.id].rings)) return why('areas without latitude and longitude');
    // A country over the 180th meridian (Russia, the Aleutians, the Chatham Islands) stays in one piece: every ring
    // within half a turn of the middle of the map.
    let sx = 0, sy = 0;
    for (const a of Q.areas) for (const ring of Q.geo[a.id].rings) { const l = ring[0][1] * RAD; sx += Math.cos(l); sy += Math.sin(l); }
    const mid = Math.atan2(sy, sx) / RAD, turn = lng => 360 * Math.round((mid - lng) / 360);
    const G = {}, box = boxOf();
    for (const a of Q.areas) {
      const g = Q.geo[a.id], rings = g.rings.map(ring => { const t = turn(ring.reduce((s, p) => s + p[1], 0) / ring.length); return t ? ring.map(([lat, lng]) => [lat, lng + t]) : ring; });
      G[a.id] = { rings, lab: g.lab && [g.lab[0], g.lab[1] + turn(g.lab[1])] };
      for (const ring of rings) for (const [lat, lng] of ring) box.add(lat, lng);
    }
    const F = frame(box.get(), Q.size[0]);
    // What is drawn beside the areas goes through the old map: a point that is a corner of an area by that area's
    // latitude and longitude, any other through the old projection.
    const others = Q.borders || [];
    const drawn = new Map(Q.areas.map(a => [a, runs(a.d)])); // each area's old outline (null: a circle)
    let to = () => null;
    if (others.length) {
      const corner = new Map(), pairs = [], every = [], key = (x, y) => Math.round(x * 10) * 1e6 + Math.round(y * 10);
      for (const a of Q.areas) {
        const list = drawn.get(a), rings = G[a.id].rings; if (!list || list.length !== rings.length) continue;
        list.forEach((r, i) => {
          const n = r.pts.length, g = rings[i]; if (g.length !== n && g.length !== n + 1) return;
          for (let j = 0; j < n; j++) { corner.set(key(r.pts[j][0], r.pts[j][1]), g[j]); every.push([r.pts[j][0], r.pts[j][1], g[j][0], g[j][1]]); }
          for (let j = 0; j < n; j += Math.max(1, n >> 3)) pairs.push([r.pts[j][0], r.pts[j][1], g[j][0], g[j][1]]);
        });
      }
      let old; // the old projection, worked out when a point first needs it
      const project = () => {
        if (Q.proj && Q.proj.type === 'albersUsa') { const u = albersUsa(Q.proj); return placer(u.main, u.parts); }
        if (Q.proj && Q.proj.parallels) return conic(Q.proj).ll;
        if (pairs.length < 30) return null;
        // (a part in a box is off the projection: the fit goes by the points that agree, and is trusted when nearly all do)
        const some = (list, n) => list.filter((_, i) => i % Math.ceil(list.length / n) === 0);
        let f = fit(some(pairs, 300));
        if (f.most > 1.5) { const keep = pairs.filter(p => { const [x, y] = f.at(p[2], p[3]); return Math.hypot(x - p[0], y - p[1]) < Math.max(3, 4 * f.median); }); if (keep.length > 0.6 * pairs.length) f = fit(some(keep, 300)); }
        if (f.most <= 1.5) return f.ll;
        // not a projection this file knows: a point is placed by the corners of the areas around it
        return nearby(every);
      };
      to = (x, y) => { let ll = corner.get(key(x, y)); if (!ll) { if (old === undefined) old = project(); ll = old && old(x, y); } return ll ? F.at(ll[0], ll[1] + turn(ll[1])) : null; };
    }
    for (const a of Q.areas) {
      const g = G[a.id], rings = g.rings.map(ring => ({ closed: true, pts: ring.map(([lat, lng]) => F.at(lat, lng)) }));
      const stats = rings.map(r => shoelace(r.pts)), big = stats.reduce((m, r) => (Math.abs(r.a) > Math.abs(m.a) ? r : m));
      const [lx, ly] = g.lab ? F.at(g.lab[0], g.lab[1]) : [big.cx, big.cy], area = stats.reduce((sum, r) => sum + Math.abs(r.a), 0);
      a.size = a.a; // its size on the old, equal-area map: what "largest area" goes by
      if (drawn.get(a)) a.d = write(rings);
      else { const m = /a\s*(\d*\.?\d+)/i.exec(a.d), r = m ? +m[1] : 5; a.d = `M${r1(lx - r)},${r1(ly)}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0z`; } // drawn as a circle: a circle again
      a.lx = r1(lx); a.ly = r1(ly); a.a = r1(area);
    }
    if (Q.borders) Q.borders = Q.borders.map(d => redraw(d, to, true) || '');
    delete Q.context; Q.world = true; // the map lies on the world's: its own neighbouring land is not drawn
    // a pin (the town a code belongs to) by its latitude and longitude
    for (const k of Q.kinds || []) if (k.pin) { const pin = k.pin; k.pin = id => { const p = pin(id); if (!p || !p.ll) return p; const [x, y] = F.at(p.ll[0], p.ll[1] + turn(p.ll[1])); return { ...p, x, y }; }; }
    Q.size = [F.w, F.h]; Q.proj = F.proj; Q.kpu = F.kpu;
    done.push({ what: 'quiz', w: F.w, h: F.h, ms: Math.round(performance.now() - t0) });
    return true;
  }

  /* ---------- a city quiz's map, and the town names on it ---------- */
  // Returns the change of place it made (old map point -> new), for what else is drawn on that map.
  function cities(C) {
    if (!C || !C.proj || C.proj.type === 'mercator') return null;
    const t0 = performance.now(), usa = C.proj.type === 'albersUsa', u = usa ? albersUsa(C.proj) : { main: conic(C.proj), parts: [] };
    const land = runs(C.land) || [];
    if (!usa) {
      // Parts in boxes: the cities that are not where the projection puts them, and the land around them. A point
      // there is placed by the nearest such city, at that city's scale (k: km to a map unit, else the map's).
      const away = C.list.filter(c => { const [x, y] = u.main.at(c.lat, c.lng); return Math.hypot(x - c.x, y - c.y) > 2; });
      if (away.length) {
        const nums = d => (d.match(/-?\d*\.?\d+/g) || []).map(Number);
        let boxes = C.inset ? C.inset.split('M').filter(Boolean).map(s => { const n = nums(s.replace(/[HV]/g, ' ')); return [Math.min(n[0], n[2]), Math.min(n[1], n[3]), Math.max(n[0], n[2]), Math.max(n[1], n[3])]; }) : [];
        if (!boxes.length) {
          // no box on record: the land at those cities, with the islands close to it
          const rb = land.map(r => { const xs = r.pts.map(p => p[0]), ys = r.pts.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; });
          const near = (a, b, gap) => a[0] <= b[2] + gap && b[0] <= a[2] + gap && a[1] <= b[3] + gap && b[1] <= a[3] + gap;
          const home = C.list.filter(c => !away.includes(c)), main = new Set(rb.filter(b => home.some(c => inBox(b, c.x, c.y))));
          const inset = rb.filter(b => !main.has(b) && away.some(c => inBox([b[0] - 6, b[1] - 6, b[2] + 6, b[3] + 6], c.x, c.y)));
          for (let grown = true; grown;) { grown = false; for (const b of rb) if (!main.has(b) && !inset.includes(b) && inset.some(o => near(o, b, 25))) { inset.push(b); grown = true; } }
          const rest = new Set(inset);
          while (rest.size) {
            const group = [rest.values().next().value]; rest.delete(group[0]);
            for (let grown = true; grown;) { grown = false; for (const b of rest) if (group.some(o => near(o, b, 25))) { group.push(b); rest.delete(b); grown = true; } }
            boxes.push([Math.min(...group.map(b => b[0])) - 5, Math.min(...group.map(b => b[1])) - 5, Math.max(...group.map(b => b[2])) + 5, Math.max(...group.map(b => b[3])) + 5]);
          }
        }
        for (const box of boxes) {
          const here = away.filter(c => inBox(box, c.x, c.y)); if (!here.length) continue;
          u.parts.push({ box, ll(x, y) {
            const c = here.reduce((m, o) => ((o.x - x) ** 2 + (o.y - y) ** 2 < (m.x - x) ** 2 + (m.y - y) ** 2 ? o : m)), k = c.k || C.kpu, lat = c.lat - (y - c.y) * k / 110.574;
            return [lat, c.lng + (x - c.x) * k / (111.32 * Math.cos(lat * RAD))];
          } });
        }
      }
    }
    const ll = placer(u.main, u.parts), box = boxOf();
    // the middle of the map, so a country over the 180th meridian stays in one piece
    const mid = C.list.reduce((s, c) => s + c.lng, 0) / C.list.length, turn = lng => 360 * Math.round((mid - lng) / 360);
    for (const r of land) for (const [x, y] of r.pts) { const p = ll(x, y); if (p) box.add(p[0], p[1] + turn(p[1])); }
    const F = frame(box.get(), C.w), to = (x, y) => { const p = ll(x, y); return p && F.at(p[0], p[1] + turn(p[1])); };
    C.span = Math.hypot(C.w, C.h) * C.kpu; // the old map's diagonal in km: the points of map play go by it, as before
    for (const k of ['land', 'lines']) if (C[k]) C[k] = redraw(C[k], to, true) || '';
    delete C.ctx; C.world = true; // the map lies on the world's: its own neighbouring land is not drawn
    for (const c of C.list) { const [x, y] = F.at(c.lat, c.lng + turn(c.lng)); c.x = r1(x); c.y = r1(y); delete c.k; }
    delete C.inset;
    Object.assign(C, { w: F.w, h: F.h, kpu: F.kpu, proj: F.proj });
    done.push({ what: 'cities', w: F.w, h: F.h, parts: u.parts.length, ms: Math.round(performance.now() - t0) });
    return { to, now: F };
  }
  function names(N, moved) {
    if (!N || !moved) return false;
    const { to, now } = moved, t0 = performance.now();
    for (const p of N.parts) {
      const xs = [], ys = [];
      for (let i = 0; i < p.x.length; i++) { const q = to(p.x[i], p.y[i]) || [NaN, NaN]; xs.push(r1(q[0])); ys.push(r1(q[1])); }
      p.x = xs; p.y = ys;
      if (p.area) p.area = p.area.map(ring => { const out = []; for (let i = 0; i + 1 < ring.length; i += 2) { const q = to(ring[i], ring[i + 1]); if (q) out.push(r1(q[0]), r1(q[1])); } return out; });
    }
    // the grid of the painting: each old cell's places go to the new cells its nine parts fall in
    const gw = Math.ceil(now.w / N.cell), gh = Math.ceil(now.h / N.cell), counts = new Float32Array(gw * gh);
    let ySum = 0, all = 0;
    for (let b = 0; b < N.gh; b++) for (let a = 0; a < N.gw; a++) {
      const c = N.counts[b * N.gw + a]; if (!c) continue;
      for (const dy of [1 / 6, 0.5, 5 / 6]) for (const dx of [1 / 6, 0.5, 5 / 6]) {
        const q = to((a + dx) * N.cell, (b + dy) * N.cell); if (!q) continue;
        const i = Math.min(gw - 1, Math.max(0, Math.floor(q[0] / N.cell))), j = Math.min(gh - 1, Math.max(0, Math.floor(q[1] / N.cell)));
        counts[j * gw + i] += c / 9; ySum += q[1] * c / 9; all += c / 9;
      }
    }
    // The brush and the dots keep their size on the ground where the places are: a Mercator map unit is more ground
    // or less than the old map's, by the latitude (the middle one of the places, by their number).
    const there = 111.32 * Math.cos(latOf(now.proj.y0 - ySum / all / now.proj.k) * RAD) / now.proj.k, f = N.kpu / there;
    for (const p of N.parts) if (p.dot) p.dot = Math.max(1, Math.round(p.dot * f * 10) / 10);
    Object.assign(N, { w: now.w, h: now.h, kpu: now.kpu, gw, gh, counts, brush: Math.max(N.cell, Math.round(N.brush * f)) });
    done.push({ what: 'names', ms: Math.round(performance.now() - t0) });
    return true;
  }

  return { frame, conic, albersUsa, fit, runs, redraw, world, quiz, cities, names, left, notes, done, my, latOf };
})();
