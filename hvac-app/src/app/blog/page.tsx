"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { Section } from "@/components/ui";
import { ChevronRight } from "@/components/icons";
import { POSTS } from "@/content/posts";
import { formatDateShort } from "@/i18n";

const SEASON_STYLES: Record<string, string> = {
  SPRING: "bg-emerald-100 text-emerald-800",
  SUMMER: "bg-heat-100 text-heat-800",
  FALL: "bg-amber-100 text-amber-800",
  WINTER: "bg-cool-100 text-cool-800",
  ANY: "bg-slate-100 text-slate-700",
};

export default function BlogPage() {
  const { t, locale } = useLanguage();
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow">{t("nav.blog")}</p>
          <h1 className="h1 mt-2">{t("blog.title")}</h1>
          <p className="lead mt-4 max-w-2xl">{t("blog.subtitle")}</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-heat-300 hover:shadow-lift"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className={`rounded-full px-2.5 py-1 font-semibold ${SEASON_STYLES[post.season]}`}>
                  {post.season}
                </span>
                <span className="text-ink-faint">
                  {t("blog.readTime", { min: post.readMinutes })}
                </span>
              </div>
              <h2 className="mt-4 text-base font-semibold leading-snug text-ink">
                {post.title[locale]}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                {post.excerpt[locale]}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-ink-faint">{formatDateShort(post.date, locale)}</span>
                <ChevronRight className="h-4 w-4 text-heat-600 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
