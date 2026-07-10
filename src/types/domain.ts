// Mirrors the shapes defined in /docs/DATABASE.md — kept intentionally close
// to the future Supabase-generated types so Phase 2 mock data survives the
// transition to a real database with minimal rework.

export type HackathonMode = "in_person" | "online" | "hybrid";

export type HackathonStatus =
  | "draft"
  | "published"
  | "registration_open"
  | "registration_closed"
  | "live"
  | "judging"
  | "completed"
  | "archived";

export interface HackathonTrack {
  id: string;
  name: string;
  description: string;
}

export interface HackathonTimelineItem {
  label: string;
  at: string;
}

export interface Hackathon {
  id: string;
  slug: string;
  title: string;
  organizerName: string;
  description: string;
  theme: string;
  locationName: string;
  city: string;
  mode: HackathonMode;
  startsAt: string;
  endsAt: string;
  registrationClosesAt: string;
  teamSizeMin: number;
  teamSizeMax: number;
  rulesMd: string;
  prizes: string[];
  timeline: HackathonTimelineItem[];
  coverGradient: string;
  status: HackathonStatus;
  tracks: HackathonTrack[];
  matchingEnabled: boolean;
}

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "waitlisted"
  | "rejected"
  | "cancelled";

export interface ParticipantRegistration {
  hackathonSlug: string;
  hackathonTitle: string;
  status: ApplicationStatus;
  wantsMatching: boolean;
  teamName?: string;
  nextAction: string;
}

export interface ProposalSummary {
  id: string;
  hackathonTitle: string;
  membersAccepted: number;
  membersTotal: number;
  expiresInHours: number;
}

export interface CommandCenterMetrics {
  registrations: number;
  accepted: number;
  checkedIn: number;
  noShows: number;
  matchingPoolSize: number;
  proposalsPending: number;
  proposalsApproved: number;
  teamsFormed: number;
  submissionsCount: number;
  judgingProgressPct: number;
  openMentorRequests: number;
  sponsorOptInCount: number;
}

export interface CommandCenterWarning {
  id: string;
  severity: "info" | "warning" | "danger";
  message: string;
}
