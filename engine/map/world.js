// The plain map of the world under a country's map (data/maps/world/world.js, fetched unless the page has it): the
// neighbours, and what lies between a country's far-off parts. One shape per copy of the world, every country's land
// with its coasts and borders, laid once: the graphics card draws all of it with every frame, and nothing of it changes
// as the view moves. A map over the 180th meridian has a second copy (mercator.js, MERCATOR.world).
//
//   makeWorld(quiz, shapes, { root })

export function makeWorld(quiz, { S, stage }, { root }) {
  const lay = () => {
    const d = WORLD.reg.filter(r => r.a).map(r => r.d).join('');
    for (const [s, dx, dy] of MERCATOR.world(WORLD, quiz.proj, quiz.size[0])) {
      const g = S.el('g'), land = S.el('path');
      land.setAttribute('class', 'world'); land.setAttribute('d', d);
      g.setAttribute('transform', `translate(${dx},${dy}) scale(${s})`); g.append(land); S.ctx.prepend(g);
    }
    const note = stage.querySelector('.note');
    if (note && !/Natural Earth/.test(note.textContent)) note.append(' · World: Natural Earth');
  };
  if (typeof WORLD === 'object') setTimeout(lay); // (after the page's own scripts, which may lay theirs first)
  else { const s = document.createElement('script'); s.src = root + 'data/maps/world/world.js'; s.onload = lay; document.head.append(s); }
}
