// Lesotho Regions. Each map area is one of the local councils of 2019: 64 community councils, 11 urban councils and
// the Maseru Municipal Council, grouped into the 10 districts. Maseru's municipal council and Butha-Buthe's urban council
// reach into a second district (Berea, Leribe): each part is asked on its own, named by its district as in COD-AB
// ("Maseru (Berea District)"), so that every item lies in one district: 78 in all.
// The 80 constituencies (electoral divisions) have no open boundaries, so the councils are the finer layer.
// Spellings fixed: Teyateyaneng (COD-AB: Tayateyaneng), Berea District (COD-AB: Distict).
//
// Sources: FAO and the Ministry of Local Government and Chieftainship, via OCHA COD-AB (CC BY-IGO), 2019.

const LAYERS = {
  key: "lsregions",
  borders: "[DATA.db]",
  size: [1000,990],
  pad: 16,
  maxZoom: 40,
  labelScale: 0.22,
  fly: {"pad":1.6,"min":0.05},
  street: {"bounds":[[-30.8,26.9],[-28.4,29.6]],"maxBounds":[[-35,19],[-24,38]]},
  hintLabel: "Color by district",
  exploreKind: "councils",
  kinds: [
    {
      key: "districts",
      label: "Districts",
      noun: ["district","districts"],
      prompt: "name",
      hints: false,
      groups: [["Districts","",["A","B","C","D","E","F","G","H","J","K"]]],
      areas: "@dist",
      name: {"x":{"A":"Maseru","B":"Butha-Buthe","C":"Leribe","D":"Berea","E":"Mafeteng","F":"Mohale's Hoek","G":"Quthing","H":"Qacha's Nek","J":"Mokhotlong","K":"Thaba-Tseka"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: {"x":{"A":"Maseru","B":"Butha-Buthe","C":"Hlotse","D":"Teyateyaneng","E":"Mafeteng","F":"Mohale's Hoek","G":"Moyeni","H":"Qacha's Nek","J":"Mokhotlong","K":"Thaba-Tseka"}},
      about: {"x":{"A":["Seat: Maseru","12 councils"],"B":["Seat: Butha-Buthe","5 councils"],"C":["Seat: Hlotse","14 councils"],"D":["Seat: Teyateyaneng","10 councils"],"E":["Seat: Mafeteng","8 councils"],"F":["Seat: Mohale's Hoek","8 councils"],"G":["Seat: Moyeni","6 councils"],"H":["Seat: Qacha's Nek","4 councils"],"J":["Seat: Mokhotlong","5 councils"],"K":["Seat: Thaba-Tseka","6 councils"]}},
      clicked: "{name}",
    },
    {
      key: "councils",
      label: "Councils",
      noun: ["council","councils"],
      prompt: "name",
      groups: [["Maseru","",["A09","A03","A07","A10","A08","A04","A12","A05","A01","A02","A11","A06"]],["Butha-Buthe","",["B05","B02","B01","B03","B04"]],["Leribe","",["C04","C02","C14","C09","C13","C08","C06","C10","C12","C01","C05","C03","C07","C11"]],["Berea","",["D08","D03","D01","D02","D09","D06","D05","D07","D04","D10"]],["Mafeteng","",["E04","E08","E05","E02","E01","E07","E03","E06"]],["Mohale's Hoek","",["F03","F04","F02","F08","F06","F07","F01","F05"]],["Quthing","",["G01","G05","G02","G06","G04","G03"]],["Qacha's Nek","",["H02","H04","H01","H03"]],["Mokhotlong","",["J04","J05","J02","J03","J01"]],["Thaba-Tseka","",["K04","K02","K05","K03","K01","K06"]]],
      areas: {"x":{"G01":["G01"],"G02":["G02"],"G03":["G03"],"F03":["F03"],"F04":["F04"],"G04":["G04"],"G05":["G05"],"F02":["F02"],"H01":["H01"],"F05":["F05"],"F01":["F01"],"F06":["F06"],"E05":["E05"],"F07":["F07"],"H02":["H02"],"H03":["H03"],"E03":["E03"],"E06":["E06"],"E04":["E04"],"E07":["E07"],"A10":["A10"],"K03":["K03"],"E02":["E02"],"E01":["E01"],"K05":["K05"],"A09":["A09"],"A08":["A08"],"K02":["K02"],"A04":["A04"],"A05":["A05"],"A06":["A06"],"A07":["A07"],"J04":["J04"],"A01":["A01"],"A02":["A02"],"A03":["A03"],"K04":["K04"],"D08":["D08"],"D04":["D04"],"D06":["D06"],"K01":["K01"],"J03":["J03"],"D07":["D07"],"D01":["D01"],"D05":["D05"],"D02":["D02"],"C11":["C11"],"D03":["D03"],"C02":["C02"],"C01":["C01"],"C09":["C09"],"C10":["C10"],"C04":["C04"],"C03":["C03"],"C08":["C08"],"C05":["C05"],"J02":["J02"],"J01":["J01"],"C07":["C07"],"C06":["C06"],"B04":["B04"],"B03":["B03"],"B02":["B02"],"B01":["B01"],"G06":["G06"],"F08":["F08"],"H04":["H04"],"A11":["A11"],"E08":["E08"],"K06":["K06"],"A12":["A12"],"J05":["J05"],"D09":["D09"],"D10":["D10"],"C12":["C12"],"C13":["C13"],"C14":["C14"],"B05":["B05"]}},
      name: {"x":{"G01":"Mjanyane","G02":"Qomoqomong","G03":"Tosing","F03":"Khoelenya","F04":"Lithipeng","G04":"Telle","G05":"Mphaki","F02":"Mashaleng","H01":"Qanya","F05":"Thaba-Mokhele","F01":"Siloe","F06":"Qhoasing","E05":"Makoabating","F07":"Senqunyane","H02":"Ntsupe","H03":"Tsoelikana","E03":"Ramoetsana","E06":"Tsana-Talana","E04":"Lehlakaneng","E07":"Qibing","A10":"Makhoalipana","K03":"Litsoetse","E02":"Mamants'o","E01":"Metsi-Maholo","K05":"Linakeng","A09":"Kubake","A08":"Makhoarane","K02":"Khutlo-se-Metsi","A04":"Manonyane","A05":"Mohlakeng","A06":"Thota-ea-Moli","A07":"Lilala","J04":"Menoaneng","A01":"Qiloane","A02":"Ratau","A03":"Likolobeng","K04":"Bokong","D08":"Kanana","D04":"Tebe-Tebe","D06":"Motanasela","K01":"Tenesolo","J03":"Sanqebethu","D07":"Senekane","D01":"Makeoana","D05":"Phuthiatsana","D02":"Mapoteng","C11":"Tsuili-Tsuili","D03":"Kueneng","C02":"Bolahla","C01":"Matsoku","C09":"Hleoheng","C10":"Manka","C04":"'Maoa-Mafubelu","C03":"Ramapepe","C08":"Litjotjela","C05":"Menkhoaneng","J02":"Mphokojoana","J01":"Seate","C07":"Sephokong","C06":"Maisa-Phoka","B04":"Tsa-le-Moleka","B03":"Nqoe","B02":"Likila","B01":"Ngoajane","G06":"Quthing","F08":"Mohale's Hoek","H04":"Qacha's Nek","A11":"Semonkong","E08":"Mafeteng","K06":"Thaba-Tseka","A12":"Maseru (Maseru District)","J05":"Mokhotlong","D09":"Maseru (Berea District)","D10":"Teyateyaneng","C12":"Maputsoe","C13":"Leribe","C14":"Butha-Buthe (Leribe District)","B05":"Butha-Buthe (Butha-Buthe District)"}},
      short: "{name}",
      chip: "{name}",
      chipTitle: "{group}",
      about: {"x":{"G01":["Community council","Quthing district"],"G02":["Community council","Quthing district"],"G03":["Community council","Quthing district"],"F03":["Community council","Mohale's Hoek district"],"F04":["Community council","Mohale's Hoek district"],"G04":["Community council","Quthing district"],"G05":["Community council","Quthing district"],"F02":["Community council","Mohale's Hoek district"],"H01":["Community council","Qacha's Nek district"],"F05":["Community council","Mohale's Hoek district"],"F01":["Community council","Mohale's Hoek district"],"F06":["Community council","Mohale's Hoek district"],"E05":["Community council","Mafeteng district"],"F07":["Community council","Mohale's Hoek district"],"H02":["Community council","Qacha's Nek district"],"H03":["Community council","Qacha's Nek district"],"E03":["Community council","Mafeteng district"],"E06":["Community council","Mafeteng district"],"E04":["Community council","Mafeteng district"],"E07":["Community council","Mafeteng district"],"A10":["Community council","Maseru district"],"K03":["Community council","Thaba-Tseka district"],"E02":["Community council","Mafeteng district"],"E01":["Community council","Mafeteng district"],"K05":["Community council","Thaba-Tseka district"],"A09":["Community council","Maseru district"],"A08":["Community council","Maseru district"],"K02":["Community council","Thaba-Tseka district"],"A04":["Community council","Maseru district"],"A05":["Community council","Maseru district"],"A06":["Community council","Maseru district"],"A07":["Community council","Maseru district"],"J04":["Community council","Mokhotlong district"],"A01":["Community council","Maseru district"],"A02":["Community council","Maseru district"],"A03":["Community council","Maseru district"],"K04":["Community council","Thaba-Tseka district"],"D08":["Community council","Berea district"],"D04":["Community council","Berea district"],"D06":["Community council","Berea district"],"K01":["Community council","Thaba-Tseka district"],"J03":["Community council","Mokhotlong district"],"D07":["Community council","Berea district"],"D01":["Community council","Berea district"],"D05":["Community council","Berea district"],"D02":["Community council","Berea district"],"C11":["Community council","Leribe district"],"D03":["Community council","Berea district"],"C02":["Community council","Leribe district"],"C01":["Community council","Leribe district"],"C09":["Community council","Leribe district"],"C10":["Community council","Leribe district"],"C04":["Community council","Leribe district"],"C03":["Community council","Leribe district"],"C08":["Community council","Leribe district"],"C05":["Community council","Leribe district"],"J02":["Community council","Mokhotlong district"],"J01":["Community council","Mokhotlong district"],"C07":["Community council","Leribe district"],"C06":["Community council","Leribe district"],"B04":["Community council","Butha-Buthe district"],"B03":["Community council","Butha-Buthe district"],"B02":["Community council","Butha-Buthe district"],"B01":["Community council","Butha-Buthe district"],"G06":["Urban council","Quthing district"],"F08":["Urban council","Mohale's Hoek district"],"H04":["Urban council","Qacha's Nek district"],"A11":["Urban council","Maseru district"],"E08":["Urban council","Mafeteng district"],"K06":["Urban council","Thaba-Tseka district"],"A12":["Maseru Municipal Council, also in Berea","Maseru district"],"J05":["Urban council","Mokhotlong district"],"D09":["Maseru Municipal Council, also in Maseru","Berea district"],"D10":["Urban council","Berea district"],"C12":["Urban council","Leribe district"],"C13":["Urban council","Leribe district"],"C14":["Butha-Buthe Urban Council, also in Butha-Buthe","Leribe district"],"B05":["Butha-Buthe Urban Council, also in Leribe","Butha-Buthe district"]}},
      clicked: "{name}",
    },
  ],
  g: "{@dist}",
  explore: {"t":{"code":"{districts.name}","title":"{@name}","sub":["{@type}","{districts.name} district"]}},
};
