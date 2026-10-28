// Sinhala: its letters, for the script quizzes (../shared/reading.js says how this is written). It is written in Sri
// Lanka only; road signs there carry each name in Sinhala, Tamil and English.
// Sounds are spelled as Sri Lankan names are on the map and on those signs: long and short vowels alike (ආ is a, ඊ i),
// the hard letters like the soft ones (ට and ත both ta, ඩ and ද both da, ණ na, ළ la), ඇ and ඈ (æ) as e (Kelaniya,
// Ella), ව as w (Wattala) and sometimes v (Devinuwara), ත often th (Thalawathugoda). The half-nasal letters ඟ ඦ ඬ ඳ
// ඹ are spelled with their n or m (Dambulla, Kandana). A consonant carries an a, which a vowel mark replaces and ්
// takes off; after the first syllable it is often spoken and spelled e (Kegalle, Dehiwela, Jayewardenepura). Digits
// are not taught: Sinhala writes 0–9.
// Words of signs are not in the table yet.
var SCRIPT = {
  name: 'Sinhala', script: 'sinh', unicode: 'Sinhala', faces: 3, inherent: 'a e', carrier: 'ක',
  langs: { si: { name: 'Sinhala', where: 'Sri Lanka', at: 'LKA' } },
  letters: [
    { title: 'අ ආ ඇ ඈ ඉ ඊ', block: 'Vowels', type: 'v', rows: [
      ['අ', 'a'], ['ආ', 'a', 'a aa', 'long a'], ['ඇ', 'e', 'e a ae', 'æ'], ['ඈ', 'e', 'e a ae', 'long æ'], ['ඉ', 'i'], ['ඊ', 'i', 'i ee ii', 'long i'],
    ] },
    { title: 'උ ඌ එ ඒ ඔ ඕ ඓ ඖ ඍ', block: 'Vowels', type: 'v', rows: [
      ['උ', 'u'], ['ඌ', 'u', 'u oo uu', 'long u'], ['එ', 'e'], ['ඒ', 'e', 'e ee ay', 'long e'], ['ඔ', 'o'], ['ඕ', 'o', 'o oo', 'long o'],
      ['ඓ', 'ai', 'ai ei'], ['ඖ', 'au', 'au ow ou'], ['ඍ', 'ru', 'ru ri r'],
    ] },
    { title: 'ක ඛ ග ඝ ඞ ඟ', block: 'Consonants', type: 'c', rows: [
      ['ක', 'ka', 'k c'], ['ඛ', 'kha', 'kh k'], ['ග', 'ga', 'g'], ['ඝ', 'gha', 'gh g'], ['ඞ', 'nga', 'ng n'], ['ඟ', 'nga', 'ng n', 'half n before g'],
    ] },
    { title: 'ච ඡ ජ ඣ ඤ ඥ ඦ', block: 'Consonants', type: 'c', rows: [
      ['ච', 'cha', 'ch c'], ['ඡ', 'chha', 'chh ch'], ['ජ', 'ja', 'j'], ['ඣ', 'jha', 'jh j'], ['ඤ', 'nya', 'ny gn n nj'], ['ඥ', 'gna', 'gn gny ny gy'],
      ['ඦ', 'nja', 'nj j', 'half n before j'],
    ] },
    { title: 'ට ඨ ඩ ඪ ණ ඬ', block: 'Consonants', type: 'c', rows: [
      ['ට', 'ta', 't', 'hard t'], ['ඨ', 'tha', 'th t', 'hard th'], ['ඩ', 'da', 'd', 'hard d'], ['ඪ', 'dha', 'dh d', 'hard dh'], ['ණ', 'na', 'n', 'hard n'],
      ['ඬ', 'nda', 'nd d', 'half n before hard d'],
    ] },
    { title: 'ත ථ ද ධ න ඳ', block: 'Consonants', type: 'c', rows: [
      ['ත', 'ta', 't th', 'often th'], ['ථ', 'tha', 'th t'], ['ද', 'da', 'd'], ['ධ', 'dha', 'dh d'], ['න', 'na', 'n'], ['ඳ', 'nda', 'nd d n', 'half n before d'],
    ] },
    { title: 'ප ඵ බ භ ම ඹ', block: 'Consonants', type: 'c', rows: [
      ['ප', 'pa', 'p'], ['ඵ', 'pha', 'ph p f'], ['බ', 'ba', 'b'], ['භ', 'bha', 'bh b'], ['ම', 'ma', 'm'], ['ඹ', 'mba', 'mb m b', 'half m before b'],
    ] },
    { title: 'ය ර ල ව ළ', block: 'Consonants', type: 'c', rows: [
      ['ය', 'ya', 'y'], ['ර', 'ra', 'r'], ['ල', 'la', 'l'], ['ව', 'wa', 'w v', 'or va'], ['ළ', 'la', 'l', 'hard l'],
    ] },
    { title: 'ශ ෂ ස හ ෆ', block: 'Consonants', type: 'c', rows: [['ශ', 'sha', 'sh s'], ['ෂ', 'sha', 'sh s'], ['ස', 'sa', 's'], ['හ', 'ha', 'h'], ['ෆ', 'fa', 'f']] },
    { title: 'ා ැ ෑ ි ී ු ූ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ා', 'a', 'a aa', 'long a'], ['ැ', 'e', 'e a ae', 'æ'], ['ෑ', 'e', 'e a ae', 'long æ'], ['ි', 'i'], ['ී', 'i', 'i ee ii', 'long i'],
      ['ු', 'u', 'u', 'below its letter'], ['ූ', 'u', 'u oo uu', 'long u'],
    ] },
    { title: 'ෘ ෙ ේ ෛ ො ෝ ෞ ්', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ෘ', 'ru', 'ru ri r'], ['ෙ', 'e', 'e', 'written before its letter'], ['ේ', 'e', 'e ee ay', 'long e'], ['ෛ', 'ai', 'ai ei', 'written before its letter'],
      ['ො', 'o', 'o', 'written around its letter'], ['ෝ', 'o', 'o oo', 'long o'], ['ෞ', 'au', 'au ow ou', 'written around its letter'],
      ['්', 'no a', '-', 'takes the vowel off'],
    ] },
    { title: 'ං ඃ', block: 'Signs', type: 's', plain: true, rows: [['ං', 'ng', 'ng n m'], ['ඃ', 'h', 'h -']] },
    { title: 'Attached letters', block: 'Joined', type: 'p', plain: true, rows: [['්‍ය', 'ya', 'y'], ['්‍ර', 'ra', 'r']] },
    { title: 'Joined letters', block: 'Joined', type: 'j', rows: [['ශ්‍රී', 'sri', 'sri shri sree shree'], ['ක්‍ෂ', 'ksha', 'ksh ks sh']] },
  ],
  mixes: [
    ['Vowels and vowel marks', 'අ ආ ඇ ඈ ඉ ඊ උ ඌ එ ඒ ඔ ඕ ඓ ඖ ඍ ා ැ ෑ ි ී ු ූ ෘ ෙ ේ ෛ ො ෝ ෞ'],
    ['Lookalikes', 'ග ශ ද ඳ ඩ ඬ ම ඹ ප ඵ ෂ ල ළ ව ච ත න බ ඛ භ හ ජ ඡ ඝ ස'],
    ['Consonants', 'ක ඛ ග ඝ ඞ ඟ ච ඡ ජ ඣ ඤ ඥ ඦ ට ඨ ඩ ඪ ණ ඬ ත ථ ද ධ න ඳ ප ඵ බ භ ම ඹ ය ර ල ව ළ ශ ෂ ස හ ෆ'],
  ],
  // The words of signs: none yet.
  words: { themes: [], mixes: [] },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"අ":["අම්බලන්තොට","Ambalantota"],"ඇ":["ජා-ඇල","Ja-Ela"],"උ":["උණවටුන","Unawatuna"],"එ":["නුවරඑළිය","Nuwara Eliya"],"ක":["කොටිකාවත්ත","Kotikawatta"],"ග":["ගම්පොල","Gampola"],"ජ":["ශ්‍රී ජයවර්ධනපුර කෝට්ටේ","Sri Jayawardenepura Kotte"],"ට":["මොරටුව","Moratuwa"],"ඩ":["අම්බලන්ගොඩ","Ambalangoda"],"ණ":["කුරුණෑගල","Kurunegala"],"ත":["මාතර","Matara"],"ද":["බදුල්ල","Badulla"],"ධ":["අනුරාධපුර","Anuradhapura"],"න":["බෙන්තොට","Bentota"],"ඳ":["කඳාන","Kandana"],"ප":["රත්නපුර","Ratnapura"],"බ":["බත්තරමුල්ල","Battaramulla"],"ම":["පුත්තලම","Puttalam"],"ඹ":["දඹුල්ල","Dambulla"],"ය":["කටුනායක","Katunayake"],"ර":["පානදුර","Panadura"],"ල":["වත්තල","Wattala"],"ව":["බේරුවල","Beruwala"],"ළ":["කළුතර","Kalutara"],"ශ":["ශ්‍රී ජයවර්ධනපුර කෝට්ටේ","Sri Jayawardenepura Kotte"],"ස":["මිරිස්ස","Mirissa"],"හ":["මහරගම","Maharagama"],"ා":["ගාල්ල","Galle"],"ැ":["කැලණිය","Kelaniya"],"ෑ":["පෑලියගොඩ","Peliyagoda"],"ි":["දෙවිනුවර","Devinuwara"],"ී":["සීගිරිය","Sigiriya"],"ු":["මුල්ලේරියාව","Mulleriyawa"],"ෙ":["බෙලිඅත්ත","Beliatta"],"ේ":["මාතලේ","Matale"],"ො":["කොලොන්නාව","Kolonnawa"],"ෝ":["හෝමාගම","Homagama"],"්":["හංවැල්ල","Hanwella"],"ං":["තංගල්ල","Tangalle"],"්‍ර":["ශ්‍රී ජයවර්ධනපුර කෝට්ටේ","Sri Jayawardenepura Kotte"],"ශ්‍රී":["ශ්‍රී ජයවර්ධනපුර කෝට්ටේ","Sri Jayawardenepura Kotte"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
