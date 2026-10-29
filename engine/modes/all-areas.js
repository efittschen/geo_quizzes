// all: every area of the item.
//   clickAll   each tapped, one by one, a counter on the map ("3 areas", "2 more"; areaNoun: 'letters'); on the street,
//              bare and satellite maps one tap counts for all of them
//   pickAll    picked as a set (where a road marking may be seen, in all its prefectures): a tap picks an area or drops
//              it, then Check (or Enter) answers with the picks. A wrong check drops the wrong picks (flashed), keeps
//              the right ones (found) and says how many are missing, a try less; after the last the rest shows, and
//              Check goes on. An answer's colours stay until the next question's first pick.

export function makeAllAreas({ map, game, $, flash, flashArea }) {
  const count = document.createElement('div');
  count.className = 'count'; count.hidden = true; count.setAttribute('aria-live', 'polite');
  $('stage').appendChild(count);
  const check = $('checkBtn');
  const plural = (n, [one, many]) => `${n} ${n === 1 ? one : many}`;

  return P => {
    const K = P.kind;
    let picks = new Set(), cleared = false;
    const syncCount = () => {
      const q = game.round && game.round.asked();
      count.hidden = !(q && game.round.needAll());
      if (count.hidden) return;
      const left = game.round.rest().length, b = document.createElement('b');
      b.textContent = left;
      count.replaceChildren(b, left === K.areas[q.id].length ? ` ${K.areaNoun || 'areas'}` : ' more');
    };
    const syncCheck = () => {
      check.hidden = !K.pickAll;
      const q = game.round && game.round.asked(), shown = !!(q && q.revealed);
      check.disabled = !shown && !picks.size;
      check.textContent = shown ? 'Next' : picks.size ? `Check · ${plural(picks.size, K.areaNoun ? [K.areaNoun.replace(/s$/, ''), K.areaNoun] : ['area', 'areas'])} picked` : 'Check';
    };
    const pick = (area, on) => { if (on) picks.add(area); else picks.delete(area); map.mark([area], 'pick', on); map.tag(K, area, 'pick', on); };
    function checkPicks() {
      const q = game.round && game.round.asked();
      if (!q || game.rating || (!q.revealed && !picks.size)) return;
      const out = game.answer({ picks: [...picks] });
      if (out && out.kind === 'wrong') {
        for (const a of out.extra || []) { pick(a, false); flashArea(K, a); }
        for (const a of out.kept || []) { picks.delete(a); map.mark([a], 'pick', false); map.tag(K, a, 'pick', false); map.mark([a], 'found'); }
      }
      syncCheck();
    }
    check.onclick = checkPicks;
    return {
      ask() { picks = new Set(); cleared = false; syncCount(); syncCheck(); },
      board() {},
      key(e) { if (K.pickAll && e.key === 'Enter') { e.preventDefault(); checkPicks(); } },
      tap(area, point, ok) {
        if (!ok || area == null) return;
        const q = game.round && game.round.asked();
        if (K.pickAll) {
          if (!q || q.revealed || q.found.includes(area) || game.rating) return;
          // (the last answer's colours and names leave the map with the first pick)
          if (!cleared) { map.fade(0, game.opts.hard); map.clearLabels(); cleared = true; }
          pick(area, !picks.has(area));
          syncCheck();
          return;
        }
        map.unpin();
        const out = game.answer({ area });
        if (out && out.kind === 'wrong') { if (K.flashArea || K.labelPerArea) flashArea(K, area); else { const c = K.primary(area); if (c) flash(K, c); } }
        syncCount();
      },
      close() { count.hidden = true; check.hidden = true; check.onclick = null; },
    };
  };
}
