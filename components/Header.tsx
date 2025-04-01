"use client";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Pacifico } from "next/font/google";
import { useEffect, useState } from "react";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Header() {
  const { user } = useUser();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      if (user) {
        try {
          const res = await fetch(`/api/credits/getCreds?userId=${user.id}`);
          const data = await res.json();
          if (data.credits !== undefined) {
            setCredits(data.credits); // Set credits if the user exists
          }
        } catch (error) {
          console.error("Failed to fetch credits", error);
        }
      }
    };

    fetchCredits();
  }, [user]); // Only fetch credits when the user is available
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
            {credits !== null && (
              <span className="text-sm text-primary">Credits: {credits}</span>
            )}
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
