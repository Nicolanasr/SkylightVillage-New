import React from "react";
import db from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventBookingForm from "@/components/EventBookingForm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, DollarSign, Users, Award, ShieldCheck, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 0; // Always fetch live availability data

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } });
  if (!event) return { title: "Event Not Found | Skylight Village" };

  return {
    title: `${event.title} | Skylight Village Jaj`,
    description: `${event.description.substring(0, 155)}... Join us for premium mountain stargazing events at Skylight Village in Mount Lebanon.`,
    keywords: [event.title, "stargazing events", "Jaj mount lebanon", "camping events lebanon"],
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const event = await db.event.findUnique({
    where: { id },
    include: { reservations: true },
  });

  if (!event) {
    return notFound();
  }

  // Calculate capacity
  const reservedTickets = event.reservations.reduce((sum, r) => sum + r.ticketCount, 0);
  const remainingCapacity = Math.max(0, event.capacity - reservedTickets);

  // JSON-LD Schema markup for Event SEO
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.date.toISOString(),
    "location": {
      "@type": "Place",
      "name": "Skylight Village",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Jaj",
        "addressRegion": "Mount Lebanon",
        "addressCountry": "LB",
      },
    },
    "offers": {
      "@type": "Offer",
      "price": event.price,
      "priceCurrency": "USD",
      "availability": remainingCapacity > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
  };

  return (
    <>
      {/* Inject Event JSON-LD SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      <Navbar />

      {/* Header / Hero */}
      <section className="bg-skylight-green text-[#fafbfa] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-skylight-dark via-skylight-green to-[#050a05] opacity-80" />
        
        <div className="container mx-auto max-w-4xl relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-skylight-gold/80 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Events</span>
          </div>

          <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
            Special Expedition & Gathering
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold mt-2 tracking-tight leading-tight">
            {event.title}
          </h1>
          <div className="w-12 h-1 bg-skylight-gold mt-4 mb-6" />
        </div>
      </section>

      {/* Main Details and Booking Block */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Details column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-skylight-green/10 shadow-sm p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-display font-extrabold text-skylight-green">
                Event Overview
              </h2>
              <p className="text-xs text-gray-600 font-light leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
                <div className="flex gap-2.5 items-center">
                  <Calendar className="w-5 h-5 text-skylight-gold flex-shrink-0" />
                  <div>
                    <span className="block text-[8px] font-bold text-gray-400 uppercase">Date & Time</span>
                    <span className="text-[10px] font-bold text-skylight-green">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 items-center">
                  <MapPin className="w-5 h-5 text-skylight-gold flex-shrink-0" />
                  <div>
                    <span className="block text-[8px] font-bold text-gray-400 uppercase">Location</span>
                    <span className="text-[10px] font-bold text-skylight-green">Jaj, Lebanon</span>
                  </div>
                </div>

                <div className="flex gap-2.5 items-center">
                  <DollarSign className="w-5 h-5 text-skylight-gold flex-shrink-0" />
                  <div>
                    <span className="block text-[8px] font-bold text-gray-400 uppercase">Price per Ticket</span>
                    <span className="text-[10px] font-bold text-skylight-green">
                      {event.price > 0 ? `$${event.price.toFixed(0)}` : "Free Event"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 items-center">
                  <Users className="w-5 h-5 text-skylight-gold flex-shrink-0" />
                  <div>
                    <span className="block text-[8px] font-bold text-gray-400 uppercase">Remaining Spots</span>
                    <span className={`text-[10px] font-bold ${remainingCapacity > 0 ? "text-skylight-green" : "text-red-500"}`}>
                      {remainingCapacity > 0 ? `${remainingCapacity} / ${event.capacity}` : "Sold Out!"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wilderness values teaser */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-skylight-green/10 shadow-sm space-y-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-skylight-green">
                  <Award className="w-4 h-4 text-skylight-gold" />
                  Professional Astronomers
                </span>
                <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                  For celestial events, we feature expert astronomers with heavy-duty refractors to guide guests across nebulae, constellations, and the Milky Way core.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-skylight-green/10 shadow-sm space-y-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-skylight-green">
                  <ShieldCheck className="w-4 h-4 text-skylight-gold" />
                  Hygienic Mountain Bounds
                </span>
                <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                  All reservations grant access to the fireplace cabin, clean toilet blocks, fresh hot water, and dedicated safety patrol around the campfiregrounds.
                </p>
              </div>
            </div>
          </div>

          {/* Booking form column */}
          <div className="lg:col-span-1">
            <EventBookingForm
              eventId={event.id}
              ticketPrice={event.price}
              remainingCapacity={remainingCapacity}
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
