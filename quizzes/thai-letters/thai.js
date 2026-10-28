// Thai: its letters, for the script quizzes (../shared/reading.js says how this is written). The country is Thailand.
// Sounds are spelled as Thai names are on the map, in the Royal Thai General System (RTGS): no tones and no long
// vowels (า and ะ are both a), the breathed letters with h (ข kh, ท th, พ ph), and a consonant at the end of a syllable
// as it sounds there (ด ต ช ส are t, ร ล ญ n, บ พ p). A consonant without a vowel carries one that is not written: a,
// or o before its last letter (นคร Nakhon). Some vowels are written before their consonant (เ แ โ ใ ไ) and read
// after it, often with a part after it as well (เ◌ีย ia: เชียงใหม่ Chiang Mai). Tone marks are not written in Latin
// letters, and ์ silences the letter it stands on. In names from Pali and Sanskrit a letter between two syllables is
// spelled twice (ราชบุรี Ratchaburi, พัทลุง Phatthalung).
// No words of signs yet.
var SCRIPT = {
  name: 'Thai', script: 'thai', unicode: 'Thai', faces: 3, inherent: 'a o', carrier: 'อ',
  langs: { th: { name: 'Thai', where: 'Thailand', at: 'THA' } },
  letters: [
    { title: 'ก ข ค ฆ ง', block: 'Consonants', type: 'c', rows: [
      ['ก', 'k', 'k g kk'], ['ข', 'kh', 'kh k kkh', 'at the end: k'], ['ค', 'kh', 'kh k kkh', 'at the end: k'], ['ฆ', 'kh', 'kh k', 'rare'], ['ง', 'ng'],
    ] },
    { title: 'จ ฉ ช ซ ฌ ญ', block: 'Consonants', type: 'c', rows: [
      ['จ', 'ch', 'ch j t tch', 'at the end: t'], ['ฉ', 'ch', 'ch'], ['ช', 'ch', 'ch t tch', 'at the end: t'], ['ซ', 's', 's t', 'at the end: t'],
      ['ฌ', 'ch', 'ch', 'rare'], ['ญ', 'y', 'y n ny', 'at the end: n'],
    ] },
    { title: 'ด ต ถ ท ธ น', block: 'Consonants', type: 'c', rows: [
      ['ด', 'd', 'd t', 'at the end: t'], ['ต', 't', 't tt'], ['ถ', 'th', 'th t tt', 'at the end: t'], ['ท', 'th', 'th t tth tt', 'at the end: t'],
      ['ธ', 'th', 'th t tth tt', 'at the end: t'], ['น', 'n'],
    ] },
    { title: 'ฎ ฏ ฐ ฑ ฒ ณ', block: 'Consonants', type: 'c', rows: [
      ['ฎ', 'd', 'd t', 'at the end: t'], ['ฏ', 't', 't tt'], ['ฐ', 'th', 'th t', 'at the end: t'], ['ฑ', 'th', 'th d t', 'also d'],
      ['ฒ', 'th', 'th t', 'at the end: t'], ['ณ', 'n'],
    ] },
    { title: 'บ ป ผ ฝ พ ฟ ภ ม', block: 'Consonants', type: 'c', rows: [
      ['บ', 'b', 'b p', 'at the end: p'], ['ป', 'p'], ['ผ', 'ph', 'ph p'], ['ฝ', 'f'], ['พ', 'ph', 'ph p pph', 'at the end: p'],
      ['ฟ', 'f', 'f p', 'at the end: p'], ['ภ', 'ph', 'ph p pph', 'at the end: p'], ['ม', 'm'],
    ] },
    { title: 'ย ร ล ว', block: 'Consonants', type: 'c', rows: [
      ['ย', 'y', 'y i iy -', 'after a vowel: i'], ['ร', 'r', 'r n rn -', 'at the end: n'], ['ล', 'l', 'l n', 'at the end: n'],
      ['ว', 'w', 'w v o ua u', 'after a vowel: o; between two consonants: ua'],
    ] },
    { title: 'ศ ษ ส ห ฬ อ ฮ', block: 'Consonants', type: 'c', rows: [
      ['ศ', 's', 's t ts', 'at the end: t'], ['ษ', 's', 's t ts', 'at the end: t'], ['ส', 's', 's t ts', 'at the end: t'],
      ['ห', 'h', 'h -', 'silent before ง ญ น ม ย ร ล ว'], ['ฬ', 'l', 'l n', 'at the end: n'], ['อ', 'o', 'o -', 'silent before a vowel'], ['ฮ', 'h'],
    ] },
    { title: 'ะ ั า ำ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ะ', 'a', 'a', 'short a'], ['ั', 'a', 'a', 'short a, before the last letter'], ['า', 'a', 'a', 'long a'], ['ำ', 'am'],
    ] },
    { title: 'ิ ี ึ ื ุ ู', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ิ', 'i', 'i -', 'short i'], ['ี', 'i', 'i ee', 'long i'], ['ึ', 'ue', 'ue u eu', 'short ue'], ['ื', 'ue', 'ue u eu', 'long ue'],
      ['ุ', 'u', 'u', 'short u, under the letter'], ['ู', 'u', 'u oo', 'long u, under the letter'],
    ] },
    { title: 'เ แ โ ใ ไ', block: 'Vowels', type: 'v', rows: [
      ['เ', 'e', 'e', 'written before its letter'], ['แ', 'ae', 'ae e', 'written before its letter'], ['โ', 'o', 'o oh', 'written before its letter'],
      ['ใ', 'ai', 'ai ay', 'written before its letter'], ['ไ', 'ai', 'ai ay', 'written before its letter'],
    ] },
    { title: 'เ◌า เ◌าะ เ◌อ เ◌ิ เ◌ย', block: 'Vowels', type: 'v', plain: true, rows: [
      ['เ◌า', 'ao', 'ao au'], ['เ◌าะ', 'o', 'o oh', 'short o'], ['เ◌อ', 'oe', 'oe er'], ['เ◌ิ', 'oe', 'oe er', 'before the last letter'], ['เ◌ย', 'oei', 'oei oey'],
    ] },
    { title: 'เ◌ีย เ◌ือ ◌ัว ◌ือ ◌อ', block: 'Vowels', type: 'v', plain: true, rows: [
      ['เ◌ีย', 'ia', 'ia ie'], ['เ◌ือ', 'uea', 'uea ua'], ['◌ัว', 'ua'], ['◌ือ', 'ue', 'ue u eu'], ['◌อ', 'o'],
    ] },
    { title: '่ ้ ๊ ๋ ็ ์ ฯ', block: 'Signs', type: 's', plain: true, rows: [
      ['่', 'tone', '-', 'mai ek, a tone mark: not written'], ['้', 'tone', '-', 'mai tho, a tone mark: not written'],
      ['๊', 'tone', '-', 'mai tri, a tone mark: not written'], ['๋', 'tone', '-', 'mai chattawa, a tone mark: not written'],
      ['็', 'short', '- o', 'shortens the vowel'], ['์', 'silent', '-', 'the letter under it is not spoken'], ['ฯ', 'abbr.', '-', 'a longer name cut short: กรุงเทพฯ'],
    ] },
    { title: '๐ ๑ ๒ ๓ ๔', block: 'Digits', type: 'd', rows: [['๐', '0'], ['๑', '1'], ['๒', '2'], ['๓', '3'], ['๔', '4']] },
    { title: '๕ ๖ ๗ ๘ ๙', block: 'Digits', type: 'd', rows: [['๕', '5'], ['๖', '6'], ['๗', '7'], ['๘', '8'], ['๙', '9']] },
  ],
  mixes: [
    ['Digits', '๐ ๑ ๒ ๓ ๔ ๕ ๖ ๗ ๘ ๙'],
    ['Vowels', 'ะ ั า ำ ิ ี ึ ื ุ ู เ แ โ ใ ไ เ◌า เ◌าะ เ◌อ เ◌ิ เ◌ย เ◌ีย เ◌ือ ◌ัว ◌ือ ◌อ'],
    ['Lookalikes', 'บ ป ษ ผ ฝ พ ฟ ด ต ค ศ ถ ภ ข ช ซ ท ห น ม ฆ อ ฮ ร ธ ว ล ส'],
    ['Consonants', 'ก ข ค ฆ ง จ ฉ ช ซ ฌ ญ ด ต ถ ท ธ น ฎ ฏ ฐ ฑ ฒ ณ บ ป ผ ฝ พ ฟ ภ ม ย ร ล ว ศ ษ ส ห ฬ อ ฮ'],
  ],
  words: { themes: [] },
};

// Letters that are spelled another way together (reading.js: SCRIPT.together). A vowel written before its consonant
// is read after it: each such start of a syllable is one entry, the vowel (เ แ โ ใ ไ), the consonant it stands
// before, or two read as one (กร kr, คล khl, หน n: ห is silent there), a tone mark where there is one, and the
// vowel's part after the consonant (เ◌ีย ia). Such a pair may also be read with an a between its letters (เจริญ
// Charoen), or, with no vowel part, its second letter as the syllable's last one. Then the letters that ์ silences
// (with a vowel or ร under the same mark: ทร์, ธุ์), รร (an), and ◌ัว ◌ือ with a tone mark inside.
{
  const TONES = ['', '่', '้', '๊', '๋'], cross = (a, b) => a.flatMap(x => b.map(y => x + y)), START = {}, END = {};
  // a consonant's spellings at the start of a syllable, and at its end (its row's)
  'ก k g|ข kh k|ค kh k|ฆ kh|ง ng|จ ch j|ฉ ch|ช ch|ซ s|ฌ ch|ญ y|ฎ d|ฏ t|ฐ th|ฑ th d|ฒ th|ณ n|ด d|ต t|ถ th|ท th t|ธ th|น n|บ b|ป p|ผ ph p|ฝ f|พ ph p|ฟ f|ภ ph|ม m|ย y|ร r|ล l|ว w v|ศ s|ษ s|ส s|ห h|ฬ l|อ|ฮ h'
    .split('|').forEach(s => { const [c, ...as] = s.split(' '); START[c] = as.length ? as : ['']; });
  for (const g of SCRIPT.letters) if (g.type === 'c') for (const [c, sound, typed] of g.rows) END[c] = (typed || sound).split(' ').map(x => (x === '-' ? '' : x));
  // the starts: [letters, spellings, and for two letters: the first one's, the second one's at the end]
  const starts = Object.keys(START).map(c => [c, START[c]]);
  for (const pair of 'กร กล กว ขร ขล ขว คร คล คว ตร ปร ปล พร พล ผล บร บล ดร ฟร ฟล ทร จร ซร ศร สร'.split(' ')) {
    const [a, b] = [...pair];
    starts.push([pair, [...(pair === 'ทร' ? ['s'] : []), ...cross(START[a], START[b]), ...cross(START[a], START[b].map(x => `a${x}`)), ...(b === 'ร' ? START[a] : [])], START[a], END[b]]);
  }
  for (const b of 'งญนมยรลว') starts.push([`ห${b}`, START[b], ['h'], END[b]]);
  starts.push(['อย', ['y'], [''], END['ย']]);
  // the vowels: [before, over or under the consonant, after it, spellings]
  const VOWELS = [
    ['เ', '', '', 'e'], ['เ', '', 'ะ', 'e'], ['เ', '็', '', 'e'], ['เ', '', 'า', 'ao au'], ['เ', '', 'าะ', 'o oh'], ['เ', '', 'อ', 'oe er'],
    ['เ', '', 'อะ', 'oe'], ['เ', 'ิ', '', 'oe er'], ['เ', 'ี', 'ย', 'ia ie'], ['เ', 'ี', 'ยะ', 'ia'], ['เ', 'ื', 'อ', 'uea ua'], ['เ', 'ื', 'อะ', 'uea'],
    ['เ', '', 'ย', 'oei oey'], ['แ', '', '', 'ae e'], ['แ', '', 'ะ', 'ae'], ['แ', '็', '', 'ae e'], ['โ', '', '', 'o oh'], ['โ', '', 'ะ', 'o'],
    ['ใ', '', '', 'ai ay'], ['ไ', '', '', 'ai ay'],
  ];
  const T = SCRIPT.together = [], uniq = a => [...new Set(a)].join(' ');
  for (const [before, over, after, spell] of VOWELS) for (const [letters, as, first, last] of starts) {
    const v = spell.split(' '), all = cross(as, v);
    if (last && !over && !after) all.push(...cross(cross(first, v), last));
    for (const tone of over === '็' ? [''] : TONES) T.push([before + letters + over + tone + after, uniq(all)]);
  }
  for (const c of Object.keys(START)) for (const under of ['', 'ุ', 'ิ', 'ร']) T.push([`${c}${under}์`, '-']);
  T.push(['รร', 'an a am nr rnr']); // (or ร at the end of one syllable and at the start of the next: นครราชสีมา)
  for (const tone of TONES) T.push([`ั${tone}ว`, 'ua'], [`ื${tone}อ`, 'ue u eu']);
}
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ก":["บางกรวย","Bang Kruai"],"ข":["ขอนแก่น","Khon Kaen"],"ค":["นครราชสีมา","Nakhon Ratchasima"],"ง":["เชียงราย","Chiang Rai"],"จ":["จันทบุรี","Chanthaburi"],"ฉ":["แหลมฉบัง","Laem Chabang"],"ช":["ชลบุรี","Chonburi"],"ซ":["หนองวัวซอ","Nong Wua So"],"ญ":["คลองใหญ่","Khlong Yai"],"ด":["อุตรดิตถ์","Uttaradit"],"ต":["ตรัง","Trang"],"ถ":["เถิน","Thoen"],"ท":["นนทบุรี","Nonthaburi"],"ธ":["อุดรธานี","Udon Thani"],"น":["กาญจนบุรี","Kanchanaburi"],"ฎ":["รัษฎา","Ratsada"],"ฐ":["นครปฐม","Nakhon Pathom"],"ณ":["พิษณุโลก","Phitsanulok"],"บ":["สระบุรี","Saraburi"],"ป":["สมุทรปราการ","Samut Prakan"],"ผ":["บ้านไผ่","Ban Phai"],"พ":["พระพุทธบาท","Phra Phutthabat"],"ภ":["ภูเก็ต","Phuket"],"ม":["นครศรีธรรมราช","Nakhon Si Thammarat"],"ย":["พัทยา","Pattaya"],"ร":["ประจันตคาม","Prachantakham"],"ล":["คลองหลวง","Khlong Luang"],"ว":["นครสวรรค์","Nakhon Sawan"],"ศ":["ศรีราชา","Si Racha"],"ษ":["สุราษฎร์ธานี","Surat Thani"],"ส":["สกลนคร","Sakon Nakhon"],"ห":["เชียงใหม่","Chiang Mai"],"ฬ":["กาฬสินธุ์","Kalasin"],"อ":["หนองคาย","Nong Khai"],"ฮ":["แม่ฮ่องสอน","Mae Hong Son"],"ะ":["ระยอง","Rayong"],"ั":["สัตหีบ","Sattahip"],"า":["ยะลา","Yala"],"ำ":["ลำปาง","Lampang"],"ิ":["หัวหิน","Hua Hin"],"ี":["อุบลราชธานี","Ubon Ratchathani"],"ึ":["บ้านบึง","Ban Bueng"],"ื":["หนองปรือ","Nong Prue"],"ุ":["ราชบุรี","Ratchaburi"],"ู":["ลำลูกกา","Lam Luk Ka"],"เ":["กำแพงเพชร","Kamphaeng Phet"],"แ":["พระประแดง","Phra Pradaeng"],"โ":["ศรีมหาโพธิ","Si Maha Phot"],"ใ":["หาดใหญ่","Hat Yai"],"ไ":["สุไหงโก-ลก","Su-ngai Kolok"],"่":["กระทุ่มแบน","Krathum Baen"],"้":["บ้านโป่ง","Ban Pong"],"็":["ปากเกร็ด","Pak Kret"],"์":["กบินทร์","Kabin"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
