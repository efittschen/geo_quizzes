// BO: Bolivian signs carrying a place name, after the GeoHints pictures (see examples/BO.json).
// Green boards with white border line and white capitals in Highway Gothic: tall narrow capitals on the town board,
// spaced Series D on direction boards.
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
  const BO_G = '#06574a', LT = '#eef3f1';
  const plate = (x, y, W, H, k = 1) => `<rect x="${x + 1.5}" y="${y + 1.5}" width="${W - 3}" height="${H - 3}" rx="${8 * k}" fill="${BO_G}" stroke="#8a9a96" stroke-width="1.5"/><rect x="${x + 7 * k}" y="${y + 7 * k}" width="${W - 14 * k}" height="${H - 14 * k}" rx="${5 * k}" fill="none" stroke="${LT}" stroke-width="${3.5 * k}"/>`;
  const caps = (n) => clean(n).toUpperCase();
  const bo = [
    // town board: tall narrow capitals filling the board; longer board for a longer name, two lines past ~1150 units
    { id: 'localidad', kind: 'entry', label: 'Town name board (green)', draw: ({ name }) => {
      const cap = 110, size = cap / CAP, m = 0.55 * cap, s = caps(name);
      const L = tw(s, 'B') * size + 2 * m > 1150 && toks(s).length > 1 ? split(s, 2, 'B') : [s];
      const sz = L.length > 1 ? size * 0.75 : size, W = Math.round(Math.max(4.4 * cap, Math.max(...L.map((l) => tw(l, 'B') * sz)) + 2 * m));
      const H = Math.round(L.length > 1 ? 3.7 * cap : 2.1 * cap);
      return svg(W, H, plate(0, 0, W, H, 1.5) + block(L, sz, W / 2, H / 2, HG('B'), { fill: LT, maxw: W - 2 * m, gap: 1.2 }));
    } },
    // direction boards: name with the arrow right, next with the arrow left; spaced capitals
    { id: 'direccion', kind: 'direction', label: 'Direction boards (green)', draw: ({ name, next }) => {
      const cap = 49, size = cap / CAP, ls = 0.08, bh = 105, gap = 13, aw = 54;
      const r = (s) => (tw(s, 'D', ls) * size <= 760 ? { L: [s], size } : { L: split(s, 2, 'D', ls), size: size * 0.82 });
      const ra = r(caps(name)), rb = r(caps(next)), w = (x) => Math.max(...x.L.map((l) => tw(l, 'D', ls) * x.size));
      const W = Math.round(Math.max(445, 38 + w(ra) + 26 + aw + 26, 26 + aw + 24 + w(rb) + 24)), h1 = bh + (ra.L.length - 1) * 80, h2 = bh + (rb.L.length - 1) * 80;
      return svg(W, h1 + gap + h2, plate(0, 0, W, h1) + block(ra.L, ra.size, 38, h1 / 2, HG('D'), { anchor: 'start', fill: LT, ls, maxw: W - 38 - 26 - aw - 26, gap: 1.3 }) +
        harrow(W - 26 - aw / 2, h1 / 2, 90, 40, LT, { len: 1.3, shaft: 0.36, head: 0.5 }) +
        plate(0, h1 + gap, W, h2) + harrow(26 + aw / 2, h1 + gap + h2 / 2, -90, 40, LT, { len: 1.3, shaft: 0.36, head: 0.5 }) +
        block(rb.L, rb.size, 26 + aw + 24, h1 + gap + h2 / 2, HG('D'), { anchor: 'start', fill: LT, ls, maxw: W - 26 - aw - 24 - 24, gap: 1.3 }));
    } },
    // (group H) distance boards, one per destination (Commons: San Pedro de Tiquina, TIQUINA 39 / OJELAYA 5 / LA PAZ 112;
    // Coroico, COROICO YOLOSA 5): spaced capitals left, the distance right without a unit. With next, the sign stands a
    // made-up 8 km before next, so the name reads km + 8 (the real distance between the two) and stands on top
    { id: 'distancia', kind: 'direction', label: 'Distance boards (green)', draw: ({ name, next, km }) => {
      const cap = 44, size = cap / CAP, ls = 0.04, bh = 104, gap = 12;
      const rows = (next ? [[caps(name), +km + 8], [caps(next), 8]] : [[caps(name), +km]]).map(([s, d]) => [layout(s, 'D', 820, size, { ls, max2: size * 0.82 }), String(d)]);
      const dw = Math.max(...rows.map(([, d]) => tw(d, 'D') * size)), nw = Math.max(...rows.map(([r]) => Math.max(...r.lines.map((l) => tw(l, 'D', ls) * r.size))));
      const W = Math.round(Math.max(520, 40 + nw + 56 + dw + 34)), hs = rows.map(([r]) => bh + (r.lines.length - 1) * 1.3 * r.size * CAP);
      let y = 0, out = '';
      rows.forEach(([r, d], i) => { const h = hs[i];
        out += plate(0, y, W, h) + block(r.lines, r.size, 40, y + h / 2, HG('D'), { anchor: 'start', fill: LT, ls, maxw: W - 40 - 56 - dw - 34, gap: 1.3 }) +
          T(W - 34, y + h / 2 + cap / 2, d, size, HG('D'), { anchor: 'end', fill: LT, maxw: dw + 2, max: size });
        y += h + gap; });
      return svg(W, Math.round(y - gap), out);
    } },
  ];
  TS.add('BO', bo, { next: 'Santa Cruz', km: 9 });
})();
