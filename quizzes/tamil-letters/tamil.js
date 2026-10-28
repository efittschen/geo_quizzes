// Tamil: its letters, for the script quizzes (../shared/reading.js says how this is written). The countries are Sri
// Lanka (the north and east, where road signs carry Tamil next to Sinhala and English), India (Tamil Nadu and
// Puducherry) and Singapore.
// Sounds are spelled as Sri Lankan names are on the map and on those signs: long and short vowels alike (ஆ is a, ஈ i),
// the three n (ந ண ன) as n, the three l (ல ள ழ) as l (Yalpanam; zh in some Indian names: Kuzhithurai), ர and ற
// as r. Tamil has one letter for a sound and its voiced pair, read by its place: ட is d between vowels and t when
// doubled (Kodikamam, Pottuvil), க k or g, ச ch or s, த th, t or d, ப p or b; after a nasal it is voiced (ம்ப mb, ண்ட nd),
// and a doubled one is often written once (பருத்தித்துறை Paruthithurai). Those pairs are taught as joined letters.
// A consonant carries an a, which a vowel mark replaces and ் takes off. Digits are not taught: signs write 0–9.
// Words of signs are not in the table yet.
var SCRIPT = {
  name: 'Tamil', script: 'taml', unicode: 'Tamil', faces: 3, inherent: 'a', carrier: 'க',
  langs: { ta: { name: 'Tamil', where: 'Sri Lanka · India · Singapore', at: 'LKA', label: 'Sri Lanka' } },
  letters: [
    { title: 'அ ஆ இ ஈ உ ஊ', block: 'Vowels', type: 'v', rows: [
      ['அ', 'a'], ['ஆ', 'a', 'a aa', 'long a'], ['இ', 'i'], ['ஈ', 'i', 'i ee ii', 'long i'], ['உ', 'u'], ['ஊ', 'u', 'u oo uu', 'long u'],
    ] },
    { title: 'எ ஏ ஐ ஒ ஓ ஔ', block: 'Vowels', type: 'v', rows: [
      ['எ', 'e', 'e ye'], ['ஏ', 'e', 'e ee ae ye', 'long e'], ['ஐ', 'ai', 'ai ei ay'], ['ஒ', 'o'], ['ஓ', 'o', 'o oo', 'long o'], ['ஔ', 'au', 'au ow ou'],
    ] },
    { title: 'க ங ச ஞ ட ண', block: 'Consonants', type: 'c', rows: [
      ['க', 'ka', 'k g c h', 'or ga'], ['ங', 'nga', 'ng n'], ['ச', 'cha', 'ch s c j sh', 'or sa'], ['ஞ', 'nya', 'ny nj gn n'],
      ['ட', 'da', 'd t', 'hard d; t when doubled'], ['ண', 'na', 'n', 'hard n'],
    ] },
    { title: 'த ந ப ம ய ர', block: 'Consonants', type: 'c', rows: [
      ['த', 'tha', 'th t d dh', 'or ta, da'], ['ந', 'na', 'n'], ['ப', 'pa', 'p b', 'or ba'], ['ம', 'ma', 'm'], ['ய', 'ya', 'y'], ['ர', 'ra', 'r'],
    ] },
    { title: 'ல வ ழ ள ற ன', block: 'Consonants', type: 'c', rows: [
      ['ல', 'la', 'l'], ['வ', 'va', 'v w'], ['ழ', 'la', 'l zh lh', 'zh in India'], ['ள', 'la', 'l', 'hard l'], ['ற', 'ra', 'r', 'hard r'], ['ன', 'na', 'n'],
    ] },
    { title: 'ஜ ஷ ஸ ஹ க்ஷ ஸ்ரீ', block: 'Consonants', type: 'c', rows: [
      ['ஜ', 'ja', 'j'], ['ஷ', 'sha', 'sh s'], ['ஸ', 'sa', 's'], ['ஹ', 'ha', 'h'], ['க்ஷ', 'ksha', 'ksh ks x'], ['ஸ்ரீ', 'sri', 'sri shri sree shree'],
    ] },
    { title: 'ா ி ீ ு ூ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ா', 'a', 'a aa', 'long a'], ['ி', 'i'], ['ீ', 'i', 'i ee ii', 'long i'], ['ு', 'u', 'u', 'joined to its letter: கு டு ரு'],
      ['ூ', 'u', 'u oo uu', 'long u, joined to its letter: கூ டூ ரூ'],
    ] },
    { title: 'ெ ே ை ொ ோ ௌ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ெ', 'e', 'e', 'written before its letter'], ['ே', 'e', 'e ee ae', 'long e, written before its letter'], ['ை', 'ai', 'ai ei ay', 'written before its letter'],
      ['ொ', 'o', 'o', 'written around its letter'], ['ோ', 'o', 'o oo', 'long o, written around its letter'], ['ௌ', 'au', 'au ow ou', 'written around its letter'],
    ] },
    { title: 'ஃ ்', block: 'Signs', type: 'm', plain: true, rows: [['ஃ', 'h', 'h -', 'rare'], ['்', 'no a', '-', 'takes the vowel off']] },
    { title: 'Doubled', block: 'Joined', type: 'j', rows: [
      ['க்க', 'kka', 'kk k'], ['ச்ச', 'chcha', 'chch cch ch ss s'], ['ட்ட', 'tta', 'tt t dd d'], ['த்த', 'ttha', 'thth tth th tt t', 'often th or tt'],
      ['ப்ப', 'ppa', 'pp p'], ['ற்ற', 'tra', 'tr ttr tt rr', 'spoken ttr'],
    ] },
    { title: 'After a nasal', block: 'Joined', type: 'j', rows: [
      ['ங்க', 'nga', 'ng ngk nk ngg'], ['ஞ்ச', 'nja', 'nj nch ns ny nc'], ['ண்ட', 'nda', 'nd nt'], ['ந்த', 'ntha', 'nth nd nt ndh'],
      ['ம்ப', 'mba', 'mb mp'], ['ன்ற', 'ndra', 'ndr nr nd ntr nn', 'spoken ndr'],
    ] },
  ],
  mixes: [
    ['Vowels and vowel marks', 'அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ ா ி ீ ு ூ ெ ே ை ொ ோ ௌ'],
    ['Lookalikes', 'ப ய ல வ ந த ண ன ள ழ ம ஐ ஜ ர ா'],
    ['Consonants', 'க ங ச ஞ ட ண த ந ப ம ய ர ல வ ழ ள ற ன ஜ ஷ ஸ ஹ க்ஷ ஸ்ரீ'],
    ['Joined letters', 'க்க ச்ச ட்ட த்த ப்ப ற்ற ங்க ஞ்ச ண்ட ந்த ம்ப ன்ற'],
  ],
  // The words of signs: none yet.
  words: { themes: [], mixes: [] },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ஆ":["ஆவடி","Avadi"],"ஏ":["ஏறாவூர்","Eravur"],"க":["வாகரை","Vakarai"],"ச":["சிவகாசி","Sivakasi"],"ஞ":["தஞ்சாவூர்","Thanjavur"],"ட":["தூத்துக்குடி","Thoothukudi"],"த":["வல்வெட்டித்துறை","Valvettithurai"],"ந":["கிளிநொச்சி","Kilinochchi"],"ப":["பொத்துவில்","Pottuvil"],"ம":["கல்முனை","Kalmunai"],"ய":["வவுனியா","Vavuniya"],"ர":["மன்னார்","Mannar"],"ல":["கல்முனை","Kalmunai"],"வ":["வல்வெட்டித்துறை","Valvettithurai"],"ள":["திருச்சிராப்பள்ளி","Tiruchirappalli"],"ற":["வல்வெட்டித்துறை","Valvettithurai"],"ன":["மன்னார்","Mannar"],"ா":["வவுனியா","Vavuniya"],"ி":["வல்வெட்டித்துறை","Valvettithurai"],"ீ":["முல்லைத்தீவு","Mullaitivu"],"ு":["கல்முனை","Kalmunai"],"ூ":["கரூர்","Karur"],"ெ":["சென்னை","Chennai"],"ே":["திருநெல்வேலி","Tirunelveli"],"ை":["மதுரை","Madurai"],"ொ":["பொத்துவில்","Pottuvil"],"்":["கல்முனை","Kalmunai"],"க்க":["தூத்துக்குடி","Thoothukudi"],"ச்ச":["கிளிநொச்சி","Kilinochchi"],"ட்ட":["வல்வெட்டித்துறை","Valvettithurai"],"த்த":["வல்வெட்டித்துறை","Valvettithurai"],"ப்ப":["திருப்பூர்","Tiruppur"],"ஞ்ச":["தஞ்சாவூர்","Thanjavur"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
