// Namibia Area Codes, on the map pieces of ../namibia-regions/data.js.
// The landline codes 061–067 are legacy: since CRAN's numbering plan of 2016 (GN 97/2016) the 06x ranges serve
// existing lines only and new fixed lines get 086 numbers, but the old codes are still on most landline numbers.
// No official map of the code areas exists. The areas here are approximate: the places of Telecom Namibia's trunk
// dialling code list (directory 2026) were located with GeoNames (185 of 225; ambiguous names left out); each
// constituency (COD-AB 2011) takes the codes of the listed places inside it, split between them by nearest place
// (Voronoi), and a constituency without a listed place takes the code of the nearest places; Etosha National Park
// (OSM) is treated apart, so it takes the code of its camps (067). Pieces under 300 km² join their neighbour.

const LAYERS = {
  key: "namcodes",
  size: [1000,924],
  pad: 16,
  maxZoom: 30,
  labelScale: 0.3,
  fly: {"pad":1.6,"min":0.05},
  street: {"bounds":[[-29,11.7],[-16.9,25.3]],"maxBounds":[[-35,5],[-10,32]]},
  hintLabel: "Color each code",
  exploreKind: "codes",
  kinds: [
    {
      key: "codes",
      label: "Area codes",
      noun: ["code","codes"],
      prompt: "dial",
      groups: [["North","",["065","066","067"]],["Centre & south","",["061","062","063","064"]]],
      areas: "@code",
      name: "{id}",
      short: "{id}",
      chip: "{id}",
      chipTitle: {"x":{"065":"Oshakati, Ondangwa, Opuwo","066":"Rundu, Katima Mulilo, Nkurenkuru","067":"Otjiwarongo, Tsumeb, Grootfontein","061":"Windhoek","062":"Rehoboth, Okahandja, Gobabis","063":"Keetmanshoop, Mariental, Lüderitz","064":"Walvis Bay, Swakopmund, Henties Bay"}},
      detail: ["Show towns","{chipTitle}"],
      about: {"x":{"065":["Oshakati, Ondangwa, Opuwo","Kunene, Ohangwena, Omusati, Oshana, Oshikoto"],"066":["Rundu, Katima Mulilo, Nkurenkuru","Zambezi, Kavango East, Kavango West"],"067":["Otjiwarongo, Tsumeb, Grootfontein","Kunene, Omaheke, Omusati, Oshana, Oshikoto, Otjozondjupa"],"061":["Windhoek","Khomas"],"062":["Rehoboth, Okahandja, Gobabis","Hardap, Khomas, Omaheke, Otjozondjupa"],"063":["Keetmanshoop, Mariental, Lüderitz","Hardap, ǁKharas, Khomas, Omaheke"],"064":["Walvis Bay, Swakopmund, Henties Bay","Erongo, Kunene"]}},
      clicked: "{p} · {chipTitle}",
      presets: [["Big cities",["061","066","064","065","062","067"]]],
    },
  ],
  g: "{@code}",
  explore: {"t":{"code":"{@code}","title":"{codes.detail}","sub":"{@region}"},"x":{"ka63s0":{"code":"063","title":"Keetmanshoop, Mariental, Lüderitz","sub":"ǁKharas"}}},
};
