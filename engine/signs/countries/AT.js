// AT: Austrian signs carrying a place name, drawn after the GeoHints pictures (see examples/AT.json). Ortstafel white
// with a blue rim, the name in DIN 1451 Mittelschrift (Alte DIN 1451 stands in); a long "… am See"-style name keeps
// the place big and puts the rest smaller below. Newer direction signs are lettered in Tern (Hind stands in), older
// ones and motorway signs in DIN; on direction signs "an der" becomes a slash with the river small ("Spittal/Drau").
(function () {
  const { T, svg } = TS;
  const DIN = "'Alte DIN 1451 Mittelschrift','D-DIN',sans-serif", TERN = "'Hind','Noto Sans',sans-serif";
  // advance widths (em) from the font files: Alte DIN 1451 Mittelschrift (cap 0.711), Hind Medium (cap 0.674)
  const A_DIN = {" ":0.24,"'":0.24,"(":0.278,")":0.278,",":0.24,"-":0.407,".":0.24,"/":0.333,"0":0.48,"1":0.337,"2":0.48,"3":0.48,"4":0.48,"5":0.48,"6":0.484,"7":0.48,"8":0.48,"9":0.494,"A":0.623,"B":0.61,"C":0.556,"D":0.63,"E":0.556,"F":0.537,"G":0.61,"H":0.648,"I":0.258,"J":0.481,"K":0.63,"L":0.556,"M":0.758,"N":0.684,"O":0.61,"P":0.593,"Q":0.61,"R":0.61,"S":0.574,"T":0.5,"U":0.63,"V":0.556,"W":0.832,"X":0.536,"Y":0.5,"Z":0.519,"a":0.48,"b":0.519,"c":0.444,"d":0.519,"e":0.498,"f":0.278,"g":0.519,"h":0.537,"i":0.24,"j":0.258,"k":0.519,"l":0.258,"m":0.852,"n":0.537,"o":0.5,"p":0.519,"q":0.519,"r":0.389,"s":0.48,"t":0.278,"u":0.537,"v":0.444,"w":0.722,"x":0.48,"y":0.444,"z":0.444,"Ä":0.611,"Ö":0.61,"Ü":0.63,"ß":0.537,"ä":0.5,"ö":0.5,"ü":0.537,"é":0.5,"č":0.444,"š":0.48,"ž":0.444,"Š":0.574,"Ž":0.519,"Č":0.556};
  const A_TERN = {" ":0.246,"'":0.171,"-":0.35,".":0.193,"/":0.421,"0":0.545,"1":0.34,"2":0.496,"3":0.471,"4":0.546,"5":0.507,"6":0.529,"7":0.459,"8":0.538,"9":0.512,"A":0.66,"B":0.581,"C":0.605,"D":0.667,"E":0.514,"F":0.494,"G":0.681,"H":0.656,"I":0.264,"J":0.368,"K":0.599,"L":0.48,"M":0.868,"N":0.68,"O":0.711,"P":0.55,"Q":0.719,"R":0.568,"S":0.521,"T":0.5,"U":0.652,"V":0.643,"W":0.947,"X":0.628,"Y":0.608,"Z":0.584,"a":0.499,"b":0.582,"c":0.471,"d":0.58,"e":0.525,"f":0.334,"g":0.559,"h":0.551,"i":0.245,"j":0.242,"k":0.5,"l":0.245,"m":0.83,"n":0.551,"o":0.564,"p":0.58,"q":0.58,"r":0.339,"s":0.419,"t":0.374,"u":0.551,"v":0.514,"w":0.796,"x":0.492,"y":0.504,"z":0.461,"Ä":0.66,"Ö":0.711,"Ü":0.652,"ß":0.558,"ä":0.499,"ö":0.564,"ü":0.551};
  const tw = (s, size, tab, ls = 0) => [...String(s)].reduce((a, c) => a + (tab[c] ?? 0.5) + ls, 0) * size;
  const split2 = (s, f) => {   // two lines at a space or after a hyphen, the longer line as short as possible
    const cuts = []; for (let i = 1; i < s.length; i++) { if (s[i] === ' ') cuts.push([s.slice(0, i), s.slice(i + 1)]); if (s[i - 1] === '-' && i > 4 && s.length - i > 3) cuts.push([s.slice(0, i), s.slice(i)]); }
    let best = [s], bw = Infinity;
    for (const c of cuts) { const m = Math.max(f(c[0]), f(c[1])); if (m < bw) { bw = m; best = c; } }
    return best;
  };
  // "Saalfelden am Steinernen Meer" -> ["Saalfelden", "am Steinernen Meer"]: the place, and the locating suffix
  const SUFFIX = /^(.+?) ((?:am|an der|an den|an der|im|in|in der|bei|ob|auf der|auf dem|unter|vor dem) .+)$/;
  const parts = (name) => { const m = name.match(SUFFIX); return m ? [m[1], m[2]] : [name, '']; };
  const BLUE = '#1070c0', GREEN = '#007a74', MBLUE = '#0b3fae', INK = '#111';

  // Ortstafel (entry) and its end with the red bar: white, blue rim; the name; a suffix, the municipality (district) or
  // the second name of a bilingual place (alt, Carinthia and Burgenland) on a line below
  const tafel = ({ name, alt, district }, exit) => {
    const s = 112 / 0.711, f = (x) => tw(x, s, A_DIN, 0.03);
    let [main, suf] = parts(name), L = [main];
    if (!suf && f(main) > 1000) L = split2(main, f);
    const lw0 = Math.max(...L.map(f)), sub = [suf, alt, district].filter(Boolean), ss = (k) => (k === alt ? s : s * 0.6);
    const lw = Math.max(lw0, ...sub.map((x) => tw(x, ss(x), A_DIN, 0.03)));
    const W = Math.round(Math.max(640, lw + 150)), pitchBig = 150, pitchSmall = 106;
    const rows = [...L.map((l) => [l, s, pitchBig]), ...sub.map((x) => [x, ss(x), x === alt ? pitchBig : pitchSmall])];
    const totalH = rows.reduce((a, r, i) => a + (i ? r[2] : 0), 0), H = Math.round(Math.max(427, 300 + totalH));
    let y = H / 2 - totalH / 2 + 40, out = '';
    rows.forEach(([t, sz, p], i) => { if (i) y += p; out += T(W / 2, y, t, sz, DIN, { fill: INK, ls: 0.03, maxw: tw(t, sz, A_DIN, 0.03) * Math.min(1, (W - 140) / lw) + 1, max: sz }); });
    return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="24" fill="${BLUE}"/><rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="4" fill="#fff"/>` +
      (exit ? `<clipPath id="at-in"><rect x="24" y="24" width="${W - 48}" height="${H - 48}"/></clipPath><g clip-path="url(#at-in)"><path d="M0,${H - 10} L${W},${10}" stroke="#e3222b" stroke-width="40"/></g>` : '') + out);
  };
  // a destination as printed on direction signs: "Spittal an der Drau" -> "Spittal" + small "/Drau"
  // on direction signs a place's locating suffix is shortened: "an der/im/in X" -> "/X" (small), "am …" is left off
  const short = (name) => name.replace(/^(.+?) am .+$/, '$1');
  const SLASH = /^(.+?) (?:an der|im|in) (.+)$/;
  const dest = (x, y, name0, s, tab, font, fill, anchor = 'start') => {
    const name = short(name0), m = name.match(SLASH);
    if (!m) return { w: tw(name, s, tab), svg: T(x, y, name, s, font, { anchor, fill, maxw: tw(name, s, tab) + 1, max: s }) };
    const a = m[1] + '/', b = m[2], wa = tw(a, s, tab), wb = tw(b, s * 0.68, tab), x0 = anchor === 'start' ? x : x - (wa + wb) / 2;
    return { w: wa + wb, svg: T(x0, y, a, s, font, { anchor: 'start', fill, maxw: wa + 1, max: s }) + T(x0 + wa, y, b, s * 0.68, font, { anchor: 'start', fill, maxw: wb + 1, max: s * 0.68 }) };
  };
  const destW = (name0, s, tab) => { const name = short(name0), m = name.match(SLASH); return m ? tw(m[1] + '/', s, tab) + tw(m[2], s * 0.68, tab) : tw(name, s, tab); };
  const farrow = (x1, y1, x2, y2, t, fill) => {   // shaft + triangular head from (x1,y1) to the tip (x2,y2)
    const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), hl = t * 2.1, hw = t * 1.5;
    const p = (u, v) => `${(x1 + Math.cos(a) * u - Math.sin(a) * v).toFixed(1)},${(y1 + Math.sin(a) * u + Math.cos(a) * v).toFixed(1)}`;
    return `<path d="M${p(0, -t / 2)} L${p(L - hl, -t / 2)} L${p(L - hl, -hw)} L${p(L, 0)} L${p(L - hl, hw)} L${p(L - hl, t / 2)} L${p(0, t / 2)} Z" fill="${fill}"/>`;
  };
  // rows of [destination, km] in a table: names left, distances right with a small "km"
  const table = (x, y0, rows, s, tab, font, fill, right, pitch) => rows.map(([n, d], i) => dest(x, y0 + i * pitch, n, s, tab, font, fill).svg +
    T(right - tw('km', s * 0.62, tab) - 6, y0 + i * pitch, String(d), s, font, { anchor: 'end', fill }) + T(right, y0 + i * pitch, 'km', s * 0.62, font, { anchor: 'end', fill })).join('');

  const at = [
    { id: 'ortstafel', kind: 'entry', label: 'Town entry (Ortstafel)', draw: (o) => tafel(o, false) },
    { id: 'ortsende', kind: 'exit', label: 'Town exit (Ortsende)', draw: (o) => tafel(o, true) },

    // white arrow-shaped direction sign with a blue rim: destinations and distances (local roads)
    { id: 'wegweiser-pfeil', kind: 'direction', label: 'Arrow direction sign (white)', draw: ({ name, next, km }) => {
      const s = 56 / 0.711, rows = [[name, km], ...(next ? [[next, Math.max(1, km - 4)]] : [])], lw = Math.max(...rows.map(([n]) => destW(n, s, A_DIN)));
      const H = 70 + rows.length * 80, tip = H * 0.45, kmw = tw('88', s, A_DIN) + tw('km', s * 0.62, A_DIN) + 10, W = Math.round(Math.max(520, tip + lw + kmw + 110));
      // a rectangular plate (direction-signs 90): thin white edge, blue border, the white field pointed at its left end
      // (45° sides, the point reaching into the border)
      const e = H * 0.021, fi = H * 0.063, tx = H * 0.057, sl = tx + H / 2 - fi;
      const field = `M${tx},${H / 2} L${sl},${fi} L${W - fi},${fi} L${W - fi},${H - fi} L${sl},${H - fi} Z`;
      return svg(W, H, TS.frames.plate(W, H, [{ r: H * 0.03, fill: '#f4f5f6' }, { i: e, r: H * 0.022, fill: BLUE }], { rim: true }) +
        `<path d="${field}" fill="#f4f5f6" stroke="#f4f5f6" stroke-width="3" stroke-linejoin="round"/>` +
        table(tip + 20, 35 + 58 + (rows.length === 1 ? 0 : 0), rows, s, A_DIN, DIN, INK, W - 36, 80));
    } },
    // white direction sign with a blue rim on a federal road: the road number in a blue box, destinations, distances, arrow
    { id: 'wegweiser-b', kind: 'direction', label: 'Direction sign with road number (white)', defaults: { road: '100' }, draw: ({ name, next, km, road }) => {
      const s = 60 / 0.674, rows = [[name, km], ...(next ? [[next, km + 37]] : [])], lw = Math.max(...rows.map(([n]) => destW(n, s, A_TERN)));
      const bw = tw(road, 62 / 0.674, A_TERN) + 18, kmw = tw('88', s, A_TERN) + tw('km', s * 0.62, A_TERN) + 10;
      const W = Math.round(Math.max(600, 30 + bw + 20 + lw + 50 + kmw + 110)), H = 70 + rows.length * 84, x0 = 30 + bw + 22;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="#f2f3f5" stroke="${BLUE}" stroke-width="7"/>` +
        `<rect x="26" y="${H / 2 - 44}" width="${bw}" height="88" fill="${BLUE}"/>` + T(26 + bw / 2, H / 2 + 22, road, 62 / 0.674, TERN, { fill: '#fff', weight: 500 }) +
        table(x0, 36 + 60, rows, s, A_TERN, TERN, '#1c1c3a', W - 120, 84) + farrow(W - 100, H / 2, W - 34, H / 2, 16, INK));
    } },
    // green direction sign: white lettering, arrow, distances
    { id: 'wegweiser-gruen', kind: 'direction', label: 'Direction sign (green)', draw: ({ name, next, km }) => {
      const s = 60 / 0.674, rows = [[name, km], ...(next ? [[next, km + 3]] : [])], lw = Math.max(...rows.map(([n]) => destW(n, s, A_TERN))), kmw = tw('88', s, A_TERN) + tw('km', s * 0.62, A_TERN) + 10;
      const W = Math.round(Math.max(600, 110 + lw + 50 + kmw + 40)), H = 70 + rows.length * 84;
      // a thin white edge round the green field, no line inside it (direction-signs 92)
      return svg(W, H, TS.frames.plate(W, H, [{ r: 8, fill: '#f4f5f6' }, { i: 7, r: 4, fill: GREEN }], { rim: true }) +
        farrow(92, H / 2, 30, H / 2, 16, '#fff') + table(110, 36 + 60, rows, s, A_TERN, TERN, '#fff', W - 36, 84));
    } },
    // motorway pre-sign: blue, the motorway numbers in white frames over the lane arrows, destinations in the middle
    { id: 'autobahn', kind: 'motorway', label: 'Motorway direction sign (blue)', defaults: { road: 'A22' }, draw: ({ name, next, road }) => {
      const s = 62 / 0.711, rows = [...(next ? [next] : []), name], lw = Math.max(...rows.map((r) => destW(r, s, A_DIN))), bw = tw(road, 52 / 0.711, A_DIN) + 20;
      const W = Math.round(Math.max(640, lw + 2 * (bw + 70))), H = 130 + rows.length * 82 + 40, box = (x) => `<rect x="${x}" y="28" width="${bw}" height="70" fill="none" stroke="#fff" stroke-width="4"/>` + T(x + bw / 2, 84, road, 52 / 0.711, DIN, { fill: '#fff' });
      // a white edge round the blue field (direction-signs 89)
      return svg(W, H, TS.frames.plate(W, H, [{ r: 10, fill: '#f4f5f6' }, { i: 9, r: 5, fill: MBLUE }], { rim: true }) +
        box(30) + box(W - 30 - bw) + rows.map((r, i) => dest(W / 2, 168 + i * 82, r, s, A_DIN, DIN, '#fff', 'middle').svg).join('') +
        farrow(30 + bw / 2, H - 30, 30 + bw / 2, 128, 22, '#e8ecf4') + farrow(W - 30 - bw / 2, H - 30, W - 30 - bw / 2, 128, 22, '#e8ecf4'));
    } },
    // (group H) green locality sign (Commons: Berndorf / Gem. St.Georgen o.J.; Gaberl / Seehöhe 1551 m, both Styria): a
    // place name without the Ortsgebiet of the white Ortstafel; green, a thin white edge, the name big, the municipality
    // (district) smaller below when given
    { id: 'ortshinweis', kind: 'hamlet', label: 'Locality sign (green)', draw: ({ name, district }) => {
      // a locating suffix ("am Steinernen Meer") goes smaller below, as on the Ortstafel; then the municipality
      const s = 112 / 0.711, f = (x, k = 1) => tw(x, s * k, A_DIN, 0.02), [main, suf] = parts(name), subs = [suf, district].filter(Boolean);
      let L = [main]; if (f(main) > 1000) L = split2(main, (x) => f(x));
      const lw = Math.max(...L.map((l) => f(l)), ...subs.map((x) => f(x, 0.55))), W = Math.round(Math.max(560, lw + 130)), H = Math.round(214 + (L.length - 1) * 150 + subs.length * 92);
      const y = 172, out = L.map((l, i) => T(W / 2, y + i * 150, l, s, DIN, { fill: '#fff', ls: 0.02, maxw: Math.min(f(l), W - 120) + 1, max: s })).join('') +
        subs.map((x, i) => T(W / 2, y + (L.length - 1) * 150 + 96 + i * 88, x, s * 0.55, DIN, { fill: '#fff', ls: 0.02, maxw: Math.min(f(x, 0.55), W - 110) + 1, max: s * 0.55 })).join('');
      return svg(W, H, TS.frames.plate(W, H, [{ r: 16, fill: '#f4f5f6' }, { i: 9, r: 9, fill: '#0b7f62' }], { rim: true }) + out);
    } },
    // group I: bike route sign, after Commons photos from Lower Austria (Felixdorf, Piestingtal 43: Gutenstein 40 km /
    // Felixdorf 500 m) and Carinthia (Jauntalweg R1D): green plate inside a thin white rim; above a white bar the route
    // number in a yellow box and a white bicycle; below, one row per destination with its arrow, name and distance
    { id: 'radweg', kind: 'bike', label: 'Bike route sign (green)', defaults: { route: '43' }, draw: ({ name, next, km, route, routeName }) => {
      // copied element by element from the Felixdorf photo (Piestingtal 43), measured on a 300-wide plate: green plate
      // edged in white; the route's name centred on top; below it the yellow route box at the left and a thin white
      // bicycle at the right; a white bar across the plate; then one row per destination: arrow (thin shaft, open head)
      // at the left, name, distance right-aligned with a small "km"; a long name wraps, the distance stays on its first line
      const GN = '#0c6e4c', EN = "'DINish Condensed','DINish',sans-serif", z = 22 / 0.69, kz = z * 0.74, tz = 34 / 0.711;
      const fmt = (v) => (v >= 10 ? String(Math.round(v)) : String(Math.round(v * 10) / 10).replace('.', ','));
      const far = Math.max(1, km), near = Math.max(0.5, Math.round(far * 0.3 * 10) / 10);
      const W = 300, nx = 65, numR = 250, tw0 = (s) => [...String(s)].length * 0.42 * z;
      const dest = ([n, d]) => {
        const avail = numR - tw0(d) - 12 - nx;
        return { d, avail, L: tw0(n) <= avail ? [n] : split2(String(n), tw0) };
      };
      const groups = [[name, fmt(far)], ...(next ? [[next, fmt(near)]] : [])].map(dest);
      const dy = routeName ? 0 : -68;   // the route's name on top only when passed (no default: it would name a real route)
      let y = 247 + dy, body = '';
      groups.forEach(({ d, avail, L }, gi) => {
        if (gi) y += 50;
        body += TS.arrows.dir(31, y - 11, 270, 38, { w: 4, fill: '#fff', head: { open: true, half: 2.7, back: 2.7, sw: 1 } });
        L.forEach((l, j) => { body += T(nx, y + j * 38, l, z, EN, { anchor: 'start', fill: '#fff', weight: 500, maxw: Math.round(j ? numR - nx : avail), max: z }); });
        body += T(numR, y, d, z, EN, { anchor: 'end', fill: '#fff', weight: 500 }) + T(282, y, 'km', kz, EN, { anchor: 'end', fill: '#fff', weight: 500 });
        y += (L.length - 1) * 38;
      });
      const H = Math.round(y + 33), rt = String(route), rw = Math.max(76, 30 + rt.length * 26);
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="12" fill="#fff" stroke="#c9c9c9" stroke-width="1.5"/>` +
        `<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="9" fill="${GN}"/>` +
        (routeName ? T(W / 2, 78, routeName, tz, DIN, { fill: '#fff', maxw: W - 54, max: tz }) : '') +
        `<rect x="27" y="${100 + dy}" width="${rw}" height="75" rx="7" fill="#f7c600" stroke="#1d1d1b" stroke-width="2"/>` +
        T(27 + rw / 2, 156 + dy, rt, 36 / 0.711, DIN, { fill: '#1d1d1b', maxw: rw - 14, max: 36 / 0.711 }) +
        TS.bike(205, 138 + dy, 138, '#fff', { style: 'line', sw: 0.026 }) +
        `<path d="M4,${186 + dy} H${W - 4}" stroke="#fff" stroke-width="3.5"/>` + body);
    } },
    // group I: Upper Austria's bike route sign, after the Commons photo from Saag (Edt bei Lambach: R4 Traunweg, Gmunden
    // 38 km / Lambach 7 km): white plate with a green cyclist above, the route as a green panel whose top row holds the
    // arrow and the route number in a white box, the destinations below in white
    { id: 'radweg-ooe', kind: 'bike', label: 'Bike route sign (Upper Austria)', regions: ['Oberösterreich'], defaults: { route: 'R4', route2: 'R6' }, draw: ({ name, next, km, route, route2 }) => {
      // an upright white plate: the green rider (wheels as rings) on top, then one green panel per route: arrow, route
      // number in a white-edged box (green inside), the destination and distance below (no line between); as the photo carries two
      // routes, the asked place goes on the first and the next town on a second one; a long name takes two lines
      const GN = '#16924a', z = 20 / 0.674, kz = z * 0.66, far = Math.max(1, Math.round(km)), near = Math.max(1, Math.round(far * 0.25));
      const W = 300, top = 150, gap = 10, kmw = tw('km', kz, A_TERN), f = (s) => tw(s, z, A_TERN);
      const panels = [[route, name, far], ...(next ? [[route2, next, near]] : [])].map(([r, n, d]) => {
        const avail = W - 56 - f(String(d)) - 6 - kmw - 14, L = f(n) <= avail ? [n] : split2(String(n), f);
        return { r, d, L, avail, ph: 118 + (L.length - 1) * 34 };
      });
      const H = top + panels.reduce((a, p) => a + p.ph + gap, 0) + 8;
      let y = top;
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="#fff" stroke="#bdbdbd" stroke-width="2"/>` +
        TS.bike(W / 2, 100, 118, GN, { style: 'line', sw: 0.048, rider: true }) +
        panels.map(({ r, d, L, avail, ph }) => {
          const rw = f(String(r)) + 18, y0 = y; y += ph + gap;
          return `<rect x="12" y="${y0}" width="${W - 24}" height="${ph}" rx="6" fill="${GN}"/>` +
            TS.arrows.dir(48, y0 + 30, 270, 44, { w: 9, fill: '#fff', head: { half: 1.75, back: 2.1, cut: 0, neck: 2.1 } }) +
            `<rect x="86" y="${y0 + 11}" width="${rw}" height="38" fill="none" stroke="#fff" stroke-width="3"/>` + T(86 + rw / 2, y0 + 41, String(r), z, TERN, { fill: '#fff', weight: 500 }) +
            L.map((l, j) => T(28, y0 + 98 + j * 34, l, z, TERN, { anchor: 'start', fill: '#fff', weight: 500, maxw: Math.round(avail), max: z })).join('') +
            T(W - 28 - kmw - 6, y0 + 98 + (L.length - 1) * 34, String(d), z, TERN, { anchor: 'end', fill: '#fff', weight: 500 }) +
            T(W - 28, y0 + 98 + (L.length - 1) * 34, 'km', kz, TERN, { anchor: 'end', fill: '#fff', weight: 500 });
        }).join(''));
    } },
  ];

  TS.add('AT', at, { next: 'Pyhra', km: 6, road: '100' });
})();
