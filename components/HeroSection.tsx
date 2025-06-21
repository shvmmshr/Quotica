'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { Button } from './ui/button';
import { Sparkles, MousePointerClick, ChevronDown, PenTool, Layout, Lightbulb } from 'lucide-react';
import Lenis from 'lenis';
import { Hero } from './blocks/hero';
import Image from 'next/image';
import { ArrowTopRightIcon } from '@radix-ui/react-icons';

const HeroSection: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const thoughtsRef = useRef<HTMLDivElement>(null);
  const adsRef = useRef<HTMLDivElement>(null);
  const isThoughtsInView = useInView(thoughtsRef, { once: false, amount: 0.3 });
  const isAdsInView = useInView(adsRef, { once: false, amount: 0.3 });
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const images = [
    { src: '/images/cat.jpeg', text: 'Ghibli style cat image' },
    { src: '/images/friends.jpeg', text: 'Real photo converted to Ghibli' },
    { src: '/images/shoe2.png', text: 'Nike Advertisement' },
  ];

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.8], [0, 70]);

  // Initialize Lenis for smooth scrolling with optimized settings
  useEffect(() => {
    if (isMobile) {
      document.body.style.scrollBehavior = 'auto';

      const timer = setTimeout(() => {
        setShowScrollIndicator(false);
      }, 5000);

      return () => clearTimeout(timer);
    }

    const lenis = new Lenis({
      duration: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      syncTouch: true,
      touchMultiplier: 1.0,
      infinite: false,
      gestureOrientation: 'vertical',
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const checkScroll = () => {
      const scrollY = lenis.scroll;
      const maxScroll = lenis.limit; // Total scrollable height
      const buffer = 10; // px from bottom before hiding

      if (scrollY >= maxScroll - buffer) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    // Listen to Lenis scroll events
    lenis.on('scroll', checkScroll);
    checkScroll(); // Initial check

    return () => {
      lenis.destroy();
    };
  }, [isMobile]);

  const handleScrollDown = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  // const featureVariants = {
  //   hidden: { opacity: 0, y: 30 },
  //   visible: {
  //     opacity: 1,
  //     y: 0,
  //     transition: {
  //       duration: 0.5,
  //       ease: 'easeOut',
  //     },
  //   },
  // };

  // const pulseAnimation = {
  //   initial: { scale: 1 },
  //   animate: {
  //     scale: [1, 1.03, 1],
  //     transition: {
  //       duration: 3,
  //       repeat: Infinity,
  //       ease: 'easeInOut',
  //     },
  //   },
  // };

  // Example images
  // const exampleImages = ['/example-1.jpg', '/example-2.jpg', '/example-3.jpg'];

  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      <div ref={targetRef} className="w-full">
        {/* Scroll indicator */}
        <AnimatePresence>
          {showScrollIndicator && (
            <motion.div
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 2, duration: 0.6 }}
              onClick={handleScrollDown}
            >
              <span className="text-sm text-muted-foreground">Scroll Down</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronDown className="h-6 w-6 text-primary cursor-pointer" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Parallax effect on hero section - reduced on mobile */}
        <motion.div
          style={!isMobile ? { opacity, scale, y } : {}}
          className="w-full will-change-transform"
        >
          {/* Hero Background with animated gradient - disabled on mobile for better performance */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-0 w-full h-full">
              <motion.div
                className="w-1/2 h-1/2 bg-primary/10 rounded-full filter blur-3xl will-change-transform"
                animate={
                  !isMobile
                    ? {
                        x: [0, 50, -30, 0],
                        y: [0, -30, 50, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 30, // Slower animation for less CPU usage
                  repeat: isMobile ? 0 : Infinity,
                  ease: 'linear',
                }}
              />
              <motion.div
                className="absolute top-1/3 right-1/4 w-1/3 h-1/3 bg-purple-500/10 rounded-full filter blur-3xl will-change-transform"
                animate={
                  !isMobile
                    ? {
                        x: [0, -40, 60, 0],
                        y: [0, 60, -40, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 28,
                  repeat: isMobile ? 0 : Infinity,
                  ease: 'linear',
                }}
              />
              <motion.div
                className="absolute bottom-1/4 left-1/3 w-1/4 h-1/4 bg-blue-500/10 rounded-full filter blur-3xl will-change-transform"
                animate={
                  !isMobile
                    ? {
                        x: [0, 70, -50, 0],
                        y: [0, -50, 70, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 32,
                  repeat: isMobile ? 0 : Infinity,
                  ease: 'linear',
                }}
              />
            </div>
          </div>

          <Hero
            title={
              <div className="flex flex-col items-center gap-2 relative">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.12,
                      },
                    },
                  }}
                  className="flex flex-wrap justify-center"
                >
                  <motion.h1
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5 },
                      },
                    }}
                    className="text-center text-4xl sm:text-6xl md:text-7xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#480277] to-[#9900ff] dark:from-primary dark:via-blue-200 dark:to-blue-400 leading-tight"
                  >
                    Transform Your Thoughts
                  </motion.h1>
                </motion.div>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.12,
                        delayChildren: 0.3,
                      },
                    },
                  }}
                  className="flex flex-wrap justify-center"
                >
                  <motion.h1
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5 },
                      },
                    }}
                    className="text-center text-4xl sm:text-6xl md:text-7xl font-bold"
                  >
                    Into Beautiful Images
                  </motion.h1>
                </motion.div>

                {/* Floating elements */}
                <motion.div
                  className="absolute -right-16 top-0 hidden md:block"
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Sparkles className="h-12 w-12 text-primary/30" />
                </motion.div>
                <motion.div
                  className="absolute -left-14 bottom-2 hidden md:block"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, -5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                >
                  <MousePointerClick className="h-10 w-10 text-primary/30" />
                </motion.div>
              </div>
            }
            subtitle={
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-base sm:text-lg md:text-xl text-center max-w-3xl mx-auto leading-relaxed text-muted-foreground"
              >
                Generate stunning, eye-catching images and ads from your thoughts with just a few
                clicks. Perfect for marketing, social media, presentations, or any creative project.
              </motion.p>
            }
            actions={[
              {
                Label: (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="gap-2 px-6 rounded-full bg-primary hover:bg-primary/90 cursor-pointer"
                    >
                      Chat Now <ArrowTopRightIcon className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ),
                href: '/chat',
                variant: 'custom',
              },
              {
                Label: (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 px-6 rounded-full cursor-pointer"
                    >
                      View Pricing
                    </Button>
                  </motion.div>
                ),
                href: '#pricing',
                variant: 'custom',
              },
            ]}
          />

          {/* Example images */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-12 sm:mt-16 mb-16 sm:mb-24 container max-w-6xl mx-auto px-4 flex justify-center items-center"
          >
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {images.map((img, index) => (
                <motion.div
                  key={index}
                  className={`relative rounded-lg overflow-hidden shadow-lg ${
                    index === 1 ? 'md:mt-10' : ''
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.5 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                >
                  <div className="bg-card w-[280px] h-[187px] sm:w-[300px] sm:h-[200px] md:w-[320px] md:h-[220px] rounded-lg overflow-hidden relative">
                    <Image
                      src={img.src}
                      alt={img.text}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                    <div className="absolute bottom-0 w-full bg-black/50 text-white text-sm text-center py-2">
                      {img.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Thoughts to Images Section */}
      <section
        id="thoughts-section"
        ref={thoughtsRef}
        className="w-full py-16 sm:py-24 bg-gradient-to-b from-background to-primary/5"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="w-full lg:w-1/2"
              initial="hidden"
              animate={isThoughtsInView ? 'visible' : 'hidden'}
              variants={staggerChildren}
            >
              <motion.div
                variants={fadeInUp}
                className="relative bg-card rounded-xl overflow-hidden shadow-xl p-2 border border-border/40"
              >
                <div className="rounded-lg aspect-video bg-card relative overflow-hidden">
                  <Image
                    src={'/images/ghibli1.webp'}
                    alt={'A family in Ghibli style'}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-semibold">
                      &quot;Create an image of a family in Ghibli style&quot;
                    </p>
                    <p className="text-sm text-white/80">AI Generated Image</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="w-full lg:w-1/2"
              initial="hidden"
              animate={isThoughtsInView ? 'visible' : 'hidden'}
              variants={staggerChildren}
            >
              <motion.span
                variants={fadeInUp}
                className="text-sm font-semibold text-primary uppercase tracking-wider"
              >
                Effortless Creation
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                From Your Thoughts to Stunning Images
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg text-muted-foreground mb-6 leading-relaxed"
              >
                Just describe what you want in natural language, and our AI will transform your
                thoughts into beautiful, professional-quality images. No design skills needed.
              </motion.p>

              <motion.div variants={staggerChildren} className="space-y-5">
                <motion.div variants={fadeInUp} className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Instant Visualization</h3>
                    <p className="text-muted-foreground">
                      See your ideas come to life in seconds with just a text description
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Layout className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Unlimited Creativity</h3>
                    <p className="text-muted-foreground">
                      Generate as many variations as you need until you find the perfect image
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Smart Suggestions</h3>
                    <p className="text-muted-foreground">
                      Get intelligent recommendations to enhance your images
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-8">
                <SignedIn>
                  <Link href="/chat">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block"
                    >
                      <Button
                        size="lg"
                        className="rounded-full px-8 bg-primary hover:bg-primary/90 cursor-pointer"
                      >
                        Try It Now <ArrowTopRightIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block"
                    >
                      <Button
                        size="lg"
                        className="rounded-full px-8 bg-primary hover:bg-primary/90 cursor-pointer"
                      >
                        Sign In to Try <ArrowTopRightIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </SignInButton>
                </SignedOut>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ad Generation Section */}
      <section
        id="ads-section"
        ref={adsRef}
        className="w-full py-16 sm:py-24 bg-gradient-to-b from-primary/5 to-background"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="w-full lg:w-1/2 order-2 lg:order-1"
              initial="hidden"
              animate={isAdsInView ? 'visible' : 'hidden'}
              variants={staggerChildren}
            >
              <motion.span
                variants={fadeInUp}
                className="text-sm font-semibold text-primary uppercase tracking-wider"
              >
                Powerful Ad Creation
              </motion.span>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mt-2 mb-6">
                Generate Stunning Ads From a Simple Sketch
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg text-muted-foreground mb-6 leading-relaxed"
              >
                Turn your rough ideas or simple sketches into professional, attention-grabbing
                advertisements. Perfect for social media, digital marketing, and promotional
                materials.
              </motion.p>

              <motion.div variants={staggerChildren} className="space-y-5">
                <motion.div variants={fadeInUp} className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <PenTool className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">From Sketch to Ad</h3>
                    <p className="text-muted-foreground">
                      Upload a simple sketch or describe your concept and watch it transform
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Layout className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Multi-format Support</h3>
                    <p className="text-muted-foreground">
                      Create ads for any platform - social media, web banners, print materials
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Campaign Consistency</h3>
                    <p className="text-muted-foreground">
                      Generate multiple variations while maintaining your brand identity
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-8">
                <SignedIn>
                  <Link href="/chat">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block"
                    >
                      <Button
                        size="lg"
                        className="rounded-full px-8 bg-primary hover:bg-primary/90 cursor-pointer"
                      >
                        Create Ads Now <ArrowTopRightIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block"
                    >
                      <Button
                        size="lg"
                        className="rounded-full px-8 bg-primary hover:bg-primary/90 cursor-pointer"
                      >
                        Sign In to Create <ArrowTopRightIcon className="ml-2 h-4 w-4 " />
                      </Button>
                    </motion.div>
                  </SignInButton>
                </SignedOut>
              </motion.div>
            </motion.div>

            <motion.div
              className="w-full lg:w-1/2 order-1 lg:order-2"
              initial="hidden"
              animate={isAdsInView ? 'visible' : 'hidden'}
              variants={staggerChildren}
            >
              <motion.div
                variants={fadeInUp}
                className="relative bg-card rounded-xl overflow-hidden shadow-xl p-2 border border-border/40"
              >
                <div className="rounded-lg aspect-video bg-card relative overflow-hidden">
                  <Image
                    src={'/images/shoe1.webp'}
                    alt={'Ad for a Nike Shoe'}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-semibold">&quot;Create a Stunning Ad of a Nike Shoe&quot;</p>
                    <p className="text-sm text-white/80">AI Generated Ad</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
