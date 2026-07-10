# Hackathonly Jordan — Route Architecture

Next.js App Router. Route groups: `(public)`, `(auth)`, `(participant)`, `(organizer)`, `(judge)`, `(mentor)`. Each group has a layout that enforces auth/role guards server-side (middleware refreshes session; layouts check role membership).

## Public — `(public)`
| Route | Purpose |
|---|---|
| `/` | Landing: wedge headline, upcoming events, how matching works, organizer CTA |
| `/events` | Browse hackathons (filter: city, mode, status, track theme) |
| `/events/[slug]` | Event page: hero, organizer, dates, location, mode, tracks, team size, rules, prizes, timeline, register CTA, matching CTA (post-registration), privacy note |
| `/privacy`, `/terms` | Versioned legal text (versions referenced by `consent_records`) |
| `/organizers` | B2B marketing page: command-center pitch (add in polish phase) |

## Auth — `(auth)`
| Route | Purpose |
|---|---|
| `/auth` | Sign in / sign up (email+password, Google) |
| `/auth/callback` | OAuth/code exchange (route handler) |
| `/onboarding` | First-login profile completion (name, university, role, skills) |

## Participant — `(participant)`, requires session
| Route | Purpose |
|---|---|
| `/dashboard` | My events, active proposals, my teams, next actions |
| `/profile` | Edit profile, links, matching defaults, talent opt-in, consent history |
| `/my-events` | Registrations + statuses + my QR code per event |
| `/events/[slug]/register` | Registration + consent step (solo w/ optional matching, or pre-formed team create/join by invite code) |
| `/events/[slug]/matching` | Pool view (privacy-safe cards), my preferences, proposal status |
| `/proposals` | All my proposals |
| `/proposals/[proposalId]` | Proposal detail: proposed members (safe fields), rationale, accept/decline |
| `/teams/[teamId]` | Team home: roster, revealed contacts (post-reveal only), invite code if preformed |
| `/teams/[teamId]/submission` | Create/edit/submit project |
| `/teams/[teamId]/mentor-requests` | Create + track requests |

## Organizer — `(organizer)`, requires org membership
| Route | Purpose |
|---|---|
| `/organizer` | Org home: events list, org settings, members |
| `/organizer/events`, `/organizer/events/new` | Manage / create event (wizard: basics → tracks → registration → publish) |
| `/organizer/events/[eventId]` | **Command center**: metric cards (registrations, accepted, checked-in, no-shows, pool size, proposals pending/approved, teams, submissions, judging %, open mentor requests, opt-in counts), warnings feed, AI summary card (Phase 13) |
| `/organizer/events/[eventId]/participants` | Table: search/filter, status changes, consent flags, CSV export |
| `/organizer/events/[eventId]/matching` | Pool overview, generate proposals, monitor responses, manual proposal builder |
| `/organizer/events/[eventId]/check-in` | QR scanner (camera) + manual search check-in + live attendance stats |
| `/organizer/events/[eventId]/submissions` | All submissions, completeness, track filter |
| `/organizer/events/[eventId]/judging` | Criteria editor, judge invites, assignments, progress, ranking, mark winners |
| `/organizer/events/[eventId]/mentor-requests` | Queue by category/status, bottleneck view |
| `/organizer/events/[eventId]/reports` | Generate/view final report (print-friendly), snapshot history |
| `/organizer/events/[eventId]/sponsor-report` | Generate/view sponsor impact report (aggregates + opt-in talent) |
| `/organizer/events/[eventId]/talent` | Opt-in talent table (consented rows only), export |
| `/organizer/events/[eventId]/exports` | CSV exports hub (registrations, check-ins, teams, submissions, scores) |
| `/organizer/events/[eventId]/settings` | Edit event, roles (judges/mentors), danger zone |

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
