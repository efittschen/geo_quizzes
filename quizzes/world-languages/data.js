// World Scripts & Languages: what is written on signs, and where. Read by ../shared/world-config.js (type 'writing').
//   scripts    [id, name, a letter of it, more places where it is written (besides those of its languages), 1 when
//              its languages are not asked one by one]
//   languages  { id, n: name, s: script, p: places (ids of ../shared/world.js) where it is an official or main sign
//                language, tell: the letters that give it away, t: language tag for fonts, w: [[words on signs, meaning]] }
//   rounds     per kind: [label, items, places to frame]
// A script is asked with a sign in one of its languages; a language is only asked where several share a script.
// Neighbours share words (Skole is Norwegian and Danish): a sign always has a word that only its language has here.
// India's regional scripts are one item here: ../south-asia-scripts/ tells them apart.

const WRITING = {
  scripts: [
    ['latn', 'Latin', 'Aa'],
    ['cyrl', 'Cyrillic', 'Я'],
    ['grek', 'Greek', 'Ω'],
    ['geor', 'Georgian', 'ქ'],
    ['armn', 'Armenian', 'Ա'],
    ['hebr', 'Hebrew', 'א'],
    ['arab', 'Arabic', 'ع'],
    ['ethi', 'Ethiopic', 'አ', 'ERI'],
    ['deva', 'Devanagari', 'अ'],
    ['beng', 'Bengali', 'অ'],
    ['indi', 'India’s regional scripts', 'అ', '', 1],
    ['taml', 'Tamil', 'அ'],
    ['sinh', 'Sinhala', 'අ'],
    ['thaa', 'Thaana', 'ދ'],
    ['tibt', 'Tibetan', 'ཀ', 'IND CHN'],
    ['mymr', 'Burmese', 'က'],
    ['thai', 'Thai', 'ก'],
    ['laoo', 'Lao', 'ກ'],
    ['khmr', 'Khmer', 'ក'],
    ['hani', 'Chinese', '中'],
    ['jpan', 'Japanese', 'あ'],
    ['kore', 'Korean', '한'],
  ],
  rounds: {
    scripts: [
      ['Europe & Middle East', 'cyrl grek hebr arab'],
      ['South Asia', 'deva beng indi taml sinh tibt', 'PAK IND NPL BTN BGD LKA'],
      ['East & Southeast Asia', 'hani jpan kore thai laoo khmr', 'CHN JPN KOR TWN THA LAO KHM SGP'],
    ],
    languages: [
      ['Nordic', 'isl fao nor dan swe fin kal', 'GRL ISL NOR SWE FIN DNK'],
      ['Baltic & Central Europe', 'est lav lit pol ces slk hun', 'EST LVA LTU POL CZE SVK HUN'],
      ['Western Europe', 'gle cym nld deu fra ita spa por cat', 'IRL GBR PRT ESP FRA ITA DEU NLD'],
      ['Balkans & Turkey', 'slv hbs sqi ron tur mlt', 'SVN HRV ROU TUR MLT ALB'],
      ['Europe', 'isl fao nor dan swe fin kal est lav lit pol ces slk hun gle cym nld deu fra ita spa por cat slv hbs sqi ron tur mlt', 'GRL ISL NOR FIN PRT TUR MLT'],
      ['Cyrillic', 'rus ukr bel bul srp mkd kaz kir mon', 'SRB BGR UKR BLR KAZ KGZ MNG'],
      ['Asia & Africa', 'ind msa fil vie swa afr mlg', 'ZAF KEN MDG IDN PHL VNM MYS'],
      ['Asian scripts', 'ara urd hin nep hant hans', 'EGY PAK IND NPL CHN TWN'],
    ],
  },
  languages: [
    /* ---------- Latin: Nordic ---------- */
    { id: 'isl', n: 'Icelandic', s: 'latn', p: 'ISL', tell: 'ð þ æ ö · á é í ó ú ý', t: 'is', w: [
      ['Velkomin', 'welcome'], ['Opið', 'open'], ['Skóli', 'school'], ['Gata', 'street'], ['Þjóðvegur', 'national road'], ['Sjúkrahús', 'hospital'],
      ['Apótek', 'pharmacy'], ['Verslun', 'shop'], ['Kirkja', 'church'], ['Lögreglan', 'police'], ['Bílastæði', 'parking'], ['Sundlaug', 'swimming pool'], ['Til sölu', 'for sale'], ['Brauð', 'bread']] },
    { id: 'fao', n: 'Faroese', s: 'latn', p: 'FRO', tell: 'ð ø æ · á í ó ú ý', t: 'fo', w: [
      ['Vælkomin', 'welcome'], ['Opið', 'open'], ['Skúli', 'school'], ['Gøta', 'street'], ['Vegur', 'road'], ['Sjúkrahús', 'hospital'],
      ['Handil', 'shop'], ['Kirkja', 'church'], ['Bókasavn', 'library'], ['Føroyar', 'Faroe Islands'], ['Til sølu', 'for sale'], ['Breyð', 'bread']] },
    { id: 'nor', n: 'Norwegian', s: 'latn', p: 'NOR SJM', tell: 'å ø æ · -vei, gate · åpent, sykehus', t: 'nb', w: [
      ['Velkommen', 'welcome'], ['Åpent', 'open'], ['Skole', 'school'], ['Gate', 'street'], ['Vei', 'road'], ['Sykehus', 'hospital'],
      ['Apotek', 'pharmacy'], ['Butikk', 'shop'], ['Kirke', 'church'], ['Politi', 'police'], ['Til salgs', 'for sale'], ['Innkjøring forbudt', 'no entry'], ['Kjøpesenter', 'shopping centre'], ['Brød', 'bread']] },
    { id: 'dan', n: 'Danish', s: 'latn', p: 'DNK FRO GRL', tell: 'å ø æ · -vej, gade · åbent, sygehus', t: 'da', w: [
      ['Velkommen', 'welcome'], ['Åbent', 'open'], ['Skole', 'school'], ['Gade', 'street'], ['Vej', 'road'], ['Sygehus', 'hospital'],
      ['Apotek', 'pharmacy'], ['Købmand', 'grocer'], ['Kirke', 'church'], ['Politi', 'police'], ['Til salg', 'for sale'], ['Indkørsel forbudt', 'no entry'], ['Udsalg', 'sale'], ['Brød', 'bread']] },
    { id: 'swe', n: 'Swedish', s: 'latn', p: 'SWE FIN ALD', tell: 'å ä ö', t: 'sv', w: [
      ['Välkommen', 'welcome'], ['Öppet', 'open'], ['Skola', 'school'], ['Gata', 'street'], ['Väg', 'road'], ['Sjukhus', 'hospital'],
      ['Apotek', 'pharmacy'], ['Affär', 'shop'], ['Kyrka', 'church'], ['Polis', 'police'], ['Till salu', 'for sale'], ['Infart förbjuden', 'no entry'], ['Järnvägsstation', 'railway station'], ['Bröd', 'bread']] },
    { id: 'fin', n: 'Finnish', s: 'latn', p: 'FIN', tell: 'ä ö · double letters · -katu, -tie', t: 'fi', w: [
      ['Tervetuloa', 'welcome'], ['Avoinna', 'open'], ['Koulu', 'school'], ['Katu', 'street'], ['Tie', 'road'], ['Sairaala', 'hospital'],
      ['Apteekki', 'pharmacy'], ['Kauppa', 'shop'], ['Kirkko', 'church'], ['Poliisi', 'police'], ['Myytävänä', 'for sale'], ['Pysäköinti', 'parking'], ['Rautatieasema', 'railway station'], ['Leipä', 'bread']] },
    { id: 'kal', n: 'Greenlandic', s: 'latn', p: 'GRL', tell: 'q · long words · -suaq, -miut', t: 'kl', w: [
      ['Tikilluarit', 'welcome'], ['Atuarfik', 'school'], ['Aqqusineq', 'road'], ['Napparsimmavik', 'hospital'], ['Pisiniarfik', 'shop'],
      ['Oqaluffik', 'church'], ['Kalaallit Nunaat', 'Greenland'], ['Qujanaq', 'thank you']] },
    /* ---------- Latin: Baltic and Central Europe ---------- */
    { id: 'est', n: 'Estonian', s: 'latn', p: 'EST', tell: 'õ ä ö ü · double vowels', t: 'et', w: [
      ['Tere tulemast', 'welcome'], ['Avatud', 'open'], ['Kool', 'school'], ['Tänav', 'street'], ['Maantee', 'highway'], ['Haigla', 'hospital'],
      ['Apteek', 'pharmacy'], ['Kauplus', 'shop'], ['Kirik', 'church'], ['Politsei', 'police'], ['Müüa', 'for sale'], ['Parkla', 'car park'], ['Raudteejaam', 'railway station'], ['Söökla', 'canteen']] },
    { id: 'lav', n: 'Latvian', s: 'latn', p: 'LVA', tell: 'ā ē ī ū · ģ ķ ļ ņ · č š ž', t: 'lv', w: [
      ['Laipni lūdzam', 'welcome'], ['Atvērts', 'open'], ['Skola', 'school'], ['Iela', 'street'], ['Ceļš', 'road'], ['Slimnīca', 'hospital'],
      ['Aptieka', 'pharmacy'], ['Veikals', 'shop'], ['Baznīca', 'church'], ['Policija', 'police'], ['Pārdod', 'for sale'], ['Stāvvieta', 'parking'], ['Dzelzceļa stacija', 'railway station'], ['Maize', 'bread']] },
    { id: 'lit', n: 'Lithuanian', s: 'latn', p: 'LTU', tell: 'ą ę ė į ų ū · č š ž', t: 'lt', w: [
      ['Sveiki atvykę', 'welcome'], ['Atidaryta', 'open'], ['Mokykla', 'school'], ['Gatvė', 'street'], ['Kelias', 'road'], ['Ligoninė', 'hospital'],
      ['Vaistinė', 'pharmacy'], ['Parduotuvė', 'shop'], ['Bažnyčia', 'church'], ['Policija', 'police'], ['Parduodama', 'for sale'], ['Geležinkelio stotis', 'railway station'], ['Dėmesio', 'caution'], ['Duona', 'bread']] },
    { id: 'pol', n: 'Polish', s: 'latn', p: 'POL', tell: 'ą ę ł ń ó ś ź ż ć · sz cz rz', t: 'pl', w: [
      ['Witamy', 'welcome'], ['Otwarte', 'open'], ['Szkoła', 'school'], ['Ulica', 'street'], ['Droga', 'road'], ['Szpital', 'hospital'],
      ['Apteka', 'pharmacy'], ['Sklep', 'shop'], ['Kościół', 'church'], ['Policja', 'police'], ['Na sprzedaż', 'for sale'], ['Uwaga', 'caution'], ['Dworzec kolejowy', 'railway station'], ['Wyjście', 'exit']] },
    { id: 'ces', n: 'Czech', s: 'latn', p: 'CZE', tell: 'ě ř ů · č š ž · á é í ý', t: 'cs', w: [
      ['Vítejte', 'welcome'], ['Otevřeno', 'open'], ['Škola', 'school'], ['Ulice', 'street'], ['Silnice', 'road'], ['Nemocnice', 'hospital'],
      ['Lékárna', 'pharmacy'], ['Obchod', 'shop'], ['Kostel', 'church'], ['Policie', 'police'], ['Na prodej', 'for sale'], ['Pozor', 'caution'], ['Nádraží', 'railway station'], ['Průjezd zakázán', 'no through traffic']] },
    { id: 'slk', n: 'Slovak', s: 'latn', p: 'SVK', tell: 'ľ ĺ ŕ ô ä · ť ď ň · no ě ř ů', t: 'sk', w: [
      ['Vitajte', 'welcome'], ['Otvorené', 'open'], ['Škola', 'school'], ['Ulica', 'street'], ['Cesta', 'road'], ['Nemocnica', 'hospital'],
      ['Lekáreň', 'pharmacy'], ['Obchod', 'shop'], ['Kostol', 'church'], ['Polícia', 'police'], ['Na predaj', 'for sale'], ['Železničná stanica', 'railway station'], ['Reštaurácia', 'restaurant'], ['Východ', 'exit']] },
    { id: 'hun', n: 'Hungarian', s: 'latn', p: 'HUN', tell: 'ő ű · á é í ó ö ú ü · sz gy cs zs', t: 'hu', w: [
      ['Üdvözöljük', 'welcome'], ['Nyitva', 'open'], ['Iskola', 'school'], ['Utca', 'street'], ['Út', 'road'], ['Kórház', 'hospital'],
      ['Gyógyszertár', 'pharmacy'], ['Üzlet', 'shop'], ['Templom', 'church'], ['Rendőrség', 'police'], ['Eladó', 'for sale'], ['Vasútállomás', 'railway station'], ['Étterem', 'restaurant'], ['Behajtani tilos', 'no entry']] },
    /* ---------- Latin: Western Europe ---------- */
    { id: 'gle', n: 'Irish', s: 'latn', p: 'IRL', tell: 'á é í ó ú · bh mh dh', t: 'ga', w: [
      ['Fáilte', 'welcome'], ['Scoil', 'school'], ['Sráid', 'street'], ['Bóthar', 'road'], ['Ospidéal', 'hospital'], ['Siopa', 'shop'],
      ['Séipéal', 'chapel'], ['Géill slí', 'yield'], ['Go mall', 'slow'], ['An Lár', 'city centre'], ['Oifig an Phoist', 'post office'], ['Ar díol', 'for sale']] },
    { id: 'cym', n: 'Welsh', s: 'latn', p: 'GBR', tell: 'w y as vowels · ll dd ff · ŵ ŷ', t: 'cy', w: [
      ['Croeso', 'welcome'], ['Ar agor', 'open'], ['Ysgol', 'school'], ['Stryd', 'street'], ['Ffordd', 'road'], ['Ysbyty', 'hospital'],
      ['Siop', 'shop'], ['Eglwys', 'church'], ['Heddlu', 'police'], ['Araf', 'slow'], ['Ar werth', 'for sale'], ['Gorsaf', 'station'], ['Canol y dref', 'town centre'], ['Llwybr cyhoeddus', 'public footpath']] },
    { id: 'nld', n: 'Dutch', s: 'latn', p: 'NLD BEL SUR CUW ABW SXM', tell: 'ij · aa ee oo uu · sch', t: 'nl', w: [
      ['Welkom', 'welcome'], ['Geopend', 'open'], ['School', 'school'], ['Straat', 'street'], ['Weg', 'road'], ['Ziekenhuis', 'hospital'],
      ['Apotheek', 'pharmacy'], ['Winkel', 'shop'], ['Kerk', 'church'], ['Politie', 'police'], ['Te koop', 'for sale'], ['Let op', 'caution'], ['Fietspad', 'cycle path'], ['Verboden toegang', 'no entry']] },
    { id: 'deu', n: 'German', s: 'latn', p: 'DEU AUT CHE LIE LUX BEL', tell: 'ä ö ü ß · sch · capital nouns', t: 'de', w: [
      ['Willkommen', 'welcome'], ['Geöffnet', 'open'], ['Schule', 'school'], ['Straße', 'street'], ['Weg', 'way'], ['Krankenhaus', 'hospital'],
      ['Apotheke', 'pharmacy'], ['Bäckerei', 'bakery'], ['Kirche', 'church'], ['Polizei', 'police'], ['Zu verkaufen', 'for sale'], ['Achtung', 'caution'], ['Bahnhof', 'railway station'], ['Einfahrt freihalten', 'keep entrance clear']] },
    { id: 'fra', n: 'French', s: 'latn', t: 'fr', tell: 'é è ê à ç ù · œ · eau, -aux',
      p: 'FRA BEL CHE LUX MCO CAN HTI BEN BFA BDI CMR CAF TCD COM COG COD CIV DJI GNQ GAB GIN MDG MLI NER RWA SEN SYC TGO VUT MUS TUN DZA MAR MRT LBN GUF GLP MTQ MYT REU NCL PYF SPM WLF BLM MAF ATF', w: [
      ['Bienvenue', 'welcome'], ['Ouvert', 'open'], ['École', 'school'], ['Rue', 'street'], ['Route', 'road'], ['Hôpital', 'hospital'],
      ['Pharmacie', 'pharmacy'], ['Boulangerie', 'bakery'], ['Église', 'church'], ['Mairie', 'town hall'], ['À vendre', 'for sale'], ['Attention', 'caution'], ['Gare', 'railway station'], ['Cédez le passage', 'yield']] },
    { id: 'ita', n: 'Italian', s: 'latn', p: 'ITA SMR CHE VAT', tell: 'à è é ì ò ù · gli · -zione', t: 'it', w: [
      ['Benvenuti', 'welcome'], ['Aperto', 'open'], ['Scuola', 'school'], ['Via', 'street'], ['Strada', 'road'], ['Ospedale', 'hospital'],
      ['Farmacia', 'pharmacy'], ['Panificio', 'bakery'], ['Chiesa', 'church'], ['Carabinieri', 'police'], ['Vendesi', 'for sale'], ['Attenzione', 'caution'], ['Stazione', 'station'], ['Senso unico', 'one way']] },
    { id: 'spa', n: 'Spanish', s: 'latn', t: 'es', tell: 'ñ · ¿ ¡ · á é í ó ú · ll',
      p: 'ESP MEX GTM SLV HND NIC CRI PAN CUB DOM PRI COL VEN ECU PER BOL CHL ARG URY PRY GNQ', w: [
      ['Bienvenidos', 'welcome'], ['Abierto', 'open'], ['Escuela', 'school'], ['Calle', 'street'], ['Carretera', 'road'], ['Hospital', 'hospital'],
      ['Farmacia', 'pharmacy'], ['Panadería', 'bakery'], ['Iglesia', 'church'], ['Policía', 'police'], ['Se vende', 'for sale'], ['Cuidado', 'caution'], ['Estación', 'station'], ['Ceda el paso', 'yield'], ['Niños', 'children']] },
    { id: 'por', n: 'Portuguese', s: 'latn', p: 'PRT BRA AGO MOZ CPV GNB STP TLS MAC', tell: 'ã õ · ç · â ê ô · lh nh', t: 'pt', w: [
      ['Bem-vindo', 'welcome'], ['Aberto', 'open'], ['Escola', 'school'], ['Rua', 'street'], ['Estrada', 'road'], ['Hospital', 'hospital'],
      ['Farmácia', 'pharmacy'], ['Padaria', 'bakery'], ['Igreja', 'church'], ['Polícia', 'police'], ['Vende-se', 'for sale'], ['Atenção', 'caution'], ['Estação', 'station'], ['Informações', 'information'], ['Pão', 'bread']] },
    { id: 'cat', n: 'Catalan', s: 'latn', p: 'AND ESP', tell: 'ç · l·l · à è ò · ny · carrer', t: 'ca', w: [
      ['Benvinguts', 'welcome'], ['Obert', 'open'], ['Escola', 'school'], ['Carrer', 'street'], ['Carretera', 'road'], ['Farmàcia', 'pharmacy'],
      ['Forn de pa', 'bakery'], ['Església', 'church'], ['Ajuntament', 'town hall'], ['En venda', 'for sale'], ['Atenció', 'caution'], ['Estació', 'station'], ['Sortida', 'exit'], ['Platja', 'beach'], ['Col·legi', 'school']] },
    /* ---------- Latin: Balkans and Turkey ---------- */
    { id: 'slv', n: 'Slovenian', s: 'latn', p: 'SVN', tell: 'č š ž · no ć đ', t: 'sl', w: [
      ['Dobrodošli', 'welcome'], ['Odprto', 'open'], ['Šola', 'school'], ['Ulica', 'street'], ['Cesta', 'road'], ['Bolnišnica', 'hospital'],
      ['Lekarna', 'pharmacy'], ['Trgovina', 'shop'], ['Cerkev', 'church'], ['Policija', 'police'], ['Prodamo', 'for sale'], ['Pozor', 'caution'], ['Železniška postaja', 'railway station'], ['Izhod', 'exit']] },
    { id: 'hbs', n: 'Croatian, Bosnian, Serbian', s: 'latn', p: 'HRV BIH SRB MNE KOS', tell: 'č ć đ š ž · lj nj', t: 'hr', w: [
      ['Dobrodošli', 'welcome'], ['Otvoreno', 'open'], ['Škola', 'school'], ['Ulica', 'street'], ['Cesta', 'road'], ['Bolnica', 'hospital'],
      ['Ljekarna', 'pharmacy'], ['Trgovina', 'shop'], ['Crkva', 'church'], ['Policija', 'police'], ['Prodaje se', 'for sale'], ['Pažnja', 'caution'], ['Pekara', 'bakery'], ['Izlaz', 'exit'], ['Općina', 'municipality']] },
    { id: 'sqi', n: 'Albanian', s: 'latn', p: 'ALB KOS MKD', tell: 'ë ç · sh xh zh · q', t: 'sq', w: [
      ['Mirë se vini', 'welcome'], ['Hapur', 'open'], ['Shkolla', 'school'], ['Rruga', 'street'], ['Spitali', 'hospital'], ['Farmaci', 'pharmacy'],
      ['Dyqan', 'shop'], ['Kisha', 'church'], ['Xhamia', 'mosque'], ['Policia', 'police'], ['Shitet', 'for sale'], ['Kujdes', 'caution'], ['Bukë', 'bread'], ['Hyrje', 'entrance'], ['Bashkia', 'municipality']] },
    { id: 'ron', n: 'Romanian', s: 'latn', p: 'ROU MDA', tell: 'ă â î ș ț', t: 'ro', w: [
      ['Bine ați venit', 'welcome'], ['Deschis', 'open'], ['Școală', 'school'], ['Strada', 'street'], ['Drum', 'road'], ['Spital', 'hospital'],
      ['Farmacie', 'pharmacy'], ['Magazin', 'shop'], ['Biserică', 'church'], ['Poliția', 'police'], ['De vânzare', 'for sale'], ['Atenție', 'caution'], ['Gară', 'railway station'], ['Ieșire', 'exit'], ['Pâine', 'bread']] },
    { id: 'tur', n: 'Turkish', s: 'latn', p: 'TUR CYP', tell: 'ç ğ ı İ ö ş ü', t: 'tr', w: [
      ['Hoş geldiniz', 'welcome'], ['Açık', 'open'], ['Okul', 'school'], ['Sokak', 'street'], ['Cadde', 'avenue'], ['Hastane', 'hospital'],
      ['Eczane', 'pharmacy'], ['Mağaza', 'shop'], ['Cami', 'mosque'], ['Polis', 'police'], ['Satılık', 'for sale'], ['Dikkat', 'caution'], ['İstasyon', 'station'], ['Çıkış', 'exit'], ['Ekmek', 'bread']] },
    { id: 'mlt', n: 'Maltese', s: 'latn', p: 'MLT', tell: 'ċ ġ ħ ż · għ · triq', t: 'mt', w: [
      ['Merħba', 'welcome'], ['Miftuħ', 'open'], ['Skola', 'school'], ['Triq', 'street'], ['Sqaq', 'alley'], ['Sptar', 'hospital'],
      ['Spiżerija', 'pharmacy'], ['Ħanut', 'shop'], ['Knisja', 'church'], ['Pulizija', 'police'], ['Għall-bejgħ', 'for sale'], ['Pjazza', 'square'], ['Ħobż', 'bread']] },
    /* ---------- Latin: Asia and Africa ---------- */
    { id: 'ind', n: 'Indonesian', s: 'latn', p: 'IDN', tell: 'no accents · kantor, polisi, apotek', t: 'id', w: [
      ['Selamat datang', 'welcome'], ['Buka', 'open'], ['Sekolah', 'school'], ['Jalan', 'street'], ['Rumah sakit', 'hospital'], ['Apotek', 'pharmacy'],
      ['Toko', 'shop'], ['Masjid', 'mosque'], ['Kantor polisi', 'police station'], ['Dijual', 'for sale'], ['Hati-hati', 'caution'], ['Stasiun', 'station'], ['Dilarang parkir', 'no parking'], ['Warung', 'food stall'], ['Kantor pos', 'post office']] },
    { id: 'msa', n: 'Malay', s: 'latn', p: 'MYS BRN SGP', tell: 'no accents · pejabat, polis, farmasi', t: 'ms', w: [
      ['Selamat datang', 'welcome'], ['Buka', 'open'], ['Sekolah', 'school'], ['Jalan', 'street'], ['Hospital', 'hospital'], ['Farmasi', 'pharmacy'],
      ['Kedai', 'shop'], ['Masjid', 'mosque'], ['Balai polis', 'police station'], ['Untuk dijual', 'for sale'], ['Awas', 'caution'], ['Stesen', 'station'], ['Dilarang meletak kenderaan', 'no parking'], ['Lebuhraya', 'expressway'], ['Pejabat pos', 'post office']] },
    { id: 'fil', n: 'Filipino', s: 'latn', p: 'PHL', tell: 'ng · mga · bawal', t: 'fil', w: [
      ['Mabuhay', 'welcome'], ['Maligayang pagdating', 'welcome'], ['Bukas', 'open'], ['Paaralan', 'school'], ['Kalye', 'street'], ['Daan', 'road'],
      ['Pagamutan', 'hospital'], ['Botika', 'pharmacy'], ['Tindahan', 'shop'], ['Simbahan', 'church'], ['Pulis', 'police'], ['Ipinagbibili', 'for sale'], ['Mag-ingat', 'caution'], ['Bawal pumarada', 'no parking'], ['Bawal magtapon ng basura', 'no littering']] },
    { id: 'vie', n: 'Vietnamese', s: 'latn', p: 'VNM', tell: 'ă â ê ô ơ ư đ · stacked accents', t: 'vi', w: [
      ['Kính chào quý khách', 'welcome'], ['Mở cửa', 'open'], ['Trường học', 'school'], ['Đường', 'street'], ['Bệnh viện', 'hospital'], ['Nhà thuốc', 'pharmacy'],
      ['Cửa hàng', 'shop'], ['Nhà thờ', 'church'], ['Công an', 'police'], ['Bán nhà', 'house for sale'], ['Chú ý', 'caution'], ['Cấm đỗ xe', 'no parking'], ['Ủy ban nhân dân', 'people’s committee'], ['Phở', 'noodle soup']] },
    { id: 'swa', n: 'Swahili', s: 'latn', p: 'KEN TZA UGA RWA', tell: 'no accents · karibu · m-, wa-, ki-', t: 'sw', w: [
      ['Karibu', 'welcome'], ['Shule', 'school'], ['Barabara', 'road'], ['Hospitali', 'hospital'], ['Duka la dawa', 'pharmacy'], ['Duka', 'shop'],
      ['Kanisa', 'church'], ['Msikiti', 'mosque'], ['Polisi', 'police'], ['Inauzwa', 'for sale'], ['Hatari', 'danger'], ['Soko', 'market'], ['Shule ya msingi', 'primary school'], ['Maji', 'water']] },
    { id: 'afr', n: 'Afrikaans', s: 'latn', p: 'ZAF NAM', tell: 'ê ë ô û · ’n · oe · -heid', t: 'af', w: [
      ['Welkom', 'welcome'], ['Oop', 'open'], ['Skool', 'school'], ['Straat', 'street'], ['Pad', 'road'], ['Hospitaal', 'hospital'],
      ['Apteek', 'pharmacy'], ['Winkel', 'shop'], ['Kerk', 'church'], ['Polisie', 'police'], ['Te koop', 'for sale'], ['Gevaar', 'danger'], ['Slaghuis', 'butcher'], ['Geen toegang', 'no entry'], ['Padwerke', 'roadworks']] },
    { id: 'mlg', n: 'Malagasy', s: 'latn', p: 'MDG', tell: 'long words · -ana, -ina · tsy', t: 'mg', w: [
      ['Tongasoa', 'welcome'], ['Sekoly', 'school'], ['Lalana', 'road'], ['Hopitaly', 'hospital'], ['Fivarotam-panafody', 'pharmacy'], ['Fivarotana', 'shop'],
      ['Fiangonana', 'church'], ['Polisy', 'police'], ['Amidy', 'for sale'], ['Tandremo', 'caution'], ['Tsena', 'market'], ['Fokontany', 'neighbourhood'], ['Misaotra', 'thank you']] },
    /* ---------- Cyrillic ---------- */
    { id: 'rus', n: 'Russian', s: 'cyrl', p: 'RUS BLR KAZ KGZ', tell: 'ы э ё ъ · no і ї ў', t: 'ru', w: [
      ['Добро пожаловать', 'welcome'], ['Открыто', 'open'], ['Школа', 'school'], ['Улица', 'street'], ['Дорога', 'road'], ['Больница', 'hospital'],
      ['Аптека', 'pharmacy'], ['Магазин', 'shop'], ['Церковь', 'church'], ['Полиция', 'police'], ['Продаётся', 'for sale'], ['Внимание', 'caution'], ['Вокзал', 'railway station'], ['Выход', 'exit'], ['Продукты', 'groceries'], ['Хлеб', 'bread']] },
    { id: 'ukr', n: 'Ukrainian', s: 'cyrl', p: 'UKR', tell: 'і ї є ґ · no ы э ё ъ', t: 'uk', w: [
      ['Ласкаво просимо', 'welcome'], ['Відчинено', 'open'], ['Школа', 'school'], ['Вулиця', 'street'], ['Дорога', 'road'], ['Лікарня', 'hospital'],
      ['Аптека', 'pharmacy'], ['Крамниця', 'shop'], ['Церква', 'church'], ['Поліція', 'police'], ['Продається', 'for sale'], ['Увага', 'caution'], ['Вокзал', 'railway station'], ['Вихід', 'exit'], ['Продукти', 'groceries'], ['Їдальня', 'canteen']] },
    { id: 'bel', n: 'Belarusian', s: 'cyrl', p: 'BLR', tell: 'ў і · э ы · no и щ', t: 'be', w: [
      ['Сардэчна запрашаем', 'welcome'], ['Адчынена', 'open'], ['Школа', 'school'], ['Вуліца', 'street'], ['Дарога', 'road'], ['Бальніца', 'hospital'],
      ['Аптэка', 'pharmacy'], ['Крама', 'shop'], ['Царква', 'church'], ['Міліцыя', 'police'], ['Прадаецца', 'for sale'], ['Увага', 'caution'], ['Вакзал', 'railway station'], ['Выхад', 'exit'], ['Прадукты', 'groceries']] },
    { id: 'bul', n: 'Bulgarian', s: 'cyrl', p: 'BGR', tell: 'ъ as a vowel · щ · no ы э', t: 'bg', w: [
      ['Добре дошли', 'welcome'], ['Отворено', 'open'], ['Училище', 'school'], ['Улица', 'street'], ['Път', 'road'], ['Болница', 'hospital'],
      ['Аптека', 'pharmacy'], ['Магазин', 'shop'], ['Църква', 'church'], ['Полиция', 'police'], ['Продава се', 'for sale'], ['Внимание', 'caution'], ['Гара', 'railway station'], ['Изход', 'exit'], ['Хранителни стоки', 'groceries'], ['Община', 'municipality']] },
    { id: 'srp', n: 'Serbian', s: 'cyrl', p: 'SRB BIH MNE KOS', tell: 'ђ ћ љ њ џ ј', t: 'sr', w: [
      ['Добро дошли', 'welcome'], ['Отворено', 'open'], ['Школа', 'school'], ['Улица', 'street'], ['Пут', 'road'], ['Болница', 'hospital'],
      ['Апотека', 'pharmacy'], ['Продавница', 'shop'], ['Црква', 'church'], ['Полиција', 'police'], ['Продаје се', 'for sale'], ['Пажња', 'caution'], ['Станица', 'station'], ['Излаз', 'exit'], ['Пекара', 'bakery'], ['Општина', 'municipality']] },
    { id: 'mkd', n: 'Macedonian', s: 'cyrl', p: 'MKD', tell: 'ѓ ќ ѕ · љ њ џ ј', t: 'mk', w: [
      ['Добредојдовте', 'welcome'], ['Отворено', 'open'], ['Училиште', 'school'], ['Улица', 'street'], ['Пат', 'road'], ['Болница', 'hospital'],
      ['Аптека', 'pharmacy'], ['Продавница', 'shop'], ['Црква', 'church'], ['Полиција', 'police'], ['Се продава', 'for sale'], ['Внимание', 'caution'], ['Станица', 'station'], ['Излез', 'exit'], ['Куќа', 'house'], ['Општина', 'municipality']] },
    { id: 'kaz', n: 'Kazakh', s: 'cyrl', p: 'KAZ', tell: 'ә ғ қ ң ө ұ ү һ і', t: 'kk', w: [
      ['Қош келдіңіздер', 'welcome'], ['Ашық', 'open'], ['Мектеп', 'school'], ['Көше', 'street'], ['Жол', 'road'], ['Аурухана', 'hospital'],
      ['Дәріхана', 'pharmacy'], ['Дүкен', 'shop'], ['Мешіт', 'mosque'], ['Полиция', 'police'], ['Сатылады', 'for sale'], ['Назар аударыңыз', 'caution'], ['Шығу', 'exit'], ['Азық-түлік', 'groceries'], ['Нан', 'bread'], ['Әкімдік', 'town hall']] },
    { id: 'kir', n: 'Kyrgyz', s: 'cyrl', p: 'KGZ', tell: 'ң ө ү · no ә ғ қ ұ', t: 'ky', w: [
      ['Кош келиңиздер', 'welcome'], ['Ачык', 'open'], ['Мектеп', 'school'], ['Көчө', 'street'], ['Жол', 'road'], ['Оорукана', 'hospital'],
      ['Дарыкана', 'pharmacy'], ['Дүкөн', 'shop'], ['Мечит', 'mosque'], ['Милиция', 'police'], ['Сатылат', 'for sale'], ['Көңүл буруңуз', 'caution'], ['Чыгуу', 'exit'], ['Азык-түлүк', 'groceries'], ['Нан', 'bread'], ['Айыл өкмөтү', 'village government']] },
    { id: 'mon', n: 'Mongolian', s: 'cyrl', p: 'MNG', tell: 'ө ү · doubled vowels', t: 'mn', w: [
      ['Тавтай морилно уу', 'welcome'], ['Нээлттэй', 'open'], ['Сургууль', 'school'], ['Гудамж', 'street'], ['Зам', 'road'], ['Эмнэлэг', 'hospital'],
      ['Эмийн сан', 'pharmacy'], ['Дэлгүүр', 'shop'], ['Сүм', 'temple'], ['Цагдаа', 'police'], ['Зарна', 'for sale'], ['Анхаар', 'caution'], ['Гарц', 'exit'], ['Хүнсний дэлгүүр', 'grocery shop'], ['Талх', 'bread']] },
    { id: 'tgk', n: 'Tajik', s: 'cyrl', p: 'TJK', tell: 'ӣ ӯ ҷ ҳ қ ғ', t: 'tg', w: [
      ['Хуш омадед', 'welcome'], ['Кушода', 'open'], ['Мактаб', 'school'], ['Кӯча', 'street'], ['Роҳ', 'road'], ['Беморхона', 'hospital'],
      ['Дорухона', 'pharmacy'], ['Мағоза', 'shop'], ['Масҷид', 'mosque'], ['Милитсия', 'police'], ['Баромад', 'exit'], ['Нон', 'bread']] },
    /* ---------- other scripts ---------- */
    { id: 'ell', n: 'Greek', s: 'grek', p: 'GRC CYP', t: 'el', w: [
      ['Καλώς ήρθατε', 'welcome'], ['Ανοιχτό', 'open'], ['Σχολείο', 'school'], ['Οδός', 'street'], ['Νοσοκομείο', 'hospital'], ['Φαρμακείο', 'pharmacy'],
      ['Αρτοποιείο', 'bakery'], ['Εκκλησία', 'church'], ['Αστυνομία', 'police'], ['Πωλείται', 'for sale'], ['Προσοχή', 'caution'], ['Σταθμός', 'station'], ['Έξοδος', 'exit']] },
    { id: 'kat', n: 'Georgian', s: 'geor', p: 'GEO', t: 'ka', w: [
      ['კეთილი იყოს თქვენი მობრძანება', 'welcome'], ['ღიაა', 'open'], ['სკოლა', 'school'], ['ქუჩა', 'street'], ['საავადმყოფო', 'hospital'], ['აფთიაქი', 'pharmacy'],
      ['მაღაზია', 'shop'], ['ეკლესია', 'church'], ['პოლიცია', 'police'], ['იყიდება', 'for sale'], ['ყურადღება', 'caution'], ['სადგური', 'station'], ['პური', 'bread']] },
    { id: 'hye', n: 'Armenian', s: 'armn', p: 'ARM', t: 'hy', w: [
      ['Բարի գալուստ', 'welcome'], ['Բաց է', 'open'], ['Դպրոց', 'school'], ['Փողոց', 'street'], ['Հիվանդանոց', 'hospital'], ['Դեղատուն', 'pharmacy'],
      ['Խանութ', 'shop'], ['Եկեղեցի', 'church'], ['Ոստիկանություն', 'police'], ['Վաճառվում է', 'for sale'], ['Ուշադրություն', 'caution'], ['Կայարան', 'station'], ['Հաց', 'bread']] },
    { id: 'heb', n: 'Hebrew', s: 'hebr', p: 'ISR', t: 'he', w: [
      ['ברוכים הבאים', 'welcome'], ['פתוח', 'open'], ['בית ספר', 'school'], ['רחוב', 'street'], ['כביש', 'road'], ['בית חולים', 'hospital'],
      ['בית מרקחת', 'pharmacy'], ['חנות', 'shop'], ['בית כנסת', 'synagogue'], ['משטרה', 'police'], ['למכירה', 'for sale'], ['זהירות', 'caution'], ['תחנה', 'station'], ['יציאה', 'exit'], ['עצור', 'stop']] },
    { id: 'ara', n: 'Arabic', s: 'arab', t: 'ar', tell: 'ة · ال · no پ چ گ',
      p: 'DZA BHR TCD COM DJI EGY ERI IRQ ISR JOR KWT LBN LBY MRT MAR OMN PSX QAT SAU SOM SDN SYR TUN ARE YEM SAH', w: [
      ['أهلاً وسهلاً', 'welcome'], ['مفتوح', 'open'], ['مدرسة', 'school'], ['شارع', 'street'], ['طريق', 'road'], ['مستشفى', 'hospital'],
      ['صيدلية', 'pharmacy'], ['مطعم', 'restaurant'], ['مسجد', 'mosque'], ['الشرطة', 'police'], ['للبيع', 'for sale'], ['انتبه', 'caution'], ['محطة', 'station'], ['مخرج', 'exit'], ['قف', 'stop'], ['خبز', 'bread']] },
    { id: 'fas', n: 'Persian', s: 'arab', p: 'IRN AFG', tell: 'پ چ ژ گ', t: 'fa', w: [
      ['خوش آمدید', 'welcome'], ['باز است', 'open'], ['مدرسه', 'school'], ['خیابان', 'street'], ['جاده', 'road'], ['بیمارستان', 'hospital'],
      ['داروخانه', 'pharmacy'], ['فروشگاه', 'shop'], ['مسجد', 'mosque'], ['پلیس', 'police'], ['فروشی', 'for sale'], ['توجه', 'caution'], ['ایستگاه', 'station'], ['خروج', 'exit'], ['ایست', 'stop'], ['نان', 'bread']] },
    { id: 'urd', n: 'Urdu', s: 'arab', p: 'PAK IND', tell: 'ٹ ڈ ڑ ے ں ھ · hanging script', t: 'ur', w: [
      ['خوش آمدید', 'welcome'], ['کھلا ہے', 'open'], ['اسکول', 'school'], ['سڑک', 'road'], ['ہسپتال', 'hospital'], ['دکان', 'shop'],
      ['مسجد', 'mosque'], ['پولیس', 'police'], ['برائے فروخت', 'for sale'], ['خبردار', 'caution'], ['آہستہ چلیں', 'go slowly'], ['ڈاک خانہ', 'post office'], ['روٹی', 'bread']] },
    { id: 'amh', n: 'Amharic', s: 'ethi', p: 'ETH', t: 'am', w: [
      ['እንኳን ደህና መጡ', 'welcome'], ['ትምህርት ቤት', 'school'], ['መንገድ', 'road'], ['ሆስፒታል', 'hospital'], ['ፋርማሲ', 'pharmacy'], ['ሱቅ', 'shop'],
      ['ቤተ ክርስቲያን', 'church'], ['ፖሊስ', 'police'], ['ኢትዮጵያ', 'Ethiopia'], ['ቡና', 'coffee']] },
    { id: 'hin', n: 'Hindi', s: 'deva', p: 'IND', tell: 'है · का की के', t: 'hi', w: [
      ['स्वागत है', 'welcome'], ['खुला है', 'open'], ['विद्यालय', 'school'], ['सड़क', 'road'], ['अस्पताल', 'hospital'], ['दवाखाना', 'pharmacy'],
      ['दुकान', 'shop'], ['मंदिर', 'temple'], ['पुलिस', 'police'], ['बिकाऊ है', 'for sale'], ['सावधान', 'caution'], ['धीरे चलें', 'go slowly'], ['भारत सरकार', 'Government of India']] },
    { id: 'nep', n: 'Nepali', s: 'deva', p: 'NPL', tell: 'छ · को · -हरू', t: 'ne', w: [
      ['स्वागत छ', 'welcome'], ['खुला छ', 'open'], ['विद्यालय', 'school'], ['बाटो', 'road'], ['अस्पताल', 'hospital'], ['औषधि पसल', 'pharmacy'],
      ['पसल', 'shop'], ['मन्दिर', 'temple'], ['प्रहरी', 'police'], ['बिक्रीमा', 'for sale'], ['सावधान', 'caution'], ['नेपाल सरकार', 'Government of Nepal'], ['गाउँपालिका', 'rural municipality']] },
    { id: 'ben', n: 'Bengali', s: 'beng', p: 'BGD IND', t: 'bn', w: [
      ['স্বাগতম', 'welcome'], ['খোলা', 'open'], ['বিদ্যালয়', 'school'], ['সড়ক', 'road'], ['হাসপাতাল', 'hospital'], ['ফার্মেসি', 'pharmacy'],
      ['দোকান', 'shop'], ['মসজিদ', 'mosque'], ['পুলিশ', 'police'], ['বিক্রয় হবে', 'for sale'], ['সাবধান', 'caution'], ['বাংলাদেশ', 'Bangladesh']] },
    { id: 'pan', n: 'Punjabi', s: 'indi', p: 'IND', t: 'pa', w: [['ਜੀ ਆਇਆਂ ਨੂੰ', 'welcome'], ['ਸਕੂਲ', 'school'], ['ਹਸਪਤਾਲ', 'hospital'], ['ਦੁਕਾਨ', 'shop'], ['ਪੁਲਿਸ', 'police'], ['ਸੜਕ', 'road']] },
    { id: 'guj', n: 'Gujarati', s: 'indi', p: 'IND', t: 'gu', w: [['સ્વાગત છે', 'welcome'], ['શાળા', 'school'], ['હોસ્પિટલ', 'hospital'], ['દુકાન', 'shop'], ['પોલીસ', 'police'], ['રસ્તો', 'road']] },
    { id: 'ori', n: 'Odia', s: 'indi', p: 'IND', t: 'or', w: [['ସ୍ୱାଗତ', 'welcome'], ['ବିଦ୍ୟାଳୟ', 'school'], ['ଡାକ୍ତରଖାନା', 'hospital'], ['ଦୋକାନ', 'shop'], ['ପୋଲିସ', 'police'], ['ରାସ୍ତା', 'road']] },
    { id: 'tel', n: 'Telugu', s: 'indi', p: 'IND', t: 'te', w: [['స్వాగతం', 'welcome'], ['పాఠశాల', 'school'], ['ఆసుపత్రి', 'hospital'], ['దుకాణం', 'shop'], ['పోలీస్', 'police'], ['రోడ్డు', 'road']] },
    { id: 'kan', n: 'Kannada', s: 'indi', p: 'IND', t: 'kn', w: [['ಸ್ವಾಗತ', 'welcome'], ['ಶಾಲೆ', 'school'], ['ಆಸ್ಪತ್ರೆ', 'hospital'], ['ಅಂಗಡಿ', 'shop'], ['ಪೊಲೀಸ್', 'police'], ['ರಸ್ತೆ', 'road']] },
    { id: 'mal', n: 'Malayalam', s: 'indi', p: 'IND', t: 'ml', w: [['സ്വാഗതം', 'welcome'], ['വിദ്യാലയം', 'school'], ['ആശുപത്രി', 'hospital'], ['കട', 'shop'], ['പോലീസ്', 'police'], ['റോഡ്', 'road']] },
    { id: 'tam', n: 'Tamil', s: 'taml', p: 'IND LKA SGP', t: 'ta', w: [
      ['நல்வரவு', 'welcome'], ['பள்ளி', 'school'], ['சாலை', 'road'], ['மருத்துவமனை', 'hospital'], ['மருந்தகம்', 'pharmacy'], ['கடை', 'shop'],
      ['கோயில்', 'temple'], ['காவல் நிலையம்', 'police station'], ['விற்பனைக்கு', 'for sale'], ['கவனம்', 'caution'], ['நிலையம்', 'station']] },
    { id: 'sin', n: 'Sinhala', s: 'sinh', p: 'LKA', t: 'si', w: [
      ['ආයුබෝවන්', 'welcome'], ['පාසල', 'school'], ['පාර', 'road'], ['රෝහල', 'hospital'], ['ෆාමසිය', 'pharmacy'], ['කඩය', 'shop'],
      ['පන්සල', 'temple'], ['පොලීසිය', 'police'], ['විකිණීමට', 'for sale'], ['අවධානයයි', 'caution'], ['දුම්රිය ස්ථානය', 'railway station']] },
    { id: 'div', n: 'Dhivehi', s: 'thaa', p: 'MDV', t: 'dv', w: [
      ['މަރުޙަބާ', 'welcome'], ['ސްކޫލް', 'school'], ['މަގު', 'road'], ['ހޮސްޕިޓަލް', 'hospital'], ['ފިހާރަ', 'shop'], ['މިސްކިތް', 'mosque'], ['ފުލުހުން', 'police'], ['ދިވެހިރާއްޖެ', 'Maldives']] },
    { id: 'dzo', n: 'Dzongkha', s: 'tibt', p: 'BTN', t: 'dz', w: [
      ['འབྲུག་ཡུལ།', 'Bhutan'], ['སློབ་གྲྭ།', 'school'], ['སྨན་ཁང་།', 'hospital'], ['ལམ།', 'road'], ['ཚོང་ཁང་།', 'shop'], ['ལྷ་ཁང་།', 'temple'], ['བཀྲ་ཤིས་བདེ་ལེགས།', 'good wishes']] },
    { id: 'mya', n: 'Burmese', s: 'mymr', p: 'MMR', t: 'my', w: [
      ['ကြိုဆိုပါသည်', 'welcome'], ['ကျောင်း', 'school'], ['လမ်း', 'road'], ['ဆေးရုံ', 'hospital'], ['ဆေးဆိုင်', 'pharmacy'], ['ဆိုင်', 'shop'],
      ['ဘုရား', 'pagoda'], ['ရဲစခန်း', 'police station'], ['ရောင်းမည်', 'for sale'], ['သတိ', 'caution'], ['ဘူတာ', 'station'], ['ဈေး', 'market']] },
    { id: 'tha', n: 'Thai', s: 'thai', p: 'THA', t: 'th', w: [
      ['ยินดีต้อนรับ', 'welcome'], ['เปิด', 'open'], ['โรงเรียน', 'school'], ['ถนน', 'road'], ['โรงพยาบาล', 'hospital'], ['ร้านขายยา', 'pharmacy'],
      ['ร้านค้า', 'shop'], ['วัด', 'temple'], ['ตำรวจ', 'police'], ['ขาย', 'for sale'], ['ระวัง', 'caution'], ['สถานี', 'station'], ['หยุด', 'stop'], ['ตลาด', 'market']] },
    { id: 'lao', n: 'Lao', s: 'laoo', p: 'LAO', t: 'lo', w: [
      ['ຍິນດີຕ້ອນຮັບ', 'welcome'], ['ເປີດ', 'open'], ['ໂຮງຮຽນ', 'school'], ['ຖະໜົນ', 'road'], ['ໂຮງໝໍ', 'hospital'], ['ຮ້ານຂາຍຢາ', 'pharmacy'],
      ['ຮ້ານຄ້າ', 'shop'], ['ວັດ', 'temple'], ['ຕຳຫຼວດ', 'police'], ['ຂາຍ', 'for sale'], ['ລະວັງ', 'caution'], ['ສະຖານີ', 'station'], ['ຢຸດ', 'stop'], ['ຕະຫຼາດ', 'market']] },
    { id: 'khm', n: 'Khmer', s: 'khmr', p: 'KHM', t: 'km', w: [
      ['សូមស្វាគមន៍', 'welcome'], ['បើក', 'open'], ['សាលារៀន', 'school'], ['ផ្លូវ', 'road'], ['មន្ទីរពេទ្យ', 'hospital'], ['ឱសថស្ថាន', 'pharmacy'],
      ['ហាង', 'shop'], ['វត្ត', 'temple'], ['នគរបាល', 'police'], ['លក់', 'for sale'], ['ប្រយ័ត្ន', 'caution'], ['ស្ថានីយ', 'station'], ['ឈប់', 'stop'], ['ផ្សារ', 'market']] },
    { id: 'hant', n: 'Chinese, traditional', s: 'hani', p: 'TWN HKG MAC', tell: '國 學 灣 門 車 · full forms', t: 'zh-Hant', w: [
      ['歡迎光臨', 'welcome'], ['營業中', 'open'], ['學校', 'school'], ['醫院', 'hospital'], ['藥局', 'pharmacy'], ['車站', 'station'],
      ['停車場', 'car park'], ['請勿停車', 'no parking'], ['郵局', 'post office'], ['警察局', 'police station'], ['餐廳', 'restaurant'], ['國小', 'primary school'], ['出售', 'for sale']] },
    { id: 'hans', n: 'Chinese, simplified', s: 'hani', p: 'CHN SGP', tell: '国 学 湾 门 车 · short forms', t: 'zh-Hans', w: [
      ['欢迎光临', 'welcome'], ['营业中', 'open'], ['学校', 'school'], ['医院', 'hospital'], ['药店', 'pharmacy'], ['车站', 'station'],
      ['停车场', 'car park'], ['请勿停车', 'no parking'], ['邮局', 'post office'], ['派出所', 'police station'], ['餐厅', 'restaurant'], ['小学', 'primary school'], ['出售', 'for sale']] },
    { id: 'jpn', n: 'Japanese', s: 'jpan', p: 'JPN', t: 'ja', w: [
      ['ようこそ', 'welcome'], ['営業中', 'open'], ['通り', 'street'], ['クリニック', 'clinic'], ['薬局', 'pharmacy'], ['お店', 'shop'],
      ['お寺', 'temple'], ['交番', 'police box'], ['売地', 'land for sale'], ['ご注意ください', 'caution'], ['駅', 'station'], ['止まれ', 'stop'], ['ラーメン', 'ramen'], ['お弁当', 'boxed lunch']] },
    { id: 'kor', n: 'Korean', s: 'kore', p: 'KOR PRK', t: 'ko', w: [
      ['환영합니다', 'welcome'], ['영업중', 'open'], ['학교', 'school'], ['길', 'street'], ['병원', 'hospital'], ['약국', 'pharmacy'],
      ['가게', 'shop'], ['교회', 'church'], ['경찰서', 'police station'], ['매매', 'for sale'], ['주의', 'caution'], ['역', 'station'], ['정지', 'stop'], ['식당', 'restaurant']] },
  ],
};
