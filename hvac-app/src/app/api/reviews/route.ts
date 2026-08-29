import { ok } from "@/lib/api";
import { getReviews } from "@/lib/reviews";
import { isLocale } from "@/i18n";

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("locale");
  const locale = isLocale(requested) ? requested : "en";

  return ok(await getReviews(locale));
}
