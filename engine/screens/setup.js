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
// The ways: a grey row, a city quiz's Map as two: Dots (on its dots, 3 tries) and Blind (anywhere on the map, by
// distance). Where a round is in a script too (Kanji, Cyrillic…), all its ways in one blue block, the language on its
// tab (Kanji or English), turned by the round button on it: Map, Name it, Shape and Draw play the round in that
// language (its names asked, or answered, in it), List, Type, Pairs and Pick go from it to the other (the user's
// choice B, 2026-11-11); a way the engine has not in that language is shown, but Start says "not built yet". Show preview plays the way picked on the map (./setup-menu.js); it is
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
  // (a layer's one script is no layer to pick for a custom quiz: a quiz of its own items, custom, saved or shared, is
  // played in either language by the language's tab, customSide: base or lang; a saved or shared one starts in its own)
  const scriptOf = Kd => (Kd && K(Kd.of) && Kd.lang && kinds.list.filter(x => x.of === Kd.of && x.lang).length === 1 ? K(Kd.of) : null);
  let pickKind = K(last('kind')) ? last('kind') : kinds.list[0].key;
  if (scriptOf(K(pickKind))) pickKind = scriptOf(K(pickKind)).key;
  let customSide = last('cside') === 'lang' ? 'lang' : 'base';
  if (shared) customSide = scriptOf(K(shared.kind)) ? 'lang' : 'base';
  // a layer and its one script: { bk, lk, base, lang (their names' holders, as a round's are) }, or null
  const sidesOf = kind => { const k = K(kind), bk = scriptOf(k) || k, lk = bk && kinds.list.find(x => x.of === bk.key && scriptOf(x)); return lk ? { bk, lk, base: { kind: bk.key }, lang: { kind: lk.key }, custom: true } : null; };
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
    const own = ownQuiz(), c = own && sidesOf(own.kind);
    if (own) return c ? (customSide === 'lang' ? c.lk : c.bk).key : own.kind;
    return roundOf(choice).kind;
  }
  function current() {
    const kind = kindNow();
    if (choice === 'custom') return { kind, ids: K(kind).ids.filter(id => SEL[pickKind].has(id)) };
    if (choice === 'shared') return kind === shared.kind ? shared : { ...shared, kind };
    if (savedOf(choice)) return kind === savedOf(choice).kind ? savedOf(choice) : { ...savedOf(choice), kind };
    const r = roundOf(choice);
    return { kind, ids: rounds.items(r), box: r.box };
  }
  // a quiz of its own items picked (custom, saved, shared): its layer and items; a round: null
  function ownQuiz() { return choice === 'custom' ? { kind: pickKind } : choice === 'shared' ? shared : savedOf(choice); }
  function choose(key) {
    choice = key; keep('choice', key === 'shared' ? '' : key); soon = null;
    if (savedOf(key)) { customSide = scriptOf(K(savedOf(key).kind)) ? 'lang' : 'base'; keep('cside', customSide); } // (a saved quiz: in its own language first)
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
  // A round in a script too: the language picked (from: the script; to: the round's own). Map, Name it, Shape, Draw:
  // the round in it; List, Type, Pairs, Pick: from it to the other (in the own language, the script's List back, Type
  // back, Pick back). A way not built in that language: soon.
  const BLUE = ['list', 'type', 'pairs', 'pick'], BACK = { list: 'listback', type: 'typeback', pick: 'pickback', pairs: 'pairs' }, FROM = { listback: 'list', typeback: 'type', pickback: 'pick' };
  let dir = last('dir') === 'to' ? 'to' : 'from', soon = null;
  // the round's own language and the script it is in too, where it has both
  function scripts() {
    if (ownQuiz()) return sidesOf(ownQuiz().kind);
    const r = roundOf(choice); if (!r) return null;
    const vs = variantsOf(r.of || r), base = vs.find(v => !K(v.kind).of), lang = vs.find(v => K(v.kind).of && K(v.kind).lang);
    return base && lang ? { base, lang, bk: K(base.kind), lk: K(lang.kind) } : null;
  }
  // the ways: top (the map's and the rest), bottom (a script's List, Type, Pairs, Pick), the one pressed
  function waysNow() {
    const kind = kindNow(), way = wayFor(kind), L = scripts();
    if (!L) return { top: kinds.ways(K(kind)), bottom: [], L: null, pressed: way };
    const lw = kinds.ways(L.lk), bw = kinds.ways(L.bk), onLang = kind === L.lk.key, other = w => !BLUE.includes(w) && !FROM[w];
    // (the play picked tells the language: one of the own language's, or a back one, is in it; Pairs keeps it)
    if (!soon) { const d = !onLang || FROM[way] ? 'to' : way === 'pairs' ? dir : 'from'; if (d !== dir) { dir = d; keep('dir', d); } }
    return { top: once([...bw.filter(other), ...lw.filter(other)]), bottom: BLUE.filter(w => lw.includes(w) || lw.includes(BACK[w])), L, lw, bw, pressed: soon || FROM[way] || way };
  }
  // a way in the language picked: [the side played (lang, base; none where the round has one language), the way played],
  // or null
  const realOf = (W, w) => {
    if (!W.L) return [null, w];
    if (BLUE.includes(w)) { const r = dir === 'from' ? w : BACK[w]; return W.lw.includes(r) ? ['lang', r] : null; }
    return dir === 'from' ? (W.lw.includes(w) ? ['lang', w] : null) : W.bw.includes(w) ? ['base', w] : null;
  };
  const langNow = W => langOf(dir === 'to' ? W.L.base : W.L.lang);
  const dirLabel = W => { const a = langOf(W.L.lang), b = langOf(W.L.base); return dir === 'to' ? `${b} → ${a}` : `${a} → ${b}`; };
  function pickWay(w) { soon = null; chosenMode = w; keep('mode', w); build(); }
  // (the round in its other language, the way picked with it: the same items, so the map stays)
  function pickIn(v, w) { soon = null; keep('lang', langOf(v)); choice = keyOf(v); keep('choice', choice); lastIn[folderOf(v.kind)] = choice; chosenMode = w; keep('mode', w); build(); }
  function goWay(W, w) {
    const r = realOf(W, w);
    if (!r) { soon = w; build(); return; }
    const [side, real] = r;
    if (side && W.L.custom) { if (customSide !== side) { customSide = side; keep('cside', side); } pickWay(real); return; } // (a custom quiz: its items, the side's layer)
    const v = side && W.L[side];
    if (v && kindNow() !== v.kind) pickIn(v, real); else pickWay(real);
  }
  function wayBtn(W, w) {
    const b = el('button', 'way'); b.type = 'button'; b.dataset.way = w;
    b.setAttribute('aria-pressed', W.pressed === w);
    b.innerHTML = parts.icon(w); b.append(el('span', '', kinds.WAYS[w]));
    b.title = !W.L ? kinds.wayLabel(K(kindNow()), w) : `${BLUE.includes(w) ? dirLabel(W) : langNow(W)} · ${kinds.WAYS[w]}`;
    if (!realOf(W, w)) b.classList.add('soon');
    b.onclick = () => goWay(W, w);
    return b;
  }
  // a city quiz's Map as two ways: its map to play on, the way's picture and name
  const MAPWAYS = quiz.free && quiz.maps.includes('quiz') && quiz.maps.includes('free') ? { quiz: ['dots', 'Dots'], free: ['blind', 'Blind'] } : null;
  const mapWay = P => (MAPWAYS && P.way === 'map' ? MAPWAYS[chosenMap] : null);
  function mapWayBtn(W, m) {
    const [pic, name] = MAPWAYS[m], b = el('button', 'way'); b.type = 'button'; b.dataset.way = 'map'; b.dataset.map = m;
    b.setAttribute('aria-pressed', W.pressed === 'map' && chosenMap === m);
    b.innerHTML = parts.icon(pic); b.append(el('span', '', name)); b.title = MAPS[m][1];
    b.onclick = () => { if (chosenMap !== m) { chosenMap = m; map.use(m, true); setup.onMap(); } goWay(W, 'map'); };
    return b;
  }
  // the play Start plays (soon: one made for the preview alone, for List, Type, Pairs, Pick; none for the others)
  function playNow(W) {
    const kind = kindNow();
    if (!soon) return kinds.play(kind, wayFor(kind));
    if (!BLUE.includes(soon)) return null;
    const lk = W.L.lk, ask = i => model.check.askText(lk, i), name = i => W.L.bk.name(i), to = dir === 'to';
    return { kind: lk, way: soon, icon: soon, mode: soon === 'pick' ? 'picks' : soon, format: 'name', back: true, soon: true, questionName: to ? name : ask, answerName: to ? ask : name, answerLang: i => (to && lk.text ? (lk.text(i) || {}).lang : '') };
  }

  /* ---------- the menu: the ways, the options, Start and Show preview ---------- */
  let showPreview = storage.settings().preview !== false;
  $('previewBtn').onclick = () => { showPreview = !showPreview; storage.keepSettings(s => { if (showPreview) delete s.preview; else s.preview = false; }); menu(); };
  function menu() {
    const cur = current(), W = waysNow(), many = !single && W.top.length + W.bottom.length > 1, P = playNow(W);
    // the ways: a grey row; a round in a script too, one blue block (the top line, then List, Type, Pairs, Pick) under
    // its language's tab, whose button turns the language and plays the way pressed in the other
    const btns = ws => ws.flatMap(w => (w === 'map' && MAPWAYS ? Object.keys(MAPWAYS).map(m => mapWayBtn(W, m)) : [wayBtn(W, w)]));
    const row = el('div', W.L ? 'wayrow blue' : 'wayrow');
    if (W.L) row.append(parts.spin(langNow(W), () => { dir = dir === 'to' ? 'from' : 'to'; keep('dir', dir); goWay(W, W.pressed); }));
    row.append(...btns(W.top), ...(W.top.length && W.bottom.length ? [el('i', 'brk')] : []), ...btns(W.bottom));
    $('ways').replaceChildren(row); $('ways').hidden = !many;
    if (W.L && many) document.querySelector('.panel').style.setProperty('--tabw', row.querySelector('.sm-dir').offsetWidth + 'px'); // (a phone's title beside it)
    // the options, each a box to tick
    const pills = optionsOf(K(cur.kind)).map(([k, text]) => {
      const b = el('button', 'opt', text); b.type = 'button'; b.dataset.opt = k; b.setAttribute('aria-pressed', opt[k]);
      b.onclick = () => { opt[k] = !opt[k]; keepOpts(); setup.onMap(); b.setAttribute('aria-pressed', opt[k]); };
      return b;
    });
    $('opts').replaceChildren(...pills); $('opts').hidden = !pills.length;
    // Start, named after the way (only the way: the direction is on its switch)
    const s = $('startBtn'), across = !!W.L && BLUE.includes(W.pressed), mw = P && mapWay(P), label = across ? `${dirLabel(W)} · ${kinds.WAYS[W.pressed]}` : mw ? mw[1] : P ? kinds.wayLabel(K(cur.kind), P.way) : kinds.WAYS[W.pressed];
    s.disabled = !cur.ids.length || !!soon;
    if (many) { s.innerHTML = parts.icon(soon || (mw ? mw[0] : P.way)); const two = el('span', 'st'); two.append(el('b', '', 'Start'), el('small', '', soon ? 'not built yet' : across ? kinds.WAYS[W.pressed] : label)); s.append(two); }
    else s.textContent = 'Start';
    // the preview, once its words are here (a layer's words come when it is first shown: ../app/words.js)
    $('previewBtn').setAttribute('aria-pressed', showPreview);
    const shown = setup.shown && showPreview && !single && !!P, late = shown ? [P.kind.key, P.kind.of].filter(k => k && K(k) && kinds.waiting(K(k))) : [];
    if (late.length) { parts.preview.stop(); Promise.all(late.map(words.bring)).then(() => build(), () => {}); }
    else if (shown) parts.preview.show(mw ? Object.assign(Object.create(P), { icon: mw[0] }) : P, cur.ids, { label, box: cur.box, blind: !!mw && mw[0] === 'blind' });
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
  const pickable = kinds.list.filter(Kd => !scriptOf(Kd));
  $('kindSeg').parentElement.hidden = pickable.length < 2;
  for (const Kd of pickable) {
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
    // (the names in the language on the tab, where the round is in a script too, whichever layer its way plays)
    const L = scripts(); if (L) waysNow();
    if (setup.previewed) map.clearLabels(); else map.labels(L ? (dir === 'from' ? L.lk : L.bk) : Kd, single ? [] : cur.ids);
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
      if (choice !== 'custom') { const cur = current(), sk = scriptOf(K(cur.kind)); pickKind = sk ? sk.key : cur.kind; customSide = sk ? 'lang' : 'base'; keep('cside', customSide); SEL[pickKind] = new Set(cur.ids); choice = 'custom'; soon = null; keep('choice', choice); build(); buildPicker(); }
      const ids = K(pickKind).at[area]; if (ids) toggle(ids);
    },
    frame, box: () => current().box,
    // a review's map picker: the maps shown as they are
    pressLook(look) { shownLook = look; drawMaps(); },
    bar,
  };
  return setup;
}
