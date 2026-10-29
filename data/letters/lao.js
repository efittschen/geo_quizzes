// Lao: its letters, for the script quizzes (../shared/reading.js says how this is written). The country is Laos.
// Sounds are spelled as Lao names are on Laos's signs and maps, in its own romanization, which follows French
// spelling: ຊ x (Xam Neua, Muang Xay), ຍ gn (Gnommalat), ຸ and ູ ou (Boun, Phou), ໄ and ໃ ai or ay (Kaysone), ຽ ia or ie
// (Viang, Vieng), ເ◌ືອ eua or ua (Neua, Muang), ◌ົວ oua (Houa), ວ v (Vang Vieng), and a last ນ at times ne (Kaysone
// Phomvihane). Older names keep their older forms (Vientiane, Luang Prabang, Sayaboury). No tones and no long vowels
// are written; ຫ is silent before ງ ຍ ນ ມ ລ ວ, and ໜ ໝ ຫຼ are n, m, l. A consonant is high, mid or low class, which
// with its tone mark gives the syllable's tone (not written in Latin letters). Lao writes every vowel: some before
// their consonant (ເ ແ ໂ ໄ ໃ), read after it, often with a part after it as well (ເ◌ືອ eua: ເໜືອ Neua).
// The letters are in the order of how often they occur in 5,275 Lao place names (OpenStreetMap places in Laos,
// OCHA COD-AB provinces and districts, ../laos-cities, Wikidata), a first word ບ້ານ, ເມືອງ, ແຂວງ or ນະຄອນ left out:
// most frequent first, in rounds of up to 9, consonants and vowels in turn.
// (Made by tools/cache/builds/scripts-zh-lo/scripts/make-lo.mjs: run it again rather than edit by hand.)
// No words of signs yet.
var SCRIPT = {
  name: 'Lao', script: 'laoo', unicode: 'Lao', faces: 3, carrier: 'ອ',
  langs: { lo: { name: 'Lao', where: 'Laos', at: 'LAO' } },
  letters: [
    { title: 'ນ ງ ວ ອ ຫ ກ ດ ມ', block: 'Consonants', type: 'c', rows: [
      ['ນ', 'n', 'n ne', 'low class · at the end also ne'], ['ງ', 'ng', '', 'low class'], ['ວ', 'v', 'v w o ou oua ua u', 'low class · at the end: o · before the last letter: oua'], ['ອ', 'o', 'o -', 'mid class · silent before a vowel'], ['ຫ', 'h', 'h -', 'high class · silent before ງ ຍ ນ ມ ລ ວ'], ['ກ', 'k', 'k g', 'mid class'], ['ດ', 'd', 'd t', 'mid class · at the end: t'], ['ມ', 'm', '', 'low class'],
    ] },
    { title: 'າ ◌ົ ະ ◌ັ ◌ີ ຳ ◌ູ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['າ', 'a', 'a', 'long a'], ['ົ', 'o', 'o', 'short o, before the last letter'], ['ະ', 'a', 'a', 'short a'], ['ັ', 'a', 'a', 'short a, before the last letter'], ['ີ', 'i', 'i y', 'long i'], ['ຳ', 'am'], ['ູ', 'ou', 'ou u', 'long'],
    ] },
    { title: 'ສ ຍ ລ ພ ບ ຊ ຄ ປ', block: 'Consonants', type: 'c', rows: [
      ['ສ', 's', 's x', 'high class'], ['ຍ', 'gn', 'gn ny y i', 'low class · at the end: y'], ['ລ', 'l', 'l r', 'low class'], ['ພ', 'ph', 'ph p', 'low class'], ['ບ', 'b', 'b p', 'mid class · at the end: p'], ['ຊ', 'x', 'x s', 'low class'], ['ຄ', 'kh', 'kh k', 'low class'], ['ປ', 'p', '', 'mid class'],
    ] },
    { title: 'ເ ແ ໂ ໄ ໃ', block: 'Vowels', type: 'v', rows: [
      ['ເ', 'e', 'e', 'written before its letter'], ['ແ', 'e', 'e ae', 'written before its letter'], ['ໂ', 'o', 'o', 'written before its letter'], ['ໄ', 'ai', 'ai ay', 'written before its letter'], ['ໃ', 'ai', 'ai ay', 'written before its letter'],
    ] },
    { title: '◌້ ◌່ ◌ຼ ◌໋ ◌໌ ໆ ◌໊ ຯ', block: 'Signs', type: 's', plain: true, rows: [
      ['້', 'tone', '-', 'mai tho, a tone mark: not written'], ['່', 'tone', '-', 'mai ek, a tone mark: not written'], ['ຼ', 'l', 'l', 'ລ under a letter: ຫຼ l'], ['໋', 'tone', '-', 'mai catawa, a tone mark: not written'], ['໌', 'silent', '-', 'the letter under it is not spoken'], ['ໆ', 'again', '-', 'the word before it twice'], ['໊', 'tone', '-', 'mai ti, a tone mark: not written'], ['ຯ', 'abbr.', '-', 'a longer name cut short'],
    ] },
    { title: '◌ອ ◌ວ◌ ເ◌ືອ ◌ົວ ເ◌ີ ເ◌ົາ ເ◌ັ', block: 'Vowels', type: 'v', plain: true, rows: [
      ['◌ອ', 'o', 'o', 'long o, after its letter'], ['◌ວ◌', 'oua', 'oua ua uo', 'before the last letter'], ['ເ◌ືອ', 'ua', 'ua eua uea oua'], ['◌ົວ', 'oua', 'oua ua'], ['ເ◌ີ', 'eu', 'eu oe er', 'long'], ['ເ◌ົາ', 'ao', 'ao au'], ['ເ◌ັ', 'e', 'e', 'short e, before the last letter'],
    ] },
    { title: 'ທ ຕ ຈ ຮ ຂ ຜ ຖ ໜ', block: 'Consonants', type: 'c', rows: [
      ['ທ', 'th', 'th t', 'low class'], ['ຕ', 't', '', 'mid class'], ['ຈ', 'ch', 'ch j', 'mid class'], ['ຮ', 'h', '', 'low class'], ['ຂ', 'kh', 'kh k', 'high class'], ['ຜ', 'ph', 'ph p', 'high class'], ['ຖ', 'th', 'th t', 'high class'], ['ໜ', 'n', 'n hn', 'high class · ຫ and ນ in one'],
    ] },
    { title: 'ຢ ຣ ໝ ຟ ຝ', block: 'Consonants', type: 'c', rows: [
      ['ຢ', 'y', '', 'mid class'], ['ຣ', 'r', 'r l', 'low class'], ['ໝ', 'm', 'm hm', 'high class · ຫ and ມ in one'], ['ຟ', 'f', '', 'low class'], ['ຝ', 'f', '', 'high class'],
    ] },
    { title: '◌ຸ ຽ ◌ື ◌ໍ ◌ິ ◌ຶ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ຸ', 'ou', 'ou u', 'short'], ['ຽ', 'ia', 'ia ie', 'before the last letter'], ['ື', 'u', 'u eu ue', 'long'], ['ໍ', 'o', 'o', 'long o, above its letter: ບໍ່ bo'], ['ິ', 'i', 'i', 'short i'], ['ຶ', 'u', 'u eu ue', 'short'],
    ] },
    { title: 'ເ◌ິ ເ◌ຍ ແ◌ະ ເ◌ີຍ ເ◌າະ ເ◌ະ ໂ◌ະ', block: 'Vowels', type: 'v', plain: true, rows: [
      ['ເ◌ິ', 'eu', 'eu oe', 'short'], ['ເ◌ຍ', 'ia', 'ia ie'], ['ແ◌ະ', 'e', 'e ae', 'short'], ['ເ◌ີຍ', 'euy', 'euy oey oei'], ['ເ◌າະ', 'o', 'o oh', 'short o'], ['ເ◌ະ', 'e', 'e', 'short e'], ['ໂ◌ະ', 'o', 'o', 'short o'],
    ] },
    { title: '໐ ໑ ໒ ໓ ໔', block: 'Digits', type: 'd', rows: [
      ['໐', '0'], ['໑', '1'], ['໒', '2'], ['໓', '3'], ['໔', '4'],
    ] },
    { title: '໕ ໖ ໗ ໘ ໙', block: 'Digits', type: 'd', rows: [
      ['໕', '5'], ['໖', '6'], ['໗', '7'], ['໘', '8'], ['໙', '9'],
    ] },
  ],
  mixes: [
    ['Digits', '໐ ໑ ໒ ໓ ໔ ໕ ໖ ໗ ໘ ໙'],
    ['Vowels', 'າ ◌ອ ົ ະ ເ ັ ີ ແ ໂ ◌ວ◌ ຳ ູ ໄ ຸ ຽ ື ໃ ໍ ິ ເ◌ືອ ◌ົວ ເ◌ີ ເ◌ົາ ເ◌ັ ຶ ເ◌ິ ເ◌ຍ ແ◌ະ ເ◌ີຍ ເ◌າະ ເ◌ະ ໂ◌ະ'],
    ['Lookalikes', 'ບ ປ ຜ ຝ ພ ຟ ດ ຕ ອ ທ ຖ ສ ຊ ຍ ຢ ຂ ຄ ຮ ຣ ນ ມ ຈ ວ ໜ ໝ'],
    ['Consonants', 'ນ ງ ວ ອ ຫ ກ ດ ມ ສ ຍ ລ ພ ບ ຊ ຄ ປ ທ ຕ ຈ ຮ ຂ ຜ ຖ ໜ ຢ ຣ ໝ ຟ ຝ'],
  ],
  words: { themes: [] },
};

// Letters that are spelled another way together (reading.js: SCRIPT.together). A vowel written before its consonant
// is read after it: each such start of a syllable is one entry, the vowel (ເ ແ ໂ ໄ ໃ), the consonant it stands
// before, or ຫ with the one it makes high (ຫນ n: ຫ is silent there), a tone mark where there is one, and the vowel's
// part after the consonant (ເ◌ືອ eua). Then ◌ົວ with a tone mark inside, and ◌ົວ itself (oua), and ຳ written as its
// two parts (ໍາ).
{
  const TONES = ['', '່', '້', '໊', '໋'], cross = (a, b) => a.flatMap(x => b.map(y => x + y)), START = {};
  // a consonant's spellings at the start of a syllable
  'ກ k g|ຂ kh k|ຄ kh k|ງ ng|ຈ ch j|ສ s x|ຊ x s|ຍ gn ny y|ດ d|ຕ t|ຖ th t|ທ th t|ນ n|ບ b|ປ p|ຜ ph p|ຝ f|ພ ph p|ຟ f|ມ m|ຢ y|ຣ r l|ລ l r|ວ v w|ຫ h|ອ|ຮ h|ໜ n hn|ໝ m hm'
    .split('|').forEach(s => { const [c, ...as] = s.split(' '); START[c] = as.length ? as : ['']; });
  const starts = Object.keys(START).map(c => [c, START[c]]);
  for (const b of 'ງຍນມລວ') starts.push([`ຫ${b}`, START[b]]);
  starts.push(['ຫຼ', ['l']]);
  // the vowels: [before, over the consonant, after it, spellings]
  const VOWELS = [
    ['ເ', '', '', 'e'], ['ເ', '', 'ະ', 'e'], ['ເ', 'ັ', '', 'e'], ['ເ', 'ົ', 'າ', 'ao au'], ['ເ', '', 'າະ', 'o oh'],
    ['ເ', 'ີ', '', 'eu oe er'], ['ເ', 'ິ', '', 'eu oe'], ['ເ', '', 'ຍ', 'ia ie'], ['ເ', 'ັ', 'ຍ', 'ia ie'], ['ເ', 'ີ', 'ຍ', 'euy oey oei'],
    ['ເ', 'ື', 'ອ', 'ua eua uea oua'], ['ເ', 'ຶ', 'ອ', 'ua eua'], ['ແ', '', '', 'e ae'], ['ແ', '', 'ະ', 'e ae'], ['ແ', 'ັ', '', 'e ae'],
    ['ໂ', '', '', 'o'], ['ໂ', '', 'ະ', 'o'], ['ໄ', '', '', 'ai ay'], ['ໃ', '', '', 'ai ay'],
  ];
  const T = SCRIPT.together = [], uniq = a => [...new Set(a)].join(' ');
  for (const [before, over, after, spell] of VOWELS) for (const [letters, as] of starts) {
    for (const tone of TONES) T.push([before + letters + over + tone + after, uniq(cross(as, spell.split(' ')))]);
  }
  for (const tone of TONES) T.push([`ົ${tone}ວ`, 'oua ua'], [`ໍ${tone}າ`, 'am']); // (ໍາ: ຳ written as its two parts)
}
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ນ":["ປາກຊັນ","Pakxan"],"ງ":["ວັງວຽງ","Vang Vieng"],"ວ":["ວຽງໄຊ","Viengxay"],"ອ":["ເຊກອງ","Sekong"],"ຫ":["ຫ້ວຍຊາຍ","Houayxay"],"ກ":["ທ່າແຂກ","Thakhek"],"ດ":["ດັກຈຶງ","Dak Cheung"],"າ":["ທ່າແຂກ","Thakhek"],"ົ":["ຜົ້ງສາລີ","Phongsali"],"ະ":["ໄຊຍະບູລີ","Sainyabuli"],"ັ":["ວັງວຽງ","Vang Vieng"],"ີ":["ຊຽງເງີນ","Xiang-Ngeun"],"ຳ":["ຊຳ ເໜືອ","Xam Nua"],"ູ":["ໄຊຍະບູລີ","Sainyabuli"],"ສ":["ສາລະວັນ","Salavan"],"ຍ":["ໄຊຍະບູລີ","Sainyabuli"],"ລ":["ຜົ້ງສາລີ","Phongsali"],"ພ":["ໂພນທອງ","Phonthong"],"ບ":["ໄຊຍະບູລີ","Sainyabuli"],"ຊ":["ຊຳ ເໜືອ","Xam Nua"],"ປ":["ປາກເຊ","Pakse"],"ເ":["ປາກເຊ","Pakse"],"ແ":["ທ່າແຂກ","Thakhek"],"ໂ":["ໂພນທອງ","Phonthong"],"ໄ":["ວຽງໄຊ","Viangxai"],"ໃ":["ຊຳໃຕ້","Xamtay"],"້":["ຜົ້ງສາລີ","Phongsali"],"່":["ປາກຊ່ອງ","Pakxong"],"ຼ":["ຫຼວງນໍ້າທາ","Luang Namtha"],"ທ":["ທ່າແຂກ","Thakhek"],"ຕ":["ອັດຕະປື","Attapeu"],"ຈ":["ດັກຈຶງ","Dak Cheung"],"ຂ":["ຂວາ","Khoa"],"ຜ":["ຜົ້ງສາລີ","Phongsali"],"ໜ":["ຊຳ ເໜືອ","Xam Nua"],"ຽ":["ວັງວຽງ","Vang Vieng"],"ື":["ຊຳ ເໜືອ","Xam Nua"],"ໍ":["ຫຼວງນໍ້າທາ","Luang Namtha"],"ິ":["ປາກກະດິງ","Pakkading"],"ຶ":["ດັກຈຶງ","Dak Cheung"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
