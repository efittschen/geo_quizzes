// Latvia Regions. Two layers: the 5 vēsturiskās zemes (historical lands: Kurzeme, Zemgale, Sēlija, Vidzeme, Latgale, as
// the Latvian Historical Lands Law of 2021 draws them) and the 42 pašvaldības (35 novadi and the 7 valstspilsētas with a
// territory of their own, as of 2026: Varakļānu novads joined Madonas novads on 30 June 2024). A map area is a
// pašvaldība, or its part in one land where a land's border crosses it (14 do, Daugavpils on the Daugava among them);
// each pašvaldība is grouped under the land holding most of it, and the lands it reaches are said with it. Names as in
// Latvian (Rīga, Siguldas novads); the English name is said with each.
//
// Sources: pašvaldības and their borders: VZD (State Land Service), Administratīvās teritorijas 2026 (CC0); historical
// lands: VZD, Vēsturiskās zemes (CC0); English names: Wikidata (CC0).

const LAYERS = {
  key: "lvregions",
  borders: "[DATA.rb]",
  size: [1000,595],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.22,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[55.5,20.8],[58.2,28.4]],"maxBounds":[[51,12],[63,37]]},
  hintLabel: "Color by pašvaldība",
  exploreKind: "zemes",
  kinds: [
    {
      key: "zemes",
      label: "Vēsturiskās zemes",
      noun: ["zeme","zemes"],
      prompt: "name",
      hints: false,
      areaRank: false,
      groups: [["Vēsturiskās zemes","historical lands",["LVK","LVZ","LVS","LVV","LVL"]]],
      areas: "@land",
      name: {"x":{"LVK":"Kurzeme","LVZ":"Zemgale","LVS":"Sēlija","LVV":"Vidzeme","LVL":"Latgale"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"LVK":"Courland","LVZ":"Semigallia","LVS":"Selonia","LVV":"Vidzeme","LVL":"Latgalia"}},
      about: {"x":{"LVK":["Courland","Dienvidkurzemes novads, Kuldīgas novads, Liepāja, Saldus novads, Talsu novads, Tukuma novads, Ventspils, Ventspils novads"],"LVZ":["Semigallia","Bauskas novads, Dobeles novads, Jelgava, Jelgavas novads, Ķekavas novads, Mārupes novads, Ogres novads, Olaines novads, Saldus novads, Tukuma novads"],"LVS":["Selonia","Aizkraukles novads, Augšdaugavas novads, Daugavpils, Jēkabpils novads, Krāslavas novads"],"LVV":["Vidzeme","Aizkraukles novads, Alūksnes novads, Ādažu novads, Cēsu novads, Gulbenes novads, Jūrmala, Ķekavas novads, Limbažu novads, Madonas novads, Mārupes novads, Ogres novads, Olaines novads, Rīga, Ropažu novads, Salaspils novads, Saulkrastu novads, Siguldas novads, Smiltenes novads, Tukuma novads, Valkas novads, Valmieras novads"],"LVL":["Latgalia","Aizkraukles novads, Alūksnes novads, Augšdaugavas novads, Balvu novads, Daugavpils, Jēkabpils novads, Krāslavas novads, Līvānu novads, Ludzas novads, Madonas novads, Preiļu novads, Rēzekne, Rēzeknes novads"]}},
      clicked: "{name}",
    },
    {
      key: "pasvaldibas",
      label: "Pašvaldības",
      noun: ["pašvaldība","pašvaldības"],
      prompt: "name",
      groups: [["Kurzeme","Courland",["0027000","0033000","0005000","0046000","0051000","0052000","0007000","0056000"]],["Zemgale","Semigallia",["0025000","0028000","0003000","0030000","0034000","0041000"]],["Sēlija","Selonia",["0020000","0022000","0031000"]],["Vidzeme","Vidzeme",["0021000","0023000","0026000","0029000","0004000","0035000","0038001","0039000","0040000","0001000","0044000","0045000","0047000","0048000","0049000","0053000","0054000"]],["Latgale","Latgalia",["0024000","0002000","0032000","0036000","0037000","0042000","0006000","0043000"]]],
      areas: "@nov",
      name: {"x":{"0020000":"Aizkraukles novads","0021000":"Alūksnes novads","0022000":"Augšdaugavas novads","0023000":"Ādažu novads","0024000":"Balvu novads","0025000":"Bauskas novads","0026000":"Cēsu novads","0002000":"Daugavpils","0027000":"Dienvidkurzemes novads","0028000":"Dobeles novads","0029000":"Gulbenes novads","0003000":"Jelgava","0030000":"Jelgavas novads","0031000":"Jēkabpils novads","0004000":"Jūrmala","0032000":"Krāslavas novads","0033000":"Kuldīgas novads","0034000":"Ķekavas novads","0005000":"Liepāja","0035000":"Limbažu novads","0036000":"Līvānu novads","0037000":"Ludzas novads","0038001":"Madonas novads","0039000":"Mārupes novads","0040000":"Ogres novads","0041000":"Olaines novads","0042000":"Preiļu novads","0006000":"Rēzekne","0043000":"Rēzeknes novads","0001000":"Rīga","0044000":"Ropažu novads","0045000":"Salaspils novads","0046000":"Saldus novads","0047000":"Saulkrastu novads","0048000":"Siguldas novads","0049000":"Smiltenes novads","0051000":"Talsu novads","0052000":"Tukuma novads","0053000":"Valkas novads","0054000":"Valmieras novads","0007000":"Ventspils","0056000":"Ventspils novads"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"0020000":"Sēlija, Vidzeme, Latgale","0021000":"Vidzeme, Latgale","0022000":"Sēlija, Latgale","0023000":"Vidzeme","0024000":"Latgale","0025000":"Zemgale","0026000":"Vidzeme","0002000":"Latgale, Sēlija","0027000":"Kurzeme","0028000":"Zemgale","0029000":"Vidzeme","0003000":"Zemgale","0030000":"Zemgale","0031000":"Sēlija, Latgale","0004000":"Vidzeme","0032000":"Latgale, Sēlija","0033000":"Kurzeme","0034000":"Zemgale, Vidzeme","0005000":"Kurzeme","0035000":"Vidzeme","0036000":"Latgale","0037000":"Latgale","0038001":"Vidzeme, Latgale","0039000":"Vidzeme, Zemgale","0040000":"Vidzeme, Zemgale","0041000":"Zemgale, Vidzeme","0042000":"Latgale","0006000":"Latgale","0043000":"Latgale","0001000":"Vidzeme","0044000":"Vidzeme","0045000":"Vidzeme","0046000":"Kurzeme, Zemgale","0047000":"Vidzeme","0048000":"Vidzeme","0049000":"Vidzeme","0051000":"Kurzeme","0052000":"Kurzeme, Zemgale, Vidzeme","0053000":"Vidzeme","0054000":"Vidzeme","0007000":"Kurzeme","0056000":"Kurzeme"}},
      about: {"x":{"0020000":["Aizkraukle Municipality","Sēlija, Vidzeme, Latgale"],"0021000":["Alūksne Municipality","Vidzeme, Latgale"],"0022000":["Augšdaugava Municipality","Sēlija, Latgale"],"0023000":["Ādaži Municipality","Vidzeme"],"0024000":["Balvi Municipality","Latgale"],"0025000":["Bauska Municipality","Zemgale"],"0026000":["Cēsis Municipality","Vidzeme"],"0002000":["Latgale, Sēlija"],"0027000":["South Kurzeme Municipality","Kurzeme"],"0028000":["Dobele Municipality","Zemgale"],"0029000":["Gulbene Municipality","Vidzeme"],"0003000":["Zemgale"],"0030000":["Jelgava Municipality","Zemgale"],"0031000":["Jēkabpils Municipality","Sēlija, Latgale"],"0004000":["Vidzeme"],"0032000":["Krāslava Municipality","Latgale, Sēlija"],"0033000":["Kuldīga Municipality","Kurzeme"],"0034000":["Ķekava Municipality","Zemgale, Vidzeme"],"0005000":["Kurzeme"],"0035000":["Limbaži Municipality","Vidzeme"],"0036000":["Līvāni Municipality","Latgale"],"0037000":["Ludza Municipality","Latgale"],"0038001":["Madona Municipality","Vidzeme, Latgale"],"0039000":["Mārupe Municipality","Vidzeme, Zemgale"],"0040000":["Ogre Municipality","Vidzeme, Zemgale"],"0041000":["Olaine Municipality","Zemgale, Vidzeme"],"0042000":["Preiļi Municipality","Latgale"],"0006000":["Latgale"],"0043000":["Rēzekne Municipality","Latgale"],"0001000":["Riga","Vidzeme"],"0044000":["Ropaži Municipality","Vidzeme"],"0045000":["Salaspils Municipality","Vidzeme"],"0046000":["Saldus Municipality","Kurzeme, Zemgale"],"0047000":["Saulkrasti Municipality","Vidzeme"],"0048000":["Sigulda Municipality","Vidzeme"],"0049000":["Smiltene Municipality","Vidzeme"],"0051000":["Talsi Municipality","Kurzeme"],"0052000":["Tukums Municipality","Kurzeme, Zemgale, Vidzeme"],"0053000":["Valka Municipality","Vidzeme"],"0054000":["Valmiera Municipality","Vidzeme"],"0007000":["Kurzeme"],"0056000":["Ventspils Municipality","Kurzeme"]}},
      clicked: "{name}",
    },
  ],
  g: "{@nov}",
  explore: {"t":{"code":"{pasvaldibas.name}","title":"{zemes.name}","sub":["{pasvaldibas.about0}"]}},
};
