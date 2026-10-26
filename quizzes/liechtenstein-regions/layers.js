// Liechtenstein Regions: the 11 Gemeinden, with their exclaves (Vaduz, Schaan, Planken, Triesenberg and Balzers own
// pieces of land inside others and up in the mountains), each with its postcodes (9485 … 9498: Eschen also 9485 for
// Nendeln, Mauren 9486 for Schaanwald). The 2 Wahlkreise (Oberland, Unterland) only group them.
// Sources: the Gemeinden (admin_level 8, ISO 3166-2 LI-01…LI-11) and the Wahlkreise (admin_level 6): OpenStreetMap (© OpenStreetMap contributors, ODbL), October 2026. Postcodes:
// GeoNames postal codes (CC BY 4.0).

const LAYERS = {
  key: "liregions",
  size: [1000,1990],
  pad: 16,
  maxZoom: 12,
  labelScale: 0.3,
  fly: {"pad":1.6,"min":0.1},
  street: {"bounds":[[47.04,9.47],[47.28,9.64]],"maxBounds":[[46,7],[49,12]]},
  hintLabel: "Color by Gemeinde",
  exploreKind: "units",
  kinds: [
    {
      key: "wahlkreise",
      label: "Wahlkreise",
      groupsOnly: true,
      noun: ["Wahlkreis","Wahlkreise"],
      prompt: "name",
      hints: false,
      groups: [["Wahlkreise","",["Oberland","Unterland"]]],
      areas: "@wk",
      name: "{id}",
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"Oberland":"Balzers, Planken, Schaan, Triesen, Triesenberg, Vaduz","Unterland":"Eschen, Gamprin, Mauren, Ruggell, Schellenberg"}},
      about: "{chipTitle}",
      clicked: "{name}",
    },
    {
      key: "units",
      label: "Gemeinden",
      noun: ["Gemeinde","Gemeinden"],
      prompt: "name",
      groups: [["Oberland","Wahlkreis",["01","05","07","09","10","11"]],["Unterland","Wahlkreis",["02","03","04","06","08"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"10":"Oberland · 9497","11":"Oberland · 9490","01":"Oberland · 9496","02":"Unterland · 9492, 9485 Nendeln","03":"Unterland · 9487 Gamprin-Bendern","04":"Unterland · 9493, 9486 Schaanwald","05":"Oberland · 9498","06":"Unterland · 9491","07":"Oberland · 9494","08":"Unterland · 9488","09":"Oberland · 9495"}},
      about: {"x":{"10":["Oberland","9497"],"11":["Oberland","9490"],"01":["Oberland","9496"],"02":["Unterland","9492, 9485 Nendeln"],"03":["Unterland","9487 Gamprin-Bendern"],"04":["Unterland","9493, 9486 Schaanwald"],"05":["Oberland","9498"],"06":["Unterland","9491"],"07":["Oberland","9494"],"08":["Unterland","9488"],"09":["Oberland","9495"]}},
      clicked: "{name}",
    },
  ],
  g: "{@id}",
  explore: {"x":{"10":{"code":"Triesenberg","title":"Liechtenstein","sub":["Oberland","9497"]},"11":{"code":"Vaduz","title":"Liechtenstein","sub":["Oberland","9490"]},"01":{"code":"Balzers","title":"Liechtenstein","sub":["Oberland","9496"]},"02":{"code":"Eschen","title":"Liechtenstein","sub":["Unterland","9492, 9485 Nendeln"]},"03":{"code":"Gamprin","title":"Liechtenstein","sub":["Unterland","9487 Gamprin-Bendern"]},"04":{"code":"Mauren","title":"Liechtenstein","sub":["Unterland","9493, 9486 Schaanwald"]},"05":{"code":"Planken","title":"Liechtenstein","sub":["Oberland","9498"]},"06":{"code":"Ruggell","title":"Liechtenstein","sub":["Unterland","9491"]},"07":{"code":"Schaan","title":"Liechtenstein","sub":["Oberland","9494"]},"08":{"code":"Schellenberg","title":"Liechtenstein","sub":["Unterland","9488"]},"09":{"code":"Triesen","title":"Liechtenstein","sub":["Oberland","9495"]}}},
};
