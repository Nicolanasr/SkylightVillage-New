import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TableReservationModal from "@/components/TableReservationModal";
import db from "@/lib/db";
import Link from "next/link";
import { Utensils, Star, HelpCircle, Compass, ShieldCheck, ShoppingCart } from "lucide-react";

export const revalidate = 0; // Fresh menu items on every load

export default async function RestaurantPage() {
    const zones = await db.restaurantZone.findMany({
        orderBy: { name: "asc" },
    });

    const categories = await db.menuCategory.findMany({
        include: {
            menuItems: {
                orderBy: { price: "asc" },
            },
        },
        orderBy: { name: "asc" },
    });

    return (
        <>
            <Navbar />

            <section className="bg-skylight-green text-[#fafbfa] pt-24 pb-32 px-4 md:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-skylight-dark via-skylight-green to-[#050a05] opacity-80" />
                <div className="container mx-auto max-w-4xl relative z-10 text-center flex flex-col items-center">
                    <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
                        Mountainside Gastronomy
                    </span>
                    <h1 className="text-3xl md:text-5xl font-display font-extrabold mt-2 tracking-tight">
                        Our Restaurant & Menu
                    </h1>
                    <div className="w-12 h-1 bg-skylight-gold mx-auto mt-4 mb-6" />
                    <p className="text-xs md:text-sm text-gray-300 font-light max-w-xl mx-auto leading-relaxed mt-2">
                        Experience traditional charcoal grills, fresh valley cold appetizers, golden local beer, premium triple-distilled arak, and fresh clay shisha head preparations.
                    </p>
                </div>
            </section>
            {/* Dynamic Seating Zones Showcase */}
            <section className="py-20 px-4 md:px-8 bg-white border-t border-gray-100">
                <div className="container mx-auto max-w-4xl space-y-12">
                    <div className="text-center max-w-xl mx-auto">
                        <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
                            Curated Ambiances
                        </span>
                        <h2 className="text-2xl md:text-3xl font-display font-extrabold text-skylight-green mt-1">
                            Explore Our Restaurant Seating Zones
                        </h2>
                        <div className="w-10 h-0.5 bg-skylight-gold mx-auto mt-3" />
                        <p className="text-xs text-gray-500 font-light mt-2 leading-relaxed">
                            Click on any dining zone below to examine specific standalone and combined tables, seating capacities, and reserve your ideal spot.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {zones.map((zone) => (
                            <Link
                                key={zone.id}
                                href={`/restaurant/zones/${zone.slug}`}
                                className="bg-[#fafbfa]/40 rounded-3xl border border-skylight-green/10 overflow-hidden hover-lift flex flex-col justify-between group shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                <div>
                                    {/* Top Zone Cover Card */}
                                    <div className="relative h-44 w-full overflow-hidden">
                                        <img
                                            src={zone.coverImage || "https://picsum.photos/seed/defaultzone/600/400"}
                                            alt={zone.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-skylight-dark/60 via-transparent to-transparent" />
                                        <span className="absolute bottom-4 left-4 text-[9px] font-bold text-skylight-gold bg-skylight-dark/70 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10">
                                            Active Zone
                                        </span>
                                    </div>

                                    <div className="p-6 space-y-2">
                                        <h3 className="font-display font-extrabold text-base text-skylight-green group-hover:text-skylight-gold transition-colors">
                                            {zone.name}
                                        </h3>
                                        <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                                            {zone.description || "Indulge in cozy mountainside dining with local delicacies and fresh grills."}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 pt-0">
                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-skylight-green uppercase tracking-wider">
                                        <span>Capacity: {zone.capacity} seats</span>
                                        <span className="flex items-center gap-1 text-skylight-gold font-bold group-hover:translate-x-1.5 transition-transform">
                                            View Details <span className="text-xs">→</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>


            {/* Culinary Menu Grid */}
            <section className="py-20 px-4 md:px-8" id="menu">
                <div className="container mx-auto max-w-4xl space-y-16">
                    <div className="text-center max-w-xl mx-auto">
                        <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
                            Charcoal & Clay
                        </span>
                        <h2 className="text-2xl md:text-3xl font-display font-extrabold text-skylight-green mt-1">
                            Taste of the Skylight Cabin
                        </h2>
                        <div className="w-10 h-0.5 bg-skylight-gold mx-auto mt-3" />
                    </div>

                    {categories.map((cat) => (
                        <div key={cat.id} className="space-y-6">
                            <h3 className="font-display font-bold text-lg text-skylight-green border-b border-skylight-green/10 pb-2 flex items-center gap-2">
                                <Utensils className="w-5 h-5 text-skylight-gold" />
                                {cat.name}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {cat.menuItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white p-5 rounded-2xl border border-skylight-green/10 shadow-sm flex flex-col justify-between hover-lift"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-2 gap-4">
                                                <h4 className="font-display font-extrabold text-sm text-skylight-green">
                                                    {item.name}
                                                </h4>
                                                <span className="font-display font-bold text-sm text-skylight-green">
                                                    ${item.price.toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>


            {/* Operating guidelines */}
            <section className="bg-skylight-green-light/40 py-20 px-4 md:px-8 border-t border-skylight-green/5">
                <div className="container mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    <div className="space-y-2">
                        <span className="flex items-center gap-1.5 justify-center md:justify-start text-xs font-bold text-skylight-green">
                            <Compass className="w-4 h-4 text-skylight-gold" />
                            Outdoor Seating
                        </span>
                        <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                            We feature beautiful outdoor terraces to appreciate Mount Lebanon breezes, as well as playground seating.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="flex items-center gap-1.5 justify-center md:justify-start text-xs font-bold text-skylight-green">
                            <ShieldCheck className="w-4 h-4 text-skylight-gold" />
                            Kitchen & Waiter Hubs
                        </span>
                        <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                            All tables feature unique QR ordering tags. Customers scan, compile items, and submit instantly to our waiters.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="flex items-center gap-1.5 justify-center md:justify-start text-xs font-bold text-skylight-green">
                            <HelpCircle className="w-4 h-4 text-skylight-gold" />
                            Allergens & Dietary
                        </span>
                        <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                            Please specify any dietary details, nut allergies, or vegan custom preferences in our digital order comments.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
