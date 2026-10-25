// FR: France's signs that carry a place name, drawn after the GeoHints pictures (city-signs 73-74, direction-signs 128-130,
// street-name-signs 196) and Commons photos for designs GeoHints lacks (refs/FR). examples/FR.json says which picture each follows.
(function () {
  const { T, svg, esc } = TS;
  // Caractères L1 is the Typoroute digitisation (OFL); L2 (the lighter capitals of green and blue signs) is L1 thinned by a
  // stroke in the background colour; L4 (sloped lower case) is stood in for by DINish Medium Italic
  const L1 = "'Typoroute L1',sans-serif", L4 = "'DINish',sans-serif", AR = "'Arimo',sans-serif";
  const RED = '#e8160c', YEL = '#f3b317', GRN = '#00a14b', BLU = '#2b6ed2', BRN = '#3b2f28', NAVY = '#1c1d4e', K = '#111';

  // advance widths (1/1000 em) measured in Firefox, so lines can be laid out before the fonts load
  const mk = (chars, w) => { const m = {}; [...chars].forEach((c, i) => (m[c] = w[i])); m._avg = w.reduce((a, b) => a + b, 0) / w.length; return m; };
  const TAB = {
    l1: mk("0123456789 -’ABCDEFGHIJKLMNOPQRSTUVWXYZÀÂÄÇÈÉÊËÎÏÔÖÙÛÜŸŒkmhtins", [691,465,670,647,700,663,674,626,654,674,375,647,392,721,641,667,662,623,607,691,662,322,620,662,581,838,662,691,663,691,668,700,623,662,725,940,719,746,662,721,721,721,667,623,623,623,623,322,322,691,691,662,662,662,566,996,553,770,490,413,209,490,257]),
    l4: mk("0123456789 !&'()+,-./:;?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝßàáâãäåçèéêëìíîïñòóôõöøùúûüýÿŒœŸ’–ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŹźŻżŽžſ", [499,335,476,497,506,487,501,439,516,501,217,241,597,179,295,295,518,179,393,200,396,200,200,436,586,608,606,613,550,551,606,622,248,318,602,524,753,652,606,573,606,599,547,503,628,533,808,574,512,512,498,512,504,512,508,315,512,521,229,227,502,277,818,521,507,512,512,344,466,344,521,452,721,434,453,455,586,586,586,586,586,586,606,542,542,542,542,252,252,252,252,652,606,606,606,606,606,606,628,628,628,628,512,511,498,498,498,498,498,498,504,508,508,508,508,235,235,235,235,521,507,507,507,507,507,507,521,521,521,521,453,453,885,818,512,179,417,586,498,586,498,586,498,606,504,602,504,606,504,606,504,613,580,669,512,542,508,542,508,542,508,542,508,542,508,603,512,606,512,606,512,606,512,622,521,622,521,249,235,248,235,249,235,248,235,248,235,628,486,318,230,602,502,444,524,277,524,277,524,286,556,360,524,277,652,521,652,521,652,521,500,652,521,606,507,606,507,606,507,599,344,599,344,599,344,547,466,547,466,547,466,547,466,486,344,486,344,486,344,625,521,628,521,628,521,628,521,628,521,628,521,808,721,512,453,512,455,512,455,512,455,278]),
  };
  const em = (s, f) => [...String(s)].reduce((a, c) => a + (TAB[f][c] ?? TAB[f]._avg), 0) / 1000;
  const KERN = 0.032;   // Typoroute L1 spaces its capitals by kerning, about 0.032 em per letter pair
  const w1 = (s) => em(s, 'l1') + Math.max(0, [...s].length - 1) * KERN;
  const CAP1 = 0.7, CAP4 = 0.69;   // cap heights in em: Typoroute L1, DINish
  const WS = 0.2;       // extra word space of the town plates (city-signs 73: words about 0.6 em apart)
  const RS = 0.54;      // small words and the raised T of "St" (city-signs 73)
  const up = (s) => s.replace(/'/g, '’').toUpperCase();

  // ---- the name as French signs set it
  // town plates (city-signs 73): capitals, Saint / Sainte as S with a raised T / TE, hyphens dropped, linking words after
  // the first word small; groups (a word with the small words before it) never break apart
  const SMALL = /^(de|du|des|la|le|les|en|sur|sous|lès|lez|aux|au|et|d’|l’)$/i;
  const tokens = (name, small = true) => {
    const out = [];
    name.replace(/'/g, '’').split(/[\s-]+/).filter(Boolean).forEach((w, i) => {
      if (/^saint$/i.test(w)) return out.push({ t: 'S', sup: 'T' });
      if (/^sainte$/i.test(w)) return out.push({ t: 'S', sup: 'TE' });
      const m = /^([dl]’)(.+)$/i.exec(w);
      if (m && i > 0 && small) { out.push({ t: up(m[1]), small: true, glue: true }); w = m[2]; }
      out.push({ t: up(w), small: small && i > 0 && SMALL.test(w) });
    });
    return out;
  };
  const tokW = (k) => (k.sup ? w1(k.t) + 0.03 + w1(k.sup) * RS : w1(k.t) * (k.small ? RS : 1));
  const lineW = (ts, ws = WS) => ts.reduce((a, k, i) => a + tokW(k) + (i && !ts[i - 1].glue ? 0.375 + ws : 0), 0);   // in em
  const groups = (ts) => { const g = []; let cur = []; ts.forEach((k) => { cur.push(k); if (!k.small && !k.glue) { g.push(cur); cur = []; } }); if (cur.length) g.push(cur); return g; };
  // the fewest lines (up to 3) whose widest stays within lim em, breaking only between groups, most even break first
  const breakLines = (ts, lim, ws = WS) => {
    const g = groups(ts), opts = [[g.flat()]];
    for (let i = 1; i < g.length; i++) opts.push([g.slice(0, i).flat(), g.slice(i).flat()]);
    for (let i = 1; i < g.length; i++) for (let j = i + 1; j < g.length; j++) opts.push([g.slice(0, i).flat(), g.slice(i, j).flat(), g.slice(j).flat()]);
    const score = (o) => Math.max(...o.map((l) => lineW(l, ws)));
    for (const n of [1, 2, 3]) { const c = opts.filter((o) => o.length === n && score(o) <= lim).sort((a, b) => score(a) - score(b)); if (c.length) return c[0]; }
    return opts.sort((a, b) => score(a) - score(b))[0];
  };
  // one line of tokens as a <text>: small words at RS of the size, the raised T/TE of St/Ste top-aligned with the S;
  // maxw and the size let TS.fitDOM correct it in the real font
  const tline = (ts0, x, y, z, maxw, { fill = K, anchor = 'middle', ws = WS, extra = '' } = {}) => {
    // words joined by a hyphen go in one run, so the font's own spacing around the hyphen applies
    const ts = [];
    ts0.forEach((k) => { const p = ts[ts.length - 1]; if (p && p.glue && !p.sup && !k.sup && !p.small && !k.small) ts[ts.length - 1] = { ...k, t: p.t + k.t }; else ts.push(k); });
    let back = 0, s = '';
    ts.forEach((k, i) => {
      if (i && !ts[i - 1].glue) s += ' ';
      const dy = (r) => (back ? ` dy="${(back / r).toFixed(3)}em"` : '');
      if (k.sup) { s += `<tspan${dy(1)}>${esc(k.t)}</tspan><tspan font-size="${RS * 100}%" dy="${(-(1 - RS) * CAP1 / RS).toFixed(3)}em">${esc(k.sup)}</tspan>`; back = (1 - RS) * CAP1; return; }
      // a hyphen opening a line: Typoroute's hyphen is wide, pull the word back to it
      if (i === 0 && !k.small && /^-./.test(k.t)) { s += `<tspan>-</tspan><tspan dx="-0.14em">${esc(k.t.slice(1))}</tspan>`; back = 0; return; }
      s += k.small ? `<tspan font-size="${RS * 100}%"${dy(RS)}>${esc(k.t)}</tspan>` : `<tspan${dy(1)}>${esc(k.t)}</tspan>`;
      back = 0;
    });
    return `<text x="${x}" y="${y}" font-family="${L1}" font-size="${z.toFixed(1)}" text-anchor="${anchor}" fill="${fill}" word-spacing="${ws}em" data-maxw="${Math.round(maxw)}" data-max="${z.toFixed(1)}"${extra ? ' ' + extra : ''}>${s}</text>`;
  };
  // L2: L1 thinned by a stroke of the background colour drawn over the letters
  const thin = (bg) => `stroke="${bg}" stroke-width="0.016em" stroke-linejoin="round"`;
  // direction signs keep hyphens (L'OIE, direction-signs 129); Saint still becomes S with a raised T
  const dirTokens = (name) => {
    const out = [];
    name.replace(/'/g, '’').split(/\s+/).filter(Boolean).forEach((w) => {
      const parts = w.split(/(?<=-)/);   // keep the hyphen with the part before it
      parts.forEach((p) => {
        const bare = p.replace(/-$/, '');
        if (/^saint$/i.test(bare)) return out.push({ t: 'S', sup: 'T', glue: false });
        if (/^sainte$/i.test(bare)) return out.push({ t: 'S', sup: 'TE', glue: false });
        out.push({ t: up(p), glue: /-$/.test(p) });
      });
    });
    return out;
  };

  // a destination on direction signs: one line when it fits lim (em), else broken at spaces or hyphens into the fewest,
  // most even lines; a broken hyphen starts the next line (French practice: "CHÂLONS" / "-EN-CHAMPAGNE")
  const dirLines = (name, lim) => {
    const ts = dirTokens(name), n = ts.length, W = (l) => lineW(l, 0);
    if (W(ts) <= lim || n < 2) return [ts];
    const cut = (a, b) => { const l1 = ts.slice(a, b).map((k) => ({ ...k })); if (a > 0 && ts[a - 1].glue) l1[0] = { ...l1[0], t: '-' + l1[0].t }; const last = l1[l1.length - 1]; if (last.glue) l1[l1.length - 1] = { ...last, t: last.t.replace(/-$/, ''), glue: false }; return l1; };
    const opts = [];
    for (let i = 1; i < n; i++) opts.push([cut(0, i), cut(i, n)]);
    for (let i = 1; i < n; i++) for (let j = i + 1; j < n; j++) opts.push([cut(0, i), cut(i, j), cut(j, n)]);
    const score = (o) => Math.max(...o.map(W));
    for (const k of [2, 3]) { const c = opts.filter((o) => o.length === k && score(o) <= lim).sort((a, b) => score(a) - score(b)); if (c.length) return c[0]; }
    return opts.sort((a, b) => score(a) - score(b))[0];
  };
  // text boxes of accented capitals reach about 1.13 em above the baseline in Typoroute
  const acc = (ls) => ls.some((l) => l.some((k) => /[À-ÖØ-ÞŒŸ]/.test(k.t + (k.sup || ''))));

  // ---- town entry and exit plates (city-signs 73, 74; Commons EB10/EB20 for the one-line form)
  const C = 57, Z = C / CAP1, PITCH = 92, LIM = 600 / Z;
  const plate = ({ name, road }, exit) => {
    const ls = breakLines(tokens(name), LIM), n = ls.length, tw = Math.max(...ls.map((l) => lineW(l))) * Z;
    const Wp = Math.max(310, Math.ceil(tw + 105)), Hp = 166 + (n - 1) * PITCH, top = road ? 66 : 8;
    const cw = road ? w1(road) * 57 + 26 : 0, W = Math.max(Wp, cw) + 16, H = top + Hp + 8, cx = W / 2, px = (W - Wp) / 2;
    const y0 = top + Hp / 2 - (C + (n - 1) * PITCH) / 2 + C;
    const xi = px + 19, yi = top + 19, xe = px + Wp - 19, ye = top + Hp - 19;   // inner edge of the border
    return svg(W, H, (road ? `<rect x="${cx - cw / 2}" y="10" width="${cw}" height="51" rx="8" fill="${YEL}" stroke="#c58d10" stroke-width="1.5"/>` +
        T(cx, 55, road, 57, L1, { fill: K }) : '') +
      `<rect x="${px}" y="${top}" width="${Wp}" height="${Hp}" rx="14" fill="#fff" stroke="#cfcfcf" stroke-width="1.5"/>` +
      `<rect x="${px + 14.5}" y="${top + 14.5}" width="${Wp - 29}" height="${Hp - 29}" rx="10" fill="none" stroke="${exit ? K : RED}" stroke-width="9.5"/>` +
      ls.map((l, i) => tline(l, cx, y0 + i * PITCH, Z, Wp - 70)).join('') +
      (exit ? `<clipPath id="pl"><rect x="${xi}" y="${yi}" width="${xe - xi}" height="${ye - yi}" rx="4"/></clipPath><path clip-path="url(#pl)" d="M${xi - 4},${ye + 4} L${xe + 4},${yi + 15} L${xe + 4},${yi - 4} L${xi - 4},${ye - 15} Z" fill="${RED}"/>` : ''));
  };

  const fr = [
    { id: 'eb10', kind: 'entry', label: 'Town entry (EB10)', defaults: { road: 'D 112' }, draw: (o) => plate(o, false) },
    { id: 'eb20', kind: 'exit', label: 'Town exit (EB20)', defaults: { road: 'D 112' }, draw: (o) => plate(o, true) },
    { id: 'lieu-dit', kind: 'hamlet', label: 'Hamlet sign (lieu-dit)', regions: ['Auvergne-Rhône-Alpes'], draw: ({ name, district }) => {
      // Commons photos (Fresnes, Cne de Vaulx; Mairie, Cne de Mornans): dark brown plate, white edge line, spaced white letters
      const c = 46, z = c / CAP4, ls = 0.09, wn = (em(name, 'l4') + [...name].length * ls) * z;
      const sub = district ? `Cne de ${up(district)}` : '', ws = district ? (em(sub, 'l4') + [...sub].length * ls) * z * 0.97 : 0;
      const W = Math.max(560, Math.ceil(Math.max(wn, ws) + 110)), H = district ? 200 : 140;
      const y1 = district ? 92 : 70 + c / 2;
      return svg(W, H, `<rect width="${W}" height="${H}" rx="22" fill="${BRN}"/><rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="15" fill="none" stroke="#f4f1ea" stroke-width="4"/>` +
        T(W / 2, y1, name, z, L4, { fill: '#f4f1ea', weight: '500', ls, maxw: W - 90, max: z }) +
        (district ? `<text x="${W / 2}" y="${y1 + 68}" font-family="${L4}" font-weight="500" font-size="${z.toFixed(1)}" letter-spacing="${ls}em" text-anchor="middle" fill="#f4f1ea" data-maxw="${W - 90}" data-max="${z.toFixed(1)}">C<tspan font-size="55%" dy="-0.75em">ne</tspan><tspan dy="0.41em"> de ${esc(up(district))}</tspan></text>` : ''));
    } },
    { id: 'local-arrow', kind: 'direction', label: 'Local direction sign (white)', draw: ({ name, next }) => {
      // direction-signs 129: white arrow, black border, L1 capitals, one destination a line
      const c = 60, z = c / CAP1, lines = [...dirLines(name, 900 / z), ...dirLines(next, 900 / z)];
      const tw = Math.max(...lines.map((l) => lineW(l, 0))) * z, W = Math.max(640, Math.ceil(45 + tw + 145)), y1 = acc(lines.slice(0, 1)) ? Math.max(91, 1.14 * z) : 91;
      const H = Math.ceil(y1 + (lines.length - 1) * 95 + 29);
      return svg(W, H, `<path d="M6,6 L${W - 96},6 L${W - 7},${H / 2} L${W - 96},${H - 6.5} L6,${H - 6.5} Z" fill="#fff" stroke="${K}" stroke-width="12" stroke-linejoin="round"/>` +
        lines.map((l, i) => tline(l, 45, y1 + i * 95, z, W - 190, { anchor: 'start', ws: 0 })).join(''));
    } },
    { id: 'green-route', kind: 'direction', label: 'Main-route sign (green)', draw: ({ name, km }) => {
      // direction-signs 130: green arrow with white edge, white capitals and the distance
      const c = 48, z = c / CAP1, ts = dirTokens(name).map((k) => ({ ...k })), tw = lineW(ts, 0) * z, kw = w1(String(km)) * z;
      const W = Math.max(640, Math.ceil(36 + tw + 70 + kw + 103)), H = 110;
      // the white plate (thin grey edge, rounded tip) and the green field, whose own point is blunter, so the white edge
      // widens towards the tip (TS.arrows.plate)
      const pl = TS.arrows.plate({ x: 1.5, y: 1.5, w: W - 3, h: H - 3, dir: 'right', tip: 70, r: 8, rTip: 6, rNeck: 2, fill: GRN, ink: '#fff', outer: '#fff',
        edge: '#c8c8c8', edgeW: 1.2, band: 6, fieldTip: 0.92, fieldStart: 10, rField: 3 });
      return svg(W, H, pl.svg +
        tline(ts, 36, 78, z, W - 36 - 70 - kw - 103, { anchor: 'start', fill: '#fff', ws: 0, extra: thin(GRN) }) +
        T(W - 103, 78, String(km), z, L1, { anchor: 'end', fill: '#fff', extra: thin(GRN) }));
    } },
    { id: 'autoroute', kind: 'motorway', label: 'Motorway sign (blue)', defaults: { road: 'A 62' }, draw: ({ name, next, road, eroad }) => {
      // direction-signs 128: route plate on top, blue panel, a sloped mixed-case line (L4) over capitals (L2), lane arrows
      const ci = 33, zi = ci / CAP4, lsI = 0.1, cc = 37.5, zc = cc / CAP1, lsC = 0.1;
      const wi = (em(next, 'l4') + [...next].length * lsI) * zi;
      const caps = dirLines(name, 420 / zc);
      const wc = Math.max(...caps.map((l) => (lineW(l, 0) + l.reduce((a, k) => a + [...k.t].length, 0) * lsC))) * zc;
      const Wp = Math.max(500, Math.ceil(Math.max(wi, wc) + 80)), W = Wp + 4, n = 1 + caps.length, Hp = 317 + Math.max(0, n - 3) * 58;
      // the green European-route plate joined to the red one (A62 E72 in the picture): eroad, else E72 for the A 62 default
      const e = String(eroad ?? (road === 'A 62' ? 'E 72' : '')).replace(/\s/g, ''), ew = e ? w1(e) * 50 + 24 : 0;
      const pw = w1(road.replace(/\s/g, '')) * 50 + 24, cx = W / 2, top = 60, px = cx - ew / 2;   // px: the red plate's centre, the pair centred
      const y0 = top + 56 + Math.max(0, 3 - n) * 29, arrowY = top + Hp - 100;
      const arrow = (x) => `<path d="M${x - 12.5},${arrowY} L${x + 12.5},${arrowY} L${x + 12.5},${arrowY + 23} L${x + 55},${arrowY + 23} L${x},${arrowY + 75} L${x - 55},${arrowY + 23} L${x - 12.5},${arrowY + 23} Z" fill="#f2f2f2"/>`;
      const EG = '#2a8a55';
      return svg(W, top + Hp + 2, `<rect x="${px - pw / 2}" y="10" width="${pw}" height="45" fill="#c43b2c"/>` +
        T(px, 48, road.replace(/\s/g, ''), 50, L1, { fill: '#f2f2f2', ls: 0.06, extra: thin('#c43b2c') }) +
        (e ? `<rect x="${px + pw / 2}" y="10" width="${ew}" height="45" fill="${EG}"/>` + T(px + pw / 2 + ew / 2, 48, e, 50, L1, { fill: '#f2f2f2', ls: 0.06, extra: thin(EG) }) : '') +
        `<rect x="${px - pw / 2}" y="10" width="${pw + ew}" height="45" fill="none" stroke="#e8e8e8" stroke-width="2"/>` +
        `<rect x="2" y="${top}" width="${Wp}" height="${Hp}" rx="3" fill="${BLU}" stroke="#e8e8e8" stroke-width="2.5"/>` +
        T(cx, y0, next, zi, L4, { fill: '#f2f2f2', weight: '500', style: 'italic', ls: lsI, maxw: Wp - 60, max: zi }) +
        caps.map((l, i) => tline(l, cx, y0 + 58 * (i + 1), zc, Wp - 60, { fill: '#f2f2f2', ws: 0, extra: `letter-spacing="${lsC}em" ` + thin(BLU) })).join('') +
        arrow(cx - Wp * 0.345) + arrow(cx + Wp * 0.345));
    } },
    { id: 'street', kind: 'street', label: 'Street plate with town name', draw: ({ name }) => {
      // street-name-signs 196 (La Garenne-Colombes): municipal enamel plate, town name in italics on top, then the street
      const W = 600, H = 360, z = 44;
      const screw = (x, y) => `<circle cx="${x}" cy="${y}" r="17" fill="none" stroke="#e9e9e9" stroke-width="3"/><circle cx="${x}" cy="${y}" r="7" fill="#cfd3d6"/>`;
      return svg(W, H, `<rect width="${W}" height="${H}" rx="6" fill="#4e9a3f"/><rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="4" fill="${NAVY}"/>` +
        `<path d="M58,30 L542,30 A28,28 0 0 0 570,58 L570,302 A28,28 0 0 0 542,330 L58,330 A28,28 0 0 0 30,302 L30,58 A28,28 0 0 0 58,30 Z" fill="none" stroke="#e9e9e9" stroke-width="3"/>` +
        screw(36, 36) + screw(W - 36, 36) + screw(36, H - 36) + screw(W - 36, H - 36) +
        T(W / 2, 94, name, z, AR, { fill: '#f0f0f0', weight: '700', style: 'italic', maxw: 400, max: z, extra: 'text-decoration="underline"' }) +
        T(W / 2, 180, 'RUE', 66, AR, { fill: '#f0f0f0', weight: '700' }) + T(W / 2, 258, 'DE LA MAIRIE', 66, AR, { fill: '#f0f0f0', weight: '700', maxw: 470, max: 66 }));
    } },
    { id: 'lieu-dit-e31', kind: 'hamlet', label: 'Hamlet sign (dark)', draw: ({ name, district }) => {
      // Commons photos from some 15 departments (Chassignol Cne de Cusset, La Grande Breuille, Le Gathier, Gogney, ...):
      // a near-black plate with a thin white rim, widely spaced sloped white lower case (L4); a long name goes on two
      // lines (Hameau / de Verte Fontaine), the commune under it smaller, "Cne de" and the commune in capitals
      const DK = '#232426', WH = '#f1f1ee', c = 50, z = c / CAP4, ls = 0.07, c2 = 0.64 * c, z2 = c2 / CAP4, LIMW = 780;
      const wd = (s, k = z) => (em(s, 'l4') + [...s].length * ls) * k;
      const ws = String(name).split(' ');
      let L = [String(name)];
      if (wd(name) > LIMW && ws.length > 1) {
        const cuts = ws.slice(1).map((_, i) => [ws.slice(0, i + 1).join(' '), ws.slice(i + 1).join(' ')]);
        L = cuts.sort((a, b) => Math.max(wd(a[0]), wd(a[1])) - Math.max(wd(b[0]), wd(b[1])))[0];
      }
      const dn = district ? up(district) : '', de = /^[AEIOUYÀÂÉÈÊÎÔH]/.test(dn) ? 'd’' : 'de ';
      const wDist = district ? wd(`Cne ${de}${dn}`, z2) : 0;
      const tw = Math.max(...L.map((l) => wd(l)), wDist), W = Math.ceil(Math.max(5.2 * c, Math.min(tw, LIMW + 80) + 1.9 * c));
      const pad = 0.85 * c, pitch = 1.5 * c, H = Math.ceil(pad + c + (L.length - 1) * pitch + (district ? 0.62 * c + c2 : 0) + pad);
      const o = { fill: WH, weight: '500', style: 'italic', ls, maxw: W - 1.6 * c, max: z };
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${0.36 * c}" fill="${WH}" stroke="#b9b9b6" stroke-width="1"/>` +
        `<rect x="${0.09 * c}" y="${0.09 * c}" width="${W - 0.18 * c}" height="${H - 0.18 * c}" rx="${0.28 * c}" fill="${DK}"/>` +
        L.map((l, i) => T(W / 2, pad + c + i * pitch, l, z, L4, o)).join('') +
        (district ? `<text x="${W / 2}" y="${(H - pad).toFixed(1)}" font-family="${L4}" font-weight="500" font-style="italic" font-size="${z2.toFixed(1)}" letter-spacing="${ls}em" text-anchor="middle" fill="${WH}" data-maxw="${Math.round(W - 1.6 * c)}" data-max="${z2.toFixed(1)}">C<tspan font-size="62%" dy="-0.62em">ne</tspan><tspan dy="0.384em"> ${esc(de + dn)}</tspan></text>` : ''));
    } },
    // group I: bike direction sign (véloroute), after Commons photos (Pontpoint: SENLIS 15 / PONTPOINT 1,5; Saint-Jean-de-
    // Braye; Innenheim): white plate with a thin green rim, the point of the arrow left white between green corners, the
    // cyclist (Commons SC2) white on a green square at the blunt end, green spaced capitals, km with a small decimal
    { id: 'velo', kind: 'bike', label: 'Bike direction sign (white and green)', draw: ({ name, next, km }) => {
      const H = 200, VG = '#00805a', z = 50 / CAP1, ls = 0.08, sq = 122, x0 = 36 + sq + 34, T0 = 96;
      const far = Math.max(1, km), near = Math.max(0.5, Math.round(far * 0.3 * 10) / 10);
      const parts = (v) => (v >= 10 ? [String(Math.round(v)), ''] : [String(Math.floor(v)), ',' + String(Math.round(v * 10) % 10)]);
      const rows = [[up(name), parts(far)], ...(next ? [[up(next), parts(near)]] : [])], two = rows.length > 1;
      const zz = two ? z : z * 1.1, wl = (s) => (w1(s) + [...s].length * ls) * zz;
      const nw = Math.min(1150, Math.max(...rows.map(([s]) => wl(s)))), dw = Math.max(...rows.map(([, p]) => w1(p[0]) * zz + w1(p[1]) * zz * 0.7));
      const W = Math.round(x0 + nw + 50 + dw + 24 + T0), kx = W - T0 - 24 - Math.max(...rows.map(([, p]) => w1(p[1]) * zz * 0.7));
      const ys = two ? [88, 166] : [128];
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="#fff" stroke="#bdbdb8" stroke-width="2"/>` +
        `<path d="M${W - T0},8 H${W - 8} V${H - 8} H${W - T0} L${W - 18},${H / 2} Z" fill="${VG}"/>` +
        `<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="9" fill="none" stroke="${VG}" stroke-width="4"/>` +
        `<rect x="36" y="${(H - sq) / 2}" width="${sq}" height="${sq}" fill="${VG}"/>` + TS.bike(36 + sq / 2, H / 2 + 2, sq * 0.88, '#fff', { style: 'sc2' }) +
        rows.map(([s, p], i) => T(x0, ys[i], s, zz, L1, { anchor: 'start', fill: VG, ls, maxw: Math.round(nw), max: zz }) +
          T(kx, ys[i], p[0], zz, L1, { anchor: 'end', fill: VG }) + (p[1] ? T(kx, ys[i], p[1], zz * 0.7, L1, { anchor: 'start', fill: VG }) : '')).join(''));
    } },
  ];

  TS.add('FR', fr, { km: 52, next: 'Montaigu' });
})();
