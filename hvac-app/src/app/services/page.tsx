"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { ButtonLink, Section } from "@/components/ui";
import { ChevronRight, ServiceIcon } from "@/components/icons";

export default function ServicesPage() {
  const { t, dict } = useLanguage();

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow">{t("nav.services")}</p>
          <h1 className="h1 mt-2 max-w-3xl">{t("services.title")}</h1>
          <p className="lead mt-4 max-w-2xl">{t("services.subtitle")}</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-5 sm:grid-cols-2">
          {dict.services.items.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-heat-300 hover:shadow-lift"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-heat-50 text-heat-600">
                <ServiceIcon name={service.icon} className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-ink">{service.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{service.summary}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  {t("services.startingAt")}: {service.price}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-heat-600">
                  {t("common.learnMore")}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/book" size="lg">{t("common.bookNow")}</ButtonLink>
          <ButtonLink href="/quote" size="lg" variant="outline">{t("common.getQuote")}</ButtonLink>
        </div>
      </Section>
    </>
  );
}
