// Chile Area Codes, on the province areas of ../chile-regions/data.js.
// The 24 codes and their main cities are the ITU list (SUBTEL communication of 2.VII.2014). Since 2014 Chile is one
// dialling zone (Ley 20.704): the codes are no longer dialled as such, but every landline number still starts with
// its old code (+56 32 2xx xxxx). Which provinces each code covered follows es.wikipedia "Anexo:Prefijos telefónicos
// de Chile" (Marga Marga and Ranco split by commune), checked against municipal landline numbers (Limache and Olmué
// 33, Villa Alemana 32, La Unión and Río Bueno 64, Futrono 63, Vallenar 51, Juan Fernández and Isla de Pascua 32).

const LAYERS = {
  key: "clcodes",
  size: [700,2242],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.4,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[-56,-76],[-17.4,-66.3]],"maxBounds":[[-60,-115],[-12,-60]]},
  hintLabel: "Color by code",
  exploreKind: "codes",
  kinds: [
    {
      key: "codes",
      label: "Area codes",
      noun: ["code","codes"],
      prompt: "dial",
      groups: [["2","Metropolitana",["2"]],["3x","Valparaíso",["32","33","34","35"]],["4x","Ñuble, Biobío, Araucanía",["41","42","43","45"]],["5x","Arica y Parinacota to Coquimbo",["51","52","53","55","57","58"]],["6x","Los Ríos to Magallanes",["61","63","64","65","67"]],["7x","O'Higgins, Maule",["71","72","73","75"]]],
      areas: "@code",
      name: "{id}",
      short: "{id}",
      chip: "{id}",
      chipTitle: {"x":{"2":"Santiago","32":"Valparaíso, Viña del Mar","33":"Quillota","34":"Los Andes","35":"San Antonio","41":"Concepción, Talcahuano","42":"Chillán","43":"Los Ángeles","45":"Temuco","51":"La Serena","52":"Copiapó","53":"Ovalle","55":"Antofagasta","57":"Iquique","58":"Arica","61":"Punta Arenas","63":"Valdivia","64":"Osorno","65":"Puerto Montt","67":"Coyhaique","71":"Talca","72":"Rancagua","73":"Linares","75":"Curicó"}},
      detail: ["Show region",{"t":"{@regionName}","x":{"51":"Atacama, Coquimbo","64":"Los Lagos, Los Ríos"}}],
      about: {"x":{"2":["Santiago","Santiago, Cordillera, Chacabuco, Maipo, Melipilla, Talagante"],"32":["Valparaíso, Viña del Mar","Valparaíso, Juan Fernández, Isla de Pascua, Marga Marga (Quilpué, Villa Alemana)"],"33":["Quillota","Petorca, Quillota, Marga Marga (Limache, Olmué)"],"34":["Los Andes","Los Andes, San Felipe"],"35":["San Antonio","San Antonio"],"41":["Concepción, Talcahuano","Concepción, Arauco"],"42":["Chillán","Diguillín, Itata, Punilla"],"43":["Los Ángeles","Biobío"],"45":["Temuco","Cautín, Malleco"],"51":["La Serena","Huasco, Elqui"],"52":["Copiapó","Copiapó, Chañaral"],"53":["Ovalle","Choapa, Limarí"],"55":["Antofagasta","Antofagasta, El Loa, Tocopilla"],"57":["Iquique","Iquique, Tamarugal"],"58":["Arica","Arica, Parinacota"],"61":["Punta Arenas","Magallanes, Antártica Chilena, Tierra del Fuego, Última Esperanza"],"63":["Valdivia","Valdivia, Ranco (Futrono, Lago Ranco)"],"64":["Osorno","Osorno, Ranco (La Unión, Río Bueno)"],"65":["Puerto Montt","Llanquihue, Chiloé, Palena"],"67":["Coyhaique","Coyhaique, Aysén, Capitán Prat, General Carrera"],"71":["Talca","Talca"],"72":["Rancagua","Cachapoal, Cardenal Caro, Colchagua"],"73":["Linares","Cauquenes, Linares"],"75":["Curicó","Curicó"]}},
      clicked: "{p}, {chipTitle}",
      presets: [["Big cities",["2","55","32","65","58","45","41","72","57"]]],
    },
    {
      key: "digit1",
      label: "First digit",
      noun: ["zone","zones"],
      prompt: "dial",
      hints: false,
      groups: [["Zones","area codes by first digit",["2","3","4","5","6","7"]]],
      areas: {"x":{"2":["CL131","CL132","CL133","CL134","CL135","CL136"],"3":["CL051","JF","CL052","CL058a","CL054","CL055","CL058b","CL053","CL057","CL056"],"4":["CL081","CL082","CL161","CL162","CL163","CL083","CL091","CL092"],"5":["CL033","CL041","CL031","CL032","CL042","CL043","CL021","CL022","CL023","CL011","CL014","CL151","CL152"],"6":["CL121","CL122","CL123","CL124","CL141","CL142a","CL103","CL142b","CL101","CL102","CL104","CL111","CL112","CL113","CL114"],"7":["CL071","CL061","CL062","CL063","CL072","CL074","CL073"]}},
      name: {"t":"{id}x","x":{"2":"2"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"2":"Metropolitana","3":"Valparaíso","4":"Ñuble, Biobío, Araucanía","5":"Arica y Parinacota to Coquimbo","6":"Los Ríos to Magallanes","7":"O'Higgins, Maule"}},
      about: {"x":{"2":["Metropolitana","2 Santiago"],"3":["Valparaíso","32 Valparaíso, 33 Quillota, 34 Los Andes, 35 San Antonio"],"4":["Ñuble, Biobío, Araucanía","41 Concepción, 42 Chillán, 43 Los Ángeles, 45 Temuco"],"5":["Arica y Parinacota to Coquimbo","51 La Serena, 52 Copiapó, 53 Ovalle, 55 Antofagasta, 57 Iquique, 58 Arica"],"6":["Los Ríos to Magallanes","61 Punta Arenas, 63 Valdivia, 64 Osorno, 65 Puerto Montt, 67 Coyhaique"],"7":["O'Higgins, Maule","71 Talca, 72 Rancagua, 73 Linares, 75 Curicó"]}},
      dial: {"t":[["{id}","hot"],["x","cold"]],"x":{"2":[["2","hot"]]}},
      clicked: "{name} ({chipTitle})",
    },
  ],
  g: "{@code}",
  explore: {"t":{"code":"{@code}","title":"{@name}","sub":["{@regionName} region","{codes.about0}"]}},
};
