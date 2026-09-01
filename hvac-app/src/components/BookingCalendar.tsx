"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { cx } from "./ui";
import { ChevronRight } from "./icons";
import {
  BOOKING_HORIZON_DAYS,
  TIME_SLOTS,
  firstBookableMonth,
  preferredBookingMonth,
  isBookableDate,
  monthGrid,
  toDateKey,
} from "@/lib/scheduling";

type Availability = Record<string, Record<string, number>>;

const WEEKDAYS = {
  en: ["S", "M", "T", "W", "T", "F", "S"],
  es: ["D", "L", "M", "M", "J", "V", "S"],
};

export function BookingCalendar({
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
}: {
  selectedDate: string | null;
  selectedSlot: string | null;
  onSelectDate: (dateKey: string) => void;
  onSelectSlot: (slot: string) => void;
}) {
  const { t, locale } = useLanguage();
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => preferredBookingMonth(today));
  const [availability, setAvailability] = useState<Availability>({});
  const [loading, setLoading] = useState(true);

  const horizon = useMemo(() => {
    const limit = new Date(today);
    limit.setDate(limit.getDate() + BOOKING_HORIZON_DAYS);
    return limit;
  }, [today]);

  useEffect(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);

    setLoading(true);
    fetch(`/api/availability?from=${toDateKey(first)}&to=${toDateKey(last)}`)
      .then((response) => response.json())
      .then((data: { days: Availability }) => setAvailability(data.days ?? {}))
      .catch(() => setAvailability({}))
      .finally(() => setLoading(false));
  }, [cursor]);

  const cells = monthGrid(cursor.getFullYear(), cursor.getMonth());
  const monthLabel = new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(cursor);

  // Never let the arrows walk back into a month with nothing bookable in it.
  const canGoBack = cursor > firstBookableMonth(today);
  const canGoForward = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1) <= horizon;

  const slotsForSelected = selectedDate ? availability[selectedDate] : undefined;
  const isSunday = selectedDate ? new Date(`${selectedDate}T12:00:00`).getDay() === 0 : false;

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          disabled={!canGoBack}
          className="rounded-lg p-2 text-ink-soft hover:bg-slate-100 disabled:opacity-30"
          aria-label="Previous month"
        >
          <ChevronRight className="h-5 w-5 rotate-180" />
        </button>
        <p className="text-sm font-semibold capitalize text-ink">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          disabled={!canGoForward}
          className="rounded-lg p-2 text-ink-soft hover:bg-slate-100 disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-ink-faint">
        {WEEKDAYS[locale].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>

      <div className={cx("mt-2 grid grid-cols-7 gap-1", loading && "opacity-50")}>
        {cells.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} />;

          const key = toDateKey(date);
          const slots = availability[key];
          const remaining = slots ? Object.values(slots).reduce((sum, count) => sum + count, 0) : 0;
          const selectable = isBookableDate(date, today) && remaining > 0;
          const selected = selectedDate === key;

          return (
            <button
              key={key}
              type="button"
              disabled={!selectable}
              onClick={() => onSelectDate(key)}
              aria-pressed={selected}
              className={cx(
                "relative aspect-square rounded-lg text-sm font-medium transition-colors",
                selected
                  ? "bg-heat-500 text-white"
                  : selectable
                    ? "text-ink hover:bg-heat-50"
                    : "text-slate-300",
              )}
            >
              {date.getDate()}
              {selectable && !selected ? (
                <span className="absolute inset-x-0 bottom-1 mx-auto h-1 w-1 rounded-full bg-heat-400" />
              ) : null}
            </button>
          );
        })}
      </div>

      {selectedDate ? (
        <div className="mt-6">
          <p className="label">{t("book.pickSlot")}</p>
          {isSunday ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{t("book.sundayNote")}</p>
          ) : !slotsForSelected ? (
            <p className="text-sm text-ink-faint">{t("common.loading")}</p>
          ) : Object.values(slotsForSelected).every((count) => count === 0) ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{t("book.noSlots")}</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {TIME_SLOTS.map((slot) => {
                const remaining = slotsForSelected[slot.id] ?? 0;
                const full = remaining <= 0;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={full}
                    onClick={() => onSelectSlot(slot.id)}
                    aria-pressed={selectedSlot === slot.id}
                    className={cx(
                      "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                      selectedSlot === slot.id
                        ? "border-heat-500 bg-heat-50 font-semibold text-ink"
                        : full
                          ? "border-slate-200 bg-slate-50 text-slate-400"
                          : "border-slate-200 text-ink-soft hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    <span className="block">{slot[locale]}</span>
                    <span className="mt-0.5 block text-xs text-ink-faint">
                      {full ? t("book.slotFull") : t("book.slotsLeft", { count: remaining })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
