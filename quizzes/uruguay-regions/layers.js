// Uruguay Regions: the 19 departamentos, in groups made for the quiz by position (North, West, Centre, East, South).
// Names as written in Uruguay. The municipios (since 2010) cover only part of the land, so they are not a layer.
// The same map serves ../uruguay-plates (the department's letter).
//
// Sources: departamentos: OpenStreetMap (boundary=administrative, admin_level 4; © OpenStreetMap contributors, ODbL),
// October 2026, cut to the OSM land polygons (osmdata.openstreetmap.de, ODbL). Capitals: Spanish Wikipedia,
// "Departamentos de Uruguay".

const LAYERS = {
  key: "uyregions",
  size: [1000, 1093],
  pad: 16,
  maxZoom: 30,
  labelScale: 0.3,
  fly: {"pad":1.6,"min":0.05},
  street: {"bounds":[[-35.1,-58.6],[-29.9,-53]],"maxBounds":[[-39,-67],[-26,-45]]},
  hintLabel: "Color by departamento",
  exploreKind: "departamentos",
  kinds: [
    {
      key: "departamentos",
      label: "Departamentos",
      noun: ["department","departments"],
      prompt: "name",
      groups: [["North","",["AR","RV","SA","TA"]],["West","",["CO","PA","RN","SO"]],["Centre","",["DU","FS","FD"]],["East","",["CL","LA","MA","RO","TT"]],["South","",["CA","MO","SJ"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"AR":"Capital: Artigas","CA":"Capital: Canelones","CL":"Capital: Melo","CO":"Capital: Colonia del Sacramento","DU":"Capital: Durazno","FS":"Capital: Trinidad","FD":"Capital: Florida","LA":"Capital: Minas","MA":"Capital: Maldonado","MO":"Capital: Montevideo","PA":"Capital: Paysandú","RN":"Capital: Fray Bentos","RV":"Capital: Rivera","RO":"Capital: Rocha","SA":"Capital: Salto","SJ":"Capital: San José de Mayo","SO":"Capital: Mercedes","TA":"Capital: Tacuarembó","TT":"Capital: Treinta y Tres"}},
      about: {"x":{"AR":["Capital: Artigas","North"],"CA":["Capital: Canelones","South"],"CL":["Capital: Melo","East"],"CO":["Capital: Colonia del Sacramento","West"],"DU":["Capital: Durazno","Centre"],"FS":["Capital: Trinidad","Centre"],"FD":["Capital: Florida","Centre"],"LA":["Capital: Minas","East"],"MA":["Capital: Maldonado","East"],"MO":["Capital: Montevideo","South"],"PA":["Capital: Paysandú","West"],"RN":["Capital: Fray Bentos","West"],"RV":["Capital: Rivera","North"],"RO":["Capital: Rocha","East"],"SA":["Capital: Salto","North"],"SJ":["Capital: San José de Mayo","South"],"SO":["Capital: Mercedes","West"],"TA":["Capital: Tacuarembó","North"],"TT":["Capital: Treinta y Tres","East"]}},
      clicked: "{name}",
    },
  ],
  g: "{a}",
  explore: {"t":{"code":"{a}","title":"{departamentos.name}","sub":["{departamentos.chipTitle}"]}},
};
