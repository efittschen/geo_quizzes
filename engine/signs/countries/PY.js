// PY: Paraguayan signs carrying a place name, drawn from Commons photos (no GeoHints pictures; see examples/PY.json).
// Green boards with white capitals and border line, many hung on gantries: the town's urban-zone board, a town name
// board, a board headed by the town with distances, distance lists; blue lists in the Mennonite colonies of the Chaco.
// Capitals drop accents as on the photos (TOBATI, CAAZAPA); Ñ is kept; titles shortened (Mcal., Gral., Tte., Inf.).
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
  const PY_G = '#0d6a47', PY_B = '#1d4f9c', WH = '#f3f3f3';
  const DIN = "'Alte DIN 1451 Mittelschrift','DIN 1451 Mittelschrift',sans-serif";
  const noAcc = (s) => s.normalize('NFD').replace(/[̀́]/g, '').normalize('NFC');
  // long names shortened as on the boards: titles in small letters (Mcal. ESTIGARRIBIA, Gral. E. A. GARAY, Tte. 1ro IRALA
  // FERNANDEZ, Inf. RIVAROLA), then given names to initials from the surname backwards (P. J. CABALLERO, SAN JUAN N.);
  // names with "de", "del" ... and saints' names stay whole; the rest in capitals
  const TITLES = [['Mariscal', 'Mcal.'], ['General', 'Gral.'], ['Teniente', 'Tte.'], ['Coronel', 'Cnel.'], ['Doctor', 'Dr.'], ['Presidente', 'Pdte.'],
    ['Capitán', 'Cap.'], ['Infante', 'Inf.'], ['Primero', '1ro']];
  const KEEP = /^(san|santa|santo|villa|puerto|colonia|mayor|nueva|nuevo)$/i, PREP = /^(de|del|la|las|los|el|y)$/i;
  const pyName = (n, max = 18) => {
    let w = clean(n).split(/\s+/);
    const len = () => [...w.join(' ')].length;
    if (len() > max) w = w.map((x) => (TITLES.find(([a]) => a === x) || [0, x])[1]);
    if (len() > max && w.length > 2 && !w.some((x) => PREP.test(x)))
      for (let i = w.length - 2; i >= 0 && len() > max; i--) if (!KEEP.test(w[i]) && !/\.$|^1ro$/.test(w[i])) w[i] = w[i][0] + '.';
    return w.map((x) => (TITLES.some(([, a]) => a === x) ? x : noAcc(x).toUpperCase())).join(' ');
  };
  const far = (km) => km + Math.max(8, Math.round(km * 0.8));
  const ARW = { len: 1.35, shaft: 0.34, head: 0.58 };
  const brd = (W, H, fill = PY_G, rx = 8) => `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${rx}" fill="${fill}"/>` +
    `<rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="${Math.max(2, rx - 4)}" fill="none" stroke="${WH}" stroke-width="3.5"/>`;
  const fitL = (s, ser, size, room, ls) => (tw(s, ser, ls) * size <= room || toks(s).length < 2 ? [s] : split(s, 2, ser, ls));
  const wL = (L, ser, size, ls) => Math.max(...L.map((l) => tw(l, ser, ls) * size));
  const py = [
    // Bella Vista photo: on the gantry at the town's edge, the name over ZONA URBANA and the speed limit
    { id: 'zona-urbana', kind: 'entry', label: 'Urban zone board (green)', draw: ({ name }) => {
      const ser = 'D', ls = 0.07, cap = 40, size = cap / CAP, L = fitL(pyName(name), ser, size, 860, ls);
      const w = wL(L, ser, size, ls), W = Math.round(Math.max(600, Math.min(900, w) + 90)), lh = 72, H = 300 + (L.length - 1) * lh;
      const o = { fill: WH, ls, max: size, maxw: W - 80 };
      return svg(W, H, brd(W, H) + L.map((l, i) => T(W / 2, 92 + i * lh, l, size, HG(ser), o)).join('') +
        T(W / 2, 172 + (L.length - 1) * lh, 'ZONA URBANA', size, HG(ser), o) + T(W / 2, 252 + (L.length - 1) * lh, 'VEL. MAX. 40k/h', size, HG(ser), o));
    } },
    // YBY YA'U photo (Ruta 3): the town's name alone on a board hung from the gantry
    { id: 'nombre', kind: 'entry', label: 'Town name board on gantry (green)', draw: ({ name }) => {
      const ser = 'E', ls = 0.04, cap = 70, size = cap / CAP, L = fitL(pyName(name), ser, size, 1000, ls);
      const W = Math.round(Math.max(480, Math.min(1000, wL(L, ser, size, ls)) + 110)), lh = cap * 1.45, H = Math.round(190 + (L.length - 1) * lh);
      return svg(W, H, brd(W, H) + L.map((l, i) => T(W / 2, 95 + cap / 2 + i * lh, l, size, HG(ser), { fill: WH, ls, maxw: W - 90, max: size })).join(''));
    } },
    // Ñumí, Carapeguá and Arroyos y Esteros photos: the town on top, below it the next place behind an arrow, with its
    // distance in Km
    { id: 'cartel-localidad', kind: 'direction', label: 'Town board with distance (green)', draw: ({ name, next, km }) => {
      const ser = 'D', ls = 0.06, cap = 44, size = cap / CAP, rc = 36, rs = rc / CAP, H0 = fitL(pyName(name), ser, size, 860, ls), nx = pyName(next), kmS = `${String(km).padStart(2, '0')} Km`;
      const kw = tw(kmS, ser, ls) * rs, W = Math.round(Math.max(560, Math.min(980, Math.max(wL(H0, ser, size, ls) + 80, 36 + 50 + 30 + tw(nx, ser, ls) * rs + 40 + kw + 36))));
      const lh = cap * 1.5, hh = 98 + (H0.length - 1) * lh, H = Math.round(hh + 96);
      return svg(W, H, brd(W, H) + H0.map((l, i) => T(W / 2, 76 + i * lh, l, size, HG(ser), { fill: WH, ls, maxw: W - 70, max: size })).join('') +
        harrow(36 + 25, hh + 34 - rc / 2, 0, 38, WH, ARW) + T(36 + 50 + 30, hh + 34, nx, rs, HG(ser), { anchor: 'start', fill: WH, ls, maxw: W - 36 - 50 - 30 - 40 - kw - 36, max: rs }) +
        T(W - 36, hh + 34, kmS, rs, HG(ser), { anchor: 'end', fill: WH, ls }));
    } },
    // Chaco gantry photos (Cruce Filadelfia, Cruce Loma Plata, Pozo Colorado, Bella Vista): narrow capitals, the distance
    // flush right with "Km." and the arrow after it
    { id: 'distancias', kind: 'direction', label: 'Distance board on gantry (green)', draw: ({ name, next, km }) => {
      const ser = 'C', ls = 0.04, cap = 38, size = cap / CAP, rows = [[pyName(name), km], [pyName(next), far(km)]];
      const kw = Math.max(...rows.map(([, k]) => tw(`${k} Km.`, ser, ls))) * size, w = Math.max(...rows.map(([s]) => tw(s, ser, ls))) * size;
      const W = Math.round(Math.max(560, Math.min(1000, 34 + w + 46 + kw + 22 + 40 + 30))), H = 70 * 2 + 46;
      return svg(W, H, brd(W, H) + rows.map(([s, k], i) => { const y = 78 + i * 70;
        return T(34, y, s, size, HG(ser), { anchor: 'start', fill: WH, ls, maxw: W - 34 - 46 - kw - 22 - 40 - 30, max: size }) +
          T(W - 30 - 40 - 22, y, `${k} Km.`, size, HG(ser), { anchor: 'end', fill: WH, ls }) + harrow(W - 30 - 20, y - cap / 2, 0, 30, WH, ARW); }).join(''));
    } },
    // Cruce Don Silvio, Transchaco and Neuland photos: the arrow first, then the place, the distance flush right
    { id: 'distancias-izq', kind: 'direction', label: 'Distance board, arrows first (green)', draw: ({ name, next, km }) => {
      const ser = 'D', ls = 0.04, cap = 40, size = cap / CAP, rows = [[pyName(name), km, 0], [pyName(next), far(km), -90]];
      const kw = Math.max(...rows.map(([, k]) => tw(`${k} Km`, ser, ls))) * size, w = Math.max(...rows.map(([s]) => tw(s, ser, ls))) * size;
      const W = Math.round(Math.max(560, Math.min(1000, 30 + 54 + 24 + w + 46 + kw + 30))), H = 74 * 2 + 46;
      return svg(W, H, brd(W, H) + rows.map(([s, k, d], i) => { const y = 82 + i * 74;
        return harrow(30 + 27, y - cap / 2, d, 40, WH, ARW) + T(30 + 54 + 24, y, s, size, HG(ser), { anchor: 'start', fill: WH, ls, maxw: W - 30 - 54 - 24 - 46 - kw - 30, max: size }) +
          T(W - 30, y, `${k} Km`, size, HG(ser), { anchor: 'end', fill: WH, ls }); }).join(''));
    } },
    // Filadelfia photos (Fernheim colony, Boquerón): blue list, white arrows first, widely spaced capitals, km flush right
    { id: 'colonias', kind: 'direction', label: 'Colony distance list (blue)', regions: ['Boquerón'], draw: ({ name, next, km }) => {
      const ls = 0.16, cap = 38, size = cap / 0.7, rows = [[pyName(name), km, 0], [pyName(next), far(km), 90]];
      const est = (s) => [...s].length * (0.55 + ls) * size, w = Math.max(...rows.map(([s]) => est(s)));
      const W = Math.round(Math.max(560, Math.min(1000, 30 + 44 + 26 + w + 40 + 150 + 26))), H = 2 * 68 + 50;
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${PY_B}"/>` + rows.map(([s, k, d], i) => { const y = 80 + i * 68;
        return harrow(30 + 22, y - cap / 2, d, 34, WH, ARW) + T(30 + 44 + 26, y, s, size, DIN, { anchor: 'start', fill: WH, ls, maxw: W - 30 - 44 - 26 - 40 - 150 - 26, max: size }) +
          T(W - 26 - 62, y, String(k), size * 1.05, DIN, { anchor: 'end', fill: WH }) + T(W - 26, y, 'km', size * 0.7, DIN, { anchor: 'end', fill: WH }); }).join(''));
    } },
  ];
  TS.add('PY', py, { next: 'Caazapá', km: 29 });
})();
