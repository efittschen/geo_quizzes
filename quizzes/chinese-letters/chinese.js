// Chinese: its characters, for the script quizzes (../shared/reading.js says how this is written). Taiwan writes
// traditional characters, as Hong Kong and Macau do; Singapore and Malaysia write simplified ones (China has no Street View).
// Sounds are Hanyu Pinyin without tones, as Taiwan's signs and maps spell names since 2009 (Banqiao, Zhongli); older
// names stay as they were (Taipei, Kaohsiung, Keelung, Taichung, Hsinchu, Chiayi, Changhua, Pingtung, Taitung,
// Hualien, Kinmen, Tamsui), so a character's older spelling is in its note and may be typed. Hong Kong and Macau spell
// names in Cantonese (Sha Tin, Mong Kok): pinyin is not theirs. A character is a letter here: one tile per sound,
// characters read alike share it.
// The characters are those of Taiwan's place names, most frequent first: the townships and districts with their
// suffix (區 鄉 鎮 市), the counties and the cities of ../taiwan-cities (Ministry of the Interior, via taiwan-atlas),
// ties by the 7,701 village names (村 里); 135 of them in rounds of 9, then nine characters of road and address
// words that are not among them (街 段 巷 弄 號 站 道 國 車). The readings are those of the official English names of those places,
// split into syllables (埤 pi and bi: Pitou, Dabi), checked against Unihan (kMandarin, kHanyuPinlu, kXHC1983, kTGHZ2013); a reading in two names or more may be
// typed, and one in 10% of them or more is in the note. A character in no name is read as Unihan's kMandarin. Then the simplified forms of these characters where they differ (Unihan
// kSimplifiedVariant; 崙 仑 as the 2013 table has it), a round of Singapore and Malaysia. The words are Taiwan's signs, with Hong Kong's and
// Singapore's where they write them.
// (Made by tools/cache/builds/scripts-zh-lo/scripts/make-zh.mjs: run it again rather than edit by hand.)
var SCRIPT = {
  name: 'Chinese', script: 'hani', unicode: 'Han', faces: 3,
  langs: {
    'zh-TW': { name: 'Chinese', where: 'Taiwan', at: 'TWN' },
    'zh-HK': { name: 'Chinese (Hong Kong)', where: 'Hong Kong · Macau', at: 'HKG', like: 'zh-TW', but: {'段': '', '弄': '', '線': '', '國道': '', '快速公路': '', '交流道': '', '路口': '', '單行道': '', '市': '', '縣': '', '鄉': '', '鎮': '', '里': '', '鄰': '', '往': '', '前方': '', '公尺': '', '火車站': '', '公車': '巴士', '捷運': '', '高鐵': '', '加油站': '油站', '藥局': '藥房', '郵局': '郵政局', '派出所': '警署', '國小': '小學', '國中': '', '高中': '', '市場': '街市', '夜市': '', '農會': '', '公所': '', '活動中心': '', '宮': '', '飯店': '酒店', '慢': '慢駛', '讓': '', '禁止停車': '', '施工': '', '機車': '', '待轉': '', '檳榔': ''} },
    'zh-SG': { name: 'Chinese (simplified)', where: 'Singapore · Malaysia', at: 'SGP' },
  },
  letters: [
    { title: '區 鄉 鎮 山 大 新 東 林 市', rows: [
      ['區', 'qu'], ['鄉', 'xiang'], ['鎮', 'zhen'], ['山', 'shan'], ['大', 'da'], ['新', 'xin', 'xin hsin', 'Hsinchu: hsin'], ['東', 'dong', 'dong tung', 'Taitung, Pingtung: tung'], ['林', 'lin'], ['市', 'shi'],
    ] },
    { title: '南 里 竹 埔 中 西 北 湖 港', rows: [
      ['南', 'nan'], ['里', 'li'], ['竹', 'zhu', 'zhu chu', 'Hsinchu: chu'], ['埔', 'pu'], ['中', 'zhong', 'zhong chung', 'Taichung: chung'], ['西', 'xi'], ['北', 'bei', 'bei pei', 'Taipei: pei'], ['湖', 'hu'], ['港', 'gang', 'gang kang', 'Lukang: kang'],
    ] },
    { title: '水 金 縣 安 三 溪 頭 園 城', rows: [
      ['水', 'shui', 'shui sui', 'Tamsui: sui'], ['金', 'jin', 'jin kin', 'Kinmen: kin'], ['縣', 'xian'], ['安', 'an'], ['三', 'san'], ['溪', 'xi'], ['頭', 'tou'], ['園', 'yuan'], ['城', 'cheng'],
    ] },
    { title: '仁 義 寮 平 田 內 萬 化 臺', rows: [
      ['仁', 'ren'], ['義', 'yi'], ['寮', 'liao'], ['平', 'ping'], ['田', 'tian'], ['內', 'nei'], ['萬', 'wan'], ['化', 'hua'], ['臺', 'tai'],
    ] },
    { title: '和 永 龍 口 甲 六 鹿 營 鹽', rows: [
      ['和', 'he'], ['永', 'yong'], ['龍', 'long'], ['口', 'kou'], ['甲', 'jia'], ['六', 'liu'], ['鹿', 'lu'], ['營', 'ying'], ['鹽', 'yan'],
    ] },
    { title: '豐 社 石 樹 州 斗 美 長 潭', rows: [
      ['豐', 'feng'], ['社', 'she'], ['石', 'shi'], ['樹', 'shu'], ['州', 'zhou'], ['斗', 'dou'], ['美', 'mei'], ['長', 'chang', 'chang zhang'], ['潭', 'tan'],
    ] },
    { title: '五 門 子 太 橋 二 沙 蘭 關', rows: [
      ['五', 'wu'], ['門', 'men'], ['子', 'zi'], ['太', 'tai'], ['橋', 'qiao'], ['二', 'er'], ['沙', 'sha'], ['蘭', 'lan'], ['關', 'guan'],
    ] },
    { title: '岡 花 蓮 屯 興 德 崙 上 後', rows: [
      ['岡', 'gang'], ['花', 'hua'], ['蓮', 'lian', 'lian lien', 'Hualien: lien'], ['屯', 'tun'], ['興', 'xing'], ['德', 'de'], ['崙', 'lun'], ['上', 'shang'], ['後', 'hou'],
    ] },
    { title: '坑 泰 武 公 埤 峰 尾 高 八', rows: [
      ['坑', 'keng'], ['泰', 'tai'], ['武', 'wu'], ['公', 'gong'], ['埤', 'bi', 'bi pi', 'also pi'], ['峰', 'feng'], ['尾', 'wei'], ['高', 'gao', 'gao kao', 'Kaohsiung: kao'], ['八', 'ba'],
    ] },
    { title: '員 芳 土 七 烏 台 桃 苑 蘆', rows: [
      ['員', 'yuan'], ['芳', 'fang'], ['土', 'tu'], ['七', 'qi'], ['烏', 'wu'], ['台', 'tai'], ['桃', 'tao'], ['苑', 'yuan'], ['蘆', 'lu'],
    ] },
    { title: '股 投 官 雄 民 瑞 勢 嘉 信', rows: [
      ['股', 'gu'], ['投', 'tou'], ['官', 'guan'], ['雄', 'xiong', 'xiong hsiung', 'Kaohsiung: hsiung'], ['民', 'min'], ['瑞', 'rui'], ['勢', 'shi'], ['嘉', 'jia', 'jia chia', 'Chiayi: chia'], ['信', 'xin'],
    ] },
    { title: '玉 鳳 秀 松 雅 春 佳 梅 草', rows: [
      ['玉', 'yu'], ['鳳', 'feng'], ['秀', 'xiu'], ['松', 'song'], ['雅', 'ya'], ['春', 'chun'], ['佳', 'jia'], ['梅', 'mei'], ['草', 'cao'],
    ] },
    { title: '白 路 河 崎 井 日 龜 宜 苗', rows: [
      ['白', 'bai'], ['路', 'lu'], ['河', 'he'], ['崎', 'qi'], ['井', 'jing'], ['日', 'ri'], ['龜', 'gui'], ['宜', 'yi'], ['苗', 'miao'],
    ] },
    { title: '丹 麻 屏 阿 澳 梓 彰 枋 旗', rows: [
      ['丹', 'dan'], ['麻', 'ma'], ['屏', 'ping'], ['阿', 'a'], ['澳', 'ao'], ['梓', 'zi'], ['彰', 'zhang', 'zhang chang', 'Changhua: chang'], ['枋', 'fang'], ['旗', 'qi'],
    ] },
    { title: '冬 嶼 屋 栗 霧 竿 村 福 光', rows: [
      ['冬', 'dong'], ['嶼', 'yu'], ['屋', 'wu'], ['栗', 'li'], ['霧', 'wu'], ['竿', 'gan'], ['村', 'cun'], ['福', 'fu'], ['光', 'guang'],
    ] },
    { title: '街 段 巷 弄 號 站 道 國 車', rows: [
      ['街', 'jie'], ['段', 'duan'], ['巷', 'xiang'], ['弄', 'nong'], ['號', 'hao'], ['站', 'zhan'], ['道', 'dao'], ['國', 'guo'], ['車', 'che'],
    ] },
  ],
  own: {
    'zh-SG': { rows: [
      ['区', 'qu', '', 'traditional 區'], ['乡', 'xiang', '', 'traditional 鄉'], ['镇', 'zhen', '', 'traditional 鎮'], ['东', 'dong', 'dong tung', 'traditional 東'], ['县', 'xian', '', 'traditional 縣'], ['头', 'tou', '', 'traditional 頭'], ['园', 'yuan', '', 'traditional 園'], ['义', 'yi', '', 'traditional 義'], ['内', 'nei', '', 'traditional 內'], ['万', 'wan', '', 'traditional 萬'], ['台', 'tai', '', 'traditional 臺'], ['龙', 'long', '', 'traditional 龍'], ['营', 'ying', '', 'traditional 營'], ['盐', 'yan', '', 'traditional 鹽'], ['丰', 'feng', '', 'traditional 豐'], ['树', 'shu', '', 'traditional 樹'], ['长', 'chang', 'chang zhang', 'traditional 長'], ['门', 'men', '', 'traditional 門'], ['桥', 'qiao', '', 'traditional 橋'], ['兰', 'lan', '', 'traditional 蘭'], ['关', 'guan', '', 'traditional 關'], ['冈', 'gang', '', 'traditional 岡'], ['莲', 'lian', 'lian lien', 'traditional 蓮'], ['兴', 'xing', '', 'traditional 興'], ['仑', 'lun', '', 'traditional 崙'], ['后', 'hou', '', 'traditional 後'], ['员', 'yuan', '', 'traditional 員'], ['乌', 'wu', '', 'traditional 烏'], ['芦', 'lu', '', 'traditional 蘆'], ['势', 'shi', '', 'traditional 勢'], ['凤', 'feng', '', 'traditional 鳳'], ['龟', 'gui', '', 'traditional 龜'], ['屿', 'yu', '', 'traditional 嶼'], ['雾', 'wu', '', 'traditional 霧'], ['号', 'hao', '', 'traditional 號'], ['国', 'guo', '', 'traditional 國'], ['车', 'che', '', 'traditional 車'],
    ] },
  },
  mixes: [
    ['Top 27', '區 鄉 鎮 山 大 新 東 林 市 南 里 竹 埔 中 西 北 湖 港 水 金 縣 安 三 溪 頭 園 城'],
    ['Top 54', '區 鄉 鎮 山 大 新 東 林 市 南 里 竹 埔 中 西 北 湖 港 水 金 縣 安 三 溪 頭 園 城 仁 義 寮 平 田 內 萬 化 臺 和 永 龍 口 甲 六 鹿 營 鹽 豐 社 石 樹 州 斗 美 長 潭'],
  ],
  // the other characters of ../taiwan-cities' names: read in a typed name, not asked
  together: [
    ['板', 'ban'], ['壢', 'li'], ['莊', 'zhuang'], ['重', 'zhong chong'], ['基', 'ji kee'], ['隆', 'long lung'], ['店', 'dian'], ['康', 'kang'], ['汐', 'xi'], ['止', 'zhi'], ['淡', 'dan tam'], ['洲', 'zhou'], ['楊', 'yang'], ['原', 'yuan'], ['峽', 'xia'], ['份', 'fen'], ['清', 'qing'], ['鶯', 'ying'], ['歌', 'ge'], ['吉', 'ji'], ['觀', 'guan'], ['音', 'yin'], ['虎', 'hu'], ['歸', 'gui'], ['羅', 'luo'], ['梧', 'wu'], ['棲', 'qi'], ['馬', 'ma'], ['神', 'shen'], ['肚', 'du'], ['善', 'shan'], ['潮', 'chao'], ['后', 'hou'], ['麥', 'mai'], ['螺', 'luo'], ['鳥', 'niao'], ['裡', 'li'], ['豆', 'dou'], ['壇', 'tan'], ['結', 'jie'], ['朴', 'pu'], ['保', 'bao'], ['伸', 'shen'], ['礁', 'jiao'], ['蘇', 'su'], ['濃', 'nong'], ['寧', 'ning'], ['名', 'ming'], ['間', 'jian'], ['靖', 'jing'], ['廟', 'miao'], ['心', 'xin'], ['外', 'wai'], ['通', 'tong'], ['霄', 'xiao'], ['館', 'guan'], ['定', 'ding'], ['古', 'gu'], ['治', 'zhi'], ['恆', 'heng'], ['茄', 'jia qie'], ['萣', 'ding'], ['燕', 'yan'], ['巢', 'chao'], ['庫', 'ku'], ['莿', 'ci'], ['桐', 'tong'], ['壯', 'zhuang'], ['圍', 'wei'], ['學', 'xue'], ['深', 'shen'], ['布', 'bu'], ['袋', 'dai'], ['元', 'yuan'], ['背', 'bei'], ['芝', 'zhi'], ['下', 'xia'], ['九', 'jiu'], ['如', 'ru'], ['星', 'xing'], ['芬', 'fen'], ['壁', 'bi'], ['芎', 'qiong'], ['四', 'si'], ['腳', 'jiao'], ['柳', 'liu'], ['巒', 'luan'],
  ],
  words: { themes: [
    { title: 'Roads', rows: [
      ['road', '路|lu', '路|lu'],
      ['street', '街|jie', '街|jie'],
      ['section', '段|duan', ''],
      ['lane', '巷|xiang', '巷|xiang'],
      ['alley', '弄|nong', ''],
      ['number', '號|hao', ''],
      ['avenue', '大道|dadao', ''],
      ['highway', '公路|gonglu', ''],
      ['highway line', '線|xian', ''],
      ['national freeway', '國道|guodao', ''],
      ['expressway', '快速公路|kuaisu gonglu', ''],
      ['bridge', '橋|qiao', '桥|qiao'],
      ['tunnel', '隧道|suidao', ''],
      ['interchange', '交流道|jiaoliudao', ''],
      ['exit', '出口|chukou', '出口|chukou'],
      ['entrance', '入口|rukou', '入口|rukou'],
      ['intersection', '路口|lukou', ''],
      ['one way', '單行道|danxingdao', ''],
    ] },
    { title: 'Places', rows: [
      ['city', '市|shi', ''],
      ['county', '縣|xian', ''],
      ['township', '鄉|xiang', ''],
      ['town', '鎮|zhen', ''],
      ['district', '區|qu', ''],
      ['village', '村|cun', '村|cun'],
      ['urban village', '里|li', ''],
      ['neighbourhood', '鄰|lin', ''],
      ['north', '北|bei', ''],
      ['south', '南|nan', ''],
      ['east', '東|dong', ''],
      ['west', '西|xi', ''],
      ['towards', '往|wang', ''],
      ['ahead', '前方|qianfang', ''],
      ['metres', '公尺|gongchi', ''],
    ] },
    { title: 'Services', rows: [
      ['station', '站|zhan', ''],
      ['railway station', '火車站|huochezhan', ''],
      ['bus', '公車|gongche', '巴士|bashi'],
      ['metro', '捷運|jieyun', ''],
      ['high-speed rail', '高鐵|gaotie', ''],
      ['airport', '機場|jichang', '机场|jichang'],
      ['car park', '停車場|tingchechang', '停车场|tingchechang'],
      ['petrol station', '加油站|jiayouzhan', '油站|youzhan'],
      ['hospital', '醫院|yiyuan', '医院|yiyuan'],
      ['clinic', '診所|zhensuo', '诊所|zhensuo'],
      ['pharmacy', '藥局|yaoju', '药房|yaofang'],
      ['post office', '郵局|youju', ''],
      ['police station', '派出所|paichusuo', ''],
      ['school', '學校|xuexiao', '学校|xuexiao'],
      ['primary school', '國小|guoxiao', '小学|xiaoxue'],
      ['junior high school', '國中|guozhong', ''],
      ['senior high school', '高中|gaozhong', ''],
      ['secondary school', '中學|zhongxue', '中学|zhongxue'],
      ['university', '大學|daxue', '大学|daxue'],
      ['park', '公園|gongyuan', '公园|gongyuan'],
      ['market', '市場|shichang', '巴刹|basha'],
      ['night market', '夜市|yeshi', '夜市|yeshi'],
      ['bank', '銀行|yinhang', '银行|yinhang'],
      ['farmers\' association', '農會|nonghui', ''],
      ['township office', '公所|gongsuo', ''],
      ['community centre', '活動中心|huodong zhongxin', ''],
      ['temple', '廟|miao', '庙|miao'],
      ['palace temple', '宮|gong', '宫|gong'],
      ['Buddhist temple', '寺|si', '寺|si'],
      ['church', '教會|jiaohui', '教堂|jiaotang'],
      ['hotel', '飯店|fandian', '酒店|jiudian'],
      ['restaurant', '餐廳|canting', '餐厅|canting'],
    ] },
    { title: 'Notices', rows: [
      ['stop', '停|ting', ''],
      ['slow', '慢|man', ''],
      ['yield', '讓|rang', ''],
      ['prohibited', '禁止|jinzhi', ''],
      ['no parking', '禁止停車|jinzhi tingche', ''],
      ['caution', '小心|xiaoxin', ''],
      ['danger', '危險|weixian', ''],
      ['roadworks', '施工|shigong', ''],
      ['scooters', '機車|jiche', ''],
      ['two-stage turn', '待轉|daizhuan', ''],
      ['pedestrians', '行人|xingren', ''],
      ['betel nut', '檳榔|binlang', ''],
      ['for rent', '出租|chuzu', '出租|chuzu'],
      ['for sale', '出售|chushou', '出售|chushou'],
    ] },
  ] },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"鎮":["平鎮","Pingzhen"],"山":["竹山","Zhushan"],"大":["大肚","Dadu"],"新":["新莊","Xinzhuang"],"東":["竹東","Zhudong"],"林":["林園","Linyuan"],"市":["新市","Xinshi"],"南":["臺南","Tainan"],"里":["大里","Dali"],"竹":["蘆竹","Luzhu"],"埔":["埔里","Puli"],"中":["中壢","Zhongli"],"西":["西螺","Xiluo"],"北":["竹北","Zhubei"],"湖":["湖口","Hukou"],"港":["東港","Donggang"],"水":["清水","Qingshui"],"金":["金寧","Jinning"],"安":["吉安","Ji'an"],"三":["三重","Sanchong"],"溪":["大溪","Daxi"],"頭":["頭份","Toufen"],"園":["大園","Dayuan"],"城":["金城","Jincheng"],"仁":["仁德","Rende"],"義":["嘉義","Chiayi"],"寮":["大寮","Daliao"],"平":["太平","Taiping"],"田":["田中","Tianzhong"],"內":["內埔","Neipu"],"萬":["萬里","Wanli"],"化":["善化","Shanhua"],"臺":["臺北","Taipei"],"和":["中和","Zhonghe"],"永":["永康","Yongkang"],"龍":["龍潭","Longtan"],"口":["林口","Linkou"],"甲":["大甲","Dajia"],"六":["斗六","Douliu"],"鹿":["沙鹿","Shalu"],"營":["新營","Xinying"],"鹽":["埔鹽","Puyan"],"豐":["豐原","Fengyuan"],"社":["社頭","Shetou"],"石":["東石","Dongshi"],"樹":["樹林","Shulin"],"州":["潮州","Chaozhou"],"斗":["斗南","Dounan"],"美":["和美","Hemei"],"長":["長治","Changzhi"],"潭":["龍潭","Longtan"],"五":["五股","Wugu"],"子":["潭子","Tanzi"],"太":["太保","Taibao"],"橋":["板橋","Banqiao"],"二":["二林","Erlin"],"沙":["金沙","Jinsha"],"蘭":["宜蘭","Yilan"],"關":["關廟","Guanmiao"],"岡":["岡山","Gangshan"],"花":["花蓮","Hualien"],"蓮":["阿蓮","Alian"],"屯":["草屯","Caotun"],"興":["福興","Fuxing"],"德":["八德","Bade"],"崙":["二崙","Erlun"],"上":["水上","Shuishang"],"後":["後龍","Houlong"],"坑":["古坑","Gukeng"],"泰":["泰山","Taishan"],"武":["仁武","Renwu"],"公":["馬公","Magong"],"埤":["埤頭","Pitou"],"峰":["霧峰","Wufeng"],"尾":["虎尾","Huwei"],"高":["高樹","Gaoshu"],"八":["八里","Bali"],"員":["員林","Yuanlin"],"芳":["芳苑","Fangyuan"],"土":["土城","Tucheng"],"七":["七股","Qigu"],"烏":["烏日","Wuri"],"桃":["桃園","Taoyuan"],"苑":["苑裡","Yuanli"],"蘆":["蘆洲","Luzhou"],"股":["五股","Wugu"],"投":["南投","Nantou"],"官":["官田","Guantian"],"雄":["高雄","Kaohsiung"],"民":["民雄","Minxiong"],"瑞":["瑞芳","Ruifang"],"勢":["東勢","Dongshi"],"嘉":["嘉義","Chiayi"],"玉":["玉里","Yuli"],"鳳":["鳳山","Fengshan"],"秀":["秀水","Xiushui"],"松":["鳥松","Niaosong"],"雅":["大雅","Daya"],"春":["恆春","Hengchun"],"佳":["佳里","Jiali"],"梅":["楊梅","Yangmei"],"草":["草屯","Caotun"],"白":["白河","Baihe"],"路":["路竹","Luzhu"],"河":["白河","Baihe"],"崎":["竹崎","Zhuqi"],"井":["龍井","Longjing"],"日":["烏日","Wuri"],"龜":["龜山","Guishan"],"宜":["宜蘭","Yilan"],"苗":["苗栗","Miaoli"],"丹":["萬丹","Wandan"],"麻":["麻豆","Madou"],"屏":["屏東","Pingtung"],"阿":["阿蓮","Alian"],"澳":["蘇澳","Su'ao"],"梓":["梓官","Ziguan"],"彰":["彰化","Changhua"],"枋":["枋寮","Fangliao"],"旗":["旗山","Qishan"],"冬":["冬山","Dongshan"],"屋":["新屋","Xinwu"],"栗":["苗栗","Miaoli"],"霧":["霧峰","Wufeng"],"竿":["南竿","Nangan"],"村":["大村","Dacun"],"福":["福興","Fuxing"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
