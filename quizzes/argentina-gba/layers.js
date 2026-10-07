// Greater Buenos Aires. INDEC's 24 partidos of Greater Buenos Aires ("¿Qué es el
// Gran Buenos Aires?", 2003) on their own close-up map: the same IGN partido borders as ../argentina-partidos, with the
// City of Buenos Aires and the neighbouring partidos as context. Grouped by electoral section (Junta Electoral de la
// Provincia de Buenos Aires); seats (cabeceras) from Wikidata (P36), shown where the town's name differs.

const LAYERS = {
  key: "argba",
  size: [1000,1388],
  pad: 16,
  maxZoom: 20,
  labelScale: 0.1,
  fly: {"pad":1.8,"min":0.16666666666666666},
  street: {"bounds":[[-35.01,-58.89],[-34.4,-58.02]],"maxBounds":[[-35.6,-59.8],[-33.6,-57.4]]},
  hintLabel: "Color each partido",
  exploreKind: "partidos",
  kinds: [
    {
      key: "partidos",
      label: "Partidos",
      noun: ["partido","partidos"],
      prompt: "name",
      groups: [["1st section","West & north",["06371","06408","06410","06412","06515","06539","06560","06568","06749","06756","06760","06805","06840","06861"]],["3rd section","South",["06028","06035","06091","06260","06270","06274","06427","06434","06490","06658"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"t":["{group}"],"x":{"06840":["Seat: Caseros","1st section · Borders the city"],"06861":["Seat: Olivos","1st section · Borders the city"],"06028":["Seat: Adrogué","3rd section"],"06260":["Seat: Monte Grande","3rd section"],"06427":["Seat: San Justo","3rd section · Borders the city"],"06371":["1st section · Borders the city"],"06035":["3rd section · Borders the city"],"06434":["3rd section · Borders the city"],"06490":["3rd section · Borders the city"]}},
      clicked: "{name}",
      presets: [["Bordering the city",["06861","06371","06840","06427","06490","06434","06035"]]],
    },
  ],
  g: "{a}",
  explore: {"x":{"06412":{"code":"1st","title":"José C. Paz","sub":["1st section"]},"06560":{"code":"1st","title":"Moreno","sub":["1st section"]},"06427":{"code":"3rd","title":"La Matanza","sub":["Seat: San Justo","3rd section · Borders the city"]},"06861":{"code":"1st","title":"Vicente López","sub":["Seat: Olivos","1st section · Borders the city"]},"06091":{"code":"3rd","title":"Berazategui","sub":["3rd section"]},"06749":{"code":"1st","title":"San Fernando","sub":["1st section"]},"06805":{"code":"1st","title":"Tigre","sub":["1st section"]},"06028":{"code":"3rd","title":"Almirante Brown","sub":["Seat: Adrogué","3rd section"]},"06539":{"code":"1st","title":"Merlo","sub":["1st section"]},"06260":{"code":"3rd","title":"Esteban Echeverría","sub":["Seat: Monte Grande","3rd section"]},"06760":{"code":"1st","title":"San Miguel","sub":["1st section"]},"06408":{"code":"1st","title":"Hurlingham","sub":["1st section"]},"06568":{"code":"1st","title":"Morón","sub":["1st section"]},"06515":{"code":"1st","title":"Malvinas Argentinas","sub":["1st section"]},"06371":{"code":"1st","title":"General San Martín","sub":["1st section · Borders the city"]},"06410":{"code":"1st","title":"Ituzaingó","sub":["1st section"]},"06840":{"code":"1st","title":"Tres de Febrero","sub":["Seat: Caseros","1st section · Borders the city"]},"06270":{"code":"3rd","title":"Ezeiza","sub":["3rd section"]},"06274":{"code":"3rd","title":"Florencio Varela","sub":["3rd section"]},"06658":{"code":"3rd","title":"Quilmes","sub":["3rd section"]},"06756":{"code":"1st","title":"San Isidro","sub":["1st section"]},"06434":{"code":"3rd","title":"Lanús","sub":["3rd section · Borders the city"]},"06490":{"code":"3rd","title":"Lomas de Zamora","sub":["3rd section · Borders the city"]},"06035":{"code":"3rd","title":"Avellaneda","sub":["3rd section · Borders the city"]}}},
};
