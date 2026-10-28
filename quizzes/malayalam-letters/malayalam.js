// Malayalam: its letters, for the script quizzes (../shared/reading.js says how this is written). It is written in
// Kerala, whose road signs carry each name in Malayalam and English.
// Sounds are spelled as Kerala's names are on signs and maps: long and short vowels alike (ആ is a, ഈ i), the hard
// letters like the soft ones (ണ n, ള l), ത as th (തൃശ്ശൂർ Thrissur), ഴ as zh (ആലപ്പുഴ Alappuzha, കോഴിക്കോട്
// Kozhikode), ട as d between vowels and t when doubled (വടകര Vadakara or Vatakara, കോട്ടയം Kottayam), റ as r and doubled as tt
// (ഒറ്റപ്പാലം Ottapalam), വ v or w (വയനാട് Wayanad). A consonant carries an a, which a vowel mark replaces and ്
// takes off; at the end of a word ് is a short u or nothing (പാലക്കാട് Palakkad). Five letters are a consonant
// without its vowel (ർ ൽ ൻ ൺ ൾ), and ം is m. Joined letters are mostly new shapes, doubled or after a nasal. Common
// endings and their spellings: -കര -kara, -പുരം -puram, -കുളം -kulam, -കോട് -kode or -kod, -നാട് -nad, -ശ്ശേരി -ssery or -sseri,
// -പുഴ -puzha, -പള്ളി -pally or -palli, -ൂർ -ur or -oor.
// Letters and joined letters come in the order of how often they are written in Kerala's place names (Wikidata
// labels and OpenStreetMap names in Malayalam), the most frequent first. Digits are not taught: signs write 0–9.
// Words of signs are not in the table yet.
var SCRIPT = {
  name: 'Malayalam', script: 'mlym', unicode: 'Malayalam', faces: 4, inherent: 'a', carrier: 'ക',
  langs: { ml: { name: 'Malayalam', where: 'Kerala', at: 'IND' } },
  letters: [
    { title: 'ക പ ട ത ര മ ന ല', block: 'Consonants', type: 'c', rows: [
      ['ക', 'ka', 'k c'], ['പ', 'pa', 'p'], ['ട', 'da', 'd t', 'hard t, spelled d between vowels and t when doubled'], ['ത', 'tha', 'th t', 'or ta'], ['ര', 'ra', 'r'], ['മ', 'ma', 'm'],
      ['ന', 'na', 'n'], ['ല', 'la', 'l'],
    ] },
    { title: 'ി ു ാ ൂ ോ െ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ി', 'i', 'i y'], ['ു', 'u'], ['ാ', 'a', 'a aa', 'long a'], ['ൂ', 'u', 'u oo', 'long u'], ['ോ', 'o', 'o', 'long o, written around its letter'],
      ['െ', 'e', 'e', 'written before its letter'],
    ] },
    { title: 'ം ർ ൽ ൻ ൺ ൾ ഃ', block: 'Signs', type: 's', plain: true, rows: [
      ['ം', 'm', 'm n'], ['ർ', 'r', 'r', 'r without a vowel'], ['ൽ', 'l', 'l', 'l without a vowel'], ['ൻ', 'n', 'n', 'n without a vowel'],
      ['ൺ', 'n', 'n', 'hard n without a vowel'], ['ൾ', 'l', 'l', 'hard l without a vowel'], ['ഃ', 'h', 'h -'],
    ] },
    { title: 'വ ള റ ച യ ങ ണ ഴ ഞ', block: 'Consonants', type: 'c', rows: [
      ['വ', 'va', 'v w', 'or wa'], ['ള', 'la', 'l', 'hard l'], ['റ', 'ra', 'r', 'hard r'], ['ച', 'cha', 'ch c'], ['യ', 'ya', 'y'], ['ങ', 'nga', 'ng n'],
      ['ണ', 'na', 'n', 'hard n'], ['ഴ', 'zha', 'zh l', 'between r and l'], ['ഞ', 'nja', 'nj ny n'],
    ] },
    { title: 'Joined · doubled', block: 'Joined', type: 'j', rows: [
      ['ക്ക', 'kka', 'kk k'], ['ത്ത', 'tha', 'tth th tt t', 'often th or tt'], ['പ്പ', 'ppa', 'pp p'], ['ട്ട', 'tta', 'tt t'], ['ന്ന', 'nna', 'nn n'],
      ['ല്ല', 'lla', 'll l'], ['ങ്ങ', 'nga', 'ng nng'], ['ള്ള', 'lla', 'll l'], ['റ്റ', 'tta', 'tt t', 'doubled റ'],
    ] },
    { title: 'േ ൊ ീ ൈ ൃ ൗ ്', block: 'Vowels', type: 'm', plain: true, rows: [
      ['േ', 'e', 'e', 'long e, written before its letter'], ['ൊ', 'o', 'o', 'written around its letter'], ['ീ', 'i', 'i ee', 'long i'],
      ['ൈ', 'ai', 'ai ei ay', 'written before its letter'], ['ൃ', 'ri', 'ri ru r'], ['ൗ ൌ', 'au', 'au ow ou'],
      ['്', 'no a', '- u', 'takes the vowel off; at the end of a word a short u'],
    ] },
    { title: 'ശ ഗ സ ബ ദ ജ ഡ ഷ ഹ', block: 'Consonants', type: 'c', rows: [
      ['ശ', 'sha', 'sh s'], ['ഗ', 'ga', 'g'], ['സ', 'sa', 's'], ['ബ', 'ba', 'b'], ['ദ', 'da', 'd'], ['ജ', 'ja', 'j'], ['ഡ', 'da', 'd', 'hard d'],
      ['ഷ', 'sha', 'sh s'], ['ഹ', 'ha', 'h'],
    ] },
    { title: 'Joined · after a nasal', block: 'Joined', type: 'j', rows: [
      ['മ്പ', 'mba', 'mb mp'], ['ണ്ട', 'nda', 'nd nt'], ['ങ്ക', 'nka', 'nk ng'], ['ന്ത', 'ntha', 'nth nt nd'], ['ഞ്ച', 'ncha', 'nch nj nc'],
      ['ന്ദ', 'nda', 'nd'], ['ന്റ', 'nta', 'nt nd ndr'],
    ] },
    { title: 'അ എ ആ ഇ ഉ ഏ', block: 'Vowels', type: 'v', rows: [
      ['അ', 'a'], ['എ', 'e', 'e ye'], ['ആ', 'a', 'a aa', 'long a'], ['ഇ', 'i'], ['ഉ', 'u'], ['ഏ', 'e', 'e ye', 'long e'],
    ] },
    { title: 'Joined · more', block: 'Joined', type: 'j', rows: [
      ['ച്ച', 'cha', 'chch cch ch'], ['ഞ്ഞ', 'nja', 'nj nh ny nny'], ['ണ്ണ', 'nna', 'nn n'], ['ശ്ശ', 'ssa', 'ss ssh sh s'], ['മ്മ', 'mma', 'mm m'],
      ['യ്യ', 'yya', 'yy y'], ['പ്ര', 'pra', 'pr'], ['ത്ര', 'tra', 'tr thr'], ['ക്ഷ', 'ksha', 'ksh ks x'],
    ] },
    { title: 'ഒ ഓ ഐ ഊ ഈ ഋ ഔ', block: 'Vowels', type: 'v', rows: [
      ['ഒ', 'o'], ['ഓ', 'o', 'o', 'long o'], ['ഐ', 'ai', 'ai ei ay'], ['ഊ', 'u', 'u oo', 'long u'], ['ഈ', 'i', 'i ee', 'long i'], ['ഋ', 'ri', 'ri ru r'],
      ['ഔ', 'au', 'au ow ou'],
    ] },
    { title: 'ഭ ഖ ധ ഠ ഫ ഥ ഘ ഛ ഝ ഢ', block: 'Consonants', type: 'c', rows: [
      ['ഭ', 'bha', 'bh'], ['ഖ', 'kha', 'kh'], ['ധ', 'dha', 'dh'], ['ഠ', 'tha', 'th', 'hard th'], ['ഫ', 'pha', 'ph f'], ['ഥ', 'tha', 'th'], ['ഘ', 'gha', 'gh'],
      ['ഛ', 'chha', 'chh ch'], ['ഝ', 'jha', 'jh'], ['ഢ', 'dha', 'dh', 'hard dh'],
    ] },
  ],
  mixes: [
    ['Vowels and vowel marks', 'അ ആ ഇ ഈ ഉ ഊ ഋ എ ഏ ഐ ഒ ഓ ഔ ാ ി ീ ു ൂ ൃ െ േ ൈ ൊ ോ ൗ'],
    ['Lookalikes', 'ര റ ഠ ന ണ ത ശ ഗ പ ഫ ബ ഖ ഡ ധ ദ ഭ ച വ എ ഏ ഒ ഓ'],
    ['Joined letters', 'ക്ക ത്ത പ്പ ട്ട ന്ന ല്ല ങ്ങ ള്ള റ്റ മ്പ ണ്ട ങ്ക ന്ത ഞ്ച ന്ദ ന്റ ച്ച ഞ്ഞ ണ്ണ ശ്ശ മ്മ യ്യ പ്ര ത്ര ക്ഷ'],
    ['Consonants', 'ക പ ട ത ര മ ന ല വ ള റ ച യ ങ ണ ഴ ഞ ശ ഗ സ ബ ദ ജ ഡ ഷ ഹ ഭ ഖ ധ ഠ ഫ ഥ ഘ ഛ ഝ ഢ'],
  ],
  // The words of signs: none yet.
  words: { themes: [], mixes: [] },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ക":["കോട്ടക്കൽ","Kottakkal"],"പ":["കോമളപുരം","Komalapuram"],"ട":["കുടപ്പനക്കുന്ന്","Kudappanakunnu"],"ത":["തിരുവല്ല","Thiruvalla"],"ര":["മരട്","Maradu"],"മ":["മണ്ണാർക്കാട്","Mannarkkad"],"ന":["പനച്ചിക്കാട്","Panachikkad"],"ല":["വാഴക്കാല","Vazhakkala"],"ി":["കല്ലിയൂർ","Kalliyoor"],"ു":["പുനലൂർ","Punalur"],"ാ":["ആലങ്ങാട്","Alangad"],"ൂ":["തിരൂർ","Tirur"],"ോ":["കോട്ടയം","Kottayam"],"െ":["നെടുമങ്ങാട്","Nedumangad"],"ം":["കുന്നംകുളം","Kunnamkulam"],"ർ":["താനാളൂർ","Tanalur"],"ൽ":["പെരിന്തൽമണ്ണ","Perinthalmanna"],"ൻ":["നെയ്യാറ്റിൻകര","Neyyattinkara"],"ൾ":["എടപ്പാൾ","Edappal"],"വ":["വടകര","Vatakara"],"ള":["കായംകുളം","Kayamkulam"],"റ":["ചിറക്കൽ","Chirakkal"],"ച":["ചാലക്കുടി","Chalakudy"],"യ":["പിരായിരി","Pirayiri"],"ങ":["തിരൂരങ്ങാടി","Tirurangadi"],"ണ":["ചെറുവണ്ണൂർ","Cheruvannur"],"ഴ":["തൊടുപുഴ","Thodupuzha"],"ഞ":["മഞ്ചേരി","Manjeri"],"ക്ക":["പാലക്കാട്","Palakkad"],"ത്ത":["ചേർത്തല","Cherthala"],"പ്പ":["മലപ്പുറം","Malappuram"],"ട്ട":["വട്ടിയൂർക്കാവ്","Vattiyoorkavu"],"ന്ന":["മൂന്നാർ","Munnar"],"ല്ല":["കൊല്ലം","Kollam"],"ങ്ങ":["കൊടുങ്ങല്ലൂർ","Kodungallur"],"ള്ള":["പള്ളിച്ചൽ","Pallichal"],"റ്റ":["ആറ്റിങ്ങൽ","Attingal"],"േ":["വേങ്ങര","Vengara"],"ൊ":["പൊന്നാനി","Ponnani"],"ീ":["മലയിൻകീഴ്","Malayinkeezhu"],"ൃ":["തൃശ്ശൂർ","Thrissur"],"്":["മയ്യനാട്","Mayyanad"],"ശ":["തലശ്ശേരി","Thalassery"],"ഗ":["കോതമംഗലം","Kothamangalam"],"ദ":["നാദാപുരം","Nadapuram"],"മ്പ":["നിലമ്പൂർ","Nilambur"],"ണ്ട":["കൊയിലാണ്ടി","Koyilandy"],"ങ്ക":["അങ്കമാലി","Angamaly"],"ന്ത":["തിരുവനന്തപുരം","Thiruvananthapuram"],"ഞ്ച":["മാറഞ്ചേരി","Marancheri"],"അ":["അരൂർ","Aroor"],"എ":["എടപ്പാൾ","Edappal"],"ആ":["ആലപ്പുഴ","Alappuzha"],"ഉ":["ഉള്ളിയേരി","Ulliyeri"],"ഏ":["ഏറ്റുമാനൂർ","Ettumanoor"],"ച്ച":["കൊച്ചി","Kochi"],"ഞ്ഞ":["കാഞ്ഞങ്ങാട്","Kanhangad"],"ണ്ണ":["കണ്ണൂർ","Kannur"],"ശ്ശ":["ചങ്ങനാശ്ശേരി","Changanassery"],"മ്മ":["കുളത്തുമ്മൽ","Kulathummal"],"യ്യ":["പയ്യന്നൂർ","Payyanur"],"പ്ര":["നന്നമ്പ്ര","Nannambra"],"ഒ":["ഒറ്റപ്പാലം","Ottapalam"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
