// Lithuania Regions. Each map area is one of the 60 savivaldybės (municipalities, since 2000), grouped into the 10
// apskritys (counties). Names as in Lithuanian, the municipalities in their short official form (Kauno r. sav.: Kauno
// rajono savivaldybė); the English name is said with each.
//
// Sources: savivaldybės, apskritys and their borders: OpenStreetMap (boundary=administrative, admin_level 5 and 4;
// ODbL), October 2026, cut to the OSM land polygons (osmdata.openstreetmap.de, ODbL); English names: Wikidata (CC0).

const LAYERS = {
  key: "ltregions",
  borders: "[DATA.rb]",
  size: [1000,764],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.22,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[53.7,20.8],[56.6,27]],"maxBounds":[[49,12],[61,35]]},
  hintLabel: "Color by apskritis",
  exploreKind: "apskritys",
  kinds: [
    {
      key: "apskritys",
      label: "Apskritys",
      noun: ["apskritis","apskritys"],
      prompt: "name",
      hints: false,
      areaRank: false,
      groups: [["Apskritys","",["AL","KU","KL","MR","PN","SA","TA","TE","UT","VL"]]],
      areas: "@ap",
      name: {"x":{"AL":"Alytaus apskritis","KU":"Kauno apskritis","KL":"Klaipėdos apskritis","MR":"Marijampolės apskritis","PN":"Panevėžio apskritis","SA":"Šiaulių apskritis","TA":"Tauragės apskritis","TE":"Telšių apskritis","UT":"Utenos apskritis","VL":"Vilniaus apskritis"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"AL":"Alytus County","KU":"Kaunas County","KL":"Klaipėda County","MR":"Marijampolė County","PN":"Panevėžys County","SA":"Šiauliai County","TA":"Tauragė County","TE":"Telšiai County","UT":"Utena County","VL":"Vilnius County"}},
      about: {"x":{"AL":["Alytus County","5 savivaldybės"],"KU":["Kaunas County","8 savivaldybės"],"KL":["Klaipėda County","7 savivaldybės"],"MR":["Marijampolė County","5 savivaldybės"],"PN":["Panevėžys County","6 savivaldybės"],"SA":["Šiauliai County","7 savivaldybės"],"TA":["Tauragė County","4 savivaldybės"],"TE":["Telšiai County","4 savivaldybės"],"UT":["Utena County","6 savivaldybės"],"VL":["Vilnius County","8 savivaldybės"]}},
      clicked: "{name}",
    },
    {
      key: "savivaldybes",
      label: "Savivaldybės",
      noun: ["savivaldybė","savivaldybės"],
      prompt: "name",
      groups: [["Alytaus apskritis","Alytus County",["02","03","07","24","55"]],["Kauno apskritis","Kaunas County",["05","10","13","15","16","18","36","38"]],["Klaipėdos apskritis","Klaipėda County",["20","21","22","28","31","48","46"]],["Marijampolės apskritis","Marijampolė County",["14","17","25","41","56"]],["Panevėžio apskritis","Panevėžys County",["06","23","32","33","34","40"]],["Šiaulių apskritis","Šiauliai County",["01","11","19","30","37","43","44"]],["Tauragės apskritis","Tauragė County",["12","29","45","50"]],["Telšių apskritis","Telšiai County",["26","35","39","51"]],["Utenos apskritis","Utena County",["04","09","27","54","59","60"]],["Vilniaus apskritis","Vilnius County",["08","42","47","49","52","53","57","58"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: "{@full}",
      about: {"t":["{@en}","{@full}","{group}"]},
      clicked: "{name}",
    },
  ],
  g: "{@ap}",
  explore: {"t":{"code":"{savivaldybes.name}","title":"{apskritys.name}","sub":["{@en}"]}},
};
