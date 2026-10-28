// Hangul (Korean): its letters, for the script quizzes (../shared/reading.js says how this is written). The country is
// South Korea. Sounds are spelled as Korean names are on the map and the signs, in the Revised Romanization of Korean
// (2000): ㅓ eo, ㅡ eu, ㄱ ㄷ ㅂ ㅈ g d b j at the start of a syllable, k t p t at its end. Letters are written in
// blocks, a syllable each: a consonant (ㅇ, silent, where it starts with a vowel), a vowel beside or under it, and
// maybe a consonant under them (한 = ㅎ ㅏ ㄴ, han). A consonant at the end of a block is read as it sounds there
// (ㅅ ㅈ ㅊ ㅌ ㅎ t), and before the next block it may change (강릉 Gangneung, 칠원 Chirwon): such spellings count
// too, as do the older ones without marks (Pusan, Kwangju, Chonju: McCune-Reischauer).
// No words of signs yet.
var SCRIPT = {
  name: 'Hangul', script: 'hang', unicode: 'Hangul', faces: 3,
  langs: { ko: { name: 'Korean', where: 'South Korea', at: 'KOR' } },
  letters: [
    { title: 'ㄱ ㄴ ㄷ ㄹ ㅁ', block: 'Consonants', rows: [
      ['ㄱ', 'g', 'g k', 'at the end of a block: k'], ['ㄴ', 'n'], ['ㄷ', 'd', 'd t', 'at the end of a block: t'], ['ㄹ', 'r', 'r l n', 'at the end of a block: l'], ['ㅁ', 'm'],
    ] },
    { title: 'ㅂ ㅅ ㅇ ㅈ ㅎ', block: 'Consonants', rows: [
      ['ㅂ', 'b', 'b p', 'at the end of a block: p'], ['ㅅ', 's', 's t', 'at the end of a block: t'], ['ㅇ', 'ng', '- ng', 'silent at the start of a block'],
      ['ㅈ', 'j', 'j ch t', 'at the end of a block: t'], ['ㅎ', 'h', 'h t -', 'at the end of a block: t'],
    ] },
    { title: 'ㅊ ㅋ ㅌ ㅍ', block: 'Consonants', rows: [['ㅊ', 'ch', 'ch t', 'at the end of a block: t'], ['ㅋ', 'k'], ['ㅌ', 't'], ['ㅍ', 'p']] },
    { title: 'ㄲ ㄸ ㅃ ㅆ ㅉ', block: 'Consonants', rows: [
      ['ㄲ', 'kk', 'kk k', 'at the end of a block: k'], ['ㄸ', 'tt'], ['ㅃ', 'pp'], ['ㅆ', 'ss', 'ss t', 'at the end of a block: t'], ['ㅉ', 'jj'],
    ] },
    { title: 'ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ', block: 'Vowels', rows: [['ㅏ', 'a'], ['ㅓ', 'eo', 'eo o u'], ['ㅗ', 'o'], ['ㅜ', 'u', 'u oo'], ['ㅡ', 'eu', 'eu u'], ['ㅣ', 'i']] },
    { title: 'ㅑ ㅕ ㅛ ㅠ', block: 'Vowels', rows: [['ㅑ', 'ya'], ['ㅕ', 'yeo', 'yeo yo'], ['ㅛ', 'yo'], ['ㅠ', 'yu']] },
    { title: 'ㅐ ㅔ ㅒ ㅖ', block: 'Vowels', rows: [['ㅐ', 'ae'], ['ㅔ', 'e'], ['ㅒ', 'yae'], ['ㅖ', 'ye']] },
    { title: 'ㅘ ㅙ ㅚ ㅝ ㅞ ㅟ ㅢ', block: 'Vowels', rows: [['ㅘ', 'wa'], ['ㅙ', 'wae'], ['ㅚ', 'oe'], ['ㅝ', 'wo'], ['ㅞ', 'we'], ['ㅟ', 'wi'], ['ㅢ', 'ui', 'ui i']] },
  ],
  mixes: [
    ['Plain, breathed, doubled', 'ㄱ ㅋ ㄲ ㄷ ㅌ ㄸ ㅂ ㅍ ㅃ ㅈ ㅊ ㅉ ㅅ ㅆ'],
    ['Lookalike vowels', 'ㅏ ㅓ ㅗ ㅜ ㅑ ㅕ ㅛ ㅠ ㅐ ㅔ ㅒ ㅖ'],
    ['Consonants', 'ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ ㅈ ㅎ ㅊ ㅋ ㅌ ㅍ ㄲ ㄸ ㅃ ㅆ ㅉ'],
    ['Vowels', 'ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ ㅑ ㅕ ㅛ ㅠ ㅐ ㅔ ㅒ ㅖ ㅘ ㅙ ㅚ ㅝ ㅞ ㅟ ㅢ'],
  ],
  words: { themes: [] },
};

// A block is its letters together (reading.js: SCRIPT.together): every syllable of Unicode (가 to 힣, 11,172), as the
// spellings of its first consonant, its vowel and its last consonant, in the order Unicode numbers them. A last
// consonant also has the spellings it takes before the next block: ㄱ ng before ㄴ or ㅁ (백마 Baengma), ㅂ m, ㄷ ㅅ n,
// ㄴ l before ㄹ (신라 Silla); ㄹ is r before a vowel (밀양 Miryang) and n at the start after a consonant (종로 Jongno).
{
  const FIRST = 'g k|kk|n|d t|tt|r l n|m|b p|pp|s|ss|-|j ch|jj|ch|k|t|p|h'.split('|');
  const VOWEL = 'a|ae|ya|yae|eo o u|e|yeo yo|ye|o|wa|wae|oe|yo|u oo|wo|we|wi|yu|eu u|ui i|i'.split('|');
  const LAST = '-|k g ng|kk k ng|k ng|n l|n|n|t d n|l r|k l g|m|l p|l|l|p|l|m|p b m|p m|t s n|t ss n|ng|t j n|t ch n|k|t|p|t h -'.split('|');
  const spell = s => s.split(' ').map(x => (x === '-' ? '' : x)), cross = (a, b) => a.flatMap(x => b.map(y => x + y));
  SCRIPT.together = [];
  for (let f = 0; f < 19; f++) for (let v = 0; v < 21; v++) {
    const start = cross(spell(FIRST[f]), spell(VOWEL[v]));
    for (let l = 0; l < 28; l++) SCRIPT.together.push([String.fromCharCode(0xAC00 + (f * 21 + v) * 28 + l), [...new Set(cross(start, spell(LAST[l])))].join(' ')]);
  }
}
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
