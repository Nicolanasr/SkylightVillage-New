// src/components/AccommodationsSlider.tsx
"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

// Types for the data we receive – keep it lightweight for now
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

interface Accommodation {
    id: string;
    slug: string;
    name: string;
    type: string;
    pricingType: string;
    basePrice: number;
    minCapacity?: number;
    addons: Addon[];
    images?: AccommodationImage[];
}

interface Props {
    accommodations: Accommodation[];
    heroImageSrc?: string; // optional – not used inside the slider currently
}

export default function AccommodationsSlider({ accommodations }: Props) {
    const sliderRef = useRef<HTMLDivElement>(null);

    const scrollPrev = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -sliderRef.current.offsetWidth, behavior: "smooth" });
        }
    };

    const scrollNext = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: sliderRef.current.offsetWidth, behavior: "smooth" });
        }
    };

    return (
        <section className="relative pb-20 px-4 md:px-8 bg-skylight-green-light/20">
            {/* Slider navigation buttons */}
            <button
                onClick={scrollPrev}
                aria-label="Previous"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md p-2 hover:bg-skylight-gold transition-colors"
            >
                <ChevronLeft size={20} className="text-skylight-green" />
            </button>
            <button
                onClick={scrollNext}
                aria-label="Next"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md p-2 hover:bg-skylight-gold transition-colors"
            >
                <ChevronRight size={20} className="text-skylight-green" />
            </button>

            <div
                ref={sliderRef}
                className="flex gap-6 overflow-x-auto scroll-smooth snap-x px-8 pb-8 scrollbar-hide"
            >
                {accommodations.map((acc) => (
                    <div
                        key={acc.id}
                        className="min-w-[350px] snap-start bg-white rounded-2xl border border-skylight-green/10 shadow-lg hover:shadow-xl flex flex-col justify-between overflow-hidden"
                    >
                        {/* Preview Image on top of card */}
                        <div className="relative h-48 w-full bg-skylight-dark overflow-hidden">
                            <img
                                src={acc.images && acc.images.length > 0 ? acc.images[0].imageUrl : "https://picsum.photos/seed/accom-placeholder/600/400"}
                                alt={acc.name}
                                className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        <div className="p-6">
                            {/* Category Pill */}
                            <span className="inline-block px-2.5 py-1 rounded bg-skylight-green-light text-skylight-green text-[9px] font-bold uppercase tracking-wider mb-4">
                                {acc.type.replace("_", " ")}
                            </span>
                            <h3 className="font-display font-bold text-lg text-skylight-green mb-2">
                                {acc.name}
                            </h3>
                            {/* Pricing info */}
                            <div className="flex items-baseline gap-1 pt-2">
                                <span className="text-2xl font-display font-extrabold text-skylight-green">
                                    ${acc.basePrice.toFixed(0)}
                                </span>
                                <span className="text-xs text-gray-500 font-light">
                                    {acc.pricingType === "PER_PERSON_PER_DAY"
                                        ? "/person/day"
                                        : acc.pricingType === "PER_PERSON_PER_NIGHT"
                                            ? "/person/night"
                                            : "/unit/night"}
                                </span>
                            </div>

                            {/* scout capacity warnings */}
                            {acc.type === "SCOUT_ZONE" && (
                                <div className="mt-4 flex items-center gap-1.5 bg-yellow-50 border border-yellow-100 p-2.5 rounded-lg text-yellow-700 text-[10px] font-semibold">
                                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                    <span>Scout rule: Minimum capacity {acc.minCapacity} members required.</span>
                                </div>
                            )}

                            {/* Addon details */}
                            {acc.addons.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                                        Available camping addons:
                                    </span>
                                    <ul className="space-y-1">
                                        {acc.addons.map((ad) => (
                                            <li key={ad.id} className="text-[10px] text-gray-600 flex items-center justify-between">
                                                <span>• {ad.name}</span>
                                                <span className="font-semibold">${ad.price}{ad.priceType === "PER_NIGHT" ? "/night" : ""}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-[#fafbfa] border-t border-gray-100">
                            <Link
                                href={`/stay/${acc.slug}`}
                                className="w-full inline-block text-center premium-btn bg-skylight-green text-white hover:bg-skylight-gold hover:text-skylight-dark font-display font-bold text-[10px] tracking-widest py-3 transition-all"
                            >
                                VIEW DETAILS &amp; BOOK
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* View All button */}
            <div className="mt-8 text-center">
                <Link
                    href="/stay"
                    className="inline-block bg-skylight-green text-white px-6 py-2 rounded-full font-display font-bold hover:bg-skylight-gold transition-colors"
                >
                    View All Accommodations
                </Link>
            </div>
        </section>
    );
}
