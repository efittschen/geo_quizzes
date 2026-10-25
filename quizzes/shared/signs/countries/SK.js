// SK: signs carrying a place name, drawn after the GeoHints pictures (see examples/SK.json for which).
(function () {
  const { T, svg } = TS;
  // town signs since the 2020 rules: Tern, mixed case (Hind stands in); older direction signs: narrow bold
  // capitals (DINish Condensed stands in)
  const FT = "'Hind','Noto Sans',sans-serif";
  const FC = "'DINish Condensed','DINish','Noto Sans',sans-serif";
  const PAPER = '#f1f0ea', K = '#2a2a28', RD = '#bb1e11', BL = '#0d4697', GR = '#04705a';
  // helper: a name split into two lines at the space (or after the hyphen) nearest its middle; null if it has none
  const split2 = (s) => {
    let best = null;
    for (let i = 1; i < s.length - 1; i++) {
      const c = s[i] === ' ' ? [s.slice(0, i), s.slice(i + 1)] : s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : null;
      if (c && (!best || Math.max(c[0].length, c[1].length) < Math.max(best[0].length, best[1].length))) best = c;
    }
    return best;
  };
  // the lines a name takes: one while it fits at 75 % of the full size (cw: average letter width in em), else two
  const lines = (s, maxw, max, cw) => (s.length * cw * max * 0.75 > maxw && split2(s)) || [s];
  const up = (s) => s.toLocaleUpperCase('sk');

  // town entry / exit: dark name in Tern on white, dark border; a long name on two lines of the same size
  const obec = (name, end) => {
    const ls = lines(name, 470, 118, 0.53);
    const ys = ls.length > 1 ? [196, 326] : [250];
    return svg(640, 427,
      `<rect x="1.5" y="1.5" width="637" height="424" rx="22" fill="${PAPER}" stroke="#d6d6d2" stroke-width="3"/><rect x="11" y="11" width="618" height="405" rx="15" fill="none" stroke="${K}" stroke-width="10"/>` +
      // exit bar (group B): broad, behind the name, from near the bottom-left corner to near the top-right one, cut by
      // the frame's inner edge
      (end ? TS.exitbar({ box: [16, 16, 608, 395, 10], b: 0.02, t: 0.98, width: 49, fill: RD }) : '') +
      ls.map((l, i) => T(320, ys[i], l, 118, FT, { fill: K, weight: 500, maxw: 500, max: 118 })).join(''));
  };
  // a white road-number box (old signs), outlined
  const rbox = (x, y, w, h, road, fill = BL) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="#fff" stroke-width="3.5"/>` +
    T(x + w / 2, y + h * 0.82, road, h * 0.82, FC, { fill: '#fff', weight: 'bold', maxw: w * 0.8, max: h * 0.82 });
  // capitals in a column, wrapped to two smaller lines when long
  const col = (x, y, s, maxw, max, o = {}) => {
    const ls = lines(up(s), maxw, max, 0.46), sz = ls.length > 1 ? max * 0.78 : max;
    return ls.map((l, i) => T(x, y + (i - ls.length + 1) * sz * 1.08, l, sz, FC, { fill: '#fff', weight: 'bold', maxw, max: sz, ...o })).join('');
  };

  const sk = [
    { id: 'zaciatok-obce', kind: 'entry', label: 'Town entry', draw: ({ name }) => obec(name, false) },
    { id: 'koniec-obce', kind: 'exit', label: 'Town exit', draw: ({ name }) => obec(name, true) },
    // advance sign at a T junction: the place to the left, the next town to the right, both with the road number
    { id: 'predzvest', kind: 'direction', label: 'Advance junction sign (blue)', draw: ({ name, next, road }) => svg(520, 376,
      `<rect x="3" y="3" width="514" height="370" rx="18" fill="${BL}" stroke="#d9dde3" stroke-width="5"/><rect x="13" y="13" width="494" height="350" rx="12" fill="none" stroke="#fff" stroke-width="4"/>` +
      col(110, 94, name, 190, 46) + col(410, 94, next, 190, 46) +
      rbox(84, 108, 54, 38, road) + rbox(384, 108, 54, 38, road) +
      // GeoHints 199: one figure: the cross bar with a big swept head at each end; the V hangs from the bar (its arms start
      // on the bar's centre line, so nothing is detached) and the stem from the V's foot (TS.arrows)
      TS.arrows.group([{ pts: [[260, 196], [30, 196]], w: 22 }, { pts: [[260, 196], [490, 196]], w: 22 },
        { pts: [[166, 196], [260, 284], [354, 196]], head: null }, { pts: [[260, 276], [260, 322]], head: null }], { w: 18, fill: '#fff', head: { half: 2.0, back: 2.6, neck: 2.2 } }) +
      T(260, 356, '500 m', 40, FC, { fill: '#fff', weight: 'bold' })) },
    // direction table: road-number field, two destinations with distances (the farther on top), arrow
    { id: 'smerova-tabula', kind: 'direction', label: 'Direction table (blue)', draw: ({ name, next, km, road }) => {
      const rows = [[name, +km + 12], [next, km]];
      const lsets = rows.map(([s]) => lines(up(s), 300, 62, 0.46));
      const n = lsets.reduce((a, l) => a + l.length, 0), H = 50 + n * 66;
      let y = 32, body = '';
      rows.forEach(([, d], r) => lsets[r].forEach((l, i) => { y += 66; body += T(192, y, l, 62, FC, { fill: '#fff', weight: 'bold', anchor: 'start', maxw: 300, max: 62 }); if (i === lsets[r].length - 1) body += T(548, y, d, 62, FC, { fill: '#fff', weight: 'bold', anchor: 'end' }); }));
      return svg(660, H,
        `<rect x="3" y="3" width="654" height="${H - 6}" rx="12" fill="${BL}" stroke="#d9dde3" stroke-width="5"/><rect x="11" y="11" width="638" height="${H - 22}" rx="8" fill="none" stroke="#fff" stroke-width="3.5"/>` +
        `<path d="M168,11 L168,${H - 11}" stroke="#fff" stroke-width="3.5"/>` + T(90, H / 2 + 30, road, 84, FC, { fill: '#fff', weight: 'bold', maxw: 136, max: 84 }) + body +
        `<path d="M562,${H / 2 - 12} L600,${H / 2 - 12} L600,${H / 2 - 32} L634,${H / 2} L600,${H / 2 + 32} L600,${H / 2 + 12} L562,${H / 2 + 12} Z" fill="#fff"/>`); } },
    // motorway gantry: the next town in capitals, the place as a local destination in a white box, road plate, lane arrows
    // (group D) the road plate is followed by the green E-road plates (eroad: "E 65, E 75"), as on the picture; the
    // default pairs road 2 with its E roads so the plates agree
    { id: 'dialnica', kind: 'motorway', label: 'Motorway gantry (green)', defaults: { road: '2', eroad: 'E 65, E 75' }, draw: ({ name, next, road, eroad }) => {
      const box = lines(up(name), 210, 50, 0.5);
      const bh = box.length * 58 + 24;
      const es = String(eroad || '').split(/\s*[,;]\s*/).filter(Boolean), x0 = 240 - (80 + es.length * 94) / 2;
      return svg(480, 340 + bh,
        `<rect x="3" y="3" width="474" height="${334 + bh}" rx="8" fill="${GR}" stroke="#e8e8e8" stroke-width="4"/>` +
        col(240, 76, next, 380, 50, { ls: 0.08 }) +
        `<rect x="${240 - 125}" y="104" width="250" height="${bh}" fill="#efedea"/>` +
        box.map((l, i) => T(240, 104 + 62 + i * 58, l, 50, FC, { fill: '#2b2b2b', weight: 'bold', ls: 0.12, maxw: 222, max: 50 })).join('') +
        `<rect x="${x0}" y="${150 + bh}" width="80" height="54" fill="#a51e24" stroke="#fff" stroke-width="3"/>` + T(x0 + 40, 192 + bh, road, 40, FC, { fill: '#fff', weight: 'bold', maxw: 64, max: 40 }) +
        es.map((e, i) => TS.shields.ePlate(x0 + 90 + i * 94, 150 + bh, 84, 54, e, { field: GR, font: FC, weight: 'bold', cap: 0.52, capEm: 0.7, sw: 0.055, rx: 0.08 })).join('') +
        `<g fill="#fff"><path d="M70,${300 + bh} L70,${250 + bh} L56,${250 + bh} L80,${218 + bh} L104,${250 + bh} L90,${250 + bh} L90,${300 + bh} Z"/><path d="M390,${300 + bh} L390,${250 + bh} L376,${250 + bh} L400,${218 + bh} L424,${250 + bh} L410,${250 + bh} L410,${300 + bh} Z"/></g>`); } },
    // group I: cycle route plate of the Slovak cycling club (SCK), after Commons photos (Štefánikova cyklomagistrála,
    // Kamzík: BIELY KRÍŽ 10 km / PEZINSKÁ BABA 24,7 km; Brezová; Hrebienok): white arrow plate, the cyclist in the route's
    // colour at the blunt end (Commons SC2 rider standing in for the club's pictogram), narrow bold capitals with
    // distances, and in the point a field of the route's colour carrying the white "C" disc of the cycle marking
    { id: 'cyklo', kind: 'bike', label: 'Cycle route plate (white, red route)', draw: ({ name, next, km }, RC = '#d7262e') => {
      // Kamzík photo at large size: the plate's point is at 45 degrees; the C field is a pentagon of the route colour half
      // the plate's height, centred, with white above and below and a white margin round its point (parallel to the
      // plate's edges, TS.arrows.offset); in it a white disc holding the C in the route colour
      const H = 170, AN = "'Archivo Narrow','DINish Condensed',sans-serif", T0 = 0.5 * H;
      const fmt = (v) => (v >= 10 ? String(Math.round(v)) : String(Math.round(v * 10) / 10).replace('.', ',')) + ' km';
      const far = Math.max(1, km), near = Math.max(0.5, Math.round(far * 0.4 * 10) / 10);
      const rows = [[up(name), fmt(far)], ...(next ? [[up(next), fmt(near)]] : [])], two = rows.length > 1;
      const z = (two ? 36 : 44) / 0.72, x0 = 128, fh = 0.5 * H, y0 = (H - fh) / 2, rw = 66;
      const nw = Math.min(900, Math.max(...rows.map(([n]) => [...n].length * 0.5 * z))), dw = Math.max(...rows.map(([, d]) => d.length * 0.46 * z));
      const W = Math.round(x0 + nw + 36 + dw + 16 + rw + fh / 2 + 38), ys = two ? [72, 136] : [107];
      const plate = `M16,2 H${W - T0} L${W - 2},${H / 2} L${W - T0},${H - 2} H16 Q2,${H - 2} 2,${H - 16} V16 Q2,2 16,2 Z`;
      const out = TS.arrows.pointed({ x: 2, y: 2, w: W - 4, h: H - 4, dir: 'right', tip: T0 - 2 }).pts, [, Bi, Ci, Di] = TS.arrows.offset(out, 9);
      const on = (y, P) => [P[0] + (Ci[0] - P[0]) * (y - P[1]) / (Ci[1] - P[1]), y], Nt = on(y0, Bi), Nb = on(y0 + fh, Di), fx = Nt[0] - rw;
      const kx = fx - 16, cx = fx + 0.42 * (Ci[0] - fx), R = fh * 0.3, r = R * 0.45, a = 0.72;
      const C = `M${cx + R * Math.cos(a)},${H / 2 - R * Math.sin(a)} A${R},${R} 0 1 0 ${cx + R * Math.cos(a)},${H / 2 + R * Math.sin(a)} L${cx + r * Math.cos(a)},${H / 2 + r * Math.sin(a)} A${r},${r} 0 1 1 ${cx + r * Math.cos(a)},${H / 2 - r * Math.sin(a)} Z`;
      return svg(W, H, `<path d="${plate}" fill="#fff" stroke="#b5b5b5" stroke-width="2" stroke-linejoin="round"/>` +
        `<path d="${TS.arrows.rounded([[fx, y0], Nt, Ci, Nb, [fx, y0 + fh]], [2, 2, 3, 2, 2])}" fill="${RC}"/>` +
        `<circle cx="${cx}" cy="${H / 2}" r="${R * 1.24}" fill="#fff"/><path d="${C}" fill="${RC}"/>` +
        TS.bike(64, H / 2 + 4, 92, RC, { style: 'sc2' }) +
        rows.map(([n, d], i) => T(x0, ys[i], n, z, AN, { anchor: 'start', fill: '#1d1d1b', weight: 'bold', maxw: Math.round(nw), max: z }) +
          T(kx, ys[i], d, z, AN, { anchor: 'end', fill: '#1d1d1b', weight: 'bold' })).join(''));
    } },
    // (group H) white local direction sign (Commons, Kežmarok: ← Golfový areál / Royal Valley, under the blue tables): a
    // white plate with a thin dark border, a plain dark arrow at the left, the destination right-aligned in mixed case; a
    // long name on two lines. Local destinations are parts of a town and places in it, so the quiz's name stands in
    { id: 'miestny', kind: 'direction', label: 'Local direction sign (white)', draw: ({ name }) => {
      const ls = lines(name, 420, 70, 0.42), S = ls.length > 1 ? 64 : 70, H = 66 + ls.length * 78;
      return svg(660, H, `<rect x="2" y="2" width="656" height="${H - 4}" rx="12" fill="${PAPER}" stroke="#c9c9c4" stroke-width="2.5"/>` +
        `<rect x="10" y="10" width="640" height="${H - 20}" rx="8" fill="none" stroke="${K}" stroke-width="3.5"/>` +
        `<path d="M44,${H / 2} L76,${H / 2 - 18} L76,${H / 2 - 6} L118,${H / 2 - 6} L118,${H / 2 + 6} L76,${H / 2 + 6} L76,${H / 2 + 18} Z" fill="${K}"/>` +
        ls.map((l, i) => T(622, H / 2 + 0.36 * S + (i - (ls.length - 1) / 2) * 76, l, S, FC, { anchor: 'end', fill: '#24245a', weight: 600, maxw: 460, max: S })).join(''));
    } },
    // group I: the same plate for a blue route (Kamzík: DEVIATY MLYN 4,1 km / ŽELEZNÁ STUDIENKA 4,7 km; Brezová)
    { id: 'cyklo-modra', kind: 'bike', label: 'Cycle route plate (white, blue route)', draw: (o) => sk.find((t) => t.id === 'cyklo').draw(o, '#1f74c4') },
  ];

  TS.add('SK', sk, { next: 'Námestovo', km: 16, road: '18' });
})();
