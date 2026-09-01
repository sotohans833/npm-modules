"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { ButtonLink, Card, Section, Stars } from "@/components/ui";
import { Check, MapPin, Shield } from "@/components/icons";
import { ZipChecker } from "@/components/ZipChecker";
import { company } from "@/lib/company";
import { mapEmbedUrl } from "@/lib/maps";

export default function AboutPage() {
  const { t, dict } = useLanguage();

  return (
    <>
      <section className="border-b border-slate-200 bg-cool-900 text-white">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow text-heat-300">{t("nav.about")}</p>
          <h1 className="h1 mt-2">{t("about.title")}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-cool-100 sm:text-lg">
            {t("about.subtitle", { year: company.foundedYear })}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2">
              <Stars rating={company.rating} />
              <span className="text-sm font-semibold">{company.rating}</span>
              <span className="text-sm text-cool-200">({company.reviewCount})</span>
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cool-100">
              {company.license}
            </span>
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="h2">{t("about.storyTitle")}</h2>
            <div className="mt-6 space-y-5">
              {dict.about.story.map((paragraph) => (
                <p key={paragraph} className="text-base leading-relaxed text-ink-soft">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <Card className="h-fit">
            <h3 className="h3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-heat-600" />
              {t("about.certificationsTitle")}
            </h3>
            <ul className="mt-5 space-y-3">
              {dict.about.certifications.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink-soft">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section className="bg-slate-50">
        <h2 className="h2">{t("about.valuesTitle")}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dict.about.values.map((value) => (
            <Card key={value.title}>
              <h3 className="text-base font-semibold text-ink">{value.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{value.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="h2 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-heat-600" />
              {t("about.areaTitle")}
            </h2>
            <p className="lead mt-4">{t("about.areaBody")}</p>
            <div className="mt-6">
              <ZipChecker />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-card">
            <iframe
              title={company.name}
              src={mapEmbedUrl(company.address)}
              className="h-80 w-full lg:h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Section>

      <Section className="bg-heat-500 text-white">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="h2">{t("home.ctaTitle")}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/book" size="lg" variant="secondary">{t("common.bookNow")}</ButtonLink>
            <ButtonLink
              href="/contact"
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              {t("nav.contact")}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
