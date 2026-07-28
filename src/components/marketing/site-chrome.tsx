import { Link } from "@tanstack/react-router";

import { ReachLogo } from "@/components/brand/reach-logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5">
        <Link to="/" aria-label="Reach home">
          <ReachLogo />
        </Link>
        <nav className="text-muted-foreground ml-auto hidden items-center gap-7 text-sm font-medium md:flex">
          <Link to="/" hash="how-it-works" className="hover:text-foreground transition-colors">
            How it works
          </Link>
          <Link to="/pricing" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-6">
          <Button variant="ghost" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/signup">Start free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-secondary/50 border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <ReachLogo />
          <p className="text-muted-foreground max-w-xs text-sm">
            Stop chasing clients for money. Reach chases for you — professionally, consistently,
            every single time.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-foreground font-semibold">Product</p>
          <Link to="/pricing" className="text-muted-foreground hover:text-foreground block">
            Pricing
          </Link>
          <Link to="/signup" className="text-muted-foreground hover:text-foreground block">
            Create an account
          </Link>
          <Link to="/login" className="text-muted-foreground hover:text-foreground block">
            Log in
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-foreground font-semibold">Company</p>
          <a
            href="https://marketerahq.com"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground block"
          >
            About MarketEra
          </a>
          <a
            href="https://marketerahq.com"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground block"
          >
            marketerahq.com
          </a>
          <a
            href="mailto:hello@marketerahq.com"
            className="text-muted-foreground hover:text-foreground block"
          >
            Contact
          </a>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-foreground font-semibold">Legal</p>
          <span className="text-muted-foreground block">Terms of service</span>
          <span className="text-muted-foreground block">Privacy policy</span>
        </div>
      </div>
      <div className="text-muted-foreground border-t px-5 py-5 text-center text-xs">
        &copy; {new Date().getFullYear()} MarketEra. Reach is a MarketEra product.
      </div>
    </footer>
  );
}
