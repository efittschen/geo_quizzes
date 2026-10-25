// LB: Lebanese signs carrying a place name, drawn after Commons photos (no GeoHints pictures exist; see examples/LB.json).
// Arabic above, the Latin form below (Lebanese French-style spellings: Jounieh, Zahle, Bcharre, Rechmaya).
// name = Arabic; alt = the Latin form on the sign (no fixed rule, so it is in `needs`; without it the board shows the
// Arabic alone).
(function () {
  const { T, svg } = TS;
  const AR = "'Noto Naskh Arabic',sans-serif";
  const LA = "'Arimo',sans-serif";                 // Arial-like Latin of the village boards
  const BLUE = '#1546a8';

  const emA = (s) => [...String(s)].reduce((a, c) => a + (c === ' ' ? 0.22 : /[ً-ٰٟ]/.test(c) ? 0 : 0.42), 0);
  const emL = (s, caps) => [...String(s)].reduce((a, c) => a + (c === ' ' ? 0.28 : caps || /[A-Z]/.test(c) ? 0.72 : /[iljtf'’.\-]/.test(c) ? 0.28 : 0.56), 0);
  const halves = (s) => {
    const sp = [...s].map((c, i) => (c === ' ' ? i : -1)).filter((i) => i > 0);
    if (!sp.length) return [s];
    const i = sp.reduce((b, c) => (Math.abs(c - s.length / 2) < Math.abs(b - s.length / 2) ? c : b));
    return [s.slice(0, i), s.slice(i + 1)];
  };
  // a centred column of lines {t, f, s, w, h (line height), d (baseline drop)}
  const column = (L, cx, y, room) => {
    let out = '';
    for (const l of L) { y += l.h; out += T(cx, y - l.d, l.t, l.s, l.f, { fill: '#fff', weight: l.w, maxw: room, max: l.s }); }
    return out;
  };
  const tall = (L) => L.reduce((a, l) => a + l.h, 0);
  const board = (W, H, body) => svg(W, H, `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="6" fill="#fff"/><rect x="7" y="7" width="${W - 14}" height="${H - 14}" rx="3" fill="${BLUE}"/>` + body);

  const lb = [
    { id: 'entry', kind: 'entry', label: 'Village name board (blue)', needs: ['alt'],
      // blue board with a white rim where a village begins: the Arabic name large, the Latin name in capitals below
      draw: (o) => {
        const W = 520, room = W - 70, A = 120, E = 66;
        const ar = emA(o.name) * A > room * 1.25 ? halves(o.name) : [o.name];
        const en = o.alt ? (emL(o.alt, true) * E > room * 1.3 ? halves(o.alt.toUpperCase()) : [o.alt.toUpperCase()]) : [];
        const L = [...ar.map((t) => ({ t, f: AR, s: ar.length > 1 ? A * 0.75 : A, w: 700, h: (ar.length > 1 ? A * 0.75 : A) * 1.2, d: (ar.length > 1 ? A * 0.75 : A) * 0.42 })),
          ...en.map((t) => ({ t, f: LA, s: E, w: 'bold', h: E * 1.2, d: E * 0.16 }))];
        const H = Math.round(Math.max(420, tall(L) + 80));
        return board(W, H, column(L, W / 2, (H - tall(L)) / 2 - 6, room));
      } },
    { id: 'welcome', kind: 'entry', label: 'Welcome board (blue)', needs: ['alt'],
      // blue board: Arabic name, ترحب بكم (welcomes you), the Latin name and Welcome below it; some villages put the
      // French "Bienvenue à" above the name instead (lang: 'fr')
      draw: (o) => {
        const W = 560, room = W - 70, A = 96, E = 76, fr = o.lang === 'fr';
        const ar = emA(o.name) * A > room * 1.2 ? halves(o.name) : [o.name];
        const en = o.alt ? (emL(o.alt) * E > room * 1.25 ? halves(o.alt) : [o.alt]) : [];
        const L = [...ar.map((t) => ({ t, f: AR, s: A, w: 700, h: A * 1.12, d: A * 0.38 })), { t: 'ترحب بكم', f: AR, s: A * 0.72, w: 700, h: A * 0.9, d: A * 0.26 }];
        if (o.alt && fr) L.push({ t: 'Bienvenue à', f: LA, s: E * 0.62, w: 'bold', h: E * 0.8, d: E * 0.1 });
        for (const t of en) L.push({ t, f: LA, s: E, w: 'bold', h: E * 1.06, d: E * 0.14 });
        if (o.alt && !fr) L.push({ t: 'Welcome', f: LA, s: E * 0.6, w: 'bold', h: E * 0.72, d: E * 0.06 });
        const H = Math.round(Math.max(400, tall(L) + 96));
        return board(W, H, column(L, W / 2, (H - tall(L)) / 2 + 8, room));
      } },
  ];
  TS.add('LB', lb, {});
})();
