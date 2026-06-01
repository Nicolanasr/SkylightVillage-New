"use client";

import React, { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const faqs: FAQItem[] = [
    {
      id: "faq-1",
      question: "What altitude is Skylight Village Jaj and how is the weather?",
      answer: "Skylight Village is perched at 1,200m altitude in Jaj, Mount Lebanon. This unique elevation places us above the coastal humidity, offering exceptionally clean, crisp air and cool breezes during hot summer nights. Temperatures range from 15°C to 25°C, making it a perfect retreat.",
    },
    {
      id: "faq-2",
      question: "Are there restrooms, fresh water, and showers on-site?",
      answer: "Yes, comfort is a key priority. We offer hygienic modern facilities including clean private toilets, sinks, fresh local mountain spring water access, and warm showers for campground guests, individual spots, and wooden tent occupants alike.",
    },
    {
      id: "faq-3",
      question: "Do you have capacity constraints for active scout troops and groups?",
      answer: "Yes, our Scout Camping Areas (Zone 1 & Zone 2) require a minimum capacity of 50 members and can accommodate up to 250 members. This ensures large groups have exclusive boundaries, campfire pits, and designated wilderness boundaries to coordinate exercises.",
    },
    {
      id: "faq-4",
      question: "Can I dine in the mountain restaurant without booking a stay?",
      answer: "Absolutely! Our traditional restaurant is open to all visitors. We serve premium charcoal-grilled platters, fresh cold valley mezze, local cold beers, traditional double-apple shisha, and Touma arak. You can book an indoor fireplace or valley terrace dining table in advance.",
    },
    {
      id: "faq-5",
      question: "How does the custom check-in date selection and calendar availability work?",
      answer: "Our booking calendar matches real-time SQLite database bookings. If any date or wooden tent is already booked, it is marked as 'Not Available' in red. You can easily click your check-in date, hover/click your checkout date, and rent premium tents or sleeping bags instantly.",
    },
    {
      id: "faq-6",
      question: "Are your stargazing peak nights and gatherings open to children?",
      answer: "Yes! Family-friendly experiences are central to Skylight Village. We feature dedicated tables in our Playground restaurant zone, and our stargazing expeditions offer professional telescopes led by stargazing experts to inspire children and adults alike.",
    },
  ];

  // Dynamically compile JSON-LD schema for SEO
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-skylight-green-light/20 border-t border-gray-100">
      {/* Inject Schema JSON-LD for Google Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <div className="container mx-auto max-w-4xl">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-skylight-green-light border border-skylight-green/10 text-skylight-green text-[9px] font-bold uppercase tracking-widest mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-skylight-gold" />
            Curated Knowledge Base
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-skylight-green">
            Frequently Asked Queries
          </h2>
          <p className="text-xs text-gray-500 font-light mt-2 leading-relaxed">
            Everything you need to know about altitude weather, campground boundaries, tables, shisha, and stargazing ticket availability.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-skylight-green/10 shadow-sm overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-display font-extrabold text-sm text-skylight-green hover:bg-[#fafbfa] transition-colors"
                >
                  <span>{faq.question}</span>
                  <span className="p-1 rounded-lg bg-skylight-green-light text-skylight-green flex-shrink-0 ml-4 transition-all">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-40 border-t border-gray-50 p-5 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  <p className="text-xs text-gray-500 leading-relaxed font-light">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
