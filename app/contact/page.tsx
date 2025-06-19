'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FeedbackSchema, FeedbackSchemaType } from '@/types/contact';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
type ApiSuccessResponse = {
  success: true;
  message: string;
};

type ApiErrorResponse = {
  success: false;
  error: string;
};

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;
export default function ContactUs() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<FeedbackSchemaType>({
    resolver: zodResolver(FeedbackSchema),
    defaultValues: {
      name: '',
      email: '',
      feedback: '',
      honeypot: '',
    },
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const onSubmit: SubmitHandler<FeedbackSchemaType> = async (data) => {
    try {
      // Honeypot check
      if (data.honeypot) {
        throw new Error('Bot submission detected');
      }

      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.success ? result.message : result.error);
      }

      toast.success('Message sent successfully! We will get back to you soon.');
      reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An error occurred. Please try again later.';
      toast.error(message);

      // Set form error for honeypot
      if (message.includes('Bot')) {
        setError('root', { message });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Have questions or feedback? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground">
                We&apos;re here to help and answer any questions you might have. We look forward to
                hearing from you.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <a
                      href="mailto:priyabrata8558@gmail.com"
                      className="text-primary hover:underline"
                    >
                      priyabrata8558@gmail.com
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll respond as soon as possible
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Support Hours</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <a href="tel:+919153238346" className="text-primary hover:underline">
                      +91 91532 38346
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground">Monday - Friday: 9AM - 5PM EST</p>
                  <p className="text-sm text-muted-foreground">
                    Weekend support available for premium users
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6 shadow-sm">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="bg-primary/10 text-primary p-3 rounded-full mx-auto w-fit mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Message Sent!</h3>
                <p className="text-muted-foreground mb-4">
                  Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input type="hidden" aria-hidden="true" {...register('honeypot')} />
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Your Name
                  </label>
                  <input
                    {...register('name')}
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    // name="email"
                    type="email"
                    required
                    {...register('email')}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    // name="subject"
                    required
                    {...register('subject')}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    // name="message"
                    rows={5}
                    required
                    {...register('feedback')}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                {errors.feedback && (
                  <p className="mt-1 text-sm text-red-500">{errors.feedback.message}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
