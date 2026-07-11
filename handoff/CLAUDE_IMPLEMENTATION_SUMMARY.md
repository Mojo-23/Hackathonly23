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
