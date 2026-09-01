"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  getDictionary,
  interpolate,
  isLocale,
  type Dictionary,
  type Locale,
} from "@/i18n";

type LanguageContextValue = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
  toggle: () => void;
  /** Dot-path lookup with `{placeholder}` interpolation. */
  t: (path: string, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function lookup(dict: Dictionary, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in (node as Record<string, unknown>)) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
}

export function LanguageProvider({
  initialLocale = DEFAULT_LOCALE,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // The server renders with the cookie value; this only matters for the very
  // first visit, where the browser's own language is a better guess than `en`.
  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_COOKIE);
    if (isLocale(stored)) {
      setLocaleState(stored);
      return;
    }
    if (navigator.language?.toLowerCase().startsWith("es")) setLocaleState("es");
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_COOKIE, next);
    // Mirrored into a cookie so server components render the right language.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const dict = getDictionary(locale);
    return {
      locale,
      dict,
      setLocale,
      toggle: () => setLocale(locale === "en" ? "es" : "en"),
      t: (path, values) => {
        const found = lookup(dict, path);
        if (typeof found === "string") return interpolate(found, values);
        // Surfacing the path beats rendering "undefined" in production copy.
        return path;
      },
    };
  }, [locale, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return context;
}

/** Convenience hook when only the dictionary is needed. */
export function useDict() {
  return useLanguage().dict;
}
