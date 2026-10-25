// BD: Bangladeshi signs carrying a place name, drawn after the GeoHints pictures (direction-signs 34, 35; road-number
// signs 45-47) and Commons photos (see examples/BD.json). Bengali on top, English in capitals below; the English
// spelling is conventional (DHAKA, BARISHAL), so it comes from alt. Sign widths follow the longest line, as the
// direction signs are made to fit their text. A parenthesised qualifier of the quiz ("কালীগঞ্জ (ঝিনাইদহ)") is
// not on signs and is left out.
(function () {
  const { T, svg } = TS;
  const BN = "'Noto Sans Bengali',sans-serif";
  const LAT = "'Arimo',sans-serif";                      // stands in for the Transport-like capitals of the signs
  const HAND = "'Roboto Condensed',sans-serif";          // the narrow hand-painted capitals of kilometre posts
  const NARROW = `style="font-variation-settings:'wdth' 82"`;   // Noto Sans Bengali narrowed like the painted letters
  const hy = (r) => String(r).replace(/^([A-Z])-?/i, '$1-');   // N5 -> N-5 as painted on the posts
  const G = '#007a3d', RED = '#c8202f', YEL = '#f2c230', INK = '#151515';
  const len = (s) => [...String(s)].length;
  const latin = (s) => !/[^\u0000-ɏḀ-ỿ\s\-'’.()]/.test(String(s));
  const strip = (s) => String(s).replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  // the two forms of a place: Bengali (loc) and English capitals (lat), whichever of name/alt holds which
  const forms = (name, alt) => {
    const a = [name, alt].filter(Boolean).map(strip);
    return { loc: a.find((s) => !latin(s)) || null, lat: (a.find(latin) || '').toUpperCase() || null };
  };
  // Bengali digits, and a route number written in Bengali (N7 -> এন৭, R301 -> আর৩০১, Z1 -> জেড১)
  const bnNum = (s) => String(s).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
  const bnRoad = (r) => bnNum(String(r).replace(/^N/i, 'এন').replace(/^R/i, 'আর').replace(/^Z/i, 'জেড'));
  // estimated widths (em) for sizing the sign before TS.fitDOM fits each line exactly
  const wLat = (s, ls = 0.06) => len(s) * (0.7 + ls);
  const wBn = (s) => len(s) * 0.47;
  // a long multi-word name painted on two lines, broken at the space nearest the middle
  const wrap = (s, max) => {
    if (len(s) <= max || !s.includes(' ')) return [s];
    const sp = [...s.matchAll(/ /g)].map((m) => m.index).sort((a, b) => Math.abs(a - s.length / 2) - Math.abs(b - s.length / 2))[0];
    return [s.slice(0, sp), s.slice(sp + 1)];
  };
  // a filled road-sign arrow (shaft + triangular head) pointing up, left or right; (x, y) is its centre
  const farrow = (x, y, dir, L, fill) => {
    const r = { up: 0, right: 90, left: -90 }[dir], s = L / 100;
    return `<g transform="translate(${x},${y}) rotate(${r}) scale(${s})"><path d="M-9,50 L-9,-14 L-30,-14 L0,-50 L30,-14 L9,-14 L9,50 Z" fill="${fill}"/></g>`;
  };

  // one green panel of the national-road sign (direction-signs 34): Bengali name, route in Bengali and Latin,
  // English name (two lines when long, as "NATIONAL / ASSEMBLY" on 35); the arrow on the right (ahead) or left
  const greenRows = (f, road) => [...(f.loc ? [['bn', f.loc, 102]] : []), ...(road ? [['road', road, f.loc ? 82 : 92]] : []),
    ...(f.lat ? wrap(f.lat, 13).map((l, i) => ['lat', l, i ? 68 : (f.loc || road ? 74 : 92)]) : [])];
  const greenH = (rows) => rows.reduce((a, r) => a + r[2], 0) + 26;
  const greenPanel = (x, y, W, H, rows, dir) => {
    const left = dir === 'left', tx = left ? x + 190 : x + 42, tw = W - (left ? 230 : 170);
    let s = `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="12" fill="${G}"/>` + farrow(left ? x + 95 : x + W - 85, y + H * 0.52, dir, 150, '#fff');
    let yy = y;
    for (const [k, v, dy] of rows) {
      yy += dy;
      if (k === 'bn') s += T(tx, yy, v, 80, BN, { fill: '#fff', anchor: 'start', weight: 600, maxw: tw, max: 80 });
      else if (k === 'lat') s += T(tx, yy, v, 62, LAT, { fill: '#fff', anchor: 'start', weight: 700, ls: 0.06, maxw: tw, max: 62 });
      else s += T(tx, yy, bnRoad(v), 58, BN, { fill: '#fff', anchor: 'start', weight: 600 }) + T(tx + tw, yy, v, 56, LAT, { fill: '#fff', anchor: 'end', weight: 700 });
    }
    return s;
  };
  const textW = (f, bn, lat) => Math.max(f.loc ? wBn(f.loc) * bn : 0, f.lat ? Math.max(...wrap(f.lat, 13).map((l) => wLat(l) * lat)) : 0);

  const bd = [
    { id: 'direction', kind: 'direction', label: 'Direction sign, national road (green)', needs: ['alt'],
      draw: ({ name, alt, next, nextAlt, road, road2 }) => {
        const f1 = forms(name, alt), f2 = nextAlt ? forms(next, nextAlt) : null;
        const W = Math.max(640, Math.min(1000, 230 + Math.max(textW(f1, 80, 62), f2 ? textW(f2, 80, 62) : 0)));
        const r1 = greenRows(f1, road), r2 = f2 ? greenRows(f2, road2) : null, H1 = greenH(r1), H2 = r2 ? greenH(r2) : 0;
        const SH = H1 + (r2 ? H2 + 12 : 0) + 20;
        return svg(W, SH, `<rect x="2" y="2" width="${W - 4}" height="${SH - 4}" rx="16" fill="#fff" stroke="#bbb" stroke-width="2"/>` +
          greenPanel(10, 10, W - 20, H1, r1, 'up') + (r2 ? greenPanel(10, H1 + 22, W - 20, H2, r2, 'left') : ''));
      } },
    { id: 'direction-white', kind: 'direction', label: 'Direction sign, city street (white)', needs: ['alt'],
      draw: ({ name, alt, next, nextAlt }) => {
        const f1 = forms(name, alt), f2 = nextAlt ? forms(next, nextAlt) : null;
        const W = Math.max(640, Math.min(1000, 210 + Math.max(textW(f1, 72, 50), f2 ? textW(f2, 72, 50) : 0)));
        const rows = (f) => [...(f.loc ? [['bn', f.loc, 84]] : []), ...(f.lat ? wrap(f.lat, 13).map((l, i) => ['lat', l, i ? 56 : (f.loc ? 68 : 110)]) : [])];
        const ph = (r) => Math.max(180, r.reduce((a, x) => a + x[2], 0) + 28);
        const panel = (y, r, H, dir) => {
          const left = dir === 'left', tw = W - 210, tx = left ? 175 : 30;
          let yy = y;
          return `<rect x="6" y="${y}" width="${W - 12}" height="${H}" rx="12" fill="#fff" stroke="${INK}" stroke-width="7"/>` + farrow(left ? 90 : W - 85, y + H / 2, dir, 120, INK) +
            r.map(([k, v, dy]) => (yy += dy, k === 'bn' ? T(tx, yy, v, 72, BN, { fill: INK, anchor: 'start', weight: 600, maxw: tw, max: 72 })
              : T(tx, yy, v, 50, LAT, { fill: INK, anchor: 'start', weight: 700, ls: 0.06, maxw: tw, max: 50 }))).join('');
        };
        const r1 = rows(f1), r2 = f2 ? rows(f2) : null, H1 = ph(r1), H2 = r2 ? ph(r2) : 0, SH = H1 + H2 + 12;
        return svg(W, SH, `<rect x="0" y="0" width="${W}" height="${SH}" rx="16" fill="#fff"/>` + panel(6, r1, H1, 'up') + (r2 ? panel(H1 + 6, r2, H2, 'left') : ''));
      } },
    { id: 'km', kind: 'other', label: 'Kilometre post (yellow, RHD)', needs: ['alt'],
      draw: ({ name, alt, km, road }) => {
        const f = forms(name, alt), W = 400;
        const en = f.lat ? wrap(`${f.lat}-${km}`, 13) : [], H = 470 + (en.length > 1 ? 66 : 0);
        const bnLine = f.loc ? `${f.loc}-${bnNum(km)}` : null;
        const hand = (x, y, t, size, font, o = {}) => T(x, y, t, size, font, { fill: INK, weight: 500, extra: font === BN ? NARROW : '', ...o });
        const yEn = 290, yKm = yEn + 36 + (en.length - 1) * 66;
        return svg(W + 40, H + 70,
          `<rect x="0" y="${H - 10}" width="${W + 40}" height="80" fill="#9a968c"/><rect x="0" y="${H - 10}" width="${W + 40}" height="10" fill="#b5b1a6"/>` +
          `<rect x="20" y="8" width="${W}" height="${H - 10}" fill="${YEL}" stroke="#2a2418" stroke-width="7"/>` +
          hand(W / 2 + 20, 98, hy(road), 58, HAND, { fill: RED, weight: 600, ls: 0.04 }) +
          (bnLine ? hand(W / 2 + 20, 186, bnLine, 70, BN, { maxw: W - 50, max: 70 }) + hand(W - 10, 222, 'কিঃমিঃ', 30, BN, { anchor: 'end' }) : '') +
          en.map((l, i) => hand(W / 2 + 20, yEn + i * 66, l, 64, HAND, { ls: 0.03, maxw: W - 50, max: 64 })).join('') +
          (en.length ? hand(W - 10, yKm, 'K.M.', 24, HAND, { anchor: 'end' }) : '') +
          hand(W - 30, H - 70, 'সওজ', 32, BN, { anchor: 'end' }));
      } },
    { id: 'km-red', kind: 'other', label: 'Kilometre post (red border)', needs: ['alt'],
      draw: ({ name, alt, km, road }) => {
        const f = forms(name, alt), W = 400, kmS = String(km).padStart(2, '0');
        const rows = [[bnRoad(road).replace(/^(এন|আর|জেড)/, '$1-'), BN, 48], ...(f.loc ? [[f.loc, BN, 62], [`${bnNum(kmS)} কিঃমিঃ`, BN, 56]] : []),
          [hy(road), HAND, 50], ...(f.lat ? [...wrap(f.lat, 11).map((l) => [l, HAND, 56]), [`${kmS} K.M.`, HAND, 56]] : [])];
        const H = 560 + Math.max(0, rows.length - 6) * 66, step = (H - 90) / rows.length;
        return svg(W + 40, H + 80,
          `<rect x="0" y="${H}" width="${W + 40}" height="80" fill="#c9c6bd"/><rect x="0" y="${H}" width="${W + 40}" height="10" fill="#dedbd2"/>` +
          `<rect x="20" y="10" width="${W}" height="${H - 10}" fill="${RED}"/><rect x="44" y="34" width="${W - 48}" height="${H - 58}" fill="${YEL}"/>` +
          rows.map(([t, fnt, sz], i) => T(W / 2 + 20, 60 + step * (i + 0.72), t, sz, fnt, { fill: '#2a1a12', weight: 500, ls: fnt === HAND ? 0.03 : 0, extra: fnt === BN ? NARROW : '', maxw: W - 90, max: sz })).join(''));
      } },
    { id: 'km-old', kind: 'other', label: 'Kilometre block, older (framed)', needs: ['alt'],
      draw: ({ name, alt, km }) => {
        const f = forms(name, alt), W = 420;
        const rows = [...(f.loc ? [[f.loc, BN, 58], [`${bnNum(km)} কিঃমিঃ`, BN, 52]] : []), ...(f.lat ? [...wrap(f.lat, 10).map((l) => [l, HAND, 54]), [`${km} K.M.`, HAND, 54]] : [])];
        const FH = 290 + Math.max(0, rows.length - 4) * 62, H = 520 + FH - 290, step = (FH - 40) / rows.length;
        return svg(W, H,
          `<path d="M18,40 L${W - 70},40 L${W - 70},${H - 8} L18,${H - 8} Z" fill="#e2b33a"/><path d="M${W - 70},40 L${W - 18},14 L${W - 18},${H - 30} L${W - 70},${H - 8} Z" fill="#c99a2a"/>` +
          `<path d="M18,40 L${W - 70},40 L${W - 18},14 L${W - 18 - (W - 88)},14 Z" fill="#edc75a"/>` +
          `<rect x="44" y="70" width="${W - 140}" height="${FH}" fill="none" stroke="#5a3d1a" stroke-width="6"/>` +
          rows.map(([t, fnt, sz], i) => T((W - 52) / 2, 80 + step * (i + 0.78), t, sz, fnt, { fill: '#4a3218', weight: 500, ls: fnt === HAND ? 0.04 : 0, extra: fnt === BN ? NARROW : '', maxw: W - 180, max: sz })).join(''));
      } },
    { id: 'km-lged', kind: 'other', label: 'Kilometre post, local road (LGED)',
      draw: ({ name, alt, km }) => {
        const f = forms(name, alt), nm = f.loc || f.lat, W = 400, H = 500;
        const hand = (y, t, size, o = {}) => T(W / 2 + 20, y, t, size, latin(t) ? HAND : BN, { fill: INK, weight: 500, extra: latin(t) ? '' : NARROW, maxw: W - 100, max: size, ...o });
        return svg(W + 40, H + 60,
          `<rect x="0" y="${H - 10}" width="${W + 40}" height="70" fill="#9a968c"/>` +
          `<rect x="20" y="8" width="${W}" height="${H - 10}" fill="#e9b62c"/><rect x="48" y="36" width="${W - 56}" height="${H - 66}" fill="none" stroke="${INK}" stroke-width="6"/>` +
          hand(120, nm, 64) + hand(232, bnNum(String(km).padStart(2, '0')), 92) + hand(318, 'কিঃ মিঃ', 64) + hand(410, 'এল জি ই ডি', 46));
      } },
    { id: 'km-bn', kind: 'other', label: 'Kilometre post, Bengali only (red border)',
      draw: ({ name, alt, km }) => {
        const f = forms(name, alt), nm = f.loc || f.lat, W = 480, H = 400, kmS = Number.isInteger(+km) ? `${km}.00` : String(km);
        return svg(W + 40, H + 60,
          `<rect x="0" y="${H - 10}" width="${W + 40}" height="70" fill="#a8a59c"/>` +
          `<rect x="20" y="8" width="${W}" height="${H - 10}" fill="#d42a2a"/><rect x="40" y="28" width="${W - 40}" height="${H - 50}" fill="#f1cf1c"/>` +
          T(W / 2 + 20, 170, nm, 120, latin(nm) ? HAND : BN, { fill: INK, weight: 600, extra: latin(nm) ? '' : NARROW, maxw: W - 70, max: 120 }) +
          T(W / 2 + 20, 320, `${bnNum(kmS)}কিঃ মিঃ`, 104, BN, { fill: INK, weight: 600, extra: NARROW, maxw: W - 70, max: 104 }));
      } },
    { id: 'motorway', kind: 'motorway', label: 'Expressway exit sign (green)', needs: ['alt'],
      draw: ({ name, alt, km }) => {
        const f = forms(name, alt), en = f.lat ? wrap(f.lat, 14) : [];
        const W = Math.max(640, Math.min(1000, 120 + textW(f, 66, 60))), top = 40 + (f.loc ? 80 : 0) + en.length * 70, H = top + 190;
        let y = 20;
        return svg(W, H, `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="14" fill="${G}" stroke="#d8ddd8" stroke-width="5"/>` +
          (f.loc ? (y += 80, T(W / 2, y, f.loc, 66, BN, { fill: '#fff', weight: 500, maxw: W - 80, max: 66 })) : '') +
          en.map((l) => (y += 70, T(W / 2, y, l, 58, LAT, { fill: '#fff', weight: 500, ls: 0.03, maxw: W - 80, max: 58 }))).join('') +
          `<rect x="10" y="${top}" width="${W - 20}" height="5" fill="#fff"/><rect x="150" y="${top}" width="5" height="${H - top - 10}" fill="#fff"/>` +
          `<g transform="translate(80,${top + 95}) rotate(-45) scale(1.15)"><path d="M-10,50 L-10,-12 L-30,-12 L0,-48 L30,-12 L10,-12 L10,50 Z" fill="#fff"/></g>` +
          T(190, top + 82, 'বাহির', 60, BN, { fill: '#fff', anchor: 'start', weight: 500 }) + T(190, top + 158, 'EXIT', 56, LAT, { fill: '#fff', anchor: 'start', weight: 500, ls: 0.03 }) +
          T(W - 40, top + 128, `${km} KM`, 54, LAT, { fill: '#fff', anchor: 'end', weight: 500 }));
      } },
  ];

  TS.add('BD', bd, { km: 12, road: 'N5', road2: 'N7' });
})();
