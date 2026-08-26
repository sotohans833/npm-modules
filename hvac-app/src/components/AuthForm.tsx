"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { Alert, Button, Card, Field, Input, Section } from "./ui";
import { Logo } from "./Logo";
import { company } from "@/lib/company";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/portal";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    zip: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === "register" && form.password !== form.confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setSubmitting(true);

    const body =
      mode === "login"
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone || undefined,
            zip: form.zip || undefined,
            locale,
          };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSubmitting(false);

    if (response.ok) {
      router.push(next);
      // Server components hold the session, so the tree has to be re-fetched.
      router.refresh();
      return;
    }

    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (data.error === "EMAIL_TAKEN") setError(t("auth.emailTaken"));
    else if (data.error === "INVALID_CREDENTIALS") setError(t("auth.invalid"));
    else if (data.error === "VALIDATION_ERROR") setError(t("auth.passwordHelp"));
    else setError(t("common.errorGeneric"));
  }

  const isLogin = mode === "login";

  return (
    <Section>
      <Card className="mx-auto max-w-md">
        <div className="flex flex-col items-center text-center">
          <Logo className="h-12 w-12" />
          <h1 className="h2 mt-4">{isLogin ? t("auth.loginTitle") : t("auth.registerTitle")}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {isLogin ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-5">
          {error ? <Alert tone="danger">{error}</Alert> : null}

          {!isLogin ? (
            <Field label={t("common.name")} required htmlFor="name">
              <Input
                id="name"
                required
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                autoComplete="name"
              />
            </Field>
          ) : null}

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

          {!isLogin ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={`${t("common.phone")} (${t("common.optional")})`} htmlFor="phone">
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  autoComplete="tel"
                />
              </Field>
              <Field label={`${t("common.zip")} (${t("common.optional")})`} htmlFor="zip">
                <Input
                  id="zip"
                  inputMode="numeric"
                  className="no-spin"
                  value={form.zip}
                  onChange={(event) => update("zip", event.target.value.replace(/\D/g, "").slice(0, 5))}
                  autoComplete="postal-code"
                />
              </Field>
            </div>
          ) : null}

          <Field
            label={t("auth.password")}
            help={!isLogin ? t("auth.passwordHelp") : undefined}
            required
            htmlFor="password"
          >
            <Input
              id="password"
              required
              type="password"
              minLength={isLogin ? undefined : 8}
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </Field>

          {!isLogin ? (
            <Field label={t("auth.passwordConfirm")} required htmlFor="confirm">
              <Input
                id="confirm"
                required
                type="password"
                minLength={8}
                value={form.confirm}
                onChange={(event) => update("confirm", event.target.value)}
                autoComplete="new-password"
              />
            </Field>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? t("common.sending") : isLogin ? t("auth.signIn") : t("auth.signUp")}
          </Button>
        </form>

        <div className="mt-6 space-y-2 border-t border-slate-200 pt-6 text-center text-sm">
          <p className="text-ink-soft">
            {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
            <Link
              href={isLogin ? "/register" : "/login"}
              className="font-semibold text-heat-600 hover:underline"
            >
              {isLogin ? t("auth.signUp") : t("auth.signIn")}
            </Link>
          </p>
          {isLogin ? (
            <p className="text-xs text-ink-faint">
              {t("auth.forgot")} {t("auth.forgotHelp", { phone: company.phone })}
            </p>
          ) : null}
        </div>
      </Card>
    </Section>
  );
}
