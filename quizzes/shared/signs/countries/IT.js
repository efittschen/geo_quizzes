// IT: Italian signs carrying a place name, drawn after the GeoHints pictures (see examples/IT.json for which).
(function () {
  const { T, svg } = TS;
  // lettering: CCRIGE (a Transport derivative like Italy's Alfabeto normale) for names that fit, Archivo Narrow Bold for the
  // Alfabeto stretto that long names take; cap heights differ, so sizes are given as cap height / font cap ratio
  const NORM = "'CCRIGE','Arimo',sans-serif", NORM_CAP = 0.40, NORM_W = 0.378, NORM_LW = 0.301;   // cap height, mean width of capitals, of lower case (em)
  const STR = "'Archivo Narrow','Roboto Condensed',sans-serif", STR_CAP = 0.686, STR_W = 0.499;
  const BLUE = '#00408b', GREEN = '#01782b', RED = '#e2001a';
  // capitals as printed; CCRIGE lacks Ì and Ù, which Italian signs often write as I' U' anyway (FORLI')
  const up = (s, norm) => { const u = s.toUpperCase(); return norm ? u.replace(/Ì/g, "I'").replace(/Ù/g, "U'") : u; };
  const len = (s) => [...s].length;
  // best cut of a name into two lines, at a space or after a hyphen (the shorter longest line wins)
  const split2 = (s) => {
    const cuts = [];
    for (let i = 1; i < s.length; i++) { if (s[i] === ' ') cuts.push([s.slice(0, i), s.slice(i + 1)]); else if (s[i - 1] === '-') cuts.push([s.slice(0, i), s.slice(i)]); }
    return cuts.length ? cuts.reduce((b, c) => (Math.max(len(c[0]), len(c[1])) < Math.max(len(b[0]), len(b[1])) ? c : b)) : [s];
  };
  // a name in capitals: normal alphabet while it fits (up to `n` letters), else stretto; split in two lines when long and it can be
  const nameRows = (name, n = 10, wrap = true) => {
    const lines = wrap && len(name) > n + 2 ? split2(name) : [name];
    const norm = Math.max(...lines.map(len)) <= n;
    return lines.map((l) => ({ text: up(l, norm), font: norm ? NORM : STR, cap: norm ? NORM_CAP : STR_CAP, w: norm ? NORM_W : STR_W, n: lines.length }));
  };
  // one capital line with cap height `cap` (px), anchored as given; the lines of one name share one size (`rows` given: the
  // size their longest line allows in maxw, estimated from mean letter widths; TS.fitDOM then fits each exactly)
  const capLine = (x, y, r, cap, opts, rows) => {
    let size = cap / r.cap;
    if (rows && opts.maxw) size = Math.min(size, ...rows.map((q) => opts.maxw / (len(q.text) * q.w * 1.03)));
    return T(x, y, r.text, size, r.font, { max: size, weight: r.font === STR ? 'bold' : 'normal', ...opts });
  };
  // lines of mixed-case text at one shared size (mean letter width w em)
  const uni = (lines, maxw, max, w) => Math.min(max, maxw / (Math.max(...lines.map(len)) * w * 1.03));

  // white town plate (II.273 look): grey rim, black inner line; rows of names, district line in lower case
  const plate = ({ name, alt, district }, exit) => {
    const rows = [...nameRows(name), ...(alt ? nameRows(alt) : [])];
    const W = 640, rowH = rows.length > 1 ? 104 : 120, dH = district ? 52 : 0;
    const H = Math.round(rows.length * rowH + dH + (rows.length > 1 ? 70 : 82));
    let y = (H - rows.length * rowH - dH) / 2, body = '';
    const nr = nameRows(name);
    for (const r of rows) { const cap = rows.length > 1 ? 58 : r.font === STR ? 74 : 64; body += capLine(W / 2, y + (rowH + cap) / 2, r, cap, { maxw: 560, extra: r.font === NORM ? 'stroke="#000" stroke-width="2.4"' : '' }, rows.indexOf(r) < nr.length ? nr : null); y += rowH; }
    if (district) body += T(W / 2, y + 26, `(frazione di ${district})`, 25 / NORM_CAP, NORM, { maxw: 520, max: 25 / NORM_CAP });
    const bar = exit ? `<clipPath id="it-x"><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="12"/></clipPath><path d="M0,${H - 40} L${W},${4} L${W},${44} L0,${H} Z" fill="${RED}" clip-path="url(#it-x)"/>` : '';
    return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18" fill="#fff" stroke="#b9b9b9" stroke-width="2"/>${bar}<rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="13" fill="none" stroke="#000" stroke-width="4"/>` + body);
  };
  // motorway number shield: arched top and bottom, sides pointed outwards
  const shield = (x, y, w, h, label, fill, line, ink) =>
    `<path d="M${x + 0.08 * w},${y + 0.07 * h} Q${x + w / 2},${y - 0.05 * h} ${x + 0.92 * w},${y + 0.07 * h} L${x + w},${y + h / 2} L${x + 0.92 * w},${y + 0.93 * h} Q${x + w / 2},${y + 1.05 * h} ${x + 0.08 * w},${y + 0.93 * h} L${x},${y + h / 2} Z" fill="${fill}" stroke="${line}" stroke-width="${(h * 0.05).toFixed(1)}"/>` +
    T(x + w / 2, y + h * 0.72, label, h * 0.5 / STR_CAP, STR, { fill: ink, weight: 'bold', maxw: w * 0.8, max: h * 0.5 / STR_CAP });
  // white block arrow parts (shaft width s), as on the GeoHints drawings
  const head = (x, y, dir, s, fill) => { const L = s * 3.2, B = s * 1.6, r = { up: 0, right: 90, left: -90, down: 180 }[dir]; return `<path transform="translate(${x},${y}) rotate(${r})" d="M0,0 L${B},${L} L${-B},${L} Z" fill="${fill}"/>`; };
  const frame = (W, H, bg, line = '#fff', rx = 26) => `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="${rx + 4}" fill="${bg}"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="${rx}" fill="none" stroke="${line}" stroke-width="7"/>`;

  const it = [
    { id: 'inizio', kind: 'entry', label: 'Town entry', draw: (o) => plate(o, false) },
    { id: 'fine', kind: 'exit', label: 'Town exit', draw: (o) => plate(o, true) },
    { id: 'frazione', kind: 'hamlet', label: 'Village entry (frazione)', needs: ['district'], draw: (o) => plate(o, false) },
    { id: 'conferma', kind: 'direction', label: 'Distance sign (blue)', draw: ({ name, next, km }) => {
      const W = 640, H = 250, rows = [[name, km], [next, km + 14]];
      return svg(W, H, frame(W, H, BLUE) + rows.map(([n, d], i) => {
        const y = 102 + i * 100, r = nameRows(n, 10, false)[0];
        return capLine(40, y, r, 50, { anchor: 'start', fill: '#fff', maxw: 430 }) + T(604, y, String(d), 50 / NORM_CAP, NORM, { anchor: 'end', fill: '#fff' });
      }).join(''));
    } },
    { id: 'autostrada', kind: 'motorway', label: 'Motorway direction (green)', draw: ({ name, next, road }) => {
      const W = 640, H = 480, a = nameRows(name, 9, false)[0], b = nameRows(next, 9, false)[0];
      return svg(W, H, frame(W, H, GREEN) + shield(64, 45, 78, 76, road, GREEN, '#fff', '#fff') + capLine(182, 106, a, 54, { anchor: 'start', fill: '#fff', maxw: 420 }) +
        `<path d="M102,440 L102,190 M102,410 L102,388 Q102,340 150,340 L178,340" fill="none" stroke="#fff" stroke-width="26"/>` + head(102, 152, 'up', 26, '#fff') + head(230, 340, 'right', 26, '#fff') +
        capLine(262, 368, b, 54, { anchor: 'start', fill: '#fff', maxw: 340 }));
    } },
    { id: 'urbano', kind: 'direction', label: 'Town junction sign (white)', defaults: { road: 'SS 9' }, draw: ({ name, next, road }) => {
      const W = 640, H = 400;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="30" fill="#fff"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="24" fill="none" stroke="#000" stroke-width="9"/>` +
        `<rect x="130" y="28" width="362" height="112" fill="${GREEN}"/>` + T(311, 73, 'tangenziale', 76, NORM, { fill: '#fff', maxw: 300, max: 76 }) + T(144, 120, 'autostrade', 76, NORM, { fill: '#fff', anchor: 'start', maxw: 212, max: 76 }) +
        shield(372, 89, 46, 42, 'A1', GREEN, '#fff', '#fff') + shield(430, 89, 46, 42, 'A13', GREEN, '#fff', '#fff') +
        (len(next) > 9 ? split2(next) : [next]).map((l, i, a) => { const z = uni(a, 168, a.length > 1 ? 72 : 86, NORM_LW); return T(32, 248 - (a.length - 1 - i) * 36, l, z, NORM, { anchor: 'start', maxw: 168, max: z }); }).join('') + T(90, 334, 'centro', 80, NORM, { anchor: 'start', maxw: 120, max: 80 }) +
        `<circle cx="50" cy="322" r="16" fill="none" stroke="#000" stroke-width="5"/><circle cx="50" cy="322" r="9" fill="none" stroke="#000" stroke-width="3"/><circle cx="50" cy="322" r="3.5" fill="#000"/>` +
        `<path d="M300,366 L300,318" stroke="#000" stroke-width="16" fill="none"/><circle cx="302" cy="270" r="30" fill="none" stroke="#000" stroke-width="14"/>` +
        `<path d="M274,262 L232,262 M330,262 L372,262 M302,240 L302,200" stroke="#000" stroke-width="14" fill="none"/>` + head(198, 262, 'left', 14, '#000') + head(408, 262, 'right', 14, '#000') + head(302, 164, 'up', 14, '#000') +
        (() => { const rows = nameRows(name, 9), y0 = rows.length > 1 ? 212 : 228, h = rows.length > 1 ? 118 : 84;
          return `<rect x="425" y="${y0}" width="190" height="${h}" fill="${BLUE}"/>` + rows.map((r, i) => capLine(520, y0 + 36 + i * 34, r, 26, { fill: '#fff', maxw: 176 }, rows)).join('') +
            `<rect x="548" y="${y0 + h - 34}" width="56" height="24" rx="4" fill="${BLUE}" stroke="#fff" stroke-width="2.5"/>` + T(576, y0 + h - 16, road, 15 / STR_CAP, STR, { fill: '#fff', weight: 'bold', maxw: 48, max: 15 / STR_CAP }); })());
    } },
    { id: 'preavviso', kind: 'direction', label: 'Junction advance sign (blue)', draw: ({ name, next }) => {
      const W = 640, H = 400, a = nameRows(name, 12, false)[0];
      return svg(W, H, frame(W, H, BLUE) + capLine(W / 2, 92, a, 38, { fill: '#fff', maxw: 560 }) +
        `<path d="M400,366 L400,190 M400,326 Q400,286 352,282 L300,282" fill="none" stroke="#fff" stroke-width="24"/>` + head(400, 150, 'up', 24, '#fff') + head(262, 282, 'left', 24, '#fff') +
        nameRows(next, 9).map((r, i, a) => capLine(36, 300 - (a.length - 1 - i) * 52, r, 38, { anchor: 'start', fill: '#fff', maxw: 210 }, a)).join(''));
    } },
  ];

  TS.add('IT', it, { next: 'Latina', km: 7, road: 'A1' });
})();
