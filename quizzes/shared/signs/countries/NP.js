// NP: Nepali signs carrying a place name, drawn after the GeoHints pictures (direction-signs 67; road-number signs
// 103, 104) and Commons photos (see examples/NP.json). Nepali (Devanagari) on top, English in capitals below; the
// English spelling is conventional (KATHMANDU, BIRGUNJ), so it comes from alt. Kilometre stones are hand-painted:
// Devanagari name and distance in Devanagari digits ("८ कि.मि"); older stones repeat it in English.
(function () {
  const { T, svg } = TS;
  const DV = "'Noto Sans Devanagari',sans-serif";
  const LAT = "'Arimo',sans-serif";                      // stands in for the Arial/Helvetica-like capitals of the signs
  const HAND = "'Roboto Condensed',sans-serif";          // the narrow painted capitals of older kilometre stones
  const NARROW = `style="font-variation-settings:'wdth' 80"`;
  const G = '#00804a', YEL = '#f0c419', PAINT = '#6e1d1d', INK = '#161616';
  const len = (s) => [...String(s)].length;
  const latin = (s) => !/[^\u0000-ɏḀ-ỿ\s\-'’.()]/.test(String(s));
  const forms = (name, alt) => {
    const a = [name, alt].filter(Boolean);
    return { loc: a.find((s) => !latin(s)) || null, lat: (a.find(latin) || '').toUpperCase() || null };
  };
  const dvNum = (s) => String(s).replace(/[0-9]/g, (d) => '०१२३४५६७८९'[d]);
  // a long multi-word name on two lines, broken at the space nearest the middle
  const wrap = (s, max) => {
    if (!s || len(s) <= max || !s.includes(' ')) return s ? [s] : [];
    const sp = [...s.matchAll(/ /g)].map((m) => m.index).sort((a, b) => Math.abs(a - s.length / 2) - Math.abs(b - s.length / 2))[0];
    return [s.slice(0, sp), s.slice(sp + 1)];
  };

  const np = [
    { id: 'direction', kind: 'direction', label: 'Direction sign (green, turn arrow)', needs: ['alt'],
      draw: ({ name, alt, km }) => {
        const f = forms(name, alt), dv = wrap(f.loc, 11), en = wrap(f.lat, 11);
        const W = 480, top = 36 + dv.length * 84 + en.length * 74, a = top + 70, H = a + 318;
        let y = 36, s = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="#f4f4f0" stroke="#999" stroke-width="2"/>` +
          `<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="4" fill="${G}"/>`;
        for (const l of dv) { y += 84; s += T(W / 2, y - 6, l, 80, DV, { fill: '#fff', weight: 700, maxw: W - 80, max: 80 }); }
        for (const l of en) { y += 74; s += T(W / 2, y, l, 56, LAT, { fill: '#fff', weight: 700, ls: 0.02, maxw: W - 80, max: 56 }); }
        // the turn arrow: a stem up from the bottom, bending right into a broad head (as on direction-signs 67)
        s += `<path d="M204,${H - 52} L204,${a + 44} Q204,${a} 248,${a} L340,${a} L340,${a - 44} L432,${a + 33} L340,${a + 110} L340,${a + 66} L276,${a + 66} Q270,${a + 66} 270,${a + 72} L270,${H - 52} Z" fill="#fff"/>` +
          `<rect x="110" y="${a + 116}" width="252" height="72" fill="#fff" stroke="${G}" stroke-width="3"/>` +
          T(236, a + 170, `${km} K.M.`, 50, LAT, { fill: INK, weight: 700, maxw: 228, max: 50 });
        return svg(W, H, s);
      } },
    { id: 'km', kind: 'other', label: 'Kilometre stone (Devanagari)',
      draw: ({ name, alt, km, chain }) => {
        const f = forms(name, alt), nm = f.loc || f.lat, two = wrap(nm, 9);
        const W = 420, H = 470 + (two.length - 1) * 74;
        const fx = 120, fw = 280, dome = 70;      // front face (right) and its rounded top; the side face on the left
        return svg(W, H,
          `<path d="M20,${dome + 26} Q20,40 70,34 L${fx},${dome - 6} L${fx},${H - 20} L20,${H - 46} Z" fill="#d6d3cc"/>` +
          `<path d="M20,${dome + 26} Q20,40 70,34 L${fx},${dome - 6} L${fx},${dome + 52} L20,${dome + 66} Z" fill="#d8ac16"/>` +
          `<circle cx="70" cy="${dome + 160}" r="38" fill="none" stroke="#2a2a2a" stroke-width="6"/>` + T(70, dome + 172, dvNum(chain), 32, DV, { fill: '#2a2a2a', weight: 600, extra: NARROW }) +
          `<path d="M${fx},${dome + 10} Q${fx},10 ${fx + fw / 2},10 Q${fx + fw},10 ${fx + fw},${dome + 10} L${fx + fw},${H - 20} L${fx},${H - 20} Z" fill="#f6f5f1"/>` +
          `<path d="M${fx},${dome + 10} Q${fx},10 ${fx + fw / 2},10 Q${fx + fw},10 ${fx + fw},${dome + 10} L${fx + fw},${dome + 64} L${fx},${dome + 64} Z" fill="${YEL}"/>` +
          two.map((l, i) => T(fx + fw / 2, dome + 160 + i * 74, l, 76, latin(l) ? HAND : DV, { fill: PAINT, weight: 500, extra: latin(l) ? '' : NARROW, maxw: fw - 40, max: 76 })).join('') +
          T(fx + fw / 2, dome + 250 + (two.length - 1) * 74, `${dvNum(km)} कि.मि`, 72, DV, { fill: PAINT, weight: 500, extra: NARROW, maxw: fw - 40, max: 72 }));
      } },
    { id: 'km-old', kind: 'other', label: 'Kilometre stone, older (Nepali and English)', needs: ['alt'],
      draw: ({ name, alt, km, road }) => {
        const f = forms(name, alt), dv = wrap(f.loc, 9), en = wrap(f.lat, 10);
        const rows = [...dv.map((l) => [l, DV, 62]), ...(f.loc ? [[`${dvNum(km)} कि.मी`, DV, 56]] : []), ...en.map((l) => [l, HAND, 52]), ...(f.lat ? [[String(km), HAND, 60]] : [])];
        const W = 360, H = 200 + rows.length * 74;
        let y = 120;
        return svg(W, H,
          `<path d="M20,90 Q20,14 ${W / 2},14 Q${W - 20},14 ${W - 20},90 L${W - 20},${H - 10} L20,${H - 10} Z" fill="#cfccc4"/>` +
          `<path d="M20,90 Q20,14 ${W / 2},14 Q${W - 20},14 ${W - 20},90 L${W - 20},104 L20,104 Z" fill="#e2bd2c"/>` +
          T(W / 2, 82, String(road).replace(/^([A-Z]+)-?/i, '$1-'), 50, HAND, { fill: INK, weight: 700, ls: 0.04 }) +
          rows.map(([t, fnt, sz]) => (y += 74, T(W / 2, y, t, sz, fnt, { fill: '#3a2420', weight: 600, ls: fnt === HAND ? 0.03 : 0, extra: fnt === DV ? NARROW : '', maxw: W - 70, max: sz }))).join(''));
      } },
    { id: 'entry', kind: 'entry', label: 'Place-name board (white)', needs: ['alt'],
      draw: ({ name, alt }) => {
        const f = forms(name, alt), dv = wrap(f.loc, 10), en = wrap(f.lat, 10);
        const W = 480, H = 70 + dv.length * 130 + en.length * 112;
        let y = 30;
        return svg(W, H, `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="4" fill="#f7f7f4" stroke="#2b2b2b" stroke-width="8"/>` +
          dv.map((l) => (y += 130, T(W / 2, y - 18, l, 116, DV, { fill: INK, weight: 600, maxw: W - 70, max: 116 }))).join('') +
          en.map((l) => (y += 112, T(W / 2, y - 10, l, 112, HAND, { fill: INK, weight: 500, maxw: W - 60, max: 112 }))).join(''));
      } },
    { id: 'direction-en', kind: 'direction', label: 'Direction sign, English only (green)', needs: ['alt'],
      draw: ({ name, alt, km, next, nextAlt, km2 }) => {
        const f = forms(name, alt), rows = [[f.lat || f.loc, km, 'up'], ...(nextAlt ? [[forms(next, nextAlt).lat, km2 ?? 0, 'left']] : [])]
          .map(([n, k, dir]) => [wrap(String(n).toUpperCase(), 14), k, dir]);
        const W = Math.round(Math.max(640, Math.min(1000, 330 + Math.max(...rows.map(([ls]) => Math.max(...ls.map((l) => len(l) * 0.47 * 66))))))), H = 40 + rows.reduce((a, r) => a + r[0].length * 90 + 6, 0);
        let y0 = 20;
        return svg(W, H, `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="10" fill="#0b7d4b" stroke="#e8ece8" stroke-width="6"/>` +
          rows.map(([ls, k, dir]) => {
            const h = ls.length * 90 + 6, y = y0 + h / 2; y0 += h;
            const ar = dir === 'up' ? `<path d="M50,${y + 30} L50,${y - 14} L36,${y - 14} L58,${y - 38} L80,${y - 14} L66,${y - 14} L66,${y + 30} Z" fill="#fff"/>`
              : `<path d="M88,${y - 8} L44,${y - 8} L44,${y - 22} L20,${y} L44,${y + 22} L44,${y + 8} L88,${y + 8} Z" fill="#fff"/>`;
            return ar + ls.map((l, i) => T(110, y + 24 + (i - (ls.length - 1) / 2) * 84, l, 66, HAND, { fill: '#fff', anchor: 'start', weight: 600, ls: 0.02, maxw: W - 330, max: 66 })).join('') +
              T(W - 30, y + 24, `${k}KM.`, 66, HAND, { fill: '#fff', anchor: 'end', weight: 600 });
          }).join(''));
      } },
  ];

  TS.add('NP', np, { km: 8, road: 'H14', chain: 73 });
})();
