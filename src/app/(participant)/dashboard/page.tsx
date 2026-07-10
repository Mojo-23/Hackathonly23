import Link from "next/link";
import { CalendarCheck, Users2 } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { myProposals, myRegistrations } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Dashboard"
        title="Welcome back"
        description="Your registrations, proposals, and teams across every hackathon."
      />

      <section>
        <div className="flex items-center gap-2">
          <CalendarCheck className="size-4 text-ink-subtle" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-ink">My registrations</h2>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {myRegistrations.length === 0 ? (
            <EmptyState
              title="No registrations yet"
              description="Browse events and register to get started."
              action={
                <Link href="/events" className={buttonVariants({ size: "sm" })}>
                  Browse events
                </Link>
              }
            />
          ) : (
            myRegistrations.map((reg) => (
              <Card key={reg.hackathonSlug} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{reg.hackathonTitle}</p>
                    <p className="mt-1 text-sm text-ink-muted">{reg.nextAction}</p>
                  </div>
                  <StatusBadge status={reg.status} />
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2">
          <Users2 className="size-4 text-ink-subtle" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-ink">Active proposals</h2>
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {myProposals.length === 0 ? (
            <EmptyState
              title="No active proposals"
              description="Once you opt into a matching pool, proposed teams will appear here."
            />
          ) : (
            myProposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardHeader>
                  <CardTitle>{proposal.hackathonTitle}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink-muted">
                    {proposal.membersAccepted} of {proposal.membersTotal} teammates accepted
                  </p>
                  <StatusBadge
                    status="pending"
                    label={`Expires in ${proposal.expiresInHours}h`}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
