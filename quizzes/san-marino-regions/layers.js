// San Marino Regions: the 9 castelli, each with its postcode (47890 … 47899; Serravalle has two, 47899 and 47891 for
// Dogana).
// Sources: the castelli (admin_level 8, ISO 3166-2 SM-01…SM-09): OpenStreetMap (© OpenStreetMap contributors, ODbL), October 2026. Postcodes: GeoNames postal codes (CC BY 4.0).

const LAYERS = {
  key: "smregions",
  size: [1000, 1184],
  pad: 16,
  maxZoom: 12,
  labelScale: 0.3,
  fly: {"pad":1.6,"min":0.1},
  street: {"bounds":[[43.89,12.4],[44,12.52]],"maxBounds":[[42,10],[45,15]]},
  hintLabel: "Color by castello",
  exploreKind: "units",
  kinds: [
    {
      key: "units",
      label: "Castelli",
      noun: ["castello","castelli"],
      prompt: "name",
      groups: [["Castelli","",["01","06","02","07","03","04","05","08","09"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"01":"47892","02":"47894","03":"47895","04":"47896","05":"47897","06":"47893","07":"47890","08":"47898","09":"47899, 47891 Dogana"}},
      about: {"x":{"01":["47892"],"02":["47894"],"03":["47895"],"04":["47896"],"05":["47897"],"06":["47893"],"07":["47890"],"08":["47898"],"09":["47899, 47891 Dogana"]}},
      clicked: "{name}",
    },
  ],
  g: "{@id}",
  explore: {"x":{"01":{"code":"Acquaviva","title":"San Marino","sub":["47892"]},"02":{"code":"Chiesanuova","title":"San Marino","sub":["47894"]},"03":{"code":"Domagnano","title":"San Marino","sub":["47895"]},"04":{"code":"Faetano","title":"San Marino","sub":["47896"]},"05":{"code":"Fiorentino","title":"San Marino","sub":["47897"]},"06":{"code":"Borgo Maggiore","title":"San Marino","sub":["47893"]},"07":{"code":"Città di San Marino","title":"San Marino","sub":["47890"]},"08":{"code":"Montegiardino","title":"San Marino","sub":["47898"]},"09":{"code":"Serravalle","title":"San Marino","sub":["47899, 47891 Dogana"]}}},
};
