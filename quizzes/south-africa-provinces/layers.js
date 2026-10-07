// South Africa Provinces, using the province outlines from
// ../south-africa-codes/data.js (DATA.ent) as the map areas. Names come from geo.js (PROVINCE_NAMES).

const LAYERS = {
  key: "zaprov",
  map: {"paths":"DATA.ent","cols":{"id":["pv0","pv1","pv2","pv3","pv4","pv5","pv6","pv7","pv8"],"name":["Western Cape","Limpopo","Eastern Cape","Northern Cape","KwaZulu-Natal","North West","Free State","Gauteng","Mpumalanga"]}},
  size: [1100,964],
  pad: 16,
  maxZoom: 30,
  labelScale: 0.25,
  fly: {"pad":1.6,"min":0.05},
  street: {"bounds":[[-34.9,16.4],[-22.1,32.9]],"maxBounds":[[-45,5],[-12,45]]},
  hintLabel: "Color each province",
  exploreKind: "provinces",
  kinds: [
    {
      key: "provinces",
      label: "Provinces",
      noun: ["province","provinces"],
      prompt: "name",
      groups: [["Provinces","",["pv2","pv6","pv7","pv4","pv1","pv8","pv5","pv3","pv0"]]],
      areas: "@id",
      name: "{@name}",
      short: {"x":{"pv2":"EC","pv6":"FS","pv7":"GP","pv4":"KZN","pv1":"LP","pv8":"MP","pv5":"NW","pv3":"NC","pv0":"WC"}},
      chip: "{name}",
      chipTitle: {"x":{"pv2":"Capital: Bhisho","pv6":"Capital: Bloemfontein","pv7":"Capital: Johannesburg","pv4":"Capital: Pietermaritzburg","pv1":"Capital: Polokwane","pv8":"Capital: Mbombela","pv5":"Capital: Mahikeng","pv3":"Capital: Kimberley","pv0":"Capital: Cape Town"}},
      about: {"x":{"pv2":["Capital: Bhisho","Area codes: 039, 040, 041, 042, 043, 045, 046, 047, 048, 049, 051"],"pv6":["Capital: Bloemfontein","Area codes: 016, 051, 056, 057, 058"],"pv7":["Capital: Johannesburg","Area codes: 010, 011, 012, 016, 018"],"pv4":["Capital: Pietermaritzburg","Area codes: 031, 032, 033, 034, 035, 036, 039"],"pv1":["Capital: Polokwane","Area codes: 013, 014, 015"],"pv8":["Capital: Mbombela","Area codes: 013, 017"],"pv5":["Capital: Mahikeng","Area codes: 012, 014, 018, 053"],"pv3":["Capital: Kimberley","Area codes: 027, 053, 054"],"pv0":["Capital: Cape Town","Area codes: 021, 022, 023, 027, 028, 044"]}},
      clicked: "{name}",
    },
  ],
  g: {"x":{"pv0":"1","pv1":"2","pv2":"3","pv3":"4","pv4":"5","pv5":"6","pv6":"7","pv7":"8","pv8":"9"}},
  explore: {"t":{"code":"{provinces.short}","title":"{@name}","sub":["{provinces.about0}","{provinces.about1}"]}},
};
