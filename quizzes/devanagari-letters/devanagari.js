// Devanagari: its letters and the words of the signs written in it, for the script quizzes (../shared/reading.js
// says how this is written). It is written by regions, not by countries: the states of India whose signs are in
// Hindi are one of them (a language area is never split up), Maharashtra writes Marathi, Nepal Nepali. Goa
// (Konkani) and Jammu write it too, and are not asked: no words of theirs are in the table yet.
// Sounds are spelled as Indian names are on the map (the Hunterian system, without marks): long and short vowels
// alike (आ is a, ई i), and the hard (retroflex) letters like the soft ones (ट and त both ta). A consonant carries
// an a, which a vowel mark replaces and ् takes off; at the end of a word it is mostly not spoken (कानपुर Kanpur).
// A word's reading is how it is said, in Hindi; Nepali keeps the a more often.
var SCRIPT = {
  name: 'Devanagari', script: 'deva', unicode: 'Devanagari', faces: 5, inherent: 'a', carrier: 'क',
  pick: ['Region', 'All regions'],
  langs: {
    hi: { name: 'Hindi', where: 'Hindi states', at: 'HIN' },
    mr: { name: 'Marathi', where: 'Maharashtra', at: 'MAH' },
    ne: { name: 'Nepali', where: 'Nepal', at: 'NEP' },
  },
  // Those regions on the map (tools/builds/languages draws them, from the districts of ../india-districts and the
  // world map): the states, districts and countries of each.
  regions: {
    HIN: { name: 'Hindi states', label: 'HI', states: 'UP MP BR JH CG RJ HR HP UK DL CH AN' },
    MAH: { name: 'Maharashtra', label: 'MH', states: 'MH' },
    NEP: { name: 'Nepal, Sikkim, Darjeeling', label: 'NP', places: 'NPL', states: 'SK', districts: 'WB-darjeeling WB-kalimpong' },
  },
  letters: [
    { title: 'अ आ इ ई उ ऊ', block: 'Vowels', type: 'v', rows: [
      ['अ', 'a'], ['आ', 'a', 'a aa', 'long a'], ['इ', 'i'], ['ई', 'i', 'i ee ii', 'long i'], ['उ', 'u'], ['ऊ', 'u', 'u oo uu', 'long u'],
    ] },
    { title: 'ऋ ए ऐ ओ औ ऑ', block: 'Vowels', type: 'v', rows: [
      ['ऋ', 'ri', 'ri ru r'], ['ए', 'e', 'e ay'], ['ऐ', 'ai', 'ai ei e ay'], ['ओ', 'o'], ['औ', 'au', 'au ou aw o'],
      ['ऑ', 'o', 'o aw au', 'o of English words'],
    ] },
    { title: 'क ख ग घ ङ', block: 'Consonants', type: 'c', rows: [['क', 'ka', 'k c q'], ['ख', 'kha', 'kh'], ['ग', 'ga', 'g'], ['घ', 'gha', 'gh'], ['ङ', 'nga', 'n ng']] },
    { title: 'च छ ज झ ञ', block: 'Consonants', type: 'c', rows: [['च', 'cha', 'ch c'], ['छ', 'chha', 'chh ch'], ['ज', 'ja', 'j z'], ['झ', 'jha', 'jh'], ['ञ', 'nya', 'n ny']] },
    { title: 'ट ठ ड ढ ण', block: 'Consonants', type: 'c', rows: [
      ['ट', 'ta', 't', 'hard t'], ['ठ', 'tha', 'th', 'hard th'], ['ड', 'da', 'd', 'hard d'], ['ढ', 'dha', 'dh', 'hard dh'], ['ण', 'na', 'n', 'hard n'],
    ] },
    { title: 'त थ द ध न', block: 'Consonants', type: 'c', rows: [['त', 'ta', 't'], ['थ', 'tha', 'th'], ['द', 'da', 'd'], ['ध', 'dha', 'dh'], ['न', 'na', 'n']] },
    { title: 'प फ ब भ म', block: 'Consonants', type: 'c', rows: [['प', 'pa', 'p'], ['फ', 'pha', 'ph f'], ['ब', 'ba', 'b'], ['भ', 'bha', 'bh'], ['म', 'ma', 'm']] },
    { title: 'य र ल व', block: 'Consonants', type: 'c', rows: [['य', 'ya', 'y i -'], ['र', 'ra', 'r'], ['ल', 'la', 'l'], ['व', 'va', 'v w']] },
    { title: 'श ष स ह ळ', block: 'Consonants', type: 'c', rows: [
      ['श', 'sha', 'sh s'], ['ष', 'sha', 'sh s'], ['स', 'sa', 's'], ['ह', 'ha', 'h'], ['ळ', 'la', 'l', 'Marathi: धुळे Dhule'],
    ] },
    { title: 'Dotted letters', block: 'Consonants', type: 'c', rows: [
      ['क़', 'qa', 'q k'], ['ख़', 'kha', 'kh'], ['ग़', 'gha', 'gh g'], ['ज़', 'za', 'z j'], ['फ़', 'fa', 'f ph'],
      ['ड़', 'ra', 'r d rh', 'flapped r'], ['ढ़', 'rha', 'rh dh r'],
    ] },
    { title: 'ा ि ी ु ू', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ा', 'a', 'a aa', 'long a'], ['ि', 'i', 'i', 'written before its letter'], ['ी', 'i', 'i ee ii', 'long i'], ['ु', 'u'], ['ू', 'u', 'u oo uu', 'long u'],
    ] },
    { title: 'ृ े ै ो ौ ॉ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ृ', 'ri', 'ri ru r'], ['े', 'e', 'e ay'], ['ै', 'ai', 'ai ei e ay'], ['ो', 'o'], ['ौ', 'au', 'au ou aw o'],
      ['ॉ', 'o', 'o aw au', 'o of English words'],
    ] },
    { title: 'ं ँ ः ्', block: 'Signs', type: 's', plain: true, rows: [
      ['ं', 'n, m', 'n m', 'nasal: n or m'], ['ँ', 'n, m', 'n - m', 'nasal'], ['ः', 'h', 'h -'], ['्', 'no a', '-', 'takes the a off'],
    ] },
    { title: 'Joined · new shapes', block: 'Joined', type: 'j', rows: [
      ['क्ष', 'ksha', 'ksh x kshh'], ['त्र', 'tra', 'tr'], ['ज्ञ', 'gya', 'gy gn jn dny'], ['श्र', 'shra', 'shr sr'], ['द्ध', 'ddha', 'ddh dh'],
      ['द्य', 'dya', 'dy'], ['द्व', 'dva', 'dv dw'], ['त्त', 'tta', 'tt t'], ['क्त', 'kta', 'kt'],
    ] },
    { title: 'Joined · with र', block: 'Joined', type: 'j', rows: [
      ['प्र', 'pra', 'pr'], ['क्र', 'kra', 'kr'], ['ग्र', 'gra', 'gr'], ['द्र', 'dra', 'dr'], ['ब्र', 'bra', 'br'], ['ट्र', 'tra', 'tr'],
      ['र्म', 'rma', 'rm', 'r before the letter: a hook on top'], ['र्क', 'rka', 'rk', 'r before the letter: a hook on top'],
    ] },
    { title: 'Joined · half letters', block: 'Joined', type: 'j', rows: [
      ['स्त', 'sta', 'st'], ['स्थ', 'stha', 'sth'], ['ष्ट', 'shta', 'sht st'], ['न्द', 'nda', 'nd'], ['न्न', 'nna', 'nn n'], ['म्ब', 'mba', 'mb'],
      ['ल्ल', 'lla', 'll l'], ['च्च', 'chcha', 'chch cch ch'], ['ह्म', 'hma', 'hm'],
    ] },
    { title: '० १ २ ३ ४', block: 'Digits', type: 'd', rows: [['०', '0'], ['१', '1'], ['२', '2'], ['३', '3'], ['४', '4']] },
    { title: '५ ६ ७ ८ ९', block: 'Digits', type: 'd', rows: [['५', '5'], ['६', '6'], ['७', '7'], ['८', '8'], ['९', '9']] },
  ],
  mixes: [
    ['Digits', '० १ २ ३ ४ ५ ६ ७ ८ ९'],
    ['Vowels and vowel marks', 'अ आ इ ई उ ऊ ऋ ए ऐ ओ औ ऑ ा ि ी ु ू ृ े ै ो ौ ॉ'],
    ['Lookalikes', 'घ ध भ म ब व ख र प ष ड ङ इ ई थ य ट ठ ढ द उ ऊ ए ऐ ओ औ'],
    ['Joined letters', 'क्ष त्र ज्ञ श्र द्ध द्य द्व त्त क्त प्र क्र ग्र द्र ब्र ट्र र्म र्क स्त स्थ ष्ट न्द न्न म्ब ल्ल च्च ह्म'],
    ['Consonants', 'क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह'],
  ],
  // A row per meaning: the Hindi states, Maharashtra (Marathi), Nepal (Nepali). 'word|reading'.
  words: {
    themes: [
      { title: 'Words you can guess', rows: [
        ['school', 'स्कूल|skul', 'स्कूल|skul', 'स्कुल|skul'], ['bank', 'बैंक|bank', 'बँक|bank', 'बैंक|bank'], ['hotel', 'होटल|hotal', 'हॉटेल|hotel', 'होटल|hotal'],
        ['road', 'रोड|rod', 'रोड|rod', 'रोड|rod'], ['police', 'पुलिस|pulis', 'पोलीस|polis', ''], ['station', 'स्टेशन|steshan', 'स्टेशन|steshan', ''],
        ['bus', 'बस|bas', 'बस|bas', 'बस|bas'], ['taxi', 'टैक्सी|taksi', 'टॅक्सी|taksi', 'ट्याक्सी|tyaksi'], ['college', 'कॉलेज|kolej', 'कॉलेज|kolej', 'कलेज|kalej'],
      ] },
      { title: 'Roads', rows: [
        ['road', 'सड़क|sarak', 'रस्ता|rasta', 'बाटो|bato'], ['road', 'मार्ग|marg', 'मार्ग|marg', 'मार्ग|marg'], ['lane', 'गली|gali', 'गल्ली|galli', 'गल्ली|galli'],
        ['square', 'चौक|chauk', 'चौक|chauk', 'चोक|chok'], ['bridge', 'पुल|pul', 'पूल|pul', 'पुल|pul'],
        ['highway', 'राजमार्ग|rajmarg', 'महामार्ग|mahamarg', 'राजमार्ग|rajmarg'], ['crossroads', 'चौराहा|chauraha', '', 'चौबाटो|chaubato'],
      ] },
      { title: 'Places', rows: [
        ['district', 'ज़िला|zila', 'जिल्हा|jilha', 'जिल्ला|jilla'], ['subdistrict', 'तहसील|tahsil', 'तालुका|taluka', ''], ['subdistrict', '', 'तहसील|tahsil', ''], ['village', 'गाँव|gaon', 'गाव|gav', 'गाउँ|gaun'],
        ['village', 'ग्राम|gram', '', ''], ['city', 'शहर|shahar', 'शहर|shahar', 'सहर|sahar'], ['town', 'नगर|nagar', 'नगर|nagar', 'नगर|nagar'],
        ['state', 'राज्य|rajya', 'राज्य|rajya', ''], ['province', 'प्रदेश|pradesh', '', 'प्रदेश|pradesh'],
        ['municipality', 'नगर पालिका|nagar palika', 'नगरपरिषद|nagarparishad', 'नगरपालिका|nagarpalika'], ['municipality', 'नगरपालिका|nagarpalika', 'नगरपालिका|nagarpalika', ''],
        ['municipality', 'नगर परिषद|nagar parishad', '', ''],
        ['city corporation', 'नगर निगम|nagar nigam', 'महानगरपालिका|mahanagarpalika', 'महानगरपालिका|mahanagarpalika'],
        ['rural municipality', '', '', 'गाउँपालिका|gaunpalika'], ['village council', 'ग्राम पंचायत|gram panchayat', 'ग्रामपंचायत|grampanchayat', ''],
        ['village council', 'ग्रामपंचायत|grampanchayat', 'ग्राम पंचायत|gram panchayat', ''],
        ['ward', '', '', 'वडा|wada'], ['police station', 'थाना|thana', 'पोलीस ठाणे|polis thane', ''], ['river', 'नदी|nadi', 'नदी|nadi', 'नदी|nadi'],
      ] },
      { title: 'Shops', rows: [
        ['shop', 'दुकान|dukan', 'दुकान|dukan', 'पसल|pasal'], ['groceries', 'किराना|kirana', 'किराणा|kirana', 'किराना|kirana'],
        ['pharmacy', 'दवाखाना|davakhana', 'दवाखाना|davakhana', 'औषधि पसल|aushadhi pasal'], ['market', 'बाज़ार|bazar', 'बाजार|bajar', 'बजार|bajar'], ['market', 'बाजार|bajar', '', ''],
        ['sweets', 'मिठाई|mithai', 'मिठाई|mithai', 'मिठाई|mithai'], ['clothes', 'कपड़े|kapre', 'कपडे|kapde', 'कपडा|kapada'], ['clothes', '', 'कपडा|kapda', ''], ['tea', 'चाय|chay', 'चहा|chaha', 'चिया|chiya'],
        ['roadside eatery', 'ढाबा|dhaba', 'ढाबा|dhaba', ''], ['store', 'भंडार|bhandar', 'भांडार|bhandar', 'भण्डार|bhandar'], ['store', 'भण्डार|bhandar', '', ''],
      ] },
      { title: 'Services', rows: [
        ['school', 'विद्यालय|vidyalay', 'विद्यालय|vidyalay', 'विद्यालय|vidyalay'], ['school', '', 'शाळा|shala', ''], ['hospital', 'अस्पताल|aspatal', 'रुग्णालय|rugnalay', 'अस्पताल|aspatal'],
        ['temple', 'मंदिर|mandir', 'मंदिर|mandir', 'मन्दिर|mandir'], ['temple', 'मन्दिर|mandir', '', ''], ['mosque', 'मस्जिद|masjid', 'मशीद|mashid', 'मस्जिद|masjid'], ['mosque', '', 'मस्जिद|masjid', ''],
        ['post office', 'डाकघर|dakghar', 'टपाल कार्यालय|tapal karyalay', 'हुलाक|hulak'], ['office', 'कार्यालय|karyalay', 'कार्यालय|karyalay', 'कार्यालय|karyalay'],
        ['council', 'पंचायत|panchayat', 'पंचायत|panchayat', ''], ['police', '', '', 'प्रहरी|prahari'],
        ['bus stand', 'बस अड्डा|bas adda', 'बस स्थानक|bas sthanak', 'बसपार्क|baspark'], ['toilet', 'शौचालय|shauchalay', 'शौचालय|shauchalay', 'शौचालय|shauchalay'],
        ['toilet', '', 'स्वच्छतागृह|svachchhatagruh', ''],
      ] },
      { title: 'Notices', rows: [
        ['welcome', 'स्वागत|svagat', 'स्वागत|svagat', 'स्वागतम्|swagatam'], ['welcome', 'सुस्वागतम्|susvagatam', 'सुस्वागतम्|susvagatam', ''], ['thank you', 'धन्यवाद|dhanyavad', 'धन्यवाद|dhanyavad', 'धन्यवाद|dhanyavad'],
        ['caution', 'सावधान|savdhan', 'सावधान|savdhan', 'सावधान|savdhan'], ['go slowly', 'धीरे चलें|dhire chalen', 'सावकाश चालवा|savkash chalva', 'बिस्तारै जानुहोस्|bistarai januhos'],
        ['entry', 'प्रवेश|pravesh', 'प्रवेश|pravesh', 'प्रवेश|pravesh'], ['exit', 'निकास|nikas', 'बाहेर|baher', 'निकास|nikas'], ['open', 'खुला|khula', 'उघडे|ughde', 'खुला|khula'],
        ['closed', 'बंद|band', 'बंद|band', 'बन्द|band'], ['closed', 'बन्द|band', '', ''], ['for sale', 'बिकाऊ|bikau', 'विकणे आहे|vikne ahe', 'बिक्रीमा|bikrima'],
        ['notice', 'सूचना|suchna', 'सूचना|suchna', 'सूचना|suchna'],
      ] },
      { title: 'Directions', rows: [
        ['north', 'उत्तर|uttar', 'उत्तर|uttar', 'उत्तर|uttar'], ['south', 'दक्षिण|dakshin', 'दक्षिण|dakshin', 'दक्षिण|dakshin'], ['east', 'पूर्व|purv', 'पूर्व|purv', 'पूर्व|purv'],
        ['west', 'पश्चिम|pashchim', 'पश्चिम|pashchim', 'पश्चिम|pashchim'], ['new', 'नया|naya', 'नवी|navi', 'नयाँ|naya'], ['new', 'नवीन|navin', 'नवीन|navin', ''], ['old', 'पुराना|purana', 'जुना|juna', 'पुरानो|purano'],
        ['km', 'किमी|kimi', 'किमी|kimi', 'किमि|kimi'],
      ] },
    ],
    mixes: [
      ['Addresses', ['Roads', 'Places', 'Directions']],
      ['Shop fronts', ['Words you can guess', 'Shops', 'Services', 'Notices']],
    ],
  },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"अ":["अलीगढ़","Aligarh"],"आ":["आगरा","Agra"],"इ":["इचलकरंजी","Ichalkaranji"],"ई":["मुंबई","Mumbai"],"उ":["उल्हासनगर","Ulhasnagar"],"ऊ":["मऊ","Mau"],"क":["कानपुर","Kanpur"],"ख":["गोरखपुर","Gorakhpur"],"ग":["सांगली","Sangli"],"च":["पिंपरी चिंचवड","Pimpri-Chinchwad"],"छ":["छत्रपती संभाजीनगर","Chhatrapati Sambhajinagar"],"ज":["जयपुर","Jaipur"],"झ":["झाँसी","Jhansi"],"ट":["पटना","Patna"],"ठ":["ठाणे","Thane"],"ड":["डोंबिवली","Dombivli"],"ण":["पुणे","Pune"],"त":["अमरावती","Amravati"],"थ":["मथुरा","Mathura"],"द":["नांदेड","Nanded"],"ध":["धनबाद","Dhanbad"],"न":["बीकानेर","Bikaner"],"प":["सहारनपुर","Saharanpur"],"फ":["फरीदाबाद","Faridabad"],"ब":["जबलपुर","Jabalpur"],"भ":["भोपाल","Bhopal"],"म":["अजमेर","Ajmer"],"य":["कल्याण","Kalyan"],"र":["बोकारो","Bokaro"],"ल":["सोलापूर","Solapur"],"व":["वसई-विरार","Vasai-Virar"],"श":["नाशिक","Nashik"],"स":["वाराणसी","Varanasi"],"ह":["कोल्हापूर","Kolhapur"],"ळ":["धुळे","Dhule"],"ख़":["फ़र्रूख़ाबाद","Farrukhabad"],"ज़":["मुज़फ़्फ़र नगर","Muzaffarnagar"],"फ़":["फ़िरोज़ाबाद","Firozabad"],"ड़":["भीलवाड़ा","Bhilwara"],"ढ़":["चण्डीगढ़","Chandigarh"],"ा":["कोटा","Kota"],"ि":["भिलाई","Bhilai"],"ी":["लोनी","Loni"],"ु":["रायपुर","Raipur"],"ू":["नागपूर","Nagpur"],"े":["जमशेदपुर","Jamshedpur"],"ै":["उज्जैन","Ujjain"],"ो":["जोधपुर","Jodhpur"],"ं":["भिवंडी","Bhiwandi"],"ँ":["राँची","Ranchi"],"्":["अहिल्यानगर","Ahilyanagar"],"त्र":["छत्रपती संभाजीनगर","Chhatrapati Sambhajinagar"],"श्र":["श्रीगंगानगर","Sri Ganganagar"],"प्र":["प्रयागराज","Prayagraj"],"ग्र":["गुरुग्राम","Gurugram"],"द्र":["चंद्रपूर","Chandrapur"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
