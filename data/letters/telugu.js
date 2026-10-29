// Telugu: its letters, for the script quizzes (../shared/reading.js says how this is written). It is written in Andhra
// Pradesh and Telangana, whose road signs carry each name in Telugu, English and often Hindi.
// Sounds are spelled as names are on Indian signs and maps (the Hunterian system, without marks): long and short
// vowels alike (ఆ is a, ఈ i), the hard letters like the soft ones (ట and త both t, డ and ద both d, ణ n, ళ l), త
// often th (కొత్తగూడెం Kothagudem), వ v or w (వరంగల్ Warangal), ఎ and ఏ often ye at the start of a name
// (ఎమ్మిగనూరు Yemmiganur), ఒ ఓ and ఉ ఊ often vo and vu (ఉయ్యూరు Vuyyuru). A consonant carries an a, which a vowel mark replaces and ్ takes off; a joined letter is
// the second consonant written small under or beside the first. Telugu names end in a vowel that signs and maps
// often leave off: -u (గుంటూరు Guntur, కర్నూలు Kurnool) and -am (అనంతపురం Anantapur). Common endings and
// their spellings: -పేట -pet or -peta, -పల్లి and -పల్లె -palli, -palle or -pally, -పురం -puram or -pur, -గూడెం -gudem,
// -పాడు -padu, -పట్నం -patnam, -వరం -varam.
// Letters and joined letters come in the order of how often they are written in the names of the two states' towns
// and villages (Wikidata labels and OpenStreetMap names in Telugu), the most frequent first. Digits are not taught:
// signs write 0–9. Words of signs are not in the table yet.
var SCRIPT = {
  name: 'Telugu', script: 'telu', unicode: 'Telugu', faces: 4, inherent: 'a', carrier: 'క',
  langs: { te: { name: 'Telugu', where: 'Andhra Pradesh · Telangana', at: 'IND', label: 'Andhra Pradesh, Telangana' } },
  letters: [
    { title: 'ర ల ప క డ గ మ న', block: 'Consonants', type: 'c', rows: [
      ['ర', 'ra', 'r'], ['ల', 'la', 'l'], ['ప', 'pa', 'p'], ['క', 'ka', 'k c'], ['డ', 'da', 'd', 'hard d'], ['గ', 'ga', 'g'], ['మ', 'ma', 'm'], ['న', 'na', 'n'],
    ] },
    { title: 'ు ి ా ె ూ ొ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ు', 'u', 'u -', 'often left off at the end of a name'], ['ి', 'i', 'i y'], ['ా', 'a', 'a aa', 'long a'], ['ె', 'e'], ['ూ', 'u', 'u oo', 'long u'], ['ొ', 'o'],
    ] },
    { title: 'ం ః', block: 'Signs', type: 's', plain: true, rows: [
      ['ం', 'n, m', 'm n ng -', 'm at the end of a word, often left off'], ['ః', 'h', 'h -'],
    ] },
    { title: 'వ ద ట త స బ చ య జ', block: 'Consonants', type: 'c', rows: [
      ['వ', 'va', 'v w', 'or wa'], ['ద', 'da', 'd'], ['ట', 'ta', 't', 'hard t'], ['త', 'ta', 't th', 'often tha'], ['స', 'sa', 's'], ['బ', 'ba', 'b'],
      ['చ', 'cha', 'ch c'], ['య', 'ya', 'y'], ['జ', 'ja', 'j z'],
    ] },
    { title: 'ే ో ీ ై ౌ ృ ్', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ే', 'e', 'e', 'long e'], ['ో', 'o', 'o', 'long o'], ['ీ', 'i', 'i ee', 'long i'], ['ై', 'ai', 'ai y ei ay'], ['ౌ', 'au', 'au ow ou'],
      ['ృ', 'ri', 'ri ru r'], ['్', 'no a', '-', 'takes the vowel off'],
    ] },
    { title: 'Joined · doubled', block: 'Joined', type: 'j', rows: [
      ['ల్ల', 'lla', 'll l'], ['న్న', 'nna', 'nn n'], ['ట్ట', 'tta', 'tt t'], ['త్త', 'tta', 'tt th t tth'], ['ద్ద', 'dda', 'dd d'], ['మ్మ', 'mma', 'mm m'],
      ['డ్డ', 'dda', 'dd d'], ['ప్ప', 'ppa', 'pp p'], ['ర్ర', 'rra', 'rr r'],
    ] },
    { title: 'హ ళ శ భ ణ ష ధ ఖ', block: 'Consonants', type: 'c', rows: [
      ['హ', 'ha', 'h'], ['ళ', 'la', 'l', 'hard l'], ['శ', 'sha', 'sh s'], ['భ', 'bha', 'bh'], ['ణ', 'na', 'n', 'hard n'], ['ష', 'sha', 'sh s'],
      ['ధ', 'dha', 'dh'], ['ఖ', 'kha', 'kh'],
    ] },
    { title: 'అ ఎ ఉ ఆ ఇ ఏ', block: 'Vowels', type: 'v', rows: [
      ['అ', 'a'], ['ఎ', 'e', 'e ye', 'often ye at the start'], ['ఉ', 'u', 'u vu', 'often vu at the start'], ['ఆ', 'a', 'a aa', 'long a'], ['ఇ', 'i'], ['ఏ', 'e', 'e ye', 'long e, often ye at the start'],
    ] },
    { title: 'Joined · with ర and ల', block: 'Joined', type: 'j', rows: [
      ['ర్ల', 'rla', 'rl'], ['ద్ర', 'dra', 'dr'], ['ట్ల', 'tla', 'tl'], ['డ్ర', 'dra', 'dr'], ['ళ్ల', 'lla', 'll l'], ['డ్ల', 'dla', 'dl'],
      ['గ్ర', 'gra', 'gr'], ['త్ర', 'tra', 'tr thr'], ['ప్ర', 'pra', 'pr'],
    ] },
    { title: 'ఓ ఒ ఈ ఊ ఐ ఔ ఋ', block: 'Vowels', type: 'v', rows: [
      ['ఓ', 'o', 'o vo', 'long o, often vo at the start'], ['ఒ', 'o', 'o vo', 'often vo at the start'], ['ఈ', 'i', 'i ee', 'long i'], ['ఊ', 'u', 'u oo vu', 'long u'], ['ఐ', 'ai', 'ai ei ay'], ['ఔ', 'au', 'au ow ou'],
      ['ఋ', 'ri', 'ri ru r'],
    ] },
    { title: 'ఘ ఫ థ ఠ ఛ ఞ ఢ ఝ ఙ', block: 'Consonants', type: 'c', rows: [
      ['ఘ', 'gha', 'gh'], ['ఫ', 'pha', 'ph f'], ['థ', 'tha', 'th'], ['ఠ', 'tha', 'th', 'hard th'], ['ఛ', 'chha', 'chh ch'], ['ఞ', 'nya', 'ny n gn'],
      ['ఢ', 'dha', 'dh', 'hard dh'], ['ఝ', 'jha', 'jh'], ['ఙ', 'nga', 'ng n'],
    ] },
    { title: 'Joined · more', block: 'Joined', type: 'j', rows: [
      ['క్క', 'kka', 'kk k'], ['య్య', 'yya', 'yy y'], ['ర్త', 'rta', 'rt rth'], ['ళ్ళ', 'lla', 'll l'], ['చ్చ', 'chcha', 'chch cch ch'], ['బ్బ', 'bba', 'bb b'],
      ['క్ష', 'ksha', 'ksh ks x'], ['ట్న', 'tna', 'tn'], ['శ్ర', 'sra', 'sr shr', 'శ్రీ Sri'],
    ] },
  ],
  mixes: [
    ['Vowels and vowel marks', 'అ ఆ ఇ ఈ ఉ ఊ ఋ ఎ ఏ ఐ ఒ ఓ ఔ ా ి ీ ు ూ ృ ె ే ై ొ ో ౌ'],
    ['Lookalikes', 'ప ఫ ష వ న స బ భ ద ధ థ డ ఢ చ ఛ ఠ ర ఎ ఏ ఒ ఓ ఇ ఐ'],
    ['Joined letters', 'ల్ల న్న ట్ట త్త ద్ద మ్మ డ్డ ప్ప ర్ర ర్ల ద్ర ట్ల డ్ర ళ్ల డ్ల గ్ర త్ర ప్ర క్క య్య ర్త ళ్ళ చ్చ బ్బ క్ష ట్న శ్ర'],
    ['Consonants', 'ర ల ప క డ గ మ న వ ద ట త స బ చ య జ హ ళ శ భ ణ ష ధ ఖ ఘ ఫ థ ఠ ఛ ఞ ఢ ఝ ఙ'],
  ],
  // The words of signs: none yet.
  words: { themes: [], mixes: [] },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ర":["కదిరి","Kadiri"],"ల":["చీరాల","Chirala"],"ప":["కడప","Kadapa"],"క":["కాకినాడ","Kakinada"],"డ":["రామగుండం","Ramagundam"],"గ":["వరంగల్","Warangal"],"మ":["మిర్యాలగూడ","Miryalaguda"],"న":["నంద్యాల","Nandyal"],"ు":["గుంతకల్లు","Guntakal"],"ి":["అమరావతి","Amaravati"],"ా":["కావలి","Kavali"],"ె":["తెనాలి","Tenali"],"ూ":["హిందూపురం","Hindupur"],"ొ":["నల్గొండ","Nalgonda"],"ం":["కొత్తగూడెం","Kothagudem"],"వ":["గుడివాడ","Gudivada"],"ద":["ఆదిలాబాద్","Adilabad"],"ట":["గుంటూరు","Guntur"],"త":["తిరుపతి","Tirupati"],"స":["సూర్యాపేట","Suryapet"],"బ":["నిజామాబాదు","Nizamabad"],"చ":["చిలకలూరిపేట","Chilakaluripet"],"య":["విజయవాడ","Vijayawada"],"జ":["రాజంపేట","Rajampet"],"ే":["తాడేపల్లిగూడెం","Tadepalligudem"],"ో":["రాయచోటి","Rayachoti"],"ీ":["కరీంనగర్","Karimnagar"],"్":["నిర్మల్","Nirmal"],"ల్ల":["మదనపల్లె","Madanapalle"],"న్న":["పొన్నూరు","Ponnur"],"త్త":["చిత్తూరు","Chittoor"],"ద్ద":["సిద్దిపేట","Siddipet"],"మ్మ":["ఖమ్మం","Khammam"],"డ్డ":["కామారెడ్డి","Kamareddy"],"ర్ర":["మందమర్రి","Mandamarri"],"హ":["మహబూబ్ నగర్","Mahabubnagar"],"ళ":["మంగళగిరి","Mangalagiri"],"శ":["శ్రీకాళహస్తి","Srikalahasti"],"భ":["భీమవరం","Bhimavaram"],"ణ":["తణుకు","Tanuku"],"ధ":["ధర్మవరం","Dharmavaram"],"ఖ":["విశాఖపట్నం","Visakhapatnam"],"అ":["అనంతపురం","Anantapur"],"ఎ":["ఎమ్మిగనూరు","Yemmiganur"],"ఆ":["ఆదోని","Adoni"],"ఏ":["ఏలూరు","Eluru"],"ర్ల":["సామర్లకోట","Samarlakota"],"ద్ర":["రాజమహేంద్రవరం","Rajamahendravaram"],"ట్ల":["బాపట్ల","Bapatla"],"ళ్ల":["పిడుగురాళ్ల","Piduguralla"],"త్ర":["తాడిపత్రి","Tadipatri"],"ఠ":["పిఠాపురం","Pithapuram"],"ర్త":["వనపర్తి","Wanaparthy"],"బ్బ":["బొబ్బిలి","Bobbili"],"ట్న":["మచిలీపట్నం","Machilipatnam"],"శ్ర":["శ్రీకాకుళం","Srikakulam"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
