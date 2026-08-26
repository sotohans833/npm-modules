"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Alert, ButtonLink, Card, Field, Input, Section, Select } from "@/components/ui";
import { Calculator } from "@/components/icons";
import { estimateTonnage } from "@/lib/pricing";

export default function SizingPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    squareFeet: 1800,
    ceilingHeight: 8,
    insulation: "AVERAGE" as "POOR" | "AVERAGE" | "GOOD",
    sunExposure: "AVERAGE" as "SHADED" | "AVERAGE" | "SUNNY",
    occupants: 3,
    stories: 1,
  });

  const result = useMemo(() => estimateTonnage(form), [form]);

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            {t("nav.tools")}
          </p>
          <h1 className="h1 mt-2">{t("tools.sizingTitle")}</h1>
          <p className="lead mt-4 max-w-2xl">{t("tools.sizingSubtitle")}</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <Card>
            <div className="space-y-5">
              <Field label={t("tools.sizingSqft")} htmlFor="sqft">
                <Input
                  id="sqft"
                  type="number"
                  min={300}
                  max={6000}
                  step={50}
                  value={form.squareFeet}
                  className="no-spin"
                  onChange={(event) =>
                    setForm({ ...form, squareFeet: Number(event.target.value) || 0 })
                  }
                />
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={50}
                  value={form.squareFeet}
                  onChange={(event) => setForm({ ...form, squareFeet: Number(event.target.value) })}
                  className="mt-3 w-full accent-heat-500"
                  aria-label={t("tools.sizingSqft")}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t("tools.sizingCeiling")} htmlFor="ceiling">
                  <Input
                    id="ceiling"
                    type="number"
                    min={7}
                    max={20}
                    step={0.5}
                    value={form.ceilingHeight}
                    className="no-spin"
                    onChange={(event) =>
                      setForm({ ...form, ceilingHeight: Number(event.target.value) || 8 })
                    }
                  />
                </Field>
                <Field label={t("tools.sizingOccupants")} htmlFor="occupants">
                  <Input
                    id="occupants"
                    type="number"
                    min={1}
                    max={12}
                    value={form.occupants}
                    className="no-spin"
                    onChange={(event) =>
                      setForm({ ...form, occupants: Number(event.target.value) || 1 })
                    }
                  />
                </Field>
              </div>

              <Field label={t("tools.sizingInsulation")} htmlFor="insulation">
                <Select
                  id="insulation"
                  value={form.insulation}
                  onChange={(event) =>
                    setForm({ ...form, insulation: event.target.value as typeof form.insulation })
                  }
                >
                  <option value="POOR">{t("tools.sizingInsulationPOOR")}</option>
                  <option value="AVERAGE">{t("tools.sizingInsulationAVERAGE")}</option>
                  <option value="GOOD">{t("tools.sizingInsulationGOOD")}</option>
                </Select>
              </Field>

              <Field label={t("tools.sizingSun")} htmlFor="sun">
                <Select
                  id="sun"
                  value={form.sunExposure}
                  onChange={(event) =>
                    setForm({ ...form, sunExposure: event.target.value as typeof form.sunExposure })
                  }
                >
                  <option value="SHADED">{t("tools.sizingSunSHADED")}</option>
                  <option value="AVERAGE">{t("tools.sizingSunAVERAGE")}</option>
                  <option value="SUNNY">{t("tools.sizingSunSUNNY")}</option>
                </Select>
              </Field>

              <Field label={t("tools.sizingStories")} htmlFor="stories">
                <Select
                  id="stories"
                  value={form.stories}
                  onChange={(event) => setForm({ ...form, stories: Number(event.target.value) })}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </Select>
              </Field>
            </div>
          </Card>

          <div className="space-y-5 lg:sticky lg:top-28">
            <Card className="bg-gradient-to-br from-cool-50 to-white">
              <p className="text-sm font-medium text-cool-700">{t("tools.sizingResult")}</p>
              <p className="mt-1 text-5xl font-bold tracking-tight text-cool-900">
                {t("tools.sizingTons", { tons: result.tons })}
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                {t("tools.sizingBtu", { btu: result.btu.toLocaleString() })}
              </p>
            </Card>

            <Alert tone="warning">{t("tools.sizingNote")}</Alert>

            <div className="flex flex-wrap gap-3">
              <ButtonLink href={`/quote?kind=SYSTEM&tons=${result.tons}`}>
                {t("common.getQuote")}
              </ButtonLink>
              <ButtonLink href="/book" variant="outline">{t("common.bookNow")}</ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
