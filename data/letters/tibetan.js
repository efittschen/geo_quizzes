// Tibetan: its letters as Bhutan reads them, for the script quizzes (../shared/reading.js says how this is written).
// It is the script of Dzongkha, Bhutan's language, and is written in Ladakh and Sikkim (India) too.
// Sounds are spelled as Bhutan spells its place names on its signs and maps (not the stricter Roman Dzongkha): Thimphu,
// Paro, Punakha, Trongsa, Wangdue Phodrang. ཅ is ch and ཆ chh (Chhukha), ཚ tsh (Pemagatshel), ཞ zh (Zhemgang). A
// syllable ends in ་ and is one main letter with what is written around it: a vowel mark over or under it (ི ུ ེ ོ;
// without one it is read a), ཡ ར ལ under it (read after it: ཀྱ ky; ཝ there is silent), a letter over it (ར ལ ས: silent,
// the main letter written small beneath: རྩེ tse, སྒར gar), one before it (ག ད བ མ འ: silent, དགེ ge, and དབ is w: དབང wang) and one or
// two after it (ག ང ད ན བ མ འ ར ལ ས): ང ན མ ལ are read, ར often not, ག and བ as k and p or not at all, ད ས འ not; ད ན ལ ས
// turn a, u, o into e, ue, oe (ཚལ tshel, འདུས due, ཆོས choe). ཡ ར ལ under a letter make another sound of it: བྱ bj
// (Bjoka; j in Jakar), ཀྲ tr (Trongsa), བྲ dr (Phodrang), གླ l (Phuentsholing). A typed name may put a or e after any letter.
// Letters in the order of how often they are written in Bhutan's names (districts, gewogs and towns: Wikidata and
// OpenStreetMap, counted October 2026), the most frequent first. Sikkim reads its names as Bhutan does; Ladakh says many
// of the silent letters (བདེ་སྐྱིད Diskit, དཔེ་ཐུབ Spituk), which is not asked here.
// Words of signs are not in the table yet.
var SCRIPT = {
  name: 'Tibetan', script: 'tibt', unicode: 'Tibetan', faces: 2, inherent: 'a e ae ay ey', carrier: 'ཨ',
  langs: { dz: { name: 'Dzongkha', where: 'Bhutan', at: 'BTN' } },
  letters: [
    { title: 'ས ང ར ག མ ད བ ན', block: 'Consonants', type: 'c', rows: [
      ['ས', 'sa', 's -', 'silent over a letter and at the end'], ['ང', 'nga', 'ng n'], ['ར', 'ra', 'r -', 'silent over a letter, often at the end'],
      ['ག', 'ga', 'g k -', 'silent before a letter, often at the end'], ['མ', 'ma', 'm -', 'silent before a letter'],
      ['ད', 'da', 'd -', 'silent before a letter and at the end'], ['བ', 'ba', 'b p w -', 'silent before a letter; དབ is w'], ['ན', 'na', 'n'],
    ] },
    { title: 'ལ ཁ ཕ འ ཀ ཆ ཐ ཚ', block: 'Consonants', type: 'c', rows: [
      ['ལ', 'la', 'l -', 'silent over a letter'], ['ཁ', 'kha', 'kh k'], ['ཕ', 'pha', 'ph p f'], ['འ', 'silent', '- a', 'mostly not read'], ['ཀ', 'ka', 'k g'],
      ['ཆ', 'chha', 'chh ch'], ['ཐ', 'tha', 'th t'], ['ཚ', 'tsha', 'tsh ts'],
    ] },
    { title: 'ཤ པ ཡ ཧ ཛ ཨ ཙ', block: 'Consonants', type: 'c', rows: [
      ['ཤ', 'sha', 'sh'], ['པ', 'pa', 'p'], ['ཡ', 'ya', 'y'], ['ཧ', 'ha', 'h'], ['ཛ', 'dza', 'dz z'], ['ཨ', 'a', '-', 'carries a vowel'], ['ཙ', 'tsa', 'ts'],
    ] },
    { title: 'ཞ ཅ ཟ ཇ ཝ ཏ ཉ', block: 'Consonants', type: 'c', rows: [
      ['ཞ', 'zha', 'zh z sh'], ['ཅ', 'cha', 'ch c'], ['ཟ', 'za', 'z'], ['ཇ', 'ja', 'j'], ['ཝ', 'wa', 'w'], ['ཏ', 'ta', 't'], ['ཉ', 'nya', 'ny n'],
    ] },
    { title: 'ི ོ ུ ེ ཱ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ི', 'i', 'i ee'], ['ོ', 'o', 'o oe', 'oe before ད ན ལ ས'], ['ུ', 'u', 'u ue oo', 'ue before ད ན ལ ས'], ['ེ', 'e', 'e ae ay ey'], ['ཱ', 'aa', 'aa a', 'long a'],
    ] },
    { title: '་ །', block: 'Signs', type: 's', rows: [['་', 'syllable', '-', 'between syllables'], ['།', 'end', '-', 'after a name']] },
    { title: 'ླ ྒ ྱ ྲ ྟ ྦ ྩ ྨ ྤ', block: 'Under a letter', type: 'p', plain: true, rows: [
      ['ླ', 'la', 'l'], ['ྒ', 'ga', 'g k'], ['ྱ', 'ya', 'y'], ['ྲ', 'ra', 'r'], ['ྟ', 'ta', 't'], ['ྦ', 'ba', 'b'], ['ྩ', 'tsa', 'ts'], ['ྨ', 'ma', 'm'],
      ['ྤ', 'pa', 'p'],
    ] },
    { title: 'ྐ ྡ ྔ ྗ ྷ ྕ ྭ ྫ ྣ', block: 'Under a letter', type: 'p', plain: true, rows: [
      ['ྐ', 'ka', 'k'], ['ྡ', 'da', 'd'], ['ྔ', 'nga', 'ng'], ['ྗ', 'ja', 'j'], ['ྷ', 'ha', 'h', 'ལྷ is lh'], ['ྕ', 'cha', 'ch'], ['ྭ', 'silent', '-', 'not read'],
      ['ྫ', 'dza', 'dz'], ['ྣ', 'na', 'n'],
    ] },
    // ཡ ར ལ under a letter: as one letter, wherever the pair is written (and under a letter over it: སྐྱ, སྒྲ; ལ never is)
    { title: 'གླ ཀླ བླ ཟླ རླ སླ', block: 'Joined', type: 'j', rows: [
      ['གླ', 'la', 'l gl'], ['ཀླ', 'la', 'l kl'], ['བླ', 'la', 'l bl'], ['ཟླ', 'da', 'd z dl'], ['རླ', 'la', 'l rl'], ['སླ', 'la', 'l sl'],
    ] },
    { title: 'ཀྲ བྲ གྲ ཁྲ ཕྲ དྲ སྲ ཏྲ པྲ', block: 'Joined', type: 'j', rows: [
      ['ཀྲ ྐྲ', 'tra', 'tr kr'], ['བྲ ྦྲ', 'dra', 'dr br'], ['གྲ ྒྲ', 'dra', 'dr gr'], ['ཁྲ', 'thra', 'thr tr khr'], ['ཕྲ', 'thra', 'thr phr tr'],
      ['དྲ', 'dra', 'dr'], ['སྲ', 'sa', 's sr'], ['ཏྲ', 'tra', 'tr'], ['པྲ ྤྲ', 'tra', 'tr pr'],
    ] },
    { title: 'བྱ ཀྱ གྱ ཕྱ ཁྱ པྱ མྱ', block: 'Joined', type: 'j', rows: [
      ['བྱ ྦྱ', 'bja', 'bj j by', 'j in Jakar'], ['ཀྱ ྐྱ', 'kya', 'ky ch c k'], ['གྱ ྒྱ', 'gya', 'gy j g'], ['ཕྱ', 'cha', 'ch chh phy pch'], ['ཁྱ', 'khya', 'khy chh ch kh'],
      ['པྱ ྤྱ', 'cha', 'ch c py pc'], ['མྱ ྨྱ', 'nya', 'ny my'],
    ] },
    { title: '༠ ༡ ༢ ༣ ༤', block: 'Digits', type: 'd', rows: [['༠', '0'], ['༡', '1'], ['༢', '2'], ['༣', '3'], ['༤', '4']] },
    { title: '༥ ༦ ༧ ༨ ༩', block: 'Digits', type: 'd', rows: [['༥', '5'], ['༦', '6'], ['༧', '7'], ['༨', '8'], ['༩', '9']] },
  ],
  mixes: [
    ['Digits', '༠ ༡ ༢ ༣ ༤ ༥ ༦ ༧ ༨ ༩'],
    ['Lookalikes', 'ཅ ཙ ཆ ཚ ཇ ཛ ག ཤ ད ང པ བ ཕ མ ས'],
    ['Under a letter', 'ླ ྒ ྱ ྲ ྟ ྦ ྩ ྨ ྤ ྐ ྡ ྔ ྗ ྷ ྕ ྭ ྫ ྣ'],
    ['Joined', 'གླ ཀླ བླ ཟླ རླ སླ ཀྲ བྲ གྲ ཁྲ ཕྲ དྲ སྲ ཏྲ པྲ བྱ ཀྱ གྱ ཕྱ ཁྱ པྱ མྱ'],
    ['Consonants', 'ས ང ར ག མ ད བ ན ལ ཁ ཕ འ ཀ ཆ ཐ ཚ ཤ པ ཡ ཧ ཛ ཨ ཙ ཞ ཅ ཟ ཇ ཝ ཏ ཉ'],
  ],
  words: { themes: [] },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ས":["མགར་ས","Gasa"],"ང":["གསར་སྤང","Sarpang"],"ར":["སྤ་རོ","Paro"],"ག":["གསར་སྤང","Sarpang"],"མ":["མོང་སྒར","Mongar"],"ད":["དར་དཀར་ན","Dagana"],"བ":["བུམ་ཐང","Bumthang"],"ན":["དར་དཀར་ན","Dagana"],"ལ":["ལྷུན་རྩེ","Lhuntse"],"ཁ":["སྤུ་ན་ཁ","Punakha"],"ཕ":["དགེ་ལེགས་ཕུག","Gelephu"],"འ":["འབྱོག་ཀ","Bjoka"],"ཀ":["བྱ་ཀར","Jakar"],"ཆ":["ཆུ་སྦུག","Chhubu"],"ཐ":["ཐིམ་ཕུག","Thimphu"],"ཚ":["ཕུན་ཚོགས་གླིང","Phuntsholing"],"ཤ":["བཀྲ་ཤིས་སྒང","Trashigang"],"པ":["པདྨ་དགའ་ཚལ","Pemagatsel"],"ཡ":["བཀྲ་ཤིས་གཡང་རྩེ","Trashiyangtse"],"ཧ":["ཧཱ","Ha"],"ཛ":["ཆུ་འཛོམས","Chhudzom"],"ཨ":["ཨོ་རོང","Orong"],"ཙ":["ཙ་ཀ་གླིང","Tsakaling"],"ཞ":["གསེར་གཞོང","Serzhong"],"ཅ":["རྡོ་ཕུག་ཅན","Dophoogchen"],"ཟ":["སྒང་ཟུར","Gangzur"],"ཇ":["འཇམ་མཁར","Jamkhar"],"ཝ":["ཝང་ཕུག","Wangphu"],"ཏ":["བསམ་གཏན་གླིང","Samtenling"],"ཉ":["ཡངས་ཉེར","Yangnyer"],"ི":["རྩི་རང","Tsirang"],"ོ":["སྤ་རོ","Paro"],"ུ":["ཆུ་ཁ","Chukha"],"ེ":["བསམ་རྩེ","Samtse"],"ཱ":["ཧཱ","Haa"],"་":["མགར་ས","Gasa"],"ླ":["ཆོས་འཁོར་གླིང","Choekhorling"],"ྒ":["མོང་སྒར","Mongar"],"ྱ":["སྨིན་རྒྱས","Minjay"],"ྲ":["དབང་འདུས་ཕོ་བྲང","Wangdue Phodrang"],"ྟ":["བྲག་སྟེང","Dragteng"],"ྦ":["སྦིས་གདུང","Bidung"],"ྩ":["རྩི་རང","Tsirang"],"ྨ":["པདྨ་དགའ་ཚལ","Pemagatshel"],"ྤ":["སྤུ་ན་ཁ","Punakha"],"ྐ":["བདེ་སྐྱིད་གླིང","Dekiling"],"ྡ":["རྡོ་རོ་ན","Dorona"],"ྔ":["སྔ་ཚང","Ngatshang"],"ྗ":["བསམ་གྲུབ་ལྗོངས་མཁར","Samdrup Jongkhar"],"ྷ":["ལྷུན་རྩེ","Lhuentse"],"ྕ":["ལྕགས་ས་མཁར","Chaskhar"],"ྭ":["ཁམས་དྭངས","Khamdang"],"ྫ":["ཞོང་སྒར་རྫོང","Shongar Dzong"],"ྣ":["རྣམ་རྒྱས་ཆོས་གླིང","Namgaychhoeling"],"གླ":["ཕུན་ཚོགས་གླིང","Phuntsholing"],"ཀླ":["ཀླུ་མང","Lumang"],"ཀྲ":["ཀྲོང་གསར","Trongsa"],"བྲ":["དབང་འདུས་ཕོ་བྲང","Wangdue Phodrang"],"གྲ":["བསམ་གྲུབ་ལྗོངས་མཁར","Samdrup Jongkhar"],"ཁྲ":["ཁྲིམས་ཤིང","Thrimshing"],"ཕྲ":["འཕྲལ་ག","Threlga"],"དྲ":["དྲུག་རྗེ་སྒང","Drujegang"],"སྲ":["སྲས་ཕུག","Sephu"],"བྱ":["སྦྱིས","Bji"],"ཀྱ":["སྐྱབས་ཆ","Chapcha"],"གྱ":["རྒྱ་རས","Jaray"],"ཕྱ":["བྱག་ཕྱོགས","Bjacho"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
