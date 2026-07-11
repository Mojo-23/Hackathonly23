import { Cpu, Leaf, Radar, Wallet, Wrench } from "lucide-react";

// Reliable thematic signal layered over cover photography — since a curated
// photo's exact subject isn't guaranteed to match an event's theme, this
// icon is what actually and consistently communicates "AI" / "FinTech" /
// "Sustainability" / etc. at a glance, independent of the underlying image.
const themeIcon: { match: RegExp; icon: typeof Cpu }[] = [
  { match: /ai|intelligen/i, icon: Cpu },
  { match: /fintech|financ|payment/i, icon: Wallet },
  { match: /sustain|water|energy|climate/i, icon: Leaf },
  { match: /hardware|iot|robot/i, icon: Wrench },
];

export function ThemeCoverIcon({ theme, className }: { theme: string; className: string }) {
  const Icon = themeIcon.find((entry) => entry.match.test(theme))?.icon ?? Radar;
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}
