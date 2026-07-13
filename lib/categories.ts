import { prisma } from "./prisma";

export const DEFAULT_CATEGORIES = [
  { name: "Musica", slug: "musica", icon: "music", color: "#FF6B6B" },
  { name: "Teatro", slug: "teatro", icon: "theater", color: "#FFA94D" },
  { name: "Cultura", slug: "cultura", icon: "book", color: "#FFD43B" },
  { name: "Cinema", slug: "cinema", icon: "film", color: "#8b5cf6" },
  { name: "Sport", slug: "sport", icon: "trophy", color: "#69DB7C" },
  { name: "Natura", slug: "natura", icon: "leaf", color: "#38D9A9" },
  { name: "Trekking", slug: "trekking", icon: "mountain", color: "#4C6EF5" },
  { name: "Montagna", slug: "montagna", icon: "mountain-snow", color: "#748FFC" },
  { name: "Escursioni", slug: "escursioni", icon: "compass", color: "#06b6d4" },
  { name: "Gite", slug: "gite", icon: "car", color: "#f59e0b" },
  { name: "Mare", slug: "mare", icon: "waves", color: "#06b6d4" },
  { name: "Spettacolo", slug: "spettacolo", icon: "sparkles", color: "#F783AC" },
  { name: "Enogastronomia", slug: "enogastronomia", icon: "wine", color: "#E67700" },
  { name: "Bambini", slug: "bambini", icon: "baby", color: "#FCC419" },
];

export async function seedCategories() {
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, color: cat.color },
      create: cat,
    });
  }
}
