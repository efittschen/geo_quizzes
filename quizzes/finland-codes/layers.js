// Finland Area Codes, on the municipality areas of ../finland-regions/data.js.
// Codes: Traficom Regulation 32 V/2025 M, Table 4: 13 national destination codes for 12 telecommunications areas
// (Uusimaa has two numbering areas, 09 and 019). Traficom has published no municipality list since 2013, so each
// municipality (2026) takes the code most used by the landline numbers tagged in OpenStreetMap inside it (phone and
// contact:phone, extract of October 2026; nationwide, mobile and service numbers left out). Municipalities with
// fewer than 3 such numbers or no clear majority were checked against their neighbours and the 1996 provinces
// (fi.wikipedia "Telealue"); Pornainen (019) and Pihtipudas (014) against their own switchboard numbers.
// Borders are approximate: some municipalities span two areas (e.g. Janakkala, Jämsä, Iitti).

const LAYERS = {
  key: "fincodes",
  size: [1000,1768],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.3,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[59.7,19.3],[70.1,31.6]],"maxBounds":[[56,10],[73,40]]},
  hintLabel: "Color by area code",
  exploreKind: "codes",
  kinds: [
    {
      key: "codes",
      label: "Area codes",
      noun: ["code","codes"],
      prompt: "dial",
      hints: false,
      groups: [["South","",["9","19","2","3","5","18"]],["East & Centre","",["13","14","15","17"]],["West & North","",["6","8","16"]]],
      areas: {"x":{"2":["019","050","051","079","271","102","284","181","202","214","230","761","304","322","400","423","430","577","445","480","481","484","503","529","531","538","561","684","608","609","619","631","636","680","704","734","738","747","783","833","853","886","895","918","981"],"3":["016","020","081","082","177","061","098","103","108","109","111","143","165","169","211","576","250","291","316","398","418","508","536","560","562","581","604","635","702","781","790","834","837","887","908","922","936","980"],"5":["075","142","285","153","286","405","416","441","489","580","624","689","700","739","831","935"],"6":["005","010","052","272","074","145","280","151","152","217","218","231","232","233","236","287","288","300","301","399","403","408","421","440","475","499","545","584","598","599","743","759","846","849","893","905","924","934","946","989"],"8":["009","069","071","072","105","139","205","208","244","290","305","317","425","436","563","564","483","494","535","578","615","620","625","626","630","678","691","697","765","746","748","777","785","791","832","859","889","977"],"9":["049","091","092","149","186","224","235","245","257","543","753","755","858","927"],"13":["276","146","167","176","260","309","422","426","541","607","707","848"],"14":["077","172","179","182","216","226","275","249","256","265","312","410","435","495","500","592","601","729","850","892","931","992"],"15":["046","097","178","213","491","507","593","681","623","768","740"],"16":["047","148","273","240","241","261","320","498","583","683","614","698","732","742","751","758","845","851","854","890","976"],"17":["090","140","171","204","239","263","297","402","420","595","686","687","762","749","778","844","857","915","921","925"],"18":["035","043","060","062","065","076","170","295","318","417","438","478","736","766","771","941"],"19":["018","086","078","106","407","433","434","444","504","505","611","616","638","694","710"]}},
      name: "{@tel}",
      short: "{@tel}",
      chip: "{@tel}",
      chipTitle: {"x":{"2":"Turku and Pori","3":"Häme","5":"Kymi","6":"Vaasa","8":"Oulu","9":"Uusimaa I","13":"North Karelia","14":"Central Finland","15":"Mikkeli","16":"Lapland","17":"Kuopio","18":"Åland","19":"Uusimaa II"}},
      detail: ["Show area name","{chipTitle}"],
      about: {"x":{"2":["Turku and Pori","Turku, Pori, Salo"],"3":["Häme","Tampere, Lahti, Hämeenlinna"],"5":["Kymi","Kouvola, Lappeenranta, Kotka"],"6":["Vaasa","Vaasa, Seinäjoki, Kokkola"],"8":["Oulu","Oulu, Kajaani, Raahe"],"9":["Uusimaa I","Helsinki, Espoo, Vantaa"],"13":["North Karelia","Joensuu, Kontiolahti, Liperi"],"14":["Central Finland","Jyväskylä, Jämsä, Laukaa"],"15":["Mikkeli","Mikkeli, Savonlinna, Pieksämäki"],"16":["Lapland","Rovaniemi, Tornio, Kemi"],"17":["Kuopio","Kuopio, Siilinjärvi, Iisalmi"],"18":["Åland","Mariehamn"],"19":["Uusimaa II","Porvoo, Lohja, Hyvinkää"]}},
      clicked: {"t":"{name}, {@fi}","x":{"149":"09, Ingå","287":"06, Kristinestad","288":"06, Kronoby","322":"02, Kimitoön","440":"06, Larsmo","445":"02, Pargas","475":"06, Malax","478":"018, Mariehamn","499":"06, Korsholm","545":"06, Närpes","598":"06, Jakobstad","599":"06, Pedersöre","710":"019, Raseborg","893":"06, Nykarleby","946":"06, Vörå"}},
      presets: [["Big cities",["9","2","3","8","14","17"]]],
    },
  ],
  g: "{@tel}",
  explore: {"t":{"code":"{@tel}","title":"{@fi}","sub":"{codes.detail}"},"x":{"149":{"code":"09","title":"Ingå","sub":"Uusimaa I"},"287":{"code":"06","title":"Kristinestad","sub":"Vaasa"},"288":{"code":"06","title":"Kronoby","sub":"Vaasa"},"322":{"code":"02","title":"Kimitoön","sub":"Turku and Pori"},"440":{"code":"06","title":"Larsmo","sub":"Vaasa"},"445":{"code":"02","title":"Pargas","sub":"Turku and Pori"},"475":{"code":"06","title":"Malax","sub":"Vaasa"},"478":{"code":"018","title":"Mariehamn","sub":"Åland"},"499":{"code":"06","title":"Korsholm","sub":"Vaasa"},"545":{"code":"06","title":"Närpes","sub":"Vaasa"},"598":{"code":"06","title":"Jakobstad","sub":"Vaasa"},"599":{"code":"06","title":"Pedersöre","sub":"Vaasa"},"710":{"code":"019","title":"Raseborg","sub":"Uusimaa II"},"893":{"code":"06","title":"Nykarleby","sub":"Vaasa"},"946":{"code":"06","title":"Vörå","sub":"Vaasa"}}},
};
