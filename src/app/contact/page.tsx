
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MapCard from "@/components/map-card";
import { Mail, Phone, Send } from "lucide-react";
import { motion } from 'framer-motion';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:orjon220@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    
    toast({
        title: "Opening Email Client",
        description: "Please complete sending your message in your email application.",
    });

    window.location.href = mailtoLink;
  };

  return (
    <motion.div
      className="container mx-auto py-12 md:py-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">Get in Touch</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          We'd love to hear from you! Whether you have a question about our service, pricing, or anything else, our team is ready to answer all your questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info and Map */}
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>Our contact details are listed below. We're available during business hours.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <a href="mailto:orjon220@gmail.com" className="flex items-center gap-4 group">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">orjon220@gmail.com</p>
                            <p className="text-sm text-muted-foreground">Email us for any query</p>
                        </div>
                    </a>
                     <a href="tel:01912211748" className="flex items-center gap-4 group">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">01912211748</p>
                            <p className="text-sm text-muted-foreground">Call us for direct support</p>
                        </div>
                    </a>
                </CardContent>
            </Card>
            <MapCard address="Shapla Square, Rangpur, Bangladesh" />
        </div>
        
        {/* Contact Form */}
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>Fill out the form and we will get back to you shortly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input id="name" placeholder="John Doe" required value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Your Email</Label>
                            <Input id="email" type="email" placeholder="john@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="Question about an order" value={subject} onChange={e => setSubject(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Your Message</Label>
                            <Textarea id="message" placeholder="Type your message here..." required rows={5} value={message} onChange={e => setMessage(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full" size="lg">
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </motion.div>
  );
}
