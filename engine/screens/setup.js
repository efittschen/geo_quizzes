// Setup: what to play, and the player's choices until Start.
//
// The rounds by level (Beginner to Expert, by size alone), each level with its star; a quiz of several layers has a
// folder (tab) per layer, a layer in another language in the folder of the one it follows. The round picked shows its
// switches in its box: its languages (or one row for the whole list: langLabel), the way to answer, a city quiz's map
// play or dots, the options (colours, a detail, every label, Sign, Hard mode). Then a quiz shared by link or practised
// from the review page, the player's own quizzes (a link to each, delete), and a custom quiz: the items picked by
// group, one by one, by a preset, the top N of a ranking, or by tapping the map; saved by name or shared as a link.
// The maps to play on are picked on the map (a city quiz: its background), with Street View coverage beside them.
// What is chosen is kept for the next visit (storage.last); the best of each round is shown in its box.
//
//   const setup = makeSetup(deps)
//   setup.open()            the setup screen (the App shows it), built anew
//   setup.choice()          what Start plays: { play, items, box, look: { map, back } }, or null (nothing picked)
//   setup.options()         { hints, letters, hard, sign, detail }; setup.kind(): the kind of the round picked
//   setup.tap(area)         a tap on the map: the round picked becomes a custom quiz, the items there toggled
//   setup.practice          a quiz to play at once (the review page's Practice), or null
//   setup.look              { map, back }: the maps chosen
//   setup.onMap(), setup.onPick(look)   the App: the map changed (its layout to draw); a map picked (true: the App took it,
//                           a review's)

export function makeSetup({ quiz, model, map, storage, ui }) {
  const { $, plural, toast } = ui, kinds = model.kinds, K = key => kinds.byKey[key], rounds = model.rounds;
  const last = k => { const l = storage.last(); return (k.startsWith('sel.') ? (l.sel || {})[k.slice(4)] : l[k]) ?? null; };
  const keep = (k, v) => storage.keepLast(l => {
    const sel = k.startsWith('sel.') ? (l.sel ||= {}) : null, name = sel ? k.slice(4) : k;
    if (v == null) delete (sel || l)[name]; else (sel || l)[name] = v;
    if (sel && !Object.keys(sel).length) delete l.sel;
  });
  const once = ids => [...new Set(ids)];
  const single = quiz.single;
  if (single) document.body.classList.add('single');

  /* ---------- the options ---------- */
  const opt = { colors: $('optColors'), detail: $('optDetail'), letters: $('optLetters'), sign: $('optSign'), hard: $('optHard') };
  $('optColorsText').textContent = quiz.hintLabel;
  opt.colors.checked = quiz.hintsDefault ?? true;
  $('optLettersWrap').hidden = !quiz.lettersLabel; $('optLettersText').textContent = quiz.lettersLabel || '';
  const saved = last('opts');
  if (saved) {
    opt.colors.checked = saved.colors; opt.detail.checked = saved.detail ?? saved.state ?? false;
    opt.letters.checked = !!saved.letters; opt.hard.checked = !!saved.hard; opt.sign.checked = saved.sign ?? true;
  }
  const keepOpts = () => keep('opts', { colors: opt.colors.checked, detail: opt.detail.checked, letters: opt.letters.checked, hard: opt.hard.checked, sign: opt.sign.checked });
  for (const o of Object.values(opt)) o.addEventListener('change', () => { keepOpts(); setup.onMap(); });

  /* ---------- the maps ---------- */
  const MAPS = { free: ['Map', 'by distance'], quiz: quiz.free ? ['Dots', '3 tries'] : ['Quiz map', 'with borders'], overlay: ['Overlay', 'borders on streets'], street: ['Street map', quiz.free ? 'no borders' : 'hard, no borders'], bare: ['Bare map', 'no borders at all'], sat: ['Satellite', 'no names, no borders'] };
  const BACKS = { quiz: ['Quiz map', 'drawn'], overlay: ['Overlay', 'borders on streets'], street: ['Street map', 'no borders'], bare: ['Bare map', 'no borders at all'], sat: ['Satellite', 'no names, no borders'] };
  let chosenMap = quiz.maps.includes(last('map')) ? last('map') : quiz.maps[0];
  let chosenBack = quiz.backs.includes(last('back')) ? last('back') : quiz.backs.includes(quiz.back) ? quiz.back : 'quiz';
  let cover = !!last('cover');
  const bar = document.createElement('div'); bar.className = 'mapbar';
  $('mapSeg').before(bar); bar.append($('mapSeg'));
  $('mapSeg').hidden = !!quiz.free || quiz.maps.length < 2;
  const seg = (el, attr, list, labels, on) => el.replaceChildren(...list.map(m => { const b = document.createElement('button'); b.type = 'button'; b.dataset[attr] = m; [b.textContent, b.title] = labels[m]; b.onclick = () => on(m); return b; }));
  const press = (el, value) => { for (const b of el.children) b.setAttribute('aria-pressed', (b.dataset.map || b.dataset.back) === value); };
  if (!quiz.free) seg($('mapSeg'), 'map', quiz.maps, MAPS, m => (setup.onPick && setup.onPick({ map: m })) || pickMap(m));
  const backSeg = document.createElement('div');
  backSeg.className = 'maps'; backSeg.hidden = !quiz.backs.length; backSeg.setAttribute('role', 'group'); backSeg.setAttribute('aria-label', 'Background');
  seg(backSeg, 'back', quiz.backs, BACKS, b => (setup.onPick && setup.onPick({ back: b })) || pickBack(b));
  bar.append(backSeg);
  const coverSeg = document.createElement('div'), coverBtn = document.createElement('button');
  coverSeg.className = 'maps'; coverSeg.hidden = !quiz.proj;
  coverBtn.type = 'button'; coverBtn.textContent = 'Coverage'; coverBtn.title = 'Street View coverage';
  coverBtn.onclick = () => { cover = !cover; keep('cover', cover || null); syncCover(); };
  coverSeg.append(coverBtn); bar.append(coverSeg);
  const syncCover = () => { coverBtn.disabled = !quiz.proj; coverBtn.setAttribute('aria-pressed', cover && !!quiz.proj); map.coverage(cover); };
  if (quiz.backs.length) keep('back', chosenBack); // (kept as the page opens, as when it is picked)
  function pickMap(m) { chosenMap = m; map.use(m, true); setup.onMap(); build(); }
  function pickBack(b) { chosenBack = b; keep('back', b); press(backSeg, b); map.back(b); }

  /* ---------- what is picked ---------- */
  const SEL = {};
  for (const Kd of kinds.list) { const s = last('sel.' + Kd.key); SEL[Kd.key] = new Set(Array.isArray(s) ? s.filter(id => Kd.ids.includes(id)) : Kd.ids); }
  let savedQuizzes = storage.customs().filter(s => K(s.kind) && Array.isArray(s.ids));
  const keepSaved = () => storage.keepCustoms(savedQuizzes);
  const params = new URLSearchParams(location.search);
  const shared = model.custom.decode(params.get('quiz')) || model.custom.practice(params.get('practice'), params.get('items'));
  if (shared) shared.name = model.custom.name(params.get('name')) || 'Shared quiz';
  let pickKind = K(last('kind')) ? last('kind') : kinds.list[0].key;
  let chosenMode = last('mode');
  if (shared && shared.practice) {
    chosenMode = kinds.ways(K(shared.kind)).includes(params.get('mode')) ? params.get('mode') : 'map';
    if (quiz.maps.includes(params.get('map'))) chosenMap = params.get('map');
    if (quiz.backs.includes(params.get('back'))) chosenBack = params.get('back');
  }
  // the way a kind is answered: the one picked last on this page where it offers it, else its own first (defaultMode)
  const wayFor = key => { const w = kinds.ways(K(key)), d = K(key).defaultMode; return w.includes(chosenMode) ? chosenMode : w.includes(d) ? d : 'map'; };

  // Folders: a tab per layer (a layer in another language in the one it follows); a page whose tabs are other pages
  // (data-folders) lists its layers' rounds as one.
  const folderOf = key => (K(K(key).of) ? K(key).of : key);
  const FOLDERS = once(rounds.list.filter(r => !r.of).map(r => r.kind)), ownTabs = !document.body.dataset.folders, lastIn = {};
  const roundOf = key => rounds.list.find(r => 'r:' + r.id === key);
  const savedOf = key => (key.startsWith('s:') ? savedQuizzes[+key.slice(2)] : null);
  const keyOf = v => 'r:' + v.id, langOf = v => K(v.kind).lang || K(v.kind).label;
  const variantsOf = r => rounds.list.filter(v => v === r || v.of === r);
  const LANGS = quiz.langLabel ? once(quiz.kinds.filter(k => rounds.list.some(r => r.kind === k.key)).map(k => k.lang || k.label)) : [];
  const listLang = () => (LANGS.includes(last('lang')) ? last('lang') : langOf((quiz.kinds.some(k => k.start) ? rounds.list.find(r => K(r.kind).start) : null) || rounds.list[0]));
  // the round a box shows: the one picked, else the one in the language picked last, else the starting kind's, else the first
  const shownOf = vs => (quiz.langLabel ? vs.find(v => langOf(v) === listLang()) : vs.find(v => keyOf(v) === choice) || vs.find(v => langOf(v) === last('lang')) || vs.find(v => K(v.kind).start) || vs[0]);
  let choice = shared ? 'shared' : last('choice') || '';
  if (ownTabs) $('folders').replaceChildren(...FOLDERS.map(k => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.folder = k; b.textContent = K(k).label;
    b.onclick = () => { if (folderOf(kindNow()) === k) return; choice = lastIn[k] || 'r:' + rounds.list.find(r => !r.of && r.kind === k).id; keep('choice', choice); build(); frame(); $('setup').scrollTop = 0; };
    return b;
  }));
  function valid() {
    if (!(choice === 'custom' || (choice === 'shared' && shared) || savedOf(choice) || roundOf(choice))) choice = keyOf(rounds.list.filter(r => !r.of).map(r => shownOf(variantsOf(r))).find(Boolean));
  }
  function kindNow() {
    valid();
    if (choice === 'custom') return pickKind;
    return (choice === 'shared' ? shared : savedOf(choice) || roundOf(choice)).kind;
  }
  function current() {
    const kind = kindNow();
    if (choice === 'custom') return { kind, ids: K(kind).ids.filter(id => SEL[kind].has(id)) };
    if (choice === 'shared') return shared;
    const r = roundOf(choice);
    return savedOf(choice) || { kind, ids: rounds.items(r), box: r.box };
  }
  function choose(key) {
    choice = key; keep('choice', key === 'shared' ? '' : key);
    if (roundOf(key)) lastIn[folderOf(roundOf(key).kind)] = key;
    build();
    if (key === 'custom') { buildPicker(); $('customWrap').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    frame();
  }
  const frame = () => map.frame(map.plain() ? null : current().box);

  /* ---------- the list of rounds ---------- */
  const STAR = 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z';
  const star = p => {
    const svg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg>`;
    return `<span class="star${p >= 1 ? ' done' : p > 0 ? ' part' : ''}" role="img" aria-label="${p >= 1 ? 'Level done' : `${Math.round(p * 100)}% done`}">${svg}` +
      `<span class="fill" style="width:${Math.round(Math.min(p, 1) * 100)}%">${svg}</span></span>`;
  };
  const ICONS = { link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>', del: '<path d="M6 6l12 12M18 6 6 18"/>', save: '<path d="M12 5v14M5 12h14"/>' };
  const icon = (name, label, onclick) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'icon'; b.title = label; b.setAttribute('aria-label', label); b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`; b.onclick = onclick; return b; };
  const withIcons = (box, ...icons) => { const d = document.createElement('div'); d.className = 'round-row'; d.append(box, ...icons); return d; };
  const kindNote = kind => (quiz.kinds.length > 1 ? K(kind).label : '');
  // a switch in a round's box, where its sub would be: [label, title, on, onclick] each
  const switches = list => {
    const row = document.createElement('span'); row.className = 'langs';
    row.append(...list.map(([label, title, on, click]) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (title) b.title = title; b.setAttribute('aria-pressed', on);
      b.onclick = e => { e.stopPropagation(); click(); };
      return b;
    }));
    return row;
  };
  function roundBtn(key, title, sub, kind, ids, random) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'round'; b.dataset.choice = key;
    const t = document.createElement('b'), n = document.createElement('span'); t.textContent = title; n.className = 'n'; n.textContent = plural(ids.length, K(kind).noun);
    b.append(t, n);
    if (sub) { const s = document.createElement('small'); s.textContent = sub; b.append(s); }
    const P = kinds.play(kind, wayFor(kind)), free = chosenMap === 'free' && P.way === 'map'; // (its best in the way picked)
    const best = !random && (free ? ['free'] : ['quiz', 'overlay', 'street', 'bare', 'sat']).map(m => model.results.best(P, ids, m)).filter(Boolean).sort((x, y) => y.s - x.s)[0];
    if (best) { const e = document.createElement('span'); e.className = 'best'; e.textContent = (best.s === ids.length ? '✓ ' : '') + (free ? (best.p || 0).toLocaleString('en-US') : `${best.s}/${ids.length}`); b.append(e); }
    b.onclick = () => choose(key);
    return b;
  }
  // the box of the round picked, with its switches: a group, not a button itself
  function boxed(b, ...rows) {
    const picked = b.dataset.choice === choice;
    if (picked) {
      const kind = kindNow(), ways = kinds.ways(K(kind));
      if (ways.length > 1) { const row = switches(ways.map(w => [kinds.wayLabel(K(kind), w), '', w === wayFor(kind), () => { chosenMode = w; keep('mode', w); build(); }])); row.classList.add('modes'); rows.push(row); }
      const h = document.createElement('span'); h.className = 'langs helps'; rows.push(h);
      if (quiz.free && wayFor(kind) === 'map') rows.push(switches(quiz.maps.map(m => [MAPS[m][0], MAPS[m][1], m === chosenMap, () => { chosenMap = m; map.use(m, true); setup.onMap(); build(); }])));
    }
    if (!rows.length) return b;
    const box = document.createElement('div'), kids = [...b.childNodes], best = n => n.classList && n.classList.contains('best'), side = document.createElement('span');
    box.className = b.className; box.dataset.choice = b.dataset.choice; box.setAttribute('role', 'group'); box.setAttribute('aria-label', kids[0].textContent);
    side.className = 'switches'; side.append(...rows, ...kids.filter(best));
    box.append(...kids.filter(n => !best(n)), side);
    box.onclick = b.onclick;
    return box;
  }
  function roundBox(vs) {
    if (vs.length < 2) { const r = vs[0]; return boxed(roundBtn(keyOf(r), r.label, r.sub, r.kind, rounds.items(r), r.random)); }
    const on = shownOf(vs), btn = roundBtn(keyOf(on), on.label, '', on.kind, rounds.items(on), on.random);
    if (quiz.langLabel || keyOf(on) !== choice) return boxed(btn);
    return boxed(btn, switches(vs.map(v => [langOf(v), '', v === on, () => { keep('lang', langOf(v)); choice = keyOf(v); keep('choice', choice); build(); frame(); }])));
  }
  function build() {
    const wrap = $('rounds'); wrap.replaceChildren();
    const many = FOLDERS.length > 1 && ownTabs, open = folderOf(kindNow()), inOpen = kind => !many || folderOf(kind) === open;
    const levels = model.results.levels(rounds.list.filter(r => !many || folderOf(r.kind) === open));
    if (ownTabs) { $('folders').hidden = !many; for (const b of $('folders').children) b.setAttribute('aria-selected', b.dataset.folder === open); }
    const section = (level, title, rows) => {
      if (!rows.length) return;
      const h = document.createElement('h3'); h.className = 'tier-t';
      if (level >= 0) {
        const lvl = document.createElement('span'); lvl.className = 'lvl'; lvl.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < model.LEVELS.length; i++) { const i_ = document.createElement('i'); if (i <= level) i_.className = 'on'; lvl.append(i_); }
        h.append(lvl);
      }
      h.append(title);
      if (level >= 0 && levels[level] !== undefined) h.insertAdjacentHTML('beforeend', star(levels[level]));
      const d = document.createElement('div'); d.className = 'tier'; d.dataset.tier = level; d.append(h, ...rows); wrap.append(d);
    };
    if (shared && inOpen(shared.kind)) section(-1, shared.practice ? 'Practice' : 'Shared with you', [withIcons(boxed(roundBtn('shared', shared.name, kindNote(shared.kind), shared.kind, shared.ids)), icon('save', 'Save to your quizzes', () => save(shared.name, shared.kind, shared.ids)))]);
    if (LANGS.length > 1) { const row = switches(LANGS.map(l => [l, '', l === listLang(), () => pickLang(l)])); row.classList.add('list'); section(-1, quiz.langLabel, [row]); }
    const byLevel = model.LEVELS.map(() => []);
    for (const r of rounds.list) if (!r.of && inOpen(r.kind)) { const vs = variantsOf(r), on = shownOf(vs); if (on) byLevel[on.level].push(roundBox(vs)); }
    model.LEVELS.forEach((name, i) => section(i, name, byLevel[i]));
    section(-1, 'Your quizzes', savedQuizzes.map((s, i) => inOpen(s.kind) && withIcons(boxed(roundBtn('s:' + i, s.name, kindNote(s.kind), s.kind, s.ids)), icon('link', 'Copy a link to this quiz', () => copyLink(s.kind, s.ids, s.name)), icon('del', 'Delete this quiz', () => remove(i)))).filter(Boolean));
    const custom = document.createElement('button'); custom.type = 'button'; custom.className = 'round custom'; custom.dataset.choice = 'custom';
    const ct = document.createElement('b'), cn = document.createElement('span'), cs = document.createElement('small');
    ct.textContent = 'Custom quiz'; cn.className = 'n'; cn.id = 'customCount'; cs.textContent = 'Pick your own';
    custom.append(ct, cn, cs); custom.onclick = () => { if (many && folderOf(pickKind) !== open) pickKind = open; choose('custom'); };
    wrap.append(boxed(custom));
    for (const b of $('kindSeg').children) b.hidden = !inOpen(b.dataset.kind);
    $('kindSeg').parentElement.hidden = [...$('kindSeg').children].filter(b => !b.hidden).length < 2;
    sync();
    model.results.stars();
  }
  function pickLang(lang) {
    const picked = roundOf(choice), same = picked && variantsOf(picked.of || picked).find(v => langOf(v) === lang);
    keep('lang', lang);
    if (picked) { choice = same ? keyOf(same) : ''; valid(); keep('choice', choice); }
    build(); frame();
  }

  /* ---------- your quizzes, a custom quiz ---------- */
  function save(name, kind, ids) {
    savedQuizzes.push({ name: model.custom.name(name) || `My ${K(kind).noun[1]} (${ids.length})`, kind, ids: [...ids] }); keepSaved();
    choice = 's:' + (savedQuizzes.length - 1); keep('choice', choice);
    build(); toast('Saved');
  }
  function remove(i) {
    if (!confirm(`Delete “${savedQuizzes[i].name}”?`)) return;
    savedQuizzes.splice(i, 1); keepSaved();
    if (choice === 's:' + i) choice = '';
    else if (choice.startsWith('s:') && +choice.slice(2) > i) choice = 's:' + (+choice.slice(2) - 1);
    valid(); keep('choice', choice); build();
  }
  async function copyLink(kind, ids, name) {
    const u = new URL(location.href); u.search = ''; u.hash = '';
    u.searchParams.set('quiz', model.custom.encode(kind, ids)); if (name) u.searchParams.set('name', name);
    try { await navigator.clipboard.writeText(u.href); toast('Link copied'); } catch (e) { window.prompt('Link', u.href); } // (no clipboard: plain http)
  }
  $('kindSeg').parentElement.hidden = kinds.list.length < 2;
  for (const Kd of kinds.list) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.kind = Kd.key;
    const t = document.createElement('b'), s = document.createElement('small'); t.textContent = Kd.label; s.textContent = Kd.sub;
    b.append(t, s); $('kindSeg').appendChild(b);
    b.onclick = () => { pickKind = Kd.key; buildPicker(); };
  }
  let groupEls = [], chipEls = {};
  function buildPicker() {
    const Kd = K(pickKind), sel = SEL[pickKind];
    $('pickTitle').textContent = Kd.pickTitle;
    $('topBy').replaceChildren(...Kd.rankings.map((r, i) => new Option(r.label, i)));
    $('topn').hidden = !Kd.rankings.length;
    $('presets').replaceChildren(...(Kd.presets || []).flatMap(p => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'linkbtn'; b.textContent = p.label;
      b.onclick = () => { sel.clear(); (typeof p.ids === 'function' ? p.ids() : p.ids).forEach(id => sel.add(id)); syncPicker(); };
      return [' · ', b];
    }));
    const wrap = $('groups'); wrap.replaceChildren(); groupEls = []; chipEls = {};
    for (const g of Kd.groups) {
      const div = document.createElement('div'), label = document.createElement('label'), box = document.createElement('input'), b = document.createElement('b'), span = document.createElement('span'), chips = document.createElement('div');
      div.className = 'grp'; label.className = 'grp-t'; box.type = 'checkbox'; b.textContent = g.title; chips.className = 'codes';
      box.onchange = () => { for (const id of g.ids) if (box.checked) sel.add(id); else sel.delete(id); syncPicker(); };
      label.append(box, b, span);
      for (const id of g.ids) {
        const c = document.createElement('button'); c.type = 'button'; c.className = 'cd'; c.textContent = Kd.chip(id); c.title = Kd.chipTitle(id);
        if (Kd.chipClass) { const cls = Kd.chipClass(id); if (cls) c.classList.add(cls); }
        c.onclick = () => toggle([id]);
        chips.appendChild(c); chipEls[id] = c;
      }
      div.append(label, chips); wrap.appendChild(div);
      groupEls.push({ g, box, span });
    }
    syncPicker();
  }
  // a set of items toggled together: all picked unless they are all picked already
  function toggle(ids) { const sel = SEL[pickKind], all = ids.every(id => sel.has(id)); for (const id of ids) if (all) sel.delete(id); else sel.add(id); syncPicker(); }
  function syncPicker() {
    const Kd = K(pickKind), sel = SEL[pickKind];
    for (const { g, box, span } of groupEls) {
      const n = g.ids.filter(id => sel.has(id)).length;
      box.checked = n === g.ids.length; box.indeterminate = n > 0 && n < g.ids.length;
      span.textContent = (g.sub ? g.sub + ' · ' : '') + `${n}/${g.ids.length}`;
    }
    for (const id of Kd.ids) chipEls[id].setAttribute('aria-pressed', sel.has(id));
    for (const b of $('kindSeg').children) b.setAttribute('aria-pressed', b.dataset.kind === pickKind);
    keep('sel.' + pickKind, sel.size < once(Kd.ids).length ? [...sel] : null); keep('kind', pickKind); // (every item picked: nothing to keep)
    sync();
  }
  $('topN').value = last('topN') || 20;
  $('topGo').onclick = () => {
    const Kd = K(pickKind), sel = SEL[pickKind], n = Math.max(1, Math.min(Kd.ids.length, parseInt($('topN').value, 10) || 20));
    $('topN').value = n; keep('topN', n);
    const rank = Kd.rankings[+$('topBy').value || 0];
    let ids = rank.order.slice(0, n);
    if (rank.expand) ids = once(ids.flatMap(rank.expand));
    sel.clear(); ids.filter(id => Kd.areas[id]).forEach(id => sel.add(id)); syncPicker();
  };
  $('selAll').onclick = () => { K(pickKind).ids.forEach(id => SEL[pickKind].add(id)); syncPicker(); };
  $('selNone').onclick = () => { SEL[pickKind].clear(); syncPicker(); };
  $('saveBtn').onclick = () => { const cur = current(); if (!cur.ids.length) return; save($('saveName').value, cur.kind, cur.ids); $('saveName').value = ''; };
  $('saveName').addEventListener('keydown', e => { if (e.key === 'Enter') $('saveBtn').click(); });
  $('shareBtn').onclick = () => { const cur = current(); if (cur.ids.length) copyLink(cur.kind, cur.ids, $('saveName').value.trim()); };

  /* ---------- everything that follows from the choice ---------- */
  // The options as switches in the box of the round picked: each the checkbox of the Help group that it stands for,
  // which keeps it and is hidden itself.
  function helps() {
    const row = $('rounds').querySelector('.helps'); if (!row) return;
    row.replaceChildren(...[...$('helpWrap').querySelectorAll('.toggle')].filter(t => !t.hidden).map(t => {
      const box = t.querySelector('input'), b = document.createElement('button'); b.type = 'button';
      b.textContent = t.textContent.trim(); b.setAttribute('aria-pressed', box.checked);
      b.onclick = e => { e.stopPropagation(); box.checked = !box.checked; box.dispatchEvent(new Event('change')); b.setAttribute('aria-pressed', box.checked); };
      return b;
    }));
    row.hidden = !row.children.length;
  }
  function sync() {
    const cur = current(), Kd = K(cur.kind);
    for (const b of $('rounds').querySelectorAll('.round')) b.setAttribute('aria-pressed', b.dataset.choice === choice);
    if ($('customCount')) $('customCount').textContent = choice === 'custom' ? plural(SEL[pickKind].size, K(pickKind).noun) : '';
    $('customWrap').hidden = choice !== 'custom';
    $('startBtn').disabled = cur.ids.length === 0; $('startBtn').textContent = 'Start';
    $('optDetailWrap').hidden = !Kd.detail;
    if (Kd.detail) $('optDetailText').textContent = Kd.detail.label;
    $('optSignWrap').hidden = !Kd.sign;
    const own = map.layout(Kd) && map.layout(Kd).color; // (a kind whose hint colours are its answers has colours of its own, by neighbour)
    $('optColorsWrap').hidden = !['quiz', 'overlay'].includes(chosenMap) || (Kd.hints === false && !own);
    $('optColorsText').textContent = map.hintLabel(Kd);
    $('optHardWrap').hidden = !!quiz.board || !!Kd.fresh || !!Kd.pickAll; // (those start every question on a clean map already, or have none)
    $('helpWrap').hidden = true; helps();
    press($('mapSeg'), chosenMap);
    if (setup.shown) preview();
    keep('map', chosenMap);
  }
  // The round picked on the map: the rest dimmed (a kind whose answers are sets of areas, dim: false, the whole map; a
  // page of one round none: its round is drawn at the start), on the street map alone tinted instead, its labels on.
  function preview() {
    const cur = current(), Kd = K(cur.kind), chosen = Kd.dim === false || single ? [] : cur.ids.flatMap(id => Kd.areas[id]);
    map.dim(Kd.dim === false ? map.ids : chosen);
    const inRound = new Set(chosen);
    map.mark(map.ids, 'pre', false); if (map.plain()) map.mark(map.ids.filter(a => inRound.has(a)), 'pre');
    map.labels(Kd, single ? [] : cur.ids);
    setup.onMap();
  }

  const setup = {
    shown: false, onMap: () => {}, onPick: null,
    get practice() { return shared && shared.practice ? shared : null; },
    get look() { return { map: chosenMap, back: chosenBack }; },
    kind: () => kindNow(),
    // what is picked besides the rounds, for the maps a review asks its cards on: the quiz shared, each kind's selection
    asked: () => [...(shared ? [[shared.kind, shared.ids]] : []), ...kinds.list.flatMap(Kd => kinds.ways(Kd).map(w => [kinds.play(Kd.key, w).key, w === 'map' ? Kd.ids.filter(id => SEL[Kd.key].has(id)) : Kd.ids]))],
    options: () => ({ hints: opt.colors.checked, letters: !!(quiz.lettersLabel && opt.letters.checked), hard: opt.hard.checked, sign: opt.sign.checked, detail: opt.detail.checked }),
    choice() {
      const cur = current();
      if (single) return { play: kinds.play(cur.kind, 'map'), items: single.draw(), look: { map: 'free', back: quiz.back || chosenBack } };
      if (!cur.ids.length) return null;
      return { play: kinds.play(cur.kind, wayFor(cur.kind)), items: cur.ids, box: cur.box, look: { map: chosenMap, back: chosenBack } };
    },
    open() {
      setup.shown = true;
      map.use(chosenMap); map.back(chosenBack); map.clear(); syncCover();
      press($('mapSeg'), chosenMap); press(backSeg, chosenBack);
      buildPicker(); build(); frame();
    },
    close() { setup.shown = false; },
    tap(area) {
      if (choice !== 'custom') { const cur = current(); pickKind = cur.kind; SEL[pickKind] = new Set(cur.ids); choice = 'custom'; keep('choice', choice); build(); buildPicker(); }
      const ids = K(pickKind).at[area]; if (ids) toggle(ids);
    },
    frame, box: () => current().box,
    // a review's map picker: the maps shown pressed as they are
    pressLook(look) { press($('mapSeg'), look.map); press(backSeg, look.back); },
    bar,
  };
  return setup;
}
