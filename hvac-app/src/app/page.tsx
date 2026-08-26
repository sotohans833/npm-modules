"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { ButtonLink, Card, Section, SectionHeading, Stars } from "@/components/ui";
import { ServiceIcon, Check, ChevronRight, Phone, Sparkle, Stethoscope, Calculator, Gauge } from "@/components/icons";
import { ZipChecker } from "@/components/ZipChecker";
import { FaqList } from "@/components/Faq";
import { company, telHref } from "@/lib/company";
import { SAMPLE_REVIEWS } from "@/content/reviews";

const BRANDS = ["Carrier", "Bryant", "Trane", "Lennox", "Rheem", "Goodman", "American Standard", "Mitsubishi"];

export default function HomePage() {
  const { t, dict, locale } = useLanguage();

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-cool-900 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(60% 55% at 80% 10%, rgba(245,129,31,.35) 0%, transparent 60%), radial-gradient(55% 50% at 15% 85%, rgba(30,122,192,.5) 0%, transparent 65%)",
          }}
        />
        <div className="container-page relative grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div className="animate-fade-up">
            <p className="chip border-white/20 bg-white/10 text-cool-100">
              <Sparkle className="h-3.5 w-3.5 text-heat-300" />
              {t("home.badge", { year: company.foundedYear })}
            </p>
            <h1 className="h1 mt-5">{t("home.heroTitle")}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-cool-100 sm:text-lg">
              {t("home.heroSubtitle")}
            </p>

            <ul className="mt-7 space-y-2.5">
              {dict.home.heroPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-cool-50 sm:text-base">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-heat-300" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/book" size="lg">
                {t("home.heroCtaPrimary")}
              </ButtonLink>
              <ButtonLink
                href="/quote"
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 text-white hover:bg-white/15"
              >
                {t("home.heroCtaSecondary")}
              </ButtonLink>
            </div>

            <a
              href={telHref(company.emergencyPhone)}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-heat-300 hover:text-heat-200"
            >
              <Phone className="h-4 w-4" />
              {t("common.emergency")} · {company.emergencyPhone}
            </a>
          </div>

          {/* Coverage check is the fastest possible first interaction. */}
          <div className="rounded-3xl border border-white/15 bg-white/[.07] p-6 backdrop-blur-sm sm:p-8">
            <h2 className="text-lg font-semibold text-white">{t("home.areaTitle")}</h2>
            <p className="mt-1.5 text-sm text-cool-100">{t("home.areaSubtitle")}</p>
            <div className="mt-4 rounded-2xl bg-white p-4 text-ink">
              <ZipChecker compact />
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-6 text-center">
              <Stat value={`${new Date().getFullYear() - company.foundedYear}+`} label={t("home.statsExperience")} />
              <Stat value={`${company.rating}★`} label={t("home.statsRating")} />
              <Stat value={t("home.statsResponseValue")} label={t("home.statsResponse")} />
              <Stat value={t("home.statsWarrantyValue")} label={t("home.statsWarranty")} />
            </dl>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Services */}
      <Section id="services">
        <SectionHeading
          eyebrow={t("nav.services")}
          title={t("home.servicesTitle")}
          subtitle={t("home.servicesSubtitle")}
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dict.services.items.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-heat-300 hover:shadow-lift"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-heat-50 text-heat-600">
                <ServiceIcon name={service.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{service.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{service.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-heat-600">
                {t("common.learnMore")}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------------- Self-serve */}
      <Section className="bg-slate-50">
        <SectionHeading
          eyebrow={t("nav.tools")}
          title={t("tools.title")}
          subtitle={t("tools.subtitle")}
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <ToolCard
            href="/tools/diagnose"
            icon={<Stethoscope className="h-6 w-6" />}
            title={t("tools.diagnoseTitle")}
            body={t("tools.diagnoseSubtitle")}
            cta={t("common.learnMore")}
          />
          <ToolCard
            href="/tools/sizing"
            icon={<Calculator className="h-6 w-6" />}
            title={t("tools.sizingTitle")}
            body={t("tools.sizingSubtitle")}
            cta={t("common.learnMore")}
          />
          <ToolCard
            href="/tools/savings"
            icon={<Gauge className="h-6 w-6" />}
            title={t("tools.savingsTitle")}
            body={t("tools.savingsSubtitle")}
            cta={t("common.learnMore")}
          />
        </div>
      </Section>

      {/* ----------------------------------------------------------------- Why */}
      <Section>
        <SectionHeading title={t("home.whyTitle")} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {dict.home.whyItems.map((item) => (
            <Card key={item.title} className="flex gap-4">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* --------------------------------------------------------------- Steps */}
      <Section className="bg-cool-900 text-white">
        <div className="max-w-2xl">
          <h2 className="h2">{t("home.stepsTitle")}</h2>
        </div>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dict.home.steps.map((step, index) => (
            <li key={step.title} className="relative rounded-2xl border border-white/15 bg-white/[.06] p-5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-heat-500 text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-cool-100">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* --------------------------------------------------------------- Plans */}
      <Section>
        <div className="grid items-center gap-10 rounded-3xl border border-slate-200 bg-gradient-to-br from-heat-50 to-white p-8 shadow-card sm:p-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">{t("nav.plans")}</p>
            <h2 className="h2 mt-2">{t("home.plansTeaserTitle")}</h2>
            <p className="lead mt-4">{t("home.plansTeaserBody")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/plans">{t("nav.plans")}</ButtonLink>
              <ButtonLink href="/book" variant="outline">
                {t("common.bookNow")}
              </ButtonLink>
            </div>
          </div>
          <ul className="space-y-3">
            {dict.plans.compareItems.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-xl bg-white p-3.5 text-sm shadow-sm">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-heat-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ------------------------------------------------------------- Reviews */}
      <Section className="bg-slate-50">
        <SectionHeading
          title={t("home.reviewsTitle")}
          subtitle={t("home.reviewsSubtitle", { rating: company.rating, count: company.reviewCount })}
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {SAMPLE_REVIEWS.map((review) => (
            <Card key={review.id} className="flex flex-col">
              <Stars rating={review.rating} />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">“{review[locale]}”</p>
              <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-ink-faint">
                <p className="font-semibold text-ink">{review.author}</p>
                <p>
                  {review.service} · {review.city} · {review.source}
                </p>
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center">
          <a
            href={company.social.google}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-heat-600 hover:text-heat-700"
          >
            {t("common.viewAll")} →
          </a>
        </p>
      </Section>

      {/* -------------------------------------------------------------- Brands */}
      <Section>
        <SectionHeading title={t("home.brandsTitle")} subtitle={t("home.brandsBody")} />
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {BRANDS.map((brand) => (
            <span
              key={brand}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-ink-soft shadow-sm"
            >
              {brand}
            </span>
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------------------- FAQ */}
      <Section className="bg-slate-50">
        <SectionHeading title={t("home.faqTitle")} />
        <div className="mx-auto mt-10 max-w-3xl">
          <FaqList limit={6} />
        </div>
      </Section>

      {/* ----------------------------------------------------------------- CTA */}
      <Section className="bg-heat-500 text-white">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="h2">{t("home.ctaTitle")}</h2>
          <p className="max-w-xl text-heat-50">{t("home.ctaBody")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/book" size="lg" variant="secondary">
              {t("common.bookNow")}
            </ButtonLink>
            <a
              href={telHref(company.phone)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-base font-semibold hover:bg-white/10"
            >
              <Phone className="h-5 w-5" />
              {company.phone}
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-2xl font-bold text-white">{value}</dt>
      <dd className="mt-0.5 text-xs text-cool-100">{label}</dd>
    </div>
  );
}

function ToolCard({
  href,
  icon,
  title,
  body,
  cta,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-cool-300 hover:shadow-lift"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cool-50 text-cool-700">
        {icon}
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cool-700">
        {cta}
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
