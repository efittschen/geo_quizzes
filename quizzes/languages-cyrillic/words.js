// Cyrillic to Latin: the alphabet table and the words of the quiz (quiz.js).
// ALPHABET: every Russian letter with the Latin letters the table shows for it (simplified BGN/PCGN, as place names
// are mostly written in Latin on Google Maps: no apostrophe for ь, e for е everywhere) and the other spellings a
// typed answer may use instead (ISO 9 / scholarly č š ž, German-style j, plain h or c, …).
// WORDS: rounds of words a player meets on Russian-language street signs, shop fronts and maps: [word, meaning].
const ALPHABET = [
  ['а', 'a'], ['б', 'b'], ['в', 'v'], ['г', 'g'], ['д', 'd'], ['е', 'e', 'ye', 'je', 'ie'], ['ё', 'yo', 'ë', 'e', 'jo', 'io'],
  ['ж', 'zh', 'ž', 'j'], ['з', 'z'], ['и', 'i'], ['й', 'y', 'i', 'j', 'ĭ'], ['к', 'k'], ['л', 'l'], ['м', 'm'], ['н', 'n'], ['о', 'o'],
  ['п', 'p'], ['р', 'r'], ['с', 's'], ['т', 't'], ['у', 'u'], ['ф', 'f'], ['х', 'kh', 'h', 'x', 'ch'], ['ц', 'ts', 'c', 'tz'],
  ['ч', 'ch', 'č'], ['ш', 'sh', 'š'], ['щ', 'shch', 'sch', 'šč', 'shh'], ['ъ', ''], ['ы', 'y', 'i'], ['ь', ''],
  ['э', 'e', 'è', 'eh'], ['ю', 'yu', 'iu', 'ju'], ['я', 'ya', 'ia', 'ja'],
];
const WORDS = [
  ['Streets', 'on street signs', [
    ['улица', 'street'], ['проспект', 'avenue'], ['переулок', 'lane'], ['шоссе', 'highway'], ['площадь', 'square'],
    ['бульвар', 'boulevard'], ['набережная', 'embankment'], ['проезд', 'passage'], ['тупик', 'dead end']]],
  ['Places', 'towns and regions', [
    ['город', 'city, town'], ['село', 'village (with a church)'], ['деревня', 'village'], ['посёлок', 'settlement'], ['район', 'district'],
    ['область', 'region (oblast)'], ['край', 'territory (krai)'], ['республика', 'republic'], ['центр', 'centre']]],
  ['On the map', 'rivers, lakes, directions', [
    ['река', 'river'], ['озеро', 'lake'], ['остров', 'island'], ['море', 'sea'], ['гора', 'mountain'],
    ['север', 'north'], ['юг', 'south'], ['восток', 'east'], ['запад', 'west']]],
  ['Road signs', 'along the road', [
    ['стоп', 'stop'], ['въезд', 'entrance (vehicles)'], ['выезд', 'exit (vehicles)'], ['объезд', 'detour'], ['переход', 'crossing'],
    ['остановка', 'bus stop'], ['мост', 'bridge'], ['вокзал', 'railway station'], ['станция', 'station'], ['аэропорт', 'airport'],
    ['километр', 'kilometre'], ['граница', 'border']]],
  ['Shop fronts', 'in towns', [
    ['магазин', 'shop'], ['продукты', 'groceries'], ['аптека', 'pharmacy'], ['почта', 'post office'], ['банк', 'bank'],
    ['школа', 'school'], ['больница', 'hospital'], ['церковь', 'church'], ['рынок', 'market'], ['гостиница', 'hotel'],
    ['столовая', 'canteen'], ['автозапчасти', 'car parts'], ['шиномонтаж', 'tyre fitting'], ['автомойка', 'car wash'], ['хозтовары', 'household goods']]],
  ['Cities', 'large Russian cities', [
    ['Москва', 'Moscow'], ['Санкт-Петербург', 'Saint Petersburg'], ['Новосибирск', 'Novosibirsk'], ['Екатеринбург', 'Yekaterinburg'], ['Казань', 'Kazan'],
    ['Нижний Новгород', 'Nizhny Novgorod'], ['Челябинск', 'Chelyabinsk'], ['Самара', 'Samara'], ['Омск', 'Omsk'], ['Ростов-на-Дону', 'Rostov-on-Don'],
    ['Уфа', 'Ufa'], ['Красноярск', 'Krasnoyarsk'], ['Воронеж', 'Voronezh'], ['Пермь', 'Perm'], ['Волгоград', 'Volgograd'],
    ['Краснодар', 'Krasnodar'], ['Владивосток', 'Vladivostok'], ['Иркутск', 'Irkutsk'], ['Хабаровск', 'Khabarovsk'], ['Якутск', 'Yakutsk'],
    ['Мурманск', 'Murmansk'], ['Архангельск', 'Arkhangelsk'], ['Калининград', 'Kaliningrad'], ['Тюмень', 'Tyumen'], ['Чебоксары', 'Cheboksary']]],
];
