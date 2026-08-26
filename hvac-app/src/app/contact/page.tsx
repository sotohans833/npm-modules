"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Alert, Button, Card, Field, Input, Section, Select, Textarea } from "@/components/ui";
import { Clock, Mail, MapPin, Phone } from "@/components/icons";
import { company, telHref } from "@/lib/company";
import { mapEmbedUrl } from "@/lib/maps";

export default function ContactPage() {
  const { t, dict, locale } = useLanguage();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: dict.contact.reasons[0].id,
    message: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("sending");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, locale }),
    });

    setState(response.ok ? "sent" : "error");
  }

  return (
    <>
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page py-14 sm:py-16">
          <p className="eyebrow">{t("nav.contact")}</p>
          <h1 className="h1 mt-2">{t("contact.title")}</h1>
          <p className="lead mt-4 max-w-2xl">{t("contact.subtitle")}</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <Card>
            <h2 className="h3">{t("contact.formTitle")}</h2>

            {state === "sent" ? (
              <div className="mt-6">
                <Alert tone="success">{t("contact.sent")}</Alert>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-5">
                {state === "error" ? <Alert tone="danger">{t("common.errorGeneric")}</Alert> : null}

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

                <Field label={t("contact.reason")} required htmlFor="reason">
                  <Select
                    id="reason"
                    value={form.reason}
                    onChange={(event) => update("reason", event.target.value)}
                  >
                    {dict.contact.reasons.map((reason) => (
                      <option key={reason.id} value={reason.id}>
                        {reason.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label={t("contact.message")} required htmlFor="message">
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(event) => update("message", event.target.value)}
                  />
                </Field>

                <Button type="submit" size="lg" disabled={state === "sending"} className="w-full sm:w-auto">
                  {state === "sending" ? t("common.sending") : t("contact.send")}
                </Button>
              </form>
            )}
          </Card>

          <div className="space-y-5">
            <Card className="border-heat-200 bg-heat-50">
              <h2 className="h3 text-heat-800">{t("contact.emergencyTitle")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-heat-900/80">
                {t("contact.emergencyBody")}
              </p>
              <a
                href={telHref(company.emergencyPhone)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-heat-500 px-5 py-3 text-base font-semibold text-white hover:bg-heat-600"
              >
                <Phone className="h-5 w-5" />
                {company.emergencyPhone}
              </a>
            </Card>

            <Card>
              <h2 className="h3">{t("contact.officeTitle")}</h2>
              <ul className="mt-4 space-y-3 text-sm text-ink-soft">
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-heat-600" />
                  {company.address}
                </li>
                <li className="flex gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-heat-600" />
                  <a href={telHref(company.phone)} className="hover:text-heat-600">{company.phone}</a>
                </li>
                <li className="flex gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-heat-600" />
                  <a href={`mailto:${company.email}`} className="break-all hover:text-heat-600">
                    {company.email}
                  </a>
                </li>
                <li className="flex gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-heat-600" />
                  <span>
                    <strong className="block text-ink">{t("contact.hoursTitle")}</strong>
                    {t("contact.hoursBody")}
                  </span>
                </li>
              </ul>
            </Card>

            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-card">
              <iframe
                title={company.name}
                src={mapEmbedUrl(company.address)}
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
