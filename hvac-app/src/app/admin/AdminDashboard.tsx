"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Button, Card, Input, Section, Select, StatusBadge, Textarea, cx } from "@/components/ui";
import { APPOINTMENT_STATUSES, QUOTE_STATUSES, SERVICE_TYPES, TIME_SLOTS } from "@/lib/scheduling";
import { money } from "@/lib/pricing";
import { formatDateShort } from "@/i18n";

type Appointment = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  serviceType: string;
  systemType: string | null;
  urgency: string;
  date: string;
  timeSlot: string;
  status: string;
  technician: string | null;
  notes: string | null;
  symptoms: string | null;
  couponCode: string | null;
  createdAt: string;
};

type Quote = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  zip: string;
  kind: string;
  summary: string;
  estimateLow: number;
  estimateHi: number;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

type Tab = "overview" | "appointments" | "quotes";

export function AdminDashboard({
  appointments: initialAppointments,
  quotes: initialQuotes,
  technicians,
  weekCount,
  newCustomers,
}: {
  appointments: Appointment[];
  quotes: Quote[];
  technicians: string[];
  weekCount: number;
  newCustomers: number;
}) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("overview");
  const [appointments, setAppointments] = useState(initialAppointments);
  const [quotes, setQuotes] = useState(initialQuotes);

  /* --------------------------------------------------------------- Metrics */

  const metrics = useMemo(() => {
    const open = quotes.filter((quote) => quote.status === "NEW" || quote.status === "REVIEWING" || quote.status === "SENT");
    const decided = quotes.filter((quote) => quote.status === "WON" || quote.status === "LOST");
    const won = quotes.filter((quote) => quote.status === "WON");

    // Pipeline uses the midpoint of each range: the low figure understates and
    // the high figure flatters, and neither is what the job usually closes at.
    const pipeline = open.reduce((sum, quote) => sum + (quote.estimateLow + quote.estimateHi) / 2, 0);
    const average = quotes.length
      ? quotes.reduce((sum, quote) => sum + (quote.estimateLow + quote.estimateHi) / 2, 0) / quotes.length
      : 0;

    const byService = SERVICE_TYPES.map((service) => ({
      id: service.id,
      count: appointments.filter((appointment) => appointment.serviceType === service.id).length,
    })).sort((a, b) => b.count - a.count);

    const byStatus = QUOTE_STATUSES.map((status) => ({
      id: status,
      count: quotes.filter((quote) => quote.status === status).length,
    }));

    return {
      openQuotes: open.length,
      pipeline,
      average,
      conversion: decided.length ? Math.round((won.length / decided.length) * 100) : 0,
      byService,
      byStatus,
    };
  }, [appointments, quotes]);

  /* -------------------------------------------------------------- Mutation */

  async function patchAppointment(id: string, patch: Partial<Appointment>) {
    const response = await fetch(`/api/admin/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) return;

    const data = (await response.json()) as { appointment: Appointment };
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id
          ? { ...appointment, ...data.appointment, date: appointment.date }
          : appointment,
      ),
    );
  }

  async function patchQuote(id: string, patch: Partial<Quote>) {
    const response = await fetch(`/api/admin/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) return;

    const data = (await response.json()) as { quote: Quote };
    setQuotes((current) =>
      current.map((quote) =>
        quote.id === id ? { ...quote, ...data.quote, createdAt: quote.createdAt } : quote,
      ),
    );
  }

  return (
    <>
      <section className="border-b border-slate-200 bg-cool-900 text-white">
        <div className="container-page py-10">
          <p className="eyebrow text-heat-300">{t("nav.admin")}</p>
          <h1 className="h1 mt-2">{t("admin.title")}</h1>
          <p className="mt-3 text-cool-100">{t("admin.subtitle")}</p>

          <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-white/10">
            {(
              [
                ["overview", t("admin.tabsOverview")],
                ["appointments", t("admin.tabsAppointments")],
                ["quotes", t("admin.tabsQuotes")],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cx(
                  "-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  tab === id
                    ? "border-heat-400 text-white"
                    : "border-transparent text-cool-200 hover:text-white",
                )}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      <Section>
        {tab === "overview" ? (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Kpi label={t("admin.kpiWeekAppointments")} value={String(weekCount)} />
              <Kpi label={t("admin.kpiOpenQuotes")} value={String(metrics.openQuotes)} />
              <Kpi label={t("admin.kpiPipeline")} value={money(metrics.pipeline)} />
              <Kpi label={t("admin.kpiConversion")} value={`${metrics.conversion}%`} />
              <Kpi label={t("admin.kpiAvgTicket")} value={money(metrics.average)} />
              <Kpi label={t("admin.kpiNewCustomers")} value={String(newCustomers)} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <h2 className="h3">{t("admin.byServiceTitle")}</h2>
                <div className="mt-5 space-y-3">
                  {metrics.byService.map((entry) => (
                    <BarRow
                      key={entry.id}
                      label={t(`admin.serviceTypes.${entry.id}`)}
                      value={entry.count}
                      max={Math.max(1, ...metrics.byService.map((item) => item.count))}
                      tone="bg-heat-500"
                    />
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="h3">{t("admin.byStatusTitle")}</h2>
                <div className="mt-5 space-y-3">
                  {metrics.byStatus.map((entry) => (
                    <BarRow
                      key={entry.id}
                      label={t(`admin.statuses.${entry.id}`)}
                      value={entry.count}
                      max={Math.max(1, ...metrics.byStatus.map((item) => item.count))}
                      tone="bg-cool-600"
                    />
                  ))}
                </div>
              </Card>
            </div>

            <Card>
              <h2 className="h3">{t("admin.recentTitle")}</h2>
              <ul className="mt-5 divide-y divide-slate-100">
                {appointments.slice(0, 8).map((appointment) => (
                  <li key={appointment.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {appointment.name} · {t(`admin.serviceTypes.${appointment.serviceType}`)}
                      </p>
                      <p className="text-xs text-ink-faint">
                        {appointment.reference} · {appointment.city} {appointment.zip}
                      </p>
                    </div>
                    <StatusBadge
                      status={appointment.status}
                      label={t(`admin.statuses.${appointment.status}`)}
                    />
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        ) : null}

        {tab === "appointments" ? (
          <AppointmentsTable
            appointments={appointments}
            technicians={technicians}
            onPatch={patchAppointment}
          />
        ) : null}

        {tab === "quotes" ? <QuotesTable quotes={quotes} onPatch={patchQuote} /> : null}
      </Section>
    </>
  );
}

/* -------------------------------------------------------------------------- */

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-ink-faint">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{value}</p>
    </Card>
  );
}

function BarRow({
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
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="font-semibold text-ink">{value}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function AppointmentsTable({
  appointments,
  technicians,
  onPatch,
}: {
  appointments: Appointment[];
  technicians: string[];
  onPatch: (id: string, patch: Partial<Appointment>) => Promise<void>;
}) {
  const { t, locale } = useLanguage();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [service, setService] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = appointments.filter((appointment) => {
    if (status !== "ALL" && appointment.status !== status) return false;
    if (service !== "ALL" && appointment.serviceType !== service) return false;
    if (!search) return true;

    const haystack =
      `${appointment.name} ${appointment.email} ${appointment.phone} ${appointment.reference} ${appointment.city} ${appointment.zip}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("admin.filterSearch")}
          aria-label={t("admin.filterSearch")}
        />
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label={t("admin.filterStatus")}>
          <option value="ALL">{t("common.all")}</option>
          {APPOINTMENT_STATUSES.map((entry) => (
            <option key={entry} value={entry}>
              {t(`admin.statuses.${entry}`)}
            </option>
          ))}
        </Select>
        <Select value={service} onChange={(event) => setService(event.target.value)} aria-label={t("admin.filterService")}>
          <option value="ALL">{t("common.all")}</option>
          {SERVICE_TYPES.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry[locale]}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-faint">{t("admin.noResults")}</p>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((appointment) => {
            const open = expanded === appointment.id;
            return (
              <Card key={appointment.id} className="p-0">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : appointment.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-4 p-5 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {appointment.name}
                      <span className="ml-2 font-normal text-ink-faint">{appointment.reference}</span>
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {t(`admin.serviceTypes.${appointment.serviceType}`)} ·{" "}
                      {formatDateShort(appointment.date, locale)} ·{" "}
                      {TIME_SLOTS.find((slot) => slot.id === appointment.timeSlot)?.[locale] ??
                        appointment.timeSlot}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {appointment.address}, {appointment.city} {appointment.zip}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {appointment.urgency === "EMERGENCY" ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                        {t("common.emergency")}
                      </span>
                    ) : null}
                    <StatusBadge
                      status={appointment.status}
                      label={t(`admin.statuses.${appointment.status}`)}
                    />
                  </div>
                </button>

                {open ? (
                  <div className="border-t border-slate-100 bg-slate-50 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="text-sm">
                        <p className="font-semibold text-ink">{t("admin.contact")}</p>
                        <p className="mt-1 text-ink-soft">{appointment.email}</p>
                        <p className="text-ink-soft">{appointment.phone}</p>
                        <p className="mt-2 text-xs text-ink-faint">
                          {t("admin.created")}: {formatDateShort(appointment.createdAt, locale)}
                        </p>
                        {appointment.couponCode ? (
                          <p className="mt-1 text-xs font-semibold text-heat-700">
                            {appointment.couponCode}
                          </p>
                        ) : null}
                        {appointment.symptoms ? (
                          <p className="mt-2 text-xs text-ink-soft">
                            {(JSON.parse(appointment.symptoms) as string[]).join(", ")}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="label">{t("common.status")}</p>
                          <Select
                            value={appointment.status}
                            onChange={(event) => onPatch(appointment.id, { status: event.target.value })}
                          >
                            {APPOINTMENT_STATUSES.map((entry) => (
                              <option key={entry} value={entry}>
                                {t(`admin.statuses.${entry}`)}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div>
                          <p className="label">{t("admin.assignTech")}</p>
                          <Select
                            value={appointment.technician ?? ""}
                            onChange={(event) =>
                              onPatch(appointment.id, { technician: event.target.value || null })
                            }
                          >
                            <option value="">{t("admin.unassigned")}</option>
                            {technicians.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </div>

                    <NotesEditor
                      initial={appointment.notes ?? ""}
                      onSave={(notes) => onPatch(appointment.id, { notes })}
                    />
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function QuotesTable({
  quotes,
  onPatch,
}: {
  quotes: Quote[];
  onPatch: (id: string, patch: Partial<Quote>) => Promise<void>;
}) {
  const { t, locale } = useLanguage();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = quotes.filter((quote) => {
    if (status !== "ALL" && quote.status !== status) return false;
    if (!search) return true;
    return `${quote.name} ${quote.email} ${quote.phone} ${quote.reference} ${quote.zip}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("admin.filterSearch")}
          aria-label={t("admin.filterSearch")}
        />
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label={t("admin.filterStatus")}>
          <option value="ALL">{t("common.all")}</option>
          {QUOTE_STATUSES.map((entry) => (
            <option key={entry} value={entry}>
              {t(`admin.statuses.${entry}`)}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-faint">{t("admin.noResults")}</p>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((quote) => {
            const open = expanded === quote.id;
            return (
              <Card key={quote.id} className="p-0">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : quote.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-4 p-5 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {quote.name}
                      <span className="ml-2 font-normal text-ink-faint">{quote.reference}</span>
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      {t(`admin.quoteKinds.${quote.kind}`)} · {quote.summary}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {quote.zip} · {formatDateShort(quote.createdAt, locale)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="whitespace-nowrap text-sm font-bold text-heat-700">
                      {money(quote.estimateLow)} – {money(quote.estimateHi)}
                    </span>
                    <StatusBadge status={quote.status} label={t(`admin.statuses.${quote.status}`)} />
                  </div>
                </button>

                {open ? (
                  <div className="border-t border-slate-100 bg-slate-50 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="text-sm">
                        <p className="font-semibold text-ink">{t("admin.contact")}</p>
                        <p className="mt-1 text-ink-soft">{quote.email}</p>
                        <p className="text-ink-soft">{quote.phone}</p>
                      </div>
                      <div>
                        <p className="label">{t("common.status")}</p>
                        <Select
                          value={quote.status}
                          onChange={(event) => onPatch(quote.id, { status: event.target.value })}
                        >
                          {QUOTE_STATUSES.map((entry) => (
                            <option key={entry} value={entry}>
                              {t(`admin.statuses.${entry}`)}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <NotesEditor
                      initial={quote.adminNotes ?? ""}
                      onSave={(adminNotes) => onPatch(quote.id, { adminNotes })}
                    />
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function NotesEditor({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (value: string) => Promise<void> | void;
}) {
  const { t } = useLanguage();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);

  return (
    <div className="mt-4">
      <Textarea
        rows={3}
        value={value}
        placeholder={t("admin.notesPlaceholder")}
        onChange={(event) => {
          setValue(event.target.value);
          setSaved(false);
        }}
      />
      <div className="mt-2 flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            await onSave(value);
            setSaved(true);
          }}
        >
          {t("admin.saveNotes")}
        </Button>
        {saved ? <span className="text-xs font-medium text-emerald-700">{t("admin.updated")}</span> : null}
      </div>
    </div>
  );
}
