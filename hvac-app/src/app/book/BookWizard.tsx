"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  Textarea,
  cx,
} from "@/components/ui";
import { BookingCalendar } from "@/components/BookingCalendar";
import { Check, Phone } from "@/components/icons";
import { SERVICE_TYPES, SYSTEM_OPTIONS, TIME_SLOTS } from "@/lib/scheduling";
import { company, telHref } from "@/lib/company";
import { formatDate } from "@/i18n";
import type { SessionUser } from "@/lib/auth";

type EquipmentOption = { id: string; nickname: string; type: string; brand: string | null };

const STEPS = 4;

export function BookWizard({
  user,
  equipment,
}: {
  user: SessionUser | null;
  equipment: EquipmentOption[];
}) {
  const { t, dict, locale } = useLanguage();
  const params = useSearchParams();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ reference: string; email: string } | null>(null);
  const [zipWarning, setZipWarning] = useState(false);
  const [coupon, setCoupon] = useState<{ code: string; title: string } | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const [form, setForm] = useState({
    serviceType: "MAINTENANCE",
    systemType: "NOT_SURE",
    urgency: "STANDARD",
    equipmentId: "",
    date: "" as string,
    timeSlot: "" as string,
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    city: user?.city ?? "",
    zip: user?.zip ?? "",
    notes: "",
  });

  // The symptom checker hands off through the query string.
  const prefilledSymptoms = useMemo(() => {
    const raw = params.get("symptoms");
    return raw ? raw.split(",").filter(Boolean) : [];
  }, [params]);
  const prefilled = prefilledSymptoms.length > 0;

  useEffect(() => {
    const service = params.get("service");
    const urgency = params.get("urgency");

    setForm((current) => ({
      ...current,
      // `/services/<slug>` links pass a slug; the diagnostic passes a service id.
      serviceType: SERVICE_TYPES.some((entry) => entry.id === service)
        ? service!
        : SLUG_TO_SERVICE[service ?? ""] ?? current.serviceType,
      urgency:
        urgency === "EMERGENCY" || urgency === "URGENT" || urgency === "STANDARD"
          ? urgency
          : current.urgency,
    }));
  }, [params]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function checkZip(zip: string) {
    if (!/^\d{5}$/.test(zip)) return;
    try {
      const response = await fetch(`/api/service-area?zip=${zip}`);
      const data = (await response.json()) as { covered: boolean; city?: string };
      setZipWarning(!data.covered);
      // Filling the city from the ZIP saves a field on a phone keyboard.
      if (data.covered && data.city) {
        setForm((current) => (current.city ? current : { ...current, city: data.city! }));
      }
    } catch {
      setZipWarning(false);
    }
  }

  async function applyCoupon() {
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const response = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
    const data = (await response.json()) as {
      valid: boolean;
      coupon?: { code: string; titleEn: string; titleEs: string };
    };

    if (!data.valid || !data.coupon) {
      setCoupon(null);
      setCouponError(t("book.couponInvalid"));
      return;
    }
    setCoupon({
      code: data.coupon.code,
      title: locale === "es" ? data.coupon.titleEs : data.coupon.titleEn,
    });
  }

  const stepValid = useMemo(() => {
    if (step === 1) return Boolean(form.serviceType);
    if (step === 2) return Boolean(form.date && form.timeSlot && form.address && form.city && /^\d{5}$/.test(form.zip));
    if (step === 3) return Boolean(form.name.trim() && form.email.includes("@") && form.phone.length >= 10);
    return true;
  }, [step, form]);

  async function submit() {
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        equipmentId: form.equipmentId || undefined,
        systemType: form.systemType === "NOT_SURE" ? undefined : form.systemType,
        symptoms: prefilledSymptoms,
        couponCode: coupon?.code,
        notes: form.notes || undefined,
        locale,
      }),
    });

    setSubmitting(false);

    if (response.status === 409) {
      setError(t("book.errorSlot"));
      setStep(2);
      return;
    }
    if (!response.ok) {
      setError(t("common.errorGeneric"));
      return;
    }

    const data = (await response.json()) as { appointment: { reference: string } };
    setConfirmation({ reference: data.appointment.reference, email: form.email });
  }

  /* ------------------------------------------------------------- Confirmed */

  if (confirmation) {
    return (
      <Section>
        <Card className="mx-auto max-w-xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="h-7 w-7" />
          </span>
          <h1 className="h2 mt-5">{t("book.successTitle")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {t("book.successBody", {
              email: confirmation.email,
              reference: confirmation.reference,
            })}
          </p>

          <dl className="mt-6 space-y-2 rounded-xl bg-slate-50 p-4 text-left text-sm">
            <Row label={t("common.reference")} value={confirmation.reference} />
            <Row
              label={t("common.service")}
              value={SERVICE_TYPES.find((entry) => entry.id === form.serviceType)?.[locale] ?? ""}
            />
            <Row
              label={t("common.date")}
              value={form.date ? formatDate(`${form.date}T12:00:00`, locale) : ""}
            />
            <Row
              label={t("common.time")}
              value={TIME_SLOTS.find((slot) => slot.id === form.timeSlot)?.[locale] ?? ""}
            />
          </dl>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {user ? (
              <ButtonLink href="/portal">{t("book.successPortal")}</ButtonLink>
            ) : (
              <ButtonLink href="/register">{t("nav.register")}</ButtonLink>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setConfirmation(null);
                setStep(1);
              }}
            >
              {t("book.successAnother")}
            </Button>
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
          <h1 className="h1">{t("book.title")}</h1>
          <p className="lead mt-3 max-w-2xl">{t("book.subtitle")}</p>

          <div className="mt-8 flex items-center gap-2">
            {Array.from({ length: STEPS }, (_, index) => index + 1).map((index) => (
              <div key={index} className="flex flex-1 items-center gap-2">
                <span
                  className={cx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    index < step
                      ? "bg-emerald-600 text-white"
                      : index === step
                        ? "bg-heat-500 text-white"
                        : "bg-slate-200 text-slate-500",
                  )}
                >
                  {index < step ? <Check className="h-4 w-4" /> : index}
                </span>
                {index < STEPS ? (
                  <span
                    className={cx(
                      "h-1 flex-1 rounded-full",
                      index < step ? "bg-emerald-600" : "bg-slate-200",
                    )}
                  />
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-faint">{t("book.step", { current: step, total: STEPS })}</p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl">
          {error ? (
            <div className="mb-6">
              <Alert tone="danger">{error}</Alert>
            </div>
          ) : null}

          {user ? (
            <p className="mb-6 text-sm text-ink-faint">{t("book.signedInAs", { name: user.name })}</p>
          ) : (
            <p className="mb-6 text-sm text-ink-faint">
              {t("book.guestNotice")}{" "}
              <Link href="/login?next=/book" className="font-semibold text-heat-600 hover:underline">
                {t("nav.login")}
              </Link>
            </p>
          )}

          {prefilled && step === 1 ? (
            <div className="mb-6">
              <Alert tone="info">{t("book.prefillNotice")}</Alert>
            </div>
          ) : null}

          <Card>
            {/* -------------------------------------------------------- Step 1 */}
            {step === 1 ? (
              <div className="space-y-8">
                <div>
                  <h2 className="h3">{t("book.step1Title")}</h2>
                  <p className="label mt-6">{t("book.serviceType")}</p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {SERVICE_TYPES.map((service) => (
                      <OptionCard
                        key={service.id}
                        selected={form.serviceType === service.id}
                        title={service[locale]}
                        onClick={() => update("serviceType", service.id)}
                      />
                    ))}
                  </div>
                </div>

                <Field label={t("book.systemType")} htmlFor="systemType">
                  <Select
                    id="systemType"
                    value={form.systemType}
                    onChange={(event) => update("systemType", event.target.value)}
                  >
                    {SYSTEM_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option[locale]}
                      </option>
                    ))}
                  </Select>
                </Field>

                {equipment.length > 0 ? (
                  <Field label={t("portal.equipmentTitle")} htmlFor="equipmentId">
                    <Select
                      id="equipmentId"
                      value={form.equipmentId}
                      onChange={(event) => update("equipmentId", event.target.value)}
                    >
                      <option value="">{t("common.select")}</option>
                      {equipment.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.nickname}
                          {unit.brand ? ` · ${unit.brand}` : ""}
                        </option>
                      ))}
                    </Select>
                  </Field>
                ) : null}

                <div>
                  <p className="label">{t("book.urgency")}</p>
                  <div className="grid gap-2.5">
                    {(["STANDARD", "URGENT", "EMERGENCY"] as const).map((level) => (
                      <OptionCard
                        key={level}
                        selected={form.urgency === level}
                        title={t(`book.urgency${level}`)}
                        onClick={() => update("urgency", level)}
                      />
                    ))}
                  </div>
                  {form.urgency === "EMERGENCY" ? (
                    <div className="mt-4">
                      <Alert tone="danger" title={t("common.emergency")}>
                        {t("book.emergencyNotice", { phone: company.emergencyPhone })}
                        <a
                          href={telHref(company.emergencyPhone)}
                          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          <Phone className="h-4 w-4" />
                          {company.emergencyPhone}
                        </a>
                      </Alert>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* -------------------------------------------------------- Step 2 */}
            {step === 2 ? (
              <div className="space-y-8">
                <h2 className="h3">{t("book.step2Title")}</h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label={t("common.address")} required htmlFor="address">
                      <Input
                        id="address"
                        required
                        value={form.address}
                        onChange={(event) => update("address", event.target.value)}
                        autoComplete="street-address"
                      />
                    </Field>
                  </div>
                  <Field label={t("common.zip")} required htmlFor="zip">
                    <Input
                      id="zip"
                      required
                      inputMode="numeric"
                      className="no-spin"
                      value={form.zip}
                      onChange={(event) => {
                        const zip = event.target.value.replace(/\D/g, "").slice(0, 5);
                        update("zip", zip);
                        if (zip.length === 5) void checkZip(zip);
                      }}
                      autoComplete="postal-code"
                    />
                  </Field>
                  <Field label={t("common.city")} required htmlFor="city">
                    <Input
                      id="city"
                      required
                      value={form.city}
                      onChange={(event) => update("city", event.target.value)}
                      autoComplete="address-level2"
                    />
                  </Field>
                </div>

                {zipWarning ? <Alert tone="warning">{t("book.zipWarning")}</Alert> : null}

                <div>
                  <p className="label">{t("book.pickDate")}</p>
                  <BookingCalendar
                    selectedDate={form.date || null}
                    selectedSlot={form.timeSlot || null}
                    onSelectDate={(date) => {
                      update("date", date);
                      update("timeSlot", "");
                    }}
                    onSelectSlot={(slot) => update("timeSlot", slot)}
                  />
                </div>
              </div>
            ) : null}

            {/* -------------------------------------------------------- Step 3 */}
            {step === 3 ? (
              <div className="space-y-6">
                <h2 className="h3">{t("book.step3Title")}</h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t("common.name")} required htmlFor="name">
                    <Input
                      id="name"
                      required
                      value={form.name}
                      onChange={(event) => update("name", event.target.value)}
                      autoComplete="name"
                    />
                  </Field>
                  <Field label={t("common.phone")} required htmlFor="phone">
                    <Input
                      id="phone"
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      autoComplete="tel"
                    />
                  </Field>
                </div>

                <Field label={t("common.email")} required htmlFor="email">
                  <Input
                    id="email"
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    autoComplete="email"
                  />
                </Field>

                <Field label={t("common.notes")} htmlFor="notes">
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(event) => update("notes", event.target.value)}
                  />
                </Field>

                <Field label={t("book.couponCode")} error={couponError ?? undefined} htmlFor="coupon">
                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      value={couponInput}
                      onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                      placeholder="SPRING25"
                    />
                    <Button type="button" variant="outline" onClick={applyCoupon} className="shrink-0">
                      {t("book.couponApply")}
                    </Button>
                  </div>
                </Field>
                {coupon ? (
                  <Alert tone="success">{t("book.couponApplied", { title: coupon.title })}</Alert>
                ) : null}
              </div>
            ) : null}

            {/* -------------------------------------------------------- Step 4 */}
            {step === 4 ? (
              <div className="space-y-6">
                <h2 className="h3">{t("book.reviewTitle")}</h2>
                <dl className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                  <Row
                    label={t("common.service")}
                    value={SERVICE_TYPES.find((entry) => entry.id === form.serviceType)?.[locale] ?? ""}
                  />
                  <Row
                    label={t("book.systemType")}
                    value={SYSTEM_OPTIONS.find((entry) => entry.id === form.systemType)?.[locale] ?? ""}
                  />
                  <Row label={t("book.urgency")} value={t(`book.urgency${form.urgency}`)} />
                  <Row label={t("common.date")} value={formatDate(`${form.date}T12:00:00`, locale)} />
                  <Row
                    label={t("common.time")}
                    value={TIME_SLOTS.find((slot) => slot.id === form.timeSlot)?.[locale] ?? ""}
                  />
                  <Row
                    label={t("common.address")}
                    value={`${form.address}, ${form.city} ${form.zip}`}
                  />
                  <Row label={t("common.name")} value={form.name} />
                  <Row label={t("common.phone")} value={form.phone} />
                  <Row label={t("common.email")} value={form.email} />
                  {coupon ? <Row label={t("book.couponCode")} value={coupon.code} /> : null}
                  {form.notes ? <Row label={t("common.notes")} value={form.notes} /> : null}
                </dl>
                <p className="text-xs leading-relaxed text-ink-faint">{dict.footer.demoNotice}</p>
              </div>
            ) : null}

            {/* ------------------------------------------------------ Controls */}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
              <Button
                variant="ghost"
                onClick={() => setStep((current) => Math.max(1, current - 1))}
                disabled={step === 1}
              >
                {t("common.back")}
              </Button>

              {step < STEPS ? (
                <Button
                  size="lg"
                  disabled={!stepValid}
                  onClick={() => setStep((current) => Math.min(STEPS, current + 1))}
                >
                  {t("common.next")}
                </Button>
              ) : (
                <Button size="lg" disabled={submitting} onClick={submit}>
                  {submitting ? t("common.sending") : t("book.confirmCta")}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}

/** Maps `/services/<slug>` deep links onto the booking form's service ids. */
const SLUG_TO_SERVICE: Record<string, string> = {
  "ac-repair": "REPAIR",
  "heating-repair": "REPAIR",
  maintenance: "MAINTENANCE",
  installation: "INSTALL_ESTIMATE",
  "indoor-air-quality": "INDOOR_AIR",
  ductwork: "DUCTWORK",
  electrical: "ELECTRICAL",
  commercial: "MAINTENANCE",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
