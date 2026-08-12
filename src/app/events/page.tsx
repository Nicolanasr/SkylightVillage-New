import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import db from "@/lib/db";
import { Calendar, MapPin, Ticket, Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Stargazing Expeditions | Skylight Village Jaj, Lebanon",
  description:
    "Join Perseids stargazing nights, campfire acoustic gatherings, and scout expeditions at Skylight Village in Jaj, Mount Lebanon.",
  keywords: [
    "Jaj events",
    "stargazing events Lebanon",
    "Perseids meteor shower Lebanon",
    "camping events Jaj",
    "attractions in Jaj",
  ],
};

export const revalidate = 0; // Live events data

export default async function EventsPage() {
  const events = await db.event.findMany({
    orderBy: { date: "asc" },
  });

  return (
    <div className="bg-[#FAF8F5] text-slate-800 font-sans selection:bg-amber-500 selection:text-white">
      <Navbar />

      {/* Header Banner */}
      <section className="relative py-24 px-4 md:px-8 bg-[#071308] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15)_0%,transparent_70%)] z-0" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Gatherings &amp; Mountain Expeditions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight">
            Upcoming Events &amp; Experiences in Jaj
          </h1>
          <div className="w-12 h-1 bg-amber-400 mx-auto mt-4 mb-6" />
          <p className="text-slate-300 font-light text-sm max-w-xl mx-auto leading-relaxed">
            From Perseids meteor shower stargazing nights to campfire acoustic sessions and scout reunions in Jaj, Mount Lebanon.
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          {events.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <Ticket className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800">No Scheduled Public Events Today</h3>
              <p className="text-xs text-slate-500 font-medium mt-2 max-w-md mx-auto">
                We regularly host weekend campfire gatherings and stargazing expeditions. Contact us to propose or host your private group event!
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-block px-8 py-3.5 bg-[#071308] text-amber-300 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-900 transition-all"
              >
                Propose Private Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.map((e) => (
                <div
                  key={e.id}
                  className="bg-white rounded-3xl border border-amber-200/80 p-8 shadow-xl hover:shadow-2xl hover:border-amber-400 transition-all flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        {new Date(e.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="bg-[#071308] text-amber-300 text-[10px] font-extrabold px-3.5 py-1 rounded-full shadow-sm">
                        {e.price > 0 ? `Ticket: $${e.price.toFixed(0)}` : "Free Entry"}
                      </span>
                    </div>

                    <h2 className="font-display font-bold text-2xl text-[#071308] group-hover:text-emerald-900 transition-colors">
                      {e.title}
                    </h2>

                    <p className="text-xs text-slate-600 font-light leading-relaxed">
                      {e.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span>Jaj Campfire Grounds</span>
                    </div>
                    <Link
                      href={`/events/${e.id}`}
                      className="px-6 py-3 bg-[#071308] hover:bg-emerald-900 text-amber-300 font-display font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md inline-flex items-center gap-1.5"
                    >
                      <span>View Details &amp; Reserve</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
