// JP: Japan's signs that carry a place name, drawn after the GeoHints pictures (city-signs 14, direction-signs 50-51) and,
// for designs GeoHints lacks, Commons pictures (refs/JP). examples/JP.json says which picture each follows.
// name = the kanji form (the city quiz's local name), alt = the romaji line. Hepburn romaji cannot be derived from kanji,
// so every template needs alt and draws the kanji alone without it.
(function () {
  const { T, svg } = TS;
  const JF = "'Noto Sans JP',sans-serif";
  const BLUE = '#1b5fb5', GREEN = '#0d5e30', WH = '#fff';
  // advance widths (1/1000 em) of Noto Sans JP's Latin at weights 500 and 700, measured in Firefox; kanji and kana are 1 em
  const mk = (chars, w) => { const m = {}; [...chars].forEach((c, i) => (m[c] = w[i])); m._avg = w.reduce((a, b) => a + b, 0) / w.length; return m; };
  const TAB = {
    jp5: mk("0123456789 !&'()+,-./:;?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝßàáâãäåçèéêëìíîïñòóôõöøùúûüýÿŒœŸ’–ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŹźŻżŽžſ", [570,570,570,570,570,570,570,570,570,570,225,343,706,298,356,356,570,298,357,298,390,298,298,492,622,667,646,699,600,566,701,741,309,549,664,558,830,734,754,648,754,656,608,611,733,594,894,596,553,607,575,629,517,630,566,346,578,621,288,289,575,298,943,624,615,630,630,409,480,396,620,545,829,526,544,491,622,622,622,622,622,622,646,600,600,600,600,309,309,309,309,734,754,754,754,754,754,754,733,733,733,733,553,668,575,575,575,575,575,575,517,566,566,566,566,288,288,288,288,624,615,615,615,615,615,615,620,620,620,620,544,544,962,938,722,298,540,622,575,622,575,722,444,667,444,667,444,667,444,667,444,722,605,725,630,600,566,611,444,611,444,611,444,600,566,722,500,722,500,722,500,722,500,722,500,722,500,309,288,309,288,333,278,333,278,333,278,722,556,389,278,722,500,500,611,278,611,278,611,400,611,355,611,278,734,624,722,500,734,624,500,722,500,754,615,754,615,722,500,667,333,667,333,667,333,556,389,556,389,556,389,556,389,611,278,611,440,611,278,733,620,733,620,733,620,722,500,722,500,722,500,944,722,722,500,611,444,611,444,611,444,333]),
    jp7: mk("0123456789 !&'()+,-./:;?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝßàáâãäåçèéêëìíîïñòóôõöøùúûüýÿŒœŸ’–ĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŹźŻżŽžſ", [590,590,590,590,590,590,590,590,590,590,227,370,740,325,378,378,590,325,370,325,387,325,325,514,641,681,656,714,615,585,717,757,330,568,686,578,853,749,770,667,770,682,624,625,748,619,915,627,580,613,591,644,527,644,581,372,597,640,304,306,604,315,964,641,626,644,644,437,495,421,637,576,863,562,574,511,641,641,641,641,641,641,656,615,615,615,615,330,330,330,330,749,770,770,770,770,770,770,748,748,748,748,580,700,591,591,591,591,591,591,527,581,581,581,581,304,304,304,304,641,626,626,626,626,626,626,637,637,637,637,574,574,981,938,722,325,544,641,591,641,591,722,500,722,444,722,444,722,444,722,444,722,715,742,644,615,581,667,444,667,444,667,444,615,581,778,500,778,500,778,500,778,500,778,556,778,556,330,304,330,304,389,278,389,278,389,278,889,611,500,333,778,556,556,667,278,667,278,667,445,667,405,667,278,749,641,722,556,749,641,556,722,556,770,626,770,626,778,500,722,444,722,444,722,444,556,389,556,389,556,389,556,389,667,333,667,565,667,333,748,637,748,637,748,637,722,556,722,556,722,556,1000,722,722,500,667,444,667,444,667,444,333]),
  };
  const wide = (c) => /[⺀-鿿豈-﫿＀-￯]/.test(c);
  const em = (s, f = 'jp5') => [...String(s)].reduce((a, c) => a + (wide(c) ? 1000 : TAB[f][c] ?? TAB[f]._avg), 0) / 1000;
  const CAP = 0.737;   // cap height of Noto Sans JP's Latin, in em
  const len = (s) => [...s].length;

  // a kanji name centred on x: two-character names are spread apart as on general-road signs (direction-signs 50:
  // 池 袋, 渋 谷), by `gap` em; TS.fitDOM narrows it to maxw
  const kanji = (x, y, s, size, maxw, { fill = WH, gap = 0, weight = '500', anchor = 'middle' } = {}) => {
    const ls = len(s) === 2 ? gap : 0, z = Math.min(size, maxw / (em(s) + ls * len(s)));
    const dx = anchor === 'middle' ? (ls * z) / 2 : 0;   // letter spacing also follows the last character; keep the name centred
    return T(x + dx, y, s, z, JF, { fill, weight, ls, anchor, maxw, max: size });
  };
  // the romaji line
  const roma = (x, y, s, cap, maxw, { fill = WH, weight = '500', anchor = 'middle' } = {}) => {
    const f = weight === '700' ? 'jp7' : 'jp5', z0 = cap / CAP, z = Math.min(z0, maxw / em(s, f));
    return T(x, y, s, z, JF, { fill, weight, anchor, maxw, max: z0 });
  };
  // solid arrow: shaft from (x0,y0) to the head's base, triangular head of length hl and half-width hw
  const arrow = (x0, y0, x1, y1, sw, hl, hw, fill = WH) => {
    const n = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / n, uy = (y1 - y0) / n, bx = x1 - ux * hl, by = y1 - uy * hl;
    return `<path d="M${x0},${y0} L${bx},${by}" stroke="${fill}" stroke-width="${sw}"/>` +
      `<polygon points="${x1},${y1} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}" fill="${fill}"/>`;
  };
  // national route shield (road-number-signs 82, 84): rounded inverted triangle, white edge, number
  const shield = (cx, cy, h, road, bg = BLUE) => {
    const w = h * 1.04, t = cy - h / 2, b = cy + h / 2, z = h * (len(road) > 2 ? 0.38 : 0.5);
    return `<path d="M${cx - w / 2},${t + h * 0.18} Q${cx - w / 2},${t} ${cx - w * 0.3},${t} L${cx + w * 0.3},${t} Q${cx + w / 2},${t} ${cx + w / 2},${t + h * 0.18} Q${cx + w * 0.42},${t + h * 0.6} ${cx + w * 0.08},${b - h * 0.02} Q${cx},${b + h * 0.03} ${cx - w * 0.08},${b - h * 0.02} Q${cx - w * 0.42},${t + h * 0.6} ${cx - w / 2},${t + h * 0.18} Z" fill="${WH}"/>` +
      `<path transform="translate(${cx},${cy}) scale(0.88) translate(${-cx},${-cy})" d="M${cx - w / 2},${t + h * 0.18} Q${cx - w / 2},${t} ${cx - w * 0.3},${t} L${cx + w * 0.3},${t} Q${cx + w / 2},${t} ${cx + w / 2},${t + h * 0.18} Q${cx + w * 0.42},${t + h * 0.6} ${cx + w * 0.08},${b - h * 0.02} Q${cx},${b + h * 0.03} ${cx - w * 0.08},${b - h * 0.02} Q${cx - w * 0.42},${t + h * 0.6} ${cx - w / 2},${t + h * 0.18} Z" fill="${bg}"/>` +
      T(cx, t + h * 0.47 + z * 0.36, road, z, JF, { fill: WH, weight: '700' });
  };
  // the municipality as its boundary sign writes it: 横浜 -> 横浜市 / Yokohama City (every place of the city quiz is a city;
  // 東京 is written 東京都 / Tokyo Metropolis)
  const SUF = { 市: 'City', 町: 'Town', 村: 'Village', 区: 'City', 都: 'Metropolis' };
  const muni = (name, alt) => {
    const full = /[市町村区都道府県]$/.test(name) ? name : name === '東京' ? '東京都' : name + '市';
    const tail = SUF[full.slice(-1)];
    return { full, roma: alt ? (/\b(City|Town|Village|Metropolis)$/.test(alt) || !tail ? alt : `${alt} ${tail}`) : '' };
  };

  const jp = [
    { id: 'shichoson', kind: 'entry', label: 'Municipal boundary sign', needs: ['alt'], draw: ({ name, alt }) => {
      // Commons "Japan road sign 101": white, blue edge line, the municipality in kanji over its romaji
      const m = muni(name, alt), W = 960, H = 551, ky = m.roma ? 306 : 345, kz = Math.min(255, 790 / em(m.full));
      return svg(W, H, `<rect width="${W}" height="${H}" rx="40" fill="${WH}" stroke="#d6d6d6" stroke-width="2"/><rect x="33" y="33" width="${W - 66}" height="${H - 66}" rx="44" fill="none" stroke="${BLUE}" stroke-width="13"/>` +
        kanji(W / 2, ky, m.full, kz, 790, { fill: BLUE }) + (m.roma ? roma(W / 2, 457, m.roma, 86, 740, { fill: BLUE }) : ''));
    } },
    { id: 'chimei', kind: 'hamlet', label: 'Place-name sign (Hokkaido)', regions: ['Hokkaido'], needs: ['alt'], draw: ({ name, alt, district }) => {
      // city-signs 14 (沙留 Saruru, 興部町): white, blue edge line, the kanji spread over the width, romaji below,
      // the municipality small at the top left
      const W = 640, H = 400, n = len(name), ky = alt ? 212 : 245;
      const body = n <= 3
        ? [...name].map((c, i) => T([[320], [183, 452], [150, 320, 490]][n - 1][i], ky, c, n === 3 ? 118 : 132, JF, { fill: BLUE, weight: '500' })).join('')
        : kanji(320, ky, name, 118, 500, { fill: BLUE });
      return svg(W, H, `<rect width="${W}" height="${H}" rx="10" fill="#eef2f5" stroke="#c9ced3" stroke-width="2"/><rect x="42" y="25" width="556" height="340" rx="16" fill="none" stroke="${BLUE}" stroke-width="5"/>` +
        (district ? T(72, 88, district, 52, JF, { fill: '#4b5056', weight: '500', anchor: 'start', maxw: 300, max: 52 }) : '') +
        body + (alt ? roma(320, 307, alt, 50, 480, { fill: BLUE }) : ''));
    } },
    { id: 'houmen', kind: 'direction', label: 'Direction sign (blue)', needs: ['alt'], draw: ({ name, alt, road }) => {
      // direction-signs 50: the destination ahead over the arrow, a crossing road to the right with its route shield
      const W = 640, H = 640, cx = Math.max(250, Math.min(320, 40 + (em(name) * 75 * (len(name) === 2 ? 1.3 : 1)) / 2));
      return svg(W, H, `<rect width="${W}" height="${H}" rx="6" fill="${BLUE}" stroke="#e5e5e5" stroke-width="3"/>` +
        kanji(cx, alt ? 94 : 112, name, 75, 2 * Math.min(cx, W - cx) - 60, { gap: 0.6 }) + (alt ? roma(cx, 134, alt, 27, 2 * Math.min(cx, W - cx) - 60) : '') +
        arrow(250, 522, 250, 152, 40, 64, 37) + arrow(230, 397, 592, 397, 40, 62, 37) +
        shield(440, 305, 96, String(road)) + roma(250, 604, '300m', 49, 300));
    } },
    { id: 'houmen-kyori', kind: 'direction', label: 'Distance sign (blue)', needs: ['alt'], draw: ({ name, alt, km }) => {
      // Commons "Japanese Road sign 105-A", one row: arrow, the destination and its distance, romaji below
      const W = 960, H = 280, k = String(km), kw = em(k) * 136 + em('km') * 75, x1 = 240, x2 = W - 80 - kw - 30, kc = (x1 + x2) / 2;
      return svg(W, H, `<rect width="${W}" height="${H}" rx="4" fill="${BLUE}" stroke="#e5e5e5" stroke-width="4"/>` +
        arrow(140, 200, 140, 50, 40, 62, 56) +
        kanji(kc, alt ? 192 : 206, name, 160, x2 - x1, { gap: 0.5 }) + (alt ? roma(kc, 247, alt, 37, x2 - x1 + 60) : '') +
        T(W - 80 - em('km') * 75, 159, k, 136, JF, { fill: WH, weight: '500', anchor: 'end' }) + T(W - 80, 159, 'km', 75, JF, { fill: WH, weight: '500', anchor: 'end' }));
    } },
    { id: 'kosoku', kind: 'motorway', label: 'Expressway junction sign (green)', needs: ['alt'], draw: ({ name, alt, road }) => {
      // direction-signs 51: destination ahead, a loop ramp to the left (here marked by its route shield), distance
      const W = 640, H = 640;
      return svg(W, H, `<rect width="${W}" height="${H}" rx="6" fill="${GREEN}" stroke="#e5e5e5" stroke-width="3"/>` +
        kanji(372, alt ? 94 : 110, name, 64, 540) + (alt ? roma(372, 135, alt, 27, 460, { weight: '700' }) : '') +
        arrow(372, 562, 372, 155, 22, 42, 25) +
        `<path d="M366,337 A47,47 0 1 0 325.2,397.4 L352,399 M272.3,375.5 C260,398 248,421 222,423" fill="none" stroke="${WH}" stroke-width="22"/>` + arrow(222, 423, 176, 425, 0.1, 46, 27) +
        shield(100, 428, 92, String(road), GREEN) + roma(386, 612, '300m', 36, 200, { weight: '700', anchor: 'start' }));
    } },
    { id: 'deguchi', kind: 'motorway', label: 'Expressway exit sign (green)', needs: ['alt'], draw: ({ name, alt, exit }) => {
      // Commons "Japanese Road sign (Exit A)": 出口 EXIT with the exit arrow, and below the exit number and its town
      const W = 960, H = 780, e = String(exit);
      return svg(W, H, `<rect x="0" y="0" width="${W}" height="500" fill="${GREEN}"/><rect x="0" y="520" width="${W}" height="260" fill="${GREEN}"/>` +
        arrow(360, 360, 78, 78, 42, 120, 75) + T(660, 285, '出口', 205, JF, { fill: WH, weight: '500' }) + T(660, 402, 'EXIT', 118, JF, { fill: WH, weight: '500' }) +
        `<rect x="14" y="534" width="344" height="232" fill="${WH}"/>` + T(186, 650 + 0.36 * 150, e, 150, JF, { fill: GREEN, weight: '700', maxw: 300, max: 150 }) +
        kanji(660, alt ? 658 : 690, name, 118, 540, { gap: 0.5 }) + (alt ? roma(660, 752, alt, 45, 540) : ''));
    } },
  ];

  TS.add('JP', jp, { road: '20', km: 4, exit: 4 });
})();
