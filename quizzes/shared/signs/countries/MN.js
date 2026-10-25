// MN: Mongolian signs carrying a place name, drawn after the GeoHints pictures (see examples/MN.json). Names in
// Cyrillic capitals; the blue locality plates add the Latin form (MNS 5217:2012) under the Cyrillic.
(function () {
  const { T, svg } = TS;
  const NAVY = '#203a82', B = '#0d68e2', G = '#00a03c', R = '#e3001b';
  const FC = "'DINish Condensed','DINish',sans-serif";             // the narrow capitals of the locality plates
  const F = "'DINish Expanded','DINish',sans-serif";               // the wide capitals of the direction signs
  const up = (s) => String(s).toLocaleUpperCase('mn');
  const len = (s) => [...String(s)].length;
  // MNS 5217:2012 romanisation: ж = j, й = i, ө = ö, ү = ü, х = kh, ц = ts, ч = ch, ш щ = sh, ъ ь = i, ы = y,
  // е = ye, ё = yo, ю = yu, я = ya
  const MAP = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'ye', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', ө: 'ö', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ү: 'ü', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh', ъ: 'i', ы: 'y', ь: 'i', э: 'e', ю: 'yu', я: 'ya' };
  const lat = (s) => [...String(s).toLowerCase()].map((c) => MAP[c] ?? c).join('');
  const split2 = (s) => {
    let best = null;
    for (let i = 1; i < s.length; i++) {
      let a, b;
      if (s[i] === ' ') { a = s.slice(0, i); b = s.slice(i + 1); } else if (s[i - 1] === '-') { a = s.slice(0, i); b = s.slice(i); } else continue;
      const m = Math.max(len(a), len(b));
      if (!best || m < best[2]) best = [a, b, m];
    }
    return best ? [best[0], best[1]] : [s];
  };
  const box = (x, y, t, size, bg) => {   // a route number in a white-framed box
    const w = len(t) * size * 0.66 + size * 0.45;
    return [`<rect x="${x}" y="${y - size * 0.92}" width="${w}" height="${size * 1.18}" rx="${size * 0.14}" fill="${bg}" stroke="#fff" stroke-width="${size * 0.07}"/>` + T(x + w / 2, y, t, size, F, { fill: '#fff', weight: 500 }), w];
  };

  // blue plate with white frame: the name over its Latin form (soum and town plates)
  const bluePlate = ({ name, alt }, crossed) => {
    const cy = up(name), la = up(alt || lat(name));
    const s1 = 120, s2 = 82, tw = Math.max(len(cy) * s1 * 0.5, len(la) * s2 * 0.55);
    const W = Math.round(Math.min(1400, Math.max(620, tw + 120))), H = 300;
    return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="#dfe3ea" stroke="#999" stroke-width="2"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="6" fill="${NAVY}"/>` +
      `<rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="4" fill="none" stroke="#e8ecf2" stroke-width="5"/>` +
      // exit bar (group B): thin, behind the lettering, running all the way to the white frame at both ends
      (crossed ? TS.exitbar({ box: [24.5, 24.5, W - 49, H - 49, 2], b: 0.085, t: 0.96, width: 12, fill: R }) : '') +
      T(W / 2, 148, cy, s1, FC, { fill: '#e8ecf2', weight: 'bold', ls: 0.04, maxw: W - 90, max: s1 }) +
      T(W / 2, 250, la, s2, FC, { fill: '#e8ecf2', weight: 'bold', ls: 0.06, maxw: W - 120, max: s2 }));
  };
  // white plate with black frame: the name alone
  const whitePlate = ({ name }, crossed) => {
    const N = up(name), size = 150;
    const W = Math.round(Math.min(1400, Math.max(560, len(N) * size * 0.52 + 120))), H = 300;
    return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="22" fill="#f4f4f4" stroke="#999" stroke-width="2"/><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="16" fill="none" stroke="#111" stroke-width="12"/>` +
      T(W / 2, H / 2 + size * 0.35, N, size, FC, { fill: '#111', weight: 'bold', maxw: W - 80, max: size }) +
      (crossed ? `<path d="M30,${H - 26} L${W - 30},26" stroke="${R}" stroke-width="${H * 0.075}" stroke-linecap="round"/>` : ''));
  };

  const mn = [
    { id: 'entry', kind: 'entry', label: 'Locality start (blue)', draw: (o) => bluePlate(o, false) },
    { id: 'exit', kind: 'exit', label: 'Locality end (blue)', draw: (o) => bluePlate(o, true) },
    { id: 'entry-white', kind: 'entry', label: 'Locality start (white)', draw: (o) => whitePlate(o, false) },
    { id: 'exit-white', kind: 'exit', label: 'Locality end (white)', draw: (o) => whitePlate(o, true) },

    // blue advance sign: route box and the towns straight on, a big arrow
    { id: 'direction', kind: 'direction', label: 'Advance direction sign (blue)', draw: ({ name, next, road }) => {
      const size = 92, rows = [up(name), up(next)];
      const [bx, bw] = road ? box(60, 150, road, 96, B) : ['', 0];
      const x0 = road ? 60 + bw + 24 : 250;
      const tw = Math.max(...rows.map(len)) * size * 0.72;
      const W = Math.round(Math.min(1700, Math.max(820, Math.max(x0, 250) + tw + 60))), H = 480;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18" fill="#fff" stroke="#999" stroke-width="2"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="11" fill="${B}"/>` + bx +
        T(x0, 150, rows[0], size, F, { fill: '#fff', weight: 500, anchor: 'start', ls: 0.06, maxw: W - x0 - 40, max: size }) +
        T(Math.max(x0, 250), 300, rows[1], size, F, { fill: '#fff', weight: 500, anchor: 'start', ls: 0.06, maxw: W - Math.max(x0, 250) - 40, max: size }) +
        `<path d="M125,440 L125,330 M125,232 L170,330 L80,330 Z" stroke="#fff" stroke-width="40" fill="#fff"/>`);
    } },
    // green advance sign (main road): straight on with route box, the turn-off town in a blue panel
    { id: 'motorway', kind: 'motorway', label: 'Advance direction sign (green)', draw: ({ name, next, road }) => {
      const size = 84, H = 470;
      const [bx, bw] = road ? box(150, 112, road, 84, G) : ['', 0];
      const x0 = road ? 150 + bw + 22 : 150;
      const W = Math.round(Math.min(1700, Math.max(900, x0 + len(name) * size * 0.72 + 50, 290 + len(next) * 78 * 0.72 + 50)));
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18" fill="#fff" stroke="#999" stroke-width="2"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="11" fill="${G}"/>` +
        `<path d="M78,${H - 11} L78,118" stroke="#fff" stroke-width="22"/><path d="M42,124 L78,46 L114,124 Z" fill="#fff"/>` +
        `<path d="M78,${H - 120} C78,${H - 170} 110,${H - 205} 168,${H - 238}" fill="none" stroke="#fff" stroke-width="22"/><path d="M148,${H - 275} L210,${H - 262} L178,${H - 206} Z" fill="#fff"/>` +
        bx + T(x0, 112, up(name), size, F, { fill: '#fff', weight: 500, anchor: 'start', ls: 0.06, maxw: W - x0 - 40, max: size }) +
        `<rect x="230" y="${H - 300}" width="${W - 290}" height="124" rx="8" fill="${B}" stroke="#fff" stroke-width="4"/>` +
        T(230 + (W - 290) / 2, H - 208, up(next), 78, F, { fill: '#fff', weight: 500, ls: 0.06, maxw: W - 340, max: 78 }) +
        T(W / 2 - 40, H - 48, '800м', 50, F, { fill: '#fff', weight: 500 }));
    } },
    // white local direction sign, black arrows: straight on and to the right
    { id: 'direction-local', kind: 'direction', label: 'Direction sign in town (white)', draw: ({ name, next }) => {
      const W = 900, H = 520, size = 70;
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="16" fill="#fff" stroke="#999" stroke-width="2"/><rect x="11" y="11" width="${W - 22}" height="${H - 22}" rx="10" fill="#fff" stroke="#111" stroke-width="5"/>` +
        T(W / 2 + 20, 104, up(name), size, F, { fill: '#111', weight: 'bold', ls: 0.06, maxw: W - 120, max: size }) +
        `<path d="M480,${H - 11} L480,200 M480,330 Q480,300 510,300 L640,300" fill="none" stroke="#111" stroke-width="24"/><path d="M442,206 L480,134 L518,206 Z M630,262 L702,300 L630,338 Z" fill="#111"/>` +
        T(W - 40, H - 70, up(next), size, F, { fill: '#111', weight: 'bold', anchor: 'end', ls: 0.06, maxw: 360, max: size }) +
        T(430, H - 60, '80 м', 50, F, { fill: '#111', weight: 'bold', anchor: 'end' }));
    } },
  ];

  TS.add('MN', mn, { next: 'Номгон', road: 'А03' });
})();
