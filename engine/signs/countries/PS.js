// PS: signs carrying a Palestinian place name, drawn after Commons photos (no GeoHints pictures exist; see
// examples/PS.json). On the main West Bank roads (run by Israel) the towns are signed on Israeli green boards in Hebrew,
// Arabic and English, top to bottom.
// name = Arabic (the quiz's local name); alt = English form on the sign (Bir Zeit, Rawabi); alt2 = Hebrew form on the
// Israeli boards (ביר זית). Neither follows from the Arabic by a fixed rule, so both are in `needs`; without alt2 the
// board is drawn in Arabic and English only.
(function () {
  const { T, svg } = TS;
  const HE = "'Noto Sans Hebrew',sans-serif";
  const AR = "'Noto Naskh Arabic',sans-serif";
  const LA = "'TeX Gyre Heros','Arimo',sans-serif";
  const GREEN = '#007b55';

  const em = (s, k) => [...String(s || '')].reduce((a, c) => a + (c === ' ' ? 0.27 : k === 'he' ? 0.6 : k === 'ar' ? (/[ً-ٟ]/.test(c) ? 0 : 0.42) : /[A-Z]/.test(c) ? 0.74 : /[il'’.\-]/.test(c) ? 0.3 : 0.62), 0);
  const halves = (s) => {
    const sp = [...s].map((c, i) => (c === ' ' || c === '-' ? i : -1)).filter((i) => i > 0);
    if (!sp.length) return [s];
    const i = sp.reduce((b, c) => (Math.abs(c - s.length / 2) < Math.abs(b - s.length / 2) ? c : b));
    return s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : [s.slice(0, i), s.slice(i + 1)];
  };
  // Hebrew (if known), Arabic, English lines; an English line much wider than the others goes on two lines
  const lines = (o, S, room) => {
    const L = [];
    if (o.alt2) L.push({ t: o.alt2, f: HE, k: 'he', s: S, w: 700, h: S * 1.2, d: S * 0.2 });
    L.push({ t: o.name, f: AR, k: 'ar', s: S * 0.95, w: 700, h: S * 1.32, d: S * 0.36 });
    if (o.alt) {
      const E = S * 0.84, wide = em(o.alt, 'la') * E, other = Math.max(em(o.name, 'ar') * S, em(o.alt2, 'he') * S, 7 * S);
      for (const t of wide > room || wide > other * 1.15 ? halves(o.alt) : [o.alt]) L.push({ t, f: LA, k: 'la', s: E, w: 'bold', h: E * 1.14, d: E * 0.2, ls: 0.05 });
    }
    return L;
  };
  const tall = (L) => L.reduce((a, l) => a + l.h, 0);
  const widest = (L) => Math.max(...L.map((l) => em(l.t, l.k) * l.s * (l.ls ? 1.06 : 1)));
  const put = (L, x, y, room, anchor = 'middle') => { let out = ''; for (const l of L) { y += l.h; out += T(x, y - l.d, l.t, l.s, l.f, { fill: '#fff', anchor, weight: l.w, ls: l.ls || 0, maxw: room, max: l.s }); } return out; };
  const arrow = (x, y, deg, s) => `<g transform="translate(${x},${y}) rotate(${deg}) scale(${s})"><path d="M-7,34 L-7,-6 L-24,-6 L0,-36 L24,-6 L7,-6 L7,34 Z" fill="#fff"/></g>`;
  const board = (W, H) => `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="16" fill="${GREEN}"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="11" fill="none" stroke="#fff" stroke-width="5"/>`;

  const ps = [
    { id: 'green', kind: 'direction', label: 'Turn-off board, West Bank road (green)', needs: ['alt', 'alt2'],
      // Israeli green board at a turn-off: arrow at the side, Hebrew, Arabic and English stacked beside it
      draw: (o) => {
        const S = 64, col = 150, pad = 36, L = lines(o, S, 620), left = o.dir === 'left';
        const W = Math.round(Math.min(940, Math.max(520, widest(L) + col + pad * 2))), H = Math.round(Math.max(260, tall(L) + 60)), room = W - col - pad * 2;
        const cx = left ? col + (W - col) / 2 - 10 : (W - col) / 2 + 10;
        return svg(W, H, board(W, H) + put(L, cx, (H - tall(L)) / 2 - 4, room) + arrow(left ? col / 2 + 12 : W - col / 2 - 12, H / 2, left ? -90 : 90, 1.5));
      } },
    { id: 'green-tall', kind: 'direction', label: 'Upright board, West Bank road (green)', needs: ['alt', 'alt2'],
      // upright Israeli green board: Hebrew on top, the arrow under it, then Arabic and English
      draw: (o) => {
        const S = 60, pad = 34, L = lines(o, S, 400), top = o.alt2 ? [L[0]] : [], rest = o.alt2 ? L.slice(1) : L;
        const W = Math.round(Math.min(640, Math.max(330, widest(L) + pad * 2))), room = W - pad * 2, ah = 96;
        const H = Math.round(tall(top) + ah + tall(rest) + 54);
        return svg(W, H, board(W, H) + put(top, W / 2, 22, room) + arrow(W / 2, 22 + tall(top) + ah / 2 + 4, o.dir === 'left' ? -90 : 90, 1.3) + put(rest, W / 2, 22 + tall(top) + ah, room));
      } },
    { id: 'local', kind: 'direction', label: 'Local destination arrow (white)', needs: ['alt', 'alt2'],
      // the Israeli white pointed board with a black edge, used on West Bank roads for Palestinian towns too (Jericho):
      // Hebrew, Arabic, English in black
      draw: (o) => {
        const S = 62, L = lines(o, S, 620), right = o.dir !== 'left', pad = 46;
        const H = Math.round(tall(L) + 44), P = Math.round(H * 0.4);
        const W = Math.round(Math.min(760, Math.max(H * 1.15, widest(L) + pad * 2))), tot = W + P, x0 = right ? 0 : P;
        const shape = (i) => right
          ? `M${i + 18},${i} L${W},${i} L${tot - i * 1.25},${H / 2} L${W},${H - i} L${i + 18},${H - i} Q${i},${H - i} ${i},${H - i - 18} L${i},${i + 18} Q${i},${i} ${i + 18},${i} Z`
          : `M${tot - i - 18},${i} L${P},${i} L${i * 1.25},${H / 2} L${P},${H - i} L${tot - i - 18},${H - i} Q${tot - i},${H - i} ${tot - i},${H - i - 18} L${tot - i},${i + 18} Q${tot - i},${i} ${tot - i - 18},${i} Z`;
        let out = '', y = 14;
        for (const l of L) { y += l.h; out += T(x0 + W / 2, y - l.d, l.t, l.s, l.f, { fill: '#111', weight: l.w, ls: l.ls || 0, maxw: W - pad * 2, max: l.s }); }
        // (Jericho and Shomronim photos) a white margin, then a thin black line that thickens along the point into a black
        // wedge at the tip: the white field's own point is blunter (TS.arrows.plate)
        const pl = TS.arrows.plate({ x: 1, y: 1, w: tot - 2, h: H - 2, dir: right ? 'right' : 'left', tip: P, r: 18, rTip: 4, rNeck: 2, fill: '#fff', ink: '#111',
          edge: '#777', edgeW: 1.5, margin: 0.03 * H, band: 0.035 * H, fieldTip: 0.68, fieldNeck: -0.04 * H, rField: 12 });
        return svg(tot, H, pl.svg + out);
      } },
  ];
  TS.add('PS', ps, {});
})();
