"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  Field,
  Input,
  OptionCard,
  Section,
  Select,
  Toggle,
  cx,
} from "@/components/ui";
import { Check } from "@/components/icons";
import {
  BRAND_TIERS,
  DUCT_CONDITIONS,
  EFFICIENCY_TIERS,
  IAQ_PRODUCTS,
  PARTS,
  SYSTEM_TYPES,
  estimate,
  money,
  type BrandTierId,
  type DuctConditionId,
  type EfficiencyTierId,
  type IaqProductId,
  type PartId,
  type QuoteAnswers,
  type SystemTypeId,
} from "@/lib/pricing";
import type { SessionUser } from "@/lib/auth";

type Kind = QuoteAnswers["kind"];

export function QuoteWizard({ user }: { user: SessionUser | null }) {
  const { t, dict, locale } = useLanguage();
  const params = useSearchParams();

  const [kind, setKind] = useState<Kind | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    reference: string;
    email: string;
    low: number;
    high: number;
  } | null>(null);

  // One state bag per branch keeps switching between kinds non-destructive.
  const [part, setPart] = useState({
    part: "CAPACITOR" as PartId,
    underWarranty: false,
    emergency: false,
    difficultAccess: false,
  });
  const [system, setSystem] = useState({
    systemType: "HEAT_PUMP" as SystemTypeId,
    tons: 3,
    efficiency: "HIGH" as EfficiencyTierId,
    brandTier: "STANDARD" as BrandTierId,
    ductCondition: "GOOD" as DuctConditionId,
    extraZones: 0,
    smartThermostat: false,
    difficultAccess: false,
  });
  const [duct, setDuct] = useState({
    scope: "SEAL" as "SEAL" | "REPAIR" | "REPLACE",
    squareFeet: 1800,
    returns: 0,
  });
  const [iaq, setIaq] = useState<IaqProductId[]>(["MEDIA_FILTER"]);

  const [contact, setContact] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    city: user?.city ?? "",
    zip: user?.zip ?? "",
  });

  // Deep links from the sizing calculator and the savings page.
  useEffect(() => {
    const requested = params.get("kind");
    if (requested === "PART" || requested === "SYSTEM" || requested === "DUCTWORK" || requested === "INDOOR_AIR") {
      setKind(requested);
    }
    const tons = Number(params.get("tons"));
    if (tons >= 1.5 && tons <= 6) setSystem((current) => ({ ...current, tons }));
  }, [params]);

  const answers: QuoteAnswers | null = useMemo(() => {
    if (!kind) return null;
    if (kind === "PART") return { kind, ...part };
    if (kind === "SYSTEM") return { kind, ...system };
    if (kind === "DUCTWORK") return { kind, ...duct };
    return { kind, products: iaq };
  }, [kind, part, system, duct, iaq]);

  const range = useMemo(() => (answers ? estimate(answers) : null), [answers]);

  const contactValid =
    contact.name.trim().length > 1 &&
    contact.email.includes("@") &&
    contact.phone.replace(/\D/g, "").length >= 10 &&
    /^\d{5}$/.test(contact.zip);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!answers) return;

    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...contact,
        address: contact.address || undefined,
        city: contact.city || undefined,
        answers,
        locale,
      }),
    });

    setSubmitting(false);

    if (!response.ok) {
      setError(t("common.errorGeneric"));
      return;
    }

    const data = (await response.json()) as {
      quote: { reference: string; estimateLow: number; estimateHi: number };
    };
    setConfirmation({
      reference: data.quote.reference,
      email: contact.email,
      low: data.quote.estimateLow,
      high: data.quote.estimateHi,
    });
  }

  /* ------------------------------------------------------------- Confirmed */

  if (confirmation) {
    return (
      <Section>
        <Card className="mx-auto max-w-xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="h-7 w-7" />
          </span>
          <h1 className="h2 mt-5">{t("quote.successTitle")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {t("quote.successBody", {
              reference: confirmation.reference,
              email: confirmation.email,
            })}
          </p>
          <div className="mt-6 rounded-2xl bg-heat-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-heat-700">
              {t("common.estimatedRange")}
            </p>
            <p className="mt-1 text-3xl font-bold text-heat-800">
              {money(confirmation.low)} – {money(confirmation.high)}
            </p>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/book">{t("common.bookNow")}</ButtonLink>
            <ButtonLink href="/financing" variant="outline">{t("nav.financing")}</ButtonLink>
          </div>
        </Card>
      </Section>
    );
  }

  /* ---------------------------------------------------------------- Wizard */

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-10 sm:py-14">
          <h1 className="h1">{t("quote.title")}</h1>
          <p className="lead mt-3 max-w-2xl">{t("quote.subtitle")}</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-start">
          <div className="space-y-6">
            <Card>
              <h2 className="h3">{t("quote.kindTitle")}</h2>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {dict.quote.kinds.map((option) => (
                  <OptionCard
                    key={option.id}
                    selected={kind === option.id}
                    title={option.title}
                    body={option.body}
                    onClick={() => setKind(option.id as Kind)}
                  />
                ))}
              </div>
            </Card>

            {/* ------------------------------------------------------- PART */}
            {kind === "PART" ? (
              <Card className="space-y-6">
                <Field label={t("quote.partWhich")} htmlFor="part">
                  <Select
                    id="part"
                    value={part.part}
                    onChange={(event) => setPart({ ...part, part: event.target.value as PartId })}
                  >
                    {(Object.keys(PARTS) as PartId[]).map((id) => (
                      <option key={id} value={id}>
                        {dict.quote.parts[id]}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="space-y-2.5">
                  <Toggle
                    checked={part.underWarranty}
                    onChange={(value) => setPart({ ...part, underWarranty: value })}
                    label={t("quote.partWarranty")}
                    help={t("quote.partWarrantyHelp")}
                  />
                  <Toggle
                    checked={part.emergency}
                    onChange={(value) => setPart({ ...part, emergency: value })}
                    label={t("quote.partEmergency")}
                  />
                  <Toggle
                    checked={part.difficultAccess}
                    onChange={(value) => setPart({ ...part, difficultAccess: value })}
                    label={t("quote.partAccess")}
                  />
                </div>

                <Alert tone="info" title={t("quote.compareRepairTitle")}>
                  {t("quote.compareRepairBody")}
                </Alert>
              </Card>
            ) : null}

            {/* ----------------------------------------------------- SYSTEM */}
            {kind === "SYSTEM" ? (
              <Card className="space-y-6">
                <div>
                  <p className="label">{t("quote.systemWhich")}</p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {(Object.keys(SYSTEM_TYPES) as SystemTypeId[]).map((id) => (
                      <OptionCard
                        key={id}
                        selected={system.systemType === id}
                        title={dict.quote.systems[id]}
                        onClick={() => setSystem({ ...system, systemType: id })}
                      />
                    ))}
                  </div>
                </div>

                <Field label={t("quote.systemTons")} help={t("quote.systemTonsHelp")} htmlFor="tons">
                  <div className="flex items-center gap-4">
                    <input
                      id="tons"
                      type="range"
                      min={1.5}
                      max={6}
                      step={0.5}
                      value={system.tons}
                      onChange={(event) => setSystem({ ...system, tons: Number(event.target.value) })}
                      className="w-full accent-heat-500"
                    />
                    <span className="w-16 shrink-0 text-right text-sm font-semibold text-ink">
                      {system.tons}
                    </span>
                  </div>
                </Field>

                <div>
                  <p className="label">{t("quote.systemEfficiency")}</p>
                  <div className="grid gap-2.5">
                    {(Object.keys(EFFICIENCY_TIERS) as EfficiencyTierId[]).map((id) => (
                      <OptionCard
                        key={id}
                        selected={system.efficiency === id}
                        title={dict.quote.efficiencies[id]}
                        onClick={() => setSystem({ ...system, efficiency: id })}
                      />
                    ))}
                  </div>
                </div>

                <Field label={t("quote.systemBrand")} htmlFor="brandTier">
                  <Select
                    id="brandTier"
                    value={system.brandTier}
                    onChange={(event) =>
                      setSystem({ ...system, brandTier: event.target.value as BrandTierId })
                    }
                  >
                    {(Object.keys(BRAND_TIERS) as BrandTierId[]).map((id) => (
                      <option key={id} value={id}>
                        {dict.quote.brands[id]}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label={t("quote.systemDucts")} htmlFor="ductCondition">
                  <Select
                    id="ductCondition"
                    value={system.ductCondition}
                    onChange={(event) =>
                      setSystem({ ...system, ductCondition: event.target.value as DuctConditionId })
                    }
                  >
                    {(Object.keys(DUCT_CONDITIONS) as DuctConditionId[]).map((id) => (
                      <option key={id} value={id}>
                        {dict.quote.ducts[id]}
                      </option>
                    ))}
                  </Select>
                </Field>

                {system.systemType === "MINI_SPLIT" ? (
                  <Field label={t("quote.systemZones")} htmlFor="zones">
                    <Select
                      id="zones"
                      value={system.extraZones}
                      onChange={(event) =>
                        setSystem({ ...system, extraZones: Number(event.target.value) })
                      }
                    >
                      {[0, 1, 2, 3, 4, 5].map((count) => (
                        <option key={count} value={count}>
                          {count}
                        </option>
                      ))}
                    </Select>
                  </Field>
                ) : null}

                <div className="space-y-2.5">
                  <Toggle
                    checked={system.smartThermostat}
                    onChange={(value) => setSystem({ ...system, smartThermostat: value })}
                    label={t("quote.systemThermostat")}
                  />
                  <Toggle
                    checked={system.difficultAccess}
                    onChange={(value) => setSystem({ ...system, difficultAccess: value })}
                    label={t("quote.systemAccess")}
                  />
                </div>
              </Card>
            ) : null}

            {/* --------------------------------------------------- DUCTWORK */}
            {kind === "DUCTWORK" ? (
              <Card className="space-y-6">
                <div>
                  <p className="label">{t("quote.ductScope")}</p>
                  <div className="grid gap-2.5 sm:grid-cols-3">
                    {(["SEAL", "REPAIR", "REPLACE"] as const).map((scope) => (
                      <OptionCard
                        key={scope}
                        selected={duct.scope === scope}
                        title={dict.quote.ductScopes[scope]}
                        onClick={() => setDuct({ ...duct, scope })}
                      />
                    ))}
                  </div>
                </div>

                <Field label={t("quote.ductSqft")} htmlFor="ductSqft">
                  <Input
                    id="ductSqft"
                    type="number"
                    min={300}
                    max={10000}
                    step={50}
                    className="no-spin"
                    value={duct.squareFeet}
                    onChange={(event) =>
                      setDuct({ ...duct, squareFeet: Number(event.target.value) || 300 })
                    }
                  />
                </Field>

                <Field label={t("quote.ductReturns")} htmlFor="returns">
                  <Select
                    id="returns"
                    value={duct.returns}
                    onChange={(event) => setDuct({ ...duct, returns: Number(event.target.value) })}
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </Select>
                </Field>
              </Card>
            ) : null}

            {/* -------------------------------------------------- INDOOR_AIR */}
            {kind === "INDOOR_AIR" ? (
              <Card>
                <p className="label">{t("quote.iaqProducts")}</p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {(Object.keys(IAQ_PRODUCTS) as IaqProductId[]).map((id) => {
                    const active = iaq.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          setIaq((current) =>
                            current.includes(id)
                              ? current.filter((entry) => entry !== id)
                              : [...current, id],
                          )
                        }
                        className={cx(
                          "flex items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-colors",
                          active
                            ? "border-heat-500 bg-heat-50"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                        )}
                      >
                        <span className="text-sm font-medium text-ink">{dict.quote.iaq[id]}</span>
                        <span className="shrink-0 text-sm font-semibold text-ink-faint">
                          {money(IAQ_PRODUCTS[id])}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            ) : null}

            {/* ---------------------------------------------------- Contact */}
            {kind ? (
              <Card>
                <h2 className="h3">{t("quote.contactTitle")}</h2>
                <form onSubmit={submit} className="mt-6 space-y-5">
                  {error ? <Alert tone="danger">{error}</Alert> : null}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label={t("common.name")} required htmlFor="qname">
                      <Input
                        id="qname"
                        required
                        value={contact.name}
                        onChange={(event) => setContact({ ...contact, name: event.target.value })}
                        autoComplete="name"
                      />
                    </Field>
                    <Field label={t("common.phone")} required htmlFor="qphone">
                      <Input
                        id="qphone"
                        required
                        type="tel"
                        value={contact.phone}
                        onChange={(event) => setContact({ ...contact, phone: event.target.value })}
                        autoComplete="tel"
                      />
                    </Field>
                  </div>

                  <Field label={t("common.email")} required htmlFor="qemail">
                    <Input
                      id="qemail"
                      required
                      type="email"
                      value={contact.email}
                      onChange={(event) => setContact({ ...contact, email: event.target.value })}
                      autoComplete="email"
                    />
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label={t("common.zip")} required htmlFor="qzip">
                      <Input
                        id="qzip"
                        required
                        inputMode="numeric"
                        className="no-spin"
                        value={contact.zip}
                        onChange={(event) =>
                          setContact({
                            ...contact,
                            zip: event.target.value.replace(/\D/g, "").slice(0, 5),
                          })
                        }
                        autoComplete="postal-code"
                      />
                    </Field>
                    <Field label={`${t("common.city")} (${t("common.optional")})`} htmlFor="qcity">
                      <Input
                        id="qcity"
                        value={contact.city}
                        onChange={(event) => setContact({ ...contact, city: event.target.value })}
                        autoComplete="address-level2"
                      />
                    </Field>
                  </div>

                  <Button type="submit" size="lg" disabled={submitting || !contactValid} className="w-full">
                    {submitting ? t("common.sending") : t("quote.submitCta")}
                  </Button>
                </form>
              </Card>
            ) : null}
          </div>

          {/* ------------------------------------------------- Live estimate */}
          <div className="lg:sticky lg:top-28">
            <Card className="bg-gradient-to-br from-heat-50 to-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-heat-700">
                {t("quote.liveEstimate")}
              </p>
              {range && range.high > 0 ? (
                <>
                  <p className="mt-2 text-4xl font-bold tracking-tight text-heat-800">
                    {money(range.low)}
                  </p>
                  <p className="text-2xl font-semibold text-heat-700">– {money(range.high)}</p>
                </>
              ) : (
                <p className="mt-2 text-2xl font-semibold text-ink-faint">—</p>
              )}
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                {t("quote.liveEstimateHelp")}
              </p>
            </Card>

            <div className="mt-5">
              <Alert tone="info">{t("quote.disclaimer")}</Alert>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/tools/sizing" variant="outline">
                {t("tools.sizingTitle")}
              </ButtonLink>
              <ButtonLink href="/financing" variant="outline">
                {t("nav.financing")}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
