// Luxembourg Regions. Each map area is one of the 100 communes (since Groussbus-Wal in 2023), grouped into the 12
// cantons; the cantons are grouped by the four circonscriptions électorales (Nord, Est, Centre, Sud), which only cut
// them into rounds. Names as the state writes them, on the signs (Ettelbruck, Esch-sur-Alzette, Redange/Attert); the
// Luxembourgish name, written under it on the town signs, is said beside it (Ettelbréck, Esch-Uelzecht).
//
// Sources: Administration du cadastre et de la topographie (ACT), Limites administratives du Grand-Duché de Luxembourg,
// data.public.lu (CC0): communes and their cantons, the communes' circonscriptions électorales; Luxembourgish names:
// Wikidata (CC0).

const LAYERS = {
  key: "luregions",
  borders: "[DATA.rb]",
  size: [1000, 1433],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.22,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[49.4,5.7],[50.2,6.6]],"maxBounds":[[45,-3],[55,15]]},
  hintLabel: "Color by canton",
  exploreKind: "communes",
  kinds: [
    {
      key: "cantons",
      label: "Cantons",
      noun: ["canton","cantons"],
      prompt: "name",
      hints: false,
      areaRank: false,
      groups: [["Nord","Circonscription",["02","03","09","11","12"]],["Est","Circonscription",["04","06","10"]],["Centre","Circonscription",["07","08"]],["Sud","Circonscription",["01","05"]]],
      areas: "@ct",
      name: {"x":{"10":"Remich","11":"Vianden","12":"Wiltz","01":"Capellen","02":"Clervaux","03":"Diekirch","04":"Echternach","05":"Esch-sur-Alzette","06":"Grevenmacher","07":"Luxembourg","08":"Mersch","09":"Redange"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"10":"Réimech","11":"Veianen","12":"Wolz","01":"Kapellen","02":"Clierf","03":"Dikrech","04":"Iechternach","05":"Esch-Uelzecht","06":"Gréiwemaacher","07":"Lëtzebuerg","08":"Miersch","09":"Réiden"}},
      about: {"x":{"10":["Réimech","7 communes"],"11":["Veianen","3 communes"],"12":["Wolz","7 communes"],"01":["Kapellen","9 communes"],"02":["Clierf","5 communes"],"03":["Dikrech","10 communes"],"04":["Iechternach","7 communes"],"05":["Esch-Uelzecht","14 communes"],"06":["Gréiwemaacher","8 communes"],"07":["Lëtzebuerg","11 communes"],"08":["Miersch","10 communes"],"09":["Réiden","9 communes"]}},
      clicked: "{name}",
    },
    {
      key: "communes",
      label: "Communes",
      noun: ["commune","communes"],
      prompt: "name",
      groups: [["Capellen","Canton",["0101","0102","0103","0104","0105","0106","0107","0108","0110"]],["Clervaux","Canton",["0501","0503","0504","0505","0502"]],["Diekirch","Canton",["0601","0602","0603","0604","0605","0606","0607","0608","0609","0610"]],["Echternach","Canton",["1001","1002","1003","1004","1005","1006","1008"]],["Esch-sur-Alzette","Canton",["0201","0202","0203","0204","0205","0206","0207","0208","0209","0210","0211","0212","0213","0214"]],["Grevenmacher","Canton",["1101","1102","1103","1104","1105","1106","1107","1108"]],["Luxembourg","Canton",["0301","0302","0303","0304","0305","0306","0307","0308","0309","0310","0311"]],["Mersch","Canton",["0402","0401","0404","0405","0403","0406","0407","0408","0409","0410"]],["Redange","Canton",["0701","0703","0711","0702","0704","0706","0707","0708","0709"]],["Remich","Canton",["1209","1202","1203","1204","1205","1206","1207"]],["Vianden","Canton",["0902","0901","0903"]],["Wiltz","Canton",["0801","0802","0804","0805","0806","0807","0808"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"x":{"1001":["Beefort","Canton Echternach"],"1002":["Canton Echternach"],"1003":["Bäerdref","Canton Echternach"],"1004":["Konsdref","Canton Echternach"],"1005":["Iechternach","Canton Echternach"],"1006":["Rouspert-Mompech","Canton Echternach"],"1008":["Waldbëlleg","Canton Echternach"],"1101":["Betzder","Canton Grevenmacher"],"1102":["Canton Grevenmacher"],"1103":["Fluessweiler","Canton Grevenmacher"],"1104":["Gréiwemaacher","Canton Grevenmacher"],"1105":["Jonglënster","Canton Grevenmacher"],"1106":["Canton Grevenmacher"],"1107":["Mäertert","Canton Grevenmacher"],"1108":["Wuermer","Canton Grevenmacher"],"1202":["Duelem","Canton Remich"],"1203":["Lenneng","Canton Remich"],"1204":["Munneref","Canton Remich"],"1205":["Réimech","Canton Remich"],"1206":["Canton Remich"],"1207":["Stadbriedemes","Canton Remich"],"1209":["Bous-Waldbriedemes","Canton Remich"],"0607":["Mäerzeg","Canton Diekirch"],"0406":["Fiels","Canton Mersch"],"0107":["Koplescht","Canton Capellen"],"0602":["Buerschent","Canton Diekirch"],"0409":["Miersch","Canton Mersch"],"0804":["Géisdref","Canton Wiltz"],"0802":["Esch-Sauer","Canton Wiltz"],"0606":["Feelen","Canton Diekirch"],"0708":["Useldeng","Canton Redange"],"0603":["Dikrech","Canton Diekirch"],"0105":["Kielen","Canton Capellen"],"0707":["Sëll","Canton Redange"],"0204":["Esch-Uelzecht","Canton Esch-sur-Alzette"],"0308":["Steesel","Canton Luxembourg"],"0211":["Réiser","Canton Esch-sur-Alzette"],"0601":["Bettenduerf","Canton Diekirch"],"0404":["Fëschbech","Canton Mersch"],"0704":["Rammerech","Canton Redange"],"0609":["Canton Diekirch"],"0305":["Nidderaanwen","Canton Luxembourg"],"0805":["Canton Wiltz"],"0808":["Wanseler","Canton Wiltz"],"0306":["Canton Luxembourg"],"0210":["Reckeng op der Mess","Canton Esch-sur-Alzette"],"0806":["Stauséigemeng","Canton Wiltz"],"0504":["Ëlwen","Canton Clervaux"],"0605":["Ettelbréck","Canton Diekirch"],"0608":["Reisduerf","Canton Diekirch"],"0503":["Parc Housen","Canton Clervaux"],"0208":["Monnerech","Canton Esch-sur-Alzette"],"0212":["Rëmeleng","Canton Esch-sur-Alzette"],"0403":["Canton Mersch"],"0706":["Réiden op der Atert","Canton Redange"],"0101":["Dippech","Canton Capellen"],"0405":["Hiefenech","Canton Mersch"],"0407":["Lëntgen","Canton Mersch"],"0604":["Ierpeldeng-Sauer","Canton Diekirch"],"0205":["Fréiseng","Canton Esch-sur-Alzette"],"0206":["Keel","Canton Esch-sur-Alzette"],"0303":["Hesper","Canton Luxembourg"],"0302":["Conter","Canton Luxembourg"],"0901":["Canton Vianden"],"0711":["Canton Redange"],"0502":["Wëntger","Canton Clervaux"],"0213":["Suessem","Canton Esch-sur-Alzette"],"0311":["Weiler zum Tuer","Canton Luxembourg"],"0401":["Colmer-Bierg","Canton Mersch"],"0106":["Käerch","Canton Capellen"],"0709":["Viichten","Canton Redange"],"0702":["Canton Redange"],"0104":["Canton Capellen"],"0801":["Bauschelt","Canton Wiltz"],"0903":["Veianen","Canton Vianden"],"0408":["Luerenzweiler","Canton Mersch"],"0703":["Canton Redange"],"0203":["Diddeleng","Canton Esch-sur-Alzette"],"0410":["Noumer","Canton Mersch"],"0307":["Schëtter","Canton Luxembourg"],"0214":["Schëffleng","Canton Esch-sur-Alzette"],"0610":["Ärenzdallgemeng","Canton Diekirch"],"0402":["Biissen","Canton Mersch"],"0207":["Leideleng","Canton Esch-sur-Alzette"],"0501":["Clierf","Canton Clervaux"],"0103":["Canton Capellen"],"0110":["Stengefort","Canton Capellen"],"0301":["Bartreng","Canton Luxembourg"],"0701":["Biekerech","Canton Redange"],"0309":["Stroossen","Canton Luxembourg"],"0310":["Walfer","Canton Luxembourg"],"0304":["Lëtzebuerg","Canton Luxembourg"],"0202":["Déifferdeng","Canton Esch-sur-Alzette"],"0201":["Beetebuerg","Canton Esch-sur-Alzette"],"0505":["Wäiswampech","Canton Clervaux"],"0108":["Canton Capellen"],"0902":["Pëtschent","Canton Vianden"],"0102":["Garnech","Canton Capellen"],"0807":["Wolz","Canton Wiltz"],"0209":["Péiteng","Canton Esch-sur-Alzette"]}},
      clicked: "{name}",
    },
  ],
  g: "{@ct}",
  explore: {"t":{"code":"{communes.name}","title":"{cantons.name}","sub":["{@lb}"]}},
};
