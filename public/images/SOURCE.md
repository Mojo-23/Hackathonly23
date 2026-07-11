# Local image asset manifest

All images below were downloaded and committed as local assets under `public/images/` per the binding human decision (2026-07-11) approving curated photography for event covers and participant avatars, on the condition that no image is ever hotlinked to a third-party host at runtime. Every file listed here is served from this repository via `next/image`; none are fetched from an external URL in the shipped product.

Source: Unsplash (https://unsplash.com), all photographs used under the [Unsplash License](https://unsplash.com/license) — free to use for commercial and non-commercial purposes, no permission required, attribution appreciated. These are **placeholder/demo assets** standing in for real Hackathonly event photography, which does not exist yet (per `docs/DESIGN_SYSTEM.md` §C). They should be replaced with real, consented Jordanian event/participant photography as soon as it exists.

## Event covers (`public/images/events/`)

| File | Used for | Unsplash photo ID | Curation note |
|---|---|---|---|
| `jordan-ai-builders-hackathon.jpg` | Jordan AI Builders Hackathon (`hk_1`) | `1550439062-609e1531270e` | Overhead shot, coder at a multi-monitor desk at night — real coding/hackathon energy, no staged office, no stock cliché. |
| `usj-fintech-sprint.jpg` | University of Jordan Fintech Sprint (`hk_2`) | `1518186285589-2f7649de83e0` | Laptop screen showing a live financial/trading chart — a literal, honest fintech-sprint visual, not a generic office. |
| `psut-hardware-hack.jpg` | PSUT Hardware & IoT Hack (`hk_3`) | `1518770660439-4636190af475` | Macro shot of a populated circuit board — direct fit for a hardware/IoT hackathon. |

All three cropped/served at a 16:9 aspect ratio to match the existing `EventCard` cover-zone anatomy.

**Rejected during curation (do not reuse):** `photo-1497366216548-37526070297c` was initially selected for the fintech sprint but turned out (on visual inspection after download) to be an empty office hallway/kitchen interior — exactly the "fake office" cliché this project's curation rules forbid. Replaced with the trading-chart image above before this was wired into any component.

## Avatars (`public/images/avatars/`)

| File | Used for | Unsplash photo ID | Curation note |
|---|---|---|---|
| `layla-h.jpg` | "Layla H." — landing page Team formation queue preview | `1494790108377-be9c29b29330` | Candid, credible portrait — not a stock-agency headshot, not glamour photography. |
| `omar-k.jpg` | "Omar K." — landing page Team formation queue preview | `1500648767791-00dcc994a43e` | Casual professional portrait, consistent with a young-builder register. |
| `sara-m.jpg` | "Sara M." — landing page Team formation queue preview | `1544005313-94ddf0286df2` | Natural outdoor portrait, credible and youthful. |

All three cropped/served at a 1:1 (square) aspect ratio, rendered circular via CSS in the UI, consistent size/framing across the row.

**Rejected during curation (do not reuse):** `photo-1472099645785-5658abf4ff4e` was initially selected for "Sara M." but turned out (on visual inspection after download) to depict a middle-aged man — a clear name/representation mismatch. Replaced with the portrait above before this was wired into any component.

## Rules for extending this manifest

Any future image added under `public/images/` must be recorded here with the same fields (file, used-for, source ID/origin, curation note) before being referenced in code. No image may be added to the codebase via a runtime `<img src="https://...">`/hotlink pattern — download, curate, commit, then reference the local path.
