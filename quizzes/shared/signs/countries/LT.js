// LT: Lithuanian signs carrying a place name, drawn after the GeoHints pictures (see examples/LT.json).
// Place names in narrow, widely spaced capitals (DIN-like on the photos); DINish Condensed stands in.
(function () {
  const { T, svg } = TS;
  const FC = "'DINish Condensed','DINish','Noto Sans',sans-serif";
  // advance widths (em) of DINish Condensed Medium, to size a sign before the real font is measured
  const CH = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-./'():ÆØÅæøåÐðÞþßŊŋĐđŦŧ";
  const W = Object.fromEntries([...CH].map((c, i) => [c, +'175469465475472403401475472207264461383589492475438475464426382473432661415399376401410407410408287410413200198412235638413409410410295385297413383587359383379404280394402419400396367404396367164297156263263164685475469629409401497403438410415492413497410367297'.substr(i * 3, 3) / 1000]));
  const tw = (s, ls = 0) => [...String(s)].reduce((a, c) => a + (W[c] ?? W[c.normalize('NFD')[0]] ?? 0.45) + ls, 0);
  const split2 = (s) => {
    const cut = [...s].map((c, i) => (c === ' ' || c === '-' ? i : -1)).filter((i) => i > 0);
    if (!cut.length) return null;
    const i = cut.reduce((b, x) => (Math.abs(x - s.length / 2) < Math.abs(b - s.length / 2) ? x : b));
    return s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : [s.slice(0, i), s.slice(i + 1)];
  };
  const up = (s) => String(s).toLocaleUpperCase('lt');
  const BLUE = '#22449a', RED = '#d4202e', INK = '#1a1a22';
  const txt = (x, y, s, max, maxw, o = {}) => {
    const ls = o.ls || 0, size = Math.min(max, maxw / tw(s, ls));
    const dx = (o.anchor || 'middle') === 'middle' ? ls * size / 2 : 0;
    return T(x + dx, y, s, size, FC, { weight: 500, maxw, max, ...o });
  };

  // white name sign (built-up area): thin dark frame, the name in widely spaced dark capitals; its length follows the
  // name and a two-word name too long for one line goes on two; at the end of the place a red bar crosses it
  const balta = ({ name }, end) => {
    // the end sign is laid out as its photo (city-signs 101): letters 0.43 of the plate's height, a quarter of the height
    // free on each side, so the plate comes out about 2.8 times as long as high; the start sign keeps its photo's tight
    // margins (city-signs 100)
    const n = up(name), ls = end ? 0.04 : 0.05, S = end ? 168 : 130, pad = end ? 70 : 22, pitch = end ? 155 : 120;
    let L = [n];
    if (tw(n, ls) * S + 2 * pad > 1300 && split2(n)) L = split2(n);
    const w = Math.max(480, Math.min(1300, Math.max(...L.map((l) => tw(l, ls) * S)) + 2 * pad)), H = 270 + (L.length - 1) * pitch;
    const y0 = end ? H / 2 - (L.length - 1) * pitch / 2 + 0.69 * S / 2 : 181;
    // exit bar (group B): in front of the name, from near the bottom-left corner to near the top-right one, both ends
    // cut flat by the frame's inner edge
    const bar = end ? TS.exitbar({ box: [11.5, 11.5, w - 23, H - 23, 6], b: 0.18, t: 0.82, width: 36, fill: RED }) : '';
    return svg(w, H, `<rect width="${w}" height="${H}" rx="12" fill="#f4f4f2" stroke="#bbb" stroke-width="2"/><rect x="9" y="9" width="${w - 18}" height="${H - 18}" rx="8" fill="none" stroke="${INK}" stroke-width="5"/>` +
      L.map((l, i) => txt(w / 2, y0 + i * pitch, l, S, w - 2 * pad, { ls, fill: INK })).join('') + bar);
  };

  // direction board (blue, white edge): an arrow to the left, the name and its distance in white capitals
  const kryptis = ({ name, km }) => {
    const n = up(name), k = String(km), ls = 0.08, S = 58, nw = tw(n, ls) * S, kw = tw(k) * S;
    const w = Math.max(480, Math.min(1300, 128 + nw + 40 + kw + 22)), H = 84;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="10" fill="#eef0f4"/><rect x="5" y="5" width="${w - 10}" height="${H - 10}" rx="7" fill="${BLUE}"/>` +
      `<path d="M20,42L58,16V33H108V51H58V68Z" fill="#eef0f4"/>` +
      txt(124, 63, n, S, w - 124 - kw - 60, { ls, fill: '#eef0f4', anchor: 'start' }) + txt(w - 22, 63, k, S, kw + 4, { fill: '#eef0f4', anchor: 'end' }));
  };

  TS.add('LT', [
    { id: 'pradzia', kind: 'entry', label: 'Built-up area starts', draw: (o) => balta(o, false) },
    { id: 'pabaiga', kind: 'exit', label: 'Built-up area ends', draw: (o) => balta(o, true) },
    { id: 'kryptis', kind: 'direction', label: 'Direction board (blue)', draw: kryptis },
    // (group H) from Commons photos: the motorway sign is green, other main-road signs blue with red road plates
    ...(() => {
      const LTW = '#eef0f4', MG = '#0f7a5a';
      // red road plate (A9) with a thin white rim, as on the A9 and A14 signs
      const plate = (x, y, h, road) => { const w = Math.max(h * 1.5, tw(road) * h * 0.82 + h * 0.5);
        return { w, svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.12}" fill="#c4262e" stroke="${LTW}" stroke-width="${h * 0.07}"/>` + txt(x + w / 2, y + h * 0.8, road, h * 0.82, w - h * 0.3, { fill: LTW }) }; };
      const upArrow = (x, y0, y1, w) => TS.arrows.straight(x, y1, x, y0, { w, fill: LTW, head: { half: 1.6, back: 2.4, neck: 2.4 } });
      return [
        // motorway direction sign (Commons, A2 near Raguva: ↑ VILNIUS 104 / U-turn RAGUVA 7): green, white edge; the
        // destination straight on with its distance, the exit's destination (next) in a blue box with a white rim beside
        // the turning arrow. The name takes km + 12 so the farther place stands on top
        { id: 'magistrale', kind: 'motorway', label: 'Motorway direction sign (green)', draw: ({ name, next, km }) => {
          const S = 58, ls = 0.08, a = up(name), b = next ? up(next) : '', da = String(+km + (next ? 12 : 0)), db = String(km);
          const nw = Math.min(760, Math.max(tw(a, ls), b ? tw(b, ls) : 0) * S), dw = Math.max(tw(da), tw(db)) * S;
          const W = Math.round(Math.max(520, 130 + 30 + nw + 40 + dw + 40)), H = b ? 210 : 112, bx = 140;
          const uturn = `<path d="M84,${H - 22} V146 Q84,124 62,124 Q40,124 40,146 V168" fill="none" stroke="${LTW}" stroke-width="16"/>` + `<path d="M22,162 L58,162 L40,192 Z" fill="${LTW}"/>`;
          return svg(W, H, `<rect width="${W}" height="${H}" rx="10" fill="${LTW}"/><rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="7" fill="${MG}"/>` +
            upArrow(62, 18, 94, 16) + txt(bx + 16, 78, a, S, W - bx - 16 - dw - 60, { ls, fill: LTW, anchor: 'start' }) + txt(W - 34, 78, da, S, dw + 4, { fill: LTW, anchor: 'end' }) +
            (b ? `<rect x="${bx}" y="118" width="${W - bx - 18}" height="76" rx="6" fill="${BLUE}" stroke="${LTW}" stroke-width="4"/>` + uturn +
              txt(bx + 16, 178, b, S, W - bx - 16 - dw - 60, { ls, fill: LTW, anchor: 'start' }) + txt(W - 34, 178, db, S, dw + 4, { fill: LTW, anchor: 'end' }) : ''));
        } },
        // distance table (Commons, A9 near Šeduva: [A9] [E272] / RADVILIŠKIS 14 / ŠIAULIAI 36): blue, white edge, the road
        // plate on top, the places in spaced capitals with their distances right-aligned, the nearer first (next at km,
        // the name at km + 12)
        { id: 'atstumai', kind: 'direction', label: 'Distance table (blue)', defaults: { road: 'A9' }, draw: ({ name, next, km, road }) => {
          const S = 58, ls = 0.08, rows = (next ? [[up(next), km], [up(name), +km + 12]] : [[up(name), km]]).map(([s, d]) => [s, String(d)]);
          const nw = Math.min(760, Math.max(...rows.map(([s]) => tw(s, ls))) * S), dw = Math.max(...rows.map(([, d]) => tw(d))) * S;
          const W = Math.round(Math.max(480, 30 + nw + 40 + dw + 30)), top = road ? 96 : 20, H = top + rows.length * 74 + 22, p = road ? plate(0, 22, 62, road) : null;
          return svg(W, H, `<rect width="${W}" height="${H}" rx="10" fill="${LTW}"/><rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="7" fill="${BLUE}"/>` +
            (p ? plate(W / 2 - p.w / 2, 22, 62, road).svg : '') + rows.map(([s, d], i) => { const y = top + (i + 1) * 74 - 12;
              return txt(30, y, s, S, W - 60 - dw - 40, { ls, fill: LTW, anchor: 'start' }) + txt(W - 30, y, d, S, dw + 4, { fill: LTW, anchor: 'end' }); }).join(''));
        } },
        // advance direction sign (Commons, A9: ↑ [A9] ŠIAULIAI, → PAKRUOJIS, 100 m): blue, white edge; a stem up the left
        // side to an arrow ahead with next and its road plate, an arm to the right with an arrow to the name, the distance
        // to the junction at the foot
        { id: 'isankstine', kind: 'direction', label: 'Advance direction sign (blue)', defaults: { road: 'A9' }, draw: ({ name, next, road }) => {
          const S = 52, ls = 0.08, a = next ? up(next) : '', b = up(name), p = road ? plate(0, 0, 54, road) : { w: 0 };
          const W = Math.round(Math.max(560, 96 + p.w + 22 + (a ? tw(a, ls) * S : 0) + 30, 96 + tw(b, ls) * S + 30)), H = 330;
          return svg(W, H, `<rect width="${W}" height="${H}" rx="10" fill="${LTW}"/><rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="7" fill="${BLUE}"/>` +
            TS.arrows.group([{ pts: [[48, H - 60], [48, 26]] }, { pts: [[48, 226], [W - 40, 226]] }], { w: 14, fill: LTW, head: { half: 1.6, back: 2.6, neck: 2.6 } }) +
            (road ? plate(96, 36, 54, road).svg : '') + (a ? txt(96 + p.w + 22, 82, a, S, W - 96 - p.w - 22 - 30, { ls, fill: LTW, anchor: 'start' }) : '') +
            txt(W - 40, 196, b, S, W - 96 - 40, { ls, fill: LTW, anchor: 'end' }) + txt(66, H - 26, '100 m', 40, 140, { fill: LTW, anchor: 'start' }));
        } },
      ];
    })(),
  ], { km: 12 });
})();
