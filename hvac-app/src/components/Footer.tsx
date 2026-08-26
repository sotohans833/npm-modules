"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { LogoWordmark } from "./Logo";
import { Button, Input, Stars } from "./ui";
import { Clock, Mail, MapPin, Phone } from "./icons";
import { company, telHref } from "@/lib/company";

const SERVICE_LINKS = [
  { href: "/services/ac-repair", index: 0 },
  { href: "/services/heating-repair", index: 1 },
  { href: "/services/maintenance", index: 2 },
  { href: "/services/installation", index: 3 },
  { href: "/services/indoor-air-quality", index: 4 },
  { href: "/services/ductwork", index: 5 },
];

export function Footer() {
  const { t, dict, locale } = useLanguage();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  async function subscribe(event: React.FormEvent) {
    event.preventDefault();
    setState("sending");
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale, source: "footer" }),
    });
    setState("done");
    setEmail("");
  }

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 pb-24 lg:pb-0">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <LogoWordmark />
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {t("footer.tagline", { year: company.foundedYear })}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Stars rating={company.rating} />
            <span className="text-sm font-semibold text-ink">{company.rating}</span>
            <span className="text-sm text-ink-faint">({company.reviewCount})</span>
          </div>
          <p className="mt-4 text-xs text-ink-faint">{company.license}</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">
            {t("footer.servicesTitle")}
          </h3>
          <ul className="space-y-2 text-sm text-ink-soft">
            {SERVICE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-heat-600">
                  {dict.services.items[link.index]?.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">
            {t("footer.companyTitle")}
          </h3>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li><Link href="/about" className="hover:text-heat-600">{t("nav.about")}</Link></li>
            <li><Link href="/plans" className="hover:text-heat-600">{t("nav.plans")}</Link></li>
            <li><Link href="/financing" className="hover:text-heat-600">{t("nav.financing")}</Link></li>
            <li><Link href="/tools" className="hover:text-heat-600">{t("nav.tools")}</Link></li>
            <li><Link href="/blog" className="hover:text-heat-600">{t("nav.blog")}</Link></li>
            <li><Link href="/contact" className="hover:text-heat-600">{t("nav.contact")}</Link></li>
            <li><Link href="/portal" className="hover:text-heat-600">{t("nav.portal")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">
            {t("footer.contactTitle")}
          </h3>
          <ul className="space-y-3 text-sm text-ink-soft">
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-heat-600" />
              <a href={telHref(company.phone)} className="hover:text-heat-600">{company.phone}</a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-heat-600" />
              <a href={`mailto:${company.email}`} className="break-all hover:text-heat-600">{company.email}</a>
            </li>
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-heat-600" />
              <span>{company.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-heat-600" />
              <span>{t("topbar.emergency")}</span>
            </li>
          </ul>

          <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-ink">
            {t("footer.newsletterTitle")}
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-ink-faint">{t("footer.newsletterBody")}</p>
          {state === "done" ? (
            <p className="text-sm font-medium text-emerald-700">{t("footer.newsletterDone")}</p>
          ) : (
            <form onSubmit={subscribe} className="flex gap-2">
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("footer.newsletterPlaceholder")}
                aria-label={t("common.email")}
              />
              <Button type="submit" size="sm" disabled={state === "sending"}>
                {t("footer.newsletterCta")}
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.name}. {t("footer.rights")}
          </p>
          <p>{t("footer.demoNotice")}</p>
        </div>
      </div>
    </footer>
  );
}
