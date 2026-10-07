// Turkey Provinces, using the province areas from ../turkey-codes/data.js.
// İstanbul is one province drawn as two areas (European and Asian side); clicking either counts.

const LAYERS = {
  key: "trprov",
  size: [1200,556],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.22,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[35.8,25.6],[42.2,44.9]],"maxBounds":[[30,15],[47,55]]},
  hintLabel: "Color by region",
  exploreKind: "provinces",
  kinds: [
    {
      key: "provinces",
      label: "Provinces",
      noun: ["province","provinces"],
      prompt: "name",
      groups: [["Marmara","",["pv-Balıkesir","pv-Bilecik","pv-Bursa","pv-Çanakkale","pv-Edirne","pv-İstanbul","pv-Kırklareli","pv-Kocaeli","pv-Sakarya","pv-Tekirdağ","pv-Yalova"]],["Aegean","",["pv-Afyonkarahisar","pv-Aydın","pv-Denizli","pv-İzmir","pv-Kütahya","pv-Manisa","pv-Muğla","pv-Uşak"]],["Mediterranean","",["pv-Adana","pv-Antalya","pv-Burdur","pv-Hatay","pv-Isparta","pv-Kahramanmaraş","pv-Mersin","pv-Osmaniye"]],["Central Anatolia","",["pv-Aksaray","pv-Ankara","pv-Çankırı","pv-Eskişehir","pv-Karaman","pv-Kayseri","pv-Kırıkkale","pv-Kırşehir","pv-Konya","pv-Nevşehir","pv-Niğde","pv-Sivas","pv-Yozgat"]],["Black Sea","",["pv-Amasya","pv-Artvin","pv-Bartın","pv-Bayburt","pv-Bolu","pv-Çorum","pv-Düzce","pv-Giresun","pv-Gümüşhane","pv-Karabük","pv-Kastamonu","pv-Ordu","pv-Rize","pv-Samsun","pv-Sinop","pv-Tokat","pv-Trabzon","pv-Zonguldak"]],["Eastern Anatolia","",["pv-Ağrı","pv-Ardahan","pv-Bingöl","pv-Bitlis","pv-Elazığ","pv-Erzincan","pv-Erzurum","pv-Hakkari","pv-Iğdır","pv-Kars","pv-Malatya","pv-Muş","pv-Tunceli","pv-Van"]],["Southeastern Anatolia","",["pv-Adıyaman","pv-Batman","pv-Diyarbakır","pv-Gaziantep","pv-Kilis","pv-Mardin","pv-Siirt","pv-Şanlıurfa","pv-Şırnak"]]],
      areas: {"x":{"pv-Balıkesir":["c266"],"pv-Bilecik":["c228"],"pv-Bursa":["c224"],"pv-Çanakkale":["c286"],"pv-Edirne":["c284"],"pv-İstanbul":["c212","c216"],"pv-Kırklareli":["c288"],"pv-Kocaeli":["c262"],"pv-Sakarya":["c264"],"pv-Tekirdağ":["c282"],"pv-Yalova":["c226"],"pv-Afyonkarahisar":["c272"],"pv-Aydın":["c256"],"pv-Denizli":["c258"],"pv-İzmir":["c232"],"pv-Kütahya":["c274"],"pv-Manisa":["c236"],"pv-Muğla":["c252"],"pv-Uşak":["c276"],"pv-Adana":["c322"],"pv-Antalya":["c242"],"pv-Burdur":["c248"],"pv-Hatay":["c326"],"pv-Isparta":["c246"],"pv-Kahramanmaraş":["c344"],"pv-Mersin":["c324"],"pv-Osmaniye":["c328"],"pv-Aksaray":["c382"],"pv-Ankara":["c312"],"pv-Çankırı":["c376"],"pv-Eskişehir":["c222"],"pv-Karaman":["c338"],"pv-Kayseri":["c352"],"pv-Kırıkkale":["c318"],"pv-Kırşehir":["c386"],"pv-Konya":["c332"],"pv-Nevşehir":["c384"],"pv-Niğde":["c388"],"pv-Sivas":["c346"],"pv-Yozgat":["c354"],"pv-Amasya":["c358"],"pv-Artvin":["c466"],"pv-Bartın":["c378"],"pv-Bayburt":["c458"],"pv-Bolu":["c374"],"pv-Çorum":["c364"],"pv-Düzce":["c380"],"pv-Giresun":["c454"],"pv-Gümüşhane":["c456"],"pv-Karabük":["c370"],"pv-Kastamonu":["c366"],"pv-Ordu":["c452"],"pv-Rize":["c464"],"pv-Samsun":["c362"],"pv-Sinop":["c368"],"pv-Tokat":["c356"],"pv-Trabzon":["c462"],"pv-Zonguldak":["c372"],"pv-Ağrı":["c472"],"pv-Ardahan":["c478"],"pv-Bingöl":["c426"],"pv-Bitlis":["c434"],"pv-Elazığ":["c424"],"pv-Erzincan":["c446"],"pv-Erzurum":["c442"],"pv-Hakkari":["c438"],"pv-Iğdır":["c476"],"pv-Kars":["c474"],"pv-Malatya":["c422"],"pv-Muş":["c436"],"pv-Tunceli":["c428"],"pv-Van":["c432"],"pv-Adıyaman":["c416"],"pv-Batman":["c488"],"pv-Diyarbakır":["c412"],"pv-Gaziantep":["c342"],"pv-Kilis":["c348"],"pv-Mardin":["c482"],"pv-Siirt":["c484"],"pv-Şanlıurfa":["c414"],"pv-Şırnak":["c486"]}},
      name: {"t":"{@ct}","x":{"pv-İstanbul":"İstanbul","pv-Kocaeli":"Kocaeli","pv-Sakarya":"Sakarya","pv-Hatay":"Hatay"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"t":"Area code 0{@k}","x":{"pv-İstanbul":"Area code 0212 / 0216"}},
      about: {"t":["{@st} region","{chipTitle}"]},
      clicked: "{name}",
    },
  ],
  g: {"x":{"c212":"MAR","c216":"MAR","c222":"IA","c224":"MAR","c226":"MAR","c228":"MAR","c232":"EGE","c236":"EGE","c242":"AKD","c246":"AKD","c248":"AKD","c252":"EGE","c256":"EGE","c258":"EGE","c262":"MAR","c264":"MAR","c266":"MAR","c272":"EGE","c274":"EGE","c276":"EGE","c282":"MAR","c284":"MAR","c286":"MAR","c288":"MAR","c312":"IA","c318":"IA","c322":"AKD","c324":"AKD","c326":"AKD","c328":"AKD","c332":"IA","c338":"IA","c342":"GDA","c344":"AKD","c346":"IA","c348":"GDA","c352":"IA","c354":"IA","c356":"KAR","c358":"KAR","c362":"KAR","c364":"KAR","c366":"KAR","c368":"KAR","c370":"KAR","c372":"KAR","c374":"KAR","c376":"IA","c378":"KAR","c380":"KAR","c382":"IA","c384":"IA","c386":"IA","c388":"IA","c412":"GDA","c414":"GDA","c416":"GDA","c422":"DA","c424":"DA","c426":"DA","c428":"DA","c432":"DA","c434":"DA","c436":"DA","c438":"DA","c442":"DA","c446":"DA","c452":"KAR","c454":"KAR","c456":"KAR","c458":"KAR","c462":"KAR","c464":"KAR","c466":"KAR","c472":"DA","c474":"DA","c476":"DA","c478":"DA","c482":"GDA","c484":"GDA","c486":"GDA","c488":"GDA"}},
  explore: {"t":{"code":"0{@k}","title":"{provinces.name}","sub":"{provinces.about0}"}},
};
