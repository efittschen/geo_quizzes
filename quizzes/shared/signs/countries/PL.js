// PL: signs carrying a place name, drawn after the GeoHints pictures (see examples/PL.json for which).
(function () {
  const { T, svg } = TS;
  // Drogowskaz (the Polish road-sign alphabet) has no open digitisation: Lexend stands in
  const F = "'Lexend','Noto Sans',sans-serif";
  const G = '#2d5d31', B = '#00339b', R = '#d30000', Y = '#ffbc0d';
  const LS = 0.05;                       // Drogowskaz is spaced wider than Lexend
  const W1 = 0.62;                        // its average letter width (em, spacing included), for layout guesses only
  // helper: a name split into two lines at the space (or after the hyphen) nearest its middle; null if it has none
  const split2 = (s) => {
    let best = null;
    for (let i = 1; i < s.length - 1; i++) {
      const c = s[i] === ' ' ? [s.slice(0, i), s.slice(i + 1)] : s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : null;
      if (c && (!best || Math.max(c[0].length, c[1].length) < Math.max(best[0].length, best[1].length))) best = c;
    }
    return best;
  };
  // the lines a name takes on a plate whose text may be maxw wide at letter size max: one line while it fits at
  // 80 % of max, else two (as Polish signs print "Tomaszów / Mazowiecki")
  const lines = (name, maxw, max) => (name.length * W1 * max * 0.8 > maxw && split2(name)) || [name];
  // a road plate: national roads (1-2 figures) white on red, regional roads (3 figures) black on yellow
  const roadPlate = (x, y, w, h, road) => {
    const nat = String(road).length < 3;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.06}" fill="${nat ? R : Y}" stroke="${nat ? '#fff' : '#000'}" stroke-width="${h * 0.055}"/>` +
      T(x + w / 2, y + h * 0.8, road, h * 0.8, F, { fill: nat ? '#fff' : '#000', weight: 500, ls: LS, maxw: w * 0.82, max: h * 0.8 });
  };

  // E-17a / E-18a: the name in white on green, inside a white border; the plate grows with the name, a long
  // two-word name goes on two lines of the same size
  const townPlate = (name, end) => {
    const max = 140, one = name.length * W1 * max;
    const ls = lines(name, 900, max);
    const H = ls.length > 1 ? 500 : 330;
    const W = Math.round(Math.min(1020, Math.max(640, Math.max(...ls.map((l) => l.length * W1 * max)) + 130)));
    const ys = ls.length > 1 ? [215, 385] : [214];
    return svg(W, H,
      `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="20" fill="${G}"/><rect x="9.5" y="9.5" width="${W - 19}" height="${H - 19}" rx="12" fill="none" stroke="#fff" stroke-width="9"/>` +
      ls.map((l, i) => T(W / 2, ys[i], l, max, F, { fill: '#fff', weight: 500, ls: LS, maxw: W - 110, max })).join('') +
      (end ? `<clipPath id="pl-x"><rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="8"/></clipPath><g clip-path="url(#pl-x)"><path d="M14,${H - 14} L${W - 14},14" stroke="${R}" stroke-width="${H * 0.1}"/></g>` : ''));
  };

  const pl = [
    { id: 'e17a', kind: 'entry', label: 'Town entry (green)', draw: ({ name }) => townPlate(name, false) },
    { id: 'e18a', kind: 'exit', label: 'Town exit (green, red bar)', draw: ({ name }) => townPlate(name, true) },
    // direction board: the destination ahead on top with its road plate, the next town to the left
    { id: 'tablica', kind: 'direction', label: 'Direction board (green)', draw: ({ name, next, road }) => {
      const top = lines(name, 360, 80);
      const nl = lines(next, 250, 66);
      return svg(640, 454,
        `<rect x="1" y="1" width="638" height="452" rx="12" fill="${G}"/><rect x="5" y="5" width="630" height="444" rx="9" fill="none" stroke="#fff" stroke-width="3.5"/>` +
        roadPlate(top.length > 1 ? 70 : 122, 20, 84, 78, road) +
        (top.length > 1 ? top.map((l, i) => T(176, 62 + i * 66, l, 62, F, { fill: '#fff', weight: 500, ls: LS, anchor: 'start', maxw: 430, max: 62 })).join('')
          : T(250, 95, top[0], 80, F, { fill: '#fff', weight: 500, ls: LS, anchor: 'start', maxw: 370, max: 80 })) +
        `<path d="M341,450 L341,182 L351,160 L361,182 L361,450 Z M361,250 L361,268 L248,268 L236,259 L248,250 Z" fill="#fff"/>` +
        nl.map((l, i) => T(166, (nl.length > 1 ? 372 : 398) + i * 60, l, 64, F, { fill: '#fff', weight: 500, ls: LS, maxw: 290, max: 64 })).join('')); } },
    // motorway advance sign: the motorway goes on to the next town, the exit (green panel, regional road plate) to the place
    { id: 'autostrada', kind: 'motorway', label: 'Motorway exit advance sign', draw: ({ name, next, road }) => {
      const nl = lines(name, 360, 44);
      return svg(640, 290,
        `<rect x="1" y="1" width="638" height="288" rx="11" fill="${B}" stroke="#fff" stroke-width="2.5"/>` +
        `<rect x="12" y="18" width="80" height="42" rx="4" fill="${R}" stroke="#fff" stroke-width="2.5"/>` + T(52, 52, 'A4', 34, F, { fill: '#fff', weight: 500, ls: LS, maxw: 64, max: 34 }) +
        T(118, 50, next, 42, F, { fill: '#fff', weight: 500, ls: LS, anchor: 'start', maxw: 500, max: 42 }) +
        `<rect x="140" y="72" width="494" height="126" rx="6" fill="${G}" stroke="#fff" stroke-width="2.5"/>` +
        roadPlate(148, 111, 100, 42, road) +
        nl.map((l, i) => T(258, (nl.length > 1 ? 118 : 150) + i * 54, l, 44, F, { fill: '#fff', weight: 500, ls: LS, anchor: 'start', maxw: 366, max: 44 })).join('') +
        // GeoHints 185 (same 640 x 290 frame): the two motorway lanes under one chevron head with blunt barbs, parted by a
        // thin line that runs a little into the head; the exit lane leaving the right lane, curving to about 37 degrees and
        // ending in its own smaller head (TS.arrows)
        TS.arrows.straight(53.75, 278, 53.75, 92.5, { w: 22.5, fill: '#fff', head: { half: 1.22, back: 1.28, cut: 0.61, neck: 1.13 } }) +
        `<rect x="51.25" y="110" width="5" height="169" fill="${B}"/>` +
        TS.arrows.arrow([[60.6, 278], [60.6, 194, 90], [127.5, 143.75]], { w: 7.5, fill: '#fff', head: { half: 1.6, back: 1.7, cut: 0.8, neck: 1.5 } }) +
        `<circle cx="90" cy="172" r="19" fill="#fff"/><circle cx="90" cy="172" r="15.5" fill="none" stroke="${R}" stroke-width="5"/>` + T(90, 180, '50', 19, F, { weight: 500 }) +
        `<rect x="466" y="244" width="168" height="44" rx="3" fill="${B}" stroke="#fff" stroke-width="2.5"/>` + T(550, 278, '500  m', 32, F, { fill: '#fff', weight: 500, ls: LS })); } },
    // E-6 fingerpost to a village, the sign on smaller roads (Commons photos: 9 Gnojno, 4 Burzec, 4 Suchoczasy, Plemięta 4):
    // a teal-green arrow plate (the photos' colour, PG) with a white rim at its very edge that widens into a white wedge at
    // the point, where the green field ends in a blunter point of its own (Plemięta, Suchoczasy, Burzec); the distance in
    // km before the name; a long name on two lines of the same size beside the figure
    { id: 'drogowskaz', kind: 'direction', label: 'Village fingerpost (green)', defaults: { km: 4 }, draw: ({ name, km }) => {
      const PG = '#0b7f6d', z = 92, h1 = 150, L = lines(name, 760, z), n = L.length, H = h1 + (n - 1) * 92;
      const kTxt = km != null ? String(km) : '', kw = kTxt ? (kTxt.length * 0.6 + 0.35) * z : 0;
      // the point and its white wedge scale with the plate's own height (a two-line plate keeps the one-line point's shape)
      const tw = Math.max(...L.map((l) => [...l].length * W1 * z)), ph = H - 2, tip = 0.5 * ph;   // the point half as long as the plate is high
      const W = Math.round(tip + 0.12 * h1 + kw + tw + 0.3 * h1);
      const pl = TS.arrows.plate({ x: 1, y: 1, w: W - 2, h: ph, dir: 'left', tip, r: 0.025 * ph, rTip: 0.01 * ph, rNeck: 0.005 * ph, fill: PG, ink: '#fff',
        margin: 0, band: 0.045 * ph, fieldTip: 0.82, rField: 0.015 * ph, rFieldTip: 0.005 * ph, edge: '#9aa5a2', edgeW: 1.5 });
      const x0 = pl.neck + 0.08 * h1, cy = H / 2, c = 0.72 * z, y0 = cy - ((n - 1) * 92) / 2 + c / 2;
      return svg(W, H, pl.svg + (kTxt ? T(x0, cy + c / 2, kTxt, z, F, { fill: '#fff', weight: 500, ls: LS, anchor: 'start' }) : '') +
        L.map((l, i) => T(x0 + kw, y0 + i * 92, l, z, F, { fill: '#fff', weight: 500, ls: LS, anchor: 'start', maxw: pl.field.x1 - x0 - kw - 0.12 * h1, max: z })).join(''));
    } },
    // E-2a junction board (Commons photos: Koszalin, Kołobrzeg, Recław, Kamienna Góra, Przedwojów, Smołdzino): one row per
    // direction, split by white lines; arrows straight on and to the left stand at the left, an arrow to the right at the
    // right end; before the name of a numbered road its plate, and on a European route the green E plate with a white rim
    // (Recław: 3 E65 Świnoujście); the board in the photos' teal green (PG), not the darker G of the older templates
    { id: 'tablica-e2a', kind: 'direction', label: 'Junction board, rows (green)', defaults: { eroad: 'E65' }, draw: ({ name, next, road, eroad }) => {
      const PG = '#0b7f6d', z = 66, c = 0.72 * z, lh = 1.25 * z, rows = [{ s: name, dir: 0, road }, { s: next, dir: 90 }];
      const pw = road ? Math.max(84, String(road).length * 0.62 * 52 + 30) : 0, ew = road && eroad ? Math.max(110, String(eroad).length * 0.62 * 50 + 34) : 0;
      rows.forEach((r) => { r.L = lines(r.s, 620, z); r.h = 118 + (r.L.length - 1) * lh; r.tw = Math.max(...r.L.map((l) => [...l].length * W1 * z)); });
      const xl = 110, xr = 110;
      rows.forEach((r) => { r.x = xl + (r.road ? pw + 18 + (ew ? ew + 22 : 4) : 0); });
      const W = Math.round(Math.max(640, ...rows.map((r) => r.x + r.tw + (r.dir === 90 ? xr : 40))));
      const Hh = Math.round(rows.reduce((a, r) => a + r.h, 0) + 14);
      let y = 7, body = '';
      rows.forEach((r, i) => {
        const cy = y + r.h / 2, t0 = cy - ((r.L.length - 1) * lh) / 2 + c / 2;
        if (i) body += `<path d="M5,${y} L${W - 5},${y}" stroke="#fff" stroke-width="3.5"/>`;
        body += TS.arrows.dir(r.dir === 90 ? W - xr / 2 - 4 : xl / 2 + 4, cy, r.dir, 68, { w: 15, fill: '#fff', head: { half: 1.75, back: 2, cut: 0, neck: 2 } });
        if (r.road) body += roadPlate(xl, cy - 31, pw, 62, r.road);
        if (r.road && ew) body += TS.shields.ePlate(xl + pw + 18, cy - 29, ew, 58, eroad, { field: PG, font: F, capEm: 0.72, cap: 0.6, rx: 0.08, sw: 0.06, inset: 0.02 });
        body += r.L.map((l, j) => T(r.x, t0 + j * lh, l, z, F, { fill: '#fff', weight: 500, ls: LS, anchor: 'start', maxw: W - r.x - (r.dir === 90 ? xr : 30), max: z })).join('');
        y += r.h;
      });
      return svg(W, Hh, `<rect x="1" y="1" width="${W - 2}" height="${Hh - 2}" rx="10" fill="${PG}" stroke="#9aa5a2" stroke-width="1.5"/><rect x="5" y="5" width="${W - 10}" height="${Hh - 10}" rx="7" fill="none" stroke="#fff" stroke-width="3.5"/>` + body);
    } },
    // group I: bike trail table (R-3), after Commons photos (Kromołów: Zamek Ogrodzieniec / Ryczów / Kraków; Kraków-
    // Morawy-Wiedeń: Skoczów 13km / Chałupki 100km; Orzesze): white plate inside a thin black rim, the bicycle in black
    // and an arrow in the trail's colour (red here) above the destinations, the distances right-aligned
    { id: 'rowerowy', kind: 'bike', label: 'Bike trail table (R-3)', draw: ({ name, next, km }, st = {}) => {
      const { rim = '#111', rimW = 4, bike = '#111', arr = R } = st;
      const z = 32 / 0.73, far = Math.max(1, Math.round(km)), near = Math.max(1, Math.round(far * 0.35));
      const rows = [[name, far], ...(next ? [[next, near]] : [])];
      const nw = Math.min(900, Math.max(...rows.map(([n]) => [...String(n)].length * W1 * z))), dw = 5 * W1 * z;
      const W = Math.round(Math.max(460, 34 + nw + 40 + dw + 34)), H = 142 + rows.length * 58;
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="6" fill="#fff" stroke="#c4c4c4" stroke-width="2"/>` +
        `<rect x="${7 + rimW / 2}" y="${7 + rimW / 2}" width="${W - 14 - rimW}" height="${H - 14 - rimW}" rx="3" fill="none" stroke="${rim}" stroke-width="${rimW}"/>` +
        TS.bike(W * 0.42, 74, 128, bike) +
        TS.arrows.dir(W - 40 - 64, 74, 90, 128, { w: 22, fill: arr, head: { half: 1.45, back: 1.9, cut: 0, neck: 1.9 } }) +
        rows.map(([n, d], i) => T(34, 166 + i * 58, n, z, F, { anchor: 'start', fill: '#111', ls: LS, maxw: Math.round(nw), max: z }) +
          T(W - 34, 166 + i * 58, `${d}km`, z, F, { anchor: 'end', fill: '#111', ls: LS })).join(''));
    } },
    // group I: the same table with a green rim, green bicycle and green arrow, as on the Greenways Kraków-Morawy-Wiedeń
    // route (Commons photos from Powiat cieszyński: Jasnowice, Ustroń, Skoczów, Istebna, Górki Wielkie)
    { id: 'rowerowy-zielony', kind: 'bike', label: 'Bike trail table (green rim)', regions: ['Śląskie'],
      draw: (o) => pl.find((t) => t.id === 'rowerowy').draw(o, { rim: '#1f9a4b', rimW: 7, bike: '#1f9a4b', arr: '#1f9a4b' }) },
  ];

  TS.add('PL', pl, { next: 'Legnica', road: '12' });
})();
