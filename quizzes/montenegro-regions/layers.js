// Montenegro Regions. Each map area is one of the 25 opštine (Podgorica as Glavni grad, Cetinje as Prijestonica).
// The 3 statistical regions (Primorski, Središnji, Sjeverni) only group them. Names as written in Montenegro.
// Pages on this map: this one, ../montenegro-codes (area codes), ../montenegro-plates (plate codes),
// ../montenegro-postcodes.
// Sources: the 25 opštine (admin_level 6, ISO 3166-2 ME-01…ME-25, Tuzi since 2018 and Zeta since 2022 among them):
// OpenStreetMap (© OpenStreetMap contributors, ODbL), October 2026, the coastal ones cut to the OSM land polygons
// (osmdata.openstreetmap.de, ODbL). Statistical regions: Monstat (Primorski, Središnji, Sjeverni region).

const LAYERS = {
  key: "meregions",
  size: [1000, 1214],
  pad: 16,
  maxZoom: 30,
  labelScale: 0.25,
  fly: {"pad":1.6,"min":0.05},
  street: {"bounds":[[41.84,18.43],[43.56,20.36]],"maxBounds":[[38,13],[47,26]]},
  hintLabel: "Color by municipality",
  exploreKind: "municipalities",
  kinds: [
    {
      key: "parts",
      label: "Statistical regions",
      groupsOnly: true,
      noun: ["region","regions"],
      prompt: "name",
      hints: false,
      groups: [["Regions","",["P","S","N"]]],
      areas: "@reg",
      name: {"x":{"P":"Primorski region","S":"Središnji region","N":"Sjeverni region"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"P":"Bar, Budva, Herceg Novi, Kotor, Tivat, Ulcinj","S":"Cetinje, Danilovgrad, Nikšić, Podgorica, Tuzi, Zeta","N":"Andrijevica, Berane, Bijelo Polje, Gusinje, Kolašin, Mojkovac, Petnjica, Plav, Plužine, Pljevlja, Rožaje, Šavnik, Žabljak"}},
      about: "{chipTitle}",
      clicked: "{name}",
    },
    {
      key: "municipalities",
      label: "Municipalities",
      noun: ["municipality","municipalities"],
      prompt: "name",
      groups: [["Primorski region","Coastal",["2319526","2319528","2187901","2319532","2319537","2319538"]],["Središnji region","Central",["2319529","2319530","2319534","2319360","10141812","10147976"]],["Sjeverni region","Northern",["2319358","2319359","2319527","7460668","2319531","2319533","7463938","2317882","2319536","2319535","2317936","2319539","2319540"]]],
      areas: "@id",
      name: {"x":{"2187901":"Herceg Novi","2317882":"Plav","2317936":"Rožaje","2319358":"Andrijevica","2319359":"Berane","2319360":"Podgorica","2319526":"Bar","2319527":"Bijelo Polje","2319528":"Budva","2319529":"Cetinje","2319530":"Danilovgrad","2319531":"Kolašin","2319532":"Kotor","2319533":"Mojkovac","2319534":"Nikšić","2319535":"Pljevlja","2319536":"Plužine","2319537":"Tivat","2319538":"Ulcinj","2319539":"Šavnik","2319540":"Žabljak","7460668":"Gusinje","7463938":"Petnjica","10141812":"Tuzi","10147976":"Zeta"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"x":{"2187901":["Primorski region · Opština","Area code 031 · Plates HN"],"2317882":["Sjeverni region · Opština","Area code 051 · Plates PL"],"2317936":["Sjeverni region · Opština","Area code 051 · Plates RO"],"2319358":["Sjeverni region · Opština","Area code 051 · Plates AN"],"2319359":["Sjeverni region · Opština","Area code 051 · Plates BA"],"2319360":["Središnji region · Glavni grad","Area code 020 · Plates PG"],"2319526":["Primorski region · Opština","Area code 030 · Plates BR"],"2319527":["Sjeverni region · Opština","Area code 050 · Plates BP"],"2319528":["Primorski region · Opština","Area code 033 · Plates BD"],"2319529":["Središnji region · Prijestonica","Area code 041 · Plates CT"],"2319530":["Središnji region · Opština","Area code 020 · Plates DG"],"2319531":["Sjeverni region · Opština","Area code 020 · Plates KL"],"2319532":["Primorski region · Opština","Area code 032 · Plates KO"],"2319533":["Sjeverni region · Opština","Area code 050 · Plates MK"],"2319534":["Središnji region · Opština","Area code 040 · Plates NK"],"2319535":["Sjeverni region · Opština","Area code 052 · Plates PV"],"2319536":["Sjeverni region · Opština","Area code 040 · Plates PŽ"],"2319537":["Primorski region · Opština","Area code 032 · Plates TV"],"2319538":["Primorski region · Opština","Area code 030 · Plates UL"],"2319539":["Sjeverni region · Opština","Area code 040 · Plates ŠN"],"2319540":["Sjeverni region · Opština","Area code 052 · Plates ŽB"],"7460668":["Sjeverni region · Opština","Area code 051 · Plates GS"],"7463938":["Sjeverni region · Opština","Area code 051 · Plates PT"],"10141812":["Središnji region · Opština","Area code 020 · Plates TZ"],"10147976":["Središnji region · Opština","Area code 020 · Plates ZT"]}},
      clicked: "{name}",
    },
  ],
  g: "{@id}",
  explore: {"x":{"2187901":{"code":"Herceg Novi","title":"Primorski region","sub":["Primorski region · Opština","Area code 031 · Plates HN"]},"2317882":{"code":"Plav","title":"Sjeverni region","sub":["Sjeverni region · Opština","Area code 051 · Plates PL"]},"2317936":{"code":"Rožaje","title":"Sjeverni region","sub":["Sjeverni region · Opština","Area code 051 · Plates RO"]},"2319358":{"code":"Andrijevica","title":"Sjeverni region","sub":["Sjeverni region · Opština","Area code 051 · Plates AN"]},"2319359":{"code":"Berane","title":"Sjeverni region","sub":["Sjeverni region · Opština","Area code 051 · Plates BA"]},"2319360":{"code":"Podgorica","title":"Središnji region","sub":["Središnji region · Glavni grad","Area code 020 · Plates PG"]},"2319526":{"code":"Bar","title":"Primorski region","sub":["Primorski region · Opština","Area code 030 · Plates BR"]},"2319527":{"code":"Bijelo Polje","title":"Sjeverni region","sub":["Sjeverni region · Opština","Area code 050 · Plates BP"]},"2319528":{"code":"Budva","title":"Primorski region","sub":["Primorski region · Opština","Area code 033 · Plates BD"]},"2319529":{"code":"Cetinje","title":"Središnji region","sub":["Središnji region · Prijestonica","Area code 041 · Plates CT"]},"2319530":{"code":"Danilovgrad","title":"Središnji region","sub":["Središnji region · Opština","Area code 020 · Plates DG"]},"2319531":{"code":"Kolašin","title":"Sjeverni region","sub":["Sjeverni region · Opština","Area code 020 · Plates KL"]},"2319532":{"code":"Kotor","title":"Primorski region","sub":["Primorski region · Opština","Area code 032 · Plates KO"]},"2319533":{"code":"Mojkovac","title":"Sjeverni region","sub":["Sjeverni region · Opština","Area code 050 · Plates MK"]},"2319534":{"code":"Nikšić","title":"Središnji region","sub":["Središnji region · Opština","Area code 040 · Plates NK"]},"2319535":{"code":"Pljevlja","title":"Sjeverni region","sub":["Sjeverni region · Opština","Area code 052 · Plates PV"]},"2319536":{"code":"Plužine","title":"Sjeverni region","sub":["Sjeverni region · Opština","Area code 040 · Plates PŽ"]},"2319537":{"code":"Tivat","title":"Primorski region","sub":["Primorski region · Opština","Area code 032 · Plates TV"]},"2319538":{"code":"Ulcinj","title":"Primorski region","sub":["Primorski region · Opština","Area code 030 · Plates UL"]},"2319539":{"code":"Šavnik","title":"Sjeverni region","sub":["Sjeverni region · Opština","Area code 040 · Plates ŠN"]},"2319540":{"code":"Žabljak","title":"Sjeverni region","sub":["Sjeverni region · Opština","Area code 052 · Plates ŽB"]},"7460668":{"code":"Gusinje","title":"Sjeverni region","sub":["Sjeverni region · Opština","Area code 051 · Plates GS"]},"7463938":{"code":"Petnjica","title":"Sjeverni region","sub":["Sjeverni region · Opština","Area code 051 · Plates PT"]},"10141812":{"code":"Tuzi","title":"Središnji region","sub":["Središnji region · Opština","Area code 020 · Plates TZ"]},"10147976":{"code":"Zeta","title":"Središnji region","sub":["Središnji region · Opština","Area code 020 · Plates ZT"]}}},
};
