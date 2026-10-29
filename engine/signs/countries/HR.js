// HR: Croatian signs carrying a place name, drawn after the GeoHints pictures (see examples/HR.json for which).
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
  const YEL_HR = '#f2c21b', ORANGE_HR = '#e9a21a', INK = '#1f1a17';
  // up arrow of Croatian overhead signs: tip at (x, y), length h, shaft width w, chevron head with blunt barbs (TS.arrows 'din')
  const upArrow = (x, y, h, fill, w = 18) => TS.arrows.straight(x, y + h, x, y, { w, head: 'din', fill });
  const roadBox = (x, y, w, h, label, fill, line) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${line}" stroke-width="3"/>` +
    T(x + w / 2, y + h * 0.8, label, h * 0.68 / CAP, F, { weight: 600, fill: line, maxw: w * 0.84, max: h * 0.68 / CAP });
  // a name line with Croatian spaced lettering; a trailing quarter word (istok, zapad, sjever, jug, centar) printed smaller,
  // as "Vrbovec istok" on the GeoHints picture (one <text> with a 0.62em <tspan>, so TS.fitDOM scales both together)
  const SUF = /^(.*\S)\s+(istok|zapad|sjever|jug|centar)$/i, SP = 0.07;
  const nameLine = (x, y, s, cap, maxw, fill, anchor = 'start') => {
    const m = String(s).match(SUF), main = m ? m[1] : String(s), suf = m ? m[2] : '';
    const units = len(main) * (wOf(main) + SP) + (suf ? (len(suf) + 1) * (wOf(suf) + SP) * 0.62 : 0);
    const z = Math.min(cap / CAP, maxw / (units * 1.03));
    return `<text x="${x}" y="${y}" font-family="${F}" font-size="${z.toFixed(1)}" font-weight="600" text-anchor="${anchor}" fill="${fill}" letter-spacing="${(SP * z).toFixed(1)}" data-ls="${SP}" data-maxw="${maxw}" data-max="${z.toFixed(1)}">` +
      TS.esc(main) + (suf ? ` <tspan font-size="0.62em">${TS.esc(suf)}</tspan>` : '') + '</text>';
  };
  // two names stacked, left-aligned as a block centred on cx (both at the smaller of their sizes)
  const block = (cx, y0, names, cap, maxw, fill, left = false) => {
    const c = Math.min(cap, ...names.map((s) => maxw / (len(s) * (wOf(s) + SP) * 1.03) * CAP));
    const w = Math.min(maxw, Math.max(...names.map((s) => len(s) * (wOf(s) + SP) * 1.03 * c / CAP)));
    return names.map((s, i) => nameLine(left ? cx : cx - w / 2, y0 + i * cap * 1.38, s, c, maxw, fill)).join('');
  };

  const hr = [
    { id: 'entry', kind: 'entry', label: 'Town entry', draw: ({ name }) => townPlate({ rows: [name], bg: YEL_HR, ink: INK, cap: 84, H0: 360, fw: 5, sp: 0.06 }) },
    { id: 'exit', kind: 'exit', label: 'Town exit', draw: ({ name }) => townPlate({ rows: [name], bg: YEL_HR, ink: INK, cap: 84, H0: 360, fw: 5, sp: 0.06, exit: true }) },
    { id: 'overhead-blue', kind: 'direction', label: 'Overhead sign (blue)', defaults: { road: '28' }, draw: ({ name, next, road }) => {
      const W = grow(640, [name, next], 50, false, 240, SP), H = 340;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="6" fill="${BLUE}"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="4" fill="none" stroke="#e6e6e6" stroke-width="5"/>` +
        block(W / 2, 108, [name, next], 50, W - 240, '#e6e6e6') + roadBox(W / 2 - 33, 236, 66, 52, road, BLUE, '#e6e6e6') + upArrow(80, 170, 120, '#e6e6e6', 19) + upArrow(W - 80, 170, 120, '#e6e6e6', 19));
    } },
    { id: 'overhead-yellow', kind: 'direction', label: 'Overhead sign (yellow)', defaults: { road: '26' }, draw: ({ name, next, road }) => {
      const W = grow(600, [name, next], 56, false, 130, SP), H = 400;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="6" fill="${ORANGE_HR}"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="4" fill="none" stroke="${INK}" stroke-width="5"/>` +
        block(56, 110, [name, next], 56, W - 130, INK, true) + roadBox(W / 2 - 56, 250, 70, 58, road, '#1e5cb3', '#fff') +
        TS.arrows.straight(W - 157, 365, W - 60, 262, { w: 18, fill: INK, head: { half: 2.4, back: 2.4, cut: 1.4, neck: 2.1 } }));
    } },
    { id: 'motorway', kind: 'motorway', label: 'Motorway sign (green)', defaults: { road: 'A 1', road2: 'E 65' }, draw: ({ name, next, road, road2 }) => {
      const W = grow(640, [name, next], 50, false, 240, SP), H = 360;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="6" fill="${GREEN}"/><rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="10" fill="none" stroke="#e6e6e6" stroke-width="5"/>` +
        // GeoHints 104 at large size: the E plate a thin rounded white rim; the A plate white with a hexagonal green field
        // (the ex-Yugoslav motorway plate, group D's TS.shields.hexPlate 'si')
        block(W / 2, 98, [name, next], 50, W - 240, '#e6e6e6') +
        TS.shields.ePlate(W / 2 - 124, 224, 112, 48, road2, { field: GREEN, fg: '#e6e6e6', font: F, weight: 600, cap: 0.5, capEm: CAP, sw: 0.06, rx: 0.14 }) +
        TS.shields.hexPlate(W / 2 + 10, 224, 112, 48, road, { kind: 'si', field: GREEN, fg: '#e6e6e6', font: F, weight: 600, cap: 0.5, capEm: CAP }) +
        upArrow(94, 203, 98, '#e6e6e6', 16) + upArrow(W - 94, 203, 98, '#e6e6e6', 16));
    } },
    { id: 'arrow-yellow', kind: 'direction', label: 'Direction arrow (yellow)', draw: ({ name }) => {
      // the black rim widens into a wedge at the point: the yellow field's own point is blunter (GeoHints 105)
      const cap = 86, H = 240, W = Math.max(860, Math.min(1260, Math.round(est(name, cap) + 64 + 290)));
      const pl = TS.arrows.plate({ x: 3, y: 3, w: W - 6, h: H - 6, dir: 'right', tip: 198, r: 12, rTip: 16, fill: YEL_HR, ink: '#111', band: 6, fieldTip: 0.89 });
      return svg(W, H, pl.svg + tx(64, H / 2 + cap / 2, name, cap, pl.neck - 64 - 24));
    } },
  ];

  TS.add('HR', hr, { next: 'Bjelovar', km: 18 });
})();
