// Peru: facts per department, shared by the Peru map quizzes (peru-codes, peru-regions, peru-power).
// Keys are INEI ubigeo department codes (as in the HDX COD-AB pcodes PE01…PE25).
//   name    official name as on signs
//   cap     capital (GeoNames PPLA / PPLC)
//   tel     landline area code: MTC Plan Técnico Fundamental de Numeración (RS 022-2002-MTC, text of 26/03/2015),
//           section 3 "Zonas y Áreas de Numeración Geográfica"; code 1 covers Lima and Callao
//   road    departmental route prefix: MTC Clasificador de Rutas (DS 011-2016-MTC), checked against the COD_DS11 codes
//           of MTC's 2019 Red Vial Departamental file; CL (Callao): RM 060-2012-MTC/02 (CL-100), MTC routes page
//   area    North / Centre / South / Amazon: picker groups (INEI macro-regions, with Lima and Callao in the Centre)
const PERU_DEPS = {
  '01': { name: 'Amazonas', cap: 'Chachapoyas', tel: '41', road: 'AM', area: 'North' },
  '02': { name: 'Áncash', cap: 'Huaraz', tel: '43', road: 'AN', area: 'Centre' },
  '03': { name: 'Apurímac', cap: 'Abancay', tel: '83', road: 'AP', area: 'South' },
  '04': { name: 'Arequipa', cap: 'Arequipa', tel: '54', road: 'AR', area: 'South' },
  '05': { name: 'Ayacucho', cap: 'Ayacucho', tel: '66', road: 'AY', area: 'South' },
  '06': { name: 'Cajamarca', cap: 'Cajamarca', tel: '76', road: 'CA', area: 'North' },
  '07': { name: 'Callao', cap: 'Callao', tel: '1', road: 'CL', area: 'Centre' },
  '08': { name: 'Cusco', cap: 'Cusco', tel: '84', road: 'CU', area: 'South' },
  '09': { name: 'Huancavelica', cap: 'Huancavelica', tel: '67', road: 'HV', area: 'Centre' },
  '10': { name: 'Huánuco', cap: 'Huánuco', tel: '62', road: 'HU', area: 'Centre' },
  '11': { name: 'Ica', cap: 'Ica', tel: '56', road: 'IC', area: 'Centre' },
  '12': { name: 'Junín', cap: 'Huancayo', tel: '64', road: 'JU', area: 'Centre' },
  '13': { name: 'La Libertad', cap: 'Trujillo', tel: '44', road: 'LI', area: 'North' },
  '14': { name: 'Lambayeque', cap: 'Chiclayo', tel: '74', road: 'LA', area: 'North' },
  '15': { name: 'Lima', cap: 'Lima', tel: '1', road: 'LM', area: 'Centre' },
  '16': { name: 'Loreto', cap: 'Iquitos', tel: '65', road: 'LO', area: 'Amazon' },
  '17': { name: 'Madre de Dios', cap: 'Puerto Maldonado', tel: '82', road: 'MD', area: 'Amazon' },
  '18': { name: 'Moquegua', cap: 'Moquegua', tel: '53', road: 'MO', area: 'South' },
  '19': { name: 'Pasco', cap: 'Cerro de Pasco', tel: '63', road: 'PA', area: 'Centre' },
  '20': { name: 'Piura', cap: 'Piura', tel: '73', road: 'PI', area: 'North' },
  '21': { name: 'Puno', cap: 'Puno', tel: '51', road: 'PU', area: 'South' },
  '22': { name: 'San Martín', cap: 'Moyobamba', tel: '42', road: 'SM', area: 'Amazon' },
  '23': { name: 'Tacna', cap: 'Tacna', tel: '52', road: 'TA', area: 'South' },
  '24': { name: 'Tumbes', cap: 'Tumbes', tel: '72', road: 'TU', area: 'North' },
  '25': { name: 'Ucayali', cap: 'Pucallpa', tel: '61', road: 'UC', area: 'Amazon' },
};
const PERU_AREAS = ['North', 'Centre', 'South', 'Amazon'];
const PERU_STREET = { bounds: [[-18.4, -81.4], [-0.03, -68.65]], maxBounds: [[-26, -92], [6, -58]] };
// Sort by name the way a Spanish speaker would (Á with A).
const byPeruName = (a, b) => PERU_DEPS[a].name.localeCompare(PERU_DEPS[b].name, 'es');
