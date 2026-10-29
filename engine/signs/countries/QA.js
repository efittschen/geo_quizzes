// QA: Qatari signs carrying a place name, drawn after Commons photos (no GeoHints direction-sign pictures exist; see
// examples/QA.json). Blue boards, Arabic above the English form; place boards have an ornamented white edge and may
// carry the zone number in Western and Arabic-Indic digits. name = Arabic; alt = English form on the sign (Lijmiliya,
// Al Bidda; no fixed rule, so it is in `needs`); zone = the zone number (optional: the plates are left out without it).
(function () {
  const { T, svg } = TS;
  const AR = "'Noto Sans Arabic',sans-serif";
  const LA = "'Noto Sans','Arimo',sans-serif";   // humanist sans of the current Qatari signs
  const BLUE = '#1f55b0';
  const IND = (n) => String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);   // Arabic-Indic digits, a fixed rule

  const emA = (s) => [...String(s)].reduce((a, c) => a + (c === ' ' ? 0.24 : /[ً-ٰٟ]/.test(c) ? 0 : 0.44), 0);
  const emL = (s) => [...String(s)].reduce((a, c) => a + (c === ' ' ? 0.26 : /[A-Z]/.test(c) ? 0.68 : /[iljtf'’.\-]/.test(c) ? 0.28 : /[mw]/.test(c) ? 0.88 : 0.58), 0);
  const halves = (s) => {
    const sp = [...s].map((c, i) => (c === ' ' ? i : -1)).filter((i) => i > 0);
    if (!sp.length) return [s];
    const i = sp.reduce((b, c) => (Math.abs(c - s.length / 2) < Math.abs(b - s.length / 2) ? c : b));
    return [s.slice(0, i), s.slice(i + 1)];
  };
  // the white edge of the place boards: a line with concave (notched) corners and a small curl beside each notch
  const ornate = (W, H, m = 14, r = 22) => {
    const x0 = m, y0 = m, x1 = W - m, y1 = H - m;
    const edge = `M${x0 + r},${y0} L${x1 - r},${y0} A${r},${r} 0 0 0 ${x1},${y0 + r} L${x1},${y1 - r} A${r},${r} 0 0 0 ${x1 - r},${y1} L${x0 + r},${y1} A${r},${r} 0 0 0 ${x0},${y1 - r} L${x0},${y0 + r} A${r},${r} 0 0 0 ${x0 + r},${y0} Z`;
    const curl = (cx, cy, sx, sy) => `<path d="M${cx},${cy} q${sx * 10},${sy * -2} ${sx * 12},${sy * 8} M${cx},${cy} q${sx * -2},${sy * 10} ${sx * 8},${sy * 12}" fill="none" stroke="#fff" stroke-width="3"/>`;
    return `<path d="${edge}" fill="none" stroke="#fff" stroke-width="5"/>` + curl(x0 + 4, y0 + 4, 1, 1) + curl(x1 - 4, y0 + 4, -1, 1) + curl(x0 + 4, y1 - 4, 1, -1) + curl(x1 - 4, y1 - 4, -1, -1);
  };
  // the name lines (Arabic, then English), centred; long names wrap at a space
  const names = (o, A, E, room) => {
    const ar = emA(o.name) * A > room ? halves(o.name) : [o.name];
    const en = o.alt ? (emL(o.alt) * E > room ? halves(o.alt) : [o.alt]) : [];
    return [...ar.map((t) => ({ t, f: AR, s: A, w: 700, h: A * 1.45, d: A * 0.45 })), ...en.map((t) => ({ t, f: LA, s: E, w: 600, h: E * 1.22, d: E * 0.24 }))];
  };
  const tall = (L) => L.reduce((a, l) => a + l.h, 0);
  const column = (L, cx, y, room) => { let out = ''; for (const l of L) { y += l.h; out += T(cx, y - l.d, l.t, l.s, l.f, { fill: '#fff', weight: l.w, maxw: room, max: l.s }); } return out; };
  // the two zone plates: "Zone 73" and "منطقة ٧٣"
  const zone = (cx, y, z) => {
    const w = 104, h = 100, gap = 60, a = cx - gap / 2 - w, b = cx + gap / 2;
    return `<rect x="${a}" y="${y}" width="${w}" height="${h}" rx="6" fill="#f4f4f4" stroke="#999" stroke-width="2"/><rect x="${b}" y="${y}" width="${w}" height="${h}" rx="6" fill="#f4f4f4" stroke="#999" stroke-width="2"/>` +
      T(a + w / 2, y + 32, 'Zone', 26, LA, { fill: '#222', weight: 500 }) + T(a + w / 2, y + 84, z, 50, LA, { fill: '#111', weight: 600, maxw: w - 14, max: 50 }) +
      T(b + w / 2, y + 34, 'منطقة', 28, AR, { fill: '#111', weight: 700 }) + T(b + w / 2, y + 86, IND(z), 50, AR, { fill: '#111', weight: 700, maxw: w - 14, max: 50 });
  };
  const roundel = (cx, cy, r, v) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/><circle cx="${cx}" cy="${cy}" r="${r * 0.86}" fill="none" stroke="#d2202b" stroke-width="${r * 0.2}"/>` +
    T(cx, cy + r * 0.34, v, r * 0.95, LA, { fill: '#111', weight: 600, maxw: r * 1.2, max: r * 0.95 });
  const arrow = (x, y, deg, s, fill = '#fff') => `<g transform="translate(${x},${y}) rotate(${deg}) scale(${s})"><path d="M-7,34 L-7,-4 L-24,-4 L0,-36 L24,-4 L7,-4 L7,34 Z" fill="${fill}"/></g>`;

  const qa = [
    { id: 'zone', kind: 'hamlet', label: 'Area name board (blue)', needs: ['alt'],
      // blue board with an ornamented white edge naming a town or district: Arabic, English, and the zone number plates
      draw: (o) => {
        const W = 600, room = W - 90, L = names(o, 84, 70, room), plates = o.zone ? 130 : 0;
        const H = Math.round(Math.max(300, tall(L) + plates + 80));
        const y0 = (H - plates - tall(L)) / 2 - 2;
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="${BLUE}"/>` + ornate(W, H) + column(L, W / 2, y0, room) +
          (o.zone ? zone(W / 2, y0 + tall(L) + 14, o.zone) : ''));
      } },
    { id: 'entry', kind: 'entry', label: 'Town entry: speed limit on area board', needs: ['alt'],
      // the area board stood upright with the speed-limit roundel on top, at the edge of a town
      draw: (o) => {
        const W = 440, room = W - 70, L = names(o, 70, 56, room), R = 120, plates = o.zone ? 124 : 0;
        const H = Math.round(40 + 2 * R + 20 + tall(L) + plates + 40);
        const y0 = 40 + 2 * R + 14;
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="${BLUE}"/>` + ornate(W, H, 12, 18) + roundel(W / 2, 40 + R, R, o.speed) +
          column(L, W / 2, y0, room) + (o.zone ? zone(W / 2, y0 + tall(L) + 10, o.zone) : ''));
      } },
    { id: 'exit', kind: 'motorway', label: 'Expressway exit sign (blue)', needs: ['alt'],
      // white exit-number tab over a blue board: the destination (English left, Arabic right) and a white strip with the
      // distance, an arrow and مخرج EXIT
      draw: (o) => {
        const A = 62, E = 54, W = Math.round(Math.min(1000, Math.max(620, emL(o.alt || '') * E + emA(o.name) * A + 160)));
        const tab = 120, H = tab + 300, bx = W - 300;
        return svg(W, H, `<rect x="${bx}" y="2" width="290" height="${tab - 6}" rx="12" fill="#fff" stroke="#111" stroke-width="5"/>` +
          T(bx + 24, 58, 'مخرج', 34, AR, { fill: '#111', weight: 700, anchor: 'start' }) + T(bx + 24, 104, 'EXIT', 34, LA, { fill: '#111', weight: 600, anchor: 'start' }) +
          T(bx + 268, 96, o.exit, 88, LA, { fill: '#111', weight: 600, anchor: 'end', maxw: 110, max: 88 }) +
          `<rect x="2" y="${tab}" width="${W - 4}" height="${H - tab - 2}" rx="12" fill="${BLUE}"/><rect x="11" y="${tab + 9}" width="${W - 22}" height="${H - tab - 20}" rx="8" fill="none" stroke="#fff" stroke-width="5"/>` +
          (o.alt ? T(40, tab + 102, o.alt, E, LA, { fill: '#fff', anchor: 'start', weight: 600, maxw: W * 0.5, max: E }) : '') +
          T(W - 40, tab + 104, o.name, A, AR, { fill: '#fff', anchor: 'end', weight: 700, maxw: o.alt ? W * 0.38 : W - 80, max: A }) +
          `<rect x="22" y="${tab + 150}" width="${W - 44}" height="${H - tab - 172}" fill="#f2f2f2"/>` +
          T(40, tab + 204, `${IND(o.m)} م`, 40, AR, { fill: '#111', anchor: 'start', weight: 700 }) + T(40, tab + 266, `${o.m} m`, 44, LA, { fill: '#111', anchor: 'start', weight: 600 }) +
          arrow(W / 2, tab + 222, 45, 1.3, '#111') +
          T(W - 40, tab + 204, 'مخرج', 40, AR, { fill: '#111', anchor: 'end', weight: 700 }) + T(W - 40, tab + 266, 'EXIT', 44, LA, { fill: '#111', anchor: 'end', weight: 600 }));
      } },
    { id: 'direction', kind: 'direction', label: 'Direction sign (blue)', needs: ['alt'],
      // blue panel of a direction stack: arrow at the side, Arabic over English beside it
      draw: (o) => {
        const W = 440, col = 110, pad = 26, room = W - col - pad * 2, left = o.dir !== 'right';
        const L = names(o, 64, 52, room), H = Math.round(Math.max(200, tall(L) + 64));
        const cx = left ? col + (W - col) / 2 - 8 : (W - col) / 2 + 8;
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="${BLUE}"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="6" fill="none" stroke="#fff" stroke-width="4"/>` +
          // Simaisma photo: a chevron head with its barb ends cut parallel to the shaft, on a short broad shaft (TS.arrows)
          column(L, cx, (H - tall(L)) / 2 + 4, room) + TS.arrows.dir(left ? col / 2 + 8 : W - col / 2 - 8, H / 2, left ? 270 : 90, 84,
            { w: 21, fill: '#fff', head: { half: 1.9, back: 1.6, cut: 0.85, neck: 1.7 } }));
      } },
  ];
  qa.find((t) => t.id === 'entry').defaults = { speed: 60 };
  qa.find((t) => t.id === 'exit').defaults = { exit: 6, m: 500 };
  TS.add('QA', qa, {});
})();
