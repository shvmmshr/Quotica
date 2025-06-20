import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import {
  ClerkProvider,
  // SignedIn,
  // SignedOut,
  // SignInButton,
  // SignUpButton,
  // UserButton,
} from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import Header from '@/components/Header';
import { Analytics } from '@vercel/analytics/react';
import { CreditsProvider } from './context/creditsContext';
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Quotica - Beautiful Image Generator',
  description: 'Create beautiful images for social media',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <CreditsProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={inter.className}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              enableColorScheme={false}
              disableTransitionOnChange
            >
              <Header /> {/* Use the Header component */}
              {children}
              <Toaster />
            </ThemeProvider>
            <Analytics />
          </body>
          <GoogleAnalytics gaId="G-3KP7E525VS" />
        </html>
      </CreditsProvider>
    </ClerkProvider>
  );
}
