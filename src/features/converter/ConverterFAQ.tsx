import React, { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is the Business & Rate Converter?",
    answer: "The Business & Rate Converter is a sophisticated digital calculation engine designed to convert currency exchange rates, cryptocurrencies, and standard business metrics with absolute precision. Our tool supports real-time market data alongside standard conversion indexes for corporate, legal, and banking requirements."
  },
  {
    question: "How do I calculate real-time exchange rates?",
    answer: "To convert global currency or cryptocurrency assets, simply select the Currency or Crypto categories from the sidebar or dropdown list. Our system fetches the latest market mid-point rates dynamically to give you up-to-the-minute precision for business trade, pricing sheets, or travel budgets."
  },
  {
    question: "Are these conversion calculations secure for proprietary financial data?",
    answer: "Yes, our Business & Rate Converter is built with total privacy. All calculation logic is processed locally inside your browser—no financial, banking, or transactional values are ever transmitted to external servers or logged in databases."
  },
  {
    question: "Does the rate converter support offline calculations?",
    answer: "Yes, the tool caches essential algorithms and standard scaling ratios locally so you can calculate business dimensions, physical conversion factors, and key units even without an active internet connection. Dynamic market rates (currencies and crypto) require a live connection to refresh to current prices."
  },
  {
    question: "Why should I use a professional business rate calculator?",
    answer: "A professional business and rate engine eliminates rounding errors and manual calculation mistakes. It provides a clean, unified workflow for currencies, digital assets, and essential metrics, offering a highly responsive, streamlined layout designed for both desktop and mobile business environments."
  }
];

export const ConverterFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-24 mb-16 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Technical Support</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
          Business & Rate Conversion FAQ
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Get expert answers about exchange rates, secure computing, and how to optimize your financial workflows.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className={cn(
              "border rounded-2xl overflow-hidden transition-all duration-300",
              openIndex === index 
                ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10 shadow-lg shadow-emerald-500/5" 
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-emerald-200 dark:hover:border-emerald-800"
            )}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
              <span className={cn(
                "text-base md:text-lg font-bold tracking-tight transition-colors",
                openIndex === index ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
              )}>
                {faq.question}
              </span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ChevronDown className={cn(
                  "w-5 h-5 transition-colors",
                  openIndex === index ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                )} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};
