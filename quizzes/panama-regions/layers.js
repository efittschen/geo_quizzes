// Panama Regions. Each map area is one of the 81 districts (distritos), or one of the two comarcas indígenas that have
// no districts (Guna Yala, Naso Tjër Di); the districts are grouped into the 10 provinces and the 4 comarcas of
// provincial level (Emberá-Wounaan, Guna Yala, Ngäbe-Buglé, and Naso Tjër Di since 2020). The two comarcas of
// corregimiento level are drawn with the district they lie in: Kuna de Madugandí with Chepo, Kuna de Wargandí with
// Pinogana. Names as written in Panama; the two Santa Fe districts are asked with their province.
//
// Sources: provinces, comarcas and districts: OpenStreetMap (boundary=administrative, admin_level 4 and 6; © OpenStreetMap
// contributors, ODbL), October 2026, cut to the OSM land polygons (osmdata.openstreetmap.de, ODbL). Capitals: Wikidata
// (CC0; capital, P36), Ngäbe-Buglé's (Llano Tugrí) from Spanish Wikipedia.

const LAYERS = {
  key: "paregions",
  borders: "[DATA.prov]",
  size: [1000, 418],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.2,
  fly: {"pad":1.6,"min":0.035},
  street: {"bounds":[[7.1,-83.2],[9.8,-77]],"maxBounds":[[3,-92],[14,-69]]},
  hintLabel: "Color by province",
  exploreKind: "provincias",
  kinds: [
    {
      key: "provincias",
      label: "Provincias",
      noun: ["province","provinces"],
      prompt: "name",
      hints: false,
      groups: [["Provincias","",["1","4","2","3","5","6","7","8","10","9"]],["Comarcas","Comarcas indígenas",["EM","KY","NB","NT"]]],
      areas: "@prov",
      name: {"x":{"1":"Bocas del Toro","2":"Coclé","3":"Colón","4":"Chiriquí","5":"Darién","6":"Herrera","7":"Los Santos","8":"Panamá","9":"Veraguas","10":"Panamá Oeste","EM":"Emberá-Wounaan","KY":"Guna Yala","NB":"Ngäbe-Buglé","NT":"Naso Tjër Di"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"1":"Provincia","2":"Provincia","3":"Provincia","4":"Provincia","5":"Provincia","6":"Provincia","7":"Provincia","8":"Provincia","9":"Provincia","10":"Provincia","EM":"Comarca","KY":"Comarca","NB":"Comarca","NT":"Comarca"}},
      about: {"x":{"1":["Provincia","Capital: Bocas del Toro","4 distritos"],"2":["Provincia","Capital: Penonomé","6 distritos"],"3":["Provincia","Capital: Colón","6 distritos"],"4":["Provincia","Capital: David","14 distritos"],"5":["Provincia","Capital: La Palma","3 distritos"],"6":["Provincia","Capital: Chitré","7 distritos"],"7":["Provincia","Capital: Las Tablas","7 distritos"],"8":["Provincia","Capital: Panamá","6 distritos"],"9":["Provincia","Capital: Santiago de Veraguas","12 distritos"],"10":["Provincia","Capital: La Chorrera","5 distritos"],"EM":["Comarca","Capital: Unión Chocó","2 distritos"],"KY":["Comarca","Capital: El Porvenir","No distritos"],"NB":["Comarca","Capital: Llano Tugrí","9 distritos"],"NT":["Comarca","Capital: Sieyic","No distritos"]}},
      clicked: "{name}",
    },
    {
      key: "distritos",
      label: "Distritos",
      noun: ["district","districts"],
      prompt: "name",
      groups: [["Bocas del Toro","Provincia",["8394712","8394593","8392157","8394839"]],["Chiriquí","Provincia",["8389576","8389496","8395537","8400067","8397703","8398055","8398180","8403218","8402973","8391689","8402832","8400470","8397730","8403130"]],["Coclé","Provincia",["8434677","8433063","8434415","8434006","8434350","8434519"]],["Colón","Provincia",["8420882","8421155","8421106","8421025","8420745","8417547"]],["Darién","Provincia",["8419895","8419943","8419717"]],["Herrera","Provincia",["8436344","8450390","8449954","8450442","8436377","8450026","8436357"]],["Los Santos","Provincia",["8434804","8435498","8434756","8435463","8435890","8435754","8436142"]],["Panamá","Provincia",["8389373","8419314","8419471","8415626","8389079","8410053"]],["Panamá Oeste","Provincia",["8421612","8421491","8421374","8421533","8421297"]],["Veraguas","Provincia",["8450549","8466104","8466271","8465805","8466220","8450641","8450653","8450750","8466018","8466174","8465843","8465742"]],["Emberá-Wounaan","Comarca",["8408712","8408620"]],["Guna Yala","Comarca",["KY"]],["Ngäbe-Buglé","Comarca",["8467388","8468046","8468032","8467991","8467451","8467530","8467471","8467888","8467968"]],["Naso Tjër Di","Comarca",["NT"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"t":["{group}","{groupSub}"],"x":{"KY":["Guna Yala","Comarca · no distritos"],"NT":["Naso Tjër Di","Comarca · no distritos"]}},
      clicked: "{name}",
    },
  ],
  g: "{@prov}",
  explore: {"t":{"code":"{provincias.name}","title":"{distritos.name}","sub":["{provincias.chipTitle}"]}},
};
