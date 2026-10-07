// Malaysia Area Codes. Each map area is a district (DOSM) with its area code.
// Codes and state rule: MCMC Numbering and Electronic Addressing Plan, Fig. 6.2 (03 KL/Putrajaya/Selangor, 04 Perlis/
// Kedah/Penang, 05 Perak, 06 Negeri Sembilan/Melaka, 07 Johor, 08X Sarawak, 08Y Sabah, 087 Labuan, 09 Pahang/
// Terengganu/Kelantan) and its border exceptions (Fig. 6.3) where police and council numbers confirm them: Muar and
// Tangkak 06, Cameron Highlands 05, Pengkalan Hulu 04, Ulu Bernam 05. Genting Highlands (03) has no area of its own.
// Sabah and Sarawak: each district's code from its district office (Sabah state protocol directory) or police
// stations (PDRM directory), since the plan only splits 08 by state.

const LAYERS = {
  key: "mycodes",
  size: [1000,336],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.3,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[0.8,99.6],[7.4,119.3]],"maxBounds":[[-6,90],[14,128]]},
  hintLabel: "Color by first two digits",
  exploreKind: "codes",
  kinds: [
    {
      key: "codes",
      label: "Area codes",
      noun: ["code","codes"],
      prompt: "dial",
      groups: [["Peninsula","",["03","04","05","06","07","09"]],["Sarawak","",["082","083","084","085","086"]],["Sabah & Labuan","",["087","088","089"]]],
      areas: "@code",
      name: "{id}",
      short: "{id}",
      chip: "{id}",
      chipTitle: {"x":{"03":"Kuala Lumpur, Putrajaya, Selangor","04":"Perlis, Kedah, Penang","05":"Perak","06":"Negeri Sembilan, Melaka","07":"Johor","09":"Pahang, Terengganu, Kelantan","082":"Kuching, Samarahan, Serian","083":"Sri Aman, Betong","084":"Sibu, Sarikei, Mukah, Kapit","085":"Miri, Limbang","086":"Bintulu, Belaga","087":"Labuan, Sabah interior","088":"Kota Kinabalu, Kudat","089":"Sandakan, Tawau"}},
      detail: ["Show main city",{"x":{"03":"Kuala Lumpur","04":"George Town","05":"Ipoh","06":"Seremban","07":"Johor Bahru","09":"Kuantan","082":"Kuching","083":"Sri Aman","084":"Sibu","085":"Miri","086":"Bintulu","087":"Labuan","088":"Kota Kinabalu","089":"Sandakan"}}],
      about: {"t":["{chipTitle}"],"x":{"03":["Kuala Lumpur, Putrajaya, Selangor","Also Genting Highlands, Pahang"],"04":["Perlis, Kedah, Penang","Also Pengkalan Hulu, Perak"],"05":["Perak","Also Cameron Highlands, Pahang · Ulu Bernam, Selangor"],"06":["Negeri Sembilan, Melaka","Also Muar and Tangkak, Johor"],"083":["Sri Aman, Betong","Also Sebuyau, Samarahan Division"],"087":["Labuan, Sabah interior","Also Tongod, Sandakan Division"]}},
      dial: {"x":{"03":[["0","cold"],["3","hot"]],"04":[["0","cold"],["4","hot"]],"05":[["0","cold"],["5","hot"]],"06":[["0","cold"],["6","hot"]],"07":[["0","cold"],["7","hot"]],"09":[["0","cold"],["9","hot"]],"082":[["0","cold"],["82","hot"]],"083":[["0","cold"],["83","hot"]],"084":[["0","cold"],["84","hot"]],"085":[["0","cold"],["85","hot"]],"086":[["0","cold"],["86","hot"]],"087":[["0","cold"],["87","hot"]],"088":[["0","cold"],["88","hot"]],"089":[["0","cold"],["89","hot"]]}},
      clicked: "{p} · {@district}",
      presets: [["Big cities",["03","04","05","06","07","09","082","088"]]],
    },
    {
      key: "zones",
      label: "First two digits",
      noun: ["zone","zones"],
      prompt: "dial",
      hints: false,
      groups: [["Zones","",["03","04","05","06","07","08","09"]]],
      areas: {"x":{"03":["d10-1","d10-2","d10-3","d10-4","d10-5","d10-6","d10-7","d10-8","d10-9","d14-1","d16-1"],"04":["d2-1","d2-2","d2-3","d2-4","d2-5","d2-6","d2-7","d2-8","d2-9","d2-10","d2-11","d2-12","d7-1","d7-2","d7-3","d7-4","d7-5","d8-8x","d9-1"],"05":["d6-2","d8-1","d8-2","d8-3","d8-4","d8-5","d8-6","d8-7","d8-8","d8-9","d8-10","d8-11","d8-12","d8-13","d10-9x"],"06":["d1-6","d1-10","d4-1","d4-2","d4-3","d5-1","d5-2","d5-3","d5-4","d5-5","d5-6","d5-7"],"07":["d1-1","d1-2","d1-3","d1-4","d1-5","d1-7","d1-8","d1-9"],"08":["d13-1","d13-2","d13-3","d13-4","d13-5","d13-6","d13-29","d13-32","d13-7","d13-8","d13-9","d13-10","d13-33","d13-34","d13-11","d13-12","d13-13","d13-14","d13-15","d13-16","d13-17","d13-18","d13-21","d13-22","d13-28","d13-30","d13-31","d13-35","d13-37","d13-24","d13-25","d13-26","d13-27","d13-38","d13-39","d13-40","d13-19","d13-20","d13-23","d13-36","d12-16","d12-17","d12-18","d12-19","d12-20","d12-21","d12-22","d12-24","d15-1","d12-7","d12-8","d12-9","d12-10","d12-11","d12-12","d12-13","d12-14","d12-15","d12-25","d12-1","d12-2","d12-3","d12-4","d12-5","d12-6","d12-23","d12-26","d12-27"],"09":["d3-1","d3-2","d3-3","d3-4","d3-5","d3-6","d3-7","d3-8","d3-9","d3-10","d3-11","d6-1","d6-3","d6-4","d6-5","d6-6","d6-7","d6-8","d6-9","d6-10","d6-11","d11-1","d11-2","d11-3","d11-4","d11-5","d11-6","d11-7","d11-8"]}},
      name: {"t":"{id}","x":{"08":"08x"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"03":"Kuala Lumpur, Putrajaya, Selangor","04":"Perlis, Kedah, Penang","05":"Perak","06":"Negeri Sembilan, Melaka","07":"Johor","08":"Sabah, Sarawak, Labuan","09":"Pahang, Terengganu, Kelantan"}},
      about: {"x":{"03":["Kuala Lumpur, Putrajaya, Selangor","Also Genting Highlands, Pahang"],"04":["Perlis, Kedah, Penang","Also Pengkalan Hulu, Perak"],"05":["Perak","Also Cameron Highlands, Pahang · Ulu Bernam, Selangor"],"06":["Negeri Sembilan, Melaka","Also Muar and Tangkak, Johor"],"07":["Johor"],"08":["Sabah, Sarawak, Labuan","082, 083, 084, 085, 086, 087, 088, 089"],"09":["Pahang, Terengganu, Kelantan"]}},
      dial: {"x":{"03":[["0","cold"],["3","hot"]],"04":[["0","cold"],["4","hot"]],"05":[["0","cold"],["5","hot"]],"06":[["0","cold"],["6","hot"]],"07":[["0","cold"],["7","hot"]],"08":[["0","cold"],["8","hot"],["x","cold"]],"09":[["0","cold"],["9","hot"]]}},
      clicked: {"t":"{p} · {@district}","x":{"d12-1":"08x · Tawau","d12-2":"08x · Lahad Datu","d12-3":"08x · Semporna","d12-4":"08x · Sandakan","d12-5":"08x · Kinabatangan","d12-6":"08x · Beluran","d12-7":"08x · Kota Kinabalu","d12-8":"08x · Ranau","d12-9":"08x · Kota Belud","d12-10":"08x · Tuaran","d12-11":"08x · Penampang","d12-12":"08x · Papar","d12-13":"08x · Kudat","d12-14":"08x · Kota Marudu","d12-15":"08x · Pitas","d12-16":"08x · Beaufort","d12-17":"08x · Kuala Penyu","d12-18":"08x · Sipitang","d12-19":"08x · Tenom","d12-20":"08x · Nabawan","d12-21":"08x · Keningau","d12-22":"08x · Tambunan","d12-23":"08x · Kunak","d12-24":"08x · Tongod","d12-25":"08x · Putatan","d12-26":"08x · Telupid","d12-27":"08x · Kalabakan","d13-1":"08x · Kuching","d13-2":"08x · Bau","d13-3":"08x · Lundu","d13-4":"08x · Samarahan","d13-5":"08x · Serian","d13-6":"08x · Simunjan","d13-7":"08x · Sri Aman","d13-8":"08x · Lubok Antu","d13-9":"08x · Betong","d13-10":"08x · Saratok","d13-11":"08x · Sarikei","d13-12":"08x · Maradong","d13-13":"08x · Daro","d13-14":"08x · Julau","d13-15":"08x · Sibu","d13-16":"08x · Dalat","d13-17":"08x · Mukah","d13-18":"08x · Kanowit","d13-19":"08x · Bintulu","d13-20":"08x · Tatau","d13-21":"08x · Kapit","d13-22":"08x · Song","d13-23":"08x · Belaga","d13-24":"08x · Miri","d13-25":"08x · Marudi","d13-26":"08x · Limbang","d13-27":"08x · Lawas","d13-28":"08x · Matu","d13-29":"08x · Asajaya","d13-30":"08x · Pakan","d13-31":"08x · Selangau","d13-32":"08x · Tebedu","d13-33":"08x · Pusa","d13-34":"08x · Kabong","d13-35":"08x · Tanjung Manis","d13-36":"08x · Sebauh","d13-37":"08x · Bukit Mabong","d13-38":"08x · Subis","d13-39":"08x · Beluru","d13-40":"08x · Telang Usan","d15-1":"08x · W.P. Labuan"}},
    },
  ],
  g: "{zones.p}",
  explore: {"t":{"code":"{@code}","title":"{@district}","sub":"{@state}"},"x":{"d14-1":{"code":"03","title":"W.P. Kuala Lumpur","sub":"Kuala Lumpur"},"d15-1":{"code":"087","title":"W.P. Labuan","sub":"Labuan"},"d16-1":{"code":"03","title":"W.P. Putrajaya","sub":"Putrajaya"}}},
};
