import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-lg">
          Lumen<span className="text-muted-foreground">Careers</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground" }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Jobs
          </Link>
          <Link
            to="/about"
            activeProps={{ className: "text-foreground" }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Lumen Careers. All rights reserved.</p>
        <p>Built for people who love their work.</p>
      </div>
    </footer>
  );
}
