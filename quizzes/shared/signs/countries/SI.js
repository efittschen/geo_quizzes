// SI: Slovenian signs carrying a place name, drawn after the GeoHints pictures (see examples/SI.json for which).
(function () {
  const { T, svg } = TS;
  // ---- ex-Yugoslav kit (same block in ME, MK, RS, HR, SI) ----
  // DIN 1451 look: DINish SemiBold (Mittelschrift), DINish Condensed SemiBold (Engschrift); cap height 0.69 em;
  // mean letter widths (em) for estimating sizes: Latin lower case, capitals, Cyrillic
  const F = "'DINish','Roboto Condensed',sans-serif", FC = "'DINish Condensed','Roboto Condensed',sans-serif", CAP = 0.69;
  const W_ = { F: { l: 0.433, u: 0.508, c: 0.487 }, FC: { l: 0.349, u: 0.393, c: 0.397 } };
  const YEL = '#f5c400', BLUE = '#1d4f9c', GREEN = '#00845a', RED = '#d9161c';
  const len = (s) => [...String(s)].length;
  const wOf = (s, cond) => { const k = cond ? W_.FC : W_.F; return /[Ѐ-ӿ]/.test(s) ? k.c : s === s.toUpperCase() ? k.u : k.l; };
  // best cut of a name into two lines, at a space or after a hyphen
  const split2 = (s) => {
    const cuts = [];
    for (let i = 1; i < s.length; i++) { if (s[i] === ' ') cuts.push([s.slice(0, i), s.slice(i + 1)]); else if (s[i - 1] === '-') cuts.push([s.slice(0, i), s.slice(i)]); }
    return cuts.length ? cuts.reduce((b, c) => (Math.max(len(c[0]), len(c[1])) < Math.max(len(b[0]), len(b[1])) ? c : b)) : [s];
  };
  // the width a text takes at cap height `cap`
  const est = (s, cap, cond) => len(s) * wOf(s, cond) * 1.03 * cap / CAP;
  // one text line: cap height `cap`, shrunk only if it would pass maxw (TS.fitDOM then fits it in the real font)
  // (o.ls: letter spacing in em, as on the widely spaced Serbian motorway lettering)
  const tx = (x, y, s, cap, maxw, o = {}) => { const z = Math.min(cap / CAP, maxw / (len(s) * (wOf(s, o.cond) + (o.ls || 0)) * 1.03)); return T(x, y, s, z, o.cond ? FC : F, { weight: 600, maxw, max: z, anchor: o.anchor || 'start', fill: o.fill || '#000', ls: o.ls || 0 }); };
  // lines sharing one size
  const txs = (x, y0, dy, ls, cap, maxw, o = {}) => { const z = Math.min(cap / CAP, ...ls.map((s) => maxw / (len(s) * (wOf(s, o.cond) + (o.ls || 0)) * 1.03))); return ls.map((s, i) => T(x, y0 + i * dy, s, z, o.cond ? FC : F, { weight: 600, maxw, max: z, anchor: o.anchor || 'middle', fill: o.fill || '#000', ls: o.ls || 0 })).join(''); };
  // block arrow (triangular head, straight shaft) centred on (x, y), pointing left/right/up/down, overall length s
  const barrow = (x, y, dir, s, fill) => { const r = { right: 0, left: 180, up: -90, down: 90, upright: -45 }[dir]; return `<path transform="translate(${x},${y}) rotate(${r})" d="M${s / 2},0 L${s / 2 - s * 0.42},${-s * 0.36} L${s / 2 - s * 0.42},${-s * 0.13} L${-s / 2},${-s * 0.13} L${-s / 2},${s * 0.13} L${s / 2 - s * 0.42},${s * 0.13} L${s / 2 - s * 0.42},${s * 0.36} Z" fill="${fill}"/>`; };
  // town plate: framed (entry) or unframed; one line widened up to 1.5x, else two lines; optional red bar (exit);
  // fw frame width, sp letter spacing (em)
  const townPlate = ({ rows, bg = YEL, ink = '#000', frame = true, exit = false, cap = 84, H0 = 300, fw = 9, sp = 0 }) => {
    let W = 640, ls = rows;
    const need = Math.max(...ls.map((s) => est(s, cap) * (1 + sp / 0.45))) + 110;
    if (need > W) W = Math.min(960, Math.round(need));
    if (ls.length === 1 && need > 960 && split2(ls[0]).length > 1) ls = split2(ls[0]);
    const H = ls.length > 1 ? H0 + (ls.length - 1) * cap * 1.25 - 20 : H0, gap = cap * 1.42;
    const y0 = H / 2 - ((ls.length - 1) * gap) / 2 + cap / 2;
    const bar = exit ? `<clipPath id="yu-x"><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="14"/></clipPath><path d="M0,${H - 22} L${W},${8} L${W},${40} L0,${H + 10} Z" fill="${RED}" clip-path="url(#yu-x)"/>` : '';
    return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="20" fill="${bg}" stroke="#bbb" stroke-width="1.5"/>` +
      (frame ? `<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="14" fill="none" stroke="${ink}" stroke-width="${fw}"/>` : '') +
      txs(W / 2, y0, gap, ls, cap, W - 90, { fill: ink, ls: sp }) + bar);
  };
  // arrow-shaped plate pointing right: rectangle + point; tip: 'black' (filled black point, yellow signs) or 'line' (outline only)
  const arrowPlate = (W, H, bg, edge) => {
    const P = H * 0.62;
    return `<path d="M3,3 L${W - P},3 L${W - 3},${H / 2} L${W - P},${H - 3} L3,${H - 3} Z" fill="${edge}" stroke="${bg}" stroke-width="5" stroke-linejoin="round"/>` +
      `<path d="M13,12 L${W - P - 6},12 C${W - P + P * 0.38},${H * 0.28} ${W - P + P * 0.5},${H * 0.42} ${W - P + P * 0.56},${H / 2} C${W - P + P * 0.5},${H * 0.58} ${W - P + P * 0.38},${H * 0.72} ${W - P - 6},${H - 12} L13,${H - 12} Z" fill="${bg}"/>`;
  };
  // a plate width that holds the longest text at full size next to `fixed` px of other parts, from base up to 1.5x base
  const grow = (base, texts, cap, cond, fixed, sp = 0) => Math.round(Math.max(base, Math.min(base * 1.5, Math.max(...texts.map((t) => est(t, cap, cond) * (1 + sp / 0.45))) + fixed)));
  // ---- end of kit ----
  // town plates: Helvetica-style regular lettering as on the GeoHints drawings (Arimo; cap 0.688 em, mean lower-case width 0.48 em)
  const H_ = "'Arimo',sans-serif", HCAP = 0.688, HW = 0.48;
  const YEL_SI = '#ffe900', BROWN = '#7a3b22';
  // a place name split as Slovenian plates print it: the main word(s) large, a prepositional tail (pri, na, ob, v, pod, nad,
  // ...) on a second, smaller line ("Šmarje / pri Jelšah"); other long two-word names on two equal lines
  const siRows = (name) => {
    const m = String(name).match(/^(.+?)\s+((?:pri|na|ob|v|pod|nad|za|pred|od|s|z)\s.+)$/);
    if (m) return [[m[1], 1], [m[2], 0.72]];
    if (len(name) > 13 && split2(name).length > 1) return split2(name).map((l) => [l, 1]);
    return [[name, 1]];
  };
  const plate = ({ name }, { frame = true, exit = false } = {}) => {
    // a one-line name: the plate about 1.43 times as long as high, the name large with its baseline a little below the
    // middle (city-signs 136, 640 x 446); two lines as city-signs 135
    const rows = siRows(name), one = rows.length === 1, cap = one ? 130 : 96, W0 = 640;
    const need = Math.max(...rows.map(([s, k]) => len(s) * HW * 1.03 * cap * k / HCAP)) + 110, W = Math.max(W0, Math.min(980, Math.round(need)));
    const H = one ? 446 : 380, ys = one ? [H / 2 + cap * 0.36] : [170, 300];
    // the main line at full size if it fits; the tail at 0.72 of it, or less if it needs to (equal lines share one size)
    const fitZ = (s) => (W - 90) / (len(s) * HW * 1.03);
    const z0 = Math.min(cap / HCAP, ...rows.filter(([, k]) => k === 1).map(([s]) => fitZ(s)));
    const zs = rows.map(([s, k]) => (k === 1 ? z0 : Math.min(z0 * k, fitZ(s))));
    // exit bar (group B): corner to corner of the plate, cut by its edge, behind the black frame and the name
    const bar = exit ? TS.exitbar({ box: [1, 1, W - 2, H - 2, 26], b: 0, t: 1, width: 39, fill: RED }) : '';
    return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="26" fill="${YEL_SI}"/>` + bar +
      (frame ? `<rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="18" fill="none" stroke="#111" stroke-width="12"/>` : '') +
      rows.map(([s], i) => T(W / 2, ys[i], s, zs[i], H_, { weight: 400, maxw: W - 90, max: zs[i] })).join(''));
  };
  // a name with a small quarter suffix after a hyphen (Ljubljana-sever), one <text> with a 0.6em <tspan>
  const SUF = /^(.*\S)-(sever|jug|vzhod|zahod|center)$/i;
  const nameLine = (x, y, s, cap, maxw, fill, cond = false) => {
    const m = String(s).match(SUF), main = m ? m[1] : String(s), suf = m ? '-' + m[2] : '';
    const units = len(main) * wOf(main, cond) + (suf ? len(suf) * wOf(suf, cond) * 0.6 : 0), z = Math.min(cap / CAP, maxw / (units * 1.03));
    return `<text x="${x}" y="${y}" font-family="${cond ? FC : F}" font-size="${z.toFixed(1)}" font-weight="600" text-anchor="start" fill="${fill}" data-maxw="${maxw}" data-max="${z.toFixed(1)}">` +
      TS.esc(main) + (suf ? `<tspan font-size="0.6em">${TS.esc(suf)}</tspan>` : '') + '</text>';
  };
  const routePlate = (x, y, w, h, label) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="none" stroke="#fff" stroke-width="2.5"/>` +
    T(x + w / 2, y + h * 0.8, label, h * 0.66 / CAP, F, { weight: 600, fill: '#fff', maxw: w * 0.8, max: h * 0.66 / CAP });
  const carBox = (x, y, s) => `<rect x="${x}" y="${y}" width="${s}" height="${s * 1.3}" rx="4" fill="none" stroke="#fff" stroke-width="3"/>` +
    `<path transform="translate(${x + s / 2},${y + s * 0.65}) scale(${s / 60})" d="M-19,10 L-19,-2 L-14,-14 L14,-14 L19,-2 L19,10 L13,10 L13,15 L7,15 L7,10 L-7,10 L-7,15 L-13,15 L-13,10 Z M-13,-3 L-10,-11 L10,-11 L13,-3 Z" fill="#fff" fill-rule="evenodd"/>`;

  const si = [
    { id: 'entry', kind: 'entry', label: 'Town entry', draw: (o) => plate(o) },
    { id: 'exit', kind: 'exit', label: 'Town exit', draw: (o) => plate(o, { exit: true }) },
    { id: 'hamlet', kind: 'hamlet', label: 'Place-name sign, no frame', draw: (o) => plate(o, { frame: false }) },
    { id: 'arrow-blue', kind: 'direction', label: 'Direction arrows (blue)', draw: ({ name, next }) => {
      const W = 640, H = 170, row = (y, n) => { const ls = len(n) > 11 ? siRows(n).map(([l]) => l) : [n];
        // GeoHints 202: the pale rim at the very edge widens into a pale wedge at the point; the blue field's own point is
        // much blunter (TS.arrows.plate)
        const pl = TS.arrows.plate({ x: 1, y: 1, w: W - 2, h: H - 2, dir: 'right', tip: 0.8 * H, r: 10, rTip: 8, rNeck: 3, fill: BLUE, ink: '#d8dde3', band: 11, fieldTip: 0.95, rField: 5 });
        return `<g transform="translate(0,${y})">${pl.svg}` +
          carBox(30, 30, 64) + txs(124, ls.length > 1 ? 74 : 112, 66, ls, ls.length > 1 ? 50 : 70, 380, { anchor: 'start', fill: '#e8ecef', cond: true }) + '</g>'; };
      return svg(W, 2 * H + 10, row(0, name) + row(H + 10, next));
    } },
    { id: 'motorway', kind: 'motorway', label: 'Motorway sign (green)', defaults: { road: 'A2', road2: 'A1' }, draw: ({ name, next, road, road2 }) => {
      const W = 540, H = 720;
      // (group D) the white rim runs round the destinations only; the distance stands below it on the bare green, unframed.
      // Motorway plates: the Slovenian A plate of shared/shields.js (white plate, hexagonal green field)
      const aPlate = (x, y, label) => TS.shields.hexPlate(x, y, 70, 43, label, { kind: 'si', field: GREEN, font: F, weight: 600, cap: 0.5, capEm: CAP });
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="6" fill="${GREEN}"/><rect x="12" y="12" width="${W - 24}" height="${H - 88}" rx="6" fill="none" stroke="#eee" stroke-width="4"/>` +
        aPlate(37, 33, road) + (len(name) > 18 ? siRows(name).map(([l], i) => nameLine(40, 128 + i * 48, l, 34, 460, '#eee')).join('') : nameLine(40, 128, name, 34, 460, '#eee')) +
        `<path d="M168,640 Q168,430 70,316" fill="none" stroke="#eee" stroke-width="13"/><path d="M50,282 L96,304 L66,330 Z" fill="#eee"/>` +
        `<path d="M168,640 Q176,540 240,480" fill="none" stroke="#eee" stroke-width="13"/><path d="M266,456 L250,504 L222,478 Z" fill="#eee"/>` +
        aPlate(267, 357, road2) + (len(next) > 11 ? siRows(next).map(([l], i) => nameLine(270, 454 + i * 48, l, 34, 240, '#eee')).join('') : nameLine(270, 454, next, 34, 240, '#eee')) + T(W / 2, H - 26, '800 m', 30 / CAP, F, { weight: 600, fill: '#eee' }));
    } },
    { id: 'advance-yellow', kind: 'direction', label: 'Junction advance sign (yellow)', draw: ({ name, next }) => {
      const W = 520, H = 560;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="#f0b81c"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="6" fill="none" stroke="#2a2a2a" stroke-width="4"/>` +
        tx(W / 2, 82, name, 38, 440, { anchor: 'middle', fill: '#2a2a2a' }) +
        `<path d="M270,470 L270,190 M270,330 L130,330" stroke="#1e1e1e" stroke-width="16" fill="none"/><path d="M270,138 L246,192 L294,192 Z M84,330 L136,306 L136,354 Z" fill="#1e1e1e"/>` +
        tx(250, 304, next, 38, 220, { anchor: 'end', fill: '#2a2a2a' }) + T(W / 2, 524, '200 m', 32 / CAP, F, { weight: 600, fill: '#2a2a2a' }));
    } },
    // group I: cycle route sign, after the Commons photo "Cycling route L-353 sign" (Zreče 3 km): the blue route plate
    // (white rim, white bicycle, route code) over a small white plate with a black rim, the destination, distance and arrow
    { id: 'kolesarska', kind: 'bike', label: 'Cycle route sign (blue, white plate)', defaults: { route: 'L-353' }, draw: ({ name, km, route }) => {
      const BL = '#1f6cc0', z = 30 / CAP, d = `${Math.max(1, Math.round(km))} km`;
      // a long name goes on two lines, the distance after the second (the plate stays about as wide as the route plate)
      const one = [...`${name} ${d}`].length * 0.55 * z <= 330, sp = one ? [name] : split2(String(name));
      const L = one ? [`${name} ${d}`] : sp.length > 1 ? [sp[0], `${sp[1]} ${d}`] : [`${name} ${d}`];
      const nw = Math.min(700, Math.max(...L.map((l) => [...l].length * 0.55 * z))), W = Math.round(Math.max(300, 30 + nw + 24 + 50 + 24)), q = 300, qx = (W - q) / 2;
      const ph = 100 + (L.length - 1) * 50, H = 320 + ph;
      return svg(W, H, `<rect x="${qx + 1}" y="1" width="${q - 2}" height="${q - 2}" rx="18" fill="${BL}" stroke="#c4c4c4" stroke-width="2"/>` +
        `<rect x="${qx + 9}" y="9" width="${q - 18}" height="${q - 18}" rx="11" fill="none" stroke="#fff" stroke-width="5"/>` +
        TS.bike(W / 2, 112, 180, '#fff') + T(W / 2, 252, String(route), 62 / CAP, F, { fill: '#fff', weight: 600, maxw: q - 60, max: 62 / CAP }) +
        `<rect x="1" y="318" width="${W - 2}" height="${ph}" rx="14" fill="#fff" stroke="#c4c4c4" stroke-width="2"/>` +
        `<rect x="9" y="326" width="${W - 18}" height="${ph - 16}" rx="9" fill="none" stroke="#222" stroke-width="4"/>` +
        L.map((l, i) => T(30, 383 + i * 50, l, z, F, { anchor: 'start', fill: '#222', weight: 500, maxw: Math.round(nw), max: z })).join('') +
        TS.arrows.dir(W - 30 - 25, 318 + ph / 2, 90, 50, { w: 6, fill: '#222', head: { open: true, half: 2.6, back: 2.6, sw: 1 } }));
    } },
  ];

  TS.add('SI', si, { next: 'Celje', km: 15 });
})();
