// Germany Area Codes. Each map area is a group of area codes with the same first three digits (0212 Solingen and
// 02129 Haan: 212), the codes' own areas (Ortsnetzbereiche of the Bundesnetzagentur) merged into one (data.js). The
// zones of the first digit and the first two digits are groups of those, each drawn as one shape.

const LAYERS = {
  "key": "decodes",
  "phone": true,
  "size": [
    1000,
    1359
  ],
  "pad": 16,
  "maxZoom": 60,
  "labelScale": 0.12,
  "fly": {
    "pad": 2.5,
    "min": 0.016666666666666666
  },
  "street": {
    "bounds": [
      [
        47.27,
        5.87
      ],
      [
        55.06,
        15.04
      ]
    ],
    "maxBounds": [
      [
        44,
        0
      ],
      [
        58,
        22
      ]
    ]
  },
  "hintLabel": "Color by first two digits",
  "exploreKind": "digit3",
  "kinds": [
    {
      "key": "digit3",
      "label": "First three digits",
      "presets": [
        [
          "Big cities",
          [
            "30",
            "40",
            "89",
            "221",
            "69",
            "211",
            "711",
            "201",
            "231",
            "351",
            "421",
            "911",
            "511",
            "341",
            "203",
            "234"
          ]
        ]
      ],
      "noun": [
        "group",
        "groups"
      ],
      "prompt": "dial",
      "groups": [
        [
          "020x",
          "Essen, Wuppertal, Duisburg, Oberhausen Rheinl",
          [
            "201",
            "202",
            "203",
            "204",
            "205",
            "206",
            "208",
            "209"
          ]
        ],
        [
          "021x",
          "Düsseldorf, Solingen, Leverkusen",
          [
            "210",
            "211",
            "212",
            "213",
            "214",
            "215",
            "216",
            "217",
            "218",
            "219"
          ]
        ],
        [
          "022x",
          "Köln, Bonn",
          [
            "220",
            "221",
            "222",
            "223",
            "224",
            "225",
            "226",
            "227",
            "228",
            "229"
          ]
        ],
        [
          "023x",
          "Dortmund, Bochum",
          [
            "230",
            "231",
            "232",
            "233",
            "234",
            "235",
            "236",
            "237",
            "238",
            "239"
          ]
        ],
        [
          "024x",
          "Aachen",
          [
            "240",
            "241",
            "242",
            "243",
            "244",
            "245",
            "246",
            "247",
            "248"
          ]
        ],
        [
          "025x",
          "Münster",
          [
            "250",
            "251",
            "252",
            "253",
            "254",
            "255",
            "256",
            "257",
            "258",
            "259"
          ]
        ],
        [
          "026x",
          "Koblenz a Rhein",
          [
            "260",
            "261",
            "262",
            "263",
            "264",
            "265",
            "266",
            "267",
            "268",
            "269"
          ]
        ],
        [
          "027x",
          "Siegen",
          [
            "271",
            "272",
            "273",
            "274",
            "275",
            "276",
            "277"
          ]
        ],
        [
          "028x",
          "Wesel",
          [
            "280",
            "281",
            "282",
            "283",
            "284",
            "285",
            "286",
            "287"
          ]
        ],
        [
          "029x",
          "Meschede",
          [
            "290",
            "291",
            "292",
            "293",
            "294",
            "295",
            "296",
            "297",
            "298",
            "299"
          ]
        ],
        [
          "030x",
          "Berlin, Berlin",
          [
            "30"
          ]
        ],
        [
          "033x",
          "Potsdam, Frankfurt (Oder)",
          [
            "330",
            "331",
            "332",
            "333",
            "334",
            "335",
            "336",
            "337",
            "338",
            "339"
          ]
        ],
        [
          "034x",
          "Dessau Anh, Leipzig, Halle Saale",
          [
            "340",
            "341",
            "342",
            "343",
            "344",
            "345",
            "346",
            "347",
            "349"
          ]
        ],
        [
          "035x",
          "Dresden, Cottbus",
          [
            "350",
            "351",
            "352",
            "353",
            "354",
            "355",
            "356",
            "357",
            "358",
            "359"
          ]
        ],
        [
          "036x",
          "Erfurt, Gera",
          [
            "360",
            "361",
            "362",
            "363",
            "364",
            "365",
            "366",
            "367",
            "368",
            "369"
          ]
        ],
        [
          "037x",
          "Chemnitz Sachs, Zwickau",
          [
            "371",
            "372",
            "373",
            "374",
            "375",
            "376",
            "377"
          ]
        ],
        [
          "038x",
          "Rostock, Schwerin Meckl",
          [
            "381",
            "382",
            "383",
            "384",
            "385",
            "386",
            "387",
            "388"
          ]
        ],
        [
          "039x",
          "Magdeburg, Neubrandenburg",
          [
            "390",
            "391",
            "392",
            "393",
            "394",
            "395",
            "396",
            "397",
            "398",
            "399"
          ]
        ],
        [
          "040x",
          "Hamburg, Hamburg",
          [
            "40"
          ]
        ],
        [
          "041x",
          "Pinneberg, Ahrensburg, Wedel, Aumühle b Hamburg",
          [
            "410",
            "412",
            "413",
            "414",
            "415",
            "416",
            "417",
            "418",
            "419"
          ]
        ],
        [
          "042x",
          "Bremen",
          [
            "420",
            "421",
            "422",
            "423",
            "424",
            "425",
            "426",
            "427",
            "428",
            "429"
          ]
        ],
        [
          "043x",
          "Kiel",
          [
            "430",
            "431",
            "432",
            "433",
            "434",
            "435",
            "436",
            "437",
            "438",
            "439"
          ]
        ],
        [
          "044x",
          "Oldenburg (Oldb)",
          [
            "440",
            "441",
            "442",
            "443",
            "444",
            "445",
            "446",
            "447",
            "448",
            "449"
          ]
        ],
        [
          "045x",
          "Lübeck",
          [
            "450",
            "451",
            "452",
            "453",
            "454",
            "455",
            "456"
          ]
        ],
        [
          "046x",
          "Flensburg",
          [
            "460",
            "461",
            "462",
            "463",
            "464",
            "465",
            "466",
            "467",
            "468"
          ]
        ],
        [
          "047x",
          "Bremerhaven",
          [
            "470",
            "471",
            "472",
            "473",
            "474",
            "475",
            "476",
            "477",
            "479"
          ]
        ],
        [
          "048x",
          "Heide Holst",
          [
            "480",
            "481",
            "482",
            "483",
            "484",
            "485",
            "486",
            "487",
            "488",
            "489"
          ]
        ],
        [
          "049x",
          "Leer Ostfriesland",
          [
            "490",
            "491",
            "492",
            "493",
            "494",
            "495",
            "496",
            "497"
          ]
        ],
        [
          "050x",
          "Nienburg Weser, Wietzen, Liebenau Kr Nieburg Weser, Rohrsen Kr Nienburg Weser",
          [
            "502",
            "503",
            "504",
            "505",
            "506",
            "507",
            "508"
          ]
        ],
        [
          "051x",
          "Hannover",
          [
            "510",
            "511",
            "512",
            "513",
            "514",
            "515",
            "516",
            "517",
            "518",
            "519"
          ]
        ],
        [
          "052x",
          "Bielefeld",
          [
            "520",
            "521",
            "522",
            "523",
            "524",
            "525",
            "526",
            "527",
            "528",
            "529"
          ]
        ],
        [
          "053x",
          "Braunschweig",
          [
            "530",
            "531",
            "532",
            "533",
            "534",
            "535",
            "536",
            "537",
            "538"
          ]
        ],
        [
          "054x",
          "Osnabrück",
          [
            "540",
            "541",
            "542",
            "543",
            "544",
            "545",
            "546",
            "547",
            "548",
            "549"
          ]
        ],
        [
          "055x",
          "Göttingen",
          [
            "550",
            "551",
            "552",
            "553",
            "554",
            "555",
            "556",
            "557",
            "558",
            "559"
          ]
        ],
        [
          "056x",
          "Kassel",
          [
            "560",
            "561",
            "562",
            "563",
            "564",
            "565",
            "566",
            "567",
            "568",
            "569"
          ]
        ],
        [
          "057x",
          "Minden Westf",
          [
            "570",
            "571",
            "572",
            "573",
            "574",
            "575",
            "576",
            "577"
          ]
        ],
        [
          "058x",
          "Uelzen",
          [
            "580",
            "581",
            "582",
            "583",
            "584",
            "585",
            "586",
            "587",
            "588"
          ]
        ],
        [
          "059x",
          "Lingen (Ems)",
          [
            "590",
            "591",
            "592",
            "593",
            "594",
            "595",
            "596",
            "597"
          ]
        ],
        [
          "060x",
          "Ober-Mörlen, Rosbach v d Höhe, Lich-Eberstadt, Rosbach-Rodheim",
          [
            "600",
            "602",
            "603",
            "604",
            "605",
            "606",
            "607",
            "608",
            "609"
          ]
        ],
        [
          "061x",
          "Wiesbaden",
          [
            "610",
            "611",
            "612",
            "613",
            "614",
            "615",
            "616",
            "617",
            "618",
            "619"
          ]
        ],
        [
          "062x",
          "Mannheim",
          [
            "620",
            "621",
            "622",
            "623",
            "624",
            "625",
            "626",
            "627",
            "628",
            "629"
          ]
        ],
        [
          "063x",
          "Kaiserslautern",
          [
            "630",
            "631",
            "632",
            "633",
            "634",
            "635",
            "636",
            "637",
            "638",
            "639"
          ]
        ],
        [
          "064x",
          "Gießen",
          [
            "640",
            "641",
            "642",
            "643",
            "644",
            "645",
            "646",
            "647",
            "648"
          ]
        ],
        [
          "065x",
          "Trier",
          [
            "650",
            "651",
            "652",
            "653",
            "654",
            "655",
            "656",
            "657",
            "658",
            "659"
          ]
        ],
        [
          "066x",
          "Fulda",
          [
            "661",
            "662",
            "663",
            "664",
            "665",
            "666",
            "667",
            "668",
            "669"
          ]
        ],
        [
          "067x",
          "Bad Kreuznach",
          [
            "670",
            "671",
            "672",
            "673",
            "674",
            "675",
            "676",
            "677",
            "678"
          ]
        ],
        [
          "068x",
          "Saarbrücken",
          [
            "680",
            "681",
            "682",
            "683",
            "684",
            "685",
            "686",
            "687",
            "688",
            "689"
          ]
        ],
        [
          "069x",
          "Frankfurt am Main, Frankfurt am Main",
          [
            "69"
          ]
        ],
        [
          "070x",
          "Kirchheim unter Teck, Nürtingen, Weilheim an der Teck, Wendlingen am Neckar",
          [
            "702",
            "703",
            "704",
            "705",
            "706",
            "707",
            "708"
          ]
        ],
        [
          "071x",
          "Stuttgart",
          [
            "711",
            "712",
            "713",
            "714",
            "715",
            "716",
            "717",
            "718",
            "719"
          ]
        ],
        [
          "072x",
          "Karlsruhe",
          [
            "720",
            "721",
            "722",
            "723",
            "724",
            "725",
            "726",
            "727"
          ]
        ],
        [
          "073x",
          "Ulm Donau",
          [
            "730",
            "731",
            "732",
            "733",
            "734",
            "735",
            "736",
            "737",
            "738",
            "739"
          ]
        ],
        [
          "074x",
          "Rottweil",
          [
            "740",
            "741",
            "742",
            "743",
            "744",
            "745",
            "746",
            "747",
            "748"
          ]
        ],
        [
          "075x",
          "Ravensburg",
          [
            "750",
            "751",
            "752",
            "753",
            "754",
            "755",
            "756",
            "757",
            "758"
          ]
        ],
        [
          "076x",
          "Freiburg im Breisgau",
          [
            "760",
            "761",
            "762",
            "763",
            "764",
            "765",
            "766",
            "767",
            "768"
          ]
        ],
        [
          "077x",
          "Donaueschingen",
          [
            "770",
            "771",
            "772",
            "773",
            "774",
            "775",
            "776",
            "777"
          ]
        ],
        [
          "078x",
          "Offenburg",
          [
            "780",
            "781",
            "782",
            "783",
            "784",
            "785"
          ]
        ],
        [
          "079x",
          "Schwäbisch Hall",
          [
            "790",
            "791",
            "793",
            "794",
            "795",
            "796",
            "797"
          ]
        ],
        [
          "080x",
          "Weyarn, Waakirchen, Tegernsee, Bayrischzell",
          [
            "802",
            "803",
            "804",
            "805",
            "806",
            "807",
            "808",
            "809"
          ]
        ],
        [
          "081x",
          "Hallbergmoos",
          [
            "810",
            "811",
            "812",
            "813",
            "814",
            "815",
            "816",
            "817",
            "819"
          ]
        ],
        [
          "082x",
          "Augsburg",
          [
            "820",
            "821",
            "822",
            "823",
            "824",
            "825",
            "826",
            "827",
            "828",
            "829"
          ]
        ],
        [
          "083x",
          "Kempten Allgäu",
          [
            "830",
            "831",
            "832",
            "833",
            "834",
            "836",
            "837",
            "838",
            "839"
          ]
        ],
        [
          "084x",
          "Ingolstadt Donau",
          [
            "840",
            "841",
            "842",
            "843",
            "844",
            "845",
            "846"
          ]
        ],
        [
          "085x",
          "Passau",
          [
            "850",
            "851",
            "853",
            "854",
            "855",
            "856",
            "857",
            "858",
            "859"
          ]
        ],
        [
          "086x",
          "Traunstein",
          [
            "861",
            "862",
            "863",
            "864",
            "865",
            "866",
            "867",
            "868"
          ]
        ],
        [
          "087x",
          "Landshut",
          [
            "870",
            "871",
            "872",
            "873",
            "874",
            "875",
            "876",
            "877",
            "878"
          ]
        ],
        [
          "088x",
          "Weilheim i OB",
          [
            "880",
            "881",
            "882",
            "884",
            "885",
            "886"
          ]
        ],
        [
          "089x",
          "München, München",
          [
            "89"
          ]
        ],
        [
          "090x",
          "Donauwörth",
          [
            "906",
            "907",
            "908",
            "909"
          ]
        ],
        [
          "091x",
          "Nürnberg",
          [
            "910",
            "911",
            "912",
            "913",
            "914",
            "915",
            "916",
            "917",
            "918",
            "919"
          ]
        ],
        [
          "092x",
          "Bayreuth",
          [
            "920",
            "921",
            "922",
            "923",
            "924",
            "925",
            "926",
            "927",
            "928",
            "929"
          ]
        ],
        [
          "093x",
          "Würzburg",
          [
            "930",
            "931",
            "932",
            "933",
            "934",
            "935",
            "936",
            "937",
            "938",
            "939"
          ]
        ],
        [
          "094x",
          "Regensburg",
          [
            "940",
            "941",
            "942",
            "943",
            "944",
            "945",
            "946",
            "947",
            "948",
            "949"
          ]
        ],
        [
          "095x",
          "Bamberg",
          [
            "950",
            "951",
            "952",
            "953",
            "954",
            "955",
            "956",
            "957"
          ]
        ],
        [
          "096x",
          "Weiden i d Opf",
          [
            "960",
            "961",
            "962",
            "963",
            "964",
            "965",
            "966",
            "967",
            "968"
          ]
        ],
        [
          "097x",
          "Bad Kissingen",
          [
            "970",
            "971",
            "972",
            "973",
            "974",
            "976",
            "977"
          ]
        ],
        [
          "098x",
          "Ansbach",
          [
            "980",
            "981",
            "982",
            "983",
            "984",
            "985",
            "986",
            "987"
          ]
        ],
        [
          "099x",
          "Deggendorf",
          [
            "990",
            "991",
            "992",
            "993",
            "994",
            "995",
            "996",
            "997"
          ]
        ]
      ],
      "areas": "@id",
      "name": {
        "t": "0{id}x",
        "x": {
          "30": "030xx",
          "40": "040xx",
          "69": "069xx",
          "89": "089xx",
          "201": "0201",
          "202": "0202",
          "203": "0203",
          "208": "0208",
          "209": "0209",
          "211": "0211",
          "214": "0214",
          "221": "0221",
          "228": "0228",
          "231": "0231",
          "234": "0234",
          "241": "0241",
          "251": "0251",
          "261": "0261",
          "271": "0271",
          "281": "0281",
          "291": "0291",
          "331": "0331",
          "335": "0335",
          "340": "0340",
          "341": "0341",
          "345": "0345",
          "351": "0351",
          "355": "0355",
          "361": "0361",
          "365": "0365",
          "371": "0371",
          "375": "0375",
          "381": "0381",
          "385": "0385",
          "391": "0391",
          "395": "0395",
          "421": "0421",
          "431": "0431",
          "441": "0441",
          "451": "0451",
          "461": "0461",
          "471": "0471",
          "481": "0481",
          "491": "0491",
          "511": "0511",
          "521": "0521",
          "531": "0531",
          "541": "0541",
          "551": "0551",
          "561": "0561",
          "571": "0571",
          "581": "0581",
          "591": "0591",
          "611": "0611",
          "621": "0621",
          "631": "0631",
          "641": "0641",
          "651": "0651",
          "661": "0661",
          "671": "0671",
          "681": "0681",
          "711": "0711",
          "721": "0721",
          "731": "0731",
          "741": "0741",
          "751": "0751",
          "761": "0761",
          "771": "0771",
          "781": "0781",
          "791": "0791",
          "811": "0811",
          "821": "0821",
          "831": "0831",
          "841": "0841",
          "851": "0851",
          "861": "0861",
          "871": "0871",
          "881": "0881",
          "906": "0906",
          "911": "0911",
          "921": "0921",
          "931": "0931",
          "941": "0941",
          "951": "0951",
          "961": "0961",
          "971": "0971",
          "981": "0981",
          "991": "0991"
        }
      },
      "short": "0{id}",
      "chip": "{name}",
      "chipTitle": {
        "x": {
          "30": "030 Berlin, 030 Berlin",
          "40": "040 Hamburg, 040 Hamburg",
          "69": "069 Frankfurt am Main, 069 Frankfurt am Main",
          "89": "089 München, 089 München",
          "201": "0201 Essen",
          "202": "0202 Wuppertal",
          "203": "0203 Duisburg",
          "204": "02041 Bottrop, 02043 Gladbeck, 02045 Bottrop-Kirchhellen",
          "205": "02051 Velbert, 02052 Velbert-Langenberg, 02053 Velbert-Neviges",
          "206": "02064 Dinslaken, 02065 Duisburg-Rheinhausen, 02066 Duisburg-Homberg",
          "208": "0208 Oberhausen Rheinl",
          "209": "0209 Gelsenkirchen",
          "210": "02102 Ratingen, 02103 Hilden, 02104 Mettmann",
          "211": "0211 Düsseldorf",
          "212": "0212 Solingen, 02129 Haan Rheinl",
          "213": "02131 Neuss, 02132 Meerbusch-Büderich, 02133 Dormagen",
          "214": "0214 Leverkusen",
          "215": "02150 Meerbusch-Lank, 02151 Krefeld, 02152 Kempen",
          "216": "02161 Mönchengladbach, 02162 Viersen, 02163 Schwalmtal Niederrhein",
          "217": "02171 Leverkusen-Opladen, 02173 Langenfeld Rheinland, 02174 Burscheid Rheinl",
          "218": "02181 Grevenbroich, 02182 Grevenbroich-Kapellen, 02183 Rommerskirchen",
          "219": "02191 Remscheid, 02192 Hückeswagen, 02193 Dabringhausen",
          "220": "02202 Bergisch Gladbach, 02203 Köln-Porz, 02204 Bensberg",
          "221": "0221 Köln",
          "222": "02222 Bornheim Rheinl, 02223 Königswinter, 02224 Bad Honnef",
          "223": "02232 Brühl Rheinl, 02233 Hürth Rheinl, 02234 Frechen",
          "224": "02241 Siegburg, 02242 Hennef Sieg, 02243 Eitorf",
          "225": "02251 Euskirchen, 02252 Zülpich, 02253 Bad Münstereifel",
          "226": "02261 Gummersbach, 02262 Wiehl, 02263 Engelskirchen",
          "227": "02271 Bergheim Erft, 02272 Bedburg Erft, 02273 Kerpen-Horrem",
          "228": "0228 Bonn",
          "229": "02291 Waldbröl, 02292 Windeck Sieg, 02293 Nümbrecht",
          "230": "02301 Holzwickede, 02302 Witten, 02303 Unna",
          "231": "0231 Dortmund",
          "232": "02323 Herne, 02324 Hattingen Ruhr, 02325 Wanne-Eickel",
          "233": "02330 Herdecke, 02331 Hagen Westf, 02332 Gevelsberg",
          "234": "0234 Bochum",
          "235": "02351 Lüdenscheid, 02352 Altena Westf, 02353 Halver",
          "236": "02360 Haltern-Lippramsdorf, 02361 Recklinghausen, 02362 Dorsten",
          "237": "02371 Iserlohn, 02372 Hemer, 02373 Menden Sauerland",
          "238": "02381 Hamm Westf, 02382 Ahlen Westf, 02383 Bönen",
          "239": "02391 Plettenberg, 02392 Werdohl, 02393 Sundern-Allendorf",
          "240": "02401 Baesweiler, 02402 Stolberg Rheinl, 02403 Eschweiler Rheinl",
          "241": "0241 Aachen",
          "242": "02421 Düren, 02422 Kreuzau, 02423 Langerwehe",
          "243": "02431 Erkelenz, 02432 Wassenberg, 02433 Hückelhoven",
          "244": "02440 Nettersheim-Tondorf, 02441 Kall, 02443 Mechernich",
          "245": "02451 Geilenkirchen, 02452 Heinsberg Rheinl, 02453 Heinsberg-Randerath",
          "246": "02461 Jülich, 02462 Linnich, 02463 Titz",
          "247": "02471 Roetgen Eifel, 02472 Monschau, 02473 Simmerath",
          "248": "02482 Hellenthal, 02484 Mechernich-Eiserfey, 02485 Schleiden-Dreiborn",
          "250": "02501 Münster-Hiltrup, 02502 Nottuln, 02504 Telgte",
          "251": "0251 Münster",
          "252": "02520 Wadersloh-Diestedde, 02521 Beckum, 02522 Oelde",
          "253": "02532 Ostbevern, 02533 Münster-Nienberge, 02534 Münster-Roxel",
          "254": "02541 Coesfeld, 02542 Gescher, 02543 Billerbeck Westf",
          "255": "02551 Steinfurt-Burgsteinfurt, 02552 Steinfurt-Borghorst, 02553 Ochtrup",
          "256": "02561 Ahaus, 02562 Gronau Westfalen, 02563 Stadtlohn",
          "257": "02571 Greven Westf, 02572 Emsdetten, 02573 Nordwalde",
          "258": "02581 Warendorf, 02582 Everswinkel, 02583 Sassenberg",
          "259": "02590 Dülmen-Buldern, 02591 Lüdinghausen, 02592 Selm",
          "260": "02601 Nauort, 02602 Montabaur, 02603 Bad Ems",
          "261": "0261 Koblenz a Rhein",
          "262": "02620 Neuhäusel Westerw, 02621 Lahnstein, 02622 Bendorf Rhein",
          "263": "02630 Mülheim-Kärlich, 02631 Neuwied, 02632 Andernach",
          "264": "02641 Bad Neuenahr-Ahrweiler, 02642 Remagen, 02643 Altenahr",
          "265": "02651 Mayen, 02652 Mendig, 02653 Kaisersesch",
          "266": "02661 Bad Marienberg Westerwald, 02662 Hachenburg, 02663 Westerburg Westerw",
          "267": "02671 Cochem, 02672 Treis-Karden, 02673 Ellenz-Poltersdorf",
          "268": "02680 Mündersbach, 02681 Altenkirchen Westerwald, 02682 Hamm Sieg",
          "269": "02691 Adenau, 02692 Kelberg, 02693 Antweiler",
          "271": "0271 Siegen",
          "272": "02721 Lennestadt, 02722 Attendorn, 02723 Kirchhundem",
          "273": "02732 Kreuztal, 02733 Hilchenbach, 02734 Freudenberg Westf",
          "274": "02741 Betzdorf, 02742 Wissen, 02743 Daaden",
          "275": "02750 Diedenshausen, 02751 Bad Berleburg, 02752 Bad Laasphe",
          "276": "02761 Olpe Biggesee, 02762 Wenden Südsauerland, 02763 Drolshagen-Bleche",
          "277": "02770 Eschenburg, 02771 Dillenburg, 02772 Herborn Hess",
          "280": "02801 Xanten, 02802 Alpen, 02803 Wesel-Büderich",
          "281": "0281 Wesel",
          "282": "02821 Kleve Niederrhein, 02822 Emmerich, 02823 Goch",
          "283": "02831 Geldern, 02832 Kevelaer, 02833 Kerken",
          "284": "02841 Moers, 02842 Kamp-Lintfort, 02843 Rheinberg",
          "285": "02850 Rees-Haldern, 02851 Rees, 02852 Hamminkeln",
          "286": "02861 Borken Westf, 02862 Südlohn, 02863 Velen",
          "287": "02871 Bocholt, 02872 Rhede Westf, 02873 Isselburg-Werth",
          "290": "02902 Warstein, 02903 Meschede-Freienohl, 02904 Bestwig",
          "291": "0291 Meschede",
          "292": "02921 Soest, 02922 Werl, 02923 Lippetal-Herzfeld",
          "293": "02931 Arnsberg, 02932 Neheim-Hüsten, 02933 Sundern Sauerland",
          "294": "02941 Lippstadt, 02942 Geseke, 02943 Erwitte",
          "295": "02951 Büren, 02952 Rüthen, 02953 Wünnenberg",
          "296": "02961 Brilon, 02962 Olsberg, 02963 Brilon-Messinghausen",
          "297": "02971 Schmallenberg-Dorlar, 02972 Schmallenberg, 02973 Eslohe Sauerland",
          "298": "02981 Winterberg Westf, 02982 Medebach, 02983 Winterberg-Siedlinghausen",
          "299": "02991 Marsberg-Bredelar, 02992 Marsberg, 02993 Marsberg-Canstein",
          "330": "03301 Oranienburg, 03302 Hennigsdorf, 03303 Birkenwerder",
          "331": "0331 Potsdam",
          "332": "033200 Bergholz-Rehbrücke, 033201 Gross Glienicke, 033202 Töplitz",
          "333": "03331 Angermünde, 03332 Schwedt/Oder, 033331 Casekow",
          "334": "03341 Strausberg, 03342 Neuenhagen b Berlin, 033432 Müncheberg",
          "335": "0335 Frankfurt (Oder)",
          "336": "033601 Podelzig, 033602 Alt Zeschdorf, 033603 Falkenhagen b Seelow",
          "337": "033701 Grossbeeren, 033702 Wünsdorf, 033703 Sperenberg",
          "338": "03381 Brandenburg an der Havel, 03382 Lehnin, 033830 Ziesar",
          "339": "03391 Neuruppin, 033920 Walsleben b Neuruppin, 033921 Zechlinerhütte",
          "340": "0340 Dessau Anh",
          "341": "0341 Leipzig",
          "342": "034202 Delitzsch, 034203 Zwenkau, 034204 Schkeuditz",
          "343": "03431 Döbeln, 034321 Leisnig, 034322 Rosswein",
          "344": "03441 Zeitz, 034422 Osterfeld, 034423 Heuckewalde",
          "345": "0345 Halle Saale",
          "346": "034600 Ostrau Saalkreis, 034601 Teutschenthal, 034602 Landsberg Sachs-Anh",
          "347": "03471 Bernburg Saale, 034721 Nienburg Saale, 034722 Preusslitz",
          "349": "034901 Roßlau Elbe, 034903 Coswig Anhalt, 034904 Oranienbaum",
          "350": "03501 Pirna, 035020 Struppen, 035021 Königstein Sächs Schweiz",
          "351": "0351 Dresden",
          "352": "035200 Arnsdorf b Dresden, 035201 Langebrück, 035202 Klingenberg Sachs",
          "353": "03531 Finsterwalde, 035322 Doberlug-Kirchhain, 035323 Sonnewalde",
          "354": "03541 Calau, 03542 Lübbenau Spreewald, 035433 Vetschau",
          "355": "0355 Cottbus",
          "356": "035600 Döbern NL, 035601 Peitz, 035602 Drebkau",
          "357": "03571 Hoyerswerda, 035722 Lauta b Hoyerswerda, 035723 Bernsdorf OL",
          "358": "03581 Görlitz, 035820 Zodel, 035822 Hagenwerder",
          "359": "03591 Bautzen, 03592 Kirschau, 035930 Seitschen",
          "360": "03601 Mühlhausen Thür, 036020 Ebeleben, 036021 Schlotheim",
          "361": "0361 Erfurt",
          "362": "036200 Elxleben b Arnstadt, 036201 Walschleben, 036202 Neudietendorf",
          "363": "03631 Nordhausen Thür, 03632 Sondershausen, 036330 Grossberndten",
          "364": "03641 Jena, 036421 Camburg, 036422 Reinstädt Thür",
          "365": "0365 Gera",
          "366": "036601 Hermsdorf Thür, 036602 Ronneburg Thür, 036603 Weida",
          "367": "036701 Lichte, 036702 Lauscha, 036703 Gräfenthal",
          "368": "03681 Suhl, 03682 Zella-Mehlis, 03683 Schmalkalden",
          "369": "03691 Eisenach Thür, 036920 Grossenlupnitz, 036921 Wutha-Farnroda",
          "371": "0371 Chemnitz Sachs",
          "372": "037200 Wittgensdorf b Chemnitz, 037202 Claussnitz b Chemnitz, 037203 Gersdorf b Chemnitz",
          "373": "03731 Freiberg Sachs, 037320 Mulda Sachs, 037321 Frankenstein Sachs",
          "374": "03741 Plauen, 037421 Oelsnitz Vogtl, 037422 Markneukirchen",
          "375": "0375 Zwickau",
          "376": "037600 Neumark Sachs, 037601 Mülsen Skt Jacob, 037602 Kirchberg Sachs",
          "377": "03771 Aue Sachs, 03772 Schneeberg Erzgeb, 03773 Johanngeorgenstadt",
          "381": "0381 Rostock",
          "382": "038201 Gelbensande, 038202 Volkenshagen, 038203 Bad Doberan",
          "383": "038300 Insel Hiddensee, 038301 Putbus, 038302 Sagard",
          "384": "03841 Wismar Meckl, 038422 Neukloster, 038423 Bad Kleinen",
          "385": "0385 Schwerin Meckl",
          "386": "03860 Raben Steinfeld, 03861 Plate, 03863 Crivitz",
          "387": "03871 Parchim, 038720 Grebbin, 038721 Ziegendorf",
          "388": "03881 Grevesmühlen, 038821 Lüdersdorf Meckl, 038822 Diedrichshagen b Grevesmühlen",
          "390": "039000 Beetzendorf, 039001 Apenburg, 039002 Oebisfelde",
          "391": "0391 Magdeburg",
          "392": "039200 Gommern, 039201 Wolmirstedt, 039202 Gross Ammensleben",
          "393": "03931 Stendal, 039320 Schinne, 039321 Arneburg",
          "394": "039400 Wefensleben, 039401 Neuwegersleben, 039402 Völpke",
          "395": "0395 Neubrandenburg",
          "396": "039600 Zwiedorf, 039601 Friedland Meckl, 039602 Kleeth",
          "397": "03971 Anklam, 039721 Liepen b Anklam, 039722 Sarnow b Anklam",
          "398": "03981 Neustrelitz, 039820 Triepkendorf, 039821 Carpin",
          "399": "03991 Waren Müritz, 039921 Ankershagen, 039922 Dambeck b Röbel",
          "410": "04101 Pinneberg, 04102 Ahrensburg, 04103 Wedel",
          "412": "04120 Ellerhoop, 04121 Elmshorn, 04122 Uetersen",
          "413": "04131 Lüneburg, 04132 Amelinghausen, 04133 Wittorf Kr Lünebeburg",
          "414": "04140 Estorf Kr Stade, 04141 Stade, 04142 Steinkirchen Kr Stade",
          "415": "04151 Schwarzenbek, 04152 Geesthacht, 04153 Lauenburg Elbe",
          "416": "04161 Buxtehude, 04162 Jork, 04163 Horneburg Niederelbe",
          "417": "04171 Winsen Luhe, 04172 Salzhausen, 04173 Wulfsen",
          "418": "04180 Königsmoor, 04181 Buchholz in der Nordheide, 04182 Tostedt",
          "419": "04191 Kaltenkirchen Holst, 04192 Bad Bramstedt, 04193 Henstedt-Ulzburg",
          "420": "04202 Achim b Bremen, 04203 Weyhe b Bremen, 04204 Thedinghausen",
          "421": "0421 Bremen",
          "422": "04221 Delmenhorst, 04222 Ganderkesee, 04223 Ganderkesee-Bookholzberg",
          "423": "04230 Verden-Walle, 04231 Verden Aller, 04232 Langwedel Kr Verden",
          "424": "04240 Syke-Heiligenfelde, 04241 Bassum, 04242 Syke",
          "425": "04251 Hoya, 04252 Bruchhausen-Vilsen, 04253 Asendorf Kr Diepholz",
          "426": "04260 Visselhövede-Wittorf, 04261 Rotenburg Wümme, 04262 Visselhövede",
          "427": "04271 Sulingen, 04272 Siedenburg, 04273 Kirchdorf b Sulingen",
          "428": "04281 Zeven, 04282 Sittensen, 04283 Tarmstedt",
          "429": "04292 Ritterhude, 04293 Ottersberg-Fischerhude, 04294 Riede Kr Verden",
          "430": "04302 Kirchbarkau, 04303 Schlesen, 04305 Westensee",
          "431": "0431 Kiel",
          "432": "04320 Heidmühlen, 04321 Neumünster, 04322 Bordesholm",
          "433": "04330 Emkendorf, 04331 Rendsburg, 04332 Hamdorf b Rendsburg",
          "434": "04340 Achterwehr, 04342 Preetz Kr Plön, 04343 Laboe",
          "435": "04351 Eckernförde, 04352 Damp, 04353 Ascheffel",
          "436": "04361 Oldenburg in Holstein, 04362 Heiligenhafen, 04363 Lensahn",
          "437": "04371 Burg auf Fehmarn, 04372 Westfehmarn",
          "438": "04381 Lütjenburg, 04382 Wangels, 04383 Grebin",
          "439": "04392 Nortorf b Neumünster, 04393 Boostedt, 04394 Bokhorst",
          "440": "04401 Brake Unterweser, 04402 Rastede, 04403 Bad Zwischenahn",
          "441": "0441 Oldenburg (Oldb)",
          "442": "04421 Wilhelmshaven, 04422 Sande Kr Friesl, 04423 Fedderwarden",
          "443": "04431 Wildeshausen, 04432 Dötlingen-Brettorf, 04433 Dötlingen",
          "444": "04441 Vechta, 04442 Lohne Oldenburg, 04443 Dinklage",
          "445": "04451 Varel Jadebusen, 04452 Zetel-Neuenburg, 04453 Zetel",
          "446": "04461 Jever, 04462 Wittmund, 04463 Wangerland",
          "447": "04471 Cloppenburg, 04472 Lastrup, 04473 Emstek",
          "448": "04480 Ovelgönne-Strückhausen, 04481 Hatten-Sandkrug, 04482 Hatten",
          "449": "04491 Friesoythe, 04492 Saterland, 04493 Friesoythe-Gehlenberg",
          "450": "04501 Kastorf Holst, 04502 Lübeck-Travemünde, 04503 Timmendorfer Strand",
          "451": "0451 Lübeck",
          "452": "04521 Eutin, 04522 Plön, 04523 Malente",
          "453": "04531 Bad Oldesloe, 04532 Bargteheide, 04533 Reinfeld Holstein",
          "454": "04541 Ratzeburg, 04542 Mölln Lauenb, 04543 Nusse",
          "455": "04550 Bühnsdorf, 04551 Bad Segeberg, 04552 Leezen",
          "456": "04561 Neustadt in Holstein, 04562 Grömitz, 04563 Scharbeutz-Haffkrug",
          "460": "04602 Freienwill, 04603 Havetoft, 04604 Grossenwiehe",
          "461": "0461 Flensburg",
          "462": "04621 Schleswig, 04622 Taarstedt, 04623 Böklund",
          "463": "04630 Barderup, 04631 Glücksburg Ostsee, 04632 Steinbergkirche",
          "464": "04641 Süderbrarup, 04642 Kappeln Schlei, 04643 Gelting Angeln",
          "465": "04651 Sylt",
          "466": "04661 Niebüll, 04662 Leck, 04663 Süderlügum",
          "467": "04671 Bredstedt, 04672 Langenhorn, 04673 Joldelund",
          "468": "04681 Wyk auf Föhr, 04682 Amrum, 04683 Oldsum",
          "470": "04702 Sandstedt, 04703 Loxstedt-Donnern, 04704 Drangstedt",
          "471": "0471 Bremerhaven",
          "472": "04721 Cuxhaven, 04722 Cuxhaven-Altenbruch, 04723 Cuxhaven-Altenwalde",
          "473": "04731 Nordenham, 04732 Stadland-Rodenkirchen, 04733 Butjadingen-Burhave",
          "474": "04740 Loxstedt-Dedesdorf, 04741 Nordholz b Bremerhaven, 04742 Dorum",
          "475": "04751 Otterndorf, 04752 Neuhaus Oste, 04753 Balje",
          "476": "04761 Bremervörde, 04762 Kutenholz, 04763 Gnarrenburg",
          "477": "04770 Wischhafen, 04771 Hemmoor, 04772 Oberndorf Oste",
          "479": "04791 Osterholz-Scharmbeck, 04792 Worpswede, 04793 Hambergen",
          "480": "04802 Wrohm, 04803 Pahlen, 04804 Nordhastedt",
          "481": "0481 Heide Holst",
          "482": "04821 Itzehoe, 04822 Kellinghusen, 04823 Wilster",
          "483": "04830 Süderhastedt, 04832 Meldorf, 04833 Wesselburen",
          "484": "04841 Husum Nordsee, 04842 Nordstrand, 04843 Viöl",
          "485": "04851 Marne, 04852 Brunsbüttel, 04853 Sankt Michaelisdonn",
          "486": "04861 Tönning, 04862 Garding, 04863 Sankt Peter-Ording",
          "487": "04871 Hohenwestedt, 04872 Hanerau-Hademarschen, 04873 Aukrug",
          "488": "04881 Friedrichstadt, 04882 Lunden, 04883 Süderstapel",
          "489": "04892 Schenefeld Mittelholst, 04893 Hohenaspe",
          "490": "04902 Jemgum-Ditzum, 04903 Wymeer",
          "491": "0491 Leer Ostfriesland",
          "492": "04920 Wirdum, 04921 Emden Stadt, 04922 Borkum",
          "493": "04931 Norden, 04932 Norderney, 04933 Dornum Ostfriesl",
          "494": "04941 Aurich, 04942 Südbrookmerland, 04943 Grossefehn",
          "495": "04950 Holtland, 04951 Weener, 04952 Rhauderfehn",
          "496": "04961 Papenburg, 04962 Papenburg-Aschendorf, 04963 Dörpen",
          "497": "04971 Esens, 04972 Langeoog, 04973 Wittmund-Burhafe",
          "502": "05021 Nienburg Weser, 05022 Wietzen, 05023 Liebenau Kr Nieburg Weser",
          "503": "05031 Wunstorf, 05032 Neustadt am Rübenberge, 05033 Wunstorf-Grossenheidorn",
          "504": "05041 Springe Deister, 05042 Bad Münder am Deister, 05043 Lauenau",
          "505": "05051 Bergen Kr Celle, 05052 Hermannsburg, 05053 Faßberg-Müden",
          "506": "05060 Bodenburg, 05062 Holle b Hildesheim, 05063 Bad Salzdetfurth",
          "507": "05071 Schwarmstedt, 05072 Neustadt-Mandelsloh, 05073 Neustadt-Esperke",
          "508": "05082 Langlingen, 05083 Hohne b Celle, 05084 Hambühren",
          "510": "05101 Pattensen, 05102 Laatzen, 05103 Wennigsen Deister",
          "511": "0511 Hannover",
          "512": "05121 Hildesheim, 05123 Schellerten, 05126 Algermissen",
          "513": "05130 Wedemark, 05131 Garbsen, 05132 Lehrte",
          "514": "05141 Celle, 05142 Eschede, 05143 Winsen Aller",
          "515": "05151 Hameln, 05152 Hessisch Oldendorf, 05153 Salzhemmendorf",
          "516": "05161 Walsrode, 05162 Fallingbostel, 05163 Fallingbostel-Dorfmark",
          "517": "05171 Peine, 05172 Ilsede, 05173 Uetze",
          "518": "05181 Alfeld Leine, 05182 Gronau Leine, 05183 Lamspringe",
          "519": "05190 Soltau-Emmingen, 05191 Soltau, 05192 Munster",
          "520": "05201 Halle Westf, 05202 Oerlinghausen, 05203 Werther Westf",
          "521": "0521 Bielefeld",
          "522": "05221 Herford, 05222 Bad Salzuflen, 05223 Bünde",
          "523": "05231 Detmold, 05232 Lage Lippe, 05233 Steinheim Westf",
          "524": "05241 Gütersloh, 05242 Rheda-Wiedenbrück, 05244 Rietberg",
          "525": "05250 Delbrück Westf, 05251 Paderborn, 05252 Bad Lippspringe",
          "526": "05261 Lemgo, 05262 Extertal, 05263 Barntrup",
          "527": "05271 Höxter, 05272 Brakel Westf, 05273 Beverungen",
          "528": "05281 Bad Pyrmont, 05282 Schieder-Schwalenberg, 05283 Lügde-Rischenau",
          "529": "05292 Lichtenau-Atteln, 05293 Paderborn-Dahl, 05294 Hövelhof-Espeln",
          "530": "05300 Salzgitter-Üfingen, 05301 Lehre-Essenrode, 05302 Vechelde",
          "531": "0531 Braunschweig",
          "532": "05320 Torfhaus, 05321 Goslar, 05322 Bad Harzburg",
          "533": "05331 Wolfenbüttel, 05332 Schöppenstedt, 05333 Dettum",
          "534": "05341 Salzgitter, 05344 Lengede, 05345 Baddeckenstedt",
          "535": "05351 Helmstedt, 05352 Schöningen, 05353 Königslutter am Elm",
          "536": "05361 Wolfsburg, 05362 Wolfsburg-Fallersleben, 05363 Wolfsburg-Vorsfelde",
          "537": "05371 Gifhorn, 05372 Meinersen, 05373 Hillerse Kr Gifhorn",
          "538": "05381 Seesen, 05382 Bad Gandersheim, 05383 Lutter am Barenberge",
          "540": "05401 Georgsmarienhütte, 05402 Bissendorf Kr Osnabrück, 05403 Bad Iburg",
          "541": "0541 Osnabrück",
          "542": "05421 Dissen am Teutoburger Wald, 05422 Melle, 05423 Versmold",
          "543": "05431 Quakenbrück, 05432 Löningen, 05433 Badbergen",
          "544": "05441 Diepholz, 05442 Barnstorf Kr Diepholz, 05443 Lemförde",
          "545": "05451 Ibbenbüren, 05452 Mettingen Westf, 05453 Recke",
          "546": "05461 Bramsche Hase, 05462 Ankum, 05464 Alfhausen",
          "547": "05471 Bohmte, 05472 Bad Essen, 05473 Ostercappeln",
          "548": "05481 Lengerich Westf, 05482 Tecklenburg, 05483 Lienen",
          "549": "05491 Damme Dümmer, 05492 Steinfeld Oldenburg, 05493 Neuenkirchen Kr Vechta",
          "550": "05502 Dransfeld, 05503 Nörten-Hardenberg, 05504 Friedland Kr Göttingen",
          "551": "0551 Göttingen",
          "552": "05520 Braunlage, 05521 Herzberg am Harz, 05522 Osterode am Harz",
          "553": "05531 Holzminden, 05532 Stadtoldendorf, 05533 Bodenwerder",
          "554": "05541 Hann. Münden, 05542 Witzenhausen, 05543 Staufenberg Niedersachs",
          "555": "05551 Northeim, 05552 Katlenburg, 05553 Kalefeld",
          "556": "05561 Einbeck, 05562 Dassel-Markoldendorf, 05563 Kreiensen",
          "557": "05571 Uslar, 05572 Bodenfelde, 05573 Uslar-Volpriehausen",
          "558": "05582 Sankt Andreasberg, 05583 Braunlage-Hohegeiss, 05584 Hattorf am Harz",
          "559": "05592 Gleichen-Bremke, 05593 Bovenden-Lenglern, 05594 Bovenden-Reyershausen",
          "560": "05601 Schauenburg, 05602 Hessisch Lichtenau, 05603 Gudensberg",
          "561": "0561 Kassel",
          "562": "05621 Bad Wildungen, 05622 Fritzlar, 05623 Edertal",
          "563": "05631 Korbach, 05632 Willingen Upland, 05633 Diemelsee",
          "564": "05641 Warburg, 05642 Warburg-Scherfede, 05643 Borgentreich",
          "565": "05650 Cornberg, 05651 Eschwege, 05652 Bad Sooden-Allendorf",
          "566": "05661 Melsungen, 05662 Felsberg Hess, 05663 Spangenberg",
          "567": "05671 Hofgeismar, 05672 Bad Karlshafen, 05673 Immenhausen Hess",
          "568": "05681 Homberg Efze, 05682 Borken Hessen, 05683 Wabern Hess",
          "569": "05691 Bad Arolsen, 05692 Wolfhagen, 05693 Volkmarsen",
          "570": "05702 Petershagen-Lahde, 05703 Hille, 05704 Petershagen-Friedewalde",
          "571": "0571 Minden Westf",
          "572": "05721 Stadthagen, 05722 Bückeburg, 05723 Bad Nenndorf",
          "573": "05731 Bad Oeynhausen, 05732 Löhne, 05733 Vlotho",
          "574": "05741 Lübbecke, 05742 Preussisch Oldendorf, 05743 Espelkamp-Gestringen",
          "575": "05751 Rinteln, 05752 Auetal-Hattendorf, 05753 Auetal-Bernsen",
          "576": "05761 Stolzenau, 05763 Uchte, 05764 Steyerberg",
          "577": "05771 Rahden Westf, 05772 Espelkamp, 05773 Stemwede-Wehdem",
          "580": "05802 Wrestedt, 05803 Rosche, 05804 Rätzlingen Kr Uelzen",
          "581": "0581 Uelzen",
          "582": "05820 Suhlendorf, 05821 Bad Bevensen, 05822 Ebstorf",
          "583": "05831 Wittingen, 05832 Hankensbüttel, 05833 Brome",
          "584": "05840 Schnackenburg, 05841 Lüchow Wendland, 05842 Schnega",
          "585": "05850 Neetze, 05851 Dahlenburg, 05852 Bleckede",
          "586": "05861 Dannenberg Elbe, 05862 Hitzacker Elbe, 05863 Zernien",
          "587": "05872 Stoetze, 05873 Eimke, 05874 Soltendieck",
          "588": "05882 Gorleben, 05883 Lemgow",
          "590": "05901 Fürstenau b Bramsche, 05902 Freren, 05903 Emsbüren",
          "591": "0591 Lingen (Ems)",
          "592": "05921 Nordhorn, 05922 Bad Bentheim, 05923 Schüttorf",
          "593": "05931 Meppen, 05932 Haren Ems, 05933 Lathen",
          "594": "05941 Neuenhaus Dinkel, 05942 Uelsen, 05943 Emlichheim",
          "595": "05951 Werlte, 05952 Sögel, 05953 Börger",
          "596": "05961 Haselünne, 05962 Herzlake, 05963 Bawinkel",
          "597": "05971 Rheine, 05973 Neuenkirchen Kr Steinfurt, 05975 Rheine-Mesum",
          "600": "06002 Ober-Mörlen, 06003 Rosbach v d Höhe, 06004 Lich-Eberstadt",
          "602": "06020 Heigenbrücken, 06021 Aschaffenburg, 06022 Obernburg a Main",
          "603": "06031 Friedberg Hess, 06032 Bad Nauheim, 06033 Butzbach",
          "604": "06041 Glauburg, 06042 Büdingen Hess, 06043 Nidda",
          "605": "06050 Biebergemünd, 06051 Gelnhausen, 06052 Bad Orb",
          "606": "06061 Michelstadt, 06062 Erbach Odenw, 06063 Bad König",
          "607": "06071 Dieburg, 06073 Babenhausen Hess, 06074 Rödermark",
          "608": "06081 Usingen, 06082 Niederreifenberg, 06083 Weilrod",
          "609": "06092 Heimbuchenthal, 06093 Laufach, 06094 Weibersbrunn",
          "610": "06101 Bad Vilbel, 06102 Neu-Isenburg, 06103 Langen Hess",
          "611": "0611 Wiesbaden",
          "612": "06120 Aarbergen, 06122 Hofheim-Wallau, 06123 Eltville am Rhein",
          "613": "06130 Schwabenheim an der Selz, 06131 Mainz, 06132 Ingelheim am Rhein",
          "614": "06142 Rüsselsheim, 06144 Bischofsheim b Rüsselsheim, 06145 Flörsheim am Main",
          "615": "06150 Weiterstadt, 06151 Darmstadt, 06152 Gross-Gerau",
          "616": "06161 Brensbach, 06162 Reinheim Odenw, 06163 Höchst i Odw",
          "617": "06171 Oberursel Taunus, 06172 Bad Homburg v d Höhe, 06173 Kronberg im Taunus",
          "618": "06181 Hanau, 06182 Seligenstadt, 06183 Erlensee",
          "619": "06190 Hattersheim a Main, 06192 Hofheim am Taunus, 06195 Kelkheim Taunus",
          "620": "06201 Weinheim Bergstr, 06202 Schwetzingen, 06203 Ladenburg",
          "621": "0621 Mannheim",
          "622": "06220 Wilhelmsfeld, 06221 Heidelberg, 06222 Wiesloch",
          "623": "06231 Hochdorf-Assenheim, 06232 Speyer, 06233 Frankenthal Pfalz",
          "624": "06241 Worms, 06242 Osthofen, 06243 Monsheim",
          "625": "06251 Bensheim, 06252 Heppenheim Bergstraße, 06253 Fürth Odenw",
          "626": "06261 Mosbach Baden, 06262 Aglasterhausen, 06263 Neckargerach",
          "627": "06271 Eberbach Baden, 06272 Hirschhorn Neckar, 06274 Waldbrunn Odenw",
          "628": "06281 Buchen Odenwald, 06282 Walldürn, 06283 Hardheim Odenw",
          "629": "06291 Adelsheim, 06292 Seckach, 06293 Schefflenz",
          "630": "06301 Otterbach Pfalz, 06302 Winnweiler, 06303 Enkenbach-Alsenborn",
          "631": "0631 Kaiserslautern",
          "632": "06321 Neustadt an der Weinstraße, 06322 Bad Dürkheim, 06323 Edenkoben",
          "633": "06331 Pirmasens, 06332 Zweibrücken, 06333 Waldfischbach-Burgalben",
          "634": "06340 Wörth-Schaidt, 06341 Landau in der Pfalz, 06342 Schweigen-Rechtenbach",
          "635": "06351 Eisenberg Pfalz, 06352 Kirchheimbolanden, 06353 Freinsheim",
          "636": "06361 Rockenhausen, 06362 Alsenz, 06363 Niederkirchen",
          "637": "06371 Landstuhl, 06372 Bruchmühlbach-Miesau, 06373 Schönenberg-Kübelberg",
          "638": "06381 Kusel, 06382 Lauterecken, 06383 Glan-Münchweiler",
          "639": "06391 Dahn, 06392 Hauenstein Pfalz, 06393 Fischbach bei Dahn",
          "640": "06400 Mücke, 06401 Grünberg Hess, 06402 Hungen",
          "641": "0641 Gießen",
          "642": "06420 Lahntal, 06421 Marburg, 06422 Kirchhain",
          "643": "06430 Hahnstätten, 06431 Limburg a d Lahn, 06432 Diez",
          "644": "06440 Kölschhausen, 06441 Wetzlar, 06442 Braunfels",
          "645": "06451 Frankenberg Eder, 06452 Battenberg Eder, 06453 Gemünden Wohra",
          "646": "06461 Biedenkopf, 06462 Gladenbach, 06464 Angelburg",
          "647": "06471 Weilburg, 06472 Weilmünster, 06473 Leun",
          "648": "06482 Runkel, 06483 Selters Taunus, 06484 Beselich",
          "650": "06500 Waldrach, 06501 Konz, 06502 Schweich",
          "651": "0651 Trier",
          "652": "06522 Mettendorf, 06523 Holsthum, 06524 Rodershausen",
          "653": "06531 Bernkastel-Kues, 06532 Zeltingen-Rachtig, 06533 Morbach Hunsrück",
          "654": "06541 Traben-Trarbach, 06542 Bullay, 06543 Büchenbeuren",
          "655": "06550 Irrhausen, 06551 Prüm, 06552 Olzheim",
          "656": "06561 Bitburg, 06562 Speicher, 06563 Kyllburg",
          "657": "06571 Wittlich, 06572 Manderscheid Eifel, 06573 Gillenfeld",
          "658": "06580 Zemmer, 06581 Saarburg, 06582 Freudenburg",
          "659": "06591 Gerolstein, 06592 Daun, 06593 Hillesheim Eifel",
          "661": "0661 Fulda",
          "662": "06620 Philippsthal Werra, 06621 Bad Hersfeld, 06622 Bebra",
          "663": "06630 Schwalmtal-Storndorf, 06631 Alsfeld, 06633 Homberg Ohm",
          "664": "06641 Lauterbach Hessen, 06642 Schlitz, 06643 Herbstein",
          "665": "06650 Hosenfeld, 06651 Rasdorf, 06652 Hünfeld",
          "666": "06660 Steinau-Marjoss, 06661 Schlüchtern, 06663 Steinau an der Straße",
          "667": "06670 Ludwigsau Hess, 06672 Eiterfeld, 06673 Haunetal",
          "668": "06681 Hilders, 06682 Tann Rhön, 06683 Ehrenberg Rhön",
          "669": "06691 Schwalmstadt, 06692 Neustadt Hessen, 06693 Neuental",
          "670": "06701 Sprendlingen Rheinhess, 06703 Wöllstein Rheinhess, 06704 Langenlonsheim",
          "671": "0671 Bad Kreuznach",
          "672": "06721 Bingen am Rhein, 06722 Rüdesheim am Rhein, 06723 Oestrich-Winkel",
          "673": "06731 Alzey, 06732 Wörrstadt, 06733 Gau-Odernheim",
          "674": "06741 St Goar, 06742 Boppard, 06743 Bacharach",
          "675": "06751 Bad Sobernheim, 06752 Kirn Nahe, 06753 Meisenheim",
          "676": "06761 Simmern Hunsrück, 06762 Kastellaun, 06763 Kirchberg Hunsrück",
          "677": "06771 St Goarshausen, 06772 Nastätten, 06773 Kamp-Bornhofen",
          "678": "06781 Idar-Oberstein, 06782 Birkenfeld Nahe, 06783 Baumholder",
          "680": "06802 Völklingen-Lauterbach, 06803 Mandelbachtal-Ommersheim, 06804 Mandelbachtal",
          "681": "0681 Saarbrücken",
          "682": "06821 Neunkirchen Saar, 06824 Ottweiler, 06825 Illingen Saar",
          "683": "06831 Saarlouis, 06832 Beckingen-Reimsbach, 06833 Rehlingen-Siersburg",
          "684": "06841 Homburg Saar, 06842 Blieskastel, 06843 Gersheim",
          "685": "06851 St Wendel, 06852 Nohfelden, 06853 Marpingen",
          "686": "06861 Merzig, 06864 Mettlach, 06865 Mettlach-Orscholz",
          "687": "06871 Wadern, 06872 Losheim am See, 06873 Nonnweiler",
          "688": "06881 Lebach, 06887 Schmelz Saar, 06888 Lebach-Steinbach",
          "689": "06893 Saarbrücken-Ensheim, 06894 St Ingbert, 06897 Sulzbach Saar",
          "702": "07021 Kirchheim unter Teck, 07022 Nürtingen, 07023 Weilheim an der Teck",
          "703": "07031 Böblingen, 07032 Herrenberg, 07033 Weil Der Stadt",
          "704": "07041 Mühlacker, 07042 Vaihingen an der Enz, 07043 Maulbronn",
          "705": "07051 Calw, 07052 Bad Liebenzell, 07053 Bad Teinach-Zavelstein",
          "706": "07062 Beilstein Württ, 07063 Bad Wimpfen, 07066 Bad Rappenau-Bonfeld",
          "707": "07071 Tübingen, 07072 Gomaringen, 07073 Ammerbuch",
          "708": "07081 Bad Wildbad, 07082 Neuenbürg Württ, 07083 Bad Herrenalb",
          "711": "0711 Stuttgart",
          "712": "07121 Reutlingen, 07122 St Johann Württ, 07123 Metzingen Württ",
          "713": "07130 Löwenstein Württ, 07131 Heilbronn Neckar, 07132 Neckarsulm",
          "714": "07141 Ludwigsburg Württ, 07142 Bietigheim-Bissingen, 07143 Besigheim",
          "715": "07150 Korntal-Münchingen, 07151 Waiblingen, 07152 Leonberg Württ",
          "716": "07161 Göppingen, 07162 Süßen, 07163 Ebersbach an der Fils",
          "717": "07171 Schwäbisch Gmünd, 07172 Lorch Württ, 07173 Heubach",
          "718": "07181 Schorndorf Württ, 07182 Welzheim, 07183 Rudersberg Württ",
          "719": "07191 Backnang, 07192 Murrhardt, 07193 Sulzbach an der Murr",
          "720": "07202 Karlsbad, 07203 Walzbachtal, 07204 Malsch-Völkersbach",
          "721": "0721 Karlsruhe",
          "722": "07220 Forbach-Hundsbach, 07221 Baden-Baden, 07222 Rastatt",
          "723": "07231 Pforzheim, 07232 Königsbach-Stein, 07233 Niefern-Öschelbronn",
          "724": "07240 Pfinztal, 07242 Rheinstetten, 07243 Ettlingen",
          "725": "07250 Kraichtal, 07251 Bruchsal, 07252 Bretten",
          "726": "07260 Sinsheim-Hilsbach, 07261 Sinsheim, 07262 Eppingen",
          "727": "07271 Wörth am Rhein, 07272 Rülzheim, 07273 Hagenbach Pfalz",
          "730": "07300 Roggenburg, 07302 Pfaffenhofen a d Roth, 07303 Illertissen",
          "731": "0731 Ulm Donau",
          "732": "07321 Heidenheim a d Brenz, 07322 Giengen a d Brenz, 07323 Gerstetten",
          "733": "07331 Geislingen an der Steige, 07332 Lauterstein, 07333 Laichingen",
          "734": "07340 Neenstetten, 07343 Buch b Illertissen, 07344 Blaubeuren",
          "735": "07351 Biberach an der Riß, 07352 Ochsenhausen, 07353 Schwendi",
          "736": "07361 Aalen, 07362 Bopfingen, 07363 Lauchheim",
          "737": "07371 Riedlingen Württ, 07373 Zwiefalten, 07374 Uttenweiler",
          "738": "07381 Münsingen, 07382 Römerstein, 07383 Münsingen-Buttenhausen",
          "739": "07391 Ehingen Donau, 07392 Laupheim, 07393 Munderkingen",
          "740": "07402 Fluorn-Winzeln, 07403 Dunningen, 07404 Epfendorf",
          "741": "0741 Rottweil",
          "742": "07420 Deisslingen, 07422 Schramberg, 07423 Oberndorf am Neckar",
          "743": "07431 Albstadt-Ebingen, 07432 Albstadt-Tailfingen, 07433 Balingen",
          "744": "07440 Bad Rippoldsau, 07441 Freudenstadt, 07442 Baiersbronn",
          "745": "07451 Horb am Neckar, 07452 Nagold, 07453 Altensteig Württ",
          "746": "07461 Tuttlingen, 07462 Immendingen, 07463 Mühlheim an der Donau",
          "747": "07471 Hechingen, 07472 Rottenburg am Neckar, 07473 Mössingen",
          "748": "07482 Horb-Dettingen, 07483 Horb-Mühringen, 07484 Simmersfeld",
          "750": "07502 Wolpertswende, 07503 Wilhelmsdorf Württ, 07504 Horgenzell",
          "751": "0751 Ravensburg",
          "752": "07520 Bodnegg, 07522 Wangen im Allgäu, 07524 Bad Waldsee",
          "753": "07531 Konstanz, 07532 Meersburg, 07533 Allensbach",
          "754": "07541 Friedrichshafen, 07542 Tettnang, 07543 Kressbronn am Bodensee",
          "755": "07551 Überlingen Bodensee, 07552 Pfullendorf, 07553 Salem Baden",
          "756": "07561 Leutkirch im Allgäu, 07562 Isny im Allgäu, 07563 Kisslegg",
          "757": "07570 Sigmaringen-Gutenstein, 07571 Sigmaringen, 07572 Mengen Württ",
          "758": "07581 Saulgau, 07582 Bad Buchau, 07583 Bad Schussenried",
          "760": "07602 Oberried Breisgau",
          "761": "0761 Freiburg im Breisgau",
          "762": "07620 Schopfheim-Gersbach, 07621 Lörrach, 07622 Schopfheim",
          "763": "07631 Müllheim Baden, 07632 Badenweiler, 07633 Staufen im Breisgau",
          "764": "07641 Emmendingen, 07642 Endingen Kaiserstuhl, 07643 Herbolzheim Breisgau",
          "765": "07651 Titisee-Neustadt, 07652 Hinterzarten, 07653 Lenzkirch",
          "766": "07660 St Peter Schwarzw, 07661 Kirchzarten, 07662 Vogtsburg im Kaiserstuhl",
          "767": "07671 Todtnau, 07672 St Blasien, 07673 Schönau im Schwarzwald",
          "768": "07681 Waldkirch Breisgau, 07682 Elzach, 07683 Simonswald",
          "770": "07702 Blumberg Baden, 07703 Bonndorf im Schwarzwald, 07704 Geisingen Baden",
          "771": "0771 Donaueschingen",
          "772": "07720 Schwenningen a Neckar, 07721 Villingen i Schwarzw, 07722 Triberg im Schwarzwald",
          "773": "07731 Singen Hohentwiel, 07732 Radolfzell am Bodensee, 07733 Engen Hegau",
          "774": "07741 Tiengen Hochrhein, 07742 Klettgau, 07743 Ühlingen-Birkendorf",
          "775": "07751 Waldshut, 07753 Albbruck, 07754 Görwihl",
          "776": "07761 Bad Säckingen, 07762 Wehr Baden, 07763 Murg",
          "777": "07771 Stockach, 07773 Bodman-Ludwigshafen, 07774 Eigeltingen",
          "780": "07802 Oberkirch Baden, 07803 Gengenbach, 07804 Oppenau",
          "781": "0781 Offenburg",
          "782": "07821 Lahr Schwarzwald, 07822 Ettenheim, 07823 Seelbach Schutter",
          "783": "07831 Hausach, 07832 Haslach im Kinzigtal, 07833 Hornberg Schwarzwaldbahn",
          "784": "07841 Achern, 07842 Kappelrodeck, 07843 Renchen",
          "785": "07851 Kehl, 07852 Willstätt, 07853 Kehl-Bodersweier",
          "790": "07903 Mainhardt, 07904 Ilshofen, 07905 Langenburg",
          "791": "0791 Schwäbisch Hall",
          "793": "07930 Boxberg Baden, 07931 Bad Mergentheim, 07932 Niederstetten Württ",
          "794": "07940 Künzelsau, 07941 Öhringen, 07942 Neuenstein Württ",
          "795": "07950 Schnelldorf, 07951 Crailsheim, 07952 Gerabronn",
          "796": "07961 Ellwangen Jagst, 07962 Fichtenau, 07963 Adelmannsfelden",
          "797": "07971 Gaildorf, 07972 Gschwend b Gaildorf, 07973 Obersontheim",
          "802": "08020 Weyarn, 08021 Waakirchen, 08022 Tegernsee",
          "803": "08031 Rosenheim Oberbay, 08032 Rohrdorf Kr Rosenheim, 08033 Oberaudorf",
          "804": "08041 Bad Tölz, 08042 Lenggries, 08043 Jachenau",
          "805": "08051 Prien a Chiemsee, 08052 Aschau i Chiemgau, 08053 Bad Endorf",
          "806": "08061 Bad Aibling, 08062 Bruckmühl Mangfall, 08063 Feldkirchen-Westerham",
          "807": "08071 Wasserburg a Inn, 08072 Haag i OB, 08073 Gars a Inn",
          "808": "08081 Dorfen Stadt, 08082 Schwindegg, 08083 Isen",
          "809": "08091 Kirchseeon, 08092 Grafing b München, 08093 Glonn Kr Ebersberg",
          "810": "08102 Höhenkirchen-Siegertsbrunn, 08104 Sauerlach, 08105 Gilching",
          "811": "0811 Hallbergmoos",
          "812": "08121 Markt Schwaben, 08122 Erding, 08123 Moosinning",
          "813": "08131 Dachau, 08133 Haimhausen Oberbay, 08134 Odelzhausen",
          "814": "08141 Fürstenfeldbruck, 08142 Olching, 08143 Inning a Ammersee",
          "815": "08151 Starnberg, 08152 Herrsching a Ammersee, 08153 Wessling",
          "816": "08161 Freising, 08165 Neufahrn b Freising, 08166 Allershausen Oberbay",
          "817": "08170 Straßlach-Dingharting, 08171 Wolfratshausen, 08176 Egling b Wolfratshausen",
          "819": "08191 Landsberg a Lech, 08192 Schondorf a Ammersee, 08193 Geltendorf",
          "820": "08202 Althegnenberg, 08203 Grossaitingen, 08204 Mickhausen",
          "821": "0821 Augsburg",
          "822": "08221 Günzburg, 08222 Burgau Schwab, 08223 Ichenhausen",
          "823": "08230 Gablingen, 08231 Königsbrunn b Augsburg, 08232 Schwabmünchen",
          "824": "08241 Buchloe, 08243 Fuchstal, 08245 Türkheim Wertach",
          "825": "08250 Hilgertshausen-Tandern, 08251 Aichach, 08252 Schrobenhausen",
          "826": "08261 Mindelheim, 08262 Mittelneufnach, 08263 Breitenbrunn Schwab",
          "827": "08271 Meitingen, 08272 Wertingen, 08273 Nordendorf",
          "828": "08281 Thannhausen Schwab, 08282 Krumbach Schwaben, 08283 Neuburg a d Kammel",
          "829": "08291 Zusmarshausen, 08292 Dinkelscherben, 08293 Welden b Augsburg",
          "830": "08302 Görisried, 08303 Waltenhofen, 08304 Wildpoldsried",
          "831": "0831 Kempten Allgäu",
          "832": "08320 Missen-Wilhams, 08321 Sonthofen, 08322 Oberstdorf",
          "833": "08330 Legau, 08331 Memmingen, 08332 Ottobeuren",
          "834": "08340 Baisweil, 08341 Kaufbeuren, 08342 Marktoberdorf",
          "836": "08361 Nesselwang, 08362 Füssen, 08363 Pfronten",
          "837": "08370 Wiggensbach, 08372 Obergünzburg, 08373 Altusried",
          "838": "08380 Achberg, 08381 Lindenberg i Allgäu, 08382 Lindau Bodensee",
          "839": "08392 Markt Rettenbach, 08393 Holzgünz, 08394 Lautrach",
          "840": "08402 Münchsmünster, 08403 Pförring, 08404 Oberdolling",
          "841": "0841 Ingolstadt Donau",
          "842": "08421 Eichstätt Bay, 08422 Dollnstein, 08423 Titting",
          "843": "08431 Neuburg a d Donau, 08432 Burgheim, 08433 Königsmoos",
          "844": "08441 Pfaffenhofen a d Ilm, 08442 Wolnzach, 08443 Hohenwart Paar",
          "845": "08450 Ingolstadt-Zuchering, 08452 Geisenfeld, 08453 Reichertshofen Oberbay",
          "846": "08460 Berching-Holnstein, 08461 Beilngries, 08462 Berching",
          "850": "08501 Thyrnau, 08502 Fürstenzell, 08503 Neuhaus a Inn",
          "851": "0851 Passau",
          "853": "08531 Pocking, 08532 Griesbach i Rottal, 08533 Rotthalmünster",
          "854": "08541 Vilshofen Niederbay, 08542 Ortenburg, 08543 Aidenbach",
          "855": "08550 Philippsreut, 08551 Freyung, 08552 Grafenau Niederbay",
          "856": "08561 Pfarrkirchen Niederbay, 08562 Triftern, 08563 Bad Birnbach Rottal",
          "857": "08571 Simbach a Inn, 08572 Tann Niederbay, 08573 Ering",
          "858": "08581 Waldkirchen Niederbay, 08582 Röhrnbach, 08583 Neureichenau",
          "859": "08591 Obernzell, 08592 Wegscheid Niederbay, 08593 Untergriesbach",
          "861": "0861 Traunstein",
          "862": "08621 Trostberg, 08622 Tacherting- Peterskirchen, 08623 Kirchweidach",
          "863": "08630 Oberneukirchen, 08631 Mühldorf a Inn, 08633 Tüßling",
          "864": "08640 Reit Im Winkl, 08641 Grassau Kr Traunstein, 08642 Übersee",
          "865": "08650 Marktschellenberg, 08651 Bad Reichenhall, 08652 Berchtesgaden",
          "866": "08661 Grabenstätt Chiemsee, 08662 Siegsdorf Kr Traunstein, 08663 Ruhpolding",
          "867": "08670 Reischach Kr Altötting, 08671 Altötting, 08677 Burghausen Salzach",
          "868": "08681 Waging a See, 08682 Laufen Salzach, 08683 Tittmoning",
          "870": "08702 Wörth a d Isar, 08703 Essenbach, 08704 Altdorf-Pfettrach",
          "871": "0871 Landshut",
          "872": "08721 Eggenfelden, 08722 Gangkofen, 08723 Arnstorf",
          "873": "08731 Dingolfing, 08732 Frontenhausen, 08733 Mengkofen",
          "874": "08741 Vilsbiburg, 08742 Velden Vils, 08743 Geisenhausen",
          "875": "08751 Mainburg, 08752 Au i d Hallertau, 08753 Elsendorf Niederbay",
          "876": "08761 Moosburg a d Isar, 08762 Wartenberg Oberbay, 08764 Mauern Kr Freising",
          "877": "08771 Ergoldsbach, 08772 Mallersdorf-Pfaffenberg, 08773 Neufahrn i NB",
          "878": "08781 Rottenburg a d Laaber, 08782 Pfeffenhausen, 08783 Rohr i NB",
          "880": "08801 Seeshaupt, 08802 Huglfing, 08803 Peissenberg",
          "881": "0881 Weilheim i OB",
          "882": "08821 Garmisch-Partenkirchen, 08822 Oberammergau, 08823 Mittenwald",
          "884": "08841 Murnau a Staffelsee, 08845 Bad Kohlgrub, 08846 Uffing a Staffelsee",
          "885": "08851 Kochel a See, 08856 Penzberg, 08857 Benediktbeuern",
          "886": "08860 Bernbeuren, 08861 Schongau, 08862 Steingaden Oberbay",
          "906": "0906 Donauwörth",
          "907": "09070 Tapfheim, 09071 Dillingen a d Donau, 09072 Lauingen Donau",
          "908": "09080 Harburg Schwaben, 09081 Nördlingen, 09082 Oettingen i Bay",
          "909": "09090 Rain Lech, 09091 Monheim Schwab, 09092 Wemding",
          "910": "09101 Langenzenn, 09102 Wilhermsdorf, 09103 Cadolzburg",
          "911": "0911 Nürnberg",
          "912": "09120 Leinburg, 09122 Schwabach, 09123 Lauf a d Pegnitz",
          "913": "09131 Erlangen, 09132 Herzogenaurach, 09133 Baiersdorf Mittelfr",
          "914": "09141 Weißenburg i Bay, 09142 Treuchtlingen, 09143 Pappenheim Mittelfr",
          "915": "09151 Hersbruck, 09152 Hartenstein Mittelfr, 09153 Schnaittach",
          "916": "09161 Neustadt a d Aisch, 09162 Scheinfeld, 09163 Dachsbach",
          "917": "09170 Schwanstetten, 09171 Roth Mittelfr, 09172 Georgensgmünd",
          "918": "09180 Pyrbaum, 09181 Neumarkt i d Opf, 09182 Velburg",
          "919": "09190 Heroldsbach, 09191 Forchheim Oberfr, 09192 Gräfenberg",
          "920": "09201 Gesees, 09202 Waischenfeld, 09203 Neudrossenfeld",
          "921": "0921 Bayreuth",
          "922": "09220 Kasendorf-Azendorf, 09221 Kulmbach, 09222 Presseck",
          "923": "09231 Marktredwitz, 09232 Wunsiedel, 09233 Arzberg Oberfr",
          "924": "09241 Pegnitz, 09242 Gößweinstein, 09243 Pottenstein",
          "925": "09251 Münchberg, 09252 Helmbrechts, 09253 Weissenstadt",
          "926": "09260 Wilhelmsthal Oberfr, 09261 Kronach, 09262 Wallenfels",
          "927": "09270 Creussen, 09271 Thurnau-Alladorf, 09272 Fichtelberg",
          "928": "09280 Selbitz Oberfr, 09281 Hof Saale, 09282 Naila",
          "929": "09292 Konradsreuth, 09293 Berg Oberfr, 09294 Regnitzlosau",
          "930": "09302 Rottendorf Unterfr, 09303 Eibelstadt, 09305 Estenfeld",
          "931": "0931 Würzburg",
          "932": "09321 Kitzingen, 09323 Iphofen, 09324 Dettelbach",
          "933": "09331 Ochsenfurt, 09332 Marktbreit, 09333 Sommerhausen",
          "934": "09340 Königheim-Brehmen, 09341 Tauberbischofsheim, 09342 Wertheim",
          "935": "09350 Eussenheim-Hundsbach, 09351 Gemünden a Main, 09352 Lohr a Main",
          "936": "09360 Thüngen, 09363 Arnstein Unterfr, 09364 Zellingen",
          "937": "09371 Miltenberg, 09372 Klingenberg a Main, 09373 Amorbach",
          "938": "09381 Volkach, 09382 Gerolzhofen, 09383 Wiesentheid",
          "939": "09391 Marktheidenfeld, 09392 Faulbach Unterfr, 09393 Rothenfels Unterfr",
          "940": "09401 Neutraubling, 09402 Regenstauf, 09403 Donaustauf",
          "941": "0941 Regensburg",
          "942": "09420 Feldkirchen Niederbay, 09421 Straubing, 09422 Bogen Niederbay",
          "943": "09431 Schwandorf, 09433 Nabburg, 09434 Bodenwöhr",
          "944": "09441 Kelheim, 09442 Riedenburg, 09443 Abensberg",
          "945": "09451 Schierling, 09452 Langquaid, 09453 Thalmassing",
          "946": "09461 Roding, 09462 Falkenstein Oberpf, 09463 Wald Oberpf",
          "947": "09471 Burglengenfeld, 09472 Hohenfels Oberpf, 09473 Kallmünz",
          "948": "09480 Sünching, 09481 Pfatter, 09482 Wörth a d Donau",
          "949": "09491 Hemau, 09492 Parsberg, 09493 Beratzhausen",
          "950": "09502 Frensdorf, 09503 Oberhaid Oberfr, 09504 Stadelhofen",
          "951": "0951 Bamberg",
          "952": "09521 Hassfurt, 09522 Eltmann, 09523 Hofheim i Ufr",
          "953": "09531 Ebern, 09532 Maroldsweisach, 09533 Untermerzbach",
          "954": "09542 Schesslitz, 09543 Hirschaid, 09544 Baunach",
          "955": "09551 Burgwindheim, 09552 Burghaslach, 09553 Ebrach Oberfr",
          "956": "09560 Grub a Forst, 09561 Coburg, 09562 Sonnefeld",
          "957": "09571 Lichtenfels Bay, 09572 Burgkunstadt, 09573 Staffelstein Oberfr",
          "960": "09602 Neustadt a d Waldnaab, 09603 Floss, 09604 Wernberg-Köblitz",
          "961": "0961 Weiden i d Opf",
          "962": "09621 Amberg Oberpf, 09622 Hirschau Oberpf, 09624 Ensdorf Oberpf",
          "963": "09631 Tirschenreuth, 09632 Waldsassen, 09633 Mitterteich",
          "964": "09641 Grafenwöhr, 09642 Kemnath Stadt, 09643 Auerbach i d Opf",
          "965": "09651 Vohenstrauss, 09652 Waidhaus, 09653 Eslarn",
          "966": "09661 Sulzbach-Rosenberg, 09662 Vilseck, 09663 Neukirchen b Sulzbach-Rosenberg",
          "967": "09671 Oberviechtach, 09672 Neunburg vorm Wald, 09673 Tiefenbach Oberpf",
          "968": "09681 Windischeschenbach, 09682 Erbendorf, 09683 Friedenfels",
          "970": "09701 Sandberg Unterfr, 09704 Euerdorf, 09708 Bad Bocklet",
          "971": "0971 Bad Kissingen",
          "972": "09720 Üchtelhausen, 09721 Schweinfurt, 09722 Werneck",
          "973": "09732 Hammelburg, 09733 Münnerstadt, 09734 Burkardroth",
          "974": "09741 Bad Brückenau, 09742 Kalbach Rhön, 09744 Zeitlofs-Detter",
          "976": "09761 Bad Königshofen i Grabfeld, 09762 Saal a d Saale, 09763 Sulzdorf a d Lederhecke",
          "977": "09771 Bad Neustadt a d Saale, 09772 Bischofsheim a d Rhön, 09773 Unsleben",
          "980": "09802 Ansbach-Katterbach, 09803 Colmberg, 09804 Aurach",
          "981": "0981 Ansbach",
          "982": "09820 Lehrberg, 09822 Bechhofen a d Heide, 09823 Leutershausen",
          "983": "09831 Gunzenhausen, 09832 Wassertrüdingen, 09833 Heidenheim Mittelfr",
          "984": "09841 Bad Windsheim, 09842 Uffenheim, 09843 Burgbernheim",
          "985": "09851 Dinkelsbühl, 09852 Feuchtwangen, 09853 Wilburgstetten",
          "986": "09861 Rothenburg ob der Tauber, 09865 Adelshofen Mittelfr, 09867 Geslau",
          "987": "09871 Windsbach, 09872 Heilsbronn, 09873 Abenberg-Wassermungenau",
          "990": "09901 Hengersberg Bay, 09903 Schöllnach, 09904 Lalling",
          "991": "0991 Deggendorf",
          "992": "09920 Bischofsmais, 09921 Regen, 09922 Zwiesel",
          "993": "09931 Plattling, 09932 Osterhofen, 09933 Wallersdorf",
          "994": "09941 Kötzting, 09942 Viechtach, 09943 Lam Oberpf",
          "995": "09951 Landau a d Isar, 09952 Eichendorf, 09953 Pilsting",
          "996": "09961 Mitterfels, 09962 Schwarzach Niederbay, 09963 Konzell",
          "997": "09971 Cham, 09972 Waldmünchen, 09973 Furth i Wald"
        }
      },
      "about": {
        "x": {
          "30": [
            "2 codes",
            "030 Berlin, 030 Berlin"
          ],
          "40": [
            "2 codes",
            "040 Hamburg, 040 Hamburg"
          ],
          "69": [
            "2 codes",
            "069 Frankfurt am Main, 069 Frankfurt am Main"
          ],
          "89": [
            "2 codes",
            "089 München, 089 München"
          ],
          "201": [
            "Essen"
          ],
          "202": [
            "Wuppertal"
          ],
          "203": [
            "Duisburg"
          ],
          "204": [
            "3 codes",
            "02041 Bottrop, 02043 Gladbeck, 02045 Bottrop-Kirchhellen"
          ],
          "205": [
            "6 codes",
            "02051 Velbert, 02052 Velbert-Langenberg, 02053 Velbert-Neviges"
          ],
          "206": [
            "3 codes",
            "02064 Dinslaken, 02065 Duisburg-Rheinhausen, 02066 Duisburg-Homberg"
          ],
          "208": [
            "Oberhausen Rheinl"
          ],
          "209": [
            "Gelsenkirchen"
          ],
          "210": [
            "3 codes",
            "02102 Ratingen, 02103 Hilden, 02104 Mettmann"
          ],
          "211": [
            "Düsseldorf"
          ],
          "212": [
            "2 codes",
            "0212 Solingen, 02129 Haan Rheinl"
          ],
          "213": [
            "4 codes",
            "02131 Neuss, 02132 Meerbusch-Büderich, 02133 Dormagen"
          ],
          "214": [
            "Leverkusen"
          ],
          "215": [
            "9 codes",
            "02150 Meerbusch-Lank, 02151 Krefeld, 02152 Kempen"
          ],
          "216": [
            "6 codes",
            "02161 Mönchengladbach, 02162 Viersen, 02163 Schwalmtal Niederrhein"
          ],
          "217": [
            "4 codes",
            "02171 Leverkusen-Opladen, 02173 Langenfeld Rheinland, 02174 Burscheid Rheinl"
          ],
          "218": [
            "3 codes",
            "02181 Grevenbroich, 02182 Grevenbroich-Kapellen, 02183 Rommerskirchen"
          ],
          "219": [
            "5 codes",
            "02191 Remscheid, 02192 Hückeswagen, 02193 Dabringhausen"
          ],
          "220": [
            "7 codes",
            "02202 Bergisch Gladbach, 02203 Köln-Porz, 02204 Bensberg"
          ],
          "221": [
            "Köln"
          ],
          "222": [
            "7 codes",
            "02222 Bornheim Rheinl, 02223 Königswinter, 02224 Bad Honnef"
          ],
          "223": [
            "7 codes",
            "02232 Brühl Rheinl, 02233 Hürth Rheinl, 02234 Frechen"
          ],
          "224": [
            "8 codes",
            "02241 Siegburg, 02242 Hennef Sieg, 02243 Eitorf"
          ],
          "225": [
            "7 codes",
            "02251 Euskirchen, 02252 Zülpich, 02253 Bad Münstereifel"
          ],
          "226": [
            "9 codes",
            "02261 Gummersbach, 02262 Wiehl, 02263 Engelskirchen"
          ],
          "227": [
            "5 codes",
            "02271 Bergheim Erft, 02272 Bedburg Erft, 02273 Kerpen-Horrem"
          ],
          "228": [
            "Bonn"
          ],
          "229": [
            "7 codes",
            "02291 Waldbröl, 02292 Windeck Sieg, 02293 Nümbrecht"
          ],
          "230": [
            "9 codes",
            "02301 Holzwickede, 02302 Witten, 02303 Unna"
          ],
          "231": [
            "Dortmund"
          ],
          "232": [
            "4 codes",
            "02323 Herne, 02324 Hattingen Ruhr, 02325 Wanne-Eickel"
          ],
          "233": [
            "10 codes",
            "02330 Herdecke, 02331 Hagen Westf, 02332 Gevelsberg"
          ],
          "234": [
            "Bochum"
          ],
          "235": [
            "8 codes",
            "02351 Lüdenscheid, 02352 Altena Westf, 02353 Halver"
          ],
          "236": [
            "10 codes",
            "02360 Haltern-Lippramsdorf, 02361 Recklinghausen, 02362 Dorsten"
          ],
          "237": [
            "8 codes",
            "02371 Iserlohn, 02372 Hemer, 02373 Menden Sauerland"
          ],
          "238": [
            "8 codes",
            "02381 Hamm Westf, 02382 Ahlen Westf, 02383 Bönen"
          ],
          "239": [
            "5 codes",
            "02391 Plettenberg, 02392 Werdohl, 02393 Sundern-Allendorf"
          ],
          "240": [
            "9 codes",
            "02401 Baesweiler, 02402 Stolberg Rheinl, 02403 Eschweiler Rheinl"
          ],
          "241": [
            "Aachen"
          ],
          "242": [
            "9 codes",
            "02421 Düren, 02422 Kreuzau, 02423 Langerwehe"
          ],
          "243": [
            "6 codes",
            "02431 Erkelenz, 02432 Wassenberg, 02433 Hückelhoven"
          ],
          "244": [
            "9 codes",
            "02440 Nettersheim-Tondorf, 02441 Kall, 02443 Mechernich"
          ],
          "245": [
            "6 codes",
            "02451 Geilenkirchen, 02452 Heinsberg Rheinl, 02453 Heinsberg-Randerath"
          ],
          "246": [
            "5 codes",
            "02461 Jülich, 02462 Linnich, 02463 Titz"
          ],
          "247": [
            "4 codes",
            "02471 Roetgen Eifel, 02472 Monschau, 02473 Simmerath"
          ],
          "248": [
            "4 codes",
            "02482 Hellenthal, 02484 Mechernich-Eiserfey, 02485 Schleiden-Dreiborn"
          ],
          "250": [
            "8 codes",
            "02501 Münster-Hiltrup, 02502 Nottuln, 02504 Telgte"
          ],
          "251": [
            "Münster"
          ],
          "252": [
            "10 codes",
            "02520 Wadersloh-Diestedde, 02521 Beckum, 02522 Oelde"
          ],
          "253": [
            "6 codes",
            "02532 Ostbevern, 02533 Münster-Nienberge, 02534 Münster-Roxel"
          ],
          "254": [
            "7 codes",
            "02541 Coesfeld, 02542 Gescher, 02543 Billerbeck Westf"
          ],
          "255": [
            "8 codes",
            "02551 Steinfurt-Burgsteinfurt, 02552 Steinfurt-Borghorst, 02553 Ochtrup"
          ],
          "256": [
            "8 codes",
            "02561 Ahaus, 02562 Gronau Westfalen, 02563 Stadtlohn"
          ],
          "257": [
            "5 codes",
            "02571 Greven Westf, 02572 Emsdetten, 02573 Nordwalde"
          ],
          "258": [
            "8 codes",
            "02581 Warendorf, 02582 Everswinkel, 02583 Sassenberg"
          ],
          "259": [
            "10 codes",
            "02590 Dülmen-Buldern, 02591 Lüdinghausen, 02592 Selm"
          ],
          "260": [
            "8 codes",
            "02601 Nauort, 02602 Montabaur, 02603 Bad Ems"
          ],
          "261": [
            "Koblenz a Rhein"
          ],
          "262": [
            "9 codes",
            "02620 Neuhäusel Westerw, 02621 Lahnstein, 02622 Bendorf Rhein"
          ],
          "263": [
            "10 codes",
            "02630 Mülheim-Kärlich, 02631 Neuwied, 02632 Andernach"
          ],
          "264": [
            "7 codes",
            "02641 Bad Neuenahr-Ahrweiler, 02642 Remagen, 02643 Altenahr"
          ],
          "265": [
            "7 codes",
            "02651 Mayen, 02652 Mendig, 02653 Kaisersesch"
          ],
          "266": [
            "6 codes",
            "02661 Bad Marienberg Westerwald, 02662 Hachenburg, 02663 Westerburg Westerw"
          ],
          "267": [
            "8 codes",
            "02671 Cochem, 02672 Treis-Karden, 02673 Ellenz-Poltersdorf"
          ],
          "268": [
            "10 codes",
            "02680 Mündersbach, 02681 Altenkirchen Westerwald, 02682 Hamm Sieg"
          ],
          "269": [
            "7 codes",
            "02691 Adenau, 02692 Kelberg, 02693 Antweiler"
          ],
          "271": [
            "Siegen"
          ],
          "272": [
            "5 codes",
            "02721 Lennestadt, 02722 Attendorn, 02723 Kirchhundem"
          ],
          "273": [
            "8 codes",
            "02732 Kreuztal, 02733 Hilchenbach, 02734 Freudenberg Westf"
          ],
          "274": [
            "6 codes",
            "02741 Betzdorf, 02742 Wissen, 02743 Daaden"
          ],
          "275": [
            "8 codes",
            "02750 Diedenshausen, 02751 Bad Berleburg, 02752 Bad Laasphe"
          ],
          "276": [
            "4 codes",
            "02761 Olpe Biggesee, 02762 Wenden Südsauerland, 02763 Drolshagen-Bleche"
          ],
          "277": [
            "10 codes",
            "02770 Eschenburg, 02771 Dillenburg, 02772 Herborn Hess"
          ],
          "280": [
            "4 codes",
            "02801 Xanten, 02802 Alpen, 02803 Wesel-Büderich"
          ],
          "281": [
            "Wesel"
          ],
          "282": [
            "8 codes",
            "02821 Kleve Niederrhein, 02822 Emmerich, 02823 Goch"
          ],
          "283": [
            "9 codes",
            "02831 Geldern, 02832 Kevelaer, 02833 Kerken"
          ],
          "284": [
            "5 codes",
            "02841 Moers, 02842 Kamp-Lintfort, 02843 Rheinberg"
          ],
          "285": [
            "9 codes",
            "02850 Rees-Haldern, 02851 Rees, 02852 Hamminkeln"
          ],
          "286": [
            "7 codes",
            "02861 Borken Westf, 02862 Südlohn, 02863 Velen"
          ],
          "287": [
            "4 codes",
            "02871 Bocholt, 02872 Rhede Westf, 02873 Isselburg-Werth"
          ],
          "290": [
            "4 codes",
            "02902 Warstein, 02903 Meschede-Freienohl, 02904 Bestwig"
          ],
          "291": [
            "Meschede"
          ],
          "292": [
            "7 codes",
            "02921 Soest, 02922 Werl, 02923 Lippetal-Herzfeld"
          ],
          "293": [
            "7 codes",
            "02931 Arnsberg, 02932 Neheim-Hüsten, 02933 Sundern Sauerland"
          ],
          "294": [
            "7 codes",
            "02941 Lippstadt, 02942 Geseke, 02943 Erwitte"
          ],
          "295": [
            "7 codes",
            "02951 Büren, 02952 Rüthen, 02953 Wünnenberg"
          ],
          "296": [
            "4 codes",
            "02961 Brilon, 02962 Olsberg, 02963 Brilon-Messinghausen"
          ],
          "297": [
            "6 codes",
            "02971 Schmallenberg-Dorlar, 02972 Schmallenberg, 02973 Eslohe Sauerland"
          ],
          "298": [
            "5 codes",
            "02981 Winterberg Westf, 02982 Medebach, 02983 Winterberg-Siedlinghausen"
          ],
          "299": [
            "4 codes",
            "02991 Marsberg-Bredelar, 02992 Marsberg, 02993 Marsberg-Canstein"
          ],
          "330": [
            "22 codes",
            "03301 Oranienburg, 03302 Hennigsdorf, 03303 Birkenwerder"
          ],
          "331": [
            "Potsdam"
          ],
          "332": [
            "24 codes",
            "033200 Bergholz-Rehbrücke, 033201 Gross Glienicke, 033202 Töplitz"
          ],
          "333": [
            "29 codes",
            "03331 Angermünde, 03332 Schwedt/Oder, 033331 Casekow"
          ],
          "334": [
            "27 codes",
            "03341 Strausberg, 03342 Neuenhagen b Berlin, 033432 Müncheberg"
          ],
          "335": [
            "Frankfurt (Oder)"
          ],
          "336": [
            "36 codes",
            "033601 Podelzig, 033602 Alt Zeschdorf, 033603 Falkenhagen b Seelow"
          ],
          "337": [
            "32 codes",
            "033701 Grossbeeren, 033702 Wünsdorf, 033703 Sperenberg"
          ],
          "338": [
            "30 codes",
            "03381 Brandenburg an der Havel, 03382 Lehnin, 033830 Ziesar"
          ],
          "339": [
            "39 codes",
            "03391 Neuruppin, 033920 Walsleben b Neuruppin, 033921 Zechlinerhütte"
          ],
          "340": [
            "Dessau Anh"
          ],
          "341": [
            "Leipzig"
          ],
          "342": [
            "30 codes",
            "034202 Delitzsch, 034203 Zwenkau, 034204 Schkeuditz"
          ],
          "343": [
            "28 codes",
            "03431 Döbeln, 034321 Leisnig, 034322 Rosswein"
          ],
          "344": [
            "30 codes",
            "03441 Zeitz, 034422 Osterfeld, 034423 Heuckewalde"
          ],
          "345": [
            "Halle Saale"
          ],
          "346": [
            "32 codes",
            "034600 Ostrau Saalkreis, 034601 Teutschenthal, 034602 Landsberg Sachs-Anh"
          ],
          "347": [
            "22 codes",
            "03471 Bernburg Saale, 034721 Nienburg Saale, 034722 Preusslitz"
          ],
          "349": [
            "31 codes",
            "034901 Roßlau Elbe, 034903 Coswig Anhalt, 034904 Oranienbaum"
          ],
          "350": [
            "20 codes",
            "03501 Pirna, 035020 Struppen, 035021 Königstein Sächs Schweiz"
          ],
          "351": [
            "Dresden"
          ],
          "352": [
            "32 codes",
            "035200 Arnsdorf b Dresden, 035201 Langebrück, 035202 Klingenberg Sachs"
          ],
          "353": [
            "26 codes",
            "03531 Finsterwalde, 035322 Doberlug-Kirchhain, 035323 Sonnewalde"
          ],
          "354": [
            "23 codes",
            "03541 Calau, 03542 Lübbenau Spreewald, 035433 Vetschau"
          ],
          "355": [
            "Cottbus"
          ],
          "356": [
            "22 codes",
            "035600 Döbern NL, 035601 Peitz, 035602 Drebkau"
          ],
          "357": [
            "28 codes",
            "03571 Hoyerswerda, 035722 Lauta b Hoyerswerda, 035723 Bernsdorf OL"
          ],
          "358": [
            "28 codes",
            "03581 Görlitz, 035820 Zodel, 035822 Hagenwerder"
          ],
          "359": [
            "23 codes",
            "03591 Bautzen, 03592 Kirschau, 035930 Seitschen"
          ],
          "360": [
            "29 codes",
            "03601 Mühlhausen Thür, 036020 Ebeleben, 036021 Schlotheim"
          ],
          "361": [
            "Erfurt"
          ],
          "362": [
            "24 codes",
            "036200 Elxleben b Arnstadt, 036201 Walschleben, 036202 Neudietendorf"
          ],
          "363": [
            "24 codes",
            "03631 Nordhausen Thür, 03632 Sondershausen, 036330 Grossberndten"
          ],
          "364": [
            "28 codes",
            "03641 Jena, 036421 Camburg, 036422 Reinstädt Thür"
          ],
          "365": [
            "Gera"
          ],
          "366": [
            "34 codes",
            "036601 Hermsdorf Thür, 036602 Ronneburg Thür, 036603 Weida"
          ],
          "367": [
            "33 codes",
            "036701 Lichte, 036702 Lauscha, 036703 Gräfenthal"
          ],
          "368": [
            "21 codes",
            "03681 Suhl, 03682 Zella-Mehlis, 03683 Schmalkalden"
          ],
          "369": [
            "31 codes",
            "03691 Eisenach Thür, 036920 Grossenlupnitz, 036921 Wutha-Farnroda"
          ],
          "371": [
            "Chemnitz Sachs"
          ],
          "372": [
            "23 codes",
            "037200 Wittgensdorf b Chemnitz, 037202 Claussnitz b Chemnitz, 037203 Gersdorf b Chemnitz"
          ],
          "373": [
            "36 codes",
            "03731 Freiberg Sachs, 037320 Mulda Sachs, 037321 Frankenstein Sachs"
          ],
          "374": [
            "22 codes",
            "03741 Plauen, 037421 Oelsnitz Vogtl, 037422 Markneukirchen"
          ],
          "375": [
            "Zwickau"
          ],
          "376": [
            "15 codes",
            "037600 Neumark Sachs, 037601 Mülsen Skt Jacob, 037602 Kirchberg Sachs"
          ],
          "377": [
            "9 codes",
            "03771 Aue Sachs, 03772 Schneeberg Erzgeb, 03773 Johanngeorgenstadt"
          ],
          "381": [
            "Rostock"
          ],
          "382": [
            "30 codes",
            "038201 Gelbensande, 038202 Volkenshagen, 038203 Bad Doberan"
          ],
          "383": [
            "46 codes",
            "038300 Insel Hiddensee, 038301 Putbus, 038302 Sagard"
          ],
          "384": [
            "33 codes",
            "03841 Wismar Meckl, 038422 Neukloster, 038423 Bad Kleinen"
          ],
          "385": [
            "Schwerin Meckl"
          ],
          "386": [
            "8 codes",
            "03860 Raben Steinfeld, 03861 Plate, 03863 Crivitz"
          ],
          "387": [
            "46 codes",
            "03871 Parchim, 038720 Grebbin, 038721 Ziegendorf"
          ],
          "388": [
            "33 codes",
            "03881 Grevesmühlen, 038821 Lüdersdorf Meckl, 038822 Diedrichshagen b Grevesmühlen"
          ],
          "390": [
            "47 codes",
            "039000 Beetzendorf, 039001 Apenburg, 039002 Oebisfelde"
          ],
          "391": [
            "Magdeburg"
          ],
          "392": [
            "43 codes",
            "039200 Gommern, 039201 Wolmirstedt, 039202 Gross Ammensleben"
          ],
          "393": [
            "45 codes",
            "03931 Stendal, 039320 Schinne, 039321 Arneburg"
          ],
          "394": [
            "41 codes",
            "039400 Wefensleben, 039401 Neuwegersleben, 039402 Völpke"
          ],
          "395": [
            "Neubrandenburg"
          ],
          "396": [
            "18 codes",
            "039600 Zwiedorf, 039601 Friedland Meckl, 039602 Kleeth"
          ],
          "397": [
            "33 codes",
            "03971 Anklam, 039721 Liepen b Anklam, 039722 Sarnow b Anklam"
          ],
          "398": [
            "37 codes",
            "03981 Neustrelitz, 039820 Triepkendorf, 039821 Carpin"
          ],
          "399": [
            "41 codes",
            "03991 Waren Müritz, 039921 Ankershagen, 039922 Dambeck b Röbel"
          ],
          "410": [
            "9 codes",
            "04101 Pinneberg, 04102 Ahrensburg, 04103 Wedel"
          ],
          "412": [
            "10 codes",
            "04120 Ellerhoop, 04121 Elmshorn, 04122 Uetersen"
          ],
          "413": [
            "9 codes",
            "04131 Lüneburg, 04132 Amelinghausen, 04133 Wittorf Kr Lünebeburg"
          ],
          "414": [
            "8 codes",
            "04140 Estorf Kr Stade, 04141 Stade, 04142 Steinkirchen Kr Stade"
          ],
          "415": [
            "8 codes",
            "04151 Schwarzenbek, 04152 Geesthacht, 04153 Lauenburg Elbe"
          ],
          "416": [
            "9 codes",
            "04161 Buxtehude, 04162 Jork, 04163 Horneburg Niederelbe"
          ],
          "417": [
            "9 codes",
            "04171 Winsen Luhe, 04172 Salzhausen, 04173 Wulfsen"
          ],
          "418": [
            "10 codes",
            "04180 Königsmoor, 04181 Buchholz in der Nordheide, 04182 Tostedt"
          ],
          "419": [
            "5 codes",
            "04191 Kaltenkirchen Holst, 04192 Bad Bramstedt, 04193 Henstedt-Ulzburg"
          ],
          "420": [
            "8 codes",
            "04202 Achim b Bremen, 04203 Weyhe b Bremen, 04204 Thedinghausen"
          ],
          "421": [
            "Bremen"
          ],
          "422": [
            "4 codes",
            "04221 Delmenhorst, 04222 Ganderkesee, 04223 Ganderkesee-Bookholzberg"
          ],
          "423": [
            "10 codes",
            "04230 Verden-Walle, 04231 Verden Aller, 04232 Langwedel Kr Verden"
          ],
          "424": [
            "10 codes",
            "04240 Syke-Heiligenfelde, 04241 Bassum, 04242 Syke"
          ],
          "425": [
            "8 codes",
            "04251 Hoya, 04252 Bruchhausen-Vilsen, 04253 Asendorf Kr Diepholz"
          ],
          "426": [
            "10 codes",
            "04260 Visselhövede-Wittorf, 04261 Rotenburg Wümme, 04262 Visselhövede"
          ],
          "427": [
            "7 codes",
            "04271 Sulingen, 04272 Siedenburg, 04273 Kirchdorf b Sulingen"
          ],
          "428": [
            "9 codes",
            "04281 Zeven, 04282 Sittensen, 04283 Tarmstedt"
          ],
          "429": [
            "7 codes",
            "04292 Ritterhude, 04293 Ottersberg-Fischerhude, 04294 Riede Kr Verden"
          ],
          "430": [
            "5 codes",
            "04302 Kirchbarkau, 04303 Schlesen, 04305 Westensee"
          ],
          "431": [
            "Kiel"
          ],
          "432": [
            "9 codes",
            "04320 Heidmühlen, 04321 Neumünster, 04322 Bordesholm"
          ],
          "433": [
            "10 codes",
            "04330 Emkendorf, 04331 Rendsburg, 04332 Hamdorf b Rendsburg"
          ],
          "434": [
            "8 codes",
            "04340 Achterwehr, 04342 Preetz Kr Plön, 04343 Laboe"
          ],
          "435": [
            "8 codes",
            "04351 Eckernförde, 04352 Damp, 04353 Ascheffel"
          ],
          "436": [
            "7 codes",
            "04361 Oldenburg in Holstein, 04362 Heiligenhafen, 04363 Lensahn"
          ],
          "437": [
            "2 codes",
            "04371 Burg auf Fehmarn, 04372 Westfehmarn"
          ],
          "438": [
            "5 codes",
            "04381 Lütjenburg, 04382 Wangels, 04383 Grebin"
          ],
          "439": [
            "3 codes",
            "04392 Nortorf b Neumünster, 04393 Boostedt, 04394 Bokhorst"
          ],
          "440": [
            "9 codes",
            "04401 Brake Unterweser, 04402 Rastede, 04403 Bad Zwischenahn"
          ],
          "441": [
            "Oldenburg (Oldb)"
          ],
          "442": [
            "5 codes",
            "04421 Wilhelmshaven, 04422 Sande Kr Friesl, 04423 Fedderwarden"
          ],
          "443": [
            "5 codes",
            "04431 Wildeshausen, 04432 Dötlingen-Brettorf, 04433 Dötlingen"
          ],
          "444": [
            "7 codes",
            "04441 Vechta, 04442 Lohne Oldenburg, 04443 Dinklage"
          ],
          "445": [
            "7 codes",
            "04451 Varel Jadebusen, 04452 Zetel-Neuenburg, 04453 Zetel"
          ],
          "446": [
            "9 codes",
            "04461 Jever, 04462 Wittmund, 04463 Wangerland"
          ],
          "447": [
            "8 codes",
            "04471 Cloppenburg, 04472 Lastrup, 04473 Emstek"
          ],
          "448": [
            "10 codes",
            "04480 Ovelgönne-Strückhausen, 04481 Hatten-Sandkrug, 04482 Hatten"
          ],
          "449": [
            "9 codes",
            "04491 Friesoythe, 04492 Saterland, 04493 Friesoythe-Gehlenberg"
          ],
          "450": [
            "8 codes",
            "04501 Kastorf Holst, 04502 Lübeck-Travemünde, 04503 Timmendorfer Strand"
          ],
          "451": [
            "Lübeck"
          ],
          "452": [
            "9 codes",
            "04521 Eutin, 04522 Plön, 04523 Malente"
          ],
          "453": [
            "8 codes",
            "04531 Bad Oldesloe, 04532 Bargteheide, 04533 Reinfeld Holstein"
          ],
          "454": [
            "7 codes",
            "04541 Ratzeburg, 04542 Mölln Lauenb, 04543 Nusse"
          ],
          "455": [
            "10 codes",
            "04550 Bühnsdorf, 04551 Bad Segeberg, 04552 Leezen"
          ],
          "456": [
            "4 codes",
            "04561 Neustadt in Holstein, 04562 Grömitz, 04563 Scharbeutz-Haffkrug"
          ],
          "460": [
            "8 codes",
            "04602 Freienwill, 04603 Havetoft, 04604 Grossenwiehe"
          ],
          "461": [
            "Flensburg"
          ],
          "462": [
            "7 codes",
            "04621 Schleswig, 04622 Taarstedt, 04623 Böklund"
          ],
          "463": [
            "10 codes",
            "04630 Barderup, 04631 Glücksburg Ostsee, 04632 Steinbergkirche"
          ],
          "464": [
            "5 codes",
            "04641 Süderbrarup, 04642 Kappeln Schlei, 04643 Gelting Angeln"
          ],
          "465": [
            "1 code",
            "04651 Sylt"
          ],
          "466": [
            "8 codes",
            "04661 Niebüll, 04662 Leck, 04663 Süderlügum"
          ],
          "467": [
            "4 codes",
            "04671 Bredstedt, 04672 Langenhorn, 04673 Joldelund"
          ],
          "468": [
            "4 codes",
            "04681 Wyk auf Föhr, 04682 Amrum, 04683 Oldsum"
          ],
          "470": [
            "7 codes",
            "04702 Sandstedt, 04703 Loxstedt-Donnern, 04704 Drangstedt"
          ],
          "471": [
            "Bremerhaven"
          ],
          "472": [
            "5 codes",
            "04721 Cuxhaven, 04722 Cuxhaven-Altenbruch, 04723 Cuxhaven-Altenwalde"
          ],
          "473": [
            "7 codes",
            "04731 Nordenham, 04732 Stadland-Rodenkirchen, 04733 Butjadingen-Burhave"
          ],
          "474": [
            "10 codes",
            "04740 Loxstedt-Dedesdorf, 04741 Nordholz b Bremerhaven, 04742 Dorum"
          ],
          "475": [
            "8 codes",
            "04751 Otterndorf, 04752 Neuhaus Oste, 04753 Balje"
          ],
          "476": [
            "9 codes",
            "04761 Bremervörde, 04762 Kutenholz, 04763 Gnarrenburg"
          ],
          "477": [
            "10 codes",
            "04770 Wischhafen, 04771 Hemmoor, 04772 Oberndorf Oste"
          ],
          "479": [
            "6 codes",
            "04791 Osterholz-Scharmbeck, 04792 Worpswede, 04793 Hambergen"
          ],
          "480": [
            "5 codes",
            "04802 Wrohm, 04803 Pahlen, 04804 Nordhastedt"
          ],
          "481": [
            "Heide Holst"
          ],
          "482": [
            "9 codes",
            "04821 Itzehoe, 04822 Kellinghusen, 04823 Wilster"
          ],
          "483": [
            "9 codes",
            "04830 Süderhastedt, 04832 Meldorf, 04833 Wesselburen"
          ],
          "484": [
            "9 codes",
            "04841 Husum Nordsee, 04842 Nordstrand, 04843 Viöl"
          ],
          "485": [
            "9 codes",
            "04851 Marne, 04852 Brunsbüttel, 04853 Sankt Michaelisdonn"
          ],
          "486": [
            "5 codes",
            "04861 Tönning, 04862 Garding, 04863 Sankt Peter-Ording"
          ],
          "487": [
            "7 codes",
            "04871 Hohenwestedt, 04872 Hanerau-Hademarschen, 04873 Aukrug"
          ],
          "488": [
            "5 codes",
            "04881 Friedrichstadt, 04882 Lunden, 04883 Süderstapel"
          ],
          "489": [
            "2 codes",
            "04892 Schenefeld Mittelholst, 04893 Hohenaspe"
          ],
          "490": [
            "2 codes",
            "04902 Jemgum-Ditzum, 04903 Wymeer"
          ],
          "491": [
            "Leer Ostfriesland"
          ],
          "492": [
            "10 codes",
            "04920 Wirdum, 04921 Emden Stadt, 04922 Borkum"
          ],
          "493": [
            "8 codes",
            "04931 Norden, 04932 Norderney, 04933 Dornum Ostfriesl"
          ],
          "494": [
            "8 codes",
            "04941 Aurich, 04942 Südbrookmerland, 04943 Grossefehn"
          ],
          "495": [
            "10 codes",
            "04950 Holtland, 04951 Weener, 04952 Rhauderfehn"
          ],
          "496": [
            "8 codes",
            "04961 Papenburg, 04962 Papenburg-Aschendorf, 04963 Dörpen"
          ],
          "497": [
            "7 codes",
            "04971 Esens, 04972 Langeoog, 04973 Wittmund-Burhafe"
          ],
          "502": [
            "8 codes",
            "05021 Nienburg Weser, 05022 Wietzen, 05023 Liebenau Kr Nieburg Weser"
          ],
          "503": [
            "7 codes",
            "05031 Wunstorf, 05032 Neustadt am Rübenberge, 05033 Wunstorf-Grossenheidorn"
          ],
          "504": [
            "5 codes",
            "05041 Springe Deister, 05042 Bad Münder am Deister, 05043 Lauenau"
          ],
          "505": [
            "6 codes",
            "05051 Bergen Kr Celle, 05052 Hermannsburg, 05053 Faßberg-Müden"
          ],
          "506": [
            "9 codes",
            "05060 Bodenburg, 05062 Holle b Hildesheim, 05063 Bad Salzdetfurth"
          ],
          "507": [
            "4 codes",
            "05071 Schwarmstedt, 05072 Neustadt-Mandelsloh, 05073 Neustadt-Esperke"
          ],
          "508": [
            "5 codes",
            "05082 Langlingen, 05083 Hohne b Celle, 05084 Hambühren"
          ],
          "510": [
            "6 codes",
            "05101 Pattensen, 05102 Laatzen, 05103 Wennigsen Deister"
          ],
          "511": [
            "Hannover"
          ],
          "512": [
            "6 codes",
            "05121 Hildesheim, 05123 Schellerten, 05126 Algermissen"
          ],
          "513": [
            "8 codes",
            "05130 Wedemark, 05131 Garbsen, 05132 Lehrte"
          ],
          "514": [
            "9 codes",
            "05141 Celle, 05142 Eschede, 05143 Winsen Aller"
          ],
          "515": [
            "9 codes",
            "05151 Hameln, 05152 Hessisch Oldendorf, 05153 Salzhemmendorf"
          ],
          "516": [
            "8 codes",
            "05161 Walsrode, 05162 Fallingbostel, 05163 Fallingbostel-Dorfmark"
          ],
          "517": [
            "7 codes",
            "05171 Peine, 05172 Ilsede, 05173 Uetze"
          ],
          "518": [
            "7 codes",
            "05181 Alfeld Leine, 05182 Gronau Leine, 05183 Lamspringe"
          ],
          "519": [
            "10 codes",
            "05190 Soltau-Emmingen, 05191 Soltau, 05192 Munster"
          ],
          "520": [
            "9 codes",
            "05201 Halle Westf, 05202 Oerlinghausen, 05203 Werther Westf"
          ],
          "521": [
            "Bielefeld"
          ],
          "522": [
            "7 codes",
            "05221 Herford, 05222 Bad Salzuflen, 05223 Bünde"
          ],
          "523": [
            "8 codes",
            "05231 Detmold, 05232 Lage Lippe, 05233 Steinheim Westf"
          ],
          "524": [
            "7 codes",
            "05241 Gütersloh, 05242 Rheda-Wiedenbrück, 05244 Rietberg"
          ],
          "525": [
            "9 codes",
            "05250 Delbrück Westf, 05251 Paderborn, 05252 Bad Lippspringe"
          ],
          "526": [
            "6 codes",
            "05261 Lemgo, 05262 Extertal, 05263 Barntrup"
          ],
          "527": [
            "8 codes",
            "05271 Höxter, 05272 Brakel Westf, 05273 Beverungen"
          ],
          "528": [
            "6 codes",
            "05281 Bad Pyrmont, 05282 Schieder-Schwalenberg, 05283 Lügde-Rischenau"
          ],
          "529": [
            "4 codes",
            "05292 Lichtenau-Atteln, 05293 Paderborn-Dahl, 05294 Hövelhof-Espeln"
          ],
          "530": [
            "10 codes",
            "05300 Salzgitter-Üfingen, 05301 Lehre-Essenrode, 05302 Vechelde"
          ],
          "531": [
            "Braunschweig"
          ],
          "532": [
            "10 codes",
            "05320 Torfhaus, 05321 Goslar, 05322 Bad Harzburg"
          ],
          "533": [
            "8 codes",
            "05331 Wolfenbüttel, 05332 Schöppenstedt, 05333 Dettum"
          ],
          "534": [
            "5 codes",
            "05341 Salzgitter, 05344 Lengede, 05345 Baddeckenstedt"
          ],
          "535": [
            "8 codes",
            "05351 Helmstedt, 05352 Schöningen, 05353 Königslutter am Elm"
          ],
          "536": [
            "8 codes",
            "05361 Wolfsburg, 05362 Wolfsburg-Fallersleben, 05363 Wolfsburg-Vorsfelde"
          ],
          "537": [
            "9 codes",
            "05371 Gifhorn, 05372 Meinersen, 05373 Hillerse Kr Gifhorn"
          ],
          "538": [
            "4 codes",
            "05381 Seesen, 05382 Bad Gandersheim, 05383 Lutter am Barenberge"
          ],
          "540": [
            "8 codes",
            "05401 Georgsmarienhütte, 05402 Bissendorf Kr Osnabrück, 05403 Bad Iburg"
          ],
          "541": [
            "Osnabrück"
          ],
          "542": [
            "9 codes",
            "05421 Dissen am Teutoburger Wald, 05422 Melle, 05423 Versmold"
          ],
          "543": [
            "9 codes",
            "05431 Quakenbrück, 05432 Löningen, 05433 Badbergen"
          ],
          "544": [
            "8 codes",
            "05441 Diepholz, 05442 Barnstorf Kr Diepholz, 05443 Lemförde"
          ],
          "545": [
            "9 codes",
            "05451 Ibbenbüren, 05452 Mettingen Westf, 05453 Recke"
          ],
          "546": [
            "7 codes",
            "05461 Bramsche Hase, 05462 Ankum, 05464 Alfhausen"
          ],
          "547": [
            "6 codes",
            "05471 Bohmte, 05472 Bad Essen, 05473 Ostercappeln"
          ],
          "548": [
            "5 codes",
            "05481 Lengerich Westf, 05482 Tecklenburg, 05483 Lienen"
          ],
          "549": [
            "5 codes",
            "05491 Damme Dümmer, 05492 Steinfeld Oldenburg, 05493 Neuenkirchen Kr Vechta"
          ],
          "550": [
            "8 codes",
            "05502 Dransfeld, 05503 Nörten-Hardenberg, 05504 Friedland Kr Göttingen"
          ],
          "551": [
            "Göttingen"
          ],
          "552": [
            "9 codes",
            "05520 Braunlage, 05521 Herzberg am Harz, 05522 Osterode am Harz"
          ],
          "553": [
            "6 codes",
            "05531 Holzminden, 05532 Stadtoldendorf, 05533 Bodenwerder"
          ],
          "554": [
            "6 codes",
            "05541 Hann. Münden, 05542 Witzenhausen, 05543 Staufenberg Niedersachs"
          ],
          "555": [
            "6 codes",
            "05551 Northeim, 05552 Katlenburg, 05553 Kalefeld"
          ],
          "556": [
            "5 codes",
            "05561 Einbeck, 05562 Dassel-Markoldendorf, 05563 Kreiensen"
          ],
          "557": [
            "4 codes",
            "05571 Uslar, 05572 Bodenfelde, 05573 Uslar-Volpriehausen"
          ],
          "558": [
            "5 codes",
            "05582 Sankt Andreasberg, 05583 Braunlage-Hohegeiss, 05584 Hattorf am Harz"
          ],
          "559": [
            "3 codes",
            "05592 Gleichen-Bremke, 05593 Bovenden-Lenglern, 05594 Bovenden-Reyershausen"
          ],
          "560": [
            "9 codes",
            "05601 Schauenburg, 05602 Hessisch Lichtenau, 05603 Gudensberg"
          ],
          "561": [
            "Kassel"
          ],
          "562": [
            "6 codes",
            "05621 Bad Wildungen, 05622 Fritzlar, 05623 Edertal"
          ],
          "563": [
            "6 codes",
            "05631 Korbach, 05632 Willingen Upland, 05633 Diemelsee"
          ],
          "564": [
            "8 codes",
            "05641 Warburg, 05642 Warburg-Scherfede, 05643 Borgentreich"
          ],
          "565": [
            "10 codes",
            "05650 Cornberg, 05651 Eschwege, 05652 Bad Sooden-Allendorf"
          ],
          "566": [
            "5 codes",
            "05661 Melsungen, 05662 Felsberg Hess, 05663 Spangenberg"
          ],
          "567": [
            "7 codes",
            "05671 Hofgeismar, 05672 Bad Karlshafen, 05673 Immenhausen Hess"
          ],
          "568": [
            "6 codes",
            "05681 Homberg Efze, 05682 Borken Hessen, 05683 Wabern Hess"
          ],
          "569": [
            "6 codes",
            "05691 Bad Arolsen, 05692 Wolfhagen, 05693 Volkmarsen"
          ],
          "570": [
            "6 codes",
            "05702 Petershagen-Lahde, 05703 Hille, 05704 Petershagen-Friedewalde"
          ],
          "571": [
            "Minden Westf"
          ],
          "572": [
            "6 codes",
            "05721 Stadthagen, 05722 Bückeburg, 05723 Bad Nenndorf"
          ],
          "573": [
            "4 codes",
            "05731 Bad Oeynhausen, 05732 Löhne, 05733 Vlotho"
          ],
          "574": [
            "6 codes",
            "05741 Lübbecke, 05742 Preussisch Oldendorf, 05743 Espelkamp-Gestringen"
          ],
          "575": [
            "5 codes",
            "05751 Rinteln, 05752 Auetal-Hattendorf, 05753 Auetal-Bernsen"
          ],
          "576": [
            "8 codes",
            "05761 Stolzenau, 05763 Uchte, 05764 Steyerberg"
          ],
          "577": [
            "7 codes",
            "05771 Rahden Westf, 05772 Espelkamp, 05773 Stemwede-Wehdem"
          ],
          "580": [
            "7 codes",
            "05802 Wrestedt, 05803 Rosche, 05804 Rätzlingen Kr Uelzen"
          ],
          "581": [
            "Uelzen"
          ],
          "582": [
            "10 codes",
            "05820 Suhlendorf, 05821 Bad Bevensen, 05822 Ebstorf"
          ],
          "583": [
            "9 codes",
            "05831 Wittingen, 05832 Hankensbüttel, 05833 Brome"
          ],
          "584": [
            "9 codes",
            "05840 Schnackenburg, 05841 Lüchow Wendland, 05842 Schnega"
          ],
          "585": [
            "9 codes",
            "05850 Neetze, 05851 Dahlenburg, 05852 Bleckede"
          ],
          "586": [
            "5 codes",
            "05861 Dannenberg Elbe, 05862 Hitzacker Elbe, 05863 Zernien"
          ],
          "587": [
            "4 codes",
            "05872 Stoetze, 05873 Eimke, 05874 Soltendieck"
          ],
          "588": [
            "2 codes",
            "05882 Gorleben, 05883 Lemgow"
          ],
          "590": [
            "9 codes",
            "05901 Fürstenau b Bramsche, 05902 Freren, 05903 Emsbüren"
          ],
          "591": [
            "Lingen (Ems)"
          ],
          "592": [
            "6 codes",
            "05921 Nordhorn, 05922 Bad Bentheim, 05923 Schüttorf"
          ],
          "593": [
            "8 codes",
            "05931 Meppen, 05932 Haren Ems, 05933 Lathen"
          ],
          "594": [
            "8 codes",
            "05941 Neuenhaus Dinkel, 05942 Uelsen, 05943 Emlichheim"
          ],
          "595": [
            "7 codes",
            "05951 Werlte, 05952 Sögel, 05953 Börger"
          ],
          "596": [
            "6 codes",
            "05961 Haselünne, 05962 Herzlake, 05963 Bawinkel"
          ],
          "597": [
            "6 codes",
            "05971 Rheine, 05973 Neuenkirchen Kr Steinfurt, 05975 Rheine-Mesum"
          ],
          "600": [
            "5 codes",
            "06002 Ober-Mörlen, 06003 Rosbach v d Höhe, 06004 Lich-Eberstadt"
          ],
          "602": [
            "9 codes",
            "06020 Heigenbrücken, 06021 Aschaffenburg, 06022 Obernburg a Main"
          ],
          "603": [
            "7 codes",
            "06031 Friedberg Hess, 06032 Bad Nauheim, 06033 Butzbach"
          ],
          "604": [
            "9 codes",
            "06041 Glauburg, 06042 Büdingen Hess, 06043 Nidda"
          ],
          "605": [
            "10 codes",
            "06050 Biebergemünd, 06051 Gelnhausen, 06052 Bad Orb"
          ],
          "606": [
            "5 codes",
            "06061 Michelstadt, 06062 Erbach Odenw, 06063 Bad König"
          ],
          "607": [
            "4 codes",
            "06071 Dieburg, 06073 Babenhausen Hess, 06074 Rödermark"
          ],
          "608": [
            "7 codes",
            "06081 Usingen, 06082 Niederreifenberg, 06083 Weilrod"
          ],
          "609": [
            "5 codes",
            "06092 Heimbuchenthal, 06093 Laufach, 06094 Weibersbrunn"
          ],
          "610": [
            "9 codes",
            "06101 Bad Vilbel, 06102 Neu-Isenburg, 06103 Langen Hess"
          ],
          "611": [
            "Wiesbaden"
          ],
          "612": [
            "8 codes",
            "06120 Aarbergen, 06122 Hofheim-Wallau, 06123 Eltville am Rhein"
          ],
          "613": [
            "9 codes",
            "06130 Schwabenheim an der Selz, 06131 Mainz, 06132 Ingelheim am Rhein"
          ],
          "614": [
            "5 codes",
            "06142 Rüsselsheim, 06144 Bischofsheim b Rüsselsheim, 06145 Flörsheim am Main"
          ],
          "615": [
            "8 codes",
            "06150 Weiterstadt, 06151 Darmstadt, 06152 Gross-Gerau"
          ],
          "616": [
            "7 codes",
            "06161 Brensbach, 06162 Reinheim Odenw, 06163 Höchst i Odw"
          ],
          "617": [
            "5 codes",
            "06171 Oberursel Taunus, 06172 Bad Homburg v d Höhe, 06173 Kronberg im Taunus"
          ],
          "618": [
            "8 codes",
            "06181 Hanau, 06182 Seligenstadt, 06183 Erlensee"
          ],
          "619": [
            "5 codes",
            "06190 Hattersheim a Main, 06192 Hofheim am Taunus, 06195 Kelkheim Taunus"
          ],
          "620": [
            "8 codes",
            "06201 Weinheim Bergstr, 06202 Schwetzingen, 06203 Ladenburg"
          ],
          "621": [
            "Mannheim"
          ],
          "622": [
            "9 codes",
            "06220 Wilhelmsfeld, 06221 Heidelberg, 06222 Wiesloch"
          ],
          "623": [
            "9 codes",
            "06231 Hochdorf-Assenheim, 06232 Speyer, 06233 Frankenthal Pfalz"
          ],
          "624": [
            "8 codes",
            "06241 Worms, 06242 Osthofen, 06243 Monsheim"
          ],
          "625": [
            "8 codes",
            "06251 Bensheim, 06252 Heppenheim Bergstraße, 06253 Fürth Odenw"
          ],
          "626": [
            "9 codes",
            "06261 Mosbach Baden, 06262 Aglasterhausen, 06263 Neckargerach"
          ],
          "627": [
            "5 codes",
            "06271 Eberbach Baden, 06272 Hirschhorn Neckar, 06274 Waldbrunn Odenw"
          ],
          "628": [
            "7 codes",
            "06281 Buchen Odenwald, 06282 Walldürn, 06283 Hardheim Odenw"
          ],
          "629": [
            "8 codes",
            "06291 Adelsheim, 06292 Seckach, 06293 Schefflenz"
          ],
          "630": [
            "8 codes",
            "06301 Otterbach Pfalz, 06302 Winnweiler, 06303 Enkenbach-Alsenborn"
          ],
          "631": [
            "Kaiserslautern"
          ],
          "632": [
            "9 codes",
            "06321 Neustadt an der Weinstraße, 06322 Bad Dürkheim, 06323 Edenkoben"
          ],
          "633": [
            "9 codes",
            "06331 Pirmasens, 06332 Zweibrücken, 06333 Waldfischbach-Burgalben"
          ],
          "634": [
            "10 codes",
            "06340 Wörth-Schaidt, 06341 Landau in der Pfalz, 06342 Schweigen-Rechtenbach"
          ],
          "635": [
            "8 codes",
            "06351 Eisenberg Pfalz, 06352 Kirchheimbolanden, 06353 Freinsheim"
          ],
          "636": [
            "4 codes",
            "06361 Rockenhausen, 06362 Alsenz, 06363 Niederkirchen"
          ],
          "637": [
            "5 codes",
            "06371 Landstuhl, 06372 Bruchmühlbach-Miesau, 06373 Schönenberg-Kübelberg"
          ],
          "638": [
            "7 codes",
            "06381 Kusel, 06382 Lauterecken, 06383 Glan-Münchweiler"
          ],
          "639": [
            "8 codes",
            "06391 Dahn, 06392 Hauenstein Pfalz, 06393 Fischbach bei Dahn"
          ],
          "640": [
            "10 codes",
            "06400 Mücke, 06401 Grünberg Hess, 06402 Hungen"
          ],
          "641": [
            "Gießen"
          ],
          "642": [
            "10 codes",
            "06420 Lahntal, 06421 Marburg, 06422 Kirchhain"
          ],
          "643": [
            "9 codes",
            "06430 Hahnstätten, 06431 Limburg a d Lahn, 06432 Diez"
          ],
          "644": [
            "9 codes",
            "06440 Kölschhausen, 06441 Wetzlar, 06442 Braunfels"
          ],
          "645": [
            "8 codes",
            "06451 Frankenberg Eder, 06452 Battenberg Eder, 06453 Gemünden Wohra"
          ],
          "646": [
            "7 codes",
            "06461 Biedenkopf, 06462 Gladenbach, 06464 Angelburg"
          ],
          "647": [
            "9 codes",
            "06471 Weilburg, 06472 Weilmünster, 06473 Leun"
          ],
          "648": [
            "5 codes",
            "06482 Runkel, 06483 Selters Taunus, 06484 Beselich"
          ],
          "650": [
            "10 codes",
            "06500 Waldrach, 06501 Konz, 06502 Schweich"
          ],
          "651": [
            "Trier"
          ],
          "652": [
            "6 codes",
            "06522 Mettendorf, 06523 Holsthum, 06524 Rodershausen"
          ],
          "653": [
            "6 codes",
            "06531 Bernkastel-Kues, 06532 Zeltingen-Rachtig, 06533 Morbach Hunsrück"
          ],
          "654": [
            "5 codes",
            "06541 Traben-Trarbach, 06542 Bullay, 06543 Büchenbeuren"
          ],
          "655": [
            "10 codes",
            "06550 Irrhausen, 06551 Prüm, 06552 Olzheim"
          ],
          "656": [
            "9 codes",
            "06561 Bitburg, 06562 Speicher, 06563 Kyllburg"
          ],
          "657": [
            "6 codes",
            "06571 Wittlich, 06572 Manderscheid Eifel, 06573 Gillenfeld"
          ],
          "658": [
            "10 codes",
            "06580 Zemmer, 06581 Saarburg, 06582 Freudenburg"
          ],
          "659": [
            "8 codes",
            "06591 Gerolstein, 06592 Daun, 06593 Hillesheim Eifel"
          ],
          "661": [
            "Fulda"
          ],
          "662": [
            "10 codes",
            "06620 Philippsthal Werra, 06621 Bad Hersfeld, 06622 Bebra"
          ],
          "663": [
            "9 codes",
            "06630 Schwalmtal-Storndorf, 06631 Alsfeld, 06633 Homberg Ohm"
          ],
          "664": [
            "8 codes",
            "06641 Lauterbach Hessen, 06642 Schlitz, 06643 Herbstein"
          ],
          "665": [
            "10 codes",
            "06650 Hosenfeld, 06651 Rasdorf, 06652 Hünfeld"
          ],
          "666": [
            "9 codes",
            "06660 Steinau-Marjoss, 06661 Schlüchtern, 06663 Steinau an der Straße"
          ],
          "667": [
            "8 codes",
            "06670 Ludwigsau Hess, 06672 Eiterfeld, 06673 Haunetal"
          ],
          "668": [
            "4 codes",
            "06681 Hilders, 06682 Tann Rhön, 06683 Ehrenberg Rhön"
          ],
          "669": [
            "8 codes",
            "06691 Schwalmstadt, 06692 Neustadt Hessen, 06693 Neuental"
          ],
          "670": [
            "7 codes",
            "06701 Sprendlingen Rheinhess, 06703 Wöllstein Rheinhess, 06704 Langenlonsheim"
          ],
          "671": [
            "Bad Kreuznach"
          ],
          "672": [
            "8 codes",
            "06721 Bingen am Rhein, 06722 Rüdesheim am Rhein, 06723 Oestrich-Winkel"
          ],
          "673": [
            "7 codes",
            "06731 Alzey, 06732 Wörrstadt, 06733 Gau-Odernheim"
          ],
          "674": [
            "7 codes",
            "06741 St Goar, 06742 Boppard, 06743 Bacharach"
          ],
          "675": [
            "8 codes",
            "06751 Bad Sobernheim, 06752 Kirn Nahe, 06753 Meisenheim"
          ],
          "676": [
            "6 codes",
            "06761 Simmern Hunsrück, 06762 Kastellaun, 06763 Kirchberg Hunsrück"
          ],
          "677": [
            "6 codes",
            "06771 St Goarshausen, 06772 Nastätten, 06773 Kamp-Bornhofen"
          ],
          "678": [
            "9 codes",
            "06781 Idar-Oberstein, 06782 Birkenfeld Nahe, 06783 Baumholder"
          ],
          "680": [
            "6 codes",
            "06802 Völklingen-Lauterbach, 06803 Mandelbachtal-Ommersheim, 06804 Mandelbachtal"
          ],
          "681": [
            "Saarbrücken"
          ],
          "682": [
            "5 codes",
            "06821 Neunkirchen Saar, 06824 Ottweiler, 06825 Illingen Saar"
          ],
          "683": [
            "8 codes",
            "06831 Saarlouis, 06832 Beckingen-Reimsbach, 06833 Rehlingen-Siersburg"
          ],
          "684": [
            "6 codes",
            "06841 Homburg Saar, 06842 Blieskastel, 06843 Gersheim"
          ],
          "685": [
            "8 codes",
            "06851 St Wendel, 06852 Nohfelden, 06853 Marpingen"
          ],
          "686": [
            "7 codes",
            "06861 Merzig, 06864 Mettlach, 06865 Mettlach-Orscholz"
          ],
          "687": [
            "6 codes",
            "06871 Wadern, 06872 Losheim am See, 06873 Nonnweiler"
          ],
          "688": [
            "3 codes",
            "06881 Lebach, 06887 Schmelz Saar, 06888 Lebach-Steinbach"
          ],
          "689": [
            "4 codes",
            "06893 Saarbrücken-Ensheim, 06894 St Ingbert, 06897 Sulzbach Saar"
          ],
          "702": [
            "6 codes",
            "07021 Kirchheim unter Teck, 07022 Nürtingen, 07023 Weilheim an der Teck"
          ],
          "703": [
            "4 codes",
            "07031 Böblingen, 07032 Herrenberg, 07033 Weil Der Stadt"
          ],
          "704": [
            "6 codes",
            "07041 Mühlacker, 07042 Vaihingen an der Enz, 07043 Maulbronn"
          ],
          "705": [
            "6 codes",
            "07051 Calw, 07052 Bad Liebenzell, 07053 Bad Teinach-Zavelstein"
          ],
          "706": [
            "3 codes",
            "07062 Beilstein Württ, 07063 Bad Wimpfen, 07066 Bad Rappenau-Bonfeld"
          ],
          "707": [
            "3 codes",
            "07071 Tübingen, 07072 Gomaringen, 07073 Ammerbuch"
          ],
          "708": [
            "5 codes",
            "07081 Bad Wildbad, 07082 Neuenbürg Württ, 07083 Bad Herrenalb"
          ],
          "711": [
            "Stuttgart"
          ],
          "712": [
            "9 codes",
            "07121 Reutlingen, 07122 St Johann Württ, 07123 Metzingen Württ"
          ],
          "713": [
            "9 codes",
            "07130 Löwenstein Württ, 07131 Heilbronn Neckar, 07132 Neckarsulm"
          ],
          "714": [
            "8 codes",
            "07141 Ludwigsburg Württ, 07142 Bietigheim-Bissingen, 07143 Besigheim"
          ],
          "715": [
            "9 codes",
            "07150 Korntal-Münchingen, 07151 Waiblingen, 07152 Leonberg Württ"
          ],
          "716": [
            "6 codes",
            "07161 Göppingen, 07162 Süßen, 07163 Ebersbach an der Fils"
          ],
          "717": [
            "6 codes",
            "07171 Schwäbisch Gmünd, 07172 Lorch Württ, 07173 Heubach"
          ],
          "718": [
            "4 codes",
            "07181 Schorndorf Württ, 07182 Welzheim, 07183 Rudersberg Württ"
          ],
          "719": [
            "5 codes",
            "07191 Backnang, 07192 Murrhardt, 07193 Sulzbach an der Murr"
          ],
          "720": [
            "3 codes",
            "07202 Karlsbad, 07203 Walzbachtal, 07204 Malsch-Völkersbach"
          ],
          "721": [
            "Karlsruhe"
          ],
          "722": [
            "10 codes",
            "07220 Forbach-Hundsbach, 07221 Baden-Baden, 07222 Rastatt"
          ],
          "723": [
            "7 codes",
            "07231 Pforzheim, 07232 Königsbach-Stein, 07233 Niefern-Öschelbronn"
          ],
          "724": [
            "9 codes",
            "07240 Pfinztal, 07242 Rheinstetten, 07243 Ettlingen"
          ],
          "725": [
            "10 codes",
            "07250 Kraichtal, 07251 Bruchsal, 07252 Bretten"
          ],
          "726": [
            "10 codes",
            "07260 Sinsheim-Hilsbach, 07261 Sinsheim, 07262 Eppingen"
          ],
          "727": [
            "7 codes",
            "07271 Wörth am Rhein, 07272 Rülzheim, 07273 Hagenbach Pfalz"
          ],
          "730": [
            "9 codes",
            "07300 Roggenburg, 07302 Pfaffenhofen a d Roth, 07303 Illertissen"
          ],
          "731": [
            "Ulm Donau"
          ],
          "732": [
            "9 codes",
            "07321 Heidenheim a d Brenz, 07322 Giengen a d Brenz, 07323 Gerstetten"
          ],
          "733": [
            "7 codes",
            "07331 Geislingen an der Steige, 07332 Lauterstein, 07333 Laichingen"
          ],
          "734": [
            "7 codes",
            "07340 Neenstetten, 07343 Buch b Illertissen, 07344 Blaubeuren"
          ],
          "735": [
            "8 codes",
            "07351 Biberach an der Riß, 07352 Ochsenhausen, 07353 Schwendi"
          ],
          "736": [
            "7 codes",
            "07361 Aalen, 07362 Bopfingen, 07363 Lauchheim"
          ],
          "737": [
            "5 codes",
            "07371 Riedlingen Württ, 07373 Zwiefalten, 07374 Uttenweiler"
          ],
          "738": [
            "9 codes",
            "07381 Münsingen, 07382 Römerstein, 07383 Münsingen-Buttenhausen"
          ],
          "739": [
            "5 codes",
            "07391 Ehingen Donau, 07392 Laupheim, 07393 Munderkingen"
          ],
          "740": [
            "3 codes",
            "07402 Fluorn-Winzeln, 07403 Dunningen, 07404 Epfendorf"
          ],
          "741": [
            "Rottweil"
          ],
          "742": [
            "9 codes",
            "07420 Deisslingen, 07422 Schramberg, 07423 Oberndorf am Neckar"
          ],
          "743": [
            "6 codes",
            "07431 Albstadt-Ebingen, 07432 Albstadt-Tailfingen, 07433 Balingen"
          ],
          "744": [
            "10 codes",
            "07440 Bad Rippoldsau, 07441 Freudenstadt, 07442 Baiersbronn"
          ],
          "745": [
            "9 codes",
            "07451 Horb am Neckar, 07452 Nagold, 07453 Altensteig Württ"
          ],
          "746": [
            "7 codes",
            "07461 Tuttlingen, 07462 Immendingen, 07463 Mühlheim an der Donau"
          ],
          "747": [
            "8 codes",
            "07471 Hechingen, 07472 Rottenburg am Neckar, 07473 Mössingen"
          ],
          "748": [
            "5 codes",
            "07482 Horb-Dettingen, 07483 Horb-Mühringen, 07484 Simmersfeld"
          ],
          "750": [
            "5 codes",
            "07502 Wolpertswende, 07503 Wilhelmsdorf Württ, 07504 Horgenzell"
          ],
          "751": [
            "Ravensburg"
          ],
          "752": [
            "7 codes",
            "07520 Bodnegg, 07522 Wangen im Allgäu, 07524 Bad Waldsee"
          ],
          "753": [
            "4 codes",
            "07531 Konstanz, 07532 Meersburg, 07533 Allensbach"
          ],
          "754": [
            "6 codes",
            "07541 Friedrichshafen, 07542 Tettnang, 07543 Kressbronn am Bodensee"
          ],
          "755": [
            "8 codes",
            "07551 Überlingen Bodensee, 07552 Pfullendorf, 07553 Salem Baden"
          ],
          "756": [
            "9 codes",
            "07561 Leutkirch im Allgäu, 07562 Isny im Allgäu, 07563 Kisslegg"
          ],
          "757": [
            "10 codes",
            "07570 Sigmaringen-Gutenstein, 07571 Sigmaringen, 07572 Mengen Württ"
          ],
          "758": [
            "7 codes",
            "07581 Saulgau, 07582 Bad Buchau, 07583 Bad Schussenried"
          ],
          "760": [
            "1 code",
            "07602 Oberried Breisgau"
          ],
          "761": [
            "Freiburg im Breisgau"
          ],
          "762": [
            "10 codes",
            "07620 Schopfheim-Gersbach, 07621 Lörrach, 07622 Schopfheim"
          ],
          "763": [
            "6 codes",
            "07631 Müllheim Baden, 07632 Badenweiler, 07633 Staufen im Breisgau"
          ],
          "764": [
            "6 codes",
            "07641 Emmendingen, 07642 Endingen Kaiserstuhl, 07643 Herbolzheim Breisgau"
          ],
          "765": [
            "7 codes",
            "07651 Titisee-Neustadt, 07652 Hinterzarten, 07653 Lenzkirch"
          ],
          "766": [
            "10 codes",
            "07660 St Peter Schwarzw, 07661 Kirchzarten, 07662 Vogtsburg im Kaiserstuhl"
          ],
          "767": [
            "6 codes",
            "07671 Todtnau, 07672 St Blasien, 07673 Schönau im Schwarzwald"
          ],
          "768": [
            "5 codes",
            "07681 Waldkirch Breisgau, 07682 Elzach, 07683 Simonswald"
          ],
          "770": [
            "8 codes",
            "07702 Blumberg Baden, 07703 Bonndorf im Schwarzwald, 07704 Geisingen Baden"
          ],
          "771": [
            "Donaueschingen"
          ],
          "772": [
            "10 codes",
            "07720 Schwenningen a Neckar, 07721 Villingen i Schwarzw, 07722 Triberg im Schwarzwald"
          ],
          "773": [
            "8 codes",
            "07731 Singen Hohentwiel, 07732 Radolfzell am Bodensee, 07733 Engen Hegau"
          ],
          "774": [
            "8 codes",
            "07741 Tiengen Hochrhein, 07742 Klettgau, 07743 Ühlingen-Birkendorf"
          ],
          "775": [
            "4 codes",
            "07751 Waldshut, 07753 Albbruck, 07754 Görwihl"
          ],
          "776": [
            "5 codes",
            "07761 Bad Säckingen, 07762 Wehr Baden, 07763 Murg"
          ],
          "777": [
            "5 codes",
            "07771 Stockach, 07773 Bodman-Ludwigshafen, 07774 Eigeltingen"
          ],
          "780": [
            "7 codes",
            "07802 Oberkirch Baden, 07803 Gengenbach, 07804 Oppenau"
          ],
          "781": [
            "Offenburg"
          ],
          "782": [
            "6 codes",
            "07821 Lahr Schwarzwald, 07822 Ettenheim, 07823 Seelbach Schutter"
          ],
          "783": [
            "9 codes",
            "07831 Hausach, 07832 Haslach im Kinzigtal, 07833 Hornberg Schwarzwaldbahn"
          ],
          "784": [
            "4 codes",
            "07841 Achern, 07842 Kappelrodeck, 07843 Renchen"
          ],
          "785": [
            "4 codes",
            "07851 Kehl, 07852 Willstätt, 07853 Kehl-Bodersweier"
          ],
          "790": [
            "5 codes",
            "07903 Mainhardt, 07904 Ilshofen, 07905 Langenburg"
          ],
          "791": [
            "Schwäbisch Hall"
          ],
          "793": [
            "10 codes",
            "07930 Boxberg Baden, 07931 Bad Mergentheim, 07932 Niederstetten Württ"
          ],
          "794": [
            "10 codes",
            "07940 Künzelsau, 07941 Öhringen, 07942 Neuenstein Württ"
          ],
          "795": [
            "9 codes",
            "07950 Schnelldorf, 07951 Crailsheim, 07952 Gerabronn"
          ],
          "796": [
            "7 codes",
            "07961 Ellwangen Jagst, 07962 Fichtenau, 07963 Adelmannsfelden"
          ],
          "797": [
            "7 codes",
            "07971 Gaildorf, 07972 Gschwend b Gaildorf, 07973 Obersontheim"
          ],
          "802": [
            "10 codes",
            "08020 Weyarn, 08021 Waakirchen, 08022 Tegernsee"
          ],
          "803": [
            "8 codes",
            "08031 Rosenheim Oberbay, 08032 Rohrdorf Kr Rosenheim, 08033 Oberaudorf"
          ],
          "804": [
            "5 codes",
            "08041 Bad Tölz, 08042 Lenggries, 08043 Jachenau"
          ],
          "805": [
            "7 codes",
            "08051 Prien a Chiemsee, 08052 Aschau i Chiemgau, 08053 Bad Endorf"
          ],
          "806": [
            "7 codes",
            "08061 Bad Aibling, 08062 Bruckmühl Mangfall, 08063 Feldkirchen-Westerham"
          ],
          "807": [
            "6 codes",
            "08071 Wasserburg a Inn, 08072 Haag i OB, 08073 Gars a Inn"
          ],
          "808": [
            "6 codes",
            "08081 Dorfen Stadt, 08082 Schwindegg, 08083 Isen"
          ],
          "809": [
            "5 codes",
            "08091 Kirchseeon, 08092 Grafing b München, 08093 Glonn Kr Ebersberg"
          ],
          "810": [
            "4 codes",
            "08102 Höhenkirchen-Siegertsbrunn, 08104 Sauerlach, 08105 Gilching"
          ],
          "811": [
            "Hallbergmoos"
          ],
          "812": [
            "4 codes",
            "08121 Markt Schwaben, 08122 Erding, 08123 Moosinning"
          ],
          "813": [
            "8 codes",
            "08131 Dachau, 08133 Haimhausen Oberbay, 08134 Odelzhausen"
          ],
          "814": [
            "6 codes",
            "08141 Fürstenfeldbruck, 08142 Olching, 08143 Inning a Ammersee"
          ],
          "815": [
            "5 codes",
            "08151 Starnberg, 08152 Herrsching a Ammersee, 08153 Wessling"
          ],
          "816": [
            "5 codes",
            "08161 Freising, 08165 Neufahrn b Freising, 08166 Allershausen Oberbay"
          ],
          "817": [
            "6 codes",
            "08170 Straßlach-Dingharting, 08171 Wolfratshausen, 08176 Egling b Wolfratshausen"
          ],
          "819": [
            "6 codes",
            "08191 Landsberg a Lech, 08192 Schondorf a Ammersee, 08193 Geltendorf"
          ],
          "820": [
            "7 codes",
            "08202 Althegnenberg, 08203 Grossaitingen, 08204 Mickhausen"
          ],
          "821": [
            "Augsburg"
          ],
          "822": [
            "6 codes",
            "08221 Günzburg, 08222 Burgau Schwab, 08223 Ichenhausen"
          ],
          "823": [
            "9 codes",
            "08230 Gablingen, 08231 Königsbrunn b Augsburg, 08232 Schwabmünchen"
          ],
          "824": [
            "7 codes",
            "08241 Buchloe, 08243 Fuchstal, 08245 Türkheim Wertach"
          ],
          "825": [
            "8 codes",
            "08250 Hilgertshausen-Tandern, 08251 Aichach, 08252 Schrobenhausen"
          ],
          "826": [
            "8 codes",
            "08261 Mindelheim, 08262 Mittelneufnach, 08263 Breitenbrunn Schwab"
          ],
          "827": [
            "5 codes",
            "08271 Meitingen, 08272 Wertingen, 08273 Nordendorf"
          ],
          "828": [
            "5 codes",
            "08281 Thannhausen Schwab, 08282 Krumbach Schwaben, 08283 Neuburg a d Kammel"
          ],
          "829": [
            "6 codes",
            "08291 Zusmarshausen, 08292 Dinkelscherben, 08293 Welden b Augsburg"
          ],
          "830": [
            "4 codes",
            "08302 Görisried, 08303 Waltenhofen, 08304 Wildpoldsried"
          ],
          "831": [
            "Kempten Allgäu"
          ],
          "832": [
            "9 codes",
            "08320 Missen-Wilhams, 08321 Sonthofen, 08322 Oberstdorf"
          ],
          "833": [
            "9 codes",
            "08330 Legau, 08331 Memmingen, 08332 Ottobeuren"
          ],
          "834": [
            "10 codes",
            "08340 Baisweil, 08341 Kaufbeuren, 08342 Marktoberdorf"
          ],
          "836": [
            "9 codes",
            "08361 Nesselwang, 08362 Füssen, 08363 Pfronten"
          ],
          "837": [
            "9 codes",
            "08370 Wiggensbach, 08372 Obergünzburg, 08373 Altusried"
          ],
          "838": [
            "10 codes",
            "08380 Achberg, 08381 Lindenberg i Allgäu, 08382 Lindau Bodensee"
          ],
          "839": [
            "4 codes",
            "08392 Markt Rettenbach, 08393 Holzgünz, 08394 Lautrach"
          ],
          "840": [
            "6 codes",
            "08402 Münchsmünster, 08403 Pförring, 08404 Oberdolling"
          ],
          "841": [
            "Ingolstadt Donau"
          ],
          "842": [
            "6 codes",
            "08421 Eichstätt Bay, 08422 Dollnstein, 08423 Titting"
          ],
          "843": [
            "5 codes",
            "08431 Neuburg a d Donau, 08432 Burgheim, 08433 Königsmoos"
          ],
          "844": [
            "6 codes",
            "08441 Pfaffenhofen a d Ilm, 08442 Wolnzach, 08443 Hohenwart Paar"
          ],
          "845": [
            "8 codes",
            "08450 Ingolstadt-Zuchering, 08452 Geisenfeld, 08453 Reichertshofen Oberbay"
          ],
          "846": [
            "10 codes",
            "08460 Berching-Holnstein, 08461 Beilngries, 08462 Berching"
          ],
          "850": [
            "8 codes",
            "08501 Thyrnau, 08502 Fürstenzell, 08503 Neuhaus a Inn"
          ],
          "851": [
            "Passau"
          ],
          "853": [
            "8 codes",
            "08531 Pocking, 08532 Griesbach i Rottal, 08533 Rotthalmünster"
          ],
          "854": [
            "9 codes",
            "08541 Vilshofen Niederbay, 08542 Ortenburg, 08543 Aidenbach"
          ],
          "855": [
            "9 codes",
            "08550 Philippsreut, 08551 Freyung, 08552 Grafenau Niederbay"
          ],
          "856": [
            "5 codes",
            "08561 Pfarrkirchen Niederbay, 08562 Triftern, 08563 Bad Birnbach Rottal"
          ],
          "857": [
            "4 codes",
            "08571 Simbach a Inn, 08572 Tann Niederbay, 08573 Ering"
          ],
          "858": [
            "6 codes",
            "08581 Waldkirchen Niederbay, 08582 Röhrnbach, 08583 Neureichenau"
          ],
          "859": [
            "3 codes",
            "08591 Obernzell, 08592 Wegscheid Niederbay, 08593 Untergriesbach"
          ],
          "861": [
            "Traunstein"
          ],
          "862": [
            "6 codes",
            "08621 Trostberg, 08622 Tacherting- Peterskirchen, 08623 Kirchweidach"
          ],
          "863": [
            "9 codes",
            "08630 Oberneukirchen, 08631 Mühldorf a Inn, 08633 Tüßling"
          ],
          "864": [
            "4 codes",
            "08640 Reit Im Winkl, 08641 Grassau Kr Traunstein, 08642 Übersee"
          ],
          "865": [
            "6 codes",
            "08650 Marktschellenberg, 08651 Bad Reichenhall, 08652 Berchtesgaden"
          ],
          "866": [
            "8 codes",
            "08661 Grabenstätt Chiemsee, 08662 Siegsdorf Kr Traunstein, 08663 Ruhpolding"
          ],
          "867": [
            "5 codes",
            "08670 Reischach Kr Altötting, 08671 Altötting, 08677 Burghausen Salzach"
          ],
          "868": [
            "7 codes",
            "08681 Waging a See, 08682 Laufen Salzach, 08683 Tittmoning"
          ],
          "870": [
            "8 codes",
            "08702 Wörth a d Isar, 08703 Essenbach, 08704 Altdorf-Pfettrach"
          ],
          "871": [
            "Landshut"
          ],
          "872": [
            "8 codes",
            "08721 Eggenfelden, 08722 Gangkofen, 08723 Arnstorf"
          ],
          "873": [
            "5 codes",
            "08731 Dingolfing, 08732 Frontenhausen, 08733 Mengkofen"
          ],
          "874": [
            "5 codes",
            "08741 Vilsbiburg, 08742 Velden Vils, 08743 Geisenhausen"
          ],
          "875": [
            "5 codes",
            "08751 Mainburg, 08752 Au i d Hallertau, 08753 Elsendorf Niederbay"
          ],
          "876": [
            "5 codes",
            "08761 Moosburg a d Isar, 08762 Wartenberg Oberbay, 08764 Mauern Kr Freising"
          ],
          "877": [
            "4 codes",
            "08771 Ergoldsbach, 08772 Mallersdorf-Pfaffenberg, 08773 Neufahrn i NB"
          ],
          "878": [
            "5 codes",
            "08781 Rottenburg a d Laaber, 08782 Pfeffenhausen, 08783 Rohr i NB"
          ],
          "880": [
            "8 codes",
            "08801 Seeshaupt, 08802 Huglfing, 08803 Peissenberg"
          ],
          "881": [
            "Weilheim i OB"
          ],
          "882": [
            "5 codes",
            "08821 Garmisch-Partenkirchen, 08822 Oberammergau, 08823 Mittenwald"
          ],
          "884": [
            "4 codes",
            "08841 Murnau a Staffelsee, 08845 Bad Kohlgrub, 08846 Uffing a Staffelsee"
          ],
          "885": [
            "4 codes",
            "08851 Kochel a See, 08856 Penzberg, 08857 Benediktbeuern"
          ],
          "886": [
            "6 codes",
            "08860 Bernbeuren, 08861 Schongau, 08862 Steingaden Oberbay"
          ],
          "906": [
            "Donauwörth"
          ],
          "907": [
            "9 codes",
            "09070 Tapfheim, 09071 Dillingen a d Donau, 09072 Lauingen Donau"
          ],
          "908": [
            "10 codes",
            "09080 Harburg Schwaben, 09081 Nördlingen, 09082 Oettingen i Bay"
          ],
          "909": [
            "7 codes",
            "09090 Rain Lech, 09091 Monheim Schwab, 09092 Wemding"
          ],
          "910": [
            "7 codes",
            "09101 Langenzenn, 09102 Wilhermsdorf, 09103 Cadolzburg"
          ],
          "911": [
            "Nürnberg"
          ],
          "912": [
            "7 codes",
            "09120 Leinburg, 09122 Schwabach, 09123 Lauf a d Pegnitz"
          ],
          "913": [
            "5 codes",
            "09131 Erlangen, 09132 Herzogenaurach, 09133 Baiersdorf Mittelfr"
          ],
          "914": [
            "9 codes",
            "09141 Weißenburg i Bay, 09142 Treuchtlingen, 09143 Pappenheim Mittelfr"
          ],
          "915": [
            "8 codes",
            "09151 Hersbruck, 09152 Hartenstein Mittelfr, 09153 Schnaittach"
          ],
          "916": [
            "7 codes",
            "09161 Neustadt a d Aisch, 09162 Scheinfeld, 09163 Dachsbach"
          ],
          "917": [
            "10 codes",
            "09170 Schwanstetten, 09171 Roth Mittelfr, 09172 Georgensgmünd"
          ],
          "918": [
            "10 codes",
            "09180 Pyrbaum, 09181 Neumarkt i d Opf, 09182 Velburg"
          ],
          "919": [
            "10 codes",
            "09190 Heroldsbach, 09191 Forchheim Oberfr, 09192 Gräfenberg"
          ],
          "920": [
            "9 codes",
            "09201 Gesees, 09202 Waischenfeld, 09203 Neudrossenfeld"
          ],
          "921": [
            "Bayreuth"
          ],
          "922": [
            "8 codes",
            "09220 Kasendorf-Azendorf, 09221 Kulmbach, 09222 Presseck"
          ],
          "923": [
            "7 codes",
            "09231 Marktredwitz, 09232 Wunsiedel, 09233 Arzberg Oberfr"
          ],
          "924": [
            "6 codes",
            "09241 Pegnitz, 09242 Gößweinstein, 09243 Pottenstein"
          ],
          "925": [
            "7 codes",
            "09251 Münchberg, 09252 Helmbrechts, 09253 Weissenstadt"
          ],
          "926": [
            "10 codes",
            "09260 Wilhelmsthal Oberfr, 09261 Kronach, 09262 Wallenfels"
          ],
          "927": [
            "10 codes",
            "09270 Creussen, 09271 Thurnau-Alladorf, 09272 Fichtelberg"
          ],
          "928": [
            "10 codes",
            "09280 Selbitz Oberfr, 09281 Hof Saale, 09282 Naila"
          ],
          "929": [
            "4 codes",
            "09292 Konradsreuth, 09293 Berg Oberfr, 09294 Regnitzlosau"
          ],
          "930": [
            "5 codes",
            "09302 Rottendorf Unterfr, 09303 Eibelstadt, 09305 Estenfeld"
          ],
          "931": [
            "Würzburg"
          ],
          "932": [
            "5 codes",
            "09321 Kitzingen, 09323 Iphofen, 09324 Dettelbach"
          ],
          "933": [
            "9 codes",
            "09331 Ochsenfurt, 09332 Marktbreit, 09333 Sommerhausen"
          ],
          "934": [
            "10 codes",
            "09340 Königheim-Brehmen, 09341 Tauberbischofsheim, 09342 Wertheim"
          ],
          "935": [
            "10 codes",
            "09350 Eussenheim-Hundsbach, 09351 Gemünden a Main, 09352 Lohr a Main"
          ],
          "936": [
            "7 codes",
            "09360 Thüngen, 09363 Arnstein Unterfr, 09364 Zellingen"
          ],
          "937": [
            "8 codes",
            "09371 Miltenberg, 09372 Klingenberg a Main, 09373 Amorbach"
          ],
          "938": [
            "6 codes",
            "09381 Volkach, 09382 Gerolzhofen, 09383 Wiesentheid"
          ],
          "939": [
            "8 codes",
            "09391 Marktheidenfeld, 09392 Faulbach Unterfr, 09393 Rothenfels Unterfr"
          ],
          "940": [
            "9 codes",
            "09401 Neutraubling, 09402 Regenstauf, 09403 Donaustauf"
          ],
          "941": [
            "Regensburg"
          ],
          "942": [
            "9 codes",
            "09420 Feldkirchen Niederbay, 09421 Straubing, 09422 Bogen Niederbay"
          ],
          "943": [
            "7 codes",
            "09431 Schwandorf, 09433 Nabburg, 09434 Bodenwöhr"
          ],
          "944": [
            "8 codes",
            "09441 Kelheim, 09442 Riedenburg, 09443 Abensberg"
          ],
          "945": [
            "4 codes",
            "09451 Schierling, 09452 Langquaid, 09453 Thalmassing"
          ],
          "946": [
            "9 codes",
            "09461 Roding, 09462 Falkenstein Oberpf, 09463 Wald Oberpf"
          ],
          "947": [
            "4 codes",
            "09471 Burglengenfeld, 09472 Hohenfels Oberpf, 09473 Kallmünz"
          ],
          "948": [
            "4 codes",
            "09480 Sünching, 09481 Pfatter, 09482 Wörth a d Donau"
          ],
          "949": [
            "7 codes",
            "09491 Hemau, 09492 Parsberg, 09493 Beratzhausen"
          ],
          "950": [
            "4 codes",
            "09502 Frensdorf, 09503 Oberhaid Oberfr, 09504 Stadelhofen"
          ],
          "951": [
            "Bamberg"
          ],
          "952": [
            "9 codes",
            "09521 Hassfurt, 09522 Eltmann, 09523 Hofheim i Ufr"
          ],
          "953": [
            "6 codes",
            "09531 Ebern, 09532 Maroldsweisach, 09533 Untermerzbach"
          ],
          "954": [
            "8 codes",
            "09542 Schesslitz, 09543 Hirschaid, 09544 Baunach"
          ],
          "955": [
            "6 codes",
            "09551 Burgwindheim, 09552 Burghaslach, 09553 Ebrach Oberfr"
          ],
          "956": [
            "10 codes",
            "09560 Grub a Forst, 09561 Coburg, 09562 Sonnefeld"
          ],
          "957": [
            "6 codes",
            "09571 Lichtenfels Bay, 09572 Burgkunstadt, 09573 Staffelstein Oberfr"
          ],
          "960": [
            "7 codes",
            "09602 Neustadt a d Waldnaab, 09603 Floss, 09604 Wernberg-Köblitz"
          ],
          "961": [
            "Weiden i d Opf"
          ],
          "962": [
            "7 codes",
            "09621 Amberg Oberpf, 09622 Hirschau Oberpf, 09624 Ensdorf Oberpf"
          ],
          "963": [
            "9 codes",
            "09631 Tirschenreuth, 09632 Waldsassen, 09633 Mitterteich"
          ],
          "964": [
            "8 codes",
            "09641 Grafenwöhr, 09642 Kemnath Stadt, 09643 Auerbach i d Opf"
          ],
          "965": [
            "9 codes",
            "09651 Vohenstrauss, 09652 Waidhaus, 09653 Eslarn"
          ],
          "966": [
            "6 codes",
            "09661 Sulzbach-Rosenberg, 09662 Vilseck, 09663 Neukirchen b Sulzbach-Rosenberg"
          ],
          "967": [
            "7 codes",
            "09671 Oberviechtach, 09672 Neunburg vorm Wald, 09673 Tiefenbach Oberpf"
          ],
          "968": [
            "3 codes",
            "09681 Windischeschenbach, 09682 Erbendorf, 09683 Friedenfels"
          ],
          "970": [
            "3 codes",
            "09701 Sandberg Unterfr, 09704 Euerdorf, 09708 Bad Bocklet"
          ],
          "971": [
            "Bad Kissingen"
          ],
          "972": [
            "10 codes",
            "09720 Üchtelhausen, 09721 Schweinfurt, 09722 Werneck"
          ],
          "973": [
            "7 codes",
            "09732 Hammelburg, 09733 Münnerstadt, 09734 Burkardroth"
          ],
          "974": [
            "8 codes",
            "09741 Bad Brückenau, 09742 Kalbach Rhön, 09744 Zeitlofs-Detter"
          ],
          "976": [
            "6 codes",
            "09761 Bad Königshofen i Grabfeld, 09762 Saal a d Saale, 09763 Sulzdorf a d Lederhecke"
          ],
          "977": [
            "9 codes",
            "09771 Bad Neustadt a d Saale, 09772 Bischofsheim a d Rhön, 09773 Unsleben"
          ],
          "980": [
            "4 codes",
            "09802 Ansbach-Katterbach, 09803 Colmberg, 09804 Aurach"
          ],
          "981": [
            "Ansbach"
          ],
          "982": [
            "9 codes",
            "09820 Lehrberg, 09822 Bechhofen a d Heide, 09823 Leutershausen"
          ],
          "983": [
            "7 codes",
            "09831 Gunzenhausen, 09832 Wassertrüdingen, 09833 Heidenheim Mittelfr"
          ],
          "984": [
            "8 codes",
            "09841 Bad Windsheim, 09842 Uffenheim, 09843 Burgbernheim"
          ],
          "985": [
            "7 codes",
            "09851 Dinkelsbühl, 09852 Feuchtwangen, 09853 Wilburgstetten"
          ],
          "986": [
            "5 codes",
            "09861 Rothenburg ob der Tauber, 09865 Adelshofen Mittelfr, 09867 Geslau"
          ],
          "987": [
            "6 codes",
            "09871 Windsbach, 09872 Heilsbronn, 09873 Abenberg-Wassermungenau"
          ],
          "990": [
            "7 codes",
            "09901 Hengersberg Bay, 09903 Schöllnach, 09904 Lalling"
          ],
          "991": [
            "Deggendorf"
          ],
          "992": [
            "10 codes",
            "09920 Bischofsmais, 09921 Regen, 09922 Zwiesel"
          ],
          "993": [
            "7 codes",
            "09931 Plattling, 09932 Osterhofen, 09933 Wallersdorf"
          ],
          "994": [
            "8 codes",
            "09941 Kötzting, 09942 Viechtach, 09943 Lam Oberpf"
          ],
          "995": [
            "6 codes",
            "09951 Landau a d Isar, 09952 Eichendorf, 09953 Pilsting"
          ],
          "996": [
            "6 codes",
            "09961 Mitterfels, 09962 Schwarzach Niederbay, 09963 Konzell"
          ],
          "997": [
            "8 codes",
            "09971 Cham, 09972 Waldmünchen, 09973 Furth i Wald"
          ]
        }
      },
      "dial": {
        "x": {
          "30": [
            [
              "0",
              "cold"
            ],
            [
              "30",
              "hot"
            ],
            [
              "xx",
              "cold"
            ]
          ],
          "40": [
            [
              "0",
              "cold"
            ],
            [
              "40",
              "hot"
            ],
            [
              "xx",
              "cold"
            ]
          ],
          "69": [
            [
              "0",
              "cold"
            ],
            [
              "69",
              "hot"
            ],
            [
              "xx",
              "cold"
            ]
          ],
          "89": [
            [
              "0",
              "cold"
            ],
            [
              "89",
              "hot"
            ],
            [
              "xx",
              "cold"
            ]
          ],
          "201": [
            [
              "0",
              "cold"
            ],
            [
              "201",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "202": [
            [
              "0",
              "cold"
            ],
            [
              "202",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "203": [
            [
              "0",
              "cold"
            ],
            [
              "203",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "204": [
            [
              "0",
              "cold"
            ],
            [
              "204",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "205": [
            [
              "0",
              "cold"
            ],
            [
              "205",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "206": [
            [
              "0",
              "cold"
            ],
            [
              "206",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "208": [
            [
              "0",
              "cold"
            ],
            [
              "208",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "209": [
            [
              "0",
              "cold"
            ],
            [
              "209",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "210": [
            [
              "0",
              "cold"
            ],
            [
              "210",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "211": [
            [
              "0",
              "cold"
            ],
            [
              "211",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "212": [
            [
              "0",
              "cold"
            ],
            [
              "212",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "213": [
            [
              "0",
              "cold"
            ],
            [
              "213",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "214": [
            [
              "0",
              "cold"
            ],
            [
              "214",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "215": [
            [
              "0",
              "cold"
            ],
            [
              "215",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "216": [
            [
              "0",
              "cold"
            ],
            [
              "216",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "217": [
            [
              "0",
              "cold"
            ],
            [
              "217",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "218": [
            [
              "0",
              "cold"
            ],
            [
              "218",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "219": [
            [
              "0",
              "cold"
            ],
            [
              "219",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "220": [
            [
              "0",
              "cold"
            ],
            [
              "220",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "221": [
            [
              "0",
              "cold"
            ],
            [
              "221",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "222": [
            [
              "0",
              "cold"
            ],
            [
              "222",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "223": [
            [
              "0",
              "cold"
            ],
            [
              "223",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "224": [
            [
              "0",
              "cold"
            ],
            [
              "224",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "225": [
            [
              "0",
              "cold"
            ],
            [
              "225",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "226": [
            [
              "0",
              "cold"
            ],
            [
              "226",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "227": [
            [
              "0",
              "cold"
            ],
            [
              "227",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "228": [
            [
              "0",
              "cold"
            ],
            [
              "228",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "229": [
            [
              "0",
              "cold"
            ],
            [
              "229",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "230": [
            [
              "0",
              "cold"
            ],
            [
              "230",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "231": [
            [
              "0",
              "cold"
            ],
            [
              "231",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "232": [
            [
              "0",
              "cold"
            ],
            [
              "232",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "233": [
            [
              "0",
              "cold"
            ],
            [
              "233",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "234": [
            [
              "0",
              "cold"
            ],
            [
              "234",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "235": [
            [
              "0",
              "cold"
            ],
            [
              "235",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "236": [
            [
              "0",
              "cold"
            ],
            [
              "236",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "237": [
            [
              "0",
              "cold"
            ],
            [
              "237",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "238": [
            [
              "0",
              "cold"
            ],
            [
              "238",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "239": [
            [
              "0",
              "cold"
            ],
            [
              "239",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "240": [
            [
              "0",
              "cold"
            ],
            [
              "240",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "241": [
            [
              "0",
              "cold"
            ],
            [
              "241",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "242": [
            [
              "0",
              "cold"
            ],
            [
              "242",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "243": [
            [
              "0",
              "cold"
            ],
            [
              "243",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "244": [
            [
              "0",
              "cold"
            ],
            [
              "244",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "245": [
            [
              "0",
              "cold"
            ],
            [
              "245",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "246": [
            [
              "0",
              "cold"
            ],
            [
              "246",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "247": [
            [
              "0",
              "cold"
            ],
            [
              "247",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "248": [
            [
              "0",
              "cold"
            ],
            [
              "248",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "250": [
            [
              "0",
              "cold"
            ],
            [
              "250",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "251": [
            [
              "0",
              "cold"
            ],
            [
              "251",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "252": [
            [
              "0",
              "cold"
            ],
            [
              "252",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "253": [
            [
              "0",
              "cold"
            ],
            [
              "253",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "254": [
            [
              "0",
              "cold"
            ],
            [
              "254",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "255": [
            [
              "0",
              "cold"
            ],
            [
              "255",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "256": [
            [
              "0",
              "cold"
            ],
            [
              "256",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "257": [
            [
              "0",
              "cold"
            ],
            [
              "257",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "258": [
            [
              "0",
              "cold"
            ],
            [
              "258",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "259": [
            [
              "0",
              "cold"
            ],
            [
              "259",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "260": [
            [
              "0",
              "cold"
            ],
            [
              "260",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "261": [
            [
              "0",
              "cold"
            ],
            [
              "261",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "262": [
            [
              "0",
              "cold"
            ],
            [
              "262",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "263": [
            [
              "0",
              "cold"
            ],
            [
              "263",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "264": [
            [
              "0",
              "cold"
            ],
            [
              "264",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "265": [
            [
              "0",
              "cold"
            ],
            [
              "265",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "266": [
            [
              "0",
              "cold"
            ],
            [
              "266",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "267": [
            [
              "0",
              "cold"
            ],
            [
              "267",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "268": [
            [
              "0",
              "cold"
            ],
            [
              "268",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "269": [
            [
              "0",
              "cold"
            ],
            [
              "269",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "271": [
            [
              "0",
              "cold"
            ],
            [
              "271",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "272": [
            [
              "0",
              "cold"
            ],
            [
              "272",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "273": [
            [
              "0",
              "cold"
            ],
            [
              "273",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "274": [
            [
              "0",
              "cold"
            ],
            [
              "274",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "275": [
            [
              "0",
              "cold"
            ],
            [
              "275",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "276": [
            [
              "0",
              "cold"
            ],
            [
              "276",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "277": [
            [
              "0",
              "cold"
            ],
            [
              "277",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "280": [
            [
              "0",
              "cold"
            ],
            [
              "280",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "281": [
            [
              "0",
              "cold"
            ],
            [
              "281",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "282": [
            [
              "0",
              "cold"
            ],
            [
              "282",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "283": [
            [
              "0",
              "cold"
            ],
            [
              "283",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "284": [
            [
              "0",
              "cold"
            ],
            [
              "284",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "285": [
            [
              "0",
              "cold"
            ],
            [
              "285",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "286": [
            [
              "0",
              "cold"
            ],
            [
              "286",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "287": [
            [
              "0",
              "cold"
            ],
            [
              "287",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "290": [
            [
              "0",
              "cold"
            ],
            [
              "290",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "291": [
            [
              "0",
              "cold"
            ],
            [
              "291",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "292": [
            [
              "0",
              "cold"
            ],
            [
              "292",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "293": [
            [
              "0",
              "cold"
            ],
            [
              "293",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "294": [
            [
              "0",
              "cold"
            ],
            [
              "294",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "295": [
            [
              "0",
              "cold"
            ],
            [
              "295",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "296": [
            [
              "0",
              "cold"
            ],
            [
              "296",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "297": [
            [
              "0",
              "cold"
            ],
            [
              "297",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "298": [
            [
              "0",
              "cold"
            ],
            [
              "298",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "299": [
            [
              "0",
              "cold"
            ],
            [
              "299",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "330": [
            [
              "0",
              "cold"
            ],
            [
              "330",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "331": [
            [
              "0",
              "cold"
            ],
            [
              "331",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "332": [
            [
              "0",
              "cold"
            ],
            [
              "332",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "333": [
            [
              "0",
              "cold"
            ],
            [
              "333",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "334": [
            [
              "0",
              "cold"
            ],
            [
              "334",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "335": [
            [
              "0",
              "cold"
            ],
            [
              "335",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "336": [
            [
              "0",
              "cold"
            ],
            [
              "336",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "337": [
            [
              "0",
              "cold"
            ],
            [
              "337",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "338": [
            [
              "0",
              "cold"
            ],
            [
              "338",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "339": [
            [
              "0",
              "cold"
            ],
            [
              "339",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "340": [
            [
              "0",
              "cold"
            ],
            [
              "340",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "341": [
            [
              "0",
              "cold"
            ],
            [
              "341",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "342": [
            [
              "0",
              "cold"
            ],
            [
              "342",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "343": [
            [
              "0",
              "cold"
            ],
            [
              "343",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "344": [
            [
              "0",
              "cold"
            ],
            [
              "344",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "345": [
            [
              "0",
              "cold"
            ],
            [
              "345",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "346": [
            [
              "0",
              "cold"
            ],
            [
              "346",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "347": [
            [
              "0",
              "cold"
            ],
            [
              "347",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "349": [
            [
              "0",
              "cold"
            ],
            [
              "349",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "350": [
            [
              "0",
              "cold"
            ],
            [
              "350",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "351": [
            [
              "0",
              "cold"
            ],
            [
              "351",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "352": [
            [
              "0",
              "cold"
            ],
            [
              "352",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "353": [
            [
              "0",
              "cold"
            ],
            [
              "353",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "354": [
            [
              "0",
              "cold"
            ],
            [
              "354",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "355": [
            [
              "0",
              "cold"
            ],
            [
              "355",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "356": [
            [
              "0",
              "cold"
            ],
            [
              "356",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "357": [
            [
              "0",
              "cold"
            ],
            [
              "357",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "358": [
            [
              "0",
              "cold"
            ],
            [
              "358",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "359": [
            [
              "0",
              "cold"
            ],
            [
              "359",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "360": [
            [
              "0",
              "cold"
            ],
            [
              "360",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "361": [
            [
              "0",
              "cold"
            ],
            [
              "361",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "362": [
            [
              "0",
              "cold"
            ],
            [
              "362",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "363": [
            [
              "0",
              "cold"
            ],
            [
              "363",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "364": [
            [
              "0",
              "cold"
            ],
            [
              "364",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "365": [
            [
              "0",
              "cold"
            ],
            [
              "365",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "366": [
            [
              "0",
              "cold"
            ],
            [
              "366",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "367": [
            [
              "0",
              "cold"
            ],
            [
              "367",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "368": [
            [
              "0",
              "cold"
            ],
            [
              "368",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "369": [
            [
              "0",
              "cold"
            ],
            [
              "369",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "371": [
            [
              "0",
              "cold"
            ],
            [
              "371",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "372": [
            [
              "0",
              "cold"
            ],
            [
              "372",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "373": [
            [
              "0",
              "cold"
            ],
            [
              "373",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "374": [
            [
              "0",
              "cold"
            ],
            [
              "374",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "375": [
            [
              "0",
              "cold"
            ],
            [
              "375",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "376": [
            [
              "0",
              "cold"
            ],
            [
              "376",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "377": [
            [
              "0",
              "cold"
            ],
            [
              "377",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "381": [
            [
              "0",
              "cold"
            ],
            [
              "381",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "382": [
            [
              "0",
              "cold"
            ],
            [
              "382",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "383": [
            [
              "0",
              "cold"
            ],
            [
              "383",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "384": [
            [
              "0",
              "cold"
            ],
            [
              "384",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "385": [
            [
              "0",
              "cold"
            ],
            [
              "385",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "386": [
            [
              "0",
              "cold"
            ],
            [
              "386",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "387": [
            [
              "0",
              "cold"
            ],
            [
              "387",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "388": [
            [
              "0",
              "cold"
            ],
            [
              "388",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "390": [
            [
              "0",
              "cold"
            ],
            [
              "390",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "391": [
            [
              "0",
              "cold"
            ],
            [
              "391",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "392": [
            [
              "0",
              "cold"
            ],
            [
              "392",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "393": [
            [
              "0",
              "cold"
            ],
            [
              "393",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "394": [
            [
              "0",
              "cold"
            ],
            [
              "394",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "395": [
            [
              "0",
              "cold"
            ],
            [
              "395",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "396": [
            [
              "0",
              "cold"
            ],
            [
              "396",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "397": [
            [
              "0",
              "cold"
            ],
            [
              "397",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "398": [
            [
              "0",
              "cold"
            ],
            [
              "398",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "399": [
            [
              "0",
              "cold"
            ],
            [
              "399",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "410": [
            [
              "0",
              "cold"
            ],
            [
              "410",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "412": [
            [
              "0",
              "cold"
            ],
            [
              "412",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "413": [
            [
              "0",
              "cold"
            ],
            [
              "413",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "414": [
            [
              "0",
              "cold"
            ],
            [
              "414",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "415": [
            [
              "0",
              "cold"
            ],
            [
              "415",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "416": [
            [
              "0",
              "cold"
            ],
            [
              "416",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "417": [
            [
              "0",
              "cold"
            ],
            [
              "417",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "418": [
            [
              "0",
              "cold"
            ],
            [
              "418",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "419": [
            [
              "0",
              "cold"
            ],
            [
              "419",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "420": [
            [
              "0",
              "cold"
            ],
            [
              "420",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "421": [
            [
              "0",
              "cold"
            ],
            [
              "421",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "422": [
            [
              "0",
              "cold"
            ],
            [
              "422",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "423": [
            [
              "0",
              "cold"
            ],
            [
              "423",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "424": [
            [
              "0",
              "cold"
            ],
            [
              "424",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "425": [
            [
              "0",
              "cold"
            ],
            [
              "425",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "426": [
            [
              "0",
              "cold"
            ],
            [
              "426",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "427": [
            [
              "0",
              "cold"
            ],
            [
              "427",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "428": [
            [
              "0",
              "cold"
            ],
            [
              "428",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "429": [
            [
              "0",
              "cold"
            ],
            [
              "429",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "430": [
            [
              "0",
              "cold"
            ],
            [
              "430",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "431": [
            [
              "0",
              "cold"
            ],
            [
              "431",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "432": [
            [
              "0",
              "cold"
            ],
            [
              "432",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "433": [
            [
              "0",
              "cold"
            ],
            [
              "433",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "434": [
            [
              "0",
              "cold"
            ],
            [
              "434",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "435": [
            [
              "0",
              "cold"
            ],
            [
              "435",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "436": [
            [
              "0",
              "cold"
            ],
            [
              "436",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "437": [
            [
              "0",
              "cold"
            ],
            [
              "437",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "438": [
            [
              "0",
              "cold"
            ],
            [
              "438",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "439": [
            [
              "0",
              "cold"
            ],
            [
              "439",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "440": [
            [
              "0",
              "cold"
            ],
            [
              "440",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "441": [
            [
              "0",
              "cold"
            ],
            [
              "441",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "442": [
            [
              "0",
              "cold"
            ],
            [
              "442",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "443": [
            [
              "0",
              "cold"
            ],
            [
              "443",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "444": [
            [
              "0",
              "cold"
            ],
            [
              "444",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "445": [
            [
              "0",
              "cold"
            ],
            [
              "445",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "446": [
            [
              "0",
              "cold"
            ],
            [
              "446",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "447": [
            [
              "0",
              "cold"
            ],
            [
              "447",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "448": [
            [
              "0",
              "cold"
            ],
            [
              "448",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "449": [
            [
              "0",
              "cold"
            ],
            [
              "449",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "450": [
            [
              "0",
              "cold"
            ],
            [
              "450",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "451": [
            [
              "0",
              "cold"
            ],
            [
              "451",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "452": [
            [
              "0",
              "cold"
            ],
            [
              "452",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "453": [
            [
              "0",
              "cold"
            ],
            [
              "453",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "454": [
            [
              "0",
              "cold"
            ],
            [
              "454",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "455": [
            [
              "0",
              "cold"
            ],
            [
              "455",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "456": [
            [
              "0",
              "cold"
            ],
            [
              "456",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "460": [
            [
              "0",
              "cold"
            ],
            [
              "460",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "461": [
            [
              "0",
              "cold"
            ],
            [
              "461",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "462": [
            [
              "0",
              "cold"
            ],
            [
              "462",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "463": [
            [
              "0",
              "cold"
            ],
            [
              "463",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "464": [
            [
              "0",
              "cold"
            ],
            [
              "464",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "465": [
            [
              "0",
              "cold"
            ],
            [
              "465",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "466": [
            [
              "0",
              "cold"
            ],
            [
              "466",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "467": [
            [
              "0",
              "cold"
            ],
            [
              "467",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "468": [
            [
              "0",
              "cold"
            ],
            [
              "468",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "470": [
            [
              "0",
              "cold"
            ],
            [
              "470",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "471": [
            [
              "0",
              "cold"
            ],
            [
              "471",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "472": [
            [
              "0",
              "cold"
            ],
            [
              "472",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "473": [
            [
              "0",
              "cold"
            ],
            [
              "473",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "474": [
            [
              "0",
              "cold"
            ],
            [
              "474",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "475": [
            [
              "0",
              "cold"
            ],
            [
              "475",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "476": [
            [
              "0",
              "cold"
            ],
            [
              "476",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "477": [
            [
              "0",
              "cold"
            ],
            [
              "477",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "479": [
            [
              "0",
              "cold"
            ],
            [
              "479",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "480": [
            [
              "0",
              "cold"
            ],
            [
              "480",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "481": [
            [
              "0",
              "cold"
            ],
            [
              "481",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "482": [
            [
              "0",
              "cold"
            ],
            [
              "482",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "483": [
            [
              "0",
              "cold"
            ],
            [
              "483",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "484": [
            [
              "0",
              "cold"
            ],
            [
              "484",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "485": [
            [
              "0",
              "cold"
            ],
            [
              "485",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "486": [
            [
              "0",
              "cold"
            ],
            [
              "486",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "487": [
            [
              "0",
              "cold"
            ],
            [
              "487",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "488": [
            [
              "0",
              "cold"
            ],
            [
              "488",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "489": [
            [
              "0",
              "cold"
            ],
            [
              "489",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "490": [
            [
              "0",
              "cold"
            ],
            [
              "490",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "491": [
            [
              "0",
              "cold"
            ],
            [
              "491",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "492": [
            [
              "0",
              "cold"
            ],
            [
              "492",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "493": [
            [
              "0",
              "cold"
            ],
            [
              "493",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "494": [
            [
              "0",
              "cold"
            ],
            [
              "494",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "495": [
            [
              "0",
              "cold"
            ],
            [
              "495",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "496": [
            [
              "0",
              "cold"
            ],
            [
              "496",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "497": [
            [
              "0",
              "cold"
            ],
            [
              "497",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "502": [
            [
              "0",
              "cold"
            ],
            [
              "502",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "503": [
            [
              "0",
              "cold"
            ],
            [
              "503",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "504": [
            [
              "0",
              "cold"
            ],
            [
              "504",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "505": [
            [
              "0",
              "cold"
            ],
            [
              "505",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "506": [
            [
              "0",
              "cold"
            ],
            [
              "506",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "507": [
            [
              "0",
              "cold"
            ],
            [
              "507",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "508": [
            [
              "0",
              "cold"
            ],
            [
              "508",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "510": [
            [
              "0",
              "cold"
            ],
            [
              "510",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "511": [
            [
              "0",
              "cold"
            ],
            [
              "511",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "512": [
            [
              "0",
              "cold"
            ],
            [
              "512",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "513": [
            [
              "0",
              "cold"
            ],
            [
              "513",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "514": [
            [
              "0",
              "cold"
            ],
            [
              "514",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "515": [
            [
              "0",
              "cold"
            ],
            [
              "515",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "516": [
            [
              "0",
              "cold"
            ],
            [
              "516",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "517": [
            [
              "0",
              "cold"
            ],
            [
              "517",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "518": [
            [
              "0",
              "cold"
            ],
            [
              "518",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "519": [
            [
              "0",
              "cold"
            ],
            [
              "519",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "520": [
            [
              "0",
              "cold"
            ],
            [
              "520",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "521": [
            [
              "0",
              "cold"
            ],
            [
              "521",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "522": [
            [
              "0",
              "cold"
            ],
            [
              "522",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "523": [
            [
              "0",
              "cold"
            ],
            [
              "523",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "524": [
            [
              "0",
              "cold"
            ],
            [
              "524",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "525": [
            [
              "0",
              "cold"
            ],
            [
              "525",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "526": [
            [
              "0",
              "cold"
            ],
            [
              "526",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "527": [
            [
              "0",
              "cold"
            ],
            [
              "527",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "528": [
            [
              "0",
              "cold"
            ],
            [
              "528",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "529": [
            [
              "0",
              "cold"
            ],
            [
              "529",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "530": [
            [
              "0",
              "cold"
            ],
            [
              "530",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "531": [
            [
              "0",
              "cold"
            ],
            [
              "531",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "532": [
            [
              "0",
              "cold"
            ],
            [
              "532",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "533": [
            [
              "0",
              "cold"
            ],
            [
              "533",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "534": [
            [
              "0",
              "cold"
            ],
            [
              "534",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "535": [
            [
              "0",
              "cold"
            ],
            [
              "535",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "536": [
            [
              "0",
              "cold"
            ],
            [
              "536",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "537": [
            [
              "0",
              "cold"
            ],
            [
              "537",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "538": [
            [
              "0",
              "cold"
            ],
            [
              "538",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "540": [
            [
              "0",
              "cold"
            ],
            [
              "540",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "541": [
            [
              "0",
              "cold"
            ],
            [
              "541",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "542": [
            [
              "0",
              "cold"
            ],
            [
              "542",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "543": [
            [
              "0",
              "cold"
            ],
            [
              "543",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "544": [
            [
              "0",
              "cold"
            ],
            [
              "544",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "545": [
            [
              "0",
              "cold"
            ],
            [
              "545",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "546": [
            [
              "0",
              "cold"
            ],
            [
              "546",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "547": [
            [
              "0",
              "cold"
            ],
            [
              "547",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "548": [
            [
              "0",
              "cold"
            ],
            [
              "548",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "549": [
            [
              "0",
              "cold"
            ],
            [
              "549",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "550": [
            [
              "0",
              "cold"
            ],
            [
              "550",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "551": [
            [
              "0",
              "cold"
            ],
            [
              "551",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "552": [
            [
              "0",
              "cold"
            ],
            [
              "552",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "553": [
            [
              "0",
              "cold"
            ],
            [
              "553",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "554": [
            [
              "0",
              "cold"
            ],
            [
              "554",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "555": [
            [
              "0",
              "cold"
            ],
            [
              "555",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "556": [
            [
              "0",
              "cold"
            ],
            [
              "556",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "557": [
            [
              "0",
              "cold"
            ],
            [
              "557",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "558": [
            [
              "0",
              "cold"
            ],
            [
              "558",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "559": [
            [
              "0",
              "cold"
            ],
            [
              "559",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "560": [
            [
              "0",
              "cold"
            ],
            [
              "560",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "561": [
            [
              "0",
              "cold"
            ],
            [
              "561",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "562": [
            [
              "0",
              "cold"
            ],
            [
              "562",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "563": [
            [
              "0",
              "cold"
            ],
            [
              "563",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "564": [
            [
              "0",
              "cold"
            ],
            [
              "564",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "565": [
            [
              "0",
              "cold"
            ],
            [
              "565",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "566": [
            [
              "0",
              "cold"
            ],
            [
              "566",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "567": [
            [
              "0",
              "cold"
            ],
            [
              "567",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "568": [
            [
              "0",
              "cold"
            ],
            [
              "568",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "569": [
            [
              "0",
              "cold"
            ],
            [
              "569",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "570": [
            [
              "0",
              "cold"
            ],
            [
              "570",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "571": [
            [
              "0",
              "cold"
            ],
            [
              "571",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "572": [
            [
              "0",
              "cold"
            ],
            [
              "572",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "573": [
            [
              "0",
              "cold"
            ],
            [
              "573",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "574": [
            [
              "0",
              "cold"
            ],
            [
              "574",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "575": [
            [
              "0",
              "cold"
            ],
            [
              "575",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "576": [
            [
              "0",
              "cold"
            ],
            [
              "576",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "577": [
            [
              "0",
              "cold"
            ],
            [
              "577",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "580": [
            [
              "0",
              "cold"
            ],
            [
              "580",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "581": [
            [
              "0",
              "cold"
            ],
            [
              "581",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "582": [
            [
              "0",
              "cold"
            ],
            [
              "582",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "583": [
            [
              "0",
              "cold"
            ],
            [
              "583",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "584": [
            [
              "0",
              "cold"
            ],
            [
              "584",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "585": [
            [
              "0",
              "cold"
            ],
            [
              "585",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "586": [
            [
              "0",
              "cold"
            ],
            [
              "586",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "587": [
            [
              "0",
              "cold"
            ],
            [
              "587",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "588": [
            [
              "0",
              "cold"
            ],
            [
              "588",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "590": [
            [
              "0",
              "cold"
            ],
            [
              "590",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "591": [
            [
              "0",
              "cold"
            ],
            [
              "591",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "592": [
            [
              "0",
              "cold"
            ],
            [
              "592",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "593": [
            [
              "0",
              "cold"
            ],
            [
              "593",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "594": [
            [
              "0",
              "cold"
            ],
            [
              "594",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "595": [
            [
              "0",
              "cold"
            ],
            [
              "595",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "596": [
            [
              "0",
              "cold"
            ],
            [
              "596",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "597": [
            [
              "0",
              "cold"
            ],
            [
              "597",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "600": [
            [
              "0",
              "cold"
            ],
            [
              "600",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "602": [
            [
              "0",
              "cold"
            ],
            [
              "602",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "603": [
            [
              "0",
              "cold"
            ],
            [
              "603",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "604": [
            [
              "0",
              "cold"
            ],
            [
              "604",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "605": [
            [
              "0",
              "cold"
            ],
            [
              "605",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "606": [
            [
              "0",
              "cold"
            ],
            [
              "606",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "607": [
            [
              "0",
              "cold"
            ],
            [
              "607",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "608": [
            [
              "0",
              "cold"
            ],
            [
              "608",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "609": [
            [
              "0",
              "cold"
            ],
            [
              "609",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "610": [
            [
              "0",
              "cold"
            ],
            [
              "610",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "611": [
            [
              "0",
              "cold"
            ],
            [
              "611",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "612": [
            [
              "0",
              "cold"
            ],
            [
              "612",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "613": [
            [
              "0",
              "cold"
            ],
            [
              "613",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "614": [
            [
              "0",
              "cold"
            ],
            [
              "614",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "615": [
            [
              "0",
              "cold"
            ],
            [
              "615",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "616": [
            [
              "0",
              "cold"
            ],
            [
              "616",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "617": [
            [
              "0",
              "cold"
            ],
            [
              "617",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "618": [
            [
              "0",
              "cold"
            ],
            [
              "618",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "619": [
            [
              "0",
              "cold"
            ],
            [
              "619",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "620": [
            [
              "0",
              "cold"
            ],
            [
              "620",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "621": [
            [
              "0",
              "cold"
            ],
            [
              "621",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "622": [
            [
              "0",
              "cold"
            ],
            [
              "622",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "623": [
            [
              "0",
              "cold"
            ],
            [
              "623",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "624": [
            [
              "0",
              "cold"
            ],
            [
              "624",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "625": [
            [
              "0",
              "cold"
            ],
            [
              "625",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "626": [
            [
              "0",
              "cold"
            ],
            [
              "626",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "627": [
            [
              "0",
              "cold"
            ],
            [
              "627",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "628": [
            [
              "0",
              "cold"
            ],
            [
              "628",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "629": [
            [
              "0",
              "cold"
            ],
            [
              "629",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "630": [
            [
              "0",
              "cold"
            ],
            [
              "630",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "631": [
            [
              "0",
              "cold"
            ],
            [
              "631",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "632": [
            [
              "0",
              "cold"
            ],
            [
              "632",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "633": [
            [
              "0",
              "cold"
            ],
            [
              "633",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "634": [
            [
              "0",
              "cold"
            ],
            [
              "634",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "635": [
            [
              "0",
              "cold"
            ],
            [
              "635",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "636": [
            [
              "0",
              "cold"
            ],
            [
              "636",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "637": [
            [
              "0",
              "cold"
            ],
            [
              "637",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "638": [
            [
              "0",
              "cold"
            ],
            [
              "638",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "639": [
            [
              "0",
              "cold"
            ],
            [
              "639",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "640": [
            [
              "0",
              "cold"
            ],
            [
              "640",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "641": [
            [
              "0",
              "cold"
            ],
            [
              "641",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "642": [
            [
              "0",
              "cold"
            ],
            [
              "642",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "643": [
            [
              "0",
              "cold"
            ],
            [
              "643",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "644": [
            [
              "0",
              "cold"
            ],
            [
              "644",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "645": [
            [
              "0",
              "cold"
            ],
            [
              "645",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "646": [
            [
              "0",
              "cold"
            ],
            [
              "646",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "647": [
            [
              "0",
              "cold"
            ],
            [
              "647",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "648": [
            [
              "0",
              "cold"
            ],
            [
              "648",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "650": [
            [
              "0",
              "cold"
            ],
            [
              "650",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "651": [
            [
              "0",
              "cold"
            ],
            [
              "651",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "652": [
            [
              "0",
              "cold"
            ],
            [
              "652",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "653": [
            [
              "0",
              "cold"
            ],
            [
              "653",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "654": [
            [
              "0",
              "cold"
            ],
            [
              "654",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "655": [
            [
              "0",
              "cold"
            ],
            [
              "655",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "656": [
            [
              "0",
              "cold"
            ],
            [
              "656",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "657": [
            [
              "0",
              "cold"
            ],
            [
              "657",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "658": [
            [
              "0",
              "cold"
            ],
            [
              "658",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "659": [
            [
              "0",
              "cold"
            ],
            [
              "659",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "661": [
            [
              "0",
              "cold"
            ],
            [
              "661",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "662": [
            [
              "0",
              "cold"
            ],
            [
              "662",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "663": [
            [
              "0",
              "cold"
            ],
            [
              "663",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "664": [
            [
              "0",
              "cold"
            ],
            [
              "664",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "665": [
            [
              "0",
              "cold"
            ],
            [
              "665",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "666": [
            [
              "0",
              "cold"
            ],
            [
              "666",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "667": [
            [
              "0",
              "cold"
            ],
            [
              "667",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "668": [
            [
              "0",
              "cold"
            ],
            [
              "668",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "669": [
            [
              "0",
              "cold"
            ],
            [
              "669",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "670": [
            [
              "0",
              "cold"
            ],
            [
              "670",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "671": [
            [
              "0",
              "cold"
            ],
            [
              "671",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "672": [
            [
              "0",
              "cold"
            ],
            [
              "672",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "673": [
            [
              "0",
              "cold"
            ],
            [
              "673",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "674": [
            [
              "0",
              "cold"
            ],
            [
              "674",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "675": [
            [
              "0",
              "cold"
            ],
            [
              "675",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "676": [
            [
              "0",
              "cold"
            ],
            [
              "676",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "677": [
            [
              "0",
              "cold"
            ],
            [
              "677",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "678": [
            [
              "0",
              "cold"
            ],
            [
              "678",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "680": [
            [
              "0",
              "cold"
            ],
            [
              "680",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "681": [
            [
              "0",
              "cold"
            ],
            [
              "681",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "682": [
            [
              "0",
              "cold"
            ],
            [
              "682",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "683": [
            [
              "0",
              "cold"
            ],
            [
              "683",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "684": [
            [
              "0",
              "cold"
            ],
            [
              "684",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "685": [
            [
              "0",
              "cold"
            ],
            [
              "685",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "686": [
            [
              "0",
              "cold"
            ],
            [
              "686",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "687": [
            [
              "0",
              "cold"
            ],
            [
              "687",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "688": [
            [
              "0",
              "cold"
            ],
            [
              "688",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "689": [
            [
              "0",
              "cold"
            ],
            [
              "689",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "702": [
            [
              "0",
              "cold"
            ],
            [
              "702",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "703": [
            [
              "0",
              "cold"
            ],
            [
              "703",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "704": [
            [
              "0",
              "cold"
            ],
            [
              "704",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "705": [
            [
              "0",
              "cold"
            ],
            [
              "705",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "706": [
            [
              "0",
              "cold"
            ],
            [
              "706",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "707": [
            [
              "0",
              "cold"
            ],
            [
              "707",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "708": [
            [
              "0",
              "cold"
            ],
            [
              "708",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "711": [
            [
              "0",
              "cold"
            ],
            [
              "711",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "712": [
            [
              "0",
              "cold"
            ],
            [
              "712",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "713": [
            [
              "0",
              "cold"
            ],
            [
              "713",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "714": [
            [
              "0",
              "cold"
            ],
            [
              "714",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "715": [
            [
              "0",
              "cold"
            ],
            [
              "715",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "716": [
            [
              "0",
              "cold"
            ],
            [
              "716",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "717": [
            [
              "0",
              "cold"
            ],
            [
              "717",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "718": [
            [
              "0",
              "cold"
            ],
            [
              "718",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "719": [
            [
              "0",
              "cold"
            ],
            [
              "719",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "720": [
            [
              "0",
              "cold"
            ],
            [
              "720",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "721": [
            [
              "0",
              "cold"
            ],
            [
              "721",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "722": [
            [
              "0",
              "cold"
            ],
            [
              "722",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "723": [
            [
              "0",
              "cold"
            ],
            [
              "723",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "724": [
            [
              "0",
              "cold"
            ],
            [
              "724",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "725": [
            [
              "0",
              "cold"
            ],
            [
              "725",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "726": [
            [
              "0",
              "cold"
            ],
            [
              "726",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "727": [
            [
              "0",
              "cold"
            ],
            [
              "727",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "730": [
            [
              "0",
              "cold"
            ],
            [
              "730",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "731": [
            [
              "0",
              "cold"
            ],
            [
              "731",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "732": [
            [
              "0",
              "cold"
            ],
            [
              "732",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "733": [
            [
              "0",
              "cold"
            ],
            [
              "733",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "734": [
            [
              "0",
              "cold"
            ],
            [
              "734",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "735": [
            [
              "0",
              "cold"
            ],
            [
              "735",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "736": [
            [
              "0",
              "cold"
            ],
            [
              "736",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "737": [
            [
              "0",
              "cold"
            ],
            [
              "737",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "738": [
            [
              "0",
              "cold"
            ],
            [
              "738",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "739": [
            [
              "0",
              "cold"
            ],
            [
              "739",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "740": [
            [
              "0",
              "cold"
            ],
            [
              "740",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "741": [
            [
              "0",
              "cold"
            ],
            [
              "741",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "742": [
            [
              "0",
              "cold"
            ],
            [
              "742",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "743": [
            [
              "0",
              "cold"
            ],
            [
              "743",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "744": [
            [
              "0",
              "cold"
            ],
            [
              "744",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "745": [
            [
              "0",
              "cold"
            ],
            [
              "745",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "746": [
            [
              "0",
              "cold"
            ],
            [
              "746",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "747": [
            [
              "0",
              "cold"
            ],
            [
              "747",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "748": [
            [
              "0",
              "cold"
            ],
            [
              "748",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "750": [
            [
              "0",
              "cold"
            ],
            [
              "750",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "751": [
            [
              "0",
              "cold"
            ],
            [
              "751",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "752": [
            [
              "0",
              "cold"
            ],
            [
              "752",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "753": [
            [
              "0",
              "cold"
            ],
            [
              "753",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "754": [
            [
              "0",
              "cold"
            ],
            [
              "754",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "755": [
            [
              "0",
              "cold"
            ],
            [
              "755",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "756": [
            [
              "0",
              "cold"
            ],
            [
              "756",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "757": [
            [
              "0",
              "cold"
            ],
            [
              "757",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "758": [
            [
              "0",
              "cold"
            ],
            [
              "758",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "760": [
            [
              "0",
              "cold"
            ],
            [
              "760",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "761": [
            [
              "0",
              "cold"
            ],
            [
              "761",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "762": [
            [
              "0",
              "cold"
            ],
            [
              "762",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "763": [
            [
              "0",
              "cold"
            ],
            [
              "763",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "764": [
            [
              "0",
              "cold"
            ],
            [
              "764",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "765": [
            [
              "0",
              "cold"
            ],
            [
              "765",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "766": [
            [
              "0",
              "cold"
            ],
            [
              "766",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "767": [
            [
              "0",
              "cold"
            ],
            [
              "767",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "768": [
            [
              "0",
              "cold"
            ],
            [
              "768",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "770": [
            [
              "0",
              "cold"
            ],
            [
              "770",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "771": [
            [
              "0",
              "cold"
            ],
            [
              "771",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "772": [
            [
              "0",
              "cold"
            ],
            [
              "772",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "773": [
            [
              "0",
              "cold"
            ],
            [
              "773",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "774": [
            [
              "0",
              "cold"
            ],
            [
              "774",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "775": [
            [
              "0",
              "cold"
            ],
            [
              "775",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "776": [
            [
              "0",
              "cold"
            ],
            [
              "776",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "777": [
            [
              "0",
              "cold"
            ],
            [
              "777",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "780": [
            [
              "0",
              "cold"
            ],
            [
              "780",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "781": [
            [
              "0",
              "cold"
            ],
            [
              "781",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "782": [
            [
              "0",
              "cold"
            ],
            [
              "782",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "783": [
            [
              "0",
              "cold"
            ],
            [
              "783",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "784": [
            [
              "0",
              "cold"
            ],
            [
              "784",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "785": [
            [
              "0",
              "cold"
            ],
            [
              "785",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "790": [
            [
              "0",
              "cold"
            ],
            [
              "790",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "791": [
            [
              "0",
              "cold"
            ],
            [
              "791",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "793": [
            [
              "0",
              "cold"
            ],
            [
              "793",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "794": [
            [
              "0",
              "cold"
            ],
            [
              "794",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "795": [
            [
              "0",
              "cold"
            ],
            [
              "795",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "796": [
            [
              "0",
              "cold"
            ],
            [
              "796",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "797": [
            [
              "0",
              "cold"
            ],
            [
              "797",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "802": [
            [
              "0",
              "cold"
            ],
            [
              "802",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "803": [
            [
              "0",
              "cold"
            ],
            [
              "803",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "804": [
            [
              "0",
              "cold"
            ],
            [
              "804",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "805": [
            [
              "0",
              "cold"
            ],
            [
              "805",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "806": [
            [
              "0",
              "cold"
            ],
            [
              "806",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "807": [
            [
              "0",
              "cold"
            ],
            [
              "807",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "808": [
            [
              "0",
              "cold"
            ],
            [
              "808",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "809": [
            [
              "0",
              "cold"
            ],
            [
              "809",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "810": [
            [
              "0",
              "cold"
            ],
            [
              "810",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "811": [
            [
              "0",
              "cold"
            ],
            [
              "811",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "812": [
            [
              "0",
              "cold"
            ],
            [
              "812",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "813": [
            [
              "0",
              "cold"
            ],
            [
              "813",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "814": [
            [
              "0",
              "cold"
            ],
            [
              "814",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "815": [
            [
              "0",
              "cold"
            ],
            [
              "815",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "816": [
            [
              "0",
              "cold"
            ],
            [
              "816",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "817": [
            [
              "0",
              "cold"
            ],
            [
              "817",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "819": [
            [
              "0",
              "cold"
            ],
            [
              "819",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "820": [
            [
              "0",
              "cold"
            ],
            [
              "820",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "821": [
            [
              "0",
              "cold"
            ],
            [
              "821",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "822": [
            [
              "0",
              "cold"
            ],
            [
              "822",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "823": [
            [
              "0",
              "cold"
            ],
            [
              "823",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "824": [
            [
              "0",
              "cold"
            ],
            [
              "824",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "825": [
            [
              "0",
              "cold"
            ],
            [
              "825",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "826": [
            [
              "0",
              "cold"
            ],
            [
              "826",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "827": [
            [
              "0",
              "cold"
            ],
            [
              "827",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "828": [
            [
              "0",
              "cold"
            ],
            [
              "828",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "829": [
            [
              "0",
              "cold"
            ],
            [
              "829",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "830": [
            [
              "0",
              "cold"
            ],
            [
              "830",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "831": [
            [
              "0",
              "cold"
            ],
            [
              "831",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "832": [
            [
              "0",
              "cold"
            ],
            [
              "832",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "833": [
            [
              "0",
              "cold"
            ],
            [
              "833",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "834": [
            [
              "0",
              "cold"
            ],
            [
              "834",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "836": [
            [
              "0",
              "cold"
            ],
            [
              "836",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "837": [
            [
              "0",
              "cold"
            ],
            [
              "837",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "838": [
            [
              "0",
              "cold"
            ],
            [
              "838",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "839": [
            [
              "0",
              "cold"
            ],
            [
              "839",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "840": [
            [
              "0",
              "cold"
            ],
            [
              "840",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "841": [
            [
              "0",
              "cold"
            ],
            [
              "841",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "842": [
            [
              "0",
              "cold"
            ],
            [
              "842",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "843": [
            [
              "0",
              "cold"
            ],
            [
              "843",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "844": [
            [
              "0",
              "cold"
            ],
            [
              "844",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "845": [
            [
              "0",
              "cold"
            ],
            [
              "845",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "846": [
            [
              "0",
              "cold"
            ],
            [
              "846",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "850": [
            [
              "0",
              "cold"
            ],
            [
              "850",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "851": [
            [
              "0",
              "cold"
            ],
            [
              "851",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "853": [
            [
              "0",
              "cold"
            ],
            [
              "853",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "854": [
            [
              "0",
              "cold"
            ],
            [
              "854",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "855": [
            [
              "0",
              "cold"
            ],
            [
              "855",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "856": [
            [
              "0",
              "cold"
            ],
            [
              "856",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "857": [
            [
              "0",
              "cold"
            ],
            [
              "857",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "858": [
            [
              "0",
              "cold"
            ],
            [
              "858",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "859": [
            [
              "0",
              "cold"
            ],
            [
              "859",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "861": [
            [
              "0",
              "cold"
            ],
            [
              "861",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "862": [
            [
              "0",
              "cold"
            ],
            [
              "862",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "863": [
            [
              "0",
              "cold"
            ],
            [
              "863",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "864": [
            [
              "0",
              "cold"
            ],
            [
              "864",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "865": [
            [
              "0",
              "cold"
            ],
            [
              "865",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "866": [
            [
              "0",
              "cold"
            ],
            [
              "866",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "867": [
            [
              "0",
              "cold"
            ],
            [
              "867",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "868": [
            [
              "0",
              "cold"
            ],
            [
              "868",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "870": [
            [
              "0",
              "cold"
            ],
            [
              "870",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "871": [
            [
              "0",
              "cold"
            ],
            [
              "871",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "872": [
            [
              "0",
              "cold"
            ],
            [
              "872",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "873": [
            [
              "0",
              "cold"
            ],
            [
              "873",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "874": [
            [
              "0",
              "cold"
            ],
            [
              "874",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "875": [
            [
              "0",
              "cold"
            ],
            [
              "875",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "876": [
            [
              "0",
              "cold"
            ],
            [
              "876",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "877": [
            [
              "0",
              "cold"
            ],
            [
              "877",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "878": [
            [
              "0",
              "cold"
            ],
            [
              "878",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "880": [
            [
              "0",
              "cold"
            ],
            [
              "880",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "881": [
            [
              "0",
              "cold"
            ],
            [
              "881",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "882": [
            [
              "0",
              "cold"
            ],
            [
              "882",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "884": [
            [
              "0",
              "cold"
            ],
            [
              "884",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "885": [
            [
              "0",
              "cold"
            ],
            [
              "885",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "886": [
            [
              "0",
              "cold"
            ],
            [
              "886",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "906": [
            [
              "0",
              "cold"
            ],
            [
              "906",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "907": [
            [
              "0",
              "cold"
            ],
            [
              "907",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "908": [
            [
              "0",
              "cold"
            ],
            [
              "908",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "909": [
            [
              "0",
              "cold"
            ],
            [
              "909",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "910": [
            [
              "0",
              "cold"
            ],
            [
              "910",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "911": [
            [
              "0",
              "cold"
            ],
            [
              "911",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "912": [
            [
              "0",
              "cold"
            ],
            [
              "912",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "913": [
            [
              "0",
              "cold"
            ],
            [
              "913",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "914": [
            [
              "0",
              "cold"
            ],
            [
              "914",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "915": [
            [
              "0",
              "cold"
            ],
            [
              "915",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "916": [
            [
              "0",
              "cold"
            ],
            [
              "916",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "917": [
            [
              "0",
              "cold"
            ],
            [
              "917",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "918": [
            [
              "0",
              "cold"
            ],
            [
              "918",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "919": [
            [
              "0",
              "cold"
            ],
            [
              "919",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "920": [
            [
              "0",
              "cold"
            ],
            [
              "920",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "921": [
            [
              "0",
              "cold"
            ],
            [
              "921",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "922": [
            [
              "0",
              "cold"
            ],
            [
              "922",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "923": [
            [
              "0",
              "cold"
            ],
            [
              "923",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "924": [
            [
              "0",
              "cold"
            ],
            [
              "924",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "925": [
            [
              "0",
              "cold"
            ],
            [
              "925",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "926": [
            [
              "0",
              "cold"
            ],
            [
              "926",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "927": [
            [
              "0",
              "cold"
            ],
            [
              "927",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "928": [
            [
              "0",
              "cold"
            ],
            [
              "928",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "929": [
            [
              "0",
              "cold"
            ],
            [
              "929",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "930": [
            [
              "0",
              "cold"
            ],
            [
              "930",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "931": [
            [
              "0",
              "cold"
            ],
            [
              "931",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "932": [
            [
              "0",
              "cold"
            ],
            [
              "932",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "933": [
            [
              "0",
              "cold"
            ],
            [
              "933",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "934": [
            [
              "0",
              "cold"
            ],
            [
              "934",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "935": [
            [
              "0",
              "cold"
            ],
            [
              "935",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "936": [
            [
              "0",
              "cold"
            ],
            [
              "936",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "937": [
            [
              "0",
              "cold"
            ],
            [
              "937",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "938": [
            [
              "0",
              "cold"
            ],
            [
              "938",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "939": [
            [
              "0",
              "cold"
            ],
            [
              "939",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "940": [
            [
              "0",
              "cold"
            ],
            [
              "940",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "941": [
            [
              "0",
              "cold"
            ],
            [
              "941",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "942": [
            [
              "0",
              "cold"
            ],
            [
              "942",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "943": [
            [
              "0",
              "cold"
            ],
            [
              "943",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "944": [
            [
              "0",
              "cold"
            ],
            [
              "944",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "945": [
            [
              "0",
              "cold"
            ],
            [
              "945",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "946": [
            [
              "0",
              "cold"
            ],
            [
              "946",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "947": [
            [
              "0",
              "cold"
            ],
            [
              "947",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "948": [
            [
              "0",
              "cold"
            ],
            [
              "948",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "949": [
            [
              "0",
              "cold"
            ],
            [
              "949",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "950": [
            [
              "0",
              "cold"
            ],
            [
              "950",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "951": [
            [
              "0",
              "cold"
            ],
            [
              "951",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "952": [
            [
              "0",
              "cold"
            ],
            [
              "952",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "953": [
            [
              "0",
              "cold"
            ],
            [
              "953",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "954": [
            [
              "0",
              "cold"
            ],
            [
              "954",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "955": [
            [
              "0",
              "cold"
            ],
            [
              "955",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "956": [
            [
              "0",
              "cold"
            ],
            [
              "956",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "957": [
            [
              "0",
              "cold"
            ],
            [
              "957",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "960": [
            [
              "0",
              "cold"
            ],
            [
              "960",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "961": [
            [
              "0",
              "cold"
            ],
            [
              "961",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "962": [
            [
              "0",
              "cold"
            ],
            [
              "962",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "963": [
            [
              "0",
              "cold"
            ],
            [
              "963",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "964": [
            [
              "0",
              "cold"
            ],
            [
              "964",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "965": [
            [
              "0",
              "cold"
            ],
            [
              "965",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "966": [
            [
              "0",
              "cold"
            ],
            [
              "966",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "967": [
            [
              "0",
              "cold"
            ],
            [
              "967",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "968": [
            [
              "0",
              "cold"
            ],
            [
              "968",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "970": [
            [
              "0",
              "cold"
            ],
            [
              "970",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "971": [
            [
              "0",
              "cold"
            ],
            [
              "971",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "972": [
            [
              "0",
              "cold"
            ],
            [
              "972",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "973": [
            [
              "0",
              "cold"
            ],
            [
              "973",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "974": [
            [
              "0",
              "cold"
            ],
            [
              "974",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "976": [
            [
              "0",
              "cold"
            ],
            [
              "976",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "977": [
            [
              "0",
              "cold"
            ],
            [
              "977",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "980": [
            [
              "0",
              "cold"
            ],
            [
              "980",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "981": [
            [
              "0",
              "cold"
            ],
            [
              "981",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "982": [
            [
              "0",
              "cold"
            ],
            [
              "982",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "983": [
            [
              "0",
              "cold"
            ],
            [
              "983",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "984": [
            [
              "0",
              "cold"
            ],
            [
              "984",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "985": [
            [
              "0",
              "cold"
            ],
            [
              "985",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "986": [
            [
              "0",
              "cold"
            ],
            [
              "986",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "987": [
            [
              "0",
              "cold"
            ],
            [
              "987",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "990": [
            [
              "0",
              "cold"
            ],
            [
              "990",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "991": [
            [
              "0",
              "cold"
            ],
            [
              "991",
              "hot"
            ],
            [
              "",
              "cold"
            ]
          ],
          "992": [
            [
              "0",
              "cold"
            ],
            [
              "992",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "993": [
            [
              "0",
              "cold"
            ],
            [
              "993",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "994": [
            [
              "0",
              "cold"
            ],
            [
              "994",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "995": [
            [
              "0",
              "cold"
            ],
            [
              "995",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "996": [
            [
              "0",
              "cold"
            ],
            [
              "996",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ],
          "997": [
            [
              "0",
              "cold"
            ],
            [
              "997",
              "hot"
            ],
            [
              "x",
              "cold"
            ]
          ]
        }
      },
      "clicked": {
        "t": "{name} · {about0}",
        "x": {
          "201": "0201 Essen",
          "202": "0202 Wuppertal",
          "203": "0203 Duisburg",
          "208": "0208 Oberhausen Rheinl",
          "209": "0209 Gelsenkirchen",
          "211": "0211 Düsseldorf",
          "214": "0214 Leverkusen",
          "221": "0221 Köln",
          "228": "0228 Bonn",
          "231": "0231 Dortmund",
          "234": "0234 Bochum",
          "241": "0241 Aachen",
          "251": "0251 Münster",
          "261": "0261 Koblenz a Rhein",
          "271": "0271 Siegen",
          "281": "0281 Wesel",
          "291": "0291 Meschede",
          "331": "0331 Potsdam",
          "335": "0335 Frankfurt (Oder)",
          "340": "0340 Dessau Anh",
          "341": "0341 Leipzig",
          "345": "0345 Halle Saale",
          "351": "0351 Dresden",
          "355": "0355 Cottbus",
          "361": "0361 Erfurt",
          "365": "0365 Gera",
          "371": "0371 Chemnitz Sachs",
          "375": "0375 Zwickau",
          "381": "0381 Rostock",
          "385": "0385 Schwerin Meckl",
          "391": "0391 Magdeburg",
          "395": "0395 Neubrandenburg",
          "421": "0421 Bremen",
          "431": "0431 Kiel",
          "441": "0441 Oldenburg (Oldb)",
          "451": "0451 Lübeck",
          "461": "0461 Flensburg",
          "471": "0471 Bremerhaven",
          "481": "0481 Heide Holst",
          "491": "0491 Leer Ostfriesland",
          "511": "0511 Hannover",
          "521": "0521 Bielefeld",
          "531": "0531 Braunschweig",
          "541": "0541 Osnabrück",
          "551": "0551 Göttingen",
          "561": "0561 Kassel",
          "571": "0571 Minden Westf",
          "581": "0581 Uelzen",
          "591": "0591 Lingen (Ems)",
          "611": "0611 Wiesbaden",
          "621": "0621 Mannheim",
          "631": "0631 Kaiserslautern",
          "641": "0641 Gießen",
          "651": "0651 Trier",
          "661": "0661 Fulda",
          "671": "0671 Bad Kreuznach",
          "681": "0681 Saarbrücken",
          "711": "0711 Stuttgart",
          "721": "0721 Karlsruhe",
          "731": "0731 Ulm Donau",
          "741": "0741 Rottweil",
          "751": "0751 Ravensburg",
          "761": "0761 Freiburg im Breisgau",
          "771": "0771 Donaueschingen",
          "781": "0781 Offenburg",
          "791": "0791 Schwäbisch Hall",
          "811": "0811 Hallbergmoos",
          "821": "0821 Augsburg",
          "831": "0831 Kempten Allgäu",
          "841": "0841 Ingolstadt Donau",
          "851": "0851 Passau",
          "861": "0861 Traunstein",
          "871": "0871 Landshut",
          "881": "0881 Weilheim i OB",
          "906": "0906 Donauwörth",
          "911": "0911 Nürnberg",
          "921": "0921 Bayreuth",
          "931": "0931 Würzburg",
          "941": "0941 Regensburg",
          "951": "0951 Bamberg",
          "961": "0961 Weiden i d Opf",
          "971": "0971 Bad Kissingen",
          "981": "0981 Ansbach",
          "991": "0991 Deggendorf"
        }
      }
    },
    {
      "key": "digit2",
      "label": "First two digits",
      "noun": [
        "zone",
        "zones"
      ],
      "prompt": "dial",
      "hints": false,
      "groups": [
        [
          "02x",
          "",
          [
            "20",
            "21",
            "22",
            "23",
            "24",
            "25",
            "26",
            "27",
            "28",
            "29"
          ]
        ],
        [
          "03x",
          "",
          [
            "30",
            "33",
            "34",
            "35",
            "36",
            "37",
            "38",
            "39"
          ]
        ],
        [
          "04x",
          "",
          [
            "40",
            "41",
            "42",
            "43",
            "44",
            "45",
            "46",
            "47",
            "48",
            "49"
          ]
        ],
        [
          "05x",
          "",
          [
            "50",
            "51",
            "52",
            "53",
            "54",
            "55",
            "56",
            "57",
            "58",
            "59"
          ]
        ],
        [
          "06x",
          "",
          [
            "60",
            "61",
            "62",
            "63",
            "64",
            "65",
            "66",
            "67",
            "68",
            "69"
          ]
        ],
        [
          "07x",
          "",
          [
            "70",
            "71",
            "72",
            "73",
            "74",
            "75",
            "76",
            "77",
            "78",
            "79"
          ]
        ],
        [
          "08x",
          "",
          [
            "80",
            "81",
            "82",
            "83",
            "84",
            "85",
            "86",
            "87",
            "88",
            "89"
          ]
        ],
        [
          "09x",
          "",
          [
            "90",
            "91",
            "92",
            "93",
            "94",
            "95",
            "96",
            "97",
            "98",
            "99"
          ]
        ]
      ],
      "areas": {
        "x": {
          "20": [
            "202",
            "206",
            "205",
            "208",
            "203",
            "201",
            "204",
            "209"
          ],
          "21": [
            "216",
            "215",
            "213",
            "219",
            "218",
            "211",
            "217",
            "210",
            "212",
            "214"
          ],
          "22": [
            "226",
            "228",
            "224",
            "225",
            "223",
            "220",
            "229",
            "222",
            "221",
            "227"
          ],
          "23": [
            "239",
            "235",
            "230",
            "236",
            "232",
            "233",
            "237",
            "231",
            "238",
            "234"
          ],
          "24": [
            "248",
            "244",
            "243",
            "242",
            "246",
            "240",
            "241",
            "245",
            "247"
          ],
          "25": [
            "255",
            "259",
            "253",
            "252",
            "254",
            "257",
            "256",
            "250",
            "258",
            "251"
          ],
          "26": [
            "263",
            "267",
            "266",
            "269",
            "265",
            "260",
            "264",
            "268",
            "262",
            "261"
          ],
          "27": [
            "272",
            "275",
            "277",
            "274",
            "273",
            "276",
            "271"
          ],
          "28": [
            "285",
            "287",
            "282",
            "283",
            "284",
            "280",
            "286",
            "281"
          ],
          "29": [
            "299",
            "293",
            "294",
            "297",
            "295",
            "298",
            "291",
            "292",
            "290",
            "296"
          ],
          "30": [
            "30"
          ],
          "33": [
            "339",
            "333",
            "332",
            "337",
            "334",
            "336",
            "338",
            "330",
            "331",
            "335"
          ],
          "34": [
            "342",
            "346",
            "349",
            "343",
            "344",
            "347",
            "345",
            "340",
            "341"
          ],
          "35": [
            "353",
            "356",
            "358",
            "357",
            "359",
            "350",
            "354",
            "352",
            "355",
            "351"
          ],
          "36": [
            "368",
            "366",
            "367",
            "360",
            "369",
            "363",
            "364",
            "362",
            "365",
            "361"
          ],
          "37": [
            "374",
            "373",
            "372",
            "376",
            "377",
            "375",
            "371"
          ],
          "38": [
            "382",
            "388",
            "384",
            "383",
            "387",
            "381",
            "385",
            "386"
          ],
          "39": [
            "399",
            "390",
            "394",
            "393",
            "392",
            "398",
            "396",
            "397",
            "391",
            "395"
          ],
          "40": [
            "40"
          ],
          "41": [
            "414",
            "416",
            "415",
            "417",
            "412",
            "418",
            "413",
            "410",
            "419"
          ],
          "42": [
            "420",
            "424",
            "425",
            "423",
            "422",
            "426",
            "427",
            "428",
            "429",
            "421"
          ],
          "43": [
            "435",
            "434",
            "437",
            "438",
            "433",
            "432",
            "430",
            "439",
            "436",
            "431"
          ],
          "44": [
            "445",
            "443",
            "449",
            "448",
            "444",
            "447",
            "446",
            "440",
            "442",
            "441"
          ],
          "45": [
            "456",
            "450",
            "455",
            "454",
            "452",
            "453",
            "451"
          ],
          "46": [
            "466",
            "462",
            "464",
            "467",
            "468",
            "463",
            "460",
            "465",
            "461"
          ],
          "47": [
            "472",
            "473",
            "479",
            "475",
            "477",
            "476",
            "470",
            "474",
            "471"
          ],
          "48": [
            "489",
            "485",
            "480",
            "487",
            "483",
            "484",
            "482",
            "486",
            "481",
            "488"
          ],
          "49": [
            "494",
            "495",
            "490",
            "492",
            "493",
            "497",
            "496",
            "491"
          ],
          "50": [
            "507",
            "502",
            "503",
            "504",
            "505",
            "506",
            "508"
          ],
          "51": [
            "518",
            "516",
            "514",
            "510",
            "519",
            "515",
            "513",
            "517",
            "512",
            "511"
          ],
          "52": [
            "529",
            "527",
            "525",
            "524",
            "528",
            "523",
            "522",
            "520",
            "526",
            "521"
          ],
          "53": [
            "537",
            "532",
            "530",
            "535",
            "536",
            "533",
            "534",
            "531",
            "538"
          ],
          "54": [
            "547",
            "545",
            "548",
            "549",
            "542",
            "544",
            "546",
            "543",
            "540",
            "541"
          ],
          "55": [
            "559",
            "553",
            "550",
            "556",
            "552",
            "554",
            "555",
            "558",
            "557",
            "551"
          ],
          "56": [
            "567",
            "560",
            "565",
            "566",
            "568",
            "563",
            "564",
            "569",
            "562",
            "561"
          ],
          "57": [
            "572",
            "577",
            "570",
            "575",
            "573",
            "574",
            "571",
            "576"
          ],
          "58": [
            "586",
            "584",
            "580",
            "582",
            "585",
            "587",
            "588",
            "583",
            "581"
          ],
          "59": [
            "594",
            "595",
            "592",
            "597",
            "596",
            "593",
            "590",
            "591"
          ],
          "60": [
            "605",
            "607",
            "602",
            "600",
            "604",
            "609",
            "608",
            "603",
            "606"
          ],
          "61": [
            "618",
            "612",
            "614",
            "615",
            "610",
            "613",
            "617",
            "616",
            "611",
            "619"
          ],
          "62": [
            "622",
            "628",
            "625",
            "629",
            "626",
            "627",
            "620",
            "624",
            "621",
            "623"
          ],
          "63": [
            "633",
            "630",
            "635",
            "639",
            "632",
            "634",
            "638",
            "636",
            "631",
            "637"
          ],
          "64": [
            "640",
            "645",
            "646",
            "644",
            "643",
            "647",
            "642",
            "641",
            "648"
          ],
          "65": [
            "659",
            "657",
            "650",
            "655",
            "658",
            "652",
            "654",
            "656",
            "653",
            "651"
          ],
          "66": [
            "668",
            "663",
            "664",
            "665",
            "667",
            "669",
            "662",
            "666",
            "661"
          ],
          "67": [
            "670",
            "675",
            "677",
            "673",
            "672",
            "674",
            "676",
            "678",
            "671"
          ],
          "68": [
            "685",
            "683",
            "688",
            "689",
            "686",
            "682",
            "680",
            "687",
            "684",
            "681"
          ],
          "69": [
            "69"
          ],
          "70": [
            "706",
            "703",
            "704",
            "702",
            "708",
            "707",
            "705"
          ],
          "71": [
            "714",
            "712",
            "715",
            "719",
            "716",
            "713",
            "718",
            "717",
            "711"
          ],
          "72": [
            "720",
            "723",
            "727",
            "724",
            "722",
            "725",
            "726",
            "721"
          ],
          "73": [
            "734",
            "732",
            "730",
            "735",
            "739",
            "736",
            "738",
            "737",
            "733",
            "731"
          ],
          "74": [
            "744",
            "743",
            "748",
            "742",
            "745",
            "741",
            "747",
            "746",
            "740"
          ],
          "75": [
            "755",
            "753",
            "750",
            "756",
            "758",
            "757",
            "754",
            "752",
            "751"
          ],
          "76": [
            "766",
            "768",
            "762",
            "764",
            "763",
            "765",
            "760",
            "761",
            "767"
          ],
          "77": [
            "773",
            "772",
            "775",
            "774",
            "771",
            "770",
            "776",
            "777"
          ],
          "78": [
            "783",
            "780",
            "782",
            "784",
            "785",
            "781"
          ],
          "79": [
            "790",
            "795",
            "793",
            "794",
            "796",
            "797",
            "791"
          ],
          "80": [
            "808",
            "807",
            "802",
            "803",
            "809",
            "806",
            "805",
            "804"
          ],
          "81": [
            "813",
            "816",
            "812",
            "819",
            "814",
            "817",
            "810",
            "815",
            "811"
          ],
          "82": [
            "825",
            "828",
            "820",
            "822",
            "826",
            "823",
            "829",
            "824",
            "827",
            "821"
          ],
          "83": [
            "839",
            "836",
            "834",
            "837",
            "838",
            "832",
            "833",
            "830",
            "831"
          ],
          "84": [
            "842",
            "846",
            "840",
            "845",
            "844",
            "843",
            "841"
          ],
          "85": [
            "855",
            "850",
            "853",
            "859",
            "854",
            "851",
            "857",
            "856",
            "858"
          ],
          "86": [
            "868",
            "862",
            "861",
            "866",
            "867",
            "865",
            "863",
            "864"
          ],
          "87": [
            "873",
            "874",
            "872",
            "870",
            "877",
            "876",
            "878",
            "875",
            "871"
          ],
          "88": [
            "884",
            "880",
            "882",
            "886",
            "885",
            "881"
          ],
          "89": [
            "89"
          ],
          "90": [
            "908",
            "909",
            "907",
            "906"
          ],
          "91": [
            "910",
            "917",
            "916",
            "913",
            "919",
            "918",
            "915",
            "914",
            "912",
            "911"
          ],
          "92": [
            "928",
            "925",
            "920",
            "927",
            "929",
            "924",
            "926",
            "923",
            "922",
            "921"
          ],
          "93": [
            "934",
            "937",
            "931",
            "933",
            "935",
            "936",
            "939",
            "938",
            "932",
            "930"
          ],
          "94": [
            "946",
            "945",
            "940",
            "943",
            "949",
            "947",
            "948",
            "944",
            "942",
            "941"
          ],
          "95": [
            "952",
            "957",
            "954",
            "953",
            "956",
            "955",
            "950",
            "951"
          ],
          "96": [
            "965",
            "962",
            "968",
            "964",
            "960",
            "966",
            "963",
            "967",
            "961"
          ],
          "97": [
            "970",
            "972",
            "973",
            "977",
            "974",
            "971",
            "976"
          ],
          "98": [
            "985",
            "983",
            "987",
            "984",
            "986",
            "980",
            "982",
            "981"
          ],
          "99": [
            "990",
            "995",
            "993",
            "997",
            "994",
            "991",
            "992",
            "996"
          ]
        }
      },
      "name": "0{@g2}xx",
      "short": "0{@g2}",
      "chip": "{name}",
      "chipTitle": {
        "x": {
          "20": "Essen, Wuppertal, Duisburg, Oberhausen Rheinl",
          "21": "Düsseldorf, Solingen, Leverkusen",
          "22": "Köln, Bonn",
          "23": "Dortmund, Bochum",
          "24": "Aachen",
          "25": "Münster",
          "26": "Koblenz a Rhein",
          "27": "Siegen",
          "28": "Wesel",
          "29": "Meschede",
          "30": "Berlin, Berlin",
          "33": "Potsdam, Frankfurt (Oder)",
          "34": "Dessau Anh, Leipzig, Halle Saale",
          "35": "Dresden, Cottbus",
          "36": "Erfurt, Gera",
          "37": "Chemnitz Sachs, Zwickau",
          "38": "Rostock, Schwerin Meckl",
          "39": "Magdeburg, Neubrandenburg",
          "40": "Hamburg, Hamburg",
          "41": "Pinneberg, Ahrensburg, Wedel, Aumühle b Hamburg",
          "42": "Bremen",
          "43": "Kiel",
          "44": "Oldenburg (Oldb)",
          "45": "Lübeck",
          "46": "Flensburg",
          "47": "Bremerhaven",
          "48": "Heide Holst",
          "49": "Leer Ostfriesland",
          "50": "Nienburg Weser, Wietzen, Liebenau Kr Nieburg Weser, Rohrsen Kr Nienburg Weser",
          "51": "Hannover",
          "52": "Bielefeld",
          "53": "Braunschweig",
          "54": "Osnabrück",
          "55": "Göttingen",
          "56": "Kassel",
          "57": "Minden Westf",
          "58": "Uelzen",
          "59": "Lingen (Ems)",
          "60": "Ober-Mörlen, Rosbach v d Höhe, Lich-Eberstadt, Rosbach-Rodheim",
          "61": "Wiesbaden",
          "62": "Mannheim",
          "63": "Kaiserslautern",
          "64": "Gießen",
          "65": "Trier",
          "66": "Fulda",
          "67": "Bad Kreuznach",
          "68": "Saarbrücken",
          "69": "Frankfurt am Main, Frankfurt am Main",
          "70": "Kirchheim unter Teck, Nürtingen, Weilheim an der Teck, Wendlingen am Neckar",
          "71": "Stuttgart",
          "72": "Karlsruhe",
          "73": "Ulm Donau",
          "74": "Rottweil",
          "75": "Ravensburg",
          "76": "Freiburg im Breisgau",
          "77": "Donaueschingen",
          "78": "Offenburg",
          "79": "Schwäbisch Hall",
          "80": "Weyarn, Waakirchen, Tegernsee, Bayrischzell",
          "81": "Hallbergmoos",
          "82": "Augsburg",
          "83": "Kempten Allgäu",
          "84": "Ingolstadt Donau",
          "85": "Passau",
          "86": "Traunstein",
          "87": "Landshut",
          "88": "Weilheim i OB",
          "89": "München, München",
          "90": "Donauwörth",
          "91": "Nürnberg",
          "92": "Bayreuth",
          "93": "Würzburg",
          "94": "Regensburg",
          "95": "Bamberg",
          "96": "Weiden i d Opf",
          "97": "Bad Kissingen",
          "98": "Ansbach",
          "99": "Deggendorf"
        }
      },
      "about": {
        "x": {
          "20": [
            "Essen, Wuppertal, Duisburg, Oberhausen Rheinl",
            "17 codes"
          ],
          "21": [
            "Düsseldorf, Solingen, Leverkusen",
            "38 codes"
          ],
          "22": [
            "Köln, Bonn",
            "59 codes"
          ],
          "23": [
            "Dortmund, Bochum",
            "64 codes"
          ],
          "24": [
            "Aachen",
            "53 codes"
          ],
          "25": [
            "Münster",
            "71 codes"
          ],
          "26": [
            "Koblenz a Rhein",
            "73 codes"
          ],
          "27": [
            "Siegen",
            "42 codes"
          ],
          "28": [
            "Wesel",
            "47 codes"
          ],
          "29": [
            "Meschede",
            "52 codes"
          ],
          "30": [
            "Berlin, Berlin",
            "2 codes"
          ],
          "33": [
            "Potsdam, Frankfurt (Oder)",
            "241 codes"
          ],
          "34": [
            "Dessau Anh, Leipzig, Halle Saale",
            "176 codes"
          ],
          "35": [
            "Dresden, Cottbus",
            "204 codes"
          ],
          "36": [
            "Erfurt, Gera",
            "226 codes"
          ],
          "37": [
            "Chemnitz Sachs, Zwickau",
            "107 codes"
          ],
          "38": [
            "Rostock, Schwerin Meckl",
            "198 codes"
          ],
          "39": [
            "Magdeburg, Neubrandenburg",
            "307 codes"
          ],
          "40": [
            "Hamburg, Hamburg",
            "2 codes"
          ],
          "41": [
            "Pinneberg, Ahrensburg, Wedel, Aumühle b Hamburg",
            "77 codes"
          ],
          "42": [
            "Bremen",
            "74 codes"
          ],
          "43": [
            "Kiel",
            "58 codes"
          ],
          "44": [
            "Oldenburg (Oldb)",
            "70 codes"
          ],
          "45": [
            "Lübeck",
            "47 codes"
          ],
          "46": [
            "Flensburg",
            "48 codes"
          ],
          "47": [
            "Bremerhaven",
            "63 codes"
          ],
          "48": [
            "Heide Holst",
            "61 codes"
          ],
          "49": [
            "Leer Ostfriesland",
            "54 codes"
          ],
          "50": [
            "Nienburg Weser, Wietzen, Liebenau Kr Nieburg Weser, Rohrsen Kr Nienburg Weser",
            "44 codes"
          ],
          "51": [
            "Hannover",
            "71 codes"
          ],
          "52": [
            "Bielefeld",
            "65 codes"
          ],
          "53": [
            "Braunschweig",
            "63 codes"
          ],
          "54": [
            "Osnabrück",
            "67 codes"
          ],
          "55": [
            "Göttingen",
            "53 codes"
          ],
          "56": [
            "Kassel",
            "64 codes"
          ],
          "57": [
            "Minden Westf",
            "43 codes"
          ],
          "58": [
            "Uelzen",
            "56 codes"
          ],
          "59": [
            "Lingen (Ems)",
            "51 codes"
          ],
          "60": [
            "Ober-Mörlen, Rosbach v d Höhe, Lich-Eberstadt, Rosbach-Rodheim",
            "61 codes"
          ],
          "61": [
            "Wiesbaden",
            "65 codes"
          ],
          "62": [
            "Mannheim",
            "72 codes"
          ],
          "63": [
            "Kaiserslautern",
            "69 codes"
          ],
          "64": [
            "Gießen",
            "68 codes"
          ],
          "65": [
            "Trier",
            "71 codes"
          ],
          "66": [
            "Fulda",
            "67 codes"
          ],
          "67": [
            "Bad Kreuznach",
            "59 codes"
          ],
          "68": [
            "Saarbrücken",
            "54 codes"
          ],
          "69": [
            "Frankfurt am Main, Frankfurt am Main",
            "2 codes"
          ],
          "70": [
            "Kirchheim unter Teck, Nürtingen, Weilheim an der Teck, Wendlingen am Neckar",
            "33 codes"
          ],
          "71": [
            "Stuttgart",
            "57 codes"
          ],
          "72": [
            "Karlsruhe",
            "57 codes"
          ],
          "73": [
            "Ulm Donau",
            "67 codes"
          ],
          "74": [
            "Rottweil",
            "58 codes"
          ],
          "75": [
            "Ravensburg",
            "57 codes"
          ],
          "76": [
            "Freiburg im Breisgau",
            "52 codes"
          ],
          "77": [
            "Donaueschingen",
            "49 codes"
          ],
          "78": [
            "Offenburg",
            "31 codes"
          ],
          "79": [
            "Schwäbisch Hall",
            "49 codes"
          ],
          "80": [
            "Weyarn, Waakirchen, Tegernsee, Bayrischzell",
            "54 codes"
          ],
          "81": [
            "Hallbergmoos",
            "45 codes"
          ],
          "82": [
            "Augsburg",
            "62 codes"
          ],
          "83": [
            "Kempten Allgäu",
            "65 codes"
          ],
          "84": [
            "Ingolstadt Donau",
            "42 codes"
          ],
          "85": [
            "Passau",
            "53 codes"
          ],
          "86": [
            "Traunstein",
            "46 codes"
          ],
          "87": [
            "Landshut",
            "46 codes"
          ],
          "88": [
            "Weilheim i OB",
            "28 codes"
          ],
          "89": [
            "München, München",
            "2 codes"
          ],
          "90": [
            "Donauwörth",
            "27 codes"
          ],
          "91": [
            "Nürnberg",
            "74 codes"
          ],
          "92": [
            "Bayreuth",
            "72 codes"
          ],
          "93": [
            "Würzburg",
            "69 codes"
          ],
          "94": [
            "Regensburg",
            "62 codes"
          ],
          "95": [
            "Bamberg",
            "50 codes"
          ],
          "96": [
            "Weiden i d Opf",
            "57 codes"
          ],
          "97": [
            "Bad Kissingen",
            "44 codes"
          ],
          "98": [
            "Ansbach",
            "47 codes"
          ],
          "99": [
            "Deggendorf",
            "53 codes"
          ]
        }
      },
      "dial": {
        "t": [
          [
            "0",
            "cold"
          ],
          [
            "{id}",
            "hot"
          ],
          [
            "xx",
            "cold"
          ]
        ]
      },
      "clicked": "{name} · {chipTitle}"
    },
    {
      "key": "digit1",
      "label": "First digit",
      "noun": [
        "zone",
        "zones"
      ],
      "prompt": "dial",
      "hints": false,
      "groups": [
        [
          "Zones",
          "",
          [
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9"
          ]
        ]
      ],
      "areas": {
        "x": {
          "2": [
            "272",
            "248",
            "255",
            "285",
            "263",
            "216",
            "267",
            "266",
            "226",
            "299",
            "259",
            "239",
            "293",
            "244",
            "275",
            "243",
            "287",
            "253",
            "294",
            "235",
            "228",
            "277",
            "297",
            "230",
            "224",
            "295",
            "202",
            "269",
            "242",
            "252",
            "225",
            "236",
            "274",
            "254",
            "257",
            "215",
            "232",
            "233",
            "256",
            "237",
            "246",
            "240",
            "250",
            "282",
            "283",
            "265",
            "273",
            "206",
            "241",
            "223",
            "298",
            "231",
            "291",
            "220",
            "213",
            "260",
            "284",
            "229",
            "245",
            "238",
            "258",
            "292",
            "264",
            "276",
            "247",
            "222",
            "290",
            "205",
            "219",
            "280",
            "221",
            "286",
            "268",
            "218",
            "234",
            "208",
            "211",
            "203",
            "227",
            "217",
            "210",
            "212",
            "262",
            "201",
            "204",
            "296",
            "271",
            "209",
            "251",
            "261",
            "214",
            "281"
          ],
          "3": [
            "339",
            "333",
            "382",
            "353",
            "399",
            "332",
            "374",
            "390",
            "342",
            "394",
            "388",
            "356",
            "373",
            "346",
            "384",
            "368",
            "366",
            "337",
            "372",
            "334",
            "393",
            "392",
            "349",
            "336",
            "343",
            "358",
            "367",
            "360",
            "344",
            "383",
            "338",
            "357",
            "398",
            "396",
            "359",
            "350",
            "369",
            "363",
            "364",
            "387",
            "354",
            "376",
            "352",
            "397",
            "362",
            "377",
            "330",
            "347",
            "355",
            "381",
            "385",
            "331",
            "386",
            "30",
            "391",
            "375",
            "345",
            "365",
            "361",
            "340",
            "395",
            "335",
            "341",
            "351",
            "371"
          ],
          "4": [
            "472",
            "420",
            "473",
            "445",
            "435",
            "424",
            "489",
            "485",
            "466",
            "425",
            "423",
            "462",
            "443",
            "494",
            "480",
            "479",
            "414",
            "487",
            "483",
            "449",
            "416",
            "434",
            "415",
            "417",
            "422",
            "448",
            "495",
            "426",
            "475",
            "412",
            "490",
            "492",
            "444",
            "437",
            "464",
            "418",
            "427",
            "447",
            "446",
            "413",
            "456",
            "484",
            "450",
            "428",
            "493",
            "482",
            "477",
            "476",
            "467",
            "438",
            "468",
            "463",
            "433",
            "455",
            "432",
            "497",
            "486",
            "481",
            "410",
            "419",
            "470",
            "496",
            "40",
            "440",
            "442",
            "454",
            "429",
            "452",
            "453",
            "430",
            "439",
            "460",
            "488",
            "474",
            "465",
            "436",
            "451",
            "461",
            "491",
            "471",
            "421",
            "441",
            "431"
          ],
          "5": [
            "572",
            "567",
            "529",
            "559",
            "518",
            "537",
            "586",
            "527",
            "525",
            "553",
            "560",
            "516",
            "524",
            "547",
            "532",
            "550",
            "577",
            "514",
            "594",
            "510",
            "570",
            "575",
            "565",
            "584",
            "545",
            "556",
            "507",
            "530",
            "519",
            "502",
            "566",
            "595",
            "580",
            "528",
            "548",
            "573",
            "523",
            "549",
            "552",
            "568",
            "592",
            "535",
            "582",
            "522",
            "515",
            "542",
            "503",
            "554",
            "504",
            "544",
            "536",
            "563",
            "520",
            "585",
            "546",
            "587",
            "574",
            "564",
            "513",
            "533",
            "505",
            "569",
            "506",
            "597",
            "588",
            "517",
            "571",
            "543",
            "596",
            "534",
            "512",
            "583",
            "593",
            "562",
            "540",
            "555",
            "526",
            "531",
            "558",
            "590",
            "576",
            "538",
            "508",
            "557",
            "591",
            "511",
            "521",
            "561",
            "541",
            "581",
            "551"
          ],
          "6": [
            "668",
            "663",
            "640",
            "618",
            "605",
            "645",
            "646",
            "633",
            "664",
            "670",
            "675",
            "630",
            "677",
            "673",
            "622",
            "607",
            "635",
            "639",
            "672",
            "644",
            "685",
            "659",
            "628",
            "643",
            "602",
            "657",
            "665",
            "650",
            "612",
            "632",
            "625",
            "674",
            "667",
            "634",
            "629",
            "655",
            "683",
            "626",
            "627",
            "620",
            "624",
            "621",
            "638",
            "614",
            "615",
            "658",
            "676",
            "688",
            "689",
            "669",
            "678",
            "610",
            "652",
            "662",
            "666",
            "647",
            "686",
            "682",
            "642",
            "600",
            "654",
            "680",
            "613",
            "687",
            "604",
            "641",
            "656",
            "684",
            "609",
            "636",
            "617",
            "631",
            "608",
            "648",
            "623",
            "603",
            "616",
            "611",
            "637",
            "661",
            "619",
            "606",
            "653",
            "651",
            "69",
            "681",
            "671"
          ],
          "7": [
            "714",
            "790",
            "773",
            "795",
            "755",
            "706",
            "720",
            "723",
            "734",
            "783",
            "766",
            "703",
            "704",
            "727",
            "753",
            "724",
            "712",
            "768",
            "722",
            "772",
            "780",
            "793",
            "732",
            "775",
            "762",
            "744",
            "764",
            "743",
            "725",
            "750",
            "794",
            "774",
            "715",
            "719",
            "726",
            "771",
            "796",
            "763",
            "748",
            "782",
            "742",
            "756",
            "730",
            "735",
            "765",
            "758",
            "739",
            "721",
            "770",
            "702",
            "708",
            "736",
            "776",
            "716",
            "760",
            "707",
            "705",
            "745",
            "784",
            "741",
            "747",
            "797",
            "785",
            "713",
            "757",
            "718",
            "791",
            "761",
            "754",
            "738",
            "777",
            "752",
            "737",
            "767",
            "746",
            "717",
            "740",
            "733",
            "711",
            "781",
            "731",
            "751"
          ],
          "8": [
            "868",
            "89",
            "862",
            "873",
            "884",
            "808",
            "855",
            "825",
            "839",
            "861",
            "874",
            "828",
            "807",
            "872",
            "870",
            "866",
            "850",
            "802",
            "853",
            "813",
            "820",
            "836",
            "816",
            "822",
            "834",
            "837",
            "842",
            "846",
            "838",
            "812",
            "867",
            "859",
            "880",
            "826",
            "840",
            "819",
            "865",
            "823",
            "829",
            "863",
            "845",
            "854",
            "832",
            "824",
            "833",
            "803",
            "844",
            "882",
            "814",
            "877",
            "843",
            "876",
            "817",
            "878",
            "851",
            "857",
            "809",
            "827",
            "810",
            "856",
            "886",
            "806",
            "805",
            "804",
            "815",
            "811",
            "885",
            "864",
            "830",
            "858",
            "881",
            "875",
            "871",
            "821",
            "841",
            "831"
          ],
          "9": [
            "908",
            "965",
            "946",
            "934",
            "990",
            "995",
            "909",
            "937",
            "945",
            "952",
            "910",
            "957",
            "917",
            "940",
            "954",
            "916",
            "928",
            "913",
            "993",
            "925",
            "919",
            "997",
            "953",
            "985",
            "962",
            "943",
            "931",
            "970",
            "918",
            "920",
            "933",
            "949",
            "915",
            "983",
            "994",
            "956",
            "947",
            "968",
            "914",
            "955",
            "964",
            "948",
            "972",
            "912",
            "935",
            "991",
            "987",
            "907",
            "936",
            "944",
            "960",
            "992",
            "973",
            "942",
            "950",
            "966",
            "984",
            "939",
            "996",
            "927",
            "977",
            "929",
            "951",
            "986",
            "963",
            "980",
            "924",
            "926",
            "923",
            "982",
            "922",
            "967",
            "938",
            "932",
            "974",
            "981",
            "961",
            "941",
            "971",
            "976",
            "930",
            "911",
            "921",
            "906"
          ]
        }
      },
      "name": "0{id}xxx",
      "short": "0{id}",
      "chip": "{name}",
      "chipTitle": {
        "x": {
          "2": "Essen, Wuppertal, Duisburg, Oberhausen Rheinl",
          "3": "Berlin, Potsdam, Frankfurt (Oder), Dessau Anh",
          "4": "Hamburg, Bremen, Kiel, Oldenburg (Oldb)",
          "5": "Hannover, Bielefeld, Braunschweig, Osnabrück",
          "6": "Frankfurt am Main, Wiesbaden, Mannheim, Kaiserslautern",
          "7": "Stuttgart, Karlsruhe, Ulm Donau, Rottweil",
          "8": "München, Hallbergmoos, Augsburg, Kempten Allgäu",
          "9": "Donauwörth, Nürnberg, Bayreuth, Würzburg"
        }
      },
      "about": {
        "x": {
          "2": [
            "Essen, Wuppertal, Duisburg, Oberhausen Rheinl",
            "516 codes"
          ],
          "3": [
            "Berlin, Potsdam, Frankfurt (Oder), Dessau Anh",
            "1,460 codes"
          ],
          "4": [
            "Hamburg, Bremen, Kiel, Oldenburg (Oldb)",
            "553 codes"
          ],
          "5": [
            "Hannover, Bielefeld, Braunschweig, Osnabrück",
            "577 codes"
          ],
          "6": [
            "Frankfurt am Main, Wiesbaden, Mannheim, Kaiserslautern",
            "587 codes"
          ],
          "7": [
            "Stuttgart, Karlsruhe, Ulm Donau, Rottweil",
            "510 codes"
          ],
          "8": [
            "München, Hallbergmoos, Augsburg, Kempten Allgäu",
            "442 codes"
          ],
          "9": [
            "Donauwörth, Nürnberg, Bayreuth, Würzburg",
            "555 codes"
          ]
        }
      },
      "dial": {
        "t": [
          [
            "0",
            "cold"
          ],
          [
            "{id}",
            "hot"
          ],
          [
            "xxx",
            "cold"
          ]
        ]
      },
      "clicked": "{name} · {chipTitle}"
    }
  ],
  "g": "{@g2}",
  "explore": {
    "t": {
      "code": "{digit3.short}",
      "title": "{digit3.about1}",
      "sub": [
        "{digit3.about0}"
      ]
    }
  }
};
