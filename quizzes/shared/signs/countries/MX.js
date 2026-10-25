// MX: Mexican signs carrying a place name, after the GeoHints pictures (see examples/MX.json).
// NOM-034-SCT2: destination signs (SID) green with white legend and border; identification signs (SII) white with black;
// letters of the SCT alphabets (Highway Gothic based; Serie 3 ~ FHWA D preferred); long legends may be abbreviated.
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
  const MX_G = '#006a4e', INK = '#141414';
  // abbreviations Mexican signs use when a legend is too long (SANTA CRUZ DE GPE), applied one by one until it fits
  const ABBR = [[/\bCIUDAD\b/, 'CD.'], [/\bGENERAL\b/, 'GRAL.'], [/\bGUADALUPE\b/, 'GPE'], [/\bSANTIAGO\b/, 'STGO.'], [/\bFRANCISCO\b/, 'FCO.'], [/\bNACIONAL\b/, 'NAL.'], [/\bSANTA\b/, 'STA.']];
  const abbr = (s, ser, size, maxw) => { for (const [re, a] of ABBR) { if (tw(s, ser) * size <= maxw) break; s = s.replace(re, a); } return s; };
  // federal route shield (SII-14 style): white, black edge, scalloped top, MEXICO band, number, D for toll roads
  const shield = (x, y, h, road) => {
    const m = String(road).match(/^(\d+)\s*(D?)$/i) || [0, road, ''], k = h / 120, num = m[1], d = m[2].toUpperCase();
    return `<g transform="translate(${x},${y}) scale(${k})">` +
      `<path d="M4,22 C14,10 22,8 30,13 C38,4 62,4 70,13 C78,8 86,10 96,22 L96,70 C96,92 74,106 50,118 C26,106 4,92 4,70 Z" fill="#fff"/>` +
      `<path d="M9,25 C17,16 24,15 31,19 C40,11 60,11 69,19 C76,15 83,16 91,25 L91,70 C91,89 71,101 50,112 C29,101 9,89 9,70 Z" fill="none" stroke="#000" stroke-width="2.6"/>` +
      `<line x1="9" y1="40" x2="91" y2="40" stroke="#000" stroke-width="2.2"/>` +
      T(50, 37, 'MEXICO', 15.5, HG('D'), { fill: '#000', maxw: 76, max: 15.5 }) +
      T(50, d ? 84 : 90, num, d ? 44 : 50, HG(num.length > 2 ? 'C' : 'D'), { fill: '#000', maxw: 74, max: d ? 44 : 50 }) +
      (d ? T(50, 104, d, 20, HG('D'), { fill: '#000' }) : '') + '</g>';
  };
  // a white (SII) or green (SID) town board: as long as its legend (h and m in cap heights), abbreviated past maxW units, two lines past that
  const board = (name, { fill, ink, ser, cap, h, m: mc, inset, line, maxW = 1040 }) => {
    const size = cap / CAP, m = cap * mc, maxT = maxW - 2 * m;
    const full = clean(name).toUpperCase(), s = abbr(full, ser, size, maxT), fits = (L) => Math.max(...L.map((l) => tw(l, ser) * size)) <= maxT;
    // one line, abbreviated if that is enough; else two lines, written out in full when they fit
    const L = tw(s, ser) * size <= maxT ? [s] : fits(split(full, 2, ser)) ? split(full, 2, ser) : split(s, 2, ser);
    const tW = Math.max(...L.map((l) => tw(l, ser) * size)), W = Math.round(Math.max(cap * 4.2, Math.min(maxW, tW + 2 * m))), H = Math.round(cap * h + (L.length - 1) * cap * 2.0);
    return svg(W, H, `<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="${cap * 0.16}" fill="${fill}" stroke="#9a9a9a" stroke-width="1.5"/>` +
      `<rect x="${cap * inset}" y="${cap * inset}" width="${W - 2 * cap * inset}" height="${H - 2 * cap * inset}" rx="${cap * 0.1}" fill="none" stroke="${ink}" stroke-width="${cap * line}"/>` +
      block(L, size, W / 2, H / 2, HG(ser), { fill: ink, maxw: W - 2 * m, gap: 1.6 * CAP }));
  };
  const mx = [
    { id: 'poblacion', kind: 'entry', label: 'Town name board (white)', draw: ({ name }) => board(name, { fill: '#fafafa', ink: INK, ser: 'B', cap: 70, h: 2.75, m: 0.42, inset: 0.09, line: 0.05 }) },
    { id: 'poblacion-verde', kind: 'entry', label: 'Town name board (green)', draw: ({ name }) => board(name, { fill: MX_G, ink: '#fff', ser: 'E', cap: 80, h: 2.0, m: 0.95, inset: 0.07, line: 0.045, maxW: 1400 }) },
    { id: 'destino', kind: 'direction', label: 'Destination sign with route shields', draw: ({ name, next, road }) => {
      const cap = 44, size = cap / CAP, sh = 104, sw = sh * 100 / 120, bh = 160, gap = 10;
      const a = abbr(clean(name).toUpperCase(), 'D', size, 760), b = abbr(clean(next).toUpperCase(), 'D', size, 760);
      const ta = tw(a, 'D') * size, tb = tw(b, 'D') * size;
      const W = Math.round(Math.max(640, 26 + ta + 34 + 64 + 22 + sw + 22, 22 + sw + 22 + 64 + 30 + tb + 26));
      const plate = (y) => `<rect x="1.5" y="${y + 1.5}" width="${W - 3}" height="${bh - 3}" rx="8" fill="${MX_G}"/><rect x="6" y="${y + 6}" width="${W - 12}" height="${bh - 12}" rx="5" fill="none" stroke="#fff" stroke-width="2.5"/>`;
      return svg(W, bh * 2 + gap, plate(0) + plate(bh + gap) +
        T(26, bh / 2 + cap / 2, a, size, HG('D'), { anchor: 'start', fill: '#fff', maxw: W - 26 - 34 - 64 - 22 - sw - 22, max: size }) +
        harrow(W - 22 - sw - 22 - 36, bh / 2, 45, 60, '#fff', { shaft: 0.36 }) + shield(W - 22 - sw, (bh - sh) / 2, sh, road) +
        shield(22, bh + gap + (bh - sh) / 2, sh, road) + harrow(22 + sw + 22 + 32, bh + gap + bh / 2, 0, 62, '#fff', { shaft: 0.36 }) +
        T(22 + sw + 22 + 64 + 30, bh + gap + bh / 2 + cap / 2, b, size, HG('D'), { anchor: 'start', fill: '#fff', maxw: W - (22 + sw + 22 + 64 + 30) - 26, max: size }));
    } },
    // distance sign (Commons photo on Mex-1 in Baja California: TIJUANA 871): one green plate; the federal route shield
    // stands on it at the left end, outside the white border line, which frames the destination in capitals and its
    // distance in km at the right end; a long name is abbreviated the Mexican way, then broken into two lines.
    // The shield is the Commons drawing "Carretera federal XX.svg" (public domain, by Fredddie, after the Mexican
    // Manual de dispositivos; https://commons.wikimedia.org/wiki/File:Carretera_federal_XX.svg): its outline, black rim
    // with the MEXICO band, and the MEXICO letters as paths; the number is set in Series D (C from three figures)
    { id: 'distancia', kind: 'direction', label: 'Distance sign (green)', draw: ({ name, km, road }) => {
      const SH = {"rim": "M 106.25,0 0,106.25 0,371.97 C 13.59,395.43 21.38,422.68 21.38,451.75 21.38,480.82 13.59,508.03 0,531.5 0,783.46 168.31,996.08 398.62,1063.12 628.94,996.08 797.25,783.45 797.25,531.5 c -13.59,-23.47 -21.38,-50.68 -21.38,-79.75 0,-29.07 7.79,-56.32 21.38,-79.78 L 797.25,106.25 690.97,0 C 649.03,27.68 598.79,43.78 544.78,43.78 490.78,43.78 440.56,27.67 398.62,0 398.62,0.00 398.60,-0.00 398.59,0 356.66,27.68 306.44,43.78 252.44,43.78 198.43,43.78 148.19,27.68 106.25,0 z", "band": "m 398.59,41.41 c -43.29,24.07 -93.11,37.81 -146.16,37.81 -50.75,0 -98.58,-12.55 -140.53,-34.72 l -76.47,76.47 0,242 c 13.65,26.63 21.38,56.80 21.38,88.78 0,31.98 -7.72,62.16 -21.38,88.78 l 0.03,0.06 -0.03,0 c 0,231.68 152.03,418.77 361.78,485.06 l 1.41,0.22 1.41,-0.22 C 609.77,959.36 761.81,772.27 761.81,540.59 748.14,513.95 740.44,483.75 740.44,451.75 c 0,-32.00 7.71,-62.20 21.38,-88.84 l 0,-241.94 -76.5,-76.5 c -41.96,22.17 -89.78,34.75 -140.53,34.75 -53.06,0 -102.89,-13.73 -146.19,-37.81 z M 398.5,81.25 c 44.24,21.38 93.85,33.41 146.28,33.41 47.32,0 92.36,-9.78 133.22,-27.41 l 48.38,48.38 0,201 -655.5,0 0,-201 48.66,-48.66 c 40.84,17.62 85.88,27.41 133.19,27.41 52.23,0 101.67,-11.90 145.78,-33.12 z m -320.44,290.81 641.12,0 C 710.03,396.90 705,423.74 705,451.75 c 0,34.64 7.68,67.47 21.38,96.94 0.00,0.01 -0.00,0.02 0,0.03 -0.01,211.80 -136.43,374.66 -326.19,439.59 -0.77,0.35 -0.62,0.16 -2.07,0.66 -2.66,-1.19 -2.84,-1.11 -4.87,-2.00 C 205.47,921.16 70.88,759.08 70.88,548.69 84.57,519.22 92.22,486.38 92.22,451.75 c 0,-28.01 -5.00,-54.85 -14.16,-79.69 z", "mexico": ["m 276.31,505.24 0,-104.66 -21.09,66.17 -21.62,-66.17 0,104.66 -22.41,0 0,-176.64 22.41,0 21.62,62.48 21.09,-62.48 22.15,0 0,176.64 -22.15,0", "m 336.83,505.24 0,-176.64 65.12,0 0,22.94 -42.71,0 0,45.35 28.47,0 0,23.46 -28.47,0 0,61.96 45.08,0 0,22.94 -67.49,0", "m 480.34,505.24 -17.40,-53.26 -17.14,53.26 -24.25,0 29.79,-90.43 -28.47,-86.21 24.78,0 15.29,49.04 16.35,-49.04 23.99,0 -28.47,86.21 29.79,90.43 -24.25,0", "m 532.50,505.24 0,-176.64 22.41,0 0,176.64 -22.41,0", "m 664.43,463.58 c -9e-5,3.52 -0.09,6.42 -0.26,8.70 -9e-5,2.28 -0.09,4.31 -0.26,6.06 -0.18,1.58 -0.44,3.08 -0.79,4.48 -0.35,1.41 -0.79,2.90 -1.32,4.48 -1.41,6.50 -4.92,11.69 -10.55,15.55 -5.62,3.69 -12.39,5.54 -20.30,5.54 -8.96,0 -16.35,-1.85 -22.15,-5.54 -5.62,-3.87 -9.84,-9.93 -12.65,-18.19 -2.46,-7.38 -4.31,-16.87 -5.54,-28.47 -1.23,-11.78 -1.85,-24.78 -1.85,-39.02 -2e-5,-4.04 0.09,-8.44 0.26,-13.18 0.18,-4.75 0.44,-9.49 0.79,-14.24 0.53,-4.92 1.05,-9.58 1.58,-13.97 0.53,-4.39 1.14,-8.35 1.85,-11.86 2.28,-13.53 6.24,-23.20 11.86,-29.00 5.80,-5.80 13.97,-8.70 24.52,-8.70 10.02,1.8e-4 18.10,2.99 24.25,8.96 6.15,5.80 9.67,14.15 10.55,25.05 l -22.94,0 c -0.35,-3.69 -1.58,-6.42 -3.69,-8.17 -1.93,-1.93 -4.39,-2.90 -7.38,-2.90 -4.04,1.6e-4 -7.21,1.41 -9.49,4.22 -2.28,2.81 -4.13,7.12 -5.54,12.92 -0.88,3.52 -1.58,7.12 -2.11,10.81 -0.35,3.52 -0.70,7.29 -1.05,11.34 -0.18,3.87 -0.35,8.17 -0.53,12.92 -3e-5,4.75 -3e-5,10.02 0,15.82 -3e-5,6.15 -3e-5,11.60 0,16.35 0.18,4.57 0.35,8.79 0.53,12.65 0.35,3.69 0.70,7.29 1.05,10.81 0.53,3.34 1.23,6.85 2.11,10.55 1.41,5.80 3.16,10.28 5.27,13.45 2.28,2.99 5.27,4.48 8.96,4.48 4.04,2e-5 7.03,-1.67 8.96,-5.01 1.93,-3.34 2.90,-8.96 2.90,-16.87 l 22.94,0 0,0", "m 774.51,416.65 c -1e-4,4.75 -1e-4,10.37 0,16.87 -1e-4,6.33 -0.35,12.92 -1.05,19.77 -0.53,6.85 -1.58,13.62 -3.16,20.30 -1.41,6.50 -3.69,12.39 -6.85,17.66 -2.99,5.10 -6.94,9.23 -11.86,12.39 -4.75,3.16 -10.72,4.75 -17.93,4.75 -7.38,0 -13.53,-1.58 -18.45,-4.75 -4.75,-3.16 -8.70,-7.29 -11.86,-12.39 -2.99,-5.27 -5.27,-11.16 -6.85,-17.66 -1.41,-6.68 -2.37,-13.45 -2.90,-20.30 -0.53,-6.85 -0.79,-13.45 -0.79,-19.77 -1e-5,-6.33 -1e-5,-11.95 0,-16.87 -1e-5,-5.10 -1e-5,-10.81 0,-17.14 -1e-5,-6.50 0.26,-13.09 0.79,-19.77 0.70,-6.68 1.85,-13.18 3.43,-19.51 1.58,-6.50 3.87,-12.22 6.85,-17.14 2.99,-5.10 6.85,-9.14 11.60,-12.13 4.92,-3.16 10.98,-4.75 18.19,-4.75 7.21,1.8e-4 13.18,1.58 17.93,4.75 4.92,2.99 8.88,7.03 11.86,12.13 3.16,5.10 5.45,10.90 6.85,17.40 1.58,6.33 2.64,12.83 3.16,19.51 0.70,6.68 1.05,13.27 1.05,19.77 -1e-4,6.33 -1e-4,11.95 0,16.87 m -23.46,0 c -7e-5,-2.46 -0.09,-5.80 -0.26,-10.02 -7e-5,-4.22 -0.18,-8.79 -0.53,-13.71 -0.35,-5.10 -0.88,-10.19 -1.58,-15.29 -0.70,-5.27 -1.76,-10.02 -3.16,-14.24 -1.23,-4.22 -2.81,-7.65 -4.75,-10.28 -1.93,-2.64 -4.31,-3.95 -7.12,-3.95 -3.34,1.6e-4 -6.15,1.41 -8.44,4.22 -2.11,2.64 -3.87,6.15 -5.27,10.55 -1.23,4.22 -2.20,8.96 -2.90,14.24 -0.53,5.27 -0.97,10.46 -1.32,15.55 -0.18,4.92 -0.26,9.49 -0.26,13.71 0.18,4.04 0.26,7.12 0.26,9.23 -4e-5,1.93 -0.09,5.01 -0.26,9.23 -4e-5,4.04 0.09,8.61 0.26,13.71 0.35,5.10 0.79,10.37 1.32,15.82 0.70,5.45 1.67,10.37 2.90,14.76 1.41,4.39 3.16,8.08 5.27,11.07 2.28,2.81 5.10,4.22 8.44,4.22 3.34,2e-5 6.06,-1.41 8.17,-4.22 2.11,-2.99 3.78,-6.68 5.01,-11.07 1.41,-4.39 2.37,-9.32 2.90,-14.76 0.53,-5.45 0.88,-10.72 1.05,-15.82 0.35,-5.10 0.44,-9.67 0.26,-13.71 -7e-5,-4.22 -7e-5,-7.29 0,-9.23"]};
      const fed = (x, y, h, n) => { const k = h / 1064.13, num = String(n), big = num.replace(/\D/g, '').length > 2;
        return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${k.toFixed(5)})"><g transform="translate(0.5,0.5)"><path d="${SH.rim}" fill="#fff" stroke="#000" stroke-width="3"/><path d="${SH.band}" fill="#000"/></g>` +
          `<g transform="translate(-90.93,-189)" fill="#000">${SH.mexico.map((d) => `<path d="${d}"/>`).join('')}</g>` + T(399, 840, num, 520, HG(big ? 'C' : 'D'), { fill: '#000', maxw: 540, max: 520 }) + '</g>'; };
      const H1 = 140, cap = 66, size = cap / CAP, ser = 'D', ls = 0.04, k = String(km), maxT = 1250;
      const full = clean(name).toUpperCase(), s = abbr(full, ser, size, maxT), w = (t) => tw(t, ser, ls) * size;
      const L = w(s) <= maxT ? [s] : split(full, 2, ser, ls).every((l) => w(l) <= maxT) ? split(full, 2, ser, ls) : split(s, 2, ser, ls);
      const n = L.length, pitch = 1.65 * cap, H = Math.round(H1 + (n - 1) * pitch);
      const shH = road ? 0.9 * H1 : 0, shW = shH * 798.25 / 1064.13, bx = road ? 0.06 * H1 + shW + 0.05 * H1 : 8;
      const kw = w(k), tW = Math.max(...L.map(w)), x0 = bx + 0.28 * H1;
      const W = Math.round(x0 + Math.min(tW, maxT) + 0.32 * H1 + kw + 0.3 * H1);
      const y0 = H / 2 - ((n - 1) * pitch) / 2 + cap / 2;
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${MX_G}" stroke="#6f8f80" stroke-width="1.5"/>` +
        (road ? fed(0.06 * H1, (H - shH) / 2, shH, road) : '') +
        `<rect x="${bx.toFixed(1)}" y="8" width="${(W - bx - 8).toFixed(1)}" height="${H - 16}" rx="6" fill="none" stroke="#fff" stroke-width="3.5"/>` +
        L.map((l, i) => T(x0, y0 + i * pitch, l, size, HG(ser), { anchor: 'start', fill: '#fff', ls, maxw: W - x0 - 0.32 * H1 - kw - 0.3 * H1, max: size })).join('') +
        T(W - 0.3 * H1, H / 2 + cap / 2, k, size, HG(ser), { anchor: 'end', fill: '#fff', ls }));
    } },
  ];
  TS.add('MX', mx, { next: 'Veracruz', km: 12, road: '150D' });
})();
