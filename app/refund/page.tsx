'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function RefundPolicy() {
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
        <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>

        <p className="text-muted-foreground mb-6">
          Last Updated: {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Eligibility for Refunds</h2>
        <p>
          At Quotica, we strive to ensure your satisfaction with our premium services. This refund
          policy outlines the conditions under which we offer refunds for purchases made on our
          platform.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Subscription Refunds</h2>
        <p>For subscription-based purchases:</p>
        <ul className="list-disc pl-6 mb-6">
          <li>
            <strong>Monthly Subscriptions:</strong> You may request a full refund within 7 days of
            your initial purchase if you are not satisfied with our service. No refunds will be
            issued after this period.
          </li>
          <li>
            <strong>Annual Subscriptions:</strong> You may request a full refund within 14 days of
            your initial purchase. After this period, you may be eligible for a partial refund
            calculated on a pro-rata basis for the unused portion of your subscription.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. One-Time Purchases</h2>
        <p>For one-time purchases of premium features or content:</p>
        <ul className="list-disc pl-6 mb-6">
          <li>
            You may request a refund within 7 days of purchase if you have not used or downloaded
            the purchased item.
          </li>
          <li>
            Once you have used or downloaded the purchased item, refunds will be considered on a
            case-by-case basis.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Exceptions</h2>
        <p>Refunds will not be provided in the following circumstances:</p>
        <ul className="list-disc pl-6 mb-6">
          <li>After the specified refund period has expired</li>
          <li>For accounts that have violated our Terms of Service</li>
          <li>For promotional or discounted purchases, unless required by law</li>
          <li>For subscription cancellations after the refund eligibility period</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. How to Request a Refund</h2>
        <p>To request a refund:</p>
        <ol className="list-decimal pl-6 mb-6">
          <li>Log into your Quotica account</li>
          <li>Go to Account Settings &gt; Billing</li>
          <li>Select the purchase you wish to refund</li>
          <li>Click on &quot;Request Refund&quot; and follow the prompts</li>
        </ol>
        <p>
          Alternatively, you can contact our support team at{' '}
          <a href="mailto:refunds@quotica.app" className="text-primary hover:underline">
            refunds@quotica.app
          </a>{' '}
          with your purchase details.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Processing Time</h2>
        <p>
          Refund requests are typically processed within 3-5 business days. Once approved, please
          allow 5-10 business days for the refund to appear on your original payment method.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Changes to This Policy</h2>
        <p>
          We reserve the right to modify this refund policy at any time. Changes will be effective
          immediately upon posting to our website with an updated &quot;Last Updated&quot; date.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
        <p>
          If you have any questions about our refund policy, please contact our support team at{' '}
          <a href="mailto:refunds@quotica.app" className="text-primary hover:underline">
            refunds@quotica.app
          </a>
          .
        </p>
      </motion.div>
    </div>
  );
}
