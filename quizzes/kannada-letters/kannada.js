// Kannada: its letters, for the script quizzes (../shared/reading.js says how this is written). It is written in
// Karnataka, whose road signs carry each name in Kannada and English, on national highways often in Hindi too.
// Sounds are spelled as names are on Indian signs and maps (the Hunterian system, without marks): long and short
// vowels alike (ಆ is a, ಈ i), the hard letters like the soft ones (ಟ and ತ both t, ಡ and ದ both d, ಣ n, ಳ l), ವ v or
// w (ಧಾರವಾಡ Dharwad). A consonant carries an a, which a vowel mark replaces and ್ takes off; a joined letter is the
// second consonant written small under or beside the first, and ರ before a consonant is a hook after it (ರ್ಕ).
// The official names keep the u at the end that older ones leave off (ಮೈಸೂರು Mysuru, once Mysore; ತುಮಕೂರು
// Tumakuru, once Tumkur); signs show both. Common endings and their spellings: -ಹಳ್ಳಿ -halli (village), -ಊರು -uru,
// -ur or -ore, -ಪುರ -pura or -pur, -ಕೆರೆ -kere, -ಪೇಟೆ -pete or -pet, -ಪಾಳ್ಯ -palya, -ಕೋಟೆ -kote or -kot, -ಕೊಪ್ಪ -koppa,
// -ಪಟ್ಟಣ -pattana or -patna.
// Letters and joined letters come in the order of how often they are written in the state's place names (Wikidata
// labels and OpenStreetMap names in Kannada), the most frequent first. Digits are not taught: signs write 0–9. Words
// of signs are not in the table yet.
var SCRIPT = {
  name: 'Kannada', script: 'knda', unicode: 'Kannada', faces: 4, inherent: 'a', carrier: 'ಕ',
  langs: { kn: { name: 'Kannada', where: 'Karnataka', at: 'IND' } },
  letters: [
    { title: 'ಳ ರ ಕ ನ ಗ ಹ ಲ ಡ', block: 'Consonants', type: 'c', rows: [
      ['ಳ', 'la', 'l', 'hard l'], ['ರ', 'ra', 'r'], ['ಕ', 'ka', 'k c'], ['ನ', 'na', 'n'], ['ಗ', 'ga', 'g'], ['ಹ', 'ha', 'h'], ['ಲ', 'la', 'l'], ['ಡ', 'da', 'd', 'hard d'],
    ] },
    { title: 'ಿ ಾ ು ೆ ೇ ೊ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ಿ', 'i', 'i y'], ['ಾ', 'a', 'a aa', 'long a'], ['ು', 'u', 'u -', 'left off at the end of older names'], ['ೆ', 'e'], ['ೇ', 'e', 'e', 'long e'], ['ೊ', 'o'],
    ] },
    { title: 'ಂ ಃ', block: 'Signs', type: 's', plain: true, rows: [['ಂ', 'n, m', 'n m ng'], ['ಃ', 'h', 'h -']] },
    { title: 'ಪ ಮ ಟ ದ ಬ ವ ತ ಸ', block: 'Consonants', type: 'c', rows: [
      ['ಪ', 'pa', 'p'], ['ಮ', 'ma', 'm'], ['ಟ', 'ta', 't', 'hard t'], ['ದ', 'da', 'd'], ['ಬ', 'ba', 'b'], ['ವ', 'va', 'v w', 'or wa'], ['ತ', 'ta', 't th', 'or tha'], ['ಸ', 'sa', 's'],
    ] },
    { title: 'ೂ ೋ ೀ ೈ ೌ ೃ ್', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ೂ', 'u', 'u oo', 'long u'], ['ೋ', 'o', 'o', 'long o'], ['ೀ', 'i', 'i ee', 'long i'], ['ೈ', 'ai', 'ai y ei ay'], ['ೌ', 'au', 'au ow ou'],
      ['ೃ', 'ri', 'ri ru r'], ['್', 'no a', '-', 'takes the vowel off'],
    ] },
    { title: 'Joined · doubled', block: 'Joined', type: 'j', rows: [
      ['ಳ್ಳ', 'lla', 'll l', 'hard l'], ['ಟ್ಟ', 'tta', 'tt t'], ['ಲ್ಲ', 'lla', 'll l'], ['ಪ್ಪ', 'ppa', 'pp p'], ['ಕ್ಕ', 'kka', 'kk k'], ['ಡ್ಡ', 'dda', 'dd d'],
      ['ನ್ನ', 'nna', 'nn n'], ['ತ್ತ', 'tta', 'tt t th'], ['ಮ್ಮ', 'mma', 'mm m'],
    ] },
    { title: 'ಯ ಚ ಣ ಜ ಶ ಭ ಘ ಖ ಷ', block: 'Consonants', type: 'c', rows: [
      ['ಯ', 'ya', 'y'], ['ಚ', 'cha', 'ch c'], ['ಣ', 'na', 'n', 'hard n'], ['ಜ', 'ja', 'j z'], ['ಶ', 'sha', 'sh s'], ['ಭ', 'bha', 'bh'], ['ಘ', 'gha', 'gh'],
      ['ಖ', 'kha', 'kh'], ['ಷ', 'sha', 'sh s'],
    ] },
    { title: 'ಅ ಆ ಉ ಇ ಎ ಔ', block: 'Vowels', type: 'v', rows: [
      ['ಅ', 'a'], ['ಆ', 'a', 'a aa', 'long a'], ['ಉ', 'u'], ['ಇ', 'i'], ['ಎ', 'e', 'e ye'], ['ಔ', 'au', 'au ow ou'],
    ] },
    { title: 'Joined · with ರ', block: 'Joined', type: 'j', rows: [
      ['ದ್ರ', 'dra', 'dr'], ['ರ್ಲ', 'rla', 'rl', 'ರ before ಲ: a hook after it'], ['ರ್ಕ', 'rka', 'rk', 'ರ before ಕ: a hook after it'],
      ['ರ್ಗ', 'rga', 'rg', 'ರ before ಗ: a hook after it'], ['ಗ್ರ', 'gra', 'gr'], ['ತ್ರ', 'tra', 'tr thr'], ['ರ್ತ', 'rta', 'rt rth', 'ರ before ತ: a hook after it'],
      ['ಬ್ರ', 'bra', 'br'], ['ಶ್ರ', 'shra', 'shr sr', 'ಶ್ರೀ Sri'],
    ] },
    { title: 'Joined · doubled 2', block: 'Joined', type: 'j', rows: [
      ['ದ್ದ', 'dda', 'dd d'], ['ಬ್ಬ', 'bba', 'bb b'], ['ಣ್ಣ', 'nna', 'nn n'], ['ಗ್ಗ', 'gga', 'gg g'], ['ಜ್ಜ', 'jja', 'jj j'], ['ಯ್ಯ', 'yya', 'yy y'],
      ['ಚ್ಚ', 'chcha', 'chch cch ch'],
    ] },
    { title: 'ಐ ಓ ಈ ಏ ಒ ಊ ಋ', block: 'Vowels', type: 'v', rows: [
      ['ಐ', 'ai', 'ai ei ay'], ['ಓ', 'o', 'o', 'long o'], ['ಈ', 'i', 'i ee', 'long i'], ['ಏ', 'e', 'e ye', 'long e'], ['ಒ', 'o'], ['ಊ', 'u', 'u oo', 'long u'],
      ['ಋ', 'ri', 'ri ru r'],
    ] },
    { title: 'ಧ ಠ ಥ ಫ ಝ ಛ ಢ ಞ ಙ', block: 'Consonants', type: 'c', rows: [
      ['ಧ', 'dha', 'dh'], ['ಠ', 'tha', 'th', 'hard th'], ['ಥ', 'tha', 'th'], ['ಫ', 'pha', 'ph f'], ['ಝ', 'jha', 'jh z'], ['ಛ', 'chha', 'chh ch'],
      ['ಢ', 'dha', 'dh', 'hard dh'], ['ಞ', 'nya', 'ny n gn'], ['ಙ', 'nga', 'ng n'],
    ] },
    { title: 'Joined · with ಯ and others', block: 'Joined', type: 'j', rows: [
      ['ಳ್ಯ', 'lya', 'ly l', 'ಪಾಳ್ಯ palya'], ['ಡ್ಲ', 'dla', 'dl'], ['ಶ್ವ', 'shwa', 'shw shv sw sv'], ['ಕ್ಯ', 'kya', 'ky k'], ['ಸ್ತ', 'sta', 'st'],
      ['ಕ್ಷ', 'ksha', 'ksh ks x'],
    ] },
  ],
  mixes: [
    ['Vowels and vowel marks', 'ಅ ಆ ಇ ಈ ಉ ಊ ಋ ಎ ಏ ಐ ಒ ಓ ಔ ಾ ಿ ೀ ು ೂ ೃ ೆ ೇ ೈ ೊ ೋ ೌ'],
    ['Lookalikes', 'ಪ ಫ ಘ ಬ ಭ ಛ ಚ ಟ ದ ಧ ಥ ಡ ಢ ಯ ಝ ನ ಸ ಠ ರ ಎ ಏ ಒ ಓ ಉ ಊ'],
    ['Joined letters', 'ಳ್ಳ ಟ್ಟ ಲ್ಲ ಪ್ಪ ಕ್ಕ ಡ್ಡ ನ್ನ ತ್ತ ಮ್ಮ ದ್ರ ರ್ಲ ರ್ಕ ರ್ಗ ಗ್ರ ತ್ರ ರ್ತ ಬ್ರ ಶ್ರ ದ್ದ ಬ್ಬ ಣ್ಣ ಗ್ಗ ಜ್ಜ ಯ್ಯ ಚ್ಚ ಳ್ಯ ಡ್ಲ ಶ್ವ ಕ್ಯ ಸ್ತ ಕ್ಷ'],
    ['Consonants', 'ಳ ರ ಕ ನ ಗ ಹ ಲ ಡ ಪ ಮ ಟ ದ ಬ ವ ತ ಸ ಯ ಚ ಣ ಜ ಶ ಭ ಘ ಖ ಷ ಧ ಠ ಥ ಫ ಝ ಛ ಢ ಞ ಙ'],
  ],
  // The words of signs: none yet.
  words: { themes: [], mixes: [] },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ಳ":["ಮುಧೋಳ","Mudhol"],"ರ":["ಶಿರಾ","Sira"],"ಕ":["ಗೋಕಾಕ","Gokak"],"ನ":["ರಾಮನಗರ","Ramanagara"],"ಗ":["ಚಾಮರಾಜನಗರ","Chamarajanagar"],"ಹ":["ಹರಿಹರ","Harihar"],"ಲ":["ಕಲಬುರಗಿ","Kalaburagi"],"ಡ":["ದಾಂಡೇಲಿ","Dandeli"],"ಿ":["ಸಿರ್ಸಿ","Sirsi"],"ಾ":["ಕಾರವಾರ","Karwar"],"ು":["ಕನಕಪುರ","Kanakapura"],"ೆ":["ಬೆಂಗಳೂರು","Bengaluru"],"ೇ":["ಹಾವೇರಿ","Haveri"],"ೊ":["ಹೊಸಪೇಟೆ","Hosapete"],"ಂ":["ಚಿಂತಾಮಣಿ","Chintamani"],"ಪ":["ಚನ್ನಪಟ್ಟಣ","Channapatna"],"ಮ":["ಮಂಡ್ಯ","Mandya"],"ಟ":["ತಿಪಟೂರು","Tiptur"],"ದ":["ಗದಗ","Gadag"],"ಬ":["ಬೆಳಗಾವಿ","Belagavi"],"ವ":["ಗಂಗಾವತಿ","Gangavathi"],"ತ":["ತುಮಕೂರು","Tumakuru"],"ಸ":["ಮೈಸೂರು","Mysuru"],"ೂ":["ಮಂಗಳೂರು","Mangaluru"],"ೋ":["ಕೋಲಾರ","Kolar"],"ೀ":["ಬೀದರ್","Bidar"],"ೈ":["ಬೈಲಹೊಂಗಲ","Bailhongal"],"ೌ":["ಗೌರಿಬಿದನೂರು","Gauribidanur"],"್":["ಶಹಾಬಾದ್","Shahabad"],"ಳ್ಳ":["ಬಳ್ಳಾರಿ","Ballari"],"ಟ್ಟ":["ರಬಕವಿ ಬನಹಟ್ಟಿ","Rabkavi-Banhatti"],"ಪ್ಪ":["ಕೊಪ್ಪಳ","Koppal"],"ಕ್ಕ":["ಚಿಕ್ಕಬಳ್ಳಾಪುರ","Chikkaballapur"],"ಡ್ಡ":["ದೊಡ್ಡಬಳ್ಳಾಪುರ","Doddaballapura"],"ನ್ನ":["ರಾಣೇಬೆನ್ನೂರು","Ranebennur"],"ತ್ತ":["ಪುತ್ತೂರು","Puttur"],"ಯ":["ಹಿರಿಯೂರು","Hiriyur"],"ಚ":["ಚಿಕ್ಕಮಗಳೂರು","Chikmagalur"],"ಣ":["ದಾವಣಗೆರೆ","Davanagere"],"ಜ":["ವಿಜಯಪುರ","Vijayapura"],"ಶ":["ಶಹಾಪುರ","Shahapur"],"ಭ":["ಭಾಲ್ಕಿ","Bhalki"],"ಘ":["ಶಿಡ್ಲಘಟ್ಟ","Sidlaghatta"],"ಖ":["ಜಮಖಂಡಿ","Jamakhandi"],"ಷ":["ಲಕ್ಷ್ಮೇಶ್ವರ","Lakshmeshwara"],"ಅ":["ಅರಸೀಕೆರೆ","Arsikere"],"ಆ":["ಆನೇಕಲ್","Anekal"],"ಉ":["ಉಡುಪಿ","Udupi"],"ಇ":["ಇಲಕಲ","Ilkal"],"ದ್ರ":["ಭದ್ರಾವತಿ","Bhadravathi"],"ರ್ಗ":["ರಾಮದುರ್ಗ","Ramdurg"],"ತ್ರ":["ಚಿತ್ರದುರ್ಗ","Chitradurga"],"ದ್ದ":["ಮುದ್ದೇಬಿಹಾಳ","Muddebihal"],"ಬ್ಬ":["ಹುಬ್ಬಳ್ಳಿ","Hubballi"],"ಗ್ಗ":["ಶಿವಮೊಗ್ಗ","Shivamogga"],"ಧ":["ಸಿಂಧನೂರು","Sindhanur"],"ಥ":["ಅಥಣಿ","Athani"],"ಡ್ಲ":["ಶಿಡ್ಲಘಟ್ಟ","Sidlaghatta"],"ಶ್ವ":["ಸಂಕೇಶ್ವರ","Sankeshwar"],"ಕ್ಷ":["ಲಕ್ಷ್ಮೇಶ್ವರ","Lakshmeshwara"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
