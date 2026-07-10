import {
  LayoutDashboard,
  User,
  CalendarCheck,
  Users2,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { AppShell, type AppShellNavItem } from "@/components/layout/app-shell";

const navItems: AppShellNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/my-events", label: "My events", icon: CalendarCheck },
  { href: "/proposals", label: "Proposals", icon: Users2 },
];

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <AppShell navItems={navItems} roleLabel="Participant">
          {children}
        </AppShell>
      </main>
    </>
  );
}
