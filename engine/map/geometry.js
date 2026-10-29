// Outline geometry in map units: pure functions, no page. The Map's layouts work with them as a page opens where its
// stored shapes don't fit; tools/builds/layer-shapes keeps what they make (shapes.js).
//
// Points are told apart at 1/q of a map unit (quantum: hundredths, or finer where the map's own points are).
//
//   ringsOf(d), pathOf(runs, closed)    an SVG path of M, L, Z commands as rings of [x, y] points, and back
//   shapeOf(id, rings), inside(s, x, y) a shape to test points on (even-odd, like its fill)
//   near(shapes)                        (x, y) -> the shapes whose box holds the point
//   dissolve(rings…, q)                 areas as one shape: the edges only one of them has, or null where their
//                                       borders don't meet point for point
//   outlines(shapes, unitOf, n, detail, q)   each unit's outline and the areas left loose (see below)
//   neighbours(units, ringsOf, w, h)    which units touch, for their colours
//   bandOf(s, q), arcPoints(...)        the detail a view draws of stored arcs

export const quantum = proj => Math.max(100, Math.round(1 / ((proj && proj.grain) || 1)));

/* ---------- paths ---------- */

export function ringsOf(d) {
  const rings = [];
  let ring = null, cmd = 'M', x = 0, y = 0, sx = 0, sy = 0, first = null;
  for (const [, c, n] of d.matchAll(/([MLZmlz])|(-?\d*\.?\d+)/g)) {
    if (c) {
      if (c === 'Z' || c === 'z') { ring = null; x = sx; y = sy; } else cmd = c;
      continue;
    }
    if (first === null) { first = +n; continue; }
    const rel = cmd === 'm' || cmd === 'l';
    x = rel ? x + first : first; y = rel ? y + +n : +n; first = null;
    if (cmd === 'M' || cmd === 'm') { rings.push(ring = [[x, y]]); sx = x; sy = y; cmd = cmd === 'M' ? 'L' : 'l'; }
    else { if (!ring) rings.push(ring = [[sx, sy]]); ring.push([x, y]); }
  }
  return rings;
}

export const pathOf = (runs, closed) => runs.map(r => 'M' + r.map(p => p[0] + ',' + p[1]).join('L') + (closed ? 'Z' : '')).join('');

/* ---------- shapes and points ---------- */

// A shape's edges are sorted into rows of ROW map units by height the first time a point is tested on it.
const ROW = 4, CELL = 16;

export function shapeOf(id, rings) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of rings) for (const [x, y] of r) {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { id, rings, x0, y0, x1, y1, rows: null };
}

export function inside(s, x, y) {
  if (x < s.x0 || x > s.x1 || y < s.y0 || y > s.y1) return false;
  if (!s.rows) {
    s.rows = new Map();
    for (const r of s.rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const a = r[j], b = r[i];
      for (let k = Math.floor(Math.min(a[1], b[1]) / ROW), top = Math.floor(Math.max(a[1], b[1]) / ROW); k <= top; k++) {
        const row = s.rows.get(k); if (row) row.push(a, b); else s.rows.set(k, [a, b]);
      }
    }
  }
  const row = s.rows.get(Math.floor(y / ROW)); if (!row) return false;
  let odd = false;
  for (let i = 0; i < row.length; i += 2) {
    const a = row[i], b = row[i + 1];
    if ((a[1] > y) !== (b[1] > y) && x < a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1])) odd = !odd;
  }
  return odd;
}

export function near(shapes) {
  const cells = new Map(), key = (i, j) => i * 65536 + j;
  for (const s of shapes) {
    for (let i = Math.floor(s.x0 / CELL); i <= Math.floor(s.x1 / CELL); i++)
      for (let j = Math.floor(s.y0 / CELL); j <= Math.floor(s.y1 / CELL); j++) {
        const l = cells.get(key(i, j)); if (l) l.push(s); else cells.set(key(i, j), [s]);
      }
  }
  return (x, y) => cells.get(key(Math.floor(x / CELL), Math.floor(y / CELL))) || [];
}

/* ---------- areas as one shape ---------- */

// Points by their place at 1/q, as numbers (much quicker to look up than text).
function pointIds(q) {
  const ids = new Map();
  return p => {
    const k = Math.round(p[0] * q) * 67108864 + Math.round(p[1] * q);
    let i = ids.get(k); if (i === undefined) ids.set(k, i = ids.size);
    return i;
  };
}
const edgeKey = (a, b) => (a < b ? a * 4194304 + b : b * 4194304 + a);

// The border of several areas: the edges had an odd number of times (as their fill counts them: an edge two of them
// share has it twice, a spike out and back along an edge twice more), traced into rings. Every point of the border has
// an even number of its edges, else the areas' borders don't meet and there is no one shape.
export function dissolve(ringLists, q) {
  const id = pointIds(q), edges = new Map();
  for (const rings of ringLists) for (const r of rings) for (let i = 0; i < r.length; i++) {
    const p = r[i], n = r[(i + 1) % r.length], a = id(p), b = id(n);
    if (a === b) continue;
    const k = edgeKey(a, b), e = edges.get(k);
    if (e) e.n++; else edges.set(k, { p, q: n, a, b, n: 1 });
  }
  const border = [...edges.values()].filter(e => e.n % 2), at = byEnd(border);
  for (const l of at.values()) if (l.length % 2) return null;
  const used = new Set(), rings = [];
  for (const e of border) {
    if (used.has(e)) continue;
    used.add(e);
    const ring = [e.p]; let end = e.b, last = e.q;
    while (end !== e.a) {
      const f = at.get(end).find(f => !used.has(f)); if (!f) return null;
      used.add(f); ring.push(last);
      [end, last] = f.a === end ? [f.b, f.q] : [f.a, f.p];
    }
    rings.push(ring);
  }
  return rings;
}

function byEnd(edges) {
  const at = new Map();
  for (const e of edges) for (const k of [e.a, e.b]) { const l = at.get(k); if (l) l.push(e); else at.set(k, [e]); }
  return at;
}

/* ---------- the outlines of units ---------- */

// A unit is the areas answered by the same items; its outline is drawn where the unit lies on one side of an edge
// only. An edge between two units is on both their outlines. An edge only one area has (a coast, or a border whose
// neighbour's points don't line up with it) is tested along its length, a stretch of STEP at a time: the unit lies on
// a side where its own area is right there (OWN off the edge), or another of its areas NEAR off it, or (zoomed out)
// up to `far` off, across a gap between the two. Where it lies on both sides, the edge is a border inside the unit that
// gets no outline, and its area is loose: it is drawn with a line of its own colour, which closes the seam. A small
// piece of outline (narrower than `gap` both ways) with the unit around it is a gap between its areas, not an island:
// it is left out, and its areas are loose too.
// Two versions, by the zoom: zoomed out (DETAIL[0]) and from FINE screen pixels per map unit (DETAIL[1]).
export const DETAIL = [{ far: 1, gap: 1.5 }, { far: .3, gap: .5 }], FINE = 3;
const OWN = .01, NEAR = .3, STEP = 1;

export function outlines(shapes, unitOf, n, { far, gap }, q) {
  const id = pointIds(q), edges = new Map(), lookup = near(shapes);
  for (const s of shapes) for (const r of s.rings) {
    let p = r[r.length - 1], a = id(p);
    for (const b of r) {
      const kb = id(b);
      if (kb !== a) {
        const k = edgeKey(a, kb), e = edges.get(k), u = unitOf.get(s.id);
        if (!e) edges.set(k, { p, q: b, a, b: kb, s, n: 1, u, v: -1 });
        else { e.n++; if (u !== e.u) e.v = u; }
      }
      p = b; a = kb;
    }
  }
  const lines = Array.from({ length: n }, () => []), loose = new Set();
  const round = v => Math.round(v * q) / q;
  for (const e of edges.values()) {
    if (e.v < 0 && e.n > 1) continue;
    const dx = e.q[0] - e.p[0], dy = e.q[1] - e.p[1], len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
    const off = (t, d) => [e.p[0] + dx * t + nx * d, e.p[1] + dy * t + ny * d];
    if (e.v >= 0) {
      const side = inside(e.s, ...off(.5, OWN)) ? 1 : -1;
      lines[e.u].push({ ...e, side }); lines[e.v].push({ ...e, side: -side });
      continue;
    }
    const unitThere = ([x, y]) => lookup(x, y).some(t => t !== e.s && unitOf.get(t.id) === e.u && inside(t, x, y));
    const on = (t, dir) => inside(e.s, ...off(t, dir * OWN)) || unitThere(off(t, dir * NEAR)) || (far > NEAR && unitThere(off(t, dir * far)));
    const sideAt = t => { const l = on(t, 1), r = on(t, -1); return l && r ? 2 : l ? 1 : r ? -1 : 0; };
    const steps = Math.ceil(len / STEP), point = t => (t === 0 ? e.p : t === 1 ? e.q : [round(e.p[0] + dx * t), round(e.p[1] + dy * t)]);
    let from = 0, side = sideAt(.5 / steps);
    for (let i = 1; i <= steps; i++) {
      const next = i < steps ? sideAt((i + .5) / steps) : null;
      if (next === side) continue;
      let to = 1;
      if (i < steps) { // where along the edge the answer changes, to 1/64 of a stretch
        let lo = (i - .5) / steps, hi = (i + .5) / steps;
        for (let k = 0; k < 6; k++) { const mid = (lo + hi) / 2; if (sideAt(mid) === side) lo = mid; else hi = mid; }
        to = (lo + hi) / 2;
      }
      if (side === 2) loose.add(e.s.id);
      else { const a = point(from), b = point(to); lines[e.u].push({ p: a, q: b, a: from ? id(a) : e.a, b: to < 1 ? id(b) : e.b, side, s: e.s }); }
      from = to; side = next;
    }
  }
  return { lines: lines.map(es => runsOf(es, gap, loose)), loose };
}

// A unit's outline edges as runs, end to end, so the line has joins instead of loose ends.
function runsOf(edges, gap, loose) {
  const at = byEnd(edges), seen = new Set(), runs = [];
  for (const e0 of edges) {
    if (seen.has(e0)) continue;
    const part = [e0]; seen.add(e0);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const e of part) {
      for (const [x, y] of [e.p, e.q]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      for (const k of [e.a, e.b]) for (const f of at.get(k)) if (!seen.has(f)) { seen.add(f); part.push(f); }
    }
    if (x1 - x0 < gap && y1 - y0 < gap) {
      // which way the piece turns around its middle, weighed by the unit's side: positive, the unit lies inside it
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      let turn = 0;
      for (const e of part) turn += e.side * ((e.p[0] - cx) * (e.q[1] - cy) - (e.q[0] - cx) * (e.p[1] - cy));
      if (turn < 1e-6) { for (const e of part) loose.add(e.s.id); continue; }
    }
    const used = new Set();
    for (const e of part) {
      if (used.has(e)) continue;
      used.add(e);
      let run = [e.p, e.q], end = e.b;
      for (const pass of [0, 1]) { // grown at its end, then at its start
        for (let f; (f = at.get(end).find(f => !used.has(f)));) {
          used.add(f);
          if (f.a === end) { run.push(f.q); end = f.b; } else { run.push(f.p); end = f.a; }
        }
        run.reverse(); end = e.a;
      }
      runs.push(run);
    }
  }
  return runs;
}

/* ---------- neighbours ---------- */

// Units touch where they come within GAP pixels of each other on the map drawn SIDE pixels across: each unit's areas
// filled (even-odd), the pixels inside a unit (all four neighbours the same unit) compared GAP apart, across and down.
const SIDE = 1000, GAP = 4;

export function neighbours(units, ringsOf, w, h) {
  const k = SIDE / Math.max(w, h), W = Math.ceil(w * k), H = Math.ceil(h * k), px = new Uint16Array(W * H);
  units.forEach((areas, u) => { for (const a of areas) fill(ringsOf(a), u + 1); });
  function fill(rings, v) {
    const rows = new Map();
    for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [ax, ay] = r[j].map(c => c * k), [bx, by] = r[i].map(c => c * k);
      if (ay === by) continue;
      // the rows whose middle the edge crosses, and where
      for (let y = Math.max(0, Math.ceil(Math.min(ay, by) - .5)); y < H && y + .5 < Math.max(ay, by); y++) {
        const x = ax + (bx - ax) * (y + .5 - ay) / (by - ay), l = rows.get(y);
        if (l) l.push(x); else rows.set(y, [x]);
      }
    }
    for (const [y, xs] of rows) {
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2)
        for (let x = Math.max(0, Math.ceil(xs[i] - .5)); x < W && x + .5 < xs[i + 1]; x++) px[y * W + x] = v;
    }
  }
  const pure = new Uint16Array(W * H), adj = units.map(() => new Set());
  for (let y = 1; y < H - 1; y++) for (let i = y * W + 1; i < (y + 1) * W - 1; i++) {
    const v = px[i];
    if (v && px[i - 1] === v && px[i + 1] === v && px[i - W] === v && px[i + W] === v) pure[i] = v;
  }
  for (let y = 1; y < H - 1; y++) for (let i = y * W + 1; i < (y + 1) * W - 1; i++) {
    const u = pure[i]; if (!u) continue;
    for (const j of [i + GAP, i + GAP * W]) {
      const v = j < pure.length ? pure[j] : 0;
      if (v && v !== u) { adj[u - 1].add(v - 1); adj[v - 1].add(u - 1); }
    }
  }
  return adj;
}

/* ---------- stored arcs at a view's detail ---------- */

// A view keeps the points that lie half a screen pixel or more off the line without them: band T keeps the points of
// level T or more (shapes.js: lv, made by the layer-shapes tool), a tolerance of 2^(T-1)/q map units.
export const bandOf = (s, q) => { const t = .5 / s * q; return t < 1 ? 0 : Math.floor(Math.log2(t)) + 1; };

// Arc i of stored shapes as points (its first point, then steps, in 1/q), all of them or those of band T.
export function arcReader({ arcs, lv, q }) {
  const all = [], bands = [];
  const full = i => all[i] ??= (() => {
    const a = arcs[i], pts = [[a[0] / q, a[1] / q]];
    for (let j = 2, x = a[0], y = a[1]; j < a.length; j += 2) { x += a[j]; y += a[j + 1]; pts.push([x / q, y / q]); }
    return pts;
  })();
  const arc = (i, T) => (!T ? full(i) : ((bands[T] ??= [])[i] ??= full(i).filter((_, j, p) => j === 0 || j === p.length - 1 || lv[i][j - 1] >= T)));
  // a run: a list of arcs (~i: arc i backwards), end to end
  const run = (r, T) => {
    const pts = [];
    for (const i of r) { const a = i < 0 ? arc(~i, T).slice().reverse() : arc(i, T); pts.pop(); pts.push(...a); }
    return pts;
  };
  return { run };
}
