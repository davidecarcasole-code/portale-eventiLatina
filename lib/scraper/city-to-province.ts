export function getProvinceFromCity(city: string): string | null {
  const normalized = city.trim().toLowerCase();
  
  // Latina province cities (LT)
  const latinaCities = new Set([
    'latina', 'aprilia', 'cisterna di latina', 'cisterna', 'sermoneta', 'pontinia',
    'sabaudia', 'san felice circeo', 'terracina', 'fondi', 'formia', 'gaeta',
    'minturno', 'spigno saturnia', 'monte san biagio', 'sonnino', 'prossedi',
    'santi cosma e damiano', 'castelforte', 'itri', 'sperlonga',
    'ventura', 'lenola', 'maenza', 'coreno ausonio', 'esperia',
    'ponza', 'ventotene', 'palmoli', 'sezze', 'priverno', 'roccagorga',
    'bassiano', 'norma', 'cori', 'rocamassima', 'roccamassima',
  ]);

  // Roma province cities (RM)
  const romaCities = new Set([
    'roma', 'rome', 'frascati', 'albano laziale', 'castel gandolfo',
    'civitavecchia', 'fiumicino', 'guidonia montecelio', 'marino', 'mentana',
    'nemi', 'pomezia', 'san cesareo', 'tivoli', 'velletri',
    'bracciano', 'anghuilla sabazia', 'allumiere', 'arzano',
    'baccano', 'capena', 'capranica',
    'castel san pietro romano', 'cave', 'cerveteri', 'civitella san paolo',
    'colonna', 'formello', 'fonte nuova', 'galeria',
    'genazzano', 'grottaferrata', 'guidonia', 'ladispoli', 'lanuvio', 'magliano romano',
    'mazzano romano', 'monte compatri', 'monte porzio catone',
    'montelibretti', 'montelanico', 'morlupo', 'nazzano', 'nerola', 'nettuno',
    'palombara sabina', 'pisoniano', 'poli',
    'roccagiovine', 'rocca priora', 'rocca di papa',
    'san cesareo', 'san gregorio da sassola', 'san polo', 'san vito romano',
    'sant\'angelo romano', 'santa marinella',
    'torrita tiberina', 'trevignano romano', 'valmontone', 'vicovaro', 'zagarolo'
  ]);

  // Frosinone province (FR)
  const frosinoneCities = new Set([
    'frosinone', 'ceccano', 'ferentino', 'alatri', 'anagni', 'arce', 'arnara',
    'boville ernica', 'broccostella', 'campoli appennino', 'castrocielo',
    'castro dei volsci', 'cervaro', 'colfelice', 'colle san magno', 'collepardo',
    'falvaterra', 'filettino', 'fiuggi', 'fontana lira',
    'fumone', 'gallinaro', 'giuliano di roma', 'guarcino', 'isola del liri',
    'monte san giovanni campano', 'morolo', 'paliano', 'pastena', 'pico', 'piedimonte san germano',
    'piglio', 'pignataro interamna', 'posta fibreno', 'ripoli', 'roccasecca',
    'san biagio saracinisco', 'san donato val di comino', 'san giorgio a liri',
    'san giovanni in conca', 'sant\'apollinare', 'sant\'elia fiumerapido',
    'sora', 'strangolagalli',
    'supino', 'terelle', 'torrice', 'torre cajetani', 'torre san severino',
    'trivigliano', 'vallecorsa', 'veroli', 'vicalvi', 'villa latina', 'villa santo stefano',
    'viticuso'
  ]);

  // Viterbo province (VT)
  const viterboCities = new Set([
    'viterbo', 'acquapendente', 'bagnaia', 'bagnoregio', 'barano',
    'bassano in teverina', 'bomarzo', 'celleno', 'cellere', 'civita castellana',
    'civitella d\'agliano', 'corchiano', 'fabrica di roma', 'faleria', 'farnese',
    'gallese', 'gradoli', 'grotte di castro', 'marta', 'montalto di castro',
    'monte romano', 'monterosi', 'onorato', 'orvieto', 'poggio nativo',
    'proceno', 'ronciglione', 'san lorenzo nuovo', 'san venanzo',
    'soriano nel cimino', 'sutri', 'tarquinia', 'tessennano',
    'vallerano', 'vetralla', 'vitorchiano',
  ]);

  // Rieti province (RI)
  const rietiCities = new Set([
    'rieti', 'amatrice', 'antrodoco', 'borgorose', 'borgo velino',
    'cantalice', 'cantalupo in sabina', 'casperia', 'castel sant\'angelo',
    'castel di tora', 'castelnuovo di farfa', 'cittaducale', 'collalto sabino',
    'colle di tora', 'collegiove', 'collevecchio', 'fara in sabina',
    'fiamignano', 'forano', 'frasso sabino',
    'labro', 'leonessa', 'longone sabino', 'marcetelli', 'monteleone sabino',
    'montenero sabino', 'montopoli di sabina', 'morro reale',
    'poggio bustone', 'poggio catino', 'poggio moi',
    'poggio san lorenzo', 'posta', 'rivodutri',
    'roccantica', 'roccasinibalda',
    'selci', 'stimigliano', 'torricella in sabina', 'torri in sabina',
    'vacone', 'varco sabino',
  ]);

  if (latinaCities.has(normalized)) return 'LT';
  if (romaCities.has(normalized)) return 'RM';
  if (frosinoneCities.has(normalized)) return 'FR';
  if (viterboCities.has(normalized)) return 'VT';
  if (rietiCities.has(normalized)) return 'RI';

  // City not found in any Lazio province
  return null;
}

export const PROVINCE_NAMES: Record<string, string> = {
  LT: 'Latina',
  RM: 'Roma',
  FR: 'Frosinone',
  VT: 'Viterbo',
  RI: 'Rieti',
};