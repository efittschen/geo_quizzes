// Spain Province ISO Codes, using the map areas of ../spain-regions/data.js (the communities' codes are ../spain-iso).
// ISO 3166-2:ES gives each of the 50 provinces one or two letters after "ES-" (ES-A Alicante, ES-AB Albacete …
// ES-ZA Zamora): the letters of the old number plates' provinces, with a few of their own (GI Girona, OR Ourense,
// PM Illes Balears, from Palma de Mallorca). A question shows the letters without the "ES-", and you click the
// province. Ceuta and Melilla are autonomous cities, not provinces: their codes (CE, ML) are in the communities'
// quiz, and here they are on the map without a question. Province names and groups as in ../spain-regions/layers.js.

const LAYERS = {
  key: "esisoprov",
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
      label: "Codes",
      noun: ["code","codes"],
      prompt: "dial",
      groups: [["Galicia","",["C","LU","OR","PO"]],["Asturias","",["O"]],["Cantabria","",["S"]],["País Vasco","",["VI","SS","BI"]],["Navarra","",["NA"]],["La Rioja","",["LO"]],["Aragón","",["HU","TE","Z"]],["Cataluña","",["B","GI","L","T"]],["Castilla y León","",["AV","BU","LE","P","SA","SG","SO","VA","ZA"]],["Madrid","",["M"]],["Castilla-La Mancha","",["AB","CR","CU","GU","TO"]],["Extremadura","",["BA","CC"]],["Comunidad Valenciana","",["A","CS","V"]],["Murcia","",["MU"]],["Andalucía","",["AL","CA","CO","GR","H","J","MA","SE"]],["Islas Baleares","",["PM"]],["Canarias","",["GC","TF"]]],
      areas: {"x":{"VI":["p01"],"AB":["p02"],"A":["p03","p03es"],"AL":["p04"],"AV":["p05"],"BA":["p06"],"PM":["ima","ime","ifo","iei"],"B":["p08"],"BU":["p09"],"CC":["p10"],"CA":["p11"],"CS":["p12","p12es"],"CR":["p13"],"CO":["p14"],"C":["p15"],"CU":["p16"],"GI":["p17"],"GR":["p18"],"GU":["p19"],"SS":["p20"],"H":["p21"],"HU":["p22"],"J":["p23"],"LE":["p24"],"L":["p25","p25oc"],"LO":["p26"],"LU":["p27"],"M":["p28"],"MA":["p29"],"MU":["p30"],"NA":["p31","p31eu"],"OR":["p32"],"O":["p33"],"P":["p34"],"GC":["igc","ifv","ilz"],"PO":["p36"],"SA":["p37"],"TF":["itf","ilp","ihi","igo"],"S":["p39"],"SG":["p40"],"SE":["p41"],"SO":["p42"],"T":["p43"],"TE":["p44"],"TO":["p45"],"V":["p46","p46es"],"VA":["p47"],"BI":["p48"],"ZA":["p49"],"Z":["p50"]}},
      name: "{id}",
      short: "{id}",
      chip: "{id}",
      chipTitle: {"x":{"VI":"Álava","AB":"Albacete","A":"Alicante","AL":"Almería","AV":"Ávila","BA":"Badajoz","PM":"Islas Baleares","B":"Barcelona","BU":"Burgos","CC":"Cáceres","CA":"Cádiz","CS":"Castellón","CR":"Ciudad Real","CO":"Córdoba","C":"A Coruña","CU":"Cuenca","GI":"Girona","GR":"Granada","GU":"Guadalajara","SS":"Gipuzkoa","H":"Huelva","HU":"Huesca","J":"Jaén","LE":"León","L":"Lleida","LO":"La Rioja","LU":"Lugo","M":"Madrid","MA":"Málaga","MU":"Murcia","NA":"Navarra","OR":"Ourense","O":"Asturias","P":"Palencia","GC":"Las Palmas","PO":"Pontevedra","SA":"Salamanca","TF":"Santa Cruz de Tenerife","S":"Cantabria","SG":"Segovia","SE":"Sevilla","SO":"Soria","T":"Tarragona","TE":"Teruel","TO":"Toledo","V":"Valencia","VA":"Valladolid","BI":"Bizkaia","ZA":"Zamora","Z":"Zaragoza"}},
      detail: ["Show community","{group}"],
      about: {"t":["{chipTitle}","{group}"]},
      clicked: {"t":"{name} ({chipTitle})","x":{"p51":"Ceuta (no province code)","p52":"Melilla (no province code)"}},
    },
  ],
  g: "{@ccaa}",
  explore: {"t":{"code":"{iso.name}","title":"{iso.chipTitle}","sub":"{iso.about1}"},"x":{"p51":{"code":"CE","title":"Ceuta","sub":"Autonomous city, no province"},"p52":{"code":"ML","title":"Melilla","sub":"Autonomous city, no province"}}},
};
