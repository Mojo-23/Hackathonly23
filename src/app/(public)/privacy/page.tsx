import { SectionHeader } from "@/components/ui/section-header";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SectionHeader eyebrow="Legal" title="Privacy policy" />
      <p className="mt-6 text-sm leading-relaxed text-ink-muted">
        Placeholder — versioned privacy policy text will be added in Phase 4, referenced by
        `consent_records.consent_text_version` per the privacy model documented in
        <code className="mx-1 rounded bg-paper-raised px-1.5 py-0.5">/docs/PRIVACY_MODEL.md</code>.
      </p>
    </div>
  );
}
