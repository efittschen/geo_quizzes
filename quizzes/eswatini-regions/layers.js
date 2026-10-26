// Eswatini Regions. Each map area is one of the 55 tinkhundla (constituencies), grouped into the 4 regions
// (Hhohho, Manzini, Lubombo, Shiselweni). The tinkhundla are those of the Central Statistical Office's boundaries
// (valid from 27 January 2021); the 2018 delimitation's four new tinkhundla (59 in all) are not in them.
//
// Sources: Central Statistical Office (CSO) Eswatini, via OCHA COD-AB (CC BY-IGO).

const LAYERS = {
  key: "szregions",
  borders: "[DATA.rb]",
  size: [1000,1333],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.25,
  fly: {"pad":1.6,"min":0.05},
  street: {"bounds":[[-27.5,30.6],[-25.6,32.3]],"maxBounds":[[-32,22],[-21,41]]},
  hintLabel: "Color by region",
  exploreKind: "tinkhundla",
  kinds: [
    {
      key: "regions",
      label: "Regions",
      noun: ["region","regions"],
      prompt: "name",
      hints: false,
      groups: [["Regions","",["1","2","4","3"]]],
      areas: "@reg",
      name: {"x":{"1":"Hhohho","2":"Manzini","3":"Shiselweni","4":"Lubombo"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"1":"Mbabane","2":"Manzini","3":"Nhlangano","4":"Siteki"}},
      about: {"x":{"1":["Capital: Mbabane","14 tinkhundla"],"2":["Capital: Manzini","16 tinkhundla"],"3":["Capital: Nhlangano","14 tinkhundla"],"4":["Capital: Siteki","11 tinkhundla"]}},
      clicked: "{name}",
    },
    {
      key: "tinkhundla",
      label: "Tinkhundla",
      noun: ["inkhundla","tinkhundla"],
      prompt: "name",
      groups: [["Hhohho","",["113","114","106","107","103","112","111","104","110","105","109","102","108","101"]],["Manzini","",["216","221","226","223","222","217","230","228","219","220","227","215","218","229","224","225"]],["Lubombo","",["452","453","455","445","451","450","454","449","447","448","446"]],["Shiselweni","",["334","341","331","336","343","335","333","338","332","337","340","342","344","339"]]],
      areas: "@id",
      name: "{@name}",
      short: "{@name}",
      chip: "{@name}",
      chipTitle: "{group}",
      about: {"t":["{group} region"]},
      clicked: "{@name}",
    },
  ],
  g: "{@reg}",
  explore: {"t":{"code":"{regions.name}","title":"{@name}","sub":["Inkhundla · {regions.name} region"]}},
};
