// Nigeria Regions. One map of the 36 states and the Federal Capital Territory
// (geoBoundaries gbOpen NGA ADM1, GRID3 2022, CC BY 4.0) with three levels: the six geopolitical zones, the states,
// and the main language areas (Hausa, Yoruba, Igbo) as groups of whole states.
//
// Zones: Wikipedia "Geopolitical zones of Nigeria". Capitals: Wikidata P36 (CC0).
// Language areas, by state (approximate: real language borders cross state lines):
//   Yoruba: main group in Ekiti, Ogun, Ondo, Osun, Kwara, Oyo and Lagos (Wikipedia "Yoruba people"; also the western
//           third of Kogi, left out here);
//   Igbo:   Abia, Anambra, Ebonyi, Enugu and Imo (Wikipedia "Igbo people"; also parts of Delta and Rivers, left out);
//   Hausa:  dominant throughout the north, though not in Kwara, Kogi and Benue (Wikipedia "Hausa language");
//   other:  the South South states, Kogi and Benue.

const LAYERS = {
  key: "ngregions",
  size: [1000,816],
  pad: 16,
  maxZoom: 30,
  labelScale: 0.24,
  fly: {"pad":1.6,"min":0.05},
  street: {"bounds":[[4.2,2.6],[13.9,14.7]],"maxBounds":[[0,-3],[18,20]]},
  hintLabel: "Color by zone",
  exploreKind: "states",
  kinds: [
    {
      key: "zones",
      label: "Zones",
      groupsOnly: true,
      noun: ["zone","zones"],
      prompt: "name",
      groups: [["North","",["NW","NE","NC"]],["South","",["SW","SE","SS"]]],
      areas: {"x":{"NW":["JI","KD","KN","KT","KE","SO","ZA"],"NE":["AD","BA","BO","GO","TA","YO"],"NC":["BE","FC","KO","KW","NA","NI","PL"],"SW":["EK","LA","OG","ON","OS","OY"],"SE":["AB","AN","EB","EN","IM"],"SS":["AK","BY","CR","DE","ED","RI"]}},
      name: {"x":{"NW":"North West","NE":"North East","NC":"North Central","SW":"South West","SE":"South East","SS":"South South"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"NW":"Jigawa, Kaduna, Kano, Katsina, Kebbi, Sokoto, Zamfara","NE":"Adamawa, Bauchi, Borno, Gombe, Taraba, Yobe","NC":"Benue, FCT, Kogi, Kwara, Nasarawa, Niger, Plateau","SW":"Ekiti, Lagos, Ogun, Ondo, Osun, Oyo","SE":"Abia, Anambra, Ebonyi, Enugu, Imo","SS":"Akwa Ibom, Bayelsa, Cross River, Delta, Edo, Rivers"}},
      about: "{chipTitle}",
      clicked: {"t":"{name} · {@name}","x":{"FC":"North Central · FCT"}},
    },
    {
      key: "states",
      label: "States",
      noun: ["state","states"],
      prompt: "name",
      groups: [["North West","",["JI","KD","KN","KT","KE","SO","ZA"]],["North East","",["AD","BA","BO","GO","TA","YO"]],["North Central","",["BE","FC","KO","KW","NA","NI","PL"]],["South West","",["EK","LA","OG","ON","OS","OY"]],["South East","",["AB","AN","EB","EN","IM"]],["South South","",["AK","BY","CR","DE","ED","RI"]]],
      areas: "@id",
      name: {"t":"{@name} State","x":{"FC":"Federal Capital Territory"}},
      short: {"t":"{@name}","x":{"FC":"FCT"}},
      chip: "{short}",
      chipTitle: {"x":{"JI":"Capital: Dutse","KD":"Capital: Kaduna","KN":"Capital: Kano","KT":"Capital: Katsina","KE":"Capital: Birnin Kebbi","SO":"Capital: Sokoto","ZA":"Capital: Gusau","AD":"Capital: Yola","BA":"Capital: Bauchi","BO":"Capital: Maiduguri","GO":"Capital: Gombe","TA":"Capital: Jalingo","YO":"Capital: Damaturu","BE":"Capital: Makurdi","FC":"Capital: Abuja","KO":"Capital: Lokoja","KW":"Capital: Ilorin","NA":"Capital: Lafia","NI":"Capital: Minna","PL":"Capital: Jos","EK":"Capital: Ado Ekiti","LA":"Capital: Ikeja","OG":"Capital: Abeokuta","ON":"Capital: Akure","OS":"Capital: Osogbo","OY":"Capital: Ibadan","AB":"Capital: Umuahia","AN":"Capital: Awka","EB":"Capital: Abakaliki","EN":"Capital: Enugu","IM":"Capital: Owerri","AK":"Capital: Uyo","BY":"Capital: Yenagoa","CR":"Capital: Calabar","DE":"Capital: Asaba","ED":"Capital: Benin City","RI":"Capital: Port Harcourt"}},
      about: {"t":["{group}","{chipTitle}"]},
      clicked: "{name}",
      rankings: [["name",["AB","AD","AK","AN","BA","BY","BE","BO","CR","DE","EB","ED","EK","EN","FC","GO","IM","JI","KD","KN","KT","KE","KO","KW","LA","NA","NI","OG","ON","OS","OY","PL","RI","SO","TA","YO","ZA"]]],
    },
    {
      key: "langs",
      label: "Languages",
      noun: ["language area","language areas"],
      prompt: "name",
      groups: [["Language areas","",["ha","yo","ig","xx"]]],
      areas: {"x":{"ha":["AD","BA","BO","FC","GO","JI","KD","KN","KT","KE","NA","NI","PL","SO","TA","YO","ZA"],"yo":["EK","KW","LA","OG","ON","OS","OY"],"ig":["AB","AN","EB","EN","IM"],"xx":["AK","BY","BE","CR","DE","ED","KO","RI"]}},
      name: {"x":{"ha":"Hausa","yo":"Yoruba","ig":"Igbo","xx":"Other languages"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"ha":"Adamawa, Bauchi, Borno, FCT, Gombe, Jigawa, Kaduna, Kano, Katsina, Kebbi, Nasarawa, Niger, Plateau, Sokoto, Taraba, Yobe, Zamfara","yo":"Ekiti, Kwara, Lagos, Ogun, Ondo, Osun, Oyo","ig":"Abia, Anambra, Ebonyi, Enugu, Imo","xx":"Akwa Ibom, Bayelsa, Benue, Cross River, Delta, Edo, Kogi, Rivers"}},
      about: "{chipTitle}",
      clicked: {"t":"{name} · {@name}","x":{"FC":"Hausa · FCT"}},
    },
  ],
  g: "{@zone}",
  explore: {"t":{"code":"{a}","title":"{states.name}","sub":["{zones.name}","{states.about1}","{langs.name}"]}},
};
