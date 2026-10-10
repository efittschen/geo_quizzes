// Kazakhstan Street Sign Codes, using the map areas of ../kazakhstan-regions/data.js.
// Street signs on buildings can carry a QR code with a short code under it; its first letter names the region
// (plonkit.net/kazakhstan, "Kazakhstan street sign codes": rarely readable, but it settles the region). The letters
// are those of the 16 first-level units before 2018, the same as on the number plates of 1993-2012 and after the K
// of the old local road numbers (KB, KC … KX): so Shymkent reads X with Turkistan (the former South Kazakhstan), and
// the regions split off in 2022 keep their old letter (Abai F, Jetisu B, Ulytau M). A question shows the letter, and
// you click its region.

const LAYERS = {
  key: "kzsigns",
  size: [1000,563],
  pad: 16,
  maxZoom: 30,
  labelScale: 0.3,
  fly: {"pad":1.6,"min":0.05},
  street: {"bounds":[[40.6,46.5],[55.4,87.3]],"maxBounds":[[34,38],[60,95]]},
  hintLabel: "Color regions",
  exploreKind: "signs",
  d: {"almaty":"M770.9,445a7,7 0 1,0 14,0a7,7 0 1,0 -14,0z","astana":"M603.8,160.4a7,7 0 1,0 14,0a7,7 0 1,0 -14,0z","shymkent":"M570.9,495.8a7,7 0 1,0 14,0a7,7 0 1,0 -14,0z"},
  top: ["almaty","astana","shymkent"],
  kinds: [
    {
      key: "signs",
      label: "Sign codes",
      noun: ["code","codes"],
      prompt: "dial",
      groups: [["West","",["L","E","R","D"]],["North","",["P","T","C","Z","S"]],["Centre and east","",["M","F"]],["South","",["N","X","H","B","A"]]],
      areas: {"x":{"Z":["astana"],"A":["almaty"],"B":["almaty-region","jetisu"],"C":["akmola"],"D":["aktobe"],"E":["atyrau"],"F":["east-kazakhstan","abai"],"H":["zhambyl"],"L":["west-kazakhstan"],"M":["karaganda","ulytau"],"N":["kyzylorda"],"P":["kostanay"],"R":["mangystau"],"S":["pavlodar"],"T":["north-kazakhstan"],"X":["turkistan","shymkent"]}},
      name: "{id}",
      short: "{id}",
      chip: "{id}",
      chipTitle: {"x":{"Z":"Astana","A":"Almaty","B":"Almaty Region","C":"Akmola","D":"Aktobe","E":"Atyrau","F":"East Kazakhstan","H":"Zhambyl","L":"West Kazakhstan","M":"Karaganda","N":"Kyzylorda","P":"Kostanay","R":"Mangystau","S":"Pavlodar","T":"North Kazakhstan","X":"Turkistan"}},
      about: {"x":{"Z":["City of Astana"],"A":["City of Almaty"],"B":["Almaty and Jetisu regions"],"C":["Akmola Region"],"D":["Aktobe Region"],"E":["Atyrau Region"],"F":["East Kazakhstan and Abai regions"],"H":["Zhambyl Region"],"L":["West Kazakhstan Region"],"M":["Karaganda and Ulytau regions"],"N":["Kyzylorda Region"],"P":["Kostanay Region"],"R":["Mangystau Region"],"S":["Pavlodar Region"],"T":["North Kazakhstan Region"],"X":["Turkistan Region and Shymkent (the former South Kazakhstan Region)"]}},
      clicked: "{p} ({@en})",
    },
  ],
  g: {"x":{"astana":"astana","almaty":"almaty","almaty-region":"almaty-region","jetisu":"almaty-region","akmola":"akmola","aktobe":"aktobe","atyrau":"atyrau","east-kazakhstan":"east-kazakhstan","abai":"east-kazakhstan","zhambyl":"zhambyl","west-kazakhstan":"west-kazakhstan","karaganda":"karaganda","ulytau":"karaganda","kyzylorda":"kyzylorda","kostanay":"kostanay","mangystau":"mangystau","pavlodar":"pavlodar","north-kazakhstan":"north-kazakhstan","turkistan":"turkistan","shymkent":"turkistan"}},
  explore: {"t":{"code":"{signs.p}","title":"{@en}","sub":"{signs.about0}"}},
};
