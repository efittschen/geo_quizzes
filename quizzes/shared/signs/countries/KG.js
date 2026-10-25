// KG: Kyrgyz signs carrying a place name, drawn after the GeoHints pictures (see examples/KG.json). Names in Cyrillic
// capitals with their Latin form; the entry plate puts the Latin line on top, the direction signs under the Cyrillic.
(function () {
  const { T, svg } = TS;
  const B = '#2b4f9a', NAVY = '#26357a', R = '#d9232e';
  const FC = "'Roboto Condensed','Arial Narrow',sans-serif";       // GOST-style narrow capitals of the plates and blue signs
  const F = "'Arimo','Liberation Sans',Arial,sans-serif";          // the Arial-like capitals of the white tables
  const up = (s) => String(s).toLocaleUpperCase('ky');
  const len = (s) => [...String(s)].length;
  // fallback Latin when alt is missing (the signs follow no rule we could pin down): Russian-style digraphs as on
  // BISHKEK, BALYKCHY, TORUGART; ж = j, ң = ng, ө = o, ү = u, ы = y, ч = ch, х = kh, ц = ts, ю = yu, я = ya
  const MAP = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', ң: 'ng', о: 'o', ө: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ү: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ё: 'yo' };
  const lat = (s) => { const a = [...String(s).toLowerCase()]; return a.map((c, i) => (c === 'е' ? (!/[а-яёңөү]/.test(a[i - 1] || '') || 'аеёиоуыэюяөү'.includes(a[i - 1]) ? 'ye' : 'e') : MAP[c] ?? c)).join('').toUpperCase(); };
  const latOf = (o) => up(o.alt || lat(o.name));
  const arrow = (x, y, s, dir, fill) => {   // a block arrow (shaft + triangular head), pointing up, left or right
    const r = { up: 0, right: 90, left: -90 }[dir];
    return `<path transform="translate(${x},${y}) rotate(${r}) scale(${s / 100})" d="M-14,50 L-14,-5 L-42,-5 L0,-50 L42,-5 L14,-5 L14,50 Z" fill="${fill}"/>`;
  };
  const plate = (o, crossed) => {
    const rows = [latOf(o), up(o.name)], size = 120;
    const tw = Math.max(...rows.map(len)) * size * 0.62;
    const W = Math.round(Math.min(1500, Math.max(640, tw + 130))), H = 340;
    return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="14" fill="#eef0f2" stroke="#999" stroke-width="2"/>` +
      `<rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="20" fill="none" stroke="#111" stroke-width="7"/>` +
      rows.map((r, i) => T(W / 2, 156 + i * 140, r, size, FC, { fill: '#111', weight: 500, ls: 0.2, maxw: W - 90, max: size })).join('') +
      // exit bar (group B, after the Commons photo of the Kosh-Köl exit plate): a thin red line over the lettering, from
      // about a fifth in at the bottom to near the top-right corner, cut flat by the frame's inner edge
      (crossed ? TS.exitbar({ box: [17.5, 17.5, W - 35, H - 35, 16.5], b: 0.19, t: 0.84, width: 12, fill: R }) : ''));
  };

  const kg = [
    { id: 'entry', kind: 'entry', label: 'Locality start', needs: ['alt'], draw: (o) => plate(o, false) },
    { id: 'exit', kind: 'exit', label: 'Locality end', needs: ['alt'], draw: (o) => plate(o, true) },
    // blue direction sign: one panel per direction, Cyrillic over Latin, white block arrows
    { id: 'direction', kind: 'direction', label: 'Direction sign (blue)', needs: ['alt'], draw: ({ name, alt, next }) => {
      const size = 74, texts = [up(next), up(lat(next)), up(name), latOf({ name, alt })];
      const mw = Math.min(1100, Math.max(400, Math.max(...texts.map(len)) * size * 0.8)), W = Math.round(220 + mw + 190), H = 600;
      // GeoHints 56, measured: plain triangular heads 2.5 shafts wide; the ahead arrow long and slim (from the first line's
      // cap top to the second line's baseline, head 1.9 shafts long), the right arrow short and broad (TS.arrows)
      const ka = (w, back) => ({ w, fill: '#f2f2ee', head: { half: 1.23, back, neck: back } });
      const row = (y, c, l, dir) => (dir === 'up' ? TS.arrows.dir(110, y + 13, 0, 158, ka(33, 1.9)) : TS.arrows.dir(W - 130, y + 10, 90, 132, ka(41, 2.07))) +
        T(220, y - 10, c, size, FC, { fill: '#f2f2ee', weight: 500, anchor: 'start', ls: 0.14, maxw: mw, max: size }) +
        T(220, y + 92, l, size, FC, { fill: '#f2f2ee', weight: 500, anchor: 'start', ls: 0.14, maxw: mw, max: size });
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="#e8e8e2" stroke="#999" stroke-width="2"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="4" fill="${B}"/>` +
        `<path d="M10,${H / 2 + 2} L${W - 10},${H / 2 + 2}" stroke="#e8e8e2" stroke-width="6"/>` +
        row(150, up(next), up(lat(next)), 'up') + row(H / 2 + 150, up(name), latOf({ name, alt }), 'right'));
    } },
    // white direction table, dark-blue lettering: arrow, Cyrillic over Latin, distance
    { id: 'direction-white', kind: 'direction', label: 'Direction table (white)', needs: ['alt'], draw: ({ name, alt, next, km, km2 }) => {
      const size = 64, texts = [up(name), latOf({ name, alt }), up(next), up(lat(next))];
      const mw = Math.min(1100, Math.max(380, Math.max(...texts.map(len)) * size * 0.72)), W = Math.round(170 + mw + 270), H = 560;
      const row = (y, c, l, k, dir) => (dir === 'left' ? arrow(95, y + 6, 110, 'left', NAVY) : arrow(W - 75, y + 6, 100, 'right', NAVY)) +
        T(170, y - 12, c, size, F, { fill: NAVY, weight: 'bold', anchor: 'start', maxw: mw, max: size }) +
        T(170, y + 70, l, size, F, { fill: NAVY, weight: 'bold', anchor: 'start', maxw: mw, max: size }) +
        T(dir === 'left' ? W - 130 : W - 140, y + 28, String(k), size, F, { fill: '#2a2a2a', weight: 'bold', anchor: 'end' });
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="6" fill="#f4f4f2" stroke="#2c3a6a" stroke-width="5"/>` +
        row(170, up(name), latOf({ name, alt }), km, 'left') + row(420, up(next), up(lat(next)), km2 || Math.max(1, Math.round(km / 4)), 'right'));
    } },
  ];

  TS.add('KG', kg, { next: 'Кант', km: 23 });
})();
