// ZA: South Africa. Guide signs drawn from photos (GeoHints direction-sign pictures and Commons photos; see examples/ZA.json):
// DIN lettering (Alte DIN 1451 Mittelschrift, DINish Bold for the black-on-white capitals).
(function () {
  // ---- ZS kit: South African / Eswatini guide-sign drawing (the same block in ZA.js and SZ.js, so each file stands alone) ----
  // Built from photos (GeoHints direction-sign pictures, Commons photos): DIN lettering, white border at the sign's edge,
  // green signs with yellow route numbers, blue freeway signs, black-on-white exit-number and town panels in heavier capitals,
  // arrows with a broad head and a narrow shaft. Every size is a multiple of d (the capital height is 7d); signs grow
  // with their texts, letters keep their size, and TS.fitDOM then fits each text exactly in the real font.
  const ZS = (() => {
    const { T, svg } = TS;
    const d = 8, CAP = 7 * d;
    const G = '#0b6a3b', B = '#1c5aa6', Y = '#f6b612', W = '#fff', K = '#161616', R = '#d71920', BR = '#8a4b2a';
    const DIN = "'Alte DIN 1451 Mittelschrift','D-DIN',sans-serif";            // light-on-dark texts
    const BOLD = "'DINish','Alte DIN 1451 Mittelschrift',sans-serif";          // dark-on-light capitals (heavier strokes)
    const SD = CAP / 0.711, SB = CAP / 0.69;                                   // font sizes giving a 7d capital height
    const LD = 0.03, LB = 0.05;                                                // letter spacing (em)
    // advance widths (1/1000 em) measured from the font files (Alte DIN 1451 Mittelschrift; DINish Bold)
    const CH = " -'.&()/,0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const WD = [240, 407, 240, 240, 648, 278, 278, 333, 240, 480, 337, 480, 480, 480, 480, 484, 480, 480, 494, 623, 610, 556, 630, 556, 537, 610, 648, 258, 481, 630, 556, 758, 684, 610, 593, 610, 610, 574, 500, 630, 556, 832, 536, 500, 519, 480, 519, 444, 519, 498, 278, 519, 537, 240, 258, 519, 258, 852, 537, 500, 519, 519, 389, 480, 278, 537, 444, 722, 480, 444, 444];
    const WB = [217, 393, 192, 215, 598, 310, 310, 404, 192, 512, 348, 492, 504, 521, 496, 516, 456, 524, 516, 605, 598, 600, 600, 556, 556, 600, 608, 248, 330, 609, 516, 753, 634, 600, 566, 600, 600, 548, 516, 613, 554, 832, 593, 540, 505, 501, 515, 505, 514, 517, 334, 514, 520, 240, 240, 520, 286, 808, 520, 510, 515, 514, 357, 474, 352, 520, 480, 735, 459, 481, 454];
    const base = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/’/g, "'");
    // the width in px of s at its nominal size: bold = the heavier capitals
    const tw = (s, bold = false) => {
      const tab = bold ? WB : WD, size = bold ? SB : SD, ls = bold ? LB : LD;
      return [...base(s)].reduce((a, c) => { const w = tab[CH.indexOf(c)]; return a + ((w > 0 ? w : 560) / 1000 + ls) * size; }, 0);
    };
    // the quiz's disambiguator ("Name (Region)") never appears on a sign; apostrophes are typographic
    const txt = (s) => String(s == null ? '' : s).replace(/\s*\([^)]*\)\s*$/, '').replace(/'/g, '’');
    const rd = (s) => (s == null || s === '' ? '' : String(s));   // route numbers as written, brackets kept
    // a map-type bar from (x1,y1) to (x2,y2), w wide, its far end a blunt point (tip false: cut square)
    const bar = (x1, y1, x2, y2, w, fill = W, tip = true) => {
      const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy * w / 2, ny = ux * w / 2, t = tip ? w * 0.5 : 0;
      const bx = x2 - ux * t, by = y2 - uy * t, f = (v) => v.toFixed(1);
      return `<path d="M${f(x1 + nx)},${f(y1 + ny)}L${f(bx + nx)},${f(by + ny)}L${f(x2)},${f(y2)}L${f(bx - nx)},${f(by - ny)}L${f(x1 - nx)},${f(y1 - ny)}Z" fill="${fill}"/>`;
    };
    // a line of sign text standing on baseline y; size scales the 7d capital (1 = 7d)
    const line = (x, y, s, { fill = W, anchor = 'start', bold = false, k = 1, maxw = 0 } = {}) =>
      T(x, y, s, (bold ? SB : SD) * k, bold ? BOLD : DIN, { fill, anchor, ls: bold ? LB : LD, weight: bold ? 'bold' : 'normal', maxw, max: (bold ? SB : SD) * k });
    // corners of a polygon rounded off (quadratic): pts [[x,y],...], r the radius per corner (0 = sharp)
    const poly = (pts, r) => {
      let p = '';
      pts.forEach((P, i) => {
        const A = pts[(i + pts.length - 1) % pts.length], C = pts[(i + 1) % pts.length], ri = r[i] || 0;
        if (!ri) { p += (i ? 'L' : 'M') + P[0].toFixed(1) + ',' + P[1].toFixed(1); return; }
        const u = [A[0] - P[0], A[1] - P[1]], v = [C[0] - P[0], C[1] - P[1]], lu = Math.hypot(...u), lv = Math.hypot(...v);
        const P1 = [P[0] + (u[0] / lu) * ri, P[1] + (u[1] / lu) * ri], P2 = [P[0] + (v[0] / lv) * ri, P[1] + (v[1] / lv) * ri];
        p += (i ? 'L' : 'M') + P1[0].toFixed(1) + ',' + P1[1].toFixed(1) + 'Q' + P[0].toFixed(1) + ',' + P[1].toFixed(1) + ' ' + P2[0].toFixed(1) + ',' + P2[1].toFixed(1);
      });
      return p + 'Z';
    };
    // the sign arrow (pointing up, centred on 0,0, in d): length L, head 10d wide and hl long, shaft 3d, the head's back
    // edges rising 0.75d to the shaft, barb tips rounded
    const arrowPath = (L = 11, hl = 6.3) => {
      const t = -L / 2, b = L / 2, hb = t + hl, j = hb - 0.75;
      return poly([[0, t], [5, hb], [1.5, j], [1.5, b], [-1.5, b], [-1.5, j], [-5, hb]].map(([x, y]) => [x * d, y * d]), [0, 0.6 * d, 0, 0, 0, 0, 0.6 * d]);
    };
    // an arrow at x,y: deg 0 = up, 90 = right, -90 = left, 180 = down, -45 = up-left; k scales it
    const arrow = (x, y, deg, { fill = W, L = 11, hl = 6.3, k = 1 } = {}) =>
      `<path transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${deg}) scale(${k})" d="${arrowPath(L, hl)}" fill="${fill}"/>`;
    const DIRS = { right: 90, left: -90, up: 0, down: 180, upleft: -45, upright: 45 };
    // the sign: white border d wide at its edge (corner radius 4d), a thin grey rim so a white border shows on white pages
    const frame = (w, h, fill) => `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${4 * d}" fill="${W}" stroke="#9a9a9a" stroke-width="2"/>` +
      `<rect x="${d}" y="${d}" width="${w - 2 * d}" height="${h - 2 * d}" rx="${3 * d}" fill="${fill}"/>`;
    // a red-and-white chevron board: chevrons pointing out from the middle, as under T-junction signs
    const chevrons = (x, y, w, h) => {
      const m = d, iw = w - 2 * m, ih = h - 2 * m, cw = ih * 0.8, th = cw * 0.5, gap = ih * 0.3, half = (iw - gap) / 2, n = Math.max(2, Math.floor(half / (cw * 1.12)));
      const step = half / n, cy = y + h / 2;
      let out = `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="${d}" fill="${W}" stroke="#9a9a9a" stroke-width="2"/>`;
      for (let i = 0; i < n; i++) {
        const lx = x + m + i * step + (step - cw) / 2, rx = x + w - m - i * step - (step - cw) / 2;
        out += `<path d="M${lx + th},${cy - ih / 2}H${lx + cw}L${lx + cw - th},${cy}L${lx + cw},${cy + ih / 2}H${lx + th}L${lx},${cy}Z" fill="${R}"/>`;
        out += `<path d="M${rx - th},${cy - ih / 2}H${rx - cw}L${rx - cw + th},${cy}L${rx - cw},${cy + ih / 2}H${rx - th}L${rx},${cy}Z" fill="${R}"/>`;
      }
      return out;
    };
    // stack-type direction sign: one band per destination, [arrow] [route] name [arrow], bands parted by white lines;
    // all names start at the same x. street: a white panel on top with the street's name in black capitals.
    // chev: a chevron board below (T-junctions).
    const stack = (rows, { fill = G, street = '', chev = false } = {}) => {
      rows = rows.map((r) => ({ ...r, name: txt(r.name), road: rd(r.road) }));
      const anyL = rows.some((r) => r.dir === 'left'), anyR = rows.some((r) => r.dir && r.dir !== 'left');
      const rw = Math.max(0, ...rows.map((r) => (r.road ? tw(r.road) : 0)));
      const x0 = anyL ? 23 * d : 7 * d, xn = x0 + (rw ? rw + 4 * d : 0), nw = Math.max(...rows.map((r) => tw(r.name)));
      let Wd = Math.round(xn + nw + (anyR ? 23 * d : 7 * d));
      const st = street ? txt(street).toUpperCase() : '', sk = 0.72, PH = st ? 12 * d : 0;
      if (st) Wd = Math.max(Wd, Math.round(tw(st, true) * sk + 12 * d));
      const BH = 17 * d, Hs = PH + d + rows.length * BH + (rows.length - 1) * d + d, CHV = chev ? 15 * d : 0;
      let b = frame(Wd, Hs, fill);
      if (st) b += `<rect x="${d}" y="${d}" width="${Wd - 2 * d}" height="${PH - d}" fill="${W}"/>` + line(Wd / 2, PH - 3 * d, st, { fill: K, anchor: 'middle', bold: true, k: sk, maxw: Wd - 8 * d });
      rows.forEach((r, i) => {
        const top = PH + d + i * (BH + d), base = top + 5 * d + CAP, mid = top + 5 * d + CAP / 2;
        if (i) b += `<rect x="${d}" y="${top - d}" width="${Wd - 2 * d}" height="${d}" fill="${W}"/>`;
        if (r.dir === 'left') b += arrow(d + 6 * d + 5.5 * d, mid, -90);
        else if (r.dir) b += arrow(Wd - 7 * d - 5.5 * d, mid, DIRS[r.dir]);
        if (r.road) b += line(x0, base, r.road, { fill: Y });
        const xr = r.road || !rw ? xn : x0;   // a band without a route number starts its name in the route column
        b += line(xr, base, r.name, { maxw: Wd - xr - (anyR ? 23 * d : 7 * d) });
      });
      if (chev) b += chevrons(0, Hs, Wd, CHV);
      return svg(Wd, Hs + CHV, b);
    };
    // confirmation sign: route number centred on top (yellow), then destinations left and distances right
    const confirm = (road, rows, { fill = G } = {}) => {
      rows = rows.map((r) => ({ name: txt(r.name), km: String(r.km) }));
      road = rd(road);
      const nw = Math.max(...rows.map((r) => tw(r.name))), kw = Math.max(...rows.map((r) => tw(r.km)));
      const Wd = Math.round(Math.max(7 * d + nw + 5 * d + kw + 7 * d, road ? tw(road) + 14 * d : 0, 30 * d));
      const n = rows.length + (road ? 1 : 0), Hd = d + 5 * d + (n - 1) * 11 * d + CAP + 5 * d + d;
      let b = frame(Wd, Hd, fill), y = d + 5 * d + CAP;
      if (road) { b += line(Wd / 2, y, road, { fill: Y, anchor: 'middle' }); y += 11 * d; }
      for (const r of rows) {
        b += line(7 * d, y, r.name, { maxw: Wd - 7 * d - 5 * d - kw - 7 * d }) + line(Wd - 7 * d, y, r.km, { anchor: 'end' });
        y += 11 * d;
      }
      return svg(Wd, Hd, b);
    };
    // exit-number panel text (black capitals); the panel is white
    const exitNo = (x, y, s) => line(x, y, String(s), { fill: K, anchor: 'middle', bold: true });
    // freeway exit sign: white exit-number panel in the top left corner, route number (yellow) and destinations to the
    // right, an arrow pointing up-left below the panel
    const exitSign = ({ exit, road, names, fill = B }) => {
      names = names.map(txt); road = rd(road);
      const lines = [...(road ? [{ s: road, c: Y }] : []), ...names.map((s) => ({ s, c: W }))];
      const ew = Math.max(18 * d, tw(String(exit), true) + 9 * d), PH = 14 * d, x0 = Math.max(ew + 6 * d, 31 * d);
      const Wd = Math.round(x0 + Math.max(...lines.map((l) => tw(l.s))) + 6 * d);
      const top = 9 * d, P = 12.5 * d, Hd = Math.round(Math.max(top + (lines.length - 1) * P + CAP + 9 * d, PH + 24 * d));
      let b = frame(Wd, Hd, fill) + `<path d="M${d},${PH}V${4 * d}Q${d},${d} ${4 * d},${d}H${ew}V${PH}Z" fill="${W}"/>` + exitNo(ew / 2 + d / 2, PH / 2 + CAP / 2 + d / 2, exit);
      lines.forEach((l, i) => { b += line(x0, top + i * P + CAP, l.s, { fill: l.c, maxw: Wd - x0 - 6 * d }); });
      b += arrow(ew / 2 + d, Hd - 13 * d, -45, { L: 16.4, hl: 7.7, k: 1.25 });
      return svg(Wd, Hd, b);
    };
    // freeway exit sign with the town panel: a white band across the top, [exit number | TOWN] in black capitals parted by
    // a bar of the sign's colour; below it route number (yellow) and destinations, the up-left arrow at the left
    const exitTown = ({ exit, town, road, names, fill = B }) => {
      town = txt(town).toUpperCase(); names = names.map(txt); road = rd(road);
      const lines = [...(road ? [{ s: road, c: Y }] : []), ...names.map((s) => ({ s, c: W }))];
      const ew = tw(String(exit), true) + 7 * d, x0 = 24 * d, PH = 15 * d;
      const Wd = Math.round(Math.max(ew + 2 * d + 5 * d + tw(town, true) + 6 * d, x0 + Math.max(...lines.map((l) => tw(l.s))) + 7 * d));
      const top = PH + 6 * d, P = 14 * d, Hd = Math.round(top + (lines.length - 1) * P + CAP + 8 * d);
      const pb = PH / 2 + CAP / 2 + d / 2;
      let b = frame(Wd, Hd, fill) + `<path d="M${d},${PH}V${4 * d}Q${d},${d} ${4 * d},${d}H${Wd - 4 * d}Q${Wd - d},${d} ${Wd - d},${4 * d}V${PH}Z" fill="${W}"/>` +
        `<rect x="${ew}" y="${d}" width="${1.6 * d}" height="${PH - d}" fill="${fill}"/>` + exitNo(ew / 2 + d / 2, pb, exit) +
        line(ew + 1.6 * d + 4 * d, pb, town, { fill: K, bold: true, maxw: Wd - ew - 1.6 * d - 4 * d - 5 * d });
      lines.forEach((l, i) => { b += line(x0, top + i * P + CAP, l.s, { fill: l.c, maxw: Wd - x0 - 7 * d }); });
      b += arrow(11.5 * d, top + ((lines.length - 1) * P + CAP) / 2 + 2 * d, -45, { L: 16.4, hl: 7.7, k: 1.05 });
      return svg(Wd, Hd, b);
    };
    // overhead lane sign: route number (yellow) and destinations centred, down arrows in the lower corners
    const overhead = ({ road, names, fill = B }) => {
      names = names.map(txt); road = rd(road);
      const lines = [...(road ? [{ s: road, c: Y }] : []), ...names.map((s) => ({ s, c: W }))];
      const Wd = Math.round(Math.max(60 * d, ...lines.map((l) => tw(l.s) + 22 * d)));
      const P = 12 * d, top = 7 * d, Hd = Math.round(top + (lines.length - 1) * P + CAP + 18 * d);
      let b = frame(Wd, Hd, fill);
      lines.forEach((l, i) => { b += line(Wd / 2, top + i * P + CAP, l.s, { fill: l.c, anchor: 'middle', maxw: Wd - 22 * d }); });
      b += arrow(9 * d, Hd - 8.5 * d, 180, { k: 0.95 }) + arrow(Wd - 9 * d, Hd - 8.5 * d, 180, { k: 0.95 });
      return svg(Wd, Hd, b);
    };
    // white town-name plate: black capitals, widely spaced, black border near the edge
    const plate = (name, { ls = 0.12 } = {}) => {
      const t = txt(name).toUpperCase(), size = SB, wd = [...base(t)].reduce((a, c) => { const w = WB[CH.indexOf(c)]; return a + ((w > 0 ? w : 600) / 1000 + ls) * size; }, 0) - ls * size;
      const Hd = 20 * d, Wd = Math.round(Math.max(Hd * 2, wd + 15 * d));
      return svg(Wd, Hd, `<rect x="1" y="1" width="${Wd - 2}" height="${Hd - 2}" rx="${3.5 * d}" fill="${W}" stroke="#9a9a9a" stroke-width="2"/>` +
        `<rect x="${d}" y="${d}" width="${Wd - 2 * d}" height="${Hd - 2 * d}" rx="${2.6 * d}" fill="none" stroke="${K}" stroke-width="${0.9 * d}"/>` +
        T(Wd / 2 + (ls * size) / 2, Hd / 2 + CAP / 2, t, size, BOLD, { fill: K, weight: 'bold', ls, maxw: Wd - 13 * d, max: size }));
    };
    // a name on up to two lines (cut at the space that balances them best) when it is wider than maxw
    const wrap2 = (s, maxw) => {
      if (tw(s) <= maxw || !/\s/.test(s)) return [s];
      let best = [s], bw = Infinity;
      for (let i = 1; i < s.length; i++) if (s[i] === ' ') { const a = s.slice(0, i), b = s.slice(i + 1), w = Math.max(tw(a), tw(b)); if (w < bw) { bw = w; best = [a, b]; } }
      return best;
    };
    // advance exit sign: exit-number panel top left, route number (yellow) top right or under the panel, the destination
    // on the left, the distance under/beside the arrows on the right: a fork (the exit branching off to the left of the
    // freeway, which goes straight on) and, with lanes, that many straight lane arrows to its right
    const advance = ({ exit, road, name, dist = '1km', roadPos = 'right', lanes = 0, style = 'lanes', fill = B }) => {
      road = rd(road);
      const compact = roadPos === 'left';
      const names = wrap2(txt(name), 46 * d), ew = Math.max(13 * d, tw(String(exit), true) + 6 * d), PH = 14 * d;
      const AZ = 17 * d + lanes * 9 * d;
      const lines = [...(compact && road ? [{ s: road, c: Y }] : []), ...names.map((s) => ({ s, c: W }))];
      const tw0 = Math.max(...lines.map((l) => tw(l.s)));
      const Wd = Math.round(Math.max(7 * d + tw0 + 5 * d + AZ, compact ? 0 : 80 * d, compact ? tw(dist) + 12 * d + AZ : 0));
      const P = compact ? 11 * d : 13 * d, top = compact ? PH + 4 * d : Math.max(36 * d - (lines.length - 2) * 6 * d, PH + 9 * d);
      const lastB = top + (lines.length - 1) * P + CAP, Hd = Math.round(lastB + 11 * d + (compact ? 5 : 7) * d);
      let b = frame(Wd, Hd, fill) + `<path d="M${d},${PH}V${4 * d}Q${d},${d} ${4 * d},${d}H${ew}V${PH}Z" fill="${W}"/>` + exitNo(ew / 2 + d / 2, PH / 2 + CAP / 2 + d / 2, exit);
      if (road && !compact) b += line(Wd - 7 * d, d + 5 * d + CAP, road, { fill: Y, anchor: 'end' });
      lines.forEach((l, i) => { b += line(7 * d, top + i * P + CAP, l.s, { fill: l.c, maxw: Wd - 12 * d - AZ }); });
      const sx = Wd - 6 * d - lanes * 9 * d - 6 * d;
      b += line(compact ? sx - 11 * d : Wd - 7 * d, lastB + 11 * d, dist, { anchor: 'end' });
      const sTop = road && !compact ? 19 * d : 5 * d, sBot = compact ? Hd - 4 * d : lastB + 2 * d, k = compact ? 0.85 : 1.25;
      const jy = sTop + (sBot - sTop) * (compact ? 0.5 : 0.62), ang = compact ? -40 : -58, bl = (compact ? 14 : 19) * d, ra = (ang * Math.PI) / 180;
      if (style === 'map') {   // broad map-type bars with blunt points: the freeway up, the exit off to the upper left
        const mw = 7 * d, bx2 = sx - 21 * d, by2 = jy - 8 * d;
        b += bar(sx, sBot + 2 * d, sx, sTop, mw) + bar(sx, jy + 4 * d, bx2, by2, mw * 0.9);
      } else {
        b += arrow(sx, (sTop + sBot) / 2, 0, { L: (sBot - sTop) / (k * d), hl: 7.7, k });
        b += arrow(sx + Math.sin(ra) * bl * 0.5, jy - Math.cos(ra) * bl * 0.5, ang, { L: bl / (k * d), hl: 7.7, k });
      }
      for (let i = 1; i <= lanes; i++) b += arrow(sx + i * 9 * d, (sTop + sBot) / 2, 0, { L: (sBot - sTop) / (k * d), hl: 7.7, k });
      return svg(Wd, Hd, b);
    };
    // diagram sign: the road ahead as a stem with an arrowhead, an arm to the right (higher) and one to the left (lower);
    // each arm's destination on a blue freeway panel [route (yellow) / name]; the distance at the lower right
    const diagram = ({ right, left, dist = '500 m', fill = G, panel = B }) => {
      const pan = (o) => { const ls = [...(o.road ? [{ s: rd(o.road), c: Y }] : []), ...wrap2(txt(o.name), 40 * d).map((s) => ({ s, c: W }))]; return { ls, w: Math.max(...ls.map((l) => tw(l.s))) + 6 * d, h: 6 * d + CAP + (ls.length - 1) * 11 * d }; };
      const R = pan(right), L = pan(left), arm = 11 * d;
      const yr = Math.max(R.h / 2 + 6 * d, 18 * d), yl = yr + Math.max(R.h / 2 + L.h / 2 + 4 * d, 15 * d);
      const cx = 5 * d + L.w + 2 * d + arm, Wd = Math.round(cx + arm + 2 * d + R.w + 5 * d), Hd = Math.round(Math.max(yl + L.h / 2 + 12 * d, yl + 14 * d));
      const bw = 3.6 * d, top = 5 * d, bot = Hd - d;
      let b = frame(Wd, Hd, fill);
      b += bar(cx, bot, cx, top, bw) + bar(cx, yr, cx + arm + bw / 2, yr, bw) + bar(cx, yl, cx - arm - bw / 2, yl, bw);
      const box = (x, yc, P) => {
        let o = `<rect x="${x}" y="${yc - P.h / 2}" width="${P.w}" height="${P.h}" fill="${panel}"/>`;
        P.ls.forEach((l, i) => { o += line(x + 3 * d, yc - P.h / 2 + 3 * d + CAP + i * 11 * d, l.s, { fill: l.c, maxw: P.w - 6 * d }); });
        return o;
      };
      b += box(cx + arm + 2 * d, yr, R) + box(5 * d, yl, L);
      b += line(Wd - 6 * d, Hd - 5 * d, dist, { anchor: 'end' });
      return svg(Wd, Hd, b);
    };
    return { rd, bar, diagram, plate, wrap2, advance, d, CAP, G, B, Y, W, K, R, BR, DIN, BOLD, SD, SB, tw, txt, line, poly, arrow, arrowPath, DIRS, frame, chevrons, stack, confirm, exitNo, exitSign, exitTown, overhead };
  })();
  // ---- end of ZS kit ----
  const za = [
    { id: 'town', kind: 'entry', label: 'Town name plate', draw: ({ name }) => ZS.plate(name) },
    { id: 'direction', kind: 'direction', label: 'Direction sign', draw: ({ name, next }) =>
      ZS.stack([{ name, dir: 'right' }, { name: next, dir: 'left' }]) },
    { id: 'pointer', kind: 'direction', label: 'One-way pointer', draw: ({ name, road }) => ZS.stack([{ name, dir: 'left', road }]) },
    { id: 'junction', kind: 'direction', label: 'T-junction sign', draw: ({ name, next, road, street }) =>
      ZS.stack([{ name, dir: 'right', road }, { name: next, dir: 'left', road }], { street, chev: true }) },
    { id: 'confirm', kind: 'direction', label: 'Route confirmation', draw: ({ name, road, km }) => ZS.confirm(road, [{ name, km }]) },
    { id: 'advance', kind: 'motorway', label: 'Freeway advance exit', draw: ({ name, road, exit }) => ZS.advance({ exit, road, name, dist: '1 km', roadPos: 'left', lanes: 2 }) },
    { id: 'exit', kind: 'motorway', label: 'Freeway exit', draw: ({ name, next, road, exit }) => ZS.exitSign({ exit, road, names: [name, next] }) },
    { id: 'exit-town', kind: 'motorway', label: 'Freeway exit, town panel', draw: ({ name, next, road, exit }) => ZS.exitTown({ exit, town: name, road, names: [next] }) },
    { id: 'overhead', kind: 'motorway', label: 'Freeway overhead', draw: ({ name, next, road }) => ZS.overhead({ road, names: [name, next] }) },
  ];
  TS.add('ZA', za, { next: 'Bloemfontein', km: 44, road: 'N1', exit: 190 });
})();
