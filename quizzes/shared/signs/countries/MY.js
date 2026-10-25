// MY: Malaysian signs carrying a place name, drawn after the GeoHints pictures (see examples/MY.json). Names in
// Rumi (Latin Malay). The city quiz gives many names in Jawi; a Jawi name comes with its Rumi form as alt, and the
// templates take the Rumi one.
(function () {
  const { T, svg } = TS;
  const G = '#00703c', B = '#0a3d8c', SG = '#0b5e48', BRN = '#6b3a26', Y = '#f7c600';
  const LEM = "'RG2014 Series EM','RG2014 Series E',sans-serif";    // Highway Gothic capitals of the town plates
  const LE = "'RG2014 Series E','RG2014 Series D',sans-serif";      // Highway Gothic / LLM lettering of guide signs
  const LD = "'RG2014 Series D','RG2014 Series E',sans-serif";
  const len = (s) => [...String(s)].length;
  const arabic = (s) => /[؀-ۿݐ-ݿ]/.test(String(s || ''));
  const rumi = ({ name, alt }) => (arabic(name) ? alt || name : name);
  // the second town in Rumi: next, or nextAlt when next came in Jawi; null when only a Jawi form is known
  const nextR = ({ next, nextAlt }) => (arabic(next) ? nextAlt || null : next);
  const split2 = (s) => {
    let best = null;
    for (let i = 1; i < s.length; i++) {
      if (s[i] !== ' ') continue;
      const a = s.slice(0, i), b = s.slice(i + 1), m = Math.max(len(a), len(b));
      if (!best || m < best[2]) best = [a, b, m];
    }
    return best ? [best[0], best[1]] : [s];
  };
  const arrow = (x, y, s, rot, fill) => `<path transform="translate(${x},${y}) rotate(${rot}) scale(${s / 100})" d="M-13,50 L-13,-6 L-40,-6 L0,-50 L40,-6 L13,-6 L13,50 Z" fill="${fill}"/>`;
  const route = (cx, cy, n, s) => { const w = len(n) * s * 0.5 + s * 0.5; return `<rect x="${cx - w / 2}" y="${cy - s * 0.55}" width="${w}" height="${s * 1.1}" rx="${s * 0.3}" fill="${Y}" stroke="#222" stroke-width="${s * 0.06}"/>` + T(cx, cy + s * 0.32, n, s * 0.82, LD, { fill: '#111' }); };

  const my = [
    // town plate (white, black frame): the name in capitals, long names on two lines
    { id: 'entry', kind: 'entry', label: 'Town name plate', draw: (o) => {
      const N = rumi(o).toUpperCase(), rows = len(N) > 16 ? split2(N) : [N];
      const size = rows.length > 1 ? 130 : 172, tw = Math.max(...rows.map(len)) * size * 0.64;
      const H = rows.length > 1 ? 380 : 260, W = Math.round(Math.min(1700, Math.max(H * 2.2, tw + 140)));
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="#fff" stroke="#999" stroke-width="2"/><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="8" fill="none" stroke="#111" stroke-width="16"/>` +
        rows.map((r, i) => T(W / 2, (rows.length > 1 ? 166 : H / 2 + size * 0.36) + i * 140, r, size, LEM, { fill: '#111', ls: 0.05, maxw: W - 110, max: size })).join(''));
    } },
    // expressway sign (green): the exit's destinations in a panel with the yellow EXIT tab, the through route beside it
    { id: 'motorway', kind: 'motorway', label: 'Expressway exit sign (green)', draw: (o) => {
      const n = rumi(o), nx = nextR(o), size = 64, pw = Math.max(420, Math.max(len(n), len(nx || '')) * size * 0.56 + 170);
      const W = Math.round((nx ? 2 : 1) * pw + (nx ? 30 : 16)), H = 330;
      // each panel: green to its edge, a white border line set in from it, the green field (direction-signs 61)
      const panel = (x, t, arr) => `<rect x="${x}" y="90" width="${pw}" height="230" rx="6" fill="${G}"/><rect x="${x + 10.5}" y="100.5" width="${pw - 21}" height="209" rx="11" fill="none" stroke="#fff" stroke-width="5"/>` + arr +
        T(x + 140, 222, t, size, LE, { fill: '#fff', anchor: 'start', ls: 0.04, maxw: pw - 170, max: size });
      return svg(W, H, `<rect x="40" y="8" width="230" height="72" rx="14" fill="${Y}"/>` + T(155, 64, `EXIT ${o.exit}`, 56, LD, { fill: '#111' }) +
        panel(8, n, arrow(78, 205, 110, -45, '#fff')) + (nx ? panel(pw + 22, nx, arrow(pw + 92, 205, 110, 0, '#fff')) : ''));
    } },
    // federal-road guide sign (blue): one row per direction, arrow, yellow route number, destinations
    { id: 'direction', kind: 'direction', label: 'Guide sign, federal road (blue)', draw: (o) => {
      const n = rumi(o), nx = nextR(o), size = 62, rh = 150, W = Math.round(Math.max(760, Math.max(len(n), len(nx || '')) * size * 0.66 + 330)), H = (nx ? 2 : 1) * rh + 20;
      const row = (y, t, rot, rd) => arrow(70, y + rh / 2, 70, rot, '#fff') + (rd ? route(170, y + rh / 2 - 6, rd, 46) : '') +
        T(240, y + rh / 2 + 16, t, size, LE, { fill: '#fff', anchor: 'start', ls: 0.12, maxw: W - 280, max: size });
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="#fff" stroke="#999" stroke-width="2"/><rect x="9" y="9" width="${W - 18}" height="${H - 18}" fill="${B}"/>` +
        (nx ? `<path d="M9,${rh + 10} L${W - 9},${rh + 10}" stroke="#fff" stroke-width="6"/>` + row(10, nx, 0) : '') + row(nx ? rh + 10 : 10, n, -90, o.road));
    } },
    // Sarawak: green rows with distances (and brown rows for tourist places)
    { id: 'direction-sarawak', kind: 'direction', label: 'Guide sign, Sarawak (green)', regions: ['Sarawak'], draw: (o) => {
      const n = rumi(o), nx = nextR(o), size = 64, rh = 120, k2 = o.km2 || o.km + Math.max(8, Math.round(o.km * 1.5));
      const W = Math.round(Math.max(900, Math.max(len(n), len(nx || '')) * size * 0.72 + 420)), H = (nx ? 2 : 1) * rh + 12;
      const row = (y, t, k, rot) => `<rect x="4" y="${y}" width="${W - 8}" height="${rh - 6}" rx="6" fill="${SG}" stroke="#e6ece8" stroke-width="5"/>` + arrow(58, y + rh / 2 - 3, 66, rot, '#eef2ee') +
        T(120, y + rh / 2 + 20, t, size, LD, { fill: '#eef2ee', anchor: 'start', ls: 0.16, maxw: W - 420, max: size }) + T(W - 40, y + rh / 2 + 20, `${k} Km`, size, LD, { fill: '#eef2ee', anchor: 'end', ls: 0.1 });
      return svg(W, H, row(3, n, o.km, 0) + (nx ? row(rh + 9, nx, k2, -90) : ''));
    } },
    // street-name sign (Kuala Lumpur style): street in capitals, postcode and town in red below
    { id: 'street', kind: 'street', label: 'Street-name sign with town', needs: ['postcode'], draw: (o) => {
      const town = rumi(o).toUpperCase(), st = (o.street || 'Jalan Besar').toUpperCase();
      const W = Math.round(Math.max(760, len(st) * 84 * 0.62 + 120)), H = 230;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="12" fill="#fff" stroke="#999" stroke-width="2"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="8" fill="#1342a8"/>` +
        T(W / 2, 128, st, 84, LD, { fill: '#fff', ls: 0.04, maxw: W - 80, max: 84 }) +
        T(W / 2, 192, `${o.postcode ? o.postcode + ' ' : ''}${town}`, 44, LD, { fill: '#e8303a', ls: 0.04, maxw: W - 100, max: 44 }));
    } },
  ];

  TS.add('MY', my, { next: 'Melaka', km: 11, exit: 244, road: '60' });
})();
