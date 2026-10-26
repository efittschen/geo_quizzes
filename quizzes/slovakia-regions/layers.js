// Slovakia Regions: the 8 kraje and the 79 okresy (Bratislava I–V and Košice I–IV among them). Map areas are the
// okresy, from ÚGKK SR, ZBGIS administrative boundaries (CC BY 4.0, state of 2024), converted from S-JTSK (Krovak) to WGS84.
// Names as the country writes them (Košický kraj, Košice-okolie). The same map serves ../slovakia-plates and the zones of
// ../slovakia-postcodes.

const LAYERS = {
  key: "skregions",
  size: [1000,496],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.25,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[47.73,16.83],[49.61,22.57]],"maxBounds":[[44,11],[53,28]]},
  hintLabel: "Color by region",
  exploreKind: "okresy",
  kinds: [
    {
      key: "kraje",
      label: "Regions",
      noun: ["region","regions"],
      prompt: "name",
      groups: [["Regions","",["1","2","3","4","5","6","7","8"]]],
      areas: "@kraj",
      name: {"x":{"1":"Bratislavský kraj","2":"Trnavský kraj","3":"Trenčiansky kraj","4":"Nitriansky kraj","5":"Žilinský kraj","6":"Banskobystrický kraj","7":"Prešovský kraj","8":"Košický kraj"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"1":"Bratislava Region","2":"Trnava Region","3":"Trenčín Region","4":"Nitra Region","5":"Žilina Region","6":"Banská Bystrica Region","7":"Prešov Region","8":"Košice Region"}},
      about: {"x":{"1":["Bratislava Region","Seat: Bratislava"],"2":["Trnava Region","Seat: Trnava"],"3":["Trenčín Region","Seat: Trenčín"],"4":["Nitra Region","Seat: Nitra"],"5":["Žilina Region","Seat: Žilina"],"6":["Banská Bystrica Region","Seat: Banská Bystrica"],"7":["Prešov Region","Seat: Prešov"],"8":["Košice Region","Seat: Košice"]}},
      clicked: "{name}",
    },
    {
      key: "okresy",
      label: "Districts",
      noun: ["district","districts"],
      prompt: "name",
      groups: [["Bratislavský kraj","",["d101","d102","d103","d104","d105","d106","d107","d108"]],["Trnavský kraj","",["d201","d202","d203","d204","d205","d206","d207"]],["Trenčiansky kraj","",["d301","d302","d303","d304","d305","d306","d307","d308","d309"]],["Nitriansky kraj","",["d401","d402","d403","d404","d405","d406","d407"]],["Žilinský kraj","",["d501","d502","d503","d504","d505","d506","d507","d508","d509","d510","d511"]],["Banskobystrický kraj","",["d601","d602","d603","d604","d605","d606","d607","d608","d609","d610","d611","d612","d613"]],["Prešovský kraj","",["d701","d702","d703","d704","d705","d706","d707","d708","d709","d710","d711","d712","d713"]],["Košický kraj","",["d801","d802","d803","d804","d805","d806","d807","d808","d809","d810","d811"]]],
      areas: "@id",
      name: "{@okn}",
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"t":["{group}"]},
      clicked: "{name}",
    },
  ],
  g: "{@kraj}",
  explore: {"t":{"code":"{okresy.name}","title":"{kraje.name}","sub":["{kraje.chipTitle}"]}},
};
