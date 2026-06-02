import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { 
  ChevronDown, 
  Mail, 
  MessageSquare, 
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const faqs = [
  {
    q: "Is Tooleefy really free for all online tools?",
    a: "Yes. Tooleefy is 100% free for individual users. We don't have subscriptions, hidden fees, or premium-only features. Our platform provides high-quality online tools like the invoice maker and QR generator without any payment barriers."
  },
  {
    q: "How does the privacy-first architecture protect my data?",
    a: "Our privacy-first productivity model ensures that all data is processed locally in your browser. When you use our secure business utilities, your sensitive information never leaves your device, providing absolute data sovereignty."
  },
  {
    q: "Do I need an account to use the professional invoice maker?",
    a: "No. You can use our professional invoice maker and entire barcode suite without creating an account. We prioritize no-login productivity to ensure you can work faster and more securely."
  },
  {
    q: "Can I use the high-fidelity QR generator for commercial marketing?",
    a: "Absolutely. Our free online QR code generator creates high-resolution assets suitable for any commercial marketing campaign. Since your marketing data remains unlinked, your business strategy stays private."
  },
  {
    q: "Is the invoice maker compliant with global business standards?",
    a: "Our free invoice generator follows professional accounting layouts accepted globally. While we provide the secure business utilities to generate these documents, we always recommend verifying regional tax requirements with a professional."
  },
  {
    q: "How does the industrial barcode suite handle data serialization?",
    a: "The industrial barcode suite utilizes local browser processing to generate sequences in real-time. It supports standard formats like EAN-13 and Code 128, making it ideal for secure inventory management."
  },
  {
    q: "Why is Tooleefy better than other free online tools?",
    a: "Tooleefy is built on a zero-knowledge principle. Unlike other free online tools that might monetize your habits, we provide secure business utilities where all processing is client-side, ensuring your files never hit the cloud."
  },
  {
    q: "Does the advanced units converter handle technical data?",
    a: "Yes. Our advanced units converter supports specialized engineering, digital data, and standard measurements. Everything is calculated using local browser processing for maximum speed and precision."
  },
  {
    q: "Will my generated professional PDF assets ever expire?",
    a: "Never. Your professional PDF assets are downloaded directly to your local storage. Since we never host or store your files on our servers, there is no technical way for them to expire or be deleted by us."
  },
  {
    q: "Can I use these secure business utilities on mobile devices?",
    a: "Yes. The Tooleefy utility ecosystem is fully responsive. You can generate barcodes, convert units, and manage invoices from any mobile browser with the same local-first security as desktop."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div className="bg-muted min-h-screen">
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      
      <PageHeader 
        title="Common Questions." 
        description="Explore our Help Center to understand how our privacy-first productivity tools and local browser processing protect your business data."
        badge="FAQ & Documentation"
      />
      
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              
              return (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`border-none shadow-premium rounded-[1.5rem] bg-card overflow-hidden transition-all duration-300 ${isOpen ? 'ring-1 ring-primary/20 bg-background' : 'hover:bg-muted/50'}`}>
                    <button 
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full p-6 md:p-8 flex items-center justify-between text-left group"
                    >
                      <span className={`text-lg md:text-xl font-black tracking-tight transition-colors ${isOpen ? 'text-primary' : 'text-foreground'}`}>
                        {faq.q}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'group-hover:text-foreground'}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 md:px-8 pb-8">
                            <div className="h-px bg-border/50 mb-6" />
                            <p className="text-muted-foreground font-medium leading-relaxed">
                              {faq.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export function Contact() {
  return (
    <div className="bg-background min-h-screen">
      <PageHeader 
        title="Get in Touch." 
        description="Need custom tools or have an enterprise inquiry? Our team is ready to help you optimize your business workflows."
        badge="Contact Us"
      />
      
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5 space-y-12">
               <div className="space-y-4">
                  <h2 className="text-4xl font-black text-foreground tracking-tighter">Let's talk business.</h2>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    We're building the next generation of local-first productivity. Join the movement or let us build a custom solution for your enterprise.
                  </p>
               </div>
               
               <div className="space-y-8">
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Email Support</div>
                      <div className="text-lg font-black text-foreground">contact@tooleefy.com</div>
                    </div>
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Live Chat</div>
                      <div className="text-lg font-black text-foreground">Available 24/7 for Enterprise</div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-7">
               <Card className="p-12 border-none shadow-premium rounded-[3rem] bg-muted">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                        <Input placeholder="John Doe" className="h-14 rounded-2xl bg-background border-none shadow-sm font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                        <Input type="email" placeholder="john@company.com" className="h-14 rounded-2xl bg-background border-none shadow-sm font-bold" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subject</Label>
                      <Input placeholder="Enterprise Licensing" className="h-14 rounded-2xl bg-background border-none shadow-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Message</Label>
                      <textarea 
                         className="w-full min-h-[160px] p-6 text-sm font-medium rounded-2xl bg-background border-none shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                        placeholder="Tell us what you're looking for..."
                      />
                    </div>
                    <Button className="w-full h-16 bg-primary text-white font-black uppercase tracking-widest rounded-[1.5rem] shadow-premium hover:bg-secondary gap-3">
                      Send Message <Send className="w-5 h-5" />
                    </Button>
                  </form>
               </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
