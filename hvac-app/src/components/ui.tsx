"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-heat-500 text-white hover:bg-heat-600 shadow-sm",
  secondary: "bg-cool-700 text-white hover:bg-cool-800 shadow-sm",
  outline: "border border-slate-300 bg-white text-ink hover:bg-slate-50",
  ghost: "text-ink-soft hover:bg-slate-100 hover:text-ink",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={cx(BASE, VARIANTS[variant], SIZES[size], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={cx(BASE, VARIANTS[variant], SIZES[size], className)} {...props} />;
}

/* -------------------------------------------------------------------------- */
/* Layout helpers                                                              */
/* -------------------------------------------------------------------------- */

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cx("section", className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={cx("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
      <h2 className="h2">{title}</h2>
      {subtitle ? <p className="lead mt-3">{subtitle}</p> : null}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx("card", className)}>{children}</div>;
}

/* -------------------------------------------------------------------------- */
/* Form fields                                                                 */
/* -------------------------------------------------------------------------- */

export function Field({
  label,
  help,
  error,
  required,
  children,
  htmlFor,
}: {
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-1 text-heat-600">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : help ? (
        <p className="help">{help}</p>
      ) : null}
    </div>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={cx("input", props.className)} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea rows={4} {...props} className={cx("input", props.className)} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={cx("input", props.className)} />;
}

/** Large tappable radio card — much friendlier than a native radio on mobile. */
export function OptionCard({
  selected,
  title,
  body,
  onClick,
  disabled,
}: {
  selected: boolean;
  title: string;
  body?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cx(
        "w-full rounded-2xl border p-4 text-left transition-all disabled:opacity-40",
        selected
          ? "border-heat-500 bg-heat-50 ring-2 ring-heat-200"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      <span className="block text-sm font-semibold text-ink">{title}</span>
      {body ? <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{body}</span> : null}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  help,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  help?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50"
    >
      <span
        className={cx(
          "mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
          checked ? "bg-heat-500" : "bg-slate-300",
        )}
      >
        <span
          className={cx(
            "h-4 w-4 rounded-full bg-white transition-transform",
            checked && "translate-x-4",
          )}
        />
      </span>
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {help ? <span className="mt-0.5 block text-xs text-ink-faint">{help}</span> : null}
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Feedback                                                                    */
/* -------------------------------------------------------------------------- */

const TONES = {
  info: "border-cool-200 bg-cool-50 text-cool-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-900",
} as const;

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: keyof typeof TONES;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cx("rounded-xl border p-4 text-sm leading-relaxed", TONES[tone])}>
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      {children}
    </div>
  );
}

const BADGE_TONES: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-cool-100 text-cool-800",
  ASSIGNED: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-slate-200 text-slate-700",
  NEW: "bg-amber-100 text-amber-800",
  REVIEWING: "bg-cool-100 text-cool-800",
  SENT: "bg-violet-100 text-violet-800",
  WON: "bg-emerald-100 text-emerald-800",
  LOST: "bg-slate-200 text-slate-700",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        BADGE_TONES[status] ?? "bg-slate-100 text-slate-700",
      )}
    >
      {label}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cx(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent",
        className,
      )}
    />
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-0.5 text-heat-500", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} viewBox="0 0 20 20" className="h-4 w-4" fill={star <= Math.round(rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M10 1.8l2.5 5.1 5.6.8-4 3.9 1 5.6L10 14.6 4.9 17.2l1-5.6-4-3.9 5.6-.8z" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}
