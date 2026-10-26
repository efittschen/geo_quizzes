// Costa Rica Regions. Each map area is one of the 84 cantones (with Río Cuarto 2017, Monteverde 2021 and Puerto Jiménez
// 2022), grouped into the 7 provincias. Names as written in Costa Rica; id: the canton's code (province digit and two
// digits), as in its districts' 5-digit codes (../costa-rica-postcodes). Seat of a canton: its first district (01).
//
// Sources: provincias, cantones and distritos: Instituto Nacional de Estadística y Censos (INEC), via OCHA COD-AB
// (CC BY-IGO), valid 2024-12-03. Province capitals: Spanish Wikipedia, "Provincias de Costa Rica".

const LAYERS = {
  key: "crregions",
  borders: "[DATA.prov]",
  size: [1000,1268],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.2,
  fly: {"pad":1.6,"min":0.035},
  street: {"bounds":[[5.3,-87.2],[11.4,-82.4]],"maxBounds":[[1,-96],[16,-74]]},
  hintLabel: "Color by provincia",
  exploreKind: "cantones",
  kinds: [
    {
      key: "provincias",
      label: "Provincias",
      noun: ["province","provinces"],
      prompt: "name",
      hints: false,
      groups: [["Provincias","",["1","2","3","4","5","6","7"]]],
      areas: "@prov",
      name: {"x":{"1":"San José","2":"Alajuela","3":"Cartago","4":"Heredia","5":"Guanacaste","6":"Puntarenas","7":"Limón"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"1":"Capital: San José","2":"Capital: Alajuela","3":"Capital: Cartago","4":"Capital: Heredia","5":"Capital: Liberia","6":"Capital: Puntarenas","7":"Capital: Limón"}},
      about: {"x":{"1":["Capital: San José","20 cantones"],"2":["Capital: Alajuela","16 cantones"],"3":["Capital: Cartago","8 cantones"],"4":["Capital: Heredia","10 cantones"],"5":["Capital: Liberia","11 cantones"],"6":["Capital: Puntarenas","13 cantones"],"7":["Capital: Limón","6 cantones"]}},
      clicked: "{name}",
    },
    {
      key: "cantones",
      label: "Cantones",
      noun: ["canton","cantons"],
      prompt: "name",
      groups: [["San José","",["112","110","106","118","103","117","102","108","120","115","107","114","119","104","101","109","105","113","116","111"]],["Alajuela","",["201","205","203","215","214","206","209","207","208","216","210","204","202","212","213","211"]],["Cartago","",["306","301","308","304","303","307","302","305"]],["Heredia","",["402","407","408","401","406","409","405","404","403","410"]],["Guanacaste","",["507","504","506","505","511","510","501","509","502","503","508"]],["Puntarenas","",["603","610","608","602","611","607","604","612","605","609","613","601","606"]],["Limón","",["706","701","705","702","703","704"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"x":{"101":["San José","Seat: Carmen","11 distritos"],"102":["San José","Seat: Escazú","3 distritos"],"103":["San José","Seat: Desamparados","13 distritos"],"104":["San José","Seat: Santiago","9 distritos"],"105":["San José","Seat: San Marcos","3 distritos"],"106":["San José","Seat: Aserrí","7 distritos"],"107":["San José","Seat: Colón","7 distritos"],"108":["San José","Seat: Guadalupe","7 distritos"],"109":["San José","Seat: Santa Ana","6 distritos"],"110":["San José","Seat: Alajuelita","5 distritos"],"111":["San José","Seat: San Isidro","5 distritos"],"112":["San José","Seat: San Ignacio","5 distritos"],"113":["San José","Seat: San Juan","5 distritos"],"114":["San José","Seat: San Vicente","3 distritos"],"115":["San José","Seat: San Pedro","4 distritos"],"116":["San José","Seat: San Pablo","5 distritos"],"117":["San José","Seat: Santa María","3 distritos"],"118":["San José","Seat: Curridabat","4 distritos"],"119":["San José","Seat: San Isidro de El General","12 distritos"],"120":["San José","Seat: San Pablo","6 distritos"],"201":["Alajuela","Seat: Alajuela","14 distritos"],"202":["Alajuela","Seat: San Ramón","14 distritos"],"203":["Alajuela","Seat: Grecia","7 distritos"],"204":["Alajuela","Seat: San Mateo","4 distritos"],"205":["Alajuela","Seat: Atenas","8 distritos"],"206":["Alajuela","Seat: Naranjo","8 distritos"],"207":["Alajuela","Seat: Palmares","7 distritos"],"208":["Alajuela","Seat: San Pedro","5 distritos"],"209":["Alajuela","Seat: Orotina","5 distritos"],"210":["Alajuela","Seat: Quesada","13 distritos"],"211":["Alajuela","Seat: Zarcero","7 distritos"],"212":["Alajuela","Seat: Sarchí Norte","5 distritos"],"213":["Alajuela","Seat: Upala","8 distritos"],"214":["Alajuela","Seat: Los Chiles","4 distritos"],"215":["Alajuela","Seat: San Rafael","4 distritos"],"216":["Alajuela","Seat: Río Cuarto","3 distritos"],"301":["Cartago","Seat: Oriental","11 distritos"],"302":["Cartago","Seat: Paraíso","6 distritos"],"303":["Cartago","Seat: Tres Ríos","8 distritos"],"304":["Cartago","Seat: Juan Viñas","4 distritos"],"305":["Cartago","Seat: Turrialba","12 distritos"],"306":["Cartago","Seat: Pacayas","3 distritos"],"307":["Cartago","Seat: San Rafael","5 distritos"],"308":["Cartago","Seat: El Tejar","4 distritos"],"401":["Heredia","Seat: Heredia","5 distritos"],"402":["Heredia","Seat: Barva","7 distritos"],"403":["Heredia","Seat: Santo Domingo","8 distritos"],"404":["Heredia","Seat: Santa Bárbara","6 distritos"],"405":["Heredia","Seat: San Rafael","5 distritos"],"406":["Heredia","Seat: San Isidro","4 distritos"],"407":["Heredia","Seat: San Antonio","3 distritos"],"408":["Heredia","Seat: San Joaquín","3 distritos"],"409":["Heredia","Seat: San Pablo","2 distritos"],"410":["Heredia","Seat: Puerto Viejo","5 distritos"],"501":["Guanacaste","Seat: Liberia","5 distritos"],"502":["Guanacaste","Seat: Nicoya","7 distritos"],"503":["Guanacaste","Seat: Santa Cruz","9 distritos"],"504":["Guanacaste","Seat: Bagaces","4 distritos"],"505":["Guanacaste","Seat: Filadelfia","4 distritos"],"506":["Guanacaste","Seat: Cañas","5 distritos"],"507":["Guanacaste","Seat: Las Juntas","4 distritos"],"508":["Guanacaste","Seat: Tilarán","8 distritos"],"509":["Guanacaste","Seat: Carmona","6 distritos"],"510":["Guanacaste","Seat: La Cruz","4 distritos"],"511":["Guanacaste","Seat: Hojancha","5 distritos"],"601":["Puntarenas","Seat: Puntarenas","15 distritos"],"602":["Puntarenas","Seat: Espíritu Santo","6 distritos"],"603":["Puntarenas","Seat: Buenos Aires","9 distritos"],"604":["Puntarenas","Seat: Miramar","3 distritos"],"605":["Puntarenas","Seat: Puerto Cortés","6 distritos"],"606":["Puntarenas","Seat: Quepos","3 distritos"],"607":["Puntarenas","Seat: Golfito","3 distritos"],"608":["Puntarenas","Seat: San Vito","6 distritos"],"609":["Puntarenas","Seat: Parrita","1 distritos"],"610":["Puntarenas","Seat: Corredor","4 distritos"],"611":["Puntarenas","Seat: Jacó","3 distritos"],"612":["Puntarenas","Seat: Monteverde","1 distritos"],"613":["Puntarenas","Seat: Puerto Jiménez","1 distritos"],"701":["Limón","Seat: Limón","4 distritos"],"702":["Limón","Seat: Guápiles","7 distritos"],"703":["Limón","Seat: Siquirres","7 distritos"],"704":["Limón","Seat: Bratsi","4 distritos"],"705":["Limón","Seat: Matina","3 distritos"],"706":["Limón","Seat: Guácimo","5 distritos"]}},
      clicked: "{name}",
    },
  ],
  g: "{@prov}",
  explore: {"t":{"code":"{provincias.name}","title":"{cantones.name}","sub":["{cantones.about1}"]}},
};
