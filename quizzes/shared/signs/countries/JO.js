// JO: Jordanian signs carrying a place name, drawn after the GeoHints pictures (direction-signs 52-54, road-number-signs
// 87) and Commons photos (see examples/JO.json). Arabic above, the English form below.
// name = Arabic; alt = the English form on the sign (no fixed rule from the Arabic, so it is in `needs`; without it the
// sign shows the Arabic alone).
(function () {
  const { T, svg } = TS;
  const AR = "'Noto Naskh Arabic',sans-serif";
  const LA = "'Archivo Narrow','Arimo',sans-serif";     // the bold narrow grotesque of the blue and green signs
  const LR = "'Arimo',sans-serif";                       // plain grotesque of the place-name boards
  const BLUE = '#1b5cb5', GREEN = '#0c7a4a';

  const emA = (s) => [...String(s)].reduce((a, c) => a + (c === ' ' ? 0.22 : /[ً-ٰٟ]/.test(c) ? 0 : 0.4), 0);
  const emL = (s) => [...String(s)].reduce((a, c) => a + (c === ' ' ? 0.22 : /[A-Z]/.test(c) ? 0.56 : /[iljtf'’.\-]/.test(c) ? 0.25 : 0.48), 0);
  // split at the space nearest the middle (the signs put long names on two lines, Arabic and English alike)
  const halves = (s) => {
    const sp = [...s].map((c, i) => (c === ' ' ? i : -1)).filter((i) => i > 0);
    if (!sp.length) return [s];
    const i = sp.reduce((b, c) => (Math.abs(c - s.length / 2) < Math.abs(b - s.length / 2) ? c : b));
    return [s.slice(0, i), s.slice(i + 1)];
  };
  // the lines of one destination: Arabic lines then English lines, wrapped when wider than room
  const dest = (o, A, E, room) => {
    const ar = emA(o.name) * A > room ? halves(o.name) : [o.name];
    const en = o.alt ? (emL(o.alt) * E > room ? halves(o.alt) : [o.alt]) : [];
    return [...ar.map((t) => ({ t, f: AR, s: A, h: A * 1.22, d: A * 0.36, w: 700 })), ...en.map((t) => ({ t, f: LA, s: E, h: E * 1.12, d: E * 0.2, w: 'bold' }))];
  };
  const tall = (L) => L.reduce((a, l) => a + l.h, 0);
  const put = (L, x, y, anchor, room, fill = '#fff', font) => {
    let out = '';
    for (const l of L) { y += l.h; out += T(x, y - l.d, l.t, l.s, font && l.f === LA ? font : l.f, { fill, anchor, weight: font && l.f === LA ? 'normal' : l.w, maxw: room, max: l.s }); }
    return out;
  };
  // filled sign arrow: deg 0 = up, 45 = up-right, -45 = up-left, 90 = right, -90 = left
  const arrow = (x, y, deg, s, fill = '#fff') => `<g transform="translate(${x},${y}) rotate(${deg}) scale(${s})"><path d="M-7,34 L-7,-4 L-24,-4 L0,-36 L24,-4 L7,-4 L7,34 Z" fill="${fill}"/></g>`;
  const DEG = { up: 0, 'up-right': 45, 'up-left': -45, right: 90, left: -90 };

  const jo = [
    { id: 'blue', kind: 'direction', label: 'Direction sign (blue)', needs: ['alt'],
      // blue board, white border; arrow on one side, Arabic over English on the other (text right-aligned beside an
      // ahead or left arrow, left-aligned beside a right arrow)
      draw: (o) => {
        const dir = o.arrow || 'up', right = DEG[dir] > 0, W = 460, col = 110, pad = 34, room = W - col - pad * 2;
        const L = dest(o, 70, 56, room), H = Math.round(Math.max(230, tall(L) + 64));
        const tx = right ? pad + 6 : W - pad - 6;
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="12" fill="${BLUE}"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="8" fill="none" stroke="#fff" stroke-width="5"/>` +
          put(L, tx, (H - tall(L)) / 2 - 2, right ? 'start' : 'end', room) +
          // GeoHints 53, measured: a broad shaft under a long head only 1.55 shafts wide (TS.arrows)
          TS.arrows.dir(right ? W - col / 2 - 10 : col / 2 + 14, Math.min(H / 2, 32 + L[0].h * 0.75), DEG[dir] < 0 ? 360 + DEG[dir] : DEG[dir], 96,
            { w: 27, fill: '#fff', head: { half: 0.78, back: 1.82, neck: 1.82 } }));
      } },
    { id: 'exit', kind: 'motorway', label: 'Exit sign (green)', needs: ['alt'],
      // green board with an EXIT / مخرج tab on top; Arabic over English, left-aligned; arrow up-right
      draw: (o) => {
        const W = 470, pad = 36, col = 120, room = W - col - pad * 2, L = dest(o, 66, 54, room);
        const tab = 80, H = Math.round(tab + Math.max(250, tall(L) + 70));
        return svg(W, H, `<rect x="${W * 0.22}" y="2" width="${W * 0.74}" height="${tab + 8}" rx="8" fill="${GREEN}"/><rect x="${W * 0.22 + 8}" y="10" width="${W * 0.74 - 16}" height="${tab - 8}" rx="5" fill="none" stroke="#fff" stroke-width="4"/>` +
          T(W * 0.22 + 26, 66, 'EXIT', 42, LA, { fill: '#fff', anchor: 'start', weight: 'bold' }) + T(W * 0.96 - 26, 62, 'مخرج', 46, AR, { fill: '#fff', anchor: 'end', weight: 700 }) +
          `<rect x="2" y="${tab + 4}" width="${W - 4}" height="${H - tab - 6}" rx="10" fill="${GREEN}"/><rect x="10" y="${tab + 12}" width="${W - 20}" height="${H - tab - 22}" rx="7" fill="none" stroke="#fff" stroke-width="4"/>` +
          put(L, pad + 4, tab + (H - tab - tall(L)) / 2 - 4, 'start', room) + arrow(W - col / 2 - 14, tab + (H - tab) * 0.42, 45, 1.6));
      } },
    { id: 'pointer', kind: 'direction', label: 'Direction pointer (blue)', needs: ['alt'],
      // blue board pointed towards the turn, white border following the point; Arabic right-aligned over English
      draw: (o) => {
        const body = 520, P = 70, pad = 30, room = body - pad * 2 - 10, L = dest(o, 64, 52, room);
        const H = Math.round(Math.max(200, tall(L) + 56)), W = body + P;
        const edge = (i) => `M${i + 8},${i} L${body - i * 0.3},${i} L${W - i * 1.6},${H / 2} L${body - i * 0.3},${H - i} L${i + 8},${H - i} Q${i},${H - i} ${i},${H - i - 8} L${i},${i + 8} Q${i},${i} ${i + 8},${i} Z`;
        let y = (H - tall(L)) / 2 - 2, out = '';
        for (const l of L) { y += l.h; out += T(l.f === AR ? body - pad : pad, y - l.d, l.t, l.s, l.f, { fill: '#fff', anchor: l.f === AR ? 'end' : 'start', weight: l.w, maxw: room, max: l.s }); }
        return svg(W, H, `<path d="${edge(2)}" fill="${BLUE}"/><path d="${edge(11)}" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="miter"/>` + out);
      } },
    { id: 'place', kind: 'entry', label: 'Place-name board (blue)', needs: ['alt'],
      // small blue board at the roadside where a village begins: Arabic over the Latin name, centred
      draw: (o) => {
        const W = 420, pad = 34, room = W - pad * 2, L = dest(o, 66, 50, room), H = Math.round(Math.max(200, tall(L) + 50));
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="${BLUE}" stroke="#123f80" stroke-width="2"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="5" fill="none" stroke="#fff" stroke-width="5"/>` +
          put(L, W / 2, (H - tall(L)) / 2 - 2, 'middle', room, '#fff', LR));
      } },
    { id: 'kmpost', kind: 'other', label: 'Kilometre post with town (green)', needs: ['alt'],
      // tall narrow green post of the desert highways: road and kilometre figures above, then a town with its distance
      draw: (o) => {
        const W = 200, pad = 18, room = W - pad * 2, A = 40, E = 33;
        const ar = emA(o.name) * A > room ? halves(o.name) : [o.name], en = o.alt ? (emL(o.alt) * E > room ? halves(o.alt) : [o.alt]) : [];
        const top = 410, low = 46 + ar.length * A * 1.3 + en.length * E * 1.2 + 96, H = Math.round(top + low);
        let y = top + 34, out = '';
        for (const t of ar) { y += A * 1.3; out += T(W / 2, y - A * 0.4, t, A, AR, { fill: '#fff', weight: 700, maxw: room, max: A }); }
        for (const t of en) { y += E * 1.2; out += T(W / 2, y - E * 0.22, t, E, LA, { fill: '#fff', weight: 'bold', maxw: room, max: E }); }
        return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="8" fill="${GREEN}"/><rect x="9" y="9" width="${W - 18}" height="${top - 14}" rx="5" fill="none" stroke="#fff" stroke-width="3"/>` +
          `<rect x="9" y="${top + 2}" width="${W - 18}" height="${H - top - 11}" rx="5" fill="none" stroke="#fff" stroke-width="3"/>` +
          T(W / 2, 112, o.road, 56, LA, { fill: '#fff', weight: 'bold', maxw: room, max: 56 }) +
          T(W / 2, 240, o.post, 62, LA, { fill: '#fff', weight: 'bold', maxw: room, max: 62 }) +
          T(W / 2, 356, `${o.total}Km`, 46, LA, { fill: '#fff', weight: 'bold', maxw: room, max: 46 }) +
          out + T(W / 2, H - 44, `${o.km} Km`, 42, LA, { fill: '#fff', weight: 'bold', maxw: room, max: 42 }));
      } },
  ];
  jo.find((t) => t.id === 'kmpost').defaults = { road: '15P', post: 480, total: 393 };
  TS.add('JO', jo, { km: 38 });
})();
