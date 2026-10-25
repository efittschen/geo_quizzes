// ES: Spanish signs carrying a place name (Catálogo de señales verticales 2025 / Norma 8.1-IC), drawn after the GeoHints
// pictures and the Commons catalogue drawings (see examples/ES.json). Lettering: Carretera Convencional (CCRIGE), the
// only sign typeface since Orden FOM/534/2014, capitals on white signs, mixed case on blue ones.
(function () {
  const { T, svg } = TS;
  // CCRIGE Tilde: CCRIGE with a wavy tilde on Ñ ñ (after picture 138) instead of the real signs' straight bar (user's choice)
  const CC = "'CCRIGE Tilde','CCRIGE','Barlow',sans-serif";
  // CCRIGE advance widths (em; cap height 0.40 em), from the font file, so a sign is as wide as its name needs
  const ADV = {" ":0.2,"'":0.176,"(":0.332,")":0.332,",":0.172,"-":0.208,".":0.172,"/":0.38,"0":0.416,"1":0.256,"2":0.356,"3":0.388,"4":0.4,"5":0.376,"6":0.368,"7":0.304,"8":0.396,"9":0.368,"A":0.412,"B":0.424,"C":0.436,"D":0.44,"E":0.396,"F":0.348,"G":0.452,"H":0.456,"I":0.22,"J":0.268,"K":0.416,"L":0.336,"M":0.528,"N":0.492,"O":0.468,"P":0.384,"Q":0.472,"R":0.424,"S":0.432,"T":0.356,"U":0.456,"V":0.36,"W":0.536,"X":0.404,"Y":0.376,"Z":0.368,"a":0.332,"b":0.352,"c":0.316,"d":0.352,"e":0.32,"f":0.244,"g":0.348,"h":0.352,"i":0.168,"j":0.216,"k":0.348,"l":0.204,"m":0.5,"n":0.352,"o":0.336,"p":0.364,"q":0.36,"r":0.24,"s":0.296,"t":0.252,"u":0.352,"v":0.32,"w":0.468,"x":0.34,"y":0.32,"z":0.26,"·":0.172,"À":0.412,"Á":0.412,"Ç":0.436,"È":0.396,"É":0.396,"Í":0.22,"Ï":0.25,"Ñ":0.492,"Ò":0.468,"Ó":0.468,"Ú":0.456,"Ü":0.456,"Ý":0.376,"à":0.332,"á":0.332,"ç":0.316,"è":0.32,"é":0.32,"í":0.168,"ï":0.231,"ñ":0.352,"ò":0.336,"ó":0.336,"ú":0.352,"ü":0.352,"ý":0.32};
  const tw = (s, size) => [...String(s)].reduce((a, c) => a + (ADV[c] ?? 0.42), 0) * size;
  const CAP = 0.4;                       // CCRIGE cap height per em: font size = cap height / 0.4
  const up = (s) => String(s).toLocaleUpperCase('es');
  // two lines for a long name, split at a space so the longer line is as short as possible ("LAS PALMAS / DE GRAN CANARIA")
  const split2 = (s, size) => {
    const w = s.split(' ');
    let best = [s, ''], bw = Infinity;
    for (let i = 1; i < w.length; i++) {
      const a = w.slice(0, i).join(' '), b = w.slice(i).join(' '), m = Math.max(tw(a, size), tw(b, size));
      if (m < bw) { bw = m; best = [a, b]; }
    }
    return best;
  };
  const RED = '#e3000f', BLUE = '#1d4f9c', ORANGE = '#f29400';
  const MB = '#0040ff';   // the motorway signs' bright blue, sampled from direction-signs 206 and Commons S-225

  // the town plate (S-500 entry, S-510 exit): white, wide rounded corners, a red (entry) or black (exit) border, the name
  // in capitals; the sign grows wider with the name ("long version"), a long name goes on two lines, and a bilingual name
  // is "BASQUE / SPANISH" on one line or two lines parted by a rule (Reglamento: no typographic distinction between them)
  const plate = ({ name, alt }, exit) => {
    const cap = 84, size = cap / CAP, H1 = 300, maxText = 1080;
    let lines, rule = false;
    const N = up(name), A = alt ? up(alt) : '';
    if (A && tw(`${N} / ${A}`, size) <= maxText) lines = [`${N} / ${A}`];
    else if (A) { lines = [N, A]; rule = true; }
    else if (tw(N, size) <= maxText || !N.includes(' ')) lines = [N];
    else lines = split2(N, size);
    const pitch = rule ? 150 : 130;
    const textW = Math.min(maxText, Math.max(...lines.map((l) => tw(l, size))));
    const W = Math.max(500, Math.round(textW + 190)), H = H1 + (lines.length - 1) * pitch;
    const band = exit ? '#111' : RED;
    const y0 = H / 2 - ((lines.length - 1) * pitch) / 2 + cap / 2;
    let body = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="56" fill="#fff" stroke="#8a8a8a" stroke-width="2.5"/>`;
    if (exit) body += `<clipPath id="es-in"><rect x="30" y="30" width="${W - 60}" height="${H - 60}" rx="34"/></clipPath>` +
      `<g clip-path="url(#es-in)">${bar(20, 40, W - 20, H - 40, 18, RED)}</g>`;
    body += `<rect x="23" y="23" width="${W - 46}" height="${H - 46}" rx="40" fill="none" stroke="${band}" stroke-width="22"/>`;
    if (rule) body += `<line x1="70" y1="${H / 2}" x2="${W - 70}" y2="${H / 2}" stroke="#111" stroke-width="6"/>`;
    body += lines.map((l, i) => T(W / 2, y0 + i * pitch, l, size, CC, { fill: '#111', maxw: textW + 2, max: size })).join('');
    return svg(W, H, body);
  };

  // a road number plate: national (Red de Carreteras del Estado) N-/A-/AP- white on red or blue; others orange
  const roadPlate = (x, y, road, h, onBlue) => {
    const size = (h * 0.62) / CAP, w = tw(road, size) + h * 0.5;
    const motorway = /^(A|AP|E)-/.test(road), nat = /^N-/.test(road);
    if (motorway && onBlue) return { w, svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.12}" fill="${typeof onBlue === 'string' ? onBlue : BLUE}" stroke="#fff" stroke-width="${h * 0.07}"/>` + T(x + w / 2, y + h * 0.81, road, size, CC, { fill: '#fff' }) };
    const fill = motorway ? BLUE : nat ? RED : ORANGE, ink = nat || motorway ? '#fff' : '#111';
    return { w, svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.08}" fill="${fill}"/>` + T(x + w / 2, y + h * 0.81, road, size, CC, { fill: ink }) };
  };
  // a filled sign arrow (shaft + triangular head) from (x1,y1) to (x2,y2), as on the Spanish catalogue drawings
  const farrow = (x1, y1, x2, y2, t, fill) => {
    const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), hl = t * 2.6, hw = t * 1.55;
    const p = (u, v) => `${(x1 + Math.cos(a) * u - Math.sin(a) * v).toFixed(1)},${(y1 + Math.sin(a) * u + Math.cos(a) * v).toFixed(1)}`;
    return `<path d="M${p(0, -t / 2)} L${p(L - hl, -t / 2)} L${p(L - hl, -hw)} L${p(L, 0)} L${p(L - hl, hw)} L${p(L - hl, t / 2)} L${p(0, t / 2)} Z" fill="${fill}"/>`;
  };

  // a straight band of thickness t from (x1,y1) to (x2,y2) (the red bar of the exit sign)
  const bar = (x1, y1, x2, y2, t, fill) => {
    const a = Math.atan2(y2 - y1, x2 - x1), dx = (-Math.sin(a) * t) / 2, dy = (Math.cos(a) * t) / 2;
    return `<path d="M${x1 + dx},${y1 + dy} L${x2 + dx},${y2 + dy} L${x2 - dx},${y2 - dy} L${x1 - dx},${y1 - dy} Z" fill="${fill}"/>`;
  };

  // the lines a name takes on a sign: one, or two when it is wider than maxW
  const lines = (s, size, maxW) => (tw(s, size) <= maxW || !s.includes(' ') ? [s] : split2(s, size));
  // the exit pictogram (S-341 etc.): the carriageway in two slanted strips, the right one bending off into an arrow
  const exitPicto = (x, y, h, fill) => `<g transform="translate(${x},${y}) scale(${h / 100})" fill="${fill}"><path d="M0,100 L20,0 L40,0 L30,100 Z"/>` +
    `<path d="M42,100 L47,52 Q49,40 58,31 L70,19 L61,10 L96,2 L88,37 L79,28 L67,40 Q62,46 61,56 L60,100 Z"/></g>`;

  const es = [
    { id: 'entrada', kind: 'entry', label: 'Town entry (S-500)', draw: (o) => plate(o, false) },
    { id: 'fin', kind: 'exit', label: 'Town exit (S-510)', draw: (o) => plate(o, true) },

    // S-220: pre-signal on a conventional road: distance plate on top, road plate, destination in capitals, arrow
    { id: 'presenal', kind: 'direction', label: 'Pre-signal, conventional road (S-220)', defaults: { road: 'N-126' }, draw: ({ name, road }) => {
      const cap = 62, size = cap / CAP, L = lines(up(name), size, 820), lw = Math.max(...L.map((l) => tw(l, size))), pitch = 100;
      const W = Math.max(560, Math.round(lw + 300)), top = 156, H = top + 330 + (L.length - 1) * pitch;
      return svg(W, H,
        `<rect x="${W / 2 - 180}" y="10" width="360" height="136" rx="40" fill="#fff" stroke="#8a8a8a" stroke-width="2"/><rect x="${W / 2 - 168}" y="22" width="336" height="112" rx="30" fill="none" stroke="#111" stroke-width="12"/>` +
        T(W / 2, 104, '500  m', 58 / CAP, CC, { fill: '#111' }) +
        `<rect x="2" y="${top}" width="${W - 4}" height="${H - top - 4}" rx="48" fill="#fff" stroke="#8a8a8a" stroke-width="2"/><rect x="18" y="${top + 16}" width="${W - 36}" height="${H - top - 36}" rx="34" fill="none" stroke="#111" stroke-width="14"/>` +
        roadPlate(70, top + 60, road, 92, false).svg + L.map((l, i) => T(70, top + 250 + i * pitch, l, size, CC, { anchor: 'start', fill: '#111', maxw: lw + 1, max: size })).join('') +
        farrow(W - 190, top + 225 + (L.length - 1) * pitch / 2, W - 80, top + 225 + (L.length - 1) * pitch / 2, 16, '#111'));
    } },

    // S-200: roundabout pre-signal: white, black border, the roundabout drawn with its exits (the ring open where traffic
    // enters); the straight-on destination above the top arm, a motorway destination in a blue panel with its road plate
    { id: 'glorieta', kind: 'direction', label: 'Roundabout pre-signal (S-200)', defaults: { road: 'A-6' }, draw: ({ name, next, road }) => {
      const size = 46 / CAP, L = lines(up(name), size, 760), lw = Math.max(...L.map((l) => tw(l, size))), dy = (L.length - 1) * 74;
      const ns = 42 / CAP, NL = lines(next, ns, 420), pn = Math.max(...NL.map((l) => tw(l, ns))), rw = tw(road, 0.62 * 54 / CAP) + 27;
      const panelW = Math.max(pn, rw) + 60, H = 470 + dy, cx = Math.max(330, lw / 2 + 60), cy = 256 + dy;
      const W = Math.max(900, Math.round(cx + 200 + panelW + 40), Math.round(lw + 140)), r = 56, gap = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      const [gx1, gy1] = gap(Math.PI * 0.62), [gx2, gy2] = gap(Math.PI * 0.86);
      const panelH = 130 + (NL.length - 1) * 56;
      return svg(W, H,
        `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="44" fill="#fff" stroke="#8a8a8a" stroke-width="2"/><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="32" fill="none" stroke="#111" stroke-width="12"/>` +
        L.map((l, i) => T(cx, 100 + i * 74, l, size, CC, { fill: '#111', maxw: lw + 1, max: size })).join('') +
        `<path d="M${gx1.toFixed(1)},${gy1.toFixed(1)} A${r},${r} 0 1 0 ${gx2.toFixed(1)},${gy2.toFixed(1)}" fill="none" stroke="#111" stroke-width="28"/>` +
        `<rect x="${cx - 7.5}" y="${cy + r + 4}" width="15" height="${H - 46 - cy - r}" fill="#111"/>` +
        farrow(cx, cy - r - 14, cx, cy - 140, 15, '#111') + farrow(cx - r - 14, cy, cx - 165, cy, 15, '#111') + farrow(cx + r + 14, cy, cx + 165, cy, 15, '#111') +
        `<rect x="${W - panelW - 40}" y="${H - 40 - panelH}" width="${panelW}" height="${panelH}" fill="${BLUE}"/>` +
        roadPlate(W - 40 - panelW / 2 - rw / 2, H - 40 - panelH + 16, road, 54, true).svg +
        NL.map((l, i) => T(W - 40 - panelW / 2, H - 40 - panelH + 110 + i * 56, l, ns, CC, { fill: '#fff', maxw: pn + 1, max: ns })).join('')
      );
    } },

    // motorway (autopista / autovía): blue with a white border, mixed-case CCRIGE; gantry sign over the lanes, the nearer
    // destination smaller above the main one
    { id: 'autovia-portico', kind: 'motorway', label: 'Motorway gantry sign (S-235)', defaults: { road: 'A-6' }, draw: ({ name, next, road }) => {
      const big = 58 / CAP, small = 44 / CAP, L = lines(name, big, 900), lw = Math.max(...L.map((l) => tw(l, big))), xw = Math.min(900, tw(next, small));
      const dy = (L.length - 1) * 92, W = Math.max(640, Math.round(Math.max(lw, xw) + 160)), H = 440 + dy, rp = roadPlate(0, 0, road, 64, true);
      return svg(W, H,
        `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="34" fill="${MB}" stroke="#fff" stroke-width="3"/><rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="24" fill="none" stroke="#fff" stroke-width="10"/>` +
        roadPlate(W / 2 - rp.w / 2, 44, road, 64, MB).svg +
        T(W / 2, 198, next, small, CC, { fill: '#fff', maxw: xw + 1, max: small }) +
        L.map((l, i) => T(W / 2, 290 + i * 92, l, big, CC, { fill: '#fff', maxw: lw + 1, max: big })).join('') +
        farrow(110, 320 + dy, 110, 405 + dy, 16, '#fff') + farrow(W - 110, 320 + dy, W - 110, 405 + dy, 16, '#fff'));
    } },
    // S-225: exit pre-signal: distance and exit-number boxes on top, the exit's destination with a slanted arrow
    { id: 'autovia-salida', kind: 'motorway', label: 'Motorway exit pre-signal (S-225)', draw: ({ name, exit }) => {
      const size = 58 / CAP, L = lines(name, size, 900), lw = Math.max(...L.map((l) => tw(l, size))), dy = (L.length - 1) * 92;
      const W = Math.max(760, Math.round(lw + 250)), H = 470 + dy;
      const box = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="30" fill="none" stroke="#fff" stroke-width="10"/>`;
      return svg(W, H,
        `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="34" fill="${MB}" stroke="#fff" stroke-width="3"/>` +
        box(16, 16, 300, 150) + T(166, 116, '500 m', 52 / CAP, CC, { fill: '#fff' }) +
        box(330, 16, W - 346, 150) + exitPicto(372, 42, 104, '#fff') +
        T(W - 60, 116, exit, 56 / CAP, CC, { fill: '#fff', anchor: 'end' }) +
        box(16, 180, W - 32, 274 + dy) + L.map((l, i) => T(60, 345 + i * 92, l, size, CC, { fill: '#fff', anchor: 'start', maxw: lw + 1, max: size })).join('') +
        farrow(W - 150, 290 + dy / 2, W - 70, 370 + dy / 2, 16, '#fff'));
    } },
  ];

  TS.add('ES', es, { next: 'Valdemoro', road: 'A-4', exit: 20, km: 12 });
})();
