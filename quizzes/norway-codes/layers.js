// Norway Area Codes. Norway has had closed 8-digit numbering since 1993; until
// 31.12.2019 the first two digits of a landline number showed its county (fylke). Since 1.1.2020 these ranges have no
// geographic binding, though providers may still follow the old division. Each map area is a county of 2019, plus
// Svalbard (drawn as an inset). Source: Nkom, hearing on the numbering regulation 11.10.2019, Vedlegg 2.

const LAYERS = {
  key: "norcodes",
  borders: "[DATA.inset]",
  size: [1000,1164],
  pad: 16,
  maxZoom: 30,
  labelScale: 0.3,
  fly: {"pad":1.6,"min":0.05},
  street: {"bounds":[[57.9,4.5],[71.2,31.2]],"maxBounds":[[54,-12],[82,45]]},
  hintLabel: "Color by first digit",
  exploreKind: "codes",
  kinds: [
    {
      key: "codes",
      label: "Two digits",
      noun: ["code","codes"],
      prompt: "dial",
      groups: [["2x","Oslo",["21","22","23","24"]],["3x","Buskerud, Vestfold, Telemark, Aust-Agder, Vest-Agder",["31","32","33","35","37","38"]],["5x","Rogaland, Hordaland, Sogn og Fjordane",["51","52","53","55","56","57"]],["6x","Oppland, Hedmark, Akershus, Østfold",["61","62","63","64","66","67","69"]],["7x","Møre og Romsdal, Trøndelag, Nordland, Troms, Finnmark, Svalbard",["70","71","72","73","74","75","76","77","78","79"]]],
      areas: {"x":{"21":["03"],"22":["03"],"23":["03"],"24":["03"],"31":["06"],"32":["06"],"33":["07"],"35":["08"],"37":["09"],"38":["10"],"51":["11"],"52":["11"],"53":["12"],"55":["12"],"56":["12"],"57":["14"],"61":["05"],"62":["04"],"63":["02"],"64":["02"],"66":["02"],"67":["02"],"69":["01"],"70":["15"],"71":["15"],"72":["50"],"73":["50"],"74":["50"],"75":["18"],"76":["18"],"77":["19"],"78":["20"],"79":["21"]}},
      name: "{id}",
      short: "{id}",
      chip: "{id}",
      chipTitle: "{@n}",
      about: {"t":["{@n}","{group}: {groupSub}"]},
      dial: {"t":[["{id}","hot"],["","cold"]]},
      clicked: {"t":"{p} · {@n}","x":{"11":"51, 52 · Rogaland","12":"53, 55, 56 · Hordaland","15":"70, 71 · Møre og Romsdal","18":"75, 76 · Nordland","50":"72, 73, 74 · Trøndelag","03":"21, 22, 23, 24 · Oslo","06":"31, 32 · Buskerud","02":"63, 64, 66, 67 · Akershus"}},
      presets: [["Big cities",["21","22","23","24","53","55","56","72","73","74","51","52","38","77"]]],
    },
    {
      key: "digit1",
      label: "First digit",
      noun: ["zone","zones"],
      prompt: "dial",
      hints: false,
      groups: [["Zones","first digit",["2","3","5","6","7"]]],
      areas: {"x":{"2":["03"],"3":["06","07","08","09","10"],"5":["11","12","14"],"6":["05","04","02","01"],"7":["15","50","18","19","20","21"]}},
      name: "{id}x",
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"2":"Oslo","3":"Buskerud, Vestfold, Telemark, Aust-Agder, Vest-Agder","5":"Rogaland, Hordaland, Sogn og Fjordane","6":"Oppland, Hedmark, Akershus, Østfold","7":"Møre og Romsdal, Trøndelag, Nordland, Troms, Finnmark, Svalbard"}},
      about: "{chipTitle}",
      dial: {"t":[["{id}","hot"],["x","cold"]]},
      clicked: "{name} · {chipTitle}",
    },
  ],
  g: "{digit1.p}",
  explore: {"t":{"code":"{codes.p}","title":"{@n}","sub":"{codes.about1}"},"x":{"11":{"code":"51, 52","title":"Rogaland","sub":"5x: Rogaland, Hordaland, Sogn og Fjordane"},"12":{"code":"53, 55, 56","title":"Hordaland","sub":"5x: Rogaland, Hordaland, Sogn og Fjordane"},"15":{"code":"70, 71","title":"Møre og Romsdal","sub":"7x: Møre og Romsdal, Trøndelag, Nordland, Troms, Finnmark, Svalbard"},"18":{"code":"75, 76","title":"Nordland","sub":"7x: Møre og Romsdal, Trøndelag, Nordland, Troms, Finnmark, Svalbard"},"50":{"code":"72, 73, 74","title":"Trøndelag","sub":"7x: Møre og Romsdal, Trøndelag, Nordland, Troms, Finnmark, Svalbard"},"03":{"code":"21, 22, 23, 24","title":"Oslo","sub":"2x: Oslo"},"06":{"code":"31, 32","title":"Buskerud","sub":"3x: Buskerud, Vestfold, Telemark, Aust-Agder, Vest-Agder"},"02":{"code":"63, 64, 66, 67","title":"Akershus","sub":"6x: Oppland, Hedmark, Akershus, Østfold"}}},
};
