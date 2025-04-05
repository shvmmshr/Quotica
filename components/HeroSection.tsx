'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { Button } from './ui/button';
import { ArrowRight, Image as ImageIcon, Sparkles } from 'lucide-react';
import Lenis from 'lenis';
import { Hero } from './blocks/hero';

const HeroSection: React.FC = () => {
  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      // Clean up
      lenis.destroy();
    };
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="flex flex-col items-center w-full">
      <Hero
        title={
          <div className="flex flex-col items-center gap-2">
            <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 dark:from-primary dark:to-blue-400">
              Transform Your Thoughts
            </h1>
            <h1>Into Beautiful Images</h1>
          </div>
        }
        subtitle="Generate stunning, eye-catching images from your thoughts with just a few clicks. Perfect for social media, presentations, or any creative project."
        actions={[
          {
            label: 'Chat Now',
            href: '/chat',
            variant: 'default',
          },
          {
            label: 'View Pricing',
            href: '#pricing',
            variant: 'outline',
          },
        ]}
      />

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-4">
            Create Beautiful Quote Images with AI
          </motion.h2>
          <motion.p variants={fadeIn} className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Quotica uses advanced AI to generate stunning visuals that match your quotes perfectly.
            Stand out on social media with images that capture attention.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6"
          variants={staggerChildren}
        >
          <motion.div
            className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            variants={featureVariants}
            whileHover={{
              y: -5,
              transition: { duration: 0.2 },
            }}
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Image Generation</h3>
            <p className="text-muted-foreground">
              Turn your quotes into captivating images with our AI-powered generator. Create unique
              visuals in seconds.
            </p>
          </motion.div>

          <motion.div
            className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            variants={featureVariants}
            whileHover={{
              y: -5,
              transition: { duration: 0.2 },
            }}
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Customizable Styles</h3>
            <p className="text-muted-foreground">
              Choose from a variety of styles, themes, and moods to match your brand or message
              perfectly.
            </p>
          </motion.div>

          <motion.div
            className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            variants={featureVariants}
            whileHover={{
              y: -5,
              transition: { duration: 0.2 },
            }}
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Download</h3>
            <p className="text-muted-foreground">
              Generate and download high-quality images instantly. Ready for social media,
              presentations, or any digital use.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mt-16"
        >
          <SignedIn>
            <Link href="/chat">
              <Button size="lg" className="rounded-full px-8">
                Start Creating <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button size="lg" className="rounded-full px-8">
                Sign In to Create <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SignInButton>
          </SignedOut>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
