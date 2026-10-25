// AL: Albanian signs carrying a place name, drawn after the GeoHints pictures (see examples/AL.json for which).
(function () {
  const { T, svg } = TS;
  // lettering (cap height in em, mean width of capitals in em): Helvetica-style bold for town plates, condensed bold for the
  // blue place sign and blue direction signs, Transport-style (CCRIGE) on green direction signs
  const HB = "'Arimo',sans-serif", HB_CAP = 0.688, HB_W = 0.608;
  const NB = "'Archivo Narrow','Roboto Condensed',sans-serif", NB_CAP = 0.686, NB_W = 0.499;
  const TR = "'CCRIGE','Arimo',sans-serif", TR_CAP = 0.40, TR_W = 0.378;
  const BLUE = '#04408f', GREEN = '#035e4d', PBLUE = '#2350a6', PGREEN = '#0f7a5a', NAVY = '#262a5a', RED = '#e30613';
  const len = (s) => [...String(s)].length;
  // direction signs print names in capitals without the diaeresis (SHKODER, LEZHE, TIRANE on the GeoHints pictures)
  const dirCaps = (s) => String(s).toUpperCase().replace(/Ë/g, 'E');
  const split2 = (s) => {
    const cuts = [];
    for (let i = 1; i < s.length; i++) { if (s[i] === ' ') cuts.push([s.slice(0, i), s.slice(i + 1)]); else if (s[i - 1] === '-') cuts.push([s.slice(0, i), s.slice(i)]); }
    return cuts.length ? cuts.reduce((b, c) => (Math.max(len(c[0]), len(c[1])) < Math.max(len(b[0]), len(b[1])) ? c : b)) : [s];
  };
  // text lines sharing one size: the cap height `cap`, or less when the longest line needs it to fit maxw
  const lines = (x, y0, dy, ls, cap, font, fcap, w, maxw, o = {}) => {
    const z = Math.min(cap / fcap, maxw / (Math.max(...ls.map(len)) * (w + (o.ls || 0)) * 1.03));
    return ls.map((l, i) => T(x, y0 + i * dy, l, z, font, { weight: 'bold', maxw, max: z, ...o })).join('');
  };
  const head = (x, y, deg, w, fill = '#fff') => `<path transform="translate(${x},${y}) rotate(${deg})" d="M0,0 L${-w * 2},${-w} L${-w * 2},${w} Z" fill="${fill}"/>`;
  // motorway number shield (Italian-style: arched top and bottom, pointed sides) and road-number plate
  const shield = (x, y, w, h, label, fill, line) =>
    `<path d="M${x + 0.08 * w},${y + 0.07 * h} Q${x + w / 2},${y - 0.05 * h} ${x + 0.92 * w},${y + 0.07 * h} L${x + w},${y + h / 2} L${x + 0.92 * w},${y + 0.93 * h} Q${x + w / 2},${y + 1.05 * h} ${x + 0.08 * w},${y + 0.93 * h} L${x},${y + h / 2} Z" fill="${fill}" stroke="${line}" stroke-width="2.5"/>` +
    T(x + w / 2, y + h * 0.7, label, h * 0.44 / NB_CAP, NB, { fill: line, weight: 'bold', maxw: w * 0.76, max: h * 0.44 / NB_CAP });
  const plateNo = (x, y, w, h, label, line = '#fff') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="${line}" stroke-width="3"/>` +
    T(x + w / 2, y + h * 0.74, label, h * 0.5 / NB_CAP, NB, { fill: line, weight: 'bold', maxw: w * 0.82, max: h * 0.5 / NB_CAP });

  // white town plate, huge Helvetica-style capitals; a long name goes to two lines
  const plate = ({ name }, exit) => {
    const N = String(name).toUpperCase(), W = 640;
    const one = 560 / (len(N) * (HB_W + 0.1) * 1.03) * HB_CAP >= 74 || split2(N).length < 2;
    const ls = one ? [N] : split2(N), H = one ? 202 : 300;
    const text = one ? lines(W / 2, 156, 0, ls, 110, HB, HB_CAP, HB_W, 570, { ls: 0.1 }) : lines(W / 2, 134, 116, ls, 88, HB, HB_CAP, HB_W, 570, { ls: 0.06 });
    const bar = exit ? `<clipPath id="al-x"><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="16"/></clipPath><path d="M0,${H - 26} L${W},${4} L${W},${48} L0,${H + 18} Z" fill="${RED}" clip-path="url(#al-x)"/>` : '';
    return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="#fff" stroke="#888" stroke-width="1"/>${bar}<rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="20" fill="none" stroke="#000" stroke-width="4"/>` + text);
  };

  const al = [
    { id: 'entry', kind: 'entry', label: 'Town entry', draw: (o) => plate(o, false) },
    { id: 'exit', kind: 'exit', label: 'Town exit', draw: (o) => plate(o, true) },
    { id: 'locality', kind: 'hamlet', label: 'Village sign (blue)', draw: ({ name }) => {
      const N = String(name).toUpperCase(), W = 400, H = 330, ls = len(N) > 10 && split2(N).length > 1 ? split2(N) : [N];
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="14" fill="#0b3d91"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="10" fill="none" stroke="#e8e8e8" stroke-width="6"/>` +
        lines(W / 2, ls.length > 1 ? 160 : 200, 84, ls, 70, NB, NB_CAP, NB_W, 350, { fill: '#e2e2e2' }));
    } },
    { id: 'blue-direction', kind: 'direction', label: 'Direction sign (blue)', defaults: { road: 'SH1' }, draw: ({ name, next, road }) => {
      const W = 560, H = 600, a = dirCaps(name), b = len(dirCaps(next)) > 11 ? split2(dirCaps(next)) : [dirCaps(next)];
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18" fill="${BLUE}"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="14" fill="none" stroke="#fff" stroke-width="5"/>` +
        plateNo(36, 52, 82, 42, road) + lines(140, 92, 0, [a], 40, NB, NB_CAP, NB_W, 380, { fill: '#fff', anchor: 'start' }) +
        `<path d="M70,560 L70,280 M70,470 Q70,396 136,396 L150,396" fill="none" stroke="#fff" stroke-width="14"/>` + head(70, 230, -90, 22) + head(194, 396, 0, 22) +
        lines(214, b.length > 1 ? 380 : 410, 66, b, 40, NB, NB_CAP, NB_W, 310, { fill: '#fff', anchor: 'start' }));
    } },
    { id: 'green-direction', kind: 'direction', label: 'Direction sign (green)', defaults: { road: 'A1', road2: 'SH40' }, draw: ({ name, next, road, road2 }) => {
      const W = 640, H = 560, a = dirCaps(name), b = dirCaps(next);
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="${GREEN}"/><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="6" fill="none" stroke="#e8e8e8" stroke-width="4"/>` +
        shield(132, 66, 58, 56, road, GREEN, '#e8e8e8') + lines(236, 116, 0, [a], 44, TR, TR_CAP, TR_W, 370, { fill: '#e8e8e8', anchor: 'start', weight: 'normal' }) +
        `<path d="M80,520 L80,230 M80,470 Q80,380 140,380 L150,380" fill="none" stroke="#e8e8e8" stroke-width="18"/>` + head(80, 178, -90, 26, '#e8e8e8') + head(216, 380, 0, 26, '#e8e8e8') +
        `<circle cx="124" cy="390" r="32" fill="#fff" stroke="${RED}" stroke-width="8"/>` + T(124, 403, '40', 34, HB, { weight: 'bold', fill: '#111' }) +
        plateNo(244, 352, 86, 50, road2, '#e8e8e8') + lines(352, 398, 0, [b], 44, TR, TR_CAP, TR_W, 260, { fill: '#e8e8e8', anchor: 'start', weight: 'normal' }));
    } },
    { id: 'urban', kind: 'direction', label: 'Roundabout sign (white)', draw: ({ name }) => {
      const W = 640, H = 440, a = dirCaps(name), ls = len(a) > 9 && split2(a).length > 1 ? split2(a) : [a], h = 24 + ls.length * 36;
      const panel = (x, y, fill) => `<rect x="${x}" y="${y}" width="190" height="${h}" fill="${fill}"/>` + lines(x + 95, y + 48, 36, ls, 30, HB, HB_CAP, HB_W, 176, { fill: '#fff' });
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="14" fill="#f2f2f0"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="26" fill="none" stroke="${NAVY}" stroke-width="7"/>` +
        panel(190, 130 - h, PBLUE) +
        `<path d="M290,390 L290,340 A52,52 0 0 0 290,236 L290,196" fill="none" stroke="${NAVY}" stroke-width="13"/><path d="M342,288 L376,288" stroke="${NAVY}" stroke-width="13"/>` +
        head(290, 160, -90, 15, NAVY) + head(410, 288, 0, 15, NAVY) + panel(420, 288 - h / 2, PGREEN));
    } },
  ];

  TS.add('AL', al, { next: 'Lezhë', km: 9, road: 'SH1' });
})();
