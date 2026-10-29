// Cyrillic: its letters as each country reads them, and the words of their signs, for the script quizzes
// (../shared/reading.js says how this is written; ../shared/lang-config.js makes the Letters and Words quizzes of
// it, and the Type mode of the city and region quizzes reads names with it). The countries are those written in
// Cyrillic that have Street View: Russia, Ukraine, Bulgaria, Serbia and Montenegro, North Macedonia, Kazakhstan,
// Kyrgyzstan, Mongolia. Belarus has next to none, and is left out.
//
// Sounds are spelled as names are on the map. The base is Russian (BGN/PCGN without its marks, and ё as yo: Oryol):
// х is kh, щ shch, й and ы both y, е and э both e (е is ye at the start of a word and after a vowel: Yekaterinburg).
// What another country adds or reads another way is in `own`:
//   Ukraine      the national romanisation of 2010: г is h, и y. It spells five letters by their place in a word:
//                й y, ї yi, є ye, ю yu, я ya at the start, and i, i, ie, iu, ia everywhere else (Kryvyi Rih, Kyiv,
//                Vinnytsia). The tile is the spelling inside a word, where names mostly have the letter.
//   Bulgaria     the Streamlined System: х is h, щ sht, ъ a, and -ия at the end of a name -ia
//   Serbia, Montenegro   their own Latin alphabet, which the map uses: ж ž, ч č, ш š, ц c, х h, ј j. Montenegro
//                writes a few words another way (ријека, хљеб): `but`.
//   North Macedonia   the same letters for those sounds (Štip, Kičevo), and gj, kj, dz, dž for its own. Its
//                passports write zh, ch, sh instead, which a typed name may use.
//   Kazakhstan   its added letters are written with plain Latin ones on the map: қ k (Karagandy), ғ g, ң n, ө o
//                (Aktobe), ұ and ү u, ә a. Its own spelling is said with the answer (q, gh, ng, ö, ü, ä).
//   Kyrgyzstan, Mongolia   ж is j (Jalal-Abad, Jargalant), ө o and ү u; Mongolian й and ь are i (Ölgii, Govi)
// Signs give Kazakh and Kyrgyz words the way they follow a name: Абай көшесі, Алматы қаласы.
var SCRIPT = {
  name: 'Cyrillic', script: 'cyrl', unicode: 'Cyrillic', faces: 6, wide: 5,
  langs: {
    ru: { name: 'Russian', where: 'Russia', at: 'RUS' },
    uk: { name: 'Ukrainian', where: 'Ukraine', at: 'UKR' },
    bg: { name: 'Bulgarian', where: 'Bulgaria', at: 'BGR' },
    sr: { name: 'Serbian', where: 'Serbia', at: 'SRB' },
    me: { name: 'Montenegrin', where: 'Montenegro', at: 'MNE', like: 'sr', but: { 'река': 'ријека', 'хлеб': 'хљеб', 'цвеће': 'цвијеће', 'ауто делови': 'ауто дијелови', 'округ': '' } },
    mk: { name: 'Macedonian', where: 'North Macedonia', at: 'MKD' },
    kk: { name: 'Kazakh', where: 'Kazakhstan', at: 'KAZ' },
    ky: { name: 'Kyrgyz', where: 'Kyrgyzstan', at: 'KGZ' },
    mn: { name: 'Mongolian', where: 'Mongolia', at: 'MNG' },
  },
  letters: [
    { title: 'Same as Latin', rows: [['А а', 'a'], ['К к', 'k', 'k c'], ['М м', 'm'], ['О о', 'o'], ['Т т', 't']] },
    { title: 'Look Latin, sound different', rows: [
      ['В в', 'v', 'v w'], ['Е е', 'e', 'e ye ie je', 'ye at the start and after a vowel'], ['Н н', 'n'], ['Р р', 'r'], ['С с', 's'],
      ['У у', 'u', 'u ou w'], ['Х х', 'kh', 'kh h x ch'],
    ] },
    { title: 'New consonants · Б–Ф', rows: [
      ['Б б', 'b'], ['Г г', 'g', 'g h'], ['Д д', 'd'], ['З з', 'z', 'z s'], ['Л л', 'l'], ['П п', 'p'], ['Ф ф', 'f', 'f ph'],
    ] },
    { title: 'New consonants · Ж–Щ', rows: [
      ['Ж ж', 'zh', 'zh z j', 's in measure'], ['Й й', 'y', 'y i j', 'short i'], ['Ц ц', 'ts', 'ts c tz'], ['Ч ч', 'ch', 'ch c tch'],
      ['Ш ш', 'sh', 'sh s sch'], ['Щ щ', 'shch', 'shch sch sh shh'],
    ] },
    { title: 'New vowels and signs', rows: [
      ['Ё ё', 'yo', 'yo ye e o io jo', 'often printed Е'], ['И и', 'i', 'i y iy'], ['Ы ы', 'y', 'y i'], ['Э э', 'e'],
      ['Ю ю', 'yu', 'yu iu ju u'], ['Я я', 'ya', 'ya ia ja a'],
      ['Ъ ъ', 'hard', '-', 'hard sign · not spoken'], ['Ь ь', 'soft', '- y', 'soft sign · not spoken'],
    ] },
  ],
  mixes: [
    ['Lookalikes', 'И Й Н П Ш Щ Ц Ь Ъ Ы Б В'],
    ['Vowels and signs', 'А Е Ё И О У Ы Э Ю Я Ъ Ь'],
    ['Consonants', 'Б В Г Д Ж З Й К Л М Н П Р С Т Ф Х Ц Ч Ш Щ'],
  ],
  together: [['ий', 'iy y i ii yi ij'], ['ый', 'yy y yi iy ij'], ['ье', 'ye e ie'], ['ья', 'ya ia'], ['кс', 'ks x']],
  own: {
    uk: {
      not: 'Ё Ъ Ы Э',
      rows: [
        ['Г г', 'h', 'h g', 'h, not g'], ['Ґ ґ', 'g', 'g', 'rare'], ['Є є', 'ie', 'ie ye je e', 'ye at the start of a word'],
        ['И и', 'y', 'y i'], ['І і', 'i', 'i y'], ['Ї ї', 'i', 'i yi ji ii', 'yi at the start of a word'],
        ['Й й', 'i', 'i y j', 'y at the start of a word'], ['Ю ю', 'iu', 'iu yu ju u', 'yu at the start of a word'],
        ['Я я', 'ia', 'ia ya ja a', 'ya at the start of a word'],
      ],
      together: [['ий', 'yi y ii iy yy'], ['ій', 'ii iy i'], ['ьо', 'o io yo'], ['зг', 'zgh zh zg'], ['кс', 'ks x']],
    },
    bg: {
      not: 'Ё Ы Э',
      rows: [
        ['Х х', 'h', 'h kh x'], ['Щ щ', 'sht', 'sht sch', 'sht, not shch'], ['Ъ ъ', 'a', 'a u y -', 'a vowel · u in but'],
        ['Ь ь', 'y', 'y -', 'only in ьо'],
      ],
      together: [['ия', 'ia iya ya'], ['дж', 'dzh j dj'], ['кс', 'ks x']],
    },
    sr: {
      not: 'Ё Й Щ Ъ Ы Ь Э Ю Я',
      rows: [
        ['Ђ ђ', 'đ', 'đ dj d'], ['Ж ж', 'ž', 'ž z zh'], ['Ј ј', 'j', 'j y', 'y in yes'], ['Љ љ', 'lj', 'lj l ly'], ['Њ њ', 'nj', 'nj n ny'],
        ['Ћ ћ', 'ć', 'ć c ch'], ['Х х', 'h', 'h kh x'], ['Ц ц', 'c', 'c ts', 'ts'], ['Ч ч', 'č', 'č c ch', 'ch'], ['Џ џ', 'dž', 'dž dz dzh j'],
        ['Ш ш', 'š', 'š s sh', 'sh'],
      ],
      together: [],
    },
    mk: {
      not: 'Ё Й Щ Ъ Ы Ь Э Ю Я',
      rows: [
        ['Ѓ ѓ', 'gj', 'gj g dj'], ['Ж ж', 'ž', 'ž z zh'], ['Ѕ ѕ', 'dz', 'dz z'], ['Ј ј', 'j', 'j y', 'y in yes'], ['Љ љ', 'lj', 'lj l ly'],
        ['Њ њ', 'nj', 'nj n ny'], ['Ќ ќ', 'kj', 'kj k c ch'], ['Х х', 'h', 'h kh x'], ['Ц ц', 'c', 'c ts', 'ts'], ['Ч ч', 'č', 'č c ch', 'ch'],
        ['Џ џ', 'dž', 'dž dz dzh dj j'], ['Ш ш', 'š', 'š s sh', 'sh'],
      ],
      together: [],
    },
    kk: {
      rows: [
        ['Ә ә', 'a', 'a ae', 'ä'], ['Ғ ғ', 'g', 'g gh', 'gh'], ['Қ қ', 'k', 'k q', 'q'], ['Ң ң', 'n', 'n ng', 'ng'], ['Ө ө', 'o', 'o oe', 'ö'],
        ['Ұ ұ', 'u', 'u', 'short u'], ['Ү ү', 'u', 'u ue', 'ü'], ['Һ һ', 'h', 'h kh'], ['І і', 'i', 'i y'],
      ],
    },
    ky: { rows: [['Ж ж', 'j', 'j zh dzh'], ['Ң ң', 'ng', 'ng n'], ['Ө ө', 'o', 'o oe', 'ö'], ['Ү ү', 'u', 'u ue', 'ü']] },
    mn: {
      rows: [
        ['Е е', 'ye', 'ye e yo'], ['Ж ж', 'j', 'j zh dzh'], ['Й й', 'i', 'i y j'], ['Ө ө', 'o', 'o oe', 'ö'], ['Ү ү', 'u', 'u ue', 'ü'],
        ['Ь ь', 'i', 'i -'],
      ],
      together: [],
    },
  },
  // A row per meaning: Russia, Ukraine, Bulgaria, Serbia (and Montenegro, but for its own words), North Macedonia,
  // Kazakhstan, Kyrgyzstan, Mongolia.
  words: {
    themes: [
      { title: 'Words you can guess', rows: [
        ['taxi', 'такси', 'таксі', 'такси', 'такси', 'такси', 'такси', 'такси', 'такси'],
        ['bank', 'банк', 'банк', 'банка', 'банка', 'банка', 'банк', 'банк', 'банк'],
        ['café', 'кафе', 'кафе', 'кафе', 'кафе', 'кафе', 'кафе', 'кафе', 'кафе|kafe'],
        ['restaurant', 'ресторан', 'ресторан', 'ресторант', 'ресторан', 'ресторан', '', 'ресторан', 'ресторан|restoran'],
        ['park', 'парк', 'парк', 'парк', 'парк', 'парк', '', 'парк', ''],
        ['metro', 'метро', 'метро', 'метро', '', '', 'метро', '', ''],
        ['supermarket', 'супермаркет', 'супермаркет', 'супермаркет', 'супермаркет', 'супермаркет', 'супермаркет', 'супермаркет', 'супермаркет|supermarket'],
      ] },
      { title: 'Roads', rows: [
        ['street', 'улица', 'вулиця', 'улица', 'улица', 'улица', 'көшесі', 'көчөсү', 'гудамж'],
        ['avenue', 'проспект', 'проспект', '', '', '', 'даңғылы', 'проспектиси', 'өргөн чөлөө'],
        ['boulevard', 'бульвар', 'бульвар', 'булевард', 'булевар', 'булевар', '', '', ''],
        ['lane', 'переулок', 'провулок', '', '', '', 'тұйық көшесі', '', ''],
        ['square', 'площадь', 'площа', 'площад', 'трг', 'плоштад', 'алаңы', 'аянты', 'талбай'],
        ['road', 'дорога', 'дорога', 'път', 'пут', 'пат', 'жол', 'жол', 'зам'],
        ['highway', 'шоссе', 'шосе', 'шосе', '', '', '', '', ''],
        ['motorway', '', '', 'магистрала', 'аутопут', 'автопат', '', '', ''],
        ['bridge', 'мост', 'міст', 'мост', 'мост', 'мост', 'көпір', 'көпүрө', 'гүүр'],
      ] },
      { title: 'Places', rows: [
        ['city', 'город', 'місто', 'град', 'град', 'град', 'қаласы', 'шаары', 'хот'],
        ['village', 'село', 'село', 'село', 'село', 'село', 'ауылы', 'айылы', ''],
        ['settlement', 'посёлок', 'селище', '', '', '', 'кенті', '', ''],
        ['region', 'область', 'область', 'област', 'округ', '', 'облысы', 'облусу', 'аймаг'],
        ['district', 'район', 'район', '', '', '', 'ауданы', 'району', 'сум'],
        ['municipality', '', '', 'община', 'општина', 'општина', '', '', ''],
        ['community', '', 'громада', '', '', '', '', '', ''],
        ['neighbourhood', '', '', 'квартал', 'насеље', 'населба', '', '', ''],
        ['microdistrict', '', '', '', '', '', 'шағын ауданы', '', ''],
        ['city district', '', '', '', '', '', '', '', 'дүүрэг'],
        ['subdistrict', '', '', '', '', '', '', '', 'хороо'],
        ['centre', 'центр', 'центр', 'център', 'центар', 'центар', 'орталық', 'борбор', 'төв'],
        ['river', 'река', 'річка', 'река', 'река', 'река', 'өзені', 'дарыясы', 'гол'],
        ['lake', 'озеро', 'озеро', 'езеро', 'језеро', 'езеро', 'көлі', 'көлү', 'нуур'],
        ['mountain', 'гора', 'гора', 'планина', 'планина', 'планина', 'тауы', 'тоосу', 'уул'],
        ['monastery', '', '', 'манастир', 'манастир', 'манастир', '', '', 'хийд'],
        ['reservoir', '', '', 'язовир', '', '', '', '', ''],
      ] },
      { title: 'Shops', rows: [
        ['shop', 'магазин', 'магазин', 'магазин', 'продавница', 'продавница', 'дүкен', 'дүкөн', 'дэлгүүр'],
        ['groceries', 'продукты', 'продукти', 'хранителни стоки', '', '', 'азық-түлік', 'азык-түлүк', 'хүнс'],
        ['pharmacy', 'аптека', 'аптека', 'аптека', 'апотека', 'аптека', 'дәріхана', 'дарыкана', 'эмийн сан'],
        ['market', 'рынок', 'ринок', 'пазар', 'пијаца', 'пазар', 'базар', 'базар', 'зах'],
        ['bread', 'хлеб', 'хліб', 'хляб', 'хлеб', 'леб', 'нан', 'нан', 'талх'],
        ['bakery', 'пекарня', 'пекарня', 'пекарна', 'пекара', 'пекара', '', '', ''],
        ['meat', 'мясо', 'м’ясо|miaso', 'месо', 'месо', 'месо', 'ет', 'эт', 'мах'],
        ['flowers', 'цветы', 'квіти', 'цветя', 'цвеће', 'цвеќе', 'гүлдер', 'гүлдөр', 'цэцэг'],
        ['clothes', 'одежда', 'одяг', 'дрехи', '', '', 'киім', 'кийим', 'хувцас'],
        ['car parts', 'автозапчасти', 'автозапчастини', 'авточасти', 'ауто делови', 'авто делови', 'автобөлшектер', '', ''],
      ] },
      { title: 'Services', rows: [
        ['school', 'школа', 'школа', 'училище', 'школа', 'училиште', 'мектеп', 'мектеп', 'сургууль'],
        ['hospital', 'больница', 'лікарня', 'болница', 'болница', 'болница', 'аурухана', 'оорукана', 'эмнэлэг'],
        ['post office', 'почта', 'пошта', 'поща', 'пошта', 'пошта', 'пошта', 'почта', 'шуудан'],
        ['hotel', 'гостиница', 'готель', 'хотел', 'хотел', 'хотел', 'қонақ үй', 'мейманкана', 'зочид буудал'],
        ['canteen', 'столовая', 'їдальня|yidalnia', '', '', '', 'асхана', 'ашкана', 'гуанз'],
        ['hairdresser', 'парикмахерская', 'перукарня', 'фризьор', 'фризер', 'фризер', 'шаштараз', 'чач тарач', 'үсчин'],
        ['tyre repair', 'шиномонтаж', 'шиномонтаж', 'вулканизатор', 'вулканизер', 'вулканизер', '', '', 'дугуй засвар'],
        ['car wash', 'автомойка', 'автомийка', 'автомивка', 'аутоперионица', 'автоперална', '', '', 'авто угаалга'],
        ['railway station', 'вокзал', 'вокзал', 'гара', '', '', 'вокзал', 'вокзал', ''],
        ['station', 'станция', 'станція', '', 'станица', 'станица', '', '', ''],
        ['petrol station', '', '', 'бензиностанция', 'бензинска пумпа', 'бензинска пумпа', '', '', ''],
        ['church', 'церковь', 'церква', 'църква', 'црква', 'црква', '', '', ''],
        ['mosque', '', '', '', '', '', 'мешіт', 'мечит', ''],
        ['temple', '', '', '', '', '', '', '', 'сүм'],
        ['police', 'полиция', 'поліція', 'полиция', 'полиција', 'полиција', 'полиция', 'милиция', 'цагдаа'],
        ['town hall', '', '', 'кметство', '', '', 'әкімдік', '', ''],
        ['village council', '', '', '', '', '', '', 'айыл өкмөтү', ''],
        ['community centre', '', '', 'читалище', '', '', '', '', ''],
      ] },
      { title: 'Notices', rows: [
        ['entrance', 'вход', 'вхід', 'вход', 'улаз', 'влез', 'кіру', 'кирүү', 'орц'],
        ['exit', 'выход', 'вихід', 'изход', 'излаз', 'излез', 'шығу', 'чыгуу', 'гарц'],
        ['open', 'открыто', 'відчинено', 'отворено', 'отворено', 'отворено', 'ашық', 'ачык', 'нээлттэй'],
        ['closed', 'закрыто', 'зачинено', 'затворено', 'затворено', 'затворено', 'жабық', 'жабык', 'хаалттай'],
        ['for sale', 'продаётся', 'продається', 'продава се', 'продаје се', 'се продава', 'сатылады', 'сатылат', 'зарна'],
        ['for rent', 'аренда', 'оренда', 'под наем', 'издаје се', 'се издава', 'жалға беріледі', 'ижарага берилет', 'түрээслүүлнэ'],
        ['attention', 'внимание|vnimaniye', 'увага', 'внимание', 'пажња', 'внимание', 'назар аударыңыз', 'көңүл буруңуз', 'анхаар'],
        ['welcome', 'добро пожаловать', 'ласкаво просимо', 'добре дошли', 'добро дошли', 'добредојдовте', 'қош келдіңіздер', 'кош келиңиздер', 'тавтай морил'],
        ['repair', 'ремонт', 'ремонт', 'ремонт', 'сервис', 'сервис', 'жөндеу', 'оңдоо', 'засвар'],
        ['24 hours', 'круглосуточно', 'цілодобово', 'денонощно', '', '', 'тәулік бойы', '', ''],
      ] },
      { title: 'Abbreviations', short: true, rows: [
        ['street', 'ул.', 'вул.', 'ул.', 'ул.', 'ул.', 'к-сі', '', ''],
        ['avenue', 'пр-т', 'просп.', '', '', '', 'д-лы', '', ''],
        ['boulevard', '', '', 'бул.', 'бул.', 'бул.', '', '', ''],
        ['lane', 'пер.', 'пров.', '', '', '', '', '', ''],
        ['square', 'пл.', 'пл.', 'пл.', '', '', '', '', ''],
        ['highway', 'ш.', '', '', '', '', '', '', ''],
        ['city', 'г.', 'м.', 'гр.', '', '', 'қ.', '', ''],
        ['village', 'с.', 'с.', 'с.', '', '', 'а.', '', ''],
        ['settlement', '', 'смт', '', '', '', '', '', ''],
        ['region', 'обл.', 'обл.', 'обл.', '', '', 'обл.', '', ''],
        ['district', 'р-н', 'р-н', '', '', '', 'ауд.', '', ''],
        ['municipality', '', '', 'общ.', '', '', '', '', ''],
        ['neighbourhood', '', '', 'кв.', '', '', '', '', ''],
        ['reservoir', '', '', 'яз.', '', '', '', '', ''],
      ] },
    ],
    mixes: [
      ['Addresses', ['Roads', 'Places', 'Abbreviations']],
      ['Shop fronts', ['Words you can guess', 'Shops', 'Services', 'Notices']],
    ],
  },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"А":["Самара","Samara"],"К":["Томск","Tomsk"],"М":["Омск","Omsk"],"О":["Краснодар","Krasnodar"],"Т":["Саратов","Saratov"],"В":["Ижевск","Izhevsk"],"Е":["Воронеж","Voronezh"],"Н":["Красноярск","Krasnoyarsk"],"Р":["Ярославль","Yaroslavl"],"С":["Владивосток","Vladivostok"],"У":["Барнаул","Barnaul"],"Х":["Хабаровск","Khabarovsk"],"Б":["Новосибирск","Novosibirsk"],"Г":["Екатеринбург","Yekaterinburg"],"Д":["Волгоград","Volgograd"],"З":["Казань","Kazan"],"Л":["Ульяновск","Ulyanovsk"],"П":["Пермь","Perm"],"Ф":["Уфа","Ufa"],"Ж":["Нижний Новгород","Nizhny Novgorod"],"Й":["Нижний Тагил","Nizhny Tagil"],"Ц":["Новокузнецк","Novokuznetsk"],"Ч":["Махачкала","Makhachkala"],"Ш":["Йошкар-Ола","Yoshkar-Ola"],"Щ":["Благовещенск","Blagoveshchensk"],"Ё":["Орёл","Oryol"],"И":["Иркутск","Irkutsk"],"Ы":["Набережные Челны","Naberezhnye Chelny"],"Э":["Улан-Удэ","Ulan-Ude"],"Ю":["Тюмень","Tyumen"],"Я":["Челябинск","Chelyabinsk"],"Ь":["Тольятти","Tolyatti"],"Г/h":["Луганськ","Luhansk"],"Є/ie":["Єнакієве","Yenakiieve"],"И/y":["Миколаїв","Mykolaiv"],"І/i":["Харків","Kharkiv"],"Ї/i":["Київ","Kyiv"],"Й/i":["Кривий Ріг","Kryvyi Rih"],"Ю/iu":["Ізюм","Izium"],"Я/ia":["Запоріжжя","Zaporizhzhia"],"Х/h":["Хасково","Haskovo"],"Щ/sht":["Търговище","Targovishte"],"Ъ/a":["Велико Търново","Veliko Tarnovo"],"Ђ/đ":["Калуђерица","Kaluđerica"],"Ж/ž":["Ужице","Užice"],"Ј/j":["Крагујевац","Kragujevac"],"Љ/lj":["Краљево","Kraljevo"],"Њ/nj":["Зрењанин","Zrenjanin"],"Ћ/ć":["Параћин","Paraćin"],"Ц/c":["Суботица","Subotica"],"Ч/č":["Панчево","Pančevo"],"Џ/dž":["Оџаци","Odžaci"],"Ш/š":["Ниш","Niš"],"Ќ/kj":["Буковиќ","Bukoviḱ"],"Ә/a":["Әйтеке би","Ayteke Bi"],"Ғ/g":["Талдықорған","Taldykorgan"],"Қ/k":["Қызылорда","Kyzylorda"],"Ң/n":["Жаңаөзен","Zhanaozen"],"Ө/o":["Ақтөбе","Aktobe"],"Ұ/u":["Екібастұз","Ekibastuz"],"Ү/u":["Түркістан","Turkistan"],"Ж/j":["Кара-Кулжа","Kara-Kulja"],"Ң/ng":["Жаңы-Ноокат","Jangy-Nookat"],"Ь/i":["Мандалговь","Mandalgovi"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
