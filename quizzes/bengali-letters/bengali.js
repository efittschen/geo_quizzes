// Bengali (Bangla): its letters and the words of the signs written in it, for the script quizzes
// (../shared/reading.js says how this is written). The countries are Bangladesh and India (West Bengal).
// Sounds are spelled as Bangladeshi names are on the map: long and short vowels alike (আ is a, ঈ i), the hard
// letters like the soft ones (ট and ত both ta), ফ fa, য ja, ঐ ai and ঔ au (spoken oi and ou). A consonant carries a
// vowel, written a on the map and spoken o (বরিশাল Barishal), which a vowel mark replaces and ্ takes off. Words are
// read as they are spoken.
const SCRIPT = {
  name: 'Bengali', script: 'beng', unicode: 'Bengali', faces: 5, inherent: 'a o', carrier: 'ক',
  langs: { bn: { name: 'Bengali', where: 'Bangladesh · India', at: 'BGD', label: 'Bangladesh' } },
  letters: [
    { title: 'অ আ ই ঈ উ ঊ', block: 'Vowels', type: 'v', rows: [
      ['অ', 'a', 'a o', 'spoken o'], ['আ', 'a', 'a aa', 'long a'], ['ই', 'i'], ['ঈ', 'i', 'i ee ii', 'long i'], ['উ', 'u'], ['ঊ', 'u', 'u oo uu', 'long u'],
    ] },
    { title: 'ঋ এ ঐ ও ঔ', block: 'Vowels', type: 'v', rows: [
      ['ঋ', 'ri', 'ri r'], ['এ', 'e', 'e a ay'], ['ঐ', 'ai', 'ai oi'], ['ও', 'o', 'o w'], ['ঔ', 'au', 'au ou ow'],
    ] },
    { title: 'ক খ গ ঘ ঙ', block: 'Consonants', type: 'c', rows: [['ক', 'ka', 'k c q'], ['খ', 'kha', 'kh'], ['গ', 'ga', 'g'], ['ঘ', 'gha', 'gh'], ['ঙ', 'nga', 'ng n']] },
    { title: 'চ ছ জ ঝ ঞ', block: 'Consonants', type: 'c', rows: [['চ', 'cha', 'ch c'], ['ছ', 'chha', 'chh ch s'], ['জ', 'ja', 'j z'], ['ঝ', 'jha', 'jh'], ['ঞ', 'nya', 'n ny y -']] },
    { title: 'ট ঠ ড ঢ ণ', block: 'Consonants', type: 'c', rows: [
      ['ট', 'ta', 't', 'hard t'], ['ঠ', 'tha', 'th', 'hard th'], ['ড', 'da', 'd', 'hard d'], ['ঢ', 'dha', 'dh', 'hard dh'], ['ণ', 'na', 'n'],
    ] },
    { title: 'ত থ দ ধ ন', block: 'Consonants', type: 'c', rows: [['ত', 'ta', 't'], ['থ', 'tha', 'th'], ['দ', 'da', 'd'], ['ধ', 'dha', 'dh'], ['ন', 'na', 'n']] },
    { title: 'প ফ ব ভ ম', block: 'Consonants', type: 'c', rows: [['প', 'pa', 'p'], ['ফ', 'fa', 'f ph'], ['ব', 'ba', 'b v w'], ['ভ', 'bha', 'bh v'], ['ম', 'ma', 'm']] },
    { title: 'য র ল শ ষ স হ', block: 'Consonants', type: 'c', rows: [
      ['য', 'ja', 'j y z', 'j, not y'], ['র', 'ra', 'r'], ['ল', 'la', 'l'], ['শ', 'sha', 'sh s'], ['ষ', 'sha', 'sh s'], ['স', 'sa', 's sh', 'spoken sh'], ['হ', 'ha', 'h'],
    ] },
    { title: 'ড় ঢ় য়', block: 'Consonants', type: 'c', rows: [['ড়', 'ra', 'r rh d', 'flapped r'], ['ঢ়', 'rha', 'rh r'], ['য়', 'ya', 'y - e i']] },
    { title: 'া ি ী ু ূ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['া', 'a', 'a aa', 'long a'], ['ি', 'i', 'i', 'written before its letter'], ['ী', 'i', 'i ee ii', 'long i'], ['ু', 'u'], ['ূ', 'u', 'u oo uu', 'long u'],
    ] },
    { title: 'ৃ ে ৈ ো ৌ', block: 'Vowels', type: 'm', plain: true, rows: [
      ['ৃ', 'ri', 'ri r'], ['ে', 'e', 'e a ay', 'written before its letter'], ['ৈ', 'ai', 'ai oi', 'written before its letter'],
      ['ো', 'o', 'o', 'written around its letter'], ['ৌ', 'au', 'au ou ow', 'written around its letter'],
    ] },
    { title: 'ৎ ং ঃ ঁ ্', block: 'Signs', type: 's', plain: true, rows: [
      ['ৎ', 't', 't', 't without a vowel'], ['ং', 'ng', 'ng n m'], ['ঃ', 'h', 'h -'], ['ঁ', 'n', 'n -', 'nasal'], ['্', 'no a', '-', 'takes the vowel off'],
    ] },
    { title: 'Attached letters', block: 'Joined', type: 'p', plain: true, rows: [
      ['্য', 'ya', 'y - a', 'often not spoken'], ['্র', 'ra', 'r'], ['্ব', 'ba', 'b w v -', 'often not spoken'],
    ] },
    { title: 'Joined · new shapes', block: 'Joined', type: 'j', rows: [
      ['ক্ষ', 'ksha', 'ksh kh kkh x', 'spoken kkh'], ['ঙ্গ', 'nga', 'ng ngg'], ['ঞ্জ', 'nja', 'nj'], ['ঞ্চ', 'ncha', 'nch'], ['ত্ত', 'tta', 'tt t'], ['ত্র', 'tra', 'tr'],
      ['ক্ত', 'kta', 'kt'], ['হ্ম', 'hma', 'hm mh'], ['জ্ঞ', 'gya', 'gy gg gn'],
    ] },
    { title: 'Joined · with র', block: 'Joined', type: 'j', rows: [
      ['গ্র', 'gra', 'gr'], ['প্র', 'pra', 'pr'], ['ব্র', 'bra', 'br'], ['শ্র', 'shra', 'shr sr'], ['দ্র', 'dra', 'dr'], ['ক্র', 'kra', 'kr'],
      ['র্ক', 'rka', 'rk', 'r before the letter: a stroke on top'], ['র্ম', 'rma', 'rm', 'r before the letter: a stroke on top'],
      ['র্ণ', 'rna', 'rn', 'r before the letter: a stroke on top'],
    ] },
    { title: 'Joined · stacked', block: 'Joined', type: 'j', rows: [
      ['ন্দ', 'nda', 'nd'], ['ন্ত', 'nta', 'nt'], ['ন্ধ', 'ndha', 'ndh'], ['ম্ব', 'mba', 'mb'], ['ম্প', 'mpa', 'mp'], ['ল্ল', 'lla', 'll l'],
      ['ট্ট', 'tta', 'tt t'], ['স্ত', 'sta', 'st'], ['ষ্ট', 'shta', 'sht st'],
    ] },
    { title: '০ ১ ২ ৩ ৪', block: 'Digits', type: 'd', rows: [['০', '0'], ['১', '1'], ['২', '2'], ['৩', '3'], ['৪', '4', '4', 'looks like 8']] },
    { title: '৫ ৬ ৭ ৮ ৯', block: 'Digits', type: 'd', rows: [['৫', '5'], ['৬', '6'], ['৭', '7', '7', 'looks like 9'], ['৮', '8'], ['৯', '9']] },
  ],
  mixes: [
    ['Digits', '০ ১ ২ ৩ ৪ ৫ ৬ ৭ ৮ ৯'],
    ['Vowels and vowel marks', 'অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ া ি ী ু ূ ৃ ে ৈ ো ৌ'],
    ['Lookalikes', 'ই হ উ ড ড় ঢ ঢ় এ ঐ ও ঔ ব র ক ধ খ থ য য় ষ ঘ ণ ন স ম'],
    ['Joined letters', '্য ্র ্ব ক্ষ ঙ্গ ঞ্জ ঞ্চ ত্ত ত্র ক্ত হ্ম জ্ঞ গ্র প্র ব্র শ্র দ্র ক্র র্ক র্ম র্ণ ন্দ ন্ত ন্ধ ম্ব ম্প ল্ল ট্ট স্ত ষ্ট'],
    ['Consonants', 'ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ স হ ড় ঢ় য়'],
  ],
  // A row per meaning, 'word|reading': as on the signs of Bangladesh.
  words: {
    themes: [
      { title: 'Words you can guess', rows: [
        ['school', 'স্কুল|skul'], ['bank', 'ব্যাংক|bank'], ['hotel', 'হোটেল|hotel'], ['road', 'রোড|rod'], ['police', 'পুলিশ|pulish'],
        ['station', 'স্টেশন|steshon'], ['college', 'কলেজ|kolej'], ['market', 'মার্কেট|market'], ['store', 'স্টোর|stor'],
      ] },
      { title: 'Roads', rows: [
        ['road', 'সড়ক|sorok'], ['road', 'রাস্তা|rasta'], ['highway', 'মহাসড়ক|mohasorok'], ['bridge', 'সেতু|setu'], ['lane', 'গলি|goli'],
        ['junction', 'মোড়|mor'], ['square', 'চত্বর|chottor'], ['ferry landing', 'ঘাট|ghat'],
      ] },
      { title: 'Places', rows: [
        ['district', 'জেলা|jela'], ['subdistrict', 'উপজেলা|upojela'], ['division', 'বিভাগ|bibhag'], ['police station', 'থানা|thana'],
        ['union', 'ইউনিয়ন|iuniyon'], ['village', 'গ্রাম|gram'], ['city', 'শহর|shohor'], ['municipality', 'পৌরসভা|pourosobha'],
        ['river', 'নদী|nodi'],
      ] },
      { title: 'Shops', rows: [
        ['shop', 'দোকান|dokan'], ['market', 'বাজার|bajar'], ['pharmacy', 'ফার্মেসি|farmesi'], ['sweets', 'মিষ্টি|mishti'],
        ['clothes', 'কাপড়|kapor'], ['tea', 'চা|cha'], ['store', 'ভাণ্ডার|bhandar'], ['groceries', 'মুদি|mudi'], ['medicine', 'ঔষধ|oushodh'],
      ] },
      { title: 'Services', rows: [
        ['school', 'বিদ্যালয়|biddaloy'], ['mosque', 'মসজিদ|mosjid'], ['temple', 'মন্দির|mondir'], ['madrasa', 'মাদ্রাসা|madrasa'],
        ['post office', 'ডাকঘর|dakghor'], ['hospital', 'হাসপাতাল|haspatal'], ['office', 'কার্যালয়|karjaloy'], ['council', 'পরিষদ|porishod'],
        ['government', 'সরকারি|sorkari'],
      ] },
      { title: 'Notices', rows: [
        ['welcome', 'স্বাগতম|swagotom'], ['thank you', 'ধন্যবাদ|dhonnobad'], ['caution', 'সাবধান|sabdhan'], ['entry', 'প্রবেশ|probesh'],
        ['exit', 'বাহির|bahir'], ['open', 'খোলা|khola'], ['closed', 'বন্ধ|bondho'], ['sale', 'বিক্রয়|bikroy'], ['rent', 'ভাড়া|bhara'],
      ] },
      { title: 'Directions', rows: [
        ['north', 'উত্তর|uttor'], ['south', 'দক্ষিণ|dokkhin'], ['east', 'পূর্ব|purbo'], ['west', 'পশ্চিম|poshchim'], ['new', 'নতুন|notun'],
        ['old', 'পুরাতন|puraton'], ['km', 'কিমি|kimi'],
      ] },
    ],
    mixes: [
      ['Addresses', ['Roads', 'Places', 'Directions']],
      ['Shop fronts', ['Words you can guess', 'Shops', 'Services', 'Notices']],
    ],
  },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"আ":["আখাউড়া","Akhaura"],"ই":["চাঁপাইনবাবগঞ্জ","Chapai Nawabganj"],"ঈ":["ঈশ্বরদী","Ishwardi"],"উ":["উল্লাপাড়া","Ullapara"],"এ":["এলেঙ্গা","Elenga"],"ও":["নওয়াপাড়া","Noapara"],"ক":["মানিকগঞ্জ","Manikganj"],"খ":["খুলনা","Khulna"],"গ":["মুন্সীগঞ্জ","Munshiganj"],"ঘ":["ঘোড়াশাল","Ghorashal"],"ঙ":["টাঙ্গাইল","Tangail"],"চ":["চৌমুহনী","Choumuhani"],"ছ":["হারাগাছ","Haragachh"],"জ":["জামালপুর","Jamalpur"],"ঝ":["ঝিকরগাছা","Jhikargachha"],"ঞ":["গোপালগঞ্জ","Gopalganj"],"ট":["হাটহাজারী","Hathazari"],"ড":["চুয়াডাঙ্গা","Chuadanga"],"ঢ":["ঢাকা","Dhaka"],"ণ":["নারায়ণগঞ্জ","Narayanganj"],"ত":["সাতক্ষীরা","Satkhira"],"থ":["বিশ্বনাথ","Bishwanath"],"দ":["দিনাজপুর","Dinajpur"],"ধ":["ধামরাই","Dhamrai"],"ন":["নরসিংদী","Narsingdi"],"প":["পাবনা","Pabna"],"ফ":["ফরিদপুর","Faridpur"],"ব":["বরিশাল","Barishal"],"ভ":["ভৈরব","Bhairab"],"ম":["মাগুরা","Magura"],"র":["শেরপুর","Sherpur"],"ল":["লাকসাম","Laksam"],"শ":["রাজশাহী","Rajshahi"],"ষ":["সরিষাবাড়ী","Sarishabari"],"স":["সাভার","Savar"],"হ":["হবিগঞ্জ","Habiganj"],"ড়":["বগুড়া","Bogura"],"য়":["জয়পুরহাট","Joypurhat"],"া":["মাদারীপুর","Madaripur"],"ি":["চকরিয়া","Chakaria"],"ী":["গাজীপুর","Gazipur"],"ু":["সৈয়দপুর","Saidpur"],"ে":["ফেনী","Feni"],"ৈ":["কালিয়াকৈর","Kaliakair"],"ো":["নোয়াখালী","Noakhali"],"ৌ":["গৌরনদী","Gaurnadi"],"ং":["রংপুর","Rangpur"],"ঁ":["চাঁদপুর","Chandpur"],"্":["হাজীগঞ্জ","Hajiganj"],"্র":["চৌদ্দগ্রাম","Chauddagram"],"্ব":["দেবিদ্বার","Debidwar"],"ক্ষ":["লক্ষ্মীপুর","Lakshmipur"],"ঙ্গ":["রাঙ্গামাটি","Rangamati"],"ঞ্জ":["সিরাজগঞ্জ","Sirajganj"],"ঞ্চ":["কাঞ্চন","Kanchan"],"ত্র":["নেত্রকোণা","Netrokona"],"ক্ত":["মুক্তাগাছা","Muktagachha"],"হ্ম":["ব্রাহ্মণবাড়িয়া","Brahmanbaria"],"গ্র":["কুড়িগ্রাম","Kurigram"],"ব্র":["ব্রাহ্মণবাড়িয়া","Brahmanbaria"],"শ্র":["শ্রীপুর","Sreepur"],"ন্দ":["চান্দিনা","Chandina"],"ন্ত":["সান্তাহার","Santahar"],"ন্ধ":["গাইবান্ধা","Gaibandha"],"ল্ল":["কুমিল্লা","Cumilla"],"ট্ট":["চট্টগ্রাম","Chattogram"],"স্ত":["শাহরাস্তি","Shahrasti"],"ষ্ট":["কুষ্টিয়া","Kushtia"]};
