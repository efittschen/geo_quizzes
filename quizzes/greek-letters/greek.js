// Greek: its letters, and the words of its signs, for the script quizzes (../shared/reading.js says how this is
// written). It is written in Greece and Cyprus, with the same letters and the same romanisation.
//
// Sounds are spelled as names are in Latin letters on Greek and Cypriot road signs: ELOT 743 (Greece; Cyprus has
// used it for its place names since the late 1980s, by law since 1998: Lefkosia, Lemesos, Agia Napa). It spells the letters, not the sounds:
// η, ι and υ are all said i but spelled i, i and y; ω is o; β v, χ ch, θ th, δ d, φ f. Of the pairs read as one,
// ου is ou (said u), and αι ει οι stay ai ei oi (said e, i, i: Peiraias, Aigaleo). αυ ευ are av ev before a vowel or
// β γ δ ζ λ μ ν ρ and af ef before θ κ ξ π σ τ φ χ ψ or at the end (Nafplio, Evosmos); the tile is the one names
// have most. μπ is b at the start or end of a word and mp inside it (Kalampaka), ντ nt (said d or nd), γκ gk, γγ ng.
// τζ is said dz. A typed name may also use the spelling of the sound (u, e, i, b, d, g) and the older one of maps
// (h for χ, y for γ before e and i: Ayia Napa, as Cyprus' signs had it). Σ is written ς at the end of a word.
// Lower-case words carry an accent on the stressed vowel (ά έ ή ί ό ύ ώ), and ϊ ϋ say that two vowels are not a
// pair: neither is spelled (`together`). Capitals in a word written in capitals have no accent.
// Letters by how often they occur in place names of Greece and Cyprus (GeoNames, Wikidata: α ο ι σ ρ ν ε κ λ υ τ
// μ π γ ω η δ χ β φ θ ζ ξ ψ; ου, αι, ντ, ει, μπ, οι, ευ, αυ, γκ, τζ, γγ), in the groups Greek is usually
// learned in: those that are Latin letters, those that look Latin and are read otherwise, the new ones, the pairs.
var SCRIPT = {
  name: 'Greek', script: 'grek', unicode: 'Greek', faces: 5,
  langs: { el: { name: 'Greek', where: 'Greece · Cyprus', at: 'GRC' } },
  letters: [
    { title: 'Same as Latin', rows: [
      ['Α α', 'a'], ['Ο ο', 'o'], ['Ι ι', 'i', 'i y'], ['Ε ε', 'e'], ['Κ κ', 'k', 'k c'], ['Τ τ', 't'],
      ['Μ μ', 'm', 'm', 'small μ: not u'], ['Ζ ζ', 'z'],
    ] },
    { title: 'Look Latin, sound different', rows: [
      ['Ρ ρ', 'r', 'r rh', 'not p'], ['Ν ν', 'n', 'n', 'small ν: not v'], ['Υ υ', 'y', 'y i', 'said i'], ['Η η', 'i', 'i e', 'not h · small η: not n'],
      ['Χ χ', 'ch', 'ch h kh x', 'not x · ch in loch'], ['Β β', 'v', 'v b', 'not b'],
    ] },
    { title: 'New letters · Σ Λ Π Γ Ω', rows: [
      ['Σ σ ς', 's', 's ss', 'ς at the end of a word'], ['Λ λ', 'l', 'l ll'], ['Π π', 'p'], ['Γ γ', 'g', 'g y gh', 'said y before e and i'],
      ['Ω ω', 'o'],
    ] },
    { title: 'New letters · Δ Φ Θ Ξ Ψ', rows: [
      ['Δ δ', 'd', 'd dh th', 'th in this'], ['Φ φ', 'f', 'f ph'], ['Θ θ', 'th', 'th t', 'th in thin'], ['Ξ ξ', 'x', 'x ks'], ['Ψ ψ', 'ps'],
    ] },
    { title: 'Vowel pairs', rows: [
      ['ΟΥ ου', 'ou', 'ou u', 'said u'], ['ΑΙ αι', 'ai', 'ai e', 'said e'], ['ΕΙ ει', 'ei', 'ei i', 'said i'], ['ΟΙ οι', 'oi', 'oi i', 'said i'],
      ['ΕΥ ευ', 'ef', 'ef ev', 'ev before a vowel or β γ δ ζ λ μ ν ρ'], ['ΑΥ αυ', 'av', 'av af', 'af before θ κ ξ π σ τ φ χ ψ or at the end'],
    ] },
    { title: 'Consonant pairs', rows: [
      ['ΝΤ ντ', 'nt', 'nt d nd', 'said d or nd'], ['ΜΠ μπ', 'mp', 'mp b mb', 'b at the start or end of a word · said b or mb'],
      ['ΓΚ γκ', 'gk', 'gk g ng nk', 'said g or ng'], ['ΤΖ τζ', 'tz', 'tz dz j', 'said dz · j in Cyprus'], ['ΓΓ γγ', 'ng', 'ng gg', 'said ng'],
    ] },
  ],
  mixes: [
    ['Lookalikes', 'Α Λ Δ Θ Ο Ω Ζ Ξ Σ Η Π Ν Γ Υ Φ Ψ'],
    ['Vowels', 'Α Ε Η Ι Ο Υ Ω ΟΥ ΑΙ ΕΙ ΟΙ ΑΥ ΕΥ'],
    ['Consonants', 'Β Γ Δ Ζ Θ Κ Λ Μ Ν Ξ Π Ρ Σ Τ Φ Χ Ψ ΜΠ ΝΤ ΓΚ ΓΓ ΤΖ'],
    ['Alphabet', 'Α Β Γ Δ Ε Ζ Η Θ Ι Κ Λ Μ Ν Ξ Ο Π Ρ Σ Τ Υ Φ Χ Ψ Ω'],
  ],
  // the vowels with their accent or diaeresis, as lower-case words write them, and the rarer pairs (ELOT 743)
  together: [
    ['ά', 'a'], ['έ', 'e'], ['ή', 'i e'], ['ί', 'i'], ['ό', 'o'], ['ύ', 'y i'], ['ώ', 'o'], ['ϊ', 'i'], ['ϋ', 'y i'], ['ΐ', 'i'], ['ΰ', 'y i'],
    ['ού', 'ou u'], ['αί', 'ai e'], ['εί', 'ei i'], ['οί', 'oi i'], ['αύ', 'av af'], ['εύ', 'ef ev'], ['ηυ', 'iv if'], ['ηύ', 'iv if'],
    ['γξ', 'nx nks'], ['γχ', 'nch nkh nh'],
  ],
  // A row per meaning: the word on Greek and Cypriot signs.
  words: {
    themes: [
      { title: 'Roads', rows: [
        ['street', 'οδός'], ['avenue', 'λεωφόρος'], ['square', 'πλατεία'], ['road', 'δρόμος'], ['national road', 'εθνική οδός'],
        ['bridge', 'γέφυρα'], ['tolls', 'διόδια'], ['centre', 'κέντρο'],
      ] },
      { title: 'In names', rows: [
        ['saint', 'Άγιος'], ['saint', 'Αγία'], ['saints', 'Άγιοι'], ['new', 'Νέα'], ['new', 'Νέο'], ['new', 'Νέος'], ['lower', 'Κάτω'], ['upper', 'Άνω'],
        ['upper', 'Πάνω'], ['old', 'Παλαιά'], ['old', 'Παλαιό'],
      ] },
      { title: 'Places', rows: [
        ['hospital', 'νοσοκομείο'], ['school', 'σχολείο'], ['police', 'αστυνομία'], ['church', 'εκκλησία'], ['town hall', 'δημαρχείο'],
        ['port', 'λιμάνι'], ['airport', 'αεροδρόμιο'], ['beach', 'παραλία'], ['museum', 'μουσείο'],
      ] },
      { title: 'Shops', rows: [
        ['pharmacy', 'φαρμακείο'], ['bakery', 'φούρνος'], ['kiosk', 'περίπτερο'], ['supermarket', 'σούπερ μάρκετ'], ['taverna', 'ταβέρνα'],
        ['hotel', 'ξενοδοχείο'], ['rooms to let', 'ενοικιαζόμενα δωμάτια'], ['petrol station', 'πρατήριο καυσίμων|pratirio kafsimon'],
      ] },
      { title: 'Notices', rows: [
        ['entrance', 'είσοδος'], ['exit', 'έξοδος'], ['open', 'ανοιχτό'], ['open', 'ανοικτό'], ['closed', 'κλειστό'], ['for sale', 'πωλείται'],
        ['for rent', 'ενοικιάζεται'], ['bus stop', 'στάση'], ['parking', 'στάθμευση'], ['attention', 'προσοχή'],
      ] },
      { title: 'Abbreviations', short: true, rows: [['avenue', 'Λεωφ.'], ['avenue', 'Λ.'], ['square', 'Πλ.'], ['saint', 'Αγ.'], ['new', 'Ν.'], ['old', 'Π.']] },
    ],
    mixes: [
      ['Addresses', ['Roads', 'In names', 'Abbreviations']],
      ['Shop fronts', ['Places', 'Shops', 'Notices']],
    ],
  },
};
// A place written with each letter (made by tools/builds/languages/build.mjs: run it again, don't edit).
SCRIPT.eg = {"Α":["Μαρούσι","Marousi"],"Ο":["Ίλιον","Ilion"],"Ι":["Ηλιούπολη","Ilioupoli"],"Ε":["Περιστέρι","Peristeri"],"Κ":["Καλλιθέα","Kallithea"],"Τ":["Κερατσίνι","Keratsini"],"Μ":["Καλαμαριά","Kalamaria"],"Ζ":["Ζωγράφου","Zografou"],"Ρ":["Νέα Σμύρνη","Nea Smyrni"],"Ν":["Νίκαια","Nikaia"],"Υ":["Κορυδαλλός","Korydallos"],"Η":["Θεσσαλονίκη","Thessaloniki"],"Χ":["Αχαρνές","Acharnes"],"Β":["Βόλος","Volos"],"Σ":["Εύοσμος","Evosmos"],"Λ":["Λάρισα","Larisa"],"Π":["Πάτρα","Patra"],"Γ":["Άγιος Δημήτριος","Agios Dimitrios"],"Ω":["Αιγάλεω","Aigaleo"],"Δ":["Χαλάνδρι","Chalandri"],"Φ":["Γλυφάδα","Glyfada"],"Θ":["Αθήνα","Athina"],"Ξ":["Αλεξανδρούπολη","Alexandroupoli"],"Ψ":["Νέο Ψυχικό","Neo Psychiko"],"ΟΥ":["Νάουσα","Naousa"],"ΑΙ":["Πειραιάς","Peiraias"],"ΕΙ":["Ηράκλειο","Irakleio"],"ΟΙ":["Βέροια","Veroia"],"ΕΥ":["Ελευσίνα","Elefsina"],"ΑΥ":["Σταυρούπολη","Stavroupoli"],"ΝΤ":["Άγιος Ιωάννης Ρέντη","Agios Ioannis Renti"],"ΜΠ":["Αμπελόκηποι","Ampelokipoi"],"ΓΚ":["Λαγκαδάς","Lagkadas"],"ΤΖ":["Αγλαντζιά","Aglantzia"],"ΓΓ":["Μεσολόγγι","Mesolongi"]};
// (one of the scripts the page loaded: ../shared/reading.js reads names in each)
(globalThis.ALL_SCRIPTS ||= []).push(SCRIPT);
