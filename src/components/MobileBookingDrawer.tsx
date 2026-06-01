// components/MobileBookingDrawer.tsx
'use client';

import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import StayBookingForm from './StayBookingForm';

interface Addon {
    id: string;
    name: string;
    price: number;
    priceType: string;
}

interface Accommodation {
    id: string;
    name: string;
    type: string;
    pricingType: string;
    basePrice: number;
    minCapacity: number;
    maxCapacity: number;
    addons: Addon[];
}

interface Props {
    accommodation: Accommodation;
    initialStartDate?: string;
    initialGuests?: string;
}

export default function MobileBookingDrawer({
    accommodation,
    initialStartDate,
    initialGuests,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Bottom Sticky Mobile Navigation Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-6 py-4 flex items-center justify-between pb-safe-bottom">
                <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                        Reserve Stay
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-display font-extrabold text-skylight-green">
                            ${accommodation.basePrice.toFixed(0)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-light">
                            {accommodation.pricingType === "PER_PERSON_PER_DAY"
                                ? "/person/day"
                                : accommodation.pricingType === "PER_PERSON_PER_NIGHT"
                                    ? "/person/night"
                                    : "/unit/night"}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="premium-btn bg-skylight-green hover:bg-skylight-gold text-white hover:text-skylight-dark font-display font-extrabold text-[10px] tracking-widest px-6 py-3.5 transition-colors cursor-pointer border-0 shadow-md flex items-center gap-1.5"
                >
                    <Calendar className="w-3.5 h-3.5" />
                    BOOK NOW
                </button>
            </div>

            {/* Spacer to prevent page content from being clipped by the bottom sticky bar */}
            <div className="lg:hidden h-20 w-full" />

            {/* Slide-Up Bottom Sheet Drawer Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-skylight-dark/60 backdrop-blur-sm flex items-end justify-center p-0 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                >
                    <div 
                        className="bg-white w-full max-w-lg rounded-t-3xl shadow-2xl border-t border-skylight-green/10 p-6 pb-8 relative max-h-[90vh] overflow-y-auto flex flex-col justify-start animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Pull Bar Indicator */}
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />

                        {/* Close button in top-right */}
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-skylight-green w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border-0 cursor-pointer transition-colors"
                            aria-label="Close booking form"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="overflow-y-auto">
                            <StayBookingForm 
                                accommodation={accommodation}
                                initialStartDate={initialStartDate}
                                initialGuests={initialGuests}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
