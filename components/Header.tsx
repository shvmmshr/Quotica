'use client';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useClerk,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Pacifico } from 'next/font/google';
import { Menu, MoveRight, X, Plus, History, Info } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useCredits } from '@/app/context/creditsContext';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  creds: number;
  amount: number;
  createdAt: string;
  transactionNumber: string;
}

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export default function Header() {
  const { theme } = useTheme();
  const { user } = useUser();
  const { credits, isLoading } = useCredits();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openSignIn } = useClerk();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!user) return;

    setIsTransactionsLoading(true);
    try {
      const res = await fetch(`/api/transactions?userId=${user.id}`);
      const data = await res.json();
      setTransactions(data.transactions);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setIsTransactionsLoading(false);
    }
  };
  const openSignInDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    openSignIn();
  };

  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="w-full border-b border-border/40 backdrop-blur-xl bg-background/70 sticky top-0 z-50 shadow-sm">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/5 blur-3xl rounded-full" />
        </div>
        <div className="container mx-auto flex items-center justify-between h-16 px-4 py-2 md:px-6 max-w-7xl relative">
          <div className="flex items-center gap-8">
            <Link href="/" className="relative group">
              <div className="absolute -inset-1 rounded-full blur opacity-25 bg-gradient-to-r from-primary to-purple-500 group-hover:opacity-40 transition duration-300"></div>
              <span
                className={`relative text-2xl ${pacifico.className} text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 dark:from-primary dark:to-blue-400`}
              >
                Quotica
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-3">
              <SignedIn>
                <Link href="/editor" passHref>
                  <Button variant="ghost" size="sm">
                    Editor
                  </Button>
                </Link>
                <Link href="/chat" passHref>
                  <Button variant="ghost" size="sm">
                    Chat
                  </Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <Button variant="ghost" size="sm" onClick={openSignInDialog}>
                  Editor
                </Button>
                <Button variant="ghost" size="sm" onClick={openSignInDialog}>
                  Chat
                </Button>
              </SignedOut>
              <Button variant="ghost" size="sm" onClick={scrollToPricing}>
                Pricing
              </Button>
            </nav>
          </div>

          <nav className="flex items-center gap-3">
            <SignedIn>
              <div className="hidden md:flex items-center gap-4">
                {/* Credits display with + button */}
                <div className="flex overflow-hidden rounded-full">
                  <div
                    className={`flex items-center h-9 gap-1 px-4 py-1 ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    } border rounded-l-full transition-all`}
                  >
                    <span className="text-sm font-medium">Credits:</span>
                    <span
                      className={`text-sm font-bold ${
                        credits < 1 ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {isLoading ? '...' : credits.toFixed(2)}
                    </span>
                  </div>
                  <Link href="/membership">
                    <Button
                      size="icon"
                      className="rounded-l-none rounded-r-full h-9 bg-primary hover:bg-primary/90"
                    >
                      <Plus size={16} />
                      <span className="sr-only">Add Credits</span>
                    </Button>
                  </Link>
                </div>

                {/* History Button */}
                <Button
                  onClick={fetchTransactions}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border"
                  disabled={isTransactionsLoading}
                >
                  {isTransactionsLoading ? (
                    <div className="animate-spin h-4 w-4 border-b-2 border-primary rounded-full" />
                  ) : (
                    <History size={16} />
                  )}
                  <span className="sr-only">Transaction History</span>
                </Button>
              </div>
              <UserButton />
            </SignedIn>

            <SignedOut>
              <div className="hidden md:flex items-center gap-2">
                <SignInButton>
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            </SignedOut>

            <ThemeToggle />

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-full"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </nav>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="container mx-auto px-4 py-4 md:hidden border-t">
            <div className="flex flex-col space-y-4">
              <SignedIn>
                <Link
                  href="/editor"
                  className="flex justify-between items-center py-2 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">Editor</span>
                    <span className="text-xs text-muted-foreground">
                      Create beautiful quote images with our AI-powered editor
                    </span>
                  </div>
                  <MoveRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/chat"
                  className="flex justify-between items-center py-2 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">Chat</span>
                    <span className="text-xs text-muted-foreground">
                      Generate images through natural conversation
                    </span>
                  </div>
                  <MoveRight className="w-4 h-4" />
                </Link>
              </SignedIn>

              <SignedOut>
                <button
                  onClick={(e) => {
                    openSignInDialog(e);
                    setMobileMenuOpen(false);
                  }}
                  className="flex justify-between items-center py-2 hover:text-primary transition-colors w-full text-left"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">Editor</span>
                    <span className="text-xs text-muted-foreground">
                      Create beautiful quote images with our AI-powered editor
                    </span>
                  </div>
                  <MoveRight className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    openSignInDialog(e);
                    setMobileMenuOpen(false);
                  }}
                  className="flex justify-between items-center py-2 hover:text-primary transition-colors w-full text-left"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">Chat</span>
                    <span className="text-xs text-muted-foreground">
                      Generate images through natural conversation
                    </span>
                  </div>
                  <MoveRight className="w-4 h-4" />
                </button>
              </SignedOut>

              <button
                onClick={scrollToPricing}
                className="flex justify-between items-center py-2 hover:text-primary transition-colors w-full text-left"
              >
                <div className="flex flex-col">
                  <span className="font-medium">Pricing</span>
                  <span className="text-xs text-muted-foreground">
                    View our pricing plans and choose what&apos;s right for you
                  </span>
                </div>
                <MoveRight className="w-4 h-4" />
              </button>

              <SignedIn>
                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      Credits: {isLoading ? '...' : credits.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Available credits in your account
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={fetchTransactions}
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full border"
                      disabled={isTransactionsLoading}
                    >
                      {isTransactionsLoading ? (
                        <div className="animate-spin h-4 w-4 border-b-2 border-primary rounded-full" />
                      ) : (
                        <History size={16} />
                      )}
                      <span className="sr-only">Transaction History</span>
                    </Button>
                    <Link href="/membership">
                      <Button size="icon" className="h-8 w-8 rounded-full">
                        <Plus size={14} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </SignedIn>

              <SignedOut>
                <div className="flex flex-col space-y-2 pt-2">
                  <SignInButton>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button className="w-full bg-primary hover:bg-primary/90">Sign Up</Button>
                  </SignUpButton>
                </div>
              </SignedOut>
            </div>
          </div>
        )}
      </header>

      {/* History Modal */}
      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

          <div className="fixed inset-0 flex items-end justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-t-xl bg-background border shadow-lg transition-all max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-medium">Transaction History</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Content - Scrollable */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {isTransactionsLoading ? (
                    <div className="p-8 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No transactions found
                    </div>
                  ) : (
                    <div className="divide-y">
                      <TooltipProvider>
                        {transactions.map((txn) => (
                          <div key={txn.id} className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {txn.type === 'credit' ? (
                                    <span className="text-green-500">+{txn.creds} credits</span>
                                  ) : (
                                    <span className="text-amber-500">-{txn.creds} credits</span>
                                  )}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Transaction #{txn.transactionNumber}</p>
                                      <p>{new Date(txn.createdAt).toLocaleString()}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ${(txn.amount / 100).toFixed(2)}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(txn.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </TooltipProvider>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t text-right">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-primary text-white rounded"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
