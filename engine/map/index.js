// The Map: the quiz map and everything on it, and the only block that touches a shape. It draws with gl-map.js (WebGL
// 2: glMap, mapShapes); the looks come from the stylesheets. Without WebGL 2 the stage says so.
//
//   const map = createMap(quiz, { root })
//   map.area(id)                          an area's facts: { lx, ly, a, s, g, top, dot } (the Model's geo)
//   map.draw(kind, { hints, letters, asking })   the kind drawn as its layout (layouts.js), coloured by hint group
//                                         (while asking, not where those are the answers), with every label (letters)
//   map.mark, blink, fade, unfade, dim, clear, highlight, ask, unask, reveal, box, edges   states (marks.js)
//   map.label, labels, allLabels, clearLabels, tag, pin, unpin, guess, unguess      labels (labels.js)
//   map.home(), map.frame(box), map.frameAreas(areas), map.framePoints(ps), map.zoom(f), map.view(), map.setView(v),
//   map.scale(), map.toScreen(x, y), map.stageBox()                                 the view (view.js)
//   map.use(name, keep), map.back(name), map.coverage(on), map.shown, map.plain(), map.overlaid(), map.onStreet()
//                                         which map (tiles.js)
//   map.look(flag, on)                    a flag of the map's look: picking (setup), fade, freeplay (map play), mine
//                                         (My stats), sketch (Draw)
//   map.receive({ tap(area, point, ok), hover(area), exact })   who gets the map's taps (the App, per view); exact:
//                                         the area under a tap, not its unit's first
//   map.hover(area, areas)                the area under the mouse and the outline of what it answers
//   map.capture(c), map.space(on), map.spaceHeld()   Draw takes the pointer; Space held moves the map
//   map.whole(kind, unit), map.unitOf(area)          a unit as one shape (Shape, Learn)
//   map.place(kind, ids, k)              the place of items alone, drawn k screen pixels per map unit: { parts: [d],
//                                         line: d } (Shape, Learn)
//   map.sketch                            Draw's pieces: add(d, cls, width), undo(), clear(), old()
//   map.q, map.weight(y), map.rings(areas)   Draw: the map's quantum; a row's size on the ground (cos² of its latitude:
//                                         Web Mercator); the place as { rings: [each area's], dots: [[x, y]] }
//   map.dump(kinds)                       for the layer-shapes tool: what shapes.js keeps
// For the tools: window.QUIZ_MAP (test.js).

import { makeShapes } from './shapes.js';
import { makeLayouts } from './layouts.js';
import { makeView } from './view.js';
import { makeMarks } from './marks.js';
import { makeLabels } from './labels.js';
import { makeTiles } from './tiles.js';
import { makeWorld } from './world.js';
import { bandOf, inside } from './geometry.js';
import { installTestView } from './test.js';

export function createMap(quiz, { root }) {
  const shapes = makeShapes(quiz), { S, svg, stage } = shapes;
  const glm = glMap(stage, svg, S) || (() => {
    const note = document.createElement('p'); note.className = 'nogl'; note.textContent = 'WebGL 2 needed'; stage.append(note);
    return { canvas: null, view() {}, at: () => null, prepare() {} };
  })();
  const layouts = makeLayouts(quiz, shapes);
  const view = makeView(quiz, shapes, glm);
  const labels = makeLabels(quiz, shapes);
  const marks = makeMarks(quiz, shapes, layouts, labels, view);
  const tiles = makeTiles(quiz, shapes, view, { root });
  const onWorld = !!quiz.proj && !quiz.worldMap;
  if (onWorld) makeWorld(quiz, shapes, { root });

  let sized = null;
  view.hooks.rest = s => {
    const dot = view.dot(s);
    if (!sized || sized[0] !== s || sized[1] !== dot) { labels.size(s, dot); sized = [s, dot]; }
    layouts.detail(s);
    layouts.ahead(glm.prepare, Math.min(30, bandOf(s * view.get().w / (view.base.w * (onWorld ? 3 : 1.15)), shapes.q)));
  };
  view.hooks.move = s => layouts.detail(s);
  view.hooks.near = tiles.near;

  // The area under a map point: on a unit drawn as one shape, its first area (they are all the same item); exact
  // (Explore tells about an area): the one under the point, any area there where the unit's shape at the view's detail
  // reaches half a pixel past its areas.
  function areaAt(p, exact) {
    const t = glm.at(p), d = t && t.dataset; if (!d) return null;
    if (d.a) return d.a;
    const u = d.u !== undefined ? layouts.underAt(+d.u) : null; if (!u) return null;
    if (!exact) return u.areas[0];
    const hit = a => inside(shapes.hit(a), p.x, p.y);
    return u.areas.find(hit) || (shapes.near(p.x, p.y).find(s => inside(s, p.x, p.y)) || {}).id || u.areas[0];
  }
  view.input((e, exact) => areaAt(view.toMap(e.clientX, e.clientY), exact));
  installTestView({ shapes, view, marks, labels, areaAt });

  return {
    area: shapes.area, ids: shapes.ids,
    // (asking: a question is on; a kind whose hint colours are its answers (hints: false) then shows only colours of its
    // own, by neighbour)
    draw(K, { hints = false, letters = false, asking = false } = {}) {
      layouts.draw(K);
      const L = layouts.of(K), own = !!(L && L.color && K.hints === false);
      svg.classList.toggle('hints', hints && !tiles.plain() && (!asking || K.hints !== false || own));
      svg.classList.toggle('all-labels', !!letters);
    },
    hintLabel: layouts.hintLabel,
    mark: marks.mark, blink: marks.blink, fade: marks.fade, unfade: marks.unfade, dim: marks.dim, clear: marks.clear,
    highlight: marks.highlight, ask: marks.ask, unask: marks.unask, box: marks.box, edges: marks.edges,
    reveal: (areas, always) => marks.reveal(areas, { overlay: tiles.overlaid(), always }),
    hover(area, areas) { marks.hover(area, areas && !tiles.plain() ? areas : null); },
    label: labels.label, labels: labels.only, allLabels: labels.all, clearLabels: labels.clear, tag: labels.tag,
    pin: labels.pin, unpin: labels.unpin, guess: labels.guess, unguess: labels.unguess,
    home: view.home, frame: view.frame, framePoints: view.framePoints, zoom: view.zoom,
    frameAreas: areas => view.frameBoxes(areas.map(marks.box)),
    view: view.get, setView: view.set, scale: view.scale, toScreen: view.toScreen, toMap: view.toMap, stageBox: view.stageBox,
    use(name, keep) { labels.clear(); marks.hover(null, null); tiles.use(name, keep); },
    back: tiles.back, coverage: tiles.coverage,
    get shown() { return tiles.shown; }, get backShown() { return tiles.backShown; },
    plain: tiles.plain, overlaid: tiles.overlaid, onStreet: tiles.onStreet,
    look: (flag, on) => svg.classList.toggle(flag, on),
    receive: view.receive, capture: view.capture, space: view.space, spaceHeld: view.spaceHeld,
    whole: layouts.whole, unitOf: layouts.unitAt, layout: layouts.of,
    // As the map draws it: a unit of the kind's layout as one shape, else its areas, each filled on its own; the outline
    // of one shape its own, of several the edges they don't share. A place the map draws as a circle or a dot (too small
    // to see there) by its real outline, where the map has one (real).
    place(K, ids, k) {
      const areas = [...new Set(ids)], set = new Set(areas), L = layouts.of(K), A = shapes.area, curved = a => /[AaCcQqSsTt]/.test(A(a).d);
      const real = a => (A(a).real && (A(a).dot || curved(a)) ? A(a).real : A(a).d), tiny = a => A(a).top || A(a).dot;
      const parts = [];
      if (L) L.units.forEach((u, i) => {
        if (!set.has(u[0])) return; // (a unit's areas are all of an item, or none)
        const own = u.filter(a => !tiny(a)), d = own.length > 1 && layouts.wholeAt(L, i, k);
        parts.push(...(d ? [d] : own.map(real)), ...u.filter(tiny).map(real));
      });
      else parts.push(...areas.map(real));
      const small = areas.filter(a => A(a).dot || curved(a));
      return { parts, line: parts.length === 1 ? parts[0] : marks.edges(areas.filter(a => !small.includes(a))) + small.map(real).join('') };
    },
    sketch: {
      add(d, cls, width) { const p = S.el('path'); p.setAttribute('class', cls); p.setAttribute('d', d); if (width) p.setAttribute('stroke-width', width); S.sketch.append(p); },
      undo() { if (S.sketch.lastChild) S.sketch.lastChild.remove(); },
      clear() { S.sketch.replaceChildren(); S.sketch.classList.remove('old'); },
      old() { S.sketch.classList.add('old'); },
    },
    dump: layouts.dump,
    q: shapes.q,
    weight: y => (quiz.proj ? Math.cos(MERCATOR.latOf(quiz.proj.y0 - y / quiz.proj.k) * Math.PI / 180) ** 2 : 1),
    rings: areas => ({ rings: areas.filter(a => !shapes.area(a).dot).map(shapes.rings), dots: areas.filter(a => shapes.area(a).dot).map(a => [shapes.area(a).lx, shapes.area(a).ly]) }),
  };
}
