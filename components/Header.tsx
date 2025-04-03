'use client';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Pacifico } from 'next/font/google';
import { useEffect, useState } from 'react';
import { Menu, MoveRight, X, Plus, History } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  creds: number;
  amount: number;
  createdAt: string;
}

export default function Header() {
  const { theme } = useTheme();
  const { user } = useUser();
  const [credits, setCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isOpen, setIsOpen] = useState(false); // Modal state
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile menu state

  const navigationItems = [
    {
      title: 'Editor',
      href: '/editor',
      description: 'Create beautiful quote images with our AI-powered editor',
    },
    {
      title: 'Chat',
      href: '/chat',
      description: 'Generate images through natural conversation',
    },
    {
      title: 'Pricing',
      href: '/#pricing',
      description: "View our pricing plans and choose what's right for you",
    },
  ];

  useEffect(() => {
    const fetchCredits = async () => {
      if (user) {
        try {
          const res = await fetch(`/api/credits/getCreds?userId=${user.id}`);
          const data = await res.json();
          setCredits(data.credits ?? 0);
        } catch (error) {
          console.error('Failed to fetch credits', error);
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
        console.error('Failed to fetch transactions', error);
      }
    }
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
            <nav className="hidden md:flex items-center gap-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {navigationItems.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      {item.href === '/#pricing' ? (
                        <button
                          onClick={scrollToPricing}
                          className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                        >
                          {item.title}
                        </button>
                      ) : (
                        <Link href={item.href} legacyBehavior passHref>
                          <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                            {item.title}
                          </NavigationMenuLink>
                        </Link>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
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
                      {credits.toFixed(2)}
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

                {/* Transaction History Button */}
                <Button
                  onClick={fetchTransactions}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border"
                >
                  <History size={16} />
                  <span className="sr-only">Transaction History</span>
                </Button>
              </div>
              <UserButton afterSignOutUrl="/" />
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
              {navigationItems.map((item) =>
                item.href === '/#pricing' ? (
                  <button
                    key={item.title}
                    onClick={scrollToPricing}
                    className="flex justify-between items-center py-2 hover:text-primary transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                    <MoveRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex justify-between items-center py-2 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                    <MoveRight className="w-4 h-4" />
                  </Link>
                )
              )}

              <SignedIn>
                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col">
                    <span className="font-medium">Credits: {credits.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">
                      Available credits in your account
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={fetchTransactions}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      <History size={14} />
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

      {/* Transaction Modal */}
      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-[100]" onClose={() => setIsOpen(false)}>
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
              <Dialog.Panel className="bg-background rounded-lg shadow-xl max-w-md w-full p-6 z-[200] border">
                <Dialog.Title className="text-xl font-bold mb-4 flex items-center gap-2">
                  <History size={20} className="text-primary" />
                  <span>Transaction History</span>
                </Dialog.Title>

                <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {transactions.length > 0 ? (
                    transactions.map((txn) => (
                      <div key={txn.id} className="flex justify-between p-3 border rounded-lg">
                        <div>
                          <div
                            className={`text-sm font-medium ${
                              txn.type === 'credit' ? 'text-green-500' : 'text-amber-500'
                            }`}
                          >
                            {txn.type === 'credit' ? 'Added' : 'Used'} {txn.creds} credits
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${(txn.amount / 100).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground self-center">
                          {new Date(txn.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No transactions found.</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Close
                  </Button>
                  <Link href="/membership">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus size={16} className="mr-2" />
                      Add Credits
                    </Button>
                  </Link>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
