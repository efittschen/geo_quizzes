// CL: Chilean signs carrying a place name, after the GeoHints pictures (see examples/CL.json).
// Town boards green with white capitals; direction signs green, motorway (autopista) signs blue, both in mixed case with
// accents (Copiapó, Curicó); Highway Gothic look (narrow capitals on town boards, Series E(M) on direction signs).
(function () {
  const { T, svg } = TS;
  // ---- Highway Gothic kit (same block in each file of this batch: MX GT AR CL CO PE EC BO UY AU NZ) ----
  // advance widths (1/1000 em) of the RG2014 fonts (Roadgeek 2014 = FHWA Series B, C, D, E, E(M)), so a name is laid out
  // (lines, sign width) before TS.fitDOM sizes it in the real font; other letters count as their base letter
  const RGC = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,-'/&()";
  const RGW = Object.fromEntries(Object.entries({"B":"146,343,338,336,355,311,299,336,373,198,335,347,299,409,373,355,327,351,338,303,251,373,301,397,325,342,303,267,285,242,285,252,162,283,288,166,180,288,129,420,288,267,285,285,207,214,170,289,271,340,262,286,241,354,207,302,290,356,320,308,320,302,320,176,176,214,176,405,442,245,245","C":"245,399,418,422,435,388,371,422,447,206,371,418,371,503,447,438,435,438,418,387,325,447,387,468,369,399,383,343,377,334,377,346,211,379,386,185,216,374,181,577,386,357,377,377,251,282,218,386,357,560,371,378,273,403,233,387,387,422,387,422,387,387,387,138,138,235,138,419,549,248,249","D":"342,518,486,503,514,451,440,503,526,229,451,495,440,582,526,519,474,519,486,446,387,526,468,542,446,522,446,406,437,390,434,396,240,435,445,211,246,437,207,674,445,415,437,434,286,306,239,443,426,667,445,447,321,519,270,503,546,507,503,503,467,503,503,148,150,235,150,422,567,271,270","E":"342,629,575,577,589,541,524,577,610,250,532,565,524,684,610,594,554,593,575,541,475,610,578,651,575,629,529,425,437,404,438,411,251,440,449,207,226,405,206,688,450,434,441,440,326,389,276,448,428,568,417,462,397,627,303,541,541,617,541,575,543,541,541,154,151,235,151,435,573,271,270","EM":"495,622,585,562,596,543,543,575,619,274,536,561,514,691,619,592,562,592,579,588,469,619,569,650,577,622,539,554,552,502,554,502,360,554,603,342,335,552,342,853,603,514,552,554,421,488,415,603,541,682,581,581,525,590,321,588,547,629,588,574,553,575,575,159,159,234,159,443,626,298,298"}).map(([k, v]) => [k, Object.fromEntries(v.split(",").map((w, i) => [RGC[i], +w]))]));
  const HG = (s) => `'RG2014 Series ${s}',sans-serif`;
  const CAP = 0.5714;   // cap height of the RG2014 fonts, in em
  const tw = (s, ser, ls = 0) => [...String(s)].reduce((a, ch) => a + (RGW[ser][ch] ?? RGW[ser][ch.normalize("NFD")[0]] ?? 560) / 1000 + ls, 0);   // width in em
  const clean = (n) => String(n).replace(/\s*\(.*?\)\s*/g, " ").trim();   // "Guadalupe (Zacatecas)" -> "Guadalupe": the quiz's qualifier is not on signs
  const SMALL = /^(de|del|la|las|los|el|y|e|en|a|o|ki|al|sur|norte)$/i;
  const toks = (s) => s.split(/\s+/).flatMap((w) => w.split(/(?<=-)/));
  const join = (t) => t.reduce((a, w, i) => a + (i && !t[i - 1].endsWith("-") ? " " : "") + w, "");
  // the best break of a name into n lines: narrowest widest line; a line ending in a small word ("de") counts 15 % wider
  const split = (s, n, ser, ls = 0) => {
    const t = toks(s); if (n < 2 || t.length < 2) return [s];
    let best = null;
    const rec = (i, left, acc) => {
      if (left === 1) { const L = [...acc, join(t.slice(i))]; const sc = Math.max(...L.map((l, k) => tw(l, ser, ls) * (k < L.length - 1 && SMALL.test(l.split(" ").pop()) ? 1.15 : 1))); if (!best || sc < best.sc) best = { sc, L }; return; }
      for (let k = i + 1; k <= t.length - left + 1; k++) rec(k, left - 1, [...acc, join(t.slice(i, k))]);
    };
    rec(0, Math.min(n, t.length), []); return best.L;
  };
  // a name in a box maxw wide: one line up to size max; if that falls under min1, two (or up to `lines`) lines up to max2
  const layout = (s, ser, maxw, max, { lines = 2, max2 = max * 0.8, min1 = max * 0.72, ls = 0 } = {}) => {
    const one = Math.min(max, maxw / tw(s, ser, ls));
    if (one >= min1 || lines < 2 || toks(s).length < 2) return { lines: [s], size: one };
    let r; for (let n = 2; n <= Math.min(lines, toks(s).length); n++) { const L = split(s, n, ser, ls); r = { lines: L, size: Math.min(max2, maxw / Math.max(...L.map((l) => tw(l, ser, ls)))) }; if (r.size >= min1 * 0.85) break; }
    return r;
  };
  // an FHWA-style arrow (solid triangle head on a shaft), w = head width, pointing at angle deg (0 = up, 90 = right)
  const harrow = (x, y, deg, w, fill, { len = 1.45, shaft = 0.34, head = 0.55 } = {}) =>
    `<path transform="translate(${x},${y}) rotate(${deg}) scale(${w})" fill="${fill}" d="M0,${-len / 2} L0.5,${-len / 2 + head} L${shaft / 2},${-len / 2 + head} L${shaft / 2},${len / 2} L${-shaft / 2},${len / 2} L${-shaft / 2},${-len / 2 + head} L-0.5,${-len / 2 + head} Z"/>`;
  // lines of text centred on cx (or from x with anchor start), baselines spaced by gap x size, block centred on cy
  const block = (L, size, x, cy, font, o = {}) => { const gap = o.gap || 1.45, n = L.length, top = cy - ((n - 1) * gap * size) / 2 + (CAP * size) / 2;
    return L.map((l, i) => T(x, top + i * gap * size, l, size, font, { ...o, max: size })).join(""); };
  // ---- end of kit ----
  const CL_G = '#0b5c45', CL_B = '#1d4f9c', EM = HG('E');
  const W_ = (s, ser, size) => tw(s, ser) * size;
  // route shield (group D): the national route shield of shared/shields.js, white rim, field in the sign's colour
  const shield = (x, y, h, road, ink = '#fff', field = CL_G) => TS.shields.clRoute(x, y, h, road, { field, fg: ink, font: HG('D'), capEm: CAP });
  const panel = (x, y, w, h, fill, rx = 8) => `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="${rx}" fill="${fill}"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="${rx - 3}" fill="none" stroke="#fff" stroke-width="3.5"/>`;
  const cl = [
    // town board: capitals spaced wide, bolts top and bottom; longer board for a longer name, two lines past ~1150
    { id: 'localidad', kind: 'entry', label: 'Town name board (green)', draw: ({ name }) => {
      const cap = 100, size = cap / CAP, s = clean(name).toUpperCase(), ls = 0.06, m = 0.32 * cap;
      const one = tw(s, 'C', ls) * size, L = one + 2 * m > 1150 && toks(s).length > 1 ? split(s, 2, 'C', ls) : [s];
      const sz = L.length > 1 ? size * 0.8 : size, tW = Math.max(...L.map((l) => tw(l, 'C', ls) * sz));
      const W = Math.round(Math.max(5.2 * cap, tW + 2 * m)), H = Math.round(L.length > 1 ? 4.0 * cap : 2.6 * cap);
      const bolts = [0.17, 0.5, 0.83].flatMap((f) => [-1, 1].flatMap((d) => [0.33 * cap, H - 0.33 * cap].map((g) => `<circle cx="${(f * W + d * 7).toFixed(1)}" cy="${g.toFixed(1)}" r="2.6" fill="#d8dcdc"/>`))).join('');
      return svg(W, H, `<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="10" fill="${CL_G}" stroke="#8e9a96" stroke-width="1.5"/><rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="7" fill="none" stroke="#e9eeec" stroke-width="4"/>` + bolts +
        block(L, sz, W / 2, H / 2, HG('C'), { fill: '#e9eeec', ls, maxw: W - 2 * m, gap: 1.45 }));
    } },
    // direction sign: straight on (next) over a rule, the name with an arrow right, then the route shield with Al Sur
    { id: 'direccion', kind: 'direction', label: 'Direction sign with route shield (green)', draw: ({ name, next, road }) => {
      const cap = 46, size = cap / CAP, ra = layout(clean(next), 'E', 820, size, { max2: size * 0.85 }), rb = layout(clean(name), 'E', 820, size, { max2: size * 0.85 });
      const lw = (r) => Math.max(...r.lines.map((l) => W_(l, 'E', r.size)));
      const W = Math.round(Math.max(640, 140 + lw(ra) + 50, 140 + lw(rb) + 40 + 80 + 34, 200 + W_('Al Sur', 'E', size) + 160));
      const h1 = 150 + (ra.lines.length - 1) * 1.45 * ra.size * CAP, h2 = 128 + (rb.lines.length - 1) * 1.45 * rb.size * CAP, h3 = 146;
      return svg(W, h1 + h2 + h3 + 6, panel(0, 0, W, h1 + h2, CL_G) + `<line x1="6" y1="${h1}" x2="${W - 6}" y2="${h1}" stroke="#fff" stroke-width="3.5"/>` +
        harrow(76, h1 / 2, 0, 46, '#fff', { len: 1.7, shaft: 0.3, head: 0.6 }) + block(ra.lines, ra.size, 140, h1 / 2, EM, { anchor: 'start', fill: '#fff', maxw: W - 140 - 50 }) +
        block(rb.lines, rb.size, 140, h1 + h2 / 2, EM, { anchor: 'start', fill: '#fff', maxw: W - 140 - 40 - 80 - 34 }) + harrow(W - 34 - 40, h1 + h2 / 2, 90, 46, '#fff', { len: 1.7, shaft: 0.3, head: 0.6 }) +
        panel(0, h1 + h2 + 6, W, h3, CL_G) + shield(40, h1 + h2 + 6 + 24, 98, road) + T(200, h1 + h2 + 6 + h3 / 2 + cap / 2, 'Al Sur', size, EM, { anchor: 'start', fill: '#fff' }) +
        harrow(W - 34 - 40, h1 + h2 + 6 + h3 / 2, 45, 46, '#fff', { len: 1.7, shaft: 0.3, head: 0.6 }));
    } },
    // motorway advance exit sign (blue): straight-on destination at the top, the arrow with its branch, the exit's name, distance
    { id: 'autopista-salida', kind: 'motorway', label: 'Motorway exit advance sign (blue)', draw: ({ name, next }) => {
      const cap = 35, size = cap / CAP, a = layout(clean(name), 'EM', 640, size, { max2: size * 0.85 }), b = clean(next);
      const lw = Math.max(...a.lines.map((l) => W_(l, 'EM', a.size)));
      const W = Math.round(Math.max(520, 104 + lw + 36, 49 + W_(b, 'EM', size) + 36)), H = 604 + (a.lines.length - 1) * 60;
      const yN = 335 + (a.lines.length - 1) * 30;
      return svg(W, H, panel(0, 0, W, H, CL_B, 10) + T(49, 100, b, size, HG('EM'), { anchor: 'start', fill: '#fff', maxw: W - 49 - 36 }) +
        `<path d="M55,${H - 36} L55,150" stroke="#fff" stroke-width="17" fill="none"/><path d="M55,${H - 125} L150,${yN + 40}" stroke="#fff" stroke-width="15" fill="none"/>` +
        harrow(55, 150, 0, 54, '#fff', { len: 0.62, shaft: 0.01, head: 0.62 }) + harrow(158, yN + 30, 45, 50, '#fff', { len: 0.62, shaft: 0.01, head: 0.62 }) +
        block(a.lines, a.size, 104, yN - cap / 2 - (a.lines.length - 1) * 0.72 * a.size * CAP, HG('EM'), { anchor: 'start', fill: '#fff', maxw: W - 104 - 36 }) +
        T(135, H - 39, 'A 800 m', size, HG('EM'), { anchor: 'start', fill: '#fff' }));
    } },
    // motorway gantry: blue panel straight on (next) with lane arrows, green exit panel with the exit band and the name
    { id: 'autopista-portico', kind: 'motorway', label: 'Motorway gantry, exit panel (blue, green)', draw: ({ name, next }) => {
      const cap = 40, size = cap / CAP, H = 420, a = layout(clean(name), 'EM', 700, size, { max2: size * 0.85 }), b = layout(clean(next), 'EM', 900, size, { max2: size * 0.85 });
      const lw = (r) => Math.max(...r.lines.map((l) => W_(l, 'EM', r.size)));
      const Wb = Math.round(Math.max(700, lw(b) + 200)), Wg = Math.round(Math.max(480, lw(a) + 110)), x2 = Wb + 8;
      // exit pictogram (group D, shared/shields.js), centred at x in the exit band, nearly its full height
      const exitIcon = (x, y) => TS.shields.exit(x - TS.shields.exit.width(0.15 * H, 0.65) / 2, y, 0.15 * H, '#fff', { sx: 0.65 });
      return svg(Wb + 8 + Wg, H, panel(0, 0, Wb, H, CL_B) + block(b.lines, b.size, Wb / 2, 0.31 * H, HG('EM'), { fill: '#fff', maxw: Wb - 80 }) +
        `<line x1="6" y1="${0.625 * H}" x2="${Wb - 6}" y2="${0.625 * H}" stroke="#fff" stroke-width="3.5"/>` + harrow(0.14 * Wb, 0.8 * H, 180, 50, '#fff', { len: 1.1, shaft: 0.28, head: 0.5 }) + harrow(0.86 * Wb, 0.8 * H, 180, 50, '#fff', { len: 1.1, shaft: 0.28, head: 0.5 }) +
        panel(x2, 0, Wg, H, CL_G) + `<line x1="${x2 + 6}" y1="${0.21 * H}" x2="${x2 + Wg - 6}" y2="${0.21 * H}" stroke="#fff" stroke-width="3.5"/>` + exitIcon(x2 + Wg * 0.7, 0.03 * H) +
        block(a.lines, a.size, x2 + Wg / 2, 0.52 * H, HG('EM'), { fill: '#fff', maxw: Wg - 70 }) + harrow(x2 + Wg * 0.5, 0.83 * H, 45, 36, '#fff', { len: 1.2, shaft: 0.3, head: 0.55 }));
    } },
    // (group H) distance sign (Commons: Curarrehue 82 / Pucón 44 / Villarrica 18): one green panel, mixed case lightly
    // spaced, the distances right-aligned without a unit, the farthest on top. With next, the sign stands a made-up 8 km
    // before next, so the name reads km + 8 (the real distance between the two)
    { id: 'distancia', kind: 'direction', label: 'Distance sign (green)', draw: ({ name, next, km }) => {
      const cap = 44, size = cap / CAP, ls = 0.05, pitch = 1.62 * cap, m = 36;
      const rows = (next ? [[clean(name), +km + 8], [clean(next), 8]] : [[clean(name), +km]]).map(([s, d]) => [s, String(d)]);
      const dw = Math.max(...rows.map(([, d]) => tw(d, 'D') * size)), nw = Math.min(900, Math.max(...rows.map(([s]) => tw(s, 'D', ls) * size)));
      const W = Math.round(Math.max(460, m + nw + 50 + dw + m)), H = Math.round(rows.length * pitch + 0.9 * cap);
      return svg(W, H, panel(0, 0, W, H, CL_G) + rows.map(([s, d], i) => { const y = 0.45 * cap + (i + 1) * pitch - (pitch - cap) / 2;
        return T(m, y, s, size, HG('D'), { anchor: 'start', fill: '#fff', ls, maxw: W - 2 * m - 50 - dw, max: size }) + T(W - m, y, d, size, HG('D'), { anchor: 'end', fill: '#fff', maxw: dw + 2, max: size }); }).join(''));
    } },
    // (group H) arrow direction sign (Commons: COPIAPO straight on over OJOS DEL SALADO to the left; SAN FELIPE / MENDOZA):
    // two green panels, each with an arrow at the left and a destination in spaced capitals; next straight on, the name left
    { id: 'flechas', kind: 'direction', label: 'Arrow direction sign (green)', draw: ({ name, next }) => {
      const cap = 40, size = cap / CAP, ls = 0.1, ph = 120, gap = 8;
      const ra = layout(clean(next).toUpperCase(), 'D', 760, size, { ls, max2: size * 0.85 }), rb = layout(clean(name).toUpperCase(), 'D', 760, size, { ls, max2: size * 0.85 });
      const lw = (r) => Math.max(...r.lines.map((l) => tw(l, 'D', ls) * r.size)), W = Math.round(Math.max(560, 128 + Math.max(lw(ra), lw(rb)) + 40));
      const h1 = ph + (ra.lines.length - 1) * 1.4 * ra.size * CAP, h2 = ph + (rb.lines.length - 1) * 1.4 * rb.size * CAP;
      return svg(W, Math.round(h1 + gap + h2), panel(0, 0, W, h1, CL_G) + harrow(64, h1 / 2, 0, 48, '#fff', { len: 1.3, shaft: 0.36, head: 0.55 }) +
        block(ra.lines, ra.size, (W + 128 - 40) / 2, h1 / 2, HG('D'), { fill: '#fff', ls, maxw: W - 128 - 40, gap: 1.4 }) +
        panel(0, h1 + gap, W, h2, CL_G) + harrow(64, h1 + gap + h2 / 2, -90, 48, '#fff', { len: 1.3, shaft: 0.36, head: 0.55 }) +
        block(rb.lines, rb.size, 128, h1 + gap + h2 / 2, HG('D'), { anchor: 'start', fill: '#fff', ls, maxw: W - 128 - 40, gap: 1.4 }));
    } },
  ];
  TS.add('CL', cl, { next: 'Temuco', km: 12, road: '5' });
})();
