// EE: Estonian signs carrying a place name, drawn after the GeoHints pictures (see examples/EE.json).
// Place names in capitals, DIN-like lettering (narrow on direction signs); DINish stands in.
(function () {
  const { T, svg } = TS;
  const F = "'DINish','Noto Sans',sans-serif", FC = "'DINish Condensed','DINish','Noto Sans',sans-serif";
  // advance widths (em) of DINish Bold / Medium and DINish Condensed SemiBold, to size a sign before the font is measured
  const CH = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-./'():ÆØÅæøåÐðÞþßŊŋĐđŦŧ";
  const tab = (s) => Object.fromEntries([...CH].map((c, i) => [c, +s.substr(i * 3, 3) / 1000]));
  const WB = tab('217605598600600556556600608248330609516753634600566600600548516613554832593540505501515505514517334514520240240520286808520510515514357474352520480735459481454512348492504521496516456524516393215404192310310215883600605795510501669509566515523634520669514495352'), WM = tab('217586608606613550551606622248318602524753652606573606599547503628533808574512512498512504512508315512521229227502277818521507512512344466344521452721434453455499335476497506487501439516501393200396179295295200871606586797507498669500573512511652521669512486344'), WC = tab('175477460471468405405471466210265460374579483471436471462426383467439667414406367403410407410409286410411203201415237629411409410410300389300411396598369396381406286395400423402397374407397358170297164268268170682471477624409403490400436410417483411490410368300');
  const tw = (s, W, ls = 0) => [...String(s)].reduce((a, c) => a + (W[c] ?? W[c.normalize('NFD')[0]] ?? 0.6) + ls, 0);
  const split2 = (s) => {
    const cut = [...s].map((c, i) => (c === ' ' || c === '-' ? i : -1)).filter((i) => i > 0);
    if (!cut.length) return null;
    const i = cut.reduce((b, x) => (Math.abs(x - s.length / 2) < Math.abs(b - s.length / 2) ? x : b));
    return s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : [s.slice(0, i), s.slice(i + 1)];
  };
  const up = (s) => String(s).toLocaleUpperCase('et');
  const BLUE = '#1d4f9c', DBLUE = '#0b2f7a', RED = '#b5162b', GREEN = '#1f7a4c', INK = '#111';
  const txt = (x, y, s, max, maxw, W, font, o = {}) => T(x, y, s, Math.min(max, maxw / tw(s, W, o.ls || 0)), font, { maxw, max, ...o });

  // built-up area (white plate, double black frame, skyline); the name above in bold capitals; the end with a red bar
  const SKY = 'M30,560V440L100,412L160,440V490H172V440L180,440L220,228L255,430V490H268V470L285,432H318V425H378V432H395L408,470V490H418V440L455,412L495,440V490H505V420L565,400L605,420V560Z';
  const asula = ({ name }, end) => {
    const n = up(name), S = 87, pad = 50;
    let L = [n];
    if (tw(n, WB) * S + 2 * pad > 960 && split2(n)) L = split2(n);
    const w = Math.max(640, Math.min(960, Math.max(...L.map((l) => tw(l, WB) * S)) + 2 * pad)), dy = (L.length - 1) * 80, H = 602 + dy;
    const bar = end ? `<clipPath id="ee-end"><rect x="20" y="20" width="${w - 40}" height="${H - 40}" rx="12"/></clipPath><line x1="0" y1="${H}" x2="${w}" y2="0" stroke="#ee2e3a" stroke-width="30" clip-path="url(#ee-end)"/>` : '';
    return svg(w, H, `<rect width="${w}" height="${H}" rx="26" fill="#000"/><rect x="4" y="4" width="${w - 8}" height="${H - 8}" rx="23" fill="#fff"/><rect x="9" y="9" width="${w - 18}" height="${H - 18}" rx="19" fill="#000"/><rect x="20" y="20" width="${w - 40}" height="${H - 40}" rx="12" fill="#fff"/>` +
      L.map((l, i) => txt(w / 2, 135 + i * 80, l, S, w - 2 * pad, WB, F, { weight: 700, fill: '#000' })).join('') +
      `<path d="${SKY}" transform="translate(${(w - 640) / 2},${dy})" fill="#000"/>` + bar);
  };

  // village name (blue plate, white rim, white capitals): its length follows the name
  const kyla = ({ name }) => {
    const n = up(name), S = 140, pad = 80;
    let L = [n];
    if (tw(n, WM, 0.06) * S + 2 * pad > 1500 && split2(n)) L = split2(n);
    const w = Math.max(420, Math.min(1500, Math.max(...L.map((l) => tw(l, WM, 0.06) * S)) + 2 * pad)), H = 230 + (L.length - 1) * 120;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="22" fill="#fff" stroke="#bbb" stroke-width="2"/><rect x="12" y="12" width="${w - 24}" height="${H - 24}" rx="12" fill="${DBLUE}"/>` +
      L.map((l, i) => txt(w / 2 + 0.03 * S, 163 + i * 120, l, S, w - 2 * pad, WM, F, { weight: 500, fill: '#fff', ls: 0.06 })).join(''));
  };

  // direction board (blue): an arrow to the left, the name and its distance in white capitals
  const suunaviit = ({ name, km }) => {
    const n = up(name), k = String(km), S = 68, nw = tw(n, WC) * S, kw = tw(k, WC) * S;
    const w = Math.max(560, Math.min(1400, 150 + nw + 70 + kw + 40)), H = 98;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="8" fill="#e8e8e8"/><rect x="4" y="4" width="${w - 8}" height="${H - 8}" rx="6" fill="${BLUE}"/>` +
      `<path d="M18,49L58,22V40H112V58H58V76Z" fill="#e8e8e8"/>` +
      txt(132, 73, n, S, w - 132 - kw - 80, WC, FC, { weight: 600, fill: '#eee', anchor: 'start' }) + txt(w - 40, 73, k, S, kw + 4, WC, FC, { weight: 600, fill: '#eee', anchor: 'end' }));
  };

  // a route number: white on red (national roads) or green (E-roads), with a white edge
  const rbox = (x, y, w, h, r, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${c}" stroke="#e8e8e8" stroke-width="3"/>` +
    T(x + w / 2, y + h * 0.8, r, Math.min(h * 0.8, (w - 14) / tw(r, WC)), FC, { weight: 600, fill: '#eee', maxw: w - 14, max: h * 0.8 });

  // an arrowhead (filled triangle) at x, y pointing at angle a (degrees, 0 = up, clockwise)
  const head = (x, y, a, c) => `<path d="M0,-30L26,8H-26Z" transform="translate(${x},${y}) rotate(${a})" fill="${c}"/>`;
  // the fork of the advance sign: a stem from below splitting into a straight branch up-left and a curved one up-right
  // (GeoHints 122: the stem bends smoothly into the right branch; the left one leaves it straight at the fork; both
  // branches are joined to the stem and end in swept heads, TS.arrows)
  const fork = (sx) => TS.arrows.group([
    { pts: [[sx, 356], [sx, 257, 100], [sx + 129, 79]] },
    { pts: [[sx, 300], [sx + 4, 232], [sx - 80, 124]] },
  ], { w: 18, fill: '#e8e8e8', head: { half: 1.4, back: 2.4, neck: 1.8 } });

  // advance sign (blue): a fork, the next town to the left, the name to the right with its route number, 400 m
  const eelviit = ({ name, next, road }) => {
    const S = 50, A = [up(name)], B = [up(next)], r = String(road);
    const bw = Math.max(80, tw(B[0], WC) * S), aw = Math.max(180, tw(A[0], WC) * S);
    const w = Math.max(470, 20 + bw + 250 + aw + 20), fx = 20 + Math.max(bw, 160) + 30;
    const rw = Math.max(55, tw(r, WC) * 46 + 20);
    return svg(w, 370, `<rect width="${w}" height="370" rx="12" fill="#e8e8e8"/><rect x="5" y="5" width="${w - 10}" height="360" rx="9" fill="${BLUE}"/>` +
      txt(20, 64, B[0], S, Math.max(bw, 160), WC, FC, { weight: 600, fill: '#eee', anchor: 'start' }) + rbox(32, 155, 57, 40, '5', RED) +
      txt(w - 20, 64, A[0], S, aw, WC, FC, { weight: 600, fill: '#eee', anchor: 'end' }) + rbox(w - 30 - rw, 155, rw, 40, r, RED) +
      fork(fx + 80) + txt(fx + 112, 352, '400m', 40, 120, WC, FC, { weight: 600, fill: '#eee', anchor: 'start' }));
  };

  // urban direction sign (white, overhead): the district name in black, a blue panel with the route number and the
  // main destination, left-turn arrows at both ends
  // the green E-road box after the red one (E67 on road 4 in the picture): eroad, else the E-road that runs on that main
  // road (1 Tallinn-Narva E20, 2 Tallinn-Tartu-Luhamaa E263, 3 Jõhvi-Tartu-Valga E264, 4 Tallinn-Pärnu-Ikla E67)
  const EROAD = { 1: 'E20', 2: 'E263', 3: 'E264', 4: 'E67' };
  const linnaviit = ({ name, next, road, eroad }) => {
    const S = 46, L = [up(name)], r = String(road), nx = up(next), e = eroad || EROAD[r] || '';
    const ew = e ? Math.round(tw(e, WC) * 40 + 20) : 0, ex = e ? ew + 6 : 0;
    const pw = 70 + ex + tw(nx, WC) * 42 + 30, tw0 = tw(L[0], WC) * S;
    const w = Math.max(615, 130 + Math.max(tw0, pw) + 130), H = 245;
    const turn = (x) => `<g transform="translate(${x},0)" fill="${INK}"><path d="M0,95L38,65V83H52Q78,83 78,112V160H62V114Q62,99 50,99H38V117Z"/></g>`;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="10" fill="#3a3a3a"/><rect x="4" y="4" width="${w - 8}" height="${H - 8}" rx="7" fill="#eceae6"/>` +
      turn(22) + turn(w - 105) + txt(115, 70, L[0], S, w - 245, WC, FC, { weight: 600, fill: INK, anchor: 'start' }) +
      `<rect x="115" y="150" width="${pw}" height="65" rx="4" fill="${BLUE}"/>` + `<rect x="121" y="156" width="54" height="53" rx="5" fill="${RED}" stroke="#eee" stroke-width="2" stroke-dasharray="6 4"/>` +
      T(148, 199, r, Math.min(44, 40 / tw(r, WC)), FC, { weight: 600, fill: '#eee', maxw: 40, max: 44 }) +
      (e ? `<rect x="181" y="156" width="${ew}" height="53" rx="5" fill="${GREEN}" stroke="#eee" stroke-width="2" stroke-dasharray="6 4"/>` +
        T(181 + ew / 2, 199, e, 40, FC, { weight: 600, fill: '#eee', maxw: ew - 14, max: 40 }) : '') +
      txt(185 + ex, 200, nx, 42, pw - 85 - ex, WC, FC, { weight: 600, fill: '#eee', anchor: 'start' }));
  };

  TS.add('EE', [
    { id: 'asula', kind: 'entry', label: 'Built-up area with name', draw: (o) => asula(o, false) },
    { id: 'asula-lopp', kind: 'exit', label: 'End of built-up area', draw: (o) => asula(o, true) },
    { id: 'kyla', kind: 'hamlet', label: 'Village name (blue)', draw: kyla },
    { id: 'suunaviit', kind: 'direction', label: 'Direction board (blue)', draw: suunaviit },
    { id: 'eelviit', kind: 'direction', label: 'Advance sign with fork (blue)', draw: eelviit },
    { id: 'linnaviit', kind: 'direction', label: 'Urban overhead sign (white)', draw: linnaviit },
    // group I: national cycle route sign, after the Commons photo "Viit Lossi" (Kuressaare: Leisi 137 / Kihelkonna 51):
    // a square blue plate with the white bicycle over the route number in a red box, beside a blue arrow plate with a
    // white rim carrying the destinations (mixed case) and distances
    { id: 'jalgratas', kind: 'bike', label: 'Cycle route sign (white, blue fields)', defaults: { route: '1' }, draw: ({ name, next, km, route }) => {
      // one white rectangular plate: a blue route square (bicycle over the route number in a red box) and, for each
      // destination, its own blue arrow-shaped field with the name and distance in white
      const H = 200, m = 10, BL = '#1f5fb0', z = 30 / 0.69, fq = 196, ph = 86, tip = 36;
      const far = Math.max(1, Math.round(km)), near = Math.max(1, Math.round(far * 0.37));
      const rows = [[name, far], ...(next ? [[next, near]] : [])];
      const nw = Math.min(900, Math.max(...rows.map(([n]) => tw(n, WB, 0.04) * z))), dw = 3 * 0.56 * z;
      const x0 = m + fq + 8, W = Math.round(x0 + 22 + nw + 30 + dw + 12 + tip + m), pw = W - m - x0;
      const ys = rows.length > 1 ? [m, m + ph + 8] : [(H - ph) / 2];
      return svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="6" fill="#fff" stroke="#bdbdbd" stroke-width="2"/>` +
        `<rect x="${m}" y="${m}" width="${fq}" height="${H - 2 * m}" rx="9" fill="${BL}"/>` +
        TS.bike(m + fq / 2, 66, 124, '#fff') + `<rect x="${m + fq / 2 - 28}" y="112" width="56" height="54" rx="4" fill="${RED}" stroke="#fff" stroke-width="3"/>` +
        T(m + fq / 2, 156, String(route), 38 / 0.69, F, { fill: '#fff', weight: 'bold', maxw: 44, max: 38 / 0.69 }) +
        rows.map(([n, d], i) => `<path d="${TS.arrows.rounded(TS.arrows.pointed({ x: x0, y: ys[i], w: pw, h: ph, dir: 'right', tip }).pts, [7, 3, 2, 3, 7])}" fill="${BL}"/>` +
          T(x0 + 22, ys[i] + ph / 2 + z * 0.69 / 2, n, z, F, { anchor: 'start', fill: '#fff', weight: 'bold', ls: 0.04, maxw: Math.round(nw), max: z }) +
          T(x0 + pw - tip - 10, ys[i] + ph / 2 + z * 0.69 / 2, String(d), z, F, { anchor: 'end', fill: '#fff', weight: 'bold' })).join(''));
    } },
  ], { next: 'Pärnu', road: '4', km: 67 });
})();
