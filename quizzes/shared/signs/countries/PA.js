// PA: Panamanian signs carrying a place name, drawn from photos (GeoHints direction signs 238, 239 and Commons photos;
// see examples/PA.json). Green destination boards with white capitals, white border line and a PANAMA route shield;
// blue finger boards with bold narrow capitals. Capitals drop accents as on the pictures (PANAMA); Ñ is kept.
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
  const PA_G = '#0f6b4b', PA_B = '#2378c0', INK = '#161616';
  const NARROW = "'Archivo Narrow','Arial Narrow',sans-serif";
  const caps = (n) => clean(n).toUpperCase().normalize('NFD').replace(/[̀́]/g, '').normalize('NFC');
  // route shield (pictures 238, road-number 378): white, black edge line, top band with PANAMA, the number below
  // (group D) the Commons drawing of the shield (shared/shields.js), 0.9 h high in the h box so that it stays 0.9 h wide
  const shield = (x, y, h, road) => TS.shields.caRoute(x, y + h * 0.05, h * 0.9, road, { country: 'PA', ink: INK, font: HG(String(road).length > 2 ? 'C' : 'D'), capEm: CAP });
  const ARW = { len: 1.3, shaft: 0.36, head: 0.58 };   // the short, heavy arrows of picture 238
  const LS = 0.07;   // the open letter spacing of the green boards
  // one destination row of a green board: one line up to `room` wide, else two lines a size smaller
  const row = (s, cap, room, ser = 'E') => { const size = cap / CAP;
    if (tw(s, ser, LS) * size <= room || toks(s).length < 2) return { L: [s], size };
    const L = split(s, 2, ser, LS); return { L, size: Math.min(size * 0.82, room / Math.max(...L.map((l) => tw(l, ser, LS)))) }; };
  const rowW = (r, ser = 'E') => Math.max(...r.L.map((l) => tw(l, ser, LS) * r.size));
  const pa = [
    // picture 238: two rows; the first with an up arrow on the left and the route shield on the right, the second with
    // an arrow to the right; names centred in the room between
    { id: 'destino', kind: 'direction', label: 'Destination board, route shield (green)', draw: ({ name, next, road }) => {
      const cap = 42, sh = 100, sw = sh * 0.9, ra = row(caps(name), cap, 760), rb = row(caps(next), cap, 760);
      const pad = 30, a1 = 64, a2 = 84;   // arrow columns
      const W = Math.round(Math.max(640, pad + a1 + 26 + rowW(ra) + 26 + sw + pad, pad + 10 + rowW(rb) + 26 + a2 + pad));
      const h1 = 150 + (ra.L.length - 1) * 52, h2 = 140 + (rb.L.length - 1) * 52, H = h1 + h2;
      const y1 = 14 + (h1 - 14) / 2 + 4, y2 = h1 + (h2 - 14) / 2 - 6;
      const x1a = pad + a1 + 26, x1b = W - pad - sw - 26, x2a = pad + 10, x2b = W - pad - a2 - 26;
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${PA_G}"/>` +
        `<rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="9" fill="none" stroke="#f2f2f2" stroke-width="5"/>` +
        harrow(pad + a1 / 2 + 8, y1, 0, 46, '#f2f2f2', ARW) + shield(W - pad - sw, y1 - sh / 2, sh, road) +
        block(ra.L, ra.size, (x1a + x1b) / 2, y1, HG('E'), { fill: '#f2f2f2', ls: LS, maxw: x1b - x1a, gap: 1.2 }) +
        block(rb.L, rb.size, (x2a + x2b) / 2, y2, HG('E'), { fill: '#f2f2f2', ls: LS, maxw: x2b - x2a, gap: 1.2 }) +
        harrow(W - pad - a2 / 2 - 6, y2, 90, 46, '#f2f2f2', ARW));
    } },
    // picture 239: one blue board per destination, the name in bold narrow capitals filling the board, a thin arrow
    // under its right end, white edge line
    { id: 'municipal', kind: 'direction', label: 'Finger boards (blue)', draw: ({ name, next }) => {
      const cap = 74, size = cap / 0.686, gap = 22, em = 0.56, top = 18;   // Archivo Narrow: cap 0.686 em, ascent 1.035 em
      const fit = (s) => ([...s].length * em * size <= 1100 || toks(s).length < 2 ? { L: [s], size } : { L: split(s, 2, "C"), size: size * 0.8 });
      const ra = fit(caps(name)), rb = fit(caps(next));
      const textW = (r) => Math.max(...r.L.map((l) => [...l].length * em * r.size));
      const W = Math.round(Math.min(1160, Math.max(540, 60 + Math.max(textW(ra), textW(rb)))));
      const board = (y, r) => {
        const lh = r.size * 0.86, h = 158 + (r.L.length - 1) * lh, ty = y + 24 + 0.686 * r.size;
        return { h, s: `<rect x="1" y="${y + 1}" width="${W - 2}" height="${h - 2}" rx="5" fill="${PA_B}"/>` +
          `<rect x="7" y="${y + 7}" width="${W - 14}" height="${h - 14}" rx="3" fill="none" stroke="#f4f4f4" stroke-width="4"/>` +
          r.L.map((l, i) => T(W / 2, ty + i * lh, l, r.size, NARROW, { fill: '#f4f4f4', weight: 'bold', maxw: W - 56, max: r.size })).join('') +
          `<path d="M${W - 140},${y + h - 25} L${W - 52},${y + h - 25}" stroke="#f4f4f4" stroke-width="7"/><path d="M${W - 58},${y + h - 37} L${W - 34},${y + h - 25} L${W - 58},${y + h - 13} Z" fill="#f4f4f4"/>` };
      };
      // the first board sits a little down so the font's ascent stays inside the drawing
      const A = board(top, ra), B = board(top + A.h + gap, rb);
      return svg(W, Math.round(top + A.h + gap + B.h), A.s + B.s);
    } },
    // Pedasí photo: one green plate per place, an up arrow on the left, the name centred after it
    { id: 'placas', kind: 'direction', label: 'Direction plates (green)', draw: ({ name, next }) => {
      const ser = 'C', ls = 0.02, cap = 48, size = cap / CAP, h = 104, gap = 10, aw = 60, L = [caps(next), caps(name)];
      const W = Math.round(Math.max(600, Math.min(1000, 30 + aw + 30 + Math.max(...L.map((l) => tw(l, ser, ls))) * size + 40)));
      const plate = (y, s) => `<rect x="1" y="${y + 1}" width="${W - 2}" height="${h - 2}" rx="7" fill="${PA_G}"/><rect x="6" y="${y + 6}" width="${W - 12}" height="${h - 12}" rx="5" fill="none" stroke="#f2f2f2" stroke-width="3.5"/>` +
        // Pedasí photo: a thick-chevron head (barb ends cut square to the barbs) on a thin shaft, 0.65 of the plate's height
        TS.arrows.dir(30 + aw / 2, y + h / 2, 0, 68, { w: 17, fill: '#f2f2f2', head: { half: 2.05, back: 2.0, cut: 0.64, drop: 0.64, neck: 1.73 } }) + T((30 + aw + 20 + W - 30) / 2, y + h / 2 + cap / 2, s, size, HG(ser), { fill: '#f2f2f2', ls, maxw: W - 30 - aw - 20 - 30, max: size });
      return svg(W, 2 * h + gap, plate(0, L[0]) + plate(h + gap, L[1]));
    } },
    // La Mochila photo (Colón): a rounded green plate, the name over its distance in KM. with the arrow after it; these
    // plates keep the accents (VIENTO FRÍO)
    { id: 'distancia-placa', kind: 'direction', label: 'Distance plate (green)', draw: ({ name, km }) => {
      const ser = 'C', ls = 0, cap = 40, size = cap / CAP, s = clean(name).toUpperCase(), L = tw(s, ser, ls) * size > 640 && toks(s).length > 1 ? split(s, 2, ser, ls) : [s];
      const w = Math.max(...L.map((l) => tw(l, ser, ls))) * size, W = Math.round(Math.max(420, Math.min(700, w) + 60)), lh = cap * 1.45, H = Math.round(176 + (L.length - 1) * lh);
      const ks = `${km} KM.`, kw = tw(ks, ser, ls) * size, by = H - 46;
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="16" fill="${PA_G}"/><rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="11" fill="none" stroke="#f2f2f2" stroke-width="4"/>` +
        L.map((l, i) => T(W / 2, 70 + i * lh, l, size, HG(ser), { fill: '#f2f2f2', ls, maxw: W - 50, max: size })).join('') +
        T(W / 2 - 50, by, ks, size, HG(ser), { fill: '#f2f2f2', ls }) + harrow(W / 2 - 50 + kw / 2 + 60, by - cap / 2, 90, 40, '#f2f2f2', { len: 1.9, shaft: 0.22, head: 0.5 }));
    } },
  ];
  TS.add('PA', pa, { next: 'Penonomé', km: 12, road: '1' });
})();
