"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Alert, ButtonLink, Card, Field, Input, Section } from "@/components/ui";
import { Check, Sparkle } from "@/components/icons";
import { money } from "@/lib/pricing";

/** Standard amortised payment: P·r / (1 − (1+r)^−n). */
function monthlyPayment(principal: number, annualRatePct: number, months: number) {
  if (months <= 0) return 0;
  const rate = annualRatePct / 100 / 12;
  if (rate === 0) return principal / months;
  return (principal * rate) / (1 - Math.pow(1 + rate, -months));
}

export default function FinancingPage() {
  const { t, dict } = useLanguage();
  const [amount, setAmount] = useState(9000);
  const [term, setTerm] = useState(60);
  const [apr, setApr] = useState(9.99);

  const result = useMemo(() => {
    const payment = monthlyPayment(amount, apr, term);
    const total = payment * term;
    return { payment, total, interest: total - amount };
  }, [amount, apr, term]);

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow">{t("nav.financing")}</p>
          <h1 className="h1 mt-2 max-w-3xl">{t("financing.title")}</h1>
          <p className="lead mt-4 max-w-2xl">{t("financing.subtitle")}</p>
        </div>
      </section>

      <Section>
        <h2 className="h2">{t("financing.optionsTitle")}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {dict.financing.options.map((option) => (
            <Card key={option.title}>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-heat-50 text-heat-600">
                <Sparkle className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{option.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{option.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-slate-50">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <Card>
            <h2 className="h3">{t("financing.calcTitle")}</h2>
            <div className="mt-6 space-y-5">
              <Field label={t("financing.amount")} htmlFor="amount">
                <Input
                  id="amount"
                  type="number"
                  min={500}
                  max={40000}
                  step={100}
                  value={amount}
                  className="no-spin"
                  onChange={(event) => setAmount(Number(event.target.value) || 0)}
                />
                <input
                  type="range"
                  min={1000}
                  max={30000}
                  step={250}
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  className="mt-3 w-full accent-heat-500"
                  aria-label={t("financing.amount")}
                />
              </Field>

              <Field label={t("financing.term")} htmlFor="term">
                <div className="grid grid-cols-5 gap-2">
                  {[12, 24, 60, 84, 120].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setTerm(months)}
                      className={
                        term === months
                          ? "rounded-lg bg-cool-800 px-2 py-2 text-sm font-semibold text-white"
                          : "rounded-lg border border-slate-300 px-2 py-2 text-sm font-medium text-ink-soft hover:bg-slate-50"
                      }
                    >
                      {months}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={t("financing.apr")} htmlFor="apr">
                <Input
                  id="apr"
                  type="number"
                  min={0}
                  max={30}
                  step={0.01}
                  value={apr}
                  className="no-spin"
                  onChange={(event) => setApr(Number(event.target.value) || 0)}
                />
              </Field>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="bg-gradient-to-br from-heat-50 to-white">
              <p className="text-sm font-medium text-heat-700">{t("financing.monthlyPayment")}</p>
              <p className="mt-1 text-5xl font-bold tracking-tight text-heat-800">
                {money(result.payment)}
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-heat-200 pt-5 text-sm">
                <div>
                  <dt className="text-ink-faint">{t("financing.totalPaid")}</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-ink">{money(result.total)}</dd>
                </div>
                <div>
                  <dt className="text-ink-faint">{t("financing.interestPaid")}</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-ink">{money(result.interest)}</dd>
                </div>
              </dl>
            </Card>

            <Alert tone="info">{t("financing.disclaimer")}</Alert>

            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/quote">{t("common.getQuote")}</ButtonLink>
              <ButtonLink href="/contact" variant="outline">{t("nav.contact")}</ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <h2 className="h2">{t("financing.rebatesTitle")}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {dict.financing.rebates.map((rebate) => (
            <Card key={rebate.title} className="flex gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <h3 className="text-base font-semibold text-ink">{rebate.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{rebate.body}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
