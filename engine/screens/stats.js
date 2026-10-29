// My stats: the player's own answers (the answer log) on the map. The layer chosen on the setup screen, every place
// coloured by how often its question was answered right at once over its last LAST answers (replays left out), in the
// colours of the tries: 90% or more, 70%, 50%, less; a place never asked stays grey. The panel says it for the whole
// layer; a tap on a place for that place, with its last answers (when, how, right or what was given instead, how long
// it took). A page of several layers picks one beside Back. Every way of answering counts, on every map, in rounds and
// reviews alike.
//
//   const stats = makeStats(deps)   -> { open(kind), tap(area), close(), kind() }

const LAST = 10, CLASSES = ['got', 't2', 't3', 'miss'], LEVELS = [.9, .7, .5];

export function makeStats({ model, map, storage, ui }) {
  const { $, feedback } = ui, K = key => model.kinds.byKey[key], WAYS = model.kinds.WAYS || {};
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const pct = x => (x == null ? '–' : `${Math.round(x * 100)}%`);
  const secs = ms => (ms == null ? '–' : ms < 9950 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms / 1000)} s`);
  const median = xs => { if (!xs.length) return null; const s = xs.slice().sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const when = ms => new Date(ms).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const classOf = x => { const i = LEVELS.findIndex(l => x >= l); return CLASSES[i < 0 ? 3 : i]; };
  const layers = model.kinds.list.map(k => k.key);
  let kind = null, by = null;

  const button = el('button', 'ghost', 'My stats'); button.type = 'button'; button.id = 'statsBtn';
  button.hidden = !storage.canLog();
  ($('learnBtn') || $('exploreBtn')).after(button);
  const pick = el('select'); pick.id = 'sPick'; pick.setAttribute('aria-label', 'Layer'); pick.hidden = true;
  pick.append(...layers.map(k => new Option(K(k).label, k)));
  $('eBack').after(pick);

  // the share right at once of an item's last answers (none: never asked)
  const recent = list => list.filter(a => !a.replay).slice(-LAST);
  const share = list => (list.length ? list.filter(a => a.r === 0).length / list.length : null);
  function legend() {
    const ul = el('ul', 'legend'); ul.setAttribute('aria-label', 'Map colors');
    for (const [cls, label] of [['got', '90%+'], ['t2', '70%+'], ['t3', '50%+'], ['miss', 'Under 50%'], ['out', 'Not asked']]) { const li = el('li'); li.append(el('i', cls), label); ul.append(li); }
    return ul;
  }
  function paint() {
    const Kd = K(kind), seen = new Map(), sum = [0, 0];
    for (const id of new Set(Kd.ids)) {
      const last = recent(by.get(String(id)) || []);
      if (!last.length) continue;
      const right = last.filter(a => a.r === 0).length;
      sum[0] += right; sum[1] += last.length;
      for (const a of Kd.areas[id]) { const s = seen.get(a) || seen.set(a, [0, 0]).get(a); s[0] += right; s[1] += last.length; }
    }
    map.mark(map.ids, [...CLASSES, 'out', 'sel'], false);
    for (const a of map.ids) { const s = seen.get(a); map.mark([a], s ? classOf(s[0] / s[1]) : 'out'); }
    map.highlight(null);
    const asked = [...new Set(Kd.ids)].filter(id => by.has(String(id)));
    if (!map.plain()) map.labels(Kd, asked);
    const all = [...by.values()].flat(), firsts = all.filter(a => !a.replay);
    $('eCode').textContent = sum[1] ? pct(sum[0] / sum[1]) : '--';
    feedback($('eInfo'), '', Kd.label, firsts.length ? [`${asked.length} of ${new Set(Kd.ids).size} ${Kd.noun[1]} asked`, `All ${all.length} · ${pct(share(firsts))} · ${secs(median(firsts.map(a => a.ms || 0)))}`] : ['No answers yet']);
    $('eInfo').append(legend());
  }

  const stats = {
    button, pick,
    kind: () => kind,
    async open(k) {
      const want = (kind = k);
      map.look('mine', true);
      pick.hidden = layers.length < 2; pick.value = kind;
      const { answers } = await storage.answers();
      if (kind !== want) return; // (another layer picked meanwhile, or the view left)
      by = new Map();
      for (const a of answers) if (a.quiz === storage.page && a.kind === kind) (by.get(a.item) || by.set(a.item, []).get(a.item)).push(a);
      paint();
    },
    tap(area) {
      if (!by) return;
      const Kd = K(kind), id = Kd.primary(area);
      if (id == null) return;
      const list = by.get(String(id)) || [], firsts = list.filter(a => !a.replay);
      map.mark(map.ids, 'sel', false);
      map.highlight(Kd.areas[id]);
      $('eCode').textContent = firsts.length ? pct(share(recent(list))) : '--';
      const lines = firsts.length ? [`Last ${recent(list).length} · ${pct(share(recent(list)))}`, `All ${list.length} · ${pct(share(firsts))} · ${secs(median(firsts.map(a => a.ms || 0)))}`] : ['Not asked yet'];
      for (const a of list.slice(-8).reverse()) {
        const given = a.given.map(g => (g.startsWith('"') ? `“${g.slice(1)}”` : Kd.ids.some(x => String(x) === g) ? Kd.name(Kd.ids.find(x => String(x) === g)) : g)).join(', ');
        const result = a.r === 0 ? '✓' : a.r < 3 ? `✓ try ${a.r + 1}${given ? ' · ✗' : ''}` : '✗';
        lines.push(`${when(a.at)} · ${WAYS[a.mode] || a.mode}${a.review ? ' · Review' : ''}${a.replay ? ' · Replay' : ''} · ${result}${given ? ' ' + given : ''} · ${secs(a.ms)}`);
      }
      feedback($('eInfo'), firsts.length ? (share(recent(list)) >= LEVELS[1] ? 'ok' : 'bad') : '', Kd.name(id), lines);
      $('eInfo').append(legend());
    },
    close() { kind = null; by = null; pick.hidden = true; map.look('mine', false); },
  };
  return stats;
}
