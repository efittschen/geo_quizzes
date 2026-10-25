// CR: Costa Rican signs carrying a place name, drawn from photos (GeoHints direction signs 229, 230 and Commons photos;
// see examples/CR.json). Green guide signs with white capitals and border line and a COSTA RICA route shield; white
// boards with black capitals and arrows. Capitals drop accents as on the pictures (SAN JOSE); Ñ is kept.
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
  const CR_G = '#0f6a4c', INK = '#161616', WH = '#f3f3f3';
  const caps = (n) => clean(n).toUpperCase().normalize('NFD').replace(/[̀́]/g, '').normalize('NFC');
  // route shield (pictures 229, road-number 367, 368): white, black edge line, COSTA RICA in a top band, the number below
  // (group D) the Commons drawing of the shield, shared/shields.js; x, y its top-left corner, h its height
  const shield = (x, y, h, road) => TS.shields.caRoute(x, y, h, road, { country: 'CR', ink: INK, font: HG(String(road).length > 2 ? 'C' : 'D'), capEm: CAP });
  // secondary routes (100 and up, Florencia photo: 141): a round white badge, COSTA RICA over the number
  // (group D) the Commons drawing of the round secondary-route marker, shared/shields.js
  const badge = (x, y, h, road) => TS.shields.crSecondary(x, y, h, road, { ink: INK, font: HG(String(road).length > 2 ? 'C' : 'D'), capEm: CAP });
  const routeMark = (x, y, h, road) => (parseInt(road, 10) >= 100 ? badge(x, y, h, road) : shield(x, y, h, road));
  const far = (km) => km + Math.max(8, Math.round(km * 0.8));
  const ARW = { len: 1.45, shaft: 0.32, head: 0.55 };
  // a name in one line up to `room` wide, else two lines a size smaller
  const rows = (s, cap, room, ser, ls = 0, k = 0.8) => { const size = cap / CAP;
    if (tw(s, ser, ls) * size <= room || toks(s).length < 2) return { L: [s], size };
    const L = split(s, 2, ser, ls); return { L, size: Math.min(size * k, room / Math.max(...L.map((l) => tw(l, ser, ls)))) }; };
  const rw = (r, ser, ls = 0) => Math.max(...r.L.map((l) => tw(l, ser, ls) * r.size));
  const cr = [
    // picture 229: overhead lane sign; the farther place on top in smaller capitals, the name below, the route shield at
    // the bottom left and a down arrow over the lane
    { id: 'elevado', kind: 'motorway', label: 'Overhead lane sign (green)', draw: ({ name, next, road }) => {
      const ls = 0.06, ls2 = 0.02, a = rows(caps(next), 40, 860, 'E', ls), b = rows(caps(name), 56, 860, 'E', ls2, 0.78);
      const W = Math.round(Math.max(640, 80 + rw(a, 'E', ls), 80 + rw(b, 'E', ls2)));
      const lh = (r) => r.size * CAP * 1.5, ha = (a.L.length - 1) * lh(a), hb = (b.L.length - 1) * lh(b);
      const y1 = 104, y2 = y1 + ha + 92, top = y2 + hb + 74, H = Math.round(top + 210);
      const line = (r, y, ls) => r.L.map((l, i) => T(W / 2, y + i * lh(r), l, r.size, HG('E'), { fill: WH, ls, maxw: W - 80, max: r.size })).join('');
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="26" fill="${CR_G}" stroke="#c9d3cd" stroke-width="2"/>` +
        `<rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="19" fill="none" stroke="${WH}" stroke-width="4"/>` +
        line(a, y1, ls) + line(b, y2, ls2) + shield(W * 0.23 - 48, top + 60, 92, road) +
        harrow(W * 0.48, top + 74, 180, 92, WH, ARW));
    } },
    // picture 230: white board, black edge line; each place in narrow capitals with a heavy diagonal arrow on the right
    { id: 'blanco', kind: 'direction', label: 'Direction board (white)', draw: ({ name, next }) => {
      const cap = 54, ls = 0.06, a = rows(caps(name), cap, 640, 'B', ls), b = rows(caps(next), cap, 640, 'B', ls);
      const W = Math.round(Math.max(380, 26 + Math.max(rw(a, 'B', ls), rw(b, 'B', ls)) + 30 + 64 + 22));
      const lh = (r) => r.size * CAP * 1.35, row = (r, y) => r.L.map((l, i) => T(26, y + i * lh(r), l, r.size, HG('B'), { anchor: 'start', fill: INK, ls, maxw: W - 26 - 30 - 64 - 22, max: r.size })).join('');
      const y1 = 100, y2 = y1 + (a.L.length - 1) * lh(a) + 124, H = Math.round(y2 + (b.L.length - 1) * lh(b) + 58);
      const ax = W - 22 - 34, mid = (r, y) => y - cap / 2 + ((r.L.length - 1) * lh(r)) / 2;
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="${WH}" stroke="#9a9a9a" stroke-width="2"/>` +
        `<rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="8" fill="none" stroke="${INK}" stroke-width="4"/>` +
        row(a, y1) + harrow(ax, mid(a, y1), 45, 46, INK, { len: 1.25, shaft: 0.42, head: 0.6 }) +
        row(b, y2) + harrow(ax, mid(b, y2), 45, 46, INK, { len: 1.25, shaft: 0.42, head: 0.6 }));
    } },
    // Florencia and San Ramón photos: one plate per place, the distance first and the arrow after the name for one way,
    // the arrow first and the distance last for the other; the route's shield on a square plate beside each; Ciudad
    // shortened to CIUD. as on the plates
    { id: 'placas-km', kind: 'direction', label: 'Distance plates with route shield (green)', draw: ({ name, next, km, road }) => {
      // one board per row (Commons Florencia photo): green throughout, the white border line round the text part only,
      // the route shield on the plain green end, which is narrower than the board is high
      const ser = 'C', ls = 0.03, cap = 46, size = cap / CAP, h = 96, gap = 14, sq = 70, rm = 58, cut = (n) => caps(n).replace(/^CIUDAD /, 'CIUD. ');
      const a = cut(name), b = cut(next), k1 = String(km), k2 = String(far(km));
      const need = (s, k) => 22 + tw(k, ser, ls) * size + 22 + tw(s, ser, ls) * size + 30 + 70 + 22;
      const Wm = Math.round(Math.max(460, Math.min(1000, Math.max(need(a, k1), need(b, k2))))), W = Wm + sq;
      // (group D) the white border is the board's own edge band, a tenth of its height (Florencia photo: 7.4 px of 75)
      const bw = 0.1 * h, board = (y, tx) => `<rect x="1" y="${y + 1}" width="${W - 2}" height="${h - 2}" rx="6" fill="${CR_G}"/>` +
        `<rect x="${tx + 1}" y="${y + 1}" width="${Wm - 2}" height="${h - 2}" rx="6" fill="${WH}"/><rect x="${tx + 1 + bw}" y="${y + 1 + bw}" width="${Wm - 2 - 2 * bw}" height="${h - 2 - 2 * bw}" rx="2" fill="${CR_G}"/>`;
      const by = h / 2 + cap / 2, y2 = h + gap, kw1 = tw(k1, ser, ls) * size, kw2 = tw(k2, ser, ls) * size;
      return svg(W, 2 * h + gap, board(0, 0) + routeMark(Wm + (sq - rm) / 2 - 2, (h - rm) / 2, rm, road) +
        T(22, by, k1, size, HG(ser), { anchor: 'start', fill: WH, ls }) + T(22 + kw1 + 22, by, a, size, HG(ser), { anchor: 'start', fill: WH, ls, maxw: Wm - 22 - kw1 - 22 - 30 - 70 - 22, max: size }) +
        harrow(Wm - 22 - 35, h / 2, 90, 50, WH, ARW) +
        board(y2, sq) + routeMark((sq - rm) / 2 + 2, y2 + (h - rm) / 2, rm, road) + harrow(sq + 22 + 35, y2 + h / 2, -90, 50, WH, ARW) +
        T(sq + 22 + 70 + 30, y2 + by, b, size, HG(ser), { anchor: 'start', fill: WH, ls, maxw: Wm - 22 - 70 - 30 - 22 - kw2 - 22, max: size }) +
        T(W - 22, y2 + by, k2, size, HG(ser), { anchor: 'end', fill: WH, ls }));
    } },
    // La Tigra / Cachagua / La Fortuna photo: white board, black edge, narrow capitals, the distance flush right
    { id: 'distancia-blanca', kind: 'direction', label: 'Distance board (white)', draw: ({ name, next, km }) => {
      const ser = 'B', ls = 0.03, cap = 40, size = cap / CAP, rows = [[caps(name), km], [caps(next), far(km)]];
      const nw = Math.max(...rows.map(([, k]) => tw(String(k), ser, ls))) * size, w = Math.max(...rows.map(([s0]) => tw(s0, ser, ls))) * size;
      const W = Math.round(Math.max(400, Math.min(1000, 30 + w + 46 + nw + 30))), H = 2 * 74 + 44;
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="${WH}" stroke="#9a9a9a" stroke-width="2"/>` +
        `<rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="11" fill="none" stroke="${INK}" stroke-width="4"/>` +
        rows.map(([s0, k], i) => T(30, 80 + i * 74, s0, size, HG(ser), { anchor: 'start', fill: INK, ls, maxw: W - 30 - 46 - nw - 30, max: size }) +
          T(W - 30, 80 + i * 74, String(k), size, HG(ser), { anchor: 'end', fill: INK, ls })).join(''));
    } },
  ];
  TS.add('CR', cr, { next: 'Alajuela', km: 12, road: '1' });
})();
