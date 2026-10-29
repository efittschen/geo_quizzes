// IN: Indian signs carrying a place name, drawn after the GeoHints pictures (direction-signs 43; road-number signs
// 56-61) and Commons photos (see examples/IN.json). The state's script comes first, then English (mixed case on
// reflective boards, capitals on painted ones); some national-highway signs add Hindi. The script, and with it the
// font, follows the name itself, so one template serves every state: Tamil in Tamil Nadu, Telugu in Andhra Pradesh
// and Telangana, Devanagari in the Hindi states and Maharashtra, and so on. English spellings are conventional
// (Mangalore, Kasaragod Town), so they come from alt. Kilometre stones carry one script per stone.
(function () {
  const { T, svg } = TS;
  const LAT = "'Arimo',sans-serif";                      // stands in for Transport Medium / Arial on the boards
  const HAND = "'Roboto Condensed',sans-serif";          // the narrow painted capitals of place-name boards
  const SCRIPTS = [   // [range, font, width per code point in em (for sizing boards before TS.fitDOM)]
    [/[ऀ-ॿ]/, 'Noto Sans Devanagari', 0.43], [/[ঀ-৿]/, 'Noto Sans Bengali', 0.47],
    [/[਀-੿]/, 'Noto Sans Gurmukhi', 0.45], [/[઀-૿]/, 'Noto Sans Gujarati', 0.47],
    [/[଀-୿]/, 'Noto Sans Oriya', 0.55], [/[஀-௿]/, 'Noto Sans Tamil', 0.5],
    [/[ఀ-౿]/, 'Noto Sans Telugu', 0.58], [/[ಀ-೿]/, 'Noto Sans Kannada', 0.5],
    [/[ഀ-ൿ]/, 'Noto Sans Malayalam', 0.75], [/[؀-ۿ]/, 'Noto Naskh Arabic', 0.45]];
  const script = (s) => SCRIPTS.find(([re]) => re.test(s));
  const fontOf = (s) => (script(s) ? `'${script(s)[1]}',sans-serif` : LAT);
  const len = (s) => [...String(s)].length;
  const latin = (s) => !script(String(s));
  const em = (s, caps) => len(s) * (script(s) ? script(s)[2] : caps ? 0.68 : 0.52);
  const G = '#00804a', B = '#1d4fa0', INK = '#141414';
  // the local and the English form of a place, whichever of name/alt holds which
  const forms = (name, alt) => {
    const a = [name, alt].filter(Boolean);
    return { loc: a.find((s) => !latin(s)) || null, lat: a.find(latin) || null };
  };
  const wrap = (s, max) => {
    if (!s || len(s) <= max || !s.includes(' ')) return s ? [s] : [];
    const sp = [...s.matchAll(/ /g)].map((m) => m.index).sort((a, b) => Math.abs(a - s.length / 2) - Math.abs(b - s.length / 2))[0];
    return [s.slice(0, sp), s.slice(sp + 1)];
  };
  // a filled arrow (shaft + triangular head), pointing up, left, right or up-left; (x, y) is its centre
  const farrow = (x, y, dir, L, fill, shaft = 9) => {
    const r = { up: 0, right: 90, left: -90, upleft: -45, upright: 45 }[dir], s = L / 100;
    return `<g transform="translate(${x},${y}) rotate(${r}) scale(${s})"><path d="M-${shaft},50 L-${shaft},-12 L-28,-12 L0,-50 L28,-12 L${shaft},-12 L${shaft},50 Z" fill="${fill}"/></g>`;
  };
  // the highway arrow of the photos (direction-signs 43, Coimbatore gantry, Keshiya-Dhrol board): a long slim shaft (6.5
  // shafts long) under a chevron head whose barb ends are cut parallel to the shaft (TS.arrows); (x, y) its centre
  const IN_HEAD = { half: 1.75, back: 1.75, cut: 1.45, neck: 2.3 };
  const carrow = (x, y, dir, L, fill) => TS.arrows.dir(x, y, { up: 0, right: 90, left: 270, upleft: 315, upright: 45 }[dir], L, { w: L / 6.5, fill, head: IN_HEAD });
  // a text line in the script of its text, at most max px, fitted to maxw
  const line = (x, y, s, max, maxw, o = {}) => T(x, y, s, max, fontOf(s), { weight: latin(s) ? 700 : 600, maxw, max, ...o });

  // the green stacked direction sign (direction-signs 43, Undavalli, Godda): per panel an arrow on the left, the
  // local name over the English one, the distance on the right; panels divided by white rules
  const stack = (panels, bg) => {
    const rows = panels.map((p) => ({ ...p, en: wrap(p.f.lat, 16) }));
    const W = Math.round(Math.max(640, Math.min(1100, 190 + Math.max(...rows.map((p) => Math.max(p.f.loc ? em(p.f.loc) * 48 : 0, ...p.en.map((l) => em(l) * 54)))) + 150)));
    const hs = rows.map((p) => 70 + (p.f.loc ? 64 : 0) + p.en.length * 62);
    const H = hs.reduce((a, b) => a + b, 0) + 16;
    let y = 8, s = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="16" fill="${bg}" stroke="#fff" stroke-width="5"/>` +
      `<rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="11" fill="none" stroke="#fff" stroke-width="5"/>`;
    rows.forEach((p, i) => {
      const h = hs[i];
      if (i) s += `<rect x="9" y="${y - 3}" width="${W - 18}" height="6" fill="#fff"/>`;
      s += carrow(90, y + h / 2, p.dir, Math.min(p.dir === 'up' ? 140 : 104, h - 44), '#fff');   // a side arrow stays clear of the text
      let yy = y + 30;
      if (p.f.loc) { yy += 64; s += line(150, yy - 6, p.f.loc, 50, W - 330, { fill: '#fff', anchor: 'start' }); }
      for (const l of p.en) { yy += 62; s += line(150, yy, l, 54, W - 330, { fill: '#fff', anchor: 'start', weight: 600, ls: 0.03 }); }
      if (p.km != null) s += T(W - 60, y + h / 2 + 18, String(p.km), 52, LAT, { fill: '#fff', anchor: 'end', weight: 600 });
      y += h;
    });
    return svg(W, H, s);
  };

  // a kilometre stone seen at an angle: the front with its rounded top (route label on it), the side with the
  // stone's own chainage written top to bottom; one script per stone (stones alternate local, Hindi and English).
  // rows: [text, max size, font] lines on the front; label: { text, size, ink, box } on the cap
  const stone = ({ rows, chain, label, top, base, fw = 260, minBody = 0 }) => {
    const W = fw + 140, fx = 40, sw = 70, dome = 110, bodyTop = dome + 18;
    const H = bodyTop + Math.max(minBody, 60 + rows.reduce((a, r) => a + r[1] * 1.08, 0) + 30) + 40, bot = H - 40;
    const arc = `M${fx},${bodyTop} L${fx},${dome} Q${fx},${dome - 92} ${fx + fw / 2},${dome - 96} Q${fx + fw},${dome - 92} ${fx + fw},${dome} L${fx + fw},${bodyTop} Z`;
    const digits = String(chain ?? '').split('');
    const block = rows.reduce((a, r) => a + r[1] * 1.08, 0);
    let y = bodyTop + Math.max(20, (bot - 26 - bodyTop - block) / 2 - 10);   // the lines centred on the face
    return svg(W, H,
      `<ellipse cx="${W / 2}" cy="${bot + 14}" rx="${W / 2 - 6}" ry="22" fill="#8a7a62" opacity="0.5"/>` +
      `<path d="M${fx + fw},${bodyTop} L${fx + fw + sw},${bodyTop - 26} L${fx + fw + sw},${bot - 22} L${fx + fw},${bot} Z" fill="#dcdad4"/>` +
      `<path d="M${fx + fw},${dome} Q${fx + fw},${dome - 92} ${fx + fw / 2},${dome - 96} L${fx + fw / 2 + sw},${dome - 122} Q${fx + fw + sw},${dome - 118} ${fx + fw + sw},${dome - 26} L${fx + fw + sw},${bodyTop - 26} L${fx + fw},${bodyTop} Z" fill="${top}" opacity="0.82"/>` +
      (base ? `<path d="M${fx + fw},${bot - 26} L${fx + fw + sw},${bot - 48} L${fx + fw + sw},${bot - 22} L${fx + fw},${bot} Z" fill="${base}"/>` : '') +
      digits.map((d, i) => T(fx + fw + sw / 2, bodyTop + 70 + i * 62, d, 58, LAT, { fill: INK, weight: 700, extra: `transform="skewY(-20)" transform-origin="${fx + fw + sw / 2} ${bodyTop + 50 + i * 62}"` })).join('') +
      `<rect x="${fx}" y="${bodyTop}" width="${fw}" height="${bot - bodyTop}" fill="#f7f6f2"/><path d="${arc}" fill="${top}"/>` +
      (base ? `<rect x="${fx}" y="${bot - 26}" width="${fw}" height="26" fill="${base}"/>` : '') +
      (label ? (label.box ? `<rect x="${fx + fw / 2 - label.size * 0.95}" y="${dome - 12 - label.size * 0.95}" width="${label.size * 1.9}" height="${label.size * 1.1}" fill="#fff" stroke="${INK}" stroke-width="3"/>` : '') +
        T(fx + fw / 2, dome - 12 - label.size * 0.08, label.text, label.size, LAT, { fill: label.ink, weight: 700, maxw: fw - 70, max: label.size }) : '') +
      rows.map(([t, m, f]) => { y += m * 1.08; return T(fx + fw / 2, y, t, m, f || fontOf(t), { fill: INK, weight: f === HAND ? 600 : latin(t) ? 700 : 600, maxw: fw - 34, max: m }); }).join(''));
  };
  const front = (name, km) => [...wrap(name, 9).map((l) => [l, 66]), [String(km), 120, HAND]];
  // the trilingual panel (Coimbatore gantry, Bengaluru NHAI board): lines in the given order, the arrow on the right
  const tri = (lines, dir) => {
    const W = Math.round(Math.max(560, Math.min(1000, 220 + Math.max(...lines.map(([l, m]) => em(l) * m))))), H = 50 + lines.length * 66;
    let y = 22;
    return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="14" fill="#119469" stroke="#fff" stroke-width="5"/>` +
      `<rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="9" fill="none" stroke="#fff" stroke-width="4"/>` +
      carrow(W - 80, H / 2, dir, Math.min(120, H - 56), '#fff') +
      lines.map(([l, m]) => (y += 66, line(36, y - 10, l, m, W - 190, { fill: '#fff', anchor: 'start', weight: latin(l) ? 700 : 600 }))).join(''));
  };

  const ind = [
    { id: 'direction', kind: 'direction', label: 'Direction sign, highway (green)', needs: ['alt'],
      draw: ({ name, alt, km, next, nextAlt, km2 }) => stack([{ f: forms(name, alt), dir: 'up', km },
        ...(nextAlt ? [{ f: forms(next, nextAlt), dir: 'left', km: km2 }] : [])], G) },
    { id: 'direction-3', kind: 'direction', label: 'Direction sign, three languages', needs: ['alt', 'hi'],
      draw: ({ name, alt, hi }) => {
        const f = forms(name, alt);
        return tri([...(f.loc ? [[f.loc, 52]] : []), ...(hi && hi !== f.loc ? [[hi, 52]] : []), ...wrap(f.lat, 16).map((l) => [l, 56])], 'up');
      } },
    { id: 'direction-3-gj', kind: 'direction', label: 'Direction sign, Hindi first', regions: ['Gujarat'], needs: ['alt', 'hi'],
      draw: ({ name, alt, hi }) => {
        const f = forms(name, alt), en = wrap(f.lat, 16);
        const lines = [...(hi && hi !== f.loc ? [[hi, 52]] : []), ...(f.loc ? [[f.loc, hi ? 40 : 50]] : []), ...en.map((l) => [l, 50])];
        const W = Math.round(Math.max(520, Math.min(1000, 200 + Math.max(...lines.map(([l, m]) => em(l) * m))))), H = 50 + lines.length * 62;
        let y = 18;
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="12" fill="#1f6b46" stroke="#fff" stroke-width="5"/>` +
          `<rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="8" fill="none" stroke="#fff" stroke-width="4"/>` +
          carrow(W - 70, H / 2, 'up', Math.min(120, H - 50), '#f2f2ee') +
          lines.map(([l, m]) => (y += 62, line(W / 2 - 40, y - 8, l, m, W - 220, { fill: '#f2f2ee', weight: latin(l) ? 700 : 600 }))).join(''));
      } },
    { id: 'motorway', kind: 'motorway', label: 'Expressway sign (blue)', regions: ['Telangana'], needs: ['alt'],
      // (group D) as on the photo's left panel: the exit's place on the left (English over the local script), the arrow
      // in the middle (straight on, with an arm curving off to the left), the place straight on at the right with its
      // national-highway shield (shared/shields.js, the Commons drawing) beside its lower line
      draw: ({ name, alt, next, nextAlt, road }) => {
        const f = forms(name, alt), g2 = next ? forms(next, nextAlt) : { loc: null, lat: null }, n = String(road).replace(/^\D+/, '');
        const colL = [...wrap(f.lat, 18), ...(f.loc ? [f.loc] : [])], colR = [...wrap(g2.lat, 18), ...(g2.loc ? [g2.loc] : [])];
        const wOf = (L) => Math.min(420, Math.max(0, ...L.map((l) => em(l) * 46)));
        const wl = wOf(colL), wr = wOf(colR), sh = 70, shw = TS.shields.inNH.width(sh);
        const ax = 34 + wl + 112, xr = ax + 60, W = Math.round(Math.max(600, xr + wr + (colR.length ? 24 : 0) + shw + 34));
        const H = 104 + Math.max(colL.length, colR.length, 2) * 62, top = 52;
        const rows = (L, x, maxw) => L.map((l, i) => line(x, top + 58 + i * 62, l, 46, maxw, { fill: '#fff', anchor: 'start' })).join('');
        const yb = top + 58 + 62 - 16;   // the arm leaves at the second line of the left column
        return svg(W, H, `<rect x="2" y="44" width="${W - 4}" height="${H - 46}" rx="6" fill="#1f5fae" stroke="#e6e9ee" stroke-width="4"/>` +
          `<rect x="10" y="52" width="${W - 20}" height="${H - 62}" rx="4" fill="none" stroke="#fff" stroke-width="4"/>` +
          `<rect x="6" y="2" width="160" height="48" rx="3" fill="#f0a020" stroke="#3a2a10" stroke-width="2"/>` + T(86, 39, 'Exit', 40, LAT, { fill: INK, weight: 700 }) +
          rows(colL, 34, ax - 34 - 46) + rows(colR, xr, W - xr - shw - 50) +
          TS.arrows.group([{ pts: [[ax, H - 14], [ax, top + 18]] }, { pts: [[ax, yb + 46], [ax, yb, 30], [ax - 92, yb]] }], { w: 15, fill: '#fff', head: IN_HEAD }) +
          (road ? TS.shields.inNH(W - 30 - shw, H - 26 - sh, sh, n, { field: '#f08a1c', font: LAT, weight: 700, capEm: 0.716 }) : ''));
      } },
    { id: 'entry', kind: 'entry', label: 'Place-name board, painted', needs: ['alt'],
      draw: ({ name, alt }) => {
        const f = forms(name, alt), en = wrap(f.lat ? f.lat.toUpperCase() : null, 12);
        const W = 640, H = 120 + (f.loc ? 130 : 0) + en.length * 112;
        let y = 40, s = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="6" fill="${G}" stroke="#d9d9d4" stroke-width="3"/>` +
          `<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="6" fill="none" stroke="#fff" stroke-width="5"/>`;
        if (f.loc) { y += 130; s += line(W / 2, y - 14, f.loc, 104, W - 90, { fill: '#fff', weight: 600 }); }
        for (const l of en) { y += 112; s += T(W / 2, y - 6, l, 118, HAND, { fill: '#fff', weight: 700, maxw: W - 80, max: 118 }); }
        return svg(W, H, s);
      } },
    { id: 'entry-tn', kind: 'entry', label: 'Place-name board with highway number', regions: ['Tamil Nadu'], needs: ['alt'],
      draw: ({ name, alt, road }) => {
        const f = forms(name, alt), en = wrap(f.lat ? f.lat.toUpperCase() : null, 12);
        const W = 640, H = 160 + (f.loc ? 120 : 0) + en.length * 110;
        let y = 70, s = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="#0b8a4e" stroke="#fff" stroke-width="10"/>` +
          T(W / 2, 66, `தே.நெ-${String(road).replace(/^\D+/, '')}`, 40, "'Noto Sans Tamil',sans-serif", { fill: '#fff', weight: 600 });
        if (f.loc) { y += 120; s += line(W / 2, y - 10, f.loc, 92, W - 70, { fill: '#fff', weight: 700 }); }
        for (const l of en) { y += 110; s += T(W / 2, y - 6, l, 112, HAND, { fill: '#fff', weight: 700, maxw: W - 60, max: 112 }); }
        return svg(W, H, s);
      } },
    { id: 'entry-nh', kind: 'entry', label: 'Village board, highway (reflective)', needs: ['alt'],
      draw: ({ name, alt }) => {
        const f = forms(name, alt), en = wrap(f.lat, 14);
        const W = Math.round(Math.max(560, Math.min(1000, 90 + Math.max(f.loc ? em(f.loc) * 84 : 0, ...en.map((l) => em(l) * 80))))), H = 80 + (f.loc ? 110 : 0) + en.length * 96;
        let y = 34, s = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18" fill="#078a54" stroke="#e8e8e2" stroke-width="4"/>` +
          `<rect x="13" y="13" width="${W - 26}" height="${H - 26}" rx="12" fill="none" stroke="#fff" stroke-width="5"/>`;
        if (f.loc) { y += 110; s += line(W / 2, y - 10, f.loc, 84, W - 70, { fill: '#fff', weight: 600 }); }
        for (const l of en) { y += 96; s += line(W / 2, y - 8, l, 80, W - 70, { fill: '#fff', weight: 700 }); }
        return svg(W, H, s);
      } },
    { id: 'flag', kind: 'direction', label: 'Flag sign (arrow-shaped)',
      draw: ({ name }) => {
        // Achhua photo, measured: green to the edge, a white rim set in by a green margin (0.05 and 0.04 of the height), and
        // in the point a broad filled white chevron (0.26 of the height across) parallel to the point's edges, its ends cut
        // level 0.18 of the height from top and bottom (TS.arrows: rim = outline moved in, chevron from the edge lines)
        const W = Math.round(Math.max(520, Math.min(1000, 230 + em(name) * 110))), H = 220, t = 0.4 * H, G2 = '#0b7a45';
        const pts = TS.arrows.pointed({ x: 2, y: 2, w: W - 4, h: H - 4, dir: 'left', tip: t }).pts, mg = 0.05 * H, rim = 0.04 * H, gap = 0.05 * H;
        const k = t / ((H - 4) / 2), sk = Math.hypot(1, k), mid = H / 2, ex = (d, Y) => 2 + Math.abs(Y - mid) * k + d * sk;
        const yt = 2 + 0.18 * H, yb = H - 2 - 0.18 * H, d1 = mg + rim + gap, d2 = d1 + 0.26 * H / sk;
        const c = [[ex(d1, yt), yt], [ex(d1, mid), mid], [ex(d1, yb), yb], [ex(d2, yb), yb], [ex(d2, mid), mid], [ex(d2, yt), yt]];
        const R = (q, r) => `<path d="${TS.arrows.rounded(q, r)}"`;
        return svg(W, H, `${R(pts, [3, 8, 8, 8, 3])} fill="${G2}"/>${R(TS.arrows.offset(pts, mg), [2, 6, 6, 6, 2])} fill="#fff"/>${R(TS.arrows.offset(pts, mg + rim), [1.5, 4, 4, 4, 1.5])} fill="${G2}"/>` +
          `<path d="M${c.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}Z" fill="#fff"/>` +
          line((ex(d2, mid) + W - mg - rim) / 2 + 6, H / 2 + 34, name, 104, W - mg - rim - ex(d2, mid) - 40, { fill: '#fff', weight: latin(name) ? 700 : 600 }));
      } },
    { id: 'pointer', kind: 'direction', label: 'Direction board, arrow below (green)', needs: ['alt'],
      draw: ({ name, alt }) => {
        const f = forms(name, alt), en = wrap(f.lat ? f.lat.toUpperCase() : null, 13);
        const W = Math.round(Math.max(600, Math.min(1000, 80 + Math.max(f.loc ? em(f.loc) * 84 : 0, ...en.map((l) => em(l, true) * 66))))), H = 150 + (f.loc ? 100 : 0) + en.length * 76;
        let y = 20, s = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="14" fill="#079a62" stroke="#e8e8e2" stroke-width="4"/>` +
          `<rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="9" fill="none" stroke="#fff" stroke-width="5"/>`;
        if (f.loc) { y += 100; s += line(W / 2, y - 10, f.loc, 80, W - 70, { fill: '#fff', weight: 600 }); }
        for (const l of en) { y += 76; s += line(W / 2, y - 6, l, 66, W - 70, { fill: '#fff', weight: 700, ls: 0.04 }); }
        s += farrow(W / 2, H - 62, 'left', 150, '#fff', 6);
        return svg(W, H, s);
      } },
    { id: 'pointer-city', kind: 'direction', label: 'Direction board, city road (blue)', needs: ['alt'],
      draw: ({ name, alt }) => {
        const f = forms(name, alt), en = wrap(f.lat, 22);
        const W = Math.round(Math.max(700, Math.min(1200, 80 + Math.max(f.loc ? em(f.loc) * 60 : 0, ...en.map((l) => em(l) * 58))))), H = 130 + (f.loc ? 76 : 0) + en.length * 70;
        let y = 14, s = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="${B}" stroke="#d0d6e0" stroke-width="3"/>` +
          `<rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="6" fill="none" stroke="#fff" stroke-width="4"/>`;
        if (f.loc) { y += 76; s += line(W / 2, y - 6, f.loc, 58, W - 70, { fill: '#fff', weight: 600 }); }
        for (const l of en) { y += 70; s += line(W / 2, y - 4, l, 58, W - 70, { fill: '#fff', weight: 700 }); }
        s += farrow(W / 2, H - 52, 'right', 110, '#fff', 7);
        return svg(W, H, s);
      } },
    { id: 'km-nh', kind: 'other', label: 'Kilometre stone, national highway (yellow)',
      draw: ({ name, km, chain, road }) => stone({ rows: front(name, km), chain, label: { text: /^NH/.test(road) ? road : `NH-${road}`, size: 34, ink: INK }, top: '#f2c21b', base: '#3a2a22' }) },
    { id: 'km-nh5', kind: 'other', label: 'Fifth-kilometre stone, national highway', needs: ['alt'],
      draw: ({ name, alt, km, next, nextAlt, km2 }) => {
        const f = forms(name, alt), pl = [[f.lat || f.loc, km], ...(nextAlt && km2 != null ? [[forms(next, nextAlt).lat, km2]] : [])];
        return stone({ rows: pl.flatMap(([n, k]) => [...wrap(latin(n) ? n.toUpperCase() : n, 13).map((l) => [l, 54, latin(l) ? HAND : null]), [String(k), 60, HAND]]), chain: null, label: null, top: '#f6cf12', base: '#141414', fw: 330, minBody: 470 });
      } },
    { id: 'km-sh', kind: 'other', label: 'Kilometre stone, state highway (green)',
      draw: ({ name, km, chain }) => stone({ rows: front(name, km), chain, label: { text: 'SH', size: 74, ink: '#fff' }, top: '#1f8a55', base: null }) },
    { id: 'km-sh-mh', kind: 'other', label: 'Kilometre stone, Maharashtra state highway', regions: ['Maharashtra'],
      draw: ({ name, km, chain, sh }) => stone({ rows: front(name, km), chain, label: { text: `M.S.H.NO.${sh}`, size: 30, ink: '#fff' }, top: '#1d5e48', base: null }) },
    { id: 'km-expressway', kind: 'other', label: 'Kilometre stone, Yamuna Expressway (blue)', regions: ['Uttar Pradesh'],
      draw: ({ name, km, chain }) => stone({ rows: front(name, km), chain, label: { text: 'YE', size: 44, ink: INK, box: true }, top: '#2a7fc0', base: null }) },
    { id: 'km-rural', kind: 'other', label: 'Kilometre stone, rural road (orange)',
      draw: ({ name, km, chain }) => stone({ rows: front(name, km), chain, label: null, top: '#e0501e', base: '#c9441c' }) },
    { id: 'km-sh-wb', kind: 'other', label: 'Kilometre stone, state highway, Bengali digits', regions: ['West Bengal'],
      draw: ({ name, km, chain }) => {
        const bn = (n) => String(n).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
        return stone({ rows: [...wrap(name, 9).map((l) => [l, 66]), [bn(km), 110, "'Noto Sans Bengali',sans-serif"]], chain: bn(chain), label: { text: 'SH', size: 60, ink: '#fff' }, top: '#2a8a5a', base: null });
      } },
    { id: 'direction-mp', kind: 'direction', label: 'Tourism direction tile (blue)', regions: ['Madhya Pradesh'], needs: ['alt'],
      draw: ({ name, alt, km }) => {
        const f = forms(name, alt), en = f.lat ? wrap(f.lat.toUpperCase(), 12) : [];
        const W = 640, H = 90 + (f.loc ? 96 : 0) + en.length * 74 + 90;
        let y = 20;
        return svg(W, H, `<rect x="0" y="0" width="${W}" height="${H}" fill="#e8e2d2"/><rect x="5" y="5" width="${W - 10}" height="${H - 10}" fill="#2052a8"/>` +
          (f.loc ? (y += 96, line(W / 2, y - 6, f.loc, 84, W - 80, { fill: '#f4f1e8', weight: 700 })) : '') +
          en.map((l) => (y += 74, T(W / 2, y, l, 62, LAT, { fill: '#f4f1e8', weight: 700, ls: 0.08, maxw: W - 80, max: 62 }))).join('') +
          `<path d="M${W / 2 - 150},${H - 48} L${W / 2 - 120},${H - 76} L${W / 2 - 120},${H - 58} L${W / 2 - 92},${H - 58} Q${W / 2 - 78},${H - 58} ${W / 2 - 78},${H - 44} L${W / 2 - 78},${H - 22} L${W / 2 - 96},${H - 22} L${W / 2 - 96},${H - 40} L${W / 2 - 120},${H - 40} L${W / 2 - 120},${H - 22} Z" fill="#f4f1e8"/>` +
          T(W / 2 - 50, H - 24, String(km), 66, LAT, { fill: '#f4f1e8', anchor: 'start', weight: 700 }) +
          T(W / 2 - 50 + String(km).length * 40 + 18, H - 24, 'K.M.', 40, LAT, { fill: '#f4f1e8', anchor: 'start', weight: 700 }));
      } },
    { id: 'km-pmgsy', kind: 'other', label: 'Kilometre stone, rural road scheme (PMGSY)', needs: ['alt'],
      draw: ({ name, alt, km }) => {
        const f = forms(name, alt), nm = f.lat ? f.lat.toUpperCase() : f.loc;
        return stone({ rows: [...wrap(nm, 10).map((l) => [l, 58, latin(l) ? HAND : null]), [`${km} K.M.`, 66, HAND]], chain: null, label: { text: 'P.M.G.S.Y', size: 40, ink: INK }, top: '#e8682c', base: null });
      } },
  ];

  TS.add('IN', ind, { km: 12, chain: 24, road: 'NH-44', sh: 3 });
})();
