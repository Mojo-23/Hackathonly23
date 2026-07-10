# Hackathonly Jordan — Risks & Mitigations

## Product risks
| Risk | Impact | Mitigation |
|---|---|---|
| Matching cold start — pools of <10 give bad matches, bad first impressions | Kills the wedge | Organizer manual proposal builder works at any size; pre-formed team path (D1) means the platform is useful with zero pool; set expectations in UI ("pool opens when N join") |
| Scope sprawl — 16 modules half-done | Nothing demoable | Phased plan with per-phase DoD; cut line defined (PHASES.md); lean V1 per module is binding |
| Matching produces awkward/mismatched teams | Participant distrust | Human acceptance gate on every proposal; anonymous decline (D11); rationale shown; expiry recycles stuck proposals |
| Reports underwhelm (the actual selling artifact) | No B2B pull | Reports are first-class (Phase 11 is full-featured, not a stub); print-quality from day one |

## Market / Jordan-specific adoption risks
| Risk | Impact | Mitigation |
|---|---|---|
| Organizers stay on Forms+Excel ("free and familiar") | No adoption | Lead with what Excel can't do: QR check-in, live command center, one-click report; free tier for clubs; white-glove setup for first 5 events |
| WhatsApp gravity — teams coordinate there anyway | Platform feels optional post-match | Don't fight it: our job ends at *safe formation*; the reveal moment hands off to WhatsApp deliberately. Value continues via submissions/mentors/check-in which WhatsApp can't do |
| Small market, few events/year | Slow growth | Universities run recurring internal events (course hackathons, club nights) — target cadence, not just flagship events; event templates (V1.5) for repeat use |
| Trust deficit — students wary of data platforms | Low opt-in rates | Privacy promise front and center; consent history visible to users; anonymous decline; no dark patterns — trust is the brand |
| Organizer champion leaves (student clubs rotate yearly) | Churn | Org-level accounts with multiple members; event templates preserve institutional memory |

## Technical risks
| Risk | Impact | Mitigation |
|---|---|---|
| RLS policy bugs leaking P3 data | Catastrophic for a privacy-branded product | Deny-by-default; matrix tests per phase; P3 access only via audited RPCs; contact fields structurally unreachable client-side (COMPONENTS.md §3.6 type gate) |
| Reveal race conditions (simultaneous accepts) | Duplicate teams / partial reveals | Single `respond_to_proposal` RPC transaction with row locks |
| Check-in day failure (venue wifi, camera quirks) | Public embarrassment at the worst moment | Manual check-in is first-class; scanner tested on real phones; idempotent RPC tolerates retries; check-in page kept dependency-light |
| Service-role key misuse widening over time | Silent privacy erosion | Confined to one module; named callers; each audited; reviewed at every phase DoD |
| Supabase/Vercel limits (export size, function time) | Broken exports at big events | Streaming CSV; snapshot-based reports (compute once); Jordan event scale (≤500) is far under limits |
| Type drift between DB and TS | Runtime bugs | Generated Supabase types regenerated per migration, CI check |

## Privacy & security risks
| Risk | Impact | Mitigation |
|---|---|---|
| Consent ambiguity ("I didn't agree to that") | Trust collapse, legal exposure | Versioned consent_records; optional consents never pre-checked; revocation honored immediately; exports filter row-by-row at generation time |
| Sponsor report accidentally includes PII | Breach of core promise | Separate builder with PII-free output type; review checklist item; snapshot inspectable before sharing |
| QR token leakage (screenshot sharing) | Fake check-ins | Token is opaque (no PII), single event, idempotent; organizer sees name on scan for visual confirm; rotate-token action available |
| Judge/mentor scope creep in policies | Data exposure to semi-trusted roles | event_roles-scoped policies; matrix-tested with real role accounts each phase |
| Audit log gaps | Can't prove good behavior | Audit writes live inside the RPCs themselves (same transaction), not app-layer afterthoughts |

## Database risks
| Risk | Impact | Mitigation |
|---|---|---|
| Consent flag / consent_records divergence | Legal record contradicts behavior | Flags writable only via `record_consent` RPC (same transaction) |
| Missing indexes at event scale | Slow command center on event day | Indexes specified per table in DATABASE.md; query-plan check in Phase 14 |
| Enum churn (statuses evolve) | Painful migrations | Enums chosen conservatively; additive changes only; app-level state machines validate transitions |

## AI risks
| Risk | Impact | Mitigation |
|---|---|---|
| PII reaching the model | Privacy breach | Typed `EventAggregates` boundary — prompts built only from aggregate object (PRIVACY_MODEL.md §7) |
| Hallucinated numbers in reports | Organizer embarrassment | AI narrates numbers we inject; numbers always rendered from data, AI supplies prose; organizer edits before publishing |
| AI perceived as judging people | Brand damage | AI surfaces are operational-only, labeled, and never reference individuals; winner selection structurally human (D15) |
| API cost/downtime | Broken feature | Caching by input hash; `AI_ENABLED` flag with numeric fallbacks everywhere |

## Scope risks
| Risk | Impact | Mitigation |
|---|---|---|
| "One more module" pressure mid-build | Phases never finish | PRODUCT_DECISIONS.md is the change gate — new scope requires a written decision entry |
| Design perfectionism in Phase 2 | Delayed substance | Timeboxed token set + 6 primitives; polish is Phase 14 |
| Building talent/AI before there's data | Impressive-sounding, empty demos | D8/D9: foundations early, products late |
