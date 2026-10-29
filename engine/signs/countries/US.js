// US: signs carrying a place name, drawn after GeoHints direction sign 241 and Commons photos (examples/US.json lists which).
// Green guide signs with a white border; Highway Gothic (Roadgeek 2014 Series C/D/E/EM stand in) on the nationwide and most
// state designs, Clearview (Signika stands in) where the photos show it. City-limit wording differs by state: each state
// design seen on a photo is its own template with `regions`.
// Extra fields besides the kit's: pop (population as printed), elev (elevation in feet), dist (distance printed for `name`;
// `next` then gets dist + the km between the two towns, in miles), dir (cardinal direction on freeway signs).
(function () {
  const { T, svg } = TS;
  const CAP = 0.571;                                   // Roadgeek 2014 cap height per em
  const F = { C: "'RG2014 Series C',sans-serif", D: "'RG2014 Series D',sans-serif", E: "'RG2014 Series E',sans-serif",
    EM: "'RG2014 Series EM',sans-serif", CV: "'Signika',sans-serif" };
  const WID = { C: [0.377, 0.315], D: [0.449, 0.367], E: [0.524, 0.392], EM: [0.538, 0.495], CV: [0.55, 0.456] };  // advance per em: caps, mixed
  const CAPH = { CV: 0.687 };
  const G = '#006b45', Y = '#f6c500', IB = '#003f87', IR = '#b5121b', WH = '#fff', BK = '#111';
  const em = (f, cap) => cap / (CAPH[f] || CAP);
  const isCaps = (s) => String(s) === String(s).toUpperCase();
  const est = (s, f, cap) => [...String(s)].length * (WID[f][isCaps(s) ? 0 : 1] + (f === 'CV' ? 0.04 : 0)) * em(f, cap);
  const mi = (km) => Math.max(1, Math.round(km / 1.609344));
  // one line of lettering at a cap height; maxw lets TS.fitDOM shrink it to the room it has
  const L = (x, y, s, f, cap, maxw, o = {}) => T(x, y, String(s), em(f, cap), F[f], { fill: WH, maxw, max: em(f, cap), weight: f === 'CV' ? '500' : 'normal', ls: f === 'CV' ? 0.04 : 0, ...o });
  // a long name in two lines, split where the longer line is shortest (at a space, or after a hyphen)
  const split2 = (s) => {
    const cuts = [];
    for (let i = 1; i < s.length - 1; i++) {
      if (s[i] === ' ') cuts.push([s.slice(0, i), s.slice(i + 1)]);
      else if (s[i] === '-' && s[i - 1] !== ' ') cuts.push([s.slice(0, i + 1), s.slice(i + 1)]);
    }
    for (let i = cuts.length - 1; i >= 0; i--) if (/^[-–]/.test(cuts[i][1].trim())) cuts.splice(i, 1);   // a line never starts with a dash
    if (!cuts.length) return [s];
    return cuts.reduce((b, c) => (Math.max(c[0].length, c[1].length) < Math.max(b[0].length, b[1].length) ? c : b)).map((t) => t.trim());
  };
  const lines = (s, f, cap, room) => (est(s, f, cap) > room ? split2(s) : [s]);
  // sign face: green with a white border line, rounded corners
  const plate = (x, y, w, h, { fill = G, ink = WH, r = 16, inset = 6, bw = 5 } = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>` +
    `<rect x="${x + inset}" y="${y + inset}" width="${w - 2 * inset}" height="${h - 2 * inset}" rx="${Math.max(3, r - inset)}" fill="none" stroke="${ink}" stroke-width="${bw}"/>`;
  // rows of centred lettering on a sign as wide as its longest row: rows = [{ s, f, cap, gap }] (gap: room above the row)
  const stack = (rows, { minW = 420, maxW = 960, pad = 48, top = 46, bottom = 46, fill = G, ink = WH } = {}) => {
    const W = Math.round(Math.min(maxW, Math.max(minW, Math.max(...rows.map((r) => r.w || est(r.s, r.f, r.cap))) + 2 * pad)));
    let y = top, body = '';
    rows.forEach((r, i) => { y += (i ? r.gap : 0) + r.cap; body += r.draw ? r.draw(W, y) : L(W / 2, y, r.s, r.f, r.cap, W - 2 * pad, { fill: ink }); });
    const H = Math.round(y + bottom + (rows[rows.length - 1].desc || 0));
    return svg(W, H, plate(0, 0, W, H, { fill, ink }) + body);
  };
  const nameRows = (name, f, cap, room, gap) => lines(name, f, cap, room).map((s, i) => ({ s, f, cap, gap: i ? gap : 0 }));
  const num = (n) => String(n).replace(/[^\d]/g, '');

  // arrows: a solid guide-sign arrow pointing up, rotated (deg) about its centre
  const arrow = (x, y, len, deg, fill = WH) => {
    const s = len / 100;
    return `<path transform="translate(${x},${y}) rotate(${deg}) scale(${s})" d="M-9,50 L-9,-8 L-27,-8 L0,-50 L27,-8 L9,-8 L9,50 Z" fill="${fill}"/>`;
  };
  // a bent exit arrow: shaft up, then turning up-right
  const exitArrow = (x, y, len, fill = WH) => arrow(x, y, len, 45, fill);
  // a lane arrow that rises from (x, yb) and bends to the right, its head pointing up-right; h = its height
  const curve = (x, y0, x2, y2, cy, h, fill) => {
    const ang = Math.atan2(y2 - cy, x2 - x) * 180 / Math.PI + 90;
    return `<path d="M${x},${y0} Q${x},${cy} ${x2},${y2}" fill="none" stroke="${fill}" stroke-width="${h * 0.12}"/>` +
      `<path transform="translate(${x2},${y2}) rotate(${ang})" d="M${-h * 0.15},${h * 0.07} L0,${-h * 0.15} L${h * 0.15},${h * 0.07} Z" fill="${fill}"/>`;
  };
  const turnArrow = (x, yb, h, fill = WH) => `<path d="M${x},${yb} L${x},${yb - h * 0.4}" stroke="${fill}" stroke-width="${h * 0.12}"/>` +
    curve(x, yb - h * 0.4 + 1, x + h * 0.3, yb - h * 0.82, yb - h * 0.78, h, fill);
  const splitArrow = (x, yb, h, fill = WH) => arrow(x, yb - h / 2, h, 0, fill) + curve(x, yb - h * 0.3, x + h * 0.3, yb - h * 0.66, yb - h * 0.62, h * 0.8, fill);
  // route markers
  const ISH = 'M3,4 Q50,15 97,4 C101,30 101,58 84,78 C74,90 61,95 50,100 C39,95 26,90 16,78 C-1,58 -1,30 3,4 Z';
  const interstate = (cx, cy, h, n) => {
    const t = String(n), w = h * (t.length > 2 ? 1.18 : 1), sx = w / 100, sy = h / 100, id = 'ish' + t;
    return `<g transform="translate(${cx - w / 2},${cy - h / 2}) scale(${sx},${sy})"><path d="${ISH}" fill="${WH}"/>` +
      `<clipPath id="${id}"><path d="${ISH}" transform="translate(50,50) scale(0.9) translate(-50,-50)"/></clipPath>` +
      `<g clip-path="url(#${id})"><rect x="-5" y="-5" width="110" height="33" fill="${IR}"/><rect x="-5" y="31" width="110" height="80" fill="${IB}"/></g></g>` +
      T(cx, cy - h / 2 + h * 0.235, 'INTERSTATE', em('D', h * 0.1), F.D, { fill: WH, maxw: w * 0.72, max: em('D', h * 0.1) }) +
      T(cx, cy + h * 0.27, t, em(t.length > 2 ? 'C' : 'D', h * 0.42), F[t.length > 2 ? 'C' : 'D'], { fill: WH, maxw: w * 0.74, max: em('D', h * 0.42) });
  };
  const USH = 'M6,9 C18,2 34,11 50,4 C66,11 82,2 94,9 L97,24 C100,40 100,52 96,64 C91,78 72,86 50,98 C28,86 9,78 4,64 C0,52 0,40 3,24 Z';
  const usShield = (cx, cy, h, n) => {
    const t = String(n), w = h * (t.length > 2 ? 1.15 : 1);
    return `<g transform="translate(${cx - w / 2},${cy - h / 2}) scale(${w / 100},${h / 100})"><path d="${USH}" fill="${WH}" stroke="${BK}" stroke-width="3"/></g>` +
      T(cx, cy + h * 0.2, t, em('D', h * 0.46), F.D, { fill: BK, maxw: w * 0.78, max: em('D', h * 0.46) });
  };
  const stateOval = (cx, cy, h, n) => {
    const t = String(n), w = h * (t.length > 2 ? 1.35 : 1.05);
    return `<ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" fill="${WH}"/>` +
      T(cx, cy + h * 0.21, t, em('D', h * 0.44), F.D, { fill: BK, maxw: w * 0.8, max: em('D', h * 0.44) });
  };
  // the marker for a route as written: "I-80", "US 50", or a bare number (a state route)
  const marker = (road, cx, cy, h) => {
    const r = String(road).trim();
    let m;
    if ((m = r.match(/^I[- ]?(\d+[A-Z]?)/i))) return interstate(cx, cy, h, m[1]);
    if ((m = r.match(/^US[- ]?(\d+[A-Z]?)/i))) return usShield(cx, cy, h, m[1]);
    return stateOval(cx, cy, h * 0.8, r.replace(/^[A-Z]{2}[- ]?/, ''));
  };
  const markerW = (road, h) => { const r = String(road).replace(/^(I|US)[- ]?/i, '').replace(/^[A-Z]{2}[- ]?/, ''); return /^I/i.test(road) ? h * (r.length > 2 ? 1.18 : 1) : h * (r.length > 2 ? 1.3 : 1.05); };
  // cardinal direction with a taller first letter (NORTH, EAST …)
  const cardinal = (x, y, d, cap, f = 'E', anchor = 'start') => {
    const s = String(d).toUpperCase();
    const big = em(f, cap), small = em(f, cap * 0.8);
    return `<text x="${x}" y="${y}" font-family="${F[f]}" font-size="${big.toFixed(1)}" fill="${WH}" text-anchor="${anchor}">${s[0]}<tspan font-size="${small.toFixed(1)}">${s.slice(1)}</tspan></text>`;
  };
  const cardW = (d, cap, f = 'E') => em(f, cap) * WID[f][0] * (1 + (String(d).length - 1) * 0.8);
  // EXIT tab on the top right of a freeway sign
  const exitTab = (W, th, txt, f = 'E') => {
    const tw = Math.max(170, est(txt, f, th * 0.5) + 60), x = W - tw;
    return { tw, svg: plate(x, 0, tw, th + 24, { r: 12 }) + L(x + tw / 2, th * 0.5 + th * 0.27, txt, f, th * 0.5, tw - 36) };
  };
  // yellow EXIT ONLY panel: arrow 'down' or 'right' (up-right)
  const exitOnly = (x, y, w, h, kind = 'down', f = 'E') => {
    const cap = h * 0.5, gap = h * 0.9;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${Y}"/>` +
      L(x + w / 2 - gap, y + h / 2 + cap / 2, 'EXIT', f, cap, w * 0.35, { fill: BK, anchor: 'end' }) +
      (kind === 'down' ? arrow(x + w / 2, y + h / 2, h * 0.8, 180, BK) : arrow(x + w / 2, y + h / 2, h * 0.8, 45, BK)) +
      L(x + w / 2 + gap, y + h / 2 + cap / 2, 'ONLY', f, cap, w * 0.35, { fill: BK, anchor: 'start' });
  };

  const us = [
    // ---- city / town limits ----
    { id: 'limit', kind: 'entry', label: 'City limit', regions: null,
      draw: ({ name }) => { const n = name.toUpperCase();
        return stack([...nameRows(n, 'E', 80, 860, 26), { s: 'CITY LIMIT', f: 'D', cap: 46, gap: 40 }], { minW: 440, maxW: 960 }); } },
    { id: 'limit-mixed', kind: 'entry', label: 'City limit, mixed-case name', regions: ['Texas', 'Colorado', 'Oklahoma'],
      draw: ({ name, pop }) => stack([...nameRows(name, 'EM', 78, 900, 34), { s: 'CITY LIMIT', f: 'D', cap: 42, gap: 34 },
        ...(pop ? [{ s: `POP. ${num(pop)}`, f: 'D', cap: 42, gap: 28 }] : [])], { minW: 440, maxW: 1000 }) },
    { id: 'limit-ca', kind: 'entry', label: 'City limit with population and elevation', regions: ['California'], needs: ['pop', 'elev'],
      draw: ({ name, pop, elev }) => {
        const tags = [pop ? `POP. ${num(pop)}` : null, elev ? `ELEV ${num(elev)}` : null].filter(Boolean);
        const tagW = (s) => est(s, 'D', 30) + 30;
        const row = tags.length ? [{ cap: 30, gap: 40, w: tags.reduce((a, s) => a + tagW(s), 0) + 60 * (tags.length - 1),
          draw: (W, y) => { const tot = tags.reduce((a, s) => a + tagW(s), 0) + 60 * (tags.length - 1); let x = W / 2 - tot / 2;
            return tags.map((s) => { const w = tagW(s), o = `<rect x="${x}" y="${y - 30 - 13}" width="${w}" height="56" rx="5" fill="${G}" stroke="${WH}" stroke-width="3"/>` + L(x + w / 2, y, s, 'D', 30, w - 20); x += w + 60; return o; }).join(''); } }] : [];
        return stack([...nameRows(name, 'EM', 72, 860, 32), { s: 'CITY LIMIT', f: 'E', cap: 54, gap: 36, w: est('CITY LIMIT', 'E', 54) * 1.12, draw: (W, y) => L(W / 2, y, 'CITY LIMIT', 'E', 54, W - 96, { ls: 0.1 }) }, ...row], { minW: 460, maxW: 960, bottom: tags.length ? 56 : 46 });
      } },
    { id: 'limit-mo', kind: 'entry', label: 'City limit above the name', regions: ['Missouri'],
      draw: ({ name, pop }) => stack([{ s: 'CITY LIMIT', f: 'D', cap: 34, gap: 0 }, ...nameRows(name, 'EM', 70, 900, 30).map((r, i) => ({ ...r, gap: i ? 30 : 34 })),
        ...(pop ? [{ s: `POP ${num(pop)}`, f: 'D', cap: 36, gap: 34 }] : [])], { minW: 520, maxW: 1000, top: 40 }) },
    { id: 'pop-mn', kind: 'entry', label: 'Name and population', regions: ['Minnesota'], needs: ['pop'],
      draw: ({ name, pop }) => stack([...nameRows(name, 'EM', 64, 760, 30), ...(pop ? [{ s: `POP. ${num(pop)}`, f: 'D', cap: 34, gap: 34 }] : [])], { minW: 320, maxW: 860 }) },
    { id: 'pop-wy', kind: 'entry', label: 'Name, population and elevation', regions: ['Wyoming'], needs: ['pop', 'elev'],
      draw: ({ name, pop, elev }) => {
        const n = name.toUpperCase(), rows = nameRows(n, 'E', 80, 760, 26);
        const kv = (k, v) => ({ cap: 58, gap: 34, w: est(`${k} ${v}`, 'E', 58) + 60,
          draw: (W, y) => L(54, y, k, 'E', 58, W * 0.45, { anchor: 'start' }) + L(W - 54, y, num(v), 'E', 58, W * 0.45, { anchor: 'end' }) });
        if (pop) rows.push(kv('POP', pop));
        if (elev) rows.push(kv('ELEV', elev));
        return stack(rows, { minW: 460, maxW: 860 });
      } },
    { id: 'corp-oh', kind: 'entry', label: 'Corporation limit', regions: ['Ohio'],
      draw: ({ name }) => stack([...nameRows(name.toUpperCase(), 'C', 80, 820, 26), { s: 'CORPORATION LIMIT', f: 'C', cap: 40, gap: 34 }], { minW: 460, maxW: 900 }) },
    { id: 'corp-ms', kind: 'entry', label: 'Corp. limit', regions: ['Mississippi'],
      draw: ({ name }) => stack([...nameRows(name.toUpperCase(), 'D', 76, 760, 26), { s: 'CORP. LIMIT', f: 'D', cap: 50, gap: 38 }], { minW: 420, maxW: 860 }) },
    { id: 'entering-wa', kind: 'entry', label: 'Entering', regions: ['Washington'],
      draw: ({ name }) => stack([{ s: 'ENTERING', f: 'D', cap: 40, gap: 0 }, ...nameRows(name.toUpperCase(), 'D', 54, 760, 24).map((r, i) => ({ ...r, gap: i ? 24 : 30 }))], { minW: 420, maxW: 860, top: 40, bottom: 40 }) },

    // ---- direction and distance signs (conventional roads) ----
    { id: 'distance', kind: 'direction', label: 'Distance sign (miles)', regions: null,
      draw: ({ name, next, km, dist = 5, dist2 }) => {
        const rows = [[name, dist], [next, dist2 || dist + mi(km)]];
        const nw = Math.max(...rows.map((r) => est(r[0], 'EM', 52))), dw = Math.max(...rows.map((r) => est(String(r[1]), 'EM', 52)));
        const W = Math.round(Math.min(1100, Math.max(560, 46 + nw + 70 + dw + 46))), H = 46 + 52 + 2 * (52 + 40) - 40 + 52;
        return svg(W, H, plate(0, 0, W, H) + rows.map((r, i) => { const y = 46 + 52 + i * 92;
          return L(46, y, r[0], 'EM', 52, W - 46 - 46 - dw - 50, { anchor: 'start' }) + L(W - 46, y, r[1], 'EM', 52, dw + 10, { anchor: 'end' }); }).join(''));
      } },
    { id: 'direction', kind: 'direction', label: 'Destination sign with arrows', regions: null,
      // the California photos (CA 44/89, CA 4/89): ONE plate split by a white rule; the upper part lists its towns with an
      // arrow left at the left edge, the lower part its towns with the arrow right after the distances; distances flush
      // right in a column. with / with2: more towns for each part, 'Town:miles|Town:miles' (the photos list two each);
      // the quiz passes one town per part
      draw: ({ name, next, km, dist = 5, dist2, with: w1, with2 }) => {
        const d2 = dist2 || Math.max(1, mi(km) - dist);
        const list = (v) => (Array.isArray(v) ? v : v ? String(v).split('|') : []).map((t) => { const m = String(t).split(':'); return [m[0].trim(), (m[1] || '').trim()]; }).filter((r) => r[0]);
        const A = [[name, dist], ...list(w1)], B = [[next, d2], ...list(with2)];
        const cap = 46, pitch = cap * 1.76, AH = { w: 16, head: { half: 2.0, back: 2.15, cut: 0, neck: 2.15 }, fill: WH };   // FHWA arrow (TS.arrows), 62 long
        const sec = (n, last) => Math.round(cap * (1.05 + 1 + (n - 1) * 1.76 + (last ? 1.2 : 1.15)));
        const nw = Math.max(...[...A, ...B].map((r) => est(String(r[1]), 'EM', cap))), tw0 = (R) => Math.max(...R.map((r) => est(r[0], 'EM', cap)));
        const W = Math.round(Math.min(1100, Math.max(560, tw0(A) + 110 + 50 + nw + 36, tw0(B) + 40 + 50 + nw + 120)));
        const h1 = sec(A.length, false), h2 = sec(B.length, true), H = h1 + h2;
        const part = (y0, h, R, left) => {
          const x0 = left ? 110 : 40, xn = left ? W - 36 : W - 120, yb = y0 + cap * 1.05 + cap, mid = y0 + (yb + (R.length - 1) * pitch - cap / 2 - y0);
          return R.map((r, i) => L(x0, yb + i * pitch, r[0], 'EM', cap, xn - x0 - nw - 40, { anchor: 'start' }) + L(xn, yb + i * pitch, r[1], 'EM', cap, nw + 10, { anchor: 'end' })).join('') +
            TS.arrows.dir(left ? 60 : W - 62, (y0 + cap * 1.05 + yb + (R.length - 1) * pitch) / 2, left ? 270 : 90, 62, AH);
        };
        return svg(W, H, plate(0, 0, W, H) + `<rect x="6" y="${h1 - 2.5}" width="${W - 12}" height="5" fill="${WH}"/>` + part(0, h1, A, true) + part(h1, h2, B, false));
      } },

    // ---- freeway guide signs ----
    { id: 'exit-advance', kind: 'motorway', label: 'Exit advance sign with EXIT tab', regions: null, defaults: { road: 'I-80', dir: 'WEST' },
      draw: ({ name, next, road, dir, exit }) => {
        const nl = lines(name, 'EM', 46, 760);
        const tw = Math.max(...[...nl, next].map((s) => est(s, 'EM', 46))), hdr = markerW(road, 96) + 26 + cardW(dir, 44);
        const W = Math.round(Math.min(1000, Math.max(580, Math.max(tw, hdr, est('1 MILE', 'E', 44)) + 140))), th = 64;
        const t = exitTab(W, th, `EXIT ${exit}`);
        let y = th + 24 + 96 / 2 + 6, body = marker(road, W / 2 - hdr / 2 + markerW(road, 96) / 2, y, 96) + cardinal(W / 2 - hdr / 2 + markerW(road, 96) + 26, y + 22, dir, 44);
        y += 48 + 26;
        for (const s of [...nl, next]) { y += 46; body += L(W / 2, y, s, 'EM', 46, W - 110); y += 30; }
        y += 40; body += `<text x="${W / 2}" y="${y}" font-family="${F.E}" font-size="${em('E', 46).toFixed(1)}" fill="${WH}" text-anchor="middle">1 <tspan font-size="${em('E', 34).toFixed(1)}">MILE</tspan></text>`;
        const H = Math.round(y + 50);
        return svg(W, H, t.svg + plate(0, th, W, H - th) + body);
      } },
    { id: 'exit-only', kind: 'motorway', label: 'Overhead exit sign, EXIT ONLY panel', regions: null, defaults: { road: '31' },
      draw: ({ name, next, road, dir, exit }) => {
        const nl = lines(name, 'EM', 50, 760);
        const tw = Math.max(...[...nl, next].map((s) => est(s, 'EM', 50))), hdr = markerW(road, 84) + (dir ? 24 + cardW(dir, 40) : 0);
        const W = Math.round(Math.min(1000, Math.max(600, Math.max(tw, hdr) + 110))), th = 64;
        const t = exitTab(W, th, `EXIT ${exit}`);
        let y = th + 22 + 42 + 6, body = marker(road, W / 2 - hdr / 2 + markerW(road, 84) / 2, y, 84) + (dir ? cardinal(W / 2 - hdr / 2 + markerW(road, 84) + 24, y + 20, dir, 40) : '');
        y += 42 + 24;
        for (const s of [...nl, next]) { y += 50; body += L(W / 2, y, s, 'EM', 50, W - 90); y += 30; }
        y += 6;
        const H = Math.round(y + 76 + 16);
        return svg(W, H, t.svg + plate(0, th, W, H - th) + exitOnly(14, y, W - 28, 76, 'down') + body);
      } },
    { id: 'lane', kind: 'motorway', label: 'Overhead lane sign, down arrows', regions: null, defaults: { road: 'I-80', dir: 'EAST' },
      draw: ({ name, road, dir }) => {
        const nl = lines(name, 'EM', 48, 760), hdr = markerW(road, 96) + 26 + cardW(dir, 44);
        const W = Math.round(Math.min(1000, Math.max(620, Math.max(hdr, ...nl.map((s) => est(s, 'EM', 48))) + 160))), th = 0;
        let y = 40 + 48 + 4, body = marker(road, W / 2 - hdr / 2 + markerW(road, 96) / 2, y, 96) + cardinal(W / 2 - hdr / 2 + markerW(road, 96) + 26, y + 22, dir, 44);
        y += 48 + 30;
        for (const s of nl) { y += 48; body += L(W / 2, y, s, 'EM', 48, W - 120); y += 30; }
        y += 8 + 60;
        body += arrow(W * 0.3, y, 120, 180) + arrow(W * 0.7, y, 120, 180);
        const H = Math.round(y + 60 + 30);
        return svg(W, H, plate(0, 0, W, H) + body);
      } },
    { id: 'apl', kind: 'motorway', label: 'Two-panel freeway sign, lane arrows', regions: null, defaults: { road: 'I-595', road2: '197', dir: 'EAST' },
      draw: ({ name, next, road, road2, dir, exit }) => {
        const pw = (s, m) => Math.max(est(s, 'EM', 42) + 90, m);
        const w1 = Math.min(600, pw(name, 400)), w2 = Math.min(600, pw(next, 470)), W = Math.round(w1 + w2), th = 56, top = th + 6, H = top + 372;
        const t = exitTab(W, th, `EXIT ${exit}`);
        const h1 = markerW(road, 78) + 22 + cardW(dir, 36);
        let body = marker(road, w1 / 2 - h1 / 2 + markerW(road, 78) / 2, top + 66, 78) + cardinal(w1 / 2 - h1 / 2 + markerW(road, 78) + 22, top + 84, dir, 36) +
          L(w1 / 2, top + 170, name, 'EM', 42, w1 - 70) + marker(road2, w1 + w2 / 2, top + 66, 78) + L(w1 + w2 / 2, top + 170, next, 'EM', 42, w2 - 70) +
          `<line x1="${w1}" y1="${top + 22}" x2="${w1}" y2="${top + 196}" stroke="${WH}" stroke-width="4"/>` +
          arrow(w1 * 0.2, top + 350 - 70, 140, 0) + splitArrow(w1 * 0.64, top + 350, 140) + turnArrow(w1 + w2 / 2 - 10, top + 350, 140) +
          [[w1 + w2 / 2 - 44, 'EXIT', 'end'], [w1 + w2 / 2 + 80, 'ONLY', 'start']].map(([x, t, a]) => { const w = est(t, 'E', 24) + 24, x0 = a === 'end' ? x - w : x;
            return `<rect x="${x0}" y="${top + 350 - 44}" width="${w}" height="44" rx="5" fill="${Y}"/>` + L(x0 + w / 2, top + 350 - 10, t, 'E', 24, w - 12, { fill: BK }); }).join('');
        return svg(W, H, t.svg + plate(0, th, W, H - th) + body);
      } },
    // Clearview lettering, as on the photos from Arkansas, Michigan, Alabama, Oklahoma, Pennsylvania and Texas
    { id: 'exit-clearview', kind: 'motorway', label: 'Exit direction sign, Clearview lettering', defaults: { road: 'US 65B', dir: 'NORTH' },
      regions: ['Arkansas', 'Michigan', 'Alabama', 'Oklahoma', 'Pennsylvania', 'Texas'],
      draw: ({ name, road, exit }) => {
        const nl = lines(name, 'CV', 44, 700);
        const W = Math.round(Math.min(960, Math.max(560, ...nl.map((s) => est(s, 'CV', 44) + 200)))), th = 60;
        const t = exitTab(W, th, `EXIT ${exit}`, 'CV');
        let y = th + 30 + 40, body = marker(road, W / 2 - 60, y, 80);
        y += 40 + 18;
        nl.forEach((s, i) => { y += 44 + (i ? 30 : 0); body += L(W / 2 - 46, y, s, 'CV', 44, W - 200); });
        body += exitArrow(W - 80, y - 40, 96);
        const H = Math.round(y + 44);
        return svg(W, H, t.svg + plate(0, th, W, H - th) + body);
      } },
    { id: 'distance-clearview', kind: 'direction', label: 'Distance sign with arrow, Clearview lettering', regions: ['Texas'],
      draw: ({ name, next, km, dist = 3, dist2 }) => {
        const rows = [[name, dist], [next, dist2 || dist + mi(km)]];
        const nw = Math.max(...rows.map((r) => est(r[0], 'CV', 50))), dw = Math.max(...rows.map((r) => est(String(r[1]), 'CV', 50)));
        const W = Math.round(Math.min(1100, Math.max(600, 130 + nw + 60 + dw + 40))), H = 44 + 50 + 82 + 50 + 44;
        return svg(W, H, plate(0, 0, W, H) + arrow(66, 44 + 50 / 2 + 6, 80, 0) + rows.map((r, i) => { const y = 44 + 50 + i * 82;
          return L(118, y, r[0], 'CV', 50, W - 118 - 40 - dw - 40, { anchor: 'start' }) + L(W - 40, y, r[1], 'CV', 50, dw + 10, { anchor: 'end' }); }).join(''));
      } },
  ];

  TS.add('US', us, { next: 'Springfield', km: 24, exit: 23 });
})();
