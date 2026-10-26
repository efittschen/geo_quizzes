// Hebrew: its letters, and the words of its signs, for the script quizzes (../shared/reading.js says how this is
// written). It is written from right to left in Israel, the only country that writes it.
//
// Sounds are spelled as Israeli names are in Latin letters on the map and on road signs: the transliteration of the
// Central Bureau of Statistics (its list of localities), the Academy of the Hebrew Language's older rules: ק q (Qiryat
// Gat), צ z (Zefat), ח h like ה (Holon), ו w as a consonant (Petah Tiqwa), כ kh after a vowel (Zikhron), א and ע
// ' inside a word and else not at all (Be'er Sheva, Giv'at; Afula), and a letter said twice spelled twice (Herzliyya,
// Ra'annana). The vowels are not written: a typed name may put any of a e i o u after a letter (`inherent`), and
// ו and י stand for some of them (ו o or u, י i, or e in בית Bet). ב כ פ are b k p at the start of a word and mostly
// v kh f inside it; ש is sh, or s. Five letters have another shape at the end of a word (ך ם ן ף ץ). A geresh (׳, on
// signs often ') after ג ז צ makes j, zh, ch of them, after ח and ע the kh and gh of Arabic names (Sakhnin, Ghajar).
// Letters by how often they occur in Israel's place names (GeoNames, the CBS list: י ר ו ה א ב ת ל מ ע נ ש ד כ ג ק
// פ ח ס צ ז ט), in rounds of seven or eight, then the final forms and the letters with a geresh.
var SCRIPT = {
  name: 'Hebrew', script: 'hebr', unicode: 'Hebrew', faces: 4, inherent: 'a e i o u',
  langs: { he: { name: 'Hebrew', where: 'Israel', at: 'ISR' } },
  letters: [
    { title: 'י ר ו ה א ב ת', type: 'c', rows: [
      ['י', 'y/i', 'y i e yy ei ai -', 'a vowel letter: i, e'], ['ר', 'r', 'r rr'], ['ו', 'o/u', 'o u w v ww vv -', 'a vowel letter · w (v) as a consonant'],
      ['ה', 'h', 'h hh -', 'at the end of a word: a vowel, not spelled'], ['א', "'", '-', "silent, or ' inside a word"],
      ['ב', 'b/v', 'b v bb vv', 'b at the start of a word'], ['ת', 't', 't tt'],
    ] },
    { title: 'ל מ ע נ ש ד כ', type: 'c', rows: [
      ['ל', 'l', 'l ll'], ['מ', 'm', 'm mm'], ['ע', "'", '- gh', "silent, or ' inside a word"], ['נ', 'n', 'n nn'],
      ['ש', 'sh/s', 'sh s ss', 's in some words: שדה Sede'], ['ד', 'd', 'd dd'], ['כ', 'k/kh', 'k kh kk ch', 'k at the start of a word'],
    ] },
    { title: 'ג ק פ ח ס צ ז ט', type: 'c', rows: [
      ['ג', 'g', 'g gg gh'], ['ק', 'q', 'q k qq kk', 'said k'], ['פ', 'p/f', 'p f pp ff ph', 'p at the start of a word'], ['ח', 'h', 'h kh ch hh', 'kh, in the throat'],
      ['ס', 's', 's ss'], ['צ', 'z', 'z ts tz zz s', 'said ts'], ['ז', 'z', 'z zz'], ['ט', 't', 't tt'],
    ] },
    { title: 'Final forms', type: 'c', rows: [
      ['ן', 'n', 'n nn', 'נ at the end of a word'], ['ם', 'm', 'm mm', 'מ at the end of a word'], ['ף', 'f', 'f ff p', 'פ at the end of a word'],
      ['ץ', 'z', 'z ts tz', 'צ at the end of a word · said ts'], ['ך', 'kh', 'kh k ch', 'כ at the end of a word'],
    ] },
    { title: 'With a geresh', type: 'c', rows: [
      ["ג׳ ג'", 'j', 'j dj g', 'ג with a geresh'], ["ח׳ ח'", 'kh', 'kh h', 'ח with a geresh · in Arabic names'], ["ז׳ ז'", 'zh', 'zh j z', 'ז with a geresh'],
      ["צ׳ צ'", 'ch', 'ch tsh tch', 'צ with a geresh'], ["ע׳ ע'", 'gh', 'gh g', 'ע with a geresh · in Arabic names'],
    ] },
  ],
  mixes: [
    ['Two sounds', 'ב כ פ ש ו י'],
    ['Lookalikes', 'ב כ ג נ ד ר ך ף ה ח ת ק ו ז ן י ט ס ם מ ע צ ץ'],
    ['Alphabet', 'א ב ג ד ה ו ז ח ט י כ ל מ נ ס ע פ צ ק ר ש ת'],
  ],
  // A row per meaning: the word on Israeli signs, with its reading in the letters of the map (CBS).
  words: {
    themes: [
      { title: 'Roads', rows: [
        ['street', 'רחוב|rehov'], ['boulevard', 'שדרות|sederot'], ['square', 'כיכר|kikkar'], ['road', 'דרך|derekh'], ['highway', 'כביש|kevish'],
        ['junction', 'צומת|zomet'], ['interchange', 'מחלף|mehlaf'], ['bridge', 'גשר|gesher'],
      ] },
      { title: 'In names', rows: [
        ['town', "קריית|qiryat"], ['heights', 'רמת|ramat'], ['hill', "גבעת|giv'at"], ['house', 'בית|bet'], ['village', 'כפר|kefar'],
        ['spring', 'עין|en'], ['abode', 'נווה|newe'], ['mound', 'תל|tel'], ['well', "באר|be'er"], ['tower', 'מגדל|migdal'],
        ['ascent', "מעלה|ma'ale"], ['lookout', 'מצפה|mizpe'],
      ] },
      { title: 'Places', rows: [
        ['centre', 'מרכז|merkaz'], ['hospital', 'בית חולים|bet holim'], ['school', 'בית ספר|bet sefer'], ['police', 'משטרה|mishtara'],
        ['station', 'תחנה|tahana'], ['port', 'נמל|namal'], ['beach', 'חוף|hof'], ['synagogue', 'בית כנסת|bet keneset'],
      ] },
      { title: 'Shops', rows: [
        ['pharmacy', 'בית מרקחת|bet merqahat'], ['grocery', 'מכולת|makkolet'], ['bakery', "מאפייה|ma'afiyya"], ['restaurant', "מסעדה|mis'ada"],
        ['hotel', 'מלון|malon'], ['petrol station', 'תחנת דלק|tahanat deleq'], ['market', 'שוק|shuq'],
      ] },
      { title: 'Notices', rows: [
        ['entrance', 'כניסה|kenisa'], ['exit', "יציאה|yezi'a"], ['open', 'פתוח|patuah'], ['closed', 'סגור|sagur'], ['stop', 'עצור|azor'],
        ['no entry', 'אין כניסה|en kenisa'], ['caution', 'זהירות|zehirut'], ['parking', 'חניה|hanaya'],
      ] },
    ],
    mixes: [
      ['Addresses', ['Roads', 'In names']],
      ['Shop fronts', ['Places', 'Shops', 'Notices']],
    ],
  },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"י":["קריית גת","Qiryat Gat"],"ר":["רמלה","Ramla"],"ו":["רחובות","Rehovot"],"ה":["הרצלייה","Herzliyya"],"א":["ראש העין","Rosh HaAyin"],"ב":["מודיעין-מכבים-רעות","Modi'in-Makkabbim-Re'ut"],"ת":["תל אביב-יפו","Tel Aviv-Yafo"],"ל":["אשקלון","Ashqelon"],"מ":["בית שמש","Bet Shemesh"],"ע":["באר שבע","Be'er Sheva"],"נ":["נתניה","Netanya"],"ש":["אשדוד","Ashdod"],"ד":["חדרה","Hadera"],"כ":["כפר סבא","Kefar Sava"],"ג":["רמת גן","Ramat Gan"],"ק":["בני ברק","Bene Beraq"],"פ":["פתח תקווה","Petah Tiqwa"],"ח":["חיפה","Haifa"],"ס":["נס ציונה","Nes Ziyyona"],"צ":["ראשון לציון","Rishon LeZiyyon"],"ז":["זכרון יעקב","Zikhron Ya'aqov"],"ט":["רהט","Rahat"],"ן":["חולון","Holon"],"ם":["בת ים","Bat Yam"],"ף":["נוף הגליל","Nof HaGalil"],"ג׳":["ג'דיידה-מכר","Judeide-Maker"],"ח׳":["סח'נין","Sakhnin"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
