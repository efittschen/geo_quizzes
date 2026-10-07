// London Postcodes. The 8 London postal areas (E, EC, N, NW, SE, SW, W, WC) and
// their 120 numbered districts (E1 … WC2), as shown on London street-name plates. Sub-districts are merged into
// their number (SW1A … SW1Y = SW1, E1W = E1, N1C = N1); non-geographic districts (E98, N81, NW26, SW95, PO-box
// sub-districts) are left out. Districts are rebuilt as Voronoi cells around OS Code-Point Open postcode points,
// so their borders are approximate. Neighbouring postal areas (EN, HA, UB, TW, KT, SM, CR, BR, DA, RM, IG …) are
// map context.

const LAYERS = {
  key: "uklondon",
  size: [1000,928],
  pad: 16,
  maxZoom: 30,
  labelScale: 0.35,
  fly: {"pad":1.8,"min":0.03333333333333333},
  street: {"bounds":[[51.38,-0.36],[51.68,0.22]],"maxBounds":[[51,-1.2],[52,1]]},
  hintLabel: "Color by postal area",
  exploreKind: "districts",
  kinds: [
    {
      key: "areas",
      label: "Postal areas",
      noun: ["area","areas"],
      prompt: "name",
      hints: false,
      areaRank: false,
      groups: [["London","",["E","EC","N","NW","SE","SW","W","WC"]]],
      areas: "@area",
      name: "{id}",
      short: "{id}",
      chip: "{id}",
      chipTitle: {"x":{"E":"Eastern","EC":"Eastern Central","N":"Northern","NW":"North Western","SE":"South Eastern","SW":"South Western","W":"Western","WC":"Western Central"}},
      about: {"x":{"E":["Eastern","19 districts"],"EC":["Eastern Central","4 districts"],"N":["Northern","22 districts"],"NW":["North Western","11 districts"],"SE":["South Eastern","28 districts"],"SW":["South Western","20 districts"],"W":["Western","14 districts"],"WC":["Western Central","2 districts"]}},
      clicked: "{p} · {chipTitle}",
    },
    {
      key: "districts",
      label: "Districts",
      noun: ["district","districts"],
      prompt: "name",
      groups: [["E","Eastern",["E1","E2","E3","E4","E5","E6","E7","E8","E9","E10","E11","E12","E13","E14","E15","E16","E17","E18","E20"]],["EC","Eastern Central",["EC1","EC2","EC3","EC4"]],["N","Northern",["N1","N2","N3","N4","N5","N6","N7","N8","N9","N10","N11","N12","N13","N14","N15","N16","N17","N18","N19","N20","N21","N22"]],["NW","North Western",["NW1","NW2","NW3","NW4","NW5","NW6","NW7","NW8","NW9","NW10","NW11"]],["SE","South Eastern",["SE1","SE2","SE3","SE4","SE5","SE6","SE7","SE8","SE9","SE10","SE11","SE12","SE13","SE14","SE15","SE16","SE17","SE18","SE19","SE20","SE21","SE22","SE23","SE24","SE25","SE26","SE27","SE28"]],["SW","South Western",["SW1","SW2","SW3","SW4","SW5","SW6","SW7","SW8","SW9","SW10","SW11","SW12","SW13","SW14","SW15","SW16","SW17","SW18","SW19","SW20"]],["W","Western",["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12","W13","W14"]],["WC","Western Central",["WC1","WC2"]]],
      areas: "@id",
      name: "{id}",
      short: "{id}",
      chip: "{id}",
      chipTitle: "{groupSub}",
      about: "{groupSub}",
      clicked: "{a}",
    },
  ],
  g: "{@area}",
  explore: {"t":{"code":"{a}","title":"London {@area}","sub":"{areas.about0}"}},
};
