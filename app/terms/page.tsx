'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
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
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <p className="text-muted-foreground mb-6">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing or using Quotica&apos;s services, you agree to be bound by these Terms of
          Service. If you do not agree to these terms, please do not use our services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
        <p>
          Quotica provides an online platform for creating, customizing, and sharing quote images.
          Our service includes both free and premium features, which may change over time.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
        <p>
          Some features of our service may require registration. You are responsible for maintaining
          the confidentiality of your account information and for all activities that occur under
          your account.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Content</h2>
        <p>
          You retain all rights to the content you create using our service. However, by uploading
          or creating content, you grant Quotica a non-exclusive, worldwide license to use, store,
          and display your content for the purpose of providing and improving our services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Prohibited Uses</h2>
        <p>
          You agree not to use Quotica for any unlawful purpose or in any way that violates these
          terms. Prohibited activities include but are not limited to:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Creating or sharing content that infringes on intellectual property rights</li>
          <li>Distributing harmful, offensive, or inappropriate content</li>
          <li>Attempting to interfere with the proper functioning of the service</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
        <p>
          Quotica and its content, features, and functionality are owned by us and are protected by
          international copyright, trademark, and other intellectual property laws.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Termination</h2>
        <p>
          We reserve the right to terminate or suspend your account and access to our services for
          violation of these terms or for any other reason deemed appropriate by Quotica.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Disclaimer of Warranties</h2>
        <p>
          The service is provided &quot;as is&quot; without warranties of any kind. We do not
          guarantee that the service will be error-free or uninterrupted.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
        <p>
          Quotica shall not be liable for any indirect, incidental, special, consequential, or
          punitive damages resulting from your use of or inability to use the service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of the service after
          changes constitutes acceptance of the updated terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Governing Law</h2>
        <p>
          These terms shall be governed by and construed in accordance with the laws of the
          jurisdiction in which Quotica operates, without regard to its conflict of law provisions.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">12. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at{' '}
          <a href="mailto:support@quotica.app" className="text-primary hover:underline">
            support@quotica.app
          </a>
          .
        </p>
      </motion.div>
    </div>
  );
}
