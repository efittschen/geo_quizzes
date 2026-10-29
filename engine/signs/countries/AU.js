// AU: Australian signs carrying a place name, after the GeoHints pictures (see examples/AU.json).
// Guide signs green with white border and Series E(M) lettering (AS 1744 look; RG2014 stands in); Queensland's town
// entry is a blue board with the speed zone and "Welcome to" over the town name in capitals.
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
  const AU_G = '#00663d', AU_B = '#1c4f9c', LT = '#fff';
  const au = [
    // Queensland town entry: blue, the speed sign on a white panel, Welcome to, the name in capitals (two lines if long)
    { id: 'welcome-qld', kind: 'entry', label: 'Town entry with speed zone (Queensland)', regions: ['Queensland'], draw: ({ name }) => {
      const W = 578, cap = 74, size = cap / CAP, s = clean(name).toUpperCase(), a = layout(s, 'D', W - 90, size, { max2: size * 0.8, min1: size * 0.8 });
      const extra = (a.lines.length - 1) * 1.5 * a.size * CAP, H = Math.round(770 + extra);
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="22" fill="${AU_B}" stroke="#fff" stroke-width="4"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="none" stroke="#fff" stroke-width="5"/>` +
        `<rect x="95" y="74" width="388" height="372" rx="20" fill="#f4f4f4"/><circle cx="289" cy="260" r="144" fill="#fff" stroke="#d8262b" stroke-width="23"/>` +
        T(289, 310, '60', 168, HG('E'), { fill: '#1b1b1b' }) + T(W / 2, 574, 'Welcome to', 44 / CAP, HG('EM'), { fill: LT, maxw: W - 80, max: 44 / CAP }) +
        a.lines.map((l, i) => T(W / 2, 700 + i * 1.5 * a.size * CAP + (a.lines.length > 1 ? -10 : 0), l, a.size, HG('D'), { fill: LT, ls: 0.04, maxw: W - 80, max: a.size })).join(''));
    } },
    // fingerboard (right half of the picture): pointing right, the name with its distance over next with a longer one.
    // Round 2 (user: "the arrow reaches the very top and is wider - also often it shows on two sides"): measured on
    // direction-signs 245 at large size, in units of the board height H: the point is 0.37 H long; the white chevron is a
    // filled shape from 0.11 H to 0.89 H (a clear green band above and below; the white border runs close to the edge), 0.32 H thick across, its arms running 0.32 H, its apex 0.12 H short of the
    // tip, so it stays inside the point with green round it. fb() draws one or both pointed ends; the two-way board
    // (fingerboard-2way, the whole picture) puts next with its distance before it at the left end, the name with its
    // distance at the right
    ...(() => {
      const plate = (W, H, two) => { const tip = 0.37 * H;
        const pts = [[two ? tip : 3, 3], [W - tip, 3], [W - 3, H / 2], [W - tip, H - 3], [two ? tip : 3, H - 3], ...(two ? [[3, H / 2]] : [])];
        const P = (q) => 'M' + q.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L') + ' Z';
        return `<path d="${P(pts)}" fill="${AU_G}" stroke="#d9d9d9" stroke-width="2" stroke-linejoin="round"/>` +
          `<path d="${P(TS.arrows.offset(pts, 5.5))}" fill="none" stroke="${LT}" stroke-width="3.5" stroke-linejoin="miter"/>`; };
      // the chevron with its apex at x, pointing right (dir 1) or left (dir -1)
      const chev = (x, H, dir) => { const dx = 0.32 * H, t = 0.32 * H, yt = 0.11 * H, yb = 0.89 * H, X = (v) => x - dir * v;
        return `<path d="M${X(dx + t)},${yt} L${X(dx)},${yt} L${x},${H / 2} L${X(dx)},${yb} L${X(dx + t)},${yb} L${X(t)},${H / 2} Z" fill="${LT}"/>`; };
      const reach = (H) => 3 + 0.12 * H + 0.64 * H;   // from the tip to the chevron's far corners
      return [
        { id: 'fingerboard', kind: 'direction', label: 'Fingerboard (green)', draw: ({ name, next, km }) => {
          const cap = 40, size = cap / CAP, k2 = km + 20, pitch = 71, H = 180;
          const a = clean(name), b = clean(next), wa = tw(a, 'EM') * size, wb = tw(b, 'EM') * size, wn = tw(String(Math.max(km, k2)), 'EM') * size;
          const W = Math.round(Math.max(560, 40 + Math.max(wa, wb) + 50 + wn + 28 + reach(H)));
          const nx = W - reach(H) - 28, y1 = 36 + cap, y2 = y1 + pitch;
          return svg(W, H, plate(W, H, false) + chev(W - 3 - 0.12 * H, H, 1) +
            T(40, y1, a, size, HG('EM'), { anchor: 'start', fill: LT, maxw: nx - wn - 46 - 40, max: size }) + T(nx, y1, String(km), size, HG('EM'), { anchor: 'end', fill: LT }) +
            T(40, y2, b, size, HG('EM'), { anchor: 'start', fill: LT, maxw: nx - wn - 46 - 40, max: size }) + T(nx, y2, String(k2), size, HG('EM'), { anchor: 'end', fill: LT }));
        } },
        { id: 'fingerboard-2way', kind: 'direction', label: 'Fingerboard, both ways (green)', draw: ({ name, next, km }) => {
          const cap = 40, size = cap / CAP, k2 = km + 20, H = 150, a = clean(name), b = clean(next);
          const wa = tw(a, 'EM') * size, wb = tw(b, 'EM') * size, w1 = tw(String(km), 'EM') * size, w2 = tw(String(k2), 'EM') * size, gap = 0.33 * size;
          const half = Math.max(wa + gap + w1, wb + gap + w2), W = Math.round(Math.max(900, 2 * (reach(H) + 28 + half) + 90));
          const yb = H / 2 + cap / 2, xl = reach(H) + 28, xr = W - reach(H) - 28;
          return svg(W, H, plate(W, H, true) + chev(3 + 0.12 * H, H, -1) + chev(W - 3 - 0.12 * H, H, 1) +
            T(xl, yb, String(k2), size, HG('EM'), { anchor: 'start', fill: LT }) + T(xl + w2 + gap, yb, b, size, HG('EM'), { anchor: 'start', fill: LT, maxw: W / 2 - 45 - xl - w2 - gap, max: size }) +
            T(xr - w1 - gap, yb, a, size, HG('EM'), { anchor: 'end', fill: LT, maxw: xr - w1 - gap - W / 2 - 45, max: size }) + T(xr, yb, String(km), size, HG('EM'), { anchor: 'end', fill: LT }));
        } },
      ];
    })(),
  ];
  TS.add('AU', au, { next: 'Canberra', km: 17 });
})();
