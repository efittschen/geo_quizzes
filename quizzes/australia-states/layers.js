// Australia States, using the state and territory outlines from
// ../australia-prefixes/data.js (DATA.ent). Names come from geo.js (STATE_NAMES, from the towns inside each).

const LAYERS = {
  key: "austates",
  map: {"paths":"DATA.ent","cols":{"id":["st0","st1","st2","st3","st4","st5","st6","st7"],"name":["Western Australia","Northern Territory","South Australia","Queensland","New South Wales","Victoria","Tasmania","Australian Capital Territory"]}},
  size: [1100,1057],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.2,
  fly: {"pad":1.6,"min":0.04},
  street: {"bounds":[[-43.7,113],[-10.6,153.7]],"maxBounds":[[-50,95],[0,170]]},
  hintLabel: "Color each state",
  exploreKind: "states",
  kinds: [
    {
      key: "states",
      label: "States",
      noun: ["state","states"],
      prompt: "name",
      groups: [["States","",["st4","st3","st2","st6","st5","st0"]],["Territories","",["st7","st1"]]],
      areas: "@id",
      name: "{@name}",
      short: {"x":{"st4":"NSW","st3":"QLD","st2":"SA","st6":"TAS","st5":"VIC","st0":"WA","st7":"ACT","st1":"NT"}},
      chip: "{name}",
      chipTitle: {"x":{"st4":"Capital: Sydney","st3":"Capital: Brisbane","st2":"Capital: Adelaide","st6":"Capital: Hobart","st5":"Capital: Melbourne","st0":"Capital: Perth","st7":"Capital: Canberra","st1":"Capital: Darwin"}},
      about: {"x":{"st4":["Capital: Sydney","Area code: 02"],"st3":["Capital: Brisbane","Area code: 07"],"st2":["Capital: Adelaide","Area code: 08"],"st6":["Capital: Hobart","Area code: 03"],"st5":["Capital: Melbourne","Area code: 03"],"st0":["Capital: Perth","Area code: 08"],"st7":["Capital: Canberra","Area code: 02"],"st1":["Capital: Darwin","Area code: 08"]}},
      clicked: "{name}",
    },
  ],
  g: {"x":{"st0":"1","st1":"2","st2":"3","st3":"4","st4":"5","st5":"6","st6":"7","st7":"8"}},
  explore: {"t":{"code":"{states.short}","title":"{@name}","sub":["{states.about0}","{states.about1}"]}},
};
