// Group B: the red bar struck across a town-exit sign. TS.exitbar(o) gives the bar's SVG; the template puts it before
// the lettering (bar behind the name) or after it (bar in front), as its reference shows.
//   box    [x, y, w, h, rx]: the area the bar may cover — the field inside the frame, or the whole plate where the bar
//          runs over the frame to the plate's edge
//   b, t   where the bar's centre line crosses the box's bottom and top edge, as fractions of the box width
//          (b 0, t 1: corner to corner); or from: [x, y], to: [x, y], two points of the centre line in sign units
//   width  the bar's thickness, measured across it
//   ends   'cut' (default): the bar runs on until the box edge cuts it, so its ends lie flat along the edge (or follow
//          the rounded corner); 'round': a painted stroke with round ends whose caps stay `inset` inside the box
//          (from/to, or the box corners moved in by inset + width/2)
//   fill   the bar's colour
//   stripes  (cut ends only) the band drawn as this many thin parallel red lines with gaps as wide as the lines,
//          filling `width` (the hatched strike-through of Bosnian Latin-Cyrillic end signs)
(function (root) {
  const TS = root.TS;
  let n = 0;
  const f = (v) => +v.toFixed(2);
  TS.exitbar = ({ box, b = 0, t = 1, from, to, width, fill = '#e2001a', ends = 'cut', inset = 0, stripes = 1 }) => {
    const [x, y, w, h, rx = 0] = box, r = width / 2;
    if (ends === 'round') {
      const p = from || [x + inset + r, y + h - inset - r], q = to || [x + w - inset - r, y + inset + r];
      return `<line x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(q[0])}" y2="${f(q[1])}" stroke="${fill}" stroke-width="${f(width)}" stroke-linecap="round"/>`;
    }
    const p = from || [x + b * w, y + h], q = to || [x + t * w, y];
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]), ux = (q[0] - p[0]) / L, uy = (q[1] - p[1]) / L;
    const e = w + h;   // run on well past the box; the clip cuts the ends
    const a = [p[0] - ux * e, p[1] - uy * e], c = [q[0] + ux * e, q[1] + uy * e];
    // one strip from offset o0 to o1 across the centre line
    const strip = (o0, o1) => `M${f(a[0] - uy * o0)},${f(a[1] + ux * o0)}L${f(c[0] - uy * o0)},${f(c[1] + ux * o0)}L${f(c[0] - uy * o1)},${f(c[1] + ux * o1)}L${f(a[0] - uy * o1)},${f(a[1] + ux * o1)}Z`;
    const u = width / (2 * stripes - 1);
    const d = Array.from({ length: stripes }, (_, i) => strip(-r + 2 * i * u, -r + (2 * i + 1) * u)).join('');
    const id = `exitbar${++n}`;
    return `<clipPath id="${id}"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(rx)}"/></clipPath>` +
      `<path clip-path="url(#${id})" fill="${fill}" d="${d}"/>`;
  };
})(typeof window !== 'undefined' ? window : globalThis);
