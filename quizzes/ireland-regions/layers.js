// Ireland Regions. Each map area is one of the 31 local authorities (city and county councils), grouped into the
// 26 counties and the 4 provinces. Names as on the map and the signs, in English; the Irish name is said with each.
// Dublin has four councils (Dublin City, Dún Laoghaire-Rathdown, Fingal, South Dublin), Cork and Galway a city and a
// county council each; Limerick and Waterford have one council for city and county since 2014.
//
// Sources: local authorities, counties, provinces and their Irish names: Tailte Éireann, Administrative Areas and
// Counties, National Statutory Boundaries 2019, generalised 20 m (CC BY 4.0); the councils' Irish names: their own.

const LAYERS = {
  key: "ieregions",
  borders: "[DATA.cty]",
  size: [1000,1414],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.25,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[51.3,-10.8],[55.5,-5.8]],"maxBounds":[[47,-19],[60,3]]},
  hintLabel: "Color by county",
  exploreKind: "counties",
  kinds: [
    {
      key: "provinces",
      label: "Provinces",
      noun: ["province","provinces"],
      prompt: "name",
      hints: false,
      areaRank: false,
      groups: [["Provinces","",["Leinster","Munster","Connacht","Ulster"]]],
      areas: "@prov",
      name: "{id}",
      short: "{id}",
      chip: "{id}",
      chipTitle: {"x":{"Leinster":"Laighin","Munster":"An Mhumhain","Connacht":"Connachta","Ulster":"Ulaidh"}},
      about: {"x":{"Leinster":["Laighin","12 counties"],"Munster":["An Mhumhain","6 counties"],"Connacht":["Connachta","5 counties"],"Ulster":["Ulaidh","3 counties"]}},
      clicked: "{p}",
    },
    {
      key: "counties",
      label: "Counties",
      noun: ["county","counties"],
      prompt: "name",
      hints: false,
      groups: [["Leinster","Laighin",["carlow","dublin","kildare","kilkenny","laois","longford","louth","meath","offaly","westmeath","wexford","wicklow"]],["Munster","An Mhumhain",["clare","cork","kerry","limerick","tipperary","waterford"]],["Connacht","Connachta",["galway","leitrim","mayo","roscommon","sligo"]],["Ulster","Ulaidh",["cavan","donegal","monaghan"]]],
      areas: "@cty",
      name: {"x":{"carlow":"Carlow","cavan":"Cavan","clare":"Clare","cork":"Cork","donegal":"Donegal","dublin":"Dublin","galway":"Galway","kerry":"Kerry","kildare":"Kildare","kilkenny":"Kilkenny","laois":"Laois","leitrim":"Leitrim","limerick":"Limerick","longford":"Longford","louth":"Louth","mayo":"Mayo","meath":"Meath","monaghan":"Monaghan","offaly":"Offaly","roscommon":"Roscommon","sligo":"Sligo","tipperary":"Tipperary","waterford":"Waterford","westmeath":"Westmeath","wexford":"Wexford","wicklow":"Wicklow"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"carlow":"Ceatharlach","cavan":"An Cabhán","clare":"An Clár","cork":"Corcaigh","donegal":"Dún na nGall","dublin":"Baile Átha Cliath","galway":"Gaillimh","kerry":"Ciarraí","kildare":"Cill Dara","kilkenny":"Cill Chainnigh","laois":"Laois","leitrim":"Liatroim","limerick":"Luimneach","longford":"An Longfort","louth":"Lú","mayo":"Maigh Eo","meath":"An Mhí","monaghan":"Muineachán","offaly":"Uíbh Fhailí","roscommon":"Ros Comáin","sligo":"Sligeach","tipperary":"Tiobraid Árann","waterford":"Port Láirge","westmeath":"An Iarmhí","wexford":"Loch Garman","wicklow":"Cill Mhantáin"}},
      about: {"x":{"carlow":["Ceatharlach","Leinster"],"cavan":["An Cabhán","Ulster"],"clare":["An Clár","Munster"],"cork":["Corcaigh","Munster","Cork City, Cork County"],"donegal":["Dún na nGall","Ulster"],"dublin":["Baile Átha Cliath","Leinster","Dublin City, Dún Laoghaire-Rathdown, Fingal, South Dublin"],"galway":["Gaillimh","Connacht","Galway City, Galway County"],"kerry":["Ciarraí","Munster"],"kildare":["Cill Dara","Leinster"],"kilkenny":["Cill Chainnigh","Leinster"],"laois":["Laois","Leinster"],"leitrim":["Liatroim","Connacht"],"limerick":["Luimneach","Munster"],"longford":["An Longfort","Leinster"],"louth":["Lú","Leinster"],"mayo":["Maigh Eo","Connacht"],"meath":["An Mhí","Leinster"],"monaghan":["Muineachán","Ulster"],"offaly":["Uíbh Fhailí","Leinster"],"roscommon":["Ros Comáin","Connacht"],"sligo":["Sligeach","Connacht"],"tipperary":["Tiobraid Árann","Munster"],"waterford":["Port Láirge","Munster"],"westmeath":["An Iarmhí","Leinster"],"wexford":["Loch Garman","Leinster"],"wicklow":["Cill Mhantáin","Leinster"]}},
      clicked: "{name}",
    },
    {
      key: "councils",
      label: "Local authorities",
      noun: ["local authority","local authorities"],
      prompt: "name",
      groups: [["Leinster","",["carlow","dublin-city","dun-laoghaire-rathdown","fingal","kildare","kilkenny","laois","longford","louth","meath","offaly","south-dublin","westmeath","wexford","wicklow"]],["Munster","",["clare","cork-city","cork-county","kerry","limerick","tipperary","waterford"]],["Connacht","",["galway-city","galway-county","leitrim","mayo","roscommon","sligo"]],["Ulster","",["cavan","donegal","monaghan"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: "{@ga}",
      about: {"t":["{@ga}","{group}"],"x":{"dublin-city":["Baile Átha Cliath","County Dublin · Leinster"],"cork-city":["Cathair Chorcaí","County Cork · Munster"],"galway-city":["Cathair na Gaillimhe","County Galway · Connacht"],"south-dublin":["Áth Cliath Theas","County Dublin · Leinster"],"fingal":["Fine Gall","County Dublin · Leinster"],"dun-laoghaire-rathdown":["Dún Laoghaire-Ráth an Dúin","County Dublin · Leinster"],"galway-county":["Contae na Gaillimhe","County Galway · Connacht"],"cork-county":["Contae Chorcaí","County Cork · Munster"]}},
      clicked: "{name}",
    },
  ],
  g: "{@cty}",
  explore: {"t":{"code":"{counties.name}","title":"{councils.name}","sub":["{@ga}","{@prov}"]}},
};
