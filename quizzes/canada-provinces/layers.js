// Canada Provinces, using the province and territory shapes from
// ../canada-codes/provinces.js (the area-code map only has border lines, and 867 and 902 each span several).

const LAYERS = {
  key: "caprov",
  map: "PROVINCES",
  size: [1200,1031],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.2,
  fly: {"pad":1.6,"min":0.04},
  street: {"bounds":[[41.7,-141],[62,-52.6]],"maxBounds":[[35,-175],[85,-40]]},
  hintLabel: "Color each province",
  exploreKind: "provinces",
  kinds: [
    {
      key: "provinces",
      label: "Provinces",
      noun: ["province","provinces"],
      prompt: "name",
      groups: [["Provinces","",["prAB","prBC","prMB","prNB","prNL","prNS","prON","prPE","prQC","prSK"]],["Territories","",["prYT","prNT","prNU"]]],
      areas: "@id",
      name: "{@name}",
      short: "{@postal}",
      chip: "{name}",
      chipTitle: {"x":{"prAB":"Capital: Edmonton","prBC":"Capital: Victoria","prMB":"Capital: Winnipeg","prNB":"Capital: Fredericton","prNL":"Capital: St. John's","prNS":"Capital: Halifax","prON":"Capital: Toronto","prPE":"Capital: Charlottetown","prQC":"Capital: Québec City","prSK":"Capital: Regina","prYT":"Capital: Whitehorse","prNT":"Capital: Yellowknife","prNU":"Capital: Iqaluit"}},
      about: {"x":{"prAB":["Capital: Edmonton","Area codes: 368, 403, 587, 780, 825"],"prBC":["Capital: Victoria","Area codes: 236, 250, 257, 604, 672, 778"],"prMB":["Capital: Winnipeg","Area codes: 204, 431, 584"],"prNB":["Capital: Fredericton","Area codes: 428, 506"],"prNL":["Capital: St. John's","Area codes: 709, 879"],"prNS":["Capital: Halifax","Area codes: 782, 902"],"prON":["Capital: Toronto","Area codes: 226, 249, 289, 343, 365, 382, 416, 437, 519, 548, 613, 647, 683, 705, 742, 753, 807, 905, 942"],"prPE":["Capital: Charlottetown","Area codes: 782, 902"],"prQC":["Capital: Québec City","Area codes: 263, 354, 367, 418, 438, 450, 468, 514, 579, 581, 819, 873"],"prSK":["Capital: Regina","Area codes: 306, 474, 639"],"prYT":["Capital: Whitehorse","Area codes: 867"],"prNT":["Capital: Yellowknife","Area codes: 867"],"prNU":["Capital: Iqaluit","Area codes: 867"]}},
      clicked: "{name}",
    },
  ],
  g: {"x":{"prAB":"2","prBC":"3","prMB":"4","prNB":"5","prNL":"6","prNT":"7","prNS":"8","prNU":"9","prON":"2","prPE":"9","prQC":"3","prSK":"5","prYT":"8"}},
  explore: {"t":{"code":"{@postal}","title":"{@name}","sub":["{provinces.about0}","{provinces.about1}"]}},
};
