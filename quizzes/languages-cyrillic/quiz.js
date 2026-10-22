// Cyrillic to Latin: a typing quiz. A word is shown in Cyrillic, the player types it in Latin letters; the alphabet
// table (ALPHABET in words.js) stays next to it unless the player hides it. An answer is right when every letter is
// written in one of the spellings the table knows for it, so "ulitsa" and "ulica" both pass for улица; -ий and -ый at
// the end of a word may also be a plain -y or -i (Nizhny Novgorod). Capitals, spaces, hyphens and apostrophes in the
// answer do not matter. Each word is asked once; the answer the table gives is shown after it, with its meaning.
//
// Rounds are the groups of WORDS and one with every word. As in the map quizzes, a round's size sets its level
// (Beginner under 10, Intermediate under 30, Hard under 60, Expert above), a round's best result is kept in the
// page's record (store.js: best["translit/type/<items>"]) and the progress per level in `stars`.
//
// With a controller (assets/js/gamepad.js, loaded by the page) the cursor clicks as a mouse does, but there are no
// keys to type on: an on-screen keyboard under the answer writes the letters. It is offered on the setup screen and
// is on by itself once a controller is used in this tab, unless the player chose otherwise. Start is Check and Next.
(() => {
  const $ = id => document.getElementById(id);
  const LAT = Object.fromEntries(ALPHABET.map(([c, ...alts]) => [c, alts]));
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const alt = c => `(?:${LAT[c].map(esc).join('|')})`;
  // The word as the table writes it, and the pattern of everything that counts as right.
  // (е after ъ or ь is written ye, since the sign itself is not: въезд, vyezd)
  const latin = w => [...w].map((c, i, cs) => {
    const low = c.toLowerCase(), l = LAT[low];
    if (!l) return c;
    const s = low === 'е' && 'ъь'.includes(cs[i - 1] || ' ') ? 'ye' : l[0];
    return c === low ? s : s.charAt(0).toUpperCase() + s.slice(1);
  }).join('');
  function pattern(w) {
    const cs = [...w.toLowerCase()];
    let re = '';
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i], end = i + 2 === cs.length || !LAT[cs[i + 2]];
      if ((c === 'и' || c === 'ы') && cs[i + 1] === 'й' && end) { re += `(?:${alt(c)}${alt('й')}|y|i)`; i++; }
      else re += LAT[c] ? alt(c) : '';
    }
    return new RegExp(`^${re}$`);
  }
  const clean = s => s.toLowerCase().normalize('NFC').replace(/[\s\-'’ʹʺ"`.]/g, '');

  const TIERS = [[10, 'Beginner'], [30, 'Intermediate'], [60, 'Hard'], [Infinity, 'Expert']];
  const tierOf = n => TIERS.findIndex(([max]) => n < max);
  const ITEMS = WORDS.flatMap(([, , list]) => list.map(([w, en]) => ({ w, en, lat: latin(w), re: pattern(w) })));
  const BY = Object.fromEntries(ITEMS.map(it => [it.w, it]));
  const ROUNDS = [...WORDS.map(([label, sub, list]) => ({ label, sub, ids: list.map(([w]) => w) })), { label: 'All words', sub: 'everything', ids: ITEMS.map(it => it.w) }];

  /* ---------- kept in this browser ---------- */
  const PAGE_ID = location.pathname.replace(/\/(index\.html)?$/, '').split('/').pop();
  const keyOf = ids => `translit/type/${STORE.print(ids)}`;
  const bestOf = ids => STORE.bestIn((STORE.quiz(PAGE_ID).best || {})[keyOf(ids)]);
  function levels() {
    const top = Math.max(...ROUNDS.map(r => tierOf(r.ids.length))), out = [];
    for (let t = top; t >= 0; t--) {
      const own = ROUNDS.filter(r => tierOf(r.ids.length) === t);
      out[t] = own.length ? own.reduce((sum, r) => sum + ((bestOf(r.ids) || {}).s || 0) / r.ids.length, 0) / own.length : out[t + 1];
    }
    return out;
  }
  function keepBest(round, ids, s, t) {
    const prev = bestOf(ids);
    if (!s || (prev && (prev.s > s || (prev.s === s && prev.t <= t)))) return false;
    STORE.setQuiz(PAGE_ID, r => { (r.best ||= {})[keyOf(ids)] = STORE.bestOut({ s, t }, ids.length, round ? round.label : ''); });
    STORE.setQuiz(PAGE_ID, r => { r.stars = levels(); });
    return true;
  }
  const last = () => STORE.quiz(PAGE_ID).last || {};
  const remember = (k, v) => STORE.setQuiz(PAGE_ID, r => { (r.last ||= {})[k] = v; });

  /* ---------- the table ---------- */
  $('abc').append(...ALPHABET.map(([c, l]) => {
    const d = document.createElement('div'); d.className = 'cell'; d.dataset.c = c;
    d.innerHTML = `<span class="cy" lang="ru">${c.toUpperCase()} ${c}</span><span class="la">${l || '–'}</span>`;
    return d;
  }));
  const light = w => { const used = new Set([...(w || '').toLowerCase()]); for (const d of $('abc').children) d.classList.toggle('on', used.has(d.dataset.c)); };

  /* ---------- setup ---------- */
  let chosen = Math.min(last().round ?? 0, ROUNDS.length - 1);
  const fmt = ms => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  function listRounds() {
    const box = $('rounds'); box.replaceChildren();
    let tier = -1;
    ROUNDS.forEach((r, i) => {
      const t = tierOf(r.ids.length);
      if (t !== tier) { tier = t; const h = document.createElement('h3'); h.textContent = TIERS[t][1]; box.append(h); }
      const b = document.createElement('button'); b.type = 'button'; b.className = 'round'; b.setAttribute('aria-pressed', i === chosen);
      const best = bestOf(r.ids);
      b.innerHTML = `<span class="rl"><b></b><small></small></span><span class="rs"></span>`;
      b.querySelector('b').textContent = r.label; b.querySelector('small').textContent = r.sub;
      b.querySelector('.rs').textContent = best ? `${best.s}/${r.ids.length} · ${fmt(best.t)}` : `${r.ids.length} words`;
      if (best && best.s === r.ids.length) b.classList.add('done');
      b.onclick = () => { chosen = i; remember('round', i); listRounds(); };
      box.append(b);
    });
    $('startBtn').textContent = `Start with ${ROUNDS[chosen].ids.length} words`;
  }
  $('hideTable').checked = !!last().hide;
  $('hideTable').onchange = () => remember('hide', $('hideTable').checked);

  /* ---------- the on-screen keyboard ---------- */
  const padUsed = () => { try { return !!JSON.parse(sessionStorage.getItem('geoquizzes-gamepad')).shown; } catch (e) { return false; } };
  $('useKeys').checked = last().keys ?? padUsed();
  $('useKeys').onchange = () => { remember('keys', $('useKeys').checked); keysShown(); };
  const keysShown = () => { $('kb').hidden = !$('useKeys').checked; };
  addEventListener('gamepadconnected', () => { if (last().keys == null) { $('useKeys').checked = true; keysShown(); } });
  const type = k => {
    if (!G || G.answered) return;
    const a = $('answer');
    a.value = k === '⌫' ? a.value.slice(0, -1) : a.value + (k === 'space' ? ' ' : k);
  };
  $('kb').append(...['qwertyuiop', 'asdfghjkl', "zxcvbnm-'"].map((row, r) => {
    const d = document.createElement('div');
    d.append(...[...row, ...(r === 2 ? ['space', '⌫'] : [])].map(k => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'key' + (k.length > 1 ? ' wide' : ''); b.textContent = k;
      if (k === '⌫') b.setAttribute('aria-label', 'Delete the last letter');
      b.onclick = () => type(k);
      return b;
    }));
    return d;
  }));

  /* ---------- a round ---------- */
  let G = null, clock = 0;
  const show = view => { for (const v of ['setup', 'play', 'result']) $(v).hidden = v !== view; $('tableWrap').classList.toggle('hidden', view === 'play' && $('hideTable').checked); };
  function start(ids, round) {
    const queue = ids.slice();
    for (let i = queue.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [queue[i], queue[j]] = [queue[j], queue[i]]; }
    G = { ids, round, queue, i: 0, right: 0, missed: [], t0: Date.now(), answered: false };
    $('bar').replaceChildren(...queue.map(() => document.createElement('i')));
    show('play'); keysShown(); ask();
    clearInterval(clock); clock = setInterval(() => { $('sTime').textContent = fmt(Date.now() - G.t0); }, 500);
  }
  function ask() {
    const it = BY[G.queue[G.i]];
    G.answered = false; G.at = performance.now();
    $('word').textContent = it.w; $('answer').value = ''; $('answer').readOnly = false; $('go').textContent = 'Check';
    $('fb').className = 'fb'; $('fb').textContent = '';
    $('sQ').textContent = `${G.i + 1}/${G.queue.length}`; $('sRight').textContent = G.right; $('sTime').textContent = fmt(Date.now() - G.t0);
    light($('hideTable').checked ? '' : it.w);
    if ($('kb').hidden) $('answer').focus();
  }
  function check() {
    const it = BY[G.queue[G.i]], typed = $('answer').value;
    if (!clean(typed)) { $('answer').focus(); return; }
    const ok = it.re.test(clean(typed));
    G.answered = true;
    if (ok) G.right++; else G.missed.push(it.w);
    // the answer log (assets/js/answers.js): the word, typed; a Retry round's answers are replays
    if (typeof ANSWERS === 'object') ANSWERS.add({ quiz: PAGE_ID, kind: 'words', item: it.w, mode: 'type', replay: !G.round, r: ok ? 0 : 3, ms: performance.now() - G.at, given: ok ? [] : ['"' + typed.trim()], names: { [it.w]: `${it.w} · ${it.lat}` }, layer: 'Words' });
    $('bar').children[G.i].className = ok ? 'ok' : 'bad';
    $('fb').className = 'fb ' + (ok ? 'ok' : 'bad');
    $('fb').innerHTML = `<b></b><span></span>`;
    $('fb').querySelector('b').textContent = ok ? `✓ ${it.lat}` : `✕ ${it.lat}`;
    $('fb').querySelector('span').textContent = (ok && clean(typed) !== clean(it.lat) ? `your spelling counts too · ` : '') + it.en;
    $('sRight').textContent = G.right;
    $('answer').readOnly = true; $('go').textContent = G.i + 1 < G.queue.length ? 'Next' : 'Finish'; $('go').focus();
    light(it.w);
  }
  function next() { if (++G.i < G.queue.length) ask(); else finish(); }
  function finish() {
    clearInterval(clock);
    const ms = Date.now() - G.t0, n = G.queue.length, whole = G.i >= n;
    const record = whole && G.round && keepBest(G.round, G.ids, G.right, ms);
    $('rTitle').textContent = whole ? `${G.right} of ${n} right` : 'Round ended';
    $('rSub').textContent = whole ? `${fmt(ms)}${record ? ' · your best so far' : ''}${G.right === n ? ' · perfect' : ''}` : `${G.right} right of ${G.i} answered`;
    $('missed').replaceChildren(...G.missed.map(w => { const li = document.createElement('li'); li.innerHTML = '<span class="cy" lang="ru"></span><b></b><small></small>'; li.children[0].textContent = w; li.children[1].textContent = BY[w].lat; li.children[2].textContent = BY[w].en; return li; }));
    $('retry').hidden = !G.missed.length;
    light(''); show('result'); listRounds();
  }
  $('form').addEventListener('submit', e => { e.preventDefault(); if (G.answered) next(); else check(); });
  $('startBtn').onclick = () => start(ROUNDS[chosen].ids, ROUNDS[chosen]);
  $('restart').onclick = () => start(G.ids, G.round);
  $('end').onclick = finish;
  $('again').onclick = () => start(G.ids, G.round);
  $('retry').onclick = () => start(G.missed.slice(), null); // practice only: no result is kept
  $('rounds-back').onclick = () => show('setup');
  // What the online copy brings shows on the setup screen at once; a round goes on undisturbed.
  window.addEventListener('geoquizzes:fresh', e => { e.preventDefault(); if (!$('setup').hidden) listRounds(); });

  listRounds(); show('setup');
})();
