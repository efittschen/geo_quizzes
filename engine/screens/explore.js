// Explore: an area tapped and everything asked about it (quiz.explore(area) -> { code, title, sub, photos }), on the
// map chosen, every label of the quiz's explore kind on (not on the street maps, whose names would be given away
// there: those of the area tapped). Or one of a list at a time (exploreList), picked beside Back: its areas lit, the
// rare ones of them in the colour of rare answers. My stats shows in the same place (stats.js).
//
//   const explore = makeExplore(deps)   -> { open(), tap(area), close() }

export function makeExplore({ quiz, model, map, formats, ui }) {
  const { $, feedback } = ui, K = () => model.kinds.byKey[quiz.exploreKind];
  // (a code of many letters is set smaller: `long`)
  const code = text => { $('eCode').textContent = text; $('eDial').classList.toggle('multi', text.includes(',')); $('eDial').classList.toggle('long', text.length > 14); formats.fit($('eDial')); };
  const pick = quiz.exploreList ? document.createElement('select') : null;
  if (pick) {
    pick.id = 'ePick'; pick.setAttribute('aria-label', quiz.exploreList.label);
    pick.append(new Option(quiz.exploreList.label, ''), ...quiz.exploreList.items.map((it, i) => new Option(it.label, i)));
    pick.onchange = () => {
      const it = quiz.exploreList.items[pick.value], rare = new Set(it ? it.rare : []);
      map.mark(map.ids, ['sel', 'rare'], false);
      if (it) { map.mark(it.areas, 'sel'); map.mark(it.areas.filter(a => rare.has(a)), 'rare'); }
      map.highlight(it ? it.areas : null);
      code(it ? it.code : '--'); feedback($('eInfo'), '', it ? it.title : '', it ? it.sub : '');
    };
    $('eBack').after(pick);
  }
  return {
    open() {
      if (!map.plain()) map.allLabels(K());
      code('--'); if (pick) { pick.value = ''; pick.hidden = false; }
      feedback($('eInfo'), '', '', '');
    },
    tap(area) {
      map.mark(map.ids, ['sel', ...(pick ? ['rare'] : [])], false);
      if (pick) pick.value = '';
      map.mark([area], 'sel'); map.highlight([area]);
      if (map.plain()) { map.clearLabels(); for (const id of K().at[area] || []) map.label(K(), id); }
      const info = quiz.explore(area);
      code(info.code);
      feedback($('eInfo'), '', info.title, info.sub);
      if (info.photos) { const g = document.createElement('div'); g.className = 'gallery'; g.append(...info.photos.map(formats.thumb)); $('eInfo').append(g); }
    },
    hidePick(on) { if (pick) pick.hidden = on; },
    close() {},
  };
}
