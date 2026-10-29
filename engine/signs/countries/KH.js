// KH: Cambodian signs carrying a place name, drawn after the GeoHints pictures and photos (see examples/KH.json).
(function () {
  const { T, svg } = TS;
  // Cambodia: Khmer above or beside a Latin form; green guide signs, Latin in Helvetica-like capitals (here Arimo);
  // kilometre posts: white with a red cap carrying the road number
  const KM = "'Noto Sans Khmer','Khmer OS',sans-serif";
  const LA = "'Arimo','Helvetica Neue',Arial,sans-serif";
  const G = '#028b3f', W = '#fff', R = '#c8262c';
  const isKhmer = (s) => /[ក-៿]/.test(s || '');
  // Khmer and Latin forms of a place: the quiz may give only a Latin name (no Khmer known) or only Khmer (alt missing)
  const forms = ({ name, alt }) => (isKhmer(name) ? { kh: name, lat: alt && !isKhmer(alt) ? alt : '' } : { kh: '', lat: name });
  // US-style route shield used for national road numbers on guide signs
  // (group D) now the Commons drawing of the marker, shared/shields.js (TS.shields.khNational), 48 high, centred on x, y
  const shield = (x, y, n) => TS.shields.khNational(x - TS.shields.khNational.width(48) / 2, y - 24, 48, n, { ink: '#111', font: LA, capEm: 0.716 });
  // a tapered roundabout arm from the ring (cx,cy) at angle deg (0 = up, clockwise), length len, ending in a point
  const arm = (cx, cy, deg, r0, len, w0 = 34, w1 = 22) => {
    const a = deg * Math.PI / 180, ux = Math.sin(a), uy = -Math.cos(a), px = -uy, py = ux;
    const p = (d, o) => `${(cx + ux * d + px * o).toFixed(1)},${(cy + uy * d + py * o).toFixed(1)}`;
    return `<path d="M${p(r0 - 6, -w0 / 2)} L${p(len - 14, -w1 / 2)} L${p(len, 0)} L${p(len - 14, w1 / 2)} L${p(r0 - 6, w0 / 2)} Z" fill="${W}"/>`;
  };
  // kilometre post in three-quarter view, the cap carrying the km point ("530" on a post 530 km from Phnom Penh); cap: 'round' (old borne) or 'gable' (newer post); plinth: old posts on a stepped base
  const wrap = (s, max) => {
    if ([...s].length <= max || !/\s/.test(s)) return [s];
    const sp = [...s.matchAll(/\s+/g)].map((m) => m.index), mid = s.length / 2;
    const i = sp.reduce((b, v) => (Math.abs(v - mid) < Math.abs(b - mid) ? v : b));
    return [s.slice(0, i), s.slice(i).trim()];
  };
  const post = ({ cap, plinth, upper }) => (o) => {
    const { kh, lat } = forms(o), L = wrap(upper ? lat.toUpperCase() : lat, 14);
    const yb = cap === 'gable' ? 560 : 500, H = plinth ? yb + 96 : cap === 'gable' ? yb + 40 : yb + 16;
    const top = cap === 'round'
      ? `<path d="M156,206 A100,100 0 0 1 356,206 Z M126,186 L190,124 L356,206 L320,220 Z" fill="#a51e23"/><path d="M320,220 L356,206 L356,236 L320,250 Z" fill="#a51e23"/>` +
        `<path d="M120,220 A100,100 0 0 1 320,220 L320,250 L120,250 Z" fill="${R}"/>`
      : `<path d="M220,120 L256,106 L356,176 L356,236 L320,250 L320,190 Z" fill="#a51e23"/><path d="M120,190 L220,120 L320,190 L320,250 L120,250 Z" fill="${R}"/>`;
    const base = plinth
      ? `<path d="M84,${yb} L356,${yb} L392,${yb - 12} L392,${yb + 72} L356,${yb + 86} L84,${yb + 86} Z" fill="#ecebe6"/><path d="M356,${yb} L392,${yb - 12} L392,${yb + 72} L356,${yb + 86} Z" fill="#cfcec8"/><path d="M84,${yb} L356,${yb} L392,${yb - 12} L120,${yb - 12} Z" fill="#f6f6f2"/>`
      : cap === 'gable' ? `<ellipse cx="238" cy="${yb + 8}" rx="150" ry="26" fill="#ededea" stroke="#cfcfca" stroke-width="3"/><path d="M88,${yb + 8} L88,${yb - 10} A150,26 0 0 1 388,${yb - 10} L388,${yb + 8}" fill="#f7f7f4"/>` : '';
    const body = `<path d="M120,250 L320,250 L320,${yb} L120,${yb} Z" fill="#f4f4f0"/><path d="M320,250 L356,236 L356,${yb - 14} L320,${yb} Z" fill="#d8d8d2"/>`;
    const lat2 = L.length > 1, yk = 318, yl = kh ? 368 : 330;
    return svg(440, H, (cap === 'gable' ? base + body : body + base) + top +
      T(220, cap === 'round' ? 214 : 236, o.kmp, cap === 'round' ? 60 : 50, LA, { fill: W, weight: 700, maxw: 170, max: 60 }) +
      (kh ? T(220, yk, kh, 50, KM, { weight: 600, maxw: 180, max: 50 }) : '') +
      L.filter(Boolean).map((l, i) => T(220, yl + i * (lat2 ? 32 : 0) - (lat2 && kh ? 6 : 0), l, kh ? (lat2 ? 24 : 28) : (lat2 ? 32 : 38), LA, { weight: 700, maxw: 184, max: kh ? 28 : 38 })).join('') +
      T(220, yl + (lat2 ? 32 : 0) + 64, `${o.km} Km`, 40, LA, { weight: 700, maxw: 170, max: 40 }) +
      (cap === 'gable' ? `<rect x="212" y="${yb - 92}" width="16" height="54" fill="${R}"/>` : ''));
  };
  const kh = [
    { id: 'roundabout', kind: 'direction', label: 'Roundabout direction sign', needs: ['alt'], draw: (o) => {
      const a = forms(o), b = forms({ name: o.next, alt: o.nextAlt });
      const cx = 315, cy = 318;
      return svg(640, 511, `<rect x="2" y="2" width="636" height="507" rx="24" fill="${G}" stroke="#111" stroke-width="4"/><rect x="11" y="11" width="618" height="489" rx="16" fill="none" stroke="${W}" stroke-width="5"/>` +
        // GeoHints 40 (same 640 x 511 frame), measured: four arms of one constant width (19) with short pencil points, from
        // inside the white ring (radius 29 to 52, cut by a narrow notch at the lower left) to their tips: up-right 222 long
        // at 33 degrees, up-left 112 at -35, left 106 at 251, down 136 at 164; a white dot (13) in the green middle (TS.arrows)
        (() => { const at = (deg, d) => { const a = deg * Math.PI / 180; return [cx + Math.sin(a) * d, cy - Math.cos(a) * d]; };
          const rm = 40.5, n0 = (212 + 8.5) * Math.PI / 180, n1 = (212 - 8.5) * Math.PI / 180;
          const p0 = [cx + Math.sin(n0) * rm, cy - Math.cos(n0) * rm], p1 = [cx + Math.sin(n1) * rm, cy - Math.cos(n1) * rm];
          return TS.arrows.group([[33, 222], [-35, 112], [251, 106], [164, 136]].map(([deg, L]) => ({ pts: [at(deg, 40), at(deg, L)] })),
            { w: 19, fill: W, head: { half: 0.5, back: 0.6, neck: 0.6 } }) +
            `<path d="M${p0[0].toFixed(1)},${p0[1].toFixed(1)}A${rm},${rm} 0 1 1 ${p1[0].toFixed(1)},${p1[1].toFixed(1)}" fill="none" stroke="${W}" stroke-width="23"/><circle cx="${cx}" cy="${cy}" r="13" fill="${W}"/>`; })() +
        (a.kh ? T(442, 74, a.kh, 48, KM, { weight: 700, fill: W, maxw: 300, max: 48 }) : '') +
        wrap(a.lat.toUpperCase(), a.kh ? 24 : 14).filter(Boolean).map((l, i) => T(442, (a.kh ? 106 : 70) + i * 40, l, a.kh ? 22 : 34, LA, { fill: W, maxw: 300, max: a.kh ? 22 : 34 })).join('') +
        (b.kh ? T(40, 150, b.kh, 46, KM, { anchor: 'start', weight: 700, fill: W, maxw: b.lat ? 120 : 250, max: 46 }) : '') +
        wrap(b.lat.toUpperCase(), 14).filter(Boolean).map((l, i, A) => T(b.kh ? 168 : 40, 150 + (i - (A.length - 1) / 2) * 38 + (A.length > 1 ? 0 : 0), l, 32, LA, { anchor: 'start', fill: W, maxw: b.kh ? 160 : 250, max: 32 })).join('') +
        // the picture's route markers are US-route-style shields (ears at the top corners, a bump in the middle, a black
        // outline with a thin white edge outside it), drawn here for this sign only
        (() => { const US = 'M0,22 C6,18 12,10 19,3 C24,7 29,9 34,9 C40,9 45,6 50,1 C55,6 60,9 66,9 C71,9 76,7 81,3 C88,10 94,18 100,22 C97,30 96,40 99,52 C102,66 98,76 90,82 C80,88 60,90 50,100 C40,90 20,88 10,82 C2,76 -2,66 1,52 C4,40 3,30 0,22 Z';
          const us = (x, y, n) => `<g transform="translate(${x - 25},${y - 27}) scale(0.5)"><path d="${US}" fill="${W}" stroke="${W}" stroke-width="12" stroke-linejoin="round"/><path d="${US}" fill="${W}" stroke="#111" stroke-width="5" stroke-linejoin="round"/></g>` +
            T(x, y + 11, n, String(n).length > 2 ? 20 : 29, LA);
          return us(462, 270, o.road) + us(208, 262, o.road2); })());
    } },
    { id: 'schema', kind: 'direction', label: 'Diagram direction sign (green)', needs: ['alt'], draw: (o) => {
      // straight on: name (Khmer over Latin capitals) above the arrow; left branch: next, with distances and route shields
      const a = forms(o), b = forms({ name: o.next, alt: o.nextAlt });
      const block = (x, y, f, anchor, w) => (f.kh ? T(x, y, f.kh, 52, KM, { anchor, fill: W, weight: 600, maxw: w, max: 52 }) : '') +
        (f.lat ? wrap(f.lat.toUpperCase(), f.kh ? 30 : 13).map((l, i) => T(x, y + (f.kh ? 52 : 4) + i * 44, l, f.kh ? 34 : 40, LA, { anchor, fill: W, maxw: w, max: f.kh ? 34 : 40 })).join('') : '');
      return svg(640, 480, `<rect x="2" y="2" width="636" height="476" rx="14" fill="#16a58c" stroke="${W}" stroke-width="4"/>` +
        block(330, 92, a, 'middle', 360) + T(560, 150, `${o.km}km`, 34, LA, { fill: W }) +
        block(30, 330, b, 'start', 250) + T(130, 268, `${o.km2}km`, 34, LA, { fill: W, anchor: 'start' }) + shield(76, 258, o.road) +
        // the photos' diagram: the stem and the branch the same width, both ending in short pencil points, joined (TS.arrows)
        TS.arrows.group([{ pts: [[440, 450], [440, 230]] }, { pts: [[440, 376], [322, 314]] }], { w: 19, fill: W, head: { half: 0.5, back: 0.55, neck: 0.55 } }) +
        shield(482, 372, o.road2));
    } },
    { id: 'fleche', kind: 'direction', label: 'Direction boards (teal)', needs: ['alt'], draw: (o) => {
      // one board per destination: Khmer above Latin capitals, a big arrow beside the Latin, blue route shield in the corner
      const board = (y, f, dir, road) => {
        const ax = dir === 'right' ? 560 : 80, cx = dir === 'right' ? 300 : 340;
        const ar = `<path transform="translate(${ax},${y + 152}) rotate(${dir === 'right' ? 90 : -90}) scale(1.25)" d="M0,-34 L24,-6 L9,-6 L9,30 L-9,30 L-9,-6 L-24,-6 Z" fill="${W}"/>`;
        // (group D) the blue five-sided route plate of the photos, shared/shields.js
        const sh = road ? TS.shields.khRoute(30, y + 20, 70, road, { fg: W, font: LA, weight: 700, capEm: 0.716 }) : '';
        return `<rect x="4" y="${y}" width="632" height="210" rx="10" fill="#138f80" stroke="${W}" stroke-width="5"/>` + sh +
          (f.kh ? T(320, y + 96, f.kh, 64, KM, { fill: W, weight: 600, maxw: 420, max: 64 }) : '') +
          (f.kh ? (f.lat ? T(cx, y + 166, f.lat.toUpperCase(), 40, LA, { fill: W, weight: 700, ls: 0.04, maxw: 400, max: 40 }) : '')
            : wrap(f.lat.toUpperCase(), 14).map((l, i, A) => T(cx, y + (A.length > 1 ? 92 : 130) + i * 62, l, 50, LA, { fill: W, weight: 700, ls: 0.04, maxw: 400, max: 50 })).join('')) + ar;
      };
      return svg(640, 440, board(4, forms(o), 'right', o.road) + board(226, forms({ name: o.next, alt: o.nextAlt }), 'left'));
    } },
    { id: 'liste', kind: 'direction', label: 'Stacked direction panels (green)', needs: ['alt'], draw: (o) => {
      const panel = (y, f) => `<rect x="10" y="${y}" width="620" height="150" fill="#285e48"/>` +
        `<path transform="translate(68,${y + 70}) rotate(-90) scale(1.0)" d="M0,-30 L20,-6 L7,-6 L7,30 L-7,30 L-7,-6 L-20,-6 Z" fill="${W}"/>` +
        (f.kh ? T(130, y + 72, f.kh, 54, KM, { anchor: 'start', fill: W, weight: 600, maxw: 470, max: 54 }) : '') +
        (f.lat ? T(130, y + (f.kh ? 126 : 96), f.lat, f.kh ? 40 : 50, LA, { anchor: 'start', fill: W, weight: 700, maxw: 470, max: f.kh ? 40 : 50 }) : '');
      return svg(640, 338, `<rect x="1" y="1" width="638" height="336" rx="6" fill="${W}" stroke="#c8c8c8" stroke-width="2"/>` +
        panel(10, forms(o)) + panel(178, forms({ name: o.next, alt: o.nextAlt })));
    } },
    { id: 'borne-carree', kind: 'other', label: 'Km post, square, two faces', needs: ['alt'], draw: (o) => {
      // a square post seen corner-on: the name on the left face, the next town on the right, the cap band orange-red
      const a = forms(o), b = forms({ name: o.next, alt: o.nextAlt });
      const face = (cx, f, km, sk) => {
        const k = Math.tan(sk * Math.PI / 180), ex = `transform="skewY(${sk})"`, ly = (y) => y - cx * k;
        return (f.kh ? T(cx, ly(232), f.kh, 40, KM, { weight: 600, maxw: 160, max: 40, extra: ex }) : '') +
          (f.kh ? (f.lat ? T(cx, ly(290), f.lat, 26, LA, { weight: 700, maxw: 160, max: 26, extra: ex }) : '')
            : wrap(f.lat, 12).map((l, i, A) => T(cx, ly((A.length > 1 ? 236 : 262) + i * 40), l, 30, LA, { weight: 700, maxw: 160, max: 30, extra: ex })).join('')) +
          T(cx, ly(364), `${km} Km`, 36, LA, { weight: 700, maxw: 150, max: 36, extra: ex }) +
          T(cx, ly(140), o.kmp, 50, LA, { fill: W, weight: 700, maxw: 140, max: 50, extra: ex });
      };
      return svg(440, 520,
        `<path d="M40,96 L220,120 L220,500 L40,476 Z" fill="#efe7d8"/><path d="M220,120 L400,96 L400,476 L220,500 Z" fill="#e2d9c8"/>` +
        `<path d="M40,96 L220,120 L220,178 L40,154 Z" fill="#e8462c"/><path d="M220,120 L400,96 L400,154 L220,178 Z" fill="#d23c24"/>` +
        `<path d="M40,96 L220,72 L400,96 L220,120 Z" fill="#f05a3c"/>` +
        face(130, a, o.km, 7.6) + face(310, b, o.km2, -7.6));
    } },
    { id: 'borne', kind: 'other', label: 'Km post, red cap', needs: ['alt'], draw: post({ cap: 'round', upper: true }) },
    { id: 'borne-socle', kind: 'other', label: 'Km post on a plinth', needs: ['alt'], draw: post({ cap: 'round', plinth: true }) },
    // road-number-signs 52, measured: a tall narrow post seen almost face on (front 78 x 157 px under the cap, a sliver of
    // side face), a red cap band (40 px) with the km point under a low pyramid roof (18 px), Khmer, the Latin name, the
    // distance, a short red bar low down, standing in a round white base (a disc 116 px across, 22 px thick)
    { id: 'borne-pointue', kind: 'other', label: 'Km post, pointed cap', needs: ['alt'], draw: (o) => {
      const { kh, lat } = forms(o), k = 2.31, x0 = 120, bw = 78 * k, sd = 12, x1 = x0 + bw, cx = x0 + bw / 2;
      const yr = 60, ye = yr + 18 * k, yc = ye + 40 * k, yb = yc + 157 * k, ex = 58 * k, ey = 18 * k, th = 22 * k, pk = x0 + 61 * k;
      const L = wrap(lat, 13), two = L.length > 1;
      const H = Math.round(yb + 10 * k + ey + th + 6);
      const by = yb + 10 * k;   // the base's top centre
      return svg(440, H,
        // round base: side band, then the top face
        `<path d="M${cx - ex},${by} L${cx - ex},${by + th} A${ex},${ey} 0 0 0 ${cx + ex},${by + th} L${cx + ex},${by} Z" fill="#e4e4e0" stroke="#c9c9c4" stroke-width="2"/>` +
        `<ellipse cx="${cx}" cy="${by}" rx="${ex}" ry="${ey}" fill="#f7f7f4" stroke="#d2d2cd" stroke-width="2"/>` +
        // body (front, side) and cap (band front, band side, roof front and side)
        `<path d="M${x0},${yc} L${x1},${yc} L${x1},${yb + 8} L${x0},${yb + 8} Z" fill="#f4f4f0"/><path d="M${x1},${yc} L${x1 + sd},${yc - 6} L${x1 + sd},${yb + 2} L${x1},${yb + 8} Z" fill="#d6d6d0"/>` +
        `<path d="M${x0},${ye} L${x1},${ye} L${x1},${yc} L${x0},${yc} Z" fill="${R}"/><path d="M${x1},${ye} L${x1 + sd},${ye - 6} L${x1 + sd},${yc - 6} L${x1},${yc} Z" fill="#a51e23"/>` +
        `<path d="M${x0},${ye} L${pk},${yr} L${x1},${ye} Z" fill="#d94a4f"/><path d="M${x1},${ye} L${pk},${yr} L${x1 + sd},${ye - 6} Z" fill="#a51e23"/>` +
        T(cx, ye + 20 * k + 19, o.kmp, 54, LA, { fill: W, weight: 700, maxw: bw - 40, max: 54 }) +
        (kh ? T(cx, yc + 34 * k, kh, 42, KM, { weight: 600, maxw: bw - 20, max: 42 }) : '') +
        L.filter(Boolean).map((l, i) => T(cx, yc + (kh ? 61 : 48) * k + (two ? (i - 0.5) * 30 : 0), l, two ? 24 : 28, LA, { weight: 700, maxw: bw - 24, max: 28 })).join('') +
        T(cx, yc + 92 * k, `${o.km} Km`, 38, LA, { weight: 700, maxw: bw - 30, max: 38 }) +
        `<rect x="${cx - 8}" y="${yc + 115 * k}" width="17" height="${32 * k}" fill="${R}"/>`);
    } },
  ];
  TS.add('KH', kh, { next: 'ភ្នំពេញ', km: 39, km2: 81, kmp: 118, road: '4', road2: '3' });
})();
