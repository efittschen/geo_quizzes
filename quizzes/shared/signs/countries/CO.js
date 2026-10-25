// CO: Colombian signs carrying a place name, after the GeoHints pictures (see examples/CO.json).
// Green boards with white border line and white letters in mixed case with accents (Highway Gothic look: narrow Series C
// on the welcome board, spaced Series E(M) on the diagrammatic direction sign).
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
  const CO_G = '#0a5c47', LT = '#eef3f1';
  const plate = (W, H) => `<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="10" fill="${CO_G}" stroke="#8a9893" stroke-width="1.5"/><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="6" fill="none" stroke="${LT}" stroke-width="4"/>`;
  const co = [
    // welcome board: Bienvenidos / a / the name, centred; the name on one line if it fits the board, else two
    { id: 'bienvenidos', kind: 'entry', label: 'Welcome board (green)', draw: ({ name }) => {
      const cap = 60, size = cap / CAP, pitch = 1.62 * cap, m = 0.83 * cap, s = clean(name), room = 6.9 * cap - 2 * m;
      const L = tw(s, 'C') * size <= room || toks(s).length < 2 ? [s] : split(s, 2, 'C');
      const lines = ['Bienvenidos', 'a', ...L], W = Math.round(Math.max(6.9 * cap, ...lines.map((l) => tw(l, 'C') * size + 2 * m)));
      const top = 0.67 * cap + cap, H = Math.round(top + (lines.length - 1) * pitch + 1.2 * cap);
      // square corners, the white line close to the edge (city-signs 172)
      return svg(W, H, TS.frames.plate(W, H, [{ r: 1, fill: CO_G }, { i: 2.5, r: 1.5, line: LT, w: 4 }]) + lines.map((l, i) => T(W / 2, top + i * pitch, l, size, HG('C'), { fill: LT, maxw: W - 2 * m, max: size })).join(''));
    } },
    // diagrammatic sign: straight on (next) at the top of the stem, the loop and the right turn to the name
    { id: 'diagrama', kind: 'direction', label: 'Diagrammatic direction sign (green)', draw: ({ name, next }) => {
      const cap = 48, size = cap / CAP, a = layout(clean(name), 'EM', 620, size, { max2: size * 0.85 }), b = clean(next);
      const aw = Math.max(...a.lines.map((l) => tw(l, 'EM') * a.size)), bw = tw(b, 'EM') * size;
      const W = Math.round(Math.max(1030, 455 + 210 + aw + 50, bw + 120)), H = 530, X = Math.round(Math.min(W / 2, 455)), tx = Math.min(Math.max(X, bw / 2 + 50), W - bw / 2 - 50);
      // GeoHints 255: the stem up to a head; the loop leaving it near the top, round to the right and back into the arm
      // pointing left through the stem; the right turn curving off the stem's foot. Small swept heads (TS.arrows)
      const diag = TS.arrows.group([
        { pts: [[X, H - 45], [X, 191]] },
        { pts: [[X, 226], [X + 108, 226, 54], [X + 108, 334, 54], [X - 134, 334]] },
        { pts: [[X, 470], [X, 341, 100], [X + 177, 341]] },
      ], { w: 20, fill: LT, head: { half: 1.1, back: 1.9, neck: 1.4 } });
      return svg(W, H, plate(W, H) + diag + T(tx, 122, b, size, HG('EM'), { fill: LT, maxw: W - 100, max: size }) +
        block(a.lines, a.size, X + 210, 348, HG('EM'), { anchor: 'start', fill: LT, maxw: W - X - 210 - 50 }));
    } },
    // (group H) arrow direction sign (Commons: ↖ Zipaquirá / Sopó →): one green board with a white line, mixed case; next
    // on the upper line after an arrow up-left, the name on the lower line with an arrow right at its end
    { id: 'flechas', kind: 'direction', label: 'Arrow direction sign (green)', draw: ({ name, next }) => {
      const cap = 46, size = cap / CAP, a = layout(clean(next), 'E', 820, size, { max2: size * 0.85 }), b = layout(clean(name), 'E', 820, size, { max2: size * 0.85 });
      const lw = (r) => Math.max(...r.lines.map((l) => tw(l, 'E') * r.size)), W = Math.round(Math.max(620, 140 + lw(a) + 50, 50 + lw(b) + 40 + 90 + 40));
      const h1 = 118 + (a.lines.length - 1) * 1.35 * a.size * CAP, h2 = 118 + (b.lines.length - 1) * 1.35 * b.size * CAP, H = Math.round(h1 + h2 + 30);
      return svg(W, H, plate(W, H) + harrow(82, 20 + h1 / 2, -45, 44, LT, { len: 1.3, shaft: 0.3, head: 0.55 }) +
        block(a.lines, a.size, 140, 20 + h1 / 2, HG('E'), { anchor: 'start', fill: LT, maxw: W - 140 - 50, gap: 1.35 }) +
        block(b.lines, b.size, 50, 10 + h1 + h2 / 2, HG('E'), { anchor: 'start', fill: LT, maxw: W - 50 - 40 - 90 - 40, gap: 1.35 }) +
        harrow(W - 40 - 45, 10 + h1 + h2 / 2, 90, 44, LT, { len: 1.3, shaft: 0.3, head: 0.55 }));
    } },
  ];
  TS.add('CO', co, { next: 'Valledupar', km: 10 });
})();
