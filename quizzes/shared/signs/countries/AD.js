// AD: Andorran signs carrying a place name, drawn after the GeoHints pictures (see examples/AD.json). Town plates
// white with a thin red rim (French style), the name in narrow bold capitals filling the plate; direction panels white
// with a grey rim, main destinations reversed out of red bands. Archivo Narrow stands in for the Helvetica-like
// narrow lettering.
(function () {
  const { T, svg } = TS;
  const NAR = "'Archivo Narrow','Arimo',sans-serif";
  // Archivo Narrow Bold advance widths (em; cap height 0.686 em), from the font file
  const ADV = {" ":0.228,"'":0.195,"’":0.195,"-":0.273,".":0.228,"A":0.592,"B":0.592,"C":0.592,"D":0.592,"E":0.547,"F":0.501,"G":0.638,"H":0.592,"I":0.228,"J":0.456,"K":0.592,"L":0.501,"M":0.683,"N":0.592,"O":0.638,"P":0.547,"Q":0.638,"R":0.592,"S":0.547,"T":0.501,"U":0.592,"V":0.547,"W":0.774,"X":0.547,"Y":0.547,"Z":0.501,"·":0.228,"À":0.592,"Ç":0.592,"È":0.547,"É":0.547,"Í":0.228,"Ï":0.228,"Ò":0.638,"Ó":0.638,"Ú":0.592,"Ü":0.592};
  const CAP = 0.686;
  const tw = (s, size) => [...String(s)].reduce((a, c) => a + (ADV[c] ?? 0.58), 0) * size;
  const up = (s) => String(s).toLocaleUpperCase('ca');
  const RED = '#d9261c';
  const down = (x, y, s, fill) => `<g transform="translate(${x},${y}) scale(${s})" fill="${fill}"><path d="M-8,-40 L8,-40 L8,0 L26,0 L0,30 L-26,0 L-8,0 Z"/></g>`;

  // town entry / exit: the name fills the plate; on the exit a red bar runs under the letters
  const plate = ({ name }, exit) => {
    const s = 54 / CAP, N = up(name), w = tw(N, s), W = Math.round(Math.max(420, w + 40)), H = 161;
    return svg(W, H, `<rect x="2.5" y="2.5" width="${W - 5}" height="${H - 5}" rx="12" fill="#fff" stroke="${RED}" stroke-width="5"/>` +
      (exit ? `<path d="M8,${H - 12} L${W - 8},10" stroke="${RED}" stroke-width="12"/>` : '') +
      T(W / 2, H / 2 + 27, N, s, NAR, { fill: '#111', weight: 'bold', maxw: w + 1, max: s }));
  };
  // direction panel: destinations in capitals, a down arrow for the lane; main destinations in white on red bands
  const panel = ({ name, next }, main) => {
    const s = 34 / CAP, rows = [name, ...(next ? [next] : [])].map(up), lw = Math.max(...rows.map((r) => tw(r, s)));
    const W = Math.round(Math.max(300, lw + 60)), pitch = 52, H = 40 + rows.length * pitch + 76;
    let out = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="#f6f6f4" stroke="#3a3a3a" stroke-width="4"/>`;
    rows.forEach((r, i) => {
      const y = 40 + i * pitch + 30, red = main && i === 0;
      if (red) out += `<rect x="${W / 2 - tw(r, s) / 2 - 10}" y="${y - 38}" width="${tw(r, s) + 20}" height="48" fill="${RED}"/>`;
      out += T(W / 2, y, r, s, NAR, { fill: red ? '#fff' : '#222', weight: 'bold', maxw: tw(r, s) + 1, max: s });
    });
    return svg(W, H, out + down(W / 2, H - 52, 0.62, '#111'));
  };
  // the left panel of direction-signs 88: as tall as its rows need (upright there), the destinations in capitals, then
  // any secondary lines in sloped mixed case at the left (via: lines split by '|', e.g. a ski area or a tunnel route),
  // and the broad down arrow of the photo (a wide head on a short thick shaft) at the foot
  const ARI = "'Arimo',sans-serif";
  const panelL = ({ name, next, via }) => {
    const s = 34 / CAP, rows = [name, ...(next ? [next] : [])].map(up), V = via ? String(via).split('|').map((v) => v.trim()).filter(Boolean) : [];
    const vs = 20 / 0.716, lw = Math.max(...rows.map((r) => tw(r, s)), ...V.map((v) => [...v].length * 0.5 * vs + 40));
    const W = Math.round(Math.max(300, lw + 60)), pitch = 52, vp = 39, yV = 40 + rows.length * pitch + 26;
    const aTop = V.length ? yV + (V.length - 1) * vp : 40 + (rows.length - 1) * pitch + 40, H = Math.round(aTop + 120);   // aTop: the last baseline
    const aw = Math.min(90, W * 0.27), ax = W / 2, ah = 62, shaft = aw * 0.26;
    let out = `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="#f6f6f4" stroke="#3a3a3a" stroke-width="4"/>`;
    rows.forEach((r, i) => { out += T(W / 2, 40 + i * pitch + 30, r, s, NAR, { fill: '#222', weight: 'bold', maxw: tw(r, s) + 1, max: s }); });
    V.forEach((v, i) => { out += T(28, yV + i * vp, v, vs, ARI, { anchor: 'start', fill: '#222', style: 'italic', weight: 500, ls: 0.03, maxw: W - 56, max: vs }); });
    out += `<path d="M${ax - shaft / 2},${aTop + 12} H${ax + shaft / 2} V${aTop + 32} H${ax + aw / 2} L${ax},${aTop + 32 + ah} L${ax - aw / 2},${aTop + 32} H${ax - shaft / 2} Z" fill="#111"/>`;
    return svg(W, H, out);
  };

  const ad = [
    { id: 'entrada', kind: 'entry', label: 'Town entry', draw: (o) => plate(o, false) },
    { id: 'sortida', kind: 'exit', label: 'Town exit', draw: (o) => plate(o, true) },
    { id: 'direccio', kind: 'direction', label: 'Direction panel', draw: panelL },
    { id: 'direccio-principal', kind: 'direction', label: 'Direction panel, main destination (red band)', draw: (o) => panel(o, true) },
  ];

  TS.add('AD', ad, { next: 'Escaldes-Engordany' });
})();
