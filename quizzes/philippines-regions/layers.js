// Philippines Regions. Island groups, the 18 regions and the 82 provinces (plus
// Metro Manila as one target) on one map. Map areas (data.js): COD-AB v03 provinces; Bacoor and San Pedro are cut out
// of Cavite and Laguna for the area-code page (../philippines-codes) and count as part of their province here. The City
// of Isabela (Region IX) and the Special Geographic Area (Bangsamoro) belong to no province.
// Regions as of 2025: Negros Island Region re-created by RA 12000 (June 2024: Negros Occidental, Negros Oriental,
// Siquijor); Sulu excluded from Bangsamoro by the Supreme Court (G.R. 242255, 2024) and placed in Region IX by EO 91
// (30 July 2025). Island groups by region as in Wikipedia "Regions of the Philippines".

const LAYERS = {
  key: "phregions",
  borders: "[DATA.rb]",
  size: [1000,1365],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.22,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[4.6,116.9],[21.1,126.6]],"maxBounds":[[0,110],[25,133]]},
  hintLabel: "Color by region",
  exploreKind: "provinces",
  kinds: [
    {
      key: "islands",
      label: "Island groups",
      noun: ["island group","island groups"],
      prompt: "name",
      groups: [["Island groups","",["L","V","M"]]],
      areas: "@isl",
      name: {"x":{"L":"Luzon","V":"Visayas","M":"Mindanao"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"L":"Metro Manila, Cordillera, Ilocos Region, Cagayan Valley, Central Luzon, Calabarzon, Mimaropa, Bicol Region","V":"Western Visayas, Negros Island Region, Central Visayas, Eastern Visayas","M":"Zamboanga Peninsula, Northern Mindanao, Davao Region, Soccsksargen, Caraga, Bangsamoro"}},
      about: "{chipTitle}",
      clicked: {"t":"{name} ({@n})","x":{"0402103":"Luzon (Cavite)","0403425":"Luzon (Laguna)"}},
    },
    {
      key: "regions",
      label: "Regions",
      noun: ["region","regions"],
      prompt: "name",
      groups: [["Luzon","",["NCR","CAR","I","II","III","IVA","MIMAROPA","V"]],["Visayas","",["VI","NIR","VII","VIII"]],["Mindanao","",["IX","X","XI","XII","XIII","BARMM"]]],
      areas: "@reg",
      name: {"x":{"NCR":"Metro Manila (NCR)","CAR":"Cordillera (CAR)","I":"Ilocos Region (Region I)","II":"Cagayan Valley (Region II)","III":"Central Luzon (Region III)","IVA":"Calabarzon (Region IV-A)","MIMAROPA":"Mimaropa","V":"Bicol Region (Region V)","VI":"Western Visayas (Region VI)","NIR":"Negros Island Region (NIR)","VII":"Central Visayas (Region VII)","VIII":"Eastern Visayas (Region VIII)","IX":"Zamboanga Peninsula (Region IX)","X":"Northern Mindanao (Region X)","XI":"Davao Region (Region XI)","XII":"Soccsksargen (Region XII)","XIII":"Caraga (Region XIII)","BARMM":"Bangsamoro (BARMM)"}},
      short: {"x":{"NCR":"Metro Manila","CAR":"Cordillera","I":"Ilocos Region","II":"Cagayan Valley","III":"Central Luzon","IVA":"Calabarzon","MIMAROPA":"Mimaropa","V":"Bicol Region","VI":"Western Visayas","NIR":"Negros Island Region","VII":"Central Visayas","VIII":"Eastern Visayas","IX":"Zamboanga Peninsula","X":"Northern Mindanao","XI":"Davao Region","XII":"Soccsksargen","XIII":"Caraga","BARMM":"Bangsamoro"}},
      chip: "{short}",
      chipTitle: {"x":{"NCR":"NCR","CAR":"CAR","I":"Region I","II":"Region II","III":"Region III","IVA":"Region IV-A","MIMAROPA":"Southwestern Tagalog Region","V":"Region V","VI":"Region VI","NIR":"NIR","VII":"Region VII","VIII":"Region VIII","IX":"Region IX","X":"Region X","XI":"Region XI","XII":"Region XII","XIII":"Region XIII","BARMM":"BARMM"}},
      about: {"x":{"NCR":["Luzon","Metro Manila"],"CAR":["Luzon","Abra, Apayao, Benguet, Ifugao, Kalinga, Mountain Province"],"I":["Luzon","Ilocos Norte, Ilocos Sur, La Union, Pangasinan"],"II":["Luzon","Batanes, Cagayan, Isabela, Nueva Vizcaya, Quirino"],"III":["Luzon","Aurora, Bataan, Bulacan, Nueva Ecija, Pampanga, Tarlac, Zambales"],"IVA":["Luzon","Batangas, Cavite, Laguna, Quezon, Rizal"],"MIMAROPA":["Luzon","Marinduque, Occidental Mindoro, Oriental Mindoro, Palawan, Romblon"],"V":["Luzon","Albay, Camarines Norte, Camarines Sur, Catanduanes, Masbate, Sorsogon"],"VI":["Visayas","Aklan, Antique, Capiz, Guimaras, Iloilo"],"NIR":["Visayas","Negros Occidental, Negros Oriental, Siquijor"],"VII":["Visayas","Bohol, Cebu"],"VIII":["Visayas","Biliran, Eastern Samar, Leyte, Northern Samar, Samar, Southern Leyte"],"IX":["Mindanao","Sulu, Zamboanga del Norte, Zamboanga del Sur, Zamboanga Sibugay"],"X":["Mindanao","Bukidnon, Camiguin, Lanao del Norte, Misamis Occidental, Misamis Oriental"],"XI":["Mindanao","Davao de Oro, Davao del Norte, Davao del Sur, Davao Occidental, Davao Oriental"],"XII":["Mindanao","Cotabato, Sarangani, South Cotabato, Sultan Kudarat"],"XIII":["Mindanao","Agusan del Norte, Agusan del Sur, Dinagat Islands, Surigao del Norte, Surigao del Sur"],"BARMM":["Mindanao","Basilan, Lanao del Sur, Maguindanao del Norte, Maguindanao del Sur, Tawi-Tawi"]}},
      clicked: {"t":"{name}: {@n}","x":{"0402103":"Calabarzon (Region IV-A): Cavite","0403425":"Calabarzon (Region IV-A): Laguna"}},
    },
    {
      key: "provinces",
      label: "Provinces",
      noun: ["province","provinces"],
      prompt: "name",
      groups: [["Metro Manila","NCR",["13"]],["Cordillera","CAR",["14001","14081","14011","14027","14032","14044"]],["Ilocos Region","Region I",["01028","01029","01033","01055"]],["Cagayan Valley","Region II",["02009","02015","02031","02050","02057"]],["Central Luzon","Region III",["03077","03008","03014","03049","03054","03069","03071"]],["Calabarzon","Region IV-A",["04010","04021","04034","04056","04058"]],["Mimaropa","Southwestern Tagalog Region",["17040","17051","17052","17053","17059"]],["Bicol Region","Region V",["05005","05016","05017","05020","05041","05062"]],["Western Visayas","Region VI",["06004","06006","06019","06079","06030"]],["Negros Island Region","NIR",["06045","07046","07061"]],["Central Visayas","Region VII",["07012","07022"]],["Eastern Visayas","Region VIII",["08078","08026","08037","08048","08060","08064"]],["Zamboanga Peninsula","Region IX",["19066","09072","09073","09083"]],["Northern Mindanao","Region X",["10013","10018","10035","10042","10043"]],["Davao Region","Region XI",["11082","11023","11024","11086","11025"]],["Soccsksargen","Region XII",["12047","12080","12063","12065"]],["Caraga","Region XIII",["16002","16003","16085","16067","16068"]],["Bangsamoro","BARMM",["19007","19036","19087","19088","19070"]]],
      areas: "@pv",
      name: {"t":"{@n}","x":{"04021":"Cavite","04034":"Laguna"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"t":"{group} ({groupSub})","x":{"17040":"Mimaropa","17051":"Mimaropa","17052":"Mimaropa","17053":"Mimaropa","17059":"Mimaropa"}},
      about: {"x":{"13":["Metro Manila (NCR) · Luzon","Area code 02"],"10013":["Northern Mindanao (Region X) · Mindanao","Area code 088"],"10018":["Northern Mindanao (Region X) · Mindanao","Area code 088"],"10035":["Northern Mindanao (Region X) · Mindanao","Area code 063"],"10042":["Northern Mindanao (Region X) · Mindanao","Area code 088"],"10043":["Northern Mindanao (Region X) · Mindanao","Area code 088"],"11023":["Davao Region (Region XI) · Mindanao","Area code 084"],"11024":["Davao Region (Region XI) · Mindanao","Area code 082"],"11025":["Davao Region (Region XI) · Mindanao","Area code 087"],"11082":["Davao Region (Region XI) · Mindanao","Area code 087"],"11086":["Davao Region (Region XI) · Mindanao","Area code 082"],"12047":["Soccsksargen (Region XII) · Mindanao","Area code 064"],"12063":["Soccsksargen (Region XII) · Mindanao","Area code 083"],"12065":["Soccsksargen (Region XII) · Mindanao","Area code 064"],"12080":["Soccsksargen (Region XII) · Mindanao","Area code 083"],"14001":["Cordillera (CAR) · Luzon","Area code 074"],"14011":["Cordillera (CAR) · Luzon","Area code 074"],"14027":["Cordillera (CAR) · Luzon","Area code 074"],"14032":["Cordillera (CAR) · Luzon","Area code 074"],"14044":["Cordillera (CAR) · Luzon","Area code 074"],"14081":["Cordillera (CAR) · Luzon","Area code 074"],"16002":["Caraga (Region XIII) · Mindanao","Area code 085"],"16003":["Caraga (Region XIII) · Mindanao","Area code 085"],"16067":["Caraga (Region XIII) · Mindanao","Area code 086"],"16068":["Caraga (Region XIII) · Mindanao","Area code 086"],"16085":["Caraga (Region XIII) · Mindanao","Area code 086"],"17040":["Mimaropa · Luzon","Area code 042"],"17051":["Mimaropa · Luzon","Area code 043"],"17052":["Mimaropa · Luzon","Area code 043"],"17053":["Mimaropa · Luzon","Area code 048"],"17059":["Mimaropa · Luzon","Area code 042"],"19007":["Bangsamoro (BARMM) · Mindanao","Area code 062"],"19036":["Bangsamoro (BARMM) · Mindanao","Area code 063"],"19066":["Zamboanga Peninsula (Region IX) · Mindanao","Area code 068"],"19070":["Bangsamoro (BARMM) · Mindanao","Area code 068"],"19087":["Bangsamoro (BARMM) · Mindanao","Area code 064"],"19088":["Bangsamoro (BARMM) · Mindanao","Area code 064"],"01028":["Ilocos Region (Region I) · Luzon","Area code 077"],"01029":["Ilocos Region (Region I) · Luzon","Area code 077"],"01033":["Ilocos Region (Region I) · Luzon","Area code 072"],"01055":["Ilocos Region (Region I) · Luzon","Area code 075"],"02009":["Cagayan Valley (Region II) · Luzon","Area code 078"],"02015":["Cagayan Valley (Region II) · Luzon","Area code 078"],"02031":["Cagayan Valley (Region II) · Luzon","Area code 078"],"02050":["Cagayan Valley (Region II) · Luzon","Area code 078"],"02057":["Cagayan Valley (Region II) · Luzon","Area code 078"],"03077":["Central Luzon (Region III) · Luzon","Area code 042"],"03008":["Central Luzon (Region III) · Luzon","Area code 047"],"03014":["Central Luzon (Region III) · Luzon","Area code 044"],"03049":["Central Luzon (Region III) · Luzon","Area code 044"],"03054":["Central Luzon (Region III) · Luzon","Area code 045"],"03069":["Central Luzon (Region III) · Luzon","Area code 045"],"03071":["Central Luzon (Region III) · Luzon","Area code 047"],"04010":["Calabarzon (Region IV-A) · Luzon","Area code 043"],"04021":["Calabarzon (Region IV-A) · Luzon","Area code 046 / 02"],"04034":["Calabarzon (Region IV-A) · Luzon","Area code 049 / 02"],"04056":["Calabarzon (Region IV-A) · Luzon","Area code 042"],"04058":["Calabarzon (Region IV-A) · Luzon","Area code 02"],"05005":["Bicol Region (Region V) · Luzon","Area code 052"],"05016":["Bicol Region (Region V) · Luzon","Area code 054"],"05017":["Bicol Region (Region V) · Luzon","Area code 054"],"05020":["Bicol Region (Region V) · Luzon","Area code 052"],"05041":["Bicol Region (Region V) · Luzon","Area code 056"],"05062":["Bicol Region (Region V) · Luzon","Area code 056"],"06004":["Western Visayas (Region VI) · Visayas","Area code 036"],"06006":["Western Visayas (Region VI) · Visayas","Area code 036"],"06019":["Western Visayas (Region VI) · Visayas","Area code 036"],"06079":["Western Visayas (Region VI) · Visayas","Area code 033"],"06030":["Western Visayas (Region VI) · Visayas","Area code 033"],"06045":["Negros Island Region (NIR) · Visayas","Area code 034"],"07046":["Negros Island Region (NIR) · Visayas","Area code 035"],"07061":["Negros Island Region (NIR) · Visayas","Area code 035"],"07012":["Central Visayas (Region VII) · Visayas","Area code 038"],"07022":["Central Visayas (Region VII) · Visayas","Area code 032"],"08078":["Eastern Visayas (Region VIII) · Visayas","Area code 053"],"08026":["Eastern Visayas (Region VIII) · Visayas","Area code 055"],"08037":["Eastern Visayas (Region VIII) · Visayas","Area code 053"],"08048":["Eastern Visayas (Region VIII) · Visayas","Area code 055"],"08060":["Eastern Visayas (Region VIII) · Visayas","Area code 055"],"08064":["Eastern Visayas (Region VIII) · Visayas","Area code 053"],"09072":["Zamboanga Peninsula (Region IX) · Mindanao","Area code 065"],"09073":["Zamboanga Peninsula (Region IX) · Mindanao","Area code 062"],"09083":["Zamboanga Peninsula (Region IX) · Mindanao","Area code 062"]}},
      clicked: {"t":"{@n}","x":{"0402103":"Cavite","0403425":"Laguna"}},
    },
  ],
  g: "{@reg}",
  explore: {"t":{"code":"0{@k}","title":"{@n}","sub":["{provinces.about0}"]},"x":{"19099":{"code":"064","title":"Special Geographic Area","sub":["Bangsamoro (BARMM) · Mindanao","Not part of a province"]},"0402103":{"code":"02","title":"Cavite","sub":["Calabarzon (Region IV-A) · Luzon"]},"0403425":{"code":"02","title":"Laguna","sub":["Calabarzon (Region IV-A) · Luzon"]},"09097":{"code":"062","title":"City of Isabela","sub":["Zamboanga Peninsula (Region IX) · Mindanao","Not part of a province"]}}},
};
