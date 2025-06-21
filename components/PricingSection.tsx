'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PricingCard } from '@/components/ui/dark-gradient-pricing';

const PricingSection = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const freeBenefits = [
    { text: 'Gemini for free', checked: true },
    { text: 'Basic image generation', checked: true },
    { text: 'Share on social media', checked: true },
    { text: 'Priority support', checked: false },
    { text: 'Advanced customization', checked: false },
  ];

  const proBenefits = [
    { text: '12500 credits', checked: true },
    { text: 'Advanced image generation', checked: true },
    { text: 'All style options', checked: true },
    { text: 'Share on social media', checked: true },
    { text: 'Priority support', checked: true },
    { text: 'Advanced customization', checked: true },
  ];

  const enterpriseBenefits = [
    { text: 'Unlimited credits', checked: true },
    { text: 'Premium image generation', checked: true },
    { text: 'All style options', checked: true },
    { text: 'Share on social media', checked: true },
    { text: 'Dedicated support', checked: true },
    { text: 'Custom branding', checked: true },
  ];

  return (
    <section id="pricing" className="py-20 bg-muted/30 w-full">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="container mx-auto px-4"
      >
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-4 md:text-4xl tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that&apos;s right for you. All plans include access to our image
            generation tool.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          <PricingCard
            tier="Free"
            price="$0"
            bestFor="Perfect for trying out Quotica"
            CTA="Get Started"
            benefits={freeBenefits}
          />

          <PricingCard
            tier="Pro"
            price="$9.99"
            bestFor="For content creators and social media managers"
            CTA="Upgrade to Pro"
            benefits={proBenefits}
            className="border-primary"
          />

          <PricingCard
            tier="Enterprise"
            price="$49.99"
            bestFor="For businesses and teams"
            CTA="Contact Sales"
            benefits={enterpriseBenefits}
          />
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Need a custom plan?{' '}
            <a href="/contact" className="text-primary underline underline-offset-2">
              Contact us
            </a>{' '}
            for more information.
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default PricingSection;
