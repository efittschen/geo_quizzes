// CY: Cypriot signs carrying a place name (Republic of Cyprus), drawn after the GeoHints direction-sign pictures and
// Commons photos (see examples/CY.json). Greek in capitals (yellow on blue/green boards, black on white plates), the
// Latin form below in mixed case. name = Greek as written (accents allowed); alt = Latin form; without it, alt is
// computed from the Greek by the ELOT 743 romanisation Cyprus uses for its place names (Λεμεσός → Lemesos,
// Λευκωσία → Lefkosia, Ευρύχου → Evrychou).
(function () {
  const { T, svg } = TS;
  const GR = "'Arimo',sans-serif";   // Arial-like lettering of the Cypriot signs (Greek and Latin)
  const GREEN = '#0f8a4c', BLUE = '#1663c7', YEL = '#f9c623', AMBER = '#f2b632';

  // Greek capitals as on the signs: accents dropped, diaeresis kept
  const caps = (s) => String(s).normalize('NFD').replace(/́/g, '').normalize('NFC').toUpperCase();
  // ELOT 743 (Cyprus place names): digraphs first, then single letters; αυ/ευ/ηυ give v before vowels and voiced
  // consonants, f before voiceless ones and at the end; capitals follow the Greek
  const ONE = { α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p',
    ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o', ϊ: 'i', ϋ: 'y' };
  const TWO = { ου: 'ou', αι: 'ai', ει: 'ei', οι: 'oi', υι: 'yi', γγ: 'ng', γκ: 'gk', γξ: 'nx', γχ: 'nch', μπ: 'mp', ντ: 'nt' };
  const VOICED = 'αεηιουωβγδζλμνρϊϋ';
  const roman = (greek) => {
    const src = String(greek).normalize('NFD').replace(/́/g, '').normalize('NFC');
    const low = src.toLowerCase();
    let out = '';
    for (let i = 0; i < low.length;) {
      const up = src[i] !== low[i];
      const cap = (t) => (up ? t[0].toUpperCase() + (src[i + 1] && src[i + 1] !== low[i + 1] ? t.slice(1).toUpperCase() : t.slice(1)) : t);
      const two = low.slice(i, i + 2);
      if (/^[αεη]υ$/.test(two)) {
        const nx = low[i + 2];
        out += cap(ONE[two[0]] + (nx && VOICED.includes(nx) ? 'v' : 'f')); i += 2; continue;
      }
      if (TWO[two]) { out += cap(TWO[two]); i += 2; continue; }
      out += ONE[low[i]] ? cap(ONE[low[i]]) : src[i]; i += 1;
    }
    return out;
  };
  const latin = (o) => o.alt || roman(o.name);

  // widths in em (Arimo), to size boards before the real font measures the text
  const emG = (s, bold) => [...String(s)].reduce((a, c) => a + (c === ' ' ? 0.28 : /[ΙI.\-]/.test(c) ? 0.3 : /[ΜΩΟΦΨMWO]/.test(c) ? 0.8 : 0.67), 0) * (bold ? 1.06 : 1);
  const emL = (s, bold) => [...String(s)].reduce((a, c) => a + (c === ' ' ? 0.28 : /[A-Z]/.test(c) ? 0.68 : /[iljtf'’.\-]/.test(c) ? 0.26 : /[mw]/.test(c) ? 0.82 : 0.55), 0) * (bold ? 1.06 : 1);
  // two lines at the space nearest the middle
  const halves = (s) => {
    const sp = [...s].map((c, i) => (c === ' ' || c === '-' ? i : -1)).filter((i) => i > 0);
    if (!sp.length) return [s];
    const i = sp.reduce((b, c) => (Math.abs(c - s.length / 2) < Math.abs(b - s.length / 2) ? c : b));
    return s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : [s.slice(0, i), s.slice(i + 1)];
  };

  // a destination as on the direction boards: Greek capitals line(s) then Latin line(s); a name too long for the room is
  // first shortened as the boards do (ΑΓ. ΝΙΚΟΛΑΟΣ / Ag. Nikolaos), then put on two lines each
  const lines = (o, S, room, bold = true) => {
    let g = caps(o.name), l = latin(o);
    const wide = () => Math.max(emG(g, bold), emL(l, bold)) * S > room;
    if (wide()) { g = g.replace(/^ΑΓΙ(ΟΣ|Α|ΟΙ|ΟΥ) /, 'ΑΓ. '); l = l.replace(/^Agi(os|a|oi|ou) /, 'Ag. '); }
    return wide() ? { G: halves(g), L: halves(l) } : { G: [g], L: [l] };
  };
  const block = ({ G, L }, x, y, S, room, gfill, lfill, weight = 'bold') => {
    let out = '';
    for (const t of G) { y += S * 1.15; out += T(x, y - S * 0.22, t, S, GR, { fill: gfill, anchor: 'start', weight, maxw: room, max: S }); }
    for (const t of L) { y += S * 1.15; out += T(x, y - S * 0.24, t, S, GR, { fill: lfill, anchor: 'start', weight, maxw: room, max: S }); }
    return out;
  };
  const widest = ({ G, L }, S, bold = true) => Math.max(...G.map((t) => emG(t, bold) * S), ...L.map((t) => emL(t, bold) * S));
  // the British-style ahead arrow of the photos (TS.arrows): length 120 s centred on (x, y), the shaft narrow under the
  // head and widening towards the tail, soft corners. Blue boards (Ypsonas photo): broad head and tail; motorway (GeoHints
  // 106): a slimmer head on an almost straight shaft
  const UK_BLUE = { w: 13.3, tail: 27.8, head: { half: 2.3, back: 3.25, neck: 3.25 } }, UK_MW = { w: 14, tail: 18.5, head: { half: 1.75, back: 2.9, neck: 2.9 } };
  const upArrow = (x, y, s, fill, k = UK_BLUE) => TS.arrows.straight(x, y + 60 * s, x, y - 60 * s, { w: k.w * s, tailW: k.tail * s, head: k.head, round: 0.2 * k.w * s, fill });
  // speed-limit roundel that stands over the place-name plate at a village entry
  const roundel = (cx, cy, r, v) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#999" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${r * 0.86}" fill="none" stroke="#d2202b" stroke-width="${r * 0.2}"/>` +
    T(cx, cy + r * 0.36, v, r * 1.0, GR, { fill: '#1b1b1b', weight: 'bold', maxw: r * 1.2, max: r });

  // the white plate with Greek capitals over the Latin form; long names go on two lines each
  // (the plates always shorten Άγιος/Αγία to ΑΓ. / Ag., as at Agios Amvrosios and Agios Theodoros)
  const plate = (o, cx, y, maxW) => {
    const g = caps(o.name).replace(/^ΑΓΙ(ΟΣ|Α|ΟΙ) /, 'ΑΓ. '), l = latin(o).replace(/^Agi(os|a|oi) /, 'Ag. '), S = 56;
    const two = Math.max(emG(g) * S, emL(l) * S) > maxW - 50;
    const G = two ? halves(g) : [g], L = two ? halves(l) : [l];
    const w = Math.min(maxW, Math.max(280, Math.max(...G.map((t) => emG(t) * S), ...L.map((t) => emL(t) * S)) + 60));
    const h = (G.length + L.length) * S * 1.12 + 34;
    let out = `<rect x="${cx - w / 2}" y="${y}" width="${w}" height="${h}" rx="12" fill="#fff" stroke="#222" stroke-width="6"/>`, yy = y + 14;
    for (const t of G) { yy += S * 1.12; out += T(cx, yy - S * 0.24, t, S, GR, { fill: '#111', weight: 500, maxw: w - 44, max: S }); }
    for (const t of L) { yy += S * 1.12; out += T(cx, yy - S * 0.26, t, S, GR, { fill: '#111', weight: 500, maxw: w - 44, max: S }); }
    return { out, w, h };
  };

  const cy = [
    { id: 'entry', kind: 'entry', label: 'Village entry: speed limit with name plate',
      // the speed-limit roundel with a white name plate under it marks where a village begins
      draw: (o) => {
        const R = 150, p = plate(o, 0, 0, 640), W = Math.max(2 * R + 20, p.w + 20), cx = W / 2;
        const q = plate(o, cx, 2 * R + 30, 640), H = Math.round(2 * R + 30 + q.h + 10);
        return svg(W, H, roundel(cx, R + 6, R, o.speed) + `<rect x="${cx - 8}" y="${2 * R + 8}" width="16" height="24" fill="#999"/>` + q.out);
      } },
    { id: 'entry-yellow', kind: 'entry', label: 'Village entry on yellow board',
      // the same pair mounted on a yellow backing board with a thin black edge
      draw: (o) => {
        const R = 140, p = plate(o, 0, 0, 600), W = Math.round(Math.max(2 * R + 140, p.w + 110)), cx = W / 2;
        const q = plate(o, cx, 2 * R + 80, 600), H = Math.round(2 * R + 80 + q.h + 56);
        return svg(W, H, `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="8" fill="${AMBER}" stroke="#333" stroke-width="5"/>` + roundel(cx, R + 48, R, o.speed) + q.out);
      } },
    { id: 'blue', kind: 'direction', label: 'Direction sign (blue)',
      // blue board: ahead arrow at the left, yellow Greek capitals over the white Latin form, distance after the name
      draw: (o) => {
        const S = 74, tx = 150, maxRoom = 760, D = lines(o, S, maxRoom);
        const room = Math.min(maxRoom, Math.max(300, widest(D, S) + 10)), W = Math.round(tx + room + 250);
        const n = D.G.length + D.L.length, H = Math.round(n * S * 1.15 + 64);
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="12" fill="${BLUE}" stroke="#fff" stroke-width="4"/>` +
          upArrow(78, H / 2, 1.35, '#fff') + block(D, tx, 26, S, room, YEL, '#fff') +
          T(W - 40, H / 2 + S * 0.36, `${o.km} km`, S, GR, { fill: '#fff', anchor: 'end', weight: 'bold' }));
      } },
    { id: 'pointer', kind: 'direction', label: 'Direction pointer (blue)',
      // blue board pointed at one end with a white chevron in the point; yellow Greek capitals, white Latin form,
      // distance, and the road number in yellow below
      draw: (o) => {
        const S = 60, right = o.dir === 'right', P = 150, maxRoom = 640, D = lines(o, S, maxRoom);
        const room = Math.min(maxRoom, Math.max(240, widest(D, S) + 10)), body = room + 250, W = body + P;
        const n = D.G.length + D.L.length, H = Math.round(n * S * 1.15 + S * 1.3 + 70);
        const shape = right ? `M2,2 L${body},2 L${W - 2},${H / 2} L${body},${H - 2} L2,${H - 2} Z` : `M${P},2 L${W - 2},2 L${W - 2},${H - 2} L${P},${H - 2} L2,${H / 2} Z`;
        const chev = right ? `M${body - 4},26 L${W - 44},${H / 2} L${body - 4},${H - 26}` : `M${P + 4},26 L44,${H / 2} L${P + 4},${H - 26}`;
        const x0 = right ? 36 : P + 18;
        return svg(W, H, `<path d="${shape}" fill="${BLUE}" stroke="#0b3f6e" stroke-width="3" stroke-linejoin="miter"/>` +
          `<path d="${chev}" fill="none" stroke="#fff" stroke-width="18" stroke-linejoin="miter"/>` +
          block(D, x0, 24, S, room, YEL, '#fff') +
          T(x0 + room + 216, 24 + S * 1.15 * 1.5, `${o.km} km`, S, GR, { fill: '#fff', anchor: 'end', weight: 'bold' }) +
          T(x0, H - 36, o.road, S, GR, { fill: YEL, anchor: 'start', weight: 'bold' }));
      } },
    { id: 'motorway', kind: 'motorway', label: 'Motorway direction sign (green)',
      // green board: route number in a yellow-framed box, destination in yellow Greek capitals over the white Latin form,
      // distance on the right, ahead arrow on the left
      draw: (o) => {
        const S = 50, tx = 130, maxRoom = 640, D = lines(o, S, maxRoom, false);
        const room = Math.min(maxRoom, Math.max(220, widest(D, S, false) + 10)), W = Math.round(tx + room + 120);
        const n = D.G.length + D.L.length, top = 120, H = Math.round(top + n * S * 1.15 + 50), mid = top + (H - top) / 2 - 10;
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="${GREEN}" stroke="#fff" stroke-width="3"/>` +
          `<rect x="${tx + room / 2 - 56}" y="34" width="112" height="62" rx="8" fill="none" stroke="${YEL}" stroke-width="4"/>` +
          T(tx + room / 2, 81, o.road, 44, GR, { fill: YEL, maxw: 96, max: 44 }) +
          block(D, tx, top, S, room, YEL, '#fff', 'normal') +
          T(W - 40, mid + S * 0.36, o.km, S, GR, { fill: '#fff', anchor: 'end' }) + upArrow(76, mid, 1.25, '#fff', UK_MW));
      } },
    { id: 'exit', kind: 'motorway', label: 'Motorway exit sign (green)',
      // green overhead board at a junction: destination in yellow Greek capitals over the white Latin form, the junction
      // number in a black pill, arrow pointing up and off to the side
      draw: (o) => {
        const S = 70, maxRoom = 760, D = lines(o, S, maxRoom);
        const room = Math.min(maxRoom, Math.max(360, widest(D, S) + 10)), W = Math.round(room + 120);
        const n = D.G.length + D.L.length, H = Math.round(n * S * 1.15 + 170);
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="${GREEN}" stroke="#fff" stroke-width="4"/>` +
          block(D, 44, 30, S, room, YEL, '#fff') +
          `<rect x="44" y="${H - 120}" width="136" height="80" rx="40" fill="#111" stroke="#fff" stroke-width="5"/>` +
          T(112, H - 56, o.exit, 58, GR, { fill: '#fff', weight: 'bold', maxw: 100, max: 58 }) +
          `<g transform="translate(${W - 120},${H - 76}) rotate(-40) scale(1.35)"><path d="M-6,46 L-6,-14 L-22,-14 L0,-46 L22,-14 L6,-14 L6,46 Z" fill="#fff"/></g>`);
      } },
  ];
  cy.find((t) => t.id === 'entry').defaults = { speed: 50 };
  cy.find((t) => t.id === 'entry-yellow').defaults = { speed: 50 };
  cy.find((t) => t.id === 'pointer').defaults = { road: 'B6' };
  cy.find((t) => t.id === 'motorway').defaults = { road: 'A6' };
  cy.find((t) => t.id === 'exit').defaults = { exit: 25 };
  TS.add('CY', cy, { km: 12 });
})();
