import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppShellNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

export interface AppShellProps {
  navItems: AppShellNavItem[];
  roleLabel: string;
  contextLabel?: string;
  children: React.ReactNode;
}

export function AppShell({ navItems, roleLabel, contextLabel, children }: AppShellProps) {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-20">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
            {roleLabel}
          </p>
          {contextLabel ? (
            <p className="mt-0.5 truncate px-2 text-sm font-medium text-ink" title={contextLabel}>
              {contextLabel}
            </p>
          ) : null}
          <nav className="mt-4 flex flex-col gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    item.active
                      ? "bg-accent-soft text-accent"
                      : "text-ink-muted hover:bg-paper-raised hover:text-ink",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
