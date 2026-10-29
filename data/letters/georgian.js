// Georgian: its letters, and the words of its signs, for the script quizzes (../shared/reading.js says how this is
// written). It is written in Georgia, in its everyday alphabet, Mkhedruli: 33 letters, each one sound, and no capital
// letters. Some signs and shop fronts write a word all in the capitals of Mtavruli (ᲥᲣᲩᲐ for ქუჩა), which are not asked.
//
// Sounds are spelled as names are on Georgia's road signs: the national romanisation of 2002 without its apostrophes.
// The national system tells the ejective consonants, said with a catch in the throat, by an apostrophe (კ k', ტ t',
// პ p', წ ts', ჭ ch', ყ q'), and the signs leave it out, so each of them is spelled like its breathed pair (ქ k, თ t,
// ფ p, ც ts, ჩ ch), and ყ is written k as well (Tskaltubo, Kvareli). ღ is gh, ხ kh, ჯ j, ძ dz, ჟ zh, შ sh.
// Letters by how often they occur in Georgia's place names (GeoNames, OpenStreetMap: ა ი რ ე ნ ო ლ უ ს ვ მ თ ხ დ ბ
// გ კ ქ ტ ზ შ წ ყ ჯ ფ ჩ ღ ჭ ც ძ პ ჟ ჰ), in rounds of six or seven.
var SCRIPT = {
  name: 'Georgian', script: 'geor', unicode: 'Georgian', faces: 3,
  langs: { ka: { name: 'Georgian', where: 'Georgia', at: 'GEO' } },
  letters: [
    { title: 'ა ი რ ე ნ ო ლ', rows: [['ა', 'a'], ['ი', 'i'], ['რ', 'r'], ['ე', 'e'], ['ნ', 'n'], ['ო', 'o'], ['ლ', 'l']] },
    { title: 'უ ს ვ მ თ ხ დ', rows: [
      ['უ', 'u'], ['ს', 's'], ['ვ', 'v', 'v w'], ['მ', 'm'], ['თ', 't', 't th', 'breathed t'], ['ხ', 'kh', 'kh h x', 'ch in loch'], ['დ', 'd'],
    ] },
    { title: 'ბ გ კ ქ ტ ზ შ', rows: [
      ['ბ', 'b'], ['გ', 'g'], ['კ', 'k', 'k', "k' · ejective"], ['ქ', 'k', 'k kh q', 'breathed k'], ['ტ', 't', 't', "t' · ejective"], ['ზ', 'z'],
      ['შ', 'sh', 'sh s'],
    ] },
    { title: 'წ ყ ჯ ფ ჩ ღ', rows: [
      ['წ', 'ts', 'ts tz c', "ts' · ejective"], ['ყ', 'k', 'k q kh', "q' · ejective, deep in the throat"], ['ჯ', 'j', 'j dj dzh', 'j in jam'],
      ['ფ', 'p', 'p ph f', 'breathed p'], ['ჩ', 'ch', 'ch tch', 'breathed ch'], ['ღ', 'gh', 'gh g', 'a throaty r, as in French'],
    ] },
    { title: 'ჭ ც ძ პ ჟ ჰ', rows: [
      ['ჭ', 'ch', 'ch tch', "ch' · ejective"], ['ც', 'ts', 'ts tz c', 'breathed ts'], ['ძ', 'dz', 'dz z'], ['პ', 'p', 'p', "p' · ejective"],
      ['ჟ', 'zh', 'zh j', 's in measure'], ['ჰ', 'h'],
    ] },
  ],
  mixes: [
    ['Vowels', 'ა ე ი ო უ'],
    ['Ejective or breathed', 'კ ქ ყ ტ თ პ ფ წ ც ჭ ჩ'],
    ['Lookalikes', 'დ ღ ნ წ ქ ჭ ჟ მ შ ო თ ლ ვ პ ჰ ს ხ ბ'],
    ['Alphabet', 'ა ბ გ დ ე ვ ზ თ ი კ ლ მ ნ ო პ ჟ რ ს ტ უ ფ ქ ღ ყ შ ჩ ც ძ წ ჭ ხ ჯ ჰ'],
  ],
  // A row per meaning: the word on Georgian signs (its reading: the letters, as the signs spell them).
  words: {
    themes: [
      { title: 'Roads', rows: [
        ['street', 'ქუჩა'], ['avenue', 'გამზირი'], ['square', 'მოედანი'], ['lane', 'შესახვევი'], ['dead end', 'ჩიხი'], ['highway', 'გზატკეცილი'],
        ['road', 'გზა'], ['bridge', 'ხიდი'],
      ] },
      { title: 'In names', rows: [
        ['upper', 'ზემო'], ['lower', 'ქვემო'], ['upper', 'ზედა'], ['lower', 'ქვედა'], ['new', 'ახალი'], ['old', 'ძველი'], ['big', 'დიდი'],
        ['small', 'პატარა'], ['fortress', 'ციხე'],
      ] },
      { title: 'Places', rows: [
        ['city', 'ქალაქი'], ['village', 'სოფელი'], ['centre', 'ცენტრი'], ['hospital', 'საავადმყოფო'], ['school', 'სკოლა'], ['police', 'პოლიცია'],
        ['church', 'ეკლესია'], ['monastery', 'მონასტერი'], ['station', 'სადგური'], ['river', 'მდინარე'],
      ] },
      { title: 'Shops', rows: [
        ['pharmacy', 'აფთიაქი'], ['shop', 'მაღაზია'], ['market', 'ბაზარი'], ['hotel', 'სასტუმრო'], ['restaurant', 'რესტორანი'], ['bakery', 'საცხობი'],
        ['bank', 'ბანკი'], ['tyre repair', 'ვულკანიზაცია'], ['car wash', 'ავტოსამრეცხაო'],
      ] },
      { title: 'Notices', rows: [
        ['entrance', 'შესასვლელი'], ['exit', 'გასასვლელი'], ['open', 'ღიაა'], ['closed', 'დაკეტილია'], ['for sale', 'იყიდება'], ['for rent', 'ქირავდება'],
        ['attention', 'ყურადღება'], ['bus stop', 'გაჩერება'],
      ] },
    ],
    mixes: [
      ['Addresses', ['Roads', 'In names', 'Places']],
      ['Shop fronts', ['Shops', 'Notices']],
    ],
  },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ა":["ახალქალაქი","Akhalkalaki"],"ი":["დიოკნისი","Dioknisi"],"რ":["ყვარელი","Kvareli"],"ე":["საგარეჯო","Sagarejo"],"ნ":["ბოლნისი","Bolnisi"],"ო":["ოზურგეთი","Ozurgeti"],"ლ":["თელავი","Telavi"],"უ":["ქობულეთი","Kobuleti"],"ს":["ზესტაფონი","Zestaponi"],"ვ":["რუსთავი","Rustavi"],"მ":["მარნეული","Marneuli"],"თ":["ბათუმი","Batumi"],"ხ":["ხონი","Khoni"],"დ":["გარდაბანი","Gardabani"],"ბ":["თბილისი","Tbilisi"],"გ":["გორი","Gori"],"კ":["სენაკი","Senaki"],"ქ":["ქუთაისი","Kutaisi"],"ტ":["სამტრედია","Samtredia"],"ზ":["ზუგდიდი","Zugdidi"],"შ":["ხაშური","Khashuri"],"წ":["წყალტუბო","Tskaltubo"],"ყ":["ტყიბული","Tkibuli"],"ჯ":["ბორჯომი","Borjomi"],"ფ":["ფოთი","Poti"],"ჩ":["ჩაქვი","Chakvi"],"ღ":["ბაღდადი","Baghdadi"],"ჭ":["ჭიათურა","Chiatura"],"ც":["ახალციხე","Akhaltsikhe"],"ძ":["ძეგვი","Dzegvi"],"პ":["კასპი","Kaspi"],"ჟ":["ჟინვალი","Zhinvali"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
