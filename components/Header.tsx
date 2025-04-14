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
import { Menu, MoveRight, X, Plus, History, Info, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useCredits } from '@/app/context/creditsContext';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { MembershipDialog } from '@/app/membership/components/membership-dialog';

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
  const { user } = useUser();
  const { credits, isLoading } = useCredits();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
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
          <div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 bg-purple-500/5 blur-3xl rounded-full" />
        </div>
        <div className="container mx-auto flex items-center justify-between h-16 px-4 py-2 md:px-6 max-w-7xl relative">
          <div className="flex items-center gap-8">
            <Link href="/" className="relative group">
              <div className="absolute -inset-1 rounded-full blur opacity-25 bg-gradient-to-r from-[#726CF8] to-[#E975A8] dark:from-primary dark:to-white/50 group-hover:opacity-35 transition duration-300"></div>
              <span
                className={`relative text-2xl ${pacifico.className} text-foreground bg-clip-text text-transparent bg-gradient-to-r from-[#003776] to-[#b143ff] dark:from-primary dark:to-blue-400`}
              >
                Quotica
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent">
                      Features
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <Link
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/20 to-primary/5 p-6 no-underline outline-none focus:shadow-md"
                              href="/chat"
                            >
                              <MessageSquare className="h-6 w-6 text-primary" />
                              <div className="mb-2 mt-4 text-lg font-medium text-foreground">
                                AI Chat
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                Chat with our AI assistant to generate beautiful images from your
                                thoughts.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <SignedIn>
                          <li>
                            <Link href="/chat" legacyBehavior passHref>
                              <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                                <div className="text-sm font-medium leading-none">Chat</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  Generate images through natural conversation
                                </p>
                              </NavigationMenuLink>
                            </Link>
                          </li>
                        </SignedIn>
                        <SignedOut>
                          <li>
                            <div onClick={openSignInDialog} className="cursor-pointer">
                              <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                                <div className="text-sm font-medium leading-none">Chat</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  Generate images through natural conversation
                                </p>
                              </div>
                            </div>
                          </li>
                        </SignedOut>
                        <li>
                          <div onClick={scrollToPricing} className="cursor-pointer">
                            <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Pricing</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Check out our pricing plans
                              </p>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/chat" legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Chat
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <div onClick={scrollToPricing} className="cursor-pointer">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Pricing
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <SignedIn>
              <div className="hidden md:flex items-center gap-4">
                {/* Credits display with + button */}
                <div className="flex overflow-hidden rounded-full">
                  <div className="flex items-center h-9 gap-1 px-4 py-1 bg-card border rounded-l-full transition-all">
                    <span className="text-sm font-medium">Credits:</span>
                    <span
                      className={`text-sm font-bold ${
                        credits < 1 ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {isLoading ? '...' : credits.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    className="rounded-l-none rounded-r-full h-9 bg-primary hover:bg-primary/90"
                    onClick={() => setIsMembershipOpen(true)}
                  >
                    <Plus size={16} />
                    <span className="sr-only">Add Credits</span>
                  </Button>
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
                  <Button variant="ghost" size="sm" className='cursor-pointer'>
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 cursor-pointer">
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
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setIsMembershipOpen(true)}
                    >
                      <Plus size={14} />
                    </Button>
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

      {/* Transaction History Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
            <DialogDescription>Your transaction history and credits usage.</DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {isTransactionsLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No transactions found</div>
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
        </DialogContent>
      </Dialog>

      {/* Membership Dialog */}
      <MembershipDialog open={isMembershipOpen} onOpenChange={setIsMembershipOpen} />
    </>
  );
}
