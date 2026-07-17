export function getProvinceFromCity(city: string): string {
  const normalized = city.trim().toLowerCase();
  
  // Latina province cities
  const latinaCities = new Set([
    'latina', 'aprilia', 'cisterna di latina', 'cisterna', 'sermoneta', 'pontinia',
    'sabaudia', 'san felice circeo', 'terracina', 'fondi', 'formia', 'gaeta',
    'minturno', 'spigno saturnia', 'monte san biagio', 'sonnino', 'prossedi',
    'riva ligure', 'santi cosma e damiano', 'castelforte', 'itri', 'sperlonga',
    'ventura', 'lenola', 'maenza', 'roccasecca', 'coreno ausonio', 'esperia',
    'ponza', 'ventotene', 'palmoli', 'sezze', 'priverno', 'roccagorga',
    'bassiano', 'norma', 'cori', 'rocamassima', 'roccamassima', 'roma', 'siena',
    // Keep Latina as default for unknown in Lazio area
  ]);

  // Roma province cities (RM)
  const romaCities = new Set([
    'roma', 'rome', 'frascati', 'albano laziale', 'castel gandolfo', 'avezzano',
    'civitavecchia', 'fiumicino', 'guidonia montecelio', 'marino', 'mentana',
    'nemi', 'pomezia', 'roccasecca', 'san cesareo', 'sora', 'tivoli', 'velletri',
    'bracciano', 'anghuilla sabazia', 'allumiere', 'arzano', 'bagnoregio',
    'baccano', 'bracciano', 'canepina', 'canneto', 'capena', 'capranica',
    'castel san pietro romano', 'cave', 'cerveteri', 'civitavecchia', 'civitella san paolo',
    'colonna', 'colonna', 'formello', 'fonte nuova', 'frascati', 'galeria',
    'genazzano', 'grottaferrata', 'guidonla', 'ladispoli', 'lanuvio', 'magliano romano',
    'manciano', 'marino', 'mazzano romano', 'monte compatri', 'monte porzio catone',
    'montelibretti', 'montelanico', 'morlupo', 'nazzano', 'nepi', 'nerola', 'nettuno',
    'orvinio', 'paganico sabino', 'palombara sabina', 'pisoniano', 'poli', 'pomezia',
    'rizzo', 'roccagiovine', 'rocca priora', 'rocca di papa', 'roccasecca', 'rome',
    'san cesareo', 'san gregorio da sassola', 'san polo', 'san vito romano',
    'sant\'angelo romano', 'sant\'orsola', 'santa maria della mole', 'santa marinella',
    'torrita tiberina', 'trevignano romano', 'valmontone', 'vicovaro', 'zagarolo'
  ]);

  // Frosinone province (FR)
  const frosinoneCities = new Set([
    'frosinone', 'ceccano', 'ferentino', 'alatri', 'anagni', 'arce', 'arnara',
    'boville ernica', 'broccostella', 'campoli appennino', 'castrocielo',
    'castro dei volsci', 'cervaro', 'colfelice', 'colle san magno', 'collepardo',
    'coreno ausonio', 'esperia', 'falvaterra', 'filettino', 'fiuggi', 'fontana lira',
    'frosinone', 'fumone', 'gallinaro', 'giuliano di roma', 'guarcino', 'isola del liri',
    'monte san giovanni campano', 'morolo', 'paliano', 'pastena', 'pico', 'piedimonte san germano',
    'piglio', 'pignataro interamna', 'ponza', 'posta fibreno', 'ripoli', 'roccasecca',
    'san biagio saracinisco', 'san donato val di comino', 'san giorgio a liri',
    'san giovanni in conca', 'sant\'apollinare', 'sant\'elia fiumerapido',
    'sant\'opera', 'santo spiracoli', 'sant\'omobono', 'sant\'onofrio', 'sant\'orsola',
    'sant\'orsola', 'sant\'elia', 'sant\'apollinare', 'sora', 'strangolagalli',
    'supino', 'terelle', 'torrice', 'torre cajetani', 'torre san severino',
    'trivigliano', 'vallecorsa', 'veroli', 'vicalvi', 'villa latina', 'villa santo stefano',
    'viticuso'
  ]);

  // Viterbo province (VT)
  const viterboCities = new Set([
    'viterbo', 'acquapendente', 'arce', 'arica', 'bagnaia', 'bagnoregio', 'barano',
    'bassano in teverina', 'bomarzo', 'celleno', 'cellere', 'civita castellana',
    'civitella d\'agliano', 'corchiano', 'fabrica di roma', 'faleria', 'farnese',
    'gallese', 'gradoli', 'grotte di castro', 'lunano', 'luzzi', 'marta', 'montalto di castro',
    'monte romano', 'monterosi', 'nepi', 'onorato', 'orvieto', 'poggio nativo',
    'proceno', 'ronciglione', 'rome', 'rotondella', 'san lorenzo nuovo', 'san venanzo',
    'siena', 'sora', 'soriano nel cimino', 'sutri', 'tarquinia', 'tessennano',
    'trevignano romano', 'tuscan', 'vallerano', 'vallela', 'vetralla', 'vitorchiano',
    'vitorchiano', 'viterbo', 'viterbo'
  ]);

  // Rieti province (RI)
  const rietiCities = new Set([
    'rieti', 'amatrice', 'antrodoco', 'aspra', 'borgorose', 'borgo velino',
    'boville', 'cantalice', 'cantalupo in sabina', 'casperia', 'castel sant\'angelo',
    'castel di tora', 'castelnuovo di farfa', 'cittaducale', 'collalto sabino',
    'colle di tora', 'collegiove', 'collevecchio', 'corvaro', 'costanza', 'fara in sabina',
    'farfa', 'farnese', 'fiamignano', 'forano', 'frasso sabino', 'grezzo',
    'labro', 'leonessa', 'longone sabino', 'marcetelli', 'micciani', 'monteleone sabino',
    'montenero sabino', 'montopoli di sabina', 'morro reale', 'nazzano', 'orvinio',
    'paganico sabino', 'poggio bustone', 'poggio catino', 'poggio moi',
    'poggio san lorenzo', 'poggio san lorenzo', 'posta', 'pozzo', 'rivodutri',
    'roccantica', 'roccarose', 'roccasinibalda', 'rurale', 'salario', 'sant\'anastasia',
    'sant\'anatolia di narco', 'sant\'anatolia', 'sant\'andrea', 'santo stefano',
    'san vito', 'scoppito', 'selci', 'sora', 'sperlonga', 'stimigliano', 'torricella',
    'torricella in sabina', 'torricella sabina', 'torri in sabina', 'torri',
    'vacone', 'varco sabino', 'villalago', 'villanova', 'viterbo'
  ]);

  if (latinaCities.has(normalized)) return 'LT';
  if (romaCities.has(normalized)) return 'RM';
  if (frosinoneCities.has(normalized)) return 'FR';
  if (viterboCities.has(normalized)) return 'VT';
  if (rietiCities.has(normalized)) return 'RI';

  // Default to Latina for unknown cities in Lazio area
  return 'LT';
}

export const PROVINCE_NAMES: Record<string, string> = {
  LT: 'Latina',
  RM: 'Roma',
  FR: 'Frosinone',
  VT: 'Viterbo',
  RI: 'Rieti',
};