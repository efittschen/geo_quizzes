// TR: signs carrying a place name, drawn after the GeoHints pictures (see examples/TR.json for which).
(function () {
  const { T, svg } = TS;
  // Turkish signs use Highway Gothic-based alphabets (E-Serisi, O-Serisi on motorways); Overpass stands in
  const F = "'Overpass','Noto Sans',sans-serif";
  const BL = '#12409a', BL2 = '#1659ad', GR = '#0b5e45', RD = '#c8202a', INK = '#f3f4f2';
  // helper: the name as signs print it: without a quiz's disambiguating "(Konya)", capitals by Turkish rules (i -> İ)
  const clean = (s) => String(s).replace(/\s*\([^)]*\)\s*$/, '');
  const caps = (s) => clean(s).toLocaleUpperCase('tr');
  // helper: a name split into two lines at the space (or after the hyphen) nearest its middle; null if it has none
  const split2 = (s) => {
    let best = null;
    for (let i = 1; i < s.length - 1; i++) {
      const c = s[i] === ' ' ? [s.slice(0, i), s.slice(i + 1)] : s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : null;
      if (c && (!best || Math.max(c[0].length, c[1].length) < Math.max(best[0].length, best[1].length))) best = c;
    }
    return best;
  };
  // long names are spaced less widely before their letters get smaller
  const spacing = (s, wide) => { const n = clean(s).length; return n <= 9 ? wide : n <= 12 ? wide * 0.6 : wide * 0.35; };
  const arrowR = (x, y, s, col) => `<path d="M${x - 30 * s},${y - 7 * s} L${x + 4 * s},${y - 7 * s} L${x + 4 * s},${y - 20 * s} L${x + 30 * s},${y} L${x + 4 * s},${y + 20 * s} L${x + 4 * s},${y + 7 * s} L${x - 30 * s},${y + 7 * s} Z" fill="${col}"/>`;
  const arrowL = (x, y, s, col) => `<g transform="translate(${2 * x},0) scale(-1,1)">${arrowR(x, y, s, col)}</g>`;
  const arrowU = (x, y, s, col) => `<g transform="rotate(-90 ${x} ${y})">${arrowR(x, y, s, col)}</g>`;
  const arrowD = (x, y, s, col) => `<g transform="rotate(90 ${x} ${y})">${arrowR(x, y, s, col)}</g>`;

  // settlement entry/exit: white capitals, widely spaced, on blue inside a white border; the plate grows with the
  // name, a two-word name goes on two lines
  const town = (name, end) => {
    // as the photos (city-signs 151, 152): capitals 0.28 of the plate's height, spaced about 1.1 cap heights apart, a
    // third of the height free at each end, so "ÖMERANLI" gives a plate about 3 times as long as high
    const n = caps(name), max = 84, sp = spacing(name, 0.14), cw = 0.66 + sp;
    const ls = n.length * cw * max * 0.8 > 860 && split2(n) || [n];
    const W = Math.round(Math.min(1000, Math.max(640, Math.max(...ls.map((l) => l.length)) * cw * max + 110)));
    const H = ls.length > 1 ? 330 : 210, ys = ls.length > 1 ? [144, 258] : [135];
    return svg(W, H,
      `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${BL}"/><rect x="13" y="13" width="${W - 26}" height="${H - 26}" rx="12" fill="none" stroke="${INK}" stroke-width="8"/>` +
      // exit bar (group B): behind the lettering, from the bottom-left corner to near the top-right one, cut flat by
      // the white border
      (end ? TS.exitbar({ box: [17, 17, W - 34, H - 34, 8], b: 0.054, t: 0.905, width: 20, fill: RD }) : '') +
      ls.map((l, i) => T(W / 2, ys[i], l, max, F, { fill: INK, weight: 600, ls: sp, maxw: W - 100, max })).join(''));
  };

  const tr = [
    { id: 'giris', kind: 'entry', label: 'Settlement entry (blue)', draw: ({ name }) => town(name, false) },
    { id: 'cikis', kind: 'exit', label: 'Settlement exit (blue)', draw: ({ name }) => town(name, true) },
    // white local direction tables: the place to the left (name set right), the next town to the right
    { id: 'yon-beyaz', kind: 'direction', label: 'Local direction tables (white)', draw: ({ name, next }) => {
      const row = (y, s, left) => `<rect x="6" y="${y}" width="508" height="96" rx="10" fill="#fff" stroke="#1d1d1d" stroke-width="5"/>` +
        (left ? arrowL(64, y + 48, 1.15, '#1d1d1d') + T(486, y + 66, clean(s), 54, F, { fill: '#1d1d1d', weight: 600, anchor: 'end', ls: 0.03, maxw: 370, max: 54 })
          : T(34, y + 66, clean(s), 54, F, { fill: '#1d1d1d', weight: 600, anchor: 'start', ls: 0.03, maxw: 370, max: 54 }) + arrowR(456, y + 48, 1.15, '#1d1d1d'));
      return svg(520, 212, row(6, name, true) + row(110, next, false)); } },
    // motorway gantry: two destinations side by side, lane arrows pointing down, European route plate
    { id: 'otoyol', kind: 'motorway', label: 'Motorway gantry (green)', draw: ({ name, next, road }) => svg(900, 260,
      `<rect x="2" y="2" width="896" height="256" rx="10" fill="${GR}" stroke="#d6e4dc" stroke-width="3"/><rect x="12" y="12" width="876" height="236" rx="6" fill="none" stroke="${INK}" stroke-width="3"/>` +
      T(250, 100, clean(next), 62, F, { fill: INK, weight: 600, ls: 0.12, maxw: 380, max: 62 }) + T(650, 100, clean(name), 62, F, { fill: INK, weight: 600, ls: 0.12, maxw: 380, max: 62 }) +
      arrowD(150, 190, 1.0, INK) + arrowD(450, 190, 1.0, INK) + arrowD(750, 190, 1.0, INK) +
      `<rect x="560" y="166" width="124" height="48" rx="4" fill="none" stroke="${INK}" stroke-width="3"/>` + T(622, 202, road, 36, F, { fill: INK, weight: 600, ls: 0.08, maxw: 108, max: 36 })) },
    // blue direction tables: the place straight on, the next town to the right; widely spaced mixed case
    { id: 'yon-mavi', kind: 'direction', label: 'Direction tables (blue)', draw: ({ name, next }) => {
      // one plate (direction-signs 217): a blue edge outside the white border line, the rows parted by a white line
      const row = (y, s, up) => T(36, y + 76, clean(s), 64, F, { fill: INK, weight: 600, anchor: 'start', ls: spacing(s, 0.2), maxw: 470, max: 64 }) + (up ? arrowU(556, y + 56, 1.3, INK) : arrowR(556, y + 56, 1.3, INK));
      return svg(620, 241, TS.frames.plate(620, 241, [{ r: 10, fill: BL2 }, { i: 5, r: 7, line: INK, w: 5 }]) +
        `<path d="M8,120.5 L612,120.5" stroke="${INK}" stroke-width="5"/>` + row(8, name, true) + row(121, next, false)); } },
  ];

  TS.add('TR', tr, { next: 'Samsun', road: 'E-80' });
})();
