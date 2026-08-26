"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { LogoWordmark } from "./Logo";
import { Button, ButtonLink, cx } from "./ui";
import { ChevronDown, Menu, Phone, User, X } from "./icons";
import { company, telHref } from "@/lib/company";
import type { SessionUser } from "@/lib/auth";

const PRIMARY = [
  { href: "/services", key: "nav.services" },
  { href: "/plans", key: "nav.plans" },
  { href: "/financing", key: "nav.financing" },
  { href: "/tools", key: "nav.tools" },
  { href: "/blog", key: "nav.blog" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export function Header({ user }: { user: SessionUser | null }) {
  const { t, locale, toggle } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // Route changes should never leave a menu hanging open behind the new page.
  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Emergency strip: the single most valuable element on an HVAC site. */}
      <div className="bg-cool-900 text-white">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-xs">
          <span className="hidden sm:inline text-cool-100">{t("topbar.serving")}</span>
          <div className="flex items-center gap-4">
            <a
              href={telHref(company.emergencyPhone)}
              className="inline-flex items-center gap-1.5 font-semibold text-heat-300 hover:text-heat-200"
            >
              <Phone className="h-3.5 w-3.5" />
              {t("topbar.emergency")} · {company.emergencyPhone}
            </a>
            <button
              type="button"
              onClick={toggle}
              className="rounded border border-white/25 px-2 py-0.5 font-semibold hover:bg-white/10"
              aria-label={locale === "en" ? "Cambiar a español" : "Switch to English"}
            >
              {t("nav.language")}
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label={company.name}>
            <LogoWordmark />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {PRIMARY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-slate-100 text-ink"
                    : "text-ink-soft hover:bg-slate-50 hover:text-ink",
                )}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                  aria-expanded={accountOpen}
                >
                  <User className="h-4 w-4" />
                  {user.name.split(" ")[0]}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {accountOpen ? (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lift">
                    <Link href="/portal" className="block px-4 py-2.5 text-sm hover:bg-slate-50">
                      {t("nav.portal")}
                    </Link>
                    {user.role === "ADMIN" ? (
                      <Link href="/admin" className="block px-4 py-2.5 text-sm hover:bg-slate-50">
                        {t("nav.admin")}
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={signOut}
                      className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      {t("nav.logout")}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink"
              >
                {t("nav.login")}
              </Link>
            )}
            <ButtonLink href="/quote" variant="outline">
              {t("nav.quote")}
            </ButtonLink>
            <ButtonLink href="/book">{t("nav.book")}</ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg p-2 text-ink lg:hidden"
            aria-label={t("nav.menu")}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-b border-slate-200 bg-white lg:hidden">
          <div className="container-page space-y-1 py-4">
            {PRIMARY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-slate-50"
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="my-2 border-t border-slate-200" />
            {user ? (
              <>
                <Link href="/portal" className="block rounded-lg px-3 py-2.5 text-sm font-medium">
                  {t("nav.portal")}
                </Link>
                {user.role === "ADMIN" ? (
                  <Link href="/admin" className="block rounded-lg px-3 py-2.5 text-sm font-medium">
                    {t("nav.admin")}
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={signOut}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <Link href="/login" className="block rounded-lg px-3 py-2.5 text-sm font-medium">
                {t("nav.login")}
              </Link>
            )}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <ButtonLink href="/quote" variant="outline">
                {t("nav.quote")}
              </ButtonLink>
              <ButtonLink href="/book">{t("nav.book")}</ButtonLink>
            </div>
            <Button
              variant="secondary"
              className="mt-2 w-full"
              onClick={() => {
                window.location.href = telHref(company.emergencyPhone);
              }}
            >
              <Phone className="h-4 w-4" />
              {company.emergencyPhone}
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

/** Fixed call/book bar on phones, where the thumb never leaves the bottom. */
export function MobileActionBar() {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
      <a
        href={telHref(company.phone)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold"
      >
        <Phone className="h-4 w-4" />
        {t("common.callNow")}
      </a>
      <ButtonLink href="/book" className="w-full">
        {t("common.bookNow")}
      </ButtonLink>
    </div>
  );
}
