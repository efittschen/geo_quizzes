// Colombia Area Codes, using the department areas from ../colombia-regions/data.js.
// Landline numbers are 60B + 7 digits, e.g. 604 234 5678, each code covering whole departments (CRC Resolución 5826 de
// 2019, art. 11, as amended by Res. 5967 de 2020; in force since 1 March 2022). Until then the code was the single
// digit B, written e.g. (4) 234 5678; the new codes put 60 in front of the old digit, so both forms cover the same areas.

const LAYERS = {
  key: "cocodes",
  size: [1000,1468],
  pad: 16,
  maxZoom: 30,
  labelScale: 0.3,
  fly: {"pad":1.6,"min":0.05},
  street: {"bounds":[[-4.3,-79.1],[12.6,-66.8]],"maxBounds":[[-10,-90],[18,-60]]},
  hintLabel: "Color code areas",
  exploreKind: "codes",
  kinds: [
    {
      key: "codes",
      label: "Area codes",
      noun: ["area code","area codes"],
      prompt: "dial",
      lang: "Now",
      groups: [["Area codes","",["1","2","4","5","6","7","8"]]],
      areas: {"x":{"1":["d11","d25"],"2":["d19","d52","d76"],"4":["d05","d27","d23"],"5":["d08","d13","d20","d44","d47","d70"],"6":["d17","d63","d66"],"7":["d81","d54","d68"],"8":["d91","d15","d18","d85","d94","d95","d41","d50","d86","d88","d73","d97","d99"]}},
      name: "60{@phone}",
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"1":"Bogotá, Cundinamarca","2":"Cauca, Nariño, Valle del Cauca","4":"Antioquia, Chocó, Córdoba","5":"Atlántico, Bolívar, Cesar, La Guajira, Magdalena, Sucre","6":"Caldas, Quindío, Risaralda","7":"Arauca, Norte de Santander, Santander","8":"Amazonas, Boyacá, Caquetá, Casanare, Guainía, Guaviare, Huila, Meta, Putumayo, San Andrés, Tolima, Vaupés, Vichada"}},
      about: "{chipTitle}",
      dial: {"t":[["60","cold"],["{id}","hot"]]},
      clicked: {"t":"{name} ({@name})","x":{"d88":"608 (San Andrés)"}},
    },
    {
      key: "old",
      label: "Old codes",
      noun: ["area code","area codes"],
      prompt: "dial",
      of: "codes",
      lang: "Until 2021",
      groups: [["One-digit codes","until 2021",["1","2","4","5","6","7","8"]]],
      areas: {"x":{"1":["d11","d25"],"2":["d19","d52","d76"],"4":["d05","d27","d23"],"5":["d08","d13","d20","d44","d47","d70"],"6":["d17","d63","d66"],"7":["d81","d54","d68"],"8":["d91","d15","d18","d85","d94","d95","d41","d50","d86","d88","d73","d97","d99"]}},
      name: "({@phone})",
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"1":"Bogotá, Cundinamarca","2":"Cauca, Nariño, Valle del Cauca","4":"Antioquia, Chocó, Córdoba","5":"Atlántico, Bolívar, Cesar, La Guajira, Magdalena, Sucre","6":"Caldas, Quindío, Risaralda","7":"Arauca, Norte de Santander, Santander","8":"Amazonas, Boyacá, Caquetá, Casanare, Guainía, Guaviare, Huila, Meta, Putumayo, San Andrés, Tolima, Vaupés, Vichada"}},
      about: "{chipTitle}",
      dial: {"t":[["(","cold"],["{id}","hot"],[")","cold"]]},
      clicked: {"t":"{name} {@name}","x":{"d88":"(8) San Andrés"}},
    },
  ],
  g: "{@region}",
  explore: {"t":{"code":"{codes.name}","title":"{@name}","sub":["Until 2021: {old.name}","Capital: {@capital}"]}},
};
