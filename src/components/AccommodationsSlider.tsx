// src/components/AccommodationsSlider.tsx
"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, AlertTriangle, ArrowRight } from "lucide-react";

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
}

export default function AccommodationsSlider({ accommodations }: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollPrev = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-16 px-4 md:px-8 bg-[#F6F3ED]">
      <div className="container mx-auto max-w-6xl mb-10 text-center">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-200">
          Sanctuary Under the Stars
        </span>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#071308] mt-3">
          Mountain Lodging &amp; Camping Options
        </h2>
        <p className="text-slate-600 font-light text-sm max-w-2xl mx-auto mt-2">
          Choose from private open-air camping spots, scout group areas, and cozy wood A-frame cabins.
        </p>
      </div>

      <div className="container mx-auto max-w-6xl relative">
        {/* Navigation buttons */}
        <button
          onClick={scrollPrev}
          aria-label="Previous"
          className="absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white hover:bg-emerald-900 hover:text-white rounded-full shadow-xl border border-slate-200 flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={scrollNext}
          aria-label="Next"
          className="absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white hover:bg-emerald-900 hover:text-white rounded-full shadow-xl border border-slate-200 flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronRight size={22} />
        </button>

        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x py-4 px-2 scrollbar-hide"
        >
          {accommodations.map((acc) => (
            <div
              key={acc.id}
              className="min-w-[320px] sm:min-w-[350px] max-w-[360px] snap-start bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-300 group"
            >
              {/* Image Header */}
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={
                    acc.images && acc.images.length > 0
                      ? acc.images[0].imageUrl
                      : "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800&auto=format&fit=crop"
                  }
                  alt={acc.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#071308] text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                  {acc.type.replace("_", " ")}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-[#071308] mb-1">
                    {acc.name}
                  </h3>

                  {/* Pricing info */}
                  <div className="flex items-baseline gap-1 pt-1 mb-3">
                    <span className="text-2xl font-display font-extrabold text-emerald-800">
                      ${acc.basePrice.toFixed(0)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {acc.pricingType === "PER_PERSON_PER_DAY"
                        ? "/person/day"
                        : acc.pricingType === "PER_PERSON_PER_NIGHT"
                        ? "/person/night"
                        : "/unit/night"}
                    </span>
                  </div>

                  {/* Scout warning */}
                  {acc.type === "SCOUT_ZONE" && (
                    <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200/70 p-2.5 rounded-xl text-amber-800 text-[10px] font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Minimum capacity: {acc.minCapacity} members</span>
                    </div>
                  )}

                  {/* Addon details */}
                  {acc.addons.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1.5">
                        Optional Addons:
                      </span>
                      <ul className="space-y-1">
                        {acc.addons.map((ad) => (
                          <li
                            key={ad.id}
                            className="text-[10px] text-slate-600 flex items-center justify-between font-medium"
                          >
                            <span>&bull; {ad.name}</span>
                            <span className="font-bold text-slate-800">
                              ${ad.price}
                              {ad.priceType === "PER_NIGHT" ? "/night" : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={`/stay/${acc.slug}`}
                    className="w-full py-3 bg-[#071308] hover:bg-emerald-800 text-amber-300 font-display font-extrabold text-[10px] tracking-widest uppercase rounded-xl transition-all inline-flex items-center justify-center gap-1.5 group-hover:shadow-md"
                  >
                    <span>View Details &amp; Book</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-8 text-center">
          <Link
            href="/stay"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-900 hover:bg-[#071308] text-white rounded-xl text-xs font-display font-extrabold uppercase tracking-widest transition-all shadow-md"
          >
            <span>Explore All Accommodations</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
