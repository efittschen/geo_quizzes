// Guatemala Regions. Each map area is one of the 340 municipios, grouped into the 22 departamentos; the departments are
// grouped by the 8 regiones de desarrollo (Decreto 70-86: I Metropolitana … VIII Petén), which only cut them into rounds.
// Names as written in Guatemala; municipios that share a name are asked with their department (La Democracia,
// La Libertad, San José, San Lorenzo, San Pedro Sacatepéquez, Santa Bárbara).
//
// Sources: municipios and departamentos: Coordinadora Nacional para la Reducción de Desastres (CONRED), via OCHA COD-AB
// (CC BY-IGO), boundaries of 2019; Lago de Amatitlán and Lago de Atitlán, areas of their own there, are left out.
// Department capitals: Spanish Wikipedia, "Departamentos de Guatemala".

const LAYERS = {
  key: "gtregions",
  borders: "[DATA.dep]",
  size: [1000,1053],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.15,
  fly: {"pad":1.6,"min":0.03},
  street: {"bounds":[[13.6,-92.4],[18,-88.1]],"maxBounds":[[9,-101],[22,-80]]},
  hintLabel: "Color by departamento",
  exploreKind: "departamentos",
  kinds: [
    {
      key: "regiones",
      label: "Regiones",
      groupsOnly: true,
      noun: ["region","regions"],
      prompt: "name",
      hints: false,
      groups: [["Regiones","",["I","II","III","IV","V","VI","VII","VIII"]]],
      areas: "@reg",
      name: {"x":{"I":"Metropolitana","II":"Norte","III":"Nororiente","IV":"Suroriente","V":"Central","VI":"Suroccidente","VII":"Noroccidente","VIII":"Petén"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"I":"Región I","II":"Región II","III":"Región III","IV":"Región IV","V":"Región V","VI":"Región VI","VII":"Región VII","VIII":"Región VIII"}},
      about: {"x":{"I":["Región I","Guatemala"],"II":["Región II","Alta Verapaz, Baja Verapaz"],"III":["Región III","Chiquimula, El Progreso, Izabal, Zacapa"],"IV":["Región IV","Jalapa, Jutiapa, Santa Rosa"],"V":["Región V","Chimaltenango, Escuintla, Sacatepéquez"],"VI":["Región VI","Quetzaltenango, Retalhuleu, San Marcos, Sololá, Suchitepéquez, Totonicapán"],"VII":["Región VII","Huehuetenango, Quiché"],"VIII":["Región VIII","Petén"]}},
      clicked: "{name}",
    },
    {
      key: "departamentos",
      label: "Departamentos",
      noun: ["department","departments"],
      prompt: "name",
      hints: false,
      groups: [["Metropolitana","Región I",["01"]],["Norte","Región II",["16","15"]],["Nororiente","Región III",["20","02","18","19"]],["Suroriente","Región IV",["21","22","06"]],["Central","Región V",["04","05","03"]],["Suroccidente","Región VI",["09","11","12","07","10","08"]],["Noroccidente","Región VII",["13","14"]],["Petén","Región VIII",["17"]]],
      areas: "@dep",
      name: {"x":{"10":"Suchitepéquez","11":"Retalhuleu","12":"San Marcos","13":"Huehuetenango","14":"Quiché","15":"Baja Verapaz","16":"Alta Verapaz","17":"Petén","18":"Izabal","19":"Zacapa","20":"Chiquimula","21":"Jalapa","22":"Jutiapa","04":"Chimaltenango","09":"Quetzaltenango","03":"Sacatepéquez","01":"Guatemala","06":"Santa Rosa","07":"Sololá","02":"El Progreso","05":"Escuintla","08":"Totonicapán"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"10":"Mazatenango","11":"Retalhuleu","12":"San Marcos","13":"Huehuetenango","14":"Santa Cruz del Quiché","15":"Salamá","16":"Cobán","17":"Flores","18":"Puerto Barrios","19":"Zacapa","20":"Chiquimula","21":"Jalapa","22":"Jutiapa","04":"Chimaltenango","09":"Quetzaltenango","03":"Antigua Guatemala","01":"Guatemala","06":"Cuilapa","07":"Sololá","02":"Guastatoya","05":"Escuintla","08":"Totonicapán"}},
      about: {"x":{"10":["Capital: Mazatenango","Región VI · Suroccidente","21 municipios"],"11":["Capital: Retalhuleu","Región VI · Suroccidente","9 municipios"],"12":["Capital: San Marcos","Región VI · Suroccidente","30 municipios"],"13":["Capital: Huehuetenango","Región VII · Noroccidente","33 municipios"],"14":["Capital: Santa Cruz del Quiché","Región VII · Noroccidente","21 municipios"],"15":["Capital: Salamá","Región II · Norte","8 municipios"],"16":["Capital: Cobán","Región II · Norte","17 municipios"],"17":["Capital: Flores","Región VIII · Petén","14 municipios"],"18":["Capital: Puerto Barrios","Región III · Nororiente","5 municipios"],"19":["Capital: Zacapa","Región III · Nororiente","11 municipios"],"20":["Capital: Chiquimula","Región III · Nororiente","11 municipios"],"21":["Capital: Jalapa","Región IV · Suroriente","7 municipios"],"22":["Capital: Jutiapa","Región IV · Suroriente","17 municipios"],"04":["Capital: Chimaltenango","Región V · Central","16 municipios"],"09":["Capital: Quetzaltenango","Región VI · Suroccidente","24 municipios"],"03":["Capital: Antigua Guatemala","Región V · Central","16 municipios"],"01":["Capital: Guatemala","Región I · Metropolitana","17 municipios"],"06":["Capital: Cuilapa","Región IV · Suroriente","14 municipios"],"07":["Capital: Sololá","Región VI · Suroccidente","19 municipios"],"02":["Capital: Guastatoya","Región III · Nororiente","8 municipios"],"05":["Capital: Escuintla","Región V · Central","14 municipios"],"08":["Capital: Totonicapán","Región VI · Suroccidente","8 municipios"]}},
      clicked: "{name}",
    },
    {
      key: "municipios",
      label: "Municipios",
      noun: ["municipality","municipalities"],
      prompt: "name",
      groups: [["Guatemala","Metropolitana",["0114","0106","0112","0113","0101","0108","0105","0117","0104","0103","0110","0107","0109","0111","0102","0116","0115"]],["Alta Verapaz","Norte",["1612","1614","1613","1601","1615","1611","1607","1617","1603","1610","1609","1616","1602","1608","1604","1605","1606"]],["Baja Verapaz","Norte",["1504","1506","1505","1508","1503","1501","1507","1502"]],["Chiquimula","Nororiente",["2005","2001","2008","2007","2011","2004","2006","2009","2010","2002","2003"]],["El Progreso","Nororiente",["0205","0201","0202","0203","0208","0204","0206","0207"]],["Izabal","Nororiente",["1803","1802","1805","1804","1801"]],["Zacapa","Nororiente",["1907","1902","1904","1910","1909","1903","1908","1911","1905","1906","1901"]],["Jalapa","Suroriente",["2101","2107","2106","2105","2103","2104","2102"]],["Jutiapa","Suroriente",["2204","2205","2207","2211","2213","2209","2202","2212","2208","2201","2214","2215","2217","2216","2203","2206","2210"]],["Santa Rosa","Suroriente",["0602","0604","0608","0601","0611","0614","0606","0613","0607","0605","0612","0610","0603","0609"]],["Chimaltenango","Central",["0411","0401","0404","0416","0414","0409","0407","0408","0413","0402","0403","0405","0410","0406","0412","0415"]],["Escuintla","Central",["0501","0508","0510","0503","0507","0505","0513","0511","0509","0512","0502","0514","0504","0506"]],["Sacatepéquez","Central",["0314","0301","0312","0302","0310","0303","0315","0307","0308","0313","0316","0309","0311","0306","0305","0304"]],["Quetzaltenango","Suroccidente",["0913","0906","0907","0914","0920","0917","0911","0919","0922","0921","0915","0923","0903","0909","0924","0901","0902","0904","0918","0912","0910","0908","0905","0916"]],["Retalhuleu","Suroccidente",["1107","1109","1108","1101","1106","1105","1104","1102","1103"]],["San Marcos","Suroccidente",["1217","1216","1204","1206","1220","1214","1213","1227","1223","1230","1221","1215","1212","1218","1222","1228","1203","1225","1224","1229","1201","1205","1219","1202","1211","1208","1226","1207","1209","1210"]],["Sololá","Suroccidente",["0708","0705","0710","0709","0712","0702","0717","0713","0716","0715","0718","0706","0711","0707","0714","0704","0703","0719","0701"]],["Suchitepéquez","Suroccidente",["1013","1002","1001","1014","1019","1020","1008","1010","1004","1003","1012","1005","1021","1016","1007","1011","1009","1015","1006","1017","1018"]],["Totonicapán","Suroccidente",["0805","0804","0808","0802","0803","0807","0806","0801"]],["Huehuetenango","Noroccidente",["1327","1326","1302","1319","1322","1304","1301","1309","1307","1312","1311","1303","1305","1333","1324","1329","1316","1323","1318","1313","1306","1314","1328","1325","1320","1331","1310","1317","1330","1308","1321","1315","1332"]],["Quiché","Noroccidente",["1418","1405","1419","1402","1406","1403","1410","1420","1412","1413","1421","1407","1416","1414","1408","1417","1411","1409","1401","1415","1404"]],["Petén","Petén",["1708","1714","1701","1705","1713","1711","1712","1704","1703","1706","1702","1709","1707","1710"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"t":["{group}","Región {@reg} · {groupSub}"],"x":{"1001":["Suchitepéquez · capital","Región VI · Suroccidente"],"1101":["Retalhuleu · capital","Región VI · Suroccidente"],"1201":["San Marcos · capital","Región VI · Suroccidente"],"1301":["Huehuetenango · capital","Región VII · Noroccidente"],"1401":["Quiché · capital","Región VII · Noroccidente"],"1501":["Baja Verapaz · capital","Región II · Norte"],"1601":["Alta Verapaz · capital","Región II · Norte"],"1701":["Petén · capital","Región VIII · Petén"],"1801":["Izabal · capital","Región III · Nororiente"],"1901":["Zacapa · capital","Región III · Nororiente"],"2001":["Chiquimula · capital","Región III · Nororiente"],"2101":["Jalapa · capital","Región IV · Suroriente"],"2201":["Jutiapa · capital","Región IV · Suroriente"],"0401":["Chimaltenango · capital","Región V · Central"],"0901":["Quetzaltenango · capital","Región VI · Suroccidente"],"0301":["Sacatepéquez · capital","Región V · Central"],"0101":["Guatemala · capital","Región I · Metropolitana"],"0601":["Santa Rosa · capital","Región IV · Suroriente"],"0701":["Sololá · capital","Región VI · Suroccidente"],"0201":["El Progreso · capital","Región III · Nororiente"],"0501":["Escuintla · capital","Región V · Central"],"0801":["Totonicapán · capital","Región VI · Suroccidente"]}},
      clicked: "{name}",
    },
  ],
  g: "{@dep}",
  explore: {"t":{"code":"{departamentos.name}","title":"{municipios.name}","sub":["{regiones.name} · Región {@reg}"]}},
};
