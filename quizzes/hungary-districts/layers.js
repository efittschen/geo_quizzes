// Budapest Districts. The 23 districts (kerületek) as on Budapest street-name
// signs ("XI. kerület"), from OpenStreetMap (admin_level 9). Sides of the Danube and district names: English
// Wikipedia, List of districts in Budapest; districts II, XIII, XV and XVI have no name of their own.

const LAYERS = {
  key: "budistricts",
  context: false,
  size: [1000,952],
  pad: 16,
  maxZoom: 12,
  labelScale: 0.25,
  fly: {"pad":1.6,"min":0.125},
  street: {"bounds":[[47.35,18.92],[47.62,19.34]],"maxBounds":[[47.1,18.5],[47.9,19.8]]},
  hintLabel: "Color each district",
  exploreKind: "districts",
  kinds: [
    {
      key: "districts",
      label: "Districts",
      noun: ["district","districts"],
      prompt: "name",
      groups: [["Buda","",["d01","d02","d03","d11","d12","d22"]],["Pest","",["d04","d05","d06","d07","d08","d09","d10","d13","d14","d15","d16","d17","d18","d19","d20","d23"]],["Csepel Island","",["d21"]]],
      areas: "@id",
      name: "{@roman}. kerület",
      short: "{@roman}",
      chip: "{short}",
      chipTitle: {"x":{"d01":"Várkerület","d02":"II. kerület","d03":"Óbuda-Békásmegyer","d11":"Újbuda","d12":"Hegyvidék","d22":"Budafok-Tétény","d04":"Újpest","d05":"Belváros-Lipótváros","d06":"Terézváros","d07":"Erzsébetváros","d08":"Józsefváros","d09":"Ferencváros","d10":"Kőbánya","d13":"XIII. kerület","d14":"Zugló","d15":"XV. kerület","d16":"XVI. kerület","d17":"Rákosmente","d18":"Pestszentlőrinc-Pestszentimre","d19":"Kispest","d20":"Pesterzsébet","d23":"Soroksár","d21":"Csepel"}},
      about: {"t":["{chipTitle}","{group}"],"x":{"d02":["Buda"],"d13":["Pest"],"d15":["Pest"],"d16":["Pest"]}},
      clicked: "{name}",
    },
  ],
  g: "{a}",
  explore: {"t":{"code":"{@roman}","title":"{districts.chipTitle}","sub":"{districts.about1}"},"x":{"d02":{"code":"II","title":"II. kerület","sub":"Buda"},"d13":{"code":"XIII","title":"XIII. kerület","sub":"Pest"},"d15":{"code":"XV","title":"XV. kerület","sub":"Pest"},"d16":{"code":"XVI","title":"XVI. kerület","sub":"Pest"}}},
};
