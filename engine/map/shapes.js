// The quiz's areas as shapes: the records gl-map.js draws (mapShapes), one per area, and what is known of each area
// (its label point and size come with the data: see model/quiz.js).
// svg#map draws nothing: its classes say how the map looks (the stylesheets' .merged, .dots, .blind…), and gl-map reads
// the shapes' looks from hidden samples in it. An area's shape is in the drawing only while the layout drawn shows it
// (layouts.js); the others wait in `spare`, in no layer.
//
//   const shapes = makeShapes(quiz)
//   shapes.S, shapes.svg, shapes.stage   gl-map's layers, the map's classes, the box it is drawn in
//   shapes.ids, shapes.area(id)          the areas, and one's facts: { lx, ly, a, s, g, top, dot, w, d }
//   shapes.el(id)                        its shape; shapes.spare
//   shapes.rings(id), shapes.hit(id)     its rings; a shape to test points on (geometry.js)
//   shapes.near(x, y)                    the areas whose box holds a point (areas on top keep their own border: not these)
//   shapes.q, shapes.size                the map's quantum and its size [w, h]

import { near, quantum, ringsOf, shapeOf } from './geometry.js';

export function makeShapes(quiz) {
  const svg = document.getElementById('map'), stage = document.getElementById('stage'), S = mapShapes();
  const facts = {}, els = {}, spare = S.el('g'), ids = quiz.areas.map(a => a.id);
  for (const a of quiz.areas) {
    facts[a.id] = a;
    const p = S.el('path');
    p.setAttribute('d', a.d); p.setAttribute('class', 'r');
    p.dataset.a = a.id; p.dataset.g = a.g;
    if (a.top) p.classList.add('top');
    if (a.dot) p.classList.add('dot');
    // (a dot of a size on the ground grows and shrinks with the map, and has no ring around it)
    if (a.w) { p.style.strokeWidth = a.w + 'px'; p.style.vectorEffect = 'none'; svg.classList.add('ground'); }
    spare.appendChild(p); els[a.id] = p;
  }
  // under the areas: a page's own context (a world quiz's places not asked; a board's frames), a city quiz's land and
  // region lines (the world under the map goes below these, world.js); above them the borders
  if (quiz.context) { const p = S.el('path'); p.setAttribute('d', quiz.context); S.ctx.appendChild(p); }
  if (quiz.base) for (const cls of ['land', 'lines']) if (quiz.base[cls]) { const p = S.el('path'); p.setAttribute('d', quiz.base[cls]); p.setAttribute('class', cls); S.ctx.appendChild(p); }
  if (quiz.dots) svg.classList.add('dots');
  for (const d of quiz.borders || []) { const p = S.el('path'); p.setAttribute('d', d); S.borders.appendChild(p); }

  const rings = {}, hits = {};
  let lookup = null;
  return {
    S, svg, stage, ids, spare,
    q: quantum(quiz.proj), size: quiz.size,
    area: id => facts[id],
    el: id => els[id],
    rings: id => (rings[id] ??= ringsOf(facts[id].d)),
    hit: id => (hits[id] ??= shapeOf(id, ringsOf(facts[id].d))),
    near: (x, y) => (lookup ||= near(ids.filter(id => !facts[id].top).map(id => (hits[id] ??= shapeOf(id, ringsOf(facts[id].d))))))(x, y),
  };
}
