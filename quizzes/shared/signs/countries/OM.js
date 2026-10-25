// OM: Omani signs carrying a place name, drawn after Commons photos (no GeoHints direction-sign pictures exist; see
// examples/OM.json). British-style blue boards: Arabic with the distance in Arabic-Indic digits (٢ كم), the English
// form with "km". name = Arabic; alt = English form on the sign (Quroon A' Sayd, Khasab; no fixed rule, so it is in
// `needs`; without it the board shows the Arabic alone).
(function () {
  const { T, svg } = TS;
  const AR = "'Noto Naskh Arabic',sans-serif";
  const TR = "'Overpass','Arimo',sans-serif";   // stands in for Transport Medium
  const BLUE = '#1d4f9c';
  const IND = (n) => String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);   // Arabic-Indic digits, a fixed rule
  const latin = (s) => /[A-Za-z]/.test(String(s)) && !/[؀-ۿ]/.test(String(s));
  // the quiz has a few places with only a Latin name: then that name is the English line and the Arabic line is left out
  const forms = (o) => (latin(o.name) ? { ar: '', en: o.alt || o.name } : { ar: o.name, en: o.alt || '' });

  const emA = (s) => [...String(s)].reduce((a, c) => a + (c === ' ' ? 0.24 : /[ً-ٰٟ]/.test(c) ? 0 : 0.42), 0);
  const emL = (s, caps) => [...String(s)].reduce((a, c) => a + (c === ' ' ? 0.28 : caps || /[A-Z]/.test(c) ? 0.7 : /[iljtf'’.\-]/.test(c) ? 0.3 : /[mw]/.test(c) ? 0.85 : 0.58), 0);
  const arrow = (x, y, deg, s, fill = '#fff') => `<g transform="translate(${x},${y}) rotate(${deg}) scale(${s})"><path d="M-7,34 L-7,-4 L-24,-4 L0,-36 L24,-4 L7,-4 L7,34 Z" fill="${fill}"/></g>`;
  const openArrow = (x, y, s, fill = '#fff') => `<g transform="translate(${x},${y}) scale(${s})"><path d="M0,-34 L0,22 M-26,0 L0,30 L26,0" fill="none" stroke="${fill}" stroke-width="8" stroke-linejoin="miter"/></g>`;

  const om = [
    { id: 'pointer', kind: 'direction', label: 'Direction pointer (blue)', needs: ['alt'],
      // blue board pointed towards the turn, thin white edge; Arabic with the distance first (٢ كم), the English form
      // with the distance after it
      draw: (o) => {
        const f = forms(o), A = 66, E = 58, right = o.dir !== 'left';
        const arT = f.ar ? `${IND(o.km)} كم ${f.ar}` : '', enT = f.en ? `${f.en} ${o.km} km` : '';
        const body = Math.round(Math.min(980, Math.max(460, emA(arT) * A + 70, emL(enT) * E + 70))), P = 90, W = body + P;
        const rows = (arT ? 1 : 0) + (enT ? 1 : 0), H = Math.round(rows * 84 + 52);
        const x0 = right ? 0 : P, room = body - 60;
        const edge = (i) => right
          ? `M${i + 6},${i} L${body - i * 0.4},${i} L${W - i * 1.6},${H / 2} L${body - i * 0.4},${H - i} L${i + 6},${H - i} Q${i},${H - i} ${i},${H - i - 6} L${i},${i + 6} Q${i},${i} ${i + 6},${i} Z`
          : `M${W - i - 6},${i} L${P + i * 0.4},${i} L${i * 1.6},${H / 2} L${P + i * 0.4},${H - i} L${W - i - 6},${H - i} Q${W - i},${H - i} ${W - i},${H - i - 6} L${W - i},${i + 6} Q${W - i},${i} ${W - i - 6},${i} Z`;
        // the white edge runs at the board's rim, no blue outside it (Commons Dibba photo)
        let out = `<path d="${edge(0)}" fill="#f2f4f6"/><path d="${edge(4.5)}" fill="${BLUE}"/>` + TS.frames.rim(W, H, 0, { d: edge(0) }), y = 26;
        if (arT) { y += 84; out += T(x0 + 30, y - 24, arT, A, AR, { fill: '#fff', anchor: 'start', weight: 700, maxw: room, max: A }); }
        if (enT) { y += 84; out += T(x0 + 30, y - 22, enT, E, TR, { fill: '#fff', anchor: 'start', weight: 600, maxw: room, max: E }); }
        return svg(W, H, out);
      } },
    { id: 'panel', kind: 'direction', label: 'Direction panel with arrow (blue)', needs: ['alt'],
      // blue panel of a junction stack: Arabic name with ٢ كم, the English name with km, arrow pointing the way
      draw: (o) => {
        const f = forms(o), A = 58, E = 50, left = o.dir === 'left', W = 560, col = 110, room = W - col - 50;
        const H = Math.round(((f.ar ? 1 : 0) + (f.en ? 1 : 0)) * 74 + 46);
        // the distance stands next to the arrow, the name at the far side
        const near = left ? col + 10 : W - col - 10, far = left ? W - 30 : 30, na = left ? 'start' : 'end', fa = left ? 'end' : 'start';
        // as in the Wadi Bani Awf photo: the white rim runs along the very edge (no blue outside it), and the panel stands
        // on two posts striped black and white
        const PH = 170, pw = 22, band = 26, Ht = H + PH;
        const post = (x) => `<rect x="${x - pw / 2}" y="${H - 6}" width="${pw}" height="${PH + 6}" fill="#f4f4f2" stroke="#888" stroke-width="1"/>` +
          Array.from({ length: Math.ceil((PH + 6) / (2 * band)) }, (_, i) => `<rect x="${x - pw / 2}" y="${H - 6 + i * 2 * band}" width="${pw}" height="${Math.min(band, Ht - (H - 6 + i * 2 * band))}" fill="#151515"/>`).join('');
        let out = post(W * 0.15) + post(W * 0.85) + `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="6" fill="#fff" stroke="#9a9a9a" stroke-width="1"/><rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="3" fill="${BLUE}"/>`, y = 22;
        if (f.ar) { y += 74; out += T(far, y - 22, f.ar, A, AR, { fill: '#fff', anchor: fa, weight: 700, maxw: room - 150, max: A }) + T(near, y - 22, `${IND(o.km)} كم`, A, AR, { fill: '#fff', anchor: na, weight: 700 }); }
        if (f.en) { y += 74; out += T(far, y - 18, f.en, E, TR, { fill: '#fff', anchor: fa, weight: 600, maxw: room - 150, max: E }) + T(near, y - 18, `${o.km}Km`, E, TR, { fill: '#fff', anchor: na, weight: 600 }); }
        return svg(W, Ht, out + arrow(left ? col / 2 + 12 : W - col / 2 - 12, H / 2, left ? -90 : 90, 1.25));
      } },
    { id: 'overhead', kind: 'motorway', label: 'Overhead lane sign (blue)', needs: ['alt'],
      // blue overhead board: the English name in capitals at the left, the Arabic at the right on the same line, a rule
      // and the lane arrows pointing down
      draw: (o) => {
        const f = forms(o), A = 74, E = 62, en = f.en.toUpperCase();
        const W = Math.round(Math.min(1100, Math.max(620, emL(en, true) * E + emA(f.ar) * A + 150))), H = 290;
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="14" fill="${BLUE}"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="9" fill="none" stroke="#e8e8e8" stroke-width="5"/>` +
          (en ? T(52, 118, en, E, TR, { fill: '#fff', anchor: 'start', weight: 600, maxw: f.ar ? W * 0.55 : W - 104, max: E }) : '') +
          (f.ar ? T(W - 52, 120, f.ar, A, AR, { fill: '#fff', anchor: 'end', weight: 700, maxw: en ? W * 0.4 : W - 104, max: A }) : '') +
          `<line x1="${W * 0.16}" y1="168" x2="${W * 0.84}" y2="168" stroke="#fff" stroke-width="4"/>` + openArrow(W * 0.16, 222, 1.1) + openArrow(W * 0.84, 222, 1.1));
      } },
  ];
  TS.add('OM', om, { km: 12 });
})();
