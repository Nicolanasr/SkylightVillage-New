import React from "react";
import db from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StayBookingForm from "@/components/StayBookingForm";
import MobileBookingDrawer from "@/components/MobileBookingDrawer";
import ImageGallery from "@/components/ImageGallery";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, DollarSign, Award, ShieldCheck, ChevronRight, HelpCircle, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 0; // Fresh DB items on load

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ startDate?: string; guests?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const acc = await db.accommodation.findUnique({ 
        where: { slug },
        include: { images: true }
    });
    if (!acc) return { title: "Lodging Not Found | Skylight Village Jaj" };

    const firstImg = acc.images && acc.images.length > 0
        ? acc.images[0].imageUrl
        : "https://images.unsplash.com/photo-1504632348771-974e356b80af?q=80&w=1200&auto=format&fit=crop";

    return {
        title: `${acc.name} in Jaj, Mount Lebanon | Skylight Village`,
        description: `Book ${acc.name} at Skylight Village in Jaj, Mount Lebanon (1,200m altitude). Base rate: $${acc.basePrice}. Clean spring water, hot showers, campfire spots near Jaj Cedar Reserve.`,
        keywords: [acc.name, "mountain lodging Jaj", "camping Lebanon", "Jaj wood cabins", "scout campgrounds Jbeil", "day picnic Jaj"],
        openGraph: {
            title: `${acc.name} | Skylight Village Jaj, Lebanon`,
            description: `Book your stay at ${acc.name} in Jaj, Mount Lebanon (1,200m altitude).`,
            images: [{ url: firstImg, alt: acc.name }],
        },
    };
}

interface Addon {
    id: string;
    name: string;
    price: number;
    priceType: string;
}

interface AccommodationImage {
    id: string;
    imageUrl: string;
    order: number;
}

interface AccommodationWithDetails {
    id: string;
    slug: string;
    name: string;
    type: string;
    pricingType: string;
    basePrice: number;
    minCapacity: number;
    maxCapacity: number;
    addons: Addon[];
    images: AccommodationImage[];
    description?: string | null;
    amenities?: string | null;
}

export default async function StayDetailPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    const rawAcc = await db.accommodation.findUnique({
        where: { slug },
        include: { addons: true, images: true },
    });

    if (!rawAcc) {
        return notFound();
    }

    const acc = rawAcc as unknown as AccommodationWithDetails;

    // Schema.org Product & Offer JSON-LD
    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": acc.name,
        "description": acc.description || `Book ${acc.name} at Skylight Village in Jaj, Mount Lebanon (1,200m altitude).`,
        "image": acc.images && acc.images.length > 0 ? acc.images[0].imageUrl : "https://images.unsplash.com/photo-1504632348771-974e356b80af?q=80&w=1200&auto=format&fit=crop",
        "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": acc.basePrice,
            "availability": "https://schema.org/InStock",
            "url": `https://skylightvillagelb.com/stay/${acc.slug}`
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
            <Navbar />

            {/* Hero Header */}
            <section className="bg-skylight-green text-[#fafbfa] py-20 px-4 md:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-skylight-dark via-skylight-green to-[#050a05] opacity-80" />

                <div className="container mx-auto max-w-6xl relative z-10">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-skylight-gold/80 mb-4">
                        <Link href="/" className="hover:text-white transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link href="/stay" className="hover:text-white transition-colors">
                            Stay
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-white">Lodging details</span>
                    </div>

                    <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase">
                        Nature Immersion Lodging
                    </span>
                    <h1 className="text-3xl md:text-5xl font-display font-extrabold mt-2 tracking-tight leading-tight">
                        {acc.name}
                    </h1>
                    <div className="w-12 h-1 bg-skylight-gold mt-4 mb-6" />
                </div>
            </section>

            {/* Main Details Grid */}
            <section className="py-16 px-4 md:px-8">
                <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Specifications */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl border border-skylight-green/10 shadow-sm p-6 md:p-8 space-y-6">
                            <h2 className="text-xl font-display font-extrabold text-skylight-green">
                                Lodging Overview
                            </h2>
                            <p className="text-xs text-gray-600 font-light leading-relaxed whitespace-pre-line">
                                {acc.description || "Experience dynamic premium lodging situated at 1,200m altitude in Jaj, Mount Lebanon. Our facilities feature clean private toilet modules, fresh mountain spring water taps, campfire areas, and scenic mountain views."}
                            </p>

                            {acc.amenities && (
                                <div className="pt-6 border-t border-gray-100 space-y-3">
                                    <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                        Included Additional Amenities
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {acc.amenities.split(",").map((item: string, idx: number) => {
                                            const clean = item.trim();
                                            if (!clean) return null;
                                            return (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-skylight-green/5 text-skylight-green text-[10px] font-bold rounded-lg border border-skylight-green/10"
                                                >
                                                    {clean}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
                                <div className="flex gap-2.5 items-center">
                                    <Users className="w-5 h-5 text-skylight-gold flex-shrink-0" />
                                    <div>
                                        <span className="block text-[8px] font-bold text-gray-400 uppercase">Capacity</span>
                                        <span className="text-[10px] font-bold text-skylight-green">
                                            {acc.minCapacity} - {acc.maxCapacity} Guests
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2.5 items-center">
                                    <DollarSign className="w-5 h-5 text-skylight-gold flex-shrink-0" />
                                    <div>
                                        <span className="block text-[8px] font-bold text-gray-400 uppercase">Base Rate</span>
                                        <span className="text-[10px] font-bold text-skylight-green">
                                            ${acc.basePrice.toFixed(0)}
                                            {acc.pricingType === "PER_PERSON_PER_DAY"
                                                ? "/person/day"
                                                : acc.pricingType === "PER_PERSON_PER_NIGHT"
                                                    ? "/person/night"
                                                    : "/unit/night"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2.5 items-center">
                                    <MapPin className="w-5 h-5 text-skylight-gold flex-shrink-0" />
                                    <div>
                                        <span className="block text-[8px] font-bold text-gray-400 uppercase">Altitude</span>
                                        <span className="text-[10px] font-bold text-skylight-green uppercase text-[8px]">
                                            1,200 Meters
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2.5 items-center">
                                    <Award className="w-5 h-5 text-skylight-gold flex-shrink-0" />
                                    <div>
                                        <span className="block text-[8px] font-bold text-gray-400 uppercase">Category</span>
                                        <span className="text-[10px] font-bold text-skylight-green uppercase text-[8px]">
                                            {acc.type.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Image Gallery with Lightbox */}
                        <ImageGallery images={acc.images} />

                        {/* scout constraints notice */}
                        {acc.type === "SCOUT_ZONE" && (
                            <div className="flex gap-3 bg-yellow-50 border border-yellow-100 p-5 rounded-2xl text-yellow-700 text-xs font-semibold leading-relaxed">
                                <Award className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                                <div>
                                    <span className="font-bold block mb-0.5">Scout Group Constraints Active</span>
                                    <p className="text-[11px] font-light text-yellow-600">
                                        This campground is designed strictly for larger scout troops. It requires a minimum capacity of {acc.minCapacity} people to book.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Addons List */}
                        {acc.addons.length > 0 && (
                            <div className="bg-white rounded-3xl border border-skylight-green/10 shadow-sm p-6 md:p-8 space-y-4">
                                <h3 className="font-display font-extrabold text-base text-skylight-green">
                                    Available Campsite Addons
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {acc.addons.map((addon) => (
                                        <div
                                            key={addon.id}
                                            className="p-4 rounded-xl border border-gray-100 flex items-center justify-between bg-[#fafbfa]/40"
                                        >
                                            <span className="text-xs font-semibold text-skylight-green">{addon.name}</span>
                                            <span className="text-xs font-extrabold text-skylight-gold">
                                                ${addon.price} {addon.priceType === "PER_NIGHT" ? "/ night" : "once"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Info guides */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-skylight-green/10 shadow-sm space-y-2">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-skylight-green">
                                    <ShieldCheck className="w-4 h-4 text-skylight-gold" />
                                    Premium Utilities Included
                                </span>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                                    Fresh drinking water from clean mountain springs, warm showers, modern sanitation buildings, and secure perimeter boundaries are fully included with every booking.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-skylight-green/10 shadow-sm space-y-2">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-skylight-green">
                                    <HelpCircle className="w-4 h-4 text-skylight-gold" />
                                    Need Custom Coordinator?
                                </span>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                                    For large scouts gatherings, bonfire set-ups, corporate retreats, or special campfire acoustic arrangements, please consult our coordinates support via the Contact page.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form Card (Hidden on mobile, sticky on desktop) */}
                    <div className="lg:col-span-1 hidden lg:block lg:top-8 h-fit">
                        <StayBookingForm
                            accommodation={acc}
                            initialStartDate={resolvedSearchParams.startDate}
                            initialGuests={resolvedSearchParams.guests}
                        />
                    </div>
                </div>
            </section>

            {/* Mobile Booking Drawer CTA (Visible on mobile/tablet only) */}
            <MobileBookingDrawer
                accommodation={acc}
                initialStartDate={resolvedSearchParams.startDate}
                initialGuests={resolvedSearchParams.guests}
            />

            <Footer />
        </>
    );
}
