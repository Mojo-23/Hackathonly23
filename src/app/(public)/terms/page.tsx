import { SectionHeader } from "@/components/ui/section-header";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <SectionHeader eyebrow="Legal" title="Terms of service" />
      <p className="mt-6 text-sm leading-relaxed text-ink-muted">
        Placeholder — versioned terms text will be added in Phase 4, referenced by
        <code className="mx-1 rounded bg-paper-raised px-1.5 py-0.5">consent_records.consent_text_version</code>.
      </p>
    </div>
  );
}
