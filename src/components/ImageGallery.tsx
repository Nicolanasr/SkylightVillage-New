// components/ImageGallery.tsx
'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Sparkles } from 'lucide-react';

interface Image {
    id: string;
    imageUrl: string;
    order?: number;
}

interface Props {
    images: Image[];
    title?: string;
}

export default function ImageGallery({ images, title = "Gallery" }: Props) {
    const [activeIdx, setActiveIdx] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    if (!images || images.length === 0) {
        return null;
    }

    const sortedImages = [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const activeImage = sortedImages[activeIdx];

    const prev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveIdx((c) => (c - 1 + sortedImages.length) % sortedImages.length);
    };

    const next = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveIdx((c) => (c + 1) % sortedImages.length);
    };

    return (
        <div className="bg-white rounded-3xl border border-skylight-green/10 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-base text-skylight-green flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-skylight-gold animate-pulse" />
                    {title}
                </h3>
                <span className="text-[9px] font-bold text-skylight-gold bg-skylight-gold/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {sortedImages.length} Curated Views
                </span>
            </div>

            {/* Main Active Frame */}
            <div
                className="relative h-[280px] sm:h-[380px] w-full rounded-2xl overflow-hidden group cursor-pointer border border-gray-100 shadow-sm"
                onClick={() => setLightboxOpen(true)}
            >
                <img
                    src={activeImage.imageUrl}
                    alt={`${title} preview`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Shadow/Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-75 transition-opacity" />

                {/* Hover action overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white/95 text-skylight-dark font-display font-bold text-[10px] tracking-wider uppercase px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Maximize2 className="w-3.5 h-3.5 text-skylight-gold" />
                        Expand View
                    </div>
                </div>

                {/* Simple navigation arrows inside frame */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        prev();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-skylight-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md border-0 cursor-pointer"
                    aria-label="Previous image"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        next();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-skylight-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md border-0 cursor-pointer"
                    aria-label="Next image"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Caption */}
                <div className="absolute bottom-4 left-4 text-white font-light text-[10px] bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                    Viewing Image {activeIdx + 1} of {sortedImages.length}
                </div>
            </div>

            {/* Thumbnails list with elegant state indicator */}
            <div className="grid grid-cols-4 gap-3">
                {sortedImages.map((img, i) => {
                    const isActive = i === activeIdx;
                    return (
                        <button
                            type="button"
                            key={img.id}
                            onClick={() => setActiveIdx(i)}
                            className={`relative h-14 sm:h-20 w-full rounded-xl overflow-hidden focus:outline-none transition-all ${isActive
                                    ? 'ring-2 ring-skylight-gold shadow-md scale-[0.98]'
                                    : 'hover:scale-[1.02] opacity-70 hover:opacity-100 border border-transparent'
                                }`}
                        >
                            <img
                                src={img.imageUrl}
                                alt={`${title} thumbnail ${i + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {isActive && (
                                <div className="absolute inset-0 bg-skylight-gold/10" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Glassmorphic Lightbox Modal */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-[9999] p-4 transition-all duration-300 animate-fade-in"
                    onClick={() => setLightboxOpen(false)}
                >
                    {/* Top Panel */}
                    <div className="absolute top-4 left-0 right-0 px-6 flex justify-between items-center text-white z-50">
                        <div>
                            <h4 className="font-display font-extrabold text-sm tracking-wide text-skylight-gold uppercase">{title}</h4>
                            <p className="text-[10px] text-gray-400 font-light mt-0.5">Atmosphere & Accommodation Details</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setLightboxOpen(false)}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                            aria-label="Close Lightbox"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Main Large Frame */}
                    <div className="relative max-w-5xl w-full h-[60vh] sm:h-[70vh] flex items-center justify-center px-4">
                        <button
                            type="button"
                            onClick={prev}
                            className="absolute left-0 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors border border-white/10 z-50 cursor-pointer shadow-lg"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <img
                            src={sortedImages[activeIdx].imageUrl}
                            alt={`${title} full size`}
                            className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl border border-white/10 select-none"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <button
                            type="button"
                            onClick={next}
                            className="absolute right-0 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors border border-white/10 z-50 cursor-pointer shadow-lg"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Bottom Thumbnails Strip */}
                    <div className="absolute bottom-6 max-w-md w-full px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-center">
                            {sortedImages.map((img, i) => (
                                <button
                                    type="button"
                                    key={img.id}
                                    onClick={() => setActiveIdx(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-8 bg-skylight-gold' : 'w-2 bg-white/40 hover:bg-white/70'
                                        }`}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
