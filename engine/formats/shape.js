// shape: the place alone, filled and outlined, scaled to fit, without the map (map.place: as the map draws it, at the
// detail its size here needs); once answered in the colour of its answer.

const NS = 'http://www.w3.org/2000/svg';

export function makeShape(P, { map, place, shapeEl }) {
  const K = P.kind;
  return {
    show(id) {
      place('shape');
      shapeEl.className = 'shape';
      const pic = shapeEl.firstChild, [fill, line] = pic.children, areas = [...new Set(K.areas[id])];
      // its box, roughly (each area a square of its size around its middle), for the detail; then its own, once drawn
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const a of areas) { const A = map.area(a), h = Math.sqrt(A.a || 0) / 2; x0 = Math.min(x0, A.lx - h); y0 = Math.min(y0, A.ly - h); x1 = Math.max(x1, A.lx + h); y1 = Math.max(y1, A.ly + h); }
      const r = pic.getBoundingClientRect(), k = Math.min(r.width / (x1 - x0 || 1), r.height / (y1 - y0 || 1));
      const { parts, line: d } = map.place(K, areas, k);
      fill.replaceChildren(...parts.map(p => { const e = document.createElementNS(NS, 'path'); e.setAttribute('d', p); return e; }));
      line.setAttribute('d', d);
      let b = null; try { b = fill.getBBox(); } catch (e) { /* (not drawn: the rough box) */ }
      if (b && b.width + b.height > 0) { x0 = b.x; y0 = b.y; x1 = b.x + b.width; y1 = b.y + b.height; }
      const pad = Math.max(x1 - x0, y1 - y0) * .04 || 1;
      pic.setAttribute('viewBox', `${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`);
    },
    ahead() {},
    answered(id, cls) { shapeEl.classList.add(cls); },
    hide() {},
  };
}
