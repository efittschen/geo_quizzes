// Japanese: its letters, for the script quizzes (../shared/reading.js says how this is written). The country is Japan.
// Sounds are spelled as names are on Japan's road signs, in Hepburn romanization: long vowels not marked (とう to, おお o:
// Tokyo, Osaka), し shi, ち chi, つ tsu, ふ fu, じ and ぢ ji, ず and づ zu, を o, ん n, っ the next consonant twice
// (さっぽろ Sapporo). Hiragana and katakana are two forms of the same sounds and share their tiles. Then the kanji of
// place names: those in 10 or more of the names of Japan's 1,741 municipalities (cities, towns, villages and Tokyo's 23
// wards: Wikidata), most frequent first, each with the readings it has in those names (from their names in kana,
// Wikidata P1814: 川 kawa, gawa), the most common first; a reading in 5% of its names and 3 of them or more stands on
// its tile, the next ones in its note. The kana are in the order of their sounds' frequency in those names.
// (Made by tools/cache/builds/scripts-ja/scripts/make.mjs from those counts: run it again rather than edit by hand.)
// No words of signs yet.
var SCRIPT = {
  name: 'Japanese', script: 'jpan', unicode: 'Han', faces: 4,
  langs: { ja: { name: 'Japanese', where: 'Japan', at: 'JPN' } },
  letters: [
    { title: 'か ま し い お み う た', block: 'Kana', rows: [
      ['か', 'ka'], ['ま', 'ma'], ['し', 'shi'], ['い', 'i'],
      ['お', 'o'], ['み', 'mi'], ['う', 'u'], ['た', 'ta'],
    ] },
    { title: 'な わ と き さ ん や ら', block: 'Kana', rows: [
      ['な', 'na'], ['わ', 'wa'], ['と', 'to'], ['き', 'ki'],
      ['さ', 'sa'], ['ん', 'n', 'n m', 'also m before b, m, p'], ['や', 'ya'], ['ら', 'ra'],
    ] },
    { title: 'く の つ あ ち こ は ひ', block: 'Kana', rows: [
      ['く', 'ku'], ['の', 'no'], ['つ', 'tsu'], ['あ', 'a'],
      ['ち', 'chi'], ['こ', 'ko'], ['は', 'ha'], ['ひ', 'hi'],
    ] },
    { title: 'り よ に す も ふ ろ え', block: 'Kana', rows: [
      ['り', 'ri'], ['よ', 'yo'], ['に', 'ni'], ['す', 'su'],
      ['も', 'mo'], ['ふ', 'fu'], ['ろ', 'ro'], ['え', 'e'],
    ] },
    { title: 'せ る ほ け ね む そ', block: 'Kana', rows: [
      ['せ', 'se'], ['る', 'ru'], ['ほ', 'ho'], ['け', 'ke'],
      ['ね', 'ne'], ['む', 'mu'], ['そ', 'so'],
    ] },
    { title: 'て め ゆ へ ぬ れ を', block: 'Kana', rows: [
      ['て', 'te'], ['め', 'me'], ['ゆ', 'yu'], ['へ', 'he'],
      ['ぬ', 'nu'], ['れ', 're'], ['を', 'o', 'o wo', 'also wo'],
    ] },
    { title: 'が だ ば じ べ ご ず ざ ぎ', block: 'Voiced', rows: [
      ['が', 'ga'], ['だ', 'da'], ['ば', 'ba'], ['じ', 'ji'], ['べ', 'be'],
      ['ご', 'go'], ['ず', 'zu'], ['ざ', 'za'], ['ぎ', 'gi'],
    ] },
    { title: 'ぶ づ ど ぐ び げ ぜ で', block: 'Voiced', rows: [
      ['ぶ', 'bu'], ['づ', 'zu', '', 'as ず'], ['ど', 'do'], ['ぐ', 'gu'],
      ['び', 'bi'], ['げ', 'ge'], ['ぜ', 'ze'], ['で', 'de'],
    ] },
    { title: 'ぷ ぼ ぞ ぽ ぢ ぺ ぱ ぴ', block: 'Voiced', rows: [
      ['ぷ', 'pu'], ['ぼ', 'bo'], ['ぞ', 'zo'], ['ぽ', 'po'],
      ['ぢ', 'ji', '', 'as じ'], ['ぺ', 'pe'], ['ぱ', 'pa'], ['ぴ', 'pi'],
    ] },
    { title: 'じょ · しょ · きょ · ちゅ · りゅ · しゅ · ちょ · しゃ · ちゃ', block: 'Combined', rows: [
      ['じょ', 'jo'], ['しょ', 'sho'], ['きょ', 'kyo'], ['ちゅ', 'chu'], ['りゅ', 'ryu'],
      ['しゅ', 'shu'], ['ちょ', 'cho'], ['しゃ', 'sha'], ['ちゃ', 'cha'],
    ] },
    { title: 'じゅ · きゅ · にゅ · ぎょ · ひゅ · みょ · りょ · じゃ', block: 'Combined', rows: [
      ['じゅ', 'ju'], ['きゅ', 'kyu'], ['にゅ', 'nyu'], ['ぎょ', 'gyo'],
      ['ひゅ', 'hyu'], ['みょ', 'myo'], ['りょ', 'ryo'], ['じゃ', 'ja'],
    ] },
    { title: 'きゃ · にゃ · にょ · ひゃ · ひょ · みゃ · みゅ · りゃ', block: 'Combined', rows: [
      ['きゃ', 'kya'], ['にゃ', 'nya'], ['にょ', 'nyo'], ['ひゃ', 'hya'],
      ['ひょ', 'hyo'], ['みゃ', 'mya'], ['みゅ', 'myu'], ['りゃ', 'rya'],
    ] },
    { title: 'ぎゃ · ぎゅ · びゃ · びゅ · びょ · ぴゃ · ぴゅ · ぴょ', block: 'Combined', rows: [
      ['ぎゃ', 'gya'], ['ぎゅ', 'gyu'], ['びゃ', 'bya'], ['びゅ', 'byu'],
      ['びょ', 'byo'], ['ぴゃ', 'pya'], ['ぴゅ', 'pyu'], ['ぴょ', 'pyo'],
    ] },
    { title: 'カ マ シ イ オ ミ ウ タ', block: 'Kana', rows: [
      ['カ', 'ka'], ['マ', 'ma'], ['シ', 'shi'], ['イ', 'i'],
      ['オ', 'o'], ['ミ', 'mi'], ['ウ', 'u'], ['タ', 'ta'],
    ] },
    { title: 'ナ ワ ト キ サ ン ヤ ラ', block: 'Kana', rows: [
      ['ナ', 'na'], ['ワ', 'wa'], ['ト', 'to'], ['キ', 'ki'],
      ['サ', 'sa'], ['ン', 'n', 'n m', 'also m before b, m, p'], ['ヤ', 'ya'], ['ラ', 'ra'],
    ] },
    { title: 'ク ノ ツ ア チ コ ハ ヒ', block: 'Kana', rows: [
      ['ク', 'ku'], ['ノ', 'no'], ['ツ', 'tsu'], ['ア', 'a'],
      ['チ', 'chi'], ['コ', 'ko'], ['ハ', 'ha'], ['ヒ', 'hi'],
    ] },
    { title: 'リ ヨ ニ ス モ フ ロ エ', block: 'Kana', rows: [
      ['リ', 'ri'], ['ヨ', 'yo'], ['ニ', 'ni'], ['ス', 'su'],
      ['モ', 'mo'], ['フ', 'fu'], ['ロ', 'ro'], ['エ', 'e'],
    ] },
    { title: 'セ ル ホ ケ ネ ム ソ', block: 'Kana', rows: [
      ['セ', 'se'], ['ル', 'ru'], ['ホ', 'ho'], ['ケ', 'ke'],
      ['ネ', 'ne'], ['ム', 'mu'], ['ソ', 'so'],
    ] },
    { title: 'テ メ ユ ヘ ヌ レ ヲ', block: 'Kana', rows: [
      ['テ', 'te'], ['メ', 'me'], ['ユ', 'yu'], ['ヘ', 'he'],
      ['ヌ', 'nu'], ['レ', 're'], ['ヲ', 'o', 'o wo', 'also wo'],
    ] },
    { title: 'ガ ダ バ ジ ベ ゴ ズ ザ ギ', block: 'Voiced', rows: [
      ['ガ', 'ga'], ['ダ', 'da'], ['バ', 'ba'], ['ジ', 'ji'], ['ベ', 'be'],
      ['ゴ', 'go'], ['ズ', 'zu'], ['ザ', 'za'], ['ギ', 'gi'],
    ] },
    { title: 'ブ ヅ ド グ ビ ゲ ゼ デ', block: 'Voiced', rows: [
      ['ブ', 'bu'], ['ヅ', 'zu', '', 'as ズ'], ['ド', 'do'], ['グ', 'gu'],
      ['ビ', 'bi'], ['ゲ', 'ge'], ['ゼ', 'ze'], ['デ', 'de'],
    ] },
    { title: 'プ ボ ゾ ポ ヂ ペ パ ピ', block: 'Voiced', rows: [
      ['プ', 'pu'], ['ボ', 'bo'], ['ゾ', 'zo'], ['ポ', 'po'],
      ['ヂ', 'ji', '', 'as ジ'], ['ペ', 'pe'], ['パ', 'pa'], ['ピ', 'pi'],
    ] },
    { title: 'ジョ · ショ · キョ · チュ · リュ · シュ · チョ · シャ · チャ', block: 'Combined', rows: [
      ['ジョ', 'jo'], ['ショ', 'sho'], ['キョ', 'kyo'], ['チュ', 'chu'], ['リュ', 'ryu'],
      ['シュ', 'shu'], ['チョ', 'cho'], ['シャ', 'sha'], ['チャ', 'cha'],
    ] },
    { title: 'ジュ · キュ · ニュ · ギョ · ヒュ · ミョ · リョ · ジャ', block: 'Combined', rows: [
      ['ジュ', 'ju'], ['キュ', 'kyu'], ['ニュ', 'nyu'], ['ギョ', 'gyo'],
      ['ヒュ', 'hyu'], ['ミョ', 'myo'], ['リョ', 'ryo'], ['ジャ', 'ja'],
    ] },
    { title: 'キャ · ニャ · ニョ · ヒャ · ヒョ · ミャ · ミュ · リャ', block: 'Combined', rows: [
      ['キャ', 'kya'], ['ニャ', 'nya'], ['ニョ', 'nyo'], ['ヒャ', 'hya'],
      ['ヒョ', 'hyo'], ['ミャ', 'mya'], ['ミュ', 'myu'], ['リャ', 'rya'],
    ] },
    { title: 'ギャ · ギュ · ビャ · ビュ · ビョ · ピャ · ピュ · ピョ', block: 'Combined', rows: [
      ['ギャ', 'gya'], ['ギュ', 'gyu'], ['ビャ', 'bya'], ['ビュ', 'byu'],
      ['ビョ', 'byo'], ['ピャ', 'pya'], ['ピュ', 'pyu'], ['ピョ', 'pyo'],
    ] },
    { title: 'っ ッ ー ヶ 々', block: 'Kana', rows: [
      ['っ', 'double', 'k s t p c -', 'doubles the next consonant · t before ch'], ['ッ', 'double', 'k s t p c -', 'doubles the next consonant · t before ch'], ['ー', 'long', '- a i u e o', 'long vowel, unmarked on signs'], ['ヶ', 'ga', 'ga ka ke', 'in names · also ケ'], ['々', 'repeat', '-', 'the kanji before, again · 野々市 Nonoichi'],
    ] },
    { title: '川 田 大 山 野 南 島 東 津', block: 'Kanji', rows: [
      ['川', 'kawa, gawa', 'kawa gawa', 'river'], ['田', 'ta, da', 'ta da', 'rice field'], ['大', 'o, dai', 'o oo oh dai', 'big'], ['山', 'yama, san', 'yama san', 'mountain'], ['野', 'no', 'no', 'field'],
      ['南', 'nan, minami', 'nan minami', 'south'], ['島', 'shima, jima', 'shima jima', 'island'], ['東', 'higashi, to', 'higashi to tou too toh', 'east'], ['津', 'tsu, zu', 'tsu zu', 'harbour'],
    ] },
    { title: '原 上 小 高 北 日 中 美 西', block: 'Kanji', rows: [
      ['原', 'hara, bara', 'hara bara wara baru', 'plain · also wara, baru'], ['上', 'kami, ue', 'kami ue gami age', 'upper · also gami, age'], ['小', 'o, ko', 'o ko', 'small'], ['高', 'taka, daka', 'taka daka ko kou koo koh', 'high · also ko'], ['北', 'kita, hoku', 'kita hoku', 'north'],
      ['日', 'hi, ka', 'hi ka nichi ni', 'sun, day · also nichi, ni'], ['中', 'naka, chu', 'naka chu chuu', 'middle'], ['美', 'mi, bi', 'mi bi', 'beautiful'], ['西', 'nishi, sai', 'nishi sai sei', 'west · also sei'],
    ] },
    { title: '三 松 木 崎 和 富 伊 城 佐', block: 'Kanji', rows: [
      ['三', 'mi, san', 'mi san', 'three'], ['松', 'matsu', 'matsu', 'pine'], ['木', 'ki, gi', 'ki gi', 'tree'], ['崎', 'saki, zaki', 'saki zaki', 'cape'], ['和', 'wa', 'wa', 'harmony'],
      ['富', 'fu, tomi', 'fu tomi ton', 'wealth · also ton'], ['伊', 'i', 'i'], ['城', 'jo, ki', 'jo jou joo joh ki gi gusuku', 'castle · also gi, gusuku'], ['佐', 'sa', 'sa', 'help'],
    ] },
    { title: '岡 戸 豊 内 井 新 江 別 八', block: 'Kanji', rows: [
      ['岡', 'oka', 'oka', 'hill'], ['戸', 'to, he', 'to he do', 'door · also do'], ['豊', 'toyo', 'toyo bun to', 'abundant · also bun, to'], ['内', 'nai, uchi', 'nai uchi chi', 'inside · also chi'], ['井', 'i', 'i', 'well'],
      ['新', 'shin, nii', 'shin nii', 'new'], ['江', 'e, ko', 'e ko kou koo koh', 'inlet'], ['別', 'betsu', 'betsu', 'separate · Ainu pet (river)'], ['八', 'ya, hachi', 'ya hachi', 'eight'],
    ] },
    { title: '長 平 浜 沢 賀 浦 久 本 宮', block: 'Kanji', rows: [
      ['長', 'naga', 'naga cho chou choo choh', 'long · also cho'], ['平', 'hira, bira', 'hira bira daira he', 'flat · also daira, he'], ['浜', 'hama', 'hama', 'beach'], ['沢', 'zawa, sawa', 'zawa sawa', 'marsh'], ['賀', 'ga, ka', 'ga ka', 'celebrate'],
      ['浦', 'ura', 'ura', 'bay'], ['久', 'ku', 'ku', 'long time'], ['本', 'moto, hon', 'moto hon', 'origin'], ['宮', 'miya', 'miya gu guu', 'shrine · also gu'],
    ] },
    { title: '谷 子 多 国 石 部 白 水', block: 'Kanji', rows: [
      ['谷', 'ya', 'ya', 'valley'], ['子', 'shi, ko', 'shi ko ne go', 'child · also ne, go'], ['多', 'ta', 'ta', 'many'], ['国', 'kuni, guni', 'kuni guni koku', 'country · also koku'],
      ['石', 'ishi', 'ishi', 'stone'], ['部', 'be, bu', 'be bu pe', 'part · also pe'], ['白', 'shira, shiro', 'shira shiro haku', 'white · also haku'], ['水', 'mizu, mi', 'mizu mi', 'water'],
    ] },
    { title: '河 吉 見 里 前 下 良 那', block: 'Kanji', rows: [
      ['河', 'kawa, ga', 'kawa ga ka', 'river · also ka'], ['吉', 'yoshi', 'yoshi', 'good luck'], ['見', 'mi', 'mi', 'see'], ['里', 'sato, ri', 'sato ri', 'village'],
      ['前', 'zen, mae', 'zen mae saki', 'front · also saki'], ['下', 'shimo', 'shimo ge', 'lower · also ge'], ['良', 'ra', 'ra', 'good'], ['那', 'na', 'na'],
    ] },
    { title: '名 鹿 安 海 神 郷 阿 御', block: 'Kanji', rows: [
      ['名', 'na', 'na', 'name'], ['鹿', 'ka, shika', 'ka shika ga', 'deer · also ga'], ['安', 'an, a', 'an a yasu', 'peaceful · also yasu'], ['海', 'kai', 'kai', 'sea'],
      ['神', 'kami, ko', 'kami ko kou koo koh kan', 'god · also kan'], ['郷', 'sato, go', 'sato go gou goo goh', 'village'], ['阿', 'a', 'a'], ['御', 'mi, go', 'mi go', 'honorific'],
    ] },
    { title: '古 宇 府 士 泉 根 尾 市', block: 'Kanji', rows: [
      ['古', 'ko', 'ko furu go', 'old · also furu, go'], ['宇', 'u', 'u', 'eaves'], ['府', 'fu, pu', 'fu pu', 'government seat'], ['士', 'ji, shi', 'ji shi', 'samurai'],
      ['泉', 'izumi, sen', 'izumi sen', 'spring'], ['根', 'ne', 'ne', 'root'], ['尾', 'o', 'o', 'tail'], ['市', 'ichi', 'ichi', 'market, city'],
    ] },
    { title: '加 志 坂 福 越 広 米 屋', block: 'Kanji', rows: [
      ['加', 'ka', 'ka', 'add'], ['志', 'shi', 'shi', 'will'], ['坂', 'saka', 'saka ban', 'slope · also ban'], ['福', 'fuku', 'fuku', 'fortune'],
      ['越', 'echi', 'echi koshi goe', 'cross over · also koshi, goe'], ['広', 'hiro', 'hiro', 'wide'], ['米', 'me', 'me mai', 'rice · also mai'], ['屋', 'ya', 'ya', 'house'],
    ] },
    { title: '千 間 飯 代 知 須 五 羽', block: 'Kanji', rows: [
      ['千', 'chi', 'chi', 'thousand'], ['間', 'ma', 'ma', 'between'], ['飯', 'ii', 'ii', 'cooked rice'], ['代', 'yo, shiro', 'yo shiro', 'generation'],
      ['知', 'chi', 'chi', 'know'], ['須', 'su', 'su'], ['五', 'go', 'go', 'five'], ['羽', 'ha', 'ha ba', 'feather · also ba'],
    ] },
  ],
  mixes: [
    ['Hiragana', 'か ま し い お み う た な わ と き さ ん や ら く の つ あ ち こ は ひ り よ に す も ふ ろ え せ る ほ け ね む そ て め ゆ へ ぬ れ を'],
    ['Hiragana ゛ ゜', 'が だ ば じ べ ご ず ざ ぎ ぶ づ ど ぐ び げ ぜ で ぷ ぼ ぞ ぽ ぢ ぺ ぱ ぴ'],
    ['Hiragana ゃ ゅ ょ', 'じょ しょ きょ ちゅ りゅ しゅ ちょ しゃ ちゃ じゅ きゅ にゅ ぎょ ひゅ みょ りょ じゃ きゃ にゃ にょ ひゃ ひょ みゃ みゅ りゃ ぎゃ ぎゅ びゃ びゅ びょ ぴゃ ぴゅ ぴょ'],
    ['All hiragana', 'か ま し い お み う た な わ と き さ ん や ら く の つ あ ち こ は ひ り よ に す も ふ ろ え せ る ほ け ね む そ て め ゆ へ ぬ れ を が だ ば じ べ ご ず ざ ぎ ぶ づ ど ぐ び げ ぜ で ぷ ぼ ぞ ぽ ぢ ぺ ぱ ぴ じょ しょ きょ ちゅ りゅ しゅ ちょ しゃ ちゃ じゅ きゅ にゅ ぎょ ひゅ みょ りょ じゃ きゃ にゃ にょ ひゃ ひょ みゃ みゅ りゃ ぎゃ ぎゅ びゃ びゅ びょ ぴゃ ぴゅ ぴょ っ'],
    ['Katakana', 'カ マ シ イ オ ミ ウ タ ナ ワ ト キ サ ン ヤ ラ ク ノ ツ ア チ コ ハ ヒ リ ヨ ニ ス モ フ ロ エ セ ル ホ ケ ネ ム ソ テ メ ユ ヘ ヌ レ ヲ'],
    ['Katakana ゛ ゜', 'ガ ダ バ ジ ベ ゴ ズ ザ ギ ブ ヅ ド グ ビ ゲ ゼ デ プ ボ ゾ ポ ヂ ペ パ ピ'],
    ['Katakana ャ ュ ョ', 'ジョ ショ キョ チュ リュ シュ チョ シャ チャ ジュ キュ ニュ ギョ ヒュ ミョ リョ ジャ キャ ニャ ニョ ヒャ ヒョ ミャ ミュ リャ ギャ ギュ ビャ ビュ ビョ ピャ ピュ ピョ'],
    ['All katakana', 'カ マ シ イ オ ミ ウ タ ナ ワ ト キ サ ン ヤ ラ ク ノ ツ ア チ コ ハ ヒ リ ヨ ニ ス モ フ ロ エ セ ル ホ ケ ネ ム ソ テ メ ユ ヘ ヌ レ ヲ ガ ダ バ ジ ベ ゴ ズ ザ ギ ブ ヅ ド グ ビ ゲ ゼ デ プ ボ ゾ ポ ヂ ペ パ ピ ジョ ショ キョ チュ リュ シュ チョ シャ チャ ジュ キュ ニュ ギョ ヒュ ミョ リョ ジャ キャ ニャ ニョ ヒャ ヒョ ミャ ミュ リャ ギャ ギュ ビャ ビュ ビョ ピャ ピュ ピョ ッ ー'],
    ['Hiragana lookalikes', 'あ お め ぬ ね れ わ る ろ さ ち き は ほ ま い り こ に'],
    ['Katakana lookalikes', 'シ ツ ソ ン ノ ク ケ タ ウ ワ フ ラ ス ヌ コ ユ ア マ チ テ'],
    ['Top 27 kanji', '川 田 大 山 野 南 島 東 津 原 上 小 高 北 日 中 美 西 三 松 木 崎 和 富 伊 城 佐'],
    ['Top 53 kanji', '川 田 大 山 野 南 島 東 津 原 上 小 高 北 日 中 美 西 三 松 木 崎 和 富 伊 城 佐 岡 戸 豊 内 井 新 江 別 八 長 平 浜 沢 賀 浦 久 本 宮 谷 子 多 国 石 部 白 水'],
    ['All kanji', '川 田 大 山 野 南 島 東 津 原 上 小 高 北 日 中 美 西 三 松 木 崎 和 富 伊 城 佐 岡 戸 豊 内 井 新 江 別 八 長 平 浜 沢 賀 浦 久 本 宮 谷 子 多 国 石 部 白 水 河 吉 見 里 前 下 良 那 名 鹿 安 海 神 郷 阿 御 古 宇 府 士 泉 根 尾 市 加 志 坂 福 越 広 米 屋 千 間 飯 代 知 須 五 羽'],
    ['Kanji lookalikes', '木 本 日 白 古 吉 屋 尾 宮 宇 富'],
    ['Kanji with 氵', '津 江 浜 沢 浦 河 海'],
  ],
  words: { themes: [] },
};

// A place name is read as a whole (reading.js: SCRIPT.together): the kanji names of ../japan-cities, each with the
// spellings its reading has (Wikidata P1814): as on signs (Tokyo), with its long vowels as the kana write them
// (Toukyou), doubled (Tookyoo) or a long o as oh (Minoh), and ん as m before b, m, p (Gumma). The name on the map
// counts as well (city-config.js).
SCRIPT.together = [
  ['東京', 'tokyo toukyou tookyoo tohkyoh'], ['横浜', 'yokohama'], ['大阪', 'osaka oosaka ohsaka'], ['名古屋', 'nagoya'],
  ['札幌', 'sapporo'], ['福岡', 'fukuoka'], ['川崎', 'kawasaki'], ['神戸', 'kobe koube koobe kohbe'],
  ['京都', 'kyoto kyouto kyooto kyohto'], ['広島', 'hiroshima'], ['仙台', 'sendai'], ['千葉', 'chiba'],
  ['北九州', 'kitakyushu kitakyuushuu'], ['堺', 'sakai'], ['浜松', 'hamamatsu'], ['新潟', 'niigata'],
  ['熊本', 'kumamoto'], ['相模原', 'sagamihara'], ['岡山', 'okayama'], ['静岡', 'shizuoka'],
  ['船橋', 'funabashi'], ['川口', 'kawaguchi'], ['鹿児島', 'kagoshima'], ['八王子', 'hachioji hachiouji hachiooji hachiohji'],
  ['姫路', 'himeji'], ['宇都宮', 'utsunomiya'], ['松山', 'matsuyama'], ['松戸', 'matsudo'],
  ['市川', 'ichikawa'], ['東大阪', 'higashiosaka higashioosaka higashiohsaka'], ['西宮', 'nishinomiya'], ['大分', 'oita ooita ohita'],
  ['倉敷', 'kurashiki'], ['金沢', 'kanazawa'], ['福山', 'fukuyama'], ['尼崎', 'amagasaki'],
  ['藤沢', 'fujisawa'], ['町田', 'machida'], ['柏', 'kashiwa'], ['豊田', 'toyota'],
  ['高松', 'takamatsu'], ['富山', 'toyama'], ['長崎', 'nagasaki'], ['岐阜', 'gifu'],
  ['豊中', 'toyonaka'], ['宮崎', 'miyazaki'], ['枚方', 'hirakata'], ['横須賀', 'yokosuka'],
  ['吹田', 'suita'], ['岡崎', 'okazaki'], ['一宮', 'ichinomiya'], ['高崎', 'takasaki'],
  ['長野', 'nagano'], ['豊橋', 'toyohashi'], ['和歌山', 'wakayama'], ['奈良', 'nara'],
  ['川越', 'kawagoe'], ['高槻', 'takatsuki'], ['大津', 'otsu ootsu ohtsu'], ['所沢', 'tokorozawa'],
  ['越谷', 'koshigaya'], ['前橋', 'maebashi'], ['旭川', 'asahikawa'], ['郡山', 'koriyama kooriyama kohriyama'],
  ['高知', 'kochi kouchi koochi kohchi'], ['那覇', 'naha'], ['春日井', 'kasugai'], ['秋田', 'akita'],
  ['四日市', 'yokkaichi'], ['明石', 'akashi'], ['久留米', 'kurume'], ['盛岡', 'morioka'],
  ['茨木', 'ibaraki'], ['福島', 'fukushima'], ['青森', 'aomori'], ['津', 'tsu'],
  ['水戸', 'mito'], ['市原', 'ichihara'], ['長岡', 'nagaoka'], ['八尾', 'yao'],
  ['府中', 'fuchu fuchuu'], ['福井', 'fukui'], ['加古川', 'kakogawa'], ['平塚', 'hiratsuka'],
  ['下関', 'shimonoseki'], ['徳島', 'tokushima'], ['函館', 'hakodate'], ['草加', 'soka souka sooka sohka'],
  ['山形', 'yamagata'], ['富士', 'fuji'], ['佐世保', 'sasebo'], ['調布', 'chofu choufu choofu chohfu'],
  ['茅ヶ崎', 'chigasaki'], ['松本', 'matsumoto'], ['大和', 'yamato'], ['佐賀', 'saga'],
  ['春日部', 'kasukabe'], ['寝屋川', 'neyagawa'], ['上尾', 'ageo'], ['宝塚', 'takarazuka'],
  ['厚木', 'atsugi'], ['八戸', 'hachinohe'], ['太田', 'ota oota ohta'], ['呉', 'kure'],
  ['伊勢崎', 'isesaki'], ['西東京', 'nishitokyo nishitoukyou nishitookyoo nishitohkyoh'], ['松江', 'matsue'], ['流山', 'nagareyama'],
  ['八千代', 'yachiyo'], ['小平', 'kodaira'], ['伊丹', 'itami'], ['東広島', 'higashihiroshima'],
  ['鈴鹿', 'suzuka'], ['三鷹', 'mitaka'], ['熊谷', 'kumagaya'], ['山口', 'yamaguchi'],
  ['岸和田', 'kishiwada'], ['日野', 'hino'], ['甲府', 'kofu koufu koofu kohfu'], ['沼津', 'numazu'],
  ['小田原', 'odawara'], ['鳥取', 'tottori'], ['上越', 'joetsu jouetsu jooetsu johetsu'], ['安城', 'anjo anjou anjoo anjoh'],
  ['豊川', 'toyokawa'], ['和泉', 'izumi'], ['立川', 'tachikawa'], ['宇治', 'uji'],
  ['習志野', 'narashino'], ['日立', 'hitachi'], ['出雲', 'izumo'], ['鎌倉', 'kamakura'],
  ['浦安', 'urayasu'], ['苫小牧', 'tomakomai'], ['西尾', 'nishio'], ['佐倉', 'sakura'],
  ['弘前', 'hirosaki'], ['磐田', 'iwata'], ['小山', 'oyama'], ['帯広', 'obihiro'],
  ['高岡', 'takaoka'], ['新座', 'niiza'], ['釧路', 'kushiro'], ['宇部', 'ube'],
  ['秦野', 'hadano'], ['都城', 'miyakonojo miyakonojou miyakonojoo miyakonojoh'], ['松阪', 'matsusaka'], ['大垣', 'ogaki oogaki ohgaki'],
  ['栃木', 'tochigi'], ['上田', 'ueda'], ['刈谷', 'kariya'], ['野田', 'noda'],
  ['川西', 'kawanishi'], ['東村山', 'higashimurayama'], ['今治', 'imabari'], ['久喜', 'kuki'],
  ['武蔵野', 'musashino'], ['小牧', 'komaki'], ['狭山', 'sayama'], ['米子', 'yonago'],
  ['多摩', 'tama'], ['入間', 'iruma'], ['足利', 'ashikaga'], ['各務原', 'kakamigahara'],
  ['草津', 'kusatsu'], ['守口', 'moriguchi'], ['沖縄', 'okinawa'], ['三郷', 'misato'],
  ['土浦', 'tsuchiura'], ['藤枝', 'fujieda'], ['深谷', 'fukaya'], ['朝霞', 'asaka'],
  ['戸田', 'toda'], ['石巻', 'ishinomaki'], ['古河', 'koga'], ['桑名', 'kuwana'],
  ['周南', 'shunan shuunan'], ['箕面', 'minoh minoo mino'], ['焼津', 'yaizu'], ['海老名', 'ebina'],
  ['木更津', 'kisarazu'], ['稲沢', 'inazawa'], ['諫早', 'isahaya'], ['青梅', 'ome oume oome ohme'],
  ['成田', 'narita'], ['座間', 'zama'], ['尾道', 'onomichi'], ['我孫子', 'abiko'],
  ['国分寺', 'kokubunji'], ['岩国', 'iwakuni'], ['富士宮', 'fujinomiya'], ['瀬戸', 'seto'],
  ['大崎', 'osaki oosaki ohsaki'], ['飯塚', 'iizuka'], ['小金井', 'koganei'],
];
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"ヶ":["茅ヶ崎","Chigasaki"],"川":["川口","Kawaguchi"],"田":["吹田","Suita"],"大":["大阪","Osaka"],"山":["松山","Matsuyama"],"野":["長野","Nagano"],"南":["周南","Shunan"],"島":["福島","Fukushima"],"東":["東大阪","Higashiosaka"],"津":["大津","Otsu"],"原":["相模原","Sagamihara"],"上":["上尾","Ageo"],"小":["小平","Kodaira"],"高":["高松","Takamatsu"],"北":["北九州","Kitakyushu"],"日":["四日市","Yokkaichi"],"中":["豊中","Toyonaka"],"西":["西宮","Nishinomiya"],"三":["三鷹","Mitaka"],"松":["浜松","Hamamatsu"],"木":["茨木","Ibaraki"],"崎":["川崎","Kawasaki"],"和":["和歌山","Wakayama"],"富":["富士宮","Fujinomiya"],"伊":["伊勢崎","Isesaki"],"城":["安城","Anjo"],"佐":["佐世保","Sasebo"],"岡":["岡山","Okayama"],"戸":["戸田","Toda"],"豊":["豊田","Toyota"],"井":["春日井","Kasugai"],"新":["新潟","Niigata"],"江":["松江","Matsue"],"八":["八尾","Yao"],"長":["長崎","Nagasaki"],"平":["平塚","Hiratsuka"],"浜":["横浜","Yokohama"],"沢":["金沢","Kanazawa"],"賀":["佐賀","Saga"],"浦":["浦安","Urayasu"],"久":["久留米","Kurume"],"本":["熊本","Kumamoto"],"宮":["宮崎","Miyazaki"],"谷":["越谷","Koshigaya"],"子":["八王子","Hachioji"],"多":["多摩","Tama"],"国":["岩国","Iwakuni"],"石":["石巻","Ishinomaki"],"部":["春日部","Kasukabe"],"水":["水戸","Mito"],"河":["古河","Koga"],"前":["前橋","Maebashi"],"下":["下関","Shimonoseki"],"良":["奈良","Nara"],"那":["那覇","Naha"],"名":["桑名","Kuwana"],"鹿":["鹿児島","Kagoshima"],"安":["安城","Anjo"],"海":["海老名","Ebina"],"神":["神戸","Kobe"],"郷":["三郷","Misato"],"古":["加古川","Kakogawa"],"宇":["宇都宮","Utsunomiya"],"府":["府中","Fuchu"],"士":["富士","Fuji"],"泉":["和泉","Izumi"],"尾":["西尾","Nishio"],"市":["市川","Ichikawa"],"加":["加古川","Kakogawa"],"志":["習志野","Narashino"],"福":["福岡","Fukuoka"],"越":["川越","Kawagoe"],"広":["広島","Hiroshima"],"米":["米子","Yonago"],"屋":["名古屋","Nagoya"],"千":["千葉","Chiba"],"間":["入間","Iruma"],"飯":["飯塚","Iizuka"],"代":["八千代","Yachiyo"],"知":["高知","Kochi"],"須":["横須賀","Yokosuka"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
