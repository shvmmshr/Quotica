'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Github, MonitorIcon, Moon, Sun, Twitter } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Pacifico } from 'next/font/google';

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export default function Footer() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = React.useState(false);

  // After mounting, we have access to the theme
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to determine system button highlighting
  const getSystemButtonClass = () => {
    if (!mounted) return '';

    if (theme === 'system') {
      // If system theme is active, style it based on the resolved theme
      return resolvedTheme === 'light' ? 'bg-white/20' : 'bg-white';
    }

    return '';
  };

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className={`mb-4 text-3xl font-bold tracking-tight ${pacifico.className}`}>
              Quotica
            </h2>
            <p className="mb-6 text-muted-foreground">
              Generate beautiful AI images from your quotes. Perfect for social media,
              presentations, and more.
            </p>
            {/* <form className="relative">
              <Input
                type="email"
                placeholder="Enter your email"
                className="pr-12 backdrop-blur-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form> */}
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2 text-sm">
              <Link href="/" className="block transition-colors hover:text-primary">
                Home
              </Link>
              <Link href="/chat" className="block transition-colors hover:text-primary">
                Chat
              </Link>
              <Link href="/#pricing" className="block transition-colors hover:text-primary">
                Pricing
              </Link>
              <Link href="/contact" className="block transition-colors hover:text-primary">
                Contact
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Legal</h3>
            <nav className="space-y-2 text-sm">
              <Link href="/terms" className="block transition-colors hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/privacy" className="block transition-colors hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/refund" className="block transition-colors hover:text-primary">
                Refund Policy
              </Link>
            </nav>
          </div>
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
            <div className="mb-6 flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => window.open('https://github.com/shvmmshr/quotica', '_blank')}
                    >
                      <Github className="h-4 w-4" />
                      <span className="sr-only">GitHub</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View our GitHub</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => window.open('https://twitter.com/prybruhta', '_blank')}
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Twitter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Theme Toggle - Compact Version */}
            <div className="flex items-center justify-start">
              <div className="flex items-center justify-between rounded-full bg-black/80 dark:bg-white/80 p-1 gap-[2px] backdrop-blur-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full h-8 w-8 ${getSystemButtonClass()} cursor-pointer hover:bg-white/30 dark:hover:bg-white`}
                        onClick={() => setTheme('system')}
                        suppressHydrationWarning
                      >
                        <MonitorIcon className="h-4 w-4 text-gray-200 dark:text-gray-800" />
                        <span className="sr-only">System Theme</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>System</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full h-8 w-8 ${mounted && theme === 'light' ? 'bg-white/20' : ''} cursor-pointer hover:bg-white/30 dark:hover:bg-white`}
                        onClick={() => setTheme('light')}
                        suppressHydrationWarning
                      >
                        <Sun className="h-4 w-4 text-gray-200 dark:text-gray-800" />
                        <span className="sr-only">Light Mode</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Light</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full h-8 w-8 ${mounted && theme === 'dark' ? 'bg-white' : ''} cursor-pointer hover:bg-white/30 dark:hover:bg-white`}
                        onClick={() => setTheme('dark')}
                        suppressHydrationWarning
                      >
                        <Moon className="h-4 w-4 text-gray-200 dark:text-gray-800" />
                        <span className="sr-only">Dark Mode</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Dark</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Quotica. All rights reserved.
          </p>
          {/* <nav className="flex gap-4 text-sm">
            <Link href="/privacy" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/contact" className="transition-colors hover:text-primary">
              Contact Us
            </Link>
          </nav> */}
        </div>
      </div>
    </footer>
  );
}
