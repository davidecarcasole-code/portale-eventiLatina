-- Fix incorrect province assignments based on city names
-- Run this on the production database

-- Update events with correct province based on city
UPDATE events SET province = 'LT' WHERE LOWER(city) IN (
  'latina', 'aprilia', 'cisterna di latina', 'cisterna', 'sermoneta', 'pontinia',
  'sabaudia', 'san felice circeo', 'terracina', 'fondi', 'formia', 'gaeta',
  'minturno', 'spigno saturnia', 'monte san biagio', 'sonnino', 'prossedi',
  'castelforte', 'itri', 'sperlonga', 'ventura', 'lenola', 'maenza', 'roccasecca',
  'coreno ausonio', 'esperia', 'ponza', 'ventotene', 'sezze', 'priverno', 'roccagorga',
  'bassiano', 'norma', 'cori'
);

UPDATE events SET province = 'RM' WHERE LOWER(city) IN (
  'roma', 'rome', 'frascati', 'albano laziale', 'castel gandolfo', 'avezzano',
  'civitavecchia', 'fiumicino', 'guidonia montecelio', 'marino', 'mentana',
  'nemi', 'pomezia', 'san cesareo', 'sora', 'tivoli', 'velletri', 'bracciano',
  'anghuilla sabazia', 'allumiere', 'arzano', 'bagnoregio', 'baccano', 'bracciano',
  'canepina', 'canneto', 'capena', 'capranica', 'castel san pietro romano', 'cave',
  'cerveteri', 'civitavecchia', 'civitella san paolo', 'colonna', 'formello',
  'fonte nuova', 'galeria', 'genazzano', 'grottaferrata', 'ladispoli', 'lanuvio',
  'magliano romano', 'manciano', 'mazzano romano', 'monte compatri', 'monte porzio catone',
  'montelibretti', 'montelanico', 'morlupo', 'nazzano', 'nepi', 'nerola', 'nettuno',
  'orvinio', 'paganico sabino', 'palombara sabina', 'pisoniano', 'poli', 'pomezia',
  'rizzo', 'roccagiovine', 'rocca priora', 'rocca di papa', 'roccasecca', 'rome',
  'san cesareo', 'san gregorio da sassola', 'san polo', 'san vito romano',
  'sant''angelo romano', 'sant''orsola', 'santa maria della mole', 'santa marinella',
  'torrita tiberina', 'trevignano romano', 'valmontone', 'vicovaro', 'zagarolo'
);

UPDATE events SET province = 'FR' WHERE LOWER(city) IN (
  'frosinone', 'ceccano', 'ferentino', 'alatri', 'anagni', 'arce', 'arnara',
  'boville ernica', 'broccostella', 'campoli appennino', 'castrocielo',
  'castro dei volsci', 'cervaro', 'colfelice', 'colle san magno', 'collepardo',
  'coreno ausonio', 'esperia', 'falvaterra', 'filettino', 'fiuggi', 'fontana lira',
  'fumone', 'gallinaro', 'giuliano di roma', 'guarcino', 'isola del liri',
  'monte san giovanni campano', 'morolo', 'paliano', 'pastena', 'pico', 'piedimonte san germano',
  'piglio', 'pignataro interamna', 'posta fibreno', 'ripoli', 'san biagio saracinisco',
  'san donato val di comino', 'san giorgio a liri', 'sant''apollinare', 'sant''elia fiumerapido',
  'sora', 'strangolagalli', 'supino', 'terelle', 'torrice', 'torre cajetani', 'trivigliano',
  'vallecorsa', 'veroli', 'vicalvi', 'villa latina', 'villa santo stefano', 'viticuso'
);

UPDATE events SET province = 'VT' WHERE LOWER(city) IN (
  'viterbo', 'acquapendente', 'bagnaia', 'bagnoregio', 'bassano in teverina', 'bomarzo',
  'celleno', 'cellere', 'civita castellana', 'civitella d''agliano', 'corchiano',
  'fabrica di roma', 'faleria', 'farnese', 'gallese', 'gradoli', 'grotte di castro',
  'lunano', 'marta', 'montalto di castro', 'monte romano', 'monterosi', 'nepi',
  'onorato', 'orvieto', 'poggio nativo', 'proceno', 'ronciglione', 'san lorenzo nuovo',
  'san venanzo', 'soriano nel cimino', 'sutri', 'tarquinia', 'tessennano',
  'trevignano romano', 'vallerano', 'vetralla', 'vitorchiano'
);

UPDATE events SET province = 'RI' WHERE LOWER(city) IN (
  'rieti', 'amatrice', 'antrodoco', 'aspra', 'borgorose', 'borgo velino',
  'cantalice', 'cantalupo in sabina', 'casperia', 'castel sant''angelo', 'castel di tora',
  'castelnuovo di farfa', 'cittaducale', 'collalto sabino', 'colle di tora', 'collevecchio',
  'corvaro', 'fara in sabina', 'farfa', 'fiamignano', 'forano', 'frasso sabino',
  'labro', 'leonessa', 'longone sabino', 'marcetelli', 'micciani', 'monteleone sabino',
  'montenero sabino', 'montopoli di sabina', 'morro reale', 'nazzano', 'orvinio',
  'paganico sabino', 'poggio bustone', 'poggio catino', 'poggio moi',
  'poggio san lorenzo', 'posta', 'rivodutri', 'roccantica', 'roccasinibalda',
  'salario', 'scoppito', 'stimigliano', 'torricella in sabina', 'torri in sabina',
  'vacone', 'varco sabino', 'villalago', 'villanova'
);

-- Verify
SELECT province, COUNT(*) as count FROM events GROUP BY province ORDER BY count DESC;