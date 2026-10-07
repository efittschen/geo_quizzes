// Philippines Area Codes, on the province areas of ../philippines-regions/data.js.
// Landline area codes (dialed 0 + code): 2 for Metro Manila, Rizal, Bacoor (Cavite) and San Pedro (Laguna); every
// other code covers one or more whole provinces. Codes by province: Wikipedia "Telephone numbers in the Philippines"
// (citing the Directories Philippines Yellow Pages, 2024); checked against the ITU numbering notice (2003, locality
// list) and Wikidata's dialing code (P473) of every city and municipality, which agree apart from Bacoor (46 in 2003).
// Mobile numbers (09xx) carry no place.

const LAYERS = {
  key: "phcodes",
  size: [1000,1365],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.3,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[4.6,116.9],[21.1,126.6]],"maxBounds":[[0,110],[25,133]]},
  hintLabel: "Color by area code",
  exploreKind: "codes",
  kinds: [
    {
      key: "codes",
      label: "Area codes",
      noun: ["code","codes"],
      prompt: "dial",
      groups: [["02","Metro Manila and Rizal",["2"]],["03x","Western and Central Visayas",["32","33","34","35","36","38"]],["04x","Central Luzon and Southern Tagalog",["42","43","44","45","46","47","48","49"]],["05x","Bicol and Eastern Visayas",["52","53","54","55","56"]],["06x","Western and Central Mindanao",["62","63","64","65","68"]],["07x","Northern Luzon",["72","74","75","77","78"]],["08x","Northern, Eastern and Southern Mindanao",["82","83","84","85","86","87","88"]]],
      areas: "@k",
      name: "0{@k}",
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"2":"Bacoor (Cavite), San Pedro (Laguna), Rizal, Metro Manila","32":"Cebu","33":"Iloilo, Guimaras","34":"Negros Occidental","35":"Negros Oriental, Siquijor","36":"Aklan, Antique, Capiz","38":"Bohol","42":"Aurora, Quezon, Marinduque, Romblon","43":"Batangas, Occidental Mindoro, Oriental Mindoro","44":"Bulacan, Nueva Ecija","45":"Pampanga, Tarlac","46":"Cavite","47":"Bataan, Zambales","48":"Palawan","49":"Laguna","52":"Albay, Catanduanes","53":"Leyte, Southern Leyte, Biliran","54":"Camarines Norte, Camarines Sur","55":"Eastern Samar, Northern Samar, Samar","56":"Masbate, Sorsogon","62":"Zamboanga del Sur, Zamboanga Sibugay, City of Isabela, Basilan","63":"Lanao del Norte, Lanao del Sur","64":"Cotabato, Sultan Kudarat, Maguindanao del Norte, Maguindanao del Sur, Special Geographic Area","65":"Zamboanga del Norte","68":"Sulu, Tawi-Tawi","72":"La Union","74":"Abra, Benguet, Ifugao, Kalinga, Mountain Province, Apayao","75":"Pangasinan","77":"Ilocos Norte, Ilocos Sur","78":"Batanes, Cagayan, Isabela, Nueva Vizcaya, Quirino","82":"Davao del Sur, Davao Occidental","83":"South Cotabato, Sarangani","84":"Davao del Norte","85":"Agusan del Norte, Agusan del Sur","86":"Surigao del Norte, Surigao del Sur, Dinagat Islands","87":"Davao Oriental, Davao de Oro","88":"Bukidnon, Camiguin, Misamis Occidental, Misamis Oriental"}},
      detail: ["Show island group",{"x":{"2":"Luzon","32":"Visayas","33":"Visayas","34":"Visayas","35":"Visayas","36":"Visayas","38":"Visayas","42":"Luzon","43":"Luzon","44":"Luzon","45":"Luzon","46":"Luzon","47":"Luzon","48":"Luzon","49":"Luzon","52":"Luzon","53":"Visayas","54":"Luzon","55":"Visayas","56":"Luzon","62":"Mindanao","63":"Mindanao","64":"Mindanao","65":"Mindanao","68":"Mindanao","72":"Luzon","74":"Luzon","75":"Luzon","77":"Luzon","78":"Luzon","82":"Mindanao","83":"Mindanao","84":"Mindanao","85":"Mindanao","86":"Mindanao","87":"Mindanao","88":"Mindanao"}}],
      about: {"t":["{chipTitle}"],"x":{"2":["Bacoor (Cavite), San Pedro (Laguna), Rizal, Metro Manila","Quezon City"],"32":["Cebu","Cebu City"],"33":["Iloilo, Guimaras","Iloilo City"],"34":["Negros Occidental","Bacolod"],"44":["Bulacan, Nueva Ecija","San Jose del Monte"],"45":["Pampanga, Tarlac","Angeles"],"46":["Cavite","Imus"],"49":["Laguna","Calamba"],"62":["Zamboanga del Sur, Zamboanga Sibugay, City of Isabela, Basilan","Zamboanga City"],"63":["Lanao del Norte, Lanao del Sur","Iligan"],"64":["Cotabato, Sultan Kudarat, Maguindanao del Norte, Maguindanao del Sur, Special Geographic Area","Cotabato City"],"74":["Abra, Benguet, Ifugao, Kalinga, Mountain Province, Apayao","Baguio"],"82":["Davao del Sur, Davao Occidental","Davao City"],"83":["South Cotabato, Sarangani","General Santos"],"85":["Agusan del Norte, Agusan del Sur","Butuan"],"88":["Bukidnon, Camiguin, Misamis Occidental, Misamis Oriental","Cagayan de Oro"]}},
      clicked: {"t":"{name} {@n}","x":{"0402103":"02 Bacoor (Cavite)","0403425":"02 San Pedro (Laguna)"}},
      presets: [["Big cities",["2","32","33","34","44","45","46","49","62","63","64","74","82","83","85","88"]]],
    },
    {
      key: "digit1",
      label: "First digit",
      noun: ["zone","zones"],
      prompt: "dial",
      hints: false,
      groups: [["Zones","area codes by first digit",["2","3","4","5","6","7","8"]]],
      areas: {"x":{"2":["0402103","0403425","04058","13"],"3":["07022","06030","06079","06045","07046","07061","06004","06006","06019","07012"],"4":["03077","04056","17040","17059","04010","17051","17052","03014","03049","03054","03069","04021","03008","03071","17053","04034"],"5":["05005","05020","08037","08064","08078","05016","05017","08026","08048","08060","05041","05062"],"6":["09073","09083","09097","19007","10035","19036","12047","12065","19087","19088","19099","09072","19066","19070"],"7":["01033","14001","14011","14027","14032","14044","14081","01055","01028","01029","02009","02015","02031","02050","02057"],"8":["11024","11086","12063","12080","11023","16002","16003","16067","16068","16085","11025","11082","10013","10018","10042","10043"]}},
      name: {"t":"0{id}x","x":{"2":"02"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"2":"Metro Manila and Rizal","3":"Western and Central Visayas","4":"Central Luzon and Southern Tagalog","5":"Bicol and Eastern Visayas","6":"Western and Central Mindanao","7":"Northern Luzon","8":"Northern, Eastern and Southern Mindanao"}},
      about: {"x":{"2":["Metro Manila and Rizal","02"],"3":["Western and Central Visayas","032, 033, 034, 035, 036, 038"],"4":["Central Luzon and Southern Tagalog","042, 043, 044, 045, 046, 047, 048, 049"],"5":["Bicol and Eastern Visayas","052, 053, 054, 055, 056"],"6":["Western and Central Mindanao","062, 063, 064, 065, 068"],"7":["Northern Luzon","072, 074, 075, 077, 078"],"8":["Northern, Eastern and Southern Mindanao","082, 083, 084, 085, 086, 087, 088"]}},
      dial: {"t":[["0","cold"],["{id}","hot"],["x","cold"]],"x":{"2":[["0","cold"],["2","hot"]]}},
      clicked: "{name} {chipTitle}",
    },
  ],
  g: "{@k}",
  explore: {"t":{"code":"{codes.name}","title":"{@n}","sub":["{digit1.about0}"]},"x":{"13":{"code":"02","title":"Metro Manila","sub":["Metro Manila and Rizal","Quezon City"]},"10013":{"code":"088","title":"Bukidnon","sub":["Northern, Eastern and Southern Mindanao","Cagayan de Oro"]},"10018":{"code":"088","title":"Camiguin","sub":["Northern, Eastern and Southern Mindanao","Cagayan de Oro"]},"10035":{"code":"063","title":"Lanao del Norte","sub":["Western and Central Mindanao","Iligan"]},"10042":{"code":"088","title":"Misamis Occidental","sub":["Northern, Eastern and Southern Mindanao","Cagayan de Oro"]},"10043":{"code":"088","title":"Misamis Oriental","sub":["Northern, Eastern and Southern Mindanao","Cagayan de Oro"]},"11024":{"code":"082","title":"Davao del Sur","sub":["Northern, Eastern and Southern Mindanao","Davao City"]},"11086":{"code":"082","title":"Davao Occidental","sub":["Northern, Eastern and Southern Mindanao","Davao City"]},"12047":{"code":"064","title":"Cotabato","sub":["Western and Central Mindanao","Cotabato City"]},"12063":{"code":"083","title":"South Cotabato","sub":["Northern, Eastern and Southern Mindanao","General Santos"]},"12065":{"code":"064","title":"Sultan Kudarat","sub":["Western and Central Mindanao","Cotabato City"]},"12080":{"code":"083","title":"Sarangani","sub":["Northern, Eastern and Southern Mindanao","General Santos"]},"14001":{"code":"074","title":"Abra","sub":["Northern Luzon","Baguio"]},"14011":{"code":"074","title":"Benguet","sub":["Northern Luzon","Baguio"]},"14027":{"code":"074","title":"Ifugao","sub":["Northern Luzon","Baguio"]},"14032":{"code":"074","title":"Kalinga","sub":["Northern Luzon","Baguio"]},"14044":{"code":"074","title":"Mountain Province","sub":["Northern Luzon","Baguio"]},"14081":{"code":"074","title":"Apayao","sub":["Northern Luzon","Baguio"]},"16002":{"code":"085","title":"Agusan del Norte","sub":["Northern, Eastern and Southern Mindanao","Butuan"]},"16003":{"code":"085","title":"Agusan del Sur","sub":["Northern, Eastern and Southern Mindanao","Butuan"]},"19007":{"code":"062","title":"Basilan","sub":["Western and Central Mindanao","Zamboanga City"]},"19036":{"code":"063","title":"Lanao del Sur","sub":["Western and Central Mindanao","Iligan"]},"19087":{"code":"064","title":"Maguindanao del Norte","sub":["Western and Central Mindanao","Cotabato City"]},"19088":{"code":"064","title":"Maguindanao del Sur","sub":["Western and Central Mindanao","Cotabato City"]},"19099":{"code":"064","title":"Special Geographic Area","sub":["Western and Central Mindanao","Cotabato City"]},"0402103":{"code":"02","title":"Bacoor (Cavite)","sub":["Metro Manila and Rizal","Quezon City"]},"0403425":{"code":"02","title":"San Pedro (Laguna)","sub":["Metro Manila and Rizal","Quezon City"]},"03014":{"code":"044","title":"Bulacan","sub":["Central Luzon and Southern Tagalog","San Jose del Monte"]},"03049":{"code":"044","title":"Nueva Ecija","sub":["Central Luzon and Southern Tagalog","San Jose del Monte"]},"03054":{"code":"045","title":"Pampanga","sub":["Central Luzon and Southern Tagalog","Angeles"]},"03069":{"code":"045","title":"Tarlac","sub":["Central Luzon and Southern Tagalog","Angeles"]},"04021":{"code":"046","title":"Cavite","sub":["Central Luzon and Southern Tagalog","Imus"]},"04034":{"code":"049","title":"Laguna","sub":["Central Luzon and Southern Tagalog","Calamba"]},"04058":{"code":"02","title":"Rizal","sub":["Metro Manila and Rizal","Quezon City"]},"06030":{"code":"033","title":"Iloilo","sub":["Western and Central Visayas","Iloilo City"]},"06045":{"code":"034","title":"Negros Occidental","sub":["Western and Central Visayas","Bacolod"]},"06079":{"code":"033","title":"Guimaras","sub":["Western and Central Visayas","Iloilo City"]},"07022":{"code":"032","title":"Cebu","sub":["Western and Central Visayas","Cebu City"]},"09073":{"code":"062","title":"Zamboanga del Sur","sub":["Western and Central Mindanao","Zamboanga City"]},"09083":{"code":"062","title":"Zamboanga Sibugay","sub":["Western and Central Mindanao","Zamboanga City"]},"09097":{"code":"062","title":"City of Isabela","sub":["Western and Central Mindanao","Zamboanga City"]}}},
};
