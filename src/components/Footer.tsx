import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Main Content - Centered */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-12">
            {/* Brand Section - Spans full width on mobile, 1 column on desktop */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">PocketBroker</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your non-custodial gateway to decentralized trading
              </p>
            </div>

            {/* Products */}
            <div className="flex flex-col items-center text-center">
              <h3 className="mb-3 md:mb-4 text-sm font-semibold">Products</h3>
              <ul className="space-y-2 md:space-y-3">
                <li>
                  <Link href="/trade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Swap
                  </Link>
                </li>
                <li>
                  <Link href="/markets" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Markets
                  </Link>
                </li>
                <li>
                  <Link href="/portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Portfolio
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Tools
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="flex flex-col items-center text-center">
              <h3 className="mb-3 md:mb-4 text-sm font-semibold">Resources</h3>
              <ul className="space-y-2 md:space-y-3">
                <li>
                  <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="flex flex-col items-center text-center">
              <h3 className="mb-3 md:mb-4 text-sm font-semibold">Legal</h3>
              <ul className="space-y-2 md:space-y-3">
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright - Centered */}
          <div className="mt-8 md:mt-12 border-t pt-6 md:pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} PocketBroker. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}