// South Korea: names of the 17 si-do (provinces and metropolitan cities) as before the 1 July 2026 Gwangju-Jeonnam
// merger, which is what Street View coverage shows, for the codes and regions pages.
//   en      English name;  ko  short Hangul form (as on commercial number plates, en.wikipedia "Vehicle registration
//           plates of South Korea");  full  official Hangul name (Statistics Korea SGIS 2026; Gwangju and Jeonnam
//           as before the merger);  old  earlier official name still on older signs;  region  traditional region
//           (en.wikipedia "Regions of Korea", from the National Atlas of Korea; unofficial);  road  local-road
//           (지방도) number prefix of the province (ko.wikipedia 대한민국의 지방도; metropolitan cities and Sejong have none)
const KR = {
  sido: {
    SE: { en: 'Seoul', ko: '서울', full: '서울특별시', region: 'CAP' },
    BS: { en: 'Busan', ko: '부산', full: '부산광역시', region: 'YN' },
    DG: { en: 'Daegu', ko: '대구', full: '대구광역시', region: 'YN' },
    IC: { en: 'Incheon', ko: '인천', full: '인천광역시', region: 'CAP' },
    GJ: { en: 'Gwangju', ko: '광주', full: '광주광역시', region: 'HN', merged: true },
    DJ: { en: 'Daejeon', ko: '대전', full: '대전광역시', region: 'HS' },
    US: { en: 'Ulsan', ko: '울산', full: '울산광역시', region: 'YN' },
    SJ: { en: 'Sejong', ko: '세종', full: '세종특별자치시', region: 'HS' },
    GG: { en: 'Gyeonggi', ko: '경기', full: '경기도', region: 'CAP', road: '3' },
    GW: { en: 'Gangwon', ko: '강원', full: '강원특별자치도', old: '강원도', region: 'GD', road: '4' },
    CB: { en: 'North Chungcheong', ko: '충북', full: '충청북도', region: 'HS', road: '5' },
    CN: { en: 'South Chungcheong', ko: '충남', full: '충청남도', region: 'HS', road: '6' },
    JB: { en: 'North Jeolla', ko: '전북', full: '전북특별자치도', old: '전라북도', region: 'HN', road: '7' },
    JN: { en: 'South Jeolla', ko: '전남', full: '전라남도', region: 'HN', road: '8', merged: true },
    GB: { en: 'North Gyeongsang', ko: '경북', full: '경상북도', region: 'YN', road: '9' },
    GN: { en: 'South Gyeongsang', ko: '경남', full: '경상남도', region: 'YN', road: '10' },
    JJ: { en: 'Jeju', ko: '제주', full: '제주특별자치도', region: 'JJ', road: '11' },
  },
  // Traditional regions, north to south.
  regions: [
    { id: 'CAP', en: 'Sudogwon', ko: '수도권', sub: 'Seoul, Incheon, Gyeonggi' },
    { id: 'GD', en: 'Gwandong', ko: '관동', sub: 'Gangwon' },
    { id: 'HS', en: 'Hoseo', ko: '호서', sub: 'Chungcheong' },
    { id: 'YN', en: 'Yeongnam', ko: '영남', sub: 'Gyeongsang' },
    { id: 'HN', en: 'Honam', ko: '호남', sub: 'Jeolla' },
    { id: 'JJ', en: 'Jeju', ko: '제주', sub: 'Jeju' },
  ],
  // Map pieces where the area code differs from the rest of the si-do (ko.wikipedia 대한민국의 전화번호 체계).
  pieces: {
    'GG-02': 'Gwacheon, Gwangmyeong',
    'GG-032': 'Bucheon, Daebudo',
    'CN-042': 'Gyeryong',
    'GB-053': 'Gyeongsan',
    'DG-054': 'Gunwi',
  },
};
