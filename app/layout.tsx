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
import type { Viewport } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Quotica: AI Image Generator',
  description:
    'Create, manage, and share beautiful images instantly. Professional image generation tool for all your needs.',
  keywords: [
    'image generator',
    'image tool',
    'images',
    'image maker',
    'quotica',
    'quotica app',
    'professional images',
    'AI image generator',
    'AI image tool',
    'AI images',
    'AI quotica app',
    'AI professional images',
    'AI image creation',
    'image innovation',
    'image creativity',
    'image technology',
    'image trends',
    'image inspiration',
  ],
  openGraph: {
    title: 'Quotica: Smart Image Generator and Management Tool',
    description: 'Create, manage, and share beautiful images instantly.',
    url: 'https://quotica.fun',
    siteName: 'Quotica',
    images: [
      {
        url: 'https://quotica.fun/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Quotica Interface Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quotica: Smart Image Generator and Management Tool',
    description: 'Create, manage, and share beautiful images instantly',
    images: ['https://quotica.fun/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      'index': true,
      'follow': true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://quotica.fun',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL || '/'}
      afterMultiSessionSingleSignOutUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL || '/'}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
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
