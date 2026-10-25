// GR: Greek signs carrying a place name, drawn after the GeoHints pictures (see examples/GR.json for which).
// Place names are in Greek (name) and Latin (alt); without alt the Latin form is computed by ELOT 743 (helper elot below).
(function () {
  const { T, svg } = TS;
  // DIN-style lettering with Greek: Sofia Sans (cap height 0.655 em; mean widths: Greek lower 0.51, Latin lower 0.445, capitals 0.52)
  const F = "'Sofia Sans','Noto Sans',sans-serif", CAP = 0.655, WG = 0.51, WL = 0.445, WU = 0.52;
  const BLUE = '#0065cc', ABLUE = '#035598', GREEN = '#2e946d', YEL = '#ffd400', ORANGE = '#f6a21a', RED = '#e3161b', BAND = '#174fbb';
  const len = (s) => [...String(s)].length;
  // ELOT 743 romanisation (as on Greek signs): αυ/ευ/ηυ -> av/ev/iv before vowels and voiced consonants, af/ef/if otherwise;
  // ου -> ou; μπ -> b at word start and end, mp inside; γγ γξ γχ -> ng nx nch; θ th, χ ch, ψ ps, η/ι/υ i/i/y; accents dropped
  const GRL = { α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o' };
  const elot = (s) => String(s).split(/(\s+|-)/).map((w) => {
    const u = [];
    for (const c of w.normalize('NFD')) {
      if (c === '̈') { if (u.length) u[u.length - 1].dia = true; continue; }
      if (/[̀-ͯ]/.test(c)) continue;
      const lo = c.toLowerCase(); u.push({ ch: lo, up: c !== lo, dia: false });
    }
    const allUp = u.length > 1 && u.every((x) => x.up || !GRL[x.ch]);
    let out = '';
    for (let i = 0; i < u.length; i++) {
      const c = u[i].ch, up = u[i].up, n = u[i + 1], n2 = u[i + 2];
      let r;
      if ('αεη'.includes(c) && n && n.ch === 'υ' && !n.dia) { r = GRL[c] + (n2 && /[βγδζλμνραεηιουω]/.test(n2.ch) ? 'v' : 'f'); i++; }
      else if (c === 'ο' && n && n.ch === 'υ' && !n.dia) { r = 'ou'; i++; }
      else if (c === 'μ' && n && n.ch === 'π' && (i === 0 || i + 2 >= u.length)) { r = 'b'; i++; }
      else if (c === 'γ' && n && 'γξχ'.includes(n.ch)) r = 'n';
      else r = GRL[c] ?? c;
      out += up ? (allUp ? r.toUpperCase() : r[0].toUpperCase() + r.slice(1)) : r;
    }
    return out;
  }).join('');
  const lat = (name, alt) => alt || elot(name);
  // best cut of a name into two lines at a space or after a hyphen
  const split2 = (s) => {
    const cuts = [];
    for (let i = 1; i < s.length; i++) { if (s[i] === ' ') cuts.push([s.slice(0, i), s.slice(i + 1)]); else if (s[i - 1] === '-') cuts.push([s.slice(0, i), s.slice(i)]); }
    return cuts.length ? cuts.reduce((b, c) => (Math.max(len(c[0]), len(c[1])) < Math.max(len(b[0]), len(b[1])) ? c : b)) : [s];
  };
  // size for a line of n letters (mean width w em) to fill maxw, capped at the size for cap height `cap`
  const sz = (s, maxw, cap, w) => Math.min(cap / CAP, maxw / (len(s) * w * 1.03));
  const line = (x, y, s, cap, w, maxw, fill, anchor = 'start', weight = 600) => { const z = sz(s, maxw, cap, w); return T(x, y, s, z, F, { fill, anchor, weight, maxw, max: z }); };
  // plate width that holds a text at its full size (between min and max)
  const widthFor = (texts, cap, pad, min, max) => Math.round(Math.min(max, Math.max(min, Math.max(...texts.map(([s, w]) => len(s) * w * 1.03 * cap / CAP)) + pad)));
  // pointed arrow ("pencil" tip) from its foot along deg (-90 = up), length L, shaft width w
  const pencil = (x, y, L, w, deg) => `<path transform="translate(${x},${y}) rotate(${deg + 90})" d="M${-w / 2},0 L${-w / 2},${-L + w * 0.62} L${-w * 0.14},${-L} L${w * 0.14},${-L} L${w / 2},${-L + w * 0.62} L${w / 2},0 Z" fill="#fff"/>`;
  const head = (x, y, deg, w, fill = '#fff') => `<path transform="translate(${x},${y}) rotate(${deg})" d="M0,0 L${-w * 1.9},${-w} L${-w * 1.9},${w} Z" fill="${fill}"/>`;
  // route plates: motorway (rectangle with a hexagonal inner line), E road (rectangle with an inner line)
  const aPlate = (x, y, w, h, label) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="none" stroke="#fff" stroke-width="3"/>` +
    `<path d="M${x + 5},${y + h * 0.32} L${x + w * 0.16},${y + 6} L${x + w * 0.84},${y + 6} L${x + w - 5},${y + h * 0.32} L${x + w - 5},${y + h * 0.68} L${x + w * 0.84},${y + h - 6} L${x + w * 0.16},${y + h - 6} L${x + 5},${y + h * 0.68} Z" fill="none" stroke="#fff" stroke-width="2.5"/>` +
    T(x + w / 2, y + h * 0.76, label, h * 0.56 / CAP, F, { fill: '#fff', weight: 500, maxw: w * 0.7, max: h * 0.56 / CAP });
  const ePlate = (x, y, w, h, label) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="none" stroke="#fff" stroke-width="3"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" fill="none" stroke="#fff" stroke-width="2"/>` +
    T(x + w / 2, y + h * 0.76, label, h * 0.56 / CAP, F, { fill: '#fff', weight: 500, maxw: w * 0.78, max: h * 0.56 / CAP });
  // the white town plate with blue bands, Greek over Latin
  const plate = ({ name, alt }, exit) => {
    const L = lat(name, alt), H = 402, W = widthFor([[name, WG], [L, WL]], 66, 80, 640, 980);
    const bar = exit ? `<path d="M-10,${H - 30} L${W - 26},-10 L${W + 10},18 L26,${H + 10} Z" fill="${RED}" clip-path="url(#gr-c)"/>` : '';
    return svg(W, H, `<clipPath id="gr-c"><rect width="${W}" height="${H}" rx="46"/></clipPath><g clip-path="url(#gr-c)"><rect width="${W}" height="${H}" fill="#fff"/><rect width="${W}" height="70" fill="${BAND}"/><rect y="330" width="${W}" height="72" fill="${BAND}"/></g>` +
      line(W / 2, 174, name, 66, WG, W - 80, '#000', 'middle', 680) + line(W / 2, 282, L, 66, WL, W - 80, '#000', 'middle', 680) + bar);
  };

  const gr = [
    { id: 'entry', kind: 'entry', label: 'Town entry', draw: (o) => plate(o, false) },
    { id: 'exit', kind: 'exit', label: 'Town exit', draw: (o) => plate(o, true) },
    { id: 'arrow', kind: 'direction', label: 'Direction arrow (blue)', draw: ({ name, alt, km }) => {
      // GeoHints 141: a thin white rim round the whole plate, point included (square corners; the 1-px edge line of
      // TS.frames keeps it visible on white); in the point a broad white chevron parallel to its edges, a strip of blue
      // between them, its ends cut level and set off from the rim by a blue line as wide as that strip (TS.arrows)
      const L = lat(name, alt), H = 240, W = widthFor([[name, WG], [L, WL]], 46, 34 + 250, 640, 980), tx = W - 250;
      const x0 = 1, y0 = 1, h = H - 2, tip = 0.45 * h, rim = 6, gap = 10, thick = 32, mid = H / 2, k = tip / (h / 2), sk = Math.hypot(1, k), X = W - 1;
      const out = TS.arrows.pointed({ x: x0, y: y0, w: W - 2, h, dir: 'right', tip }).pts;
      const ex = (d, Y) => X - Math.abs(Y - mid) * k - d * sk;   // the point's edge moved in by d, at height Y
      const yt = y0 + rim + gap, yb = y0 + h - rim - gap, d1 = rim + gap, d2 = d1 + thick, od = TS.arrows.rounded(out, [1, 0.5, 1, 0.5, 1]);
      const chev = [[ex(d1, yt), yt], [ex(d1, mid), mid], [ex(d1, yb), yb], [ex(d2, yb), yb], [ex(d2, mid), mid], [ex(d2, yt), yt]];
      return svg(W, H, `<path d="${od}" fill="#fff"/>` + TS.frames.rim(W, H, 0, { d: od }) + `<path d="${TS.arrows.rounded(TS.arrows.offset(out, rim), [0.5, 0, 0.5, 0, 0.5])}" fill="${ABLUE}"/>` +
        `<path d="M${chev.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}Z" fill="#fff"/>` +
        line(34, 104, name, 46, WG, tx - 34, YEL) + line(34, 190, L, 46, WL, tx - 34, '#fff') + T(ex(d2, mid) - 0.35 * h, 146, String(km), 50 / CAP, F, { fill: '#fff', weight: 600 }));
    } },
    { id: 'motorway', kind: 'motorway', label: 'Motorway sign (green)', defaults: { road: 'A1', eroad: 'E 75' }, draw: ({ name, alt, next, road, eroad }) => {
      const W = 600, H = 430, rows = [[name, WG, ORANGE], [lat(name, alt), WL, '#fff'], [next, WG, ORANGE], [elot(next), WL, '#fff']];
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="${GREEN}" stroke="#fff" stroke-width="4"/>` +
        rows.map(([s, w, c], i) => line(W / 2, 76 + i * 60, s, 36, w, W - 70, c, 'middle')).join('') +
        `<path d="M74,410 L74,352" stroke="#fff" stroke-width="16"/>` + head(74, 318, -90, 22) + `<path d="M${W - 74},410 L${W - 74},352" stroke="#fff" stroke-width="16"/>` + head(W - 74, 318, -90, 22) +
        // route plates (group D, shared/shields.js): the motorway plate white with its hexagonal green field, the E road
        // as a single white rim
        TS.shields.hexPlate(184, 335, 112, 62, road, { kind: 'gr', field: GREEN, font: F, weight: 500, cap: 0.52, capEm: CAP }) +
        TS.shields.ePlate(316, 335, 112, 62, eroad, { field: GREEN, font: F, weight: 500, cap: 0.52, capEm: CAP, sw: 0.055, rx: 0.14 }));
    } },
    { id: 'motorway-latin', kind: 'motorway', label: 'Motorway sign, Latin only', defaults: { road: 'A2' }, draw: ({ name, alt, next, road }) => {
      const W = 400, H = 640, a = lat(name, alt).toUpperCase(), b = elot(next).toUpperCase();
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="${GREEN}" stroke="#fff" stroke-width="4"/>` +
        // the A plate from group D (white with its hexagonal green field, as GeoHints 138 shows it)
        TS.shields.hexPlate(30, 30, 76, 44, road, { kind: 'gr', field: GREEN, font: F, weight: 500, cap: 0.52, capEm: CAP }) + (len(a) > 12 ? split2(a) : [a]).map((l, i, ls) => { const z = Math.min(32 / CAP, (W - 144) / (Math.max(...ls.map(len)) * WU * 1.03)); return T(124, 70 + i * 44, l, z, F, { fill: '#fff', anchor: 'start', weight: 600, maxw: W - 144, max: z }); }).join('') +
        // GeoHints 138: the stem straight up to its head; the exit leaving the stem's foot, bending to about 40 degrees and
        // ending in its own head, both joined to the stem (TS.arrows)
        TS.arrows.group([{ pts: [[74, 604], [74, 100]] }, { pts: [[74, 590], [74, 538, 46], [162, 462]] }], { w: 11, fill: '#fff', head: { half: 2.1, back: 3.0, neck: 2.5 } }) +
        `<rect x="132" y="304" width="78" height="78" fill="#eee"/><path d="M171,316 L171,370 M144,343 L198,343" stroke="${RED}" stroke-width="16"/>` +
        line(184, 492, b, 32, WU, W - 204, '#fff'));
    } },
    { id: 'roundabout', kind: 'direction', label: 'Roundabout sign (blue)', defaults: { road: 'E75' }, draw: ({ name, alt, next, road }) => {
      const W = 560, H = 580, cx = 290, cy = 320;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="6" fill="#1f5fce" stroke="#fff" stroke-width="4"/>` +
        line(cx, 56, next, 30, WG, 360, ORANGE, 'middle') + line(cx, 96, elot(next), 30, WL, 360, '#fff', 'middle') +
        // GeoHints 140: the ring runs from the lower-left exit over the top round to the entry below (open between them);
        // exits up, left, right and down-left start on the ring and end in swept heads; the entry stem from below meets the
        // ring's inner edge (TS.arrows)
        (() => { const r = 30, w = 11, ri = r - w / 2, dx = -0.6, dy = 0.8;
          return `<path d="M${cx + dx * r},${cy + dy * r}A${r},${r} 0 1 1 ${cx},${cy + r}" fill="none" stroke="#fff" stroke-width="${w}"/>` +
            TS.arrows.group([{ pts: [[cx, cy - r], [cx, 120]] }, { pts: [[cx - r, cy], [cx - 108, cy]] },
              { pts: [[cx + r, cy], [cx + 120, cy]] }, { pts: [[cx + dx * ri, cy + dy * ri], [cx + dx * 122, cy + dy * 122]] },
              { pts: [[cx, 550], [cx, cy + ri]], head: null }], { w, fill: '#fff', head: { half: 2.1, back: 2.6, neck: 1.9 } }); })() +
        (() => { const L = lat(name, alt), rows = [...(len(name) > 9 ? split2(name) : [name]).map((t) => [t, WG, ORANGE]), ...(len(L) > 10 ? split2(L) : [L]).map((t) => [t, WL, '#fff'])];
          // the motorway pictogram and the E plate from group D (shared/shields.js)
          return `<rect x="18" y="236" width="150" height="${62 + rows.length * 28}" fill="${GREEN}"/>` + TS.shields.motorway(19, 235.5, 56, { style: 'ge', frame: false }) +
            TS.shields.ePlate(66, 246, 54, 32, road, { field: GREEN, font: F, weight: 500, cap: 0.52, capEm: CAP, sw: 0.055, rx: 0.14 }) +
            rows.map(([t, w, c], i) => line(28, 312 + i * 28, t, 20, w, 132, c)).join(''); })() +
        line(462, 266, 'Περιφερειακή Οδός', 18, WG, 170, ORANGE, 'middle') + line(462, 294, 'Ring Road', 18, WL, 170, '#fff', 'middle'));
    } },
    { id: 'advance-latin', kind: 'direction', label: 'Junction advance sign, Latin', draw: ({ name, alt, next, km }) => {
      const W = 640, H = 350, a = lat(name, alt), b = elot(next);
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${BLUE}"/><rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="8" fill="none" stroke="#fff" stroke-width="2.5"/>` +
        line(W / 2, 54, `${a} ${km}`, 34, WL, 600, '#fff', 'middle') + pencil(320, 290, 228, 30, -90) + `<path d="M320,143 L548,143 L566,152 L548,161 L320,161 Z" fill="#fff"/>` +
        line(626, 212, `${b}  ${km + 6}`, 34, WL, 290, '#fff', 'end') + T(332, 330, '400 M', 34 / CAP, F, { fill: '#fff', weight: 600 }));
    } },
    { id: 'advance-greek', kind: 'direction', label: 'Junction advance sign, Greek', draw: ({ name, next }) => {
      const W = 640, H = 546;
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${BLUE}"/><rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="8" fill="none" stroke="#fff" stroke-width="2.5"/>` +
        line(22, 72, name, 48, WG, 590, YEL) + pencil(42, 522, 444, 46, -90) + `<path d="M62,410 L62,372 L160,286 L180,286 L180,308 Z" fill="#fff"/>` +
        line(196, 332, next, 40, WG, 420, YEL) + T(95, 525, '200 μ', 34 / CAP, F, { fill: YEL, anchor: 'start', weight: 500 }));
    } },
  ];

  TS.add('GR', gr, { next: 'Λαμία', km: 12, road: 'A1' });
})();
