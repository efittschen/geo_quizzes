// Palestine Regions. Each map area is one of the 16 governorates (محافظات) of the State of Palestine, 11 in the
// West Bank and 5 in the Gaza Strip (data.js: geoBoundaries, the same shapes as the areas of ../israel-codes, where East
// Jerusalem lies with Israel's Jerusalem subdistrict as in ../israel-regions). By English name as on Palestinian signs or
// in Arabic.

const LAYERS = {
  key: "psregions",
  size: [1000, 1156],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.24,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[31.1,34.1],[32.7,35.7]],"maxBounds":[[27,26],[37,44]]},
  hintLabel: "Color each governorate",
  exploreKind: "govs",
  kinds: [
    {
      key: "govs",
      label: "Governorates",
      noun: ["governorate","governorates"],
      prompt: "name",
      lang: "English",
      groups: [["West Bank","الضفة الغربية",["jen","tbs","tkm","nbs","qqa","slt","rbh","jrh","jem","bth","hbn"]],["Gaza Strip","قطاع غزة",["ngz","gza","deb","kys","rfh"]]],
      areas: "@id",
      name: "{@en}",
      short: "{@en}",
      chip: "{@en}",
      chipTitle: "{@ar}",
      about: {"x":{"jen":["West Bank · Seat: Jenin"],"tbs":["West Bank · Seat: Tubas","Tubas & Northern Valleys"],"tkm":["West Bank · Seat: Tulkarm"],"nbs":["West Bank · Seat: Nablus"],"qqa":["West Bank · Seat: Qalqilya"],"slt":["West Bank · Seat: Salfit"],"rbh":["West Bank · Seat: Ramallah"],"jrh":["West Bank · Seat: Jericho","Jericho & Al-Aghwar"],"jem":["West Bank · Seat: Jerusalem"],"bth":["West Bank · Seat: Bethlehem"],"hbn":["West Bank · Seat: Hebron"],"ngz":["Gaza Strip · Seat: Jabalia"],"gza":["Gaza Strip · Seat: Gaza"],"deb":["Gaza Strip · Seat: Deir al-Balah"],"kys":["Gaza Strip · Seat: Khan Yunis"],"rfh":["Gaza Strip · Seat: Rafah"]}},
      clicked: "{@en}",
    },
    {
      key: "govsAr",
      label: "Governorates in Arabic",
      noun: ["governorate","governorates"],
      prompt: "text",
      of: "govs",
      lang: "Arabic",
      groups: [["West Bank","الضفة الغربية",["jen","tbs","tkm","nbs","qqa","slt","rbh","jrh","jem","bth","hbn"]],["Gaza Strip","قطاع غزة",["ngz","gza","deb","kys","rfh"]]],
      areas: "@id",
      name: "{@ar} · {@en}",
      short: "{@ar}",
      chip: "{@ar}",
      chipTitle: "{@en}",
      about: {"x":{"jen":["الضفة الغربية · Jenin"],"tbs":["الضفة الغربية · Tubas","طوباس والأغوار الشمالية"],"tkm":["الضفة الغربية · Tulkarm"],"nbs":["الضفة الغربية · Nablus"],"qqa":["الضفة الغربية · Qalqilya"],"slt":["الضفة الغربية · Salfit"],"rbh":["الضفة الغربية · Ramallah & Al-Bireh"],"jrh":["الضفة الغربية · Jericho","أريحا والأغوار"],"jem":["الضفة الغربية · Jerusalem"],"bth":["الضفة الغربية · Bethlehem"],"hbn":["الضفة الغربية · Hebron"],"ngz":["قطاع غزة · North Gaza"],"gza":["قطاع غزة · Gaza"],"deb":["قطاع غزة · Deir al-Balah"],"kys":["قطاع غزة · Khan Yunis"],"rfh":["قطاع غزة · Rafah"]}},
      text: {"t":{"text":"{@ar}","lang":"ar","cls":"city"}},
      clicked: "{name}",
    },
  ],
  g: "{@id}",
  explore: {"x":{"jen":{"code":"جنين","title":"Jenin","sub":["West Bank"]},"tbs":{"code":"طوباس","title":"Tubas","sub":["Tubas & Northern Valleys · West Bank"]},"tkm":{"code":"طولكرم","title":"Tulkarm","sub":["West Bank"]},"nbs":{"code":"نابلس","title":"Nablus","sub":["West Bank"]},"qqa":{"code":"قلقيلية","title":"Qalqilya","sub":["West Bank"]},"slt":{"code":"سلفيت","title":"Salfit","sub":["West Bank"]},"rbh":{"code":"رام الله والبيرة","title":"Ramallah & Al-Bireh","sub":["West Bank"]},"jrh":{"code":"أريحا","title":"Jericho","sub":["Jericho & Al-Aghwar · West Bank"]},"jem":{"code":"القدس","title":"Jerusalem","sub":["West Bank"]},"bth":{"code":"بيت لحم","title":"Bethlehem","sub":["West Bank"]},"hbn":{"code":"الخليل","title":"Hebron","sub":["West Bank"]},"ngz":{"code":"شمال غزة","title":"North Gaza","sub":["Gaza Strip"]},"gza":{"code":"غزة","title":"Gaza","sub":["Gaza Strip"]},"deb":{"code":"دير البلح","title":"Deir al-Balah","sub":["Gaza Strip"]},"kys":{"code":"خان يونس","title":"Khan Yunis","sub":["Gaza Strip"]},"rfh":{"code":"رفح","title":"Rafah","sub":["Gaza Strip"]}}},
};
