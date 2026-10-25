// CZ: signs carrying a place name, drawn after the GeoHints pictures (see examples/CZ.json for which).
(function () {
  const { T, svg, esc } = TS;
  // Czech signs are lettered in DIN 1451 Mittelschrift capitals; DINish stands in
  const F = "'DINish','Noto Sans',sans-serif";
  const BL = '#014d90', GR = '#028850', K = '#222021', RD = '#ce161e';
  const CW = 0.6;   // average capital width (em, spacing included), for layout guesses only
  // helper: the words of a name in capitals; linking words (nad, pod, u, v, na, ...) are lettered smaller, as in
  // "ÚSTÍ NAD LABEM"
  const SMALL = /^(NAD|POD|U|V|VE|NA|PŘI|A|DO|ZA)$/;
  const words = (s) => s.toLocaleUpperCase('cs').split(' ').map((w) => [w, SMALL.test(w)]);
  const wlen = (ws) => ws.reduce((a, [w, sm]) => a + (w.length + 0.4) * (sm ? 0.72 : 1), 0) - 0.4;
  // one line of words in one <text> (small words as 72 % tspans), so TS.fitDOM sizes the whole line at once
  const TW = (x, y, ws, size, o) => T(x, y, '\u0001', size, F, o).replace('\u0001',
    ws.map(([w, sm]) => (sm ? `<tspan font-size="72%">${esc(w)}</tspan>` : esc(w))).join(' '));
  // helper: the lines a name takes when it may be maxw wide at size max: one line while it fits at 75 % of max,
  // else two, split at a space or after a hyphen so the longer line is as short as possible
  const lines = (name, maxw, max) => {
    const ws = words(name);
    if (wlen(ws) * CW * max * 0.75 <= maxw) return [ws];
    let best = null;
    const flat = ws.flatMap(([w, sm], i) => w.split(/(?<=-)/).map((p, j, a) => ({ p, sm, sp: j === a.length - 1 && i < ws.length - 1 })));
    for (let k = 1; k < flat.length; k++) {
      const join = (a) => a.reduce((acc, t) => { const last = acc[acc.length - 1]; if (last && !last.sp) last.p += t.p, last.sp = t.sp; else acc.push({ ...t }); return acc; }, []).map((t) => [t.p, t.sm]);
      const c = [join(flat.slice(0, k)), join(flat.slice(k))];
      if (!best || Math.max(...c.map(wlen)) < Math.max(...best.map(wlen))) best = c;
    }
    return best || [ws];
  };
  const txt = (ws) => ws.map(([w]) => w).join(' ');

  // IS 12a / IS 12b: black capitals on white inside a thick black border; a long name on two lines
  const obec = (name, end) => {
    const ls = lines(name, 760, 146);   // the plate grows with the name up to 1000 wide, then the name wraps
    const H = ls.length > 1 ? 450 : 320;
    const W = Math.round(Math.min(1000, Math.max(640, Math.max(...ls.map(wlen)) * CW * 146 + 110)));
    const ys = ls.length > 1 ? [200, 360] : [212];
    return svg(W, H,
      `<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="30" fill="#fff" stroke="#c9c9c9" stroke-width="3"/>` +
      `<rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="16" fill="#fff" stroke="${K}" stroke-width="18"/>` +
      (end ? `<clipPath id="cz-x"><rect x="27" y="27" width="${W - 54}" height="${H - 54}" rx="8"/></clipPath><path clip-path="url(#cz-x)" d="M27,${H - 27} L${W - 27},27" stroke="${RD}" stroke-width="${H * 0.13}"/>` : '') +
      ls.map((l, i) => TW(W / 2, ys[i], l, 146, { fill: K, weight: 600, ls: 0.02, maxw: W - 92, max: 146 })).join(''));
  };
  // a list of destinations on a panel: each a line (wrapped when long), with an optional distance on the right
  const dest = (x, y, rows, { maxw, max, gap, fill = '#fff', kmx }) => {
    let out = '', yy = y;
    for (const [name, km] of rows) {
      const ls = lines(name, maxw, max), sz = ls.length > 1 ? max * 0.8 : max;
      ls.forEach((l, i) => { out += TW(x, yy, l, sz, { fill, weight: 500, anchor: 'start', ls: 0.02, maxw, max: sz }); if (km != null && i === ls.length - 1) out += T(kmx, yy, km, max, F, { fill, weight: 500, anchor: 'end' }); yy += sz * 1.12; });
      yy += gap;
    }
    return out;
  };

  const cz = [
    { id: 'obec', kind: 'entry', label: 'Town entry', draw: ({ name }) => obec(name, false) },
    { id: 'konec-obce', kind: 'exit', label: 'Town exit', draw: ({ name }) => obec(name, true) },
    // advance fork sign on main roads: blue, the place on the left branch, the next town on the right
    { id: 'predbezny', kind: 'direction', label: 'Fork advance sign (blue)', draw: ({ name, next }) => {
      const a = lines(name, 230, 54), b = lines(next, 230, 54);
      const col = (x, ls) => ls.map((l, i) => TW(x, (ls.length > 1 ? 86 : 118) + i * 48, l, ls.length > 1 ? 44 : 54, { fill: '#fff', weight: 500, ls: 0.02, maxw: 230, max: ls.length > 1 ? 44 : 54 })).join('');
      return svg(560, 400,
        `<rect x="0" y="0" width="560" height="400" fill="${BL}"/><rect x="11" y="11" width="538" height="378" rx="22" fill="none" stroke="#fff" stroke-width="7"/>` +
        col(152, a) + col(410, b) +
        `<path d="M266,350 L266,262 L176,172" fill="none" stroke="#fff" stroke-width="27" stroke-linejoin="miter"/><path d="M272,262 L392,152" fill="none" stroke="#fff" stroke-width="22"/>` +
        `<path d="M152,140 L218,152 L166,206 Z" fill="#fff"/><path d="M412,128 L404,190 L356,146 Z" fill="#fff"/>`); } },
    // motorway gantry: exit number tab, the destinations in capitals, the motorway plate and turn arrows
    { id: 'dalnice-portal', kind: 'motorway', label: 'Motorway exit gantry (green)', draw: ({ name, next, road, exit }) => {
      // the arrows stand below the destinations, which may wrap: the board grows with them (GeoHints 110)
      let yy = 162, last = 162;
      for (const s of [next, name]) { const n = lines(s, 464, 58).length, sz = n > 1 ? 58 * 0.8 : 58; last = yy + (n - 1) * sz * 1.12; yy += n * sz * 1.12 + 8; }
      const bot = Math.round(Math.max(423, last + 165)), H = bot + 47;
      // bent arrows: a stem up from the foot, a rounded bend, then up-right to a swept head (TS.arrows)
      const bent = (x) => ({ pts: [[x, bot], [x, bot - 85, 27], [x + 52, bot - 135]] });
      // GeoHints 110 at large size: square-cornered green plates; the board's white line is set in from its edge (green
      // round it, rounded corners); the exit tab carries a white pill-shaped line whose foot is the board's line, and in
      // it the interchange pictogram (two crossing dual roads joined by curved ramps at the sides) and the number
      const ln = 4, li = 7, ly = 82 + li + ln / 2, py = 12;
      const ramps = `M-29,-16 Q-15,0 -29,16 M29,-16 Q15,0 29,16`;
      return svg(560, H,
        `<rect x="168" y="4" width="224" height="${ly}" fill="${GR}"/>` +
        TS.frames.plate(560, H - 82, [{ fill: GR }, { i: li, r: 10, line: '#fff', w: ln }]).replace(/<rect /g, '<rect transform="translate(0,82)" ') +
        `<rect x="176" y="${py}" width="208" height="${ly - py}" rx="${(ly - py) / 2}" fill="none" stroke="#fff" stroke-width="${ln}"/>` +
        `<g transform="translate(238,${(py + ly) / 2}) scale(1.15)" fill="none" stroke-linecap="butt"><path d="M-33,-19 L33,19 M-33,19 L33,-19" stroke="#fff" stroke-width="10"/>` +
        `<path d="M-33,-19 L33,19 M-33,19 L33,-19" stroke="${GR}" stroke-width="2.4"/><path d="${ramps}" stroke="#fff" stroke-width="4"/></g>` +
        T(320, ly - 16, exit, 56, F, { fill: '#fff', weight: 500, maxw: 70, max: 56 }) +
        dest(48, 162, [[next], [name]], { maxw: 464, max: 58, gap: 8 }) +
        `<rect x="214" y="${bot - 125}" width="64" height="48" rx="4" fill="${RD}" stroke="#fff" stroke-width="3"/>` + T(246, bot - 87, road, 38, F, { fill: '#fff', weight: 500, maxw: 54, max: 38 }) +
        TS.arrows.group([bent(63), bent(452)], { w: 18, fill: '#fff', head: { half: 1.7, back: 2.6, neck: 2.0 } }));
    } },
    // direction sign on a main road: road number field, destinations in capitals with distances, arrow peak on top
    { id: 'smerova-tabule', kind: 'direction', label: 'Direction sign with road number (blue)', draw: ({ name, next, km, road }) => {
      const rows = [[name, +km + 12], [next, km]];   // the farther destination on top
      const n = rows.reduce((a, [s]) => a + lines(s, 340, 74).length, 0);
      const H = 110 + n * 84, top = 108;
      // the peak (GeoHints 111): the plate's outline rises into a triangle; inside it the white band, and the blue field
      // rising into a low point of its own, its sides along the band
      const tx = 320, hb = 70, th = 104, bot = top + H - 17;
      const outer = [[3, top], [tx - hb, top], [tx, top - th], [tx + hb, top], [637, top], [637, top + H - 6], [3, top + H - 6]];
      const inn = TS.arrows.offset(outer, 11), fy = top + 11, I1 = inn[1], I2 = inn[2], I3 = inn[3];
      const up = (P, Q, h) => [P[0] + (Q[0] - P[0]) * h / (P[1] - Q[1]), P[1] - h];   // the point h above P on its way to Q
      const field = [[142, fy], I1, up(I1, I2, 16.5), [tx, fy - 31.6], up(I3, I2, 16.5), I3, [626, fy], [626, bot], [142, bot]];
      return svg(640, top + H,
        `<path d="${TS.arrows.rounded(outer, [16, 5, 6, 5, 16, 16, 16])}" fill="#fff" stroke="${BL}" stroke-width="3"/>` +
        `<rect x="14" y="${top + 11}" width="118" height="${H - 28}" rx="8" fill="${BL}"/><path d="${TS.arrows.rounded(field, [8, 2, 2, 3, 2, 2, 8, 8, 8])}" fill="${BL}"/>` +
        T(73, top + H / 2 + 24, road, 66, F, { fill: '#fff', weight: 500, maxw: 100, max: 66 }) +
        dest(170, top + 98, rows, { maxw: 330, max: 74, gap: 2, kmx: 604 })); } },
    // local arrow sign: black capitals on white, black arrow point
    { id: 'mistni', kind: 'direction', label: 'Local direction arrow (white)', draw: ({ name, next }) => {
      const rows = [[name], [next]];
      const n = rows.reduce((a, [s]) => a + lines(s, 470, 62).length, 0);
      const H = 70 + n * 70, h = H - 8;
      // GeoHints 112: a white plate with a thin black border; the point is solid black, from the plate's full height to the
      // tip (TS.arrows.plate: the white field ends flat at the neck)
      const pl = TS.arrows.plate({ x: 4, y: 4, w: 652, h, dir: 'right', tip: 0.49 * h, r: 0.05 * h, rTip: 0.03 * h, fill: '#fff', ink: K, band: 0.025 * h, fieldTip: 0.04, rField: 0.03 * h });
      return svg(660, H, pl.svg +
        dest(46, 92, rows, { maxw: Math.min(500, pl.neck - 46 - 22), max: 62, gap: 2, fill: K })); } },
    // motorway destinations arrow: green with the motorway (car) symbol panel, distances
    { id: 'dalnice-sipka', kind: 'motorway', label: 'Motorway destinations arrow (green)', draw: ({ name, next, km }) => {
      const rows = [[name, +km + 12], [next, km]];   // the farther destination on top
      const n = rows.reduce((a, [s]) => a + lines(s, 300, 62).length, 0);
      const H = 64 + n * 70, h = H - 4;
      // GeoHints 113: a thin green edge, the white band widening into a white wedge at the point, and the green field with
      // a very blunt point of its own; the car panel sits on the white band at the left (TS.arrows.plate)
      // the distances end a tenth of the height before the point starts (they never run into it); the point is 0.45 of the
      // height on the picture's two-line plate and grows more slowly on taller ones
      const pl = TS.arrows.plate({ x: 2, y: 2, w: 656, h, dir: 'right', tip: Math.min(0.45 * h, 90 + 0.2 * (h - 200)), r: 0.05 * h, rTip: 0.03 * h, fill: GR, ink: '#fff',
        margin: 0.012 * h, band: 0.042 * h, fieldTip: 0.18, fieldNeck: 0.04 * h, fieldStart: 132, rField: 0.035 * h });
      return svg(660, H, pl.svg +
        `<rect x="${pl.field.x0 - 120}" y="${pl.field.y0}" width="112" height="${pl.field.y1 - pl.field.y0}" rx="7" fill="${BL}"/>` +
        `<g transform="translate(68,${H / 2})" fill="#fff"><path d="M-40,-2 Q-40,-14 -30,-16 L-22,-34 Q-19,-40 -12,-40 L12,-40 Q19,-40 22,-34 L30,-16 Q40,-14 40,-2 L40,18 L-40,18 Z"/>` +
        `<path d="M-15,-33 L15,-33 L22,-17 L-22,-17 Z" fill="${BL}"/><rect x="-36" y="18" width="16" height="14" rx="3"/><rect x="20" y="18" width="16" height="14" rx="3"/>` +
        `<circle cx="-26" cy="0" r="6" fill="${BL}"/><circle cx="26" cy="0" r="6" fill="${BL}"/><rect x="-13" y="-4" width="26" height="4" fill="${BL}"/><rect x="-13" y="4" width="26" height="4" fill="${BL}"/></g>` +
        dest(170, 86, rows, { maxw: Math.min(300, pl.neck - 20 - 170 - 78), max: 62, gap: 2, kmx: pl.neck - 20 })); } },
    // group I: cycle direction plate (IS 21), after Commons photos (Tábor: 11 | PRAHA 105 / BOROTÍN 20; Třebíč District,
    // Elsterquelle): yellow arrow plate with a thin black rim and a black wedge in the point; the route field at the blunt
    // end (route number over a bicycle) behind a black bar; capitals, the distances right-aligned before the point
    { id: 'cyklo', kind: 'bike', label: 'Cycle route plate (yellow)', defaults: { route: '11' }, draw: ({ name, next, km, route }) => {
      const H = 200, YL = '#f8d313', T2 = 0.6 * H, fw = 138, x0 = 10 + fw + 26;
      const far = Math.max(1, Math.round(km)), near = Math.max(1, Math.round(far * 0.4));
      const rows = [[name, far], ...(next ? [[next, near]] : [])], two = rows.length > 1;
      const s = (two ? 40 : 54) / 0.69, up = (n) => String(n).toLocaleUpperCase('cs');
      const est = (n) => [...up(n)].length * 0.64 * s, nw = Math.min(900, Math.max(...rows.map(([n]) => est(n))));
      const dw = Math.max(...rows.map(([, d]) => String(d).length)) * 0.55 * s;
      const W = Math.round(x0 + nw + 40 + dw + 30 + T2), ys = two ? [86, 160] : [123];
      // as in the Tábor photo (looked at large): a yellow margin; a black band round the blunt end and along the top and
      // bottom that stops short of the point, its ends cut slanting; two yellow fields on it (route field, main field,
      // rounded at their left corners); the main field opens into the margin before the point; in the point a separate
      // black arrowhead whose outer edges follow the plate (TS.arrows.offset) and whose back is notched
      const m = 9, b = 8, out = TS.arrows.pointed({ x: 1, y: 1, w: W - 2, h: H - 2, dir: 'right', tip: T2 }).pts, inn = TS.arrows.offset(out, m);
      const [, Bn] = inn, [, Bw, Cn, Dw] = TS.arrows.offset(out, m + 2), on = (y, P) => [P[0] + (Cn[0] - P[0]) * (y - P[1]) / (Cn[1] - P[1]), y];
      const Pt = on(0.125 * H, Bw), Pb = on(0.875 * H, Dw), N = [Pt[0] + 0.075 * H, H / 2], ex = Bn[0] - 1, kx = ex - 36;
      const P2 = (p) => p.map((v) => v.toFixed(1)).join(',');
      return svg(W, H, `<path d="${TS.arrows.rounded(out, [16, 3, 7, 3, 16])}" fill="${YL}" stroke="#b9a447" stroke-width="2"/>` +
        `<path d="M${m + 10},${m} H${ex} L${ex - 12},${m + b} V${H - m - b} L${ex},${H - m} H${m + 10} Q${m},${H - m} ${m},${H - m - 10} V${m + 10} Q${m},${m} ${m + 10},${m} Z" fill="${K}"/>` +
        `<path d="M${P2(Pt)} L${P2(Cn)} L${P2(Pb)} L${P2(N)} Z" fill="${K}"/>` +
        `<rect x="${m + b}" y="${m + b}" width="${fw - m - b}" height="${H - 2 * (m + b)}" rx="14" fill="${YL}"/>` +
        `<path d="M${fw + 6 + 14},${m + b} H${ex} V${H - m - b} H${fw + 6 + 14} Q${fw + 6},${H - m - b} ${fw + 6},${H - m - b - 14} V${m + b + 14} Q${fw + 6},${m + b} ${fw + 6 + 14},${m + b} Z" fill="${YL}"/>` +
        T(10 + fw / 2, 84, String(route), 52 / 0.69, F, { fill: K, weight: 500, maxw: fw - 22, max: 52 / 0.69 }) +
        TS.bike(10 + fw / 2, 140, 92, K) +
        rows.map(([n, d], i) => T(x0, ys[i], up(n), s, F, { anchor: 'start', fill: K, weight: 500, maxw: Math.round(nw), max: s }) +
          T(kx, ys[i], String(d), s, F, { anchor: 'end', fill: K, weight: 500 })).join(''));
    } },
    // (group H) blue arrow direction sign (IS 3; Commons: 201 | KŘIVOKLÁT 13 / ZBEČNO 7 ►; 11 | KÁCOV ◄; RATAJE N. SÁZ. 8
    // ►): blue plate pointed at the right, a thin white band following its outline, the road number (road) in a field at
    // the blunt end behind a white bar, the destinations in capitals, the distances right before the point; the farther
    // destination on top
    { id: 'smerova-sipka', kind: 'direction', label: 'Arrow direction sign (blue)', draw: ({ name, next, km, road }) => {
      const rows = next ? [[name, +km + 12], [next, km]] : [[name, km]];
      const n = rows.reduce((a, [s]) => a + lines(s, 340, 66).length, 0), H = 52 + n * 76, h = H - 4, rw = road ? 118 : 0;
      // round 2 (user: "arrow tip is off"): as on the photos the white band widens into a white wedge at the point and the
      // blue field ends in a much blunter point of its own
      const pl = TS.arrows.plate({ x: 2, y: 2, w: 656, h, dir: 'right', tip: 0.34 * h, r: 0.06 * h, rTip: 0.02 * h, fill: BL, ink: '#fff',
        margin: 0.014 * h, band: 0.026 * h, fieldTip: 0.3, fieldNeck: 0.02 * h, rField: 0.04 * h });
      const f = pl.field, x0 = f.x0 + (rw ? rw + 26 : 24);
      return svg(660, H, pl.svg + (rw ? `<rect x="${f.x0 + rw}" y="${f.y0}" width="${0.022 * h}" height="${f.y1 - f.y0}" fill="#fff"/>` +
        T(f.x0 + rw / 2, H / 2 + 24, road, 66, F, { fill: '#fff', weight: 500, maxw: rw - 20, max: 66 }) : '') +
        dest(x0, H / 2 - (n - 1) * 38 + 24, rows, { maxw: Math.min(340, pl.neck - x0 - 100), max: 66, gap: 2, kmx: pl.neck - 6 }));
    } },
    // (group H) part of a municipality (Commons: HRADEC N. MOR. / BENKOVICE; JESENÍK NAD ODROU / BLAHUTOVICE; VYSOKÉ MÝTO /
    // BRTEČ; RVÁČOV / DRÁČOV): the white entry plate with the municipality (district) on the first line and the part (name)
    // under it in the same size; linking words smaller as on the entry plate
    { id: 'cast-obce', kind: 'hamlet', label: 'Part of a municipality (white)', needs: ['district'], draw: ({ name, district }) => {
      const ls = [...(district ? [words(district)] : []), ...lines(name, 760, 146)], S = 132, pitch = 150;
      const W = Math.round(Math.min(1000, Math.max(640, Math.max(...ls.map(wlen)) * CW * S + 110))), H = Math.round(116 + ls.length * pitch);
      const y0 = H / 2 - ((ls.length - 1) * pitch) / 2 + 0.36 * S;
      return svg(W, H,
        `<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="30" fill="#fff" stroke="#c9c9c9" stroke-width="3"/>` +
        `<rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="16" fill="#fff" stroke="${K}" stroke-width="18"/>` +
        ls.map((l, i) => TW(W / 2, y0 + i * pitch, l, S, { fill: K, weight: 600, ls: 0.02, maxw: W - 92, max: S })).join(''));
    } },
  ];

  TS.add('CZ', cz, { next: 'Vyškov', km: 20, road: '38', exit: 1 });
})();
