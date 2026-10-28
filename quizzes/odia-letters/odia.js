// Odia: its letters, for the script quizzes (../shared/reading.js says how this is written). It is written in Odisha,
// whose road signs carry each name in Odia and English, often in Hindi too.
// Sounds are spelled as names are on Indian signs and maps (the Hunterian system, without marks): long and short
// vowels alike (ଆ is a, ଈ i), the hard letters like the soft ones (ଟ and ତ both t, ଡ and ଦ both d, ଣ n, ଳ l), ବ b
// and sometimes v or w, ଯ j (ଯାଜପୁର Jajpur) and ୟ y, ଡ଼ r or d (କେନ୍ଦ୍ରାପଡ଼ା Kendrapara, ଝାରସୁଗୁଡ଼ା Jharsuguda). A
// consonant carries a vowel, spoken o and spelled a on the map (ସମ୍ବଲପୁର Sambalpur), sometimes o (ବଲାଙ୍ଗୀର
// Bolangir), which a vowel mark replaces and ୍ takes off; at the end of a name the map leaves it off (କଟକ Cuttack).
// Common endings and their spellings: -ପୁର -pur, -ଗଡ଼ -garh, -gad or -gada, -ପଡ଼ା -para or -pada, -ପାଟଣା -patna, -ପାଲି -pali,
// -ଗୁଡ଼ା -guda, -ବନ୍ଧ -bandh.
// Letters and joined letters come in the order of how often they are written in Odisha's place names (Wikidata labels
// and OpenStreetMap names in Odia), the most frequent first. Digits are not taught: signs write 0–9. Words of signs
// are not in the table yet.
var SCRIPT = {
  name: 'Odia', script: 'orya', unicode: 'Oriya', faces: 4, inherent: 'a o', carrier: 'କ',
  langs: { or: { name: 'Odia', where: 'Odisha', at: 'IND' } },
  letters: [
    { title: 'ର ପ ଲ ଡ ନ କ ବ ମ', block: 'Consonants', type: 'c', rows: [
      ['ର', 'ra', 'r'], ['ପ', 'pa', 'p'], ['ଲ', 'la', 'l'], ['ଡ', 'da', 'd', 'hard d'], ['ନ', 'na', 'n'], ['କ', 'ka', 'k c'], ['ବ', 'ba', 'b v w', 'or va'],
      ['ମ', 'ma', 'm'],
    ] },
    { title: 'ା ି ୁ େ ୋ ୀ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ା', 'a', 'a aa', 'long a'], ['ି', 'i'], ['ୁ', 'u'], ['େ', 'e', 'e', 'written before its letter'], ['ୋ', 'o', 'o', 'written around its letter'],
      ['ୀ', 'i', 'i ee', 'long i'],
    ] },
    { title: 'ଗ ଣ ଦ ସ ଟ ହ ତ ଳ ଜ', block: 'Consonants', type: 'c', rows: [
      ['ଗ', 'ga', 'g'], ['ଣ', 'na', 'n', 'hard n'], ['ଦ', 'da', 'd'], ['ସ', 'sa', 's'], ['ଟ', 'ta', 't', 'hard t'], ['ହ', 'ha', 'h'], ['ତ', 'ta', 't'],
      ['ଳ', 'la', 'l', 'hard l'], ['ଜ', 'ja', 'j'],
    ] },
    { title: 'ଁ ଂ ଃ', block: 'Signs', type: 's', plain: true, rows: [['ଁ', 'n, m', 'n - m', 'nasal'], ['ଂ', 'n, m', 'n m ng'], ['ଃ', 'h', 'h -']] },
    { title: 'Joined · after a nasal', block: 'Joined', type: 'j', rows: [
      ['ଣ୍ଡ', 'nda', 'nd'], ['ଙ୍ଗ', 'nga', 'ng ngg'], ['ନ୍ଦ', 'nda', 'nd'], ['ନ୍ଧ', 'ndha', 'ndh nd'], ['ଞ୍ଜ', 'nja', 'nj'], ['ଣ୍ଟ', 'nta', 'nt'],
      ['ଙ୍କ', 'nka', 'nk'], ['ମ୍ବ', 'mba', 'mb'], ['ନ୍ତ', 'nta', 'nt'],
    ] },
    { title: 'ଭ ଙ ଖ ଚ ଶ ଧ ଝ ୟ', block: 'Consonants', type: 'c', rows: [
      ['ଭ', 'bha', 'bh'], ['ଙ', 'nga', 'ng n'], ['ଖ', 'kha', 'kh'], ['ଚ', 'cha', 'ch c'], ['ଶ', 'sha', 'sh s'], ['ଧ', 'dha', 'dh'], ['ଝ', 'jha', 'jh'],
      ['ୟ', 'ya', 'y'],
    ] },
    { title: 'ଆ ଇ ଅ ଉ ଓ ଏ', block: 'Vowels', type: 'v', rows: [
      ['ଆ', 'a', 'a aa', 'long a'], ['ଇ', 'i'], ['ଅ', 'a', 'a o', 'spoken o'], ['ଉ', 'u'], ['ଓ', 'o'], ['ଏ', 'e'],
    ] },
    { title: 'ଡ଼ ଢ଼ ୱ ଵ', block: 'Consonants', type: 'c', rows: [
      ['ଡ଼', 'ra', 'r d rh', 'flapped r'], ['ଢ଼', 'rha', 'rh r dh'], ['ୱ', 'wa', 'w v'], ['ଵ', 'va', 'v w b', 'another way to write ୱ'],
    ] },
    { title: 'ୂ ୈ ୌ ୃ ୍', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ୂ', 'u', 'u oo', 'long u'], ['ୈ', 'ai', 'ai oi ei', 'written before and above its letter'], ['ୌ', 'au', 'au ou', 'written around its letter'], ['ୃ', 'ri', 'ri ru r'],
      ['୍', 'no a', '-', 'takes the vowel off'],
    ] },
    { title: 'ଛ ଷ ଠ ଥ ଯ ଘ ଞ ଢ ଫ', block: 'Consonants', type: 'c', rows: [
      ['ଛ', 'chha', 'chh ch'], ['ଷ', 'sha', 'sh s'], ['ଠ', 'tha', 'th', 'hard th'], ['ଥ', 'tha', 'th'], ['ଯ', 'ja', 'j', 'j, not y'], ['ଘ', 'gha', 'gh'],
      ['ଞ', 'nya', 'ny n'], ['ଢ', 'dha', 'dh', 'hard dh'], ['ଫ', 'pha', 'ph f'],
    ] },
    { title: 'Joined · more', block: 'Joined', type: 'j', rows: [
      ['ଶ୍ୱ ଶ୍ଵ', 'shwa', 'sw shw sh s'], ['ବ୍ର', 'bra', 'br'], ['ର୍ଲ', 'rla', 'rl', 'r before the letter: a hook on top'], ['ଲ୍ଲ', 'lla', 'll l'], ['ତ୍ର', 'tra', 'tr'],
      ['କ୍ଷ', 'ksha', 'ksh khy kh ks x'], ['ହ୍ମ', 'hma', 'hm mh'], ['ପ୍ର', 'pra', 'pr'], ['ଦ୍ଧ', 'ddha', 'ddh dh'],
    ] },
    { title: 'ଈ ଊ ଋ ଐ ଔ', block: 'Vowels', type: 'v', rows: [
      ['ଈ', 'i', 'i ee', 'long i'], ['ଊ', 'u', 'u oo', 'long u'], ['ଋ', 'ri', 'ri ru r'], ['ଐ', 'ai', 'ai oi ei'], ['ଔ', 'au', 'au ou'],
    ] },
  ],
  mixes: [
    ['Vowels and vowel marks', 'ଅ ଆ ଇ ଈ ଉ ଊ ଋ ଏ ଐ ଓ ଔ ା ି ୀ ୁ ୂ ୃ େ ୈ ୋ ୌ'],
    ['Lookalikes', 'ପ ଫ ଯ ୟ ଡ ଢ ଡ଼ ଢ଼ ଦ ଧ ଗ ଶ ଘ ଷ ଟ ତ ଲ ଳ ଇ ଈ ଉ ଊ'],
    ['Joined letters', 'ଣ୍ଡ ଙ୍ଗ ନ୍ଦ ନ୍ଧ ଞ୍ଜ ଣ୍ଟ ଙ୍କ ମ୍ବ ନ୍ତ ଶ୍ୱ ବ୍ର ର୍ଲ ଲ୍ଲ ତ୍ର କ୍ଷ ହ୍ମ ପ୍ର ଦ୍ଧ'],
    ['Consonants', 'ର ପ ଲ ଡ ନ କ ବ ମ ଗ ଣ ଦ ସ ଟ ହ ତ ଳ ଜ ଭ ଙ ଖ ଚ ଶ ଧ ଝ ୟ ଡ଼ ଢ଼ ୱ ଵ ଛ ଷ ଠ ଥ ଯ ଘ ଞ ଢ ଫ'],
  ],
  // The words of signs: none yet.
  words: { themes: [], mixes: [] },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ର":["ସୋର","Soro"],"ପ":["ପାରାଦୀପ","Paradip"],"ଲ":["ବଡ଼ବିଲ","Barbil"],"ଡ":["କୁଚିଣ୍ଡା","Kuchinda"],"ନ":["ଭୁବନ","Bhuban"],"କ":["କେନ୍ଦ୍ରାପଡ଼ା","Kendrapara"],"ବ":["ବାସୁଦେବପୁର","Basudevpur"],"ମ":["ମାଲକାନଗିରି","Malkangiri"],"ା":["ହୀରାକୁଦ","Hirakud"],"ି":["ବରପାଲି","Barpali"],"ୁ":["ଯାଜପୁର","Jajpur"],"େ":["ସୁନାବେଡ଼ା","Sunabeda"],"ୋ":["କୋରାପୁଟ","Koraput"],"ୀ":["ପୁରୀ","Puri"],"ଗ":["ଦେବଗଡ଼","Debagarh"],"ଣ":["ରେମୁଣା","Remuna"],"ଦ":["ବାରିପଦା","Baripada"],"ସ":["ବ୍ୟାସନଗର","Byasanagar"],"ଟ":["ଭବାନୀପାଟଣା","Bhawanipatna"],"ହ":["ବେଲପାହାଡ଼","Belpahar"],"ତ":["ତାଳଚେର","Talcher"],"ଳ":["ନୀଳଗିରି","Nilagiri"],"ଜ":["ଜଟଣୀ","Jatani"],"ଂ":["ଜଗତସିଂହପୁର","Jagatsinghpur"],"ଣ୍ଡ":["ଦିଗପହଣ୍ଡି","Digapahandi"],"ଙ୍ଗ":["ବଲାଙ୍ଗୀର","Balangir"],"ନ୍ଦ":["କେନ୍ଦୁଝର","Kendujhar"],"ଞ୍ଜ":["କରଞ୍ଜିଆ","Karanjia"],"ଣ୍ଟ":["କଣ୍ଟିଲୋ","Kantilo"],"ଙ୍କ":["ବାଙ୍କୀ","Banki"],"ମ୍ବ":["ସମ୍ବଲପୁର","Sambalpur"],"ଭ":["ଭଦ୍ରକ","Bhadrak"],"ଙ":["ରାଜଗାଙ୍ଗପୁର","Rajgangpur"],"ଖ":["ପାରଳାଖେମୁଣ୍ଡି","Paralakhemundi"],"ଚ":["ଚିକିଟି","Chikiti"],"ଶ":["କାଂଶବାହାଲ","Kansbahal"],"ଧ":["ଖୋର୍ଦ୍ଧା","Khordha"],"ଝ":["ଝାରସୁଗୁଡ଼ା","Jharsuguda"],"ୟ":["ରାୟଗଡ଼","Rayagada"],"ଆ":["ଚମ୍ପୁଆ","Champua"],"ଇ":["ପଟ୍ଟାମୁଣ୍ଡାଇ","Pattamundai"],"ଉ":["ଉଦଳା","Udala"],"ଡ଼":["ବରଗଡ଼","Bargarh"],"ୱ":["ଭୁବନେଶ୍ୱର","Bhubaneswar"],"ଵ":["ଚୌଦ୍ଵାର","Choudwar"],"ୌ":["ବୌଦ୍ଧ","Boudh"],"୍":["ରାଇରଙ୍ଗପୁର","Rairangpur"],"ଛ":["ଛତ୍ରପୁର","Chhatrapur"],"ଷ":["ପୁରୁଷୋତ୍ତମପୁର","Purusottampur"],"ଠ":["ଆଠଗଡ଼","Athagarh"],"ଯ":["ଯୋଡ଼ା","Joda"],"ଞ":["ଭଞ୍ଜନଗର","Bhanjanagar"],"ଢ":["ଢେଙ୍କାନାଳ","Dhenkanal"],"ଫ":["ଫୁଲବାଣୀ","Phulbani"],"ଶ୍ୱ":["ଜଳେଶ୍ଵର","Jaleswar"],"ବ୍ର":["ବ୍ରଜରାଜନଗର","Brajarajnagar"],"ର୍ଲ":["ବୁର୍ଲା","Burla"],"ଲ୍ଲ":["ଆଠମଲ୍ଲିକ","Athmallik"],"ତ୍ର":["ବୀରମିତ୍ରପୁର","Biramitrapur"],"କ୍ଷ":["କାମାକ୍ଷାନଗର","Kamakhyanagar"],"ହ୍ମ":["ବ୍ରହ୍ମପୁର","Brahmapur"],"ଦ୍ଧ":["ଖୋର୍ଦ୍ଧା","Khordha"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
