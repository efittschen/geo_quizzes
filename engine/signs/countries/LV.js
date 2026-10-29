// LV: Latvian signs carrying a place name, drawn after the GeoHints pictures (see examples/LV.json).
// Place names in capitals, DIN 1451 lettering (Mittelschrift on name signs, Engschrift on direction boards); DINish stands in.
(function () {
  const { T, svg } = TS;
  const F = "'DINish','Noto Sans',sans-serif", FC = "'DINish Condensed','DINish','Noto Sans',sans-serif";
  // advance widths (em) of DINish Medium and DINish Condensed Medium, to size a sign before the font is measured
  const CH = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-./'():ÆØÅæøåÐðÞþßŊŋĐđŦŧ";
  const tab = (s) => Object.fromEntries([...CH].map((c, i) => [c, +s.substr(i * 3, 3) / 1000]));
  const WM = tab('217586608606613550551606622248318602524753652606573606599547503628533808574512512498512504512508315512521229227502277818521507512512344466344521452721434453455499335476497506487501439516501393200396179295295200871606586797507498669500573512511652521669512486344'), WC = tab('175469465475472403401475472207264461383589492475438475464426382473432661415399376401410407410408287410413200198412235638413409410410295385297413383587359383379404280394402419400396367404396367164297156263263164685475469629409401497403438410415492413497410367297');
  const tw = (s, W) => [...String(s)].reduce((a, c) => a + (W[c] ?? W[c.normalize('NFD')[0]] ?? 0.6), 0);
  const split2 = (s) => {
    const cut = [...s].map((c, i) => (c === ' ' || c === '-' ? i : -1)).filter((i) => i > 0);
    if (!cut.length) return null;
    const i = cut.reduce((b, x) => (Math.abs(x - s.length / 2) < Math.abs(b - s.length / 2) ? x : b));
    return s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : [s.slice(0, i), s.slice(i + 1)];
  };
  const up = (s) => String(s).toLocaleUpperCase('lv');
  const BLUE = '#263994', RED = '#ec1b3b';
  const txt = (x, y, s, max, maxw, W, font, o = {}) => T(x, y, s, Math.min(max, maxw / tw(s, W)), font, { weight: 500, maxw, max, ...o });

  // white name sign (built-up area starts): thin outer line, thick black frame, the name in black capitals;
  // its length follows the name, a name too long for one line goes on two; the end of it is crossed by a red bar
  const balta = ({ name }, end) => {
    const n = up(name), S = 96, pad = 62;
    let L = [n];
    if (tw(n, WM) * S + 2 * pad > 1400 && split2(n)) L = split2(n);
    const w = Math.max(420, Math.min(1400, Math.max(...L.map((l) => tw(l, WM) * S)) + 2 * pad)), H = 190 + (L.length - 1) * 88;
    const bar = end ? `<clipPath id="lv-b"><rect x="12" y="12" width="${w - 24}" height="${H - 24}" rx="16"/></clipPath><line x1="10" y1="${H - 14}" x2="${w - 10}" y2="14" stroke="${RED}" stroke-width="22" clip-path="url(#lv-b)"/>` : '';
    return svg(w, H, `<rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="22" fill="#fff" stroke="#000" stroke-width="2"/><rect x="17" y="17" width="${w - 34}" height="${H - 34}" rx="14" fill="none" stroke="#000" stroke-width="10"/>` +
      L.map((l, i) => txt(w / 2, 128 + i * 88, l, S, w - 2 * pad, WM, F, { fill: '#000' })).join('') + bar);
  };

  // blue name sign (a place without built-up-area rules): thin black line, white band, blue field, white capitals
  const zila = ({ name }, end) => {
    const n = up(name), S = 130, pad = 90;
    let L = [n];
    if (tw(n, WM) * S + 2 * pad > 1600 && split2(n)) L = split2(n);
    const w = Math.max(460, Math.min(1600, Math.max(...L.map((l) => tw(l, WM) * S)) + 2 * pad)), H = 262 + (L.length - 1) * 118;
    const bar = end ? `<clipPath id="lv-z"><rect x="9" y="9" width="${w - 18}" height="${H - 18}" rx="26"/></clipPath><line x1="0" y1="${H - 20}" x2="${w}" y2="8" stroke="${RED}" stroke-width="28" clip-path="url(#lv-z)"/>` : '';
    return svg(w, H, `<rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="32" fill="#fff" stroke="#000" stroke-width="3"/><rect x="9" y="9" width="${w - 18}" height="${H - 18}" rx="26" fill="${BLUE}"/>` +
      L.map((l, i) => txt(w / 2, 175 + i * 118, l, S, w - 2 * pad, WM, F, { fill: '#fff' })).join('') + bar);
  };

  // direction board (blue, white edge): an arrow to the left, the name and its distance in narrow white capitals
  const virziens = ({ name, km }) => {
    const n = up(name), k = String(km), S = 82, nw = tw(n, WC) * S, kw = tw(k, WC) * S;
    const w = Math.max(560, Math.min(1400, 225 + nw + 46 + kw + 40)), H = 130;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="16" fill="#f2f2f2"/><rect x="8" y="8" width="${w - 16}" height="${H - 16}" rx="10" fill="#1a3d9c"/>` +
      `<path d="M42,65L95,29V54H168V76H95V101Z" fill="#f2f2f2"/>` +
      txt(205, 92, n, S, w - 205 - kw - 80, WC, FC, { fill: '#f2f2f2', anchor: 'start' }) + txt(w - 40, 92, k, S, kw + 4, WC, FC, { fill: '#f2f2f2', anchor: 'end' }));
  };

  TS.add('LV', [
    { id: 'sakums', kind: 'entry', label: 'Built-up area starts (white)', draw: (o) => balta(o, false) },
    { id: 'beigas', kind: 'exit', label: 'Built-up area ends (white)', draw: (o) => balta(o, true) },
    { id: 'nosaukums', kind: 'hamlet', label: 'Place name (blue)', draw: (o) => zila(o, false) },
    { id: 'nosaukums-beigas', kind: 'exit', label: 'End of place (blue)', draw: (o) => zila(o, true) },
    { id: 'virziens', kind: 'direction', label: 'Direction board (blue)', draw: virziens },
  ], { km: 8 });
})();
