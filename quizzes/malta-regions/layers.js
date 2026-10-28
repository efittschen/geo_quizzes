// Malta Regions. Each map area is one of the 68 local councils (kunsilli lokali: 54 on Malta, 14 on Gozo), grouped into
// the 6 regions (reġjuni) of 2021. A council by the name on signs and in addresses, MaltaPost's locality (Valletta,
// Sliema, Paola, Marsaskala, Victoria; Maltese, the article dropped: Mosta for Il-Mosta), its formal Maltese name and
// an English name where one is used beside it (Il-Belt Valletta; Raħal Ġdid; Bormla, Cospicua). The regions by their
// Maltese names, the English beside.
//
// Sources: OpenStreetMap contributors (ODbL), boundary=administrative, admin_level 7 (reġjuni) and 8 (kunsilli lokali),
// October 2026.

const LAYERS = {
  key: "mtregions",
  borders: "[DATA.rb]",
  size: [1000, 930],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.22,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[35.8,14.2],[36.1,14.6]],"maxBounds":[[31,6],[41,23]]},
  hintLabel: "Color by region",
  exploreKind: "councils",
  kinds: [
    {
      key: "regions",
      label: "Regions",
      noun: ["region","regions"],
      prompt: "name",
      hints: false,
      areaRank: false,
      groups: [["Reġjuni","",["1","2","3","4","5","6"]]],
      areas: "@rg",
      name: {"x":{"1":"Reġjun tal-Port","2":"Reġjun tal-Lvant","3":"Reġjun tat-Tramuntana","4":"Reġjun tal-Punent","5":"Reġjun tan-Nofsinhar","6":"Reġjun Għawdex"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"1":"Port Region","2":"Eastern Region","3":"Northern Region","4":"Western Region","5":"Southern Region","6":"Gozo Region"}},
      about: {"x":{"1":["Port Region","11 local councils"],"2":["Eastern Region","12 local councils"],"3":["Northern Region","9 local councils"],"4":["Western Region","10 local councils"],"5":["Southern Region","12 local councils"],"6":["Gozo Region","14 local councils"]}},
      clicked: "{name}",
    },
    {
      key: "councils",
      label: "Local councils",
      noun: ["council","councils"],
      prompt: "name",
      groups: [["Reġjun tal-Port","Port Region",["6172198","7510576","7510560","7510581","7510578","7510575","7510577","7510559","7510580","7510574","7510573"]],["Reġjun tal-Lvant","Eastern Region",["7510585","7510588","7510592","7510586","7510593","7510584","7510590","7510582","7510589","6172199","7510591","7510583"]],["Reġjun tat-Tramuntana","Northern Region",["7510551","7510550","6181422","6172218","7510594","7510564","7510595","7510587","7510596"]],["Reġjun tal-Punent","Western Region",["7510566","7510554","7510549","7510555","7510568","7510565","7510553","7510567","7510552","7510569"]],["Reġjun tan-Nofsinhar","Southern Region",["7510570","7510557","7510562","7510547","7510563","7510579","7510572","7510571","7510556","7510558","7510548","7510561"]],["Reġjun Għawdex","Gozo Region",["7508578","6311965","7508581","7508582","7508579","7508589","7508587","7508586","7508580","7508590","7508583","7508585","7508588","7508584"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"x":{"6172198":["Il-Birgu · Vittoriosa","Reġjun tal-Port"],"6172199":["Tas-Sliema","Reġjun tal-Lvant"],"6172218":["L-Imġarr","Reġjun tat-Tramuntana"],"6181422":["Il-Mellieħa","Reġjun tat-Tramuntana"],"6311965":["Reġjun Għawdex"],"7508578":["Il-Fontana","Reġjun Għawdex"],"7508579":["Ta' Kerċem","Reġjun Għawdex"],"7508580":["St Lawrence","Reġjun Għawdex"],"7508581":["L-Għarb","Reġjun Għawdex"],"7508582":["L-Għasri","Reġjun Għawdex"],"7508583":["Ir-Rabat","Reġjun Għawdex"],"7508584":["Iż-Żebbuġ","Reġjun Għawdex"],"7508585":["Ix-Xagħra","Reġjun Għawdex"],"7508586":["Il-Qala","Reġjun Għawdex"],"7508587":["In-Nadur","Reġjun Għawdex"],"7508588":["Ix-Xewkija","Reġjun Għawdex"],"7508589":["Il-Munxar","Reġjun Għawdex"],"7508590":["Ta' Sannat","Reġjun Għawdex"],"7510547":["Il-Ħamrun","Reġjun tan-Nofsinhar"],"7510548":["Reġjun tan-Nofsinhar"],"7510549":["L-Imdina","Reġjun tal-Punent"],"7510550":["Ħal Balzan","Reġjun tat-Tramuntana"],"7510551":["Ħ'Attard","Reġjun tat-Tramuntana"],"7510552":["Ħaż-Żebbuġ","Reġjun tal-Punent"],"7510553":["Ħal Safi","Reġjun tal-Punent"],"7510554":["Ħal Kirkop","Reġjun tal-Punent"],"7510555":["L-Imqabba","Reġjun tal-Punent"],"7510556":["Ħal Qormi","Reġjun tan-Nofsinhar"],"7510557":["Il-Gudja","Reġjun tan-Nofsinhar"],"7510558":["Reġjun tan-Nofsinhar"],"7510559":["Ħal Tarxien","Reġjun tal-Port"],"7510560":["Il-Fgura","Reġjun tal-Port"],"7510561":["Iż-Żejtun","Reġjun tan-Nofsinhar"],"7510562":["Ħal Għaxaq","Reġjun tan-Nofsinhar"],"7510563":["Ħal Luqa","Reġjun tan-Nofsinhar"],"7510564":["L-Imtarfa","Reġjun tat-Tramuntana"],"7510565":["Ir-Rabat","Reġjun tal-Punent"],"7510566":["Ħad-Dingli","Reġjun tal-Punent"],"7510567":["Is-Siġġiewi","Reġjun tal-Punent"],"7510568":["Il-Qrendi","Reġjun tal-Punent"],"7510569":["Iż-Żurrieq","Reġjun tal-Punent"],"7510570":["Reġjun tan-Nofsinhar"],"7510571":["Reġjun tan-Nofsinhar"],"7510572":["Wied il-Għajn","Reġjun tan-Nofsinhar"],"7510573":["Ħaż-Żabbar","Reġjun tal-Port"],"7510574":["Ix-Xgħajra","Reġjun tal-Port"],"7510575":["Il-Kalkara","Reġjun tal-Port"],"7510576":["Cospicua","Reġjun tal-Port"],"7510577":["Raħal Ġdid","Reġjun tal-Port"],"7510578":["L-Isla · Senglea","Reġjun tal-Port"],"7510579":["Il-Marsa","Reġjun tan-Nofsinhar"],"7510580":["Il-Belt Valletta","Reġjun tal-Port"],"7510581":["Il-Furjana","Reġjun tal-Port"],"7510582":["Tal-Pietà","Reġjun tal-Lvant"],"7510583":["Reġjun tal-Lvant"],"7510584":["L-Imsida","Reġjun tal-Lvant"],"7510585":["Reġjun tal-Lvant"],"7510586":["L-Iklin","Reġjun tal-Lvant"],"7510587":["Reġjun tat-Tramuntana"],"7510588":["Il-Gżira","Reġjun tal-Lvant"],"7510589":["St Julian's","Reġjun tal-Lvant"],"7510590":["Reġjun tal-Lvant"],"7510591":["Is-Swieqi","Reġjun tal-Lvant"],"7510592":["Ħal Għargħur","Reġjun tal-Lvant"],"7510593":["Ħal Lija","Reġjun tal-Lvant"],"7510594":["Il-Mosta","Reġjun tat-Tramuntana"],"7510595":["In-Naxxar","Reġjun tat-Tramuntana"],"7510596":["St Paul's Bay","Reġjun tat-Tramuntana"]}},
      clicked: "{name}",
    },
  ],
  g: "{@rg}",
  explore: {"t":{"code":"{councils.name}","title":"{regions.name}","sub":["{@mt}"]}},
};
