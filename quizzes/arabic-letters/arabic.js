// Arabic: its letters, for the script quizzes (../shared/reading.js says how this is written). It is written from
// right to left in the Arab countries with Street View: Oman, the United Arab Emirates, Qatar, Jordan, Lebanon,
// Palestine, Israel (beside Hebrew), Iraq, Egypt and Tunisia.
// Sounds are spelled as Omani names are on the map and on its road signs, in the English way of writing them, which
// varies: ث th, ذ ض ظ all dh (Dhofar, Mudhaibi), ق q (Qurayyat), خ kh, غ gh, ع and the hamza mostly not at all (Ibri,
// Ibra) or as ', و w or u (Sur), ي y or i, ee (Seeb), ة ah (Salalah). The hard letters like the soft ones (ص s, ط t),
// ح and ه both h. Short vowels are not written: a typed name may put any of a i u e o after a consonant (`inherent`),
// and any consonant may be doubled, as it often is unwritten (Qurayyat), and as ال (the, al) doubles the letter
// after it where it is not spelled al (As Sib, Ar Rustaq); it is left out as often (Rustaq).
// A letter is joined to the ones beside it and takes another shape by its place in a word: each is asked in all of
// them, alone, at the start, in the middle and at the end (ـ stands for the letters beside it: بـ ـبـ ـب). Six of them
// (ا د ذ ر ز و) never join the letter after them, so they have two shapes. Signs write their numbers in Arabic digits.
// Two more languages write it on signs with letters of their own (`own`), each sounded as its Latin names are spelled
// on the same signs, short vowels unwritten as in Arabic:
//   Urdu      Jammu and Kashmir and Ladakh (India), in the Nastaliq hand (lang-quiz.css): the hard ٹ ڈ ڑ (t, d, r), ں (a nasal
//             n), ے (e at the end), ھ (the h of bh, ph: بھدرواہ Bhaderwah), پ چ گ, and its own forms of k, y and h
//             (ک ی ہ; ہ at the end is mostly a: سانبہ Samba).
//   Jawi      Malay in Arabic letters, on street and government signs in Malaysia (Kelantan, Terengganu…): ڤ p, ڠ ng,
//             چ c, ڬ and ݢ g, ڽ ny, ۏ v, and ق for the k that ends a syllable (ڤيرق Perak); its ي and و are mostly i and u (e and o).
// Their letters in the order of how often they are written in the names in Urdu (name:ur, Jammu and Kashmir and
// Ladakh: 559 names) and Jawi (name:ms-Arab, Malaysia: 859 names) on OpenStreetMap, counted October 2026.
// Words of signs are not in the table yet.
// (reading.js gives the letters of `own` no unwritten vowel after them: their spellings carry it, a i u e o)
const vowelled = typed => typed.split(' ').flatMap(t => [t, ...(t === '-' ? 'a i u e o' : 'a i u e o'.replace(/\w/g, v => t + v)).split(' ')]).join(' ');
var SCRIPT = {
  name: 'Arabic', script: 'arab', unicode: 'Arabic', faces: 3, inherent: 'a i u e o', carrier: 'ب',
  langs: {
    ar: { name: 'Arabic', where: 'Oman · United Arab Emirates · Qatar · Jordan · Lebanon · Palestine · Israel · Iraq · Egypt · Tunisia', at: 'OMN', label: 'Oman' },
    ur: { name: 'Urdu', where: 'Jammu and Kashmir · Ladakh', at: 'IND' },
    ms: { name: 'Malay (Jawi)', where: 'Malaysia', at: 'MYS' },
  },
  letters: [
    { title: 'ب ت ث ن ي', block: 'Letters', type: 'c', rows: [
      ['ب بـ ـبـ ـب', 'b', 'b bb'], ['ت تـ ـتـ ـت', 't', 't tt'], ['ث ثـ ـثـ ـث', 'th', 'th t s thth', 'or s, t'], ['ن نـ ـنـ ـن', 'n', 'n nn'],
      ['ي يـ ـيـ ـي', 'y', 'y yy i ee ie ey', 'or i, ee'],
    ] },
    { title: 'ج ح خ د ذ ر ز', block: 'Letters', type: 'c', rows: [
      ['ج جـ ـجـ ـج', 'j', 'j jj g', 'g in Egypt'], ['ح حـ ـحـ ـح', 'h', 'h hh', 'deep h'], ['خ خـ ـخـ ـخ', 'kh', 'kh k h'],
      ['د ـد', 'd', 'd dd', 'never joined to the next letter'], ['ذ ـذ', 'dh', 'dh th d z dhdh', 'never joined to the next letter'],
      ['ر ـر', 'r', 'r rr', 'never joined to the next letter'], ['ز ـز', 'z', 'z zz', 'never joined to the next letter'],
    ] },
    { title: 'س ش ص ض ط ظ', block: 'Letters', type: 'c', rows: [
      ['س سـ ـسـ ـس', 's', 's ss'], ['ش شـ ـشـ ـش', 'sh', 'sh shsh'], ['ص صـ ـصـ ـص', 's', 's ss', 'hard s'], ['ض ضـ ـضـ ـض', 'dh', 'dh d z dhdh', 'hard d'],
      ['ط طـ ـطـ ـط', 't', 't tt', 'hard t'], ['ظ ظـ ـظـ ـظ', 'dh', 'dh z d th dhdh', 'hard dh, or z'],
    ] },
    { title: 'ع غ ف ق ك ل م ه و', block: 'Letters', type: 'c', rows: [
      ['ع عـ ـعـ ـع', "'", '-', 'mostly not written'], ['غ غـ ـغـ ـغ', 'gh', 'gh g'], ['ف فـ ـفـ ـف', 'f', 'f ff'], ['ق قـ ـقـ ـق', 'q', 'q g k', 'or g, k'],
      ['ك كـ ـكـ ـك', 'k', 'k kk'], ['ل لـ ـلـ ـل', 'l', 'l ll'], ['م مـ ـمـ ـم', 'm', 'm mm'], ['ه هـ ـهـ ـه', 'h', 'h'],
      ['و ـو', 'w', 'w ww u o oo ou', 'or u, o; never joined to the next letter'],
    ] },
    { title: 'ا ة ى ء أ إ آ ؤ ئ', block: 'Alif and hamza', type: 'v', rows: [
      ['ا ـا', 'a', 'a aa', 'never joined to the next letter'], ['ة ـة', 'ah', 'ah a at h e eh', 'only at the end'], ['ى ـى', 'a', 'a aa i y e', 'only at the end'],
      ['ء', "'", '- a', 'mostly not written'], ['أ ـأ', 'a', 'a u o e -'], ['إ ـإ', 'i', 'i e'], ['آ ـآ', 'a', 'a aa', 'long a'], ['ؤ ـؤ', "'", 'u o w -'],
      ['ئ ئـ ـئـ ـئ', "'", 'i y e -'],
    ] },
    { title: 'ال لا', block: 'Joined', type: 'j', rows: [
      ['ال الـ', 'al', 'al el il ul a e -', 'the: often left out'], ['لا ـلا', 'la', 'la laa', 'ل and ا joined'],
    ] },
    { title: 'ّ َ ِ ُ ْ ً', block: 'Marks', type: 'm', plain: true, rows: [
      ['ّ', 'double', '- a i u e o', 'the letter doubled'], ['َ', 'a', 'a e', 'seldom written'], ['ِ', 'i', 'i e', 'seldom written'], ['ُ', 'u', 'u o', 'seldom written'],
      ['ْ', 'no vowel', '-', 'seldom written'], ['ً', 'an', 'an a -'],
    ] },
    { title: '٠ ١ ٢ ٣ ٤', block: 'Digits', type: 'd', rows: [['٠', '0', '0', 'a dot'], ['١', '1'], ['٢', '2'], ['٣', '3'], ['٤', '4']] },
    { title: '٥ ٦ ٧ ٨ ٩', block: 'Digits', type: 'd', rows: [['٥', '5', '5', 'a circle, not 0'], ['٦', '6'], ['٧', '7', '7', 'a V'], ['٨', '8', '8', 'an upside-down V'], ['٩', '9']] },
  ],
  mixes: [
    ['Digits', '٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩'],
    ['Dots', 'ب ت ث ن ي ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق'],
    ['Lookalikes', 'د ر ذ ز و ه ة ى ي ف ق ع غ ك ل'],
    ['Alphabet', 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'],
  ],
  // what Urdu and Jawi add or write another way
  own: {
    ur: { rows: [
      ['ی یـ ـیـ ـی', 'y', vowelled('y yy i ee e ey'), 'or i, ee'], ['ہ ہـ ـہـ ـہ', 'h', vowelled('h a e -'), 'a at the end'], ['ک کـ ـکـ ـک', 'k', vowelled('k kk')], ['پ پـ ـپـ ـپ', 'p', vowelled('p pp')],
      ['گ گـ ـگـ ـگ', 'g', vowelled('g gg')], ['ڈ ـڈ', 'd', vowelled('d dd'), 'hard d; never joined to the next letter'], ['ٹ ٹـ ـٹـ ـٹ', 't', vowelled('t tt'), 'hard t'],
      ['ھ ھـ ـھـ ـھ', 'h', vowelled('h'), 'the h of bh, ph, th'], ['ے ـے', 'e', vowelled('e ay ai i'), 'only at the end'], ['چ چـ ـچـ ـچ', 'ch', vowelled('ch c')],
      ['ڑ ـڑ', 'r', vowelled('r rr d'), 'flapped r; never joined to the next letter'], ['ں ـں', 'n', vowelled('n -'), 'nasal n; only at the end'],
    ] },
    ms: { rows: [
      ['و ـو', 'u', vowelled('u o w'), 'or o, w; never joined to the next letter'], ['ي يـ ـيـ ـي', 'i', vowelled('i e y ee'), 'or e, y'],
      ['ڤ ڤـ ـڤـ ـڤ', 'p', vowelled('p')], ['ڠ ڠـ ـڠـ ـڠ', 'ng', vowelled('ng')], ['ق قـ ـقـ ـق', 'k', vowelled('k q'), 'k at the end of a syllable'], ['ڬ ڬـ ـڬـ ـڬ', 'g', vowelled('g')],
      ['چ چـ ـچـ ـچ', 'c', vowelled('c ch')], ['ݢ ݢـ ـݢـ ـݢ', 'g', vowelled('g')], ['ۏ ـۏ', 'v', vowelled('v w'), 'never joined to the next letter'], ['ڽ ڽـ ـڽـ ـڽ', 'ny', vowelled('ny')],
    ] },
  },
  // The words of signs: none yet.
  words: { themes: [], mixes: [] },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ب":["إبراء","Ibra"],"ت":["الرستاق","Rustaq"],"ث":["ثمريت","Thumrait"],"ن":["شناص","Shinas"],"ي":["قريات","Qurayyat"],"ج":["النجدة","An Najdah"],"ح":["صحار","Sohar"],"خ":["الخابورة","Al Khaburah"],"د":["بدبد","Bidbid"],"ذ":["وذرف","Oudhref"],"ر":["صور","Sur"],"ز":["مازم","Mazim"],"س":["السيب","Seeb"],"ش":["بوشر","Bawshar"],"ص":["صحم","Saham"],"ض":["الرياض","Erriadh"],"ط":["تطاوين","Tataouine"],"ظ":["أبو ظبي","Abu Dhabi"],"ع":["عبري","Ibri"],"غ":["زغي","Zaghi"],"ف":["قفصة","Gafsa"],"ق":["السويق","Suwayq"],"ك":["مساكن","M'saken"],"ل":["ينقل","Yanqul"],"م":["البريمي","Al Buraimi"],"ه":["هيما","Haima"],"و":["لوى","Liwa"],"ا":["ميناء دبا","Mina Dibba"],"ة":["بدية","Bidiyah"],"ى":["نزوى","Nizwa"],"ء":["بهلاء","Bahla"],"أ":["أدم","Adam"],"إ":["إزكي","Izki"],"ئ":["سمائل","Samail"],"ال":["القابل","Al Qabil"],"لا":["صلالة","Salalah"],"ّ":["حفّة","Haffah"],"ی/y":["یاری پورہ","Yaripora"],"ہ/h":["لہہ","Leh"],"ک/k":["کولگام","Kulgam"],"پ/p":["پہلگام","Pahalgam"],"گ/g":["سری نگر","Srinagar"],"ڈ/d":["بڈگام","Badgam"],"ٹ/t":["کٹھوعہ","Kathua"],"ھ/h":["بھدرواہ","Bhaderwah"],"ے/e":["قاضی پورہ پتوشے","Qazipora Patushi"],"چ/ch":["چنانی","Chenani"],"ڑ/r":["کشتواڑ","Kishtwar"],"ں/n":["شوپیاں","Shopian"],"و/u":["كوالا كوبو بهارو","Kuala Kubu Bharu"],"ي/i":["ڤتاليڠ جاي","Petaling Jaya"],"ڤ/p":["امڤڠ جاي","Ampang Jaya"],"ڠ/ng":["كوالا كڠسر","Kuala Kangsar"],"ق/k":["بندر تون رازق","Bandar Tun Razak"],"ڬ/g":["كوالا ترڠڬانو","Kuala Terengganu"],"چ/c":["ڤوچوڠ","Puchong"],"ݢ/g":["باݢن داتوق","Bagan Datuk"],"ڽ/ny":["كمڤوڠ ڤڠكلن ڽيريه","Kampung Pengkalan Nyireh"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
