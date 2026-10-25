// LK: Sri Lankan signs carrying a place name, drawn after the GeoHints pictures (see examples/LK.json). Every sign
// is trilingual: Sinhala, Tamil, English, in that order. name is the local form (Sinhala, or Tamil in the north and
// east), alt the English form, alt2 the remaining script; the scripts are told apart by their Unicode blocks.
(function () {
  const { T, svg } = TS;
  const TEAL = '#00a99c', G = '#04604a', B = '#0b3f9a', GI = '#0a6a46', R = '#e8121c';
  const SI = "'Noto Sans Sinhala','Sinhala MN',sans-serif", TA = "'Noto Sans Tamil','Tamil MN',sans-serif";
  const EN = "'Arimo','Liberation Sans',Arial,sans-serif";                 // the Arial/Transport-like English capitals
  const EC = "'Roboto Condensed','Arial Narrow',sans-serif";               // narrow capitals of the A-road tables
  const isSi = (s) => /[඀-෿]/.test(s || ''), isTa = (s) => /[஀-௿]/.test(s || '');
  const forms = ({ name, alt, alt2 }) => {
    const all = [name, alt2, alt].filter(Boolean);
    return { si: all.find(isSi), ta: all.find(isTa), en: all.find((s) => !isSi(s) && !isTa(s)) };
  };
  const vis = (s) => [...String(s)].filter((c) => !/[\u0DCA-\u0DDF\u0D81-\u0D83\u0BBE-\u0BCD\u0B82\u200D]/.test(c)).length;   // letters that take width
  const lines = (f) => [f.si && [f.si, SI], f.ta && [f.ta, TA], f.en && [f.en.toUpperCase(), EN]].filter(Boolean);
  const arrow = (x, y, s, rot, fill) => `<path transform="translate(${x},${y}) rotate(${rot}) scale(${s / 100})" d="M-12,50 L-12,-4 L-36,-4 L0,-50 L36,-4 L12,-4 L12,50 Z" fill="${fill}"/>`;

  // town plate (teal): the three forms stacked, red bar across for the exit
  const plate = (o, crossed) => {
    const L = lines(forms(o)), H = 120 + L.length * 125;
    const size = { [SI]: 118, [TA]: 92, [EN]: 112 }, cw = { [SI]: 0.66, [TA]: 0.62, [EN]: 0.72 };
    const W = Math.round(Math.min(1400, Math.max(700, ...L.map(([t, f]) => vis(t) * size[f] * cw[f] + 130))));
    return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="30" fill="#fff" stroke="#bbb" stroke-width="2"/><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="22" fill="${TEAL}"/>` +
      L.map(([t, f], i) => T(W / 2, 150 + i * 125 - (f === TA ? 6 : 0), t, size[f], f, { fill: '#fff', weight: f === EN ? 'bold' : 500, maxw: W - 120, max: size[f] })).join('') +
      (crossed ? `<clipPath id="lk-x"><rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="22"/></clipPath><path d="M-20,${H - 40} L${W - 40},-20 L${W + 20},40 L40,${H + 20} Z" fill="${R}" clip-path="url(#lk-x)"/>` : ''));
  };

  const lk = [
    { id: 'entry', kind: 'entry', label: 'Town name plate', needs: ['alt', 'alt2'], draw: (o) => plate(o, false) },
    { id: 'exit', kind: 'exit', label: 'Town end plate', needs: ['alt', 'alt2'], draw: (o) => plate(o, true) },
    // A-road direction table (green): arrow and route in a left column, the three forms, the distance
    { id: 'direction', kind: 'direction', label: 'Direction table, A road (green)', needs: ['alt', 'alt2'], draw: (o) => {
      const W = 960, rh = 300, n2 = forms({ name: o.next }), k2 = o.km2 || Math.max(1, Math.round(o.km / 5));
      const rows = [[lines(forms(o)), o.km, 90], [lines(n2), k2, -90]], H = rows.length * rh + 16;
      const size = { [SI]: 64, [TA]: 54, [EN]: 56 };
      return svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="6" fill="#eee" stroke="#aaa" stroke-width="2"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="4" fill="${G}"/>` +
        `<path d="M168,10 L168,${H - 10} M10,${rh + 8} L${W - 10},${rh + 8}" stroke="#eee" stroke-width="8"/>` +
        rows.map(([L, k, rot], i) => { const y = 8 + i * rh;
          return arrow(88, y + 118, 74, rot, '#eee') + (o.road ? T(88, y + rh - 34, o.road, 56, EC, { fill: '#eee', weight: 'bold', ls: 0.2 }) : '') +
            L.map(([t, f], j) => T(196, y + 82 + j * 88 * (3 / Math.max(3, L.length)), t, size[f], f === EN ? EC : f, { fill: '#eee', weight: 'bold', anchor: 'start', maxw: 470, max: size[f] })).join('') +
            T(W - 110, y + 168, String(k), 96, EC, { fill: '#eee', weight: 'bold', anchor: 'end' }) + T(W - 104, y + 168, 'km', 46, EC, { fill: '#eee', weight: 'bold', anchor: 'start' });
        }).join(''));
    } },
    // expressway sign (blue): the through destination at the top, the exit's town in a green panel, EXIT 500 m below
    { id: 'motorway', kind: 'motorway', label: 'Expressway exit sign (blue)', needs: ['alt', 'alt2'], draw: (o) => {
      const W = 600, top = lines(forms({ name: o.next })), L = lines(forms(o));
      const road = /^E/.test(o.road || '') ? o.road : null;   // expressways carry E routes; an A-road number is not shown here
      const size = { [SI]: 60, [TA]: 50, [EN]: 54 };
      const yi = 92 + top.length * 74 + (road ? 70 : 0) - 20, ih = 90 + L.length * 80, yb = yi + ih + 50, H = yb + 170;
      return svg(W, H, `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="34" fill="${B}" stroke="#ddd" stroke-width="5"/>` +
        top.map(([t, f], j) => T(W - 50, 92 + j * 74, t, size[f], f, { fill: '#fff', weight: f === EN ? 'bold' : 500, anchor: 'end', maxw: 380, max: size[f] })).join('') +
        (road ? `<rect x="${W - 190}" y="${110 + top.length * 74 - 60}" width="140" height="68" rx="6" fill="none" stroke="#fff" stroke-width="4"/>` + T(W - 120, 110 + top.length * 74 - 4, road, 50, EN, { fill: '#fff', weight: 'bold' }) : '') +
        `<rect x="30" y="${yi}" width="380" height="${ih}" rx="26" fill="${GI}" stroke="#fff" stroke-width="5"/>` +
        L.map(([t, f], j) => T(56, yi + 90 + j * 80, t, size[f], f, { fill: '#fff', weight: f === EN ? 'bold' : 500, anchor: 'start', maxw: 330, max: size[f] })).join('') +
        `<path d="M500,${yb - 20} L500,${yi + 70} M500,${yb - 90} L456,${yb - 150}" fill="none" stroke="#fff" stroke-width="26"/><path d="M466,${yi + 80} L500,${yi + 10} L534,${yi + 80} Z M438,${yb - 190} L432,${yb - 118} L482,${yb - 150} Z" fill="#fff"/>` +
        `<path d="M10,${yb} L${W - 10},${yb}" stroke="#fff" stroke-width="6"/>` + T(W / 2, yb + 116, 'EXIT 500 m', 84, EN, { fill: '#fff', weight: 'bold', ls: 0.04 }));
    } },
  ];

  TS.add('LK', lk, { next: 'කොළඹ', km: 24, road: 'A 9' });
})();
