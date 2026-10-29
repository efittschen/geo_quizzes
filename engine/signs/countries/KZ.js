// KZ: Kazakh signs carrying a place name, drawn after the GeoHints pictures (see examples/KZ.json). Names in Kazakh
// Cyrillic capitals; the entry/exit plates add a Latin line under them when one is given (alt).
(function () {
  const { T, svg } = TS;
  const B = '#2a62cc', R = '#d9232e';
  const F = "'Arimo','Liberation Sans',Arial,sans-serif";                    // Arial, used de facto on Kazakh signs
  const FC = "'Roboto Condensed','Arial Narrow',sans-serif";                   // the narrow lettering of the blue tables
  const up = (s) => String(s).toLocaleUpperCase('kk');
  const len = (s) => [...String(s)].length;
  const split2 = (s) => {
    let best = null;
    for (let i = 1; i < s.length; i++) {
      let a, b;
      if (s[i] === ' ') { a = s.slice(0, i); b = s.slice(i + 1); } else if (s[i - 1] === '-') { a = s.slice(0, i); b = s.slice(i); } else continue;
      const m = Math.max(len(a), len(b));
      if (!best || m < best[2]) best = [a, b, m];
    }
    return best ? [best[0], best[1]] : [s];
  };
  const arrowR = (x, y, s, fill) => `<path d="M${x - s},${y - s * 0.17} L${x + s * 0.1},${y - s * 0.17} L${x + s * 0.1},${y - s * 0.5} L${x + s},${y} L${x + s * 0.1},${y + s * 0.5} L${x + s * 0.1},${y + s * 0.17} L${x - s},${y + s * 0.17} Z" fill="${fill}"/>`;

  // white plate, thin black frame: the name, and its Latin form under it when given; long names on two lines
  const plate = ({ name, alt }, crossed) => {
    const cy = up(name), la = alt ? up(alt) : null;
    const rows = [...(len(cy) > 14 ? split2(cy) : [cy]), ...(la ? (len(la) > 16 ? split2(la) : [la]) : [])];
    const size = rows.length === 1 ? 110 : rows.length === 2 ? 84 : 68;
    const tw = Math.max(...rows.map(len)) * size * 0.76;
    const H = Math.round(90 + rows.length * size * 1.18), W = Math.round(Math.min(1300, Math.max(H * 2.3, tw + 150)));
    const y0 = H / 2 - (rows.length * size * 1.18) / 2 + size * 0.9;
    return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="#f6f6f4" stroke="#999" stroke-width="2"/>` +
      `<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="4" fill="none" stroke="#111" stroke-width="7"/>` +
      rows.map((r, i) => T(W / 2, y0 + i * size * 1.18, r, size, F, { fill: '#1a1a1a', weight: 600, ls: 0.05, maxw: W - 110, max: size })).join('') +
      (crossed ? `<path d="M${W * 0.16},${H - 22} L${W * 0.84},22" stroke="${R}" stroke-width="${Math.max(9, H * 0.035)}" stroke-linecap="round"/>` : ''));
  };

  const kz = [
    { id: 'entry', kind: 'entry', label: 'Locality start', needs: ['alt'], draw: (o) => plate(o, false) },
    { id: 'exit', kind: 'exit', label: 'Locality end', needs: ['alt'], draw: (o) => plate(o, true) },
    // blue distance table: towns in capitals, distances in a column, an arrow for the turn
    { id: 'distances', kind: 'direction', label: 'Distance table (blue)', draw: ({ name, next, km, km2 }) => {
      const rows = [[up(next), km2 || Math.max(1, Math.round(km / 6))], [up(name), km, true]];
      const size = 92, nw = Math.min(900, Math.max(...rows.map(([n]) => len(n))) * size * 0.62), kw = Math.max(...rows.map(([, k]) => len(String(k)))) * size * 0.52;
      const xk = 40 + Math.max(330, nw) + 50 + kw, W = Math.round(xk + 150), H = 70 + rows.length * 130;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="#fff" stroke="#999" stroke-width="2"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="4" fill="${B}"/>` +
        rows.map(([n, k, turn], i) => {
          const y = 128 + i * 130;
          return T(40, y, n, size, FC, { fill: '#fff', weight: 'bold', anchor: 'start', maxw: xk - kw - 80, max: size }) +
            T(xk, y, String(k), size, FC, { fill: '#fff', weight: 'bold', anchor: 'end' }) + (turn ? arrowR(xk + 75, y - size * 0.36, 52, '#fff') : '');
        }).join(''));
    } },
  ];

  TS.add('KZ', kz, { next: 'Жеңіс', km: 18 });
})();
