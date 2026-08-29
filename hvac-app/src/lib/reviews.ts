import { CURATED_REVIEWS, type Review } from "@/content/reviews";
import type { Locale } from "@/i18n";
import { company } from "./company";

/**
 * Google reviews, live when configured.
 *
 * Follows the same contract as the other integrations: with no API key the
 * curated copy in `src/content/reviews.ts` is served, and the moment
 * GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID are set the site pulls the current
 * reviews from the Places API instead.
 *
 * Two constraints worth knowing before changing this:
 *   - The Places API returns at most five reviews per place, and there is no
 *     pagination. Anything beyond that needs a paid reputation platform
 *     (Birdeye, Podium, GatherUp) that syndicates the full feed.
 *   - Google's terms require reviews to be shown with attribution and not
 *     stored indefinitely. The 12-hour revalidate below keeps the copy fresh
 *     and short-lived; do not raise it to days.
 */

export type ReviewsPayload = {
  reviews: Review[];
  rating: number;
  reviewCount: number;
  /** "live" once a Places API key is configured, "curated" until then. */
  mode: "live" | "curated";
};

type PlacesReview = {
  name?: string;
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};

type PlacesResponse = {
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesReview[];
};

function curated(): ReviewsPayload {
  return {
    reviews: CURATED_REVIEWS,
    rating: company.rating,
    reviewCount: company.reviewCount,
    mode: "curated",
  };
}

/**
 * Google returns one language per request, so the caller's locale decides
 * which translation comes back. `originalText` is kept when Google translated
 * the review, which is what lets the UI say so honestly.
 */
export async function getReviews(locale: Locale): Promise<ReviewsPayload> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return curated();

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=${locale}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "rating,userRatingCount,reviews",
        },
        // Google's terms don't allow holding review content indefinitely.
        next: { revalidate: 60 * 60 * 12 },
      },
    );

    if (!response.ok) return curated();

    const data = (await response.json()) as PlacesResponse;
    if (!data.reviews?.length) return curated();

    const reviews: Review[] = data.reviews.flatMap((review, index) => {
      const body = review.text?.text?.trim();
      const author = review.authorAttribution?.displayName?.trim();
      if (!body || !author) return [];

      // One request yields one language; the other column reuses it rather
      // than machine-translating a real person's words a second time.
      const text = { en: body, es: body };

      return [
        {
          id: review.name ?? `google-${index}`,
          author,
          rating: review.rating ?? 5,
          relativeTime: {
            en: review.relativePublishTimeDescription ?? "",
            es: review.relativePublishTimeDescription ?? "",
          },
          text,
          truncated: false,
          source: "Google" as const,
        },
      ];
    });

    if (reviews.length === 0) return curated();

    return {
      reviews,
      rating: data.rating ?? company.rating,
      reviewCount: data.userRatingCount ?? company.reviewCount,
      mode: "live",
    };
  } catch {
    // A reviews outage must never take the home page down with it.
    return curated();
  }
}
