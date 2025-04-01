import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t py-12 md:py-16">
      <div className="w-full justify-center items-center container grid gap-8 px-4 md:grid-cols-4 md:gap-12 lg:gap-16">
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="3" x2="21" y1="9" y2="9" />
              <line x1="9" x2="9" y1="21" y2="9" />
            </svg>
            <div>Quotica</div>
          </div>
          <div className="text-muted-foreground">
            Create, customize, and download beautiful quotes in seconds. Free to
            use with premium features.
          </div>
          <div className="flex space-x-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
              <span className="sr-only">Twitter</span>
            </a>
          </div>
        </div>
        <div className="space-y-4">
          <div className="text-sm font-medium">Product</div>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/editor"
                className="hover:text-foreground transition-colors"
              >
                Quote Editor
              </Link>
            </li>
            <li>
              <Link
                href="/membership"
                className="hover:text-foreground transition-colors"
              >
                Premium Features
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <div className="text-sm font-medium">Legal</div>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/refund"
                className="hover:text-foreground transition-colors"
              >
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <div className="text-sm font-medium">Help</div>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/contact"
                className="hover:text-foreground transition-colors"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <a
                href="mailto:support@quotica.app"
                className="hover:text-foreground transition-colors"
              >
                Email Support
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mt-12 px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} Quotica. All rights reserved.</p>
      </div>
    </footer>
  );
}
