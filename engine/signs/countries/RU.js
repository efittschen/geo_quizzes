// RU: Russian signs carrying a place name (GOST R 52290-2004), drawn after the GeoHints pictures and the Commons
// drawings of the standard (see examples/RU.json). Names in capitals; sign widths follow the name, as the standard
// sizes these signs individually; long names go on two lines, broken after a hyphen or at a space.
(function () {
  const { T, svg } = TS;
  const B = '#0e68e2', G = '#00a03c', R = '#e3001b';          // the Commons / GeoHints renderings of GOST R 52290 colours
  const F = "'DINish Expanded','DINish',sans-serif";           // stands in for the GOST R 52290 road typeface (type B, wide)
  const FC = "'DINish Condensed','DINish',sans-serif";         // type A, narrow
  const up = (s) => String(s).toLocaleUpperCase('ru');
  const len = (s) => [...String(s)].length;
  // Latin duplication by GOST R 52290-2004 tables Г.4/Г.5: е = ye at the start and after vowels, ё = yo/ye/e,
  // й = y, х = kh, ц = ts, щ = shch, ы = y, ъ ь = ’, э = e, ю = yu, я = ya
  const MAP = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '’', ы: 'y', ь: '’', э: 'e', ю: 'yu', я: 'ya' };
  const lat = (s) => {
    const a = [...String(s)];
    return a.map((ch, i) => {
      const lo = ch.toLowerCase(), prev = (a[i - 1] || '').toLowerCase();
      const start = !/[а-яё]/.test(prev), afterV = 'аеёиоуыэюяъь'.includes(prev);
      let r = lo === 'е' ? (start || afterV ? 'ye' : 'e') : lo === 'ё' ? (start || afterV ? 'yo' : 'жчшщ'.includes(prev) ? 'e' : 'ye') : MAP[lo] ?? ch;
      if (ch !== lo) r = r.charAt(0).toUpperCase() + r.slice(1);
      return r;
    }).join('');
  };
  // two lines of similar length, broken at a space or after a hyphen (the hyphen stays on the first line)
  const split2 = (s) => {
    let best = null;
    for (let i = 1; i < s.length; i++) {
      let a, b;
      if (s[i] === ' ') { a = s.slice(0, i); b = s.slice(i + 1); } else if (s[i - 1] === '-') { a = s.slice(0, i); b = s.slice(i); } else continue;
      const m = Math.max(len(a), len(b));
      if (!best || m < best[2]) best = [a, b, m];
    }
    return best ? [best[0], best[1]] : [s];
  };
  const lines = (s, max) => (len(s) > max ? split2(s) : [s]);
  // a red bar across the plate, from lower left to upper right (5.24.1, 5.26), clipped to the plate
  const bar = (W, H, id) => {
    const cx = W / 2, cy = H / 2, dx = H * 0.62, w = H * 0.115;
    return `<clipPath id="${id}"><rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="${H * 0.075}"/></clipPath>` +
      `<path d="M${cx - dx - w},${H + 4} L${cx + dx - w},-4 L${cx + dx + w},-4 L${cx - dx + w},${H + 4} Z" fill="${R}" clip-path="url(#${id})"/>`;
  };
  // the 5.23.1 / 5.25 plate: the name in capitals, the plate as long as the name needs
  const plate = (name, { bg, fg, edge, crossed }) => {
    const ls = lines(up(name), 15), two = ls.length > 1;
    const H = two ? 440 : 300, size = two ? 158 : 196, cw = 0.71;
    const tw = Math.max(...ls.map(len)) * size * cw;
    const W = Math.round(Math.min(1500, Math.max(H * 1.8, tw + H * 0.55)));
    const maxw = W - H * 0.42;
    const ys = two ? [H * 0.455, H * 0.81] : [H * 0.5 + size * 0.355];
    return svg(W, H,
      `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${H * 0.09}" fill="${edge}" stroke="#888" stroke-width="2"/>` +
      `<rect x="${H * 0.035}" y="${H * 0.035}" width="${W - H * 0.07}" height="${H * 0.93}" rx="${H * 0.065}" fill="${bg}" stroke="${fg}" stroke-width="${bg === '#fff' ? H * 0.028 : 0}"/>` +
      ls.map((l, i) => T(W / 2, ys[i], l, size, F, { fill: fg, weight: 500, ls: 0.04, maxw, max: size })).join('') +
      (crossed ? bar(W, H, 'ru-bar') : ''));
  };
  // a route plate as on 6.9/6.10 signs: white outline on blue or green (M, R, A roads), green box for E roads
  const routePlate = (x, y, road, size, fill) => {
    const w = len(road) * size * 0.62 + size * 0.5;
    return `<rect x="${x}" y="${y - size * 0.86}" width="${w}" height="${size * 1.1}" rx="${size * 0.16}" fill="${fill}" stroke="#fff" stroke-width="${size * 0.07}"/>` +
      T(x + w / 2, y, road, size, F, { fill: '#fff', weight: 500 }) ;
  };
  const plateW = (road, size) => len(road) * size * 0.62 + size * 0.5;

  const ru = [
    { id: 'entry', kind: 'entry', label: 'Locality start (5.23.1)', draw: ({ name }) => plate(name, { bg: '#fff', fg: '#000', edge: '#fff' }) },
    { id: 'exit', kind: 'exit', label: 'Locality end (5.24.1)', draw: ({ name }) => plate(name, { bg: '#fff', fg: '#000', edge: '#fff', crossed: true }) },
    { id: 'entry-blue', kind: 'entry', label: 'Locality start, no town rules (5.25)', draw: ({ name }) => plate(name, { bg: B, fg: '#fff', edge: '#fff' }) },
    { id: 'exit-blue', kind: 'exit', label: 'Locality end, no town rules (5.26)', draw: ({ name }) => plate(name, { bg: B, fg: '#fff', edge: '#fff', crossed: true }) },

    // 6.9.1 advance direction sign, blue (outside towns, not a motorway): two destinations over a roundabout
    { id: 'direction', kind: 'direction', label: 'Advance direction sign (6.9.1, blue)', draw: ({ name, next, road }) => {
      // as wide as the GeoHints photo (4:3); the route plate sits under the left name, clear of the diagram
      const W = 860, H = 640, colW = 380;
      const L = lines(up(name), 13), Rn = lines(up(next), 13);
      const sz = (ls) => (ls.length > 1 ? 66 : 84), lh = (ls) => sz(ls) * 1.04;
      const y0 = (ls) => (ls.length > 1 ? 92 : 108);
      const col = (ls, x, anchor) => ls.map((l, i) => T(x, y0(ls) + i * lh(ls), l, sz(ls), FC, { fill: '#fff', weight: 'bold', anchor, ls: 0.02, maxw: colW, max: sz(ls) })).join('');
      const yPlate = y0(L) + (L.length - 1) * lh(L) + 22;
      const plate = (x, y, r) => {
        const s = 54, w = Math.max(110, len(r) * s * 0.5 + s * 0.55), h = s * 1.2;
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${B}" stroke="#fff" stroke-width="4"/>` +
          T(x + w / 2, y + h / 2 + s * 0.36, r, s, FC, { fill: '#fff', weight: 'bold', ls: 0.02, maxw: w - 24, max: s });
      };
      // the diagram as in the photo: the stem bends into the ring, which runs anticlockwise over the top and down to its
      // left side; the left arm leaves there with a sharp turn, the right one branches off the upper right of the ring
      const cx = 463, cy = 366, rx = 55, ry = 68, sw = 24, P = (deg) => [cx + rx * Math.cos(deg * Math.PI / 180), cy + ry * Math.sin(deg * Math.PI / 180)];
      const [ax, ay] = P(70), [lx, ly] = P(180), [qx, qy] = P(-37);
      const head = (x0, y0_, x1, y1) => {   // a shaft from (x0,y0) and a broad triangular head with its tip at (x1,y1)
        const d = Math.hypot(x1 - x0, y1 - y0_), ux = (x1 - x0) / d, uy = (y1 - y0_) / d, hl = 44, hw = 34;
        const bx = x1 - ux * hl, by = y1 - uy * hl;
        return `<path d="M${x0},${y0_} L${bx + ux * 2},${by + uy * 2}" fill="none" stroke="#fff" stroke-width="${sw}"/>` +
          `<path d="M${x1},${y1} L${bx - uy * hw},${by + ux * hw} L${bx + uy * hw},${by - ux * hw} Z" fill="#fff"/>`;
      };
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="16" fill="#fff" stroke="#888" stroke-width="2"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="10" fill="${B}"/>` +
        col(L, 36, 'start') + col(Rn, W - 36, 'end') + (road ? plate(54, yPlate, road) : '') +
        `<path d="M${cx - 6},${H - 10} L${cx - 6},${cy + ry + 30} C${cx - 6},${cy + ry + 8} ${ax - 14},${ay + 8} ${ax},${ay} A${rx},${ry} 0 1 0 ${lx},${ly}" fill="none" stroke="#fff" stroke-width="${sw}" stroke-linejoin="round"/>` +
        head(lx + 4, ly + 6, 300, 232) + head(qx - 6, qy + 6, 601, 236) +
        T(500, 600, '400 м', 48, FC, { fill: '#fff', weight: 'bold', anchor: 'start' }));
    } },

    // 6.10.1 direction sign on a motorway, green: arrow, route plate, the name in Cyrillic over its Latin form
    { id: 'motorway', kind: 'motorway', label: 'Motorway direction sign (6.10.1, green)', draw: ({ name, alt, road }) => {
      const cy = lines(up(name), 16), la = lines(up(alt || lat(name)), 18), size = 70;
      const all = [...cy, ...la];
      const tw = Math.max(...all.map(len)) * size * 0.71;
      const pw = road ? plateW(road, 58) : 0;
      const x0 = 150 + (road ? pw + 34 : 0);
      const W = Math.round(Math.min(1700, Math.max(700, x0 + tw + 50))), H = 100 + all.length * 92;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18" fill="#fff" stroke="#888" stroke-width="2"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="11" fill="${G}"/>` +
        `<path d="M78,${H - 44} L78,118" stroke="#fff" stroke-width="30"/><path d="M38,128 L78,52 L118,128 Z" fill="#fff"/>` +
        (road ? routePlate(150, 128, road, 58, G) : '') +
        all.map((l, i) => T(x0, 120 + i * 92, l, size, F, { fill: '#fff', weight: 500, anchor: 'start', ls: 0.05, maxw: W - x0 - 40, max: size })).join(''));
    } },

    // 6.10.2 direction pointer, green, after the Commons drawing: the name in Cyrillic over its Latin form, the distance
    // in the tip; the green field ends in a right-angled point inside a longer, sharper white one
    { id: 'pointer', kind: 'direction', label: 'Direction pointer (6.10.2, green)', draw: ({ name, alt, km }) => {
      const N = up(name), La = up(alt || lat(name)), size = 110, d = String(km);
      const tw = Math.max(len(N), len(La)) * size * 0.72, kw = len(d) * size * 0.62;
      const H = 300, x0 = 50;
      const body = Math.round(Math.min(3400, Math.max(900, x0 + tw + 40 + kw - 31)));   // where the green point begins
      const W = body + 266;
      const outer = `M45,2 L${body + 5},2 L${W - 3},150 L${body + 5},298 L45,298 C22,298 2,278 2,255 L2,45 C2,22 22,2 45,2 Z`;
      const green = `M45,9 L${body},9 L${body + 141},150 L${body},291 L45,291 C25,291 9,275 9,255 L9,45 C9,25 25,9 45,9 Z`;
      const maxw = body + 31 - kw - 50 - x0;
      return svg(W, H, `<path d="${outer}" fill="#fff" stroke="#888" stroke-width="2"/><path d="${green}" fill="${G}"/>` +
        T(x0, 141, N, size, F, { fill: '#fff', weight: 500, anchor: 'start', ls: 0.04, maxw, max: size }) +
        T(x0, 243, La, size, F, { fill: '#fff', weight: 500, anchor: 'start', ls: 0.04, maxw, max: size }) +
        T(body + 31, 189, d, size, F, { fill: '#fff', weight: 500, anchor: 'end' }));
    } },

    // 6.12 distance table, blue: towns ahead and their distances
    { id: 'distances', kind: 'direction', label: 'Distance table (6.12, blue)', draw: ({ name, next, km, km2 }) => {
      const rows = [[up(name), km], [up(next), km2 || km + Math.max(12, Math.round(km * 1.6))]];
      const size = 92, kw = Math.max(...rows.map(([, k]) => len(String(k)))) * size * 0.72;
      const W = Math.round(Math.min(2000, Math.max(900, Math.max(...rows.map(([n]) => len(n))) * size * 0.71 + kw + 130))), H = 60 + rows.length * 120;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18" fill="#fff" stroke="#888" stroke-width="2"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="11" fill="${B}"/>` +
        rows.map(([n, k], i) => T(44, 128 + i * 120, n, size, F, { fill: '#fff', weight: 500, anchor: 'start', ls: 0.04, maxw: W - 88 - kw - 40, max: size }) +
          T(W - 44, 128 + i * 120, String(k), size, F, { fill: '#fff', weight: 500, anchor: 'end', ls: 0.06 })).join(''));
    } },
  ];

  TS.add('RU', ru, { next: 'Тверь', km: 12, road: 'М-11' });
})();
