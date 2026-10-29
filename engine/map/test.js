// The tools' one view of the map (docs.local/SPEC.md, "Tests"). Tools read nothing else of it.
//   window.QUIZ_MAP = { surface, toScreen(x, y), areaAt(x, y), stateOf(area), states(), labels(), asked(), pieces() }

export function installTestView({ shapes, view, marks, labels, areaAt }) {
  window.QUIZ_MAP = {
    surface: view.surface,
    toScreen: view.toScreen,
    areaAt: (x, y) => areaAt(view.toMap(x, y), false),
    stateOf: marks.stateOf,
    states: marks.states,
    labels: labels.shown,
    asked: () => shapes.S.askLine.getAttribute('d') || '',
    pieces: () => shapes.S.sketch.children.length,
  };
}
