"use client";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Header() {
  return (
    <header className="w-full border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 py-4 md:px-6 max-w-7xl">
        <div className="flex items-center gap-2">
          <Link href="/">
            <span className={`text-2xl ${pacifico.className} text-primary`}>
              Quotica
            </span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <SignedIn>
            <Link href="/membership">
              <Button variant="ghost" size="sm">
                Become a Pro Member
              </Button>
            </Link>

            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="ghost" size="sm">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
          <Link
            href="https://github.com/shvmmshr/quotica"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="sm">
              GitHub
            </Button>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
