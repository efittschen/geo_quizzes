// Ukraine: the 27 first-level units (24 oblasts, the Autonomous Republic of Crimea, Kyiv and Sevastopol), for the
// codes and regions pages. Map ids are English slugs.
//   en     English name;  uk  official Ukrainian name (MVS Order 166/2021, Annex 4)
//   phone  geographic area code (National Numbering Plan, Order 758 of 26.08.2023, z1534-23, Annex 1)
//   road   region index in territorial road numbers T-xx-yy (CMU Resolution 1318 of 15.12.2023; the same numbers as
//          MVS Order 166/2021 Annex 6); Kyiv city (11) has no territorial roads
//   plates (not used by any quiz) letter codes on number plates (MVS Order 166/2021 Annex 4, as amended to 2025), in the annex's order:
//          2004 series (A?, B?, C?), 2013 series (K?, H?, I?), then the codes added since 2021; Crimea's KK (2013)
//          went to Kyiv city in 2023 (MVS Order 354), so Crimea's second code is MA
//   macro  macro-region as in KIIS surveys (kiis.com.ua; unofficial): W, C, S, E; Crimea and Sevastopol (CR) are not
//          in KIIS polls
const UA = {
  regions: {
    crimea: { en: 'Crimea', uk: 'Автономна Республіка Крим', phone: '65', road: '01', plates: ['АК', 'МА', 'ТК', 'МК'], macro: 'CR' },
    vinnytsia: { en: 'Vinnytsia', uk: 'Вінницька область', phone: '43', road: '02', plates: ['АВ', 'КВ', 'ІМ', 'РІ'], macro: 'C' },
    volyn: { en: 'Volyn', uk: 'Волинська область', phone: '33', road: '03', plates: ['АС', 'КС', 'СМ', 'ТС'], macro: 'W' },
    dnipropetrovsk: { en: 'Dnipropetrovsk', uk: 'Дніпропетровська область', phone: '56', road: '04', plates: ['АЕ', 'КЕ', 'РР', 'МІ'], macro: 'S' },
    donetsk: { en: 'Donetsk', uk: 'Донецька область', phone: '62', road: '05', plates: ['АН', 'КН', 'ТН', 'МН'], macro: 'E' },
    zhytomyr: { en: 'Zhytomyr', uk: 'Житомирська область', phone: '41', road: '06', plates: ['АМ', 'КМ', 'ТМ', 'МВ'], macro: 'C' },
    zakarpattia: { en: 'Zakarpattia', uk: 'Закарпатська область', phone: '31', road: '07', plates: ['АО', 'КО', 'МТ', 'МО'], macro: 'W' },
    zaporizhzhia: { en: 'Zaporizhzhia', uk: 'Запорізька область', phone: '61', road: '08', plates: ['АР', 'КР', 'ТР', 'МР'], macro: 'S' },
    ivanofrankivsk: { en: 'Ivano-Frankivsk', uk: 'Івано-Франківська область', phone: '34', road: '09', plates: ['АТ', 'КТ', 'ТО', 'ХС'], macro: 'W' },
    kyivoblast: { en: 'Kyiv Oblast', uk: 'Київська область', phone: '45', road: '10', plates: ['АІ', 'КІ', 'ТІ', 'ЕЕ'], macro: 'C' },
    kyiv: { en: 'Kyiv City', uk: 'м. Київ', phone: '44', road: '11', plates: ['АА', 'КА', 'ТТ', 'КК'], macro: 'C' },
    kirovohrad: { en: 'Kirovohrad', uk: 'Кіровоградська область', phone: '52', road: '12', plates: ['ВА', 'НА', 'ХА', 'ЕА'], macro: 'C' },
    luhansk: { en: 'Luhansk', uk: 'Луганська область', phone: '64', road: '13', plates: ['ВВ', 'НВ', 'ЕР', 'ЕВ'], macro: 'E' },
    lviv: { en: 'Lviv', uk: 'Львівська область', phone: '32', road: '14', plates: ['ВС', 'НС', 'СС', 'ЕС'], macro: 'W' },
    mykolaiv: { en: 'Mykolaiv', uk: 'Миколаївська область', phone: '51', road: '15', plates: ['ВЕ', 'НЕ', 'ХЕ', 'ХН'], macro: 'S' },
    odesa: { en: 'Odesa', uk: 'Одеська область', phone: '48', road: '16', plates: ['ВН', 'НН', 'ОО', 'ЕН'], macro: 'S' },
    poltava: { en: 'Poltava', uk: 'Полтавська область', phone: '53', road: '17', plates: ['ВІ', 'НІ', 'ХІ', 'ЕІ'], macro: 'C' },
    rivne: { en: 'Rivne', uk: 'Рівненська область', phone: '36', road: '18', plates: ['ВК', 'НК', 'ХК', 'ЕК'], macro: 'W' },
    sumy: { en: 'Sumy', uk: 'Сумська область', phone: '54', road: '19', plates: ['ВМ', 'НМ', 'ХМ', 'ЕМ'], macro: 'C' },
    ternopil: { en: 'Ternopil', uk: 'Тернопільська область', phone: '35', road: '20', plates: ['ВО', 'НО', 'ХО', 'ЕО'], macro: 'W' },
    kharkiv: { en: 'Kharkiv', uk: 'Харківська область', phone: '57', road: '21', plates: ['АХ', 'КХ', 'ХХ', 'ЕХ'], macro: 'E' },
    kherson: { en: 'Kherson', uk: 'Херсонська область', phone: '55', road: '22', plates: ['ВТ', 'НТ', 'ХТ', 'ЕТ'], macro: 'S' },
    khmelnytskyi: { en: 'Khmelnytskyi', uk: 'Хмельницька область', phone: '38', road: '23', plates: ['ВХ', 'НХ', 'ОХ', 'РХ'], macro: 'W' },
    cherkasy: { en: 'Cherkasy', uk: 'Черкаська область', phone: '47', road: '24', plates: ['СА', 'ІА', 'ОА', 'РА'], macro: 'C' },
    chernihiv: { en: 'Chernihiv', uk: 'Чернігівська область', phone: '46', road: '25', plates: ['СВ', 'ІВ', 'ОВ', 'РВ'], macro: 'C' },
    chernivtsi: { en: 'Chernivtsi', uk: 'Чернівецька область', phone: '37', road: '26', plates: ['СЕ', 'ІЕ', 'ОЕ', 'РЕ'], macro: 'W' },
    sevastopol: { en: 'Sevastopol', uk: 'м. Севастополь', phone: '69', road: '27', plates: ['СН', 'ІН', 'ОН', 'РН'], macro: 'CR' },
  },
  macro: [
    { id: 'W', en: 'West' },
    { id: 'C', en: 'Centre' },
    { id: 'S', en: 'South' },
    { id: 'E', en: 'East' },
    { id: 'CR', en: 'Crimea' },
  ],
};
