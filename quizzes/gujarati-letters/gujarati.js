// Gujarati: its letters, for the script quizzes (../shared/reading.js says how this is written). It is written in
// Gujarat, whose road signs carry each name in Gujarati and English, often in Hindi too.
// Sounds are spelled as names are on Indian signs and maps (the Hunterian system, without marks): long and short
// vowels alike (આ is a, ઈ i), the hard letters like the soft ones (ટ and ત both t, ડ and દ both d, ણ n, ળ l), વ v or
// w, ફ ph or f. A consonant carries an a, which a vowel mark replaces and ્ takes off; at the end of a name, and often
// inside one, it is not spoken (સુરત Surat, ભાવનગર Bhavnagar). Some names on the map keep a formal Persian form
// (અમદાવાદ Amdavad, on the map Ahmedabad). Common endings and their spellings: -નગર -nagar, -પુર -pur, -પુરા -pura,
// -ગામ -gam, -વાડ and -વાડા -vad, -wad, -vada or -wada, -વાવ -vav, -પાડા -pada, -વાદ -vad (Persian -abad), -ગઢ -gadh,
// -સર -sar.
// Letters and joined letters come in the order of how often they are written in Gujarat's place names (Wikidata
// labels in Gujarati), the most frequent first. The digits are taught: shop signs, buses and some road signs write
// Gujarati's own. Words of signs are not in the table yet.
var SCRIPT = {
  name: 'Gujarati', script: 'gujr', unicode: 'Gujarati', faces: 4, inherent: 'a', carrier: 'ક',
  langs: { gu: { name: 'Gujarati', where: 'Gujarat', at: 'IND' } },
  letters: [
    { title: 'ર વ ડ લ મ પ સ ન', block: 'Consonants', type: 'c', rows: [
      ['ર', 'ra', 'r'], ['વ', 'va', 'v w', 'or wa'], ['ડ', 'da', 'd', 'hard d'], ['લ', 'la', 'l'], ['મ', 'ma', 'm'], ['પ', 'pa', 'p'], ['સ', 'sa', 's'], ['ન', 'na', 'n'],
    ] },
    { title: 'ા ી ો ુ ે િ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ા', 'a', 'a aa', 'long a'], ['ી', 'i', 'i ee', 'long i'], ['ો', 'o'], ['ુ', 'u'], ['ે', 'e'], ['િ', 'i', 'i', 'written before its letter'],
    ] },
    { title: 'ં ઃ', block: 'Signs', type: 's', plain: true, rows: [['ં', 'n, m', 'n m -', 'nasal: n or m'], ['ઃ', 'h', 'h -']] },
    { title: 'ક દ ય ણ ગ જ બ ટ ત', block: 'Consonants', type: 'c', rows: [
      ['ક', 'ka', 'k c q'], ['દ', 'da', 'd'], ['ય', 'ya', 'y i -'], ['ણ', 'na', 'n', 'hard n'], ['ગ', 'ga', 'g'], ['જ', 'ja', 'j z'], ['બ', 'ba', 'b'],
      ['ટ', 'ta', 't', 'hard t'], ['ત', 'ta', 't'],
    ] },
    { title: 'ખ ળ ભ ધ ચ હ ઢ શ થ', block: 'Consonants', type: 'c', rows: [
      ['ખ', 'kha', 'kh'], ['ળ', 'la', 'l', 'hard l'], ['ભ', 'bha', 'bh'], ['ધ', 'dha', 'dh'], ['ચ', 'cha', 'ch c'], ['હ', 'ha', 'h'], ['ઢ', 'dha', 'dh', 'hard dh'],
      ['શ', 'sha', 'sh s'], ['થ', 'tha', 'th'],
    ] },
    { title: 'અ આ ઇ ઉ ઓ ઈ', block: 'Vowels', type: 'v', rows: [
      ['અ', 'a'], ['આ', 'a', 'a aa', 'long a'], ['ઇ', 'i'], ['ઉ', 'u'], ['ઓ', 'o'], ['ઈ', 'i', 'i ee', 'long i'],
    ] },
    { title: 'ૂ ૈ ૌ ૃ ૅ ૉ ્', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ૂ', 'u', 'u oo', 'long u'], ['ૈ', 'ai', 'ai ei ay'], ['ૌ', 'au', 'au ou aw o'], ['ૃ', 'ri', 'ri ru r'], ['ૅ', 'e', 'e a', 'a of English words'],
      ['ૉ', 'o', 'o aw au', 'o of English words'], ['્', 'no a', '-', 'takes the a off'],
    ] },
    { title: 'Joined · with ર', block: 'Joined', type: 'j', rows: [
      ['ત્ર', 'tra', 'tr'], ['દ્ર', 'dra', 'dr'], ['ધ્ર', 'dhra', 'dhr'], ['પ્ર', 'pra', 'pr'], ['બ્ર', 'bra', 'br'], ['શ્ર', 'shra', 'shr sr'],
      ['ર્દ', 'rda', 'rd', 'r before the letter: a hook on top'], ['ર્ય', 'rya', 'ry', 'r before the letter: a hook on top'],
    ] },
    { title: 'છ ઠ ઝ ઘ ફ ષ ઙ ઞ', block: 'Consonants', type: 'c', rows: [
      ['છ', 'chha', 'chh ch'], ['ઠ', 'tha', 'th', 'hard th'], ['ઝ', 'jha', 'jh z'], ['ઘ', 'gha', 'gh'], ['ફ', 'pha', 'ph f'], ['ષ', 'sha', 'sh s'],
      ['ઙ', 'nga', 'n ng'], ['ઞ', 'nya', 'n ny'],
    ] },
    { title: 'એ ઊ ઐ ઔ ઋ ઍ ઑ', block: 'Vowels', type: 'v', rows: [
      ['એ', 'e'], ['ઊ', 'u', 'u oo', 'long u'], ['ઐ', 'ai', 'ai ei ay'], ['ઔ', 'au', 'au ou aw o'], ['ઋ', 'ri', 'ri ru r'], ['ઍ', 'e', 'e a', 'a of English words'],
      ['ઑ', 'o', 'o aw au', 'o of English words'],
    ] },
    { title: 'Joined · half letters', block: 'Joined', type: 'j', rows: [
      ['લ્લ', 'lla', 'll l'], ['શ્વ', 'shva', 'shw shv sw sv'], ['ન્દ', 'nda', 'nd'], ['સ્ત', 'sta', 'st'], ['મ્બ', 'mba', 'mb'], ['ચ્છ', 'chchha', 'chchh cchh chh ch tch'],
      ['સ્ક', 'ska', 'sk'], ['લ્ય', 'lya', 'ly'], ['વ્ય', 'vya', 'vy'],
    ] },
    { title: 'Joined · new shapes', block: 'Joined', type: 'j', rows: [
      ['ક્ષ', 'ksha', 'ksh x kh'], ['જ્ઞ', 'gna', 'gn gy jn'], ['દ્વ', 'dva', 'dv dw'], ['દ્ય', 'dya', 'dy'], ['દ્ધ', 'ddha', 'ddh dh'], ['હ્મ', 'hma', 'hm'],
      ['ટ્ટ', 'tta', 'tt t'], ['ઠ્ઠ', 'ttha', 'tth th'],
    ] },
    { title: '૦ ૧ ૨ ૩ ૪', block: 'Digits', type: 'd', rows: [['૦', '0'], ['૧', '1'], ['૨', '2'], ['૩', '3'], ['૪', '4']] },
    { title: '૫ ૬ ૭ ૮ ૯', block: 'Digits', type: 'd', rows: [['૫', '5'], ['૬', '6'], ['૭', '7'], ['૮', '8'], ['૯', '9']] },
  ],
  together: [['હે', 'he eh']],
  mixes: [
    ['Digits', '૦ ૧ ૨ ૩ ૪ ૫ ૬ ૭ ૮ ૯'],
    ['Vowels and vowel marks', 'અ આ ઇ ઈ ઉ ઊ ઋ એ ઐ ઓ ઔ ઍ ઑ ા િ ી ુ ૂ ૃ ે ૈ ો ૌ ૅ ૉ'],
    ['Lookalikes', 'ઘ ધ ભ મ બ વ ય પ ૫ ષ ઠ ડ ઙ ઢ દ ર ૨ ક ફ સ શ ન ત ઇ ઈ ઉ ઊ'],
    ['Joined letters', 'ત્ર દ્ર ધ્ર પ્ર બ્ર શ્ર ર્દ ર્ય લ્લ શ્વ ન્દ સ્ત મ્બ ચ્છ સ્ક લ્ય વ્ય ક્ષ જ્ઞ દ્વ દ્ય દ્ધ હ્મ ટ્ટ ઠ્ઠ'],
    ['Consonants', 'ર વ ડ લ મ પ સ ન ક દ ય ણ ગ જ બ ટ ત ખ ળ ભ ધ ચ હ ઢ શ થ છ ઠ ઝ ઘ ફ ષ ઙ ઞ'],
  ],
  // The words of signs: none yet.
  words: { themes: [], mixes: [] },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ર":["અંજાર","Anjar"],"વ":["સાવરકુંડલા","Savarkundla"],"ડ":["વડોદરા","Vadodara"],"લ":["પાલનપુર","Palanpur"],"મ":["મહુવા","Mahuva"],"પ":["વાપી","Vapi"],"સ":["વલસાડ","Valsad"],"ન":["નવસારી","Navsari"],"ા":["પાટણ","Patan"],"ી":["ગાંધીધામ","Gandhidham"],"ો":["બોટાદ","Botad"],"ુ":["ભુજ","Bhuj"],"ે":["જેતપુર","Jetpur"],"િ":["હિંમતનગર","Himatnagar"],"ં":["ગોંડલ","Gondal"],"ક":["કલોલ","Kalol"],"દ":["પોરબંદર","Porbandar"],"ય":["જામખંભાળિયા","Jamkhambhaliya"],"ણ":["આણંદ","Anand"],"ગ":["ગોધરા","Godhra"],"જ":["જામનગર","Jamnagar"],"બ":["મોરબી","Morbi"],"ટ":["રાજકોટ","Rajkot"],"ત":["સુરત","Surat"],"ખ":["ખંભાત","Khambhat"],"ળ":["વેરાવળ","Veraval"],"ભ":["ભાવનગર","Bhavnagar"],"ધ":["ગાંધીનગર","Gandhinagar"],"ચ":["ચકલાસી","Chaklasi"],"હ":["મહેસાણા","Mehsana"],"ઢ":["જુનાગઢ","Junagadh"],"શ":["કેશોદ","Keshod"],"થ":["થાનગઢ","Thangadh"],"અ":["અમરેલી","Amreli"],"આ":["નડીઆદ","Nadiad"],"ઇ":["ડભોઇ","Dabhoi"],"ઉ":["ઉપલેટા","Upleta"],"ૂ":["ભરૂચ","Bharuch"],"્":["સુરેન્દ્રનગર","Surendranagar"],"દ્ર":["સુરેન્દ્રનગર","Surendranagar"],"ધ્ર":["ધ્રાંગધ્રા","Dhrangadhra"],"ઠ":["ઉમરેઠ","Umreth"],"ઝ":["ઉંઝા","Unjha"],"લ્લ":["વલ્લભ વિદ્યાનગર","Vallabh Vidyanagar"],"શ્વ":["અંકલેશ્વર","Ankleshwar"],"ન્દ":["સુરેન્દ્રનગર","Surendranagar"],"વ્ય":["વ્યારા","Vyara"],"દ્વ":["દ્વારકા","Dwarka"],"દ્ય":["વલ્લભ વિદ્યાનગર","Vallabh Vidyanagar"],"દ્ધ":["સિદ્ધપુર","Siddhpur"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
