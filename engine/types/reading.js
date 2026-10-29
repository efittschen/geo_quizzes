// Reading a script: what the script quizzes share (engine/types/lang.js: letters and words on a board of tiles), and the
// Type mode of every name in such a script: a city quiz's script side (engine/types/city.js), a layer in another script
// (engine/types/layer.js), typed in Latin letters. A page loads its script's file first (SCRIPT, e.g.
// data/letters/cyrillic.js), then this one. A page with names in several scripts loads each of their files
// (each declares SCRIPT with var and adds it to ALL_SCRIPTS at its end), then this one: SCRIPT is the last of them.
//
// A script is learned once, for every country that writes it and has Street View: the letters they share, then what
// each country adds to them or reads another way, and the words of their signs side by side.
//
//   SCRIPT = { name, script, unicode, faces, wide, inherent, carrier, pick, langs, regions, letters, mixes,
//              together, own, words }
//     script     'cyrl', 'deva' or 'beng': its typefaces (./formats.css, classes s-<script> f0, f1…)
//     unicode    its name in Unicode ('Cyrillic'): which of a country's place names are written in it
//     faces      how many of those typefaces there are; a question is set in one of them, picked anew each time, so
//                a letter is known by its shape and not by one font. wide: how many of them (the first ones) have
//                the letters beyond the script's basic set (қ, ө), where that is not all of them
//     pick       what the areas of its languages are called, and all of them, where they are no countries:
//                ['Region', 'All regions'] (left out: 'Country', 'All countries')
//     regions    areas of its own on the map, where a language is written in a part of a country or across
//                countries: { <id>: { name, label, states, districts, places } } (tools/builds/languages draws them)
//     langs      the languages written in it, the first one being the base whose letters `letters` are:
//                { <tag>: { name, where, at, label, like, but } }: tag is the language tag of its text ('ru'), and
//                how a cities.js names it; where: the countries it is seen in, as said with an answer; at: that
//                country on the world map (data/maps/world/world.js), for the script's Countries page; label: one short
//                name for a switch (left out: where). like: '<tag>' for a country that writes as another one
//                does (Montenegro, as Serbia): it has that language's letters and words, but: { word: its own
//                word, or '' for none } where they differ.
//     letters    the base language's letters, in groups that are each a round:
//                { title, block, type, plain, rows: [[forms, sound, typed, note]…] }
//       forms    the letter as written, capital and small where it has both ('Ж ж'); the first form names it
//       sound    how it is spelled where names are written in Latin letters (on the map): the tile to click.
//                Letters spelled alike share a tile.
//       typed    the spellings a typed name may use for it, the usual one first ('zh z j'; '-': nothing is
//                written for it, so '- y': nothing, or y). Left out: the sound. Of a letter that carries a vowel
//                (क 'ka'), only the consonant.
//       note     said with the answer
//       block    the part of the board its tiles are in ('Consonants'); one board without it
//       type     in a script whose consonants carry a vowel: 'c' such a consonant, 'v' a vowel letter, 'm' a vowel
//                mark (asked on a dotted circle), 's' another sign, 'j' joined letters (spelled like a consonant),
//                'p' a consonant's attached form, 'd' a digit. '्' and '্' take the vowel off the consonant before.
//       plain    always set in the first typeface (marks on a dotted circle, which few typefaces draw well)
//     own        what another language adds to those letters or reads another way:
//                { <tag>: { rows: [[forms, sound, typed, note]…], not: 'letters it does not have', together } }.
//                Its rows are a round named after its countries; a row two languages share is one question.
//     inherent   the vowel a consonant carries, as it may be typed ('a', 'a o'); it may always be left out
//     carrier    the consonant a mark is said on, when it is said aloud
//     mixes      more rounds of base letters: [[label, 'letters by their first form']…]
//     together   letters that are spelled another way together: [[letters, typed]…] ('ий': 'iy y i')
//     words      the words of signs, a row per meaning with every language's word for it:
//                { themes: [{ title, short, tag, rows: [[meaning, word…]…] }], mixes: [[label, [theme titles]]…], one }
//                A row's words stand in the order of `langs` (without those that are `like` another), '' where
//                a language has none here; 'word|reading'
//                gives the reading where the letters don't (scripts whose consonants carry a vowel). A word two
//                languages share is one question. short: the theme's words are abbreviations, and what each is
//                short for (the same meaning's word in another theme) is said with the answer. tag: the language
//                a theme's words are said aloud in, where a theme is a language and the columns are areas
//                (Latin, made from the world quiz's words by tools/builds/languages). one: true puts the tiles of
//                every theme on one board; without it each theme has a part of the board to itself.
//
//   READING.words()                 the words of the table as questions, in the order of their themes:
//                                   [{ id, word, meaning, themes, langs, notes, t }]. A word is one question whatever
//                                   the number of languages that have it; notes: its readings, or what an
//                                   abbreviation is short for.
//   READING.face(text, plain)       the classes of a typeface for a question
//   READING.of(tag)                 a language's reading: { latin(text), accepts(text, typed, names) }
//     latin      its usual spelling in Latin letters, letter by letter (alphabets)
//     accepts    whether `typed` is a way to write `text` in Latin letters: one of `names` (the name on the
//                map: Moscow), or any spelling the letters allow (Moskva). Capitals, accents, spaces and hyphens
//                don't count.
//     writes     whether the table has every letter of `text`
//   READING.name(text, tag)         how a place name is read, in the scripts the page loaded: { tag, script, face(),
//                                   latin(), accepts(typed, names) } (face: a typeface's classes, anew each time), or
//                                   null where none of them writes it. Its language: `tag` where a script has it and
//                                   the name is written in that script; else one of the same language ('zh-Hant-TW':
//                                   zh-TW, 'ms-Arab': ms), its region's first; else the script's own base language
//                                   (Konkani: Hindi's letters); of several, the first whose letters write the name.

const READING = (() => {
  const VIRAMA = new Set(['्', '্']);
  const BEYOND = /[Ғ-ӿ]/; // Cyrillic letters outside the basic set, which fewer typefaces have
  const list = s => s.split(' ').map(x => (x === '-' ? '' : x));
  const plainText = s => s.toLowerCase().replace(/đ/g, 'dj').normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]/g, '');
  const key = s => s.normalize('NFC').toLowerCase(); // (one way to write a dotted letter: ड़ as ड and its dot)

  // One script's reading.
  const script = S => {
    const BASE = Object.keys(S.langs)[0], inScript = new RegExp(`\\p{Script=${S.unicode}}`, 'u');
    const face = (text, plain) => `s-${S.script} f${plain ? 0 : Math.random() * (BEYOND.test(text) ? S.wide ?? S.faces : S.faces || 1) | 0}`;
    const INHERENT = S.inherent ? `(?:${S.inherent.split(' ').join('|')})?` : '';

    function reading(tag) {
      const own = (tag !== BASE && (S.own || {})[S.langs[tag].like || tag]) || {};
      // Every letter (each of its forms) with the spellings it may have and what it is in its script.
      const SPELL = new Map(), gone = new Set((own.not || '').split(' ').filter(Boolean).map(key));
      const add = (forms, sound, typed, type) => {
        const as = typed ? list(typed) : [type === 'c' || type === 'j' ? sound.replace(/a$/, '') : sound];
        for (const f of forms.split(' ')) SPELL.set(key(f), { as, type: VIRAMA.has(f) ? 'virama' : type || '' });
      };
      for (const g of S.letters) for (const [forms, sound, typed] of g.rows) if (!forms.split(' ').some(f => gone.has(key(f)))) add(forms, sound, typed, g.type);
      for (const [forms, sound, typed] of own.rows || []) add(forms, sound, typed, '');
      for (const [letters, typed] of own.together || S.together || []) SPELL.set(key(letters), { as: list(typed), type: '' });
      const LONGEST = Math.max(0, ...[...SPELL.keys()].map(k => k.length));

      // The text as the letters it is written with, longest first; null where one of them is not in the table.
      function parts(text) {
        const out = [], s = key(text);
        for (let i = 0; i < s.length;) {
          let n = Math.min(LONGEST, s.length - i);
          while (n && !SPELL.has(s.substr(i, n))) n--;
          if (n) { out.push(SPELL.get(s.substr(i, n))); i += n; continue; }
          const c = s[i++];
          if (VIRAMA.has(c)) out.push({ as: [''], type: 'virama' });
          else if (/[a-z0-9]/.test(c)) out.push({ as: [c], type: '' });
          else if (/[\p{L}\p{M}]/u.test(c)) return null;
          else out.push({ as: [''], type: '', lit: c }); // a space, a hyphen, a full stop: kept when spelled out, never typed
        }
        return out;
      }
      const latin = text => (parts(text) || []).map(p => p.lit ?? p.as[0]).join('');
      const patterns = new Map();
      function pattern(text) {
        if (patterns.has(text)) return patterns.get(text);
        const list = parts(text);
        let re = null;
        if (list) {
          let src = '', carries = false; // carries: the consonant before still has its vowel
          for (const p of list) {
            if (carries && !['m', 'p', 'virama'].includes(p.type)) src += INHERENT;
            carries = p.type === 'c' || p.type === 'j' || p.type === 'p';
            const some = [...new Set(p.as.map(plainText).filter(Boolean))]; // (typed text has lost its accents: ž is z)
            if (some.length) src += `(?:${some.join('|')})${p.as.includes('') ? '?' : ''}`;
          }
          re = new RegExp(`^${src}${carries ? INHERENT : ''}$`);
        }
        patterns.set(text, re);
        return re;
      }
      function accepts(text, typed, names = []) {
        const t = plainText(typed);
        if (!t) return false;
        if (names.some(n => plainText(n) === t)) return true;
        const re = pattern(text);
        return !!re && re.test(t);
      }
      return { latin, accepts, writes: text => !!parts(text) };
    }
    const made = {}, of = tag => (made[tag] ||= reading(tag));

    let asked = null;
    function words() {
      if (asked) return asked;
      const TAGS = Object.keys(S.langs), COLS = TAGS.filter(t => !S.langs[t].like), full = {}, byId = {};
      // A row as [language, word, reading] for every language that has a word in it: a language that is `like`
      // another has that one's, but for its own.
      const inRow = cells => TAGS.flatMap(tag => {
        const L = S.langs[tag], [word, reading] = (cells[COLS.indexOf(L.like || tag)] || '').split('|'), mine = L.but && word in L.but ? L.but[word] : word;
        return mine ? [[tag, mine.normalize('NFC'), mine === word ? reading : undefined]] : [];
      });
      for (const t of S.words.themes) if (!t.short) for (const [meaning, ...cells] of t.rows) for (const [tag, word] of inRow(cells)) (full[tag] ||= {})[meaning] ||= word;
      asked = [];
      for (const t of S.words.themes) for (const [meaning, ...cells] of t.rows) for (const [tag, word, reading] of inRow(cells)) {
        const id = `${t.tag ? `${t.tag}/` : ''}${meaning}:${word}`; // (a theme that is a language keeps its words to itself: Skola is Swedish, and Latvian)
        if (!byId[id]) asked.push(byId[id] = { id, word, meaning, themes: [], langs: [], notes: [] });
        // (what is said with it: what an abbreviation is short for, else its reading, spelled out where the script has letters to learn)
        const w = byId[id], note = t.short ? full[tag][meaning] : reading || (S.letters.length ? of(tag).latin(word) : '');
        if (t.tag) w.t ||= t.tag;
        if (!w.themes.includes(t.title)) w.themes.push(t.title);
        if (!w.langs.includes(tag)) w.langs.push(tag);
        if (note && !w.notes.includes(note)) w.notes.push(note);
      }
      return asked;
    }
    return { S, BASE, inScript, face, of, words };
  };

  // The page's scripts: every one it loaded, the last of them being its own (SCRIPT).
  const MAIN = script(SCRIPT), ALL = [...new Set(typeof ALL_SCRIPTS === 'object' ? ALL_SCRIPTS : [])].map(S => (S === SCRIPT ? MAIN : script(S)));
  if (!ALL.includes(MAIN)) ALL.push(MAIN);
  const sub = t => String(t || '').split('-')[0], region = t => String(t || '').split('-').slice(1).find(p => /^[A-Z]{2}$/.test(p));
  function name(text, tag) {
    if (!text) return null;
    const mine = ALL.filter(X => X.inScript.test(text)); // the scripts it is written in
    const same = mine.flatMap(X => Object.keys(X.S.langs).filter(t => t === tag || sub(t) === sub(tag)).map(t => [X, t]))
      .sort((a, b) => (b[1] === tag) - (a[1] === tag) || (region(b[1]) === region(tag)) - (region(a[1]) === region(tag)));
    const tries = same.length ? same : mine.map(X => [X, X.BASE]);
    const [X, t] = (same.length && same[0][1] === tag ? same[0] : tries.find(([Y, u]) => Y.of(u).writes(text)) || tries[0]) || [];
    if (!X) return null;
    const r = X.of(t);
    return { tag: t, script: X.S.script, face: () => X.face(text), latin: () => r.latin(text), accepts: (typed, names) => r.accepts(text, typed, names) };
  }
  return { face: MAIN.face, of: MAIN.of, words: MAIN.words, name };
})();
