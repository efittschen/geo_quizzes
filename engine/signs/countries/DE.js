// DE: Germany's signs that carry a place name, drawn after the GeoHints pictures (city-signs 77-80, direction-signs 134-136)
// and, for designs GeoHints lacks, pictures from Wikimedia Commons (refs/DE). examples/DE.json says which picture each follows.
(function () {
  const { T, svg } = TS;
  // DIN 1451 Mittelschrift is stood in for by DINish Medium; long names switch to Engschrift (DINish Condensed Medium)
  const F = "'DINish','D-DIN',sans-serif", FC = "'DINish Condensed','DINish',sans-serif";
  const Y = '#f1c900', K = '#0a0a0a', R = '#c20f19', G = '#058358', B = '#154889', WH = '#fff';

  // advance widths (1/1000 em) of the two faces, measured in Firefox, so lines can be laid out before the fonts load
  const mk = (chars, w) => { const m = {}; [...chars].forEach((c, i) => (m[c] = w[i])); m._avg = w.reduce((a, b) => a + b, 0) / w.length; return m; };
  const TAB = {
    din: mk("0123456789 !&'()+,-./:;?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝßàáâãäåçèéêëìíîïñòóôõöøùúûüýÿŒœŸ’–ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŹźŻżŽžſ", [499,335,476,497,506,487,501,439,516,501,217,241,597,179,295,295,518,179,393,200,396,200,200,436,586,608,606,613,550,551,606,622,248,318,602,524,753,652,606,573,606,599,547,503,628,533,808,574,512,512,498,512,504,512,508,315,512,521,229,227,502,277,818,521,507,512,512,344,466,344,521,452,721,434,453,455,586,586,586,586,586,586,606,542,542,542,542,252,252,252,252,652,606,606,606,606,606,606,628,628,628,628,512,511,498,498,498,498,498,498,504,508,508,508,508,235,235,235,235,521,507,507,507,507,507,507,521,521,521,521,453,453,885,818,512,179,417,586,498,586,498,586,498,606,504,602,504,606,504,606,504,613,580,669,512,542,508,542,508,542,508,542,508,542,508,603,512,606,512,606,512,606,512,622,521,622,521,249,235,248,235,249,235,248,235,248,235,628,486,318,230,602,502,500,524,277,524,277,524,286,611,355,524,277,652,521,652,521,652,521,500,652,521,606,507,606,507,606,507,599,344,599,344,599,344,547,466,547,466,547,466,547,466,486,344,486,344,486,344,625,521,628,521,628,521,628,521,628,521,628,521,808,721,512,453,512,455,512,455,512,455,333]),
    dinC: mk("0123456789 !&'()+,-./:;?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝßàáâãäåçèéêëìíîïñòóôõöøùúûüýÿŒœŸ’–ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŹźŻżŽžſ", [404,280,394,402,419,400,396,367,404,396,175,204,517,156,263,263,420,156,367,164,297,164,164,367,469,465,475,472,403,401,475,472,207,264,461,383,589,492,475,438,475,464,426,382,473,432,661,415,399,376,401,410,407,410,408,287,410,413,200,198,412,235,638,413,409,410,410,295,385,297,413,383,587,359,383,379,469,469,469,469,469,469,475,394,394,394,394,207,207,207,207,492,475,475,475,475,475,475,473,473,473,473,399,415,401,401,401,401,401,401,407,408,408,408,408,200,200,200,200,413,409,409,409,409,409,409,413,413,413,413,383,383,669,643,399,156,417,469,401,469,401,469,401,475,407,475,407,475,407,475,407,472,485,497,410,394,408,394,408,394,408,394,408,394,408,475,410,475,410,475,410,475,410,472,413,472,413,207,200,207,200,207,200,207,200,203,200,473,404,264,198,461,412,500,383,235,383,235,383,251,611,355,383,235,492,413,492,413,492,413,500,492,413,475,409,475,409,475,409,464,295,464,295,464,295,426,385,426,385,426,385,426,385,367,297,367,309,367,297,473,413,473,413,473,413,473,413,473,413,473,413,661,587,399,383,376,379,376,379,376,379,333]),
  };
  const CAP = 0.69;   // cap height of DINish in em
  const em = (s, f) => [...String(s)].reduce((a, c) => a + (TAB[f][c] ?? TAB[f]._avg), 0) / 1000;
  const fam = (f) => (f === 'dinC' ? FC : F);
  // one line at cap height `cap`: Mittelschrift when it fits `base`, else Engschrift (as German signs set long names),
  // shrunk only when even that passes `maxw`
  const pick = (s, cap, base, maxw) => {
    const z = cap / CAP, wd = em(s, 'din') * z;
    if (wd <= base) return { s, f: 'din', z, w: wd };
    const wc = em(s, 'dinC') * z;
    return wc <= maxw ? { s, f: 'dinC', z, w: wc } : { s, f: 'dinC', z: maxw / em(s, 'dinC'), w: maxw };
  };
  const scale = (l, k) => ({ ...l, z: l.z * k, w: l.w * k });
  const same = (ls) => { const z = Math.min(...ls.map((l) => l.z)); return ls.map((l) => scale(l, z / l.z)); };
  const put = (l, x, y, maxw, o = {}) => T(x, y, l.s, l.z, fam(l.f), { weight: '500', maxw: Math.round(maxw), max: +l.z.toFixed(1), ...o });
  const num = (x, y, s, size, o = {}) => T(x, y, s, size, F, { weight: '500', ...o });

  // "Buchholz in der Nordheide" -> ["Buchholz", "in der Nordheide"]: the suffix of an official name goes small on its own line
  const SUF = /^(.+?) ((?:am|an der|an den|auf der|auf dem|bei|im|in der|in den|in|ob der|vor der|unter|a\.|i\.) .+|\(.+\))$/;
  const suffix = (s) => { const m = SUF.exec(s); return m ? [m[1], m[2]] : null; };
  // a long name broken at its most even hyphen or space; a hyphen starts the second line ("Düsseldorf" / "-Benrath", Commons 448)
  const halves = (s) => {
    let best = null;
    [...s].forEach((c, i) => {
      if ((c !== '-' && c !== ' ') || i === 0 || i === s.length - 1) return;
      const a = s.slice(0, i), b = c === '-' ? s.slice(i) : s.slice(i + 1), d = Math.abs(em(a, 'din') - em(b, 'din'));
      if (!best || d < best.d) best = { a, b, d };
    });
    return best && [best.a, best.b];
  };
  // a place name as the signs set it: one line (Engschrift when long), the name big with its suffix small below,
  // or two equal lines broken at a hyphen or space
  const block = (name, cap, base, maxw, sufRatio = 0.5, split = false) => {
    const one = pick(name, cap, base, maxw);
    if (one.f === 'din') return [one];
    if (split && !suffix(name)) { const h = halves(name), hs = h && h.map((p) => pick(p, cap, base, maxw)); if (hs && hs.every((l) => l.f === 'din')) return hs; }
    const sx = suffix(name);
    if (sx) return [pick(sx[0], cap, base, maxw), pick(sx[1], cap * sufRatio, base, maxw)];
    if (one.w < maxw) return [one];
    const h = halves(name);
    return h ? same(h.map((p) => pick(p, cap * 0.8, base, maxw))) : [one];
  };
  // gaps between the lines of a block: a suffix sits closer than a second full line
  const gaps = (ls, k = 0.25) => ls.map((l, i) => ({ l, gap: i ? ls[0].z * CAP * k : 0 }));
  // stack lines centred on cy (descenders of the last line counted), shrunk together when taller than h
  // and, with lim = [top, bottom], every line's text box (DINish: 1.03 em above the baseline, 0.25 em below) inside it
  const stack = (items, cy, h, lim) => {
    const caps = items.map((it) => it.l.z * CAP), last = items[items.length - 1].l;
    const tot = caps.reduce((a, c) => a + c, 0) + items.reduce((a, it, i) => a + (i ? it.gap : 0), 0) + (/[gjpqy(),;]/.test(last.s) ? last.z * CAP * 0.25 : 0);
    let k = Math.min(1, h / tot), out;
    for (let n = 0; n < 8; n++) {
      let y = cy - (tot * k) / 2;
      out = items.map((it, i) => { if (i) y += it.gap * k; const l = scale(it.l, k); y += l.z * CAP; return { l, y }; });
      if (!lim) break;
      const top = Math.min(...out.map((o) => o.y - 1.03 * o.l.z)), bot = Math.max(...out.map((o) => o.y + 0.25 * o.l.z));
      if (bot - top > lim[1] - lim[0]) { k *= (lim[1] - lim[0]) / (bot - top) * 0.995; continue; }
      const dy = top < lim[0] ? lim[0] - top : bot > lim[1] ? lim[1] - bot : 0;
      out.forEach((o) => (o.y += dy));
      break;
    }
    return out;
  };
  const widest = (ls) => Math.max(...ls.map((l) => l.w));

  // ---- arrows
  // open-headed arrow of the town and table signs (city-signs 78, direction-signs 136): shaft and a chevron with
  // upright cut ends; drawn pointing up from its tip at (0,0), s = scale, len = overall length
  const chev = (x, y, dir, s, len, fill = K) => {
    const p = [[0, 0], [39, 39], [39, 61], [9, 31], [9, len / s], [-9, len / s], [-9, 31], [-39, 61], [-39, 39]].map(([a, b]) => `${a * s},${b * s}`).join(' ');
    return `<polygon transform="translate(${x},${y}) rotate(${{ up: 0, right: 90, left: -90 }[dir]})" points="${p}" fill="${fill}"/>`;
  };
  // solid triangular head at the end (x,y) of a stroked path, pointing along (dx,dy)
  const head = (x, y, dx, dy, len, half, fill) => {
    const n = Math.hypot(dx, dy), ux = dx / n, uy = dy / n;
    const pts = [[x + ux * len, y + uy * len], [x - uy * half, y + ux * half], [x + uy * half, y - ux * half]];
    return `<polygon points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="${fill}" stroke-width="3" stroke-linejoin="round"/>`;
  };

  // ---- route-number plates
  // Bundesstraße number on a yellow sign: black-edged box (direction-signs 135, 136)
  const bW = (road, h) => Math.max(h * 1.8, em(road, 'din') * h * 0.88 + h * 0.6);
  const bPlate = (x, y, road, h, o = {}) => {
    const size = h * 0.88, w = bW(road, h);
    return { w, svg: `<rect x="${x}" y="${y}" width="${w.toFixed(1)}" height="${h}" rx="${h * 0.16}" fill="${o.fill || 'none'}" stroke="${K}" stroke-width="${h * 0.06}"/>` + num(x + w / 2, y + h * 0.805, road, size) };
  };
  // Autobahn number: white box with a blue field bulging at top and bottom (direction-signs 134)
  const aW = (road, h) => Math.max(h * 1.67, em(road, 'din') * h * 0.58 + h * 1.1);
  const aPlate = (x, y, road, h) => {
    const size = h * 0.58, w = aW(road, h), b = h * 0.06, q = h * 0.1;
    return { w, svg: `<rect x="${x}" y="${y}" width="${w.toFixed(1)}" height="${h}" rx="${h * 0.09}" fill="${WH}"/>` +
      `<path d="M${x + b},${y + b + q} Q${x + w / 2},${y + b - q * 0.6} ${x + w - b},${y + b + q} L${x + w - b},${y + h - b - q} Q${x + w / 2},${y + h - b + q * 0.6} ${x + b},${y + h - b - q} Z" fill="${B}"/>` +
      num(x + w / 2, y + h * 0.71, road, size, { fill: WH }) };
  };

  // ---- frames
  const yellowFrame = (W, H) => `<rect width="${W}" height="${H}" rx="22" fill="${Y}"/><rect x="12.3" y="12.3" width="${W - 24.6}" height="${H - 24.6}" rx="12" fill="none" stroke="${K}" stroke-width="9.6"/>`;
  const WIDE = 1.9;   // long names widen a town sign up to 1.9 times its standard width, as on real long-name signs

  // Zeichen 310 (city-signs 77): name, the district line below when given
  const ortstafel = ({ name, district }) => {
    const H = 427, base = 548, maxw = 640 * WIDE - 92;
    const ls = block(name, 114, base, maxw), items = gaps(ls, ls.length > 1 && ls[1].z < ls[0].z * 0.8 ? 0.3 : 0.25);
    if (district) items.push({ l: pick(district, 48, base, maxw), gap: Math.max(ls[ls.length - 1].z * CAP * 0.5, 40) });
    const W = Math.max(640, Math.ceil(widest(items.map((it) => it.l)) + 92));
    return svg(W, H, yellowFrame(W, H) + stack(items, 213.5, 350).map(({ l, y }) => put(l, W / 2, y, W - 92)).join(''));
  };

  const de = [
    { id: 'ortstafel', kind: 'entry', label: 'Town entry (Zeichen 310)', draw: ortstafel },
    { id: 'ortsende', kind: 'exit', label: 'Town exit, next town above (Zeichen 311)', draw: ({ name, next, km }) => {
      const H = 427, base = 548, maxw = 640 * WIDE - 92, ubase = 450, umax = ubase + 640 * (WIDE - 1);
      const up = block(next, 79, ubase, umax, 0.55), kl = pick(`${km} km`, 45, ubase, umax), lo = block(name, 115, base, maxw);
      const W = Math.max(640, Math.ceil(Math.max(widest(up), kl.w) + 190), Math.ceil(widest(lo) + 92));
      const cxu = (40 + W - 145) / 2, x0 = 17.1, y0 = 217.3, x1 = W - 17.1, y1 = 409.9;
      const su = stack([...gaps(up, 0.3), { l: kl, gap: 21 }], 117.5, 172), sl = stack(gaps(lo, 0.28), 313.5, 165);
      return svg(W, H, yellowFrame(W, H) + `<rect x="${x0}" y="207.7" width="${x1 - x0}" height="9.6" fill="${K}"/>` +
        `<clipPath id="lo"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/></clipPath>` +
        `<path clip-path="url(#lo)" d="M${x0},${y1 + 26.5} L${x1},${y0 + 26.5} L${x1},${y0 - 19.5} L${x0},${y1 - 19.5} Z" fill="${R}"/>` +
        chev(W - 92.5, 36, 'up', 1, 136) +
        su.map(({ l, y }) => put(l, cxu, y, W - 190)).join('') + sl.map(({ l, y }) => put(l, W / 2, y, W - 92)).join(''));
    } },
    { id: 'ortsende-kreis', kind: 'exit', label: 'Town exit with district (Zeichen 311)', draw: (o) => {
      const s = ortstafel(o), W = +/viewBox="0 0 ([\d.]+)/.exec(s)[1], H = 427;
      const band = `<clipPath id="in"><rect x="17.1" y="17.1" width="${W - 34.2}" height="${H - 34.2}" rx="7"/></clipPath>` +
        `<path clip-path="url(#in)" d="M17.1,${H - 13} L${W - 17.1},43 L${W - 17.1},9 L17.1,${H - 47} Z" fill="${R}"/>`;
      return s.replace(/(<text)/, band + '$1');
    } },
    { id: 'ortshinweis', kind: 'hamlet', label: 'Hamlet sign (Zeichen 385)', draw: ({ name }) => {
      const H = 214, base = 560, maxw = 900 - 80;
      const ls = block(name, 86, base, maxw), W = Math.max(640, Math.ceil(widest(ls) + 80));
      return svg(W, H, `<rect width="${W}" height="${H}" rx="18" fill="${Y}"/><rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="11" fill="${G}"/>` +
        stack(gaps(ls, 0.3), 107, 172, [0, H]).map(({ l, y }) => put(l, W / 2, y, W - 80, { fill: Y })).join(''));
    } },
    { id: 'pfeilwegweiser', kind: 'direction', label: 'Arrow sign, federal road (Zeichen 415)', draw: ({ name, next, km, road }) => {
      const H = 240, cap = 55, z = cap / CAP, ks = z * 0.725, km2 = km + 9;
      const numW = (n) => em(String(n), 'din') * z;
      const colR = (w) => w - 179;           // numbers end at the column, "km" follows
      const plate = road ? bPlate(180, 84, road, 72) : { w: 0, svg: '' };
      const x = road ? 360 : 200, room = 783 - 30 - Math.max(numW(km), numW(km2)) - x;
      const l1 = pick(name, cap, room, room + 400), l2 = pick(next, cap, room, room + 400);
      const W = Math.max(960, Math.ceil(x + Math.max(l1.w, l2.w) + 30 + Math.max(numW(km), numW(km2)) + 177));
      const c = colR(W);
      // the arrow outline offset inwards by d (slant edges at 36°): yellow edge, black border 13 wide, yellow field
      const shape = (d, r) => `M${1.685 * d},120 L${159.9 + 0.33 * d},${2 + d} L${W - 2 - d - r},${2 + d} Q${W - 2 - d},${2 + d} ${W - 2 - d},${2 + d + r} L${W - 2 - d},${238 - d - r} Q${W - 2 - d},${238 - d} ${W - 2 - d - r},${238 - d} L${159.9 + 0.33 * d},${238 - d} Z`;
      const lay = (d, r, c) => `<path d="${shape(d, r)}" fill="${c}" stroke="${c}" stroke-width="8" stroke-linejoin="round"/>`;
      return svg(W, H, lay(4, 24, Y) + lay(14, 18, K) + lay(27, 8, Y) + plate.svg +
        put(l1, x, 101, c - 30 - numW(km) - x, { anchor: 'start' }) + num(c, 101, String(km), z, { anchor: 'end' }) + num(c + 22, 101, 'km', ks, { anchor: 'start' }) +
        put(l2, x, 191, c - 30 - numW(km2) - x, { anchor: 'start' }) + num(c, 191, String(km2), z, { anchor: 'end' }) + num(c + 22, 191, 'km', ks, { anchor: 'start' }));
    } },
    { id: 'pfeil-klein', kind: 'direction', label: 'Arrow sign, minor road (Zeichen 419)', draw: ({ name }) => {
      const H = 241, ls = block(name, 95, 650, 1100, 0.55), Wt = Math.ceil(widest(ls)), W = Math.max(960, Wt + 60 + 250);
      const tip = W - 2, hx = W - 140;
      return svg(W, H, `<path d="M32,1 L${hx - 30},1 Q${hx - 10},1 ${hx + 8},12 L${tip - 12},108 Q${tip},120 ${tip - 12},133 L${hx + 8},229 Q${hx - 10},240 ${hx - 30},240 L32,240 Q1,240 1,209 L1,32 Q1,1 32,1 Z" fill="${Y}"/>` +
        stack(gaps(ls, 0.3), 120.5, 190, [0, H]).map(({ l, y }) => put(l, 58, y, hx - 70, { anchor: 'start' })).join(''));
    } },
    { id: 'vorwegweiser', kind: 'direction', label: 'Advance direction sign (Zeichen 438)', draw: ({ name, next, road }) => {
      const H = 426, cap = 31, z = cap / CAP;
      const top = pick(name, cap, 330, 900), nx = block(next, cap, 220, 700, 0.8);
      const pw = road ? bW(road, 38) : 0, topW = (road ? pw + 25 : 0) + top.w;
      const span = Math.max(124 + 111, 152 + widest(nx)) + 21;               // from the left head's edge to the end of the text
      const W = Math.max(640, Math.ceil(span + 84), Math.ceil(topW + 84));
      const a = (W - span) / 2 + 21, b = a + 62, r = a + 124, xt = r + 28;   // straight arrows at a and b, right turn at r
      let gx = (a + b) / 2 - topW / 2; gx = Math.min(Math.max(gx, 42), W - 42 - topW);
      const sw = 14, up = (x) => `<path d="M${x},392 L${x},124" stroke="${K}" stroke-width="${sw}" fill="none"/>` + head(x, 125, 0, -1, 33, 21, K);
      const ny = nx.length > 1 ? [190, 242] : [242];
      return svg(W, H, `<rect width="${W}" height="${H}" rx="16" fill="${Y}"/><rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="10" fill="none" stroke="${K}" stroke-width="6"/>` +
        (road ? bPlate(gx, 33, road, 38).svg : '') +
        put(top, gx + (road ? pw + 25 : 0), 68, top.w + 2, { anchor: 'start' }) + up(a) + up(b) +
        `<path d="M${r},392 L${r},322 A40,40 0 0 1 ${r + 40},282 L${r + 78},282" stroke="${K}" stroke-width="${sw}" fill="none"/>` + head(r + 77, 282, 1, 0, 33, 21, K) +
        nx.map((l, i) => put(l, xt, ny[i], W - 42 - xt, { anchor: 'start' })).join(''));
    } },
    { id: 'wegweisertafel', kind: 'direction', label: 'Direction table (Zeichen 434)', draw: ({ name, next, km, road }) => {
      const H = 246, cap = 32, z = cap / CAP, ks = z * 0.75, km2 = km + 9;
      const nw = (n) => em(String(n), 'din') * z, kmw = em('km', 'din') * ks;
      const plate = road ? bPlate(133, 46.5, road, 38) : { w: 0, svg: '' };
      const x1 = road ? 133 + plate.w + 24 : 131;
      const l1 = pick(name, cap, 541 - nw(km) - 24 - x1, 900), l2 = pick(next, cap, 640 - 55 - 131 - 24 - nw(km2) - 12 - kmw, 900);
      const W = Math.max(640, Math.ceil(x1 + l1.w + 24 + nw(km) + 99), Math.ceil(131 + l2.w + 24 + nw(km2) + 12 + kmw + 55));
      const c = W - 99, e2 = 131 + l2.w + 24;
      return svg(W, H, `<rect width="${W}" height="${H}" rx="16" fill="${Y}"/><rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="10" fill="none" stroke="${K}" stroke-width="6"/>` +
        `<rect x="12" y="119" width="${W - 24}" height="7" fill="${K}"/>` +
        chev(75, 31.5, 'up', 0.86, 68) + chev(41.5, 180, 'left', 0.86, 68) + plate.svg +
        put(l1, x1, 81.5, c - 24 - nw(km) - x1, { anchor: 'start' }) + num(c, 81.5, String(km), z, { anchor: 'end' }) + num(c + 12, 81.5, 'km', ks, { anchor: 'start' }) +
        put(l2, 131, 196, W - 55 - 131 - 24 - nw(km2) - 12 - kmw, { anchor: 'start' }) + num(e2, 196, String(km2), z, { anchor: 'start' }) + num(e2 + nw(km2) + 12, 196, 'km', ks, { anchor: 'start' }));
    } },
    { id: 'autobahn', kind: 'motorway', label: 'Motorway advance sign (Zeichen 449)', draw: ({ name, next, road }) => {
      const H = 640, cap = 51, base = 345;
      const t = pick(next, cap, base, base + 260), ex = block(name, cap, base, base + 260, 0.8, true);
      const W = Math.max(591, Math.ceil(206 + Math.max(t.w, widest(ex)) + 46));
      const plate = aPlate(49, 46, road, 70), ey = ex.length > 1 ? [286, 367] : [340];
      return svg(W, H, `<rect width="${W}" height="${H}" rx="16" fill="${WH}"/><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="10" fill="${B}"/>` +
        plate.svg + put(t, 206, 110, W - 252, { anchor: 'start', fill: WH }) +
        `<path d="M108.5,592 L108.5,200" stroke="${WH}" stroke-width="22"/>` + head(108.5, 202, 0, -1, 54, 33.5, WH) +
        `<path d="M108.5,590 L108.5,565 C108.5,520 120,500 145,481 L205,435" stroke="${WH}" stroke-width="22" fill="none"/>` + head(203, 436.5, 60, -46, 54, 33.5, WH) +
        ex.map((l, i) => put(l, 206, ey[i], W - 252, { anchor: 'start', fill: WH })).join('') + num(206, 593, '500', cap / CAP, { anchor: 'start', fill: WH }) + num(206 + (em('500', 'din') + 0.1) * cap / CAP, 593, 'm', cap / CAP, { anchor: 'start', fill: WH }));
    } },
    { id: 'autobahn-ankuendigung', kind: 'motorway', label: 'Motorway exit notice (Zeichen 448)', draw: ({ name, exit }) => {
      const H = 906, cap = 110, ls = block(name, cap, 740, 1100, 0.8, true), W = Math.max(960, Math.ceil(widest(ls) + 220));
      const lines = ls.length > 1 ? ls : [ls[0]], ys = lines.length > 1 ? [469, 640] : [555];
      const cx = W / 2, ez = 95 / CAP, ew = Math.max(199, em(String(exit), 'din') * ez + 60);
      return svg(W, H, `<rect width="${W}" height="${H}" rx="26" fill="${WH}"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="18" fill="${B}"/>` +
        // exit pictogram (carriageway with a lane curving off) and the junction number in a ring
        `<g transform="translate(${cx - 480},0)" fill="${WH}"><polygon points="200,280 250,95 280,95 275,280"/><polygon points="300,280 290,95 311,95 342,280"/>` +
        `<path d="M352,282 L352,262 C352,212 362,176 405,150" fill="none" stroke="${WH}" stroke-width="32"/>` + head(402, 152, 55, -47, 64, 42, WH) + '</g>' +
        `<circle cx="${cx + 179 + (ew - 199) / 2}" cy="186.5" r="${ew / 2 - 5.5}" fill="none" stroke="${WH}" stroke-width="11"/>` + num(cx + 179 + (ew - 199) / 2, 234, String(exit), ez, { fill: WH }) +
        lines.map((l, i) => put(l, cx, ys[i], W - 220, { fill: WH })).join('') + num(cx, 811, '1000 m', cap / CAP, { fill: WH }));
    } },
    { id: 'autobahn-ausfahrt', kind: 'motorway', label: 'Motorway exit sign (Zeichen 332)', draw: ({ name, next }) => {
      const H = 805, cap = 108, l1 = pick(name, cap, 738, 1100), l2 = pick(next, cap, 738, 1100);
      const W = Math.max(960, Math.ceil(Math.max(l1.w, l2.w) + 111 + 111));
      // white edge (Commons z332: 16.4 wide, corners 38 outside and 22 inside), with the drawing's thin dark line around it
      return svg(W, H, TS.frames.plate(W, H, [{ r: 38.4, fill: WH }, { i: 16.4, r: 21.9, fill: B }], { rim: true }) +
        put(l1, 111, 203, W - 222, { anchor: 'start', fill: WH }) + put(l2, 111, 377, W - 222, { anchor: 'start', fill: WH }) +
        `<path d="M${W / 2 - 112},696 L${W / 2 + 70},514" stroke="${WH}" stroke-width="36"/>` + head(W / 2 + 52, 532, 1, -1, 90, 62, WH));
    } },
    { id: 'entfernungstafel', kind: 'motorway', label: 'Motorway distance table (Zeichen 453)', draw: ({ name, next, km, road }) => {
      const H = 450, cap = 75, z = cap / CAP, ks = z * 0.72, km2 = km + 41;
      const nw = (n) => em(String(n), 'din') * z, kmw = em('km', 'din') * ks, col = Math.max(nw(km), nw(km2));
      const l1 = pick(name, cap, 812 - col - 40 - kmw - 14, 1300), l2 = pick(next, cap, 812 - col - 40 - kmw - 14, 1300);
      const W = Math.max(960, Math.ceil(74 + Math.max(l1.w, l2.w) + 40 + col + 14 + kmw + 74));
      const c = W - 74 - kmw - 14;
      // white edge (Commons z453: 14.7 wide, corners 20 outside and 5 inside), with the drawing's thin dark line around it
      return svg(W, H, TS.frames.plate(W, H, [{ r: 19.7, fill: WH }, { i: 14.7, r: 4.9, fill: B }], { rim: true }) +
        aPlate((W - aW(road, 113)) / 2, 65, road, 113).svg +
        put(l1, 74, 290, c - 40 - nw(km) - 74, { anchor: 'start', fill: WH }) + num(c, 290, String(km), z, { anchor: 'end', fill: WH }) + num(c + 14, 290, 'km', ks, { anchor: 'start', fill: WH }) +
        put(l2, 74, 403, c - 40 - nw(km2) - 74, { anchor: 'start', fill: WH }) + num(c, 403, String(km2), z, { anchor: 'end', fill: WH }) + num(c + 14, 403, 'km', ks, { anchor: 'start', fill: WH }));
    } },
    { id: 'rad', kind: 'bike', label: 'Bike direction sign', regions: ['Niedersachsen'], draw: ({ name, next, km }) => {
      const H = 240, cap = 44, z = cap / CAP, GR = '#0b7a3e', km2 = Math.max(1, km - 5);
      const d = (n) => `${n},0`, nw = (s) => em(s, 'din') * z, col = Math.max(nw(d(km)), nw(d(km2)));
      const l1 = pick(name, cap, 430, 900), l2 = pick(next, cap, 430, 900);
      const W = Math.max(760, Math.ceil(40 + Math.max(l1.w, l2.w) + 40 + col + 30 + 120 + 30)), c = W - 180;
      const bike = (x, y) => `<g transform="translate(${x},${y})" fill="none" stroke="${GR}" stroke-width="5"><circle cx="0" cy="0" r="20"/><circle cx="62" cy="0" r="20"/><path d="M0,0 L18,-30 L50,-30 L62,0 M18,-30 L31,0 L50,-30 M14,-40 L26,-40 M50,-30 L46,-42 L56,-42" stroke-linejoin="round" stroke-linecap="round"/></g>`;
      return svg(W, H, `<rect width="${W}" height="${H}" rx="10" fill="${WH}"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="6" fill="none" stroke="${GR}" stroke-width="4"/>` +
        put(l1, 40, 96, c - 40 - col - 40, { anchor: 'start', fill: GR }) + num(c, 96, d(km), z, { anchor: 'end', fill: GR }) +
        put(l2, 40, 186, c - 40 - col - 40, { anchor: 'start', fill: GR }) + num(c, 186, d(km2), z, { anchor: 'end', fill: GR }) +
        `<path d="M${c + 36},72 L${c + 104},72" stroke="${GR}" stroke-width="16"/>` + head(c + 102, 72, 1, 0, 34, 30, GR) + bike(c + 50, 182));
    } },
    // group I: the standard bike arrow sign (Pfeilwegweiser) with red lettering, after Commons photos from
    // Nordrhein-Westfalen (Gummersbach/Marienheide, Hilchenbach/Altenteich): white plate, thin red rim ending in a
    // thick red chevron at the pointing end, bicycle before it; the far destination on top, distances under 10 km
    // with one smaller decimal hanging right of the aligned whole kilometres
    // red lettering only where Commons photos show it (group I: NRW, Hamburg, and Niedersachsen beside its green design);
    // the 13 states with green photos have rad-gruen, Saarland has no photo with a place name
    { id: 'rad-rot', kind: 'bike', label: 'Bike direction sign (red)', regions: ['Nordrhein-Westfalen', 'Hamburg', 'Niedersachsen'], draw: ({ name, next, km }, RR = '#b8141e') => {
      const H = 240, cap = 61, kz = 56 / CAP, dz = kz * 0.62;
      const far = Math.max(km, 1), near = Math.max(0.5, Math.round(far * 0.4 * 10) / 10);
      const parts = (v) => (v >= 10 ? [String(Math.round(v)), ''] : [String(Math.floor(v)), ',' + String(Math.round(v * 10) % 10)]);
      const rows = [[name, parts(far)], ...(next ? [[next, parts(near)]] : [])];
      const ls = rows.map(([s]) => pick(s, cap, 640, 1150)), iw = Math.max(...rows.map(([, p]) => em(p[0], 'din') * kz));
      const W = Math.max(860, Math.ceil(52 + Math.max(...ls.map((l) => l.w)) + 72 + iw + 280)), kx = W - 280;
      const ys = rows.length > 1 ? [95, 190] : [142];
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="5" fill="${WH}" stroke="#c9c9c9" stroke-width="2"/>` +
        `<path d="M${W - 124},10 H10 V${H - 10} H${W - 124}" fill="none" stroke="${RR}" stroke-width="5"/>` +
        `<polygon points="${W - 142},7.5 ${W - 104},7.5 ${W - 17},${H / 2} ${W - 104},${H - 7.5} ${W - 142},${H - 7.5} ${W - 55},${H / 2}" fill="${RR}"/>` +
        TS.bike(W - 160, H / 2, 104, RR, { sw: 0.045 }) +
        rows.map(([, p], i) => num(kx, ys[i], p[0], kz, { anchor: 'end', fill: RR }) + (p[1] ? num(kx + 2, ys[i], p[1], dz, { anchor: 'start', fill: RR }) : '')).join('') +
        ls.map((l, i) => put(l, 52, ys[i], kx - iw - 72 - 52, { anchor: 'start', fill: RR })).join(''));
    } },
    // group I: the same arrow sign lettered green, with the even chevron band of the red one (photos: Bayern, Altmühltal
    // and Wunsiedel; Baden-Württemberg, Mosbach; Rheinland-Pfalz; Hessen; Brandenburg); Schleswig-Holstein's wedge is below
    { id: 'rad-gruen', kind: 'bike', label: 'Bike direction sign (green)', regions: ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Rheinland-Pfalz', 'Sachsen', 'Sachsen-Anhalt', 'Thüringen'],
      draw: (o) => de.find((t) => t.id === 'rad-rot').draw(o, '#0e6a3e') },
    // group I: Schleswig-Holstein's green bike sign, after Commons photos (Nordstrand: England 4,4 km / Elis.-Soph.-Koog
    // 1,7 km; Wees: Hafenspitze / Engelsby): the rim runs into a solid wedge that is thickest at the point and tapers to
    // nothing at the corners, the bicycle beside it, bolder lettering, small decimals and "km"
    { id: 'rad-gruen-sh', kind: 'bike', label: 'Bike direction sign (green, wedge point)', regions: ['Schleswig-Holstein'], draw: ({ name, next, km }) => {
      const H = 240, GN = '#0e6a3e', cap = 58, kz = 54 / CAP, dz = kz * 0.62, T0 = 0.6 * H, dep = 0.36 * H;
      const far = Math.max(km, 1), near = Math.max(0.5, Math.round(far * 0.4 * 10) / 10);
      const parts = (v) => (v >= 10 ? [String(Math.round(v)), ''] : [String(Math.floor(v)), ',' + String(Math.round(v * 10) % 10)]);
      const rows = [[name, parts(far)], ...(next ? [[next, parts(near)]] : [])];
      const ls = rows.map(([s]) => pick(s, cap, 640, 1150)), iw = Math.max(...rows.map(([, p]) => em(p[0], 'din') * kz));
      const tail = em(',0', 'din') * dz + em(' km', 'din') * dz;
      const W = Math.max(860, Math.ceil(52 + Math.max(...ls.map((l) => l.w)) * 1.05 + 64 + iw + tail + 150 + T0)), kx = W - T0 - 150 - tail;
      const ys = rows.length > 1 ? [100, 190] : [145], B = (s) => ({ weight: 'bold', fill: GN, ...s });
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="5" fill="${WH}" stroke="#c9c9c9" stroke-width="2"/>` +
        `<path d="M${W - T0},10 H10 V${H - 10} H${W - T0}" fill="none" stroke="${GN}" stroke-width="4.5"/>` +
        `<polygon points="${W - T0},7.8 ${W - 12},${H / 2} ${W - T0},${H - 7.8} ${W - 12 - dep},${H / 2}" fill="${GN}"/>` +
        TS.bike(W - T0 - 66, H / 2, 108, GN) +
        rows.map(([, p], i) => num(kx, ys[i], p[0], kz, B({ anchor: 'end' })) + num(kx + 2, ys[i], (p[1] || '') + ' km', dz, B({ anchor: 'start' }))).join('') +
        ls.map((l, i) => put(l, 52, ys[i], kx - iw - 64 - 52, { anchor: 'start', fill: GN, weight: 'bold' })).join(''));
    } },
  ];

  TS.add('DE', de, { next: 'Rottendorf', km: 6, road: '6', exit: 26 });
})();
