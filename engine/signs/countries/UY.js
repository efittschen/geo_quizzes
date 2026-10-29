// UY: Uruguayan signs carrying a place name, after the GeoHints pictures (see examples/UY.json).
// Town entry: blue board with the white urban-zone pictogram panel (house, walkers, bicycle) and the name in mixed case;
// green direction signs (roundabout diagram, arrow table); Highway Gothic look.
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
  const UY_B = '#1d4e9a', UY_G = '#0b6145', UY_O = '#d9541e', LT = '#eef2f4', INK = '#1e2326';
  const plate = (x, y, W, H, fill, k = 1) => `<rect x="${x + 1.5}" y="${y + 1.5}" width="${W - 3}" height="${H - 3}" rx="${7 * k}" fill="${fill}" stroke="#8b979c" stroke-width="1.5"/><rect x="${x + 6 * k}" y="${y + 6 * k}" width="${W - 12 * k}" height="${H - 12 * k}" rx="${4 * k}" fill="none" stroke="${LT}" stroke-width="${3 * k}"/>`;
  // the urban-zone pictogram of the picture, in a 173 x 260 panel: house, boundary arc, adult and child walking, bicycle
  const picto = (x, y, k) => `<g transform="translate(${x},${y}) scale(${k})"><rect x="0" y="0" width="173" height="260" rx="3" fill="#e4e6e3"/>` +
    `<g fill="${INK}"><path d="M47,22 L80,103 L72,103 L72,156 L58,156 L58,128 L39,128 L39,156 L25,156 L25,103 L17,103 Z"/><rect x="41" y="80" width="13" height="14" fill="#e4e6e3"/>` +
    `<circle cx="112" cy="98" r="7"/><path d="M107,107 L118,107 L125,128 L134,136 L131,140 L121,133 L119,142 L127,160 L120,162 L112,146 L106,162 L99,160 L106,140 L104,124 L98,134 L93,131 L101,115 Z"/><path d="M119,110 L126,111 L128,126 L122,124 Z"/>` +
    `<circle cx="150" cy="116" r="5.5"/><path d="M146,123 L155,123 L159,139 L163,145 L160,147 L155,141 L155,147 L160,160 L155,161 L150,151 L146,161 L141,160 L145,147 L144,136 L140,142 L137,140 L143,129 Z"/></g>` +
    `<path d="M72,44 C98,86 100,170 26,234" fill="none" stroke="${INK}" stroke-width="2.6"/>` +
    `<g fill="none" stroke="${INK}" stroke-width="3"><circle cx="88" cy="220" r="19"/><circle cx="142" cy="220" r="19"/><path d="M88,220 L104,192 L132,192 L142,220 M104,192 L116,220 L132,192 M116,220 L88,220 M101,186 L111,186 M128,186 L132,192 M126,184 L136,184"/></g></g>`;
  const uy = [
    { id: 'localidad', kind: 'entry', label: 'Town entry board with pictogram (blue)', draw: ({ name }) => {
      const cap = 80, size = cap / CAP, x0 = 240, H = 300, s = clean(name), a = layout(s, 'E', 700, size, { max2: size * 0.78, min1: size * 0.9 });
      const W = Math.round(Math.max(600, x0 + Math.max(...a.lines.map((l) => tw(l, 'E') * a.size)) + 55));
      return svg(W, H, `<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="6" fill="${UY_B}" stroke="#7d8a99" stroke-width="1.5"/>` + picto(20, 20, 1) +
        block(a.lines, a.size, x0, H / 2, HG('E'), { anchor: 'start', fill: LT, maxw: W - x0 - 55, gap: 1.3 }));
    } },
    // roundabout diagram: next straight across at the top, the name off the right exit; the entry from below
    { id: 'rotonda', kind: 'direction', label: 'Roundabout diagram sign (green)', draw: ({ name, next }) => {
      const cap = 34, size = cap / CAP, a = layout(clean(name), 'EM', 300, size, { max2: size * 0.85 }), b = clean(next), H = 640;
      const aw = Math.max(...a.lines.map((l) => tw(l, 'EM') * a.size)), cx = 245, cy = 360;
      const W = Math.round(Math.max(520, cx + 75 + aw + 40, tw(b, 'EM') * size + 80));
      const ring = `<g fill="none" stroke="${LT}" stroke-width="22"><circle cx="${cx}" cy="${cy}" r="68"/><path d="M${cx},${cy - 80} L${cx},${200}"/>` +
        `<path d="M${cx + 52},${cy + 50} C${cx + 30},${cy + 110} ${cx - 10},${cy + 160} ${cx - 10},${H - 40}"/><path d="M${cx + 66},${cy + 22} C${cx + 90},${cy + 10} ${cx + 110},${cy - 2} ${cx + 130},${cy - 10}"/></g>` +
        `<circle cx="${cx}" cy="${cy}" r="52" fill="${UY_O}"/><rect x="${cx - 54}" y="${cy - 7}" width="108" height="14" fill="${UY_G}"/>` +
        harrow(cx, 190, 0, 58, LT, { len: 0.5, shaft: 0.01, head: 0.5 }) + harrow(cx + 142, cy - 15, 68, 58, LT, { len: 0.5, shaft: 0.01, head: 0.5 });
      return svg(W, H, plate(0, 0, W, H, UY_G) + ring + T(W / 2 > cx + 60 ? cx : W / 2, 102, b, size, HG('EM'), { fill: LT, maxw: W - 60, max: size }) +
        block(a.lines, a.size, cx + 75, cy + 105, HG('EM'), { anchor: 'start', fill: LT, maxw: W - cx - 75 - 30, gap: 1.35 }));
    } },
    // arrow table: arrows in a left column, one destination per row
    { id: 'tabla', kind: 'direction', label: 'Direction table, arrow column (green)', draw: ({ name, next }) => {
      const cap = 38, size = cap / CAP, rh = 110, cw = 84;
      const r = (s) => (tw(s, 'C') * size <= 620 ? { L: [s], size } : { L: split(s, 2, 'C'), size: size * 0.85 });
      const ra = r(clean(name).toUpperCase()), rb = r(clean(next).toUpperCase()), w = (x) => Math.max(...x.L.map((l) => tw(l, 'C') * x.size));
      const W = Math.round(Math.max(413, cw + 25 + Math.max(w(ra), w(rb)) + 36)), h1 = rh + (ra.L.length - 1) * 52, h2 = rh + (rb.L.length - 1) * 52;
      return svg(W, h1 + h2, plate(0, 0, W, h1 + h2, UY_G) + `<path d="M6,${h1} L${W - 6},${h1} M${cw},6 L${cw},${h1 + h2 - 6}" stroke="${LT}" stroke-width="3"/>` +
        harrow(cw / 2 + 2, h1 / 2, -90, 34, LT, { len: 1.5, shaft: 0.28, head: 0.55 }) + harrow(cw / 2 + 2, h1 + h2 / 2, 90, 34, LT, { len: 1.5, shaft: 0.28, head: 0.55 }) +
        block(ra.L, ra.size, cw + 25, h1 / 2, HG('C'), { anchor: 'start', fill: LT, maxw: W - cw - 25 - 30, gap: 1.35 }) + block(rb.L, rb.size, cw + 25, h1 + h2 / 2, HG('C'), { anchor: 'start', fill: LT, maxw: W - cw - 25 - 30, gap: 1.35 }));
    } },
  ];
  TS.add('UY', uy, { next: 'Montevideo', km: 8 });
})();
