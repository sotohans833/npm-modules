"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { ChevronDown } from "./icons";
import { cx } from "./ui";
import { FAQS, type Faq as FaqItem } from "@/content/faqs";

export function FaqList({
  categories,
  limit,
}: {
  categories?: FaqItem["category"][];
  limit?: number;
}) {
  const { locale } = useLanguage();
  const [openId, setOpenId] = useState<string | null>(null);

  const items = FAQS.filter((faq) => !categories || categories.includes(faq.category)).slice(
    0,
    limit ?? FAQS.length,
  );

  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {items.map((faq) => {
        const open = openId === faq.id;
        return (
          <div key={faq.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : faq.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50"
            >
              <span className="text-sm font-semibold text-ink sm:text-base">{faq.q[locale]}</span>
              <ChevronDown
                className={cx("h-5 w-5 shrink-0 text-ink-faint transition-transform", open && "rotate-180")}
              />
            </button>
            {open ? (
              <div className="animate-fade-up px-5 pb-5 text-sm leading-relaxed text-ink-soft">
                {faq.a[locale]}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
