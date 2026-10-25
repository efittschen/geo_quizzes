// VN: Vietnamese signs carrying a place name, drawn after the GeoHints pictures and photos (see examples/VN.json).
(function () {
  const { T, svg } = TS;
  // Vietnam: place names in capitals (DIN 1451-style, here Barlow Semi Condensed with full Vietnamese accents);
  // blue guide signs on ordinary roads, green on expressways; road plates white (ĐT, QL) or yellow (CT, expressway)
  const F = "'Barlow Semi Condensed','DIN 1451 Engschrift',sans-serif";
  const FW = "'Barlow','DIN 1451 Mittelschrift',sans-serif";
  const B = '#0046a9', G = '#0a9647', G2 = '#136b40', W = '#fff', Y = '#ffd200';
  const up = (s) => String(s).toLocaleUpperCase('vi');
  // a name over one or two lines, broken at the space or dash nearest the middle when longer than max characters
  const wrap = (s, max) => {
    if ([...s].length <= max || !/[\s–-]/.test(s)) return [s];
    const sp = [...s.matchAll(/\s+|[–-]/g)].map((m) => [m.index, m[0]]), mid = s.length / 2;
    const [i, sep] = sp.reduce((b, v) => (Math.abs(v[0] - mid) < Math.abs(b[0] - mid) ? v : b));
    return /\s/.test(sep) ? [s.slice(0, i), s.slice(i).trim()] : [s.slice(0, i + 1), s.slice(i + 1).trim()];
  };
  // km-post form of a name: every syllable but the last cut to its initial and a dot ("Tả Chải" -> "T.CHẢI"), per dash part
  const kmName = (s) => up(s).split(/\s*[–-]\s*/).map((p) => { const w = p.split(/\s+/); return w.slice(0, -1).map((x) => [...x][0] + '.').join('') + w[w.length - 1]; }).join('–');
  // road plate: white with black edge (ĐT, QL) or yellow (CT)
  const plate = (x, y, w, h, txt, fill = W) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="#111" stroke-width="2.5"/>` +
    T(x + w / 2, y + h * 0.79, txt, h * 0.72, F, { weight: 600, maxw: w - 10, max: h * 0.72 });
  // filled arrow: straight shaft up from (x, y0) to y1 with a branch from yb going up-right to (bx, by)
  const fork = (x, y0, y1, yb, bx, by, sw = 17) => {
    const hd = (px, py, deg) => `<path transform="translate(${px},${py}) rotate(${deg})" d="M0,0 L27,30 L-27,30 Z" fill="${W}"/>`;
    const ang = Math.atan2(bx - x, -(by - yb)) * 180 / Math.PI, ux = Math.sin(ang * Math.PI / 180), uy = -Math.cos(ang * Math.PI / 180);
    return `<path d="M${x},${y0} L${x},${y1 + 26} M${x},${yb} L${bx - ux * 26},${by - uy * 26}" fill="none" stroke="${W}" stroke-width="${sw}"/>` + hd(x, y1, 0) + hd(bx, by, ang);
  };
  // expressway pictogram (group D, shared/shields.js: the Commons drawing of the Vietnamese sign), 68 x 97
  const motorwayIcon = (x, y) => TS.shields.motorway(x, y, 97, { style: 'vn', fg: W, bg: G });
  // kilometre post in three-quarter view: white body, rounded cap (red on national roads, green on provincial ones)
  const cotKm = (cap, capSide, cls) => ({ name, abbr, km, kmp, road }) => {
    const nm = abbr || kmName(name), two = [...nm].length > 8 && /–/.test(nm) ? [nm.slice(0, nm.indexOf('–') + 1), nm.slice(nm.indexOf('–') + 1)] : null;
    return svg(420, 520,
      `<path d="M80,190 L300,190 L300,470 L80,470 Z" fill="#f3f3ef"/><path d="M300,190 L360,170 L360,446 L300,470 Z" fill="#d9d9d3"/>` +
      `<path d="M140,170 A110,110 0 0 1 360,170 Z M155,86 L215,66 L360,170 L300,190 Z" fill="${capSide}"/><path d="M80,190 A110,110 0 0 1 300,190 Z" fill="${cap}"/>` +
      `<path d="M80,190 L300,190 L300,236 L80,236 Z" fill="${cap}"/><path d="M300,190 L360,170 L360,216 L300,236 Z" fill="${capSide}"/>` +
      T(190, 222, `Km${kmp}`, 64, F, { fill: W, weight: 600, maxw: 196, max: 64 }) +
      (two ? two.map((l, i) => T(190, 300 + i * 62, l, 60, F, { weight: 600, maxw: 200, max: 60 })).join('') + T(190, 444, `${km} Km`, 54, F, { weight: 600, maxw: 190, max: 54 })
        : T(190, 326, nm, 74, F, { weight: 600, maxw: 200, max: 74 }) + T(190, 424, `${km} Km`, 62, F, { weight: 600, maxw: 190, max: 62 })) +
      T(330, 296, cls, 34, F, { weight: 600, extra: 'transform="skewY(-18)"', maxw: 50, max: 34 }).replace(/y="296"/, `y="${296 + 330 * Math.tan(18 * Math.PI / 180)}"`) +
      T(330, 340, road, 34, F, { weight: 600, extra: 'transform="skewY(-18)"', maxw: 50, max: 34 }).replace(/y="340"/, `y="${340 + 330 * Math.tan(18 * Math.PI / 180)}"`));
  };
  // boundary sign (địa phận): blue board, white edge, ĐỊA PHẬN above the name, a ward or km-station line below,
  // on red-and-white striped posts; leaving it, the same board struck through by a red diagonal
  const diaPhan = (out) => ({ name, district, kmp, hm }) => {
    const N = wrap(up(name), 17), two = N.length > 1, sub = district ? up(district) : `Km${kmp}+${hm}`;
    const ys = two ? [204, 268] : [236];
    return svg(640, 470,
      `<rect x="62" y="6" width="22" height="464" fill="#fff" stroke="#b9b9b9" stroke-width="1.5"/><rect x="556" y="6" width="22" height="464" fill="#fff" stroke="#b9b9b9" stroke-width="1.5"/>` +
      [0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="62" y="${6 + i * 70}" width="22" height="35" fill="#d8262c"/><rect x="556" y="${6 + i * 70}" width="22" height="35" fill="#d8262c"/>`).join('') +
      `<rect x="20" y="20" width="600" height="${two ? 360 : 330}" fill="${W}" stroke="#9aa" stroke-width="1"/><rect x="28" y="28" width="584" height="${two ? 344 : 314}" fill="#1f3fa8"/>` +
      T(320, 100, 'ĐỊA PHẬN', 46, F, { fill: W, weight: 600, ls: 0.06 }) +
      N.map((l, i) => T(320, ys[i], l, two ? 66 : 80, F, { fill: W, weight: 600, maxw: 550, max: two ? 66 : 80 })).join('') +
      T(320, two ? 334 : 306, sub, 44, F, { fill: W, weight: 600, maxw: 500, max: 44 }) +
      // exit bar (group B): a thin red strip over the lettering and the white edge, corner to corner of the board
      (out ? TS.exitbar({ box: [20, 20, 600, two ? 360 : 330, 0], b: 0, t: 1, width: 13, fill: '#e0262b' }) : ''));
  };
  // boundary stele (the two Hải Vân Pass photos, Km 904+800): no posts; the board set in a concrete frame that runs down
  // to the ground. Blue: dark grey frame (Đà Nẵng side). Green: white frame on a plinth with two stone balls in front
  // (Thừa Thiên Huế side), ĐỊA PHẬN in serif capitals. The name tall and filling the board, the km station or ward below.
  const SERIF = "'Noto Serif SemiCondensed','Noto Serif',serif";
  const stele = (green) => ({ name, district, kmp, hm }) => {
    const N = wrap(up(name), 11), two = N.length > 1, sub = district ? up(district) : green ? `Km${kmp}+${hm}` : `Km.${kmp} + ${hm}`;
    const H = green ? 760 : 640, fx = 20, fy = 10, fw = 600, fh = green ? 550 : H - fy, bi = green ? 22 : 30;
    const bx = fx + bi, by = fy + bi, bw = fw - 2 * bi, bh = green ? fh - 2 * bi : 500;
    const sz = two ? 112 : 168, ny = two ? [by + bh * 0.47, by + bh * 0.47 + 118] : [by + bh * 0.6];
    let out = green
      ? `<radialGradient id="vn-ball" cx="0.38" cy="0.34" r="0.72"><stop offset="0" stop-color="#ecebe6"/><stop offset="0.65" stop-color="#b3b1aa"/><stop offset="1" stop-color="#7f7d77"/></radialGradient>` +
        `<rect x="4" y="${fy + fh - 4}" width="632" height="${H - fy - fh + 4}" fill="#d6d4cd"/><rect x="4" y="690" width="632" height="${H - 690}" fill="#bdbbb4"/>` +
        `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="#efeee9" stroke="#a9a8a2" stroke-width="2"/>`
      : `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="#61645f" stroke="#474946" stroke-width="2"/>`;
    out += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${green ? '#2e8a4b' : '#2f62b4'}"/>` +
      (green ? T(320, by + 84, 'ĐỊA PHẬN', 58, SERIF, { fill: W, weight: 600, ls: 0.1 }) : T(320, by + 84, 'ĐỊA PHẬN', 56, F, { fill: W, weight: 600, ls: 0.06 })) +
      N.map((l, i) => T(320, ny[i], l, sz, F, { fill: W, weight: 600, maxw: bw - 48, max: sz })).join('') +
      T(320, by + bh - (green ? 64 : 46), sub, 62, F, { fill: W, weight: 600, maxw: bw - 80, max: 62 });
    if (green) out += [170, 470].map((x) => `<circle cx="${x}" cy="600" r="88" fill="url(#vn-ball)"/>`).join('');
    return svg(640, H, out);
  };
  const vn = [
    { id: 'dia-phan', kind: 'entry', label: 'Boundary stele (Địa phận, blue)', draw: stele(false) },
    { id: 'het-dia-phan', kind: 'exit', label: 'End of boundary (struck through)', draw: diaPhan(true) },
    { id: 'dia-phan-xanh-la', kind: 'entry', label: 'Boundary stele (Địa phận, green)', draw: stele(true) },
    // the board on red-and-white posts of the Nam Từ Liêm photo (there struck through), kept as its own design
    { id: 'dia-phan-cot', kind: 'entry', label: 'Boundary sign on posts (Địa phận)', draw: diaPhan(false) },
    { id: 'chi-dan', kind: 'direction', label: 'Advance sign to an expressway (blue)', draw: ({ name, next, road }) => {
      const L = wrap(up(name), 12), R = wrap(up(next), 13);
      return svg(640, 448, `<rect x="1" y="1" width="638" height="446" rx="16" fill="${B}"/><rect x="5" y="5" width="630" height="438" rx="13" fill="none" stroke="${W}" stroke-width="3.5"/>` +
        L.map((l, i) => T(40, 73 + i * 46, l, 42, F, { anchor: 'start', fill: W, weight: 500, maxw: 250, max: 42 })).join('') +
        plate(38, 103 + (L.length - 1) * 40, 115, 53, road) +
        fork(60, 348, 183 + (L.length - 1) * 40, 300, 160, 212 + (L.length - 1) * 20) + plate(183, 197 + (L.length - 1) * 20, 117, 53, 'CT.01', Y) + motorwayIcon(432, 47) +
        R.map((l, i) => T(463, 207 + i * 63, l, 42, F, { fill: W, weight: 500, maxw: 300, max: 42 })).join('') +
        T(33, 408, '500 m', 40, FW, { anchor: 'start', fill: W, weight: 500 }));
    } },
    { id: 'cao-toc', kind: 'motorway', label: 'Expressway direction sign (green)', draw: ({ name, next, road }) => {
      const L = wrap(up(next), 9), R = wrap(up(name), 11);
      return svg(640, 250, `<rect x="1" y="1" width="638" height="248" rx="12" fill="${G}"/><rect x="5" y="5" width="630" height="240" rx="9" fill="none" stroke="${W}" stroke-width="3"/>` +
        plate(133, 32, 102, 43, 'CT.01', Y) +
        L.map((l, i) => T(237, (L.length > 1 ? 136 : 150) + i * 46, l, 40, F, { anchor: 'end', fill: W, weight: 500, maxw: 200, max: 40 })).join('') +
        fork(287, 220, 28, 168, 386, 64) + plate(415, 33, 98, 42, road) +
        R.map((l, i) => T(415, (R.length > 1 ? 130 : 150) + i * 53, l, 40, F, { anchor: 'start', fill: W, weight: 500, maxw: 205, max: 40 })).join(''));
    } },
    { id: 'chi-dan-xanh', kind: 'direction', label: 'Direction sign, ordinary road (blue)', draw: ({ name, alt, next, nextAlt, km, km2, road, road2 }) => {
      // straight on: next (with its road plate) above the arrow; branch: name, with an optional English line in brackets
      const same = (a, b) => !a || a.toLocaleLowerCase('vi') === String(b).toLocaleLowerCase('vi');
      if (same(alt, name)) alt = ''; if (same(nextAlt, next)) nextAlt = '';
      const L = wrap(up(next), 12), R = wrap(up(name), 14), pl = (x, y, w, t) => `<rect x="${x}" y="${y}" width="${w}" height="40" fill="none" stroke="${W}" stroke-width="2.5"/>` + T(x + w / 2, y + 32, t, 34, F, { fill: W, weight: 600, maxw: w - 8, max: 34 });
      const ly = L.length > 1 ? 50 : 62, ry = (R.length > 1 ? 196 : 222) - (alt ? 0 : 6);
      return svg(640, 360, `<rect x="1" y="1" width="638" height="358" fill="${B}"/>` +
        L.map((l, i) => T(165, ly + i * 44, l, 46, F, { fill: W, weight: 600, maxw: 290, max: 46 })).join('') +
        (nextAlt ? T(165, ly + (L.length - 1) * 44 + 34, `(${nextAlt})`, 26, FW, { fill: W, weight: 600, maxw: 290, max: 26 }) : '') +
        T(165, ly + (L.length - 1) * 44 + (nextAlt ? 70 : 42), `${km2} KM`, 30, FW, { fill: W, weight: 600 }) +
        // the photo's arrows (TS.arrows): a broad stem to the bottom edge under a short flat-backed head barely wider than
        // it; the branch, much narrower, leaving the stem at about 24 degrees with a small head of its own, joined to it
        TS.arrows.group([{ pts: [[178, 359], [178, 152]], w: 40, head: { half: 0.78, back: 0.9, neck: 0.9 } },
          { pts: [[178, 334], [326, 267]], w: 22, head: { half: 0.95, back: 1.45, neck: 1.25 } }], { fill: W }) +
        pl(84, 168, 60, String(road2).replace(/^QL\.?\s*/i, '')) + pl(232, 198, 64, String(road).replace(/^(QL|ĐT)\.?\s*/i, '')) +
        R.map((l, i) => T(482, ry + i * 46, l, 40, F, { fill: W, weight: 600, maxw: 270, max: 40 })).join('') +
        (alt ? T(482, ry + (R.length - 1) * 46 + 38, `(${alt})`, 24, FW, { fill: W, weight: 600, maxw: 280, max: 24 }) : '') +
        T(482, ry + (R.length - 1) * 46 + (alt ? 96 : 64), `${km}KM`, 42, FW, { fill: W, weight: 600 }));
    } },
    { id: 'bang-mui-ten', kind: 'direction', label: 'Finger boards (green)', draw: ({ name, next, km, km2 }) => {
      // arrow-shaped boards on a post: the name pointing left with its km plate, the next town pointing right
      const board = (y, txt, k, dir) => {
        const L = dir === 'left';
        const body = L ? `<path d="M20,${y + 45} L70,${y} L330,${y} L330,${y + 90} L70,${y + 90} Z" fill="${G2}"/><path d="M34,${y + 45} L66,${y + 22} L66,${y + 68} Z" fill="${W}"/>`
          : `<path d="M310,${y} L570,${y} L620,${y + 45} L570,${y + 90} L310,${y + 90} Z" fill="${G2}"/><path d="M606,${y + 45} L574,${y + 22} L574,${y + 68} Z" fill="${W}"/>`;
        const kp = L ? `<rect x="346" y="${y}" width="120" height="90" fill="${G2}"/>` + T(406, y + 60, `${k} KM`, 36, F, { fill: W, weight: 600, maxw: 108, max: 36 })
          : `<rect x="174" y="${y}" width="120" height="90" fill="${G2}"/>` + T(234, y + 60, `${k} KM`, 36, F, { fill: W, weight: 600, maxw: 108, max: 36 });
        const ls = wrap(up(txt), 11);
        return body + kp + ls.map((l, i) => T(L ? 198 : 440, y + (ls.length > 1 ? 40 + i * 38 : 62), l, ls.length > 1 ? 36 : 50, F, { fill: W, weight: 600, maxw: 244, max: ls.length > 1 ? 36 : 50 })).join('');
      };
      return svg(640, 330, `<rect x="300" y="0" width="40" height="330" fill="#2f7a4f"/>` + board(20, name, km, 'left') + board(150, next, km2, 'right'));
    } },
    { id: 'cot-km-ql', kind: 'other', label: 'Km post, national road (red cap)', defaults: { road: '1A' }, draw: cotKm('#c8372f', '#a92b25', 'QL') },
    { id: 'cot-km-dt', kind: 'other', label: 'Km post, provincial road (green cap)', defaults: { road: '830' }, draw: cotKm('#127a5e', '#0d604a', 'ĐT') },
  ];
  TS.add('VN', vn, { next: 'Bến Lức', km: 14, km2: 46, kmp: 75, hm: 800, road: 'ĐT.830', road2: '1A' });
  // the km posts carry the road number without "QL"/"ĐT" prefix on the side; strip it from a full plate number
  for (const t of vn.filter((t) => t.id.startsWith('cot-km'))) { const d = t.draw; t.draw = (o) => d({ ...o, road: String(o.road).replace(/^(QL|ĐT)\.?\s*/i, '') }); }
})();
