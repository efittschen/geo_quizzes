// AR: Argentine signs carrying a place name, after the GeoHints pictures (see examples/AR.json).
// Green boards, white border line and capitals (Highway Gothic look: narrow Series B on the town board, C on tables).
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
  const AR_G = '#0d6a3d';
  const caps = (n) => clean(n).toUpperCase();
  // the block arrow of the tables: short shaft, broad head with rounded corners; w = its length, pointing right/left/up
  const barrow = (x, y, dir, w, fill) => `<path transform="translate(${x},${y}) rotate(${{ right: 0, left: 180, up: -90 }[dir]}) scale(${w}) translate(-0.5,0)" fill="${fill}" stroke="${fill}" stroke-width="0.06" stroke-linejoin="round" d="M0,-0.2 L0.28,-0.2 L0.22,-0.47 L0.97,0 L0.22,0.47 L0.28,0.2 L0,0.2 Z"/>`;
  const plate = (W, H, cap) => `<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="${cap * 0.3}" fill="${AR_G}" stroke="#7d8a80" stroke-width="1.5"/>` +
    `<rect x="${cap * 0.13}" y="${cap * 0.13}" width="${W - cap * 0.26}" height="${H - cap * 0.26}" rx="${cap * 0.2}" fill="none" stroke="#fff" stroke-width="${cap * 0.055}"/>`;
  const ar = [
    // town board: the name in lines, one word or more per line, left-aligned; as many lines as keep the board near 3:2
    { id: 'localidad', kind: 'entry', label: 'Town name board (green)', draw: ({ name }) => {
      const cap = 84, size = cap / CAP, s = caps(name), pitch = 1.9 * cap, mx = 0.34 * cap, my = 0.78 * cap;
      let best;
      for (let n = 1; n <= Math.min(3, toks(s).length); n++) {
        const L = split(s, n, 'B'), w = Math.max(...L.map((l) => tw(l, 'B'))) * size, W = w + 2 * mx, H = cap + (n - 1) * pitch + 2 * my;
        const sc = Math.abs(Math.log(W / H / 1.45)) + (W > 1500 ? 9 : 0);
        if (!best || sc < best.sc) best = { sc, L, W: Math.round(Math.max(W, cap * 3)), H: Math.round(H) };
      }
      const { L, W, H } = best;
      return svg(W, H, plate(W, H, cap) + L.map((l, i) => T(mx, my + cap + i * pitch, l, size, HG('B'), { anchor: 'start', fill: '#f2f2f2', maxw: W - 2 * mx, max: size })).join(''));
    } },
    // distance table: name with km and arrow right, next with arrow left; numbers right-aligned before the arrow column;
    // a name too long for ~700 units goes to two lines at 82 %
    { id: 'distancias', kind: 'direction', label: 'Distance table (green)', draw: ({ name, next, km }) => {
      const cap = 50, size = cap / CAP, aw = 70, k2 = km + 14, numW = tw(String(Math.max(km, k2)), 'C') * size;
      const rows = [{ s: caps(name), k: km, dir: 'right' }, { s: caps(next), k: k2, dir: 'left' }].map((r) => {
        const room = r.dir === 'left' ? 700 - aw - 28 : 700, o = layout(r.s, 'C', room, size, { max2: size * 0.82 });
        return { ...r, ...o, w: Math.max(...o.lines.map((l) => tw(l, 'C') * o.size)) + (r.dir === 'left' ? aw + 28 : 0), h: cap * (o.size / size) + (o.lines.length - 1) * 1.5 * o.size * CAP };
      });
      const W = Math.round(Math.max(640, 38 + Math.max(...rows.map((r) => r.w)) + 40 + numW + 21 + aw + 36)), numX = W - 36 - aw - 21;
      let y = 1.24 * cap, out = '';
      for (const r of rows) {
        const cy = y + r.h / 2, x0 = r.dir === 'left' ? 38 + aw + 28 : 38;
        out += r.lines.map((l, i) => T(x0, y + r.size * CAP + i * 1.5 * r.size * CAP, l, r.size, HG('C'), { anchor: 'start', fill: '#fff', maxw: numX - numW - 40 - x0, max: r.size })).join('') +
          T(numX, cy + cap / 2, String(r.k), size, HG('C'), { anchor: 'end', fill: '#fff' }) + barrow(r.dir === 'left' ? 38 + aw / 2 : W - 36 - aw / 2, cy, r.dir, aw, '#fff');
        y += r.h + 1.24 * cap;
      }
      return svg(W, Math.round(y), plate(W, Math.round(y), cap) + out);
    } },
    // direction sign with arrows (Commons photos in Misiones: R. MONTOYA / PUERTO RICO / Pto. IGUAZU on Ruta 12, GARUPÁ /
    // RETORNO, POSADAS / ARISTÓBULO DEL VALLE): one row per destination, the block arrow before the name when it points
    // ahead or left, after the name when it points right, the distance flush right; the place ahead on top, the turn to
    // the left below; a distance only where it is known (km for name, km2 for next)
    { id: 'direccion', kind: 'direction', label: 'Direction sign with arrows (green)', draw: ({ name, next, km, km2 }) => {
      const cap = 52, size = cap / CAP, ser = 'C', ls = 0.07, aw = 1.15 * cap, pitch = 2.15 * cap;
      const rows = [{ s: caps(name), dir: 'up', k: km }, { s: caps(next), dir: 'left', k: km2 }];
      const kw = Math.max(0, ...rows.map((r) => (r.k != null ? tw(String(r.k), ser, ls) * size : 0)));
      const x0 = 0.35 * cap + aw + 0.3 * cap, room = 820;
      rows.forEach((r) => { const o = layout(r.s, ser, room, size, { max2: size * 0.82, ls }); Object.assign(r, o); r.w = Math.max(...o.lines.map((l) => tw(l, ser, ls) * o.size)); r.h = (o.lines.length - 1) * 1.45 * o.size * CAP; });
      const W = Math.round(Math.max(560, x0 + Math.max(...rows.map((r) => Math.min(room, r.w))) + 0.7 * cap + (kw ? kw + 0.5 * cap : 0) + 0.5 * cap));
      let y = 0.45 * cap, out = '';
      rows.forEach((r) => {
        const top = y + 0.5 * pitch - cap / 2, cy = top + r.h / 2 + cap / 2;
        out += barrow(0.35 * cap + aw / 2, cy, r.dir, aw, '#fff') +
          r.lines.map((l, i) => T(x0, top + cap + i * 1.45 * r.size * CAP, l, r.size, HG(ser), { anchor: 'start', fill: '#fff', ls, maxw: W - x0 - (kw ? kw + 0.5 * cap : 0) - 0.7 * cap, max: r.size })).join('') +
          (r.k != null ? T(W - 0.5 * cap, cy + cap / 2, String(r.k), size, HG(ser), { anchor: 'end', fill: '#fff', ls }) : '');
        y += pitch + r.h;
      });
      const H = Math.round(y + 0.45 * cap);
      return svg(W, H, plate(W, H, cap) + out);
    } },
  ];
  TS.add('AR', ar, { next: 'Magdalena', km: 7 });
})();
