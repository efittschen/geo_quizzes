// SE: Swedish signs carrying a place name, drawn after the GeoHints pictures (see examples/SE.json).
// Place names stand in capitals (Tratex Versal on the real signs; Red Hat Display stands in), widely spaced.
// Signs whose size follows the text (place-name sign, arrow signs, advance sign) grow with the name, as real ones do.
(function () {
  const { T, svg, esc } = TS;
  const F = "'Red Hat Display','Noto Sans',sans-serif";
  // advance widths (em) of Red Hat Display Bold, to size a sign to its text before the real font is measured
  const CH = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-./'():ÆØÅæøåÐðÞþßŊŋĐđŦŧ";
  const mkW = (s) => Object.fromEntries([...CH].map((c, i) => [c, +s.substr(i * 3, 3) / 1000]));
  const W = mkW('201732691718738645639794739272642697628882749813681813679632652725732944700706617555632532632586431628593244244568244906593616632632408491424593580772555577500685349600600673600600600600636458250512251412412250982813732926616555770597679634685749593770630652424');
  const tw = (s, ls = 0) => [...String(s)].reduce((a, c) => a + (W[c] ?? W[c.normalize('NFD')[0]] ?? 0.65) + ls, 0);
  // split a long name in two at the space or hyphen nearest its middle (a hyphen stays on the first line)
  const split2 = (s) => {
    const cut = [...s].map((c, i) => (c === ' ' || c === '-' ? i : -1)).filter((i) => i > 0);
    if (!cut.length) return null;
    const i = cut.reduce((b, x) => (Math.abs(x - s.length / 2) < Math.abs(b - s.length / 2) ? x : b));
    return s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : [s.slice(0, i), s.slice(i + 1)];
  };
  const up = (s) => String(s).toLocaleUpperCase('sv');
  // a centred, letter-spaced line: the trailing letter space is taken back so the text sits truly centred
  const C = (x, y, s, size, o) => T(x + (o.ls || 0) * size / 2, y, s, size, F, { weight: 700, ...o });
  const L = (x, y, s, size, o) => T(x, y, s, size, F, { weight: 700, anchor: 'start', ...o });
  const BLUE = '#0c479d', GREEN = '#35b33e', RED = '#ce252c';

  // E5 / E6: white plate, black frame, black skyline (church, houses, block); the name in the white band above.
  // Geometry of the 1000-wide plain sign; the band for the name pushes the skyline down by B.
  const sky = (B) => `M966.7,${322 + B}V45A11.7,11.7 0 0 0 955,33.3H45A11.7,11.7 0 0 0 33.3,45V${322 + B}H56V${292 + B}L150,${236 + B}L244,${292 + B}V${373.3 + B}H260V${330 + B}L330,${62 + B}L400,${330 + B}V${373.3 + B}H416V${305 + B}L446,${277 + B}H496V${254 + B}H546V${277 + B}H596L626,${305 + B}V${332 + B}H642V${275 + B}L724,${236 + B}L806,${275 + B}V${342 + B}H822V${189 + B}L883,${167 + B}L944,${189 + B}V${322 + B}Z`;
  const tatort = (name, exit) => {
    const n = up(name), ls = 0.02, one = tw(n, ls) * 94 <= 900 * 1.3, two = !one && split2(n);
    const B = two ? 215 : 125, H = 500 + B;
    const txt = two
      ? C(500, 150, two[0], Math.min(84, 900 / tw(two[0], ls)), { ls, maxw: 900, max: 84 }) + C(500, 245, two[1], Math.min(84, 900 / tw(two[1], ls)), { ls, maxw: 900, max: 84 })
      : C(500, 153, n, Math.min(94, 900 / tw(n, ls)), { ls, maxw: 900, max: 94 });
    const bar = exit ? `<clipPath id="se-e6"><rect x="16.7" y="16.7" width="966.7" height="${H - 33.3}" rx="28.3"/></clipPath><line x1="0" y1="${H - 12}" x2="1000" y2="12" stroke="${RED}" stroke-width="38" clip-path="url(#se-e6)"/>` : '';
    return svg(1000, H, `<rect x="1" y="1" width="998" height="${H - 2}" rx="45" fill="#fff" stroke="#bbb" stroke-width="2"/><rect x="16.7" y="16.7" width="966.7" height="${H - 33.3}" rx="28.3" fill="#000"/>` +
      `<path d="${sky(B)}" fill="#fff"/>` + txt + bar);
  };

  // F10 place-name sign: blue, white rim, the name in white capitals; its length follows the name
  const f10 = ({ name, alt }) => {
    const ls = 0.15, S = 180, pad = 100;
    let lines = [up(name)];
    if (tw(lines[0], ls) * S + 2 * pad > 8 * 340 && split2(lines[0])) lines = split2(lines[0]);
    if (alt) lines.push(up(alt));
    const w = Math.max(560, Math.min(8 * 340, Math.max(...lines.map((l) => tw(l, ls) * S)) + 2 * pad));
    const H = 340 + (lines.length - 1) * 180;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="30" fill="${BLUE}"/><rect x="13.5" y="13.5" width="${w - 27}" height="${H - 27}" rx="20" fill="none" stroke="#fff" stroke-width="17"/>` +
      lines.map((l, i) => C(w / 2, 250 + i * 180, l, Math.min(S, (w - 2 * pad) / tw(l, ls)), { fill: '#fff', ls, maxw: w - 2 * pad, max: S })).join(''));
  };

  // F5 arrow sign (pointing right): a rectangular plate with an arrow-shaped frame inside, as on the pictures;
  // green on motorways, white with a black frame for local destinations
  // A name too long for one line (sign longer than 8 times its height) goes on two lines of a taller sign.
  const f5 = ({ name }, green) => {
    const n = up(name), ls = 0.05, pad = 80, gap = 40;
    const H1 = green ? 294 : 230, S1 = green ? 151 : 157, tip = green ? 184 : 190;
    let lines = [n];
    if (pad + tw(n, ls) * S1 + gap + tip > 8 * H1 && split2(n)) lines = split2(n);
    const two = lines.length > 1, S = two ? S1 * 0.9 : S1, cap = 0.7 * S, mg = two ? (green ? 70 : 48) : (H1 - cap) / 2;
    const H = two ? 2 * mg + 2.45 * cap : H1;
    const w = Math.max(green ? 900 : 760, Math.min(9 * H1, pad + Math.max(...lines.map((l) => tw(l, ls))) * S + gap + tip));
    const body = w - tip * H / H1, m = H / 2;
    // arrow-shaped outline inset by i, its point pulled back by k more: the frame thickens into a wedge at the point
    const P = (i, k = 0) => { const r = Math.max(3, 14 - i); return `M${i + r},${i}H${body - i * 0.45}L${w - i * 1.6 - k},${m}L${body - i * 0.45},${H - i}H${i + r}Q${i},${H - i} ${i},${H - i - r}V${i + r}Q${i},${i} ${i + r},${i}Z`; };
    const maxw = body - pad - gap + (green ? 20 : 30);
    const txt = lines.map((l, i) => L(pad, mg + cap + i * 1.45 * cap, l, Math.min(S, maxw / tw(l, ls)), { fill: green ? '#fff' : '#000', ls, weight: 700, maxw, max: S })).join('');
    return green
      ? svg(w, H, `<rect width="${w}" height="${H}" rx="14" fill="${GREEN}"/><path d="${P(5)}" fill="#fff"/><path d="${P(15, 34)}" fill="${GREEN}"/>` + txt)
      : svg(w, H, `<rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="14" fill="#fff" stroke="#bbb" stroke-width="2"/><path d="${P(4)}" fill="#000"/><path d="${P(22, 40)}" fill="#fff"/>` + txt);
  };

  // F1 advance sign (blue): road number box and the straight-on destination on top, an arrow turning right to the next.
  // The plate grows with the names up to 900 wide; a longer name goes on two lines and the plate grows downwards.
  const f1 = ({ name, next, road }) => {
    const x2 = up(next), r = String(road), ls = 0.19, S = 50, rls = 0.12, MAXW = 900;
    const bw = Math.max(92, tw(r, rls) * 52 + 34), x1 = 33 + bw + 23;
    const fit2 = (s, x) => (x + tw(s, ls) * S + 26 > MAXW && split2(s)) || [s];
    const top = fit2(up(name), x1), low = fit2(x2, 190);
    const w = Math.min(MAXW, Math.max(640, ...top.map((l) => x1 + tw(l, ls) * S + 26), ...low.map((l) => 190 + tw(l, ls) * S + 26)));
    const dy = (top.length - 1) * 58, e = (low.length - 1) * 58, H = 303 + dy + e;
    const arrow = `<path d="M58,${272 + dy + e}V${160 + dy}H33L65,${127 + dy}L97,${160 + dy}H72V${226 + dy}H128V${203 + dy}L163,${233 + dy}L128,${263 + dy}V${240 + dy}H72V${272 + dy + e}Z" fill="#fff"/>`;
    const line = (l, x, y) => L(x, y, l, Math.min(S, (w - x - 26) / tw(l, ls)), { fill: '#fff', ls, maxw: w - x - 26, max: S });
    return svg(w, H, `<rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="10" fill="${BLUE}" stroke="#fff" stroke-width="4"/>` +
      `<rect x="33" y="22" width="${bw}" height="81" rx="11" fill="none" stroke="#fff" stroke-width="5"/>` +
      C(33 + bw / 2, 82, r, Math.min(52, (bw - 24) / tw(r, rls)), { fill: '#fff', ls: rls, maxw: bw - 24, max: 52 }) +
      top.map((l, i) => line(l, x1, 81 + i * 58)).join('') + arrow + low.map((l, i) => line(l, 190, 250 + dy + i * 58)).join(''));
  };

  // a bicycle pictogram (line drawing, 60 x 34 at scale 1) at x, y
  const bikeIcon = (x, y, k, c) => `<g transform="translate(${x},${y}) scale(${k})" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="23" r="10"/><circle cx="49" cy="23" r="10"/><path d="M11,23L22,7H42L49,23M22,7L30,23H11M30,23L42,7M17,2H27M42,7L39,1H46"/></g>`;

  // cycle direction sign (after a Commons photo from Malmö): blue plate, white rim, the bicycle box at the top centred over
  // the names (as on both boards of the photo), an arrow to the left, two destinations in mixed case
  const cykel = ({ name, next }) => {
    const S = 58, ls = 0.02, A = String(name), B = String(next);
    const w = Math.max(520, Math.min(1300, 140 + Math.max(tw(A, ls), tw(B, ls)) * S + 40)), H = 250;
    const bx = 140 + Math.min(w - 180, Math.max(tw(A, ls), tw(B, ls)) * S) / 2;   // the middle of the names
    return svg(w, H, `<rect width="${w}" height="${H}" rx="10" fill="#fff" stroke="#bbb" stroke-width="2"/><rect x="6" y="6" width="${w - 12}" height="${H - 12}" rx="7" fill="${BLUE}"/>` +
      `<rect x="${bx - 42}" y="20" width="84" height="54" rx="7" fill="#3a6cc0" stroke="#fff" stroke-width="3"/>` + bikeIcon(bx - 30, 30, 1, '#fff') +
      `<path d="M28,150L70,118V138H116V162H70V182Z" fill="#fff"/>` +
      L(140, 152, A, Math.min(S, (w - 180) / tw(A, ls)), { fill: '#fff', ls, weight: 600, maxw: w - 180, max: S }) +
      L(140, 222, B, Math.min(S, (w - 180) / tw(B, ls)), { fill: '#fff', ls, weight: 600, maxw: w - 180, max: S }));
  };

  TS.add('SE', [
    { id: 'e5', kind: 'entry', label: 'Built-up area (E5)', draw: ({ name }) => tatort(name, false) },
    { id: 'e6', kind: 'exit', label: 'End of built-up area (E6)', draw: ({ name }) => tatort(name, true) },
    { id: 'f10', kind: 'hamlet', label: 'Place name (F10)', draw: f10 },
    { id: 'f1', kind: 'direction', label: 'Advance direction sign (F1)', draw: f1 },
    { id: 'f5-motorway', kind: 'motorway', label: 'Motorway arrow sign (F5, green)', draw: (o) => f5(o, true) },
    { id: 'f5-local', kind: 'direction', label: 'Local arrow sign (F5, white)', draw: (o) => f5(o, false) },
    { id: 'cykel', kind: 'bike', label: 'Cycle direction sign', draw: cykel },
  ], { next: 'Lindesberg', road: '60' });
})();
