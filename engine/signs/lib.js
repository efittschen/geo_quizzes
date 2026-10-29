// Shared drawing kit for country road signs that carry a place name (city and town-name quizzes show the asked name on
// its country's signs). A country file calls TS.add(iso2, [templates]); a template is
//   { id, label, kind, regions, needs, defaults, draw(opts) -> SVG string }
//   kind: 'entry' | 'exit' | 'hamlet' | 'direction' | 'motorway' | 'bike' | 'street' | 'other'
//   regions: null for a nationwide design, else the region names (as in the city quiz's regions) where it is used
//   needs: fields besides name without which the sign is not complete (e.g. ['alt'] for a sign always in two languages)
// Fields: name (as written there, local script), alt (the second language or script the sign carries), district,
// region, next (another town), km, road (a road number as written there), exit (a junction number).
(function (root) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const DIN = "'D-DIN','DIN 1451 Mittelschrift','DIN Alternate','Barlow',sans-serif";
  const DIN_C = "'D-DIN Condensed','DIN Condensed','Barlow Condensed',sans-serif";
  const L1 = "'Caracteres L1','D-DIN','DIN Alternate','Barlow',sans-serif";       // French road-sign capitals
  const L4 = "'Caracteres L4','Helvetica Neue',Arial,sans-serif";                  // French green/blue signs
  const JP = "'Hiragino Sans','Noto Sans JP','Yu Gothic',sans-serif";
  const LAT = "'Helvetica Neue','Noto Sans',Arial,sans-serif";
  // the size at which a text of n characters (avg width w em, letter spacing ls em) fills width W, capped at max
  const fit = (s, W, max, w = 0.52, ls = 0) => Math.min(max, W / (String(s).length * (w + ls) || 1));
  // a text line; maxw (the width it may take) and max (its largest size) let TS.fitDOM size it exactly to the real font
  // once it is on the page; mid centres it vertically on y instead of standing on it
  const T = (x, y, s, size, font, { fill = '#000', anchor = 'middle', weight = 'normal', ls = 0, style = '', maxw = 0, max = 0, mid = false, extra = '' } = {}) =>
    `<text x="${x}" y="${y}" font-family="${font}" font-size="${size.toFixed(1)}" font-weight="${weight}" text-anchor="${anchor}" fill="${fill}"` +
    `${ls ? ` letter-spacing="${(ls * size).toFixed(1)}" data-ls="${ls}"` : ''}${style ? ` font-style="${style}"` : ''}` +
    `${maxw ? ` data-maxw="${maxw}" data-max="${max || size}"` : ''}${mid ? ' dominant-baseline="central"' : ''}${extra ? ' ' + extra : ''}>${esc(s)}</text>`;
  const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`;
  const arrow = (x, y, dir, s, fill) => {   // a road-sign arrow: shaft + open head, pointing up, left or right
    const r = { up: 0, right: 90, left: -90 }[dir];
    return `<g transform="translate(${x},${y}) rotate(${r}) scale(${s})" fill="none" stroke="${fill}" stroke-width="7" stroke-linecap="butt"><path d="M0,30 L0,-26"/><path d="M-17,-9 L0,-28 L17,-9" stroke-linejoin="miter"/></g>`;
  };


  const TS = root.TS || { signs: {}, defaults: {} };
  Object.assign(TS, { esc, fit, T, svg, arrow, fonts: { DIN, DIN_C, L1, L4, JP, LAT } });
  // a country file: TS.add(iso2, templates, defaults); defaults fill every field a template uses besides name
  // (next, km, district, road, exit, ...), so draw({ name }) alone gives a complete sign
  TS.add = (cc, list, defaults = {}) => { TS.signs[cc] = list; TS.defaults[cc] = defaults; };
  let uid = 0;
  // the SVG of one template; ids inside get a unique suffix so several signs can share a page
  TS.render = (cc, id, opts = {}) => {
    const t = (TS.signs[cc] || []).find((t) => t.id === id);
    if (!t) throw new Error(`no sign ${cc}/${id}`);
    const o = { ...TS.defaults[cc], ...(t.defaults || {}), ...Object.fromEntries(Object.entries(opts).filter(([, v]) => v != null && v !== '')) };
    const n = ++uid;
    return t.draw(o).replace(/id="([^"]+)"/g, `id="$1-${n}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-${n})`).replace(/href="#([^"]+)"/g, `href="#$1-${n}"`);
  };
  // the templates fit for a place: nationwide ones, plus those of its region (t.regions lists region names)
  TS.forPlace = (cc, { region, kind } = {}) => (TS.signs[cc] || []).filter((t) =>
    (!t.regions || (region && t.regions.includes(region))) && (!kind || t.kind === kind));
  // size every text marked with maxw to the width it may take, in the font the page really shows (call after fonts load)
  TS.fitDOM = (el) => el.querySelectorAll('text[data-maxw]').forEach((t) => {
    const maxw = +t.dataset.maxw, max = +t.dataset.max;
    let size = parseFloat(t.getAttribute('font-size'));
    for (let i = 0; i < 4; i++) {
      const w = t.getComputedTextLength();
      if (!w) break;
      const next = Math.min(max, size * maxw / w);
      if (Math.abs(next - size) < 0.1) break;
      size = next;
      t.setAttribute('font-size', size.toFixed(1));
      if (t.dataset.ls) t.setAttribute('letter-spacing', (+t.dataset.ls * size).toFixed(1));
    }
  });
  root.TS = TS;
})(typeof window !== 'undefined' ? window : globalThis);
