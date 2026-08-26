/**
 * Kept out of `lib/integrations` so client components can import it without
 * pulling the server-side email/SMS/payment code into the browser bundle.
 */
export function mapEmbedUrl(query: string) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (key) {
    return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(query)}`;
  }
  // Keyless fallback: enough for a location pin, no billing account required.
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}
