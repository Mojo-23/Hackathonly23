import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FolderGit2,
  Gavel,
  Info,
  LifeBuoy,
  QrCode,
  ShieldAlert,
  Shuffle,
  Users,
  Users2,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { MetricCard } from "@/components/ui/metric-card";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { commandCenterMetrics, commandCenterWarnings } from "@/lib/mock-data";

const warningStyles = {
  info: { icon: Info, className: "text-status-info-fg" },
  warning: { icon: AlertTriangle, className: "text-status-pending-fg" },
  danger: { icon: ShieldAlert, className: "text-status-danger-fg" },
} as const;

export default async function OrganizerCommandCenterPage() {
  const m = commandCenterMetrics;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Command center"
        title="Event overview"
        description="Everything happening across this hackathon, at a glance."
      />

      <section>
        <h2 className="text-sm font-semibold text-ink-subtle">Registration</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <MetricCard label="Registrations" value={m.registrations} icon={ClipboardList} />
          <MetricCard label="Accepted" value={m.accepted} icon={CheckCircle2} />
          <MetricCard label="Checked in" value={m.checkedIn} icon={QrCode} hint="Check-in opens on event day" />
          <MetricCard label="No-shows" value={m.noShows} icon={Users} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ink-subtle">Team formation</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <MetricCard label="Matching pool" value={m.matchingPoolSize} icon={Shuffle} />
          <MetricCard
            label="Proposals pending"
            value={m.proposalsPending}
            icon={Users2}
            tone={m.proposalsPending > 0 ? "warning" : "neutral"}
          />
          <MetricCard label="Proposals approved" value={m.proposalsApproved} icon={CheckCircle2} />
          <MetricCard label="Teams formed" value={m.teamsFormed} icon={Users} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ink-subtle">Delivery</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <MetricCard label="Submissions" value={m.submissionsCount} icon={FolderGit2} />
          <MetricCard label="Judging progress" value={`${m.judgingProgressPct}%`} icon={Gavel} />
          <MetricCard label="Open mentor requests" value={m.openMentorRequests} icon={LifeBuoy} />
          <MetricCard label="Sponsor opt-ins" value={m.sponsorOptInCount} icon={ShieldAlert} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ink-subtle">Warnings</h2>
        <Card className="mt-3 divide-y divide-border">
          {commandCenterWarnings.map((warning) => {
            const style = warningStyles[warning.severity];
            const Icon = style.icon;
            return (
              <div key={warning.id} className="flex items-start gap-3 p-4">
                <Icon className={cn("mt-0.5 size-4 shrink-0", style.className)} strokeWidth={1.75} />
                <p className="text-sm text-ink">{warning.message}</p>
              </div>
            );
          })}
        </Card>
      </section>
    </div>
  );
}
