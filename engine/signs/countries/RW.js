// RW: Rwanda. Green guide signs with yellow route numbers (NR1, DR60), a roundabout diagram, blue arrow-shaped
// fingerposts; DIN lettering (Alte DIN 1451 Mittelschrift). Drawn from photos: the GeoHints direction-sign picture and
// Commons photos (see examples/RW.json). No standard town entry sign was found.
(function () {
  const { T, svg } = TS;
  const d = 8, CAP = 7 * d;
  const G = '#0d6e4f', BL = '#1f4fb4', Y = '#f2b318', W = '#fff';
  const DIN = "'Alte DIN 1451 Mittelschrift','D-DIN',sans-serif", SD = CAP / 0.711, LD = 0.03;
  // advance widths (1/1000 em) measured from Alte DIN 1451 Mittelschrift
  const CH = " -'.&()/,0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const WD = [240, 407, 240, 240, 648, 278, 278, 333, 240, 480, 337, 480, 480, 480, 480, 484, 480, 480, 494, 623, 610, 556, 630, 556, 537, 610, 648, 258, 481, 630, 556, 758, 684, 610, 593, 610, 610, 574, 500, 630, 556, 832, 536, 500, 519, 480, 519, 444, 519, 498, 278, 519, 537, 240, 258, 519, 258, 852, 537, 500, 519, 519, 389, 480, 278, 537, 444, 722, 480, 444, 444];
  const base = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/’/g, "'");
  const tw = (s, k = 1) => [...base(s)].reduce((a, c) => { const w = WD[CH.indexOf(c)]; return a + ((w > 0 ? w : 560) / 1000 + LD) * SD * k; }, 0);
  const txt = (s) => String(s == null ? '' : s).replace(/\s*\([^)]*\)\s*$/, '').replace(/'/g, '’');
  const line = (x, y, s, { fill = W, anchor = 'start', k = 1, maxw = 0 } = {}) => T(x, y, s, SD * k, DIN, { fill, anchor, ls: LD, maxw, max: SD * k });
  // a name on up to two lines (cut at the space that balances them best) when it is wider than maxw
  const wrap2 = (s, maxw) => {
    if (tw(s) <= maxw || !/\s/.test(s)) return [s];
    let best = [s], bw = Infinity;
    for (let i = 1; i < s.length; i++) if (s[i] === ' ') { const a = s.slice(0, i), b = s.slice(i + 1), w = Math.max(tw(a), tw(b)); if (w < bw) { bw = w; best = [a, b]; } }
    return best;
  };
  const frame = (w, h, fill, rx = 2.5 * d) => `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${rx}" fill="${W}" stroke="#9a9a9a" stroke-width="2"/>` +
    `<rect x="${0.8 * d}" y="${0.8 * d}" width="${w - 1.6 * d}" height="${h - 1.6 * d}" rx="${rx - 0.8 * d}" fill="${fill}"/>`;
  // straight arrow: shaft 3.4d, triangular head 12d wide and 7.5d long; deg 0 = up
  const arrow = (x, y, deg, L) => {
    const s = 1.7 * d, hw = 6 * d, hl = 7.5 * d, t = -L / 2, b = L / 2;
    return `<path transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${deg})" d="M0,${t}L${hw},${t + hl}H${s}V${b}H${-s}V${t + hl}H${-hw}Z" fill="${W}"/>`;
  };
  // turn arrow: up from the bottom, bending (rounded) into the given side, head pointing that way; box w x h centred on x,y
  const turn = (x, y, side, w = 15 * d, h = 15 * d) => {
    const sg = side === 'left' ? -1 : 1, s = 1.7 * d, r = 3.5 * d, x0 = x - sg * (w / 2 - s), yb = y + h / 2, yt = y - h / 2 + 6 * d, xe = x + sg * (w / 2 - 7.5 * d);
    return `<path d="M${x0},${yb}V${yt + r}Q${x0},${yt} ${x0 + sg * r},${yt}H${xe}" fill="none" stroke="${W}" stroke-width="${2 * s}"/>` +
      `<path d="M${xe - sg * 0.5},${yt - 6 * d}L${x + sg * (w / 2)},${yt}L${xe - sg * 0.5},${yt + 6 * d}Z" fill="${W}"/>`;
  };
  // direction sign: one band per direction, route number (yellow) in a column, the destinations under each other,
  // the arrow at the right, bands parted by white lines
  const bands = (list) => {
    list = list.map((b) => ({ ...b, lines: b.lines.map(txt), road: b.road ? String(b.road) : '' }));
    const rw = Math.max(0, ...list.map((b) => (b.road ? tw(b.road) : 0))), x0 = 6 * d, xn = x0 + (rw ? rw + 5 * d : 0), AW = 16 * d;
    const Wd = Math.round(xn + Math.max(...list.flatMap((b) => b.lines.map((s) => tw(s)))) + 7 * d + AW + 5 * d);
    const P = 12.5 * d, bh = list.map((b) => Math.max(6 * d + CAP + (b.lines.length - 1) * P + 7 * d, 22 * d));
    const Hd = Math.round(0.8 * d * 2 + bh.reduce((a, h) => a + h, 0) + (list.length - 1) * 0.8 * d);
    let out = frame(Wd, Hd, G), y = 0.8 * d;
    list.forEach((b, i) => {
      if (i) { out += `<rect x="${0.8 * d}" y="${y}" width="${Wd - 1.6 * d}" height="${0.8 * d}" fill="${W}"/>`; y += 0.8 * d; }
      const h = bh[i], top = y + (h - (CAP + (b.lines.length - 1) * P)) / 2 - 0.5 * d, ax = Wd - 5 * d - AW / 2, ay = y + h / 2;
      if (b.road) out += line(x0, top + CAP, b.road, { fill: Y });
      b.lines.forEach((s, j) => { out += line(xn, top + CAP + j * P, s, { maxw: Wd - xn - 7 * d - AW - 5 * d }); });
      if (b.dir === 'up') out += arrow(ax, ay, 0, Math.min(h - 6 * d, 19 * d));
      else if (b.dir === 'left' || b.dir === 'right') out += arrow(ax, ay, b.dir === 'left' ? -90 : 90, 14 * d);
      else out += turn(ax, ay, b.dir === 'turnleft' ? 'left' : 'right', 14 * d, Math.min(h - 6 * d, 16 * d));
      y += h;
    });
    return svg(Wd, Hd, out);
  };
  // roundabout diagram: ring with the approach from below, an arm up (straight on, its destination at the top left)
  // and an arm to the right; the right arm's destination to the right, its distance in brackets under it
  const roundabout = ({ right, km, ahead }) => {
    const rl = wrap2(txt(right), 40 * d), al = txt(ahead), dist = `(${String(km).replace('.', ',')}km)`;
    const cx = 30 * d, cy = 46 * d, r = 10 * d, sw = 4.4 * d, rx0 = Math.max(cx + r + 24 * d, 7 * d + tw(al) + 9 * d), P = 10 * d;
    const cw = Math.max(...rl.map((s) => tw(s)), tw(dist, 0.8)), ty = 5 * d + CAP;
    const Wd = Math.round(Math.max(rx0 + cw + 7 * d, 100 * d));
    const blockB = ty + (rl.length - 1) * P + 10 * d, Hd = Math.round(Math.max(cy + r + 18 * d, blockB + 10 * d));
    let o = frame(Wd, Hd, G);
    o += line(7 * d, ty, al, { maxw: rx0 - 12 * d });
    // GeoHints 23: the ring drawn from the left round over the top to the entry below (the lower-left quarter open); the
    // arms as wide as the ring, starting at its inner edge and ending in short pencil points; the entry cut square (TS.arrows)
    const ri = r - sw / 2;
    o += `<path d="M${cx - r},${cy}A${r},${r} 0 1 1 ${cx},${cy + r}" fill="none" stroke="${W}" stroke-width="${sw}"/>`;
    o += TS.arrows.group([{ pts: [[cx, cy - ri], [cx, ty + 4 * d]] }, { pts: [[cx + ri, cy], [cx + r + 15 * d, cy]] }, { pts: [[cx, cy + ri], [cx, Hd - 3 * d]], head: null }],
      { w: sw, fill: W, head: { half: 0.5, back: 0.6, neck: 0.6 } });
    rl.forEach((s, i) => { o += line(rx0, ty + i * P, s, { maxw: Wd - rx0 - 6 * d }); });
    o += line(rx0 + cw / 2, blockB, dist, { anchor: 'middle', k: 0.8 });
    return svg(Wd, Hd, o);
  };
  // blue arrow-shaped fingerpost: white border following the outline, the name and distance in white capitals
  const fingerpost = ({ name, km, dir = 'right' }) => {
    const t = `${txt(name).toUpperCase()}  ${String(km).replace(',', '.')} KM`, k = 0.9, Hd = 15 * d, tip = 8 * d;
    const Wd = Math.round(tw(t, k) + 10 * d + tip), sg = dir === 'left' ? -1 : 1;
    const pts = (m) => { const a = m, b = Hd - m, x0 = dir === 'left' ? tip + m * 0.4 : m, x1 = dir === 'left' ? Wd - m : Wd - tip - m * 0.4;
      return dir === 'left' ? `M${m},${Hd / 2}L${x0},${a}H${x1}V${b}H${x0}Z` : `M${x0},${a}H${x1}L${Wd - m},${Hd / 2}L${x1},${b}H${x0}Z`; };
    const tx = dir === 'left' ? tip + 5 * d : 5 * d;
    // the white edge runs at the board's rim, no blue outside it (Commons photo, Gisenyi)
    return svg(Wd, Hd, `<path d="${pts(0)}" fill="${W}" stroke="${W}" stroke-width="1" stroke-linejoin="round"/>` + TS.frames.rim(Wd, Hd, 0, { d: pts(0) }) +
      `<path d="${pts(1.5 * d)}" fill="${BL}" stroke="${BL}" stroke-width="1" stroke-linejoin="round"/>` +   // the white edge a tenth of the board's height, as measured on the photo (8 of 78-88 px)
      line(tx, Hd / 2 + (CAP * k) / 2, t, { k, maxw: Wd - tip - 10 * d }) + (sg ? '' : ''));
  };
  const rw = [
    { id: 'direction', kind: 'direction', label: 'Direction sign', draw: ({ name, next, road }) =>
      bands([{ road, lines: [name], dir: 'up' }, { lines: [next], dir: 'turnright' }]) },
    { id: 'roundabout', kind: 'direction', label: 'Roundabout diagram', draw: ({ name, next, km }) => roundabout({ right: name, km, ahead: next }) },
    { id: 'fingerpost', kind: 'direction', label: 'Fingerpost (blue)', draw: ({ name, km }) => fingerpost({ name, km }) },
  ];
  TS.add('RW', rw, { next: 'Muhanga', km: 5, road: 'NR1' });
})();
