// TN: Tunisia. Bilingual signs: the Arabic name above, the Latin (French-style) form below in capitals. Town entry (red
// border) and exit (black border, red bar) signs, white arrow signs, blue motorway signs with a red route plate, white
// direction boards, kilometre stones. Arabic in Noto Naskh Arabic; Latin capitals after Caractères L1 (Typoroute L1 stands
// in), Helvetica-like on the motorway (Arimo). Drawn after the GeoHints pictures listed in examples/TN.json.
// alt = the Latin form as on the signs (Kalâa Kebira, Menzel Bourguiba): not a fixed rule from the Arabic, so it is needed;
// without it the sign shows the Arabic only. nextAlt, when given, adds the Latin form of next.
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
  const R = '#d22630', K = '#151515', B = '#1d5fb0', G = '#0f8a4a', ar = AF.F.ar, l1 = AF.F.l1;
  const LAT = (s) => AF.txt(s).toUpperCase().replace(/[’']/g, '’');   // the Latin line in capitals
  // Arabic stretched with kashidas (tatweel) between joining letters, as the arrow and motorway signs print short names:
  // after a letter that joins to the left, before another letter, never inside lam-alef
  const JOIN = 'بتثجحخسشصضطظعغفقكلمنهيئـ', ALEF = 'اأإآ';
  const stretch = (s, k) => {
    if (k <= 0) return s;
    const cl = s.match(/.[ً-ْ]*/gu) || [];
    return cl.map((c, i) => { const n = cl[i + 1]; return c + (n && JOIN.includes(c[0]) && /[ء-ي]/.test(n[0]) && !(c[0] === 'ل' && ALEF.includes(n[0])) ? 'ـ'.repeat(k) : ''); }).join('');
  };
  const letters = (s) => [...s].filter((c) => /[ء-ي]/.test(c)).length;
  // entry/exit board: Arabic above, Latin capitals below; a red (entry) or black (exit) band inside the edge
  const board = ({ name, alt }, band, exit) => {
    const a = AF.txt(name), l = alt ? LAT(alt) : '', SA = 92, SL = 68, lsL = 0.07;
    const aw = AF.em(a, 'ar') * SA, lw = l ? AF.em(l, 'l1', lsL) * SL : 0, W = Math.round(Math.max(460, aw + 120, lw + 120)), H = l ? 290 : 200;
    let b = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="#fff" stroke="#a5a5a5" stroke-width="2"/>` +
      `<rect x="15" y="15" width="${W - 30}" height="${H - 30}" rx="10" fill="none" stroke="${band}" stroke-width="13"/>` +
      T(W / 2, l ? 130 : 128, a, SA, ar, { fill: K, weight: 'bold', maxw: W - 90, max: SA }) + (l ? T(W / 2, 238, l, SL, l1, { fill: K, ls: lsL, maxw: W - 90, max: SL }) : '');
    if (exit) b += `<clipPath id="tnx"><rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="6"/></clipPath><path clip-path="url(#tnx)" d="M22,${H - 30}L${W - 22},26L${W - 22},38L22,${H - 18}Z" fill="${R}"/>`;
    return svg(W, H, b);
  };
  // arrow sign (white, pointing right, black border): the stretched Arabic above, the Latin capitals below
  const flag = ({ name, alt }) => {
    const n = letters(AF.txt(name)), k = n <= 4 ? 3 : n <= 6 ? 2 : n <= 9 ? 1 : 0, a = stretch(AF.txt(name), k), l = alt ? LAT(alt) : '', SA = 80, SL = 46, lsL = 0.14;
    const tw = Math.max(AF.em(a, 'ar') * SA, l ? AF.em(l, 'l1', lsL) * SL : 0), H = l ? 200 : 150, P = H * 0.42, bw = Math.round(Math.max(320, tw + 70)), W = bw + P;
    return svg(W, H, `<path d="M2,2H${bw}L${W - 2},${H / 2}L${bw},${H - 2}H2Z" fill="#fff" stroke="#9a9a9a" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M11,11H${bw - 4}L${W - 16},${H / 2}L${bw - 4},${H - 11}H11Z" fill="none" stroke="${K}" stroke-width="5" stroke-linejoin="round"/>` +
      T(22 + (bw - 22) / 2, l ? 98 : 96, a, SA, ar, { fill: K, maxw: bw - 50, max: SA }) + (l ? T(22 + (bw - 22) / 2, 172, l, SL, l1, { fill: K, ls: lsL, maxw: bw - 50, max: SL }) : ''));
  };
  // rows of [Arabic, Latin]: the place and, when its Latin form is given, next
  const rowsOf = ({ name, alt, next, nextAlt }) => [[AF.txt(name), alt ? LAT(alt) : ''], ...(next && nextAlt ? [[AF.txt(next), LAT(nextAlt)]] : [])];
  // motorway sign (blue, red route plate above): Latin left, Arabic right on each row, arrows down
  const motorway = (o) => {
    const rows = rowsOf(o), S = 50, ls = 0.02, lw = Math.max(...rows.map(([, l]) => AF.em(l, 'arimo', ls))) * S;
    const aw = Math.max(...rows.map(([a]) => AF.em(stretch(a, letters(a) <= 6 ? 1 : 0), 'ar') * S * 1.15)), W = Math.round(Math.max(520, 40 + lw + 60 + aw + 40)), PH = 62, H = PH + 50 + rows.length * 76 + 100;
    let b = `<rect x="${W / 2 - 150}" y="2" width="120" height="${PH - 8}" rx="4" fill="${R}" stroke="#fff" stroke-width="3"/>` + T(W / 2 - 90, PH - 18, o.road, 40, AF.F.arimo, { fill: '#fff', weight: 'bold' }) +
      `<rect x="1" y="${PH}" width="${W - 2}" height="${H - PH - 1}" rx="8" fill="${B}" stroke="#fff" stroke-width="3"/>`;
    rows.forEach(([a, l], i) => {
      const y = PH + 84 + i * 76;
      if (l) b += T(34, y, l, S, AF.F.arimo, { fill: '#fff', weight: 'bold', anchor: 'start', ls, maxw: W / 2 - 50, max: S });
      b += T(l ? W - 34 : W / 2, y + 4, stretch(a, letters(a) <= 6 ? 1 : 0), S * 1.15, ar, { fill: '#fff', weight: 'bold', anchor: l ? 'end' : 'middle', maxw: l ? W / 2 - 50 : W - 80, max: S * 1.15 });
    });
    b += [W * 0.22, W * 0.78].map((x) => AF.arrow(x, H - 52, 90, 66, 60, '#fff', 0.34, 0.55)).join('');
    return svg(W, H, b);
  };
  // direction board (white, black border): route plate and arrow on top, the Arabic names, then the Latin capitals
  const board2 = (o) => {
    const rows = rowsOf(o), SA = 50, SL = 40, lsL = 0.06, aw = Math.max(...rows.map(([a]) => AF.em(a, 'ar'))) * SA, lw = Math.max(...rows.map(([, l]) => AF.em(l, 'l1', lsL))) * SL;
    const W = Math.round(Math.max(420, aw + 80, lw + 80)), top = 88, H = top + rows.length * 64 + (rows[0][1] ? rows.length * 54 : 0) + 34;
    const plate = `${o.road}`, pw = AF.em(plate, 'arimo') * 34 + 30;
    let b = `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="8" fill="#fff" stroke="#9a9a9a" stroke-width="2"/><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="5" fill="none" stroke="${K}" stroke-width="5"/>` +
      `<line x1="8" y1="${top - 6}" x2="${W - 8}" y2="${top - 6}" stroke="${K}" stroke-width="5"/>` +
      `<rect x="${W / 2 - pw / 2 - 30}" y="20" width="${pw}" height="48" rx="5" fill="${G}" stroke="#fff" stroke-width="2"/>` + T(W / 2 - 30, 57, plate, 34, AF.F.arimo, { fill: '#fff', weight: 'bold' }) +
      AF.arrow(W - 60, 46, -45, 64, 40, K, 0.34, 0.6);
    rows.forEach(([a], i) => { b += T(W / 2, top + 50 + i * 64, a, SA, ar, { fill: K, maxw: W - 60, max: SA }); });
    if (rows[0][1]) rows.forEach(([, l], i) => { b += T(W / 2, top + rows.length * 64 + 44 + i * 54, l, SL, l1, { fill: K, ls: lsL, maxw: W - 60, max: SL }); });
    return svg(W, H, b);
  };
  // kilometre stone: a red (national road) or green (regional road) cap; the front with the Arabic name, the distance and the
  // Latin name, the side with the road's Arabic abbreviation (ط.و national, ط.ج regional) and number
  const borne = ({ name, alt, km, road }) => {
    const nat = /^(N|A)/i.test(road), num = String(road).replace(/^\D+/, ''), ab = /^(N)/i.test(road) ? 'ط.و' : /^R/i.test(road) ? 'ط.ج' : String(road).replace(/\d+/, '').trim();
    const a = AF.txt(name), l = alt ? LAT(alt) : '', fw = 220, sw = 110, x0 = 30, top = 120, H = 520, W = x0 + fw + sw + 30, cap = nat ? R : G;
    const la = AF.wrap(a, 'ar', 4.6, 2), ll = l ? AF.wrap(l, 'l1', 5.6, 2) : [], sa = AF.fitLines(la, 'ar', fw - 30, 50), sl = l ? AF.fitLines(ll, 'l1', fw - 30, 36, 0.04) : 0;
    let b = `<path d="M${x0},${top}V${top - 34}A${fw / 2},74 0 0 1 ${x0 + fw},${top - 34}V${top}Z" fill="${cap}"/>` +
      `<path d="M${x0 + fw},${top}V${top - 34}A${sw / 2},52 0 0 1 ${x0 + fw + sw},${top - 52}V${top - 18}Z" fill="${cap}" opacity="0.78"/>` +
      `<rect x="${x0}" y="${top}" width="${fw}" height="${H - top - 60}" fill="#f7f7f5" stroke="#c9c9c5" stroke-width="2"/>` +
      `<path d="M${x0 + fw},${top}L${x0 + fw + sw},${top - 18}V${H - 78}L${x0 + fw},${H - 60}Z" fill="#e4e4e0" stroke="#c9c9c5" stroke-width="2"/>` +
      `<path d="M10,${H - 60}H${x0 + fw + 20}L${x0 + fw + sw + 22},${H - 82}V${H - 30}L${x0 + fw + 20},${H - 4}H10Z" fill="#ececea" stroke="#c9c9c5" stroke-width="2"/>`;
    la.forEach((t, i) => { b += T(x0 + fw / 2, top + 64 + i * 56, t, sa, ar, { fill: K, maxw: fw - 30, max: sa }); });
    const yk = top + 64 + la.length * 56 + 20;
    b += T(x0 + fw / 2, yk, String(km), 54, AF.F.dinc, { fill: K, weight: 'bold' });
    ll.forEach((t, i) => { b += T(x0 + fw / 2, yk + 66 + i * 44, t, sl, l1, { fill: K, ls: 0.04, maxw: fw - 30, max: sl }); });
    b += T(x0 + fw + sw / 2, top + 56, ab, 40, ar, { fill: K, maxw: sw - 20, max: 40 }) + T(x0 + fw + sw / 2, top + 124, num, 46, AF.F.dinc, { fill: K, weight: 'bold', maxw: sw - 16, max: 46 });
    return svg(W, H, b);
  };
  const tn = [
    { id: 'entry', kind: 'entry', label: 'Town entry', needs: ['alt'], draw: (o) => board(o, R, false) },
    { id: 'exit', kind: 'exit', label: 'Town exit', needs: ['alt'], draw: (o) => board(o, K, true) },
    { id: 'flag', kind: 'direction', label: 'Arrow sign', needs: ['alt'], draw: flag },
    { id: 'motorway', kind: 'motorway', label: 'Motorway sign', needs: ['alt'], defaults: { road: 'A1' }, draw: motorway },
    { id: 'board', kind: 'direction', label: 'Direction board', needs: ['alt'], draw: board2 },
    { id: 'borne', kind: 'other', label: 'Kilometre stone', needs: ['alt'], draw: borne },
  ];
  TS.add('TN', tn, { km: 17, road: 'R 119' });
})();
