"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { Section } from "@/components/ui";
import { Calculator, ChevronRight, Gauge, Stethoscope } from "@/components/icons";

export default function ToolsPage() {
  const { t } = useLanguage();

  const tools = [
    {
      href: "/tools/diagnose",
      icon: <Stethoscope className="h-6 w-6" />,
      title: t("tools.diagnoseTitle"),
      body: t("tools.diagnoseSubtitle"),
    },
    {
      href: "/tools/sizing",
      icon: <Calculator className="h-6 w-6" />,
      title: t("tools.sizingTitle"),
      body: t("tools.sizingSubtitle"),
    },
    {
      href: "/tools/savings",
      icon: <Gauge className="h-6 w-6" />,
      title: t("tools.savingsTitle"),
      body: t("tools.savingsSubtitle"),
    },
  ];

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow">{t("nav.tools")}</p>
          <h1 className="h1 mt-2">{t("tools.title")}</h1>
          <p className="lead mt-4 max-w-2xl">{t("tools.subtitle")}</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-cool-300 hover:shadow-lift"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cool-50 text-cool-700">
                {tool.icon}
              </span>
              <h2 className="mt-4 text-base font-semibold text-ink">{tool.title}</h2>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">{tool.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cool-700">
                {t("common.learnMore")}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
