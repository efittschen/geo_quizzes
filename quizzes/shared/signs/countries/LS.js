// LS: Lesotho. SADC Road Traffic Signs Manual: green guide signs, DIN 1451 lettering (Alte DIN 1451 Mittelschrift stands in),
// blue place-name signs. Drawn after the GeoHints pictures listed in examples/LS.json.
(function () {
  const { T, svg } = TS;
  const SADC_LS = 0.11;
  // ---- AF kit: the same block in each of the nine African files (BW GH KE LS NA NG SN TN UG), so each file stands alone ----
  const AF = (() => {
    // advance widths (1/1000 em) of CH in the fonts used, measured from the font files: sign widths and line breaks
    // are worked out from them; TS.fitDOM then sizes each text exactly in the real font
    const CH = " -'.&()0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const WT = {
      din: [240, 407, 240, 240, 648, 278, 278, 480, 337, 480, 480, 480, 480, 484, 480, 480, 494, 623, 610, 556, 630, 556, 537, 610, 648, 258, 481, 630, 556, 758, 684, 610, 593, 610, 610, 574, 500, 630, 556, 832, 536, 500, 519, 480, 519, 444, 519, 498, 278, 519, 537, 240, 258, 519, 258, 852, 537, 500, 519, 519, 389, 480, 278, 537, 444, 722, 480, 444, 444],
      arimo: [278, 333, 238, 278, 722, 333, 333, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500],
      narrow: [228, 273, 195, 228, 592, 273, 273, 456, 456, 456, 456, 456, 456, 456, 456, 456, 456, 592, 592, 592, 592, 547, 501, 638, 592, 228, 456, 592, 501, 683, 592, 638, 547, 638, 592, 547, 501, 592, 547, 774, 547, 547, 501, 456, 501, 456, 501, 456, 273, 501, 501, 228, 228, 456, 228, 729, 501, 501, 501, 501, 319, 456, 273, 501, 456, 638, 456, 456, 410],
      over: [245, 410, 235, 237, 700, 362, 362, 652, 391, 612, 600, 636, 614, 608, 532, 623, 608, 704, 679, 642, 701, 616, 570, 684, 714, 292, 554, 692, 564, 808, 715, 725, 636, 725, 682, 608, 596, 704, 672, 845, 653, 670, 643, 547, 572, 528, 572, 551, 352, 572, 582, 273, 273, 550, 281, 866, 582, 564, 574, 572, 408, 484, 388, 582, 542, 737, 557, 555, 530],
      l1: [375, 647, 300, 301, 1579, 400, 400, 691, 465, 670, 647, 700, 663, 674, 626, 654, 674, 721, 641, 667, 662, 623, 607, 691, 662, 322, 620, 662, 581, 838, 662, 691, 663, 691, 668, 700, 623, 662, 725, 940, 719, 746, 662, 721, 641, 667, 662, 623, 607, 691, 662, 322, 620, 662, 581, 838, 662, 691, 663, 691, 668, 700, 623, 662, 725, 940, 719, 746, 662],
      rge: [342, 235, 151, 154, 573, 271, 270, 627, 303, 541, 541, 617, 541, 575, 543, 541, 541, 629, 575, 577, 589, 541, 524, 577, 610, 250, 532, 565, 524, 684, 610, 594, 554, 593, 575, 541, 475, 610, 578, 651, 575, 629, 529, 425, 437, 404, 438, 411, 251, 440, 449, 207, 226, 405, 206, 688, 450, 434, 441, 440, 326, 389, 276, 448, 428, 568, 417, 462, 397],
      rgd: [342, 235, 150, 148, 567, 271, 270, 519, 270, 503, 546, 507, 503, 503, 467, 503, 503, 518, 486, 503, 514, 451, 440, 503, 526, 229, 451, 495, 440, 582, 526, 519, 474, 519, 486, 446, 387, 526, 468, 542, 446, 522, 446, 406, 437, 390, 434, 396, 240, 435, 445, 211, 246, 437, 207, 674, 445, 415, 437, 434, 286, 306, 239, 443, 426, 667, 445, 447, 321],
      dinc: [175, 351, 171, 175, 514, 271, 271, 408, 293, 396, 398, 427, 405, 399, 381, 409, 399, 484, 455, 468, 463, 406, 410, 468, 460, 214, 266, 460, 366, 570, 474, 468, 434, 468, 460, 426, 385, 460, 448, 674, 414, 414, 358, 404, 409, 406, 409, 410, 286, 409, 409, 205, 205, 419, 239, 621, 409, 410, 409, 409, 306, 392, 302, 409, 408, 608, 380, 408, 384],
    };
    const F = {
      din: "'Alte DIN 1451 Mittelschrift','D-DIN','DIN 1451 Mittelschrift',sans-serif",   // SADC: DIN 1451
      arimo: "'Arimo','Helvetica Neue',Arial,sans-serif",                               // Helvetica / Arial look
      narrow: "'Archivo Narrow','Arial Narrow',sans-serif",                               // Helvetica Condensed look
      over: "'Overpass','Transport',sans-serif",                                          // stands in for Transport Medium
      l1: "'Typoroute L1','Caracteres L1',sans-serif",                                    // French capitals (Caractères L1)
      rge: "'RG2014 Series E','Highway Gothic',sans-serif",                               // FHWA Series E
      rgd: "'RG2014 Series D','Highway Gothic',sans-serif",                               // FHWA Series D
      dinc: "'DINish Condensed','D-DIN Condensed',sans-serif",                            // narrow DIN (bold)
      ar: "'Noto Naskh Arabic',serif",                                                    // Arabic (Naskh)
    };
    const base = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
    // the width of s in em in font f, with letter spacing ls (em) after each character; Arabic is estimated
    const em = (s, f, ls = 0) => [...base(s)].reduce((a, c) => {
      if (f === 'ar') return a + (c === ' ' ? 0.25 : c === '\u0640' ? 0.3 : /[\u064b-\u0652]/.test(c) ? 0 : 0.43) + ls;   // Noto Naskh, measured on the Tunisian names
      const w = WT[f][CH.indexOf(c === '\u2019' ? "'" : c)];
      return a + (w > 0 ? w : 560) / 1000 + ls;
    }, 0);
    // the best way to put s on k lines (cut after a space or a hyphen): the split whose widest line is narrowest
    const split = (s, f, k, ls) => {
      if (k <= 1) return { w: em(s, f, ls), lines: [s] };
      let best = { w: em(s, f, ls), lines: [s] };
      for (let i = 1; i < s.length; i++) {
        if (s[i - 1] !== ' ' && s[i - 1] !== '-') continue;
        const a = s.slice(0, i).trim(), rest = split(s.slice(i).trim(), f, k - 1, ls);
        const w = Math.max(em(a, f, ls), rest.w);
        if (w < best.w - 1e-6) best = { w, lines: [a, ...rest.lines] };
      }
      return best;
    };
    // s on as few lines as needed (up to n) so that no line is wider than maxEm
    const wrap = (s, f, maxEm, n = 2, ls = 0) => {
      let r = split(s, f, 1, ls);
      for (let k = 2; k <= n && r.w > maxEm; k++) r = split(s, f, k, ls);
      return r.lines;
    };
    // one size for all lines of a wrapped name: the largest (up to S) at which the widest line fits maxw
    const fitLines = (lines, f, maxw, S, ls = 0) => Math.min(S, maxw / Math.max(...lines.map((l) => em(l, f, ls))));
    // a solid sign arrow (shaft + triangular head) centred on x,y: length L, head width H, angle deg (0 right, 90 down, 180 left, 270 up)
    const arrow = (x, y, deg, L, H, fill, t = 0.36, hl = 0.62) => {
      const s = (H * t) / 2, h = H * hl;
      return `<path transform="translate(${x},${y}) rotate(${deg})" d="M${-L / 2},${-s}H${L / 2 - h}V${-H / 2}L${L / 2},0L${L / 2 - h},${H / 2}V${s}H${-L / 2}Z" fill="${fill}"/>`;
    };
    // a diagram arm from (x1,y1) to (x2,y2), w wide, ending in a point (British-style junction diagrams)
    const tip = (x1, y1, x2, y2, w, fill, k = 1.0) => {
      const d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d, nx = -uy * w / 2, ny = ux * w / 2;
      const bx = x2 - ux * w * k, by = y2 - uy * w * k;
      return `<path d="M${x1 + nx},${y1 + ny}L${bx + nx},${by + ny}L${x2},${y2}L${bx - nx},${by - ny}L${x1 - nx},${y1 - ny}Z" fill="${fill}"/>`;
    };
    // a diagram arm ending in a wide arrowhead (French-style diagrams)
    const head = (x1, y1, x2, y2, w, fill, hw = 2.6, hl = 2.2) => {
      const d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d, nx = -uy, ny = ux;
      const bx = x2 - ux * w * hl, by = y2 - uy * w * hl, a = w / 2, b = (w * hw) / 2;
      return `<path d="M${x1 + nx * a},${y1 + ny * a}L${bx + nx * a},${by + ny * a}L${bx + nx * b},${by + ny * b}L${x2},${y2}L${bx - nx * b},${by - ny * b}L${bx - nx * a},${by - ny * a}L${x1 - nx * a},${y1 - ny * a}Z" fill="${fill}"/>`;
    };
    const bar = (x1, y1, x2, y2, w, fill) => `<path d="M${x1},${y1}L${x2},${y2}" stroke="${fill}" stroke-width="${w}"/>`;
    // a roundabout ring broken by a short gap at angle gap (deg, 0 = right, 90 = down): the traffic flow's notch
    const ring = (cx, cy, r, w, fill, gap = 45, gw = 16) => {
      const a0 = ((gap + gw / 2) * Math.PI) / 180, a1 = ((gap - gw / 2 + 360) * Math.PI) / 180;
      const p = (a) => `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
      return `<path d="M${p(a0)}A${r},${r} 0 1 1 ${p(a1)}" fill="none" stroke="${fill}" stroke-width="${w}"/>`;
    };
    // a chevron board (below SADC direction signs at T-junctions): chevrons pointing outwards from the middle
    const chevrons = (x, y, w, h, fg, bg = '#fff') => {
      const g = h * 0.1, cx = x + w / 2, half = w / 2 - g / 2 - h * 0.06, n = Math.max(2, Math.round(half / (h * 0.85))), step = half / n;
      const cw = Math.min(step * 0.82, h * 0.72), k = cw * 0.56, d = cw * 0.44, t = y + h * 0.1, b = y + h * 0.9, m = y + h / 2;
      let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${bg}" stroke="#bbb" stroke-width="2"/>`;
      for (let i = 0; i < n; i++) {
        const lx = cx - g / 2 - i * step - (k + d), rx = cx + g / 2 + i * step + (k + d);
        out += `<path d="M${lx + k},${t}H${lx + k + d}L${lx + d},${m}L${lx + k + d},${b}H${lx + k}L${lx},${m}Z" fill="${fg}"/>`;
        out += `<path d="M${rx - k},${t}H${rx - k - d}L${rx - d},${m}L${rx - k - d},${b}H${rx - k}L${rx},${m}Z" fill="${fg}"/>`;
      }
      return out;
    };
    // the quiz's disambiguator, "Githunguri (Machakos)" -> "Githunguri": never on the sign
    const clean = (s) => String(s || '').replace(/\s*\([^)]*\)\s*$/, '');
    // a name as printed: no disambiguator, typographic apostrophe (Mohale’s Hoek)
    const txt = (s) => clean(s).replace(/'/g, '\u2019');
    // roundabout diagram: the ring (notch at angle gap: lower right where traffic keeps left, lower left where it keeps right),
    // an arm down to the approach, an arm up (top name above it), arms left and right when they have a name (names below them)
    const roundabout = ({ top, left, right, f, weight = 'bold', S = 44, fill, fg = '#fff', frame, gap = 62, ls = 0 }) => {
      const T = TS.T, F_ = F[f], lw = left ? em(left, f, ls) * S : 0, rw = right ? em(right, f, ls) * S : 0, tw = top ? em(top, f, ls) * S : 0;
      const r = 42, w = 18, lh = Math.max(200, lw + r + 44, tw / 2 + 40), rh = right ? Math.max(200, rw + r + 44, tw / 2 + 40) : Math.max(170, tw / 2 + 40);
      const W = Math.round(lh + rh), H = top ? 420 : 330, cx = lh, cy = top ? 236 : 146;
      const o = { fill: fg, weight, ls };
      let b = frame(W, H) + ring(cx, cy, r, w, fg, gap, 24) + bar(cx, cy + r, cx, H - 10, w, fg) + tip(cx, cy - r, cx, top ? 96 : 30, w, fg, 1.2);
      if (left) b += tip(cx - r, cy, 36, cy, w, fg, 1.2) + T(cx - r - 12, cy + 74, left, S, F_, { ...o, anchor: 'end', maxw: lh - r - 28, max: S });
      if (right) b += tip(cx + r, cy, W - 36, cy, w, fg, 1.2) + T(cx + r + 12, cy + 74, right, S, F_, { ...o, anchor: 'start', maxw: rh - r - 28, max: S });
      if (top) b += T(cx, 72, top, S, F_, { ...o, maxw: 2 * Math.min(lh, rh) - 60, max: S });
      return TS.svg(W, H, b);
    };
    return { CH, WT, F, base, em, wrap, fitLines, arrow, tip, head, bar, ring, chevrons, clean, txt, roundabout };
  })();
  // ---- end of AF kit ----
  // ---- SADC kit: the Road Traffic Signs Manual designs shared by Botswana, Lesotho and Namibia (the same block in BW, LS, NA) ----
  // DIN 1451 lettering with open spacing, white border at the sign's edge, green guide signs with yellow route numbers,
  // blue freeway signs, red-and-white chevron boards under T-junction signs. Signs grow with the name, letters keep their size.
  // SADC_LS (set by the file before this block): the letter spacing in em, wider on Lesotho's signs
  const SADC = (() => {
    const { T, svg } = TS;
    const G = '#0b6a3b', B = '#1c5aa6', Y = '#f6b612', LS = SADC_LS, din = AF.F.din;
    const frame = (W, H, fill, rx = 14, bw = 9) => `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${rx}" fill="#fff" stroke="#9a9a9a" stroke-width="2"/>` +
      `<rect x="${bw}" y="${bw}" width="${W - 2 * bw}" height="${H - 2 * bw}" rx="${Math.max(4, rx - bw + 2)}" fill="${fill}"/>`;
    // place-name sign: the name in mixed case, white on green (Botswana) or blue (Lesotho)
    const locality = (name, fill) => {
      name = AF.txt(name);
      const H = 200, S = 136, tw = AF.em(name, 'din', LS) * S, W = Math.round(Math.max(H * 1.7, tw + 0.62 * H));
      return svg(W, H, frame(W, H, fill, 22, 13) + T(W / 2, H / 2 + S * 0.355, name, S, din, { fill: '#fff', ls: LS, maxw: W - 0.5 * H, max: S }));
    };
    // white place-name plate: black capitals, black border set in from the edge (Botswana villages, Namibia)
    const plate = (name) => {
      const t = AF.txt(name).toUpperCase(), H = 200, S = 92, ls = LS + 0.03, tw = AF.em(t, 'din', ls) * S, W = Math.round(Math.max(H * 2.2, tw + 0.55 * H));
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="#fff" stroke="#9a9a9a" stroke-width="2"/>` +
        `<rect x="13" y="13" width="${W - 26}" height="${H - 26}" rx="9" fill="none" stroke="#1a1a1a" stroke-width="6"/>` +
        T(W / 2, H / 2 + S * 0.36, t, S, din, { fill: '#1a1a1a', ls, maxw: W - 0.42 * H, max: S }));
    };
    // direction sign: one panel per row, [arrow] [route] name [arrow]; route numbers yellow; a chevron board below
    // ls: the arrows of the GeoHints pictures 15 and 16 (a short broad shaft, a plain triangular head 2.8 shafts wide;
    // TS.arrows), else the older longer arrow
    const direction = (rows, { fill = G, chev = true, S = 52, ls = false } = {}) => {
      const PH = S * 2.3, aw = ls ? S * 0.92 : S * 1.05, ah = S * 0.82, gap = S * 0.5, m = S * 0.6;
      const arr = (x, y, deg) => (ls ? TS.arrows.dir(x, y, deg + 90, aw, { w: 0.34 * S, fill: '#fff', head: { half: 1.4, back: 1.55, neck: 1.5 } }) : AF.arrow(x, y, deg, aw, ah, '#fff'));
      const lay = rows.map((r) => {
        r = { ...r, name: AF.txt(r.name) };
        const rw = r.road ? AF.em(r.road, 'din', LS) * S : 0, nw = AF.em(r.name, 'din', LS) * S;
        return { ...r, rw, w: m * 2 + (r.dir === 'left' ? aw + gap : 0) + (r.road ? rw + gap * 0.8 : 0) + nw + (r.dir === 'right' ? gap + aw : 0) };
      });
      const W = Math.round(Math.max(S * 8, ...lay.map((l) => l.w))), H = Math.round(PH * rows.length), CHV = chev ? Math.round(S * 1.75) : 0, gc = chev ? 6 : 0;
      let body = frame(W, H, fill, 12);
      lay.forEach((l, i) => {
        const y0 = i * PH, by = y0 + PH / 2 + S * 0.36;
        let x = m;
        if (i) body += `<rect x="9" y="${y0 - 3}" width="${W - 18}" height="6" fill="#fff"/>`;
        if (l.dir === 'left') { body += arr(x + aw / 2, y0 + PH / 2, 180); x += aw + gap; }
        if (l.road) { body += T(x, by, l.road, S, din, { fill: Y, anchor: 'start', ls: LS }); x += l.rw + gap * 0.8; }
        const room = (l.dir === 'right' ? W - m - aw - gap : W - m) - x;
        body += T(x, by, l.name, S, din, { fill: '#fff', anchor: 'start', ls: LS, maxw: room, max: S });
        if (l.dir === 'right') body += arr(W - m - aw / 2, y0 + PH / 2, 0);
      });
      // ls: the chevron board of GeoHints 15, measured at large size: right under the sign, white with a thin grey rim; red
      // chevrons pointing outwards, the outermost at the board's ends, the middle left empty; each chevron 0.92 of the
      // board's height tall, 0.7 deep, its arms 0.26 thick and cut level at the top and bottom, one every 0.84
      if (chev && ls) {
        const bh = CHV, y0 = H + 3, t = y0 + 0.04 * bh, b = y0 + 0.96 * bh, m = y0 + bh / 2, th = 0.26 * bh, D = 0.44 * bh, step = 0.84 * bh;
        const n = Math.max(2, Math.round((W / 2 - 0.87 * bh) / step));
        const one = (tx, sg) => { const X = (v) => (tx + sg * v).toFixed(1); return `<path d="M${X(0)},${m}L${X(D)},${t}L${X(D + th)},${t}L${X(th)},${m}L${X(D + th)},${b}L${X(D)},${b}Z" fill="#d71920"/>`; };
        body += `<rect x="1" y="${y0}" width="${W - 2}" height="${bh}" rx="5" fill="#f4f4f2" stroke="#a9a9a9" stroke-width="2"/>`;
        for (let i = 0; i < n; i++) body += one(1 + 0.07 * bh + i * step, 1) + one(W - 1 - 0.07 * bh - i * step, -1);
        return svg(W, y0 + bh + 1, body);
      }
      if (chev) body += AF.chevrons(1, H + gc, W - 2, CHV, '#d71920');
      return svg(W, H + gc + CHV, body);
    };
    // roundabout diagram: ring (clockwise: notch at the lower right), arms left and right with pointed ends, names below them
    const roundabout = (left, right, { fill = G, S = 44 } = {}) => {
      left = AF.txt(left); right = AF.txt(right);
      const lw = AF.em(left, 'din', LS) * S, rw = AF.em(right, 'din', LS) * S, half = Math.max(300, Math.max(lw, rw) + S * 2.4);
      const W = Math.round(half * 2), H = 400, cx = W / 2, cy = 192, r = 44, w = 19, c = '#fff';
      return svg(W, H, frame(W, H, fill, 14) + AF.ring(cx, cy, r, w, c, 62, 22) +
        AF.tip(cx - r, cy, cx - r - 106, cy, w, c) + AF.tip(cx + r, cy, cx + r + 106, cy, w, c) + AF.bar(cx, cy - r, cx, cy - r - 46, w, c) + AF.bar(cx, cy + r, cx, H - 26, w, c) +
        T(cx - S * 1.6, 300, left, S, din, { fill: c, anchor: 'end', ls: LS, maxw: half - S * 2.2, max: S }) +
        T(cx + S * 1.6, 300, right, S, din, { fill: c, anchor: 'start', ls: LS, maxw: half - S * 2.2, max: S }));
    };
    // T-junction sign: left name, a T of two arrow heads over a stem, right name
    const tee = (left, right, { fill = G, S = 50 } = {}) => {
      left = AF.txt(left); right = AF.txt(right);
      const lw = AF.em(left, 'din', LS) * S, rw = AF.em(right, 'din', LS) * S, sym = S * 2.9, m = S * 0.7, g = S * 0.4;
      const W = Math.round(Math.max(S * 10, m * 2 + lw + rw + sym + g * 2)), H = Math.round(S * 3.4), cx = m + lw + g + sym / 2 + (W - (m * 2 + lw + rw + sym + g * 2)) / 2;
      const ty = H * 0.27, st = S * 0.4, by = H * 0.68;
      return svg(W, H, frame(W, H, fill, 12) + AF.arrow(cx - sym / 4 + st / 4, ty, 180, sym / 2 + st / 2, S * 1.05, '#fff') + AF.arrow(cx + sym / 4 - st / 4, ty, 0, sym / 2 + st / 2, S * 1.05, '#fff') +
        `<rect x="${cx - st / 2}" y="${ty}" width="${st}" height="${H * 0.82 - ty}" fill="#fff"/>` +
        T(cx - sym / 2 - g, by, left, S, din, { fill: '#fff', anchor: 'end', ls: LS, maxw: cx - sym / 2 - g - m * 0.8, max: S }) +
        T(cx + sym / 2 + g, by, right, S, din, { fill: '#fff', anchor: 'start', ls: LS, maxw: W - (cx + sym / 2 + g) - m * 0.8, max: S }));
    };
    return { G, B, Y, LS, frame, locality, plate, direction, roundabout, tee };
  })();
  // ---- end of SADC kit ----
  const ls = [
    { id: 'locality', kind: 'entry', label: 'Place name (blue)', draw: ({ name }) => SADC.locality(name, '#2470ad') },
    { id: 'direction', kind: 'direction', label: 'Direction sign', draw: ({ name, next }) =>
      SADC.direction([{ name, dir: 'right' }, { name: next, dir: 'left' }], { ls: true }) },
    { id: 'flag', kind: 'direction', label: 'Single direction sign', draw: ({ name }) => SADC.direction([{ name, dir: 'right' }], { chev: false, S: 46 }) },
    { id: 'tee', kind: 'direction', label: 'T-junction sign', draw: ({ name, next }) => SADC.tee(name, next) },
  ];
  TS.add('LS', ls, { next: 'Maseru' });
})();
