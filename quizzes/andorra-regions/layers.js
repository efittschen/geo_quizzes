// Andorra Regions: the 7 parròquies, in their order (Canillo, Encamp, Ordino, La Massana, Andorra la Vella, Sant
// Julià de Lòria, Escaldes-Engordany), each with its postcode (AD100 … AD700, one per parish).
// Sources: the parishes (admin_level 7, ISO 3166-2 AD-02…AD-08): OpenStreetMap (© OpenStreetMap contributors, ODbL), October 2026. Postcodes: GeoNames postal codes (CC BY 4.0).

const LAYERS = {
  key: "adregions",
  size: [1000, 813],
  pad: 16,
  maxZoom: 12,
  labelScale: 0.3,
  fly: {"pad":1.6,"min":0.1},
  street: {"bounds":[[42.42,1.4],[42.66,1.79]],"maxBounds":[[41,-1],[44,4]]},
  hintLabel: "Color by parish",
  exploreKind: "units",
  kinds: [
    {
      key: "units",
      label: "Parròquies",
      noun: ["parish","parishes"],
      prompt: "name",
      groups: [["Parròquies","",["02","03","05","04","07","06","08"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"02":"Parròquia 1 · AD100","03":"Parròquia 2 · AD200","04":"Parròquia 4 · AD400","05":"Parròquia 3 · AD300","06":"Parròquia 6 · AD600","07":"Parròquia 5 · AD500","08":"Parròquia 7 · AD700"}},
      about: {"x":{"02":["Parròquia 1 · AD100"],"03":["Parròquia 2 · AD200"],"04":["Parròquia 4 · AD400"],"05":["Parròquia 3 · AD300"],"06":["Parròquia 6 · AD600"],"07":["Parròquia 5 · AD500"],"08":["Parròquia 7 · AD700"]}},
      clicked: "{name}",
    },
  ],
  g: "{@id}",
  explore: {"x":{"02":{"code":"Canillo","title":"Andorra","sub":["Parròquia 1 · AD100"]},"03":{"code":"Encamp","title":"Andorra","sub":["Parròquia 2 · AD200"]},"04":{"code":"La Massana","title":"Andorra","sub":["Parròquia 4 · AD400"]},"05":{"code":"Ordino","title":"Andorra","sub":["Parròquia 3 · AD300"]},"06":{"code":"Sant Julià de Lòria","title":"Andorra","sub":["Parròquia 6 · AD600"]},"07":{"code":"Andorra la Vella","title":"Andorra","sub":["Parròquia 5 · AD500"]},"08":{"code":"Escaldes-Engordany","title":"Andorra","sub":["Parròquia 7 · AD700"]}}},
};
