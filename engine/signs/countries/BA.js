// BA: Bosnia and Herzegovina. Drawn from Commons photos (see examples/BA.json); no GeoHints direction-sign pictures.
// Yellow place-name and direction signs with black lettering; blue main-road and expressway signs in the Federation.
// The two entities write differently: Republika Srpska puts Cyrillic first (or Cyrillic alone), the Federation Latin
// first with Cyrillic below, and its Croat-majority cantons Latin alone; so every design here is marked by region.
// Lettering: DINish (a free DIN with Latin and Cyrillic) stands in for the DIN-style sign lettering, as DINish SR with the
// sign forms of Л, Д and Љ.
(function () {
  const { T, svg } = TS;
  const d = 8, CAP = 7 * d;
  const YE = '#f5c400', K = '#141414', W = '#fff', BL = '#1d4f9e', GR = '#0b7a40', RED = '#d42020';
  // DINish SR: DINish with the sign Cyrillic of Republika Srpska and Serbia (Λ-shaped Л, Δ-shaped Д on an overhanging bar,
  // Љ built on that Λ); Latin and every other letter as in DINish
  const F = "'DINish SR','DINish','Noto Sans',sans-serif", FS = CAP / 0.69, LS = 0.02;
  // advance widths (1/1000 em) of DINish Medium, measured from the font file
  const CH = " -'.,()/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzČĆŠŽĐčćšžđАБВГДЂЕЖЗИЈКЛЉМНЊОПРСТЋУФХЦЧЏШабвгдђежзијклљмнњопрстћуфхцчџш";
  const WM = [217, 393, 179, 200, 179, 295, 295, 396, 499, 335, 476, 497, 506, 487, 501, 439, 516, 501, 586, 608, 606, 613, 550, 551, 606, 622, 248, 318, 602, 524, 753, 652, 606, 573, 606, 599, 547, 503, 628, 533, 808, 574, 512, 512, 498, 512, 504, 512, 508, 315, 512, 521, 229, 227, 502, 277, 818, 521, 507, 512, 512, 344, 466, 344, 521, 452, 721, 434, 453, 455, 606, 606, 547, 512, 669, 504, 504, 466, 455, 512, 587, 604, 608, 506, 652, 698, 542, 970, 589, 653, 318, 602, 571, 914, 753, 622, 966, 606, 613, 573, 602, 486, 722, 513, 677, 574, 605, 626, 594, 815, 498, 498, 521, 344, 548, 493, 508, 771, 474, 543, 227, 497, 484, 745, 666, 521, 794, 507, 514, 512, 504, 372, 521, 453, 802, 434, 519, 521, 521, 762];
  [['Д', 752], ['д', 635], ['Л', 586], ['л', 452], ['Љ', 924], ['љ', 733]].forEach(([c, w]) => { WM[CH.indexOf(c)] = w; });   // DINish SR's own widths
  const tw = (s, k = 1, ls = LS) => [...String(s)].reduce((a, c) => { const w = WM[CH.indexOf(c)]; return a + ((w > 0 ? w : 560) / 1000 + ls) * FS * k; }, 0);
  const line = (x, y, s, { fill = K, anchor = 'start', k = 1, maxw = 0, ls = LS } = {}) =>
    T(x, y, s, FS * k, F, { fill, anchor, ls, weight: '500', maxw, max: FS * k, extra: 'lang="sr"' });
  // ---- the two scripts: Serbian Cyrillic and Gaj's Latin map one to one (lj, nj, dž are single Cyrillic letters) ----
  const C2L = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž', з: 'z', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ћ: 'ć', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'č', џ: 'dž', ш: 'š' };
  const L2C = Object.fromEntries(Object.entries(C2L).map(([c, l]) => [l, c]));
  const isCyr = (s) => /[Ѐ-ӿ]/.test(s);
  const up1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const cyr2lat = (s) => [...s].map((ch, i, a) => {
    const lo = ch.toLowerCase(), l = C2L[lo];
    if (!l) return ch;
    if (ch === lo) return l;
    const nextUp = a[i + 1] && a[i + 1] !== a[i + 1].toLowerCase();
    return nextUp ? l.toUpperCase() : up1(l);
  }).join('');
  const lat2cyr = (s) => {
    let o = '';
    for (let i = 0; i < s.length; i++) {
      const two = s.slice(i, i + 2), tl = two.toLowerCase();
      if (['lj', 'nj', 'dž'].includes(tl)) { const c = L2C[tl]; o += two[0] === two[0].toLowerCase() ? c : c.toUpperCase(); i++; continue; }
      const ch = s[i], c = L2C[ch.toLowerCase()];
      o += c ? (ch === ch.toLowerCase() ? c : c.toUpperCase()) : ch;
    }
    return o;
  };
  // the quiz's disambiguators never appear on a sign: "Name (Region)", "Polje, Kreševo" -> "Polje"
  const clean = (s) => String(s == null ? '' : s).replace(/\s*\([^)]*\)\s*$/, '').replace(/,\s.*$/, '').trim();
  // both forms of a name: the given one, alt when it is in the other script, else the transliteration
  const forms = (name, alt) => {
    const n = clean(name), a = alt ? clean(alt) : '';
    const bare = (x) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
    if (!isCyr(n)) return { lat: n, cyr: a && isCyr(a) ? a : lat2cyr(n) };
    const t = cyr2lat(n);   // an alt that is only the transliteration without its diacritics (Brcko) gives way to it (Brčko)
    return { cyr: n, lat: a && !isCyr(a) && bare(a) !== bare(t) ? a : t };
  };
  // the lines a name takes on a sign of the given script order; "A / B" (a place with two names) gives both
  const lines = (name, alt, mode) => {
    const parts = clean(name).split(/\s+\/\s+/), alts = alt ? clean(alt).split(/\s+\/\s+/) : [];
    const fs = parts.map((p, i) => forms(p, alts[i] || (parts.length === 1 ? alt : '')));
    const by = (k) => fs.map((f) => f[k]);
    return mode === 'lat' ? by('lat') : mode === 'cyr' ? by('cyr') : mode === 'cyr-lat' ? [...by('cyr'), ...by('lat')] : [...by('lat'), ...by('cyr')];
  };
  // ---- region lists (the city quiz's region names) ----
  const FED = ['Kanton Sarajevo', 'Tuzlanski kanton', 'Zeničko-dobojski kanton', 'Hercegovačko-neretvanski kanton', 'Unsko-sanski kanton', 'Zapadnohercegovački kanton',
    'Bosansko-podrinjski kanton Goražde', 'Srednjobosanski kanton', 'Posavski kanton', 'Kanton 10', 'Federation of B&H'];
  const FED2 = FED.filter((r) => r !== 'Zapadnohercegovački kanton');                     // Latin above Cyrillic
  const FED2B = [...FED2, 'Brčko distrikt'];                                              // town limits: Brčko writes so too
  const CRO = ['Hercegovačko-neretvanski kanton', 'Zapadnohercegovački kanton', 'Kanton 10'];  // Latin alone (Croat-majority areas)
  const RS = ['Regija Banja Luka', 'Regija Prijedor', 'Regija Doboj', 'Regija Bijeljina', 'Regija Istočno Sarajevo', 'Regija Trebinje', 'Srpska'];
  // ---- drawing ----
  const plateBg = (w, h, fill, rx = 3 * d) => `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${rx}" fill="${fill}" stroke="#9a9a9a" stroke-width="2"/>`;
  const inner = (w, h, stroke = K, inset = 1.3 * d, rx = 2.2 * d, sw = 0.75 * d) => `<rect x="${inset}" y="${inset}" width="${w - 2 * inset}" height="${h - 2 * inset}" rx="${rx}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>`;
  // town limit sign: yellow plate, thin black border set in from the edge, the name in one or two scripts;
  // exit: a red bar from lower left to upper right; limit: the speed-limit roundel at the left (Trebinje)
  // arms: the town's coat of arms as an image URL, set centred above the name (Trebinje); AH is the band it takes
  const townSign = (ls, { exit = false, limit = 0, arms = '' } = {}) => {
    const n = ls.length, k = n === 1 ? 1.2 : 1, P = 11.5 * d, AH = arms ? 14 * d : 0;
    // limit (Trebinje photo): the roundel stands well inside the frame at the left, centred on the name block, and the
    // name is centred in the room right of it; LR its outer radius, LG the gap from the plate edge
    const LR = 6.4 * d, LG = 3.4 * d;
    const Hd = Math.round((n === 1 ? 22 * d : 6.5 * d + CAP + (n - 1) * P + 6.5 * d) + AH), lw = limit ? LG + 2 * LR + 2 * d : 0;
    const tmax = Math.max(...ls.map((s) => tw(s, k)));
    const Wd = Math.round(Math.max(Hd * (arms ? 1.6 : n === 1 ? 1.9 : 1.45), tmax + 13 * d + lw));
    const cx = lw + (Wd - lw) / 2, top = AH + (Hd - AH - (CAP * k + (n - 1) * P)) / 2, cyL = AH + (Hd - AH) / 2;
    let b = plateBg(Wd, Hd, YE, exit ? 0 : 3 * d) + inner(Wd, Hd);   // the end signs' plates have square corners (Commons Celebici, Vrapčići, Stolac, Kupres)
    if (arms) b += `<image href="${String(arms).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" x="${Wd / 2 - 10 * d}" y="${3.4 * d}" width="${20 * d}" height="${14 * d}" preserveAspectRatio="xMidYMid meet"/>`;
    if (limit) b += `<circle cx="${LG + LR}" cy="${cyL}" r="${LR - 0.6 * d}" fill="${W}" stroke="${RED}" stroke-width="${1.2 * d}"/>` + line(LG + LR, cyL + 0.31 * CAP, String(limit), { anchor: 'middle', k: 0.62, ls: 0, maxw: 1.3 * LR, max: FS * 0.62 });
    ls.forEach((s, i) => { b += line(cx, top + CAP * k + i * P, s, { anchor: 'middle', k, maxw: Wd - lw - 11 * d }); });
    // exit 'lines' (group B): six thin parallel red lines, plate corner to corner, over the frame and the name (Commons
    // Celebici, Vrapčići); otherwise one solid bar (Stolac, Kupres)
    if (exit === 'lines') b += TS.exitbar({ box: [1, 1, Wd - 2, Hd - 2, 0], b: 0, t: 1, width: 2.6 * d, stripes: 6, fill: RED });
    else if (exit) b += `<clipPath id="ba-x"><rect x="${1.7 * d}" y="${1.7 * d}" width="${Wd - 3.4 * d}" height="${Hd - 3.4 * d}" rx="${1.8 * d}"/></clipPath>` +
      `<line x1="0" y1="${Hd - 1.5 * d}" x2="${Wd}" y2="${1.5 * d}" stroke="${RED}" stroke-width="${2.6 * d}" clip-path="url(#ba-x)"/>`;
    return svg(Wd, Hd, b);
  };
  // arrow-shaped fingerposts, one board per destination, stacked; each board's lines centred between tail and tip
  // pt: the point's drawing (TS.arrows.plate, shares of the board's height), as on the photos; without it the older outline
  const PT_LATCYR = { tip: 0.42, outer: W, edge: '#9a9a9a', margin: 0.015, band: 0.016, fieldTip: 0.4, fieldNeck: -0.04, r: 0.04, rField: 0.03 };   // Mostar: white rim, thin black line widening into a black wedge
  // Podbrdo, measured on the photo's pixels (board 93 px high): a thin black border at the edge; the black point 0.9 of
  // the board's height long, the yellow field's own point as long as the field's half height, both starting at the same
  // place, so a black wedge about 0.45 of the height long stands past the yellow tip
  const PT_CYR = { tip: 0.9, margin: 0, band: 0.03, fieldTip: 1.0, r: 0.03, rField: 0.02 };
  const fingers = (boards, { fill = YE, fg = K, k = 1, upper = false, pt = null } = {}) => {
    boards = boards.map((bd) => ({ ...bd, ls: upper ? bd.ls.map((s) => s.toUpperCase()) : bd.ls }));
    const P = 9.5 * d * k, bh = boards.map((bd) => Math.round(4.5 * d + CAP * k + (bd.ls.length - 1) * P + 4 * d)), tr = pt ? pt.tip : 0.42;
    const tip = Math.max(...bh) * tr, tmax = Math.max(...boards.flatMap((bd) => bd.ls.map((s) => tw(s, k))));
    const Wd = Math.round(tmax + 9 * d + tip), gap = d, Hd = bh.reduce((a, h) => a + h, 0) + gap * (boards.length - 1);
    let b = '', y = 0;
    boards.forEach((bd, i) => {
      const h = bh[i], r = bd.dir !== 'left', t = h * tr;
      const path = (m) => (r ? `M${m},${y + m}H${Wd - t - m * 0.4}L${Wd - m},${y + h / 2}L${Wd - t - m * 0.4},${y + h - m}H${m}Z`
        : `M${m},${y + h / 2}L${t + m * 0.4},${y + m}H${Wd - m}V${y + h - m}H${t + m * 0.4}Z`);
      if (pt) b += TS.arrows.plate({ x: 1, y: y + 1, w: Wd - 2, h: h - 2, dir: r ? 'right' : 'left', tip: t, r: pt.r * h, rTip: 0.025 * h, rNeck: 0.01 * h,
        fill, ink: fg, outer: pt.outer, edge: pt.edge, edgeW: 1.5, margin: pt.margin * h, band: pt.band * h, fieldTip: pt.fieldTip, fieldNeck: (pt.fieldNeck || 0) * h, rField: pt.rField * h }).svg;
      else b += `<path d="${path(1)}" fill="${fill}" stroke="#9a9a9a" stroke-width="2" stroke-linejoin="round"/>` +
        `<path d="${path(1.1 * d)}" fill="none" stroke="${fg}" stroke-width="${0.6 * d}" stroke-linejoin="round"/>`;
      const cx = r ? (Wd - t) / 2 + d / 2 : t + (Wd - t) / 2 - d / 2, top = y + (h - (CAP * k + (bd.ls.length - 1) * P)) / 2;
      bd.ls.forEach((s, j) => { b += line(cx, top + CAP * k + j * P, s, { anchor: 'middle', k, fill: fg, maxw: Wd - t - 6 * d }); });
      y += h + gap;
    });
    return svg(Wd, Hd, b);
  };
  // a thin road-sign arrow (shaft and triangular head), deg 0 = up
  const arr = (x, y, deg, L, fill = K, s = 0.8 * d, hw = 3.2 * d, hl = 4.8 * d) =>
    `<path transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${deg})" d="M0,${-L / 2}L${hw},${-L / 2 + hl}H${s}V${L / 2}H${-s}V${-L / 2 + hl}H${-hw}Z" fill="${fill}"/>`;
  // advance direction sign: an arrow up at the left, the destinations beside it, each in its scripts
  const advance = (groups) => {
    const P = 9.5 * d, G = 3 * d, all = groups.flat(), x0 = 15 * d;
    const Wd = Math.round(Math.max(x0 + Math.max(...all.map((s) => tw(s))) + 6 * d, 50 * d));
    const Hd = Math.round(6 * d + CAP + (all.length - 1) * P + (groups.length - 1) * G + 6 * d);
    let b = plateBg(Wd, Hd, YE, 0) + inner(Wd, Hd, K, 1.2 * d, 1.4 * d), y = 6 * d + CAP;   // square plate, the border line rounded (Commons Putokaz_BL)
    groups.forEach((g) => { g.forEach((s) => { b += line(x0, y, s, { maxw: Wd - x0 - 5 * d }); y += P; }); y += G; });
    b += arr(8 * d, 6 * d + Math.min(Hd - 12 * d, 22 * d) / 2, 0, Math.min(Hd - 12 * d, 22 * d), K, 0.9 * d, 3.4 * d, 5 * d);
    return svg(Wd, Hd, b);
  };
  // yellow diagram: the road ahead as a stem with its destinations on top, a branch to one side at the foot with that
  // side's destinations above it
  const diagram = ({ ahead, side, dir = 'right', fill = YE, fg = K }) => {
    const P = 9 * d, aw = Math.max(...ahead.map((s) => tw(s, 0.9))), sw = Math.max(...side.map((s) => tw(s, 0.9)));
    const r = dir === 'right', stemPad = 14 * d;
    const Wd = Math.round(Math.max(r ? 7 * d + Math.max(aw, stemPad) : 0, r ? 22 * d + sw + 7 * d : 7 * d + sw + 9 * d + stemPad, r ? 0 : aw + 20 * d, 46 * d));
    const aTop = 6 * d, aH = CAP * 0.9 + (ahead.length - 1) * P, sH = CAP * 0.9 + (side.length - 1) * P;
    const stemTop = aTop + aH + 4 * d, by = stemTop + Math.max(sH + 9 * d, 16 * d), Hd = Math.round(by + 8 * d);
    const sx = r ? 13 * d : Wd - 13 * d;
    let b = plateBg(Wd, Hd, fill, 0) + inner(Wd, Hd, fg, 1.2 * d, 1.4 * d);   // square plate, the border line rounded (Commons Kotorsko, Privalj)
    const ax = r ? 7 * d : Math.min(Wd - 7 * d - aw, sx - 4 * d);
    ahead.forEach((s, i) => { b += line(ax, aTop + CAP * 0.9 + i * P, s, { k: 0.9, fill: fg, maxw: Wd - ax - 5 * d }); });
    const sx0 = r ? 22 * d : 7 * d, sTop = by - 5 * d - sH;
    side.forEach((s, i) => { b += line(sx0, sTop + CAP * 0.9 + i * P, s, { k: 0.9, fill: fg, maxw: r ? Wd - sx0 - 5 * d : sx - sx0 - 6 * d }); });
    b += arr(sx, (stemTop + Hd - 3 * d) / 2, 0, Hd - 3 * d - stemTop, fg, 0.85 * d, 3.2 * d, 5 * d);
    const bx1 = r ? sx : 7 * d, bx2 = r ? Wd - 7 * d : sx;
    b += `<rect x="${bx1 + (r ? 0 : 4.8 * d)}" y="${by - 0.85 * d}" width="${bx2 - bx1 - 4.8 * d}" height="${1.7 * d}" fill="${fg}"/>` +
      (r ? `<path d="M${bx2},${by}L${bx2 - 4.8 * d},${by - 3.2 * d}V${by + 3.2 * d}Z" fill="${fg}"/>` : `<path d="M${bx1},${by}L${bx1 + 4.8 * d},${by - 3.2 * d}V${by + 3.2 * d}Z" fill="${fg}"/>`);
    return svg(Wd, Hd, b);
  };
  // route-number box: white outline with the number in white (blue signs)
  const rbox = (x, y, s, k = 0.8) => { const w = tw(s, k) + 2.4 * d, h = CAP * k + 2.6 * d;
    return { w, svg: `<rect x="${x}" y="${y - h / 2}" width="${w}" height="${h}" rx="${0.5 * d}" fill="${BL}" stroke="${W}" stroke-width="${0.45 * d}"/>` + line(x + w / 2, y + (CAP * k) / 2, s, { fill: W, anchor: 'middle', k }) }; };
  // blue main-road diagram (Sarajevo): ahead destinations top left with route boxes, the branch to the right carrying its
  // route box, that side's destinations above it with route boxes, the distance on a white panel below
  const blueDiagram = ({ ahead, side, road, dist = '100 m' }) => {
    const k = 0.95, P = 9.5 * d, rb = road ? tw(road, 0.8) + 2.4 * d : 0;
    const aw = tw(ahead, k), swid = tw(side, k);
    const Wd = Math.round(Math.max(6 * d + aw + 3 * d + rb + 6 * d, 30 * d + swid + 3 * d + rb + 6 * d, 70 * d));
    const ay = 6 * d + CAP * k, stemTop = ay + 6 * d, by = stemTop + 30 * d, PH = 13 * d, Hs = by + 9 * d, Hd = Math.round(Hs + PH);
    let b = `<rect x="1" y="1" width="${Wd - 2}" height="${Hd - 2}" rx="${1.5 * d}" fill="${W}" stroke="#9a9a9a" stroke-width="2"/>` +
      `<rect x="${0.8 * d}" y="${0.8 * d}" width="${Wd - 1.6 * d}" height="${Hs - 0.8 * d}" rx="${d}" fill="${BL}"/>`;
    b += line(6 * d, ay, ahead, { fill: W, k, maxw: Wd - 15 * d - rb });
    if (road) b += rbox(6 * d + Math.min(aw, Wd - 15 * d - rb) + 3 * d, ay - (CAP * k) / 2, road).svg;
    const sx = 12 * d;
    // a crossroads (Sarajevo photo): the stem from below the cross arm to a tall triangular head; the arm from a short stub
    // left of the stem to its head at the right, joined to the stem (TS.arrows)
    b += TS.arrows.group([{ pts: [[sx, Hs - 2 * d], [sx, stemTop]], head: { half: 2, back: 4.4, neck: 4.4 } },
      { pts: [[sx - 3 * d, by], [Wd - 7 * d, by]], head: { half: 2.2, back: 3.6, neck: 3.6 } }], { w: 2.2 * d, fill: W });
    if (road) b += rbox(sx + 7 * d, by, road).svg;
    const sy = by - 9 * d;
    b += line(30 * d, sy, side, { fill: W, k, maxw: Wd - 39 * d - rb });
    if (road) b += rbox(30 * d + Math.min(swid, Wd - 39 * d - rb) + 3 * d, sy - (CAP * k) / 2, road).svg;
    b += line(Wd / 2, Hs + PH / 2 + CAP * 0.4, dist, { anchor: 'middle', k: 0.8 });
    return svg(Wd, Hd, b);
  };
  // blue expressway sign (Zenica): an arrow up and the route box at the left; the motorway destination on a green panel,
  // the next destination below, each in Latin above Cyrillic
  const expressway = ({ panel, below, road }) => {
    const P = 9.5 * d, rbw = road ? tw(road, 0.75) + 2.4 * d : 0, ac = Math.max(8.5 * d, 3 * d + rbw / 2), x0 = Math.max(17 * d, ac + rbw / 2 + 4 * d), pw = Math.max(...panel.map((s) => tw(s))) + 5 * d, bw = Math.max(...below.map((s) => tw(s)));
    const Wd = Math.round(Math.max(x0 + pw, x0 + bw + 2.5 * d) + 5 * d);
    const ph = 3 * d + CAP + (panel.length - 1) * P + 3.5 * d, py = 4 * d, by0 = py + ph + 5 * d + CAP, Hd = Math.round(by0 + (below.length - 1) * P + 6 * d);
    // blue to the edge, a white border line set in from it (Commons Entrance_to_Zenica)
    let b = TS.frames.plate(Wd, Hd, [{ r: 0.6 * d, fill: BL }, { i: 1.1 * d, r: 0.9 * d, line: W, w: 0.75 * d }]);
    b += `<rect x="${x0}" y="${py}" width="${pw}" height="${ph}" fill="${GR}"/>`;
    panel.forEach((s, i) => { b += line(x0 + 2.5 * d, py + 3 * d + CAP + i * P, s, { fill: W, maxw: pw - 5 * d }); });
    below.forEach((s, i) => { b += line(x0 + 2.5 * d, by0 + i * P, s, { fill: W, maxw: Wd - x0 - 7.5 * d }); });
    b += arr(ac, py + ph / 2 + 2 * d, 0, 16 * d, W, 1.1 * d, 4 * d, 6 * d);
    if (road) b += rbox(ac - rbw / 2, Hd - 9 * d, road, 0.75).svg;
    return svg(Wd, Hd, b);
  };
  // blue local fingerpost (Pojske photo): one board in a lighter blue, the white rim at the very edge, square tail and a
  // long point (about the board's height), the name in bold spaced capitals centred a little towards the point
  const BLF = '#3a70b4';
  const blueFinger = (ls) => {
    ls = ls.map((s) => s.toUpperCase());
    const k = 0.95, lsp = 0.1, P = 9.5 * d, cap = CAP * k, H = Math.round(cap / 0.5 + (ls.length - 1) * P), tip = Math.round(0.95 * Math.min(H, 13.5 * d) + (H - Math.min(H, 13.5 * d)) * 0.5);
    const tmax = Math.max(...ls.map((s) => tw(s, k, lsp))), Wd = Math.round(tmax + 0.9 * Math.min(H, 13.5 * d) + tip), m = 0.065 * Math.min(H, 13.5 * d);
    const shape = `M1,1H${Wd - tip}L${Wd - 1},${H / 2}L${Wd - tip},${H - 1}H1Z`, cx = (Wd - tip) / 2 + tip * 0.25, top = (H - (cap + (ls.length - 1) * P)) / 2;
    // the white rim at the very edge (0.06 of the height) is fattest where the point starts: the blue field's point begins
    // about a quarter of the height before the plate's and runs flatter, ending a tenth of the height short of the plate's
    // tip (Pojske photo, measured at large size; TS.arrows.plate)
    const hh = Math.min(H, 13.5 * d), rimw = 0.06 * hh, back = 0.27 * hh;
    let b = shape ? TS.arrows.plate({ x: 1, y: 1, w: Wd - 2, h: H - 2, dir: 'right', tip: tip - 1, r: 0.02 * hh, rTip: 0.02 * hh, fill: BLF, ink: W, edge: '#9a9a9a', edgeW: 1.2,
      band: rimw, fieldNeck: -back, fieldTip: (tip - 1 + back - 0.1 * hh) / ((H - 2) / 2 - rimw), rField: 0.015 * hh }).svg : '';
    ls.forEach((s, i) => { b += T(cx, top + cap + i * P, s, FS * k, F, { fill: W, weight: 'bold', ls: lsp, maxw: Wd - tip * 0.5 - 0.7 * Math.min(H, 13.5 * d), max: FS * k, extra: 'lang="sr"' }); });
    return svg(Wd, H, b);
  };
  // blue local direction board (Zenica photo): rows split by white rules, each a destination in widely spaced capitals with
  // an arrow at the side it points to (left at the left; up and right at the right), the text on the other side
  const blueBoard = (rows) => {
    const k = 0.85, lsp = 0.2, cap = CAP * k, RH = Math.round(cap / 0.29), mg = 0.28 * RH, al = 0.6 * RH, rim = 0.8 * d;
    const tmax = Math.max(...rows.map(([s]) => tw(s.toUpperCase(), k, lsp)));
    const Wd = Math.round(Math.max(3.8 * RH, 2 * mg + al + 0.45 * RH + tmax)), Hd = rows.length * RH;
    // the photo's arrows: a long triangular head (about two thirds of the arrow, 3.3 shafts wide, barbs slightly swept) on
    // a short shaft 0.125 of the row height (TS.arrows), deg 0 = up
    const barr = (x, y, deg) => TS.arrows.dir(x, y, deg, al, { w: 0.125 * RH, fill: W, head: { half: 1.65, back: 3.1, neck: 3.0 } });
    let b = `<rect x="1" y="1" width="${Wd - 2}" height="${Hd - 2}" rx="${0.12 * RH}" fill="${BL}" stroke="#9a9a9a" stroke-width="1.5"/>` +
      `<rect x="${rim}" y="${rim}" width="${Wd - 2 * rim}" height="${Hd - 2 * rim}" rx="${0.09 * RH}" fill="none" stroke="${W}" stroke-width="${rim}"/>`;
    rows.forEach(([s, dir], i) => {
      const y0 = i * RH, cy = y0 + RH / 2, S = s.toUpperCase(), maxw = Wd - 2 * mg - al - 0.45 * RH;
      if (i) b += `<rect x="${rim}" y="${y0 - rim / 2}" width="${Wd - 2 * rim}" height="${rim}" fill="${W}"/>`;
      if (dir === 'left') b += barr(mg + al / 2, cy, -90) + line(Wd - mg, cy + cap / 2, S, { fill: W, anchor: 'end', k, ls: lsp, maxw });
      else b += barr(Wd - mg - al / 2, cy, dir === 'up' ? 0 : 90) + line(mg + 0.05 * RH, cy + cap / 2, S, { fill: W, k, ls: lsp, maxw });
    });
    return svg(Wd, Hd, b);
  };
  const L = (o, mode) => lines(o.name, o.alt, mode), N = (o, mode) => lines(o.next, '', mode);
  const ba = [
    { id: 'entry-lat-cyr', kind: 'entry', label: 'Town limit, Latin and Cyrillic', regions: FED2B, draw: (o) => townSign(L(o, 'lat-cyr')) },
    { id: 'entry-lat', kind: 'entry', label: 'Town limit, Latin', regions: CRO, draw: (o) => townSign(L(o, 'lat')) },
    { id: 'entry-cyr-lat', kind: 'entry', label: 'Town limit, Cyrillic and Latin', regions: RS, draw: (o) => townSign(L(o, 'cyr-lat')) },
    { id: 'entry-cyr-lat-limit', kind: 'entry', label: 'Town limit with crest and speed limit', regions: RS, needs: ['arms'], draw: (o) => townSign(L(o, 'cyr-lat'), { limit: 50, arms: o.arms }) },
    { id: 'entry-cyr', kind: 'entry', label: 'Town limit, Cyrillic', regions: RS, draw: (o) => townSign(L(o, 'cyr')) },
    { id: 'exit-lat-cyr', kind: 'exit', label: 'Town limit end, Latin and Cyrillic', regions: FED2, draw: (o) => townSign(L(o, 'lat-cyr'), { exit: 'lines' }) },
    { id: 'exit-lat', kind: 'exit', label: 'Town limit end, Latin', regions: CRO, draw: (o) => townSign(L(o, 'lat'), { exit: true }) },
    { id: 'finger-lat-cyr', kind: 'direction', label: 'Fingerposts, Latin and Cyrillic', regions: FED2, draw: (o) =>
      fingers([{ ls: L(o, 'lat-cyr'), dir: 'left' }, { ls: N(o, 'lat-cyr'), dir: 'right' }], { pt: PT_LATCYR }) },
    { id: 'finger-cyr', kind: 'direction', label: 'Fingerposts, Cyrillic', regions: RS, draw: (o) =>
      fingers([{ ls: L(o, 'cyr'), dir: 'right' }, { ls: N(o, 'cyr'), dir: 'left' }], { pt: PT_CYR }) },
    { id: 'finger-blue', kind: 'direction', label: 'Local fingerpost (blue)', regions: FED, draw: (o) => blueFinger(L(o, 'lat')) },
    { id: 'board-blue', kind: 'direction', label: 'Local direction board (blue)', regions: FED, draw: (o) =>
      blueBoard([[L(o, 'lat').join(' / '), 'left'], [N(o, 'lat').join(' / '), 'up'], ...(o.next2 ? [[o.next2, 'right']] : [])]) },
    { id: 'advance-cyr-lat', kind: 'direction', label: 'Advance direction sign', regions: RS, draw: (o) => advance([L(o, 'cyr-lat'), N(o, 'cyr-lat')]) },
    { id: 'diagram-cyr-lat', kind: 'direction', label: 'Junction diagram, Cyrillic and Latin', regions: RS, draw: (o) =>
      diagram({ ahead: N(o, 'cyr-lat'), side: L(o, 'cyr-lat'), dir: 'right' }) },
    { id: 'diagram-lat', kind: 'direction', label: 'Junction diagram, Latin', regions: CRO, draw: (o) =>
      diagram({ ahead: N(o, 'lat'), side: L(o, 'lat'), dir: 'left' }) },
    { id: 'diagram-blue', kind: 'direction', label: 'Main-road diagram (blue)', regions: FED, draw: (o) =>
      blueDiagram({ ahead: N(o, 'lat')[0], side: L(o, 'lat')[0], road: o.road }) },
    { id: 'expressway', kind: 'motorway', label: 'Expressway sign', regions: FED2, draw: (o) =>
      expressway({ panel: L(o, 'lat-cyr'), below: N(o, 'lat-cyr'), road: o.road }) },
    // A1 motorway signs (Commons photos near Ilijaš and Visoko, fix group G): the green motorway panel, an arrow up at the
    // left and the destination ahead in Latin over Cyrillic, over the yellow exit panel with the exit's destination, the
    // arrow up to the right and the distance to the exit (Doboj / Добој / Zenica / Зеница over Vareš / Вареш / Breza /
    // Бреза 500 m)
    { id: 'autocesta', kind: 'motorway', label: 'Motorway exit sign (A1)', regions: FED2, draw: (o) => {
      const top = N(o, 'lat-cyr'), low = L(o, 'lat-cyr'), P = 9.5 * d, pad = 5 * d, gap = 2 * d, x0 = 11 * d;
      const ahead = { w: 1.25 * d, fill: W, head: { half: 1.9, back: 2.8, cut: 0, neck: 2.8 } };
      const tmax = Math.max(...top.map((s) => tw(s)), ...low.map((s) => tw(s))), ar = 12 * d;
      const Wd = Math.round(Math.max(48 * d, x0 + tmax + 3 * d + ar + 2 * d));
      const h1 = Math.round(pad + CAP + (top.length - 1) * P + pad), h2 = Math.round(pad + CAP + (low.length - 1) * P + 4.5 * d + CAP * 0.9 + pad), Hd = h1 + gap + h2;
      const panel = (y, h, fill, fg) => `<rect x="1" y="${y + 1}" width="${Wd - 2}" height="${h - 2}" rx="${1.2 * d}" fill="${fill}" stroke="#9a9a9a" stroke-width="1.5"/>` +
        `<rect x="${0.8 * d}" y="${y + 0.8 * d}" width="${Wd - 1.6 * d}" height="${h - 1.6 * d}" rx="${0.7 * d}" fill="none" stroke="${fg}" stroke-width="${0.45 * d}"/>`;
      let b = panel(0, h1, GR, W) + TS.arrows.dir(5.5 * d, h1 / 2, 0, Math.min(h1 - 7 * d, 2.2 * CAP), ahead);
      top.forEach((s, i) => { b += line(x0, pad + CAP + i * P, s, { fill: W, maxw: Wd - x0 - 3 * d }); });
      const y2 = h1 + gap;
      b += panel(y2, h2, YE, K);
      low.forEach((s, i) => { b += line(x0 - 6 * d, y2 + pad + CAP + i * P, s, { fill: K, maxw: Wd - x0 - ar - 2 * d }); });
      b += TS.arrows.dir(Wd - ar / 2 - 2 * d, y2 + pad + CAP / 2 + ((low.length - 1) * P) / 2, 45, 13 * d, { ...ahead, fill: K });
      b += line(Wd / 2 + 4 * d, y2 + h2 - pad, '500 m', { fill: K, anchor: 'middle', k: 0.9 });
      return svg(Wd, Hd, b);
    } },
  ];
  TS.add('BA', ba, { next: 'Zenica', road: 'M-17' });
})();
