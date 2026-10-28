// Khmer: its letters, for the script quizzes (../shared/reading.js says how this is written). The country is Cambodia.
// Sounds are spelled as Cambodian names are on the map: the UNGEGN romanisation (BGN/PCGN 1972) without its marks,
// the Geographic Department's (GeoNames: Preaek, Kouk, Daeum) and the spellings of the signs (Phnom Penh, Siem Reap,
// Kampong Cham). A consonant is of the a-series (ក ka) or the o-series (គ ko), and a vowel after an o-letter is read
// another way: កា ka, គា kea; a vowel's tile names both (a, ea). A consonant carries a vowel, a or o by its series,
// which a vowel mark replaces; ្ puts the next consonant under it, and the two are read together (ក្រ kra). ៉ makes an
// o-letter an a-letter (ប៉ pa), ៊ the other way. ់ shortens the vowel and ៍ silences the letter it stands on.
// No words of signs yet.
var SCRIPT = {
  name: 'Khmer', script: 'khmr', unicode: 'Khmer', faces: 3, inherent: 'a o u ea', carrier: 'អ',
  langs: { km: { name: 'Khmer', where: 'Cambodia', at: 'KHM' } },
  letters: [
    { title: 'ក ខ គ ឃ ង', block: 'Consonants', type: 'c', rows: [
      ['ក', 'ka', 'k g'], ['ខ', 'kha', 'kh k'], ['គ', 'ko', 'k g', 'o-series'], ['ឃ', 'kho', 'kh k', 'o-series'], ['ង', 'ngo', 'ng', 'o-series'],
    ] },
    { title: 'ច ឆ ជ ឈ ញ', block: 'Consonants', type: 'c', rows: [
      ['ច', 'cha', 'ch c j'], ['ឆ', 'chha', 'chh ch'], ['ជ', 'cho', 'ch j', 'o-series'], ['ឈ', 'chho', 'chh ch', 'o-series'], ['ញ', 'nho', 'nh n ny gn', 'o-series'],
    ] },
    { title: 'ដ ឋ ឌ ឍ ណ', block: 'Consonants', type: 'c', rows: [
      ['ដ', 'da', 'd t'], ['ឋ', 'tha', 'th t', 'rare'], ['ឌ', 'do', 'd t', 'o-series, rare'], ['ឍ', 'tho', 'th t', 'o-series, rare'], ['ណ', 'na', 'n'],
    ] },
    { title: 'ត ថ ទ ធ ន', block: 'Consonants', type: 'c', rows: [
      ['ត', 'ta', 't d'], ['ថ', 'tha', 'th t'], ['ទ', 'to', 't d', 'o-series'], ['ធ', 'tho', 'th t', 'o-series'], ['ន', 'no', 'n', 'o-series'],
    ] },
    { title: 'ប ប៉ ផ ព ភ ម', block: 'Consonants', type: 'c', rows: [
      ['ប', 'ba', 'b p', 'at the end: b or p'], ['ប៉', 'pa', 'p', 'ប with ៉'], ['ផ', 'pha', 'ph p'], ['ព', 'po', 'p b', 'o-series'], ['ភ', 'pho', 'ph p', 'o-series'],
      ['ម', 'mo', 'm', 'o-series'],
    ] },
    { title: 'យ រ ល វ', block: 'Consonants', type: 'c', rows: [
      ['យ', 'yo', 'y i', 'o-series'], ['រ', 'ro', 'r -', 'o-series; often silent at the end'], ['ល', 'lo', 'l', 'o-series'], ['វ', 'vo', 'v w o', 'o-series; at the end: v or o'],
    ] },
    { title: 'ស ហ ឡ អ', block: 'Consonants', type: 'c', rows: [
      ['ស', 'sa', 's h', 'at the end: s or h'], ['ហ', 'ha', 'h'], ['ឡ', 'la', 'l'], ['អ', 'a', '-', 'carries a vowel: not written'],
    ] },
    { title: 'ា ិ ី ឹ ឺ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ា', 'a, ea', 'a ea oa', 'ea after an o-letter'], ['ិ', 'e, i', 'e i', 'i after an o-letter'], ['ី', 'ei, i', 'ei i ey', 'i after an o-letter'],
      ['ឹ', 'oe, ue', 'oe ue eu u', 'ue after an o-letter'], ['ឺ', 'eu, ueu', 'eu ueu oe u', 'ueu after an o-letter'],
    ] },
    { title: 'ុ ូ ួ ើ ឿ ៀ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ុ', 'o, u', 'o u ou', 'u after an o-letter'], ['ូ', 'ou, u', 'ou u o oo', 'u after an o-letter'], ['ួ', 'uo', 'uo ua ou'],
      ['ើ', 'aeu, eu', 'aeu eu oeu ae', 'written around its letter; eu after an o-letter'], ['ឿ', 'oea', 'oea eu eua ueu oeu', 'written around its letter'],
      ['ៀ', 'ie', 'ie ia iea ea', 'written around its letter'],
    ] },
    { title: 'េ ែ ៃ ោ ៅ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['េ', 'e', 'e ei ay', 'written before its letter'], ['ែ', 'ae, eae', 'ae eae e', 'written before its letter; eae after an o-letter'],
      ['ៃ', 'ai, ey', 'ai ey ay', 'written before its letter; ey after an o-letter'], ['ោ', 'ao, ou', 'ao o ou oa', 'written around its letter; ou after an o-letter'],
      ['ៅ', 'au, ov', 'au ov ou o ao', 'written around its letter; ov after an o-letter'],
    ] },
    { title: 'ំ ះ ់ ័ ៈ', block: 'Signs', type: 'm', plain: true, rows: [
      ['ំ', 'am, um', 'am om um', 'um after an o-letter'], ['ះ', 'ah, eah', 'ah eah h', 'h after a vowel'], ['់', 'short', '-', 'shortens the vowel'],
      ['័', 'a, ea', 'a ea oa e', 'short a'], ['ៈ', 'a', 'a ak eak', 'short a'],
    ] },
    { title: '៉ ៊ ៍ ៌', block: 'Signs', type: 'm', plain: true, rows: [
      ['៉', 'a-series', '-', 'makes an o-letter an a-letter: ម៉ា ma'], ['៊', 'o-series', '-', 'makes an a-letter an o-letter: ស៊ី si'],
      ['៍', 'silent', '-', 'the letter under it is not spoken'], ['៌', 'r', 'r -', 'r over the letter'],
    ] },
    { title: 'ឥ ឦ ឧ ឩ ឪ ឫ ឬ', block: 'Vowels', type: 'v', rows: [
      ['ឥ', 'e', 'e i'], ['ឦ', 'ei', 'ei i'], ['ឧ', 'o, u', 'o u ou'], ['ឩ', 'ou, u', 'ou u'], ['ឪ', 'au', 'au ov'], ['ឫ', 'rue', 'rue ru reu'], ['ឬ', 'rueu', 'rueu ru reu'],
    ] },
    { title: 'ឭ ឮ ឯ ឰ ឱ ឲ ឳ', block: 'Vowels', type: 'v', rows: [
      ['ឭ', 'lue', 'lue lu', 'rare'], ['ឮ', 'lueu', 'lueu lu', 'rare'], ['ឯ', 'ae', 'ae e'], ['ឰ', 'ai', 'ai'], ['ឱ', 'ao', 'ao o'], ['ឲ', 'ao', 'ao o'], ['ឳ', 'au', 'au ou'],
    ] },
    { title: '្ក ្ខ ្គ ្ឃ ្ង', block: 'Subscripts', type: 'p', plain: true, rows: [
      ['្ក', 'ka', 'k g'], ['្ខ', 'kha', 'kh k'], ['្គ', 'ko', 'k g -', 'often silent at the end'], ['្ឃ', 'kho', 'kh k'], ['្ង', 'ngo', 'ng'],
    ] },
    { title: '្ច ្ឆ ្ជ ្ឈ ្ញ', block: 'Subscripts', type: 'p', plain: true, rows: [['្ច', 'cha', 'ch c j'], ['្ឆ', 'chha', 'chh ch'], ['្ជ', 'cho', 'ch j'], ['្ឈ', 'chho', 'chh ch'], ['្ញ', 'nho', 'nh n ny']] },
    { title: '្ដ ្ឋ ្ឌ ្ឍ ្ណ', block: 'Subscripts', type: 'p', plain: true, rows: [
      ['្ដ', 'da', 'd t', 'looks like ្ត'], ['្ឋ', 'tha', 'th t'], ['្ឌ', 'do', 'd t'], ['្ឍ', 'tho', 'th t'], ['្ណ', 'na', 'n'],
    ] },
    { title: '្ត ្ថ ្ទ ្ធ ្ន', block: 'Subscripts', type: 'p', plain: true, rows: [
      ['្ត', 'ta', 't d', 'looks like ្ដ'], ['្ថ', 'tha', 'th t'], ['្ទ', 'to', 't d -', 'often silent at the end'], ['្ធ', 'tho', 'th t'], ['្ន', 'no', 'n'],
    ] },
    { title: '្ប ្ផ ្ព ្ភ ្ម', block: 'Subscripts', type: 'p', plain: true, rows: [['្ប', 'ba', 'b p'], ['្ផ', 'pha', 'ph p'], ['្ព', 'po', 'p b'], ['្ភ', 'pho', 'ph p'], ['្ម', 'mo', 'm']] },
    { title: '្យ ្រ ្ល ្វ ្ស ្ហ ្អ', block: 'Subscripts', type: 'p', plain: true, rows: [
      ['្យ', 'yo', 'y -'], ['្រ', 'ro', 'r', 'written before its letter'], ['្ល', 'lo', 'l'], ['្វ', 'vo', 'v w'], ['្ស', 'sa', 's'], ['្ហ', 'ha', 'h'], ['្អ', 'a', '-'],
    ] },
    { title: '០ ១ ២ ៣ ៤', block: 'Digits', type: 'd', rows: [['០', '0'], ['១', '1'], ['២', '2'], ['៣', '3'], ['៤', '4']] },
    { title: '៥ ៦ ៧ ៨ ៩', block: 'Digits', type: 'd', rows: [['៥', '5'], ['៦', '6'], ['៧', '7'], ['៨', '8'], ['៩', '9']] },
  ],
  mixes: [
    ['Digits', '០ ១ ២ ៣ ៤ ៥ ៦ ៧ ៨ ៩'],
    ['Vowel marks', 'ា ិ ី ឹ ឺ ុ ូ ួ ើ ឿ ៀ េ ែ ៃ ោ ៅ ំ ះ ័ ៈ'],
    ['Lookalikes', 'ក ត ខ ច គ ន ឃ ឈ ហ ដ ឌ ជ ឋ ប ថ ធ ទ ឡ ព ម'],
    ['Subscripts', '្ក ្ខ ្គ ្ឃ ្ង ្ច ្ឆ ្ជ ្ឈ ្ញ ្ដ ្ឋ ្ឌ ្ឍ ្ណ ្ត ្ថ ្ទ ្ធ ្ន ្ប ្ផ ្ព ្ភ ្ម ្យ ្រ ្ល ្វ ្ស ្ហ ្អ'],
    ['Consonants', 'ក ខ គ ឃ ង ច ឆ ជ ឈ ញ ដ ឋ ឌ ឍ ណ ត ថ ទ ធ ន ប ប៉ ផ ព ភ ម យ រ ល វ ស ហ ឡ អ'],
  ],
  // vowels and signs read another way together, and the letters ៍ silences
  together: [
    ['ាំ', 'am oam eam'], ['ាំង', 'ang eang oang'], ['ុំ', 'om um'], ['េះ', 'eh'], ['ោះ', 'aoh oh uoh ah'], ['ុះ', 'oh uh'], ['ិះ', 'eh ih is'],
    ['ែះ', 'aeh eh'], ['ើះ', 'aeuh euh'], ['័យ', 'ai ey ay'],
    ...[...'កខគឃងចឆជឈញដឋឌឍណតថទធនបផពភមយរលវសហឡអ'].flatMap(c => [[`${c}៍`, '-'], [`${c}ិ៍`, '-'], [`${c}ុ៍`, '-']]),
  ],
  words: { themes: [] },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ក":["កែប","Kep"],"ខ":["ត្រពាំងសាលាខាងលិច","Trapeang Sala Khang Lech"],"គ":["គោលាប់","Kou Loab"],"ង":["កោះទ្រង់","Kaôh Trŭng"],"ច":["កំពង់ចាម","Kampong Cham"],"ឆ":["កំពង់ឆ្នាំង","Kampong Chhnang"],"ជ":["កៀនជ្រៃ","Kien Chrey"],"ញ":["ភ្នំពេញ","Phnom Penh"],"ដ":["ដើមដូង","Daeum Doung"],"ណ":["រកាកណ្តាល","Roka Kandal"],"ត":["តាកែវ","Takeo"],"ថ":["កំពង់ថ្កូវ","Kampong Thkov"],"ទ":["ស្ទឹងឆាយ","Stueng Chhay"],"ធ":["កំពង់ធំ","Kampong Thom"],"ន":["បានលុង","Banlung"],"ប":["បាត់ដំបង","Battambang"],"ប៉":["ប៉ោយប៉ែត","Poipet"],"ផ":["លំផាត់","Lumphat"],"ព":["ត្រពាំងចាន់","Trapeang Chan"],"ភ":["ភ្នំពេញ","Phnom Penh"],"ម":["ផាក់ណាម","Phaknam"],"យ":["យាង","Yeang"],"រ":["រំចេក","Rumchek"],"ល":["លង្វែក","Longvek"],"វ":["ព្រៃវែង","Prey Veng"],"ស":["កោះសំរោង","Kaoh Samraong"],"ហ":["ហាន់ជ័យ","Han Chey"],"អ":["អន្លង់វិល","Anlong Vil"],"ា":["នាងសាវ","Neang Sav"],"ិ":["បាវិត","Bavet"],"ី":["សិរីសោភ័ណ","Serei Saophoan"],"ឹ":["បឹងមាលា","Boeng Mealea"],"ុ":["ឆ្នុកទ្រូ","Chhnok Tru"],"ូ":["ឆ្លូង","Chhloung"],"ួ":["សួង","Suong"],"ើ":["ត្រពាំងសាលាខាងកើត","Trapeang Sala Khang Kaeut"],"ឿ":["អ្នកលឿង","Neak Leung"],"ៀ":["សៀមរាប","Siem Reap"],"េ":["មេមត់","Memot"],"ែ":["ព្រែកប្រសប់","Preaek Prasab"],"ៃ":["ប៉ៃលិន","Pailin"],"ោ":["សំរោង","Samraong"],"ៅ":["តាខ្មៅ","Ta Khmau"],"ំ":["កំពត","Kampot"],"ះ":["បះកែ","Băh Kê"],"់":["អន្លង់រុន","Anlong Run"],"័":["សិរីសោភ័ណ","Serei Saophoan"],"៉":["ព្រែកសាម៉ាន់","Preaek Saman"],"ឧ":["ឧដុង្គ","Oudong"],"្ក":["កំពង់ថ្កូវ","Kampong Thkov"],"្គ":["ឧដុង្គ","Oudong"],"្ច":["អញ្ចាញរូង","Anhchanh Rung"],"្ជ":["កញ្ជរ","Kanhchor"],"្ត":["ក្តុល","Kdol"],"្ទ":["ស្ទឹងត្រែង","Stung Treng"],"្ន":["ស្នួល","Snuol"],"្ព":["ខ្ពបអាទាវ","Khpob Ateav"],"្ម":["តាខ្មៅ","Ta Khmau"],"្យ":["សែនមនោរម្យ","Senmonorom"],"្រ":["ពង្រ","Pongro"],"្ល":["អន្លង់វែង","Anlong Veng"],"្វ":["ស្វាយរៀង","Svay Rieng"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
