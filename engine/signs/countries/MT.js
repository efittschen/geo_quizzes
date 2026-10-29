// MT: Maltese signs carrying a place name, drawn after the GeoHints direction-sign picture (167) and Commons photos (see
// examples/MT.json). British-style boards in Maltese; an English name, where one exists, follows in brackets
// (Għawdex (Gozo)). name = the Maltese name as on the sign (often with its article: Il-Marsa, Ħal Qormi); alt = the
// English name, optional.
(function () {
  const { T, svg } = TS;
  const TR = "'Overpass','Arimo',sans-serif";   // stands in for Transport Medium (white on blue)
  const MS = "'Tinos',serif";                     // the Times-style serif of the locality welcome boards
  const BLUE = '#1f4e9e';

  const em = (s) => [...String(s)].reduce((a, c) => a + (c === ' ' ? 0.26 : /[A-ZĦŻĠĊ]/.test(c) ? 0.66 : /[iljtfħ'’.\-()]/.test(c) ? 0.3 : /[mw]/.test(c) ? 0.86 : 0.56), 0);
  const arrow = (x, y, deg, s, fill = '#fff') => `<g transform="translate(${x},${y}) rotate(${deg}) scale(${s})"><path d="M-6,34 L-6,-4 L-22,-4 L0,-34 L22,-4 L6,-4 L6,34 Z" fill="${fill}"/></g>`;
  // the thin arrow of the junction lists: shaft and open chevron head, pointing right (1) or left (-1)
  const thin = (x, y, d, len = 50) => `<path d="M${x - d * len / 2},${y} L${x + d * len / 2},${y} M${x + d * (len / 2 - 16)},${y - 16} L${x + d * len / 2},${y} L${x + d * (len / 2 - 16)},${y + 16}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  // route number in a small white-edged box, as on the primary-route boards
  const route = (x, y, n) => `<rect x="${x - 19}" y="${y - 26}" width="38" height="52" rx="8" fill="none" stroke="#fff" stroke-width="3"/>` + T(x, y + 13, n, 36, TR, { fill: '#fff', weight: 600, maxw: 30, max: 36 });

  const mt = [
    { id: 'direction', kind: 'direction', label: 'Direction sign (blue)',
      // blue board: ahead arrow, route box, destination and distance; an English name in brackets on the line below;
      // a lower panel points left to the next place
      draw: (o) => {
        const S = 54, x0 = o.road ? 200 : 128, kmw = 150, nameW = em(o.name) * S, altW = o.alt ? em(`(${o.alt})`) * S : 0;
        const room = Math.min(820, Math.max(300, nameW, altW) + 20), W = Math.round(x0 + room + kmw + 40);
        const rows = o.alt ? 2 : 1, top = 40, rh = S * 1.3, mainH = top + rows * rh + 40;
        const low = o.next ? 120 : 0, H = Math.round(mainH + low);
        let out = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="14" fill="${BLUE}"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="9" fill="none" stroke="#fff" stroke-width="5"/>`;
        const y1 = top + rh * 0.75;
        // GeoHints 167, measured: British-style arrows, a slim shaft (5.7 shafts long) under a chevron head whose barb
        // ends are cut parallel to the shaft (TS.arrows)
        const mta = (x, y, deg) => TS.arrows.dir(x, y, deg, 112, { w: 19.5, fill: '#fff', head: { half: 1.42, back: 1.37, cut: 1.37, neck: 2.06 } });
        out += mta(70, top + (rows * rh) / 2, 0) + (o.road ? route(150, y1 - S * 0.33, o.road) : '');
        out += T(x0, y1, o.name, S, TR, { fill: '#fff', anchor: 'start', weight: 600, maxw: room, max: S });
        if (o.alt) out += T(x0, y1 + rh, `(${o.alt})`, S, TR, { fill: '#fff', anchor: 'start', weight: 600, maxw: room, max: S });
        out += T(W - 40, y1, `${o.km}km`, S, TR, { fill: '#fff', anchor: 'end', weight: 600 });
        if (o.next) {
          out += `<line x1="10" y1="${mainH}" x2="${W - 10}" y2="${mainH}" stroke="#fff" stroke-width="5"/>` + mta(80, mainH + low / 2 - 2, 270) +
            T(150, mainH + low / 2 + S * 0.36, o.next, S, TR, { fill: '#fff', anchor: 'start', weight: 600, maxw: W - 200, max: S });
        }
        return svg(W, H, out);
      } },
    { id: 'list', kind: 'direction', label: 'Junction destination list (blue)',
      // blue board at town junctions: places to the right with arrows at the right edge, a white rule, places to the left
      // with arrows at the left edge
      draw: (o) => {
        const S = 56, rows = [[o.name, 'r'], ...(o.next ? [[o.next, 'l']] : [])];
        const W = Math.round(Math.min(900, Math.max(520, ...rows.map(([t]) => em(t) * S + 220)))), rh = S * 1.35;
        const H = Math.round(rows.length * rh + 40 + (rows.length > 1 ? 14 : 0));
        let out = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="12" fill="${BLUE}"/><rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="8" fill="none" stroke="#fff" stroke-width="4"/>`;
        let y = 20;
        rows.forEach(([t, side], i) => {
          if (i) { out += `<line x1="9" y1="${y + 7}" x2="${W - 9}" y2="${y + 7}" stroke="#fff" stroke-width="4"/>`; y += 14; }
          const base = y + rh * 0.72;
          out += side === 'r'
            ? T(40, base, t, S, TR, { fill: '#fff', anchor: 'start', weight: 600, maxw: W - 160, max: S }) + thin(W - 62, base - S * 0.36, 1)
            : thin(62, base - S * 0.36, -1) + T(130, base, t, S, TR, { fill: '#fff', anchor: 'start', weight: 600, maxw: W - 170, max: S });
          y += rh;
        });
        return svg(W, H, out);
      } },
    { id: 'locality', kind: 'entry', label: 'Locality welcome board (white)', needs: ['arms'],
      // white board with a raised arched top where a locality begins: the name in serif capitals, the motto in italics,
      // the locality's coat of arms, then MERĦBA (welcome). arms = the coat of arms as an image URL (each locality has its
      // own, so it cannot be drawn here; without it the board is drawn without the shield); motto optional. The sponsor's
      // panel under a rule at the foot of the real boards (a bank's logo) is left out.
      draw: (o) => {
        // the name in capitals; a name too long for that is written as given in one smaller line (San Pawl il-Baħar)
        const W = 440, room = W - 64, cap = String(o.name).toUpperCase(), S = 58;
        const capsFit = em(cap) * S * 1.08 <= room / 0.72;
        const name = capsFit ? cap : String(o.name), size = capsFit ? S : 46;
        const top = 104, mottoH = o.motto ? 38 : 0, armsH = o.arms ? 236 : 24;
        const H = Math.round(top + mottoH + armsH + 84);
        const shape = `M3,76 Q3,60 18,60 L34,60 C56,60 50,16 ${W * 0.3},10 Q${W / 2},3 ${W * 0.7},10 C${W - 50},16 ${W - 56},60 ${W - 34},60 L${W - 18},60 Q${W - 3},60 ${W - 3},76 L${W - 3},${H - 16} Q${W - 3},${H - 3} ${W - 16},${H - 3} L16,${H - 3} Q3,${H - 3} 3,${H - 16} Z`;
        let out = `<path d="${shape}" fill="#fbfbf8" stroke="#666" stroke-width="3"/>` + T(W / 2, top - 8, name, size, MS, { fill: '#1d1d1d', weight: 'bold', maxw: room, max: size });
        let y = top;
        if (o.motto) { y += mottoH; out += T(W / 2, y - 10, o.motto, 24, MS, { fill: '#333', weight: 'bold', style: 'italic', maxw: room, max: 24 }); }
        if (o.arms) out += `<image href="${String(o.arms).replace(/"/g, '&quot;')}" x="${W / 2 - 100}" y="${y + 14}" width="200" height="206" preserveAspectRatio="xMidYMid meet"/>`;
        y += armsH;
        out += T(W / 2, y + 50, 'MERĦBA', 40, MS, { fill: '#1d1d1d', weight: 'bold' });
        return svg(W, H, out);
      } },
  ];

  TS.add('MT', mt, { km: 4 });
})();
