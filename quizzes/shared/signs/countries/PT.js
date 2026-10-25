// PT: Portuguese signs carrying a place name (Regulamento de Sinalização do Trânsito, Decreto Regulamentar 22-A/98),
// drawn after the GeoHints pictures (see examples/PT.json). Lettering: the Portuguese sign alphabets derive from the
// British Transport typeface (Heavy for dark on light, Medium for light on dark); Public Sans stands in for it, route
// numbers in a narrow DIN (DINish Condensed). Colours: white signs for local and national roads, green for the IP/IC
// main routes, blue for motorways.
(function () {
  const { T, svg } = TS;
  const PS = "'Public Sans','Arimo',sans-serif", NUM = "'DINish Condensed','Roboto Condensed',sans-serif";
  // Public Sans Bold advance widths (em; cap height 0.723 em), from the font file; SemiBold is about 1.5 % narrower
  const ADV = {" ":0.226,"'":0.261,"(":0.333,")":0.337,",":0.277,"-":0.393,".":0.27,"/":0.381,"0":0.644,"1":0.428,"2":0.635,"3":0.665,"4":0.656,"5":0.675,"6":0.66,"7":0.626,"8":0.671,"9":0.659,"A":0.727,"B":0.684,"C":0.718,"D":0.72,"E":0.634,"F":0.614,"G":0.759,"H":0.77,"I":0.307,"J":0.402,"K":0.717,"L":0.578,"M":0.917,"N":0.782,"O":0.76,"P":0.652,"Q":0.773,"R":0.696,"S":0.692,"T":0.616,"U":0.724,"V":0.704,"W":0.969,"X":0.717,"Y":0.667,"Z":0.669,"a":0.567,"b":0.609,"c":0.547,"d":0.609,"e":0.577,"f":0.397,"g":0.628,"h":0.593,"i":0.267,"j":0.288,"k":0.58,"l":0.329,"m":0.895,"n":0.593,"o":0.576,"p":0.607,"q":0.607,"r":0.412,"s":0.527,"t":0.416,"u":0.595,"v":0.52,"w":0.788,"x":0.588,"y":0.563,"z":0.496,"À":0.727,"Á":0.727,"Â":0.727,"Ã":0.727,"Ç":0.718,"É":0.634,"Ê":0.634,"Í":0.307,"Ó":0.76,"Ô":0.76,"Õ":0.76,"Ú":0.724,"à":0.567,"á":0.567,"â":0.567,"ã":0.567,"ç":0.547,"é":0.577,"ê":0.577,"í":0.265,"ó":0.576,"ô":0.576,"õ":0.576,"ú":0.595,"ü":0.595};
  const NADV = {" ":0.175,"-":0.351,".":0.175,"0":0.408,"1":0.293,"2":0.396,"3":0.398,"4":0.427,"5":0.405,"6":0.399,"7":0.381,"8":0.409,"9":0.399,"A":0.484,"C":0.468,"E":0.406,"I":0.214,"M":0.57,"N":0.474,"P":0.434,"R":0.46};
  const tw = (s, size, ls = 0) => [...String(s)].reduce((a, c) => a + (ADV[c] ?? 0.6) + ls, 0) * size;
  const nw = (s, size) => [...String(s)].reduce((a, c) => a + (NADV[c] ?? 0.45), 0) * size;
  const CAP = 0.723, NCAP = 0.69;
  // two lines for a long name, split at a space (or after a hyphen) so the longer line is as short as possible
  const split2 = (s, size, ls) => {
    const cuts = []; for (let i = 1; i < s.length; i++) { if (s[i] === ' ') cuts.push([s.slice(0, i), s.slice(i + 1)]); if (s[i - 1] === '-' && i > 4 && s.length - i > 3) cuts.push([s.slice(0, i), s.slice(i)]); }
    let best = [s], bw = Infinity;
    for (const c of cuts) { const m = Math.max(tw(c[0], size, ls), tw(c[1], size, ls)); if (m < bw) { bw = m; best = c; } }
    return best;
  };
  const lines = (s, size, maxW, ls = 0) => (tw(s, size, ls) <= maxW ? [s] : split2(s, size, ls));
  const farrow = (x1, y1, x2, y2, t, fill) => {   // shaft + triangular head from (x1,y1) to (x2,y2)
    const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), hl = t * 2.4, hw = t * 1.5;
    const p = (u, v) => `${(x1 + Math.cos(a) * u - Math.sin(a) * v).toFixed(1)},${(y1 + Math.sin(a) * u + Math.cos(a) * v).toFixed(1)}`;
    return `<path d="M${p(0, -t / 2)} L${p(L - hl, -t / 2)} L${p(L - hl, -hw)} L${p(L, 0)} L${p(L - hl, hw)} L${p(L - hl, t / 2)} L${p(0, t / 2)} Z" fill="${fill}"/>`;
  };
  const bar = (x1, y1, x2, y2, t, fill) => {
    const a = Math.atan2(y2 - y1, x2 - x1), dx = (-Math.sin(a) * t) / 2, dy = (Math.cos(a) * t) / 2;
    return `<path d="M${x1 + dx},${y1 + dy} L${x2 + dx},${y2 + dy} L${x2 - dx},${y2 - dy} L${x1 - dx},${y1 - dy} Z" fill="${fill}"/>`;
  };
  const RED = '#e2001a', GREEN = '#3f7419', BLUE = '#1a4fb4';
  const L1B = '#0000ff', L1E = '#5fa323';   // the motorway sign's blue and its E plate's green, sampled from direction-signs 188
  // route plates: IP red with white figures, IC/N white with black figures and a black rim (on white or green signs),
  // A blue with a white rim, E green with a white rim
  // (tint: { A, E } fills that replace the A and E plates' colours, to match the sign they sit on)
  const plate = (x, y, road, h, onDark, tint = {}) => {
    const size = (h * 0.7) / NCAP, w = nw(road, size) + h * 0.42, k = road.split(' ')[0];
    const [fill, ink, rim] = k === 'IP' ? [RED, '#fff', null] : k === 'A' ? [tint.A || BLUE, '#fff', '#fff'] : k === 'E' ? [tint.E || '#3c9a2e', '#fff', '#fff'] : ['#fff', '#111', '#111'];
    return { w, svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rim ? ` stroke="${rim}" stroke-width="${h * 0.06}"` : ''}/>` + T(x + w / 2, y + h * 0.85, road, size, NUM, { fill: ink, weight: 'bold' }) };
  };
  // the UNESCO World Heritage emblem (circle and square joined), centre (x,y), outer radius r
  const unesco = (x, y, r) => `<g transform="translate(${x},${y}) scale(${r / 100})" fill="none" stroke="#111"><circle r="89" stroke-width="22"/>` +
    `<path d="M-15,96 L-15,50 L-63,2 L0,-61 L63,2 L15,50 L15,96" stroke-width="25" stroke-miterlimit="6"/></g>`;

  // the locality plate (N1a entry, N2a exit, N1b/N2b with the World Heritage emblem): white, thin black rim, the name in
  // mixed case; the sign grows wider with the name, a long name takes two lines
  const loc = ({ name }, exit, heritage) => {
    const cap = 108, size = cap / CAP, ls = 0.02, L = lines(name, size, 1100, ls), lw = Math.max(...L.map((l) => tw(l, size, ls)));
    const pitch = 170, top = heritage ? 150 : 0, W = Math.max(heritage ? 560 : 620, Math.round(lw + 190)), H = 300 + top + (L.length - 1) * pitch;
    const y0 = top + (H - top) / 2 - ((L.length - 1) * pitch) / 2 + cap / 2 + (heritage ? 10 : 0);
    return svg(W, H,
      `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="22" fill="#fff" stroke="#111" stroke-width="12"/>` +
      (exit ? `<clipPath id="pt-in"><rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="16"/></clipPath><g clip-path="url(#pt-in)">${bar(0, H - 4, W, 4, 36, RED)}</g>` : '') +
      (heritage ? unesco(140, 125, 66) : '') +
      L.map((l, i) => T(W / 2, y0 + i * pitch, l, size, PS, { fill: '#111', weight: 700, ls, maxw: lw + 2, max: size })).join(''));
  };
  const HERITAGE = ['Évora', 'Sintra', 'Guimarães', 'Porto', 'Coimbra', 'Elvas', 'Angra do Heroísmo'];

  const pt = [
    { id: 'n1a', kind: 'entry', label: 'Locality entry (N1a)', draw: (o) => loc(o, false, false) },
    { id: 'n2a', kind: 'exit', label: 'Locality exit (N2a)', draw: (o) => loc(o, true, false) },
    // World Heritage towns only: not tied to a region, so regions is empty and places lists the towns (see notes)
    { id: 'n1b', kind: 'entry', label: 'Locality entry, World Heritage town (N1b)', regions: [], places: HERITAGE, draw: (o) => loc(o, false, true) },
    { id: 'n2b', kind: 'exit', label: 'Locality exit, World Heritage town (N2b)', regions: [], places: HERITAGE, draw: (o) => loc(o, true, true) },

    // I2b: roundabout pre-signal on a national/regional road: white, thin black rim, route number in plain figures over
    // the straight-on destination, a green inset for a destination reached by an IP route, distance panel below
    { id: 'i2b', kind: 'direction', label: 'Roundabout pre-signal (I2b)', defaults: { road: 'R 258' }, draw: ({ name, next, road }) => {
      const s = 46 / CAP, L = lines(name, s * 0.985, 520), lw = Math.max(...L.map((l) => tw(l, s * 0.985))), ns = 40 / CAP, NL = lines(next, ns * 0.985, 360), xw = Math.max(...NL.map((l) => tw(l, ns * 0.985)));
      const ip = plate(0, 0, 'IP 2', 50, true), gW = Math.max(xw, ip.w) + 44, gH = 104 + NL.length * 58;
      const cx = Math.max(250, lw / 2 + 40), dy = (L.length - 1) * 62, W = Math.round(Math.max(cx + 120 + gW + 30, lw + 80, 560)), H = 540 + dy, cy = 330 + dy, r = 44;
      const gx = W - 24 - gW, gy = cy - 60 - gH / 2 + 30;
      return svg(W, H + 110,
        `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" fill="#fff" stroke="#111" stroke-width="5"/>` +
        T(cx, 72, road, 42 / NCAP, NUM, { fill: '#111', weight: 'bold' }) +
        L.map((l, i) => T(cx, 134 + i * 62, l, s, PS, { fill: '#111', weight: 600, maxw: lw + 1, max: s })).join('') +
        // GeoHints 187: the ring drawn from the left exit over the top round to the entry below (the lower-left quarter
        // open), as wide as the arms; the arms start at the ring's inner edge and end in short pencil points; the entry
        // runs from the ring to the sign's foot, cut square (TS.arrows)
        (() => { const w = 17, ri = r - w / 2, pt = { half: 0.5, back: 0.5, neck: 0.5 };
          return `<path d="M${cx - r},${cy}A${r},${r} 0 1 1 ${cx},${cy + r}" fill="none" stroke="#111" stroke-width="${w}"/>` +
            TS.arrows.group([{ pts: [[cx, cy - ri], [cx, Math.min(cy - r - 1.3 * r, 160 + dy + 20)]] }, { pts: [[cx - ri, cy], [cx - r - 1.2 * r, cy]] },
              { pts: [[cx + ri, cy], [Math.max(cx + r + 1.2 * r, gx - 14), cy]] }, { pts: [[cx, cy + ri], [cx, H - 24]], head: null }], { w, fill: '#111', head: pt }); })() +
        `<rect x="${gx}" y="${gy}" width="${gW}" height="${gH}" fill="${GREEN}"/>` + plate(gx + gW / 2 - ip.w / 2, gy + 18, 'IP 2', 50, true).svg +
        NL.map((l, i) => T(gx + gW / 2, gy + 128 + i * 58, l, ns, PS, { fill: '#fff', weight: 600, maxw: xw + 1, max: ns })).join('') +
        `<rect x="3" y="${H + 8}" width="${W - 6}" height="96" fill="#fff" stroke="#111" stroke-width="5"/>` + T(W / 2, H + 78, '150 m', 44 / CAP, PS, { fill: '#111', weight: 600 }));
    } },

    // I2a on an IP route: green, white rim, IP plate over the straight-on destination, the branch road's plate and
    // destination at its arm, distance panel below
    { id: 'i2a-ip', kind: 'direction', label: 'Junction pre-signal, IP route (I2a)', defaults: { road: 'N 372' }, draw: ({ name, next, road }) => {
      const s = 46 / CAP * 0.985, L = lines(name, s, 560), lw = Math.max(...L.map((l) => tw(l, s))), NL = lines(next, s, 300), xw = Math.max(...NL.map((l) => tw(l, s)));
      const rp = plate(0, 0, road, 50, true), lW = Math.max(xw, rp.w) + 40, dy = (L.length - 1) * 60;
      const cx = Math.max(lW + 40, 260), W = Math.round(Math.max(cx + 170, cx + lw / 2 + 50, 2 * cx - 40)), H = 520 + dy, ip = plate(0, 0, 'IP 2', 50, true);
      return svg(W, H + 110,
        `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" fill="${GREEN}" stroke="#fff" stroke-width="6"/>` +
        plate(cx - ip.w / 2, 26, 'IP 2', 50, true).svg +
        L.map((l, i) => T(cx, 150 + i * 60, l, s, PS, { fill: '#fff', weight: 600, maxw: lw + 1, max: s })).join('') +
        // GeoHints 189: the stem from the sign's foot (it meets the rim) up to a short pencil point; the branch leaves it a
        // ninth of the height above the foot, a bar as wide as the stem with the same point; joined (TS.arrows)
        TS.arrows.group([{ pts: [[cx, H - 6], [cx, 180 + dy]] }, { pts: [[cx, H - 62], [Math.max(40, cx - 0.5 * cx - 60), H - 62]] }],
          { w: 21, fill: '#fff', head: { half: 0.5, back: 0.45, neck: 0.45 } }) +
        plate(cx - 30 - lW / 2 - rp.w / 2, 260 + dy, road, 50, true).svg +
        NL.map((l, i) => T(cx - 30 - lW / 2, 370 + dy + i * 58, l, s, PS, { fill: '#fff', weight: 600, maxw: xw + 1, max: s })).join('') +
        `<rect x="3" y="${H + 8}" width="${W - 6}" height="96" fill="${GREEN}" stroke="#fff" stroke-width="6"/>` + T(W / 2, H + 78, '500 m', 44 / CAP, PS, { fill: '#fff', weight: 600 }));
    } },

    // L1 on a motorway: blue, white rim, route plates (A and E) on top, destinations with distances
    { id: 'l1-auto', kind: 'motorway', label: 'Motorway confirmation sign (L1)', defaults: { road: 'A 2' }, draw: ({ name, next, km, road }) => {
      const s = 60 / CAP * 0.985, rows = [[name, km], ...(next ? [[next, km + 23]] : [])].map(([n, d]) => [lines(n, s, 900), String(d)]);
      const tw0 = Math.max(...rows.flatMap(([L]) => L.map((l) => tw(l, s)))), dw = Math.max(...rows.map(([, d]) => tw(d, s)));
      const W = Math.round(Math.max(620, tw0 + dw + 150)), pitch = 96, nLines = rows.reduce((a, [L]) => a + L.length, 0), H = 200 + nLines * pitch + 40;
      const a = plate(0, 0, road, 64, true), e = plate(0, 0, 'E 90', 64, true), x0 = W / 2 - (a.w + e.w + 26) / 2;
      let y = 200 + pitch * 0.62, body = '';
      for (const [L, d] of rows) { L.forEach((l, i) => { body += T(46, y + i * pitch, l, s, PS, { anchor: 'start', fill: '#fff', weight: 600, maxw: tw0 + 1, max: s }); }); body += T(W - 46, y + (L.length - 1) * pitch, d, s, PS, { anchor: 'end', fill: '#fff', weight: 600 }); y += L.length * pitch; }
      return svg(W, H,
        // pure blue with a white edge, the E plate a light green (both sampled from direction-signs 188)
        `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="14" fill="${L1B}" stroke="#fff" stroke-width="6"/>` + TS.frames.rim(W, H, 16) +
        plate(x0, 48, road, 64, true, { A: L1B }).svg + plate(x0 + a.w + 26, 48, 'E 90', 64, true, { E: L1E }).svg + body);
    } },
  ];

  TS.add('PT', pt, { next: 'Almeirim', km: 8, road: 'N 114' });
})();
