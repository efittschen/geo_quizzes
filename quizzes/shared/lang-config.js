// Script quizzes on a board of tiles: builds the QUIZ config for ./area-quiz.js from a script's file (SCRIPT, see
// ./reading.js). The board takes the place of the map: one tile per answer, a letter's sound as names are spelled
// on the map, or a word's meaning. The question is a letter or a word in the script, set in one of several
// typefaces; a click on its tile answers, and the answer is said aloud where the device has a voice for it. A round
// lights its own tiles, so its size is how many there are to choose from, and everything else is the engine's:
// levels, stars, custom quizzes, review.
//
// A page loads the script's file, ./reading.js, sets LANG_OPTS, then this file and area-quiz.js:
//   LANG_OPTS = { part }   'letters' (the default), 'words' or 'alphabets'
//
// Letters. Rounds: every group of the base language's letters and its mixes; then a round per other language, named
// after its countries, with what it adds or reads another way (such a letter is asked with those countries over
// it, since it is read that way only there); then all of them.
// Words. Rounds: every theme, its mixes, and all of them. Where a script has several languages, the country is
// chosen first, in a row above the rounds: each country has its own words of every theme, and "All countries" the
// words of every country side by side; the list starts on the base language's country. A word is the same question
// whichever of them asks it, so they share their review cards, and its countries are said with the answer.
// Alphabets (a script that many countries write with letters of their own: Latin). The question is a country (or the
// countries of an area that write exactly the same letters), with its area over it, and the tiles are the letters beyond a to z written in that area, a block per area: a click on
// every letter the country writes answers, one it does not write is a wrong click. A round is an area. A letter that
// is rare there (in a few words only, or in a part of the country) is asked like the others and turns blue.
// Explore there also shows a language picked from a list: the tiles of its letters, in every area where it is written.
// The tiles of a block stand in the order of the alphabet, and a round whose tiles are in some of the blocks shows
// those. Each block is as many tiles wide as fills the page best when it is shown alone (a phone held upright gets
// narrow blocks), and the blocks are put in rows the same way.

const QUIZ = (() => {
  const O = typeof LANG_OPTS === 'object' ? LANG_OPTS : {}, PART = ['words', 'alphabets'].includes(O.part) ? O.part : 'letters', WORDS = PART === 'words', ABC = PART === 'alphabets';
  document.body.classList.add('board', PART);
  const S = SCRIPT, TAGS = Object.keys(S.langs || {}), BASE = TAGS[0];
  const CIRCLE = '◌'; // the dotted circle a mark is shown on
  const nf = s => s.normalize('NFC'); // one way to write a letter, however the file has it (ड़ as ड and its dot)
  const uniq = a => [...new Set(a)], pick = a => a[Math.random() * a.length | 0];
  // The countries of some languages, as said with an answer: "Serbia · Montenegro · North Macedonia".
  const where = tags => uniq(tags.flatMap(t => S.langs[t].where.split(' · '))).join(' · ');
  const short = tag => S.langs[tag].label || S.langs[tag].where;

  /* ---------- what is asked: ITEM[id] = { forms, tile, note, langs, tag, group } and the groups they are in ---------- */
  const ITEM = {}, GROUPS = []; // GROUPS: [{ title, block, ids, mix }], each a round and, without mix, a part of the picker
  const MIXES = [];
  if (ABC) {
    // An area's countries, each with the letters it writes (S.alphabets: [{ title, rows: [name, letters, languages,
    // the rare ones of them] }], made by tools/builds/languages). An item has a tile per letter, in its area's block:
    // `tiles`, by area and letter.
    for (const A of S.alphabets) GROUPS.push({ title: A.title, block: A.title, ids: A.rows.map(([name, letters, langs, rare]) => {
      const id = `${A.title}:${name}`;
      ITEM[id] = { forms: [name], letters: letters.split(' '), rare: new Set((rare || '').split(' ').filter(Boolean)), tiles: letters.split(' ').map(c => `${A.title}:${c}`), tag: A.title, note: langs, langs: [] };
      return id;
    }) });
  } else if (!WORDS) {
    for (const g of S.letters) GROUPS.push({ title: g.title, block: g.block || '', ids: g.rows.map(r => {
      const forms = nf(r[0]).split(' '), id = forms[0];
      ITEM[id] = { forms, tile: r[1], note: r[3] || '', langs: [BASE], plain: g.plain };
      return id;
    }) });
    for (const [label, what] of S.mixes || []) MIXES.push([label, nf(what).split(' ')]);
    // What the other languages add or read another way: a row several of them share is one question (with its
    // note, where they agree on it), and languages with the same rows are one round.
    const rounds = new Map();
    for (const tag of TAGS.slice(1)) {
      const ids = ((S.own || {})[S.langs[tag].like || tag]?.rows || []).map(r => {
        const forms = nf(r[0]).split(' '), id = `${forms[0]}/${r[1]}`, it = ITEM[id] ||= { forms, tile: r[1], note: r[3] || '', langs: [], own: true };
        if (it.note !== (r[3] || '')) it.note = '';
        it.langs.push(tag);
        return id;
      });
      if (ids.length) rounds.set(ids.join(' '), [...(rounds.get(ids.join(' ')) || []), tag]);
    }
    for (const [ids, tags] of rounds) GROUPS.push({ title: where(tags), block: '', ids: ids.split(' '), of: tags[0] });
    for (const id in ITEM) if (ITEM[id].own) ITEM[id].tag = where(ITEM[id].langs);
  } else {
    // A word is one question, whatever the number of languages that have it (READING.words).
    for (const w of READING.words()) ITEM[w.id] = { forms: [w.word], tile: w.meaning, langs: w.langs, t: w.t, note: w.notes.join(' · '), tag: TAGS.length > 1 ? where(w.langs) : '' };
    for (const t of S.words.themes) GROUPS.push({ title: t.title, block: S.words.one ? '' : t.title, ids: READING.words().filter(w => w.themes.includes(t.title)).map(w => w.id) });
    for (const [label, titles] of S.words.mixes || []) MIXES.push([label, uniq(GROUPS.filter(g => titles.includes(g.title)).flatMap(g => g.ids))]);
  }
  const ALL = Object.keys(ITEM);
  // the countries with words of their own (Words: Assamese has letters of its own but no words yet)
  const SAID = WORDS ? TAGS.filter(t => ALL.some(id => (ITEM[id].langs || []).includes(t))) : TAGS;
  // An item's tiles, by what stands for them: the label of its answer, or (alphabets) an area and each of its letters.
  const tilesOf = id => ITEM[id].tiles || [ITEM[id].tile];
  // A capital and its small letter, or the letter alone where it has no capital of its own (ß, ı).
  const both = c => { const C = c.toUpperCase(); return C.length === 1 && C !== c && C.toLowerCase() === c ? `${C} ${c}` : c; };
  const labelOf = key => (ABC ? both(key.slice(key.indexOf(':') + 1)) : key);
  const onCircle = f => (/^\p{M}/u.test(f) ? CIRCLE + f : f); // a mark is shown on the dotted circle
  const written = id => ITEM[id].forms.map(onCircle).join(' ');
  // A letter is asked as a capital or a small one, a word as a sign may write it: Аптека, АПТЕКА, аптека. In capitals a
  // word is written as its language writes them (Greek drops its accents: ΛΕΩΦΟΡΟΣ). Georgian is asked as written: its
  // capitals (Mtavruli) are not among its letters.
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const shown = id => {
    const [word] = ITEM[id].forms;
    if (!WORDS) return onCircle(pick(ITEM[id].forms));
    if (S.script === 'geor' || word !== word.toLowerCase()) return word;
    return pick([word, cap(word), upper(word)]);
  };
  // (not toLocaleUpperCase('el'): Firefox keeps the accents)
  const upper = w => (S.script === 'grek' ? w.toUpperCase().normalize('NFD').replace(/́/g, '').normalize('NFC') : w.toUpperCase());
  // What is said with a letter: its note, and a place written with it (SCRIPT.eg, made by tools/builds/languages).
  const eg = id => { const e = (S.eg || {})[id]; return e ? `${e[0]} · ${e[1]}` : ''; };
  // Said aloud: the letter (a mark on the script's carrier consonant) and its place, or the word.
  const say = id => {
    const it = ITEM[id], e = (S.eg || {})[id], [f] = it.forms;
    return { text: WORDS ? f : [/^\p{M}/u.test(f) ? (S.carrier || '') + f : f, e ? e[0] : ''].filter(Boolean).join('. '), lang: it.t || it.langs[0] };
  };

  /* ---------- the board: blocks of tiles ---------- */
  const [TW, TH, GAP, BETWEEN] = WORDS ? [176, 54, 8, 30] : [104, 78, 8, 30];
  const BLOCKS = [], TILE = {}, TILE_OF = {}, placed = new Set(); // a label has one tile, in the first block that asks it
  for (const g of GROUPS) {
    let b = BLOCKS.find(x => x.title === g.block);
    if (!b) BLOCKS.push(b = { title: g.block, labels: [] });
    for (const id of g.ids) for (const key of tilesOf(id)) if (!placed.has(key)) { placed.add(key); b.labels.push(key); }
  }
  for (let i = BLOCKS.length; i--;) if (!BLOCKS[i].labels.length) BLOCKS.splice(i, 1); // (a group whose tiles are all in blocks before it)
  for (const b of BLOCKS) b.labels.sort((x, y) => x.localeCompare(y, 'en', { numeric: true }));
  // The box the board is played in: the map's, which on a phone is what the round's panel leaves of the screen.
  const stage = document.getElementById('stage').getBoundingClientRect(), phone = matchMedia('(max-width:760px)').matches;
  const [SW, SH] = stage.width && stage.height ? [stage.width, phone ? Math.max(200, innerHeight - 250) : stage.height] : [1000, 800];
  const fit = (w, h) => Math.min(SW / w, SH / h), best = list => list.reduce((b, l) => (l.fit > b.fit ? l : b));
  for (const b of BLOCKS) {
    const n = b.labels.length;
    Object.assign(b, best(Array.from({ length: n }, (_, i) => { const w = (i + 1) * (TW + GAP) - GAP, h = Math.ceil(n / (i + 1)) * (TH + GAP) - GAP; return { wide: i + 1, w, h, fit: fit(w, h) }; })));
  }
  const lay = perRow => {
    let x = 0, y = 0, rowH = 0, W = 0;
    const boxes = BLOCKS.map((b, i) => {
      if (i && i % perRow === 0) { x = 0; y += rowH + BETWEEN; rowH = 0; }
      const box = [x, y, x + b.w, y + b.h];
      x += b.w + BETWEEN; rowH = Math.max(rowH, b.h); W = Math.max(W, box[2]);
      return box;
    });
    return { boxes, W, H: y + rowH, fit: fit(W, y + rowH) };
  };
  const LAYOUT = best(BLOCKS.map((_, i) => lay(i + 1)));
  const r = 10, tilePath = (x, y) => `M${x + r},${y}h${TW - 2 * r}q${r},0 ${r},${r}v${TH - 2 * r}q0,${r} ${-r},${r}h${-(TW - 2 * r)}q${-r},0 ${-r},${-r}v${-(TH - 2 * r)}q0,${-r} ${r},${-r}z`;
  const areas = [];
  BLOCKS.forEach((b, i) => {
    b.box = LAYOUT.boxes[i];
    b.labels.forEach((label, n) => {
      const x = b.box[0] + (n % b.wide) * (TW + GAP), y = b.box[1] + Math.floor(n / b.wide) * (TH + GAP), id = 't' + areas.length;
      TILE[id] = { label: labelOf(label), key: label, block: b, ids: [] }; TILE_OF[label] = id;
      areas.push({ id, d: tilePath(x, y), lx: x + TW / 2, ly: y + TH / 2, a: TW * TH, g: '' });
    });
  });
  for (const id of ALL) for (const key of tilesOf(id)) TILE[TILE_OF[key]].ids.push(id);
  // The part of the board a round is played on: the blocks its tiles are in, unless that is all of them.
  const boxOf = ids => {
    const bs = uniq(ids.flatMap(id => tilesOf(id).map(key => TILE[TILE_OF[key]].block)));
    if (bs.length === BLOCKS.length) return undefined;
    // (alphabets: room over the tiles for the counter of the letters still to click)
    return [Math.min(...bs.map(b => b.box[0])) - GAP, Math.min(...bs.map(b => b.box[1])) - GAP - (ABC ? TH * .6 : 0), Math.max(...bs.map(b => b.box[2])) + GAP, Math.max(...bs.map(b => b.box[3])) + GAP];
  };

  /* ---------- rounds: each group, the mixes, everything ---------- */
  const KEY = WORDS ? 'all' : ABC ? 'alphabets' : 'letters', rounds = [], sig = ids => [...ids].sort().join(' ');
  const add = (label, ids) => {
    ids = uniq(ids).filter(id => ITEM[id]);
    if (ids.length > 1 && sig(ids) !== sig(ALL) && !rounds.some(q => sig(q.ids) === sig(ids))) rounds.push({ kind: KEY, label, ids, box: boxOf(ids) });
  };
  for (const g of GROUPS) if (!g.of) add(g.title, g.ids);
  for (const [label, ids] of MIXES) add(label, ids);
  for (const g of GROUPS) if (g.of) add(g.title, g.ids);
  if (!ABC) rounds.push({ kind: KEY, label: WORDS ? 'All words' : 'All letters' }); // (alphabets: every area has its own tiles)

  /* ---------- kinds: the letters; or the words of every country, and of each one; or the countries' alphabets ---------- */
  const kind = (key, ids, extra) => ({
    key, noun: WORDS ? ['word', 'words'] : ['letter', 'letters'],
    // (a letter two countries share is listed with the first of them)
    groups: GROUPS.map(g => ({ title: g.title, sub: '', ids: g.ids.filter(id => ids.includes(id)) })).map((g, i, all) => ({ ...g, ids: g.ids.filter(id => !all.slice(0, i).some(q => q.ids.includes(id))) })).filter(g => g.ids.length),
    areasOf: id => [TILE_OF[ITEM[id].tile]],
    areaLabel: a => TILE[a].label, flashArea: true, hints: false, merge: false, areaRank: false,
    prompt: 'text', text: id => ({ text: shown(id), cls: READING.face(ITEM[id].forms.join(''), ITEM[id].plain), lang: ITEM[id].t || ITEM[id].langs[0], tag: WORDS ? '' : ITEM[id].tag }),
    short: id => ITEM[id].tile, name: id => `${written(id)} · ${ITEM[id].tile}`,
    about: id => (WORDS ? [ITEM[id].note, ITEM[id].tag] : [ITEM[id].tag, ITEM[id].note, eg(id)]).filter(Boolean),
    clicked: a => `${TILE[a].label} · ${uniq(TILE[a].ids.map(written)).join(' · ')}`,
    chip: id => written(id), chipTitle: id => [ITEM[id].tile, ITEM[id].tag].filter(Boolean).join(' · '),
    say,
    ...extra,
  });
  const name = id => ITEM[id].forms[0];
  const letterOf = a => TILE[a].key.slice(TILE[a].key.indexOf(':') + 1), rareAt = (id, a) => ITEM[id].rare.has(letterOf(a));
  const kinds = ABC ? [kind('alphabets', ALL, {
    label: 'Alphabets', noun: ['country', 'countries'], say: undefined,
    // every letter of the country is to be clicked; no outline on hover (it would show them), and a letter is the
    // answer for many countries, so no color stays on its tile
    areasOf: id => ITEM[id].tiles.map(key => TILE_OF[key]), clickAll: true, areaNoun: 'letters', fresh: true, primary: () => null, rare: rareAt,
    text: id => ({ text: name(id), cls: '', lang: '', tag: ITEM[id].tag }),
    short: name, name,
    about: id => [[ITEM[id].letters.filter(c => !ITEM[id].rare.has(c)).join(' '), ITEM[id].rare.size ? `rare: ${[...ITEM[id].rare].join(' ')}` : ''].filter(Boolean).join(' · '), ITEM[id].note],
    chip: name, chipTitle: id => `${ITEM[id].tag} · ${ITEM[id].letters.join(' ')}`,
  })] : !WORDS ? [kind('letters', ALL, { label: 'Letters' })]
    : SAID.length < 2 ? [kind('all', ALL, { label: 'Words' })]
      : [kind('all', ALL, { label: 'Words', lang: (S.pick || [])[1] || 'All countries' }), ...SAID.map((t, i) => kind(t, ALL.filter(id => ITEM[id].langs.includes(t)), {
        label: short(t), lang: short(t), of: 'all', cards: 'all', start: !i,
        say: id => ({ ...say(id), lang: ITEM[id].t || t }), // in a country's round, a word is said in that country's language
      }))];

  // Alphabets, Explore: a language's letters on the tiles of every area where it is written, from each country's
  // languages (a row's fifth entry: [language, its letters there, the rare ones of them]). A tile is in the color of
  // rare letters where every country of the area that writes the letter in that language writes it rarely.
  const byLanguage = () => {
    const L = new Map();
    for (const A of S.alphabets) for (const [name, , , , by = []] of A.rows) for (const [lang, letters, rare] of by) {
      (L.get(lang) || L.set(lang, []).get(lang)).push({ area: A.title, name, letters: letters ? letters.split(' ') : [], rare: rare ? rare.split(' ') : [] });
    }
    return [...L].sort((a, b) => a[0].localeCompare(b[0], 'en')).map(([lang, rows]) => {
      const sorted = a => uniq(a).sort((x, y) => x.localeCompare(y, 'en')), all = sorted(rows.flatMap(r => r.letters)).join(' ');
      const tiles = seldom => uniq(rows.map(r => r.area)).flatMap(area => {
        const here = rows.filter(r => r.area === area), rareHere = c => here.filter(r => r.letters.includes(c)).every(r => r.rare.includes(c));
        return sorted(here.flatMap(r => r.letters)).filter(c => !seldom || rareHere(c)).map(c => TILE_OF[`${area}:${c}`]);
      });
      // where it is written, a line per area: the area and its countries (not a row that goes by its languages: it
      // has too many to name). A country that writes other letters of it than all of them has those behind it, and
      // its rare ones where the countries differ in them; rare ones they all share are a line of their own.
      const rares = uniq(rows.map(r => r.rare.join(' ')));
      const told = r => { const more = [r.letters.join(' ') !== all ? r.letters.join(' ') || 'a–z' : '', rares.length > 1 && r.rare.length ? `rare: ${r.rare.join(' ')}` : ''].filter(Boolean).join(', '); return more ? `${r.name} (${more})` : r.name; };
      return {
        label: lang, areas: tiles(false), rare: tiles(true), code: all || 'a–z', title: lang,
        sub: [...uniq(rows.map(r => r.area)).map(area => [area, ...rows.filter(r => r.area === area && !r.name.split(' · ').includes(lang)).map(told)].join(' · ')), rares.length === 1 && rares[0] ? `rare: ${rares[0]}` : ''].filter(Boolean),
      };
    });
  };

  return {
    key: `${S.script}-${PART}`,
    board: true,
    areas, borders: [],
    context: BLOCKS.length > 1 ? BLOCKS.map(b => `M${b.box[0] - GAP},${b.box[1] - GAP}H${b.box[2] + GAP}V${b.box[3] + GAP}H${b.box[0] - GAP}z`).join('') : undefined, // each block on a ground of its own
    size: [LAYOUT.W, LAYOUT.H], pad: 16, maxZoom: 8, labelScale: .2, fly: { pad: 1.4, min: .25 },
    hintLabel: '', hintsDefault: false,
    langLabel: WORDS && SAID.length > 1 ? (S.pick || [])[0] || 'Country' : undefined,
    exploreKind: KEY,
    exploreList: ABC ? { label: 'Language', items: byLanguage() } : undefined,
    explore: a => {
      const ids = TILE[a].ids;
      if (ABC) return { code: TILE[a].label, title: TILE[a].block.title, sub: ids.map(id => (rareAt(id, a) ? `${name(id)} · rare` : name(id))) };
      return { code: uniq(ids.map(written)).join(' · '), title: TILE[a].label, sub: ids.map(id => [ids.length > 1 || WORDS ? written(id) : '', ITEM[id].tag, ITEM[id].note, WORDS ? '' : eg(id)].filter(Boolean).join(' · ')) };
    },
    rounds, kinds,
  };
})();
