import { prisma } from '../lib/prisma.js';

const PROVINCE_FROM_CITY = {
  'latina': 'LT', 'aprilia': 'LT', 'cisterna di latina': 'LT', 'cisterna': 'LT',
  'sermoneta': 'LT', 'pontinia': 'LT', 'sabaudia': 'LT', 'san felice circeo': 'LT',
  'terracina': 'LT', 'fondi': 'LT', 'formia': 'LT', 'gaeta': 'LT', 'minturno': 'LT',
  'spigno saturnia': 'LT', 'monte san biagio': 'LT', 'sonnino': 'LT', 'prossedi': 'LT',
  'castelforte': 'LT', 'itri': 'LT', 'sperlonga': 'LT', 'ventura': 'LT', 'lenola': 'LT',
  'maenza': 'LT', 'roccasecca': 'LT', 'coreno ausonio': 'LT', 'esperia': 'LT',
  'ponza': 'LT', 'ventotene': 'LT', 'sezze': 'LT', 'priverno': 'LT', 'roccagorga': 'LT',
  'bassiano': 'LT', 'norma': 'LT', 'cori': 'LT',

  'roma': 'RM', 'rome': 'RM', 'frascati': 'RM', 'albano laziale': 'RM', 'castel gandolfo': 'RM',
  'avezzano': 'RM', 'civitavecchia': 'RM', 'fiumicino': 'RM', 'guidonia montecelio': 'RM',
  'marino': 'RM', 'mentana': 'RM', 'nemi': 'RM', 'pomezia': 'RM', 'san cesareo': 'RM',
  'sora': 'RM', 'tivoli': 'RM', 'velletri': 'RM', 'bracciano': 'RM', 'anghuilla sabazia': 'RM',
  'allumiere': 'RM', 'arzano': 'RM', 'bagnoregio': 'RM', 'baccano': 'RM', 'bracciano': 'RM',
  'canepina': 'RM', 'canneto': 'RM', 'capena': 'RM', 'capranica': 'RM',
  'castel san pietro romano': 'RM', 'cave': 'RM', 'cerveteri': 'RM', 'civitavecchia': 'RM',
  'civitella san paolo': 'RM', 'colonna': 'RM', 'formello': 'RM', 'fonte nuova': 'RM',
  'galeria': 'RM', 'genazzano': 'RM', 'grottaferrata': 'RM', 'ladispoli': 'RM', 'lanuvio': 'RM',
  'magliano romano': 'RM', 'manciano': 'RM', 'mazzano romano': 'RM', 'monte compatri': 'RM',
  'monte porzio catone': 'RM', 'montelibretti': 'RM', 'montelanico': 'RM', 'morlupo': 'RM',
  'nazzano': 'RM', 'nepi': 'RM', 'nerola': 'RM', 'nettuno': 'RM', 'orvinio': 'RM',
  'paganico sabino': 'RM', 'palombara sabina': 'RM', 'pisoniano': 'RM', 'poli': 'RM',
  'rizzo': 'RM', 'roccagiovine': 'RM', 'rocca priora': 'RM', 'rocca di papa': 'RM',
  'san cesareo': 'RM', 'san gregorio da sassola': 'RM', 'san polo': 'RM', 'san vito romano': 'RM',
  'sant\'angelo romano': 'RM', 'sant\'orsola': 'RM', 'santa maria della mole': 'RM',
  'santa marinella': 'RM', 'torrita tiberina': 'RM', 'trevignano romano': 'RM',
  'valmontone': 'RM', 'vicovaro': 'RM', 'zagarolo': 'RM',

  'frosinone': 'FR', 'ceccano': 'FR', 'ferentino': 'FR', 'alatri': 'FR', 'anagni': 'FR',
  'arce': 'FR', 'arnara': 'FR', 'boville ernica': 'FR', 'broccostella': 'FR',
  'campoli appennino': 'FR', 'castrocielo': 'FR', 'castro dei volsci': 'FR',
  'cervaro': 'FR', 'colfelice': 'FR', 'colle san magno': 'FR', 'collepardo': 'FR',
  'coreno ausonio': 'FR', 'esperia': 'FR', 'falvaterra': 'FR', 'filettino': 'FR',
  'fiuggi': 'FR', 'fontana lira': 'FR', 'fumone': 'FR', 'gallinaro': 'FR',
  'giuliano di roma': 'FR', 'guarcino': 'FR', 'isola del liri': 'FR',
  'monte san giovanni campano': 'FR', 'morolo': 'FR', 'paliano': 'FR', 'pastena': 'FR',
  'pico': 'FR', 'piedimonte san germano': 'FR', 'piglio': 'FR', 'pignataro interamna': 'FR',
  'posta fibreno': 'FR', 'ripoli': 'FR', 'san biagio saracinisco': 'FR',
  'san donato val di comino': 'FR', 'san giorgio a liri': 'FR', 'sant\'apollinare': 'FR',
  'sant\'elia fiumerapido': 'FR', 'sora': 'FR', 'strangolagalli': 'FR', 'supino': 'FR',
  'terelle': 'FR', 'torrice': 'FR', 'torre cajetani': 'FR', 'trivigliano': 'FR',
  'vallecorsa': 'FR', 'veroli': 'FR', 'vicalvi': 'FR', 'villa latina': 'FR',
  'villa santo stefano': 'FR', 'viticuso': 'FR',

  'viterbo': 'VT', 'acquapendente': 'VT', 'bagnaia': 'VT', 'bagnoregio': 'VT',
  'bassano in teverina': 'VT', 'bomarzo': 'VT', 'celleno': 'VT', 'cellere': 'VT',
  'civita castellana': 'VT', 'civitella d\'agliano': 'VT', 'corchiano': 'VT',
  'fabrica di roma': 'VT', 'faleria': 'VT', 'farnese': 'VT', 'gallese': 'VT',
  'gradoli': 'VT', 'grotte di castro': 'VT', 'lunano': 'VT', 'marta': 'VT',
  'montalto di castro': 'VT', 'monte romano': 'VT', 'monterosi': 'VT', 'nepi': 'VT',
  'onorato': 'VT', 'orvieto': 'VT', 'poggio nativo': 'VT', 'proceno': 'VT',
  'ronciglione': 'VT', 'san lorenzo nuovo': 'VT', 'san venanzo': 'VT',
  'soriano nel cimino': 'VT', 'sutri': 'VT', 'tarquinia': 'VT', 'tessennano': 'VT',
  'trevignano romano': 'VT', 'vallerano': 'VT', 'vetralla': 'VT', 'vitorchiano': 'VT',

  'rieti': 'RI', 'amatrice': 'RI', 'antrodoco': 'RI', 'aspra': 'RI', 'borgorose': 'RI',
  'borgo velino': 'RI', 'cantalice': 'RI', 'cantalupo in sabina': 'RI', 'casperia': 'RI',
  'castel sant\'angelo': 'RI', 'castel di tora': 'RI', 'castelnuovo di farfa': 'RI',
  'cittaducale': 'RI', 'collalto sabino': 'RI', 'colle di tora': 'RI', 'collevecchio': 'RI',
  'corvaro': 'RI', 'fara in sabina': 'RI', 'farfa': 'RI', 'fiamignano': 'RI', 'forano': 'RI',
  'frasso sabino': 'RI', 'labro': 'RI', 'leonessa': 'RI', 'longone sabino': 'RI',
  'marcetelli': 'RI', 'micciani': 'RI', 'monteleone sabino': 'RI', 'montenero sabino': 'RI',
  'montopoli di sabina': 'RI', 'morro reale': 'RI', 'nazzano': 'RI', 'orvinio': 'RI',
  'paganico sabino': 'RI', 'poggio bustone': 'RI', 'poggio catino': 'RI', 'poggio moi': 'RI',
  'poggio san lorenzo': 'RI', 'posta': 'RI', 'rivodutri': 'RI', 'roccantica': 'RI',
  'roccasinibalda': 'RI', 'salario': 'RI', 'scoppito': 'RI', 'stimigliano': 'RI',
  'torricella in sabina': 'RI', 'torri in sabina': 'RI', 'vacone': 'RI',
  'varco sabino': 'RI', 'villalago': 'RI', 'villanova': 'RI',
};

function getProvince(city) {
  const normalized = city.trim().toLowerCase();
  return PROVINCE_FROM_CITY[normalized] || 'LT';
}

async function fixEventProvinces() {
  console.log('Fetching all events...');
  const events = await prisma.event.findMany({
    select: { id: true, city: true, province: true, title: true }
  });

  console.log(`Found ${events.length} events to check`);

  let fixed = 0;
  let skipped = 0;

  for (const event of events) {
    const correctProvince = getProvince(event.city || '');
    if (event.province !== correctProvince) {
      console.log(`Fixing: ${event.title} | City: ${event.city} | Province: ${event.province} -> ${correctProvince}`);
      await prisma.event.update({
        where: { id: event.id },
        data: { province: correctProvince }
      });
      fixed++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone: ${fixed} fixed, ${skipped} already correct`);
}

fixEventProvinces()
  .catch(console.error)
  .finally(() => prisma.$disconnect());