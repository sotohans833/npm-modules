"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { Alert, Button, ButtonLink, Card, Section, cx } from "@/components/ui";
import { Alert as AlertIcon, Check, Phone, Stethoscope } from "@/components/icons";
import { SYMPTOMS, diagnose, type Urgency } from "@/lib/diagnostics";
import { company, telHref } from "@/lib/company";

type SystemFilter = "COOLING" | "HEATING" | "BOTH";

const URGENCY_TONE: Record<Urgency, "danger" | "warning" | "info"> = {
  EMERGENCY: "danger",
  URGENT: "warning",
  STANDARD: "info",
};

export default function DiagnosePage() {
  const { t, locale } = useLanguage();
  const router = useRouter();

  const [system, setSystem] = useState<SystemFilter>("BOTH");
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const visibleSymptoms = useMemo(
    () =>
      SYMPTOMS.filter(
        (symptom) => system === "BOTH" || symptom.systems.includes(system) || symptom.systems.includes("BOTH"),
      ),
    [system],
  );

  const result = useMemo(() => (submitted ? diagnose(selected) : null), [submitted, selected]);

  function toggle(id: string) {
    setSubmitted(false);
    setSelected((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  }

  function bookFromResult() {
    if (!result) return;
    const params = new URLSearchParams({
      service: result.recommendedService,
      urgency: result.urgency === "EMERGENCY" ? "EMERGENCY" : result.urgency,
      symptoms: selected.join(","),
    });
    router.push(`/book?${params.toString()}`);
  }

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            {t("nav.tools")}
          </p>
          <h1 className="h1 mt-2">{t("tools.diagnoseTitle")}</h1>
          <p className="lead mt-4 max-w-2xl">{t("tools.diagnoseSubtitle")}</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <Card>
            <h2 className="h3">{t("tools.diagnoseStep1")}</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(
                [
                  ["COOLING", t("tools.diagnoseCooling")],
                  ["HEATING", t("tools.diagnoseHeating")],
                  ["BOTH", t("tools.diagnoseBoth")],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSystem(value)}
                  className={cx(
                    "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                    system === value
                      ? "border-cool-600 bg-cool-700 text-white"
                      : "border-slate-300 text-ink-soft hover:bg-slate-50",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <h2 className="h3 mt-8">{t("tools.diagnoseStep2")}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {visibleSymptoms.map((symptom) => {
                const active = selected.includes(symptom.id);
                return (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() => toggle(symptom.id)}
                    aria-pressed={active}
                    className={cx(
                      "flex items-start gap-2.5 rounded-xl border p-3 text-left text-sm transition-colors",
                      active
                        ? "border-heat-500 bg-heat-50 text-ink"
                        : "border-slate-200 text-ink-soft hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    <span
                      className={cx(
                        "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border",
                        active ? "border-heat-500 bg-heat-500 text-white" : "border-slate-300",
                      )}
                    >
                      {active ? <Check className="h-3 w-3" /> : null}
                    </span>
                    {symptom[locale]}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => setSubmitted(true)} disabled={selected.length === 0}>
                {t("tools.diagnoseRun")}
              </Button>
              {selected.length > 0 ? (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setSelected([]);
                    setSubmitted(false);
                  }}
                >
                  {t("tools.diagnoseReset")}
                </Button>
              ) : null}
            </div>
            {submitted && selected.length === 0 ? (
              <p className="mt-3 text-sm text-red-600">{t("tools.diagnoseNoSelection")}</p>
            ) : null}
          </Card>

          <div className="space-y-5 lg:sticky lg:top-28">
            {result ? (
              <>
                <Alert tone={URGENCY_TONE[result.urgency]} title={t(`tools.diagnoseUrgency${result.urgency}`)}>
                  {result.callImmediately ? (
                    <a
                      href={telHref(company.emergencyPhone)}
                      className="mt-2 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      <Phone className="h-4 w-4" />
                      {company.emergencyPhone}
                    </a>
                  ) : null}
                </Alert>

                <Card>
                  <h2 className="h3">{t("tools.diagnoseResultTitle")}</h2>
                  <div className="mt-5 space-y-5">
                    {result.findings.map((finding) => (
                      <div key={finding.id} className="border-l-2 border-heat-300 pl-4">
                        <h3 className="text-sm font-semibold text-ink">
                          {locale === "es" ? finding.titleEs : finding.titleEn}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                          {locale === "es" ? finding.detailEs : finding.detailEn}
                        </p>
                        {(locale === "es" ? finding.selfCheckEs : finding.selfCheckEn) ? (
                          <div className="mt-3 rounded-lg bg-slate-50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                              {t("tools.diagnoseSelfCheck")}
                            </p>
                            <ul className="mt-2 space-y-1.5">
                              {(locale === "es" ? finding.selfCheckEs : finding.selfCheckEn)!.map((step) => (
                                <li key={step} className="flex items-start gap-2 text-sm text-ink-soft">
                                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <Button className="mt-6 w-full" size="lg" onClick={bookFromResult}>
                    {t("tools.diagnoseBookCta")}
                  </Button>
                  <p className="mt-4 flex gap-2 text-xs leading-relaxed text-ink-faint">
                    <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    {t("tools.diagnoseDisclaimer")}
                  </p>
                </Card>
              </>
            ) : (
              <Card className="bg-slate-50">
                <p className="text-sm leading-relaxed text-ink-soft">
                  {t("tools.diagnoseDisclaimer")}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <ButtonLink href="/book" variant="outline">{t("common.bookNow")}</ButtonLink>
                  <a
                    href={telHref(company.phone)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
                  >
                    <Phone className="h-4 w-4" />
                    {company.phone}
                  </a>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
