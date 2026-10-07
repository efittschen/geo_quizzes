// Vietnam: shared helpers over ../vietnam-regions/data.js for the provinces, area-code and road quizzes.
// data.js: each pre-2025 province's name (n), area code (tel), plate codes (pl), ĐT road block (dt), region (reg),
// part of the country (macro) and 2025 province (nw). Regions: the 6 socio-economic regions of Resolution
// 81/2023/QH15, with the central coast split into its north (Thanh Hóa–Thừa Thiên Huế) and south (Đà Nẵng–Bình
// Thuận) halves.

const VN = (() => {
  const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
  const REGIONS = [
    ['NMM', 'Northern Midlands & Mountains', 'Trung du và miền núi phía Bắc', 'N'],
    ['RRD', 'Red River Delta', 'Đồng bằng sông Hồng', 'N'],
    ['NCC', 'North Central Coast', 'Bắc Trung Bộ', 'C'],
    ['SCC', 'South Central Coast', 'Duyên hải Nam Trung Bộ', 'C'],
    ['CH', 'Central Highlands', 'Tây Nguyên', 'C'],
    ['SE', 'Southeast', 'Đông Nam Bộ', 'S'],
    ['MD', 'Mekong Delta', 'Đồng bằng sông Cửu Long', 'S'],
  ].map(([id, en, vi, macro]) => ({ id, en, vi, macro }));
  const MACROS = [['N', 'North', 'Bắc Bộ'], ['C', 'Central', 'Trung Bộ'], ['S', 'South', 'Nam Bộ']].map(([id, en, vi]) => ({ id, en, vi }));
  const REG = Object.fromEntries(REGIONS.map(r => [r.id, r]));
  const MAC = Object.fromEntries(MACROS.map(m => [m.id, m]));
  const byName = (a, b) => R[a].n.localeCompare(R[b].n, 'vi');
  const inRegion = id => DATA.reg.filter(r => r.reg === id).map(r => r.id).sort(byName);
  const ranges = codes => { // ['50','51',…,'59'] -> '50–59'
    const out = []; let s = null, p = null;
    for (const c of codes.map(Number).sort((a, b) => a - b)) { if (p !== null && c === p + 1) { p = c; continue; } if (s !== null) out.push(s === p ? `${s}` : `${s}–${p}`); s = p = c; }
    if (s !== null) out.push(s === p ? `${s}` : `${s}–${p}`);
    return out.join(', ');
  };
  const facts = id => {
    const r = R[id];
    return [`${REG[r.reg].en} · ${MAC[r.macro].en}`, `Area code 0${r.tel} · ĐT ${r.dt[0]}–${r.dt[1]}`, `Since 2025: ${r.nw}`];
  };
  return { R, REGIONS, MACROS, REG, MAC, inRegion, ranges, facts };
})();
