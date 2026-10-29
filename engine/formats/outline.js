// outline: the item's areas outlined on the map as the question (Name it, Type code, a kind asked by its place), flown
// to where they are out of view or too small to see. Type code asks for the codes of the place, and tells whether it
// is part of a larger area with codes of its own (dashed around it) or a whole one with parts that have theirs (dashed
// inside it).

export function makeOutline(P, { map, place }) {
  const K = P.kind, code = P.code;
  const question = (id, n) => {
    if (!code) return K.ask || `Which ${K.noun[0]} is this?`;
    const scope = code.scope(id), codes = n > 1 ? `${n} ${K.noun[1]} are` : `${K.noun[0]} is`;
    return scope === 'part' ? `Which ${codes} used only in this part?` : scope === 'whole' ? `Which ${codes} used across this whole area?` : n > 1 ? `Which ${n} ${K.noun[1]} are used here?` : `Which ${K.noun[0]} is this?`;
  };
  return {
    show(id, { group }) {
      const el = place('outline');
      el.classList.remove('signed'); el.classList.add('asking'); delete el.dataset.name;
      const scope = code && code.scope(id);
      if (scope) {
        const tag = document.createElement('span');
        tag.className = 'scope ' + scope; tag.textContent = scope === 'part' ? 'Part of a larger area' : 'Whole area';
        el.replaceChildren(tag, question(id, group.length));
      } else el.textContent = question(id, group ? group.length : 1);
      map.ask(K.areas[id], code && { around: code.around(id), parts: code.parts(id) });
    },
    ahead() {},
    // (Name it: the place in the colour of its answer, its outline kept, a dot without its ring)
    answered() { if (P.way === 'name') map.unask(); },
    hide() { map.ask(null); },
  };
}
