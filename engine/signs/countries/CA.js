// CA: signs carrying a place name, drawn after GeoHints direction signs 225–228 and Commons photos (examples/CA.json lists
// which). Provinces have their own designs: every template seen only in one province carries `regions`. Highway Gothic
// (Roadgeek 2014 Series C/D/E/EM stand in) on most signs; Clearview (Signika stands in) on the British Columbia freeway sign.
// Names in Inuktitut syllabics fall back to Noto Sans Canadian Aboriginal.
// Extra fields besides the kit's: pop (population as printed), dist (km printed for `name`; `next` then gets dist + km),
// dist2 (km printed for `next`), exits (count on the BC "NEXT n EXITS" panel), road2, dir.
(function () {
  const { T, svg } = TS;
  const CAP = 0.571;                                   // Roadgeek 2014 cap height per em
  const SYL = "'Noto Sans Canadian Aboriginal'";
  const F = { C: `'RG2014 Series C',${SYL},sans-serif`, D: `'RG2014 Series D',${SYL},sans-serif`, E: `'RG2014 Series E',${SYL},sans-serif`,
    EM: `'RG2014 Series EM',${SYL},sans-serif`, CV: `'Signika',${SYL},sans-serif` };
  const WID = { C: [0.377, 0.315], D: [0.449, 0.367], E: [0.524, 0.392], EM: [0.538, 0.495], CV: [0.59, 0.496] };  // advance per em (CV incl. its spacing)
  const CAPH = { CV: 0.687 };
  const G = '#006b45', BL = '#0b4ea2', Y = '#f6c500', WH = '#fff', BK = '#111', QR = '#c4122f', QB = '#00539b';
  const em = (f, cap) => cap / (CAPH[f] || CAP);
  const isCaps = (s) => String(s) === String(s).toUpperCase();
  const est = (s, f, cap) => [...String(s)].length * WID[f][isCaps(s) ? 0 : 1] * em(f, cap);
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
  const plate = (x, y, w, h, { fill = G, ink = WH, r = 16, inset = 6, bw = 5 } = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>` +
    `<rect x="${x + inset}" y="${y + inset}" width="${w - 2 * inset}" height="${h - 2 * inset}" rx="${Math.max(3, r - inset)}" fill="none" stroke="${ink}" stroke-width="${bw}"/>`;
  const stack = (rows, { minW = 420, maxW = 960, pad = 48, top = 46, bottom = 46, fill = G, ink = WH, r = 16 } = {}) => {
    const W = Math.round(Math.min(maxW, Math.max(minW, Math.max(...rows.map((r) => r.w || est(r.s, r.f, r.cap))) + 2 * pad)));
    let y = top, body = '';
    rows.forEach((r, i) => { y += (i ? r.gap : 0) + r.cap; body += r.draw ? r.draw(W, y) : L(W / 2, y, r.s, r.f, r.cap, W - 2 * pad, { fill: ink, ...(r.o || {}) }); });
    const H = Math.round(y + bottom);
    return svg(W, H, plate(0, 0, W, H, { fill, ink, r }) + body);
  };
  const nameRows = (name, f, cap, room, gap, o) => lines(name, f, cap, room).map((s, i) => ({ s, f, cap, gap: i ? gap : 0, o }));
  const popStr = (p) => (typeof p === 'number' ? String(p).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(p));
  const arrow = (x, y, len, deg, fill = WH) =>
    `<path transform="translate(${x},${y}) rotate(${deg}) scale(${len / 100})" d="M-9,50 L-9,-8 L-27,-8 L0,-50 L27,-8 L9,-8 L9,50 Z" fill="${fill}"/>`;
  const curve = (x, y0, x2, y2, cy, h, fill) => {
    const ang = Math.atan2(y2 - cy, x2 - x) * 180 / Math.PI + 90;
    return `<path d="M${x},${y0} Q${x},${cy} ${x2},${y2}" fill="none" stroke="${fill}" stroke-width="${h * 0.12}"/>` +
      `<path transform="translate(${x2},${y2}) rotate(${ang})" d="M${-h * 0.15},${h * 0.07} L0,${-h * 0.15} L${h * 0.15},${h * 0.07} Z" fill="${fill}"/>`;
  };
  const turnArrow = (x, yb, h, fill = WH) => `<path d="M${x},${yb} L${x},${yb - h * 0.4}" stroke="${fill}" stroke-width="${h * 0.12}"/>` +
    curve(x, yb - h * 0.4 + 1, x + h * 0.3, yb - h * 0.82, yb - h * 0.78, h, fill);
  const splitArrow = (x, yb, h, fill = WH) => arrow(x, yb - h / 2, h, 0, fill) + curve(x, yb - h * 0.3, x + h * 0.3, yb - h * 0.66, yb - h * 0.62, h * 0.8, fill);
  // a tall lane arrow with a slim shaft (British Columbia picture): from yb up to yt
  const tallArrow = (x, yb, yt, sw, hw, hl, fill = WH) =>
    `<path d="M${x - sw / 2},${yb} L${x - sw / 2},${yt + hl} L${x - hw / 2},${yt + hl} L${x},${yt} L${x + hw / 2},${yt + hl} L${x + sw / 2},${yt + hl} L${x + sw / 2},${yb} Z" fill="${fill}"/>`;
  // a left-turn arrow as on the New Brunswick sign: shaft up, head pointing left at the top
  const leftTurn = (x, yb, h, fill = WH) => `<path d="M${x + h * 0.18},${yb} L${x + h * 0.18},${yb - h * 0.62} L${x - h * 0.05},${yb - h * 0.62}" fill="none" stroke="${fill}" stroke-width="${h * 0.14}"/>` +
    `<path d="M${x - h * 0.05},${yb - h * 0.86} L${x - h * 0.3},${yb - h * 0.62} L${x - h * 0.05},${yb - h * 0.38} Z" fill="${fill}"/>`;

  // ---- route markers ----
  const LEAF = 'm4890 4430-45-863a95 95 0 0 1 111-98l859 151-116-320a65 65 0 0 1 20-73l941-762-212-99a65 65 0 0 1-34-79l186-572-542 115a65 65 0 0 1-73-38l-105-247-423 454a65 65 0 0 1-111-57l204-1052-327 189a65 65 0 0 1-91-27l-332-652-332 652a65 65 0 0 1-91 27l-327-189 204 1052a65 65 0 0 1-111 57l-423-454-105 247a65 65 0 0 1-73 38l-542-115 186 572a65 65 0 0 1-34 79l-212 99 941 762a65 65 0 0 1 20 73l-116 320 859-151a95 95 0 0 1 111 98l-45 863z';
  const leaf = (cx, top, h, fill = WH) => `<path transform="translate(${cx},${top}) scale(${h / 4030}) translate(-4800,-400)" d="${LEAF}" fill="${fill}"/>`;
  // Trans-Canada marker on a green sign: a white leaf with the number in green (British Columbia picture)
  const tchLeaf = (cx, cy, h, n) => leaf(cx, cy - h / 2, h) + L(cx, cy + h * 0.12, n, 'D', h * 0.4, h * 0.5, { fill: G });
  // Trans-Canada marker as a box: TRANS CANADA over a leaf with the number (New Brunswick photo)
  const tchBox = (cx, cy, h, n) => {
    const w = h * 0.78, x = cx - w / 2, y = cy - h / 2;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${G}" stroke="${WH}" stroke-width="3"/>` +
      L(cx, y + h * 0.16, 'TRANS CANADA', 'C', h * 0.08, w - 10) + leaf(cx, y + h * 0.22, h * 0.68) + L(cx, y + h * 0.66, n, 'D', h * 0.3, w * 0.5, { fill: G });
  };
  // King's Highway marker as drawn on Ontario guide signs: a white crown-topped shield with the number (picture 225)
  const CROWN = 'M12,34 C2,32 2,16 14,14 C24,12 30,19 36,21 L41,12 L46,12 L46,5 L42,5 L42,1 L46,1 L46,-3 L54,-3 L54,1 L58,1 L58,5 L54,5 L54,12 L59,12 L64,21 C70,19 76,12 86,14 C98,16 98,32 88,34 C96,52 96,74 88,92 C70,94 30,94 12,92 C4,74 4,52 12,34 Z';
  // (group D) now the Commons crown outline of shared/shields.js, centred on cx, cy
  // (wide: the broader crown of the freeway guide signs, picture 225, about 1.18 times as wide as high)
  const crown = (cx, cy, h, n, ink = BK, wide = 1) => TS.shields.onCrown(cx - TS.shields.onCrown.width(h, wide) / 2, cy - h / 2, h, n, { ink, font: F.D, capEm: CAP, wide });
  // Halton regional road keystone (picture 227)
  const keystone = (cx, cy, h, n) => {
    const w = h * 0.86;
    return `<path d="M${cx - w / 2},${cy - h / 2} L${cx + w / 2},${cy - h / 2} L${cx + w * 0.36},${cy + h / 2} L${cx - w * 0.36},${cy + h / 2} Z" fill="${WH}" stroke="${BK}" stroke-width="3"/>` +
      L(cx, cy + h * 0.25, n, 'D', h * 0.56, w * 0.7, { fill: BK });
  };
  // Quebec autoroute marker: red band with an overpass, blue field with the number and a fleur-de-lis (picture 228)
  const FLEUR = 'M0,-10 C4,-6 4,-1 1.6,3 L1.6,4 L6,4 C5,0 9,-3 11,0 C12,3 8,5 6,5 L1.6,5 L1.6,6 L4,6 L4,7.5 L1.6,7.5 L2.5,11 L-2.5,11 L-1.6,7.5 L-4,7.5 L-4,6 L-1.6,6 L-1.6,5 L-6,5 C-8,5 -12,3 -11,0 C-9,-3 -5,0 -6,4 L-1.6,4 L-1.6,3 C-4,-1 -4,-6 0,-10 Z';
  const QSH = 'M2,2 L98,2 L98,66 C98,92 62,104 50,118 C38,104 2,92 2,66 Z';
  // (group D) now the Commons autoroute shield of shared/shields.js, centred on cx, cy
  const autoroute = (cx, cy, h, n) => TS.shields.qcAutoroute(cx - TS.shields.qcAutoroute.width(h) / 2, cy - h / 2, h, n, { font: F.D, capEm: CAP });
  // New Brunswick route marker: the province's outline with NB and the number (photos of routes 885, 100)
  const NBP = 'M6,6 L44,6 L50,11 L58,8 L66,13 L74,10 L80,16 L84,26 L90,32 L93,46 L97,58 L92,68 L86,72 L82,82 L72,86 L62,90 L52,95 L44,93 L6,94 Z';
  // (group D) now the Commons route marker of shared/shields.js (black for routes 200 and up, blue below), centred on
  // cx, cy; the colour follows the number there, so `fill` is no longer used
  const nbShield = (cx, cy, h, n, fill = BK) => TS.shields.nbRoute(cx - h / 2, cy - h / 2, h, n, { font: F.D, capEm: CAP });

  const ca = [
    // ---- place-name signs ----
    { id: 'qc-limite', kind: 'entry', label: 'Municipality sign', regions: ['Québec'],
      draw: ({ name, district }) => stack([...nameRows(name.toUpperCase(), 'E', 66, 860, 24),
        ...(district ? [{ s: `(${district})`, f: 'EM', cap: 50, gap: 32 }] : [])], { minW: 380, maxW: 960, top: 40, bottom: district ? 54 : 40, r: 20 }) },
    { id: 'on-community', kind: 'entry', label: 'Community sign (blue)', regions: ['Ontario'],
      draw: ({ name }) => stack(nameRows(name.toUpperCase(), 'D', 60, 760, 24), { minW: 340, maxW: 860, top: 38, bottom: 38, fill: BL, r: 8 }) },
    { id: 'on-population', kind: 'entry', label: 'Community sign with population (blue)', regions: ['Ontario'], needs: ['pop'],
      draw: ({ name, pop }) => {
        const rows = nameRows(name.toUpperCase(), 'E', 70, 860, 24);
        if (pop) rows.push({ cap: 40, gap: 30, w: est(`POPULATION ${popStr(pop)}`, 'D', 40) + 80,
          draw: (W, y) => L(48, y, 'POPULATION', 'D', 40, W * 0.55, { anchor: 'start' }) + L(W - 48, y, popStr(pop), 'D', 40, W * 0.35, { anchor: 'end' }) });
        return stack(rows, { minW: 460, maxW: 960, top: 40, bottom: 38, fill: BL, r: 8 });
      } },
    { id: 'pe-community', kind: 'entry', label: 'Community sign (blue)', regions: ['Prince Edward Island'],
      draw: ({ name }) => stack(nameRows(name, 'D', 58, 760, 30), { minW: 360, maxW: 860, top: 36, bottom: 44, fill: BL, r: 8 }) },
    { id: 'ns-community', kind: 'entry', label: 'Community sign', regions: ['Nova Scotia'],
      draw: ({ name }) => stack(nameRows(name, 'EM', 62, 520, 36).map((r) => ({ ...r, o: { ls: 0.06 } })), { minW: 380, maxW: 760, top: 44, bottom: 50, r: 8 }) },
    { id: 'nb-limit', kind: 'entry', label: 'Town limit, bilingual', regions: ['New Brunswick'],
      draw: ({ name }) => {
        const nm = name.replace(/(\S)-(\S)/, '$1 - $2');
        return stack([...nameRows(nm, 'EM', 52, 560, 34).map((r, i, a) => (a.length > 1 && i === 0 && /-$/.test(r.s) ? r : r)),
          { s: 'TOWN LIMIT', f: 'D', cap: 34, gap: 46 },
          { cap: 0, gap: 16, w: 10, draw: (W, y) => `<line x1="${W * 0.2}" y1="${y}" x2="${W * 0.8}" y2="${y}" stroke="${WH}" stroke-width="4"/>` },
          { s: 'LIMITE DE LA VILLE', f: 'D', cap: 34, gap: 18 }], { minW: 420, maxW: 760, top: 42, bottom: 40, r: 14 });
      } },
    { id: 'bc-entering', kind: 'entry', label: 'Entering city, freeway', regions: ['British Columbia'],
      draw: ({ name, exits }) => {
        const nl = lines(name, 'EM', 52, 640);
        const W = Math.round(Math.min(820, Math.max(440, ...nl.map((s) => est(s, 'EM', 52) + 110), exits ? est(`NEXT ${exits} EXITS`, 'D', 40) + 100 : 0)));
        let y = 40 + 36, body = L(W / 2, y, 'ENTERING', 'D', 36, W - 80, { fill: BK, ls: 0.08 });
        y += 26 + 28; body += L(W / 2, y, 'CITY OF', 'D', 28, W - 80, { fill: BK, ls: 0.1 });
        for (const s of nl) { y += 28 + 52; body += L(W / 2, y, s, 'EM', 52, W - 80, { fill: BK }); y -= 8; }
        const h1 = Math.round(y + 44 + 8), H = exits ? h1 + 96 : h1;
        const box = `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="16" fill="${WH}" stroke="${BK}" stroke-width="6"/>` +
          (exits ? `<line x1="3" y1="${h1}" x2="${W - 3}" y2="${h1}" stroke="${BK}" stroke-width="5"/>` + L(W / 2, h1 + 68, `NEXT ${exits} EXITS`, 'D', 40, W - 70, { fill: BK, ls: 0.06 }) : '');
        return svg(W, H, box + body);
      } },

    // ---- direction and distance signs ----
    { id: 'distance', kind: 'direction', label: 'Distance sign (km)', regions: null,
      draw: ({ name, next, km, dist = 8, dist2 }) => {
        const rows = [[name, dist], [next, dist2 || dist + Math.max(1, Math.round(km))]];
        const nw = Math.max(...rows.map((r) => est(r[0], 'EM', 52))), dw = Math.max(...rows.map((r) => est(String(r[1]), 'EM', 52)));
        const W = Math.round(Math.min(1300, Math.max(520, 46 + nw + 70 + dw + 46))), H = 46 + 52 + 88 + 52 + 46;
        return svg(W, H, plate(0, 0, W, H, { r: 12 }) + rows.map((r, i) => { const y = 46 + 52 + i * (52 + 36);
          return L(46, y, r[0], 'EM', 52, W - 46 - 46 - dw - 50, { anchor: 'start' }) + L(W - 46, y, r[1], 'EM', 52, dw + 10, { anchor: 'end' }); }).join(''));
      } },
    { id: 'direction', kind: 'direction', label: 'Direction sign with arrows (km)', regions: null,
      draw: ({ name, next, km, dist = 8, dist2 }) => {
        const d2 = dist2 || Math.max(1, Math.round(km) - dist);
        const kmw = est('km', 'D', 30) * 1.2 + 14, nw = (d) => est(String(d), 'D', 54) * 1.15;
        const rw = (s, d) => est(s, 'D', 54) + 40 + nw(d) + kmw;
        const W = Math.round(Math.min(1100, Math.max(560, Math.max(rw(name, dist), rw(next, d2)) + 100 + 50 + 40)));
        const row = (y, s, d, left) => {
          const x0 = left ? 120 : 40, x1 = left ? W - 40 : W - 130;
          // Saskatoon photo: a thin shaft under a long head with swept-back barbs (TS.arrows)
          const sw = { w: 13, fill: WH, head: { half: 1.9, back: 2.6, neck: 1.8 } };
          return (left ? TS.arrows.dir(68, y - 27, 270, 72, sw) : TS.arrows.dir(W - 72, y - 27, 90, 72, sw)) +
            L(x0, y, s, 'D', 54, x1 - x0 - nw(d) - kmw - 40, { anchor: 'start' }) +
            `<text x="${x1}" y="${y}" font-family="${F.D}" font-size="${em('D', 54).toFixed(1)}" fill="${WH}" text-anchor="end">${d}<tspan font-size="${em('D', 30).toFixed(1)}" dx="6">km</tspan></text>`;
        };
        return svg(W, 240, plate(0, 0, W, 240, { r: 10 }) + row(40 + 54, name, dist, true) + row(40 + 54 + 92, next, d2, false));
      } },
    { id: 'direction-qc', kind: 'direction', label: 'Direction sign, panels with arrows', regions: ['Québec'],
      draw: ({ name, next, km, dist = 8, dist2 }) => {
        const d2 = dist2 || Math.max(1, Math.round(km) - dist);
        const rows = [[name.toUpperCase(), dist, 0], [next.toUpperCase(), d2, -90]];
        const dw = Math.max(...rows.map((r) => est(String(r[1]), 'D', 50) * 1.15));
        const W = Math.round(Math.min(1100, Math.max(560, ...rows.map((r) => est(r[0], 'D', 50) + dw + 190)))), ph = 96;
        return svg(W, ph * 2 + 12, `<rect x="0" y="0" width="${W}" height="${ph * 2 + 12}" rx="12" fill="${G}"/>` +
          rows.map((r, i) => { const y = 6 + i * ph;
            return `<rect x="6" y="${y}" width="${W - 12}" height="${ph}" rx="${i ? 0 : 8}" fill="none" stroke="${WH}" stroke-width="4"/>` +
              arrow(56, y + ph / 2, 62, r[2]) + L((100 + W - 26 - dw - 30) / 2, y + ph / 2 + 25, r[0], 'D', 50, W - 26 - dw - 30 - 110) + L(W - 26, y + ph / 2 + 25, r[1], 'D', 50, dw + 10, { anchor: 'end' }); }).join(''));
      } },
    { id: 'direction-nb', kind: 'direction', label: 'Direction sign, bilingual cardinal', regions: ['New Brunswick'], defaults: { road: '2' },
      draw: ({ name, next, road }) => {
        const W = Math.round(Math.min(900, Math.max(560, ...[name, next].map((s) => est(s, 'EM', 50) + 120)))), ph = 250;
        const panel = (y, s, d1, d2, up) => `<rect x="6" y="${y + 6}" width="${W - 12}" height="${ph - 12}" rx="10" fill="none" stroke="${WH}" stroke-width="5"/>` +
          (up ? arrow(W * 0.17, y + 88, 120, 0) : leftTurn(W * 0.17, y + 150, 130)) + tchBox(W * 0.5, y + 82, 112, road) +
          L(W * 0.8, y + 64, d1, 'D', 34, W * 0.24) + `<line x1="${W * 0.69}" y1="${y + 84}" x2="${W * 0.91}" y2="${y + 84}" stroke="${WH}" stroke-width="4"/>` + L(W * 0.8, y + 124, d2, 'D', 34, W * 0.24) +
          L(W / 2, y + 206, s, 'EM', 50, W - 80);
        return svg(W, ph * 2, `<rect x="0" y="0" width="${W}" height="${ph * 2}" rx="16" fill="${G}"/>` + panel(0, name, 'EAST', 'EST', true) + panel(ph, next, 'WEST', 'OUEST', false));
      } },

    // ---- freeway guide signs ----
    { id: 'on-exit', kind: 'motorway', label: 'Freeway exit sign, yellow EXIT plate', regions: ['Ontario'], defaults: { road: '7' },
      draw: ({ name, next, road }) => {
        const keyR = /^RR/i.test(road), num = String(road).replace(/^RR\s*/i, '');
        const tw = Math.max(est(name, 'EM', 52) + 120, est(next, 'EM', 50) + 40);
        const W = Math.round(Math.min(1300, Math.max(900, tw + 470))), H = 290, tx = W - 450;
        const m = keyR ? keystone(70, 70, 80, num) : crown(76, 64, 90, num);
        return svg(W, H, plate(0, 0, W, H, { r: 8, inset: 5, bw: 4 }) + m +
          L(134, 98, name, 'EM', 52, tx - 134, { anchor: 'start' }) + L((134 + tx) / 2, 196, next, 'EM', 50, tx - 150) +
          // GeoHints 227 (FHWA style): the through arrow with a branch growing out of its shaft and curving up to the right,
          // the exit arrow a stem curving the same way; plain heads, the branch heads larger (TS.arrows)
          (() => { const sx = W - 340, tx = W - 124;
            return TS.arrows.straight(sx, 238, sx, 49, { w: 20, fill: WH, head: { half: 1.15, back: 1.75, neck: 1.6 } }) +
              TS.arrows.group([{ pts: [[sx, 228], [sx, 140, 110], [sx + 118, 59]] }, { pts: [[tx, 196], [tx, 128, 60], [tx + 72, 55]], w: 21 }],
                { w: 18, fill: WH, head: { half: 1.5, back: 2.3, neck: 2.0 } }); })() +
          `<rect x="${W - 205}" y="${H - 84}" width="170" height="56" rx="4" fill="${Y}" stroke="${BK}" stroke-width="3"/>` + L(W - 120, H - 40, 'EXIT', 'E', 30, 130, { fill: BK }));
      } },
    { id: 'on-blue', kind: 'motorway', label: 'Blue freeway guide sign', regions: ['Ontario'], defaults: { road: '401', dir: 'EAST' },
      draw: ({ name, road, dir, exit }) => {
        const nl = lines(name, 'EM', 50, 620);
        const hw = 130 + 30 + est(dir, 'E', 46);
        const W = Math.round(Math.min(1000, Math.max(620, Math.max(hw, ...nl.map((s) => est(s, 'EM', 50))) + 260))), th = 62;
        const tab = String(exit), tw = Math.max(150, est(tab, 'E', 38) + 70);
        let body = crown(54 + 65, th + 92, 104, road, BK, 1.08) + L(54 + 130 + 30, th + 126, String(dir).toUpperCase(), 'E', 46, W - 420, { anchor: 'start' });
        let y = th + 160;
        for (const s of nl) { y += 50; body += L(54, y, s, 'EM', 50, W - 300, { anchor: 'start' }); y += 30; }
        const H = Math.round(Math.max(y + 40, th + 290));
        body += turnArrow(W - 120, H - 40, 170);
        return svg(W, H, plate(W - tw, 0, tw, th + 20, { fill: BL, r: 6, inset: 5, bw: 4 }) + L(W - tw / 2, th * 0.5 + 19, tab, 'E', 38, tw - 30) +
          plate(0, th, W, H - th, { fill: BL, r: 6, inset: 5, bw: 4 }) + body);
      } },
    { id: 'bc-guide', kind: 'motorway', label: 'Freeway guide sign, Trans-Canada leaf', regions: ['British Columbia'], defaults: { road: '1' },
      draw: ({ name, next, road }) => {
        const nw = Math.max(est(name, 'CV', 54), est(next, 'CV', 54));
        const W = Math.round(Math.min(1200, Math.max(820, nw + 560))), H = 560;
        const row = (y, s, d, x0) => L(x0, y, s, 'CV', 54, W - x0 - 340, { anchor: 'start' }) + tchLeaf(W - 268, y - 24, 132, road) + L(W - 184, y - 2, d, 'CV', 40, 150, { anchor: 'start' });
        return svg(W, H, plate(0, 0, W, H, { r: 22, inset: 7, bw: 5 }) + row(110, name, 'WEST', 54) +
          `<line x1="${W * 0.22}" y1="186" x2="${W - 40}" y2="186" stroke="${WH}" stroke-width="5"/>` + row(276, next, 'EAST', 270) +
          tallArrow(110, 530, 140, 40, 110, 80) + turnArrow(W * 0.6, 530, 210) +
          [[W * 0.6 - 40, 'EXIT', 'end'], [W * 0.6 + 110, 'ONLY', 'start']].map(([x, t, a]) => { const w = est(t, 'E', 42) + 40, x0 = a === 'end' ? x - w : x;
            return `<rect x="${x0}" y="452" width="${w}" height="74" rx="8" fill="${Y}" stroke="${BK}" stroke-width="3"/>` + L(x0 + w / 2, 510, t, 'E', 42, w - 24, { fill: BK }); }).join(''));
      } },
    { id: 'qc-autoroute', kind: 'motorway', label: 'Autoroute exit sign, yellow exit band', regions: ['Québec'], defaults: { road: '440', dir: 'EST', exit: 139 },
      draw: ({ name, district, road, dir, exit }) => {
        const nl = lines(name, 'EM', 64, 760), dl = district ? lines(String(district).toUpperCase(), 'E', 50, 820) : [];
        const W = Math.round(Math.min(1000, Math.max(640, ...nl.map((s) => est(s, 'EM', 64) + 90), ...dl.map((s) => est(s, 'E', 50) + 90))));
        let y = 40 + 80, body = autoroute(W / 2 - 80, y, 150, road) + L(W / 2 + 30, y + 26, String(dir).toUpperCase(), 'E', 52, W / 2 - 60, { anchor: 'start' });
        y += 75 + 20;
        for (const s of nl) { y += 64 + 14; body += L(W / 2, y, s, 'EM', 64, W - 70); }
        for (const s of dl) { y += 50 + 34; body += L(W / 2, y, s, 'E', 50, W - 70, { ls: 0.05 }); }
        const yb = y + 40, H = yb + 170;
        const ex = `${exit}-${String(dir)[0].toUpperCase()}`, ew = est(ex, 'D', 46) + 70;
        const exitPlate = `<path d="M80,${yb + 52} L${80 + ew},${yb + 52} L${80 + ew - 40},${yb + 128} L80,${yb + 128} Q66,${yb + 128} 66,${yb + 114} L66,${yb + 66} Q66,${yb + 52} 80,${yb + 52} Z" fill="${Y}" stroke="${BK}" stroke-width="5"/>` +
          L(80 + (ew - 40) / 2 + 4, yb + 90 + 23, ex, 'D', 46, ew - 50, { fill: BK });
        const sq = `<rect x="${W - 210}" y="${yb + 26}" width="134" height="134" rx="6" fill="${BK}" stroke="${WH}" stroke-width="4"/>` +
          `<path d="M${W - 168},${yb + 140} L${W - 168},${yb + 100} Q${W - 168},${yb + 72} ${W - 140},${yb + 72} L${W - 128},${yb + 72}" fill="none" stroke="${WH}" stroke-width="14"/><path d="M${W - 130},${yb + 52} L${W - 98},${yb + 72} L${W - 130},${yb + 92} Z" fill="${WH}"/>`;
        return svg(W, H, `<rect x="0" y="0" width="${W}" height="${H}" rx="26" fill="${Y}"/><path d="M0,26 Q0,0 26,0 L${W - 26},0 Q${W},0 ${W},26 L${W},${yb} L0,${yb} Z" fill="${G}"/>` +
          `<rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="20" fill="none" stroke="${BK}" stroke-width="5"/><path d="M12,${yb} L12,26 Q12,12 26,12 L${W - 26},12 Q${W - 12},12 ${W - 12},26 L${W - 12},${yb}" fill="none" stroke="${WH}" stroke-width="5"/>` +
          body + exitPlate + sq);
      } },
    { id: 'nb-exit', kind: 'motorway', label: 'Exit sign, number tab', regions: ['New Brunswick'], defaults: { road: '885', exit: 414 },
      draw: ({ name, road, exit }) => {
        const nl = lines(name, 'EM', 56, 640);
        const W = Math.round(Math.min(900, Math.max(560, ...nl.map((s) => est(s, 'EM', 56) + 120)))), th = 70;
        const tab = String(exit), tw = Math.max(170, est(tab, 'E', 46) + 60);
        let y = th + 30 + 70, body = nbShield(160, y, 130, road, /^\d{3}$/.test(String(road)) && +road >= 200 ? BK : '#1f5fae') + arrow(W - 170, y - 8, 150, 45);
        y += 65 + 10;
        for (const s of nl) { y += 56 + 18; body += L(W / 2, y, s, 'EM', 56, W - 80, { ls: 0.04 }); }
        const H = Math.round(y + 44);
        return svg(W, H, plate(W - tw, 0, tw, th + 20, { r: 10 }) + L(W - tw / 2, th * 0.5 + 24, tab, 'E', 40, tw - 30) + plate(0, th, W, H - th, { r: 22 }) + body);
      } },
  ];

  TS.add('CA', ca, { next: 'Kingston', km: 38, exit: 23 });
})();
