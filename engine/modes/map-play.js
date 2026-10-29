// free (map play): the dots hidden, a tap anywhere answers; the place shows in the colour of its points, joined to the
// tap (the Game), and the next comes.

export function makeMapPlay({ map, game }) {
  return () => ({
    ask() { map.look('freeplay', true); }, board() {}, key() {},
    tap(area, point, ok) { if (ok) game.answer({ point }); },
    close() { map.look('freeplay', false); },
  });
}
