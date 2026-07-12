import Link from "next/link";
import { Building2, Rocket } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { AppShell, type AppShellNavItem } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/ui/section-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";

const navItems: AppShellNavItem[] = [
  { href: "/organizer", label: "Org home", icon: Building2, active: true },
];

export default function OrganizerHomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <AppShell navItems={navItems} roleLabel="Organizer">
          <div className="flex flex-col gap-8">
            <SectionHeader
              eyebrow="Organizer"
              title="Your organizer workspace"
              description="This is where you'll create hackathons, run registration, manage matching, and generate reports — scoped to your organization."
            />

            <EmptyState
              icon={Rocket}
              title="Workspace ready — no hackathons yet"
              description="Event creation and full command-center management are coming in the next organizer phases. Once available, they'll appear here."
              action={
                <Link
                  href="/events"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  Browse live hackathons
                </Link>
              }
            />

            <Card>
              <CardHeader>
                <CardTitle>What&apos;s coming next</CardTitle>
                <CardDescription>
                  This workspace grows into a full command center as each phase ships.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-body-sm text-text-secondary">
                <p>Create and publish your first hackathon.</p>
                <p>Invite co-organizers to help run it.</p>
                <p>Track registration, matching, check-in, submissions, and judging from one place.</p>
              </CardContent>
            </Card>
          </div>
        </AppShell>
      </main>
    </>
  );
}
