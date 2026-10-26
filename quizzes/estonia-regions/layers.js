// Estonia Regions. Each map area is one of the 79 omavalitsused (municipalities since the 2017 reform: 15 linnad and 64
// vallad), grouped into the 15 maakonnad (counties) and Statistics Estonia's 5 NUTS 3 regions, which only cut the
// maakonnad and omavalitsused into rounds. Names as in Estonian (Harju maakond, Saue vald, Tartu linn); the English
// name is said with each.
//
// Sources: omavalitsused, maakonnad and their borders: Maa- ja Ruumiamet (Estonian Land and Spatial Development Board),
// EHAK administrative boundaries, omavalitsus_shp of 1 December 2024 (open data licence, compatible with CC BY 4.0);
// NUTS 3 regions: Statistics Estonia.

const LAYERS = {
  key: "eeregions",
  borders: "[DATA.rb]",
  size: [1000,693],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.22,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[57.4,21.6],[59.8,28.4]],"maxBounds":[[53,13],[64,37]]},
  hintLabel: "Color by maakond",
  exploreKind: "maakonnad",
  kinds: [
    {
      key: "nuts",
      label: "NUTS regions",
      groupsOnly: true,
      noun: ["region","regions"],
      prompt: "name",
      hints: false,
      groups: [["NUTS 3","Statistics Estonia",["EE001","EE004","EE009","EE00A","EE008"]]],
      areas: "@nuts",
      name: {"x":{"EE001":"Põhja-Eesti","EE004":"Lääne-Eesti","EE009":"Kesk-Eesti","EE00A":"Kirde-Eesti","EE008":"Lõuna-Eesti"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"EE001":"Northern Estonia","EE004":"Western Estonia","EE009":"Central Estonia","EE00A":"Northeast Estonia","EE008":"Southern Estonia"}},
      about: {"x":{"EE001":["Northern Estonia","Harju maakond"],"EE004":["Western Estonia","Hiiu maakond, Lääne maakond, Pärnu maakond, Saare maakond"],"EE009":["Central Estonia","Järva maakond, Lääne-Viru maakond, Rapla maakond"],"EE00A":["Northeast Estonia","Ida-Viru maakond"],"EE008":["Southern Estonia","Jõgeva maakond, Põlva maakond, Tartu maakond, Valga maakond, Viljandi maakond, Võru maakond"]}},
      clicked: "{name}",
    },
    {
      key: "maakonnad",
      label: "Maakonnad",
      noun: ["maakond","maakonnad"],
      prompt: "name",
      hints: false,
      areaRank: false,
      groups: [["Põhja-Eesti","Northern Estonia",["0037"]],["Lääne-Eesti","Western Estonia",["0039","0056","0068","0074"]],["Kesk-Eesti","Central Estonia",["0052","0060","0071"]],["Kirde-Eesti","Northeast Estonia",["0045"]],["Lõuna-Eesti","Southern Estonia",["0050","0064","0079","0081","0084","0087"]]],
      areas: "@mk",
      name: {"x":{"0037":"Harju maakond","0039":"Hiiu maakond","0045":"Ida-Viru maakond","0050":"Jõgeva maakond","0052":"Järva maakond","0056":"Lääne maakond","0060":"Lääne-Viru maakond","0064":"Põlva maakond","0068":"Pärnu maakond","0071":"Rapla maakond","0074":"Saare maakond","0079":"Tartu maakond","0081":"Valga maakond","0084":"Viljandi maakond","0087":"Võru maakond"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"0037":"Harju County","0039":"Hiiu County","0045":"Ida-Viru County","0050":"Jõgeva County","0052":"Järva County","0056":"Lääne County","0060":"Lääne-Viru County","0064":"Põlva County","0068":"Pärnu County","0071":"Rapla County","0074":"Saare County","0079":"Tartu County","0081":"Valga County","0084":"Viljandi County","0087":"Võru County"}},
      about: {"x":{"0037":["Harju County","16 omavalitsust"],"0039":["Hiiu County","1 omavalitsus"],"0045":["Ida-Viru County","8 omavalitsust"],"0050":["Jõgeva County","3 omavalitsust"],"0052":["Järva County","3 omavalitsust"],"0056":["Lääne County","3 omavalitsust"],"0060":["Lääne-Viru County","8 omavalitsust"],"0064":["Põlva County","3 omavalitsust"],"0068":["Pärnu County","7 omavalitsust"],"0071":["Rapla County","4 omavalitsust"],"0074":["Saare County","3 omavalitsust"],"0079":["Tartu County","8 omavalitsust"],"0081":["Valga County","3 omavalitsust"],"0084":["Viljandi County","4 omavalitsust"],"0087":["Võru County","5 omavalitsust"]}},
      clicked: "{name}",
    },
    {
      key: "omavalitsused",
      label: "Omavalitsused",
      noun: ["omavalitsus","omavalitsused"],
      prompt: "name",
      groups: [["Harju maakond","Harju County",["0141","0198","0245","0296","0305","0338","0353","0424","0431","0446","0651","0653","0719","0725","0784","0890"]],["Hiiu maakond","Hiiu County",["0205"]],["Ida-Viru maakond","Ida-Viru County",["0130","0251","0321","0442","0511","0515","0736","0803"]],["Jõgeva maakond","Jõgeva County",["0247","0486","0618"]],["Järva maakond","Järva County",["0255","0567","0834"]],["Lääne maakond","Lääne County",["0184","0441","0907"]],["Lääne-Viru maakond","Lääne-Viru County",["0191","0272","0663","0661","0792","0901","0903","0928"]],["Põlva maakond","Põlva County",["0284","0622","0708"]],["Pärnu maakond","Pärnu County",["0214","0303","0430","0638","0624","0712","0809"]],["Rapla maakond","Rapla County",["0293","0317","0502","0668"]],["Saare maakond","Saare County",["0478","0689","0714"]],["Tartu maakond","Tartu County",["0171","0283","0291","0432","0528","0586","0793","0796"]],["Valga maakond","Valga County",["0557","0824","0857"]],["Viljandi maakond","Viljandi County",["0480","0615","0897","0899"]],["Võru maakond","Võru County",["0145","0698","0732","0919","0917"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"t":["{@en}","{group}"],"drop":true},
      clicked: "{name}",
    },
  ],
  g: "{@mk}",
  explore: {"t":{"code":"{omavalitsused.name}","title":"{maakonnad.name}","sub":["{nuts.name}"]}},
};
