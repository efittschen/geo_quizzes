// Explore: an area tapped and everything asked about it (quiz.explore(area) -> { code, title, sub, photos }), on the
// map chosen, every label of the quiz's explore kind on (not on the street maps, whose names would be given away
// there: those of the area tapped). Or one of a list at a time (exploreList), picked beside Back: its areas lit, the
// rare ones of them in the colour of rare answers, and where it names an item of the explore kind (item) that has
// places, those as dots (a town-name part's). My stats shows in the same place (stats.js).
//
// A list of places that overlap (exploreList.overview: the town-name parts) is shown otherwise. The panel below its
// title is halved: above, the item described (or the round); below, the items of the round chosen on the start screen
// as buttons, scrolling. The map has them all at once, each its area as a see-through patch in its colour (the list's
// color, map.tint; quiz-map.css .over), without names. Pointing at one, its button or its patch, shows it alone, the
// others faint, with its places as dots; a click or tap selects it, and it stays whatever is pointed at until its
// button is clicked again or another is, or the map outside its area. The place of the item shown under the mouse (a
// tap on a phone, with one selected) is named on the map: the names of the places (exploreList.names, a script of
// PLACE_NAMES { item: [names in the order of its points] }) are brought when Explore opens.
//
//   const explore = makeExplore(deps)   -> { open(round), tap(area, point), hover(area, point) (true: the overview took
//                                          it), preview(round), close() }   round: the start screen's, { kind, ids, label }
// The start screen shows its round on the map the same way (preview), without the panel: no names on the map, a patch
// pointed at shown alone with its places, a place pointed at named.

export function makeExplore({ quiz, model, map, formats, ui }) {
  const { $, feedback } = ui, K = () => model.kinds.byKey[quiz.exploreKind], L = quiz.exploreList, over = !!(L && L.overview);
  // (a code of many letters is set smaller: `long`)
  const code = text => { $('eCode').textContent = text; $('eDial').classList.toggle('multi', text.includes(',')); $('eDial').classList.toggle('long', text.length > 14); formats.fit($('eDial')); };
  const pick = L && !over ? document.createElement('select') : null;
  if (pick) {
    pick.id = 'ePick'; pick.setAttribute('aria-label', L.label);
    pick.append(new Option(L.label, ''), ...L.items.map((it, i) => new Option(it.label, i)));
    pick.onchange = () => {
      const it = L.items[pick.value], rare = new Set(it ? it.rare : []);
      map.mark(map.ids, ['sel', 'rare'], false);
      if (it) { map.mark(it.areas, 'sel'); map.mark(it.areas.filter(a => rare.has(a)), 'rare'); }
      map.highlight(it ? it.areas : null);
      map.points(it && it.item != null && K().points ? K().points(it.item) : null);
      code(it ? it.code : '--'); feedback($('eInfo'), '', it ? it.title : '', it ? it.sub : '');
    };
    $('eBack').after(pick);
  }

  // the overview: the items shown, the one kept (pinned) and the one pointed at (focus), as indices into shown; in
  // Explore (panel: its description and buttons) or on the start screen (the map alone: preview)
  const list = over ? document.createElement('div') : null;
  let shown = [], pinned = null, focus = null, label = '', panel = false;
  if (list) {
    // (the panel halved: the description, its name in a box of one height, and the list: quiz-page.css .overview)
    const desc = document.createElement('div'), head = document.createElement('div');
    desc.className = 'edesc'; head.className = 'ehead';
    $('eDial').before(desc); head.append($('eDial')); desc.append(head, $('eInfo'), $('eBack').parentNode);
    list.className = 'chips elist'; list.setAttribute('aria-label', L.label); desc.after(list);
    $('explore').classList.add('overview');
  }
  // the names of the places, brought once
  let names = null;
  const bring = () => {
    if (names || !L.names) return;
    names = {};
    const s = document.createElement('script');
    s.src = new URL(L.names, location.href).href; s.onload = () => { names = typeof PLACE_NAMES === 'object' ? PLACE_NAMES : {}; };
    s.onerror = () => { names = null; s.remove(); };
    document.head.append(s);
  };
  // the place of the item shown (selected, else pointed at) within a few pixels of a map point, named; or none
  function named(point) {
    const one = pinned ?? focus, it = one == null ? null : shown[one], pts = it && point && K().points ? K().points(it.item) : null, own = it && names && names[it.item];
    let best = null, near = 9 / map.scale();
    if (pts && own) for (let k = 0; k < pts.length; k += 2) { const d = Math.hypot(pts[k] - point.x, pts[k + 1] - point.y); if (d < near && own[k / 2]) { near = d; best = k; } }
    // (places at the very same point, one dot: all their names)
    const there = best == null ? [] : own.filter((n, j) => n && pts[2 * j] === pts[best] && pts[2 * j + 1] === pts[best + 1]);
    map.name(best == null ? null : { x: pts[best], y: pts[best + 1], text: [...new Set(there)].join(' · ') });
  }
  function show() {
    const one = pinned ?? focus, it = one == null ? null : shown[one], all = shown.flatMap(x => x.areas);
    map.mark(all, ['faint', 'focus'], false);
    if (it) { const mine = new Set(it.areas); map.mark(all.filter(a => !mine.has(a)), 'faint'); map.mark(it.areas, 'focus'); }
    map.clearLabels(); // (no names on the map: they would overlap; the buttons and the panel name them)
    map.points(it && K().points ? K().points(it.item) : null);
    if (!panel) return;
    code(it ? it.code : label);
    feedback($('eInfo'), '', it ? it.title : `${shown.length.toLocaleString('en-US')} ${K().noun[shown.length === 1 ? 0 : 1]}`, it ? it.sub : '');
    for (const b of list.children) b.setAttribute('aria-pressed', +b.dataset.i === pinned);
  }
  // whether a map point lies in an item's areas (each area's rings even-odd)
  const within = (it, p) => map.rings(it.areas).rings.some(rs => { let c = false; for (const r of rs) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > p.y) !== (yj > p.y) && p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi) c = !c; } return c; });
  const keep = i => { pinned = i == null || i === pinned ? null : i; focus = null; show(); };   // (a button: selected, or no more)
  const indexOf = area => { const i = shown.findIndex(x => x.areas.includes(area)); return i < 0 ? null : i; };
  // the round's items on the map (those shown before taken off), and in Explore its panel
  function overview(round, inPanel) {
    const ids = round && round.kind === quiz.exploreKind ? new Set(round.ids) : null;
    map.mark(shown.flatMap(x => x.areas), ['over', 'thin', 'faint', 'focus'], false);
    shown = L.items.filter(it => !ids || ids.has(it.item)); pinned = focus = null; label = (round && round.label) || L.label; panel = inPanel;
    bring();
    const all = shown.flatMap(x => x.areas);
    for (const it of shown) map.tint(it.areas, it.color);
    map.mark(all, 'over'); if (shown.length > 30) map.mark(all, 'thin'); // (more than 30 at once: paler, as the round's preview had them)
    if (!panel) return show();
    const box = $('explore').closest('.panel'); if (box) box.scrollTop = 0; // (the panel no longer scrolls: from its top)
    list.scrollTop = 0;
    list.replaceChildren(...shown.map((it, i) => {
      const b = document.createElement('button'), dot = document.createElement('i'), n = document.createElement('span');
      b.type = 'button'; b.className = 'chip'; b.dataset.i = i; dot.style.background = it.color || ''; n.className = 'n'; n.textContent = it.count ?? '';
      b.append(dot, it.label, n);
      b.onclick = () => keep(i);
      b.onpointerenter = e => { if (e.pointerType === 'mouse' && pinned == null) { focus = i; show(); } };
      b.onpointerleave = () => { if (focus === i) { focus = null; if (pinned == null) show(); } };
      return b;
    }));
    show();
  }

  return {
    open(round) {
      if (over) return overview(round, true);
      if (!map.plain()) map.allLabels(K());
      code('--'); if (pick) { pick.value = ''; pick.hidden = false; }
      feedback($('eInfo'), '', '', '');
    },
    tap(area, point) {
      // (the overview: a tap selects the patch under it; with one selected, a tap outside its area unselects it, one
      // inside names the place there)
      if (over) { if (pinned == null) { if (area) keep(indexOf(area)); } else if (point && !within(shown[pinned], point)) keep(null); else named(point); return; }
      if (!area) return;
      map.mark(map.ids, ['sel', ...(pick ? ['rare'] : [])], false);
      if (pick) pick.value = '';
      map.mark([area], 'sel'); map.highlight([area]);
      if (map.plain()) { map.clearLabels(); for (const id of K().at[area] || []) map.label(K(), id); }
      const info = quiz.explore(area);
      code(info.code);
      feedback($('eInfo'), '', info.title, info.sub);
      if (info.photos) { const g = document.createElement('div'); g.className = 'gallery'; g.append(...info.photos.map(formats.thumb)); $('eInfo').append(g); }
    },
    // (the overview: the patch under the mouse shown alone; with one selected, the place under it named)
    hover(area, point) {
      if (!over) return false;
      if (pinned == null) { const i = area ? indexOf(area) : null; if (i !== focus) { focus = i; show(); } }
      named(point);
      return true;
    },
    // the start screen's map: the round picked as the overview shows it (false: no overview here); it takes the map's
    // taps and hovers as in Explore
    preview(round) { if (!over) return false; overview(round, false); return true; },
    hidePick(on) { if (pick) pick.hidden = on; if (list) list.hidden = on; },
    close() {},
  };
}
