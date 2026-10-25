// TS.arrows: road-sign arrows and arrow-shaped plates, shared by the country files (fix group A). Loaded after lib.js.
//
// Arrows are filled shapes: a shaft of width w along a polyline, a head at the tip and optionally one at the tail.
//   TS.arrows.arrow(pts, o)            pts: [[x, y], [x, y, r], ..., [tipX, tipY]]; r rounds that corner (arc radius at the
//                                      shaft's centre line). o: { w: shaft width, fill, head: kind or spec (default 'din';
//                                      null: no head),
//                                      tail: head at the first point, r: default corner radius, edge: [colour, width] for an
//                                      outline round the whole arrow, sharp: true squares the outer side of rounded corners
//                                      (an arm curving off a stem, Nigeria); for one straight segment also tailW: the
//                                      shaft widening to this width at the tail (UK style, Cyprus), round: corner radius
//                                      of the outline, roundTip }
//   TS.arrows.straight(x1, y1, x2, y2, o)   one straight arrow, tail (x1, y1) to tip (x2, y2)
//   TS.arrows.dir(cx, cy, deg, len, o) an arrow of overall length len centred on (cx, cy); deg 0 up, 90 right, 180 down, 270 left
//   TS.arrows.ring(cx, cy, r, o)       a roundabout ring of width o.w (r at the centre line)
//   TS.arrows.group(items, o)          several arrows and rings drawn as one figure: every outline first, then every fill,
//                                      so arms joined to a stem show no outline between them. items: { pts, ...o } or
//                                      { ring: [cx, cy, r], ...o }; o holds the shared options.
//   Diagram arms join their stem without a gap when they start ON the stem's centre line (the stem's fill covers the
//   arm's butt end); a stem ending at a cross bar should end on the bar's centre line.
//
// Head kinds (HEADS), in units of the shaft width w, measured from the GeoHints pictures. A head is
//   { half: half its width, back: how far the barbs' outer corners lie behind the tip, cut: length of the barb ends cut
//     parallel to the shaft (0: pointed barbs), neck: where the back edge meets the shaft, behind the tip }
//   or an open chevron { open: true, half, back, sw: its stroke width, gap: (optional) the shaft stops this far short of
//   the chevron's inner corner, a detached head as on Hungarian tables }.
//   neck < back: barbs swept back; neck = back: a plain triangle; cut > 0: chevron head with blunt barb ends; drop: the
//   barb end's inner corner lies that much nearer the shaft, so the end is cut on a slant (drop = cut: square to a 45-degree
//   barb, a thick chevron as on Guatemalan boards).
//
// Plates:
//   TS.arrows.rounded(pts, r)          a closed path through pts (clockwise on screen) with every corner rounded by r
//                                      (a number, or one per point; 0 keeps a corner sharp)
//   TS.arrows.offset(pts, d)           the polygon pts moved inwards by d (mitred corners)
//   TS.arrows.pointed(o)               the corner points of a plate with one pointed end: { x, y, w, h, dir: right|left|up,
//                                      tip: length of the point }; returns { pts, neck }
//   TS.arrows.plate(o)                 an arrow-shaped plate drawn in layers, as the real ones are: the plate (fill, with an
//                                      optional edge line), a band of ink set in by `margin`, and the field inside it, whose
//                                      own point is blunter (fieldTip: its length as a share of the field's half height), so
//                                      the band widens into a wedge at the tip (BE, HR, BG, CZ, FR, SI, BA, MC).
//                                      o: { x, y, w, h, dir, tip, r (blunt-end corners), rTip, rNeck, fill, ink, edge,
//                                      edgeW, margin, band, fieldTip, fieldNeck (shift of the field's neck towards the tip),
//                                      rField, rFieldTip, rFieldNeck, outer (the margin's colour when it differs from the field's),
//                                      fieldStart (where the field begins at the blunt end, left/right plates: the band
//                                      colour fills the rest, e.g. round a symbol panel) }.
//                                      Returns { svg, field: { x0, x1, y0, y1 } (the field's rectangle, where text goes),
//                                      neck, pts }.
(function (root) {
  const TS = root.TS;
  const n2 = (v) => (Math.round(v * 100) / 100).toString();
  const P = ([x, y]) => `${n2(x)},${n2(y)}`;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  const len = (a) => Math.hypot(a[0], a[1]), unit = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0], dot = (a, b) => a[0] * b[0] + a[1] * b[1];

  const HEADS = {
    tri: { half: 1.6, back: 1.6, cut: 0, neck: 1.6 },          // plain triangle (Lesotho, Nigeria, Brazil)
    block: { half: 1.63, back: 1.73, cut: 0, neck: 1.58 },     // fat short arrows, slightly swept (Montenegro rows)
    swept: { half: 1.9, back: 2.9, cut: 0, neck: 2.2 },        // long head with barbs swept back (Greece, Cyprus, UK style)
    din: { half: 1.95, back: 1.65, cut: 1.3, neck: 1.8 },      // chevron head, barb ends cut parallel to the shaft (ex-Yugoslav, DIN)
    chevron: { half: 1.75, back: 1.6, cut: 0.55, drop: 0.55, neck: 1.5 },   // a thick chevron, barb ends cut square to the barbs (GT)
    open: { open: true, half: 1.9, back: 1.9, sw: 1 },         // open chevron
    uk: { half: 2.3, back: 3.25, cut: 0, neck: 3.25 },         // UK style (Cyprus): with tailW about 2.1 w and round 0.2 w
  };
  const spec = (h) => (h == null || h === false ? null : typeof h === 'string' ? HEADS[h] : typeof h === 'object' && h.base ? { ...HEADS[h.base], ...h } : h);

  // a closed path through pts with rounded corners
  const rounded = (pts, r = 0) => {
    const n = pts.length, R = Array.isArray(r) ? r : pts.map(() => r);
    let d = '';
    for (let i = 0; i < n; i++) {
      const A = pts[(i - 1 + n) % n], B = pts[i], C = pts[(i + 1) % n];
      const u = unit(sub(B, A)), v = unit(sub(C, B)), ang = Math.acos(Math.max(-1, Math.min(1, dot(u, v))));
      let rr = R[i] || 0;
      if (rr <= 0 || ang < 1e-3) { d += (i ? 'L' : 'M') + P(B); continue; }
      let t = rr * Math.tan(ang / 2);
      const tmax = Math.min(len(sub(B, A)), len(sub(C, B))) / 2;
      if (t > tmax) { t = tmax; rr = t / Math.tan(ang / 2); }
      const p1 = sub(B, mul(u, t)), p2 = add(B, mul(v, t));
      d += (i ? 'L' : 'M') + P(p1) + `A${n2(rr)},${n2(rr)} 0 0 ${cross(u, v) > 0 ? 1 : 0} ${P(p2)}`;
    }
    return d + 'Z';
  };
  // the polygon moved inwards by d (pts clockwise on screen): every edge shifted along its inner normal, corners where
  // neighbouring edges meet
  const offset = (pts, d) => {
    const n = pts.length, lines = pts.map((A, i) => { const B = pts[(i + 1) % n], u = unit(sub(B, A)), nn = [-u[1], u[0]]; return [add(A, mul(nn, d)), u]; });
    return pts.map((_, i) => {
      const [p, u] = lines[(i - 1 + n) % n], [q, v] = lines[i], c = cross(u, v);
      if (Math.abs(c) < 1e-9) return q;
      const t = cross(sub(q, p), v) / c;
      return add(p, mul(u, t));
    });
  };

  // the head's corner points at tip T pointing along unit vector dv, for shaft width w
  const headPts = (T, dv, h, w) => {
    const nv = [-dv[1], dv[0]], at = (a, l) => add(T, add(mul(dv, -a * w), mul(nv, l * w)));
    const s = [at(0, 0), at(h.back, h.half)];
    if (h.cut) s.push(at(h.back + h.cut, h.half - (h.drop || 0)));
    s.push(at(h.neck, 0.5), at(h.neck + 0.2, 0.5), at(h.neck + 0.2, -0.5), at(h.neck, -0.5));   // a stub of shaft behind the neck: no seam
    if (h.cut) s.push(at(h.back + h.cut, -h.half + (h.drop || 0)));
    s.push(at(h.back, -h.half));
    return s;
  };
  // the parts of one arrow: the shaft as a centre-line path (stroked at width w), the heads as polygons, open heads as
  // polylines, and corner fillers for `sharp`
  const parts = (pts0, o = {}) => {
    const w = o.w ?? 10, H = spec(o.head === undefined ? 'din' : o.head), Tl = spec(o.tail);
    const pts = pts0.map((p) => [p[0], p[1], p[2] ?? o.r ?? 0]);
    const out = { w, polys: [], lines: [], fills: [], paths: [] };
    if (pts.length === 2 && H && !H.open && !Tl && (o.tailW || o.round)) {   // one outline: a shaft tapering to tailW, corners rounded by `round`
      const T = pts[1], dv = unit(sub(T, pts[0])), L = len(sub(T, pts[0])) / w, tw = (o.tailW || w) / w;
      const nv = [-dv[1], dv[0]], at = (a, l) => add(T, add(mul(dv, -a * w), mul(nv, l * w)));
      const q = [at(0, 0), at(H.back, H.half)];
      if (H.cut) q.push(at(H.back + H.cut, H.half));
      q.push(at(H.neck, 0.5), at(L, tw / 2), at(L, -tw / 2), at(H.neck, -0.5));
      if (H.cut) q.push(at(H.back + H.cut, -H.half));
      q.push(at(H.back, -H.half));
      const r = o.round || 0;
      out.paths.push(rounded(q, q.map((_, i) => (i === 0 ? o.roundTip ?? r : r))));
      out.shaft = '';
      return out;
    }
    const end = (i, j, h) => {   // the end at pts[i], coming from pts[j]: draw its head, pull the shaft back under it
      const T = pts[i], dv = unit(sub(T, pts[j]));
      if (h.open) {
        const sw = h.sw * w, ha = Math.atan2(h.half, h.back), sh = sw / 2 / Math.sin(ha);   // the mitre lands on the tip
        const A = sub(T, mul(dv, sh)), nv = [-dv[1], dv[0]];
        out.lines.push({ pts: [add(A, add(mul(dv, -h.back * w), mul(nv, h.half * w))), A, add(A, add(mul(dv, -h.back * w), mul(nv, -h.half * w)))], sw });
        const back = h.gap != null ? 2 * sh + h.gap * w : sh + sw * 0.5;   // gap: a detached head, the shaft ending gap x w before its inner corner
        pts[i] = [T[0] - dv[0] * back, T[1] - dv[1] * back, 0];
      } else {
        out.polys.push(headPts(T, dv, h, w));
        // the shaft ends inside the head, where the head is at least as wide as the shaft (else its corners would stick
        // out past a blunt point) and before the stub behind the neck ends
        const back = Math.min(h.neck + 0.15, Math.max(0.5 * h.back / h.half, h.neck - Math.min(0.4, h.neck * 0.3))) * w;
        pts[i] = [T[0] - dv[0] * back, T[1] - dv[1] * back, 0];
      }
    };
    if (H) end(pts.length - 1, pts.length - 2, H);
    if (Tl) end(0, 1, Tl);
    // the shaft's centre line with rounded corners
    let d = 'M' + P(pts[0]);
    for (let i = 1; i < pts.length - 1; i++) {
      const A = pts[i - 1], B = pts[i], C = pts[i + 1], rr0 = B[2];
      const u = unit(sub(B, A)), v = unit(sub(C, B)), ang = Math.acos(Math.max(-1, Math.min(1, dot(u, v))));
      if (!rr0 || ang < 1e-3) { d += 'L' + P(B); continue; }
      let rr = rr0, t = rr * Math.tan(ang / 2);
      const tmax = Math.min(len(sub(B, A)), len(sub(C, B))) * 0.98;
      if (t > tmax) { t = tmax; rr = t / Math.tan(ang / 2); }
      const p1 = sub(B, mul(u, t)), p2 = add(B, mul(v, t)), sw = cross(u, v) > 0 ? 1 : 0;
      d += 'L' + P(p1) + `A${n2(rr)},${n2(rr)} 0 0 ${sw} ${P(p2)}`;
      if (o.sharp) {   // square the outer side: the region between the outer arc and the outer corner
        const side = sw ? -1 : 1, nu = mul([-u[1], u[0]], side * w / 2), nv = mul([-v[1], v[0]], side * w / 2);
        const a = add(p1, nu), b = add(p2, nv), oc = add(B, add(nu, nv));   // outer corner where the two outer edges meet (90 deg approx.)
        const l1 = [add(A, nu), u], l2 = [add(C, nv), v], c = cross(l1[1], l2[1]);
        const m = Math.abs(c) < 1e-9 ? oc : add(l1[0], mul(l1[1], cross(sub(l2[0], l1[0]), l2[1]) / c));
        out.fills.push([a, m, b, p2, B, p1]);
      }
    }
    d += 'L' + P(pts[pts.length - 1]);
    out.shaft = d;
    return out;
  };
  const draw = (ps, fill, edge) => {
    let s = '';
    if (edge) {
      const [ec, ew] = edge;
      for (const p of ps) {
        if (p.ring) { s += `<circle cx="${n2(p.ring[0])}" cy="${n2(p.ring[1])}" r="${n2(p.ring[2])}" fill="none" stroke="${ec}" stroke-width="${n2(p.w + 2 * ew)}"/>`; continue; }
        if (p.shaft) s += `<path d="${p.shaft}" fill="none" stroke="${ec}" stroke-width="${n2(p.w + 2 * ew)}" stroke-linecap="square" stroke-linejoin="miter"/>`;
        for (const q of p.paths || []) s += `<path d="${q}" fill="${ec}" stroke="${ec}" stroke-width="${n2(2 * ew)}" stroke-linejoin="round"/>`;
        for (const q of p.polys.concat(p.fills)) s += `<path d="M${q.map(P).join('L')}Z" fill="${ec}" stroke="${ec}" stroke-width="${n2(2 * ew)}" stroke-linejoin="miter" stroke-miterlimit="12"/>`;
        for (const l of p.lines) s += `<path d="M${l.pts.map(P).join('L')}" fill="none" stroke="${ec}" stroke-width="${n2(l.sw + 2 * ew)}" stroke-linejoin="miter" stroke-miterlimit="12" stroke-linecap="square"/>`;
      }
    }
    for (const p of ps) {
      const f = p.fill || fill;
      if (p.ring) { s += `<circle cx="${n2(p.ring[0])}" cy="${n2(p.ring[1])}" r="${n2(p.ring[2])}" fill="none" stroke="${f}" stroke-width="${n2(p.w)}"/>`; continue; }
      if (p.shaft) s += `<path d="${p.shaft}" fill="none" stroke="${f}" stroke-width="${n2(p.w)}" stroke-linecap="butt" stroke-linejoin="miter"/>`;
      for (const q of p.paths || []) s += `<path d="${q}" fill="${f}"/>`;
      for (const q of p.polys.concat(p.fills)) s += `<path d="M${q.map(P).join('L')}Z" fill="${f}"/>`;
      for (const l of p.lines) s += `<path d="M${l.pts.map(P).join('L')}" fill="none" stroke="${f}" stroke-width="${n2(l.sw)}" stroke-linejoin="miter" stroke-miterlimit="12" stroke-linecap="butt"/>`;
    }
    return s;
  };
  const arrow = (pts, o = {}) => draw([parts(pts, o)], o.fill || '#fff', o.edge);
  const straight = (x1, y1, x2, y2, o = {}) => arrow([[x1, y1], [x2, y2]], o);
  const dir = (cx, cy, deg, L, o = {}) => {
    const a = (deg * Math.PI) / 180, dx = Math.sin(a) * L / 2, dy = -Math.cos(a) * L / 2;
    return straight(cx - dx, cy - dy, cx + dx, cy + dy, o);
  };
  const ring = (cx, cy, r, o = {}) => draw([{ ring: [cx, cy, r], w: o.w ?? 10, fill: o.fill }], o.fill || '#fff', o.edge);
  const group = (items, o = {}) => draw(items.map((it) => {
    const q = { ...o, ...it };
    return it.ring ? { ring: it.ring, w: q.w ?? 10, fill: it.fill } : { ...parts(it.pts, q), fill: it.fill };
  }), o.fill || '#fff', o.edge);

  // ---- plates ----
  const pointed = ({ x = 0, y = 0, w, h, dir: dr = 'right', tip }) => {
    if (dr === 'left') return { pts: [[x, y + h / 2], [x + tip, y], [x + w, y], [x + w, y + h], [x + tip, y + h]], neck: x + tip, kind: [1, 2, 0, 0, 2] };
    if (dr === 'up') return { pts: [[x, y + tip], [x + w / 2, y], [x + w, y + tip], [x + w, y + h], [x, y + h]], neck: y + tip, kind: [2, 1, 2, 0, 0] };
    return { pts: [[x, y], [x + w - tip, y], [x + w, y + h / 2], [x + w - tip, y + h], [x, y + h]], neck: x + w - tip, kind: [0, 2, 1, 2, 0] };
  };
  // kind per corner: 0 blunt-end corner, 1 tip, 2 neck
  const radii = (kind, r, rTip, rNeck) => kind.map((k) => (k === 0 ? r : k === 1 ? rTip : rNeck));
  const plate = (o) => {
    const { x = 0, y = 0, w, h, dir: dr = 'right', tip, r = 0, rTip = 0, rNeck = 0, fill = '#fff', ink = '#000', edge = null, edgeW = 2, margin = 0, band = 0, fieldNeck = 0 } = o;
    const out = pointed({ x, y, w, h, dir: dr, tip });
    let s = `<path d="${rounded(out.pts, radii(out.kind, r, rTip, rNeck))}" fill="${o.outer || fill}"${edge ? ` stroke="${edge}" stroke-width="${edgeW}" stroke-linejoin="round"` : ''}/>`;
    const m = margin, b = band, mb = m + b;
    const across = dr === 'up' ? w : h;   // the plate's breadth across its direction
    if (b > 0) {
      const pts = offset(out.pts, m);
      s += `<path d="${rounded(pts, radii(out.kind, Math.max(0, r - m), Math.max(0, rTip - m), Math.max(0, rNeck - m)))}" fill="${ink}"/>`;
    }
    // the field: inset by margin + band, its neck at the plate's neck (moved by fieldNeck), its own (blunter) point
    const fh = across / 2 - mb, ft = (o.fieldTip ?? tip / (across / 2)) * fh, rF = o.rField ?? Math.max(0, r - mb);
    let field, fx0, fx1, fy0, fy1;
    if (dr === 'left') {
      const neck = out.neck - fieldNeck; fx0 = neck; fx1 = o.fieldStart ?? x + w - mb; fy0 = y + mb; fy1 = y + h - mb;
      field = pointed({ x: neck - ft, y: fy0, w: fx1 - (neck - ft), h: fy1 - fy0, dir: 'left', tip: ft });
    } else if (dr === 'up') {
      const neck = out.neck - fieldNeck; fy0 = neck; fy1 = y + h - mb; fx0 = x + mb; fx1 = x + w - mb;
      field = pointed({ x: fx0, y: neck - ft, w: fx1 - fx0, h: fy1 - (neck - ft), dir: 'up', tip: ft });
    } else {
      const neck = out.neck + fieldNeck; fx0 = o.fieldStart ?? x + mb; fx1 = neck; fy0 = y + mb; fy1 = y + h - mb;
      field = pointed({ x: fx0, y: fy0, w: neck + ft - fx0, h: fy1 - fy0, dir: 'right', tip: ft });
    }
    if (b > 0) s += `<path d="${rounded(field.pts, radii(field.kind, rF, o.rFieldTip ?? 0, o.rFieldNeck ?? 0))}" fill="${fill}"/>`;
    return { svg: s, field: { x0: fx0, x1: fx1, y0: fy0, y1: fy1 }, neck: out.neck, pts: out.pts };
  };

  TS.arrows = { HEADS, spec, arrow, straight, dir, ring, group, parts, rounded, offset, pointed, plate };
})(typeof window !== 'undefined' ? window : globalThis);
