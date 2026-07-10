# Hackathonly Jordan — Privacy Model

Privacy is the product's differentiator, not a compliance checkbox. Core promise: **no one sees your private contact details until everyone in the proposed team accepts.**

## 1. Data classification

| Level | Data | Examples |
|---|---|---|
| P0 Public | Published event data | Event pages, tracks, published winners |
| P1 Event-scoped | Participation data visible inside an event context | Pool cards, team rosters, submissions (to organizer/judges) |
| P2 Owner + organizer | Operational records | Applications, check-ins, scores, reports |
| P3 Protected | Contact info, consents, tokens, audit | phone/email/WhatsApp in `user_contacts`, check_in_token, consent_records, audit_logs, talent opt-ins |

P3 data never appears in a client-readable SELECT except to its owner. Cross-user access to P3 goes through security-definer RPCs that check an explicit grant (`contact_reveals`, consent flags) and write `audit_logs`.
Private contact fields live in `user_contacts`; `profiles` contains identity/display data only.

## 2. Roles of the parties

- **Organizer = data controller** for their event's registration data (participants consent to share *with the organizer* for *operating this event*).
- **Hackathonly = processor** (and controller only for platform accounts + platform-level talent opt-in).
- **Sponsors = recipients** of aggregates always; of individual profiles only under explicit `sponsor_talent_share` consent or active talent opt-in.

## 3. Consent architecture

Versioned, append-only `consent_records` (see DATABASE.md §10). **Recommendation adopted: consent table over booleans**, because (a) consent text will change and we must prove which version was agreed, (b) withdrawal must be recorded, not overwritten, (c) sponsor-facing exports need a defensible trail. Denormalized booleans on `hackathon_applications` exist purely as an RLS/query cache and are only writable through the consent RPC that appends the record first.

Consent types:
1. `event_data_share` (mandatory to register) — share registration data with organizer for this event.
2. `terms_privacy` (mandatory) — platform terms + privacy policy, versioned.
3. `matching_pool_visibility` (optional) — appear in pool with privacy-safe fields.
4. `sponsor_talent_share` (optional, per event) — profile shared with this event's sponsors.
5. `talent_graph_opt_in` (optional, platform-level, revocable) — long-term talent visibility.

UI rules: mandatory and optional visually separated; optional never pre-checked; each links to the exact versioned text; revocation available from `/profile` and takes effect immediately (flag flip + record).

## 4. Contact reveal mechanism

1. Pool and proposal views are built on views/RPCs exposing only: display name (first name + last initial pre-team; full name post-team), primary role, skills, experience level, university, matching notes. Never email, phone, or profile links pre-reveal.
2. `respond_to_proposal` RPC: on final acceptance, in one transaction — proposal→accepted, team created, pairwise `contact_reveals` inserted, audit rows written.
3. `get_revealed_contacts(team_id)` is the **only** read path to another user's `user_contacts` fields; it verifies a reveal row for (viewer, subject). Profile links remain hidden pre-reveal and may only be exposed through the same approved reveal-safe path.
4. A decline releases everyone silently — members see "proposal didn't complete", not who declined (prevents social retaliation, a real dynamic in a small market like Jordan).
5. Pre-formed team path: joining via invite code *is* mutual consent — reveal rows are created among members on join (reason `team_formed`), consistent promise: contact sharing always follows an explicit mutual action.
6. Organizer access to registrant contact info is legitimate (they run the event, participants consented) but goes through an audited RPC so every access is logged.

## 5. Role visibility boundaries

- **Judges:** assigned submissions + team/project names only. No participant contacts, no applications, no pool.
- **Mentors:** open/assigned requests + team name + request text. No contacts; help happens at the venue or via organizer.
- **Sponsors:** aggregated snapshots; individual data only via consented talent export. No portal, no queries, in V1.
- **AI:** see §7.

## 6. Prohibited by design

No public negative scoring, reliability scores, "loser" labels, hidden data sharing, or creepy profiling. Enforcement is structural: the schema contains no fields that could store such values; sponsor report builder's output type has no PII fields; adding either would require a schema change that PRODUCT_DECISIONS.md marks as rejected.

## 7. AI privacy rules

1. AI runs server-side only; the browser never talks to the model.
2. Inputs are pre-aggregated JSON: counts, distributions, statuses, category tallies. **No names, emails, phones, free-text bios, or individual rows.** The aggregation layer is the privacy boundary — the prompt builder takes a typed `EventAggregates` object that structurally cannot contain PII.
3. Exception handled explicitly: submission summaries may include project titles/descriptions (team-authored public-ish content), never member identities.
4. AI outputs are labeled, cached in `ai_summaries`, and editable by the organizer before inclusion in any report.
5. AI never selects winners, scores people, or ranks participants. It summarizes operations.
6. Feature flag `AI_ENABLED`; every AI surface has a numeric non-AI fallback.

## 8. Retention, deletion, security hygiene

- Account deletion: profile PII nulled/anonymized (`Deleted User`), applications/teams/submissions kept as anonymized event records (organizer's operational history), consents and audit retained (legal). Document this in the privacy policy.
- Event archival: organizer can archive; talent data persists only for opted-in users.
- `check_in_token` is random (no PII encoded in QR), rotatable, single-event.
- Secrets: service key and AI key server-only; never in `NEXT_PUBLIC_*`.
- Audit-logged actions: contact reveals, contact reads by organizer, CSV/talent exports, consent changes, winner marking, check-ins, AI generations, report snapshots.
- Jordan context: no comprehensive data-protection enforcement regime like GDPR yet (PDPL is nascent), but we build to GDPR-grade consent anyway — it's the trust story that sells to banks/NGOs and future-proofs regional expansion (KSA PDPL, UAE).
