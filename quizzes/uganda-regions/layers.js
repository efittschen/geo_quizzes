// Uganda Regions. The 4 regions and the 136 districts of Uganda (135 and Kampala, as of 1 July 2020: Terego the newest,
// cut out of Arua by its county). Map areas: the districts of UBOS's boundaries of 2020, and for Arua its counties (Vurra,
// Ayivu, Arua Municipality, all Arua here, and Terego). The 10 cities created in 2020 (Arua, Fort Portal, Gulu, Hoima, Jinja,
// Lira, Masaka, Mbale, Mbarara, Soroti), which UBOS counts beside the districts as the "146", are left in the districts
// they were cut from: the open boundaries do not draw them. The large lakes are cut out (Victoria, Kyoga, Albert,
// Edward, George, Kwania), so island districts show their islands (Kalangala, Buvuma). Names as the districts write
// them: Luweero, Ssembabule, Kassanda, Madi-Okollo.
//
// Sources: UBOS district boundaries (2020), via OCHA COD-AB (cod-ab-uga, CC BY-IGO); lakes: Natural Earth 1:10m (public
// domain); districts since 2020: Ministry of Local Government, as listed on Wikipedia "Districts of Uganda".

const LAYERS = {
  key: "ugregions",
  size: [1000, 1054],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.25,
  fly: {"pad":1.6,"min":0.0375},
  street: {"bounds":[[-1.6,29.4],[4.4,35.2]],"maxBounds":[[-6,21],[9,44]]},
  hintLabel: "Color by district",
  exploreKind: "districts",
  kinds: [
    {
      key: "regions",
      label: "Regions",
      noun: ["region","regions"],
      prompt: "name",
      hints: false,
      groups: [["Regions","",["UG1","UG4","UG2","UG3"]]],
      areas: "@rg",
      name: {"x":{"UG1":"Central","UG4":"Western","UG2":"Eastern","UG3":"Northern"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"UG1":"26 districts","UG4":"35 districts","UG2":"37 districts","UG3":"38 districts"}},
      about: {"x":{"UG1":["26 districts"],"UG4":["35 districts"],"UG2":["37 districts"],"UG3":["38 districts"]}},
      clicked: "{name}",
    },
    {
      key: "districts",
      label: "Districts",
      noun: ["district","districts"],
      prompt: "name",
      groups: [["Central","",["UG1001","UG1002","UG1003","UG1004","UG1005","UG1006","UG1007","UG1008","UG1009","UG1010","UG1011","UG1012","UG1013","UG1014","UG1015","UG1016","UG1017","UG1018","UG1019","UG1020","UG1021","UG1022","UG1023","UG1024","UG1025","UG1026"]],["Western","",["UG4101","UG4102","UG4103","UG4104","UG4105","UG4106","UG4107","UG4108","UG4109","UG4110","UG4111","UG4112","UG4113","UG4114","UG4115","UG4116","UG4117","UG4118","UG4119","UG4120","UG4121","UG4122","UG4123","UG4124","UG4125","UG4126","UG4127","UG4128","UG4129","UG4130","UG4131","UG4132","UG4133","UG4134","UG4135"]],["Eastern","",["UG2027","UG2028","UG2029","UG2030","UG2031","UG2032","UG2033","UG2034","UG2035","UG2036","UG2037","UG2038","UG2039","UG2040","UG2041","UG2042","UG2043","UG2044","UG2045","UG2046","UG2047","UG2048","UG2049","UG2050","UG2051","UG2052","UG2053","UG2054","UG2055","UG2056","UG2057","UG2058","UG2059","UG2060","UG2061","UG2062","UG2063"]],["Northern","",["UG3064","UG3065","UG3066","UG3067","UG3068","UG3069","UG3070","UG3071","UG3072","UG3073","UG3074","UG3075","UG3076","UG3077","UG3078","UG3079","UG3080","UG3081","UG3082","UG3083","UG3084","UG3085","UG3086","UG3087","UG3088","UG3089","UG3090","UG3091","UG3092","UG3093","UG3094","UG3095","UG3096","UG3097","UG3098","UG3TER","UG3099","UG3100"]]],
      areas: "@ds",
      name: {"x":{"UG1001":"Buikwe","UG1002":"Bukomansimbi","UG1003":"Butambala","UG1004":"Buvuma","UG1005":"Gomba","UG1006":"Kalangala","UG1007":"Kalungu","UG1008":"Kampala","UG1009":"Kassanda","UG1010":"Kayunga","UG1011":"Kiboga","UG1012":"Kyankwanzi","UG1013":"Kyotera","UG1014":"Luweero","UG1015":"Lwengo","UG1016":"Lyantonde","UG1017":"Masaka","UG1018":"Mityana","UG1019":"Mpigi","UG1020":"Mubende","UG1021":"Mukono","UG1022":"Nakaseke","UG1023":"Nakasongola","UG1024":"Rakai","UG1025":"Ssembabule","UG1026":"Wakiso","UG4101":"Buhweju","UG4102":"Buliisa","UG4103":"Bundibugyo","UG4104":"Bunyangabu","UG4105":"Bushenyi","UG4106":"Hoima","UG4107":"Ibanda","UG4108":"Isingiro","UG4109":"Kabale","UG4110":"Kabarole","UG4111":"Kagadi","UG4112":"Kakumiro","UG4113":"Kamwenge","UG4114":"Kanungu","UG4115":"Kasese","UG4116":"Kazo","UG4117":"Kibaale","UG4118":"Kikuube","UG4119":"Kiruhura","UG4120":"Kiryandongo","UG4121":"Kisoro","UG4122":"Kitagwenda","UG4123":"Kyegegwa","UG4124":"Kyenjojo","UG4125":"Masindi","UG4126":"Mbarara","UG4127":"Mitooma","UG4128":"Ntoroko","UG4129":"Ntungamo","UG4130":"Rubanda","UG4131":"Rubirizi","UG4132":"Rukiga","UG4133":"Rukungiri","UG4134":"Rwampara","UG4135":"Sheema","UG2027":"Amuria","UG2028":"Budaka","UG2029":"Bududa","UG2030":"Bugiri","UG2031":"Bugweri","UG2032":"Bukedea","UG2033":"Bukwo","UG2034":"Bulambuli","UG2035":"Busia","UG2036":"Butaleja","UG2037":"Butebo","UG2038":"Buyende","UG2039":"Iganga","UG2040":"Jinja","UG2041":"Kaberamaido","UG2042":"Kalaki","UG2043":"Kaliro","UG2044":"Kamuli","UG2045":"Kapchorwa","UG2046":"Kapelebyong","UG2047":"Katakwi","UG2048":"Kibuku","UG2049":"Kumi","UG2050":"Kween","UG2051":"Luuka","UG2052":"Manafwa","UG2053":"Mayuge","UG2054":"Mbale","UG2055":"Namayingo","UG2056":"Namisindwa","UG2057":"Namutumba","UG2058":"Ngora","UG2059":"Pallisa","UG2060":"Serere","UG2061":"Sironko","UG2062":"Soroti","UG2063":"Tororo","UG3064":"Abim","UG3065":"Adjumani","UG3066":"Agago","UG3067":"Alebtong","UG3068":"Amolatar","UG3069":"Amudat","UG3070":"Amuru","UG3071":"Apac","UG3072":"Arua","UG3073":"Dokolo","UG3074":"Gulu","UG3075":"Kaabong","UG3076":"Karenga","UG3077":"Kitgum","UG3078":"Koboko","UG3079":"Kole","UG3080":"Kotido","UG3081":"Kwania","UG3082":"Lamwo","UG3083":"Lira","UG3084":"Madi-Okollo","UG3085":"Maracha","UG3086":"Moroto","UG3087":"Moyo","UG3088":"Nabilatuk","UG3089":"Nakapiripirit","UG3090":"Napak","UG3091":"Nebbi","UG3092":"Nwoya","UG3093":"Obongi","UG3094":"Omoro","UG3095":"Otuke","UG3096":"Oyam","UG3097":"Pader","UG3098":"Pakwach","UG3TER":"Terego","UG3099":"Yumbe","UG3100":"Zombo"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"t":["{group}"],"x":{"UG3072":["Northern","With Arua City"],"UG3TER":["Northern","Since 2020, from Arua"],"UG1008":["Central","Kampala Capital City"]}},
      clicked: "{name}",
    },
  ],
  g: "{@ds}",
  explore: {"t":{"code":"{districts.name}","title":"{regions.name}","sub":[]}},
};
