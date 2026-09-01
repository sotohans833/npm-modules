import { en, type Dictionary } from "./en";
import { es } from "./es";

export type Locale = "en" | "es";

export const LOCALES: Locale[] = ["en", "es"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "aw_locale";

export const dictionaries: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}

/** Replaces `{placeholders}` in a dictionary string. */
export function interpolate(template: string, values?: Record<string, string | number>) {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** Picks the `en`/`es` field off a bilingual record coming from the database. */
export function pick<T extends Record<string, unknown>>(
  record: T,
  base: string,
  locale: Locale,
): string {
  const key = `${base}${locale === "es" ? "Es" : "En"}`;
  return String(record[key] ?? "");
}

export function formatDate(date: Date | string, locale: Locale) {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function formatDateShort(date: Date | string, locale: Locale) {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "es" ? "es-US" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export type { Dictionary };
export { en, es };
