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
import { CreditCard, Clock } from "lucide-react"; // Import Clock icon
import { useTheme } from "next-themes";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Header() {
  const { theme } = useTheme();
  const { user } = useUser();
  const [credits, setCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false); // Modal state

  useEffect(() => {
    const fetchCredits = async () => {
      if (user) {
        try {
          const res = await fetch(`/api/credits/getCreds?userId=${user.id}`);
          const data = await res.json();
          setCredits(data.credits ?? 0);
        } catch (error) {
          console.error("Failed to fetch credits", error);
        }
      }
    };

    fetchCredits();
  }, [user]);

  // Fetch transactions when opening the modal
  const fetchTransactions = async () => {
    if (user) {
      try {
        const res = await fetch(`/api/transactions?userId=${user.id}`);
        const data = await res.json();
        setTransactions(data.transactions ?? []);
        setIsOpen(true); // Open modal
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      }
    }
  };

  return (
    <>
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
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    theme === "dark" ? "bg-gray-800" : "bg-white border"
                  }`}
                >
                  <span className="text-sm font-medium">Credits:</span>
                  <span
                    className={`text-sm font-bold ${
                      credits < 1 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {credits.toFixed(2)}
                  </span>
                </div>

                {/* Transactions Button (Clock Icon) */}
                <button
                  onClick={fetchTransactions}
                  className="p-2 rounded-full border bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  <Clock size={18} />
                </button>

                <Link href="/membership">
                  <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${
                      theme === "dark"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white`}
                  >
                    <CreditCard size={16} />
                    <span className="text-sm">Add Credits</span>
                  </button>
                </Link>
              </div>
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

      {/* Transaction Modal */}
      <Transition show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[100]"
          onClose={() => setIsOpen(false)}
        >
          {/* Background Blur Effect */}
          <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-lg" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 z-[200]">
                <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                  Transaction History
                </Dialog.Title>

                <div className="mt-4 space-y-3">
                  {transactions.length > 0 ? (
                    transactions.map((txn) => (
                      <div
                        key={txn.id}
                        className="flex justify-between p-2 border-b dark:border-gray-700"
                      >
                        <span className="text-sm">
                          {txn.type === "credit" ? "Added" : "Used"} {txn.creds}{" "}
                          credits
                          {" ($"}
                          {(txn.amount / 100).toFixed(2)}
                          {")"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(txn.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No transactions found.
                    </p>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setIsOpen(false)}>Close</Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
