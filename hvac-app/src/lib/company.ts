/**
 * Single source of truth for the business profile. Everything is overridable
 * through environment variables so the same code can be reused for another
 * branch or franchise without touching components.
 */
export const company = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "All Weather Heating & Cooling, Inc.",
  shortName: "All Weather HVAC",
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "(919) 967-9775",
  emergencyPhone: process.env.NEXT_PUBLIC_COMPANY_EMERGENCY_PHONE || "(919) 230-8572",
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "service@yourallweatherhvac.com",
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "1301 S Briggs Ave #116, Durham, NC 27703",
  site: process.env.NEXT_PUBLIC_COMPANY_SITE || "https://www.yourallweatherhvac.com",
  foundedYear: 2009,
  rating: 4.8,
  reviewCount: 270,
  // TODO: replace with the real NC license numbers before going live.
  license: "Licensed & insured in North Carolina",
  hours: "24/7",
  social: {
    facebook: "https://www.facebook.com/allweatherheatingandcoolingnc/",
    google: "https://maps.google.com/?q=All+Weather+Heating+%26+Cooling+Durham+NC",
  },
} as const;

/** Digits-only phone for `tel:` links. */
export function telHref(phone: string) {
  return `tel:+1${phone.replace(/\D/g, "")}`;
}
