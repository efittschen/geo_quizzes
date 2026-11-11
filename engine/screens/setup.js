// Setup: what to play, and the player's choices until Start.
//
// The rounds by level (Beginner to Expert, by size alone), each level with its star; a quiz of several layers has a
// folder (tab) per layer, a layer in another language in the folder of the one it follows. A round in two languages
// or labels other than a script's (below) keeps its switch in its box.
// Then a quiz shared by link or practised from the review page, the player's own quizzes (a link to each, delete), and
// a custom quiz: the items picked by group, one by one, by a preset, the top N of a ranking, or by tapping the map;
// saved by name or shared as a link.
// Under the list, at the panel's foot, the menu: the layers' tabs, the ways to play the round picked, its options
// (colours, a detail, every label, Sign, Hard mode) and Start, named after the way, with Show preview beside it.
// The ways: grey, those where the language does not matter (Map, Name it, Shape, Draw), played in the round's own; a
// city quiz's Map is two: Dots (on its dots, 3 tries) and Blind (anywhere on the map, by distance);
// blue, where a round is in another script too: List, Type, Pairs, Pick, played in the direction the round button
// beside them turns (Kanji → English or English → Kanji); a blue way the engine has not in that direction is shown
// and previewed, but Start says "not built yet". Show preview plays the way picked on the map (./setup-menu.js); it is
// a setting of the site (storage.settings: preview, false once turned off).
// The maps to play on are pictures on the map (./setup-menu.js), with Street View's coverage a box to tick.
// On a phone (760 px or less, the page's own breakpoint) the map takes the screen and the panel is a card at its foot:
// the round picked by name (a tap opens the list in the card: the layers as a small switch, the rounds as chips, a
// custom quiz's picker under its chip), then the menu. Crossing 760 px draws it anew. Nothing chosen here moves the map,
// but a round picked, which frames it.
// What is chosen is kept for the next visit (storage.last: the choice, the way, the blue ways' direction, the maps …);
// the best of each round is shown in its box.
//
//   const setup = makeSetup(deps)
//   setup.open()            the setup screen (the App shows it), built anew
//   setup.choice()          what Start plays: { play, items, box, look: { map, back } }, or null (nothing picked)
//   setup.options()         { hints, letters, hard, sign, detail }; setup.kind(): the kind of the round picked
//   setup.round()           the round picked: { kind, ids, label } (Explore's overview)
//   setup.tap(area)         a tap on the map: the round picked becomes a custom quiz, the items there toggled
//   setup.practice          a quiz to play at once (the review page's Practice), or null
//   setup.look              { map, back }: the maps chosen
//   setup.overview(round)   the App's: the round drawn as Explore's overview draws it (true), where it does; previewed
//   setup.onMap(), setup.onPick(look)   the App: the map changed (its layout to draw); a map picked (true: the App took it,
//                           a review's)

import { setupMenu } from './setup-menu.js';

export function makeSetup({ quiz, model, map, storage, ui, words, formats }) {
  const { $, plural, toast } = ui, kinds = model.kinds, K = key => kinds.byKey[key], rounds = model.rounds;
  const last = k => { const l = storage.last(); return (k.startsWith('sel.') ? (l.sel || {})[k.slice(4)] : l[k]) ?? null; };
  const keep = (k, v) => storage.keepLast(l => {
    const sel = k.startsWith('sel.') ? (l.sel ||= {}) : null, name = sel ? k.slice(4) : k;
    if (v == null) delete (sel || l)[name]; else (sel || l)[name] = v;
    if (sel && !Object.keys(sel).length) delete l.sel;
  });
  const once = ids => [...new Set(ids)];
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const single = quiz.single;
  if (single) document.body.classList.add('single');
  const parts = setupMenu({ quiz, model, map, formats, $ });
  const phone = matchMedia('(max-width:760px)'), narrow = () => phone.matches;

  /* ---------- the options ---------- */
  // each yes or no, kept: the hint colours, a detail, every label, a city's road sign, Hard mode
  const opt = { colors: quiz.hintsDefault ?? true, detail: false, letters: false, sign: true, hard: false };
  const saved = last('opts');
  if (saved) Object.assign(opt, { colors: !!saved.colors, detail: saved.detail ?? saved.state ?? false, letters: !!saved.letters, hard: !!saved.hard, sign: saved.sign ?? true });
  const keepOpts = () => keep('opts', { ...opt });
  // the options a kind has, on the map picked: [key, label] each (the colours not where the hint colours are its answers,
  // unless it has colours of its own, by neighbour, nor on a city quiz's Dots and Blind; Hard mode not where every
  // question starts on a clean map already)
  function optionsOf(Kd) {
    const own = map.layout(Kd) && map.layout(Kd).color;
    return [
      ['colors', map.hintLabel(Kd), ['quiz', 'overlay'].includes(chosenMap) && !(Kd.hints === false && !own) && !(quiz.free && wayFor(Kd.key) === 'map')],
      ['detail', Kd.detail && Kd.detail.label, !!Kd.detail],
      ['letters', quiz.lettersLabel, !!quiz.lettersLabel],
      ['sign', 'Sign', !!Kd.sign],
      ['hard', 'Hard mode', !quiz.board && !Kd.fresh && !Kd.pickAll],
    ].filter(o => o[2]);
  }

  /* ---------- the maps ---------- */
  const MAPS = { free: ['Map', 'by distance'], quiz: quiz.free ? ['Dots', '3 tries'] : ['Quiz map', 'with borders'], overlay: ['Overlay', 'borders on streets'], street: ['Street map', quiz.free ? 'no borders' : 'hard, no borders'], bare: ['Bare map', 'no borders at all'], sat: ['Satellite', 'no names, no borders'] };
  const BACKS = { quiz: ['Quiz map', 'drawn'], overlay: ['Overlay', 'borders on streets'], street: ['Street map', 'no borders'], bare: ['Bare map', 'no borders at all'], sat: ['Satellite', 'no names, no borders'] };
  let chosenMap = quiz.maps.includes(last('map')) ? last('map') : quiz.maps[0];
  let chosenBack = quiz.backs.includes(last('back')) ? last('back') : quiz.backs.includes(quiz.back) ? quiz.back : 'quiz';
  let cover = !!last('cover'), shownLook = null; // (shownLook: a review's maps, while its cards are asked)
  const bar = el('div', 'mapbar'); $('stage').append(bar);
  // the maps a round is played on, or a city quiz's background; Coverage
  function drawMaps() {
    const look = shownLook || { map: chosenMap, back: chosenBack }, maps = !quiz.free && quiz.maps.length > 1;
    parts.maps.draw(bar, {
      list: maps ? quiz.maps : quiz.backs, on: maps ? look.map : look.back, attr: maps ? 'map' : 'back', labels: maps ? MAPS : BACKS,
      pick: maps ? m => (setup.onPick && setup.onPick({ map: m })) || pickMap(m) : b => (setup.onPick && setup.onPick({ back: b })) || pickBack(b),
      street: last('street'), keepStreet: m => keep('street', m),
      cover: !!quiz.proj, coverOn: cover && !!quiz.proj, onCover: () => { cover = !cover; keep('cover', cover || null); map.coverage(cover && !!quiz.proj); drawMaps(); },
    }, K(kindNow()));
  }
  if (quiz.backs.length) keep('back', chosenBack); // (kept as the page opens, as when it is picked)
  function pickMap(m) { chosenMap = m; map.use(m, true); setup.onMap(); build(); }
  function pickBack(b) { chosenBack = b; keep('back', b); map.back(b); drawMaps(); }

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
  const wayFor = key => { const w = kinds.ways(K(key)), d = K(key).defaultMode; return w.includes(chosenMode) ? chosenMode : w.includes(d) ? d : w.includes('map') ? 'map' : w[0]; }; // (a kind not played on the map: its first way)

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
    b.onclick = () => { if (folderOf(kindNow()) === k) return; soon = null; choice = lastIn[k] || 'r:' + rounds.list.find(r => !r.of && r.kind === k).id; keep('choice', choice); build(); frame(); $('setup').scrollTop = 0; };
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
    choice = key; keep('choice', key === 'shared' ? '' : key); soon = null;
    if (roundOf(key)) lastIn[folderOf(roundOf(key).kind)] = key;
    build();
    if (key === 'custom') { buildPicker(); $('customWrap').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    frame();
  }
  const frame = () => map.frame(map.plain() ? null : current().box);
  const nameOf = () => { const s = savedOf(choice), r = roundOf(choice); return choice === 'custom' ? 'Custom quiz' : choice === 'shared' ? shared.name : s ? s.name : r ? r.label : ''; };

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
  // a round's best in the way picked (its own way on the map: by distance, in points)
  function bestOf(kind, ids, random) {
    if (random) return null;
    const P = kinds.play(kind, wayFor(kind)), free = chosenMap === 'free' && P.way === 'map';
    const best = (free ? ['free'] : ['quiz', 'overlay', 'street', 'bare', 'sat']).map(m => model.results.best(P, ids, m)).filter(Boolean).sort((x, y) => y.s - x.s)[0];
    return best ? (best.s === ids.length ? '✓ ' : '') + (free ? (best.p || 0).toLocaleString('en-US') : `${best.s}/${ids.length}`) : '';
  }
  // a round as a box (the computer's list), or as a chip (a phone's): its name, its size, its best
  function roundBtn(key, title, sub, kind, ids, random) {
    if (narrow()) {
      const c = el('button', 'rchip'); c.type = 'button'; c.dataset.choice = key;
      c.append(el('span', '', title), el('span', 'n', String(ids.length)));
      const best = bestOf(kind, ids, random); if (best) c.append(el('span', 'b', best));
      c.onclick = () => { folded = true; choose(key); };
      return c;
    }
    const b = document.createElement('button'); b.type = 'button'; b.className = 'round'; b.dataset.choice = key;
    const t = document.createElement('b'), n = document.createElement('span'); t.textContent = title; n.className = 'n'; n.textContent = plural(ids.length, K(kind).noun);
    b.append(t, n);
    if (sub) { const s = document.createElement('small'); s.textContent = sub; b.append(s); }
    const best = bestOf(kind, ids, random);
    if (best) { const e = document.createElement('span'); e.className = 'best'; e.textContent = best; b.append(e); }
    b.onclick = () => choose(key);
    return b;
  }
  // a box with switches under its name (a group, not a button itself); a chip with them after it
  function boxed(b, ...rows) {
    if (!rows.length) return b;
    if (narrow()) { const g = el('span', 'rchip-row'); g.append(b, ...rows); return g; }
    const box = document.createElement('div'), kids = [...b.childNodes], best = n => n.classList && n.classList.contains('best'), side = document.createElement('span');
    box.className = b.className; box.dataset.choice = b.dataset.choice; box.setAttribute('role', 'group'); box.setAttribute('aria-label', kids[0].textContent);
    side.className = 'switches'; side.append(...rows, ...kids.filter(best));
    box.append(...kids.filter(n => !best(n)), side);
    box.onclick = b.onclick;
    return box;
  }
  // (the blue ways pick between a round's own language and another script: no switch of their own for those two)
  const byScript = vs => vs.length === 2 && vs.some(v => K(v.kind).of && K(v.kind).lang) && vs.some(v => !K(v.kind).of);
  function roundBox(vs) {
    if (vs.length < 2) { const r = vs[0]; return boxed(roundBtn(keyOf(r), r.label, r.sub, r.kind, rounds.items(r), r.random)); }
    const on = shownOf(vs), btn = roundBtn(keyOf(on), on.label, '', on.kind, rounds.items(on), on.random);
    if (quiz.langLabel || keyOf(on) !== choice || byScript(vs)) return boxed(btn);
    return boxed(btn, switches(vs.map(v => [langOf(v), '', v === on, () => { keep('lang', langOf(v)); choice = keyOf(v); keep('choice', choice); soon = null; build(); frame(); }])));
  }
  let folded = true, wasCustom = false; // (a phone: the list folded in the card)
  function build() {
    const wrap = $('rounds'); wrap.replaceChildren();
    const many = FOLDERS.length > 1 && ownTabs, open = folderOf(kindNow()), inOpen = kind => !many || folderOf(kind) === open;
    const levels = model.results.levels(rounds.list.filter(r => !many || folderOf(r.kind) === open));
    if (ownTabs) { $('folders').hidden = !many; for (const b of $('folders').children) b.setAttribute('aria-selected', b.dataset.folder === open); }
    // the layers' tabs: above the menu, under the list; a phone's as folder tabs on its card's top edge, over the map
    if (narrow()) $('stage').append($('folders')); else $('startbar').prepend($('folders'));
    if (choice === 'custom' && !wasCustom) folded = false; // (a custom quiz just picked: the list opens, its picker in it)
    wasCustom = choice === 'custom';
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
    if (shared && inOpen(shared.kind)) section(-1, shared.practice ? 'Practice' : 'Shared with you', [withIcons(roundBtn('shared', shared.name, kindNote(shared.kind), shared.kind, shared.ids), icon('save', 'Save to your quizzes', () => save(shared.name, shared.kind, shared.ids)))]);
    if (LANGS.length > 1) { const row = switches(LANGS.map(l => [l, '', l === listLang(), () => pickLang(l)])); row.classList.add('list'); section(-1, quiz.langLabel, [row]); }
    const byLevel = model.LEVELS.map(() => []);
    for (const r of rounds.list) if (!r.of && inOpen(r.kind)) { const vs = variantsOf(r), on = shownOf(vs); if (on) byLevel[on.level].push(roundBox(vs)); }
    model.LEVELS.forEach((name, i) => section(i, name, byLevel[i]));
    section(-1, 'Your quizzes', savedQuizzes.map((s, i) => inOpen(s.kind) && withIcons(roundBtn('s:' + i, s.name, kindNote(s.kind), s.kind, s.ids), icon('link', 'Copy a link to this quiz', () => copyLink(s.kind, s.ids, s.name)), icon('del', 'Delete this quiz', () => remove(i)))).filter(Boolean));
    const pickCustom = () => { if (many && folderOf(pickKind) !== open) pickKind = open; choose('custom'); };
    if (narrow()) { const c = el('button', 'rchip custom', '+ Custom'); c.type = 'button'; c.dataset.choice = 'custom'; c.onclick = pickCustom; const d = el('div', 'tier'); d.append(c); wrap.append(d); }
    else {
      const custom = document.createElement('button'); custom.type = 'button'; custom.className = 'round custom'; custom.dataset.choice = 'custom';
      const ct = document.createElement('b'), cn = document.createElement('span'), cs = document.createElement('small');
      ct.textContent = 'Custom quiz'; cn.className = 'n'; cn.id = 'customCount'; cs.textContent = 'Pick your own';
      custom.append(ct, cn, cs); custom.onclick = pickCustom;
      wrap.append(custom);
    }
    for (const b of $('kindSeg').children) b.hidden = !inOpen(b.dataset.kind);
    $('kindSeg').parentElement.hidden = [...$('kindSeg').children].filter(b => !b.hidden).length < 2;
    sync();
    model.results.stars();
  }
  function pickLang(lang) {
    const picked = roundOf(choice), same = picked && variantsOf(picked.of || picked).find(v => langOf(v) === lang);
    keep('lang', lang); soon = null;
    if (picked) { choice = same ? keyOf(same) : ''; valid(); keep('choice', choice); }
    build(); frame();
  }

  /* ---------- the ways ---------- */
  // Grey: the ways of the round's own language; blue: List, Type, Pairs, Pick between it and another script, in the
  // direction picked (from: the script asked, its meaning answered; to: the other way round, List back, Type back, Pick
  // back). A blue way not built in that direction: soon.
  const BLUE = ['list', 'type', 'pairs', 'pick'], BACK = { list: 'listback', type: 'typeback', pick: 'pickback', pairs: 'pairs' }, FROM = { listback: 'list', typeback: 'type', pickback: 'pick' };
  let dir = last('dir') === 'to' ? 'to' : 'from', soon = null;
  // the round's own language and the script it is in too, where it has both
  function scripts() {
    const r = roundOf(choice); if (!r) return null;
    const vs = variantsOf(r.of || r), base = vs.find(v => !K(v.kind).of), lang = vs.find(v => K(v.kind).of && K(v.kind).lang);
    return base && lang ? { base, lang, bk: K(base.kind), lk: K(lang.kind) } : null;
  }
  function waysNow() {
    const kind = kindNow(), way = wayFor(kind), L = scripts();
    if (!L) return { grey: kinds.ways(K(kind)), blue: [], L: null, pressed: ['grey', way] };
    const lw = kinds.ways(L.lk), onLang = kind === L.lk.key, b = FROM[way] || way;
    // (a blue way picked tells the direction)
    if (!soon && onLang && BLUE.includes(b) && way !== 'pairs') { const d = FROM[way] ? 'to' : 'from'; if (d !== dir) { dir = d; keep('dir', d); } }
    return { grey: kinds.ways(L.bk).filter(w => !BLUE.includes(w)), blue: BLUE.filter(w => lw.includes(w) || lw.includes(BACK[w])), L, lw,
      pressed: soon ? ['blue', soon] : onLang && BLUE.includes(b) ? ['blue', b] : ['grey', way] };
  }
  const realOf = (W, w) => (dir === 'from' ? (W.lw.includes(w) ? w : null) : W.lw.includes(BACK[w]) ? BACK[w] : null);
  const dirLabel = W => { const a = langOf(W.L.lang), b = langOf(W.L.base); return dir === 'to' ? `${b} → ${a}` : `${a} → ${b}`; };
  function pickWay(w) { soon = null; chosenMode = w; keep('mode', w); build(); }
  // (the round in its other language, the way picked with it: the same items, so the map stays)
  function pickIn(v, w) { soon = null; keep('lang', langOf(v)); choice = keyOf(v); keep('choice', choice); lastIn[folderOf(v.kind)] = choice; chosenMode = w; keep('mode', w); build(); }
  const goGrey = (W, w) => (W.L && kindNow() !== W.L.bk.key ? pickIn(W.L.base, w) : pickWay(w));
  function goBlue(W, w) {
    const real = realOf(W, w);
    if (!real) { soon = w; build(); return; }
    if (kindNow() !== W.L.lk.key) pickIn(W.L.lang, real); else pickWay(real);
  }
  function wayBtn(W, w, group) {
    const b = el('button', 'way'); b.type = 'button'; b.dataset.way = w;
    b.setAttribute('aria-pressed', W.pressed[0] === group && W.pressed[1] === w);
    b.innerHTML = parts.icon(w); b.append(el('span', '', kinds.WAYS[w]));
    const Kd = group === 'blue' ? W.L.lk : W.L ? W.L.bk : K(kindNow()), real = group === 'blue' ? realOf(W, w) : w;
    b.title = group === 'blue' ? `${dirLabel(W)} · ${kinds.WAYS[w]}` : kinds.wayLabel(Kd, w);
    if (!real) b.classList.add('soon');
    b.onclick = () => (group === 'blue' ? goBlue(W, w) : goGrey(W, w));
    return b;
  }
  // a city quiz's Map as two ways: its map to play on, the way's picture and name
  const MAPWAYS = quiz.free && quiz.maps.includes('quiz') && quiz.maps.includes('free') ? { quiz: ['dots', 'Dots'], free: ['blind', 'Blind'] } : null;
  const mapWay = P => (MAPWAYS && P.way === 'map' ? MAPWAYS[chosenMap] : null);
  function mapWayBtn(W, m) {
    const [pic, name] = MAPWAYS[m], b = el('button', 'way'); b.type = 'button'; b.dataset.way = 'map'; b.dataset.map = m;
    b.setAttribute('aria-pressed', W.pressed[0] === 'grey' && W.pressed[1] === 'map' && chosenMap === m);
    b.innerHTML = parts.icon(pic); b.append(el('span', '', name)); b.title = MAPS[m][1];
    b.onclick = () => { if (chosenMap !== m) { chosenMap = m; map.use(m, true); setup.onMap(); } goGrey(W, 'map'); };
    return b;
  }
  // the play Start plays (soon: one made for the preview alone)
  function playNow(W) {
    const kind = kindNow();
    if (!soon) return kinds.play(kind, wayFor(kind));
    const lk = W.L.lk, ask = i => model.check.askText(lk, i), name = i => W.L.bk.name(i), to = dir === 'to';
    return { kind: lk, way: soon, icon: soon, mode: soon === 'pick' ? 'picks' : soon, format: 'name', back: true, soon: true, questionName: to ? name : ask, answerName: to ? ask : name, answerLang: i => (to && lk.text ? (lk.text(i) || {}).lang : '') };
  }

  /* ---------- the menu: the ways, the options, Start and Show preview ---------- */
  let showPreview = storage.settings().preview !== false;
  $('previewBtn').onclick = () => { showPreview = !showPreview; storage.keepSettings(s => { if (showPreview) delete s.preview; else s.preview = false; }); menu(); };
  function menu() {
    const cur = current(), W = waysNow(), many = !single && W.grey.length + W.blue.length > 1, P = playNow(W);
    // the ways: grey, then the direction and the blue ones
    const grey = el('div', 'wayrow'); grey.append(...W.grey.flatMap(w => (w === 'map' && MAPWAYS ? Object.keys(MAPWAYS).map(m => mapWayBtn(W, m)) : [wayBtn(W, w, 'grey')])));
    const rows = [grey];
    if (W.blue.length) {
      const blue = el('div', 'wayrow blue'), [from, to] = dirLabel(W).split(' → ');
      blue.append(parts.spin(from, to, () => { dir = dir === 'to' ? 'from' : 'to'; keep('dir', dir); if (W.pressed[0] === 'blue') goBlue(W, W.pressed[1]); else build(); }), ...W.blue.map(w => wayBtn(W, w, 'blue')));
      rows.push(blue);
    }
    $('ways').replaceChildren(...rows); $('ways').hidden = !many;
    // the options, each a box to tick
    const pills = optionsOf(K(cur.kind)).map(([k, text]) => {
      const b = el('button', 'opt', text); b.type = 'button'; b.dataset.opt = k; b.setAttribute('aria-pressed', opt[k]);
      b.onclick = () => { opt[k] = !opt[k]; keepOpts(); setup.onMap(); b.setAttribute('aria-pressed', opt[k]); };
      return b;
    });
    $('opts').replaceChildren(...pills); $('opts').hidden = !pills.length;
    // Start, named after the way (only the way: the direction is on its switch)
    const s = $('startBtn'), blueOne = W.pressed[0] === 'blue', mw = mapWay(P), label = blueOne ? `${dirLabel(W)} · ${kinds.WAYS[W.pressed[1]]}` : mw ? mw[1] : kinds.wayLabel(K(cur.kind), P.way);
    s.disabled = !cur.ids.length || !!soon;
    if (many) { s.innerHTML = parts.icon(soon || (mw ? mw[0] : P.way)); const two = el('span', 'st'); two.append(el('b', '', 'Start'), el('small', '', soon ? 'not built yet' : blueOne ? kinds.WAYS[W.pressed[1]] : label)); s.append(two); }
    else s.textContent = 'Start';
    // the preview, once its words are here (a layer's words come when it is first shown: ../app/words.js)
    $('previewBtn').setAttribute('aria-pressed', showPreview);
    const late = setup.shown && showPreview && !single ? [P.kind.key, P.kind.of].filter(k => k && K(k) && kinds.waiting(K(k))) : [];
    if (late.length) { parts.preview.stop(); Promise.all(late.map(words.bring)).then(() => build(), () => {}); }
    else if (setup.shown && showPreview && !single) parts.preview.show(mw ? Object.assign(Object.create(P), { icon: mw[0] }) : P, cur.ids, { label, box: cur.box, blind: !!mw && mw[0] === 'blind' });
    else parts.preview.stop();
  }
  // (a phone: the round picked at the card's head, a tap opening the list)
  function head() {
    const cur = current();
    $('pickHead').querySelector('b').textContent = nameOf();
    $('pickHead').querySelector('.n').textContent = plural(cur.ids.length, K(cur.kind).noun);
    $('pickHead').setAttribute('aria-expanded', !folded);
    document.querySelector('.panel').classList.toggle('folded', folded);
  }
  $('pickHead').onclick = () => { folded = !folded; head(); };
  phone.addEventListener('change', () => { if (setup.shown) build(); }); // (crossing 760 px: the list as boxes or chips)

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
    if (kinds.waiting(K(pickKind))) { words.bring(pickKind).then(buildPicker, () => {}); return; }
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
  function sync() {
    for (const b of $('rounds').querySelectorAll('.round, .rchip')) b.setAttribute('aria-pressed', b.dataset.choice === choice);
    if ($('customCount')) $('customCount').textContent = choice === 'custom' ? plural(SEL[pickKind].size, K(pickKind).noun) : '';
    $('customWrap').hidden = choice !== 'custom';
    if (setup.shown) preview();
    keep('map', chosenMap);
    head(); drawMaps(); menu();
  }
  // The round picked on the map: the rest dimmed (a kind whose answers are sets of areas, dim: false, the whole map; a
  // page of one round none: its round is drawn at the start), on the street map alone tinted instead, its labels on;
  // or, where Explore's list is an overview (places that overlap: the town-name parts), drawn as it draws them, without
  // names (setup.overview: the App's, explore.js preview; previewed: it takes the map's taps and hovers).
  function preview() {
    const cur = current(), Kd = K(cur.kind), chosen = Kd.dim === false || single ? [] : cur.ids.flatMap(id => Kd.areas[id]);
    map.dim(Kd.dim === false ? map.ids : chosen);
    const inRound = new Set(chosen);
    map.mark(map.ids, 'pre', false); if (map.plain()) map.mark(map.ids.filter(a => inRound.has(a)), 'pre');
    setup.previewed = !single && !!setup.overview && setup.overview(setup.round());
    if (setup.previewed) map.clearLabels(); else map.labels(Kd, single ? [] : cur.ids);
    setup.onMap();
  }

  const setup = {
    shown: false, onMap: () => {}, onPick: null, overview: null, previewed: false,
    get practice() { return shared && shared.practice ? shared : null; },
    get look() { return { map: chosenMap, back: chosenBack }; },
    kind: () => kindNow(),
    // the round chosen, its items and name (Explore's overview shows its items)
    round: () => ({ ...current(), label: choice === 'custom' ? 'Custom quiz' : (roundOf(choice) || {}).label }),
    // what is picked besides the rounds, for the maps a review asks its cards on: the quiz shared, each kind's selection
    asked: () => [...(shared ? [[shared.kind, shared.ids]] : []), ...kinds.list.flatMap(Kd => kinds.ways(Kd).map(w => [kinds.play(Kd.key, w).key, w === 'map' ? Kd.ids.filter(id => SEL[Kd.key].has(id)) : Kd.ids]))],
    options: () => ({ hints: opt.colors && optionsOf(K(kindNow())).some(([k]) => k === 'colors'), letters: !!(quiz.lettersLabel && opt.letters), hard: opt.hard, sign: opt.sign, detail: opt.detail }),
    choice() {
      const cur = current();
      if (single) return { play: kinds.play(cur.kind, 'map'), items: single.draw(), look: { map: 'free', back: quiz.back || chosenBack } };
      if (!cur.ids.length) return null;
      // (a practice from the review page: its few questions asked among every place of the layer, all of them lit and
      // to be tapped, the whole map in view: lit alone they would give themselves away, the user's rule 2026-11-10)
      if (cur.practice) return { play: kinds.play(cur.kind, wayFor(cur.kind)), items: cur.ids, whole: true, look: { map: chosenMap, back: chosenBack } };
      return { play: kinds.play(cur.kind, wayFor(cur.kind)), items: cur.ids, box: cur.box, look: { map: chosenMap, back: chosenBack } };
    },
    open() {
      setup.shown = true; shownLook = null;
      map.use(chosenMap); map.back(chosenBack); map.clear(); map.coverage(cover && !!quiz.proj);
      if (choice === 'custom') buildPicker();
      build(); frame();
    },
    // (the round begun: the preview gone, what it lit left to the round)
    close() { setup.shown = false; parts.preview.stop(true); },
    tap(area) {
      if (choice !== 'custom') { const cur = current(); pickKind = cur.kind; SEL[pickKind] = new Set(cur.ids); choice = 'custom'; soon = null; keep('choice', choice); build(); buildPicker(); }
      const ids = K(pickKind).at[area]; if (ids) toggle(ids);
    },
    frame, box: () => current().box,
    // a review's map picker: the maps shown as they are
    pressLook(look) { shownLook = look; drawMaps(); },
    bar,
  };
  return setup;
}
