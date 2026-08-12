import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import GoogleReviewsBanner from "@/components/GoogleReviewsBanner";
import TestimonialSlider from "@/components/TestimonialSlider";
import AccommodationsSlider from "@/components/AccommodationsSlider";
import LocalAttractionsList from "@/components/LocalAttractionsList";
import db from "@/lib/db";
import {
  Compass,
  Flame,
  Moon,
  Sparkles,
  Utensils,
  MapPin,
  Calendar,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Trees,
  Coffee,
  Ticket
} from "lucide-react";

export const revalidate = 0; // Disable static rendering cache for live data

export default async function HomePage() {
  const accommodations = await db.accommodation.findMany({
    include: { addons: true, images: true },
  });

  const events = await db.event.findMany({
    take: 2,
    orderBy: { date: "asc" },
  });

  const attractions = await db.localAttraction.findMany();

  return (
    <div className="bg-[#FAF8F5] text-slate-800 font-sans selection:bg-amber-500 selection:text-white">
      <Navbar />

      {/* =========================================================================
          HERO SECTION - High Altitude Stargazing Atmosphere
         ========================================================================= */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-[#071308] text-white py-24 px-4 md:px-8 overflow-hidden">
        {/* Hero Background Image with parallax overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504632348771-974e356b80af?q=80&w=2530&auto=format&fit=crop')",
          }}
        />

        {/* Ambient Dark Emerald Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071308]/75 via-[#071308]/60 to-[#071308] z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.15)_0%,transparent_70%)] z-0" />

        <div className="container mx-auto max-w-5xl relative z-10 text-center flex flex-col items-center pt-8">
          {/* Altitude Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-8 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>1,200m Altitude &bull; Jaj, Mount Lebanon</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight leading-[1.1] max-w-4xl text-white mb-6">
            Skylight Village Jaj <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Camping Ground, Cabins &amp; Picnic
            </span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 font-light max-w-2xl leading-relaxed mb-10">
            Welcome to Skylight Village in Jaj, Mount Lebanon. Pitch your tent, stay in our cozy wooden cabins, enjoy a day picnic, or gather around the fire for traditional Lebanese grill and fresh shisha at 1,200m altitude.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xl">
            <Link
              href="/stay"
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-[#071308] font-display font-extrabold text-xs tracking-widest uppercase rounded-xl shadow-lg shadow-amber-400/20 hover:-translate-y-0.5 transition-all text-center whitespace-nowrap"
            >
              Book Camping &amp; Stay
            </Link>
            <a
              href="https://menu.skylightvillagelb.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 font-display font-extrabold text-xs tracking-widest uppercase rounded-xl hover:-translate-y-0.5 transition-all text-center inline-flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>View Digital Menu</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          GLASSMORPHIC SEARCH BAR
         ========================================================================= */}
      <section className="relative z-20 px-4 -mt-10">
        <form
          action="/stay"
          method="GET"
          className="container mx-auto max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-900/10 p-6 md:p-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-emerald-900 mb-2">
                Lodging Type
              </label>
              <select
                name="type"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="ALL">All Packages &amp; Day Use</option>
                <option value="PICNIC_DAY">Day Picnic &amp; Table Setup</option>
                <option value="INDIVIDUAL_CAMP">Family &amp; Group Camping</option>
                <option value="SCOUT_ZONE">Scout &amp; Youth Group Camping</option>
                <option value="WOOD_TENT">Wooden Tent Cabins (Glamping)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-emerald-900 mb-2">
                Check In
              </label>
              <input
                type="date"
                name="startDate"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-emerald-900 mb-2">
                Guests
              </label>
              <input
                type="number"
                name="guests"
                min="1"
                defaultValue="2"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              className="w-full p-3.5 bg-[#0a1f0c] hover:bg-emerald-800 text-amber-300 rounded-xl text-xs font-display font-extrabold uppercase tracking-widest shadow-md transition-all cursor-pointer border-0"
            >
              Check Availability
            </button>
          </div>
        </form>
      </section>

      {/* =========================================================================
          EDITORIAL MOUNTAIN STORY SECTION - Fixed Image & Badge Layout
         ========================================================================= */}
      <section className="py-24 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Feature Visual */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] border border-slate-200/80">
              <img
                src="https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1600&auto=format&fit=crop"
                alt="Skylight Village Mountain Stargazing"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Clean Overlay Content within bounds */}
              <div className="absolute bottom-6 left-6 right-6 text-white flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                    Peace &amp; Elevation
                  </span>
                  <h3 className="text-xl font-display font-bold mt-0.5">Stargazing Above the Clouds</h3>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/30 text-amber-300 text-xs font-bold">
                  <Flame size={16} />
                  <span>Central Fireplace</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Editorial Copy */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-200">
              The Skylight Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#071308] leading-tight">
              Where Crisp Air Meets Authentic Mountain Hospitality
            </h2>
            <p className="text-slate-600 font-light text-base leading-relaxed">
              Located 1,200 meters above sea level in Jaj, Mount Lebanon, Skylight Village offers an escape from urban life. Surround yourself with pine-scented breezes, panoramic valley views, and rich traditional dining.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Trees size={18} />
                </div>
                <span className="text-xs font-bold text-slate-800">Near Jaj Cedar Reserve</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Coffee size={18} />
                </div>
                <span className="text-xs font-bold text-slate-800">Fireplace Lodge &amp; Shisha</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Moon size={18} />
                </div>
                <span className="text-xs font-bold text-slate-800">Zero Light Pollution</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-xs font-bold text-slate-800">24/7 Secured Grounds</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/stay"
                className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#071308] hover:text-emerald-700 transition-colors group"
              >
                <span>Explore Camping &amp; Cabins</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          LODGING SHOWCASE SLIDER - Clean Light Warm Background
         ========================================================================= */}
      <AccommodationsSlider accommodations={accommodations} />

      {/* =========================================================================
          CUISINE & DINING SPOTLIGHT - Direct External Link to Digital Menu App
         ========================================================================= */}
      <section className="py-24 px-4 md:px-8 bg-gradient-to-b from-[#FAF8F5] to-emerald-50/40">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Text & Features */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-widest">
              <Utensils size={14} className="text-amber-600" />
              Authentic Lebanese Mezza &amp; Grill
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#071308] leading-tight">
              A Warm Culinary Haven Under the Open Sky
            </h2>
            <p className="text-slate-600 font-light text-base leading-relaxed">
              Indulge in freshly prepared Cold and Hot Mezza, charcoal-grilled Taouk and Kebabs, crisp beverages, and premium Shisha. Browse our full online digital menu to view all dishes and live options.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>Cold &amp; Hot Lebanese Mezza</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>Lebanese Charcoal Grill</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>Clay Head Shisha Service</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>Outdoor Mountain Dining</span>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="https://menu.skylightvillagelb.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-[#071308] hover:bg-emerald-900 text-amber-300 font-display font-extrabold text-xs tracking-widest uppercase rounded-xl shadow-lg transition-all inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>View Full Digital Menu</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Visual Showcase - Single Authentic Mezza Image */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] border border-slate-200/80">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop"
                alt="Lebanese Grill & Mezza"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                  Authentic Taste
                </span>
                <h3 className="text-xl font-display font-bold mt-0.5">Lebanese Mezza &amp; Charcoal Grill</h3>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          LOCAL ATTRACTIONS & ADVENTURES
         ========================================================================= */}
      <section className="py-20 px-4 md:px-8 bg-white border-t border-slate-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600">
              Discover Jaj &amp; Surrounding Heights
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#071308] mt-2">
              Local Attractions &amp; Hikes
            </h2>
            <p className="text-slate-500 font-light text-sm mt-3">
              Immerse yourself in ancient cedar groves, historical sites, and scenic mountain trails.
            </p>
          </div>

          <LocalAttractionsList attractions={attractions} />
        </div>
      </section>

      {/* =========================================================================
          TESTIMONIALS & GUEST REVIEWS
         ========================================================================= */}
      <TestimonialSlider />

      {/* =========================================================================
          UPCOMING EVENTS & EXPEDITIONS - Warm Catchy Inviting Design
         ========================================================================= */}
      <section className="bg-gradient-to-b from-amber-50/60 via-white to-amber-50/30 py-24 px-4 md:px-8 border-t border-amber-200/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-widest mb-2">
                <Ticket size={14} className="text-amber-600" />
                Gatherings &amp; Expeditions
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#071308]">
                Upcoming Events &amp; Experiences
              </h2>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-emerald-800 hover:text-emerald-950 mt-4 sm:mt-0 transition-colors"
            >
              <span>Explore All Events</span>
              <ChevronRight size={16} />
            </Link>
          </div>

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

                  <h3 className="font-display font-bold text-2xl text-[#071308] group-hover:text-emerald-900 transition-colors">
                    {e.title}
                  </h3>

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
                    className="px-6 py-3 bg-[#071308] hover:bg-emerald-900 text-amber-300 font-display font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md whitespace-nowrap"
                  >
                    View Details &amp; Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ, Google Reviews & Footer */}
      <FAQSection />
      <GoogleReviewsBanner />
      <Footer />
    </div>
  );
}
