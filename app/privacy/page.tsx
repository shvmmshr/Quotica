'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="prose prose-lg dark:prose-invert max-w-none"
      >
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <p className="text-muted-foreground mb-6">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          At Quotica, we take your privacy seriously. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
        <p>We may collect information in the following ways:</p>
        <ul className="list-disc pl-6 mb-6">
          <li>
            <strong>Personal Data:</strong> When you register or use our services, we may collect
            your email address, name, and other information you provide.
          </li>
          <li>
            <strong>Usage Data:</strong> We automatically collect information about how you interact
            with our service, including the pages you visit and the features you use.
          </li>
          <li>
            <strong>Cookies and Tracking Technologies:</strong> We use cookies to enhance your
            experience and collect information about your activities on our site.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
        <p>We may use the information we collect for various purposes, including:</p>
        <ul className="list-disc pl-6 mb-6">
          <li>Providing and maintaining our service</li>
          <li>Personalizing your experience</li>
          <li>Communicating with you about updates or changes</li>
          <li>Analyzing usage patterns to improve our service</li>
          <li>Detecting, preventing, and addressing technical or security issues</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Sharing Your Information</h2>
        <p>We may share your information with:</p>
        <ul className="list-disc pl-6 mb-6">
          <li>
            <strong>Service Providers:</strong> Third-party companies who assist us in operating our
            service
          </li>
          <li>
            <strong>Business Partners:</strong> When necessary to provide services you&apos;ve
            requested
          </li>
          <li>
            <strong>Legal Requirements:</strong> To comply with applicable laws or respond to valid
            legal processes
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information. However,
          no electronic transmission or storage system is 100% secure, and we cannot guarantee
          absolute security.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Data Protection Rights</h2>
        <p>
          Depending on your location, you may have certain rights regarding your personal data,
          including:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>The right to access the personal data we hold about you</li>
          <li>The right to request correction of inaccurate data</li>
          <li>The right to request deletion of your data</li>
          <li>The right to restrict or object to our processing of your data</li>
          <li>The right to data portability</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Children&apos;s Privacy</h2>
        <p>
          Our service is not intended for individuals under the age of 13. We do not knowingly
          collect personal information from children under 13. If we discover that a child under 13
          has provided us with personal information, we will delete it immediately.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by
          posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot;
          date.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:privacy@quotica.app" className="text-primary hover:underline">
            privacy@quotica.app
          </a>
          .
        </p>
      </motion.div>
    </div>
  );
}
