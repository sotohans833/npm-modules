/**
 * PLACEHOLDER CONTENT — replace before launch.
 *
 * These are illustrative, not real customer reviews. Publishing invented
 * testimonials as if they were genuine is both an FTC problem and a trust
 * problem. Two honest ways to fill this in:
 *   1. Paste in real reviews the company already has, with permission.
 *   2. Pull them live from the Google Places API (`place_id` → `reviews`) and
 *      render them attributed to Google.
 */
export type Review = {
  id: string;
  author: string;
  rating: number;
  source: "Google" | "Facebook" | "Yelp";
  en: string;
  es: string;
  service: string;
  city: string;
};

export const SAMPLE_REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Sample review",
    rating: 5,
    source: "Google",
    en: "Replace this text with a real review from the company's Google profile.",
    es: "Reemplace este texto con una reseña real del perfil de Google de la empresa.",
    service: "AC repair",
    city: "Durham, NC",
  },
  {
    id: "r2",
    author: "Sample review",
    rating: 5,
    source: "Google",
    en: "Replace this text with a real review from the company's Google profile.",
    es: "Reemplace este texto con una reseña real del perfil de Google de la empresa.",
    service: "System replacement",
    city: "Raleigh, NC",
  },
  {
    id: "r3",
    author: "Sample review",
    rating: 5,
    source: "Google",
    en: "Replace this text with a real review from the company's Google profile.",
    es: "Reemplace este texto con una reseña real del perfil de Google de la empresa.",
    service: "Maintenance plan",
    city: "Chapel Hill, NC",
  },
];
