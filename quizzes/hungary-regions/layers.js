// Hungary Counties (and Minority Signs, ../hungary-signs).
// Map areas are the 19 counties and Budapest, each split where it holds settlements with nationality-language
// signs, built from OpenStreetMap settlement boundaries. County of each settlement: KSH gazetteer 2025.
// Regions: the 8 NUTS 2 statistical regions (KSH 2022 census codelist), grouped into the 3 NUTS 1 large regions.
// Sign languages: a settlement counts for a nationality when at least 10% of its people belong to it (KSH 2022
// census, "belonging to the nationality", any question) and it has that nationality's self-government (KSH gazetteer
// 2025): the conditions of Act CLXXIX of 2011 § 6 for bilingual place- and street-name signs.

const LAYERS = {
  key: "hucounties",
  size: [1000,624],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.22,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[45.7,16.1],[48.6,22.9]],"maxBounds":[[43,12],[51,27]]},
  hintLabel: "Color by county",
  exploreKind: "counties",
  kinds: [
    {
      key: "counties",
      label: "Counties",
      noun: ["county","counties"],
      prompt: "name",
      groups: [["Central Hungary","",["HU110","HU120"]],["Transdanubia","",["HU231","HU211","HU221","HU212","HU232","HU233","HU222","HU213","HU223"]],["Great Plain and North","",["HU331","HU332","HU311","HU333","HU321","HU312","HU322","HU313","HU323"]]],
      areas: "@county",
      name: {"x":{"HU110":"Budapest","HU120":"Pest","HU231":"Baranya","HU211":"Fejér","HU221":"Győr-Moson-Sopron","HU212":"Komárom-Esztergom","HU232":"Somogy","HU233":"Tolna","HU222":"Vas","HU213":"Veszprém","HU223":"Zala","HU331":"Bács-Kiskun","HU332":"Békés","HU311":"Borsod-Abaúj-Zemplén","HU333":"Csongrád-Csanád","HU321":"Hajdú-Bihar","HU312":"Heves","HU322":"Jász-Nagykun-Szolnok","HU313":"Nógrád","HU323":"Szabolcs-Szatmár-Bereg"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"HU110":"Budapest","HU120":"Pest","HU231":"Southern Transdanubia","HU211":"Central Transdanubia","HU221":"Western Transdanubia","HU212":"Central Transdanubia","HU232":"Southern Transdanubia","HU233":"Southern Transdanubia","HU222":"Western Transdanubia","HU213":"Central Transdanubia","HU223":"Western Transdanubia","HU331":"Southern Great Plain","HU332":"Southern Great Plain","HU311":"Northern Hungary","HU333":"Southern Great Plain","HU321":"Northern Great Plain","HU312":"Northern Hungary","HU322":"Northern Great Plain","HU313":"Northern Hungary","HU323":"Northern Great Plain"}},
      about: {"x":{"HU110":["Budapest","Capital"],"HU120":["Pest","Seat: Budapest"],"HU231":["Southern Transdanubia","Seat: Pécs"],"HU211":["Central Transdanubia","Seat: Székesfehérvár"],"HU221":["Western Transdanubia","Seat: Győr"],"HU212":["Central Transdanubia","Seat: Tatabánya"],"HU232":["Southern Transdanubia","Seat: Kaposvár"],"HU233":["Southern Transdanubia","Seat: Szekszárd"],"HU222":["Western Transdanubia","Seat: Szombathely"],"HU213":["Central Transdanubia","Seat: Veszprém"],"HU223":["Western Transdanubia","Seat: Zalaegerszeg"],"HU331":["Southern Great Plain","Seat: Kecskemét"],"HU332":["Southern Great Plain","Seat: Békéscsaba"],"HU311":["Northern Hungary","Seat: Miskolc"],"HU333":["Southern Great Plain","Seat: Szeged"],"HU321":["Northern Great Plain","Seat: Debrecen"],"HU312":["Northern Hungary","Seat: Eger"],"HU322":["Northern Great Plain","Seat: Szolnok"],"HU313":["Northern Hungary","Seat: Salgótarján"],"HU323":["Northern Great Plain","Seat: Nyíregyháza"]}},
      clicked: "{name}",
    },
    {
      key: "regions",
      label: "Regions",
      noun: ["region","regions"],
      prompt: "name",
      groups: [["Central Hungary","",["HU11","HU12"]],["Transdanubia","",["HU21","HU22","HU23"]],["Great Plain and North","",["HU31","HU32","HU33"]]],
      areas: "@id^",
      name: {"x":{"HU11":"Budapest","HU12":"Pest","HU21":"Central Transdanubia","HU22":"Western Transdanubia","HU23":"Southern Transdanubia","HU31":"Northern Hungary","HU32":"Northern Great Plain","HU33":"Southern Great Plain"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"HU11":"Budapest","HU12":"Pest","HU21":"Fejér, Komárom-Esztergom, Veszprém","HU22":"Győr-Moson-Sopron, Vas, Zala","HU23":"Baranya, Somogy, Tolna","HU31":"Borsod-Abaúj-Zemplén, Heves, Nógrád","HU32":"Hajdú-Bihar, Jász-Nagykun-Szolnok, Szabolcs-Szatmár-Bereg","HU33":"Bács-Kiskun, Békés, Csongrád-Csanád"}},
      about: "{chipTitle}",
      clicked: "{name}",
    },
    {
      key: "signs",
      label: "Sign languages",
      noun: ["language","languages"],
      prompt: "name",
      hints: false,
      dim: false,
      areaRank: false,
      groups: [["Languages","",["GE","CR","SK","RO","RU","SL","SE","GR"]]],
      areas: {"x":{"GE":["HU120-GE","HU211-GE","HU212-GE","HU213-GE","HU221-GE","HU222-GE","HU222-GE.SL","HU223-GE","HU231-GE","HU231-GE.CR","HU232-GE","HU233-GE","HU311-GE","HU312-GE","HU313-GE","HU323-GE","HU331-GE","HU332-GE"],"CR":["HU221-CR","HU222-CR","HU223-CR","HU231-CR","HU231-GE.CR","HU232-CR","HU331-CR"],"SK":["HU120-SK","HU212-SK","HU311-SK","HU312-SK","HU313-SK","HU331-SK","HU332-SK","HU333-SK"],"RO":["HU321-RO","HU332-RO","HU333-RO"],"RU":["HU311-RU"],"SL":["HU222-GE.SL","HU222-SL"],"SE":["HU120-SE"],"GR":["HU211-GR"]}},
      name: {"x":{"GE":"German","CR":"Croatian","SK":"Slovak","RO":"Romanian","RU":"Rusyn","SL":"Slovene","SE":"Serbian","GR":"Greek"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"GE":"Pilisvörösvár, Taksony, Pilisszentiván","CR":"Dusnok, Kópháza, Hercegszántó","SK":"Tótkomlós, Pilisszántó, Piliscsév","RO":"Battonya, Kétegyháza, Méhkerék","RU":"Sajópálfala, Garadna, Komlóska","SL":"Felsőszölnök, Apátistvánfalva, Alsószölnök","SE":"Lórév","GR":"Beloiannisz"}},
      about: {"x":{"GE":["151 settlements","Pilisvörösvár, Taksony, Pilisszentiván"],"CR":["46 settlements","Dusnok, Kópháza, Hercegszántó"],"SK":["33 settlements","Tótkomlós, Pilisszántó, Piliscsév"],"RO":["10 settlements","Battonya, Kétegyháza, Méhkerék"],"RU":["7 settlements","Sajópálfala, Garadna, Komlóska"],"SL":["6 settlements","Felsőszölnök, Apátistvánfalva, Alsószölnök"],"SE":["1 settlement","Lórév"],"GR":["1 settlement","Beloiannisz"]}},
      clicked: {"t":"{name}","x":{"HU110":"Budapest · Hungarian only","HU120":"Pest · Hungarian only","HU211":"Fejér · Hungarian only","HU212":"Komárom-Esztergom · Hungarian only","HU213":"Veszprém · Hungarian only","HU221":"Győr-Moson-Sopron · Hungarian only","HU222":"Vas · Hungarian only","HU222-GE.SL":"German · Slovene","HU223":"Zala · Hungarian only","HU231":"Baranya · Hungarian only","HU231-GE.CR":"German · Croatian","HU232":"Somogy · Hungarian only","HU233":"Tolna · Hungarian only","HU311":"Borsod-Abaúj-Zemplén · Hungarian only","HU312":"Heves · Hungarian only","HU313":"Nógrád · Hungarian only","HU321":"Hajdú-Bihar · Hungarian only","HU322":"Jász-Nagykun-Szolnok · Hungarian only","HU323":"Szabolcs-Szatmár-Bereg · Hungarian only","HU331":"Bács-Kiskun · Hungarian only","HU332":"Békés · Hungarian only","HU333":"Csongrád-Csanád · Hungarian only"}},
    },
  ],
  g: "{@county}",
  explore: {"t":{"code":"{counties.name}","title":"{regions.name}","sub":["{signs.name}","{@places}"]},"x":{"HU110":{"code":"Budapest","title":"Budapest","sub":""},"HU120":{"code":"Pest","title":"Pest","sub":""},"HU211":{"code":"Fejér","title":"Central Transdanubia","sub":""},"HU212":{"code":"Komárom-Esztergom","title":"Central Transdanubia","sub":""},"HU213":{"code":"Veszprém","title":"Central Transdanubia","sub":""},"HU221":{"code":"Győr-Moson-Sopron","title":"Western Transdanubia","sub":""},"HU222":{"code":"Vas","title":"Western Transdanubia","sub":""},"HU223":{"code":"Zala","title":"Western Transdanubia","sub":""},"HU231":{"code":"Baranya","title":"Southern Transdanubia","sub":""},"HU232":{"code":"Somogy","title":"Southern Transdanubia","sub":""},"HU233":{"code":"Tolna","title":"Southern Transdanubia","sub":""},"HU311":{"code":"Borsod-Abaúj-Zemplén","title":"Northern Hungary","sub":""},"HU312":{"code":"Heves","title":"Northern Hungary","sub":""},"HU313":{"code":"Nógrád","title":"Northern Hungary","sub":""},"HU321":{"code":"Hajdú-Bihar","title":"Northern Great Plain","sub":""},"HU322":{"code":"Jász-Nagykun-Szolnok","title":"Northern Great Plain","sub":""},"HU323":{"code":"Szabolcs-Szatmár-Bereg","title":"Northern Great Plain","sub":""},"HU331":{"code":"Bács-Kiskun","title":"Southern Great Plain","sub":""},"HU332":{"code":"Békés","title":"Southern Great Plain","sub":""},"HU333":{"code":"Csongrád-Csanád","title":"Southern Great Plain","sub":""},"HU222-GE.SL":{"code":"Vas","title":"Western Transdanubia","sub":["German · Slovene","Alsószölnök"]},"HU231-GE.CR":{"code":"Baranya","title":"Southern Transdanubia","sub":["German · Croatian","Aranyosgadány"]}}},
};
