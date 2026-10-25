// AE: Emirati signs carrying a place name, drawn after the GeoHints pictures (see examples/AE.json). Arabic (Naskh)
// with the English form (alt) under it or beside it. Blue for roads between emirates, green within one emirate.
(function () {
  const { T, svg } = TS;
  const B = '#1b4f9c', G = '#0b6a4c';
  const AR = "'Noto Naskh Arabic','Geeza Pro',serif";               // Naskh, as the signs use
  const EN = "'Arimo','Liberation Sans',Arial,sans-serif";          // stands in for Transport (Heavy) of the English
  const len = (s) => [...String(s)].length;
  const arabic = (s) => /[؀-ۿ]/.test(String(s || ''));
  const downArrow = (x, y, s, fill) => `<path transform="translate(${x},${y}) scale(${s / 100})" d="M-14,-46 L14,-46 L14,4 L52,-20 L0,40 L-52,-20 L-14,4 Z" fill="${fill}"/>`;
  const arrow = (x, y, s, rot, fill) => `<path transform="translate(${x},${y}) rotate(${rot}) scale(${s / 100})" d="M-10,50 L-10,-8 L-34,-8 L0,-50 L34,-8 L10,-8 L10,50 Z" fill="${fill}"/>`;
  const turnLeft = (x, y, s, fill) => `<path transform="translate(${x},${y}) scale(${s / 100})" d="M30,60 L30,-10 Q30,-30 10,-30 L-20,-30 L-20,-52 L-56,-20 L-20,12 L-20,-10 L10,-10 L10,60 Z" fill="${fill}"/>`;
  const shield = (cx, cy, n, s) => `<rect x="${cx - s * 0.5}" y="${cy - s * 0.62}" width="${s}" height="${s * 1.24}" rx="${s * 0.08}" fill="#fff"/><path d="M${cx - s * 0.36},${cy - s * 0.48} L${cx + s * 0.36},${cy - s * 0.48} L${cx + s * 0.36},${cy + s * 0.2} Q${cx},${cy + s * 0.56} ${cx - s * 0.36},${cy + s * 0.2} Z" fill="${B}"/>` +
    `<rect x="${cx - s * 0.3}" y="${cy - s * 0.08}" width="${s * 0.6}" height="${s * 0.3}" fill="#e8742a"/>` + T(cx, cy + s * 0.18, n, s * 0.3, EN, { fill: '#fff', weight: 'bold' });
  const motorway = (x, y, s) => `<rect x="${x}" y="${y}" width="${s * 0.8}" height="${s}" rx="6" fill="none" stroke="#fff" stroke-width="5"/><path d="M${x + s * 0.4},${y + s * 0.12} L${x + s * 0.16},${y + s * 0.88} M${x + s * 0.4},${y + s * 0.12} L${x + s * 0.64},${y + s * 0.88} M${x + s * 0.2},${y + s * 0.3} L${x + s * 0.6},${y + s * 0.3}" stroke="#fff" stroke-width="7"/>`;

  const ae = [
    // place-name sign (blue): Arabic over English
    { id: 'entry', kind: 'entry', label: 'Place-name sign (blue)', needs: ['alt'], draw: ({ name, alt }) => {
      const tw = Math.max(len(name) * 150 * 0.5, alt ? len(alt) * 130 * 0.62 : 0);
      const W = Math.round(Math.min(1500, Math.max(760, tw + 160))), H = 500;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="80" fill="#e8ecf2" stroke="#aaa" stroke-width="2"/><rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="64" fill="${B}"/>` +
        T(W / 2, alt ? 220 : 300, name, alt ? 168 : 200, AR, { fill: '#f2f4f8', weight: 'bold', maxw: W - 140, max: alt ? 168 : 200 }) +
        (alt ? T(W / 2, 410, alt, 132, EN, { fill: '#f2f4f8', weight: 'bold', maxw: W - 140, max: 132 }) : ''));
    } },
    // overhead signs (blue): the through route on the left, the exit on the right with route shield and EXIT band
    // (group D) the motorway sign is the portrait-framed pictogram with the deck on splayed legs, the route the federal E
    // shield on its white plate (both Commons drawings, shared/shields.js); the lane arrows are the picture's: a short
    // stub of shaft over a very wide, shallow head (measured in shaft widths: half 3.0, barbs 1.65 behind the tip, their
    // ends cut 0.4 parallel to the shaft, neck 1.8; 3 shafts long overall), TS.arrows
    { id: 'direction', kind: 'motorway', label: 'Overhead signs, inter-emirate road (blue)', needs: ['alt'], draw: ({ name, alt, next, road }) => {
      const W = 1260, H = 640, lx = 10, lw = 560, rx = 600, rw = 650;
      const AE_HEAD = { half: 3.0, back: 1.65, cut: 0.4, neck: 1.8 }, sw = 17;
      const downArrow = (x, y, s, fill) => TS.arrows.dir(x, y, 180, sw * 3.0 * s / 100, { w: sw * s / 100, fill, head: AE_HEAD });
      return svg(W, H, `<rect x="${lx}" y="150" width="${lw}" height="${H - 160}" rx="12" fill="${B}" stroke="#ddd" stroke-width="5"/>` +
        T(lx + lw - 40, 270, next, 74, AR, { fill: '#fff', weight: 'bold', anchor: 'end', maxw: lw - 80, max: 74 }) +
        (arabic(next) ? '' : T(lx + 40, 380, next, 60, EN, { fill: '#fff', weight: 'bold', anchor: 'start', maxw: lw - 80, max: 60 })) +
        downArrow(lx + 110, H - 80, 125, '#fff') + downArrow(lx + lw - 110, H - 80, 125, '#fff') +
        `<rect x="${rx}" y="10" width="${rw}" height="${H - 20}" rx="12" fill="#eceef0" stroke="#ddd" stroke-width="5"/><rect x="${rx + 6}" y="16" width="${rw - 12}" height="${H - 160}" rx="8" fill="${B}"/>` +
        TS.shields.motorway(rx + 40, 92, 140, { style: 'ro' }) + (road ? TS.shields.aeRoute(rx + 40, 296, 140, road, { font: EN, capEm: 0.716 }) : '') +
        T(rx + rw - 40, 150, name, 84, AR, { fill: '#fff', weight: 'bold', anchor: 'end', maxw: rw - 220, max: 84 }) +
        (alt ? T(rx + 160, 360, alt, 70, EN, { fill: '#fff', weight: 'bold', anchor: 'start', maxw: rw - 200, max: 70 }) : '') +
        downArrow(rx + rw / 2, H - 70, 115, '#111') + T(rx + rw - 40, H - 92, 'مخرج', 50, AR, { fill: '#111', weight: 'bold', anchor: 'end' }) + T(rx + rw - 40, H - 34, 'EXIT', 46, EN, { fill: '#111', weight: 'bold', anchor: 'end' }));
    } },
    // guide sign within one emirate (green): rows with arrows, English left, Arabic right
    { id: 'direction-green', kind: 'direction', label: 'Guide sign, within an emirate (green)', needs: ['alt'], draw: ({ name, alt, next }) => {
      const W = 760, H = 560;
      return svg(W, H, `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="10" fill="${G}" stroke="#ddd" stroke-width="5"/><path d="M6,180 L${W - 6},180" stroke="#eee" stroke-width="6"/>` +
        arrow(70, 92, 110, 0, '#f2f2ee') + T(W - 50, 118, next, 66, AR, { fill: '#f2f2ee', weight: 'bold', anchor: 'end', maxw: arabic(next) ? 560 : 300, max: 66 }) +
        (arabic(next) ? '' : T(140, 116, next, 56, EN, { fill: '#f2f2ee', weight: 'bold', anchor: 'start', maxw: 280, max: 56 })) +
        turnLeft(90, 370, 150, '#f2f2ee') +
        T(W - 50, alt ? 320 : 390, name, 78, AR, { fill: '#f2f2ee', weight: 'bold', anchor: 'end', maxw: 500, max: 78 }) +
        (alt ? T(190, 450, alt, 64, EN, { fill: '#f2f2ee', weight: 'bold', anchor: 'start', maxw: 520, max: 64 }) : ''));
    } },
  ];

  TS.add('AE', ae, { next: 'الشارقة', road: '311' });
})();
