export const KIDS_KEYWORDS: RegExp[] = [
  /bambin/i, /bimbi/i, /bimbo/i, /bimba/i, /bimbe/i, /kids/i, /infanzia/i,
  /fanciulli/i, /piccolini/i, /piccolissimi/i, /beb[èe]/i, /neonat/i,
  /famiglia/i, /famiglie/i, /familiare/i, /genitori/i, /figli/i,
  /truccabimbi/i, /ludoteca/i, /ludobus/i,
  /burattini/i, /burattina/i, /marionette/i, /giocoleri/i, /mascotte/i,
  /laboratori? (?:creativ|per bambini|didattic)/i,
  /laboratorio (?:creativ|per bambini|didattic)/i,
  /lettura animata/i, /letture animate/i, /storie animate/i, /kamishibai/i,
  /centro estivo/i, /centri estivi/i, /campus estivo/i, /campus estivi/i,
  /estate ragazzi/i, /centri ricreativi/i,
  /parco giochi/i, /area giochi/i, /castelli gonfiabili/i, /gonfiabili/i,
  /giochi per bambini/i, /giochiamo/i, /giocattol/i,
  /scuola dell'infanzia/i, /asilo nido/i,
  /per bambini/i, /con i bambini/i, /dei bambini/i,
  /a misura di bambino/i, /da \d{1,2}\s*anni/i, /da \d{1,2}\s+mesi/i,
  /favole per/i, /fiabe per/i, /storie per/i, /albi illustrati/i,
  /animazione per bambini/i, /animatori/i,
  /parco divertimento/i, /circo/i, /circhi/i,
  /pupazzi/i, /dinosauri/i, /lego/i, /mattoncini/i,
  /colora/i, /disegn/i, /pittura per bambini/i,
  /mostra di giocattoli/i, /mercato del giocattolo/i,
];

export function isKidsEvent(title: string, description?: string): boolean {
  const text = `${title} ${description || ''}`.toLowerCase();
  return KIDS_KEYWORDS.some((re) => re.test(text));
}
