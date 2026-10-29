// HU: signs carrying a place name, drawn after the GeoHints pictures (see examples/HU.json for which).
(function () {
  const { T, svg } = TS;
  // town signs in DIN-like lettering (DINish), direction signs in the narrow Hungarian road lettering (DINish Condensed)
  const F = "'DINish','Noto Sans',sans-serif";
  const FC = "'DINish Condensed','DINish','Noto Sans',sans-serif";
  const RD = '#d9271c', K = '#1e1e1e', GR = '#0f6b4f', BL = '#1f56a8', INK = '#eef0ec';
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
  // Hungarian town names are mostly single long words (Hajdúböszörmény): the plate grows with the name up to 1000
  const plateW = (s, max, cw) => Math.round(Math.min(1000, Math.max(640, s.length * cw * max + 120)));
  // an open road-sign arrow (chevron head and shaft), pointing left or right
  // GeoHints 146, measured on the pixels: the chevron stands apart from the shaft (a gap of twice the shaft's width before
  // its inner corner), its strokes thinner than the shaft (0.6) and its arms at 45 degrees (TS.arrows, detached open head)
  const openArrow = (x, y, dir, len, col) => { const d = dir === 'left' ? -1 : 1;
    return TS.arrows.straight(x - d * len / 2, y, x + d * len / 2, y, { w: 12.5, fill: col, head: { open: true, half: 3.3, back: 3.3, sw: 0.6, gap: 2.0 } }); };
  // a road-number badge: number in a white outline whose bottom ends in a point
  const badge = (x, y, w, h, road, col) => `<path d="M${x},${y} L${x + w},${y} L${x + w},${y + h * 0.78} L${x + w / 2},${y + h} L${x},${y + h * 0.78} Z" fill="none" stroke="${col}" stroke-width="3.5" stroke-linejoin="round"/>` +
    T(x + w / 2, y + h * 0.7, road, h * 0.62, FC, { fill: col, weight: 600, maxw: w * 0.8, max: h * 0.62 });

  // white entry sign with a red border; the exit sign has a black border and a red bar
  const town = (name, end) => {
    const max = 130, W = plateW(name, max, 0.5), H = end ? 221 : 236;
    const frame = end
      ? `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="#fff" stroke="#dcdcdc" stroke-width="2"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="12" fill="#fff" stroke="#000" stroke-width="12"/>`
      : `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="#fff" stroke="${K}" stroke-width="3"/><rect x="21" y="21" width="${W - 42}" height="${H - 42}" rx="16" fill="#fff" stroke="${RD}" stroke-width="12"/>`;
    // exit bar (group B): behind the name, corner to corner of the field inside the frame, cut by the frame
    return svg(W, H, frame + (end ? TS.exitbar({ box: [17, 17, W - 34, H - 34, 6], b: 0, t: 1, width: 27, fill: '#cb2129' }) : '') +
      T(W / 2, H / 2 + max * 0.36, name, max, F, { fill: K, weight: 500, ls: 0.06, maxw: W - 110, max }));
  };

  const hu = [
    { id: 'telepules-eleje', kind: 'entry', label: 'Town entry (red border)', draw: ({ name }) => town(name, false) },
    { id: 'telepules-vege', kind: 'exit', label: 'Town exit (red bar)', draw: ({ name }) => town(name, true) },
    // green place-name sign: white name in a white border
    { id: 'helysegnev', kind: 'hamlet', label: 'Place-name sign (green)', draw: ({ name }) => {
      const max = 116, W = plateW(name, max, 0.56), H = 260;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="16" fill="${GR}"/><rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="10" fill="none" stroke="${INK}" stroke-width="9"/>` +
        T(W / 2, H / 2 + max * 0.36, name, max, F, { fill: INK, weight: 600, ls: 0.07, maxw: W - 120, max })); } },
    // two direction tables: the place to the left, the next town to the right (open arrows)
    { id: 'iranyjelzo', kind: 'direction', label: 'Direction tables (green)', draw: ({ name, next }) => {
      const max = 74, W = Math.round(Math.min(1000, Math.max(640, Math.max(name.length, next.length) * 0.43 * max + 250)));
      const row = (y, s, dir) => `<rect x="4" y="${y}" width="${W - 8}" height="150" rx="10" fill="${GR}" stroke="${INK}" stroke-width="5"/>` +
        openArrow(dir === 'left' ? 96 : W - 96, y + 75, dir, 110, INK) +
        T(dir === 'left' ? 180 : 40, y + 75 + max * 0.36, s, max, FC, { fill: INK, weight: 600, anchor: 'start', maxw: W - 230, max });
      return svg(W, 312, row(4, name, 'left') + row(158, next, 'right')); } },
    // junction diagram at a roundabout: the place ahead (white field), the next town to the left with its road badge
    // (group D) picture 145 measured: the ring (centre-line radius 37, width 13) is open on the lower left, from just
    // below the left arm to just left of the stem (108 to 151 degrees, clockwise from east); arms and stem joined to it,
    // their heads chevrons with barb ends cut parallel to the shaft (TS.arrows); five-sided road plates on the arms and
    // the stem, green field and white rim (Commons drawings, shared/shields.js); the blue motorway panel holds the E-road
    // plate, the motorway plate, the motorway sign and the vignette plate. road: the plate under `next`; road2: the cross
    // road on the arms; road3: the road straight on; mroad / eroad: the motorway and its E road
    { id: 'csomopont', kind: 'direction', label: 'Roundabout diagram (green)', defaults: { road2: '338', road3: '36', mroad: 'M3', eroad: 'E579' },
      draw: ({ name, next, road, road2, road3, mroad, eroad }) => {
      const nl = lines(next, 190, 46, 0.43), S = TS.shields, cx = 238, cy = 226, r = 37, w = 13;
      const HEAD = { base: 'din', half: 1.85, back: 1.9, cut: 1.3, neck: 2.25 };
      const a = (deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
      const [x0, y0] = a(151), [x1, y1] = a(108);   // the ring's two ends; the arc runs clockwise from the first to the second
      const plate = (pcx, pcy, h, n, field = GR) => (n ? S.huPlate(pcx - S.huPlate.width(h) / 2, pcy - h / 2, h, n, { field, fg: INK, font: FC, weight: 600, capEm: 0.7 }) : '');
      const vign = (x, y, s) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="3" fill="#f2f2ee"/>` +
        T(x + s / 2, y + s * 0.42, 'MATRICA', s * 0.2, FC, { fill: '#1b1b1b', weight: 600, maxw: s * 0.84, max: s * 0.2 }) + `<rect x="${x + s * 0.1}" y="${y + s * 0.5}" width="${s * 0.8}" height="1.6" fill="#1b1b1b"/>` +
        T(x + s / 2, y + s * 0.78, 'VIGNETTE', s * 0.2, FC, { fill: '#1b1b1b', weight: 600, maxw: s * 0.84, max: s * 0.2 });
      return svg(620, 400,
        `<rect x="3" y="3" width="614" height="394" rx="10" fill="${GR}" stroke="${INK}" stroke-width="5"/>` +
        `<rect x="282" y="34" width="306" height="54" rx="5" fill="${INK}"/>` + T(435, 74, name, 40, FC, { fill: '#1b1b1b', weight: 600, maxw: 286, max: 40 }) +
        nl.map((l, i) => T(28, (nl.length > 1 ? 70 : 104) + i * 44, l, 46, FC, { fill: INK, weight: 600, anchor: 'start', maxw: 196, max: 46 })).join('') +
        `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 1 1 ${x1.toFixed(1)},${y1.toFixed(1)}" fill="none" stroke="${INK}" stroke-width="${w}"/>` +
        TS.arrows.group([{ pts: [[cx, cy - r], [cx, 40]] }, { pts: [[cx - r, cy], [44, cy]] }, { pts: [[cx + r, cy], [602, cy]] }, { pts: [[cx, 384], [cx, cy + r]], head: null }], { w, fill: INK, head: HEAD }) +
        plate(78, 158, 50, road) + plate(cx, 128, 48, road3) + plate(122, cy, 48, road2) + plate(420, cy, 48, road2) +
        `<rect x="300" y="280" width="280" height="84" rx="6" fill="${INK}"/><rect x="303" y="283" width="274" height="78" rx="4" fill="${BL}"/>` +
        (eroad ? S.huE(314, 299, 46, eroad, { w: 64, field: GR, fg: INK, font: FC, weight: 600, capEm: 0.7 }) : '') +
        (mroad ? plate(418, 322, 48, mroad, BL) : '') + S.huMotorway(462, 299, 46, { field: BL, fg: INK }) + vign(518, 299, 46));
    } },
    // motorway gantry: exit (kilometre) number in a circle above, destinations centred, lane arrows pointing down
    // (direction-signs 144) the exit number on a square blue plate above: blue edge, white border line, white disc, blue
    // figures; the first destination led by the road marks, the E-road plate and the motorway's number in its pointed
    // outline (road, eroad: road numbers, defaulted)
    { id: 'autopalya', kind: 'motorway', label: 'Motorway gantry (blue)', defaults: { road: 'M35', eroad: 'E 79' }, draw: ({ name, next, exit, road, eroad }) => {
      const S = 64, cw = 0.43, mh = 64, est = (s) => s.length * cw * S;   // the marks about 1.5 cap heights tall, as on the picture
      const ew = eroad ? mh * (0.5 + 0.3 * String(eroad).length) : 0, bw = road ? Math.max(mh * 1.5, String(road).length * mh * 0.42 + 24) : 0;
      const mw = (ew ? ew + 14 : 0) + (bw ? bw + 18 : 0);
      const rows = [next, name].map((s) => lines(s, 520, S, cw));
      const W = Math.round(Math.min(1000, Math.max(640, mw + est(rows[0][0]) + 100, ...rows.flat().map((l) => est(l) + 100)))), cx = W / 2, room = W - 100;
      const n = rows.reduce((a, l) => a + l.length, 0), H = 134 + n * 82;
      let y = 116 + 98, body = '';
      rows.forEach((ls, r) => ls.forEach((l, i) => {
        if (!r && !i && mw) {   // the marks and the first line, centred together
          const t = Math.min(room - mw, est(l)), x0 = cx - (mw + t) / 2;
          if (ew) body += TS.shields.ePlate(x0, y - 22 - mh / 2, ew, mh, eroad, { font: FC, capEm: 0.69, weight: 600 });
          if (bw) body += badge(x0 + (ew ? ew + 14 : 0), y - 24 - mh / 2, bw, mh * 1.14, road, INK);
          body += T(x0 + mw, y, l, S, FC, { fill: INK, weight: 600, anchor: 'start', maxw: room - mw, max: S });
        } else body += T(cx, y, l, S, FC, { fill: INK, weight: 600, maxw: room, max: S });
        y += 82;
      }));
      const P = 112, px = cx - P / 2;
      return svg(W, 116 + H,
        TS.frames.rect(px, 4, P, P, 3, `fill="${BL}"`) + TS.frames.rect(px + 8.5, 12.5, P - 17, P - 17, 9, `fill="none" stroke="${INK}" stroke-width="5"`) +
        `<circle cx="${cx}" cy="60" r="${P / 2 - 15}" fill="${INK}"/>` + T(cx, 76.5, exit, 48, FC, { fill: BL, weight: 600, maxw: P - 40, max: 48 }) +
        `<rect x="3" y="116" width="${W - 6}" height="${H - 4}" rx="12" fill="${BL}"/><rect x="13" y="126" width="${W - 26}" height="${H - 24}" rx="8" fill="none" stroke="${INK}" stroke-width="4"/>` + body +
        `<path d="M60,${116 + H - 70} L60,${116 + H - 36} M36,${116 + H - 58} L60,${116 + H - 32} L84,${116 + H - 58} M${W - 60},${116 + H - 70} L${W - 60},${116 + H - 36} M${W - 84},${116 + H - 58} L${W - 60},${116 + H - 32} L${W - 36},${116 + H - 58}" fill="none" stroke="${INK}" stroke-width="9"/>`); } },
  ];

  TS.add('HU', hu, { next: 'Debrecen', road: '38', exit: 187 });
})();
