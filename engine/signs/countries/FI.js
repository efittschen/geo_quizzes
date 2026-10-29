// FI: Finnish signs carrying a place name, drawn after the GeoHints pictures (see examples/FI.json).
// Place names stand in capitals in a DIN-like face (the Traficom road-sign typeface; DINish stands in).
// In bilingual municipalities both names stand on the sign, the majority language first (name, then alt).
(function () {
  const { T, svg } = TS;
  const F = "'DINish','Noto Sans',sans-serif";
  // advance widths (em) of DINish Medium, to size a sign to its text before the real font is measured
  const CH = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-./'():ÆØÅæøåÐðÞþßŊŋĐđŦŧ";
  const W = Object.fromEntries([...CH].map((c, i) => [c, +'217586608606613550551606622248318602524753652606573606599547503628533808574512512498512504512508315512521229227502277818521507512512344466344521452721434453455499335476497506487501439516501393200396179295295200871606586797507498669500573512511652521669512486344'.substr(i * 3, 3) / 1000]));
  const tw = (s, ls = 0) => [...String(s)].reduce((a, c) => a + (W[c] ?? W[c.normalize('NFD')[0]] ?? 0.6) + ls, 0);
  const split2 = (s) => {
    const cut = [...s].map((c, i) => (c === ' ' || c === '-' ? i : -1)).filter((i) => i > 0);
    if (!cut.length) return null;
    const i = cut.reduce((b, x) => (Math.abs(x - s.length / 2) < Math.abs(b - s.length / 2) ? x : b));
    return s[i] === '-' ? [s.slice(0, i + 1), s.slice(i + 1)] : [s.slice(0, i), s.slice(i + 1)];
  };
  const up = (s) => String(s).toLocaleUpperCase('fi');
  const DBLUE = '#0051a9', BLUE = '#0091ff', GREEN = '#20744f', RED = '#e4002b', INK = '#111';
  const txt = (x, y, s, max, maxw, o = {}) => T(x, y, s, Math.min(max, maxw / tw(s, o.ls || 0)), F, { weight: 500, maxw, max, ...o });
  // the lines of a name: the name and its second-language form, each split in two when longer than maxChars wide
  const lines = (name, alt, S, maxw) => [name, alt].filter(Boolean).map(up).flatMap((l) => (tw(l) * S > maxw && split2(l)) || [l]);

  // place-name sign: dark blue, white rim, the name in white capitals; its length follows the name
  const paikannimi = ({ name, alt }) => {
    const S = 97, pad = 42, L = lines(name, alt, S, 1500);
    const w = Math.max(400, Math.min(1500, Math.max(...L.map((l) => tw(l) * S)) + 2 * pad)), H = 133 + (L.length - 1) * 92;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="14" fill="#fff" stroke="#bbb" stroke-width="2"/><rect x="8" y="8" width="${w - 16}" height="${H - 16}" rx="9" fill="${DBLUE}"/>` +
      L.map((l, i) => txt(w / 2, 103 + i * 92, l, S, w - 2 * pad, { fill: '#fff' })).join(''));
  };

  // arrow sign (blue): rectangular plate, arrow-shaped white frame inside, the name and km in white capitals
  const viitta = ({ name, alt, km }) => {
    // GeoHints 126 (same 124 px height), measured: the white plate's point 0.53 of the height long and solid white; the
    // blue field inside a plain rounded rectangle that ends where the point begins (TS.arrows.plate with a flat field)
    const S = 92, k = String(km), kw = tw(k) * S, L = lines(name, alt, S, 1300), H = 124 + (L.length - 1) * 84, tip = Math.round(0.53 * H), m = H / 2;
    const w = Math.max(640, Math.min(1600, 84 + Math.max(...L.map((l) => tw(l) * S)) + 40 + kw + 34 + tip));
    const pl = TS.arrows.plate({ x: 2, y: 2, w: w - 3, h: H - 4, dir: 'right', tip, r: 12, rTip: 2, rNeck: 1, fill: BLUE, ink: '#fff', outer: '#fff', band: 5, fieldTip: 0, fieldNeck: -1.5, rField: 10, rFieldNeck: 8 });
    const maxw = w - 84 - tip - kw - 74;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="8" fill="${BLUE}"/>` + pl.svg +
      L.map((l, i) => txt(84, 97 + i * 84, l, S, maxw, { fill: '#fff', anchor: 'start' })).join('') +
      txt(w - tip - 34, 97 + (L.length - 1) * 42, k, S, kw + 4, { fill: '#fff', anchor: 'end' }));
  };

  // a route number: white figures on red with a white edge (main roads)
  const redBox = (x, y, w, h, r, e = 5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${e}" fill="#fff"/><rect x="${x + e + 2}" y="${y + e + 1}" width="${w - 2 * e - 4}" height="${h - 2 * e - 2}" rx="${e + 3}" fill="${RED}"/>` +
    T(x + w / 2, y + h * 0.78, r, Math.min(h * 0.8, (w - 26) / tw(r)), F, { weight: 600, fill: '#fff', maxw: w - 26, max: h * 0.8 });

  // advance sign (blue): the destination above in widely spaced capitals, an arrow turning right, the route number
  const ennakko = ({ name, alt, road }) => {
    const S = 150, ls = 0.2, r = String(road), L = [name, alt].filter(Boolean).map(up).flatMap((l) => (tw(l, ls) * S > 1700 && split2(l)) || [l]);
    const w = Math.max(640, Math.min(1800, Math.max(...L.map((l) => tw(l, ls) * S)) + 124)), dy = (L.length - 1) * 140, H = 447 + dy;
    const bw = Math.max(162, tw(r) * 110 + 60), bx = w - 58 - bw;
    const arrow = `<path d="M163,${383 + dy}V${277 + dy}H258V${232 + dy}L318,${292 + dy}L258,${352 + dy}V${307 + dy}H193V${383 + dy}Z" fill="#fff"/>`;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="16" fill="${BLUE}"/><rect x="7" y="7" width="${w - 14}" height="${H - 14}" rx="13" fill="none" stroke="#fff" stroke-width="8"/>` +
      L.map((l, i) => txt(w / 2 + ls * S / 2, 165 + i * 140, l, S, w - 110, { fill: '#fff', ls })).join('') + arrow + redBox(bx, 232 + dy, bw, 153, r, 7));
  };

  // motorway direction sign (green, overhead): the destination, E-road number, an arrow straight on, the national route
  const moottoritie = ({ name, alt, road }) => {
    const S = 66, L = lines(name, alt, S, 1000), r = String(road), e = 'E18';
    const w = Math.max(620, Math.min(1000, Math.max(...L.map((l) => tw(l, 0.04) * S)) + 120)), dy = (L.length - 1) * 70, H = 210 + dy;
    const ew = 126, rw = Math.max(64, tw(r) * 60 + 26);
    return svg(w, H, `<rect width="${w}" height="${H}" rx="6" fill="${GREEN}"/><rect x="4" y="4" width="${w - 8}" height="${H - 8}" rx="4" fill="none" stroke="#e8f0ec" stroke-width="3"/>` +
      L.map((l, i) => txt(w / 2, 88 + i * 70, l, S, w - 100, { fill: '#fff', ls: 0.04 })).join('') +
      `<rect x="38" y="${118 + dy}" width="${ew}" height="64" rx="4" fill="none" stroke="#fff" stroke-width="4"/>` + txt(38 + ew / 2, 170 + dy, e, 60, ew - 20, { fill: '#fff' }) +
      `<path d="M${w / 2 - 12},${190 + dy}V${148 + dy}H${w / 2 - 34}L${w / 2},${112 + dy}L${w / 2 + 34},${148 + dy}H${w / 2 + 12}V${190 + dy}Z" fill="#fff"/>` +
      redBox(w - 50 - rw, 116 + dy, rw, 70, r, 4));
  };

  // local direction sign (white, overhead) in a bilingual area: each destination in Finnish and Swedish, one per line
  const paikallinen = ({ name, alt, next }) => {
    const S = 50, L = [name, alt, next].filter(Boolean).map(up);
    const w = Math.max(420, Math.min(1000, Math.max(...L.map((l) => tw(l, 0.04) * S)) + 150)), H = 40 + L.length * 62;
    return svg(w, H, `<rect width="${w}" height="${H}" rx="8" fill="#111"/><rect x="4" y="4" width="${w - 8}" height="${H - 8}" rx="5" fill="#f2f2f0"/>` +
      L.slice(1).map((l, i) => `<line x1="6" y1="${24 + (i + 1) * 62}" x2="${w - 6}" y2="${24 + (i + 1) * 62}" stroke="#d6d6d4" stroke-width="2"/>`).join('') +
      L.map((l, i) => txt(30, 72 + i * 62, l, S, w - 140, { fill: INK, ls: 0.04, anchor: 'start' })).join('') +
      `<g transform="translate(${w - 62},${24 + 62}) rotate(45)" fill="${INK}"><path d="M-7,30V-6H-22L0,-32L22,-6H7V30Z"/></g>`);
  };

  // a bicycle pictogram (line drawing, 60 x 34 at scale 1) and a walking adult with a child (36 x 50), white
  const bikeIcon = (x, y, k, c) => `<g transform="translate(${x},${y}) scale(${k})" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="23" r="10"/><circle cx="49" cy="23" r="10"/><path d="M11,23L22,7H42L49,23M22,7L30,23H11M30,23L42,7M17,2H27M42,7L39,1H46"/></g>`;
  const walkers = (x, y, c) => `<g transform="translate(${x},${y})" fill="${c}"><circle cx="11" cy="5" r="5"/><path d="M5,12H17L19,30H15L14,50H9L8,30H3Z"/><circle cx="28" cy="22" r="4"/><path d="M23,28H33L34,40H31L30,50H26L25,40H22Z"/></g>`;
  // the walking adult holding a child's hand above a bicycle, as on the Finnish pedestrian and cycle path sign, taken from
  // Wikimedia Commons, File:Finland road sign 423.svg (public domain); (cx, top) the top centre, h the height; ink the
  // figures, paper the holes in the bicycle. Box of the Commons paths: x 181.5..464.5, y -306..225
  const walkBike = (cx, top, h, ink, paper) => { const k = h / 531;
    return `<g transform="translate(${(cx - 323 * k).toFixed(1)},${top.toFixed(1)}) scale(${k.toFixed(5)}) translate(0,306)">` +
      `<path fill="${ink}" d="m 287.55702,30.393131 -11.80529,1.606872 -23.48694,-13.349426 v -5.06784 l 12.54697,-5.129634 -7.84958,-221.254333 -2.71954,5.06784 -2.78135,5.93308 -1.91604,5.87127 -1.97785,5.87128 -1.54519,5.87127 -0.80349,6.24209 -0.80352,7.84897 0.43266,8.5906 0.7417,20.39494 3.95569,8.65241 -1.607,5.43866 1.17435,9.02322 -8.59128,2.34851 -8.22043,-7.41635 -5.50089,-63.90418 19.22221,-56.36426 1.91604,-3.95534 1.607,-1.9159 3.52304,-2.78112 23.85779,-7.84895 0.8035,-4.69709 -0.37085,-2.34847 -3.15219,-2.34854 -1.17434,-8.21972 -0.8035,-7.04556 v -7.84896 l 0.8035,-3.52278 2.34868,-4.26437 1.5452,-1.97771 4.32654,-2.34854 6.3044,-1.54507 3.89388,0.37083 5.50089,0.37083 11.31079,4.69702 0.80352,1.60688 -0.80352,1.54506 -0.7417,0.8034 0.7417,7.78723 -0.37085,3.52271 1.54522,5.50049 -1.54522,12.17513 -1.1743,1.54507 -1.17437,0.37084 -5.87174,0.43264 -0.8035,4.26437 22.68346,8.65243 2.71951,2.34847 1.97783,2.34854 1.97789,2.7193 1.17438,2.78119 12.9178,54.01569 19.593,35.28945 5.8718,4.3262 2.3487,7.41634 -2.7196,5.50046 7.0461,16.8104 17.6152,-5.43867 v -2.34851 h -3.8938 l -1.6071,-1.60687 -2.3487,-3.52276 -0.7417,-4.32621 v -2.3485 l 0.7417,-1.91589 -0.7417,-2.78113 v -2.34851 l 0.3709,-1.54508 -0.8035,-1.54507 v -2.3485 l 1.1743,-1.9777 2.3487,-2.34851 4.3266,-2.71933 3.523,-1.23605 4.6973,-0.74164 h 5.0683 l 4.3265,1.17426 3.523,2.34851 3.1523,3.15195 1.5452,3.52276 0.4326,3.89358 -0.8035,5.50046 -0.8035,5.06784 -0.3708,1.97768 0.3708,1.54508 1.1744,2.78113 -9.3948,1.91589 2.7813,2.3485 1.916,0.80345 3.9558,1.17425 4.2647,2.71933 1.9778,2.3485 3.5231,4.69703 2.7196,5.12963 2.3487,4.69702 5.9335,8.961424 2.3487,5.06784 1.5452,6.67471 1.1744,7.41635 0.3708,5.12963 -0.7417,4.69702 -2.3487,4.2644 -3.9557,3.58457 -5.5008,-5.93308 1.1743,-3.52276 -0.3709,-2.34851 2.7813,-3.52276 -3.9556,-11.30993 -9.3948,-15.26531 1.1743,13.28762 5.8717,34.486 -2.7195,0.74164 v 13.72024 l -2.3487,29.788986 1.1743,1.97769 1.9161,1.545072 2.3487,1.174261 v 3.893579 l -11.3108,5.500459 -7.0461,-0.803436 -0.4327,-27.378678 1.1744,-13.720243 -0.3709,-4.69702 v -3.52276 l -0.8035,-2.78113 -1.9778,-2.34852 -8.2205,0.43263 1.9779,64.645807 -7.0461,1.545079 -14.0921,-8.652403 V 6.908031 l 1.9161,-2.719325 1.9778,-0.803436 3.523,-0.803437 -5.5008,-52.099829 -8.5914,-1.54508 6.2426,-28.61473 2.3488,-23.794114 -13.6596,-0.43262 -3.1521,-6.67472 -3.8939,-17.61382 -4.3266,-3.89358 -1.607,-5.12964 -32.88171,-48.57707 -3.83213,-26.20443 v 44.6217 l 6.98432,91.653674 v 61.061247 l 0.37085,4.758824 0.80345,2.348515 0.74177,1.545064 1.1743,1.174261 1.60705,0.803436 v 4.264397 l -14.0304,14.52368 -13.35047,-0.370818 -0.37085,-83.866506 -10.56911,-62.235514 -3.15221,0.43262 z"/>` +
      `<path fill="${ink}" d="m 256.9482,118.63502 -4.81511,-1.63704 -8.79882,-1.70634 -7.31792,-0.54568 -8.88543,0.27717 0.23383,2.26067 -8.26189,1.92289 -7.83752,3.22213 -7.26597,4.42608 -6.48654,5.47414 -5.53391,6.40095 -4.47735,7.20648 -3.26491,7.83011 -2.00919,8.2199 -0.72747,8.46241 0.61489,8.46241 1.97454,8.26317 3.17831,7.83879 4.42539,7.24977 2.58944,3.3694 7.30925,7.21512 9.24051,5.90723 5.12687,2.49456 10.93789,2.78903 9.66485,0.73625 11.38825,-1.50711 8.08004,-2.54652 7.60369,-3.84577 6.87626,-4.9458 6.01022,-5.96787 4.99697,-6.86866 3.89711,-7.55294 2.3556,0.82284 2.65003,-8.21988 1.33369,-8.54902 0.0519,-8.60966 -1.2471,-8.55768 -2.5894,-8.26319 -3.80187,-7.79546 -4.91037,-7.0679 -5.95825,-6.24503 -5.82836,-4.55602 -4.75448,-2.98826 2.54612,-7.31042 50.54995,55.85884 -1.87062,3.94105 -0.6322,6.49621 1.1085,4.22688 2.20837,3.75048 5.00564,4.18356 6.30467,1.73234 2.15641,-0.0519 2.45084,9.13804 h -3.84514 v 5.57806 h 14.28945 l -0.0519,-5.48279 H 337.939 l -2.98779,-10.53254 3.80185,-2.58984 2.97913,-3.51661 1.92257,-3.07488 0.58025,-3.35205 10.04591,-0.91813 2.01783,8.21987 3.27358,7.83012 4.46869,7.21514 5.53391,6.43558 6.49519,5.53479 7.25728,4.41743 7.83756,3.22213 12.46212,2.49455 8.51304,0.0434 8.41775,-1.29921 8.06272,-2.5812 7.60371,-3.80245 6.87624,-4.9458 6.0622,-5.96784 5.04893,-6.82536 3.94041,-7.54428 2.69333,-8.02933 1.44627,-8.41044 0.0952,-8.45377 2.11311,-0.14731 -0.5283,-4.37414 -2.16504,-8.5577 -3.41215,-8.12459 -4.61592,-7.50098 -5.76773,-6.67811 -6.68573,-5.72533 -7.55175,-4.61664 -8.13199,-3.41268 -8.54766,-2.05282 -8.75554,-0.77088 -8.79883,0.62363 -8.60829,1.9662 -8.1753,3.26543 -13.32813,-23.50767 1.44628,-3.07486 -0.82275,-0.42442 1.68875,-3.69854 1.73206,-0.0519 1.62813,-0.33779 1.54151,-0.62364 1.44627,-0.85748 1.29906,-1.10871 7.69031,-9.80496 0.52826,-1.77563 -0.19062,-0.91814 -1.10852,-1.48979 -1.77536,-0.57167 -6.78098,2.06146 -6.73768,1.16066 -3.41214,0.0434 -9.13659,-1.20398 -2.39887,-0.0952 -2.35558,0.14731 -1.63681,0.81418 -0.13854,2.68513 4.0357,3.55991 7.4045,4.80721 3.98372,1.9662 -1.42895,3.08352 -0.77076,-0.2945 -0.48497,0.86617 h -91.46949 l 2.8319,-8.41044 -1.0046,-0.28584 4.33013,-11.7798 -0.96996,-0.38977 0.29444,-0.8142 -2.12175,-0.86616 -0.38104,0.8142 -1.20378,-0.5197 -0.71015,-0.66696 -0.58022,-1.78429 0.0952,-0.90946 0.33774,-0.81421 0.58024,-0.72756 0.96995,-0.48505 1.2817,-0.51971 2.17376,-0.35513 17.92672,1.88824 0.9613,-4.99775 -9.28379,-1.152 -9.53497,-0.54568 -1.95722,-0.0694 -2.37291,0.4071 -1.80132,0.58898 -1.92258,1.01342 -1.10853,1.152 -0.86601,1.39451 -0.57157,1.4898 -0.2425,1.58508 0.0433,1.63705 0.38971,1.58509 0.66682,1.44648 0.96996,1.3339 1.19512,1.05671 1.35102,0.86617 -2.59809,7.449 -0.96129,-0.38113 -12.45347,37.01981"/>` +
      `<path fill="${paper}" d="m 270.55348,99.25897 h 91.09727 l -29.92119,64.65904 -4.61591,-0.24252 -2.54611,-9.85694 h 4.52064 v -5.71666 h -13.95169 v 5.71666 h 4.38212 l 2.88385,11.10421 -1.44625,0.72758 -53.09607,-58.36204 2.69334,-8.02068"/>` +
      `<path fill="${paper}" d="m 366.40523,104.01419 11.44887,19.71388 -3.4641,2.39927 -3.26492,2.65044 -3.03108,2.88434 -2.84056,3.1095 -2.64141,3.31742 -2.36423,3.46465 -2.05247,3.65522 -1.82731,3.79378 -1.54152,3.89773 -1.25577,4.03633 -0.96128,4.08828 -0.66683,4.1316 -0.33774,4.17492 -0.0434,4.22686 -8.02808,0.96145 -1.63676,-3.74183 -1.20378,-1.63705 -1.43761,-1.44651 -1.63678,-1.24726 28.80401,-62.44168"/>` +
      `<path fill="${paper}" d="m 384.05486,134.39918 17.45909,30.33303 -1.15183,1.29923 -0.866,1.4465 -0.57161,1.62838 -34.96145,3.36938 0.0519,-3.75048 0.3724,-3.6985 0.71881,-3.70718 1.01325,-3.60326 1.35098,-3.4993 1.58483,-3.36936 1.87062,-3.22213 2.16505,-3.07486 2.39891,-2.88434 2.64139,-2.6418 2.89252,-2.40793 3.02243,-2.20871"/>` +
      `<path fill="${paper}" d="m 388.67943,131.8007 3.55936,-1.58508 3.65464,-1.20397 3.74989,-0.90946 4.47736,-0.60632 3.20428,-0.1992 3.89712,0.0952 3.80186,0.47638 3.80188,0.76224 3.6979,1.10868 3.61136,1.39451 3.4641,1.77564 3.2649,2.01816 3.12636,2.304 2.88385,2.55516 2.64139,2.83237 2.40756,3.03157 2.11311,3.26542 1.82732,3.40402 1.48956,3.55993 1.20377,3.65522 0.86604,3.75048 0.52826,3.84576 0.23383,3.84577 -0.13854,3.88905 -0.47631,3.84577 -0.82274,3.74184 -1.15183,3.70718 -1.44624,3.60323 -1.77535,3.41268 -2.02651,3.26543 -2.35557,3.08355 -2.5981,2.88431 -2.8319,2.58117 -3.08304,2.40794 -3.25627,2.07013 -3.42081,1.77563 -3.5507,1.4898 -3.70659,1.20396 -3.7499,0.81421 -3.41215,0.5197 -4.28682,0.14731 -3.89713,-0.14731 -3.83649,-0.5197 -3.74989,-0.81421 -4.14825,-1.22995 -3.52473,-1.62838 -3.00512,-1.61106 -3.27358,-2.1221 -3.07438,-2.35597 -2.84057,-2.58983 -2.59808,-2.87565 -2.29498,-3.08355 -2.06977,-3.26543 -1.77539,-3.46465 -1.44626,-3.55126 -1.15181,-3.70718 -0.82271,-3.79381 34.91816,-3.50796 0.91799,1.58508 1.19513,1.34257 1.96586,1.29059 2.84922,1.05671 1.77538,0.14732 1.81863,-0.24254 1.68876,-0.57166 1.58483,-0.90947 1.34233,-1.152 1.10853,-1.4465 0.82272,-1.62838 0.47631,-1.73233 0.14729,-1.8276 -0.24248,-1.77564 -0.58024,-1.7323 -0.86603,-1.54179 -1.1951,-1.39452 -1.39432,-1.1087 -1.6368,-0.81417 -1.73204,-0.47641 -1.78402,-0.13856 -1.81865,0.19066 -17.2599,-30.48029"/>` +
      `<path fill="${paper}" d="m 258.3858,133.34246 3.22163,2.16542 2.98779,2.45123 2.73663,2.69376 2.50282,2.92764 2.26033,3.12684 1.92257,3.30875 1.6801,3.50797 1.34234,3.60323 1.01327,3.70719 0.7188,3.79377 0.33774,3.84577 0.0433,3.84575 -0.33774,3.84577 -0.62355,3.80247 -1.00459,3.74181 -1.29903,3.60325 -1.5935,3.50795 -1.92258,3.36938 -2.1997,3.11818 -2.50281,2.9796 -2.69335,2.74575 -2.97913,2.45123 -3.12635,2.26069 -3.36883,1.91423 -3.46413,1.62838 -3.65461,1.29923 -3.68927,1.01341 -3.80186,0.67563 -3.85383,0.28584 -5.08356,0.0434 -2.60674,-0.38111 -3.80186,-0.67562 -3.74988,-1.00475 -3.59402,-1.35122 -3.4641,-1.62838 -3.36886,-1.91422 -3.12633,-2.26068 -2.93583,-2.50321 -2.73666,-2.73707 -2.73663,-3.43002 -1.87928,-2.72841 -1.92256,-3.3174 -1.58483,-3.50797 -1.29905,-3.65519 -0.9613,-3.74183 -0.62354,-3.7938 -0.33774,-3.84574 0.0519,-3.84577 0.38106,-3.84576 0.71881,-3.80247 1.01324,-3.69851 1.3943,-3.59459 1.68009,-3.46464 1.9659,-3.31741 2.20836,-3.11817 2.55478,-2.9363 2.73664,-2.69377 3.03108,-2.39926 3.17831,-2.16542 3.36885,-1.87091 3.50741,-1.58506 3.64598,-1.24729 4.55528,-1.18665 6.84161,-0.64095 3.84515,0.0519 3.85383,0.4331 3.79318,0.71024 3.7066,1.10004 3.61131,1.39451 -6.01888,18.03352 -1.05654,2.83235 -1.34233,2.74573 -1.58484,2.58984 -1.8273,2.45122 -2.01785,2.26068 -2.20838,2.06149 -1.44625,-0.13856 -1.48955,0.13856 -1.39432,0.3811 -2.45084,1.63705 -1.63679,2.45125 -0.52829,2.88431 0.62356,2.88434 1.63677,2.40792 2.50281,1.58509 2.88389,0.46771 2.87519,-0.66695 2.35559,-1.72366 1.54152,-2.5032 0.43302,-2.92763 -0.72745,-2.84102 -0.76211,-1.24728 6.01022,-8.70493 3.36885,-5.75997 2.97911,-5.9592 4.80647,-12.40346"/></g>`; };
  // decimal comma, one decimal, as on Nordic cycle signs
  const dkm = (km) => (Math.round(+km * 10) / 10).toFixed(1).replace('.', ',');

  // pedestrian and cycle route sign (after a Commons photo from Espoo, Suomenoja: Tapiola / Hagalund 6,0): a blue
  // rectangular plate; inside it a white rim in the shape of an arrow, thin along the sides and widening into a wedge at
  // the tip, because the blue field's point is blunter than the rim's (TS.arrows.plate); the corners beside the point
  // stay blue; the walkers above a bicycle, the name (and its Swedish form below it), the distance before the point
  const pyora = ({ name, alt, km }) => {
    const S = 62, k = dkm(km), L = [name, alt].filter(Boolean).map(String), tip = 60, H = 150, BL = '#1f5fd4';
    const w = Math.max(480, Math.min(1300, 112 + Math.max(...L.map((l) => tw(l) * S)) + 40 + tw(k) * S + 30 + tip));
    const maxw = w - 112 - tw(k) * S - 70 - tip, ah = H - 10, at = 0.73 * ah / 2, rim = 4;
    const arr = TS.arrows.plate({ x: 5, y: 5, w: w - 8, h: ah, dir: 'right', tip: at, r: 4, rTip: 1.5, rNeck: 1.5, outer: '#fff', fill: BL, ink: '#fff',
      margin: 0, band: rim, fieldNeck: -8, fieldTip: 0.6, rField: 2 });
    return svg(w, H, `<rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="7" fill="${BL}" stroke="#c9c9c9" stroke-width="2"/>` + arr.svg +
      walkBike(54, 16, 118, '#fff', BL) +
      (L.length > 1 ? L.map((l, i) => txt(112, 68 + i * 58, l, S, maxw, { fill: '#fff', anchor: 'start', weight: 600 })).join('') : txt(112, 97, L[0], S, maxw, { fill: '#fff', anchor: 'start', weight: 600 })) +
      txt(w - tip - 20, 97, k, S, tw(k) * S + 6, { fill: '#fff', anchor: 'end', weight: 600 }));
  };

  const BILINGUAL = ['Uusimaa', 'Varsinais-Suomi', 'Pohjanmaa', 'Keski-Pohjanmaa', 'Kymenlaakso'];
  TS.add('FI', [
    { id: 'paikannimi', kind: 'entry', label: 'Place name (blue)', draw: paikannimi },
    { id: 'viitta', kind: 'direction', label: 'Arrow sign (blue)', draw: viitta },
    { id: 'ennakko', kind: 'direction', label: 'Advance sign (blue)', draw: ennakko },
    { id: 'moottoritie', kind: 'motorway', label: 'Motorway sign (green)', draw: moottoritie },
    { id: 'pyora', kind: 'bike', label: 'Pedestrian and cycle route sign', draw: pyora },
    { id: 'paikallinen', kind: 'direction', label: 'Local sign, bilingual (white)', regions: BILINGUAL, needs: ['alt'], draw: paikallinen },
  ], { next: 'Suomenoja', road: '5', km: 119 });
})();
