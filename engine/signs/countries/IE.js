// IE: Irish signs carrying a place name, drawn after the GeoHints pictures (see examples/IE.json). Every name is shown
// twice: the Irish form in italic mixed case (the EI-TP alphabet, with an undotted i) over the English form in
// capitals (Transport). Public Sans stands in for both (SemiBold Italic, Bold). Green for national roads and town
// plates on them, white for regional roads, blue for motorways.
(function () {
  const { T, svg } = TS;
  const PS = "'Public Sans','Arimo',sans-serif";
  // Public Sans Bold (caps) and SemiBold Italic advance widths (em; cap height 0.723 em), from the font files
  const A_B = {" ":0.226,"'":0.261,"-":0.393,".":0.27,"(":0.333,")":0.337,"0":0.644,"1":0.428,"2":0.635,"3":0.665,"4":0.656,"5":0.675,"6":0.66,"7":0.626,"8":0.671,"9":0.659,"A":0.727,"B":0.684,"C":0.718,"D":0.72,"E":0.634,"F":0.614,"G":0.759,"H":0.77,"I":0.307,"J":0.402,"K":0.717,"L":0.578,"M":0.917,"N":0.782,"O":0.76,"P":0.652,"Q":0.773,"R":0.696,"S":0.692,"T":0.616,"U":0.724,"V":0.704,"W":0.969,"X":0.717,"Y":0.667,"Z":0.669,"Á":0.727,"É":0.634,"Í":0.307,"Ó":0.76,"Ú":0.724};
  const A_I = {" ":0.234,"'":0.252,"-":0.376,".":0.247,"A":0.697,"B":0.659,"C":0.688,"D":0.692,"E":0.616,"F":0.592,"G":0.728,"H":0.75,"I":0.299,"J":0.391,"K":0.682,"L":0.563,"M":0.88,"N":0.753,"O":0.727,"P":0.629,"Q":0.741,"R":0.669,"S":0.673,"T":0.587,"U":0.696,"V":0.662,"W":0.927,"X":0.684,"Y":0.619,"Z":0.64,"a":0.545,"b":0.59,"c":0.529,"d":0.589,"e":0.554,"f":0.386,"g":0.606,"h":0.576,"i":0.257,"ı":0.261,"j":0.275,"k":0.556,"l":0.312,"m":0.856,"n":0.572,"o":0.554,"p":0.588,"q":0.589,"r":0.391,"s":0.505,"t":0.395,"u":0.576,"v":0.496,"w":0.755,"x":0.558,"y":0.532,"z":0.477,"Á":0.697,"É":0.616,"Í":0.299,"Ó":0.727,"Ú":0.696,"á":0.558,"é":0.554,"í":0.261,"ó":0.554,"ú":0.576};
  const CAP = 0.723;
  const tw = (s, size, tab, ls = 0) => [...String(s)].reduce((a, c) => a + (tab[c] ?? 0.62) + ls, 0) * size;
  const ga = (s) => String(s).replace(/i/g, 'ı');                  // Irish sign lettering: i without its dot
  const up = (s) => String(s).toLocaleUpperCase('en-IE');
  const split2 = (s, f) => {   // two lines at a space, the longer line as short as possible
    const w = s.split(' '); let best = [s], bw = Infinity;
    for (let i = 1; i < w.length; i++) { const a = w.slice(0, i).join(' '), b = w.slice(i).join(' '), m = Math.max(f(a), f(b)); if (m < bw) { bw = m; best = [a, b]; } }
    return best;
  };
  const lines = (s, f, maxW) => (f(s) <= maxW ? [s] : split2(s, f));
  const GREEN = '#00813f', BLUE = '#0b3a9c', GREY = '#808080', RED = '#e8141b', YEL = '#ffc72c';
  // the name pair: [Irish lines (italic), English lines (capitals)] for a given letter size and width
  const pair = (name, alt, s, maxW) => {
    const fi = (x) => tw(ga(x), s, A_I), fe = (x) => tw(up(x), s, A_B, 0.02);
    const I = lines(name, fi, maxW).map((l) => ({ t: ga(l), italic: true, w: fi(l) })), E = alt ? lines(alt, fe, maxW).map((l) => ({ t: up(l), italic: false, w: fe(l) })) : [];
    return [...I, ...E];
  };
  const write = (rows, x, y0, pitch, s, fill, anchor = 'middle') => rows.map((r, i) => T(x, y0 + i * pitch, r.t, s, PS, r.italic
    ? { fill, anchor, weight: 600, style: 'italic', maxw: r.w + 1, max: s } : { fill, anchor, weight: 700, ls: 0.02, maxw: r.w + 1, max: s })).join('');

  // town name plate, white with a heavy black rim (on local roads) or green with a white rim (on national roads)
  const plate = ({ name, alt }, green) => {
    const s = 76 / CAP, rows = pair(name, alt, s, 980), lw = Math.max(...rows.map((r) => r.w)), pitch = 126;
    const W = Math.round(Math.max(640, lw + 170)), H = Math.round(Math.max(365, 120 + rows.length * pitch + 60)), y0 = H / 2 - ((rows.length - 1) * pitch) / 2 + 38;
    return svg(W, H, (green ? `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="30" fill="#fff" stroke="#bbb" stroke-width="2"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="26" fill="${GREEN}"/>`
      : `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="22" fill="#111"/><rect x="26" y="26" width="${W - 52}" height="${H - 52}" rx="40" fill="#fff"/>`) +
      write(rows, W / 2, y0, pitch, s, green ? '#fff' : '#111'));
  };
  // a sign arrow head (filled) for the motorway exit sign
  const farrow = (x1, y1, x2, y2, t, fill) => {
    const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), hl = t * 2.6, hw = t * 1.7;
    const p = (u, v) => `${(x1 + Math.cos(a) * u - Math.sin(a) * v).toFixed(1)},${(y1 + Math.sin(a) * u + Math.cos(a) * v).toFixed(1)}`;
    return `<path d="M${p(0, -t / 2)} L${p(L - hl * 0.7, -t / 2)} L${p(L - hl, -hw)} L${p(L, 0)} L${p(L - hl, hw)} L${p(L - hl * 0.7, t / 2)} L${p(0, t / 2)} Z" fill="${fill}"/>`;
  };
  // fingerpost: a plate pointing left with a chevron in its point; km, the name pair, and a route number
  const finger = ({ name, alt, km, road }, green) => {
    const s = 50 / CAP, rows = pair(name, alt, s, 760), lw = Math.max(...rows.map((r) => r.w)), ink = green ? '#fff' : '#111', bg = green ? GREEN : '#fff';
    const R = Math.max(rows.length, 2), kw = tw(String(km), s, A_B) + 20, rw = road ? tw(road, s, A_B) + 20 : 0, pitch = 64, H = 70 + R * pitch + (road && !green ? pitch - 8 : 0), tip = H * (green ? 0.28 : 0.42);
    // green (GeoHints 153): the route number right after the chevron and the names after it, as on the ENNIS plate; the
    // distance a column of its own after the names, "km" small over the figure, both right-aligned, as on the INAGH plate
    // (its right edge as far in from the plate's end as the names start from the other end); white: km after the chevron
    const t0 = green ? 0.5 * H + 14 : tip + 40, kmR = 0.17 * H;
    const x0 = green ? t0 + (road ? rw + 10 : 0) : t0 + kw, colW = Math.max(tw(String(km), s, A_B), tw('km', s * 0.6, A_B));
    const W = Math.round(Math.max(520, x0 + lw + (green ? 44 + colW + kmR : 40))), y0 = 44 + 36;
    const kx = green ? W - kmR : t0, ka = green ? 'end' : 'start';
    const out = `M2,${H / 2} L${tip},2 L${W - 2},2 L${W - 2},${H - 2} L${tip},${H - 2} Z`, inn = `M16,${H / 2} L${tip + 4},12 L${W - 12},12 L${W - 12},${H - 12} L${tip + 4},${H - 12} Z`;
    const chev = `<path d="M${tip + 26},${18} L${30},${H / 2} L${tip + 26},${H - 18}" fill="none" stroke="${ink}" stroke-width="${H * 0.1}" stroke-linejoin="miter"/>`;
    // green (GeoHints 153, measured): the white rim at the very edge follows the point; in the point a thick white chevron
    // parallel to its edges, a green strip as wide as the rim's gap between them, its ends cut level and set in by that
    // strip; the point as drawn on the white plates (TS.arrows: rim = outline moved in, chevron from the edge lines)
    const glas = () => {
      const pts = TS.arrows.pointed({ x: 1, y: 1, w: W - 2, h: H - 2, dir: 'left', tip }).pts, rim = 0.037 * H, gap = 0.05 * H, th = 0.11 * H;
      const k = tip / ((H - 2) / 2), sk = Math.hypot(1, k), mid = H / 2, ex = (d, Y) => 1 + Math.abs(Y - mid) * k + d * sk;
      const yt = 1 + rim + gap, yb = H - 1 - rim - gap, d1 = rim + gap, d2 = d1 + th;
      const c = [[ex(d1, yt), yt], [ex(d1, mid), mid], [ex(d1, yb), yb], [ex(d2, yb), yb], [ex(d2, mid), mid], [ex(d2, yt), yt]];
      return `<path d="${TS.arrows.rounded(pts, [2, 6, 6, 6, 2])}" fill="#fff" stroke="#ccc" stroke-width="1.5"/><path d="${TS.arrows.rounded(TS.arrows.offset(pts, rim), [1.5, 4, 4, 4, 1.5])}" fill="${bg}"/>` +
        `<path d="M${c.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}Z" fill="#fff"/>`;
    };
    return svg(W, H, (green ? glas() : `<path d="${out}" fill="${bg}" stroke="#111" stroke-width="5" stroke-linejoin="round"/>` + chev) +
      T(kx, y0 - 10, 'km', s * 0.6, PS, { anchor: ka, fill: ink, weight: 700 }) + T(kx, y0 + (R - 1) * pitch, String(km), s, PS, { anchor: ka, fill: ink, weight: 700 }) +
      (road && green ? T(t0, y0 + pitch * (R - 1) / 2 + 10, road, s * 1.15, PS, { anchor: 'start', fill: YEL, weight: 700 }) : '') +
      write(rows, x0, y0 + (R - rows.length) * pitch / 2, pitch, s, ink, 'start') +
      (road && !green ? T(x0 + lw / 2, y0 + R * pitch, road, s, PS, { fill: ink, weight: 700 }) : ''));
  };

  const ie = [
    // town gateway: grey panel with the green name plate, the speed limit roundel and red-and-white bars
    { id: 'geata', kind: 'entry', label: 'Town gateway sign', needs: ['alt'], draw: ({ name, alt }) => {
      const s = 34 / CAP, rows = pair(name, alt, s, 250), lw = Math.max(...rows.map((r) => r.w)), W = Math.round(Math.max(300, lw + 70)), pitch = 46, ph = 40 + rows.length * pitch;
      const H = ph + 470, cx = W / 2;
      return svg(W, H, `<rect x="0" y="0" width="${W}" height="${H}" fill="${GREY}"/>` +
        `<rect x="10" y="10" width="${W - 20}" height="${ph}" rx="8" fill="#fff"/><rect x="15" y="15" width="${W - 30}" height="${ph - 10}" rx="6" fill="${GREEN}"/>` +
        write(rows, cx, 10 + 20 + 34, pitch, s, '#fff') +
        `<circle cx="${cx}" cy="${ph + 170}" r="88" fill="#fff" stroke="${RED}" stroke-width="20"/>` + T(cx, ph + 190, '50', 74 / CAP, PS, { fill: '#111', weight: 700 }) + T(cx, ph + 228, 'km/h', 20 / CAP, PS, { fill: '#111', weight: 600 }) +
        `<rect x="10" y="${H - 150}" width="${W - 20}" height="140" fill="#fff"/>` + [0, 2, 4].map((k) => `<rect x="${10 + (k * (W - 20)) / 5}" y="${H - 150}" width="${(W - 20) / 5}" height="140" fill="${RED}"/>`).join(''));
    } },
    { id: 'ainm-ban', kind: 'entry', label: 'Town name plate (white)', needs: ['alt'], draw: (o) => plate(o, false) },
    { id: 'ainm-glas', kind: 'entry', label: 'Town name plate (green)', needs: ['alt'], draw: (o) => plate(o, true) },
    { id: 'meantan-ban', kind: 'direction', label: 'Fingerpost, regional road (white)', needs: ['alt'], defaults: { road: 'R476' }, draw: (o) => finger(o, false) },
    { id: 'meantan-glas', kind: 'direction', label: 'Fingerpost, national road (green)', needs: ['alt'], defaults: { road: 'N85' }, draw: (o) => finger(o, true) },
    // motorway exit sign: blue, the name pair, the road reached, the exit arrow and the junction number
    { id: 'mbealach', kind: 'motorway', label: 'Motorway exit sign (blue)', needs: ['alt'], defaults: { road: 'R639' }, draw: ({ name, alt, road, exit }) => {
      const s = 52 / CAP, rows = pair(name, alt, s, 700), lw = Math.max(...rows.map((r) => r.w)), pitch = 70, W = Math.round(Math.max(520, lw + 110)), H = 120 + rows.length * pitch + 200;
      const ew = tw(String(exit), 60 / CAP, A_B) + 26;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="${BLUE}" stroke="#ddd" stroke-width="3"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="7" fill="none" stroke="#fff" stroke-width="4"/>` +
        write(rows, 46, 90, pitch, s, '#fff', 'start') + T(W - 150, 60 + rows.length * pitch + 50, road, s, PS, { fill: '#fff', weight: 700 }) +
        // GeoHints 151, measured: a short broad arrow pointing down and to the left (about 41 degrees below the level), a big
        // head with swept-back barbs 4.3 shafts wide, the square-cut shaft end just behind the barbs (TS.arrows)
        TS.arrows.straight(54 + 79, H - 58 - 68, 54, H - 58, { w: 43, fill: '#fff', head: { half: 2.17, back: 1.55, neck: 1.14 } }) +
        `<rect x="${W - 40 - ew}" y="${H - 40 - 88}" width="${ew}" height="88" rx="8" fill="#111" stroke="#fff" stroke-width="4"/>` + T(W - 40 - ew / 2, H - 40 - 18, String(exit), 60 / CAP, PS, { fill: '#fff', weight: 700 }));
    } },
  ];

  TS.add('IE', ie, { km: 12, exit: 14, road: 'N85' });
})();
