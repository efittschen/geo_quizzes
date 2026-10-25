// DK: Danish signs carrying a place name, drawn after the GeoHints pictures (see examples/DK.json).
// Lettering: Dansk Vejtavleskrift on the real signs (derived from Transport); Public Sans stands in. Names in mixed case,
// widely spaced. Arrow signs are rectangular plates with an arrow-shaped field inside, as on the pictures.
(function () {
  const { T, svg } = TS;
  const F = "'Public Sans','Noto Sans',sans-serif";
  // advance widths (em) of Public Sans SemiBold, to size a sign to its text before the real font is measured
  const CH = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-./'():ÆØÅæøåÐðÞþßŊŋĐđŦŧ";
  const W = Object.fromEntries([...CH].map((c, i) => [c, +'234719678705708629605747768297396701578903770749645762687682606714690962704640655560603546603572397626585258277572317882586571602602403518404589513785577551489630419618649644659643615661643386250368255320324250999765719914600560730571667598610770594730629606404'.substr(i * 3, 3) / 1000]));
  const tw = (s, ls = 0) => [...String(s)].reduce((a, c) => a + (W[c] ?? W[c.normalize('NFD')[0]] ?? 0.62) + ls, 0);
  const split2 = (s) => {
    const cut = [...s].map((c, i) => (c === ' ' || c === '-' ? i : -1)).filter((i) => i > 0);
    if (!cut.length) return null;
    const i = cut.reduce((b, x) => (Math.abs(x - s.length / 2) < Math.abs(b - s.length / 2) ? x : b));
    return s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : [s.slice(0, i), s.slice(i + 1)];
  };
  const RED = '#ec1820', BLUE = '#0071ba', MBLUE = '#1d5fd0', GREEN = '#03ad67', YEL = '#fbcc33', INK = '#111';
  // a text line sized to maxw; centred lines take back the trailing letter space so they sit truly centred
  const txt = (x, y, s, max, maxw, o = {}) => {
    const ls = o.ls || 0, size = Math.min(max, maxw / tw(s, ls));
    const dx = (o.anchor || 'middle') === 'middle' ? ls * size / 2 : (o.anchor === 'end' ? ls * size : 0);
    return T(x + dx, y, s, size, F, { weight: 600, maxw, max, ...o });
  };

  // byzone (E55) and its end (E56): white plate, black frame, the name in bold above a skyline (houses, church, block)
  const sky = (dx) => `<g transform="translate(${dx},0)" fill="#000"><path d="M102,288V249L142,201L184,249V258H200V221L222,137L245,221V288Z"/>` +
    `<path d="M260,288V223L270,212H349L359,223V269H374V255L405,225L440,255V288Z"/><path d="M448,288V210L493,168L540,210V288Z"/></g>`;
  const byzone = ({ name }, end) => {
    const ls = 0.06, S = 113, pad = 70;
    let lines = [name];
    if (tw(name, ls) * S + 2 * pad > 1100 && split2(name)) lines = split2(name);
    const w = Math.max(640, Math.min(1100, Math.max(...lines.map((l) => tw(l, ls) * S)) + 2 * pad));
    const dy = (lines.length - 1) * 112, H = 317 + dy;
    // E56 bar (group B): behind the name and the skyline, thick (about a tenth of the plate width), its centre from
    // just above the bottom-left corner to just below the top-right one, cut by the frame (as on the picture)
    // the black frame: 7 wide on E55 (city-signs 57), 10.5 on E56 (city-signs 58)
    const fw = end ? 10.5 : 7, ri = end ? 16 : 18;
    const fh = H - 2 * fw, bar = end ? TS.exitbar({ box: [fw, fw, w - 2 * fw, fh, ri], from: [fw, fw + fh * 0.96], to: [w - fw, fw + fh * 0.04], width: 64, fill: RED }) : '';
    return svg(w, H, `<rect width="${w}" height="${H}" rx="25" fill="#000"/><rect x="${fw}" y="${fw}" width="${w - 2 * fw}" height="${H - 2 * fw}" rx="${ri}" fill="#fff"/>` + bar +
      lines.map((l, i) => txt(w / 2, 108 + i * 112, l, S, w - 2 * pad, { weight: 700, ls, fill: '#000' })).join('') +
      `<g transform="translate(0,${dy})">${sky((w - 640) / 2)}</g>`);
  };

  // town-name sign (blue): blue edge, white band, blue field with the name in white; its length follows the name
  const bynavn = ({ name }) => {
    const ls = 0.08, S = 97, pad = 100;
    let lines = [name];
    if (tw(name, ls) * S + 2 * pad > 1400 && split2(name)) lines = split2(name);
    const w = Math.max(480, Math.min(1400, Math.max(...lines.map((l) => tw(l, ls) * S)) + 2 * pad));
    const H = 213 + (lines.length - 1) * 100;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="60" fill="${BLUE}"/><rect x="6" y="6" width="${w - 12}" height="${H - 12}" rx="54" fill="#fff"/><rect x="27" y="27" width="${w - 54}" height="${H - 54}" rx="30" fill="${BLUE}"/>` +
      lines.map((l, i) => txt(w / 2, 128 + i * 100, l, S, w - 2 * pad, { ls, fill: '#fff' })).join(''));
  };

  // arrow-shaped field inside a w x h plate, inset i, pointing right (or left)
  const field = (w, h, i, tip, left) => {
    const r = 8, m = h / 2;
    return left
      ? `M${w - i - r},${i}Q${w - i},${i} ${w - i},${i + r}V${h - i - r}Q${w - i},${h - i} ${w - i - r},${h - i}H${i + tip}L${i},${m}L${i + tip},${i}Z`
      : `M${i + r},${i}H${w - i - tip}L${w - i},${m}L${w - i - tip},${h - i}H${i + r}Q${i},${h - i} ${i},${h - i - r}V${i + r}Q${i},${i} ${i + r},${i}Z`;
  };

  // red arrow (ordinary roads): red plate, white arrow field, route number in a black frame, name and km in red
  const rodPil = ({ name, road, km }) => {
    const r = String(road), ls = 0.08, S = 44, bw = Math.max(122, tw(r, 0.04) * 46 + 36), x0 = 18 + bw + 30;
    const nw = tw(name, ls) * S, kw = tw(String(km)) * 44;
    const w = Math.max(640, Math.min(1400, x0 + nw + 40 + kw + 60));
    const maxw = w - x0 - kw - 100;
    return svg(w, 77, `<rect width="${w}" height="77" rx="10" fill="${RED}"/><path d="${field(w, 77, 9, 40)}" fill="#fff"/>` +
      `<rect x="20.5" y="12.5" width="${bw - 5}" height="52" rx="6" fill="#fff" stroke="#000" stroke-width="5"/>` + txt(18 + bw / 2, 56, r, 46, bw - 26, { ls: 0.04, fill: '#000' }) +
      txt(x0, 55, name, S, maxw, { ls, fill: RED, anchor: 'start' }) + txt(w - 62, 55, String(km), 44, kw + 10, { fill: RED, anchor: 'end' }));
  };

  // the Danish motorway pictogram (two lanes under a bridge), white, in a 56 x 62 box at x, y
  const mwSym = (x, y, c) => `<g fill="${c}" transform="translate(${x},${y})"><path d="M4,62L14,0H25L23,62Z"/><path d="M52,62L42,0H31L33,62Z"/><rect x="-6" y="24" width="68" height="6"/><rect x="2" y="30" width="52" height="4"/></g>`;

  // green arrow (to the motorway): white plate, green arrow field, E-road box, motorway pictogram, name and km
  const gronPil = ({ name, km, road }) => {
    const e = /^E/.test(String(road)) ? String(road).replace(/\s+/g, '') : 'E45';
    const ls = 0.15, S = 55, bw = Math.max(144, tw(e, 0.25) * 55 + 30), x0 = 12 + bw + 102;
    const nw = tw(name, ls) * S, kw = tw(String(km)) * 55;
    const w = Math.max(640, Math.min(1500, x0 + nw + 50 + kw + 50));
    return svg(w, 86, `<rect x="1" y="1" width="${w - 2}" height="84" rx="13" fill="#fff" stroke="#333" stroke-width="2"/><path d="${field(w, 86, 8, 36)}" fill="${GREEN}"/>` +
      `<rect x="13.5" y="11.5" width="${bw - 3}" height="63" rx="7" fill="none" stroke="#fff" stroke-width="3"/><rect x="18.5" y="16.5" width="${bw - 13}" height="53" rx="4" fill="none" stroke="#fff" stroke-width="2"/>` +
      txt(12 + bw / 2, 63, e, 55, bw - 30, { ls: 0.25, fill: '#fff' }) + mwSym(12 + bw + 26, 12, '#fff') +
      txt(x0, 63, name, S, w - x0 - kw - 90, { ls, fill: '#fff', anchor: 'start' }) + txt(w - 50, 63, String(km), 55, kw + 10, { fill: '#fff', anchor: 'end' }));
  };

  // blue arrow (local destinations): blue plate, white arrow field pointing left, the name in blue
  const lokalPil = ({ name }) => {
    const ls = 0.12, S = 43, nw = tw(name, ls) * S;
    const w = Math.max(320, Math.min(1200, 35 + 50 + nw + 26));
    return svg(w, 68, `<rect width="${w}" height="68" rx="12" fill="${BLUE}"/><path d="${field(w, 68, 6, 30, true)}" fill="#fff"/>` +
      txt(w - 26, 49, name, S, w - 26 - 85, { ls, fill: BLUE, anchor: 'end' }));
  };

  // advance table before a roundabout (red on white): route number and motor-road symbol, the destinations at each arm
  const rundkorsel = ({ name, next, road }) => {
    const S = 37, ls = 0.1, r = String(road);
    const leftW = Math.max(222, tw(next, ls) * S), dx = leftW - 222;
    const topW = tw(name, ls) * S, rightW = Math.max(210, tw('Centrum', ls) * S);
    const w = Math.max(640, 347 + dx + topW + 30, 400 + dx + rightW + 30);
    const cx = 305 + dx, cy = 232;
    const ring = `<path d="M${cx - 57},${cy}A57,57 0 1 1 ${cx},${cy + 57}" fill="none" stroke="${RED}" stroke-width="22"/>`;
    const arms = `<g fill="${RED}"><path d="M${cx - 11},170V88L${cx},76L${cx + 11},88V170Z"/><path d="M${cx - 11},282V365H${cx + 11}V282Z"/>` +
      `<path d="M${cx - 62},${cy - 12}H${cx - 152}L${cx - 163},${cy}L${cx - 152},${cy + 12}H${cx - 62}Z"/><path d="M${cx + 62},${cy - 12}H${cx + 155}L${cx + 166},${cy}L${cx + 155},${cy + 12}H${cx + 62}Z"/></g>`;
    const car = `<rect x="${cx - 20}" y="22" width="43" height="40" rx="5" fill="#1f6fbf"/><g fill="#fff" transform="translate(${cx - 13},31)"><path d="M3,10L7,2H22L26,10H29V18H26V22H22V18H7V22H3V18H0V10Z"/></g><g fill="#1f6fbf" transform="translate(${cx - 13},31)"><path d="M6,10L9,4H20L23,10Z"/><circle cx="5" cy="14" r="2"/><circle cx="24" cy="14" r="2"/></g>`;
    const bw = Math.max(92, tw(r) * 38 + 30);
    return svg(w, 392, `<rect width="${w}" height="392" rx="18" fill="${RED}"/><rect x="6" y="6" width="${w - 12}" height="380" rx="13" fill="#fff"/>` +
      `<rect x="${cx - 28 - bw}" y="22.5" width="${bw}" height="38" rx="5" fill="${YEL}" stroke="#000" stroke-width="3"/>` + txt(cx - 28 - bw / 2, 54, r, 38, bw - 20, { fill: '#000' }) + car +
      txt(cx + 42, 57, name, S, w - cx - 72, { ls, fill: RED, anchor: 'start' }) + ring + arms +
      txt(30, 290, next, S, leftW, { ls, fill: RED, anchor: 'start' }) + txt(w - 30, 290, 'Centrum', S, rightW, { ls, fill: RED, anchor: 'end' }));
  };

  // motorway exit sign (blue): exit number in a white hexagon, the destination, the road number, a slanted arrow
  const frakorsel = ({ name, road, exit }) => {
    const ls = 0.14, S = 55, nw = tw(name, ls) * S, r = String(road), x0 = 165;
    const w = Math.max(588, Math.min(1300, x0 + nw + 140));
    const ax = w - 70, ay = 130;
    const arrow = `<g transform="translate(${ax},${ay}) rotate(27)" fill="#fff"><path d="M-11,62V-22H-30L0,-60L30,-22H11V62Z"/></g>`;
    return svg(w, 222, `<rect width="${w}" height="222" rx="10" fill="#fff" stroke="#bbb" stroke-width="2"/><rect x="5" y="5" width="${w - 10}" height="212" rx="7" fill="${MBLUE}"/>` +
      `<path d="M24,70L44,32H98L118,70L98,109H44Z" fill="#fff"/>` + txt(71, 90, String(exit), 55, 70, { fill: RED, weight: 700 }) +
      txt(x0, 90, name, S, w - x0 - 140, { ls, fill: '#fff', anchor: 'start' }) +
      `<rect x="136" y="122" width="${Math.max(80, tw(r) * 44 + 24)}" height="56" rx="7" fill="#fff"/><rect x="140" y="126" width="${Math.max(80, tw(r) * 44 + 24) - 8}" height="48" rx="5" fill="none" stroke="#000" stroke-width="3" stroke-dasharray="12 6"/>` +
      txt(136 + Math.max(80, tw(r) * 44 + 24) / 2, 166, r, 44, Math.max(80, tw(r) * 44 + 24) - 16, { fill: '#000' }) + arrow);
  };

  // a bicycle pictogram (line drawing, 60 x 34 at scale 1) at x, y
  const bikeIcon = (x, y, k, c) => `<g transform="translate(${x},${y}) scale(${k})" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="23" r="10"/><circle cx="49" cy="23" r="10"/><path d="M11,23L22,7H42L49,23M22,7L30,23H11M30,23L42,7M17,2H27M42,7L39,1H46"/></g>`;

  // cycle-route direction board (after a Commons photo): white rim, dark blue field, an arrow to the left, the route
  // box (bicycle over the national route number in red), the destination and its distance
  const cykel = ({ name, km }) => {
    const ls = 0.08, S = 56, k = String(km), nw = tw(name, ls) * S, kw = tw(k) * S;
    const w = Math.max(560, Math.min(1300, 232 + nw + 50 + kw + 34)), H = 130;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="18" fill="#eef1f6" stroke="#9aa" stroke-width="2"/><rect x="9" y="9" width="${w - 18}" height="${H - 18}" rx="12" fill="#20398a"/>` +
      `<path d="M28,65L66,38V56H104V74H66V92Z" fill="#fff"/>` +
      `<rect x="122" y="20" width="88" height="90" rx="8" fill="none" stroke="#fff" stroke-width="4"/>` + bikeIcon(136, 28, 1, '#fff') +
      `<rect x="152" y="70" width="28" height="30" rx="3" fill="#c8102e" stroke="#fff" stroke-width="2"/>` + T(166, 94, '5', 26, F, { weight: 700, fill: '#fff' }) +
      txt(232, 85, name, S, w - 232 - kw - 84, { ls, fill: '#fff', anchor: 'start' }) + txt(w - 34, 85, k, S, kw + 6, { fill: '#fff', anchor: 'end' }));
  };

  TS.add('DK', [
    { id: 'byzone', kind: 'entry', label: 'Town zone (E55)', draw: (o) => byzone(o, false) },
    { id: 'byzone-end', kind: 'exit', label: 'End of town zone (E56)', draw: (o) => byzone(o, true) },
    { id: 'bynavn', kind: 'hamlet', label: 'Town name (blue)', draw: bynavn },
    { id: 'pil-rod', kind: 'direction', label: 'Arrow sign (red)', draw: rodPil },
    { id: 'pil-gron', kind: 'motorway', label: 'Arrow sign to motorway (green)', draw: gronPil },
    { id: 'pil-lokal', kind: 'direction', label: 'Local arrow sign (blue)', draw: lokalPil },
    { id: 'rundkorsel', kind: 'direction', label: 'Roundabout advance table', draw: rundkorsel },
    { id: 'frakorsel', kind: 'motorway', label: 'Motorway exit sign (blue)', draw: frakorsel },
    { id: 'cykel', kind: 'bike', label: 'Cycle-route board', draw: cykel },
  ], { next: 'Bregninge', road: '23', km: 6, exit: 50 });
})();
