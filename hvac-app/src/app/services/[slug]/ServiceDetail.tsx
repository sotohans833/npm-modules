"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { ButtonLink, Card, Section } from "@/components/ui";
import { Alert as AlertIcon, Check, ChevronRight, Phone, ServiceIcon } from "@/components/icons";
import { FaqList } from "@/components/Faq";
import { company, telHref } from "@/lib/company";

export function ServiceDetail({ slug }: { slug: string }) {
  const { t, dict } = useLanguage();

  const index = dict.services.items.findIndex((service) => service.slug === slug);
  if (index === -1) notFound();

  const service = dict.services.items[index];
  const others = dict.services.items.filter((entry) => entry.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="border-b border-slate-200 bg-cool-900 text-white">
        <div className="container-page py-14 sm:py-16">
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-cool-200">
            <Link href="/services" className="hover:text-white">{t("nav.services")}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{service.title}</span>
          </nav>

          <div className="flex flex-wrap items-start gap-5">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-heat-500/20 text-heat-300">
              <ServiceIcon name={service.icon} className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="h1">{service.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-cool-100 sm:text-lg">
                {service.summary}
              </p>
              <p className="mt-4 inline-block rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-heat-200">
                {t("services.startingAt")}: {service.price}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={`/book?service=${slug}`} size="lg">{t("common.bookNow")}</ButtonLink>
            <ButtonLink
              href="/quote"
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-white hover:bg-white/15"
            >
              {t("common.getQuote")}
            </ButtonLink>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <h2 className="h3">{t("services.includesTitle")}</h2>
            <ul className="mt-5 space-y-3">
              {service.includes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="h3">{t("services.signsTitle")}</h2>
            <ul className="mt-5 space-y-3">
              {service.signs.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft">
                  <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-heat-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-ink-soft">{t("contact.emergencyBody")}</p>
              <a
                href={telHref(company.emergencyPhone)}
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-heat-600"
              >
                <Phone className="h-4 w-4" />
                {company.emergencyPhone}
              </a>
            </div>
          </Card>
        </div>
      </Section>

      <Section className="bg-slate-50">
        <h2 className="h2 text-center">{t("home.faqTitle")}</h2>
        <div className="mx-auto mt-8 max-w-3xl">
          <FaqList limit={5} />
        </div>
      </Section>

      <Section>
        <h2 className="h2">{t("home.servicesTitle")}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {others.map((other) => (
            <Link
              key={other.slug}
              href={`/services/${other.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:border-heat-300 hover:shadow-lift"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-heat-50 text-heat-600">
                <ServiceIcon name={other.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-ink">{other.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{other.summary}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
