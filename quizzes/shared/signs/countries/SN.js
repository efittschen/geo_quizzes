// SN: Senegal. French-style signs: white town entry (red border) and exit (black border, red bar) signs with black
// capitals, black-on-white diagram signs, blue motorway gantries, red-capped kilometre stones. Narrow grotesque lettering
// (Archivo Narrow stands in; the far narrower town-sign capitals Barlow Condensed), Helvetica-like on the motorway (Arimo). Drawn after the GeoHints pictures in examples/SN.json.
(function () {
  const { T, svg } = TS;
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
  const R = '#d22630', K = '#151515', B = '#1f4f9c', nf = AF.F.narrow;
  // entry/exit lettering: the photos' capitals are far narrower than Archivo Narrow (KEUR MADABEL about 7.3 cap heights,
  // letters about half a cap wide); Barlow Condensed Medium matches them. Its advance widths (1/1000 em, the kit's CH order)
  AF.WT.bcond = [200, 320, 137, 202, 564, 254, 254, 447, 266, 415, 418, 440, 420, 420, 381, 429, 414, 436, 456, 452, 469, 432, 410, 457, 475, 220, 435, 466, 407, 530, 501, 462, 451, 450, 453, 426, 439, 477, 457, 646, 449, 442, 401, 425, 431, 413, 431, 417, 285, 423, 432, 212, 206, 421, 191, 657, 432, 424, 435, 435, 304, 387, 275, 432, 399, 575, 398, 387, 365];
  const bf = "'Barlow Condensed','Archivo Narrow',sans-serif";
  // entry/exit board: capitals, one line, or two (cut at a space or hyphen) for long names, the board growing taller
  const board = (name, band, exit) => {
    // as the photos (city-signs 9, 10): capitals 0.3 of the plate's height, a third of the height free at each end, the
    // border line 9 wide and an eighth of the height in from the edge
    const t = AF.txt(name).toUpperCase(), lines = AF.wrap(t, 'bcond', 10.5, 2), two = lines.length > 1, S = two ? 74 : 86;
    const H = two ? 290 : 200, tw = Math.max(...lines.map((l) => AF.em(l, 'bcond', 0.02))) * S, W = Math.round(Math.max(440, tw + 134));
    const y0 = H / 2 + S * 0.355 - (two ? S * 0.56 : 0);
    let b = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="#fff" stroke="#a5a5a5" stroke-width="2"/>` +
      `<rect x="25" y="25" width="${W - 50}" height="${H - 50}" rx="12" fill="none" stroke="${band}" stroke-width="9"/>` +
      lines.map((l, i) => T(W / 2, y0 + i * S * 1.12, l, S, bf, { fill: K, weight: 500, ls: 0.02, maxw: W - 120, max: S })).join('');
    // exit bar (group B): a broad painted stroke over the name, round ends reaching nearly into the field's corners
    if (exit) b += TS.exitbar({ box: [29.5, 29.5, W - 59, H - 59], ends: 'round', inset: 3, width: 24, fill: R });
    return svg(W, H, b);
  };
  // roundabout diagram (white, black): the ring, arrows up-right (name), left (next) and down-right (right), a distance plate
  const roundabout = ({ name, next, right, dist = '50m' }) => {
    const S = 44, r = 46, L = (s) => (s ? AF.wrap(AF.txt(s), 'narrow', 6.2, 2) : []), nl = L(name), xl = L(next), rl = L(right);
    const wid = (ls) => (ls.length ? Math.max(...ls.map((l) => AF.em(l, 'narrow'))) * S : 0), nw = wid(nl), xw = wid(xl), rw = wid(rl);
    const H = 480, cx = Math.max(210, xw + r + 46), cy = 236, tx = cx + 104, W = Math.round(Math.max(500, tx + Math.max(nw, rw) + 30));
    const pt = (a, d) => [cx + d * Math.cos((a * Math.PI) / 180), cy + d * Math.sin((a * Math.PI) / 180)];
    const arm = (a, x2, y2) => { const [x1, y1] = pt(a, r); return AF.head(x1, y1, x2, y2, 14, K, 2.7, 2.0); };
    const block = (ls, x, y, anchor, maxw) => ls.map((l, i) => T(x, y + i * S * 1.05, l, S, nf, { fill: K, weight: 'bold', anchor, maxw, max: S })).join('');
    let b = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="#fff" stroke="${K}" stroke-width="7"/>` + AF.ring(cx, cy, r, 24, K, 112, 34) +
      arm(-58, cx + 74, cy - 140) + arm(196, 40, cy + 26) +
      block(nl, tx, 84, 'start', W - tx - 24) + block(xl, 26, cy - 30 - (xl.length - 1) * S * 1.05, 'start', cx - r - 36);
    if (right) b += arm(48, cx + 80, cy + 104) + block(rl, tx - 10, cy + 116, 'start', W - tx - 14);
    const dw = AF.em(dist, 'narrow') * 44 + 24;
    b += `<path d="M${W - dw - 14},${H - 4}V${H - 74}H${W - 4}" fill="none" stroke="${K}" stroke-width="6"/>` + T(W - 14 - dw / 2 + 4, H - 22, dist, 44, nf, { fill: K, weight: 'bold' });
    return svg(W, H, b);
  };
  // motorway gantry (blue): the places in spaced white capitals, arrows down over the lanes
  const gantry = ({ name, next }) => {
    const ls = 0.14, S = 46, a = AF.txt(next).toUpperCase(), n = AF.txt(name).toUpperCase(), tw = Math.max(AF.em(a, 'arimo', ls), AF.em(n, 'arimo', ls)) * S;
    const W = Math.round(Math.max(760, tw + 200)), H = 260;
    return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="6" fill="${B}" stroke="#7f95b8" stroke-width="2"/>` +
      T(W / 2, 74, a, S, AF.F.arimo, { fill: '#fff', weight: 'bold', ls, maxw: W - 120, max: S }) + T(W / 2, 140, n, S, AF.F.arimo, { fill: '#fff', weight: 'bold', ls, maxw: W - 120, max: S }) +
      [80, W / 2, W - 80].map((x) => AF.arrow(x, 208, 90, 70, 64, '#fff', 0.34, 0.55)).join(''));
  };
  // kilometre stone: a red cap with the road number, the white body with the places and distances in black capitals
  const borne = ({ name, km, road, next, km2 }) => {
    const rows = [[AF.txt(name).toUpperCase(), km], ...(next && km2 != null ? [[AF.txt(next).toUpperCase(), km2]] : [])], S = 46, f = AF.F.dinc, bw = 230;
    const lines = rows.flatMap(([t, k]) => { const ls = AF.wrap(t, 'dinc', 5.0, 2), sz = AF.fitLines(ls, 'dinc', bw - 26, S, 0.04); return [...ls.map((l) => [l, sz]), [String(k), S]]; });
    const W = 300, x0 = (W - bw) / 2, top = 110, H = top + 40 + lines.length * 52 + 110;
    return svg(W, H, `<path d="M${x0},${top}V${top - 30}A${bw / 2},${bw / 2 - 30} 0 0 1 ${x0 + bw},${top - 30}V${top}Z" fill="${R}"/>` +
      `<rect x="${x0}" y="${top}" width="${bw}" height="${H - top - 70}" fill="#fafafa" stroke="#cfcfcf" stroke-width="2"/>` +
      `<rect x="10" y="${H - 72}" width="${W - 20}" height="70" rx="6" fill="#f2f2f2" stroke="#cfcfcf" stroke-width="2"/>` +
      T(W / 2, top - 22, road, 50, f, { fill: '#fff', weight: 'bold', ls: 0.06 }) +
      lines.map(([l, sz], i) => T(W / 2, top + 66 + i * 52, l, sz, f, { fill: K, weight: 'bold', ls: 0.04, maxw: bw - 24, max: sz })).join(''));
  };
  const sn = [
    { id: 'entry', kind: 'entry', label: 'Town entry', draw: ({ name }) => board(name, R, false) },
    { id: 'exit', kind: 'exit', label: 'Town exit', draw: ({ name }) => board(name, K, true) },
    { id: 'roundabout', kind: 'direction', label: 'Roundabout diagram', draw: roundabout },
    { id: 'gantry', kind: 'motorway', label: 'Motorway gantry', draw: gantry },
    { id: 'borne', kind: 'other', label: 'Kilometre stone', draw: borne },
  ];
  TS.add('SN', sn, { next: 'Thiès', km: 15, road: 'N3' });
})();
