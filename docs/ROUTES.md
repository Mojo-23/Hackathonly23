# Hackathonly Jordan — Route Architecture

Next.js App Router. Route groups: `(public)`, `(auth)`, `(participant)`, `(organizer)`, `(judge)`, `(mentor)`. Auth enforcement is server-side. As of the auth-routing foundation slice, `src/proxy.ts` protects the built `/dashboard` route and the `/organizer/**` route family before page content renders; future layouts may add narrower per-route checks as those areas gain real data.

`profiles.default_workspace` may influence a future default post-auth destination, but it grants no permission. Organizer route access is derived from `organization_members` membership only.

## Public — `(public)`
| Route | Purpose |
|---|---|
| `/` | Landing: wedge headline, upcoming events, how matching works, organizer CTA |
| `/events` | Browse hackathons (filter: city, mode, status, track theme) |
| `/events/[slug]` | Event page: hero, organizer, dates, location, mode, tracks, team size, rules, prizes, timeline, register CTA, matching CTA (post-registration), privacy note |
| `/privacy`, `/terms` | Versioned legal text (versions referenced by `consent_records`) |
| `/organizers` | B2B marketing page: command-center pitch (add in polish phase) |

## Auth — `(auth)` (planned)
| Route | Purpose |
|---|---|
| `/auth` | Future approved login destination. Not implemented as a page in the repo yet; protected-route redirects may still target it with a validated `next` value. |
| `/auth/callback` | Planned OAuth/code exchange route handler. Not implemented yet. |
| `/onboarding` | Planned first-login profile completion. Not implemented yet. |

## Participant — `(participant)`, requires session
| Route | Purpose |
|---|---|
| `/dashboard` | Built placeholder participant dashboard route. Unauthenticated requests are redirected server-side to `/auth?next=/dashboard` before content renders. |
| `/profile` | Planned: edit profile, links, matching defaults, talent opt-in, consent history. Not implemented yet. |
| `/my-events` | Planned: registrations + statuses + my QR code per event. Not implemented yet. |
| `/events/[slug]/register` | Planned: registration + consent step (solo w/ optional matching, or pre-formed team create/join by invite code). Not implemented yet. |
| `/events/[slug]/matching` | Planned: pool view (privacy-safe cards), my preferences, proposal status. Not implemented yet. |
| `/proposals` | Planned: all my proposals. Not implemented yet. |
| `/proposals/[proposalId]` | Planned: proposal detail with safe fields, rationale, accept/decline. Not implemented yet. |
| `/teams/[teamId]` | Planned: team home, roster, revealed contacts post-reveal only, invite code if preformed. Not implemented yet. |
| `/teams/[teamId]/submission` | Planned: create/edit/submit project. Not implemented yet. |
| `/teams/[teamId]/mentor-requests` | Planned: create + track requests. Not implemented yet. |

## Organizer — `(organizer)`, requires org membership
| Route | Purpose |
|---|---|
| `/organizer` | Planned org home: events list, org settings, members. No page exists yet, but the route family is protected by server proxy. |
| `/organizer/events`, `/organizer/events/new` | Planned: manage / create event. Not implemented yet. |
| `/organizer/events/[eventId]` | Built placeholder command-center route over mock data. Unauthenticated requests redirect to `/auth?next=<original path>`; authenticated users with zero `organization_members` rows redirect to `/dashboard`. |
| `/organizer/events/[eventId]/participants` | Planned: table, status changes, consent flags, CSV export. Not implemented yet. |
| `/organizer/events/[eventId]/matching` | Planned: pool overview, generate proposals, monitor responses, manual proposal builder. Not implemented yet. |
| `/organizer/events/[eventId]/check-in` | Planned: QR scanner + manual search + live attendance stats. Not implemented yet. |
| `/organizer/events/[eventId]/submissions` | Planned: all submissions, completeness, track filter. Not implemented yet. |
| `/organizer/events/[eventId]/judging` | Planned: criteria editor, judge invites, assignments, progress, ranking, mark winners. Not implemented yet. |
| `/organizer/events/[eventId]/mentor-requests` | Planned: queue by category/status, bottleneck view. Not implemented yet. |
| `/organizer/events/[eventId]/reports` | Planned: generate/view final report, snapshot history. Not implemented yet. |
| `/organizer/events/[eventId]/sponsor-report` | Planned: generate/view sponsor impact report with aggregates + opt-in talent. Not implemented yet. |
| `/organizer/events/[eventId]/talent` | Planned: opt-in talent table, consented rows only, export. Not implemented yet. |
| `/organizer/events/[eventId]/exports` | Planned: CSV exports hub. Not implemented yet. |
| `/organizer/events/[eventId]/settings` | Planned: edit event, roles, danger zone. Not implemented yet. |

Anonymous requests to `/dashboard` and `/organizer/**` are redirected to the approved future login destination with a validated, same-origin `next` return parameter. External URLs, protocol-relative URLs, and other unsafe return values are ignored by the return-url helper rather than honored.

## Judge — `(judge)`
| Route | Purpose |
|---|---|
| `/judge` | My judging events |
| `/judge/events/[eventId]` | Assignment list + progress |
| `/judge/assignments/[assignmentId]` | Submission view + score form per criterion + comments |

## Mentor — `(mentor)`
| Route | Purpose |
|---|---|
| `/mentor` | My mentor events |
| `/mentor/events/[eventId]` | Open request queue (claim) |
| `/mentor/requests` | My assigned requests (resolve) |

## Sponsor
**Decision: no sponsor portal in V1.** Sponsors get the organizer-generated sponsor report (shared as a page link with token, or PDF later) and consented CSV. Rationale: a portal adds an auth role, an RLS surface, and onboarding friction for maybe 2–5 sponsor users per event — while the actual sponsor need ("show me impact") is fully met by a beautiful report the organizer sends. Build the portal (V2) only when a paying sponsor asks for self-serve access. A read-only tokenized share link `/reports/shared/[token]` is the cheap middle step.

## Platform admin
No routes in V1. Supabase Studio + `platform_admins` table (org verification via SQL). Add `/admin` only when org volume justifies it.

## API route handlers (only these)
| Route | Purpose |
|---|---|
| `/auth/callback` | Session exchange |
| `/api/exports/[eventId]/[dataset]` | CSV streaming (organizer-auth, audited) |
| `/api/check-in` | POST scan payload → RPC (kept as handler for scanner latency) |
| `/reports/shared/[token]` | Read-only shared report page (optional, polish phase) |

Everything else is server actions in `src/actions/*`.
