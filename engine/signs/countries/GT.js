// GT: Guatemalan signs carrying a place name, after the GeoHints pictures (see examples/GT.json).
// Central American manual (SIECA): green destination signs with white capitals and border, route shields (white, GUATEMALA
// over RN-/CA- number); municipal finger boards in blue; older white boards with black capitals. Capitals drop accents.
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
  const GT_G = '#0b7a55', GT_B = '#1f4f9e', INK = '#151515';
  const caps = (n) => clean(n).toUpperCase().normalize('NFD').replace(/[̀́]/g, '').normalize('NFC');   // NUEVA CONCEPCION: accents dropped, Ñ kept
  // route shield: white, thin dark edge, domed top with corner ears, GUATEMALA over the number (RN-14, CA-2)
  // (group D) the Commons drawing of the shield, shared/shields.js; x, y its top-left corner, h its height
  const shield = (x, y, h, road) => TS.shields.gtRoute(x, y, h, road, { ink: INK, font: HG(String(road).length > 4 ? 'C' : 'D'), capEm: CAP });
  // (group D) the arrows of pictures 233 and 234 (TS.arrows): a short heavy shaft and a chevron head whose barb ends are
  // cut square to the barbs, measured in shaft widths on the pictures (233: half 1.74, back 2.05, cut 0.76, drop 0.67,
  // neck 2.38; 234: 1.57, 1.71, 0.48, 0.62, 1.95; the mean taken); (x, y) the centre, hw the head's width, len its length
  // as a share of hw (233: 1.2, 234: 1.0)
  const GT_HEAD = { base: 'chevron', half: 1.65, back: 1.88, cut: 0.62, drop: 0.64, neck: 2.16 };
  const garrow = (x, y, deg, hw, fill, len = 1.1) => TS.arrows.dir(x, y, ((deg % 360) + 360) % 360, hw * len, { w: hw / (2 * GT_HEAD.half), fill, head: GT_HEAD });
  const plate = (x, y, w, h, fill, rx = 9) => `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="${rx}" fill="${fill}"/><rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="${rx - 3}" fill="none" stroke="#f4f4f4" stroke-width="3"/>`;
  const AR = { len: 1.25, shaft: 0.42, head: 0.56 };   // the short, heavy arrows of the pictures
  // one destination line: the name in Series D capitals, a longer board for a longer name, two lines past 1100 units
  const fitRow = (s, cap, room) => { const size = cap / CAP; return tw(s, 'D') * size <= room ? { L: [s], size } : (() => { const L = split(s, 2, 'D'); return { L, size: Math.min(size * 0.82, room / Math.max(...L.map((l) => tw(l, 'D')))) }; })(); };
  const textW = (r) => Math.max(...r.L.map((l) => tw(l, 'D') * r.size));
  const gt = [
    { id: 'destino', kind: 'direction', label: 'Destination sign, route shields (green)', draw: ({ name, next, road }) => {
      const cap = 42, sh = 88, sw = sh * 0.98, ra = fitRow(caps(name), cap, 1000), rb = fitRow(caps(next), cap, 1000);
      const h1 = 108 + (ra.L.length - 1) * 50, h2 = 108 + (rb.L.length - 1) * 50, y1 = 8 + h1 / 2, y2 = 8 + h1 + h2 / 2;
      const W = Math.round(Math.max(640, 28 + textW(ra) + 40 + 70 + 24 + sw + 24, 24 + sw + 34 + 70 + 30 + textW(rb) + 28)), H = h1 + h2 + 16;
      return svg(W, H, plate(0, 0, W, H, GT_G) +
        block(ra.L, ra.size, 28, y1, HG('D'), { anchor: 'start', fill: '#fff', maxw: W - 28 - 40 - 70 - 24 - sw - 24, gap: 1.2 }) +
        garrow(W - 24 - sw - 24 - 38, y1, 90, 64, '#fff', 1.0) + shield(W - 24 - sw, y1 - sh / 2, sh, road) +
        shield(24, y2 - sh / 2, sh, road) + garrow(24 + sw + 34 + 34, y2, 0, 64, '#fff', 1.15) +
        block(rb.L, rb.size, 24 + sw + 34 + 70 + 30, y2, HG('D'), { anchor: 'start', fill: '#fff', maxw: W - (24 + sw + 34 + 70 + 30) - 28, gap: 1.2 }));
    } },
    { id: 'destino-paneles', kind: 'direction', label: 'Destination boards with shield panels (green)', draw: ({ name, next, road }) => {
      const cap = 40, sh = 84, pw = 110, gap = 8, ra = fitRow(caps(name), cap, 1000), rb = fitRow(caps(next), cap, 1000);
      const h1 = 118 + (ra.L.length - 1) * 48, h2 = 118 + (rb.L.length - 1) * 48, y2 = h1 + 14;
      const Wm = Math.round(Math.max(500, 26 + textW(ra) + 30 + 72 + 24, 24 + 72 + 30 + textW(rb) + 26)), W = Wm + gap + pw;
      return svg(W, h1 + h2 + 14, plate(0, 0, Wm, h1, GT_G) + plate(Wm + gap, 0, pw, h1, GT_G) + shield(Wm + gap + (pw - sh) / 2, (h1 - sh) / 2, sh, road) +
        block(ra.L, ra.size, 26, h1 / 2, HG('D'), { anchor: 'start', fill: '#fff', maxw: Wm - 26 - 30 - 72 - 24, gap: 1.2 }) + garrow(Wm - 24 - 36, h1 / 2, 0, 64, '#fff', 1.2) +
        plate(0, y2, pw, h2, GT_G) + plate(pw + gap, y2, Wm, h2, GT_G) + shield((pw - sh) / 2, y2 + (h2 - sh) / 2, sh, road) +
        garrow(pw + gap + 24 + 36, y2 + h2 / 2, -45, 64, '#fff', 1.2) +
        block(rb.L, rb.size, pw + gap + 24 + 72 + 30, y2 + h2 / 2, HG('D'), { anchor: 'start', fill: '#fff', maxw: Wm - 24 - 72 - 30 - 26, gap: 1.2 }));
    } },
    { id: 'municipal', kind: 'direction', label: 'Municipal finger boards (blue)', draw: ({ name, next }) => {
      const cap = 40, ra = fitRow(caps(name), cap, 1000), rb = fitRow(caps(next), cap, 1000), gap = 14;
      const h1 = 96 + (ra.L.length - 1) * 46, h2 = 96 + (rb.L.length - 1) * 46;
      const W = Math.round(Math.max(520, 22 + textW(ra) + 22 + 60 + 22, 22 + 60 + 22 + textW(rb) + 22));
      // GeoHints 235: a big thick-chevron arrow (TS.arrows 'chevron', about 0.78 of the board's height) on a short stub
      const fing = (y, h, r, left) => plate(0, y, W, h, GT_B, 12) + TS.arrows.dir(left ? 22 + 30 : W - 22 - 30, y + h / 2, left ? 270 : 90, 56, { w: 21, fill: '#fff', head: 'chevron' }) +
        block(r.L, r.size, left ? 22 + 60 + 22 : 22, y + h / 2, HG('C'), { anchor: 'start', fill: '#fff', maxw: W - 22 - 60 - 22 - 22, gap: 1.15 });
      return svg(W, h1 + h2 + gap, fing(0, h1, ra, false) + fing(h1 + gap, h2, rb, true));
    } },
    { id: 'flecha-blanca', kind: 'direction', label: 'Direction boards (white, black capitals)', draw: ({ name, next }) => {
      const cap = 40, gap = 10, ls = 0.1, size0 = cap / CAP;
      const r = (s) => (tw(s, 'D', ls) * size0 <= 1000 ? { L: [s], size: size0 } : { L: split(s, 2, 'D', ls), size: size0 * 0.82 });
      const ra = r(caps(name)), rb = r(caps(next)), w = (x) => Math.max(...x.L.map((l) => tw(l, 'D', ls) * x.size));
      const h1 = 96 + (ra.L.length - 1) * 44, h2 = 96 + (rb.L.length - 1) * 44;
      const W = Math.round(Math.max(600, 30 + 64 + 40 + Math.max(w(ra), w(rb)) + 30));
      const board = (y, h, x, deg) => `<rect x="1" y="${y + 1}" width="${W - 2}" height="${h - 2}" rx="8" fill="#ececea" stroke="#777" stroke-width="2"/><rect x="5" y="${y + 5}" width="${W - 10}" height="${h - 10}" rx="5" fill="none" stroke="${INK}" stroke-width="3"/>` +
        // GeoHints 236: the same thick-chevron arrow, a little smaller, its shaft longer (TS.arrows 'chevron')
        TS.arrows.dir(30 + 32, y + h / 2, deg === -90 ? 270 : deg, 58, { w: 17, fill: INK, head: 'chevron' }) + block(x.L, x.size, (30 + 64 + 40 + W - 30) / 2, y + h / 2, HG('D'), { fill: INK, ls, maxw: W - 30 - 64 - 40 - 30, gap: 1.12 });
      return svg(W, h1 + h2 + gap, board(0, h1, ra, -90) + board(h1 + gap, h2, rb, 0));
    } },
  ];
  TS.add('GT', gt, { next: 'Escuintla', km: 9, road: 'CA-2' });
})();
