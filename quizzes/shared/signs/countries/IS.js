// IS: Icelandic signs carrying a place name, drawn after the GeoHints pictures (see examples/IS.json).
// Lettering: a version of Transport on the real signs; Public Sans stands in. Names in mixed case, widely spaced.
(function () {
  const { T, svg } = TS;
  const F = "'Public Sans','Noto Sans',sans-serif";
  // advance widths (em) of Public Sans Bold, to size a sign to its text before the real font is measured
  const CH = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-./'():ÆØÅæøåÐðÞþßŊŋĐđŦŧ";
  const W = Object.fromEntries([...CH].map((c, i) => [c, +'226727685718720635614759770308402717578918782761653773696692616724704969717668670567609547609577397629593267289580329896593576607607412527417595521789588563497645428635665656675661626671659393270381261333337270999776727914612567749576681604627782600749639616417'.substr(i * 3, 3) / 1000]));
  const tw = (s, ls = 0) => [...String(s)].reduce((a, c) => a + (W[c] ?? W[c.normalize('NFD')[0]] ?? 0.62) + ls, 0);
  const YEL = '#f8c900', BLUE = '#2163ac', TBLUE = '#2a5ea8', INK = '#111';
  const txt = (x, y, s, max, maxw, o = {}) => {
    const ls = o.ls || 0, size = Math.min(max, maxw / tw(s, ls));
    const dx = (o.anchor || 'middle') === 'middle' ? ls * size / 2 : 0;
    return T(x + dx, y, s, size, F, { weight: 700, maxw, max, ...o });
  };

  // built-up area: yellow plate, black frame, skyline (house, church, hall, houses); the name on a yellow plate below,
  // which grows wider than the sign for a long name
  const thettbyli = ({ name }) => {
    const ls = 0.12, S = 72, nw = Math.max(640, Math.min(1000, tw(name, ls) * S + 110)), dx = (nw - 640) / 2;
    const sky = `<g transform="translate(${dx},0)"><rect width="640" height="380" rx="30" fill="${INK}"/><rect x="19" y="19" width="600" height="343" rx="13" fill="${YEL}"/>` +
      `<g fill="${INK}"><rect x="27" y="263" width="580" height="88"/><path d="M27,264V220L94,200L150,220V264Z"/><path d="M158,264V242L206,61L252,242V264Z"/>` +
      `<path d="M261,264V241L289,213H313V203H354V213H383L410,241V264Z"/><path d="M417,264V220L466,189L511,220V264Z"/><path d="M519,264V176L562,159L606,176V264Z"/></g></g>`;
    return svg(nw, 515, sky + `<rect y="387" width="${nw}" height="128" rx="22" fill="${INK}"/><rect x="14" y="401" width="${nw - 28}" height="100" rx="10" fill="${YEL}"/>` +
      txt(nw / 2, 477, name, S, nw - 90, { ls, fill: INK }));
  };

  // a route number box: white with a black frame, dashed for Route 1 (the ring road), as on the picture
  const box = (x, y, w, h, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#fff" stroke="${INK}" stroke-width="5"${r === '1' ? ' stroke-dasharray="22 12"' : ''}/>` +
    T(x + w / 2, y + h * 0.8, r, Math.min(h * 0.8, (w - 24) / tw(r, 0.08)), F, { weight: 700, fill: INK, maxw: w - 24, max: h * 0.8, ls: 0.08 });

  // yellow direction plate: an arrow straight on, the route numbers, two destinations
  const vegvisir = ({ name, next, road }) => {
    const ls = 0.1, S = 46, x0 = 248;
    const w = Math.max(640, Math.min(1100, x0 + Math.max(tw(name, ls), tw(next, ls)) * S + 40));
    return svg(w, 145, `<rect width="${w}" height="145" rx="16" fill="${INK}"/><rect x="10" y="10" width="${w - 20}" height="125" rx="8" fill="${YEL}"/>` +
      `<path d="M48,112V70H31L57,34L83,70H66V112Z" fill="${INK}"/>` + box(112, 23, 106, 44, String(road)) + box(112, 81, 106, 44, '35') +
      txt(x0, 60, name, S, w - x0 - 30, { ls, fill: INK, anchor: 'start' }) + txt(x0, 118, next, S, w - x0 - 30, { ls, fill: INK, anchor: 'start' }));
  };

  // yellow direction plate for one destination: route number, the name, an arrow turning right
  const beygja = ({ name, road }) => {
    const ls = 0.1, S = 46, x0 = 140;
    const w = Math.max(640, Math.min(1100, x0 + tw(name, ls) * S + 140));
    return svg(w, 105, `<rect width="${w}" height="105" rx="16" fill="${INK}"/><rect x="10" y="10" width="${w - 20}" height="85" rx="8" fill="${YEL}"/>` +
      box(30, 30, 92, 46, String(road)) + txt(x0, 70, name, S, w - x0 - 130, { ls, fill: INK, anchor: 'start' }) +
      `<path d="M${w - 92},86V58Q${w - 92},38 ${w - 72},38H${w - 56}V22L${w - 22},48L${w - 56},74V58H${w - 70}Q${w - 72},58 ${w - 72},60V86Z" fill="${INK}"/>`);
  };

  // blue arrow plate with the name in yellow and a yellow chevron at the end
  const stadur = ({ name }) => {
    const S = 127, nw = tw(name, 0.02) * S, w = Math.max(560, Math.min(1500, 75 + nw + 75 + 140));
    return svg(w, 211, `<clipPath id="is-st"><rect width="${w}" height="211" rx="22"/></clipPath><rect width="${w}" height="211" rx="22" fill="${BLUE}"/>` +
      `<path d="M${w - 135},-5L${w - 12},105.5L${w - 135},216" fill="none" stroke="${YEL}" stroke-width="22" clip-path="url(#is-st)"/>` +
      txt(75, 147, name, S, w - 75 - 175, { ls: 0.02, fill: YEL, anchor: 'start' }));
  };

  // capital-area direction table (white, blue frame and lettering): route number, the destination ahead,
  // the next to the left, the city centre to the right
  const hofudborg = ({ name, next, road }) => {
    const ls = 0.1, S = 46;
    // a long name breaks at a hyphen (which then leads the second line, as "-Mjódd" on the picture) or a space
    const brk = (s) => { if (tw(s, ls) * S <= 260) return [s]; const i = s.indexOf('-') > 0 ? s.indexOf('-') : s.indexOf(' '); return i > 0 ? [s.slice(0, i), s.slice(s[i] === '-' ? i : i + 1)] : [s]; };
    const left = brk(next), lw = Math.max(250, ...left.map((l) => tw(l, ls) * S));
    // the left arm runs under the first line: the junction moves right when the second line is long
    const cx = Math.max(315 + lw - 250, 160 + (left.length > 1 ? tw(left[1], ls) * S : 0)), w = Math.max(640, cx + 45 + tw(name, ls) * S + 40 + 50, cx + 100 + tw('Miðbær', ls) * S + 40);
    const r = String(road), bw = Math.max(100, tw(r) * 42 + 40);
    return svg(w, 373, `<rect width="${w}" height="373" rx="16" fill="${TBLUE}"/><rect x="8" y="8" width="${w - 16}" height="357" rx="9" fill="#fff"/>` +
      `<rect x="${cx - 30 - bw}" y="31" width="${bw}" height="43" rx="5" fill="${YEL}" stroke="${INK}" stroke-width="4"/>` + T(cx - 30 - bw / 2, 66, r, 40, F, { weight: 700, fill: INK }) +
      txt(cx + 45, 70, name, S, w - cx - 85, { ls, fill: TBLUE, anchor: 'start' }) +
      `<g fill="${TBLUE}"><path d="M${cx - 15},341V83L${cx},68L${cx + 15},83V341Z"/><path d="M${cx - 15},200H${cx - 103}L${cx - 110},206.5L${cx - 103},213H${cx - 15}Z"/><path d="M${cx + 15},258H${cx + 75}L${cx + 82},264L${cx + 75},270H${cx + 15}Z"/></g>` +
      left.map((l, i) => txt(33, 172 + i * 50, l, S, lw, { ls, fill: TBLUE, anchor: 'start' })).join('') + txt(cx + 103, 272, 'Miðbær', S, w - cx - 140, { ls, fill: TBLUE, anchor: 'start' }));
  };

  TS.add('IS', [
    { id: 'thettbyli', kind: 'entry', label: 'Built-up area with name plate', draw: thettbyli },
    { id: 'vegvisir', kind: 'direction', label: 'Direction plate (yellow)', draw: vegvisir },
    { id: 'beygja', kind: 'direction', label: 'Turn plate (yellow)', draw: beygja },
    { id: 'stadur', kind: 'direction', label: 'Arrow plate (blue, yellow text)', draw: stadur },
    { id: 'hofudborg', kind: 'direction', label: 'Capital-area direction table', regions: ['Höfuðborgarsvæðið'], draw: hofudborg },
  ], { next: 'Selfoss', road: '1' });
})();
