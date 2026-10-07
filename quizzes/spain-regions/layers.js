// Spain Regions, shared by three pages (data-kinds on <body>):
//   spain-regions    autonomous communities, provinces and islands
//   spain-languages  co-official languages on signs
//   spain-roads      regional and provincial road-number prefixes
// Map areas (data.js): the 50 provinces plus Ceuta and Melilla, dissolved from IGN municipal boundaries (es-atlas
// 0.6.0, 2024), with finer pieces where a quiz needs them:
//   - the Balearic, Las Palmas and Santa Cruz de Tenerife provinces split into their 11 islands (La Graciosa with
//     Lanzarote, Cabrera with Mallorca);
//   - Navarre split into its Basque-speaking and mixed zones (Ley Foral 18/1986 del vascuence, art. 5, consolidated
//     text) and the rest; Alicante, Castellón and Valencia split into their Castilian-speaking municipalities (Ley
//     4/1983 de uso y enseñanza del valenciano, art. 36, plus Pilar de la Horadada, Los Montesinos and San Isidro,
//     later split off Castilian-speaking ones) and the rest; Lleida split into the Val d'Aran (9 municipalities).
// Language areas: where a co-official language is on official signs: Catalan (Catalonia except Aran), Valencian (the
// Valencian-speaking area), Balearic Catalan, Basque (Basque Country, Navarre's Basque-speaking and mixed zones),
// Galician, Aranese (Val d'Aran). Approximate: signs depend on who put them up.
// Road prefixes: the letters before road numbers on kilometre posts, from OpenStreetMap ref tags (Geofabrik taginfo,
// 30 Sep 2026: every prefix on 300+ road ways in a community, state networks left out) and es.wikipedia (Aragón,
// Catalonia, Canarias, PM-820 Formentera, Ma-/Me- roads).

const LAYERS = {
  key: "esregions",
  size: [1000,848],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.25,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[27.6,-18.2],[43.8,4.4]],"maxBounds":[[22,-25],[48,10]]},
  hintLabel: "Color by community",
  exploreKind: "provinces",
  d: {"p51":"M598.5,425.4a7,7 0 1,0 14,0a7,7 0 1,0 -14,0z","p52":"M704.3,454.9a7,7 0 1,0 14,0a7,7 0 1,0 -14,0z"},
  top: ["p51","p52"],
  kinds: [
    {
      key: "communities",
      label: "Communities",
      noun: ["community","communities"],
      prompt: "name",
      groups: [["North","",["GA","AS","CB","PV","NC","RI","AR","CT","CL"]],["Centre and south","",["MD","CM","EX","VC","MC","AN"]],["Islands and cities","",["IB","CN","CE","ML"]]],
      areas: "@ccaa",
      name: {"x":{"GA":"Galicia","AS":"Asturias","CB":"Cantabria","PV":"Basque Country","NC":"Navarre","RI":"La Rioja","AR":"Aragon","CT":"Catalonia","CL":"Castile and León","MD":"Madrid","CM":"Castilla-La Mancha","EX":"Extremadura","VC":"Valencian Community","MC":"Murcia","AN":"Andalusia","IB":"Balearic Islands","CN":"Canary Islands","CE":"Ceuta","ML":"Melilla"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"GA":"Galicia","AS":"Principado de Asturias","CB":"Cantabria","PV":"Euskadi / País Vasco","NC":"Navarra / Nafarroa","RI":"La Rioja","AR":"Aragón","CT":"Catalunya / Cataluña","CL":"Castilla y León","MD":"Comunidad de Madrid","CM":"Castilla-La Mancha","EX":"Extremadura","VC":"Comunitat Valenciana","MC":"Región de Murcia","AN":"Andalucía","IB":"Illes Balears","CN":"Canarias","CE":"Ceuta","ML":"Melilla"}},
      about: {"x":{"GA":["Galicia","A Coruña, Lugo, Ourense, Pontevedra"],"AS":["Principado de Asturias","Asturias"],"CB":["Cantabria","Cantabria"],"PV":["Euskadi / País Vasco","Álava, Gipuzkoa, Biscay"],"NC":["Navarra / Nafarroa","Navarre"],"RI":["La Rioja","La Rioja"],"AR":["Aragón","Huesca, Teruel, Zaragoza"],"CT":["Catalunya / Cataluña","Barcelona, Girona, Lleida, Tarragona"],"CL":["Castilla y León","Ávila, Burgos, León, Palencia, Salamanca, Segovia, Soria, Valladolid, Zamora"],"MD":["Comunidad de Madrid","Madrid"],"CM":["Castilla-La Mancha","Albacete, Ciudad Real, Cuenca, Guadalajara, Toledo"],"EX":["Extremadura","Badajoz, Cáceres"],"VC":["Comunitat Valenciana","Alicante, Castellón, Valencia"],"MC":["Región de Murcia","Murcia"],"AN":["Andalucía","Almería, Cádiz, Córdoba, Granada, Huelva, Jaén, Málaga, Seville"],"IB":["Illes Balears","Balearic Islands"],"CN":["Canarias","Las Palmas, Santa Cruz de Tenerife"],"CE":["Ceuta","Ceuta"],"ML":["Melilla","Melilla"]}},
      clicked: "{name}",
    },
    {
      key: "provinces",
      label: "Provinces",
      noun: ["province","provinces"],
      prompt: "name",
      groups: [["Galicia","",["15","27","32","36"]],["Asturias","",["33"]],["Cantabria","",["39"]],["Basque Country","",["01","20","48"]],["Navarre","",["31"]],["La Rioja","",["26"]],["Aragon","",["22","44","50"]],["Catalonia","",["08","17","25","43"]],["Castile and León","",["05","09","24","34","37","40","42","47","49"]],["Madrid","",["28"]],["Castilla-La Mancha","",["02","13","16","19","45"]],["Extremadura","",["06","10"]],["Valencian Community","",["03","12","46"]],["Murcia","",["30"]],["Andalusia","",["04","11","14","18","21","23","29","41"]],["Balearic Islands","",["07"]],["Canary Islands","",["35","38"]],["Ceuta","",["51"]],["Melilla","",["52"]]],
      areas: "@prov",
      name: {"x":{"10":"Cáceres","11":"Cádiz","12":"Castellón","13":"Ciudad Real","14":"Córdoba","15":"A Coruña","16":"Cuenca","17":"Girona","18":"Granada","19":"Guadalajara","20":"Gipuzkoa","21":"Huelva","22":"Huesca","23":"Jaén","24":"León","25":"Lleida","26":"La Rioja","27":"Lugo","28":"Madrid","29":"Málaga","30":"Murcia","31":"Navarre","32":"Ourense","33":"Asturias","34":"Palencia","35":"Las Palmas","36":"Pontevedra","37":"Salamanca","38":"Santa Cruz de Tenerife","39":"Cantabria","40":"Segovia","41":"Seville","42":"Soria","43":"Tarragona","44":"Teruel","45":"Toledo","46":"Valencia","47":"Valladolid","48":"Biscay","49":"Zamora","50":"Zaragoza","51":"Ceuta","52":"Melilla","01":"Álava","08":"Barcelona","05":"Ávila","09":"Burgos","02":"Albacete","06":"Badajoz","03":"Alicante","04":"Almería","07":"Balearic Islands"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      detail: ["Show community","{group}"],
      about: {"t":["{group}"],"x":{"12":["Castelló/Castellón","Valencian Community"],"31":["Navarra/Nafarroa","Navarre"],"41":["Sevilla","Andalusia"],"46":["València/Valencia","Valencian Community"],"48":["Bizkaia","Basque Country"],"01":["Araba/Álava","Basque Country"],"03":["Alacant/Alicante","Valencian Community"],"07":["Illes Balears","Balearic Islands"]}},
      clicked: "{name} · {chipTitle}",
    },
    {
      key: "islands",
      label: "Islands",
      noun: ["island","islands"],
      prompt: "name",
      areaRank: false,
      groups: [["Balearic Islands","",["ma","me","ei","fo"]],["Canary Islands","",["lz","fv","gc","tf","go","lp","hi"]]],
      areas: "@isl",
      name: {"x":{"ma":"Mallorca","me":"Menorca","ei":"Ibiza","fo":"Formentera","lz":"Lanzarote","fv":"Fuerteventura","gc":"Gran Canaria","tf":"Tenerife","go":"La Gomera","lp":"La Palma","hi":"El Hierro"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"ma":"Balearic Islands","me":"Balearic Islands","ei":"Balearic Islands","fo":"Balearic Islands","lz":"Las Palmas","fv":"Las Palmas","gc":"Las Palmas","tf":"Santa Cruz de Tenerife","go":"Santa Cruz de Tenerife","lp":"Santa Cruz de Tenerife","hi":"Santa Cruz de Tenerife"}},
      about: {"t":["{chipTitle}"],"x":{"ei":["Eivissa","Balearic Islands"],"lz":["with La Graciosa","Las Palmas"]}},
      clicked: {"x":{"p04":"Almería","ima":"Mallorca","ime":"Menorca","p09":"Burgos","p44":"Teruel","p39":"Cantabria","p08":"Barcelona","p48":"Biscay","p42":"Soria","p29":"Málaga","p22":"Huesca","p11":"Cádiz","p05":"Ávila","p14":"Córdoba","p34":"Palencia","p37":"Salamanca","p50":"Zaragoza","p18":"Granada","p49":"Zamora","p31":"Navarre","p40":"Segovia","p47":"Valladolid","p26":"La Rioja","p24":"León","p16":"Cuenca","p21":"Huelva","p23":"Jaén","p13":"Ciudad Real","p41":"Seville","p03":"Alicante","p03es":"Alicante","p33":"Asturias","p46":"Valencia","ifo":"Formentera","iei":"Ibiza","p20":"Gipuzkoa","p19":"Guadalajara","p02":"Albacete","p10":"Cáceres","p25":"Lleida","p17":"Girona","p45":"Toledo","p46es":"Valencia","p06":"Badajoz","p32":"Ourense","p12":"Castellón","p25oc":"Lleida","p12es":"Castellón","p43":"Tarragona","p31eu":"Navarre","p15":"A Coruña","p27":"Lugo","p36":"Pontevedra","p28":"Madrid","p30":"Murcia","p01":"Álava","p51":"Ceuta","p52":"Melilla","itf":"Tenerife","ilp":"La Palma","ihi":"El Hierro","igo":"La Gomera","igc":"Gran Canaria","ifv":"Fuerteventura","ilz":"Lanzarote"}},
    },
    {
      key: "languages",
      label: "Languages",
      noun: ["language","languages"],
      prompt: "name",
      hints: false,
      merge: false,
      dim: false,
      areaRank: false,
      groups: [["Languages","",["ca","va","ib","eu","gl","oc"]]],
      areas: "@lang",
      name: {"x":{"ca":"Catalan","va":"Valencian","ib":"Balearic","eu":"Basque","gl":"Galician","oc":"Aranese"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"ca":"Catalonia","va":"Valencian-speaking Valencian Community","ib":"Balearic Islands (Catalan)","eu":"Basque Country, Navarre's Basque-speaking and mixed zones","gl":"Galicia","oc":"Val d'Aran (Occitan)"}},
      about: {"t":["{chipTitle}"]},
      clicked: {"x":{"p04":"Almería · Spanish only","ima":"Balearic · Mallorca","ime":"Balearic · Menorca","p09":"Burgos · Spanish only","p44":"Teruel · Spanish only","p39":"Cantabria · Spanish only","p08":"Catalan · Barcelona","p48":"Basque · Biscay","p42":"Soria · Spanish only","p29":"Málaga · Spanish only","p22":"Huesca · Spanish only","p11":"Cádiz · Spanish only","p05":"Ávila · Spanish only","p14":"Córdoba · Spanish only","p34":"Palencia · Spanish only","p37":"Salamanca · Spanish only","p50":"Zaragoza · Spanish only","p18":"Granada · Spanish only","p49":"Zamora · Spanish only","p31":"Navarre · Spanish only","p40":"Segovia · Spanish only","p47":"Valladolid · Spanish only","p26":"La Rioja · Spanish only","p24":"León · Spanish only","p16":"Cuenca · Spanish only","p21":"Huelva · Spanish only","p23":"Jaén · Spanish only","p13":"Ciudad Real · Spanish only","p41":"Seville · Spanish only","p03":"Valencian · Alicante","p03es":"Alicante · Spanish only","p33":"Asturias · Spanish only","p46":"Valencian · Valencia","ifo":"Balearic · Formentera","iei":"Balearic · Ibiza","p20":"Basque · Gipuzkoa","p19":"Guadalajara · Spanish only","p02":"Albacete · Spanish only","p10":"Cáceres · Spanish only","p25":"Catalan · Lleida","p17":"Catalan · Girona","p45":"Toledo · Spanish only","p46es":"Valencia · Spanish only","p06":"Badajoz · Spanish only","p32":"Galician · Ourense","p12":"Valencian · Castellón","p25oc":"Aranese · Lleida","p12es":"Castellón · Spanish only","p43":"Catalan · Tarragona","p31eu":"Basque · Navarre","p15":"Galician · A Coruña","p27":"Galician · Lugo","p36":"Galician · Pontevedra","p28":"Madrid · Spanish only","p30":"Murcia · Spanish only","p01":"Basque · Álava","p51":"Ceuta · Spanish only","p52":"Melilla · Spanish only","itf":"Tenerife · Spanish only","ilp":"La Palma · Spanish only","ihi":"El Hierro · Spanish only","igo":"La Gomera · Spanish only","igc":"Gran Canaria · Spanish only","ifv":"Fuerteventura · Spanish only","ilz":"Lanzarote · Spanish only"}},
    },
    {
      key: "roads",
      label: "Road prefixes",
      noun: ["prefix","prefixes"],
      prompt: "dial",
      merge: false,
      dim: false,
      labelPerArea: true,
      areaRank: false,
      flashArea: true,
      groups: [["Galicia","",["AG","VG","AC","DP","LU","OU","PO","EP"]],["Asturias","",["AS"]],["Basque Country","",["BI"]],["Navarre","",["NA"]],["La Rioja","",["LR"]],["Aragon","",["HU-V","TE"]],["Catalonia","",["C","B","BV","BP","GI","GIV","GIP","L","LV","T","TV","TP"]],["Castile and León","",["CL","AV","BU","LE","P","PP","SA","DSA","SG","SO","VA","VP","ZA"]],["Madrid","",["M"]],["Castilla-La Mancha","",["CM","AB","CR","CU-V","GU","TO"]],["Extremadura","",["EX","BA","CC"]],["Valencian Community","",["CV"]],["Murcia","",["RM"]],["Andalusia","",["A","AL","CA","CO","GR","HU","JA","JV","MA","SE"]],["Balearic Islands","",["Ma","Me","EI","PM"]],["Canary Islands","",["TF","GC","LZ","FV","LP","GM","HI"]],["Melilla","",["ML"]]],
      areas: {"x":{"AG":["p15","p27","p32","p36"],"VG":["p15","p27","p32","p36"],"AC":["p15"],"DP":["p15"],"LU":["p27"],"OU":["p32"],"PO":["p36"],"EP":["p36"],"AS":["p33"],"BI":["p48"],"NA":["p31","p31eu"],"LR":["p26"],"HU-V":["p22"],"TE":["p44"],"C":["p08","p17","p25","p25oc","p43"],"B":["p08"],"BV":["p08"],"BP":["p08"],"GI":["p17","p20"],"GIV":["p17"],"GIP":["p17"],"L":["p25","p25oc"],"LV":["p25","p25oc"],"T":["p43"],"TV":["p43"],"TP":["p43"],"CL":["p05","p09","p24","p34","p37","p40","p42","p47","p49"],"AV":["p05"],"BU":["p09"],"LE":["p24"],"P":["p34"],"PP":["p34"],"SA":["p37"],"DSA":["p37"],"SG":["p40"],"SO":["p42"],"VA":["p47"],"VP":["p47"],"ZA":["p49"],"M":["p28"],"CM":["p02","p13","p16","p19","p45"],"AB":["p02"],"CR":["p13"],"CU-V":["p16"],"GU":["p19"],"TO":["p45"],"EX":["p06","p10"],"BA":["p06"],"CC":["p10"],"CV":["p03","p03es","p12","p12es","p46","p46es","p50","igo"],"RM":["p30"],"A":["p04","p11","p14","p18","p21","p23","p29","p41","p22","p44","p50","p01"],"AL":["p04"],"CA":["p11","p39"],"CO":["p14"],"GR":["p18"],"HU":["p21","p22"],"JA":["p23"],"JV":["p23"],"MA":["p29"],"SE":["p41"],"Ma":["ima"],"Me":["ime"],"EI":["iei"],"PM":["ifo"],"TF":["itf"],"GC":["igc"],"LZ":["ilz"],"FV":["ifv"],"LP":["ilp","p25","p25oc"],"GM":["igo"],"HI":["ihi"],"ML":["p52"]}},
      name: "{id}-",
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"AG":"Galicia","VG":"Galicia","AC":"A Coruña","DP":"A Coruña","LU":"Lugo","OU":"Ourense","PO":"Pontevedra","EP":"Pontevedra","AS":"Asturias","BI":"Biscay","NA":"Navarre","LR":"La Rioja","HU-V":"Huesca","TE":"Teruel","C":"Catalonia","B":"Barcelona","BV":"Barcelona","BP":"Barcelona","GI":"Girona, Gipuzkoa","GIV":"Girona","GIP":"Girona","L":"Lleida","LV":"Lleida","T":"Tarragona","TV":"Tarragona","TP":"Tarragona","CL":"Castile and León","AV":"Ávila","BU":"Burgos","LE":"León","P":"Palencia","PP":"Palencia","SA":"Salamanca","DSA":"Salamanca","SG":"Segovia","SO":"Soria","VA":"Valladolid","VP":"Valladolid","ZA":"Zamora","M":"Madrid","CM":"Castilla-La Mancha","AB":"Albacete","CR":"Ciudad Real","CU-V":"Cuenca","GU":"Guadalajara","TO":"Toledo","EX":"Extremadura","BA":"Badajoz","CC":"Cáceres","CV":"Valencian Community, Zaragoza, La Gomera","RM":"Murcia","A":"Andalusia, Aragon, Álava","AL":"Almería","CA":"Cantabria, Cádiz","CO":"Córdoba","GR":"Granada","HU":"Huelva, Huesca","JA":"Jaén","JV":"Jaén","MA":"Málaga","SE":"Seville","Ma":"Mallorca","Me":"Menorca","EI":"Ibiza","PM":"Formentera","TF":"Tenerife","GC":"Gran Canaria","LZ":"Lanzarote","FV":"Fuerteventura","LP":"La Palma, Lleida","GM":"La Gomera","HI":"El Hierro","ML":"Melilla"}},
      about: {"t":["{chipTitle}"],"x":{"LU":["Lugo","LU-, LU-P-"],"TE":["Teruel","TE-, TE-V-"],"AV":["Ávila","AV-, AV-P-"],"BU":["Burgos","BU-, BU-V-, BU-P-"],"SG":["Segovia","SG-, SG-V-, SG-P-"],"SO":["Soria","SO-, SO-P-"],"ZA":["Zamora","ZA-, ZA-P-, ZA-L-, ZA-V-"],"CU-V":["Cuenca","CU-V-, CUV-"],"EX":["Extremadura","EX-, EX-A-"],"RM":["Murcia","RM-, RM-A- … RM-F-"],"PM":["Formentera","PM-820, PMV-"]}},
      dial: {"t":[["{name}","hot"]]},
      primary: {"x":{"p44":"A","p22":"A","p50":"A","p25":"LP","p25oc":"LP"}},
      clicked: {"x":{"p04":"Almería · A- AL-","ima":"Mallorca · Ma-","ime":"Menorca · Me-","p09":"Burgos · CL- BU-","p44":"Teruel · A- TE-","p39":"Cantabria · CA-","p08":"Barcelona · C- B- BV- BP-","p48":"Biscay · BI-","p42":"Soria · CL- SO-","p29":"Málaga · A- MA-","p22":"Huesca · A- HU- HU-V-","p11":"Cádiz · A- CA-","p05":"Ávila · CL- AV-","p14":"Córdoba · A- CO-","p34":"Palencia · CL- P- PP-","p37":"Salamanca · CL- SA- DSA-","p50":"Zaragoza · A- CV-","p18":"Granada · A- GR-","p49":"Zamora · CL- ZA-","p31":"Navarre · NA-","p40":"Segovia · CL- SG-","p47":"Valladolid · CL- VA- VP-","p26":"La Rioja · LR-","p24":"León · CL- LE-","p16":"Cuenca · CM- CU-V-","p21":"Huelva · A- HU-","p23":"Jaén · A- JA- JV-","p13":"Ciudad Real · CM- CR-","p41":"Seville · A- SE-","p03":"Alicante · CV-","p03es":"Alicante · CV-","p33":"Asturias · AS-","p46":"Valencia · CV-","ifo":"Formentera · PM-","iei":"Ibiza · EI-","p20":"Gipuzkoa · GI-","p19":"Guadalajara · CM- GU-","p02":"Albacete · CM- AB-","p10":"Cáceres · EX- CC-","p25":"Lleida · LP- C- L- LV-","p17":"Girona · C- GI- GIV- GIP-","p45":"Toledo · CM- TO-","p46es":"Valencia · CV-","p06":"Badajoz · EX- BA-","p32":"Ourense · AG- VG- OU-","p12":"Castellón · CV-","p25oc":"Lleida · LP- C- L- LV-","p12es":"Castellón · CV-","p43":"Tarragona · C- T- TV- TP-","p31eu":"Navarre · NA-","p15":"A Coruña · AG- VG- AC- DP-","p27":"Lugo · AG- VG- LU-","p36":"Pontevedra · AG- VG- PO- EP-","p28":"Madrid · M-","p30":"Murcia · RM-","p01":"Álava · A-","p51":"Ceuta · state roads only","p52":"Melilla · ML-","itf":"Tenerife · TF-","ilp":"La Palma · LP-","ihi":"El Hierro · HI-","igo":"La Gomera · CV- GM-","igc":"Gran Canaria · GC-","ifv":"Fuerteventura · FV-","ilz":"Lanzarote · LZ-"}},
    },
  ],
  g: "{@ccaa}",
  explore: {"x":{"p04":{"code":"04","title":"Almería","sub":["Andalusia","A- AL-"]},"ima":{"code":"07","title":"Mallorca","sub":["Balearic Islands","Balearic Islands","Balearic","Ma-"]},"ime":{"code":"07","title":"Menorca","sub":["Balearic Islands","Balearic Islands","Balearic","Me-"]},"p09":{"code":"09","title":"Burgos","sub":["Castile and León","CL- BU-"]},"p44":{"code":"44","title":"Teruel","sub":["Aragon","A- TE-"]},"p39":{"code":"39","title":"Cantabria","sub":["Cantabria","CA-"]},"p08":{"code":"08","title":"Barcelona","sub":["Catalonia","Catalan","C- B- BV- BP-"]},"p48":{"code":"48","title":"Biscay","sub":["Basque Country","Basque","BI-"]},"p42":{"code":"42","title":"Soria","sub":["Castile and León","CL- SO-"]},"p29":{"code":"29","title":"Málaga","sub":["Andalusia","A- MA-"]},"p22":{"code":"22","title":"Huesca","sub":["Aragon","A- HU- HU-V-"]},"p11":{"code":"11","title":"Cádiz","sub":["Andalusia","A- CA-"]},"p05":{"code":"05","title":"Ávila","sub":["Castile and León","CL- AV-"]},"p14":{"code":"14","title":"Córdoba","sub":["Andalusia","A- CO-"]},"p34":{"code":"34","title":"Palencia","sub":["Castile and León","CL- P- PP-"]},"p37":{"code":"37","title":"Salamanca","sub":["Castile and León","CL- SA- DSA-"]},"p50":{"code":"50","title":"Zaragoza","sub":["Aragon","A- CV-"]},"p18":{"code":"18","title":"Granada","sub":["Andalusia","A- GR-"]},"p49":{"code":"49","title":"Zamora","sub":["Castile and León","CL- ZA-"]},"p31":{"code":"31","title":"Navarre","sub":["Navarre","NA-"]},"p40":{"code":"40","title":"Segovia","sub":["Castile and León","CL- SG-"]},"p47":{"code":"47","title":"Valladolid","sub":["Castile and León","CL- VA- VP-"]},"p26":{"code":"26","title":"La Rioja","sub":["La Rioja","LR-"]},"p24":{"code":"24","title":"León","sub":["Castile and León","CL- LE-"]},"p16":{"code":"16","title":"Cuenca","sub":["Castilla-La Mancha","CM- CU-V-"]},"p21":{"code":"21","title":"Huelva","sub":["Andalusia","A- HU-"]},"p23":{"code":"23","title":"Jaén","sub":["Andalusia","A- JA- JV-"]},"p13":{"code":"13","title":"Ciudad Real","sub":["Castilla-La Mancha","CM- CR-"]},"p41":{"code":"41","title":"Seville","sub":["Andalusia","A- SE-"]},"p03":{"code":"03","title":"Alicante","sub":["Valencian Community","Valencian","CV-"]},"p03es":{"code":"03","title":"Alicante","sub":["Valencian Community","CV-"]},"p33":{"code":"33","title":"Asturias","sub":["Asturias","AS-"]},"p46":{"code":"46","title":"Valencia","sub":["Valencian Community","Valencian","CV-"]},"ifo":{"code":"07","title":"Formentera","sub":["Balearic Islands","Balearic Islands","Balearic","PM-"]},"iei":{"code":"07","title":"Ibiza","sub":["Balearic Islands","Balearic Islands","Balearic","EI-"]},"p20":{"code":"20","title":"Gipuzkoa","sub":["Basque Country","Basque","GI-"]},"p19":{"code":"19","title":"Guadalajara","sub":["Castilla-La Mancha","CM- GU-"]},"p02":{"code":"02","title":"Albacete","sub":["Castilla-La Mancha","CM- AB-"]},"p10":{"code":"10","title":"Cáceres","sub":["Extremadura","EX- CC-"]},"p25":{"code":"25","title":"Lleida","sub":["Catalonia","Catalan","LP- C- L- LV-"]},"p17":{"code":"17","title":"Girona","sub":["Catalonia","Catalan","C- GI- GIV- GIP-"]},"p45":{"code":"45","title":"Toledo","sub":["Castilla-La Mancha","CM- TO-"]},"p46es":{"code":"46","title":"Valencia","sub":["Valencian Community","CV-"]},"p06":{"code":"06","title":"Badajoz","sub":["Extremadura","EX- BA-"]},"p32":{"code":"32","title":"Ourense","sub":["Galicia","Galician","AG- VG- OU-"]},"p12":{"code":"12","title":"Castellón","sub":["Valencian Community","Valencian","CV-"]},"p25oc":{"code":"25","title":"Lleida","sub":["Catalonia","Aranese","LP- C- L- LV-"]},"p12es":{"code":"12","title":"Castellón","sub":["Valencian Community","CV-"]},"p43":{"code":"43","title":"Tarragona","sub":["Catalonia","Catalan","C- T- TV- TP-"]},"p31eu":{"code":"31","title":"Navarre","sub":["Navarre","Basque","NA-"]},"p15":{"code":"15","title":"A Coruña","sub":["Galicia","Galician","AG- VG- AC- DP-"]},"p27":{"code":"27","title":"Lugo","sub":["Galicia","Galician","AG- VG- LU-"]},"p36":{"code":"36","title":"Pontevedra","sub":["Galicia","Galician","AG- VG- PO- EP-"]},"p28":{"code":"28","title":"Madrid","sub":["Madrid","M-"]},"p30":{"code":"30","title":"Murcia","sub":["Murcia","RM-"]},"p01":{"code":"01","title":"Álava","sub":["Basque Country","Basque","A-"]},"p51":{"code":"51","title":"Ceuta","sub":["Ceuta"]},"p52":{"code":"52","title":"Melilla","sub":["Melilla","ML-"]},"itf":{"code":"38","title":"Tenerife","sub":["Santa Cruz de Tenerife","Canary Islands","TF-"]},"ilp":{"code":"38","title":"La Palma","sub":["Santa Cruz de Tenerife","Canary Islands","LP-"]},"ihi":{"code":"38","title":"El Hierro","sub":["Santa Cruz de Tenerife","Canary Islands","HI-"]},"igo":{"code":"38","title":"La Gomera","sub":["Santa Cruz de Tenerife","Canary Islands","CV- GM-"]},"igc":{"code":"35","title":"Gran Canaria","sub":["Las Palmas","Canary Islands","GC-"]},"ifv":{"code":"35","title":"Fuerteventura","sub":["Las Palmas","Canary Islands","FV-"]},"ilz":{"code":"35","title":"Lanzarote","sub":["Las Palmas","Canary Islands","LZ-"]}}},
};
