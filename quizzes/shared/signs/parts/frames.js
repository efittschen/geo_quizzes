// Group C (frames, outlines and corners): sign plates built as nested rounded rectangles, and the thin dark line that
// keeps a white or light outer edge visible on a white page, as the reference drawings show it.
//   TS.frames.plate(W, H, layers, { rim })  layers, outermost first:
//     { i, r, fill }          a filled rectangle set in by i from every side, corner radius r
//     { i, r, line, w }       a border line w wide whose outer edge is set in by i, corner radius r (of its middle)
//     rim: true (or { color }) adds TS.frames.rim around the plate (corner radius of the first layer)
//   TS.frames.rim(W, H, r, { d, color })  the 1-px edge line: d is the plate's outline as a path, else a W x H rectangle
(function (root) {
  const TS = root.TS;
  const f = (v) => +(+v).toFixed(2);
  const rect = (x, y, w, h, r, attrs) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"${r ? ` rx="${f(r)}"` : ''} ${attrs}/>`;
  let n = 0;
  // one screen pixel at any size (a non-scaling stroke two pixels wide, its outer half clipped away by the plate's shape)
  const rim = (W, H, r = 0, { d = null, color = '#3a3a3a' } = {}) => {
    const id = `ts-rim${++n}`, shape = (a) => (d ? `<path d="${d}" ${a}/>` : rect(0, 0, W, H, r, a));
    return `<clipPath id="${id}">${shape('')}</clipPath>` +
      shape(`fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke" clip-path="url(#${id})"`);
  };
  const plate = (W, H, layers, { rim: edge = false } = {}) => layers.map((l) => {
    const i = l.i || 0;
    if (l.line) { const w = l.w || 1, c = i + w / 2; return rect(c, c, W - 2 * c, H - 2 * c, l.r || 0, `fill="none" stroke="${l.line}" stroke-width="${f(w)}"`); }
    return rect(i, i, W - 2 * i, H - 2 * i, l.r || 0, `fill="${l.fill}"`);
  }).join('') + (edge ? rim(W, H, (layers[0] && layers[0].r) || 0, edge === true ? {} : edge) : '');
  TS.frames = { rect, rim, plate };
})(typeof window !== 'undefined' ? window : globalThis);
