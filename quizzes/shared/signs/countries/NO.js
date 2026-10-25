// NO: Norwegian signs carrying a place name, drawn after the GeoHints pictures (see examples/NO.json).
// Lettering: Trafikkalfabetet on the real signs (wide, DIN-like); DINish Expanded stands in. Names in mixed case.
// A name given as "Norwegian / Sámi / Kven" (or with alt) is stacked line by line, as multilingual names are in the north.
(function () {
  const { T, svg } = TS;
  const F = "'DINish Expanded','DINish','Noto Sans',sans-serif";
  // advance widths (em) of DINish Expanded SemiBold, to size a sign to its text before the real font is measured
  const CH = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-./'():ÆØÅæøåÐðÞþßŊŋĐđŦŧ";
  const W = Object.fromEntries([...CH].map((c, i) => [c, +'225676659675665597597675676257355676572814706680631680663608581681616928659598563552573557573565366573571238237570310900571565573573389522391571529823505530501559373539553572543563501574563407209438188319319209996680676899565552704557631573570706571704573555391'.substr(i * 3, 3) / 1000]));
  const tw = (s) => [...String(s)].reduce((a, c) => a + (W[c] ?? W[c.normalize('NFD')[0]] ?? 0.62), 0);
  const parts = (name, alt) => [...String(name).split(/\s*\/\s*/), ...(alt ? String(alt).split(/\s*\/\s*/) : [])].filter(Boolean);
  const fitS = (s, maxw, max) => Math.min(max, maxw / tw(s));
  const BLUE = '#1c3596', MBLUE = '#1b64b6', YEL = '#fbb80a', GREEN = '#1e9c69', INK = '#1a1a1a';
  const txt = (x, y, s, max, maxw, o = {}) => T(x, y, s, fitS(s, maxw, max), F, { weight: 500, maxw, max, ...o });

  // place-name sign: blue, white rim, the name in white; its length follows the name, one line per language
  const stedsnavn = ({ name, alt }) => {
    const lines = parts(name, alt), S = 205, pad = 78, pitch = 190;
    const w = Math.max(520, Math.min(2600, Math.max(...lines.map((l) => tw(l) * S)) + 2 * pad));
    const H = 300 + (lines.length - 1) * pitch;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="22" fill="#fff" stroke="#bbb" stroke-width="2"/><rect x="15" y="15" width="${w - 30}" height="${H - 30}" rx="10" fill="${BLUE}"/>` +
      lines.map((l, i) => txt(w / 2, 214 + i * pitch, l, S, w - 2 * pad, { fill: '#fff' })).join(''));
  };

  // a route number on a white plate with a black frame
  const routeBox = (x, y, w, h, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#fff"/><rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="6" fill="none" stroke="${INK}" stroke-width="4"/>` +
    T(x + w / 2, y + h * 0.73, r, Math.min(h * 0.66, (w - 22) / (tw(r) || 1)), F, { weight: 600, fill: INK, maxw: w - 22, max: h * 0.66 });

  // yellow direction table: the destination straight on at the top, the next to the left, the town centre to the right
  const tabell = ({ name, alt, next, road }) => {
    const S = 48, top = parts(name, alt), left = parts(next), right = ['Sentrum'];
    const leftW = Math.max(190, ...left.map((l) => tw(l) * S)), rightW = Math.max(200, tw(right[0]) * S);
    const cx = 40 + leftW + 55, cx2 = cx + 78;
    let w = cx2 + 30 + rightW + 40;
    const topW = Math.max(...top.map((l) => tw(l) * S));
    w = Math.max(w, topW + 80);
    const tx = Math.min(Math.max(cx, 40 + topW / 2), w - 40 - topW / 2);
    const dy = (top.length - 1) * 58, dl = (left.length - 1) * 58, H = 484 + dy + dl, by = 445 + dy + dl;
    const y = (v) => v + dy;
    const arrows = `<g fill="none" stroke="${INK}" stroke-width="18">` +
      `<path d="M${cx},${by}V${y(180)}"/><path d="M${cx},${y(350)}Q${cx},${y(318)} ${cx - 32},${y(318)}H${cx - 80}"/>` +
      `<path d="M${cx2},${by}V${y(356)}Q${cx2},${y(318)} ${cx2 + 38},${y(318)}H${cx2 + 84}"/></g>` +
      `<g fill="${INK}"><path d="M${cx - 32},${y(180)}L${cx},${y(132)}L${cx + 32},${y(180)}Z"/><path d="M${cx - 76},${y(286)}L${cx - 120},${y(318)}L${cx - 76},${y(350)}Z"/>` +
      `<path d="M${cx2 + 80},${y(286)}L${cx2 + 122},${y(318)}L${cx2 + 80},${y(350)}Z"/></g>`;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="16" fill="${YEL}"/><rect x="7" y="7" width="${w - 14}" height="${H - 14}" rx="11" fill="none" stroke="${INK}" stroke-width="5"/>` +
      top.map((l, i) => txt(tx, 84 + i * 58, l, S, w - 80, { fill: INK, weight: 600 })).join('') + arrows +
      routeBox(40, y(282), 98, 64, String(road)) + routeBox(w - 140, y(282), 98, 64, String(road)) +
      left.map((l, i) => txt(40, y(410) + i * 58, l, S, leftW, { fill: INK, weight: 600, anchor: 'start' })).join('') +
      txt(w - 40, y(410) + dl, right[0], S, rightW, { fill: INK, weight: 600, anchor: 'end' }));
  };

  // yellow arrow signs: the name pointing right, the next town pointing left below it, on a dark backboard;
  // a name in several languages makes its arrow taller, one line per language
  const pil = ({ name, alt, next }) => {
    const A = parts(name, alt), B = parts(next), S = 92, tip = 92, pad = 50, pitch = 105;
    const w = Math.max(560, Math.min(1800, Math.max(...A.map(tw), ...B.map(tw)) * S + 2 * pad + tip));
    const ha = 150 + (A.length - 1) * pitch, hb = 150 + (B.length - 1) * pitch, y2 = 8 + ha + 14;
    const right = (y, h) => `<path d="M8,${y}H${w - tip - 8}L${w - 8},${y + h / 2}L${w - tip - 8},${y + h}H8Z" fill="${YEL}"/>`;
    const left = (y, h) => `<path d="M${w - 8},${y}H${tip + 8}L8,${y + h / 2}L${tip + 8},${y + h}H${w - 8}Z" fill="${YEL}"/>`;
    return svg(w, y2 + hb + 8, `<rect width="${w}" height="${y2 + hb + 8}" fill="#3b3b3b"/>` + right(8, ha) + left(y2, hb) +
      A.map((l, i) => txt(pad + 8, 8 + 106 + i * pitch, l, S, w - 2 * pad - tip, { fill: INK, weight: 500, anchor: 'start' })).join('') +
      B.map((l, i) => txt(w - pad - 8, y2 + 106 + i * pitch, l, S, w - 2 * pad - tip, { fill: INK, weight: 500, anchor: 'end' })).join(''));
  };

  // motorway advance sign (blue): E-road on top, an exit arrow branching right to the road number and two destinations,
  // the distance (500 m, as on the picture) and the exit number
  const motorvei = ({ name, alt, next, road, exit }) => {
    const lines = [...parts(name, alt), ...parts(next)], S = 67;
    const nw = Math.max(...lines.map((l) => tw(l) * S));
    const w = Math.min(900, Math.max(595, 198 + nw + 34)), dy = (lines.length - 2) * 80, H = 640 + dy;
    // exit pictogram in the pill (group D, shared/shields.js)
    const exitSym = TS.shields.exit(w - 246, H - 96, 60, INK);
    return svg(w, H, `<rect width="${w}" height="${H}" rx="12" fill="${MBLUE}"/><rect x="4" y="4" width="${w - 8}" height="${H - 8}" rx="9" fill="none" stroke="#fff" stroke-width="3"/>` +
      `<rect x="38" y="38" width="128" height="88" rx="6" fill="${GREEN}"/><rect x="42" y="42" width="120" height="80" rx="4" fill="none" stroke="#fff" stroke-width="3"/>` +
      T(102, 105, 'E 6', 58, F, { weight: 600, fill: '#fff' }) +
      `<path d="M74,${525 + dy}V205" fill="none" stroke="#fff" stroke-width="22"/><path d="M37,213L74,158L111,213Z" fill="#fff"/>` +
      `<path d="M85,330Q86,290 135,265" fill="none" stroke="#fff" stroke-width="18"/><path d="M120,245L168,258L145,302Z" fill="#fff"/>` +
      routeBox(200, 213, Math.max(152, tw(String(road)) * 60 + 50), 89, String(road)) +
      lines.map((l, i) => txt(198, 390 + i * 80, l, S, w - 198 - 34, { fill: '#fff', anchor: 'start' })).join('') +
      txt(48, H - 43, '500 m', 60, 230, { fill: '#fff', anchor: 'start' }) +
      `<rect x="${w - 270}" y="${H - 110}" width="232" height="88" rx="44" fill="#fff"/>` + exitSym +
      txt(w - 100, H - 43, String(exit), 62, 100, { fill: INK, weight: 600 }));
  };

  // a bicycle pictogram (line drawing, 60 x 34 at scale 1) at x, y
  const bikeIcon = (x, y, k, c) => `<g transform="translate(${x},${y}) scale(${k})" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="23" r="10"/><circle cx="49" cy="23" r="10"/><path d="M11,23L22,7H42L49,23M22,7L30,23H11M30,23L42,7M17,2H27M42,7L39,1H46"/></g>`;

  // cycle route sign (after a Commons photo from Stavanger): burgundy plates with a white edge, a bicycle on the top
  // plate, below it an arrow straight on with the name and its distance (decimal comma)
  const sykkel = ({ name, alt, km }) => {
    const L = parts(name, alt), S = 56, k = (Math.round(+km * 10) / 10).toFixed(1).replace('.', ',');
    const w = Math.max(420, Math.min(1100, 28 + Math.max(...L.map(tw)) * S + 50 + tw(k) * S + 28)), h2 = 70 + L.length * 62;
    return svg(w, 128 + h2, `<rect width="${w}" height="${128 + h2}" rx="10" fill="#e6e1e1"/><rect x="4" y="4" width="${w - 8}" height="112" rx="7" fill="#8b1a2b"/>` + bikeIcon(w / 2 - 51, 26, 1.7, '#fff') +
      `<rect x="4" y="124" width="${w - 8}" height="${h2}" rx="7" fill="#8b1a2b"/><path d="M24,170L44,140L64,170H52V192H36V170Z" fill="#fff"/>` +
      L.map((l, i) => txt(28, 240 + i * 62, l, S, w - 28 - tw(k) * S - 70, { fill: '#fff', anchor: 'start' })).join('') +
      txt(w - 28, 240 + (L.length - 1) * 62, k, S, tw(k) * S + 6, { fill: '#fff', anchor: 'end' }));
  };

  TS.add('NO', [
    { id: 'stedsnavn', kind: 'entry', label: 'Place name (blue)', draw: stedsnavn },
    { id: 'tabell', kind: 'direction', label: 'Direction table (yellow)', draw: tabell },
    { id: 'pil', kind: 'direction', label: 'Arrow signs (yellow)', draw: pil },
    { id: 'motorvei', kind: 'motorway', label: 'Motorway advance sign', draw: motorvei },
    { id: 'sykkel', kind: 'bike', label: 'Cycle route sign', draw: sykkel },
  ], { next: 'Lillestrøm', road: '168', exit: 25, km: 16.2 });
})();
