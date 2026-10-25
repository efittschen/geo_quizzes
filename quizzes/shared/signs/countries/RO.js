// RO: signs carrying a place name, drawn after the GeoHints pictures (see examples/RO.json for which).
(function () {
  const { T, svg } = TS;
  // narrow DIN-like capitals and lowercase (DINish Condensed) on town and blue signs, wider (DINish) on motorway signs
  const FC = "'DINish Condensed','DINish','Noto Sans',sans-serif";
  const F = "'DINish','Noto Sans',sans-serif";
  const Y = '#fff301', RD = '#e8202a', GR = '#00584a', BL = '#0b47a3', SH = '#c8102e';
  // helper: a name split into two lines at the space (or after the hyphen) nearest its middle; null if it has none
  const split2 = (s) => {
    let best = null;
    for (let i = 1; i < s.length - 1; i++) {
      const c = s[i] === ' ' ? [s.slice(0, i), s.slice(i + 1)] : s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : null;
      if (c && (!best || Math.max(c[0].length, c[1].length) < Math.max(best[0].length, best[1].length))) best = c;
    }
    return best;
  };
  // the lines a name takes: one while it fits at 80 % of the full size (cw: average letter width in em), else two
  const lines = (s, maxw, max, cw) => (s.length * cw * max * 0.8 > maxw && split2(s)) || [s];
  // town silhouette of the yellow panel (houses, tower, factory roofs, chimney)
  const town = `<path d="M287,178 L287,118 L300,99 L313,118 L330,118 L330,80 L378,80 L378,118 L404,118 L404,108 L414,108 L414,120 L420,120 L420,112 L440,96 L460,112 L460,158 L488,158 L500,140 L512,158 L524,140 L536,158 L548,140 L558,158 L566,158 L574,88 L580,88 L580,178 Z" fill="#000"/>`;
  // new-style entry/exit: yellow panel (speed limit 50, silhouette) over a white name panel, all framed in black
  const nou = (name, end) => {
    const ls = lines(name, 580, 186, 0.4);
    const ys = ls.length > 1 ? [426, 594] : [520];
    const limit = end
      // end of the limit (city-signs 124): white disc with a thin dark rim, a black band from lower left to upper right
      // reaching the rim, the black 50 over it, set off from the band by a thin white outline
      ? `<clipPath id="ro-50"><circle cx="147" cy="127" r="92"/></clipPath><circle cx="147" cy="127" r="92" fill="#fff" stroke="#555" stroke-width="2"/>` +
        `<path clip-path="url(#ro-50)" d="M60,203 L234,51" stroke="#000" stroke-width="26"/>` +
        T(147, 168, '50', 116, FC, { weight: 600, extra: 'stroke="#fff" stroke-width="3" paint-order="stroke" stroke-linejoin="round"' })
      : `<circle cx="138" cy="135" r="90" fill="#fff" stroke="${RD}" stroke-width="20"/>` + T(138, 172, '50', 104, FC, { weight: 'bold' });
    return svg(640, 640,
      `<rect x="0" y="0" width="640" height="640" rx="14" fill="#000"/><rect x="12" y="12" width="616" height="228" rx="10" fill="${Y}"/><rect x="12" y="254" width="616" height="374" rx="10" fill="#fff"/>` +
      limit + town + ls.map((l, i) => T(320, ys[i], l, 186, FC, { weight: 'bold', maxw: 580, max: 186 })).join('') +
      (end ? `<clipPath id="ro-x"><rect x="12" y="12" width="616" height="616" rx="10"/></clipPath><path clip-path="url(#ro-x)" d="M0,640 L640,0" stroke="${RD}" stroke-width="60"/>` : ''));
  };
  // old-style entry/exit: black name on white, black border; a long name on two lines
  const vechi = (name, end) => {
    const ls = lines(name, 580, 184, 0.4);
    const H = ls.length > 1 ? 420 : 256, ys = ls.length > 1 ? [188, 370] : [192];
    return svg(640, H,
      // a black frame 8 wide, the plate's corners square, the field's slightly rounded (city-signs 125, 126)
      `<rect x="0" y="0" width="640" height="${H}" fill="#000"/><rect x="8" y="8" width="624" height="${H - 16}" rx="5" fill="#fff"/>` +
      // exit bar (group B): behind the name, from the bottom-left corner of the field to just short of the top-right
      // one, cut by the frame
      (end ? TS.exitbar({ box: [8, 8, 624, H - 16, 5], b: 0, t: 0.96, width: 32, fill: RD }) : '') +
      ls.map((l, i) => T(320, ys[i], l, 184, FC, { weight: 'bold', maxw: 590, max: 184 })).join(''));
  };

  const ro = [
    { id: 'intrare', kind: 'entry', label: 'Town entry, speed limit panel', draw: ({ name }) => nou(name, false) },
    { id: 'iesire', kind: 'exit', label: 'Town exit, speed limit panel', draw: ({ name }) => nou(name, true) },
    { id: 'intrare-veche', kind: 'entry', label: 'Town entry (older)', draw: ({ name }) => vechi(name, false) },
    { id: 'iesire-veche', kind: 'exit', label: 'Town exit (older)', draw: ({ name }) => vechi(name, true) },
    // motorway sign: motorway pictogram and number on top, the next town and the place, arrow ahead
    { id: 'autostrada', kind: 'motorway', label: 'Motorway sign (green)', draw: ({ name, next, road }) => {
      const a = /^A/.test(road) ? road : 'A1';
      const rows = [next, name].map((s) => lines(s, 440, 84, 0.52));
      const n = rows.reduce((k, l) => k + l.length, 0), H = 150 + n * 100;
      let y = 132, body = '';
      rows.forEach((ls) => ls.forEach((l) => { y += 100; body += T(160, y, l, 84, F, { fill: '#e9eeea', weight: 'bold', anchor: 'start', maxw: 450, max: 84 }); }));
      return svg(640, H + 16,
        `<rect x="3" y="3" width="634" height="${H + 10}" rx="10" fill="${GR}"/><rect x="13" y="13" width="614" height="${H - 10}" rx="7" fill="none" stroke="#e9eeea" stroke-width="5"/>` +
        // motorway pictogram (group D, shared/shields.js: the Commons drawing of the Romanian sign)
        TS.shields.motorway(260, 30, 92, { style: 'ro', fg: '#e9eeea' }) +
        `<rect x="338" y="30" width="122" height="92" rx="5" fill="none" stroke="#e9eeea" stroke-width="5"/>` + T(399, 104, a, 76, F, { fill: '#e9eeea', weight: 'bold', maxw: 104, max: 76 }) +
        body + `<path d="M84,${H - 14} L84,${158 + 60} L56,${158 + 60} L96,${158 + 6} L136,${158 + 60} L108,${158 + 60} L108,${H - 14} Z" fill="#e9eeea"/>`); } },
    // blue arrow sign on national roads: distance before the name, the farther place on top, red road shield
    { id: 'indicator', kind: 'direction', label: 'Direction arrow (blue)', draw: ({ name, next, km, road }) => {
      const rows = [[name, +km + 12], [next, km]].map(([s, d]) => [lines(s, 330, 92, 0.42), d]);
      const n = rows.reduce((k, [l]) => k + l.length, 0), H = 80 + n * 100;
      let y = 30, body = '';
      rows.forEach(([ls, d]) => ls.forEach((l, i) => { y += 100; if (i === 0) body += T(182, y, d, 92, FC, { fill: '#fff', weight: 'bold', anchor: 'end' }); body += T(204, y, l, 92, FC, { fill: '#fff', weight: 'bold', anchor: 'start', maxw: 322, max: 92 }); }));
      const sy = H / 2 - 58;
      return svg(660, H,
        `<path d="M96,4 L652,4 L652,${H - 4} L96,${H - 4} L4,${H / 2} Z" fill="#fff" stroke="#9aa3ad" stroke-width="2" stroke-linejoin="round"/><path d="M104,13 L643,13 L643,${H - 13} L104,${H - 13} L18,${H / 2} Z" fill="${BL}"/>` + body +
        // national road shield (group D, shared/shields.js: the Commons drawing of the DN shield)
        TS.shields.roNational(585 - TS.shields.roNational.width(96) / 2, sy + 10, 96, String(road).replace(/^DN\s*/, ''), { field: SH, font: F, weight: 'bold', capEm: 0.7 })); } },
    // (group H) kilometre stones (GeoHints road-number-signs 273, 278: Sighetu Marmației 50 km / Mara 24 km, Baia Mare
    // 15 km / Baia Sprie 3 km on DN 18; 277: Lovrin 15 km / Grabaț on county road 594): the stone seen from the front with
    // its side face, a rounded cap carrying the stone's kilometre (post), a white face framed by a thin dark line with the
    // places and distances in narrow dark letters, the base in the cap's colour; on the side face the road's shield.
    // National roads red (two places, the farther on top: the name at km + 12, next at km), county roads blue (the
    // destination with its distance, then the locality where the stone stands, here next)
    ...[['borna', 'Kilometre stone, national road (red)', SH, '#94102a', 'national'], ['borna-judeteana', 'Kilometre stone, county road (blue)', '#1f5bb0', '#15407e', 'county']].map(([id, label, col, dark, type]) => ({
      id, kind: 'other', label, defaults: { post: type === 'national' ? '15' : '9', road: type === 'national' ? '18' : '594' }, draw: ({ name, next, km, road, post }) => {
        const fw = 260, sw = 84, x0 = sw, W = sw + fw, cap = 132, base = 110, ink = type === 'national' ? '#1c2552' : '#1b1b1b';
        const rows = type === 'national' ? [[name, `${+km + 12} km`], ...(next ? [[next, `${km} km`]] : [])] : [[name, `${km} km`], ...(next ? [[next, '']] : [])];
        const blocks = rows.map(([s, d]) => [lines(s, 206, 56, 0.42), d]), nl = blocks.reduce((a, [l, d]) => a + l.length + (d ? 1 : 0), 0) + (type === 'county' && next ? 0.6 : 0);
        const body = Math.max(470, 90 + nl * 64), H = cap + body + base;
        const cH = blocks.reduce((a, [ls, d], bi) => a + ls.length * (ls.length > 1 ? 46 : 56) * 1.1 + (d ? 64 : 0) + (type === 'county' && bi === 1 ? 44 : 0), 0);
        let y = cap + (body - cH) / 2 - 12, txt = '';
        blocks.forEach(([ls, d], bi) => {
          if (type === 'county' && bi === 1) y += 44;
          const sz = ls.length > 1 ? 46 : 56;
          ls.forEach((l) => { y += sz * 1.1; txt += T(x0 + fw / 2, y, l, sz, FC, { fill: ink, weight: 500, maxw: 212, max: sz }); });
          if (d) { y += 64; txt += T(x0 + fw / 2, y, d, 56, FC, { fill: ink, weight: 500, maxw: 212, max: 56 }); }
        });
        const capPath = (x, w) => `M${x},${cap} L${x},${cap * 0.5} Q${x},8 ${x + w / 2},8 Q${x + w},8 ${x + w},${cap * 0.5} L${x + w},${cap} Z`;
        const sideCap = `M8,${cap} L8,${cap * 0.52} Q12,${cap * 0.08} ${x0},8 L${x0},${cap} Z`;
        return svg(W, H,
          // side face (darker), then the front: cap, white face, base
          // round 2 (user: "the edges are also red"): on the red national stones (GeoHints 273, 278) the body is red and the
          // white face is a panel set in from both edges, on the front and on the side face; no dark frame line, the
          // letters dark navy. The blue county stones (277) stay white to their edges
          (type === 'national'
            ? `<path d="${sideCap}" fill="${dark}"/><rect x="8" y="${cap}" width="${sw - 8}" height="${body}" fill="${dark}"/><rect x="20" y="${cap + 8}" width="${sw - 32}" height="${body - 8}" fill="#c9c9c3"/>` +
              `<path d="${capPath(x0, fw)}" fill="${col}"/><rect x="${x0}" y="${cap}" width="${fw}" height="${body}" fill="${col}"/><rect x="${x0 + 18}" y="${cap + 8}" width="${fw - 36}" height="${body - 8}" fill="#f5f5f2"/>` +
              `<rect x="${x0 + 18}" y="${cap + body - 4}" width="${fw - 36}" height="4" fill="#2a3566"/>`
            : `<path d="${sideCap}" fill="${dark}"/><rect x="8" y="${cap}" width="${sw - 8}" height="${body}" fill="#c9c9c3"/>` +
              `<path d="${capPath(x0, fw)}" fill="${col}"/><rect x="${x0}" y="${cap}" width="${fw}" height="${body}" fill="#f5f5f2"/>`) +
          `<rect x="2" y="${cap + body}" width="${sw - 2}" height="${base - 4}" fill="${dark}"/>` +
          `<rect x="${x0 - 6}" y="${cap + body}" width="${fw + 12}" height="${base - 4}" fill="${col}"/>` +
          T(x0 + fw / 2, cap - 26, String(post), 84, FC, { fill: '#fff', weight: 500, maxw: fw - 70, max: 92 }) +
          (type === 'national' ? TS.shields.roNational(12, cap + body / 2 - 36, 70, String(road).replace(/^DN\s*/, ''), { field: SH, font: F, weight: 'bold', capEm: 0.7 })
            : `<path d="M14,${cap + body / 2 - 48} H${sw - 12} V${cap + body / 2 + 20} L${(sw + 2) / 2},${cap + body / 2 + 52} L14,${cap + body / 2 + 20} Z" fill="${col}" stroke="#fff" stroke-width="3"/>` +
              T((sw + 2) / 2, cap + body / 2 + 10, String(road), 40, FC, { fill: '#fff', weight: 'bold', maxw: sw - 34, max: 40 })) + txt);
      } })),
    // (group H) blue distance sign (Commons, Galați: București 305 / Iași 280 / Brăila 38 / Galați 8): blue, a thin white
    // line inside the edge, the places in bold narrow mixed case, the distances right-aligned without a unit, the farthest
    // on top; the name at km + 12, next at km, as on the arrow sign
    { id: 'distante', kind: 'direction', label: 'Distance sign (blue)', draw: ({ name, next, km }) => {
      const rows = (next ? [[name, +km + 12], [next, km]] : [[name, km]]).map(([s, d]) => [s, String(d)]), S = 96, pitch = 104;
      const dw = Math.max(...rows.map(([, d]) => d.length)) * 0.47 * S, nw = Math.min(780, Math.max(...rows.map(([s]) => s.length * 0.4 * S)));
      const W = Math.round(Math.max(560, 44 + nw + 50 + dw + 44)), H = Math.round(40 + rows.length * pitch + 26);
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="${BL}" stroke="#9aa3ad" stroke-width="2"/>` +
        `<rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="6" fill="none" stroke="#fff" stroke-width="4"/>` +
        rows.map(([s, d], i) => { const y = 40 + (i + 1) * pitch - 14;
          return T(44, y, s, S, FC, { anchor: 'start', fill: '#fff', weight: 'bold', maxw: W - 88 - 50 - dw, max: S }) + T(W - 44, y, d, S, FC, { anchor: 'end', fill: '#fff', weight: 'bold' }); }).join(''));
    } },
    // (group H) white local direction sign (Commons photo of a sign post: ↑ Gara / Autogara ↑ under the blue direction
    // signs): white, a dark border, the destination centred in bold narrow mixed case between two arrows pointing ahead.
    // It carries local destinations (stations, parts of a town); the quiz's name stands in
    { id: 'local', kind: 'direction', label: 'Local direction sign (white)', draw: ({ name }) => {
      const ls = lines(name, 420, 110, 0.4), S = ls.length > 1 ? 96 : 110, H = 70 + ls.length * 116, W = 640;
      const up = (x) => `<path d="M${x - 6},${H - 34} L${x - 6},70 L${x - 24},70 L${x},26 L${x + 24},70 L${x + 6},70 L${x + 6},${H - 34} Z" fill="#141414"/>`;
      return svg(W, H, `<rect x="0" y="0" width="${W}" height="${H}" rx="8" fill="#141414"/><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="5" fill="#f4f2ec"/>` +
        up(70) + up(W - 70) + ls.map((l, i) => T(W / 2, H / 2 + 0.36 * S + (i - (ls.length - 1) / 2) * 116, l, S, FC, { fill: '#141414', weight: 'bold', maxw: W - 220, max: S })).join(''));
    } },
  ];

  TS.add('RO', ro, { next: 'Râmnicu Sărat', km: 32, road: '2' });
})();
