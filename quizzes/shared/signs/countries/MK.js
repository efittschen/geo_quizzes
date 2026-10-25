// MK: North Macedonian signs carrying a place name, drawn after the GeoHints pictures (see examples/MK.json for which).
// Names in Cyrillic (name) over Latin (alt); without alt the Latin line is computed (helper mkLat: Macedonian Cyrillic to
// Latin with č š ž, dz, dž, lj, nj, ǵ, ḱ, as Kočani, Štip, Delčevo, Priština are written on the pictures).
(function () {
  const { T, svg } = TS;
  // ---- ex-Yugoslav kit (same block in ME, MK, RS, HR, SI) ----
  // DIN 1451 look: DINish SemiBold (Mittelschrift), DINish Condensed SemiBold (Engschrift); cap height 0.69 em;
  // mean letter widths (em) for estimating sizes: Latin lower case, capitals, Cyrillic
  // (DINish SR first, as for Serbia: the Macedonian signs show the same Λ-shaped Л, e.g. "Палнка" on direction-signs 179)
  const F = "'DINish SR','DINish','Roboto Condensed',sans-serif", FC = "'DINish Condensed','Roboto Condensed',sans-serif", CAP = 0.69;
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
    // exit bar (group B, GeoHints 113): over the frame but behind the lettering, across the whole plate from just above
    // its bottom-left corner to just below its top-right one, cut by the plate's edge
    const bar = exit ? TS.exitbar({ box: [2, 2, W - 4, H - 4, 20], from: [2, 2 + (H - 4) * 0.96], to: [W - 2, 2 + (H - 4) * 0.04], width: 32, fill: RED }) : '';
    return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="20" fill="${bg}" stroke="#bbb" stroke-width="1.5"/>` +
      (frame ? `<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="14" fill="none" stroke="${ink}" stroke-width="${fw}"/>` : '') + bar +
      txs(W / 2, y0, gap, ls, cap, W - 90, { fill: ink, ls: sp }));
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
  const MKL = { А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Ѓ: 'Ǵ', Е: 'E', Ж: 'Ž', З: 'Z', Ѕ: 'Dz', И: 'I', Ј: 'J', К: 'K', Л: 'L', Љ: 'Lj', М: 'M', Н: 'N', Њ: 'Nj', О: 'O', П: 'P', Р: 'R', С: 'S', Т: 'T', Ќ: 'Ḱ', У: 'U', Ф: 'F', Х: 'H', Ц: 'C', Ч: 'Č', Џ: 'Dž', Ш: 'Š' };
  const mkLat = (s) => { const a = [...String(s)]; return a.map((c, i) => { const m = MKL[c.toUpperCase()]; if (!m) return c; if (c !== c.toUpperCase()) return m.toLowerCase(); const nx = a[i + 1]; return m.length > 1 && nx && nx !== nx.toLowerCase() ? m.toUpperCase() : m; }).join(''); };
  const lat = (name, alt) => alt || mkLat(name);
  const YEL_MK = '#eeb31b', INK = '#2a1a10';
  // a Cyrillic + Latin pair at one size, left-aligned at x (or anchored as o.anchor)
  const pair = (x, y, name, alt, cap, maxw, o = {}) => txs(x, y, cap * 1.5, [name, lat(name, alt)], cap, maxw, { anchor: 'start', ...o });
  // arrow plate pointing right or left: field colour, point colour (the chevron in the point)
  const arrowSign = (W, H, dir, field, point, edge = point) => {
    const P = H * 0.42, flip = dir === 'left' ? ` transform="translate(${W},0) scale(-1,1)"` : '';
    return `<g${flip}><path d="M3,3 L${W - P},3 L${W - 3},${H / 2} L${W - P},${H - 3} L3,${H - 3} Z" fill="${point}" stroke="${edge}" stroke-width="4" stroke-linejoin="round"/>` +
      `<path d="M${point === edge ? 3 : 10},${point === edge ? 3 : 10} L${W - P - 4},${point === edge ? 3 : 10} C${W - P + P * 0.3},${H * 0.3} ${W - P + P * 0.42},${H * 0.42} ${W - P + P * 0.46},${H / 2} C${W - P + P * 0.42},${H * 0.58} ${W - P + P * 0.3},${H * 0.7} ${W - P - 4},${H - (point === edge ? 3 : 10)} L${point === edge ? 3 : 10},${H - (point === edge ? 3 : 10)} Z" fill="${field}"/></g>`;
  };
  // road-number plate (white outline on dark signs; coloured with white text on yellow signs)
  const roadPlate = (x, y, w, h, label, line = '#fff', fill = 'none', ink = line) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${line}" stroke-width="3"/>` +
    T(x + w / 2, y + h * 0.8, label, h * 0.72 / CAP, F, { weight: 600, fill: ink, maxw: w * 0.86, max: h * 0.72 / CAP });

  const mk = [
    { id: 'entry', kind: 'entry', label: 'Town entry', draw: ({ name, alt }) => townPlate({ rows: [name, lat(name, alt)], cap: 72, H0: 300 }) },
    // city-signs 113 (Metovnica): the name in Latin only, one line, struck through
    { id: 'exit', kind: 'exit', label: 'Town exit (Latin)', draw: ({ name, alt }) => townPlate({ rows: [lat(name, alt)], cap: 80, H0: 230, exit: true }) },
    // the same plate with Cyrillic over Latin, as the entry plates of the Commons photos (Grnčari and the other
    // City limit signs in North Macedonia) write it; no plain two-script exit photo was found
    { id: 'exit-cyr-lat', kind: 'exit', label: 'Town exit (Cyrillic and Latin)', draw: ({ name, alt }) => townPlate({ rows: [name, lat(name, alt)], cap: 72, H0: 300, exit: true }) },
    { id: 'arrow-yellow', kind: 'direction', label: 'Direction arrows (yellow)', draw: ({ name, alt, next, km }) => {
      const txt = [name, lat(name, alt), next, mkLat(next)], W = grow(640, txt, 44, false, 300), H = 200;
      const row = (y, n, a, d) => `<g transform="translate(0,${y})">${arrowSign(W, H, 'right', YEL_MK, '#111', '#c9c2a8')}` +
        pair(56, 86, n, a, 44, W - 300, { fill: INK }) + tx(W - 160, 124, String(d), 50, 110, { anchor: 'end', fill: INK }) + '</g>';
      return svg(W, 2 * H + 8, row(0, name, alt, km) + row(H + 8, next, null, km + 38));
    } },
    { id: 'rows-yellow', kind: 'direction', label: 'Direction plates (yellow)', defaults: { road: 'A1', road2: 'A3' }, draw: ({ name, alt, next, km, road, road2 }) => {
      const txt = [name, lat(name, alt), next, mkLat(next)], W = grow(520, txt, 30, false, 320), H = 250, tw = W - 320;
      const YA = { w: 7, fill: INK, head: { open: true, half: 3.9, back: 3.6, sw: 1.7 } };
      const plate = (y, n, a, d, dir, rd, kind) => `<g transform="translate(0,${y})"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="${YEL_MK}"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="5" fill="none" stroke="#2b2b2b" stroke-width="3"/>` +
        // direction-signs 177: a thin shaft with an open chevron head (TS.arrows); the road number on the green plate with a
        // white rim set in from its edge (TS.shields.ePlate), small, under the Latin name
        (dir === 'left' ? TS.arrows.dir(72, 84, 270, 80, YA) + pair(130, 82, n, a, 30, tw, { fill: INK }) + tx(W - 40, 94, `${d} km`, 30, 130, { anchor: 'end', fill: INK })
          : pair(40, 82, n, a, 30, tw, { fill: INK }) + tx(W - 130, 94, `${d}km`, 30, 130, { anchor: 'end', fill: INK }) + TS.arrows.dir(W - 72, 84, 90, 80, YA)) +
        // (group D) the route plate: the Macedonian plate of shared/shields.js (Commons drawing), green on the motorway (road,
        // A1 to Skopje on the picture), blue on the other A road (road2, A3 Štip-Veles)
        (rd ? TS.shields.mkRoute(dir === 'left' ? 130 : 40, 172, 40, rd, { kind, font: F, weight: 600, capEm: CAP }) : '') + '</g>';
      return svg(W, 2 * H + 10, plate(0, name, alt, km, 'left', road2, 'express') + plate(H + 10, next, null, km + 51, 'right', road, 'motorway'));
    } },
    { id: 'arrow-blue', kind: 'direction', label: 'Direction arrows (blue)', draw: ({ name, alt, next, km }) => {
      const txt = [name, lat(name, alt), next, mkLat(next)], W = grow(640, txt, 44, false, 280), H = 200;
      const row = (y, n, a, d, dir) => `<g transform="translate(0,${y})">${arrowSign(W, H, dir, BLUE, '#f2f2f2')}` +
        pair(dir === 'left' ? 120 : 40, 86, n, a, 44, W - 280, { fill: '#fff' }) + tx(dir === 'left' ? W - 40 : W - 130, 124, String(d), 50, 110, { anchor: 'end', fill: '#fff' }) + '</g>';
      return svg(W, 2 * H + 8, row(0, name, alt, km, 'left') + row(H + 8, next, null, km + 38, 'right'));
    } },
    { id: 'rows-blue', kind: 'direction', label: 'Direction plates (blue)', draw: ({ name, alt, next, km }) => {
      const txt = [name, lat(name, alt), next, mkLat(next)], W = grow(560, txt, 38, true, 320), H = 230, tw = W - 320;
      const plate = (y, n, a, d, dir) => `<g transform="translate(0,${y})"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="${BLUE}"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="6" fill="none" stroke="#fff" stroke-width="4"/>` +
        (dir === 'left' ? barrow(68, 102, 'left', 72, '#fff') + txs(118, 96, 56, [n, lat(n, a)], 38, tw, { anchor: 'start', fill: '#fff', cond: true }) + tx(W - 34, 114, `${d} km`, 36, 140, { anchor: 'end', fill: '#fff', cond: true })
          : txs(34, 96, 56, [n, lat(n, a)], 38, tw, { anchor: 'start', fill: '#fff', cond: true }) + tx(W - 110, 114, `${d} km`, 36, 140, { anchor: 'end', fill: '#fff', cond: true }) + barrow(W - 60, 102, 'right', 72, '#fff')) + '</g>';
      return svg(W, 2 * H + 10, plate(0, name, alt, km, 'left') + plate(H + 10, next, null, km + 43, 'right'));
    } },
    { id: 'motorway', kind: 'motorway', label: 'Motorway sign (green)', defaults: { road: 'M-4', road2: 'E-65' }, draw: ({ name, alt, road, road2 }) => {
      const W = grow(640, [name, lat(name, alt)], 50, false, 320), H = 400;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="6" fill="${GREEN}"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" fill="none" stroke="#fff" stroke-width="6"/>` +
        barrow(70, 178, 'up', 110, '#fff') + roadPlate(128, 128, 130, 58, road) + roadPlate(128, 200, 130, 58, road2) +
        txs(282, 178, 74, [name, lat(name, alt)], 50, W - 320, { anchor: 'start', fill: '#fff' }));
    } },
    { id: 'urban', kind: 'direction', label: 'Town and through-route plates', defaults: { road: 'M-3', road2: 'E-65' }, draw: ({ name, alt, next, road, road2 }) => {
      const t1 = [`${name} - Центар`, `${lat(name, alt)} - Centre`], t2 = [next, mkLat(next)];
      const W = Math.max(640, Math.min(980, Math.round(Math.max(...t1.map((t) => est(t, 40)), ...t2.map((t) => est(t, 40) + 144)) + 200))), H = 420;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="196" rx="4" fill="#f2f2f0" stroke="#333" stroke-width="4"/>` +
        txs(52, 100, 66, t1, 40, W - 210, { anchor: 'start', fill: '#2b2b2b' }) + barrow(W - 100, 112, 'upright', 96, '#222') +
        `<rect x="2" y="212" width="${W - 4}" height="196" rx="4" fill="${BLUE}" stroke="#fff" stroke-width="5"/>` +
        roadPlate(46, 246, 108, 50, road) + roadPlate(46, 316, 108, 50, road2) + txs(196, 290, 68, t2, 40, W - 360, { anchor: 'start', fill: '#fff' }) + barrow(W - 100, 310, 'upright', 96, '#fff'));
    } },
  ];

  TS.add('MK', mk, { next: 'Велес', km: 24 });
})();
