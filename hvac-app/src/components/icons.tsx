import type { ReactElement, SVGProps } from "react";

/**
 * Hand-rolled inline icons: no icon library dependency, no network request,
 * and they inherit `currentColor` so they work on any background.
 */

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function Snowflake(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2v20M4.2 6.5l15.6 9M19.8 6.5l-15.6 9" />
      <path d="M12 6l-2.4-2.4M12 6l2.4-2.4M12 18l-2.4 2.4M12 18l2.4 2.4" />
      <path d="M6.8 9.1L3.5 8.2M6.8 9.1L6 5.8M17.2 14.9l3.3.9M17.2 14.9l.8 3.3" />
      <path d="M17.2 9.1l3.3-.9M17.2 9.1L18 5.8M6.8 14.9l-3.3.9M6.8 14.9L6 18.2" />
    </svg>
  );
}

export function Flame(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.5c2.6 3.1 4 5.4 4 7.2a2 2 0 01-3.4 1.4C12.3 13 13 14 13 15a1.6 1.6 0 11-3.2 0c0-.6.2-1.2.4-1.7-1.6 1-2.6 2.5-2.6 4.2A5.4 5.4 0 0018 18c0-4.4-2-8.4-6-15.5z" />
    </svg>
  );
}

export function Shield(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.8l7 2.6v6c0 4.4-2.9 8.4-7 9.8-4.1-1.4-7-5.4-7-9.8v-6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function Box(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.8l8 4.2v10L12 21.2 4 17V7z" />
      <path d="M4 7l8 4.2L20 7M12 11.2V21" />
    </svg>
  );
}

export function Leaf(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20c0-8 5-14 16-14 0 9-5 14-13 14H4z" />
      <path d="M9.5 14.5C12 12 15 10.8 18 10.5" />
    </svg>
  );
}

export function Wind(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8h11a3 3 0 10-3-3M3 12h15a3 3 0 11-3 3M3 16h9a2.5 2.5 0 112.5 2.5" />
    </svg>
  );
}

export function Bolt(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13.5 2.5L4 13.5h6.5L10 21.5l9.5-11H13z" />
    </svg>
  );
}

export function Building(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 21V5.5L13 3v18M13 21h7V9.5L13 8" />
      <path d="M7 8h3M7 11.5h3M7 15h3M16 12.5h1.5M16 16h1.5" />
    </svg>
  );
}

export function Phone(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.2 3.5h3l1.5 4-2 1.4a12 12 0 006.4 6.4l1.4-2 4 1.5v3a2 2 0 01-2.2 2A17.5 17.5 0 014.2 5.7a2 2 0 012-2.2z" />
    </svg>
  );
}

export function Clock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 2" />
    </svg>
  );
}

export function MapPin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21.5s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10.5" r="2.6" />
    </svg>
  );
}

export function Mail(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.6 6.5l8.4 6 8.4-6" />
    </svg>
  );
}

export function Check(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 12.5l5 5 10-11" />
    </svg>
  );
}

export function ChevronRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 9l7 7 7-7" />
    </svg>
  );
}

export function Calculator(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
      <path d="M8 6.5h8M8 11h1.5M11.5 11H13M15 11h1.5M8 14.5h1.5M11.5 14.5H13M15 14.5h1.5M8 18h1.5M11.5 18H13M15 18h1.5" />
    </svg>
  );
}

export function Stethoscope(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3v5a4 4 0 008 0V3" />
      <path d="M6 3H4.5M12.5 3H14M10 12v2.5a4.5 4.5 0 009 0V17" />
      <circle cx="19" cy="18.5" r="2.2" />
    </svg>
  );
}

export function Gauge(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 17a9 9 0 1117 0" />
      <path d="M12 17l4-5" />
      <circle cx="12" cy="17" r="1.4" />
    </svg>
  );
}

export function User(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0115 0" />
    </svg>
  );
}

export function Menu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function X(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function Alert(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5l9.5 16.5H2.5z" />
      <path d="M12 9.5v4.5M12 17h.01" />
    </svg>
  );
}

export function Calendar(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function Wrench(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15.5 3.5a5.5 5.5 0 00-6.9 6.9L3 16l5 5 5.6-5.6a5.5 5.5 0 006.9-6.9l-3.2 3.2-3-3z" />
    </svg>
  );
}

export function Sparkle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </svg>
  );
}

/** Maps the icon key stored in the dictionary to a component. */
export const ICONS: Record<string, (props: IconProps) => ReactElement> = {
  snowflake: Snowflake,
  flame: Flame,
  shield: Shield,
  box: Box,
  leaf: Leaf,
  wind: Wind,
  bolt: Bolt,
  building: Building,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Component = ICONS[name] ?? Wrench;
  return <Component className={className} />;
}
