import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
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
} from "lucide-react";

export const revalidate = 0; // Disable static rendering cache to get live DB bookings

export default async function HomePage() {
    // Fetch dynamic data from SQLite
    const accommodations = await db.accommodation.findMany({
        include: { addons: true, images: true },
    });

    const events = await db.event.findMany({
        take: 3,
        orderBy: { date: "asc" },
    });

    const zones = await db.restaurantZone.findMany({
        include: { tables: true },
    });

    const attractions = await db.localAttraction.findMany();

    // Slider logic moved to client component

    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center bg-[#0d1c0e] text-white py-20 px-4 md:px-8 overflow-hidden">
                {/* Background Image using picsum.photos */}
                <div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    // style={{ backgroundImage: "url('/images/skylight-panorama.png')" }}
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504632348771-974e356b80af?q=80&w=2530&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}

                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,28,14,0.6)_0%,#050a05_100%)] z-0" />

                {/* Ambient Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] z-0" />

                <div className="container mx-auto max-w-5xl relative z-10 text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-skylight-green/60 border border-skylight-gold/30 text-skylight-gold text-[10px] font-semibold uppercase tracking-widest mb-6 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5" />
                        1,200m Altitude • Jaj, Mount Lebanon
                    </div>

                    <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight leading-tight max-w-4xl text-[#fafbfa] mb-6">
                        Take Memories, <br className="hidden md:inline" />
                        <span className="text-skylight-gold">Leave Only Footprints.</span>
                    </h1>

                    <p className="text-sm md:text-lg text-gray-300 font-light max-w-2xl leading-relaxed mb-10">
                        Escape the city heat to Mount Lebanon's premier stargazing camp. Unwind in unique octagonal wood bungalows, pitch a tent beneath the stars, and dine around our massive central fireplace.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
                        <Link
                            href="/stay"
                            className="premium-btn min-w-[240px] bg-skylight-gold text-skylight-dark hover:bg-white hover:text-skylight-green text-center font-display font-extrabold text-xs tracking-widest px-8 py-4 hover:-translate-y-0.5 transition-all"
                        >
                            BOOK CAMPING &amp; STAY
                        </Link>
                        <Link
                            href="/restaurant"
                            className="premium-btn min-w-[240px] border-2 border-white/80 text-white hover:bg-white hover:text-skylight-dark text-center font-display font-extrabold text-xs tracking-widest px-8 py-4 hover:-translate-y-0.5 transition-all"
                        >
                            RESTAURANT BOOKINGS
                        </Link>
                    </div>
                </div>
            </section>


            <section className="relative z-20 px-4 -mt-8">
                <form
                    action="/stay"
                    method="GET"
                    className="container mx-auto max-w-4xl bg-white rounded-2xl shadow-2xl border border-skylight-green/10 p-6 md:p-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                                Stay Type
                            </label>
                            <select
                                name="type"
                                className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                            >
                                <option value="ALL">All Lodging Options</option>
                                <option value="INDIVIDUAL_CAMP">Normal Campground Spot</option>
                                <option value="SCOUT_ZONE">Scout Camp</option>
                                <option value="WOOD_TENT">Wood Tents (1-4 Persons)</option>
                                <option value="BUNGALOW">Bungalows (Coming Soon)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                                Check In
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                defaultValue="2026-06-15"
                                className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
                                Guests Count
                            </label>
                            <input
                                type="number"
                                name="guests"
                                min="1"
                                defaultValue="2"
                                className="w-full p-3 rounded-lg bg-[#fafbfa] border border-gray-200 text-xs font-semibold text-skylight-green focus:outline-none focus:border-skylight-green"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full p-3.5 bg-skylight-green hover:bg-skylight-dark text-white rounded-lg text-xs font-display font-bold uppercase tracking-widest text-center shadow-lg transition-colors cursor-pointer border-0"
                        >
                            Check Availability
                        </button>
                    </div>
                </form>
            </section>

            {/* Main Showcase / Offerings Header */}
            <section className="py-12 text-center px-4 md:px-8 border-t border-gray-100">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-display font-extrabold text-skylight-green mb-4">
                        Mountain Lodging &amp; Camping Mapped for Everyone
                    </h2>
                    <p className="text-sm md:text-base text-gray-500 font-light leading-relaxed">
                        Discover Mount Lebanon's premier stargazing sanctuary. Choose from scout zone fields, private camping spots, A-frame wood tents, and luxury coming-soon bungalows.
                    </p>
                </div>
            </section>
            <AccommodationsSlider accommodations={accommodations} />


            {/* Experience Overview Section */}
            <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-skylight-green-light to-skylight-gold/10">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl md:text-4xl font-display font-extrabold text-skylight-green mb-6 text-center">
                        Experience Skylight Village
                    </h2>
                    <p className="text-lg text-gray-600 font-light mb-8 text-center">
                        Discover unforgettable adventures, serene nature, and premium amenities that make Skylight Village the ultimate mountain getaway.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl shadow-lg border border-skylight-green/10 overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                            <div className="relative h-48 w-full overflow-hidden bg-skylight-dark">
                                <img
                                    src="https://picsum.photos/seed/experience-camp/600/400"
                                    alt="Camping &amp; Stays"
                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-display font-bold text-lg text-skylight-green mb-3">Camping &amp; Stays</h3>
                                    <p className="text-sm text-gray-500 mb-6 font-light leading-relaxed">Cozy bungalows, wood tents, and open-air campsites.</p>
                                </div>
                                <Link href="/stay" className="premium-btn bg-skylight-green text-white hover:bg-skylight-gold hover:text-skylight-dark font-display font-bold text-xs tracking-widest py-3 transition-all text-center block w-full">
                                    Explore Stays
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-skylight-green/10 overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                            <div className="relative h-48 w-full overflow-hidden bg-skylight-dark">
                                <img
                                    src="https://picsum.photos/seed/experience-events/600/400"
                                    alt="Events &amp; Activities"
                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-display font-bold text-lg text-skylight-green mb-3">Events &amp; Activities</h3>
                                    <p className="text-sm text-gray-500 mb-6 font-light leading-relaxed">Star‑gazing nights, hiking tours, and community gatherings.</p>
                                </div>
                                <Link href="/events" className="premium-btn bg-skylight-green text-white hover:bg-skylight-gold hover:text-skylight-dark font-display font-bold text-xs tracking-widest py-3 transition-all text-center block w-full">
                                    View Events
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg border border-skylight-green/10 overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                            <div className="relative h-48 w-full overflow-hidden bg-skylight-dark">
                                <img
                                    src="https://picsum.photos/seed/experience-dining/600/400"
                                    alt="Dining &amp; Zones"
                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-display font-bold text-lg text-skylight-green mb-3">Dining &amp; Zones</h3>
                                    <p className="text-sm text-gray-500 mb-6 font-light leading-relaxed">Authentic mountain cuisine and scenic dining zones.</p>
                                </div>
                                <Link href="/restaurant" className="premium-btn bg-skylight-green text-white hover:bg-skylight-gold hover:text-skylight-dark font-display font-bold text-xs tracking-widest py-3 transition-all text-center block w-full">
                                    Reserve a Table
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Local Attractions Section */}
            <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-white to-skylight-green-light/20 border-t border-gray-100">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
                            Adventure Awaits
                        </span>
                        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-skylight-green mt-2 mb-4">
                            Local Attractions
                        </h2>
                        <p className="text-sm text-gray-500 font-light leading-relaxed">
                            Explore the natural beauty and cultural gems surrounding Skylight Village in Jaj, Mount Lebanon.
                        </p>
                    </div>

                    <LocalAttractionsList attractions={attractions} />
                </div>
            </section>

            {/* Testimonials Section */}
            <TestimonialSlider />

            {/* Scenic Infrastructure Highlight */}
            <section className="bg-skylight-green-light/40 py-20 px-4 md:px-8 border-y border-skylight-green/5">
                <div className="container mx-auto max-w-5xl">

                    <span className="text-[10px] font-bold tracking-widest text-skylight-green uppercase">
                        Premium Infrastructure
                    </span>
                    <h2 className="text-3xl md:text-4xl font-display font-extrabold text-skylight-green mt-2">
                        Comfort Meets Pure Mountain Wilderness
                    </h2>
                    <p className="text-xs text-gray-500 font-light mt-3 leading-relaxed">
                        We provide essential amenities to make your mountain camping experience comfortable, hygienic, and extremely memorable.
                    </p>
                </div>

                <div className="mt-8 container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl border border-skylight-green/10 shadow-sm flex flex-col items-center text-center">
                        <div className="octagon-clip bg-skylight-green p-4 text-skylight-gold mb-6">
                            <Flame className="w-6 h-6" />
                        </div>
                        <h3 className="font-display font-bold text-lg text-skylight-green mb-3">
                            Massive Cabin Fireplace
                        </h3>
                        <p className="text-xs text-gray-500 font-light leading-relaxed">
                            Gather around the fireside inside our mountain lodge. Sip hot tea, tell campfire stories, and trade acoustic sets with scouts.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-skylight-green/10 shadow-sm flex flex-col items-center text-center">
                        <div className="octagon-clip bg-skylight-green p-4 text-skylight-gold mb-6">
                            <Moon className="w-6 h-6" />
                        </div>
                        <h3 className="font-display font-bold text-lg text-skylight-green mb-3">
                            Stargazing Sanctuary
                        </h3>
                        <p className="text-xs text-gray-500 font-light leading-relaxed">
                            Jaj features crisp, unpolluted atmosphere. Perfect for amateur astronomers and romantic stargazers viewing meteors.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-skylight-green/10 shadow-sm flex flex-col items-center text-center">
                        <div className="octagon-clip bg-skylight-green p-4 text-skylight-gold mb-6">
                            <Compass className="w-6 h-6" />
                        </div>
                        <h3 className="font-display font-bold text-lg text-skylight-green mb-3">
                            Hiking &amp; Extreme Sports
                        </h3>
                        <p className="text-xs text-gray-500 font-light leading-relaxed">
                            Direct access to Mount Lebanon hiking trails. Coming soon: extreme zip lines, monkey bars, and rope challenges!
                        </p>
                    </div>
                </div>
            </section >

            {/* Restaurant Dining Spotlight */}
            < section className="py-20 px-4 md:px-8" >
                <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-skylight-green-light border border-skylight-green/10 text-skylight-green text-[9px] font-bold uppercase tracking-widest">
                            <Utensils className="w-3.5 h-3.5 text-skylight-gold" />
                            Mountain Dine &amp; Fireplace
                        </span>
                        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-skylight-green leading-tight">
                            A Warm Culinary Haven Under the Stars
                        </h2>
                        <p className="text-xs text-gray-500 font-light leading-relaxed">
                            Our rustic restaurant serves authentic charcoal grills, freshly tossed mezze, ice-cold Golden Almza beers, and premium traditional double-apple shisha. Reserve a dining table in your preferred zone: near the playground for family supervision, or on the valley-view terrace.
                        </p>

                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                            {zones.map((z) => (
                                <div key={z.id} className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-skylight-gold flex-shrink-0" />
                                    <span className="text-xs font-semibold text-skylight-green">{z.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 flex gap-4">
                            <Link
                                href="/restaurant"
                                className="premium-btn bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark font-display font-bold text-[10px] tracking-widest px-8 py-3.5 transition-all"
                            >
                                RESERVE DINING TABLE
                            </Link>
                        </div>
                    </div>

                    <div className="glassmorphic p-8 rounded-3xl border border-skylight-green/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-skylight-gold/10 rounded-full blur-2xl" />
                        <h3 className="font-display font-extrabold text-xl text-skylight-green border-b border-gray-100 pb-3 mb-4">
                            Our Active Zones &amp; Tables
                        </h3>
                        <div className="space-y-4">
                            {zones.map((z) => (
                                <Link
                                    key={z.id}
                                    href={`/restaurant/zones/${z.id}`}
                                    className="flex items-center justify-between bg-skylight-green-light/20 p-3.5 rounded-xl border border-skylight-green/5 hover:border-skylight-gold/50 transition-all hover:bg-skylight-green-light/40 group"
                                >
                                    <div>
                                        <h4 className="text-xs font-bold text-skylight-green group-hover:text-skylight-gold transition-colors">
                                            {z.name}
                                        </h4>
                                        <p className="text-[10px] text-gray-500 font-light mt-0.5">
                                            {z.description}
                                        </p>
                                    </div>
                                    <span className="bg-skylight-green text-white text-[9px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap">
                                        View Details
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section >

            {/* Stargazing & Community Events Calendar */}
            < section className="bg-[#0f2010] text-[#fafbfa] py-20 px-4 md:px-8" >
                <div className="container mx-auto max-w-5xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
                        <div>
                            <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
                                Gatherings &amp; Expeditions
                            </span>
                            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white mt-2">
                                Upcoming Events
                            </h2>
                        </div>
                        <Link
                            href="/contact"
                            className="text-xs text-skylight-gold hover:text-white font-semibold uppercase tracking-widest flex items-center gap-1.5 mt-4 md:mt-0"
                        >
                            Propose an Event <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {events.map((e) => (
                            <div
                                key={e.id}
                                className="bg-skylight-dark/60 rounded-3xl border border-skylight-gold/10 p-8 shadow-xl flex flex-col justify-between space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-xs text-skylight-gold font-bold">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(e.date).toLocaleDateString("en-US", {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <span className="bg-skylight-green text-[#fafbfa] text-[9px] font-extrabold px-3 py-1 rounded-full border border-skylight-gold/30">
                                            {e.price > 0 ? `Ticket: $${e.price.toFixed(0)}` : "Free Entry"}
                                        </span>
                                    </div>
                                    <h3 className="font-display font-bold text-xl text-white">
                                        {e.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-light leading-relaxed">
                                        {e.description}
                                    </p>
                                </div>

                                <div className="border-t border-skylight-green/30 pt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <MapPin className="w-3.5 h-3.5 text-skylight-gold" />
                                        <span>Jaj Campfire Grounds</span>
                                    </div>
                                    <Link
                                        href={`/events/${e.id}`}
                                        className="premium-btn bg-skylight-gold text-skylight-dark hover:bg-white hover:text-skylight-green font-display font-bold text-[9px] tracking-widest px-6 py-2.5 transition-all"
                                    >
                                        VIEW DETAILS &amp; BOOK
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            <FAQSection />
            <Footer />
        </>
    );
}
