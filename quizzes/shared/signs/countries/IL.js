// IL: Israeli signs carrying a place name, drawn after the GeoHints direction-sign pictures and Commons photos (see
// examples/IL.json). Signs are in Hebrew, Arabic and English, in that order from the top.
// Fields: name = Hebrew, alt = English (Latin) form, alt2 = Arabic form (own field: a third script). Neither follows from
// the Hebrew by a fixed rule, so both are in `needs`; without alt2 the sign is drawn in Hebrew and English only, as many
// older signs are (GeoHints direction-signs 47).
(function () {
  const { T, svg, esc } = TS;
  const HE = "'Noto Sans Hebrew',sans-serif";
  const AR = "'Noto Naskh Arabic',sans-serif";
  const LA = "'TeX Gyre Heros','Arimo',sans-serif";
  const GREEN = '#007b55', BLUE = '#0d5eaf', INK = '#111';
  const SHIELD = { 1: '#1f5fb4', 2: '#d71920', 3: '#0e6d50', 4: '#2b2b2b' };   // route plate colour by number of digits

  // rough width of a text at font-size 1 (em), per script, to size the panel before the real font measures it
  const em = (s, kind) => {
    const str = String(s || '');
    if (kind === 'he') return [...str].reduce((a, c) => a + (c === ' ' ? 0.28 : /[֐-׿]/.test(c) ? 0.6 : 0.4), 0);
    if (kind === 'ar') return [...str].reduce((a, c) => a + (c === ' ' ? 0.25 : /[ً-ٟ]/.test(c) ? 0 : 0.42), 0);
    return [...str].reduce((a, c) => a + (c === ' ' ? 0.3 : /[A-Z]/.test(c) ? 0.72 : /[il'’.\-]/.test(c) ? 0.3 : 0.6), 0) * 1.06;
  };
  // the English line split in two at the space or hyphen nearest the middle (the signs wrap long Latin names so)
  const wrap = (s) => {
    const cuts = [...s].map((c, i) => (c === ' ' || c === '-' ? i : -1)).filter((i) => i > 0);
    if (!cuts.length) return [s];
    const i = cuts.reduce((b, c) => (Math.abs(c - s.length / 2) < Math.abs(b - s.length / 2) ? c : b));
    return s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : [s.slice(0, i), s.slice(i + 1)];
  };
  // the three (or two) lines of a destination: Hebrew, Arabic, English; English wraps when it would not fit `room`
  const lines = ({ name, alt, alt2 }, size, room) => {
    const L = [{ t: name, f: HE, k: 'he', s: size, w: 700, gap: 1.18 }];
    if (alt2) L.push({ t: alt2, f: AR, k: 'ar', s: size * 0.92, w: 700, gap: 1.28 });
    if (alt) {
      // the signs keep the board compact: a Latin line much wider than the Hebrew one goes on two lines (GeoHints 48)
      const wide = em(alt, 'la') * size * 0.86, heb = em(name, 'he') * size;
      const parts = wide > room || (wide > Math.max(heb, 7 * size) * 1.15) ? wrap(alt) : [alt];
      for (const p of parts) L.push({ t: p, f: LA, k: 'la', s: size * 0.86, w: 'bold', gap: 1.12, ls: 0.05 });
    }
    return L;
  };
  const need = (L) => Math.max(...L.map((l) => em(l.t, l.k) * l.s + (l.ls ? l.ls * l.s * String(l.t).length : 0)));
  const height = (L) => L.reduce((a, l) => a + l.s * l.gap, 0);
  // draw the lines centred on x from the top y; returns the SVG
  const stack = (L, x, y, maxw, fill, anchor = 'middle') => {
    let out = '', yy = y;
    for (const l of L) {
      yy += l.s * l.gap;
      const base = yy - l.s * (l.k === 'ar' ? 0.32 : 0.18);
      out += T(x, base, l.t, l.s, l.f, { fill, anchor, weight: l.w, ls: l.ls || 0, maxw, max: l.s });
    }
    return out;
  };
  // Israeli route plate: coloured rounded frame round a white octagon, number in the frame colour
  const shield = (cx, cy, w, num, edge = '#fff') => {
    const n = String(num), c = SHIELD[Math.min(4, n.length)] || SHIELD[4], k = w / 640, h = 466 * k;
    const P = [[320, 62], [550, 90], [575, 233], [550, 376], [320, 404], [90, 376], [65, 233], [90, 90]].map(([a, b]) => `${(cx - w / 2 + a * k).toFixed(1)},${(cy - h / 2 + b * k).toFixed(1)}`).join(' ');
    return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${70 * k}" fill="#fff" stroke="${edge === '#fff' ? '#999' : edge}" stroke-width="${3 * k}"/>` +
      `<rect x="${cx - w / 2 + 28 * k}" y="${cy - h / 2 + 28 * k}" width="${584 * k}" height="${410 * k}" rx="${50 * k}" fill="${c}"/><polygon points="${P}" fill="#fff"/>` +
      T(cx, cy + 92 * k, n, 260 * k, LA, { fill: c, weight: 'bold', maxw: 440 * k, max: 260 * k });
  };
  // a sign arrow (filled shaft and head) pointing at angle deg (0 = up, 45 = up-right, 90 = right, 180 = down, -90 = left)
  const arrow = (x, y, deg, s, fill) => `<g transform="translate(${x},${y}) rotate(${deg}) scale(${s})"><path d="M-7,34 L-7,-6 L-24,-6 L0,-36 L24,-6 L7,-6 L7,34 Z" fill="${fill}"/></g>`;

  const il = [
    { id: 'local', kind: 'direction', label: 'Local destination arrow (white)', needs: ['alt', 'alt2'],
      // white pointed board with a black border following the point; black text; used at the turn-off to every locality
      draw: (o) => {
        const size = 62, L = lines(o, size, 640), right = o.dir !== 'left';
        const H = Math.round(height(L) + 44), P = Math.round(H * 0.4), pad = 46;
        const W = Math.round(Math.min(760, Math.max(H * 1.15, need(L) + pad * 2)));
        const tot = W + P, x0 = right ? 0 : P;
        const shape = (i) => right
          ? `M${i + 18},${i} L${W},${i} L${tot - i * 1.25},${H / 2} L${W},${H - i} L${i + 18},${H - i} Q${i},${H - i} ${i},${H - i - 18} L${i},${i + 18} Q${i},${i} ${i + 18},${i} Z`
          : `M${tot - i - 18},${i} L${P},${i} L${i * 1.25},${H / 2} L${P},${H - i} L${tot - i - 18},${H - i} Q${tot - i},${H - i} ${tot - i},${H - i - 18} L${tot - i},${i + 18} Q${tot - i},${i} ${tot - i - 18},${i} Z`;
        return svg(tot, H, `<path d="${shape(1.5)}" fill="#fff" stroke="#777" stroke-width="2"/><path d="${shape(13)}" fill="none" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>` +
          stack(L, x0 + W / 2 + (right ? 0 : 0), 14, W - pad * 2, INK));
      } },
    { id: 'green', kind: 'direction', label: 'Direction sign, main road (green)', needs: ['alt', 'alt2'], defaults: { road: '425' },
      // green board, white border; destination in three lines, arrow at the upper right, route plate below it
      draw: (o) => {
        const size = 66, L = lines(o, size, 760), deg = o.arrow ?? 45;
        const col = 170, pad = 40, H = Math.max(300, Math.round(height(L) + 60));
        const W = Math.round(Math.min(1000, Math.max(560, need(L) + pad * 2 + col)));
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="20" fill="${GREEN}"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="14" fill="none" stroke="#fff" stroke-width="6"/>` +
          stack(L, (W - col) / 2 + 10, (H - height(L)) / 2 - 8, W - col - pad * 2, '#fff') +
          arrow(W - col / 2 - 6, 88, deg, 1.45, '#fff') + shield(W - col / 2 - 6, H - 82, 128, o.road));
      } },
    { id: 'freeway', kind: 'motorway', label: 'Freeway overhead sign (blue)', needs: ['alt', 'alt2'],
      // blue overhead board: destination lines, then the lane arrows pointing down with the route plate between them
      draw: (o) => {
        const size = 80, L = lines(o, size, 700), pad = 50;
        const H = Math.round(height(L) + 150), W = Math.round(Math.min(900, Math.max(H * 1.6, need(L) + pad * 2)));
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="16" fill="${BLUE}"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="11" fill="none" stroke="#fff" stroke-width="6"/>` +
          stack(L, W / 2, 16, W - pad * 2, '#fff') +
          arrow(W * 0.18, H - 66, 180, 1.35, '#fff') + arrow(W * 0.82, H - 66, 180, 1.35, '#fff') + shield(W / 2, H - 68, 130, o.road));
      } },
  ];

  TS.add('IL', il, { road: '1' });
})();
