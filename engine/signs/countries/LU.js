// LU: Luxembourg signs carrying a place name, drawn after the GeoHints pictures (see examples/LU.json). Town plates
// yellow with a black rim: the official (French) name in bold capitals, the Luxembourgish name in bold italic below;
// locality plates (lieux-dits) in italics; direction signs yellow on ordinary roads, blue towards motorways, in DIN
// capitals. Arimo (Helvetica-like, as the pictures show) and Alte DIN 1451 / D-DIN Condensed stand in.
(function () {
  const { T, svg } = TS;
  const ARI = "'Arimo',sans-serif", DIN = "'Alte DIN 1451 Mittelschrift','D-DIN',sans-serif", ENG = "'D-DIN Condensed','Barlow Condensed',sans-serif";
  // advance widths (em) from the font files: Arimo Bold = Bold Italic (cap 0.688), Alte DIN 1451 (cap 0.711), D-DIN Condensed Bold (cap 0.69)
  const A_ARI = {" ":0.278,"'":0.238,"(":0.333,")":0.333,",":0.278,"-":0.333,".":0.278,"/":0.278,"0":0.556,"1":0.556,"2":0.556,"3":0.556,"4":0.556,"5":0.556,"6":0.556,"7":0.556,"8":0.556,"9":0.556,"A":0.722,"B":0.722,"C":0.722,"D":0.722,"E":0.667,"F":0.611,"G":0.778,"H":0.722,"I":0.278,"J":0.556,"K":0.722,"L":0.611,"M":0.833,"N":0.722,"O":0.778,"P":0.667,"Q":0.778,"R":0.722,"S":0.667,"T":0.611,"U":0.722,"V":0.667,"W":0.944,"X":0.667,"Y":0.667,"Z":0.611,"a":0.556,"b":0.611,"c":0.556,"d":0.611,"e":0.556,"f":0.333,"g":0.611,"h":0.611,"i":0.278,"j":0.278,"k":0.556,"l":0.278,"m":0.889,"n":0.611,"o":0.611,"p":0.611,"q":0.611,"r":0.389,"s":0.556,"t":0.333,"u":0.611,"v":0.556,"w":0.778,"x":0.556,"y":0.556,"z":0.5,"À":0.722,"Â":0.722,"Ä":0.722,"È":0.667,"É":0.667,"Ê":0.667,"Ë":0.667,"Î":0.278,"Ï":0.278,"Ô":0.778,"Ö":0.778,"Û":0.722,"Ü":0.722,"à":0.556,"â":0.556,"ä":0.556,"ç":0.556,"è":0.556,"é":0.556,"ê":0.556,"ë":0.556,"î":0.278,"ï":0.278,"ô":0.611,"ö":0.611,"û":0.611,"ü":0.611,"’":0.278};
  const A_DIN = {" ":0.24,"'":0.24,"-":0.407,".":0.24,"/":0.333,"0":0.48,"1":0.337,"2":0.48,"3":0.48,"4":0.48,"5":0.48,"6":0.484,"7":0.48,"8":0.48,"9":0.494,"A":0.623,"B":0.61,"C":0.556,"D":0.63,"E":0.556,"F":0.537,"G":0.61,"H":0.648,"I":0.258,"J":0.481,"K":0.63,"L":0.556,"M":0.758,"N":0.684,"O":0.61,"P":0.593,"Q":0.61,"R":0.61,"S":0.574,"T":0.5,"U":0.63,"V":0.556,"W":0.832,"X":0.536,"Y":0.5,"Z":0.519,"À":0.623,"Â":0.586,"Ä":0.611,"È":0.556,"É":0.556,"Ê":0.556,"Ë":0.556,"Î":0.258,"Ï":0.258,"Ô":0.61,"Ö":0.61,"Û":0.63,"Ü":0.63};
  const A_ENG = {" ":0.175,"'":0.171,"-":0.351,".":0.175,"/":0.298,"0":0.409,"1":0.293,"2":0.397,"3":0.399,"4":0.427,"5":0.406,"6":0.4,"7":0.381,"8":0.41,"9":0.4,"A":0.485,"B":0.456,"C":0.468,"D":0.463,"E":0.375,"F":0.371,"G":0.468,"H":0.46,"I":0.214,"J":0.266,"K":0.46,"L":0.367,"M":0.571,"N":0.474,"O":0.468,"P":0.434,"Q":0.468,"R":0.46,"S":0.426,"T":0.369,"U":0.46,"V":0.449,"W":0.674,"X":0.415,"Y":0.415,"Z":0.359,"Â":0.485,"Ä":0.485,"È":0.375,"É":0.375,"Ê":0.375,"Ë":0.375,"Î":0.214,"Ï":0.214,"Ô":0.468,"Ö":0.468,"Û":0.46,"Ü":0.46};
  const tw = (s, size, tab, ls = 0) => [...String(s)].reduce((a, c) => a + (tab[c] ?? 0.6) + ls, 0) * size;
  const up = (s) => String(s).toLocaleUpperCase('fr');
  const split2 = (s, f) => {   // two lines at a space or after a hyphen, the longer line as short as possible
    const cuts = []; for (let i = 1; i < s.length; i++) { if (s[i] === ' ') cuts.push([s.slice(0, i), s.slice(i + 1)]); if (s[i - 1] === '-' && i > 4 && s.length - i > 3) cuts.push([s.slice(0, i), s.slice(i)]); }
    let best = [s], bw = Infinity;
    for (const c of cuts) { const m = Math.max(f(c[0]), f(c[1])); if (m < bw) { bw = m; best = c; } }
    return best;
  };
  const lines = (s, f, maxW) => (f(s) <= maxW ? [s] : split2(s, f));
  const YEL = '#f7ec00', OCHRE = '#e9b52c', BLUE = '#1563c4', NAVY = '#1b2266', RED = '#e2231a';
  const blockArrow = (x, y, dir, s, fill) => {   // a fat filled arrow, pointing up by default, centred on (x,y), 100 units tall at s = 1
    const r = { up: 0, right: 90, left: -90 }[dir];
    return `<g transform="translate(${x},${y}) rotate(${r}) scale(${s})" fill="${fill}"><path d="M-20,77 L-20,-6 L-50,-6 L0,-77 L50,-6 L20,-6 L20,77 Z"/></g>`;
  };

  // yellow town entry: capitals for the official name, the Luxembourgish name (alt) in bold italic below
  const entree = ({ name, alt }) => {
    const s = 44 / 0.688, N = up(name), fN = (x) => tw(x, s, A_ARI), L = lines(N, fN, 900), fa = (x) => tw(x, s, A_ARI);
    const lw = Math.max(...L.map(fN), alt ? fa(alt) : 0), W = Math.round(Math.max(640, lw + 240)), pitch = 70;
    const nL = L.length + (alt ? 1 : 0), H = 227 + Math.max(0, nL - 2) * pitch, top = H / 2 - ((nL - 1) * pitch) / 2 + 22;
    return svg(W, H, `<rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="${YEL}" stroke="#1d1d1b" stroke-width="16"/>` +
      L.map((l, i) => T(W / 2, top + i * pitch, l, s, ARI, { fill: '#1d1d1b', weight: 'bold', maxw: lw + 1, max: s })).join('') +
      (alt ? T(W / 2, top + L.length * pitch, alt, s, ARI, { fill: '#1d1d1b', weight: 'bold', style: 'italic', maxw: lw + 1, max: s }) : ''));
  };
  // yellow town exit: the next town with an arrow, the town left behind struck through in red
  const sortie = ({ name, next }) => {
    const s = 44 / 0.688, N = up(name), X = up(next), f = (x) => tw(x, s, A_ARI), lw = Math.max(f(N), f(X)), W = Math.round(Math.max(640, lw + 260)), H = 227, cx = 160 + (W - 160) / 2 - 10;
    return svg(W, H, `<rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="${YEL}" stroke="#1d1d1b" stroke-width="16"/>` +
      blockArrow(80, 114, 'up', 1.0, '#1d1d1b') +
      T(cx, 100, X, s, ARI, { fill: '#1d1d1b', weight: 'bold', maxw: lw + 1, max: s }) +
      `<path d="M${cx - f(N) / 2 - 14},${178} L${cx + f(N) / 2 + 14},${132}" stroke="${RED}" stroke-width="16"/>` +
      T(cx, 168, N, s, ARI, { fill: '#1d1d1b', weight: 'bold', maxw: lw + 1, max: s }));
  };
  // locality plate (lieu-dit): white with a black rounded rim, or navy with a white rim; the name in spaced bold italics
  const lieudit = ({ name }, blue) => {
    const s = 80 / 0.688, ls = 0.09, f = (x) => tw(x, s, A_ARI, ls), L = lines(name, f, 1100), lw = Math.max(...L.map(f)), pitch = 110;
    const W = Math.round(Math.max(560, lw + 150)), H = 240 + (L.length - 1) * pitch, y0 = H / 2 - ((L.length - 1) * pitch) / 2 + 40;
    return svg(W, H, (blue ? `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="26" fill="#f4f4f4" stroke="#bbb" stroke-width="3"/><rect x="26" y="34" width="${W - 52}" height="${H - 68}" rx="6" fill="${NAVY}"/><rect x="36" y="44" width="${W - 72}" height="${H - 88}" rx="4" fill="none" stroke="#fff" stroke-width="4"/>`
      : `<rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="18" fill="#fff" stroke="#1d1d1b" stroke-width="8"/>`) +
      L.map((l, i) => T(W / 2, y0 + i * pitch, l, s * (blue ? 0.82 : 1), ARI, { fill: blue ? '#fff' : '#1d1d1b', weight: 'bold', style: 'italic', ls, maxw: (blue ? lw * 0.82 : lw) + 1, max: s * (blue ? 0.82 : 1) })).join(''));
  };

  // an arrow-shaped direction plate pointing left or right, thin dark rim; rows of [text, distance]
  // GeoHints 165, measured: a thin dark rim at the edge; the point 0.66 of the plate's height long, the ochre field's own
  // point blunter, so a dark wedge about a fifth of the height long stands past it (TS.arrows.plate)
  const plate = (y, w, h, dir, fill) => TS.arrows.plate({ x: 2, y, w: w - 2, h, dir, tip: 0.66 * h, r: 0.05 * h, rTip: 0.03 * h, rNeck: 0.01 * h,
    fill, ink: '#2a2a2a', band: 0.035 * h, fieldTip: 1.0, rField: 0.03 * h }).svg;
  const box = (x, y, txt, h, ink, s) => { const w = tw(txt, s, A_DIN) + h * 0.4; return { w, svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${ink}" stroke-width="3.5"/>` + T(x + w / 2, y + h * 0.78, txt, s, DIN, { fill: ink }) }; };

  const lu = [
    { id: 'entree', kind: 'entry', label: 'Town entry (yellow)', needs: ['alt'], draw: entree },
    { id: 'sortie', kind: 'exit', label: 'Town exit (yellow)', draw: sortie },
    { id: 'lieu-dit', kind: 'hamlet', label: 'Locality plate (white)', draw: (o) => lieudit(o, false) },
    { id: 'lieu-dit-bleu', kind: 'hamlet', label: 'Locality plate (blue)', draw: (o) => lieudit(o, true) },

    // yellow direction plates: distance before the name when pointing left, after it when pointing right; the route
    // number in a black frame
    { id: 'direction', kind: 'direction', label: 'Direction plates (yellow)', defaults: { road: '339' }, draw: ({ name, next, km, road }) => {
      const s = 50 / 0.711, ls = 0.08, f = (x) => tw(x, s, A_DIN, ls), N = up(name), X = next ? up(next) : null, rb = box(0, 0, road, 46, '#2a2a2a', 34 / 0.711);
      const d1 = String(km), d2 = String(km + 6), w1 = tw(d1, s, A_DIN) + 30 + f(N), w2 = X ? f(X) + 30 + tw(d2, s, A_DIN) : 0;
      const W = Math.round(Math.max(600, w1 + rb.w + 150, w2 + 150)), h = 110, gap = 12, H = X ? 2 * h + gap + 6 : h + 6;
      let out = plate(3, W - 3, h, 'left', OCHRE) + T(70, 3 + h / 2 + 25, d1, s, DIN, { anchor: 'start', fill: '#222' }) +
        T(70 + tw(d1, s, A_DIN) + 30, 3 + h / 2 + 25, N, s, DIN, { anchor: 'start', fill: '#222', ls, maxw: f(N) + 1, max: s }) + box(W - 30 - rb.w, 3 + h / 2 - 23, road, 46, '#2a2a2a', 34 / 0.711).svg;
      if (X) out += plate(3 + h + gap, W - 3, h, 'right', OCHRE) + T(40, 3 + h + gap + h / 2 + 25, X, s, DIN, { anchor: 'start', fill: '#222', ls, maxw: f(X) + 1, max: s }) +
        T(W - 3 - 0.66 * h - 8, 3 + h + gap + h / 2 + 25, d2, s, DIN, { anchor: 'end', fill: '#222' });
      return svg(W, H, out);
    } },
    // blue direction panels towards the motorway: white rim, narrow white capitals, arrow, motorway number in a frame
    // direction-signs 166: each panel lists several towns of that way (PÉTANGE / DIFFERDANGE / EHLERANGE) beside one arrow
    // and one motorway number, both centred on the list. with: the other towns of the name's panel (array or 'A|B'; the
    // first goes above the name, the rest below, as Differdange sits in the middle on the photo); with2: the towns after
    // next on its panel. The quiz has neither, so its panels carry one town each.
    { id: 'autoroute', kind: 'motorway', label: 'Direction panels to motorway (blue)', defaults: { road: 'A13' }, draw: ({ name, next, road, with: w1, with2 }) => {
      const list = (v) => (Array.isArray(v) ? v : v ? String(v).split('|') : []).map((t) => up(t.trim())).filter(Boolean);
      const W1 = list(w1), N = up(name), X = next ? up(next) : null;
      const L1 = W1.length ? [W1[0], N, ...W1.slice(1)] : [N], L2 = X ? [X, ...list(with2)] : null;
      const many = L1.length > 1 || (L2 && L2.length > 1), cap = many ? 46 : 58, s = cap / 0.69, ls = 0.06, f = (x) => tw(x, s, A_ENG, ls);
      const pitch = cap * 1.67, mg = cap * 0.67, hOf = (L) => (L.length > 1 ? Math.round(2 * mg + cap + (L.length - 1) * pitch) : 150);
      const rb = box(0, 0, road, 60, '#fff', 46 / 0.711), lw = Math.max(...L1.map(f), ...(L2 || []).map(f)), W = Math.round(Math.max(560, lw + rb.w + 220));
      const lines = (x, y, h, L) => L.map((t, i) => T(x, L.length > 1 ? y + mg + cap + i * pitch : y + h / 2 + 20, t, s, ENG, { anchor: 'start', fill: '#fff', weight: 'bold', ls, maxw: f(t) + 1, max: s })).join('');
      const panel = (y, L, dir, rd) => { const h = hOf(L);
        return `<rect x="3" y="${y}" width="${W - 6}" height="${h}" rx="10" fill="${BLUE}" stroke="#e8e8e8" stroke-width="5"/>` +
        (dir === 'up' ? blockArrow(56, y + h / 2, 'up', 0.62, '#fff') + lines(110, y, h, L) + box(W - 36 - rd.w, y + h / 2 - 30, road, 60, '#fff', 46 / 0.711).svg
          : box(30, y + h / 2 - 30, 'A4', 60, '#fff', 46 / 0.711).svg + lines(30 + box(0, 0, 'A4', 60, '#fff', 46 / 0.711).w + 30, y, h, L) + blockArrow(W - 70, y + h / 2, 'right', 0.62, '#fff')); };
      const h1 = hOf(L1), h2 = L2 ? hOf(L2) : 0;
      return svg(W, L2 ? h1 + h2 + 22 : h1 + 8, panel(4, L1, 'up', rb) + (L2 ? panel(h1 + 18, L2, 'right') : ''));
    } },
  ];

  TS.add('LU', lu, { next: 'Howald', km: 2, road: '339' });
})();
