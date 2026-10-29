// BR: Brazilian signs carrying a place name, drawn from photos (GeoHints direction sign 251 and Commons photos; see
// examples/BR.json). Green destination and distance boards on highways, white mixed-case letters (Highway Gothic look),
// arrows toward which the names are aligned; long names abbreviated as on the signs (Gov. Valadares, Sto. A. Posse).
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
  const BR_G = '#0e7a3e', BR_B = '#1b55a3', WH = '#f4f4f4', INK = '#161616';
  // long names shortened the way the boards do it (S. J. Campos, Sto. A. Posse, Chac. Sta. Rita): titles first, then São
  const ABBR = [[/\bGovernador\b/g, 'Gov.'], [/\bPresidente\b/g, 'Pres.'], [/\bDoutor\b/g, 'Dr.'], [/\bCoronel\b/g, 'Cel.'], [/\bSenador\b/g, 'Sen.'],
    [/\bMarechal\b/g, 'Mal.'], [/\bEngenheiro\b/g, 'Eng.'], [/\bProfessor\b/g, 'Prof.'], [/\bCapitão\b/g, 'Cap.'], [/\bNossa Senhora\b/g, 'N. Sra.'],
    [/\bSanta\b/g, 'Sta.'], [/\bSanto\b/g, 'Sto.']];
  const brName = (n, max = 16) => {
    let s = clean(n);
    if ([...s].length > max) for (const [re, r] of ABBR) s = s.replace(re, r);
    if ([...s].length > max + 4) s = s.replace(/\bSão (?=\S+ )/g, 'S. ');
    return s;
  };
  const up = (s) => s.toUpperCase();   // capitals keep their accents on Brazilian boards (BRASÍLIA, SÃO PAULO, BRÁZ)
  const far = (km) => km + Math.max(8, Math.round(km * 0.8));   // a second, farther distance on two-place boards
  const ARW = { len: 1.35, shaft: 0.3, head: 0.58 };
  // a board: plain (picture 251) or with the white edge line of the photos
  const brd = (W, H, fill = BR_G, edge = true, rx = 14) => `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${rx}" fill="${fill}"/>` +
    (edge ? `<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="${rx - 5}" fill="none" stroke="${WH}" stroke-width="4"/>` : '');
  const rule = (y, W) => `<path d="M8,${y} L${W - 8},${y}" stroke="${WH}" stroke-width="4"/>`;
  // a name in one line up to `room` wide, else two lines a size smaller (VILA RIO GRANDE / DO NORTE)
  const fitL = (s, ser, size, room, ls) => tw(s, ser, ls) * size <= room || toks(s).length < 2 ? [s] : split(s, 2, ser, ls);
  const wL = (L, ser, size, ls) => Math.max(...L.map((l) => tw(l, ser, ls) * size));
  // federal route shield (João Pessoa photo; road-number pictures 422-424): white escutcheon, black edge, BR over the number
  const shieldBR = (x, y, h, road) => {
    const [p, n] = String(road).includes('-') ? String(road).split('-') : ['BR', String(road)], k = h / 100;
    return `<g transform="translate(${x},${y}) scale(${k})"><path d="M2,2 L84,2 L84,66 C84,84 62,92 43,98 C24,92 2,84 2,66 Z" fill="#fff" stroke="${INK}" stroke-width="3"/>` +
      `<path d="M8,47 L78,47" stroke="${INK}" stroke-width="2.5"/>` + T(43, 39, p, 30, HG('D'), { fill: INK, maxw: 66, max: 30 }) + T(43, 80, n, 30, HG('D'), { fill: INK, maxw: 66, max: 30 }) + '</g>';
  };
  // blue boundary board: LIMITE DE MUNICÍPIO(S) over a rule, the place entered on top, the one left below
  const limite = ({ name, next }, { head = 'LIMITE DE MUNICÍPIO', lower = false, arrows = false }) => {
    const cap = lower ? 44 : 40, ser = 'EM', ls = lower ? 0.02 : 0.05, size = cap / CAP, hs = 32 / CAP, hser = lower ? 'E' : 'D', hls = lower ? 0.03 : 0.08;
    const L = [name, next].map((s) => (lower ? clean(s) : up(clean(s))));
    const ax = arrows ? 90 : 0, room = 960, w = Math.max(...L.map((l) => tw(l, ser, ls) * size));
    const W = Math.round(Math.max(640, Math.min(room, w) + 2 * 50 + ax, tw(head, hser, hls) * hs + 80)), H = 312;
    const x = arrows ? 50 + ax : W / 2, o = { anchor: arrows ? 'start' : 'middle', fill: WH, ls, maxw: W - 100 - ax, max: size };
    return svg(W, H, brd(W, H, BR_B, true, 12) + T(W / 2, 74, head, hs, HG(hser), { fill: WH, ls: hls, maxw: W - 70, max: hs }) + rule(112, W) +
      T(x, 190, L[0], size, HG(ser), o) + T(x, 264, L[1], size, HG(ser), o) +
      // the photo's arrows are squat: a wide flat-backed head on a short broad shaft (TS.arrows)
      (arrows ? [[190, 0], [264, 180]].map(([y, deg]) => TS.arrows.dir(50 + 30, y - cap / 2, deg, 42, { w: 20, fill: WH, head: { half: 1.25, back: 1.45, neck: 1.45 } })).join('') : ''));
  };
  const br = [
    // picture 251: the places in lines, set flush toward the arrow, which stands beside the middle of them
    { id: 'orientacao', kind: 'direction', label: 'Destination board (green)', draw: ({ name, next }) => {
      const ser = 'EM', ls = 0.03, cap = 44, size = cap / CAP, L = [brName(name), brName(next)];
      const w = Math.max(...L.map((l) => tw(l, ser, ls))) * size, aw = 70;
      const W = Math.round(Math.max(420, Math.min(1100, 44 + w + 34 + aw + 30))), pitch = 86, H = Math.round(70 + pitch * (L.length - 1) + 74);
      const xr = W - 30 - aw - 34;
      return svg(W, H, brd(W, H, BR_G, false, 18) + L.map((l, i) => T(xr, 70 + cap / 2 + 20 + i * pitch, l, size, HG(ser), { anchor: 'end', fill: WH, ls, maxw: xr - 44, max: size })).join('') +
        harrow(W - 30 - aw / 2, H / 2, 45, 56, WH, ARW));
    } },
    // SP-103 photo (also Holambra, BR-367 and Bahia photos): one band per direction, split by white rules; the name with
    // its arrow on the right, the next place behind an arrow on the left
    { id: 'orientacao-faixas', kind: 'direction', label: 'Destination bands (green, small letters)', draw: ({ name, next }) => {
      const ser = 'EM', ls = 0.06, cap = 36, size = cap / CAP, aw = 62, a = brName(name), b = brName(next);
      const W = Math.round(Math.max(560, Math.min(1100, 40 + Math.max(tw(a, ser, ls), tw(b, ser, ls)) * size + 40 + aw + 36))), h = 104, H = 2 * h + 4;
      return svg(W, H, brd(W, H, BR_G, true, 10) + rule(h + 2, W) +
        T(42, h / 2 + cap / 2 + 2, a, size, HG(ser), { anchor: 'start', fill: WH, ls, maxw: W - 42 - 40 - aw - 36, max: size }) + harrow(W - 36 - aw / 2, h / 2 + 2, 45, 48, WH, ARW) +
        harrow(36 + aw / 2, h + h / 2 + 2, 0, 48, WH, ARW) + T(36 + aw + 36, h + h / 2 + cap / 2 + 2, b, size, HG(ser), { anchor: 'start', fill: WH, ls, maxw: W - 36 - aw - 36 - 42, max: size }));
    } },
    // BR-040 Cristalina photo (also the Rio Grande do Norte and Paraná photos): the older capitals; ahead behind an arrow
    // on the left, over a rule the name with its arrow on the right; a long name breaks into two lines
    { id: 'orientacao-maiusculas', kind: 'direction', label: 'Destination bands (green, capitals)', draw: ({ name, next }) => {
      const ser = 'D', ls = 0.07, cap = 42, size = cap / CAP, aw = 62, room = 760;
      const A = fitL(up(brName(next, 18)), ser, size, room, ls), B = fitL(up(brName(name, 18)), ser, size, room, ls);
      const W = Math.round(Math.max(560, 36 + aw + 32 + Math.min(room, wL(A, ser, size, ls)) + 40, 40 + Math.min(room, wL(B, ser, size, ls)) + 40 + aw + 36));
      const lh = cap * 1.55, h1 = 100 + (A.length - 1) * lh, h2 = 100 + (B.length - 1) * lh, H = h1 + h2 + 4;
      const lines = (L, x, cy, mw) => L.map((l, i) => T(x, cy - ((L.length - 1) * lh) / 2 + cap / 2 + i * lh, l, size, HG(ser), { anchor: 'start', fill: WH, ls, maxw: mw, max: size })).join('');
      return svg(W, H, brd(W, H, BR_G, true, 10) + harrow(36 + aw / 2, h1 / 2 + 2, 0, 46, WH, ARW) + lines(A, 36 + aw + 32, h1 / 2 + 2, W - 36 - aw - 32 - 40) +
        rule(h1 + 2, W) + lines(B, 40, h1 + 2 + h2 / 2, W - 40 - 40 - aw - 36) + harrow(W - 36 - aw / 2, h1 + 2 + h2 / 2 + (B.length - 1) * lh / 2 - (B.length > 1 ? cap / 2 : 0), 45, 46, WH, ARW));
    } },
    // Divisa DF/GO photo: places on the left, kilometres (number only) flush right
    // divisa: the two states at a state border ("DF/GO"), printed in a top band DIVISA … over a white rule, as on the photo;
    // without it the board has no band. km2 / next2 / km3: the real further distances and a third place, when known
    { id: 'distancia', kind: 'direction', label: 'Distance board (green)', draw: ({ name, next, km, km2, next2, km3, divisa }) => {
      const k2 = km2 ?? far(km);
      const ser = 'EM', ls = 0.02, cap = 36, size = cap / CAP, rows = [[brName(name), km], [brName(next), k2], ...(next2 ? [[brName(next2), km3 ?? far(k2)]] : [])];
      const nw = Math.max(...rows.map(([, k]) => tw(String(k), ser, ls))) * size, w = Math.max(...rows.map(([s]) => tw(s, ser, ls))) * size;
      const bcap = 40, bsize = bcap / CAP, band = divisa ? 94 : 0, y0 = divisa ? band + 62 : 80;
      const W = Math.round(Math.max(520, Math.min(1100, Math.max(34 + w + 50 + nw + 34, divisa ? 34 + (tw('DIVISA', 'E', 0.04) + tw(divisa, 'E', 0.04)) * bsize + 80 : 0)))), H = band + rows.length * 70 + 50 - (divisa ? 8 : 0);
      return svg(W, H, brd(W, H, BR_G, true, 10) +
        (divisa ? T(34, 68, 'DIVISA', bsize, HG('E'), { anchor: 'start', fill: WH, ls: 0.04 }) + T(W - 34, 68, String(divisa).toUpperCase(), bsize, HG('E'), { anchor: 'end', fill: WH, ls: 0.04 }) + rule(band, W) : '') +
        rows.map(([s, k], i) => T(34, y0 + i * 70, s, size, HG(ser), { anchor: 'start', fill: WH, ls, maxw: W - 34 - 50 - nw - 34, max: size }) +
        T(W - 34, y0 + i * 70, String(k), size, HG(ser), { anchor: 'end', fill: WH, ls })).join(''));
    } },
    // João Pessoa photo (also Delfim Moreira, Carvalhos and Brejões photos): one place, "A n km" under it, an arrow and
    // the route shield
    { id: 'distancia-a', kind: 'direction', label: 'Place and distance (green)', draw: ({ name, km, road }) => {
      const ser = 'EM', ls = 0.06, cap = 40, size = cap / CAP, s = brName(name), aw = 60;
      const W = Math.round(Math.max(560, Math.min(1100, 40 + aw + 40 + tw(s, ser, ls) * size + 44))), H = 330, cx = (40 + aw + 30 + W - 40) / 2;
      return svg(W, H, brd(W, H, BR_G, true, 10) + shieldBR(cx + 10, 24, 118, road) + harrow(40 + aw / 2, 212, 0, 52, WH, ARW) +
        T(cx, 228, s, size, HG(ser), { fill: WH, ls, maxw: W - 40 - aw - 30 - 40, max: size }) + T(cx, 298, `A ${km} km`, size, HG(ser), { fill: WH, ls }));
    } },
    // SAÍDA 310 photo (SP-255): exit number over a rule, the places centred, the arrow to the exit on the right
    // (its lettering is lighter than E(M): Series E widths and strokes, widely spaced; SAÍDA in Series D at 0.84 of that height)
    { id: 'saida', kind: 'motorway', label: 'Exit board (green)', draw: ({ name, next, exit }) => {
      const ser = 'E', ls = 0.1, cap = 38, size = cap / CAP, aw = 64, L = [brName(name), brName(next)];
      const w = Math.max(...L.map((l) => tw(l, ser, ls))) * size;
      const W = Math.round(Math.max(560, Math.min(1100, 60 + w + 40 + aw + 34))), H = 96 + 2 * 78 + 40, cx = (40 + W - 34 - aw - 30) / 2;
      return svg(W, H, brd(W, H, BR_G, true, 10) + T(W / 2, 66, `SAÍDA ${exit}`, 32 / CAP, HG('D'), { fill: WH, ls: 0.1 }) + rule(92, W) +
        L.map((l, i) => T(cx, 92 + 70 + i * 78, l, size, HG(ser), { fill: WH, ls, maxw: W - 40 - 34 - aw - 30, max: size })).join('') +
        harrow(W - 34 - aw / 2, 92 + 70 + 39 - cap / 2, 45, 48, WH, ARW));
    } },
    // Brazópolis / Paraisópolis and Delfim Moreira / Wenceslau Bráz photos (Minas Gerais); regional since the photos of
    // other states show other designs (RS: Restinga Seca, Tavares; BA: Maragojipe)
    { id: 'limite', kind: 'entry', label: 'Municipal boundary (blue)', regions: ['Minas Gerais'], draw: (o) => limite(o, {}) },
    // Restinga Seca / Santa Maria photo: the place ahead behind an up arrow, the one behind with a down arrow
    { id: 'limite-setas', kind: 'entry', label: 'Municipal boundary with arrows (blue)', regions: ['Rio Grande do Sul'], draw: (o) => limite(o, { arrows: true }) },
    // Maragojipe / São Félix photo: the names in small letters under LIMITE DE MUNICÍPIOS
    { id: 'limite-minusculas', kind: 'entry', label: 'Municipal boundary, small letters (blue)', regions: ['Bahia'], draw: (o) => limite(o, { head: 'LIMITE DE MUNICÍPIOS', lower: true }) },
    // Tavares / S. José do Norte photo (Rio Grande do Sul, fix group G): LIM. MUNICÍPIOS in capitals over a rule, the two
    // places in small letters set flush left from an indent, long names shortened (S. José do Norte)
    { id: 'limite-abreviado', kind: 'entry', label: 'Municipal boundary, LIM. MUNICÍPIOS (blue)', regions: ['Rio Grande do Sul'], draw: ({ name, next }) => {
      const ser = 'D', ls = 0, cap = 46, size = cap / CAP, hs = 44 / CAP, hls = 0.02, head = 'LIM. MUNICÍPIOS', L = [brName(name, 12), brName(next, 12)];   // narrow, tightly set letters (Series D); São shortened from 17 letters on, as S. José do Norte
      const w = Math.max(...L.map((l) => tw(l, ser, ls) * size)), hw = tw(head, 'D', hls) * hs;
      const W = Math.round(Math.max(600, Math.min(1100, w / 0.72), hw + 100)), H = 312, x = Math.round(W * 0.2);
      return svg(W, H, brd(W, H, BR_B, true, 10) + T(W / 2, 90, head, hs, HG('D'), { fill: WH, ls: hls, maxw: W - 70, max: hs }) + rule(110, W) +
        L.map((l, i) => T(x, 190 + i * 80, l, size, HG(ser), { anchor: 'start', fill: WH, ls, maxw: W - x - 40, max: size })).join(''));
    } },
    // urban direction board (Florianópolis photo, fix group G): in cities a destination such as a district or the centre
    // stands on a bright blue panel (streets on green, sights on brown panels stacked in the same white frame); the
    // panel sits in a white frame with rounded corners, the light letters set tight and flush right against the arrow at
    // the right end (a broad shaft, a big flat-backed head); via: the small "(Via …)" after the name, when given
    { id: 'orientacao-urbana', kind: 'direction', label: 'Urban direction board (blue)', draw: ({ name, via }) => {
      const ser = 'E', ls = 0, H = 160, f = 0.085 * H, cap = 0.33 * H, OV = HG('E'), size = cap / CAP, BLUE = '#1173df', LT = '#ececec';
      const s = brName(name, 22), v = via ? `(${via})` : '', vs = size * 0.62, aw = 0.68 * H, gap = 0.12 * H;
      // the photo's medium-weight round letters: Series E (E(M) is too heavy), at the font's own spacing
      const sw = tw(s, ser, ls) * size, vw = v ? tw(v, ser, ls) * 0.62 * size + 0.3 * cap : 0;
      const W = Math.round(Math.max(4.6 * H, Math.min(1400, 2 * f + 0.4 * H + sw + vw + gap + aw + 0.12 * H))), Ht = Math.round(H + 2 * f);
      const ax = W - f - 0.12 * H - aw / 2, xr = ax - aw / 2 - gap, cy = f + H / 2, mw = Math.round(xr - f - 0.3 * H);
      // name and via in one line, set flush right against the arrow, so they can never overlap
      return svg(W, Ht, `<rect x="1" y="1" width="${W - 2}" height="${Ht - 2}" rx="${0.07 * H}" fill="${LT}" stroke="#a9a9a9" stroke-width="1.5"/>` +
        `<rect x="${f}" y="${f}" width="${W - 2 * f}" height="${H}" rx="${0.035 * H}" fill="${BLUE}"/>` +
        `<text x="${xr.toFixed(1)}" y="${(cy + cap / 2).toFixed(1)}" font-family="${OV}" font-size="${size.toFixed(1)}" text-anchor="end" fill="${LT}" letter-spacing="${(ls * size).toFixed(1)}" data-ls="${ls}" data-maxw="${mw}" data-max="${size.toFixed(1)}">${TS.esc(s)}` +
        (v ? `<tspan font-size="62%"> ${TS.esc(v)}</tspan>` : '') + '</text>' +
        TS.arrows.dir(ax, cy, 90, aw, { w: 0.2 * H, fill: LT, head: { half: 1.5, back: 1.65, cut: 0, neck: 1.65 } }));
    } },
  ];
  TS.add('BR', br, { next: 'São Paulo', km: 12, road: 'BR-116', exit: 310 });
})();
