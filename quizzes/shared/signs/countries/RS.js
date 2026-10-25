// RS: Serbian signs carrying a place name, drawn after the GeoHints pictures (see examples/RS.json for which).
// Names in Cyrillic (name) over Latin (alt); without alt the Latin line is computed (helper srLat: Serbian Cyrillic to
// Gaj's Latin, one letter for one: ђ đ, ж ž, ј j, љ lj, њ nj, ћ ć, ц c, ч č, џ dž, ш š).
(function () {
  const { T, svg } = TS;
  // ---- ex-Yugoslav kit (same block in ME, MK, RS, HR, SI) ----
  // DIN 1451 look: DINish SemiBold (Mittelschrift), DINish Condensed SemiBold (Engschrift); cap height 0.69 em;
  // mean letter widths (em) for estimating sizes: Latin lower case, capitals, Cyrillic
  // (Serbia: DINish SR, DINish with the sign Cyrillic: Λ-shaped Л, Δ-shaped Д on an overhanging bar, Љ built on that Λ)
  const F = "'DINish SR','DINish','Roboto Condensed',sans-serif", FC = "'DINish Condensed','Roboto Condensed',sans-serif", CAP = 0.69;
  const W_ = { F: { l: 0.433, u: 0.508, c: 0.487 }, FC: { l: 0.349, u: 0.393, c: 0.397 } };
  const YEL = '#f5c400', BLUE = '#1d4f9c', GREEN = '#00845a', RED = '#d9161c';
  const len = (s) => [...String(s)].length;
  const wOf = (s, cond) => { const k = cond ? W_.FC : W_.F; return /[Ѐ-ӿ]/.test(s) ? k.c : s === s.toUpperCase() ? k.u : k.l; };
  // best cut of a name into two lines, at a space or after a hyphen
  const split2 = (s) => {
    const cuts = [];
    for (let i = 1; i < s.length; i++) { if (s[i] === ' ') cuts.push([s.slice(0, i), s.slice(i + 1)]); else if (s[i - 1] === '-') cuts.push([s.slice(0, i), s.slice(i)]); }
    return cuts.length ? cuts.reduce((b, c) => (Math.max(len(c[0]), len(c[1])) < Math.max(len(b[0]), len(b[1])) ? c : b)) : [s];
  };
  // the width a text takes at cap height `cap`
  const est = (s, cap, cond) => len(s) * wOf(s, cond) * 1.03 * cap / CAP;
  // one text line: cap height `cap`, shrunk only if it would pass maxw (TS.fitDOM then fits it in the real font)
  // (o.ls: letter spacing in em, as on the widely spaced Serbian motorway lettering)
  const tx = (x, y, s, cap, maxw, o = {}) => { const z = Math.min(cap / CAP, maxw / (len(s) * (wOf(s, o.cond) + (o.ls || 0)) * 1.03)); return T(x, y, s, z, o.cond ? FC : F, { weight: 600, maxw, max: z, anchor: o.anchor || 'start', fill: o.fill || '#000', ls: o.ls || 0 }); };
  // lines sharing one size
  const txs = (x, y0, dy, ls, cap, maxw, o = {}) => { const z = Math.min(cap / CAP, ...ls.map((s) => maxw / (len(s) * (wOf(s, o.cond) + (o.ls || 0)) * 1.03))); return ls.map((s, i) => T(x, y0 + i * dy, s, z, o.cond ? FC : F, { weight: 600, maxw, max: z, anchor: o.anchor || 'middle', fill: o.fill || '#000', ls: o.ls || 0 })).join(''); };
  // block arrow (triangular head, straight shaft) centred on (x, y), pointing left/right/up/down, overall length s
  const barrow = (x, y, dir, s, fill) => { const r = { right: 0, left: 180, up: -90, down: 90, upright: -45 }[dir]; return `<path transform="translate(${x},${y}) rotate(${r})" d="M${s / 2},0 L${s / 2 - s * 0.42},${-s * 0.36} L${s / 2 - s * 0.42},${-s * 0.13} L${-s / 2},${-s * 0.13} L${-s / 2},${s * 0.13} L${s / 2 - s * 0.42},${s * 0.13} L${s / 2 - s * 0.42},${s * 0.36} Z" fill="${fill}"/>`; };
  // town plate: framed (entry) or unframed; one line widened up to 1.5x, else two lines; optional red bar (exit);
  // fw frame width, sp letter spacing (em), lg line pitch (cap heights)
  const townPlate = ({ rows, bg = YEL, ink = '#000', frame = true, exit = false, cap = 84, H0 = 300, fw = 9, sp = 0, lg = 1.42 }) => {
    let W = 640, ls = rows;
    const need = Math.max(...ls.map((s) => est(s, cap) * (1 + sp / 0.45))) + 110;
    if (need > W) W = Math.min(960, Math.round(need));
    if (ls.length === 1 && need > 960 && split2(ls[0]).length > 1) ls = split2(ls[0]);
    const H = ls.length > 1 ? H0 + (ls.length - 1) * cap * 1.25 - 20 : H0, gap = cap * lg;
    const y0 = H / 2 - ((ls.length - 1) * gap) / 2 + cap / 2;
    const bar = exit ? `<clipPath id="yu-x"><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="14"/></clipPath><path d="M0,${H - 22} L${W},${8} L${W},${40} L0,${H + 10} Z" fill="${RED}" clip-path="url(#yu-x)"/>` : '';
    return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="20" fill="${bg}" stroke="#bbb" stroke-width="1.5"/>` +
      (frame ? `<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="14" fill="none" stroke="${ink}" stroke-width="${fw}"/>` : '') +
      txs(W / 2, y0, gap, ls, cap, W - 90, { fill: ink, ls: sp }) + bar);
  };
  // arrow-shaped plate pointing right: rectangle + point; tip: 'black' (filled black point, yellow signs) or 'line' (outline only)
  const arrowPlate = (W, H, bg, edge) => {
    const P = H * 0.62;
    return `<path d="M3,3 L${W - P},3 L${W - 3},${H / 2} L${W - P},${H - 3} L3,${H - 3} Z" fill="${edge}" stroke="${bg}" stroke-width="5" stroke-linejoin="round"/>` +
      `<path d="M13,12 L${W - P - 6},12 C${W - P + P * 0.38},${H * 0.28} ${W - P + P * 0.5},${H * 0.42} ${W - P + P * 0.56},${H / 2} C${W - P + P * 0.5},${H * 0.58} ${W - P + P * 0.38},${H * 0.72} ${W - P - 6},${H - 12} L13,${H - 12} Z" fill="${bg}"/>`;
  };
  // a plate width that holds the longest text at full size next to `fixed` px of other parts, from base up to 1.5x base
  const grow = (base, texts, cap, cond, fixed, sp = 0) => Math.round(Math.max(base, Math.min(base * 1.5, Math.max(...texts.map((t) => est(t, cap, cond) * (1 + sp / 0.45))) + fixed)));
  // ---- end of kit ----
  const SRL = { А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Ђ: 'Đ', Е: 'E', Ж: 'Ž', З: 'Z', И: 'I', Ј: 'J', К: 'K', Л: 'L', Љ: 'Lj', М: 'M', Н: 'N', Њ: 'Nj', О: 'O', П: 'P', Р: 'R', С: 'S', Т: 'T', Ћ: 'Ć', У: 'U', Ф: 'F', Х: 'H', Ц: 'C', Ч: 'Č', Џ: 'Dž', Ш: 'Š' };
  const srLat = (s) => { const a = [...String(s)]; return a.map((c, i) => { const m = SRL[c.toUpperCase()]; if (!m) return c; if (c !== c.toUpperCase()) return m.toLowerCase(); const nx = a[i + 1]; return m.length > 1 && nx && nx !== nx.toLowerCase() ? m.toUpperCase() : m; }).join(''); };
  const lat = (name, alt) => alt || srLat(name);
  const YEL_RS = '#f9c200', INK = '#1d1d1b', NAVY = '#1f2b45';
  const head = (x, y, deg, w, fill) => `<path transform="translate(${x},${y}) rotate(${deg})" d="M0,0 L${-w * 1.7},${-w} L${-w * 1.7},${w} Z" fill="${fill}"/>`;
  const roadPlate = (x, y, w, h, label) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#fff" stroke-width="3"/>` +
    T(x + w / 2, y + h * 0.8, label, h * 0.7 / CAP, F, { weight: 600, fill: '#fff', maxw: w * 0.86, max: h * 0.7 / CAP });

  const rs = [
    // (lettering as on 131/132: cap 89 on a 640 x 400 plate, slightly spaced, lines 1.63 caps apart)
    { id: 'entry', kind: 'entry', label: 'Town entry', draw: ({ name, alt }) => townPlate({ rows: [name, lat(name, alt)], bg: YEL_RS, cap: 89, H0: 310, sp: 0.03, lg: 1.63 }) },
    { id: 'exit', kind: 'exit', label: 'Town exit', draw: ({ name, alt }) => townPlate({ rows: [name, lat(name, alt)], bg: YEL_RS, cap: 89, H0: 310, sp: 0.03, lg: 1.63, exit: true }) },
    { id: 'roundabout-yellow', kind: 'direction', label: 'Roundabout sign (yellow)', draw: ({ name, alt, next }) => {
      const W = 640, H = 480, cx = 450, cy = 278;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="6" fill="${YEL_RS}"/><rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="10" fill="none" stroke="${INK}" stroke-width="4"/>` +
        `<path d="M${cx - 20},${H - 40} L${cx - 20},${cy + 67} A70,70 0 1 0 ${cx - 50},${cy + 49}" fill="none" stroke="${NAVY}" stroke-width="15"/>` +
        `<path d="M${cx},${cy - 70} L${cx},${cy - 112} M${cx - 18},${cy - 112} L${cx + 18},${cy - 112} M${cx + 53.6},${cy - 45} L${cx + 84},${cy - 70.7} M${cx + 72.4},${cy - 84.5} L${cx + 95.6},${cy - 56.9}` +
        `" stroke="${NAVY}" stroke-width="13" fill="none"/>` +
        // GeoHints 195: the two exits start on the ring and end in long heads with swept-back barbs (TS.arrows)
        TS.arrows.group([{ pts: [[cx - 44, cy - 44], [cx - 113, cy - 113]] }, { pts: [[cx - 62, cy], [cx - 152, cy]] }], { w: 13, fill: NAVY, head: { half: 1.85, back: 3.7, neck: 2.9 } }) +
        pair(170, 118, name, alt, 34, 200) + pair(60, 262, next, null, 34, 210));
      // a Cyrillic + Latin pair; a long name takes two lines in each script
      // (centred on yc; a long name takes two lines in each script, at a smaller size)
      function pair(x, yc, n, a, cap, maxw) { const l = lat(n, a), ls = len(n) > 12 ? [...split2(n), ...split2(l)] : [n, l], c = ls.length > 2 ? cap * 0.82 : cap, dy = c * 1.4; return txs(x, yc - (ls.length - 1) * dy / 2 + c / 2, dy, ls, c, maxw, { anchor: 'start', fill: INK }); }
    } },
    // direction-signs 196 (Kragujevac): ahead the next town on a yellow panel over the town centre on a white one; to the
    // right the towns of that exit in white straight on the blue, above and below the white Tranzit panel; a local place
    // on a yellow panel at the left; the ring drawn as in the photo (the stem joins it, it runs anticlockwise and ends in
    // a U-turn head at the lower left, arms up, up-left and right). via: the right exit's towns (array or 'A|B|…', the
    // first half above Tranzit); local: the left panel's text. The quiz has neither, so both are drawn only when given.
    { id: 'roundabout-blue', kind: 'direction', label: 'Roundabout sign (blue, Latin)', draw: ({ name, alt, next, via, local }) => {
      const L = lat(name, alt), N = srLat(next), ls = [...(len(L) > 12 ? split2(L) : [L]), 'Centar'], dn = (ls.length - 2) * 47;
      const V = (Array.isArray(via) ? via : via ? String(via).split('|') : []).map((s) => srLat(s.trim())).filter(Boolean), up = V.slice(0, Math.ceil(V.length / 2)), lo = V.slice(up.length);
      const LO = local ? split2(srLat(local)) : [];
      const rx0 = 579, W = Math.round(Math.max(880, ...V.map((s) => rx0 + est(s, 28) + 40))), H = 640 + dn, cx = 389, cy = 458 + dn, r = 63, sw = 22, LIT = '#e9e9e9';
      const bw = Math.min(380, Math.max(277, est(N, 32) + 44, ...ls.map((s) => est(s, 30) + 44))), bx = 398 - bw / 2;
      const P = (deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
      const arm = (x0, y0, x1, y1) => {   // a shaft from (x0, y0) and a broad head with its tip at (x1, y1)
        const d = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / d, uy = (y1 - y0) / d, hl = 52, hw = 31, bx_ = x1 - ux * hl, by = y1 - uy * hl;
        return `<path d="M${x0},${y0} L${bx_ + ux * 2},${by + uy * 2}" stroke="${LIT}" stroke-width="${sw}" fill="none"/><path d="M${x1},${y1} L${bx_ - uy * hw},${by + ux * hw} L${bx_ + uy * hw},${by - ux * hw} Z" fill="${LIT}"/>`;
      };
      const [sx, sy] = P(92), [ex, ey] = P(160), lu = [-0.884, -0.467], [jx, jy] = [cx + r * lu[0], cy + r * lu[1]];
      const uturn = (() => { const tx_ = Math.sin(160 * Math.PI / 180), ty = -Math.cos(160 * Math.PI / 180), hl = 50, hw = 30, X = ex + tx_ * hl, Y = ey + ty * hl;
        return `<path d="M${X},${Y} L${ex - ty * hw},${ey + tx_ * hw} L${ex + ty * hw},${ey - tx_ * hw} Z" fill="${LIT}"/>`; })();
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="${BLUE}"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="10" fill="none" stroke="${LIT}" stroke-width="5"/>` +
        `<rect x="${bx}" y="32" width="${bw}" height="77" rx="10" fill="${YEL_RS}"/>` + tx(bx + bw / 2, 86, N, 32, bw - 36, { anchor: 'middle', fill: INK }) +
        `<rect x="${bx}" y="116" width="${bw}" height="${12 + ls.length * 47}" rx="10" fill="#eceef0"/>` + txs(bx + 20, 163, 47, ls, 30, bw - 36, { anchor: 'start', fill: INK }) +
        (LO.length ? `<rect x="32" y="${243 + dn}" width="218" height="${16 + LO.length * 47}" rx="10" fill="${YEL_RS}"/>` + txs(45, 289 + dn, 50, LO, 28.5, 194, { anchor: 'start', fill: INK }) : '') +
        `<path d="M${sx},${H - 12} L${sx},${sy} A${r},${r} 0 1 0 ${ex},${ey}" fill="none" stroke="${LIT}" stroke-width="${sw}" stroke-linejoin="round"/>` + uturn +
        arm(cx, cy - r, cx, cy - 191) + arm(cx + r, cy, cx + 175.5, cy) + arm(jx, jy, 226, 372 + dn) +
        up.map((s, i) => tx(rx0, cy - 80 - (up.length - 1 - i) * 47, s, 28.5, W - rx0 - 30, { fill: '#f2f2f2' })).join('') +
        `<rect x="${rx0}" y="${cy - 60}" width="188" height="45" rx="10" fill="#eceef0"/>` + tx(rx0 + 94, cy - 26, 'Tranzit', 28, 166, { anchor: 'middle', fill: INK }) +
        lo.map((s, i) => tx(rx0, cy + 26 + i * 50, s, 28.5, W - rx0 - 30, { fill: '#f2f2f2' })).join(''));
    } },
    { id: 'motorway', kind: 'motorway', label: 'Motorway sign (green)', defaults: { road: 'E-75', road2: 'E-70' }, draw: ({ name, alt, next, road, road2 }) => {
      const rows = [name, lat(name, alt), next, srLat(next)], W = grow(640, rows, 44, false, 100, 0.1), H = 460;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="${GREEN}"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="8" fill="none" stroke="#fff" stroke-width="5"/>` +
        txs(W / 2, 82, 70, rows.slice(0, 2), 44, W - 100, { fill: '#fff', ls: 0.1 }) + txs(W / 2, 222, 70, rows.slice(2), 44, W - 100, { fill: '#fff', ls: 0.1 }) +
        barrow(78, 400, 'down', 80, '#fff') + barrow(W - 78, 400, 'down', 80, '#fff') + roadPlate(W / 2 - 146, 370, 128, 56, road) + roadPlate(W / 2 + 10, 370, 128, 56, road2));
    } },
    { id: 'urban', kind: 'direction', label: 'Town direction sign (white)', draw: ({ name, alt, next }) => {
      const rows = [name, lat(name, alt), next, srLat(next)], W = grow(600, rows, 40, false, 80, 0.1), H = 420;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="#f2f2f2"/><rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="10" fill="none" stroke="${INK}" stroke-width="5"/>` +
        txs(W / 2, 92, 64, rows.slice(0, 2), 40, W - 80, { fill: INK, ls: 0.1 }) + txs(W / 2, 220, 64, rows.slice(2), 40, W - 80, { fill: INK, ls: 0.1 }) + barrow(W / 2, 362, 'down', 70, INK));
    } },
  ];

  TS.add('RS', rs, { next: 'Нови Сад', km: 30 });
})();
