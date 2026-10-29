// NZ: New Zealand signs carrying a place name, after the GeoHints pictures (see examples/NZ.json).
// Place-name boards blue or green with a broad white border; speed-threshold boards with the place name under the
// roundel; green direction signs with red state-highway shields, Series E(M) mixed case, a te reo Māori dual name in
// italic capitals under the English one (Milford Sound / PIOPIOTAHI). Macrons are printed (Taupō).
(function () {
  const { T, svg } = TS;
  // ---- Highway Gothic kit (same block in each file of this batch: MX GT AR CL CO PE EC BO UY AU NZ) ----
  // advance widths (1/1000 em) of the RG2014 fonts (Roadgeek 2014 = FHWA Series B, C, D, E, E(M)), so a name is laid out
  // (lines, sign width) before TS.fitDOM sizes it in the real font; other letters count as their base letter
  const RGC = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,-'/&()";
  const RGW = Object.fromEntries(Object.entries({"B":"146,343,338,336,355,311,299,336,373,198,335,347,299,409,373,355,327,351,338,303,251,373,301,397,325,342,303,267,285,242,285,252,162,283,288,166,180,288,129,420,288,267,285,285,207,214,170,289,271,340,262,286,241,354,207,302,290,356,320,308,320,302,320,176,176,214,176,405,442,245,245","C":"245,399,418,422,435,388,371,422,447,206,371,418,371,503,447,438,435,438,418,387,325,447,387,468,369,399,383,343,377,334,377,346,211,379,386,185,216,374,181,577,386,357,377,377,251,282,218,386,357,560,371,378,273,403,233,387,387,422,387,422,387,387,387,138,138,235,138,419,549,248,249","D":"342,518,486,503,514,451,440,503,526,229,451,495,440,582,526,519,474,519,486,446,387,526,468,542,446,522,446,406,437,390,434,396,240,435,445,211,246,437,207,674,445,415,437,434,286,306,239,443,426,667,445,447,321,519,270,503,546,507,503,503,467,503,503,148,150,235,150,422,567,271,270","E":"342,629,575,577,589,541,524,577,610,250,532,565,524,684,610,594,554,593,575,541,475,610,578,651,575,629,529,425,437,404,438,411,251,440,449,207,226,405,206,688,450,434,441,440,326,389,276,448,428,568,417,462,397,627,303,541,541,617,541,575,543,541,541,154,151,235,151,435,573,271,270","EM":"495,622,585,562,596,543,543,575,619,274,536,561,514,691,619,592,562,592,579,588,469,619,569,650,577,622,539,554,552,502,554,502,360,554,603,342,335,552,342,853,603,514,552,554,421,488,415,603,541,682,581,581,525,590,321,588,547,629,588,574,553,575,575,159,159,234,159,443,626,298,298"}).map(([k, v]) => [k, Object.fromEntries(v.split(",").map((w, i) => [RGC[i], +w]))]));
  const HG = (s) => `'RG2014 Series ${s}',sans-serif`;
  const CAP = 0.5714;   // cap height of the RG2014 fonts, in em
  const tw = (s, ser, ls = 0) => [...String(s)].reduce((a, ch) => a + (RGW[ser][ch] ?? RGW[ser][ch.normalize("NFD")[0]] ?? 560) / 1000 + ls, 0);   // width in em
  const clean = (n) => String(n).replace(/\s*\(.*?\)\s*/g, " ").trim();   // "Guadalupe (Zacatecas)" -> "Guadalupe": the quiz's qualifier is not on signs
  const SMALL = /^(de|del|la|las|los|el|y|e|en|a|o|ki|al|sur|norte)$/i;
  const toks = (s) => s.split(/\s+/).flatMap((w) => w.split(/(?<=-)/));
  const join = (t) => t.reduce((a, w, i) => a + (i && !t[i - 1].endsWith("-") ? " " : "") + w, "");
  // the best break of a name into n lines: narrowest widest line; a line ending in a small word ("de") counts 15 % wider
  const split = (s, n, ser, ls = 0) => {
    const t = toks(s); if (n < 2 || t.length < 2) return [s];
    let best = null;
    const rec = (i, left, acc) => {
      if (left === 1) { const L = [...acc, join(t.slice(i))]; const sc = Math.max(...L.map((l, k) => tw(l, ser, ls) * (k < L.length - 1 && SMALL.test(l.split(" ").pop()) ? 1.15 : 1))); if (!best || sc < best.sc) best = { sc, L }; return; }
      for (let k = i + 1; k <= t.length - left + 1; k++) rec(k, left - 1, [...acc, join(t.slice(i, k))]);
    };
    rec(0, Math.min(n, t.length), []); return best.L;
  };
  // a name in a box maxw wide: one line up to size max; if that falls under min1, two (or up to `lines`) lines up to max2
  const layout = (s, ser, maxw, max, { lines = 2, max2 = max * 0.8, min1 = max * 0.72, ls = 0 } = {}) => {
    const one = Math.min(max, maxw / tw(s, ser, ls));
    if (one >= min1 || lines < 2 || toks(s).length < 2) return { lines: [s], size: one };
    let r; for (let n = 2; n <= Math.min(lines, toks(s).length); n++) { const L = split(s, n, ser, ls); r = { lines: L, size: Math.min(max2, maxw / Math.max(...L.map((l) => tw(l, ser, ls)))) }; if (r.size >= min1 * 0.85) break; }
    return r;
  };
  // an FHWA-style arrow (solid triangle head on a shaft), w = head width, pointing at angle deg (0 = up, 90 = right)
  const harrow = (x, y, deg, w, fill, { len = 1.45, shaft = 0.34, head = 0.55 } = {}) =>
    `<path transform="translate(${x},${y}) rotate(${deg}) scale(${w})" fill="${fill}" d="M0,${-len / 2} L0.5,${-len / 2 + head} L${shaft / 2},${-len / 2 + head} L${shaft / 2},${len / 2} L${-shaft / 2},${len / 2} L${-shaft / 2},${-len / 2 + head} L-0.5,${-len / 2 + head} Z"/>`;
  // lines of text centred on cx (or from x with anchor start), baselines spaced by gap x size, block centred on cy
  const block = (L, size, x, cy, font, o = {}) => { const gap = o.gap || 1.45, n = L.length, top = cy - ((n - 1) * gap * size) / 2 + (CAP * size) / 2;
    return L.map((l, i) => T(x, top + i * gap * size, l, size, font, { ...o, max: size })).join(""); };
  // ---- end of kit ----
  const NZ_G = '#1f7a45', NZ_B = '#2a62bd', LT = '#fff';
  // state highway shield: red, white edge, white number
  const shield = (x, y, h, road) => `<g transform="translate(${x},${y}) scale(${h / 110})"><path d="M7,8 Q50,0 93,8 C101,32 101,62 89,82 C77,100 60,104 50,110 C40,104 23,100 11,82 C-1,62 -1,32 7,8 Z" fill="${LT}"/>` +
    `<path d="M12,13 Q50,6 88,13 C95,34 95,61 84,79 C73,95 59,99 50,104 C41,99 27,95 16,79 C5,61 5,34 12,13 Z" fill="#d7262b"/>` +
    T(50, 74, road, String(road).length > 1 ? 48 : 54, HG('D'), { fill: LT, maxw: 64, max: 54 }) + '</g>';
  // place-name board: broad white border, the name centred; longer board for a longer name, two lines past ~1100
  const board = (name, fill) => {
    const cap = 108, size = cap / CAP, m = 0.75 * cap, s = clean(name);
    const L = tw(s, 'E') * size + 2 * m > 1100 && toks(s).length > 1 ? split(s, 2, 'E') : [s];
    const sz = L.length > 1 ? size * 0.78 : size, W = Math.round(Math.max(4.6 * cap, Math.max(...L.map((l) => tw(l, 'E') * sz)) + 2 * m)), H = Math.round(L.length > 1 ? 4.3 * cap : 3.1 * cap);
    return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="34" fill="#fafafa" stroke="#b9b9b9" stroke-width="2"/><rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="16" fill="${fill}"/>` +
      block(L, sz, W / 2, H / 2 - 0.08 * cap, HG('E'), { fill: LT, maxw: W - 2 * m, gap: 1.25 }));
  };
  // speed threshold board: the roundel on top, the place name under it
  const threshold = (name, fill, speed) => {
    const W = 550, cap = 62, size = cap / CAP, a = layout(clean(name), 'E', W - 80, size, { max2: size * 0.85, min1: size * 0.85 });
    const H = Math.round(770 + (a.lines.length - 1) * 1.45 * a.size * CAP);
    return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="30" fill="${fill}" stroke="#fafafa" stroke-width="10"/>` +
      `<circle cx="${W / 2}" cy="270" r="176" fill="#f6f6f6"/><circle cx="${W / 2}" cy="270" r="141" fill="none" stroke="#e03a36" stroke-width="52"/>` +
      T(W / 2, 270 + 46, String(speed), 158, HG('E'), { fill: '#1b1b1b', maxw: 196, max: 158 }) +
      a.lines.map((l, i) => T(W / 2, 686 + i * 1.45 * a.size * CAP - (a.lines.length - 1) * 20, l, a.size, HG('E'), { fill: LT, maxw: W - 80, max: a.size })).join(''));
  };
  const nz = [
    // (group H) colour by road, from the photos: green boards on state highways (Winchester on SH1, Haruru on SH11), blue
    // on council roads (Arapuni); direction signs follow the same split (green on state highways, blue on local roads)
    { id: 'name-blue', kind: 'entry', label: 'Place-name board (blue, local road)', draw: ({ name }) => board(name, NZ_B) },
    { id: 'name-green', kind: 'entry', label: 'Place-name board (green, state highway)', draw: ({ name }) => board(name, NZ_G) },
    { id: 'threshold-green', kind: 'entry', label: 'Speed threshold with name (green)', draw: ({ name }) => threshold(name, NZ_G, 50) },
    { id: 'threshold-blue', kind: 'entry', label: 'Speed threshold with name (blue)', draw: ({ name }) => threshold(name, NZ_B, 70) },
    // direction sign: next straight on at the top; the name off the branch with its highway shield, its te reo Māori
    // dual name (alt) in italic capitals underneath when given
    { id: 'direction', kind: 'direction', label: 'Direction sign, highway shield (green)', draw: ({ name, alt, next, road }) => {
      const cap = 36, size = cap / CAP, b = layout(clean(next), 'EM', 700, size, { max2: size * 0.9 }), a = clean(name);
      const wa = tw(a, 'EM') * size, wb = Math.max(...b.lines.map((l) => tw(l, 'EM') * b.size)), al = alt ? clean(alt).toUpperCase() : '';
      const W = Math.round(Math.max(640, 256 + wb + 45, 136 + wa + 75)), top = (b.lines.length - 1) * 70, H = 399 + top + (al ? 50 : 0), cx = 136 + wa / 2;
      const stem = `<path d="M62,${H - 54} L62,62 L77,40 L92,62 L92,${H - 54} Z M92,${213 + top} L255,${213 + top} L272,${228 + top} L255,${243 + top} L92,${243 + top} Z" fill="${LT}"/>`;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="32" fill="#fafafa"/><rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="26" fill="${NZ_G}"/>` + stem +
        b.lines.map((l, i) => T(256, 88 + i * 72, l, b.size, HG('EM'), { anchor: 'start', fill: LT, maxw: W - 256 - 40, max: b.size })).join('') +
        shield(Math.max(300, Math.min(cx - 36, W - 120)), 196 + top, 72, road) +
        T(136, 345 + top, a, size, HG('EM'), { anchor: 'start', fill: LT, maxw: W - 136 - 40, max: size }) +
        (al ? T(cx, 397 + top, al, 26 / CAP, HG('E'), { fill: LT, style: 'italic', ls: 0.08, maxw: W - 136 - 40, max: 26 / CAP }) : ''));
    } },
    // (group H) distance sign on a state highway (Commons: SH6 Invercargill 181 / Te Anau 171 / Milford Sound 291; SH6
    // Makarora 18 km / Lake Hawea 67 km ...): green, white border, the highway shield (road) centred on top, names left,
    // distances right with a small km, the nearest on top. With next, the sign stands a made-up 8 km before next, so the
    // name reads km + 8 (the real distance between the two)
    { id: 'distance', kind: 'direction', label: 'Distance sign (green, state highway)', draw: ({ name, next, km, road }) => {
      const cap = 40, size = cap / CAP, pitch = 1.6 * cap, m = 46, top = road ? 126 : 40;
      const rows = (next ? [[clean(next), 8], [clean(name), +km + 8]] : [[clean(name), +km]]).map(([s, d]) => [s, String(d)]);
      const kw = tw(' km', 'E') * size * 0.75, dw = Math.max(...rows.map(([, d]) => tw(d, 'E') * size)) + kw;
      const nw = Math.min(900, Math.max(...rows.map(([s]) => tw(s, 'E') * size))), W = Math.round(Math.max(520, m + nw + 60 + dw + m));
      const H = Math.round(top + rows.length * pitch + 0.75 * cap);
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="26" fill="#fafafa"/><rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="20" fill="${NZ_G}"/>` +
        (road ? shield(W / 2 - 40, 22, 88, road) : '') + rows.map(([s, d], i) => { const y = top + i * pitch + cap;
          return T(m, y, s, size, HG('E'), { anchor: 'start', fill: LT, maxw: W - 2 * m - 60 - dw, max: size }) +
            T(W - m - kw, y, d, size, HG('E'), { anchor: 'end', fill: LT, maxw: dw - kw + 2, max: size }) + T(W - m, y, 'km', size * 0.75, HG('E'), { anchor: 'end', fill: LT }); }).join(''));
    } },
    // (group H) fingerboard at a turn off a state highway (Commons: Moeraki; Rolleston / Timaru with SH1): green, pointed at
    // one end with a white border round the shape and a white chevron in the point, mixed case, the highway shield (road)
    // after the names when given
    { id: 'finger-green', kind: 'direction', label: 'Fingerboard (green, state highway)', draw: ({ name, next, road }) => {
      const cap = 31, size = cap / CAP, rows = [clean(name), ...(next ? [clean(next)] : [])], lw = Math.min(760, Math.max(...rows.map((s) => tw(s, 'E') * size)));
      // round 2 (user: "arrow is off - it reaches the top and is wider"): measured on the Rolleston / Timaru photo the
      // point is short (0.39 of the height) and the white chevron inside it is broad and flat, its arms running from the
      // top to the bottom of the green field; the shield stands in round brackets ("via SH1")
      const H = rows.length > 1 ? 150 : 104, tip = 0.39 * H, sw = road ? 67 + 2 * 22 : 0, cw = 0.9 * H, W = Math.round(34 + lw + 26 + (sw ? sw + 18 : 0) + cw + 10);
      const shape = (i) => `M${12 + i},${i} H${W - tip - i * 0.4} L${W - i * 1.4},${H / 2} L${W - tip - i * 0.4},${H - i} H${12 + i} Q${i},${H - i} ${i},${H - 12 - i} V${12 + i} Q${i},${i} ${12 + i},${i} Z`;
      const xa = W - 0.23 * H, dx = 0.32 * H, t = 0.3 * H, yt = 0.15 * H, yb = 0.85 * H;
      const ch = `M${xa - dx - t},${yt} L${xa - dx},${yt} L${xa},${H / 2} L${xa - dx},${yb} L${xa - dx - t},${yb} L${xa - t},${H / 2} Z`;
      const sx = 34 + lw + 26 + 22, br = (x, c) => T(x, H / 2 + 0.36 * 76, c, 76, HG('E'), { fill: LT });
      return svg(W, H, `<path d="${shape(1)}" fill="#fafafa" stroke="#bbb" stroke-width="1.5"/><path d="${shape(6)}" fill="${NZ_G}"/>` +
        `<path d="${ch}" fill="${LT}"/>` +
        block(rows, size, 34, H / 2, HG('E'), { anchor: 'start', fill: LT, maxw: lw + 2, gap: 1.3 }) +
        (road ? br(sx - 12, '(') + shield(sx, H / 2 - 37, 74, road) + br(sx + 67 + 12, ')') : ''));
    } },
    // (group H) direction sign on a council road (Commons: Wainuiomata, Shopping Centre / Homedale Village / Moores Valley
    // ahead, Parkway / Arakura to the left): blue, white border, two sections split by a white line; the name ahead with
    // the arrow up at the right, next to the left with the arrow at the left. The brown tourist inserts are left out
    // round 2 (user: "where are the parks? also it's higher"): measured on the Wainuiomata photo (plate 421 x 318 px): the
    // destinations ahead, left-aligned, the arrow up at the right of the last line, a brown tourist panel (park) under
    // them; a white line; the destinations to the left centred at 0.42 of the width with the arrow at the left and a
    // second brown panel (park2) under them. park / park2 are optional fields; without them the template prints the
    // generic labels "Forest Park" / "Reserve" (they name no particular place)
    { id: 'direction-blue', kind: 'direction', label: 'Direction sign (blue, local road)', defaults: { park: 'Forest Park', park2: 'Reserve' }, draw: ({ name, next, park, park2 }) => {
      // every distance measured on the photo, whose plate is 421 px wide, times u (so the letters keep the photo's cap)
      const cap = 40, u = cap / 14, size = cap / CAP, ls = 0.06, BR = '#6e3a17', pitch = 29 * u, pp = 25 * u;   // the photo's cap: 14 px
      const lay = (s, w) => layout(clean(s), 'EM', w, size, { ls, max2: size * 0.9 });
      const lw = (r) => Math.max(...r.lines.map((l) => tw(l, 'EM', ls) * r.size));
      const a = lay(name, 940), b = next ? lay(next, 880) : null, pb = park2 ? lay(park2, 800) : null;
      let W = Math.max(300 * u, lw(a) / 0.6, 28 * u + lw(a) + 190);   // the ahead names take 0.6 of the width, as on the photo
      const cx = b ? Math.max(0.42 * W, 0.105 * W + 90 + lw(b) / 2) : 0;
      if (b) W = Math.max(W, cx + lw(b) / 2 + 50);
      W = Math.round(W);
      // the tourist panel keeps the photo's width (0.06 W to 0.81 W); its text wraps to two lines rather than shrinking
      const pw = 0.81 * W - 25 * u, pa = park ? layout(clean(park), 'EM', pw - 70, size, { ls, max2: size, min1: size * 0.98 }) : null;
      const lines = (r, x, y0, anchor) => r.lines.map((l, i) => T(x, y0 + i * pitch, l, r.size, HG('EM'), { anchor, fill: LT, ls, maxw: anchor === 'start' ? W - x - 0.2 * W : W - 2 * (0.105 * W + 60), max: r.size })).join('');
      const panel = (r, x0, w, top) => { const h = pp * r.lines.length + 11 * u, c = x0 + w / 2;
        return { h, svg: `<rect x="${x0}" y="${top}" width="${w}" height="${h}" rx="10" fill="${BR}" stroke="${LT}" stroke-width="5"/>` +
          r.lines.map((l, i) => T(c, top + pp * (i + 1), l, r.size, HG('EM'), { fill: LT, ls, maxw: w - 40, max: r.size })).join('') }; };
      // section ahead: lines from 38u, the arrow up at 0.9 W beside the last line, the tourist panel 18u under it
      let y = 38 * u, body = lines(a, 28 * u, y, 'start');
      const last = y + (a.lines.length - 1) * pitch;
      body += harrow(0.9 * W, last - cap / 2 - 6, 0, 72, LT, { len: 1.45, shaft: 0.3, head: 0.55 });
      let div = last + 22 * u;
      if (pa) { const p = panel(pa, 25 * u, pw, last + 18 * u); body += p.svg; div = last + 18 * u + p.h + 12 * u; }
      let H = div;
      if (b) {
        const y2 = div + 32 * u, last2 = y2 + (b.lines.length - 1) * pitch;
        body += `<rect x="9" y="${div - 3}" width="${W - 18}" height="6" fill="${LT}"/>` + lines(b, cx, y2, 'middle') +
          harrow(0.105 * W, last2 - cap / 2 - 4, -90, 72, LT, { len: 1.45, shaft: 0.3, head: 0.55 });
        H = last2 + 22 * u;
        if (pb) { const w = lw(pb) + 26 * u, p = panel(pb, cx - w / 2, w, last2 + 18 * u); body += p.svg; H = last2 + 18 * u + p.h + 16 * u; }
      }
      H = Math.round(H);
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="26" fill="#fafafa"/><rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="20" fill="${NZ_B}"/>` + body);
    } },
  ];
  TS.add('NZ', nz, { next: 'Invercargill', km: 15, road: '6' });
})();
