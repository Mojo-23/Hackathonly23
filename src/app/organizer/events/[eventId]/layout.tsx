import {
  LayoutDashboard,
  Users,
  Shuffle,
  QrCode,
  FolderGit2,
  Gavel,
  LifeBuoy,
  FileBarChart,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { AppShell, type AppShellNavItem } from "@/components/layout/app-shell";
import { getHackathonBySlug } from "@/lib/mock-data";

export default async function OrganizerEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const hackathon = getHackathonBySlug(eventId);
  const base = `/organizer/events/${eventId}`;

  const navItems: AppShellNavItem[] = [
    { href: base, label: "Command center", icon: LayoutDashboard, active: true },
    { href: `${base}/participants`, label: "Participants", icon: Users },
    { href: `${base}/matching`, label: "Matching", icon: Shuffle },
    { href: `${base}/check-in`, label: "Check-in", icon: QrCode },
    { href: `${base}/submissions`, label: "Submissions", icon: FolderGit2 },
    { href: `${base}/judging`, label: "Judging", icon: Gavel },
    { href: `${base}/mentor-requests`, label: "Mentor requests", icon: LifeBuoy },
    { href: `${base}/reports`, label: "Reports", icon: FileBarChart },
  ];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <AppShell navItems={navItems} roleLabel="Organizer" contextLabel={hackathon?.title ?? eventId}>
          {children}
        </AppShell>
      </main>
    </>
  );
}
