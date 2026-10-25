// BT: Bhutanese signs carrying a place name, drawn after the GeoHints pictures (direction-signs 36-39; road-number
// signs 48) and Commons photos of kilometre stones (see examples/BT.json). Dzongkha (Tibetan script) over English
// capitals; the English spelling is conventional (THIMPHU, WANGDUE), so it comes from alt. A Dzongkha line on a
// sign closes with a shad, as on direction-signs 36: added by the usual rule (after ང a tsheg first, after ཀ and ག
// none). Distances in Dzongkha use Tibetan digits.
(function () {
  const { T, svg } = TS;
  const DZ = "'Noto Serif Tibetan',serif";
  const LAT = "'Arimo',sans-serif";                      // stands in for the Arial-like capitals of the boards
  const HAND = "'Roboto Condensed',sans-serif";          // painted capitals of stones and older boards
  const YEL = '#f2c12e', INK = '#151515';
  const len = (s) => [...String(s)].length;
  const latin = (s) => !/[^\u0000-ɏḀ-ỿ\s\-'’.()]/.test(String(s));
  const forms = (name, alt) => {
    const a = [name, alt].filter(Boolean);
    return { loc: a.find((s) => !latin(s)) || null, lat: (a.find(latin) || '').toUpperCase() || null };
  };
  const shad = (s) => (/[།༎]$/.test(s) ? s : /[ཀག]$/.test(s) ? s : /ང$/.test(s) ? s + '་།' : s.replace(/་$/, '') + '།');
  const boNum = (n) => String(n).replace(/[0-9]/g, (d) => '༠༡༢༣༤༥༦༧༨༩'[d]);
  const wrap = (s, max) => {
    if (!s || len(s) <= max || !s.includes(' ')) return s ? [s] : [];
    const sp = [...s.matchAll(/ /g)].map((m) => m.index).sort((a, b) => Math.abs(a - s.length / 2) - Math.abs(b - s.length / 2))[0];
    return [s.slice(0, sp), s.slice(sp + 1)];
  };
  // the turn arrow of the overhead boards: a stem curving right (or left) into a head
  const turn = (x, y, dir, fill) => `<g transform="translate(${x},${y}) scale(${dir === 'left' ? -1 : 1},1)"><path d="M-14,60 L-14,10 Q-14,-26 22,-26 L30,-26 L30,-46 L62,-16 L30,14 L30,-6 L22,-6 Q6,-6 6,12 L6,60 Z" fill="${fill}"/></g>`;
  const block = (x, y, dir, fill) => {   // the painted block arrows of the maroon and red boards
    const r = { left: 180, right: 0, up: -90 }[dir];
    return `<g transform="translate(${x},${y}) rotate(${r})"><path d="M-46,-9 L18,-9 L18,-22 L46,0 L18,22 L18,9 L-46,9 Z" fill="${fill}"/></g>`;
  };

  const bt = [
    { id: 'direction', kind: 'direction', label: 'Overhead direction board (green)', needs: ['alt'],
      draw: ({ name, alt, km }) => {
        const f = forms(name, alt), en = wrap(f.lat, 15);
        const W = Math.round(Math.max(560, Math.min(1000, 90 + (f.lat ? Math.max(...en.map((l) => len(l) * 0.72 * 58)) : 0)))), H = 120 + (f.loc ? 90 : 0) + en.length * 72;
        let y = 20, s = `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="10" fill="#0d7d5c" stroke="#d6dcd8" stroke-width="5"/>` +
          `<rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="6" fill="none" stroke="#f2f4f2" stroke-width="4"/>`;
        if (f.loc) { y += 90; s += T(W / 2, y - 14, shad(f.loc), 64, DZ, { fill: '#f2f4f2', weight: 600, maxw: W - 80, max: 64 }); }
        for (const l of en) { y += 72; s += T(W / 2, y - 6, l, 58, LAT, { fill: '#f2f4f2', weight: 400, ls: 0.03, maxw: W - 60, max: 58 }); }
        s += T(W - 130, H - 40, String(km).padStart(2, '0'), 56, LAT, { fill: '#f2f4f2', anchor: 'end', weight: 400 }) + turn(W - 86, H - 82, 'right', '#f2f4f2');
        return svg(W, H, s);
      } },
    { id: 'distance-board', kind: 'direction', label: 'Distance board (maroon, painted)', needs: ['alt'],
      draw: ({ name, alt, km, next, nextAlt, km2 }) => {
        const places = [[forms(name, alt), km, 'left'], ...(nextAlt && km2 != null ? [[forms(next, nextAlt), km2, 'up']] : [])];
        const rows = places.flatMap(([f, k, d]) => [...(f.loc ? [[f.loc, boNum(k), d, DZ]] : []), ...(f.lat ? [[f.lat, String(k), d, HAND]] : [])]);
        const W = 580, H = 60 + rows.length * 86;
        return svg(W, H, `<rect x="0" y="0" width="${W}" height="${H}" rx="6" fill="#1b1b1b"/><rect x="26" y="22" width="${W - 52}" height="${H - 44}" fill="#8c1c22" stroke="#b9a9a0" stroke-width="2"/>` +
          rows.map(([t, k, d, fnt], i) => {
            const y = 30 + i * 86 + 64;
            return T(54, y, t, fnt === DZ ? 46 : 54, fnt, { fill: '#e6b72e', anchor: 'start', weight: fnt === DZ ? 500 : 600, ls: fnt === HAND ? 0.03 : 0, maxw: 230, max: fnt === DZ ? 46 : 54 }) +
              T(290, y, `= ${k}`, 54, fnt, { fill: '#e6b72e', anchor: 'start', weight: 600, maxw: 160, max: 54 }) + block(W - 80, y - 18, d, '#e6b72e');
          }).join(''));
      } },
    { id: 'dantak', kind: 'direction', label: 'Project Dantak distance board', needs: ['alt'],
      draw: ({ name, alt, km, next, nextAlt, km2 }) => {
        const f = forms(name, alt), rows = [[f.lat || f.loc, km], ...(nextAlt && km2 != null ? [[forms(next, nextAlt).lat, km2]] : [])];
        const W = 640, H = 300 + rows.length * 66, c = 60;
        // the plaque outline with concave corners, as on direction-signs 38
        const plate = `M${c},14 L${W - c},14 A${c - 14},${c - 14} 0 0 0 ${W - 14},${c} L${W - 14},${H - c} A${c - 14},${c - 14} 0 0 0 ${W - c},${H - 14} L${c},${H - 14} A${c - 14},${c - 14} 0 0 0 14,${H - c} L14,${c} A${c - 14},${c - 14} 0 0 0 ${c},14 Z`;
        return svg(W, H, `<path d="${plate}" fill="#1a1a1a"/><path d="${plate}" fill="#e4c43c" transform="translate(${W * 0.04},${H * 0.04}) scale(0.92)"/>` +
          `<path d="M86,96 L118,40 L150,96 Z" fill="#fff" stroke="#c22" stroke-width="5"/><path d="M104,76 L118,52 L132,76 Z" fill="#2a63b8"/>` +
          `<path d="M${W - 150},40 L${W - 90},40 L${W - 90},78 Q${W - 120},104 ${W - 150},78 Z" fill="#c8202a" stroke="#fff" stroke-width="4"/><circle cx="${W - 120}" cy="64" r="12" fill="none" stroke="#fff" stroke-width="4"/>` +
          T(W / 2, 112, 'DANTAK', 62, HAND, { fill: INK, weight: 700, ls: 0.06 }) +
          rows.map(([n, k], i) => T(W / 2, 200 + i * 66, `${String(n).toUpperCase()} - ${k} KM`, 54, HAND, { fill: INK, weight: 600, ls: 0.03, maxw: W - 150, max: 54 })).join('') +
          T(150, H - 54, '102 RCC', 34, HAND, { fill: INK, weight: 600 }));
      } },
    { id: 'pointer', kind: 'direction', label: 'Flag board (red, yellow letters)', needs: ['alt'],
      draw: ({ name, alt }) => {
        const f = forms(name, alt), en = wrap(f.lat || f.loc, 12);
        const W = Math.round(Math.max(520, Math.min(900, 80 + Math.max(...en.map((l) => len(l) * 0.74 * 76))))), H = 120 + en.length * 84;
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="#e9e6df"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="#c51f24"/>` +
          en.map((l, i) => T(W / 2, 92 + i * 84, l, 76, latin(l) ? LAT : DZ, { fill: '#f3c623', weight: 700, ls: 0.04, maxw: W - 70, max: 76 })).join('') +
          `<path d="M${W * 0.18},${H - 46} L${W * 0.3},${H - 70} L${W * 0.3},${H - 54} L${W * 0.82},${H - 54} L${W * 0.82},${H - 38} L${W * 0.3},${H - 38} L${W * 0.3},${H - 22} Z" fill="#f3c623"/>`);
      } },
    { id: 'km', kind: 'other', label: 'Kilometre stone (yellow top)', needs: ['alt'],
      draw: ({ name, alt, km, next, nextAlt, km2, road }) => {
        const places = [[forms(name, alt), km], ...(nextAlt && km2 != null ? [[forms(next, nextAlt), km2]] : [])];
        const rows = places.flatMap(([f, k]) => [...(f.loc && places.length === 1 ? [[f.loc, 44, DZ], [boNum(k), 38, DZ]] : []),
          ...wrap(f.lat, 11).map((l) => [l, 48, HAND]), [String(k), 70, HAND]]);
        const W = 400, fx = 40, fw = 320, dome = 100, top = dome + 16;
        const H = top + 40 + rows.reduce((a, r) => a + r[1] * 1.12, 0) + 70, bot = H - 50;
        let y = top + 14;
        return svg(W, H,
          `<rect x="14" y="${bot - 6}" width="${W - 28}" height="50" fill="#d9d6cf"/><rect x="14" y="${bot - 6}" width="${W - 28}" height="8" fill="#ecebe6"/>` +
          `<rect x="${fx}" y="${top}" width="${fw}" height="${bot - top}" fill="#f3f2ee"/>` +
          `<path d="M${fx},${top} L${fx},${dome} Q${fx},${dome - 92} ${fx + fw / 2},${dome - 96} Q${fx + fw},${dome - 92} ${fx + fw},${dome} L${fx + fw},${top} Z" fill="${YEL}"/>` +
          T(fx + fw / 2, dome - 14, road, 42, HAND, { fill: INK, weight: 700, ls: 0.04 }) +
          rows.map(([t, m, fnt]) => (y += m * 1.12, T(fx + fw / 2, y, t, m, fnt, { fill: INK, weight: fnt === DZ ? 500 : 700, ls: fnt === HAND && m < 80 ? 0.03 : 0, maxw: fw - 30, max: m }))).join(''));
      } },
  ];

  TS.add('BT', bt, { km: 12, road: 'AH-48' });
})();
