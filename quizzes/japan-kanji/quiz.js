// Prefectures in Kanji: Japan's 47 prefectures, their names in kanji (東京都, 秋田県) and in English, three ways:
//   Match            a board of kanji and English names, up to eight pairs: pick one of each that belong together.
//                    A wrong pair flashes red and counts against both names; a round bigger than a board is played
//                    board after board.
//   Kanji → English  a name in kanji, four English names to pick from (the others from the same round, or from all
//   English → Kanji  of Japan where the round is too small); the other way round.
// Once a name is answered, the answer box gives it every way: kanji, English, and the Chinese name (simplified
// characters, which a Chinese map or sign uses) with its pinyin.
// A name is right when it is found without a mistake. As in the map quizzes, a round's size sets its level (Beginner
// under 10, Intermediate under 30, Hard under 60), each round keeps its best result per way of playing in the page's
// record (store.js: best["<mode>/type/<items>"]), and `stars` hold the progress per level, from the best of the
// three ways. With a controller (gamepad.js) every tile and choice is a button its cursor clicks; Start is Next.
(() => {
  const $ = id => document.getElementById(id);
  const BY = Object.fromEntries(PREFECTURES.map(([id, kanji, en, zh, py]) => [id, { id, kanji, en, zh, py }]));
  const ALL = PREFECTURES.map(p => p[0]);
  const ROUNDS = [...ROUND_GROUPS.map(([label, ids]) => ({ label, ids })), { label: 'All prefectures', ids: ALL }];
  const MODES = [['match', 'Match', 'kanji and English pairs'], ['k2e', 'Kanji → English', 'pick the English name'], ['e2k', 'English → Kanji', 'pick the kanji']];
  const BOARD = 8; // pairs on one board
  const TIERS = [[10, 'Beginner'], [30, 'Intermediate'], [60, 'Hard'], [Infinity, 'Expert']];
  const tierOf = n => TIERS.findIndex(([max]) => n < max);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmt = ms => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  // The answer box: a mark and what is said, then the prefecture every way (kanji · English, Chinese and pinyin).
  function says(cls, head, id) {
    const p = BY[id], fb = $('fb'), names = el('div', 'names'), zh = el('span', 'zh', p.zh);
    fb.className = 'fb ' + cls;
    zh.lang = 'zh-Hans';
    const ja = el('span', 'ja', p.kanji); ja.lang = 'ja';
    names.append(ja, el('span', 'sep', '·'), el('span', 'en', p.en), el('span', 'sep', '·'), zh, el('span', 'py', p.py));
    fb.replaceChildren(el('div', 'head', head), names);
  }

  /* ---------- kept in this browser ---------- */
  const PAGE_ID = location.pathname.replace(/\/(index\.html)?$/, '').split('/').pop();
  const keyOf = (mode, ids) => `${mode}/type/${STORE.print(ids)}`;
  const bestOf = (mode, ids) => STORE.bestIn((STORE.quiz(PAGE_ID).best || {})[keyOf(mode, ids)]);
  const bestAny = ids => Math.max(0, ...MODES.map(([m]) => (bestOf(m, ids) || {}).s || 0));
  function levels() {
    const top = Math.max(...ROUNDS.map(r => tierOf(r.ids.length))), out = [];
    for (let t = top; t >= 0; t--) {
      const own = ROUNDS.filter(r => tierOf(r.ids.length) === t);
      out[t] = own.length ? own.reduce((sum, r) => sum + bestAny(r.ids) / r.ids.length, 0) / own.length : out[t + 1];
    }
    return out;
  }
  function keepBest(mode, round, s, t) {
    const prev = bestOf(mode, round.ids);
    if (!s || (prev && (prev.s > s || (prev.s === s && prev.t <= t)))) return false;
    STORE.setQuiz(PAGE_ID, r => { (r.best ||= {})[keyOf(mode, round.ids)] = STORE.bestOut({ s, t }, round.ids.length, round.label); });
    STORE.setQuiz(PAGE_ID, r => { r.stars = levels(); });
    return true;
  }
  const last = () => STORE.quiz(PAGE_ID).last || {};
  const remember = (k, v) => STORE.setQuiz(PAGE_ID, r => { (r.last ||= {})[k] = v; });

  /* ---------- setup ---------- */
  let mode = MODES.some(([m]) => m === last().mode) ? last().mode : 'match';
  let chosen = Math.min(last().round ?? 0, ROUNDS.length - 1);
  function listSetup() {
    $('modes').replaceChildren(...MODES.map(([m, label, sub]) => {
      const b = el('button', 'mode'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', m === mode);
      b.append(el('b', '', label), el('small', '', sub));
      b.onclick = () => { mode = m; remember('mode', m); listSetup(); };
      return b;
    }));
    const box = $('rounds'); box.replaceChildren();
    let tier = -1;
    ROUNDS.forEach((r, i) => {
      const t = tierOf(r.ids.length);
      if (t !== tier) { tier = t; box.append(el('h3', '', TIERS[t][1])); }
      const b = el('button', 'round'); b.type = 'button'; b.setAttribute('aria-pressed', i === chosen);
      const best = bestOf(mode, r.ids), name = el('span', 'rl');
      name.append(el('b', '', r.label), el('small', '', r.ids.slice(0, 4).map(id => BY[id].kanji).join(' ') + (r.ids.length > 4 ? ' …' : '')));
      b.append(name, el('span', 'rs', best ? `${best.s}/${r.ids.length} · ${fmt(best.t)}` : `${r.ids.length} prefectures`));
      if (best && best.s === r.ids.length) b.classList.add('done');
      b.onclick = () => { chosen = i; remember('round', i); listSetup(); };
      box.append(b);
    });
    $('startBtn').textContent = `Start with ${ROUNDS[chosen].ids.length} prefectures`;
  }

  /* ---------- a round ---------- */
  let G = null, clock = 0;
  const show = view => { for (const v of ['setup', 'play', 'result']) $(v).hidden = v !== view; };
  function start(ids, round) {
    G = { mode, ids, round, queue: shuffle(ids), i: 0, wrong: new Set(), done: new Set(), t0: Date.now() };
    $('bar').replaceChildren(...G.queue.map(() => el('i')));
    $('sQl').textContent = mode === 'match' ? 'Pairs' : 'Question';
    show('play'); $('fb').textContent = ''; $('fb').className = 'fb';
    if (mode === 'match') { $('board').hidden = false; $('pick').hidden = true; board(); }
    else { $('board').hidden = true; $('pick').hidden = false; ask(); }
    clearInterval(clock); clock = setInterval(() => { $('sTime').textContent = fmt(Date.now() - G.t0); }, 500);
    stats();
  }
  function stats() {
    $('sQ').textContent = `${G.done.size}/${G.queue.length}`;
    $('sRight').textContent = [...G.done].filter(id => !G.wrong.has(id)).length;
    [...$('bar').children].forEach((t, i) => { const id = G.queue[i]; t.className = G.done.has(id) ? (G.wrong.has(id) ? 'bad' : 'ok') : ''; });
  }
  const mark = (id, bad) => { if (bad) G.wrong.add(id); };

  // Match: a board of up to BOARD pairs, from the queue in order.
  let sel = null;
  function board() {
    const ids = G.queue.slice(G.i, G.i + BOARD);
    sel = null; $('next').hidden = true;
    const tile = (id, side) => {
      const b = el('button', 'tile ' + side, side === 'kanji' ? BY[id].kanji : BY[id].en); b.type = 'button'; b.dataset.id = id; b.dataset.side = side;
      if (side === 'kanji') b.lang = 'ja';
      b.onclick = () => choose(b);
      return b;
    };
    $('colA').replaceChildren(...shuffle(ids).map(id => tile(id, 'kanji')));
    $('colB').replaceChildren(...shuffle(ids).map(id => tile(id, 'en')));
    G.board = ids;
  }
  function choose(b) {
    if (b.disabled) return;
    if (!sel || sel.dataset.side === b.dataset.side) { if (sel) sel.classList.remove('sel'); sel = b; b.classList.add('sel'); return; }
    const a = sel; sel = null; a.classList.remove('sel');
    if (a.dataset.id === b.dataset.id) {
      for (const t of [a, b]) { t.disabled = true; t.classList.add(G.wrong.has(t.dataset.id) ? 'late' : 'ok'); }
      G.done.add(a.dataset.id); stats();
      says('ok', '✓ Right', a.dataset.id);
      if (G.board.every(id => G.done.has(id))) {
        G.i += G.board.length;
        if (G.i < G.queue.length) setTimeout(board, 500); else setTimeout(finish, 500);
      }
    } else {
      mark(a.dataset.id, true); mark(b.dataset.id, true);
      for (const t of [a, b]) { t.classList.add('no'); setTimeout(() => t.classList.remove('no'), 600); }
      const kanji = a.dataset.side === 'kanji' ? a : b, other = kanji === a ? b : a;
      says('bad', `✕ Not ${BY[other.dataset.id].en}:`, kanji.dataset.id);
    }
  }

  // Kanji → English, English → Kanji: one name, four to pick from.
  function ask() {
    const id = G.queue[G.i], k2e = G.mode === 'k2e', p = BY[id];
    $('prompt').textContent = k2e ? p.kanji : p.en; $('prompt').lang = k2e ? 'ja' : 'en'; $('prompt').classList.toggle('ja', k2e);
    const pool = G.ids.length >= 4 ? G.ids : ALL;
    const options = shuffle([id, ...shuffle(pool.filter(x => x !== id)).slice(0, 3)]);
    $('choices').replaceChildren(...options.map((x, n) => {
      const b = el('button', 'choice', k2e ? BY[x].en : BY[x].kanji); b.type = 'button'; b.dataset.id = x;
      if (!k2e) b.lang = 'ja';
      b.prepend(el('small', '', String(n + 1)));
      b.onclick = () => pick(b);
      return b;
    }));
    $('next').hidden = true; $('fb').textContent = ''; $('fb').className = 'fb';
  }
  const k2eOf = b => (G.mode === 'k2e' ? BY[b.dataset.id].en : BY[b.dataset.id].kanji); // what a choice said
  function pick(b) {
    const id = G.queue[G.i];
    if ($('choices').classList.contains('answered')) return;
    const right = b.dataset.id === id;
    mark(id, !right); G.done.add(id); stats();
    for (const c of $('choices').children) { c.disabled = true; if (c.dataset.id === id) c.classList.add('ok'); }
    if (!right) b.classList.add('no');
    const p = BY[id];
    says(right ? 'ok' : 'bad', right ? '✓ Right' : `✕ Not ${k2eOf(b)}`, id);
    $('next').hidden = false; $('next').textContent = G.i + 1 < G.queue.length ? 'Next' : 'Finish'; $('next').focus();
  }
  $('next').onclick = () => { if (++G.i < G.queue.length) ask(); else finish(); };
  document.addEventListener('keydown', e => {
    if ($('play').hidden || G.mode === 'match') return;
    if (/^[1-4]$/.test(e.key)) { const c = $('choices').children[+e.key - 1]; if (c && !c.disabled) c.click(); }
    else if (e.key === 'Enter' && !$('next').hidden) { e.preventDefault(); $('next').click(); }
  });

  function finish() {
    clearInterval(clock);
    const ms = Date.now() - G.t0, n = G.queue.length, whole = G.done.size === n;
    const right = [...G.done].filter(id => !G.wrong.has(id)).length;
    const record = whole && G.round && keepBest(G.mode, G.round, right, ms);
    $('rTitle').textContent = whole ? `${right} of ${n} right first time` : 'Round ended';
    $('rSub').textContent = whole ? `${MODES.find(m => m[0] === G.mode)[1]} · ${fmt(ms)}${record ? ' · your best so far' : ''}${right === n ? ' · perfect' : ''}` : `${right} right of ${G.done.size} answered`;
    const missed = G.queue.filter(id => G.wrong.has(id));
    $('missed').replaceChildren(...missed.map(id => {
      const li = el('li'), ja = el('span', 'ja', BY[id].kanji), zh = el('small', 'zh', `${BY[id].zh} ${BY[id].py}`);
      ja.lang = 'ja'; zh.lang = 'zh-Hans';
      li.append(ja, el('b', '', BY[id].en), zh);
      return li;
    }));
    $('retry').hidden = !missed.length; G.missedIds = missed;
    show('result'); listSetup();
  }
  $('startBtn').onclick = () => start(ROUNDS[chosen].ids, ROUNDS[chosen]);
  $('restart').onclick = () => start(G.ids, G.round);
  $('end').onclick = finish;
  $('again').onclick = () => start(G.ids, G.round);
  $('retry').onclick = () => start(G.missedIds, null); // practice only: no result is kept
  $('back').onclick = () => show('setup');
  // What the online copy brings shows on the setup screen at once; a round goes on undisturbed.
  window.addEventListener('geoquizzes:fresh', e => { e.preventDefault(); if (!$('setup').hidden) listSetup(); });

  listSetup(); show('setup');
})();
