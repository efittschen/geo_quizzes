// Spain ISO Codes, using the map areas of ../spain-regions/data.js (their field ccaa is the community's code).
// ISO 3166-2:ES gives each of the 17 autonomous communities and the 2 autonomous cities a two-letter code after
// "ES-" (ES-AN Andalucía … ES-VC Comunitat Valenciana, ES-CE Ceuta, ES-ML Melilla). A question shows the two
// letters without the "ES-", and you click the community. Names as in ../spain-regions/layers.js.

const LAYERS = {
  key: "esiso",
  size: [1000,848],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.25,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[27.6,-18.2],[43.8,4.4]],"maxBounds":[[22,-25],[48,10]]},
  hintLabel: "Color by community",
  exploreKind: "iso",
  d: {"p51":"M598.5,425.4a7,7 0 1,0 14,0a7,7 0 1,0 -14,0z","p52":"M704.3,454.9a7,7 0 1,0 14,0a7,7 0 1,0 -14,0z"},
  top: ["p51","p52"],
  kinds: [
    {
      key: "iso",
      label: "ISO codes",
      noun: ["code","codes"],
      prompt: "dial",
      groups: [["North","",["GA","AS","CB","PV","NC","RI","AR","CT","CL"]],["Centre and south","",["MD","CM","EX","VC","MC","AN"]],["Islands and cities","",["IB","CN","CE","ML"]]],
      areas: "@ccaa",
      name: "{id}",
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"GA":"Galicia","AS":"Asturias","CB":"Cantabria","PV":"País Vasco","NC":"Navarra","RI":"La Rioja","AR":"Aragón","CT":"Cataluña","CL":"Castilla y León","MD":"Madrid","CM":"Castilla-La Mancha","EX":"Extremadura","VC":"Comunidad Valenciana","MC":"Murcia","AN":"Andalucía","IB":"Islas Baleares","CN":"Canarias","CE":"Ceuta","ML":"Melilla"}},
      about: {"x":{"GA":["Galicia","A Coruña, Lugo, Ourense, Pontevedra"],"AS":["Principado de Asturias","Asturias"],"CB":["Cantabria","Cantabria"],"PV":["Euskadi / País Vasco","Álava, Gipuzkoa, Bizkaia"],"NC":["Navarra / Nafarroa","Navarra"],"RI":["La Rioja","La Rioja"],"AR":["Aragon","Huesca, Teruel, Zaragoza"],"CT":["Catalunya / Cataluña","Barcelona, Girona, Lleida, Tarragona"],"CL":["Castile and León","Ávila, Burgos, León, Palencia, Salamanca, Segovia, Soria, Valladolid, Zamora"],"MD":["Comunidad de Madrid","Madrid"],"CM":["Castilla-La Mancha","Albacete, Ciudad Real, Cuenca, Guadalajara, Toledo"],"EX":["Extremadura","Badajoz, Cáceres"],"VC":["Comunitat Valenciana","Alicante, Castellón, Valencia"],"MC":["Región de Murcia","Murcia"],"AN":["Andalusia","Almería, Cádiz, Córdoba, Granada, Huelva, Jaén, Málaga, Sevilla"],"IB":["Illes Balears","Islas Baleares"],"CN":["Canary Islands","Las Palmas, Santa Cruz de Tenerife"],"CE":["Ceuta","Ceuta"],"ML":["Melilla","Melilla"]}},
      clicked: "{name} ({chipTitle})",
    },
  ],
  g: "{@ccaa}",
  explore: {"t":{"code":"{iso.name}","title":"{iso.chipTitle}","sub":"{iso.about1}"}},
};
