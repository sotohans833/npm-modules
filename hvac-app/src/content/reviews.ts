/**
 * Real reviews from the company's Google Business Profile, transcribed from
 * the public listing.
 *
 * These are the *fallback* set: when `GOOGLE_PLACES_API_KEY` and
 * `GOOGLE_PLACE_ID` are configured, `src/lib/reviews.ts` pulls the current
 * reviews straight from Google instead, so the site never drifts out of date.
 * Keeping a hand-curated copy here means the section still renders if the API
 * is down, over quota, or not yet set up.
 *
 * Two rules when editing this file:
 *   1. Never write a review that a customer did not write. Transcribe only.
 *   2. Google's card truncates long reviews with "… More". Where that happened
 *      the text below stops at the same point and `truncated` is true, so the
 *      UI can show an ellipsis and link to the full review rather than have
 *      anyone invent an ending.
 */

export type Review = {
  id: string;
  author: string;
  rating: number;
  /** Relative age, matching how Google presents it. */
  relativeTime: { en: string; es: string };
  text: { en: string; es: string };
  /** Google cut the text off; we link out instead of guessing the rest. */
  truncated: boolean;
  source: "Google";
  /** The owner's public reply, when there is one. */
  ownerReply?: { en: string; es: string };
};

export const CURATED_REVIEWS: Review[] = [
  {
    id: "nancy-c-nye",
    author: "Nancy C. Nye",
    rating: 5,
    relativeTime: { en: "a month ago", es: "hace un mes" },
    truncated: false,
    source: "Google",
    text: {
      en: "We've had a maintenance contract with All-weather for nearly a decade. We are always satisfied with the work they do, including installing a new high efficiency unit for our upstairs several years ago. Their techs are knowledgeable and efficient, and really nice people.",
      es: "Hemos tenido un contrato de mantenimiento con All Weather por casi una década. Siempre quedamos satisfechos con el trabajo que hacen, incluida la instalación de una unidad nueva de alta eficiencia para el segundo piso hace varios años. Sus técnicos son competentes y eficientes, y muy buena gente.",
    },
  },
  {
    id: "mike-w",
    author: "Mike W",
    rating: 5,
    relativeTime: { en: "2 months ago", es: "hace 2 meses" },
    truncated: true,
    source: "Google",
    text: {
      en: "David performed the semi-annual summer maintenance on my system. He was friendly and articulate. As a result of his exam, he recommended replacing an important capacitor and he validated this with photos of the current readings and status",
      es: "David hizo el mantenimiento semestral de verano de mi sistema. Fue amable y claro al explicar. Como resultado de su revisión, recomendó reemplazar un capacitor importante y lo respaldó con fotos de las lecturas y el estado actuales",
    },
  },
  {
    id: "alison-mccandless",
    author: "Alison McCandless",
    rating: 5,
    relativeTime: { en: "3 months ago", es: "hace 3 meses" },
    truncated: true,
    source: "Google",
    text: {
      en: "All Weather has provided me with exceptional service and I would recommend them to anyone looking to upgrade or repair your HVAC system. The customer service was excellent. I had to replace both my systems within a few months of each other",
      es: "All Weather me ha dado un servicio excepcional y se los recomendaría a cualquiera que busque mejorar o reparar su sistema de climatización. La atención al cliente fue excelente. Tuve que reemplazar mis dos sistemas con pocos meses de diferencia",
    },
  },
  {
    id: "john-meeker",
    author: "John Meeker",
    rating: 5,
    relativeTime: { en: "5 months ago", es: "hace 5 meses" },
    truncated: true,
    source: "Google",
    text: {
      en: "No pressure, straight shooters. They listen to what you want and need, they do what they say they will, and they do it at an elite level. I am very pleased with All weather, from quote all the way to install, I felt that everyone I",
      es: "Sin presión, gente directa. Escuchan lo que uno quiere y necesita, hacen lo que dicen que van a hacer, y lo hacen a un nivel de primera. Estoy muy satisfecho con All Weather, desde la cotización hasta la instalación; sentí que todos los que",
    },
  },
  {
    id: "jim-gogan",
    author: "Jim Gogan",
    rating: 5,
    relativeTime: { en: "5 months ago", es: "hace 5 meses" },
    truncated: true,
    source: "Google",
    text: {
      en: 'I have been a customer of All Weather H&C for over 30 years (before they became "All Weather") and I\'ve never felt the need to consider anyone else. David Soto was here today for our seasonal checkup and he provided the high quality of',
      es: 'He sido cliente de All Weather H&C por más de 30 años (desde antes de que se llamaran "All Weather") y nunca he sentido la necesidad de considerar a nadie más. David Soto vino hoy para nuestra revisión de temporada y brindó la alta calidad de',
    },
    ownerReply: {
      en: "Jim, long time great customer, thank you for the kind words.",
      es: "Jim, gran cliente de muchos años, gracias por sus amables palabras.",
    },
  },
  {
    id: "eugenia-hatley",
    author: "Eugenia Hatley",
    rating: 5,
    relativeTime: { en: "7 months ago", es: "hace 7 meses" },
    truncated: true,
    source: "Google",
    text: {
      en: "Excellent customer service and installation. All staff were knowledgeable, very attentive, communicative, and helpful. The quote was prompt and pricing was very fair for the new system purchased (Lennox). The electric service technician",
      es: "Excelente atención al cliente e instalación. Todo el personal fue competente, muy atento, comunicativo y servicial. La cotización llegó rápido y el precio fue muy justo para el sistema nuevo que compramos (Lennox). El técnico del servicio eléctrico",
    },
  },
];
