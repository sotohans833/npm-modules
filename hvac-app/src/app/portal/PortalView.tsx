"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  Field,
  Input,
  Section,
  Select,
  StatusBadge,
  cx,
} from "@/components/ui";
import { Calendar, Check, Wrench } from "@/components/icons";
import { SERVICE_TYPES, TIME_SLOTS } from "@/lib/scheduling";
import { money } from "@/lib/pricing";
import { formatDate, formatDateShort } from "@/i18n";
import type { SessionUser } from "@/lib/auth";

type Appointment = {
  id: string;
  reference: string;
  serviceType: string;
  date: string;
  timeSlot: string;
  status: string;
  technician: string | null;
  notes: string | null;
  address: string;
  city: string;
  equipment: { nickname: string } | null;
};

type Quote = {
  id: string;
  reference: string;
  kind: string;
  summary: string;
  estimateLow: number;
  estimateHi: number;
  status: string;
  createdAt: string;
};

type Equipment = {
  id: string;
  nickname: string;
  type: string;
  brand: string | null;
  modelNumber: string | null;
  installYear: number | null;
  tonnage: number | null;
  lastServiceAt: string | null;
};

type Reminder = { id: string; titleEn: string; titleEs: string; dueAt: string };

type Plan = { id: string; nameEn: string; nameEs: string; discountPct: number } | null;

const TABS = ["overview", "equipment", "profile"] as const;
type Tab = (typeof TABS)[number];

export function PortalView({
  user,
  appointments,
  quotes,
  equipment: initialEquipment,
  reminders: initialReminders,
  plan,
}: {
  user: SessionUser;
  appointments: Appointment[];
  quotes: Quote[];
  equipment: Equipment[];
  reminders: Reminder[];
  plan: Plan;
}) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();

  const [tab, setTab] = useState<Tab>("overview");
  const [equipment, setEquipment] = useState(initialEquipment);
  const [reminders, setReminders] = useState(initialReminders);
  const [flash, setFlash] = useState<string | null>(
    params.get("plan") === "activated" ? t("plans.activated") : null,
  );

  const now = Date.now();
  const upcoming = appointments.filter(
    (appointment) =>
      new Date(appointment.date).getTime() >= now - 86_400_000 &&
      appointment.status !== "COMPLETED" &&
      appointment.status !== "CANCELLED",
  );
  const history = appointments.filter((appointment) => !upcoming.includes(appointment));

  async function cancelVisit(id: string) {
    if (!window.confirm(t("portal.cancelConfirm"))) return;
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function completeReminder(id: string) {
    await fetch(`/api/reminders/${id}`, { method: "PATCH" });
    setReminders((current) => current.filter((reminder) => reminder.id !== id));
  }

  return (
    <>
      <section className="border-b border-slate-200 bg-cool-900 text-white">
        <div className="container-page py-10 sm:py-12">
          <p className="eyebrow text-heat-300">{t("portal.title")}</p>
          <h1 className="h1 mt-2">{t("portal.greeting", { name: user.name.split(" ")[0] })}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            {plan ? (
              <span className="rounded-full bg-heat-500/20 px-3 py-1.5 font-semibold text-heat-200">
                {locale === "es" ? plan.nameEs : plan.nameEn} ·{" "}
                {t("plans.repairDiscount", { pct: plan.discountPct })}
              </span>
            ) : (
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-cool-100">
                {t("portal.planNone")}
              </span>
            )}
            <ButtonLink href="/plans" size="sm" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/15">
              {t("portal.planSee")}
            </ButtonLink>
          </div>

          <nav className="mt-8 flex gap-1 border-b border-white/10">
            {TABS.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setTab(entry)}
                className={cx(
                  "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  tab === entry
                    ? "border-heat-400 text-white"
                    : "border-transparent text-cool-200 hover:text-white",
                )}
              >
                {entry === "overview"
                  ? t("portal.upcomingTitle")
                  : entry === "equipment"
                    ? t("portal.equipmentTitle")
                    : t("portal.profileTitle")}
              </button>
            ))}
          </nav>
        </div>
      </section>

      <Section>
        {flash ? (
          <div className="mb-6">
            <Alert tone="success">{flash}</Alert>
          </div>
        ) : null}

        {tab === "overview" ? (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_.6fr] lg:items-start">
            <div className="space-y-8">
              <div>
                <h2 className="h3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-heat-600" />
                  {t("portal.upcomingTitle")}
                </h2>
                {upcoming.length === 0 ? (
                  <Card className="mt-4">
                    <p className="text-sm text-ink-soft">{t("portal.upcomingEmpty")}</p>
                    <ButtonLink href="/book" className="mt-4">{t("common.bookNow")}</ButtonLink>
                  </Card>
                ) : (
                  <div className="mt-4 space-y-3">
                    {upcoming.map((appointment) => (
                      <Card key={appointment.id}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {SERVICE_TYPES.find((entry) => entry.id === appointment.serviceType)?.[locale] ??
                                appointment.serviceType}
                            </p>
                            <p className="mt-1 text-sm text-ink-soft">
                              {formatDate(appointment.date, locale)} ·{" "}
                              {TIME_SLOTS.find((slot) => slot.id === appointment.timeSlot)?.[locale] ??
                                appointment.timeSlot}
                            </p>
                            <p className="mt-1 text-xs text-ink-faint">
                              {appointment.address}, {appointment.city} · {appointment.reference}
                              {appointment.technician ? ` · ${appointment.technician}` : ""}
                            </p>
                          </div>
                          <StatusBadge
                            status={appointment.status}
                            label={t(`admin.statuses.${appointment.status}`)}
                          />
                        </div>
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <Button variant="danger" size="sm" onClick={() => cancelVisit(appointment.id)}>
                            {t("portal.cancelVisit")}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="h3">{t("portal.historyTitle")}</h2>
                {history.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-soft">{t("portal.historyEmpty")}</p>
                ) : (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-slate-100">
                        {history.map((appointment) => (
                          <tr key={appointment.id} className="bg-white">
                            <td className="px-4 py-3">
                              <p className="font-medium text-ink">
                                {SERVICE_TYPES.find((entry) => entry.id === appointment.serviceType)?.[locale]}
                              </p>
                              <p className="text-xs text-ink-faint">{appointment.reference}</p>
                              {appointment.notes ? (
                                <p className="mt-1 text-xs text-ink-soft">{appointment.notes}</p>
                              ) : null}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                              {formatDateShort(appointment.date, locale)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <StatusBadge
                                status={appointment.status}
                                label={t(`admin.statuses.${appointment.status}`)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h2 className="h3">{t("portal.quotesTitle")}</h2>
                {quotes.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-soft">{t("portal.quotesEmpty")}</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {quotes.map((quote) => (
                      <Card key={quote.id} className="flex flex-wrap items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink">
                            {t(`admin.quoteKinds.${quote.kind}`)} · {quote.reference}
                          </p>
                          <p className="mt-1 text-sm text-ink-soft">{quote.summary}</p>
                          <p className="mt-1 text-xs text-ink-faint">
                            {formatDateShort(quote.createdAt, locale)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-heat-700">
                            {money(quote.estimateLow)} – {money(quote.estimateHi)}
                          </p>
                          <StatusBadge status={quote.status} label={t(`admin.statuses.${quote.status}`)} />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5 lg:sticky lg:top-28">
              <Card>
                <h2 className="h3">{t("portal.remindersTitle")}</h2>
                {reminders.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-soft">{t("portal.remindersEmpty")}</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {reminders.map((reminder) => (
                      <li key={reminder.id} className="rounded-xl bg-slate-50 p-3">
                        <p className="text-sm text-ink">
                          {locale === "es" ? reminder.titleEs : reminder.titleEn}
                        </p>
                        <p className="mt-1 text-xs text-ink-faint">
                          {formatDateShort(reminder.dueAt, locale)}
                        </p>
                        <button
                          type="button"
                          onClick={() => completeReminder(reminder.id)}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {t("portal.remindersDone")}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card className="bg-gradient-to-br from-heat-50 to-white">
                <h2 className="h3">{t("home.ctaTitle")}</h2>
                <div className="mt-4 flex flex-col gap-2">
                  <ButtonLink href="/book">{t("common.bookNow")}</ButtonLink>
                  <ButtonLink href="/quote" variant="outline">{t("common.getQuote")}</ButtonLink>
                </div>
              </Card>
            </div>
          </div>
        ) : null}

        {tab === "equipment" ? (
          <EquipmentTab equipment={equipment} onChange={setEquipment} />
        ) : null}

        {tab === "profile" ? <ProfileTab user={user} /> : null}
      </Section>
    </>
  );
}

/* -------------------------------------------------------------------------- */

function EquipmentTab({
  equipment,
  onChange,
}: {
  equipment: Equipment[];
  onChange: (next: Equipment[]) => void;
}) {
  const { t, locale } = useLanguage();
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nickname: "",
    type: "AC",
    brand: "",
    modelNumber: "",
    serialNumber: "",
    installYear: "",
    tonnage: "",
  });

  const currentYear = new Date().getFullYear();

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        installYear: form.installYear ? Number(form.installYear) : undefined,
        tonnage: form.tonnage ? Number(form.tonnage) : undefined,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      setError(t("common.errorGeneric"));
      return;
    }

    const data = (await response.json()) as { equipment: Equipment };
    onChange([...equipment, data.equipment]);
    setAdding(false);
    setForm({ nickname: "", type: "AC", brand: "", modelNumber: "", serialNumber: "", installYear: "", tonnage: "" });
  }

  async function remove(id: string) {
    await fetch(`/api/equipment/${id}`, { method: "DELETE" });
    onChange(equipment.filter((unit) => unit.id !== id));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_.7fr] lg:items-start">
      <div>
        <h2 className="h3 flex items-center gap-2">
          <Wrench className="h-5 w-5 text-heat-600" />
          {t("portal.equipmentTitle")}
        </h2>

        {equipment.length === 0 ? (
          <Card className="mt-4">
            <p className="text-sm text-ink-soft">{t("portal.equipmentEmpty")}</p>
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {equipment.map((unit) => {
              const age = unit.installYear ? currentYear - unit.installYear : null;
              return (
                <Card key={unit.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{unit.nickname}</p>
                      <p className="mt-1 text-sm text-ink-soft">
                        {t(`portal.types.${unit.type}`)}
                        {unit.brand ? ` · ${unit.brand}` : ""}
                        {unit.tonnage ? ` · ${unit.tonnage} ton` : ""}
                      </p>
                      {unit.modelNumber ? (
                        <p className="mt-0.5 text-xs text-ink-faint">{unit.modelNumber}</p>
                      ) : null}
                      {age !== null ? (
                        <p className="mt-2 text-xs">
                          <span className="text-ink-faint">{t("portal.equipmentAge", { years: age })}</span>
                          {age >= 12 ? (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                              {t("portal.equipmentAgeWarning")}
                            </span>
                          ) : null}
                        </p>
                      ) : null}
                      {unit.lastServiceAt ? (
                        <p className="mt-1 text-xs text-ink-faint">
                          {t("portal.historyTitle")}: {formatDateShort(unit.lastServiceAt, locale)}
                        </p>
                      ) : null}
                    </div>
                    <Button variant="danger" size="sm" onClick={() => remove(unit.id)}>
                      {t("portal.equipmentDelete")}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!adding ? (
          <Button className="mt-5" variant="outline" onClick={() => setAdding(true)}>
            {t("portal.equipmentAdd")}
          </Button>
        ) : (
          <Card className="mt-5">
            <form onSubmit={save} className="space-y-5">
              {error ? <Alert tone="danger">{error}</Alert> : null}

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t("portal.equipmentNickname")} required htmlFor="nickname">
                  <Input
                    id="nickname"
                    required
                    value={form.nickname}
                    onChange={(event) => setForm({ ...form, nickname: event.target.value })}
                  />
                </Field>
                <Field label={t("portal.equipmentType")} required htmlFor="type">
                  <Select
                    id="type"
                    value={form.type}
                    onChange={(event) => setForm({ ...form, type: event.target.value })}
                  >
                    {["AC", "FURNACE", "HEAT_PUMP", "MINI_SPLIT", "PACKAGE", "WATER_HEATER"].map((type) => (
                      <option key={type} value={type}>
                        {t(`portal.types.${type}`)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label={t("portal.equipmentBrand")} htmlFor="brand">
                  <Input
                    id="brand"
                    value={form.brand}
                    onChange={(event) => setForm({ ...form, brand: event.target.value })}
                  />
                </Field>
                <Field label={t("portal.equipmentModel")} htmlFor="modelNumber">
                  <Input
                    id="modelNumber"
                    value={form.modelNumber}
                    onChange={(event) => setForm({ ...form, modelNumber: event.target.value })}
                  />
                </Field>
                <Field label={t("portal.equipmentYear")} htmlFor="installYear">
                  <Input
                    id="installYear"
                    type="number"
                    min={1960}
                    max={currentYear}
                    className="no-spin"
                    value={form.installYear}
                    onChange={(event) => setForm({ ...form, installYear: event.target.value })}
                  />
                </Field>
                <Field label={t("portal.equipmentTonnage")} htmlFor="tonnage">
                  <Input
                    id="tonnage"
                    type="number"
                    min={0.5}
                    max={30}
                    step={0.5}
                    className="no-spin"
                    value={form.tonnage}
                    onChange={(event) => setForm({ ...form, tonnage: event.target.value })}
                  />
                </Field>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? t("common.sending") : t("common.save")}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      <Card className="bg-slate-50 lg:sticky lg:top-28">
        <p className="text-sm leading-relaxed text-ink-soft">{t("portal.equipmentEmpty")}</p>
        <ButtonLink href="/tools/sizing" variant="outline" className="mt-4">
          {t("tools.sizingTitle")}
        </ButtonLink>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ProfileTab({ user }: { user: SessionUser }) {
  const { t, locale } = useLanguage();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? "",
    address: user.address ?? "",
    city: user.city ?? "",
    zip: user.zip ?? "",
  });

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, locale }),
    });

    setSaving(false);
    setSaved(response.ok);
  }

  return (
    <Card className="max-w-2xl">
      <h2 className="h3">{t("portal.profileTitle")}</h2>
      <form onSubmit={save} className="mt-6 space-y-5">
        {saved ? <Alert tone="success">{t("portal.profileSaved")}</Alert> : null}

        <Field label={t("common.email")} htmlFor="profileEmail">
          <Input id="profileEmail" value={user.email} disabled />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("common.name")} required htmlFor="profileName">
            <Input
              id="profileName"
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </Field>
          <Field label={t("common.phone")} htmlFor="profilePhone">
            <Input
              id="profilePhone"
              type="tel"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
          </Field>
        </div>

        <Field label={t("common.address")} htmlFor="profileAddress">
          <Input
            id="profileAddress"
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("common.city")} htmlFor="profileCity">
            <Input
              id="profileCity"
              value={form.city}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
            />
          </Field>
          <Field label={t("common.zip")} htmlFor="profileZip">
            <Input
              id="profileZip"
              inputMode="numeric"
              className="no-spin"
              value={form.zip}
              onChange={(event) =>
                setForm({ ...form, zip: event.target.value.replace(/\D/g, "").slice(0, 5) })
              }
            />
          </Field>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? t("common.sending") : t("common.save")}
        </Button>
      </form>
    </Card>
  );
}
