export interface Cinema {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  province: string;
  phone?: string;
  website?: string;
  sourceUrls: { label: string; url: string }[];
}

export const CINEMAS_LATINA: Cinema[] = [
  {
    id: "supercinema",
    name: "Supercinema 2.0",
    slug: "supercinema",
    address: "Corso della Repubblica, 277",
    city: "Latina",
    province: "LT",
    website: "https://www.cinemalatina.it/supercinema-2-0.html",
    sourceUrls: [
      { label: "cinemalatina.it", url: "https://www.cinemalatina.it/" },
      { label: "appuntamentoalcinema.it", url: "http://appuntamentoalcinema.it/sale-cinematografiche/supercinema-2" },
    ],
  },
  {
    id: "multisala-corso",
    name: "Multisala Corso",
    slug: "multisala-corso",
    address: "Corso della Repubblica, 148",
    city: "Latina",
    province: "LT",
    website: "https://www.cinemalatina.it/multisala-corso.html",
    sourceUrls: [
      { label: "cinemalatina.it", url: "https://www.cinemalatina.it/" },
      { label: "appuntamentoalcinema.it", url: "http://appuntamentoalcinema.it/sale-cinematografiche/corso-1" },
    ],
  },
  {
    id: "arena-corso",
    name: "Arena Corso",
    slug: "arena-corso",
    address: "Corso della Repubblica, 148",
    city: "Latina",
    province: "LT",
    sourceUrls: [
      { label: "appuntamentoalcinema.it", url: "http://appuntamentoalcinema.it/sale-cinematografiche/arena-corso" },
    ],
  },
  {
    id: "oxer",
    name: "Multisala Oxer",
    slug: "oxer",
    address: "Viale Pasquale Nervi, 124",
    city: "Latina",
    province: "LT",
    website: "https://multisalaoxer.18tickets.it/",
    sourceUrls: [
      { label: "appuntamentoalcinema.it", url: "http://appuntamentoalcinema.it/sale-cinematografiche/oxer" },
    ],
  },
];

export function getCinemaById(id: string): Cinema | undefined {
  return CINEMAS_LATINA.find(c => c.id === id || c.slug === id);
}
