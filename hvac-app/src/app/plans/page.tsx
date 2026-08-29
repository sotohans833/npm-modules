"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { Alert, Button, ButtonLink, Card, Section, cx } from "@/components/ui";
import { Check } from "@/components/icons";
import { FaqList } from "@/components/Faq";
import { money } from "@/lib/pricing";

type Plan = {
  id: string;
  nameEn: string;
  nameEs: string;
  monthlyCents: number;
  yearlyCents: number;
  visitsPerYear: number;
  discountPct: number;
  perksEn: string;
  perksEs: string;
  highlighted: boolean;
};

export default function PlansPage() {
  const { t, dict, locale } = useLanguage();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plans")
      .then((response) => response.json())
      .then((data: { plans: Plan[] }) => setPlans(data.plans))
      .catch(() => setMessage(t("common.errorGeneric")));
    // The dictionary changes with the language, but this only needs to run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function subscribe(planId: string) {
    setPending(planId);
    setMessage(null);

    const response = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, billing }),
    });

    if (response.status === 401) {
      router.push(`/login?next=/plans`);
      return;
    }

    const data = (await response.json()) as { redirectUrl?: string };
    setPending(null);

    if (data.redirectUrl) {
      router.push(data.redirectUrl);
      return;
    }
    setMessage(t("common.errorGeneric"));
  }

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow">{t("nav.plans")}</p>
          <h1 className="h1 mt-2 max-w-3xl">{t("plans.title")}</h1>
          <p className="lead mt-4 max-w-2xl">{t("plans.subtitle")}</p>

          <div className="mt-8 inline-flex rounded-xl border border-slate-300 bg-white p-1">
            {(["MONTHLY", "YEARLY"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setBilling(option)}
                className={cx(
                  "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                  billing === option ? "bg-cool-800 text-white" : "text-ink-soft hover:bg-slate-50",
                )}
              >
                {option === "MONTHLY" ? t("plans.perMonth").replace("/", "") : t("plans.perYear")}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Section>
        {message ? (
          <div className="mb-6">
            <Alert tone="danger">{message}</Alert>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const perks: string[] = JSON.parse(locale === "es" ? plan.perksEs : plan.perksEn);
            const price = billing === "MONTHLY" ? plan.monthlyCents : plan.yearlyCents;
            const yearlySaving = plan.monthlyCents * 12 - plan.yearlyCents;

            return (
              <Card
                key={plan.id}
                className={cx(
                  "relative flex flex-col",
                  plan.highlighted && "border-heat-400 ring-2 ring-heat-200",
                )}
              >
                {plan.highlighted ? (
                  <span className="absolute -top-3 left-6 rounded-full bg-heat-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    {t("plans.popular")}
                  </span>
                ) : null}

                <h2 className="h3">{locale === "es" ? plan.nameEs : plan.nameEn}</h2>

                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-ink">
                    {money(price / 100)}
                  </span>
                  <span className="text-sm text-ink-faint">
                    {billing === "MONTHLY" ? t("plans.perMonth") : ""}
                  </span>
                </p>
                {billing === "YEARLY" && yearlySaving > 0 ? (
                  <p className="mt-1 text-sm font-medium text-emerald-700">
                    {t("plans.saveYearly", { amount: money(yearlySaving / 100) })}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-ink-faint">
                    {t("plans.visitsPerYear", { count: plan.visitsPerYear })} ·{" "}
                    {t("plans.repairDiscount", { pct: plan.discountPct })}
                  </p>
                )}

                <ul className="mt-6 flex-1 space-y-3">
                  {perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
                      <Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-emerald-600" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-6 w-full"
                  variant={plan.highlighted ? "primary" : "outline"}
                  disabled={pending === plan.id}
                  onClick={() => subscribe(plan.id)}
                >
                  {pending === plan.id
                    ? t("common.sending")
                    : t("plans.choose", { plan: locale === "es" ? plan.nameEs : plan.nameEn })}
                </Button>
              </Card>
            );
          })}
        </div>

        <Card className="mt-10">
          <h2 className="h3">{t("plans.compareTitle")}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {dict.plans.compareItems.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink-soft">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-heat-500" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section className="bg-slate-50">
        <h2 className="h2 text-center">{t("plans.faqTitle")}</h2>
        <div className="mx-auto mt-8 max-w-3xl">
          <FaqList categories={["PLANS", "PRICING"]} />
        </div>
        <div className="mt-10 flex justify-center">
          <ButtonLink href="/book" size="lg">{t("common.bookNow")}</ButtonLink>
        </div>
      </Section>
    </>
  );
}
