// src/components/LocalAttractionsList.tsx
'use client';

import React, { useState } from "react";
import { MapPin, X, Compass, Clock, ExternalLink } from "lucide-react";

interface LocalAttraction {
    id: string;
    name: string;
    category: string;
    description: string;
    imageUrl: string;
    location: string;
    distance: string;
    details: string;
    externalUrl: string;
}

interface Props {
    attractions: LocalAttraction[];
}

export default function LocalAttractionsList({ attractions }: Props) {
    const [selected, setSelected] = useState<LocalAttraction | null>(null);
    const [showAll, setShowAll] = useState(false);

    const visibleAttractions = showAll ? attractions : attractions.slice(0, 3);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {visibleAttractions.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setSelected(item)}
                        className="bg-white rounded-2xl shadow-lg border border-skylight-green/10 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-fade-in"
                    >
                        <div className="relative h-48 w-full overflow-hidden bg-skylight-dark">
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 z-10 bg-skylight-green/90 text-skylight-gold text-[8px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {item.category}
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-display font-bold text-base text-skylight-green mb-2 group-hover:text-skylight-gold transition-colors">
                                    {item.name}
                                </h3>
                                <p className="text-xs text-gray-500 mb-6 font-light leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                            <div className="border-t border-gray-50 pt-4 flex items-center justify-between text-[10px] font-bold text-gray-400">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-skylight-gold" />
                                    {item.location}
                                </span>
                                <span className="text-skylight-green bg-skylight-green-light px-2 py-0.5 rounded-full">
                                    {item.distance}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View More / Show Less Button */}
            {attractions.length > 3 && (
                <div className="mt-12 text-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="inline-block bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark px-8 py-3.5 rounded-full font-display font-bold transition-all text-xs tracking-widest shadow-lg uppercase active:scale-95 cursor-pointer"
                    >
                        {showAll ? "Show Less Attractions" : "View More Attractions"}
                    </button>
                </div>
            )}

            {/* Premium Lightbox Modal for Attraction Details */}
            {selected && (
                <div
                    className="fixed inset-0 bg-skylight-dark/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-skylight-green/10 flex flex-col animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Cover Image */}
                        <div className="relative h-64 w-full bg-skylight-dark">
                            <img
                                src={selected.imageUrl}
                                alt={selected.name}
                                className="object-cover w-full h-full"
                            />
                            {/* Close Button */}
                            <button
                                onClick={() => setSelected(null)}
                                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2.5 backdrop-blur-sm transition-all active:scale-95"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            {/* Category Badge */}
                            <span className="absolute bottom-4 left-4 bg-skylight-green text-skylight-gold text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                                {selected.category}
                            </span>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold tracking-widest text-skylight-gold uppercase block">
                                    Local Destination Guide
                                </span>
                                <h3 className="font-display font-extrabold text-2xl text-skylight-green tracking-tight leading-tight">
                                    {selected.name}
                                </h3>
                            </div>

                            <p className="text-xs text-gray-600 font-light leading-relaxed">
                                {selected.details}
                            </p>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 text-[11px] font-semibold text-skylight-green">
                                <div className="flex items-center gap-2.5 bg-skylight-green-light/40 p-3 rounded-xl">
                                    <MapPin className="w-4 h-4 text-skylight-gold flex-shrink-0" />
                                    <div>
                                        <span className="block text-[8px] text-gray-400 font-bold uppercase">Location</span>
                                        {selected.location}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 bg-skylight-green-light/40 p-3 rounded-xl">
                                    <Clock className="w-4 h-4 text-skylight-gold flex-shrink-0" />
                                    <div>
                                        <span className="block text-[8px] text-gray-400 font-bold uppercase">Distance</span>
                                        {selected.distance}
                                    </div>
                                </div>
                            </div>

                            {/* CTA Support */}
                            <div className="flex gap-4 border-t border-gray-100 pt-5">
                                <button
                                    onClick={() => setSelected(null)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-display font-bold text-xs tracking-widest py-3.5 rounded-xl transition-all text-center uppercase cursor-pointer"
                                >
                                    Back to Guide
                                </button>
                                <a
                                    href={selected.externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 premium-btn bg-skylight-green text-white hover:bg-skylight-gold hover:text-skylight-dark font-display font-bold text-xs tracking-widest py-3.5 rounded-xl transition-all text-center block uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    View Details
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
