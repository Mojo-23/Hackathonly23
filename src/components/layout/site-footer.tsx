import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold text-ink">Hackathonly Jordan</p>
          <p className="mt-1 text-sm text-ink-muted">
            The event intelligence operating system for Jordanian hackathons.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-ink-muted">
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
          <Link href="/events" className="hover:text-ink">
            Events
          </Link>
        </div>
      </div>
    </footer>
  );
}
