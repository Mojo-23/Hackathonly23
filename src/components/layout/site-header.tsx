import Link from "next/link";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/events", label: "Hackathons" },
  { href: "/participants", label: "For participants" },
  { href: "/organizers", label: "For organizers" },
  { href: "/blog", label: "Blog" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-foreground">
            H
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink">
            Hackathonly <span className="text-ink-subtle">Jordan</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign in
          </Button>
          <Button size="sm">Sign up</Button>
        </div>
      </div>
    </header>
  );
}
