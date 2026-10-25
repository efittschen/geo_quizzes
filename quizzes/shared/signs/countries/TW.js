// TW: Taiwanese signs carrying a place name, drawn after the GeoHints pictures (see examples/TW.json). Chinese
// characters set wide apart, the romanised name under them (alt; the signs mix Hanyu Pinyin, Tongyong Pinyin and
// old Wade-Giles spellings, so it cannot be computed).
(function () {
  const { T, svg } = TS;
  const G = '#2a8a46', GD = '#1f7a52', BR = '#4a3128', SB = '#1d4fa8';
  const ZH = "'Noto Sans TC','PingFang TC',sans-serif";
  const LA = "'RG2014 Series EM','RG2014 Series E',sans-serif";    // the heavy Highway Gothic-like Latin of the signs
  const LC = "'RG2014 Series C','RG2014 Series D',sans-serif";      // narrow Latin of the brown signs
  const chars = (s) => [...String(s)];
  // characters spread over a width: two-character names stand far apart, longer ones closer
  const spread = (s, cx, y, w, size, fill, weight = 500, k2 = 2.1) => {
    const c = chars(s), n = c.length;
    if (n === 1) return T(cx, y, s, size, ZH, { fill, weight });
    const sz = Math.min(size, w / (n * 1.05)), gap = Math.min(w - sz, (n - 1) * sz * (n === 2 ? k2 : n === 3 ? 1.5 : 1.15)) / (n - 1);
    return c.map((ch, i) => T(cx - gap * (n - 1) / 2 + gap * i, y, ch, sz, ZH, { fill, weight })).join('');
  };
  // (group D) the provincial highway shield of shared/shields.js (Commons drawing), s high, centred on cx, cy
  const shield = (cx, cy, n, s) => TS.shields.twProvincial(cx - TS.shields.twProvincial.width(s) / 2, cy - s / 2, s, n, { font: "'Noto Sans TC',sans-serif", weight: 700, capEm: 0.73 });
  const arrowUp = (x, y, h, w, fill) => `<path d="M${x},${y + h} L${x},${y + w * 0.9}" stroke="${fill}" stroke-width="${w * 0.42}"/><path d="M${x - w / 2},${y + w} L${x},${y} L${x + w / 2},${y + w} Z" fill="${fill}"/>`;
  const arrowLeft = (x, y, l, w, fill) => `<path d="M${x + l},${y} L${x + w * 0.9},${y}" stroke="${fill}" stroke-width="${w * 0.42}"/><path d="M${x + w},${y - w / 2} L${x},${y} L${x + w},${y + w / 2} Z" fill="${fill}"/>`;

  const tw = [
    // place-name sign (green): the name in characters, the romanised name under it
    { id: 'entry', kind: 'entry', label: 'Place-name sign (green)', needs: ['alt'], draw: ({ name, alt }) => {
      const W = 900, H = 440;
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="#fff" stroke="#bbb" stroke-width="2"/><rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="${G}"/>` +
        spread(name, W / 2, alt ? 210 : 270, 560, alt ? 170 : 200, '#fff') +
        (alt ? T(W / 2, 372, alt, 104, LA, { fill: '#fff', ls: 0.12, maxw: W - 120, max: 104 }) : ''));
    } },
    // direction sign (green): one panel per direction, arrow, route shield, characters over the romanised name
    { id: 'direction', kind: 'direction', label: 'Direction sign (green)', needs: ['alt'], draw: ({ name, alt, next, nextAlt, road }) => {
      const W = 700, ph = 210, H = 2 * ph + 40;
      const panel = (y, zh, la, dir, rd) => `<rect x="4" y="${y + 4}" width="${W - 8}" height="${ph - 8}" rx="8" fill="${GD}" stroke="#e8efea" stroke-width="6"/>` +
        (dir === 'up' ? arrowUp(80, y + 30, ph - 60, 66, '#f4f4ee') : arrowLeft(30, y + ph / 2, 140, 66, '#f4f4ee')) +
        (rd ? shield(232, y + 80, rd, 116) : '') +
        spread(zh, 470, y + (la ? 118 : 140), 300, 96, '#f4f4ee', 500, 1.6) +
        (la ? T(470, y + 178, la, 54, LA, { fill: '#f4f4ee', maxw: 330, max: 54 }) : '');
      return svg(W, H, panel(14, name, alt, 'up', road) + panel(ph + 26, next, nextAlt, 'left', road));
    } },
    // scenic-area direction sign (brown): straight on and a turn to the right, characters over romanised name, km
    { id: 'direction-brown', kind: 'direction', label: 'Scenic-area direction (brown)', needs: ['alt'], draw: ({ name, alt, next, nextAlt, km, km2 }) => {
      const W = 720, H = 620, f = '#f2f0ea';
      const k2 = km2 || Math.max(1, Math.round(km / 10));
      return svg(W, H, `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="16" fill="${BR}" stroke="#ddd" stroke-width="3"/><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="10" fill="none" stroke="${f}" stroke-width="7"/>` +
        `<path d="M120,${H - 40} L120,150 M120,420 Q120,330 220,330 L330,330" fill="none" stroke="${f}" stroke-width="30"/><path d="M84,156 L120,64 L156,156 Z M320,292 L398,330 L320,368 Z" fill="${f}"/>` +
        spread(name, 380, 136, 280, 88, f, 500, 1.5) + (alt ? T(380, 214, alt, 72, LC, { fill: f, maxw: 330, max: 72 }) : '') + T(650, 160, String(km), 92, LC, { fill: f }) +
        spread(next, 380, 470, 280, 88, f, 500, 1.5) + (nextAlt ? T(380, 556, nextAlt, 72, LC, { fill: f, maxw: 330, max: 72 }) : '') + T(650, 520, String(k2), 92, LC, { fill: f }));
    } },
  ];

  TS.add('TW', tw, { next: '羅東', km: 20, road: '7' });
})();
