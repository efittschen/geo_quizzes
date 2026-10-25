// BG: signs carrying a place name, drawn after the GeoHints pictures (see examples/BG.json for which).
(function () {
  const { T, svg } = TS;
  // DIN-like lettering (Bulgaria's sign alphabet is SNV-based); capitals take DINish's Bulgarian forms (lang="bg":
  // the Λ-shaped Л of ИСТАНБУЛ), lowercase keeps the common forms, as on the pictures
  const F = "'DINish','Noto Sans',sans-serif";
  const FC = "'DINish Condensed','DINish','Noto Sans',sans-serif";
  const BG = 'lang="bg"';
  const RD = '#ff1128', GR = '#00953c', BL = '#006ffe', YE = '#e3b62c';
  // helper: the Latin form by the Bulgarian Streamlined System (Transliteration Act 2009): щ sht, ъ a, ь y, ю yu,
  // я ya, but -ия at the end of a word is -ia (София -> Sofia)
  const LAT = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sht', ъ: 'a', ь: 'y', ю: 'yu', я: 'ya' };
  const translit = (s) => {
    let out = '';
    const low = s.toLowerCase();
    for (let i = 0; i < low.length; i++) {
      const c = low[i], up = s[i] !== c;
      let r = c === 'я' && low[i - 1] === 'и' && !/[а-я]/.test(low[i + 1] || '') ? 'a' : LAT[c] ?? c;
      if (up && r) r = r[0].toUpperCase() + r.slice(1);
      out += r;
    }
    return out;
  };
  // helper: a name split into two lines at the space (or after the hyphen) nearest its middle; null if it has none
  const split2 = (s) => {
    let best = null;
    for (let i = 1; i < s.length - 1; i++) {
      const c = s[i] === ' ' ? [s.slice(0, i), s.slice(i + 1)] : s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : null;
      if (c && (!best || Math.max(c[0].length, c[1].length) < Math.max(best[0].length, best[1].length))) best = c;
    }
    return best;
  };
  const lines = (s, maxw, max, cw) => (s.length * cw * max * 0.75 > maxw && split2(s)) || [s];
  const caps = (s) => s.toLocaleUpperCase('bg');

  // entry/exit: Cyrillic name over the Latin one, same size, black border; the plate grows with the name up to
  // 1000 wide, then a two-word name goes on two lines in each script (the plate grows taller)
  const town = (name, alt, end) => {
    const lat = alt || translit(name), max = 150, cw = 0.66;
    const wrap = Math.max(name.length, lat.length) * cw * max * 0.75 > 880;
    const ls = wrap ? [...(split2(name) || [name]), ...(split2(lat) || [lat])] : [name, lat];
    const W = Math.round(Math.min(1000, Math.max(640, Math.max(...ls.map((l) => l.length)) * cw * max + 120)));
    const H = 527 + (ls.length - 2) * 198;
    return svg(W, H,
      `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="#fff" stroke="#e2e2e2" stroke-width="2"/><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="40" fill="#fff" stroke="#000" stroke-width="13"/>` +
      ls.map((l, i) => T(W / 2, 246 + i * 198, l, max, F, { weight: 600, ls: 0.1, maxw: W - 130, max })).join('') +
      (end ? `<clipPath id="bg-x"><rect x="23" y="23" width="${W - 46}" height="${H - 46}" rx="34"/></clipPath><path clip-path="url(#bg-x)" d="M23,${H - 23} L${W - 23},23" stroke="${RD}" stroke-width="44"/>` : ''));
  };
  // Cyrillic and Latin capitals of a name, each wrapped to two smaller lines when long
  const pair = (x, y, name, alt, maxw, max, o) => {
    const a = lines(caps(name), maxw, max, 0.46), b = lines(caps(alt || translit(name)), maxw, max, 0.46);
    const all = [...a.map((l) => [l, BG]), ...b.map((l) => [l, ''])], sz = all.length > 2 ? max * 0.72 : max;
    return [all.map(([l, lang], i) => T(x, y + i * sz * 1.12, l, sz, FC, { fill: '#fff', weight: 'bold', maxw, max: sz, extra: lang, ...o })).join(''), all.length * sz * 1.12];
  };
  const upArrow = (x, y, s) => `<path d="M${x - 9 * s},${y + 52 * s} L${x - 9 * s},${y + 6 * s} L${x - 28 * s},${y + 6 * s} L${x},${y - 34 * s} L${x + 28 * s},${y + 6 * s} L${x + 9 * s},${y + 6 * s} L${x + 9 * s},${y + 52 * s} Z" fill="#fff"/>`;

  const bg = [
    { id: 'nachalo', kind: 'entry', label: 'Town entry', draw: ({ name, alt }) => town(name, alt, false) },
    { id: 'kray', kind: 'exit', label: 'Town exit', draw: ({ name, alt }) => town(name, alt, true) },
    // motorway destination: green, Cyrillic over Latin capitals, arrows ahead on both sides
    { id: 'magistrala', kind: 'motorway', label: 'Motorway direction (green)', draw: ({ name, alt }) => {
      const [txt, h] = pair(320, 0, name, alt, 380, 82, {});
      const H = Math.max(281, h + 80), y0 = (H - h) / 2 + 66;
      return svg(640, H, `<rect x="0" y="0" width="640" height="${H}" fill="${GR}"/><rect x="9" y="9" width="622" height="${H - 18}" rx="22" fill="none" stroke="#fff" stroke-width="7"/>` +
        txt.replace(/ y="(-?[\d.]+)"/g, (m, v) => ` y="${(+v + y0).toFixed(1)}"`) + upArrow(80, H / 2 - 12, 1.45) + upArrow(560, H / 2 - 12, 1.45)); } },
    // first-class road destination: blue, capitals to the left, arrow up-right
    { id: 'parvoklasen', kind: 'direction', label: 'Main road direction (blue)', draw: ({ name, alt }) => {
      const [txt, h] = pair(58, 0, name, alt, 410, 82, { anchor: 'start' });
      const H = Math.max(281, h + 80), y0 = (H - h) / 2 + 66;
      return svg(640, H, `<rect x="0" y="0" width="640" height="${H}" fill="${BL}"/><rect x="9" y="9" width="622" height="${H - 18}" rx="22" fill="none" stroke="#fff" stroke-width="7"/>` +
        txt.replace(/ y="(-?[\d.]+)"/g, (m, v) => ` y="${(+v + y0).toFixed(1)}"`) +
        `<g transform="translate(560,${H / 2}) rotate(45)">` + upArrow(0, -6, 1.5).replace('<path', '<path') + '</g>'); } },
    // older local arrow: black Cyrillic name on yellow, arrow point to the left
    { id: 'zhalta-strelka', kind: 'direction', label: 'Local direction arrow (yellow)', draw: ({ name }) => {
      // GeoHints 101: a thin black border at the edge that widens into a black point; the yellow field's own point is
      // blunter (TS.arrows.plate)
      const max = 108, W = Math.round(Math.min(1000, Math.max(640, name.length * 0.5 * max + 216)));
      const pl = TS.arrows.plate({ x: 3, y: 3, w: W - 6, h: 194, dir: 'left', tip: 126, r: 6, rTip: 6, fill: YE, ink: '#111', band: 5.5, fieldTip: 0.66 });
      return svg(W, 200, pl.svg +
        T((W + pl.neck) / 2, 138, name, max, FC, { fill: '#111', weight: 600, maxw: W - pl.neck - 48, max })); } },
  ];

  TS.add('BG', bg, {});
})();
