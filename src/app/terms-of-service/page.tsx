
'use client';

import { motion } from 'framer-motion';

export default function TermsOfServicePage() {
  return (
    <motion.div
      className="container mx-auto max-w-4xl py-12 md:py-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-12">
        <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-foreground">
        <h2 className="font-headline text-2xl font-bold">1. Acceptance of Terms</h2>
        <p>
          By accessing and using the Chefs' BD application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
        </p>

        <h2 className="font-headline text-2xl font-bold">2. User Accounts</h2>
        <p>
          When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.
        </p>
        
        <h2 className="font-headline text-2xl font-bold">3. User Conduct</h2>
        <p>
            You agree not to use the service for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the service in any way that could damage the app, services, or general business of Chefs' BD.
        </p>
        
        <h2 className="font-headline text-2xl font-bold">4. Seller-Specific Terms</h2>
        <p>
            Sellers are responsible for the quality and safety of the food products they list. Sellers agree to pay the platform commission on all completed orders. Chefs' BD reserves the right to remove products or suspend seller accounts for violations of our policies.
        </p>

        <h2 className="font-headline text-2xl font-bold">5. Limitation of Liability</h2>
        <p>
            In no event shall Chefs' BD, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
        </p>

        <h2 className="font-headline text-2xl font-bold">6. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws of Bangladesh, without regard to its conflict of law provisions.
        </p>
      </div>
    </motion.div>
  )
}
