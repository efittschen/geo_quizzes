// ID: Indonesian signs carrying a place name, drawn after the GeoHints pictures and photos (see examples/ID.json).
(function () {
  const { esc, T, svg } = TS;
  // Indonesia: teal-green guide signs, white mixed-case lettering (Clearview, here Signika), national route hexagon with a red cap
  const F = "'Signika','Clearview Hwy',sans-serif";
  const G = '#006665', BL = '#00008f', HL = '#02008f', W = '#fff';
  const TG = '#006f50';   // the toll road's green, sampled from the sunlit board of the Commons photo (tol-keluar)
  // a filled guide-sign arrow (shaft + triangular head) centred on x,y pointing up/down/left/right; s = scale (1 ~ 60 px long)
  const arr = (x, y, dir, s = 1, fill = W) => {
    const r = { up: 0, right: 90, down: 180, left: -90 }[dir];
    return `<path transform="translate(${x},${y}) rotate(${r}) scale(${s})" d="M0,-30 L23,-4 L8,-4 L8,30 L-8,30 L-8,-4 L-23,-4 Z" fill="${fill}"/>`;
  };
  // national route hexagon: white, black edge, red cap, black number
  const shield = (x, y, road, s = 1) => `<g transform="translate(${x},${y}) scale(${s})">` +
    `<path d="M-36,0 L-18,-31 L18,-31 L36,0 L18,31 L-18,31 Z" fill="${W}"/><path d="M-18,-31 L18,-31 L25,-19 L-25,-19 Z" fill="#bd090a"/>` +
    `<path d="M-36,0 L-18,-31 L18,-31 L36,0 L18,31 L-18,31 Z" fill="none" stroke="#000" stroke-width="2"/></g>` +
    T(x, y + 25 * s, road, (String(road).length > 1 ? 38 : 48) * s, F, { weight: 700 });
  // a name over one or two lines: names longer than `max` characters break at the space nearest the middle
  const wrap = (s, max) => {
    if ([...s].length <= max || !/\s/.test(s)) return [s];
    const sp = [...s.matchAll(/\s+/g)].map((m) => m.index), mid = s.length / 2;
    const i = sp.reduce((b, v) => (Math.abs(v - mid) < Math.abs(b - mid) ? v : b));
    return [s.slice(0, i), s.slice(i).trim()];
  };
  // patok kilometer (concrete km post) in three-quarter view: head face with a town code and km, two lower faces with codes
  const code = (name, abbr) => abbr || [...name.replace(/[^A-Za-z]/g, '')].slice(0, 3).join('').toUpperCase();
  // a white plate centred on x, top y, skewed by `skew` degrees to lie on a face; texts in the plate's own (skewed) coordinates
  const plate = (x, y, w, h, c, km, { edge = 'none', skew = 0 } = {}) => {
    const k = Math.tan(skew * Math.PI / 180), sk = `transform="skewY(${skew})"`, ly = (yy) => yy - x * k;
    return `<rect ${sk} x="${x - w / 2}" y="${ly(y)}" width="${w}" height="${h}" rx="${w * 0.08}" fill="#f4f4f0" stroke="${edge}" stroke-width="${edge === 'none' ? 0 : 5}"/>` +
      T(x, ly(y + h * 0.42), c, h * 0.3, F, { weight: 600, maxw: w * 0.86, max: h * 0.3, extra: sk }) +
      T(x, ly(y + h * 0.84), km, h * 0.32, F, { weight: 600, maxw: w * 0.8, max: h * 0.32, extra: sk });
  };
  const patok = ({ head, side, cap, base, edge, gable }) => ({ name, abbr, km, next, nextAbbr, km2 }) => {
    const a = code(name, abbr), b = code(next, nextAbbr);
    // body: lower block corner-on (left face lit, right face shaded), head block on top, base band
    const lo = `<path d="M110,250 L240,280 L240,520 L110,490 Z" fill="${side[0]}"/><path d="M240,280 L370,250 L370,490 L240,520 Z" fill="${side[1]}"/>` +
      (base ? `<path d="M110,440 L240,470 L240,560 L110,530 Z" fill="${base[0]}"/><path d="M240,470 L370,440 L370,530 L240,560 Z" fill="${base[1]}"/>` : '') +
      `<path d="M110,250 L240,220 L370,250 L240,280 Z" fill="${side[2]}"/>`;
    const hd = `<path d="M150,90 L330,90 L330,245 L150,245 Z" fill="${head[0]}"/>` +
      (gable ? `<path d="M150,90 L240,58 L330,90 Z" fill="${cap || head[1]}"/>` : `<path d="M150,90 L170,70 L310,70 L330,90 Z" fill="${cap || head[1]}"/>`) +
      `<path d="M150,90 L330,90" stroke="${head[2]}" stroke-width="3"/>`;
    return svg(480, 580,
      lo + hd + plate(240, 110, 140, 116, a, km, { edge }) +
      plate(175, 310, 104, 118, a, km, { edge, skew: 13 }) + plate(305, 310, 104, 118, b, km2, { edge, skew: -13 }));
  };
  const id = [
    { id: 'arah', kind: 'direction', label: 'Direction sign, stacked panels', draw: ({ name, next, road }) => {
      const rows = [{ t: name, a: 'up', sh: true }, { t: next, a: 'right', sh: true }];
      let y = 5, out = '';
      for (const r of rows) {
        const ls = wrap(r.t, 17), h = ls.length > 1 ? 168 : 118;
        out += `<rect x="5" y="${y}" width="630" height="${h}" fill="${G}"/>`;
        if (r.sh) out += shield(66, y + h / 2, road);
        out += ls.map((l, i) => T(128, y + h / 2 + (i - (ls.length - 1) / 2) * 64, l, ls.length > 1 ? 54 : 60, F,
          { anchor: 'start', fill: W, weight: 600, ls: 0.08, mid: true, maxw: 400, max: ls.length > 1 ? 54 : 60 })).join('');
        out += arr(r.a === 'up' ? 582 : 586, y + h / 2, r.a, 1.05);
        y += h + 5;
      }
      return svg(640, y, `<rect width="640" height="${y}" fill="${W}"/>` + out);
    } },
    { id: 'diagram', kind: 'direction', label: 'Diagram direction sign', draw: ({ name, next }) => {
      const L = wrap(name, 12), R = wrap(next, 10);
      const head = (x, y, deg) => `<path transform="translate(${x},${y}) rotate(${deg}) scale(1.45)" d="M0,-30 L23,-4 L8,-4 L8,6 L-8,6 L-8,-4 L-23,-4 Z" fill="${W}"/>`;
      return svg(640, 430, `<rect x="2" y="2" width="636" height="426" fill="${G}" stroke="#d8dddc" stroke-width="3"/>` +
        L.map((l, i) => T(32, 84 + i * 60, l, 54, F, { anchor: 'start', fill: W, weight: 600, ls: 0.08, maxw: 360, max: 54 })).join('') +
        R.map((l, i) => T(416, 236 + i * 56, l, 50, F, { anchor: 'start', fill: W, weight: 600, ls: 0.08, maxw: 205, max: 50 })).join('') +
        `<path d="M300,404 L300,306 L244,250 M300,306 L356,250" fill="none" stroke="${W}" stroke-width="23" stroke-linejoin="miter"/>` +
        head(238, 244, -45) + head(362, 244, 45));
    } },
    { id: 'biru', kind: 'direction', label: 'Blue overhead lane sign', draw: ({ name, next }) =>
      svg(640, 322, `<rect x="2" y="2" width="636" height="318" fill="${BL}" stroke="#fff" stroke-width="3"/>` +
        T(124, 82, name, 54, F, { anchor: 'start', fill: W, weight: 600, ls: 0.08, maxw: 480, max: 54 }) +
        T(124, 156, next, 54, F, { anchor: 'start', fill: W, weight: 600, ls: 0.08, maxw: 480, max: 54 }) +
        arr(162, 262, 'down', 0.95) + arr(486, 262, 'down', 0.95)) },
    { id: 'jarak', kind: 'direction', label: 'Distance sign', draw: ({ name, next, km, km2, road }) => {
      const row = (y, t, k) => T(128, y, t, 54, F, { anchor: 'start', fill: W, weight: 600, ls: 0.05, maxw: 380, max: 54 }) + T(696, y, `${k} km`, 54, F, { anchor: 'end', fill: W, weight: 600, ls: 0.05 });
      return svg(730, 250, `<rect x="2" y="2" width="726" height="246" rx="6" fill="${G}" stroke="#e8eceb" stroke-width="3"/>` +
        shield(64, 125, road, 0.9) + row(100, name, km) + row(186, next, km2));
    } },
    { id: 'tol-keluar', kind: 'motorway', label: 'Toll road exit sign', draw: ({ name, next, exit }) => {
      const L = wrap(name, 12), R = wrap(next, 10);
      const diag = `<path transform="translate(44,${L.length > 1 ? 132 : 122}) rotate(-45) scale(0.95)" d="M0,-30 L23,-4 L8,-4 L8,30 L-8,30 L-8,-4 L-23,-4 Z" fill="${W}"/>`;
      return svg(640, 250,
        `<rect x="18" y="8" width="150" height="46" fill="${W}" stroke="#222" stroke-width="2.5"/>` + T(93, 42, `KELUAR ${exit}`, 30, F, { weight: 600, maxw: 136, max: 30 }) +
        `<rect x="4" y="56" width="304" height="${L.length > 1 ? 150 : 130}" rx="6" fill="${TG}" stroke="#e8eceb" stroke-width="3"/>` + diag +
        L.map((l, i) => T(80, (L.length > 1 ? 118 : 136) + i * 54, l, 46, F, { anchor: 'start', fill: W, weight: 600, ls: 0.06, maxw: 206, max: 46 })).join('') +
        `<rect x="330" y="30" width="306" height="${R.length > 1 ? 156 : 120}" rx="6" fill="${TG}" stroke="#e8eceb" stroke-width="3"/>` +
        R.map((l, i) => T(352, (R.length > 1 ? 92 : 106) + i * 58, l, 50, F, { anchor: 'start', fill: W, weight: 600, ls: 0.06, maxw: 210, max: 50 })).join('') +
        arr(596, R.length > 1 ? 108 : 90, 'up', 0.9));
    } },
    { id: 'patok-putih', kind: 'other', label: 'Km post, white with red head', needs: ['abbr'],
      draw: patok({ head: ['#c4573a', '#a9472f', '#8a3a26'], side: ['#f1f0ea', '#cfcdc4', '#e2e0d8'], base: ['#2a2a28', '#1c1c1a'], gable: true }) },
    { id: 'patok-kuning', kind: 'other', label: 'Km post, yellow', needs: ['abbr'],
      draw: patok({ head: ['#e6c766', '#d4b350', '#b89a42'], side: ['#e9cb6c', '#c9ac55', '#dcbf62'], gable: false }) },
    { id: 'patok-merah', kind: 'other', label: 'Km post, yellow with red foot', needs: ['abbr'],
      draw: patok({ head: ['#f0b52a', '#e0a21c', '#c48c14'], side: ['#f2b62c', '#d39a1a', '#e6a922'], base: ['#e0262a', '#bb1d20'], edge: '#1d2a5a', gable: false }) },
  ];
  TS.add('ID', id, { next: 'Bogor', km: 15, km2: 4, road: '3', exit: 7 });
})();
