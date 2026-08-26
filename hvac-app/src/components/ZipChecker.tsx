"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { Alert, Button, Input } from "./ui";
import { MapPin } from "./icons";

type CoverageResponse = {
  covered: boolean;
  city?: string;
  feeCents?: number;
};

export function ZipChecker({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const [zip, setZip] = useState("");
  const [state, setState] = useState<"idle" | "checking">("idle");
  const [result, setResult] = useState<CoverageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check(event: React.FormEvent) {
    event.preventDefault();
    setResult(null);
    setError(null);

    if (!/^\d{5}$/.test(zip)) {
      setError(t("home.areaInvalid"));
      return;
    }

    setState("checking");
    try {
      const response = await fetch(`/api/service-area?zip=${zip}`);
      setResult((await response.json()) as CoverageResponse);
    } catch {
      setError(t("common.errorGeneric"));
    } finally {
      setState("idle");
    }
  }

  return (
    <div className={compact ? "" : "card"}>
      {!compact ? (
        <>
          <h3 className="h3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-heat-600" />
            {t("home.areaTitle")}
          </h3>
          <p className="mt-2 text-sm text-ink-soft">{t("home.areaSubtitle")}</p>
        </>
      ) : null}

      <form onSubmit={check} className="mt-4 flex gap-2">
        <Input
          value={zip}
          onChange={(event) => setZip(event.target.value.replace(/\D/g, "").slice(0, 5))}
          placeholder={t("home.areaPlaceholder")}
          inputMode="numeric"
          aria-label={t("common.zip")}
          className="no-spin"
        />
        <Button type="submit" disabled={state === "checking"} className="shrink-0">
          {state === "checking" ? t("common.loading") : t("home.areaCheck")}
        </Button>
      </form>

      {error ? (
        <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-4">
          {result.covered ? (
            <Alert tone="success">
              {result.feeCents
                ? t("home.areaCoveredFee", {
                    city: result.city ?? "",
                    zip,
                    fee: Math.round(result.feeCents / 100),
                  })
                : t("home.areaCovered", { city: result.city ?? "", zip })}
            </Alert>
          ) : (
            <Alert tone="warning">{t("home.areaNotCovered")}</Alert>
          )}
        </div>
      ) : null}
    </div>
  );
}
