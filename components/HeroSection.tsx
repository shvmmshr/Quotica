"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Lenis from "lenis";

// Component for a single shooting star
interface ShootingStarProps {
  delay: number;
  top: number;
  left: number;
  size: number;
  rotation: number;
  speed: number;
  trail: number;
  color: string;
}

const ShootingStar = ({
  delay = 0,
  top,
  left,
  size,
  rotation,
  speed = 1.8,
  trail,
  color = "white",
}: ShootingStarProps) => {
  // Calculate trail effect
  const trailOpacity = 0.8 - size * 0.1; // Smaller stars have more visible trails
  const glowSize = size * 2.5;

  return (
    <motion.div
      className="absolute z-0"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        transform: `rotate(${rotation}deg)`,
      }}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: [0, 1, 0.8, 0],
      }}
      transition={{
        duration: speed,
        delay,
        ease: "easeInOut",
      }}
    >
      {/* Star head */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          boxShadow: `0 0 ${glowSize}px ${glowSize / 2}px rgba(255,255,255,${
            trailOpacity + 0.2
          })`,
          zIndex: 2,
        }}
        initial={{
          x: 0,
          y: 0,
        }}
        animate={{
          x: trail,
          y: trail,
        }}
        transition={{
          duration: speed,
          delay,
          ease: [0.2, 0.2, 0.3, 1], // Custom cubic bezier for more realistic motion
        }}
      />

      {/* Star trail */}
      <motion.div
        className="absolute origin-top-left"
        style={{
          width: `${trail}px`,
          height: `${size / 1.2}px`,
          background: `linear-gradient(to right, transparent, ${color}40 30%, ${color}80)`,
          filter: "blur(0.8px)",
        }}
        initial={{
          scaleX: 0,
          opacity: 0,
        }}
        animate={{
          scaleX: 1,
          opacity: [0, trailOpacity, 0],
        }}
        transition={{
          duration: speed,
          delay,
          ease: [0.2, 0.2, 0.3, 1],
        }}
      />
    </motion.div>
  );
};

const HeroSection: React.FC = () => {
  const { theme } = useTheme();
  const [stars, setStars] = useState<
    {
      id: number;
      delay: number;
      top: number;
      left: number;
      size: number;
      rotation: number;
      speed: number;
      trail: number;
      color: string;
    }[]
  >([]);

  // Setup shooting stars that appear more frequently with better distribution
  useEffect(() => {
    let count = 0;
    let timerId: NodeJS.Timeout;
    let activeShoots = 0;
    const maxConcurrentStars = 3; // Allow up to 3 stars at once

    // Star colors
    const starColors = ["#ffffff", "#f5f5ff", "#ebebff", "#e6f7ff", "#fff5f0"];

    const createStar = () => {
      // Limit concurrent stars
      if (activeShoots >= maxConcurrentStars) {
        timerId = setTimeout(createStar, 400);
        return;
      }

      activeShoots++;

      // Create star with better parameters
      const speed = 1.4 + Math.random() * 1.2; // Speed between 1.4-2.6
      const size = 1.5 + Math.random() * 3; // Size between 1.5-4.5px
      const trail = 150 + Math.random() * 100; // Trail between 150-250px

      const newStar = {
        id: count++,
        delay: 0,
        top: Math.random() * 70, // Random vertical position in top 70%
        left: Math.random() * 40, // Wider horizontal distribution
        size,
        rotation: 25 + Math.random() * 35, // More varied rotation between 25-60 degrees
        speed,
        trail,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      };

      setStars((prev) => [...prev, newStar]);

      // Remove star after animation completes + buffer
      setTimeout(() => {
        setStars((prev) => prev.filter((star) => star.id !== newStar.id));
        activeShoots--;
      }, (speed + 0.5) * 1000);

      // Schedule next star with more varied timing
      const nextStarDelay = 800 + Math.random() * 1200; // Between 0.8-2 seconds
      timerId = setTimeout(createStar, nextStarDelay);
    };

    // Start multiple stars with staggered timing for a more natural effect
    timerId = setTimeout(createStar, 500);

    // Start a second star slightly delayed
    setTimeout(() => {
      if (activeShoots < maxConcurrentStars) {
        createStar();
      }
    }, 1200);

    return () => {
      clearTimeout(timerId);
    };
  }, []);

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
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
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      className={`relative ${
        theme === "dark"
          ? "bg-background text-foreground"
          : "bg-background text-foreground"
      } min-h-screen flex flex-col items-center justify-center w-full overflow-hidden`}
    >
      {/* Subtle background elements with animation */}
      <div className="absolute inset-0 w-full overflow-hidden">
        {/* Shooting stars */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"></div>

        <motion.div
          className={`absolute top-20 left-10 w-64 h-64 rounded-full ${
            theme === "dark" ? "bg-primary/20" : "bg-primary/10"
          } opacity-30 blur-3xl`}
          animate={{
            x: [0, 20, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={`absolute bottom-40 right-20 w-96 h-96 rounded-full ${
            theme === "dark" ? "bg-primary/20" : "bg-primary/10"
          } opacity-40 blur-3xl`}
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content Container */}
      <motion.div
        className="container mx-auto max-w-7xl relative z-10 px-4 md:px-6"
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
      >
        <motion.div className="text-center mb-12" variants={fadeIn}>
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight"
            variants={fadeIn}
          >
            Transform your thoughts into{" "}
            <span className="text-purple-500">beautiful quotes</span>
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
            variants={fadeIn}
          >
            Create stunning, shareable quote images with Quotica. Customize
            fonts, colors, backgrounds, and leverage AI-powered design
            suggestions.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-5 justify-center"
            variants={fadeIn}
          >
            <Link
              href="/editor"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center"
              >
                Create Your Quote
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.span>
            </Link>
            <Link
              href="/chat"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center"
              >
                Create Your Image
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Demo Preview with animation */}
        <motion.div
          className="relative mx-auto mt-10 mb-16 max-w-4xl"
          variants={fadeIn}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div
            className="relative bg-card p-6 rounded-xl shadow-xl"
            whileHover={{
              y: -5,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/editor.png"
                alt="Quote image example"
                width={1200}
                height={675}
                className="object-cover"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJcg9FHqwAAAABJRU5ErkJggg=="
                priority
              />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                {/* <motion.div
                  className="bg-background/80 backdrop-blur-sm p-6 md:p-8 rounded-lg max-w-md text-center shadow-lg"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  
                </motion.div> */}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features with staggered animation */}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Customizable Design</h3>
            <p className="text-muted-foreground">
              Choose from a variety of fonts, colors, and backgrounds to create
              the perfect quote image that matches your style.
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              AI-Powered Suggestions
            </h3>
            <p className="text-muted-foreground">
              Get intelligent design recommendations for backgrounds, color
              palettes, and font pairings based on your quote.
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Export Options</h3>
            <p className="text-muted-foreground">
              Download your quotes as high-quality images or share them directly
              to your social media platforms.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
