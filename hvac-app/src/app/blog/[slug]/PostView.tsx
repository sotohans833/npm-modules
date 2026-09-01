"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { ButtonLink, Card, Section } from "@/components/ui";
import { Alert as AlertIcon, Check, ChevronRight } from "@/components/icons";
import { POSTS, getPost } from "@/content/posts";
import { formatDateShort } from "@/i18n";

export function PostView({ slug }: { slug: string }) {
  const { t, locale } = useLanguage();
  const post = getPost(slug);
  if (!post) notFound();

  const related = POSTS.filter((entry) => entry.slug !== slug).slice(0, 3);

  return (
    <>
      <article>
        <header className="border-b border-slate-200 bg-slate-50">
          <div className="container-page py-14 sm:py-16">
            <nav className="mb-6 flex items-center gap-1.5 text-xs text-ink-faint">
              <Link href="/blog" className="hover:text-heat-600">{t("blog.backToBlog")}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-ink">{post.title[locale]}</span>
            </nav>
            <h1 className="h1 max-w-3xl">{post.title[locale]}</h1>
            <p className="mt-4 text-sm text-ink-faint">
              {formatDateShort(post.date, locale)} · {t("blog.readTime", { min: post.readMinutes })}
            </p>
          </div>
        </header>

        <Section>
          <div className="mx-auto max-w-3xl space-y-6">
            {post.body.map((block, index) => {
              if (block.type === "h") {
                return (
                  <h2 key={index} className="h3 pt-4">
                    {block[locale]}
                  </h2>
                );
              }
              if (block.type === "p") {
                return (
                  <p key={index} className="text-base leading-relaxed text-ink-soft">
                    {block[locale]}
                  </p>
                );
              }
              if (block.type === "callout") {
                return (
                  <div
                    key={index}
                    className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5"
                  >
                    <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <p className="text-sm leading-relaxed text-amber-900">{block[locale]}</p>
                  </div>
                );
              }
              return (
                <ul key={index} className="space-y-3">
                  {block[locale].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-ink-soft">
                      <Check className="mt-1 h-5 w-5 shrink-0 text-heat-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              );
            })}
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <Card className="flex flex-col items-start gap-4 bg-gradient-to-br from-heat-50 to-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="h3">{t("home.ctaTitle")}</h2>
                <p className="mt-1 text-sm text-ink-soft">{t("home.ctaBody")}</p>
              </div>
              <ButtonLink href="/book" className="shrink-0">{t("common.bookNow")}</ButtonLink>
            </Card>
          </div>
        </Section>
      </article>

      <Section className="bg-slate-50">
        <h2 className="h2">{t("blog.relatedTitle")}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {related.map((entry) => (
            <Link
              key={entry.slug}
              href={`/blog/${entry.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:border-heat-300 hover:shadow-lift"
            >
              <h3 className="text-sm font-semibold leading-snug text-ink">{entry.title[locale]}</h3>
              <p className="mt-2 text-sm text-ink-soft">{entry.excerpt[locale]}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
