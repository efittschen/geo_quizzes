// Ecuador Area Codes, using the province areas from ../ecuador-regions/data.js.
// Landline numbers are (0X) XXX-XXXX with a one-digit area code 2–7, each covering whole provinces (ARCOTEL, Plan
// Técnico Fundamental de Numeración, fixed-line series report, June 2026). Morona Santiago is 07 (2 of its 40 number
// blocks are under 03).

const LAYERS = {
  key: "eccodes",
  size: [1000,682],
  pad: 16,
  maxZoom: 30,
  labelScale: 0.3,
  fly: {"pad":1.6,"min":0.05},
  street: {"bounds":[[-5.1,-81.2],[1.5,-75.1]],"maxBounds":[[-9,-95],[5,-70]]},
  hintLabel: "Color by region",
  exploreKind: "codes",
  kinds: [
    {
      key: "codes",
      label: "Area codes",
      noun: ["area code","area codes"],
      prompt: "dial",
      groups: [["Area codes","",["2","3","4","5","6","7"]]],
      areas: {"x":{"2":["p17","p23"],"3":["p02","p06","p05","p16","p18"],"4":["p09","p24"],"5":["p20","p12","p13"],"6":["p04","p08","p10","p15","p22","p21"],"7":["p01","p03","p07","p11","p14","p19"]}},
      name: "0{@phone}",
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"2":"Pichincha, Santo Domingo","3":"Bolívar, Chimborazo, Cotopaxi, Pastaza, Tungurahua","4":"Guayas, Santa Elena","5":"Galápagos, Los Ríos, Manabí","6":"Carchi, Esmeraldas, Imbabura, Napo, Orellana, Sucumbíos","7":"Azuay, Cañar, El Oro, Loja, Morona Santiago, Zamora Chinchipe"}},
      about: "{chipTitle}",
      clicked: {"t":"{name} ({@name})","x":{"p23":"02 (Santo Domingo)"}},
    },
  ],
  g: "{@region}",
  explore: {"x":{"p10":{"code":"06","title":"Imbabura","sub":["Sierra"]},"p11":{"code":"07","title":"Loja","sub":["Sierra"]},"p12":{"code":"05","title":"Los Ríos","sub":["Costa"]},"p13":{"code":"05","title":"Manabí","sub":["Costa"]},"p14":{"code":"07","title":"Morona Santiago","sub":["Amazonía"]},"p15":{"code":"06","title":"Napo","sub":["Amazonía"]},"p16":{"code":"03","title":"Pastaza","sub":["Amazonía"]},"p17":{"code":"02","title":"Pichincha","sub":["Sierra"]},"p18":{"code":"03","title":"Tungurahua","sub":["Sierra"]},"p19":{"code":"07","title":"Zamora Chinchipe","sub":["Amazonía"]},"p20":{"code":"05","title":"Galápagos","sub":["Galápagos"]},"p21":{"code":"06","title":"Sucumbíos","sub":["Amazonía"]},"p22":{"code":"06","title":"Orellana","sub":["Amazonía"]},"p23":{"code":"02","title":"Santo Domingo de los Tsáchilas","sub":["Costa"]},"p24":{"code":"04","title":"Santa Elena","sub":["Costa"]},"p01":{"code":"07","title":"Azuay","sub":["Sierra"]},"p02":{"code":"03","title":"Bolívar","sub":["Sierra"]},"p03":{"code":"07","title":"Cañar","sub":["Sierra"]},"p04":{"code":"06","title":"Carchi","sub":["Sierra"]},"p05":{"code":"03","title":"Cotopaxi","sub":["Sierra"]},"p06":{"code":"03","title":"Chimborazo","sub":["Sierra"]},"p07":{"code":"07","title":"El Oro","sub":["Costa"]},"p08":{"code":"06","title":"Esmeraldas","sub":["Costa"]},"p09":{"code":"04","title":"Guayas","sub":["Costa"]}}},
};
