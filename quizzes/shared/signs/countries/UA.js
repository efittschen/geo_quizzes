// UA: signs carrying a place name, drawn after the GeoHints pictures (see examples/UA.json for which).
(function () {
  const { T, svg } = TS;
  // the pictured (pre-2021) signs: bold grotesque capitals, Arial-like on the town signs; Arimo stands in
  const F = "'Arimo','Noto Sans',sans-serif";
  const BL = '#005ca1', RD = '#fe3300', K = '#1e1a17';
  // helper: the Latin form of a Ukrainian name by the national romanisation (Cabinet of Ministers resolution 55,
  // 2010): є ї й ю я are ye yi y yu ya at the start of a word and ie i i iu ia elsewhere, зг is zgh, ь and ' drop
  const LAT = { а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'iu', я: 'ia', "'": '', '’': '', 'ʼ': '' };
  const INIT = { є: 'ye', ї: 'yi', й: 'y', ю: 'yu', я: 'ya' };
  const translit = (s) => {
    let out = '', start = true;
    const low = s.toLowerCase();
    for (let i = 0; i < low.length; i++) {
      const c = low[i], up = s[i] !== c;
      let r = c === 'г' && low[i - 1] === 'з' ? 'gh' : start && INIT[c] ? INIT[c] : LAT[c] ?? c;
      if (up && r) r = r[0].toUpperCase() + r.slice(1);
      out += r; start = !/[а-яґєії'’ʼ]/.test(c);
    }
    return out;
  };
  const caps = (s) => s.toLocaleUpperCase('uk');
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

  // settlement entry/exit: white (black name, black border) or blue (white name); the exit has a red bar
  const town = (name, blue, end) => {
    const ls = lines(caps(name), 540, 170, 0.72);
    const H = ls.length > 1 ? 380 : 228, ys = ls.length > 1 ? [172, 330] : [176];
    const ink = blue ? '#fff' : K;
    return svg(600, H,
      `<rect x="1" y="1" width="598" height="${H - 2}" rx="26" fill="${blue ? '#fff' : '#fff'}" stroke="#c8c8c8" stroke-width="2"/>` +
      (blue ? `<rect x="7" y="7" width="586" height="${H - 14}" rx="21" fill="${BL}"/>` : `<rect x="9" y="9" width="582" height="${H - 18}" rx="20" fill="#fff" stroke="${K}" stroke-width="7"/>`) +
      ls.map((l, i) => T(300, ys[i], l, 170, F, { fill: ink, weight: 'bold', maxw: 524, max: 170 })).join('') +
      // exit bar (group B): broad and steep (35 deg), in front of the name, running up to the frame (white) or the edge of
      // the blue field and cut flat there; it crosses mid-height a little right of centre on the white sign, a little
      // left on the blue one (as on the pictures), at the centre on two-line signs
      (end ? (() => {
        const cx = ls.length > 1 ? 300 : blue ? 294 : 326, k = 1.42;
        const box = blue ? [7, 7, 586, H - 14, 21] : [12.5, 12.5, 575, H - 25, 16.5];
        return TS.exitbar({ box, from: [cx - k * H / 2, H], to: [cx + k * H / 2, 0], width: 45, fill: RD });
      })() : ''));
  };
  // a place in capitals with its Latin form under it, both wrapped when long
  const pair = (x, y, name, alt, maxw, max, o = {}) => {
    const a = lines(caps(name), maxw, max, 0.74), b = [caps(alt || translit(name))];   // the Latin line stays one line
    let out = '', yy = y;
    for (const l of a) { out += T(x, yy, l, max, F, { fill: '#fff', weight: 'bold', ls: 0.06, maxw, max, ...o }); yy += max * 1.02; }
    yy -= max * 0.24;
    for (const l of b) { out += T(x, yy, l, max * 0.62, F, { fill: '#fff', weight: 'bold', ls: 0.1, maxw, max: max * 0.62, ...o }); yy += max * 0.7; }
    return [out, yy];
  };

  const ua = [
    { id: 'pochatok', kind: 'entry', label: 'Settlement entry (white)', draw: ({ name }) => town(name, false, false) },
    { id: 'kinets', kind: 'exit', label: 'Settlement exit (white)', draw: ({ name }) => town(name, false, true) },
    { id: 'pochatok-synii', kind: 'entry', label: 'Settlement entry (blue)', draw: ({ name }) => town(name, true, false) },
    { id: 'kinets-synii', kind: 'exit', label: 'Settlement exit (blue)', draw: ({ name }) => town(name, true, true) },
    // advance junction diagram: the place ahead (top left), the next town to the left by a loop, road plate, distance
    { id: 'poperednii', kind: 'direction', label: 'Advance junction diagram (blue)', draw: ({ name, alt, next, road }) => {
      const [top] = pair(26, 62, name, alt, 220, lines(caps(name), 220, 48, 0.74).length > 1 ? 36 : 48, { anchor: 'start' });
      const [left] = pair(26, 300, next, null, 230, 40, { anchor: 'start' });
      return svg(440, 400,
        `<rect x="2" y="2" width="436" height="396" rx="6" fill="${BL}" stroke="#e8eaee" stroke-width="4"/>` + top + left +
        `<g fill="none" stroke="#e8eaee" stroke-width="16"><path d="M276,392 L276,66"/><path d="M276,184 L250,184 Q222,184 222,212 L222,234 Q222,246 210,246 L66,246"/></g>` +
        `<path d="M276,22 L250,68 L302,68 Z M30,246 L70,222 L70,270 Z" fill="#e8eaee"/>` +
        `<rect x="314" y="26" width="112" height="46" rx="10" fill="none" stroke="#e8eaee" stroke-width="4"/>` + T(370, 62, road, 38, F, { fill: '#e8eaee', weight: 'bold', ls: 0.06, maxw: 96, max: 38 }) +
        T(150, 382, '300м', 40, F, { fill: '#e8eaee', weight: 'bold' })); } },
    // direction tables: the place ahead (up arrow) above the next town to the right, each with its Latin form
    { id: 'napriamok', kind: 'direction', label: 'Direction tables (blue)', draw: ({ name, alt, next }) => {
      const [a, ay] = pair(150, 84, name, alt, 380, 62, { anchor: 'start' });
      const h1 = Math.max(170, ay - 10);
      const [b, by] = pair(150, h1 + 82, next, null, 300, 52, { anchor: 'start' });
      const H = Math.max(h1 + 160, by + 6);
      return svg(560, H,
        `<rect x="2" y="2" width="556" height="${H - 4}" rx="6" fill="${BL}" stroke="#eef0f2" stroke-width="5"/><path d="M4,${h1} L556,${h1}" stroke="#eef0f2" stroke-width="5"/>` +
        `<path d="M78,${h1 - 22} L78,82 L50,82 L88,26 L126,82 L98,82 L98,${h1 - 22} Z" fill="#eef0f2"/>` + a + b +
        `<path d="M462,${(h1 + H) / 2 - 12} L500,${(h1 + H) / 2 - 12} L500,${(h1 + H) / 2 - 30} L536,${(h1 + H) / 2} L500,${(h1 + H) / 2 + 30} L500,${(h1 + H) / 2 + 12} L462,${(h1 + H) / 2 + 12} Z" fill="#eef0f2"/>`); } },
    // white town advance sign: the place ahead in a blue field, the next town to the left, distance
    { id: 'miskyi', kind: 'direction', label: 'Town advance sign (white)', draw: ({ name, next }) => {
      const nl = lines(caps(next), 250, 60, 0.72);
      const bw = Math.round(Math.min(600, Math.max(250, name.length * 0.74 * 58 + 30)));   // the blue field grows with the name
      return svg(640, 500,
        `<rect x="1" y="1" width="638" height="498" rx="20" fill="#fff" stroke="#d0d0d0" stroke-width="2"/><rect x="9" y="9" width="622" height="482" rx="16" fill="#fff" stroke="#000" stroke-width="8"/>` +
        `<rect x="${325 - bw / 2}" y="30" width="${bw}" height="84" rx="8" fill="${BL}"/>` + T(325, 92, caps(name), 58, F, { fill: '#fff', weight: 'bold', maxw: bw - 26, max: 58 }) +
        nl.map((l, i) => T(150, (nl.length > 1 ? 232 : 280) + i * 64, l, 60, F, { fill: '#000', weight: 'bold', maxw: 260, max: 60 })).join('') +
        `<path d="M325,486 L325,190 M325,368 Q325,346 302,346 L190,346" fill="none" stroke="#000" stroke-width="22"/>` +
        `<path d="M325,140 L292,196 L358,196 Z M126,346 L196,312 L196,380 Z" fill="#000"/>` + T(205, 470, '150м', 48, F, { fill: '#000', weight: 'bold' })); } },
  ];

  TS.add('UA', ua, { next: 'Лісне', road: 'М-06' });
})();
