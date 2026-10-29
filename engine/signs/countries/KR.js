// KR: South Korean signs carrying a place name, drawn after the GeoHints pictures (see examples/KR.json). Hangul with
// its Latin form under or beside it; the Latin form is computed by the Revised Romanization when alt is missing.
(function () {
  const { T, svg } = TS;
  const G = '#00684a', B = '#14408e', RB = '#1648a8';
  const H = "'Noto Sans KR','Apple SD Gothic Neo',sans-serif";       // Hangul (and the Latin part, a humanist sans)
  const len = (s) => [...String(s)].length;
  // the quiz writes a few names with a qualifier ("광주 (경기)"); the signs carry the bare name
  const bare = (s) => String(s).replace(/\s*\([^)]*\)\s*$/, '').trim();
  // Revised Romanization of Korean (2000), with the sound changes across syllables that it writes: liaison of a
  // final before a silent ㅇ, nasalisation (ㄱ ㄷ ㅂ before ㄴ ㅁ -> ng n m), ㄴ+ㄹ and ㄹ+ㄴ -> ll, ㅁ/ㅇ+ㄹ -> n,
  // ㄱ/ㅂ+ㄹ -> ng-n / m-n; no hyphens, first letter capital (as on the signs: 나주 Naju, 의정부 Uijeongbu, 신라 Silla)
  const INI = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
  const VOW = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
  // finals: [sound class, romanised coda, initial it becomes on liaison]
  const FIN = [null, ['k', 'k', 'g'], ['k', 'k', 'kk'], ['k', 'k', 's'], ['n', 'n', 'n'], ['n', 'n', 'j'], ['n', 'n', 'h'], ['t', 't', 'd'], ['l', 'l', 'r'], ['k', 'k', 'g'], ['m', 'm', 'm'], ['l', 'l', 'b'], ['l', 'l', 's'], ['l', 'l', 't'], ['p', 'p', 'p'], ['l', 'l', 'h'], ['m', 'm', 'm'], ['p', 'p', 'b'], ['p', 'p', 's'], ['t', 't', 's'], ['t', 't', 'ss'], ['ng', 'ng', ''], ['t', 't', 'j'], ['t', 't', 'ch'], ['k', 'k', 'k'], ['t', 't', 't'], ['p', 'p', 'p'], ['t', 't', '']];
  const rr = (s) => String(s).split(/(\s+|-)/).map((word) => {
    const P = [...word].map((c) => {
      const k = c.codePointAt(0) - 0xac00;
      return k >= 0 && k < 11172 ? { l: Math.floor(k / 588), ini: INI[Math.floor(k / 588)], vow: VOW[Math.floor((k % 588) / 28)], t: k % 28 } : { raw: c };
    });
    P.forEach((x, i) => {
      if (x.raw) return;
      x.coda = x.t ? FIN[x.t][1] : '';
      const nx = P[i + 1];
      if (!x.t || !nx || nx.raw) return;
      const [cls, , lia] = FIN[x.t];
      if (nx.l === 11) {                                   // silent ㅇ: the final moves over (ㅇ stays, ㅎ drops)
        if (x.t === 21) return;
        const keep = { 3: 'k', 5: 'n', 6: 'n', 9: 'l', 10: 'l', 11: 'l', 12: 'l', 13: 'l', 14: 'l', 15: 'l', 18: 'p' }[x.t];
        x.coda = keep || '';
        nx.ini = x.t === 27 || x.t === 6 || x.t === 15 ? '' : lia;
      } else if (nx.l === 2 || nx.l === 6) {               // before ㄴ ㅁ: nasalisation; ㄹ+ㄴ -> ll
        if (cls === 'l' && nx.l === 2) nx.ini = 'l'; else x.coda = { k: 'ng', t: 'n', p: 'm' }[cls] || x.coda;
      } else if (nx.l === 5) {                             // before ㄹ
        if (cls === 'n' || cls === 'l') { x.coda = 'l'; nx.ini = 'l'; }
        else if (cls === 'm' || cls === 'ng') nx.ini = 'n';
        else { x.coda = { k: 'ng', t: 'n', p: 'm' }[cls]; nx.ini = 'n'; }
      }
    });
    return P.map((x) => x.raw ?? x.ini + x.vow + x.coda).join('');
  }).join('').replace(/^./, (c) => c.toUpperCase());
  const latOf = (name, alt) => bare(alt || rr(bare(name)));
  // national route number: white-framed blue oval
  const oval = (cx, cy, n, s) => `<ellipse cx="${cx}" cy="${cy}" rx="${s * 1.05}" ry="${s * 0.78}" fill="${RB}" stroke="#fff" stroke-width="${s * 0.09}"/>` + T(cx, cy + s * 0.36, n, s, H, { fill: '#fff', weight: 500 });
  const spaced = (x, y, s, size, fill, gap = 0.28, anchor = 'middle') => T(x, y, s, size, H, { fill, weight: 'bold', anchor, ls: gap, maxw: 0 });

  const kr = [
    // place-name sign on entering a city or county: green, Hangul over Latin, the township (myeon) in a panel below
    { id: 'entry', kind: 'entry', label: 'Place-name sign (green)', draw: ({ name, alt, district }) => {
      const n = bare(name), l = latOf(name, alt), W = 620, top = 360;
      const Hh = district ? top + 150 : top;
      const panel = (y, h) => `<rect x="4" y="${y}" width="${W - 8}" height="${h}" rx="18" fill="${G}" stroke="#c9d4cf" stroke-width="3"/><rect x="18" y="${y + 14}" width="${W - 36}" height="${h - 28}" rx="12" fill="none" stroke="#e9efec" stroke-width="5"/>`;
      return svg(W, Hh, panel(4, top - 10) +
        T(W / 2, 166, n, 118, H, { fill: '#f2f5f3', weight: 500, ls: 0.06, maxw: W - 90, max: 118 }) +
        T(W / 2, 286, l, 80, H, { fill: '#f2f5f3', weight: 500, maxw: W - 110, max: 80 }) +
        (district ? panel(top, 140) + T(W / 2, top + 94, district, 70, H, { fill: '#f2f5f3', weight: 500, ls: 0.04, maxw: W - 110, max: 70 }) : ''));
    } },
    // intersection direction sign on national roads (green; photos: GeoHints 72 on routes 43/45, Commons on route 3/34 at
    // Mungyeong and route 1 in Seoul): straight on with route oval, a town to the left
    { id: 'direction', kind: 'direction', label: 'Direction sign, national road (green)', draw: ({ name, alt, next, road }) => {
      const W = 860, Hh = 520, nl = latOf(next);
      return svg(W, Hh, `<rect x="4" y="4" width="${W - 8}" height="${Hh - 8}" rx="14" fill="${G}" stroke="#c9d4cf" stroke-width="3"/><rect x="18" y="18" width="${W - 36}" height="${Hh - 36}" rx="10" fill="none" stroke="#e9efec" stroke-width="5"/>` +
        (road ? oval(200, 118, road, 60) : '') +
        T(285, 142, bare(name), 88, H, { fill: '#fff', weight: 500, anchor: 'start', ls: 0.2, maxw: Math.min(330, len(bare(name)) * 88 * 1.2), max: 88 }) +
        T(305 + Math.min(330, len(bare(name)) * 88 * 1.2), 134, latOf(name, alt), 50, H, { fill: '#fff', weight: 500, anchor: 'start', maxw: W - 345 - Math.min(330, len(bare(name)) * 88 * 1.2), max: 50 }) +
        `<path d="M430,${Hh - 40} L430,250" stroke="#fff" stroke-width="30"/><path d="M394,262 L430,196 L466,262 Z" fill="#fff"/>` +
        `<path d="M430,${Hh - 120} L250,${Hh - 120}" stroke="#fff" stroke-width="30"/><path d="M262,${Hh - 156} L196,${Hh - 120} L262,${Hh - 84} Z" fill="#fff"/>` +
        T(115, Hh - 150, bare(next), 76, H, { fill: '#fff', weight: 500, ls: 0.2, maxw: 170, max: 76 }) +
        T(110, Hh - 72, nl, 46, H, { fill: '#fff', weight: 500, maxw: 180, max: 46 }));
    } },
    // direction sign on city roads (blue; photos: GeoHints 73 in Suwon, Commons at Seongnam city hall): straight on, a
    // town to the left, distance to the junction
    { id: 'direction-city', kind: 'direction', label: 'Direction sign, city road (blue)', draw: ({ name, alt, next }) => {
      const W = 900, Hh = 560;
      return svg(W, Hh, `<rect x="4" y="4" width="${W - 8}" height="${Hh - 8}" rx="12" fill="${B}" stroke="#c9cfdb" stroke-width="3"/><rect x="16" y="16" width="${W - 32}" height="${Hh - 32}" rx="8" fill="none" stroke="#e6e9f0" stroke-width="4"/>` +
        T(470, 126, bare(name), 84, H, { fill: '#eef0f4', weight: 500, anchor: 'end', ls: 0.12, maxw: 400, max: 84 }) +
        T(500, 122, latOf(name, alt), 52, H, { fill: '#eef0f4', weight: 500, anchor: 'start', maxw: 360, max: 52 }) +
        `<path d="M480,${Hh - 80} L480,232" stroke="#e6e6de" stroke-width="26"/><path d="M448,244 L480,186 L512,244 Z" fill="#e6e6de"/>` +
        `<path d="M380,${Hh - 210} L620,${Hh - 210}" stroke="#e6e6de" stroke-width="26"/><path d="M392,${Hh - 242} L336,${Hh - 210} L392,${Hh - 178} Z M608,${Hh - 242} L664,${Hh - 210} L608,${Hh - 178} Z" fill="#e6e6de"/>` +
        T(46, Hh - 222, bare(next), 70, H, { fill: '#eef0f4', weight: 500, anchor: 'start', maxw: 280, max: 70 }) +
        T(46, Hh - 160, latOf(next), 42, H, { fill: '#eef0f4', weight: 500, anchor: 'start', maxw: 280, max: 42 }) +
        T(480, Hh - 34, '200m', 48, H, { fill: '#eef0f4', weight: 500 }));
    } },
    // expressway distance post (green, road-number-signs 123): expressway shield (group D, shared/shields.js), the town
    // and its distance; the nearer town on a white panel below
    { id: 'distance', kind: 'direction', label: 'Expressway distance post (green)', draw: ({ name, km, next, km2, road }) => {
      const W = 300, Hh = 760, n = bare(name), size = len(n) > 2 ? 250 / len(n) : 108;
      const k2 = km2 || Math.max(1, Math.round(km / 5));
      return svg(W, Hh, `<path d="M8,24 Q8,8 24,8 L276,8 Q292,8 292,24 L292,560 L8,560 Z" fill="${G}" stroke="#c9d4cf" stroke-width="3"/>` +
        (road ? TS.shields.krExpressway(150 - 62, 20, 124, road, { font: H, weight: 500 }) : '') +
        T(150, 290, n, size, H, { fill: '#fff', weight: 500, maxw: 260, max: size }) +
        T(140, 470, String(km), 128, H, { fill: '#fff', weight: 500, maxw: 210, max: 128 }) + T(258, 420, 'km', 28, H, { fill: '#fff', weight: 500 }) +
        `<rect x="8" y="560" width="284" height="190" fill="#f4f4f2" stroke="#c9d4cf" stroke-width="3"/>` +
        T(104, 684, bare(next), 62, H, { fill: '#111', weight: 500, maxw: 150, max: 62 }) + T(252, 688, String(k2), 74, H, { fill: '#111', weight: 500, anchor: 'end', maxw: 70, max: 74 }) + T(256, 688, 'km', 20, H, { fill: '#111', weight: 500, anchor: 'start' }));
    } },
    // national-road distance post (green, road-number-signs 124): house-shaped top, the national route shield (group D,
    // shared/shields.js), the town, its distance
    { id: 'distance-national', kind: 'direction', label: 'National road distance post (green)', draw: ({ name, km, road }) => {
      const W = 300, Hh = 600, n = bare(name), size = len(n) > 2 ? 250 / len(n) : 100;
      return svg(W, Hh, `<path d="M8,60 L150,8 L292,60 L292,${Hh - 8} L8,${Hh - 8} Z" fill="${G}" stroke="#c9d4cf" stroke-width="3" stroke-linejoin="round"/>` +
        (road ? TS.shields.krNational(150 - TS.shields.krNational.width(120) / 2, 90, 120, road, { font: H, weight: 500 }) : '') +
        T(150, 352, n, size, H, { fill: '#fff', weight: 500, ls: len(n) > 2 ? 0 : 0.3, maxw: 256, max: size }) +
        T(150, 530, String(km), 118, H, { fill: '#fff', weight: 500, anchor: 'end', maxw: 130, max: 118 }) + T(156, 530, 'km', 56, H, { fill: '#fff', weight: 500, anchor: 'start' }));
    } },
    // expressway exit advance sign (Commons photos on the Seohaean Expressway: Haemi, Bibong, Hongseong IC): the junction
    // tab on top (exit number on dark grey, the junction's name, the exit symbol); the green panel with the crossing road's
    // route oval, the farther destination over the junction's own place, each in Hangul with its Latin form, the arrow up
    // to the right and the distance to the exit
    { id: 'expressway', kind: 'motorway', label: 'Expressway exit sign (green)', defaults: { exit: 22 }, draw: ({ name, alt, next, road, exit }) => {
      const n1 = bare(next), l1 = latOf(next), n2 = bare(name), l2 = latOf(name, alt), WH = '#f4f6f5';
      const hs = 80, ls = 0.12, lk = 0.72;   // Hangul size and spacing; the Latin form at 72 % of it (its capitals about 2/3 the Hangul's height), a space apart
      const hw = (s) => len(s) * hs * (0.95 + ls), lw = (s) => [...s].length * hs * lk * 0.55;
      const x0 = road ? 262 : 72, rows = [[n1, l1], [n2, l2]];
      const tw = Math.min(980, Math.max(...rows.map(([h, l]) => hw(h) + 0.4 * hs + lw(l))));
      const W = Math.round(Math.max(840, x0 + tw + 290)), top = 140, Hp = 380, Hh = top + Hp;
      // the tab: number box, name, exit symbol (two converging road edges, the right one branching off up to the right)
      const ts = 64, tn = Math.min(300, len(n2) * ts * 1.25), tabW = 104 + 24 + tn + 30 + 92 + 20, tx = W - 16 - tabW, ty = 10, th = 112;
      const sx = tx + tabW - 112, sy = ty + 18, sh = th - 36;
      // the exit pictogram of the shared kit (group D, TS.shields.exit) at 0.8 of its width; the own drawing only without it
      const sym = TS.shields && TS.shields.exit ? TS.shields.exit(sx, sy, sh, WH, { sx: 0.8 }) : `<path d="M${sx + 6},${sy + sh} L${sx + 30},${sy + sh} L${sx + 40},${sy} L${sx + 28},${sy} Z" fill="${WH}"/>` +
        `<path d="M${sx + 44},${sy + sh} L${sx + 68},${sy + sh} L${sx + 62},${sy + sh * 0.5} Q${sx + 64},${sy + sh * 0.34} ${sx + 76},${sy + sh * 0.24} L${sx + 82},${sy + sh * 0.31} L${sx + 90},${sy} L${sx + 66},${sy + sh * 0.04} L${sx + 72},${sy + sh * 0.12} Q${sx + 54},${sy + sh * 0.24} ${sx + 50},${sy} L${sx + 46},${sy} Z" fill="${WH}"/>`;
      const tab = `<rect x="${tx}" y="${ty}" width="${tabW}" height="${th}" rx="8" fill="${G}" stroke="#c9d4cf" stroke-width="2"/><rect x="${tx + 7}" y="${ty + 7}" width="${tabW - 14}" height="${th - 14}" rx="5" fill="none" stroke="${WH}" stroke-width="4"/>` +
        `<rect x="${tx + 9}" y="${ty + 9}" width="104" height="${th - 18}" rx="3" fill="#33363b"/><path d="M${tx + 113},${ty + 9} L${tx + 113},${ty + th - 9}" stroke="${WH}" stroke-width="4"/>` +
        T(tx + 61, ty + th / 2 + 25, String(exit), 70, H, { fill: WH, weight: 500, maxw: 88, max: 70 }) +
        T(tx + 113 + 24, ty + th / 2 + 23, n2, ts, H, { fill: WH, weight: 500, anchor: 'start', ls: 0.25, maxw: tn, max: ts }) + sym;
      // the panel
      const y1 = top + 168, y2 = top + 290, ax = W - 118, ay = top + 128, as = 150;
      const arrowUR = `<path transform="translate(${ax},${ay}) rotate(45) scale(${as})" d="M0,-0.62 L0.48,-0.08 L0.17,-0.08 L0.17,0.62 L-0.17,0.62 L-0.17,-0.08 L-0.48,-0.08 Z" fill="${WH}"/>`;
      // Hangul and its Latin form in one line, so the font itself sets the gap; the pair shrinks together if too long
      const row = ([h, l], y) => `<text x="${x0}" y="${y}" font-family="${H}" font-weight="500" font-size="${hs}" fill="${WH}" data-maxw="${Math.round(W - x0 - 280)}" data-max="${hs}">` +
        `<tspan letter-spacing="${ls}em">${TS.esc(h)}</tspan><tspan font-size="${lk * 100}%" dx="0.45em">${TS.esc(l)}</tspan></text>`;
      return svg(W, Hh, tab + `<rect x="2" y="${top}" width="${W - 4}" height="${Hp - 2}" rx="14" fill="${G}" stroke="#c9d4cf" stroke-width="3"/>` +
        `<rect x="14" y="${top + 12}" width="${W - 28}" height="${Hp - 26}" rx="9" fill="none" stroke="${WH}" stroke-width="5"/>` +
        (road ? oval(152, (y1 + y2) / 2 - 30, road, 74) : '') + row(rows[0], y1) + row(rows[1], y2) + arrowUR +
        T(W - 50, top + Hp - 62, '1km', 54, H, { fill: WH, weight: 500, anchor: 'end' }));
    } },
  ];

  TS.add('KR', kr, { next: '광주', km: 23, road: '45' });
})();
