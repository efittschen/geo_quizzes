// map: the item's area tapped. A wrong tap flashes the item it is (only the area, where the kind flashes areas or
// labels each area), a try less; after the third the answer shows, and a tap on it goes on.

export function makeMapTap({ map, game, flash, flashArea }) {
  return P => {
    const K = P.kind;
    return {
      ask() {}, board() {}, key() {}, close() {},
      tap(area, point, ok) {
        if (!ok || area == null) return;
        map.unpin();
        const out = game.answer({ area });
        if (!out || out.kind !== 'wrong') return;
        if (K.flashArea || K.labelPerArea) flashArea(K, area);
        else { const clicked = K.primary(area); if (clicked) flash(K, clicked); }
      },
    };
  };
}
