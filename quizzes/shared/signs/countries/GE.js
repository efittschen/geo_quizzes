// GE: signs carrying a place name, drawn after the GeoHints pictures (see examples/GE.json for which).
(function () {
  const { T, svg } = TS;
  // Georgian in Noto Sans Georgian (Mtavruli capitals on the town and blue signs), Latin in DIN-like capitals (DINish)
  const FG = "'Noto Sans Georgian',sans-serif";
  const F = "'DINish','Noto Sans',sans-serif";
  const BL = '#0d68e2', GR = '#00a500', K = '#181818';
  // helper: Mkhedruli letters as Mtavruli capitals (the same letters 0xBC0 higher)
  const mtav = (s) => s.replace(/[ა-ჺჽ-ჿ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xBC0));
  // helper: the Latin form by the national romanisation (2002), without the apostrophes of the ejectives, as on signs
  // (თბილისი -> TBILISI, შავგელე -> SHAVGELE)
  const LAT = { ა: 'a', ბ: 'b', გ: 'g', დ: 'd', ე: 'e', ვ: 'v', ზ: 'z', თ: 't', ი: 'i', კ: 'k', ლ: 'l', მ: 'm', ნ: 'n', ო: 'o', პ: 'p', ჟ: 'zh', რ: 'r', ს: 's', ტ: 't', უ: 'u', ფ: 'p', ქ: 'k', ღ: 'gh', ყ: 'q', შ: 'sh', ჩ: 'ch', ც: 'ts', ძ: 'dz', წ: 'ts', ჭ: 'ch', ხ: 'kh', ჯ: 'j', ჰ: 'h' };
  const translit = (s) => [...s].map((c) => LAT[c] ?? c).join('');
  const latin = (name, alt) => (alt || translit(name)).toUpperCase();
  // helper: a name split into two lines at the space (or after the hyphen) nearest its middle; null if it has none
  const split2 = (s) => {
    let best = null;
    for (let i = 1; i < s.length - 1; i++) {
      const c = s[i] === ' ' ? [s.slice(0, i), s.slice(i + 1)] : s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : null;
      if (c && (!best || Math.max(c[0].length, c[1].length) < Math.max(best[0].length, best[1].length))) best = c;
    }
    return best;
  };

  // settlement entry/exit: Georgian over Latin capitals, same height, black border; the plate grows with the name,
  // a two-word name goes on two lines in each script once it passes 1000 wide
  const town = (name, alt, end) => {
    const ka = mtav(name), la = latin(name, alt), max = 112, cw = 0.78;
    const wrap = Math.max(ka.length, la.length) * cw * max * 0.75 > 880;
    // (the plates' Mtavruli is narrower than Noto's normal width: its line about as wide as the Latin one, as on 75/76)
    const FGT = "'Noto Sans Georgian SemiCondensed','Noto Sans Georgian',sans-serif";
    const ls = wrap ? [...(split2(ka) || [ka]).map((l) => [l, FGT]), ...(split2(la) || [la]).map((l) => [l, F])] : [[ka, FGT], [la, F]];
    const W = Math.round(Math.min(1000, Math.max(640, Math.max(...ls.map(([l]) => l.length)) * cw * max + 110)));
    const H = 272 + (ls.length - 2) * 104;
    return svg(W, H,
      `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="30" fill="#fff" stroke="#bdbdbd" stroke-width="2"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="22" fill="#fff" stroke="${K}" stroke-width="8"/>` +
      ls.map(([l, f], i) => T(W / 2, 134 + i * 104, l, max, f, { fill: K, weight: 600, ls: f === FGT ? 0.12 : 0.08, maxw: W - 110, max })).join('') +
      // exit bar (group B): in front of the name, running right up to the frame at both ends, cut flat by it
      (end ? TS.exitbar({ box: [14, 14, W - 28, H - 28, 18], b: 0.15, t: 0.84, width: 36, fill: '#ff1a00' }) : ''));
  };

  const ge = [
    { id: 'dasakhleba', kind: 'entry', label: 'Settlement entry', draw: ({ name, alt }) => town(name, alt, false) },
    { id: 'dasasruli', kind: 'exit', label: 'Settlement exit', draw: ({ name, alt }) => town(name, alt, true) },
    // blue direction sign: the place and the next town, each in Georgian capitals over Latin, road plate, arrow
    { id: 'mimartuleba', kind: 'direction', label: 'Direction sign (blue)', draw: ({ name, alt, next, road }) => {
      const rows = [[mtav(name), latin(name, alt)], [mtav(next), latin(next)]];
      const H = 70 + rows.length * 150;
      let y = 40, body = '';
      for (const [ka, la] of rows) {
        y += 70; body += T(54, y, ka, 76, FG, { fill: '#fff', weight: 600, anchor: 'start', ls: 0.14, maxw: 430, max: 76 });
        y += 76; body += T(54, y, la, 74, F, { fill: '#fff', weight: 600, anchor: 'start', ls: 0.1, maxw: 430, max: 74 });
      }
      return svg(700, H, `<rect x="1" y="1" width="698" height="${H - 2}" rx="12" fill="${BL}" stroke="#c9d6e8" stroke-width="2"/>` + body +
        `<rect x="534" y="22" width="140" height="92" rx="12" fill="none" stroke="#fff" stroke-width="5"/>` + T(604, 94, mtav(road), 72, FG, { fill: '#fff', weight: 600, ls: 0.06, maxw: 116, max: 72 }) +
        `<g transform="translate(616,${Math.min(206, H / 2 + 10)}) rotate(45)"><path d="M-14,62 L-14,0 L-40,0 L0,-48 L40,0 L14,0 L14,62 Z" fill="#fff"/></g>`); } },
    // motorway advance sign: the place straight on (white, motorway symbol), the next town off to the right in a
    // blue field with its road plate; Georgian only, as on the picture
    // (group D: motorway pictogram and the optional E-road plate from shared/shields.js)
    { id: 'avtomagistrali', kind: 'motorway', label: 'Motorway advance sign (green)', draw: ({ name, next, road, eroad }) => svg(700, 420,
      `<rect x="1" y="1" width="698" height="418" rx="10" fill="${GR}" stroke="#d8ead8" stroke-width="2"/>` +
      `<path d="M74,412 L74,70" stroke="#fff" stroke-width="22"/><path d="M74,16 L40,72 L108,72 Z" fill="#fff"/>` +
      `<path d="M85,310 L150,310" stroke="#fff" stroke-width="22"/><path d="M190,310 L146,284 L146,336 Z" fill="#fff"/>` +
      (eroad ? TS.shields.ePlate(148, 70, 82, 42, eroad, { field: GR, font: F, weight: 500, cap: 0.56, sw: 0.07, rx: 0.16 }) : '') +
      T(eroad ? 250 : 180, 108, name, 66, FG, { fill: '#fff', weight: 600, anchor: 'start', maxw: eroad ? 310 : 380, max: 66 }) +
      TS.shields.motorway(586, 40, 96, { style: 'ge' }) +
      `<rect x="202" y="284" width="98" height="52" rx="5" fill="${BL}" stroke="#fff" stroke-width="3"/>` + T(251, 324, road, 38, FG, { fill: '#fff', weight: 600, maxw: 84, max: 38 }) +
      `<rect x="322" y="268" width="300" height="84" rx="6" fill="${BL}" stroke="#fff" stroke-width="3"/>` + T(472, 324, next, 52, FG, { fill: '#fff', weight: 600, maxw: 270, max: 52 })) },
  ];

  TS.add('GE', ge, { next: 'ქუთაისი', road: 'ს1' });
})();
