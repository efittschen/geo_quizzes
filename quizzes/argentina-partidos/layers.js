// Buenos Aires Partidos. The 135 partidos of Buenos Aires Province (IGN
// "Departamento" layer, INDEC codes as ids), grouped by the province's 8 electoral sections (Junta Electoral de la
// Provincia de Buenos Aires, districts per section in the 2025 results). Greater Buenos Aires = INDEC's 24 partidos.
// Seats (cabeceras) from Wikidata (P36), shown only where the town's name differs from the partido's.

const LAYERS = {
  key: "arpartidos",
  size: [1000,1431],
  pad: 16,
  maxZoom: 60,
  labelScale: 0.16,
  fly: {"pad":1.8,"min":0.04},
  street: {"bounds":[[-41.1,-63.4],[-33.2,-56.6]],"maxBounds":[[-45,-70],[-30,-50]]},
  hintLabel: "Color by electoral section",
  exploreKind: "partidos",
  kinds: [
    {
      key: "sections",
      label: "Electoral sections",
      noun: ["section","sections"],
      prompt: "name",
      hints: false,
      groups: [["Sections","",["s1","s2","s3","s4","s5","s6","s7","s8"]]],
      areas: {"x":{"s1":["06126","06252","06329","06364","06371","06408","06410","06412","06497","06515","06525","06532","06539","06560","06568","06574","06638","06749","06756","06760","06784","06805","06840","06861"],"s2":["06077","06070","06140","06161","06175","06266","06623","06665","06686","06714","06728","06735","06763","06770","06882"],"s3":["06028","06035","06091","06098","06119","06134","06245","06260","06270","06274","06427","06434","06483","06490","06505","06648","06655","06658","06778"],"s4":["06588","06021","06112","06147","06154","06210","06224","06277","06294","06351","06385","06392","06406","06413","06462","06469","06609","06679","06826"],"s5":["06042","06063","06168","06218","06238","06280","06301","06308","06315","06336","06343","06357","06420","06455","06466","06476","06511","06518","06547","06581","06630","06644","06672","06742","06791","06812","06868"],"s6":["06007","06014","06056","06084","06189","06196","06182","06203","06231","06322","06399","06448","06553","06602","06616","06651","06700","06721","06819","06833","06847","06875"],"s7":["06854","06049","06105","06287","06595","06693","06707","06798"],"s8":["06441"]}},
      name: {"x":{"s1":"1st section","s2":"2nd section","s3":"3rd section","s4":"4th section","s5":"5th section","s6":"6th section","s7":"7th section","s8":"Capital section"}},
      short: {"x":{"s1":"1st","s2":"2nd","s3":"3rd","s4":"4th","s5":"5th","s6":"6th","s7":"7th","s8":"Capital"}},
      chip: "{name}",
      chipTitle: {"x":{"s1":"West & north of the city","s2":"North","s3":"South of the city","s4":"Northwest","s5":"Atlantic coast","s6":"Southwest","s7":"Centre","s8":"La Plata"}},
      about: {"x":{"s1":["West & north of the city","24 partidos"],"s2":["North","15 partidos"],"s3":["South of the city","19 partidos"],"s4":["Northwest","19 partidos"],"s5":["Atlantic coast","27 partidos"],"s6":["Southwest","22 partidos"],"s7":["Centre","8 partidos"],"s8":["La Plata","1 partidos"]}},
      clicked: {"t":"{@name} · {name}","x":{"06182":"Coronel Rosales · 6th section"}},
    },
    {
      key: "partidos",
      label: "Partidos",
      noun: ["partido","partidos"],
      prompt: "name",
      groups: [["1st section","West & north of the city",["06126","06252","06329","06364","06371","06408","06410","06412","06497","06515","06525","06532","06539","06560","06568","06574","06638","06749","06756","06760","06784","06805","06840","06861"]],["2nd section","North",["06077","06070","06140","06161","06175","06266","06623","06665","06686","06714","06728","06735","06763","06770","06882"]],["3rd section","South of the city",["06028","06035","06091","06098","06119","06134","06245","06260","06270","06274","06427","06434","06483","06490","06505","06648","06655","06658","06778"]],["4th section","Northwest",["06588","06021","06112","06147","06154","06210","06224","06277","06294","06351","06385","06392","06406","06413","06462","06469","06609","06679","06826"]],["5th section","Atlantic coast",["06042","06063","06168","06218","06238","06280","06301","06308","06315","06336","06343","06357","06420","06455","06466","06476","06511","06518","06547","06581","06630","06644","06672","06742","06791","06812","06868"]],["6th section","Southwest",["06007","06014","06056","06084","06189","06196","06182","06203","06231","06322","06399","06448","06553","06602","06616","06651","06700","06721","06819","06833","06847","06875"]],["7th section","Centre",["06854","06049","06105","06287","06595","06693","06707","06798"]],["Capital section","La Plata",["06441"]]],
      areas: "@id",
      name: {"t":"{@name}","x":{"06182":"Coronel Rosales"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"t":["{group}"],"x":{"06252":["Seat: Belén de Escobar","1st section"],"06840":["Seat: Caseros","1st section · Greater Buenos Aires"],"06861":["Seat: Olivos","1st section · Greater Buenos Aires"],"06266":["Seat: Capilla del Señor","2nd section"],"06763":["Seat: San Nicolás de los Arroyos","2nd section"],"06028":["Seat: Adrogué","3rd section · Greater Buenos Aires"],"06260":["Seat: Monte Grande","3rd section · Greater Buenos Aires"],"06427":["Seat: San Justo","3rd section · Greater Buenos Aires"],"06648":["Seat: Guernica","3rd section"],"06655":["Seat: Verónica","3rd section"],"06385":["Seat: Los Toldos","4th section"],"06406":["Seat: Henderson","4th section"],"06462":["Seat: Vedia","4th section"],"06679":["Seat: América","4th section"],"06280":["Seat: Miramar","5th section"],"06343":["Seat: Ranchos","5th section"],"06357":["Seat: Mar del Plata","5th section"],"06420":["Seat: Mar del Tuyú","5th section"],"06518":["Seat: Coronel Vidal","5th section"],"06812":["Seat: General Conesa","5th section"],"06007":["Seat: Carhué","6th section"],"06182":["Seat: Punta Alta","6th section"],"06602":["Seat: Carmen de Patagones","6th section"],"06700":["Seat: Pigüé","6th section"],"06875":["Seat: Médanos","6th section"],"06105":["Seat: San Carlos de Bolívar","7th section"],"06371":["1st section · Greater Buenos Aires"],"06408":["1st section · Greater Buenos Aires"],"06410":["1st section · Greater Buenos Aires"],"06412":["1st section · Greater Buenos Aires"],"06515":["1st section · Greater Buenos Aires"],"06539":["1st section · Greater Buenos Aires"],"06560":["1st section · Greater Buenos Aires"],"06568":["1st section · Greater Buenos Aires"],"06749":["1st section · Greater Buenos Aires"],"06756":["1st section · Greater Buenos Aires"],"06760":["1st section · Greater Buenos Aires"],"06805":["1st section · Greater Buenos Aires"],"06035":["3rd section · Greater Buenos Aires"],"06091":["3rd section · Greater Buenos Aires"],"06270":["3rd section · Greater Buenos Aires"],"06274":["3rd section · Greater Buenos Aires"],"06434":["3rd section · Greater Buenos Aires"],"06490":["3rd section · Greater Buenos Aires"],"06658":["3rd section · Greater Buenos Aires"]}},
      clicked: "{name}",
      presets: [["Greater Buenos Aires",["06028","06035","06091","06260","06270","06274","06371","06408","06410","06412","06427","06434","06490","06515","06539","06560","06568","06658","06749","06756","06760","06805","06840","06861"]]],
    },
  ],
  g: "{@sec}",
  explore: {"t":{"code":"{sections.short}","title":"{partidos.name}","sub":["{partidos.about0}"]},"x":{"06252":{"code":"1st","title":"Escobar","sub":["Seat: Belén de Escobar","1st section"]},"06427":{"code":"3rd","title":"La Matanza","sub":["Seat: San Justo","3rd section · Greater Buenos Aires"]},"06343":{"code":"5th","title":"General Paz","sub":["Seat: Ranchos","5th section"]},"06280":{"code":"5th","title":"General Alvarado","sub":["Seat: Miramar","5th section"]},"06357":{"code":"5th","title":"General Pueyrredón","sub":["Seat: Mar del Plata","5th section"]},"06518":{"code":"5th","title":"Mar Chiquita","sub":["Seat: Coronel Vidal","5th section"]},"06420":{"code":"5th","title":"La Costa","sub":["Seat: Mar del Tuyú","5th section"]},"06861":{"code":"1st","title":"Vicente López","sub":["Seat: Olivos","1st section · Greater Buenos Aires"]},"06655":{"code":"3rd","title":"Punta Indio","sub":["Seat: Verónica","3rd section"]},"06007":{"code":"6th","title":"Adolfo Alsina","sub":["Seat: Carhué","6th section"]},"06875":{"code":"6th","title":"Villarino","sub":["Seat: Médanos","6th section"]},"06028":{"code":"3rd","title":"Almirante Brown","sub":["Seat: Adrogué","3rd section · Greater Buenos Aires"]},"06648":{"code":"3rd","title":"Presidente Perón","sub":["Seat: Guernica","3rd section"]},"06260":{"code":"3rd","title":"Esteban Echeverría","sub":["Seat: Monte Grande","3rd section · Greater Buenos Aires"]},"06266":{"code":"2nd","title":"Exaltación de la Cruz","sub":["Seat: Capilla del Señor","2nd section"]},"06840":{"code":"1st","title":"Tres de Febrero","sub":["Seat: Caseros","1st section · Greater Buenos Aires"]},"06679":{"code":"4th","title":"Rivadavia","sub":["Seat: América","4th section"]},"06385":{"code":"4th","title":"General Viamonte","sub":["Seat: Los Toldos","4th section"]},"06105":{"code":"7th","title":"Bolívar","sub":["Seat: San Carlos de Bolívar","7th section"]},"06406":{"code":"4th","title":"Hipólito Yrigoyen","sub":["Seat: Henderson","4th section"]},"06700":{"code":"6th","title":"Saavedra","sub":["Seat: Pigüé","6th section"]},"06812":{"code":"5th","title":"Tordillo","sub":["Seat: General Conesa","5th section"]},"06763":{"code":"2nd","title":"San Nicolás","sub":["Seat: San Nicolás de los Arroyos","2nd section"]},"06462":{"code":"4th","title":"Leandro N. Alem","sub":["Seat: Vedia","4th section"]},"06602":{"code":"6th","title":"Patagones","sub":["Seat: Carmen de Patagones","6th section"]},"06182":{"code":"6th","title":"Coronel Rosales","sub":["Seat: Punta Alta","6th section"]}}},
};
