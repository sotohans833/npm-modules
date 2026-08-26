export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  // A sun and a snowflake sharing one mark — heating and cooling in one badge.
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" className="fill-cool-800" />
      <g stroke="#F5811F" strokeWidth="2.6" strokeLinecap="round">
        <path d="M24 6v9M24 33v9M8.2 15l7.8 4.5M32 28.5l7.8 4.5M39.8 15L32 19.5M16 28.5L8.2 33" />
      </g>
      <circle cx="24" cy="24" r="7.5" className="fill-white" />
      <g stroke="#155F9B" strokeWidth="1.7" strokeLinecap="round">
        <path d="M24 18.5v11M19.2 21.2l9.6 5.6M28.8 21.2l-9.6 5.6" />
      </g>
    </svg>
  );
}

export function LogoWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo className="h-9 w-9 shrink-0" />
      <span className="leading-none">
        <span className="block text-[15px] font-extrabold tracking-tight text-cool-900">
          ALL WEATHER
        </span>
        {!compact ? (
          <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-heat-600">
            Heating &amp; Cooling
          </span>
        ) : null}
      </span>
    </span>
  );
}
