// PH: Philippine signs carrying a place name, drawn after the GeoHints pictures and photos (see examples/PH.json).
(function () {
  const { T, svg } = TS;
  // Philippines: green guide signs with a white rounded border, white mixed-case lettering (Clearview-like, here Signika);
  // kilometre posts: yellow concrete, white panels, K + distance from Km 0 above, the next town's initials + km below
  const F = "'Signika','Clearview Hwy',sans-serif";
  const HG = "'RG2014 Series D','Highway Gothic',sans-serif";
  const AR = "'Arimo','Helvetica Neue',Arial,sans-serif";
  const AN = "'Archivo Narrow','Arial Narrow',sans-serif";
  const HE = "'RG2014 Series E','Highway Gothic',sans-serif";
  const G = '#1f9a50', W = '#fff';
  // "Tagbilaran City" -> ['city', 'Tagbilaran']; other names are towns
  const cityOf = (s) => (/\s+City$/i.test(bare(s)) ? ['city', bare(s).replace(/\s+City$/i, '')] : ['town', bare(s)]);
  // the quiz may add a disambiguation in brackets ("San Fernando (La Union)"): signs carry the bare name
  const bare = (s) => String(s).replace(/\s*\([^)]*\)\s*$/, '');
  const arr = (x, y, dir, s = 1, fill = W) => {
    const r = { up: 0, right: 90, down: 180, left: -90 }[dir];
    return `<path transform="translate(${x},${y}) rotate(${r}) scale(${s})" d="M0,-30 L22,-6 L8,-6 L8,30 L-8,30 L-8,-6 L-22,-6 Z" fill="${fill}"/>`;
  };
  // initials as on the km posts' lower panel ("SE" San Enrique, "P" Plaridel): first letter of each word, "City" dropped
  const initials = (s) => bare(s).replace(/\bCity\b/gi, '').split(/[\s-]+/).filter(Boolean).map((w) => w[0].toUpperCase()).join('').slice(0, 3);
  const wrap = (s, max) => {
    if ([...s].length <= max || !/\s/.test(s)) return [s];
    const sp = [...s.matchAll(/\s+/g)].map((m) => m.index), mid = s.length / 2;
    const i = sp.reduce((b, v) => (Math.abs(v - mid) < Math.abs(b - mid) ? v : b));
    return [s.slice(0, i), s.slice(i).trim()];
  };
  const ph = [
    { id: 'direction', kind: 'direction', label: 'Direction sign, stacked panels', draw: ({ name, next }) => {
      const rows = [{ t: bare(name), a: 'up' }, { t: bare(next), a: 'left' }];
      let y = 10, out = '';
      rows.forEach((r, k) => {
        const ls = wrap(r.t, 16), h = ls.length > 1 ? 150 : 100;
        if (k) out += `<rect x="10" y="${y - 6}" width="620" height="6" fill="${W}"/>`;
        const tx = r.a === 'left' ? 120 : 34, tw = 470;
        out += ls.map((l, i) => T(tx, y + h / 2 + (i - (ls.length - 1) / 2) * 56, l, ls.length > 1 ? 50 : 56, F,
          { anchor: 'start', fill: W, weight: 500, ls: 0.1, mid: true, maxw: tw, max: ls.length > 1 ? 50 : 56 })).join('');
        out += r.a === 'left' ? arr(62, y + h / 2, 'left', 1.05) : arr(590, y + h / 2, r.a, 1.05);
        y += h + 6;
      });
      const H = y + 4;
      return svg(640, H, `<rect x="2" y="2" width="636" height="${H - 4}" rx="24" fill="${G}"/><rect x="8" y="8" width="624" height="${H - 16}" rx="18" fill="none" stroke="${W}" stroke-width="6"/>` + out);
    } },
    { id: 'entering', kind: 'entry', label: 'Entering-town sign with speed limit', draw: ({ name, speed }) => {
      const [kind, nm] = cityOf(name), N = wrap(nm.toUpperCase(), 14);
      const y0 = N.length > 1 ? 148 : 160;
      return svg(640, 330, `<rect x="2" y="2" width="636" height="326" rx="8" fill="#17905f"/><rect x="11" y="11" width="618" height="308" rx="5" fill="none" stroke="${W}" stroke-width="5"/>` +
        T(320, 82, `You are entering ${kind} of`, 40, AR, { fill: W, maxw: 560, max: 40 }) +
        N.map((l, i) => T(320, y0 + i * 52 - (N.length - 1) * 14, l, N.length > 1 ? 50 : 62, AR, { fill: W, weight: 700, maxw: 560, max: N.length > 1 ? 50 : 62 })).join('') +
        T(306, 234 + (N.length - 1) * 18, 'Please observe', 38, AR, { fill: W, anchor: 'end' }) + T(318, 236 + (N.length - 1) * 18, `${speed} KPH`, 46, AR, { fill: '#e2231a', weight: 700, anchor: 'start' }) +
        T(320, 290 + (N.length - 1) * 14, 'SPEED LIMIT', 38, AR, { fill: W, maxw: 560, max: 38 }));
    } },
    { id: 'welcome', kind: 'entry', label: 'Welcome sign', draw: ({ name }) => {
      const [kind, nm] = cityOf(name), N = wrap(nm.toUpperCase(), 12);
      return svg(640, 420, `<rect x="2" y="2" width="636" height="416" rx="12" fill="#109f93"/><rect x="12" y="12" width="616" height="396" rx="8" fill="none" stroke="${W}" stroke-width="6"/>` +
        T(320, 98, 'WELCOME', 64, AR, { fill: W, weight: 700 }) + T(320, 172, kind === 'city' ? 'City of' : 'to', 50, AR, { fill: W }) +
        N.map((l, i) => T(320, (N.length > 1 ? 258 : 300) + i * 82, l, N.length > 1 ? 74 : 92, AR, { fill: W, weight: 700, maxw: 560, max: N.length > 1 ? 74 : 92 })).join(''));
    } },
    { id: 'distance', kind: 'direction', label: 'Distance sign', draw: ({ name, next, km, km2 }) => {
      const row = (y, t, k) => T(48, y, bare(t).toUpperCase(), 60, HE, { fill: W, anchor: 'start', maxw: 370, max: 60 }) + T(598, y, `${k}Km.`, 58, HE, { fill: W, anchor: 'end', maxw: 160, max: 58 });
      return svg(640, 270, `<rect x="2" y="2" width="636" height="266" rx="6" fill="#139a6c"/><rect x="10" y="10" width="620" height="250" rx="4" fill="none" stroke="${W}" stroke-width="4"/>` +
        row(112, name, km) + row(208, next, km2));
    } },
    { id: 'road-name', kind: 'other', label: 'DPWH road name sign', draw: ({ name, next, km0 }) => {
      const road = `${bare(name)} - ${bare(next)} Road`, R = wrap(road, 30), k = Number(km0) || 0;
      return svg(640, 330, `<rect x="2" y="2" width="636" height="326" rx="6" fill="#178a5c"/><rect x="10" y="10" width="620" height="310" rx="4" fill="none" stroke="${W}" stroke-width="4"/>` +
        T(320, 46, 'Republic of the Philippines', 20, AR, { fill: W }) + T(320, 76, 'DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS', 26, AR, { fill: W, weight: 700, maxw: 520, max: 26 }) +
        R.map((l, i) => T(320, (R.length > 1 ? 152 : 182) + i * 58, l, R.length > 1 ? 52 : 60, AN, { fill: W, weight: 700, maxw: 580, max: R.length > 1 ? 52 : 60 })).join('') +
        T(320, 280, `Km. ${k}+909  to  Km. ${k + 13}+918`, 38, AR, { fill: W, weight: 700, maxw: 560, max: 38 }));
    } },
    { id: 'road-name-blue', kind: 'other', label: 'DPWH road name sign (blue)', regions: ['Ilocos Region', 'Ilocos'], needs: ['district'], draw: ({ name, next, km0, district }) => {
      // seen in Pangasinan (DPWH Region I): blue, capitals, "KO." stations; the DPWH seal on a white disc at the top left
      // (shared/emblems.js), the header beside it ending with the district engineering office (district, e.g.
      // "Pangasinan III"; left out when not given)
      const road = `${bare(name)} - ${bare(next)} ROAD`.toUpperCase(), R = wrap(road, 24), k = Number(km0) || 0, hx = 378;
      const seal = TS.emblems && TS.emblems.dpwh ? `<circle cx="90" cy="72" r="44" fill="${W}"/><image href="${TS.emblems.dpwh}" x="50" y="32" width="80" height="80"/>` : '';
      return svg(640, 360, `<rect x="2" y="2" width="636" height="356" rx="10" fill="#1d4fb8"/><rect x="10" y="10" width="620" height="340" rx="6" fill="none" stroke="${W}" stroke-width="4"/>` + seal +
        T(hx, 42, 'REPUBLIC OF THE PHILIPPINES', 16, AR, { fill: W, maxw: 380, max: 16 }) + T(hx, 68, 'DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS', 22, AR, { fill: W, weight: 700, maxw: 400, max: 22 }) +
        T(hx, 94, 'REGION 1', 21, AR, { fill: W, weight: 700 }) +
        (district ? T(hx, 117, `${String(district).toUpperCase()} DISTRICT ENGINEERING OFFICE`, 15, AR, { fill: W, maxw: 420, max: 15 }) : '') +
        R.map((l, i) => T(320, (R.length > 1 ? 172 : 200) + i * 60, l, R.length > 1 ? 50 : 58, AN, { fill: W, weight: 700, maxw: 580, max: R.length > 1 ? 50 : 58 })).join('') +
        T(320, 318, `KO. ${k} + ( -247 ) - KO. ${k + 19} + 707`, 40, AN, { fill: W, weight: 700, maxw: 560, max: 40 }));
    } },
    { id: 'expressway-distance', kind: 'motorway', label: 'Expressway distance sign', draw: ({ name, next, km, km2 }) =>
      svg(640, 240, `<rect x="2" y="2" width="636" height="236" rx="10" fill="#139a74"/><rect x="9" y="9" width="622" height="222" rx="7" fill="none" stroke="${W}" stroke-width="4"/>` +
        T(40, 98, bare(name), 60, F, { anchor: 'start', fill: W, weight: 500, ls: 0.05, maxw: 440, max: 60 }) + T(604, 96, `${km} km`, 50, F, { anchor: 'end', fill: W, weight: 500 }) +
        T(40, 188, bare(next), 60, F, { anchor: 'start', fill: W, weight: 500, ls: 0.05, maxw: 440, max: 60 }) + T(604, 184, `${km2} km`, 34, F, { anchor: 'end', fill: W, weight: 500 })) },
    { id: 'km-post', kind: 'other', label: 'Kilometre post', draw: ({ name, abbr, km, km0 }) => {
      const k0 = String(km0).padStart(4, '0'), ini = abbr || initials(name);
      return svg(300, 540,
        // tapered yellow post, lit front face and shaded side, foot block
        `<path d="M92,40 L196,40 L202,430 L86,430 Z" fill="#e7b43c"/><path d="M196,40 L222,52 L228,430 L202,430 Z" fill="#c4932a"/>` +
        `<path d="M92,40 L118,28 L222,28 L222,52 L196,40 Z" fill="#f0c860"/><path d="M118,28 L222,28 L222,52 L196,40 L92,40 Z" fill="#edc256"/>` +
        `<path d="M80,430 L208,430 L210,520 L78,520 Z" fill="#e2ad36"/><path d="M208,430 L234,430 L236,510 L210,520 Z" fill="#bd8c26"/>` +
        `<path d="M80,432 L208,432" stroke="#a87c20" stroke-width="3"/>` +
        `<rect x="104" y="70" width="80" height="128" fill="#f2f2ee"/>` +
        T(144, 128, 'K', 58, HG, { weight: 'normal' }) + T(144, 184, k0, 36, HG, { maxw: 74, max: 36 }) +
        `<rect x="106" y="226" width="78" height="128" fill="#f2f2ee"/>` +
        T(145, 284, ini, 44, HG, { maxw: 70, max: 44 }) + T(145, 338, km, 42, HG, { maxw: 70, max: 42 }));
    } },
  ];
  TS.add('PH', ph, { next: 'Manila', km: 8, km2: 16, km0: 270, speed: 40 });
})();
