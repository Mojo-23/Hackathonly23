// Shared event-cover resolution: curated local photography with a
// system-generated flat-tone fallback for any event without a curated image.
// Used by both the event card (listing/grid contexts) and the event detail
// hero, so a given event's cover looks the same wherever it appears.
//
// Photography is curated, locally-stored (public/images/events/), and
// approved by explicit human decision as a stand-in for real event
// photography, which doesn't exist yet. Source and license for every file
// are recorded in public/images/SOURCE.md. Never hotlinked.

export const coverPhotoBySlug: Record<string, string> = {
  "jordan-ai-builders-hackathon": "/images/events/jordan-ai-builders-hackathon.jpg",
  "usj-fintech-sprint": "/images/events/usj-fintech-sprint.jpg",
  "psut-hardware-hack": "/images/events/psut-hardware-hack.jpg",
};

// Fallback tone field for any event with no curated photo yet — flat,
// closed-palette, never a gradient, never illustration. Two-tone rotation is
// deliberate: the closed palette has exactly one dark surface
// (background-inverse) and one sunken surface (background-sunken) available
// for non-white fields.
export const coverTone = [
  {
    wrapper: "bg-background-inverse",
    icon: "text-text-inverse/15",
    corner: "border-text-inverse/30",
    eyebrow: "text-text-inverse/70",
    mark: "text-text-inverse",
  },
  {
    wrapper: "bg-background-sunken",
    icon: "text-text-tertiary/25",
    corner: "border-text-primary/25",
    eyebrow: "text-text-tertiary",
    mark: "text-text-primary",
  },
] as const;

export function getCoverTone(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash += id.charCodeAt(i);
  return coverTone[hash % coverTone.length];
}
