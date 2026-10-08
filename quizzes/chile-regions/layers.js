// Chile Regions. Map areas are provinces (data.js), with Marga Marga and Ranco
// split where an old phone code splits them and Juan Fernández on its own; ../chile-codes reuses the same areas.
// Kinds: the five natural zones (on no page), the 16 regions, and the road letters of Decreto MOP 301/2011 (A–Y and IPA).
// Natural zones: CORFO's natural regions as listed by region in en.wikipedia "Natural regions of Chile"; the
// regions it splits (Atacama at the Copiapó, Valparaíso at the Aconcagua, Biobío at the Biobío, Los Lagos at the
// Chacao channel) are split here by province, so the zones are approximate. Rapa Nui and Juan Fernández (insular
// Chile) are in no zone.

const LAYERS = {
  key: "clregions",
  size: [700,2242],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.4,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[-56,-76],[-17.4,-66.3]],"maxBounds":[[-60,-115],[-12,-60]]},
  hintLabel: "Color by region",
  exploreKind: "regions",
  kinds: [
    {
      key: "zones",
      label: "Natural zones",
      noun: ["zone","zones"],
      prompt: "name",
      groups: [["Natural zones","north to south",["NG","NC","ZC","ZS","ZA"]]],
      areas: "@zone",
      name: {"x":{"NG":"Norte Grande","NC":"Norte Chico","ZC":"Zona Central","ZS":"Zona Sur","ZA":"Zona Austral"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"NG":"Tarapacá, Antofagasta, Atacama, Arica y Parinacota","NC":"Atacama, Coquimbo, Valparaíso","ZC":"Valparaíso, O'Higgins, Maule, Biobío, Metropolitana, Ñuble","ZS":"Biobío, Araucanía, Los Lagos, Los Ríos","ZA":"Los Lagos, Aysén, Magallanes"}},
      about: "{chipTitle}",
      clicked: {"t":"{name}","x":{"JF":"Insular Chile","CL052":"Insular Chile"}},
    },
    {
      key: "regions",
      label: "Regions",
      noun: ["region","regions"],
      prompt: "name",
      groups: [["North","",["AP","TA","AN","AT","CO"]],["Centre","",["VS","RM","LI","ML"]],["South","",["NB","BI","AR","LR","LL"]],["Far south","",["AI","MA"]]],
      areas: "@region",
      name: "{@regionName}",
      short: "{name}",
      chip: "{name}",
      chipTitle: {"t":"Región de {name}","x":{"RM":"Región Metropolitana de Santiago","LI":"Región del Libertador General Bernardo O'Higgins","ML":"Región del Maule","BI":"Región del Biobío","AR":"Región de La Araucanía","AI":"Región de Aysén del General Carlos Ibáñez del Campo","MA":"Región de Magallanes y de la Antártica Chilena"}},
      about: {"t":["{chipTitle}","Road letter {@letter}"],"x":{"VS":["Región de Valparaíso","Road letters F, IPA, E, G"],"LI":["Región del Libertador General Bernardo O'Higgins","Road letters H, I"],"ML":["Región del Maule","Road letters K, M, J, L"],"BI":["Región del Biobío","Road letters O, P, Q"],"AR":["Región de La Araucanía","Road letters S, R"],"LL":["Región de Los Lagos","Road letters V, W, U"]}},
      clicked: "{name}",
    },
    {
      key: "letters",
      label: "Road letters",
      noun: ["letter","letters"],
      prompt: "dial",
      groups: [["A–D","",["A","B","C","D"]],["E–G, IPA","",["E","F","G","IPA"]],["H–N","",["H","I","J","K","L","M","N"]],["O–S","",["O","P","Q","R","S"]],["T–Y","",["T","U","V","W","X","Y"]]],
      areas: "@letter",
      name: "{id}",
      short: "{id}",
      chip: "{id}",
      chipTitle: {"t":"{@name}","x":{"A":"Tarapacá, Arica y Parinacota","B":"Antofagasta","C":"Atacama","D":"Coquimbo","E":"Los Andes, Petorca, San Felipe","F":"Valparaíso, Quillota, Marga Marga","G":"San Antonio, Metropolitana","I":"Cardenal Caro, Colchagua","N":"Ñuble","T":"Los Ríos","W":"Chiloé, Palena","X":"Aysén","Y":"Magallanes"}},
      about: "{chipTitle}",
      dial: {"t":[["{id}","hot"],["-","cold"],["··","cold"]]},
      clicked: {"t":"{p} ({@name})","x":{"CL058a":"F (Marga Marga)","CL058b":"F (Marga Marga)","CL142b":"T (Ranco)","CL142a":"T (Ranco)"}},
    },
  ],
  g: "{@region}",
  explore: {"t":{"code":"{@letter}","title":"{@name}","sub":["{regions.about0}","{zones.name}","Road letter {@letter}"]},"x":{"JF":{"code":"F","title":"Juan Fernández","sub":["Región de Valparaíso","Insular Chile","Road letter F"]},"CL052":{"code":"IPA","title":"Isla de Pascua","sub":["Región de Valparaíso","Insular Chile","Road letter IPA"]}}},
};
