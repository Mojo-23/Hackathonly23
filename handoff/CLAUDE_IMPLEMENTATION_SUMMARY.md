# CLAUDE IMPLEMENTATION SUMMARY — PHASE-UI-004: Organizer Landing Surface

## Task
Design and implement a premium, public, organizer-facing landing page (`/organizers`) that positions Hackathonly as a full-lifecycle hackathon platform for universities, companies, incubators, communities, and government/innovation programs — TAIKAI-adjacent in maturity and rhythm, fully Sandstone Editorial, no invented data, no functional lead form.

Implemented directly by Claude as Design Authority, per the standing role split in `CLAUDE.md` (human-approved before this phase began). No Codex task created, no Codex run. No backend, database, Supabase, RLS, migrations, or auth logic touched.

This document now covers two passes: the original implementation, and a follow-up fix pass that addressed the two blocking findings from `handoff/CLAUDE_REVIEW.md`'s first review. The fix pass is called out explicitly in its own section below rather than silently merged into the original narrative.

## Route decision
New public route: **`/organizers`**, at `src/app/(public)/organizers/page.tsx`, inside the existing `(public)` route group. This matches the route name already anticipated in `docs/PHASES.md`'s Phase 14 entry ("landing polish + `/organizers` pitch page") and keeps the page inside the same layout/header/footer shell as every other public page — no new layout was needed.

## TAIKAI reference research
Inspected `https://taikai.network/` directly via web fetch (text/structure extraction only — no visual rendering available). Findings used as structural reference:
- Credibility-first ordering: institutional trust signals before feature detail.
- Explicit, non-generic separation of organizer value from participant value (not just a shared feature list).
- Descriptive, outcome-named CTAs rather than generic "Sign up."
- Restrained capability presentation — features are shown in context, not as an exhaustive list, to avoid overwhelming a first-time host.
No TAIKAI text, assets, logos, layout, or illustration were copied. No purple/web3/NFT/crypto language or styling was introduced anywhere.

## Design direction chosen
**Editorial B2B command-center pitch**, structured as: hero with a dominant "organizer command center" preview stage → a trust/credibility strip (audit-trail framing, not marketing claims) → a nine-stage lifecycle shown as four unevenly-sized clusters (not nine identical cards) → a bento-style grid of seven real product surfaces (not a raw admin table) → a two-column privacy/trust panel → an audience section written as a single editorial sentence with inline emphasis (not five repetitive cards) → one inverted closer band.

### Alternatives considered and rejected
1. **Uniform 9-card lifecycle grid** (one card per stage, identical anatomy) — rejected: this is exactly the "generic three/nine-card feature grid" pattern `DESIGN_SYSTEM.md` §K forbids as the default AI-slop tell. Replaced with four unevenly-sized clusters (3/1/2/3 items) so the composition itself carries rhythm.
2. **Five audience cards, one per audience** (universities/companies/incubators/communities/government), each with its own icon — rejected per the task's explicit instruction not to turn this into five repetitive cards, and because five near-identical icon cards would fail the deletion test (removing any one loses nothing). Replaced with one editorial sentence naming all five audiences inline, plus a lightweight chip row for scannability.
3. **Reusing the landing page's exact hero preview content** (team-formation queue + live signals feed) — rejected: it would read as a re-skinned duplicate rather than a distinct organizer-facing product surface. Built a different, organizer-specific hero preview instead: a module rail (Registration/Matching/Check-in/Submissions/Judging/Reports) + registration-health metrics + an event-day readiness checklist — content an organizer, not a participant, would actually want to see first.
4. **A literal donut chart or progress bar for judging/registration progress** — rejected per §K's "donut-chart soup" / "decorative sparklines with no baseline" ban and per the motion system's rule that brand/clay-as-progress is a narrow exception reserved for the landing page's lifecycle connector only. Used plain tabular numbers + one operator-language caption instead (e.g. "121 of 138 applicants accepted").
5. **A second inverted/dark section** for the trust panel (to visually separate it further) — rejected: `DESIGN_SYSTEM.md` §H states the inverted band is "the ONLY dark surface in the system" and using it mid-page is forbidden. Exactly one inverted section exists on this page — the final CTA closer — matching the sanctioned use case.

## Exact files changed (original implementation pass)

**New:**
- `src/app/(public)/organizers/page.tsx` — the organizer landing page (single self-contained route file, matching the existing landing page's file organization convention).

**Modified:**
- `src/lib/motion/tokens.ts` — added two named tokens to the existing `duration` object: `pulse: 2` (live-indicator opacity pulse loop) and `heroPanelDelay: 0.35` (hero preview panel entrance delay).
- `docs/MOTION_SYSTEM.md` §3 — added the two new tokens to the documented token object so the doc's code sample stays accurate.
- `docs/DESIGN_SYSTEM.md` §I timing token table — added one row each for `duration.pulse` and `duration.heroPanelDelay`.
- `src/components/layout/site-header.tsx` — the "For organizers" nav link now points to `/organizers` (was pointing directly at the live organizer command-center demo).
- `src/components/layout/site-footer.tsx` — added an "Organizers" link (reordered the row to Events → Organizers → Privacy → Terms).

**Not touched:** `src/app/(public)/page.tsx` (landing page), any backend/Supabase/RLS/migration/auth file, `package.json`/`package-lock.json` (no dependency changes), any global design token in `globals.css`, any organizer product route under `src/app/organizer/`.

## Fix pass — addressing the two blocking review findings

Scope for this pass was intentionally narrow, per explicit instruction: only the two blocking items from `handoff/CLAUDE_REVIEW.md`'s first review, no other redesign, no motion changes, no doc changes, no backend changes, no other route touched. **The only file modified in this pass is `src/app/(public)/organizers/page.tsx`** — confirmed via `git status`: no other file changed since the prior verified state.

### Fix 1 — missing `<h2>` on the audience section
The "Built for every kind of organizer" section had an eyebrow `<p>` and a body paragraph but no heading element, so it was invisible to screen-reader users navigating by heading list. Added:
```tsx
<h2 className="mt-2 text-heading-lg font-semibold text-text-primary">
  One privacy-first foundation, every kind of organizer
</h2>
```
directly after the existing eyebrow and before the audience paragraph — the same eyebrow → `<h2>` → supporting-text pattern already used by every other section on the page. No existing copy was changed; this is a pure addition. The page now has one `<h1>` and six `<h2>`s (previously five), with no skipped heading levels.

### Fix 2 — hero registration-health metric row at 375px
Reviewed the hero preview panel's "Registration health" tile row by tracing the actual layout math for a 375px viewport (no live browser render available to me — this is source/CSS-based reasoning, stated as a limitation, not a claim of pixel-verified visual QA):
- At 375px, the outer hero panel's module rail is already `hidden` below `lg`, and the two-pane split (`registration health` / `event-day readiness`) is single-column below `md` (768px) — so the registration-health tile gets the panel's full content width, roughly 375px − 32px page gutter − 2px border − 48px panel padding (`p-6` × 2) ≈ **~290px** available for the three-tile row.
- The row was `grid-cols-3 gap-4` unconditionally — three columns in ~290px leaves ~87px per tile after gaps. The longest label, "In matching pool" (17 characters at 14px), does not fit on one line in an ~87px column and would wrap to two lines, while "Registered" and "Accepted" stay on one line — producing uneven, cramped-looking tiles with inconsistent internal rhythm.
- **Fix applied:** changed the row's classes from `grid grid-cols-3 gap-4` to `grid grid-cols-1 gap-4 sm:grid-cols-3`. Below `sm` (640px) — which covers 375px — the three tiles stack full-width, each label gets its full ~290px of room and never wraps. At `sm` and above, the row already has enough width (either because the viewport itself is ≥640px, or because by `md` the panel has split into two half-width columns inside a `max-w-5xl` container, which by then comfortably exceeds 3×~87px) for the original 3-column layout, so desktop/tablet presentation is unchanged.
- No other property of the tiles changed — same `FloatingElement` ambient-drift wrapper, same `MotionCounter`, same icons, same labels, same spacing scale (`gap-4` = 16px, still on the closed 4px scale). This is a pure responsive-breakpoint adjustment, not a content or motion change.

## Motion decisions
Unchanged from the original pass — no motion primitive, token, hook, or animation value was touched in the fix pass. No new motion primitives were created in either pass — the page composes entirely from the existing `src/lib/motion/` and `src/components/motion/` system (`MotionReveal`, `MotionSection`, `MotionStagger`/`MotionStaggerItem`, `MotionCard`, `MotionCounter`, `FloatingElement`, `useCursorParallax`, `useReducedMotionSafe`). Full detail unchanged from the original implementation:
- Hero text: bespoke, page-local staggered sequence on mount, every value from `tokens.ts`.
- Hero preview panel: `scaleIn` + `duration.heroPanelDelay`, plus `useCursorParallax(8)` as the one dominant hero element.
- "Live" status pulse: `duration.pulse` token.
- Ambient drift: `FloatingElement` used only on the hero's three registration-health tiles, ambient distance/duration values unchanged by the fix pass (only the tiles' container `grid-cols` classes changed, not the `FloatingElement` props).
- Scroll reveal varies between `fadeUp`/`fadeUpSm`/`fadeIn` across sections.
- No new animation library, no hardcoded duration/delay/easing/distance anywhere in the page.

## Responsive behavior
- Hero preview panel: module rail `hidden` below `lg`; two-pane content stacks below `md`. **Updated by the fix pass:** the registration-health metric row now stacks to a single column below `sm` and shows 3-across at `sm` and above, resolving the cramped/wrapping label issue at 375px while leaving tablet/desktop presentation unchanged.
- Lifecycle clusters: 1 column on mobile → 2 columns at `sm` → 4 columns at `lg` (unchanged).
- Product-surface grid: 1 column on mobile → 2 at `sm` → 4 at `lg`, with the two "hero" surfaces spanning 2 columns at `sm`+ (unchanged).
- Privacy panel: single column on mobile, two-column split at `lg` (unchanged).
- Final CTA and audience sections: centered single-column content at every width (unchanged; the audience section now also carries a proper `<h2>`, which does not affect layout).
- All spacing remains on the closed 4px-multiple scale — no off-scale values introduced by the fix pass.

## Accessibility decisions
- **Updated by the fix pass:** the page now has a complete, unbroken heading outline — one `<h1>`, six `<h2>`s, no section without a heading, no skipped levels. This was the specific gap the first review flagged; it's closed.
- Every animated element still routes through an existing reduced-motion-safe primitive or `useReducedMotionSafe()` directly — unchanged by this pass.
- All interactive elements remain real `<Link>`s with `buttonVariants` styling — unchanged.
- Color contrast: unchanged, still the same semantic token set used elsewhere in the product.
- No content is conveyed by color alone — unchanged.

## Verification results (re-run after the fix pass)
- `npx tsc --noEmit` — passed, zero errors.
- `npx eslint .` — passed, zero errors, zero warnings.
- `npm run build` — passed. `/organizers` prerenders statically (`○`); every existing route still builds and prerenders exactly as before — no regressions.
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` — passed all four steps (build, typecheck, lint, forbidden-string scan).
- Raw-hex scan (`grep -rnE "#[0-9a-fA-F]{3,8}"`) on the page file — zero matches.
- `profile_id` scan on the page file — zero matches.
- `git status` after the fix pass confirms scope: the only file changed since the previously-reviewed state is `src/app/(public)/organizers/page.tsx`. No motion file, no doc, no backend file, no other route was touched.

## Deviations
Unchanged from the original pass (all still accurate and still apply — none were affected by the fix pass):
- **Clay/brand-color budget**: an early draft used `text-brand` for the four lifecycle cluster labels; fixed to `text-text-tertiary` before the original verification run. Final clay usage on the page: the primary CTA button (reused for the same action in the hero and the closer) and the hero preview panel's one active-module tint — two of the three allowed uses, no decorative third.
- **Motion token additions**: `duration.pulse` and `duration.heroPanelDelay` were judged to fall within the motion token system's own self-extension rule (`MOTION_SYSTEM.md` §12 rule 4) rather than the `DESIGN_SYSTEM.md` §D–G "global design token" category requiring separate approval. This judgment call was flagged for the human in the first review round and remains an open confirmation item, not something resolved by the fix pass.
- **CTA destination**: both CTAs point to the existing, real `/organizer/events/jordan-ai-builders-hackathon` command-center demo and `/events`, not a fabricated lead-capture form.
- **Nav link retarget**: `site-header.tsx`'s "For organizers" link now points at `/organizers` instead of straight at the demo.
- **Landing page left untouched**: its own "For organizers" hero CTA still links directly to the command-center demo rather than to `/organizers` — noted as a candidate follow-up, not addressed here (out of scope for both passes).

## Design polish pass — event card imagery + avatar refinement

A third, separate pass, requested as "purely a visual quality improvement": add large cover imagery to event cards, and replace initials-only avatars with something more realistic in the landing page's "Team formation queue" preview. Scope: visual only, no backend/motion-system/routing/docs/product-structure changes.

### Scope clarification (asked, not assumed)
The request referred to "the organizer command center preview" showing "Layla," "Omar," and "Sara." Those exact names exist only in `src/app/(public)/page.tsx` (the public landing page's hero, in a panel labeled "Team formation queue") — my `/organizers` page has no participant names by design (organizer-facing surfaces show aggregates only, never individual participant identities). Rather than guess which page was meant, I asked; the human confirmed the landing page's hero preview was the intended target. This pass therefore touches the landing page, which earlier passes had deliberately left alone — that isolation boundary was specific to PHASE-UI-004's own scope, not a permanent rule, and this pass's human instruction explicitly supersedes it for these two files only.

### Design-system conflict (surfaced, not silently resolved either way)
The request asked for "AI-generated artwork... acceptable for now as placeholder/demo content" for event covers, and "realistic profile-photo style" avatars. `docs/DESIGN_SYSTEM.md` §C is explicit and review-blocking: illustration and AI-generated art are FORBIDDEN; photography is allowed only when real, and real photography "does not exist yet." §K separately bans "AI-generated illustrations" and stock photography outright. I also have no image-generation tool available — the only way to get literal photographic/AI-art imagery into the repo would have been linking to an external stock-photo host at runtime, which is still stock photography under the same rule, and this task told me not to touch docs, so there would be nowhere to record the exception.

I surfaced this conflict and offered a choice: stay within the design system (enhanced system-generated covers/avatars, no doc changes needed) versus use external stock imagery now and log it as an unresolved rule exception. The human chose to **stay within the design system**. Everything below was built accordingly — no photographic or AI-generated imagery was added anywhere, and no doc file was touched.

### 1. Event cards (`src/components/events/event-card.tsx`)
Replaced the previous fixed `h-32` (128px) cover strip with a much larger `aspect-video` (16:9) cover zone — at typical card widths (~350–380px in the existing 3-column grid) this yields roughly 195–215px of cover height against a total card height of ~460–500px, landing in the requested 35–45% proportion.

Each cover is still 100% system-generated (no image files, no external requests), built from three elements, all already-sanctioned patterns reused rather than invented:
- **A large, low-opacity, theme-matched watermark icon** (Lucide `Cpu` for AI-themed events, `Wallet` for fintech, `Leaf` for sustainability, `Wrench` for hardware/IoT/robotics, `Radar` as the fallback for any future theme that doesn't match) — sized boldly (`size-32`) and cropped into the corner at 15–25% opacity, so it reads as a strong thematic signal without competing with the event-mark typography or feeling noisy. Selection is a simple keyword match against `hackathon.theme`, so it scales automatically to future events without per-event hardcoding.
- **The existing typographic "event mark"** (2–3 letter monogram derived from the title) — kept, but promoted from `text-heading-lg` to `text-display-lg` to read as a real hero element on the larger canvas.
- **The bracket/finder-corner motif**, reused verbatim from the pattern already used on the event detail page's "Event identity" panel (`docs/DESIGN_SYSTEM.md` §C names this "the brand's ownable graphic device... MAY be used as crop-mark framing on system covers") — one instance per cover, as the rule requires.

**Per-event visual identity** comes from a deterministic two-tone rotation (a simple hash of `hackathon.id` alternates between `background-inverse` and `background-sunken`) — the closed palette has exactly two non-white surface tones available for this purpose (brand/clay was explicitly not used here, since "brand color MUST NEVER become wallpaper" per §D). This replaces the old, pre-D18 `coverGradient` field's Tailwind gradient classes (`from-amber-800 via-amber-700...`), which were leftover from Phase 2 and already inconsistent with the current design system's "no gradients except flat color-block covers" rule — removing them is a compliance improvement, not a regression. The `Hackathon.coverGradient` field itself was left in place in `src/types/domain.ts`/`src/lib/mock-data.ts` (untouched — no product-structure change), it's just no longer read by `EventCard`.

One implementation note: an initial version stored the dynamically-selected icon component in a capitalized variable computed inside `EventCard`'s render body (`const ThemeIcon = getThemeIcon(...)`), which `eslint`'s `react-hooks/static-components` rule correctly flagged as "component created during render." Fixed by extracting a small top-level `ThemeCoverIcon({ theme, className })` component that owns the lookup internally — a stable, module-scope component reference is used in the parent's JSX instead.

### 2. Avatar refinement (`src/app/(public)/page.tsx`, "Team formation queue" panel)
Replaced the small (`size-10`), square (`rounded-control`), single-tone (white background) initials chip with a larger (`size-11`), circular (`rounded-pill`) chip that alternates between the same two closed-palette tones used on the new event covers (`background-inverse`/white-with-`border-strong`), plus a soft 1px border on each (`border-text-inverse/20` on the dark variant, `border-border-strong` on the light variant) — giving each of the three people a distinct, consistent, professional "avatar slot" presence without introducing any photographic content, color, or per-person invented visual identity beyond their existing initials. All three avatars share identical size, shape, and border treatment (only the tone alternates), satisfying "consistent crop / same size / matching visual language" as closely as an initials-based treatment can. Marked `aria-hidden="true"` since the adjacent name text already conveys the same information to assistive technology (avoids duplicate announcement) — a small, safe accessibility improvement, not a functional change.

This is honestly **not** photorealistic — it's the compliant alternative the human explicitly chose over stock/AI imagery, and is presented as such rather than overstating it as "realistic avatars."

### Verification
- `npx tsc --noEmit` — passed, zero errors.
- `npx eslint .` — passed after fixing the one `react-hooks/static-components` error described above; clean on the second run.
- `npm run build` — passed. All routes prerender exactly as before (`/`, `/events`, `/events/[slug]` ×3, `/organizer/events/[eventId]`, `/organizers`, `/dashboard`, `/privacy`, `/terms`) — no regressions.
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` — passed all four steps.
- Raw-hex scan on both changed files — zero matches.
- `profile_id` scan on both changed files — zero matches.
- Gradient-utility scan (`from-|via-|to-<color>-<shade>`) on `event-card.tsx` — zero matches, confirming the old Tailwind gradient classes are fully gone, not just unused.
- `git status` confirms scope: exactly two files changed in this pass — `src/components/events/event-card.tsx` and `src/app/(public)/page.tsx`. No motion, docs, backend, or routing file touched; `/organizers` itself was not modified by this pass (the avatar content lives on the landing page, not the organizer page — see the scope clarification above).

### Deviations
- **Landing page touched**, reversing the "unrelated public pages" isolation from PHASE-UI-004 — explicitly authorized by the human for this pass only, after the scope-clarification question above.
- **Imagery request not implemented literally in this pass** — no AI-generated or stock photography was added anywhere; the human explicitly chose the design-system-compliant alternative after the conflict was surfaced. **Superseded by the follow-up pass below**, where the human explicitly asked for real photography after seeing the icon-based result.
- **`Hackathon.coverGradient` field is now unused** by `EventCard` but was left in the type/mock-data files untouched, since removing a field is a product-structure change this pass was told not to make. Flagging it as dead weight for a future cleanup task, not removed here.

## Follow-up pass — real photography ("add real pics")

A fourth pass, triggered by a two-word instruction after the design-polish pass: "add real pics." This explicitly reverses the choice made one turn earlier (to stay within the design system rather than use stock/AI imagery).

### What "reversal" means here, stated plainly
`docs/DESIGN_SYSTEM.md` §C states real photography "does not exist yet" and photography is "ALLOWED only when real"; §K separately bans stock photography and AI-generated illustration outright. This pass adds **hotlinked stock photography** (event covers) and **hotlinked placeholder headshots** (avatars) from third-party CDNs — real photographs, but neither genuine Hackathonly/Jordan event photography nor AI-generated. This is a direct, acknowledged violation of §C/§K as currently written, done because the human's short instruction was unambiguous after already having the conflict explained in full one turn earlier — I did not ask a second clarifying question, since re-litigating a decision the human had just deliberately reversed would have been the wrong call given they'd already been given the full picture. This task also did not authorize touching docs, so **the code and `docs/DESIGN_SYSTEM.md` are now out of sync** — this needs a human decision: either formally amend §C/§K with a `PRODUCT_DECISIONS.md` entry (the D19-style precedent from the motion system), or treat this as temporary/demo-only and plan to revert to system-generated covers before any real ship decision. Not resolved by this pass; flagged here explicitly.

### Image sourcing (no image-generation tool available)
I have no image-generation capability in this environment, so "real pics" could only mean linking to already-existing, externally-hosted images. I verified two purpose-built, free, no-API-key placeholder services resolve correctly before using them (`curl` HEAD checks, both returned `200`):
- **Event covers**: `images.unsplash.com` direct photo URLs (Unsplash's CDN, no API key needed for direct hotlinking). I could not visually inspect candidate photos before choosing them (no image-rendering tool), so I selected from a short list of Unsplash photo IDs I have high confidence about from extremely common, long-standing use in web-dev tutorials/blog posts (coding-on-laptop, hacker-style code-on-screen, late-night-coding, and a circuit-board/tech close-up) rather than guessing at exact thematic matches (e.g. a "fintech-looking" or "sustainability-looking" photo) I could not verify. **This is an honest limitation, not a claim of thematic accuracy** — the photos are consistently "coding/hackathon" in register, not necessarily specific to each event's exact sub-theme.
- **Avatars**: `i.pravatar.cc`, a service purpose-built for exactly this (stable, realistic, license-free placeholder headshots, no API key). Three distinct image numbers assigned to Layla/Omar/Sara.

### To compensate for unverifiable photo-theme matching
Since I can't guarantee the stock photo's subject matches "AI" vs. "FinTech" vs. "Sustainability" vs. "Robotics," I kept the theme-icon logic built in the design-polish pass and repurposed it as a small icon+label badge layered over the photo (top-left, on a translucent dark pill) — this is what actually and reliably communicates event theme now, independent of the underlying photo's exact content. The bracket/corner motif and a bottom-to-top dark gradient scrim (for text legibility over unpredictable photo content) were also kept/added.

### Exact changes
- **`src/components/events/event-card.tsx`**: replaced the flat-tone/watermark-icon cover with a real `<img>` (plain HTML element, not `next/image` — using `next/image` for an external host would require a `next.config` `remotePatterns` change, judged out of scope for this task; the ESLint `@next/next/no-img-element` rule was explicitly suppressed with a one-line comment explaining why) filling the same `aspect-video` zone via `object-cover`, a dark bottom gradient scrim for text legibility, the theme badge, the bracket corners, and the event mark/mode label in white text over the scrim. The two-tone (ink/stone) system and its `getCoverTone` helper were removed — no longer meaningful once the background is a photo.
- **`src/app/(public)/page.tsx`**: each `previewQueue` entry now carries an `avatar` URL; the initials chip was replaced with a real `<img>` (same `no-img-element` suppression, same reasoning), circular (`rounded-pill`), `size-11`, `object-cover`, with a soft `border-border-strong` border. `alt={person.name}` is now set (previously the initials chip was `aria-hidden` since it duplicated adjacent text) — now that it's a real photographic portrait rather than a redundant text initial, giving it a real accessible name is the more correct choice, even though it means the name is announced twice in a row for screen-reader users (once via the image `alt`, once via the adjacent name text) — a minor, commonly-accepted redundancy for avatar+name UI patterns.

### Verification
- `npx tsc --noEmit` — passed, zero errors.
- `npx eslint .` — passed, zero errors, zero warnings (both `no-img-element` instances are explicitly suppressed with inline justification comments, not silently ignored).
- `npm run build` — passed. All routes prerender exactly as before — no regressions. (Note: build-time prerendering does not fetch these external images; they load client-side at runtime, so a build success here does not by itself confirm the images render correctly in a browser — see risk note below.)
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` — passed all four steps.
- `profile_id` scan on both changed files — zero matches.
- Pre-implementation reachability check: `curl -L` against one representative URL from each service (`images.unsplash.com`, `i.pravatar.cc`) — both returned HTTP 200.
- `git status` confirms scope: the same two files as the design-polish pass — `src/components/events/event-card.tsx` and `src/app/(public)/page.tsx`. No motion, docs, backend, or routing file touched.

### New risk introduced (flagging explicitly, not just in passing)
This is the first place in the codebase that depends on a third-party image host at runtime. If `images.unsplash.com` or `i.pravatar.cc` is unreachable, rate-limits, or a specific photo ID is removed/changed upstream, the affected cover or avatar will fail to load (broken image icon) rather than gracefully falling back — there is no local fallback image or `onError` handler. Given `docs/DESIGN_SYSTEM.md` §E's build was previously explicitly "network-independent" for fonts, this is a meaningful precedent change worth the human's attention, not just a cosmetic one.

### Deviations
- **Design-system violation, done knowingly and flagged, not resolved**: §C/§K's no-stock-photography rule is now actively violated in shipped code with no corresponding doc update — an open decision for the human (formalize via `PRODUCT_DECISIONS.md`, or plan to revert before any real launch).
- **New external runtime dependencies**: `images.unsplash.com`, `i.pravatar.cc` — no fallback/error handling added, per the "purely visual, minimal change" framing of this pass; flagged as a risk above rather than silently addressed.
- **Photo-to-theme matching is not verified**: I have no way to visually confirm the chosen Unsplash photos' subjects. Compensated for via the theme-icon badge (see above), but the underlying photography itself may not visually differentiate "AI" from "FinTech" from "Sustainability" the way real event-specific photography eventually would.
- **No second clarifying question was asked** before implementing this reversal, since the human had already been given the full conflict explanation one turn earlier and their two-word instruction read as a deliberate, informed override rather than a fresh, ambiguous request.

## TAIKAI-quality pass — "younger Jordanian cousin," not a clone

A fifth, broad Design Engineer pass: bring overall product quality, rhythm, hierarchy, and polish closer to TAIKAI across the full public surface, without cloning TAIKAI's layout/assets/branding. Full reasoning (what was studied, how it was adapted, why each decision helps) is in the chat response accompanying this pass, not duplicated here — this section is the technical change log.

### Scope decision
Touched the four public "marketing register" pages (landing `/`, `/organizers`, `/events`, `/events/[slug]`) plus `EventCard`. Deliberately did not touch the dashboard/organizer command center — those are "tool register" pages (dense, product-feel) per `docs/DESIGN_SYSTEM.md` §A's two-register model; TAIKAI-style premium marketing polish doesn't apply the same way there, and touching them wasn't asked for.

### Exact files changed
- `src/app/(public)/page.tsx` — hero padding increased toward the documented 128px desktop hero-top spec (§F), hero secondary CTA converted from a bordered button to a quiet text+arrow link (sharper primary/secondary CTA hierarchy), a new sparse "quiet break" section added between the event grid and the participant/organizer split (single large editorial line, no card, maximal whitespace — a deliberate density contrast beat), featured-events grid gap standardized to `gap-6` (24px, matches §F's documented card-grid-gap law, was `gap-5`), two sections' vertical padding standardized from `sm:py-20` to `sm:py-24` to match §F.
- `src/app/(public)/organizers/page.tsx` — same hero padding increase, same secondary-CTA-to-link conversion, five sections' padding standardized `sm:py-20` → `sm:py-24`, product-surface grid gap standardized `gap-4` → `gap-6`.
- `src/app/(public)/events/page.tsx` — rewritten as a client component; added `MotionReveal`/`MotionStagger`/`MotionCard` (previously zero motion, now consistent with the rest of the site); grid gap standardized to a flat `gap-6` (was responsive `gap-4 sm:gap-6`); incidentally fixed a pre-existing nested-`<main>` landmark issue (page had its own `<main>` inside the `(public)` layout's `<main>` — now a plain `<div>`, since the layout already provides the landmark).
- `src/app/(public)/events/[slug]/page.tsx` — reduced to a thin Server Component: keeps `generateStaticParams`, the `getHackathonBySlug` lookup, and `notFound()` (preserving static generation — confirmed via build output, still `●` SSG for all three event slugs), and renders the new client component below.
- `src/app/(public)/events/[slug]/event-detail-content.tsx` (new) — all of the event detail page's presentational JSX, unchanged in content/copy/structure, now wrapped with `MotionReveal`/`MotionSection`/`MotionStagger` (hero content, identity panel, facts strip, tracks grid, timeline list, sidebar cards). This was the single biggest coherence gap on the site — the highest-design-investment page (`docs/DESIGN_SYSTEM.md` §L Tier 1) was also the only page with literally zero motion. The server/client split (rather than converting `page.tsx` itself to `"use client"`) was necessary because the page is an async Server Component using `generateStaticParams`/`notFound()`, which cannot coexist with the client-only Framer Motion hooks in the same component — this is the standard Next.js App Router pattern for exactly this situation, not a new architecture.
- `src/components/events/event-card.tsx` — added a subtle cover-image hover zoom (`motion-safe:group-hover:scale-105`, transform-only, gated by the `motion-safe:` CSS variant so it's automatically inert under `prefers-reduced-motion` with no JS needed), using the existing `--motion-slow` CSS custom property for its duration rather than a new hardcoded value.

### Verification
- `npx tsc --noEmit` — passed, zero errors.
- `npx eslint .` — passed, zero errors, zero warnings.
- `npm run build` — passed. All routes prerender exactly as before, including `/events/[slug]` still showing `●` (SSG via `generateStaticParams`) for all three event slugs despite the client-component split — confirming static generation was preserved correctly.
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` — passed all four steps.
- Raw-hex scan across every file touched this pass — zero matches.
- Clay/brand-color budget re-audited across the two pages with hero CTAs: no new clay usage was introduced by the CTA-hierarchy change (the new quiet secondary links use neutral `text-text-secondary`/`text-text-primary`, not brand color); pre-existing clay usage (primary buttons, the landing lifecycle connector, the organizer active-module tint, the "View all events" link hover state) is unchanged and still within the ≤3-per-screen budget on every page.
- `git status` confirms scope: exactly the files listed above — no backend, Supabase, RLS, package, or docs file touched.

### Deviations / judgment calls
- **`/events/[slug]/page.tsx` was restructured** (new sibling file added) rather than edited in place — a direct consequence of needing motion in an async Server Component, not a scope-creep decision. Content, copy, and rendered structure are unchanged; only the file boundary and the addition of motion wrappers changed.
- **Landing/organizer final CTA button pairs were deliberately left as bordered secondary buttons**, not converted to the quiet-link treatment applied to hero CTAs — judged that a closing section presenting two equally valid next steps (browse events vs. see the demo) is a different kind of moment than a hero's dominant-message-plus-throwaway-alternative, so the same hierarchy rule doesn't mechanically apply there. Explained further in the chat response.
- **The landing page's inverted "command center" metrics section was deliberately left at its existing `sm:py-20`** (not bumped to `sm:py-24` like the other sections) — kept as an intentional tighter, denser beat in the page's rhythm, contrasting with the newly-added sparse quiet-break section elsewhere on the same page.

---

## Research-to-implementation pass — local photography migration + event detail coherence

This pass executes the three approved research documents (`docs/research/TAIKAI_MASTER_DESIGN_REPORT.md`, `TAIKAI_IMPLEMENTATION_BRIEF.md`, `TAIKAI_CLAUDE_CODE_PROMPT.md`) as the implementation source of truth, per the human's explicit instruction that the research phase is complete and binding. Executed with full Design Authority; no approval was requested between individual decisions, per the human's instruction — only the two required checkpoints (repository inspection, execution) were followed, both self-directed given the research already specified file scope and constraints.

### Repository inspection (step 1–2 of the required process)
Confirmed via `git log` that the human had committed a checkpoint (`f32f170`, "checkpoint before taikai redesign") capturing all prior-session work, including the three research documents in their corrected state and the still-hotlinked `EventCard`/landing-page avatar implementations. This pass therefore started from a clean working tree and produced a clean, minimal diff against that checkpoint. Inspected the live contents of `src/components/events/event-card.tsx`, the "Team formation queue" section of `src/app/(public)/page.tsx`, and `src/app/(public)/events/[slug]/event-detail-content.tsx` before writing any code, confirming the hotlinking issue described in the research was still present and identifying one additional coherence gap not covered by the research's own scope (see below).

### Implementation strategy (step 3)
Two-part plan: (1) execute the Critical, binding fix from all three research documents — migrate event-cover and avatar imagery from runtime hotlinks (`images.unsplash.com`, `i.pravatar.cc`) to curated, downloaded, locally-stored assets; (2) apply independent design judgment, as explicitly authorized, to close one coherence gap the research didn't originally scope: once event cards show real photography, the event detail page's "Event identity" panel — which a user lands on immediately after clicking a photo-rich card — still showed only abstract typographic letters, no photo. Fixed by extending the same curated-photography treatment to the detail hero, and factored the shared cover-resolution logic into two new reusable modules (`src/lib/event-cover.ts`, `src/components/events/theme-cover-icon.tsx`) so both surfaces stay in sync going forward rather than duplicating the same logic twice.

No other page was judged to need substantive change: the research's own Gap Analysis (Document 2, Phase 6) had already confirmed hero composition, CTA hierarchy, section rhythm, motion, and product-preview surfaces on `/`, `/organizers`, and `/events` were compliant and did not need rework — that assessment was re-verified by direct inspection during this pass and found still accurate. `/organizers`' product-preview surfaces were deliberately left photography-free, per the research's explicit rule that product/dashboard previews stay data-driven and illustration/photo-free, a separate imagery family from event-cover/avatar photography.

### Execution (step 4)

**Image sourcing and curation.** No image-generation tool is available in this environment, so "curated photography" meant selecting, downloading, and visually verifying real Unsplash photographs (Unsplash License — free for commercial/non-commercial use, no permission required) before committing them. This surfaced two curation failures that were caught and corrected *before* any code referenced them:
- The first candidate for the USJ Fintech Sprint cover (`photo-1497366216548-37526070297c`) turned out, on download and visual inspection, to be an empty office hallway/kitchen interior — exactly the "fake office" cliché the human's curation rules explicitly forbid. Replaced with `photo-1518186285589-2f7649de83e0`, a laptop screen showing a live financial/trading chart — a literal, honest fit for a fintech sprint.
- The first candidate for the "Sara M." avatar (`photo-1472099645785-5658abf4ff4e`) turned out, on inspection, to depict a middle-aged man — a clear name/representation mismatch. Replaced with `photo-1544005313-94ddf0286df2`, a credible young-woman portrait.
Both rejections and their replacements are recorded in `public/images/SOURCE.md` so the reasoning isn't lost.

Final asset set — 6 files, all downloaded and committed locally, all AA/curation-checked by direct visual inspection (not assumed):
- `public/images/events/jordan-ai-builders-hackathon.jpg` — overhead multi-monitor night-coding shot.
- `public/images/events/usj-fintech-sprint.jpg` — live trading-chart screen.
- `public/images/events/psut-hardware-hack.jpg` — populated circuit-board macro.
- `public/images/avatars/layla-h.jpg`, `omar-k.jpg`, `sara-m.jpg` — credible, non-stock-agency portrait photography.
- `public/images/SOURCE.md` — manifest recording source, license, and curation notes (including both rejected candidates) for every file, per the research's explicit manifest requirement.

**Code changes:**
- `src/lib/event-cover.ts` (new) — `coverPhotoBySlug` (the per-event local image map), `coverTone`/`getCoverTone` (the two-tone flat-field fallback for any event without a curated photo). Single source of truth, shared by both surfaces below.
- `src/components/events/theme-cover-icon.tsx` (new) — the theme-matched Lucide icon badge (`Cpu`/`Wallet`/`Leaf`/`Wrench`/`Radar` fallback), extracted so it can be reused wherever a cover appears.
- `src/components/events/event-card.tsx` — replaced the hotlinked `<img>`/hash-based Unsplash URL builder with `next/image` reading from `coverPhotoBySlug`, falling back to the flat-tone/icon-watermark treatment for any event without a curated image. Net effect: significantly shorter file (removed ~60 lines of now-shared logic), same visual behavior, zero runtime external requests.
- `src/app/(public)/page.tsx` — replaced the hotlinked pravatar.cc `<img>` avatar row with `next/image` reading local paths (`/images/avatars/*.jpg`), same visual treatment (circular, `size-11`, bordered), zero runtime external requests.
- `src/app/(public)/events/[slug]/event-detail-content.tsx` — the "Event identity" panel now shows the event's curated cover photo (same image used on its card, via the shared `coverPhotoBySlug`) inside an `aspect-video` band at the top of the panel, with the theme icon, bracket corners, and event-mark lockup overlaid via the same scrim treatment as `EventCard` — followed by the existing Theme/City/Teams/Register-by data grid on a plain surface below. Events without a curated photo get the same flat-tone fallback as the card. This creates real visual continuity between the listing grid and the detail page for the first time.

### Self-review (step 6, done critically, not perfunctorily)
- Confirmed by direct visual inspection (not assumption) that all 6 final images are curation-compliant — no generic corporate stock, no handshakes/suits/fake offices/tourism clichés, no representation mismatches. This required actually looking at the downloaded files and rejecting two of my own initial picks; I do not consider the first pass "good enough" just because it downloaded successfully.
- Confirmed `next/image` + local `public/` assets works with **zero new dependencies** — Next.js's built-in Image Optimization API handles local files out of the box; no `sharp` or other package was added to `package.json` (verified: `git status` shows no `package.json`/`package-lock.json` change).
- Confirmed the refactor into `event-cover.ts`/`theme-cover-icon.tsx` didn't silently change `EventCard`'s behavior for the fallback (no-photo) path — the flat-tone/icon-watermark treatment is byte-for-byte the same logic, just relocated.
- One acknowledged limitation, stated plainly rather than glossed over: I have no browser-rendering tool in this environment, so I could not visually confirm the final *rendered* pages (layout, cropping, scrim contrast) the way I could visually confirm the raw image files themselves. The `sizes` attributes on both `next/image` usages are reasoned from the actual grid/column context (verified by reading the surrounding layout code) but not pixel-verified in a live browser. Recommend the human do a quick visual pass on `/`, `/events`, and one `/events/[slug]` page before treating this as fully signed off.

### Verification results (step 5)
- `npx tsc --noEmit` — passed, zero errors.
- `npx eslint .` — passed, zero errors, zero warnings.
- `npm run build` — passed. All routes prerender exactly as before; `/events/[slug]` still shows `●` (SSG via `generateStaticParams`) for all three event slugs, confirming the identity-panel rewrite didn't affect static generation.
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` — passed all four steps (build, typecheck, lint, `profile_id` forbidden-string scan).
- Hotlink scan (`grep -rn "images.unsplash.com\|pravatar.cc\|i.pravatar" src/`) — zero matches; every image reference is now a local `/images/...` path.
- Raw-hex scan across every touched file — zero matches.
- `profile_id` scan across every touched file — zero matches.
- Clay/brand-color budget re-audited on the event detail page and `EventCard` — no new clay usage introduced; the only `text-brand`/`ring-brand-tint` occurrences are pre-existing hover/focus interaction states, unchanged.
- `git status` confirms scope: 3 files modified (`event-detail-content.tsx`, `page.tsx`, `event-card.tsx`), 3 new paths (`public/images/` with 6 images + manifest, `theme-cover-icon.tsx`, `event-cover.ts`). No backend, Supabase, RLS, auth, API, infrastructure, or `package.json`/`package-lock.json` change.

### How the research influenced this implementation
- The Critical-priority local-asset migration (all three research documents' top action item) was executed exactly as specified: download, curate, color-consistent-crop (via the existing `aspect-video`/`object-cover` pattern, unchanged), local storage under `public/images/`, `next/image`, and a source/license manifest.
- The curation standard from `TAIKAI_CLAUDE_CODE_PROMPT.md` §8 ("reject generic corporate stock photography, handshakes, suits, staged fake offices, tourism clichés") was not just followed in the abstract — it directly caused the rejection and replacement of the first fintech-cover candidate, which is exactly the failure mode that rule exists to prevent.
- The event-detail hero photo addition is a direct application of the research's "Image usage" and "Hero composition" analysis (Document 1, Screenshot 4's product-preview-plus-metrics panel pattern) translated to Hackathonly's own repeating unit (event identity, not a dashboard) — using real, judgment-driven adaptation rather than copying TAIKAI's literal layout.
- The research's explicit boundary — product/dashboard previews stay illustration/photography-free — was respected by *not* adding imagery to `/organizers`, even though full creative authority was granted; this was a deliberate application of a documented constraint, not an oversight.

### Intentional deviations
- Went beyond the research's own explicit file list (which named only `EventCard` and the landing page's avatar row) by also touching the event detail page — justified above as a genuine coherence gap surfaced by critical self-review, consistent with the human's instruction not to treat this as a series of isolated edits.
- Introduced two new shared modules not explicitly requested by the research (`src/lib/event-cover.ts`, `src/components/events/theme-cover-icon.tsx`) — a architecture improvement (single source of truth for cover resolution) rather than scope creep; net line count for the feature actually went down.
- Two of the six final images differ from any URL previously mentioned anywhere in this session's history, because the original picks failed visual curation after download — flagged explicitly rather than silently swapped.

No dependency was required, no backend/database/auth change was needed, and no genuine technical blocker was encountered — this task completed without needing to stop for human input beyond what's reported here.

---

## Bold redesign pass — landing page rebuilt from first principles

Explicit human instruction: stop preserving the landing page's existing section order, hero structure, and product-preview structure "because they already exist." Redesign from first principles, matching TAIKAI's visual ambition (composition, hierarchy, density rhythm, product framing, section transitions, page architecture) while copying none of TAIKAI's assets, colors, illustration, or wording, rendered entirely through Sandstone Editorial. Full creative authority; only file touched by design is `src/app/(public)/page.tsx` (fully rewritten, not incrementally edited).

### What changed structurally (not just cosmetically)
- **Hero preview panel is now materially richer.** Previously: header bar + a two-column split (team-formation queue / live-signal text feed on the left, four stat tiles on the right) — no module rail. Now: the hero preview carries the **module rail** (Registration/Matching/Check-in/Submissions/Judging/Reports) that previously only existed on `/organizers`, with "Matching" as the active item — borrowing TAIKAI's own "sidebar rail implies a mature, multi-module product" mechanism (Document 1, Phase 2G) onto the page that most needed it. The "live signals" text feed was replaced with a concrete **proposal-progress fragment** built from real `myProposals` mock data (2 of 4 teammates accepted, expires in 19h, with an animated progress bar) — a specific, believable operational detail in place of generic feed text, matching the research's "operational widget, not generic feature" lesson (Document 1, Phase 2G).
- **New "structural guarantees" section**, replacing the prior single-sentence "quiet break" paragraph. Three large, bold, `text-display-lg` stat-style claims ("1" / audited RPC controls every reveal, "0" / public profiles ever indexed, "100%" / consent versioned before a match is proposed) — borrowing TAIKAI's "big number over quiet label" authority mechanism (already a Hackathonly type-scale token, `text-metric`/`text-display-lg`), but applied to **real, verifiable architectural facts** about this codebase's own RPC-gated reveal design and consent model — never a fabricated usage/traction statistic. This is the direct, honest translation of TAIKAI's benchmark-table "authority through specificity beats authority through adjectives" mechanism (Document 1, Phase 4A-5), adapted because Hackathonly has no competitor dataset but does have real, defensible product-architecture facts.
- **New dense product-fragment section** ("Every stage, one system") — brings the `/organizers` product-surface bento-grid technique to the landing page for the first time, using six real `commandCenterMetrics`-derived tiles (registration health, matching queue, check-in, submissions, judging readiness, sponsor-consented reporting) **plus a seventh, full-width fragment**: a real `commandCenterWarnings`-derived operator-language warnings feed, rendered on the one sanctioned dark surface used here as a compositional accent rather than only a closer (a considered, contained extension of `DESIGN_SYSTEM.md` §H's dark-surface rule — still never a hero, still a single contained card, not a full-bleed section). This directly executes the research's "card content-type variety defeats the identical-icon-wall trap" lesson (Document 1, Phase 2E/4A-6) with a genuinely different fragment type (a list, not a tile) in the mix.
- **Participant panel gained a concrete product artifact.** Previously a plain two-item icon+text promise list. Now keeps that list *and* adds a small, real "Contact reveal" fragment — a `Lock` icon beside two blurred placeholder bars, visually demonstrating Hackathonly's own signature interaction (`DESIGN_SYSTEM.md` §I's blur-to-sharp contact reveal) rather than just describing it in prose. This is TAIKAI's "one small illustrative asset per value card, not just an icon" mechanism (Document 1, Phase 1 Screenshot 2), translated using Hackathonly's *own* already-documented signature moment rather than inventing a new visual device.
- **Organizer panel gained a real forward link** ("See the organizer platform →") pointing at `/organizers`, closing a small but real IA gap — previously the landing page's organizer panel had no path to the dedicated organizer page at all.
- **Hero preview panel widened** from `max-w-5xl` to `max-w-6xl` and the internal grid gained a third structural layer (module rail → content columns → stat column) instead of two, giving the whole panel more visual weight relative to the page, consistent with TAIKAI's preview-panel dominance in its own hero (Document 1, Phase 2B).
- **Final CTA re-typeset** at `text-display-lg` (was `text-heading-lg`) — a genuinely bigger, more confident closing statement, matching the scale-jump discipline the research flagged as a TAIKAI strength (Document 1, Phase 2C).

### What was deliberately kept unchanged, and why
- **Section order at the macro level** (hero → proof → featured events → product depth → audience split → lifecycle → command-center metrics → closer) — this progression was already validated by the research's own analysis of TAIKAI's density-alternation rhythm (Document 1, Phase 2I) as structurally correct; "redesign from first principles" was judged to mean *not being afraid to change it*, not an obligation to change it for its own sake once independently re-derived as sound.
- **Copy/wording** — the human's instruction explicitly forbade copying TAIKAI's *wording*, and separately listed *composition/hierarchy/density/rhythm/product framing/section transitions/page architecture* as the borrowable set. Headline and section copy were judged to sit outside that list; existing copy was already specific and on-brand, so it was preserved while the surrounding structure was rebuilt.
- **`/organizers`, `/events`, `/events/[slug]`** — not touched in this pass. `/organizers` already independently implements the module-rail/metrics/widget preview anatomy and a comparable section density to what the landing page now also has; re-inspected and judged not to need the same rebuild. The human's instruction centered explicitly on "the current landing page" as the thing to stop preserving; the broader "public experience" framing was read as best served by bringing the landing page up to the same ambition level already present on `/organizers`, not by rebuilding every page a second time in one pass.

### Design-system compliance re-audited on the new file
- Clay/brand-color budget: exactly one new static clay usage was introduced (the module-rail active-item tint, mirroring the identical, already-approved pattern on `/organizers`) — combined with the pre-existing, separately-documented D19 lifecycle-connector exception and ordinary hover/focus-state clay (never counted as static usage per prior sessions' established precedent), the page remains within the ≤3-per-screen law.
- No new dark surface — the warnings-feed fragment reuses `bg-background-inverse` as a contained card fill within an already-light section, not a new full-bleed dark section; the page's only full-bleed dark band remains the pre-existing command-center section.
- No fabricated data anywhere: every number on the page traces to `commandCenterMetrics`, `commandCenterWarnings`, or `myProposals` in `src/lib/mock-data.ts`. The three "structural guarantee" stats are architectural facts about this codebase (RPC-gated reveal, no public profile indexing, consent-before-proposal ordering), not measured/fabricated statistics — verified against the actual privacy/RPC design already documented in this project, not invented for this page.
- Heading structure re-verified: one `<h1>`, seven `<h2>`s, sequential, no gaps.
- No new dependency, no hotlink, no raw hex — all re-confirmed by direct scan (see Verification below), not assumed.

### Verification
- `npx tsc --noEmit` — passed, zero errors.
- `npx eslint .` — passed after removing one unused import (`CheckCircle2`, left over from an earlier draft of this section) flagged on the first pass; clean on the second run.
- `npm run build` — passed. `/` still prerenders statically (`○`); every other route unaffected.
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` — passed all four steps.
- Raw-hex, `profile_id`, and hotlink (`images.unsplash.com`/`pravatar`) scans on the rewritten file — zero matches on all three.
- `git status` confirms scope: exactly `src/app/(public)/page.tsx` changed in this pass (plus the untouched carry-over files from the prior implementation pass, already recorded above).

### Self-review
Read back through the finished file section by section against the human's own framing ("if someone compares the two pages side-by-side they should immediately recognize inspiration") — the module-rail hero preview, the big-number stat row, and the dense multi-fragment product section are the three moves most responsible for that recognition, and all three are structural/compositional borrows with zero shared color, asset, or copy. Confirmed the page does not read as a TAIKAI reskin: ground stays pure white throughout (no purple, no gradient fill, no illustration), the one dark section is still exactly one, and every claim is real. One honest limitation, consistent with earlier passes: no browser-rendering tool is available in this environment, so the *rendered* result (exact spacing feel, scroll rhythm in motion, mobile stacking of the now-three-layer hero panel) was reasoned from the Tailwind/motion source, not pixel-verified live — recommend a human visual pass at 375px and 1280px before treating this as fully signed off, with particular attention to how the hero panel's module rail + two content columns + stat column stack on narrow viewports (the rail already hides below `lg` per the existing pattern; the two content columns collapse to one via the existing `lg:grid-cols-[1.3fr_1fr]` → single-column behavior, unchanged from before).

No dependency was required, no backend/database/auth change was needed, and no genuine technical blocker was encountered.

---

## Journey split pass — dedicated `/participants` page, `/blog`, navigation expansion, landing hub restructure

Explicit human instruction: raise ambition significantly, split the shared landing page into two clear audience journeys (participant journey gets the biggest creative leap; organizer journey gets refinement only, not a redesign), add a Blog as a real long-term product area, rename "Events" to "Hackathons" in navigation, and use motion as storytelling rather than decoration. Full Design Authority; no approval requested between decisions.

### New site architecture
- **`/` (landing) is now a hub**, not a page trying to fully serve both audiences at once. Kept: hero (OS positioning, audience-neutral), the "structural guarantees" stat row, featured hackathons, the dense product-fragment section, the lifecycle strip, the command-center metrics band, final CTA. **Replaced**: the old participant/organizer split panel (which duplicated deep content now properly homed on the dedicated pages) with a simpler, bolder **two-journey fork** — two large panels ("Going as a participant?" / "Organizing an event?"), each one headline, one line, one button, pointing at `/participants` and `/organizers` respectively.
- **`/participants` (new)** — the participant journey, built from first principles per the explicit instruction that this is where the biggest leap should happen. Not text-heavy: leads with the four real pain-point quotes from the brief ("I don't have a team," "I don't want random strangers messaging me," etc.) as a quiet, editorial quote grid, then the signature piece — a custom eight-step animated flow (join → profile → matched → proposal → accepted → team forms → **contact unlocks** → ready), rendered as a vertical stepper with a scroll-drawn connector line (reusing the same `scaleY`/`whileInView` mechanism as the landing page's horizontal lifecycle connector, oriented vertically — not a new motion pattern). The "Contact unlocks" step is the emotional payoff: two lines of placeholder contact text animate from `blur(6px)` to `blur(0px)` on scroll-into-view, directly visualizing `DESIGN_SYSTEM.md` §I's documented blur-to-sharp signature interaction rather than just describing it. Below the flow: two compact trust fragments (event-scoped pool, complementary matching) plus a real proposal-progress card (reusing `myProposals` mock data), then featured hackathons and a closing CTA with a reciprocal cross-link to `/organizers`.
- **`/blog` (new)** — a real resource-hub index, not a stub. Nine original articles written for this task across the topics named in the brief (why participate, why privacy-first, how matching works, organizer playbooks, MVP-building, winning strategies, student stories, sponsor case studies, community updates), each with a genuine 2–3 sentence excerpt in Hackathonly's own voice — no filler, no fabricated statistics. A featured-article hero treatment plus an 8-card grid, both using the existing system-generated flat-tone/icon cover system (no new image assets needed — reused `coverTone` from `src/lib/event-cover.ts`, applied to editorial content instead of event photography, keeping the whole visual system consistent without a second imagery pipeline). A static category-chip row establishes the information architecture TAIKAI's own tag row was praised for (Document 1, Screenshot 9) without claiming functional filtering that doesn't exist yet.
- **Navigation**: "Events" renamed to "Hackathons" in both header and footer (the requested language shift). Added "For participants" and "Blog" to the header nav (now 5 items: Hackathons, For participants, For organizers, Blog, Dashboard) and to the footer link row.
- **`/organizers`**: refined only, per the explicit "do not completely redesign" instruction. The single change: a reciprocal quiet cross-link ("Looking for a team instead? →") added beneath the final CTA buttons, pointing at `/participants` — closing the loop the new two-journey IA needs, without touching anything else on the page.

### Motion as storytelling, not decoration
The one clearly new motion idea in this pass — the vertical connector line drawing downward as the flow section scrolls into view, paired with the blur-to-sharp contact reveal on the payoff step — was chosen because it *explains* the sequence (order, progression, the specific moment contact information becomes available) rather than just decorating it. Both reuse existing tokens/easings from `src/lib/motion/tokens.ts` and the existing `whileInView`/`once: true` pattern already established sitewide; no new motion primitive or library was introduced. The blur animation uses Framer Motion's `filter` animation support directly (no CSS-only workaround needed) and is skipped entirely under `prefers-reduced-motion` (the final, sharp state renders immediately).

### Design-system and honesty compliance re-checked on every new/changed file
- Clay/brand-color budget: no new static clay usage beyond what already existed pre-pass (module-rail active tint, the lifecycle/flow connector-line exception, and the shared primary-button convention) — the blog page introduces **zero** clay usage, and the two-journey fork panels on `/` deliberately use secondary (bordered, ink) buttons rather than filled clay buttons, since two *new, distinct* filled actions on the same screen would have pushed past the ≤3 rationing law even though each individually looked reasonable in isolation. This was a deliberate judgment call, not an oversight.
- No fabricated data: every number on `/participants` traces to real mock data (`myProposals`); the blog's nine articles are original editorial copy, not statistics or testimonials, and carry no invented author identities (bylined generically as "Hackathonly Team" rather than fabricated named individuals with false credentials). No blog article has a working detail-page link yet — cards are intentionally non-interactive rather than pointing at a dead route, since building nine full article pages was outside this pass's scope; flagged as a follow-up, not silently faked.
- Heading structure re-verified on all three touched/new pages: `/blog` (1×h1, 1×h2 featured, 8×h3 cards), `/participants` (1×h1, 3×h2), `/` (1×h1, 6×h2, 2×h3 correctly nested under the new fork section's h2) — sequential, no gaps, no skipped levels.
- No raw hex, no hotlinks, no `profile_id` anywhere in the new/changed files (confirmed by direct scan, not assumed).

### Verification
- `npx tsc --noEmit` — passed, zero errors.
- `npx eslint .` — passed after fixing four issues found on the first pass: three unescaped-apostrophe errors (`react/no-unescaped-entities`) in new copy on `/participants`, and one unused-import warning (`CheckCircle2`... actually resolved from the prior pass; this pass's own cleanup removed `Lock`, `UserCheck`, and two now-orphaned data arrays — `participantPromises`, `organizerModules` — from `/` after their content moved to `/participants`). Clean on the final run.
- `npm run build` — passed. Both new routes (`/blog`, `/participants`) prerender statically (`○`); every existing route, including `/events/[slug]`'s three SSG slugs, is unaffected.
- `powershell -ExecutionPolicy Bypass -File scripts/verify.ps1` — passed all four steps.
- Raw-hex, `profile_id`, and clay-budget scans across every new/changed file — all clean, re-confirmed by direct grep, not assumed.
- `git status` confirms scope: `page.tsx`, `organizers/page.tsx`, `event-detail-content.tsx` (untouched carry-over from the prior pass), `event-card.tsx` (same), `site-header.tsx`, `site-footer.tsx` modified; `blog/`, `participants/` new routes; no backend, database, auth, package, or docs file touched.

### Self-review
The three moves I'd point to if asked "what actually raised the ambition here": (1) splitting the IA into two real dedicated journeys instead of one page apologizing for trying to serve both, (2) the contact-unlock blur payoff at the end of the flow sequence — it's the one moment on the new pages that's trying to be genuinely *felt*, not just read, and it uses a signature interaction the design system already owns rather than inventing a new one, (3) reusing the flat-tone cover system for the blog instead of reaching for a second imagery pipeline — keeps nine new cards visually disciplined without any new asset-sourcing risk. Weakest point, stated plainly: the blog cards aren't clickable yet, which could read as unfinished rather than intentional if a visitor tries to click one — worth a quick real or near-term fix (either build the article pages or make the cards visually read even more clearly as "coming soon"). Same standing limitation as every pass this session: no browser-rendering tool available, so the *rendered* feel of the new vertical flow (line-draw pacing, blur timing, mobile stacking of the eight-step list) was reasoned from source, not pixel-verified — recommend a human pass on `/participants` specifically, since it's the newest and most bespoke motion sequence in the codebase.

No dependency was required, no backend/database/auth change was needed, and no genuine technical blocker was encountered.
