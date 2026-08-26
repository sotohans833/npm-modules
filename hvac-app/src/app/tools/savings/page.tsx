"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Alert, ButtonLink, Card, Field, Input, Section } from "@/components/ui";
import { Gauge } from "@/components/icons";
import { estimateAnnualSavings, money } from "@/lib/pricing";

export default function SavingsPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ tons: 3, currentSeer: 10, newSeer: 17, centsPerKwh: 12.5 });

  const result = useMemo(() => estimateAnnualSavings(form), [form]);

  // Bar widths are relative to the more expensive of the two systems.
  const max = Math.max(result.currentAnnualCost, result.newAnnualCost, 1);

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            {t("nav.tools")}
          </p>
          <h1 className="h1 mt-2">{t("tools.savingsTitle")}</h1>
          <p className="lead mt-4 max-w-2xl">{t("tools.savingsSubtitle")}</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <Card>
            <div className="space-y-5">
              <Field label={t("tools.savingsTons")} htmlFor="tons">
                <Input
                  id="tons"
                  type="number"
                  min={1.5}
                  max={6}
                  step={0.5}
                  value={form.tons}
                  className="no-spin"
                  onChange={(event) => setForm({ ...form, tons: Number(event.target.value) || 1.5 })}
                />
              </Field>

              <Field
                label={t("tools.savingsCurrentSeer")}
                help={t("tools.savingsSeerHelp")}
                htmlFor="currentSeer"
              >
                <Input
                  id="currentSeer"
                  type="number"
                  min={6}
                  max={26}
                  step={0.5}
                  value={form.currentSeer}
                  className="no-spin"
                  onChange={(event) =>
                    setForm({ ...form, currentSeer: Math.max(6, Number(event.target.value) || 6) })
                  }
                />
                <input
                  type="range"
                  min={6}
                  max={26}
                  step={0.5}
                  value={form.currentSeer}
                  onChange={(event) => setForm({ ...form, currentSeer: Number(event.target.value) })}
                  className="mt-3 w-full accent-slate-400"
                  aria-label={t("tools.savingsCurrentSeer")}
                />
              </Field>

              <Field label={t("tools.savingsNewSeer")} htmlFor="newSeer">
                <Input
                  id="newSeer"
                  type="number"
                  min={13}
                  max={28}
                  step={0.5}
                  value={form.newSeer}
                  className="no-spin"
                  onChange={(event) =>
                    setForm({ ...form, newSeer: Math.max(13, Number(event.target.value) || 13) })
                  }
                />
                <input
                  type="range"
                  min={13}
                  max={28}
                  step={0.5}
                  value={form.newSeer}
                  onChange={(event) => setForm({ ...form, newSeer: Number(event.target.value) })}
                  className="mt-3 w-full accent-heat-500"
                  aria-label={t("tools.savingsNewSeer")}
                />
              </Field>

              <Field label={t("tools.savingsRate")} htmlFor="rate">
                <Input
                  id="rate"
                  type="number"
                  min={5}
                  max={40}
                  step={0.1}
                  value={form.centsPerKwh}
                  className="no-spin"
                  onChange={(event) =>
                    setForm({ ...form, centsPerKwh: Number(event.target.value) || 12.5 })
                  }
                />
              </Field>
            </div>
          </Card>

          <div className="space-y-5 lg:sticky lg:top-28">
            <Card className="bg-gradient-to-br from-emerald-50 to-white">
              <p className="text-sm font-medium text-emerald-700">{t("tools.savingsAnnual")}</p>
              <p className="mt-1 text-5xl font-bold tracking-tight text-emerald-800">
                {money(result.annualSavings)}
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                {t("tools.savingsTenYear")}: <strong>{money(result.tenYearSavings)}</strong>
              </p>
            </Card>

            <Card>
              <Bar
                label={t("tools.savingsCurrentCost")}
                value={result.currentAnnualCost}
                max={max}
                tone="bg-slate-400"
              />
              <div className="mt-5">
                <Bar
                  label={t("tools.savingsNewCost")}
                  value={result.newAnnualCost}
                  max={max}
                  tone="bg-heat-500"
                />
              </div>
            </Card>

            <Alert tone="info">{t("tools.savingsNote")}</Alert>

            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/quote?kind=SYSTEM">{t("common.getQuote")}</ButtonLink>
              <ButtonLink href="/financing" variant="outline">{t("nav.financing")}</ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function Bar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-ink-soft">{label}</span>
        <span className="text-lg font-semibold text-ink">{money(value)}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${tone}`}
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}
