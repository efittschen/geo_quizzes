// Czechia Regions: the 14 kraje and the 77 okresy (76 and Praha). Map areas are the ORP areas (správní obvody obcí s rozšířenou
// působností, which lie inside one okres each since 2021) and Praha; ORP Turnov, which lies in three okresy, is cut by okres.
// All from ČÚZK, RÚIAN (CC BY 4.0, October 2026). Names as the country writes them (Jihomoravský kraj, Praha-východ);
// the regions grouped as Bohemia (CZ01–CZ05) and Moravia & Silesia (CZ06–CZ08) by NUTS 2. The same map serves
// ../czechia-codes, ../czechia-plates and the zones of ../czechia-postcodes.

const LAYERS = {
  key: "czregions",
  size: [1000,575],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.25,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[48.55,12.09],[51.06,18.86]],"maxBounds":[[45,7],[54,24]]},
  hintLabel: "Color by region",
  exploreKind: "okresy",
  kinds: [
    {
      key: "kraje",
      label: "Regions",
      noun: ["region","regions"],
      prompt: "name",
      groups: [["Bohemia","",["CZ010","CZ020","CZ031","CZ032","CZ041","CZ042","CZ051","CZ052","CZ053"]],["Moravia & Silesia","",["CZ063","CZ064","CZ071","CZ072","CZ080"]]],
      areas: "@kraj",
      name: {"x":{"CZ010":"Praha","CZ020":"Středočeský kraj","CZ031":"Jihočeský kraj","CZ032":"Plzeňský kraj","CZ041":"Karlovarský kraj","CZ042":"Ústecký kraj","CZ051":"Liberecký kraj","CZ052":"Královéhradecký kraj","CZ053":"Pardubický kraj","CZ063":"Kraj Vysočina","CZ064":"Jihomoravský kraj","CZ071":"Olomoucký kraj","CZ072":"Zlínský kraj","CZ080":"Moravskoslezský kraj"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"CZ010":"Prague","CZ020":"Central Bohemian Region","CZ031":"South Bohemian Region","CZ032":"Plzeň Region","CZ041":"Karlovy Vary Region","CZ042":"Ústí nad Labem Region","CZ051":"Liberec Region","CZ052":"Hradec Králové Region","CZ053":"Pardubice Region","CZ063":"Vysočina Region","CZ064":"South Moravian Region","CZ071":"Olomouc Region","CZ072":"Zlín Region","CZ080":"Moravian-Silesian Region"}},
      about: {"x":{"CZ010":["Prague","Capital"],"CZ020":["Central Bohemian Region","Seat: Praha"],"CZ031":["South Bohemian Region","Seat: České Budějovice"],"CZ032":["Plzeň Region","Seat: Plzeň"],"CZ041":["Karlovy Vary Region","Seat: Karlovy Vary"],"CZ042":["Ústí nad Labem Region","Seat: Ústí nad Labem"],"CZ051":["Liberec Region","Seat: Liberec"],"CZ052":["Hradec Králové Region","Seat: Hradec Králové"],"CZ053":["Pardubice Region","Seat: Pardubice"],"CZ063":["Vysočina Region","Seat: Jihlava"],"CZ064":["South Moravian Region","Seat: Brno"],"CZ071":["Olomouc Region","Seat: Olomouc"],"CZ072":["Zlín Region","Seat: Zlín"],"CZ080":["Moravian-Silesian Region","Seat: Ostrava"]}},
      clicked: "{name}",
    },
    {
      key: "okresy",
      label: "Districts",
      noun: ["district","districts"],
      prompt: "name",
      groups: [["Praha","",["CZ0100"]],["Středočeský kraj","",["CZ0201","CZ0202","CZ0203","CZ0204","CZ0205","CZ0206","CZ0207","CZ0208","CZ0209","CZ020A","CZ020B","CZ020C"]],["Jihočeský kraj","",["CZ0311","CZ0312","CZ0313","CZ0314","CZ0315","CZ0316","CZ0317"]],["Plzeňský kraj","",["CZ0321","CZ0322","CZ0324","CZ0323","CZ0325","CZ0326","CZ0327"]],["Karlovarský kraj","",["CZ0411","CZ0412","CZ0413"]],["Ústecký kraj","",["CZ0421","CZ0422","CZ0423","CZ0424","CZ0425","CZ0426","CZ0427"]],["Liberecký kraj","",["CZ0511","CZ0512","CZ0513","CZ0514"]],["Královéhradecký kraj","",["CZ0521","CZ0522","CZ0523","CZ0524","CZ0525"]],["Pardubický kraj","",["CZ0531","CZ0532","CZ0533","CZ0534"]],["Kraj Vysočina","",["CZ0631","CZ0632","CZ0633","CZ0634","CZ0635"]],["Jihomoravský kraj","",["CZ0641","CZ0642","CZ0643","CZ0644","CZ0645","CZ0646","CZ0647"]],["Olomoucký kraj","",["CZ0711","CZ0712","CZ0713","CZ0714","CZ0715"]],["Zlínský kraj","",["CZ0721","CZ0722","CZ0723","CZ0724"]],["Moravskoslezský kraj","",["CZ0801","CZ0802","CZ0803","CZ0804","CZ0805","CZ0806"]]],
      areas: "@okres",
      name: {"x":{"CZ0532":"Pardubice","CZ0524":"Rychnov nad Kněžnou","CZ0533":"Svitavy","CZ0514":"Semily","CZ0724":"Zlín","CZ0534":"Ústí nad Orlicí","CZ0421":"Děčín","CZ0713":"Prostějov","CZ0634":"Třebíč","CZ0425":"Most","CZ0426":"Teplice","CZ0635":"Žďár nad Sázavou","CZ0424":"Louny","CZ0644":"Břeclav","CZ0643":"Brno-venkov","CZ0207":"Mladá Boleslav","CZ0805":"Opava","CZ0712":"Olomouc","CZ0806":"Ostrava-město","CZ0412":"Karlovy Vary","CZ0206":"Mělník","CZ0803":"Karviná","CZ0422":"Chomutov","CZ0804":"Nový Jičín","CZ0324":"Plzeň-jih","CZ0523":"Náchod","CZ0325":"Plzeň-sever","CZ0721":"Kroměříž","CZ0714":"Přerov","CZ0205":"Kutná Hora","CZ0315":"Prachatice","CZ0802":"Frýdek-Místek","CZ0512":"Jablonec nad Nisou","CZ0715":"Šumperk","CZ0525":"Trutnov","CZ0314":"Písek","CZ0411":"Cheb","CZ0423":"Litoměřice","CZ0322":"Klatovy","CZ0723":"Vsetín","CZ0632":"Jihlava","CZ0312":"Český Krumlov","CZ0311":"České Budějovice","CZ020B":"Příbram","CZ0201":"Benešov","CZ0204":"Kolín","CZ0633":"Pelhřimov","CZ0327":"Tachov","CZ0522":"Jičín","CZ0513":"Liberec","CZ0316":"Strakonice","CZ0202":"Beroun","CZ0413":"Sokolov","CZ0100":"Praha","CZ0203":"Kladno","CZ0317":"Tábor","CZ0521":"Hradec Králové","CZ0631":"Havlíčkův Brod","CZ0646":"Vyškov","CZ0323":"Plzeň-město","CZ0531":"Chrudim","CZ0722":"Uherské Hradiště","CZ0647":"Znojmo","CZ0801":"Bruntál","CZ0711":"Jeseník","CZ0209":"Praha-východ","CZ0208":"Nymburk","CZ0321":"Domažlice","CZ0642":"Brno-město","CZ0641":"Blansko","CZ0326":"Rokycany","CZ0427":"Ústí nad Labem","CZ0313":"Jindřichův Hradec","CZ0645":"Hodonín","CZ020A":"Praha-západ","CZ0511":"Česká Lípa","CZ020C":"Rakovník"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"t":["{group}"],"x":{"CZ0806":["Moravskoslezský kraj","City of Ostrava"],"CZ0100":["Praha","Capital"],"CZ0323":["Plzeňský kraj","City of Plzeň"],"CZ0642":["Jihomoravský kraj","City of Brno"]}},
      clicked: "{name}",
    },
  ],
  g: "{@kraj}",
  explore: {"t":{"code":"{okresy.name}","title":"{kraje.name}","sub":["ORP {@orp}"]},"x":{"o19":{"code":"Praha","title":"Praha","sub":["Capital"]}}},
};
