// Gurmukhi: the letters of Punjabi, for the script quizzes (../shared/reading.js says how this is written). It is
// written in Punjab (India), whose road signs carry each name in Punjabi, Hindi and English.
// Sounds are spelled as names are on Indian signs and maps (the Hunterian system, without marks): long and short
// vowels alike (ਆ is a, ਈ i), the hard letters like the soft ones (ਟ and ਤ both t, ਡ and ਦ both d, ਣ n), ਵ mostly w
// (ਫਗਵਾੜਾ Phagwara), ੜ r (and ੜ੍ਹ rh: -ਗੜ੍ਹ -garh). ਘ ਝ ਢ ਧ ਭ are spoken with a tone, and spelled gh jh dh dh bh. A
// consonant carries an a, which a vowel mark replaces; at the end of a name it is not spoken (ਜਲੰਧਰ Jalandhar; a final a
// is written ਾ: ਪਟਿਆਲਾ Patiala), and often inside one too (ਮੁਕਤਸਰ Muktsar, ਤਰਨ Tarn). ਂ and ੰ make a vowel nasal or stand for n or m; ੱ doubles the letter after it (ਪੱਟੀ Patti). Five
// dotted letters are the sounds of Persian words (ਸ਼ sh, ਖ਼ kh, ਗ਼ gh, ਜ਼ z, ਫ਼ f); ਲ਼ is Punjabi's own hard l. ਹਿ after a
// consonant without a vowel mark is spoken and spelled eh (ਫ਼ਤਹਿਗੜ੍ਹ Fatehgarh, ਲਹਿਰਾਗਾਗਾ Lehragaga), ਹੁ there oh;
// ਹੁਸ਼ਿਆਰਪੁਰ is Hoshiarpur on the map, from its Urdu name. Common endings and their spellings: -ਵਾਲ -wal,
// -ਪੁਰ -pur, -ਪੁਰਾ -pura, -ਕੋਟ -kot, -ਸਰ -sar, -ਗੜ੍ਹ -garh, -ਵਾਲਾ and -ਵਾਲੀ -wala, -wali, -ਕੇ -ke, -ਮਾਜਰਾ -majra,
// -ਆਂ -an or -ian (ਕਾਦੀਆਂ Qadian), and ਕਲਾਂ Kalan and ਖੁਰਦ Khurd after a name (the larger and the smaller village).
// Letters come in the order of how often they are written in Punjab's place names (Wikidata labels and OpenStreetMap
// names in Punjabi), the most frequent first. Digits are not taught: signs write 0–9. Words of signs are not in the
// table yet.
var SCRIPT = {
  name: 'Gurmukhi', script: 'guru', unicode: 'Gurmukhi', faces: 4, inherent: 'a', carrier: 'ਕ',
  langs: { pa: { name: 'Punjabi', where: 'Punjab', at: 'IND' } },
  letters: [
    { title: 'ਰ ਲ ਕ ਸ ਮ ਪ ਵ ਹ', block: 'Consonants', type: 'c', rows: [
      ['ਰ', 'ra', 'r'], ['ਲ', 'la', 'l'], ['ਕ', 'ka', 'k c q'], ['ਸ', 'sa', 's sh'], ['ਮ', 'ma', 'm'], ['ਪ', 'pa', 'p'], ['ਵ', 'wa', 'w v', 'or va'], ['ਹ', 'ha', 'h'],
    ] },
    { title: 'ਾ ੀ ੁ ੋ ਿ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ਾ', 'a', 'a aa', 'long a'], ['ੀ', 'i', 'i ee', 'long i'], ['ੁ', 'u'], ['ੋ', 'o'], ['ਿ', 'i', 'i', 'written before its letter'],
    ] },
    { title: 'ਂ ੰ ੱ', block: 'Signs', type: 's', plain: true, rows: [
      ['ਂ', 'n, m', 'n m -', 'nasal: n or m'], ['ੰ', 'n, m', 'n m -', 'nasal: n or m; doubles a ਨ or ਮ after it'],
      ['ੱ', 'double', '- k kh g gh ch c j t th d dh n p ph b bh m r l s w', 'doubles the letter after it'],
    ] },
    { title: 'ਦ ਬ ਗ ਨ ਜ ਖ ੜ ਤ ਡ', block: 'Consonants', type: 'c', rows: [
      ['ਦ', 'da', 'd'], ['ਬ', 'ba', 'b'], ['ਗ', 'ga', 'g'], ['ਨ', 'na', 'n'], ['ਜ', 'ja', 'j z'], ['ਖ', 'kha', 'kh k'], ['ੜ', 'ra', 'r rh d', 'flapped r'],
      ['ਤ', 'ta', 't'], ['ਡ', 'da', 'd', 'hard d'],
    ] },
    { title: 'ੇ ੂ ੌ ੈ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ੇ', 'e', 'e ay'], ['ੂ', 'u', 'u oo', 'long u'], ['ੌ', 'au', 'au ou o'], ['ੈ', 'ai', 'ai ei e'],
    ] },
    { title: 'ਆ ਅ ਈ ਉ ਇ', block: 'Vowels', type: 'v', rows: [
      ['ਆ', 'a', 'a aa', 'long a'], ['ਅ', 'a'], ['ਈ', 'i', 'i ee', 'long i'], ['ਉ', 'u'], ['ਇ', 'i'],
    ] },
    { title: 'ਣ ਚ ਟ ਭ ਧ ਘ ਫ ਢ ਠ', block: 'Consonants', type: 'c', rows: [
      ['ਣ', 'na', 'n', 'hard n'], ['ਚ', 'cha', 'ch c'], ['ਟ', 'ta', 't', 'hard t'], ['ਭ', 'bha', 'bh b'], ['ਧ', 'dha', 'dh d'], ['ਘ', 'gha', 'gh g'],
      ['ਫ', 'pha', 'ph f'], ['ਢ', 'dha', 'dh d', 'hard dh'], ['ਠ', 'tha', 'th', 'hard th'],
    ] },
    { title: 'Dotted letters', block: 'Consonants', type: 'c', rows: [
      ['ਸ਼', 'sha', 'sh s'], ['ਖ਼', 'kha', 'kh k'], ['ਜ਼', 'za', 'z j'], ['ਫ਼', 'fa', 'f ph'], ['ਗ਼', 'gha', 'gh g'], ['ਲ਼', 'la', 'l', 'hard l'],
    ] },
    { title: 'Attached letters', block: 'Joined', type: 'p', plain: true, rows: [
      ['੍ਹ', 'ha', 'h -', 'written under its letter: ੜ੍ਹ rh'], ['੍ਰ', 'ra', 'r', 'written under its letter'], ['੍ਵ', 'va', 'v w', 'written under its letter'],
    ] },
    { title: 'ਏ ਊ ਓ ਔ ਐ', block: 'Vowels', type: 'v', rows: [
      ['ਏ', 'e', 'e ay'], ['ਊ', 'u', 'u oo', 'long u'], ['ਓ', 'o'], ['ਔ', 'au', 'au ou o'], ['ਐ', 'ai', 'ai ei e'],
    ] },
    { title: 'ਥ ਝ ਛ ਯ ਙ ਞ', block: 'Consonants', type: 'c', rows: [
      ['ਥ', 'tha', 'th'], ['ਝ', 'jha', 'jh j'], ['ਛ', 'chha', 'chh ch'], ['ਯ', 'ya', 'y'], ['ਙ', 'nga', 'ng n'], ['ਞ', 'nya', 'ny n'],
    ] },
  ],
  together: [['ਹਿ', 'hi eh he h ah ha'], ['ਹੁ', 'hu ho oh h']],
  mixes: [
    ['Vowels and vowel marks', 'ਅ ਆ ਇ ਈ ਉ ਊ ਏ ਐ ਓ ਔ ਾ ਿ ੀ ੁ ੂ ੇ ੈ ੋ ੌ'],
    ['Lookalikes', 'ਸ ਮ ਪ ਘ ਖ ਯ ਬ ਥ ਭ ਤ ਚ ਢ ਫ ਦ ਵ ਡ ੜ ਙ ਨ ਠ ਹ ਰ'],
    ['Consonants', 'ਰ ਲ ਕ ਸ ਮ ਪ ਵ ਹ ਦ ਬ ਗ ਨ ਜ ਖ ੜ ਤ ਡ ਣ ਚ ਟ ਭ ਧ ਘ ਫ ਢ ਠ ਥ ਝ ਛ ਯ ਙ ਞ'],
  ],
  // The words of signs: none yet.
  words: { themes: [], mixes: [] },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ਰ":["ਤਰਨ ਤਾਰਨ ਸਾਹਿਬ","Tarn Taran Sahib"],"ਲ":["ਰਾਮਪੁਰਾ ਫੂਲ","Rampura Phul"],"ਕ":["ਜ਼ੀਰਕਪੁਰ","Zirakpur"],"ਸ":["ਸੰਗਰੂਰ","Sangrur"],"ਮ":["ਮਾਨਸਾ","Mansa"],"ਪ":["ਰਾਜਪੁਰਾ","Rajpura"],"ਵ":["ਨਵਾਂਸ਼ਹਿਰ","Nawanshahr"],"ਹ":["ਮੋਹਾਲੀ","Mohali"],"ਾ":["ਸਮਾਣਾ","Samana"],"ੀ":["ਪੱਟੀ","Patti"],"ੁ":["ਸੁਨਾਮ","Sunam"],"ੋ":["ਨਕੋਦਰ","Nakodar"],"ਿ":["ਫ਼ਾਜ਼ਿਲਕਾ","Fazilka"],"ਂ":["ਮੁਕੇਰੀਆਂ","Mukerian"],"ੰ":["ਨੰਗਲ","Nangal"],"ੱ":["ਗਿੱਦੜਬਾਹਾ","Giddarbaha"],"ਦ":["ਗੁਰਦਾਸਪੁਰ","Gurdaspur"],"ਬ":["ਬਟਾਲਾ","Batala"],"ਗ":["ਮੋਗਾ","Moga"],"ਨ":["ਬਰਨਾਲਾ","Barnala"],"ਜ":["ਜਲੰਧਰ","Jalandhar"],"ਖ":["ਖੰਨਾ","Khanna"],"ੜ":["ਖਰੜ","Kharar"],"ਤ":["ਸ੍ਰੀ ਮੁਕਤਸਰ ਸਾਹਿਬ","Sri Muktsar Sahib"],"ਡ":["ਜੰਡਿਆਲਾ ਗੁਰੂ","Jandiala Guru"],"ੇ":["ਮਾਲੇਰਕੋਟਲਾ","Malerkotla"],"ੂ":["ਕੋਟ ਕਪੂਰਾ","Kotkapura"],"ੌ":["ਮੌੜ ਮੰਡੀ","Maur Mandi"],"ਆ":["ਪਟਿਆਲਾ","Patiala"],"ਅ":["ਅਬੋਹਰ","Abohar"],"ਈ":["ਤਲਵੰਡੀ ਭਾਈ","Talwandi Bhai"],"ਣ":["ਲੁਧਿਆਣਾ","Ludhiana"],"ਚ":["ਬਲਾਚੌਰ","Balachaur"],"ਟ":["ਪਠਾਨਕੋਟ","Pathankot"],"ਭ":["ਨਾਭਾ","Nabha"],"ਧ":["ਧੂਰੀ","Dhuri"],"ਘ":["ਬਾਘਾ ਪੁਰਾਣਾ","Bagha Purana"],"ਫ":["ਫਗਵਾੜਾ","Phagwara"],"ਢ":["ਬੁਢਲਾਡਾ","Budhlada"],"ਠ":["ਬਠਿੰਡਾ","Bathinda"],"ਸ਼":["ਹੁਸ਼ਿਆਰਪੁਰ","Hoshiarpur"],"ਜ਼":["ਫਿਰੋਜ਼ਪੁਰ","Firozpur"],"ਫ਼":["ਫ਼ਰੀਦਕੋਟ","Faridkot"],"੍ਹ":["ਗੋਬਿੰਦਗੜ੍ਹ","Gobindgarh"],"੍ਰ":["ਅੰਮ੍ਰਿਤਸਰ","Amritsar"],"ਥ":["ਕਪੂਰਥਲਾ","Kapurthala"],"ਛ":["ਮਾਛੀਵਾੜਾ","Machhiwara"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
