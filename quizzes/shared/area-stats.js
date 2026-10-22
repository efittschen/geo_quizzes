// My stats: the map quizzes' view of the player's own answers (the answer log, assets/js/answers.js), loaded by
// area-quiz.js like area-review.js, so quiz pages need no changes. A button beside Explore shows the layer chosen on the
// setup screen with every place colored by how often its question was answered right at once, over its last LAST
// answers (replays left out), in the colors of the tries: 90% or more, 70%, 50%, less; a place never asked stays grey.
// The panel says it for the whole layer; a click on a place says it for that place, with its last answers (when, how,
// right or what was given instead, how long it took). A page with several layers picks one beside Back. Back returns
// to the setup screen. Every way of answering counts, on every map, in rounds and in reviews alike.
//
// The engine asks kind (the layer shown, while the view is open: what the map draws and outlines) and pick (a place
// clicked); E is what it shares.

window.areaStats = E => {
  const { $, Q, KINDS, PAGE } = E;
  const LAST = 10; // answers a place's color goes by
  const CLASSES = ['got', 't2', 't3', 'miss'], LEVELS = [0.9, 0.7, 0.5];
  const MODES = { map: 'Map', list: 'List', type: 'Type', pairs: 'Pairs', pick: 'Pick', pickback: 'Pick back', code: 'Type code', draw: 'Draw', name: 'Name it', shape: 'Shape' };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const pct = x => (x == null ? '–' : `${Math.round(x * 100)}%`);
  const secs = ms => (ms == null ? '–' : ms < 9950 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms / 1000)} s`);
  const median = xs => { if (!xs.length) return null; const s = xs.slice().sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const when = ms => new Date(ms).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const classOf = x => CLASSES[LEVELS.findIndex(l => x >= l) < 0 ? 3 : LEVELS.findIndex(l => x >= l)];
  const layers = Q.kinds.map(k => k.key).filter(k => KINDS[k]);
  let kind = null, by = null; // the layer shown; its answers by item

  // The button, beside Explore (and Learn).
  const btn = el('button', 'ghost', 'My stats'); btn.type = 'button'; btn.id = 'statsBtn';
  btn.hidden = typeof ANSWERS !== 'object';
  ($('learnBtn') || $('exploreBtn')).after(btn);
  btn.onclick = () => open(E.chosen());
  // A layer picked beside Back, where the page has several.
  const pickEl = el('select'); pickEl.id = 'sPick'; pickEl.setAttribute('aria-label', 'Layer'); pickEl.hidden = true;
  pickEl.append(...layers.map(k => new Option(KINDS[k].label, k)));
  pickEl.onchange = () => open(pickEl.value);
  $('eBack').after(pickEl);
  $('eBack').addEventListener('click', off);

  async function open(k) {
    const want = kind = KINDS[k] && KINDS[k].base ? KINDS[k].base : k;
    E.enter(); // (the explore view, on the map chosen, drawn for this layer)
    document.getElementById('map').classList.add('mine');
    pickEl.hidden = layers.length < 2; pickEl.value = kind;
    if ($('ePick')) $('ePick').hidden = true;
    const { answers } = await ANSWERS.all();
    if (kind !== want) return; // (another layer was picked meanwhile, or the view was left)
    by = new Map();
    for (const a of answers) if (a.quiz === PAGE && a.kind === kind) (by.get(a.item) || by.set(a.item, []).get(a.item)).push(a);
    paint();
  }
  function off() {
    kind = null; by = null; pickEl.hidden = true;
    document.getElementById('map').classList.remove('mine');
    if ($('ePick')) $('ePick').hidden = false;
  }

  // The share right at once of an item's last answers (none: never asked).
  const recent = list => list.filter(a => !a.replay).slice(-LAST);
  const share = list => (list.length ? list.filter(a => a.r === 0).length / list.length : null);
  function paint() {
    const K = KINDS[kind], seen = new Map(), sum = [0, 0]; // area -> [right, of]; the same of all items
    for (const id of new Set(K.ids)) {
      const last = recent(by.get(String(id)) || []);
      if (!last.length) continue;
      const right = last.filter(a => a.r === 0).length;
      sum[0] += right; sum[1] += last.length;
      for (const a of K.areas[id]) { const s = seen.get(a) || seen.set(a, [0, 0]).get(a); s[0] += right; s[1] += last.length; }
    }
    for (const a of E.AREAS) for (const p of E.pathsOf([a])) {
      p.classList.remove(...CLASSES, 'out', 'sel');
      const s = seen.get(a);
      p.classList.add(s ? classOf(s[0] / s[1]) : 'out');
    }
    E.mark(null);
    const asked = [...new Set(K.ids)].filter(id => by.has(String(id)));
    if (!E.plain()) E.showLabels(kind, asked);
    const all = [...by.values()].flat(), firsts = all.filter(a => !a.replay);
    $('eCode').textContent = sum[1] ? pct(sum[0] / sum[1]) : '--'; // (as the map's colors go: each item's last answers)
    E.setFeedback($('eInfo'), '', K.label, firsts.length ? [`${asked.length} of ${new Set(K.ids).size} ${K.noun[1]} asked`, `All ${all.length} · ${pct(share(firsts))} · ${secs(median(firsts.map(a => a.ms || 0)))}`] : ['No answers yet']);
    $('eInfo').append(legend());
  }
  function legend() {
    const ul = el('ul', 'legend'); ul.setAttribute('aria-label', 'Map colors');
    for (const [cls, label] of [['got', '90%+'], ['t2', '70%+'], ['t3', '50%+'], ['miss', 'Under 50%'], ['out', 'Not asked']]) { const li = el('li'); li.append(el('i', cls), label); ul.append(li); }
    return ul;
  }

  // A place clicked: its item's answers, the last ones listed.
  function pick(area) {
    if (!by) return;
    const K = KINDS[kind], id = K.primary(area);
    if (id == null) return;
    const list = by.get(String(id)) || [], firsts = list.filter(a => !a.replay);
    for (const a of E.AREAS) for (const p of E.pathsOf([a])) p.classList.remove('sel');
    E.mark(K.areas[id]);
    $('eCode').textContent = firsts.length ? pct(share(recent(list))) : '--';
    const lines = firsts.length ? [`Last ${recent(list).length} · ${pct(share(recent(list)))}`, `All ${list.length} · ${pct(share(firsts))} · ${secs(median(firsts.map(a => a.ms || 0)))}`] : ['Not asked yet'];
    for (const a of list.slice(-8).reverse()) {
      const given = a.given.map(g => (g.startsWith('"') ? `“${g.slice(1)}”` : KINDS[kind].ids.some(x => String(x) === g) ? K.name(KINDS[kind].ids.find(x => String(x) === g)) : g)).join(', ');
      const result = a.r === 0 ? '✓' : a.r < 3 ? `✓ try ${a.r + 1}${given ? ' · ✗' : ''}` : '✗';
      lines.push(`${when(a.at)} · ${MODES[a.mode] || a.mode}${a.review ? ' · Review' : ''}${a.replay ? ' · Replay' : ''} · ${result}${given ? ' ' + given : ''} · ${secs(a.ms)}`);
    }
    E.setFeedback($('eInfo'), firsts.length ? (share(recent(list)) >= LEVELS[1] ? 'ok' : 'bad') : '', K.name(id), lines);
    $('eInfo').append(legend());
  }

  return { kind: () => kind, pick, off };
};
