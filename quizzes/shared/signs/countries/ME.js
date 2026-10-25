// ME: Montenegrin signs carrying a place name, drawn after the GeoHints pictures (see examples/ME.json for which).
// All pictures show Latin-only signs; names come as the quiz writes them (Latin).
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
  // (fi: the frame line's distance from the edge, to its middle; pr: the plate's corner radius)
  const townPlate = ({ rows, bg = YEL, ink = '#000', frame = true, exit = false, cap = 84, H0 = 300, fw = 9, sp = 0, fi = 16, pr = 20 }) => {
    let W = 640, ls = rows;
    const side = Math.max(45, fi + 28);   // text keeps this far from the plate's edge
    const need = Math.max(...ls.map((s) => est(s, cap) * (1 + sp / 0.45))) + 2 * side + 20;
    if (need > W) W = Math.min(960, Math.round(need));
    if (ls.length === 1 && need > 960 && split2(ls[0]).length > 1) ls = split2(ls[0]);
    const H = ls.length > 1 ? H0 + (ls.length - 1) * cap * 1.25 - 20 : H0, gap = cap * 1.42;
    const y0 = H / 2 - ((ls.length - 1) * gap) / 2 + cap / 2;
    const bar = exit ? `<clipPath id="yu-x"><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="14"/></clipPath><path d="M0,${H - 22} L${W},${8} L${W},${40} L0,${H + 10} Z" fill="${RED}" clip-path="url(#yu-x)"/>` : '';
    return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${pr}" fill="${bg}" stroke="#bbb" stroke-width="1.5"/>` +
      (frame ? `<rect x="${fi}" y="${fi}" width="${W - 2 * fi}" height="${H - 2 * fi}" rx="14" fill="none" stroke="${ink}" stroke-width="${fw}"/>` : '') +
      txs(W / 2, y0, gap, ls, cap, W - 2 * side, { fill: ink, ls: sp }) + bar);
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

  const me = [
    // the black line well inside a broad yellow edge, the plate's corners only slightly rounded (city-signs 107)
    { id: 'entry', kind: 'entry', label: 'Town entry', draw: ({ name }) => townPlate({ rows: [name], fi: 36, pr: 9 }) },
    { id: 'exit', kind: 'exit', label: 'Town exit', draw: ({ name }) => townPlate({ rows: [name], exit: true }) },
    { id: 'locality', kind: 'hamlet', label: 'Place-name sign (blue)', draw: ({ name }) => {
      const cap = 62, W = Math.max(640, Math.min(980, Math.round(est(name, cap) + 140))), H = 150;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="12" fill="${BLUE}"/><rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="8" fill="none" stroke="#dfe6f0" stroke-width="4"/>` +
        tx(W / 2, H / 2 + cap / 2, name, cap, W - 100, { anchor: 'middle', fill: '#dfe6f0' }));
    } },
    { id: 'table', kind: 'direction', label: 'Distance table (yellow)', draw: ({ name, next, km }) => {
      const rows = [`${name} ${km}`, `${next} ${km + 9}`], W = grow(420, rows, 30, false, 130), H = 560;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="12" fill="${YEL}"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="8" fill="none" stroke="#111" stroke-width="3"/>` +
        rows.map((s, i) => tx(40, 300 + i * 52, s, 30, W - 130)).join('') +
        // GeoHints 169: the road comes up from below, runs on past the turn to its head at the top; the arm to the left
        // leaves it a little above its foot and ends after about a third of the sign's height (TS.arrows)
        TS.arrows.group([{ pts: [[W - 70, 514], [W - 70, 64]] }, { pts: [[W - 70, 470], [W - 250, 470]] }], { w: 13, fill: '#111', head: { half: 1.45, back: 3.0, neck: 2.5 } }));
    } },
    { id: 'blue-rows', kind: 'direction', label: 'Direction rows (blue)', draw: ({ name, next }) => {
      const cap = 62, W = grow(640, [name, next], cap, false, 210), H = 400;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="16" fill="${BLUE}"/><rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="12" fill="none" stroke="#e8e8e8" stroke-width="6"/><path d="M14,200 L${W - 14},200" stroke="#e8e8e8" stroke-width="6"/>` +
        // GeoHints 170: short fat arrows, the head about as tall as the arrow is long, barbs slightly swept (TS.arrows 'block')
        TS.arrows.dir(108, 110, 270, 122, { w: 38, fill: '#e8e8e8', head: 'block' }) + tx(W - 44, 110 + cap / 2, name, cap, W - 210, { anchor: 'end', fill: '#e8e8e8' }) +
        tx(44, 296 + cap / 2, next, cap, W - 210, { fill: '#e8e8e8' }) + TS.arrows.dir(W - 108, 296, 90, 122, { w: 38, fill: '#e8e8e8', head: 'block' }));
    } },
    { id: 'arrow-yellow', kind: 'direction', label: 'Direction arrow (yellow)', draw: ({ name, next }) => {
      const cap = 58, H = 240, W = Math.max(640, Math.min(980, Math.round(Math.max(est(name, cap), est(next, cap)) + 50 + 170)));
      return svg(W, H, arrowPlate(W, H, YEL, '#111') +
        tx(48, 88, name, cap, W - 230) + tx(48, 190, next, cap, W - 230));
    } },
    { id: 'rows-yellow', kind: 'direction', label: 'Direction rows (yellow)', draw: ({ name, next }) => {
      const cap = 56, W = grow(640, [name, next], cap, false, 230), H = 300;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="16" fill="${YEL}"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="12" fill="none" stroke="#111" stroke-width="7"/><path d="M11,153 L${W - 11},153" stroke="#111" stroke-width="5"/>` +
        barrow(92, 80, 'left', 84, '#111') + tx(W - 62, 80 + cap / 2, name, cap, W - 230, { anchor: 'end' }) +
        tx(60, 216 + cap / 2, next, cap, W - 230) + barrow(W - 92, 216, 'right', 84, '#111'));
    } },
    { id: 'arrow-white', kind: 'direction', label: 'Local direction arrow (white)', draw: ({ name }) => {
      const cap = 70, H = 200, W = Math.max(640, Math.min(980, Math.round(est(name, cap) + 80 + 150)));
      return svg(W, H, arrowPlate(W, H, '#f2f2f2', '#111') +
        tx((W - H * 0.62) / 2 + 10, H / 2 + cap / 2, name, cap, W - 200, { anchor: 'middle' }));
    } },
  ];

  TS.add('ME', me, { next: 'Cetinje', km: 12 });
})();
