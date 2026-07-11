# Hackathonly Jordan — Design System (Sandstone Editorial)

> **This document is the source of truth for all UI/UX implementation.** Every UI task MUST comply with it. Deviations from its closed sets (colors, radii, shadows, type scale, spacing scale) are scope violations, not creative choices. Where this document conflicts with older guidance in `COMPONENTS.md` or anywhere else, this document wins (recorded as D18 in `PRODUCT_DECISIONS.md`).
>
> Normative language: **MUST / MUST NOT** = hard rule, review-blocking. **SHOULD / SHOULD NOT** = default expectation; deviation requires a stated reason in the handoff. **ALLOWED / FORBIDDEN** = explicit whitelist/blacklist.

---

## A. Design North Star

The approved direction is **Sandstone Editorial**:

- **Pure white background** (`#FFFFFF`) — everywhere, both registers. White is the brand's confidence.
- **Ink-black typography** (`#191714`) doing the heavy lifting of identity.
- **One Petra-clay accent** (`#A03D21`) under a strict rationing law (§D).
- **Warm stone neutrals** for borders, secondary text, and sunken surfaces — warmth lives in the neutrals, never in the background.
- **Editorial hierarchy**: brave display type on public pages, quiet dense precision on tool pages — two registers, one system.
- **Product-grade calmness**: the hackathon supplies the adrenaline; the interface MUST NOT add any.
- **Jordan-native but globally credible**: Jordan-ness lives in the palette's warmth, the pragmatism of flows, and (later) real photography — never in flags, Petra silhouettes, or tourism kitsch.
- **FORBIDDEN identity territory**: purple/violet anything, web3/crypto aesthetics or vocabulary, generic SaaS template patterns, dark-mode-first design.

Two registers, defined:
1. **Marketing/public register** (landing, event pages, reports): generous, editorial, display type, low density.
2. **Product/tool register** (dashboards, forms, tables, check-in): efficient, ink-and-stone, numbers-forward, medium-high density that still breathes.

Both registers MUST feel like the same company. The seam between them is intentional and visible (density and type change), but tokens, radii, borders, and color law are identical across both.

## B. Brand Personality

Seven attributes, each with its enforcement rule:

1. **Precision without stiffness.** Everything aligns to the grid and the token scales; copy stays human. FORBIDDEN: bureaucratic UI text ("submission has been recorded successfully"), legalese outside the legal pages.
2. **Serious about your data, excited about your weekend.** Privacy surfaces (consent, reveal, talent) MUST look deliberate and protective. Event surfaces MAY carry energy through scale and count-ups — never through decoration.
3. **Jordan-native, globally fluent.** Local substance (universities, WhatsApp-aware flows, Arabic-ready layout: logical CSS properties only, no hardcoded left/right). International craft. FORBIDDEN: flag colors used literally, Petra/desert clipart, Arabic used decoratively.
4. **Operationally calm.** Event day is chaos; this tool MUST be the calmest thing in the room. No blinking, no pulsing alerts, no red walls. Warnings are written in operator language ("6 proposals expire within 24h — nudge participants"), never system language.
5. **Earned reveal.** Locked/private states MUST look intentional and protective — never broken, never nagging, never like a paywall. The locked state gets the same design care as the unlocked state.
6. **Quantified, not boastful.** Credibility comes from counts, timestamps, distributions, and other people's names (university/sponsor logos). FORBIDDEN in product and marketing copy: "powerful," "seamless," "revolutionary," "unleash," "supercharge," and their relatives.
7. **Built by people who ship.** Every interactive element ships all six interaction states (§G); every list ships an empty state; every async surface ships a skeleton. A component missing a state is unfinished, not minimal.

**Audience feelings (review-checkable):**
- Participants MUST feel **respected, protected, and taken seriously** — a profile reads as a credential, not a form dump; contact privacy is visibly enforced.
- Organizers MUST feel **in control, elevated, and safe** — nothing surprises them on event day; their event page looks better than they could make themselves.
- Sponsors/partners MUST feel the platform is **measurable, professional, and board-safe** — they experience the brand through the event page and the report; both MUST read as institutional-grade artifacts.

**Never-feels (all FORBIDDEN):** never crypto; never government-portal; never student-project; never a Devpost clone; never gamified (no XP, streaks, levels, or confetti outside the two signature moments in §I); never desperate for engagement (no feeds, no notification begging); never generic-startup-optimistic. No rockets, no blobs, no illustrated waving humans, no hype language.

## C. Visual Direction

- **Sandstone Editorial is the approved direction** (D18). Alternatives ("Ink & Olive," "Signal Ink") were evaluated and rejected; do not resurrect them piecemeal.
- **White is the primary background and represents brand confidence.** Pages MUST NOT alternate tinted section backgrounds down the scroll (white/gray zebra-striping is template DNA). The sunken tone (`#F7F6F3`) is for functional zones only (table headers, input wells, code blocks).
- **Clay is an action color, not decoration.** It marks what the user should *do* (primary action, active nav) — never what *is* (status, categories, moods).
- **The QR finder-bracket motif is the brand's ownable graphic device.** Corner brackets (derived from QR finder patterns) MAY be used as crop-mark framing on system covers, report headers, and empty states. It is the only decorative graphic ALLOWED, and it MUST be used sparingly (one instance per surface).
- **The blur-to-sharp contact reveal is the brand's ownable interaction device** (§I). Locked contact data renders as genuinely obscured placeholders with a lock glyph; the unlock is the product's promise made physical.
- **System-generated event covers are MANDATORY.** Every event gets a designed typographic cover (title lockup over an ink/clay/stone geometric field with the bracket motif), generated by the system. Organizer-uploaded images are ALLOWED but MUST be cropped and treated behind a consistent visual treatment, and the zero-upload default MUST look intentional. The quality floor of listing and detail pages MUST NOT depend on organizer-supplied media.
- **Illustration is FORBIDDEN** — no AI-generated art, no stock illustration, no mascots. Photography is ALLOWED only when real (actual Jordanian events and students, documentary style) and does not exist yet; until then, typographic covers and the bracket motif ARE the imagery.

## D. Color System

All values below are the palette layer. Components MUST consume semantic tokens only; **raw hex values MUST NOT appear in components once tokens exist** (raw hexes live in exactly one place: the token definition file).

### Tokens

| Token | Value | Use |
|---|---|---|
| `background/default` | `#FFFFFF` | Page ground, card surfaces. Non-negotiable. |
| `background/sunken` | `#F7F6F3` | Table headers, wells, functional zones only. |
| `background/inverse` | `#191714` | The ONE dark surface: CTA closer bands, report cover band, footer. |
| `text/primary` | `#191714` | Headlines, body, data. |
| `text/secondary` | `#5C574E` | Supporting text, descriptions. |
| `text/tertiary` | `#8D877B` | Placeholders, metric labels, timestamps. |
| `text/inverse` | `#FFFFFF` | Text on inverse/brand surfaces. |
| `border/default` | `#E8E5E0` | Card and container borders, dividers. |
| `border/strong` | `#D6D2CA` | Inputs, emphasized containers. |
| `brand/default` | `#A03D21` | Primary buttons, links, active nav, focus rings. White text on it passes AA (~6.6:1). |
| `brand/hover` | `#873218` | Hover/pressed. Interactions darken, NEVER lighten. |
| `brand/tint` | `#F8EDE7` | Selected states, brand callouts — the ONLY non-white brand surface. |
| `status/success/fg` | `#1E6B40` | With tint `status/success/tint` `#E8F3EC`. |
| `status/warning/fg` | `#8A6116` | With tint `status/warning/tint` `#F8F0DC`. |
| `status/error/fg` | `#B3261E` | With tint `status/error/tint` `#F9E9E7`. |
| `status/info/fg` | `#1F5C8F` | With tint `status/info/tint` `#E7F0F7`. |

### Color law (review-blocking)

1. **Clay MUST appear at most 3 times per screen**: the primary action, the active nav item, and at most one accent detail. More clay than that means something claimed emphasis it didn't earn.
2. **Clay marks what to do, not what is.** Status, categories, and data are expressed through the status palette and ink — NEVER through clay.
3. **Semantic colors MUST NOT be used decoratively** (no green because it's "fresh," no info-blue backgrounds for visual variety). A semantic color on screen MUST correspond to an actual state.
4. **Brand color MUST NEVER become wallpaper** — no clay page sections, no clay sidebars, no clay hero backgrounds.
5. **Purple/blue gradients are FORBIDDEN.** All gradients are FORBIDDEN except within the system-generated cover fields, which use flat geometric color blocks, not gradients.
6. **Error red vs. brand clay hazard**: clay tints MUST NOT be used in destructive contexts; destructive actions MUST pair `status/error` color with explicit iconography and copy.
7. Dashboards are ink-and-stone with status colors doing informational work. A dashboard where color dominates is a failed dashboard.

## E. Typography System

### Families (closed set)

| Role | Family | Scope |
|---|---|---|
| Display | **General Sans** (Fontshare, self-hosted — network-independent build is a repo requirement) | Marketing H1/H2, event page titles, report cover ONLY. |
| UI/body/data | **Inter** (self-hosted variable) | Everything else: app shell, dashboards, forms, tables, body. |
| Arabic (future) | **IBM Plex Sans Arabic** | Reserved for i18n phase; layouts MUST NOT hardcode physical left/right so this drops in cleanly. |

**Role separation is mechanical and review-blocking:** General Sans MUST NOT appear inside the app shell; Inter MUST NOT set a marketing H1.

### Scale (closed set)

| Token | Size/line-height | Notes |
|---|---|---|
| `text/display-xl` | 64/68, −2% tracking | Landing H1 only. Scales to 36px on mobile. |
| `text/display-lg` | 44/48, −1.5% | Event page titles, section heroes. |
| `text/heading-lg` | 28/34 | In-app page titles. |
| `text/heading-md` | 20/28 | Card titles, section headers. |
| `text/heading-sm` | 16/24 semibold | Sub-sections, table group heads. |
| `text/body` | 16/26 | Marketing body, long-form prose. |
| `text/body-sm` | 14/22 | App default: dashboards, forms, tables. |
| `text/label` | 12/16 medium, +4% tracking | Eyebrows, metric captions, badge text. Uppercase ALLOWED here only. |
| `text/metric` | 30/36 (36/40 hero) semibold, **tabular lining numerals** | Dashboard numbers. `tabular-nums` is part of the token, not an add-on. |

### Typography law

- Dashboard numbers MUST use tabular numerals — everywhere data lives (tables, metrics, countdowns).
- Metrics MUST be big numbers over quiet labels: huge ink number, tiny uppercase tertiary label. That size gap is what makes a command center feel like one.
- Prose line length MUST NOT exceed ~72ch; event descriptions and rules MUST NOT run full-width.
- Weights in play: regular, medium, semibold. Bold is ALLOWED at display sizes only. **Light weights below 18px are FORBIDDEN.**
- Centered long body text is FORBIDDEN (centered short display lines on marketing pages are ALLOWED).
- Letterspaced uppercase longer than two words is FORBIDDEN.
- More than two type sizes inside one card is FORBIDDEN.
- Display type MUST be intentionally set (tracking, weight, leading tuned) — a headline that is merely enlarged body text is the classic slop tell and is FORBIDDEN.

## F. Spacing System

### Scale (closed set)

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96, 128` (px). **Off-scale spacing values are FORBIDDEN.** An 18px padding anywhere is how systems rot.

### Register rhythm

**Marketing register:** section vertical padding 96 desktop / 64 mobile; hero 128 top; content max-width 1152px; prose column 720px; card grid gaps 24.

**Tool register:** page gutter 24; between cards 16; card padding 20 (24 for metric-bearing cards); page-title block 32 below; table rows 48px tall (44 minimum), cell padding 16; dashboard sections separated by 32 + a section label — decorative dividers are FORBIDDEN.

**Mobile:** gutters 16; marketing sections 64; single-column card stacks with 16 gaps; nothing touches viewport edges except full-bleed bands.

### Spacing law

- **Headings MUST attach to their content**: more space above a heading than below it (e.g., 96 above / 32 below on marketing sections). Equal spacing everywhere is a slop signal and is FORBIDDEN.
- Empty space MUST separate ideas or let display type breathe. Empty space used to hide weak content is FORBIDDEN — a thin section gets merged or cut, not inflated.

## G. Radius, Borders, Elevation

### Radius (closed set — five tokens, no exceptions)

| Token | Value | Applies to |
|---|---|---|
| `radius/control` | 6px | Buttons, inputs, selects. |
| `radius/chip` | 8px | Chips/tags. |
| `radius/card` | 10px | Cards. |
| `radius/overlay` | 14px | Modals, popovers. |
| `radius/pill` | 999px | Status badges ONLY. |

**Radius of 20px or more is FORBIDDEN anywhere.**

### Borders and elevation

- Surfaces are flat white defined by **1px warm-stone borders**. 2px is ALLOWED only for focus rings and active-tab underlines.
- **Exactly two shadows exist:**
  1. `elevation/raised` — `0 1px 3px rgba(25,23,20,0.07)` — clickable-card hover ONLY.
  2. `elevation/overlay` — `0 8px 30px rgba(25,23,20,0.12)` — modals/popovers ONLY.
- **A third shadow requires a written design justification recorded in this document before use.** Until then, any other shadow is FORBIDDEN.
- Principle: **borders define containers; backgrounds define zones; shadows define transience.** Depth comes from border + background shift, never blur.

### Interaction states (all six, MANDATORY on every interactive element)

default · hover · active/pressed · focus-visible (2px `brand/tint` ring on `brand/default` border — focus indicators MUST NEVER be removed) · disabled (40% opacity, no color shift) · loading (in-place spinner or skeleton). A component missing any state MUST NOT ship.

## H. Component Language

Global physics apply to every component: token-only colors, closed radius set, 1px borders, two shadows, clay rationing.

### Buttons
- **Role:** the screen's action hierarchy made visible.
- **Allowed variants:** primary (clay fill, white text), secondary (white, `border/strong`, ink text), ghost (ink-secondary text, `background/sunken` on hover), destructive (error fill — confirmed-destructive contexts only). Heights 32/40/48. Radius `control`.
- **FORBIDDEN:** any fifth variant; gradient fills; shadows on buttons; hover that lightens or lifts (hover darkens, in place); two primary buttons in one view region; icon-only primaries without a label except in dense toolbars.
- **States:** all six. Loading = in-button spinner, label retained.

### Inputs / selects
- White field, `border/strong`, radius `control`, 40px height. Labels above (13px medium); helper/error below (13px, semantic color). Focus = clay border + 2px `brand/tint` ring — one ring, no glow.
- **FORBIDDEN:** floating labels, inset labels, placeholder-as-label, icons on both sides of a field, glow effects.

### Tabs
- In-app: underline style — 2px clay underline on active, ink text, tertiary inactive. Segmented/contained style ALLOWED only inside dense toolbars.
- **FORBIDDEN:** pill-tab rows (they read as toys); animated sliding backgrounds.

### Cards
- White, 1px `border/default`, radius `card`, flat. Clickable cards get hover: border darkens + `elevation/raised`. Non-clickable cards MUST NOT react to hover.
- **FORBIDDEN:** card-inside-card-inside-card nesting (max one level of card nesting, and only when the inner element is a list row, not another full card); gray-filled cards on white (use border, not fill); shadows at rest.

### Event cards
- Anatomy (fixed): cover zone → identity row (organizer) → title → metadata row (date/city/mode/team size) → status badge. The anatomy MUST repeat identically across every event card.
- **Cover zone uses the system-generated typographic cover** (title lockup on ink/clay/stone geometric field + bracket motif). Organizer images, when present, sit behind a consistent treatment (crop + tone). The no-image default MUST look deliberate.
- **FORBIDDEN:** raw uncropped organizer uploads; cover-dependent quality; per-card style variation.

### Metric cards
- The command center's signature. Tiny uppercase `text/tertiary` label → huge `text/metric` ink number → optional one-line hint.
- Warning/danger states tint the **border**, never fill the card. **A wall of color-filled metric cards is FORBIDDEN** — it's a fruit stand, not a command center.

### Tables
- Sunken `background/sunken` header band with uppercase 12px labels; white rows; hairline `border/default` separators; row hover `#FAFAF8` (token: `background/row-hover`); numeric columns right-aligned tabular; status via `StatusBadge`; row actions as ghost icon buttons (hover-revealed on desktop, always visible on touch).
- **FORBIDDEN:** zebra striping, full-grid borders, colored header bands, horizontally scrolling core tables on mobile (see §J).

### Badges (status)
- Pill radius, 12px medium text, semantic tint background + semantic fg. One source of truth for status→tone mapping (the `StatusBadge` component). 
- **FORBIDDEN:** ad-hoc colored spans, icons inside badges, borders on badges, badges used decoratively (a badge = a state, always).

### Chips / tags (skills, tracks, filters)
- Radius `chip` (deliberately distinct from status pills), `background/sunken` fill, ink-secondary text. Selected = `brand/tint` + clay text. Interactive chips get borders; informational ones don't.
- **FORBIDDEN:** rainbow-colored tag taxonomies; chips styled identically to status badges.

### Section headers
- Fixed unit: eyebrow (12px uppercase clay) + heading + optional one-line description + right-aligned action. This unit repeats across the entire product; its consistency outranks any page's cleverness. Deviating from the unit is FORBIDDEN without a written reason.

### Empty states
- One Lucide icon (1.75px stroke) + one plain sentence of what belongs here + one action. Dashed `border/default` container.
- **FORBIDDEN:** illustrations, mascots, whimsy copy ("nothing to see here!"), apologetic copy. New-user empty states SHOULD sell the next action (e.g., the next event), not apologize.

### Modals / dialogs
- Radius `overlay`, backdrop `rgba(25,23,20,0.4)`, `elevation/overlay`. Max-width 480 (confirm) / 640 (form). Destructive confirms MUST restate the object's name.
- **FORBIDDEN:** stacked modals (a modal spawning a modal is an IA failure); backdrop blur; full-screen takeover modals on desktop.

### Sidebar / nav
- 240px, white, 1px right border. Active item = `brand/tint` background + clay text (the ONE persistent clay element in the shell). Icons 16px Lucide. Role label + context at top.
- **FORBIDDEN:** dark sidebars, accordion-collapsing nav in V1, badges/counters on more than two nav items.

### Breadcrumbs
- Tertiary text, `/` separators, current page in ink. In-app only, only at depth ≥ 3. FORBIDDEN on marketing pages.

### CTA blocks
- Marketing sections MAY close with a full-width `background/inverse` band: white display text + clay primary button. **This inverted band is the ONLY dark surface in the system** — which is exactly why it works as a closer. Using it mid-page or as a hero is FORBIDDEN.

## I. Motion System

**Revised 2026-07-11 (decision D19) — this section replaces the earlier closed/restrictive motion law.** Full implementation reference, component APIs, and worked examples live in `docs/MOTION_SYSTEM.md`; that file is binding alongside this one for any animated UI work. Where the two conflict, `MOTION_SYSTEM.md` wins on implementation detail, this section wins on product-level intent.

**Motion is now a first-class part of Sandstone Editorial's premium feel, not just state feedback.** The product's public-facing surfaces (starting with the landing page) use a considered, controlled motion language — entrance sequencing, scroll reveal, stagger, ambient drift, count-up numbers, cursor parallax — to read as a live platform rather than a static document. This is a deliberate widening of the original "motion is only feedback" rule; the discipline moves from *"animate almost nothing"* to *"animate everything with the same restrained hand."*

### Timing tokens (closed set — extended)

Canonical values live in `src/lib/motion/tokens.ts`; this table documents intent, that file is the source of truth for exact numbers.

| Token | Value | Use |
|---|---|---|
| `duration.fast` | 150ms | Hover/press micro-interactions, focus rings |
| `duration.base` | 350ms | Default entrance/hover transitions, stagger item transitions |
| `duration.slow` | 600ms | Hero/section entrance, dashboard scale-in, count-up run time |
| `duration.reveal` | 500ms | Scroll-reveal fade/rise for headings, paragraphs, cards |
| `duration.ambient` | 8s+ | Idle/looping ambient motion (floating elements, marquee) |
| `duration.pulse` | 2s | Slow opacity pulse loop for a "live"/status indicator dot |
| `duration.heroPanelDelay` | 350ms | Delay before a hero's dominant preview panel begins its entrance |
| `stagger.item` | 80ms | Delay between grid/list children (cards, avatars, tags) |
| `stagger.heroLine` | 120ms | Delay between hero text lines on page load |
| `easing.standard` | `cubic-bezier(0.16,1,0.3,1)` | General-purpose ease-out |
| `easing.entrance` | `cubic-bezier(0.22,1,0.36,1)` | Hero/section entrances |

These values are **closed** in the same sense as the color/radius/spacing sets: Codex must import them from `src/lib/motion/tokens.ts`, never hardcode a duration/delay/easing inline. Adding a new token requires updating that file and this table together, not a one-off value in a component.

### Motion categories and rules

- **Entrance (page load).** The hero text block animates as one staggered sequence (eyebrow → heading → subhead → CTAs, `stagger.heroLine` between lines) on mount, not on scroll. The hero's dominant visual element (e.g. a dashboard/product-preview panel) MAY scale in from 0.96→1 with a fade, once, after the text sequence begins. This is the one section allowed a "big" entrance; it sets the tone, it does not repeat.
- **Scroll reveal.** Sections and their headings/paragraphs/cards MAY fade+rise into view once via `MotionReveal`/`MotionSection`, triggered by `whileInView` with `once: true`. Grids and lists MUST stagger their children via `MotionStagger`/`MotionStaggerItem` rather than appearing as one block. Reveals never replay on scroll back up. Avoid using the exact same variant on every single section — vary between `fadeUp`, `fadeUpSm`, and `fadeIn` (see `src/lib/motion/variants.ts`) so the page doesn't read as one repeated tic.
- **Hover/focus interactions.** Every interactive element MUST have a visible hover state and a press/tap state. Cards use `MotionCard` (translateY -4px + slight scale on hover, scale-down on tap) — transform/opacity only, never animates border color or box-shadow spread directly (those stay CSS transitions on the existing `duration.fast` token). Text links use a CSS-driven icon-shift (`group-hover:translate-x-*`) rather than a JS animation — cheaper and sufficient. Keyboard focus rings (`focus-visible:ring-*`) MUST remain fully visible and are never suppressed by a motion wrapper.
- **Ambient motion.** Small, slow, decorative drift (e.g. floating stat tiles, a pulsing "live" dot) is ALLOWED via `FloatingElement`, but MUST stay slow (`duration.ambient`, 8s+ per loop), small in distance (4–10px), and MUST NOT be used on anything the user needs to read precisely or click quickly. Ambient motion is set-dressing, not a focal point.
- **Cursor parallax.** ALLOWED for exactly one dominant hero element via `useCursorParallax`, capped at a small pixel offset (≤10px), spring-smoothed (not 1:1 cursor tracking), and only on non-touch pointer input. Parallax must never be the primary way information is revealed.
- **Counters and progress.** Numeric stats MAY count up from 0 once, when scrolled into view, via `MotionCounter` (`useInView`, `once: true`). They MUST NOT replay on re-scroll. Progress-style indicators follow the same once-only rule.
- **Connector/progress lines.** A thin animated line indicating sequence/progress (e.g. across a lifecycle strip) MAY use the brand/clay color as a **progress indicator**, not a decorative fill — this is a narrow, named exception to the "clay is action-only" rule in §D, permitted specifically for this pattern and nowhere else without a documented decision.
- **Marquee.** A slow (`≥30s` full loop), continuous horizontal marquee is ALLOWED for logo/social-proof rows via `MotionMarquee`. Marquees MUST NOT be used for content the user needs to read completely (never for primary navigation or CTAs) and MUST pause/disable under reduced motion.
- **Section transitions.** Sections MAY use a background/theme break (e.g. one inverted dark section) as a deliberate rhythm device, at most sparingly across a page — this is a compositional tool, not a per-section default. Abstract background shapes/oversized type MAY move slowly if used; they remain optional polish, not a requirement for every section.
- **Loading.** Skeletons MUST still match final layout exactly (no layout shift); spinners remain ALLOWED inside buttons (see `isLoading` on `Button`).
- **FORBIDDEN regardless of the above:** spring/bounce easing that reads as playful/gamified; motion faster than is comfortably legible; any animation that blocks reading or clicking; layout-affecting animation (animate `transform`/`opacity` only — never `width`/`height`/`top`/`left` in a way that triggers reflow); fast/aggressive carousels; motion that cannot be disabled by `prefers-reduced-motion`.

### Reduced motion — mandatory, not optional

- Every motion primitive in `src/components/motion/` and every hook in `src/lib/motion/` MUST check `useReducedMotionSafe()` (from `src/lib/motion/use-reduced-motion-safe.ts`) and render the fully-legible, static end-state when it is true — entrance sequences render already-visible, scroll reveals render already-in-place, ambient drift and parallax fully disable, counters render their final value with no animation.
- No component may reimplement its own reduced-motion check with a different hook or a raw `matchMedia` call — always use `useReducedMotionSafe`.
- Reduced motion must never hide content or functionality — it only removes the animation, never the information.

### Signature moments (unchanged, still the most theatrical two)

These remain the two moments explicitly allowed to exceed the standard timing budget — they predate and are unaffected by the wider motion language above:

1. **Contact reveal.** Locked contact info renders genuinely blurred/obscured with a lock glyph — designed to look protective, not broken. On final teammate acceptance: lock releases, blur resolves to sharp text over ~500ms, brief clay underline sweep. MUST feel earned and protective.
2. **QR check-in success.** Scan confirms → fast full-screen `status/success/tint` flash, participant name large + big checkmark, auto-reset ~800ms. Optimized for a volunteer scanning 200 people in bad lighting — legibility at arm's length IS the delight. Speed is the feature.

## J. Mobile-First Rules

**Audience reality:** participants are mobile-majority (registration, proposals, their QR — design mobile-first, enhance up). Organizers configure on desktop but operate on phones during event day (check-in, live counts — mobile-critical). Judging and reports are desktop-leaning.

- **Collapse order** as viewport shrinks: decorative/secondary columns first (sidebar → bottom nav or sheet), then grids → single column, then tables → record cards. Primary CTAs and status information MUST NEVER collapse away.
- **Tables MUST become record cards on mobile**: title line, right-aligned status badge, 2–3 key fields, tap-through to detail. Horizontally scrolling a core table is FORBIDDEN; horizontal scroll is ALLOWED only for genuinely tabular judging/score grids inside a visible scroll container.
- **Sticky bottom CTA** for registration and submission flows: single primary action, safe-area padded. **One sticky bar maximum per page** — a page wanting two sticky things is a wrong page.
- **Touch targets:** 44px minimum everywhere; 48px on event-day surfaces; check-in action buttons 56px (volunteers are moving, lighting is bad, mercy matters). 8px minimum between adjacent targets.
- **Forms:** single column always; correct input types/keyboards (`tel`, `email`); registration chunked into steps with visible progress; consent rows full-width tappable, optional visually distinct from mandatory, NEVER pre-checked.
- **The participant QR screen is a designed artifact, not a page:** near-full-brightness white, huge QR, participant name large enough for staff visual confirmation, event name, one-handed usable. Assume it gets screenshotted — it MUST look good in a camera roll.
- **Mobile is not desktop squeezed down.** Display type scales hard (64 → 36) rather than wrapping into six-line headlines; mobile body text 16px minimum (15px floor in dense tables).

## K. Anti-Sloppy-AI Doctrine

### What not-sloppy-AI UI means for Hackathonly Jordan

Bad AI-generated UI has a recognizable physiognomy, and its root cause is **uniform medium emphasis born of decision-avoidance**: everything medium-rounded, medium-shadowed, medium-spaced, medium-purple; every section a centered heading over three icon cards; nothing committed. It looks like the average of every landing page ever made — because it is. **Medium-everything is FORBIDDEN. Hierarchy requires commitment: big or small, present or absent, loud or silent — never everything-medium.**

### Banned patterns (all FORBIDDEN, review-blocking)

**Visual:** purple/blue gradients (and gradient meshes generally) · glassmorphism/backdrop blur · floating blobs · neon glows · emoji as icons · mixed icon sets or mixed stroke weights · decorative gradient borders · AI-generated illustrations · stock laptop-and-sticky-notes photos.

**Layout:** generic three-card feature grids as the default thought · angled/perspective SaaS screenshots · every-section-centered composition · card-inside-card nesting · sections that exist to fill a template rather than answer a question · alternating tinted section backgrounds.

**Component:** 20px+ radius anywhere · random shadows (shadow is an event, not a default) · more than four button styles · decorative badges · inputs with icons on both sides.

**Color:** brand color as wallpaper · semantic colors used decoratively · more than one accent competing.

**Motion:** scroll-triggered fade-up on every section (the #1 tell) · looping ambient animations · springy overshoot on serious surfaces · hover effects on non-interactive elements.

**Dashboard:** donut-chart soup · a chart for what a number says better · colored metric-card walls · decorative sparklines with no baseline · meaningless activity feeds · density theater (fake data-richness) and its opposite (dashboard-as-brochure).

### The three mandatory review tests

Every UI surface MUST pass all three before it ships. These are review-blocking checks, applied by Claude in every UI-task review:

1. **Squint test.** Blurred or squinted, exactly one primary hierarchy MUST be obvious — one most-important thing per view.
2. **Deletion test.** Remove any decorative element; if nothing is lost, it was slop — it stays deleted.
3. **Neighbor test.** Every element MUST share system physics with its siblings: same radius tier, on-scale spacing, scale-conformant type, standard border, sanctioned shadow. An element with private physics fails review.

## L. Screen Hierarchy

Design-effort ranking — where taste budget concentrates. This is not build order; it is care order.

**Tier 1 — brand carriers (maximum design investment):**
1. **Hackathon detail page** — the most-shared URL in the system; simultaneously marketing and product; forces the cover system and information contract into existence. Every other page inherits its decisions.
2. **Organizer command center** — the B2B sell in one screenshot; proves metric typography, warnings feed, and calm density.
3. **Proposal / contact-reveal flow** — small surface, signature moment; if this feels magical and trustworthy, students screenshot it and the wedge markets itself.
4. **Final report template** — print-grade, ink-band cover, sponsor-safe; a sales asset designed early even though built late.

**Tier 2 — daily fabric (system-consistent, moderate investment):** landing page · hackathon listing · QR check-in pair (participant QR + scanner — modest visually, unforgiving ergonomically) · participant dashboard · submission flow.

**Tier 3 — competent defaults (the system does the work):** auth · onboarding (the consent step is the one designed moment) · judging · mentor requests.

**Controlling principle:** spend taste where strangers judge (detail page, command center, reveal, report); spend consistency where users live (dashboards, forms); spend no exotic design effort on plumbing (auth).

## M. Page-Level Direction

### Public landing page
- **Purpose:** convert two audiences without splitting into two sites. **Emotional goal:** "this is real, and it's from here."
- **Hierarchy/required sections:** display-type hero (brave headline + one sentence + two CTAs — NO screenshot, NO illustration) → live events grid (proof) → how-matching-works in three privacy-forward steps → organizer band with one honest command-center screenshot → university logo row → ink-band closer.
- **CTA:** "Browse events" primary; "For organizers" secondary — both present everywhere. **Density:** low, editorial.
- **Premium marker:** restraint — a landing page confident enough not to shout. **Risks:** template drift. **FORBIDDEN:** three-icon feature grids, testimonial carousels, animated hero gimmicks, section fill-er-up.

### Hackathon listing
- **Purpose:** fast scanning with credible density. **Emotional goal:** "there's a real scene here."
- **Hierarchy:** filter chip row (city, mode, status) → card grid. **Density:** medium.
- **Premium marker:** fifteen cards that read as one designed set (system covers). **Risks:** sparse-month embarrassment — handle few events honestly, no fake filler. **FORBIDDEN:** cover-image-dependent quality, mixed card anatomies.

### Hackathon detail page
- **Purpose:** the shareable artifact — answers everything in one scroll; makes organizers proud of the URL. **Emotional goal:** "this event is legit."
- **Required sections (the information contract):** system-cover band with title lockup → facts strip (dates/location/mode/team size — the four universal questions) → tracks → timeline → prizes + rules (sidebar on desktop) → privacy note card → registration CTA (sticky bottom on mobile).
- **Density:** medium-low, strictly editorial. **CTA:** register — one primary, persistent.
- **Premium marker:** looks superb with zero uploaded assets. **Risks:** section sprawl — cap at seven sections, tab beyond that. **FORBIDDEN:** raw organizer imagery as hero, unbounded description walls.

### Auth / sign-in
- **Purpose:** disappear quickly. Single centered ~400px card on white: logo, providers, email. **Emotional goal:** frictionless trust.
- **Premium marker:** speed and silence. **FORBIDDEN:** split-screen with testimonial/photo, marketing copy on auth, decorative backgrounds.

### Onboarding
- **Purpose:** earn profile data honestly. Stepped (identity → education → skills → matching preferences), one topic per screen, visible progress, skip-where-possible.
- **The consent step is the designed moment:** mandatory vs. optional visually separated, plain language, nothing pre-checked, the privacy promise in one sentence. **Emotional goal:** "they take this seriously."
- **Risks:** form fatigue — every field justifies itself now or moves later. **FORBIDDEN:** single monolithic form, pre-checked optional consents, dark-pattern copy.

### Participant dashboard
- **Purpose:** status and next action — not engagement. **Hierarchy:** next-action banner (one thing, if any) → my registrations → active proposals (2-of-4 progress + expiry) → teams.
- **Emotional goal:** "I know exactly where I stand." **Density:** medium.
- **Premium marker:** respects the user's time — no feed, no noise. **Risks:** empty-state emptiness for new users — the empty state sells the next event, never apologizes. **FORBIDDEN:** activity feeds, engagement mechanics, gamification.

### Organizer command center
- **Purpose:** the calmest room at the event; also the sales screenshot. **Hierarchy:** event context header → metric grid grouped by lifecycle (registration / team formation / delivery) → warnings feed → module subnav.
- **Emotional goal:** "I am in control." **Density:** high but breathing.
- **CTA:** contextual per lifecycle stage, one at a time. **Premium marker:** huge tabular numerals over whisper-quiet labels; warnings in operator language. **Risks:** density theater. **FORBIDDEN:** colored metric-card walls, donut-chart soup, decorative charts.

### QR check-in (pair)
- **Participant QR screen:** designed artifact per §J — huge QR, big name, bright white, screenshot-worthy.
- **Organizer scanner:** camera view + manual search fallback (first-class, not an afterthought); 56px actions; success flash per §I. This screen MAY be locally dark-styled for dim venues (the ONE sanctioned dark surface exception, local to this screen — not a theme).
- **Emotional goal:** zero-friction event-day competence. **Risks:** camera quirks — manual path always visible. **FORBIDDEN:** anything that slows the scan loop.

### Submission flow
- **Purpose:** get complete submissions without chaos. Sectioned form, autosave visible, completeness meter, AI-disclosure field, deadline clarity.
- **CTA:** sticky bottom submit on mobile. **Emotional goal:** "we won't lose your work."
- **Premium marker:** the completeness meter quietly raising submission quality. **FORBIDDEN:** one giant unstructured form, silent autosave failures.

### Final report template
- **Purpose:** the artifact organizers forward upward — a marketing asset wearing a feature costume. **Emotional goal (reader = sponsor/dean):** "this was run professionally."
- **Required structure:** ink-band cover (event name, dates, organizer, bracket motif) → headline stats (big tabular numbers) → distributions (universities, roles, tracks) → teams/submissions summary → winners showcase → mentor/judging summaries → sponsor impact section.
- **Density:** print-grade editorial; MUST print cleanly (browser print = the V1 PDF). **Premium marker:** it reads like a firm's report, not a web page. **FORBIDDEN:** screen-only layouts that break in print, decorative charts, any PII beyond consented content.

## N. Implementation Route

The path from this document to shipped UI (each step is its own task in the Claude/Codex workflow):

1. **DESIGN-000 (this step):** docs reconciliation only. This document created; D18 recorded; `COMPONENTS.md` reconciled. **No UI implementation.**
2. **PHASE-UI-000 — tokens + fonts + primitives ONLY:**
   - Replace the Phase 2 warm-paper token base in the global stylesheet with §D's white-ground palette (light-only; the dark-mode media query goes away per D18).
   - Self-host General Sans + Inter via `next/font/local` (fonts require human approval for the asset addition; network-independent build MUST be preserved).
   - Update existing primitives (`Button`, `Card`, `StatusBadge`, `MetricCard`, `EmptyState`, `Skeleton`, `SectionHeader`, layout shells) to consume the new tokens and closed sets.
   - **No page redesigns in this task.** Pages may shift appearance because tokens changed underneath them — that is expected; layout changes are not.
3. **Then surface-by-surface UI tasks, one route/surface per task,** in Tier order from §L as features exist. Every UI task:
   - MUST name this document as its design authority.
   - MUST attach screenshots at **375px and 1280px** to the handoff.
   - MUST pass Claude review against this document — the closed sets (color/radius/shadow/type/spacing), the clay-rationing law, all six interaction states, and the three anti-slop tests are review-blocking checks, applied with the same rigor the workflow applies to RLS.

### Standing acceptance criteria for every future UI task

- Uses only semantic tokens — zero raw hex values in components.
- Clay appears at most 3 times per screen.
- All six interaction states implemented on every interactive element.
- No scroll-triggered animations; motion within §I's budget.
- No shadows outside the two elevation tokens; no radii outside the five radius tokens; no off-scale spacing.
- Passes squint, deletion, and neighbor tests.
- Screenshots at 375px and 1280px attached to the handoff.
