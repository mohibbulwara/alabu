
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from 'framer-motion';

const faqItems = [
    {
        question: "How do I place an order?",
        answer: "To place an order, simply browse our products, add your desired items to the cart, and proceed to checkout. You'll need to provide your delivery address and contact information to complete the purchase."
    },
    {
        question: "What are the delivery charges?",
        answer: "Delivery charges vary based on your location and the seller's location. The final shipping cost is calculated at checkout once you provide your delivery address and select a delivery zone."
    },
    {
        question: "How can I become a seller?",
        answer: "To become a seller, you can register for a new account and choose the 'Seller' role during the signup process. You'll need to provide some additional details about your shop."
    },
    {
        question: "Is there a return policy?",
        answer: "Due to the nature of food products, we generally do not accept returns. However, if you have an issue with your order, please contact our support team immediately, and we will do our best to resolve it."
    },
    {
        question: "How do I track my order?",
        answer: "Once you place an order, you can view its status ('Pending', 'Preparing', 'Delivered') in the 'My Orders' section of your profile."
    }
]

export default function FAQPage() {
  return (
    <motion.div
      className="container mx-auto max-w-4xl py-12 md:py-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mt-2">
          Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
        </p>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, index) => (
             <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-lg text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                    {item.answer}
                </AccordionContent>
            </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  )
}
