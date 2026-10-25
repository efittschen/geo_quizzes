// LA: Lao signs carrying a place name, drawn after the GeoHints pictures and photos (see examples/LA.json).
(function () {
  const { T, svg } = TS;
  // Laos: Lao (loopless sans on guide signs, looped hand lettering on km posts) above a Latin form; stacked direction
  // panels, blue or green; village signs blue with "ບ." / "B."; km posts white with a red rounded cap, road number in black
  const LO = "'Noto Sans Lao','Phetsarath OT',sans-serif";
  const LOL = "'Noto Sans Lao Looped','Phetsarath OT',sans-serif";
  const LA = "'Arimo','Helvetica Neue',Arial,sans-serif";
  const W = '#fff', R = '#d8463e';
  const isLao = (s) => /[຀-໿]/.test(s || '');
  const forms = ({ name, alt }) => (isLao(name) ? { lo: name, lat: alt && !isLao(alt) ? alt : '' } : { lo: '', lat: name });
  // straight arrow (shaft + triangular head) or a turn arrow (up, then bent left/right)
  const arr = (x, y, dir, s = 1) => {
    const r = { up: 0, right: 90, left: -90 }[dir];
    return `<path transform="translate(${x},${y}) rotate(${r}) scale(${s})" d="M0,-32 L22,-6 L8,-6 L8,32 L-8,32 L-8,-6 L-22,-6 Z" fill="${W}"/>`;
  };
  const turn = (x, y, dir, s = 1) => `<path transform="translate(${x},${y}) scale(${dir === 'left' ? -s : s},${s})" d="M-22,36 L-22,-4 Q-22,-14 -12,-14 L8,-14 L8,-30 L34,-6 L8,18 L8,2 L-6,2 L-6,36 Z" fill="${W}"/>`;
  // one panel: arrow on its side, Lao above Latin, centred in the space left
  const panel = (y, h, f, side, arrow, fill) => {
    const cx = side === 'left' ? 308 : 212, ax = side === 'left' ? 60 : 460;
    return `<rect x="8" y="${y}" width="504" height="${h}" fill="${fill}"/>` +
      (f.lo ? T(cx, y + h * 0.5, f.lo, 56, LO, { fill: W, weight: 600, maxw: 350, max: 56 }) : '') +
      (f.lat ? T(cx, f.lo ? y + h * 0.84 : y + h * 0.62, f.lat.toUpperCase(), f.lo ? 24 : 38, LA, { fill: W, weight: 700, maxw: 350, max: f.lo ? 24 : 38 }) : '') + arrow(ax, y + h * 0.52);
  };
  const ladder = (fill, turns) => (o) => {
    const a = forms(o), b = forms({ name: o.next, alt: o.nextAlt });
    const h = 150;
    return svg(520, 2 * h + 21, `<rect x="2" y="2" width="516" height="${2 * h + 17}" rx="8" fill="${W}"/>` +
      panel(8, h, a, 'left', (x, y) => arr(x, y, 'up', 1.15), fill) +
      panel(13 + h, h, b, 'right', (x, y) => (turns ? turn(x - 6, y, 'right', 1.2) : arr(x, y, 'right', 1.1)), fill));
  };
  const la = [
    { id: 'ladder-blue', kind: 'direction', label: 'Direction panels (blue)', needs: ['alt'], draw: ladder('#1f4fa8', false) },
    { id: 'ladder-green', kind: 'direction', label: 'Direction panels (green)', needs: ['alt'], draw: ladder('#0f6a4e', true) },
    { id: 'ladder-km', kind: 'direction', label: 'Direction panels with distances', needs: ['alt'], draw: (o) => {
      // one panel per destination: Lao over mixed-case Latin, the arrow and the km figure beside them
      const row = (y, f, dir, km) => {
        const R = dir === 'right';
        return `<rect x="8" y="${y}" width="544" height="196" fill="#2a5db0"/>` +
          (f.lo ? T(R ? 200 : 285, y + 92, f.lo, 66, LO, { fill: W, weight: 500, maxw: R ? 300 : 250, max: 66 }) : '') +
          (f.lat ? T(R ? 200 : 285, y + (f.lo ? 162 : 120), f.lat, f.lo ? 38 : 50, LA, { fill: W, weight: 700, ls: 0.03, maxw: R ? 300 : 250, max: f.lo ? 38 : 50 }) : '') +
          (R ? arr(450, y + 70, 'right', 1.2) : arr(84, y + 100, 'up', 1.45)) +
          T(R ? 452 : 478, y + (R ? 164 : 128), km, 44, LA, { fill: W, weight: 700, maxw: 100, max: 44 });
      };
      return svg(560, 414, `<rect x="1" y="1" width="558" height="412" rx="6" fill="${W}" stroke="#c8c8c8" stroke-width="2"/>` +
        row(8, forms({ name: o.next, alt: o.nextAlt }), 'right', o.km2) + row(210, forms(o), 'up', o.km));
    } },
    { id: 'ban', kind: 'hamlet', label: 'Village sign (Ban)', needs: ['alt'], draw: (o) => {
      // "ບ." (ban, village) before the Lao name, "B." before the Latin
      const { lo, lat } = forms(o);
      return svg(640, 260, `<rect x="2" y="2" width="636" height="256" rx="6" fill="${W}" stroke="#c8c8c8" stroke-width="2"/><rect x="10" y="10" width="620" height="240" rx="4" fill="#173f94"/>` +
        (lo ? T(320, 126, `ບ. ${lo}`, 92, LO, { fill: W, weight: 600, maxw: 570, max: 92 }) : '') +
        (lat ? T(320, lo ? 212 : 160, `B. ${lat.toUpperCase()}`, lo ? 46 : 70, LA, { fill: W, weight: 700, ls: 0.03, maxw: 570, max: lo ? 46 : 70 }) : ''));
    } },
    { id: 'lak-km', kind: 'other', label: 'Km post, red cap', needs: ['alt'], draw: (o) => {
      const { lo, lat } = forms(o);
      return svg(440, 516,
        `<path d="M120,250 L320,250 L320,500 L120,500 Z" fill="#f4f4f0"/><path d="M320,250 L356,236 L356,486 L320,500 Z" fill="#d8d8d2"/>` +
        `<path d="M156,206 A100,100 0 0 1 356,206 Z M126,186 L190,124 L356,206 L320,220 Z" fill="#b8362f"/><path d="M320,220 L356,206 L356,236 L320,250 Z" fill="#b8362f"/>` +
        `<path d="M120,220 A100,100 0 0 1 320,220 L320,250 L120,250 Z" fill="${R}"/>` +
        T(220, 206, o.road, 60, LA, { fill: '#1b1b1b', weight: 700, maxw: 160, max: 60 }) +
        (lo ? T(220, 320, lo, 52, LOL, { weight: 700, maxw: 184, max: 52 }) : '') +
        (lat ? T(220, lo ? 370 : 340, lat.toUpperCase(), lo ? 30 : 38, LA, { weight: 700, maxw: 184, max: lo ? 30 : 38 }) : '') +
        T(220, 448, `${o.km} KM`, 42, LA, { weight: 700, maxw: 170, max: 42 }));
    } },
  ];
  TS.add('LA', la, { next: 'ວຽງຈັນ', km: 25, km2: 64, road: '13N' });
})();
