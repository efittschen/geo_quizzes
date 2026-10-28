// Botswana Regions. Each map area is one of the 28 districts of the 2011 census: the sub-districts of the 10 districts
// (Central's Serowe/Palapye, Mahalapye, Bobonong, Boteti and Tutume; Kweneng East and West; Ngwaketse, Barolong and
// Ngwaketse West; Ngamiland East and West and the Okavango Delta; Ghanzi and the Central Kalahari Game Reserve;
// Kgalagadi North and South), the 6 cities and towns with a council of their own (Gaborone, Francistown, Lobatse,
// Selebi-Phikwe, Jwaneng, Sowa Town) and Orapa. The first layer is the 10 districts and those 6 towns (the 16 of
// ISO 3166-2:BW); Orapa, a mining town with no council of its own, counts in Central there.
//
// Sources: Statistics Botswana, 2011 census boundaries (UNFPA), via OCHA COD-AB (CC BY-IGO). Names as in Botswana
// (the census file writes them in capitals: SELIBE PHIKWE, SOUTHERN for Ngwaketse, NGAMILAND DELTA, CENTRAL KGALAGADI
// GAME RESERVE). District seats: the districts' councils.

const LAYERS = {
  key: "bwregions",
  borders: "[DATA.db]",
  size: [1000, 1054],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.22,
  fly: {"pad":1.6,"min":0.03},
  street: {"bounds":[[-27.1,19.8],[-17.6,29.5]],"maxBounds":[[-31,11],[-13,38]]},
  hintLabel: "Color by district",
  exploreKind: "subdistricts",
  kinds: [
    {
      key: "districts",
      label: "Districts",
      noun: ["district","districts"],
      prompt: "name",
      hints: false,
      groups: [["Districts","",["12","15","16","17","11","10","13","14","09","08"]],["Cities and towns","",["01","02","03","04","06","07"]]],
      areas: "@dist",
      name: {"x":{"10":"Kweneng","11":"Kgatleng","12":"Central","13":"North-East","14":"North-West","15":"Chobe","16":"Ghanzi","17":"Kgalagadi","09":"South-East","08":"Southern","01":"Gaborone","02":"Francistown","03":"Lobatse","04":"Selebi-Phikwe","06":"Jwaneng","07":"Sowa Town"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"10":"Molepolole","11":"Mochudi","12":"Serowe","13":"Masunga","14":"Maun","15":"Kasane","16":"Ghanzi","17":"Tsabong","09":"Ramotswa","08":"Kanye","01":"City","02":"City","03":"Town","04":"Town","06":"Town","07":"Town"}},
      about: {"x":{"10":["Seat: Molepolole","2 census districts"],"11":["Seat: Mochudi","1 census district"],"12":["Seat: Serowe","6 census districts"],"13":["Seat: Masunga","1 census district"],"14":["Seat: Maun","3 census districts"],"15":["Seat: Kasane","1 census district"],"16":["Seat: Ghanzi","2 census districts"],"17":["Seat: Tsabong","2 census districts"],"09":["Seat: Ramotswa","1 census district"],"08":["Seat: Kanye","3 census districts"],"01":["City council"],"02":["City council"],"03":["Town council"],"04":["Town council"],"06":["Town council"],"07":["Town council"]}},
      clicked: "{name}",
    },
    {
      key: "subdistricts",
      label: "Sub-districts",
      noun: ["sub-district","sub-districts"],
      prompt: "name",
      groups: [["Central","",["1203","1204","1202","0501","1201","1205"]],["Chobe","",["1501"]],["Ghanzi","",["1602","1601"]],["Kgalagadi","",["1702","1701"]],["Kgatleng","",["1101"]],["Kweneng","",["1001","1002"]],["North-East","",["1301"]],["North-West","",["1401","1402","1403"]],["South-East","",["0901"]],["Southern","",["0802","0801","0803"]],["Cities and towns","",["0101","0201","0301","0401","0601","0701"]]],
      areas: "@id",
      name: "{@name}",
      short: "{@name}",
      chip: "{@name}",
      chipTitle: "{districts.name}",
      about: {"t":["{districts.name}"]},
      clicked: "{@name}",
    },
  ],
  g: "{@dist}",
  explore: {"t":{"code":"{districts.name}","title":"{@name}","sub":["{districts.about0}"]}},
};
