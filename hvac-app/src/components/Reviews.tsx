"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { Card, SectionHeading, Stars } from "./ui";
import { company } from "@/lib/company";
import { CURATED_REVIEWS, type Review } from "@/content/reviews";

type Payload = {
  reviews: Review[];
  rating: number;
  reviewCount: number;
  mode: "live" | "curated";
};

/**
 * Renders the curated copy immediately so the section never flashes empty,
 * then swaps in whatever Google returns once `/api/reviews` answers.
 */
export function Reviews({ limit = 6 }: { limit?: number }) {
  const { t, locale } = useLanguage();
  const [data, setData] = useState<Payload>({
    reviews: CURATED_REVIEWS,
    rating: company.rating,
    reviewCount: company.reviewCount,
    mode: "curated",
  });

  useEffect(() => {
    let active = true;

    fetch(`/api/reviews?locale=${locale}`)
      .then((response) => response.json())
      .then((payload: Payload) => {
        if (active && payload.reviews?.length) setData(payload);
      })
      .catch(() => {
        // Keep the curated set on the screen; there is nothing to recover.
      });

    return () => {
      active = false;
    };
  }, [locale]);

  return (
    <>
      <SectionHeading
        title={t("home.reviewsTitle")}
        subtitle={t("home.reviewsSubtitle", {
          rating: data.rating.toFixed(1),
          count: data.reviewCount,
        })}
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data.reviews.slice(0, limit).map((review) => (
          <Card key={review.id} className="flex flex-col">
            <Stars rating={review.rating} />

            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
              “{review.text[locale]}
              {review.truncated ? "…" : ""}”
            </blockquote>

            {review.ownerReply ? (
              <p className="mt-4 border-l-2 border-heat-200 pl-3 text-xs leading-relaxed text-ink-faint">
                <span className="font-semibold text-ink-soft">{company.shortName}:</span>{" "}
                {review.ownerReply[locale]}
              </p>
            ) : null}

            <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{review.author}</p>
                <p className="text-xs text-ink-faint">
                  {review.relativeTime[locale]} · {review.source}
                </p>
              </div>
              {review.truncated ? (
                <a
                  href={company.social.google}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-xs font-semibold text-heat-600 hover:text-heat-700"
                >
                  {t("home.reviewsReadFull")}
                </a>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center">
        <a
          href={company.social.google}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-heat-600 hover:text-heat-700"
        >
          {t("home.reviewsSeeOnGoogle")} →
        </a>
      </p>
    </>
  );
}
