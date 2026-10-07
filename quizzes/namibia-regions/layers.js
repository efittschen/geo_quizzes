// Namibia Regions. The map areas (data.js) are pieces of the 14 regions, cut where
// another grouping splits a region: the Red Line (veterinary cordon fence), the D-road number zones and the phone
// codes (../namibia-codes uses the same areas).
//   region  COD-AB region name (Namibia Statistics Agency 2011, with the 2013 Kavango split and Zambezi rename)
//   fence   N / S of the Red Line: whole 2011 constituencies, Etosha National Park (OSM) counted north; approximate
//   dz      D-road zone: the first digit of most D-road numbers (OSM ref tags, by length) in the piece's constituencies;
//           0 = three-digit numbers (D201–D861)
//   code    landline area code (see ../namibia-codes/layers.js)

const LAYERS = {
  key: "namregions",
  size: [1000,924],
  pad: 16,
  maxZoom: 30,
  labelScale: 0.22,
  fly: {"pad":1.6,"min":0.05},
  street: {"bounds":[[-29,11.7],[-16.9,25.3]],"maxBounds":[[-35,5],[-10,32]]},
  hintLabel: "Color by region",
  exploreKind: "regions",
  kinds: [
    {
      key: "regions",
      label: "Regions",
      noun: ["region","regions"],
      prompt: "name",
      groups: [["North-central","",["Omusati","Oshana","Ohangwena","Oshikoto"]],["Northeast","",["Kavango West","Kavango East","Zambezi"]],["West & centre","",["Kunene","Erongo","Otjozondjupa","Khomas","Omaheke"]],["South","",["Hardap","Karas"]]],
      areas: "@region",
      name: {"t":"{id}","x":{"Karas":"ǁKharas"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"Omusati":"Outapi","Oshana":"Oshakati","Ohangwena":"Eenhana","Oshikoto":"Omuthiya","Kavango West":"Nkurenkuru","Kavango East":"Rundu","Zambezi":"Katima Mulilo","Kunene":"Opuwo","Erongo":"Swakopmund","Otjozondjupa":"Otjiwarongo","Khomas":"Windhoek","Omaheke":"Gobabis","Hardap":"Mariental","Karas":"Keetmanshoop"}},
      about: {"x":{"Omusati":["Capital: Outapi","Area code 065 · 067"],"Oshana":["Capital: Oshakati","Area code 065 · 067"],"Ohangwena":["Capital: Eenhana","Area code 065"],"Oshikoto":["Capital: Omuthiya","Area code 065 · 067"],"Kavango West":["Capital: Nkurenkuru","Area code 066"],"Kavango East":["Capital: Rundu","Area code 066"],"Zambezi":["Capital: Katima Mulilo","Area code 066"],"Kunene":["Capital: Opuwo","Area code 064 · 065 · 067"],"Erongo":["Capital: Swakopmund","Area code 064"],"Otjozondjupa":["Capital: Otjiwarongo","Area code 062 · 067"],"Khomas":["Capital: Windhoek","Area code 061 · 062 · 063"],"Omaheke":["Capital: Gobabis","Area code 062 · 063 · 067"],"Hardap":["Capital: Mariental","Area code 062 · 063"],"Karas":["Capital: Keetmanshoop","Area code 063"]}},
      clicked: "{name}",
    },
    {
      key: "fence",
      label: "Red Line",
      noun: ["side","sides"],
      prompt: "name",
      hints: false,
      groups: [["Red Line","veterinary cordon fence",["N","S"]]],
      areas: "@fence",
      name: {"x":{"N":"North of the Red Line","S":"South of the Red Line"}},
      short: {"x":{"N":"North","S":"South"}},
      chip: "{short}",
      chipTitle: "{name}",
      about: {"x":{"N":"Zambezi, Kavango East, Kunene, Ohangwena, Omusati, Oshana, Oshikoto, Otjozondjupa, Kavango West","S":"Erongo, Hardap, ǁKharas, Khomas, Kunene, Omaheke, Oshikoto, Otjozondjupa"}},
      clicked: "{name}",
    },
    {
      key: "droads",
      label: "D-road numbers",
      noun: ["zone","zones"],
      prompt: "name",
      hints: false,
      groups: [["D roads","by first digit",["0","1","2","3"]]],
      areas: "@dz",
      name: {"t":"D{@dz}xxx","x":{"0":"Dxxx"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"t":"first digit {@dz}","x":{"0":"three digits"}},
      about: {"x":{"0":["three digits","Hardap, ǁKharas"],"1":["first digit 1","Erongo, Hardap, Khomas, Omaheke"],"2":["first digit 2","Erongo, Kunene, Otjozondjupa"],"3":["first digit 3","Zambezi, Kavango East, Kunene, Ohangwena, Omaheke, Omusati, Oshana, Oshikoto, Otjozondjupa, Kavango West"]}},
      clicked: {"t":"{name} · {@region}","x":{"ka63s0":"Dxxx · ǁKharas"}},
    },
  ],
  g: "{@region}",
  explore: {"t":{"code":"{regions.name}","title":"{fence.name}","sub":["D roads: {droads.name}","Area code {@code}"]}},
};
