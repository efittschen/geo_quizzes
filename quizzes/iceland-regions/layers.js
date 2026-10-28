// Iceland Regions. Each map area is one of the 61 sveitarfélög (municipalities, as of September 2026), grouped into
// the 8 landshlutar (regions), as Landmælingar Íslands draws them. Names in Icelandic: a municipality named after its
// one town by the town's name (Reykjavík for Reykjavíkurborg, Hafnarfjörður for Hafnarfjarðarkaupstaður, Árborg for
// Sveitarfélagið Árborg; the official name is said beside it); the English name of each region beside it.
//
// Sources: Landmælingar Íslands (National Land Survey of Iceland), IS 50V, version of 24.09.2026 (CC BY 4.0):
// mork_sveitarf_flakar (municipalities) and landshlutar (regions).

const LAYERS = {
  key: "isregions",
  borders: "[DATA.rb]",
  size: [1000, 700],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.22,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[63.1,-24.7],[66.7,-13.3]],"maxBounds":[[59,-33],[71,-5]]},
  hintLabel: "Color by region",
  exploreKind: "municipalities",
  kinds: [
    {
      key: "regions",
      label: "Regions",
      noun: ["region","regions"],
      prompt: "name",
      hints: false,
      areaRank: false,
      groups: [["Landshlutar","",["1","2","3","4","5","6","7","8"]]],
      areas: "@rg",
      name: {"x":{"1":"Höfuðborgarsvæðið","2":"Suðurnes","3":"Vesturland","4":"Vestfirðir","5":"Norðurland vestra","6":"Norðurland eystra","7":"Austurland","8":"Suðurland"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"1":"Capital Region","2":"Southern Peninsula","3":"Western Region","4":"Westfjords","5":"Northwestern Region","6":"Northeastern Region","7":"Eastern Region","8":"Southern Region"}},
      about: {"x":{"1":["Capital Region","7 sveitarfélög"],"2":["Southern Peninsula","4 sveitarfélög"],"3":["Western Region","8 sveitarfélög"],"4":["Westfjords","8 sveitarfélög"],"5":["Northwestern Region","4 sveitarfélög"],"6":["Northeastern Region","11 sveitarfélög"],"7":["Eastern Region","4 sveitarfélög"],"8":["Southern Region","15 sveitarfélög"]}},
      clicked: "{name}",
    },
    {
      key: "municipalities",
      label: "Municipalities",
      noun: ["municipality","municipalities"],
      prompt: "name",
      groups: [["Höfuðborgarsvæðið","Capital Region",["1300","1400","1606","1000","1604","0000","1100"]],["Suðurnes","Southern Peninsula",["2300","2000","2510","2506"]],["Vesturland","Western Region",["3000","3506","3811","3713","3709","3511","3714","3716"]],["Vestfirðir","Westfjords",["4901","4100","4200","4902","4502","4911","4803","4604"]],["Norðurland vestra","Northwestern Region",["5613","5508","5716","5609"]],["Norðurland eystra","Northeastern Region",["6000","6400","6513","6250","6602","6515","6710","6100","6601","6611","6613"]],["Austurland","Eastern Region",["7300","7505","7400","7502"]],["Suðurland","Southern Region",["8200","8610","8721","8722","8719","8401","8710","8716","8508","8613","8614","8509","8720","8000","8717"]]],
      areas: "@id",
      name: "{@name}",
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"x":{"1000":["Kópavogsbær","Höfuðborgarsvæðið"],"1100":["Seltjarnarnesbær","Höfuðborgarsvæðið"],"1300":["Höfuðborgarsvæðið"],"1400":["Hafnarfjarðarkaupstaður","Höfuðborgarsvæðið"],"1604":["Höfuðborgarsvæðið"],"1606":["Höfuðborgarsvæðið"],"2000":["Suðurnes"],"2300":["Grindavíkurbær","Suðurnes"],"2506":["Sveitarfélagið Vogar","Suðurnes"],"2510":["Suðurnes"],"3000":["Akraneskaupstaður","Vesturland"],"3506":["Vesturland"],"3511":["Vesturland"],"3709":["Grundarfjarðarbær","Vesturland"],"3713":["Vesturland"],"3714":["Vesturland"],"3716":["Sveitarfélagið Stykkishólmur","Vesturland"],"3811":["Vesturland"],"4100":["Bolungarvíkurkaupstaður","Vestfirðir"],"4200":["Vestfirðir"],"4502":["Vestfirðir"],"4604":["Vestfirðir"],"4803":["Vestfirðir"],"4901":["Vestfirðir"],"4902":["Vestfirðir"],"4911":["Vestfirðir"],"5508":["Norðurland vestra"],"5609":["Sveitarfélagið Skagaströnd","Norðurland vestra"],"5613":["Norðurland vestra"],"5716":["Norðurland vestra"],"6000":["Akureyrarbær","Norðurland eystra"],"6100":["Norðurland eystra"],"6250":["Norðurland eystra"],"6400":["Norðurland eystra"],"6513":["Norðurland eystra"],"6515":["Norðurland eystra"],"6601":["Norðurland eystra"],"6602":["Norðurland eystra"],"6611":["Norðurland eystra"],"6613":["Norðurland eystra"],"6710":["Norðurland eystra"],"7300":["Austurland"],"7400":["Austurland"],"7502":["Austurland"],"7505":["Austurland"],"8000":["Vestmannaeyjabær","Suðurland"],"8200":["Sveitarfélagið Árborg","Suðurland"],"8401":["Sveitarfélagið Hornafjörður","Suðurland"],"8508":["Suðurland"],"8509":["Suðurland"],"8610":["Suðurland"],"8613":["Suðurland"],"8614":["Suðurland"],"8710":["Suðurland"],"8716":["Hveragerðisbær","Suðurland"],"8717":["Sveitarfélagið Ölfus","Suðurland"],"8719":["Suðurland"],"8720":["Suðurland"],"8721":["Suðurland"],"8722":["Suðurland"],"0000":["Reykjavíkurborg","Höfuðborgarsvæðið"]}},
      clicked: "{name}",
    },
  ],
  g: "{@rg}",
  explore: {"t":{"code":"{municipalities.name}","title":"{regions.name}","sub":["{@official}"]}},
};
