
'use client';

import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <motion.div
      className="container mx-auto max-w-4xl py-12 md:py-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-12">
        <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-foreground">
        <p>
          Welcome to Chefs' BD. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
        </p>

        <h2 className="font-headline text-2xl font-bold">1. Information We Collect</h2>
        <p>
          We may collect personal information such as your name, email address, phone number, and delivery address when you register an account, place an order, or communicate with us. For sellers, we may also collect shop information.
        </p>

        <h2 className="font-headline text-2xl font-bold">2. How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul>
            <li>Provide, operate, and maintain our services.</li>
            <li>Process your transactions and manage your orders.</li>
            <li>Improve, personalize, and expand our services.</li>
            <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the app, and for marketing and promotional purposes.</li>
            <li>Send you emails and notifications.</li>
        </ul>

        <h2 className="font-headline text-2xl font-bold">3. Sharing Your Information</h2>
        <p>
          We do not sell your personal information. We may share information with third-party vendors and service providers that perform services for us, such as payment processing and delivery services. We may also share information with sellers to facilitate order fulfillment.
        </p>
        
        <h2 className="font-headline text-2xl font-bold">4. Security of Your Information</h2>
        <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
        </p>
        
        <h2 className="font-headline text-2xl font-bold">5. Changes to This Privacy Policy</h2>
        <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
        </p>

        <h2 className="font-headline text-2xl font-bold">6. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at orjon220@gmail.com.
        </p>
      </div>
    </motion.div>
  )
}
