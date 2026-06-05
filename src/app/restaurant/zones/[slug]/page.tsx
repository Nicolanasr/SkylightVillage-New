import React from "react";
import db from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TableReservationModal from "@/components/TableReservationModal";
import MobileRestaurantDrawer from "@/components/MobileRestaurantDrawer";
import RestaurantZoneGallery from "@/components/RestaurantZoneGallery";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Compass, Users, CheckCircle, Flame, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 0; // Fresh database query on load

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const zone = await db.restaurantZone.findUnique({ where: { slug } });
    if (!zone) return { title: "Zone Not Found | Skylight Restaurant" };

    return {
        title: `${zone.name} Dining Zone | Skylight Village Jaj`,
        description: `${zone.description || ""}. Experience dynamic mountain dining in the fireplace or terrace zones of Skylight Village, Mount Lebanon.`,
        keywords: [zone.name, "mountain restaurant", "fireplace restaurant", "terrace dining lebanon"],
    };
}

export default async function ZoneDetailPage({ params }: PageProps) {
    const { slug } = await params;

    const zone = await db.restaurantZone.findUnique({
        where: { slug },
        include: {
            tables: {
                orderBy: { number: "asc" },
            },
            images: {
                orderBy: { order: "asc" },
            },
        },
    });

    if (!zone) {
        return notFound();
    }

    const allZones = await db.restaurantZone.findMany({
        orderBy: { name: "asc" },
    });

    // Calculate sum of table capacities
    const totalTablesCapacity = zone.tables.reduce((sum, t) => sum + t.capacity, 0);

    const isPicnic = zone.name.toLowerCase().includes("diy") || zone.name.toLowerCase().includes("picnic");
    const mobileMode: "RESTAURANT" | "OUTDOOR_DIY" = isPicnic ? "OUTDOOR_DIY" : "RESTAURANT";

    return (
        <>
            <Navbar />

            {/* Header / Hero */}
            <section
                className="bg-skylight-green text-[#fafbfa] py-24 px-4 md:px-8 relative overflow-hidden bg-cover bg-center"
                style={{
                    backgroundImage: zone.coverImage ? `url(${zone.coverImage})` : undefined
                }}
            >
                {/* Contrast-enhancing elegant background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-skylight-dark/95 via-skylight-green/75 to-skylight-dark/50" />

                <div className="container mx-auto max-w-4xl relative z-10">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-skylight-gold/80 mb-4">
                        <Link href="/" className="hover:text-white transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link href="/restaurant" className="hover:text-white transition-colors">
                            Restaurant
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-white">Zones</span>
                    </div>

                    <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase drop-shadow-sm">
                        Dine &amp; Sip Experience
                    </span>
                    <h1 className="text-3xl md:text-5xl font-display font-extrabold mt-2 tracking-tight leading-tight drop-shadow-md">
                        {zone.name}
                    </h1>
                    <div className="w-12 h-1 bg-skylight-gold mt-4 mb-6" />
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16 px-4 md:px-8">
                <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                    {/* Scenery details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl border border-skylight-green/10 shadow-sm p-6 md:p-8 space-y-6">
                            <h2 className="text-xl font-display font-extrabold text-skylight-green flex items-center gap-2">
                                <Compass className="w-6 h-6 text-skylight-gold" />
                                Zone Atmosphere
                            </h2>
                            <p className="text-xs text-gray-600 font-light leading-relaxed">
                                {zone.description || "Indulge in premium fresh charcoal grills and valley mezze served under crisp star-studded mountain skies."}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                                <div className="p-4 bg-skylight-green-light/40 border border-skylight-green/5 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <span className="block text-[8px] font-bold text-gray-400 uppercase">Zone Maximum Seating</span>
                                        <span className="text-base font-display font-extrabold text-skylight-green">{zone.capacity} Persons</span>
                                    </div>
                                    <Users className="w-6 h-6 text-skylight-gold opacity-80" />
                                </div>

                                <div className="p-4 bg-skylight-green-light/40 border border-skylight-green/5 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <span className="block text-[8px] font-bold text-gray-400 uppercase">Active Tables</span>
                                        <span className="text-base font-display font-extrabold text-skylight-green">{zone.tables.length} tables online</span>
                                    </div>
                                    <CheckCircle className="w-6 h-6 text-skylight-gold opacity-80" />
                                </div>
                            </div>
                        </div>

                        {/* Interactive Gallery */}
                        {zone.images && zone.images.length > 0 && (
                            <RestaurantZoneGallery images={zone.images} zoneName={zone.name} />
                        )}

                        {/* Tables status */}
                        <div className="bg-white rounded-3xl border border-skylight-green/10 shadow-sm p-6 md:p-8 space-y-6">
                            <h3 className="font-display font-extrabold text-base text-skylight-green">
                                Seating Infrastructure Mapped
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {zone.tables.map((table) => (
                                    <div
                                        key={table.id}
                                        className="p-4 rounded-2xl border border-gray-100 hover:border-skylight-gold transition-colors flex items-center justify-between bg-[#fafbfa]/50"
                                    >
                                        <div>
                                            <h4 className="text-xs font-bold text-skylight-green">Table #{table.number}</h4>
                                            <p className="text-[10px] text-gray-400 font-light mt-0.5">
                                                Capacity: {table.capacity} guests
                                            </p>
                                        </div>
                                        {table.mergedWithTableId ? (
                                            <span className="text-[8px] font-bold text-skylight-gold bg-skylight-green px-2 py-1 rounded">
                                                Combined table
                                            </span>
                                        ) : (
                                            <span className="text-[8px] font-bold text-skylight-green bg-skylight-green-light px-2 py-1 rounded">
                                                Standalone spot
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Table reservation action card — desktop only */}
                    <div className="lg:col-span-1 hidden lg:block lg:top-8 h-fit">
                        <div className="bg-skylight-dark/95 text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-skylight-gold/20 flex flex-col items-center text-center space-y-6">
                            <Flame className="w-10 h-10 text-skylight-gold animate-bounce" />
                            <div className="space-y-2">
                                <h3 className="font-display font-extrabold text-lg text-white">
                                    {isPicnic ? "Book Your Picnic Spot" : "Join the Cabin Gathering"}
                                </h3>
                                <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                                    {isPicnic
                                        ? "Reserve a beautiful, scenic open-air spot at Jaj. Sturdy wooden tables and chairs prepared for your arrival. Forgot something? There is a fully stocked store right in the village!"
                                        : `Reserve a table instantly in the ${zone.name} dining zone. Tables are held for 20 minutes from the selected timeslot. No fee required.`
                                    }
                                </p>
                            </div>

                            <div className="w-full pt-4 border-t border-white/10 flex justify-center">
                                <TableReservationModal
                                    zones={allZones}
                                    initialZoneId={zone.id}
                                    initialMode={mobileMode}
                                    buttonText={isPicnic ? "BOOK PICNIC SPOT" : "RESERVE DINING TABLE (FREE)"}
                                    buttonClassName="w-full flex items-center justify-center gap-2 premium-btn bg-skylight-gold text-skylight-dark hover:bg-skylight-green hover:text-white font-display font-bold text-[10px] tracking-widest py-3.5 transition-all shadow-md cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile Bottom Reservation Drawer (visible on mobile/tablet only) */}
            <MobileRestaurantDrawer
                zones={allZones}
                initialZoneId={zone.id}
                initialMode={mobileMode}
                zoneName={zone.name}
            />

            <Footer />
        </>
    );
}
