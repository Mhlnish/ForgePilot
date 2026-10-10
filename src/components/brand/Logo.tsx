import { cn } from "@/lib/utils";

/** ForgePilot mark: an anvil-like hexagon with a rising spark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="fp-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--primary-glow)" />
        </linearGradient>
      </defs>
      <path d="M16 2 28 9v14l-12 7L4 23V9z" fill="url(#fp-g)" opacity="0.18" />
      <path d="M16 2 28 9v14l-12 7L4 23V9z" fill="none" stroke="url(#fp-g)" strokeWidth="1.6" />
      <path d="M9 20h14l-2.5 4h-9z" fill="url(#fp-g)" />
      <path d="M16 7l2 5.5 4.5 1-4.5 1L16 18l-2-3.5-4.5-1 4.5-1z" fill="var(--foreground)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-lg font-semibold tracking-tight">
        Forge<span className="text-gradient">Pilot</span>
      </span>
    </span>
  );
}
